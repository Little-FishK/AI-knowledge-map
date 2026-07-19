/* 提及审计 —— 找出「正文里被强调、但没有成为节点」的概念
 *
 * 为什么需要这一步：
 * 节点清单是在动笔之前定的（且继承自外部目录的颗粒度），
 * 而「需要哪些节点」这件事，只有在写正文、要解释某个概念时才会暴露。
 * 缺了从写作回到清单的反向回路，就会出现「正文反复提到某概念，
 * 它却不是节点、也无处可点」的情况。
 *
 * 做法：抽出正文里 **加粗** 和 「」 强调的词，
 * 剔除已经是节点标题/别名/已被 [[]] 链接的，剩下的人工过一遍。
 *
 *   node tools/audit-mentions.js
 */
"use strict";
const path = require("path");
global.window = {};
require(path.join(__dirname, "..", "data", "graph.js"));
const G = global.window.GRAPH;

// 已知词汇：节点标题、别名、id
const known = new Set();
G.nodes.forEach(n => {
  known.add(n.title);
  known.add(n.id);
  (n.aliases || []).forEach(a => known.add(a));
});

// 正文骨架的小标题，不是概念
const SECTION_HEADERS = new Set([
  "是什么", "为什么会这样", "为什么会有这个限制", "它约束了什么", "怎么应对", "怎么用"
]);

const norm = s => s.trim().replace(/\s+/g, " ");
const hits = new Map();   // 词 -> 出现在哪些节点里

G.nodes.forEach(n => {
  const texts = [n.body || "", n.summary || ""]
    .concat((n.cases || []).map(c => (c.title || "") + " " + (c.text || "")));
  const linked = new Set();
  texts.join("\n").replace(/\[\[([a-z0-9-]+)\]\]/g, (m, id) => { linked.add(id); return m; });

  texts.forEach(t => {
    // 只看 **加粗**。「」在本项目的写作里多用于举例和反讽引用，噪声太大。
    [...t.matchAll(/\*\*(.+?)\*\*/g)].forEach(m => {
      const w = norm(m[1]);
      if (w.length < 2 || w.length > 8) return;          // 长的是句子不是术语
      if (known.has(w) || SECTION_HEADERS.has(w)) return;
      if (/[，。？！：；、]/.test(w)) return;               // 含标点 = 短语
      if (/^[a-z]/.test(w)) return;                       // 小写开头多为代码片段
      if (!hits.has(w)) hits.set(w, new Set());
      hits.get(w).add(n.id);
    });
  });
});

const rows = [...hits.entries()]
  .map(([w, ns]) => ({ word: w, count: ns.size, where: [...ns] }))
  .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

console.log("正文中被强调、但不是节点的词（按被提及的节点数排序）\n");
rows.forEach(r => {
  const flag = r.count >= 2 ? "★" : " ";
  console.log(`${flag} ${r.word.padEnd(16)} ${String(r.count).padStart(2)} 处  ${r.where.join(", ")}`);
});
console.log(`\n共 ${rows.length} 个词，其中被 2 个以上节点提及的 ${rows.filter(r => r.count >= 2).length} 个（★，优先考虑升格）`);
console.log("\n注意：这是线索不是结论。判断标准见 SPEC §3.1 —— 有独立身份、值得单独一张卡片、能与其他概念连线的，才该成为节点。");
