"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "meta-ai-value-score-batch-02";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json"), "utf8"));

assert.deepStrictEqual(score.summary, { reviewed:60, retained:31, removed:29 });
assert.strictEqual(score.results.length, 60);
assert.ok(score.results.every(result => result.contentVerification.httpStatus === 200));
assert.ok(score.results.filter(result => result.scores.passed && result.section === "Cookbook").every(result => result.finalDecision === "admitted-supporting"));
for (const result of score.results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
  if (result.scores.passed) {
    assert.ok(Array.isArray(result.comparedWith));
    assert.ok(result.uniqueDelta.length > 20);
  }
}
const reviewed = inventory.records.filter(record => record.scoreBatch === batchId);
assert.strictEqual(reviewed.length, 60);
const allScored = inventory.records.filter(record => /^meta-ai-value-score-batch-/.test(record.scoreBatch || ""));
assert.strictEqual(inventory.summary.pendingContentReview, inventory.summary.uniqueContentCandidates - allScored.length);

const context = { window:{} };
vm.createContext(context);
for (const relative of ["data/library.js", "data/library-official-technical.js", "data/library-official-meta-ai-importance-01.js", "data/library-official-meta-ai-importance-02.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
}
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "meta-ai");
assert.strictEqual(items.length, 63);
assert.strictEqual(new Set(items.map(item => item.id)).size, 63);
console.log("✓ Meta AI 第二批 60 份价值评分通过（保留 31，移除 29；累计保留 63）");
