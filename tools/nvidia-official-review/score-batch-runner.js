"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-25";
const POLICY = "nvidia-official-value-score-v1";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "nvidia-learning-prefilter-20260924.json");

function slug(url) {
  return new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
}

function topic(record) {
  const value = `${record.family} ${record.title} ${record.url}`.toLowerCase();
  if (record.family === "cuda-programming") return "gpu-computing";
  if (record.family === "cuvs") return "vector-retrieval";
  if (/agent|session|thunder|trace/.test(value)) return "agentic-serving";
  if (record.family === "nemo-curator" || record.family === "nemo-data-designer") return "data-curation";
  if (record.family === "nemo-evaluator") return "evaluation";
  if (record.family === "nemo-gym") return "evaluation";
  if (record.family === "skill-evaluator") return "evaluation";
  if (record.family === "nemo-retriever") return "vector-retrieval";
  if (record.family === "nemo-rl") return "model-training";
  if (record.family === "openshell" || record.family === "skills") return "agent-safety";
  if (record.family === "riva") return "multimodal-serving";
  if (record.family === "nemo-guardrails") return "agent-safety";
  if (record.family === "nemo-framework") return "model-training";
  if (record.family === "nemo-automodel" || /reinforcement-learning/.test(value)) return "model-training";
  if (/diffusion|image-to|text-to|audio|video/.test(value)) return "multimodal-serving";
  if (/observability|metric/.test(value)) return "observability";
  if (/fault|cancel|migration|rejection/.test(value)) return "reliability";
  if (/benchmark|simulate|latency/.test(value)) return "evaluation";
  return "inference-serving";
}

function linkedNodes(record) {
  const key = topic(record);
  if (key === "gpu-computing") return ["inference-optimization", "deployment", "distributed-training"];
  if (key === "vector-retrieval") return ["rag", "embedding", "inference-optimization"];
  if (key === "agentic-serving") return ["agent", "tool-calling", "inference-optimization"];
  if (key === "model-training") return ["fine-tuning", "distributed-training", "pretraining"];
  if (key === "data-curation") return ["pretraining", "model-evaluation", "multimodal"];
  if (key === "agent-safety") return ["guardrails", "observability", "model-evaluation"];
  if (key === "multimodal-serving") return ["multimodal", "inference-optimization", "deployment"];
  if (key === "observability") return ["observability", "deployment", "model-evaluation"];
  if (key === "reliability") return ["deployment", "observability", "inference-optimization"];
  if (key === "evaluation") return ["model-evaluation", "inference-optimization", "deployment"];
  return ["deployment", "inference-optimization", "observability"];
}

function runScoreBatch(batchNumber, definitions) {
  const suffix = String(batchNumber).padStart(2, "0");
  const batchId = `nvidia-value-score-batch-${suffix}`;
  const evidence = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "proposals", "official-technical", `${batchId}-evidence.json`), "utf8"));
  const expectedCount = batchNumber === 7 ? 40 : 60;
  if (evidence.records.length !== expectedCount || definitions.length !== expectedCount) throw new Error(`${batchId} must contain ${expectedCount} records and definitions`);

  const results = evidence.records.map((record, index) => {
    const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = definitions[index];
    const total = knowledgeImportance + irreplaceability + durability + applicability;
    const passed = total >= 6 && knowledgeImportance >= 2;
    const sourceSupplement = /\/(?:digest|recipes-e2e-examples|dev-notes|resources|blogs)\//.test(record.url);
    const title = record.contentVerification.httpStatus === 200 && !/page not found/i.test(record.pageTitle) ? record.pageTitle : record.title;
    return {
      sequence:(batchNumber - 1) * 60 + index + 1,
      inventorySequence:record.sequence,
      id:`nvidia-${slug(record.url)}`,
      family:record.family,
      familyTitle:record.familyTitle,
      topic:topic(record),
      title,
      url:record.url,
      description:record.pageDescription || record.reason || rationale,
      linkedNodes:linkedNodes(record),
      contentVerification:record.contentVerification,
      scores:{policy:POLICY,reviewedAt:REVIEWED_AT,knowledgeImportance,irreplaceability,durability,applicability,total,threshold:6,knowledgeImportanceMinimum:2,passed,rationale},
      finalDecision:passed ? (sourceSupplement ? "admitted-supporting" : knowledgeImportance === 3 ? "admitted-core" : "admitted-supporting") : "rejected-low-value-score"
    };
  });

  const admitted = results.filter(result => result.scores.passed);
  for (const result of admitted) {
    const peers = admitted.filter(peer => peer.topic === result.topic && peer.id !== result.id).slice(0, 2);
    result.comparedWith = peers.map(peer => peer.id);
    result.uniqueDelta = peers.length
      ? `相较于${peers.map(peer => `《${peer.title}》`).join("、")}，本资料的独立增量是：${result.scores.rationale}`
      : `本批同主题没有可直接替代资料；独立增量是：${result.scores.rationale}`;
  }

  const payload = {
    policy:POLICY,
    batch:{id:batchId,reviewedAt:REVIEWED_AT,candidateCount:expectedCount,selection:`NVIDIA 400 份待审母集按冻结顺序排列的第 ${batchNumber} 批 ${expectedCount} 份资料`,admissionRule:"总分至少 6/10，且知识重要性至少 2/3；Digest/Blog 默认进入补充层"},
    results,
    summary:{reviewed:expectedCount,retained:admitted.length,removed:results.length - admitted.length}
  };

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
  const bySequence = new Map(results.map(result => [result.inventorySequence, result]));
  for (const record of inventory.records) {
    const result = bySequence.get(record.sequence);
    if (!result) continue;
    record.status = result.finalDecision;
    record.reason = result.scores.passed
      ? `价值评分 ${result.scores.total}/10；通过总分与知识重要性双重门槛。`
      : `价值评分 ${result.scores.total}/10（知识重要性 ${result.scores.knowledgeImportance}/3）：${result.scores.rationale}`;
    record.linkedNodes = result.linkedNodes;
    record.contentVerification = result.contentVerification;
    record.valueScore = result.scores;
    record.scoreBatch = batchId;
    if (result.scores.passed) {
      record.cardId = result.id;
      record.comparedWith = result.comparedWith;
      record.uniqueDelta = result.uniqueDelta;
    } else {
      delete record.cardId;
      delete record.comparedWith;
      delete record.uniqueDelta;
    }
  }
  inventory.summary.admitted = inventory.records.filter(record => String(record.status).startsWith("admitted-")).length;
  inventory.summary.rejectedAfterContentReview = inventory.records.filter(record => record.status === "rejected-low-value-score").length;
  inventory.summary.pendingImportanceReview = inventory.records.filter(record => record.status === "pending-importance-review").length;
  inventory.summary.valueScoringStatus = batchNumber === 7 ? "completed" : "in-progress";
  inventory.summary.byStatus = inventory.records.reduce((counts, record) => {
    counts[record.status] = (counts[record.status] || 0) + 1;
    return counts;
  }, {});

  const prefix = batchNumber === 1 ? '  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="nvidia"));\n' : "";
  const data = `/* Generated from ${batchId}.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n${prefix}  const rows=${JSON.stringify(admitted)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"nvidia",title:row.title,publisher:"NVIDIA",collection:"NVIDIA 官方技术资料",contentKind:"技术文档",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.url,accessedAt:"${REVIEWED_AT}",summary:row.description,knowledgeDelta:row.scores.rationale,brandEvidenceDelta:row.uniqueDelta,evidenceUse:"用于理解 GPU 计算、训练、检索、推理服务、可靠性或部署决策。",limitations:["只直接证明 NVIDIA 技术栈的实现与声明","版本化接口和实验能力使用前应复核"],tags:["nvidia","官方技术资料",row.topic],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"价值评分通过",reviewPolicy:"${POLICY}",reviewedAt:"${REVIEWED_AT}",reviewBatch:"${batchId}",reviewDecision:row.finalDecision,contributionType:row.finalDecision.replace("admitted-",""),contentTier:row.finalDecision.replace("admitted-",""),topicKey:row.id,currentStatus:"current",selectionReason:row.scores.rationale,valueScore:row.scores,scoreBatch:"${batchId}",comparedWith:row.comparedWith,uniqueDelta:row.uniqueDelta,recheckTriggers:["NVIDIA 文档版本或默认架构变化"]}));\n})();\n`;
  const report = `# NVIDIA 官方技术资料价值评分：第 ${batchNumber} 批\n\n日期：${REVIEWED_AT}  \n保留门槛：总分至少 6/10，且知识重要性至少 2/3。\n\n| 指标 | 数量 |\n|---|---:|\n| 本批审核 | ${expectedCount} |\n| 保留 | ${admitted.length} |\n| 移除 | ${results.length - admitted.length} |\n| 剩余待审 | ${inventory.summary.pendingImportanceReview} |\n`;

  fs.writeFileSync(path.join(PROJECT_ROOT, "proposals", "official-technical", `${batchId}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(PROJECT_ROOT, "data", `library-official-nvidia-importance-${suffix}.js`), data, "utf8");
  fs.writeFileSync(path.join(PROJECT_ROOT, "docs", `OFFICIAL_TECHNICAL_NVIDIA_VALUE_SCORE_BATCH_${suffix}_20260925.md`), report, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
}

module.exports = { runScoreBatch };
