/* 软件教程校验 —— 每次改完 data/tutorials.js 必跑 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = process.env.TUTORIAL_ROOT
  ? path.resolve(process.env.TUTORIAL_ROOT)
  : path.join(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const tutorialScripts = [...indexHtml.matchAll(/<script src="(data\/tutorials[^"]*\.js)"><\/script>/g)]
  .map((match) => match[1]);
const requiredTutorialScripts = [
  "data/tutorials.js",
  "data/tutorials-codex-youtube.js",
  "data/tutorials-claude-code.js",
  "data/tutorials-video-generated.js"
];
const context = { window: {} };
vm.createContext(context);
try {
  const softwareFile = path.join(root, "data", "software.js");
  vm.runInContext(fs.readFileSync(softwareFile, "utf8"), context, { filename: softwareFile });
  tutorialScripts.forEach((src) => {
    const file = path.join(root, ...src.split("/"));
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  });
} catch (e) {
  console.error("✗ 语法错误：\n  " + e.message);
  process.exit(1);
}

const S = context.window.SOFTWARE;
const T = context.window.TUTORIALS;
const softwareIds = new Set(S.items.map(x => x.id));
const platformIds = new Set(T.platforms.map(x => x.id));
const problems = [];
const warnings = [];
let resourceCount = 0;
let formalCount = 0;
let candidateCount = 0;

// —— 评分门禁（TUTORIALS.md 三层审核）——
const EVIDENCE = new Set(["E0", "E1", "E2", "E3"]);
const STD_KEYS = ["accuracy", "alignment", "reproducibility", "traceability", "safety"];
const Q_WEIGHTS = { closure: 20, transfer: 15, completeness: 15, structure: 10, freshness: 5, accessibility: 5 };
const FORMAL_MIN = 53;   // 正式收录质量总分下限（满分 70）

function reviewTotal(quality) {   // Σ 权重 × 等级 ÷ 4
  return Object.entries(Q_WEIGHTS).reduce((s, [k, w]) => s + w * quality[k] / 4, 0);
}
function checkReview(r) {
  const rv = r.review;
  if (!rv || typeof rv !== "object") { problems.push(`资源 ${r.id || "?"} 缺 review 评分块`); return; }
  if (!EVIDENCE.has(rv.evidence)) problems.push(`资源 ${r.id} 的 review.evidence 非法：${rv.evidence}`);
  if (!["formal", "candidate"].includes(rv.status)) problems.push(`资源 ${r.id} 的 review.status 非法：${rv.status}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rv.reviewedAt || "")) problems.push(`资源 ${r.id} 的 review.reviewedAt 日期格式错误`);

  // 第二层：五项关键标准（若填写则校验取值 0/1/2）
  if (rv.standards != null) {
    if (typeof rv.standards !== "object") problems.push(`资源 ${r.id} 的 review.standards 应为对象或 null`);
    else STD_KEYS.forEach(k => { if (![0, 1, 2].includes(rv.standards[k])) problems.push(`资源 ${r.id} 的 review.standards.${k} 须为 0/1/2`); });
  }
  // 第三层：质量评分（若填写则每维 0-4 级）
  let total = null;
  if (rv.quality != null) {
    if (typeof rv.quality !== "object") { problems.push(`资源 ${r.id} 的 review.quality 应为对象或 null`); }
    else {
      let ok = true;
      Object.keys(Q_WEIGHTS).forEach(k => { if (![0, 1, 2, 3, 4].includes(rv.quality[k])) { ok = false; problems.push(`资源 ${r.id} 的 review.quality.${k} 须为 0-4 级`); } });
      if (ok) total = reviewTotal(rv.quality);
    }
  }

  if (rv.status === "formal") {
    formalCount++;
    // 正式收录 = 三层全过：E2+ / 五项全 2 / 总分 ≥ 53
    if (!["E2", "E3"].includes(rv.evidence)) problems.push(`资源 ${r.id} 标为正式收录，但证据等级 ${rv.evidence} 低于 E2`);
    if (rv.standards == null || !STD_KEYS.every(k => rv.standards[k] === 2)) problems.push(`资源 ${r.id} 标为正式收录，但五项关键标准未全部达到 2 分`);
    if (total == null) problems.push(`资源 ${r.id} 标为正式收录，但缺质量评分 review.quality`);
    else if (total < FORMAL_MIN) problems.push(`资源 ${r.id} 标为正式收录，但质量总分 ${total.toFixed(2)} < ${FORMAL_MIN}`);
  } else {
    candidateCount++;
    // 点二·张力：证据 E0/E1 却展示了完整教程总结（与 TUTORIALS.md 第一层 / §五 不符）
    if (["E0", "E1"].includes(rv.evidence) && Array.isArray(r.coverage) && r.coverage.length) {
      warnings.push(`资源 ${r.id}：证据 ${rv.evidence} 却已展示完整操作总结 —— 应完整观看补足证据升至 E2，或下调展示（TUTORIALS.md 第一层 / §五）`);
    }
  }
}

const appJs = fs.readFileSync(path.join(root, "assets", "app.js"), "utf8");
requiredTutorialScripts.forEach((src) => {
  if (!tutorialScripts.includes(src)) problems.push(`index.html 未加载 ${src}`);
});
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
    ["title", "creator", "url", "publishedAt", "duration", "audience", "summary", "caution"].forEach(f => {
      if (!r[f]) problems.push(`资源 ${r.id || "?"} 缺 ${f}`);
    });
    if (!/^https:\/\//.test(r.url || "")) problems.push(`资源 ${r.id || "?"} 不是 HTTPS 链接`);
    if (!Array.isArray(r.coverage) || !r.coverage.length) {
      problems.push(`资源 ${r.id || "?"} 缺完整操作`);
    } else {
      r.coverage.forEach((section, index) => {
        if (!section.title) problems.push(`资源 ${r.id || "?"} 的操作 ${index + 1} 缺标题`);
        if (!Array.isArray(section.steps) || !section.steps.length) problems.push(`资源 ${r.id || "?"} 的操作 ${index + 1} 缺步骤`);
        if (!section.done) problems.push(`资源 ${r.id || "?"} 的操作 ${index + 1} 缺完成标志`);
      });
    }
    if (!Array.isArray(r.uniqueTechniques) || !r.uniqueTechniques.length) {
      problems.push(`资源 ${r.id || "?"} 缺独门内容`);
    } else {
      r.uniqueTechniques.forEach((item, index) => {
        ["title", "scenario", "result"].forEach(f => {
          if (!item[f]) problems.push(`资源 ${r.id || "?"} 的独门内容 ${index + 1} 缺 ${f}`);
        });
        if (!Array.isArray(item.steps) || !item.steps.length) problems.push(`资源 ${r.id || "?"} 的独门内容 ${index + 1} 缺步骤`);
      });
    }
    checkReview(r);
  });
});

console.log(`软件教程 ${Object.keys(T.items || {}).length} · 平台 ${T.platforms.length} · 资源 ${resourceCount}（正式收录 ${formalCount} · 候选 ${candidateCount}）`);
if (warnings.length) {
  console.log("\n⚠ 评分提醒（不阻断，但应尽快处理）：");
  warnings.forEach(w => console.log("  - " + w));
}
if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(p => console.error("  - " + p));
  process.exit(1);
}
console.log("\n✓ 教程数据校验通过");
