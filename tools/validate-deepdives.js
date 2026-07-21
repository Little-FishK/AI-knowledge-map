/* 核心理解原理页质量门禁 —— node tools/validate-deepdives.js */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const context = { window: {} };
vm.createContext(context);

function load(file) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}

load(path.join(root, "data", "graph.js"));
const deepDiveDir = path.join(root, "data", "deepdive");
fs.readdirSync(deepDiveDir)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => load(path.join(deepDiveDir, file)));

const graph = context.window.GRAPH;
const pages = context.window.DEEPDIVE || {};
const problems = [];
const datePattern = /访问日期：\d{4}-\d{2}-\d{2}/;

for (const id of graph.core) {
  const page = pages[id];
  if (!page) {
    problems.push(`${id}: 缺理解原理页`);
    continue;
  }

  const html = page.html || "";
  const checks = [
    [page.title, "title"],
    [page.subtitle, "subtitle"],
    [page.thesis, "thesis"],
    [html.includes('class="dd-goals"'), "学习目标"],
    [html.includes('class="dd-chain"'), "因果链"],
    [html.includes('class="dd-quiz"'), "自测题"],
    [html.includes('class="dd-answers"'), "参考答案"],
    [html.includes('class="dd-src"'), "资料来源"],
    [datePattern.test(html), "来源访问日期"],
  ];
  checks.forEach(([ok, label]) => {
    if (!ok) problems.push(`${id}: 缺 ${label}`);
  });

  const sectionCount = (html.match(/<section class="dd-sec">/g) || []).length;
  const sourceCount = (html.match(/<a href="https:\/\//g) || []).length;
  const quizCount = (html.match(/<li>/g) || []).length;
  if (sectionCount < 7) problems.push(`${id}: 章节不足 7（当前 ${sectionCount}）`);
  if (sourceCount < 2) problems.push(`${id}: 一手资料链接不足 2（当前 ${sourceCount}）`);
  if (quizCount < 10) problems.push(`${id}: 列表/练习内容过少，需人工复核`);
}

const extras = Object.keys(pages).filter((id) => !graph.nodes.some((node) => node.id === id));
if (extras.length) problems.push(`存在无对应节点的原理页：${extras.join(", ")}`);

console.log(`核心节点 ${graph.core.length} · 已加载原理页 ${Object.keys(pages).length}`);
if (problems.length) {
  console.error(`\n✗ 原理页质量门禁发现 ${problems.length} 个问题：`);
  problems.forEach((problem) => console.error(`  - ${problem}`));
  process.exit(1);
}

console.log(`✓ ${graph.core.length}/${graph.core.length} 核心页通过结构、练习与来源门禁`);
