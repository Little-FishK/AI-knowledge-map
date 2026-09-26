"use strict";

const assert = require("assert");
const path = require("path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");
const scoreBatch = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-value-score-batch-01.json"));

global.window = {};
require(path.join(PROJECT_ROOT, "data", "library.js"));
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
for (let number = 1; number <= 4; number++) {
  require(path.join(PROJECT_ROOT, "data", `library-official-anthropic-importance-0${number}.js`));
}

const items = global.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "anthropic");
const itemIds = new Set(items.map(item => item.id));
assert.strictEqual(scoreBatch.results.length, 60);
assert.strictEqual(scoreBatch.summary.retained, 53);
assert.strictEqual(scoreBatch.summary.removed, 7);
assert(items.length <= 299, "后续批次只能继续收紧 Anthropic 前台数量");
scoreBatch.results.forEach(result => {
  const scores = result.scores;
  assert.strictEqual(scores.total, scores.knowledgeImportance + scores.irreplaceability + scores.durability + scores.applicability);
  assert.strictEqual(scores.passed, scores.total >= 6 && scores.knowledgeImportance >= 2);
  assert.strictEqual(itemIds.has(result.id), scores.passed, result.id);
  if (scores.passed) {
    const item = items.find(entry => entry.id === result.id);
    assert.strictEqual(item.valueScore.total, scores.total);
    assert.strictEqual(item.scoreBatch, "anthropic-value-score-batch-01");
  }
});
console.log("✓ Anthropic 第一批 60 份评分：保留 53，淘汰 7，批次结论在后续收紧后仍成立");
