(function () {
  'use strict';
  const input = document.getElementById('site-query'), form = input?.closest('form');
  if (!form) return;
  const list = document.getElementById('directory-results'), status = document.getElementById('search-status');
  const href = item => new URL(item.querySelector('a').getAttribute('href'),location.href).pathname;
  const seen = new Set();
  const items = [...list.children].filter(item=>{const key=href(item);if(seen.has(key)){item.remove();return false;}seen.add(key);return true;});
  let fullText = null, timer, requested = false, failed = false, limit = 40;
  const more=document.createElement('button'),retry=document.createElement('button'),clear=document.createElement('button');
  for(const button of [more,retry,clear]){button.type='button';button.style.cssText='min-height:44px;margin:8px;padding:8px 16px;cursor:pointer';}
  more.textContent='显示更多 / Show more';retry.textContent='重试正文索引 / Retry full-text index';clear.textContent='清空搜索 / Clear search';
  list.after(more);status.after(retry);input.after(clear);retry.hidden=true;
  more.onclick=()=>{const first=limit;limit+=40;search();[...list.children].filter(i=>i.dataset.matches==='true')[first]?.querySelector('a')?.focus();};
  clear.onclick=()=>{input.value='';limit=40;search();input.focus();};retry.onclick=()=>{requested=false;failed=false;loadFullText();};
  const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase();
  const match=(value,word)=>/[^\x00-\x7f]/.test(word)?value.includes(word):value.split(/[^\p{L}\p{N}]+/u).some(token=>token.startsWith(word));
  function search() {
    if (input.value.trim() && !requested) loadFullText();
    const q = normalize(input.value.trim()), words = q.split(/\s+/).filter(Boolean); let count = 0;
    items.forEach((item, index) => {
      const text = normalize(item.dataset.search + ' ' + (fullText?.get(href(item))?.text || ''));
      const matches=words.every(word=>match(text,word));item.dataset.matches=String(matches);item.hidden=!matches;if(matches)count++;
    });
    const score = item => { const title = normalize(item.querySelector('a').textContent); return !q ? 0 : title === q ? 3 : title.startsWith(q) ? 2 : title.includes(q) ? 1 : 0; };
    let shown=0;[...items].sort((a,b) => score(b)-score(a)).forEach(item => {if(item.dataset.matches==='true')item.hidden=++shown>limit;list.append(item);});
    more.hidden=count<=limit;more.textContent=`显示更多 / Show more (${Math.min(limit,count)}/${count})`;retry.hidden=!failed;
    status.textContent = `${count} / ${items.length} · ${fullText ? '标题、别名与正文 / Titles, aliases and full text' : '标题与简介 / Titles and summaries'}${count ? '' : ' · 没有结果，请尝试更短的关键词 / Try a shorter query'}`;
    if(failed)status.textContent+=' · 正文索引暂不可用，可重试 / Full-text index unavailable; retry';
    const url = new URL(location.href); q ? url.searchParams.set('q', input.value.trim()) : url.searchParams.delete('q'); history.replaceState(null,'',url);
  }
  form.addEventListener('submit', event => { event.preventDefault();limit=40; search(); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(()=>{limit=40;search();},120); });
  input.value = new URLSearchParams(location.search).get('q') || ''; search();
  function loadFullText() {
    requested = true;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),8000);
    fetch(new URL('../assets/site-search-index.json',location.href), {signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Search index unavailable');return r.json();}).then(data=>{if(!Array.isArray(data)||!data.length||data.some(r=>typeof r.href!=='string'||(r.text!==undefined&&typeof r.text!=='string')))throw Error('Invalid search index');fullText=new Map(data.map(row=>[new URL(row.href,location.href).pathname,row]));failed=false;search();}).catch(()=>{failed=true;search();}).finally(()=>clearTimeout(timeout));
  }
})();
