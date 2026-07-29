"use strict";

const path = require("path");
const { enqueueNewNode } = require("../deepdive-stage2/core");
const { parseArgs, readJson } = require("./core");
const { buildNodeIntegration } = require("./node-package");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.evidence || !args.assessment || !args.content || !args.packet) {
    console.error(
      "用法：node tools/video-ingest/enqueue-stage2-node.js "
      + "--proposal <proposal.json> --evidence <evidence.json> "
      + "--assessment <assessment.json> --packet <writing-packet.json> "
      + "--content <node-content.json> [--root <project>]",
    );
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const assessment = readJson(path.resolve(args.assessment));
  const packet = readJson(path.resolve(args.packet));
  const content = readJson(path.resolve(args.content));
  const integration = buildNodeIntegration(proposal, evidence, assessment, content);
  if (!packet.stage2Material) throw new Error("写作包缺少 stage2Material");
  const root = path.resolve(args.root || path.join(__dirname, "..", ".."));
  const record = enqueueNewNode(root, integration, {
    ...packet.stage2Material,
    nodeDetail: content.node,
    originIds: [integration.bindings.proposalHash, integration.bindings.evidenceHash],
  });
  console.log(`✓ 新节点已进入第二阶段串行队列：${record.id}`);
  console.log(`  状态：${record.state}`);
  console.log("  理解原理页尚未写入正式目录。");
}

if (require.main === module) main();
