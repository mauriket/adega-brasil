/* =====================================================
   Promo: regras de promoção (usado pelo site e pelo painel)

   Promoção = {
     id, nome, ativa,
     tipo: "percentual" | "valorOff" | "precoFixo" | "leveXpagueY" | "segundaUnidade",
     valor,            // % (percentual / segundaUnidade), R$ (valorOff) ou preço (precoFixo)
     leve, pague,      // leveXpagueY
     aplicaEm: "produtos" | "categoria" | "todos", produtos: [ids], categoria,
     inicio, fim,      // "AAAA-MM-DD" (vazio = sem limite)
     dias: [0..6],     // 0 = domingo (vazio = todos os dias)
     horaInicio, horaFim, // "HH:MM" (vazio = o dia todo; pode virar a noite: 22:00 → 02:00)
     vitrine: "promoDia" | "ofertas" | "nenhuma",
     limite,           // máx. de unidades com desconto por pedido (0 = sem limite)
     selo              // texto do selo (vazio = automático)
   }
   ===================================================== */
window.Promo = (() => {
  const TIPOS = {
    percentual: "Desconto em %",
    valorOff: "Desconto em R$",
    precoFixo: "Preço promocional",
    leveXpagueY: "Leve X, pague Y",
    segundaUnidade: "2ª unidade com desconto",
  };
  const TIPOS_QTD = ["leveXpagueY", "segundaUnidade"];
  const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const n = (v) => Number(v) || 0;
  const r2 = (v) => Math.round(v * 100) / 100;
  const brl = (v) => n(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const hm = (s) => {
    if (!s) return null;
    const [h, m] = String(s).split(":").map(Number);
    return isNaN(h) ? null : h * 60 + (m || 0);
  };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // ---------- Quando vale ----------
  function estaAtiva(pr, agora = new Date()) {
    if (!pr || pr.ativa === false) return false;
    const hoje = ymd(agora);
    if (pr.inicio && hoje < pr.inicio) return false;
    if (pr.fim && hoje > pr.fim) return false;
    const ini = hm(pr.horaInicio), fim = hm(pr.horaFim);
    const min = agora.getHours() * 60 + agora.getMinutes();
    let dia = agora.getDay();
    if (ini != null && fim != null && ini !== fim) {
      if (ini < fim) {
        if (min < ini || min >= fim) return false;
      } else {
        // horário que vira a noite (ex: 22:00 → 02:00)
        if (min >= fim && min < ini) return false;
        if (min < fim) dia = (dia + 6) % 7; // madrugada conta como o dia anterior
      }
    } else if (ini != null && fim == null) {
      if (min < ini) return false;
    } else if (fim != null && ini == null) {
      if (min >= fim) return false;
    }
    if (pr.dias && pr.dias.length && !pr.dias.includes(dia)) return false;
    return true;
  }

  // "ativa" | "foraHorario" | "agendada" | "pausada" | "encerrada"
  function status(pr, agora = new Date()) {
    if (pr.ativa === false) return "pausada";
    const hoje = ymd(agora);
    if (pr.fim && hoje > pr.fim) return "encerrada";
    if (pr.inicio && hoje < pr.inicio) return "agendada";
    return estaAtiva(pr, agora) ? "ativa" : "foraHorario";
  }

  // Quando acaba a janela atual (Date) — ou null se não tem fim
  function terminaEm(pr, agora = new Date()) {
    const fins = [];
    const ini = hm(pr.horaInicio), fim = hm(pr.horaFim);
    const min = agora.getHours() * 60 + agora.getMinutes();
    if (fim != null) {
      const d = new Date(agora);
      d.setHours(Math.floor(fim / 60), fim % 60, 0, 0);
      if (ini != null && ini > fim && min >= ini) d.setDate(d.getDate() + 1);
      fins.push(d);
    }
    if (pr.fim) fins.push(new Date(pr.fim + "T23:59:59"));
    if (pr.dias && pr.dias.length && fim == null) {
      const amanha = (agora.getDay() + 1) % 7;
      if (!pr.dias.includes(amanha)) { const d = new Date(agora); d.setHours(24, 0, 0, 0); fins.push(d); }
    }
    return fins.length ? new Date(Math.min(...fins)) : null;
  }

  // ---------- Em quem vale ----------
  function aplicaA(pr, p) {
    if (pr.aplicaEm === "todos") return true;
    if (pr.aplicaEm === "categoria") return p.categoria === pr.categoria;
    return (pr.produtos || []).includes(p.id);
  }
  const ativasDo = (p, promos, agora = new Date()) => (promos || []).filter((pr) => aplicaA(pr, p) && estaAtiva(pr, agora));

  // ---------- Quanto custa ----------
  function precoUnit(pr, preco) {
    if (pr.tipo === "percentual") return r2(preco * (1 - Math.min(100, n(pr.valor)) / 100));
    if (pr.tipo === "valorOff") return r2(Math.max(0, preco - n(pr.valor)));
    if (pr.tipo === "precoFixo") return r2(Math.min(preco, n(pr.valor)));
    return null;
  }

  function totalCom(pr, preco, qtd) {
    const cheio = preco * qtd;
    const lim = n(pr.limite) > 0 ? n(pr.limite) : Infinity;
    const elig = Math.min(qtd, lim);
    if (pr.tipo === "leveXpagueY") {
      const L = n(pr.leve), P = n(pr.pague);
      if (!(L > P && P >= 0 && L > 0)) return cheio;
      return (qtd - Math.floor(elig / L) * (L - P)) * preco;
    }
    if (pr.tipo === "segundaUnidade") {
      return cheio - Math.floor(elig / 2) * preco * Math.min(100, n(pr.valor)) / 100;
    }
    const u = precoUnit(pr, preco);
    return u == null ? cheio : elig * u + (qtd - elig) * preco;
  }

  // Total de uma linha do carrinho, escolhendo a promoção que dá mais desconto
  function linha(p, qtd, promos, agora = new Date()) {
    const preco = n(p.preco);
    const cheio = r2(preco * qtd);
    let melhor = { total: cheio, promo: null };
    for (const pr of ativasDo(p, promos, agora)) {
      const t = r2(totalCom(pr, preco, qtd));
      if (t < melhor.total - 0.001) melhor = { total: t, promo: pr };
    }
    return { ...melhor, cheio, economia: r2(cheio - melhor.total) };
  }

  // Para o card: preço de 1 unidade e selos
  function vitrine(p, promos, agora = new Date()) {
    const preco = n(p.preco);
    const ativas = ativasDo(p, promos, agora);
    let unit = preco, promoUnit = null;
    for (const pr of ativas) {
      if (TIPOS_QTD.includes(pr.tipo)) continue;
      const u = precoUnit(pr, preco);
      if (u != null && u < unit - 0.001) { unit = u; promoUnit = pr; }
    }
    const selos = ativas.map((pr) => selo(pr, preco)).filter(Boolean);
    return { preco: unit, cheio: preco, promoUnit, ativas, selos: [...new Set(selos)] };
  }

  function seloAuto(pr, preco) {
    const v = n(pr.valor);
    if (pr.tipo === "percentual") return v > 0 ? `-${Math.round(v)}%` : "";
    if (pr.tipo === "valorOff") return v > 0 ? `-${brl(v)}` : "";
    if (pr.tipo === "precoFixo") return preco > 0 && v < preco ? `-${Math.round((1 - v / preco) * 100)}%` : "";
    if (pr.tipo === "leveXpagueY") return n(pr.leve) > n(pr.pague) ? `Leve ${n(pr.leve)} pague ${n(pr.pague)}` : "";
    if (pr.tipo === "segundaUnidade") return v >= 100 ? "2ª unidade grátis" : v > 0 ? `2ª un. -${Math.round(v)}%` : "";
    return "";
  }
  const selo = (pr, preco) => (pr.selo && pr.selo.trim()) || seloAuto(pr, preco);

  // Frase explicando a regra
  function descricao(pr) {
    const v = n(pr.valor);
    switch (pr.tipo) {
      case "percentual": return `${v}% de desconto`;
      case "valorOff": return `${brl(v)} de desconto por unidade`;
      case "precoFixo": return `Sai por ${brl(v)}`;
      case "leveXpagueY": return `Leve ${n(pr.leve)}, pague ${n(pr.pague)}`;
      case "segundaUnidade": return v >= 100 ? "2ª unidade grátis" : `2ª unidade com ${v}% de desconto`;
    }
    return "";
  }

  // ---------- Compatibilidade: converte o formato antigo (precoPromo/promoDia) ----------
  function nova(extra) {
    return Object.assign({
      id: 0, nome: "", ativa: true, tipo: "percentual", valor: 10, leve: 3, pague: 2,
      aplicaEm: "produtos", produtos: [], categoria: "", inicio: "", fim: "",
      dias: [], horaInicio: "", horaFim: "", vitrine: "ofertas", limite: 0, selo: "",
    }, extra || {});
  }
  function migrar(d) {
    d.promocoes ||= [];
    let id = d.promocoes.reduce((m, x) => Math.max(m, x.id || 0), 0);
    for (const p of d.produtos || []) {
      const temPreco = n(p.precoPromo) > 0 && n(p.precoPromo) < n(p.preco);
      if (temPreco || p.promoDia) {
        d.promocoes.push(nova({
          id: ++id, nome: p.nome,
          tipo: temPreco ? "precoFixo" : "percentual",
          valor: temPreco ? n(p.precoPromo) : 0,
          produtos: [p.id],
          vitrine: p.promoDia ? "promoDia" : "nenhuma",
        }));
      }
      delete p.precoPromo;
      delete p.promoDia;
    }
    return d;
  }

  return { TIPOS, TIPOS_QTD, DIAS, estaAtiva, status, terminaEm, aplicaA, ativasDo, precoUnit, linha, vitrine, selo, descricao, nova, migrar, ymd };
})();
