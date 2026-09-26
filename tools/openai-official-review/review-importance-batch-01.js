/* Re-audit the first 200 OpenAI candidates with importance as a hard gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-rereview-inventory-20260924.json");
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-01.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-openai-importance-01.js");
const inventory = require(inventoryPath);

global.window = { PRO_LIBRARY: { items: [] } };
require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));

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
const selected = eligible.slice(0, 200);
if (selected.length !== 200) throw new Error(`Importance batch 01 must contain 200 candidates, got ${selected.length}`);

/* Explicit human editorial decision set. An independent page is not automatically useful. */
const admittedNumbers = new Set([
  3,4,6,8,12,15,17,19,20,21,24,25,26,27,28,30,31,33,36,38,39,40,41,43,44,
  54,55,56,58,59,60,61,62,64,65,67,69,72,73,74,75,76,77,78,79,80,82,85,86,
  89,90,91,93,94,96,97,99,100,101,105,107,108,109,110,111,112,113,116,119,120,
  121,122,124,125,126,127,129,130,131,132,133,134,135,136,140,141,143,145,147,
  148,149,150,152,153,154,155,156,157,158,160,161,162,164,165,166,167,168,169,
  170,171,172,173,174,175,176,177,179,180,182,184,185,186,199
]);
const transitionNumbers = new Set([8,109,110,111,112]);
const supportingNumbers = new Set([
  3,6,15,17,24,25,27,30,31,33,36,40,44,56,58,59,60,61,62,65,69,73,74,75,77,
  78,80,91,93,96,97,100,105,108,122,124,125,126,130,131,132,134,135,141,143,
  145,148,149,150,155,156,158,165,167,168,169,170,172,173,177,182,184,185,186
]);

function rejection(record, number) {
  const value = `${record.title} ${record.canonicalUrl}`.toLowerCase();
  if ([18,42,70,71,88,123,139,142,151,163,183,187,188,189,191,192,193,194,195,196,197,198].includes(number)) {
    return { decision:"rejected-obsolete-or-sunset", currentStatus:"obsolete", reason:"相关产品、评测平台、模型代际或实现路径已经弃用、临近关闭或被当前主路径替代，剩余价值不足以单独建卡。" };
  }
  if ([5,10,11,13,23,115,200].includes(number)) {
    return { decision:"rejected-navigation-or-feed", currentStatus:"current", reason:"这是目录、总览导航或持续更新的信息流，不形成一个可稳定复用的独立知识结论。" };
  }
  if ([1,7,29,46,57,83,104,106,118,137].includes(number)) {
    return { decision:"rejected-duplicate-knowledge", currentStatus:"current", reason:"其重要知识已被本批更完整的主资料覆盖，新增内容主要是特定产品入口或实现变体，不再重复建卡。" };
  }
  if (/quickstart|getting-started/.test(value)) {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"快速开始适合首次操作，但没有提供足以长期复用的机制、决策或故障知识，不单独建卡。" };
  }
  if (/providers|terraform|chatkit|calculator|ip-addresses|partner-integrations|frontend-prompt|theming/.test(value)) {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"内容主要是单一界面、供应商或配置变体；对知识矩阵的边际贡献不足，不单独建卡。" };
  }
  return { decision:"rejected-low-importance", currentStatus:"current", reason:"页面虽独立且可用，但主要提供浅层操作、查询或品牌功能事实，未达到官方技术资料的重要性门槛。" };
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/migrat|deprecat/.test(value)) return "迁移与生命周期决策";
  if (/safety|security|guardrail|moderation|csam|under-18|misalignment|privacy|data controls|rbac|identity|certificate|allowlist/.test(value)) return "安全、权限或合规边界";
  if (/best practice|optimization|cost|latency|rate limit|spend|diagnostic|production|checklist|error/.test(value)) return "生产决策、可靠性或故障处理";
  if (/compare|selection|models in amazon|reasoning|deep research/.test(value)) return "选型与能力边界";
  if (/agent|tool|function|mcp|shell|sandbox|computer|skill|orchestration/.test(value)) return "Agent、工具与执行机制";
  if (/eval|fine-tun|preference|red team|grader/.test(value)) return "评测与模型优化方法";
  if (/prompt|structured|citation|compaction|conversation|state|stream/.test(value)) return "提示、上下文与输出控制";
  if (/audio|voice|speech|transcri|realtime|sip/.test(value)) return "语音与实时交互机制";
  if (/image|vision|provenance/.test(value)) return "视觉生成、理解与溯源";
  if (/retriev|file search|file input/.test(value)) return "检索与文件知识处理";
  return "关键 API 实现机制";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/identity|auth|permission|rbac|certificate|allowlist|private-link|data controls/.test(value)) return ["agent-identity-access","privacy"];
  if (/safety|guardrail|moderation|csam|under-18|misalignment|red team/.test(value)) return ["guardrails","red-teaming"];
  if (/audio|voice|speech|transcri|realtime|sip/.test(value)) return ["speech","streaming"];
  if (/image|vision/.test(value)) return ["multimodal","image-generation"];
  if (/eval|fine-tun|preference/.test(value)) return ["model-evaluation","fine-tuning"];
  if (/retriev|file search|file input/.test(value)) return ["retrieval","rag"];
  if (/prompt cache/.test(value)) return ["prompt-caching","inference-optimization"];
  if (/prompt|citation|structured/.test(value)) return ["prompt-engineering","structured-output"];
  if (/compaction|conversation|state/.test(value)) return ["context-compaction","agent-memory"];
  if (/reasoning|model selection|amazon bedrock|deep research/.test(value)) return ["model-selection","reasoning-models"];
  if (/computer use/.test(value)) return ["computer-use","agent"];
  if (/code|apply patch|shell|sandbox/.test(value)) return ["code-execution","coding-tools"];
  if (/agent|tool|function|mcp|skill|orchestration/.test(value)) return ["agent","tool-calling"];
  return ["deployment"];
}

function makeId(record) {
  const pathSlug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-5).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `openai-importance-${pathSlug}`;
}

const baselineByUrl = new Map(window.PRO_LIBRARY.items
  .filter(item => item.sourceClass === "official" && item.sourceSubcategory === "openai")
  .map(item => [canonicalize(item.url), item]));

const records = selected.map((record, index) => {
  const number = index + 1;
  const accepted = admittedNumbers.has(number);
  const result = accepted
    ? {
        decision: transitionNumbers.has(number) ? "admitted-transition" : supportingNumbers.has(number) ? "admitted-supporting" : "admitted-core",
        currentStatus: transitionNumbers.has(number) ? "transition" : "current",
        reason: transitionNumbers.has(number)
          ? "当前仍能直接指导迁移，且替代关系影响现有系统；按过渡资料收录并设置复核触发点。"
          : supportingNumbers.has(number)
            ? "补充关键实现、生产约束或安全边界，虽然不是主题总览，但会影响正确使用、排错或选型。"
            : "直接解释知识矩阵中的核心机制、能力边界或工程决策，具有持续复用价值。"
      }
    : rejection(record, number);
  const existing = baselineByUrl.get(record.canonicalUrl);
  return {
    sequence:number,
    id:existing?.id || makeId(record),
    title:record.title,
    url:record.url,
    canonicalUrl:record.canonicalUrl,
    setId:record.setId,
    section:record.section,
    description:record.description,
    matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
    replacementCheck:accepted ? "未被本批其他主资料完整替代" : "不满足重要性门槛或已有更合适的主资料",
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
    id:"openai-importance-batch-01",
    source:"official/openai",
    reviewedAt,
    candidateCount:200,
    selection:"官方母集按原始目录顺序排除容器和重复路由后的前 200 份",
    hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡"
  },
  records,
  admittedObjectIds:admitted.map(record => record.id),
  summary
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

/* This overlay deliberately removes every prior OpenAI card before adding v2-approved cards. */
const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
const js = `/* Generated from openai-importance-batch-01.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="openai"));\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"openai",title:row.title,publisher:"OpenAI",collection:"OpenAI 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 OpenAI 的实现与声明","使用前应复核页面状态和版本"],tags:["openai","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"openai-importance-batch-01",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","替代路径或关闭日期变化"]:[]}));\n})();\n`;
fs.writeFileSync(dataPath, js, "utf8");

/* Reset the inventory to the new audit authority. */
const decisionByUrl = new Map(records.map(record => [record.canonicalUrl, record]));
for (const record of inventory.records) {
  if (record.duplicateOf) {
    record.reviewStatus = "ineligible-duplicate-route";
  } else if (record.reviewStatus === "ineligible-container-or-combined-export") {
    // Structural exclusion remains valid across mechanisms.
  } else {
    const decision = decisionByUrl.get(record.canonicalUrl);
    record.reviewStatus = decision ? decision.decision : "pending-importance-review";
    record.reviewReason = decision ? decision.reason : "等待按官方技术资料重要性机制逐份审核。";
    if (decision) {
      record.reviewBatch = audit.batch.id;
      if (decision.decision.startsWith("admitted-")) record.cardId = decision.id;
      else delete record.cardId;
    } else {
      delete record.reviewBatch;
      delete record.cardId;
    }
  }
}
inventory.policy = audit.policy;
inventory.policyVersion = audit.policyVersion;
inventory.batch = { ...inventory.batch, status:"in-progress", rule:audit.batch.hardGate };
inventory.summary.uniqueContentCandidates = eligible.length;
inventory.summary.admitted = admitted.length;
inventory.summary.rejectedAfterContentReview = records.length - admitted.length;
inventory.summary.pendingContentReview = eligible.length - records.length;
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ summary, inventory:inventory.summary })}\n`);
