"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "data", "deepdive", "neural-network.js");
const responsePath = path.join(root, "docs", "deepdive-reviews", "neural-network-agent-responses.md");
const outputPath = path.join(root, "docs", "deepdive-reviews", "neural-network-curated-candidate.js");
const reviewHtmlPath = path.join(root, "docs", "deepdive-reviews", "neural-network-curated-candidate.html");
const reportPath = path.join(root, "docs", "deepdive-reviews", "neural-network-curation-report.md");

function loadPage(file) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return JSON.parse(JSON.stringify(context.window.DEEPDIVE["neural-network"]));
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function readBraced(text, start) {
  if (text[start] !== "{") return null;
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "{") depth += 1;
    if (text[index] === "}") depth -= 1;
    if (depth === 0) return { value: text.slice(start + 1, index), end: index + 1 };
  }
  return null;
}

function replaceCommand(text, command, argumentCount, transform) {
  const marker = `\\${command}`;
  let cursor = 0;
  let output = "";
  while (cursor < text.length) {
    const found = text.indexOf(marker, cursor);
    if (found < 0) return output + text.slice(cursor);
    output += text.slice(cursor, found);
    let position = found + marker.length;
    while (/\s/.test(text[position] || "")) position += 1;
    const args = [];
    for (let count = 0; count < argumentCount; count += 1) {
      const parsed = readBraced(text, position);
      if (!parsed) break;
      args.push(parsed.value);
      position = parsed.end;
      while (/\s/.test(text[position] || "")) position += 1;
    }
    if (args.length !== argumentCount) {
      output += marker;
      cursor = found + marker.length;
      continue;
    }
    output += transform(...args);
    cursor = position;
  }
  return output;
}

function renderMath(value) {
  let text = String(value).trim();
  text = text.replace(/\\begin\{(bmatrix|matrix)\}([\s\S]*?)\\end\{\1\}/g, (_, __, body) => {
    const rows = body.split(/\\\\/).map(row => row.split("&").map(cell => cell.trim()).join(", "));
    return `[${rows.join("; ")}]`;
  });
  text = replaceCommand(text, "frac", 2, (top, bottom) => `((${renderMath(top)}) / (${renderMath(bottom)}))`);
  for (const command of ["text", "mathrm", "mathbf", "operatorname"]) {
    text = replaceCommand(text, command, 1, argument => argument);
  }
  text = text
    .replace(/\\begin\{aligned\}|\\end\{aligned\}/g, "")
    .replace(/\\left(?![A-Za-z])|\\right(?![A-Za-z])/g, "")
    .replace(/\\hat\s*\{?([A-Za-z])\}?/g, "$1-hat")
    .replace(/\\mathbb\s*\{?R\}?/g, "R")
    .replace(/\\partial/g, "∂").replace(/\\nabla/g, "∇")
    .replace(/\\theta/g, "θ").replace(/\\eta/g, "η")
    .replace(/\\sigma/g, "σ").replace(/\\varphi|\\phi/g, "φ")
    .replace(/\\epsilon|\\varepsilon/g, "ε").replace(/\\delta/g, "δ")
    .replace(/\\cdots|\\ldots/g, "…").replace(/\\vdots/g, "⋮")
    .replace(/\\cdot/g, "·").replace(/\\times/g, "×")
    .replace(/\\rightarrow|\\to/g, "→").replace(/\\leftarrow/g, "←")
    .replace(/\\approx/g, "≈").replace(/\\infty/g, "∞")
    .replace(/\\leq/g, "≤").replace(/\\geq/g, "≥").replace(/\\neq/g, "≠")
    .replace(/\\gt/g, ">").replace(/\\lt/g, "<")
    .replace(/\\sum/g, "Σ").replace(/\\prod/g, "Π")
    .replace(/\\max/g, "max").replace(/\\ln/g, "ln").replace(/\\exp/g, "exp")
    .replace(/\\in/g, "∈").replace(/\\Vert|\\lVert|\\rVert/g, "‖")
    .replace(/\\qquad|\\quad/g, "  ")
    .replace(/\\,/g, " ").replace(/\\;/g, " ").replace(/\\!/g, "")
    .replace(/\\\\/g, "; ")
    .replace(/&/g, " ")
    .replace(/_\{([^{}]+)\}/g, "_($1)")
    .replace(/\^\{([^{}]+)\}/g, "^($1)")
    .replace(/\\([A-Za-z]+)/g, (_, command) => ({
      rightarrow: "→", leftarrow: "←", to: "→", cdots: "…", ldots: "…",
      vdots: "⋮", qquad: " ", quad: " ", gt: ">", lt: "<"
    }[command] || command))
    .replace(/\s+/g, " ")
    .trim();
  return escapeHtml(text);
}

function inlineMarkup(value) {
  const formulas = [];
  const raw = String(value).replace(/\\\((.+?)\\\)/g, (_, math) => {
    const token = `@@INLINE_MATH_${formulas.length}@@`;
    formulas.push(`<code>${renderMath(math)}</code>`);
    return token;
  });
  let text = escapeHtml(raw);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/@@INLINE_MATH_(\d+)@@/g, (_, index) => formulas[Number(index)]);
  return text;
}

function markdownChunks(markdown) {
  const lines = String(markdown).replace(/\r/g, "").split("\n");
  const chunks = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    if (line === "\\[") {
      const math = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== "\\]") math.push(lines[index++]);
      if (index < lines.length) index += 1;
      chunks.push(`<div class="dd-formula">${renderMath(math.join(" "))}</div>`);
      continue;
    }
    if (/^```/.test(line)) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      chunks.push(`<pre class="dd-code"><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^###\s+(.+)$/);
    if (heading) {
      chunks.push(`<h3>${inlineMarkup(heading[1])}</h3>`);
      index += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      chunks.push(`<ul class="dd-steps">${items.map(item => `<li>${inlineMarkup(item)}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ""));
        index += 1;
      }
      chunks.push(`<ol class="dd-steps">${items.map(item => `<li>${inlineMarkup(item)}</li>`).join("")}</ol>`);
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || next === "\\[" || /^###\s+|^```|^[-*]\s+|^\d+[.)]\s+/.test(next)) break;
      paragraph.push(next);
      index += 1;
    }
    const body = inlineMarkup(paragraph.join(" "));
    const emphasized = /^<b>[\s\S]+<\/b>$/.test(body);
    chunks.push(emphasized
      ? `<div class="dd-note key">${body}</div>`
      : `<p>${body}</p>`);
  }
  return chunks;
}

function parseResponseSections(markdown) {
  const matches = [...String(markdown).matchAll(/^## 2\.(\d+)\s+(.+)$/gm)];
  return matches.map((match, index) => ({
    number: Number(match[1]),
    title: match[2].trim(),
    body: markdown.slice(match.index + match[0].length, matches[index + 1] ? matches[index + 1].index : markdown.length).trim(),
  }));
}

function originalSections(html) {
  return [...String(html).matchAll(/<section\b[\s\S]*?<\/section>/gi)].map(match => {
    const number = Number((match[0].match(/<span class="dd-n">(\d+)<\/span>/) || [])[1]);
    const badgeMarkup = ([...match[0].matchAll(/<span class="dd-badge[^>]*>[\s\S]*?<\/span>/g)]).map(item => item[0]).join("");
    const visuals = [...match[0].matchAll(/<(figure|table)\b[^>]*class="[^"]*\bdd-(?:fig|table)\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi)]
      .map(item => ({ html: item[0], ratio: item.index / Math.max(match[0].length, 1) }));
    return { number, badgeMarkup, visuals };
  });
}

function injectVisuals(chunks, visuals) {
  const result = [...chunks];
  let offset = 0;
  for (const visual of visuals) {
    const position = Math.min(result.length, Math.max(1, Math.round(visual.ratio * result.length))) + offset;
    result.splice(position, 0, visual.html);
    offset += 1;
  }
  return result.join("\n");
}

const originalPage = loadPage(sourcePath);
const responseMarkdown = fs.readFileSync(responsePath, "utf8");
const responses = parseResponseSections(responseMarkdown);
const responseByNumber = new Map(responses.map(section => [section.number, section]));
const originalByNumber = new Map(originalSections(originalPage.html).map(section => [section.number, section]));
const selected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15];
for (const number of selected) {
  if (!responseByNumber.has(number)) throw new Error(`Agent response section 2.${number} is missing`);
  if (!originalByNumber.has(number)) throw new Error(`Original page section ${number} is missing`);
}

const firstSectionAt = originalPage.html.indexOf('<section class="dd-sec">');
const sourceAt = originalPage.html.lastIndexOf('<div class="dd-src">');
if (firstSectionAt < 0 || sourceAt < 0) throw new Error("Original page scaffolding is incomplete");
const prefix = originalPage.html.slice(0, firstSectionAt).trimEnd();
const sourceBlock = originalPage.html.slice(sourceAt).trimStart();
const generatedSections = selected.map(originalNumber => {
  const response = responseByNumber.get(originalNumber);
  const original = originalByNumber.get(originalNumber);
  const displayNumber = originalNumber === 15 ? 13 : originalNumber;
  const chunks = markdownChunks(response.body);
  if (originalNumber === 12) {
    const chainIndex = chunks.findIndex(chunk => chunk.includes("现实对象") && chunk.includes("未见数据检验"));
    if (chainIndex < 0) throw new Error("Agent response section 2.12 lacks its explicit causal chain");
    const chainText = chunks[chainIndex].replace(/^<div class="dd-formula">|<\/div>$/g, "");
    const steps = chainText.split("→").map(step => step.trim()).filter(Boolean);
    chunks[chainIndex] = `<ol class="dd-chain">${steps.map(step => `<li>${step}</li>`).join("")}</ol>`;
  }
  return [
    '<section class="dd-sec">',
    `  <h2><span class="dd-n">${displayNumber}</span>${inlineMarkup(response.title)}${original.badgeMarkup}</h2>`,
    injectVisuals(chunks, original.visuals),
    "</section>",
  ].join("\n");
});

const candidatePage = {
  ...originalPage,
  html: `${prefix}\n\n${generatedSections.join("\n\n")}\n\n${sourceBlock}`,
};
delete candidatePage.publication;

const sourceCode = [
  "/* Generated from the complete chapter-by-chapter Agent response document. */",
  "window.DEEPDIVE = window.DEEPDIVE || {};",
  `window.DEEPDIVE["neural-network"] = ${JSON.stringify(candidatePage, null, 2)};`,
  "",
].join("\n");
fs.writeFileSync(outputPath, sourceCode, "utf8");

const reviewHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>神经网络 · 待审草稿</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
  <div id="deepdive" class="dd-provisional">
    <header class="dd-top">
      <button class="dd-back" type="button" onclick="history.back()">← 返回</button>
      <span class="dd-top-name">神经网络 · 待审草稿</span>
      <button class="dd-x" type="button" title="关闭" onclick="history.back()">×</button>
    </header>
    <div class="dd-scroll"><article id="dd-article"></article></div>
  </div>
  <script src="./neural-network-curated-candidate.js"></script>
  <script>
    (() => {
      const page = window.DEEPDIVE["neural-network"];
      const esc = value => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const hero = '<div class="dd-hero">'
        + '<div class="dd-eyebrow">理解原理 · CONCEPT DEEP DIVE</div>'
        + '<h1 class="dd-h1 dd-h1-provisional">' + esc(page.title) + '</h1>'
        + '<div class="dd-provisional-notice" role="status"><strong>机器审查通过 · 等待人工审查</strong><span>该页面是已经覆盖网站的正文草稿，尚未正式发布。</span></div>'
        + (page.subtitle ? '<div class="dd-sub">' + esc(page.subtitle) + '</div>' : '')
        + (page.aliases ? '<div class="dd-ali">' + esc(page.aliases) + '</div>' : '')
        + (page.meta ? '<div class="dd-metabar">' + esc(page.meta) + '</div>' : '')
        + (page.thesis ? '<div class="dd-thesis"><span class="dd-thesis-l">核心命题</span> ' + page.thesis + '</div>' : '')
        + '</div>';
      document.getElementById('dd-article').innerHTML = hero + page.html;
    })();
  </script>
</body>
</html>
`;
fs.writeFileSync(reviewHtmlPath, reviewHtml, "utf8");

const retainedOriginals = selected.map(number => originalByNumber.get(number));
const expectedFigures = retainedOriginals.flatMap(section => section.visuals.filter(item => /^<figure/i.test(item.html))).length;
const expectedTables = retainedOriginals.flatMap(section => section.visuals.filter(item => /^<table/i.test(item.html))).length;
const actualFigures = (candidatePage.html.match(/<figure\b[^>]*class="[^"]*\bdd-fig\b/gi) || []).length;
const actualTables = (candidatePage.html.match(/<table\b[^>]*class="[^"]*\bdd-table\b/gi) || []).length;
if (actualFigures !== expectedFigures || actualTables !== expectedTables) throw new Error("Original figure/table preservation failed");
for (const number of [13, 14]) {
  if (responseByNumber.get(number).body && candidatePage.html.includes(responseByNumber.get(number).body.slice(0, 80))) {
    throw new Error(`Forbidden response section 2.${number} leaked into candidate`);
  }
}
const retainedResponseChars = selected.reduce((sum, number) => sum + responseByNumber.get(number).body.length, 0);
const report = `# 节点 2「神经网络」正文整理报告\n\n`
  + `> 状态：完整候选页，等待控制器导入和机器审查。\n\n`
  + `## 构建依据\n\n`
  + `- 章节正文唯一来源：\`docs/deepdive-reviews/neural-network-agent-responses.md\`。\n`
  + `- 旧页仅提供页面元数据、章节徽标、开头说明、${expectedFigures} 幅原图、${expectedTables} 张原表和来源区。\n`
  + `- 完整采用回复章节：2.1–2.12、2.15；2.15 在网站中重新编号为第 13 节。\n`
  + `- 排除回复章节：2.13“常见误解”、2.14“检查你是否真的理解”。\n`
  + `- 人工审查入口：\`docs/deepdive-reviews/neural-network-curated-candidate.html\`，直接复用网站正文样式并显示红色待审标记。\n`
  + `- 纳入的 Agent 回复原始字符数：${retainedResponseChars}；生成页面 HTML 字符数：${candidatePage.html.length}。\n`
  + `- 构建器会直接读取回复文档；回复章节缺失或原图表数量不一致时立即失败。\n`;
fs.writeFileSync(reportPath, report, "utf8");

console.log(JSON.stringify({
  outputPath,
  reviewHtmlPath,
  reportPath,
  responseSource: path.relative(root, responsePath).replace(/\\/g, "/"),
  retainedResponseSections: selected.length,
  retainedResponseChars,
  htmlChars: candidatePage.html.length,
  figures: actualFigures,
  tables: actualTables,
}, null, 2));
