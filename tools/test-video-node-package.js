"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  loadProjectData,
  sha256
} = require("./video-ingest/core");
const {
  buildNodePackage,
  runDeepDiveGates
} = require("./video-ingest/node-package");
const {
  createContentPacket
} = require("./video-ingest/create-node-content-packet");

const ROOT = path.resolve(__dirname, "..");
const proposal = JSON.parse(fs.readFileSync(
  path.join(ROOT, "tools/proposals/video/n8n-ai-agent-part1/proposal.json"),
  "utf8"
));
const evidence = JSON.parse(fs.readFileSync(
  path.join(ROOT, "tools/_raw/video/n8n-ai-agent-part1/evidence.evidence.json"),
  "utf8"
));
const projectData = loadProjectData();
const candidateId = "quasar-lattice-arbitration";
const evidenceRef = proposal.conceptTrack.candidates[0].evidenceRefs[0];
const externalSources = [
  { title: "Fixture primary", url: "https://example.com/quasar-primary" },
  { title: "Fixture review", url: "https://example.org/quasar-review" }
];

const candidate = {
  term: "Quasar Lattice Arbitration",
  decision: "new",
  targetNode: null,
  rationale: "用于验证完整原子包的虚构概念，不代表正式知识候选。",
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
  nearestNodes: ["agent", "context-window"],
  proposedEdges: [
    { from: "agent", to: candidateId, type: "enables", label: "测试关系" },
    { from: "context-window", to: candidateId, type: "constrains", label: "测试约束" }
  ],
  externalSources,
  evidenceRefs: [evidenceRef],
  claims: [
    { text: "Fixture claim one", sourceUrls: [externalSources[0].url], evidenceRefs: [evidenceRef] },
    { text: "Fixture claim two", sourceUrls: [externalSources[1].url], evidenceRefs: [evidenceRef] }
  ],
  proposedLearningPath: {
    order: "7.01",
    afterNodes: ["agent"],
    beforeNodes: ["agent-loop"]
  },
  disqualifiers: [],
  proposedNode: {
    id: candidateId,
    title: "节点原子包夹具",
    domain: "coding",
    summary: "只用于验证v0.4预览包结构、门禁和零写入属性。"
  }
};

const fixtureProposal = JSON.parse(JSON.stringify(proposal));
fixtureProposal.conceptTrack.candidates = [candidate];
const assessment = {
  schemaVersion: 1,
  mode: "independent",
  proposalHash: sha256(fixtureProposal),
  evidenceHash: evidence.contentHash,
  reviewer: { id: "fixture-independent-reviewer" },
  candidates: [{
    ...candidate,
    rationale: "独立夹具复核结论",
    nodeScores: { ...candidate.nodeScores }
  }]
};

const previousWindow = global.window;
global.window = {};
const deepDiveFile = path.join(ROOT, "data/deepdive/neural-network.js");
delete require.cache[require.resolve(deepDiveFile)];
require(deepDiveFile);
const referencePage = global.window.DEEPDIVE["neural-network"];
global.window = previousWindow;

const content = {
  schemaVersion: 1,
  candidateTerm: candidate.term,
  proposalHash: sha256(fixtureProposal),
  evidenceHash: evidence.contentHash,
  assessmentHash: sha256(assessment),
  createdAt: "2026-07-24",
  node: {
    aliases: ["Atomic package fixture"],
    maturity: "stable",
    heat: 0.2,
    body: "这是用于验证原子包的正文。它依赖[[agent]]和[[context-window]]，不会进入正式地图。",
    cases: [{
      title: "预览验证",
      text: "确认节点、关系、路径、原理页和布局只能作为一个整体通过。"
    }],
    sources: externalSources.map(source => ({
      type: "url",
      title: source.title,
      ref: source.url
    }))
  },
  deepDive: {
    ...referencePage,
    title: candidate.proposedNode.title
  }
};

const beforeGraphHash = sha256(projectData.graph);
const writingPacket = createContentPacket(
  fixtureProposal,
  evidence,
  assessment,
  candidate.term,
  { projectData, generatedAt: "2026-07-24T00:00:00.000Z" }
);
assert.strictEqual(writingPacket.mode, "node-content-writing-packet");
assert.strictEqual(writingPacket.task.formalWrite, false);
assert.strictEqual(writingPacket.outputTemplate.deepDive.title, candidate.proposedNode.title);
assert.strictEqual(writingPacket.bindings.assessmentHash, sha256(assessment));

const pkg = buildNodePackage(fixtureProposal, evidence, assessment, content, {
  projectData,
  generatedAt: "2026-07-24T00:00:00.000Z"
});
assert.deepStrictEqual(pkg.validation.structuralErrors, []);
assert.strictEqual(pkg.shadowEligibility.newNode, true);
assert.strictEqual(pkg.shadowEligibility.formalWrite, false);
assert(pkg.layout.position);
assert.strictEqual(pkg.layout.report.sameDomainOverlaps, 0);
assert.strictEqual(pkg.layout.report.occlusionViolations, 0);

const gates = runDeepDiveGates(pkg);
assert.strictEqual(gates.l1, "passed", JSON.stringify(gates, null, 2));
assert.strictEqual(gates.l2, "passed", JSON.stringify(gates, null, 2));
assert.strictEqual(gates.l3, "passed", JSON.stringify(gates, null, 2));
assert.strictEqual(gates.passed, true);
assert.strictEqual(sha256(loadProjectData().graph), beforeGraphHash, "v0.4 预览不得修改正式图谱");

const badContent = JSON.parse(JSON.stringify(content));
badContent.assessmentHash = "sha256:" + "0".repeat(64);
assert.throws(
  () => buildNodePackage(fixtureProposal, evidence, assessment, badContent, { projectData }),
  /assessmentHash 不匹配/
);

console.log("✓ v0.4 新节点原子包：哈希绑定、结构、布局、L1–L3 与零正式写入测试通过");
