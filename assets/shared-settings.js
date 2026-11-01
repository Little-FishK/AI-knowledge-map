(function (global) {
"use strict";
global.createMapSettings = function ({language, content, manifest: I18N_MANIFEST}) {
  const settingsButton = document.getElementById("btn-settings");
  const settingsOverlay = document.getElementById("settings-overlay");
  const settingsDialog = document.getElementById("settings-dialog");
  const settingsClose = document.getElementById("settings-close");
  const settingsBackdrop = document.getElementById("settings-backdrop");
  const languageSelect = document.getElementById("settings-language-select");
  const languageStatus = document.getElementById("settings-language-status");
  const topbar = document.getElementById("topbar");
  const main = document.getElementById("main") || document.getElementById("main-content");
  let settingsReturnFocus = null;
  document.body.append(settingsOverlay);
  const help = document.createElement('section'); help.className='settings-group site-help';
  help.innerHTML='<h3 data-help-title></h3><details><summary data-help-summary></summary><div data-help-body></div></details><p><a data-help-search></a> · <a data-help-feedback target="_blank" rel="noopener noreferrer"></a></p>';
  settingsDialog.querySelector('.settings-body').append(help);
  const article=document.getElementById('dd-article')||document.querySelector('.tutorial-content');
  let feedback;
  if(article){feedback=document.createElement('p');feedback.className='reading-feedback';feedback.innerHTML='<a target="_blank" rel="noopener noreferrer"></a>';article.after(feedback);}
  function renderHelp() {
    const en=language.getLocale()==='en';
    help.querySelector('[data-help-title]').textContent=en?'Help and corrections':'使用帮助与纠错';
    help.querySelector('[data-help-summary]').textContent=en?'Map controls, progress and connection issues':'地图操作、学习记录与连接问题';
    const body=help.querySelector('[data-help-body]');body.replaceChildren();
    const tips=en?[
      'Map: drag blank space to pan; use + / − or a pinch gesture to zoom. Reset view returns to the overview. The concept list opens domain and relation filters.',
      'Search: map suggestions cover concept titles, aliases and summaries. “Search all pages and tutorial text” opens full-text search. In software and library modes, press Enter in the top search field to search the site; the library also has its own resource search.',
      'Learning: the recommended path suggests an order. “Read”, “Understood” and “Practiced” are separate marks. The learned count includes Understood and retained legacy learned marks.',
      'Guest marks stay in this browser. Account settings can export them or restore missing marks from a guest backup. Clearing browser data can remove local marks. Signing in is required for cloud sync; failed changes stay queued locally.',
      'Code or sync requests: check the email address and latest email, including spam. A timeout does not prove that no email was sent. Check for an email before resending. On a sync error, keep local data and use Retry when the connection returns.',
      'If the map will not load, reload once or use the text search below. If only one resource fails, check its original site. Report recurring failures with the URL, device and approximate time; do not include passwords or verification codes. Maintenance recovery times are only known when announced by the operator.'
    ]:[
      '地图：拖动空白处平移，用 + / − 或双指缩放。“重置视图”回到总览；“概念列表”中可按领域和关系筛选。',
      '搜索：地图候选搜索概念标题、别名和简介；“搜索全站页面与教程正文”进入全文搜索。软件与资料库模式可在顶部搜索后按回车；资料库还保留独立的资源检索。',
      '学习：推荐路线提供学习顺序。“读过”“自认为理解”“完成自测”分别记录；已学数统计“自认为理解”和保留的旧版已学标记。',
      '访客记录保存在当前浏览器，可在账号设置导出，或从访客备份补充缺失标记。清除浏览器数据可能丢失本机记录；云同步需要登录，失败的修改会保留在本机队列。',
      '验证码或同步失败：核对邮箱并检查最新邮件及垃圾箱。超时不代表邮件一定未发送，请先查收再决定重发。同步失败时保留本机数据，网络恢复后点击“重试”。',
      '地图加载失败时，可刷新一次或使用下方文字搜索；单个外链失败时检查原网站。反复失败可反馈网址、设备和大致时间，不要附密码或验证码。维护恢复时间以运营者实际公告为准。'
    ];
    tips.forEach(text=>{const p=document.createElement('p');p.textContent=text;body.append(p);});
    const existingSearch=document.querySelector('[data-shell-search],a.release-directory-link[href*="/search/"]');
    const search=new URL(existingSearch?.getAttribute('href')||'/search/',document.baseURI);search.searchParams.set('lang',language.getLocale());
    const searchLink=help.querySelector('[data-help-search]');searchLink.href=search.href;searchLink.textContent=en?'Search all pages':'全站文字搜索';
    for(const link of [help.querySelector('[data-help-feedback]'),feedback?.querySelector('a')].filter(Boolean)){link.textContent=en?'Report an issue with this page':'反馈本页问题';link.onclick=()=>{
      const page=new URL(location.pathname,location.origin);const current=new URL(location.href);for(const key of ['lang','node','concept'])if(current.searchParams.has(key))page.searchParams.set(key,current.searchParams.get(key));
      if(/^#\/(?:concept|map|software|tutorial|library)\//.test(location.hash))page.hash=location.hash;
      const issue=new URL('https://github.com/Little-FishK/AI-knowledge-map/issues/new');issue.searchParams.set('title',(en?'Page feedback: ':'页面反馈：')+(article?.querySelector('h1')?.textContent||document.title).slice(0,120));issue.searchParams.set('body',(en?'Page: ':'页面：')+page.href+'\n\n'+(en?'What happened / expected result:\n\nDevice and browser:\n\nDo not include account credentials or verification codes.':'遇到的问题 / 预期结果：\n\n设备与浏览器：\n\n请勿填写账号密码或验证码。'));link.href=issue.href;
    };link.onclick();link.onpointerdown=link.onclick;link.onfocus=link.onclick;}
  }
  renderHelp();

  function renderLanguageSettings() {
    language.localize(settingsButton);
    language.localize(settingsOverlay);
    const currentLocale = language.getLocale();
    const unavailableSuffix = language.t("settings.language.unavailableSuffix");
    const fragment = document.createDocumentFragment();
    language.getSupportedLocales().forEach(locale => {
      const meta = I18N_MANIFEST.locales[locale];
      const option = document.createElement("option");
      option.value = locale;
      option.disabled = meta.selectable === false;
      option.textContent = meta.selectable === false
        ? `${meta.nativeLabel} — ${unavailableSuffix}`
        : meta.nativeLabel;
      fragment.appendChild(option);
    });
    languageSelect.replaceChildren(fragment);
    languageSelect.value = currentLocale;
  }

  languageSelect.addEventListener("change", async () => {
    const requested = languageSelect.value;
    if (!requested || requested === language.getLocale()) return;
    languageSelect.disabled = true;
    languageStatus.textContent = language.t("settings.language.changing");
    try {
      await content.ensureLocale(requested);
      await language.setLocale(requested);
      const url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", language.getLocale());
        window.history.replaceState(null, "", url.href);
      }
      languageStatus.textContent = "";
    } catch (error) {
      languageSelect.value = language.getLocale();
      languageStatus.textContent = language.t("settings.language.error");
      console.error(error);
    } finally {
      languageSelect.disabled = false;
    }
  });

  function openSettings() {
    if (!settingsOverlay.classList.contains("hidden")) return;
    settingsReturnFocus = document.activeElement;
    settingsOverlay.classList.remove("hidden");
    settingsOverlay.setAttribute("aria-hidden", "false");
    settingsButton.setAttribute("aria-expanded", "true");
    global.dispatchEvent(new CustomEvent('ai-settings-visibility', {detail:{open:true}}));
    topbar.inert = true;
    main.inert = true;
    if (document.getElementById("onboarding")) document.getElementById("onboarding").inert = true;
    settingsClose.focus();
  }

  function closeSettings() {
    if (settingsOverlay.classList.contains("hidden")) return;
    settingsOverlay.classList.add("hidden");
    settingsOverlay.setAttribute("aria-hidden", "true");
    settingsButton.setAttribute("aria-expanded", "false");
    global.dispatchEvent(new CustomEvent('ai-settings-visibility', {detail:{open:false}}));
    topbar.inert = false;
    main.inert = false;
    if (document.getElementById("onboarding")) document.getElementById("onboarding").inert = false;
    const focusTarget = settingsReturnFocus?.isConnected ? settingsReturnFocus
      : global.AI_ONBOARDING?.isOpen() ? document.querySelector('#onboarding [data-settings]') : settingsButton;
    focusTarget?.focus();
    settingsReturnFocus = null;
  }

  settingsButton.addEventListener("click", openSettings);
  settingsClose.addEventListener("click", closeSettings);
  settingsBackdrop.addEventListener("click", closeSettings);
  settingsOverlay.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSettings();
      return;
    }
    if (event.key === "Tab") {
      const focusable = settingsDialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.AI_SETTINGS = {open: openSettings, close: closeSettings};
  renderLanguageSettings();
  language.subscribe(() => { language.localize(document); renderLanguageSettings(); renderHelp(); });
return {renderLanguageSettings};
};
})(window);
