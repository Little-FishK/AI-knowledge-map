"use strict";

const assert = require("assert");

const canonicalLoader = require("../../tools/deepdive/runtime/deepdive-loader");
const canonicalContracts = require("../../tools/deepdive/quality/deepdive-audit-contracts");
const canonicalNarrative = require("../../tools/deepdive/quality/deepdive-narrative-audit");

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

console.log("✓ deep-dive shared module APIs");
