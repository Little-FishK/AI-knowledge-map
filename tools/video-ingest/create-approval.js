"use strict";

const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson
} = require("./core");
const {
  createApprovalDraft,
  validateApproval
} = require("./application");

function list(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.output) {
    console.error("用法：node tools/video-ingest/create-approval.js --proposal <proposal.json> --output <approval.json> [--tutorial approve|reject] [--approve-concepts a,b] [--reject-concepts c,d] [--reject-remaining] [--approved-by name]");
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const approval = createApprovalDraft(proposal);
  if (args.tutorial) approval.tutorial.decision = args.tutorial;
  const approve = new Set(list(args["approve-concepts"]));
  const reject = new Set(list(args["reject-concepts"]));
  approval.concepts.forEach((item) => {
    if (approve.has(item.term)) item.decision = "approve";
    else if (reject.has(item.term) || args["reject-remaining"]) item.decision = "reject";
  });
  approval.approvedBy = args["approved-by"] || null;
  approval.approvedAt = args["approved-at"] || (approval.approvedBy ? new Date().toISOString().slice(0, 10) : null);
  approval.notes = args.notes || "";
  const complete = approval.approvedBy &&
    approval.tutorial.decision !== "pending" &&
    approval.concepts.every((item) => item.decision !== "pending");
  approval.status = complete ? "approved" : "draft";
  const errors = validateApproval(approval, proposal, { requireApproved: complete });
  if (errors.length) {
    console.error("✗ 批准文件无效：");
    errors.forEach((error) => console.error("  - " + error));
    process.exit(1);
  }
  writeJson(path.resolve(args.output), approval);
  console.log(`✓ ${complete ? "已批准" : "待填写"}文件已生成：${path.resolve(args.output)}`);
}

if (require.main === module) main();
