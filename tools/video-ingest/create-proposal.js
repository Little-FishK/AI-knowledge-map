"use strict";

const fs = require("fs");
const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson,
  validateEvidence,
  validateProposal
} = require("./core");
const { buildContext } = require("./build-context");

function conceptSeed(node) {
  return {
    term: node.matchedTerms[0] ? node.matchedTerms[0].term : node.title,
    decision: "undecided",
    targetNode: node.id,
    rationale: "",
    nodeScores: null,
    coreCandidate: false,
    coreScores: null,
    coreReason: null,
    requiresHumanCoreApproval: false,
    nearestNodes: [],
    proposedEdges: [],
    externalSources: [],
    evidenceRefs: [],
    disqualifiers: [],
    proposedNode: null
  };
}

function createDraft(evidence, context) {
  const errors = validateEvidence(evidence);
  if (errors.length) throw new Error("证据无效：\n- " + errors.join("\n- "));
  if (context.evidenceHash !== evidence.contentHash) throw new Error("上下文与证据哈希不匹配");
  const selected = context.tutorialContext.selectedSoftware;
  let action = "none";
  if (selected && context.tutorialContext.existingTutorial) action = "append-resource";
  else if (selected) action = "create-page";
  else if (context.tutorialContext.detectedSoftware.length) action = "software-candidate";

  return {
    schemaVersion: 1,
    status: "draft",
    evidenceHash: evidence.contentHash,
    contextHash: context.contextHash,
    source: {
      url: evidence.source.url,
      title: evidence.source.title,
      creator: evidence.source.creator || null
    },
    tutorialTrack: {
      decision: "undecided",
      action,
      softwareId: selected ? selected.id : null,
      evidenceLevel: evidence.acquisition.evidenceLevelSuggestion || null,
      standards: null,
      quality: null,
      rationale: "",
      evidenceRefs: [],
      resourceDraft: null
    },
    conceptTrack: {
      instructions: "这些只是命中已有名称的上下文种子，不代表应当补充。AI 可删除、改判，也可新增视频中出现但地图不存在的候选概念。",
      candidates: context.conceptContext.relevantNodes.slice(0, 12).map(conceptSeed)
    },
    approval: {
      tutorialApproved: false,
      approvedConceptTerms: [],
      rejectedConceptTerms: [],
      notes: ""
    }
  };
}

function renderReport(proposal, context) {
  const lines = [
    `# 双轨视频入库提案（草稿）`,
    ``,
    `- 视频：${proposal.source.title}`,
    `- URL：${proposal.source.url}`,
    `- 证据：${proposal.tutorialTrack.evidenceLevel || "待评"} · \`${proposal.evidenceHash}\``,
    `- 状态：${proposal.status}`,
    ``,
    `## 教程轨`,
    ``,
    `- 目标软件：${proposal.tutorialTrack.softwareId || "尚未确定"}`,
    `- 建议动作：${proposal.tutorialTrack.action}`,
    `- 正式决定：待 AI 分析与人工批准`,
    `- 重复 URL：${context.tutorialContext.duplicateUrlMatches.length ? "是" : "否"}`,
    ``,
    `## 概念轨`,
    ``,
    `当前受限上下文命中 ${context.conceptContext.relevantNodes.length} 个节点。下列条目只是待分析种子：`,
    ``
  ];
  proposal.conceptTrack.candidates.forEach(candidate => {
    lines.push(`- [ ] **${candidate.term}** → 现有节点 \`${candidate.targetNode}\`（待判 new / merge / supplement / reject / uncertain）`);
  });
  lines.push(
    ``,
    `## AI 填写要求`,
    ``,
    `1. 教程轨和概念轨必须独立判断。`,
    `2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。`,
    `3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。`,
    `4. 核心节点使用独立评分，且必须保留人工批准。`,
    `5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。`,
    ``
  );
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.evidence || !args.output) {
    console.error("用法：node tools/video-ingest/create-proposal.js --evidence <evidence.json> --output <proposal.json> [--context context.json] [--software codex]");
    process.exit(2);
  }
  const evidence = readJson(path.resolve(args.evidence));
  const context = args.context
    ? readJson(path.resolve(args.context))
    : buildContext(evidence, { softwareId: args.software || null, limit: args.limit || 20 });
  const proposal = createDraft(evidence, context);
  const result = validateProposal(proposal, evidence);
  if (result.errors.length) throw new Error("生成的草稿未通过校验：\n- " + result.errors.join("\n- "));
  const outputFile = path.resolve(args.output);
  writeJson(outputFile, proposal);
  const reportFile = outputFile.replace(/\.json$/i, "") + ".md";
  fs.writeFileSync(reportFile, renderReport(proposal, context), "utf8");
  if (!args.context) {
    const contextFile = outputFile.replace(/\.json$/i, "") + ".context.json";
    writeJson(contextFile, context);
  }
  console.log(`✓ 双轨提案草稿已生成：${outputFile}`);
  console.log(`✓ 人类可读报告已生成：${reportFile}`);
}

if (require.main === module) main();

module.exports = { createDraft, renderReport };
