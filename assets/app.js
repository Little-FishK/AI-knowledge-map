/* AI 知识地图 — 展示层
 * 只读 window.GRAPH 渲染，不写数据。入库是离线步骤（SPEC §2.3）。
 */
(function () {
  "use strict";

  const G = window.GRAPH;
  const DOMAINS = G.domains;
  const ETYPES = G.edgeTypes;

  const LAYER_RING = { base: "#6b8cbe", emerging: "#d3a05a", news: "#cf6f6f" };
  // 「关键关系」= 最能体现跨领域联系的几类，默认强调
  const KEY_EDGES = ["mitigates", "threatens", "constrains", "contrast"];

  const byId = {};
  G.nodes.forEach(n => { byId[n.id] = n; });

  const state = {
    layers: { base: true, emerging: false, news: false },
    domains: Object.fromEntries(Object.keys(DOMAINS).map(d => [d, true])),
    edges: Object.fromEntries(Object.keys(ETYPES).map(t => [t, true])),
    focus: false,
    hops: 1,
    selected: null
  };

  /* ───────────────────────── 图初始化 ───────────────────────── */

  const POS = G.positions || {};
  const elements = [];
  G.nodes.forEach(n => {
    const el = {
      data: {
        id: n.id, label: n.title, domain: n.domain, layer: n.layer,
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
    style: [
      {
        selector: "node",
        style: {
          "label": "data(label)",
          "background-color": ele => DOMAINS[ele.data("domain")] ? DOMAINS[ele.data("domain")].color : "#888",
          "border-width": 2.5,
          "border-color": ele => LAYER_RING[ele.data("layer")] || "#888",
          "border-opacity": 0.85,
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

  /* fcose 内部直接用 Math.random，没有 seed 选项。
   * 不加干预的话每次打开布局都不一样，质量随机波动——密集簇有时糊成一团。
   * 这里在布局期间把 Math.random 换成定种子的 PRNG，布局结束再还原，
   * 使同一份数据每次都得到完全相同、且已经挑过的那一版布局。
   * LAYOUT_SEED 是离线搜出来的：见 tools/find-seed.js。 */
  const LAYOUT_SEED = (G.meta && G.meta.layoutSeed) || 1;

  function withSeededRandom(seed, fn) {
    const orig = Math.random;
    let s = seed >>> 0;
    Math.random = function () {              // mulberry32
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    try { return fn(); } finally { Math.random = orig; }
  }

  function runLayout(force) {
    if (ALL_PINNED && !force) {   // 坐标已固化，无需现算
      cy.nodes().forEach(n => n.position({ x: POS[n.id()][0], y: POS[n.id()][1] }));
      fitView();
      return;
    }
    const l = cy.layout({
      name: "fcose",
      quality: "proof",
      // 必须同步：animate:true 时 fcose 的计算是异步的，withSeededRandom 的
      // finally 会在计算跑完前还原 Math.random，fcose 拿到半截被替换的随机流，
      // 算出退化布局（整张图塌成 89x74，fit 后 zoom 顶到 maxZoom）。
      // 节点量级下同步布局是瞬时的，动画本来也只是装饰。
      animate: false,
      // 必须 randomize：初始位置共线时 fcose 会卡在退化的局部最优里，
      // 表现为整张图塌成一条对角线（2026-07-19 实测踩到）
      randomize: true,
      // 中文标签又长又宽，不把标签计入尺寸的话密集簇里的字会互相压
      nodeDimensionsIncludeLabels: true,
      nodeSeparation: 130,
      idealEdgeLength: 150,
      nodeRepulsion: 22000,
      gravity: 0.1,
      numIter: 4000,
      padding: 40,
      // fcose 自己的 fit 会在动画结束后再跑一次，把下面的缩放上限覆盖掉
      // （表现为 zoom 顶到 maxZoom=3，节点巨大、只看得见一角）。这里自己接管。
      fit: false
    });
    withSeededRandom(LAYOUT_SEED, () => l.run());
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

  /* ───────────────────────── 过滤 ───────────────────────── */

  function applyFilters() {
    cy.batch(() => {
      cy.nodes().forEach(n => {
        const ok = state.layers[n.data("layer")] && state.domains[n.data("domain")];
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
    updateCounts();
    applyFocus();
  }

  function applyFocus() {
    cy.batch(() => {
      cy.elements().removeClass("dim hl");
      if (!state.focus || !state.selected) return;
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

  function updateCounts() {
    ["base", "emerging", "news"].forEach(l => {
      const el = document.getElementById("cnt-" + l);
      if (el) el.textContent = G.nodes.filter(n => n.layer === l).length || "";
    });
  }

  /* ───────────────────────── 详情面板 ───────────────────────── */

  const detail = document.getElementById("detail");
  const detailBody = document.getElementById("detail-body");

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 极简 markdown：**粗体**、`代码`、> 引用、- 列表、空行分段
  function mdLite(text) {
    if (!text) return "";
    const inline = s => esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

    return text.split(/\n\n+/).map(block => {
      const lines = block.split("\n");
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
    const layerTxt = { base: "基础层", emerging: "活跃层 L1", news: "活跃层 L2" }[n.layer] || n.layer;

    let h = "";
    h += `<div class="d-domain" style="color:${dom.color}">${dom.emoji} ${esc(dom.label)}
          <span style="color:var(--fg-faint)"> · ${layerTxt}</span></div>`;
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

    detailBody.querySelectorAll("[data-goto]").forEach(el => {
      el.addEventListener("click", () => select(el.getAttribute("data-goto"), true));
    });
  }

  function select(id, reveal) {
    const node = cy.getElementById(id);
    if (!node.length) return;
    const n = byId[id];
    // 跳转到被过滤掉的节点时，自动打开它所在的层与大区
    if (reveal && n) {
      let changed = false;
      if (!state.layers[n.layer]) { state.layers[n.layer] = true; changed = true; }
      if (!state.domains[n.domain]) { state.domains[n.domain] = true; changed = true; }
      if (changed) { syncControls(); applyFilters(); }
    }
    state.selected = id;
    cy.nodes().removeClass("sel");
    node.addClass("sel");
    applyFocus();
    openDetail(id);
    cy.animate({ center: { eles: node } }, { duration: 300 });
  }

  document.getElementById("detail-close").addEventListener("click", () => {
    detail.classList.add("closed");
    state.selected = null;
    cy.nodes().removeClass("sel");
    applyFocus();
  });

  cy.on("tap", "node", evt => select(evt.target.id(), false));
  cy.on("tap", evt => {
    if (evt.target === cy) {
      state.selected = null;
      cy.nodes().removeClass("sel");
      applyFocus();
    }
  });

  /* ───────────────────────── 控制栏 ───────────────────────── */

  // 大区
  const domList = document.getElementById("domain-list");
  Object.entries(DOMAINS).forEach(([key, d]) => {
    const count = G.nodes.filter(n => n.domain === key).length;
    const lab = document.createElement("label");
    lab.className = "chk";
    lab.innerHTML = `<input type="checkbox" data-domain="${key}" checked>
                     <span class="dot" style="background:${d.color}"></span>${d.label}<em>${count || ""}</em>`;
    domList.appendChild(lab);
  });

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

  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.layer)  { state.layers[t.dataset.layer] = t.checked; applyFilters(); }
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
  document.getElementById("edge-all").addEventListener("click", () => setEdges(() => true));
  document.getElementById("edge-none").addEventListener("click", () => setEdges(() => false));
  document.getElementById("edge-key").addEventListener("click", () => setEdges(k => KEY_EDGES.includes(k)));

  function syncControls() {
    document.querySelectorAll("[data-layer]").forEach(i => { i.checked = state.layers[i.dataset.layer]; });
    document.querySelectorAll("[data-domain]").forEach(i => { i.checked = state.domains[i.dataset.domain]; });
    document.querySelectorAll("[data-edge]").forEach(i => { i.checked = state.edges[i.dataset.edge]; });
  }

  document.getElementById("btn-reset").addEventListener("click", () => {
    state.layers = { base: true, emerging: false, news: false };
    Object.keys(state.domains).forEach(k => { state.domains[k] = true; });
    Object.keys(state.edges).forEach(k => { state.edges[k] = true; });
    state.selected = null;
    cy.nodes().removeClass("sel");
    detail.classList.add("closed");
    syncControls();
    applyFilters();
    runLayout(true);   // 「重置」强制重算，用于数据变动后导出新坐标
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

    results.querySelectorAll(".sr-item").forEach(el => {
      el.addEventListener("click", () => {
        select(el.dataset.id, true);
        results.classList.remove("open");
        search.value = "";
      });
    });
  }

  search.addEventListener("input", doSearch);
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
    `<b>节点填充</b> = 大区 &nbsp;·&nbsp; <b>描边</b> = 层级 &nbsp;·&nbsp; <b>大小</b> = 热度<br>` +
    `<b>连线颜色</b> = 关系类型 &nbsp;·&nbsp; 点击节点查看详情`;

  document.getElementById("meta-ver").textContent =
    `${G.meta.version} · ${G.meta.updatedAt}`;

  updateCounts();
  applyFilters();
  runLayout();

  // 暴露给调试用
  window.__cy = cy;
})();
