/* Re-audit Anthropic candidates 1-220 with importance as a hard gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-01.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-anthropic-importance-01.js");
const inventory = require(inventoryPath);

global.window = { PRO_LIBRARY:{ items:[] } };
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = ""; url.search = "";
  url.pathname = url.pathname.replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

const eligible = inventory.records.filter(record =>
  !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
);
const selected = eligible.slice(0, 220);
if (selected.length !== 220) throw new Error(`Anthropic importance batch 01 must contain 220 candidates, got ${selected.length}`);

/* Explicit editorial decisions. Page independence and official origin are not enough. */
const coreNumbers = new Set([
  2,3,7,9,10,11,12,14,18,24,29,31,32,33,35,38,43,48,49,51,53,54,55,57,60,61,62,63,65,66,68,69,70,71,72,73,75,76,79,80,81,87,88,89,90,91,
  92,96,98,99,100,101,105,106,109,110,111,112,113,116,117,118,
  119,120,122,123,125,132,133,134,137,138,139,141,144,145,146,155,156,157,
  159,164,168,169,176,177,178,
  181,182,190,193,195,197
]);
const supportingNumbers = new Set([
  13,15,17,25,34,39,44,46,52,58,59,64,67,74,77,82,83,84,85,
  94,95,103,107,108,114,
  121,124,130,135,140,142,143,154,
  162,166,171,174,175,
  196,199,202,211
]);
const transitionNumbers = new Set([21,40,104,217,218,219,220]);
const admittedNumbers = new Set([...coreNumbers, ...supportingNumbers, ...transitionNumbers]);

const obsoleteNumbers = new Set([
  170,172,173,180,183,184,185,186,187,188,189,191,192,
  198,200,201,203,204,205,206,207,208,209,210,212,213,214,215,216
]);
const navigationNumbers = new Set([1,4,5,6,8,45,50,57,86,93,97,126,158,160,165,194]);
const duplicateNumbers = new Set([16,19,20,22,23,26,27,28,30,36,37,47,78,127,128,129,147,148,149,150,151,152,153]);

function rejection(record, number) {
  if (obsoleteNumbers.has(number)) return {
    decision:"rejected-obsolete-or-superseded", currentStatus:"obsolete",
    reason:"对应旧模型代际、旧提示或已被当前版本替代；保留会制造错误选型信号，且历史价值不足以单独建卡。"
  };
  if (navigationNumbers.has(number)) return {
    decision:"rejected-navigation-or-onboarding", currentStatus:"current",
    reason:"主要承担目录、入门或控制台导流作用，没有形成可稳定复用的独立技术结论。"
  };
  if (duplicateNumbers.has(number)) return {
    decision:"rejected-duplicate-knowledge", currentStatus:"current",
    reason:"关键知识已由本批更完整的总览或主资料覆盖；这里主要是部署、供应商或操作变体，不重复建卡。"
  };
  return {
    decision:"rejected-low-importance", currentStatus:"current",
    reason:"内容可用但边际贡献偏窄，主要是单点品牌功能、示例或操作细节，未达到独立知识卡的重要性门槛。"
  };
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/migrat|legacy|deprecat/.test(value)) return "迁移与生命周期决策";
  if (/security|permission|auth|vault|identity|compliance|retention|residency|attest|jailbreak|prompt leak/.test(value)) return "安全、权限与合规边界";
  if (/model|effort|cost|latency|rate limit|spend limit/.test(value)) return "模型选型、成本与性能边界";
  if (/eval|hallucinat|consistency|refusal|stop reason|troubleshoot|diagnostic/.test(value)) return "评测、可靠性与故障处理";
  if (/prompt|thinking|context|compact|cache|memory/.test(value)) return "提示、推理与上下文管理";
  if (/agent|tool|mcp|sandbox|session|webhook|outcome|orchestration/.test(value)) return "Agent、工具与执行机制";
  if (/citation|search|file|pdf|embedding/.test(value)) return "检索、文件与可追溯知识处理";
  if (/stream|structured|message|batch|token/.test(value)) return "API 消息、流式与结构化输出机制";
  return "关键平台实现与治理机制";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/security|permission|auth|vault|identity|compliance|retention|residency|attest/.test(value)) return ["agent-identity-access","privacy"];
  if (/jailbreak|prompt leak|refusal/.test(value)) return ["guardrails","red-teaming"];
  if (/eval|hallucinat|consistency/.test(value)) return ["model-evaluation","guardrails"];
  if (/citation|search|embedding/.test(value)) return ["retrieval","rag"];
  if (/pdf|vision|bounding box/.test(value)) return ["multimodal"];
  if (/prompt cache|cache diagnostic/.test(value)) return ["prompt-caching","inference-optimization"];
  if (/prompt|structured output/.test(value)) return ["prompt-engineering","structured-output"];
  if (/thinking|effort|model selection|choosing a model/.test(value)) return ["reasoning-models","model-selection"];
  if (/context|compact|memory/.test(value)) return ["context-compaction","agent-memory"];
  if (/computer use|browser use/.test(value)) return ["computer-use","agent"];
  if (/code execution|bash|text editor/.test(value)) return ["code-execution","coding-tools"];
  if (/agent|tool|mcp|sandbox|session|webhook|orchestration/.test(value)) return ["agent","tool-calling"];
  return ["deployment"];
}

function makeId(record) {
  const slug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-6).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `anthropic-importance-${slug}`;
}

const baselineByUrl = new Map(window.PRO_LIBRARY.items
  .filter(item => item.sourceClass === "official" && item.sourceSubcategory === "anthropic")
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
      ? "当前仍直接影响升级与兼容判断；仅按过渡资料保留，并在替代窗口结束时复核。"
      : supportingNumbers.has(number)
        ? "补充会影响正确实现、排错、安全或选型的官方细节，具有独立证据价值。"
        : "直接解释核心机制、能力边界或工程决策，能持续支持理解与实践。"
  } : rejection(record, number);
  const existing = baselineByUrl.get(record.canonicalUrl);
  return {
    sequence:number, id:existing?.id || makeId(record), title:record.title, url:record.url,
    canonicalUrl:record.canonicalUrl, setId:record.setId, section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被本批更完整的当前主资料完全替代" : "不满足重要性门槛或已有更适合的主资料",
    ...result
  };
});

if (new Set(records.map(record => record.canonicalUrl)).size !== 220) throw new Error("Batch contains duplicate canonical URLs");
const admitted = records.filter(record => record.decision.startsWith("admitted-"));
const summary = records.reduce((acc, record) => {
  acc[record.decision] = (acc[record.decision] || 0) + 1;
  return acc;
}, { reviewed:records.length, admitted:admitted.length, rejected:records.length - admitted.length });

const audit = {
  policy:"official-technical-importance-v2", policyVersion:"2.0",
  batch:{ id:"anthropic-importance-batch-01", source:"official/anthropic", reviewedAt, candidateCount:220,
    selection:"冻结的 845 份官方母集按原始目录顺序取第 1–220 份",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡" },
  records, admittedObjectIds:admitted.map(record => record.id), summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

/* The first Anthropic v2 overlay invalidates every legacy Anthropic card. */
const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
const js = `/* Generated from anthropic-importance-batch-01.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="anthropic"));\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"anthropic",title:row.title,publisher:"Anthropic",collection:"Anthropic 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Anthropic 的实现与声明","使用前应复核页面状态和版本"],tags:["anthropic","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"anthropic-importance-batch-01",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","替代路径或关闭日期变化"]:[]}));\n})();\n`;
fs.writeFileSync(dataPath, js, "utf8");

const decisionByUrl = new Map(records.map(record => [record.canonicalUrl, record]));
for (const record of inventory.records) {
  const decision = decisionByUrl.get(record.canonicalUrl);
  record.reviewStatus = decision ? decision.decision : "pending-importance-review";
  record.reviewReason = decision ? decision.reason : "等待按官方技术资料重要性机制逐份审核。";
  if (decision) {
    record.reviewBatch = audit.batch.id;
    if (decision.decision.startsWith("admitted-")) record.cardId = decision.id;
    else delete record.cardId;
  } else {
    delete record.reviewBatch; delete record.cardId;
  }
}
inventory.summary.admitted = admitted.length;
inventory.summary.rejectedAfterContentReview = records.length - admitted.length;
inventory.summary.pendingContentReview = eligible.length - records.length;
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ summary, inventory:inventory.summary })}\n`);
