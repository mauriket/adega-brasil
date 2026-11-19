/* =====================================================
   Motion: microinterações do painel (sem bibliotecas)
   Respeita "reduzir movimento" do sistema.
   ===================================================== */
window.Motion = (() => {
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fino = window.matchMedia("(pointer: fine)").matches;
  const mola = "cubic-bezier(.34, 1.56, .64, 1)";
  const suave = "cubic-bezier(.2, .8, .2, 1)";
  let ultimoClique = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointerdown", (e) => { ultimoClique = { x: e.clientX, y: e.clientY }; }, true);

  const anim = (el, quadros, opts) => (calmo || !el || !el.animate ? null : el.animate(quadros, opts));
  // Espera a animação acabar — mas nunca fica preso (aba em segundo plano congela animações)
  const fim = (a) => {
    if (!a) return Promise.resolve();
    const dur = (a.effect && a.effect.getComputedTiming().endTime) || 500;
    return Promise.race([a.finished.catch(() => {}), new Promise((r) => setTimeout(r, dur + 60))]);
  };

  // ---------- Luz que segue o mouse (cartões, itens, tiles) ----------
  const ALVOS_LUZ = ".card, .item, .tile, .kpi, .mini-item, .chip, .search";
  if (fino && !calmo) {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest(ALVOS_LUZ);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  // ---------- Inclinação 3D (cartões de promoção e atalhos) ----------
  const ALVOS_TILT = ".pcard, .tile";
  if (fino && !calmo) {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest(ALVOS_TILT);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`;
      el.classList.add("tilt");
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const el = e.target.closest(ALVOS_TILT);
      if (el && !el.contains(e.relatedTarget)) { el.style.transform = ""; el.classList.remove("tilt"); }
    });
  }

  // ---------- Botões magnéticos ----------
  if (fino && !calmo) {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest(".btn.accent, .circ, .top .brand");
      document.querySelectorAll(".magnet").forEach((m) => { if (m !== el) { m.style.translate = ""; m.classList.remove("magnet"); } });
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.18, dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
      el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      el.classList.add("magnet");
    }, { passive: true });
  }

  // ---------- Dock com lupa (aumenta o ícone e os vizinhos) ----------
  const dock = document.querySelector(".dock");
  if (dock && fino && !calmo) {
    const itens = () => [...dock.querySelectorAll(".dk")];
    dock.addEventListener("pointermove", (e) => {
      const vertical = getComputedStyle(dock).flexDirection === "column";
      itens().forEach((it) => {
        const r = it.getBoundingClientRect();
        const c = vertical ? r.top + r.height / 2 : r.left + r.width / 2;
        const d = Math.abs((vertical ? e.clientY : e.clientX) - c);
        const s = 1 + Math.max(0, 1 - d / 110) * 0.45;
        it.style.scale = s.toFixed(3);
      });
    });
    dock.addEventListener("pointerleave", () => itens().forEach((it) => { it.style.scale = ""; }));
  }

  // ---------- Fundo reage ao mouse ----------
  const bg = document.querySelector(".bg");
  if (bg && fino && !calmo) {
    let alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 };
    addEventListener("pointermove", (e) => { alvo = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 }; }, { passive: true });
    const loop = () => {
      atual.x += (alvo.x - atual.x) * 0.05; atual.y += (alvo.y - atual.y) * 0.05;
      bg.style.translate = `${(atual.x * -40).toFixed(1)}px ${(atual.y * -40).toFixed(1)}px`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  // ---------- Pop + partículas ao ligar um botão (⭐, 👁️, pausar) ----------
  function particulas(x, y, cor = "#ffc20e", qtd = 14, forca = 70) {
    if (calmo) return;
    for (let i = 0; i < qtd; i++) {
      const p = document.createElement("i");
      p.className = "particula";
      p.style.cssText = `left:${x}px;top:${y}px;background:${cor}`;
      document.body.appendChild(p);
      const ang = (Math.PI * 2 * i) / qtd + Math.random() * 0.5;
      const dist = forca * (0.6 + Math.random() * 0.6);
      p.animate([
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(0)`, opacity: 0 },
      ], { duration: 600 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => p.remove();
    }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".circ, .dk, .chip, .seg button, .dias button, .tile");
    if (!b) return;
    anim(b, [{ scale: 1 }, { scale: 0.82 }, { scale: 1.12 }, { scale: 1 }], { duration: 420, easing: mola });
    if (b.matches('.circ[data-a="destaque"]:not(.on)')) {
      const r = b.getBoundingClientRect();
      particulas(r.left + r.width / 2, r.top + r.height / 2, "#ffc20e", 16, 60);
    }
  });

  // ---------- Confete (publicação) ----------
  function confete(origem) {
    if (calmo) return;
    const r = origem ? origem.getBoundingClientRect() : { left: innerWidth / 2, top: 40, width: 0, height: 0 };
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const cores = ["#ffc20e", "#ffd84d", "#f59e0b", "#ffffff", "#25d366"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("i");
      c.className = "confete";
      c.style.cssText = `left:${cx}px;top:${cy}px;background:${cores[i % cores.length]};width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px`;
      document.body.appendChild(c);
      const ang = Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
      const v = 160 + Math.random() * 260;
      const dx = Math.cos(ang) * v * (Math.random() < 0.5 ? -1 : 1), dy = Math.sin(ang) * v * 0.5;
      c.animate([
        { transform: "translate(-50%,-50%) rotate(0)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% + ${dy * 0.4 - 60}px)) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 420}px)) rotate(${Math.random() * 900}deg)`, opacity: 0 },
      ], { duration: 1500 + Math.random() * 900, easing: "cubic-bezier(.15,.6,.4,1)" }).onfinish = () => c.remove();
    }
  }

  // ---------- Troca de aba ----------
  async function sairAba(el) {
    if (!el || el.hidden) return;
    await fim(anim(el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(10px) scale(.99)" }], { duration: 160, easing: "ease-in" }));
  }
  function entrarAba(el) {
    if (!el) return;
    anim(el, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: suave });
  }

  // ---------- Modal abre/fecha a partir do clique ----------
  function abrirModal(el) {
    if (calmo) return;
    const mobile = innerWidth <= 760;
    if (mobile) {
      anim(el, [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], { duration: 420, easing: suave });
      return;
    }
    const r = el.getBoundingClientRect();
    const ox = ultimoClique.x - (r.left + r.width / 2), oy = ultimoClique.y - (r.top + r.height / 2);
    anim(el, [
      { transform: `translate(-50%, -50%) translate(${ox}px, ${oy}px) scale(.3)`, opacity: 0, borderRadius: "60px" },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1, borderRadius: "26px" },
    ], { duration: 520, easing: "cubic-bezier(.2, 1.1, .3, 1)" });
    [...el.querySelectorAll(".m-body > *, .pf-main > *, .pf-side")].slice(0, 12).forEach((c, i) =>
      anim(c, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 400, delay: 120 + i * 35, easing: suave, fill: "backwards" }));
  }
  function fecharModal(el) {
    const mobile = innerWidth <= 760;
    return fim(anim(el, mobile
      ? [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }]
      : [{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 }, { transform: "translate(-50%, -48%) scale(.94)", opacity: 0 }],
      { duration: 200, easing: "ease-in" }));
  }

  // ---------- Item some (excluir) ----------
  function sair(el) {
    if (!el) return Promise.resolve();
    const h = el.offsetHeight;
    return fim(anim(el, [
      { opacity: 1, transform: "none", height: h + "px", marginBottom: getComputedStyle(el).marginBottom },
      { opacity: 0, transform: "translateX(40px) scale(.96)", height: h + "px", offset: 0.55 },
      { opacity: 0, transform: "translateX(40px) scale(.96)", height: "0px", paddingTop: 0, paddingBottom: 0, marginBottom: 0 },
    ], { duration: 420, easing: suave }));
  }

  // ---------- FLIP: lista se reorganiza deslizando ----------
  function flip(container, mudar, chave = (el) => el.dataset.key) {
    if (calmo || !container) { mudar(); return; }
    const antes = new Map();
    [...container.children].forEach((el) => { const k = chave(el); if (k) antes.set(k, el.getBoundingClientRect()); });
    mudar();
    [...container.children].forEach((el) => {
      const k = chave(el), a = k && antes.get(k);
      if (!a) return;
      el.style.animation = "none";
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (dx || dy) anim(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 480, easing: mola });
    });
  }

  // ---------- Número que "rola" quando muda ----------
  function pulsar(el) { anim(el, [{ scale: 1 }, { scale: 1.25, color: "var(--accent-text)" }, { scale: 1 }], { duration: 500, easing: mola }); }

  return { particulas, confete, sairAba, entrarAba, abrirModal, fecharModal, sair, flip, pulsar, calmo };
})();
