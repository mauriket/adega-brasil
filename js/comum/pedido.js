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
      const tem = (v) => Object.prototype.hasOwnProperty.call(valores, v);
      const vars = [...linha.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter(tem);
      if (vars.length && vars.every((v) => !String(valores[v] ?? "").trim())) continue;
      saida.push(linha.replace(/\{(\w+)\}/g, (m, v) => (tem(v) ? String(valores[v] ?? "") : m)).replace(/[ \t]+$/g, ""));
    }
    return saida.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  /* dados = { loja, cliente, telefone, itens:[{qtd, produto, valor, unitario, promo}],
               subtotal, economia, frete, distancia, total, retirada, endereco:[linhas],
               pagamento, troco, obs }  (valores em número; o resto texto) */
  function montar(loja, d) {
    const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const agora = d.quando || new Date();
    const fuso = { timeZone: "America/Sao_Paulo" };
    // modelo de item sem o nome do produto deixaria o pedido sem a lista: usa o padrão
    const modeloItem = itemValido(loja.mensagemItem) ? loja.mensagemItem : PADRAO_ITEM;
    const itens = (d.itens || []).map((i) => preencher(modeloItem, {
      qtd: i.qtd, produto: i.produto, valor: brl(i.valor), unitario: brl(i.unitario), promo: i.promo ? `(${i.promo})` : "",
    })).join("\n");
    const texto = preencher(loja.mensagem || PADRAO, {
      loja: String(loja.nome || "").toUpperCase(),
      cliente: d.cliente, telefone: d.telefone, itens,
      qtd_itens: (d.itens || []).reduce((s, i) => s + i.qtd, 0),
      subtotal: brl(d.subtotal),
      economia: d.economia > 0 ? brl(d.economia) : "",
      frete: d.retirada ? "Retirada na loja" : d.freteACombinar ? "A combinar" : d.frete > 0 ? brl(d.frete) : "Grátis",
      distancia: d.distancia ? `(${d.distancia})` : "",
      total: brl(d.total),
      entrega: d.retirada ? "Retirada na loja" : "Endereço de entrega:",
      endereco: d.retirada ? "" : (d.endereco || []).filter(Boolean).join("\n"),
      pagamento: d.pagamento, troco: d.troco, obs: d.obs,
      data: agora.toLocaleDateString("pt-BR", fuso),
      hora: agora.toLocaleTimeString("pt-BR", { ...fuso, hour: "2-digit", minute: "2-digit" }),
    });
    // código de conferência: sempre no fim (não depende do modelo editável)
    return d.codigo ? `${texto}\n\nCódigo de conferência: ${d.codigo}` : texto;
  }

  /* Código de conferência do pedido (anti-fraude): guarda o que foi escolhido, não os valores.
     O painel recalcula o valor certo a partir dele. Ex.: AB1-mf3k2a-10x2.45x1-E75130510 */
  function codigo(d) {
    const ts = Math.floor((d.quando || new Date()).getTime() / 60000).toString(36);
    const itens = (d.itens || []).map((i) => `${Number(i.id)}x${Number(i.qtd)}`).join(".");
    return `AB1-${ts}-${itens}-${d.retirada ? "R" : "E" + String(d.cep || "").replace(/\D/g, "")}`;
  }
  function lerCodigo(texto) {
    const m = String(texto || "").match(/AB1-([0-9a-z]+)-(\d+x\d+(?:\.\d+x\d+)*)-(R|E\d{0,8})(?![\w.])/);
    if (!m) return null;
    const quando = new Date(parseInt(m[1], 36) * 60000);
    const itens = m[2].split(".").map((s) => { const [id, qtd] = s.split("x").map(Number); return { id, qtd }; });
    return { quando, itens, retirada: m[3] === "R", cep: m[3].slice(1) };
  }
  const itemValido = (m) => typeof m === "string" && m.includes("{produto}");

  // Preenche campos novos da loja quando o data.js for antigo
  function normalizar(d) {
    if (!d) return d;
    if (window.Promo) Promo.migrar(d);
    d.loja ||= {};
    const L = d.loja;
    if (typeof L.mensagem !== "string") L.mensagem = PADRAO;
    if (typeof L.mensagemItem !== "string") L.mensagemItem = PADRAO_ITEM;
    if (typeof L.aberta !== "boolean") L.aberta = true;
    if (typeof L.instagram !== "string") L.instagram = "";
    if (typeof L.whatsappRodape !== "string") L.whatsappRodape = "";
    if (typeof L.rodapeTexto !== "string") L.rodapeTexto = "Proibida a venda de bebidas alcoólicas para menores de 18 anos. Beba com moderação.";
    if (typeof L.avisoFechada !== "string") L.avisoFechada = "Estamos fechados no momento. Você pode montar seu carrinho, mas os pedidos voltam a ser aceitos quando abrirmos.";
    d.categorias ||= [];
    d.produtos ||= [];
    // ids sempre numéricos (vão para atributos HTML)
    for (const x of d.produtos) x.id = Number(x.id);
    for (const x of d.promocoes || []) { x.id = Number(x.id); if (Array.isArray(x.produtos)) x.produtos = x.produtos.map(Number); }
    d.frete ||= {};
    return d;
  }

  // "@adega", "adega" ou "https://instagram.com/adega/" -> "adega" ("" se inválido)
  function arroba(v) {
    const s = String(v || "").trim().replace(/^(https?:\/\/)?((www|m)\.)?instagram\.com\//i, "").replace(/^@/, "").split(/[/?#\s]/)[0];
    return /^[A-Za-z0-9._]{1,30}$/.test(s) ? s : "";
  }

  return { PADRAO, PADRAO_ITEM, VARIAVEIS, VARIAVEIS_ITEM, preencher, montar, normalizar, arroba, itemValido, codigo, lerCodigo };
})();
