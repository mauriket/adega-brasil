(async () => {
  await window.carregarDados; // produtos frescos direto do GitHub (ou a cópia do Pages)
  const $ = (id) => document.getElementById(id);
  const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Foto recém-publicada ainda não chegou no Pages? Busca direto no GitHub.
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const caminho = (img.getAttribute("src") || "").split("?")[0];
    if (img.dataset.r || !/^img\//.test(caminho)) { img.style.visibility = "hidden"; return; }
    img.dataset.r = "1";
    img.style.visibility = "";
    img.src = `https://raw.githubusercontent.com/${window.REPO || "mauriket/adega-brasil"}/main/${caminho}`;
  }, true);
  const norm = Geo.norm;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const sess = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
  };

  // ---------- Dados (publicados ou prévia do painel neste aparelho) ----------
  let D = window.DADOS ? JSON.parse(JSON.stringify(window.DADOS)) : null;
  let imgsPrevia = {};
  const rasc = store.get("adega_admin_rascunho", null);
  if (rasc && rasc.dados && sess.get("adega_ver_publicado") !== "1" &&
      JSON.stringify(Promo.migrar(JSON.parse(JSON.stringify(rasc.dados)))) !== JSON.stringify(D && Promo.migrar(JSON.parse(JSON.stringify(D))))) {
    D = rasc.dados;
    imgsPrevia = rasc.pendentes || {};
    $("previa").hidden = false;
  }
  $("previaSair").onclick = () => { sess.set("adega_ver_publicado", "1"); location.reload(); };

  if (!D) {
    document.querySelector("main").innerHTML = '<p class="empty">Não foi possível carregar os produtos. Atualize a página.</p>';
    return;
  }
  Promo.migrar(D);
  const LOJA = D.loja;
  const FRETE = D.frete;
  const PROMOS = D.promocoes || [];
  const img = (src) => imgsPrevia[src] || src;

  // ---------- Produtos ----------
  const PRODUTOS = D.produtos.filter((p) => p.ativo !== false);
  const produtoPorId = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]));
  const vit = (p) => Promo.vitrine(p, PROMOS);

  // ---------- Estado ----------
  let carrinho = store.get("adega_carrinho", {});
  for (const id in carrinho) if (!produtoPorId[id]) delete carrinho[id];
  let categoriaAtiva = "Todas";
  let enderecoCep = null;
  let frete = null;
  let calcId = 0;

  // ---------- Cabeçalho ----------
  document.title = LOJA.nome;
  $("logoImg").alt = LOJA.nome;
  $("pagamento").innerHTML = LOJA.pagamentos.map((p) => `<option>${esc(p)}</option>`).join("");
  $("retiradaMsg").textContent = "Retirada em: " + LOJA.endereco;

  // ---------- Idade ----------
  if (!store.get("adega_18", false)) $("ageGate").hidden = false;
  $("ageYes").onclick = () => {
    store.set("adega_18", true);
    $("ageGate").classList.add("out");
    setTimeout(() => { $("ageGate").hidden = true; }, 400);
  };
  $("ageNo").onclick = () => { document.querySelector(".age-modal p").textContent = "Desculpe, o acesso é permitido apenas para maiores de 18 anos."; };

  // ---------- Bolhas no fundo ----------
  for (let i = 0; i < 22; i++) {
    const s = document.createElement("span");
    const tam = 6 + Math.random() * 22;
    s.style.cssText = `left:${Math.random() * 100}%;width:${tam}px;height:${tam}px;animation-duration:${7 + Math.random() * 9}s;animation-delay:${-Math.random() * 12}s`;
    $("bubbles").appendChild(s);
  }

  const topbar = document.querySelector(".topbar");
  window.addEventListener("scroll", () => topbar.classList.toggle("scrolled", window.scrollY > 20), { passive: true });

  // ---------- Categorias ----------
  const categorias = ["Todas", ...D.categorias.filter((c) => PRODUTOS.some((p) => p.categoria === c))];
  PRODUTOS.forEach((p) => { if (!categorias.includes(p.categoria)) categorias.push(p.categoria); });

  function renderCategorias() {
    $("categorias").innerHTML = '<span class="chip-pill" id="chipPill" aria-hidden="true"></span>' + categorias
      .map((c) => `<button class="chip ${c === categoriaAtiva ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`)
      .join("");
    moverChip();
  }
  // cápsula dourada desliza até a categoria escolhida
  function moverChip() {
    const b = $("categorias").querySelector(".chip.active"), pill = $("chipPill");
    if (!b || !pill) return;
    pill.style.width = b.offsetWidth + "px";
    pill.style.height = b.offsetHeight + "px";
    pill.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
  }
  window.addEventListener("resize", moverChip);
  if (document.fonts) document.fonts.ready.then(moverChip);

  $("categorias").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    categoriaAtiva = b.dataset.cat;
    $("categorias").querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    moverChip();
    b.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    renderTudo();
    const cat = $("catalogo");
    cat.classList.remove("troca"); void cat.offsetWidth; cat.classList.add("troca");
  });
  $("busca").addEventListener("input", renderTudo);

  // ---------- Animação de entrada dos cards ----------
  const vistos = new Set();
  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          vistos.add(en.target.dataset.key);
          observer.unobserve(en.target);
        });
      }, { threshold: 0.12 })
    : null;

  function imgHTML(p) {
    return p.imagem
      ? `<img src="${esc(img(p.imagem))}" alt="${esc(p.nome)}" loading="lazy">`
      : `<span>${esc(p.emoji || "🍾")}</span>`;
  }

  function cardHTML(p, i, secao) {
    const qtd = carrinho[p.id] || 0;
    const key = secao + "-" + p.id;
    const visto = vistos.has(key) || !observer;
    const v = vit(p);
    const selos = [
      ...v.selos.map((s) => `<span class="selo selo-off">${esc(s)}</span>`),
      p.destaque && secao !== "dest" ? `<span class="selo selo-dest">⭐ Destaque</span>` : "",
    ].join("");
    const acao = qtd
      ? `<div class="qty"><button data-act="dec" data-id="${p.id}">−</button><span>${qtd}</span><button data-act="inc" data-id="${p.id}">+</button></div>`
      : `<button class="btn btn-primary" data-act="inc" data-id="${p.id}">Adicionar</button>`;
    return `<article class="card${visto ? " in" : ""}" data-key="${key}" style="--d:${visto ? 0 : i % 8}">
      <div class="card-img">${imgHTML(p)}<div class="selos">${selos}</div></div>
      <div class="card-body">
        <div class="card-name">${esc(p.nome)}</div>
        ${p.descricao ? `<div class="card-desc">${esc(p.descricao)}</div>` : ""}
        <div class="card-price">${v.preco < v.cheio ? `<s>${brl(v.cheio)}</s>` : ""}${brl(v.preco)}</div>
        ${acao}
      </div>
    </article>`;
  }

  // Produtos de uma vitrine (promoções ativas agora)
  function produtosDaVitrine(tipo) {
    const ids = new Set();
    PROMOS.filter((pr) => pr.vitrine === tipo && Promo.estaAtiva(pr)).forEach((pr) =>
      PRODUTOS.forEach((p) => { if (Promo.aplicaA(pr, p)) ids.add(p.id); }));
    return PRODUTOS.filter((p) => ids.has(p.id));
  }

  function renderEspeciais(filtrando) {
    const promo = produtosDaVitrine("promoDia");
    const ofertas = produtosDaVitrine("ofertas").filter((p) => !promo.includes(p));
    const dest = PRODUTOS.filter((p) => p.destaque);
    $("secPromo").hidden = filtrando || !promo.length;
    $("secOfertas").hidden = filtrando || !ofertas.length;
    $("secDestaques").hidden = filtrando || !dest.length;
    if (!filtrando) {
      $("gridPromo").innerHTML = promo.map((p, i) => cardHTML(p, i, "promo")).join("");
      $("gridOfertas").innerHTML = ofertas.map((p, i) => cardHTML(p, i, "ofer")).join("");
      $("gridDestaques").innerHTML = dest.map((p, i) => cardHTML(p, i, "dest")).join("");
    }
  }

  function renderCatalogo() {
    const termo = norm($("busca").value);
    const lista = PRODUTOS.filter(
      (p) => (categoriaAtiva === "Todas" || p.categoria === categoriaAtiva) && norm(p.nome).includes(termo)
    );
    const grupos = {};
    lista.forEach((p) => (grupos[p.categoria] ||= []).push(p));
    const ordem = categorias.filter((c) => grupos[c]);
    $("catalogo").innerHTML = ordem
      .map((cat) => `<h2 class="cat-title">${esc(cat)}</h2><div class="grid">${grupos[cat].map((p, i) => cardHTML(p, i, "cat")).join("")}</div>`)
      .join("");
    $("semResultados").hidden = lista.length > 0;
  }

  function renderTudo() {
    const filtrando = categoriaAtiva !== "Todas" || norm($("busca").value) !== "";
    renderEspeciais(filtrando);
    renderCatalogo();
    if (observer) document.querySelectorAll(".card:not(.in)").forEach((c) => observer.observe(c));
    revelarTitulos();
  }

  // Garantia: ao fim da abertura, tudo que está na tela aparece (mesmo se o observador atrasar)
  function revelarVisiveis() {
    document.querySelectorAll(".card:not(.in), .cat-title.rv:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add("in");
    });
  }
  addEventListener("introfim", () => { revelarVisiveis(); setTimeout(revelarVisiveis, 600); });
  if (!document.getElementById("intro")) setTimeout(revelarVisiveis, 400);

  // ---------- Títulos das seções entram ao rolar ----------
  const titulosVistos = new Set();
  const obsTitulo = "IntersectionObserver" in window && !Motion.calmo
    ? new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        titulosVistos.add(en.target.textContent);
        obsTitulo.unobserve(en.target);
      }), { threshold: 0.4 })
    : null;
  function revelarTitulos() {
    if (!obsTitulo) return;
    document.querySelectorAll(".cat-title:not(.rv)").forEach((t) => {
      t.classList.add("rv");
      if (titulosVistos.has(t.textContent)) t.classList.add("in");
      else obsTitulo.observe(t);
    });
  }

  // ---------- Barra de progresso + brilho que segue o cursor ----------
  const barra = $("progresso");
  const progresso = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener("scroll", progresso, { passive: true });
  progresso();
  const luz = $("cursorLuz");
  if (matchMedia("(pointer: fine)").matches && !Motion.calmo) {
    let alvo = null, pos = { x: innerWidth / 2, y: innerHeight / 2 };
    addEventListener("pointermove", (e) => { alvo = { x: e.clientX, y: e.clientY }; luz.classList.add("on"); }, { passive: true });
    document.addEventListener("pointerleave", () => luz.classList.remove("on"));
    const seguir = () => {
      if (alvo) { pos.x += (alvo.x - pos.x) * 0.12; pos.y += (alvo.y - pos.y) * 0.12; luz.style.transform = `translate(${pos.x}px, ${pos.y}px)`; }
      requestAnimationFrame(seguir);
    };
    seguir();
  }

  // ---------- Contagem regressiva da promoção do dia ----------
  function tickPromo() {
    const agora = new Date();
    const fins = PROMOS.filter((pr) => pr.vitrine === "promoDia" && Promo.estaAtiva(pr, agora))
      .map((pr) => Promo.terminaEm(pr, agora)).filter(Boolean);
    let fim = fins.length ? new Date(Math.min(...fins)) : null;
    if (!fim) { fim = new Date(agora); fim.setHours(24, 0, 0, 0); }
    const s = Math.max(0, Math.floor((fim - agora) / 1000));
    const pad = (n) => String(n).padStart(2, "0");
    const h = Math.floor(s / 3600);
    const txt = h >= 48
      ? `${Math.floor(h / 24)} dias`
      : `${pad(h)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
    const el = $("contador");
    if (el.textContent !== txt) {
      el.textContent = txt;
      el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
    }
  }
  tickPromo();
  setInterval(tickPromo, 1000);

  // Promoções com horário entram/saem sozinhas: confere a cada 30s
  let assinatura = PROMOS.filter((pr) => Promo.estaAtiva(pr)).map((pr) => pr.id).join(",");
  setInterval(() => {
    const nova = PROMOS.filter((pr) => Promo.estaAtiva(pr)).map((pr) => pr.id).join(",");
    if (nova !== assinatura) { assinatura = nova; renderTudo(); renderCarrinho(); }
  }, 30000);

  // ---------- Produto voando até o carrinho ----------
  function voar(origem, p) {
    const alvo = $("openCart").getBoundingClientRect();
    const r = origem.getBoundingClientRect();
    let el;
    if (p.imagem) {
      el = document.createElement("img");
      el.src = img(p.imagem);
      el.className = "fly fly-img";
    } else {
      el = document.createElement("div");
      el.className = "fly";
      el.textContent = p.emoji || "🍾";
    }
    el.style.left = r.left + r.width / 2 - 28 + "px";
    el.style.top = r.top + r.height / 2 - 28 + "px";
    document.body.appendChild(el);
    const dx = alvo.left + alvo.width / 2 - (r.left + r.width / 2);
    const dy = alvo.top + alvo.height / 2 - (r.top + r.height / 2);
    if (!el.animate) { el.remove(); return; }
    el.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 80}px) scale(1.2) rotate(-20deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${dy}px) scale(.25) rotate(20deg)`, opacity: 0.3 },
      ],
      { duration: 750, easing: "cubic-bezier(.5,0,.6,1)" }
    ).onfinish = () => {
      el.remove();
      const btn = $("openCart");
      btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
    };
  }

  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".btn"); if (!b) return;
    const r = b.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(span);
    setTimeout(() => span.remove(), 600);
  });

  // ---------- Carrinho ----------
  function alterar(id, delta) {
    const atual = carrinho[id] || 0;
    const novo = atual + delta;
    if (novo <= 0) delete carrinho[id]; else carrinho[id] = novo;
    if (delta > 0 && atual === 0) toast("Adicionado ao carrinho");
    store.set("adega_carrinho", carrinho);
    renderTudo(); renderCarrinho();
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = Number(b.dataset.id);
    const card = b.closest(".card");
    if (b.dataset.act === "inc" && card) {
      voar(card.querySelector(".card-img"), produtoPorId[id]);
      const r = b.getBoundingClientRect();
      Motion.particulas(r.left + r.width / 2, r.top + r.height / 2, "#ffc20e", 12, 55);
    }
    if (b.dataset.act === "inc") alterar(id, 1);
    if (b.dataset.act === "dec") alterar(id, -1);
  });

  const itens = () => Object.entries(carrinho).map(([id, q]) => {
    const p = produtoPorId[id];
    return { ...p, qtd: q, calc: Promo.linha(p, q, PROMOS) };
  });
  const subtotal = () => itens().reduce((s, i) => s + i.calc.total, 0);
  const economia = () => itens().reduce((s, i) => s + i.calc.economia, 0);
  const qtdTotal = () => itens().reduce((s, i) => s + i.qtd, 0);
  const isRetirada = () => document.querySelector('input[name="tipoEntrega"]:checked').value === "retirada";
  const kmTxt = (km) => km.toFixed(1).replace(".", ",") + " km";

  function valorFrete() {
    if (isRetirada()) return 0;
    if (!frete) return null;
    const lim = Number(FRETE.freteGratisAcima) || 0;
    if (lim > 0 && subtotal() >= lim) return 0;
    return frete.valor;
  }

  function renderCarrinho() {
    const lista = itens();
    const vazio = lista.length === 0;
    if ($("cartCount").textContent !== String(qtdTotal())) {
      const bd = $("cartCount");
      bd.classList.remove("bump"); void bd.offsetWidth; bd.classList.add("bump");
    }
    $("cartCount").textContent = qtdTotal();
    $("cartEmpty").hidden = !vazio;
    $("checkout").hidden = vazio;
    $("cartFoot").hidden = vazio;
    $("floatingCart").hidden = vazio;
    $("floatQtd").textContent = qtdTotal();

    $("cartItems").innerHTML = lista
      .map((i, idx) => {
        const promo = i.calc.promo;
        return `<div class="cart-item" style="--d:${idx}">
        <div class="ci-emoji">${i.imagem ? `<img src="${esc(img(i.imagem))}" alt="">` : esc(i.emoji || "🍾")}</div>
        <div><div class="ci-name">${esc(i.nome)}</div>
          <div class="ci-price">${i.calc.economia > 0 ? `<s>${brl(i.calc.cheio)}</s> ` : ""}<b>${brl(i.calc.total)}</b></div>
          ${promo ? `<div class="ci-promo">🏷️ ${esc(Promo.selo(promo, i.preco) || promo.nome)}</div>` : ""}
        </div>
        <div class="qty"><button data-act="dec" data-id="${i.id}">−</button><span>${i.qtd}</span><button data-act="inc" data-id="${i.id}">+</button></div>
      </div>`;
      })
      .join("");

    const sub = subtotal();
    const eco = economia();
    const f = valorFrete();
    $("tSub").textContent = brl(sub);
    $("linhaEco").hidden = eco <= 0;
    $("tEco").textContent = "- " + brl(eco);
    $("tFrete").textContent = f === null ? "Informe o CEP" : f === 0 ? (isRetirada() ? "Retirada" : "Grátis") : brl(f);
    const total = sub + (f || 0);
    if ($("tTotal").textContent !== brl(total)) {
      const t = $("tTotal").parentElement;
      t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
    }
    $("tTotal").textContent = brl(total);
    $("floatTotal").textContent = brl(total);

    if (!isRetirada() && frete) {
      const lim = Number(FRETE.freteGratisAcima) || 0;
      const onde = $("bairro").value.trim() || enderecoCep.cidade;
      const dist = frete.km != null ? ` · ${kmTxt(frete.km)}` : "";
      if (lim > 0 && sub >= lim) {
        msgFrete(`${esc(onde)}${dist}: <b>frete grátis!</b>`, "ok");
      } else {
        const falta = lim > 0 ? ` Faltam ${brl(lim - sub)} para frete grátis!` : "";
        msgFrete(`${esc(onde)}${dist}: frete <b>${brl(frete.valor)}</b>.${falta}`, "ok");
      }
    }
    $("erro").textContent = "";
  }

  // ---------- Drawer ----------
  function abrir() {
    const d = $("cartDrawer");
    d.classList.add("open", "anim");
    setTimeout(() => d.classList.remove("anim"), 900);
    $("cartOverlay").hidden = false;
    d.setAttribute("aria-hidden", "false");
  }
  function fechar() { $("cartDrawer").classList.remove("open"); $("cartOverlay").hidden = true; $("cartDrawer").setAttribute("aria-hidden", "true"); }
  $("openCart").onclick = abrir;
  $("floatingCart").onclick = abrir;
  $("closeCart").onclick = fechar;
  $("cartOverlay").onclick = fechar;
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());

  // ---------- Entrega / Frete por KM ----------
  document.querySelectorAll('input[name="tipoEntrega"]').forEach((r) =>
    r.addEventListener("change", () => {
      $("blocoEntrega").hidden = isRetirada();
      $("retiradaMsg").hidden = !isRetirada();
      renderCarrinho();
    })
  );

  $("cep").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    e.target.value = v;
    if (v.length === 9) buscarCep();
  });
  $("cep").addEventListener("keydown", (e) => e.key === "Enter" && buscarCep());
  $("calcFrete").onclick = buscarCep;

  function msgFrete(txt, cls) {
    $("freteMsg").className = "hint " + (cls || "");
    $("freteMsg").innerHTML = txt;
  }

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
      if (ini && cep >= ini && cep <= fim) {
        end = { rua: "", bairro: "", cidade: FRETE.cidade, uf: FRETE.uf };
        manual = true;
      } else {
        msgFrete("CEP não encontrado. Confira os números e tente de novo.", "bad"); renderCarrinho(); return;
      }
    }

    enderecoCep = { ...end, cep: $("cep").value };
    $("rua").value = end.rua || "";
    $("bairro").value = end.bairro || "";
    $("bairro").readOnly = !!end.bairro;
    $("enderecoCampos").hidden = false;

    if (manual || (!end.rua && !end.bairro)) {
      msgFrete(`CEP de ${esc(end.cidade)} aceito! Digite sua <b>rua</b> e <b>bairro</b> para calcularmos o frete.`);
      renderCarrinho();
      $("rua").focus();
      return;
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
      frete = null;
      if (r.motivo === "longe") {
        msgFrete(`Você está a ${kmTxt(r.km)} da loja — entregamos até ${FRETE.raioMaximoKm} km. Escolha <b>Retirar na loja</b>.`, "bad");
      } else {
        msgFrete(`Desculpe, não entregamos em ${esc(end.cidade)}. Você pode escolher <b>Retirar na loja</b>.`, "bad");
      }
      renderCarrinho();
      return;
    }
    frete = r;
    renderCarrinho();
  }

  ["rua", "bairro"].forEach((campo) => $(campo).addEventListener("change", () => {
    if (enderecoCep && ($("rua").value.trim() || $("bairro").value.trim())) calcularDistancia();
  }));

  $("pagamento").addEventListener("change", () => {
    $("troco").hidden = norm($("pagamento").value) !== "dinheiro";
  });

  // ---------- WhatsApp ----------
  $("enviar").onclick = () => {
    const erro = (m) => { $("erro").textContent = m; };
    const lista = itens();
    const sub = subtotal();
    const retirada = isRetirada();
    const nome = $("nome").value.trim();

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

    const f = valorFrete() || 0;
    const total = sub + f;
    const eco = economia();
    const L = [];
    L.push(`*🍺 NOVO PEDIDO - ${LOJA.nome.toUpperCase()}*`, "");
    L.push(`*Cliente:* ${nome}`);
    if ($("telefone").value.trim()) L.push(`*Telefone:* ${$("telefone").value.trim()}`);
    L.push("", "*🛒 Itens:*");
    lista.forEach((i) => {
      const pr = i.calc.promo;
      L.push(`• ${i.qtd}x ${i.nome} — ${brl(i.calc.total)}${pr ? ` _(${Promo.selo(pr, i.preco) || pr.nome})_` : ""}`);
    });
    L.push("", `*Subtotal:* ${brl(sub)}`);
    if (eco > 0) L.push(`*Economia com promoções:* ${brl(eco)}`);
    const dist = !retirada && frete && frete.km != null ? ` (${kmTxt(frete.km)})` : "";
    L.push(`*Frete:* ${retirada ? "Retirada na loja" : f === 0 ? "Grátis" : brl(f)}${dist}`);
    L.push(`*TOTAL: ${brl(total)}*`, "");

    if (retirada) {
      L.push("*📍 Retirada na loja*");
    } else {
      L.push("*📍 Endereço de entrega:*");
      let end = `${$("rua").value.trim()}, ${$("numero").value.trim()}`;
      if ($("complemento").value.trim()) end += ` - ${$("complemento").value.trim()}`;
      L.push(end);
      L.push(`${$("bairro").value.trim()} - ${enderecoCep.cidade}/${enderecoCep.uf}`);
      L.push(`CEP: ${enderecoCep.cep}`);
      if ($("referencia").value.trim()) L.push(`Referência: ${$("referencia").value.trim()}`);
    }

    L.push("", `*💳 Pagamento:* ${$("pagamento").value}`);
    if (!$("troco").hidden && $("troco").value.trim()) L.push(`Troco para: ${$("troco").value.trim()}`);
    if ($("obs").value.trim()) L.push("", `*📝 Obs:* ${$("obs").value.trim()}`);

    Motion.confete($("enviar"));
    const numero = String(LOJA.whatsapp).replace(/\D/g, "");
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(L.join("\n"))}`, "_blank");
  };

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    $("toast").textContent = msg;
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 1400);
  }

  // ---------- Início ----------
  renderCategorias();
  renderTudo();
  renderCarrinho();
})();
