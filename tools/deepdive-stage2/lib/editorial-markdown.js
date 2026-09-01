"use strict";

const { plainText } = require("../../deepdive/quality/deepdive-narrative-audit");

function escapeEditorialHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractEditorialRadicals(value) {
  const radicals = [];
  const input = String(value || "");
  let source = "";
  for (let index = 0; index < input.length;) {
    if (input[index] !== "√") {
      source += input[index];
      index += 1;
      continue;
    }
    let cursor = index + 1;
    while (cursor < input.length && /\s/u.test(input[cursor])) cursor += 1;
    let radicand = "";
    let end = cursor;
    if (input[cursor] === "(") {
      let depth = 1;
      cursor += 1;
      const start = cursor;
      while (cursor < input.length && depth > 0 && input[cursor] !== "\n") {
        if (input[cursor] === "(") depth += 1;
        if (input[cursor] === ")") depth -= 1;
        cursor += 1;
      }
      if (depth === 0) {
        radicand = input.slice(start, cursor - 1);
        end = cursor;
      }
    } else {
      const simple = input.slice(cursor).match(/^([^\s()，,。；;:+\-*/=]+)/u);
      if (simple) {
        radicand = simple[1];
        end = cursor + simple[1].length;
      }
    }
    if (!radicand) {
      source += input[index];
      index += 1;
      continue;
    }
    const token = `\uE000RADICAL${radicals.length}\uE001`;
    radicals.push({ token, radicand });
    source += token;
    index = end;
  }
  return { source, radicals };
}

function renderEditorialInlineMarkdown(value) {
  const { source, radicals } = extractEditorialRadicals(value);
  let rendered = escapeEditorialHtml(source);
  rendered = rendered.replace(/`([^`]+)`/g, "<code>$1</code>");
  rendered = rendered.replace(/\\\((.+?)\\\)/g, '<span class="dd-inline-math" role="math">$1</span>');
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  radicals.forEach(({ token, radicand }) => {
    const safeRadicand = escapeEditorialHtml(radicand.trim());
    rendered = rendered.replace(
      token,
      `<math class="dd-inline-root" aria-label="根号 ${safeRadicand}"><msqrt><mtext>${safeRadicand}</mtext></msqrt></math>`,
    );
  });
  return rendered;
}

function markdownTableCells(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed.includes("|")) return null;
  const withoutEdges = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  const cells = withoutEdges.split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, "|"));
  return cells.length >= 2 ? cells : null;
}

function markdownTableAlignments(line) {
  const cells = markdownTableCells(line);
  if (!cells || cells.some(cell => !/^:?-{3,}:?$/.test(cell))) return null;
  return cells.map(cell => {
    if (cell.startsWith(":") && cell.endsWith(":")) return "center";
    if (cell.endsWith(":")) return "right";
    return "left";
  });
}

function normalizedBlockText(block) {
  return plainText(block).replace(/\s+/g, "").trim();
}

function tableRowTexts(block) {
  return [...String(block).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map(match => plainText(match[1]).replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter(Boolean);
}

function tableContentOverlap(a, b) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const shared = a.filter(row => setB.has(row)).length;
  return shared / Math.max(a.length, b.length);
}

function textBigrams(text) {
  const set = new Set();
  for (let index = 0; index < text.length - 1; index += 1) set.add(text.slice(index, index + 2));
  return set;
}

function textSimilarity(a, b) {
  if (!a || !b) return 0;
  const bigramsA = textBigrams(a);
  const bigramsB = textBigrams(b);
  let shared = 0;
  bigramsA.forEach(gram => { if (bigramsB.has(gram)) shared += 1; });
  return (2 * shared) / (bigramsA.size + bigramsB.size);
}

function tableBlocks(html) {
  return [...String(html || "").matchAll(/<div\b[^>]*class="[^"]*\bdd-table-wrap\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi)]
    .map(match => match[0]);
}

function renderEditorialTable(headerCells, alignments, bodyRows) {
  const cell = (tag, value, alignment) => (
    `<${tag} class="dd-align-${alignment}">${renderEditorialInlineMarkdown(value)}</${tag}>`
  );
  const header = `<thead><tr>${headerCells.map((value, index) => (
    cell("th", value, alignments[index] || "left")
  )).join("")}</tr></thead>`;
  const body = `<tbody>${bodyRows.map(row => `<tr>${headerCells.map((_, index) => (
    cell("td", row[index] || "", alignments[index] || "left")
  )).join("")}</tr>`).join("")}</tbody>`;
  return `<div class="dd-table-wrap"><table class="dd-table">${header}${body}</table></div>`;
}

function renderEditorialMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${renderEditorialInlineMarkdown(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(`<${list.tag}>${list.items.map(item => `<li>${renderEditorialInlineMarkdown(item)}</li>`).join("")}</${list.tag}>`);
    list = null;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.trim() === "\\[") {
      flushParagraph();
      flushList();
      const formula = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== "\\]") {
        formula.push(lines[index]);
        index += 1;
      }
      const source = formula.join("\n").trim();
      blocks.push(`<div class="dd-equation" role="math" aria-label="${escapeEditorialHtml(source.replace(/\s+/g, " "))}"><span>${escapeEditorialHtml(source)}</span></div>`);
      continue;
    }
    const headerCells = markdownTableCells(line);
    const alignments = index + 1 < lines.length ? markdownTableAlignments(lines[index + 1]) : null;
    if (headerCells && alignments && headerCells.length === alignments.length) {
      flushParagraph();
      flushList();
      const rows = [];
      index += 2;
      while (index < lines.length) {
        const cells = markdownTableCells(lines[index]);
        if (!cells || cells.length !== headerCells.length) break;
        rows.push(cells);
        index += 1;
      }
      index -= 1;
      blocks.push(renderEditorialTable(headerCells, alignments, rows));
      continue;
    }
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const tag = unordered ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push((unordered || ordered)[1].trim());
      continue;
    }
    flushList();
    const heading = line.match(/^#{3,6}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push(`<h3>${renderEditorialInlineMarkdown(heading[1])}</h3>`);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return blocks.join("\n");
}

function responseDocumentSections(markdown) {
  return [...String(markdown || "").matchAll(/(?:^|\n)##\s+(\d+)\.\s+([^\r\n]+)\r?\n\r?\n([\s\S]*?)(?=\r?\n##\s+\d+\.\s+|$)/g)]
    .map(match => ({
      sectionNumber: Number(match[1]),
      title: match[2].trim(),
      markdown: match[3].trim(),
    }));
}

module.exports = {
  escapeEditorialHtml,
  normalizedBlockText,
  renderEditorialMarkdown,
  responseDocumentSections,
  tableBlocks,
  tableContentOverlap,
  tableRowTexts,
  textSimilarity,
};
