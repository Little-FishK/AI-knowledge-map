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
  function readingTarget(id) {
    const target=window.AI_STATIC_CONCEPTS?.[id]?.[readingLocale()];
    return target && /^(zh|en)\/concepts\/[a-z0-9-]+\/$/.test(target) ? new URL(target,base) : null;
  }
  // Published reading buttons must leave directly, before the map's delegated
  // handler opens its legacy modal and changes the hash.
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const button=event.target.closest?.('[data-dd]');
    if(!button)return;
    const target=readingTarget(button.getAttribute('data-dd'));
    if(!target)return; // Offline/unpublished pages still use the local reader.
    event.preventDefault();event.stopImmediatePropagation();location.assign(target);
  },true);
  function legacy() {
    const match=location.hash.match(/^#\/concept\/([a-z0-9-]+)$/);if(!match)return;
    const target=readingTarget(match[1]);
    if(target) location.replace(target);
  }
  window.addEventListener('hashchange',legacy);legacy();
})();
