"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const score = JSON.parse(fs.readFileSync(path.join(
  root, "proposals", "official-technical", "google-deepmind-value-score-batch-02.json"
), "utf8"));

assert.strictEqual(score.results.length, 60);
assert.deepStrictEqual(score.summary, { reviewed:60, retained:54, removed:6 });
for (const result of score.results) {
  const scores = result.scores;
  assert.strictEqual(scores.total,
    scores.knowledgeImportance + scores.irreplaceability + scores.durability + scores.applicability);
  assert.strictEqual(scores.passed, scores.total >= 6 && scores.knowledgeImportance >= 2);
}

const context = { window:{} };
vm.createContext(context);
for (const relative of [
  "data/library.js",
  "data/library-official-technical.js",
  "data/library-official-google-deepmind-importance-01.js",
  "data/library-official-google-deepmind-importance-02.js"
]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
}
const items = context.window.PRO_LIBRARY.items.filter(item =>
  item.sourceClass === "official" && item.sourceSubcategory === "google-deepmind"
);
const itemIds = new Set(items.map(item => item.id));
for (const result of score.results) {
  assert.strictEqual(itemIds.has(result.id), result.scores.passed, result.id);
}
assert.strictEqual(items.filter(item => item.scoreBatch === "google-deepmind-value-score-batch-02").length, 54);
console.log("✓ Google/DeepMind 第二批 60 份价值评分通过（保留 54，移除 6）");
