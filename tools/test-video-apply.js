"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  sha256
} = require("./video-ingest/core");
const {
  createApprovalDraft,
  validateApproval,
  proposalHash,
  loadProject,
  renderGeneratedTutorials,
  buildApplyPlan,
  planFingerprint,
  applyPlan,
  rollbackReceipt
} = require("./video-ingest/application");

const ROOT = path.join(__dirname, "..");

function evidenceFixture() {
  const evidence = {
    schemaVersion: 1,
    source: {
      url: "https://www.youtube.com/watch?v=v02fixture",
      platform: "Youtube",
      title: "n8n Agent Memory Fixture",
      creator: "Fixture",
      publishedAt: "2026-07-20",
      durationSeconds: 600,
      accessedAt: "2026-07-24"
    },
    chapters: [],
    transcript: [
      { start: 0, end: 180, text: "在 n8n 建立 AI Agent，并加入会话记忆。" },
      { start: 180, end: 360, text: "用同一个 session ID 验证 Window Buffer Memory。" }
    ],
    frames: [
      { time: 30, file: "fixture_frames/f_00001.jpg", ocr: "n8n AI Agent Memory" }
    ],
    acquisition: {
      asr: "fixture",
      transcriptComplete: true,
      ocrComplete: true,
      limitations: [],
      evidenceLevelSuggestion: "E2",
      requiresEditorialReview: true
    }
  };
  evidence.contentHash = sha256(evidence);
  return evidence;
}

function proposalFixture(evidence) {
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
      action: "create-page",
      softwareId: "n8n",
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
        structure: 4,
        freshness: 3,
        accessibility: 3
      },
      rationale: "完整演示 n8n Agent 与记忆闭环。",
      evidenceRefs: [
        { start: 0, end: 360, frame: "fixture_frames/f_00001.jpg" }
      ],
      resourceDraft: {
        id: "yt-n8n-v02-fixture",
        platform: "youtube",
        title: "n8n Agent Memory Fixture",
        creator: "Fixture",
        url: evidence.source.url,
        publishedAt: "2026-07-20",
        duration: "10:00",
        audience: "测试读者",
        summary: "从空白工作流建立 Agent 与会话记忆。",
        caution: "密钥只保存在凭据系统中。",
        coverage: [
          {
            title: "建立工作流",
            steps: ["添加 Chat Trigger", "连接 Agent 与 Memory"],
            done: "同一会话能引用上文"
          }
        ],
        uniqueTechniques: [
          {
            title: "前后对照",
            scenario: "验证记忆是否生效",
            steps: ["先测试无记忆", "再连接 Memory 重测"],
            result: "通过对照确认状态生效",
            limitation: "仅覆盖窗口记忆"
          }
        ]
      }
    },
    conceptTrack: {
      candidates: [
        {
          term: "Agent Memory",
          decision: "supplement",
          targetNode: "agent-memory",
          rationale: "补充 session ID 的可复现实例。",
          nodeScores: {
            identity: 4,
            mechanism: 4,
            nonDuplication: 0,
            practicalValue: 4,
            relationshipPotential: 4,
            sourceQuality: 4
          },
          coreCandidate: false,
          coreScores: null,
          coreReason: null,
          requiresHumanCoreApproval: false,
          nearestNodes: ["agent", "context-window"],
          proposedEdges: [],
          externalSources: [],
          evidenceRefs: [{ start: 180, end: 360 }],
          disqualifiers: ["与已有节点重复"],
          proposedNode: null
        },
        {
          term: "新型记忆边界",
          decision: "new",
          targetNode: null,
          rationale: "用于验证新节点原子包阻断。",
          nodeScores: {
            identity: 4,
            mechanism: 4,
            nonDuplication: 4,
            practicalValue: 4,
            relationshipPotential: 4,
            sourceQuality: 4
          },
          coreCandidate: false,
          coreScores: null,
          coreReason: null,
          requiresHumanCoreApproval: false,
          nearestNodes: ["agent-memory", "context-window"],
          proposedEdges: [
            { from: "new-memory-boundary", to: "agent-memory", type: "related" },
            { from: "new-memory-boundary", to: "context-window", type: "constrains" }
          ],
          externalSources: [
            { url: "https://example.com/a" },
            { url: "https://example.org/b" }
          ],
          evidenceRefs: [{ start: 180, end: 360 }],
          disqualifiers: [],
          proposedNode: {
            id: "new-memory-boundary",
            title: "新型记忆边界",
            domain: "coding",
            summary: "测试节点。"
          }
        }
      ]
    }
  };
}

function copyFixtureRoot(target) {
  fs.mkdirSync(path.join(target, "data"), { recursive: true });
  fs.mkdirSync(path.join(target, "assets"), { recursive: true });
  [
    "index.html",
    "data/graph.js",
    "data/software.js",
    "data/tutorials.js",
    "data/tutorials-codex-youtube.js",
    "data/tutorials-claude-code.js",
    "data/tutorials-video-generated.js",
    "data/video-concept-supplements.json",
    "assets/app.js"
  ].forEach((relative) => {
    const destination = path.join(target, ...relative.split("/"));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(ROOT, ...relative.split("/")), destination);
  });
  fs.writeFileSync(
    path.join(target, "data", "tutorials-video-generated.js"),
    renderGeneratedTutorials({ schemaVersion: 1, pages: {} }),
    "utf8"
  );
  fs.writeFileSync(
    path.join(target, "data", "video-concept-supplements.json"),
    JSON.stringify({ schemaVersion: 1, items: [] }, null, 2) + "\n",
    "utf8"
  );
}

const evidence = evidenceFixture();
const proposal = proposalFixture(evidence);
const draftApproval = createApprovalDraft(proposal);
assert.strictEqual(draftApproval.status, "draft");
assert.deepStrictEqual(validateApproval(draftApproval, proposal), []);

const staleProposal = JSON.parse(JSON.stringify(proposal));
staleProposal.tutorialTrack.rationale += " changed";
assert(validateApproval(draftApproval, staleProposal).some((error) => /proposalHash/.test(error)));

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "video-apply-v02-"));
try {
  copyFixtureRoot(temp);
  const approval = createApprovalDraft(proposal);
  approval.status = "approved";
  approval.approvedAt = "2026-07-24";
  approval.approvedBy = "fixture-human";
  approval.tutorial.decision = "approve";
  approval.concepts.find((item) => item.term === "Agent Memory").decision = "approve";
  approval.concepts.find((item) => item.term === "新型记忆边界").decision = "reject";
  assert.deepStrictEqual(validateApproval(approval, proposal, { requireApproved: true }), []);

  const beforeTutorials = fs.readFileSync(path.join(temp, "data", "tutorials-video-generated.js"), "utf8");
  const beforeQueue = fs.readFileSync(path.join(temp, "data", "video-concept-supplements.json"), "utf8");
  const plan = buildApplyPlan(proposal, evidence, approval, { root: temp });
  assert.strictEqual(plan.status, "ready", plan.blockers.join("\n"));
  assert.strictEqual(plan.operations.length, 2);
  assert.strictEqual(plan.targets.length, 2);
  const samePlan = buildApplyPlan(proposal, evidence, approval, { root: temp });
  assert.strictEqual(planFingerprint(plan), planFingerprint(samePlan));

  const receipt = applyPlan(plan, { root: temp });
  assert.strictEqual(receipt.status, "applied");
  const applied = loadProject(temp);
  assert(applied.tutorials.items.n8n);
  assert(applied.tutorials.items.n8n.resources.some((item) => item.id === "yt-n8n-v02-fixture"));
  const queue = JSON.parse(fs.readFileSync(path.join(temp, "data", "video-concept-supplements.json"), "utf8"));
  assert.strictEqual(queue.items.length, 1);
  assert.strictEqual(queue.items[0].targetNode, "agent-memory");

  assert.throws(() => applyPlan(plan, { root: temp }), /自预览后已变化/);

  const repeatedPlan = buildApplyPlan(proposal, evidence, approval, { root: temp });
  assert.strictEqual(repeatedPlan.status, "ready");
  assert.strictEqual(repeatedPlan.operations.length, 0);
  assert(repeatedPlan.warnings.some((warning) => /已存在/.test(warning)));

  const rollback = rollbackReceipt(receipt, { root: temp });
  assert.strictEqual(rollback.status, "rolled-back");
  assert.strictEqual(
    fs.readFileSync(path.join(temp, "data", "tutorials-video-generated.js"), "utf8"),
    beforeTutorials
  );
  assert.strictEqual(
    fs.readFileSync(path.join(temp, "data", "video-concept-supplements.json"), "utf8"),
    beforeQueue
  );

  const newNodeApproval = JSON.parse(JSON.stringify(approval));
  newNodeApproval.concepts.find((item) => item.term === "新型记忆边界").decision = "approve";
  const blocked = buildApplyPlan(proposal, evidence, newNodeApproval, { root: temp });
  assert.strictEqual(blocked.status, "blocked");
  assert(blocked.blockers.some((error) => /完整原理页/.test(error)));

  const invalidPlan = buildApplyPlan(proposal, evidence, approval, { root: temp });
  invalidPlan.targets[0].afterContent = "window.TUTORIALS = null;\n";
  invalidPlan.targets[0].afterHash = sha256(invalidPlan.targets[0].afterContent);
  const unhashed = JSON.parse(JSON.stringify(invalidPlan));
  delete unhashed.planHash;
  invalidPlan.planHash = sha256(unhashed);
  assert.throws(() => applyPlan(invalidPlan, { root: temp }), /应用后门禁失败/);
  assert.strictEqual(
    fs.readFileSync(path.join(temp, "data", "tutorials-video-generated.js"), "utf8"),
    beforeTutorials
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log("✓ 视频双轨入库 v0.2 批准、预览、原子应用、幂等与回滚夹具全部通过");
