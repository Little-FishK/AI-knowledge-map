"use strict";

const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson
} = require("./core");
const { createAssessmentTemplate } = require("./shadow-review");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.evidence || !args.output) {
    console.error("用法：node tools/video-ingest/create-shadow-assessment.js --proposal <proposal.json> --evidence <evidence.json> --output <assessment.json> [--reviewer <id>]");
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const output = path.resolve(args.output);
  writeJson(output, createAssessmentTemplate(proposal, evidence, args.reviewer || ""));
  console.log(`✓ 独立复核模板已生成：${output}`);
  console.log("  模板不包含提案分数；请基于原始证据独立填写。");
}

if (require.main === module) main();
