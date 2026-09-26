/* Re-audit the final 185 Anthropic candidates (661-845). */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-04.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-anthropic-importance-04.js");
const inventory = require(inventoryPath);

const eligible = inventory.records.filter(record =>
  !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
);
const selected = eligible.slice(660);
if (selected.length !== 185) throw new Error(`Anthropic importance batch 04 must contain 185 candidates, got ${selected.length}`);

const coreNumbers = new Set([
  662,663,669,671,672,673,674,677,
  678,679,681,682,683,684,686,687,689,690,
  692,693,694,695,696,698,700,701,
  703,705,706,707,708,709,710,716,
  719,720,726,727,728,729,730,731,732,733,734,
  737,738,739,742,743,745,746,747,748,
  749,750,752,753,755,756,757,760,
  767,768,769,770,771,772,773,774,775,
  777,780,781,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,804,805,
  834
]);
const supportingNumbers = new Set([
  664,666,676,680,688,691,697,699,702,704,711,717,718,
  721,722,723,754,758,763,803
]);
const transitionNumbers = new Set([779]);
const admittedNumbers = new Set([...coreNumbers, ...supportingNumbers, ...transitionNumbers]);

const quickstartNumbers = new Set([661,665,685,751,778]);
const providerVariantNumbers = new Set([667,668,670,675,712,713,714,715,724,725]);
const lowImportanceNumbers = new Set([735,736,740,741,744,761,762,764,765,766,776,782]);
const obsoleteNumbers = new Set([759,807]);
const languageReferenceNumbers = new Set([806,808]);
const updateFeedNumbers = new Set(Array.from({ length:25 }, (_, index) => 809 + index));
const indexNumbers = new Set(Array.from({ length:11 }, (_, index) => 835 + index));

function rejection(record, number) {
  if (quickstartNumbers.has(number)) return {
    decision:"rejected-navigation-or-onboarding", currentStatus:"current",
    reason:"快速开始主要服务首次操作，核心机制已由同主题的正式指南覆盖，不单独建卡。"
  };
  if (providerVariantNumbers.has(number)) return {
    decision:"rejected-platform-variant", currentStatus:"current",
    reason:"主要是操作系统、云厂商或单一运行环境变体；通用部署和安全机制已有更完整主资料。"
  };
  if (lowImportanceNumbers.has(number)) return {
    decision:"rejected-low-importance", currentStatus:"current",
    reason:"内容主要是界面偏好、推广材料、示例或便利功能，不影响核心理解、实现或选型。"
  };
  if (obsoleteNumbers.has(number)) return {
    decision:"rejected-obsolete-or-superseded", currentStatus:"obsolete",
    reason:number === 807
      ? "该 TypeScript V2 预览接口已明确移除，不能作为当前实现依据。"
      : "Advisor 的核心机制已由当前 Claude Platform 主资料覆盖，此页不再产生独立增量。"
  };
  if (languageReferenceNumbers.has(number)) return {
    decision:"rejected-language-variant", currentStatus:"current",
    reason:"TypeScript 与 Python 参考属于同一 Agent SDK 的语言展开；机制由 SDK 主文档覆盖，不按语言重复建卡。"
  };
  if (updateFeedNumbers.has(number)) return {
    decision:"rejected-update-feed", currentStatus:"current",
    reason:"周度更新属于时效性信息流，结论会快速被后续版本吸收，不形成长期知识卡。"
  };
  if (indexNumbers.has(number)) return {
    decision:"rejected-language-index", currentStatus:"current",
    reason:"这是其他语言的文档索引而非独立技术资料；英文原件已逐份审核，不重复收录翻译目录。"
  };
  return {
    decision:"rejected-low-importance", currentStatus:"current",
    reason:"页面可用但未提供足够独立、耐久且会影响工程决策的知识增量。"
  };
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/migrat/.test(value)) return "Agent SDK 迁移与兼容决策";
  if (/security|permission|sandbox|identity|auth|data usage|retention|compliance/.test(value)) return "安全、权限、身份与数据边界";
  if (/agent|subagent|team|session|workflow|worktree|goal/.test(value)) return "代理协作、会话与编排机制";
  if (/mcp|tool|plugin|hook|channel|skill|artifact/.test(value)) return "工具、扩展与自动化机制";
  if (/gateway|network|deploy|environment|hosting|container/.test(value)) return "企业部署、网络与运行环境";
  if (/cost|usage|analytics|monitor|telemetry/.test(value)) return "成本、使用量与可观测性";
  if (/stream|structured|input|approval/.test(value)) return "Agent SDK 输入、输出与控制契约";
  if (/model|response|output style|fast mode/.test(value)) return "模型与响应行为配置";
  if (/reference|command|environment variable|checkpoint|interactive/.test(value)) return "Claude Code 稳定操作契约";
  return "Claude Code 实现、可靠性与生产实践";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/security|permission|sandbox|identity|auth|data usage|retention|compliance/.test(value)) return ["agent-identity-access","privacy"];
  if (/cost|usage|analytics|monitor|telemetry/.test(value)) return ["inference-optimization","model-evaluation"];
  if (/model|response|output style|fast mode/.test(value)) return ["model-selection","prompt-engineering"];
  if (/stream|structured/.test(value)) return ["structured-output","agent"];
  if (/mcp|tool|plugin|hook|channel|skill/.test(value)) return ["tool-calling","agent"];
  if (/agent|subagent|team|session|workflow|worktree|goal/.test(value)) return ["agent","agent-memory"];
  if (/deploy|gateway|network|environment|hosting|container/.test(value)) return ["deployment","agent"];
  return ["coding-tools","agent"];
}

function makeId(record) {
  const slug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-7).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `anthropic-importance-${slug}`;
}

const records = selected.map((record, index) => {
  const number = index + 661;
  const accepted = admittedNumbers.has(number);
  const decision = transitionNumbers.has(number) ? "admitted-transition"
    : supportingNumbers.has(number) ? "admitted-supporting" : "admitted-core";
  const result = accepted ? {
    decision,
    currentStatus:transitionNumbers.has(number) ? "transition" : "current",
    reason:transitionNumbers.has(number)
      ? "直接说明从旧 Claude Code SDK 迁移到 Agent SDK 的接口变化，仍影响现有项目升级。"
      : supportingNumbers.has(number)
        ? "补充特定生产场景、集成或故障处理信息，会影响正确部署和使用。"
        : "直接解释 Claude Code 或 Agent SDK 的核心机制、安全边界和生产实现方法。"
  } : rejection(record, number);
  return {
    sequence:number, id:makeId(record), title:record.title, url:record.url,
    canonicalUrl:record.canonicalUrl, setId:record.setId, section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被前三批或本批其他主资料完整替代" : "已有更完整主资料或不适合作为独立知识对象",
    ...result
  };
});

if (new Set(records.map(record => record.canonicalUrl)).size !== 185) throw new Error("Batch contains duplicate canonical URLs");
const admitted = records.filter(record => record.decision.startsWith("admitted-"));
const summary = records.reduce((acc, record) => {
  acc[record.decision] = (acc[record.decision] || 0) + 1;
  return acc;
}, { reviewed:records.length, admitted:admitted.length, rejected:records.length - admitted.length });

const audit = {
  policy:"official-technical-importance-v2", policyVersion:"2.0",
  batch:{ id:"anthropic-importance-batch-04", source:"official/anthropic", reviewedAt, candidateCount:185,
    selection:"冻结的 845 份官方母集按原始目录顺序取第 661–845 份",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡" },
  records, admittedObjectIds:admitted.map(record => record.id), summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
const js = `/* Generated from anthropic-importance-batch-04.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>item.reviewBatch!=="anthropic-importance-batch-04");\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"anthropic",title:row.title,publisher:"Anthropic",collection:"Anthropic 官方技术资料",contentKind:"Claude Code 文档",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Anthropic 的实现与声明","预览、集成和部署状态使用前应复核"],tags:["anthropic","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"anthropic-importance-batch-04",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["旧 SDK 停止兼容","迁移指南失效"]:[]}));\n})();\n`;
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
if (inventory.summary.admitted + inventory.summary.rejectedAfterContentReview !== 845 || inventory.summary.pendingContentReview !== 0) {
  throw new Error(`Anthropic review does not close 845 candidates: ${JSON.stringify(inventory.summary)}`);
}
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ summary, inventory:inventory.summary })}\n`);
