/* 软件教程：一个前置模块，六个学习方向。 */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  app.createSoftwareView = function (options) {
    const { view, deepDiveElement, escapeHtml: esc, loadScriptsInOrder, navigate, t } = options;
    let tutorials = null;
    let built = false;
    let disposeWorkflow = null;
    let disposeExamples = null;
    const bundle = ["data/tutorials.js?v=532f9364cc77f0f7", "assets/app/prompt-foundations.js?v=4a23ebfad8791218", "assets/app/prompt-workflow.js?v=0d655282890c07ff", "data/tutorials-faq.js?v=b0f74c8595f04822", "assets/app/prompt-faq.js?v=3afe562049c24609", "data/tutorials-prompts.js?v=3a06c26de557b9f6", "assets/app/prompt-examples.js?v=666b3d4c5288f43f"];
    const label = (module, field) => t("tutorial.language") === "en" ? module[field + "En"] || module[field] : module[field];
    const findTutorial = id => tutorials?.modules.find(module => module.id === id);
    function card(module, index, foundation = false) {
      return `<button type="button" class="course-card${foundation ? " course-foundation" : ""}" data-module="${esc(module.id)}" style="--module-color:${esc(module.color)}">
        <span class="course-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="course-card-copy"><span class="course-tag">${esc(t(foundation ? "tutorial.prerequisite" : "tutorial.direction"))}</span>
        <span class="course-title">${esc(label(module, "title"))}</span>
        <span class="course-summary">${esc(label(module, "summary"))}</span>
        <span class="course-status">${esc(t(module.status === "available" ? "tutorial.available" : "tutorial.planned"))}</span></span>
        <span class="course-arrow" aria-hidden="true">↗</span></button>`;
    }
    function build() {
      if (built || !tutorials) return;
      const foundation = findTutorial(tutorials.foundationId);
      view.innerHTML = `<div class="course-home">
        <header class="sw-head"><span class="course-eyebrow">${esc(t("tutorial.pathLabel"))}</span><h2>${esc(t("software.title"))}</h2><p>${esc(t("software.intro"))}</p></header>
        <section aria-labelledby="course-foundation-heading"><h3 class="course-section-title" id="course-foundation-heading">${esc(t("tutorial.start"))}</h3>${card(foundation, 0, true)}</section>
        <div class="course-connection"><span aria-hidden="true">↓</span> ${esc(t("tutorial.branchHint"))}</div>
        <section aria-labelledby="course-directions-heading"><h3 class="course-section-title" id="course-directions-heading">${esc(t("tutorial.directions"))}</h3>
        <div class="course-grid">${tutorials.modules.filter(module => module.id !== foundation.id).map((module, index) => card(module, index + 1)).join("")}</div></section>
      </div>`;
      built = true;
    }
    const handleClick = event => {
      const sectionLink = event.target.closest("[data-course-section]");
      if (sectionLink) {
        const section = document.getElementById(sectionLink.dataset.courseSection);
        if (section) {
          section.scrollIntoView({block: "start"});
          const heading = section.matches("h2, h3") ? section : section.querySelector("h2, h3");
          heading?.setAttribute("tabindex", "-1");
          heading?.focus({preventScroll: true});
        }
        return;
      }
      const target = event.target.closest("[data-module]");
      if (target) navigate({ name: "tutorial", id: target.dataset.module });
    };
    view.addEventListener("click", handleClick);
    deepDiveElement.addEventListener("click", handleClick);
    async function ensureReady() {
      if (!built) view.innerHTML = `<div class="view-loading" role="status">${esc(t("software.loading"))}</div>`;
      await loadScriptsInOrder(bundle);
      tutorials = global.TUTORIALS;
      build();
    }
    function openTutorial(id) {
      const module = findTutorial(id);
      if (!module) return false;
      if (disposeWorkflow) { disposeWorkflow(); disposeWorkflow = null; }
      if (disposeExamples) { disposeExamples(); disposeExamples = null; }
      const foundation = findTutorial(tutorials.foundationId);
      const hasWorkflow = module.lessons.some(lesson => lesson.id === "prompt-workflow");
      const isEnglish = t("tutorial.language") === "en";
      const chapters = isEnglish ? ["Introduction", "I Choosing a prompt", "II Workflow"] : ["引言", "一 提示词的选择", "二 流程图"];
      document.getElementById("dd-top-name").textContent = label(module, "title");
      const topics = isEnglish ? ["Length", "Prompt basics", "Necessary materials", "Boundaries and rules", "Actionable requirements", "Iteration"] : ["长就是好？", "提示词基础", "提供必要材料", "明确边界与规则", "可执行要求", "迭代"];
      const sectionLink = (id, text, child = false) => `<button type="button" class="course-nav-link${child ? " course-nav-child" : ""}" data-course-section="${id}">${esc(text)}</button>`;
      const sidebar = `<nav class="course-sidebar" aria-label="${isEnglish ? "Lesson contents" : "本课目录"}"><div class="course-sidebar-label">${isEnglish ? "ON THIS PAGE" : "本课目录"}</div>
        ${sectionLink("course-introduction", chapters[0])}${sectionLink("course-prompt-selection", chapters[1])}
        ${topics.map((text, i) => sectionLink("course-topic-" + (i + 1), (i + 1) + "  " + text, true)).join("")}
        ${sectionLink("course-workflow", chapters[2])}${sectionLink("course-examples", isEnglish ? "Prompt examples" : "优秀提示词案例", true)}${sectionLink("course-faq", isEnglish ? "III Frequently asked questions" : "三 常见疑问")}
        ${isEnglish ? "" : global.TUTORIAL_FAQ.groups.map(g => sectionLink("course-faq-" + g.id, g.id + "  " + g.title, true)).join("")}
      </nav>`;
      const hero = `<div class="dd-hero">
        <div class="dd-eyebrow">${esc(t("software.title"))} · ${esc(t(module.id === foundation.id ? "tutorial.prerequisite" : "tutorial.direction"))}</div>
        <h1 class="dd-h1">${esc(label(module, "title"))}</h1><div class="dd-sub">${esc(label(module, "summary"))}</div></div>
        ${module.id !== foundation.id ? `<div class="course-prerequisite"><span>${esc(t("tutorial.prerequisite"))}</span><button type="button" class="course-inline-link" data-module="${esc(foundation.id)}">${esc(label(foundation, "title"))} →</button></div>` : `<p class="course-prerequisite">${esc(t("tutorial.foundationHint"))}</p>`}
        `;
      const next = module.id === foundation.id ? `<section class="course-next"><h2>${esc(t("tutorial.directions"))}</h2><div class="course-next-links">${tutorials.modules.filter(item => item.id !== foundation.id).map(item => `<button type="button" class="course-inline-link" data-module="${esc(item.id)}">${esc(label(item, "title"))} →</button>`).join("")}</div></section>` : "";
      document.getElementById("dd-article").innerHTML = hasWorkflow ? `<div class="course-layout">
        ${sidebar}<div class="course-main">${hero}${app.renderPromptFoundations(t("tutorial.language"))}</div>
        <aside class="course-workflow-rail" aria-labelledby="course-workflow-title"><section class="dd-sec course-workflow-chapter" id="course-workflow"><h2 id="course-workflow-title" tabindex="-1">${chapters[2]}</h2><div id="prompt-workflow"></div></section>${app.renderPromptExamples(t("tutorial.language"))}</aside>
        ${app.renderPromptFaq(t("tutorial.language"))}${next}</div>` : `${hero}<section class="course-empty"><span class="course-tag">${esc(t("tutorial.planned"))}</span><h2>${esc(t("tutorial.emptyTitle"))}</h2><p>${esc(t("tutorial.emptyBody"))}</p></section>${next}`;
      deepDiveElement.classList.remove("hidden");
      if (hasWorkflow) disposeWorkflow = app.mountPromptWorkflow(document.getElementById("prompt-workflow"), {language: t("tutorial.language")});
      if (hasWorkflow) disposeExamples = app.mountPromptExamples(document.getElementById("course-examples"), {language: t("tutorial.language")});
      deepDiveElement.querySelector(".dd-scroll").scrollTop = 0;
      return true;
    }
    function refreshLanguage() { built = false; build(); }
    return Object.freeze({ ensureReady, findTutorial, openTutorial, refreshLanguage, view });
  };
})(window);
