/* Audit Google / Google DeepMind candidates 131-257 with importance as a hard gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-importance-batch-02.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-google-deepmind-importance-02.js");
const inventory = require(inventoryPath);

global.window = { PRO_LIBRARY:{ items:[] } };
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
require(path.join(PROJECT_ROOT, "data", "library-official-google-deepmind-importance-01.js"));

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = ""; url.search = "";
  url.pathname = url.pathname.replace(/\.md\.txt$/, "").replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

const eligible = inventory.records.filter(record => !record.duplicateOf);
const selected = eligible.slice(130);
if (selected.length !== 127) throw new Error(`Google batch 02 must contain 127 candidates, got ${selected.length}`);

/* Global numbers in the frozen 257-item corpus. */
const coreNumbers = new Set([
  135,137,138,141,142,143,145,146,147,148,149,150,152,153,155,156,157,159,160,161,163,164,165,168,170,
  175,176,179,180,181,183,184,191,193,194,195,196,197,200,202,203,206,209,
  211,215,216,217,218,219,220,221,223,224,225,226,
  227,229,230,231,232,233,234,235,237,243,248,249,250,251,252,253,255
]);
const supportingNumbers = new Set([
  133,134,140,144,172,178,182,190,192,199,201,208,210,
  228,236,240,245,247
]);
const admittedNumbers = new Set([...coreNumbers, ...supportingNumbers]);

const navigationNumbers = new Set([136,139,158,167,169,254,257]);
const exampleNumbers = new Set([151,162]);
const legacyDuplicateNumbers = new Set([154,173,177,185,186,187,188,189,198,204,205,207]);
const obsoleteNumbers = new Set([131,132,166,171,174,222]);
const redundantVariantNumbers = new Set([212,213,214]);
const lowMatrixValueNumbers = new Set([238,239,241,242,244,246,256]);

function rejection(number) {
  if (navigationNumbers.has(number)) return {
    decision:"rejected-navigation-or-nontechnical", currentStatus:"current",
    reason:"页面主要承担接入、目录、公司介绍或内容入口作用，未形成可独立复用的技术结论。"
  };
  if (exampleNumbers.has(number)) return {
    decision:"rejected-example-workflow", currentStatus:"current",
    reason:"内容主要是单一演示或部署工作流，知识增量不足以单独建卡。"
  };
  if (legacyDuplicateNumbers.has(number)) return {
    decision:"rejected-legacy-or-duplicate-route", currentStatus:"transition",
    reason:"属于旧 Generate Content API 路径或当前主资料的重复路由，知识已由更新官方原件覆盖。"
  };
  if (obsoleteNumbers.has(number)) return {
    decision:"rejected-obsolete-or-superseded", currentStatus:"obsolete",
    reason:"模型、公告或产品路线已被更新版本取代，且不具备不可替代的基础或历史解释价值。"
  };
  if (redundantVariantNumbers.has(number)) return {
    decision:"rejected-redundant-model-variant", currentStatus:"current",
    reason:"同一模型家族的型号差异已由更完整的 Gemini API 选型资料覆盖，品牌页不重复建卡。"
  };
  if (lowMatrixValueNumbers.has(number)) return {
    decision:"rejected-narrow-brand-fact", currentStatus:"current",
    reason:"虽是有效官方成果，但主要证明单一行业应用或合作事实，不能补足当前知识矩阵的关键缺口。"
  };
  return {
    decision:"rejected-low-importance", currentStatus:"current",
    reason:"资料有效，但相对当前主资料没有足够独立的理解、实现、选型、安全或可靠性增量。"
  };
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/alphago|alphazero|muzero|alphachip|alphadev|reinforcement/.test(value)) return "强化学习、自博弈与搜索的代表性进展";
  if (/alphafold|alphagenome|gnome|weather|science|earth|qubit|fluid dynamics/.test(value)) return "AI for Science 的代表性方法与边界";
  if (/alphaevolve|funsearch|alphaproof|alphageometry|codemender/.test(value)) return "可验证推理、代码与算法发现";
  if (/sima|robot/.test(value)) return "具身智能与机器人系统";
  if (/synthid|safety|abuse|zero data|factuality/.test(value)) return "安全、治理与内容可信机制";
  if (/lyria|veo|image|audio|video|speech|voice|transcri|omni|multimodal/.test(value)) return "多模态生成、理解与实时交互";
  if (/thinking|thought|prompt|structured|token|text generation/.test(value)) return "提示、推理与输出控制";
  if (/tool|hook|background|webhook|agent|credential/.test(value)) return "Agent、工具与异步执行机制";
  if (/rate|pricing|priority|optimization/.test(value)) return "成本、吞吐与推理优化";
  if (/openai compatibility|api error|troubleshoot/.test(value)) return "API 兼容与可靠性诊断";
  if (/gemma|genie|gemini family|deep think|embedding/.test(value)) return "模型家族、表示与能力边界";
  return "Gemini API 核心实现机制";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/alphago|alphazero|muzero|alphachip|alphadev|reinforcement/.test(value)) return ["reinforcement-learning","model-selection"];
  if (/alphafold|alphagenome|gnome|weather|science|earth|qubit|fluid dynamics/.test(value)) return ["neural-network","deployment"];
  if (/alphaevolve|funsearch|alphaproof|alphageometry|codemender/.test(value)) return ["agent","code-execution"];
  if (/sima|robot/.test(value)) return ["agent","multimodal"];
  if (/synthid|safety|abuse|zero data|factuality/.test(value)) return ["guardrails","privacy"];
  if (/embedding/.test(value)) return ["embedding","retrieval"];
  if (/lyria|veo|image|audio|video|speech|voice|transcri|omni|multimodal/.test(value)) return ["multimodal","streaming"];
  if (/thinking|thought|prompt|structured|token|text generation/.test(value)) return ["prompt-engineering","structured-output"];
  if (/tool|hook|background|webhook|agent|credential/.test(value)) return ["agent","tool-calling"];
  return ["deployment","model-selection"];
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
  const number = index + 131;
  const accepted = admittedNumbers.has(number);
  const decision = supportingNumbers.has(number) ? "admitted-supporting" : "admitted-core";
  const result = accepted ? {
    decision, currentStatus:"current",
    reason:supportingNumbers.has(number)
      ? "补充会影响模型选择、专业能力比较或代表性研究判断的官方差异，具有独立证据价值。"
      : "直接补充核心实现机制、能力边界、安全可靠性或具有广泛方法价值的代表性技术贡献。"
  } : rejection(number);
  const existing = baselineByUrl.get(record.canonicalUrl);
  return {
    sequence:number, batchSequence:index + 1, id:existing?.id || makeId(record), title:record.title, url:record.url,
    canonicalUrl:record.canonicalUrl, setId:record.setId, section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被同品牌当前主资料完整替代" : "已有更新主资料覆盖，或不足以补当前知识矩阵",
    ...result
  };
});

if (new Set(records.map(record => record.canonicalUrl)).size !== 127) throw new Error("Batch contains duplicate canonical URLs");
const admitted = records.filter(record => record.decision.startsWith("admitted-"));
const summary = records.reduce((acc, record) => {
  acc[record.decision] = (acc[record.decision] || 0) + 1;
  return acc;
}, { reviewed:records.length, admitted:admitted.length, rejected:records.length - admitted.length });

const audit = {
  policy:"official-technical-importance-v2", policyVersion:"2.0",
  batch:{ id:"google-deepmind-importance-batch-02", source:"official/google-deepmind", reviewedAt, candidateCount:127,
    selection:"冻结的 257 份官方母集按原始目录顺序取第 131–257 份",
    hardGate:"只有对理解、实现、选型、可靠性、安全或代表性方法贡献具有实质用途的资料才建卡" },
  records, admittedObjectIds:admitted.map(record => record.id), summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
const js = `/* Generated from google-deepmind-importance-batch-02.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"google-deepmind",title:row.title,publisher:row.setId==="deepmind-portfolio"?"Google DeepMind":"Google",collection:"Google / Google DeepMind 官方技术资料",contentKind:row.setId==="deepmind-portfolio"?"官方研究与模型资料":"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或代表性方法判断。",limitations:["只直接证明 Google / Google DeepMind 的实现与声明","预览模型、价格和生命周期使用前应复核"],tags:["google","google-deepmind","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"google-deepmind-importance-batch-02",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:[]}));\n})();\n`;
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
inventory.batch.status = "complete";
inventory.summary.admitted = inventory.records.filter(record => record.reviewStatus.startsWith("admitted-")).length;
inventory.summary.rejectedAfterContentReview = inventory.records.filter(record => record.reviewStatus.startsWith("rejected-")).length;
inventory.summary.pendingContentReview = inventory.records.filter(record => record.reviewStatus === "pending-importance-review").length;
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ summary, inventory:inventory.summary })}\n`);
