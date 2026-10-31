/* 软件教程：前置基础、同级学习方向与各方向的章节目录。 */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  app.createSoftwareView = function (options) {
    const { view, deepDiveElement, escapeHtml: esc, loadScriptsInOrder, navigate, t } = options;
    let tutorials = null;
    let built = false;
    let disposeWorkflow = null;
    let disposeExamples = null;
    let disposeDiagrams = null;
    const bundle = ["data/tutorials.js?v=24210adddea6aadf","assets/app/prompt-foundations.js?v=4a23ebfad8791218","assets/app/prompt-workflow.js?v=0d655282890c07ff","data/tutorials-faq.js?v=b0f74c8595f04822","assets/app/prompt-faq.js?v=3afe562049c24609","data/tutorials-prompts.js?v=3a06c26de557b9f6","assets/app/prompt-examples.js?v=666b3d4c5288f43f","data/tutorials-coding.js?v=4b17c8cfcca9df58"];
    const label = (module, field) => t("tutorial.language") === "en" ? module[field + "En"] || module[field] : module[field];
    const findTutorial = id => tutorials?.modules.find(module => module.id === id);
    const readingTutorial = (id, lessonId) => {
      const original = id === "ai-coding" ? global.CODING_TUTORIALS?.[lessonId || "coding-foundations"] || null : id !== "agents-automation" ? null : ({
      "agent-foundations": global.AGENT_TUTORIAL,
      "agent-building": global.AGENT_BUILDING_TUTORIAL,
      "agent-discovery": global.AGENT_DISCOVERY_TUTORIAL,
      "automation": global.AGENT_AUTOMATION_TUTORIAL,
      "agent-evaluation": global.AGENT_EVALUATION_TUTORIAL,
      })[lessonId || "agent-foundations"] || null;
      return t("tutorial.language") === "en" ? original?.translations?.en || original : original;
    };
    const findLesson = (id, lessonId) => findTutorial(id)?.lessons.some(lesson => lesson.kind === "reading" && lesson.id === lessonId)
      ? readingTutorial(id, lessonId)?.chapter : null;
    function resolveLegacyRoute(id) {
      if (["agent-work", "multi-agent-collaboration", "agent-monitoring"].includes(id)) return {name: "tutorial", id: "agents-automation"};
      const chapter = findTutorial("agents-automation")?.chapters.find(item => item.legacyModuleId === id);
      return chapter ? {name: "tutorial", id: "agents-automation", ...(chapter.status === "available" ? {lesson: chapter.id} : {})} : null;
    }
    function directionNavigation(activeId) {
      return `<nav class="course-direction-nav" aria-label="${t("tutorial.language") === "en" ? "Learning directions" : "学习方向"}">
        ${tutorials.modules.filter(module => module.id !== tutorials.foundationId).map(module => `<button type="button" class="course-direction" data-module="${esc(module.id)}" aria-current="${module.id === activeId ? "page" : "false"}" style="--module-color:${esc(module.color)}">${esc(label(module, "title"))}</button>`).join("")}
      </nav>`;
    }
    function agentDirectory(module) {
      const isEnglish = t("tutorial.language") === "en";
      return `<div class="course-agent-directory" id="course-agent-directory">
          <div class="course-grid" aria-label="${isEnglish ? "Chapter directory" : "章节目录"}">${module.chapters.map(chapter => {
            const available = chapter.status === "available";
            return `<button type="button" class="course-card course-chapter-card${available ? "" : " course-chapter-planned"}" ${available ? `data-lesson="${esc(chapter.id)}" data-lesson-module="${esc(module.id)}"` : `data-planned-chapter="${esc(chapter.id)}" disabled`} style="--module-color:${esc(module.color)}">
            <span class="course-number">${String(chapter.number).padStart(2, "0")}</span>
            <span class="course-card-copy"><span class="course-tag">${isEnglish ? "Chapter" : "章节"}</span>
              <span class="course-title">${esc(label(chapter, "title"))}</span>
              ${available && chapter.summary ? `<span class="course-summary">${esc(label(chapter, "summary"))}</span>` : ""}
              <span class="course-status">${available ? isEnglish ? "Start learning →" : "开始学习 →" : isEnglish ? "Content in preparation" : "正文待补充"}</span></span>
            ${available ? '<span class="course-arrow" aria-hidden="true">↗</span>' : ""}</button>`;
          }).join("")}</div>
        </div>`;
    }
    function plannedDirectory(module) {
      if (t("tutorial.language") === "en") {
        const chineseUrl = new URL(global.location.href);
        chineseUrl.searchParams.set("lang", "zh-Hans");
        return `<section class="course-empty"><h2>Chapters in preparation</h2><p>The chapter outline is available in Simplified Chinese. Lesson content is in preparation.</p><p><a href="${esc(chineseUrl.href)}">View the Simplified Chinese outline →</a></p></section>`;
      }
      return `<div class="course-planned-directory" data-directory="${esc(module.id)}"><div class="course-grid" aria-label="章节目录">
          ${module.chapters.map(chapter => `<button type="button" class="course-card course-chapter-card course-chapter-planned" data-planned-chapter="${esc(chapter.id)}" disabled style="--module-color:${esc(module.color)}">
            <span class="course-number">${String(chapter.number).padStart(2, "0")}</span>
            <span class="course-card-copy"><span class="course-tag">章节</span>
              <span class="course-title">${esc(chapter.title)}</span>
              <span class="course-status">正文待补充</span></span>
          </button>`).join("")}</div>
        </div>`;
    }
    function card(module, index, foundation = false) {
      return `<button type="button" class="course-card${foundation ? " course-foundation" : ""}" data-module="${esc(module.id)}" style="--module-color:${esc(module.color)}">
        <span class="course-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="course-card-copy"><span class="course-tag">${esc(t(foundation ? "tutorial.prerequisite" : "tutorial.direction"))}</span>
        <span class="course-title">${esc(label(module, "title"))}</span>
        <span class="course-summary">${esc(label(module, "summary"))}</span>
        <span class="course-status">${esc(module.status === "available" && !foundation ? t("tutorial.language") === "en" ? "Start learning" : "开始学习" : t(module.status === "available" ? "tutorial.available" : "tutorial.planned"))}</span></span>
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
        <div class="course-grid">${tutorials.modules.filter(module => module.id !== tutorials.foundationId).map((module, index) => card(module, index + 1)).join("")}</div></section>
      </div>`;
      built = true;
    }
    const handleClick = event => {
      const lessonLink = event.target.closest("[data-lesson]");
      if (lessonLink) {
        navigate({name: "tutorial", id: lessonLink.dataset.lessonModule || "agents-automation", lesson: lessonLink.dataset.lesson});
        return;
      }
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
    function openTutorial(id, lessonId) {
      const module = findTutorial(id);
      if (!module) return false;
      if (disposeWorkflow) { disposeWorkflow(); disposeWorkflow = null; }
      if (disposeExamples) { disposeExamples(); disposeExamples = null; }
      if (disposeDiagrams) { disposeDiagrams(); disposeDiagrams = null; }
      const foundation = findTutorial(tutorials.foundationId);
      const hasWorkflow = module.lessons.some(lesson => lesson.id === "prompt-workflow");
      const agentTutorial = readingTutorial(id, lessonId);
      const hasAgentLesson = Boolean(agentTutorial && module.lessons.some(lesson => lesson.kind === "reading"));
      const hasPlannedChapters = Array.isArray(module.chapters) && module.chapters.length > 0;
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
        ${module.id === "agents-automation" ? "" : module.id !== foundation.id ? `<div class="course-prerequisite"><span>${esc(t("tutorial.prerequisite"))}</span><button type="button" class="course-inline-link" data-module="${esc(foundation.id)}">${esc(label(foundation, "title"))} →</button></div>` : `<p class="course-prerequisite">${esc(t("tutorial.foundationHint"))}</p>`}
        `;
      const next = module.id === foundation.id ? `<section class="course-next"><h2>${esc(t("tutorial.directions"))}</h2><div class="course-next-links">${tutorials.modules.filter(item => item.id !== foundation.id).map(item => `<button type="button" class="course-inline-link" data-module="${esc(item.id)}">${esc(label(item, "title"))} →</button>`).join("")}</div></section>` : "";
      let agentContent = "";
      if (hasAgentLesson) {
        const lesson = findLesson(id, lessonId);
        if (!lesson) {
          agentContent = `<div class="course-agent-overview">${hero}${agentDirectory(module)}</div>`;
        } else if (isEnglish && agentTutorial.language !== "en") {
          const chineseUrl = new URL(global.location.href);
          chineseUrl.searchParams.set("lang", "zh-Hans");
          agentContent = `${hero}<section class="course-empty"><h2>Read this chapter</h2><p>This chapter is available in Simplified Chinese. The English version is in preparation.</p><p><a href="${esc(chineseUrl.href)}">Read in Simplified Chinese →</a></p></section>`;
        } else {
          const {introduction, chapter} = agentTutorial;
          const contentsLabel = isEnglish ? "Chapter contents" : "本章目录";
          const returnLabel = isEnglish ? "← Back to chapters" : "← 返回章节目录";
            agentContent = `<div class="course-layout course-agent-layout">
              <nav class="course-sidebar" aria-label="${contentsLabel}"><button type="button" class="course-inline-link course-return" data-module="${id}">${returnLabel}</button><div class="course-sidebar-label">${contentsLabel}</div>
                ${introduction ? sectionLink(introduction.id, introduction.title) : ""}${chapter.sections.map(section => sectionLink(section.id, section.title) + (section.headings || []).map(heading => sectionLink(heading.id, heading.title, true)).join("")).join("")}
              </nav><div class="course-main course-agent-chapter" id="${chapter.id}"><header class="dd-hero"><div class="dd-eyebrow">${esc(label(module, "title"))}</div><h1 class="dd-h1">${esc(chapter.title)}</h1></header>
                ${introduction ? `<section class="dd-sec course-reading" id="${introduction.id}"><h2>${esc(introduction.title)}</h2><div class="course-agent-intro-body">${introduction.html}</div></section>` : ""}
                ${chapter.sections.map(section => `<section class="dd-sec course-reading course-agent-section" id="${section.id}"><h2>${esc(section.title)}</h2><div class="course-agent-section-body">${section.html}</div></section>`).join("")}
                <button type="button" class="course-inline-link" data-module="${id}">${returnLabel}</button>
              </div></div>`;
        }
      }
      document.getElementById("dd-article").innerHTML = hasAgentLesson ? agentContent : hasWorkflow ? `<div class="course-layout">
        ${sidebar}<div class="course-main">${hero}${app.renderPromptFoundations(t("tutorial.language"))}</div>
        <aside class="course-workflow-rail" aria-labelledby="course-workflow-title"><section class="dd-sec course-workflow-chapter" id="course-workflow"><h2 id="course-workflow-title" tabindex="-1">${chapters[2]}</h2><div id="prompt-workflow"></div></section>${app.renderPromptExamples(t("tutorial.language"))}</aside>
        ${app.renderPromptFaq(t("tutorial.language"))}${next}</div>` : hasPlannedChapters ? `<div class="course-agent-overview">${directionNavigation(id)}${hero}${plannedDirectory(module)}</div>` : `${directionNavigation(id)}${hero}<section class="course-empty"><span class="course-tag">${esc(t("tutorial.planned"))}</span><h2>${esc(t("tutorial.emptyTitle"))}</h2><p>${esc(t("tutorial.emptyBody"))}</p></section>${next}`;
      deepDiveElement.classList.remove("hidden");
      if (hasAgentLesson) disposeDiagrams = app.mountTutorialDiagrams?.(document.getElementById("dd-article"), {loadScriptsInOrder, language: t("tutorial.language")});
      if (hasWorkflow) disposeWorkflow = app.mountPromptWorkflow(document.getElementById("prompt-workflow"), {language: t("tutorial.language")});
      if (hasWorkflow) disposeExamples = app.mountPromptExamples(document.getElementById("course-examples"), {language: t("tutorial.language")});
      deepDiveElement.querySelector(".dd-scroll").scrollTop = 0;
      return true;
    }
    function refreshLanguage() { built = false; build(); }
    return Object.freeze({ ensureReady, findTutorial, findLesson, resolveLegacyRoute, openTutorial, refreshLanguage, view });
  };
})(window);
