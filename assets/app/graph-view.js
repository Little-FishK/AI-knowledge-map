/* AI 知识地图 — 地图、筛选、搜索与节点详情视图 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  app.createGraphView = function createGraphView(options) {
    const G = options.graph;
    const DOMAINS = options.domains;
    const ETYPES = options.edgeTypes;
    const CORE = options.core;
    const RECOMMENDED_PATH = options.recommendedPath;
    const RECOMMENDED_INDEX = options.recommendedIndex;
    const DEEPDIVE_IDS = options.deepDiveIds;
    const byId = options.byId;
    const esc = options.escapeHtml;
    const mdLite = options.markdown;
    const debounce = options.debounce;
    const ensureDeepDive = options.ensureDeepDive;
    const navigate = options.navigate;
    const onShowNode = options.onShowNode;
    const isActive = options.isActive;
    const EVOLVING = "#d3a05a";
    const STABLE_RING = "#3a4150";
    const KEY_EDGES = ["mitigates", "threatens", "constrains", "contrast"];
    let officialPathActive = false;

    let officialPathRestore = null;

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
      if (isEditing || !isActive() || deepDiveOpen || e.ctrlKey || e.metaKey || e.altKey) return;
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
      if (swLink) { navigate({ name: "software-item", id: swLink.getAttribute("data-library-software") }); return; }
      const goto = event.target.closest("[data-goto]");
      if (goto) {
        onShowNode(goto.getAttribute("data-goto"), true);
        return;
      }
      const dd = event.target.closest("[data-dd]");
      if (dd) { navigate({ name: "concept", id: dd.getAttribute("data-dd") }); return; }
      const tutorial = event.target.closest("[data-tutorial]");
      if (tutorial) { navigate({ name: "tutorial", id: tutorial.getAttribute("data-tutorial") }); return; }
    });

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

    function clearGraphSelection() {
      viewportMoveToken++;
      cy.stop(true, false);
      detail.classList.add("closed");
      state.selected = null;
      cy.nodes(".sel").removeClass("sel");
      applyFocus();
      requestAnimationFrame(() => cy.resize());
    }

    cy.on("tap", "node", evt => select(evt.target.id(), false));
    cy.on("tap", evt => {
      if (evt.target === cy) clearGraphSelection();
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


    return Object.freeze({
      clearSelection: clearGraphSelection,
      cy,
      detail,
      detailBody,
      resize: () => cy.resize(),
      selectNode: select,
      zoomRoot: zoomUi.root,
    });
  };
})(window);
