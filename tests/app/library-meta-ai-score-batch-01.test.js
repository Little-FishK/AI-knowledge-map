"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "meta-ai-value-score-batch-01";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const evidence = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}-evidence.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json"), "utf8"));

assert.strictEqual(score.results.length, 60);
assert.deepStrictEqual(score.summary, { reviewed:60, retained:32, removed:28 });
assert.strictEqual(evidence.records.length, 60);
assert.ok(evidence.records.every(record => record.contentVerification.httpStatus === 200));

const reviewed = inventory.records.filter(record => record.scoreBatch === batchId);
assert.strictEqual(reviewed.length, 60);
assert.strictEqual(reviewed.filter(record => String(record.reviewStatus).startsWith("admitted-")).length, 32);
assert.strictEqual(reviewed.filter(record => record.reviewStatus === "rejected-low-value-score").length, 28);
const allScored = inventory.records.filter(record => /^meta-ai-value-score-batch-/.test(record.scoreBatch || ""));
assert.strictEqual(inventory.summary.pendingContentReview, inventory.summary.uniqueContentCandidates - allScored.length);

for (const result of score.results) {
  const scores = result.scores;
  assert.strictEqual(scores.total, scores.knowledgeImportance + scores.irreplaceability + scores.durability + scores.applicability);
  assert.strictEqual(scores.passed, scores.total >= 6 && scores.knowledgeImportance >= 2);
  if (scores.passed) {
    assert.ok(Array.isArray(result.comparedWith));
    assert.ok(result.uniqueDelta.length > 20);
  }
}

const context = { window:{} };
vm.createContext(context);
for (const relative of ["data/library.js", "data/library-official-technical.js", "data/library-official-meta-ai-importance-01.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
}
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "meta-ai");
assert.strictEqual(items.length, 32);
const itemIds = new Set(items.map(item => item.id));
for (const result of score.results) assert.strictEqual(itemIds.has(result.id), result.scores.passed, result.id);

console.log("✓ Meta AI 第一批 60 份价值评分通过（保留 32，移除 28）");
