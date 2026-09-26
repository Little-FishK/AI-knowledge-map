"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "meta-ai-value-score-batch-06";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json"), "utf8"));

assert.deepStrictEqual(score.summary, { reviewed:60, retained:10, removed:50 });
assert.strictEqual(score.results.length, 60);
assert.ok(score.results.every(result => result.contentVerification.httpStatus === 200));
for (const result of score.results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
  if (result.scores.passed) assert.ok(result.uniqueDelta.length > 20);
}
assert.ok(score.results.filter(result => /\/(?:cookbook|case-studies|resources\/videos)\//.test(result.url) && result.scores.passed).every(result => result.finalDecision === "admitted-supporting"));
assert.strictEqual(inventory.records.filter(record => record.scoreBatch === batchId).length, 60);
const allScored = inventory.records.filter(record => /^meta-ai-value-score-batch-/.test(record.scoreBatch || ""));
assert.strictEqual(inventory.summary.pendingContentReview, inventory.summary.uniqueContentCandidates - allScored.length);

const context = { window:{} };
vm.createContext(context);
const dataFiles = ["data/library.js", "data/library-official-technical.js", ...Array.from({length:6}, (_,i) => `data/library-official-meta-ai-importance-0${i+1}.js`)];
for (const relative of dataFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "meta-ai");
assert.strictEqual(items.length, 126);
assert.strictEqual(new Set(items.map(item => item.id)).size, 126);
console.log("✓ Meta AI 第六批 60 份价值评分通过（保留 10，移除 50；累计保留 126）");
