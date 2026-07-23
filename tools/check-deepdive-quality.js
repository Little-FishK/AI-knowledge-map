/* 统一入口：node tools/check-deepdive-quality.js [--l4-certified <id>] */
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");

function run(script, args = []) {
  const result = spawnSync(process.execPath, [path.join(root, "tools", script), ...args], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status || 1);
}

run("validate-deepdives.js");
run("audit-deepdive-gold.js", [
  "--summary",
  "--changed",
  "--baseline",
  "docs/deepdive-quality-baseline.json",
]);
run("audit-deepdive-benchmark.js", [
  "--summary",
  "--changed",
  "--baseline",
  "docs/deepdive-l3-baseline.json",
]);
run("audit-deepdive-browser.js", ["--changed"]);

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
  run("audit-deepdive-benchmark.js", ["--require-benchmark", id]);
  run("review-deepdive-quality.js", ["--require-current", id]);
} else {
  run("review-deepdive-quality.js");
}
