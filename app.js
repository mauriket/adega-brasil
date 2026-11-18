(() => {
  const $ = (id) => document.getElementById(id);
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // ---------- Estado ----------
  let carrinho = store.get("adega_carrinho", {}); // { id: qtd }
  let categoriaAtiva = "Todas";
  let frete = null; // { valor, cep, cidade, uf, bairro, rua } | null
  const produtoPorId = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]));

  // remove itens que não existem mais no catálogo
  for (const id in carrinho) if (!produtoPorId[id]) delete carrinho[id];

  // ---------- Cabeçalho ----------
  document.title = CONFIG.nomeLoja;
  $("logoImg").alt = CONFIG.nomeLoja;
  $("pagamento").innerHTML = CONFIG.pagamentos.map((p) => `<option>${p}</option>`).join("");
  $("retiradaMsg").textContent = "Retirada em: " + CONFIG.enderecoLoja;

  // ---------- Idade ----------
  if (!store.get("adega_18", false)) $("ageGate").hidden = false;
  $("ageYes").onclick = () => {
    store.set("adega_18", true);
    $("ageGate").classList.add("out");
    setTimeout(() => { $("ageGate").hidden = true; }, 400);
  };

  // ---------- Bolhas no topo ----------
  for (let i = 0; i < 22; i++) {
    const s = document.createElement("span");
    const tam = 6 + Math.random() * 22;
    s.style.cssText = `left:${Math.random() * 100}%;width:${tam}px;height:${tam}px;animation-duration:${7 + Math.random() * 9}s;animation-delay:${-Math.random() * 12}s`;
    $("bubbles").appendChild(s);
  }

  // ---------- Topo encolhe ao rolar ----------
  const topbar = document.querySelector(".topbar");
  window.addEventListener("scroll", () => topbar.classList.toggle("scrolled", window.scrollY > 20), { passive: true });
  $("ageNo").onclick = () => { document.querySelector(".age-modal p").textContent = "Desculpe, o acesso é permitido apenas para maiores de 18 anos."; };

  // ---------- Catálogo ----------
  const categorias = ["Todas", ...new Set(PRODUTOS.map((p) => p.categoria))];

  function renderCategorias() {
    $("categorias").innerHTML = categorias
      .map((c) => `<button class="chip ${c === categoriaAtiva ? "active" : ""}" data-cat="${c}">${c}</button>`)
      .join("");
  }
  $("categorias").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    categoriaAtiva = b.dataset.cat; renderCategorias(); renderCatalogo();
  });
  $("busca").addEventListener("input", renderCatalogo);

  // ---------- Animação de entrada dos cards ----------
  const vistos = new Set();
  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          vistos.add(Number(en.target.dataset.id));
          observer.unobserve(en.target);
        });
      }, { threshold: 0.12 })
    : null;

  function cardHTML(p, i) {
    const qtd = carrinho[p.id] || 0;
    const img = p.imagem ? `<img src="${p.imagem}" alt="${p.nome}" loading="lazy">` : `<span>${p.emoji || "🍾"}</span>`;
    const acao = qtd
      ? `<div class="qty"><button data-act="dec" data-id="${p.id}">−</button><span>${qtd}</span><button data-act="inc" data-id="${p.id}">+</button></div>`
      : `<button class="btn btn-primary" data-act="inc" data-id="${p.id}">Adicionar</button>`;
    const visto = vistos.has(p.id) || !observer;
    return `<article class="card${visto ? " in" : ""}" data-id="${p.id}" style="--d:${visto ? 0 : i % 8}">
      <div class="card-img">${img}</div>
      <div class="card-body">
        <div class="card-name">${p.nome}</div>
        <div class="card-price">${brl(p.preco)}</div>
        ${acao}
      </div>
    </article>`;
  }

  function renderCatalogo() {
    const termo = norm($("busca").value);
    const lista = PRODUTOS.filter(
      (p) => (categoriaAtiva === "Todas" || p.categoria === categoriaAtiva) && norm(p.nome).includes(termo)
    );
    const grupos = {};
    lista.forEach((p) => (grupos[p.categoria] ||= []).push(p));
    $("catalogo").innerHTML = Object.entries(grupos)
      .map(([cat, itens]) => `<h2 class="cat-title">${cat}</h2><div class="grid">${itens.map(cardHTML).join("")}</div>`)
      .join("");
    $("semResultados").hidden = lista.length > 0;
    if (observer) document.querySelectorAll(".card:not(.in)").forEach((c) => observer.observe(c));
  }

  // ---------- Produto voando até o carrinho ----------
  function voar(origem, conteudo) {
    const alvo = $("openCart").getBoundingClientRect();
    const r = origem.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = "fly";
    el.textContent = conteudo;
    el.style.left = r.left + r.width / 2 - 24 + "px";
    el.style.top = r.top + r.height / 2 - 30 + "px";
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

  // Efeito de onda ao clicar nos botões
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
    renderCatalogo(); renderCarrinho();
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = Number(b.dataset.id);
    const card = b.closest(".card");
    if (b.dataset.act === "inc" && card) {
      const p = produtoPorId[id];
      voar(card.querySelector(".card-img"), p.emoji || "🍾");
    }
    if (b.dataset.act === "inc") alterar(id, 1);
    if (b.dataset.act === "dec") alterar(id, -1);
    if (b.dataset.act === "del") alterar(id, -(carrinho[id] || 0));
  });

  const itens = () => Object.entries(carrinho).map(([id, q]) => ({ ...produtoPorId[id], qtd: q }));
  const subtotal = () => itens().reduce((s, i) => s + i.preco * i.qtd, 0);
  const qtdTotal = () => itens().reduce((s, i) => s + i.qtd, 0);
  const isRetirada = () => document.querySelector('input[name="tipoEntrega"]:checked').value === "retirada";

  function valorFrete() {
    if (isRetirada()) return 0;
    if (!frete) return null;
    const lim = CONFIG.frete.freteGratisAcima;
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
      .map(
        (i, idx) => `<div class="cart-item" style="--d:${idx}">
        <div class="ci-emoji">${i.emoji || "🍾"}</div>
        <div><div class="ci-name">${i.nome}</div><div class="ci-price">${brl(i.preco)} · <b>${brl(i.preco * i.qtd)}</b></div></div>
        <div class="qty"><button data-act="dec" data-id="${i.id}">−</button><span>${i.qtd}</span><button data-act="inc" data-id="${i.id}">+</button></div>
      </div>`
      )
      .join("");

    const sub = subtotal();
    const f = valorFrete();
    $("tSub").textContent = brl(sub);
    $("tFrete").textContent = f === null ? "Informe o CEP" : f === 0 ? (isRetirada() ? "Retirada" : "Grátis") : brl(f);
    const total = sub + (f || 0);
    if ($("tTotal").textContent !== brl(total)) {
      const t = $("tTotal").parentElement;
      t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
    }
    $("tTotal").textContent = brl(total);
    $("floatTotal").textContent = brl(total);

    const lim = CONFIG.frete.freteGratisAcima;
    if (!isRetirada() && frete && lim > 0 && sub < lim) {
      $("freteMsg").innerHTML = `${frete.bairro} - ${frete.cidade}: frete <b>${brl(frete.valor)}</b>. Faltam ${brl(lim - sub)} para frete grátis!`;
    } else if (!isRetirada() && frete) {
      $("freteMsg").innerHTML = `${frete.bairro} - ${frete.cidade}: <b>frete grátis!</b>`;
    }
    $("erro").textContent = "";
  }

  // ---------- Drawer ----------
  function abrir() {
    const d = $("cartDrawer");
    d.classList.add("open", "anim");
    setTimeout(() => d.classList.remove("anim"), 900); $("cartOverlay").hidden = false; $("cartDrawer").setAttribute("aria-hidden", "false"); }
  function fechar() { $("cartDrawer").classList.remove("open"); $("cartOverlay").hidden = true; $("cartDrawer").setAttribute("aria-hidden", "true"); }
  $("openCart").onclick = abrir;
  $("floatingCart").onclick = abrir;
  $("closeCart").onclick = fechar;
  $("cartOverlay").onclick = fechar;
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());

  // ---------- Entrega / Frete ----------
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
    if (v.length === 9) calcularFrete();
  });
  $("cep").addEventListener("keydown", (e) => e.key === "Enter" && calcularFrete());
  $("calcFrete").onclick = calcularFrete;

  function msgFrete(txt, cls) {
    $("freteMsg").className = "hint " + (cls || "");
    $("freteMsg").innerHTML = txt;
  }

  async function calcularFrete() {
    const cep = $("cep").value.replace(/\D/g, "");
    frete = null;
    $("enderecoCampos").hidden = true;
    if (cep.length !== 8) { msgFrete("Digite um CEP válido com 8 dígitos.", "bad"); renderCarrinho(); return; }

    msgFrete("Buscando CEP...");
    let dados = await buscarCep(cep);
    let manual = false;

    if (!dados) {
      const [ini, fim] = CONFIG.frete.faixaCep || [];
      if (ini && cep >= ini && cep <= fim) {
        // CEP da cidade que não está nas bases: aceita e pede rua/bairro
        dados = { localidade: CONFIG.frete.cidade, uf: CONFIG.frete.uf || "", bairro: "", logradouro: "" };
        manual = true;
      } else {
        msgFrete("CEP não encontrado. Confira os números e tente de novo.", "bad"); renderCarrinho(); return;
      }
    }

    const cidade = dados.localidade;
    let valor = null;

    if (norm(cidade) === norm(CONFIG.frete.cidade)) {
      valor = taxaDoBairro(dados.bairro);
    } else {
      const chave = Object.keys(CONFIG.frete.outrasCidades).find((c) => norm(c) === norm(cidade));
      if (chave) valor = CONFIG.frete.outrasCidades[chave];
    }

    if (valor === null) {
      msgFrete(`Desculpe, ainda não entregamos em ${cidade} - ${dados.uf}. Você pode escolher <b>Retirar na loja</b>.`, "bad");
      renderCarrinho(); return;
    }

    frete = { valor, cep: $("cep").value, cidade, uf: dados.uf, bairro: dados.bairro || "Bairro não informado", rua: dados.logradouro };
    $("rua").value = dados.logradouro || "";
    $("bairro").value = dados.bairro || "";
    $("bairro").readOnly = !!dados.bairro; // CEP geral de cidade não traz bairro
    $("enderecoCampos").hidden = false;
    $("freteMsg").className = "hint ok";
    renderCarrinho();
    if (manual) {
      $("freteMsg").innerHTML = `CEP de ${cidade} aceito! Digite sua <b>rua</b> e <b>bairro</b> abaixo. Frete: <b>${brl(valorFrete())}</b>`;
    }
    (dados.logradouro ? $("numero") : $("rua")).focus();
  }

  function taxaDoBairro(bairro) {
    const chave = Object.keys(CONFIG.frete.bairros).find((b) => norm(b) === norm(bairro));
    return chave ? CONFIG.frete.bairros[chave] : CONFIG.frete.taxaPadrao;
  }

  // Consulta o CEP no ViaCEP e, se falhar, na BrasilAPI
  async function buscarCep(cep) {
    const comTempo = (url) => {
      const ctrl = "AbortController" in window ? new AbortController() : null;
      const t = ctrl && setTimeout(() => ctrl.abort(), 6000);
      return fetch(url, ctrl ? { signal: ctrl.signal } : {}).finally(() => t && clearTimeout(t));
    };
    try {
      const r = await comTempo(`https://viacep.com.br/ws/${cep}/json/`);
      if (r.ok) {
        const d = await r.json();
        if (d && !d.erro && d.localidade) return d;
      }
    } catch {}
    try {
      const r = await comTempo(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (r.ok) {
        const d = await r.json();
        if (d && d.city) return { localidade: d.city, uf: d.state, bairro: d.neighborhood || "", logradouro: d.street || "" };
      }
    } catch {}
    return null;
  }

  // Se o cliente digitar/alterar o bairro, recalcula a taxa
  $("bairro").addEventListener("input", () => {
    if (!frete || norm(frete.cidade) !== norm(CONFIG.frete.cidade)) return;
    frete.valor = taxaDoBairro($("bairro").value);
    frete.bairro = $("bairro").value.trim() || "Bairro não informado";
    renderCarrinho();
  });

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
    if (sub < CONFIG.pedidoMinimo) return erro(`Pedido mínimo de ${brl(CONFIG.pedidoMinimo)}.`);
    if (!retirada) {
      if (!frete) return erro("Informe um CEP válido para calcular o frete.");
      if (!$("rua").value.trim()) return erro("Informe a rua.");
      if (!$("numero").value.trim()) return erro("Informe o número do endereço.");
      if (!$("bairro").value.trim()) return erro("Informe o bairro.");
    }
    if (!nome) return erro("Informe seu nome.");

    const f = valorFrete() || 0;
    const total = sub + f;
    const L = [];
    L.push(`*🍷 NOVO PEDIDO - ${CONFIG.nomeLoja.toUpperCase()}*`, "");
    L.push(`*Cliente:* ${nome}`);
    if ($("telefone").value.trim()) L.push(`*Telefone:* ${$("telefone").value.trim()}`);
    L.push("", "*🛒 Itens:*");
    lista.forEach((i) => L.push(`• ${i.qtd}x ${i.nome} — ${brl(i.preco * i.qtd)}`));
    L.push("", `*Subtotal:* ${brl(sub)}`);
    L.push(`*Frete:* ${retirada ? "Retirada na loja" : f === 0 ? "Grátis" : brl(f)}`);
    L.push(`*TOTAL: ${brl(total)}*`, "");

    if (retirada) {
      L.push("*📍 Retirada na loja*");
    } else {
      L.push("*📍 Endereço de entrega:*");
      let end = `${$("rua").value.trim()}, ${$("numero").value.trim()}`;
      if ($("complemento").value.trim()) end += ` - ${$("complemento").value.trim()}`;
      L.push(end);
      L.push(`${$("bairro").value.trim()} - ${frete.cidade}/${frete.uf}`);
      L.push(`CEP: ${frete.cep}`);
      if ($("referencia").value.trim()) L.push(`Referência: ${$("referencia").value.trim()}`);
    }

    L.push("", `*💳 Pagamento:* ${$("pagamento").value}`);
    if (!$("troco").hidden && $("troco").value.trim()) L.push(`Troco para: ${$("troco").value.trim()}`);
    if ($("obs").value.trim()) L.push("", `*📝 Obs:* ${$("obs").value.trim()}`);

    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(L.join("\n"))}`;
    window.open(url, "_blank");
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
  renderCatalogo();
  renderCarrinho();
})();
