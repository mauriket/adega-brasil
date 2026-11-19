/* =====================================================
   Mescla: junta as alterações de dois aparelhos.
   base   = versão publicada que este aparelho conhecia
   minha  = versão editada neste aparelho
   deles  = versão publicada agora (outro aparelho pode ter mudado)
   Regra: o que eu não mudei fica como está no site; o que eu mudei vale.
   Nada que o outro aparelho cadastrou é apagado por uma versão antiga.
   ===================================================== */
(function (raiz) {
  const j = JSON.stringify;
  const igual = (a, b) => j(a) === j(b);
  const copia = (o) => (o === undefined ? undefined : JSON.parse(j(o)));
  const ehObj = (o) => o && typeof o === "object" && !Array.isArray(o);

  // Objeto simples (loja, frete, um produto...): campo a campo
  function objeto(base, minha, deles) {
    base = base || {}; minha = minha || {}; deles = deles || {};
    const out = {};
    const chaves = [...new Set([...Object.keys(deles), ...Object.keys(minha)])];
    for (const k of chaves) {
      const v = igual(minha[k], base[k]) ? deles[k] : minha[k];
      if (v !== undefined) out[k] = copia(v);
    }
    return out;
  }

  // Lista de nomes (categorias): mantém a ordem do site, aplica o que eu tirei e o que eu pus
  function nomes(base, minha, deles) {
    base = base || []; minha = minha || []; deles = deles || [];
    if (igual(minha, base)) return copia(deles);
    if (igual(deles, base)) return copia(minha);
    const tirei = new Set(base.filter((c) => !minha.includes(c)));
    const out = deles.filter((c) => !tirei.has(c));
    for (const c of minha) if (!out.includes(c) && !base.includes(c)) out.push(c);
    return out;
  }

  // Lista com id (produtos, promoções)
  function lista(base, minha, deles) {
    base = base || []; minha = minha || []; deles = deles || [];
    const B = new Map(base.map((x) => [x.id, x]));
    const M = new Map(minha.map((x) => [x.id, x]));
    const T = new Map(deles.map((x) => [x.id, x]));
    const out = [], usados = new Set();
    for (const t of deles) {
      const id = t.id;
      if (!B.has(id)) { // novo no site (ou novo igual nos dois)
        out.push(copia(t)); usados.add(id); continue;
      }
      const b = B.get(id);
      if (!M.has(id)) { // eu apaguei
        if (!igual(t, b)) { out.push(copia(t)); usados.add(id); } // o outro editou depois: mantém
        continue;
      }
      const m = M.get(id);
      let v;
      if (igual(m, b)) v = t;
      else if (igual(t, b)) v = m;
      else v = ehObj(m) && ehObj(t) ? objeto(b, m, t) : m; // os dois mudaram: campo a campo
      out.push(copia(v)); usados.add(id);
    }
    // o outro apagou, mas eu editei: mantém a minha
    for (const [id, b] of B) {
      if (T.has(id) || !M.has(id) || usados.has(id)) continue;
      if (!igual(M.get(id), b)) { out.push(copia(M.get(id))); usados.add(id); }
    }
    // novos deste aparelho
    for (const m of minha) {
      if (B.has(m.id) || usados.has(m.id)) continue;
      out.push(copia(m)); usados.add(m.id);
    }
    return out;
  }

  // Ids novos que colidem (os dois cadastraram "produto 67" diferentes): renumera os meus
  function renumerar(base, minha, deles) {
    const B = new Set((base.produtos || []).map((p) => p.id));
    const T = new Map((deles.produtos || []).map((p) => [p.id, p]));
    const cont = (k) => Math.max(0, ...[base, minha, deles].map((d) => Number((d.ultimoId || {})[k]) || 0));
    let max = Math.max(cont("produto"), ...[...(base.produtos || []), ...(minha.produtos || []), ...(deles.produtos || [])].map((p) => Number(p.id) || 0));
    const mapa = new Map();
    for (const p of minha.produtos || []) {
      if (!B.has(p.id) && T.has(p.id) && !igual(T.get(p.id), p)) { mapa.set(p.id, ++max); p.id = max; }
    }
    if (mapa.size) for (const pr of minha.promocoes || []) {
      if (Array.isArray(pr.produtos)) pr.produtos = pr.produtos.map((id) => (mapa.has(id) ? mapa.get(id) : id));
    }
    const BP = new Set((base.promocoes || []).map((p) => p.id));
    const TP = new Map((deles.promocoes || []).map((p) => [p.id, p]));
    let maxP = Math.max(cont("promo"), ...[...(base.promocoes || []), ...(minha.promocoes || []), ...(deles.promocoes || [])].map((p) => Number(p.id) || 0));
    for (const pr of minha.promocoes || []) {
      if (!BP.has(pr.id) && TP.has(pr.id) && !igual(TP.get(pr.id), pr)) pr.id = ++maxP;
    }
  }

  function mesclar(base, minha, deles) {
    base = copia(base) || {}; minha = copia(minha) || {}; deles = copia(deles) || {};
    renumerar(base, minha, deles);
    const out = {};
    const chaves = [...new Set([...Object.keys(deles), ...Object.keys(minha)])];
    for (const k of chaves) {
      if (k === "produtos" || k === "promocoes") out[k] = lista(base[k], minha[k], deles[k]);
      else if (k === "categorias") out[k] = nomes(base[k], minha[k], deles[k]);
      else if (k === "ultimoId") out[k] = maiorId(base[k], minha[k], deles[k]);
      else if (ehObj(minha[k]) || ehObj(deles[k])) out[k] = objeto(base[k], minha[k], deles[k]);
      else out[k] = copia(igual(minha[k], base[k]) ? deles[k] : minha[k]);
    }
    if (Array.isArray(out.categorias)) categoriasOrfas(out, base, minha, deles);
    return out;
  }

  // Contador de ids (nunca anda para trás: id de produto apagado não é reaproveitado)
  function maiorId(...vs) {
    const out = {};
    for (const v of vs) for (const k in v || {}) out[k] = Math.max(out[k] || 0, Number(v[k]) || 0);
    return out;
  }

  // Um aparelho renomeou/excluiu uma categoria enquanto o outro cadastrava nela:
  // leva o produto para o nome novo (ou devolve a categoria à lista)
  function categoriasOrfas(out, base, minha, deles) {
    const renomes = new Map();
    for (const lado of [minha, deles]) {
      const b = base.categorias || [], l = lado.categorias || [];
      if (b.length !== l.length) continue;
      b.forEach((c, i) => { if (l[i] !== c && !l.includes(c) && !b.includes(l[i])) renomes.set(c, l[i]); });
    }
    const existe = new Set(out.categorias);
    for (const x of [...(out.produtos || []), ...(out.promocoes || [])]) {
      if (!x.categoria || existe.has(x.categoria)) continue;
      const novo = renomes.get(x.categoria);
      if (novo && existe.has(novo)) x.categoria = novo;
      else if (out.produtos && out.produtos.includes(x)) { out.categorias.push(x.categoria); existe.add(x.categoria); }
    }
  }

  raiz.Mescla = { mesclar, lista, objeto, nomes };
})(typeof window !== "undefined" ? window : globalThis);
