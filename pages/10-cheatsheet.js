/* V16 — шпаргалка с подсветкой и модалка пояснений */
(function () {
  "use strict";

  const figure = document.getElementById("cheat-figure");
  const button = document.getElementById("cheat-toggle");
  if (figure && button) {
    button.addEventListener("click", function () {
      const clean = figure.classList.toggle("is-clean");
      button.textContent = clean ? "Показать подсветку" : "Показать чистый лист";
      button.setAttribute("aria-pressed", clean ? "true" : "false");
    });
  }

  /* Модалка для «заявить деталь» и «помочь в броске» */
  const backdrop = document.getElementById("modal-backdrop");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalClose = document.getElementById("modal-close");
  const texts = {
    detail: {
      title: "Заявить деталь",
      body: "В свободной сцене игрок может объявить уместную деталь окружения: «Я знаю этот город — здесь мы укроемся». Ведущий либо принимает деталь, либо предлагает цену или проверку. Это не ход конфликта и не тратит жетон."
    },
    help: {
      title: "Помочь в броске",
      body: "Когда другой персонаж бросает проверку, ты можешь помочь: опиши, как вплетаешь своё действие. Обычно это даёт +1 к броску (до +2, максимум двое помощников). Помощь — это вклад в сцену, а не фоновое «поддерживаю»."
    }
  };
  if (backdrop && modalClose) {
    function open(key) {
      const item = texts[key];
      if (!item) return;
      modalTitle.textContent = item.title;
      modalText.textContent = item.body;
      backdrop.hidden = false;
    }
    function closeModal() {
      backdrop.hidden = true;
    }
    document.addEventListener("click", function (event) {
      const btn = event.target.closest("[data-modal]");
      if (btn) {
        open(btn.getAttribute("data-modal"));
        return;
      }
      if (event.target === backdrop) closeModal();
    });
    modalClose.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
    });
  }
})();
