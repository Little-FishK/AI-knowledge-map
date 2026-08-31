/* AI 知识地图 — 理解原理页视图 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  app.createDeepDiveView = function createDeepDiveView(options) {
    const element = options.element;
    const ids = options.ids;
    const byId = options.byId;
    const esc = options.escapeHtml;
    const ensurePage = options.ensurePage;
    const renderLearning = options.renderLearning;
    const bindLearning = options.bindLearning;
    const preloadNeighbors = options.preloadNeighbors;
    const router = options.router;
    const navigate = options.navigate;
    let activeId = null;
    let requestToken = 0;

    async function open(id) {
      if (!element || !ids.has(id)) return false;
      const token = ++requestToken;
      activeId = id;
      document.getElementById("dd-top-name").textContent = byId[id] ? byId[id].title : id;
      document.getElementById("dd-article").innerHTML =
        '<div class="dd-loading" role="status">正在加载理解原理页…</div>';
      element.classList.remove("dd-provisional");
      element.classList.remove("hidden");
      element.querySelector(".dd-scroll").scrollTop = 0;

      let page;
      try {
        page = await ensurePage(id);
      } catch (error) {
        if (token !== requestToken) return false;
        document.getElementById("dd-article").innerHTML =
          `<div class="dd-loading dd-loading-error" role="alert">${esc(error.message)}，请返回后重试。</div>`;
        return false;
      }
      if (token !== requestToken || activeId !== id) return false;
      const provisionalPublication = page.publication
        && ["published-provisional", "published-editorial-draft"].includes(page.publication.status)
        ? page.publication
        : null;
      const editorialDraft = provisionalPublication
        && provisionalPublication.status === "published-editorial-draft";
      element.classList.toggle("dd-provisional", Boolean(provisionalPublication));
      const provisionalNotice = provisionalPublication
        ? `<div class="dd-provisional-notice" role="status">
            <strong>${esc(provisionalPublication.label || "未通过审计 · 暂行版本")}</strong>
            <span>${editorialDraft ? "该页面是已经覆盖网站的正文草稿，正在等待机器审查与人工复核。" : `该页面已覆盖旧正式页，但尚未通过质量审查${Number.isInteger(provisionalPublication.blockerCount) ? `，当前记录 ${provisionalPublication.blockerCount} 个阻断项` : ""}。`}</span>
          </div>`
        : "";
      const hero = `<div class="dd-hero">
          <div class="dd-eyebrow">理解原理 · CONCEPT DEEP DIVE</div>
          <h1 class="dd-h1${provisionalPublication ? " dd-h1-provisional" : ""}">${esc(page.title)}</h1>
          ${provisionalNotice}
          ${page.subtitle ? `<div class="dd-sub">${esc(page.subtitle)}</div>` : ""}
          ${page.aliases ? `<div class="dd-ali">${esc(page.aliases)}</div>` : ""}
          ${page.meta ? `<div class="dd-metabar">${esc(page.meta)}</div>` : ""}
          ${page.thesis ? `<div class="dd-thesis"><span class="dd-thesis-l">核心命题</span> ${page.thesis}</div>` : ""}
        </div>`;
      document.getElementById("dd-top-name").textContent = page.title;
      document.getElementById("dd-article").innerHTML = hero + (page.html || "") + renderLearning(id);
      bindLearning();
      element.querySelector(".dd-scroll").scrollTop = 0;
      preloadNeighbors(id);
      return true;
    }

    function close() {
      requestToken++;
      if (element) {
        element.classList.add("hidden");
        element.classList.remove("dd-provisional");
      }
      activeId = null;
    }

    function leave() {
      const route = router.parse(global.location.hash);
      if (route.name === "tutorial") {
        navigate({ name: "software-item", id: route.id }, { replace: true });
      } else {
        navigate({ name: "map" }, { replace: true });
      }
    }

    function isActive(id) {
      return activeId === id;
    }

    if (new URLSearchParams(global.location.search).has("quality-audit")) {
      global.__DEEPDIVE_QUALITY_AUDIT__ = { open, close };
    }

    if (element) {
      document.getElementById("dd-back").addEventListener("click", leave);
      document.getElementById("dd-close").addEventListener("click", leave);
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !element.classList.contains("hidden")) leave();
      });
    }

    return Object.freeze({ close, element, isActive, open });
  };
})(window);
