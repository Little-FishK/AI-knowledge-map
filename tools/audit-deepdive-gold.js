/*
 * L2 结构候选审计。
 *
 * 这不是质量评分器，也不授予“标杆”状态。它只判断页面是否具备进入
 * L3 自动“神经网络级”基准审计所需的可观察教学部件。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = process.env.DEEPDIVE_ROOT
  ? path.resolve(process.env.DEEPDIVE_ROOT)
  : path.join(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const context = { window: {} };
vm.createContext(context);

const scripts = [...indexHtml.matchAll(/<script src="([^"]+\.js)"><\/script>/g)]
  .map((match) => match[1])
  .filter((src) => src.startsWith("data/deepdive/"));
scripts.forEach((src) => {
  const file = path.join(root, ...src.split("/"));
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

function textLength(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#\d+);/g, " ")
    .replace(/\s+/g, " ")
    .length;
}

function blockWithClass(html, className) {
  const classAt = html.indexOf(`class="${className}"`);
  if (classAt < 0) return "";
  const openAt = html.lastIndexOf("<", classAt);
  const tag = (html.slice(openAt).match(/^<([\w-]+)/) || [])[1];
  if (!tag) return "";
  const tokenPattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  tokenPattern.lastIndex = openAt;
  let depth = 0;
  let token;
  while ((token = tokenPattern.exec(html))) {
    if (token[0].startsWith("</")) depth -= 1;
    else if (!token[0].endsWith("/>")) depth += 1;
    if (depth === 0) return html.slice(openAt, tokenPattern.lastIndex);
  }
  return "";
}

function goalCount(html) {
  const listItems = count(html, /<li\b/g);
  if (listItems) return listItems;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const content = text.replace(/^.*?读完[^：:]*[：:]/, "");
  return content.split(/[；;]/).map((item) => item.trim()).filter(Boolean).length;
}

function inspect(id, page) {
  const html = page.html || "";
  const sections = count(html, /<section class="dd-sec/g);
  const leads = count(html, /class="dd-lead"/g);
  const tables = count(html, /<table\b/g);
  const figures = count(html, /<figure\b/g);
  const svgs = count(html, /<svg\b/g);
  const standaloneSvgs = Math.max(0, svgs - figures);
  const formulas = count(html, /class="dd-formula/g);
  const codeBlocks = count(html, /<pre\b/g);
  const warnings = count(html, /class="dd-note warn/g);
  const goals = goalCount(blockWithClass(html, "dd-goals"));
  const questions = count(blockWithClass(html, "dd-quiz"), /<li\b/g);
  const answers = count(blockWithClass(html, "dd-answers"), /<li\b/g);
  const sourceLinks = [...blockWithClass(html, "dd-src").matchAll(/<a href="(https:\/\/[^"]+)"/g)]
    .map((match) => match[1]);
  const sources = new Set(sourceLinks).size;
  const routes = /概念依赖|延伸学习|学习路线|下一步/.test(html);
  const misconceptions = /常见误解|常见误区|误区与自测/.test(html);
  const exampleSignal = /手算|运行示例|完整示例|数值例子|案例推演|端到端示例|逐步演算/.test(html);
  const verificationSignal = /验收|验证|评测|指标|如何知道|先检查|诊断/.test(html);
  const artifactCount = tables + figures + standaloneSvgs + formulas + (codeBlocks > 0 ? 1 : 0);

  const gaps = [];
  if (sections < 9) gaps.push(`正文不足 9 节(${sections})`);
  if (leads < Math.min(sections, 8)) gaps.push(`问题引导不足(${leads})`);
  if (textLength(html) < 3000) gaps.push(`正文偏短(${textLength(html)}字)`);
  if (goals < 4) gaps.push(`学习目标不足 4(${goals})`);
  if (artifactCount < 3) gaps.push(`教学部件不足(${artifactCount})`);
  if (!figures && !standaloneSvgs) gaps.push("缺图示");
  if (!exampleSignal) gaps.push("缺可演算/可复现场景信号");
  if (!verificationSignal) gaps.push("缺实践验证或失败诊断信号");
  if (!warnings) gaps.push("缺困惑消歧");
  if (!misconceptions) gaps.push("缺独立误区整理");
  if (!routes) gaps.push("缺概念依赖与延伸路线");
  if (questions < 4) gaps.push(`自测不足 4(${questions})`);
  if (answers < questions) gaps.push(`答案未覆盖全部自测(${answers}/${questions})`);
  if (sources < 3) gaps.push(`独立来源不足 3(${sources})`);

  return { id, title: page.title || id, length: textLength(html), gaps };
}

const results = Object.entries(context.window.DEEPDIVE || {})
  .map(([id, page]) => inspect(id, page))
  .sort((a, b) => a.gaps.length - b.gaps.length || b.length - a.length);
const candidates = results.filter((item) => item.gaps.length === 0);
const near = results.filter((item) => item.gaps.length > 0 && item.gaps.length <= 3);
const rebuild = results.filter((item) => item.gaps.length > 3);
const summaryOnly = process.argv.includes("--summary");
const requireAt = process.argv.indexOf("--require-candidate");
const requireId = requireAt >= 0 ? process.argv[requireAt + 1] : "";
const changedOnly = process.argv.includes("--changed");
const baselineAt = process.argv.indexOf("--baseline");
const baselinePath = baselineAt >= 0 ? process.argv[baselineAt + 1] : "";

function idsFromSource(source) {
  return [
    ...source.matchAll(/window\.DEEPDIVE\s*\[\s*["']([^"']+)["']\s*\]\s*=/g),
    ...source.matchAll(/register\s*\(\s*["']([^"']+)["']/g),
  ].map((match) => match[1]);
}

function changedIds() {
  const baseRef = process.env.DEEPDIVE_BASE_REF || process.env.GITHUB_BASE_REF || "";
  if (!baseRef && process.env.CI) {
    return new Set(Object.keys(context.window.DEEPDIVE || {}));
  }
  const resolvedBase = baseRef.startsWith("origin/") || /^[0-9a-f]{7,40}$/i.test(baseRef)
    ? baseRef
    : `origin/${baseRef}`;
  const gitArgs = baseRef
    ? ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "diff", "--name-only", "--diff-filter=ACMR", `${resolvedBase}...HEAD`]
    : ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "status", "--porcelain"];
  const git = spawnSync("git", gitArgs, {
    cwd: root,
    encoding: "utf8",
  });
  if (git.status !== 0) return new Set(Object.keys(context.window.DEEPDIVE || {}));
  const ids = new Set();
  const all = new Set(Object.keys(context.window.DEEPDIVE || {}));
  const globalFiles = new Set([
    "data/graph.js",
    "index.html",
    "data/deepdive/00-deepdive-factory.js",
  ]);
  for (const line of git.stdout.split(/\r?\n/).filter(Boolean)) {
    const rawPath = (baseRef ? line : line.slice(3).split(" -> ").pop()).replace(/\\/g, "/");
    if (globalFiles.has(rawPath)) return all;
    if (!rawPath.startsWith("data/deepdive/") || !rawPath.endsWith(".js")) continue;
    const file = path.join(root, ...rawPath.split("/"));
    if (!fs.existsSync(file)) continue;
    idsFromSource(fs.readFileSync(file, "utf8")).forEach((id) => ids.add(id));
  }
  return ids;
}

function loadBaseline(file) {
  if (!file) return {};
  const resolved = path.resolve(root, file);
  return JSON.parse(fs.readFileSync(resolved, "utf8")).allowedGaps || {};
}

let enforcementFailures = [];
if (requireId) {
  const item = results.find((result) => result.id === requireId);
  if (!item) enforcementFailures = [`${requireId}: 页面不存在`];
  else enforcementFailures = item.gaps.map((gap) => `${requireId}: ${gap}`);
} else if (changedOnly) {
  const changed = changedIds();
  const allowed = loadBaseline(baselinePath);
  for (const item of results.filter((result) => changed.has(result.id))) {
    const oldGaps = new Set(allowed[item.id] || []);
    item.gaps
      .filter((gap) => !oldGaps.has(gap))
      .forEach((gap) => enforcementFailures.push(`${item.id}: 新增结构缺口：${gap}`));
  }
}

console.log(`L2 结构候选审计 · 页面 ${results.length} · 候选 ${candidates.length} · 接近 ${near.length} · 结构缺口较多 ${rebuild.length}`);
if (!summaryOnly) {
  console.log("\n结构候选（仍未进行准确性与教学质量认证）：");
  candidates.forEach((item) => console.log(`  ✓ ${item.id} · ${item.title}`));
}
console.log("\n接近结构候选：");
near.forEach((item) => console.log(`  △ ${item.id} · ${item.gaps.join("；")}`));
console.log("\n结构缺口较多：");
rebuild.forEach((item) => console.log(`  - ${item.id} · ${item.gaps.join("；")}`));

if (enforcementFailures.length) {
  console.error(`\n✗ L2 合并阻断发现 ${enforcementFailures.length} 个问题：`);
  enforcementFailures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
if (requireId) console.log(`\n✓ ${requireId} 达到 L2 结构候选要求`);
if (changedOnly) console.log(`\n✓ 变更页面没有超出 L2 已知基线的新缺口`);
