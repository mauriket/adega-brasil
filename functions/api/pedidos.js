// /api/pedidos — só para o painel (precisa da chave de publicação da loja; o servidor confere no GitHub
// se a chave tem permissão de escrita no repositório da loja).
//   GET  ?desde=ms  → pedidos dos últimos 30 dias (só os novos ou alterados depois de "desde")
//   POST {id, status, por} → muda a situação: pendente | pago | entregue | cancelado | excluido
import { GUARDA, REPO, json, hash } from "../_lib/comum.js";

const SITUACOES = ["pendente", "pago", "entregue", "cancelado", "excluido"];
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
  const agora = Date.now(), limite = agora - GUARDA;
  const desde = Number(new URL(request.url).searchParams.get("desde")) || 0;
  const { results } = await env.DB.prepare(
    "SELECT dados, status, atualizado, por FROM pedidos WHERE criado > ? AND (criado > ? OR atualizado > ?) ORDER BY criado DESC LIMIT 500"
  ).bind(limite, desde, desde).all();
  const pedidos = results.map((r) => Object.assign(JSON.parse(r.dados), { status: r.status || "pendente", atualizado: r.atualizado || 0, por: r.por || "" }));
  return json({ ok: true, agora, pedidos });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, erro: "sem banco" }, 503);
  if (!(await autorizado(request, env))) return json({ ok: false, erro: "acesso" }, 401);
  let b;
  try { b = JSON.parse(await request.text()); } catch { return json({ ok: false, erro: "formato" }, 400); }
  const id = b && typeof b.id === "string" && /^[A-Z2-9]{6}$/.test(b.id) ? b.id : null;
  if (!id || !SITUACOES.includes(b.status)) return json({ ok: false, erro: "formato" }, 400);
  const por = String(b.por || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 40);
  const agora = Date.now();
  const r = await env.DB.prepare("UPDATE pedidos SET status = ?, atualizado = ?, por = ? WHERE id = ?").bind(b.status, agora, por, id).run();
  if (!r.meta || !r.meta.changes) return json({ ok: false, erro: "nao achou" }, 404);
  return json({ ok: true, id, status: b.status, atualizado: agora, por });
}
