"use strict";

const path = require("path");
const { parseArgs, readJson } = require("./core");
const {
  buildNodePackage,
  runDeepDiveGates,
  writeNodePackage
} = require("./node-package");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.evidence || !args.assessment || !args.content || !args.output) {
    console.error("用法：node tools/video-ingest/create-node-package.js --proposal <proposal.json> --evidence <evidence.json> --assessment <assessment.json> --content <content.json> --output <directory>");
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const assessment = readJson(path.resolve(args.assessment));
  const content = readJson(path.resolve(args.content));
  const pkg = buildNodePackage(proposal, evidence, assessment, content);
  pkg.validation = {
    ...pkg.validation,
    ...runDeepDiveGates(pkg)
  };
  const output = writeNodePackage(args.output, pkg);
  console.log(`✓ v0.4 新节点原子包预览已生成：${output}`);
  console.log(`  L1=${pkg.validation.l1} L2=${pkg.validation.l2} L3=${pkg.validation.l3}`);
  console.log(`  正式写入=${pkg.shadowEligibility.formalWrite}`);
  if (!pkg.validation.passed) process.exitCode = 1;
}

if (require.main === module) main();
