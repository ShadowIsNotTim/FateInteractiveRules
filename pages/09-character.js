/* V15 — чистовой вид листа */
(function () {
  "use strict";

  const figure = document.getElementById("sheet-figure");
  const button = document.getElementById("sheet-toggle");
  if (!figure || !button) return;

  button.addEventListener("click", function () {
    const clean = figure.classList.toggle("is-clean");
    button.textContent = clean ? "Показать подсветку" : "Показать чистый лист";
    button.setAttribute("aria-pressed", clean ? "true" : "false");
  });
})();

/* Пять аспектов: последние нажатия затухают по стеку */
(function () {
  "use strict";
  const pills = Array.from(document.querySelectorAll("#aspect-grid .aspect-pill"));
  if (!pills.length) return;
  let history = [];

  function render() {
    pills.forEach(function (pill) {
      const idx = history.indexOf(pill);
      const step = idx === -1 ? -1 : history.length - 1 - idx; // 0 — самый свежий
      pill.classList.toggle("is-active", step === 0);
      pill.classList.toggle("is-described", step !== -1);
      pill.setAttribute("aria-pressed", step === 0 ? "true" : "false");
      const opacities = [1, 0.8, 0.6, 0.4, 0.2]; // 5 уровней — все плашки видны
      const fade = step === -1 ? 1 : (opacities[step] != null ? opacities[step] : 0);
      pill.style.setProperty("--fade", String(fade));
    });
  }

  function push(pill) {
    history = history.filter(function (p) { return p !== pill; });
    history.push(pill);
    if (history.length > 5) history.shift(); // все пять умещаются
    render();
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () { push(pill); });
    pill.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        push(pill);
      }
    });
  });
})();
