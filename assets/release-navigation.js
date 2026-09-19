(function () {
  'use strict';
  const base = new URL('../', document.currentScript.src);
  const link = document.createElement('a'); link.className='release-directory-link';link.href=new URL('search/',base);link.textContent='文字目录 / Search';
  if (!document.querySelector('[data-release-search]')) document.getElementById('topbar')?.append(link);
  function readingLocale() {
    // Settings can change the active locale without adding a URL parameter.
    const active=window.__i18n?.getLocale();
    if(active==='en'||active==='zh-Hans')return active;
    let saved='';
    try { saved=window.localStorage?.getItem(window.I18N_MANIFEST?.storageKey||'ai-knowledge-map.locale.v1')||''; } catch (_) {}
    const urlLocale=new URLSearchParams(location.search).get('lang');
    if(window.AIMap?.i18n && window.I18N_MANIFEST) return window.AIMap.i18n.resolveInitialLocale({
      manifest:window.I18N_MANIFEST,urlLocale,savedLocale:saved,navigatorLanguages:window.navigator?.languages||[]
    });
    return [urlLocale,saved].find(locale=>locale==='en'||locale==='zh-Hans')||'zh-Hans';
  }
  function legacy() {
    const match=location.hash.match(/^#\/concept\/([a-z0-9-]+)$/);if(!match)return;
    const locale=readingLocale();
    const target=window.AI_STATIC_CONCEPTS?.[match[1]]?.[locale];
    if(target && /^(zh|en)\/concepts\/[a-z0-9-]+\/$/.test(target)) location.replace(new URL(target,base));
  }
  window.addEventListener('hashchange',legacy);legacy();
})();
