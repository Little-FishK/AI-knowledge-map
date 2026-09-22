(function (global) {
  'use strict';
  let lessons = global.AI_ONBOARDING_LESSONS;
  const model = global.AI_ONBOARDING_MODEL;
  const app = document.getElementById('app');
  const count = lessons.length;
  const nodeArtwork = ['foundations', 'building', 'coding', 'generation', 'safety', 'frontier'];
  let storage = null, storageFailed = false, returnFocus = null, previousTitle = document.title;
  let state = model.normalize(null, count);
  let view = 'map';
  let stopNodeMotion = () => {};
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
  let resolvedLocale = false;
  const english = () => {
    if (resolvedLocale) return document.documentElement.lang === 'en';
    const requested = new URLSearchParams(global.location.search).get('lang');
    if (requested === 'en' || requested === 'zh-Hans') return requested === 'en';
    try { return storage?.getItem('ai-knowledge-map.locale.v1') === 'en' || document.documentElement.lang === 'en'; }
    catch (_) { return document.documentElement.lang === 'en'; }
  };
  const copy = (zh, en) => english() ? en : zh;
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
    return `<figure class="dd-fig"><svg viewBox="0 0 360 ${height}" role="img" aria-labelledby="onboarding-fig-title onboarding-fig-desc"><title id="onboarding-fig-title">${escape(lesson.short)}${copy("：图解", ": diagram")}</title><desc id="onboarding-fig-desc">${escape(cards.map(row => row.join(copy('：', ': '))).join(copy('。', '. ')))}</desc>${diagram}</svg><figcaption>${copy("图1", "Figure 1")} · ${escape(caption)}</figcaption></figure>`;
  }
  function startNodeMotion() {
    const preference = global.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = [];
    root.querySelectorAll('.onboarding-dot').forEach(dot => {
      const spin = dot.querySelector('.onboarding-ring-spin');
      const animation = spin.animate([{transform:'rotate(0deg)'}, {transform:'rotate(360deg)'}], {duration:48000,iterations:Infinity});
      const button = dot.closest('button');
      const emphasize = value => {
        dot.classList.toggle('is-hovered', value);
        animation.updatePlaybackRate(value ? 16 : 1);
      };
      dot.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') emphasize(true); });
      dot.addEventListener('pointerleave', () => emphasize(false));
      button.addEventListener('focus', () => emphasize(true));
      button.addEventListener('blur', () => emphasize(false));
      animations.push(animation);
    });
    const update = () => {
      const paused = preference.matches || document.hidden || root.hidden;
      root.classList.toggle('motion-paused', paused);
      animations.forEach(animation => paused ? animation.pause() : animation.play());
    };
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    stopNodeMotion = () => {
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }
  function render(focus = false, unlockedIndex = null) {
    if (global.matchMedia('(prefers-reduced-motion: reduce)').matches) unlockedIndex = null;
    stopNodeMotion();
    lessons = english() ? global.AI_ONBOARDING_LESSONS_EN : global.AI_ONBOARDING_LESSONS;
    root.lang = english() ? 'en' : 'zh-Hans';
    const lesson = lessons[state.cursor];
    const isMap = view === 'map';
    document.title = isMap
      ? (english() ? 'Learn AI from Scratch: Free Guide for Beginners | AI Knowledge Map' : '零基础免费学 AI：概念与入门学习指南 | AI 知识地图')
      : `${lesson.title} | ${copy('新手导览 · AI 知识地图', 'Beginner guide · AI Knowledge Map')}`;
    root.removeAttribute(isMap ? 'aria-labelledby' : 'aria-label');
    root.setAttribute(isMap ? 'aria-label' : 'aria-labelledby', isMap ? copy("六站新手地图", "Six-stop beginner map") : 'onboarding-lesson-title');
    root.innerHTML = `<div class="onboarding-shell${isMap ? ' is-map' : ''}">
      <header class="onboarding-top"><div class="onboarding-brand"><span class="onboarding-brand-symbol" aria-hidden="true">✳</span><div>${copy("AI 知识地图", "AI Knowledge Map")}<small>THE KNOWLEDGE ATLAS</small></div></div>
        <button class="onboarding-skip btn" type="button" data-skip>${english() ? 'Back to map' : '返回地图'}</button><button class="btn icon-btn" type="button" data-settings aria-label="${copy("设置", "Settings")}" aria-haspopup="dialog" aria-controls="settings-dialog">${document.getElementById('btn-settings').innerHTML}</button></header>
      ${isMap ? '' : `<nav class="onboarding-reader-nav" aria-label="${copy("新手导览", "Beginner guide")}"><button class="onboarding-prev" type="button" data-map>${copy("← 返回新手地图", "\u2190 Back to beginner map")}</button></nav>`}
      ${isMap ? '' : `<p class="onboarding-storage" ${storageFailed ? '' : 'hidden'}>${copy("当前浏览器无法保存进度，仍可继续阅读或跳过；刷新后可能需要重新开始。", "This browser cannot save your progress. You can still read or skip, but may need to start again after refreshing.")}</p>`}
      ${isMap ? `<div class="onboarding-hero">
        <div class="onboarding-hero-copy">
          <h1 id="onboarding-title">${copy("看懂 AI，<br>从<span>这里</span>开始。", "Understand AI.<br>Start <span>here</span>.")}</h1>
          <p class="onboarding-lead">${copy("不必先懂算法，也不用追赶每一个新名词。<br>从六个简单的问题出发，建立属于你的知识地图。", "No algorithms to master. No buzzwords to chase.<br>Six simple questions to build your own knowledge map.")}</p>
          <div class="onboarding-hero-actions"><button class="onboarding-launch" type="button" data-start>${state.read >= count ? copy("重温第一站", "Revisit stop one") : state.read ? copy("继续我的探索", "Continue exploring") : copy("开启第一站", "Start the journey")}<span aria-hidden="true">↗</span></button>${state.read ? `<span class="onboarding-journey-note">${copy(`已完成 ${state.read} / ${count} 站`, `${state.read} / ${count} stops completed`)}</span>` : ''}</div>
          <div class="onboarding-metrics"><span><strong>${String(count).padStart(2, '0')}</strong> ${copy("入门章节", "intro lessons")}</span><span><strong>${global.GRAPH?.nodes?.length || 130}</strong> ${copy("概念节点", "concepts")}</span><span><strong>${String(global.GRAPH?.recommendedLearningPath?.length || 9).padStart(2, '0')}</strong> ${copy("官方推荐阶段", "learning stages")}</span></div>
        </div>
        <div class="onboarding-universe" aria-hidden="true">
          <div class="atlas-cross atlas-cross-one">+</div><div class="atlas-cross atlas-cross-two">+</div>
          <div class="atlas-orbit atlas-orbit-outer"></div><div class="atlas-orbit atlas-orbit-inner"></div>
          <div class="atlas-sphere"><svg viewBox="0 0 300 300" fill="none"><defs><radialGradient id="atlas-glow"><stop stop-color="#96bfff" stop-opacity=".26"/><stop offset="1" stop-color="#8ecaff" stop-opacity=".02"/></radialGradient></defs><circle cx="150" cy="150" r="139" fill="url(#atlas-glow)" stroke="#9dbed2" stroke-opacity=".25"/><g stroke="#acd9e9" stroke-opacity=".22"><ellipse cx="150" cy="150" rx="100" ry="139"/><ellipse cx="150" cy="150" rx="50" ry="139"/><ellipse cx="150" cy="150" rx="139" ry="44"/><ellipse cx="150" cy="150" rx="139" ry="94"/><path d="M11 150h278M150 11v278"/></g></svg><div class="atlas-core"><span>AI</span><small>CONNECT THE DOTS</small></div></div>
          <div class="atlas-satellite atlas-satellite-one"><span>✦</span><div>${copy("从好奇出发", "Follow your curiosity")}<small>START WITH WHY</small></div></div>
          <div class="atlas-satellite atlas-satellite-two"><span>⌘</span><div>${copy("让知识连接", "Connect ideas")}<small>BUILD CONNECTIONS</small></div></div>
          <div class="atlas-coordinate">EXPLORE / UNDERSTAND / CREATE</div>
        </div>
      </div>
      <div class="onboarding-route-heading"><div><span class="onboarding-kicker">YOUR LEARNING JOURNEY</span><h2>${copy("六站，走进 AI 的世界", "Six stops into the world of AI")}</h2></div></div>
      <ol class="onboarding-route" aria-label="${copy("六站新手地图", "Six-stop beginner map")}">${lessons.map((item, index) => {
        const read = index < state.read;
        const locked = index > state.read;
        const unlocking = index === unlockedIndex;
        const lock = locked || unlocking ? `<span class="onboarding-lock${unlocking ? ' is-unlocking' : ''}" aria-hidden="true"><svg viewBox="0 0 24 26" fill="none"><path class="onboarding-lock-shackle" d="M7 12V8a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="4" y="11" width="16" height="12" rx="3" fill="currentColor"/><path d="M12 15v4" stroke="#182638" stroke-width="2" stroke-linecap="round"/></svg></span>` : ''; 
        const src = `assets/node-art/${nodeArtwork[index]}.png?v=2`;
        return `<li class="${read ? 'is-read' : locked ? 'is-locked' : 'is-current'}"><button type="button" ${locked ? 'disabled' : `data-visit="${index}"`} ${!read && !locked ? 'aria-current="step"' : ''}><span class="onboarding-dot" aria-hidden="true"><img class="onboarding-face" src="${src}" alt=""><span class="onboarding-hover-band"></span><span class="onboarding-ring"><img class="onboarding-ring-spin" src="${src}" alt=""></span>${lock}</span><span class="onboarding-node-copy"><span class="onboarding-node-status">0${index + 1} / ${read ? copy("已完成", "COMPLETED") : locked ? copy("待解锁", "LOCKED") : copy("现在出发", "START HERE")}</span><span class="onboarding-node-name">${escape(item.short)}</span><span class="onboarding-node-description">${escape(item.title)}</span></span><span class="onboarding-card-arrow" aria-hidden="true">${read ? '✓' : locked ? '·' : '↗'}</span></button></li>`;
      }).join('')}</ol><footer class="onboarding-map-footer"><span>AI KNOWLEDGE MAP <b>✳</b></span></footer>` : `<article class="onboarding-reader" aria-labelledby="onboarding-lesson-title"><div class="dd-hero">
        <div class="dd-eyebrow">${copy(`第 ${state.cursor + 1} 站 / 共 ${count} 站`, `Stop ${state.cursor + 1} / ${count}`)}</div><h2 id="onboarding-lesson-title" class="dd-h1" tabindex="-1">${escape(lesson.title)}</h2>
        <p class="dd-sub">${escape(lesson.subtitle)}</p><div class="dd-thesis"><span class="dd-thesis-l">${copy("先记住", "Keep in mind")}</span>${escape(lesson.thesis)}</div></div>
      ${lesson.sections.map(([title, html], index) => `<section class="dd-sec"><h2><span class="dd-n" aria-hidden="true">${index + 1}</span>${escape(title)}</h2>${html}${index === 1 && lesson.figure ? figure(lesson) : ''}</section>`).join('')}
      <details><summary>${copy("想一想（可选）：", "Think about it (optional): ")}${escape(lesson.question)}</summary><p>${escape(lesson.answer)}</p></details>
      <aside class="dd-thesis">${escape(lesson.takeaway)}</aside>
      <footer class="dd-src">${copy("参考与继续阅读 · 本页为本站原创入门讲解", "References and further reading \u00b7 An original introduction by AI Knowledge Map")}<ul>${lesson.sources.map(([label, url]) => `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a></li>`).join('')}</ul></footer>
      <div class="onboarding-footer"><button class="onboarding-prev" type="button" data-prev ${state.cursor === 0 ? 'disabled' : ''}>${copy("← 上一站", "\u2190 Previous stop")}</button>
        <button class="onboarding-next" type="button" data-read>${copy("已读", "Mark as read")}</button></div>
      </article>`}${isMap ? '' : `<p class="onboarding-status">${copy("进度仅保存在当前浏览器。清除网站数据或更换浏览器后，新手路线会重新出现。", "Progress is saved only in this browser. Clearing site data or using another browser will show the beginner route again.")}</p>`}</div>`;
    if (isMap) startNodeMotion();
    if (focus) {
      const target = root.querySelector(isMap ? (unlockedIndex === null ? '[data-skip]' : `[data-visit="${unlockedIndex}"]`) : '#onboarding-lesson-title');
      target.focus({preventScroll: true});
      if (isMap && unlockedIndex !== null) target.scrollIntoView({block: 'nearest', behavior: 'auto'});
      else root.scrollTop = 0;
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
    root.querySelector('[data-skip]').focus({preventScroll: true});
    document.documentElement.classList.remove('onboarding-pending');
  }
  function close() {
    stopNodeMotion();
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
    if (button.hasAttribute('data-settings')) {
      global.AI_SETTINGS?.open();
    } else if (button.hasAttribute('data-skip')) {
      if (!model.unlocked(state, count)) state = {...state, skipped: true};
      persist(); close();
    } else if (button.hasAttribute('data-map')) {
      view = 'map'; render(true);
    } else if (button.hasAttribute('data-visit') || button.hasAttribute('data-start')) {
      const index = button.hasAttribute('data-start') ? (state.read >= count ? 0 : state.read) : Number(button.dataset.visit);
      if (!Number.isInteger(index) || index < 0 || index >= count || index > state.read) return;
      state = model.visit(state, index, count); persist();
      view = 'reader'; render(true);
    } else if (button.hasAttribute('data-read')) {
      const previouslyRead = state.read;
      state = model.advance(state, count); persist();
      const newlyUnlocked = state.read > previouslyRead && state.read < count ? state.read : null;
      view = 'map'; render(true, newlyUnlocked);
    } else if (button.hasAttribute('data-prev')) {
      state = model.visit(state, state.cursor - 1, count); persist(); render(true);
    }
  });
  root.addEventListener('animationend', event => {
    if (event.animationName === 'onboarding-unlock' && event.target.matches('.onboarding-lock.is-unlocking')) event.target.remove();
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
  // Locale initialization and settings changes both update the document language.
  new MutationObserver(() => {
    resolvedLocale = true;
    if (isOpen()) {
      const scroll = root.scrollTop;
      render();
      root.scrollTop = scroll;
    }
  }).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  document.getElementById('btn-onboarding').addEventListener('click', open);
  global.AI_ONBOARDING = Object.freeze({ready, open, isOpen});
  if (new URLSearchParams(location.search).get('onboarding') === '1') {
    const url = new URL(location.href); url.searchParams.delete('onboarding');
    history.replaceState(null, '', url);
    open();
  } else if (model.unlocked(state, count)) close(); else open();
})(window);
