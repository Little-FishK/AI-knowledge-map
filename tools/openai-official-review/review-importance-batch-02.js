/* Audit OpenAI candidates 201-400 with the official-technical importance gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-02.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-openai-importance-02.js");
const inventory = require(inventoryPath);

global.window = { PRO_LIBRARY: { items: [] } };
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
require(path.join(PROJECT_ROOT, "data", "library-official-openai-importance-01.js"));

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

const eligible = inventory.records.filter(record =>
  !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
);
const selected = eligible.slice(200, 400);
if (selected.length !== 200) throw new Error(`Importance batch 02 must contain 200 candidates, got ${selected.length}`);

/* Global sequence numbers in the frozen 929-document candidate corpus. */
const admittedCore = new Set([202,205,207,209,213,216,220,223]);
const admittedSupporting = new Set([201,206,210,211,214,217,233,306,307,308,395,398]);
const admittedNumbers = new Set([...admittedCore, ...admittedSupporting]);
const obsoleteNumbers = new Set([204,215,232,263,264,284,285,286,287,288,289,290,301]);
const navigationNumbers = new Set([218,221,222,231]);
const duplicateNumbers = new Set([
  208,229,230,234,244,258,260,265,276,282,291,296,304,309,313,315,316,323,324,
  259,333,338,350,351,362,367,375,388,389,396,399,400
]);

function contribution(number, record) {
  if ([201,216,217].includes(number)) return "身份、密钥与隐私安全边界";
  if (number === 202) return "Embedding 表示及其检索、聚类用途";
  if (number === 205) return "视觉理解模型的监督微调方法";
  if ([206,207,211,214].includes(number)) return "语音 Agent 的架构、传输与交互控制";
  if (number === 209) return "联网检索工具的能力与使用边界";
  if (number === 210) return "异步事件投递、验签、重试与幂等处理";
  if (number === 213) return "长链 Agent 工作流的 WebSocket 复用与低延迟机制";
  if (number === 220) return "MCP 服务端工具、传输和鉴权实现";
  if (number === 223) return "模型能力、上下文与成本的官方比较证据";
  if (number === 233) return "Agents API 流式事件协议";
  if (number === 259) return "Responses WebSocket 双向事件协议";
  if ([306,307,308].includes(number)) return "GPT-Live 主通道、分支与侧带 WebSocket 协议";
  if ([395,398].includes(number)) return "Realtime 客户端与服务端事件模型";
  return record.description || "关键官方实现资料";
}

function reject(number, record) {
  if (obsoleteNumbers.has(number)) {
    return { decision:"rejected-obsolete-or-sunset", currentStatus:"obsolete", reason:"对应 API、模型或评测平台已关闭、已进入关闭期或被当前主路径替代，且本页不承担必要迁移说明。" };
  }
  if (navigationNumbers.has(number)) {
    return { decision:"rejected-navigation-or-feed", currentStatus:"current", reason:"这是目录、模型清单或 API 总导航；它适合查找原件，但不形成稳定的独立知识结论。" };
  }
  if (duplicateNumbers.has(number)) {
    return { decision:"rejected-duplicate-knowledge", currentStatus:"current", reason:"其重要内容已由本批或第一批更完整的指南覆盖；资源索引或特定接口变体不再重复建卡。" };
  }
  const value = `${record.title} ${record.canonicalUrl}`.toLowerCase();
  if (/quickstart|tutorials\//.test(value)) {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"教程或快速开始主要演示单一任务，未增加不可替代的机制、选型或生产知识。" };
  }
  if (record.setId === "api-reference") {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"这是单个 CRUD 方法、参数或窄事件查询页；对实现有查表价值，但不足以作为独立知识卡。" };
  }
  return { decision:"rejected-low-importance", currentStatus:"current", reason:"页面当前可用，但主要提供供应商配置、命令入口或运营查询，未达到独立建卡的重要性门槛。" };
}

function inferNodes(number, record) {
  if ([201,216,217].includes(number)) return ["agent-identity-access","privacy"];
  if (number === 202) return ["embedding","retrieval"];
  if (number === 205) return ["fine-tuning","multimodal"];
  if ([206,207,211,214,306,307,308,395,398].includes(number)) return ["speech","streaming"];
  if (number === 209) return ["tool-calling","retrieval"];
  if (number === 210) return ["deployment","observability"];
  if ([213,233,259].includes(number)) return ["streaming","agent-loop"];
  if (number === 220) return ["mcp","mcp-architecture"];
  if (number === 223) return ["model-selection","model-families"];
  const value = `${record.title} ${record.description}`.toLowerCase();
  if (/realtime|voice|audio/.test(value)) return ["speech","streaming"];
  return ["deployment"];
}

function makeId(record) {
  const pathSlug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-6).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `openai-importance-${pathSlug}`;
}

const existingByUrl = new Map(window.PRO_LIBRARY.items
  .filter(item => item.sourceClass === "official" && item.sourceSubcategory === "openai")
  .map(item => [canonicalize(item.url), item]));

const records = selected.map((record, offset) => {
  const sequence = 201 + offset;
  const accepted = admittedNumbers.has(sequence);
  const result = accepted
    ? {
        decision:admittedCore.has(sequence) ? "admitted-core" : "admitted-supporting",
        currentStatus:"current",
        reason:admittedCore.has(sequence)
          ? "直接承担知识矩阵中的核心机制、能力边界或选型判断，不能由方法级参考页替代。"
          : "提供正确实现所需的协议、事件、安全或生产约束，缺失时会影响系统行为或可靠性。"
      }
    : reject(sequence, record);
  const existing = existingByUrl.get(record.canonicalUrl);
  return {
    sequence,
    id:existing?.id || makeId(record),
    title:record.title,
    url:record.url,
    canonicalUrl:record.canonicalUrl,
    setId:record.setId,
    section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(sequence, record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被现有主指南完整替代；承担独立机制或协议作用" : "不满足重要性门槛或已有更合适的主资料",
    ...result
  };
});

if (new Set(records.map(record => record.canonicalUrl)).size !== 200) throw new Error("Batch contains duplicate canonical URLs");
const admitted = records.filter(record => record.decision.startsWith("admitted-"));
const summary = records.reduce((acc, record) => {
  acc[record.decision] = (acc[record.decision] || 0) + 1;
  return acc;
}, { reviewed:records.length, admitted:admitted.length, rejected:records.length - admitted.length });

const audit = {
  policy:"official-technical-importance-v2",
  policyVersion:"2.0",
  batch:{
    id:"openai-importance-batch-02",
    source:"official/openai",
    reviewedAt,
    candidateCount:200,
    selection:"冻结母集中第 201-400 份独立候选",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡"
  },
  records,
  admittedObjectIds:admitted.map(record => record.id),
  summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record.sequence, record) }));
const js = `/* Generated from openai-importance-batch-02.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"openai",title:row.title,publisher:"OpenAI",collection:"OpenAI 官方技术资料",contentKind:row.setId==="api-reference"?"API Reference":"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 OpenAI 的实现与声明","使用前应复核页面状态和版本"],tags:["openai","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"openai-importance-batch-02",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:[]}));\n})();\n`;
fs.writeFileSync(dataPath, js, "utf8");

const decisionByUrl = new Map(records.map(record => [record.canonicalUrl, record]));
for (const record of inventory.records) {
  if (record.duplicateOf || record.reviewStatus === "ineligible-container-or-combined-export") continue;
  const decision = decisionByUrl.get(record.canonicalUrl);
  if (!decision) continue;
  record.reviewStatus = decision.decision;
  record.reviewReason = decision.reason;
  record.reviewBatch = audit.batch.id;
  if (decision.decision.startsWith("admitted-")) record.cardId = decision.id;
  else delete record.cardId;
}
const structurallyEligible = inventory.records.filter(record =>
  !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
);
inventory.summary.uniqueContentCandidates = structurallyEligible.length;
inventory.summary.admitted = structurallyEligible.filter(record => record.reviewStatus.startsWith("admitted-")).length;
inventory.summary.rejectedAfterContentReview = structurallyEligible.filter(record => record.reviewStatus.startsWith("rejected-")).length;
inventory.summary.pendingContentReview = structurallyEligible.filter(record => record.reviewStatus === "pending-importance-review").length;
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ summary, inventory:inventory.summary })}\n`);
