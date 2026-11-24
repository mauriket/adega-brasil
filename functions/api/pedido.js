// POST /api/pedido — o catálogo manda o pedido aqui ao clicar em "Enviar".
// O servidor NÃO confia nos valores do cliente: recalcula preços, promoções e frete com os dados publicados.
import { Promo, Pedido, Geo, TRES_DIAS, json, hash, lerDados } from "../_lib/comum.js";

const texto = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const r2 = (v) => Math.round(v * 100) / 100;
const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, erro: "sem banco" }, 503);
  const corpo = await request.text();
  if (corpo.length > 20000) return json({ ok: false, erro: "grande" }, 413);
  let b;
  try { b = JSON.parse(corpo); } catch { return json({ ok: false, erro: "formato" }, 400); }
  if (!b || typeof b !== "object") return json({ ok: false, erro: "formato" }, 400);
  const id = typeof b.id === "string" && /^[A-Z2-9]{6}$/.test(b.id) ? b.id : null;
  if (!id) return json({ ok: false, erro: "id" }, 400);

  const agora = Date.now();
  // limite: 8 pedidos a cada 10 minutos por internet (contra spam)
  const ip = (await hash("adega:" + (request.headers.get("cf-connecting-ip") || ""))).slice(0, 24);
  const conta = await env.DB.prepare("SELECT COUNT(*) AS n FROM pedidos WHERE ip = ? AND criado > ?").bind(ip, agora - 600000).first();
  if (conta && conta.n >= 8) return json({ ok: false, erro: "muitos" }, 429);

  const D = Pedido.normalizar(await lerDados(env, request));
  const prods = new Map(D.produtos.map((p) => [p.id, p]));
  const alertas = [], itens = [];
  for (const it of Array.isArray(b.itens) ? b.itens.slice(0, 80) : []) {
    const qtd = Math.floor(Number(it && it.qtd));
    if (!(qtd >= 1 && qtd <= 999)) continue;
    const p = prods.get(Number(it.id));
    if (!p) { alertas.push(`Um produto do pedido (nº ${Number(it.id) || "?"}) não existe no catálogo.`); continue; }
    if (p.ativo === false || p.esgotado) alertas.push(`"${p.nome}" está ${p.esgotado ? "esgotado" : "oculto"} no catálogo.`);
    const l = Promo.linha(p, qtd, D.promocoes || [], new Date(agora));
    itens.push({ id: p.id, nome: p.nome, qtd, unit: Number(p.preco) || 0, total: l.total, cheio: l.cheio, promo: l.promo ? (Promo.selo(l.promo, p.preco) || l.promo.nome) : "" });
  }
  if (!itens.length) return json({ ok: false, erro: "vazio" }, 400);
  const subtotal = r2(itens.reduce((s, i) => s + i.total, 0));
  const economia = r2(itens.reduce((s, i) => s + i.cheio - i.total, 0));

  const retirada = !!b.retirada, e = b.endereco || {};
  const endereco = retirada ? null : {
    rua: texto(e.rua, 120), numero: texto(e.numero, 20), complemento: texto(e.complemento, 80), bairro: texto(e.bairro, 80),
    cidade: texto(e.cidade, 60), uf: texto(e.uf, 2), cep: texto(e.cep, 9), referencia: texto(e.referencia, 160),
  };
  const lat = Number(b.pos && b.pos.lat), lng = Number(b.pos && b.pos.lng);
  const pos = !retirada && isFinite(lat) && isFinite(lng) && lat > -34 && lat < 6 && lng > -75 && lng < -28 ? { lat: +lat.toFixed(6), lng: +lng.toFixed(6) } : null;

  // frete recalculado no servidor
  const F = D.frete || {};
  let frete = { valor: 0, texto: "Retirada na loja" };
  if (!retirada) {
    const lim = Number(F.freteGratisAcima) || 0;
    const temLoja = F.lojaLat != null && F.lojaLng != null && F.lojaLat !== "" && F.lojaLng !== "";
    if (lim > 0 && subtotal >= lim) frete = { valor: 0, texto: `Grátis (pedido acima de ${brl(lim)})` };
    else if (pos && temLoja) {
      const loja = { lat: Number(F.lojaLat), lng: Number(F.lojaLng) };
      let { km, metodo } = await Geo.distanciaKm(loja, pos);
      if (metodo === "estimada") {
        // sem rota agora: usa a distância que o site do cliente calculou, se for plausível (entre a linha reta e 2,2×)
        const reta = Geo.linhaReta(loja, pos), kmCli = Number(b.km);
        if (isFinite(kmCli) && kmCli >= reta * 0.95 && kmCli <= reta * 2.2) { km = kmCli; metodo = "rota"; }
      }
      const v = Geo.valorPorKm(km, F);
      if (v === null) { frete = { valor: null, km: r2(km), texto: "Fora da área de entrega" }; alertas.push(`O endereço fica a ${km.toFixed(1).replace(".", ",")} km, fora do raio de entrega.`); }
      else frete = { valor: v, km: r2(km), texto: (v > 0 ? brl(v) : "Grátis") + ` (${km.toFixed(1).replace(".", ",")} km${metodo === "estimada" ? ", estimado" : ""})` };
    } else {
      const pad = Number(F.taxaPadrao) || 0;
      frete = pad > 0 ? { valor: pad, texto: `${brl(pad)} (taxa padrão: endereço não achado no mapa)` } : { valor: null, texto: "A combinar (endereço não achado no mapa)" };
    }
  }
  const total = r2(subtotal + (frete.valor || 0));
  const totalCliente = Number(b.totalCliente);
  // só avisa quando o cliente viu um valor MENOR que o certo (sinal de alteração)
  if (isFinite(totalCliente) && frete.valor !== null && totalCliente < total - 0.01)
    alertas.push(`A tela do cliente mostrou ${brl(totalCliente)}; o valor certo é ${brl(total)}. Confira antes de confirmar.`);
  if (D.loja && D.loja.aberta === false) alertas.push("O pedido chegou com a loja marcada como fechada.");
  const minimo = Number(D.loja && D.loja.pedidoMinimo) || 0;
  if (minimo > 0 && subtotal < minimo) alertas.push(`Abaixo do pedido mínimo (${brl(minimo)}).`);

  const pedido = {
    id, criado: agora,
    cliente: texto(b.cliente, 80), telefone: texto(b.telefone, 30),
    pagamento: texto(b.pagamento, 40), troco: texto(b.troco, 20), obs: texto(b.obs, 500),
    retirada, endereco, pos, itens: itens.map(({ cheio, ...i }) => i), subtotal, economia, frete, total,
    totalCliente: isFinite(totalCliente) ? r2(totalCliente) : null, alertas,
  };
  await env.DB.prepare("INSERT OR IGNORE INTO pedidos (id, criado, ip, dados) VALUES (?, ?, ?, ?)").bind(id, agora, ip, JSON.stringify(pedido)).run();
  await env.DB.prepare("DELETE FROM pedidos WHERE criado < ?").bind(agora - TRES_DIAS).run(); // some sozinho depois de 3 dias
  return json({ ok: true, id, total });
}
