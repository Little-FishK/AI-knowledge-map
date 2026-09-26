/* Audit OpenAI candidates 401-600 with the official-technical importance gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-03.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-openai-importance-03.js");
const inventory = require(inventoryPath);

global.window = { PRO_LIBRARY: { items: [] } };
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
require(path.join(PROJECT_ROOT, "data", "library-official-openai-importance-01.js"));
require(path.join(PROJECT_ROOT, "data", "library-official-openai-importance-02.js"));

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
const selected = eligible.slice(400, 600);
if (selected.length !== 200) throw new Error(`Importance batch 03 must contain 200 candidates, got ${selected.length}`);

const admittedCore = new Set([
  404,410,446,450,456,462,463,465,468,470,471,483,492,493,494,496,498,506,513,
  514,515,518,528,529,539,541,545,558,559,560,571,572,573,595
]);
const admittedSupporting = new Set([
  409,441,447,448,460,461,469,474,476,481,484,485,487,500,502,503,507,508,510,
  516,517,519,520,525,535,537,568,577,597,598,599,600
]);
const admittedTransition = new Set([538]);
const admittedNumbers = new Set([...admittedCore, ...admittedSupporting, ...admittedTransition]);
const obsoleteNumbers = new Set([436,437,438,439,440,480]);
const navigationNumbers = new Set([
  401,413,417,442,444,445,452,479,482,486,491,521,526,540,544,557,583,585,590,
  591,593,596
]);
const duplicateNumbers = new Set([
  403,408,411,412,422,443,451,473,531,532,546,552,579,586,594
]);

function contribution(number, record) {
  if (number === 404) return "Responses API 的统一输入、工具、状态和输出契约";
  if ([409,410].includes(number)) return "Responses SSE 与 WebSocket 事件协议";
  if (number === 441) return "Webhook 事件类型及载荷协议";
  if ([446,448,469,484,485,487,492,493,496,498,500,502,503,506,507,508,510,545,558,559,571,572,573,577,597].includes(number)) return "Agent 身份、权限、沙箱、安全或治理边界";
  if ([447,450,462,463,474,476,481,483,518,519,528].includes(number)) return "Agent 配置、记忆、技能、插件与扩展机制";
  if ([456,465,468,471,514,515,516,517,525,529,538,541,568,598].includes(number)) return "编码 Agent 的运行环境、自动化或集成机制";
  if ([460,461,470,520,535,537].includes(number)) return "可复用工作流、评审或运行方法";
  if ([494,513,539].includes(number)) return "产品运行面、模型可用性与选型边界";
  if ([560].includes(number)) return "代码安全分析与修复工作流";
  if (number === 595) return "网站向 Agent 暴露能力的 WebMCP 机制";
  if ([599,600].includes(number)) return "插件 UI 协议与发布安全要求";
  return record.description || "关键官方实现资料";
}

function reject(number, record) {
  if (obsoleteNumbers.has(number)) {
    return { decision:"rejected-obsolete-or-sunset", currentStatus:"obsolete", reason:"对应 API 或功能已经关闭、弃用或由当前主路径替代，且本页不承担必要迁移作用。" };
  }
  if (navigationNumbers.has(number)) {
    return { decision:"rejected-navigation-or-feed", currentStatus:"current", reason:"这是聚合手册、栏目总览、目录或持续更新的信息流，适合发现资料但不形成独立知识卡。" };
  }
  if (duplicateNumbers.has(number)) {
    return { decision:"rejected-duplicate-knowledge", currentStatus:"current", reason:"关键知识已由当前更完整的指南或本批主资料覆盖，产品入口或协议变体不重复建卡。" };
  }
  const value = `${record.title} ${record.canonicalUrl}`.toLowerCase();
  if (record.setId === "api-reference") {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"这是单个 CRUD 方法、参数或窄资源查询页；有查表价值，但不足以成为独立知识卡。" };
  }
  if (/quickstart|faq|settings|commands|pricing|notifications|changelog|setup|install|pets|videos$/.test(value)) {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"内容主要用于首次设置、界面操作、问题查询或状态查看，没有不可替代的技术知识增量。" };
  }
  return { decision:"rejected-low-importance", currentStatus:"current", reason:"页面当前可用，但主要是产品操作、单一集成或局部工作流，未达到独立建卡的重要性门槛。" };
}

function inferNodes(number, record) {
  const contributionText = contribution(number, record);
  if (/安全|权限|身份|治理|沙箱/.test(contributionText)) return ["agent-identity-access","guardrails"];
  if (/事件协议|Webhook/.test(contributionText)) return ["streaming","observability"];
  if (/记忆|技能|插件|扩展/.test(contributionText)) return ["agent-skills","agent-memory"];
  if (/运行环境|自动化|集成/.test(contributionText)) return ["coding-tools","deployment"];
  if (/模型可用性|选型/.test(contributionText)) return ["model-selection","model-families"];
  if (/代码安全/.test(contributionText)) return ["code-generation","red-teaming"];
  if (/WebMCP/.test(contributionText)) return ["mcp","tool-calling"];
  if (/插件 UI/.test(contributionText)) return ["mcp-architecture","agent-frameworks"];
  if (/Responses/.test(contributionText)) return ["agent-loop","tool-calling"];
  return ["workflow-orchestration","agent"];
}

function makeId(record) {
  const prefix = record.setId.replace(/[^a-z0-9]+/g, "-");
  const pathSlug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-6).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `openai-importance-${prefix}-${pathSlug}`;
}

const existingByUrl = new Map(window.PRO_LIBRARY.items
  .filter(item => item.sourceClass === "official" && item.sourceSubcategory === "openai")
  .map(item => [canonicalize(item.url), item]));

const records = selected.map((record, offset) => {
  const sequence = 401 + offset;
  const accepted = admittedNumbers.has(sequence);
  const result = accepted
    ? {
        decision:admittedCore.has(sequence) ? "admitted-core" : admittedTransition.has(sequence) ? "admitted-transition" : "admitted-supporting",
        currentStatus:admittedTransition.has(sequence) ? "transition" : "current",
        reason:admittedCore.has(sequence)
          ? "直接承担核心协议、运行边界、安全治理或技术选型作用，具有持续复用价值。"
          : admittedTransition.has(sequence)
            ? "旧能力已经移除，但该页仍是迁移到当前替代方案的直接操作依据，按过渡资料收录。"
            : "提供正确配置、集成、安全控制或生产运行所需的关键细节，缺失会影响实际决策。"
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
    replacementCheck:accepted ? "未被现有主资料完整替代；承担独立协议、边界或决策作用" : "不满足重要性门槛或已有更合适的主资料",
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
    id:"openai-importance-batch-03",
    source:"official/openai",
    reviewedAt,
    candidateCount:200,
    selection:"冻结母集中第 401-600 份独立候选",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡"
  },
  records,
  admittedObjectIds:admitted.map(record => record.id),
  summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record.sequence, record) }));
const js = `/* Generated from openai-importance-batch-03.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  const supersededUrls=new Set(["https://developers.openai.com/api/reference/resources/beta/subresources/responses/websocket-events"]);\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!supersededUrls.has(item.url));\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"openai",title:row.title,publisher:"OpenAI",collection:"OpenAI 官方技术资料",contentKind:row.setId==="api-reference"?"API Reference":row.setId==="plugins"?"插件开发文档":"产品与开发文档",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 OpenAI 的实现与声明","使用前应复核页面状态和版本"],tags:["openai","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"openai-importance-batch-03",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","替代路径变化"]:[]}));\n})();\n`;
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
