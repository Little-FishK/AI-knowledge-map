/* AI 知识地图 — 展示层
 * 只读 window.GRAPH 渲染，不写数据。入库是离线步骤（SPEC §2.3）。
 */
(function () {
  "use strict";

  const G = window.GRAPH;
  const DOMAINS = G.domains;
  const ETYPES = G.edgeTypes;

  // 成熟度只是一个轻量标记，不再是会 gate 视图的「层」：
  // 演进中的概念用虚线琥珀色描边标出，稳定的用中性描边，仅此而已。
  const EVOLVING = "#d3a05a";
  const STABLE_RING = "#3a4150";
  // 「关键关系」= 最能体现跨领域联系的几类，默认强调
  const KEY_EDGES = ["mitigates", "threatens", "constrains", "contrast"];

  const byId = {};
  G.nodes.forEach(n => { byId[n.id] = n; });

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
  const deepDiveLoads = new Map();
  const LEARNING_STORAGE_KEY = "ai-knowledge-map.learned.v1";
  const learnedNodes = loadLearnedNodes();
  let activeDeepDiveId = null;
  let officialPathActive = false;
  let officialPathRestore = null;

  window.DEEPDIVE = window.DEEPDIVE || {};

  /* ── 通用工具：顺序脚本加载器 + 防抖 ── */
  const scriptLoads = new Map();
  function loadScriptOnce(src) {
    if (scriptLoads.has(src)) return scriptLoads.get(src);
    const load = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => { scriptLoads.delete(src); reject(new Error(`资源加载失败：${src}`)); };
      document.head.appendChild(script);
    });
    scriptLoads.set(src, load);
    return load;
  }
  async function loadScriptsInOrder(srcs) {
    for (const src of srcs) await loadScriptOnce(src);
  }
  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ── 学习面板：固定元素引用、按钮索引、节点顺序（用于局部更新） ── */
  const learningEls = {};
  const learningButtons = new Map();          // nodeId -> <button>
  const nodeIndex = new Map(G.nodes.map((n, i) => [n.id, i]));

  function ensureDeepDive(id) {
    if (window.DEEPDIVE[id]) return Promise.resolve(window.DEEPDIVE[id]);
    if (!DEEPDIVE_IDS.has(id)) return Promise.reject(new Error(`不存在理解原理页：${id}`));
    if (deepDiveLoads.has(id)) return deepDiveLoads.get(id);

    const load = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${DEEPDIVE_RUNTIME.base}/${encodeURIComponent(id)}.js?v=${encodeURIComponent(DEEPDIVE_RUNTIME_REVISION)}`;
      script.async = true;
      script.onload = () => {
        script.remove();
        if (window.DEEPDIVE[id]) resolve(window.DEEPDIVE[id]);
        else reject(new Error(`理解原理页加载后未注册：${id}`));
      };
      script.onerror = () => {
        script.remove();
        deepDiveLoads.delete(id);
        reject(new Error(`理解原理页加载失败：${id}`));
      };
      document.head.appendChild(script);
    });
    deepDiveLoads.set(id, load);
    return load;
  }

  function preloadRecommendedNeighbors(id) {
    const currentIndex = RECOMMENDED_INDEX.get(id);
    const previous = Number.isInteger(currentIndex) ? RECOMMENDED_PATH[currentIndex - 1] : null;
    const next = Number.isInteger(currentIndex) ? RECOMMENDED_PATH[currentIndex + 1] : null;
    if (previous) ensureDeepDive(previous.id).catch(error => console.warn(error.message));
    if (next) ensureDeepDive(next.id).catch(error => console.warn(error.message));
  }

  function loadLearnedNodes() {
    try {
      const saved = JSON.parse(localStorage.getItem(LEARNING_STORAGE_KEY) || "[]");
      return new Set(Array.isArray(saved) ? saved.filter(id => !!byId[id]) : []);
    } catch (e) {
      console.warn("学习进度读取失败，将使用空进度：", e);
      return new Set();
    }
  }

  function saveLearnedNodes() {
    try {
      localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(Array.from(learnedNodes)));
    } catch (e) {
      console.warn("学习进度保存失败：", e);
    }
  }

  function learningButtonHtml(id) {
    const learned = learnedNodes.has(id);
    const currentIndex = RECOMMENDED_INDEX.get(id);
    const previousStep = Number.isInteger(currentIndex) ? RECOMMENDED_PATH[currentIndex - 1] : null;
    const nextStep = Number.isInteger(currentIndex) ? RECOMMENDED_PATH[currentIndex + 1] : null;
    const previousNode = previousStep && byId[previousStep.id];
    const nextNode = nextStep && byId[nextStep.id];
    const previousButton = previousStep && previousNode
      ? `<button type="button" class="dd-path-btn dd-prev-btn" data-prev-node="${esc(previousStep.id)}" aria-label="上一节 ${esc(previousStep.order)}：${esc(previousNode.title)}">
          <span aria-hidden="true">←</span>
          <span class="dd-path-copy"><small>上一节 ${esc(previousStep.order)}</small><strong>${esc(previousNode.title)}</strong></span>
        </button>`
      : "";
    const nextButton = nextStep && nextNode
      ? `<button type="button" class="dd-path-btn dd-next-btn" data-next-node="${esc(nextStep.id)}" aria-label="下一节 ${esc(nextStep.order)}：${esc(nextNode.title)}">
          <span class="dd-path-copy"><small>下一节 ${esc(nextStep.order)}</small><strong>${esc(nextNode.title)}</strong></span>
          <span aria-hidden="true">→</span>
        </button>`
      : "";
    return `<section class="dd-learning-complete">
      <div>
        <div class="dd-learning-kicker">${learned ? "学习进度已更新" : "完成本页学习了吗？"}</div>
        <div class="dd-learning-copy">${learned ? "这个节点已计入主页的“已学习”列表。" : "标记后可在主页侧栏随时查看已学与未学节点。"}</div>
      </div>
      <div class="dd-learning-actions">
        ${previousButton}
        <button type="button" class="dd-learn-btn${learned ? " is-learned" : ""}" data-learn-node="${esc(id)}" aria-pressed="${learned}">
          ${learned ? "✓ 已学习" : "标记为已学习"}
        </button>
        ${nextButton}
      </div>
    </section>`;
  }

  // 一次性缓存固定元素与两个列表的委托监听（只在初始化时调用）
  function initLearningPanel() {
    [
      "learning-done-count", "learning-total-count", "learning-percent", "learning-progress-bar",
      "learning-done-label", "learning-todo-label", "learning-done-list", "learning-todo-list"
    ].forEach(id => { learningEls[id] = document.getElementById(id); });

    [learningEls["learning-done-list"], learningEls["learning-todo-list"]].forEach(list => {
      if (!list) return;
      list.addEventListener("click", event => {
        const button = event.target.closest("[data-learning-goto]");
        if (button) select(button.getAttribute("data-learning-goto"), true);
      });
    });
    renderLearningPanel();
  }

  function makeLearningButton(n) {
    const domain = DOMAINS[n.domain] || { color: "#888", label: n.domain };
    const button = document.createElement("button");
    button.type = "button";
    button.className = "learning-node";
    button.setAttribute("data-learning-goto", n.id);
    button.title = domain.label;
    button.innerHTML = `<span class="dot" style="background:${domain.color}"></span><span>${esc(n.title)}</span>`;
    return button;
  }

  function setLearningEmptyState(list, isDone) {
    if (!list) return;
    const hasNodes = !!list.querySelector(".learning-node");
    let empty = list.querySelector(".learning-empty");
    if (hasNodes) { if (empty) empty.remove(); return; }
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "learning-empty";
      empty.textContent = isDone ? "还没有标记已学习的节点" : "所有节点都已学习";
      list.appendChild(empty);
    }
  }

  function updateLearningCounts() {
    const total = G.nodes.length;
    const doneCount = learnedNodes.size;
    const percent = total ? Math.round(doneCount / total * 100) : 0;
    if (!learningEls["learning-done-count"]) return;
    learningEls["learning-done-count"].textContent = doneCount;
    learningEls["learning-total-count"].textContent = ` / ${total} 个节点`;
    learningEls["learning-percent"].textContent = `${percent}%`;
    learningEls["learning-progress-bar"].style.width = `${percent}%`;
    learningEls["learning-done-label"].textContent = doneCount;
    learningEls["learning-todo-label"].textContent = total - doneCount;
  }

  // 全量构建两个列表（仅初始化或批量变更时用）
  function renderLearningPanel() {
    const doneList = learningEls["learning-done-list"];
    const todoList = learningEls["learning-todo-list"];
    if (!doneList || !todoList) return;
    doneList.innerHTML = "";
    todoList.innerHTML = "";
    learningButtons.clear();
    G.nodes.forEach(n => {
      const button = makeLearningButton(n);
      learningButtons.set(n.id, button);
      (learnedNodes.has(n.id) ? doneList : todoList).appendChild(button);
    });
    setLearningEmptyState(doneList, true);
    setLearningEmptyState(todoList, false);
    updateLearningCounts();
  }

  // 保持 G.nodes 顺序把按钮插入目标列表
  function insertLearningButtonInOrder(list, id) {
    const button = learningButtons.get(id);
    if (!button) return;
    const start = (nodeIndex.get(id) ?? -1) + 1;
    for (let i = start; i < G.nodes.length; i++) {
      const other = learningButtons.get(G.nodes[i].id);
      if (other && other.parentNode === list) { list.insertBefore(button, other); return; }
    }
    list.appendChild(button);
  }

  function toggleLearnedNode(id) {
    if (!byId[id]) return;
    const nowLearned = !learnedNodes.has(id);
    if (nowLearned) learnedNodes.add(id);
    else learnedNodes.delete(id);
    saveLearnedNodes();

    const doneList = learningEls["learning-done-list"];
    const todoList = learningEls["learning-todo-list"];
    if (learningButtons.has(id) && doneList && todoList) {
      insertLearningButtonInOrder(nowLearned ? doneList : todoList, id);
      setLearningEmptyState(doneList, true);
      setLearningEmptyState(todoList, false);
      updateLearningCounts();
    } else {
      renderLearningPanel();
    }

    if (activeDeepDiveId === id) {
      const current = document.querySelector(".dd-learning-complete");
      if (current) {
        current.outerHTML = learningButtonHtml(id);
        bindLearningButton();
      }
    }
  }

  function bindLearningButton() {
    const button = document.querySelector("[data-learn-node]");
    if (button) button.addEventListener("click", () => toggleLearnedNode(button.getAttribute("data-learn-node")));
    const previousButton = document.querySelector("[data-prev-node]");
    if (previousButton) previousButton.addEventListener("click", () => openDeepDive(previousButton.getAttribute("data-prev-node")));
    const nextButton = document.querySelector("[data-next-node]");
    if (nextButton) nextButton.addEventListener("click", () => openDeepDive(nextButton.getAttribute("data-next-node")));
  }

  function removeOfficialPathMarkers() {
    cy.nodes(".official-path-node").removeData("officialOrder");
    cy.nodes().removeClass("official-path-node official-path-muted");
  }

  function addOfficialPathMarkers() {
    RECOMMENDED_PATH.forEach(step => {
      const target = cy.getElementById(step.id);
      if (!target.length) return;
      target.data("officialOrder", step.order);
      target.addClass("official-path-node");
    });
    cy.nodes().not(".official-path-node").addClass("official-path-muted");
  }

  function setOfficialPath(active) {
    const button = document.getElementById("official-path-toggle");
    const note = document.getElementById("official-path-note");
    if (!button || active === officialPathActive) return;

    if (active) {
      officialPathRestore = {
        scope: state.scope,
        focus: state.focus,
        domains: Object.assign({}, state.domains)
      };
      officialPathActive = true;
      state.scope = "all";
      state.focus = false;
      Object.keys(state.domains).forEach(key => { state.domains[key] = true; });
      document.getElementById("focus-on").checked = false;
      syncControls();
      applyFilters();
      addOfficialPathMarkers();
      button.classList.add("on");
      button.setAttribute("aria-pressed", "true");
      button.querySelector("span").textContent = "✦ 关闭推荐";
      note.classList.remove("hidden");
      fitView();
      return;
    }

    officialPathActive = false;
    removeOfficialPathMarkers();
    if (officialPathRestore) {
      state.scope = officialPathRestore.scope;
      state.focus = officialPathRestore.focus;
      Object.assign(state.domains, officialPathRestore.domains);
    }
    document.getElementById("focus-on").checked = state.focus;
    officialPathRestore = null;
    syncControls();
    applyFilters();
    button.classList.remove("on");
    button.setAttribute("aria-pressed", "false");
    button.querySelector("span").textContent = "✦ 官方推荐";
    note.classList.add("hidden");
    fitView();
  }

  const state = {
    domains: Object.fromEntries(Object.keys(DOMAINS).map(d => [d, true])),
    edges: Object.fromEntries(Object.keys(ETYPES).map(t => [t, true])),
    // 默认只显示核心节点：全展开在 50+ 节点时已不可读，
    // 而且新读者面对一张糊住的网不知从哪看起
    scope: CORE.size ? "core" : "all",   // core | all
    revealed: new Set(),                  // 核心视图下被点开而揭示出来的节点
    focus: true,                          // 默认开聚焦，配合核心视图逐层揭开
    hops: 1,
    selected: null
  };

  // 某节点在当前 scope 下是否该出现
  function inScope(id) {
    return state.scope === "all" || CORE.has(id) || state.revealed.has(id);
  }

  /* ───────────────────────── 图初始化 ───────────────────────── */

  const POS = G.positions || {};
  const elements = [];
  G.nodes.forEach(n => {
    const el = {
      data: {
        id: n.id, label: n.title, domain: n.domain,
        maturity: n.maturity || "stable",
        heat: typeof n.heat === "number" ? n.heat : 0.5
      }
    };
    if (POS[n.id]) el.position = { x: POS[n.id][0], y: POS[n.id][1] };
    elements.push(el);
  });
  // 所有节点都有固化坐标时直接用，跳过力导向——保证每次打开完全一致
  const ALL_PINNED = G.nodes.every(n => POS[n.id]);
  G.edges.forEach((e, i) => {
    if (!byId[e.from] || !byId[e.to]) {
      console.warn("边指向了不存在的节点，已跳过：", e);
      return;
    }
    elements.push({
      data: {
        id: "e" + i, source: e.from, target: e.to,
        type: e.type, label: e.label || "",
        directed: ETYPES[e.type] ? ETYPES[e.type].directed : true
      }
    });
  });

  const cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,
    minZoom: 0.2, maxZoom: 3,
    // Cap high-DPI canvas growth: 2x DPR means four times as many pixels.
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    style: [
      {
        selector: "node",
        style: {
          "label": "data(label)",
          "background-color": ele => DOMAINS[ele.data("domain")] ? DOMAINS[ele.data("domain")].color : "#888",
          "border-width": ele => ele.data("maturity") === "evolving" ? 3 : 2,
          "border-color": ele => ele.data("maturity") === "evolving" ? EVOLVING : STABLE_RING,
          "border-style": ele => ele.data("maturity") === "evolving" ? "dashed" : "solid",
          "border-opacity": 0.9,
          "width":  ele => 30 + ele.data("heat") * 26,
          "height": ele => 30 + ele.data("heat") * 26,
          "color": "#e6eaf0",
          "font-size": 13,
          "font-family": '"PingFang SC","Microsoft YaHei",sans-serif',
          "text-valign": "bottom",
          "text-margin-y": 5,
          "text-wrap": "wrap",
          "text-max-width": 78,
          "text-outline-color": "#14161a",
          "text-outline-width": 2.5,
          "transition-property": "opacity, border-width",
          "transition-duration": "160ms"
        }
      },
      {
        selector: "edge",
        style: {
          "width": 1.6,
          "line-color": ele => ETYPES[ele.data("type")] ? ETYPES[ele.data("type")].color : "#888",
          "target-arrow-color": ele => ETYPES[ele.data("type")] ? ETYPES[ele.data("type")].color : "#888",
          "target-arrow-shape": ele => ele.data("directed") ? "triangle" : "none",
          "arrow-scale": 0.85,
          "curve-style": "bezier",
          "opacity": 0.5,
          "transition-property": "opacity, width",
          "transition-duration": "160ms"
        }
      },
      { selector: "node.dim", style: { "opacity": 0.12, "text-opacity": 0.15 } },
      { selector: "edge.dim", style: { "opacity": 0.04 } },
      { selector: "node.sel", style: { "border-width": 5, "border-color": "#eaeef5" } },
      {
        selector: "node.official-path-node",
        style: {
          "label": "data(officialOrder)",
          "width": ele => String(ele.data("officialOrder")).includes(".") ? 64 : 72,
          "height": ele => String(ele.data("officialOrder")).includes(".") ? 64 : 72,
          "background-color": ele => String(ele.data("officialOrder")).includes(".")
            ? "#202733"
            : "#e4b85d",
          "border-width": ele => String(ele.data("officialOrder")).includes(".") ? 3 : 6,
          "border-color": ele => String(ele.data("officialOrder")).includes(".")
            ? "#a99667"
            : "#fff0b8",
          "color": ele => String(ele.data("officialOrder")).includes(".")
            ? "#f4dfa8"
            : "#17130b",
          "font-family": '"Bahnschrift SemiBold", "Aptos Display", "Segoe UI Variable Display", "Arial", sans-serif',
          "font-size": ele => {
            const order = String(ele.data("officialOrder"));
            if (!order.includes(".")) return 26;
            return order.length <= 3 ? 22 : 19;
          },
          "font-weight": ele => String(ele.data("officialOrder")).includes(".") ? 600 : 800,
          "text-valign": "center",
          "text-halign": "center",
          "text-margin-y": 0,
          "text-outline-color": "#0d1118",
          "text-outline-width": ele => String(ele.data("officialOrder")).includes(".") ? 1.25 : 0
        }
      },
      { selector: "node.official-path-muted", style: { "opacity": 0.14, "text-opacity": 0.16 } },
      {
        selector: "edge.hl",
        style: { "opacity": 1, "width": 2.6, "label": "data(label)",
                 "font-size": 9.5, "color": "#aeb6c4",
                 "text-outline-color": "#14161a", "text-outline-width": 2.5,
                 "text-rotation": "autorotate" }
      },
      { selector: "node.hl", style: { "opacity": 1, "text-opacity": 1 } },
      { selector: ".hidden", style: { "display": "none" } }
    ],
    layout: { name: "preset" }
  });

  function enforceLayoutQuality() {
    if (!window.LAYOUT_QUALITY) return;
    const input = {};
    cy.nodes().forEach(node => {
      input[node.id()] = { x: node.position("x"), y: node.position("y") };
    });
    const result = window.LAYOUT_QUALITY.resolve(G.nodes, input);
    cy.batch(() => {
      cy.nodes().forEach(node => {
        const position = result.positions[node.id()];
        if (position) node.position(position);
      });
    });
    if (result.report.sameDomainOverlaps.length || result.report.occlusionViolations.length) {
      console.warn("布局碰撞消解未完全收敛：", result.report);
    }
  }

  function restorePresetLayout() {
    cy.elements().removeClass("hidden");
    if (!ALL_PINNED) {
      const missing = G.nodes.filter(node => !POS[node.id]).map(node => node.id);
      console.error("生产地图缺少预计算坐标，已跳过运行时自动排版：", missing);
    }
    cy.nodes().forEach(node => {
      const position = POS[node.id()];
      if (position) node.position({ x: position[0], y: position[1] });
    });
    enforceLayoutQuality();
    applyFilters();
    fitView();
  }

  function fitView() {
    const vis = cy.nodes().not(".hidden");
    if (!vis.length) return;
    cy.fit(vis, 45);
    // 节点极少时 fit 会把图放得过大
    if (cy.zoom() > 1.5) {
      cy.zoom({ level: 1.5, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
      cy.center(vis);
    }
  }

  const zoomUi = {
    root: document.getElementById("map-zoom"),
    out: document.getElementById("map-zoom-out"),
    level: document.getElementById("map-zoom-level"),
    in: document.getElementById("map-zoom-in")
  };
  const ZOOM_FACTOR = 1.2;

  function updateZoomUi() {
    const zoom = cy.zoom();
    zoomUi.level.value = `${Math.round(zoom * 100)}%`;
    zoomUi.level.textContent = zoomUi.level.value;
    zoomUi.out.disabled = zoom <= cy.minZoom() + 0.001;
    zoomUi.in.disabled = zoom >= cy.maxZoom() - 0.001;
  }

  function changeMapZoom(direction) {
    const current = cy.zoom();
    const target = Math.max(
      cy.minZoom(),
      Math.min(cy.maxZoom(), current * (direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR))
    );
    if (Math.abs(target - current) < 0.001) return;
    cy.stop(true, false);
    cy.zoom({
      level: target,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
    });
  }

  zoomUi.out.addEventListener("click", () => changeMapZoom(-1));
  zoomUi.in.addEventListener("click", () => changeMapZoom(1));
  cy.on("zoom", updateZoomUi);
  updateZoomUi();

  document.addEventListener("keydown", e => {
    const target = e.target;
    const isEditing = target instanceof Element &&
      !!target.closest("input, textarea, select, [contenteditable='true']");
    const zoomOut = e.key === "<" || (e.code === "Comma" && e.shiftKey);
    const zoomIn = e.key === ">" || (e.code === "Period" && e.shiftKey);
    const deepDiveOpen = !document.getElementById("deepdive").classList.contains("hidden");
    if (isEditing || mode !== "graph" || deepDiveOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!zoomOut && !zoomIn) return;
    e.preventDefault();
    changeMapZoom(zoomIn ? 1 : -1);
  });

  /* ───────────────────────── 过滤 ───────────────────────── */

  function applyFilters() {
    cy.batch(() => {
      cy.nodes().forEach(n => {
        const ok = state.domains[n.data("domain")] && inScope(n.id());
        n.toggleClass("hidden", !ok);
      });
      cy.edges().forEach(e => {
        const ok = state.edges[e.data("type")] &&
                   !e.source().hasClass("hidden") && !e.target().hasClass("hidden");
        e.toggleClass("hidden", !ok);
      });
    });
    const visible = cy.nodes().not(".hidden").length;
    document.getElementById("empty-hint").classList.toggle("hidden", visible > 0);
    updateScopeUI();
    applyFocus();
  }

  // 点开一个节点时，把它在完整图里的邻居揭示出来（核心视图下的逐层展开）
  function reveal(id) {
    if (state.scope === "all") return false;
    let added = false;
    const node = cy.getElementById(id);
    if (!node.length) return false;
    node.connectedEdges().forEach(e => {
      [e.source().id(), e.target().id()].forEach(nid => {
        if (!inScope(nid)) { state.revealed.add(nid); added = true; }
      });
    });
    if (!state.revealed.has(id)) state.revealed.add(id);
    return added;
  }

  function updateScopeUI() {
    const total = G.nodes.length;
    const shown = cy.nodes().not(".hidden").length;
    const el = document.getElementById("scope-status");
    if (el) {
      el.textContent = state.scope === "core"
        ? `核心视图 · 显示 ${shown} / ${total}${state.revealed.size ? "（已展开 " + state.revealed.size + "）" : ""}`
        : `全部节点 · ${shown} / ${total}`;
    }
    document.querySelectorAll("[data-scope]").forEach(b =>
      b.classList.toggle("on", b.dataset.scope === state.scope));
    const btn = document.getElementById("scope-collapse");
    if (btn) btn.disabled = state.scope !== "core" || state.revealed.size === 0;
  }

  function applyFocus() {
    const previouslyFocused = cy.elements(".dim, .hl");
    if (!state.focus || !state.selected) {
      if (previouslyFocused.length) previouslyFocused.removeClass("dim hl");
      return;
    }

    cy.batch(() => {
      previouslyFocused.removeClass("dim hl");
      const root = cy.getElementById(state.selected);
      if (!root.length || root.hasClass("hidden")) return;

      let hood = root;
      for (let i = 0; i < state.hops; i++) {
        hood = hood.union(hood.connectedEdges().not(".hidden").connectedNodes().not(".hidden"));
      }
      const hoodEdges = hood.edgesWith(hood).not(".hidden");
      cy.nodes().not(".hidden").not(hood).addClass("dim");
      cy.edges().not(".hidden").not(hoodEdges).addClass("dim");
      hood.addClass("hl");
      hoodEdges.addClass("hl");
    });
  }


  /* ───────────────────────── 详情面板 ───────────────────────── */

  const detail = document.getElementById("detail");
  const detailBody = document.getElementById("detail-body");

  // 详情面板里的所有内联链接统一委托：概念跳转 / 深读页 / 软件教程 / 关联软件
  detailBody.addEventListener("click", async event => {
    const swLink = event.target.closest("[data-library-software]");
    if (swLink) { await setMode("software"); openSoftware(swLink.getAttribute("data-library-software")); return; }
    const goto = event.target.closest("[data-goto]");
    if (goto) {
      if (mode !== "graph") await setMode("graph");
      select(goto.getAttribute("data-goto"), true);
      return;
    }
    const dd = event.target.closest("[data-dd]");
    if (dd) { openDeepDive(dd.getAttribute("data-dd")); return; }
    const tutorial = event.target.closest("[data-tutorial]");
    if (tutorial) { openTutorial(tutorial.getAttribute("data-tutorial")); return; }
  });

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 极简 markdown：**粗体**、`代码`、> 引用、- 列表、空行分段
  // 以及 [[node-id]] —— 内联跳转到另一个概念。知识地图里正文提到的概念
  // 应该能直接点过去，而不是只在侧边的「相关知识」列表里出现。
  function mdLite(text) {
    if (!text) return "";
    const inline = s => esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[\[([a-z0-9-]+)\]\]/g, (m, id) => byId[id]
        ? `<span class="xref" data-goto="${id}">${esc(byId[id].title)}</span>`
        : `<span class="xref-bad" title="没有这个节点">${id}?</span>`);

    return text.split(/\n\n+/).map(block => {
      const lines = block.split("\n");

      // 表格：| a | b |  第二行是 |---|---| 分隔线
      if (lines.length >= 3 && lines[0].trim().startsWith("|") && /^\|[\s:|-]+\|$/.test(lines[1].trim())) {
        const row = (l, tag) => "<tr>" + l.trim().replace(/^\||\|$/g, "").split("|")
          .map(c => `<${tag}>${inline(c.trim())}</${tag}>`).join("") + "</tr>";
        return `<table class="d-table"><thead>${row(lines[0], "th")}</thead><tbody>`
             + lines.slice(2).map(l => row(l, "td")).join("") + "</tbody></table>";
      }

      if (lines.every(l => l.trim().startsWith("- "))) {
        return "<p>" + lines.map(l => inline(l.replace(/^\s*- /, "· "))).join("<br>") + "</p>";
      }
      if (lines[0].trim().startsWith("> ")) {
        return '<p class="quote">' + inline(block.replace(/^\s*> ?/gm, "")) + "</p>";
      }
      return "<p>" + lines.map(inline).join("<br>") + "</p>";
    }).join("");
  }

  function relationsOf(id) {
    const out = [];
    G.edges.forEach(e => {
      if (!byId[e.from] || !byId[e.to]) return;
      if (e.from === id) out.push({ dir: "out", type: e.type, other: e.to, label: e.label });
      else if (e.to === id) out.push({ dir: "in", type: e.type, other: e.from, label: e.label });
    });
    // 关键关系排前面
    return out.sort((a, b) => (KEY_EDGES.indexOf(b.type) - KEY_EDGES.indexOf(a.type)));
  }

  function openDetail(id) {
    const n = byId[id];
    if (!n) return;
    const dom = DOMAINS[n.domain] || { label: n.domain, color: "#888", emoji: "" };
    const evolving = n.maturity === "evolving";

    let h = "";
    const hasDeep = DEEPDIVE_IDS.has(id);
    h += `<div class="d-domain" style="color:${dom.color}">${dom.emoji} ${esc(dom.label)}`
       + (evolving ? `<span class="mat-tag" title="较新、仍在演进的概念">演进中</span>` : "")
       + (hasDeep ? `<button class="dd-open" data-dd="${esc(id)}" title="打开理解原理深读页">📖 理解原理</button>` : "")
       + `</div>`;
    h += `<h2 class="d-title">${esc(n.title)}</h2>`;
    if (n.aliases && n.aliases.length) h += `<div class="d-alias">${n.aliases.map(esc).join(" · ")}</div>`;
    h += `<div class="d-summary">${esc(n.summary || "")}</div>`;

    if (n.body) h += `<div class="d-sec"><h4>详细说明</h4><div class="d-body">${mdLite(n.body)}</div></div>`;

    if (n.cases && n.cases.length) {
      h += `<div class="d-sec"><h4>案例</h4>`;
      n.cases.forEach(c => {
        h += `<div class="case"><div class="case-t">${esc(c.title)}</div>
              <div class="case-x">${mdLite(c.text).replace(/^<p>|<\/p>$/g, "")}</div></div>`;
      });
      h += `</div>`;
    }

    const rels = relationsOf(id);
    h += `<div class="d-sec"><h4>相关知识 <span style="color:var(--fg-faint);font-weight:400">${rels.length}</span></h4>`;
    if (!rels.length) h += `<div class="d-empty">暂无关联</div>`;
    rels.forEach(r => {
      const t = ETYPES[r.type] || { label: r.type, color: "#888" };
      const arrow = r.dir === "out" ? "→" : "←";
      h += `<div class="rel">
              <span class="rel-type" style="background:${t.color}">${esc(t.label)}</span>
              <span style="color:var(--fg-faint)">${arrow}</span>
              <span class="rel-to" data-goto="${esc(r.other)}">${esc(byId[r.other].title)}</span>
              ${r.label ? `<span class="rel-lbl">${esc(r.label)}</span>` : ""}
            </div>`;
    });
    h += `</div>`;

    if (n.activity && n.activity.length) {
      h += `<div class="d-sec"><h4>动态 · 活跃层</h4>`;
      n.activity.forEach(a => {
        h += `<div class="act"><div class="act-d">${esc(a.date)}</div>
              <div class="act-t">${esc(a.title)}</div>
              <div class="act-x">${esc(a.text)}</div></div>`;
      });
      h += `</div>`;
    }

    if (n.sources && n.sources.length) {
      h += `<div class="d-sec"><h4>来源</h4>`;
      n.sources.forEach(s => {
        h += `<div class="src">${s.ref
          ? `<a href="${esc(s.ref)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`
          : esc(s.title)}</div>`;
      });
      h += `</div>`;
    }

    detailBody.innerHTML = h;
    detail.classList.remove("closed");
    detailBody.scrollTop = 0;
    // 内联链接由 detailBody 的委托监听统一处理
    if (hasDeep) ensureDeepDive(id).catch(error => console.warn(error.message));
  }

  /* ───────────────────── 理解原理（深读页） ───────────────────── */

  const ddEl = document.getElementById("deepdive");

  let deepDiveRequestToken = 0;

  async function openDeepDive(id) {
    if (!ddEl || !DEEPDIVE_IDS.has(id)) return;
    const token = ++deepDiveRequestToken;
    activeDeepDiveId = id;
    document.getElementById("dd-top-name").textContent = byId[id] ? byId[id].title : id;
    document.getElementById("dd-article").innerHTML =
      '<div class="dd-loading" role="status">正在加载理解原理页…</div>';
    ddEl.classList.remove("dd-provisional");
    ddEl.classList.remove("hidden");
    ddEl.querySelector(".dd-scroll").scrollTop = 0;

    let dd;
    try {
      dd = await ensureDeepDive(id);
    } catch (error) {
      if (token !== deepDiveRequestToken) return;
      document.getElementById("dd-article").innerHTML =
        `<div class="dd-loading dd-loading-error" role="alert">${esc(error.message)}，请返回后重试。</div>`;
      return;
    }
    if (token !== deepDiveRequestToken || activeDeepDiveId !== id) return;
    const provisionalPublication = dd.publication
      && dd.publication.status === "published-provisional"
      ? dd.publication
      : null;
    ddEl.classList.toggle("dd-provisional", Boolean(provisionalPublication));
    const provisionalNotice = provisionalPublication
      ? `<div class="dd-provisional-notice" role="status">
          <strong>${esc(provisionalPublication.label || "未通过审计 · 暂行版本")}</strong>
          <span>该页面已覆盖旧正式页，但尚未通过质量审计${Number.isInteger(provisionalPublication.blockerCount) ? `，当前记录 ${provisionalPublication.blockerCount} 个阻断项` : ""}。</span>
        </div>`
      : "";
    const hero = `<div class="dd-hero">
        <div class="dd-eyebrow">理解原理 · CONCEPT DEEP DIVE</div>
        <h1 class="dd-h1${provisionalPublication ? " dd-h1-provisional" : ""}">${esc(dd.title)}</h1>
        ${provisionalNotice}
        ${dd.subtitle ? `<div class="dd-sub">${esc(dd.subtitle)}</div>` : ""}
        ${dd.aliases ? `<div class="dd-ali">${esc(dd.aliases)}</div>` : ""}
        ${dd.meta ? `<div class="dd-metabar">${esc(dd.meta)}</div>` : ""}
        ${dd.thesis ? `<div class="dd-thesis"><span class="dd-thesis-l">核心命题</span> ${dd.thesis}</div>` : ""}
      </div>`;
    document.getElementById("dd-top-name").textContent = dd.title;
    document.getElementById("dd-article").innerHTML = hero + (dd.html || "") + learningButtonHtml(id);
    bindLearningButton();
    ddEl.querySelector(".dd-scroll").scrollTop = 0;
    preloadRecommendedNeighbors(id);
  }

  function closeDeepDive() {
    deepDiveRequestToken++;
    if (ddEl) {
      ddEl.classList.add("hidden");
      ddEl.classList.remove("dd-provisional");
    }
    activeDeepDiveId = null;
  }

  // 仅在本地质量审计查询参数存在时暴露稳定测试入口；正常页面不增加全局 API。
  if (new URLSearchParams(window.location.search).has("quality-audit")) {
    window.__DEEPDIVE_QUALITY_AUDIT__ = { open: openDeepDive, close: closeDeepDive };
  }

  if (ddEl) {
    document.getElementById("dd-back").addEventListener("click", closeDeepDive);
    document.getElementById("dd-close").addEventListener("click", closeDeepDive);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !ddEl.classList.contains("hidden")) closeDeepDive();
    });
  }

  let viewportMoveToken = 0;

  function centerOnNode(node, afterDetailResize) {
    const token = ++viewportMoveToken;
    const move = () => {
      if (token !== viewportMoveToken || state.selected !== node.id()) return;
      cy.stop(true, false);
      cy.animate(
        { center: { eles: node } },
        {
          duration: officialPathActive ? 160 : 300,
          easing: "ease-out",
          queue: false
        }
      );
    };

    if (!afterDetailResize) {
      move();
      return;
    }

    // 第一次打开详情栏会让地图容器缩窄 400px。等两帧让 flex 布局与画布尺寸
    // 先稳定，再居中；否则布局变化和视口动画抢同一批帧，表现为第一次点击卡顿。
    requestAnimationFrame(() => {
      if (token !== viewportMoveToken) return;
      cy.resize();
      requestAnimationFrame(move);
    });
  }

  function select(id, jumped) {
    const node = cy.getElementById(id);
    if (!node.length) return;
    const n = byId[id];
    let changed = false;
    // 跳转到被过滤掉的节点时，自动打开它所在的大区、并揭示它
    if (jumped && n) {
      if (!state.domains[n.domain]) { state.domains[n.domain] = true; changed = true; }
      if (!inScope(id)) { state.revealed.add(id); changed = true; }
    }
    // 核心视图下，点开一个节点就揭开它的邻居
    if (reveal(id)) changed = true;
    if (changed) { syncControls(); applyFilters(); }
    state.selected = id;
    cy.nodes(".sel").removeClass("sel");
    node.addClass("sel");
    if (state.focus) applyFocus();
    const detailWasClosed = detail.classList.contains("closed");
    openDetail(id);
    centerOnNode(node, detailWasClosed);
  }

  document.getElementById("detail-close").addEventListener("click", () => {
    viewportMoveToken++;
    cy.stop(true, false);
    detail.classList.add("closed");
    state.selected = null;
    cy.nodes(".sel").removeClass("sel");
    applyFocus();
    requestAnimationFrame(() => cy.resize());
  });

  cy.on("tap", "node", evt => select(evt.target.id(), false));
  cy.on("tap", evt => {
    if (evt.target === cy) {
      state.selected = null;
      cy.nodes(".sel").removeClass("sel");
      applyFocus();
    }
  });

  /* ───────────────────────── 控制栏 ───────────────────────── */

  // 大区
  const domList = document.getElementById("domain-list");
  Object.entries(DOMAINS).forEach(([key, d]) => {
    const domainNodes = G.nodes.filter(n => n.domain === key).sort((a, b) => {
      const aIndex = RECOMMENDED_INDEX.has(a.id) ? RECOMMENDED_INDEX.get(a.id) : Number.MAX_SAFE_INTEGER;
      const bIndex = RECOMMENDED_INDEX.has(b.id) ? RECOMMENDED_INDEX.get(b.id) : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex || a.title.localeCompare(b.title, "zh-CN");
    });
    const listId = `domain-nodes-${key}`;
    const group = document.createElement("div");
    group.className = "domain-group";
    group.innerHTML = `<div class="domain-row">
        <label class="chk domain-filter">
          <input type="checkbox" data-domain="${esc(key)}" checked>
          <span class="dot" style="background:${d.color}"></span>
          <span class="domain-label">${esc(d.label)}</span><em>${domainNodes.length || ""}</em>
        </label>
        <button type="button" class="domain-expand" data-domain-toggle="${esc(key)}"
          aria-expanded="false" aria-controls="${esc(listId)}" aria-label="展开${esc(d.label)}节点">
          <span aria-hidden="true">⌄</span>
        </button>
      </div>
      <div id="${esc(listId)}" class="domain-node-list" hidden>
        ${domainNodes.map(node => `<button type="button" class="domain-node" data-domain-node="${esc(node.id)}">
          <span class="dot" style="background:${d.color}"></span><span>${esc(node.title)}</span>
        </button>`).join("")}
      </div>`;
    domList.appendChild(group);
  });
  domList.addEventListener("click", event => {
    const toggle = event.target.closest("[data-domain-toggle]");
    if (toggle) {
      const list = document.getElementById(toggle.getAttribute("aria-controls"));
      const expanded = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.setAttribute("aria-label",
        `${expanded ? "收起" : "展开"}${DOMAINS[toggle.dataset.domainToggle].label}节点`);
      if (list) list.hidden = !expanded;
      return;
    }
    const nodeButton = event.target.closest("[data-domain-node]");
    if (nodeButton) select(nodeButton.dataset.domainNode, true);
  });
  initLearningPanel();
  document.querySelector("#official-path-toggle em").textContent =
    `${RECOMMENDED_PATH.length} 节点 · ${(G.recommendedLearningPath || []).length} 层`;
  document.getElementById("official-path-toggle").addEventListener("click", () =>
    setOfficialPath(!officialPathActive));

  // 关系类型
  const edgeList = document.getElementById("edge-list");
  Object.entries(ETYPES).forEach(([key, t]) => {
    const count = G.edges.filter(e => e.type === key).length;
    const lab = document.createElement("label");
    lab.className = "chk";
    lab.innerHTML = `<input type="checkbox" data-edge="${key}" checked>
                     <span class="dash" style="border-color:${t.color}"></span>${t.label}<em>${count || ""}</em>`;
    edgeList.appendChild(lab);
  });
  const edgeSectionToggle = document.getElementById("edge-section-toggle");
  const edgeSectionContent = document.getElementById("edge-section-content");
  edgeSectionToggle.addEventListener("click", () => {
    const expanded = edgeSectionToggle.getAttribute("aria-expanded") !== "true";
    edgeSectionToggle.setAttribute("aria-expanded", String(expanded));
    edgeSectionContent.hidden = !expanded;
  });

  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.domain) { state.domains[t.dataset.domain] = t.checked; applyFilters(); }
    if (t.dataset.edge)   { state.edges[t.dataset.edge] = t.checked; applyFilters(); }
    if (t.id === "focus-on") { state.focus = t.checked; applyFocus(); }
  });

  document.getElementById("focus-hops").addEventListener("input", e => {
    state.hops = +e.target.value;
    document.getElementById("hops-val").textContent = state.hops;
    applyFocus();
  });

  function setEdges(pred) {
    Object.keys(ETYPES).forEach(k => { state.edges[k] = pred(k); });
    syncControls();
    applyFilters();
  }
  // 视图范围：核心 / 全部
  document.querySelectorAll("[data-scope]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.scope = btn.dataset.scope;
      applyFilters();
      fitView();
    });
  });
  document.getElementById("scope-collapse").addEventListener("click", () => {
    state.revealed.clear();
    // 收起后如果选中的节点也被收走了，一并取消选中
    if (state.selected && !inScope(state.selected)) {
      state.selected = null;
      cy.nodes().removeClass("sel");
      detail.classList.add("closed");
    }
    applyFilters();
    fitView();
  });

  document.getElementById("edge-all").addEventListener("click", () => setEdges(() => true));
  document.getElementById("edge-none").addEventListener("click", () => setEdges(() => false));
  document.getElementById("edge-key").addEventListener("click", () => setEdges(k => KEY_EDGES.includes(k)));

  function syncControls() {
    document.querySelectorAll("[data-domain]").forEach(i => { i.checked = state.domains[i.dataset.domain]; });
    document.querySelectorAll("[data-edge]").forEach(i => { i.checked = state.edges[i.dataset.edge]; });
  }

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (officialPathActive) setOfficialPath(false);
    Object.keys(state.domains).forEach(k => { state.domains[k] = true; });
    Object.keys(state.edges).forEach(k => { state.edges[k] = true; });
    state.scope = CORE.size ? "core" : "all";
    state.revealed.clear();
    state.selected = null;
    cy.nodes().removeClass("sel");
    detail.classList.add("closed");
    syncControls();
    applyFilters();
    restorePresetLayout();
  });

  document.getElementById("btn-panel").addEventListener("click", () => {
    document.getElementById("controls").classList.toggle("hidden");
    setTimeout(() => cy.resize(), 50);
  });

  /* ───────────────────────── 搜索 ───────────────────────── */

  const search = document.getElementById("search");
  const results = document.getElementById("search-results");

  function doSearch() {
    const q = search.value.trim().toLowerCase();
    if (!q) { results.classList.remove("open"); return; }
    const hits = G.nodes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.aliases || []).some(a => a.toLowerCase().includes(q)) ||
      (n.summary || "").toLowerCase().includes(q)
    ).slice(0, 12);

    results.innerHTML = hits.length
      ? hits.map(n => `<div class="sr-item" data-id="${esc(n.id)}">
            <div class="sr-title">${esc(n.title)}</div>
            <div class="sr-sum">${esc(n.summary || "")}</div></div>`).join("")
      : `<div class="sr-none">没有匹配的概念</div>`;
    results.classList.add("open");
  }

  // 搜索结果点击统一委托到结果容器
  results.addEventListener("click", event => {
    const item = event.target.closest(".sr-item");
    if (!item) return;
    select(item.dataset.id, true);
    results.classList.remove("open");
    search.value = "";
  });

  search.addEventListener("input", debounce(doSearch, 120));
  search.addEventListener("keydown", e => {
    if (e.key === "Escape") { results.classList.remove("open"); search.blur(); }
    if (e.key === "Enter") {
      const first = results.querySelector(".sr-item");
      if (first) first.click();
    }
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) results.classList.remove("open");
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
  });

  /* ───────────────────────── 图例与启动 ───────────────────────── */

  document.getElementById("legend").innerHTML =
    `<b>节点填充</b> = 大区 &nbsp;·&nbsp; <b>大小</b> = 热度 &nbsp;·&nbsp; <b>虚线描边</b> = 演进中<br>` +
    `<b>连线颜色</b> = 关系类型 &nbsp;·&nbsp; 点击节点查看详情`;

  document.getElementById("meta-ver").textContent =
    `${G.meta.version} · ${G.meta.updatedAt}`;

  applyFilters();
  restorePresetLayout();

  /* ───────────────────────── 软件模式 ───────────────────────── */
  // 软件目录、教程与资料库数据不在首屏加载，切到对应视图时按需注入。
  let SW = window.SOFTWARE || null;
  let TUTORIALS = window.TUTORIALS || null;
  let LIBRARY = window.PRO_LIBRARY || null;
  let LIBRARY_PROFILES = window.LIBRARY_PLATFORM_PROFILES || {};
  let LIBRARY_PROFILE_GUIDANCE = window.LIBRARY_PROFILE_GUIDANCE || {};
  let mode = "graph";               // graph | software | library
  const swView = document.getElementById("software-view");
  const libraryView = document.getElementById("library-view");
  let swBuilt = false;
  let libraryBuilt = false;
  let libraryClass = "all";
  let librarySubcategory = "all";
  let libraryQuery = "";

  const DATA_BUNDLES = {
    software: [
      "data/software.js",
      "data/tutorials.js",
      "data/tutorials-codex-youtube.js",
      "data/tutorials-claude-code.js",
      "data/tutorials-video-generated.js"
    ],
    library: [
      "data/library.js",
      "data/library-official-technical.js",
      "data/library-platform-profiles.js",
      "data/software.js"
    ]
  };

  // 顺序加载某个视图的数据包（幂等：脚本只会真正加载一次），再刷新对应全局引用。
  async function ensureBundle(name) {
    await loadScriptsInOrder(DATA_BUNDLES[name] || []);
    if (name === "software") {
      SW = window.SOFTWARE || SW;
      TUTORIALS = window.TUTORIALS || TUTORIALS;
    } else if (name === "library") {
      LIBRARY = window.PRO_LIBRARY || LIBRARY;
      LIBRARY_PROFILES = window.LIBRARY_PLATFORM_PROFILES || LIBRARY_PROFILES;
      LIBRARY_PROFILE_GUIDANCE = window.LIBRARY_PROFILE_GUIDANCE || LIBRARY_PROFILE_GUIDANCE;
      SW = window.SOFTWARE || SW;   // 资料条目里的关联软件需要软件数据
    }
  }

  // 软件卡片点击统一委托到软件视图容器
  swView.addEventListener("click", event => {
    const card = event.target.closest("[data-sw]");
    if (card) openSoftware(card.getAttribute("data-sw"));
  });

  const scheduleLibraryRender = debounce(() => renderLibraryItems(), 120);

  // 资料库内所有交互统一委托到资料库视图容器
  libraryView.addEventListener("click", event => {
    const item = event.target.closest("[data-library-item]");
    if (item) { openLibraryItem(item.getAttribute("data-library-item")); return; }
    const cls = event.target.closest("[data-library-class]");
    if (cls) {
      libraryClass = cls.getAttribute("data-library-class");
      librarySubcategory = "all";
      libraryView.querySelectorAll("[data-library-class]").forEach(button => button.classList.toggle("active", button === cls));
      renderLibrarySubcategories();
      renderLibraryItems();
      return;
    }
    const sub = event.target.closest("[data-library-subcategory]");
    if (sub) {
      librarySubcategory = sub.getAttribute("data-library-subcategory");
      renderLibrarySubcategories();
      renderLibraryItems();
    }
  });
  libraryView.addEventListener("keydown", event => {
    const item = event.target.closest("[data-library-item]");
    if (item && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openLibraryItem(item.getAttribute("data-library-item")); }
  });
  libraryView.addEventListener("change", event => {
    const dropdown = event.target.closest(".lib-sub-select");
    if (!dropdown || !dropdown.value) return;
    [libraryClass, librarySubcategory] = dropdown.value.split("::");
    libraryView.querySelectorAll("[data-library-class]").forEach(button =>
      button.classList.toggle("active", button.getAttribute("data-library-class") === libraryClass));
    renderLibrarySubcategories();
    renderLibraryItems();
  });
  libraryView.addEventListener("input", event => {
    const searchInput = event.target.closest(".lib-search");
    if (!searchInput) return;
    libraryQuery = searchInput.value;
    scheduleLibraryRender();
  });

  function buildSoftware() {
    if (swBuilt || !SW) return;
    const catItems = {};
    SW.categories.forEach(c => { catItems[c.id] = []; });
    SW.items.forEach(it => { (catItems[it.cat] || (catItems[it.cat] = [])).push(it); });
    let h = `<div class="sw-head"><h2>AI 软件目录</h2>
      <p>手工精选、按功能分类的著名 AI 软件。点软件看详情，详情里的<span class="xref">蓝字概念</span>可跳回知识地图。</p></div>`;
    SW.categories.forEach(c => {
      const items = catItems[c.id] || [];
      if (!items.length) return;
      h += `<section class="sw-cat"><h3 style="color:${c.color}">${c.emoji} ${esc(c.label)}<em>${items.length}</em></h3><div class="sw-grid">`;
      items.forEach(it => {
        h += `<div class="sw-card" data-sw="${esc(it.id)}" style="border-left-color:${c.color}">
          <div class="sw-name">${esc(it.name)}</div>
          <div class="sw-by">${esc(it.by || "")}</div>
          <div class="sw-sum">${esc(it.summary || "")}</div></div>`;
      });
      h += `</div></section>`;
    });
    swView.innerHTML = h;
    // 卡片点击由 swView 的委托监听统一处理
    swBuilt = true;
  }

  function openSoftware(id) {
    const it = (SW.items || []).find(x => x.id === id);
    if (!it) return;
    const cat = SW.categories.find(c => c.id === it.cat) || { label: "", color: "#888", emoji: "" };
    const hasTutorial = !!(TUTORIALS && TUTORIALS.items && TUTORIALS.items[id]);
    let h = `<div class="d-domain" style="color:${cat.color}">${cat.emoji} ${esc(cat.label)}`
          + (it.by ? `<span style="color:var(--fg-faint)"> · ${esc(it.by)}</span>` : "")
          + (hasTutorial ? `<button class="dd-open" data-tutorial="${esc(id)}" title="打开软件使用教程">🎓 使用教程</button>` : "")
          + `</div>`;
    h += `<h2 class="d-title">${esc(it.name)}</h2>`;
    h += `<div class="d-summary">${esc(it.summary || "")}</div>`;
    if (it.body) h += `<div class="d-sec"><div class="d-body">${mdLite(it.body)}</div></div>`;
    if (Array.isArray(it.models) && it.models.length) {
      h += `<div class="d-sec"><h4>当前主要模型 <span class="d-asof">· 截至 2026-07</span></h4><div class="d-models">`
        + it.models.map(m => `<div class="d-model"><b>${esc(m.name)}</b>${m.note ? `<span>${esc(m.note)}</span>` : ""}</div>`).join("")
        + `</div></div>`;
    }
    if (it.concept && byId[it.concept]) {
      h += `<div class="d-sec"><h4>背后的概念</h4>
        <div class="rel"><span class="rel-to" data-goto="${esc(it.concept)}">${esc(byId[it.concept].title)}</span>
        <span class="rel-lbl">在知识地图里查看</span></div></div>`;
    }
    detailBody.innerHTML = h;
    detail.classList.remove("closed");
    detailBody.scrollTop = 0;
    // 正文/概念链接、使用教程按钮由 detailBody 的委托监听统一处理
  }

  function openTutorial(id) {
    const t = TUTORIALS && TUTORIALS.items && TUTORIALS.items[id];
    if (!t || !ddEl) return;
    let body = `<div class="dd-hero">
        <div class="dd-eyebrow">使用教程 · SOFTWARE GUIDE</div>
        <h1 class="dd-h1">${esc(t.title)}</h1>
        ${t.subtitle ? `<div class="dd-sub">${esc(t.subtitle)}</div>` : ""}
        ${t.meta ? `<div class="dd-metabar">${esc(t.meta)}</div>` : ""}
        ${t.overview ? `<div class="dd-thesis"><span class="dd-thesis-l">核心方法</span> ${esc(t.overview)}</div>` : ""}
      </div>`;

    if (Array.isArray(t.learningPath) && t.learningPath.length) {
      body += `<section class="dd-sec tutorial-learning"><h2>建议学习顺序</h2><ol class="dd-chain">`
        + t.learningPath.map(x => `<li>${esc(x)}</li>`).join("") + `</ol></section>`;
    }

    const platforms = TUTORIALS.platforms || [];
    const firstPopulated = platforms.find(p => (t.resources || []).some(r => r.platform === p.id));
    const initialPlatform = firstPopulated ? firstPopulated.id : (platforms[0] && platforms[0].id);
    body += `<div class="tutorial-layout">
      <nav class="tutorial-sidebar" aria-label="教程平台">
        <div class="tutorial-sidebar-title">资源平台</div>
        ${platforms.map(p => {
          const count = (t.resources || []).filter(r => r.platform === p.id).length;
          return `<button class="tutorial-platform-btn${p.id === initialPlatform ? " active" : ""}" type="button" data-platform="${esc(p.id)}" style="--platform-color:${p.color}">
            <span class="tutorial-platform-label"><span>${p.emoji}</span>${esc(p.label)}</span><span class="tutorial-count">${count}</span>
          </button>`;
        }).join("")}
      </nav>
      <div class="tutorial-platform-content" id="tutorial-platform-content"></div>
    </div>`;

    if (t.sourceNote) body += `<div class="dd-src"><b>提炼范围与时效说明</b><p>${esc(t.sourceNote)}</p>
      ${(t.officialSources || []).length ? `<b>操作校准来源</b><ul>${t.officialSources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)}</a></li>`).join("")}</ul>` : ""}
      ${t.accessDate ? `<div class="dd-src-date">访问日期：${esc(t.accessDate)}</div>` : ""}</div>`;
    document.getElementById("dd-top-name").textContent = t.title;
    document.getElementById("dd-article").innerHTML = body;

    const contentEl = document.getElementById("tutorial-platform-content");
    const renderPlatform = platformId => {
      const p = platforms.find(item => item.id === platformId);
      if (!p || !contentEl) return;
      const resources = (t.resources || []).filter(r => r.platform === p.id);
      let html = `<section class="tutorial-platform"><header class="tutorial-platform-head">
        <div><div class="tutorial-platform-kicker">当前平台</div><h2>${p.emoji} ${esc(p.label)}</h2></div>
        <span>${resources.length} 条已复核教程</span>
      </header>`;
      if (!resources.length) {
        html += `<div class="tutorial-empty">尚未收录经过复核的 ${esc(p.label)} 教程。你仍可通过左侧栏切换其他平台。</div></section>`;
        contentEl.innerHTML = html;
        return;
      }
      resources.forEach((r, idx) => {
        const coverage = (r.coverage || []).map(item => `<section class="tutorial-action">
          <h5>${esc(item.title)}</h5>
          ${(item.steps || []).length ? `<ol>${item.steps.map(step => `<li>${esc(step)}</li>`).join("")}</ol>` : ""}
          ${item.done ? `<div class="tutorial-done"><b>完成标志</b>${esc(item.done)}</div>` : ""}
        </section>`).join("");
        const unique = (r.uniqueTechniques || []).map(item => `<section class="tutorial-unique">
          <h5>${esc(item.title)}</h5>
          ${item.scenario ? `<p><b>适用场景：</b>${esc(item.scenario)}</p>` : ""}
          ${(item.steps || []).length ? `<ol>${item.steps.map(step => `<li>${esc(step)}</li>`).join("")}</ol>` : ""}
          ${item.result ? `<div class="tutorial-done"><b>最终得到</b>${esc(item.result)}</div>` : ""}
        </section>`).join("");
        html += `<details class="tutorial-card" style="border-left-color:${p.color}"${idx === 0 ? " open" : ""}>
          <summary class="tutorial-card-head"><div>
            <h3>${esc(r.title)}</h3>
            <div class="tutorial-meta">${esc(r.creator || "")} · ${esc(r.publishedAt || "")}${r.duration ? ` · ${esc(r.duration)}` : ""}</div>
          </div><span class="tutorial-expand" aria-hidden="true">⌄</span></summary>
          <div class="tutorial-card-body">
            ${r.audience ? `<div class="tutorial-audience"><b>适合：</b>${esc(r.audience)}</div>` : ""}
            ${r.summary ? `<h4>完整内容总结</h4><p class="tutorial-summary">${esc(r.summary)}</p>` : ""}
            ${coverage ? `<h4>视频教授的完整操作</h4><div class="tutorial-actions">${coverage}</div>` : ""}
            ${unique ? `<h4>独门内容 <span>· 相对本页其他四条教程</span></h4><div class="tutorial-uniques">${unique}</div>` : ""}
            ${r.caution ? `<div class="dd-note warn"><b>复核提醒</b>　${esc(r.caution)}</div>` : ""}
            <a class="tutorial-link" href="${esc(r.url)}" target="_blank" rel="noopener">在 ${esc(p.label)} 打开原教程 ↗</a>
          </div>
        </details>`;
      });
      contentEl.innerHTML = html + `</section>`;
    };

    ddEl.querySelectorAll(".tutorial-platform-btn").forEach(btn => btn.addEventListener("click", () => {
      ddEl.querySelectorAll(".tutorial-platform-btn").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      renderPlatform(btn.getAttribute("data-platform"));
    }));
    if (initialPlatform) renderPlatform(initialPlatform);
    ddEl.classList.remove("hidden");
    ddEl.querySelector(".dd-scroll").scrollTop = 0;
  }

  function libraryClassById(id) {
    return LIBRARY && (LIBRARY.sourceClasses || []).find(item => item.id === id);
  }

  function librarySubcategoryById(source, id) {
    return source && (source.subcategories || []).find(item => item.id === id);
  }

  function libraryPlatformProfile(source, subcategory) {
    return source && subcategory && LIBRARY_PROFILES[`${source.id}/${subcategory.id}`];
  }

  function libraryPlatformProfileHtml(source) {
    if (!source || librarySubcategory === "all") return "";
    const subcategory = librarySubcategoryById(source, librarySubcategory);
    const profile = libraryPlatformProfile(source, subcategory);
    if (!subcategory || !profile) return "";
    const guidance = LIBRARY_PROFILE_GUIDANCE[source.id] || {};
    const overview = profile.overview || `${profile.positioning}${profile.background}其运营或维护主体为${profile.organization}；关于创始或发起团队：${profile.foundingTeam}`;
    const strengths = profile.strengths || guidance.strengths || [];
    const offers = profile.offers || guidance.offers || [];
    const howToUse = profile.howToUse || guidance.howToUse || [];
    const caution = profile.caution || guidance.caution || "";
    const website = profile.website
      ? `<a class="lib-profile-link" href="${esc(profile.website)}" target="_blank" rel="noopener">访问官方网站 ↗</a>`
      : `<span class="lib-profile-no-link">集合型来源 · 无统一网址</span>`;
    return `<article class="lib-platform-profile" aria-labelledby="lib-profile-title">
      <header class="lib-profile-title">
        <div><span>${profile.kind === "collection" ? "来源集合" : "平台档案"}</span><h3 id="lib-profile-title">${esc(subcategory.label)}</h3></div>
        ${website}
      </header>
      <div class="lib-profile-intro">
        <span>正式介绍</span>
        <p>${esc(overview)}</p>
      </div>
      <section class="lib-profile-strengths"><h4>平台优势与特征</h4><div>${strengths.map(item => `<p>${esc(item)}</p>`).join("")}</div></section>
      <dl class="lib-profile-facts">
        <div><dt>发展背景</dt><dd>${esc(profile.background)}</dd></div>
        <div><dt>相关公司 / 组织</dt><dd>${esc(profile.organization)}</dd></div>
        <div><dt>创始人 / 发起团队</dt><dd>${esc(profile.foundingTeam)}</dd></div>
      </dl>
      <div class="lib-profile-sections">
        <section><h4>这个网站主要提供什么</h4><ul>${offers.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
        <section><h4>在资料库中如何使用</h4><ul>${howToUse.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
      </div>
      ${caution ? `<aside class="lib-profile-caution"><b>使用边界</b><p>${esc(caution)}</p></aside>` : ""}
      <footer>资料复核日期：${esc(profile.reviewedAt)}</footer>
    </article>`;
  }

  function renderLibrarySubcategories() {
    const container = libraryView && libraryView.querySelector(".lib-subnav");
    if (!container || !LIBRARY) return;
    const source = libraryClassById(libraryClass);
    if (!source) {
      const options = (LIBRARY.sourceClasses || []).map(group =>
        `<optgroup label="${esc(group.order + ". " + group.label)}">${(group.subcategories || []).map(sub =>
          `<option value="${esc(group.id + "::" + sub.id)}">${esc(sub.label)} — ${esc(sub.short)}</option>`).join("")}</optgroup>`).join("");
      container.innerHTML = `<div class="lib-subnav-head"><div><b>二级来源</b><span>共 ${(LIBRARY.sourceClasses || []).reduce((sum, group) => sum + (group.subcategories || []).length, 0)} 个平台与来源集合</span></div></div>
        <div class="lib-sub-overview"><span>选择一个具体平台，会同时定位到它所属的一级来源。</span>
          <select class="lib-sub-select" aria-label="选择二级来源"><option value="">浏览全部二级来源…</option>${options}</select>
        </div>`;
      // change 事件由 libraryView 的委托监听统一处理
      return;
    }
    const counts = {};
    (LIBRARY.items || []).filter(item => item.sourceClass === source.id)
      .forEach(item => { counts[item.sourceSubcategory] = (counts[item.sourceSubcategory] || 0) + 1; });
    container.innerHTML = `<div class="lib-subnav-head"><div><b>${source.order}. ${esc(source.label)} · 二级来源</b><span>${esc(source.short)}</span></div><em>${(source.subcategories || []).length} 个</em></div>
      <div class="lib-subchips">
        <button class="lib-subchip${librarySubcategory === "all" ? " active" : ""}" type="button" data-library-subcategory="all">全部 <span>${(LIBRARY.items || []).filter(item => item.sourceClass === source.id).length}</span></button>
        ${(source.subcategories || []).map(sub => `<button class="lib-subchip${librarySubcategory === sub.id ? " active" : ""}" type="button" data-library-subcategory="${esc(sub.id)}" title="${esc(sub.short)}">${esc(sub.label)} <span>${counts[sub.id] || 0}</span></button>`).join("")}
      </div>${libraryPlatformProfileHtml(source)}`;
    // 二级来源筛选点击由 libraryView 的委托监听统一处理
  }

  function renderLibraryItems() {
    if (!LIBRARY || !libraryView) return;
    const grid = libraryView.querySelector(".lib-grid");
    const note = libraryView.querySelector(".lib-filter-note");
    if (!grid) return;
    const query = libraryQuery.trim().toLocaleLowerCase("zh-CN");
    const items = (LIBRARY.items || []).filter(item => {
      if (libraryClass !== "all" && item.sourceClass !== libraryClass) return false;
      if (librarySubcategory !== "all" && item.sourceSubcategory !== librarySubcategory) return false;
      if (!query) return true;
      const source = libraryClassById(item.sourceClass);
      const subcategory = librarySubcategoryById(source, item.sourceSubcategory);
      return [item.title, item.publisher, item.collection, item.contentKind, item.summary, source && source.label, subcategory && subcategory.label]
        .concat(item.tags || []).join(" ").toLocaleLowerCase("zh-CN").includes(query);
    });
    if (note) note.textContent = `${items.length} 条资料`;
    grid.innerHTML = items.length ? items.map(item => {
      const source = libraryClassById(item.sourceClass) || { label: item.sourceClass, color: "#7aa2d8" };
      const subcategory = librarySubcategoryById(source, item.sourceSubcategory) || { label: item.sourceSubcategory };
      return `<article class="lib-card" data-library-item="${esc(item.id)}" style="--source-color:${source.color}" tabindex="0">
        <div class="lib-card-top">
          <span class="lib-badge">${esc(source.label)}</span>
          <span class="lib-subbadge">${esc(subcategory.label)}</span>
          ${item.discoveryOnly ? `<span class="lib-discovery">仅作发现</span>` : ""}
          <span class="lib-tier">${esc(item.authorityTier)}</span>
        </div>
        <h3 class="lib-title">${esc(item.title)}</h3>
        <div class="lib-publisher">${esc(item.publisher)} · ${esc(item.contentKind)}</div>
        <p class="lib-summary">${esc(item.summary)}</p>
        <div class="lib-card-foot">${(item.tags || []).slice(0, 4).map(tag => `<span class="lib-tag">${esc(tag)}</span>`).join("")}</div>
      </article>`;
    }).join("") : `<div class="lib-empty">当前来源分类和搜索条件下没有资料。</div>`;
    // 卡片点击 / 键盘由 libraryView 的委托监听统一处理
  }

  function buildLibrary() {
    if (libraryBuilt || !LIBRARY || !libraryView) return;
    const counts = {};
    (LIBRARY.items || []).forEach(item => { counts[item.sourceClass] = (counts[item.sourceClass] || 0) + 1; });
    libraryView.innerHTML = `<header class="lib-head">
      <div><h2>专业资料库</h2><p>按信息来源分类，保留证据用途、适用边界和与知识地图的关联。</p></div>
      <div class="lib-count">9 类一级来源 · ${(LIBRARY.sourceClasses || []).reduce((sum, source) => sum + (source.subcategories || []).length, 0)} 个二级来源 · ${(LIBRARY.items || []).length} 条种子资料</div>
    </header>
    <div class="lib-layout">
      <nav class="lib-sources" aria-label="资料来源分类">
        <button class="lib-source active" type="button" data-library-class="all" style="--source-color:var(--accent)">
          <span class="lib-source-order">ALL</span><span class="lib-source-label">全部来源</span><span class="lib-source-count">${(LIBRARY.items || []).length}</span>
        </button>
        ${(LIBRARY.sourceClasses || []).map(source => `<button class="lib-source" type="button" data-library-class="${esc(source.id)}" style="--source-color:${source.color}">
          <span class="lib-source-order">${source.order}</span><span class="lib-source-label">${esc(source.label)}</span><span class="lib-source-count">${counts[source.id] || 0}</span>
        </button>`).join("")}
      </nav>
      <section class="lib-content">
        <div class="lib-subnav"></div>
        <div class="lib-toolbar">
          <input class="lib-search" type="search" placeholder="搜索标题、发布者、资料形式或标签" aria-label="搜索专业资料">
          <span class="lib-filter-note"></span>
        </div>
        <div class="lib-grid"></div>
      </section>
    </div>`;
    // 一级来源点击与搜索输入由 libraryView 的委托监听统一处理
    libraryBuilt = true;
    renderLibrarySubcategories();
    renderLibraryItems();
  }

  function openLibraryItem(id) {
    const item = LIBRARY && (LIBRARY.items || []).find(entry => entry.id === id);
    if (!item) return;
    const source = libraryClassById(item.sourceClass) || { label: item.sourceClass, color: "#7aa2d8" };
    const subcategory = librarySubcategoryById(source, item.sourceSubcategory) || { label: item.sourceSubcategory };
    const linkedNodes = (item.linkedNodes || []).filter(nodeId => byId[nodeId]);
    const linkedSoftware = (item.linkedSoftware || []).map(softwareId =>
      SW && (SW.items || []).find(entry => entry.id === softwareId)).filter(Boolean);
    let h = `<div class="d-domain" style="color:${source.color}">${source.order}. ${esc(source.label)}
      <span style="color:var(--fg-faint)"> · ${esc(item.authorityTier)} · ${esc(item.contentKind)}</span></div>
      <h2 class="d-title">${esc(item.title)}</h2>
      <div class="d-summary">${esc(item.summary)}</div>
      <div class="d-sec"><h4>来源记录</h4><dl class="lib-detail-meta">
        <dt>一级来源</dt><dd>${esc(source.label)}</dd>
        <dt>二级来源</dt><dd>${esc(subcategory.label)}</dd>
        <dt>发布者</dt><dd>${esc(item.publisher)}</dd>
        <dt>资料集合</dt><dd>${esc(item.collection)}</dd>
        <dt>发布状态</dt><dd>${esc(item.reviewStatus)}</dd>
        <dt>一手来源</dt><dd>${item.primarySource ? "是" : "否"}</dd>
        <dt>访问日期</dt><dd>${esc(item.accessedAt)}</dd>
      </dl></div>
      ${item.selectionReason ? `<div class="d-sec"><h4>为什么入选</h4><div class="d-body"><p>${esc(item.selectionReason)}</p></div></div>` : ""}
      <div class="d-sec"><h4>可以支持什么</h4><div class="d-body"><p>${esc(item.evidenceUse)}</p></div></div>
      <div class="d-sec"><h4>使用边界</h4><div class="d-body"><p>${(item.limitations || []).map(limit => `· ${esc(limit)}`).join("<br>")}</p></div></div>`;
    if (linkedNodes.length) h += `<div class="d-sec"><h4>关联节点</h4>${linkedNodes.map(nodeId =>
      `<div class="rel"><span class="rel-to" data-goto="${esc(nodeId)}">${esc(byId[nodeId].title)}</span><span class="rel-lbl">在地图中查看</span></div>`).join("")}</div>`;
    if (linkedSoftware.length) h += `<div class="d-sec"><h4>关联软件</h4>${linkedSoftware.map(software =>
      `<div class="rel"><span class="rel-to" data-library-software="${esc(software.id)}">${esc(software.name)}</span><span class="rel-lbl">在软件目录中查看</span></div>`).join("")}</div>`;
    h += `<a class="lib-source-link" href="${esc(item.url)}" target="_blank" rel="noopener">打开原始资料 ↗</a>`;
    detailBody.innerHTML = h;
    detail.classList.remove("closed");
    detailBody.scrollTop = 0;
    // 关联节点 / 关联软件链接由 detailBody 的委托监听统一处理
  }

  async function setMode(m) {
    mode = m;
    const isSW = m === "software";
    const isLibrary = m === "library";
    const isGraph = m === "graph";
    document.getElementById("cy").classList.toggle("hidden", !isGraph);
    document.getElementById("legend").classList.toggle("hidden", !isGraph);
    zoomUi.root.classList.toggle("hidden", !isGraph);
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

    // 数据按需加载：首次进入软件/资料库视图时注入对应数据包，加载期间显示占位。
    if (isSW) {
      if (!swBuilt) swView.innerHTML = `<div class="view-loading" role="status">正在加载软件目录…</div>`;
      await ensureBundle("software");
      buildSoftware();
    }
    if (isLibrary) {
      if (!libraryBuilt) libraryView.innerHTML = `<div class="view-loading" role="status">正在加载专业资料库…</div>`;
      await ensureBundle("library");
      buildLibrary();
    }
  }

  document.querySelectorAll(".mode-nav-btn").forEach(button =>
    button.addEventListener("click", () => setMode(button.getAttribute("data-mode"))));

  // 暴露给调试用
  window.__cy = cy;
})();
