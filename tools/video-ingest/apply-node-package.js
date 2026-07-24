"use strict";

const fs = require("fs");
const path = require("path");
const { parseArgs, readJson, writeJson } = require("./core");
const {
  applyNodePlan,
  buildNodeApplyPlan,
  planFingerprint
} = require("./node-application");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.package) {
    console.error("用法：node tools/video-ingest/apply-node-package.js --package <原子包目录> [--plan plan.json] [--write] [--receipt receipt.json] [--root path]");
    process.exit(2);
  }
  const root = path.resolve(args.root || path.join(__dirname, "..", ".."));
  const freshPlan = buildNodeApplyPlan(path.resolve(args.package), { root });
  let plan = freshPlan;
  if (!args.write && args.plan) writeJson(path.resolve(args.plan), plan);
  if (args.write) {
    if (!args.plan || !fs.existsSync(path.resolve(args.plan))) {
      console.error("✗ --write 必须提供已完成 dry-run 的 --plan 文件");
      process.exit(2);
    }
    const reviewed = readJson(path.resolve(args.plan));
    if (planFingerprint(reviewed) !== planFingerprint(freshPlan)) {
      console.error("✗ 原子包或正式地图自 dry-run 后发生变化，请重新生成计划");
      process.exit(1);
    }
    plan = reviewed;
  }
  console.log(`${plan.status === "ready" ? "✓" : "✗"} 新节点应用计划：${plan.status}`);
  plan.operations.forEach(operation => console.log(`  - ${operation.type}`));
  plan.blockers.forEach(blocker => console.error(`  - ${blocker}`));
  if (!args.write) {
    console.log("  dry-run：未修改正式地图。");
    if (plan.status !== "ready") process.exitCode = 1;
    return;
  }
  if (plan.status !== "ready") process.exit(1);
  const receipt = applyNodePlan(plan, { root });
  const receiptFile = path.resolve(args.receipt || path.join(path.dirname(args.plan), "node-application-receipt.json"));
  try {
    writeJson(receiptFile, receipt);
  } catch (error) {
    throw new Error(`节点已应用但回滚凭据写入失败：${error.message}`);
  }
  console.log(`✓ 新节点应用完成：${receipt.status}`);
  console.log(`✓ 回滚凭据：${receiptFile}`);
}

if (require.main === module) main();
