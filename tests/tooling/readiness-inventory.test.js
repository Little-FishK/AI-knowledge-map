"use strict";

const assert = require("node:assert/strict");
const { summarize, collect, DATA_FILES } = require("../../tools/readiness/inventory");

const base = {
  GRAPH: { meta: { version: "1", updatedAt: "2026-09-07" }, nodes: [{ id: "a", title: "A" }, { id: "b", title: "B" }], edges: [], recommendedLearningPath: [{ phase: "Intro", steps: [["1.10", "b"], ["1.2", "a"]] }] },
};
assert.equal(summarize(base).languages.englishGraphRecordsMarkedPublished, null, "Missing coverage must remain unknown.");
assert.equal(summarize(base).software.items, null);
assert.deepEqual(summarize(base).graph.learningOrder.map(step => step.order), ["1.10", "1.2"], "Preserve authoritative source order, never numeric-sort decimal labels.");
const translated = { ...base, AI_CONTENT_LOCALES: { en: { graph: { source: { graph: { version: "old", updatedAt: "2026-09-07" } }, collections: { "graph.nodes": { a: { status: "published" }, b: { status: "draft" }, foreign: { status: "published" } } } } } } };
assert.equal(summarize(translated).languages.englishGraphRecordsMarkedPublished, 1, "Exclude draft and foreign records.");
assert.equal(summarize(translated).languages.englishGraphSourceRevisionMatches, false);
assert.throws(() => summarize({}), /missing data is not zero coverage/);
assert.ok(DATA_FILES.every(file => !/deepdive|stage2|audit|reviews/i.test(file)), "No Stage 2 inputs in product inventory.");
const inventory = collect();
assert.ok(inventory.graph.nodes > 0);
assert.ok(inventory.unknown.includes("learningEffectiveness"));
assert.ok(Object.values(inventory.sourceHashes).every(hash => /^[a-f0-9]{64}$/.test(hash)));
console.log("PASS: readiness inventory preserves unknowns, source order, translation scope and Stage 2 boundary.");
