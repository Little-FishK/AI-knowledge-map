"use strict";
// Pure presentation function. Only the Stage 2 controller supplies published data.
const { resourceLayout } = require("./render-english-pilot");
const esc = value => String(Array.isArray(value) ? value.join(" · ") : value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function configuration(siteUrl) {
  const url = new URL(siteUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || !/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(url.pathname)) throw Error("HTTPS site URL with a trailing-slash base path required");
  return { siteUrl: url.href, base: url.pathname };
}
function render(pageId, page, locale, siteUrl) {
  const { base } = configuration(siteUrl);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageId) || !["zh", "en"].includes(locale)) throw Error("Invalid static page binding");
  if (typeof page?.title !== "string" || typeof page.html !== "string") throw Error("Missing static content");
  for (const text of [page.html, page.thesis || ""]) if (/<\s*(?:script|iframe|object|embed|base|meta|link|form)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:/i.test(text)) throw Error("Active content refused");
  const english = locale === "en", lang = english ? "en" : "zh-Hans";
  const route = language => `${language}/concepts/${pageId}/`;
  const canonical = new URL(route(locale), siteUrl).href;
  const map = `${base}?lang=${lang}&node=${encodeURIComponent(pageId)}`;
  const other = english ? "zh" : "en";
  const schema = { "@context": "https://schema.org", "@type": "LearningResource", name: page.title,
    description: page.subtitle || page.title, inLanguage: lang, url: canonical, learningResourceType: "Concept explanation", isAccessibleForFree: true };
  return require('./initial-canvas').apply(`<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)} · ${english ? "AI Knowledge Map" : "AI 知识地图"}</title>
<meta name="description" content="${esc(page.subtitle || page.title)}">
<link rel="canonical" href="${esc(canonical)}">
${["zh", "en"].map(l => `<link rel="alternate" hreflang="${l === "zh" ? "zh-Hans" : "en"}" href="${esc(new URL(route(l), siteUrl).href)}">`).join("\n")}
<link rel="stylesheet" href="${base}assets/style.css"><link rel="stylesheet" href="${base}assets/concept-preview.css">
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
</head><body class="concept-preview">
<a class="preview-skip" href="#main-content">${english ? "Skip to content" : "跳到正文"}</a>
<header class="preview-header"><a class="preview-brand" href="${base}?lang=${lang}">◈ ${english ? "AI Knowledge Map" : "AI 知识地图"}</a>
<span>${english ? "English" : "简体中文"}</span><a class="preview-map" lang="${english ? "zh-Hans" : "en"}" href="${base}${route(other)}">${english ? "简体中文" : "English"}</a></header>
<main id="main-content" tabindex="-1"><article id="dd-article" lang="${lang}">
<header class="dd-hero"><div class="dd-eyebrow">${english ? "Understanding the principles" : "理解原理"}</div><h1 class="dd-h1">${esc(page.title)}</h1>
${page.subtitle ? `<p class="dd-sub">${esc(page.subtitle)}</p>` : ""}
${page.aliases ? `<p class="dd-ali">${esc(page.aliases)}</p>` : ""}
${page.meta ? `<p class="dd-metabar">${esc(page.meta)}</p>` : ""}
${page.thesis ? `<div class="dd-thesis"><span class="dd-thesis-l">${english ? "Core idea" : "核心命题"}</span> ${english ? esc(page.thesis) : page.thesis}</div>` : ""}</header>
<!-- source-body:start -->${english ? resourceLayout(require('./translation-layout-repair').formulaLabels(page.html), { splitLegend: pageId === "supervised-learning" }) : page.html}<!-- source-body:end -->
<nav class="preview-next" aria-label="${english ? "Continue learning" : "继续学习"}"><a href="${esc(map)}">${english ? "Explore connections on the map" : "在地图中查看概念关系"}</a><a href="${base}${route(other)}" lang="${english ? "zh-Hans" : "en"}">${english ? "阅读中文原文" : "Read in English"}</a></nav>
</article></main>${english ? require('./translation-layout-repair').script() : ''}</body></html>`);
}
function sitemap(pageId, siteUrl) {
  configuration(siteUrl);
  const ids = Array.isArray(pageId) ? pageId : [pageId];
  if (!ids.every(id => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) throw Error("Invalid sitemap page ID");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${ids.flatMap(id => ["zh", "en"].map(locale => `<url><loc>${esc(new URL(`${locale}/concepts/${id}/`, siteUrl).href)}</loc></url>`)).join("")}</urlset>\n`;
}
module.exports = { render, sitemap, configuration };
