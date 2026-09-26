"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "nvidia-value-score-batch-07";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "nvidia-learning-prefilter-20260924.json"), "utf8"));

assert.deepStrictEqual(score.summary, { reviewed:40, retained:22, removed:18 });
assert.strictEqual(score.results.length, 40);
for (const result of score.results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
  if (result.scores.passed) {
    assert.strictEqual(result.contentVerification.httpStatus, 200);
    assert.ok(result.linkedNodes.length > 0);
    assert.ok(result.uniqueDelta.length > 20);
  }
}
assert.strictEqual(score.results.filter(result => result.contentVerification.httpStatus === 404).length, 7);
assert.strictEqual(inventory.records.filter(record => record.scoreBatch === batchId).length, 40);
assert.strictEqual(inventory.summary.pendingImportanceReview, 0);
assert.strictEqual(inventory.summary.valueScoringStatus, "completed");

const context = { window:{} };
vm.createContext(context);
const dataFiles = ["data/library.js", "data/library-official-technical.js", ...Array.from({length:7}, (_,i) => `data/library-official-nvidia-importance-0${i+1}.js`)];
for (const relative of dataFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "nvidia");
assert.strictEqual(items.length, 264);
assert.strictEqual(new Set(items.map(item => item.id)).size, 264);
console.log("✓ NVIDIA 最后一批 40 份价值评分通过（保留 22，移除 18；最终保留 264）");
