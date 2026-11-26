// Roda antes das páginas (as pastas de arquivos — js, css, img — ficam de fora em _routes.json).
// O painel só abre no endereço da Cloudflare (adega-brasil.pages.dev). No domínio da loja ele "não existe",
// em qualquer forma de escrever o endereço (letras codificadas, // a mais, maiúsculas, .html...).
const PAINEL = "/gestao-7sfgpiwvu6ww";
const CABECALHOS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "no-store",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000",
};

function caminhoNormal(url) {
  let p = url.pathname;
  for (let i = 0; i < 3; i++) { try { const d = decodeURIComponent(p); if (d === p) break; p = d; } catch { break; } }
  return p.replace(/\\/g, "/").replace(/\/{2,}/g, "/").toLowerCase().replace(/\.html?$/, "").replace(/\/+$/, "");
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!caminhoNormal(url).startsWith(PAINEL)) return context.next();
  if (/(^|\.)adegabrasil\.net\.br$/i.test(url.hostname)) {
    const r = await context.env.ASSETS.fetch(new URL("/404.html", url));
    return new Response(r.body, { status: 404, headers: { "content-type": "text/html; charset=utf-8", ...CABECALHOS, "X-Robots-Tag": "noindex" } });
  }
  const r = await context.next();
  const h = new Headers(r.headers);
  for (const [k, v] of Object.entries(CABECALHOS)) h.set(k, v);
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
}
