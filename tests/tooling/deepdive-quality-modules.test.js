"use strict";

const assert = require("assert");

const canonicalLoader = require("../../tools/deepdive/runtime/deepdive-loader");
const canonicalContracts = require("../../tools/deepdive/quality/deepdive-audit-contracts");
const canonicalNarrative = require("../../tools/deepdive/quality/deepdive-narrative-audit");
const { benchmarkChangeScope } = require("../../tools/deepdive/quality/benchmark-change-scope");

assert.deepStrictEqual(
  Object.keys(canonicalLoader).sort(),
  ["SOURCE_LAYOUT_FILE", "loadDeepDivePages", "loadDeepDivePagesFromGit", "resolveGitBaseRef"]
);
assert.deepStrictEqual(
  Object.keys(canonicalContracts).sort(),
  ["loadSectionAudit", "pageContentHash"]
);
assert.strictEqual(typeof canonicalNarrative.scanNarrativeTemplates, "function");
assert.strictEqual(typeof canonicalNarrative.narrativeTemplateBlockers, "function");

const benchmark = {
  schemaVersion: 2,
  reference: { id: "neural-network", pageHash: "sha256:old" },
  minimumScore: 88,
  dimensionFloors: { continuity: 16 },
};
assert.deepStrictEqual(
  benchmarkChangeScope(benchmark, {
    ...benchmark,
    reference: { ...benchmark.reference, pageHash: "sha256:new" },
  }),
  { allPages: false, pageIds: ["neural-network"] },
);
assert.deepStrictEqual(
  benchmarkChangeScope(benchmark, { ...benchmark, minimumScore: 89 }),
  { allPages: true, pageIds: [] },
);
assert.deepStrictEqual(
  benchmarkChangeScope(benchmark, {
    ...benchmark,
    reference: { id: "other-page", pageHash: "sha256:new" },
  }),
  { allPages: true, pageIds: [] },
);

console.log("✓ deep-dive shared module APIs");
