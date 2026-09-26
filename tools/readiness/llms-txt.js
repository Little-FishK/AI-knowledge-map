"use strict";
// Plain-text indexes for AI systems: /llms.txt (a short map) and
// /llms-full.txt (every record, one line each).
//
// Why publish these when PHASE8 correctly recorded that llms.txt is not a ranking
// factor: ranking was never the purpose. This project already *consumes* upstream
// llms.txt files when it builds source inventories (platform.claude.com,
// code.claude.com, huggingface.co), which proves the format is useful to the
// systems reading it. Refusing to publish one while holding 1800+ reviewed,
// structured sources only forces downstream readers to guess. The decision record
// is docs/seo/2026-09-25-LLMS-TXT.md and it states plainly that no ranking benefit
// is claimed.
const path = require("node:path");
const {loadLibrary} = require("./library-directory");
const {loadSoftware} = require("./software-directory");

const line = value => String(value ?? "").replace(/\s+/g, " ").trim();
const label = value => line(value).replace(/([[\]])/g, "\\$1");
const link = (title, url) => `- [${label(title)}](${url})`;

function llmsTxt(root, {siteUrl, entries = [], library, software} = {}) {
  const url = relative => new URL(relative, siteUrl).href;
  const data = library || loadLibrary(root);
  const apps = software || loadSoftware(root).software;
  const locales = [...new Set(entries.map(entry => entry.locale))];
  const parts = [
    "# AI 知识地图 / AI Knowledge Map",
    "",
    "> 面向 AI 初学者与非技术读者的免费知识地图：把概念原理、专业资料库、AI 软件目录、使用教程和学习进度放在同一个静态站点里。概念页中的每一条解释都标注来源与认识论边界；资料库中的每一条资料都记录审核状态、证据用途与使用边界。",
    "",
    `站点根：${url("")}`,
    "",
    "## 学习指南",
    "",
    ...locales.map(locale => link(locale === "en" ? "English learning guide" : "中文学习指南", url(`${locale}/`))),
    link("搜索与文字目录（含全部概念关系）", url("search/")),
    "",
    "## 概念理解页",
    "",
    `${entries.length} 篇已发布的理解页，按语言分列：`,
    "",
    ...locales.map(locale => `- ${locale === "en" ? "en" : "zh-Hans"}：${entries.filter(entry => entry.locale === locale).length} 篇 → ${url(`${locale}/`)}`),
    "",
  ];
  if (data?.items?.length) {
    parts.push("## 专业资料库", "", `共 ${data.items.length} 条经来源治理收录的资料，按一级来源分类：`, "");
    for (const source of data.sourceClasses || []) {
      const count = data.items.filter(item => item.sourceClass === source.id).length;
      if (!count) continue;
      parts.push(link(`${source.label}（${source.short}）`, url(`library/${source.id}/`)) + ` — ${count} 条`);
    }
    parts.push("", `完整条目索引见 ${url("llms-full.txt")}。`, "");
  }
  if (apps?.items?.length) {
    parts.push("## AI 软件目录与使用教程", "", link("AI 软件目录与使用教程（文字版）", url("software/catalog/")) + ` — ${apps.items.length} 个软件`, "");
  }
  parts.push("## 关于", "", link("关于项目、许可与纠错入口", url("about/")), "");
  return parts.join("\n");
}

function llmsFullTxt(root, {siteUrl, entries = [], library, software} = {}) {
  const url = relative => new URL(relative, siteUrl).href;
  const data = library || loadLibrary(root);
  const {software: apps, tutorials} = software ? {software, tutorials: null} : loadSoftware(root);
  const groups = tutorials?.items || {};
  const parts = [
    "# AI 知识地图 · 完整条目索引 / AI Knowledge Map · Full Index",
    "",
    `> 本文件列出站点全部可读记录及其原始链接，供 AI 系统直接引用。共 ${entries.length} 篇理解页${data?.items?.length ? `、${data.items.length} 条资料库资料` : ""}${apps?.items?.length ? `、${apps.items.length} 个软件` : ""}。站点地图：${url("sitemap.xml")}`,
    "",
  ];
  if (entries.length) {
    parts.push("## 概念理解页", "");
    for (const entry of entries) {
      const subtitle = entry.page?.subtitle ? ` — ${line(entry.page.subtitle)}` : "";
      parts.push(link(entry.page?.title || entry.id, url(`${entry.locale}/concepts/${entry.id}/`)) + subtitle);
    }
    parts.push("");
  }
  if (data?.items?.length) {
    parts.push("## 专业资料库", "");
    for (const source of data.sourceClasses || []) {
      const items = data.items.filter(item => item.sourceClass === source.id);
      if (!items.length) continue;
      parts.push(`### ${line(source.label)}（${line(source.short)}）— ${items.length} 条`, "");
      parts.push(`目录页：${url(`library/${source.id}/`)}`, "");
      for (const item of items) {
        const notes = [
          item.publisher ? line(item.publisher) : "",
          item.contentKind ? line(item.contentKind) : "",
          item.authorityTier ? `权威分层 ${line(item.authorityTier)}` : "",
          item.discoveryOnly ? "仅用于发现" : "",
        ].filter(Boolean).join(" · ");
        const evidence = item.evidenceUse ? ` — 证据用途：${line(item.evidenceUse)}` : "";
        parts.push(link(item.title, item.url) + (notes ? `（${notes}）` : "") + (item.summary ? ` — ${line(item.summary)}` : "") + evidence);
      }
      parts.push("");
    }
  }
  if (apps?.items?.length) {
    parts.push("## AI 软件目录", "");
    for (const item of apps.items) {
      parts.push(link(item.name, url("software/")) + (item.by ? `（${line(item.by)}）` : "") + (item.summary ? ` — ${line(item.summary)}` : ""));
    }
    parts.push("");
  }
  const tutorialGroups = Object.entries(groups).filter(([, group]) => group && Array.isArray(group.resources) && group.resources.length);
  if (tutorialGroups.length) {
    parts.push("## 使用教程", "");
    for (const [id, group] of tutorialGroups) {
      parts.push(`### ${line(group.title || id)}${group.subtitle ? ` — ${line(group.subtitle)}` : ""}`, "");
      for (const resource of group.resources) {
        const meta = [resource.creator ? line(resource.creator) : "", resource.platform ? line(resource.platform) : "", resource.publishedAt ? line(resource.publishedAt) : "", resource.duration ? line(resource.duration) : ""].filter(Boolean).join(" · ");
        parts.push(link(resource.title, resource.url) + (meta ? `（${meta}）` : "") + (resource.summary ? ` — ${line(resource.summary)}` : ""));
      }
      parts.push("");
    }
  }
  return parts.join("\n");
}

module.exports = {llmsTxt, llmsFullTxt};
