"use strict";

const assert = require("assert");
const path = require("path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");
const batches = [1, 2, 3].map(number => require(path.join(PROJECT_ROOT, "proposals", "official-technical", `anthropic-value-score-batch-0${number}.json`)));

global.window = {};
require(path.join(PROJECT_ROOT, "data", "library.js"));
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
for (let number = 1; number <= 4; number++) require(path.join(PROJECT_ROOT, "data", `library-official-anthropic-importance-0${number}.js`));

const items = global.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "anthropic");
const ids = new Set(items.map(item => item.id));
const results = batches.flatMap(batch => batch.results.map(result => ({ ...result, scoreBatch:batch.batch.id })));
assert.strictEqual(results.length, 180);
assert.strictEqual(new Set(results.map(result => result.id)).size, 180);
assert.strictEqual(batches[2].summary.retained, 54);
assert.strictEqual(batches[2].summary.removed, 6);
assert(items.length <= 284, "后续批次只能继续收紧 Anthropic 前台数量");
results.forEach(result => {
  const score = result.scores;
  assert.strictEqual(score.total, score.knowledgeImportance + score.irreplaceability + score.durability + score.applicability);
  assert.strictEqual(score.passed, score.total >= 6 && score.knowledgeImportance >= 2);
  assert.strictEqual(ids.has(result.id), score.passed, result.id);
  if (score.passed) assert.strictEqual(items.find(item => item.id === result.id).scoreBatch, result.scoreBatch);
});
console.log("✓ Anthropic 第三批 60 份评分：保留 54，淘汰 6；批次结论在后续收紧后仍成立");
