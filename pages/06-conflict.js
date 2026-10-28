/* Страница «Конфликт» — интерактив */
(function () {
  "use strict";

  /* Помощник: панель с меняющимся текстом держит стабильную высоту,
     чтобы переключение вариантов не двигало страницу. */
  function stabilize(panel, variants) {
    let timer = null;
    function measure() {
      panel.style.height = "auto";
      const prev = panel.innerHTML;
      let max = 0;
      variants.forEach(function (html) {
        panel.innerHTML = html;
        max = Math.max(max, panel.getBoundingClientRect().height);
      });
      panel.style.height = max ? max + "px" : "";
      panel.innerHTML = prev;
    }
    function setText(html) {
      panel.innerHTML = html;
    }
    window.addEventListener("resize", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    });
    measure();
    return setText;
  }

  /* ---------- Когда это конфликт: переключатель режимов ---------- */
  const modeCards = Array.from(document.querySelectorAll("#scene-mode .compare-card"));
  const modeLine = document.getElementById("mode-line");
  if (modeCards.length && modeLine) {
    const texts = {
      free: "Время не важно: ходы не считаем. Разговариваем и бросаем по ставке. Достаточно преодоления и создания преимущества.",
      conflict: "Время важно: есть порядок ходов, цель и цена. Включаются атака, защита, стресс и последствия."
    };
    const setModeLine = stabilize(modeLine, [texts.free, texts.conflict]);
    function setMode(mode) {
      modeCards.forEach(function (card) {
        const on = card.dataset.mode === mode;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-pressed", on ? "true" : "false");
      });
      setModeLine(texts[mode] || "");
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

  /* ---------- V6: четыре действия — компактно, одно описание ---------- */
  const actionCards = Array.from(document.querySelectorAll(".action-card"));
  const actionDetail = document.getElementById("action-detail");
  if (actionCards.length && actionDetail) {
    const details = {
      overcome: "<span><b>Когда:</b> столы мешают пройти, дверь заперта, нужно перелезть или взломать.<br><b>Что получаешь:</b> препятствие больше не мешает.<br><b>Пример:</b> Ворон перелезает через стойку.</span>",
      advantage: "<span><b>Когда:</b> хочешь изменить обстановку в свою пользу.<br><b>Что получаешь:</b> аспект с бесплатным призывом или буст.<br><b>Пример:</b> опрокинуть поднос — «Враги отвлеклись».</span>",
      attack: "<span><b>Когда:</b> в конфликте хочешь вывести противника из сцены.<br><b>Что получаешь:</b> стресс = разница; со стилем — ещё буст.<br><b>Пример:</b> Ворон бьёт врага кружкой.</span>",
      defend: "<span><b>Когда:</b> тебя атакуют; это твоя реакция.<br><b>Что получаешь:</b> нет стресса; со стилем — буст.<br><b>Пример:</b> Ворон уклоняется и оказывается за столом.</span>"
    };
    const setActionDetail = stabilize(actionDetail, [details.overcome, details.advantage, details.attack, details.defend]);
    function select(action) {
      actionCards.forEach(function (card) {
        const on = card.dataset.action === action;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-pressed", on ? "true" : "false");
      });
      setActionDetail(details[action] || "");
    }
    actionCards.forEach(function (card) {
      function pick() { select(card.dataset.action); }
      card.addEventListener("click", pick);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          pick();
        }
      });
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
    });
    select("overcome");
  }

  /* ---------- V11: раунд конфликта — шаги с описанием ---------- */
  const tlSteps = Array.from(document.querySelectorAll("#round-steps .tl-step"));
  const tlDetail = document.getElementById("round-detail");
  if (tlSteps.length && tlDetail) {
    const details = {
      "1": "Решает история, а не кубик. Дальше ход передаётся тому, кто ещё не действовал в этом раунде.",
      "2a": "Перемещение по сцене — бонусный шаг: можно сделать, а можно пропустить. Обычное перемещение в соседние зоны действие не тратит; сложный манёвр — это уже преодоление.",
      "2": "Атака, создание преимущества или преодоление. Игрок говорит, что делает, и бросает кубики.",
      "3": "Бросок реакции на атаку. Защита — это ответ на атаку, а не отдельный ход: своё действие она не тратит.",
      "4": "Стресс, последствие или буст — смотрим на разницу и на матрицу исходов.",
      "5": "Следующему, кто ещё не ходил в этом раунде. Когда все сходили — начинается новый раунд."
    };
    const setRoundDetail = stabilize(tlDetail, [details["1"], details["2a"], details["2"], details["3"], details["4"], details["5"]]);
    function showStep(step) {
      tlSteps.forEach(function (el) {
        el.classList.toggle("is-active", el.dataset.step === step);
      });
      setRoundDetail(details[step] || "");
    }
    tlSteps.forEach(function (el) {
      function pick() { showStep(el.dataset.step); }
      el.addEventListener("click", pick);
      el.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          pick();
        }
      });
    });
    showStep("1");
  }

  /* ---------- V11.1: конфликт в динамике — инициатива ---------- */
  const conflictReset = document.getElementById("conflict-reset");
  const turnChipsWrap = document.getElementById("turn-chips");
  if (conflictReset && turnChipsWrap) {
    const chips = Array.from(turnChipsWrap.querySelectorAll(".turn-chip"));
    const turnLog = document.getElementById("turn-log");
    const turnEmpty = document.getElementById("turn-empty");
    const roundTag = document.getElementById("conflict-round");
    const roundNext = document.getElementById("round-next");
    const wheelRound = document.getElementById("wheel-round");
    const wheelNodes = Array.from(document.querySelectorAll("#initiative-wheel .init-node"));
    const combatants = Array.from(document.querySelectorAll(".combatant"));
    const kicker = document.getElementById("pick-kicker");
    const distracted = document.getElementById("scene-aspect-distracted");
    const aspectEmpty = document.getElementById("scene-aspect-empty");
    const ravenStress = Array.from(document.querySelectorAll("#combat-raven .stress-pip"));
    const enemyStress = Array.from(document.querySelectorAll("#combat-enemy .stress-pip"));

    const MAX_ROUND = 3;
    const aspectNames = {
      1: "Враги отвлеклись",
      2: "Перевёрнутый стол",
      3: "Клинок у горла"
    };
    const state = { round: 1, acted: { raven: false, ally: false, enemy: false }, last: null, finished: false, enemyDown: false };

    function showAspect(name, used) {
      if (!distracted) return;
      if (!name) {
        distracted.hidden = true;
        if (aspectEmpty) aspectEmpty.hidden = false;
        return;
      }
      distracted.hidden = false;
      if (aspectEmpty) aspectEmpty.hidden = true;
      distracted.classList.toggle("is-used", !!used);
      const nameEl = document.getElementById("scene-aspect-name");
      if (nameEl) nameEl.textContent = name;
      const tag = distracted.querySelector(".tag");
      if (tag) tag.textContent = used ? "free использован" : "free";
    }

    function markBox(pips, i) {
      if (pips[i]) pips[i].classList.add("is-filled");
    }

    const reel = [];

    function pushReel(node) {
      turnLog.querySelectorAll(".is-latest").forEach(function (el) {
        el.classList.remove("is-latest");
      });
      node.classList.add("is-latest", "is-new");
      turnLog.appendChild(node);
      reel.push(node);
      while (reel.length > 2) {
        const old = reel.shift();
        if (old && old.parentNode) {
          old.classList.add("is-past");
          window.setTimeout(function () {
            if (old.parentNode) old.parentNode.removeChild(old);
          }, 300);
        }
      }
      if (turnEmpty) turnEmpty.hidden = true;
    }

    function appendLog(html) {
      const entry = document.createElement("div");
      entry.className = "log-entry";
      entry.innerHTML = html;
      pushReel(entry);
    }

    function addRoundSep(text) {
      const sep = document.createElement("div");
      sep.className = "turn-sep";
      sep.textContent = text;
      pushReel(sep);
    }

    const actions = {
      raven: function () {
        const name = aspectNames[state.round] || aspectNames[1];
        showAspect(name, false);
        const lines = {
          1: "<b>Ворон · преимущество.</b> Создаёт «Враги отвлеклись»: Обман +2 против +1 — успех, бесплатный призыв.",
          2: "<b>Ворон · преимущество.</b> Переворачивает стол: новый аспект «Перевёрнутый стол» с бесплатным призывом.",
          3: "<b>Ворон · преимущество.</b> Ловит момент: аспект «Клинок у горла», бесплатный призыв."
        };
        appendLog(lines[state.round] || lines[1]);
      },
      ally: function () {
        if (state.round === 3) {
          state.enemyDown = true;
          appendLog("<b>Союзник · финальный удар.</b> С призывом из сцены: Драка +5 против +2 — 3 сдвига. Трек полон, последствий нет — Наёмник выбит (taken out).");
          finishBattle();
          return;
        }
        if (state.round === 1) {
          const hasScene = !!(distracted && !distracted.hidden);
          markBox(enemyStress, 0);
          markBox(enemyStress, 1);
          appendLog(hasScene
            ? "<b>Союзник · атака.</b> С призывом «Враги отвлекшись»: Драка +2 +2 = +4 против +2 — 2 сдвига. Наёмник отмечает стресс [1][2]."
            : "<b>Союзник · атака.</b> Меткий выпад: Драка +4 против +2 — 2 сдвига. Наёмник отмечает стресс [1][2].");
        } else {
          markBox(enemyStress, 2);
          appendLog("<b>Союзник · атака.</b> По зажатому Наёмнику — 2 сдвига. Он закрывает последнюю клетку стресса [3], трек полон.");
        }
      },
      enemy: function () {
        if (state.round === 1) {
          markBox(ravenStress, 0);
          appendLog("<b>Наёмник · атака.</b> Бьёт Ворона: +3 против защиты +2 — 1 сдвиг. Ворон отмечает стресс [1].");
        } else if (state.round === 2) {
          markBox(ravenStress, 1);
          appendLog("<b>Наёмник · атака.</b> В отчаянии бьёт сильнее: +4 против +2 — 2 сдвига. Ворон закрывает стресс [2].");
        } else {
          markBox(ravenStress, 2);
          appendLog("<b>Наёмник · атака.</b> Последний рывок: +3 против ловкости Ворона — 1 сдвиг. Ворон, шатаясь, закрывает стресс [3].");
        }
      }
    };

    function finishBattle() {
      state.finished = true;
      state.acted = { raven: true, ally: true, enemy: true };
      if (distracted && !distracted.hidden) {
        distracted.classList.add("is-used");
        const tag = distracted.querySelector(".tag");
        if (tag) tag.textContent = "free использован";
      }
      const enemyCard = document.getElementById("combat-enemy");
      if (enemyCard) enemyCard.classList.add("is-down");
      const enemyCons = document.getElementById("enemy-conseq");
      if (enemyCons) enemyCons.textContent = "Повержен на " + state.round + "-м раунде";
      appendLog("<b>Бой окончен.</b> Наёмник повержен на " + state.round + "-м раунде. Ворон на ногах, но весь в стрессовых клетках — конец сцены.");
      render();
    }

    function render() {
      const everyoneActed = !["raven", "ally", "enemy"].some(function (who) {
        return !state.acted[who];
      });
      const canContinue = !state.finished && state.round < MAX_ROUND && everyoneActed;

      chips.forEach(function (chip) {
        const who = chip.dataset.who;
        const acted = !!state.acted[who];
        const dead = who === "enemy" && state.enemyDown;
        chip.disabled = state.finished || dead || acted || everyoneActed;
        chip.classList.toggle("is-acted", acted || dead);
      });

      combatants.forEach(function (card) {
        card.classList.toggle("is-active", card.dataset.who === state.last);
      });

      wheelNodes.forEach(function (node) {
        node.classList.toggle("is-active", node.dataset.who === state.last);
        node.classList.toggle("is-acted",
          !!state.acted[node.dataset.who] || (node.dataset.who === "enemy" && state.enemyDown));
      });

      const roundText = state.finished ? "Бой окончен" : "Раунд " + state.round;
      if (roundTag) roundTag.textContent = roundText;
      if (wheelRound) wheelRound.textContent = state.finished ? "Повержен" : "Раунд " + state.round;
      if (roundNext) {
        roundNext.hidden = !canContinue;
        roundNext.textContent = "Новый раунд";
      }
      if (kicker) kicker.textContent = state.finished
        ? "Наёмник повержен — бой окончен"
        : everyoneActed
          ? "Все сходили — нажми «Новый раунд»"
          : "Кто ходит следующим?";
    }

    function onChip(who) {
      if (state.finished || state.acted[who]) return;
      if (who === "enemy" && state.enemyDown) return;
      state.acted[who] = true;
      state.last = who;
      const act = actions[who];
      if (act) act();
      render();
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        onChip(chip.dataset.who);
      });
    });

    if (roundNext) {
      roundNext.addEventListener("click", function () {
        if (state.finished || state.round >= MAX_ROUND) return;
        state.round += 1;
        state.acted = { raven: false, ally: false, enemy: false };
        state.last = null;
        addRoundSep("— Раунд " + state.round + " —");
        render();
      });
    }

    conflictReset.addEventListener("click", function () {
      state.round = 1;
      state.acted = { raven: false, ally: false, enemy: false };
      state.last = null;
      state.finished = false;
      state.enemyDown = false;
      reel.length = 0;
      turnLog.innerHTML = "";
      if (turnEmpty) {
        turnEmpty.hidden = false;
        turnLog.appendChild(turnEmpty);
      }
      ravenStress.forEach(function (pip) { pip.classList.remove("is-filled"); });
      enemyStress.forEach(function (pip) { pip.classList.remove("is-filled"); });
      const enemyCard = document.getElementById("combat-enemy");
      if (enemyCard) enemyCard.classList.remove("is-down");
      const enemyCons = document.getElementById("enemy-conseq");
      if (enemyCons) enemyCons.textContent = "Последствий нет";
      showAspect(false);
      render();
    });

    render();
  }

  /* ---------- V12: покрытие удара ---------- */
  const stressButtons = Array.from(document.querySelectorAll("#v12 .stress-box"));
  if (stressButtons.length) {
    const HIT_SHIFTS = 7;
    const consChecks = Array.from(document.querySelectorAll("#v12 .cons-check"));
    const consNames = Array.from(document.querySelectorAll("#v12 .cons-name"));
    const status = document.getElementById("cover-status");
    const detail = document.getElementById("cover-detail");
    const fill = document.getElementById("cover-fill");
    const reset = document.getElementById("stress-reset");

    function calc() {
      const stress = stressButtons.reduce(function (total, box) {
        return total + (box.classList.contains("is-filled") ? Number(box.dataset.value) : 0);
      }, 0);
      const consequences = consChecks.reduce(function (total, check, i) {
        if (!check.checked) return total;
        const name = consNames[i];
        return total + (name && name.value.trim().length ? Number(check.dataset.value) : 0);
      }, 0);
      const covered = stress + consequences;
      const remaining = Math.max(0, HIT_SHIFTS - covered);
      const isCovered = covered >= HIT_SHIFTS;

      status.textContent = isCovered
        ? (covered > HIT_SHIFTS ? "Покрыто с запасом: " + covered + " из " + HIT_SHIFTS : "Покрыто: " + covered + " из " + HIT_SHIFTS)
        : "Не покрыто: осталось " + remaining;
      status.classList.toggle("is-covered", isCovered);
      detail.textContent = "Стресс: " + stress + " · последствия: " + consequences + " · всего: " + covered;
      fill.style.width = Math.min(100, (covered / HIT_SHIFTS) * 100) + "%";
      fill.classList.toggle("is-covered", isCovered);

      consChecks.forEach(function (check, i) {
        const row = check.closest(".cons-row");
        if (row) row.classList.toggle("is-taken", check.checked);
        if (consNames[i]) consNames[i].disabled = !check.checked;
      });
    }

    stressButtons.forEach(function (box) {
      box.addEventListener("click", function () {
        box.classList.toggle("is-filled");
        box.setAttribute("aria-pressed", box.classList.contains("is-filled") ? "true" : "false");
        calc();
      });
    });

    consChecks.forEach(function (check, i) {
      check.addEventListener("change", function () {
        const input = consNames[i];
        if (check.checked) {
          if (input) {
            input.disabled = false;
            input.classList.toggle("is-shake", !input.value.trim().length);
            input.focus();
          }
        } else if (input) {
          input.classList.remove("is-shake");
        }
        calc();
      });
    });

    consNames.forEach(function (input, i) {
      input.addEventListener("input", function () {
        const filled = input.value.trim().length > 0;
        const mustShake = !filled && consChecks[i] && consChecks[i].checked;
        input.classList.toggle("is-shake", mustShake);
        calc();
      });
    });

    reset.addEventListener("click", function () {
      stressButtons.forEach(function (box) {
        box.classList.remove("is-filled");
        box.setAttribute("aria-pressed", "false");
      });
      consChecks.forEach(function (check) { check.checked = false; });
      consNames.forEach(function (input) {
        input.value = "";
        input.disabled = true;
        input.classList.remove("is-shake");
      });
      calc();
    });

    calc();
  }
})();
