"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const batchId = "nvidia-value-score-batch-04";
const score = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", `${batchId}.json`), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(root, "proposals", "official-technical", "nvidia-learning-prefilter-20260924.json"), "utf8"));

assert.deepStrictEqual(score.summary, { reviewed:60, retained:40, removed:20 });
assert.strictEqual(score.results.length, 60);
for (const result of score.results) {
  assert.strictEqual(result.scores.passed, result.scores.total >= 6 && result.scores.knowledgeImportance >= 2);
  if (result.scores.passed) {
    assert.strictEqual(result.contentVerification.httpStatus, 200);
    assert.ok(result.linkedNodes.length > 0);
    assert.ok(result.uniqueDelta.length > 20);
  }
}
assert.strictEqual(score.results.filter(result => result.contentVerification.httpStatus === 404).length, 5);
assert.ok(score.results.filter(result => /\/dev-notes\//.test(result.url) && result.scores.passed).every(result => result.finalDecision === "admitted-supporting"));
assert.strictEqual(inventory.records.filter(record => record.scoreBatch === batchId).length, 60);
const scored = inventory.records.filter(record => /^nvidia-value-score-batch-/.test(record.scoreBatch || ""));
assert.strictEqual(inventory.summary.pendingImportanceReview, 400 - scored.length);

const context = { window:{} };
vm.createContext(context);
const dataFiles = ["data/library.js", "data/library-official-technical.js", ...Array.from({length:4}, (_,i) => `data/library-official-nvidia-importance-0${i+1}.js`)];
for (const relative of dataFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
const items = context.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "nvidia");
assert.strictEqual(items.length, 154);
assert.strictEqual(new Set(items.map(item => item.id)).size, 154);
console.log("✓ NVIDIA 第四批 60 份价值评分通过（保留 40，移除 20；累计保留 154，剩余 160）");
