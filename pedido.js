/* =====================================================
   Pedido: mensagem do WhatsApp (modelo editável no painel)
   Usado pelo site (envio) e pelo painel (prévia).
   ===================================================== */
window.Pedido = (() => {
  const PADRAO = [
    "*NOVO PEDIDO - {loja}*",
    "Data: {data} às {hora}",
    "",
    "*Cliente:* {cliente}",
    "*Telefone:* {telefone}",
    "",
    "*Itens:*",
    "{itens}",
    "",
    "*Subtotal:* {subtotal}",
    "*Economia com promoções:* {economia}",
    "*Frete:* {frete} {distancia}",
    "*TOTAL: {total}*",
    "",
    "*{entrega}*",
    "{endereco}",
    "",
    "*Pagamento:* {pagamento}",
    "Troco para: {troco}",
    "",
    "*Observações:* {obs}",
  ].join("\n");
  const PADRAO_ITEM = "• {qtd}x {produto} — {valor} {promo}";

  // Variáveis disponíveis (aparecem no painel)
  const VARIAVEIS = [
    ["loja", "Nome da loja"],
    ["cliente", "Nome do cliente"],
    ["telefone", "Telefone do cliente"],
    ["itens", "Lista de produtos"],
    ["qtd_itens", "Quantidade de itens"],
    ["subtotal", "Soma dos produtos"],
    ["economia", "Desconto das promoções"],
    ["frete", "Valor do frete"],
    ["distancia", "Distância (km)"],
    ["total", "Total do pedido"],
    ["entrega", "Entrega ou retirada"],
    ["endereco", "Endereço completo"],
    ["pagamento", "Forma de pagamento"],
    ["troco", "Troco para"],
    ["obs", "Observações"],
    ["data", "Data do pedido"],
    ["hora", "Hora do pedido"],
  ];
  const VARIAVEIS_ITEM = [
    ["qtd", "Quantidade"],
    ["produto", "Nome do produto"],
    ["valor", "Valor da linha"],
    ["unitario", "Preço unitário"],
    ["promo", "Promoção aplicada"],
  ];

  // Preenche o modelo. Linha cujas variáveis ficaram TODAS vazias é removida.
  function preencher(modelo, valores) {
    const linhas = String(modelo || "").replace(/\r/g, "").split("\n");
    const saida = [];
    for (const linha of linhas) {
      // só variáveis conhecidas contam; uma {digitada_errada} fica visível no texto
      const vars = [...linha.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((v) => v in valores);
      if (vars.length && vars.every((v) => !String(valores[v] ?? "").trim())) continue;
      saida.push(linha.replace(/\{(\w+)\}/g, (m, v) => (v in valores ? String(valores[v] ?? "") : m)).replace(/[ \t]+$/g, ""));
    }
    return saida.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  /* dados = { loja, cliente, telefone, itens:[{qtd, produto, valor, unitario, promo}],
               subtotal, economia, frete, distancia, total, retirada, endereco:[linhas],
               pagamento, troco, obs }  (valores em número; o resto texto) */
  function montar(loja, d) {
    const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const agora = d.quando || new Date();
    const itens = (d.itens || []).map((i) => preencher(loja.mensagemItem || PADRAO_ITEM, {
      qtd: i.qtd, produto: i.produto, valor: brl(i.valor), unitario: brl(i.unitario), promo: i.promo ? `(${i.promo})` : "",
    })).join("\n");
    return preencher(loja.mensagem || PADRAO, {
      loja: String(loja.nome || "").toUpperCase(),
      cliente: d.cliente, telefone: d.telefone, itens,
      qtd_itens: (d.itens || []).reduce((s, i) => s + i.qtd, 0),
      subtotal: brl(d.subtotal),
      economia: d.economia > 0 ? brl(d.economia) : "",
      frete: d.retirada ? "Retirada na loja" : d.frete > 0 ? brl(d.frete) : "Grátis",
      distancia: d.distancia ? `(${d.distancia})` : "",
      total: brl(d.total),
      entrega: d.retirada ? "Retirada na loja" : "Endereço de entrega:",
      endereco: d.retirada ? "" : (d.endereco || []).filter(Boolean).join("\n"),
      pagamento: d.pagamento, troco: d.troco, obs: d.obs,
      data: agora.toLocaleDateString("pt-BR"),
      hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // Preenche campos novos da loja quando o data.js for antigo
  function normalizar(d) {
    if (!d) return d;
    if (window.Promo) Promo.migrar(d);
    d.loja ||= {};
    const L = d.loja;
    if (typeof L.mensagem !== "string") L.mensagem = PADRAO;
    if (typeof L.mensagemItem !== "string") L.mensagemItem = PADRAO_ITEM;
    if (typeof L.aberta !== "boolean") L.aberta = true;
    if (typeof L.avisoFechada !== "string") L.avisoFechada = "Estamos fechados no momento. Você pode montar seu carrinho, mas os pedidos voltam a ser aceitos quando abrirmos.";
    d.categorias ||= [];
    d.produtos ||= [];
    return d;
  }

  return { PADRAO, PADRAO_ITEM, VARIAVEIS, VARIAVEIS_ITEM, preencher, montar, normalizar };
})();
