(() => {
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
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

  // ---------- Ícones (SVG de linha 24×24) ----------
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    truck: '<path d="M1 4h14v12H1zM15 9h4l4 4v3h-8z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z"/>',
    layers: '<path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
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
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    fire: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/>',
  };
  const ico = (n, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ""}</svg>`;
  const pintarIcones = (raiz = document) => $$("[data-ico]", raiz).forEach((el) => {
    if (!el.dataset.feito) { el.insertAdjacentHTML("afterbegin", ico(el.dataset.ico, el.dataset.icoSize || 18)); el.dataset.feito = 1; }
  });
  pintarIcones();

  // Foto recém-publicada ainda não chegou no Pages? Busca direto no GitHub.
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.r) return;
    const caminho = (img.getAttribute("src") || "").split("?")[0];
    if (!/^img\/produtos\//.test(caminho)) return;
    img.dataset.r = "1";
    img.src = `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${caminho}`;
  }, true);

  // ---------- Tema ----------
  function aplicarTema(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("adega_admin_tema", t); } catch {}
    const b = document.querySelector('[data-acao="tema"]');
    b.innerHTML = ico(t === "dark" ? "sun" : "moon");
  }
  aplicarTema(document.documentElement.dataset.theme || "dark");

  // ---------- Estado ----------
  const LS_DRAFT = "adega_admin_rascunho";
  const LS_GH = "adega_admin_github";
  let gh = Object.assign({ owner: "mauriket", repo: "adega-brasil", branch: "main", token: "" }, store.get(LS_GH, {}));
  let dados = null, publicado = "", pendentes = {};
  const cacheImgs = {};
  let abaAtual = "inicio";

  const srcImg = (p) => pendentes[p] || cacheImgs[p] || p;
  const thumb = (p, cls = "ic") => `<span class="${cls}">${p && p.imagem ? `<img src="${esc(srcImg(p.imagem))}" alt="">` : esc((p && p.emoji) || "🍾")}</span>`;
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

  // ---------- Toast ----------
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
  function mudou() {
    if (!store.set(LS_DRAFT, { dados, pendentes })) store.set(LS_DRAFT, { dados, pendentes: {} });
    atualizarStatus();
  }
  function atualizarStatus() {
    const s = $("status"), txt = $("statusTxt"), sujo = temMudancas();
    s.className = "status " + (sujo ? "sujo" : gh.token ? "ok" : "off");
    txt.textContent = sujo ? "Não publicado" : gh.token ? "Tudo publicado" : "Sem conexão";
    $("pubDot").hidden = !sujo;
    $("btnPublicar").classList.toggle("pulsar", sujo && !!gh.token);
    $("avisoConexao").hidden = !!gh.token;
    $("dkConexao").classList.toggle("alerta", !gh.token);
    if (abaAtual === "inicio") renderPublicacao();
  }
  window.addEventListener("beforeunload", (e) => { if (temMudancas() && gh.token) { e.preventDefault(); e.returnValue = ""; } });

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
  const TITULOS = { inicio: "Olá! 👋", produtos: "Produtos", promocoes: "Promoções", categorias: "Categorias", frete: "Frete por KM", loja: "Loja e WhatsApp", conexao: "Conexão" };

  function moverPill() {
    const b = $$("#nav button").find((x) => x.dataset.tab === abaAtual);
    const pill = $("navPill");
    if (!b) { pill.style.width = "0px"; return; }
    pill.style.width = b.offsetWidth + "px";
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  window.addEventListener("resize", moverPill);
  // a fonte pode carregar depois: reposiciona a cápsula sempre que os botões mudarem de tamanho
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(() => moverPill()); $$("#nav button").forEach((b) => ro.observe(b)); }

  let abaSeq = 0;
  async function abrirAba(nome) {
    const seq = ++abaSeq;
    const velha = $$(".tab").find((s) => !s.hidden);
    const trocou = !velha || velha.id !== "tab-" + nome;
    abaAtual = nome;
    $$("#nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === nome));
    moverPill();
    if (trocou && velha) { await Motion.sairAba(velha); if (seq !== abaSeq) return; }
    $$(".tab").forEach((s) => { s.hidden = s.id !== "tab-" + nome; });
    if (trocou) Motion.entrarAba($("tab-" + nome));
    const t = TITULOS[nome] || nome;
    $("titulo").innerHTML = [...t].map((ch, i) => ch === " " ? " " : `<span class="l" style="animation-delay:${i * 28}ms">${esc(ch)}</span>`).join("");
    renderKpis();
    ({ inicio: renderInicio, produtos: renderProdutos, promocoes: renderPromos, categorias: renderCategorias, frete: renderFrete, loja: renderLoja, conexao: renderConexao })[nome]?.();
    if (location.hash !== "#" + nome) history.replaceState(null, "", "#" + nome);
    if (trocou) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("nav").addEventListener("click", (e) => { const b = e.target.closest("button[data-tab]"); if (b) abrirAba(b.dataset.tab); });

  // Ações e atalhos (dock, tiles, botões com data-acao / data-go)
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { e.preventDefault(); abrirAba(go.dataset.go); return; }
    const a = e.target.closest("[data-acao]");
    if (!a) return;
    const acao = a.dataset.acao;
    if (acao === "novoProduto") abrirProduto(null);
    if (acao === "novaPromo") abrirPromo(null);
    if (acao === "conexao") abrirAba("conexao");
    if (acao === "tema") aplicarTema(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    if (acao === "buscar") { abrirAba("produtos"); setTimeout(() => $("pBusca").focus(), 80); }
  });

  // ---------- KPIs com contagem animada ----------
  function contar(el, alvo) {
    const ini = performance.now(), dur = 700;
    const passo = (t) => {
      const k = Math.max(0, Math.min(1, (t - ini) / dur));
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }
  function renderKpis() {
    const P = dados.produtos, PR = dados.promocoes;
    const ativas = PR.filter((p) => Promo.status(p) === "ativa").length;
    const mapa = {
      inicio: [["box", "Produtos no site", P.filter((p) => p.ativo !== false).length], ["percent", "Promoções ativas", ativas], ["star", "Destaques", P.filter((p) => p.destaque).length]],
      produtos: [["box", "Total", P.length], ["eye", "No site", P.filter((p) => p.ativo !== false).length], ["star", "Destaques", P.filter((p) => p.destaque).length]],
      promocoes: [["fire", "Ativas agora", ativas], ["calendar", "Agendadas", PR.filter((p) => ["agendada", "foraHorario"].includes(Promo.status(p))).length], ["tag", "Total", PR.length]],
      categorias: [["layers", "Categorias", dados.categorias.length], ["box", "Produtos", P.length]],
    }[abaAtual] || [];
    $("kpis").innerHTML = mapa.map(([ic, lbl, v], i) => `<div class="kpi" style="animation-delay:${i * 60}ms"><span class="ic">${ico(ic, 16)}</span><div><dt>${lbl}</dt><dd data-n="${v}">0</dd></div></div>`).join("");
    $$("#kpis dd").forEach((dd) => contar(dd, Number(dd.dataset.n)));
  }

  // =====================================================
  // INÍCIO
  // =====================================================
  function renderPublicacao() {
    const sujo = temMudancas();
    const nImg = Object.keys(pendentes).length;
    let html;
    if (!gh.token) {
      html = `<div class="pub-box"><div class="big">⚠️ <b>Painel ainda não conectado.</b> O que você muda aqui fica só neste aparelho — o catálogo dos clientes não muda.</div>
        <div class="help">Enquanto isso, abra o site <b>neste mesmo aparelho</b> para ver uma prévia das suas mudanças.</div>
        <div class="row"><button class="btn accent" data-acao="conexao">${ico("key")}Conectar agora</button><a class="btn ghost" href="index.html" target="_blank">${ico("eye")}Ver prévia</a></div></div>`;
    } else if (sujo) {
      html = `<div class="pub-box"><div class="big">Você tem <b>alterações não publicadas</b>${nImg ? ` (incluindo ${nImg} imagem${nImg > 1 ? "s" : ""})` : ""}.</div>
        <div class="help">Clique em Publicar para mandar para o site. Aparece para os clientes na hora (é só atualizar a página).</div>
        <div class="row"><button class="btn accent" id="pubAgora">${ico("send")}Publicar agora</button><a class="btn ghost" href="index.html" target="_blank">${ico("eye")}Ver prévia</a></div></div>`;
    } else {
      html = `<div class="pub-box"><div class="big">✅ <b>Tudo publicado.</b> O site está igual ao painel.</div>
        <div class="row"><a class="btn ghost" href="index.html" target="_blank">${ico("eye")}Abrir o site</a></div></div>`;
    }
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
      : vazio("percent", "Nenhuma promoção ativa agora", "Crie uma promoção para aparecer no site.", `<button class="btn accent sm" data-acao="novaPromo">${ico("plus")}Nova promoção</button>`);
    const dest = dados.produtos.filter((p) => p.destaque);
    $("inicioDest").innerHTML = dest.length
      ? `<div class="dest-row">${dest.map((p) => `<div class="mini-item" data-prod="${p.id}">${thumb(p)}<div><b>${esc(p.nome)}</b><small>${brl(p.preco)}</small></div></div>`).join("")}</div>`
      : vazio("star", "Nenhum destaque", "Marque a ⭐ em um produto para ele aparecer em destaque.");
    tickContagens();
  }
  $("inicioPromos").addEventListener("click", (e) => { const m = e.target.closest("[data-promo]"); if (m) abrirPromo(Number(m.dataset.promo)); });
  $("inicioDest").addEventListener("click", (e) => { const m = e.target.closest("[data-prod]"); if (m) abrirProduto(Number(m.dataset.prod)); });

  function vazio(ic, titulo, txt, acao = "") {
    return `<div class="vazio">${ico(ic, 34)}<b>${titulo}</b>${txt}${acao ? `<div style="margin-top:12px">${acao}</div>` : ""}</div>`;
  }

  function tickContagens() {
    const agora = Date.now();
    $$("[data-fim]").forEach((el) => {
      const s = Math.max(0, Math.floor((Number(el.dataset.fim) - agora) / 1000));
      const h = Math.floor(s / 3600), pad = (n) => String(n).padStart(2, "0");
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
      ["__dest", "⭐ Destaques", P.filter((p) => p.destaque).length],
      ["__promo", "🏷️ Em promoção", P.filter((p) => Promo.ativasDo(p, dados.promocoes).length).length],
      ["__off", "Escondidos", P.filter((p) => p.ativo === false).length]];
    $("pChips").innerHTML = chips.map(([v, l, n]) => `<button class="chip ${v === pFiltro ? "on" : ""}" data-f="${esc(v)}">${esc(l)} <em>${n}</em></button>`).join("");

    const termo = norm($("pBusca").value);
    const lista = P.filter((p) => {
      if (termo && !norm(p.nome).includes(termo)) return false;
      if (pFiltro === "__dest") return p.destaque;
      if (pFiltro === "__promo") return Promo.ativasDo(p, dados.promocoes).length > 0;
      if (pFiltro === "__off") return p.ativo === false;
      if (pFiltro) return p.categoria === pFiltro;
      return true;
    });
    $("pLista").innerHTML = lista.length ? lista.map((p, i) => {
      const v = Promo.vitrine(p, dados.promocoes);
      const promos = dados.promocoes.filter((pr) => Promo.aplicaA(pr, p) && !["encerrada"].includes(Promo.status(pr)));
      return `<div class="item ${p.ativo === false ? "off" : ""}" data-key="p${p.id}" style="animation-delay:${Math.min(i, 14) * 22}ms">
        <div class="thumb">${p.imagem ? `<img src="${esc(srcImg(p.imagem))}" alt="">` : esc(p.emoji || "🍾")}</div>
        <div style="min-width:0"><div class="nome">${esc(p.nome)}</div>
          <div class="sub"><span>${esc(p.categoria)}</span>${promos.map((pr) => `<span class="tag ${Promo.status(pr) === "ativa" ? "ouro" : ""}">🏷️ ${esc(Promo.selo(pr, p.preco) || pr.nome)}</span>`).join("")}${p.ativo === false ? '<span class="tag vermelho">escondido</span>' : ""}</div></div>
        <div class="preco ${v.preco < v.cheio ? "promo" : ""}">${v.preco < v.cheio ? `<s>${brl(v.cheio)}</s>${brl(v.preco)}` : brl(p.preco)}</div>
        <div class="acoes">
          <button class="circ sm ${p.destaque ? "on" : ""}" data-a="destaque" data-id="${p.id}" title="Destaque">${ico("star", 15)}</button>
          <button class="circ sm ${p.ativo !== false ? "on" : ""}" data-a="ativo" data-id="${p.id}" title="Aparece no site">${ico("eye", 15)}</button>
          <button class="circ sm" data-a="promo" data-id="${p.id}" title="Criar promoção">${ico("percent", 15)}</button>
          <button class="circ sm" data-a="editar" data-id="${p.id}" title="Editar">${ico("edit", 15)}</button>
          <button class="circ sm del" data-a="excluir" data-id="${p.id}" title="Excluir">${ico("trash", 15)}</button>
        </div></div>`;
    }).join("") : vazio("search", "Nenhum produto encontrado", "Tente outra busca ou filtro.");
  }
  $("pBusca").addEventListener("input", renderProdutos);
  $("pChips").addEventListener("click", (e) => { const c = e.target.closest("[data-f]"); if (c) { pFiltro = c.dataset.f; Motion.flip($("pLista"), renderProdutos); } });
  $("pLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const p = dados.produtos.find((x) => x.id === Number(b.dataset.id)); if (!p) return;
    const a = b.dataset.a;
    if (a === "editar") return abrirProduto(p.id);
    if (a === "promo") return abrirPromo(null, { aplicaEm: "produtos", produtos: [p.id], nome: "Promoção " + p.nome });
    if (a === "excluir") {
      if (!confirm(`Excluir "${p.nome}"?`)) return;
      Motion.sair(b.closest(".item")).then(() => {
        dados.produtos = dados.produtos.filter((x) => x !== p);
        dados.promocoes.forEach((pr) => { pr.produtos = (pr.produtos || []).filter((id) => id !== p.id); });
        if (p.imagem && pendentes[p.imagem]) delete pendentes[p.imagem];
        mudou(); renderProdutos(); renderKpis();
        toast("Produto excluído");
      });
      return;
    }
    if (a === "ativo") { p.ativo = p.ativo === false; toast(p.ativo ? "Produto aparece no site" : "Produto escondido do site"); }
    if (a === "destaque") { p.destaque = !p.destaque; toast(p.destaque ? "⭐ Em destaque" : "Saiu dos destaques"); }
    mudou(); renderProdutos(); renderKpis();
  });

  // ---------- Modais (genérico) ----------
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
  function abrirProduto(id) {
    editId = id; fotoNova = null; fotoRemovida = false;
    const p = id != null ? dados.produtos.find((x) => x.id === id) : null;
    $("mTitulo").textContent = p ? "Editar produto" : "Novo produto";
    $("mCategoria").innerHTML = dados.categorias.map((c) => `<option>${esc(c)}</option>`).join("");
    $("mNome").value = p ? p.nome : "";
    $("mCategoria").value = p ? p.categoria : (dados.categorias.includes(pFiltro) ? pFiltro : dados.categorias[0]);
    $("mEmoji").value = p ? p.emoji || "" : "🍺";
    $("mPreco").value = p ? p.preco : "";
    $("mDesc").value = p ? p.descricao || "" : "";
    $("mDestaque").checked = p ? !!p.destaque : false;
    $("mAtivo").checked = p ? p.ativo !== false : true;
    $("mErro").textContent = "";
    previewFoto(p && p.imagem ? srcImg(p.imagem) : null);
    const promos = p ? dados.promocoes.filter((pr) => Promo.aplicaA(pr, p)) : [];
    $("mPromos").innerHTML = p ? `<h3>Promoções deste produto</h3>${promos.map((pr) => `<div class="mini-item" data-promo="${pr.id}"><span class="ic">${ico("percent", 16)}</span><div><b>${esc(pr.nome)}</b><small>${esc(Promo.descricao(pr))} · ${statusTxt(pr).txt}</small></div></div>`).join("")}
      <button class="btn ghost sm" id="mNovaPromo">${ico("plus")}Criar promoção para este produto</button>` : "";
    const np = $("mNovaPromo");
    if (np) np.onclick = () => { fecharModal(); abrirPromo(null, { aplicaEm: "produtos", produtos: [p.id], nome: "Promoção " + p.nome }); };
    abrirModal("mProduto");
    setTimeout(() => $("mNome").focus(), 60);
  }
  $("mPromos").addEventListener("click", (e) => { const m = e.target.closest("[data-promo]"); if (m) { fecharModal(); abrirPromo(Number(m.dataset.promo)); } });
  function previewFoto(src) {
    $("mFotoPrev").innerHTML = src ? `<img src="${esc(src)}" alt="">` : esc($("mEmoji").value || "🍾");
    $("mFotoRemover").hidden = !src;
  }
  $("mEmoji").addEventListener("input", () => { if (!$("mFotoPrev").querySelector("img")) previewFoto(null); });
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
    catch { toast("Não consegui abrir essa imagem. Use JPG ou PNG.", "erro"); }
  });
  $("mFotoRemover").onclick = () => { fotoNova = null; fotoRemovida = true; $("mFoto").value = ""; previewFoto(null); };
  $("mSalvar").onclick = () => {
    const nome = $("mNome").value.trim(), preco = num($("mPreco").value);
    if (!nome) return ($("mErro").textContent = "Digite o nome do produto.");
    if (preco <= 0) return ($("mErro").textContent = "Digite um preço maior que zero.");
    let p = editId != null ? dados.produtos.find((x) => x.id === editId) : null;
    if (!p) { p = { id: dados.produtos.reduce((m, x) => Math.max(m, x.id), 0) + 1, imagem: "" }; dados.produtos.push(p); }
    Object.assign(p, {
      nome, preco, categoria: $("mCategoria").value, emoji: $("mEmoji").value.trim() || "🍾",
      descricao: $("mDesc").value.trim(), destaque: $("mDestaque").checked, ativo: $("mAtivo").checked,
    });
    if (fotoNova || fotoRemovida) { if (p.imagem && pendentes[p.imagem]) delete pendentes[p.imagem]; p.imagem = ""; }
    if (fotoNova) { p.imagem = `img/produtos/p${p.id}-${Date.now()}.jpg`; pendentes[p.imagem] = fotoNova; }
    fecharModal(); mudou();
    if (abaAtual === "produtos") renderProdutos(); else abrirAba(abaAtual);
    renderKpis();
    toast(editId != null ? "Produto atualizado ✓" : "Produto adicionado ✓");
  };

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
  const statusTxt = (pr) => STATUS[Promo.status(pr)];

  function alvoTxt(pr) {
    if (pr.aplicaEm === "todos") return "Loja toda";
    if (pr.aplicaEm === "categoria") return "Categoria " + (pr.categoria || "—");
    const ids = pr.produtos || [];
    if (ids.length === 1) { const p = dados.produtos.find((x) => x.id === ids[0]); return p ? p.nome : "1 produto"; }
    return `${ids.length} produtos`;
  }
  function quandoTxt(pr) {
    const partes = [];
    if (pr.inicio && pr.fim) partes.push(`${dataBR(pr.inicio)} a ${dataBR(pr.fim)}`);
    else if (pr.inicio) partes.push(`a partir de ${dataBR(pr.inicio)}`);
    else if (pr.fim) partes.push(`até ${dataBR(pr.fim)}`);
    if (pr.dias && pr.dias.length && pr.dias.length < 7) partes.push([...pr.dias].sort().map((d) => Promo.DIAS[d]).join(", "));
    if (pr.horaInicio || pr.horaFim) partes.push(`${pr.horaInicio || "00:00"}–${pr.horaFim || "24:00"}`);
    return partes.length ? partes.join(" · ") : "Sempre";
  }
  const VITRINE = { promoDia: "🔥 Promoção do dia", ofertas: "💥 Ofertas", nenhuma: "Só selo" };

  let prFiltro = "";
  function renderPromos() {
    const PR = dados.promocoes, agora = new Date();
    const cont = (s) => PR.filter((p) => Promo.status(p, agora) === s).length;
    const chips = [["", "Todas", PR.length], ["ativa", "Ativas agora", cont("ativa")], ["agendada", "Agendadas", cont("agendada") + cont("foraHorario")], ["pausada", "Pausadas", cont("pausada")], ["encerrada", "Encerradas", cont("encerrada")]];
    $("prChips").innerHTML = chips.map(([v, l, n]) => `<button class="chip ${v === prFiltro ? "on" : ""}" data-f="${v}">${l} <em>${n}</em></button>`).join("");
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
      return `<article class="card pcard st-${st}" data-id="${pr.id}" style="animation-delay:${Math.min(i, 10) * 40}ms">
        <div class="topo"><h3>${esc(pr.nome)}</h3><span class="tag ${S.cor}">${S.txt}</span></div>
        <div class="regra">${esc(Promo.descricao(pr))}</div>
        <div class="meta">
          <div>${ico("box", 14)}${esc(alvoTxt(pr))}</div>
          <div>${ico("clock", 14)}${esc(quandoTxt(pr))}</div>
          <div>${ico("eye", 14)}${VITRINE[pr.vitrine] || ""}${n(pr.limite) ? ` · máx. ${n(pr.limite)} un./pedido` : ""}</div>
        </div>
        <div class="pe">
          <div>${selo ? `<span class="selo-prev">${esc(selo)}</span>` : ""}${fim ? ` <small class="contagem" data-fim="${fim.getTime()}"></small>` : ""}</div>
          <div class="acoes">
            <button class="circ sm" data-a="pausar" title="${pr.ativa === false ? "Ligar" : "Pausar"}">${ico(pr.ativa === false ? "play" : "pause", 14)}</button>
            <button class="circ sm" data-a="duplicar" title="Duplicar">${ico("copy", 14)}</button>
            <button class="circ sm del" data-a="excluir" title="Excluir">${ico("trash", 14)}</button>
          </div>
        </div></article>`;
    }).join("") : `<div class="card" style="grid-column:1/-1">${vazio("percent", PR.length ? "Nenhuma promoção neste filtro" : "Nenhuma promoção ainda", "Crie descontos em %, em reais, preço fixo, leve X pague Y ou 2ª unidade com desconto.", `<button class="btn accent sm" data-acao="novaPromo">${ico("plus")}Nova promoção</button>`)}</div>`;
    tickContagens();
  }
  const n = (v) => Number(v) || 0;
  $("prBusca").addEventListener("input", renderPromos);
  $("prChips").addEventListener("click", (e) => { const c = e.target.closest("[data-f]"); if (c) { prFiltro = c.dataset.f; renderPromos(); } });
  $("prLista").addEventListener("click", (e) => {
    const card = e.target.closest(".pcard"); if (!card) return;
    const pr = dados.promocoes.find((x) => x.id === Number(card.dataset.id)); if (!pr) return;
    const b = e.target.closest("[data-a]");
    if (!b) return abrirPromo(pr.id);
    if (b.dataset.a === "pausar") { pr.ativa = pr.ativa === false; toast(pr.ativa ? "Promoção ligada ✓" : "Promoção pausada"); }
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
  const proxIdPromo = () => dados.promocoes.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;

  // ---------- Modal: promoção ----------
  let ed = null; // promoção em edição
  const CAMPOS_TIPO = {
    percentual: () => `<label class="f">Desconto (%)<input type="number" min="1" max="100" step="1" data-k="valor" value="${n(ed.valor)}"></label>`,
    valorOff: () => `<label class="f">Desconto por unidade (R$)<input type="number" min="0.01" step="0.01" data-k="valor" value="${n(ed.valor)}"></label>`,
    precoFixo: () => `<label class="f">Preço promocional (R$)<input type="number" min="0.01" step="0.01" data-k="valor" value="${n(ed.valor)}"></label>`,
    leveXpagueY: () => `<label class="f">Leve<input type="number" min="2" step="1" data-k="leve" value="${n(ed.leve) || 3}"></label><label class="f">Pague<input type="number" min="1" step="1" data-k="pague" value="${n(ed.pague) || 2}"></label>`,
    segundaUnidade: () => `<label class="f">Desconto na 2ª unidade (%)<input type="number" min="1" max="100" step="1" data-k="valor" value="${n(ed.valor)}"></label>`,
  };

  function abrirPromo(id, extra) {
    const orig = id != null ? dados.promocoes.find((x) => x.id === id) : null;
    ed = orig ? clone(orig) : Promo.nova(Object.assign({ id: null }, extra || {}));
    if (!orig && ed.tipo === "percentual" && !n(ed.valor)) ed.valor = 10;
    $("prTitulo").textContent = orig ? "Editar promoção" : "Nova promoção";
    $("prExcluir").hidden = !orig;
    $("prNome").value = ed.nome || "";
    $("prTipo").innerHTML = Object.entries(Promo.TIPOS).map(([k, l]) => `<button data-v="${k}">${l}</button>`).join("");
    $("prCategoria").innerHTML = dados.categorias.map((c) => `<option>${esc(c)}</option>`).join("");
    $("prCategoria").value = ed.categoria || dados.categorias[0];
    $("prInicio").value = ed.inicio || ""; $("prFim").value = ed.fim || "";
    $("prHoraIni").value = ed.horaInicio || ""; $("prHoraFim").value = ed.horaFim || "";
    $("prSelo").value = ed.selo || ""; $("prLimite").value = n(ed.limite);
    $("prAtiva").checked = ed.ativa !== false;
    $("prProdBusca").value = "";
    $("prErro").textContent = "";
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

  function renderPicker() {
    const termo = norm($("prProdBusca").value);
    const sel = new Set(ed.produtos || []);
    const lista = dados.produtos.filter((p) => !termo || norm(p.nome).includes(termo) || norm(p.categoria).includes(termo));
    lista.sort((a, b) => (sel.has(b.id) ? 1 : 0) - (sel.has(a.id) ? 1 : 0));
    $("prPicker").innerHTML = lista.map((p) => `<label class="pick"><input type="checkbox" data-pid="${p.id}" ${sel.has(p.id) ? "checked" : ""}>${thumb(p)}<span>${esc(p.nome)}</span><small>${brl(p.preco)}</small></label>`).join("");
    $("prSelCount").textContent = `${sel.size} produto${sel.size === 1 ? "" : "s"} selecionado${sel.size === 1 ? "" : "s"}`;
  }

  function renderPromoPreview() {
    const teste = { ...ed, ativa: true, inicio: "", fim: "", dias: [], horaInicio: "", horaFim: "" };
    const alvos = dados.produtos.filter((p) => Promo.aplicaA(teste, p)).slice(0, 4);
    const qtdTipo = Promo.TIPOS_QTD.includes(ed.tipo);
    const q = ed.tipo === "leveXpagueY" ? Math.max(2, n(ed.leve)) : ed.tipo === "segundaUnidade" ? 2 : 1;
    $("prPreview").innerHTML = alvos.length ? alvos.map((p) => {
      const l = Promo.linha(p, q, [teste]);
      const selo = Promo.selo(teste, p.preco);
      return `<div class="prev-card">${thumb(p)}<div style="min-width:0"><b>${esc(p.nome)}</b>
        <div class="p">${qtdTipo ? `${q} un.: ` : ""}${l.economia > 0 ? `<s>${brl(l.cheio)}</s> → <strong>${brl(l.total)}</strong>` : `<strong>${brl(l.total)}</strong> <small>(sem desconto)</small>`}</div>
        ${selo ? `<span class="selo-prev">${esc(selo)}</span>` : ""}</div></div>`;
    }).join("") + (dados.produtos.filter((p) => Promo.aplicaA(teste, p)).length > 4 ? `<small class="help">…e mais produtos</small>` : "")
      : `<small class="help">Escolha os produtos para ver o resultado.</small>`;
    // status
    const st = Promo.status({ ...ed, ativa: $("prAtiva").checked });
    const S = STATUS[st];
    const cores = { verde: "var(--good)", azul: "var(--sky)", vermelho: "var(--bad)", "": "var(--faint)" };
    $("prStatus").innerHTML = `<i style="color:${cores[S.cor]}"></i><span style="color:${cores[S.cor]}">${S.txt}</span><small class="help" style="margin:0">· ${esc(quandoTxt(ed))}</small>`;
  }

  // Eventos do formulário de promoção
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
    $("prSelCount").textContent = `${ed.produtos.length} produto${ed.produtos.length === 1 ? "" : "s"} selecionado${ed.produtos.length === 1 ? "" : "s"}`;
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
    const P = {
      sempre: { inicio: "", fim: "", dias: [], horaInicio: "", horaFim: "" },
      hoje: { inicio: hoje, fim: hoje, dias: [], horaInicio: "", horaFim: "" },
      fds: { dias: [5, 6, 0], horaInicio: "", horaFim: "" },
      happy: { horaInicio: "18:00", horaFim: "21:00" },
      madrugada: { horaInicio: "22:00", horaFim: "04:00" },
    }[b.dataset.preset];
    Object.assign(ed, P);
    $("prInicio").value = ed.inicio || ""; $("prFim").value = ed.fim || "";
    $("prHoraIni").value = ed.horaInicio || ""; $("prHoraFim").value = ed.horaFim || "";
    renderPromoForm();
    toast("Período ajustado ✓");
  }));

  $("prSalvar").onclick = () => {
    const erro = (m) => { $("prErro").textContent = m; };
    ed.nome = $("prNome").value.trim();
    ed.ativa = $("prAtiva").checked;
    if (!ed.nome) return erro("Dê um nome para a promoção (só você vê).");
    if (ed.tipo === "percentual" && !(n(ed.valor) > 0 && n(ed.valor) <= 100)) return erro("O desconto precisa ser entre 1% e 100%.");
    if (ed.tipo === "segundaUnidade" && !(n(ed.valor) > 0 && n(ed.valor) <= 100)) return erro("O desconto da 2ª unidade precisa ser entre 1% e 100%.");
    if ((ed.tipo === "valorOff" || ed.tipo === "precoFixo") && !(n(ed.valor) > 0)) return erro("Digite um valor maior que zero.");
    if (ed.tipo === "leveXpagueY" && !(n(ed.leve) > n(ed.pague) && n(ed.pague) >= 1)) return erro("Em 'Leve X, pague Y', o X precisa ser maior que o Y (ex: leve 3, pague 2).");
    if (ed.aplicaEm === "produtos" && !(ed.produtos || []).length) return erro("Escolha pelo menos um produto.");
    if (ed.aplicaEm === "categoria") ed.categoria = $("prCategoria").value;
    if (ed.inicio && ed.fim && ed.fim < ed.inicio) return erro("A data de término é antes da data de início.");
    if (ed.tipo === "precoFixo") {
      const caros = dados.produtos.filter((p) => Promo.aplicaA({ ...ed, ativa: true }, p) && n(p.preco) <= n(ed.valor));
      if (caros.length && !confirm(`O preço promocional (${brl(ed.valor)}) não é menor que o preço de ${caros.length} produto(s). Neles não vai ter desconto. Salvar mesmo assim?`)) return;
    }
    if (ed.id == null) { ed.id = proxIdPromo(); dados.promocoes.push(ed); toast("Promoção criada ✓"); }
    else { const i = dados.promocoes.findIndex((x) => x.id === ed.id); dados.promocoes[i] = ed; toast("Promoção salva ✓"); }
    fecharModal(); mudou();
    abrirAba(abaAtual === "inicio" || abaAtual === "promocoes" || abaAtual === "produtos" ? abaAtual : "promocoes");
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
    $("cLista").innerHTML = dados.categorias.map((c, i) => `
      <div class="cat" data-key="${esc(c)}" style="animation-delay:${i * 30}ms">
        <input type="text" value="${esc(c)}" data-i="${i}" aria-label="Nome da categoria">
        <span class="qtd">${qtd(c)} produto${qtd(c) === 1 ? "" : "s"}</span>
        <button class="circ sm" data-c="up" data-i="${i}" title="Subir" ${i === 0 ? "disabled" : ""}>${ico("up", 15)}</button>
        <button class="circ sm" data-c="down" data-i="${i}" title="Descer" ${i === dados.categorias.length - 1 ? "disabled" : ""}>${ico("down", 15)}</button>
        <button class="circ sm del" data-c="del" data-i="${i}" title="Excluir">${ico("trash", 15)}</button>
      </div>`).join("");
  }
  $("cAdd").onclick = () => {
    const nome = $("cNova").value.trim(); if (!nome) return;
    if (dados.categorias.some((c) => norm(c) === norm(nome))) return toast("Essa categoria já existe", "erro");
    dados.categorias.push(nome); $("cNova").value = "";
    mudou(); renderCategorias(); renderKpis(); toast("Categoria adicionada ✓");
  };
  $("cNova").addEventListener("keydown", (e) => e.key === "Enter" && $("cAdd").click());
  $("cLista").addEventListener("change", (e) => {
    const inp = e.target.closest("input[data-i]"); if (!inp) return;
    const i = Number(inp.dataset.i), velho = dados.categorias[i], novo = inp.value.trim();
    if (!novo || dados.categorias.some((c, j) => j !== i && norm(c) === norm(novo))) { inp.value = velho; return toast("Nome inválido ou repetido", "erro"); }
    dados.categorias[i] = novo;
    dados.produtos.forEach((p) => { if (p.categoria === velho) p.categoria = novo; });
    dados.promocoes.forEach((pr) => { if (pr.categoria === velho) pr.categoria = novo; });
    mudou(); toast("Categoria renomeada ✓");
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
      if (cats.length === 1) return toast("Precisa ter pelo menos uma categoria", "erro");
      const qtd = dados.produtos.filter((p) => p.categoria === cats[i]).length;
      const destino = cats[i === 0 ? 1 : 0];
      if (!confirm(qtd ? `Excluir "${cats[i]}"? Os ${qtd} produtos dela vão para "${destino}".` : `Excluir "${cats[i]}"?`)) return;
      dados.produtos.forEach((p) => { if (p.categoria === cats[i]) p.categoria = destino; });
      dados.promocoes.forEach((pr) => { if (pr.categoria === cats[i]) pr.categoria = destino; });
      cats.splice(i, 1);
    }
    mudou(); renderCategorias(); renderKpis();
  });

  // =====================================================
  // FRETE
  // =====================================================
  const camposFrete = { fPrecoKm: "precoKm", fTaxaFixa: "taxaFixa", fTaxaMin: "taxaMinima", fRaio: "raioMaximoKm", fGratis: "freteGratisAcima", fPadrao: "taxaPadrao" };
  function renderFrete() {
    const F = dados.frete;
    $("fLojaCep").value = F.lojaCep || "";
    $("fLat").value = F.lojaLat ?? ""; $("fLng").value = F.lojaLng ?? "";
    for (const [id, k] of Object.entries(camposFrete)) $(id).value = F[k] ?? 0;
    atualizarMapa(); atualizarFormula();
  }
  function atualizarMapa() {
    const { lojaLat: lat, lojaLng: lng } = dados.frete;
    $("fMapa").href = lat != null && lat !== "" ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}` : "#";
  }
  function atualizarFormula() {
    const F = dados.frete;
    const ex = [2, 5, 10].map((km) => { const v = Geo.valorPorKm(km, F); return `${km} km → <b>${v === null ? "não entrega" : brl(v)}</b>`; }).join(" · ");
    $("fFormula").innerHTML = `Frete = ${brl(F.taxaFixa)} + KM × ${brl(F.precoKm)} (mínimo ${brl(F.taxaMinima)})<br>Exemplos: ${ex}`;
  }
  for (const [id, k] of Object.entries(camposFrete)) $(id).addEventListener("input", () => { dados.frete[k] = num($(id).value); atualizarFormula(); mudou(); });
  ["fLat", "fLng"].forEach((id) => $(id).addEventListener("input", () => {
    dados.frete[id === "fLat" ? "lojaLat" : "lojaLng"] = $(id).value === "" ? null : num($(id).value);
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
    if (!pos) return msg(`Achei ${esc(end.rua || end.bairro)} - ${esc(end.cidade)}, mas não a posição no mapa. Digite latitude e longitude (no Google Maps, clique com o botão direito na loja).`, "bad");
    Object.assign(dados.frete, { lojaLat: Number(pos.lat.toFixed(6)), lojaLng: Number(pos.lng.toFixed(6)), cidade: end.cidade, uf: end.uf });
    renderFrete(); mudou();
    msg(`✓ Loja localizada: ${esc(end.rua)}${end.bairro ? " - " + esc(end.bairro) : ""}, ${esc(end.cidade)}. Confira no mapa.`, "ok");
  };
  $("fTestar").onclick = async () => {
    const msg = (t, c) => { $("fTesteMsg").className = "hint " + (c || ""); $("fTesteMsg").innerHTML = t; };
    msg('<span class="spin"></span>Calculando…');
    const end = await Geo.buscarCep($("fTesteCep").value);
    if (!end) return msg("CEP não encontrado.", "bad");
    const r = await Geo.calcularFrete(end, dados.frete);
    const onde = `${esc(end.rua || "")}${end.bairro ? " - " + esc(end.bairro) : ""}, ${esc(end.cidade)}`;
    if (!r.ok) return msg(r.motivo === "longe" ? `${onde}: ${r.km.toFixed(1)} km — fora do raio.` : `${onde}: não consegui localizar.`, "bad");
    msg(r.km != null ? `${onde}: <b>${r.km.toFixed(1).replace(".", ",")} km</b> ${r.metodo === "rota" ? "(rota de carro)" : "(estimativa)"} → frete <b>${brl(r.valor)}</b>` : `${onde}: não localizado no mapa → taxa padrão <b>${brl(r.valor)}</b>`, "ok");
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
    $("lWhatsMsg").textContent = ok ? `✓ Os pedidos vão para +55 ${formatarWhats(d)}` : "Digite DDD + número (ex: 62 99999-9999)";
    $("lWhatsTeste").href = ok ? `https://wa.me/55${d}?text=${encodeURIComponent("Teste do painel da adega ✓")}` : "#";
    return ok ? "55" + d : null;
  }
  function renderLoja() {
    const L = dados.loja;
    $("lWhats").value = formatarWhats(L.whatsapp);
    $("lNome").value = L.nome; $("lSlogan").value = L.slogan || ""; $("lEndereco").value = L.endereco || "";
    $("lMinimo").value = L.pedidoMinimo || 0; $("lPagamentos").value = (L.pagamentos || []).join(", ");
    validarWhats();
  }
  $("lWhats").addEventListener("input", () => { const v = validarWhats(); if (v) { dados.loja.whatsapp = v; mudou(); } });
  $("lWhats").addEventListener("blur", () => { if (validarWhats()) $("lWhats").value = formatarWhats(dados.loja.whatsapp); });
  [["lNome", "nome"], ["lSlogan", "slogan"], ["lEndereco", "endereco"]].forEach(([id, k]) => $(id).addEventListener("input", () => { dados.loja[k] = $(id).value; mudou(); }));
  $("lMinimo").addEventListener("input", () => { dados.loja.pedidoMinimo = num($("lMinimo").value); mudou(); });
  $("lPagamentos").addEventListener("input", () => { dados.loja.pagamentos = $("lPagamentos").value.split(",").map((s) => s.trim()).filter(Boolean); mudou(); });

  // =====================================================
  // CONEXÃO
  // =====================================================
  function renderConexao() {
    $("gOwner").value = gh.owner; $("gRepo").value = gh.repo; $("gBranch").value = gh.branch; $("gToken").value = gh.token;
    $("gRepoNome").textContent = gh.repo;
    const q = new URLSearchParams({ name: "Painel da Adega", description: `Publicar produtos no site ${gh.repo}`, target_name: gh.owner, expires_in: "none", contents: "write" });
    $("gLinkToken").href = `https://github.com/settings/personal-access-tokens/new?${q}`;
  }
  const gMsg = (t, c) => { $("gMsg").className = "hint " + (c || ""); $("gMsg").innerHTML = t; };
  $("gSalvar").onclick = async () => {
    gh = { owner: $("gOwner").value.trim() || "mauriket", repo: $("gRepo").value.trim() || "adega-brasil", branch: $("gBranch").value.trim() || "main", token: $("gToken").value.trim() };
    store.set(LS_GH, gh);
    if (!gh.token) return gMsg("Cole a chave (token) primeiro.", "bad");
    gMsg('<span class="spin"></span>Testando…');
    try {
      const repo = await api("");
      if (repo.permissions && repo.permissions.push === false) return gMsg("A chave funciona, mas não pode gravar. Marque Contents: Read and write.", "bad");
      gMsg(`✓ Conectado a <b>${esc(repo.full_name)}</b>. Agora é só clicar em <b>Publicar</b>.`, "ok");
      atualizarStatus();
      toast("Painel conectado ✓");
    } catch (e) {
      gMsg(e.status === 401 ? "Chave inválida ou expirada." : e.status === 404 ? "Repositório não encontrado (ou a chave não tem acesso a ele)." : "Erro: " + esc(e.message), "bad");
    }
  };
  $("gEsquecer").onclick = () => { gh.token = ""; store.set(LS_GH, gh); renderConexao(); atualizarStatus(); gMsg("Chave removida deste aparelho."); };
  $("gBaixar").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([gerarDataJs(dados)], { type: "text/javascript" }));
    a.download = "data.js"; a.click();
  };
  $("gDescartar").onclick = () => {
    if (!confirm("Descartar todas as alterações que ainda não foram publicadas?")) return;
    store.del(LS_DRAFT); pendentes = {}; publicado = JSON.stringify(dados); location.reload();
  };

  // =====================================================
  // PUBLICAR
  // =====================================================
  async function publicar() {
    if (!gh.token) { abrirAba("conexao"); return toast("Primeiro conecte o painel ao site 👇", "erro", 3200); }
    if (!temMudancas()) return toast("Nada novo para publicar ✓");
    const btn = $("btnPublicar"); btn.disabled = true;
    const status = (t) => { $("statusTxt").textContent = t; };
    try {
      const usadas = new Set(dados.produtos.map((p) => p.imagem).filter(Boolean));
      const imgs = Object.entries(pendentes).filter(([path]) => usadas.has(path));
      for (let i = 0; i < imgs.length; i++) {
        const [path, dataUrl] = imgs[i];
        status(`Imagem ${i + 1}/${imgs.length}…`);
        await gravarArquivo(path, dataUrl.split(",")[1], `Imagem de produto (${path})`);
        cacheImgs[path] = dataUrl;
      }
      pendentes = {};
      status("Salvando…");
      const atual = await lerArquivo("data.js");
      if (atual) {
        let remoto = null;
        try { remoto = JSON.stringify(Promo.migrar(parseDataJs(atual.texto))); } catch {}
        if (remoto && remoto !== publicado && remoto !== JSON.stringify(dados) &&
            !confirm("O site foi alterado em outro aparelho depois que você abriu o painel. Publicar agora substitui essas mudanças. Continuar?")) {
          throw new Error("cancelado");
        }
      }
      await gravarArquivo("data.js", b64DeTexto(gerarDataJs(dados)), "Atualiza catálogo pelo painel admin", atual && atual.sha);
      publicado = JSON.stringify(dados);
      store.del(LS_DRAFT);
      atualizarStatus();
      toast("🚀 Publicado! Já está no site — atualize a página do catálogo.", null, 4500);
      Motion.confete($("btnPublicar"));
    } catch (e) {
      mudou();
      if (e.message !== "cancelado") toast(e.status === 401 ? "Chave inválida — veja Conexão" : "Erro ao publicar: " + e.message, "erro", 5000);
    } finally {
      btn.disabled = false;
      atualizarStatus();
    }
  }
  $("btnPublicar").onclick = publicar;

  // Promoções com horário mudam de status sozinhas
  setInterval(() => { if (abaAtual === "promocoes") renderPromos(); else if (abaAtual === "inicio") renderInicio(); }, 60000);

  // =====================================================
  // INÍCIO
  // =====================================================
  async function iniciar() {
    let base = window.DADOS ? clone(window.DADOS) : null;
    if (gh.token) { try { const arq = await lerArquivo("data.js"); if (arq) base = parseDataJs(arq.texto); } catch {} }
    else {
      // sem chave: lê a versão mais nova direto do GitHub (o data.js do Pages pode estar atrasado)
      try {
        const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/data.js?ref=${gh.branch}&t=${Date.now()}`, { headers: { Accept: "application/vnd.github.raw" } });
        if (r.ok) base = parseDataJs(await r.text());
      } catch {}
    }
    if (!base) { $("statusTxt").textContent = "Erro ao carregar"; $("skeleton").classList.add("fora"); return; }
    base.categorias ||= []; base.produtos ||= [];
    Promo.migrar(base);
    publicado = JSON.stringify(base);
    dados = clone(base);

    const rasc = store.get(LS_DRAFT, null);
    if (rasc && rasc.dados) {
      const r = Promo.migrar(rasc.dados);
      if (JSON.stringify(r) !== publicado || Object.keys(rasc.pendentes || {}).length) {
        if (confirm("Você tem alterações que ainda não foram publicadas neste aparelho. Continuar de onde parou?")) {
          dados = r; pendentes = rasc.pendentes || {};
        } else store.del(LS_DRAFT);
      }
    }
    atualizarStatus();
    const h = location.hash.slice(1);
    abrirAba(TITULOS[h] ? h : "inicio");
    setTimeout(moverPill, 300);
    if (document.fonts) document.fonts.ready.then(moverPill);
    $("skeleton").classList.add("fora");
    setTimeout(() => $("skeleton").remove(), 600);
  }
  iniciar();
})();
