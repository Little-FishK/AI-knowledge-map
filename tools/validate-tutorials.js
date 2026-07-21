/* 软件教程校验 —— 每次改完 data/tutorials.js 必跑 */
"use strict";
const fs = require("fs");
const path = require("path");
global.window = {};
try {
  require(path.join(__dirname, "..", "data", "software.js"));
  require(path.join(__dirname, "..", "data", "tutorials.js"));
} catch (e) {
  console.error("✗ 语法错误：\n  " + e.message);
  process.exit(1);
}

const S = global.window.SOFTWARE;
const T = global.window.TUTORIALS;
const softwareIds = new Set(S.items.map(x => x.id));
const platformIds = new Set(T.platforms.map(x => x.id));
const problems = [];
let resourceCount = 0;

const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(__dirname, "..", "assets", "app.js"), "utf8");
if (!indexHtml.includes('src="data/tutorials.js"')) problems.push("index.html 未加载 data/tutorials.js");
if (!appJs.includes("data-tutorial") || !appJs.includes("openTutorial")) problems.push("app.js 未接入软件教程按钮或打开逻辑");

const platformDup = T.platforms.map(x => x.id).filter((v, i, a) => a.indexOf(v) !== i);
if (platformDup.length) problems.push("重复的平台 id：" + platformDup.join(", "));

Object.entries(T.items || {}).forEach(([softwareId, tutorial]) => {
  if (!softwareIds.has(softwareId)) problems.push(`教程 ${softwareId} 没有对应软件`);
  ["title", "subtitle", "overview", "sourceNote", "accessDate"].forEach(f => {
    if (!tutorial[f]) problems.push(`教程 ${softwareId} 缺 ${f}`);
  });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tutorial.accessDate || "")) problems.push(`教程 ${softwareId} 访问日期格式错误`);
  const seen = new Set();
  (tutorial.resources || []).forEach(r => {
    resourceCount++;
    if (!r.id || seen.has(r.id)) problems.push(`教程 ${softwareId} 有空或重复资源 id：${r.id || "?"}`);
    seen.add(r.id);
    if (!platformIds.has(r.platform)) problems.push(`资源 ${r.id} 使用未定义平台：${r.platform}`);
    ["title", "creator", "url", "focus", "caution"].forEach(f => {
      if (!r[f]) problems.push(`资源 ${r.id || "?"} 缺 ${f}`);
    });
    if (!/^https:\/\//.test(r.url || "")) problems.push(`资源 ${r.id || "?"} 不是 HTTPS 链接`);
    if (!Array.isArray(r.takeaways) || r.takeaways.length < 2) problems.push(`资源 ${r.id || "?"} 至少需要 2 条价值提炼`);
  });
});

console.log(`软件教程 ${Object.keys(T.items || {}).length} · 平台 ${T.platforms.length} · 资源 ${resourceCount}`);
if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(p => console.error("  - " + p));
  process.exit(1);
}
console.log("✓ 教程数据校验通过");
