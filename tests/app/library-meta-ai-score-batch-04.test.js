"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "meta-ai-value-score-batch-04";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json"), "utf8"));

assert.deepStrictEqual(score.summary, { reviewed:60, retained:17, removed:43 });
assert.strictEqual(score.results.length, 60);
assert.ok(score.results.every(result => result.contentVerification.httpStatus === 200));
for (const result of score.results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
  if (result.scores.passed) assert.ok(result.uniqueDelta.length > 20);
}
assert.strictEqual(inventory.records.filter(record => record.scoreBatch === batchId).length, 60);
const allScored = inventory.records.filter(record => /^meta-ai-value-score-batch-/.test(record.scoreBatch || ""));
assert.strictEqual(inventory.summary.pendingContentReview, inventory.summary.uniqueContentCandidates - allScored.length);

const context = { window:{} };
vm.createContext(context);
for (const relative of ["data/library.js", "data/library-official-technical.js", "data/library-official-meta-ai-importance-01.js", "data/library-official-meta-ai-importance-02.js", "data/library-official-meta-ai-importance-03.js", "data/library-official-meta-ai-importance-04.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
}
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "meta-ai");
assert.strictEqual(items.length, 101);
assert.strictEqual(new Set(items.map(item => item.id)).size, 101);
console.log("✓ Meta AI 第四批 60 份价值评分通过（保留 17，移除 43；累计保留 101）");
