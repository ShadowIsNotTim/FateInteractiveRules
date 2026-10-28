/* Страница «Трюки» — интерактив */
(function () {
  "use strict";

  /* Конструкторы трюков: селекты для навыков/вариантов,
     текстовые поля для описаний с плейсхолдером. */
  function fill(fields) {
    fields.forEach(function (f) {
      const el = document.getElementById(f.id);
      if (!el) return;
      if (f.type === "select") {
        (f.options || []).forEach(function (item) {
          const opt = document.createElement("option");
          opt.value = item;
          opt.textContent = item;
          el.appendChild(opt);
        });
        el.value = f.value;
      } else {
        el.value = f.value || "";
        if (f.placeholder) el.setAttribute("placeholder", f.placeholder);
        el.setAttribute("autocomplete", "off");
        function fit() {
          const base = Math.max(el.value.length, (f.placeholder || "").length);
          el.style.width = (base + 1) + "ch";
        }
        el.addEventListener("input", fit);
        fit();
      }
    });
  }

  /* 1 · +2 в конкретной ситуации */
  fill([
    { id: "builder-skill", type: "select", options: ["Взлому", "Скрытности", "Обману", "Общению", "Атлетике", "Драке", "Внимательности", "Расследованию", "Эмпатии", "Ресурсам", "Воле"], value: "Взлому" },
    { id: "builder-when", type: "text", value: "когда в помещении кто-то есть", placeholder: "например: когда замок старый и ржавый" }
  ]);

  /* 2 · Один навык заменяет другой */
  fill([
    { id: "b2-skill", type: "select", options: ["Взлом", "Скрытность", "Обман", "Общение", "Атлетика", "Внимательность", "Расследование", "Эмпатия", "Ресурсы", "Воля"], value: "Взлом" },
    { id: "b2-vs", type: "select", options: ["Обмана", "Взлома", "Скрытности", "Общения", "Атлетики", "Внимательности", "Расследования", "Эмпатии", "Ресурсов", "Воли"], value: "Обмана" },
    { id: "b2-purpose", type: "text", value: "незаметно подбросить предмет", placeholder: "например: незаметно подбросить предмет" }
  ]);

  /* 3 · Раз за сцену — рычаг */
  fill([
    { id: "b3-per", type: "select", options: ["сцену", "сессию"], value: "сцену" },
    { id: "b3-when", type: "text", value: "рядом есть публика", placeholder: "например: рядом есть публика" },
    { id: "b3-effect", type: "select", options: ["бесплатный призыв", "буст", "переброс провала"], value: "бесплатный призыв" }
  ]);

  /* 4 · Разрешение */
  fill([
    { id: "b4-can", type: "text", value: "понимать язык крыс", placeholder: "например: понимать язык крыс" },
    { id: "b4-limit", type: "select", options: ["не больше одного вопроса за сцену", "только один раз за сессию", "только когда рядом никого нет", "только в полной темноте", "только если никто не видит"], value: "не больше одного вопроса за сцену" }
  ]);

  /* ---------- Плохие трюки: спойлер на вскрытие ---------- */
  const badStunts = Array.from(document.querySelectorAll(".bad-stunt"));
  badStunts.forEach(function (card) {
    const spoiler = card.querySelector(".spoiler");
    if (!spoiler) return;
    function toggle() {
      const shown = card.classList.toggle("is-shown");
      spoiler.setAttribute("aria-expanded", shown ? "true" : "false");
    }
    spoiler.addEventListener("click", toggle);
    spoiler.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  });

  /* ---------- Как придумать: путь от наброска к трюку ---------- */
  const pathStage = document.getElementById("path-stage");
  const pathBtns = Array.from(document.querySelectorAll(".path-btn"));
  const pathReset = document.getElementById("path-reset");
  if (pathStage && pathBtns.length) {
    const steps = {
      "1": '<span class="path-kicker">1 · набросок</span>' +
        '<p>«Ну… мой Ворон на публике встаёт и так уверенно лжёт при всех».</p>' +
        '<p>Это ещё не трюк. Ловим особенность: здесь важно <b>место</b> — все смотрят.</p>',
      "2": '<span class="path-kicker">2 · проверка</span>' +
        '<p>Ложь → проверка <b>Обмана</b> · особенность: <b>публичное место</b>.</p>',
      "3": '<span class="path-kicker">3 · трюк</span>' +
        '<p><b>«Красивая ложь».</b> Раз за сцену перебрось провал <b>Обмана</b>, если ложь была <b>произнесена публично</b>.</p>'
    };
    function show(step) {
      pathStage.className = "path-stage path-stage--" + step;
      pathStage.innerHTML = steps[step] || "";
      pathBtns.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.dataset.step === step);
      });
    }
    pathBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        show(btn.dataset.step);
      });
    });
    if (pathReset) {
      pathReset.addEventListener("click", function () {
        show("1");
      });
    }
    show("1");
  }

  /* ---------- Сколько трюков: счётчик с refresh ---------- */
  const countPlus = document.getElementById("count-plus");
  const countMinus = document.getElementById("count-minus");
  const countNum = document.getElementById("count-num");
  const countUnit = document.getElementById("count-unit");
  const refreshTokens = document.getElementById("refresh-tokens");
  const refreshNum = document.getElementById("refresh-num");
  const countNote = document.getElementById("count-note");
  if (countPlus && countMinus && countNum) {
    let n = 3;

    function plural(value, one, few, many) {
      const m10 = value % 10;
      const m100 = value % 100;
      if (m10 === 1 && m100 !== 11) return one;
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
      return many;
    }

    function refresh() {
      return Math.max(1, n <= 3 ? 3 : 6 - n);
    }

    function render() {
      countNum.textContent = n;
      countUnit.textContent = " " + plural(n, "трюк", "трюка", "трюков");

      const r = refresh();
      refreshNum.textContent = r;
      refreshTokens.innerHTML = "";
      for (let i = 0; i < r; i += 1) {
        const token = document.createElement("span");
        token.className = "fate-token";
        refreshTokens.appendChild(token);
      }

      if (n < 3) {
        countNote.innerHTML = "Свободных трюков осталось: <b>" + (3 - n) + "</b>; refresh полный — 3.";
      } else if (n === 3) {
        countNote.innerHTML = "Три бесплатных трюка — refresh 3.";
      } else {
        const extra = n - 3;
        let html = "Сверх бесплатных: <b>" + extra + " " + plural(extra, "трюк", "трюка", "трюков") +
          "</b>, каждый стоит −1 refresh → refresh <b>" + r + "</b>.";
        if (n >= 5) html += " Больше трюков не взять: refresh упёрся в минимум, дальше жетоны уже не платят.";
        countNote.innerHTML = html;
      }

      countPlus.disabled = n >= 5;
      countMinus.disabled = n <= 0;
    }

    countPlus.addEventListener("click", function () {
      if (n < 9) { n += 1; render(); }
    });
    countMinus.addEventListener("click", function () {
      if (n > 0) { n -= 1; render(); }
    });
    render();
  }
})();
