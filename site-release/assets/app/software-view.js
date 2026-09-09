/* AI 知识地图 — 软件目录、软件详情与教程视图 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  app.createSoftwareView = function createSoftwareView(options) {
    const view = options.view;
    const detail = options.detail;
    const detailBody = options.detailBody;
    const deepDiveElement = options.deepDiveElement;
    const byId = options.byId;
    const esc = options.escapeHtml;
    const mdLite = options.markdown;
    const loadScriptsInOrder = options.loadScriptsInOrder;
    const navigate = options.navigate;
    const t = options.t;
    let software = global.SOFTWARE || null;
    let tutorials = global.TUTORIALS || null;
    let built = false;

    const bundle = [
      "data/software.js",
      "data/tutorials.js",
      "data/tutorials-codex-youtube.js",
      "data/tutorials-claude-code.js",
      "data/tutorials-video-generated.js",
    ];

    view.addEventListener("click", event => {
      const card = event.target.closest("[data-sw]");
      if (card) navigate({ name: "software-item", id: card.getAttribute("data-sw") });
    });

    async function ensureReady() {
      if (!built) view.innerHTML = `<div class="view-loading" role="status">${esc(t("software.loading"))}</div>`;
      await loadScriptsInOrder(bundle);
      software = global.SOFTWARE || software;
      tutorials = global.TUTORIALS || tutorials;
      build();
    }

    function build() {
      if (built || !software) return;
      const catItems = {};
      software.categories.forEach(category => { catItems[category.id] = []; });
      software.items.forEach(item => { (catItems[item.cat] || (catItems[item.cat] = [])).push(item); });
      let html = `<div class="sw-head"><h2>${esc(t("software.title"))}</h2>
        <p>${t("software.intro")}</p></div>`;
      software.categories.forEach(category => {
        const items = catItems[category.id] || [];
        if (!items.length) return;
        html += `<section class="sw-cat"><h3 style="color:${category.color}">${category.emoji} ${esc(category.label)}<em>${items.length}</em></h3><div class="sw-grid">`;
        items.forEach(item => {
          html += `<div class="sw-card" data-sw="${esc(item.id)}" style="border-left-color:${category.color}">
            <div class="sw-name">${esc(item.name)}</div>
            <div class="sw-by">${esc(item.by || "")}</div>
            <div class="sw-sum">${esc(item.summary || "")}</div></div>`;
        });
        html += `</div></section>`;
      });
      view.innerHTML = html;
      built = true;
    }

    function findSoftware(id) {
      return software && (software.items || []).find(item => item.id === id);
    }

    function findTutorial(id) {
      return tutorials && tutorials.items && tutorials.items[id];
    }

    function openSoftware(id) {
      const item = findSoftware(id);
      if (!item) return false;
      const category = software.categories.find(entry => entry.id === item.cat)
        || { label: "", color: "#888", emoji: "" };
      const hasTutorial = !!findTutorial(id);
      let html = `<div class="d-domain" style="color:${category.color}">${category.emoji} ${esc(category.label)}`
        + (item.by ? `<span style="color:var(--fg-faint)"> · ${esc(item.by)}</span>` : "")
        + (hasTutorial ? `<button class="dd-open" data-tutorial="${esc(id)}" title="${esc(t("software.tutorial.open"))}">🎓 ${esc(t("software.tutorial.button"))}</button>` : "")
        + `</div>`;
      html += `<h2 class="d-title">${esc(item.name)}</h2>`;
      html += `<div class="d-summary">${esc(item.summary || "")}</div>`;
      if (item.body) html += `<div class="d-sec"><div class="d-body">${mdLite(item.body)}</div></div>`;
      if (Array.isArray(item.models) && item.models.length) {
        html += `<div class="d-sec"><h4>${esc(t("software.models"))} <span class="d-asof">· ${esc(t("software.models.asOf", { date: "2026-07" }))}</span></h4><div class="d-models">`
          + item.models.map(model => `<div class="d-model"><b>${esc(model.name)}</b>${model.note ? `<span>${esc(model.note)}</span>` : ""}</div>`).join("")
          + `</div></div>`;
      }
      if (item.concept && byId[item.concept]) {
        html += `<div class="d-sec"><h4>${esc(t("software.concept"))}</h4>
          <div class="rel"><span class="rel-to" data-goto="${esc(item.concept)}">${esc(byId[item.concept].title)}</span>
          <span class="rel-lbl">${esc(t("software.viewOnMap"))}</span></div></div>`;
      }
      detailBody.innerHTML = html;
      detail.classList.remove("closed");
      detailBody.scrollTop = 0;
      return true;
    }

    function openTutorial(id) {
      const tutorial = findTutorial(id);
      if (!tutorial || !deepDiveElement) return false;
      let body = `<div class="dd-hero">
          <div class="dd-eyebrow">${esc(t("tutorial.eyebrow"))}</div>
          <h1 class="dd-h1">${esc(tutorial.title)}</h1>
          ${tutorial.subtitle ? `<div class="dd-sub">${esc(tutorial.subtitle)}</div>` : ""}
          ${tutorial.meta ? `<div class="dd-metabar">${esc(tutorial.meta)}</div>` : ""}
          ${tutorial.overview ? `<div class="dd-thesis"><span class="dd-thesis-l">${esc(t("tutorial.coreMethod"))}</span> ${esc(tutorial.overview)}</div>` : ""}
        </div>`;

      if (Array.isArray(tutorial.learningPath) && tutorial.learningPath.length) {
        body += `<section class="dd-sec tutorial-learning"><h2>${esc(t("tutorial.learningPath"))}</h2><ol class="dd-chain">`
          + tutorial.learningPath.map(item => `<li>${esc(item)}</li>`).join("") + `</ol></section>`;
      }

      const platforms = tutorials.platforms || [];
      const firstPopulated = platforms.find(platform => (tutorial.resources || []).some(resource => resource.platform === platform.id));
      const initialPlatform = firstPopulated ? firstPopulated.id : (platforms[0] && platforms[0].id);
      body += `<div class="tutorial-layout">
        <nav class="tutorial-sidebar" aria-label="${esc(t("tutorial.platforms.aria"))}">
          <div class="tutorial-sidebar-title">${esc(t("tutorial.platforms"))}</div>
          ${platforms.map(platform => {
            const count = (tutorial.resources || []).filter(resource => resource.platform === platform.id).length;
            return `<button class="tutorial-platform-btn${platform.id === initialPlatform ? " active" : ""}" type="button" data-platform="${esc(platform.id)}" style="--platform-color:${platform.color}">
              <span class="tutorial-platform-label"><span>${platform.emoji}</span>${esc(platform.label)}</span><span class="tutorial-count">${count}</span>
            </button>`;
          }).join("")}
        </nav>
        <div class="tutorial-platform-content" id="tutorial-platform-content"></div>
      </div>`;

      if (tutorial.sourceNote) body += `<div class="dd-src"><b>${esc(t("tutorial.sourceScope"))}</b><p>${esc(tutorial.sourceNote)}</p>
        ${(tutorial.officialSources || []).length ? `<b>${esc(t("tutorial.calibrationSources"))}</b><ul>${tutorial.officialSources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)}</a></li>`).join("")}</ul>` : ""}
        ${tutorial.accessDate ? `<div class="dd-src-date">${esc(t("tutorial.accessDate", { date: tutorial.accessDate }))}</div>` : ""}</div>`;
      document.getElementById("dd-top-name").textContent = tutorial.title;
      document.getElementById("dd-article").innerHTML = body;

      const contentElement = document.getElementById("tutorial-platform-content");
      const renderPlatform = platformId => {
        const platform = platforms.find(item => item.id === platformId);
        if (!platform || !contentElement) return;
        const resources = (tutorial.resources || []).filter(resource => resource.platform === platform.id);
        let html = `<section class="tutorial-platform"><header class="tutorial-platform-head">
          <div><div class="tutorial-platform-kicker">${esc(t("tutorial.currentPlatform"))}</div><h2>${platform.emoji} ${esc(platform.label)}</h2></div>
          <span>${esc(t("tutorial.reviewedCount", { count: resources.length }))}</span>
        </header>`;
        if (!resources.length) {
          contentElement.innerHTML = html + `<div class="tutorial-empty">${esc(t("tutorial.empty", { platform: platform.label }))}</div></section>`;
          return;
        }
        resources.forEach((resource, index) => {
          const coverage = (resource.coverage || []).map(item => `<section class="tutorial-action">
            <h5>${esc(item.title)}</h5>
            ${(item.steps || []).length ? `<ol>${item.steps.map(step => `<li>${esc(step)}</li>`).join("")}</ol>` : ""}
            ${item.done ? `<div class="tutorial-done"><b>${esc(t("tutorial.done"))}</b>${esc(item.done)}</div>` : ""}
          </section>`).join("");
          const unique = (resource.uniqueTechniques || []).map(item => `<section class="tutorial-unique">
            <h5>${esc(item.title)}</h5>
            ${item.scenario ? `<p><b>${esc(t("tutorial.scenario"))}</b>${esc(item.scenario)}</p>` : ""}
            ${(item.steps || []).length ? `<ol>${item.steps.map(step => `<li>${esc(step)}</li>`).join("")}</ol>` : ""}
            ${item.result ? `<div class="tutorial-done"><b>${esc(t("tutorial.result"))}</b>${esc(item.result)}</div>` : ""}
          </section>`).join("");
          html += `<details class="tutorial-card" style="border-left-color:${platform.color}"${index === 0 ? " open" : ""}>
            <summary class="tutorial-card-head"><div>
              <h3>${esc(resource.title)}</h3>
              <div class="tutorial-meta">${esc(resource.creator || "")} · ${esc(resource.publishedAt || "")}${resource.duration ? ` · ${esc(resource.duration)}` : ""}</div>
            </div><span class="tutorial-expand" aria-hidden="true">⌄</span></summary>
            <div class="tutorial-card-body">
              ${resource.audience ? `<div class="tutorial-audience"><b>${esc(t("tutorial.audience"))}</b>${esc(resource.audience)}</div>` : ""}
              ${resource.summary ? `<h4>${esc(t("tutorial.summary"))}</h4><p class="tutorial-summary">${esc(resource.summary)}</p>` : ""}
              ${coverage ? `<h4>${esc(t("tutorial.coverage"))}</h4><div class="tutorial-actions">${coverage}</div>` : ""}
              ${unique ? `<h4>${esc(t("tutorial.unique"))} <span>· ${esc(t("tutorial.uniqueComparison"))}</span></h4><div class="tutorial-uniques">${unique}</div>` : ""}
              ${resource.caution ? `<div class="dd-note warn"><b>${esc(t("tutorial.caution"))}</b>　${esc(resource.caution)}</div>` : ""}
              <a class="tutorial-link" href="${esc(resource.url)}" target="_blank" rel="noopener">${esc(t("tutorial.openOriginal", { platform: platform.label }))} ↗</a>
            </div>
          </details>`;
        });
        contentElement.innerHTML = html + `</section>`;
      };

      deepDiveElement.querySelectorAll(".tutorial-platform-btn").forEach(button => button.addEventListener("click", () => {
        deepDiveElement.querySelectorAll(".tutorial-platform-btn").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        renderPlatform(button.getAttribute("data-platform"));
      }));
      if (initialPlatform) renderPlatform(initialPlatform);
      deepDiveElement.classList.remove("hidden");
      deepDiveElement.querySelector(".dd-scroll").scrollTop = 0;
      return true;
    }

    function refreshLanguage() {
      if (!built) return;
      built = false;
      build();
    }

    return Object.freeze({
      ensureReady,
      findSoftware,
      findTutorial,
      openSoftware,
      openTutorial,
      refreshLanguage,
      view,
    });
  };
})(window);
