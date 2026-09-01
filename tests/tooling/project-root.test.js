"use strict";

const assert = require("assert");
const path = require("path");
const {
  PROJECT_ROOT,
  assertWithinProjectRoot,
  isWithinProjectRoot,
  resolveFromProjectRoot,
  resolveProjectRoot
} = require("../../tools/shared/project-root");

const expectedRoot = path.resolve(__dirname, "..", "..");
assert.strictEqual(PROJECT_ROOT, expectedRoot);
assert.strictEqual(resolveProjectRoot(), expectedRoot);
assert.strictEqual(
  resolveFromProjectRoot(PROJECT_ROOT, "data", "graph.js"),
  path.join(expectedRoot, "data", "graph.js")
);

const internalPath = path.join(expectedRoot, "tools", "validators");
const externalPath = path.resolve(expectedRoot, "..");
assert.strictEqual(isWithinProjectRoot(expectedRoot, internalPath), true);
assert.strictEqual(isWithinProjectRoot(expectedRoot, externalPath), false);
assert.strictEqual(assertWithinProjectRoot(expectedRoot, internalPath), internalPath);
assert.throws(
  () => assertWithinProjectRoot(expectedRoot, externalPath, "fixture"),
  /fixture must stay within the project root/
);

const environmentVariable = "AI_KNOWLEDGE_MAP_TEST_ROOT";
const previousValue = process.env[environmentVariable];
process.env[environmentVariable] = path.join(expectedRoot, "tests", "fixtures");
assert.strictEqual(
  resolveProjectRoot(environmentVariable),
  path.join(expectedRoot, "tests", "fixtures")
);
if (previousValue === undefined) delete process.env[environmentVariable];
else process.env[environmentVariable] = previousValue;

console.log("✓ project root helpers");
