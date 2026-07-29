"use strict";

const fs = require("fs");
const path = require("path");
const {
  loadProjectData,
  parseArgs,
  readJson,
  sha256,
  writeJson
} = require("./core");
const { reviewProposal } = require("./shadow-review");

function createContentPacket(proposal, evidence, assessment, term, options = {}) {
  const projectData = options.projectData || loadProjectData();
  const review = reviewProposal(proposal, evidence, assessment, {
    projectData,
    generatedAt: options.generatedAt
  });
  const result = review.candidates.find(item => item.term === term);
  const candidate = assessment.candidates.find(item => item.term === term);
  if (!result || !candidate) throw new Error(`找不到候选：${term}`);
  if (!result.shadowEligibility.newNode) throw new Error(`候选「${term}」未通过新节点影子门禁`);
  const relatedIds = new Set([
    ...(candidate.nearestNodes || []),
    ...(candidate.proposedEdges || []).flatMap(edge => [edge.from, edge.to])
  ]);
  relatedIds.delete(candidate.proposedNode.id);
  const relatedNodes = projectData.graph.nodes
    .filter(node => relatedIds.has(node.id))
    .map(node => ({
      id: node.id,
      title: node.title,
      aliases: node.aliases || [],
      summary: node.summary,
      domain: node.domain
    }));
  return {
    schemaVersion: 1,
    mode: "node-content-writing-packet",
    generatedAt: options.generatedAt || new Date().toISOString(),
    bindings: {
      proposalHash: sha256(proposal),
      evidenceHash: evidence.contentHash,
      assessmentHash: sha256(assessment),
      graphHash: review.graphHash
    },
    task: {
      objective: "为已通过双阶段影子门禁的新节点撰写地图详情正文；理解原理页交给第二阶段隔离状态机。",
      rules: [
        "只使用 assessment 中已通过的节点身份、关系、断言和来源，不擅自扩大概念边界。",
        "详情正文按是什么→机制→约束/影响→怎么应对组织，并包含至少一个可验证案例。",
        "节点详情来源至少两个，优先一手或权威来源。",
        "正文原创表达；不得复制视频字幕或外部来源的大段文字。",
        "只返回 outputTemplate 形状的 JSON，不返回Markdown前后缀。"
      ],
      automaticGates: ["节点结构", "关系", "学习路径", "布局", "哈希绑定"],
      formalWrite: false
    },
    candidate,
    relatedNodes,
    evidence: {
      source: evidence.source,
      transcript: evidence.transcript || [],
      frames: evidence.frames || []
    },
    outputTemplate: {
      schemaVersion: 1,
      candidateTerm: term,
      proposalHash: sha256(proposal),
      evidenceHash: evidence.contentHash,
      assessmentHash: sha256(assessment),
      createdAt: new Date().toISOString().slice(0, 10),
      node: {
        aliases: [],
        maturity: "stable",
        heat: 0.5,
        body: "",
        cases: [],
        sources: []
      },
    },
    stage2Material: {
      objective: "为新节点生成独立理解原理页，随后由全新审计任务检查。",
      candidateTerm: term,
      proposedNode: candidate.proposedNode,
      proposedEdges: candidate.proposedEdges,
      proposedLearningPath: candidate.proposedLearningPath,
      claims: candidate.claims || [],
      externalSources: candidate.externalSources || [],
      relatedNodes,
      evidence: {
        source: evidence.source,
        transcript: evidence.transcript || [],
        frames: evidence.frames || []
      },
      bindings: {
        proposalHash: sha256(proposal),
        evidenceHash: evidence.contentHash,
        assessmentHash: sha256(assessment),
        graphHash: review.graphHash
      }
    }
  };
}

function renderPrompt(packet) {
  return [
    "# 新节点地图详情写作任务",
    "",
    "这是已通过双阶段影子复核的新节点详情任务。严格遵守 `task.rules`，只返回填好的 `outputTemplate` JSON。理解原理页由第二阶段状态机另行生成。",
    "",
    "```json",
    JSON.stringify(packet, null, 2),
    "```",
    ""
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.proposal || !args.evidence || !args.assessment || !args.term || !args.output) {
    console.error("用法：node tools/video-ingest/create-node-content-packet.js --proposal <proposal.json> --evidence <evidence.json> --assessment <assessment.json> --term <候选术语> --output <packet.json>");
    process.exit(2);
  }
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const assessment = readJson(path.resolve(args.assessment));
  const packet = createContentPacket(proposal, evidence, assessment, args.term);
  const output = path.resolve(args.output);
  writeJson(output, packet);
  const prompt = output.replace(/\.json$/i, "") + ".prompt.md";
  fs.writeFileSync(prompt, renderPrompt(packet), "utf8");
  console.log(`✓ v0.4 模型中立内容写作包已生成：${output}`);
  console.log(`✓ 写作提示已生成：${prompt}`);
  console.log("  正式写入：false");
}

if (require.main === module) main();

module.exports = { createContentPacket, renderPrompt };
