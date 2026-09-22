/* 导出节点坐标，用于更新 data/graph.js 的 positions 块
 *
 * 用法：
 *   1. 打开 index.html，把三个层全部勾上（隐藏节点不参与布局，会被堆在原点）
 *   2. 点「重置」强制重算布局（若已有固化坐标，普通加载不会重算）
 *   3. 把本文件粘进控制台执行，复制输出覆盖 graph.js 的 positions
 *
 * 输出会做两件归一化：
 *   - 统一朝向：fcose 谱初始化的特征向量符号任意，布局可能镜像，
 *     这里强制让 transformer 位于 attention 右侧
 *   - 平移到以 (0,0) 为中心
 */
(function dumpPositions() {
  const cy = window.__cy;
  const ns = cy.nodes().toArray();

  const hidden = ns.filter(n => n.hasClass("hidden"));
  if (hidden.length) {
    console.warn("⚠ 有 " + hidden.length + " 个节点当前被隐藏，它们的坐标不可信：",
                 hidden.map(n => n.id()));
    console.warn("  请勾上全部层级与大区后重新布局再导出。");
  }

  // 质量自检：区分同区(硬伤)与异区(可接受)重叠
  const bb = ns.map(n => n.boundingBox({ includeLabels: true, includeNodes: true }));
  const same = [], cross = [];
  for (let i = 0; i < bb.length; i++) {
    for (let j = i + 1; j < bb.length; j++) {
      const ox = Math.min(bb[i].x2, bb[j].x2) - Math.max(bb[i].x1, bb[j].x1);
      const oy = Math.min(bb[i].y2, bb[j].y2) - Math.max(bb[i].y1, bb[j].y1);
      if (ox > 0 && oy > 0) {
        const pair = ns[i].id() + " / " + ns[j].id();
        (ns[i].data("domain") === ns[j].data("domain") ? same : cross).push(pair);
      }
    }
  }
  console.log(same.length ? "⚠ 同区(同色)重叠 " + same.length + " 对（必须为 0）：" : "✓ 同区无重叠", same);
  console.log("  异区重叠 " + cross.length + " 对（可接受）", cross.length ? cross : "");

  const p = {};
  ns.forEach(n => { p[n.id()] = { x: n.position("x"), y: n.position("y") }; });

  const flip = (p["transformer"] && p["attention"] && p["transformer"].x < p["attention"].x) ? -1 : 1;
  const xs = ns.map(n => p[n.id()].x * flip);
  const ys = ns.map(n => p[n.id()].y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy0 = (Math.min(...ys) + Math.max(...ys)) / 2;

  const out = "  positions: {\n" + ns.map(n =>
    `    "${n.id()}": [${Math.round(p[n.id()].x * flip - cx)}, ${Math.round(p[n.id()].y - cy0)}]`
  ).join(",\n") + "\n  },";

  console.log(out);
  return out;
})();
