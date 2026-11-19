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
    this.remove();
  };
})();
