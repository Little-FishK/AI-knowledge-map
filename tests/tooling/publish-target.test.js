"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { digest } = require("../../tools/readiness/site-artifact");
const { restore } = require("../../tools/restore-release-line-endings");
const { verifyPublishTarget } = require("../../tools/verify-publish-target");

const root = path.resolve(__dirname, "../..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ai-map-publish-test-"));
try {
  const original = Buffer.from("first\nsecond\n");
  const file = path.join(temp, "sample.txt");
  fs.writeFileSync(file, "first\r\nsecond\r\n");
  fs.writeFileSync(path.join(temp, "release-manifest.json"), JSON.stringify({
    schemaVersion: 1,
    files: { "sample.txt": { sha256: digest(original), bytes: original.length } },
  }));
  assert.deepEqual(restore(temp), { checked: 1, restored: 1 });
  assert.deepEqual(fs.readFileSync(file), original);
  assert.deepEqual(restore(temp), { checked: 1, restored: 0 });
  fs.writeFileSync(file, "changed\r\nsecond\r\n");
  assert.throws(() => restore(temp), /Unrestorable release file/);
} finally {
  if (path.dirname(temp) !== path.resolve(os.tmpdir())) throw new Error("Unsafe test cleanup path");
  fs.rmSync(temp, { recursive: true });
}

assert.throws(() => verifyPublishTarget(path.join(root, "site-release"), "https://ai-knowledge-map.com/"),
  /Required public file missing: library\/index.html/);
const workflow = fs.readFileSync(path.join(root, ".github/workflows/publish-website.yml"), "utf8");
assert.match(workflow, /ref: gh-pages/);
assert.match(workflow, /release_sha:/);
assert.match(workflow, /restore-release-line-endings\.js/);
assert.match(workflow, /verify-publish-target\.js/);
assert.doesNotMatch(workflow, /path: site-release/);
console.log("PASS current gh-pages revision guard, historical fixture refusal, exact LF restoration and tamper rejection");
