/* 理解原理页 L1 发布门禁 —— node tools/validate-deepdives.js */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = process.env.DEEPDIVE_ROOT
  ? path.resolve(process.env.DEEPDIVE_ROOT)
  : path.join(__dirname, "..");
const deepDiveDir = path.join(root, "data", "deepdive");
const context = { window: {} };
vm.createContext(context);

function load(file, target = context) {
  vm.runInContext(fs.readFileSync(file, "utf8"), target, { filename: file });
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

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

function goalCount(html) {
  const listItems = count(html, /<li\b/g);
  if (listItems) return listItems;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const content = text.replace(/^.*?读完[^：:]*[：:]/, "");
  return content.split(/[；;]/).map((item) => item.trim()).filter(Boolean).length;
}

load(path.join(root, "data", "graph.js"));
const deepDiveFiles = fs.readdirSync(deepDiveDir)
  .filter((file) => file.endsWith(".js"))
  .sort();
deepDiveFiles.forEach((file) => load(path.join(deepDiveDir, file)));

const graph = context.window.GRAPH;
const pages = context.window.DEEPDIVE || {};
const nodeIds = graph.nodes.map((node) => node.id);
const nodeIdSet = new Set(nodeIds);
const problems = [];

if (nodeIdSet.size !== nodeIds.length) {
  problems.push("data/graph.js 存在重复节点 id");
}

// 所有节点都必须有页面，不再只检查 core。
nodeIds.forEach((id) => {
  if (!pages[id]) problems.push(`${id}: 缺理解原理页`);
});

const extras = Object.keys(pages).filter((id) => !nodeIdSet.has(id));
if (extras.length) problems.push(`存在无对应节点的原理页：${extras.join(", ")}`);

// 同一个 id 不应由多个文件注册。共享页面包可以注册多个 id，但每个 id 只能有一个来源文件。
const registrations = new Map();
deepDiveFiles.forEach((file) => {
  const source = fs.readFileSync(path.join(deepDiveDir, file), "utf8");
  const ids = [
    ...source.matchAll(/window\.DEEPDIVE\s*\[\s*["']([^"']+)["']\s*\]\s*=/g),
    ...source.matchAll(/register\s*\(\s*["']([^"']+)["']/g),
  ].map((match) => match[1]);
  ids.forEach((id) => {
    if (!registrations.has(id)) registrations.set(id, []);
    registrations.get(id).push(file);
  });
});
for (const [id, files] of registrations) {
  const uniqueFiles = [...new Set(files)];
  if (uniqueFiles.length > 1) {
    problems.push(`${id}: 存在多个注册来源（${uniqueFiles.join(", ")}）`);
  }
}

for (const [id, page] of Object.entries(pages)) {
  if (!page) continue;
  const html = page.html || "";
  const required = [
    [page.title, "title"],
    [page.subtitle, "subtitle"],
    [page.thesis, "thesis"],
    [html.includes('class="dd-goals"'), "学习目标"],
    [
      html.includes('class="dd-chain"')
        || (/<figure\b[\s\S]*?<\/figure>/i.test(html)
          && /输入|参考录音/.test(html)
          && /生成|输出/.test(html)
          && /反馈|评测/.test(html)),
      "因果链"
    ],
    [html.includes('class="dd-quiz"'), "自测题"],
    [html.includes('class="dd-answers"'), "参考答案"],
    [html.includes('class="dd-src"'), "资料来源"],
  ];
  required.forEach(([ok, label]) => {
    if (!ok) problems.push(`${id}: 缺 ${label}`);
  });

  const sections = count(html, /<section class="dd-sec"/g);
  const goals = goalCount(blockWithClass(html, "dd-goals"));
  const questions = count(blockWithClass(html, "dd-quiz"), /<li\b/g);
  const answers = count(blockWithClass(html, "dd-answers"), /<li\b/g);
  const sourceBlock = blockWithClass(html, "dd-src");
  const sourceLinks = [...sourceBlock.matchAll(/<a href="(https:\/\/[^"]+)"/g)].map((match) => match[1]);
  const distinctSources = new Set(sourceLinks);
  const dateMatch = sourceBlock.match(/(?:访问日期：|访问于\s*)(\d{4}-\d{2}-\d{2})/);

  if (sections < 7) problems.push(`${id}: 章节不足 7（当前 ${sections}）`);
  if (goals < 3) problems.push(`${id}: 学习目标不足 3（当前 ${goals}）`);
  if (questions < 3) problems.push(`${id}: 自测题不足 3（当前 ${questions}）`);
  if (answers < questions) problems.push(`${id}: 参考答案少于自测题（${answers}/${questions}）`);
  if (distinctSources.size < 2) problems.push(`${id}: 独立 HTTPS 来源不足 2（当前 ${distinctSources.size}）`);
  if (sourceLinks.length !== distinctSources.size) problems.push(`${id}: 来源列表存在重复链接`);

  if (!dateMatch) {
    problems.push(`${id}: 缺合法来源访问日期`);
  } else {
    const parsed = new Date(`${dateMatch[1]}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    if (Number.isNaN(parsed.getTime())) problems.push(`${id}: 来源访问日期无法解析`);
    if (parsed > today) problems.push(`${id}: 来源访问日期晚于当前日期（${dateMatch[1]}）`);
  }
}

// 按浏览器入口中的真实顺序重新执行，防止遗漏脚本或后加载脚本覆盖精修内容。
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const indexContext = { window: {} };
vm.createContext(indexContext);
const indexScripts = [...indexHtml.matchAll(/<script src="([^"]+\.js)"><\/script>/g)]
  .map((match) => match[1])
  .filter((src) => src === "data/graph.js" || src.startsWith("data/deepdive/"));
indexScripts.forEach((src) => {
  const file = path.join(root, ...src.split("/"));
  if (!fs.existsSync(file)) {
    problems.push(`index.html 引用了不存在的脚本：${src}`);
    return;
  }
  load(file, indexContext);
});

const indexPages = indexContext.window.DEEPDIVE || {};
Object.keys(pages).forEach((id) => {
  if (!indexPages[id]) {
    problems.push(`${id}: index.html 运行后未注册原理页`);
  } else if (indexPages[id].title !== pages[id].title || indexPages[id].html !== pages[id].html) {
    problems.push(`${id}: index.html 最终内容被覆盖或与目录审计不一致`);
  }
});

console.log(`L1 发布门禁 · 地图节点 ${nodeIds.length} · 已加载原理页 ${Object.keys(pages).length}`);
if (problems.length) {
  console.error(`\n✗ 发现 ${problems.length} 个阻断问题：`);
  problems.forEach((problem) => console.error(`  - ${problem}`));
  process.exit(1);
}

console.log("✓ 全部页面通过覆盖、注册、结构、自测配对、独立来源与日期门禁");
