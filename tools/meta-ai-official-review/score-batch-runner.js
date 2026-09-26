"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const POLICY = "meta-ai-official-value-score-v1";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json");

function slug(url) {
  const value = new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return value || "home";
}

function topic(record) {
  const value = `${record.canonicalUrl} ${record.title}`.toLowerCase();
  if (/guardrail|guard-|prompt-guard|protection|approval|sandbox|contain/.test(value)) return "agent-safety";
  if (/replay|audit|resume|goal|side-chat|subagent|multi-agent|agent-loop|orchestration|cron|session-messaging|configuration|context/.test(value)) return "agent-control";
  if (/fine-tun|reinforcement|quantization|customization|distillation/.test(value)) return "model-adaptation";
  if (/executorch|llama-cpp|sglang|spec-decode|vllm|run-inference|deploy|autoscaling|accelerator|cost-projection|cost-comparison|infrastructure-migration|versioning|production-pipeline|self-host/.test(value)) return "inference-deployment";
  if (/developer-use-guide|responsible|acceptable-use|data-commitment|zero-data|output-copyright|geographic-use|license/.test(value)) return "governance";
  if (/sam|segment/.test(value)) return "media-segmentation";
  if (/image|vision|perception|screenshot|chart/.test(value)) return "image-generation-understanding";
  if (/speech|voice|video|audio|transcrib/.test(value)) return "multimodal-audio-video";
  if (/tool|agent|computer-use|coding-agent/.test(value)) return "tools-agents";
  if (/responses|chat-completions|messages|protocol/.test(value)) return "api-protocols";
  if (/structured|token|reasoning|prompt|long-context|streaming/.test(value)) return "model-control";
  if (/validation|evaluation|benchmark/.test(value)) return "model-evaluation";
  if (/error|retry|status|auth|pricing|rate-limit/.test(value)) return "production-operations";
  return "use-case-supplement";
}

function linkedNodes(record) {
  const key = topic(record);
  if (key === "agent-safety") return ["guardrails", "human-in-the-loop", "agent"];
  if (key === "agent-control") return ["agent", "workflow-orchestration", "multi-agent"];
  if (key === "model-adaptation") return ["fine-tuning", "reinforcement-learning", "quantization"];
  if (key === "inference-deployment") return ["deployment", "inference-optimization", "quantization"];
  if (key === "governance") return ["governance", "guardrails", "human-in-the-loop"];
  if (key === "media-segmentation") return ["image-editing", "multimodal"];
  if (key === "image-generation-understanding") return ["multimodal", "diffusion"];
  if (key === "multimodal-audio-video") return ["multimodal", "speech"];
  if (key === "tools-agents") return ["agent", "tool-calling", "agent-frameworks"];
  if (key === "api-protocols") return ["deployment", "agent", "tool-calling"];
  if (key === "model-control") return ["context-window", "structured-output", "prompt-engineering"];
  if (key === "model-evaluation") return ["model-evaluation", "fine-tuning"];
  if (key === "production-operations") return ["deployment", "observability", "agent-identity-access"];
  return ["llm", "agent"];
}

function runScoreBatch(batchNumber, definitions) {
  const suffix = String(batchNumber).padStart(2, "0");
  const batchId = `meta-ai-value-score-batch-${suffix}`;
  const evidencePath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${batchId}-evidence.json`);
  const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${batchId}.json`);
  const dataPath = path.join(PROJECT_ROOT, "data", `library-official-meta-ai-importance-${suffix}.js`);
  const reportPath = path.join(PROJECT_ROOT, "docs", `OFFICIAL_TECHNICAL_META_AI_VALUE_SCORE_BATCH_${suffix}_20260924.md`);
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  const expectedCount = batchNumber === 7 ? 37 : 60;
  if (evidence.records.length !== expectedCount || definitions.length !== expectedCount) throw new Error(`${batchId} must contain ${expectedCount} records and definitions`);

  const results = evidence.records.map((record, index) => {
    const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = definitions[index];
    const total = knowledgeImportance + irreplaceability + durability + applicability;
    const passed = total >= 6 && knowledgeImportance >= 2;
    const supportingBySource = record.section === "Cookbook" || /\/(?:cookbook|case-studies|resources\/(?:blog|videos))\//.test(record.canonicalUrl);
    return {
      sequence:(batchNumber - 1) * 60 + index + 1,
      inventorySequence:(batchNumber - 1) * 60 + index + 1,
      id:`meta-ai-${slug(record.canonicalUrl)}`,
      topic:topic(record), section:record.section,
      title:record.pageTitle || record.title,
      url:record.canonicalUrl,
      description:record.pageDescription || record.description,
      linkedNodes:linkedNodes(record),
      contentVerification:record.contentVerification,
      scores:{policy:POLICY,reviewedAt:REVIEWED_AT,knowledgeImportance,irreplaceability,durability,applicability,total,threshold:6,knowledgeImportanceMinimum:2,passed,rationale},
      finalDecision:passed ? (supportingBySource ? "admitted-supporting" : knowledgeImportance === 3 ? "admitted-core" : "admitted-supporting") : "rejected-low-value-score"
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
    batch:{id:batchId,reviewedAt:REVIEWED_AT,candidateCount:expectedCount,selection:`Meta AI 397 份待审母集按冻结顺序排列的第 ${batchNumber} 批 ${expectedCount} 份资料`,admissionRule:"总分至少 6/10，且知识重要性至少 2/3；Cookbook、Blog、案例与视频默认进入补充层"},
    results,
    summary:{reviewed:expectedCount,retained:admitted.length,removed:results.length - admitted.length}
  };

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
  const byKey = new Map(evidence.records.map((record, index) => [`${record.setId}|${record.canonicalUrl}`, results[index]]));
  for (const record of inventory.records) {
    if (record.scoreBatch === batchId && record.duplicateOf) {
      record.reviewStatus = "ineligible-duplicate-route";
      record.reviewReason = "与 meta-model-api 中的同一官方资料重复；保留首次出现的 canonical URL。";
      for (const key of ["cardId", "linkedNodes", "contentVerification", "valueScore", "scoreBatch", "comparedWith", "uniqueDelta"]) delete record[key];
      continue;
    }
    if (record.duplicateOf) continue;
    const result = byKey.get(`${record.setId}|${record.canonicalUrl}`);
    if (!result) continue;
    record.reviewStatus = result.finalDecision;
    record.reviewReason = result.scores.passed
      ? `价值评分 ${result.scores.total}/10；通过总分与知识重要性双重门槛。`
      : `价值评分 ${result.scores.total}/10（知识重要性 ${result.scores.knowledgeImportance}/3）：${result.scores.rationale}`;
    if (result.scores.passed) record.cardId = result.id;
    else delete record.cardId;
    record.linkedNodes = result.linkedNodes;
    record.contentVerification = result.contentVerification;
    record.valueScore = result.scores;
    record.scoreBatch = batchId;
    if (result.scores.passed) {
      record.comparedWith = result.comparedWith;
      record.uniqueDelta = result.uniqueDelta;
    } else {
      delete record.comparedWith;
      delete record.uniqueDelta;
    }
  }
  inventory.batch.status = batchNumber === 7 ? "completed" : "in-progress";
  inventory.summary.admitted = inventory.records.filter(record => String(record.reviewStatus).startsWith("admitted-")).length;
  inventory.summary.rejectedAfterContentReview = inventory.records.filter(record => record.reviewStatus === "rejected-low-value-score").length;
  inventory.summary.pendingContentReview = inventory.records.filter(record => record.reviewStatus === "pending-importance-review").length;

  const data = `/* Generated from ${batchId}.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  const rows=${JSON.stringify(admitted)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"meta-ai",title:row.title,publisher:"Meta",collection:"Meta AI 官方技术资料",contentKind:row.section==="Cookbook"?"Cookbook 补充资料":"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.url,accessedAt:"${REVIEWED_AT}",summary:row.description,knowledgeDelta:row.scores.rationale,brandEvidenceDelta:row.uniqueDelta,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Meta 的实现与声明","预览产品、价格和接口版本使用前应复核"],tags:["meta-ai","官方技术资料",row.topic],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"价值评分通过",reviewPolicy:"${POLICY}",reviewedAt:"${REVIEWED_AT}",reviewBatch:"${batchId}",reviewDecision:row.finalDecision,contributionType:row.finalDecision.replace("admitted-",""),contentTier:row.finalDecision.replace("admitted-",""),topicKey:row.id,currentStatus:"current",selectionReason:row.scores.rationale,valueScore:row.scores,scoreBatch:"${batchId}",comparedWith:row.comparedWith,uniqueDelta:row.uniqueDelta,recheckTriggers:["Meta Model API 结束预览","模型或协议版本变化"]}));\n})();\n`;
  const report = `# Meta AI 官方技术资料价值评分：第 ${batchNumber} 批\n\n日期：${REVIEWED_AT}  \n保留门槛：总分至少 6/10，且知识重要性至少 2/3；Cookbook、Blog、案例与视频通过后默认进入补充层。\n\n| 指标 | 数量 |\n|---|---:|\n| 本批审核 | ${expectedCount} |\n| 保留 | ${admitted.length} |\n| 移除 | ${results.length - admitted.length} |\n| 剩余待审 | ${inventory.summary.pendingContentReview} |\n`;
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  fs.writeFileSync(dataPath, data, "utf8");
  fs.writeFileSync(reportPath, report, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
}

module.exports = { runScoreBatch };
