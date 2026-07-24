"use strict";

const assert = require("assert");
const { calibrate } = require("./video-ingest/calibration");

function candidate(term, decision, core = false) {
  return {
    term,
    predictedDecision: decision,
    predictedCore: core,
    eligibleNew: decision === "new",
    blockers: []
  };
}

const batch = {
  schemaVersion: 1,
  mode: "shadow-batch",
  results: [{
    id: "fixture-balanced",
    status: "reviewed",
    candidates: [
      candidate("Novel Mechanism", "new", true),
      candidate("Existing Concept", "supplement", false),
      candidate("Alias Concept", "merge", false),
      candidate("Product Button", "reject", false)
    ]
  }]
};

const labels = {
  schemaVersion: 1,
  policy: {
    minimumJobs: 1,
    minimumCandidates: 4,
    minimumNewGold: 1,
    minimumExistingGold: 2,
    minimumRejectGold: 1,
    minimumCoreGold: 1
  },
  samples: [{
    id: "fixture-balanced",
    expected: [
      { term: "Novel Mechanism", decision: "new", coreCandidate: true },
      { term: "Existing Concept", decision: "supplement", coreCandidate: false },
      { term: "Alias Concept", decision: "merge", coreCandidate: false },
      { term: "Product Button", decision: "reject", coreCandidate: false }
    ]
  }]
};

const perfect = calibrate(batch, labels, { generatedAt: "2026-07-24T00:00:00.000Z" });
assert.strictEqual(perfect.readyForAutomaticApplicationDevelopment, true);
assert.strictEqual(perfect.metrics.newPrecision, 1);
assert.strictEqual(perfect.metrics.duplicateEscapeRate, 0);
assert.strictEqual(perfect.metrics.rejectEscapeRate, 0);
assert.strictEqual(perfect.metrics.corePrecision, 1);
assert.strictEqual(perfect.formalWrites, 0);

const unsafeBatch = JSON.parse(JSON.stringify(batch));
unsafeBatch.results[0].candidates.find(item => item.term === "Existing Concept").predictedDecision = "new";
const unsafe = calibrate(unsafeBatch, labels, { generatedAt: "2026-07-24T00:00:00.000Z" });
assert.strictEqual(unsafe.readyForAutomaticApplicationDevelopment, false);
assert.strictEqual(unsafe.metrics.duplicateEscapes, 1);
assert(unsafe.checks.some(check => check.name === "maximumDuplicateEscapeRate" && !check.passed));

const unresolvedBatch = JSON.parse(JSON.stringify(batch));
unresolvedBatch.results[0].candidates[0].predictedDecision = null;
const unresolved = calibrate(unresolvedBatch, labels, { generatedAt: "2026-07-24T00:00:00.000Z" });
assert.strictEqual(unresolved.readyForAutomaticApplicationDevelopment, false);
assert(unresolved.checks.some(check => check.name === "minimumResolvedCoverage" && !check.passed));

const missing = calibrate({ schemaVersion: 1, mode: "shadow-batch", results: [] }, labels);
assert.strictEqual(missing.readyForAutomaticApplicationDevelopment, false);
assert(missing.errors.some(error => /缺标注样本/.test(error)));

console.log("✓ v0.5 影子校准：安全阈值、重复逃逸、未解析覆盖与缺样本夹具通过");
