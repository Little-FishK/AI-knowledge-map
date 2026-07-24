"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  tutorialTotal,
  nodeTotal,
  coreTotal,
  validateProposal,
  sha256
} = require("./video-ingest/core");
const { buildContext } = require("./video-ingest/build-context");
const { createDraft } = require("./video-ingest/create-proposal");

["evidence.schema.json", "proposal.schema.json", "approval.schema.json"].forEach(file => {
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "video-ingest", "schemas", file), "utf8"));
  assert.strictEqual(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
});

function fixtureEvidence(level = "E2") {
  const evidence = {
    schemaVersion: 1,
    source: {
      url: "https://www.youtube.com/watch?v=fixture",
      platform: "Youtube",
      title: "Codex 上下文压缩与 Transformer 教程",
      creator: "Fixture",
      publishedAt: "2026-07-20",
      durationSeconds: 600,
      accessedAt: "2026-07-24"
    },
    chapters: [{ start: 0, end: 300, title: "上下文压缩" }],
    transcript: [
      { start: 0, end: 120, text: "本节在 Codex 中演示上下文压缩，并解释它与上下文窗口的关系。" },
      { start: 120, end: 240, text: "随后检查 Transformer 项目中的结果和失败处理。" }
    ],
    frames: [{ time: 30, file: "fixture_frames/f_00001.jpg", ocr: "Codex compact context" }],
    acquisition: {
      asr: "fixture",
      transcriptComplete: true,
      ocrComplete: true,
      limitations: [],
      evidenceLevelSuggestion: level,
      requiresEditorialReview: true
    }
  };
  evidence.contentHash = sha256(evidence);
  return evidence;
}

function readyProposal(evidence) {
  return {
    schemaVersion: 1,
    status: "ready",
    evidenceHash: evidence.contentHash,
    source: {
      url: evidence.source.url,
      title: evidence.source.title,
      creator: evidence.source.creator
    },
    tutorialTrack: {
      decision: "formal",
      action: "append-resource",
      softwareId: "codex",
      evidenceLevel: "E2",
      standards: {
        accuracy: 2,
        alignment: 2,
        reproducibility: 2,
        traceability: 2,
        safety: 2
      },
      quality: {
        closure: 4,
        transfer: 4,
        completeness: 4,
        structure: 3,
        freshness: 3,
        accessibility: 3
      },
      evidenceRefs: [{ start: 0, end: 240, frame: "fixture_frames/f_00001.jpg" }],
      resourceDraft: {
        title: "Fixture",
        creator: "Fixture",
        url: evidence.source.url,
        publishedAt: "2026-07-20",
        duration: "10:00",
        audience: "测试读者",
        summary: "测试教程总结",
        caution: "测试风险提醒",
        coverage: [
          { title: "测试步骤", steps: ["执行测试"], done: "测试通过" }
        ],
        uniqueTechniques: [
          { title: "测试技巧", scenario: "测试场景", steps: ["执行测试"], result: "测试通过" }
        ]
      }
    },
    conceptTrack: {
      candidates: [
        {
          term: "上下文压缩",
          decision: "supplement",
          targetNode: "context-compaction",
          nodeScores: null,
          coreCandidate: false,
          coreScores: null,
          coreReason: null,
          requiresHumanCoreApproval: false,
          nearestNodes: [],
          proposedEdges: [],
          externalSources: [],
          evidenceRefs: [{ start: 0, end: 120, frame: "fixture_frames/f_00001.jpg" }],
          disqualifiers: []
        },
        {
          term: "新型上下文边界机制",
          decision: "new",
          targetNode: null,
          nodeScores: {
            identity: 4,
            mechanism: 4,
            nonDuplication: 4,
            practicalValue: 4,
            relationshipPotential: 4,
            sourceQuality: 3
          },
          coreCandidate: false,
          coreScores: null,
          coreReason: null,
          requiresHumanCoreApproval: false,
          nearestNodes: ["context-window", "context-compaction"],
          proposedEdges: [
            { from: "new-context-boundary", to: "context-window", type: "constrains" },
            { from: "context-compaction", to: "new-context-boundary", type: "mitigates" }
          ],
          externalSources: [
            { url: "https://example.com/official-a" },
            { url: "https://example.org/standard-b" }
          ],
          evidenceRefs: [{ start: 120, end: 240 }],
          disqualifiers: [],
          proposedNode: {
            id: "new-context-boundary",
            title: "新型上下文边界机制",
            domain: "building",
            summary: "用于测试双轨入库的新节点草稿。"
          }
        }
      ]
    }
  };
}

const evidence = fixtureEvidence();
assert.strictEqual(tutorialTotal({
  closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 4
}), 70);
assert.strictEqual(nodeTotal({
  identity: 4, mechanism: 4, nonDuplication: 4, practicalValue: 4, relationshipPotential: 4, sourceQuality: 4
}), 100);
assert.strictEqual(coreTotal({
  learningGateway: 4, graphCentrality: 4, crossRouteReuse: 4, beginnerNavigation: 4, stability: 4
}), 100);

const context = buildContext(evidence, { softwareId: "codex", limit: 20 });
assert.strictEqual(context.tutorialContext.selectedSoftware.id, "codex");
assert(context.conceptContext.relevantNodes.some(node => node.id === "context-compaction"));
assert(context.conceptContext.relevantNodes.some(node => node.id === "transformer"));

const draft = createDraft(evidence, context);
assert.strictEqual(draft.status, "draft");
assert.strictEqual(draft.tutorialTrack.action, "append-resource");
assert.deepStrictEqual(validateProposal(draft, evidence).errors, []);

const valid = readyProposal(evidence);
assert.deepStrictEqual(validateProposal(valid, evidence, { ready: true }).errors, []);

const weakTutorial = readyProposal(evidence);
weakTutorial.tutorialTrack.evidenceLevel = "E1";
assert(validateProposal(weakTutorial, evidence, { ready: true }).errors.some(error => /E2\/E3/.test(error)));

const weakNode = readyProposal(evidence);
weakNode.conceptTrack.candidates[1].nodeScores.identity = 0;
assert(validateProposal(weakNode, evidence, { ready: true }).errors.some(error => /至少为 80/.test(error)));

const weakCore = readyProposal(evidence);
const coreCandidate = weakCore.conceptTrack.candidates[1];
coreCandidate.coreCandidate = true;
coreCandidate.coreScores = {
  learningGateway: 1,
  graphCentrality: 1,
  crossRouteReuse: 1,
  beginnerNavigation: 1,
  stability: 1
};
coreCandidate.coreReason = "夹具";
coreCandidate.requiresHumanCoreApproval = true;
assert(validateProposal(weakCore, evidence, { ready: true }).errors.some(error => /核心候选总分/.test(error)));

const excludedNode = readyProposal(evidence);
excludedNode.conceptTrack.candidates[1].disqualifiers = ["产品功能"];
assert(validateProposal(excludedNode, evidence, { ready: true }).errors.some(error => /排除项/.test(error)));

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "video-ingest-v01-"));
try {
  const evidenceFile = path.join(temp, "evidence.json");
  const proposalFile = path.join(temp, "proposal.json");
  fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2), "utf8");
  const create = spawnSync(process.execPath, [
    path.join(__dirname, "video-ingest", "create-proposal.js"),
    "--evidence", evidenceFile,
    "--software", "codex",
    "--output", proposalFile
  ], { encoding: "utf8" });
  assert.strictEqual(create.status, 0, create.stderr || create.stdout);
  assert(fs.existsSync(proposalFile));
  assert(fs.existsSync(proposalFile.replace(/\.json$/, ".md")));
  assert(fs.existsSync(proposalFile.replace(/\.json$/, ".context.json")));
  const validate = spawnSync(process.execPath, [
    path.join(__dirname, "video-ingest", "validate-proposal.js"),
    "--evidence", evidenceFile,
    "--proposal", proposalFile
  ], { encoding: "utf8" });
  assert.strictEqual(validate.status, 0, validate.stderr || validate.stdout);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log("✓ 双轨视频入库 v0.1 评分、上下文、草稿与失败夹具全部通过");
