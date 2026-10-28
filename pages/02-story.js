/* V2 — поток нарратива и «когда бросать» */
(function () {
  "use strict";

  const narrative = document.getElementById("narrative");
  const options = Array.from(document.querySelectorAll("#stake-options .stake-btn"));
  const caption = document.getElementById("step-caption");
  if (!narrative || !options.length) return;

  const captions = {
    obvious: "Действие очевидно и ничем не рискует — оно просто происходит. Без броска.",
    uncertain: "Исход важен и не предрешён: вклиниваются правила — 4dF + навык против сложности или защиты.",
    impossible: "Персонаж не может этого сделать: ведущий говорит «нет» или предлагает цену «да, но…». Без броска."
  };

  function setStake(stake) {
    narrative.dataset.stake = stake;
    options.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.dataset.stake === stake ? "true" : "false");
    });
    if (caption) caption.textContent = captions[stake] || "";
  }

  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setStake(btn.dataset.stake);
    });
  });

  setStake("obvious");

  /* ---------- Свободная сцена / конфликт ---------- */
  const modeCards = Array.from(document.querySelectorAll("#scene-mode .compare-card"));
  const modeLine = document.getElementById("mode-line");
  const modeGoto = document.getElementById("mode-goto");
  if (modeCards.length && modeLine) {
    const texts = {
      free: "Пример Ворона: он просто садится ближе к чужому столу и заказывает напиток — обстановка позволяет, бросок не нужен. Хватает разговора.",
      conflict: "Пример Ворона: хозяин достает арбалет, и вот уже стрела летит в чью-то сторону"
    };
    function setMode(mode) {
      modeCards.forEach(function (card) {
        const on = card.dataset.mode === mode;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-pressed", on ? "true" : "false");
      });
      modeLine.textContent = texts[mode] || "";
      if (modeGoto) modeGoto.classList.toggle("is-visible", mode === "conflict");
    }
    modeCards.forEach(function (card) {
      function pick() { setMode(card.dataset.mode); }
      card.addEventListener("click", pick);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          pick();
        }
      });
    });
    setMode("free");
  }
})();
