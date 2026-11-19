/* Produtos: direto do GitHub (instantâneo). Reserva: data.js do Pages. */
window.REPO = "mauriket/adega-brasil";
window.carregarDados = (async () => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch("https://api.github.com/repos/" + REPO + "/contents/data.js?ref=main&t=" + Date.now(),
      { headers: { Accept: "application/vnd.github.raw" }, signal: ctrl.signal });
    clearTimeout(t);
    if (r.ok) {
      const txt = await r.text();
      window.DADOS = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
    }
  } catch (e) { /* usa o data.js do Pages */ }
})();
