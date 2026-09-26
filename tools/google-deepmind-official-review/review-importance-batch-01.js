/* Audit Google / Google DeepMind candidates 1-130 with importance as a hard gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-importance-batch-01.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-google-deepmind-importance-01.js");
const inventory = require(inventoryPath);

global.window = { PRO_LIBRARY:{ items:[] } };
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = ""; url.search = "";
  url.pathname = url.pathname.replace(/\.md\.txt$/, "").replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

const eligible = inventory.records.filter(record => !record.duplicateOf);
const selected = eligible.slice(0, 130);
if (selected.length !== 130) throw new Error(`Google batch 01 must contain 130 candidates, got ${selected.length}`);

const coreNumbers = new Set([
  2,3,10,12,13,15,17,19,21,23,24,25,26,27,29,30,31,32,33,34,
  67,68,71,74,75,76,77,78,81,82,83,85,86,87,89,90,92,94,95
]);
const supportingNumbers = new Set([
  14,16,20,28,35,73,80,
  97,98,102,113,115,116,120,121,122,124,127
]);
const transitionNumbers = new Set([70,91,93,103,105,110,128]);
const admittedNumbers = new Set([...coreNumbers, ...supportingNumbers, ...transitionNumbers]);

const navigationNumbers = new Set([1,4,11,18,36,48,66,79,88]);
const exampleOrStudioNumbers = new Set([5,6,7,8,9,22,72,84]);
const legacyDuplicateNumbers = new Set(Array.from({ length:29 }, (_, index) => 37 + index));
const obsoleteModelNumbers = new Set([96,99,100,101,106,108,112,114,117,118]);
const supersededModelNumbers = new Set([104,107,109,111,119,123,125,126,129,130]);

function rejection(record, number) {
  if (navigationNumbers.has(number)) return {
    decision:"rejected-navigation-or-onboarding", currentStatus:"current",
    reason:"页面主要承担首页、快速开始、密钥获取或更新日志入口作用，没有形成独立、耐久的技术结论。"
  };
  if (exampleOrStudioNumbers.has(number)) return {
    decision:"rejected-example-or-product-workflow", currentStatus:"current",
    reason:"内容主要是 AI Studio 操作流程、框架示例或单一应用场景，边际知识贡献不足以单独建卡。"
  };
  if (legacyDuplicateNumbers.has(number)) return {
    decision:"rejected-legacy-or-duplicate-route", currentStatus:"transition",
    reason:"属于旧 Generate Content API 路径，或已被 Interactions API 当前主资料和迁移指南覆盖，不重复建卡。"
  };
  if (number === 69) return {
    decision:"rejected-duplicate-migration-notice", currentStatus:"obsolete",
    reason:"Imagen 关闭与迁移事实已由更具体的模型生命周期资料覆盖，该功能页不再单独保留。"
  };
  if (obsoleteModelNumbers.has(number)) return {
    decision:"rejected-obsolete-or-shut-down", currentStatus:"obsolete",
    reason:"模型已经关闭、明确弃用或存在当前替代版本，不能再作为当前选型依据。"
  };
  if (supersededModelNumbers.has(number)) return {
    decision:"rejected-superseded-model-variant", currentStatus:"obsolete",
    reason:"该模型或预览版本已被同能力方向的更新稳定版本取代，缺少不可替代的独立价值。"
  };
  return {
    decision:"rejected-low-importance", currentStatus:"current",
    reason:"资料有效但主要提供局部操作或品牌功能事实，未达到理解、实现、选型、安全或可靠性的独立重要性门槛。"
  };
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/migrat|deprecat|legacy|shut down/.test(value)) return "迁移与模型生命周期决策";
  if (/safety|feedback|logging|data|ephemeral|key|region|billing/.test(value)) return "安全、数据与服务治理边界";
  if (/agent|computer use|code execution|function call|tool/.test(value)) return "Agent、工具与执行机制";
  if (/live api|translation|session|websocket|audio/.test(value)) return "实时、多模态与会话机制";
  if (/file|document|embedding|grounding|context|search/.test(value)) return "检索、文件与上下文处理";
  if (/model|gemini 3|learnlm|robotics|lyria/.test(value)) return "模型选型与能力边界";
  if (/batch|flex|priority|cache|rate|media resolution/.test(value)) return "成本、吞吐与推理优化";
  if (/structured|text generation|thinking|token|api version/.test(value)) return "API 输出、推理与版本契约";
  return "Gemini API 核心实现机制";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/safety|feedback|logging|data sharing|ephemeral/.test(value)) return ["privacy","guardrails"];
  if (/computer use/.test(value)) return ["computer-use","agent"];
  if (/code execution/.test(value)) return ["code-execution","agent"];
  if (/agent|function call|tool/.test(value)) return ["agent","tool-calling"];
  if (/live api|audio|translation|speech/.test(value)) return ["streaming","multimodal"];
  if (/file|document|embedding|grounding|search/.test(value)) return ["retrieval","rag"];
  if (/context|cache/.test(value)) return ["context-window","prompt-caching"];
  if (/model|gemini|learnlm|robotics|lyria/.test(value)) return ["model-selection","multimodal"];
  if (/structured/.test(value)) return ["structured-output","prompt-engineering"];
  return ["deployment"];
}

function makeId(record) {
  const slug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-7).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `google-deepmind-importance-${slug}`;
}

const baselineByUrl = new Map(window.PRO_LIBRARY.items
  .filter(item => item.sourceClass === "official" && item.sourceSubcategory === "google-deepmind")
  .map(item => [canonicalize(item.url), item]));

const records = selected.map((record, index) => {
  const number = index + 1;
  const accepted = admittedNumbers.has(number);
  const decision = transitionNumbers.has(number) ? "admitted-transition"
    : supportingNumbers.has(number) ? "admitted-supporting" : "admitted-core";
  const result = accepted ? {
    decision,
    currentStatus:transitionNumbers.has(number) ? "transition" : "current",
    reason:transitionNumbers.has(number)
      ? "仍直接影响现有系统迁移、兼容或模型生命周期判断；设置明确复核触发点后保留。"
      : supportingNumbers.has(number)
        ? "补充会影响可用区域、治理、专业模型或实现选择的官方差异，具有独立证据价值。"
        : "直接解释 Gemini API 的核心机制、能力边界或工程决策，具有持续复用价值。"
  } : rejection(record, number);
  const existing = baselineByUrl.get(record.canonicalUrl);
  return {
    sequence:number, id:existing?.id || makeId(record), title:record.title, url:record.url,
    canonicalUrl:record.canonicalUrl, setId:record.setId, section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被本批或后续当前主资料完整替代" : "已有当前主资料、稳定模型或迁移指南覆盖",
    ...result
  };
});

if (new Set(records.map(record => record.canonicalUrl)).size !== 130) throw new Error("Batch contains duplicate canonical URLs");
const admitted = records.filter(record => record.decision.startsWith("admitted-"));
const summary = records.reduce((acc, record) => {
  acc[record.decision] = (acc[record.decision] || 0) + 1;
  return acc;
}, { reviewed:records.length, admitted:admitted.length, rejected:records.length - admitted.length });

const audit = {
  policy:"official-technical-importance-v2", policyVersion:"2.0",
  batch:{ id:"google-deepmind-importance-batch-01", source:"official/google-deepmind", reviewedAt, candidateCount:130,
    selection:"冻结的 257 份官方母集按原始目录顺序取第 1–130 份",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡" },
  records, admittedObjectIds:admitted.map(record => record.id), summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
const js = `/* Generated from google-deepmind-importance-batch-01.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="google-deepmind"));\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"google-deepmind",title:row.title,publisher:"Google",collection:"Google / Google DeepMind 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Google 的实现与声明","预览模型、价格和生命周期使用前应复核"],tags:["google","google-deepmind","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"google-deepmind-importance-batch-01",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","模型访问或替代状态变化"]:[]}));\n})();\n`;
fs.writeFileSync(dataPath, js, "utf8");

const decisionByUrl = new Map(records.map(record => [record.canonicalUrl, record]));
for (const record of inventory.records) {
  const decision = decisionByUrl.get(record.canonicalUrl);
  if (!decision) continue;
  record.reviewStatus = decision.decision;
  record.reviewReason = decision.reason;
  record.reviewBatch = audit.batch.id;
  if (decision.decision.startsWith("admitted-")) record.cardId = decision.id;
  else delete record.cardId;
}
inventory.summary.admitted = admitted.length;
inventory.summary.rejectedAfterContentReview = records.length - admitted.length;
inventory.summary.pendingContentReview = eligible.length - records.length;
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ summary, inventory:inventory.summary })}\n`);
