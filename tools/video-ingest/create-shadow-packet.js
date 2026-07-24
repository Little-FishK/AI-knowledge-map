"use strict";

const fs = require("fs");
const path = require("path");
const {
  CORE_WEIGHTS,
  NODE_WEIGHTS,
  canonicalize,
  loadProjectData,
  parseArgs,
  readJson,
  sha256,
  writeJson
} = require("./core");
const {
  createAssessmentTemplate,
  duplicateAudit,
  graphFingerprint
} = require("./shadow-review");

function blindCandidate(candidate, graph) {
  const audit = duplicateAudit({
    term: candidate.term,
    rationale: "",
    targetNode: null
  }, graph);
  return {
    term: candidate.term,
    independentlyRetrievedMatches: audit.rankedMatches.map(match => ({
      nodeId: match.nodeId,
      title: match.title,
      lexicalScore: match.score,
      exactNameOrAlias: match.exact
    }))
  };
}

function graphDigest(graph) {
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    domains: graph.domains,
    edgeTypes: graph.edgeTypes,
    core: graph.core,
    recommendedLearningPath: graph.recommendedLearningPath,
    nodes: graph.nodes.map(node => ({
      id: node.id,
      title: node.title,
      aliases: node.aliases || [],
      domain: node.domain,
      maturity: node.maturity || "stable",
      summary: node.summary
    })),
    edges: graph.edges.map(edge => canonicalize(edge))
  };
}

function createShadowPacket(proposal, evidence, options = {}) {
  const projectData = options.projectData || loadProjectData();
  const graph = projectData.graph;
  const outputTemplate = createAssessmentTemplate(proposal, evidence, options.reviewerId || "");
  return {
    schemaVersion: 1,
    mode: "blind-independent-review",
    createdAt: options.createdAt || new Date().toISOString(),
    proposalHash: sha256(proposal),
    evidenceHash: evidence.contentHash,
    graphHash: graphFingerprint(graph),
    isolation: {
      proposalDecisionIncluded: false,
      proposalRationaleIncluded: false,
      proposalScoresIncluded: false,
      proposalTargetIncluded: false,
      instruction: "不得读取原 proposal.json。候选术语只表示需要复核，不表示它应新增、合并、补充或拒绝。"
    },
    task: {
      objective: "基于原始视频证据、当前全图摘要和必要的外部一手来源，独立判断每个候选概念。",
      decisionDefinitions: {
        new: "具有独立身份和机制，与全图现有节点不重复，值得生成完整新节点原子包。",
        merge: "与现有节点是同一概念或别名，只建议合并名称。",
        supplement: "现有节点已覆盖概念；视频提供现有原理页尚未覆盖、可迁移到其他软件的新机制或新边界，只进入待写作队列。单一产品的操作案例、按钮、配置或功能展示必须 reject。",
        reject: "只是产品功能、按钮、配置、顺带提及、证据不足或没有地图价值。",
        uncertain: "证据值得讨论但不足以作出稳定决定。"
      },
      rules: [
        "先独立阅读证据，再评估候选；不要根据候选名称猜测视频内容。",
        "merge / supplement 必须填写真实 targetNode 和至少一个有效 evidenceRefs。",
        "supplement 必须填写 supplementCriteria，且 transferableBeyondProduct、notCoveredByExistingNode、mechanismOrBoundary 三项都为 true；只展示某软件如何使用已有概念时必须 reject。",
        "new / uncertain 必须独立填写 nodeScores；不得复制或推测提案分数。",
        "new 必须给出两个相近现有节点、至少两条合法关系、两个视频之外的独立 HTTPS 来源、至少两条断言—来源映射、学习路径位置和完整节点草稿。",
        "外部来源必须实际打开核对；externalSources 应记录标题、URL、权威类型和支持范围。",
        "coreCandidate 只表示本次是否建议把尚非核心的节点晋升为核心；目标已经是核心节点时必须为 false。新节点也可在满足核心门禁时成为候选。graphCentrality 填 0 占位，系统会用真实图指标覆盖。",
        "视频中高频出现、产品首页展示或短期流行不能单独证明核心地位。",
        "只输出符合 outputTemplate 形状的 JSON，不输出 Markdown 或解释性前后缀。"
      ]
    },
    rubrics: {
      levels: {
        0: "没有证据或明确不符合",
        1: "只出现名称或观点，没有形成机制或用途",
        2: "部分解释，但边界、证据或关系不完整",
        3: "解释完整，有明确证据和可用关系",
        4: "完整且有消歧、边界、跨来源印证或显著地图价值"
      },
      nodeWeights: NODE_WEIGHTS,
      newNodeMinimum: 80,
      coreWeights: CORE_WEIGHTS,
      coreMinimum: 85
    },
    candidates: proposal.conceptTrack.candidates.map(candidate => blindCandidate(candidate, graph)),
    evidence: {
      source: evidence.source,
      chapters: evidence.chapters || [],
      transcript: evidence.transcript || [],
      frames: evidence.frames || []
    },
    graphContext: graphDigest(graph),
    outputTemplate
  };
}

function renderPacketPrompt(packet) {
  return [
    "# 独立视频概念复核任务",
    "",
    "你是与提案生成阶段隔离的复核器。不得寻找或读取原提案；任务包有意隐藏了提案决定、理由、目标节点和分数。",
    "",
    "完整任务包如下。严格执行 `task.rules`，最终只返回 `outputTemplate` 对应的 JSON 对象。",
    "",
    "```json",
    JSON.stringify(packet, null, 2),
    "```",
    ""
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.evidence || !args.output) {
    console.error("用法：node tools/video-ingest/create-shadow-packet.js --proposal <proposal.json> --evidence <evidence.json> --output <packet.json> [--reviewer <id>]");
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const packet = createShadowPacket(proposal, evidence, {
    reviewerId: args.reviewer || ""
  });
  const output = path.resolve(args.output);
  writeJson(output, packet);
  const promptFile = output.replace(/\.json$/i, "") + ".prompt.md";
  fs.writeFileSync(promptFile, renderPacketPrompt(packet), "utf8");
  console.log(`✓ 去锚定独立复核任务包已生成：${output}`);
  console.log(`✓ 可直接交给独立模型的提示文件已生成：${promptFile}`);
  console.log(`  隐藏字段：提案决定、理由、分数、目标节点`);
}

if (require.main === module) main();

module.exports = {
  createShadowPacket,
  graphDigest,
  renderPacketPrompt
};
