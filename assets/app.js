/* AI 知识地图 — 展示层
 * 只读 window.GRAPH 渲染，不写数据。入库是离线步骤（SPEC §2.3）。
 */
(function () {
  "use strict";

  const G = window.GRAPH;
  const ROUTER = window.APP_ROUTER;
  const APP = window.AIMap;
  if (!ROUTER) throw new Error("URL 路由模块未加载");
  if (!APP || !APP.shared || !APP.createDeepDiveLoader || !APP.createGraphView
      || !APP.createLearningView || !APP.createDeepDiveView
      || !APP.createSoftwareView || !APP.createLibraryView) {
    throw new Error("前端模块未完整加载");
  }
  const SITE_TITLE = "AI 知识地图";
  const DOMAINS = G.domains;
  const ETYPES = G.edgeTypes;

  const byId = {};
  G.nodes.forEach(n => { byId[n.id] = n; });
  const esc = APP.shared.escapeHtml;
  const mdLite = APP.shared.createMarkdownRenderer(byId);
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
    revision: DEEPDIVE_RUNTIME_REVISION,
  });
  const ensureDeepDive = deepDiveLoader.ensure;
  let learningView = null;
  let deepDiveView = null;
  let routeApplyToken = 0;
  let activeRoute = null;
  let pendingMapNode = null;

  function setDocumentTitle(label) {
    document.title = label ? `${label}｜${SITE_TITLE}` : SITE_TITLE;
  }

  function goToRoute(route, options = {}) {
    const changed = ROUTER.navigate(route, options);
    // replaceState 不触发 hashchange；重复点击当前路由也应重新应用该状态。
    if (!changed || options.replace) applyRoute(route);
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
    isActive: () => mode === "graph",
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
  });
  deepDiveView = APP.createDeepDiveView({
    element: ddEl,
    ids: DEEPDIVE_IDS,
    byId,
    escapeHtml: esc,
    ensurePage: ensureDeepDive,
    renderLearning: learningView.renderButtonHtml,
    bindLearning: learningView.bindButtons,
    preloadNeighbors: learningView.preloadNeighbors,
    router: ROUTER,
    navigate: goToRoute,
  });
  const openDeepDive = deepDiveView.open;
  const closeDeepDive = deepDiveView.close;
  learningView.init();

  /* ───────────────────── 软件与资料库视图 ───────────────────── */
  let mode = "graph";               // graph | software | library

  function showNodeOnMap(id, jumped) {
    if (!byId[id]) return;
    if (mode === "graph" && ROUTER.parse(window.location.hash).name === "map") {
      select(id, jumped);
      return;
    }
    pendingMapNode = { id, jumped };
    goToRoute({ name: "map" });
  }

  const swView = document.getElementById("software-view");
  const libraryView = document.getElementById("library-view");
  const softwareView = APP.createSoftwareView({
    view: swView,
    detail,
    detailBody,
    deepDiveElement: ddEl,
    byId,
    escapeHtml: esc,
    markdown: mdLite,
    loadScriptsInOrder,
    navigate: goToRoute,
  });
  const libraryCatalogView = APP.createLibraryView({
    view: libraryView,
    detail,
    detailBody,
    byId,
    escapeHtml: esc,
    debounce,
    loadScriptsInOrder,
    navigate: goToRoute,
  });

  document.getElementById("detail-close").addEventListener("click", () => {
    if (mode === "graph") clearGraphSelection();
    else goToRoute({ name: mode === "software" ? "software" : "library" });
  });

  async function setMode(m) {
    mode = m;
    const isSW = m === "software";
    const isLibrary = m === "library";
    const isGraph = m === "graph";
    document.getElementById("cy").classList.toggle("hidden", !isGraph);
    document.getElementById("legend").classList.toggle("hidden", !isGraph);
    graphView.zoomRoot.classList.toggle("hidden", !isGraph);
    document.getElementById("controls").classList.toggle("hidden", !isGraph);
    swView.classList.toggle("hidden", !isSW);
    libraryView.classList.toggle("hidden", !isLibrary);
    document.getElementById("btn-reset").classList.toggle("hidden", !isGraph);
    document.getElementById("brand-name").textContent = isSW ? "AI 软件目录" : isLibrary ? "专业资料库" : "AI 知识地图";
    const search = document.getElementById("search");
    search.placeholder = isGraph ? "搜索概念…  （/ 聚焦）" : isSW ? "请在软件目录中浏览" : "请使用资料库内搜索";
    search.disabled = !isGraph;
    document.querySelectorAll(".mode-nav-btn").forEach(button => {
      const active = button.getAttribute("data-mode") === m;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
    detail.classList.add("closed");
    if (isGraph) setTimeout(() => cy.resize(), 30);

    if (isSW) await softwareView.ensureReady();
    if (isLibrary) await libraryCatalogView.ensureReady();
  }

  async function applyRoute(route = ROUTER.parse(window.location.hash)) {
    const token = ++routeApplyToken;
    const stale = () => token !== routeApplyToken;
    const previousRoute = activeRoute;
    activeRoute = route;

    // 路由是唯一页面状态来源：先收起覆盖层，再按目标地址恢复底层视图。
    closeDeepDive();

    if (route.name === "map") {
      await setMode("graph");
      if (stale()) return;
      const pending = pendingMapNode;
      pendingMapNode = null;
      if (pending && byId[pending.id]) select(pending.id, pending.jumped);
      else if (previousRoute && previousRoute.name === "concept" && byId[previousRoute.id]) select(previousRoute.id, true);
      else clearGraphSelection();
      setDocumentTitle();
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
      setDocumentTitle(`${node.title} · 理解原理`);
      return;
    }

    if (route.name === "software" || route.name === "software-item" || route.name === "tutorial") {
      await setMode("software");
      if (stale()) return;
      if (route.name === "software") {
        setDocumentTitle("软件目录");
        return;
      }
      const software = softwareView.findSoftware(route.id);
      if (!software) {
        goToRoute({ name: "software" }, { replace: true });
        return;
      }
      softwareView.openSoftware(route.id);
      if (route.name === "tutorial") {
        const tutorial = softwareView.findTutorial(route.id);
        if (!tutorial) {
          goToRoute({ name: "software-item", id: route.id }, { replace: true });
          return;
        }
        softwareView.openTutorial(route.id);
        setDocumentTitle(tutorial.title);
      } else {
        setDocumentTitle(software.name);
      }
      return;
    }

    if (route.name === "library" || route.name === "library-item") {
      await setMode("library");
      if (stale()) return;
      if (route.name === "library") {
        setDocumentTitle("专业资料库");
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

  window.addEventListener("hashchange", () => applyRoute());
  if (window.location.hash) applyRoute();
  else goToRoute({ name: "map" }, { replace: true });

  // 暴露给调试用
  window.__cy = cy;
})();
