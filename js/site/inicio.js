/* Aviso de idade (18+) */
(function () {
  var gate = document.getElementById("ageGate"), ok = false;
  try { ok = sessionStorage.getItem("adega_18") === "1"; } catch (e) {}
  if (ok) { gate.remove(); return; }
  // "idade": enquanto pergunta, só o copo enchendo aparece no fundo (os produtos entram depois do "Sim")
  document.documentElement.classList.add("travado", "idade");
  document.getElementById("ageYes").onclick = function () {
    try { sessionStorage.setItem("adega_18", "1"); } catch (e) {}
    gate.classList.add("saindo");
    document.documentElement.classList.remove("travado", "idade");
    setTimeout(function () { gate.remove(); }, 400);
  };
  document.getElementById("ageNo").onclick = function () {
    gate.querySelector("p").textContent = "Desculpe, o acesso é permitido apenas para maiores de 18 anos.";
    gate.querySelector("h2").textContent = "Acesso não permitido";
    document.getElementById("ageYes").remove();
    this.remove();
  };
})();

/* Fundo: copo de chope enchendo.
   6 fotos alinhadas (img/copo/c1..c6: vazio → cheio). Entre uma foto e a seguinte, a seguinte aparece
   por baixo de uma "linha da cerveja" que sobe (máscara de borda suave): o nível sobe sem pular de foto em foto. */
(function () {
  var cena = document.getElementById("copoCena");
  if (!cena) return;
  var base = cena.children[0], topo = cena.children[1];
  // jato: coluna da foto 2 (j1 = do bico até a cerveja; j2 = a mesma coluna deslocada para baixo, para o jato chegar ao fundo do copo vazio)
  var j1 = cena.children[2], j2 = cena.children[3];
  var foto = function (k) { return 'url("img/copo/c' + k + '.webp")'; };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { base.style.backgroundImage = foto(6); return; }

  // Altura da superfície da cerveja em cada foto (fração da foto, de cima). Foto 1 = fundo do copo (vazio).
  var NIVEL = [0, .945, .742, .677, .528, .364, .36];
  var F = 1.4;                      // borda suave da linha (% da altura)
  var M = 3;                        // a linha passa um pouco da espuma nova
  var JATO_TOPO = 36.5, JATO_FIM = 74.5, DESLOC = 20.5; // jato na foto 2 (% da altura, de cima)
  // de/para = fotos
  var ROTEIRO = [
    { t: "espera", de: 1, ms: 1200 },
    { t: "enche", de: 1, para: 2, ms: 2300, jato: 380 },              // o jato desce e começa a encher
    { t: "enche", de: 2, para: 3, ms: 700 },
    { t: "enche", de: 3, para: 4, ms: 1500 },
    { t: "enche", de: 4, para: 6, ms: 2300, freia: true },  // enche até a boca; o jato some na espuma
    { t: "derrama", de: 6, para: 5, ms: 1000, bico: true },  // a espuma derrama e escorre pelo copo
    { t: "funde", de: 5, para: 6, ms: 1500, bico: true },    // e assenta
    { t: "espera", de: 6, ms: 6000 },                        // copo cheio
    { t: "esvaziar", de: 6, para: 1, ms: 2300 }              // a cerveja desce (como se alguém bebesse) e recomeça
  ];
  // Na foto 5 a torneira ainda está aberta: durante a espuma derramando, o bico mostra a foto 6 (torneira fechada)
  var BICO = "linear-gradient(to right,transparent 63.5%,#000 66%,#000 80%,transparent 83%)";

  var preto = function (a) { return "rgba(0,0,0," + Math.max(0, Math.min(1, a)).toFixed(3) + ")"; };
  var pc = function (v) { return Math.max(0, Math.min(100, v)).toFixed(2) + "%"; };
  var suave = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  function grad(dir, p) { return "linear-gradient(" + dir + "," + p.map(function (x) { return preto(x[0]) + " " + pc(x[1]); }).join(",") + ")"; }
  // Máscara da foto seguinte (posições em % a partir da borda indicada por dir):
  //  - antes do nível velho: a cerveja que já estava troca depressa (aBaixo), sem espuma antiga "fantasma";
  //  - entre o nível velho e a linha e: a foto nova inteira (a cerveja subindo);
  //  - entre a linha e o nível novo: nada da foto nova (sem cerveja adiantada);
  //  - acima do nível novo (torneira, fundo): troca devagar (aCima).
  function linha(dir, aBaixo, aCima, velho, novo, e) {
    var dentro = Math.min(1, aBaixo + (e - velho) / (3 * F)), fim = novo + M, z = e + F >= fim ? aCima : 0;
    var p = [[aBaixo, 0], [aBaixo, velho - F], [dentro, velho + F], [dentro, e - F], [z, e + F]];
    if (!z) p.push([0, fim], [aCima, fim + 2 * F]);
    p.push([aCima, 100]);
    return grad(dir, p);
  }
  function mascara(img, tam, pos) {
    var s = topo.style;
    s.webkitMaskImage = s.maskImage = img;
    s.webkitMaskSize = s.maskSize = tam || "100% 100%";
    s.webkitMaskPosition = s.maskPosition = pos || "0 0";
  }
  // mostra só a faixa [de, ate] (% da tela do copo, de cima) de uma coluna do jato deslocada "desloc" para baixo
  function recorte(el, de, ate, desloc) {
    if (ate <= de) { el.style.visibility = "hidden"; return; }
    var a = de - desloc, b = ate - desloc, m = grad("to bottom", [[0, a - .4], [1, a + .4], [1, b - 1.6], [0, b + .6]]); // ponta suave
    el.style.webkitMaskImage = el.style.maskImage = m;
    el.style.visibility = "visible";
  }
  function desenhar(p, ms) {
    var u = Math.min(1, ms / p.ms);
    if (p.t === "enche") {
      var j = p.jato || 0, v = j ? Math.max(0, (ms - j) / (p.ms - j)) : u;
      v = Math.min(1, v);
      if (p.freia) v = 1 - Math.pow(1 - v, 1.6);
      var velho = (1 - NIVEL[p.de]) * 100, novo = (1 - NIVEL[p.para]) * 100;
      var e = velho + (novo + M + F - velho) * v;
      mascara(linha("to top", suave(v * 3), v * v * v, velho, novo, e));
      if (j) {
        // ponta do jato descendo do bico até o fundo; a parte de baixo some quando a cerveja sobe
        var s = JATO_TOPO + (NIVEL[1] * 100 - JATO_TOPO) * Math.min(1, ms / j), sup = 100 - e + 1;
        recorte(j1, JATO_TOPO, Math.min(s, JATO_FIM), 0);
        recorte(j2, JATO_FIM - 2.5, Math.min(s, sup), DESLOC);
      }
    } else if (p.t === "funde") {
      var a = suave(u);
      mascara(grad("to top", [[a, 0], [a, 100]]));
    } else if (p.t === "derrama") {
      // a foto 5 aparece de cima para baixo: a espuma passa da borda e escorre pelo copo
      var d = 30 + 74 * (1 - (1 - u) * (1 - u));
      mascara(grad("to bottom", [[1, 0], [1, d - 2 * F], [0, d + 2 * F]]));
    } else { // esvaziar: de cima para baixo
      var de = NIVEL[6] * 100, ate = NIVEL[1] * 100, w = suave(u);
      mascara(linha("to bottom", w, w, de, ate, de + (ate + M + F - de) * w));
    }
  }

  var atual = 0, inicio = 0;
  function entrar(n) {
    atual = n % ROTEIRO.length;
    var p = ROTEIRO[atual];
    base.style.backgroundImage = foto(p.de);
    j1.style.visibility = j2.style.visibility = "hidden";
    var k = j1.style;
    if (p.bico) { // j1 vira a "capa" do bico (torneira fechada da foto 6)
      k.backgroundImage = foto(6); k.webkitMaskImage = k.maskImage = BICO;
      k.clipPath = "inset(0 0 62.6% 0)"; k.visibility = "visible";
    } else if (p.jato) { // j1 volta a ser a coluna do jato
      k.backgroundImage = foto(2); k.webkitMaskImage = k.maskImage = ""; k.clipPath = "";
    }
    if (p.t === "espera") { topo.style.visibility = "hidden"; setTimeout(function () { entrar(atual + 1); }, p.ms); return; }
    topo.style.backgroundImage = foto(p.para);
    desenhar(p, 0);
    topo.style.visibility = "visible";
    inicio = performance.now();
    requestAnimationFrame(quadro);
  }
  function quadro(agora) {
    var p = ROTEIRO[atual], ms = Math.max(0, agora - inicio);
    desenhar(p, ms);
    if (ms >= p.ms) entrar(atual + 1); else requestAnimationFrame(quadro);
  }

  // Mostra o copo vazio já; a animação começa quando as 6 fotos estiverem prontas
  base.style.backgroundImage = foto(1);
  j1.style.backgroundImage = j2.style.backgroundImage = foto(2);
  j2.style.transform = "translateY(" + DESLOC + "%)";
  var fotos = [];
  var carregar = function (k) {
    return new Promise(function (ok, falha) {
      var im = new Image();
      if ("fetchPriority" in im) im.fetchPriority = k === 1 ? "high" : "low";
      im.onload = function () {
        // decode() deixa a foto pronta para trocar sem piscar; se demorar, segue assim mesmo
        if (im.decode) { im.decode().then(ok, ok); setTimeout(ok, 1500); } else ok();
      };
      im.onerror = falha;
      im.src = "img/copo/c" + k + ".webp";
      fotos.push(im); // mantém as fotos na memória
    });
  };
  Promise.all([1, 2, 3, 4, 5, 6].map(carregar)).then(function () { entrar(0); }, function () { /* sem animação: fica o copo parado */ });
})();
