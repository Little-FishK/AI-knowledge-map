/* AI 知识地图 — 展示层
 * 只读 window.GRAPH 渲染，不写数据。入库是离线步骤（SPEC §2.3）。
 */
(async function () {
  "use strict";

  // Keep the existing map and deep links dormant until the local introduction ends.


  const G = window.GRAPH;
  const ROUTER = window.APP_ROUTER;
  const APP = window.AIMap;
  const I18N_MANIFEST = window.I18N_MANIFEST;
  if (!ROUTER) throw new Error("URL 路由模块未加载");
  if (!APP || !APP.shared || !APP.createDeepDiveLoader || !APP.createGraphView
      || !APP.createLearningView || !APP.createDeepDiveView
      || !APP.i18n || !APP.contentI18n) {
    throw new Error("前端模块未完整加载");
  }
  if (!I18N_MANIFEST) throw new Error("语言清单未加载");
  window.AI_LOCALES = window.AI_LOCALES || {};
  let initialLanguageFallback = false;
  const language = APP.i18n.createI18n({
    manifest: I18N_MANIFEST,
    registry: window.AI_LOCALES,
    onInitialFallback: () => { initialLanguageFallback = true; },
  });
  await language.initialize({
    urlLocale: new URLSearchParams(window.location.search).get("lang"),
    navigatorLanguages: navigator.languages || [navigator.language],
  });
  const t = language.t;
  language.localize(document);
  window.AI_CONTENT_LOCALES = window.AI_CONTENT_LOCALES || {};
  const content = APP.contentI18n.createContentI18n({
    manifest: I18N_MANIFEST,
    registry: window.AI_CONTENT_LOCALES,
    getLocale: language.getLocale,
  });
  try {
    await content.ensureLocale(language.getLocale());
  } catch (error) {
    console.warn("内容语言资源加载失败，使用源语言", error);
    await language.setLocale(I18N_MANIFEST.sourceLocale, { persist: false });
    initialLanguageFallback = true;
  }
  const {renderLanguageSettings} = window.createMapSettings({language, content, manifest: I18N_MANIFEST});
  if (initialLanguageFallback) {
    document.getElementById("settings-language-status").textContent =
      "语言资源暂时无法加载，已使用简体中文。可在此重新选择语言。";
  }
  if (window.AI_ONBOARDING) await window.AI_ONBOARDING.ready;

  const DOMAINS = G.domains;
  const ETYPES = G.edgeTypes;

  const byId = {};
  G.nodes.forEach(n => { byId[n.id] = n; });
  const localizedGraphNode = id => byId[id]
    ? content.resolveGraphNode(id, byId[id], G.meta).record
    : null;
  const esc = APP.shared.escapeHtml;
  const mdLite = APP.shared.createMarkdownRenderer(byId, t, localizedGraphNode);
  const resourceLoader = APP.shared.createScriptLoader();
  const loadScriptsInOrder = resourceLoader.loadInOrder;
  const debounce = APP.shared.debounce;

  const CORE = new Set(G.core || []);
  const RECOMMENDED_PATH = (G.recommendedLearningPath || []).reduce((all, phase) =>
    all.concat((phase.steps || []).map(step => ({ order: String(step[0]), id: step[1], phase: phase.phase }))), []);
  const RECOMMENDED_INDEX = new Map(RECOMMENDED_PATH.map((step, index) => [step.id, index]));
  const DEEPDIVE_RUNTIME = window.DEEPDIVE_RUNTIME || { base: "data/deepdive-runtime", ids: [] };
  // Stage 2 can replace a published page without changing its path. Give every
  // app session a fresh runtime revision so a previously cached page script
  // cannot hide the controller's newly published candidate.
  const DEEPDIVE_RUNTIME_REVISION = DEEPDIVE_RUNTIME.revision || String(Date.now());
  const DEEPDIVE_IDS = new Set(DEEPDIVE_RUNTIME.ids || []);
  window.DEEPDIVE = window.DEEPDIVE || {};
  const deepDiveLoader = APP.createDeepDiveLoader({
    runtime: DEEPDIVE_RUNTIME,
    ids: DEEPDIVE_IDS,
    registry: window.DEEPDIVE,
    getLocale: language.getLocale,
    revision: DEEPDIVE_RUNTIME_REVISION,
    t,
  });
  // Graph/learning callers only warm the source; fetch English when the reading view opens.
  const ensureDeepDive = deepDiveLoader.ensureSource;
  let learningView = null;
  let deepDiveView = null;
  let routeApplyToken = 0;
  let activeRoute = null;
  let pendingMapNode = null;
  let applyingMapRoute = false;
  let firstMapVisit = true;

  function setDocumentTitle(label) {
    const siteTitle = t("app.title.graph");
    document.title = label ? `${label}｜${siteTitle}` : (language.getLocale() === 'en'
      ? 'AI Knowledge Map – A Beginner’s Guide to AI Fundamentals and Connections'
      : 'AI 知识地图 – 面向初学者的 AI 基础与概念关联指南');
  }

  function goToRoute(route, options = {}) {
    const changed = ROUTER.navigate(route, options);
    // replaceState 不触发 hashchange；重复点击当前路由也应重新应用该状态。
    if (!changed || options.replace) applyRoute(route).catch(error => console.error('页面加载失败', error));
  }

  const graphView = APP.createGraphView({
    graph: G,
    domains: DOMAINS,
    edgeTypes: ETYPES,
    core: CORE,
    recommendedPath: RECOMMENDED_PATH,
    recommendedIndex: RECOMMENDED_INDEX,
    deepDiveIds: DEEPDIVE_IDS,
    byId,
    escapeHtml: esc,
    markdown: mdLite,
    debounce,
    ensureDeepDive,
    navigate: goToRoute,
    onShowNode: (id, jumped) => showNodeOnMap(id, jumped),
    onSelectionChange: id => syncMapSelectionUrl(id),
    isActive: () => mode === "graph" && !window.AI_ONBOARDING?.isOpen(),
    t,
    content,
  });
  const cy = graphView.cy;
  const detail = graphView.detail;
  const detailBody = graphView.detailBody;
  const select = graphView.selectNode;
  const clearGraphSelection = graphView.clearSelection;

  /* ───────────────────── 理解原理（深读页） ───────────────────── */
  const ddEl = document.getElementById("deepdive");
  learningView = APP.createLearningView({
    graph: G,
    domains: DOMAINS,
    byId,
    recommendedPath: RECOMMENDED_PATH,
    recommendedIndex: RECOMMENDED_INDEX,
    escapeHtml: esc,
    storageKey: "ai-knowledge-map.learned.v1",
    ensureDeepDive,
    navigate: goToRoute,
    selectNode: select,
    isDeepDiveActive: id => Boolean(deepDiveView && deepDiveView.isActive(id)),
    t,
    content,
  });
  deepDiveView = APP.createDeepDiveView({
    element: ddEl,
    ids: DEEPDIVE_IDS,
    byId,
    escapeHtml: esc,
    ensurePage: deepDiveLoader.ensure,
    renderLearning: learningView.renderButtonHtml,
    bindLearning: learningView.bindButtons,
    preloadNeighbors: learningView.preloadNeighbors,
    router: ROUTER,
    navigate: goToRoute,
    t,
  });
  const openDeepDive = deepDiveView.open;
  const closeDeepDive = deepDiveView.close;
  learningView.init();

  /* ───────────────────── 软件与资料库视图 ───────────────────── */
  let mode = "graph";               // graph | software | library

  function showNodeOnMap(id, jumped) {
    if (!byId[id]) return;
    if (mode === "graph" && ROUTER.parseLocation().name === "map") {
      select(id, jumped);
      return;
    }
    pendingMapNode = { id, jumped };
    goToRoute({ name: "map", id });
  }

  // Ordinary map exploration stays transient. A page opened via a node link
  // keeps that link accurate as the selected node changes or is dismissed.
  function syncMapSelectionUrl(id) {
    const route = ROUTER.parseLocation();
    if (applyingMapRoute || route.name !== "map" || route.id === id || (!route.id && !id)) return;
    const nextRoute = id ? { name: "map", id } : { name: "map" };
    // One history entry for an open detail. Further node choices replace it,
    // so Back closes the detail rather than leaving the map.
    if (!id && window.history.state?.akmMapDetail) window.history.back();
    else {
      ROUTER.navigate(nextRoute, { replace: Boolean(route.id), silent: true });
      if (id) window.history.replaceState({...window.history.state,akmMapDetail:true},'',location.href);
    }
    activeRoute = nextRoute;
    setDocumentTitle(id ? localizedGraphNode(id)?.title : undefined);
  }

  const swView = document.getElementById("software-view");
  const libraryView = document.getElementById("library-view");
  let softwareView = null, libraryCatalogView = null;
  const viewLoads = new Map();
  function ensureView(kind) {
    if (viewLoads.has(kind)) return viewLoads.get(kind);
    const loading = (async () => {
      const factory = kind === 'software' ? 'createSoftwareView' : 'createLibraryView';
      if (!APP[factory]) {
        const descriptor = document.getElementById(`lazy-${kind}-view`);
        if (!descriptor) throw new Error(`Missing view resource: ${kind}`);
        const target = kind === 'software' ? swView : libraryView;
        target.innerHTML = `<div class="view-loading" role="status">${esc(t(kind === 'software' ? 'software.loading' : 'library.loading'))}</div>`;
        await resourceLoader.loadOnce(JSON.parse(descriptor.textContent));
      }
      if (kind === 'software' && !softwareView) softwareView = APP.createSoftwareView({
    view: swView,
    detail,
    detailBody,
    deepDiveElement: ddEl,
    byId,
    escapeHtml: esc,
    markdown: mdLite,
    loadScriptsInOrder,
    navigate: goToRoute,
    t,
  });
      if (kind === 'library' && !libraryCatalogView) libraryCatalogView = APP.createLibraryView({
    view: libraryView,
    detail,
    detailBody,
    byId,
    escapeHtml: esc,
    debounce,
    loadScriptsInOrder,
    navigate: goToRoute,
    t,
  });
      const view = kind === 'software' ? softwareView : libraryCatalogView;
      await view.ensureReady();
      return view;
    })().catch(error => { viewLoads.delete(kind); throw error; });
    viewLoads.set(kind, loading);
    return loading;
  }

  const detailToggle = document.getElementById("detail-toggle");
  function syncDetailToggle() {
    const expanded = !detail.classList.contains("collapsed");
    const visible = mode === "graph" && !detail.classList.contains("closed");
    detailToggle.classList.toggle("hidden", !visible);
    detailToggle.setAttribute("aria-expanded", String(expanded));
    const label = language.getLocale() === "en"
      ? (expanded ? "Collapse introduction" : "Expand introduction")
      : (expanded ? "收起基础介绍" : "展开基础介绍");
    detailToggle.title = label;
    detailToggle.setAttribute("aria-label", label);
    detailToggle.style.right = (visible ? detail.getBoundingClientRect().width : 0) + "px";
    detail.inert = visible && !expanded;
  }
  function toggleIntroduction() {
    detail.classList.toggle("collapsed");
    syncDetailToggle();
    cy.resize();
  }
  detailToggle.addEventListener("click", toggleIntroduction);
  new MutationObserver(syncDetailToggle).observe(detail, {attributes:true, attributeFilter:['class']});
  new ResizeObserver(syncDetailToggle).observe(detail);
  language.subscribe(syncDetailToggle);
  document.getElementById("detail-close").addEventListener("click", () => {
    if (mode === "graph") toggleIntroduction();
    else goToRoute({ name: mode === "software" ? "software" : "library" });
  });

  function applyCurrentLanguage() {
    language.localize(document);
    document.querySelectorAll('#topbar .release-directory-link').forEach(link=>{
      const path=new URL(link.href,location.href).pathname;
      if(path==='/about/')link.textContent=language.getLocale()==='en'?'About / Corrections':'关于与纠错';
      if(path==='/search/')link.textContent=language.getLocale()==='en'?'Text directory / Search':'文字目录 / Search';
    });
    renderLanguageSettings();
    graphView.refreshLanguage();
    learningView.refreshLanguage();
    softwareView?.refreshLanguage();
    libraryCatalogView?.refreshLanguage();
    updateModeChrome(mode);
    if (!activeRoute || activeRoute.name === "map") setDocumentTitle(activeRoute?.id ? localizedGraphNode(activeRoute.id)?.title : undefined);
    else if (activeRoute.name === "software") setDocumentTitle(t("pageTitle.software"));
    else if (activeRoute.name === "library") setDocumentTitle(t("pageTitle.library"));
    else applyRoute(activeRoute);
  }

  applyCurrentLanguage();
  language.subscribe(applyCurrentLanguage);

  async function setMode(m) {
    mode = m;
    const isSW = m === "software";
    const isLibrary = m === "library";
    const isGraph = m === "graph";
    detail.classList.toggle("graph-detail", isGraph);
    detail.classList.remove("collapsed");
    document.getElementById("cy").classList.toggle("hidden", !isGraph);
    document.getElementById("legend").classList.toggle("hidden", !isGraph);
    graphView.zoomRoot.classList.toggle("hidden", !isGraph);
    document.getElementById("controls").classList.toggle("hidden", !isGraph);
    document.getElementById("controls-toggle").classList.toggle("hidden", !isGraph);
    swView.classList.toggle("hidden", !isSW);
    libraryView.classList.toggle("hidden", !isLibrary);
    document.getElementById("btn-reset").classList.toggle("hidden", !isGraph);
    updateModeChrome(m);
    const search = document.getElementById("search");
    document.querySelectorAll(".mode-nav-btn").forEach(button => {
      const active = button.getAttribute("data-mode") === m;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
    detail.classList.add("closed");
    if (isGraph) setTimeout(() => cy.resize(), 30);

    if (isSW || isLibrary) {
      try { await ensureView(m); }
      catch (error) {
        const view = isSW ? swView : libraryView;
        if (mode === m) {
          view.replaceChildren();
          const message = document.createElement('p'), retry = document.createElement('button');
          message.setAttribute('role','status');
          message.textContent = language.getLocale() === 'en' ? 'This section could not load. You can retry.' : '该板块暂时加载失败，可以重试。';
          retry.textContent = language.getLocale() === 'en' ? 'Retry' : '重试';
          retry.onclick = () => applyRoute(ROUTER.parseLocation()).catch(console.error);
          view.append(message,retry);
        }
        throw error;
      }
    }
  }

  function updateModeChrome(targetMode) {
    const isSW = targetMode === "software";
    const isLibrary = targetMode === "library";
    const isGraph = targetMode === "graph";
    document.getElementById("brand-name").textContent = isSW
      ? t("app.title.software")
      : isLibrary ? t("app.title.library") : t("app.title.graph");
    const search = document.getElementById("search");
    search.placeholder = isGraph ? t("search.graph") : language.getLocale()==='en' ? 'Search all pages and tutorials…' : '搜索全站页面与教程…';
    search.disabled = false;
  }

  async function applyRoute(route = ROUTER.parseLocation()) {
    const token = ++routeApplyToken;
    const stale = () => token !== routeApplyToken;
    const previousRoute = activeRoute;
    activeRoute = route;

    // 路由是唯一页面状态来源：先收起覆盖层，再按目标地址恢复底层视图。
    closeDeepDive();

    if (route.name === "map") {
      if (route.id && !byId[route.id]) {
        pendingMapNode = null;
        goToRoute({ name: "map" }, { replace: true });
        return;
      }
      await setMode("graph");
      if (stale()) return;
      const pending = pendingMapNode;
      pendingMapNode = null;
      applyingMapRoute = true;
      try {
      if (route.id) { select(route.id, true); if(firstMapVisit)graphView.restoreView(route.id); }
      else if (pending && byId[pending.id]) select(pending.id, pending.jumped);
      else if (previousRoute && previousRoute.name === "concept" && byId[previousRoute.id]) select(previousRoute.id, true);
      else if (!(firstMapVisit && graphView.restoreView())) clearGraphSelection();
      } finally { applyingMapRoute = false; firstMapVisit = false; }
      setDocumentTitle(route.id ? localizedGraphNode(route.id)?.title : undefined);
      return;
    }

    if (route.name === "concept") {
      const node = byId[route.id];
      if (!node || !DEEPDIVE_IDS.has(route.id)) {
        goToRoute({ name: "map" }, { replace: true });
        return;
      }
      await setMode("graph");
      if (stale()) return;
      select(route.id, true);
      await openDeepDive(route.id);
      if (stale()) return;
      setDocumentTitle(t("pageTitle.deepDive", { title: node.title }));
      return;
    }

    if (route.name === "software" || route.name === "software-item" || route.name === "tutorial") {
      await setMode("software");
      if (stale()) return;
      if (route.name === "software") {
        setDocumentTitle(t("pageTitle.software"));
        return;
      }
      const legacyTutorialRoute = route.name === "tutorial" ? softwareView.resolveLegacyRoute(route.id) : null;
      if (legacyTutorialRoute) {
        goToRoute(legacyTutorialRoute, { replace: true });
        return;
      }
      const module = softwareView.findTutorial(route.id);
      if (!module) {
        goToRoute({ name: "software" }, { replace: true });
        return;
      }
      if (route.name === "software-item") {
        goToRoute({ name: "tutorial", id: route.id }, { replace: true });
        return;
      }
      const lesson = route.lesson ? softwareView.findLesson(route.id, route.lesson) : null;
      if (route.lesson && !lesson) {
        goToRoute({ name: "tutorial", id: route.id }, { replace: true });
        return;
      }
      softwareView.openTutorial(route.id, route.lesson);
      setDocumentTitle(lesson?.title || (t("tutorial.language") === "en" ? module.titleEn : module.title));
      return;
    }

    if (route.name === "library" || route.name === "library-item") {
      await setMode("library");
      if (stale()) return;
      if (route.name === "library") {
        setDocumentTitle(t("pageTitle.library"));
        return;
      }
      const item = libraryCatalogView.findItem(route.id);
      if (!item) {
        goToRoute({ name: "library" }, { replace: true });
        return;
      }
      libraryCatalogView.openItem(route.id);
      setDocumentTitle(item.title);
      return;
    }

    goToRoute({ name: "map" }, { replace: true });
  }

  document.querySelectorAll(".mode-nav-btn").forEach(button =>
    button.addEventListener("click", () => {
      const targetMode = button.getAttribute("data-mode");
      goToRoute({ name: targetMode === "software" ? "software" : targetMode === "library" ? "library" : "map" });
    }));

  function applyLocationRoute() {
    const route = ROUTER.parseLocation();
    // Old #/... bookmarks stay valid and are upgraded to the clean URL in place
    // (silently, so this handler still runs exactly once). #/concept is left to
    // release-navigation, which forwards published pages to their article.
    if (window.location.hash && route.name !== "concept" && route.name !== "not-found") {
      ROUTER.navigate(route, { replace: true, silent: true });
    }
    applyRoute(route).catch(error => console.error('页面加载失败', error));
  }
  window.addEventListener("hashchange", applyLocationRoute);
  // pushState navigation reports back/forward through popstate, not hashchange.
  window.addEventListener("popstate", applyLocationRoute);
  applyLocationRoute();

  // 暴露给调试用
  window.__cy = cy;
  window.__i18n = language;
  document.documentElement.dataset.appReady = 'true';
  window.dispatchEvent(new Event('ai-app-ready'));
})().catch(error => {
  console.error("应用初始化失败", error);
  window.dispatchEvent(new Event('ai-app-failed'));
});
