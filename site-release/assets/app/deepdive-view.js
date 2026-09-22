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
    const t = options.t;
    let activeId = null;
    let requestToken = 0;

    async function open(id) {
      if (!element || !ids.has(id)) return false;
      const token = ++requestToken;
      activeId = id;
      document.getElementById("dd-top-name").textContent = byId[id] ? byId[id].title : id;
      document.getElementById("dd-article").innerHTML =
        `<div class="dd-loading" role="status">${esc(t("deepdive.loading"))}</div>`;
      element.classList.remove("dd-provisional");
      element.classList.remove("hidden");
      element.querySelector(".dd-scroll").scrollTop = 0;

      let page;
      try {
        page = await ensurePage(id);
      } catch (error) {
        if (token !== requestToken) return false;
        document.getElementById("dd-article").innerHTML =
          `<div class="dd-loading dd-loading-error" role="alert">${esc(t("deepdive.loadError", { error: error.message }))}</div>`;
        const retry = document.createElement('button');
        retry.textContent = document.documentElement.lang === 'en' ? 'Retry' : '重新加载';
        retry.addEventListener('click', () => open(id));
        document.getElementById('dd-article').append(retry);
        return false;
      }
      if (token !== requestToken || activeId !== id) return false;
      const article = document.getElementById("dd-article");
      article.lang = page.contentLocale || "zh-Hans";
      const languageNotice = page.translationFallback
        ? `<div class="dd-language-notice" role="status" lang="en">${esc(t("deepdive.translationFallback"))}</div>` : "";
      const websiteNotice = page.websitePublication && global.AI_PUBLICATION_NOTICE
        ? global.AI_PUBLICATION_NOTICE.render(page.websitePublication.reviewStatus, article.lang) : null;
      const provisionalPublication = websiteNotice === null && page.publication
        && ["published-provisional", "published-editorial-draft"].includes(page.publication.status)
        ? page.publication
        : null;
      const editorialDraft = provisionalPublication
        && provisionalPublication.status === "published-editorial-draft";
      element.classList.toggle("dd-provisional", Boolean(provisionalPublication));
      const provisionalDescription = editorialDraft
        ? t("deepdive.provisional.editorial")
        : Number.isInteger(provisionalPublication && provisionalPublication.blockerCount)
          ? t("deepdive.provisional.blocked", { count: provisionalPublication.blockerCount })
          : t("deepdive.provisional.pending");
      const provisionalNotice = provisionalPublication
        ? `<div class="dd-provisional-notice" role="status">
            <strong>${esc(provisionalPublication.label || t("deepdive.provisional.label"))}</strong>
            <span>${esc(provisionalDescription)}</span>
          </div>`
        : "";
      const hero = `<div class="dd-hero">
          <div class="dd-eyebrow">${esc(t("deepdive.eyebrow"))}</div>
          <h1 class="dd-h1${provisionalPublication ? " dd-h1-provisional" : ""}">${esc(page.title)}</h1>
          ${websiteNotice === null ? provisionalNotice : websiteNotice}
          ${page.subtitle ? `<div class="dd-sub">${esc(page.subtitle)}</div>` : ""}
          ${page.aliases ? `<div class="dd-ali">${esc(page.aliases)}</div>` : ""}
          ${page.meta ? `<div class="dd-metabar">${esc(page.meta)}</div>` : ""}
          ${page.thesis ? `<div class="dd-thesis"><span class="dd-thesis-l">${esc(t("deepdive.thesis"))}</span> ${page.plainThesis ? esc(page.thesis) : page.thesis}</div>` : ""}
        </div>`;
      document.getElementById("dd-top-name").textContent = page.title;
      article.innerHTML = languageNotice + hero + (page.html || "") + renderLearning(id);
      const feedback = document.createElement("aside");
      feedback.className = "dd-feedback";
      const feedbackLink = document.createElement("a");
      const englishFeedback = article.lang === "en";
      const feedbackUrl = new URL("https://github.com/Little-FishK/AI-knowledge-map/issues/new");
      feedbackUrl.searchParams.set("title", `[Content feedback] ${id} (${article.lang})`);
      feedbackUrl.searchParams.set("body", englishFeedback
        ? `Page: ${id}\nLanguage: ${article.lang}\n\nType: factual error / unclear explanation / outdated content / broken link\n\nSection and quoted text:\n\nWhat is wrong or unclear:\n\nSuggested correction or source (optional):\n`
        : `页面：${id}\n语言：${article.lang}\n\n问题类型：事实错误 / 看不懂 / 内容过时 / 链接失效\n\n章节与原句：\n\n哪里有问题或不明白：\n\n建议或参考来源（可选）：\n`);
      feedbackLink.href = feedbackUrl.href;
      feedbackLink.target = "_blank";
      feedbackLink.rel = "noopener noreferrer";
      feedbackLink.textContent = englishFeedback ? "Report a content problem" : "报告内容问题";
      const feedbackNote = document.createElement("p");
      feedbackNote.textContent = englishFeedback
        ? "Feedback is public on GitHub and requires a GitHub account. You can review your message before submitting."
        : "反馈将公开在 GitHub，需要登录 GitHub 账号；提交前可以检查并修改内容。";
      feedback.append(feedbackLink, feedbackNote);
      article.append(feedback);
      const staticPath = global.AI_STATIC_CONCEPTS?.[id]?.[article.lang];
      if (staticPath && /^(en|zh)\/concepts\/[a-z0-9-]+\/$/.test(staticPath)) {
        const link = document.createElement("a");
        link.className = "dd-static-link";
        link.href = new URL(staticPath, global.location.href).href;
        link.textContent = article.lang === "en" ? "Open standalone reading page" : "打开独立阅读页";
        article.querySelector(".dd-hero").append(link);
      }
      // Layout only: keep controller-owned text and SVG nodes unchanged.
      if (id === "supervised-learning" && article.lang === "en") {
        article.querySelectorAll('.dd-fig svg').forEach(svg => {
          if (svg.getAttribute("viewBox") === "0 0 560 96") {
            const labels = [...svg.querySelectorAll("text")];
            if (labels.length === 6) {
              const legend = document.createElement("dl");
              legend.className = "dd-split-legend";
              labels.slice(0, 3).forEach((label, index) => {
                const row = document.createElement("div");
                const term = document.createElement("dt"), description = document.createElement("dd");
                term.textContent = label.textContent;
                description.textContent = labels[index + 3].textContent;
                row.append(term, description); legend.append(row);
              });
              svg.after(legend);
              svg.classList.add("dd-split-with-legend");
            }
          }
          const scroll = document.createElement("div");
          scroll.className = "dd-diagram-scroll";
          scroll.tabIndex = 0;
          scroll.setAttribute("role", "region");
          scroll.setAttribute("aria-label", "Scrollable diagram");
          svg.before(scroll); scroll.append(svg);
          const hint = document.createElement("p");
          hint.className = "dd-diagram-hint";
          hint.textContent = "Scroll horizontally to view the full diagram on small screens.";
          scroll.after(hint);
        });
      }
      bindLearning();
      delete article.dataset.readingEnhanced;
      global.AI_READING?.enhance(article);
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
        navigate(route.name === "concept" ? { name: "map", id: route.id } : { name: "map" }, { replace: true });
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
