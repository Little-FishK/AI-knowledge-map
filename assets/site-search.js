(function () {
  'use strict';
  const input = document.getElementById('site-query'), form = input?.closest('form');
  if (!form) return;
  const list = document.getElementById('directory-results'), status = document.getElementById('search-status');
  const items = [...list.children]; let fullText = null, timer, requested = false;
  const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase();
  function search() {
    if (input.value.trim() && !requested) loadFullText();
    const q = normalize(input.value.trim()), words = q.split(/\s+/).filter(Boolean); let count = 0;
    items.forEach((item, index) => {
      const text = normalize(item.dataset.search + ' ' + (fullText?.[index]?.text || ''));
      item.hidden = !words.every(word => text.includes(word)); if (!item.hidden) count++;
    });
    const score = item => { const title = normalize(item.querySelector('a').textContent); return !q ? 0 : title === q ? 3 : title.startsWith(q) ? 2 : title.includes(q) ? 1 : 0; };
    [...items].sort((a,b) => score(b)-score(a)).forEach(item => list.append(item));
    status.textContent = `${count} / ${items.length} · ${fullText ? '标题、别名与正文 / Titles, aliases and full text' : '标题与简介 / Titles and summaries'}${count ? '' : ' · 没有结果，请尝试更短的关键词 / Try a shorter query'}`;
    const url = new URL(location.href); q ? url.searchParams.set('q', input.value.trim()) : url.searchParams.delete('q'); history.replaceState(null,'',url);
  }
  form.addEventListener('submit', event => { event.preventDefault(); search(); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search,120); });
  input.value = new URLSearchParams(location.search).get('q') || ''; search();
  function loadFullText() {
    requested = true;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),8000);
    fetch(new URL('../assets/site-search-index.json',location.href), {signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Search index unavailable');return r.json();}).then(data=>{if(Array.isArray(data)&&data.length===items.length)fullText=data;search();}).catch(()=>{search();status.textContent += ' · 正文索引暂不可用，目录仍可浏览 / Full-text index unavailable';}).finally(()=>clearTimeout(timeout));
  }
})();
