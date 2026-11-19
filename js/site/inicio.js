/* Aviso de idade (18+) */
(function () {
  var gate = document.getElementById("ageGate"), ok = false;
  try { ok = sessionStorage.getItem("adega_18") === "1"; } catch (e) {}
  if (ok) { gate.remove(); return; }
  document.documentElement.classList.add("travado");
  document.getElementById("ageYes").onclick = function () {
    try { sessionStorage.setItem("adega_18", "1"); } catch (e) {}
    gate.classList.add("saindo");
    document.documentElement.classList.remove("travado");
    setTimeout(function () { gate.remove(); }, 400);
  };
  document.getElementById("ageNo").onclick = function () {
    gate.querySelector("p").textContent = "Desculpe, o acesso é permitido apenas para maiores de 18 anos.";
    gate.querySelector("h2").textContent = "Acesso não permitido";
    document.getElementById("ageYes").remove();
    this.remove();
  };
})();

/* Fundo: bolhas de cerveja subindo */
(function () {
  var bg = document.getElementById("bolhasBg");
  var calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var grande = innerWidth >= 900, n = innerWidth < 600 ? 14 : grande ? 30 : 22, k = grande ? 1.35 : 1, html = "";
  for (var i = 0; i < n; i++) {
    var r = Math.random(), t = Math.round((r < .55 ? 10 + Math.random() * 16 : r < .85 ? 26 + Math.random() * 20 : 46 + Math.random() * 26) * k);
    var dur = (11 + Math.random() * 13).toFixed(1), atraso = (-Math.random() * dur).toFixed(1);
    var estilo = "left:" + (Math.random() * 96).toFixed(1) + "%;width:" + t + "px;height:" + t + "px;opacity:" + (.45 + Math.random() * .45).toFixed(2) +
      ";background-position:" + (Math.floor(Math.random() * 6) * 20) + "% 0;";
    estilo += calmo ? "transform:translateY(" + (Math.random() * 100).toFixed(0) + "vh)" : "animation-duration:" + dur + "s;animation-delay:" + atraso + "s";
    html += '<i style="' + estilo + '"><b style="animation-duration:' + (2.5 + Math.random() * 3).toFixed(1) + 's"></b></i>';
  }
  bg.innerHTML = html;
  if (calmo) bg.classList.add("parado");
})();
