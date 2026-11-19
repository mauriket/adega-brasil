/* =====================================================
   Motion: transições leves do painel (abas, janelas, lista)
   Só transform/opacity. Respeita "reduzir movimento".
   ===================================================== */
window.Motion = (() => {
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = () => innerWidth <= 760;
  const suave = "cubic-bezier(.2, .8, .2, 1)";
  let ultimoClique = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointerdown", (e) => { ultimoClique = { x: e.clientX, y: e.clientY }; }, { capture: true, passive: true });

  const anim = (el, quadros, opts) => (calmo || !el || !el.animate ? null : el.animate(quadros, opts));
  // Espera a animação acabar, sem nunca ficar preso (aba em segundo plano congela animações)
  const fim = (a) => {
    if (!a) return Promise.resolve();
    const dur = (a.effect && a.effect.getComputedTiming().endTime) || 400;
    return Promise.race([a.finished.catch(() => {}), new Promise((r) => setTimeout(r, dur + 60))]);
  };

  // Troca de aba
  const sairAba = (el) => (!el || el.hidden ? Promise.resolve()
    : fim(anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-in" })));
  const entrarAba = (el) => { anim(el, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: suave }); };

  // Janela abre / fecha
  function abrirModal(el) {
    if (celular()) return anim(el, [{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 300, easing: suave });
    const r = el.getBoundingClientRect();
    const ox = (ultimoClique.x - (r.left + r.width / 2)) * 0.3, oy = (ultimoClique.y - (r.top + r.height / 2)) * 0.3;
    anim(el, [
      { transform: `translate(-50%, -50%) translate(${ox}px, ${oy}px) scale(.92)`, opacity: 0 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
    ], { duration: 300, easing: suave });
  }
  const fecharModal = (el) => fim(anim(el, celular()
    ? [{ transform: "none" }, { transform: "translateY(100%)" }]
    : [{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 }, { transform: "translate(-50%, -48%) scale(.96)", opacity: 0 }],
    { duration: 180, easing: "ease-in" }));

  // Item sai da lista (excluir)
  const sair = (el) => fim(anim(el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(30px)" }], { duration: 220, easing: "ease-in" }));

  // Lista reorganiza deslizando (só no computador e com listas pequenas)
  function flip(container, mudar, chave = (el) => el.dataset.key) {
    if (calmo || !container || celular() || container.children.length > 60) { mudar(); return; }
    const antes = new Map();
    for (const el of container.children) { const k = chave(el); if (k) antes.set(k, el.getBoundingClientRect()); }
    mudar();
    for (const el of container.children) {
      const k = chave(el), a = k && antes.get(k);
      if (!a) continue;
      const b = el.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
      if (dx || dy) anim(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 320, easing: suave });
    }
  }

  return { sairAba, entrarAba, abrirModal, fecharModal, sair, flip, calmo };
})();
