(() => {
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = Geo.norm;
  const num = (v) => {
    let s = String(v ?? "").replace(/[^\d.,-]/g, "");
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    const x = parseFloat(s);
    return isNaN(x) ? 0 : x;
  };
  const virgula = (v) => (v === null || v === undefined || v === "" ? "" : String(v).replace(".", ","));
  const precoTxt = (v) => (v === "" || v == null ? "" : Number(v).toFixed(2).replace(".", ","));
  const n = (v) => Number(v) || 0;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const plural = (q, s, p) => `${q} ${q === 1 ? s : p}`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  // ---------- Ícones (SVG de linha 24×24) ----------
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.9 17.9A10.1 10.1 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z"/>',
    store: '<path d="M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
    layers: '<path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    play: '<path d="m6 3 14 9-14 9z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  };
  const ico = (nome, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[nome] || ""}</svg>`;
  $$("[data-ico]").forEach((el) => el.insertAdjacentHTML("afterbegin", ico(el.dataset.ico, el.dataset.icoSize || 18)));

  // ---------- Estado ----------
  const LS_DRAFT = "adega_admin_rascunho";
  const LS_DRAFT_ANTIGO = "adega_admin_rascunho_antigo";
  const LS_GH = "adega_admin_github";
  let gh = Object.assign({ owner: "mauriket", repo: "adega-brasil", branch: "main", token: "" }, store.get(LS_GH, {}));
  // Links de acesso antigos (#acesso=CHAVE) não liberam mais nada: só tiram a chave da barra de endereço
  if (/^#acesso=/.test(location.hash)) history.replaceState(null, "", location.pathname + "#inicio");

  const LS_SESSAO = "adega_admin_sessao";
  const SESSAO_DIAS = 30;
  let sessao = store.get(LS_SESSAO, null), cofre = { versao: 1, contas: [] };
  let dados = null, publicado = "", pendentes = {};
  const cacheImgs = {};
  let abaAtual = "inicio";

  // Foto recém-publicada que ainda não chegou no Pages: busca direto no GitHub
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.r) return;
    const caminho = (img.getAttribute("src") || "").split("?")[0];
    if (!/^img\/produtos\//.test(caminho)) return;
    img.dataset.r = "1";
    img.src = `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${caminho}`;
  }, true);

  const srcImg = (p) => pendentes[p] || cacheImgs[p] || p;
  const thumb = (p, cls = "ic") => `<span class="${cls}">${p && p.imagem ? `<img src="${esc(srcImg(p.imagem))}" alt="">` : ico("image", 18)}</span>`;
  const gerarDataJs = (d) => "window.DADOS = " + JSON.stringify(d, null, 2) + ";\n";
  const parseDataJs = (t) => JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
  function b64DeTexto(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  const textoDeB64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  const dataBR = (s) => (s ? s.split("-").reverse().slice(0, 2).join("/") : "");
  // imagem pendente só é descartada se nenhum outro produto usa
  const liberarImagem = (path, exceto) => {
    if (path && pendentes[path] && !dados.produtos.some((x) => x !== exceto && x.imagem === path)) delete pendentes[path];
  };

  // ---------- Tema ----------
  function aplicarTema(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("adega_admin_tema", t); } catch {}
    document.querySelector('[data-acao="tema"]').innerHTML = ico(t === "dark" ? "sun" : "moon");
  }
  aplicarTema(document.documentElement.dataset.theme || "dark");

  // ---------- Avisos ----------
  let toastT;
  function toast(msg, tipo, ms = 2400) {
    const t = $("toast");
    t.textContent = msg;
    t.className = "toast show" + (tipo === "erro" ? " erro-t" : "");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), ms);
  }

  // ---------- Rascunho / status ----------
  const temMudancas = () => JSON.stringify(dados) !== publicado || Object.keys(pendentes).length > 0;
  // O rascunho guarda também a versão publicada em que ele se baseia (base),
  // para juntar com o que outro aparelho publicar depois, sem apagar nada.
  function mudou() {
    if (!store.set(LS_DRAFT, { dados, pendentes, base: publicado, em: Date.now() })) {
      store.set(LS_DRAFT, { dados, pendentes: {}, base: publicado, em: Date.now() });
      toast("Fotos muito grandes para o rascunho local. Publique logo para não perdê-las.", "erro", 5000);
    }
    atualizarStatus();
  }
  let cachePub = { s: null, o: {} };
  function contarMudancas() {
    if (!dados || !temMudancas()) return 0;
    if (cachePub.s !== publicado) { cachePub = { s: publicado, o: publicado ? JSON.parse(publicado) : {} }; }
    const o = cachePub.o, j = JSON.stringify;
    const porId = (a, b) => {
      const m = new Map((b || []).map((x) => [x.id, j(x)]));
      let k = 0;
      (a || []).forEach((x) => { if (m.get(x.id) !== j(x)) k++; m.delete(x.id); });
      return k + m.size;
    };
    let c = porId(dados.produtos, o.produtos) + porId(dados.promocoes, o.promocoes);
    for (const k of ["loja", "frete", "categorias"]) if (j(dados[k]) !== j(o[k])) c++;
    return Math.max(1, c);
  }
  function atualizarStatus() {
    const sujo = temMudancas(), qtd = contarMudancas();
    $("status").className = "status " + (sujo ? "sujo" : gh.token ? "ok" : "off");
    $("statusTxt").textContent = sujo ? "Alterações não publicadas" : gh.token ? "Tudo publicado" : "Sem conexão";
    $("pubN").hidden = !sujo;
    $("pubN").textContent = qtd;
    $("btnPublicar").title = sujo ? plural(qtd, "alteração não publicada", "alterações não publicadas") : "Nada para publicar";
    $("btnPublicar").classList.toggle("pulsar", sujo && !!gh.token);
    $("avisoConexao").hidden = !!gh.token;
    $("dkConexao").classList.toggle("alerta", !gh.token);
    if (abaAtual === "inicio" && dados) renderPublicacao();
  }
  window.addEventListener("beforeunload", (e) => { if (dados && temMudancas() && gh.token) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- GitHub ----------
  async function api(path, opts = {}) {
    const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}${path ? "/" + path : ""}`, {
      ...opts,
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${gh.token}`, ...(opts.headers || {}) },
    });
    if (!r.ok) {
      let msg = String(r.status);
      try { msg = (await r.json()).message || msg; } catch {}
      const e = new Error(msg); e.status = r.status; throw e;
    }
    return r.status === 204 ? null : r.json();
  }
  async function lerArquivo(path) {
    try {
      const d = await api(`contents/${path}?ref=${encodeURIComponent(gh.branch)}&t=${Date.now()}`);
      return { sha: d.sha, texto: textoDeB64(d.content) };
    } catch (e) { if (e.status === 404) return null; throw e; }
  }
  function gravarArquivo(path, base64, msg, sha) {
    const body = { message: msg, content: base64, branch: gh.branch };
    if (sha) body.sha = sha;
    return api(`contents/${path}`, { method: "PUT", body: JSON.stringify(body) });
  }

  // =====================================================
  // NAVEGAÇÃO
  // =====================================================
  const TITULOS = {
    inicio: "Visão geral", produtos: "Produtos", promocoes: "Promoções", categorias: "Categorias",
    frete: "Frete por km", mensagem: "Mensagem do pedido", loja: "Loja", conexao: "Acesso e backup",
  };
  const RENDER = {
    inicio: () => renderInicio(), produtos: () => renderProdutos(), promocoes: () => renderPromos(), categorias: () => renderCategorias(),
    frete: () => renderFrete(), mensagem: () => renderMensagem(), loja: () => renderLoja(), conexao: () => renderConexao(),
  };

  function moverPill() {
    const b = $$("#nav button").find((x) => x.dataset.tab === abaAtual), pill = $("navPill");
    if (!b) { pill.style.width = "0px"; return; }
    pill.style.width = b.offsetWidth + "px";
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  window.addEventListener("resize", moverPill);
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(moverPill); $$("#nav button").forEach((b) => ro.observe(b)); }

  let abaSeq = 0;
  async function abrirAba(nome) {
    if (!TITULOS[nome]) nome = "inicio";
    const seq = ++abaSeq;
    const velha = $$(".tab").find((s) => !s.hidden);
    const trocou = !velha || velha.id !== "tab-" + nome;
    abaAtual = nome;
    $$("#nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === nome));
    moverPill();
    if (trocou && velha) { await Motion.sairAba(velha); if (seq !== abaSeq) return; }
    $$(".tab").forEach((s) => { s.hidden = s.id !== "tab-" + nome; });
    if (trocou) Motion.entrarAba($("tab-" + nome));
    $("titulo").textContent = TITULOS[nome];
    renderKpis();
    RENDER[nome]();
    if (location.hash !== "#" + nome) history.replaceState(null, "", "#" + nome);
    if (trocou) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("nav").addEventListener("click", (e) => { const b = e.target.closest("button[data-tab]"); if (b) abrirAba(b.dataset.tab); });

  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { e.preventDefault(); abrirAba(go.dataset.go); return; }
    const a = e.target.closest("[data-acao]");
    if (!a || !dados) return;
    const acao = a.dataset.acao;
    if (acao === "novoProduto") abrirProduto(null);
    if (acao === "novaPromo") abrirPromo(null);
    if (acao === "conexao") abrirAba("conexao");
    if (acao === "tema") aplicarTema(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    if (acao === "buscar") { abrirAba("produtos"); setTimeout(() => $("pBusca").focus(), 80); }
  });

  // ---------- Indicadores ----------
  function renderKpis() {
    const P = dados.produtos, PR = dados.promocoes;
    const ativas = PR.filter((p) => Promo.status(p) === "ativa").length;
    const mapa = {
      inicio: [["box", "Produtos no site", P.filter((p) => p.ativo !== false).length], ["percent", "Promoções ativas", ativas], ["ban", "Esgotados", P.filter((p) => p.esgotado).length]],
      produtos: [["box", "Cadastrados", P.length], ["eye", "Visíveis", P.filter((p) => p.ativo !== false).length], ["ban", "Esgotados", P.filter((p) => p.esgotado).length]],
      promocoes: [["percent", "Ativas agora", ativas], ["calendar", "Agendadas", PR.filter((p) => ["agendada", "foraHorario"].includes(Promo.status(p))).length], ["tag", "Total", PR.length]],
      categorias: [["layers", "Categorias", dados.categorias.length], ["box", "Produtos", P.length]],
    }[abaAtual] || [];
    $("kpis").innerHTML = mapa.map(([ic, lbl, v]) => `<div class="kpi"><span class="ic">${ico(ic, 16)}</span><div><dt>${lbl}</dt><dd>${v}</dd></div></div>`).join("");
  }

  function vazio(ic, titulo, txt, acao = "") {
    return `<div class="vazio">${ico(ic, 30)}<b>${titulo}</b>${txt}${acao ? `<div style="margin-top:12px">${acao}</div>` : ""}</div>`;
  }

  // =====================================================
  // VISÃO GERAL
  // =====================================================
  function renderPublicacao() {
    const sujo = temMudancas(), nImg = Object.keys(pendentes).length;
    let html;
    if (!gh.token) {
      html = `<div class="pub-box"><div class="big"><b>Painel não conectado.</b> As alterações ficam salvas apenas neste aparelho e ainda não aparecem para os clientes.</div>
        <div class="help">Para conferir as mudanças antes de conectar, abra o site neste mesmo aparelho.</div>
        <div class="row"><button class="btn accent" data-acao="conexao">${ico("key")}Conectar</button><a class="btn ghost" href="index.html" target="_blank">${ico("eye")}Ver prévia</a></div></div>`;
    } else if (sujo) {
      html = `<div class="pub-box"><div class="big">Existem <b>alterações não publicadas</b>${nImg ? ` (${plural(nImg, "foto nova", "fotos novas")})` : ""}.</div>
        <div class="help">Clique em Publicar para enviar ao site. Os clientes veem a atualização ao recarregar a página.</div>
        <div class="row"><button class="btn accent" id="pubAgora">${ico("send")}Publicar agora</button><a class="btn ghost" href="index.html" target="_blank">${ico("eye")}Ver prévia</a></div></div>`;
    } else {
      html = `<div class="pub-box"><div class="big"><b>Tudo publicado.</b> O site está igual ao painel.</div>
        <div class="row"><a class="btn ghost" href="index.html" target="_blank">${ico("eye")}Abrir o site</a></div></div>`;
    }
    if (dados.loja.aberta === false) html += `<div class="nota-fechada">${ico("alert", 16)}A loja está marcada como <b>fechada</b>: o site não aceita pedidos.</div>`;
    $("inicioPub").innerHTML = html;
    const b = $("pubAgora"); if (b) b.onclick = publicar;
  }

  function renderInicio() {
    renderPublicacao();
    const agora = new Date();
    const lista = dados.promocoes.filter((p) => Promo.status(p, agora) === "ativa");
    $("inicioPromos").innerHTML = lista.length
      ? `<div class="mini">${lista.map((pr) => {
          const fim = Promo.terminaEm(pr, agora);
          return `<div class="mini-item" data-promo="${pr.id}"><span class="ic">${ico("percent", 18)}</span>
            <div><b>${esc(pr.nome)}</b><small>${esc(Promo.descricao(pr))} · ${esc(alvoTxt(pr))}</small></div>
            <div class="dir">${fim ? `termina em<br><span class="contagem" data-fim="${fim.getTime()}"></span>` : "sem prazo"}</div></div>`;
        }).join("")}</div>`
      : vazio("percent", "Nenhuma promoção ativa", "As promoções ativas aparecem aqui.", `<button class="btn accent sm" data-acao="novaPromo">${ico("plus")}Nova promoção</button>`);

    // Pendências que valem a atenção de quem está cadastrando
    const P = dados.produtos;
    const semFoto = P.filter((p) => p.ativo !== false && !p.imagem);
    const esgot = P.filter((p) => p.esgotado);
    const ocultos = P.filter((p) => p.ativo === false);
    const catVazias = dados.categorias.filter((c) => !P.some((p) => p.categoria === c && p.ativo !== false));
    const itens = [
      [semFoto.length, "image", plural(semFoto.length, "produto visível sem foto", "produtos visíveis sem foto"), "__semfoto"],
      [esgot.length, "ban", plural(esgot.length, "produto esgotado", "produtos esgotados"), "__esgotado"],
      [ocultos.length, "eyeOff", plural(ocultos.length, "produto oculto", "produtos ocultos"), "__off"],
      [catVazias.length, "layers", `${plural(catVazias.length, "categoria", "categorias")} sem produtos visíveis${catVazias.length ? ": " + catVazias.map(esc).join(", ") : ""}`, ""],
    ].filter((x) => x[0] > 0);
    $("inicioPend").innerHTML = P.length === 0
      ? vazio("box", "Nenhum produto cadastrado", "Comece cadastrando os produtos da loja.", `<button class="btn accent sm" data-acao="novoProduto">${ico("plus")}Novo produto</button>`)
      : itens.length
        ? `<div class="mini">${itens.map(([, ic, txt, f]) => `<div class="mini-item" ${f ? `data-filtro="${f}"` : 'data-go="categorias"'}><span class="ic">${ico(ic, 18)}</span><div><b>${txt}</b></div></div>`).join("")}</div>`
        : vazio("check", "Nenhuma pendência", "Todos os produtos visíveis têm foto e as categorias estão preenchidas.");
    tickContagens();
  }
  $("inicioPromos").addEventListener("click", (e) => { const m = e.target.closest("[data-promo]"); if (m) abrirPromo(Number(m.dataset.promo)); });
  $("inicioPend").addEventListener("click", (e) => { const m = e.target.closest("[data-filtro]"); if (m) { pFiltro = m.dataset.filtro; abrirAba("produtos"); } });

  function tickContagens() {
    const agora = Date.now();
    $$("[data-fim]").forEach((el) => {
      const s = Math.max(0, Math.floor((Number(el.dataset.fim) - agora) / 1000));
      const h = Math.floor(s / 3600), pad = (x) => String(x).padStart(2, "0");
      el.textContent = h >= 48 ? `${Math.floor(h / 24)} dias` : `${pad(h)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
    });
  }
  setInterval(tickContagens, 1000);

  // =====================================================
  // PRODUTOS
  // =====================================================
  let pFiltro = "";
  function renderProdutos() {
    const P = dados.produtos;
    const chips = [["", "Todos", P.length], ...dados.categorias.map((c) => [c, c, P.filter((p) => p.categoria === c).length]),
      ["__dest", "Destaques", P.filter((p) => p.destaque).length],
      ["__promo", "Em promoção", P.filter((p) => Promo.ativasDo(p, dados.promocoes).length).length],
      ["__esgotado", "Esgotados", P.filter((p) => p.esgotado).length],
      ["__semfoto", "Sem foto", P.filter((p) => !p.imagem).length],
      ["__off", "Ocultos", P.filter((p) => p.ativo === false).length]];
    if (!chips.some(([v]) => v === pFiltro)) pFiltro = "";
    $("pChips").innerHTML = chips.map(([v, l, q]) => `<button class="chip ${v === pFiltro ? "on" : ""}" data-f="${esc(v)}">${esc(l)} <em>${q}</em></button>`).join("");

    const termo = norm($("pBusca").value);
    let lista = P.filter((p) => {
      if (termo && !norm(p.nome + " " + (p.descricao || "")).includes(termo)) return false;
      switch (pFiltro) {
        case "": return true;
        case "__dest": return p.destaque;
        case "__promo": return Promo.ativasDo(p, dados.promocoes).length > 0;
        case "__esgotado": return p.esgotado;
        case "__semfoto": return !p.imagem;
        case "__off": return p.ativo === false;
        default: return p.categoria === pFiltro;
      }
    });
    const ordem = $("pOrdem").value;
    if (ordem === "nome") lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (ordem === "menor") lista = [...lista].sort((a, b) => n(a.preco) - n(b.preco));
    if (ordem === "maior") lista = [...lista].sort((a, b) => n(b.preco) - n(a.preco));

    $("pLista").innerHTML = lista.length ? lista.map((p, i) => {
      const v = Promo.vitrine(p, dados.promocoes);
      const promos = dados.promocoes.filter((pr) => Promo.aplicaA(pr, p) && Promo.status(pr) !== "encerrada");
      const tags = [
        ...promos.map((pr) => `<span class="tag ${Promo.status(pr) === "ativa" ? "ouro" : ""}">${esc(Promo.selo(pr, p.preco) || pr.nome)}</span>`),
        p.esgotado ? '<span class="tag vermelho">Esgotado</span>' : "",
        p.ativo === false ? '<span class="tag">Oculto</span>' : "",
        p.destaque ? '<span class="tag azul">Destaque</span>' : "",
        !p.imagem ? '<span class="tag">Sem foto</span>' : "",
      ].join("");
      return `<div class="item ${p.ativo === false ? "off" : ""}" data-key="p${p.id}" style="animation-delay:${Math.min(i, 14) * 18}ms">
        <div class="thumb">${p.imagem ? `<img src="${esc(srcImg(p.imagem))}" alt="">` : ico("image", 20)}</div>
        <div style="min-width:0"><div class="nome">${esc(p.nome)}</div>
          <div class="sub"><span>${esc(p.categoria)}</span>${tags}</div></div>
        <div class="preco ${v.preco < v.cheio ? "promo" : ""}">${v.preco < v.cheio ? `<s>${brl(v.cheio)}</s>${brl(v.preco)}` : brl(p.preco)}</div>
        <div class="acoes">
          <button class="btn sm ghost estoque ${p.esgotado ? "esg" : ""}" data-a="esgotado" data-id="${p.id}" aria-pressed="${!!p.esgotado}" title="${p.esgotado ? "Clique para voltar a vender" : "Clique para marcar como esgotado"}">${ico(p.esgotado ? "ban" : "check", 14)}${p.esgotado ? "Esgotado" : "Em estoque"}</button>
          <button class="btn sm ghost" data-a="editar" data-id="${p.id}">${ico("edit", 14)}Editar</button>
          <button class="circ sm" data-a="mais" data-id="${p.id}" aria-haspopup="menu" aria-expanded="false" aria-label="Mais ações para ${esc(p.nome)}" title="Mais ações">${ico("more", 16)}</button>
        </div></div>`;
    }).join("") : (P.length
      ? vazio("search", "Nenhum produto encontrado", "Ajuste a busca ou o filtro.")
      : vazio("box", "Nenhum produto cadastrado", "Cadastre o primeiro produto da loja.", `<button class="btn accent sm" data-acao="novoProduto">${ico("plus")}Novo produto</button>`));
  }
  $("pBusca").addEventListener("input", renderProdutos);
  $("pOrdem").addEventListener("change", () => Motion.flip($("pLista"), renderProdutos));
  $("pChips").addEventListener("click", (e) => { const c = e.target.closest("[data-f]"); if (c) { pFiltro = c.dataset.f; Motion.flip($("pLista"), renderProdutos); } });

  function duplicarProduto(p) {
    const c = clone(p);
    c.id = proxIdProduto();
    c.nome = p.nome + " (cópia)";
    const i = dados.produtos.indexOf(p);
    dados.produtos.splice(i + 1, 0, c);
    mudou();
    return c;
  }
  const proxIdProduto = () => dados.produtos.reduce((m, x) => Math.max(m, n(x.id)), 0) + 1;

  // ---------- Menu "Mais ações" do produto ----------
  let menuBtn = null;
  function fecharMenu(devolverFoco) {
    if (!menuBtn) return;
    $("menuMais").hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    if (devolverFoco && document.contains(menuBtn)) menuBtn.focus({ preventScroll: true });
    menuBtn = null;
  }
  function abrirMenu(btn, p) {
    const m = $("menuMais");
    m.innerHTML = [
      ["destaque", p.destaque ? "Remover dos destaques" : "Destacar no site", "star"],
      ["ativo", p.ativo === false ? "Mostrar no site" : "Ocultar do site", p.ativo === false ? "eye" : "eyeOff"],
      ["promo", "Criar promoção", "percent"],
      ["duplicar", "Duplicar", "copy"],
      ["excluir", "Excluir", "trash"],
    ].map(([a, t, i]) => `<button type="button" role="menuitem" class="${a === "excluir" ? "del" : ""}" data-a="${a}" data-id="${p.id}">${ico(i, 16)}${t}</button>`).join("");
    m.hidden = false;
    const r = btn.getBoundingClientRect(), w = m.offsetWidth, hh = m.offsetHeight;
    let top = r.bottom + 6;
    if (top + hh > innerHeight - 8) top = r.top - hh - 6;
    top = Math.max(8, Math.min(top, innerHeight - hh - 8));
    m.style.top = top + "px";
    m.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + "px";
    menuBtn = btn;
    btn.setAttribute("aria-expanded", "true");
    m.querySelector("button").focus({ preventScroll: true });
  }
  document.addEventListener("click", (e) => {
    if (!menuBtn) return;
    const item = e.target.closest("#menuMais [data-a]");
    if (item) {
      const p = dados.produtos.find((x) => x.id === Number(item.dataset.id));
      fecharMenu(false);
      if (p) acaoProduto(item.dataset.a, p);
      return;
    }
    if (!e.target.closest("#menuMais") && e.target.closest("[data-a='mais']") !== menuBtn) fecharMenu(false);
  });
  $("menuMais").addEventListener("keydown", (e) => {
    const itens = [...$("menuMais").querySelectorAll("button")], i = itens.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); itens[(i + 1) % itens.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); itens[(i - 1 + itens.length) % itens.length].focus(); }
    if (e.key === "Escape") { e.stopPropagation(); fecharMenu(true); }
    if (e.key === "Tab") fecharMenu(false);
  });
  addEventListener("resize", () => fecharMenu(false));
  addEventListener("scroll", () => fecharMenu(false), true);

  $("pLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const p = dados.produtos.find((x) => x.id === Number(b.dataset.id)); if (!p) return;
    if (b.dataset.a === "mais") { if (menuBtn === b) fecharMenu(false); else { fecharMenu(false); abrirMenu(b, p); } return; }
    acaoProduto(b.dataset.a, p);
  });
  function acaoProduto(a, p) {
    if (a === "editar") return abrirProduto(p.id);
    if (a === "promo") return abrirPromo(null, { aplicaEm: "produtos", produtos: [p.id], nome: "Promoção " + p.nome });
    if (a === "duplicar") { const c = duplicarProduto(p); renderProdutos(); renderKpis(); toast("Produto duplicado"); return abrirProduto(c.id); }
    if (a === "excluir") {
      if (!confirm(`Excluir o produto "${p.nome}"? Esta ação não pode ser desfeita após publicar.`)) return;
      const linha = $("pLista").querySelector(`[data-key="p${p.id}"]`);
      (linha ? Motion.sair(linha) : Promise.resolve()).then(() => {
        liberarImagem(p.imagem, p);
        dados.produtos = dados.produtos.filter((x) => x !== p);
        dados.promocoes.forEach((pr) => { pr.produtos = (pr.produtos || []).filter((id) => id !== p.id); });
        mudou(); renderProdutos(); renderKpis();
        toast("Produto excluído");
      });
      return;
    }
    if (a === "ativo") { p.ativo = p.ativo === false; toast(p.ativo ? "Produto visível no site" : "Produto oculto do site"); }
    if (a === "destaque") { p.destaque = !p.destaque; toast(p.destaque ? "Produto adicionado aos destaques" : "Produto removido dos destaques"); }
    if (a === "esgotado") { p.esgotado = !p.esgotado; toast(p.esgotado ? "Produto marcado como esgotado" : "Produto disponível novamente"); }
    mudou(); renderProdutos(); renderKpis();
  }

  // ---------- Modais ----------
  let modalAberto = null;
  function abrirModal(id) { modalAberto = id; $("scrim").hidden = false; $(id).hidden = false; Motion.abrirModal($(id)); }
  function fecharModal() {
    if (!modalAberto) return;
    const el = $(modalAberto);
    modalAberto = null;
    $("mFoto").value = "";
    Motion.fecharModal(el).then(() => {
      if (modalAberto !== el.id) el.hidden = true;
      if (!modalAberto) $("scrim").hidden = true;
    });
  }
  $("scrim").onclick = fecharModal;
  document.addEventListener("click", (e) => { if (e.target.closest("[data-fechar]")) fecharModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });

  // ---------- Modal: produto ----------
  let editId = null, fotoNova = null, fotoRemovida = false;
  function abrirProduto(id, manterCategoria) {
    if (!dados.categorias.length) {
      toast("Crie uma categoria antes de cadastrar produtos.", "erro", 3500);
      return abrirAba("categorias");
    }
    editId = id; fotoNova = null; fotoRemovida = false;
    const p = id != null ? dados.produtos.find((x) => x.id === id) : null;
    $("mTitulo").textContent = p ? "Editar produto" : "Novo produto";
    $("mCategoria").innerHTML = dados.categorias.map((c) => `<option>${esc(c)}</option>`).join("");
    $("mNome").value = p ? p.nome : "";
    $("mCategoria").value = p ? p.categoria
      : manterCategoria && dados.categorias.includes(manterCategoria) ? manterCategoria
      : dados.categorias.includes(pFiltro) ? pFiltro : dados.categorias[0];
    $("mEmoji").value = p ? p.emoji || "" : "";
    $("mPreco").value = p ? precoTxt(p.preco) : "";
    $("mDesc").value = p ? p.descricao || "" : "";
    $("mDestaque").checked = p ? !!p.destaque : false;
    $("mAtivo").checked = p ? p.ativo !== false : true;
    $("mEsgotado").checked = p ? !!p.esgotado : false;
    $("mErro").textContent = "";
    $("mDuplicar").hidden = !p;
    $("mSalvarNovo").hidden = !!p;
    previewFoto(p && p.imagem ? srcImg(p.imagem) : null);
    const promos = p ? dados.promocoes.filter((pr) => Promo.aplicaA(pr, p)) : [];
    $("mPromos").innerHTML = p ? `<h3>Promoções deste produto</h3>${promos.map((pr) => `<div class="mini-item" data-promo="${pr.id}"><span class="ic">${ico("percent", 16)}</span><div><b>${esc(pr.nome)}</b><small>${esc(Promo.descricao(pr))} · ${STATUS[Promo.status(pr)].txt}</small></div></div>`).join("")}
      <button class="btn ghost sm" id="mNovaPromo">${ico("plus")}Criar promoção para este produto</button>` : "";
    const np = $("mNovaPromo");
    if (np) np.onclick = () => { fecharModal(); abrirPromo(null, { aplicaEm: "produtos", produtos: [p.id], nome: "Promoção " + p.nome }); };
    if (modalAberto !== "mProduto") abrirModal("mProduto");
    setTimeout(() => $("mNome").focus(), 60);
  }
  $("mPromos").addEventListener("click", (e) => { const m = e.target.closest("[data-promo]"); if (m) { fecharModal(); abrirPromo(Number(m.dataset.promo)); } });
  function previewFoto(src) {
    $("mFotoPrev").innerHTML = src ? `<img src="${esc(src)}" alt="">` : `<span class="sem-foto">${ico("image", 30)}<small>Sem foto</small></span>`;
    $("mFotoRemover").hidden = !src;
  }
  function reduzirImagem(file, max = 800) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#141414"; ctx.fillRect(0, 0, c.width, c.height);
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
    try { fotoNova = await reduzirImagem(f); fotoRemovida = false; previewFoto(fotoNova); }
    catch { toast("Não foi possível abrir esta imagem. Use JPG ou PNG.", "erro"); }
  });
  $("mFotoRemover").onclick = () => { fotoNova = null; fotoRemovida = true; $("mFoto").value = ""; previewFoto(null); };

  function salvarProduto() {
    const nome = $("mNome").value.trim().replace(/\s+/g, " "), preco = Math.round(num($("mPreco").value) * 100) / 100;
    const erro = (m, campo) => { $("mErro").textContent = m; if (campo) $(campo).focus(); return null; };
    if (!nome) return erro("Informe o nome do produto.", "mNome");
    if (!(preco > 0)) return erro("Informe um preço maior que zero.", "mPreco");
    if (!dados.categorias.includes($("mCategoria").value)) return erro("Escolha uma categoria.", "mCategoria");
    const repetido = dados.produtos.find((x) => x.id !== editId && norm(x.nome) === norm(nome));
    if (repetido && !confirm(`Já existe um produto chamado "${repetido.nome}". Salvar mesmo assim?`)) return null;

    let p = editId != null ? dados.produtos.find((x) => x.id === editId) : null;
    if (!p) { p = { id: proxIdProduto(), imagem: "" }; dados.produtos.push(p); }
    Object.assign(p, {
      nome, preco, categoria: $("mCategoria").value, emoji: $("mEmoji").value.trim(),
      descricao: $("mDesc").value.trim(), destaque: $("mDestaque").checked,
      ativo: $("mAtivo").checked, esgotado: $("mEsgotado").checked,
    });
    if (fotoNova || fotoRemovida) { liberarImagem(p.imagem, p); p.imagem = ""; }
    if (fotoNova) { p.imagem = `img/produtos/p${p.id}-${Date.now()}.jpg`; pendentes[p.imagem] = fotoNova; }
    mudou();
    if (abaAtual === "produtos") renderProdutos(); else if (abaAtual === "inicio") renderInicio();
    renderKpis();
    return p;
  }
  $("mSalvar").onclick = () => {
    const novo = editId == null;
    if (!salvarProduto()) return;
    fecharModal();
    toast(novo ? "Produto cadastrado" : "Produto atualizado");
  };
  $("mSalvarNovo").onclick = () => {
    const p = salvarProduto(); if (!p) return;
    toast(`"${p.nome}" cadastrado. Preencha o próximo.`);
    abrirProduto(null, p.categoria);
  };
  $("mDuplicar").onclick = () => {
    const p = dados.produtos.find((x) => x.id === editId); if (!p) return;
    if (!salvarProduto()) return;
    const c = duplicarProduto(p);
    if (abaAtual === "produtos") renderProdutos();
    toast("Produto duplicado. Ajuste os dados da cópia.");
    abrirProduto(c.id);
  };
  $("mProduto").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("input[type=text], input[type=number]")) { e.preventDefault(); $("mSalvar").click(); }
  });

  // =====================================================
  // PROMOÇÕES
  // =====================================================
  const STATUS = {
    ativa: { txt: "Ativa agora", cor: "verde" },
    foraHorario: { txt: "Fora do horário", cor: "azul" },
    agendada: { txt: "Agendada", cor: "azul" },
    pausada: { txt: "Pausada", cor: "" },
    encerrada: { txt: "Encerrada", cor: "vermelho" },
  };
  function alvoTxt(pr) {
    if (pr.aplicaEm === "todos") return "Loja inteira";
    if (pr.aplicaEm === "categoria") return "Categoria " + (pr.categoria || "-");
    const ids = pr.produtos || [];
    if (ids.length === 1) { const p = dados.produtos.find((x) => x.id === ids[0]); return p ? p.nome : "1 produto"; }
    return plural(ids.length, "produto", "produtos");
  }
  function quandoTxt(pr) {
    const partes = [];
    if (pr.inicio && pr.fim) partes.push(`${dataBR(pr.inicio)} a ${dataBR(pr.fim)}`);
    else if (pr.inicio) partes.push(`a partir de ${dataBR(pr.inicio)}`);
    else if (pr.fim) partes.push(`até ${dataBR(pr.fim)}`);
    if (pr.dias && pr.dias.length && pr.dias.length < 7) partes.push([...pr.dias].sort().map((d) => Promo.DIAS[d]).join(", "));
    if (pr.horaInicio || pr.horaFim) partes.push(`${pr.horaInicio || "00:00"} às ${pr.horaFim || "24:00"}`);
    return partes.length ? partes.join(" · ") : "Sempre";
  }
  const VITRINE = { promoDia: "Promoção do dia", ofertas: "Ofertas", nenhuma: "Somente selo" };

  let prFiltro = "";
  function renderPromos() {
    const PR = dados.promocoes, agora = new Date();
    const cont = (s) => PR.filter((p) => Promo.status(p, agora) === s).length;
    const chips = [["", "Todas", PR.length], ["ativa", "Ativas agora", cont("ativa")], ["agendada", "Agendadas", cont("agendada") + cont("foraHorario")], ["pausada", "Pausadas", cont("pausada")], ["encerrada", "Encerradas", cont("encerrada")]];
    $("prChips").innerHTML = chips.map(([v, l, q]) => `<button class="chip ${v === prFiltro ? "on" : ""}" data-f="${v}">${l} <em>${q}</em></button>`).join("");
    const termo = norm($("prBusca").value);
    const lista = PR.filter((pr) => {
      const st = Promo.status(pr, agora);
      if (termo && !norm(pr.nome).includes(termo)) return false;
      if (prFiltro === "agendada") return st === "agendada" || st === "foraHorario";
      return !prFiltro || st === prFiltro;
    });
    const ordem = { ativa: 0, foraHorario: 1, agendada: 2, pausada: 3, encerrada: 4 };
    lista.sort((a, b) => ordem[Promo.status(a, agora)] - ordem[Promo.status(b, agora)]);
    $("prLista").innerHTML = lista.length ? lista.map((pr, i) => {
      const st = Promo.status(pr, agora), S = STATUS[st];
      const fim = st === "ativa" ? Promo.terminaEm(pr, agora) : null;
      const exemplo = dados.produtos.find((p) => Promo.aplicaA(pr, p));
      const selo = Promo.selo(pr, exemplo ? exemplo.preco : 0);
      return `<article class="card pcard st-${st}" data-id="${pr.id}" style="animation-delay:${Math.min(i, 10) * 30}ms">
        <div class="topo"><h3>${esc(pr.nome)}</h3><span class="tag ${S.cor}">${S.txt}</span></div>
        <div class="regra">${esc(Promo.descricao(pr))}</div>
        <div class="meta">
          <div>${ico("box", 14)}${esc(alvoTxt(pr))}</div>
          <div>${ico("clock", 14)}${esc(quandoTxt(pr))}</div>
          <div>${ico("eye", 14)}${VITRINE[pr.vitrine] || ""}${n(pr.limite) ? ` · máx. ${n(pr.limite)} un. por pedido` : ""}</div>
        </div>
        <div class="pe">
          <div>${selo ? `<span class="selo-prev">${esc(selo)}</span>` : ""}${fim ? ` <small class="contagem" data-fim="${fim.getTime()}"></small>` : ""}</div>
          <div class="acoes">
            <button class="circ sm" data-a="pausar" title="${pr.ativa === false ? "Ativar" : "Pausar"}">${ico(pr.ativa === false ? "play" : "pause", 14)}</button>
            <button class="circ sm" data-a="duplicar" title="Duplicar">${ico("copy", 14)}</button>
            <button class="circ sm del" data-a="excluir" title="Excluir">${ico("trash", 14)}</button>
          </div>
        </div></article>`;
    }).join("") : `<div class="card" style="grid-column:1/-1">${vazio("percent", PR.length ? "Nenhuma promoção neste filtro" : "Nenhuma promoção cadastrada", "Crie descontos em porcentagem, em reais, preço promocional, leve X pague Y ou desconto na 2ª unidade.", `<button class="btn accent sm" data-acao="novaPromo">${ico("plus")}Nova promoção</button>`)}</div>`;
    tickContagens();
  }
  $("prBusca").addEventListener("input", renderPromos);
  $("prChips").addEventListener("click", (e) => { const c = e.target.closest("[data-f]"); if (c) { prFiltro = c.dataset.f; renderPromos(); } });
  $("prLista").addEventListener("click", (e) => {
    const card = e.target.closest(".pcard"); if (!card) return;
    const pr = dados.promocoes.find((x) => x.id === Number(card.dataset.id)); if (!pr) return;
    const b = e.target.closest("[data-a]");
    if (!b) return abrirPromo(pr.id);
    if (b.dataset.a === "pausar") { pr.ativa = pr.ativa === false; toast(pr.ativa ? "Promoção ativada" : "Promoção pausada"); }
    if (b.dataset.a === "duplicar") {
      const c = clone(pr); c.id = proxIdPromo(); c.nome = pr.nome + " (cópia)"; c.ativa = false;
      dados.promocoes.push(c); toast("Cópia criada (pausada)");
    }
    if (b.dataset.a === "excluir") {
      if (!confirm(`Excluir a promoção "${pr.nome}"?`)) return;
      Motion.sair(card).then(() => {
        dados.promocoes = dados.promocoes.filter((x) => x !== pr);
        mudou(); renderPromos(); renderKpis(); toast("Promoção excluída");
      });
      return;
    }
    mudou(); renderPromos(); renderKpis();
  });
  const proxIdPromo = () => dados.promocoes.reduce((m, x) => Math.max(m, n(x.id)), 0) + 1;

  // ---------- Modal: promoção ----------
  let ed = null;
  const CAMPOS_TIPO = {
    percentual: () => `<label class="f">Desconto (%)<input type="number" min="1" max="100" step="1" data-k="valor" value="${n(ed.valor)}"></label>`,
    valorOff: () => `<label class="f">Desconto por unidade (R$)<input type="text" inputmode="decimal" class="dinheiro" data-k="valor" value="${virgula(n(ed.valor))}"></label>`,
    precoFixo: () => `<label class="f">Preço promocional (R$)<input type="text" inputmode="decimal" class="dinheiro" data-k="valor" value="${virgula(n(ed.valor))}"></label>`,
    leveXpagueY: () => `<label class="f">Leve<input type="number" min="2" step="1" data-k="leve" value="${n(ed.leve) || 3}"></label><label class="f">Pague<input type="number" min="1" step="1" data-k="pague" value="${n(ed.pague) || 2}"></label>`,
    segundaUnidade: () => `<label class="f">Desconto na 2ª unidade (%)<input type="number" min="1" max="100" step="1" data-k="valor" value="${n(ed.valor)}"></label>`,
  };

  function abrirPromo(id, extra) {
    const orig = id != null ? dados.promocoes.find((x) => x.id === id) : null;
    ed = orig ? clone(orig) : Promo.nova(Object.assign({ id: null }, extra || {}));
    if (!orig && ed.tipo === "percentual" && !n(ed.valor)) ed.valor = 10;
    if (!ed.categoria) ed.categoria = dados.categorias[0] || "";
    $("prTitulo").textContent = orig ? "Editar promoção" : "Nova promoção";
    $("prExcluir").hidden = !orig;
    $("prNome").value = ed.nome || "";
    $("prTipo").innerHTML = Object.entries(Promo.TIPOS).map(([k, l]) => `<button data-v="${k}">${l}</button>`).join("");
    $("prCategoria").innerHTML = dados.categorias.map((c) => `<option>${esc(c)}</option>`).join("");
    $("prCategoria").value = ed.categoria;
    $("prInicio").value = ed.inicio || ""; $("prFim").value = ed.fim || "";
    $("prHoraIni").value = ed.horaInicio || ""; $("prHoraFim").value = ed.horaFim || "";
    $("prSelo").value = ed.selo || ""; $("prLimite").value = n(ed.limite);
    $("prAtiva").checked = ed.ativa !== false;
    $("prProdBusca").value = "";
    $("prErro").textContent = "";
    $("prValores").dataset.tipo = "";
    renderPromoForm();
    abrirModal("mPromo");
    setTimeout(() => $("prNome").focus(), 60);
  }

  function renderPromoForm() {
    $$("#prTipo button").forEach((b) => b.classList.toggle("on", b.dataset.v === ed.tipo));
    const tipoMudou = $("prValores").dataset.tipo !== ed.tipo;
    $("prValores").innerHTML = CAMPOS_TIPO[ed.tipo]();
    $("prValores").dataset.tipo = ed.tipo;
    if (tipoMudou) Motion.entrarAba($("prValores"));
    $$("#prAlvo button").forEach((b) => b.classList.toggle("on", b.dataset.v === ed.aplicaEm));
    $("prAlvoProdutos").hidden = ed.aplicaEm !== "produtos";
    $("prAlvoCategoria").hidden = ed.aplicaEm !== "categoria";
    $$("#prVitrine button").forEach((b) => b.classList.toggle("on", b.dataset.v === ed.vitrine));
    $("prDias").innerHTML = Promo.DIAS.map((d, i) => `<button data-d="${i}" class="${(ed.dias || []).includes(i) ? "on" : ""}">${d}</button>`).join("");
    renderPicker();
    renderPromoPreview();
  }
  function contarSel() {
    const q = (ed.produtos || []).length;
    $("prSelCount").textContent = `${plural(q, "produto selecionado", "produtos selecionados")}`;
  }
  function renderPicker() {
    const termo = norm($("prProdBusca").value);
    const sel = new Set(ed.produtos || []);
    const lista = dados.produtos.filter((p) => !termo || norm(p.nome).includes(termo) || norm(p.categoria).includes(termo));
    lista.sort((a, b) => (sel.has(b.id) ? 1 : 0) - (sel.has(a.id) ? 1 : 0));
    $("prPicker").innerHTML = lista.length
      ? lista.map((p) => `<label class="pick"><input type="checkbox" data-pid="${p.id}" ${sel.has(p.id) ? "checked" : ""}>${thumb(p)}<span>${esc(p.nome)}</span><small>${brl(p.preco)}</small></label>`).join("")
      : `<small class="help">Nenhum produto encontrado.</small>`;
    contarSel();
  }
  function renderPromoPreview() {
    const teste = { ...ed, ativa: true, inicio: "", fim: "", dias: [], horaInicio: "", horaFim: "" };
    const todos = dados.produtos.filter((p) => Promo.aplicaA(teste, p));
    const qtdTipo = Promo.TIPOS_QTD.includes(ed.tipo);
    const q = ed.tipo === "leveXpagueY" ? Math.max(2, n(ed.leve)) : ed.tipo === "segundaUnidade" ? 2 : 1;
    $("prPreview").innerHTML = todos.length ? todos.slice(0, 4).map((p) => {
      const l = Promo.linha(p, q, [teste]);
      const selo = Promo.selo(teste, p.preco);
      return `<div class="prev-card">${thumb(p)}<div style="min-width:0"><b>${esc(p.nome)}</b>
        <div class="p">${qtdTipo ? `${q} un.: ` : ""}${l.economia > 0 ? `<s>${brl(l.cheio)}</s> por <strong>${brl(l.total)}</strong>` : `<strong>${brl(l.total)}</strong> <small>(sem desconto)</small>`}</div>
        ${selo ? `<span class="selo-prev">${esc(selo)}</span>` : ""}</div></div>`;
    }).join("") + (todos.length > 4 ? `<small class="help">e mais ${todos.length - 4}</small>` : "")
      : `<small class="help">Selecione os produtos para ver o resultado.</small>`;
    const S = STATUS[Promo.status({ ...ed, ativa: $("prAtiva").checked })];
    const cores = { verde: "var(--good)", azul: "var(--sky)", vermelho: "var(--bad)", "": "var(--faint)" };
    $("prStatus").innerHTML = `<i style="color:${cores[S.cor]}"></i><span style="color:${cores[S.cor]}">${S.txt}</span><small class="help" style="margin:0">· ${esc(quandoTxt(ed))}</small>`;
  }

  $("prTipo").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    const unidade = (t) => (["percentual", "segundaUnidade"].includes(t) ? "%" : ["valorOff", "precoFixo"].includes(t) ? "R$" : "qtd");
    const antes = ed.tipo;
    ed.tipo = b.dataset.v;
    if (unidade(antes) !== unidade(ed.tipo) || antes === "valorOff" || ed.tipo === "valorOff" || ed.tipo === "segundaUnidade") {
      const alvo = dados.produtos.find((p) => Promo.aplicaA({ ...ed, ativa: true }, p));
      ed.valor = { percentual: 10, segundaUnidade: 50, valorOff: 2, precoFixo: alvo ? Math.round(alvo.preco * 0.9 * 100) / 100 : 0 }[ed.tipo] ?? ed.valor;
    }
    renderPromoForm();
  });
  $("prValores").addEventListener("input", (e) => { const i = e.target.closest("[data-k]"); if (i) { ed[i.dataset.k] = num(i.value); renderPromoPreview(); } });
  $("prAlvo").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) { ed.aplicaEm = b.dataset.v; renderPromoForm(); } });
  $("prCategoria").addEventListener("change", () => { ed.categoria = $("prCategoria").value; renderPromoPreview(); });
  $("prProdBusca").addEventListener("input", renderPicker);
  $("prPicker").addEventListener("change", (e) => {
    const c = e.target.closest("[data-pid]"); if (!c) return;
    const id = Number(c.dataset.pid);
    ed.produtos = c.checked ? [...new Set([...(ed.produtos || []), id])] : (ed.produtos || []).filter((x) => x !== id);
    contarSel();
    renderPromoPreview();
  });
  $("prVitrine").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) { ed.vitrine = b.dataset.v; renderPromoForm(); } });
  $("prDias").addEventListener("click", (e) => {
    const b = e.target.closest("[data-d]"); if (!b) return;
    const d = Number(b.dataset.d), s = new Set(ed.dias || []);
    s.has(d) ? s.delete(d) : s.add(d);
    ed.dias = [...s].sort();
    b.classList.toggle("on");
    renderPromoPreview();
  });
  [["prInicio", "inicio"], ["prFim", "fim"], ["prHoraIni", "horaInicio"], ["prHoraFim", "horaFim"], ["prSelo", "selo"]].forEach(([id, k]) =>
    $(id).addEventListener("input", () => { ed[k] = $(id).value; renderPromoPreview(); }));
  $("prLimite").addEventListener("input", () => { ed.limite = Math.max(0, Math.floor(num($("prLimite").value))); });
  $("prAtiva").addEventListener("change", renderPromoPreview);
  $("prNome").addEventListener("input", () => { ed.nome = $("prNome").value; });
  $$(".presets button").forEach((b) => b.addEventListener("click", () => {
    const hoje = Promo.ymd(new Date());
    Object.assign(ed, {
      sempre: { inicio: "", fim: "", dias: [], horaInicio: "", horaFim: "" },
      hoje: { inicio: hoje, fim: hoje, dias: [], horaInicio: "", horaFim: "" },
      fds: { dias: [5, 6, 0], horaInicio: "", horaFim: "" },
      happy: { horaInicio: "18:00", horaFim: "21:00" },
      madrugada: { horaInicio: "22:00", horaFim: "04:00" },
    }[b.dataset.preset]);
    $("prInicio").value = ed.inicio || ""; $("prFim").value = ed.fim || "";
    $("prHoraIni").value = ed.horaInicio || ""; $("prHoraFim").value = ed.horaFim || "";
    renderPromoForm();
  }));

  $("prSalvar").onclick = () => {
    const erro = (m) => { $("prErro").textContent = m; };
    ed.nome = $("prNome").value.trim();
    ed.ativa = $("prAtiva").checked;
    if (!ed.nome) return erro("Informe um nome para a promoção.");
    if (ed.tipo === "percentual" && !(n(ed.valor) > 0 && n(ed.valor) <= 100)) return erro("O desconto deve ficar entre 1% e 100%.");
    if (ed.tipo === "segundaUnidade" && !(n(ed.valor) > 0 && n(ed.valor) <= 100)) return erro("O desconto da 2ª unidade deve ficar entre 1% e 100%.");
    if ((ed.tipo === "valorOff" || ed.tipo === "precoFixo") && !(n(ed.valor) > 0)) return erro("Informe um valor maior que zero.");
    if (ed.tipo === "leveXpagueY" && !(n(ed.leve) > n(ed.pague) && n(ed.pague) >= 1)) return erro("Em \"Leve X, pague Y\", X deve ser maior que Y (ex.: leve 3, pague 2).");
    if (ed.aplicaEm === "produtos" && !(ed.produtos || []).length) return erro("Selecione pelo menos um produto.");
    if (ed.aplicaEm === "categoria") { ed.categoria = $("prCategoria").value; if (!ed.categoria) return erro("Selecione uma categoria."); }
    if (ed.inicio && ed.fim && ed.fim < ed.inicio) return erro("A data de término é anterior à data de início.");
    if (ed.tipo === "precoFixo") {
      const caros = dados.produtos.filter((p) => Promo.aplicaA({ ...ed, ativa: true }, p) && n(p.preco) <= n(ed.valor));
      if (caros.length && !confirm(`O preço promocional (${brl(ed.valor)}) não é menor que o preço de ${plural(caros.length, "produto", "produtos")}. Nesses itens não haverá desconto. Salvar mesmo assim?`)) return;
    }
    if (ed.id == null) { ed.id = proxIdPromo(); dados.promocoes.push(ed); toast("Promoção criada"); }
    else { const i = dados.promocoes.findIndex((x) => x.id === ed.id); dados.promocoes[i] = ed; toast("Promoção salva"); }
    fecharModal(); mudou();
    abrirAba(["inicio", "promocoes", "produtos"].includes(abaAtual) ? abaAtual : "promocoes");
  };
  $("prExcluir").onclick = () => {
    if (ed.id == null || !confirm(`Excluir a promoção "${ed.nome}"?`)) return;
    dados.promocoes = dados.promocoes.filter((x) => x.id !== ed.id);
    fecharModal(); mudou(); abrirAba(abaAtual); toast("Promoção excluída");
  };

  // =====================================================
  // CATEGORIAS
  // =====================================================
  function renderCategorias() {
    const qtd = (c) => dados.produtos.filter((p) => p.categoria === c).length;
    $("cLista").innerHTML = dados.categorias.length ? dados.categorias.map((c, i) => `
      <div class="cat" data-key="${esc(c)}">
        <input type="text" value="${esc(c)}" data-i="${i}" aria-label="Nome da categoria">
        <span class="qtd">${plural(qtd(c), "produto", "produtos")}</span>
        <button class="circ sm" data-c="up" data-i="${i}" title="Subir" ${i === 0 ? "disabled" : ""}>${ico("up", 15)}</button>
        <button class="circ sm" data-c="down" data-i="${i}" title="Descer" ${i === dados.categorias.length - 1 ? "disabled" : ""}>${ico("down", 15)}</button>
        <button class="circ sm del" data-c="del" data-i="${i}" title="Excluir">${ico("trash", 15)}</button>
      </div>`).join("") : vazio("layers", "Nenhuma categoria", "Crie a primeira categoria acima.");
  }
  $("cAdd").onclick = () => {
    const nome = $("cNova").value.trim().replace(/\s+/g, " "); if (!nome) return $("cNova").focus();
    if (dados.categorias.some((c) => norm(c) === norm(nome))) return toast("Essa categoria já existe", "erro");
    dados.categorias.push(nome); $("cNova").value = "";
    mudou(); renderCategorias(); renderKpis(); toast("Categoria adicionada");
  };
  $("cNova").addEventListener("keydown", (e) => e.key === "Enter" && $("cAdd").click());
  $("cLista").addEventListener("change", (e) => {
    const inp = e.target.closest("input[data-i]"); if (!inp) return;
    const i = Number(inp.dataset.i), velho = dados.categorias[i], novo = inp.value.trim().replace(/\s+/g, " ");
    if (!novo || dados.categorias.some((c, j) => j !== i && norm(c) === norm(novo))) { inp.value = velho; return toast("Nome inválido ou repetido", "erro"); }
    if (novo === velho) return;
    dados.categorias[i] = novo;
    dados.produtos.forEach((p) => { if (p.categoria === velho) p.categoria = novo; });
    dados.promocoes.forEach((pr) => { if (pr.categoria === velho) pr.categoria = novo; });
    if (pFiltro === velho) pFiltro = novo;
    inp.closest(".cat").dataset.key = novo;
    mudou(); toast("Categoria renomeada");
  });
  $("cLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    const i = Number(b.dataset.i), cats = dados.categorias;
    if (b.dataset.c === "up" || b.dataset.c === "down") {
      const j = b.dataset.c === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= cats.length) return;
      Motion.flip($("cLista"), () => { [cats[i], cats[j]] = [cats[j], cats[i]]; renderCategorias(); });
      mudou();
      return;
    }
    if (b.dataset.c === "del") {
      const qtd = dados.produtos.filter((p) => p.categoria === cats[i]).length;
      if (qtd && cats.length === 1) return toast("Não é possível excluir a única categoria que tem produtos.", "erro", 3500);
      const destino = cats[i === 0 ? 1 : 0];
      if (!confirm(qtd ? `Excluir "${cats[i]}"? ${plural(qtd, "produto será movido", "produtos serão movidos")} para "${destino}".` : `Excluir a categoria "${cats[i]}"?`)) return;
      dados.produtos.forEach((p) => { if (p.categoria === cats[i]) p.categoria = destino; });
      dados.promocoes.forEach((pr) => { if (pr.categoria === cats[i]) pr.categoria = destino; });
      cats.splice(i, 1);
      mudou(); renderCategorias(); renderKpis(); toast("Categoria excluída");
    }
  });

  // =====================================================
  // FRETE
  // =====================================================
  const camposFrete = { fPrecoKm: "precoKm", fTaxaFixa: "taxaFixa", fTaxaMin: "taxaMinima", fRaio: "raioMaximoKm", fGratis: "freteGratisAcima", fPadrao: "taxaPadrao" };
  function renderFrete() {
    const F = dados.frete;
    $("fLojaCep").value = F.lojaCep || "";
    $("fLat").value = virgula(F.lojaLat); $("fLng").value = virgula(F.lojaLng);
    for (const [id, k] of Object.entries(camposFrete)) $(id).value = virgula(F[k] ?? 0);
    atualizarMapa(); atualizarFormula();
  }
  function atualizarMapa() {
    const { lojaLat: lat, lojaLng: lng } = dados.frete;
    $("fMapa").href = lat != null && lat !== "" ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}` : "#";
  }
  function atualizarFormula() {
    const F = dados.frete;
    const ex = [2, 5, 10].map((km) => { const v = Geo.valorPorKm(km, F); return `${km} km: <b>${v === null ? "fora da área" : brl(v)}</b>`; }).join(" · ");
    $("fFormula").innerHTML = `Frete = ${brl(F.taxaFixa)} + km × ${brl(F.precoKm)} (mínimo ${brl(F.taxaMinima)})<br>Exemplos: ${ex}`;
  }
  for (const [id, k] of Object.entries(camposFrete)) $(id).addEventListener("input", () => { dados.frete[k] = Math.max(0, num($(id).value)); atualizarFormula(); mudou(); });
  ["fLat", "fLng"].forEach((id) => $(id).addEventListener("input", () => {
    dados.frete[id === "fLat" ? "lojaLat" : "lojaLng"] = (() => { const x = parseFloat($(id).value.replace(",", ".")); return isNaN(x) ? null : x; })();
    atualizarMapa(); mudou();
  }));
  const mascaraCep = (e) => { let v = e.target.value.replace(/\D/g, "").slice(0, 8); if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5); e.target.value = v; };
  $("fLojaCep").addEventListener("input", (e) => { mascaraCep(e); dados.frete.lojaCep = e.target.value; mudou(); });
  $("fTesteCep").addEventListener("input", mascaraCep);
  $("fLocalizar").onclick = async () => {
    const msg = (t, c) => { $("fLocMsg").className = "hint " + (c || ""); $("fLocMsg").innerHTML = t; };
    msg('<span class="spin"></span>Procurando…');
    const end = await Geo.buscarCep($("fLojaCep").value);
    if (!end) return msg("CEP não encontrado.", "bad");
    const pos = await Geo.geocodificar({ ...end, rua: $("fLojaRua").value.trim() || end.rua });
    if (!pos) return msg(`Endereço encontrado (${esc(end.rua || end.bairro)} - ${esc(end.cidade)}), mas sem posição no mapa. Informe latitude e longitude manualmente (no Google Maps, clique com o botão direito sobre a loja).`, "bad");
    Object.assign(dados.frete, { lojaLat: Number(pos.lat.toFixed(6)), lojaLng: Number(pos.lng.toFixed(6)), cidade: end.cidade, uf: end.uf });
    renderFrete(); mudou();
    msg(`Loja localizada: ${esc(end.rua)}${end.bairro ? " - " + esc(end.bairro) : ""}, ${esc(end.cidade)}. Confira no mapa.`, "ok");
  };
  $("fTestar").onclick = async () => {
    const msg = (t, c) => { $("fTesteMsg").className = "hint " + (c || ""); $("fTesteMsg").innerHTML = t; };
    msg('<span class="spin"></span>Calculando…');
    const end = await Geo.buscarCep($("fTesteCep").value);
    if (!end) return msg("CEP não encontrado.", "bad");
    const r = await Geo.calcularFrete(end, dados.frete);
    const onde = `${esc(end.rua || "")}${end.bairro ? " - " + esc(end.bairro) : ""}, ${esc(end.cidade)}`;
    if (!r.ok) return msg(r.motivo === "longe" ? `${onde}: ${r.km.toFixed(1).replace(".", ",")} km, fora da área de entrega.` : `${onde}: endereço não atendido.`, "bad");
    msg(r.km != null
      ? `${onde}: <b>${r.km.toFixed(1).replace(".", ",")} km</b> ${r.metodo === "rota" ? "(rota de carro)" : "(estimativa)"}, frete de <b>${brl(r.valor)}</b>`
      : `${onde}: não localizado no mapa, taxa padrão de <b>${brl(r.valor)}</b>`, "ok");
  };

  // =====================================================
  // MENSAGEM DO PEDIDO
  // =====================================================
  let cenario = "entrega";
  function inserirVar(campo, v) {
    const el = $(campo);
    const ini = el.selectionStart ?? el.value.length, fim = el.selectionEnd ?? el.value.length;
    el.setRangeText(`{${v}}`, ini, fim, "end");
    el.focus();
    el.dispatchEvent(new Event("input"));
  }
  function exemploPedido() {
    const ativos = dados.produtos.filter((p) => p.ativo !== false && !p.esgotado);
    const base = ativos.length ? ativos.slice(0, 2) : [{ id: -1, nome: "Produto de exemplo", preco: 10 }, { id: -2, nome: "Outro produto", preco: 25.9 }];
    const itens = base.map((p, i) => {
      const q = i === 0 ? 2 : 1, l = Promo.linha(p, q, dados.promocoes);
      return { qtd: q, produto: p.nome, valor: l.total, unitario: p.preco, economia: l.economia, promo: l.promo ? (Promo.selo(l.promo, p.preco) || l.promo.nome) : "" };
    });
    const subtotal = itens.reduce((s, i) => s + i.valor, 0), economia = itens.reduce((s, i) => s + i.economia, 0);
    const retirada = cenario === "retirada", frete = retirada ? 0 : 8.5;
    return {
      cliente: "Maria Souza", telefone: "(62) 99999-0000", itens, subtotal, economia, frete, total: subtotal + frete,
      distancia: retirada ? "" : "3,2 km", retirada,
      endereco: ["Rua Exemplo, 123 - Apto 4", "Centro - Anápolis/GO", "CEP: 75020-010", "Referência: Próximo à praça"],
      pagamento: (dados.loja.pagamentos || [])[0] || "Pix", troco: "", obs: "Bem gelada, por favor.",
    };
  }
  function whatsHTML(txt) {
    return esc(txt)
      .replace(/\*([^*\n]+)\*/g, "<b>$1</b>")
      .replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?]|$)/g, "$1<i>$2</i>")
      .replace(/~([^~\n]+)~/g, "<s>$1</s>")
      .replace(/\n/g, "<br>");
  }
  function atualizarPreviewMsg() {
    const txt = Pedido.montar(dados.loja, exemploPedido());
    $("msgPreview").innerHTML = whatsHTML(txt) + `<span class="wa-hora">${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>`;
    const numero = String(dados.loja.whatsapp || "").replace(/\D/g, "");
    $("msgTeste").href = numero ? `https://wa.me/${numero}?text=${encodeURIComponent("[TESTE] " + txt)}` : "#";
    const faltam = ["itens", "total"].filter((v) => !dados.loja.mensagem.includes(`{${v}}`));
    $("msgAviso").className = "hint " + (faltam.length ? "bad" : "");
    $("msgAviso").textContent = faltam.length ? `Atenção: a mensagem não inclui ${faltam.map((v) => `{${v}}`).join(" e ")}. O pedido chegará incompleto.` : "";
  }
  function renderMensagem() {
    $("msgVars").innerHTML = Pedido.VARIAVEIS.map(([v, d]) => `<button class="var" data-v="${v}" title="${esc(d)}">{${v}}<small>${esc(d)}</small></button>`).join("");
    $("msgVarsItem").innerHTML = Pedido.VARIAVEIS_ITEM.map(([v, d]) => `<button class="var" data-v="${v}" title="${esc(d)}">{${v}}<small>${esc(d)}</small></button>`).join("");
    $("msgModelo").value = dados.loja.mensagem;
    $("msgItem").value = dados.loja.mensagemItem;
    $$("#msgCenario button").forEach((b) => b.classList.toggle("on", b.dataset.v === cenario));
    atualizarPreviewMsg();
  }
  $("msgVars").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) inserirVar("msgModelo", b.dataset.v); });
  $("msgVarsItem").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) inserirVar("msgItem", b.dataset.v); });
  $("msgModelo").addEventListener("input", () => { dados.loja.mensagem = $("msgModelo").value; mudou(); atualizarPreviewMsg(); });
  $("msgItem").addEventListener("input", () => { dados.loja.mensagemItem = $("msgItem").value; mudou(); atualizarPreviewMsg(); });
  $("msgCenario").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    cenario = b.dataset.v;
    $$("#msgCenario button").forEach((x) => x.classList.toggle("on", x === b));
    atualizarPreviewMsg();
  });
  $("msgPadrao").onclick = () => {
    if (!confirm("Restaurar a mensagem padrão? O modelo atual será substituído.")) return;
    dados.loja.mensagem = Pedido.PADRAO;
    dados.loja.mensagemItem = Pedido.PADRAO_ITEM;
    mudou(); renderMensagem(); toast("Mensagem padrão restaurada");
  };

  // =====================================================
  // LOJA
  // =====================================================
  function formatarWhats(v) {
    const d = String(v || "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return d;
  }
  function validarWhats() {
    let d = $("lWhats").value.replace(/\D/g, "");
    if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
    const ok = d.length === 10 || d.length === 11;
    $("lWhatsMsg").className = "hint " + (ok ? "ok" : "bad");
    $("lWhatsMsg").textContent = ok ? `Os pedidos serão enviados para +55 ${formatarWhats(d)}` : "Informe DDD e número (ex.: 62 99999-9999).";
    $("lWhatsTeste").href = ok ? `https://wa.me/55${d}?text=${encodeURIComponent("Teste do painel administrativo")}` : "#";
    return ok ? "55" + d : null;
  }
  function renderAberta() {
    $("lAbertaTxt").textContent = dados.loja.aberta ? "Aceitando pedidos" : "Loja fechada: pedidos bloqueados";
    $("lAbertaTxt").className = dados.loja.aberta ? "" : "txt-bad";
  }
  function renderLoja() {
    const L = dados.loja;
    $("lAberta").checked = L.aberta !== false;
    $("lAviso").value = L.avisoFechada || "";
    renderAberta();
    $("lWhats").value = formatarWhats(L.whatsapp);
    $("lNome").value = L.nome || ""; $("lSlogan").value = L.slogan || ""; $("lEndereco").value = L.endereco || "";
    $("lMinimo").value = virgula(L.pedidoMinimo || 0);
    $("lInsta").value = L.instagram ? "@" + (Pedido.arroba(L.instagram) || L.instagram.replace(/^@/, "")) : "";
    $("lWhatsRodape").value = formatarWhats(L.whatsappRodape);
    $("lRodape").value = L.rodapeTexto || "";
    validarRedes();
    renderPagamentos();
    validarWhats();
  }
  $("lAberta").addEventListener("change", () => { dados.loja.aberta = $("lAberta").checked; renderAberta(); mudou(); toast(dados.loja.aberta ? "Loja aberta para pedidos" : "Loja fechada para pedidos"); });
  $("lAviso").addEventListener("input", () => { dados.loja.avisoFechada = $("lAviso").value; mudou(); });
  $("lWhats").addEventListener("input", () => { const v = validarWhats(); if (v) { dados.loja.whatsapp = v; mudou(); } });
  $("lWhats").addEventListener("blur", () => { if (validarWhats()) $("lWhats").value = formatarWhats(dados.loja.whatsapp); });
  [["lNome", "nome"], ["lSlogan", "slogan"], ["lEndereco", "endereco"]].forEach(([id, k]) => $(id).addEventListener("input", () => { dados.loja[k] = $(id).value; mudou(); }));
  $("lMinimo").addEventListener("input", () => { dados.loja.pedidoMinimo = Math.max(0, num($("lMinimo").value)); mudou(); });
  // ---------- Rodapé: Instagram, WhatsApp e aviso ----------
  function validarRedes() {
    const L = dados.loja, msgs = [];
    let ok = true;
    const ins = $("lInsta").value.trim();
    if (ins && !Pedido.arroba(ins)) { msgs.push("Instagram inválido. Use @usuario ou o link do perfil."); ok = false; }
    else if (ins) msgs.push(`Instagram: instagram.com/${esc(Pedido.arroba(ins))}`);
    let d = $("lWhatsRodape").value.replace(/\D/g, "");
    if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
    if (d && d.length !== 10 && d.length !== 11) { msgs.push("WhatsApp do rodapé: informe DDD e número."); ok = false; }
    else msgs.push(`WhatsApp no rodapé: +55 ${esc(formatarWhats(d || L.whatsapp))}${d ? "" : " (o mesmo dos pedidos)"}`);
    $("lRedesMsg").className = "hint " + (ok ? "ok" : "bad");
    $("lRedesMsg").innerHTML = msgs.join("<br>");
    return d;
  }
  $("lInsta").addEventListener("input", () => {
    const v = $("lInsta").value.trim();
    validarRedes();
    if (!v || Pedido.arroba(v)) { dados.loja.instagram = Pedido.arroba(v); mudou(); }
  });
  $("lInsta").addEventListener("blur", () => { if (dados.loja.instagram) $("lInsta").value = "@" + dados.loja.instagram; });
  $("lWhatsRodape").addEventListener("input", () => {
    const d = validarRedes();
    if (!d || d.length === 10 || d.length === 11) { dados.loja.whatsappRodape = d ? "55" + d : ""; mudou(); }
  });
  $("lWhatsRodape").addEventListener("blur", () => { $("lWhatsRodape").value = formatarWhats(dados.loja.whatsappRodape); });
  $("lRodape").addEventListener("input", () => { dados.loja.rodapeTexto = $("lRodape").value; mudou(); });

  const PAGAMENTOS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"];
  function renderPagamentos() {
    const atuais = dados.loja.pagamentos || [];
    $("lPags").innerHTML = PAGAMENTOS.map((f) => `<label class="pag"><input type="checkbox" value="${esc(f)}" ${atuais.includes(f) ? "checked" : ""}><span>${esc(f)}</span></label>`).join("");
    $("lPagOutras").value = atuais.filter((f) => !PAGAMENTOS.includes(f)).join(", ");
  }
  function lerPagamentos(avisar) {
    const marcadas = [...$("lPags").querySelectorAll("input:checked")].map((i) => i.value);
    const outras = $("lPagOutras").value.split(",").map((s) => s.trim().replace(/\s+/g, " ")).filter(Boolean);
    let lista = [...new Set([...marcadas, ...outras])];
    if (!lista.length) {
      lista = ["Pix"];
      $("lPags").querySelector('input[value="Pix"]').checked = true;
      if (avisar) toast("É necessário ao menos uma forma de pagamento", "erro");
    }
    dados.loja.pagamentos = lista;
    mudou();
  }
  $("lPags").addEventListener("change", () => lerPagamentos(true));
  $("lPagOutras").addEventListener("input", () => lerPagamentos(false));
  $("lPagOutras").addEventListener("blur", () => { if (!dados.loja.pagamentos.length) lerPagamentos(true); });

  // =====================================================
  // CONEXÃO E BACKUP
  // =====================================================
  function renderConexao() {
    $("gOwner").value = gh.owner; $("gRepo").value = gh.repo; $("gBranch").value = gh.branch;
    $("gToken").value = ""; // a chave nunca é mostrada na tela
    $("gToken").placeholder = gh.token ? "Chave salva neste aparelho (oculta)" : "github_pat_…";
    $("gRepoNome").textContent = gh.repo;
    renderAntigo();
    renderContas();
    const q = new URLSearchParams({ name: "Painel da Adega", description: `Publicar produtos no site ${gh.repo}`, target_name: gh.owner, expires_in: "none", contents: "write" });
    $("gLinkToken").href = `https://github.com/settings/personal-access-tokens/new?${q}`;
  }
  const gMsg = (t, c) => { $("gMsg").className = "hint " + (c || ""); $("gMsg").innerHTML = t; };
  $("gSalvar").onclick = async () => {
    const novo = $("gToken").value.trim();
    if (!novo) return gMsg("Cole a chave (token) primeiro.", "bad");
    const antes = gh;
    gh = { owner: $("gOwner").value.trim() || "mauriket", repo: $("gRepo").value.trim() || "adega-brasil", branch: $("gBranch").value.trim() || "main", token: novo };
    gMsg('<span class="spin"></span>Testando…');
    try {
      const repo = await api("");
      if (repo.permissions && repo.permissions.push === false) { gh = antes; return gMsg("A chave funciona, mas não tem permissão de gravação. Defina Contents como Read and write.", "bad"); }
      store.set(LS_GH, gh);
      if (!sessao) { sessao = { id: "chave", nome: "Chave do GitHub", ate: Date.now() + 864e5 }; store.set(LS_SESSAO, sessao); }
      const temContas = (cofre.contas || []).length > 0;
      gMsg(`Conectado a <b>${esc(repo.full_name)}</b>.${temContas ? " Como a chave mudou, salve de novo cada conta abaixo (com a senha de cada um) para elas usarem a chave nova." : ""}`, "ok");
      renderConexao();
      atualizarStatus();
      toast("Painel conectado");
    } catch (e) {
      gh = antes;
      gMsg(e.status === 401 ? "Chave inválida ou expirada." : e.status === 404 ? "Repositório não encontrado, ou a chave não tem acesso a ele." : "Erro: " + esc(e.message), "bad");
    }
  };
  $("gEsquecer").onclick = () => sair();

  // =====================================================
  // CONTAS DE ACESSO (e-mail + senha)
  // =====================================================
  const ARQ_CONTAS = "acesso.json";
  const sessaoValida = (offline) => !!(sessao && sessao.ate > Date.now() &&
    (offline || sessao.id === "chave" || (cofre.contas || []).some((c) => c.id === sessao.id)));
  function sair() {
    gh.token = ""; store.set(LS_GH, gh); store.del(LS_SESSAO); sessao = null;
    location.replace(location.pathname);
  }
  // Lê as contas. Com chave: pela API autenticada (sempre atual). Sem chave: arquivo público.
  async function lerCofre() {
    const vazio = { versao: 1, contas: [] };
    if (gh.token) {
      try {
        const a = await lerArquivo(ARQ_CONTAS);
        return { cofre: a ? JSON.parse(a.texto) : vazio, sha: a && a.sha };
      } catch (e) {
        if (e.status !== 401) throw e;
        gh.token = ""; store.set(LS_GH, gh); // chave revogada: segue como visitante
      }
    }
    try {
      const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${ARQ_CONTAS}?ref=${encodeURIComponent(gh.branch)}&t=${Date.now()}`, { headers: { Accept: "application/vnd.github.raw" }, cache: "no-store" });
      if (r.status === 404) return { cofre: vazio };
      if (r.ok) return { cofre: JSON.parse(await r.text()) };
    } catch {}
    const r2 = await fetch(`${ARQ_CONTAS}?t=${Date.now()}`, { cache: "no-store" });
    if (r2.status === 404) return { cofre: vazio };
    if (!r2.ok) throw new Error("sem acesso às contas");
    return { cofre: await r2.json() };
  }
  async function gravarCofre(alterar, msg) {
    const { cofre: atual, sha } = await lerCofre();
    const novo = await alterar({ versao: 1, contas: [...(atual.contas || [])] });
    await gravarArquivo(ARQ_CONTAS, b64DeTexto(JSON.stringify(novo, null, 2) + "\n"), msg, sha);
    cofre = novo;
    return novo;
  }
  function renderContas() {
    const contas = cofre.contas || [];
    $("cSessao").textContent = sessao && sessao.id !== "chave" ? `Você entrou como ${sessao.nome}. Este aparelho fica conectado por ${SESSAO_DIAS} dias ou até clicar em Sair.`
      : gh.token ? "Este aparelho está conectado pela chave do GitHub." : "";
    $("cLista2").innerHTML = contas.length ? contas.map((c) => `<div class="item conta">
        <div class="thumb">${ico("key", 20)}</div>
        <div style="min-width:0"><div class="nome">${esc(c.nome)}</div>
          <div class="sub"><span>Criada em ${esc(new Date(c.criada).toLocaleDateString("pt-BR"))}</span>${sessao && sessao.id === c.id ? '<span class="tag verde">você</span>' : ""}</div></div>
        <div></div>
        <div class="acoes"><button class="btn sm danger" type="button" data-rm="${esc(c.id)}">${ico("trash", 14)}Remover</button></div>
      </div>`).join("")
      : `<p class="hint bad">Nenhuma conta criada ainda. Crie primeiro a sua e depois a do seu parceiro. A partir da primeira conta, o painel só abre com e-mail e senha.</p>`;
  }
  const cMsg = (t, c) => { $("cMsg").className = "hint " + (c || ""); $("cMsg").textContent = t; };
  $("cSalvar").onclick = async () => {
    const nome = $("cNome").value.trim(), email = $("cEmail").value.trim(), senha = $("cSenha").value, senha2 = $("cSenha2").value;
    if (!gh.token) return cMsg("Este aparelho precisa estar conectado para criar contas.", "bad");
    if (!nome) return cMsg("Informe o nome.", "bad");
    if (!Acesso.emailValido(email)) return cMsg("E-mail inválido.", "bad");
    const p = Acesso.problemaSenha(senha); if (p) return cMsg(p, "bad");
    if (senha !== senha2) return cMsg("As duas senhas não são iguais.", "bad");
    const b = $("cSalvar"); b.disabled = true; cMsg("Criptografando e salvando…");
    try {
      const id = await Acesso.idDoEmail(email);
      let primeira = false;
      await gravarCofre(async (c) => {
        const existe = c.contas.find((x) => x.id === id);
        if (existe && !confirm(`Já existe a conta "${existe.nome}" com este e-mail. Trocar o nome e a senha dela?`)) throw new Error("cancelado");
        const nova = await Acesso.criarConta({ nome, email, senha, segredo: { token: gh.token, owner: gh.owner, repo: gh.repo, branch: gh.branch } });
        primeira = c.contas.length === 0;
        c.contas = existe ? c.contas.map((x) => (x.id === id ? nova : x)) : [...c.contas, nova];
        return c;
      }, "Atualiza contas de acesso do painel");
      if (primeira || !sessao) {
        sessao = { id, nome, ate: Date.now() + SESSAO_DIAS * 864e5 }; store.set(LS_SESSAO, sessao);
      } else if (sessao && sessao.id === id) { sessao.nome = nome; store.set(LS_SESSAO, sessao); }
      ["cNome", "cEmail", "cSenha", "cSenha2"].forEach((k) => { $(k).value = ""; });
      cMsg(`Conta de ${nome} salva. Ela já pode entrar com o e-mail e a senha.`, "ok");
      renderContas();
    } catch (e) {
      if (e.message !== "cancelado") cMsg(e.status === 401 ? "A chave deste aparelho não vale mais. Entre de novo." : "Não foi possível salvar: " + e.message, "bad");
      else cMsg("");
    } finally { b.disabled = false; }
  };
  $("cLista2").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-rm]"); if (!b) return;
    const conta = (cofre.contas || []).find((c) => c.id === b.dataset.rm); if (!conta) return;
    const ultima = cofre.contas.length === 1;
    if (!confirm(ultima
      ? `Remover "${conta.nome}", a última conta? Sem contas, o painel volta a abrir só pela chave do GitHub.`
      : `Remover a conta "${conta.nome}"? Essa pessoa não vai mais conseguir entrar.`)) return;
    b.disabled = true;
    try {
      await gravarCofre((c) => { c.contas = c.contas.filter((x) => x.id !== conta.id); return c; }, "Remove conta de acesso do painel");
      toast(`Conta de ${conta.nome} removida`);
      if (sessao && sessao.id === conta.id) return sair();
      renderContas();
    } catch (err) { toast("Não foi possível remover: " + err.message, "erro"); b.disabled = false; }
  });
  $("cSair").onclick = () => { if (confirm("Sair do painel neste aparelho?")) sair(); };

  // ---------- Tela de login ----------
  function pedirLogin(info) {
    return new Promise((resolve) => {
      $("login").hidden = false;
      document.documentElement.classList.add("com-login");
      $("skeleton").classList.add("fora");
      if (info) { $("loginInfo").textContent = info; $("loginAvancado").open = true; }
      setTimeout(() => $(info ? "loginToken" : "loginEmail").focus(), 50);
      let falhas = 0;
      const pronto = () => {
        $("login").hidden = true; document.documentElement.classList.remove("com-login");
        $("loginSenha").value = ""; $("loginToken").value = ""; $("skeleton").classList.remove("fora");
        resolve();
      };
      $("loginForm").onsubmit = async (ev) => {
        ev.preventDefault();
        const btn = $("loginBtn"); if (btn.disabled) return;
        btn.disabled = true; $("loginErro").textContent = ""; btn.lastChild.textContent = "Verificando…";
        try {
          const { conta, segredo } = await Acesso.entrar(cofre, $("loginEmail").value, $("loginSenha").value);
          gh = { owner: segredo.owner || gh.owner, repo: segredo.repo || gh.repo, branch: segredo.branch || gh.branch, token: segredo.token };
          store.set(LS_GH, gh);
          sessao = { id: conta.id, nome: conta.nome, ate: Date.now() + SESSAO_DIAS * 864e5 }; store.set(LS_SESSAO, sessao);
          pronto();
        } catch (err) {
          falhas++;
          $("loginErro").textContent = err.message;
          $("loginSenha").value = ""; $("loginSenha").focus();
          await new Promise((r) => setTimeout(r, Math.min(falhas, 5) * 1000)); // espera cresce a cada erro
        } finally { btn.disabled = false; btn.lastChild.textContent = "Entrar"; }
      };
      $("loginTokenBtn").onclick = async () => {
        const t = $("loginToken").value.trim(); if (!t) return;
        const b = $("loginTokenBtn"); b.disabled = true; $("loginErro").textContent = "";
        const antes = gh.token; gh.token = t;
        try {
          const repo = await api("");
          if (repo.permissions && repo.permissions.push === false) throw Object.assign(new Error("sem permissão de gravação"), { status: 403 });
          store.set(LS_GH, gh);
          sessao = { id: "chave", nome: "Chave do GitHub", ate: Date.now() + 864e5 }; store.set(LS_SESSAO, sessao);
          pronto();
        } catch (err) {
          gh.token = antes;
          $("loginErro").textContent = err.status === 401 ? "Chave inválida ou expirada." : err.status === 403 ? "A chave não tem permissão de gravação." : "Não foi possível conferir a chave.";
        } finally { b.disabled = false; }
      };
    });
  }
  // Porteiro: decide se o painel abre direto, pede login ou é a primeira configuração
  async function portaria() {
    let lido = null;
    try { lido = await lerCofre(); } catch { lido = null; }
    if (!lido) {
      if (gh.token && sessaoValida(true)) return; // sem internet agora: mantém a sessão deste aparelho
      gh.token = ""; store.set(LS_GH, gh);
      return pedirLogin("Não foi possível verificar o acesso agora. Confira a internet ou entre com a chave do GitHub.");
    }
    cofre = lido.cofre && Array.isArray(lido.cofre.contas) ? lido.cofre : { versao: 1, contas: [] };
    const temContas = cofre.contas.length > 0;
    if (gh.token && sessaoValida()) return;              // sessão válida neste aparelho
    if (gh.token && !temContas) return;                  // primeira configuração: entra para criar as contas
    gh.token = ""; store.set(LS_GH, gh); store.del(LS_SESSAO); sessao = null;
    return pedirLogin(temContas ? "" : "Ainda não há contas. Entre com a chave do GitHub para criar as contas de acesso.");
  }
  $("gBaixar").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([gerarDataJs(dados)], { type: "text/javascript" }));
    a.download = `backup-catalogo-${Promo.ymd(new Date())}.js`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $("gImportar").addEventListener("change", async (e) => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    try {
      const d = parseDataJs(await f.text());
      if (!d || !Array.isArray(d.produtos) || !Array.isArray(d.categorias) || !d.loja || !d.frete) throw new Error("formato");
      Pedido.normalizar(d);
      if (!confirm(`Importar backup com ${plural(d.produtos.length, "produto", "produtos")} e ${plural(d.promocoes.length, "promoção", "promoções")}? Os dados atuais do painel serão substituídos (o site só muda ao publicar).`)) return;
      dados = d;
      mudou(); abrirAba("inicio"); toast("Backup importado. Confira e clique em Publicar.", null, 4000);
    } catch {
      toast("Arquivo inválido. Use um backup baixado por este painel.", "erro", 4000);
    }
  });
  // ---------- Histórico de publicações (cada Publicar fica guardado no GitHub) ----------
  async function lerApi(path) {
    if (gh.token) return api(path);
    const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/${path}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) { const e = new Error(String(r.status)); e.status = r.status; throw e; }
    return r.json();
  }
  const quando = (iso) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  $("hCarregar").onclick = async () => {
    const b = $("hCarregar"); b.disabled = true;
    $("hLista").innerHTML = '<p class="hint"><span class="spin"></span>Carregando…</p>';
    try {
      const commits = await lerApi(`commits?path=data.js&sha=${encodeURIComponent(gh.branch)}&per_page=30`);
      $("hLista").innerHTML = commits.map((c, i) => `<div class="hist-item">
          <div><b>${esc(quando(c.commit.author.date))}</b>${i === 0 ? ' <span class="tag verde">no site agora</span>' : ""}<small>${esc(c.commit.message.split("\n")[0])}</small></div>
          ${i === 0 ? "" : `<button class="btn ghost sm" data-sha="${esc(c.sha)}" data-quando="${esc(quando(c.commit.author.date))}">Carregar esta versão</button>`}
        </div>`).join("") || '<p class="hint">Nenhuma publicação encontrada.</p>';
    } catch (e) {
      $("hLista").innerHTML = `<p class="hint bad">Não foi possível carregar o histórico${e.status === 403 ? " (limite do GitHub, tente em alguns minutos)" : ""}.</p>`;
    } finally { b.disabled = false; }
  };
  $("hLista").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-sha]"); if (!b) return;
    b.disabled = true;
    try {
      const arq = await lerApi(`contents/data.js?ref=${b.dataset.sha}`);
      const d = Pedido.normalizar(parseDataJs(textoDeB64(arq.content)));
      if (!d || !Array.isArray(d.produtos)) throw new Error("formato");
      if (!confirm(`Carregar a versão de ${b.dataset.quando}? Ela tem ${plural(d.produtos.length, "produto", "produtos")} (o painel hoje tem ${dados.produtos.length}). O site só muda quando você clicar em Publicar.`)) return;
      dados = d; mudou(); abrirAba("produtos");
      toast(`Versão de ${b.dataset.quando} carregada. Confira e clique em Publicar.`, null, 5000);
    } catch { toast("Não foi possível carregar esta versão.", "erro"); }
    finally { b.disabled = false; }
  });
  function renderAntigo() {
    const a = store.get(LS_DRAFT_ANTIGO, null);
    $("hAntigo").hidden = !(a && a.dados);
    if (!a || !a.dados) return;
    $("hAntigoTxt").textContent = `Este aparelho tinha alterações antigas não publicadas (${plural((a.dados.produtos || []).length, "produto", "produtos")}), guardadas em ${quando(a.guardadoEm || Date.now())}. Elas não alteram o site. Se precisar de algo delas, baixe e use "Importar backup".`;
  }
  $("hAntigoBaixar").onclick = () => {
    const a = store.get(LS_DRAFT_ANTIGO, null); if (!a) return;
    const l = document.createElement("a");
    l.href = URL.createObjectURL(new Blob([gerarDataJs(a.dados)], { type: "text/javascript" }));
    l.download = `rascunho-antigo-${Promo.ymd(new Date(a.guardadoEm || Date.now()))}.js`;
    l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 2000);
  };
  $("hAntigoApagar").onclick = () => {
    if (!confirm("Apagar o rascunho antigo deste aparelho? O site não muda.")) return;
    store.del(LS_DRAFT_ANTIGO); renderAntigo(); toast("Rascunho antigo apagado");
  };

  $("gDescartar").onclick = () => {
    if (!confirm("Descartar todas as alterações que ainda não foram publicadas?")) return;
    store.del(LS_DRAFT); pendentes = {}; publicado = JSON.stringify(dados); location.reload();
  };

  // =====================================================
  // PUBLICAR
  // =====================================================
  async function publicar() {
    if (!gh.token) { abrirAba("conexao"); return toast("Conecte o painel ao site para publicar.", "erro", 3200); }
    if (!temMudancas()) return toast("Não há alterações para publicar.");
    const btn = $("btnPublicar"); btn.disabled = true;
    const status = (t) => { $("statusTxt").textContent = t; };
    try {
      const usadas = new Set(dados.produtos.map((p) => p.imagem).filter(Boolean));
      const imgs = Object.entries(pendentes).filter(([path]) => usadas.has(path));
      for (let i = 0; i < imgs.length; i++) {
        const [path, dataUrl] = imgs[i];
        status(`Enviando foto ${i + 1} de ${imgs.length}…`);
        await gravarArquivo(path, dataUrl.split(",")[1], `Foto de produto (${path})`);
        cacheImgs[path] = dataUrl;
        delete pendentes[path];
      }
      pendentes = {};
      status("Salvando…");
      // Lê o que está publicado agora. Se outro aparelho publicou depois, junta (nunca substitui).
      let juntou = false, enviado = null;
      for (let tentativa = 0; tentativa < 3 && !enviado; tentativa++) {
        const atual = await lerArquivo("data.js");
        let enviar = dados, remoto = null;
        if (atual) {
          try { remoto = Pedido.normalizar(parseDataJs(atual.texto)); } catch { remoto = null; }
          if (remoto && JSON.stringify(remoto) !== publicado) {
            enviar = Pedido.normalizar(Mescla.mesclar(JSON.parse(publicado), dados, remoto));
            juntou = true;
          }
        }
        // Trava: publicação que tira muitos produtos do site pede confirmação
        if (remoto) {
          const antes = remoto.produtos.length, depois = enviar.produtos.length;
          if (antes - depois >= 5 && !confirm(`Atenção: o site tem ${antes} produtos e ficará com ${depois} (${antes - depois} serão removidos). Publicar mesmo assim?`)) {
            throw new Error("cancelado");
          }
        }
        try {
          await gravarArquivo("data.js", b64DeTexto(gerarDataJs(enviar)), "Atualiza catálogo pelo painel admin", atual && atual.sha);
          enviado = enviar;
        } catch (e) {
          if (e.status !== 409 && e.status !== 422) throw e; // outro aparelho publicou neste instante: tenta de novo
          status("Juntando com outro aparelho…");
        }
      }
      if (!enviado) throw new Error("o site está sendo alterado em outro aparelho. Tente de novo em instantes.");
      dados = enviado;
      publicado = JSON.stringify(enviado);
      store.del(LS_DRAFT);
      if (juntou) { renderKpis(); RENDER[abaAtual](); }
      toast(juntou ? "Publicado e juntado com as alterações feitas em outro aparelho." : "Publicado. Os clientes veem a atualização ao recarregar o site.", null, 4500);
    } catch (e) {
      mudou();
      if (e.message !== "cancelado") toast(e.status === 401 ? "Chave inválida. Verifique a conexão." : "Erro ao publicar: " + e.message, "erro", 5000);
    } finally {
      btn.disabled = false;
      atualizarStatus();
    }
  }
  $("btnPublicar").onclick = publicar;

  // Mantém o painel em dia quando outro aparelho publica (junta, nunca apaga)
  let sincronizando = false;
  async function sincronizar() {
    if (sincronizando || !dados || !gh.token || document.hidden || modalAberto || $("btnPublicar").disabled) return;
    sincronizando = true;
    try {
      const atual = await lerArquivo("data.js"); if (!atual) return;
      const remoto = Pedido.normalizar(parseDataJs(atual.texto)), s = JSON.stringify(remoto);
      if (s === publicado || modalAberto) return;
      dados = temMudancas() ? Pedido.normalizar(Mescla.mesclar(JSON.parse(publicado), dados, remoto)) : clone(remoto);
      publicado = s;
      if (temMudancas()) mudou(); else store.del(LS_DRAFT);
      atualizarStatus(); renderKpis(); RENDER[abaAtual]();
      toast("Atualizado com o que foi publicado em outro aparelho.");
    } catch { /* sem internet: tenta de novo depois */ } finally { sincronizando = false; }
  }
  document.addEventListener("visibilitychange", sincronizar);
  setInterval(sincronizar, 90000);

  // Promoções com horário mudam de status sozinhas
  setInterval(() => { if (!dados || modalAberto) return; if (abaAtual === "promocoes") renderPromos(); else if (abaAtual === "inicio") renderInicio(); }, 60000);

  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================
  async function iniciar() {
    let base = window.DADOS ? clone(window.DADOS) : null;
    if (gh.token) { try { const arq = await lerArquivo("data.js"); if (arq) base = parseDataJs(arq.texto); } catch {} }
    else {
      try {
        const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/data.js?ref=${gh.branch}&t=${Date.now()}`, { headers: { Accept: "application/vnd.github.raw" } });
        if (r.ok) base = parseDataJs(await r.text());
      } catch {}
    }
    if (!base) { $("statusTxt").textContent = "Erro ao carregar os dados"; $("skeleton").classList.add("fora"); return; }
    Pedido.normalizar(base);
    publicado = JSON.stringify(base);
    dados = clone(base);

    const rasc = store.get(LS_DRAFT, null);
    if (rasc && rasc.dados) {
      const r = Pedido.normalizar(rasc.dados);
      const temAlgo = JSON.stringify(r) !== publicado || Object.keys(rasc.pendentes || {}).length;
      if (rasc.base && temAlgo) {
        pendentes = rasc.pendentes || {};
        if (rasc.base === publicado) {
          dados = r; // ninguém publicou desde então: continua de onde parou
          setTimeout(() => toast("Continuando de onde você parou"), 400);
        } else {
          // outro aparelho publicou depois: junta as alterações deste aparelho com as do site
          dados = Pedido.normalizar(Mescla.mesclar(Pedido.normalizar(JSON.parse(rasc.base)), r, clone(base)));
          mudou();
          setTimeout(() => toast("Suas alterações não publicadas foram juntadas com as do outro aparelho.", null, 4500), 400);
        }
      } else if (temAlgo) {
        // rascunho antigo (de antes desta proteção): não sabemos em que versão se baseia,
        // então ele NÃO substitui o site. Fica guardado à parte em Conexão e backup.
        store.set(LS_DRAFT_ANTIGO, { ...rasc, guardadoEm: Date.now() });
        store.del(LS_DRAFT);
        setTimeout(() => toast("Havia um rascunho antigo neste aparelho. Ele foi guardado à parte e não altera o site.", null, 5000), 400);
      } else store.del(LS_DRAFT);
    }
    atualizarStatus();
    if (gh.token && !(cofre.contas || []).length) {
      // primeira configuração: leva direto para criar as contas
      abrirAba("conexao");
      setTimeout(() => toast("Crie as contas de acesso (a sua e a do seu parceiro). Depois disso o painel só abre com e-mail e senha.", null, 8000), 500);
    } else abrirAba(location.hash.slice(1));
    setTimeout(moverPill, 300);
    if (document.fonts) document.fonts.ready.then(moverPill);
    $("skeleton").classList.add("fora");
    setTimeout(() => $("skeleton").remove(), 600);
  }
  portaria().then(iniciar);
})();
