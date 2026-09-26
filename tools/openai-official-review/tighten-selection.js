"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const batchPaths = [1, 2, 3, 4, 5].map(number =>
  path.join(PROJECT_ROOT, "proposals", "official-technical", `openai-importance-batch-0${number}.json`)
);
const inventoryPath = path.join(
  PROJECT_ROOT,
  "proposals",
  "official-technical",
  "openai-rereview-inventory-20260924.json"
);

const supportingSets = new Set(["cookbook", "developer-blog", "learning-resources"]);
const topicCategoryByContribution = new Map([
  ["Agent 身份、权限、沙箱、安全或治理边界", "security-governance"],
  ["安全、权限或合规边界", "security-governance"],
  ["身份、安全、隐私或人类审批边界", "security-governance"],
  ["身份、密钥与隐私安全边界", "security-governance"],
  ["Agent、工具与执行机制", "responses-agents-tools"],
  ["关键 API 实现机制", "responses-agents-tools"],
  ["检索与文件知识处理", "responses-agents-tools"],
  ["Embedding 表示及其检索、聚类用途", "responses-agents-tools"],
  ["联网检索工具的能力与使用边界", "responses-agents-tools"],
  ["长链 Agent 工作流的 WebSocket 复用与低延迟机制", "responses-agents-tools"],
  ["Responses API 的统一输入、工具、状态和输出契约", "responses-agents-tools"],
  ["Responses SSE 与 WebSocket 事件协议", "responses-agents-tools"],
  ["编码 Agent 的运行环境、自动化或集成机制", "codex-engineering"],
  ["可复用工作流、评审或运行方法", "codex-engineering"],
  ["编码 Agent 的工程、评审与隔离工作流", "codex-engineering"],
  ["长任务的上下文、记忆与持续执行机制", "codex-engineering"],
  ["产品运行面、模型可用性与选型边界", "codex-engineering"],
  ["代码安全分析与修复工作流", "codex-engineering"],
  ["插件、MCP、技能与工具编排机制", "mcp-plugins-skills"],
  ["Agent 配置、记忆、技能、插件与扩展机制", "mcp-plugins-skills"],
  ["MCP 服务端工具、传输和鉴权实现", "mcp-plugins-skills"],
  ["插件 UI 协议与发布安全要求", "mcp-plugins-skills"],
  ["网站向 Agent 暴露能力的 WebMCP 机制", "mcp-plugins-skills"],
  ["生产决策、可靠性或故障处理", "production-observability"],
  ["异步事件投递、验签、重试与幂等处理", "production-observability"],
  ["Webhook 事件类型及载荷协议", "production-observability"],
  ["Responses 运行协议、成本与资源控制", "production-observability"],
  ["可复用的官方实现或生产方法", "production-observability"],
  ["语音与实时交互机制", "multimodal-realtime"],
  ["视觉生成、理解与溯源", "multimodal-realtime"],
  ["视觉理解模型的监督微调方法", "multimodal-realtime"],
  ["语音 Agent 的架构、传输与交互控制", "multimodal-realtime"],
  ["GPT-Live 主通道、分支与侧带 WebSocket 协议", "multimodal-realtime"],
  ["Realtime 客户端与服务端事件模型", "multimodal-realtime"],
  ["实时语音系统的实现与评测方法", "multimodal-realtime"],
  ["评测与模型优化方法", "evals-finetuning"],
  ["可复用评测、验证与持续改进方法", "evals-finetuning"],
  ["模型优化、提示与能力适配方法", "evals-finetuning"],
  ["提示、上下文与输出控制", "models-prompting-output"],
  ["选型与能力边界", "models-prompting-output"],
  ["模型能力、上下文与成本的官方比较证据", "models-prompting-output"],
  ["迁移与生命周期决策", "migration-lifecycle"],
  ["当前技术路径的必要迁移与替代关系", "migration-lifecycle"],
  ["Agent 商业交易、支付与商品数据协议", "agentic-commerce"]
]);
const mergeTargets = new Map([
  [728, "openai-agents-overview"],
  [729, "openai-agents-overview"],
  [737, "openai-importance-plugins-plugins-reference"],
  [742, "openai-importance-api-reference-api-reference-resources-responses-methods-create"],
  [744, "openai-structured-outputs"]
]);
const transitionReviews = new Map([
  [8,   { recheckAt:"2026-12-31", trigger:"Assistants 迁移路径或关闭状态变化" }],
  [109, { recheckAt:"2026-12-31", trigger:"Agent Builder 替代路径或旧对象状态变化" }],
  [110, { recheckAt:"2026-12-31", trigger:"Prompt objects 替代路径或旧对象状态变化" }],
  [111, { recheckAt:"2026-12-31", trigger:"GPT-Live 迁移接口或兼容窗口变化" }],
  [112, { recheckAt:"2026-12-31", trigger:"Responses API 迁移路径或旧接口状态变化" }],
  [538, { recheckAt:"2026-12-31", trigger:"Codex MCP server 移除说明不再承担迁移用途" }],
  [716, { recheckAt:"2027-03-31", trigger:"Claude Agent SDK 迁移方案或 OpenAI Agents SDK 接口变化" }],
  [717, { recheckAt:"2027-03-31", trigger:"Whisper 与 GPT-Transcribe 推荐迁移路径变化" }],
  [719, { recheckAt:"2026-11-30", trigger:"旧 OpenAI Evals 关闭窗口结束或 Promptfoo 迁移页失效" }]
]);

function loadPublishedOpenAI() {
  global.window = {};
  require(path.join(PROJECT_ROOT, "data", "graph.js"));
  require(path.join(PROJECT_ROOT, "data", "software.js"));
  require(path.join(PROJECT_ROOT, "data", "library.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
  for (let number = 1; number <= 5; number += 1) {
    require(path.join(PROJECT_ROOT, "data", `library-official-openai-importance-0${number}.js`));
  }
  return window.PRO_LIBRARY.items.filter(item =>
    item.sourceClass === "official" && item.sourceSubcategory === "openai"
  );
}

function summarize(records) {
  return records.reduce((summary, record) => {
    summary[record.decision] = (summary[record.decision] || 0) + 1;
    if (record.decision.startsWith("admitted-")) summary.admitted += 1;
    else summary.rejected += 1;
    return summary;
  }, { reviewed:records.length, admitted:0, rejected:0 });
}

function reject(record, action, reason, extra = {}) {
  if (record.decision.startsWith("admitted-")) record.previousDecision = record.decision;
  record.decision = action === "merged" ? "rejected-duplicate-knowledge" : "rejected-low-importance";
  record.currentStatus = "current";
  record.matrixContribution = "无足够的独立重要贡献";
  record.replacementCheck = action === "merged"
    ? "已并入同主题的当前主资料，不再单独建卡"
    : "不满足收紧后的知识对应或默认精选门槛";
  record.reason = reason;
  record.tighteningAction = action;
  Object.assign(record, extra);
  delete record.comparedWith;
  delete record.uniqueDelta;
  delete record.recheckAt;
  delete record.recheckTriggers;
}

function titleTokens(record) {
  return new Set(`${record.title} ${record.description || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 3));
}

function comparisonScore(record, candidate) {
  let score = 0;
  const nodes = new Set(record.linkedNodes || []);
  const overlap = (candidate.linkedNodes || []).filter(node => nodes.has(node)).length;
  score += overlap * 12;
  if (record.matrixContribution === candidate.matrixContribution) score += 7;
  if (record.setId === candidate.setId) score += 4;
  if (record.section === candidate.section) score += 2;
  const tokens = titleTokens(record);
  score += [...titleTokens(candidate)].filter(token => tokens.has(token)).length;
  score += Math.max(0, 2 - Math.abs(record.sequence - candidate.sequence) / 200);
  return score;
}

function contentKind(record) {
  if (record.setId === "api-reference") return "API Reference";
  if (record.setId === "cookbook") return "官方工程案例";
  if (record.setId === "developer-blog") return "官方技术文章";
  if (record.setId === "plugins") return "插件开发文档";
  if (record.setId === "commerce") return "商业协议文档";
  if (record.setId === "chatgpt-codex") return "产品与开发文档";
  return "开发者指南";
}

function generateDataFile(batch, batchNumber, mergedByTarget) {
  const rows = batch.records.filter(record => record.decision.startsWith("admitted-")).map(record => ({
    ...record,
    mergedFrom:mergedByTarget.get(record.id) || []
  }));
  const prelude = batchNumber === 1
    ? '  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="openai"));\n'
    : "";
  const js = `/* Generated from ${batch.batch.id}.json by tighten-selection.js. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n${prelude}  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"openai",sourceSet:row.setId,primaryCategory:row.primaryCategory,topicTags:[row.primaryCategory],title:row.title,publisher:"OpenAI",collection:"OpenAI 官方技术资料",contentKind:row.contentKind||${contentKind.toString()}(row),authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${REVIEWED_AT}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 OpenAI 的实现与声明","使用前应复核页面状态和版本"],tags:["openai","官方技术资料",row.matrixContribution,row.primaryCategory],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${REVIEWED_AT}",reviewBatch:"${batch.batch.id}",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),contentTier:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,valueScore:row.valueScore||null,scoreBatch:row.scoreBatch||"",comparedWith:row.comparedWith||[],uniqueDelta:row.uniqueDelta||"",mergedFrom:row.mergedFrom||[],recheckAt:row.recheckAt||"",recheckTriggers:row.recheckTriggers||[]}));\n})();\n`;
  fs.writeFileSync(
    path.join(PROJECT_ROOT, "data", `library-official-openai-importance-0${batchNumber}.js`),
    js,
    "utf8"
  );
}

const published = loadPublishedOpenAI();
const publishedById = new Map(published.map(item => [item.id, item]));
const batches = batchPaths.map(file => JSON.parse(fs.readFileSync(file, "utf8")));
const allRecords = batches.flatMap(batch => batch.records);
const byId = new Map(allRecords.map(record => [record.id, record]));

/* Persist the node links that were previously added only while generating browser data. */
allRecords.forEach(record => {
  const publishedItem = publishedById.get(record.id);
  if (publishedItem && Array.isArray(publishedItem.linkedNodes)) {
    record.linkedNodes = [...publishedItem.linkedNodes];
  } else if (!Array.isArray(record.linkedNodes)) {
    record.linkedNodes = [];
  }
});

/* 1. Ads are outside the tightened AI knowledge scope. */
allRecords.filter(record => record.setId === "ads" && record.decision.startsWith("admitted-")).forEach(record => {
  reject(record, "removed-ads", "广告投放、账户、受众与归因属于产品运营技术，不进入 AI 专业知识默认资料库；原决定保留在审计记录中。");
});

/* 3. Merge language variants and starter/sample repositories into the canonical topic card. */
for (const [sequence, targetId] of mergeTargets) {
  const record = allRecords.find(entry => entry.sequence === sequence);
  const target = byId.get(targetId);
  if (!record || !target || !target.decision.startsWith("admitted-")) {
    throw new Error(`Invalid merge mapping ${sequence} -> ${targetId}`);
  }
  reject(
    record,
    "merged",
    `该 SDK 语言版本、快速实现或示例仓库由“${target.title}”主资料统一承载，不再作为平级独立卡片。`,
    { mergedInto:targetId }
  );
}

/* 4. Recipes and editorial resources remain available, but never outrank normative guides by default. */
allRecords.filter(record => record.decision === "admitted-core" && supportingSets.has(record.setId)).forEach(record => {
  record.previousDecision = record.decision;
  record.decision = "admitted-supporting";
  record.tighteningAction = "downgraded-to-supporting";
  record.reason = `作为${record.setId === "cookbook" ? "工程配方" : record.setId === "developer-blog" ? "技术文章" : "学习资源"}保留实现价值，但默认降为补充层；核心行为与长期契约仍以主指南和正式参考为准。`;
});

/* 6. Every transition card receives a concrete editorial review date and trigger. */
allRecords.filter(record => record.decision === "admitted-transition").forEach(record => {
  const review = transitionReviews.get(record.sequence);
  if (!review) throw new Error(`Missing transition review date for sequence ${record.sequence}`);
  record.recheckAt = review.recheckAt;
  record.recheckTriggers = [review.trigger, "替代页面、关闭日期或兼容范围变化"];
});

/* 7. Give every published OpenAI card one stable, browseable knowledge category. */
allRecords.forEach(record => {
  if (!record.decision.startsWith("admitted-")) {
    delete record.primaryCategory;
    return;
  }
  const category = topicCategoryByContribution.get(record.matrixContribution);
  if (!category) throw new Error(`Missing OpenAI topic category for ${record.id}: ${record.matrixContribution}`);
  record.primaryCategory = category;
});

/* 5. Compare every remaining core card with its closest admitted peers and state its concrete delta. */
const admitted = allRecords.filter(record => record.decision.startsWith("admitted-"));
allRecords.filter(record => record.decision === "admitted-core").forEach(record => {
  const comparisons = admitted
    .filter(candidate => candidate.id !== record.id)
    .map(candidate => ({ candidate, score:comparisonScore(record, candidate) }))
    .filter(entry => entry.score >= 12)
    .sort((a, b) => b.score - a.score || a.candidate.sequence - b.candidate.sequence)
    .slice(0, 2)
    .map(entry => entry.candidate);
  if (!comparisons.length) throw new Error(`No meaningful comparison candidate for core record ${record.id}`);
  record.comparedWith = comparisons.map(candidate => candidate.id);
  const comparisonTitles = comparisons.map(candidate => `《${candidate.title}》`).join("、");
  record.uniqueDelta = `相较于${comparisonTitles}，本资料以“${record.title}”为独立主题，补充的不可替代范围是：${record.description}`;
});

const mergedByTarget = new Map();
allRecords.filter(record => record.mergedInto).forEach(record => {
  if (!mergedByTarget.has(record.mergedInto)) mergedByTarget.set(record.mergedInto, []);
  mergedByTarget.get(record.mergedInto).push({
    id:record.id,
    title:record.title,
    url:record.canonicalUrl,
    reason:record.reason
  });
});

batches.forEach((batch, index) => {
  batch.records.forEach(record => {
    if (record.decision.startsWith("admitted-")) record.contentTier = record.decision.replace("admitted-", "");
    else delete record.contentTier;
  });
  batch.admittedObjectIds = batch.records.filter(record => record.decision.startsWith("admitted-")).map(record => record.id);
  batch.summary = summarize(batch.records);
  batch.tightening = {
    policy:"official-technical-importance-v2-tightened",
    appliedAt:REVIEWED_AT,
    actions:["remove-ads", "linked-nodes-optional", "merge-topic-variants", "downgrade-editorial-resources", "document-core-deltas", "date-transition-reviews", "classify-openai-topics"]
  };
  fs.writeFileSync(batchPaths[index], `${JSON.stringify(batch, null, 2)}\n`, "utf8");
  generateDataFile(batch, index + 1, mergedByTarget);
});

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const decisionByUrl = new Map(allRecords.map(record => [record.canonicalUrl, record]));
inventory.records.forEach(record => {
  if (record.duplicateOf) {
    record.reviewStatus = "ineligible-duplicate-route";
    record.reviewReason = "同一内容的重复路由；只审核并发布规范地址。";
    delete record.cardId;
    delete record.contentTier;
    delete record.mergedInto;
    return;
  }
  if (record.reviewStatus === "ineligible-container-or-combined-export") return;
  const decision = decisionByUrl.get(record.canonicalUrl);
  if (!decision) return;
  record.reviewStatus = decision.decision;
  record.reviewReason = decision.reason;
  record.reviewBatch = batches.find(batch => batch.records.some(item => item.id === decision.id)).batch.id;
  if (decision.decision.startsWith("admitted-")) {
    record.cardId = decision.id;
    record.contentTier = decision.contentTier;
    record.primaryCategory = decision.primaryCategory;
  } else {
    delete record.cardId;
    delete record.contentTier;
    delete record.primaryCategory;
  }
  if (decision.mergedInto) record.mergedInto = decision.mergedInto;
  else delete record.mergedInto;
});
const eligibleInventory = inventory.records.filter(record =>
  !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
);
inventory.summary.admitted = eligibleInventory.filter(record => record.reviewStatus.startsWith("admitted-")).length;
inventory.summary.rejectedAfterContentReview = eligibleInventory.filter(record => record.reviewStatus.startsWith("rejected-")).length;
inventory.summary.pendingContentReview = eligibleInventory.filter(record => record.reviewStatus === "pending-importance-review").length;
inventory.tightening = {
  appliedAt:REVIEWED_AT,
  admitted:inventory.summary.admitted,
  rejectedAfterContentReview:inventory.summary.rejectedAfterContentReview
};
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

const finalCounts = admitted.reduce((counts, record) => {
  if (!record.decision.startsWith("admitted-")) return counts;
  counts[record.contentTier] = (counts[record.contentTier] || 0) + 1;
  return counts;
}, {});
process.stdout.write(`${JSON.stringify({
  admitted:allRecords.filter(record => record.decision.startsWith("admitted-")).length,
  rejected:allRecords.filter(record => record.decision.startsWith("rejected-")).length,
  tiers:finalCounts,
  merged:[...mergeTargets.keys()].length,
  adsRemoved:allRecords.filter(record => record.tighteningAction === "removed-ads").length,
  transitionsDated:allRecords.filter(record => record.decision === "admitted-transition" && record.recheckAt).length
}, null, 2)}\n`);
