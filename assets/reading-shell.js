(async function () {
  'use strict';
  const bar = document.querySelector('[data-reading-shell]');
  if (!bar) return;
  const base = bar.dataset.base;
  const article = document.getElementById('dd-article');
  const contentLocale = document.documentElement.lang;
  if (article) article.lang = contentLocale;
  const language = window.AIMap.i18n.createI18n({manifest:window.I18N_MANIFEST,registry:window.AI_LOCALES});
  await language.initialize({urlLocale:new URLSearchParams(location.search).get('lang') || contentLocale});
  window.createMapSettings({language,manifest:window.I18N_MANIFEST,content:{ensureLocale:async () => {}}});
  const route = (hash, extra = '') => `${base}?lang=${encodeURIComponent(language.getLocale())}${extra}${hash}`;
  bar.querySelectorAll('[data-mode]').forEach(button => {
    button.onclick = () => location.assign(route(button.dataset.mode === 'graph' ? '' : '#/' + button.dataset.mode));
  });
  document.getElementById('btn-reset')?.addEventListener('click', () => location.assign(route('')));
  document.getElementById('btn-onboarding')?.addEventListener('click', () => location.assign(route('', '&onboarding=1')));
  const brand = bar.querySelector('.brand');
  brand.setAttribute('role','link'); brand.tabIndex = 0;
  brand.onclick = () => location.assign(route(''));
  brand.onkeydown = event => { if (event.key === 'Enter') brand.click(); };
  const search = document.getElementById('search');
  search.addEventListener('keydown', event => {
    if (event.key === 'Enter' && search.value.trim()) location.assign(`${base}search/?q=${encodeURIComponent(search.value.trim())}&lang=${language.getLocale()}`);
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input, textarea, select, [contenteditable="true"]') && document.getElementById('settings-overlay').classList.contains('hidden')) {
      event.preventDefault(); search.focus();
    }
  });
  function localize() {
    language.localize(bar);
    const en = language.getLocale() === 'en';
    bar.querySelector('[data-shell-about]').textContent = en ? 'About / Corrections' : '关于与纠错';
    bar.querySelector('[data-shell-search]').textContent = en ? 'Text directory / Search' : '文字目录 / Search';
    let notice = document.getElementById('reading-language-notice');
    if (article && contentLocale !== language.getLocale()) {
      if (!notice) { notice = document.createElement('p'); notice.id = 'reading-language-notice'; notice.className = 'release-notice'; article.before(notice); }
      notice.textContent = en ? 'This reading page is displayed in its original language. Available translations can be found below the article.' : '当前正文保持原文语言，可用的语言版本请见正文末尾。';
    } else notice?.remove();
  }
  language.subscribe(localize); localize();
})().catch(error => console.error('Reading navigation initialization failed', error));
