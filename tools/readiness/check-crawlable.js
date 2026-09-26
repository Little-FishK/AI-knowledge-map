"use strict";
// Pre-publish report: what does each page look like to a crawler that does not
// run JavaScript? Run it against a build artifact before promoting a release.
//
//   node tools/readiness/check-crawlable.js site-release
//   node tools/readiness/check-crawlable.js site-release --fail    # exit 1 below threshold
const fs = require("node:fs"), path = require("node:path");
const {readableLength, MIN_INDEXABLE_TEXT} = require("./crawlable-text");

function registry(root) {
  const manifestPath = path.join(root, "release-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return {
      source: "release-manifest.json",
      pages: manifest.seoPages.map(page => ({file: page.file, kind: page.kind, indexable: page.indexable !== false, canonical: page.canonical})),
    };
  }
  const found = [];
  const walk = relative => {
    for (const name of fs.readdirSync(relative ? path.join(root, relative) : root)) {
      const next = relative ? `${relative}/${name}` : name;
      if (fs.statSync(path.join(root, next)).isDirectory()) walk(next);
      else if (next.endsWith(".html")) found.push({file: next, kind: "unregistered", indexable: true});
    }
  };
  walk("");
  return {source: "directory listing (no release-manifest.json)", pages: found.sort((a, b) => a.file.localeCompare(b.file))};
}

function report(root, {threshold = MIN_INDEXABLE_TEXT} = {}) {
  const {source, pages} = registry(root);
  const rows = pages.map(page => {
    const target = path.join(root, page.file);
    const html = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
    return {...page, present: html !== null, chars: html === null ? 0 : readableLength(html)};
  }).sort((a, b) => a.chars - b.chars || a.file.localeCompare(b.file));
  const short = rows.filter(row => row.indexable && (!row.present || row.chars < threshold));
  return {root, source, threshold, rows, short};
}

function main() {
  const args = process.argv.slice(2);
  const target = args.find(arg => !arg.startsWith("--"));
  if (!target) throw Error("Usage: node tools/readiness/check-crawlable.js <artifact-dir> [--threshold N] [--fail]");
  const thresholdAt = args.indexOf("--threshold");
  const result = report(path.resolve(target), thresholdAt >= 0 ? {threshold: Number(args[thresholdAt + 1])} : {});
  const width = Math.max(...result.rows.map(row => row.file.length), 10);
  console.log(`爬虫视角可读文本 · ${result.root}`);
  console.log(`页面登记来源：${result.source} · 阈值 ${result.threshold} 字符 · 共 ${result.rows.length} 页`);
  console.log("");
  for (const row of result.rows) {
    const flag = !row.indexable ? "noindex" : row.chars < result.threshold ? "⚠ 过短" : "ok";
    console.log(`  ${flag.padEnd(8)} ${row.file.padEnd(width)}  ${String(row.chars).padStart(7)}  ${row.kind}${row.present ? "" : "  (文件缺失)"}`);
  }
  console.log("");
  if (result.short.length) {
    console.log(`对不执行 JavaScript 的爬虫而言过短的可索引页面：${result.short.length} 个`);
    for (const row of result.short) console.log(`  - ${row.file}（${row.chars} 字符，阈值 ${result.threshold}）`);
  } else {
    console.log("全部可索引页面均达到阈值。");
  }
  if (args.includes("--fail") && result.short.length) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = {report, registry};
