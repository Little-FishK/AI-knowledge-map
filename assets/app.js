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
      || !APP.createSoftwareView || !APP.createLibraryView || !APP.i18n || !APP.contentI18n) {
    throw new Error("前端模块未完整加载");
  }
  if (!I18N_MANIFEST) throw new Error("语言清单未加载");
  window.AI_LOCALES = window.AI_LOCALES || {};
  const language = APP.i18n.createI18n({
    manifest: I18N_MANIFEST,
    registry: window.AI_LOCALES,
  });
  await language.initialize({ urlLocale: new URLSearchParams(window.location.search).get("lang") });
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
    console.error(error);
    await language.setLocale(I18N_MANIFEST.sourceLocale);
  }
  const settingsButton = document.getElementById("btn-settings");
  const settingsOverlay = document.getElementById("settings-overlay");
  const settingsDialog = document.getElementById("settings-dialog");
  const settingsClose = document.getElementById("settings-close");
  const settingsBackdrop = document.getElementById("settings-backdrop");
  const languageSelect = document.getElementById("settings-language-select");
  const languageStatus = document.getElementById("settings-language-status");
  const topbar = document.getElementById("topbar");
  const main = document.getElementById("main");
  let settingsReturnFocus = null;
  document.body.append(settingsOverlay);

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
    topbar.inert = true;
    main.inert = true;
    document.getElementById("onboarding").inert = true;
    settingsClose.focus();
  }

  function closeSettings() {
    if (settingsOverlay.classList.contains("hidden")) return;
    settingsOverlay.classList.add("hidden");
    settingsOverlay.setAttribute("aria-hidden", "true");
    settingsButton.setAttribute("aria-expanded", "false");
    topbar.inert = false;
    main.inert = false;
    document.getElementById("onboarding").inert = false;
    if (settingsReturnFocus && typeof settingsReturnFocus.focus === "function") settingsReturnFocus.focus();
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
  language.subscribe(() => { language.localize(document); renderLanguageSettings(); });
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

  function setDocumentTitle(label) {
    const siteTitle = t("app.title.graph");
    document.title = label ? `${label}｜${siteTitle}` : siteTitle;
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
    if (mode === "graph" && ROUTER.parse(window.location.hash).name === "map") {
      select(id, jumped);
      return;
    }
    pendingMapNode = { id, jumped };
    goToRoute({ name: "map", id });
  }

  // Ordinary map exploration stays transient. A page opened via a node link
  // keeps that link accurate as the selected node changes or is dismissed.
  function syncMapSelectionUrl(id) {
    const route = ROUTER.parse(window.location.hash);
    if (route.name !== "map" || !route.id) return;
    const nextRoute = id ? { name: "map", id } : { name: "map" };
    const url = new URL(window.location.href);
    url.hash = ROUTER.format(nextRoute).slice(1);
    window.history.replaceState(null, "", url.href);
    activeRoute = nextRoute;
    setDocumentTitle(id ? localizedGraphNode(id)?.title : undefined);
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
    t,
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
    t,
  });

  document.getElementById("detail-close").addEventListener("click", () => {
    if (mode === "graph") clearGraphSelection();
    else goToRoute({ name: mode === "software" ? "software" : "library" });
  });

  function applyCurrentLanguage() {
    language.localize(document);
    renderLanguageSettings();
    document.getElementById("locale-fallback-banner").classList.toggle(
      "hidden",
      language.getLocale() === I18N_MANIFEST.sourceLocale
    );
    graphView.refreshLanguage();
    learningView.refreshLanguage();
    softwareView.refreshLanguage();
    libraryCatalogView.refreshLanguage();
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

    if (isSW) await softwareView.ensureReady();
    if (isLibrary) await libraryCatalogView.ensureReady();
  }

  function updateModeChrome(targetMode) {
    const isSW = targetMode === "software";
    const isLibrary = targetMode === "library";
    const isGraph = targetMode === "graph";
    document.getElementById("brand-name").textContent = isSW
      ? t("app.title.software")
      : isLibrary ? t("app.title.library") : t("app.title.graph");
    const search = document.getElementById("search");
    search.placeholder = isGraph ? t("search.graph") : isSW ? t("search.software") : t("search.library");
    search.disabled = !isGraph;
  }

  async function applyRoute(route = ROUTER.parse(window.location.hash)) {
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
      if (route.id) select(route.id, true);
      else if (pending && byId[pending.id]) select(pending.id, pending.jumped);
      else if (previousRoute && previousRoute.name === "concept" && byId[previousRoute.id]) select(previousRoute.id, true);
      else clearGraphSelection();
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

  window.addEventListener("hashchange", () => applyRoute());
  if (window.location.hash) applyRoute();
  else goToRoute({ name: "map" }, { replace: true });

  // 暴露给调试用
  window.__cy = cy;
  window.__i18n = language;
})().catch(error => {
  console.error("应用初始化失败", error);
});
