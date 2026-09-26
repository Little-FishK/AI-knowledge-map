"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "meta-ai-value-score-batch-07";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json"), "utf8"));

assert.deepStrictEqual(score.summary, { reviewed:37, retained:15, removed:22 });
assert.strictEqual(score.results.length, 37);
assert.ok(score.results.every(result => result.contentVerification.httpStatus === 200));
for (const result of score.results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
  if (result.scores.passed) assert.ok(result.uniqueDelta.length > 20);
}
assert.ok(score.results.filter(result => /\/resources\/(?:blog|videos)\//.test(result.url) && result.scores.passed).every(result => result.finalDecision === "admitted-supporting"));
assert.strictEqual(inventory.records.filter(record => record.scoreBatch === batchId).length, 37);
assert.strictEqual(inventory.summary.pendingContentReview, 0);
assert.strictEqual(inventory.batch.status, "completed");

const context = { window:{} };
vm.createContext(context);
const dataFiles = ["data/library.js", "data/library-official-technical.js", ...Array.from({length:7}, (_,i) => `data/library-official-meta-ai-importance-0${i+1}.js`)];
for (const relative of dataFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "meta-ai");
assert.strictEqual(items.length, 141);
assert.strictEqual(new Set(items.map(item => item.id)).size, 141);
console.log("✓ Meta AI 最后一批 37 份价值评分通过（保留 15，移除 22；最终保留 141）");
