"use strict";

const assert = require("assert");

const compatibilityLoader = require("../../tools/deepdive-loader");
const canonicalLoader = require("../../tools/deepdive/runtime/deepdive-loader");
const compatibilityContracts = require("../../tools/deepdive-audit-contracts");
const canonicalContracts = require("../../tools/deepdive/quality/deepdive-audit-contracts");
const compatibilityNarrative = require("../../tools/deepdive-narrative-audit");
const canonicalNarrative = require("../../tools/deepdive/quality/deepdive-narrative-audit");

assert.strictEqual(compatibilityLoader, canonicalLoader);
assert.strictEqual(compatibilityContracts, canonicalContracts);
assert.strictEqual(compatibilityNarrative, canonicalNarrative);

assert.deepStrictEqual(
  Object.keys(canonicalLoader).sort(),
  ["loadDeepDivePages", "loadDeepDivePagesFromGit", "resolveGitBaseRef"]
);
assert.deepStrictEqual(
  Object.keys(canonicalContracts).sort(),
  ["loadSectionAudit", "pageContentHash"]
);
assert.strictEqual(typeof canonicalNarrative.scanNarrativeTemplates, "function");
assert.strictEqual(typeof canonicalNarrative.narrativeTemplateBlockers, "function");

console.log("✓ deep-dive quality compatibility exports");
