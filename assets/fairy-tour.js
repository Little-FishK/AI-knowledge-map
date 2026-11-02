(function (global) {
  'use strict';
  if (global.AI_FAIRY_TOUR) return;
  const assets = new URL('./', document.currentScript.src), site = new URL('../', assets);
  const key = 'ai-knowledge-map.fairy-tour.v1', sessionKey = key + '.session';
  const reading = /\/(?:zh|en)\/concepts\/llm\//.test(location.pathname);
  const get = (store, name) => { try { return JSON.parse(global[store].getItem(name)); } catch (_) { return null; } };
  const put = (store, name, value) => { try { global[store].setItem(name, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const remove = (store, name) => { try { global[store].removeItem(name); } catch (_) {} };
  // The fairy starts in English. Only an explicit language preference overrides
  // it; a Chinese landing URL does not silently change the guide's default.
  const english = () => { try { return global.localStorage.getItem('ai-knowledge-map.locale.v1') !== 'zh-Hans'; } catch (_) { return true; } };
  const displayEnglish = () => document.documentElement.lang === 'en';
  const txt = (zh, en) => english() ? en : zh;
  const visible = el => el?.isConnected && el.getClientRects().length > 0 && !el.closest('[hidden],.hidden');
  const wait = async (test, timeout = 12000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 80)); }
    throw new Error('Walkthrough target unavailable');
  };
  let active = false, step = 0, token = 0, queued = false, hooked = false, unavailable = false;
  let target = null, returnFocus = null, settingsOpened = false, actionPending = false, autoTimer;
  const root = document.createElement('section'); root.id = 'fairy-tour'; root.hidden = true;
  root.setAttribute('aria-label', txt('小精灵网站导览', 'Fairy website walkthrough'));
  root.innerHTML = '<div class="fairy-shade"></div><div class="fairy-shade"></div><div class="fairy-shade"></div><div class="fairy-shade"></div><div class="fairy-focus"></div><div class="fairy-pointer" aria-hidden="true"></div><div class="fairy-sprite" aria-hidden="true"><img alt="" draggable="false" decoding="async"></div><div class="fairy-card" role="region" aria-labelledby="fairy-title"><div class="fairy-step"></div><div aria-live="polite" aria-atomic="true"><h2 id="fairy-title"></h2><p id="fairy-copy"></p></div><div class="fairy-actions"><button type="button" data-fairy-action></button><button type="button" data-fairy-skip></button></div></div>';
  document.body.append(root);
  const card = root.querySelector('.fairy-card'), sprite = root.querySelector('.fairy-sprite');
  const focus = root.querySelector('.fairy-focus'), pointer = root.querySelector('.fairy-pointer');
  const action = root.querySelector('[data-fairy-action]'), skip = root.querySelector('[data-fairy-skip]');
  const selectors = ['#btn-settings', '#settings-language-select', null, '.dd-open[data-dd="llm"]', '#reading-map-back', '[data-mode="software"]', '[data-mode="library"]'];
  function save(index = step) { return put('sessionStorage', sessionKey, {version:1, step:index, at:Date.now(), status:'active'}); }
  function copy() {
    const titles = ['设置按钮','设置里的语言','大语言模型节点','理解原理','返回节点地图','软件教程','专业资料库'];
    const titlesEn = ['Settings','Language settings','Large language model node','Understand the principles','Back to the node map','Software tutorials','Professional library'];
    const bodies = [
      '我是你的引路小精灵。点开设置，语言、深浅主题和阅读偏好都在这里。',
      '这里可以切换中文和 English，选择后立即生效。也可以保持当前语言，点击继续。',
      '每个节点代表一个 AI 概念。点开“大语言模型”，先看基础介绍和它与其他概念的联系。',
      '想进一步弄懂这个概念？点击“理解原理”，进入独立阅读页。',
      '阅读后，点这里回到刚才的节点，继续沿着概念关系探索。',
      '想动手使用 AI？这里按任务组织软件教程，从提示词、编程到内容创作，选择一个方向开始。',
      '想继续找资料？这里收集课程、论文、工具等学习入口。点开资料库，开始自由探索。'
    ];
    const bodiesEn = [
      'I will show you around. Open Settings to find language, light and dark themes, and reading preferences.',
      'Switch between Chinese and English here. Your choice takes effect immediately. You can also keep the current language and continue.',
      'Each node is an AI concept. Select “Large language model” to see its introduction and connections to other concepts.',
      'Want to understand this concept in more depth? Open “Understand the principles” to visit its reading page.',
      'After reading, return to the same node and keep exploring its connections.',
      'Ready to try AI? Tutorials are organized by task, including prompting, coding, and content creation. Choose a direction to begin.',
      'Looking for more resources? Find courses, papers, tools, and other learning sources here. Open the library to explore freely.'
    ];
    const labels = ['打开设置','继续','打开这个节点','打开理解原理','返回地图','打开软件教程','打开专业资料库'];
    const labelsEn = ['Open Settings','Continue','Open this node','Open reading page','Return to map','Open tutorials','Open library'];
    root.lang = english() ? 'en' : 'zh-Hans';
    root.setAttribute('aria-label', txt('小精灵网站导览', 'Fairy website walkthrough'));
    root.dataset.step = String(step + 1);
    root.dataset.reduceMotion = String(matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.readerMotion === 'reduce');
    root.querySelector('.fairy-step').textContent = txt(`认识网站 · ${step+1} / 7`, `Website walkthrough · ${step+1} / 7`);
    root.querySelector('h2').textContent = english() ? titlesEn[step] : titles[step];
    root.querySelector('#fairy-copy').textContent = unavailable ? txt('暂时没有找到这一步的入口。可以重试，或跳过导览后继续使用网站。','This control is not ready. Retry, or skip the walkthrough to keep using the site.') : english() ? bodiesEn[step] : bodies[step];
    action.textContent = unavailable ? txt('重试','Retry') : english() ? labelsEn[step] : labels[step];
    skip.textContent = txt('跳过导览','Skip tour');
    action.disabled = actionPending;
  }
  function nodeRect() {
    const cy = global.__cy, node = cy?.getElementById('llm');
    if (!node?.length || !visible(cy.container())) return null;
    const r = cy.container().getBoundingClientRect(), p = node.renderedPosition();
    const size = Math.max(64, node.renderedWidth() + 22);
    return {left:r.left+p.x-size/2, top:r.top+p.y-size/2, width:size, height:size+24};
  }
  function targetRect() {
    if (step === 2) return nodeRect();
    target = document.querySelector(selectors[step]);
    if (!visible(target)) return null;
    const r = target.getBoundingClientRect();
    return {left:r.left-6, top:r.top-6, width:r.width+12, height:r.height+12};
  }
  function layout() {
    if (!active || root.hidden) return;
    const W = innerWidth, H = innerHeight, raw = targetRect();
    if (!raw && !unavailable) return;
    const r = raw || {left:W/2, top:Math.min(H/3,160), width:0, height:0};
    const x = Math.max(0,Math.min(W,r.left)), y = Math.max(0,Math.min(H,r.top));
    const right = Math.max(x,Math.min(W,r.left+r.width)), bottom = Math.max(y,Math.min(H,r.top+r.height));
    const boxes = [[0,0,W,y],[0,y,x,bottom-y],[right,y,W-right,bottom-y],[0,bottom,W,H-bottom]];
    root.querySelectorAll('.fairy-shade').forEach((el,i)=>{const [l,t,w,h]=boxes[i];Object.assign(el.style,{left:l+'px',top:t+'px',width:w+'px',height:h+'px'});});
    Object.assign(focus.style,{left:x+'px',top:y+'px',width:(right-x)+'px',height:(bottom-y)+'px'});
    const cw = card.offsetWidth, ch = card.offsetHeight, gap = 22;
    let cx = Math.max(12,Math.min(W-cw-12,(x+right-cw)/2));
    let cy = bottom + gap;
    if (cy+ch > H-12) cy = y-ch-gap;
    if (cy < 12 && W-cw-right > gap) { cx=right+gap; cy=Math.max(12,Math.min(H-ch-12,y)); }
    else if (cy < 12 && x-cw > gap) { cx=x-cw-gap; cy=Math.max(12,Math.min(H-ch-12,y)); }
    cy = Math.max(12,Math.min(H-ch-12,cy));
    Object.assign(card.style,{left:cx+'px',top:cy+'px'});
    const above = cy+ch <= y, sw=sprite.offsetWidth, sh=sprite.offsetHeight;
    const candidates=[[cx+cw-sw,cy-sh-8],[cx,cy-sh-8],[cx+cw-sw,cy+ch+8],[cx,cy+ch+8],[cx+cw+8,cy],[cx-sw-8,cy]];
    const clear=([l,t])=>l>=2&&t>=2&&l+sw<=W-2&&t+sh<=H-2&&!(l<right&&l+sw>x&&t<bottom&&t+sh>y);
    const [sx,sy]=candidates.find(clear)||[Math.max(0,Math.min(W-sw,cx+cw-sw)),Math.max(0,cy-sh-8)];
    sprite.style.transform=`translate3d(${sx}px,${sy}px,0)`;
    Object.assign(pointer.style,{left:Math.max(6,Math.min(W-28,(x+right)/2-11))+'px',top:(above?y-24:bottom+1)+'px',rotate:above?'0deg':'180deg'});
  }
  function queueLayout() { if (!active || queued) return; queued=true; requestAnimationFrame(()=>{queued=false;layout();}); }
  function focusAction() { if (active) action.focus({preventScroll:true}); }
  function navigateMap(index) {
    save(index);
    const url = new URL(site); url.searchParams.set('lang',displayEnglish()?'en':'zh-Hans'); url.searchParams.set('node','llm'); url.searchParams.set('walkthrough',String(index+1));
    location.assign(url);
  }
  async function enter(index) {
    if (!active) return;
    if (reading && index !== 4) return navigateMap(index);
    step=index; const own=++token; unavailable=false; actionPending=false; save();
    root.hidden=true;
    try {
      if (index === 0) global.AI_SETTINGS?.close();
      if (index === 1) { settingsOpened=true; global.AI_SETTINGS?.open(); }
      if (index === 2 || index === 3) {
        global.AI_SETTINGS?.close();
        if (global.APP_ROUTER?.parseLocation().name !== 'map') { global.APP_ROUTER.navigate({name:'map'}); await wait(()=>visible(document.getElementById('cy'))); }
        const cy=global.__cy, node=cy.getElementById('llm');
        if (index===2) {
          const r=nodeRect();
          if (!r || r.left<8 || r.top<100 || r.left+r.width>innerWidth-8 || r.top+r.height>innerHeight-16) cy.center(node);
        } else if (!node.hasClass('sel') || !visible(document.querySelector(selectors[3]))) node.emit('tap');
      }
      if (index===5 || index===6) global.AI_SETTINGS?.close();
      await wait(()=>index===2 ? !!nodeRect() : visible(document.querySelector(selectors[index])));
      if (!active || own!==token) return;
      if (index!==2) document.querySelector(selectors[index]).scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    } catch (_) { if (!active || own!==token) return; unavailable=true; }
    if (!active || own!==token) return;
    root.dataset.unavailable=String(unavailable); copy(); root.hidden=false;
    sprite.classList.remove('travelling'); void sprite.offsetWidth; sprite.classList.add('travelling');
    layout(); focusAction();
  }
  function finish(status='dismissed', persist=true) {
    if (!active) return;
    active=false; ++token; root.hidden=true; target=null; clearTimeout(autoTimer);
    if (persist) put('localStorage',key,{version:1,status,at:Date.now()});
    remove('sessionStorage',sessionKey);
    if (settingsOpened) global.AI_SETTINGS?.close();
    const back=visible(returnFocus)&&!returnFocus.closest('[inert]') ? returnFocus : document.getElementById('btn-settings');
    back?.focus({preventScroll:true});
  }
  async function start(index=0) {
    clearTimeout(autoTimer);
    if (global.AI_ONBOARDING?.isOpen()) document.querySelector('#onboarding [data-skip]')?.click();
    if (reading && index!==4) return navigateMap(index);
    returnFocus=document.activeElement; active=true;
    const img=sprite.querySelector('img'); if (!img.src) img.src=new URL('guide-sprite-v1.png',assets);
    if (!reading && !hooked && global.__cy) {
      hooked=true;
      global.__cy.on('pan zoom resize',queueLayout);
      global.__cy.on('tap','node',event=>{if(active&&step===2&&event.target.id()==='llm')setTimeout(()=>{if(active&&step===2)enter(3);},150);});
    }
    if (!reading && ![0,4].includes(index) && !visible(document.getElementById('cy'))) {
      global.APP_ROUTER.navigate({name:'map',id:'llm'}); await wait(()=>visible(document.getElementById('cy')));
    }
    enter(index);
  }
  function openReader() {
    const saved=save(4), url=new URL((displayEnglish()?'en':'zh')+'/concepts/llm/',site);
    if (!saved) url.searchParams.set('walkthrough','5');
    location.assign(url);
  }
  async function doAction() {
    if (!active || actionPending) return;
    if (unavailable) return enter(step);
    if (step===0) document.getElementById('btn-settings').click();
    else if (step===1) enter(2);
    else if (step===2) global.__cy.getElementById('llm').emit('tap');
    else if (step===3) document.querySelector(selectors[3]).click();
    else if (step===4) document.querySelector(selectors[4]).click();
    else document.querySelector(selectors[step]).click();
  }
  action.addEventListener('click',()=>doAction().catch(()=>{unavailable=true;copy();queueLayout();}));
  skip.addEventListener('click',()=>finish());
  global.addEventListener('ai-settings-visibility',event=>{
    if (!active) return;
    if (step===0&&event.detail.open) enter(1);
    else if (step===1&&!event.detail.open) { if (!root.hidden) enter(0); }
  });
  // Runs before the publisher's document-level reader navigation handler.
  global.addEventListener('click',event=>{
    if (!active || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hit=event.target.closest?.('button,a'); if (!hit) return;
    if (step===3&&hit.matches(selectors[3])) { event.preventDefault();event.stopImmediatePropagation();openReader(); }
    else if (step===4&&hit.matches(selectors[4])) {
      event.preventDefault();event.stopImmediatePropagation();navigateMap(5);
    } else if ((step===5&&hit.matches(selectors[5]))||(step===6&&hit.matches(selectors[6]))) {
      if (actionPending) return;
      const index=step, own=token; actionPending=true;copy();
      wait(()=>visible(document.querySelector(index===5?'#software-view .course-card':'.lib-grid'))).then(()=>{
        if(!active||step!==index||own!==token)return;actionPending=false;if(index===5)enter(6);else finish('completed');
      }).catch(()=>{if(active&&step===index&&own===token){actionPending=false;unavailable=true;copy();queueLayout();}});
    }
  },true);
  document.addEventListener('keydown',event=>{
    if (!active || root.hidden) return;
    if (event.key==='Escape') { event.preventDefault();event.stopImmediatePropagation();finish();return; }
    if (event.key!=='Tab') return;
    const controls=[action,skip];
    const el=step===2?null:document.querySelector(selectors[step]);
    if (visible(el)&&el.matches('button,a,select,input')&&!el.disabled)controls.unshift(el);
    const index=controls.indexOf(document.activeElement),next=event.shiftKey?(index<=0?controls.length-1:index-1):(index+1)%controls.length;
    event.preventDefault();event.stopImmediatePropagation();controls[next].focus({preventScroll:true});
  },true);
  global.addEventListener('resize',queueLayout);global.addEventListener('scroll',queueLayout,true);
  global.visualViewport?.addEventListener('resize',queueLayout);
  global.addEventListener('ai-reading-preferences',()=>{if(active){copy();queueLayout();}});
  global.addEventListener('storage',event=>{if(active&&event.key===key&&['completed','dismissed'].includes(get('localStorage',key)?.status))finish('dismissed',false);});
  new MutationObserver(()=>{if(active)queueLayout();}).observe(document.body,{childList:true,subtree:true});
  new MutationObserver(()=>{if(active){copy();queueLayout();}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-reader-motion']});
  global.AI_FAIRY_TOUR=Object.freeze({start,stop:()=>finish(),isActive:()=>active,getStep:()=>active?step+1:null});
  const session=get('sessionStorage',sessionKey), url=new URL(location.href), forced=Number(url.searchParams.get('walkthrough'));
  if (forced>=1&&forced<=7&&Number.isInteger(forced)) {
    url.searchParams.delete('walkthrough');history.replaceState(null,'',url);start(reading?4:forced-1);
  } else if (session?.version===1&&session.status==='active'&&Number.isInteger(session.step)&&session.step>=0&&session.step<7&&Date.now()-session.at<3600000) {
    start(reading?4:session.step===4?5:session.step);
  } else {
    remove('sessionStorage',sessionKey);
    const route=global.APP_ROUTER?.parseLocation();
    if (!reading&&route?.name==='map'&&!route.id&&!get('localStorage',key)?.status&&!global.AI_ONBOARDING?.isOpen()) autoTimer=setTimeout(()=>{
      if(!active&&!global.AI_ONBOARDING?.isOpen()&&document.getElementById('settings-overlay')?.classList.contains('hidden'))start();
    },900);
  }
})(window);
