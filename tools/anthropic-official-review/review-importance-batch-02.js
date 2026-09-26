/* Re-audit Anthropic candidates 221-440 with importance as a hard gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-02.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-anthropic-importance-02.js");
const inventory = require(inventoryPath);

const eligible = inventory.records.filter(record =>
  !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
);
const selected = eligible.slice(220, 440);
if (selected.length !== 220) throw new Error(`Anthropic importance batch 02 must contain 220 candidates, got ${selected.length}`);

/* Aggregate guidance and a few primary API contracts pass; CRUD permutations do not. */
const coreNumbers = new Set([
  221,222,223,224,230,233,234,238,243,245,246,248,251,252,255,
  290,302,307,312,385
]);
const supportingNumbers = new Set([225,235,247,256]);
const transitionNumbers = new Set([239]);
const admittedNumbers = new Set([...coreNumbers, ...supportingNumbers, ...transitionNumbers]);

const navigationNumbers = new Set([229,257,292]);
const obsoleteNumbers = new Set([301,316]);
const duplicateStableBetaNumbers = new Set([
  291,295,308,313,315,331,333,345,353,362,364,376,387,391,417,435,438
]);
const sdkVariantNumbers = new Set([231,232,236,237,240,241,242,244]);
const modelAnnouncementNumbers = new Set([226,227,228]);

function rejection(record, number) {
  if (obsoleteNumbers.has(number)) return {
    decision:"rejected-obsolete-or-superseded", currentStatus:"obsolete",
    reason:"Text Completions 属于旧接口路径，已被 Messages 主路径替代；不再作为当前实现卡保留。"
  };
  if (navigationNumbers.has(number)) return {
    decision:"rejected-navigation-or-onboarding", currentStatus:"current",
    reason:"页面主要承担快速开始、目录或发布记录导航作用，没有形成独立、稳定的技术结论。"
  };
  if (duplicateStableBetaNumbers.has(number)) return {
    decision:"rejected-duplicate-stable-beta", currentStatus:"current",
    reason:"Beta 路由与同批稳定 API 表达同一操作；只保留稳定主路径，避免一项知识生成两张卡。"
  };
  if (sdkVariantNumbers.has(number)) return {
    decision:"rejected-language-variant", currentStatus:"current",
    reason:"主要是同一 SDK 能力的语言实现变体；由 SDK 总览和关键协议卡覆盖，不按语言重复建卡。"
  };
  if (modelAnnouncementNumbers.has(number)) return {
    decision:"rejected-duplicate-model-announcement", currentStatus:"current",
    reason:"当前模型能力、选型和迁移知识已由模型总览、选择指南及迁移指南完整覆盖，发布亮点不再单独建卡。"
  };
  if (number >= 258) return {
    decision:"rejected-granular-api-operation", currentStatus:"current",
    reason:"这是单一资源或 CRUD 操作的接口页；可作为开发查询入口，但未增加独立的机制、选型、安全或可靠性知识。"
  };
  return {
    decision:"rejected-low-importance", currentStatus:"current",
    reason:"内容有效但主要是局部配置、供应商环境或操作便利信息，未达到独立知识卡的重要性门槛。"
  };
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/migrat|compatib|deprecat/.test(value)) return "迁移、兼容与生命周期决策";
  if (/pricing|cost|service tier|rate limit/.test(value)) return "成本、容量与服务等级边界";
  if (/auth|iam|compliance/.test(value)) return "身份、权限与合规接口边界";
  if (/error|version|beta header/.test(value)) return "API 版本、错误与稳定性契约";
  if (/skill/.test(value)) return "Agent Skill 的实现接口";
  if (/batch|token|message|file/.test(value)) return "核心 API 对象与调用契约";
  if (/cli|script|resource|middleware|sdk/.test(value)) return "SDK、CLI 与自动化实现路径";
  return "模型与平台选型依据";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/auth|iam|compliance/.test(value)) return ["agent-identity-access","privacy"];
  if (/pricing|cost|rate limit|service tier/.test(value)) return ["inference-optimization","model-selection"];
  if (/error|version|beta header/.test(value)) return ["deployment"];
  if (/skill/.test(value)) return ["agent","tool-calling"];
  if (/batch|message|token|file/.test(value)) return ["structured-output","deployment"];
  if (/model|deprecat|compatib/.test(value)) return ["model-selection","deployment"];
  return ["deployment"];
}

function makeId(record) {
  const slug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-7).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `anthropic-importance-${slug}`;
}

const records = selected.map((record, index) => {
  const number = index + 221;
  const accepted = admittedNumbers.has(number);
  const decision = transitionNumbers.has(number) ? "admitted-transition"
    : supportingNumbers.has(number) ? "admitted-supporting" : "admitted-core";
  const result = accepted ? {
    decision,
    currentStatus:transitionNumbers.has(number) ? "transition" : "current",
    reason:transitionNumbers.has(number)
      ? "直接影响从 OpenAI SDK 迁移到 Anthropic 的兼容边界；按过渡资料保留并持续复核。"
      : supportingNumbers.has(number)
        ? "补充会影响成本、连接或预览功能使用的官方约束，具有独立决策价值。"
        : "定义模型生命周期、核心 API 契约或生产实现边界，能够持续支持工程决策。"
  } : rejection(record, number);
  return {
    sequence:number, id:makeId(record), title:record.title, url:record.url,
    canonicalUrl:record.canonicalUrl, setId:record.setId, section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被本批或第一批的主资料完整替代" : "已有聚合主资料或稳定接口覆盖",
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
  batch:{ id:"anthropic-importance-batch-02", source:"official/anthropic", reviewedAt, candidateCount:220,
    selection:"冻结的 845 份官方母集按原始目录顺序取第 221–440 份",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡" },
  records, admittedObjectIds:admitted.map(record => record.id), summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
const js = `/* Generated from anthropic-importance-batch-02.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>item.reviewBatch!=="anthropic-importance-batch-02");\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"anthropic",title:row.title,publisher:"Anthropic",collection:"Anthropic 官方技术资料",contentKind:"API 与开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Anthropic 的实现与声明","价格、Beta 与版本信息使用前应复核"],tags:["anthropic","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"anthropic-importance-batch-02",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["兼容层变化","迁移路径失效"]:[]}));\n})();\n`;
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
inventory.summary.admitted = inventory.records.filter(record => record.reviewStatus.startsWith("admitted-")).length;
inventory.summary.rejectedAfterContentReview = inventory.records.filter(record => record.reviewStatus.startsWith("rejected-")).length;
inventory.summary.pendingContentReview = inventory.records.filter(record => record.reviewStatus === "pending-importance-review").length;
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ summary, inventory:inventory.summary })}\n`);
