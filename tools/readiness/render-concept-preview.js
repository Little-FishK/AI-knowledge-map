"use strict";

// Presentation-only local preview from an MCP-exported snapshot, never a
// publication controller or a direct reader of Stage 2 project files.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { PROJECT_ROOT } = require("../shared/project-root");
const PREVIEW_ROOT = path.join(PROJECT_ROOT, ".tmp", "website-preview");
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const digest = value => "sha256:" + crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

function render(snapshot, siteBase = "/") {
  if (snapshot?.schemaVersion !== 1 || snapshot.publicationAllowed !== false || snapshot.sourceLocale !== "zh-Hans") {
    throw new Error("Only a non-publishing Chinese snapshot preview is supported.");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(snapshot.pageId || "")) throw new Error("Invalid page ID");
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(siteBase)) throw new Error("Invalid site base path");
  if (![snapshot.snapshotId, snapshot.sourcePageHash, snapshot.sourceContentHash].every(value => /^sha256:[a-f0-9]{64}$/.test(value || ""))) throw new Error("Missing snapshot hashes");
  const page = snapshot.page;
  if (!page || typeof page.title !== "string" || typeof page.html !== "string" || digest(page) !== snapshot.sourceContentHash) {
    throw new Error("Snapshot content hash mismatch; obtain a fresh MCP export instead of editing the copy.");
  }
  // Fail rather than silently remove source content. This is a controlled
  // snapshot adapter, not an arbitrary-HTML sanitizer. HTTP preview adds CSP.
  for (const html of [page.html, page.thesis || ""]) {
    if (/<\s*(?:script|iframe|object|embed|base|meta|link|form)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:/i.test(html)) {
      throw new Error("Active content is not supported in static previews.");
    }
  }
  const map = `${siteBase}?lang=zh-Hans#/map/${snapshot.pageId}`;
  const next = snapshot.pageId === "supervised-learning"
    ? `<a href="${escape(siteBase)}?lang=zh-Hans#/concept/information-theory">下一学习项：信息论与熵 →</a>` : "";
  return `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="${escape(page.subtitle || page.title)}">
<title>${escape(page.title)}｜AI 知识地图</title>
<link rel="stylesheet" href="${escape(siteBase)}assets/style.css">
<link rel="stylesheet" href="${escape(siteBase)}assets/concept-preview.css">
</head>
<body class="concept-preview">
<a class="preview-skip" href="#main-content">跳到正文</a>
<header class="preview-header">
  <a class="preview-brand" href="${escape(siteBase)}?lang=zh-Hans#/map">◈ AI 知识地图</a>
  <span class="preview-label">阅读预览 · 简体中文</span>
  <a class="preview-map" href="${escape(map)}">在地图中查看关系 ↗</a>
</header>
<main id="main-content" class="preview-main" tabindex="-1">
<article id="dd-article">
<header class="dd-hero">
  <div class="dd-eyebrow">理解原理</div>
  <h1 class="dd-h1">${escape(page.title)}</h1>
  ${page.subtitle ? `<p class="dd-sub">${escape(page.subtitle)}</p>` : ""}
  ${page.aliases ? `<p class="dd-ali">${escape(page.aliases)}</p>` : ""}
  ${page.meta ? `<p class="dd-metabar">${escape(page.meta)}</p>` : ""}
  ${page.thesis ? `<div class="dd-thesis"><span class="dd-thesis-l">核心命题</span> ${page.thesis}</div>` : ""}
</header>
<!-- source-body:start -->${page.html}<!-- source-body:end -->
<nav class="preview-next" aria-label="继续学习">
  <a href="${escape(map)}">查看${escape(page.title)}与其他概念的关系</a>
  ${next}
</nav>
</article>
</main>
</body>
</html>
`;
}

function build(pageId = "supervised-learning", siteBase = "/") {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageId)) throw new Error("Invalid page ID");
  const input = path.join(PREVIEW_ROOT, `${pageId}.snapshot.json`);
  const snapshot = JSON.parse(fs.readFileSync(input, "utf8"));
  if (snapshot.pageId !== pageId) throw new Error("Snapshot page binding mismatch");
  const html = render(snapshot, siteBase);
  const output = path.join(PREVIEW_ROOT, "pages", "zh", "concepts", pageId, "index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html, "utf8");
  return { output, pageId, sourcePageHash: snapshot.sourcePageHash, sourceContentHash: snapshot.sourceContentHash, publicationAllowed: false };
}

if (require.main === module) console.log(JSON.stringify(build(process.argv[2], process.argv[3]), null, 2));
module.exports = { render, build };
