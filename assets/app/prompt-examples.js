/* Compact, bilingual prompt library for the tutorial's right rail. */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  const esc = app.shared.escapeHtml;
  const markdown = app.shared.createMarkdownRenderer();
  const prose = value => markdown(value).replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+?)\)/g,
    (_, title, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`);
  app.renderPromptExamples = function (language) {
    const en = language === "en";
    return `<section class="course-examples" id="course-examples" aria-labelledby="course-examples-title">
      <h2 id="course-examples-title" tabindex="-1">${en ? "Prompt examples" : "优秀提示词案例"} <span class="course-faq-count">48</span></h2>
      <p class="pe-hint">${en ? "Open a case to read or copy it. Switch between the complete Chinese translation and English original." : "点击案例查看完整提示词，可切换中文译文与英文原文。"}</p>
      <div class="pe-filters" role="group" aria-label="${en ? "Example type" : "案例类型"}">
        <button type="button" data-pe-group="concise" aria-pressed="true">${en ? "Concise · 30" : "简洁准确 · 30"}</button>
        <button type="button" data-pe-group="complex" aria-pressed="false">${en ? "Complex · 18" : "复杂任务 · 18"}</button>
      </div>
      <p class="pe-rating-note">${en ? "Numbers are the source website's ratings, not success rates. Official recommendations and reference examples are labelled separately." : "数字为来源网站的评分，不是任务成功率；官方推荐与参考示例另行标注。"}</p>
      <div class="pe-list"></div>
      <details class="pe-licenses"><summary>${en ? "Sources and licences" : "来源与转载许可"}</summary><div class="pe-license-body"></div></details>
    </section>`;
  };
  app.mountPromptExamples = function (root, options = {}) {
    const en = options.language === "en";
    const data = global.TUTORIAL_PROMPTS;
    const byId = new Map(data.items.map(item => [item.id, item]));
    const choices = new Map();
    const list = root.querySelector(".pe-list");
    const rating = item => item.score !== null ? `${item.score}/100` : item.rating === "excellent" ? "Excellent" : item.rating === "recommended" ? (en ? "Official recommendation" : "官方推荐") : (en ? "Official reference" : "官方参考");
    function promptText(item, language) {
      const negative = item.negative[language];
      return item.prompt[language] + (negative ? `\n\n${language === "en" ? "Negative prompt" : "附带的负面提示词"}\n${negative}` : "");
    }
    function showGroup(group) {
      root.querySelectorAll("[data-pe-group]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.peGroup === group)));
      list.innerHTML = data.items.filter(item => item.group === group).map(item => `<details class="pe-item" data-pe-id="${item.id}">
        <summary><span class="pe-title">${esc(en ? item.titleEn : item.title)}</span><span class="pe-badge">${esc(rating(item))}</span><span class="pe-chevron" aria-hidden="true">＋</span></summary>
        <div class="pe-body"></div></details>`).join("");
    }
    function showLanguage(card, language) {
      const item = byId.get(card.dataset.peId);
      choices.set(item.id, language);
      card.querySelectorAll("[data-pe-language]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.peLanguage === language)));
      const code = card.querySelector(".pe-code");
      code.textContent = promptText(item, language);
      code.lang = language === "en" ? "en" : "zh-Hans";
      code.scrollTop = 0;
      card.querySelector(".pe-status").textContent = "";
    }
    function fillCard(card) {
      const body = card.querySelector(".pe-body");
      if (body.childElementCount) return;
      const item = byId.get(card.dataset.peId);
      const notes = en ? item.notesEn : item.notesZh;
      body.innerHTML = `<p class="pe-source">${esc(item.provider)} · ${esc(rating(item))}</p>
        ${notes ? `<div class="pe-context">${prose(notes)}</div>` : ""}
        <div class="pe-toolbar"><div class="pe-languages" role="group" aria-label="${en ? "Prompt language" : "提示词语言"}">
          <button type="button" data-pe-language="zh" aria-pressed="false">${en ? "Chinese" : "中文"}</button><button type="button" data-pe-language="en" aria-pressed="false">English</button>
        </div><button type="button" data-pe-copy>${en ? "Copy" : "复制"}</button></div>
        <pre class="pe-code" tabindex="0" aria-label="${en ? "Complete prompt" : "完整提示词"}"></pre>
        <span class="pe-status" role="status"></span>
        <div class="pe-links">${item.sources.map((source, i) => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${en ? (i === 0 ? "Source and rating" : "Full original") : esc(source.label)} ↗</a>`).join("")}</div>`;
      showLanguage(card, choices.get(item.id) || (en ? "en" : "zh"));
    }
    function onToggle(event) {
      const card = event.target;
      if (card.matches(".pe-item") && card.open) fillCard(card);
      if (card.matches(".pe-licenses") && card.open) {
        const body = card.querySelector(".pe-license-body");
        if (!body.childElementCount) body.innerHTML = data.licenses.map(block => block.startsWith("```") ? `<pre>${esc(block.replace(/^```[^\n]*\n/, "").replace(/\n```$/, ""))}</pre>` : block.startsWith("## ") ? `<h3>${esc(block.slice(3))}</h3>` : prose(block)).join("");
      }
    }
    async function onClick(event) {
      const filter = event.target.closest("[data-pe-group]");
      if (filter) { showGroup(filter.dataset.peGroup); return; }
      const card = event.target.closest(".pe-item");
      if (!card) return;
      const lang = event.target.closest("[data-pe-language]");
      if (lang) { showLanguage(card, lang.dataset.peLanguage); return; }
      const copy = event.target.closest("[data-pe-copy]");
      if (!copy) return;
      const status = card.querySelector(".pe-status");
      try {
        await navigator.clipboard.writeText(card.querySelector(".pe-code").textContent);
        status.textContent = en ? "Copied" : "已复制";
      } catch (_) { status.textContent = en ? "Copy unavailable. Select the prompt text to copy it." : "无法自动复制，请选中提示词文字复制。"; }
    }
    showGroup("concise");
    root.addEventListener("click", onClick);
    root.addEventListener("toggle", onToggle, true);
    return () => { root.removeEventListener("click", onClick); root.removeEventListener("toggle", onToggle, true); };
  };
})(window);
