/* The same global settings, without adding a second set of reading shortcuts. */
(async function () {
  'use strict';
  const originalLocale=document.documentElement.lang;
  const article=document.querySelector('.tutorial-content');
  let saved='';try{saved=localStorage.getItem('ai-knowledge-map.locale.v1')||'';}catch(_){}
  const requested=new URLSearchParams(location.search).get('lang')||saved||originalLocale;
  const language=window.AIMap.i18n.createI18n({manifest:window.I18N_MANIFEST,registry:window.AI_LOCALES});
  function switchArticle() {
    const locale=language.getLocale();
    if(locale===originalLocale)return;
    const alternate=document.querySelector(`link[rel="alternate"][hreflang="${locale}"]`);
    if(!alternate)return;
    const published=new URL(alternate.href,location.href);
    const canonical=new URL(document.querySelector('link[rel="canonical"]').href);
    if(published.origin!==canonical.origin||!published.pathname.includes('/software/'))return;
    const target=new URL(published.pathname,location.origin);
    const sections=[...(article?.querySelectorAll('section[id]')||[])];
    const current=sections.filter(node=>node.getBoundingClientRect().top<=140).at(-1);
    target.hash=current?.id||location.hash;
    location.replace(target.href);
  }
  await language.initialize({urlLocale:requested});
  window.createMapSettings({language,manifest:window.I18N_MANIFEST,content:{ensureLocale:async()=>{}}});
  language.subscribe(switchArticle);switchArticle();
  const toc=document.querySelector('.tutorial-toc details');
  const toolbar=document.getElementById('topbar');
  const measure=()=>document.documentElement.style.setProperty('--tutorial-toolbar-height',toolbar.getBoundingClientRect().height+'px');
  new ResizeObserver(measure).observe(toolbar);measure();
  if(toc&&matchMedia('(max-width:760px)').matches)toc.open=false;
  toc?.addEventListener('click',event=>{if(event.target.closest('a')&&matchMedia('(max-width:760px)').matches)toc.open=false;});
})().catch(error=>console.error('Tutorial settings initialization failed',error));
