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
    // User-approved six-color artwork. Presentation only: graph records stay intact.
    const NODE_ART = {
      foundations: "#81a8df", coding: "#ff922b", building: "#39ddb5",
      generation: "#b383bd", frontier: "#bfc0c4", safety: "#ff315f"
    };
    const KEY_EDGES = ["mitigates", "threatens", "constrains", "contrast"];
    let officialPathActive = false;

    let officialPathRestore = null;

    function localizedDomain(id) {
      const source = DOMAINS[id] || { label: id, color: "#888", emoji: "" };
      const record = content ? content.resolveGraphDomain(id, source, G.meta).record : source;
      return Object.assign({}, record, { color: NODE_ART[id] || record.color });
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
            "background-color": ele => NODE_ART[ele.data("domain")] || "#888",
            "background-image": ele => NODE_ART[ele.data("domain")]
              ? new URL(`assets/node-art/${ele.data("domain")}.png?v=2`, document.baseURI).href : "none",
            "background-fit": "contain",
            "background-width": "100%",
            "background-height": "100%",
            "background-opacity": 0,
            "border-width": ele => ele.data("maturity") === "evolving" ? 2 : 0,
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
            "transition-duration": "450ms"
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
            "curve-style": "straight",
            "opacity": 0.5,
            "transition-property": "opacity, width",
            "transition-duration": "450ms"
          }
        },
        { selector: "node.dim", style: { "opacity": 0, "events": "no" } },
        { selector: "node.motion-art", style: { "background-image-opacity": 0 } },
        { selector: "edge.dim", style: { "opacity": 0, "events": "no" } },
        {
          selector: "edge.overview-curve",
          style: {
            "curve-style": "unbundled-bezier",
            "control-point-distances": "data(overviewBend)",
            "control-point-weights": 0.5,
            "edge-distances": "node-position"
          }
        },
        { selector: "node.sel", style: { "border-width": 2, "border-color": "#eaeef5" } },
        {
          selector: "node.official-path-node",
          style: {
            "label": "data(officialOrder)",
            "background-image": "none",
            "background-opacity": 1,
            "width": ele => String(ele.data("officialOrder")).includes(".") ? 64 : 72,
            "height": ele => String(ele.data("officialOrder")).includes(".") ? 64 : 72,
            "background-color": ele => String(ele.data("officialOrder")).includes(".")
              ? "#17130b"
              : "#e4b85d",
            "border-width": ele => String(ele.data("officialOrder")).includes(".") ? 3 : 6,
            "border-color": ele => String(ele.data("officialOrder")).includes(".")
              ? "#a99667"
              : "#fff0b8",
            "color": ele => String(ele.data("officialOrder")).includes(".")
              ? "#e4b85d"
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
          selector: "node.official-path-node.motion-art",
          style: { "background-opacity": 0, "border-width": 0, "text-opacity": 0 }
        },
        {
          selector: "edge.hl",
          style: { "opacity": 1, "width": 2.6, "label": "data(label)",
                   "font-size": 9.5, "color": "#aeb6c4",
                   "text-outline-color": "#14161a", "text-outline-width": 2.5,
                   "text-rotation": "autorotate" }
        },
        { selector: "node.hl", style: { "opacity": 1, "text-opacity": 1 } },
        { selector: 'node.sl-main, node.sl-peer', style: {width: 72, height: 72} },
        { selector: 'node.sl-support', style: {width: 36, height: 36, 'background-image': 'none', 'background-color': '#32d6b0', 'background-opacity': 1, 'border-width': 0} },
        { selector: 'node.sl-output', style: {width: 58, height: 58} },
        { selector: 'node.sl-risk', style: {width: 50, height: 50} },
        { selector: 'edge.sl-peer-edge', style: {'line-color': '#ffffff', 'source-arrow-shape': 'none', 'target-arrow-shape': 'none', 'curve-style': 'straight', label: '对比训练目标的来源与设置'} },
        { selector: 'edge.sl-support-edge', style: {'line-color': '#32d6b0', 'source-arrow-shape': 'none', 'target-arrow-shape': 'none', 'curve-style': 'straight', label: '可用于分类或回归'} },
        { selector: 'edge.sl-output-edge', style: {'source-arrow-shape': 'triangle', 'source-arrow-color': '#8fb87f', 'target-arrow-shape': 'none', 'curve-style': 'straight', label: '支持监督微调（SFT）'} },
        { selector: 'edge.sl-risk-edge', style: {'line-color': '#ee6677', 'target-arrow-color': '#ee6677', 'source-arrow-shape': 'none', 'target-arrow-shape': 'triangle', 'curve-style': 'straight', label: '可能损害泛化'} },
        { selector: 'edge.sl-peripheral-edge', style: {opacity: 0, events: 'no'} },
        { selector: 'edge.nn-relation.sl-peer-edge', style: {label: 'data(label)'} },
        { selector: 'edge.nn-relation.sl-support-edge', style: {label: ele => ele.source().id() === 'batch-norm' ? '可选的训练稳定组件' : '常用参数优化方法'} },
        { selector: 'edge.nn-relation.sl-output-edge', style: {label: '基于神经网络'} },
        { selector: 'edge.nn-relation.sl-risk-edge', style: {label: 'data(label)'} },
        { selector: 'edge.attention-relation', style: {label: 'data(label)'} },
        { selector: 'edge.attention-relation.sl-output-edge', style: {
          'source-arrow-shape': ele => ele.source().id() === 'attention' ? 'none' : 'triangle',
          'target-arrow-shape': ele => ele.source().id() === 'attention' ? 'triangle' : 'none',
          'target-arrow-color': '#8fb87f',
          label: ele => ({'transformer': '核心组件', 'reranking': '用于交叉编码', 'prompt-caching': '复用 KV', 'interpretability': '提供分析线索（非因果解释）', 'vanishing-gradient': '可缩短梯度传播路径'})[ele.source().id() === 'attention' ? ele.target().id() : ele.source().id()]
        } },
        { selector: 'edge.attention-relation.sl-support-edge', style: {label: ele => ele.source().id() === 'positional-encoding' ? '提供位置信息' : '优化计算与内存开销'} },
        { selector: 'edge.attention-relation.sl-risk-edge', style: {
          'source-arrow-shape': 'triangle', 'source-arrow-color': '#ee6677', 'target-arrow-shape': 'none',
          label: ele => ele.target().id() === 'context-window' ? '长序列增加计算开销' : '长上下文的信息利用风险'
        } },
        { selector: 'edge.llm-relation', style: {label: 'data(label)'} },
        { selector: 'edge.context-relation', style: {label: 'data(label)'} },
        { selector: 'edge.multimodal-relation', style: {label: 'data(label)'} },
        { selector: 'edge.batch-relation', style: {label: 'data(label)'} },
        { selector: 'edge.batch-relation.sl-output-edge', style: {
          'source-arrow-shape': ele => ele.source().hasClass('sl-main') ? 'none' : 'triangle',
          'target-arrow-shape': ele => ele.source().hasClass('sl-main') ? 'triangle' : 'none',
          'target-arrow-color': '#8fb87f'
        } },
        { selector: 'edge.batch-relation.sl-risk-edge', style: {
          'source-arrow-shape': ele => ele.source().hasClass('sl-main') ? 'triangle' : 'none',
          'target-arrow-shape': ele => ele.target().hasClass('sl-main') ? 'triangle' : 'none',
          'source-arrow-color': '#ee6677', 'target-arrow-color': '#ee6677'
        } },
        { selector: 'edge.batch-relation.sl-output-edge[source = "overfitting"]', style: {
          'line-color': '#ee6677', 'target-arrow-color': '#ee6677'
        } },
        { selector: 'edge.batch-relation.sl-output-edge[source = "curse-of-dimensionality"][type = "threatens"]', style: {
          'line-color': '#ee6677', 'target-arrow-color': '#ee6677'
        } },
        { selector: 'edge.batch-relation.sl-output-edge[source = "vanishing-gradient"], edge.batch-relation.sl-output-edge[source = "backprop"][target = "rnn"]', style: {
          'line-color': '#ee6677', 'target-arrow-color': '#ee6677'
        } },
        { selector: 'edge.multimodal-relation.sl-output-edge', style: {
          'source-arrow-shape': ele => ele.source().id() === 'multimodal' ? 'none' : 'triangle',
          'target-arrow-shape': ele => ele.source().id() === 'multimodal' ? 'triangle' : 'none',
          'target-arrow-color': '#8fb87f'
        } },
        { selector: 'edge.context-relation.sl-output-edge', style: {
          'source-arrow-shape': ele => ele.source().id() === 'context-window' ? 'none' : 'triangle',
          'target-arrow-shape': ele => ele.source().id() === 'context-window' ? 'triangle' : 'none',
          'target-arrow-color': '#8fb87f'
        } },
        { selector: 'edge.llm-relation.sl-output-edge', style: {
          'source-arrow-shape': ele => ele.source().id() === 'llm' ? 'none' : 'triangle',
          'target-arrow-shape': ele => ele.source().id() === 'llm' ? 'triangle' : 'none',
          'target-arrow-color': '#8fb87f'
        } },
        { selector: ".hidden", style: { "display": "none" } }
      ],
      layout: { name: "preset" }
    });

    // Animate artwork only, never node coordinates or labels. Keep the existing
    // texture as a fallback until every sprite has loaded successfully.
    const ringCanvas = document.createElement('canvas');
    ringCanvas.id = 'node-ring-motion';
    ringCanvas.setAttribute('aria-hidden', 'true');
    ringCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:3';
    cy.container().appendChild(ringCanvas);
    const ringContext = ringCanvas.getContext('2d');
    const motionPreference = global.matchMedia('(prefers-reduced-motion: reduce)');
    const ringSprites = {};
    const ringStates = new Map();
    let ringReady = false, hoveredRing = null, ringLastTime = 0, ringFrame = null;
    let ringDisposed = false, ringActive = false;

    function renderRings(time = performance.now()) {
      if (!ringReady || ringDisposed) return;
      const container = cy.container();
      const w = container.clientWidth, h = container.clientHeight;
      const dpr = Math.min(global.devicePixelRatio || 1, 1.5);
      if (ringCanvas.width !== Math.round(w * dpr) || ringCanvas.height !== Math.round(h * dpr)) {
        ringCanvas.width = Math.round(w * dpr); ringCanvas.height = Math.round(h * dpr);
        ringCanvas.style.width = w + 'px'; ringCanvas.style.height = h + 'px';
      }
      ringContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      ringContext.clearRect(0, 0, w, h);
      const active = isActive() && !document.hidden;
      if (ringActive !== active) {
        ringActive = active;
        cy.nodes().toggleClass('motion-art', active);
      }
      const dt = Math.min(0.1, Math.max(0, (time - (ringLastTime || time)) / 1000));
      ringLastTime = time;
      if (!active) { hoveredRing = null; return; }
      cy.nodes().not('.hidden').forEach(node => {
        const sprite = ringSprites[node.data('domain')];
        if (!sprite) return;
        const p = node.renderedPosition(), size = node.width() * cy.zoom();
        if (p.x < -size || p.y < -size || p.x > w + size || p.y > h + size) return;
        let motion = ringStates.get(node.id());
        if (!motion) { motion = { angle: 0, emphasis: 0 }; ringStates.set(node.id(), motion); }
        const hovered = hoveredRing === node.id();
        motion.emphasis += ((hovered ? 1 : 0) - motion.emphasis) * Math.min(1, dt * 12);
        if (!motionPreference.matches) motion.angle = (motion.angle + dt * Math.PI * 2 / (hovered ? 3 : 48)) % (Math.PI * 2);
        const scale = 1 + 0.18 * motion.emphasis;
        ringContext.save();
        ringContext.globalAlpha = Number(node.style('opacity'));
        ringContext.translate(p.x, p.y);
        if (node.hasClass('sl-support')) {
          const green = ringContext.createRadialGradient(-size * 0.12, -size * 0.14, 0, 0, 0, size * 0.4);
          green.addColorStop(0, '#9af7d8'); green.addColorStop(1, '#19af8d');
          ringContext.beginPath(); ringContext.arc(0, 0, size * 0.38, 0, Math.PI * 2);
          ringContext.fillStyle = green; ringContext.fill();
          if (hovered) { ringContext.strokeStyle = '#ffffff'; ringContext.lineWidth = size * 0.045; ringContext.stroke(); }
          ringContext.restore(); return;
        }
        if (node.hasClass('official-path-node')) {
          // Keep the official order and gold/black hierarchy stationary while
          // reusing the same domain ring as the ordinary map.
          ringContext.beginPath(); ringContext.arc(0, 0, size * 0.38, 0, Math.PI * 2);
          ringContext.fillStyle = node.style('background-color'); ringContext.fill();
          ringContext.fillStyle = node.style('color');
          ringContext.font = `${node.style('font-weight')} ${parseFloat(node.style('font-size')) * cy.zoom()}px ${node.style('font-family')}`;
          ringContext.textAlign = 'center'; ringContext.textBaseline = 'middle';
          ringContext.fillText(String(node.data('officialOrder')), 0, 0, size * 0.70);
        } else {
          ringContext.drawImage(sprite.face, -size / 2, -size / 2, size, size);
        }
        // White band starts exactly at the face's radius (38% of icon size).
        if (motion.emphasis > 0.005) {
          ringContext.save();
          ringContext.globalAlpha *= motion.emphasis;
          ringContext.beginPath(); ringContext.arc(0, 0, size * 0.4025, 0, Math.PI * 2);
          ringContext.strokeStyle = '#ffffff'; ringContext.lineWidth = size * 0.045;
          ringContext.stroke(); ringContext.restore();
        }
        ringContext.rotate(motion.angle);
        ringContext.drawImage(sprite.ring, -size * scale / 2, -size * scale / 2, size * scale, size * scale);
        ringContext.restore();
      });
    }

    function ringTick(time) {
      if (ringDisposed) return;
      if (time - ringLastTime >= 1000 / 30) renderRings(time);
      ringFrame = requestAnimationFrame(ringTick);
    }
    function hoverRing(event) {
      if (event.pointerType === 'touch' || event.buttons) { hoveredRing = null; return; }
      const box = cy.container().getBoundingClientRect();
      const x = event.clientX - box.left, y = event.clientY - box.top;
      let nearest = Infinity;
      hoveredRing = null;
      cy.nodes().not('.hidden').not('.dim').forEach(node => {
        const p = node.renderedPosition(), distance = Math.hypot(p.x - x, p.y - y);
        if (distance <= node.width() * cy.zoom() / 2 && distance < nearest) {
          nearest = distance; hoveredRing = node.id();
        }
      });
    }
    cy.container().addEventListener('pointermove', hoverRing);
    cy.container().addEventListener('pointerleave', () => { hoveredRing = null; });
    cy.container().addEventListener('pointerdown', () => { hoveredRing = null; });
    cy.on('render', () => renderRings());
    cy.on('destroy', () => { ringDisposed = true; cancelAnimationFrame(ringFrame); ringCanvas.remove(); });
    Promise.all(Object.keys(NODE_ART).map(domain => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const makeSprite = ring => {
          const canvas = document.createElement('canvas'); canvas.width = canvas.height = img.naturalWidth;
          const ctx = canvas.getContext('2d'), half = canvas.width / 2;
          ctx.beginPath(); ctx.arc(half, half, canvas.width * (ring ? 0.5 : 0.38), 0, Math.PI * 2);
          if (ring) ctx.arc(half, half, canvas.width * 0.40, 0, Math.PI * 2, true);
          ctx.clip(); ctx.drawImage(img, 0, 0); return canvas;
        };
        ringSprites[domain] = { face: makeSprite(false), ring: makeSprite(true) }; resolve();
      };
      img.onerror = reject;
      img.src = new URL(`assets/node-art/${domain}.png?v=2`, document.baseURI).href;
    }))).then(() => {
      if (ringDisposed) return;
      ringReady = true; renderRings(); ringFrame = requestAnimationFrame(ringTick);
    }).catch(() => { ringCanvas.remove(); });

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
      'self-supervised-learning': [356, -120],
      'unsupervised-learning': [274, -240],
      'decision-tree': [-308, -104],
      'kernel-methods': [-308, 118],
      'fine-tuning': [518, -2],
      'alignment': [634, 168],
      'overfitting': [296, 218]
    };
    // User reference: proposals/local-relationship-layout.md. Balance branches around the main node.
    const neuralOffsets = {
      'rnn': [760, -11],
      'transformer': [892, -106],
      'batch-norm': [-310, 128],
      'vanishing-gradient': [295, 311],
      'gradient-descent': [-310, -128],
      'cnn': [808, -206],
      'gan': [939, 244],
      'vae': [878, 379],
      'kernel-methods': [473, -294],
      'decision-tree': [314, -447],
      'interpretability': [167, 351],
      'adversarial-robustness': [1, 367]
    };
    Object.keys(neuralOffsets).forEach(id => { neuralOffsets[id] = neuralOffsets[id].map(value => value * 0.8); });
    const attentionOffsets = {
      'positional-encoding': [-265, -102],
      'inference-optimization': [-265, 112],
      'state-space-models': [290, -284],
      'transformer': [453, -171],
      'reranking': [578, -74],
      'prompt-caching': [710, -6],
      'interpretability': [568, 94],
      'vanishing-gradient': [472, 155],
      'context-window': [2, 230],
      'lost-in-middle': [118, 194]
    };
    const llmOffsets = {
      'scaling-law': [-36, -197],
      'pretraining': [-102, -174],
      'transformer': [-157, -128],
      'tokenization': [-191, -69],
      'loss-function': [-210, 0],
      'information-theory': [-190, 65],
      'sampling-params': [-152, 127],
      'fine-tuning': [-110, 171],
      'alignment': [-45, 196],
      'multimodal': [272, -272],
      'reasoning-models': [517, -213],
      'rag': [558, -115],
      'agent': [837, -18],
      'code-generation': [718, 51],
      'prompt-engineering': [549, 104],
      'in-context-learning': [491, 182],
      'streaming': [395, 225],
      'context-window': [26, 288],
      'prompt-injection': [78, 221],
      'jailbreak': [162, 179]
    };
    const contextOffsets = {
      'tokenization': [-160, -160],
      'positional-encoding': [-205, -95],
      'inference-optimization': [-230, -20],
      'context-compaction': [-215, 60],
      'context-engineering': [-170, 135],
      'state-space-models': [-100, 190],
      'llm': [280, -280],
      'rag': [430, -220],
      'chunking': [550, -135],
      'in-context-learning': [660, -65],
      'agent-memory': [800, 0],
      'multi-agent': [650, 85],
      'agent-loop': [510, 165],
      'cot': [350, 225],
      'attention': [-55, 255],
      'lost-in-middle': [40, 200],
      'video-generation': [150, 230]
    };
    const multimodalOffsets = {
      'llm': [-110, -170],
      'transformer': [-190, -95],
      'embedding': [-215, 0],
      'clip': [-190, 95],
      'contrastive-learning': [-110, 170],
      'image-generation': [350, -180],
      'computer-use': [570, -90],
      'agent': [750, 0],
      'speech': [400, 170]
    };
    const localLayouts = {'supervised-learning': supervisedOffsets, 'neural-network': neuralOffsets, 'attention': attentionOffsets, 'llm': llmOffsets, 'context-window': contextOffsets, 'multimodal': multimodalOffsets};

    const batchLayouts = {
      'state-space-models': {
        support: ['rnn'], peer: ['attention', 'transformer'], risk: [], output: ['context-window', 'model-families'],
        offsets: { 'rnn': [-195, -30], 'attention': [220, -240], 'transformer': [405, -150], 'context-window': [610, 0], 'model-families': [365, 145] }
      },
      'self-supervised-learning': {
        support: [], peer: ['unsupervised-learning', 'supervised-learning'], risk: [],
        output: ['pretraining', 'scaling-law', 'diffusion', 'synthetic-data'],
        offsets: { 'unsupervised-learning': [205, -260], 'supervised-learning': [400, -190], 'pretraining': [670, 0], 'scaling-law': [465, -75], 'diffusion': [505, 100], 'synthetic-data': [305, 175] }
      },
      'contrastive-learning': {
        support: [], peer: [], risk: [], output: ['embedding', 'clip', 'multimodal', 'retrieval'],
        offsets: { 'embedding': [290, -165], 'clip': [475, -85], 'multimodal': [675, 0], 'retrieval': [390, 140] }
      },
      'positional-encoding': {
        support: [], peer: [], risk: ['lost-in-middle'], output: ['attention', 'transformer', 'context-window'],
        offsets: {'attention': [350, -130], 'transformer': [600, 0], 'context-window': [400, 120], 'lost-in-middle': [0, 210]}
      },
      'normalization': {
        support: [], peer: ['batch-norm'], risk: [], output: ['residual-connection', 'transformer', 'vanishing-gradient'],
        offsets: {'batch-norm': [230, -230], 'residual-connection': [420, -90], 'transformer': [630, 0], 'vanishing-gradient': [350, 150]}
      },
      'transformer': {
        support: ['neural-network', 'embedding', 'attention', 'positional-encoding', 'residual-connection', 'normalization'],
        peer: ['rnn', 'state-space-models', 'batch-norm'], risk: [], output: ['moe', 'pretraining', 'llm', 'multimodal', 'diffusion', 'speech', 'scaling-law'],
        offsets: {'neural-network': [-85, -190], 'embedding': [-170, -125], 'attention': [-215, -40], 'positional-encoding': [-215, 45], 'residual-connection': [-170, 130], 'normalization': [-85, 190], 'rnn': [220, -360], 'state-space-models': [410, -300], 'batch-norm': [550, -245], 'moe': [390, -120], 'pretraining': [570, -85], 'llm': [790, 0], 'multimodal': [660, 90], 'diffusion': [530, 165], 'speech': [390, 220], 'scaling-law': [230, 260]}
      },
      'rnn': {
        support: ['neural-network', 'backprop'], peer: ['transformer', 'state-space-models'], risk: ['vanishing-gradient'], output: [],
        offsets: {'neural-network': [-180, -85], 'backprop': [-180, 85], 'transformer': [250, -170], 'state-space-models': [490, 0], 'vanishing-gradient': [0, 210]}
      },
      'tokenization': {
        support: [], peer: [], risk: [], output: ['llm', 'context-window'],
        offsets: {'llm': [500, -45], 'context-window': [310, 150]}
      },
      'embedding': {
        support: ['contrastive-learning'], peer: ['knowledge-graph'], risk: [],
        output: ['image-generation', 'clip', 'multimodal', 'transformer', 'retrieval', 'vector-db', 'rag', 'clustering', 'dimensionality-reduction', 'curse-of-dimensionality'],
        offsets: {'contrastive-learning': [-190, 0], 'knowledge-graph': [220, -350], 'image-generation': [420, -300], 'clip': [560, -230], 'multimodal': [680, -150], 'transformer': [720, -75], 'retrieval': [850, 0], 'vector-db': [750, 75], 'rag': [630, 145], 'clustering': [500, 210], 'dimensionality-reduction': [360, 265], 'curse-of-dimensionality': [220, 300]}
      },
      'optimizer-schedule': {
        support: ['gradient-descent', 'backprop', 'loss-function'], peer: [], risk: [], output: ['distributed-training', 'pretraining', 'fine-tuning'],
        offsets: {'gradient-descent': [-150, -130], 'backprop': [-210, 0], 'loss-function': [-150, 130], 'distributed-training': [350, -140], 'pretraining': [620, 0], 'fine-tuning': [380, 140]}
      },
      'residual-connection': {
        support: ['batch-norm', 'normalization'], peer: [], risk: [], output: ['cnn', 'transformer', 'vanishing-gradient'],
        offsets: {'batch-norm': [-180, -90], 'normalization': [-180, 90], 'cnn': [380, -145], 'transformer': [620, 0], 'vanishing-gradient': [400, 145]}
      },
      'cnn': {
        support: ['neural-network', 'residual-connection'], peer: [], risk: [], output: ['diffusion'],
        offsets: {'neural-network': [-180, -90], 'residual-connection': [-180, 90], 'diffusion': [500, 0]}
      },
      'backprop': {
        support: ['loss-function'], peer: [], risk: ['vanishing-gradient'], output: ['gradient-descent', 'optimizer-schedule', 'rnn'],
        offsets: {'loss-function': [-185, 0], 'vanishing-gradient': [0, 210], 'optimizer-schedule': [350, -160], 'gradient-descent': [610, 0], 'rnn': [370, 145]}
      },
      'vanishing-gradient': {
        support: ['backprop', 'residual-connection', 'attention', 'batch-norm', 'normalization'], peer: [], risk: [], output: ['neural-network', 'rnn'],
        offsets: {'backprop': [-100, -170], 'residual-connection': [-180, -90], 'attention': [-210, 0], 'batch-norm': [-180, 90], 'normalization': [-100, 170], 'neural-network': [330, -135], 'rnn': [570, 0]}
      },
      'batch-norm': {
        support: [], peer: ['normalization', 'transformer'], risk: [], output: ['neural-network', 'residual-connection', 'regularization', 'vanishing-gradient'],
        offsets: {'normalization': [220, -280], 'transformer': [410, -210], 'residual-connection': [450, -90], 'neural-network': [650, 0], 'regularization': [500, 100], 'vanishing-gradient': [330, 185]}
      },
      'decision-tree': {
        support: ['supervised-learning'], peer: ['neural-network', 'kernel-methods'], risk: [], output: [],
        offsets: {'supervised-learning': [-180, 0], 'neural-network': [250, -150], 'kernel-methods': [460, 0]}
      },
      'clustering': {
        support: ['embedding'], peer: [], risk: ['curse-of-dimensionality'], output: ['unsupervised-learning'],
        offsets: {'embedding': [-185, 0], 'unsupervised-learning': [410, 0], 'curse-of-dimensionality': [0, 210]}
      },
      'kernel-methods': {
        support: ['regularization'], peer: ['neural-network', 'decision-tree'], risk: [], output: ['supervised-learning', 'curse-of-dimensionality'],
        offsets: {'regularization': [-180, 0], 'neural-network': [240, -220], 'decision-tree': [420, -130], 'supervised-learning': [600, 0], 'curse-of-dimensionality': [360, 155]}
      },
      'regularization': {
        support: ['gradient-descent', 'batch-norm', 'kernel-methods'], peer: [], risk: [],
        output: ['overfitting', 'fine-tuning', 'quantization'],
        offsets: {'gradient-descent': [-150, -130], 'batch-norm': [-210, 0], 'kernel-methods': [-150, 130], 'overfitting': [350, -140], 'fine-tuning': [620, 0], 'quantization': [360, 140]}
      },
      'dimensionality-reduction': {
        support: ['unsupervised-learning'], peer: [], risk: [],
        output: ['embedding', 'curse-of-dimensionality'],
        offsets: {'unsupervised-learning': [-180, 0], 'embedding': [300, -135], 'curse-of-dimensionality': [520, 30]}
      },
      'curse-of-dimensionality': {
        support: ['dimensionality-reduction', 'embedding', 'kernel-methods'], peer: [], risk: [],
        output: ['clustering', 'retrieval', 'adversarial-robustness'],
        offsets: {'dimensionality-reduction': [-150, -130], 'embedding': [-210, 0], 'kernel-methods': [-150, 130], 'clustering': [340, -150], 'retrieval': [620, 0], 'adversarial-robustness': [370, 145]}
      },
      'unsupervised-learning': {
        support: [], peer: ['supervised-learning', 'self-supervised-learning'], risk: [],
        output: ['clustering', 'dimensionality-reduction', 'pretraining'],
        offsets: {'supervised-learning': [220, -240], 'self-supervised-learning': [385, -165], 'clustering': [610, 0], 'dimensionality-reduction': [470, 105], 'pretraining': [290, 190]}
      },
      'reinforcement-learning': {
        support: ['world-models'], peer: ['agent'], risk: ['reward-hacking'],
        output: ['rlhf', 'alignment'],
        offsets: {'world-models': [-190, 0], 'agent': [280, -200], 'rlhf': [580, 0], 'alignment': [390, 145], 'reward-hacking': [0, 210]}
      },
      'overfitting': {
        support: ['regularization', 'loss-function'], peer: [], risk: [],
        output: ['supervised-learning', 'fine-tuning', 'evaluation', 'privacy'],
        offsets: {'regularization': [-180, -85], 'loss-function': [-180, 85], 'supervised-learning': [300, -170], 'fine-tuning': [520, -80], 'evaluation': [680, 0], 'privacy': [390, 160]}
      },
      'information-theory': {
        support: [], peer: [], risk: [],
        output: ['loss-function', 'llm', 'sampling-params', 'rlhf', 'distillation'],
        offsets: {'loss-function': [280, -200], 'llm': [500, -100], 'sampling-params': [680, 0], 'rlhf': [490, 115], 'distillation': [300, 205]}
      },
      'loss-function': {
        support: ['information-theory'], peer: ['evaluation'], risk: ['overfitting', 'reward-hacking'],
        output: ['gradient-descent', 'backprop', 'llm', 'optimizer-schedule'],
        offsets: {'information-theory': [-190, 0], 'evaluation': [280, -250], 'gradient-descent': [480, -140], 'backprop': [660, 0], 'llm': [500, 100], 'optimizer-schedule': [340, 185], 'overfitting': [0, 210], 'reward-hacking': [125, 200]}
      },
      'gradient-descent': {
        support: ['loss-function', 'backprop'], peer: [], risk: [],
        output: ['regularization', 'optimizer-schedule', 'neural-network', 'pretraining'],
        offsets: {'loss-function': [-180, -90], 'backprop': [-180, 90], 'regularization': [320, -180], 'optimizer-schedule': [450, -90], 'neural-network': [660, 0], 'pretraining': [460, 110]}
      }
    };
    Object.entries(batchLayouts).forEach(([id, config]) => { localLayouts[id] = config.offsets; });

    function updateLocalLayout() {
      const epoch = ++localLayoutEpoch;
      clearTimeout(localLayoutTimer);
      const selectedId = state.selected;
      const offsets = localLayouts[selectedId];
      const active = state.focus && offsets
        && !cy.getElementById(state.selected).hasClass('hidden') && !officialPathActive;
      cy.elements().removeClass('sl-main sl-peer sl-support sl-output sl-risk sl-peer-edge sl-support-edge sl-output-edge sl-risk-edge sl-peripheral-edge nn-relation attention-relation llm-relation context-relation multimodal-relation batch-relation');
      if (active) {
        const neural = selectedId === 'neural-network';
        const attention = selectedId === 'attention';
        const llm = selectedId === 'llm';
        const context = selectedId === 'context-window';
        const multimodal = selectedId === 'multimodal';
        const batch = batchLayouts[selectedId];
        cy.getElementById(selectedId).addClass('sl-main');
        if (batch) {
          ['support', 'peer', 'output', 'risk'].forEach(role => batch[role].forEach(id => cy.getElementById(id).addClass('sl-' + role)));
        } else if (multimodal) {
          ['llm', 'transformer', 'embedding', 'clip', 'contrastive-learning'].forEach(id => cy.getElementById(id).addClass('sl-support'));
          ['image-generation', 'computer-use', 'agent', 'speech'].forEach(id => cy.getElementById(id).addClass('sl-output'));
        } else if (context) {
          ['tokenization', 'positional-encoding', 'inference-optimization', 'context-compaction', 'context-engineering', 'state-space-models'].forEach(id => cy.getElementById(id).addClass('sl-support'));
          ['llm', 'rag', 'chunking', 'in-context-learning', 'agent-memory', 'multi-agent', 'agent-loop', 'cot'].forEach(id => cy.getElementById(id).addClass('sl-output'));
          ['attention', 'lost-in-middle', 'video-generation'].forEach(id => cy.getElementById(id).addClass('sl-risk'));
        } else {
        (llm ? [] : attention ? ['state-space-models'] : neural ? ['decision-tree', 'kernel-methods'] : ['self-supervised-learning', 'unsupervised-learning']).forEach(id => cy.getElementById(id).addClass('sl-peer'));
        (llm ? ['scaling-law', 'pretraining', 'transformer', 'tokenization', 'loss-function', 'information-theory', 'sampling-params', 'fine-tuning', 'alignment'] : attention ? ['positional-encoding', 'inference-optimization'] : neural ? ['gradient-descent', 'batch-norm'] : ['decision-tree', 'kernel-methods']).forEach(id => cy.getElementById(id).addClass('sl-support'));
        (llm ? ['multimodal', 'reasoning-models', 'rag', 'agent', 'code-generation', 'prompt-engineering', 'in-context-learning', 'streaming'] : attention ? ['transformer', 'reranking', 'prompt-caching', 'interpretability', 'vanishing-gradient'] : neural ? ['cnn', 'rnn', 'transformer', 'gan', 'vae'] : ['fine-tuning', 'alignment']).forEach(id => cy.getElementById(id).addClass('sl-output'));
        (llm ? ['context-window', 'prompt-injection', 'jailbreak'] : attention ? ['context-window', 'lost-in-middle'] : neural ? ['vanishing-gradient', 'interpretability', 'adversarial-robustness'] : ['overfitting']).forEach(id => cy.getElementById(id).addClass('sl-risk'));
        }
        cy.edges('.hl').forEach(edge => {
          const a = edge.source(), b = edge.target();
          if (neural) edge.addClass('nn-relation');
          if (attention) edge.addClass('attention-relation');
          if (llm) edge.addClass('llm-relation');
          if (context) edge.addClass('context-relation');
          if (multimodal) edge.addClass('multimodal-relation');
          if (batch) edge.addClass('batch-relation');
          if (!a.hasClass('sl-main') && !b.hasClass('sl-main') && !(a.hasClass('sl-peer') && b.hasClass('sl-peer'))) {
            edge.addClass('sl-peripheral-edge');
            return;
          }
          if ((a.hasClass('sl-peer') || a.hasClass('sl-main')) && (b.hasClass('sl-peer') || b.hasClass('sl-main'))) edge.addClass('sl-peer-edge');
          if ((a.hasClass('sl-support') && b.hasClass('sl-main')) || (b.hasClass('sl-support') && a.hasClass('sl-main'))) edge.addClass('sl-support-edge');
          if (a.hasClass('sl-output') && b.hasClass('sl-main')) edge.addClass('sl-output-edge');
          if (a.hasClass('sl-risk')) edge.addClass('sl-risk-edge');
          if ((attention || llm || context || multimodal || batch) && a.hasClass('sl-main') && b.hasClass('sl-output')) edge.addClass('sl-output-edge');
          if (batch && a.hasClass('sl-main') && b.hasClass('sl-risk')) edge.addClass('sl-risk-edge');
          if (attention && a.hasClass('sl-main') && b.hasClass('sl-risk')) edge.addClass('sl-risk-edge');
        });
      }
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
            offset = localLayouts[selectedId]
              ? [760 + Math.floor(index / 4) * 220, (index % 4 - 1.5) * 180]
              : [Math.cos(angle) * radius, Math.sin(angle) * radius];
          }
          targets[node.id()] = {x: origin.x + offset[0], y: origin.y + offset[1]};
        });
        // Keep the leftmost risk directly below the selected node on a short vertical branch.
        const firstRisk = cy.nodes('.sl-risk').filter(node => targets[node.id()])
          .sort((a, b) => targets[a.id()].x - targets[b.id()].x).first();
        if (firstRisk.length) {
          targets[firstRisk.id()] = {x: origin.x, y: origin.y + 210};
          cy.nodes('.sl-risk').forEach(node => {
            const target = targets[node.id()];
            if (target && node.id() !== firstRisk.id()) target.x = Math.max(target.x, origin.x + 75);
          });
        }
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

    // Layer 1 only. Use the whole map, not the filtered viewport, as the
    // reference circle so filtering and zooming cannot flip an edge's bend.
    function updateOverviewEdges() {
      const overview = !state.selected || officialPathActive;
      if (!overview) {
        cy.edges('.overview-curve').removeClass('overview-curve');
        return;
      }
      const points = cy.nodes().map(n => n.position());
      const center = {
        x: (Math.min(...points.map(p => p.x)) + Math.max(...points.map(p => p.x))) / 2,
        y: (Math.min(...points.map(p => p.y)) + Math.max(...points.map(p => p.y))) / 2
      };
      const radius = Math.max(1, ...points.map(p => Math.hypot(p.x - center.x, p.y - center.y)));
      cy.batch(() => cy.edges().forEach(edge => {
        const a = edge.source(), b = edge.target();
        if (CORE.has(a.id()) && CORE.has(b.id())) {
          edge.removeClass('overview-curve');
          return;
        }
        const p = a.position(), q = b.position();
        const dx = q.x - p.x, dy = q.y - p.y, length = Math.hypot(dx, dy);
        if (length < 1) { edge.removeClass('overview-curve'); return; }
        const nx = -dy / length, ny = dx / length;
        const towardCenter = (center.x - (p.x + q.x) / 2) * nx
          + (center.y - (p.y + q.y) / 2) * ny;
        const outer = (Math.hypot(p.x - center.x, p.y - center.y)
          + Math.hypot(q.x - center.x, q.y - center.y)) / (2 * radius);
        // User-corrected orientation: arc bulges outward, concave side faces
        // the center. Preserve the previous radial strength and offset cap.
        const bend = -Math.sign(towardCenter) * Math.min(length * 0.65 * outer ** 2, Math.abs(towardCenter) * 1.5);
        edge.data('overviewBend', bend);
        edge.toggleClass('overview-curve', Math.abs(bend) > 0.5);
      }));
    }

    let overviewFrame = null;
    cy.on('position', 'node', () => {
      if (overviewFrame !== null || state.selected) return;
      overviewFrame = requestAnimationFrame(() => {
        overviewFrame = null;
        updateOverviewEdges();
      });
    });

    function applyFocus() {
      updateOverviewEdges();
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
      applyFocus();
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
