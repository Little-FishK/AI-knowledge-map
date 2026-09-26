"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "microsoft-prefilter-inventory-20260924.json"), "utf8"));
const batches = Array.from({ length:7 }, (_, index) => JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `microsoft-value-score-batch-0${index + 1}.json`), "utf8")));
const results = batches.flatMap(batch => batch.results);

assert.strictEqual(results.length, 405);
assert.strictEqual(results.filter(result => result.scores.passed).length, 312);
assert.strictEqual(results.filter(result => !result.scores.passed).length, 93);
assert.strictEqual(inventory.summary.pendingImportanceReview, 0);
assert.strictEqual(inventory.summary.valueScoreAdmitted, 312);
assert.strictEqual(inventory.summary.valueScoreRejected, 93);
assert.deepStrictEqual(inventory.valueReview, {
  policy:"microsoft-official-value-score-v1",
  reviewedAt:"2026-09-24",
  status:"complete",
  reviewed:405,
  admitted:312,
  rejected:93,
  remaining:0
});
assert.strictEqual(inventory.records.filter(record => record.status === "pending-importance-review").length, 0);
for (const result of results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
}

const context = { window:{} };
vm.createContext(context);
for (const relative of ["data/library.js", "data/library-official-technical.js", ...Array.from({ length:7 }, (_, index) => `data/library-official-microsoft-importance-0${index + 1}.js`)]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
}
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "microsoft");
assert.strictEqual(items.length, 312);
assert.ok(items.every(item => item.valueScore.total >= 6 && item.valueScore.knowledgeImportance >= 2));
console.log("✓ Microsoft 405 份价值评分全部完成（保留 312，移除 93）");
