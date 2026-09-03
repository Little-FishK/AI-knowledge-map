"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const workflowPath = path.join(
  projectRoot,
  ".github",
  "workflows",
  "deepdive-quality.yml",
);
const workflow = fs.readFileSync(workflowPath, "utf8");
const triggerBlock = workflow.match(/^on:\s*\r?\n([\s\S]*?)^permissions:/m);

assert.ok(triggerBlock, "quality workflow must contain an on block before permissions");

const triggers = triggerBlock[1];
assert.match(triggers, /^  pull_request:\s*$/m, "quality gate must run for every PR");
assert.match(triggers, /^  push:\s*$/m, "quality gate must run after pushes");
assert.match(
  triggers,
  /^    branches:\s*\r?\n      - main\s*$/m,
  "push validation must include the main branch",
);
assert.match(
  triggers,
  /^  workflow_dispatch:\s*$/m,
  "quality gate must remain manually runnable",
);
assert.doesNotMatch(
  triggers,
  /^\s+(?:paths|paths-ignore):/m,
  "required quality gates must not use path filters",
);
assert.match(
  workflow,
  /DEEPDIVE_BASE_REF:\s*\$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.event\.before \|\| github\.sha \}\}/,
  "PR, push, and manual runs must provide a stable comparison revision",
);

console.log("✓ CI quality gate trigger coverage");
