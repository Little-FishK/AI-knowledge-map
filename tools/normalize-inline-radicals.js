"use strict";

/*
 * 将历史页面中的裸文本根号转换为有明确被开方范围的语义标记。
 *
 * 用法：
 *   node tools/normalize-inline-radicals.js
 *   node tools/normalize-inline-radicals.js --check
 *
 * 核心展示公式应直接编写为 MathML <msqrt>。这个工具只负责迁移历史正文、
 * 表格和短公式，避免普通 “√” 字形无法覆盖完整被开方表达式。
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const deepDiveDir = path.join(root, "data", "deepdive");
const checkOnly = process.argv.includes("--check");

function matchingDelimiter(open) {
  return open === "(" ? ")" : open === "[" ? "]" : "";
}

function findGroupedRadicandEnd(source, start) {
  const open = source[start];
  const close = matchingDelimiter(open);
  if (!close) return -1;
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === open) depth += 1;
    if (source[index] === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function isRadicandAtom(character) {
  return /[\p{L}\p{N}\p{M}\u2070-\u209f]/u.test(character || "");
}

function findAtomicRadicandEnd(source, start) {
  let index = start;
  while (isRadicandAtom(source[index])) index += 1;
  while (source.startsWith("<sub>", index) || source.startsWith("<sup>", index)) {
    const tag = source.startsWith("<sub>", index) ? "sub" : "sup";
    const closing = `</${tag}>`;
    const end = source.indexOf(closing, index);
    if (end < 0) break;
    index = end + closing.length;
  }
  return index;
}

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&minus;/g, "−")
    .replace(/&times;/g, "×")
    .replace(/&middot;/g, "·")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalize(source) {
  let output = "";
  let cursor = 0;

  while (cursor < source.length) {
    const radical = source.indexOf("√", cursor);
    if (radical < 0) {
      output += source.slice(cursor);
      break;
    }
    output += source.slice(cursor, radical);

    const start = radical + 1;
    let end;
    let radicand;
    if (source[start] === "(" || source[start] === "[") {
      const closing = findGroupedRadicandEnd(source, start);
      if (closing < 0) {
        output += "√";
        cursor = start;
        continue;
      }
      radicand = source.slice(start + 1, closing);
      end = closing + 1;
    } else {
      end = findAtomicRadicandEnd(source, start);
      if (end === start) {
        output += "√";
        cursor = start;
        continue;
      }
      radicand = source.slice(start, end);
    }

    const label = escapeAttribute(plainText(radicand));
    output += `<span class="dd-radical" role="math" aria-label="${label} 的平方根"><span class="dd-radicand">${radicand}</span></span>`;
    cursor = end;
  }
  return output;
}

const changed = [];
for (const filename of fs.readdirSync(deepDiveDir).filter((name) => name.endsWith(".js"))) {
  const file = path.join(deepDiveDir, filename);
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes("√")) continue;
  const normalized = normalize(source);
  if (normalized === source) continue;
  changed.push(filename);
  if (!checkOnly) fs.writeFileSync(file, normalized, "utf8");
}

if (changed.length) {
  console.log(`${checkOnly ? "✗" : "✓"} ${changed.length} 个页面文件含裸文本根号：${changed.join(", ")}`);
  if (checkOnly) process.exitCode = 1;
} else {
  console.log("✓ 未发现裸文本根号");
}
