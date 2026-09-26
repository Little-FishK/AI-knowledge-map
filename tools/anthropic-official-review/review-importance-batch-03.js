/* Re-audit Anthropic candidates 441-660 with importance as a hard gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-03.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-anthropic-importance-03.js");
const inventory = require(inventoryPath);

const eligible = inventory.records.filter(record =>
  !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
);
const selected = eligible.slice(440, 660);
if (selected.length !== 220) throw new Error(`Anthropic importance batch 03 must contain 220 candidates, got ${selected.length}`);

/* API collection contracts and durable Claude Code mechanisms pass; CRUD permutations do not. */
const coreNumbers = new Set([
  530,535,583,
  638,641,642,643,644,645,646,647,650,653,656
]);
const supportingNumbers = new Set([627,648,652,655,657,658]);
const transitionNumbers = new Set([659]);
const admittedNumbers = new Set([...coreNumbers, ...supportingNumbers, ...transitionNumbers]);

const navigationNumbers = new Set([639,640,651,660]);
const obsoleteNumbers = new Set([635,637]);
const duplicateStableBetaNumbers = new Set([
  477,484,486,505,507,534,536,563,567,584,617,629,
  442,443,444,445,509,510,511,512,569,570,572,573
]);

function rejection(record, number) {
  if (obsoleteNumbers.has(number)) return {
    decision:"rejected-obsolete-or-superseded", currentStatus:"obsolete",
    reason:"对应已被当前模型代际替代的发布或迁移页面，不再影响当前选型与实现。"
  };
  if (navigationNumbers.has(number)) return {
    decision:"rejected-navigation-or-onboarding", currentStatus:"current",
    reason:"主要承担快速开始、变更日志或平台入口导航作用，没有形成独立、稳定的技术结论。"
  };
  if (duplicateStableBetaNumbers.has(number)) return {
    decision:"rejected-duplicate-route-or-beta", currentStatus:"current",
    reason:"与稳定接口或同一 Beta 资源的另一管理路由表达相同知识，不重复创建卡片。"
  };
  if (number >= 441 && number <= 634) return {
    decision:"rejected-granular-api-operation", currentStatus:"current",
    reason:"页面仅描述单个资源操作或集合入口；其机制已由主指南和核心 API 契约覆盖，查询价值不足以转化为独立知识卡。"
  };
  if (number === 636) return {
    decision:"rejected-duplicate-knowledge", currentStatus:"current",
    reason:"API 入门知识已由 Messages、认证和 API 总览等更完整资料覆盖，不再重复建卡。"
  };
  return {
    decision:"rejected-low-importance", currentStatus:"current",
    reason:"内容可用但主要是提示模板、终端平台入口或单一渠道配置，边际知识贡献不足。"
  };
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/slack|retir|claude tag/.test(value)) return "协作渠道迁移与兼容边界";
  if (/context window|prompt caching|memory/.test(value)) return "上下文、缓存与持久记忆机制";
  if (/session|remote control|projects/.test(value)) return "会话生命周期与并行工作协调";
  if (/extend|\.claude|skill|version/.test(value)) return "扩展体系、配置结构与技能版本契约";
  if (/computer|chrome/.test(value)) return "计算机与浏览器操作能力边界";
  if (/vs code|jetbrains/.test(value)) return "IDE 集成的实现与交互边界";
  if (/messages|models/.test(value)) return "核心 API 资源与模型发现契约";
  if (/best practice|workflow|how claude code works/.test(value)) return "编码代理工作原理与实践方法";
  return "Claude Code 核心能力与实现边界";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/context|cache/.test(value)) return ["context-compaction","prompt-caching"];
  if (/memory/.test(value)) return ["agent-memory","context-engineering"];
  if (/computer|chrome/.test(value)) return ["computer-use","agent"];
  if (/messages|models/.test(value)) return ["model-selection","deployment"];
  if (/skill|extend|\.claude/.test(value)) return ["agent","tool-calling"];
  if (/session|projects|remote control|slack/.test(value)) return ["agent","tool-calling"];
  return ["coding-tools","agent"];
}

function makeId(record) {
  const slug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-7).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `anthropic-importance-${slug}`;
}

const records = selected.map((record, index) => {
  const number = index + 441;
  const accepted = admittedNumbers.has(number);
  const decision = transitionNumbers.has(number) ? "admitted-transition"
    : supportingNumbers.has(number) ? "admitted-supporting" : "admitted-core";
  const result = accepted ? {
    decision,
    currentStatus:transitionNumbers.has(number) ? "transition" : "current",
    reason:transitionNumbers.has(number)
      ? "旧 Slack 集成仍服务部分方案，同时明确指向 Claude Tag；会直接影响现有团队迁移判断。"
      : supportingNumbers.has(number)
        ? "补充工作流、远程控制或 IDE 集成的关键实现差异，能影响实际使用方式。"
        : "解释 Claude Code 或核心 API 的稳定机制与能力边界，具有持续复用价值。"
  } : rejection(record, number);
  return {
    sequence:number, id:makeId(record), title:record.title, url:record.url,
    canonicalUrl:record.canonicalUrl, setId:record.setId, section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被前两批主资料完整替代" : "已有聚合主资料、稳定接口或当前模型资料覆盖",
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
  batch:{ id:"anthropic-importance-batch-03", source:"official/anthropic", reviewedAt, candidateCount:220,
    selection:"冻结的 845 份官方母集按原始目录顺序取第 441–660 份",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡" },
  records, admittedObjectIds:admitted.map(record => record.id), summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
const js = `/* Generated from anthropic-importance-batch-03.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>item.reviewBatch!=="anthropic-importance-batch-03");\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"anthropic",title:row.title,publisher:"Anthropic",collection:"Anthropic 官方技术资料",contentKind:row.setId==="claude-code"?"Claude Code 文档":"API 参考",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Anthropic 的实现与声明","Beta、集成与迁移状态使用前应复核"],tags:["anthropic","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"anthropic-importance-batch-03",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["旧 Slack 集成支持范围变化","Claude Tag 完成替代"]:[]}));\n})();\n`;
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
