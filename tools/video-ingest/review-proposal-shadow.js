"use strict";

const fs = require("fs");
const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson
} = require("./core");
const {
  renderShadowReport,
  reviewProposal
} = require("./shadow-review");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.evidence || !args.output) {
    console.error("用法：node tools/video-ingest/review-proposal-shadow.js --proposal <proposal.json> --evidence <evidence.json> --output <shadow.json> [--assessment <assessment.json>]");
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const assessment = args.assessment ? readJson(path.resolve(args.assessment)) : null;
  const report = reviewProposal(proposal, evidence, assessment);
  const output = path.resolve(args.output);
  writeJson(output, report);
  const markdown = output.replace(/\.json$/i, "") + ".md";
  fs.writeFileSync(markdown, renderShadowReport(report), "utf8");
  console.log(`✓ v0.3 影子复核已生成：${output}`);
  console.log(`✓ 人类可读报告已生成：${markdown}`);
  console.log(`  正式写入：${report.summary.formalWrites}`);
  if (report.validation.proposalErrors.length || report.validation.assessmentErrors.length) process.exitCode = 1;
}

if (require.main === module) main();
