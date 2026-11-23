// GET /api/pedidos — lista os pedidos dos últimos 3 dias para o painel.
// Só responde para quem tem a chave de publicação da loja (a mesma que o login do painel libera):
// o servidor confere no GitHub se a chave tem permissão de escrita no repositório da loja.
import { TRES_DIAS, REPO, json, hash } from "../_lib/comum.js";

const confirmadas = new Map(); // chave (hash) → válida até (ms), para não consultar o GitHub a cada 30 s

async function autorizado(request, env) {
  const h = request.headers.get("authorization") || "";
  const chave = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!chave || chave.length > 400) return false;
  const k = await hash(chave), ate = confirmadas.get(k);
  if (ate && ate > Date.now()) return true;
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO(env)}`, {
      headers: { Authorization: `Bearer ${chave}`, Accept: "application/vnd.github+json", "User-Agent": "adega-brasil-painel" },
    });
    if (!r.ok) return false;
    const repo = await r.json();
    const ok = !!(repo && repo.permissions && (repo.permissions.push || repo.permissions.admin));
    if (ok) confirmadas.set(k, Date.now() + 10 * 60e3);
    return ok;
  } catch { return false; }
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ ok: false, erro: "sem banco" }, 503);
  if (!(await autorizado(request, env))) return json({ ok: false, erro: "acesso" }, 401);
  const agora = Date.now();
  const desde = Math.max(Number(new URL(request.url).searchParams.get("desde")) || 0, agora - TRES_DIAS);
  const { results } = await env.DB.prepare("SELECT dados FROM pedidos WHERE criado > ? ORDER BY criado DESC LIMIT 300").bind(desde).all();
  return json({ ok: true, agora, pedidos: results.map((r) => JSON.parse(r.dados)) });
}
