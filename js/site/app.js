/* Produtos: direto do GitHub (instantâneo). Reserva: data.js do Pages. */
window.REPO = "mauriket/adega-brasil";
// 1º a API (instantânea, mas limitada a 60 acessos/hora por internet); 2º o arquivo bruto do GitHub
// (sem esse limite, até ~5 min de atraso); por último o data.js que veio junto com o site.
window.carregarDados = (async () => {
  const tentar = async (url, opcoes, ms) => {
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { ...opcoes, signal: ctrl.signal });
      if (!r.ok) return false;
      const txt = await r.text();
      window.DADOS = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
      return true;
    } catch (e) { return false; } finally { clearTimeout(t); }
  };
  if (await tentar("https://api.github.com/repos/" + REPO + "/contents/data.js?ref=main&t=" + Date.now(), { headers: { Accept: "application/vnd.github.raw" } }, 2500)) return;
  await tentar("https://raw.githubusercontent.com/" + REPO + "/main/data.js", {}, 2500);
})();

(async () => {
  await window.carregarDados; // produtos direto do GitHub (ou a cópia do Pages)

  const $ = (id) => document.getElementById(id);
  const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const norm = Geo.norm;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ICO = {
    star: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    tag: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
  };
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // Foto recém-publicada que ainda não chegou no Pages: busca direto no GitHub
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const caminho = (img.getAttribute("src") || "").split("?")[0];
    if (img.dataset.r || !/^img\//.test(caminho)) { img.style.visibility = "hidden"; return; }
    img.dataset.r = "1";
    img.src = `https://raw.githubusercontent.com/${window.REPO}/main/${caminho}`;
  }, true);

  // ---------- Dados (publicados, ou prévia do painel neste aparelho) ----------
  const copia = (o) => JSON.parse(JSON.stringify(o));
  let D = window.DADOS ? copia(window.DADOS) : null;
  let imgsPrevia = {};
  const rasc = store.get("adega_admin_rascunho", null);
  let verPublicado = false;
  try { verPublicado = sessionStorage.getItem("adega_ver_publicado") === "1"; } catch {}
  if (D && rasc && rasc.dados && !verPublicado &&
      JSON.stringify(Pedido.normalizar(copia(rasc.dados))) !== JSON.stringify(Pedido.normalizar(copia(D)))) {
    D = rasc.dados;
    imgsPrevia = rasc.pendentes || {};
    $("previa").hidden = false;
  }
  $("previaSair").onclick = () => { try { sessionStorage.setItem("adega_ver_publicado", "1"); } catch {} location.reload(); };

  if (!D) {
    document.querySelector("main").innerHTML = '<p class="empty">Não foi possível carregar os produtos. Atualize a página.</p>';
    return;
  }
  Pedido.normalizar(D);
  const LOJA = D.loja, FRETE = D.frete, PROMOS = D.promocoes || [];
  const img = (src) => imgsPrevia[src] || src;
  const PRODUTOS = D.produtos.filter((p) => p.ativo !== false);
  const produtoPorId = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]));

  let carrinho = store.get("adega_carrinho", {});
  for (const id in carrinho) if (!produtoPorId[id] || produtoPorId[id].esgotado) delete carrinho[id];
  let categoriaAtiva = "Todas";
  let enderecoCep = null, frete = null, calcId = 0;

  document.title = LOJA.nome;
  $("logoImg").alt = LOJA.nome;
  $("pagamento").innerHTML = LOJA.pagamentos.map((p) => `<option>${esc(p)}</option>`).join("");
  $("retiradaMsg").textContent = "Retirada em: " + LOJA.endereco;
  {
    const zap = String(LOJA.whatsappRodape || LOJA.whatsapp || "").replace(/\D/g, "");
    const fone = zap.length >= 12 ? `(${zap.slice(2, 4)}) ${zap.slice(4, -4)}-${zap.slice(-4)}` : zap;
    const insta = Pedido.arroba(LOJA.instagram);
    const icoZap = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.6zM12 0a12 12 0 0 0-10.3 18L0 24l6.2-1.6A12 12 0 1 0 12 0z"/></svg>';
    const icoInsta = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/></svg>';
    const redes = (zap ? `<a class="rede rede-zap" href="https://wa.me/${zap}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(fone)}">${icoZap}<span>${esc(fone)}</span></a>` : "") +
      (insta ? `<a class="rede rede-insta" href="https://instagram.com/${insta}" target="_blank" rel="noopener" aria-label="Instagram @${esc(insta)}">${icoInsta}<span>@${esc(insta)}</span></a>` : "");
    $("rodapeInfo").innerHTML = `<img class="rodape-logo" src="img/logo.webp" alt="${esc(LOJA.nome)}" width="136" height="96" loading="lazy">` +
      (LOJA.endereco ? `<span>${esc(LOJA.endereco)}</span>` : "") +
      (redes ? `<div class="rodape-redes">${redes}</div>` : "");
    $("rodapeTexto").textContent = LOJA.rodapeTexto || "";
    $("rodapeTexto").hidden = !String(LOJA.rodapeTexto || "").trim();
  }
  if (LOJA.aberta === false) { $("lojaFechada").hidden = false; $("lojaFechadaTxt").textContent = LOJA.avisoFechada || "Estamos fechados no momento."; }


  // ---------- Categorias ----------
  const categorias = ["Todas", ...D.categorias.filter((c) => PRODUTOS.some((p) => p.categoria === c))];
  PRODUTOS.forEach((p) => { if (!categorias.includes(p.categoria)) categorias.push(p.categoria); });
  $("categorias").innerHTML = categorias.map((c) => `<button class="chip ${c === categoriaAtiva ? "active" : ""}" data-cat="${esc(c)}" aria-pressed="${c === categoriaAtiva}">${esc(c)}</button>`).join("");
  $("categorias").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    categoriaAtiva = b.dataset.cat;
    $("categorias").querySelectorAll(".chip").forEach((c) => { c.classList.toggle("active", c === b); c.setAttribute("aria-pressed", c === b); });
    renderTudo();
  });
  let buscaT;
  $("busca").addEventListener("input", () => { clearTimeout(buscaT); buscaT = setTimeout(renderTudo, 150); });

  // ---------- Cards ----------
  const vit = (p) => Promo.vitrine(p, PROMOS);
  const qtdHTML = (p, qtd) => `<div class="qty"><button data-act="dec" data-id="${p.id}" aria-label="Diminuir quantidade de ${esc(p.nome)}">−</button><span aria-label="${qtd} no carrinho">${qtd}</span><button data-act="inc" data-id="${p.id}" aria-label="Aumentar quantidade de ${esc(p.nome)}">+</button></div>`;
  function acaoHTML(p) {
    if (p.esgotado) return `<button class="btn btn-esgotado" disabled>Esgotado</button>`;
    const qtd = carrinho[p.id] || 0;
    return qtd
      ? qtdHTML(p, qtd)
      : `<button class="btn btn-primary" data-act="inc" data-id="${p.id}" aria-label="Adicionar ${esc(p.nome)} ao carrinho">Adicionar</button>`;
  }
  function cardHTML(p, i, secao) {
    const v = vit(p);
    const selos = (p.esgotado ? `<span class="selo selo-esgotado">Esgotado</span>` : "") +
      v.selos.map((s) => `<span class="selo selo-off">${esc(s)}</span>`).join("") +
      (p.destaque && secao !== "dest" ? `<span class="selo selo-dest">${ICO.star} Destaque</span>` : "");
    const foto = p.imagem ? `<img src="${esc(img(p.imagem))}" alt="${esc(p.nome)}" loading="lazy">` : `<span>${esc(p.emoji || "🍾")}</span>`;
    return `<article class="card" data-card="${p.id}" style="--d:${Math.min(i, 10)}">
      <div class="card-img">${foto}<div class="selos">${selos}</div></div>
      <div class="card-body">
        <div class="card-name">${esc(p.nome)}</div>
        ${p.descricao ? `<div class="card-desc">${esc(p.descricao)}</div>` : ""}
        <div class="card-price">${v.preco < v.cheio ? `<s>${brl(v.cheio)}</s>` : ""}${brl(v.preco)}</div>
        <div class="acao">${acaoHTML(p)}</div>
      </div>
    </article>`;
  }
  const grade = (lista, secao) => lista.map((p, i) => cardHTML(p, i, secao)).join("");

  function produtosDaVitrine(tipo) {
    const ids = new Set();
    PROMOS.filter((pr) => pr.vitrine === tipo && Promo.estaAtiva(pr)).forEach((pr) =>
      PRODUTOS.forEach((p) => { if (Promo.aplicaA(pr, p)) ids.add(p.id); }));
    return PRODUTOS.filter((p) => ids.has(p.id));
  }

  function renderTudo() {
    const termo = norm($("busca").value);
    const filtrando = categoriaAtiva !== "Todas" || termo !== "";
    const promo = produtosDaVitrine("promoDia");
    const ofertas = produtosDaVitrine("ofertas").filter((p) => !promo.includes(p));
    const dest = PRODUTOS.filter((p) => p.destaque);
    $("secPromo").hidden = filtrando || !promo.length;
    $("secOfertas").hidden = filtrando || !ofertas.length;
    $("secDestaques").hidden = filtrando || !dest.length;
    if (!filtrando) {
      $("gridPromo").innerHTML = grade(promo, "promo");
      $("gridOfertas").innerHTML = grade(ofertas, "ofer");
      $("gridDestaques").innerHTML = grade(dest, "dest");
    }
    const lista = PRODUTOS.filter((p) => (categoriaAtiva === "Todas" || p.categoria === categoriaAtiva) && norm(`${p.nome} ${p.categoria} ${p.descricao || ""}`).includes(termo));
    const grupos = {};
    lista.forEach((p) => (grupos[p.categoria] ||= []).push(p));
    $("catalogo").innerHTML = categorias.filter((c) => grupos[c])
      .map((cat) => `<h2 class="cat-title">${esc(cat)}</h2><div class="grid">${grade(grupos[cat], "cat")}</div>`).join("");
    $("semResultados").hidden = lista.length > 0;
  }

  // Atualiza só o botão do produto (não redesenha o catálogo)
  function atualizarCards(id) {
    const p = produtoPorId[id];
    document.querySelectorAll(`[data-card="${id}"] .acao`).forEach((el) => { el.innerHTML = acaoHTML(p); });
  }

  // ---------- Contagem regressiva ----------
  function tickPromo() {
    if ($("secPromo").hidden) return;
    const agora = new Date();
    const fins = PROMOS.filter((pr) => pr.vitrine === "promoDia" && Promo.estaAtiva(pr, agora)).map((pr) => Promo.terminaEm(pr, agora)).filter(Boolean);
    let fim = fins.length ? new Date(Math.min(...fins)) : null;
    if (!fim) fim = Promo.meiaNoite(agora);
    const s = Math.max(0, Math.floor((fim - agora) / 1000)), h = Math.floor(s / 3600), pad = (n) => String(n).padStart(2, "0");
    $("contador").textContent = h >= 48 ? `${Math.floor(h / 24)} dias` : `${pad(h)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }
  setInterval(tickPromo, 1000);

  // Promoções com horário entram/saem sozinhas
  let assinatura = PROMOS.filter((pr) => Promo.estaAtiva(pr)).map((pr) => pr.id).join(",");
  setInterval(() => {
    const nova = PROMOS.filter((pr) => Promo.estaAtiva(pr)).map((pr) => pr.id).join(",");
    if (nova !== assinatura) { assinatura = nova; renderTudo(); renderCarrinho(); }
  }, 60000);

  // ---------- Produto voando até o carrinho ----------
  function voar(origem, p) {
    if (calmo || !origem) return;
    const alvo = $("openCart").getBoundingClientRect(), r = origem.getBoundingClientRect();
    const el = document.createElement(p.imagem ? "img" : "div");
    if (p.imagem) { el.src = img(p.imagem); el.className = "fly fly-img"; } else { el.className = "fly"; el.textContent = p.emoji || "🍾"; }
    el.style.left = r.left + r.width / 2 - 28 + "px";
    el.style.top = r.top + r.height / 2 - 28 + "px";
    document.body.appendChild(el);
    const dx = alvo.left + alvo.width / 2 - (r.left + r.width / 2), dy = alvo.top + alvo.height / 2 - (r.top + r.height / 2);
    el.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 70}px) scale(1.15)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0.3 },
    ], { duration: 650, easing: "cubic-bezier(.5,0,.6,1)" }).onfinish = () => {
      el.remove();
      const btn = $("openCart");
      btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
    };
  }

  // ---------- Carrinho ----------
  function alterar(id, delta) {
    const atual = carrinho[id] || 0, novo = atual + delta;
    if (novo <= 0) delete carrinho[id]; else carrinho[id] = novo;
    if (delta > 0 && atual === 0) toast("Adicionado ao carrinho");
    store.set("adega_carrinho", carrinho);
    atualizarCards(id);
    renderCarrinho();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = Number(b.dataset.id);
    if (!produtoPorId[id] || (b.dataset.act === "inc" && produtoPorId[id].esgotado)) return;
    const act = b.dataset.act, area = b.closest(".acao"), teclado = e.detail === 0;
    if (act === "inc") { const card = b.closest(".card"); if (card) voar(card.querySelector(".card-img"), produtoPorId[id]); alterar(id, 1); }
    if (act === "dec") alterar(id, -1);
    // o botão foi redesenhado: devolve o foco a quem usa teclado
    if (teclado) {
      const dentro = b.isConnected ? null : area && area.isConnected ? area : $("cartItems");
      const alvo = dentro && (dentro.querySelector(`[data-act="${act}"][data-id="${id}"]`) || dentro.querySelector(`[data-id="${id}"]`));
      if (alvo) alvo.focus({ preventScroll: true });
    }
  });

  const itens = () => Object.entries(carrinho).map(([id, q]) => { const p = produtoPorId[id]; return { ...p, qtd: q, calc: Promo.linha(p, q, PROMOS) }; });
  const soma = (f) => itens().reduce((s, i) => s + f(i), 0);
  const isRetirada = () => document.querySelector('input[name="tipoEntrega"]:checked').value === "retirada";
  const kmTxt = (km) => km.toFixed(1).replace(".", ",") + " km";

  function valorFrete() {
    if (isRetirada()) return 0;
    if (!frete) return null;
    const lim = Number(FRETE.freteGratisAcima) || 0;
    if (lim > 0 && soma((i) => i.calc.total) >= lim) return 0;
    return frete.aCombinar ? "combinar" : frete.valor;
  }
  const freteNum = (f) => (typeof f === "number" ? f : 0);

  function renderCarrinho() {
    const lista = itens(), qtd = soma((i) => i.qtd), vazio = !lista.length;
    const bd = $("cartCount");
    if (bd.textContent !== String(qtd)) { bd.textContent = qtd; bd.classList.remove("bump"); void bd.offsetWidth; bd.classList.add("bump"); }
    $("cartEmpty").hidden = !vazio;
    $("checkout").hidden = vazio;
    $("cartFoot").hidden = vazio;
    $("floatingCart").hidden = vazio;
    $("floatQtd").textContent = qtd;
    $("floatItensTxt").textContent = qtd === 1 ? "item" : "itens";

    $("cartItems").innerHTML = lista.map((i) => {
      const pr = i.calc.promo;
      return `<div class="cart-item">
        <div class="ci-emoji">${i.imagem ? `<img src="${esc(img(i.imagem))}" alt="">` : esc(i.emoji || "🍾")}</div>
        <div><div class="ci-name">${esc(i.nome)}</div>
          <div class="ci-price">${i.calc.economia > 0 ? `<s>${brl(i.calc.cheio)}</s> ` : ""}<b>${brl(i.calc.total)}</b></div>
          ${pr ? `<div class="ci-promo">${ICO.tag} ${esc(Promo.selo(pr, i.preco) || pr.nome)}</div>` : ""}</div>
        ${qtdHTML(i, i.qtd)}
      </div>`;
    }).join("");

    const sub = soma((i) => i.calc.total), eco = soma((i) => i.calc.economia), f = valorFrete();
    $("tSub").textContent = brl(sub);
    $("linhaEco").hidden = eco <= 0;
    $("tEco").textContent = "- " + brl(eco);
    $("tFrete").textContent = f === null ? "Informe o CEP" : f === "combinar" ? "A combinar" : f === 0 ? (isRetirada() ? "Retirada" : "Grátis") : brl(f);
    $("tTotal").textContent = brl(sub + freteNum(f));
    $("floatTotal").textContent = brl(sub + freteNum(f));

    if (!isRetirada() && frete) {
      const lim = Number(FRETE.freteGratisAcima) || 0;
      const onde = esc($("bairro").value.trim() || enderecoCep.cidade) + (frete.km != null ? ` · ${kmTxt(frete.km)}` : "");
      if (lim > 0 && sub >= lim) msgFrete(`${onde}: <b>frete grátis!</b>`, "ok");
      else if (frete.aCombinar) msgFrete(`${onde}: não achamos seu endereço no mapa. O frete será <b>combinado pelo WhatsApp</b>.`);
      else msgFrete(`${onde}: frete <b>${frete.valor > 0 ? brl(frete.valor) : "grátis"}</b>.${lim > 0 ? ` Faltam ${brl(lim - sub)} para frete grátis!` : ""}`, "ok");
    }
    $("erro").textContent = "";

    // Envio bloqueado já aparece antes de o cliente preencher tudo
    const minimo = Number(LOJA.pedidoMinimo || 0);
    let bloqueio = "";
    if (LOJA.aberta === false) bloqueio = "Loja fechada no momento. Você pode montar o carrinho, mas o envio fica liberado quando abrirmos.";
    else if (minimo > 0 && sub < minimo) bloqueio = `Pedido mínimo de ${brl(minimo)}. Faltam ${brl(minimo - sub)}.`;
    $("avisoEnvio").textContent = bloqueio;
    $("avisoEnvio").hidden = !bloqueio;
    $("enviar").disabled = !!bloqueio;
  }

  // ---------- Abrir / fechar carrinho ----------
  let focoAntes = null;
  const aberto = () => $("cartDrawer").classList.contains("open");
  const abrir = () => {
    if (aberto()) return;
    focoAntes = document.activeElement;
    const d = $("cartDrawer");
    d.inert = false; d.classList.add("open"); d.setAttribute("aria-hidden", "false");
    $("cartOverlay").hidden = false;
    document.documentElement.classList.add("travado");
    setTimeout(() => $("closeCart").focus({ preventScroll: true }), 50);
  };
  const fechar = () => {
    if (!aberto()) return;
    const d = $("cartDrawer");
    d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); d.inert = true;
    $("cartOverlay").hidden = true;
    document.documentElement.classList.remove("travado");
    if (focoAntes && focoAntes.focus) focoAntes.focus({ preventScroll: true });
  };
  $("openCart").onclick = abrir;
  $("floatingCart").onclick = abrir;
  $("closeCart").onclick = fechar;
  $("cartOverlay").onclick = fechar;
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());

  // ---------- Entrega e frete por KM ----------
  document.querySelectorAll('input[name="tipoEntrega"]').forEach((r) => r.addEventListener("change", () => {
    $("blocoEntrega").hidden = isRetirada();
    $("retiradaMsg").hidden = !isRetirada();
    renderCarrinho();
  }));
  $("cep").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    e.target.value = v;
    // CEP mudou depois do cálculo: o frete e o endereço antigos não valem mais
    if (enderecoCep && enderecoCep.cep.replace(/\D/g, "") !== v.replace(/\D/g, "")) {
      calcId++; frete = null; enderecoCep = null;
      $("enderecoCampos").hidden = true; msgFrete("");
      renderCarrinho();
    }
    if (v.length === 9) buscarCep();
  });
  $("cep").addEventListener("keydown", (e) => e.key === "Enter" && buscarCep());
  $("calcFrete").onclick = buscarCep;
  function msgFrete(txt, cls) { $("freteMsg").className = "hint " + (cls || ""); $("freteMsg").innerHTML = txt; }

  async function buscarCep() {
    const cep = $("cep").value.replace(/\D/g, "");
    frete = null; enderecoCep = null;
    $("enderecoCampos").hidden = true;
    if (cep.length !== 8) { msgFrete("Digite um CEP válido com 8 dígitos.", "bad"); renderCarrinho(); return; }
    msgFrete('<span class="spin"></span> Buscando CEP...');
    const id = ++calcId;
    let end = await Geo.buscarCep(cep);
    if (id !== calcId) return;
    let manual = false;
    if (!end) {
      const [ini, fim] = FRETE.faixaCep || [];
      if (ini && cep >= ini && cep <= fim) { end = { rua: "", bairro: "", cidade: FRETE.cidade, uf: FRETE.uf }; manual = true; }
      else { msgFrete("CEP não encontrado. Confira os números e tente de novo.", "bad"); renderCarrinho(); return; }
    }
    enderecoCep = { ...end, cep: $("cep").value };
    $("rua").value = end.rua || "";
    $("bairro").value = end.bairro || "";
    $("bairro").readOnly = !!end.bairro;
    $("enderecoCampos").hidden = false;
    if (manual || (!end.rua && !end.bairro)) {
      msgFrete(`CEP de ${esc(end.cidade)} aceito! Digite sua <b>rua</b> e <b>bairro</b> para calcularmos o frete.`);
      renderCarrinho(); $("rua").focus(); return;
    }
    await calcularDistancia();
    (end.rua ? $("numero") : $("rua")).focus();
  }

  async function calcularDistancia() {
    if (!enderecoCep) return;
    const id = ++calcId;
    frete = null;
    msgFrete('<span class="spin"></span> Calculando distância até você...');
    renderCarrinho();
    const end = { rua: $("rua").value.trim(), bairro: $("bairro").value.trim(), cidade: enderecoCep.cidade, uf: enderecoCep.uf };
    const r = await Geo.calcularFrete(end, FRETE);
    if (id !== calcId) return;
    if (!r.ok) {
      msgFrete(r.motivo === "longe"
        ? `Você está a ${kmTxt(r.km)} da loja — entregamos até ${FRETE.raioMaximoKm} km. Escolha <b>Retirar na loja</b>.`
        : r.motivo === "foraCidade"
        ? `Desculpe, não entregamos em ${esc(end.cidade)}. Você pode escolher <b>Retirar na loja</b>.`
        : `Não encontramos esse endereço no mapa. Confira a <b>rua</b> e o <b>bairro</b>, ou escolha <b>Retirar na loja</b>.`, "bad");
      renderCarrinho(); return;
    }
    frete = r;
    renderCarrinho();
  }
  ["rua", "bairro"].forEach((c) => $(c).addEventListener("change", () => {
    if (enderecoCep && ($("rua").value.trim() || $("bairro").value.trim())) calcularDistancia();
  }));
  const trocoVisivel = () => { $("troco").hidden = norm($("pagamento").value) !== "dinheiro"; };
  $("pagamento").addEventListener("change", trocoVisivel);
  trocoVisivel();

  // ---------- Enviar pelo WhatsApp ----------
  $("enviar").onclick = () => {
    const erro = (m) => { $("erro").textContent = m; };
    const lista = itens(), sub = soma((i) => i.calc.total), eco = soma((i) => i.calc.economia);
    const retirada = isRetirada(), nome = $("nome").value.trim();
    if (!lista.length) return erro("Seu carrinho está vazio.");
    if (sub < Number(LOJA.pedidoMinimo || 0)) return erro(`Pedido mínimo de ${brl(LOJA.pedidoMinimo)}.`);
    if (!retirada) {
      if (!enderecoCep) return erro("Informe seu CEP.");
      if (!$("rua").value.trim()) return erro("Informe a rua.");
      if (!$("numero").value.trim()) return erro("Informe o número do endereço.");
      if (!$("bairro").value.trim()) return erro("Informe o bairro.");
      if (!frete) return erro("Aguarde o cálculo do frete (ou confira o endereço).");
    }
    if (!nome) return erro("Informe seu nome.");
    if (LOJA.aberta === false) return erro("A loja está fechada no momento. Tente novamente mais tarde.");

    const fv = valorFrete(), f = freteNum(fv);
    const v = (id) => $(id).value.trim();
    let linhaRua = `${v("rua")}, ${v("numero")}`;
    if (v("complemento")) linhaRua += ` - ${v("complemento")}`;
    const msg = Pedido.montar(LOJA, {
      cliente: nome,
      telefone: v("telefone"),
      itens: lista.map((i) => ({
        qtd: i.qtd, produto: i.nome, valor: i.calc.total, unitario: i.preco,
        promo: i.calc.promo ? (Promo.selo(i.calc.promo, i.preco) || i.calc.promo.nome) : "",
      })),
      subtotal: sub, economia: eco, frete: f, freteACombinar: fv === "combinar", total: sub + f,
      distancia: !retirada && frete && frete.km != null ? kmTxt(frete.km) : "",
      retirada,
      endereco: retirada ? [] : [
        linhaRua,
        `${v("bairro")} - ${enderecoCep.cidade}/${enderecoCep.uf}`,
        `CEP: ${enderecoCep.cep}`,
        v("referencia") ? `Referência: ${v("referencia")}` : "",
      ],
      pagamento: $("pagamento").value,
      troco: !$("troco").hidden ? v("troco") : "",
      obs: v("obs"),
      codigo: Pedido.codigo({ itens: lista.map((i) => ({ id: i.id, qtd: i.qtd })), retirada, cep: retirada ? "" : enderecoCep.cep }),
    });
    $("erro").textContent = "";
    window.open(`https://wa.me/${String(LOJA.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ---------- Toast ----------
  let toastT;
  function toast(msg) {
    $("toast").textContent = msg;
    $("toast").classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => $("toast").classList.remove("show"), 1400);
  }

  renderTudo();
  renderCarrinho();
  tickPromo();
})();
