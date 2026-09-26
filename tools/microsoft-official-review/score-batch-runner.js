"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const POLICY = "microsoft-official-value-score-v1";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "microsoft-prefilter-inventory-20260924.json");

function slug(url) {
  return new URL(url).pathname.replace(/^\/en-us\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
}

function linkedNodes(record) {
  const value = `${record.url} ${record.title}`.toLowerCase();
  if (/evaluation|g-eval|metric/.test(value)) return ["model-evaluation", "llm"];
  if (/red.team/.test(value)) return ["red-teaming", "guardrails", "governance"];
  if (/prompt.shield/.test(value)) return ["prompt-injection", "guardrails", "governance"];
  if (/content-filter|harm-categor|safety-polic/.test(value)) return ["guardrails", "governance"];
  if (/groundedness/.test(value)) return ["rag", "hallucination"];
  if (/guardrail|task.adherence/.test(value)) return ["guardrails", "governance", "agent"];
  if (/observability|monitoring|tracing|trace-data|agent-insights|cluster-analysis/.test(value)) return ["observability", "deployment"];
  if (/memory|state-store/.test(value)) return ["agent-memory", "agent"];
  if (/interpretability/.test(value)) return ["interpretability", "supervised-learning"];
  if (/hyperparameter/.test(value)) return ["supervised-learning", "regularization"];
  if (/prompt-engineering|system-message|prompt-transformation/.test(value)) return ["prompt-engineering", "system-prompt"];
  if (/fine-tuning/.test(value)) return ["fine-tuning", "model-evaluation"];
  if (/(speech|voice|pronunciation).*(privacy|security)|(?:privacy|security).*(speech|voice)/.test(value)) return ["speech", "privacy", "governance"];
  if (/speech|voice|pronunciation/.test(value)) return ["speech", "multimodal"];
  if (/privacy|personal-information|sensitive-content/.test(value)) return ["privacy", "governance"];
  if (/provenance|copyright|protected-material/.test(value)) return ["content-detection", "governance"];
  if (/content-understanding|document-intelligence/.test(value)) return ["multimodal", "structured-output", "rag"];
  if (/conversational-language|named-entity|text-classification|entity-resolution/.test(value)) return ["supervised-learning", "embedding"];
  if (/health|fhir|assertion-detection/.test(value)) return ["supervised-learning", "privacy"];
  if (/translator|translation|bleu|parallel-document|sentence-alignment/.test(value)) return ["transformer", "supervised-learning"];
  if (/onnx|threading/.test(value)) return ["deployment", "inference-optimization"];
  if (/semantic-kernel|plugin/.test(value)) return ["tool-calling", "agent-frameworks"];
  if (/forecast|time.series|automl/.test(value)) return ["supervised-learning", "rnn"];
  if (/causal|counterfactual/.test(value)) return ["interpretability", "supervised-learning"];
  if (/fairness|responsible-ai/.test(value)) return ["governance", "bias-fairness", "interpretability"];
  if (/rag|retriev|knowledge-source|knowledge-base|hybrid|bm25|ranking|analyzer|scoring-profile/.test(value)) return ["rag", "embedding", "vector-db"];
  if (record.family === "azure-ai-search") return ["retrieval", "rag", "vector-db"];
  if (/security|safety|overreliance|human-in-the-loop/.test(value)) return ["governance", "human-in-the-loop", "agent"];
  if (/mcp|tool/.test(value)) return ["tool-calling", "agent"];
  if (/workflow|orchestration|checkpoint|handoff|group-chat|magentic/.test(value)) return ["workflow-orchestration", "multi-agent"];
  if (/gateway|llmops/.test(value)) return ["deployment", "observability"];
  if (/a2a|openai-compatible|responses-endpoint|self-host/.test(value)) return ["deployment", "agent-frameworks"];
  return ["agent", "agent-frameworks"];
}

function runScoreBatch({ batchNumber, definitions, candidateCount = 60 }) {
  const suffix = `0${batchNumber}`;
  const batchId = `microsoft-value-score-batch-${suffix}`;
  const evidencePath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${batchId}-evidence.json`);
  const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${batchId}.json`);
  const dataPath = path.join(PROJECT_ROOT, "data", `library-official-microsoft-importance-${suffix}.js`);
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  if (evidence.records.length !== candidateCount || definitions.length !== candidateCount) {
    throw new Error(`${batchId} must contain exactly ${candidateCount} records and definitions`);
  }

  const results = evidence.records.map((record, index) => {
    const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = definitions[index];
    const total = knowledgeImportance + irreplaceability + durability + applicability;
    const passed = total >= 6 && knowledgeImportance >= 2;
    return {
      sequence:index + 1,
      inventorySequence:record.sequence,
      id:`microsoft-${slug(record.url)}`,
      family:record.family,
      title:record.title,
      url:record.url,
      description:record.description,
      lastmod:record.lastmod,
      linkedNodes:linkedNodes(record),
      contentVerification:record.contentVerification,
      scores:{policy:POLICY,reviewedAt:REVIEWED_AT,knowledgeImportance,irreplaceability,durability,applicability,total,threshold:6,knowledgeImportanceMinimum:2,passed,rationale},
      finalDecision:passed ? (knowledgeImportance === 3 ? "admitted-core" : "admitted-supporting") : "rejected-low-value-score"
    };
  });

  const payload = {
    policy:POLICY,
    batch:{id:batchId,reviewedAt:REVIEWED_AT,candidateCount,selection:`Microsoft 405 份待审母集按冻结顺序排列的第 ${batchNumber} 批 ${candidateCount} 份资料`,admissionRule:"总分至少 6/10，且知识重要性至少 2/3"},
    results,
    summary:{reviewed:candidateCount,retained:results.filter(result => result.scores.passed).length,removed:results.filter(result => !result.scores.passed).length}
  };

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
  const byUrl = new Map(results.map(result => [result.url, result]));
  for (const record of inventory.records) {
    const result = byUrl.get(record.url);
    if (!result) continue;
    record.status = result.finalDecision;
    record.reason = result.scores.passed
      ? `价值评分 ${result.scores.total}/10；通过总分与知识重要性双重门槛。`
      : `价值评分 ${result.scores.total}/10（知识重要性 ${result.scores.knowledgeImportance}/3）：${result.scores.rationale}`;
    record.id = result.id;
    record.title = result.title;
    record.description = result.description;
    record.linkedNodes = result.linkedNodes;
    record.contentVerification = result.contentVerification;
    record.valueScore = result.scores;
    record.scoreBatch = batchId;
  }
  inventory.summary.pendingImportanceReview = inventory.records.filter(record => record.status === "pending-importance-review").length;
  inventory.summary.valueScoreAdmitted = inventory.records.filter(record => String(record.status).startsWith("admitted-")).length;
  inventory.summary.valueScoreRejected = inventory.records.filter(record => record.status === "rejected-low-value-score").length;
  inventory.summary.byStatus = inventory.records.reduce((counts, record) => {
    counts[record.status] = (counts[record.status] || 0) + 1;
    return counts;
  }, {});
  inventory.valueReview = {
    policy:POLICY,
    reviewedAt:REVIEWED_AT,
    status:inventory.summary.pendingImportanceReview === 0 ? "complete" : "in-progress",
    reviewed:inventory.summary.valueScoreAdmitted + inventory.summary.valueScoreRejected,
    admitted:inventory.summary.valueScoreAdmitted,
    rejected:inventory.summary.valueScoreRejected,
    remaining:inventory.summary.pendingImportanceReview
  };

  const rows = results.filter(result => result.scores.passed);
  const data = `/* Generated from ${batchId}.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"microsoft",title:row.title,publisher:"Microsoft",collection:"Microsoft 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.url,accessedAt:"${REVIEWED_AT}",summary:row.description,knowledgeDelta:row.scores.rationale,brandEvidenceDelta:row.scores.rationale,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Microsoft 的实现与声明","预览功能和产品生命周期使用前应复核"],tags:["microsoft","官方技术资料",row.family],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"价值评分通过",reviewPolicy:"${POLICY}",reviewedAt:"${REVIEWED_AT}",reviewBatch:"${batchId}",reviewDecision:row.finalDecision,contributionType:row.finalDecision.replace("admitted-",""),topicKey:row.id,currentStatus:"current",selectionReason:row.scores.rationale,valueScore:row.scores,scoreBatch:"${batchId}",recheckTriggers:[]}));\n})();\n`;

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  fs.writeFileSync(dataPath, data, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
  return payload;
}

module.exports = { runScoreBatch };
