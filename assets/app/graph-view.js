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
    const onSelectionChange = options.onSelectionChange || (() => {});
    const isActive = options.isActive;
    const tr = options.t;
    const content = options.content;
    const EVOLVING = "#d3a05a";
    const STABLE_RING = "#3a4150";
    const KEY_EDGES = ["mitigates", "threatens", "constrains", "contrast"];
    let officialPathActive = false;

    let officialPathRestore = null;

    function localizedDomain(id) {
      const source = DOMAINS[id] || { label: id, color: "#888", emoji: "" };
      return content ? content.resolveGraphDomain(id, source, G.meta).record : source;
    }

    function localizedEdgeType(id) {
      const source = ETYPES[id] || { label: id, color: "#888", directed: true };
      return content ? content.resolveGraphEdgeType(id, source, G.meta).record : source;
    }

    function localizedNode(id) {
      const source = byId[id];
      if (!source || !content) return source;
      return content.resolveGraphNode(id, source, G.meta).record;
    }

    function localizedNodeResult(id) {
      const source = byId[id];
      if (!source || !content) return { record: source, fallbackUsed: false };
      return content.resolveGraphNode(id, source, G.meta);
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
        button.querySelector("span").textContent = tr("learning.official.close");
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
      button.querySelector("span").textContent = tr("learning.official");
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
          id: n.id, label: localizedNode(n.id).title, domain: n.domain,
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
      clearTimeout(localLayoutTimer);
      localLayoutEpoch++;
      cy.nodes().stop(true, false);
      mapPositions = null;
      localLayoutEngaged = false;
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
          ? tr(state.revealed.size ? "map.scope.coreExpanded" : "map.scope.core", {
              shown,
              total,
              revealed: state.revealed.size,
            })
          : tr("map.scope.all", { shown, total });
      }
      document.querySelectorAll("[data-scope]").forEach(b =>
        b.classList.toggle("on", b.dataset.scope === state.scope));
      const btn = document.getElementById("scope-collapse");
      if (btn) btn.disabled = state.scope !== "core" || state.revealed.size === 0;
    }

    // Local-layout prototype: positions only; graph records and Cytoscape styles stay intact.
    let localLayoutTimer = null;
    let localLayoutEpoch = 0;
    let mapPositions = null;
    let localLayoutEngaged = false;
    const supervisedOffsets = {
      'self-supervised-learning': [-270, -170],
      'unsupervised-learning': [-290, 90],
      'decision-tree': [0, -280],
      'kernel-methods': [250, -210],
      'fine-tuning': [300, 45],
      'alignment': [180, 270],
      'overfitting': [-120, 280]
    };
    const neuralOffsets = {
      'rnn': [-230, -360],
      'transformer': [30, -430],
      'batch-norm': [290, -320],
      'vanishing-gradient': [-90, -210],
      'gradient-descent': [410, -70],
      'cnn': [380, 170],
      'gan': [220, 360],
      'vae': [-40, 410],
      'kernel-methods': [-290, 330],
      'decision-tree': [-420, 130],
      'interpretability': [-440, -90],
      'adversarial-robustness': [-410, -290]
    };
    const localLayouts = {'supervised-learning': supervisedOffsets, 'neural-network': neuralOffsets};

    function updateLocalLayout() {
      const epoch = ++localLayoutEpoch;
      clearTimeout(localLayoutTimer);
      const selectedId = state.selected;
      const offsets = localLayouts[selectedId];
      const active = state.focus && offsets
        && !cy.getElementById(state.selected).hasClass('hidden') && !officialPathActive;
      const reduced = global.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const duration = reduced ? 0 : 650;
      if (!active) {
        if (mapPositions && localLayoutEngaged) {
          cy.nodes().stop(true, false);
          const saved = mapPositions;
          localLayoutEngaged = false;
          cy.nodes().forEach(node => {
            if (saved[node.id()]) node.animate({position: saved[node.id()]}, {duration, queue: false, easing: 'ease-in-out-cubic'});
          });
        }
        return;
      }
      cy.nodes().stop(true, false);
      if (!mapPositions) {
        mapPositions = {};
        cy.nodes().forEach(node => { mapPositions[node.id()] = {...node.position()}; });
      }
      localLayoutEngaged = true;
      const saved = mapPositions;
      localLayoutTimer = setTimeout(() => {
        if (epoch !== localLayoutEpoch) return;
        cy.resize();
        const origin = saved[selectedId];
        const highlighted = cy.nodes('.hl').not('.hidden');
        const extra = highlighted.filter(n => n.id() !== selectedId && !offsets[n.id()]).map(n => n.id());
        const targets = {};
        highlighted.forEach(node => {
          let offset = offsets[node.id()] || [0, 0];
          const index = extra.indexOf(node.id());
          if (index >= 0) {
            const angle = index * 2 * Math.PI / extra.length;
            const radius = Math.max(550, extra.length * 45);
            offset = [Math.cos(angle) * radius, Math.sin(angle) * radius];
          }
          targets[node.id()] = {x: origin.x + offset[0], y: origin.y + offset[1]};
        });
        cy.nodes().forEach(node => {
          const position = targets[node.id()] || saved[node.id()];
          if (position) node.animate({position}, {duration, queue: false, easing: 'ease-in-out-cubic'});
        });
        const points = Object.values(targets);
        if (!points.length) return;
        const x1 = Math.min(...points.map(p => p.x)) - 105;
        const x2 = Math.max(...points.map(p => p.x)) + 105;
        const y1 = Math.min(...points.map(p => p.y)) - 70;
        const y2 = Math.max(...points.map(p => p.y)) + 70;
        const zoom = Math.max(cy.minZoom(), Math.min(1.25, cy.maxZoom(), (cy.width() - 50) / (x2 - x1), (cy.height() - 50) / (y2 - y1)));
        cy.stop(true, false);
        cy.animate({zoom, pan: {x: cy.width() / 2 - (x1 + x2) / 2 * zoom, y: cy.height() / 2 - (y1 + y2) / 2 * zoom}}, {duration, queue: false, easing: 'ease-in-out-cubic'});
      }, reduced ? 0 : 360);
    }

    function applyFocus() {
      const previouslyFocused = cy.elements(".dim, .hl");
      if (!state.focus || !state.selected) {
        if (previouslyFocused.length) previouslyFocused.removeClass("dim hl");
        updateLocalLayout();
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
      updateLocalLayout();
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
      const sourceNode = byId[id];
      if (!sourceNode) return;
      const localized = localizedNodeResult(id);
      const n = localized.record;
      const dom = localizedDomain(n.domain);
      const evolving = n.maturity === "evolving";

      let h = "";
      const hasDeep = DEEPDIVE_IDS.has(id);
      h += `<div class="d-domain" style="color:${dom.color}">${dom.emoji} ${esc(dom.label)}`
         + (evolving ? `<span class="mat-tag" title="${esc(tr("map.detail.evolving.title"))}">${esc(tr("map.detail.evolving"))}</span>` : "")
         + (hasDeep ? `<button class="dd-open" data-dd="${esc(id)}" title="${esc(tr("map.detail.deepDive.open"))}">📖 ${esc(tr("map.detail.deepDive"))}</button>` : "")
         + `</div>`;
      h += `<h2 class="d-title">${esc(n.title)}</h2>`;
      if (n.aliases && n.aliases.length) h += `<div class="d-alias">${n.aliases.map(esc).join(" · ")}</div>`;
      h += `<div class="d-summary">${esc(n.summary || "")}</div>`;

      if (n.body) h += `<div class="d-sec"><h4>${esc(tr("map.detail.description"))}</h4><div class="d-body">${mdLite(n.body, { localizeLinks: !localized.fallbackUsed })}</div></div>`;

      if (n.cases && n.cases.length) {
        h += `<div class="d-sec"><h4>${esc(tr("map.detail.cases"))}</h4>`;
        n.cases.forEach(c => {
          h += `<div class="case"><div class="case-t">${esc(c.title)}</div>
                <div class="case-x">${mdLite(c.text, { localizeLinks: !localized.fallbackUsed }).replace(/^<p>|<\/p>$/g, "")}</div></div>`;
        });
        h += `</div>`;
      }

      const rels = relationsOf(id);
      h += `<div class="d-sec"><h4>${esc(tr("map.detail.related"))} <span style="color:var(--fg-faint);font-weight:400">${rels.length}</span></h4>`;
      if (!rels.length) h += `<div class="d-empty">${esc(tr("map.detail.noRelations"))}</div>`;
      rels.forEach(r => {
        const t = localizedEdgeType(r.type);
        const arrow = r.dir === "out" ? "→" : "←";
        h += `<div class="rel">
                <span class="rel-type" style="background:${t.color}">${esc(t.label)}</span>
                <span style="color:var(--fg-faint)">${arrow}</span>
                <span class="rel-to" data-goto="${esc(r.other)}">${esc(localizedNode(r.other).title)}</span>
                ${r.label ? `<span class="rel-lbl">${esc(r.label)}</span>` : ""}
              </div>`;
      });
      h += `</div>`;

      if (n.activity && n.activity.length) {
        h += `<div class="d-sec"><h4>${esc(tr("map.detail.activity"))}</h4>`;
        n.activity.forEach(a => {
          h += `<div class="act"><div class="act-d">${esc(a.date)}</div>
                <div class="act-t">${esc(a.title)}</div>
                <div class="act-x">${esc(a.text)}</div></div>`;
        });
        h += `</div>`;
      }

      if (n.sources && n.sources.length) {
        h += `<div class="d-sec"><h4>${esc(tr("map.detail.sources"))}</h4>`;
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
      onSelectionChange(id);
    }

    function clearGraphSelection() {
      viewportMoveToken++;
      cy.stop(true, false);
      detail.classList.add("closed");
      state.selected = null;
      onSelectionChange(null);
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

    function renderDomainControls() {
      const expanded = new Set([...domList.querySelectorAll("[data-domain-toggle][aria-expanded='true']")]
        .map(toggle => toggle.dataset.domainToggle));
      const fragment = document.createDocumentFragment();
      Object.entries(DOMAINS).forEach(([key, sourceDomain]) => {
      const d = localizedDomain(key);
      const domainNodes = G.nodes.filter(n => n.domain === key).sort((a, b) => {
        const aIndex = RECOMMENDED_INDEX.has(a.id) ? RECOMMENDED_INDEX.get(a.id) : Number.MAX_SAFE_INTEGER;
        const bIndex = RECOMMENDED_INDEX.has(b.id) ? RECOMMENDED_INDEX.get(b.id) : Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex || localizedNode(a.id).title.localeCompare(localizedNode(b.id).title);
      });
      const listId = `domain-nodes-${key}`;
      const isExpanded = expanded.has(key);
      const group = document.createElement("div");
      group.className = "domain-group";
      group.innerHTML = `<div class="domain-row">
          <label class="chk domain-filter">
            <input type="checkbox" data-domain="${esc(key)}" ${state.domains[key] ? "checked" : ""}>
            <span class="dot" style="background:${d.color}"></span>
            <span class="domain-label">${esc(d.label)}</span><em>${domainNodes.length || ""}</em>
          </label>
          <button type="button" class="domain-expand" data-domain-toggle="${esc(key)}"
            aria-expanded="${isExpanded}" aria-controls="${esc(listId)}" aria-label="${esc(tr(isExpanded ? "controls.domain.collapse" : "controls.domain.expand", { domain: d.label }))}">
            <span aria-hidden="true">⌄</span>
          </button>
        </div>
        <div id="${esc(listId)}" class="domain-node-list" ${isExpanded ? "" : "hidden"}>
          ${domainNodes.map(sourceNode => `<button type="button" class="domain-node" data-domain-node="${esc(sourceNode.id)}">
            <span class="dot" style="background:${d.color}"></span><span>${esc(localizedNode(sourceNode.id).title)}</span>
          </button>`).join("")}
        </div>`;
      fragment.appendChild(group);
      });
      domList.replaceChildren(fragment);
    }

    renderDomainControls();
    domList.addEventListener("click", event => {
      const toggle = event.target.closest("[data-domain-toggle]");
      if (toggle) {
        const list = document.getElementById(toggle.getAttribute("aria-controls"));
        const expanded = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.setAttribute("aria-label", tr(expanded ? "controls.domain.collapse" : "controls.domain.expand", {
          domain: localizedDomain(toggle.dataset.domainToggle).label,
        }));
        if (list) list.hidden = !expanded;
        return;
      }
      const nodeButton = event.target.closest("[data-domain-node]");
      if (nodeButton) select(nodeButton.dataset.domainNode, true);
    });
    document.querySelector("#official-path-toggle em").textContent =
      tr("learning.official.meta", {
        nodes: RECOMMENDED_PATH.length,
        levels: (G.recommendedLearningPath || []).length,
      });
    document.getElementById("official-path-toggle").addEventListener("click", () =>
      setOfficialPath(!officialPathActive));

    // 关系类型
    const edgeList = document.getElementById("edge-list");

    function renderEdgeControls() {
      const fragment = document.createDocumentFragment();
      Object.entries(ETYPES).forEach(([key, sourceType]) => {
        const t = localizedEdgeType(key);
        const count = G.edges.filter(e => e.type === key).length;
        const lab = document.createElement("label");
        lab.className = "chk";
        lab.innerHTML = `<input type="checkbox" data-edge="${esc(key)}" ${state.edges[key] ? "checked" : ""}>
                         <span class="dash" style="border-color:${t.color}"></span>${esc(t.label)}<em>${count || ""}</em>`;
        fragment.appendChild(lab);
      });
      edgeList.replaceChildren(fragment);
    }

    renderEdgeControls();
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
        onSelectionChange(null);
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
      onSelectionChange(null);
      cy.nodes().removeClass("sel");
      detail.classList.add("closed");
      syncControls();
      applyFilters();
      restorePresetLayout();
    });

    const appShell = document.getElementById("app");
    const controls = document.getElementById("controls");
    const controlsToggle = document.getElementById("controls-toggle");

    function setControlsExpanded(expanded) {
      appShell.classList.toggle("controls-collapsed", !expanded);
      controlsToggle.setAttribute("aria-expanded", String(expanded));
      controlsToggle.setAttribute("aria-label", tr(expanded ? "controls.sidebar.collapse" : "controls.sidebar.expand"));
      controlsToggle.title = tr(expanded ? "controls.sidebar.collapse" : "controls.sidebar.expand");
      controls.setAttribute("aria-hidden", String(!expanded));
      controls.inert = !expanded;
      setTimeout(() => cy.resize(), 210);
    }

    controlsToggle.addEventListener("click", () => {
      setControlsExpanded(appShell.classList.contains("controls-collapsed"));
    });
    if (global.matchMedia?.('(max-width: 720px)').matches) setControlsExpanded(false);

    /* ───────────────────────── 搜索 ───────────────────────── */

    const search = document.getElementById("search");
    const results = document.getElementById("search-results");

    function doSearch() {
      const q = search.value.trim().toLowerCase();
      if (!q) { results.classList.remove("open"); return; }
      const hits = G.nodes.map(n => localizedNode(n.id)).filter(n =>
        n.title.toLowerCase().includes(q) ||
        (n.aliases || []).some(a => a.toLowerCase().includes(q)) ||
        (n.summary || "").toLowerCase().includes(q)
      ).slice(0, 12);

      results.innerHTML = hits.length
        ? hits.map(n => `<button type="button" class="sr-item" data-id="${esc(n.id)}">
              <span class="sr-title">${esc(n.title)}</span>
              <span class="sr-sum">${esc(n.summary || "")}</span></button>`).join("")
        : `<div class="sr-none">${esc(tr("search.empty"))}</div>`;
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
      if (e.key === 'ArrowDown') { e.preventDefault(); results.querySelector('.sr-item')?.focus(); }
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
      if (e.key === "/" && !document.activeElement?.closest('input, textarea, select, [contenteditable="true"]') && !search.disabled) { e.preventDefault(); search.focus(); }
    });
    results.addEventListener('keydown', event => {
      const items = [...results.querySelectorAll('.sr-item')], index = items.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
      if (event.key === 'Escape') { results.classList.remove('open'); search.focus(); }
    });

    /* ───────────────────────── 图例与启动 ───────────────────────── */

    function renderLegend() {
      document.getElementById("legend").innerHTML = tr("map.legend");
    }

    renderLegend();

    document.getElementById("meta-ver").textContent =
      `${G.meta.version} · ${G.meta.updatedAt}`;

    applyFilters();
    restorePresetLayout();

    function refreshLanguage() {
      cy.nodes().forEach(node => {
        const localized = localizedNode(node.id());
        if (localized) node.data("label", localized.title);
      });
      renderDomainControls();
      renderEdgeControls();
      const officialButton = document.getElementById("official-path-toggle");
      officialButton.querySelector("span").textContent = tr(
        officialPathActive ? "learning.official.close" : "learning.official"
      );
      officialButton.querySelector("em").textContent = tr("learning.official.meta", {
        nodes: RECOMMENDED_PATH.length,
        levels: (G.recommendedLearningPath || []).length,
      });
      document.querySelectorAll("[data-domain-toggle]").forEach(toggle => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-label", tr(expanded ? "controls.domain.collapse" : "controls.domain.expand", {
          domain: localizedDomain(toggle.dataset.domainToggle).label,
        }));
      });
      updateScopeUI();
      setControlsExpanded(!appShell.classList.contains("controls-collapsed"));
      renderLegend();
      if (results.classList.contains("open")) doSearch();
      if (state.selected) openDetail(state.selected);
    }


    return Object.freeze({
      clearSelection: clearGraphSelection,
      cy,
      detail,
      detailBody,
      refreshLanguage,
      resize: () => cy.resize(),
      selectNode: select,
      zoomRoot: zoomUi.root,
    });
  };
})(window);
