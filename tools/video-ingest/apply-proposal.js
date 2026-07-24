"use strict";

const fs = require("fs");
const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson
} = require("./core");
const {
  buildApplyPlan,
  planFingerprint,
  applyPlan,
  rollbackReceipt
} = require("./application");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.evidence || !args.approval) {
    console.error("用法：node tools/video-ingest/apply-proposal.js --proposal <proposal.json> --evidence <evidence.json> --approval <approval.json> [--plan plan.json] [--write] [--receipt receipt.json] [--root path]");
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const approval = readJson(path.resolve(args.approval));
  const root = path.resolve(args.root || path.join(__dirname, "..", ".."));
  const freshPlan = buildApplyPlan(proposal, evidence, approval, { root });
  let plan = freshPlan;
  if (!args.write && args.plan) writeJson(path.resolve(args.plan), plan);
  if (args.write) {
    if (!args.plan || !fs.existsSync(path.resolve(args.plan))) {
      console.error("✗ --write 必须提供已经 dry-run 审阅过的 --plan 文件");
      process.exit(2);
    }
    const reviewedPlan = readJson(path.resolve(args.plan));
    if (planFingerprint(reviewedPlan) !== planFingerprint(freshPlan)) {
      console.error("✗ 当前提案、批准或目标文件与已审阅 plan 不再一致；请重新 dry-run 并审阅");
      process.exit(1);
    }
    plan = reviewedPlan;
  }
  console.log(`${plan.status === "ready" ? "✓" : "✗"} 应用计划：${plan.status}`);
  plan.operations.forEach((operation) => {
    console.log(`  - ${operation.type}: ${operation.softwareId || operation.term || ""}`);
  });
  plan.warnings.forEach((warning) => console.log("  ⚠ " + warning));
  plan.blockers.forEach((blocker) => console.error("  - " + blocker));
  if (!args.write) {
    console.log("  dry-run：未修改任何文件。传入 --write 才会应用。");
    if (plan.status !== "ready") process.exitCode = 1;
    return;
  }
  if (plan.status !== "ready") process.exit(1);
  const receipt = applyPlan(plan, { root });
  const receiptFile = path.resolve(args.receipt || path.join(
    path.dirname(args.approval),
    path.basename(args.approval).replace(/(?:\.approval)?\.json$/i, ".receipt.json")
  ));
  try {
    writeJson(receiptFile, receipt);
  } catch (error) {
    rollbackReceipt(receipt, { root });
    throw new Error(`回滚凭据写入失败，已撤销本次应用：${error.message}`);
  }
  console.log(`✓ 已原子应用 ${receipt.operations.length} 个操作`);
  console.log(`✓ 回滚凭据：${receiptFile}`);
}

if (require.main === module) main();
