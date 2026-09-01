/* 统一入口：node tools/deepdive/quality/check-deepdive-quality.js [--l4-certified <id>] */
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");
const { PROJECT_ROOT } = require("../../shared/project-root");

const root = PROJECT_ROOT;

function run(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status || 1);
}

run(path.join(root, "tools", "validators", "deepdives.js"));
run(path.join(__dirname, "audit-deepdive-gold.js"), [
  "--summary",
  "--changed",
  "--baseline",
  "docs/deepdive-quality-baseline.json",
]);
run(path.join(__dirname, "audit-deepdive-benchmark.js"), [
  "--summary",
  "--changed",
  "--baseline",
  "docs/deepdive-l3-baseline.json",
]);
run(path.join(__dirname, "audit-deepdive-browser.js"), ["--changed"]);

const l4At = process.argv.indexOf("--l4-certified");
const legacyAt = process.argv.indexOf("--certified");
const certifiedAt = l4At >= 0 ? l4At : legacyAt;
if (certifiedAt >= 0) {
  const id = process.argv[certifiedAt + 1];
  if (!id) {
    console.error("--l4-certified 需要页面 id");
    process.exit(2);
  }
  if (legacyAt >= 0 && l4At < 0) {
    console.warn("⚠ --certified 已更名为 --l4-certified；本次仍按 L4 兼容执行");
  }
  run(path.join(__dirname, "audit-deepdive-benchmark.js"), ["--require-benchmark", id]);
  run(path.join(__dirname, "review-deepdive-quality.js"), ["--require-current", id]);
} else {
  run(path.join(__dirname, "review-deepdive-quality.js"));
}
