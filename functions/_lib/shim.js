// Faz os arquivos do navegador (window.Promo, window.Pedido, window.Geo) funcionarem no servidor.
globalThis.window = globalThis;

// Serviços públicos (rota de carro, mapa, GitHub) pedem identificação: o navegador manda sozinho, o servidor não.
const fetchOriginal = globalThis.fetch;
globalThis.fetch = (url, opcoes = {}) => {
  const headers = new Headers(opcoes.headers || {});
  if (!headers.has("user-agent")) headers.set("user-agent", "adega-brasil-pedidos/1.0 (+https://adega-brasil.pages.dev)");
  return fetchOriginal(url, { ...opcoes, headers });
};
