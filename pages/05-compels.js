/* V10 — навяз: интерактивная развилка «принять / отказаться» */
(function () {
  "use strict";

  const section = document.getElementById("v10");
  const tokensEl = document.getElementById("co-tokens");
  const countEl = document.getElementById("co-count");
  const offer = document.getElementById("co-offer");
  const offerState = document.getElementById("co-offer-state");
  const feedback = document.getElementById("co-feedback");
  const accept = document.getElementById("co-accept");
  const refuse = document.getElementById("co-refuse");
  const nextBtn = document.getElementById("co-next");
  const resetBtn = document.getElementById("co-reset");
  if (!section || !tokensEl || !offer || !accept || !refuse || !feedback) return;

  const state = { tokens: 3, done: false };

  function elCenter(node) {
    const r = node.getBoundingClientRect();
    return { left: r.left + r.width / 2, top: r.top + r.height / 2 };
  }

  function fly(from, to) {
    const el = document.createElement("span");
    el.className = "fate-token fate-token--fly";
    el.style.left = (from.left - 13) + "px";
    el.style.top = (from.top - 13) + "px";
    document.body.appendChild(el);
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    el.animate(
      [
        { transform: "translate(0, 0) scale(.7)", opacity: 1 },
        { transform: "translate(" + dx + "px, " + dy + "px) scale(1)", opacity: .9 }
      ],
      { duration: 400, easing: "cubic-bezier(.3,.6,.3,1)" }
    );
    window.setTimeout(function () { el.remove(); }, 420);
  }

  function floatAt(x, y, text, cls) {
    const el = document.createElement("span");
    el.className = "token-float" + (cls ? " " + cls : "");
    el.textContent = text;
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    el.animate(
      [
        { opacity: 0, transform: "translate(-50%, 0)" },
        { opacity: 1, transform: "translate(-50%, -34px)" }
      ],
      { duration: 900, easing: "ease-out", fill: "forwards" }
    );
    window.setTimeout(function () { el.remove(); }, 950);
  }

  function renderTray() {
    tokensEl.innerHTML = "";
    for (let i = 0; i < state.tokens; i += 1) {
      const token = document.createElement("span");
      token.className = "fate-token";
      tokensEl.appendChild(token);
    }
    if (state.tokens === 0) {
      const empty = document.createElement("span");
      empty.className = "co-empty";
      empty.textContent = "жетоны кончились — отказ невозможен";
      tokensEl.appendChild(empty);
    }
    countEl.textContent = state.tokens;
  }

  function resetChoice() {
    state.done = false;
    accept.classList.remove("is-chosen", "is-disabled");
    refuse.classList.remove("is-chosen", "is-disabled");
    accept.setAttribute("aria-pressed", "false");
    refuse.setAttribute("aria-pressed", "false");
    offer.classList.remove("is-yes", "is-no");
    offerState.textContent = "выбор ещё не сделан";
    feedback.textContent = "Выбери, что сделает Ворон: принять навяз и получить жетон или заплатить жетон и остаться в стороне.";
  }

  function finish(kind) {
    state.done = true;
    accept.setAttribute("aria-pressed", kind === "accept" ? "true" : "false");
    refuse.setAttribute("aria-pressed", kind === "refuse" ? "true" : "false");
    if (kind === "accept") {
      accept.classList.add("is-chosen");
      refuse.classList.add("is-disabled");
      offer.classList.add("is-yes");
      offerState.textContent = "принято · +1 жетон";
    } else {
      refuse.classList.add("is-chosen");
      accept.classList.add("is-disabled");
      offer.classList.add("is-no");
      offerState.textContent = "отклонено · −1 жетон";
    }
  }

  function onAccept() {
    if (state.done) return;
    fly(elCenter(offer), elCenter(tokensEl));            // жетон прилетает от мастера
    state.tokens += 1;
    renderTray();
    requestAnimationFrame(function () {
      const last = tokensEl.lastElementChild;
      if (last) last.classList.add("is-new");
    });
    floatAt(elCenter(accept).left, elCenter(accept).top, "+1 жетон", "token-float--good");
    finish("accept");
    feedback.textContent = "Осложнение происходит: тебя узнают за столом. Ворон получает жетон и входит в историю.";
  }

  function onRefuse() {
    if (state.done) return;
    if (state.tokens <= 0) {
      refuse.classList.remove("is-shake");
      void refuse.getBoundingClientRect();
      refuse.classList.add("is-shake");
      feedback.textContent = "Жетонов нет — отказ невозможен. Остаётся только принять навяз.";
      return;
    }
    fly(elCenter(tokensEl), elCenter(offer));            // жетон уходит мастеру
    state.tokens -= 1;
    renderTray();
    floatAt(elCenter(refuse).left, elCenter(refuse).top, "−1 жетон", "token-float--bad");
    finish("refuse");
    feedback.textContent = "Ты избегаешь проблемы: жетон уходит мастеру, выбор остаётся за Вороном.";
  }

  accept.addEventListener("click", onAccept);
  refuse.addEventListener("click", onRefuse);
  accept.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onAccept();
    }
  });
  refuse.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRefuse();
    }
  });
  if (nextBtn) nextBtn.addEventListener("click", resetChoice);
  if (resetBtn) resetBtn.addEventListener("click", function () {
    state.tokens = 3;
    renderTray();
    resetChoice();
  });

  renderTray();
})();

/* V9 — экономика жетонов: динамика */
(function () {
  "use strict";

  const box = document.getElementById("v9");
  const playerTray = document.getElementById("eco-player-tokens");
  const gmTray = document.getElementById("eco-gm-tokens");
  const playerCount = document.getElementById("eco-player-count");
  const gmCount = document.getElementById("eco-gm-count");
  const feedback = document.getElementById("eco-feedback");
  if (!box || !playerTray || !gmTray) return;

  const state = { player: 3, gm: 0 };

  function renderTray(tray, count, gm) {
    tray.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const token = document.createElement("span");
      token.className = "fate-token" + (gm ? " fate-token--gm" : "");
      tray.appendChild(token);
    }
  }

  function render(popFor) {
    const oldPlayer = playerTray.childElementCount;
    const oldGm = gmTray.childElementCount;
    renderTray(playerTray, state.player, false);
    renderTray(gmTray, state.gm, true);
    playerCount.textContent = state.player;
    gmCount.textContent = state.gm;
    if (popFor === "player") {
      for (let i = oldPlayer; i < state.player; i += 1) {
        playerTray.children[i].classList.add("is-new");
      }
    }
    if (popFor === "gm") {
      for (let i = oldGm; i < state.gm; i += 1) {
        gmTray.children[i].classList.add("is-new");
      }
    }
  }

  function boxCenter(grp) {
    const r = grp.getBoundingClientRect();
    return { left: r.left + r.width / 2, top: r.top + r.height / 2 };
  }

  function trayCenter(tray) {
    const r = tray.getBoundingClientRect();
    return { left: r.left + r.width / 2, top: r.top + r.height / 2 };
  }

  function floatAt(x, y, text, cls) {
    const el = document.createElement("span");
    el.className = "token-float" + (cls ? " " + cls : "");
    el.textContent = text;
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    el.animate(
      [
        { opacity: 0, transform: "translate(-50%, 0)" },
        { opacity: 1, transform: "translate(-50%, -34px)" }
      ],
      { duration: 900, easing: "ease-out", fill: "forwards" }
    );
    window.setTimeout(function () { el.remove(); }, 950);
  }

  function fly(from, to, gm) {
    const el = document.createElement("span");
    el.className = "fate-token fate-token--fly" + (gm ? " fate-token--gm" : "");
    el.style.left = (from.left - 13) + "px";
    el.style.top = (from.top - 13) + "px";
    document.body.appendChild(el);
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    el.animate(
      [
        { transform: "translate(0, 0) scale(.7)", opacity: 1 },
        { transform: "translate(" + dx + "px, " + dy + "px) scale(1)", opacity: .9 }
      ],
      { duration: 400, easing: "cubic-bezier(.3,.6,.3,1)" }
    );
    window.setTimeout(function () { el.remove(); }, 420);
  }

  function flash(grp) {
    grp.classList.remove("is-flash");
    void grp.getBoundingClientRect();
    grp.classList.add("is-flash");
    window.setTimeout(function () { grp.classList.remove("is-flash"); }, 500);
  }

  function act(action, grp) {
    flash(grp);
    const center = boxCenter(grp);

    if (action === "refresh") {
      state.player = 3;
      state.gm = 0;
      render("player");
      floatAt(center.left, center.top - 30, "3 жетона", "token-float--good");
      return;
    }

    if (action === "spend" || action === "refuse") {
      if (state.player <= 0) {
        feedback.textContent = "У игрока нет жетонов. Проще всего вернуть их: кликни «Навяз принят».";
        return;
      }
      state.player -= 1;
      state.gm += 1;
      fly(center, trayCenter(gmTray), false);
      render("gm");
      floatAt(center.left, center.top, action === "spend" ? "жетон мастеру" : "−1 жетон", "token-float--bad");
      feedback.textContent = action === "spend"
        ? "Потратил на призыв: игрок −1, мастер +1. Жетон ушёл мастеру."
        : "Отказ от навязя: игрок −1, мастер +1.";
      return;
    }

    if (action === "compel") {
      if (state.gm <= 0) {
        feedback.textContent = "У мастера пусто: сперва потрать жетон на призыв («Потратил»), а потом возвращай его навязом.";
        return;
      }
      state.gm -= 1;
      state.player += 1;
      fly(center, trayCenter(playerTray), true);
      render("player");
      floatAt(center.left, center.top, "+1 жетон", "token-float--good");
      feedback.textContent = "Навяз принят: жетон возвращается игроку.";
    }
  }

  box.querySelectorAll("g.eco-grp").forEach(function (grp) {
    grp.addEventListener("click", function () {
      act(grp.dataset.action, grp);
    });
    grp.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        act(grp.dataset.action, grp);
      }
    });
  });

  render();
})();
