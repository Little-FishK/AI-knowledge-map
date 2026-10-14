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
  app.renderPromptFaq = function (language) {
    if (language === "en") return `<section class="dd-sec course-faq" id="course-faq"><h2 tabindex="-1">III Frequently asked questions</h2><p>The 70 answers and their research references are currently available in Chinese.</p><a class="course-inline-link" href="software/?lang=zh-Hans&amp;tutorial=conversation-basics">Read the Chinese edition →</a></section>`;
    const groups = global.TUTORIAL_FAQ.groups;
    return `<section class="dd-sec course-faq" id="course-faq" aria-labelledby="course-faq-title">
      <h2 id="course-faq-title" tabindex="-1">三 常见疑问 <span class="course-faq-count">70 问</span></h2>
      <p class="course-faq-hint">按五项能力分类，点击问题展开答案与引用。</p>
      ${groups.map(group => `<section class="course-faq-group" id="course-faq-${group.id}" aria-labelledby="course-faq-title-${group.id}">
        <h3 id="course-faq-title-${group.id}" tabindex="-1"><span>${group.id}</span> ${esc(group.title)} <small>${group.questions.length} 问</small></h3>
        ${group.questions.map(q => `<details class="course-faq-item" id="faq-${q.id}">
          <summary><span class="course-faq-id">${esc(q.id)}</span><span>${esc(q.question)}</span><span class="course-faq-toggle" aria-hidden="true">＋</span></summary>
          <div class="course-faq-answer">${answerHtml(q.answer)}</div>
        </details>`).join("")}
      </section>`).join("")}
    </section>`;
  };
})(window);
