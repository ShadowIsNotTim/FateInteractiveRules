/* ============================================================
   Fate — общий скрипт сайта
   Навигация, активная страница, пагинация.
   ============================================================ */

(function () {
  "use strict";

  const body = document.body;
  const root = body.dataset.root || "./";
  const pageId = body.dataset.page || "home";
  const pages = window.FATE_NAV || [];
  const currentIndex = pages.findIndex(function (page) { return page.id === pageId; });
  const current = currentIndex >= 0 ? pages[currentIndex] : null;

  function url(path) {
    return root + path;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSidebar() {
    const host = document.getElementById("site-sidebar");
    if (!host) return;

    const groups = [];
    pages.forEach(function (page) {
      let group = groups.find(function (item) { return item.name === page.group; });
      if (!group) {
        group = { name: page.group, pages: [] };
        groups.push(group);
      }
      group.pages.push(page);
    });

    const nav = groups.map(function (group) {
      const links = group.pages.map(function (page) {
        const active = page.id === pageId;
        return '<a href="' + url(page.path) + '"' +
          (active ? ' class="is-active" aria-current="page"' : "") + '>' +
          '<span class="num">' + escapeHtml(page.num) + '</span>' +
          '<span>' + escapeHtml(page.short) + '</span>' +
        '</a>';
      }).join("");

      return '<div class="nav-group">' +
        '<p class="nav-group-title">' + escapeHtml(group.name) + '</p>' +
        links +
      '</div>';
    }).join("");

    host.innerHTML =
      '<div class="sidebar-inner">' +
        '<a class="brand" href="' + url("index.html") + '">' +
          '<span class="brand-mark">Fate</span>' +
          '<span class="brand-sub">как играть · альфа</span>' +
        '</a>' +
        '<nav class="site-nav" aria-label="Разделы руководства">' + nav + '</nav>' +
      '</div>';
  }

  function renderPager() {
    const host = document.getElementById("page-pager");
    if (!host || currentIndex < 0) return;

    const prev = pages[currentIndex - 1];
    const next = pages[currentIndex + 1];

    host.innerHTML =
      (prev
        ? '<a class="pager-link pager-link--prev" href="' + url(prev.path) + '">' +
            '<span class="kicker">← назад</span><b>' + escapeHtml(prev.title) + '</b></a>'
        : '<span class="pager-link pager-link--empty" aria-hidden="true"></span>') +
      (next
        ? '<a class="pager-link pager-link--next" href="' + url(next.path) + '">' +
            '<span class="kicker">дальше →</span><b>' + escapeHtml(next.title) + '</b></a>'
        : '<span class="pager-link pager-link--empty" aria-hidden="true"></span>');
  }

  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    host.innerHTML =
      '<p>Шрифты: Kablammo — SIL OFL 1.1; Tsap-Tsarap — free for any type of use; Liberation Sans — SIL OFL 1.1.</p>' +
      '<p class="footer-credit">© 2026 <b>Тимофей Мусиков Дмитриевич</b> · <a href="https://github.com/ShadowIsNotTim" target="_blank" rel="noopener">github.com/ShadowIsNotTim</a> · материалы — CC BY 4.0</p>';
  }

  function markCurrentTitle() {
    if (!current) return;
    const crumb = document.querySelector("[data-current-number]");
    if (crumb) crumb.textContent = current.num;
    const name = document.querySelector("[data-current-title]");
    if (name) name.textContent = current.title;
  }

  function initInfoPopovers() {
    const toggles = Array.from(document.querySelectorAll(".info-toggle"));

    function close(toggle, panel) {
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }

    function closeAll(except) {
      toggles.forEach(function (toggle) {
        if (toggle === except) return;
        const panel = document.getElementById(toggle.getAttribute("aria-controls"));
        if (panel) close(toggle, panel);
      });
    }

    function placePanel(panel) {
      panel.style.left = "50%";
      panel.style.right = "auto";
      panel.style.transform = "translateX(-50%)";

      const rect = panel.getBoundingClientRect();
      const margin = 16;

      if (rect.right > window.innerWidth - margin) {
        panel.style.left = "auto";
        panel.style.right = "0";
        panel.style.transform = "none";
      } else if (rect.left < margin) {
        panel.style.left = "0";
        panel.style.right = "auto";
        panel.style.transform = "none";
      }
    }

    toggles.forEach(function (toggle) {
      const panel = document.getElementById(toggle.getAttribute("aria-controls"));
      if (!panel) return;

      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        const willOpen = panel.hidden;
        closeAll(toggle);
        toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        panel.hidden = !willOpen;
        if (willOpen) placePanel(panel);
      });

      panel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });

    window.addEventListener("resize", function () {
      toggles.forEach(function (toggle) {
        if (toggle.getAttribute("aria-expanded") !== "true") return;
        const panel = document.getElementById(toggle.getAttribute("aria-controls"));
        if (panel) placePanel(panel);
      });
    });

    document.addEventListener("click", function () {
      closeAll(null);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      const open = toggles.find(function (toggle) {
        return toggle.getAttribute("aria-expanded") === "true";
      });
      if (!open) return;
      const panel = document.getElementById(open.getAttribute("aria-controls"));
      if (panel) close(open, panel);
      open.focus();
    });
  }

  renderSidebar();
  renderPager();
  renderFooter();
  markCurrentTitle();
  initInfoPopovers();
})();
