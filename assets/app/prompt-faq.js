/* FAQ presentation. Answers and references live together in data/tutorials-faq.js. */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  const esc = app.shared.escapeHtml;
  const markdown = app.shared.createMarkdownRenderer();
  function answerHtml(answer) {
    // The shared renderer escapes HTML before formatting. Only HTTP(S) citations
    // become links; source markup cannot insert elements or executable URLs.
    return markdown(answer).replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+?)\)/g,
      (_, title, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`);
  }
  app.renderPromptFaqAnswer = answerHtml;
  app.renderPromptFaq = function (language) {
    const english = language === "en";
    const groups = (english ? global.TUTORIAL_FAQ_EN : global.TUTORIAL_FAQ).groups;
    const hub = (english ? "en/" : "") + "software/conversation-basics/faq/";
    return `<section class="dd-sec course-faq" id="course-faq" aria-labelledby="course-faq-title">
      <h2 id="course-faq-title" tabindex="-1">${english ? "III Frequently asked questions" : "三 常见疑问"} <span class="course-faq-count">${english ? "70 questions" : "70 问"}</span></h2>
      <p class="course-faq-hint">${english ? "Organized into five capabilities. Expand a question to read its answer and references." : "按五项能力分类，点击问题展开答案与引用。"}<a href="${hub}">${english ? "Browse the question directory →" : "浏览问答目录 →"}</a></p>
      ${groups.map(group => `<section class="course-faq-group" id="course-faq-${group.id}" aria-labelledby="course-faq-title-${group.id}">
        <h3 id="course-faq-title-${group.id}" tabindex="-1"><span>${group.id}</span> ${esc(group.title)} <small>${group.questions.length} ${english ? "questions" : "问"}</small></h3>
        ${group.questions.map(q => `<details class="course-faq-item" id="faq-${q.id}">
          <summary><span class="course-faq-id">${esc(q.id)}</span><span>${esc(q.question)}</span><span class="course-faq-toggle" aria-hidden="true">＋</span></summary>
          <div class="course-faq-answer"><p class="course-faq-permalink"><a href="${hub}${q.id.toLowerCase()}/" aria-label="${english ? "Read: " : "独立阅读："}${esc(q.question)}">${english ? "Read and share this answer ↗" : "独立阅读与分享 ↗"}</a></p>${answerHtml(q.answer)}</div>
        </details>`).join("")}
      </section>`).join("")}
    </section>`;
  };
})(window);
