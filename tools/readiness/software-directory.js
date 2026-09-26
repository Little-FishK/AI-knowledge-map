"use strict";
// Server-rendered directory for the software catalogue and its tutorials.
//
// /software/ is an app shell: it renders from window.SOFTWARE and window.TUTORIALS,
// so a crawler that does not execute JavaScript sees navigation chrome only. This
// page publishes the same records as plain HTML.
//
// Presentation only: no record is added, removed or reworded here.
const fs = require("node:fs");
const path = require("node:path");

// Kept beside the artefact copy list in site-artifact.js on purpose: the two must
// move together when a tutorial data file is added.
const SOFTWARE_DATA_FILES = ["data/software.js"];
const TUTORIAL_DATA_FILES = ["data/tutorials.js", "data/tutorials-codex-youtube.js", "data/tutorials-claude-code.js", "data/tutorials-video-generated.js"];

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));

const loaded = new Map();

function load(root, files) {
  const previous = global.window;
  global.window = {};
  try {
    for (const file of files) {
      const absolute = path.join(root, file);
      if (!fs.existsSync(absolute)) continue;
      require(absolute);
    }
    return {software: global.window.SOFTWARE || null, tutorials: global.window.TUTORIALS || null};
  } finally {
    global.window = previous;
  }
}

function loadSoftware(root) {
  if (loaded.has(root)) return loaded.get(root);
  const data = load(root, [...SOFTWARE_DATA_FILES, ...TUTORIAL_DATA_FILES]);
  loaded.set(root, data);
  return data;
}

function models(list) {
  if (!Array.isArray(list) || !list.length) return "";
  return `<p class="rd-models"><b>当前主要型号：</b>${list.map(model => `${esc(model.name)}（${esc(model.note || "")}）`).join("；")}</p>`;
}

function softwareCard(item, context) {
  const {base, published, nodeIds} = context;
  const concept = item.concept && nodeIds.has(item.concept) ? item.concept : null;
  const group = context.tutorials[item.id];
  return [
    `<li class="rd-item" id="software-${esc(item.id)}">`,
    `<h3>${esc(item.name)}</h3>`,
    `<p class="rd-meta">${[item.by ? `提供方：${esc(item.by)}` : "", group ? `配套教程：${esc(group.title)}` : ""].filter(Boolean).join(" · ")}</p>`,
    item.summary ? `<p class="rd-summary">${esc(item.summary)}</p>` : "",
    item.body ? `<p>${esc(item.body)}</p>` : "",
    models(item.models),
    concept ? `<p class="rd-nodes"><b>关联概念：</b><a href="${published.has(concept) ? `${base}zh/concepts/${esc(concept)}/` : `${base}?lang=zh-Hans&amp;node=${encodeURIComponent(concept)}`}">${esc(concept)}</a></p>` : "",
    "</li>",
  ].filter(Boolean).join("");
}

function tutorialSection(group, context) {
  const resources = (group.resources || []).filter(resource => resource && resource.url);
  if (!resources.length) return "";
  return [
    `<section id="tutorial-${esc(group.id)}">`,
    `<h2>${esc(group.title)}</h2>`,
    group.subtitle ? `<p class="rd-subnote">${esc(group.subtitle)}</p>` : "",
    group.overview ? `<p>${esc(group.overview)}</p>` : "",
    `<ul class="rd-list">${resources.map(resource => [
      `<li class="rd-item">`,
      `<h3><a href="${esc(resource.url)}" rel="noopener noreferrer">${esc(resource.title)}</a></h3>`,
      `<p class="rd-meta">${[resource.creator ? `作者：${esc(resource.creator)}` : "", resource.platform ? `平台：${esc(resource.platform)}` : "", resource.publishedAt ? `发布：${esc(resource.publishedAt)}` : "", resource.duration ? `时长：${esc(resource.duration)}` : ""].filter(Boolean).join(" · ")}</p>`,
      resource.summary ? `<p class="rd-summary">${esc(resource.summary)}</p>` : "",
      `</li>`,
    ].join("")).join("")}</ul>`,
    `</section>`,
  ].filter(Boolean).join("");
}

// Returns presentation for the catalogue page, or null when no software data is
// present (a minimal artefact fixture legitimately has none).
function softwarePages(root, {siteUrl, base, nodes = [], publishedConcepts = []} = {}) {
  const {software, tutorials} = loadSoftware(root);
  if (!software || !Array.isArray(software.items) || !software.items.length) return {pages: [], items: 0, tutorials: 0};
  const nodeIds = new Set(nodes.map(node => node.id));
  const published = new Set(publishedConcepts);
  const groups = tutorials?.items || {};
  for (const [id, group] of Object.entries(groups)) if (group && !group.id) group.id = id;
  const context = {base, published, nodeIds, tutorials: groups};
  const categories = (software.categories || []).filter(category => software.items.some(item => item.cat === category.id));
  const groupsWithSoftware = categories.map(category => ({category, items: software.items.filter(item => item.cat === category.id)}));
  const tutorialGroups = Object.values(groups).filter(group => group && Array.isArray(group.resources) && group.resources.length);
  const url = new URL("software/catalog/", siteUrl).href;
  const body = [
    `<p class="rd-intro">本页是 AI 软件目录的文字版本：按 ${groupsWithSoftware.length} 个用途门类列出 ${software.items.length} 个软件，并给出 ${tutorialGroups.length} 组配套使用教程（共 ${tutorialGroups.reduce((total, group) => total + group.resources.length, 0)} 条资源）。无需 JavaScript 即可完整阅读与跳转。</p>`,
    `<nav class="rd-classnav" aria-label="用途门类"><ul>${groupsWithSoftware.map(({category, items}) => `<li><a href="#cat-${esc(category.id)}">${esc(category.label)}</a> <span>${items.length} 个</span></li>`).join("")}</ul></nav>`,
    groupsWithSoftware.map(({category, items}) => `<section id="cat-${esc(category.id)}"><h2>${esc(category.label)}</h2><ul class="rd-list">${items.map(item => softwareCard(item, context)).join("")}</ul></section>`).join(""),
    tutorialGroups.length ? `<h2>使用教程</h2><p>教程按软件分组，每条资源都指向原始发布位置。</p>${tutorialGroups.map(group => tutorialSection(group, context)).join("")}` : "",
    `<p class="rd-note"><a href="${base}">返回知识地图</a> · <a href="${base}search/">搜索与文字目录</a> · <a href="${base}library/">专业资料库</a></p>`,
  ].filter(Boolean).join("");
  return {
    pages: [{
      path: "software/catalog/",
      title: "AI 软件目录与使用教程（文字版）",
      navLabel: "AI 软件目录与教程",
      description: `按 ${groupsWithSoftware.length} 个用途门类浏览 ${software.items.length} 个 AI 软件，并查看配套使用教程。`,
      section: {name: "AI 软件目录", path: "software/"},
      breadcrumbs: [],
      body,
      extraSchemas: [{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "AI 软件目录",
        url,
        numberOfItems: software.items.length,
        itemListElement: software.items.map((item, index) => ({"@type": "ListItem", position: index + 1, name: item.name, url: `${base}software/?item=${encodeURIComponent(item.id)}`})),
      }],
    }],
    items: software.items.length,
    tutorials: tutorialGroups.length,
  };
}

module.exports = {softwarePages, loadSoftware, SOFTWARE_DATA_FILES, TUTORIAL_DATA_FILES};
