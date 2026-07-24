"use strict";

const path = require("path");
const { parseArgs, readJson, validateProposal } = require("./core");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.evidence || !args.proposal) {
    console.error("用法：node tools/video-ingest/validate-proposal.js --evidence <evidence.json> --proposal <proposal.json> [--ready]");
    process.exit(2);
  }
  const evidence = readJson(path.resolve(args.evidence));
  const proposal = readJson(path.resolve(args.proposal));
  const result = validateProposal(proposal, evidence, { ready: Boolean(args.ready) });
  if (result.warnings.length) {
    console.log("⚠ 提醒：");
    result.warnings.forEach(item => console.log("  - " + item));
  }
  if (result.errors.length) {
    console.error(`✗ 双轨提案发现 ${result.errors.length} 个问题：`);
    result.errors.forEach(item => console.error("  - " + item));
    process.exit(1);
  }
  console.log(`✓ 双轨提案通过${args.ready ? "严格就绪" : "草稿结构"}校验`);
  if (result.scores.tutorialTotal != null) {
    console.log(`  教程质量：${result.scores.tutorialTotal.toFixed(2)}/70`);
  }
  result.scores.concepts.forEach(item => {
    if (item.nodeTotal != null) {
      console.log(`  节点 ${item.term}：${item.nodeTotal}/100${item.coreTotal == null ? "" : ` · 核心 ${item.coreTotal}/100`}`);
    }
  });
}

if (require.main === module) main();
