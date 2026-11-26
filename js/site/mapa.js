/* =====================================================
   Marcar a casa no mapa (para quem não acha o CEP ou quer o frete exato).
   Mapa do OpenStreetMap com Leaflet (cópia em js/vendor), carregado só quando o cliente abre.
   O cliente arrasta o mapa até o alfinete ficar em cima da casa (ou usa a localização do celular).
   ===================================================== */
window.MapaEntrega = (() => {
  let carregando = null;
  function carregarLeaflet() {
    if (window.L) return Promise.resolve();
    if (!carregando) {
      carregando = new Promise((ok, falha) => {
        const css = document.createElement("link");
        css.rel = "stylesheet"; css.href = "css/vendor/leaflet.css";
        document.head.appendChild(css);
        const s = document.createElement("script");
        s.src = "js/vendor/leaflet.js"; s.onload = ok; s.onerror = () => { carregando = null; falha(new Error("mapa")); };
        document.head.appendChild(s);
      });
    }
    return carregando;
  }

  // posição → endereço (rua, bairro, cidade, UF, CEP), pelo OpenStreetMap
  async function enderecoDe(lat, lng) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR`);
      if (!r.ok) return null;
      const a = (await r.json()).address || {};
      return {
        rua: a.road || a.pedestrian || a.residential || a.footway || "",
        bairro: a.suburb || a.neighbourhood || a.quarter || a.city_district || "",
        cidade: a.city || a.town || a.village || a.municipality || "",
        uf: String(a["ISO3166-2-lvl4"] || "").replace(/^BR-/, ""),
        cep: String(a.postcode || "").replace(/\D/g, "").slice(0, 8),
      };
    } catch { return null; }
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const textoEnd = (e) => !e ? "Endereço não identificado. Confira o lugar do alfinete."
    : [e.rua, e.bairro, e.cidade && e.uf ? `${e.cidade}/${e.uf}` : e.cidade, e.cep ? `CEP ${e.cep.slice(0, 5)}-${e.cep.slice(5)}` : ""].filter(Boolean).join(" · ") || "Endereço não identificado. Confira o lugar do alfinete.";

  // Abre o mapa em tela cheia. Devolve { lat, lng, end } ou null (fechou sem confirmar).
  function abrir({ centro, zoom = 15 }) {
    return new Promise(async (resolve) => {
      const tela = document.createElement("div");
      tela.className = "mapa-tela";
      tela.setAttribute("role", "dialog"); tela.setAttribute("aria-modal", "true"); tela.setAttribute("aria-label", "Marcar minha casa no mapa");
      tela.innerHTML = `
        <header class="mapa-topo"><div><b>Onde fica a sua casa?</b><span>Arraste o mapa até o alfinete ficar em cima da sua casa.</span></div>
          <button type="button" class="mapa-fechar" aria-label="Fechar">✕</button></header>
        <div class="mapa-area"><div class="mapa-alvo" aria-hidden="true"></div><p class="mapa-carregando"><span class="spin"></span> Carregando mapa…</p></div>
        <div class="mapa-rodape">
          <p class="mapa-end" aria-live="polite">Arraste o mapa ou use sua localização.</p>
          <div class="mapa-botoes">
            <button type="button" class="btn btn-secondary" data-gps>Usar minha localização</button>
            <button type="button" class="btn btn-primary" data-ok disabled>Confirmar este local</button>
          </div>
        </div>`;
      document.body.appendChild(tela);
      document.documentElement.classList.add("travado");
      const $ = (sel) => tela.querySelector(sel);
      const foco = document.activeElement;
      let mapa = null, atual = null, seq = 0, espera = null;
      function fechar(valor) {
        document.removeEventListener("keydown", tecla, true);
        if (mapa) mapa.remove();
        tela.remove();
        if (!document.querySelector("#cartDrawer.open")) document.documentElement.classList.remove("travado");
        if (foco && foco.focus) foco.focus({ preventScroll: true });
        resolve(valor);
      }
      const tecla = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); fechar(null); } };
      document.addEventListener("keydown", tecla, true);
      $(".mapa-fechar").onclick = () => fechar(null);
      $(".mapa-fechar").focus();

      try { await carregarLeaflet(); }
      catch { $(".mapa-carregando").textContent = "Não foi possível abrir o mapa agora. Confira a internet e tente de novo."; return; }
      $(".mapa-carregando").remove();
      mapa = L.map($(".mapa-area"), { zoomControl: true, attributionControl: true }).setView(centro, zoom);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(mapa);

      // a cada parada do mapa, descobre o endereço do ponto do alfinete (no máximo 1 consulta por segundo)
      const atualizar = () => {
        const c = mapa.getCenter(), meu = ++seq;
        $("[data-ok]").disabled = true;
        $(".mapa-end").innerHTML = '<span class="spin"></span> Procurando o endereço…';
        clearTimeout(espera);
        espera = setTimeout(async () => {
          const end = await enderecoDe(c.lat.toFixed(6), c.lng.toFixed(6));
          if (meu !== seq) return;
          atual = { lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6), end };
          $(".mapa-end").innerHTML = esc(textoEnd(end));
          $("[data-ok]").disabled = false;
        }, 900);
      };
      mapa.on("moveend", atualizar);
      atualizar();

      $("[data-gps]").onclick = () => {
        if (!navigator.geolocation) { $(".mapa-end").textContent = "Este aparelho não informa a localização. Arraste o mapa."; return; }
        $(".mapa-end").innerHTML = '<span class="spin"></span> Pegando sua localização…';
        navigator.geolocation.getCurrentPosition(
          (p) => mapa.setView([p.coords.latitude, p.coords.longitude], 18),
          () => { $(".mapa-end").textContent = "Não foi possível pegar sua localização. Arraste o mapa até a sua casa."; },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
        );
      };
      $("[data-ok]").onclick = () => { if (atual) fechar(atual); };
    });
  }

  return { abrir };
})();
