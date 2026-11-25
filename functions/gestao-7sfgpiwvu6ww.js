// O painel só abre no endereço da Cloudflare (adega-brasil.pages.dev).
// No domínio da loja (adegabrasil.net.br) ele "não existe": responde a página 404.
const CABECALHOS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "no-store",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000",
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (/(^|\.)adegabrasil\.net\.br$/i.test(url.hostname)) {
    const r = await context.env.ASSETS.fetch(new URL("/404.html", url));
    return new Response(r.body, { status: 404, headers: { "content-type": "text/html; charset=utf-8", ...CABECALHOS, "X-Robots-Tag": "noindex" } });
  }
  const r = await context.next();
  const h = new Headers(r.headers);
  for (const [k, v] of Object.entries(CABECALHOS)) h.set(k, v);
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
}
