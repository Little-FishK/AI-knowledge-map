(function (global) {
  'use strict';
  const lessons = global.AI_ONBOARDING_LESSONS;
  const model = global.AI_ONBOARDING_MODEL;
  const app = document.getElementById('app');
  const count = lessons.length;
  let storage = null, storageFailed = false, returnFocus = null, previousTitle = document.title;
  let state = model.normalize(null, count);
  let view = 'map';
  try {
    storage = global.localStorage;
    state = model.normalize(JSON.parse(storage.getItem(model.key)), count);
  } catch (_) { storageFailed = true; }
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  const root = document.createElement('section');
  root.id = 'onboarding'; root.lang = 'zh-Hans'; root.hidden = true;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'onboarding-title');
  document.body.append(root);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const isOpen = () => !root.hidden;
  const english = () => {
    try { return document.documentElement.lang === 'en' || new URLSearchParams(global.location.search).get('lang') === 'en' || storage?.getItem('ai-knowledge-map.locale.v1') === 'en'; }
    catch (_) { return false; }
  };
  function persist() {
    if (!storage) { storageFailed = true; return; }
    try {
      const raw = storage.getItem(model.key);
      // A damaged value must not make the writable store unusable.
      let remote = null;
      try { remote = JSON.parse(raw); } catch (_) {}
      state = model.merge(state, remote, count);
      storage.setItem(model.key, JSON.stringify(state));
      storageFailed = false;
    } catch (_) { storageFailed = true; }
  }
  function figure(lesson) {
    const {cards, flow, caption} = lesson.figure;
    const step = 106, height = cards.length * step - 12;
    const diagram = cards.map(([title, detail], index) => {
      const y = index * step;
      return `<g transform="translate(12 ${y + 4})"><rect width="336" height="82" rx="10" fill="#202630" stroke="#465369"/>
        <text x="168" y="31" text-anchor="middle" fill="#d9e7f7" font-size="18" font-family="sans-serif">${escape(title)}</text>
        <text x="168" y="59" text-anchor="middle" fill="#b5c3d5" font-size="14" font-family="sans-serif">${escape(detail)}</text></g>
        ${flow && index < cards.length - 1 ? `<path d="M180 ${y + 89} v12 m-5 -5 5 5 5 -5" fill="none" stroke="#8ab2e5" stroke-width="2"/>` : ''}`;
    }).join('');
    return `<figure class="dd-fig"><svg viewBox="0 0 360 ${height}" role="img" aria-labelledby="onboarding-fig-title onboarding-fig-desc"><title id="onboarding-fig-title">${escape(lesson.short)}：图解</title><desc id="onboarding-fig-desc">${escape(cards.map(row => row.join('：')).join('。'))}</desc>${diagram}</svg><figcaption>图1 · ${escape(caption)}</figcaption></figure>`;
  }
  function render(focus = false) {
    const lesson = lessons[state.cursor];
    const last = state.cursor === count - 1;
    const isMap = view === 'map';
    document.title = `${isMap ? '新手地图' : lesson.title}｜新手导览 · AI 知识地图`;
    root.setAttribute('aria-labelledby', isMap ? 'onboarding-title' : 'onboarding-lesson-title');
    root.innerHTML = `<div class="onboarding-shell">
      <header class="onboarding-top"><div class="onboarding-brand"><span aria-hidden="true">◈</span>AI 知识地图</div>
        <button class="onboarding-skip" type="button" data-skip>${model.unlocked(state, count) ? (english() ? '返回地图 / Back to map' : '返回地图') : (english() ? '我已熟悉AI基础用法 / Skip introduction' : '我已熟悉AI基础用法')}</button></header>
      ${isMap ? `<div class="onboarding-intro"><div class="dd-eyebrow">你的第一张地图</div><h1 id="onboarding-title" tabindex="-1">快速认识AI世界</h1>
        <p>从一件身边的小事出发，走过6站，再进入完整知识地图。</p><p>每站约3–4分钟 · 无需编程或注册 · 点“读过”继续，也可以随时回来。</p>
        ${english() ? '<p class="onboarding-fallback" lang="en">This beginner guide is currently in Chinese. You can skip it and explore the map in English.</p>' : ''}</div>` : '<nav class="onboarding-reader-nav" aria-label="新手导览"><button class="onboarding-prev" type="button" data-map>← 返回新手地图</button></nav>'}
      <p class="onboarding-storage" ${storageFailed ? '' : 'hidden'}>当前浏览器无法保存进度，仍可继续阅读或跳过；刷新后可能需要重新开始。</p>
      ${isMap ? `<ol class="onboarding-route" aria-label="六站新手地图">${lessons.map((item, index) => {
        const locked = index > state.read;
        const read = index < state.read;
        return `<li class="${read ? 'is-read' : locked ? 'is-locked' : 'is-current'}"><button type="button" data-visit="${index}" ${locked ? 'disabled' : ''} ${!locked && !read ? 'aria-current="step"' : ''}><span class="onboarding-dot" aria-hidden="true">${read ? '✓' : index + 1}</span><span class="onboarding-node-name">${escape(item.short)}</span><span class="onboarding-node-status">${read ? '已读过 · 再看看' : locked ? '读过上一站后解锁' : '点击开始阅读'}</span></button></li>`;
      }).join('')}</ol><p class="onboarding-map-hint">点击亮起的节点开始。每读过一站，就解锁下一站；走完六站，开启完整知识地图。</p>` : `<article class="onboarding-reader" aria-labelledby="onboarding-lesson-title"><div class="dd-hero">
        <div class="dd-eyebrow">第 ${state.cursor + 1} 站 / 共 ${count} 站</div><h2 id="onboarding-lesson-title" class="dd-h1" tabindex="-1">${escape(lesson.title)}</h2>
        <p class="dd-sub">${escape(lesson.subtitle)}</p><div class="dd-thesis"><span class="dd-thesis-l">先记住</span>${escape(lesson.thesis)}</div></div>
      ${lesson.sections.map(([title, html], index) => `<section class="dd-sec"><h2><span class="dd-n" aria-hidden="true">${index + 1}</span>${escape(title)}</h2>${html}${index === 1 ? figure(lesson) : ''}</section>`).join('')}
      <details><summary>想一想（可选）：${escape(lesson.question)}</summary><p>${escape(lesson.answer)}</p></details>
      <aside class="dd-thesis">${escape(lesson.takeaway)}</aside>
      <footer class="dd-src">参考与继续阅读 · 本页为本站原创入门讲解<ul>${lesson.sources.map(([label, url]) => `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a></li>`).join('')}</ul></footer>
      <div class="onboarding-footer"><button class="onboarding-prev" type="button" data-prev ${state.cursor === 0 ? 'disabled' : ''}>← 上一站</button>
        <button class="onboarding-next" type="button" data-next>${last ? '读过，进入完整地图' : state.cursor < state.read ? '下一站 →' : '读过，下一站 →'}</button></div>
      </article>`}<p class="onboarding-status">进度仅保存在当前浏览器。清除网站数据或更换浏览器后，新手路线会重新出现。</p></div>`;
    if (focus) {
      root.querySelector(isMap ? '#onboarding-title' : '#onboarding-lesson-title').focus({preventScroll: true});
      root.scrollTop = 0;
    }
  }
  function open() {
    if (isOpen()) return;
    returnFocus = document.activeElement;
    previousTitle = document.title;
    app.inert = true;
    root.hidden = false;
    view = 'map';
    persist();
    render();
    root.scrollTop = 0;
    root.querySelector('#onboarding-title').focus({preventScroll: true});
    document.documentElement.classList.remove('onboarding-pending');
  }
  function close() {
    root.hidden = true;
    app.inert = false;
    document.documentElement.classList.remove('onboarding-pending');
    document.title = previousTitle;
    resolveReady();
    const target = returnFocus && returnFocus !== document.body && returnFocus.isConnected ? returnFocus : document.getElementById('btn-onboarding');
    target?.focus({preventScroll: true});
    global.__cy?.resize();
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-skip')) {
      if (!model.unlocked(state, count)) state = {...state, skipped: true};
      persist(); close();
    } else if (button.hasAttribute('data-map')) {
      view = 'map'; render(true);
    } else if (button.hasAttribute('data-visit')) {
      const index = Number(button.dataset.visit);
      if (!Number.isInteger(index) || index < 0 || index >= count || index > state.read) return;
      state = model.visit(state, index, count); persist();
      view = 'reader'; render(true);
    } else if (button.hasAttribute('data-next')) {
      const last = state.cursor === count - 1;
      state = model.advance(state, count); persist();
      if (last) close(); else render(true);
    } else if (button.hasAttribute('data-prev')) {
      state = model.visit(state, state.cursor - 1, count); persist(); render(true);
    }
  });
  root.addEventListener('keydown', event => {
    // Keep map shortcuts dormant while revisiting the introduction.
    event.stopPropagation();
    if (event.key !== 'Tab') return;
    const controls = [...root.querySelectorAll('button:not(:disabled), a[href], summary')];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  global.addEventListener('storage', event => {
    if (event.key !== model.key || !event.newValue) return;
    try {
      state = model.merge(state, JSON.parse(event.newValue), count);
      if (isOpen()) render(true);
    } catch (_) {}
  });
  document.getElementById('btn-onboarding').addEventListener('click', open);
  global.AI_ONBOARDING = Object.freeze({ready, open, isOpen});
  if (model.unlocked(state, count)) close(); else open();
})(window);
