"use strict";
// Synthetic teaching material only. Never loads a real understanding page or audit.
const crypto = require("crypto");
const { inventory } = require("../../tools/deepdive-stage2/lib/translation-preparation");
const hash = value => `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
function fixture() {
  const page = { title: "示例机制", subtitle: "隔离测试，不是真实译文", aliases: ["机制"], meta: "2 个示例", thesis: "输入决定输出。",
    html: '<section class="dd-sec" id="mechanism"><h2>机制</h2><p>输入 2 时成立。</p><p><a href="#check" title="前往自测">查看自测</a></p><table><tr><th>输入</th><th>输出</th></tr><tr><td>2</td><td>2</td></tr></table><pre><code>const value = 2;</code></pre><svg width="160" height="60" viewBox="0 0 160 60" role="img" aria-label="关系图"><rect width="160" height="60" rx="8" fill="#28394c"/><text x="12" y="36" fill="white">输入 → 输出</text></svg></section><section class="dd-sec" id="check"><h2>自测</h2><details><summary>查看答案</summary><p>答案：否</p></details></section>' };
  const translations = { "示例机制": "Example mechanism", "隔离测试，不是真实译文": "Isolated test — not a production translation", "机制": "Mechanism", "2 个示例": "2 examples", "输入决定输出。": "The input determines the output.", "输入 2 时成立。": "It holds for an input of 2.", "前往自测": "Go to self-test", "查看自测": "See the self-test", "输入": "Input", "输出": "Output", "2": "2", "关系图": "Relationship diagram", "输入 → 输出": "Input → Output", "自测": "Self-test", "查看答案": "Show answer", "答案：否": "Answer: no" };
  const manifest = { ...inventory(page.html), dependencies: [] };
  const headerUnits = Object.entries(page).filter(([key]) => key !== "html").flatMap(([key, value]) => (Array.isArray(value) ? value : [value]).map((source, index) => ({ id: `${key}:${index}`, kind: "plain-text", source })));
  const chapter = (chapterId, units) => ({ chapterId, units, output: { translations: Object.fromEntries(units.map(unit => [unit.id, translations[unit.source]])), sourceConcerns: [] } });
  const material = { pageId: "sample", planId: "fixture-plan", snapshotId: "fixture-snapshot", chapters: [chapter("page-header", headerUnits), ...[...new Set(manifest.units.map(unit => unit.chapterId))].map(id => chapter(id, manifest.units.filter(unit => unit.chapterId === id)))] };
  return { material, snapshot: { capture: { page, sourceContentHash: hash(page), manifest } },
    report: { reviewId: "fixture-review", revision: hash(material), state: "awaiting-resource-browser-human-review", defects: [], gates: Array.from({ length: 9 }, (_, index) => ({ number: index + 1, status: [6, 9].includes(index + 1) ? "pending" : "pass" })) } };
}
module.exports = { fixture, hash };
