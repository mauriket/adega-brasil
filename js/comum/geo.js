/* =====================================================
   Geo: CEP → endereço → coordenadas → distância → frete
   Usado pelo site (app.js) e pelo painel (admin.js)
   ===================================================== */
window.Geo = (() => {
  const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  function comTempo(url, ms = 7000) {
    const ctrl = "AbortController" in window ? new AbortController() : null;
    const t = ctrl && setTimeout(() => ctrl.abort(), ms);
    return fetch(url, ctrl ? { signal: ctrl.signal } : {}).finally(() => t && clearTimeout(t));
  }

  // CEP → { rua, bairro, cidade, uf }  (ViaCEP, depois BrasilAPI)
  // Obs.: as coordenadas da BrasilAPI são do centro da cidade, não da rua — por isso não usamos.
  async function buscarCep(cep) {
    cep = String(cep || "").replace(/\D/g, "");
    if (cep.length !== 8) return null;
    try {
      const r = await comTempo(`https://viacep.com.br/ws/${cep}/json/`);
      if (r.ok) {
        const d = await r.json();
        if (d && !d.erro && d.localidade) return { rua: d.logradouro || "", bairro: d.bairro || "", cidade: d.localidade, uf: d.uf };
      }
    } catch {}
    try {
      const r = await comTempo(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (r.ok) {
        const d = await r.json();
        if (d && d.city) return { rua: d.street || "", bairro: d.neighborhood || "", cidade: d.city, uf: d.state };
      }
    } catch {}
    return null;
  }

  // Endereço → { lat, lng, precisao } usando OpenStreetMap (Nominatim)
  // Ruas com o mesmo nome existem em vários bairros (e avenidas cruzam vários bairros).
  // O OpenStreetMap diz o bairro de cada trecho; escolhemos o trecho do bairro do CEP.
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  async function nominatim(qs, limit) {
    try {
      const r = await comTempo(`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=br&accept-language=pt-BR&addressdetails=1&limit=${limit}${qs}`);
      if (!r.ok) return [];
      return (await r.json()) || [];
    } catch { return []; }
  }
  const ponto = (x, precisao) => ({ lat: Number(x.lat), lng: Number(x.lon), precisao });
  // "Vila Jayara" ≈ "Vila Jaiara", "Centro" ≈ "Setor Central", "Bairro Maracanã" ≈ "Maracanã"
  const chaveBairro = (s) => norm(s).replace(/y/g, "i").replace(/central/g, "centro")
    .replace(/\b(bairro|setor|vila|jardim|residencial|parque|conjunto|loteamento|st|vl|jd|res)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
  function mesmoBairro(x, bairro) {
    const k = chaveBairro(bairro);
    if (!k) return false;
    const a = x.address || {};
    return [a.suburb, a.neighbourhood, a.quarter, a.city_district, a.residential].filter(Boolean)
      .some((b) => { const kb = chaveBairro(b); return kb && (kb === k || kb.includes(k) || k.includes(kb)); });
  }

  async function geocodificar({ rua, bairro, cidade, uf }) {
    const enc = encodeURIComponent;
    let reservaRua = null;
    if (rua) {
      const ruas = await nominatim(`&street=${enc(rua)}&city=${enc(cidade)}&state=${enc(uf || "")}`, 10);
      if (ruas.length) {
        if (!bairro) return ponto(ruas[0], "rua");
        const certo = ruas.find((x) => mesmoBairro(x, bairro));
        if (certo) return ponto(certo, "rua");
        reservaRua = ruas[0];
      }
      await pausa(1000); // regra do OpenStreetMap: no máximo 1 consulta por segundo
    }
    if (bairro) {
      const tiposBairro = ["suburb", "neighbourhood", "quarter", "city_district", "residential", "hamlet"];
      const lista = await nominatim(`&q=${enc(`${bairro}, ${cidade}, ${uf || ""}`)}`, 5);
      const b = lista.find((x) => tiposBairro.includes(x.addresstype) && mesmoBairro(x, bairro))
        || lista.find((x) => tiposBairro.includes(x.addresstype));
      if (b) return ponto(b, "bairro");
    }
    return reservaRua ? ponto(reservaRua, "rua") : null;
  }

  function linhaReta(a, b) {
    const R = 6371, rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Distância de carro (OSRM); se falhar, linha reta × 1,3
  async function distanciaKm(a, b) {
    try {
      const r = await comTempo(`https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`, 8000);
      if (r.ok) {
        const d = await r.json();
        if (d.code === "Ok" && d.routes && d.routes[0]) return { km: d.routes[0].distance / 1000, metodo: "rota" };
      }
    } catch {}
    return { km: linhaReta(a, b) * 1.3, metodo: "estimada" };
  }

  // Aplica a regra de preço: taxa fixa + km × preço, com mínimo; null = fora do raio
  function valorPorKm(km, cfg) {
    if (cfg.raioMaximoKm > 0 && km > cfg.raioMaximoKm) return null;
    let v = (Number(cfg.taxaFixa) || 0) + km * (Number(cfg.precoKm) || 0);
    v = Math.max(v, Number(cfg.taxaMinima) || 0);
    return Math.ceil(v * 2) / 2; // arredonda para cima de R$ 0,50 em R$ 0,50
  }

  /* Calcula o frete de um endereço.
     Retorna { ok, valor, km, metodo, estimado, motivo } */
  async function calcularFrete(end, cfg) {
    const temLoja = cfg.lojaLat != null && cfg.lojaLng != null && cfg.lojaLat !== "" && cfg.lojaLng !== "";
    const mesmaCidade = norm(end.cidade) === norm(cfg.cidade);
    const temRaio = Number(cfg.raioMaximoKm) > 0;
    // Sem raio definido, só entrega na cidade da loja
    if (!mesmaCidade && !temRaio) return { ok: false, motivo: "foraCidade" };
    let destino = end.lat != null && end.lng != null ? { lat: end.lat, lng: end.lng } : await geocodificar(end);

    if (!temLoja || !destino) {
      if (!mesmaCidade) return { ok: false, motivo: "naoLocalizado" };
      // endereço não achado no mapa: taxa padrão, ou "a combinar" se ela não foi definida (nunca grátis por engano)
      const padrao = Number(cfg.taxaPadrao) || 0;
      const pos = destino || null; // posição no mapa (quando achada) vai junto com o pedido
      return padrao > 0 ? { ok: true, valor: padrao, km: null, estimado: true, pos } : { ok: true, valor: 0, km: null, estimado: true, aCombinar: true, pos };
    }
    const loja = { lat: Number(cfg.lojaLat), lng: Number(cfg.lojaLng) };
    const { km, metodo } = await distanciaKm(loja, destino);
    const valor = valorPorKm(km, cfg);
    if (valor === null) return { ok: false, motivo: "longe", km };
    return { ok: true, valor, km, metodo, pos: destino };
  }

  return { norm, buscarCep, geocodificar, distanciaKm, valorPorKm, calcularFrete, linhaReta };
})();
