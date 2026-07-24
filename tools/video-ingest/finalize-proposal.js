"use strict";

const fs = require("fs");
const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson,
  validateProposal
} = require("./core");
const { renderReport } = require("./create-proposal");

function finalizeProposal(draft, editorial) {
  const proposal = JSON.parse(JSON.stringify(draft));
  proposal.status = "ready";
  proposal.tutorialTrack = {
    ...proposal.tutorialTrack,
    ...(editorial.tutorialTrack || {})
  };

  const decisions = new Map(
    (editorial.conceptTrack && editorial.conceptTrack.candidates || [])
      .map(candidate => [candidate.term, candidate])
  );
  proposal.conceptTrack.candidates = proposal.conceptTrack.candidates.map(candidate => {
    const decision = decisions.get(candidate.term);
    if (!decision) throw new Error(`编辑判断缺少候选：${candidate.term}`);
    return { ...candidate, ...decision };
  });

  const proposalTerms = new Set(proposal.conceptTrack.candidates.map(candidate => candidate.term));
  decisions.forEach((_, term) => {
    if (!proposalTerms.has(term)) throw new Error(`编辑判断包含未知候选：${term}`);
  });
  proposal.approval = {
    ...proposal.approval,
    ...(editorial.approval || {}),
    tutorialApproved: false,
    approvedConceptTerms: [],
    rejectedConceptTerms: []
  };
  return proposal;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.review || !args.evidence || !args.output) {
    console.error("用法：node tools/video-ingest/finalize-proposal.js --proposal <draft.json> --review <editorial.json> --evidence <evidence.json> --output <ready.json> [--context <context.json>]");
    process.exit(2);
  }
  const draft = readJson(path.resolve(args.proposal));
  const editorial = readJson(path.resolve(args.review));
  const evidence = readJson(path.resolve(args.evidence));
  const proposal = finalizeProposal(draft, editorial);
  const validation = validateProposal(proposal, evidence, { ready: true });
  if (validation.errors.length) {
    throw new Error("ready 提案未通过校验：\n- " + validation.errors.join("\n- "));
  }
  const output = path.resolve(args.output);
  writeJson(output, proposal);
  if (args.context) {
    const context = readJson(path.resolve(args.context));
    fs.writeFileSync(output.replace(/\.json$/i, "") + ".md", renderReport(proposal, context), "utf8");
  }
  console.log(`✓ ready 提案已生成：${output}`);
  console.log(`  教程分：${validation.scores.tutorialTotal == null ? "未计算" : validation.scores.tutorialTotal}`);
}

if (require.main === module) main();

module.exports = { finalizeProposal };
