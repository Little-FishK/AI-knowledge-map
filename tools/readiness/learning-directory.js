'use strict';
// Presentation only: the controller supplies the exact set of published pages.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
function directory(entries, locale, base) {
  const en = locale === 'en';
  const pages = entries.filter(e => e.locale === locale);
  const other = en ? 'zh' : 'en';
  const positioning = require('./learning-positioning').copy[en ? 'en' : 'zh'];
  const {title, description} = positioning;
  const link = e => `${base}${locale}/concepts/${e.id}/`;
  const groups = [
    [en ? 'Start with the foundations' : '从基础开始', ['supervised-learning','unsupervised-learning','reinforcement-learning','neural-network','gradient-descent']],
    [en ? 'Understand language models' : '理解语言模型', ['tokenization','embedding','attention','transformer','llm']],
    [en ? 'Build with AI' : '理解 AI 应用', ['prompt-engineering','rag','retrieval','tool-calling','agent']]
  ];
  const starters = groups.map(([heading, ids]) => {
    const selected = ids.map(id => pages.find(e => e.id === id)).filter(Boolean);
    return selected.length ? `<section><h2>${heading}</h2><ul>${selected.map(e => `<li><a href="${esc(link(e))}">${esc(e.page.title)}</a></li>`).join('')}</ul></section>` : '';
  }).join('');
  const switcher = entries.some(e => e.locale === other) ? `<a lang="${en ? 'zh-Hans' : 'en'}" href="${base}${other}/">${en ? '中文学习指南' : 'English learning guide'}</a>` : '';
  const body = `<p>${description}</p><p>${en ? 'Choose a starting point below, read an explanation, then use the interactive map to explore related ideas. No programming experience is required to begin.' : '从下方主题选择起点，阅读概念解释，再通过交互地图探索相关知识。开始学习不要求编程经验。'}</p><p><a href="${base}?lang=${en ? 'en' : 'zh-Hans'}">${en ? 'Explore the AI knowledge map' : '探索 AI 知识地图'}</a> · ${switcher}</p>${starters}<section><h2>${en ? 'All concept explanations' : '全部概念解释'}</h2><p>${pages.length} ${en ? 'reading pages. Each page links to its available translation.' : '篇理解页，可在文章内切换已有的翻译版本。'}</p><ul>${pages.map(e => `<li class="directory-item"><a href="${esc(link(e))}">${esc(e.page.title)}</a><p>${esc(plain(e.page.subtitle))}</p></li>`).join('')}</ul></section>`;
  return {title, description, body: body.replace(`<p>${description}</p>`, `<p>${positioning.introduction}</p><p>${positioning.roadmap}</p>`)};
}
module.exports = {directory};
