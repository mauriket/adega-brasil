// Servidor (Cloudflare Functions): reaproveita as mesmas regras do site (promoções, pedido, frete).
// Os arquivos de js/comum foram escritos para o navegador (window.X); o shim faz "window" existir aqui.
import "./shim.js";
import "../../js/comum/promo.js";
import "../../js/comum/pedido.js";
import "../../js/comum/geo.js";

export const Promo = globalThis.Promo;
export const Pedido = globalThis.Pedido;
export const Geo = globalThis.Geo;

export const GUARDA = 30 * 864e5; // pedidos ficam guardados por 30 dias (histórico)
export const REPO = (env) => env.REPO || "mauriket/adega-brasil";

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function hash(texto) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// data.js publicado (o mesmo que o catálogo usa): GitHub primeiro, cópia do site como reserva
export async function lerDados(env, request) {
  const corta = (t) => JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${REPO(env)}/main/data.js`, { cf: { cacheTtl: 20 } });
    if (r.ok) return corta(await r.text());
  } catch (e) { /* usa a cópia */ }
  const r = await env.ASSETS.fetch(new URL("/data.js", request.url));
  return corta(await r.text());
}
