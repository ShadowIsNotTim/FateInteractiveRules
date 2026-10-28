/* V3.2 — бросок с аспектами */
(function () {
  "use strict";

  const drop = document.getElementById("adv-drop");
  const rollButton = document.getElementById("adv-roll");
  if (!drop || !rollButton) return;

  function fmt(n) {
    if (n > 0) return "+" + n;
    if (n < 0) return "−" + Math.abs(n);
    return "0";
  }

  function sum(values) {
    return values.reduce(function (a, b) { return a + b; }, 0);
  }

  function rollFour() {
    return Array.from({ length: 4 }, function () {
      return [-1, 0, 1][Math.floor(Math.random() * 3)];
    });
  }

  function outcomeText(total, difficulty) {
    if (total < difficulty) return "провал";
    if (total === difficulty) return "ничья";
    if (total >= difficulty + 3) return "успех со стилем";
    return "успех";
  }

  function outcomeClass(total, difficulty) {
    if (total < difficulty) return "is-fail";
    if (total === difficulty) return "is-tie";
    if (total >= difficulty + 3) return "is-style";
    return "is-success";
  }

  function renderDice(row, dice) {
    row.innerHTML = "";
    dice.forEach(function (value) {
      const die = document.createElement("span");
      die.className = "die" + (value > 0 ? " die--plus" : value < 0 ? " die--minus" : "");
      die.textContent = value > 0 ? "+" : value < 0 ? "−" : "0";
      row.appendChild(die);
    });
  }

  const state = { dice: [1, 0, 0, 0], skill: 4, skillName: "Взлом", difficulty: 5, active: [], tokens: 3 };
  const diceRow = document.getElementById("adv-dice-row");
  const diceTotal = document.getElementById("adv-dice-total");
  const skillSelect = document.getElementById("adv-skill");
  const resultTotal = document.getElementById("adv-result-total");
  const resultOutcome = document.getElementById("adv-outcome");
  const liveFormula = document.getElementById("adv-live-formula");
  const liveOutcome = document.getElementById("adv-live-outcome");
  const aspectHint = document.getElementById("adv-aspect-hint");
  const aspectTotal = document.getElementById("adv-aspect-total");
  const dropHint = document.getElementById("adv-drop-hint");
  const activeWrap = document.getElementById("adv-active-aspects");
  const feedback = document.getElementById("adv-feedback");
  const tokenPool = document.getElementById("adv-token-pool");
  const cards = Array.from(document.querySelectorAll("#adv-aspect-cards .aspect-card"));
  const reset = document.getElementById("adv-reset");
  let selectedAspect = null;

  function showFeedback(message, ok) {
    feedback.hidden = false;
    feedback.textContent = message;
    feedback.classList.toggle("is-ok", ok);
  }

  function updateSelection() {
    cards.forEach(function (card) {
      card.classList.toggle("is-selected", card.dataset.aspect === selectedAspect);
    });
  }

  function renderTokens() {
    tokenPool.innerHTML = "";
    for (let i = 0; i < state.tokens; i += 1) {
      const token = document.createElement("span");
      token.className = "fate-token";
      token.draggable = true;
      token.title = "Перетащи на активный аспект";
      token.addEventListener("dragstart", function (event) {
        event.dataTransfer.setData("text/plain", "token");
        event.dataTransfer.effectAllowed = "move";
      });
      tokenPool.appendChild(token);
    }
    if (state.tokens === 0) {
      const empty = document.createElement("span");
      empty.className = "small muted";
      empty.textContent = "жетоны кончились";
      tokenPool.appendChild(empty);
    }
  }

  function renderActive() {
    activeWrap.innerHTML = "";
    state.active.forEach(function (aspect) {
      const chip = document.createElement("div");
      chip.className = "active-aspect" + (aspect.invoked ? " is-invoked" : "");
      chip.dataset.id = aspect.id;

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = aspect.name;

      const label = document.createElement("span");
      label.className = "state";
      label.textContent = aspect.invoked ? "призван +2 · клик, чтобы снять" : "не призван · перетащи жетон или кликни";

      chip.appendChild(name);
      chip.appendChild(label);
      chip.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleAspect(aspect.id);
      });
      chip.addEventListener("dragover", function (event) {
        event.preventDefault();
        chip.classList.add("is-over");
      });
      chip.addEventListener("dragleave", function () {
        chip.classList.remove("is-over");
      });
      chip.addEventListener("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();
        chip.classList.remove("is-over");
        if (event.dataTransfer.getData("text/plain") === "token") invokeAspect(aspect.id);
      });
      activeWrap.appendChild(chip);
    });
  }

  function aspectBonus() {
    return state.active.filter(function (aspect) { return aspect.invoked; }).length * 2;
  }

  function render() {
    renderDice(diceRow, state.dice);
    renderTokens();
    renderActive();

    const diceSum = sum(state.dice);
    const bonus = aspectBonus();
    const total = diceSum + state.skill + bonus;
    const text = outcomeText(total, state.difficulty);
    const cls = outcomeClass(total, state.difficulty);

    diceTotal.textContent = fmt(diceSum);
    aspectTotal.textContent = fmt(bonus);
    aspectHint.textContent = state.active.length
      ? (state.active.filter(function (a) { return a.invoked; }).length + " из " + state.active.length + " призвано")
      : "перетащи аспект";
    resultTotal.textContent = fmt(total);
    resultTotal.className = "f-value " + cls;
    resultOutcome.textContent = text;
    resultOutcome.className = cls;
    liveFormula.textContent = "4dF (" + fmt(diceSum) + ") + навык " + fmt(state.skill) + " + аспекты " + fmt(bonus) + " = " + fmt(total);
    liveOutcome.textContent = "против " + fmt(state.difficulty) + " → " + text;
    liveOutcome.className = cls;
    dropHint.textContent = state.active.length
      ? "Активные аспекты:"
      : "Перетащи сюда аспект, который подходит к выбранному навыку. Или выбери аспект и кликни здесь.";
  }

  function addAspect(id) {
    const card = cards.find(function (item) { return item.dataset.aspect === id; });
    if (!card) return;
    if (state.active.some(function (aspect) { return aspect.id === id; })) {
      showFeedback("Этот аспект уже в броске.", true);
      return;
    }

    const fits = (card.dataset.fits || "").split(",").map(function (item) { return item.trim(); }).filter(Boolean);
    if (fits.indexOf(state.skillName) === -1) {
      showFeedback("«" + card.dataset.name + "» не подходит к навыку «" + state.skillName + "»: " + card.dataset.reason, false);
      return;
    }

    state.active.push({ id: id, name: card.dataset.name, invoked: false });
    selectedAspect = null;
    updateSelection();
    showFeedback("«" + card.dataset.name + "» подходит. Теперь перетащи на него жетон — или кликни по аспекту.", true);
    render();
  }

  function invokeAspect(id) {
    const aspect = state.active.find(function (item) { return item.id === id; });
    if (!aspect) return;
    if (aspect.invoked) {
      showFeedback("«" + aspect.name + "» уже призван. Кликни по нему, чтобы снять призыв.", true);
      return;
    }
    if (state.tokens <= 0) {
      showFeedback("Жетоны кончились. Призвать больше нечем.", false);
      return;
    }
    state.tokens -= 1;
    aspect.invoked = true;
    showFeedback("«" + aspect.name + "» призван: +2. Жетон ушёл мастеру.", true);
    render();
  }

  function toggleAspect(id) {
    const aspect = state.active.find(function (item) { return item.id === id; });
    if (!aspect) return;
    if (aspect.invoked) {
      aspect.invoked = false;
      state.tokens += 1;
      showFeedback("Призыв снят, жетон вернулся.", true);
      render();
    } else {
      invokeAspect(id);
    }
  }

  cards.forEach(function (card) {
    card.addEventListener("dragstart", function (event) {
      event.dataTransfer.setData("text/plain", "aspect:" + card.dataset.aspect);
      event.dataTransfer.effectAllowed = "copy";
      card.classList.add("is-dragging");
    });
    card.addEventListener("dragend", function () {
      card.classList.remove("is-dragging");
    });
    card.addEventListener("click", function () {
      selectedAspect = selectedAspect === card.dataset.aspect ? null : card.dataset.aspect;
      updateSelection();
    });
  });

  drop.addEventListener("dragover", function (event) {
    event.preventDefault();
    drop.classList.add("is-over");
  });
  drop.addEventListener("dragleave", function () {
    drop.classList.remove("is-over");
  });
  drop.addEventListener("drop", function (event) {
    event.preventDefault();
    drop.classList.remove("is-over");
    const data = event.dataTransfer.getData("text/plain");
    if (data.indexOf("aspect:") === 0) addAspect(data.slice(7));
  });
  drop.addEventListener("click", function () {
    if (selectedAspect) addAspect(selectedAspect);
  });

  skillSelect.addEventListener("change", function () {
    state.skill = Number(skillSelect.value);
    state.skillName = skillSelect.options[skillSelect.selectedIndex].dataset.name || "Взлом";
    state.active = [];
    state.tokens = 3;
    selectedAspect = null;
    updateSelection();
    showFeedback("Навык — «" + state.skillName + "». Аспекты и жетоны сброшены — попробуй снова.", true);
    render();
  });

  rollButton.addEventListener("click", function () {
    state.dice = rollFour();
    render();
  });

  reset.addEventListener("click", function () {
    state.dice = [1, 0, 0, 0];
    state.skill = 4;
    state.skillName = "Взлом";
    state.difficulty = 5;
    state.active = [];
    state.tokens = 3;
    selectedAspect = null;
    skillSelect.value = "4";
    feedback.hidden = true;
    updateSelection();
    render();
  });

  skillSelect.value = "4";
  render();
})();

/* V8 — рычаг аспекта: интерактив */
(function () {
  "use strict";

  const sides = Array.from(document.querySelectorAll("#lever .lever-side"));
  const sticker = document.getElementById("lever-sticker");
  const arrowL = document.getElementById("lever-arrow-l");
  const arrowR = document.getElementById("lever-arrow-r");
  const feedback = document.getElementById("lever-feedback");
  const leverGoto = document.getElementById("lever-goto");
  if (!sides.length || !sticker || !feedback) return;

  const texts = {
    invoke: "Жетон уходит мастеру, «Язык без костей» помогает уговорить: <b>+2 к броску</b> или переброс.",
    compel: "Мастер давит на аспект — ты не можешь промолчать и влипаешь в неприятности: получаешь <b>жетон</b>.",
    off: "Кликни по стороне — увидишь, как один и тот же аспект работает за тебя и против тебя."
  };
  let current = null;

  function render() {
    sides.forEach(function (side) {
      const isOn = side.dataset.side === current;
      side.classList.toggle("is-active", isOn);
      side.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
    sticker.classList.toggle("is-invoked", current === "invoke");
    sticker.classList.toggle("is-compelled", current === "compel");
    arrowL.classList.toggle("is-active", current === "invoke");
    arrowR.classList.toggle("is-active", current === "compel");
    feedback.innerHTML = current ? texts[current] : texts.off;
    if (leverGoto) leverGoto.classList.toggle("is-visible", current === "compel");
  }

  function toggle(side) {
    current = current === side ? null : side;
    render();
  }

  sides.forEach(function (side) {
    side.addEventListener("click", function () {
      toggle(side.dataset.side);
    });
    side.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle(side.dataset.side);
      }
    });
  });

  render();
})();
