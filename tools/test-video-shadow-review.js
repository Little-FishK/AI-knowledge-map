"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  loadProjectData,
  sha256
} = require("./video-ingest/core");
const {
  createAssessmentTemplate,
  duplicateAudit,
  graphFingerprint,
  graphMetrics,
  reviewProposal,
  validateAssessment
} = require("./video-ingest/shadow-review");
const {
  createShadowPacket
} = require("./video-ingest/create-shadow-packet");
const {
  parseModelJson
} = require("./video-ingest/import-shadow-assessment");
const {
  reviewBatch
} = require("./video-ingest/review-shadow-batch");

const ROOT = path.resolve(__dirname, "..");
const proposalFile = path.join(ROOT, "tools/proposals/video/n8n-ai-agent-part1/proposal.json");
const evidenceFile = path.join(ROOT, "tools/_raw/video/n8n-ai-agent-part1/evidence.evidence.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function independentAssessment(proposal, evidence, decisions) {
  return {
    schemaVersion: 1,
    mode: "independent",
    proposalHash: sha256(proposal),
    evidenceHash: evidence.contentHash,
    reviewer: { id: "test-independent-reviewer" },
    candidates: proposal.conceptTrack.candidates.map(candidate => ({
      term: candidate.term,
      decision: decisions[candidate.term] || candidate.decision,
      rationale: "测试中的独立判断",
      targetNode: candidate.targetNode,
      nodeScores: ["new", "uncertain"].includes(decisions[candidate.term] || candidate.decision)
        ? {
          identity: 4,
          mechanism: 4,
          nonDuplication: 4,
          practicalValue: 4,
          relationshipPotential: 4,
          sourceQuality: 4
        }
        : null,
      coreCandidate: false,
      coreScores: null,
      evidenceRefs: candidate.evidenceRefs || [],
      nearestNodes: candidate.nearestNodes || [],
      proposedEdges: candidate.proposedEdges || [],
      externalSources: candidate.externalSources || [],
      claims: candidate.claims || [],
      proposedLearningPath: candidate.proposedLearningPath || null,
      disqualifiers: candidate.disqualifiers || [],
      proposedNode: candidate.proposedNode || null
    }))
  };
}

function run() {
  const proposal = readJson(proposalFile);
  const evidence = readJson(evidenceFile);
  const projectData = loadProjectData();
  const before = graphFingerprint(projectData.graph);

  const withoutAssessment = reviewProposal(proposal, evidence, null, {
    projectData,
    generatedAt: "2026-07-24T00:00:00.000Z"
  });
  assert.strictEqual(withoutAssessment.mode, "shadow");
  assert.strictEqual(withoutAssessment.summary.formalWrites, 0);
  assert(withoutAssessment.candidates.every(item => item.blockers.includes("缺独立复核文件")));

  const assessment = independentAssessment(proposal, evidence, {});
  assert.deepStrictEqual(validateAssessment(assessment, proposal, evidence), []);
  const reviewed = reviewProposal(proposal, evidence, assessment, {
    projectData,
    generatedAt: "2026-07-24T00:00:00.000Z"
  });
  assert.strictEqual(reviewed.summary.agreementCount, proposal.conceptTrack.candidates.length);
  assert.strictEqual(reviewed.summary.autoEligibleNewCount, 0);
  assert.strictEqual(reviewed.summary.formalWrites, 0);
  assert.strictEqual(
    reviewed.candidates.find(item => item.term === "AI Agent").duplicateAudit.verdict,
    "existing"
  );

  const conflictedAssessment = independentAssessment(proposal, evidence, { "AI Agent": "reject" });
  const conflict = reviewProposal(proposal, evidence, conflictedAssessment, {
    projectData,
    generatedAt: "2026-07-24T00:00:00.000Z"
  });
  const agentConflict = conflict.candidates.find(item => item.term === "AI Agent");
  assert.strictEqual(agentConflict.decisionsAgree, false);
  assert(agentConflict.blockers.includes("提案与独立复核结论不一致"));

  const coreProposal = JSON.parse(JSON.stringify(proposal));
  const coreAgent = coreProposal.conceptTrack.candidates.find(item => item.term === "AI Agent");
  coreAgent.coreCandidate = true;
  coreAgent.coreScores = {
    learningGateway: 4,
    graphCentrality: 4,
    crossRouteReuse: 4,
    beginnerNavigation: 4,
    stability: 4
  };
  coreAgent.coreReason = "测试真实图中心性覆盖自报分数";
  coreAgent.requiresHumanCoreApproval = false;
  const coreAssessment = independentAssessment(coreProposal, evidence, {});
  const independentCoreAgent = coreAssessment.candidates.find(item => item.term === "AI Agent");
  independentCoreAgent.coreCandidate = true;
  independentCoreAgent.coreScores = {
    learningGateway: 4,
    graphCentrality: 0,
    crossRouteReuse: 4,
    beginnerNavigation: 4,
    stability: 4
  };
  const coreReview = reviewProposal(coreProposal, evidence, coreAssessment, {
    projectData,
    generatedAt: "2026-07-24T00:00:00.000Z"
  });
  const auditedCore = coreReview.candidates.find(item => item.term === "AI Agent");
  assert.strictEqual(
    auditedCore.independentScores.coreScores.graphCentrality,
    auditedCore.graphMetrics.graphCentralityLevel,
    "核心中心性必须由真实图指标覆盖"
  );
  assert(!coreReview.validation.proposalErrors.some(error => /人工批准/.test(error)));

  const newProposal = JSON.parse(JSON.stringify(proposal));
  const newId = "quasar-lattice-arbitration";
  const videoRef = proposal.conceptTrack.candidates[0].evidenceRefs[0];
  const sources = [
    { title: "Primary source", url: "https://example.com/quasar-primary" },
    { title: "Independent source", url: "https://example.org/quasar-review" }
  ];
  newProposal.conceptTrack.candidates = [{
    term: "Quasar Lattice Arbitration",
    decision: "new",
    targetNode: null,
    rationale: "A deliberately distinct fixture concept for structural shadow-gate testing.",
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
      { from: "agent", to: newId, type: "enables", label: "测试关系" },
      { from: "context-window", to: newId, type: "constrains", label: "测试约束" }
    ],
    externalSources: sources,
    evidenceRefs: [videoRef],
    claims: [
      {
        text: "Fixture claim one",
        sourceUrls: [sources[0].url],
        evidenceRefs: [videoRef]
      },
      {
        text: "Fixture claim two",
        sourceUrls: [sources[1].url],
        evidenceRefs: [videoRef]
      }
    ],
    proposedLearningPath: {
      order: "7.01",
      afterNodes: ["agent"],
      beforeNodes: ["agent-loop"]
    },
    disqualifiers: [],
    proposedNode: {
      id: newId,
      title: "Quasar Lattice Arbitration",
      domain: "coding",
      summary: "测试影子门禁的虚构概念。"
    }
  }];
  const newAssessment = independentAssessment(newProposal, evidence, {});
  const newReview = reviewProposal(newProposal, evidence, newAssessment, {
    projectData,
    generatedAt: "2026-07-24T00:00:00.000Z"
  });
  assert.deepStrictEqual(newReview.validation.proposalErrors, []);
  assert.deepStrictEqual(newReview.validation.assessmentErrors, []);
  assert.strictEqual(newReview.summary.autoEligibleNewCount, 1);
  assert.strictEqual(newReview.candidates[0].shadowEligibility.formalWrite, false);

  const tampered = JSON.parse(JSON.stringify(newAssessment));
  tampered.proposalHash = "sha256:" + "0".repeat(64);
  assert(validateAssessment(tampered, newProposal, evidence).some(error => /proposalHash/.test(error)));

  const template = createAssessmentTemplate(proposal, evidence, "");
  assert.strictEqual(template.candidates.length, proposal.conceptTrack.candidates.length);
  assert(template.candidates.every(item => item.nodeScores === null && item.evidenceRefs.length === 0));
  assert.strictEqual(duplicateAudit({ term: "AI Agent", rationale: "", targetNode: "agent" }, projectData.graph).verdict, "existing");

  const packet = createShadowPacket(proposal, evidence, {
    projectData,
    reviewerId: "independent-reviewer-a",
    createdAt: "2026-07-24T00:00:00.000Z"
  });
  assert.strictEqual(packet.mode, "blind-independent-review");
  assert.strictEqual(packet.isolation.proposalDecisionIncluded, false);
  assert(packet.candidates.every(item =>
    !Object.prototype.hasOwnProperty.call(item, "decision") &&
    !Object.prototype.hasOwnProperty.call(item, "rationale") &&
    !Object.prototype.hasOwnProperty.call(item, "targetNode") &&
    !Object.prototype.hasOwnProperty.call(item, "nodeScores")
  ));
  assert(!JSON.stringify(packet.candidates).includes(proposal.conceptTrack.candidates[0].rationale));
  assert.strictEqual(packet.outputTemplate.proposalHash, sha256(proposal));
  assert.deepStrictEqual(parseModelJson(JSON.stringify(assessment)), assessment);
  assert.deepStrictEqual(parseModelJson("```json\n" + JSON.stringify(assessment) + "\n```"), assessment);
  assert.throws(() => parseModelJson("说明\n{}"), /不是单一 JSON/);

  const batch = reviewBatch({
    schemaVersion: 1,
    jobs: [{
      id: "n8n-no-assessment",
      proposal: proposalFile,
      evidence: evidenceFile
    }]
  }, {
    base: ROOT,
    projectData,
    generatedAt: "2026-07-24T00:00:00.000Z"
  });
  assert.strictEqual(batch.totals.jobs, 1);
  assert.strictEqual(batch.totals.blocked, 1);
  assert.strictEqual(batch.totals.formalWrites, 0);
  assert.strictEqual(batch.totals.candidateCount, proposal.conceptTrack.candidates.length);

  const metrics = graphMetrics(projectData.graph);
  assert.strictEqual(Object.keys(metrics).length, projectData.graph.nodes.length);
  assert(Number.isInteger(metrics.agent.graphCentralityLevel));
  assert.strictEqual(graphFingerprint(loadProjectData().graph), before, "影子复核不得修改正式图谱");
  console.log("✓ v0.3 影子复核：独立结论、去重、来源、关系、学习路径、图指标与零写入测试通过");
}

run();
