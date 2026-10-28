/* V3.1, V5 и V14 — интерактив страницы проверок */
(function () {
  "use strict";

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

  /* ---------- V3.1 ---------- */
  const simpleDiceRow = document.getElementById("simple-dice-row");
  if (simpleDiceRow) {
    const state = { dice: [0, 0, 0, 0], skill: 4, difficulty: 3 };
    const diceTotal = document.getElementById("simple-dice-total");
    const skillSelect = document.getElementById("simple-skill");
    const resultTotal = document.getElementById("simple-result-total");
    const scaleTotal = document.getElementById("simple-scale-total");
    const scaleDiff = document.getElementById("simple-scale-diff");
    const scaleText = document.getElementById("simple-scale-text");
    const meaningBox = document.getElementById("simple-meaning-box");
    const meaningTitle = document.getElementById("simple-meaning-title");
    const meaningText = document.getElementById("simple-meaning");
    const rollButton = document.getElementById("simple-roll");

    const meanings = {
      "провал": {
        title: "Провал",
        text: "Результат ниже сложности. Ведущий предлагает цену, осложнение или последствие. Это не «ничего не произошло»."
      },
      "ничья": {
        title: "Ничья",
        text: "Результат равен сложности. Ты получаешь цель, но с ценой, или получаешь шанс, который надо использовать. Сцена не стоит на месте."
      },
      "успех": {
        title: "Успех",
        text: "Результат выше сложности. Персонаж получает то, за чем шёл, но без дополнительного рычага."
      },
      "успех со стилем": {
        title: "Успех со стилем",
        text: "Разница больше 2 пунктов. Ты не просто проходишь, а получаешь преимущество: удобный момент, дополнительную деталь или помощь."
      }
    };

    function render() {
      renderDice(simpleDiceRow, state.dice);
      const diceSum = sum(state.dice);
      const total = diceSum + state.skill;
      const text = outcomeText(total, state.difficulty);
      const cls = outcomeClass(total, state.difficulty);
      const meaning = meanings[text];

      diceTotal.textContent = fmt(diceSum);
      resultTotal.textContent = fmt(total);
      resultTotal.className = "f-value " + cls;
      scaleTotal.textContent = fmt(total);
      scaleDiff.textContent = fmt(state.difficulty);

      const diff = total - state.difficulty;
      scaleText.textContent = diff >= 3
        ? "разница " + fmt(diff) + " → успех со стилем"
        : diff > 0
          ? "разница " + fmt(diff) + " → успех"
          : diff === 0
            ? "разница 0 → ничья"
            : "разница " + fmt(diff) + " → провал";
      scaleText.className = "scale-result " + cls;
      meaningTitle.textContent = meaning.title;
      meaningText.textContent = meaning.text;
      meaningBox.className = "check-meaning " + cls;
    }

    rollButton.addEventListener("click", function () {
      state.dice = rollFour();
      render();
    });

    skillSelect.addEventListener("change", function () {
      state.skill = Number(skillSelect.value);
      render();
    });

    skillSelect.value = String(state.skill);
    render();
  }

  /* ---------- V5 ---------- */
  const pyrSlots = Array.from(document.querySelectorAll(".pyr-slot"));
  const skillChips = Array.from(document.querySelectorAll(".skill-chip"));
  let selectedSkill = null;

  function clearPyrSlot(slot) {
    delete slot.dataset.skill;
    slot.classList.remove("is-filled");
    const label = slot.querySelector(".pyr-skill");
    if (label) label.textContent = "сюда";
  }

  function updateChipStates() {
    const used = new Set(pyrSlots.map(function (slot) { return slot.dataset.skill; }).filter(Boolean));
    skillChips.forEach(function (chip) {
      chip.classList.toggle("is-used", used.has(chip.dataset.skill));
    });
  }

  function updateChipSelection() {
    skillChips.forEach(function (chip) {
      chip.classList.toggle("is-selected", chip.dataset.skill === selectedSkill);
    });
  }

  function placeSkill(slot, skill) {
    if (!skill) return;
    pyrSlots.forEach(function (other) {
      if (other !== slot && other.dataset.skill === skill) clearPyrSlot(other);
    });
    if (slot.dataset.skill) clearPyrSlot(slot);
    slot.dataset.skill = skill;
    slot.classList.add("is-filled");
    const label = slot.querySelector(".pyr-skill");
    if (label) label.textContent = skill;
    updateChipStates();
  }

  if (pyrSlots.length) {
    pyrSlots.forEach(function (slot) {
      slot.addEventListener("dragover", function (event) {
        event.preventDefault();
        slot.classList.add("is-over");
      });
      slot.addEventListener("dragleave", function () {
        slot.classList.remove("is-over");
      });
      slot.addEventListener("drop", function (event) {
        event.preventDefault();
        slot.classList.remove("is-over");
        const skill = event.dataTransfer.getData("text/plain");
        if (skill) placeSkill(slot, skill);
      });
      slot.addEventListener("click", function () {
        if (slot.dataset.skill) {
          clearPyrSlot(slot);
          updateChipStates();
        } else if (selectedSkill) {
          placeSkill(slot, selectedSkill);
          selectedSkill = null;
          updateChipSelection();
        }
      });
    });

    skillChips.forEach(function (chip) {
      chip.addEventListener("dragstart", function (event) {
        event.dataTransfer.setData("text/plain", chip.dataset.skill);
        event.dataTransfer.effectAllowed = "copy";
        chip.classList.add("is-dragging");
      });
      chip.addEventListener("dragend", function () {
        chip.classList.remove("is-dragging");
      });
      chip.addEventListener("click", function () {
        selectedSkill = selectedSkill === chip.dataset.skill ? null : chip.dataset.skill;
        updateChipSelection();
      });
    });

    function clearPyramid() {
      pyrSlots.forEach(clearPyrSlot);
      selectedSkill = null;
      updateChipSelection();
      updateChipStates();
    }

    function fillRavenPyramid() {
      clearPyramid();
      const raven = ["Взлом", "Скрытность", "Атлетика", "Внимательность", "Обман", "Общение", "Драка", "Воля", "Связи", "Ресурсы"];
      raven.forEach(function (skill, index) {
        if (pyrSlots[index]) placeSkill(pyrSlots[index], skill);
      });
    }

    const pyrExample = document.getElementById("pyr-example");
    const pyrClear = document.getElementById("pyr-clear");
    if (pyrExample) pyrExample.addEventListener("click", fillRavenPyramid);
    if (pyrClear) pyrClear.addEventListener("click", clearPyramid);
  }

  /* ---------- V14 ---------- */
  const contestNext = document.getElementById("contest-next");
  const contestReset = document.getElementById("contest-reset");
  if (contestNext && contestReset) {
    const contestSteps = [
      {
        score: "0:1", raven: 0, host: 1,
        scene: "Хозяин пробует унизить Ворона",
        detail: "Ворон входит в таверну и просит тишины. Хозяин громко вспоминает, как Ворон якобы сбежал от стражи, и кивает на его пустой кошелёк. Толпа оборачивается.",
        after: "Ворон стискивает зубы. Хозяин довольно улыбается, а по толпе проходит смешок. Ворон понимает: в лоб насмешку не отбить.",
        left: { name: "Ворон", mods: [["Воля", 2], ["бросок", 0]] },
        right: { name: "Хозяин", mods: [["Провокация", 3], ["бросок", 1]] },
        verdict: "хозяин выигрывает проверку. Очко хозяину, счёт 0:1.",
        outcomeClass: "is-fail"
      },
      {
        score: "0:1", raven: 0, host: 1,
        scene: "Бокал на пол",
        detail: "Хозяин кивает парню у стойки: «случайно» опрокинь бокал на Ворона. Это Провокация: он подталкивает толпу к смеху. Ворон замечает движение.",
        after: "Бокал звенит, но Ворон не оправдывается — он выставляет ситуацию так, будто хозяин сам подставился. Смеяться никто не спешит: все смотрят на Ворона.",
        left: { name: "Ворон", mods: [["Общение", 2], ["бросок", 1]] },
        right: { name: "Хозяин", mods: [["Провокация", 3], ["бросок", 0]] },
        verdict: "ничья. Очко не получает никто, счёт остаётся 0:1 — но сцена всё равно меняется.",
        outcomeClass: "is-tie"
      },
      {
        score: "1:1", raven: 1, host: 1,
        scene: "Ворон отвечает публично",
        detail: "Ворон поднимает бокал: «Хозяин, вы так боитесь вопросов, что подсылаете мальчишку?» Хозяин пытается отшутиться.",
        after: "Шутка выходит неуклюжей. Толпа смеётся уже над хозяином. Теперь всё решает последний вопрос.",
        left: { name: "Ворон", mods: [["Общение", 2], ["бросок", 2]] },
        right: { name: "Хозяин", mods: [["Обман", 2], ["бросок", 0]] },
        verdict: "Ворон выигрывает проверку. Очко Ворону, счёт 1:1.",
        outcomeClass: "is-success"
      },
      {
        score: "3:1", raven: 3, host: 1,
        scene: "Последний вопрос",
        detail: "Ворон ставит бокал на стол: «Один вопрос, хозяин. Ответите — я уйду». Он вкладывает в голос всю уверенность. Хозяин пытается перекричать его.",
        after: "Хозяин срывается на крик. Толпа уже не на его стороне: Ворон забирает состязание и получает ответ.",
        left: { name: "Ворон", mods: [["Общение", 2], ["бросок", 3]] },
        right: { name: "Хозяин", mods: [["Провокация", 3], ["бросок", -1]] },
        verdict: "разница 3 пункта и более — это успех со стилем: он даёт +2 очка, а не одно. Счёт 3:1.",
        outcomeClass: "is-style"
      }
    ];

    let index = 0;
    const score = document.getElementById("contest-score-value");
    const final = document.getElementById("contest-final");
    const scene = document.getElementById("contest-scene");
    const detail = document.getElementById("contest-detail");
    const checkLabel = document.getElementById("contest-check-label");
    const duel = document.getElementById("contest-duel");
    const verdict = document.getElementById("contest-verdict");
    const afterWrap = document.getElementById("contest-after-wrap");
    const afterText = document.getElementById("contest-after");
    const leftName = document.getElementById("contest-left-name");
    const leftFormula = document.getElementById("contest-left-formula");
    const leftTotal = document.getElementById("contest-left-total");
    const rightName = document.getElementById("contest-right-name");
    const rightFormula = document.getElementById("contest-right-formula");
    const rightTotal = document.getElementById("contest-right-total");
    const ravenTrack = document.getElementById("raven-track");
    const hostTrack = document.getElementById("host-track");
    const rows = Array.from(document.querySelectorAll(".contest-table tr[data-step]"));

    function modsText(mods) {
      return mods.map(function (part) {
        return part[0] + " " + fmt(part[1]);
      }).join(", ");
    }

    function modsTotal(mods) {
      return mods.reduce(function (total, part) { return total + part[1]; }, 0);
    }

    function fillTrack(track, count) {
      Array.from(track.children).forEach(function (box, i) {
        box.classList.toggle("is-filled", i < count);
      });
    }

    function render() {
      const state = index === 0
        ? {
            score: "0:0", raven: 0, host: 0,
            scene: "Состязание не начато",
            detail: "Ворону нужен ответ хозяина. Хозяин хочет, чтобы Ворон ушёл ни с чем. Каждый бросок даёт очко. 3 очка = победа."
          }
        : contestSteps[index - 1];

      score.textContent = state.score;
      scene.textContent = state.scene;
      detail.textContent = state.detail;

      const hasRoll = index > 0;
      checkLabel.hidden = !hasRoll;
      duel.hidden = !hasRoll;
      verdict.hidden = !hasRoll;
      afterWrap.hidden = !hasRoll;

      if (hasRoll) {
        const leftSum = modsTotal(state.left.mods);
        const rightSum = modsTotal(state.right.mods);

        leftName.textContent = state.left.name;
        leftFormula.textContent = modsText(state.left.mods);
        leftTotal.textContent = fmt(leftSum);
        rightName.textContent = state.right.name;
        rightFormula.textContent = modsText(state.right.mods);
        rightTotal.textContent = fmt(rightSum);

        verdict.textContent = fmt(leftSum) + " против " + fmt(rightSum) + " — " + state.verdict;
        verdict.className = "contest-verdict " + state.outcomeClass;
        afterText.textContent = state.after;
      } else {
        verdict.textContent = "";
        verdict.className = "contest-verdict";
        afterText.textContent = "";
      }

      fillTrack(ravenTrack, state.raven);
      fillTrack(hostTrack, state.host);

      rows.forEach(function (row, i) {
        const step = i + 1;
        const reached = index >= step;
        row.classList.toggle("is-active", index === step);
        row.classList.toggle("is-done", index > step);
        row.classList.toggle("is-future", index < step);
        const cell = row.querySelector(".score-cell");
        if (cell) cell.textContent = reached ? contestSteps[i].score : "—";
      });

      final.hidden = index < contestSteps.length;
      contestNext.disabled = index === contestSteps.length;
      contestNext.textContent = index === contestSteps.length ? "Готово" : "Дальше";
    }

    contestNext.addEventListener("click", function () {
      if (index < contestSteps.length) {
        index += 1;
        render();
      }
    });

    contestReset.addEventListener("click", function () {
      index = 0;
      render();
    });

    render();
  }
})();
