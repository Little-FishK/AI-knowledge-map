"use strict";
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const root = path.resolve(__dirname, "../.."), directory = path.join(root, ".tmp/website-preview");
const digest = value => "sha256:" + crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
// Presentation-only layout. Original SVG and every translated label stay intact.
// The three cramped captions are repeated as a responsive legend and hidden in
// the SVG by CSS. This does not mutate the controller's candidate or its hash.
function resourceLayout(html, { splitLegend = true } = {}) {
  const withLegend = !splitLegend ? html : html.replace(/<svg\b[^>]*viewBox="0 0 560 96"[^>]*>[\s\S]*?<\/svg>/g, svg => {
    const labels = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map(match => match[1]);
    if (labels.length !== 6) throw new Error("Data split diagram changed; review presentation mapping");
    return `${svg}<dl class="preview-split-legend" data-presentation-only="true">${labels.slice(0, 3).map((label, index) => `<div><dt>${label}</dt><dd>${labels[index + 3]}</dd></div>`).join("")}</dl>`;
  });
  return withLegend.replace(/<svg\b[\s\S]*?<\/svg>/g, svg => `<div class="preview-diagram-scroll" tabindex="0" role="region" aria-label="Scrollable diagram">${svg}</div><p class="preview-diagram-hint">Scroll horizontally to view the full diagram on small screens.</p>`);
}
function render(value, source) {
  const candidate = value?.candidate, payload = candidate?.payload;
  if (value?.publicationAllowed !== false || candidate?.schemaVersion !== 1 || !payload || digest(payload) !== candidate.artifactHash) throw new Error("Invalid MCP candidate integrity");
  if (payload.pageId !== "supervised-learning" || payload.snapshotId !== source.snapshotId || payload.sourceContentHash !== source.sourceContentHash
    || digest(source.page) !== source.sourceContentHash) throw new Error("Candidate source mismatch");
  const page = payload.page;
  const semanticReviewed = [4, 7, 8].every(number => value.gates?.some(gate => gate.number === number && gate.status === "pass"));
  if (typeof page?.title !== "string" || typeof page?.html !== "string") throw new Error("Missing candidate page");
  if (/<\s*(?:script|iframe|object|embed|base|meta|link|form)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:/i.test(page.html)) throw new Error("Active candidate content refused");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${escape(page.title)} · Review draft</title>
<link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/concept-preview.css"></head>
<body class="concept-preview"><a class="preview-skip" href="#main-content">Skip to content</a>
<header class="preview-header"><a class="preview-brand" href="/?lang=en#/map">◈ AI Knowledge Map</a><span class="preview-label">English · Review draft</span><a href="/preview/zh/concepts/supervised-learning/" lang="zh-Hans">简体中文</a></header>
<main id="main-content" class="preview-main" tabindex="-1"><article id="dd-article">
<p role="note">${semanticReviewed ? "Draft translation — final acceptance is pending." : "Draft translation — independent review is pending."}</p>
<header class="dd-hero"><div class="dd-eyebrow">Understanding the principles</div><h1 class="dd-h1">${escape(page.title)}</h1>
${page.subtitle ? `<p class="dd-sub">${escape(page.subtitle)}</p>` : ""}
${page.aliases ? `<p class="dd-ali">${escape(Array.isArray(page.aliases) ? page.aliases.join(" · ") : page.aliases)}</p>` : ""}
${page.meta ? `<p class="dd-metabar">${escape(page.meta)}</p>` : ""}
${page.thesis ? `<div class="dd-thesis"><span class="dd-thesis-l">Core idea</span> ${escape(page.thesis)}</div>` : ""}</header>
<!-- source-body:start -->${resourceLayout(page.html)}<!-- source-body:end -->
<nav class="preview-next" aria-label="Continue learning"><a href="/?lang=en#/map/supervised-learning">Explore the connections on the map</a><a href="/preview/zh/concepts/supervised-learning/" lang="zh-Hans">阅读中文原文</a></nav>
</article></main></body></html>`;
}
if (require.main === module) {
  // Both files are MCP-exported presentation copies; never read production Stage 2.
  const value = JSON.parse(fs.readFileSync(path.join(directory, "supervised-learning.english-candidate.json"), "utf8"));
  const source = JSON.parse(fs.readFileSync(path.join(directory, "supervised-learning.snapshot.json"), "utf8"));
  const html = render(value, source), output = path.join(directory, "pages/en/concepts/supervised-learning/index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, html);
  console.log(JSON.stringify({ output, artifactHash: value.candidate.artifactHash, publicationAllowed: false }, null, 2));
}
module.exports = { render, resourceLayout };
