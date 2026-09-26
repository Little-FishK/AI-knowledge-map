"use strict";

const assert = require("assert");
const path = require("path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");
const scoreBatches = [1, 2, 3, 4, 5, 6].map(number => require(path.join(PROJECT_ROOT, "proposals", "official-technical", `anthropic-value-score-batch-0${number}.json`)));
const importanceBatches = [1, 2, 3, 4].map(number => require(path.join(PROJECT_ROOT, "proposals", "official-technical", `anthropic-importance-batch-0${number}.json`)));

global.window = {};
require(path.join(PROJECT_ROOT, "data", "library.js"));
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
for (let number = 1; number <= 4; number++) require(path.join(PROJECT_ROOT, "data", `library-official-anthropic-importance-0${number}.js`));

const items = global.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "anthropic");
const itemIds = new Set(items.map(item => item.id));
const results = scoreBatches.flatMap(batch => batch.results.map(result => ({ ...result, scoreBatch:batch.batch.id })));
const audited = importanceBatches.flatMap(batch => batch.records).filter(record => record.valueScore);
assert.strictEqual(results.length, 306);
assert.strictEqual(new Set(results.map(result => result.id)).size, 306);
assert.strictEqual(audited.length, 306);
assert.strictEqual(results.filter(result => result.scores.passed).length, 269);
assert.strictEqual(results.filter(result => !result.scores.passed).length, 37);
assert.strictEqual(items.length, 269);
assert.strictEqual(items.filter(item => !item.valueScore || !item.scoreBatch).length, 0);
results.forEach(result => {
  const score = result.scores;
  assert.strictEqual(score.total, score.knowledgeImportance + score.irreplaceability + score.durability + score.applicability);
  assert.strictEqual(score.passed, score.total >= 6 && score.knowledgeImportance >= 2);
  assert.strictEqual(itemIds.has(result.id), score.passed, result.id);
  if (score.passed) assert.strictEqual(items.find(item => item.id === result.id).scoreBatch, result.scoreBatch);
});
console.log("✓ Anthropic 306 份价值评分闭环：保留 269，淘汰 37，未评分 0");
