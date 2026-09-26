"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const proposalRoot = path.join(root, "proposals", "official-technical");
const scores = [1, 2, 3].map(number => JSON.parse(fs.readFileSync(path.join(
  proposalRoot, `google-deepmind-value-score-batch-0${number}.json`
), "utf8")));
assert.deepStrictEqual(scores.map(score => score.summary), [
  { reviewed:60, retained:50, removed:10 },
  { reviewed:60, retained:54, removed:6 },
  { reviewed:34, retained:31, removed:3 }
]);
assert.strictEqual(scores.flatMap(score => score.results).length, 154);
assert.strictEqual(scores.flatMap(score => score.results).filter(result => result.scores.passed).length, 135);

const audits = [1, 2].flatMap(number => JSON.parse(fs.readFileSync(path.join(
  proposalRoot, `google-deepmind-importance-batch-0${number}.json`
), "utf8")).records);
assert.strictEqual(audits.filter(record => record.decision.startsWith("admitted-") && !record.valueScore).length, 0);

const context = { window:{} };
vm.createContext(context);
for (const relative of [
  "data/library.js",
  "data/library-official-technical.js",
  "data/library-official-google-deepmind-importance-01.js",
  "data/library-official-google-deepmind-importance-02.js"
]) vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context);
const items = context.window.PRO_LIBRARY.items.filter(item =>
  item.sourceClass === "official" && item.sourceSubcategory === "google-deepmind"
);
assert.strictEqual(items.length, 135);
assert.strictEqual(items.filter(item => item.valueScore?.passed).length, 135);
assert.ok(items.every(item => item.valueScore.total >= 6 && item.valueScore.knowledgeImportance >= 2));

const inventory = JSON.parse(fs.readFileSync(path.join(
  proposalRoot, "google-deepmind-rereview-inventory-20260924.json"
), "utf8"));
assert.strictEqual(inventory.records.length, 257);
assert.strictEqual(inventory.records.filter(record => String(record.reviewStatus).startsWith("admitted-")).length, 135);
console.log("✓ Google/DeepMind 154 份价值评分全部完成（保留 135，移除 19）");
