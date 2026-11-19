/* Painel: tema salvo e proteção contra ser aberto dentro de outro site (clickjacking) */
(function () {
  if (window.top !== window.self) {
    document.documentElement.style.display = "none";
    try { window.top.location = window.self.location.href; } catch (e) {}
  }
  try { document.documentElement.dataset.theme = localStorage.getItem("adega_admin_tema") || "dark"; } catch (e) {}
})();
