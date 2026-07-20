/* 软件目录校验 —— 每次改完 data/software.js 必跑
 *   node tools/validate-software.js
 *
 * 拦的坑（和 validate.js 同源）：
 *   - 中文正文里用英文双引号破坏 JS 字符串
 *   - concept 指向不存在的概念节点
 *   - [[xxx]] 内联引用指向不存在的概念节点或软件条目
 *   - cat 用了未定义的门类
 *   - 重复的 item id
 */
"use strict";
const path = require("path");
global.window = {};
try {
  require(path.join(__dirname, "..", "data", "graph.js"));
  require(path.join(__dirname, "..", "data", "software.js"));
} catch (e) {
  console.error("✗ 语法错误：\n  " + e.message);
  console.error("\n  最常见原因：中文正文里用了英文双引号 \" \"，请改成「」");
  process.exit(1);
}

const nodeIds = new Set(global.window.GRAPH.nodes.map(n => n.id));
const S = global.window.SOFTWARE;
const swIds = new Set(S.items.map(i => i.id));
const cats = new Set(S.categories.map(c => c.id));
const problems = [];

const dup = S.items.map(i => i.id).filter((v, i, a) => a.indexOf(v) !== i);
if (dup.length) problems.push("重复的 item id：" + dup.join(", "));

const refRe = /\[\[([a-z0-9-]+)\]\]/g;
let refCount = 0;
S.items.forEach(it => {
  ["id", "name", "cat", "summary", "body"].forEach(f => {
    if (!it[f]) problems.push(`软件 ${it.id || "?"} 缺 ${f}`);
  });
  if (it.cat && !cats.has(it.cat)) problems.push(`软件 ${it.id} 的 cat 未定义：${it.cat}`);
  if (it.concept && !nodeIds.has(it.concept)) problems.push(`软件 ${it.id} 的 concept 指向不存在的节点：${it.concept}`);
  let m;
  while ((m = refRe.exec(it.body || "")) !== null) {
    refCount++;
    if (!nodeIds.has(m[1]) && !swIds.has(m[1])) problems.push(`软件 ${it.id} 引用了不存在的 [[${m[1]}]]`);
  }
});

const byCat = {};
S.items.forEach(i => { byCat[i.cat] = (byCat[i.cat] || 0) + 1; });
console.log(`软件 ${S.items.length} · 门类 ${S.categories.length} · 内联引用 ${refCount}`);
console.log("门类分布：" + S.categories.map(c => `${c.id}=${byCat[c.id] || 0}`).join(" "));
const empty = S.categories.filter(c => !byCat[c.id]).map(c => c.id);
if (empty.length) console.log("⚠ 空门类：" + empty.join(", "));

if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(p => console.error("  - " + p));
  process.exit(1);
}
console.log("\n✓ 校验通过");
