/* 数据校验 —— 每次改完 data/graph.js 必跑
 *   node tools/validate.js
 *
 * 已经踩过的坑，都在这里设了闸：
 *   - 中文正文里写英文双引号会直接破坏 JS 字符串语法（踩过两次）
 *   - [[xxx]] 内联引用指向不存在的节点，页面上会显示成红色的 xxx?
 *   - 边指向不存在的节点，渲染时被静默跳过
 *   - 节点缺 positions，会退化成现算布局，每次打开位置都不同
 */
"use strict";
const path = require("path");

global.window = {};
try {
  require(path.join(__dirname, "..", "data", "graph.js"));
} catch (e) {
  console.error("✗ graph.js 语法错误：");
  console.error("  " + e.message);
  console.error("\n  最常见的原因：中文正文里用了英文双引号 \" \"，请改成「」");
  process.exit(1);
}

const G = global.window.GRAPH;
const ids = new Set(G.nodes.map(n => n.id));
const problems = [];

// 官方推荐学习路径：节点与显示序号都必须唯一，并且必须回到真实节点
const recommendedSteps = (G.recommendedLearningPath || []).flatMap(phase => phase.steps || []);
const pathIds = recommendedSteps.map(step => step[1]);
const pathOrders = recommendedSteps.map(step => String(step[0]));
const duplicatePathIds = pathIds.filter((v, i, a) => a.indexOf(v) !== i);
const duplicatePathOrders = pathOrders.filter((v, i, a) => a.indexOf(v) !== i);
if (!recommendedSteps.length) problems.push("缺官方推荐学习路径 recommendedLearningPath");
if (recommendedSteps.length !== G.nodes.length) {
  problems.push(`官方推荐路径应覆盖全部 ${G.nodes.length} 个节点，实际 ${recommendedSteps.length} 个`);
}
if (duplicatePathIds.length) problems.push("官方推荐路径有重复节点：" + [...new Set(duplicatePathIds)].join(", "));
if (duplicatePathOrders.length) problems.push("官方推荐路径有重复序号：" + [...new Set(duplicatePathOrders)].join(", "));
recommendedSteps.forEach((step, index) => {
  if (!/^\d+(?:\.\d+)?$/.test(String(step[0]))) problems.push(`官方推荐路径 #${index + 1} 序号非法：${step[0]}`);
  if (!ids.has(step[1])) problems.push(`官方推荐路径 #${index + 1} 指向不存在的节点：${step[1]}`);
});
(G.recommendedLearningPath || []).forEach((phase, phaseIndex) => {
  const prefix = String(phaseIndex + 1);
  const orders = (phase.steps || []).map(step => String(step[0]));
  if (orders[0] !== prefix) problems.push(`官方推荐路径「${phase.phase}」必须从整数 ${prefix} 开始`);
  if (orders.filter(order => !order.includes(".")).length !== 1) {
    problems.push(`官方推荐路径「${phase.phase}」必须且只能有一个整数入口`);
  }
  orders.forEach(order => {
    if (order !== prefix && !order.startsWith(prefix + ".")) {
      problems.push(`官方推荐路径「${phase.phase}」出现跨区序号：${order}`);
    }
  });
});

// 重复 id
const dup = G.nodes.map(n => n.id).filter((v, i, a) => a.indexOf(v) !== i);
if (dup.length) problems.push("重复的节点 id：" + dup.join(", "));

// 悬空边
G.edges.forEach((e, i) => {
  if (!ids.has(e.from)) problems.push(`边 #${i} 的 from 指向不存在的节点：${e.from}`);
  if (!ids.has(e.to))   problems.push(`边 #${i} 的 to 指向不存在的节点：${e.to}`);
  if (!G.edgeTypes[e.type]) problems.push(`边 #${i} 用了未定义的类型：${e.type}`);
});

// 内联引用 [[id]]
const refRe = /\[\[([a-z0-9-]+)\]\]/g;
let refCount = 0;
G.nodes.forEach(n => {
  const texts = [n.body || ""].concat((n.cases || []).map(c => c.text || ""));
  texts.forEach(t => {
    let m;
    while ((m = refRe.exec(t)) !== null) {
      refCount++;
      if (!ids.has(m[1])) problems.push(`节点 ${n.id} 引用了不存在的 [[${m[1]}]]`);
      if (m[1] === n.id)  problems.push(`节点 ${n.id} 自己引用了自己`);
    }
  });
});

// 必填字段
G.nodes.forEach(n => {
  ["title", "summary", "domain"].forEach(f => {
    if (!n[f]) problems.push(`节点 ${n.id} 缺 ${f}`);
  });
  if (n.maturity && !["stable", "evolving"].includes(n.maturity)) {
    problems.push(`节点 ${n.id} 的 maturity 非法：${n.maturity}（应为 stable | evolving）`);
  }
  if (n.layer) problems.push(`节点 ${n.id} 仍有旧的 layer 字段，应改为 maturity`);
  if (!n.body) problems.push(`节点 ${n.id} 缺 body`);
  if (!n.cases || !n.cases.length) problems.push(`节点 ${n.id} 没有案例`);
  if (!G.domains[n.domain]) problems.push(`节点 ${n.id} 的 domain 未定义：${n.domain}`);
});

// 坐标
const missPos = G.nodes.filter(n => !G.positions || !G.positions[n.id]).map(n => n.id);
const extraPos = Object.keys(G.positions || {}).filter(id => !ids.has(id));
if (extraPos.length) problems.push("positions 里有已删除的节点：" + extraPos.join(", "));

// 孤岛节点（没有任何边）
const connected = new Set();
G.edges.forEach(e => { connected.add(e.from); connected.add(e.to); });
const orphans = G.nodes.filter(n => !connected.has(n.id)).map(n => n.id);

// 报告
console.log(`节点 ${G.nodes.length} · 边 ${G.edges.length} · 内联引用 ${refCount} · 推荐路径 ${recommendedSteps.length}`);
const byDomain = {};
G.nodes.forEach(n => { byDomain[n.domain] = (byDomain[n.domain] || 0) + 1; });
console.log("大区分布：" + Object.entries(byDomain).map(([k, v]) => `${k}=${v}`).join(" "));
const unusedTypes = Object.keys(G.edgeTypes).filter(t => !G.edges.some(e => e.type === t));
if (unusedTypes.length) console.log("⚠ 尚未使用的边类型：" + unusedTypes.join(", "));
if (orphans.length) console.log("⚠ 没有任何连接的节点：" + orphans.join(", "));
if (missPos.length) console.log(`⚠ ${missPos.length} 个节点没有固化坐标（需重跑布局）：` + missPos.join(", "));

if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(p => console.error("  - " + p));
  process.exit(1);
}
console.log("\n✓ 校验通过");
