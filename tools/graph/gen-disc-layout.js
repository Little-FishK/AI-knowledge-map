/* 结构化圆盘布局生成器（确定性）。
 *
 * 用途：把 data/graph.js 的 positions 块重算成一个圆盘——六个用途大区各占
 * 一个扇区（角宽按节点数分配），扇区内部按官方推荐学习顺序由内向外排布。
 * 生成后复用 assets/layout-quality.js 的碰撞消解，保证同区节点视觉框不重叠、
 * 无节点被遮挡超过 3/4；再把结果居中、取整、写回 data/graph.js。
 *
 * 用法：node tools/graph/gen-disc-layout.js
 * 数据（节点/大区/学习路径）变动后重跑即可，无需浏览器。
 */
"use strict";
const path = require("path");
const {
  prepareGraphAuthorityWrite,
  writeGraphAuthority,
} = require("./shadow");

const ROOT = require("../shared/project-root").resolveProjectRoot("GRAPH_ROOT");
const GRAPH_FILE = path.join(ROOT, "data", "graph.js");
const graphBaseline = prepareGraphAuthorityWrite(ROOT);

const w = {};
global.window = w;
require(GRAPH_FILE);
const G = w.GRAPH;
const LQ = require(path.join(ROOT, "assets", "layout-quality.js"));

// 每个节点在官方推荐学习路径里的全局次序（决定它在扇区内的半径排序）
const pathIndex = {};
let counter = 0;
G.recommendedLearningPath.forEach(phase => phase.steps.forEach(([, id]) => { pathIndex[id] = counter++; }));
G.nodes.forEach(n => { if (!(n.id in pathIndex)) pathIndex[n.id] = counter++; }); // 兜底：不在路径里的排到最外

const CORE = new Set(G.core || []); // 核心节点排到各扇区最内圈
const domainOrder = Object.keys(G.domains);
const nodesByDomain = {};
domainOrder.forEach(d => { nodesByDomain[d] = []; });
G.nodes.forEach(n => { (nodesByDomain[n.domain] || (nodesByDomain[n.domain] = [])).push(n); });
const total = G.nodes.length;

// 扇区角宽：每区一个下限，剩余角度按节点数比例分配
const MIN_DEG = 24;
const remainder = 360 - MIN_DEG * domainOrder.length;
const spanDeg = {};
domainOrder.forEach(d => { spanDeg[d] = MIN_DEG + remainder * nodesByDomain[d].length / total; });

function buildDisc({ R0, ringGap, minArc }) {
  const positions = {};
  let angleCursor = -90; // 从正上方开始，顺时针铺开
  for (const d of domainOrder) {
    const span = spanDeg[d];
    const aStartDeg = angleCursor;
    const aEndDeg = angleCursor + span;
    angleCursor = aEndDeg;
    const padDeg = Math.min(3.5, span * 0.12);
    const a0 = (aStartDeg + padDeg) * Math.PI / 180;
    const a1 = (aEndDeg - padDeg) * Math.PI / 180;
    const angSpan = a1 - a0;
    const byOrder = list => list.slice().sort((p, q) => pathIndex[p.id] - pathIndex[q.id]);
    const coreList = byOrder(nodesByDomain[d].filter(n => CORE.has(n.id)));
    const restList = byOrder(nodesByDomain[d].filter(n => !CORE.has(n.id)));

    // 由内向外贪心填环：每环容量随半径（弧长）增长，外圈节点更多，间距均匀。
    // 返回下一个可用半径。
    const fillRings = (nodes, rStart) => {
      let idx = 0;
      let r = rStart;
      while (idx < nodes.length) {
        const cap = Math.max(1, Math.floor(r * angSpan / minArc));
        const take = Math.min(cap, nodes.length - idx);
        for (let k = 0; k < take; k++) {
          const t = take === 1 ? (a0 + a1) / 2 : a0 + angSpan * (k + 0.5) / take;
          positions[nodes[idx + k].id] = { x: r * Math.cos(t), y: r * Math.sin(t) };
        }
        idx += take;
        r += ringGap;
      }
      return r;
    };

    // 核心节点独占内环带；留一个更大的间隔再排其余节点，
    // 这样即便碰撞消解有微小位移，核心也始终严格居于内侧。
    let r = fillRings(coreList, R0);
    if (restList.length) fillRings(restList, r + ringGap * 0.6);
  }
  return positions;
}

// 逐组参数尝试，取第一组经碰撞消解后同区重叠=0 且无遮挡的结果
const attempts = [
  { R0: 150, ringGap: 104, minArc: 100 },
  { R0: 160, ringGap: 112, minArc: 108 },
  { R0: 170, ringGap: 120, minArc: 116 },
  { R0: 185, ringGap: 130, minArc: 126 }
];
let chosen = null;
for (const params of attempts) {
  const raw = buildDisc(params);
  const res = LQ.resolve(G.nodes, raw, { maxPasses: 400 });
  const { sameDomainOverlaps, occlusionViolations } = res.report;
  process.stdout.write(`尝试 R0=${params.R0} gap=${params.ringGap} arc=${params.minArc} -> passes=${res.passes} 同区重叠=${sameDomainOverlaps.length} 遮挡=${occlusionViolations.length}\n`);
  if (!sameDomainOverlaps.length && !occlusionViolations.length) { chosen = res; break; }
}
if (!chosen) { console.error("没有找到无重叠/无遮挡的参数组，请调整 attempts。"); process.exit(1); }

// 居中并取整
const pos = chosen.positions;
const ids = Object.keys(pos);
const cx = ids.reduce((a, id) => a + pos[id].x, 0) / ids.length;
const cy = ids.reduce((a, id) => a + pos[id].y, 0) / ids.length;
const out = {};
G.nodes.forEach(n => { const q = pos[n.id]; out[n.id] = [Math.round(q.x - cx), Math.round(q.y - cy)]; });

// 取整后复核
const rounded = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { x: v[0], y: v[1] }]));
const finalReport = LQ.audit(G.nodes, rounded);
if (finalReport.sameDomainOverlaps.length || finalReport.occlusionViolations.length) {
  console.error("取整后出现重叠/遮挡，请增大 ringGap/minArc。", finalReport.sameDomainOverlaps.length, finalReport.occlusionViolations.length);
  process.exit(1);
}

const nextGraph = JSON.parse(JSON.stringify(G));
nextGraph.positions = out;
const graphAuthority = writeGraphAuthority(ROOT, nextGraph, {
  expectedPreviousDigest: graphBaseline.sourceDigest,
});
console.log(
  `✓ 已通过权威分片写入 ${G.nodes.length} 个节点坐标（同区重叠 0，遮挡 0；${graphAuthority.status}）`,
);
