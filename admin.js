(() => {
  const $ = (id) => document.getElementById(id);
  const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = Geo.norm;
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  const LS_DRAFT = "adega_admin_rascunho";
  const LS_GH = "adega_admin_github";

  let gh = Object.assign({ owner: "mauriket", repo: "adega-brasil", branch: "main", token: "" }, store.get(LS_GH, {}));
  let dados = null;        // estado em edição
  let publicado = "";      // JSON do que está no site (para saber se há mudanças)
  let pendentes = {};      // imagens novas ainda não enviadas: caminho -> dataURL
  const cacheImgs = {};    // imagens já enviadas (mostra antes do site atualizar)

  // ---------- Utilidades ----------
  let toastTimer;
  function toast(msg, ms = 2200) {
    $("toast").textContent = msg;
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), ms);
  }
  const srcImg = (p) => pendentes[p] || cacheImgs[p] || p;
  const temPromo = (p) => num(p.precoPromo) > 0 && num(p.precoPromo) < num(p.preco);
  const gerarDataJs = (d) => "window.DADOS = " + JSON.stringify(d, null, 2) + ";\n";
  function parseDataJs(txt) { return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)); }
  function b64DeTexto(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function textoDeB64(b64) {
    const bin = atob(b64.replace(/\s/g, ""));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }

  // ---------- Rascunho e status ----------
  const temMudancas = () => JSON.stringify(dados) !== publicado || Object.keys(pendentes).length > 0;

  function mudou() {
    if (!store.set(LS_DRAFT, { dados, pendentes })) {
      store.set(LS_DRAFT, { dados, pendentes: {} });
    }
    atualizarStatus();
  }
  function atualizarStatus() {
    const s = $("statusTxt");
    if (temMudancas()) {
      s.textContent = "● Alterações não publicadas";
      s.className = "sujo";
      $("btnPublicar").classList.add("pulsar");
    } else {
      s.textContent = gh.token ? "✓ Tudo publicado" : "Sem chave do GitHub — veja a aba Conexão";
      s.className = gh.token ? "ok" : "";
      $("btnPublicar").classList.remove("pulsar");
    }
  }
  window.addEventListener("beforeunload", (e) => { if (temMudancas()) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- GitHub API ----------
  async function api(path, opts = {}) {
    const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}${path ? "/" + path : ""}`, {
      ...opts,
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${gh.token}`, ...(opts.headers || {}) },
    });
    if (!r.ok) {
      let msg = r.status + "";
      try { msg = (await r.json()).message || msg; } catch {}
      const err = new Error(msg); err.status = r.status; throw err;
    }
    return r.status === 204 ? null : r.json();
  }
  async function lerArquivo(path) {
    try {
      const d = await api(`contents/${path}?ref=${encodeURIComponent(gh.branch)}&t=${Date.now()}`);
      return { sha: d.sha, texto: textoDeB64(d.content) };
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }
  }
  function gravarArquivo(path, base64, mensagem, sha) {
    const body = { message: mensagem, content: base64, branch: gh.branch };
    if (sha) body.sha = sha;
    return api(`contents/${path}`, { method: "PUT", body: JSON.stringify(body) });
  }

  // ---------- Abas ----------
  $("tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]"); if (!b) return;
    abrirAba(b.dataset.tab);
  });
  function abrirAba(nome) {
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("active", x.dataset.tab === nome));
    document.querySelectorAll(".a-tab").forEach((s) => { s.hidden = s.id !== "tab-" + nome; });
    if (nome === "produtos") renderProdutos();
    if (nome === "categorias") renderCategorias();
    if (nome === "frete") renderFrete();
    if (nome === "loja") renderLoja();
    if (nome === "github") renderGithub();
  }

  // =====================================================
  // PRODUTOS
  // =====================================================
  function renderFiltro() {
    const atual = $("pFiltro").value;
    $("pFiltro").innerHTML = `<option value="">Todas as categorias</option>` +
      dados.categorias.map((c) => `<option ${c === atual ? "selected" : ""}>${esc(c)}</option>`).join("") +
      `<option value="__dest" ${atual === "__dest" ? "selected" : ""}>⭐ Só destaques</option>` +
      `<option value="__promo" ${atual === "__promo" ? "selected" : ""}>🔥 Só promoção do dia</option>` +
      `<option value="__off" ${atual === "__off" ? "selected" : ""}>👁️ Escondidos do site</option>`;
  }

  function renderProdutos() {
    renderFiltro();
    const termo = norm($("pBusca").value);
    const filtro = $("pFiltro").value;
    const lista = dados.produtos.filter((p) => {
      if (termo && !norm(p.nome).includes(termo)) return false;
      if (filtro === "__dest") return p.destaque;
      if (filtro === "__promo") return p.promoDia;
      if (filtro === "__off") return p.ativo === false;
      if (filtro) return p.categoria === filtro;
      return true;
    });
    const P = dados.produtos;
    $("pResumo").innerHTML = `
      <span><b>${P.length}</b> produtos</span>
      <span><b>${P.filter((p) => p.ativo !== false).length}</b> no site</span>
      <span>⭐ <b>${P.filter((p) => p.destaque).length}</b> destaques</span>
      <span>🔥 <b>${P.filter((p) => p.promoDia).length}</b> na promoção do dia</span>`;

    $("pLista").innerHTML = lista.length ? lista.map((p, i) => `
      <div class="a-item ${p.ativo === false ? "inativo" : ""}" style="animation-delay:${Math.min(i, 12) * 25}ms">
        <div class="a-thumb">${p.imagem ? `<img src="${esc(srcImg(p.imagem))}" alt="">` : esc(p.emoji || "🍾")}</div>
        <div class="a-info"><b>${esc(p.nome)}</b><small>${esc(p.categoria)}${p.descricao ? " · " + esc(p.descricao) : ""}</small></div>
        <div class="a-preco">${temPromo(p) ? `<s>${brl(p.preco)}</s>${brl(p.precoPromo)}` : brl(p.preco)}</div>
        <div class="a-acoes">
          <button class="a-ico ${p.destaque ? "on" : ""}" data-a="destaque" data-id="${p.id}" title="Destaque">⭐</button>
          <button class="a-ico ${p.promoDia ? "on" : ""}" data-a="promoDia" data-id="${p.id}" title="Promoção do dia">🔥</button>
          <button class="a-ico ${p.ativo !== false ? "on" : ""}" data-a="ativo" data-id="${p.id}" title="Aparece no site">👁️</button>
          <button class="a-ico plain" data-a="editar" data-id="${p.id}" title="Editar">✏️</button>
          <button class="a-ico plain del" data-a="excluir" data-id="${p.id}" title="Excluir">🗑️</button>
        </div>
      </div>`).join("") : `<p class="empty">Nenhum produto encontrado.</p>`;
  }
  $("pBusca").addEventListener("input", renderProdutos);
  $("pFiltro").addEventListener("change", renderProdutos);
  $("pNovo").onclick = () => abrirModal(null);

  $("pLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const p = dados.produtos.find((x) => x.id === Number(b.dataset.id)); if (!p) return;
    const a = b.dataset.a;
    if (a === "editar") return abrirModal(p.id);
    if (a === "excluir") {
      if (!confirm(`Excluir "${p.nome}"?`)) return;
      dados.produtos = dados.produtos.filter((x) => x !== p);
      if (p.imagem && pendentes[p.imagem]) delete pendentes[p.imagem];
      toast("Produto excluído");
    } else if (a === "ativo") {
      p.ativo = p.ativo === false;
      toast(p.ativo ? "Produto aparece no site" : "Produto escondido do site");
    } else if (a === "promoDia") {
      p.promoDia = !p.promoDia;
      if (p.promoDia && !temPromo(p)) toast("🔥 Dica: coloque um preço promocional nele (✏️)", 3500);
      else toast(p.promoDia ? "🔥 Na promoção do dia" : "Saiu da promoção do dia");
    } else if (a === "destaque") {
      p.destaque = !p.destaque;
      toast(p.destaque ? "⭐ Em destaque" : "Saiu dos destaques");
    }
    mudou(); renderProdutos();
  });

  // ---------- Modal ----------
  let editId = null, fotoNova = null, fotoRemovida = false;

  function abrirModal(id) {
    editId = id; fotoNova = null; fotoRemovida = false;
    const p = id != null ? dados.produtos.find((x) => x.id === id) : null;
    $("mTitulo").textContent = p ? "Editar produto" : "Novo produto";
    $("mCategoria").innerHTML = dados.categorias.map((c) => `<option>${esc(c)}</option>`).join("");
    $("mNome").value = p ? p.nome : "";
    $("mCategoria").value = p ? p.categoria : ($("pFiltro").value && !$("pFiltro").value.startsWith("__") ? $("pFiltro").value : dados.categorias[0]);
    $("mEmoji").value = p ? p.emoji || "" : "🍺";
    $("mPreco").value = p ? p.preco : "";
    $("mPromo").value = p && p.precoPromo ? p.precoPromo : "";
    $("mDesc").value = p ? p.descricao || "" : "";
    $("mDestaque").checked = p ? !!p.destaque : false;
    $("mPromoDia").checked = p ? !!p.promoDia : false;
    $("mAtivo").checked = p ? p.ativo !== false : true;
    $("mErro").textContent = "";
    previewFoto(p && p.imagem ? srcImg(p.imagem) : null);
    $("mOverlay").hidden = false;
    $("mProduto").hidden = false;
    setTimeout(() => $("mNome").focus(), 50);
  }
  function fecharModal() { $("mOverlay").hidden = true; $("mProduto").hidden = true; $("mFoto").value = ""; }
  $("mFechar").onclick = fecharModal;
  $("mCancelar").onclick = fecharModal;
  $("mOverlay").onclick = fecharModal;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("mProduto").hidden) fecharModal(); });
  $("mEmoji").addEventListener("input", () => { if (!fotoNova && ($("mFotoPrev").querySelector("img") === null)) previewFoto(null); });

  function previewFoto(src) {
    $("mFotoPrev").innerHTML = src ? `<img src="${esc(src)}" alt="">` : esc($("mEmoji").value || "🍾");
    $("mFotoRemover").hidden = !src;
  }

  function reduzirImagem(file, max = 800) {
    return new Promise((res, rej) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#141414";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("imagem inválida")); };
      img.src = url;
    });
  }

  $("mFoto").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      fotoNova = await reduzirImagem(f);
      fotoRemovida = false;
      previewFoto(fotoNova);
    } catch { toast("Não consegui abrir essa imagem. Tente outra (JPG ou PNG)."); }
  });
  $("mFotoRemover").onclick = () => { fotoNova = null; fotoRemovida = true; $("mFoto").value = ""; previewFoto(null); };

  $("mSalvar").onclick = () => {
    const nome = $("mNome").value.trim();
    const preco = num($("mPreco").value);
    const promo = num($("mPromo").value);
    if (!nome) return ($("mErro").textContent = "Digite o nome do produto.");
    if (preco <= 0) return ($("mErro").textContent = "Digite um preço maior que zero.");
    if (promo && promo >= preco) return ($("mErro").textContent = "O preço promocional precisa ser menor que o preço normal.");

    let p = editId != null ? dados.produtos.find((x) => x.id === editId) : null;
    if (!p) {
      p = { id: dados.produtos.reduce((m, x) => Math.max(m, x.id), 0) + 1, imagem: "" };
      dados.produtos.push(p);
    }
    Object.assign(p, {
      nome, preco, precoPromo: promo,
      categoria: $("mCategoria").value,
      emoji: $("mEmoji").value.trim() || "🍾",
      descricao: $("mDesc").value.trim(),
      destaque: $("mDestaque").checked,
      promoDia: $("mPromoDia").checked,
      ativo: $("mAtivo").checked,
    });
    if (fotoNova || fotoRemovida) {
      if (p.imagem && pendentes[p.imagem]) delete pendentes[p.imagem];
      p.imagem = "";
    }
    if (fotoNova) {
      p.imagem = `img/produtos/p${p.id}-${Date.now()}.jpg`;
      pendentes[p.imagem] = fotoNova;
    }
    fecharModal();
    mudou(); renderProdutos();
    toast(editId != null ? "Produto atualizado ✓" : "Produto adicionado ✓");
  };

  // =====================================================
  // CATEGORIAS
  // =====================================================
  function renderCategorias() {
    const n = (c) => dados.produtos.filter((p) => p.categoria === c).length;
    $("cLista").innerHTML = dados.categorias.map((c, i) => `
      <div class="a-cat">
        <input type="text" value="${esc(c)}" data-i="${i}">
        <span class="qtd">${n(c)} produto${n(c) === 1 ? "" : "s"}</span>
        <button class="a-ico plain" data-c="up" data-i="${i}" title="Subir" ${i === 0 ? "disabled" : ""}>⬆️</button>
        <button class="a-ico plain" data-c="down" data-i="${i}" title="Descer" ${i === dados.categorias.length - 1 ? "disabled" : ""}>⬇️</button>
        <button class="a-ico plain del" data-c="del" data-i="${i}" title="Excluir">🗑️</button>
      </div>`).join("");
  }
  $("cAdd").onclick = () => {
    const nome = $("cNova").value.trim();
    if (!nome) return;
    if (dados.categorias.some((c) => norm(c) === norm(nome))) return toast("Essa categoria já existe");
    dados.categorias.push(nome);
    $("cNova").value = "";
    mudou(); renderCategorias(); toast("Categoria adicionada ✓");
  };
  $("cNova").addEventListener("keydown", (e) => e.key === "Enter" && $("cAdd").click());
  $("cLista").addEventListener("change", (e) => {
    const inp = e.target.closest("input[data-i]"); if (!inp) return;
    const i = Number(inp.dataset.i), velho = dados.categorias[i], novo = inp.value.trim();
    if (!novo || dados.categorias.some((c, j) => j !== i && norm(c) === norm(novo))) {
      inp.value = velho; return toast("Nome inválido ou repetido");
    }
    dados.categorias[i] = novo;
    dados.produtos.forEach((p) => { if (p.categoria === velho) p.categoria = novo; });
    mudou(); toast("Categoria renomeada ✓");
  });
  $("cLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    const i = Number(b.dataset.i), cats = dados.categorias;
    if (b.dataset.c === "up" && i > 0) [cats[i - 1], cats[i]] = [cats[i], cats[i - 1]];
    if (b.dataset.c === "down" && i < cats.length - 1) [cats[i + 1], cats[i]] = [cats[i], cats[i + 1]];
    if (b.dataset.c === "del") {
      const qtd = dados.produtos.filter((p) => p.categoria === cats[i]).length;
      if (cats.length === 1) return toast("Precisa ter pelo menos uma categoria");
      const destino = cats[i === 0 ? 1 : 0];
      const msg = qtd ? `Excluir "${cats[i]}"? Os ${qtd} produtos dela vão para "${destino}".` : `Excluir "${cats[i]}"?`;
      if (!confirm(msg)) return;
      dados.produtos.forEach((p) => { if (p.categoria === cats[i]) p.categoria = destino; });
      cats.splice(i, 1);
    }
    mudou(); renderCategorias();
  });

  // =====================================================
  // FRETE
  // =====================================================
  const camposFrete = { fPrecoKm: "precoKm", fTaxaFixa: "taxaFixa", fTaxaMin: "taxaMinima", fRaio: "raioMaximoKm", fGratis: "freteGratisAcima", fPadrao: "taxaPadrao" };

  function renderFrete() {
    const F = dados.frete;
    $("fLojaCep").value = F.lojaCep || "";
    $("fLat").value = F.lojaLat ?? "";
    $("fLng").value = F.lojaLng ?? "";
    for (const [id, k] of Object.entries(camposFrete)) $(id).value = F[k] ?? 0;
    atualizarMapa(); atualizarFormula();
  }
  function atualizarMapa() {
    const { lojaLat: lat, lojaLng: lng } = dados.frete;
    $("fMapa").href = lat != null && lat !== "" ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}` : "#";
  }
  function atualizarFormula() {
    const F = dados.frete;
    const ex = [2, 5, 10].map((km) => {
      const v = Geo.valorPorKm(km, F);
      return `${km} km → <b>${v === null ? "não entrega" : brl(v)}</b>`;
    }).join(" &nbsp;·&nbsp; ");
    $("fFormula").innerHTML = `Frete = ${brl(F.taxaFixa)} + KM × ${brl(F.precoKm)} (mínimo ${brl(F.taxaMinima)})<br>Exemplos: ${ex}`;
  }
  for (const [id, k] of Object.entries(camposFrete)) {
    $(id).addEventListener("input", () => { dados.frete[k] = num($(id).value); atualizarFormula(); mudou(); });
  }
  ["fLat", "fLng"].forEach((id) => $(id).addEventListener("input", () => {
    dados.frete[id === "fLat" ? "lojaLat" : "lojaLng"] = $(id).value === "" ? null : num($(id).value);
    atualizarMapa(); mudou();
  }));
  function mascaraCep(e) {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    e.target.value = v;
  }
  $("fLojaCep").addEventListener("input", (e) => { mascaraCep(e); dados.frete.lojaCep = e.target.value; mudou(); });
  $("fTesteCep").addEventListener("input", mascaraCep);

  $("fLocalizar").onclick = async () => {
    const msg = (t, c) => { $("fLocMsg").className = "hint " + (c || ""); $("fLocMsg").innerHTML = t; };
    msg('<span class="spin"></span> Procurando…');
    const end = await Geo.buscarCep($("fLojaCep").value);
    if (!end) return msg("CEP não encontrado.", "bad");
    let pos = end.lat != null ? { lat: end.lat, lng: end.lng, precisao: "cep" } : null;
    if (!pos) pos = await Geo.geocodificar({ ...end, rua: $("fLojaRua").value.trim() || end.rua });
    if (!pos) return msg(`Achei ${esc(end.rua || end.bairro)} - ${esc(end.cidade)}, mas não a posição no mapa. Digite latitude/longitude (veja no Google Maps clicando com o botão direito na loja).`, "bad");
    dados.frete.lojaLat = Number(pos.lat.toFixed(6));
    dados.frete.lojaLng = Number(pos.lng.toFixed(6));
    dados.frete.cidade = end.cidade;
    dados.frete.uf = end.uf;
    renderFrete(); mudou();
    msg(`✓ Loja localizada: ${esc(end.rua)} ${end.bairro ? "- " + esc(end.bairro) : ""}, ${esc(end.cidade)}. Confira no mapa abaixo.`, "ok");
  };

  $("fTestar").onclick = async () => {
    const msg = (t, c) => { $("fTesteMsg").className = "hint " + (c || ""); $("fTesteMsg").innerHTML = t; };
    msg('<span class="spin"></span> Calculando…');
    const end = await Geo.buscarCep($("fTesteCep").value);
    if (!end) return msg("CEP não encontrado.", "bad");
    const r = await Geo.calcularFrete(end, dados.frete);
    const onde = `${esc(end.rua || "")} ${end.bairro ? "- " + esc(end.bairro) : ""}, ${esc(end.cidade)}`;
    if (!r.ok) return msg(r.motivo === "longe" ? `${onde}: ${r.km.toFixed(1)} km — fora do raio de entrega.` : `${onde}: não consegui localizar.`, "bad");
    msg(r.km != null
      ? `${onde}: <b>${r.km.toFixed(1).replace(".", ",")} km</b> ${r.metodo === "rota" ? "(rota de carro)" : "(estimativa)"} → frete <b>${brl(r.valor)}</b>`
      : `${onde}: endereço não localizado no mapa → taxa padrão <b>${brl(r.valor)}</b>`, "ok");
  };

  // =====================================================
  // LOJA / WHATSAPP
  // =====================================================
  function formatarWhats(n) {
    const d = String(n || "").replace(/\D/g, "").replace(/^55/, "");
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return d;
  }
  function renderLoja() {
    const L = dados.loja;
    $("lWhats").value = formatarWhats(L.whatsapp);
    $("lNome").value = L.nome;
    $("lSlogan").value = L.slogan || "";
    $("lEndereco").value = L.endereco || "";
    $("lMinimo").value = L.pedidoMinimo || 0;
    $("lPagamentos").value = (L.pagamentos || []).join(", ");
    validarWhats();
  }
  function validarWhats() {
    let d = $("lWhats").value.replace(/\D/g, "");
    if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
    const ok = d.length === 10 || d.length === 11;
    $("lWhatsMsg").className = "hint " + (ok ? "ok" : "bad");
    $("lWhatsMsg").textContent = ok ? `✓ Os pedidos vão para +55 ${formatarWhats(d)}` : "Digite o DDD + número (ex: 62 99999-9999)";
    $("lWhatsTeste").href = ok ? `https://wa.me/55${d}?text=${encodeURIComponent("Teste do painel da adega ✓")}` : "#";
    return ok ? "55" + d : null;
  }
  $("lWhats").addEventListener("input", () => { const n = validarWhats(); if (n) { dados.loja.whatsapp = n; mudou(); } });
  $("lWhats").addEventListener("blur", () => { if (validarWhats()) $("lWhats").value = formatarWhats(dados.loja.whatsapp); });
  [["lNome", "nome"], ["lSlogan", "slogan"], ["lEndereco", "endereco"]].forEach(([id, k]) =>
    $(id).addEventListener("input", () => { dados.loja[k] = $(id).value; mudou(); }));
  $("lMinimo").addEventListener("input", () => { dados.loja.pedidoMinimo = num($("lMinimo").value); mudou(); });
  $("lPagamentos").addEventListener("input", () => {
    dados.loja.pagamentos = $("lPagamentos").value.split(",").map((s) => s.trim()).filter(Boolean);
    mudou();
  });

  // =====================================================
  // CONEXÃO GITHUB
  // =====================================================
  function renderGithub() {
    $("gOwner").value = gh.owner;
    $("gRepo").value = gh.repo;
    $("gBranch").value = gh.branch;
    $("gToken").value = gh.token;
    $("gRepoNome").textContent = gh.repo;
  }
  const gMsg = (t, c) => { $("gMsg").className = "hint " + (c || ""); $("gMsg").innerHTML = t; };

  $("gSalvar").onclick = async () => {
    gh = { owner: $("gOwner").value.trim(), repo: $("gRepo").value.trim(), branch: $("gBranch").value.trim() || "main", token: $("gToken").value.trim() };
    store.set(LS_GH, gh);
    if (!gh.token) return gMsg("Cole a chave (token) primeiro.", "bad");
    gMsg('<span class="spin"></span> Testando…');
    try {
      const repo = await api("");
      if (repo.permissions && repo.permissions.push === false) return gMsg("A chave funciona, mas não tem permissão de escrita. Marque Contents: Read and write.", "bad");
      gMsg(`✓ Conectado a <b>${esc(repo.full_name)}</b>. O botão Publicar já funciona neste aparelho.`, "ok");
      atualizarStatus();
    } catch (e) {
      gMsg(e.status === 401 ? "Chave inválida ou expirada." : e.status === 404 ? "Repositório não encontrado (ou a chave não tem acesso a ele)." : "Erro: " + esc(e.message), "bad");
    }
  };
  $("gEsquecer").onclick = () => { gh.token = ""; store.set(LS_GH, gh); renderGithub(); atualizarStatus(); gMsg("Chave removida deste aparelho."); };
  $("gBaixar").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([gerarDataJs(dados)], { type: "text/javascript" }));
    a.download = "data.js";
    a.click();
  };
  $("gDescartar").onclick = () => {
    if (!confirm("Descartar todas as alterações que ainda não foram publicadas?")) return;
    store.del(LS_DRAFT);
    pendentes = {};
    location.reload();
  };

  // =====================================================
  // PUBLICAR
  // =====================================================
  $("btnPublicar").onclick = async () => {
    if (!gh.token) { abrirAba("github"); return toast("Primeiro conecte o GitHub nesta aba 👇", 3000); }
    if (!temMudancas()) return toast("Nada novo para publicar ✓");
    const btn = $("btnPublicar");
    btn.disabled = true;
    const status = (t) => { $("statusTxt").textContent = t; $("statusTxt").className = "sujo"; };
    try {
      // 1) imagens novas
      const usadas = new Set(dados.produtos.map((p) => p.imagem).filter(Boolean));
      const imgs = Object.entries(pendentes).filter(([path]) => usadas.has(path));
      for (let i = 0; i < imgs.length; i++) {
        const [path, dataUrl] = imgs[i];
        status(`Enviando imagem ${i + 1} de ${imgs.length}…`);
        await gravarArquivo(path, dataUrl.split(",")[1], `Imagem de produto (${path})`);
        cacheImgs[path] = dataUrl;
      }
      pendentes = {};

      // 2) produtos e configurações
      status("Salvando produtos…");
      const atual = await lerArquivo("data.js");
      if (atual) {
        let remoto = null;
        try { remoto = JSON.stringify(parseDataJs(atual.texto)); } catch {}
        if (remoto && remoto !== publicado && remoto !== JSON.stringify(dados) &&
            !confirm("Alguém alterou o site em outro aparelho depois que você abriu o painel. Publicar agora vai substituir essas mudanças. Continuar?")) {
          throw new Error("cancelado");
        }
      }
      await gravarArquivo("data.js", b64DeTexto(gerarDataJs(dados)), "Atualiza produtos pelo painel admin", atual && atual.sha);
      publicado = JSON.stringify(dados);
      store.del(LS_DRAFT);
      atualizarStatus();
      toast("🚀 Publicado! Em 1 a 2 minutos aparece no site.", 4500);
    } catch (e) {
      mudou();
      if (e.message !== "cancelado") {
        toast(e.status === 401 ? "Chave do GitHub inválida — veja a aba Conexão" : "Erro ao publicar: " + e.message, 5000);
      }
    } finally {
      btn.disabled = false;
    }
  };

  // =====================================================
  // INÍCIO
  // =====================================================
  async function iniciar() {
    let base = window.DADOS ? clone(window.DADOS) : null;
    if (gh.token) {
      try {
        const arq = await lerArquivo("data.js");
        if (arq) base = parseDataJs(arq.texto);
      } catch {}
    }
    if (!base) {
      $("statusTxt").textContent = "Erro ao carregar data.js";
      return;
    }
    base.categorias ||= [];
    base.produtos ||= [];
    publicado = JSON.stringify(base);
    dados = clone(base);

    const rasc = store.get(LS_DRAFT, null);
    if (rasc && rasc.dados && (JSON.stringify(rasc.dados) !== publicado || Object.keys(rasc.pendentes || {}).length)) {
      if (confirm("Você tem alterações que ainda não foram publicadas neste aparelho. Continuar de onde parou?")) {
        dados = rasc.dados;
        pendentes = rasc.pendentes || {};
      } else {
        store.del(LS_DRAFT);
      }
    }
    atualizarStatus();
    abrirAba("produtos");
  }
  iniciar();
})();
