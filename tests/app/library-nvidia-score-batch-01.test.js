"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "nvidia-value-score-batch-01";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "nvidia-learning-prefilter-20260924.json"), "utf8"));

assert.deepStrictEqual(score.summary, { reviewed:60, retained:33, removed:27 });
assert.strictEqual(score.results.length, 60);
for (const result of score.results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
  if (result.scores.passed) {
    assert.ok(result.linkedNodes.length > 0);
    assert.ok(result.uniqueDelta.length > 20);
    assert.strictEqual(result.contentVerification.httpStatus, 200);
  }
}
assert.strictEqual(score.results.filter(result => result.contentVerification.httpStatus === 404).length, 16);
assert.ok(score.results.filter(result => /\/digest\//.test(result.url) && result.scores.passed).every(result => result.finalDecision === "admitted-supporting"));
assert.strictEqual(inventory.records.filter(record => record.scoreBatch === batchId).length, 60);
const scored = inventory.records.filter(record => /^nvidia-value-score-batch-/.test(record.scoreBatch || ""));
assert.strictEqual(inventory.summary.pendingImportanceReview, 400 - scored.length);

const context = { window:{} };
vm.createContext(context);
for (const relative of ["data/library.js", "data/library-official-technical.js", "data/library-official-nvidia-importance-01.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
}
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "nvidia");
assert.strictEqual(items.length, 33);
assert.strictEqual(new Set(items.map(item => item.id)).size, 33);
console.log("✓ NVIDIA 第一批 60 份价值评分通过（保留 33，移除 27；剩余 340）");
