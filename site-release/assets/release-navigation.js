(function () {
  'use strict';
  const base = new URL('.',document.currentScript.src.replace(/assets\/release-navigation\.js$/, ''));
  const link = document.createElement('a'); link.className='release-directory-link';link.href=new URL('search/',base);link.textContent='文字目录 / Search';
  document.getElementById('topbar')?.append(link);
  function legacy() {
    const match=location.hash.match(/^#\/concept\/([a-z0-9-]+)$/);if(!match)return;
    const locale=new URLSearchParams(location.search).get('lang')==='en'?'en':'zh-Hans';
    const target=window.AI_STATIC_CONCEPTS?.[match[1]]?.[locale];
    if(target && /^(zh|en)\/concepts\/[a-z0-9-]+\/$/.test(target)) location.replace(new URL(target,base));
  }
  window.addEventListener('hashchange',legacy);legacy();
})();
