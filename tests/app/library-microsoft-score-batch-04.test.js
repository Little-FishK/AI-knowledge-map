"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "microsoft-value-score-batch-04.json"), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "microsoft-prefilter-inventory-20260924.json"), "utf8"));

assert.strictEqual(score.results.length, 60);
assert.deepStrictEqual(score.summary, { reviewed:60, retained:46, removed:14 });
const batchInventoryRecords = inventory.records.filter(record => record.scoreBatch === "microsoft-value-score-batch-04");
assert.strictEqual(batchInventoryRecords.length, 60);
assert.strictEqual(batchInventoryRecords.filter(record => String(record.status).startsWith("admitted-")).length, 46);
assert.strictEqual(batchInventoryRecords.filter(record => record.status === "rejected-low-value-score").length, 14);
for (const result of score.results) {
  const scores = result.scores;
  assert.strictEqual(scores.total, scores.knowledgeImportance + scores.irreplaceability + scores.durability + scores.applicability);
  assert.strictEqual(scores.passed, scores.total >= 6 && scores.knowledgeImportance >= 2);
  assert.strictEqual(result.contentVerification.httpStatus, 200);
  assert.ok(result.contentVerification.articleTextChars > 1000);
}

const context = { window:{} };
vm.createContext(context);
for (const relative of ["data/library.js", "data/library-official-technical.js", "data/library-official-microsoft-importance-01.js", "data/library-official-microsoft-importance-02.js", "data/library-official-microsoft-importance-03.js", "data/library-official-microsoft-importance-04.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
}
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "microsoft");
assert.strictEqual(items.length, 190);
const itemIds = new Set(items.map(item => item.id));
for (const result of score.results) assert.strictEqual(itemIds.has(result.id), result.scores.passed, result.id);
console.log("✓ Microsoft 第四批 60 份价值评分通过（保留 46，移除 14）");
