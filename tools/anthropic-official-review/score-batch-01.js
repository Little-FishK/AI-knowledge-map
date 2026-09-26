/* Score the first 60 admitted Anthropic resources with the shared 10-point value gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const POLICY = "anthropic-official-value-score-v1";
const SCORE_BATCH = "anthropic-value-score-batch-01";
const auditPaths = [1, 2, 3, 4].map(number => path.join(
  PROJECT_ROOT, "proposals", "official-technical", `anthropic-importance-batch-0${number}.json`
));
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${SCORE_BATCH}.json`);
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json");

const scoreDefinitions = [
  [3,2,2,1,"定义可复用 Agent Skills 的组织与装载机制，是代理能力封装的核心知识，适用面较广。"],
  [1,1,1,1,"主要是平台功能入口，缺少不可替代的独立机制说明，容易被各主题主指南替代。"],
  [2,3,1,1,"MCP tunnels 的连接模型具有官方独有性，但仍属于较窄且可能演进的部署能力。"],
  [3,3,2,2,"工具调用协议是构建 Claude Agent 的基础机制，兼具不可替代性、稳定性与广泛适用性。"],
  [2,1,1,1,"Advisor tool 属于单一辅助工具，知识可由通用工具定义和使用指南大部分覆盖。"],
  [3,3,1,1,"解释 MCP tunnels 的组件与信任边界，对正确部署不可替代，但适用范围集中于该能力。"],
  [3,3,2,1,"认证与密钥边界直接影响生产安全，只能以官方契约为准，具有长期工程价值。"],
  [2,2,1,1,"Bash 工具的执行契约有独立价值，但主要服务代码执行类 Agent，范围相对有限。"],
  [2,2,2,2,"批处理的异步执行、成本和结果获取机制稳定，并适用于大量离线推理工作负载。"],
  [2,2,1,1,"浏览器工具的交互契约不可由普通工具调用完全替代，但适用面集中于浏览器 Agent。"],
  [2,2,1,1,"缓存诊断能直接解释命中失败与成本异常，但属于提示缓存主指南的排障补充。"],
  [3,3,2,1,"引用块及其可追溯语义是检索型应用的关键证据契约，官方说明不可替代。"],
  [2,3,0,1,"旧版 Bedrock 路径仍能支持迁移判断，但持久价值会随兼容窗口结束而快速下降。"],
  [3,3,2,1,"代码执行的容器、文件与安全边界是 Agent 系统的核心机制，官方契约不可替代。"],
  [2,2,1,1,"说明压缩后 thinking block 的有效性要求，知识较窄但会直接影响多轮请求正确性。"],
  [3,3,2,1,"上下文压缩机制决定长任务连续性和成本，是长链 Agent 的核心工程知识。"],
  [3,3,2,1,"计算机使用的动作、截图和安全边界构成独立代理协议，具有较高不可替代性。"],
  [3,2,2,1,"上下文编辑直接影响长会话状态控制，机制重要且相对稳定，但主要服务长任务。"],
  [3,2,2,2,"上下文窗口和 token 行为是所有 Claude 应用的基础约束，适用范围广且长期有效。"],
  [2,1,1,1,"坐标与边界框属于视觉输入的局部操作细节，可由更完整的视觉与工具文档覆盖。"],
  [3,3,2,2,"工具 schema、描述和调用约束是工具系统的基础契约，广泛且长期适用。"],
  [2,3,1,2,"Effort 对成本、延迟与推理深度选型具有官方独有性，适用于多数推理工作负载。"],
  [1,2,1,1,"主要说明外部 embedding 选择与接入，缺少 Anthropic 自有的核心表示机制。"],
  [2,3,0,1,"旧版 extended thinking 对兼容迁移仍不可替代，但已被当前 thinking 路径取代。"],
  [2,2,2,2,"Files API 的上传、引用和生命周期机制适用于多类文档应用，具有稳定工程价值。"],
  [2,2,1,1,"细粒度工具流式传输解决参数延迟问题，但属于工具流式协议的专项优化。"],
  [2,2,1,1,"流式拒绝处理会影响安全响应的完整性，但主要是拒绝与流式主机制的补充。"],
  [3,3,2,2,"解释工具选择、调用、结果回传与循环，是 Claude 工具系统最核心的运行机制。"],
  [3,2,2,1,"工具上下文管理直接影响长链代理的可靠性与成本，具有可复用工程价值。"],
  [3,3,2,1,"MCP connector 的传输与授权契约是 Claude 接入远程工具的官方主路径。"],
  [2,1,1,1,"MCP tunnels 参数参考主要服务查表操作，独立知识增量和跨场景适用性有限。"],
  [3,3,2,1,"MCP tunnels 的认证、暴露面和信任边界属于高风险部署的关键官方安全知识。"],
  [3,2,2,1,"Memory tool 的持久化接口与使用边界是长任务代理的重要机制，但范围集中于 Agent。"],
  [3,2,2,1,"会话中途修改系统消息和工具会影响代理状态与控制权，是独立且重要的运行机制。"],
  [2,2,2,2,"并行工具调用的调度与结果组织可提升大量 Agent 工作流效率，适用范围较广。"],
  [2,2,1,1,"PDF 解析与视觉处理边界具有实用价值，但主要是多模态输入的一种文件形式。"],
  [2,2,1,1,"保留 thinking 的规则会影响多轮推理正确性，但属于当前 thinking 工作流的专项细节。"],
  [3,2,2,1,"程序化工具调用把执行控制交给代码，形成不同于普通工具循环的重要编排机制。"],
  [3,3,2,1,"提示缓存的前缀规则、命中条件和计费影响生产成本，是官方不可替代的核心机制。"],
  [3,2,2,1,"拒绝与 fallback 的结构化处理直接影响可靠性和安全，是生产集成的重要边界。"],
  [3,2,2,1,"远程 MCP 服务器的连接与信任模型是外部工具生态的重要实现路径。"],
  [2,2,1,1,"搜索结果块提供来源语义和结果组织价值，但属于检索与引用体系的补充能力。"],
  [3,2,2,1,"服务端工具的执行责任与生命周期是托管工具选型和安全设计的重要依据。"],
  [3,2,2,1,"Skill 编写原则直接影响可发现性、可靠性和安全性，可跨多种代理任务复用。"],
  [1,2,1,1,"企业 Skills 页面侧重组织启用与产品治理，独立技术机制和普适知识增量不足。"],
  [2,3,1,2,"thinking 的引导和成本控制直接影响质量、预算与延迟，具有官方独有的选型价值。"],
  [3,2,2,1,"stop reason 是可靠状态机和 fallback 的基础信号，对生产错误处理十分关键。"],
  [3,3,2,2,"消息流事件、增量内容和错误语义是低延迟 Claude 应用的基础协议。"],
  [3,2,2,1,"严格工具约束能把 schema 一致性转化为运行保证，是可靠工具系统的重要机制。"],
  [3,3,2,2,"结构化输出的 schema 保证和失败语义是可靠数据集成的核心契约。"],
  [2,3,1,1,"Task budgets 提供不可替代的代理预算控制，但仍为 beta 且主要适用于长任务。"],
  [2,2,1,1,"文本编辑器的命令与状态契约支持编码代理，但可适用范围集中于文件编辑。"],
  [3,3,2,1,"Thinking 总览定义当前推理控制主路径，是理解模型行为与成本边界的核心资料。"],
  [3,3,2,1,"工具与多轮场景中的 thinking 保留规则直接决定代理循环的正确性。"],
  [2,2,1,1,"Token counting 是预算与截断控制的实用基础，但机制相对简单且依附主 API。"],
  [2,2,2,1,"工具参考集中给出稳定字段与约束，具有工程查证价值，但部分知识与主指南重叠。"],
  [2,2,1,2,"SDK Tool Runner 提供可复用执行循环，适用面较广，但依赖特定 SDK 抽象。"],
  [2,3,1,1,"工具搜索解决大工具面的延迟加载与选择问题，机制独立但主要面向复杂 Agent。"],
  [2,2,1,1,"工具调用与提示缓存组合有真实成本价值，但知识主要由两份主指南交叉覆盖。"],
  [2,1,1,1,"MCP tunnels 排障页主要汇总具体故障操作，可由架构、安全和参考资料共同替代。"]
];

function loadPublishedAnthropic() {
  global.window = {};
  require(path.join(PROJECT_ROOT, "data", "library.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
  for (let number = 1; number <= 4; number++) {
    require(path.join(PROJECT_ROOT, "data", `library-official-anthropic-importance-0${number}.js`));
  }
  return global.window.PRO_LIBRARY.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "anthropic");
}

function summarize(records) {
  return records.reduce((summary, record) => {
    summary[record.decision] = (summary[record.decision] || 0) + 1;
    return summary;
  }, {
    reviewed:records.length,
    admitted:records.filter(record => record.decision.startsWith("admitted-")).length,
    rejected:records.filter(record => !record.decision.startsWith("admitted-")).length
  });
}

const batches = auditPaths.map(file => JSON.parse(fs.readFileSync(file, "utf8")));
const allRecords = batches.flatMap(batch => batch.records);
const byId = new Map(allRecords.map(record => [record.id, record]));
const published = loadPublishedAnthropic();
const publishedById = new Map(published.map(item => [item.id, item]));
const previousScoreBatch = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf8")) : null;
const candidates = previousScoreBatch
  ? previousScoreBatch.results.map(result => byId.get(result.id))
  : allRecords.filter(record => record.decision.startsWith("admitted-")).slice(0, 60);

if (candidates.length !== 60 || candidates.some(record => !record)) throw new Error("Anthropic score batch 01 must resolve exactly 60 frozen candidates");
if (scoreDefinitions.length !== 60) throw new Error(`Expected 60 score definitions, got ${scoreDefinitions.length}`);

const results = candidates.map((record, index) => {
  const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = scoreDefinitions[index];
  const total = knowledgeImportance + irreplaceability + durability + applicability;
  const passed = total >= 6 && knowledgeImportance >= 2;
  const originalDecision = record.previousDecision || record.decision;
  const score = {
    policy:POLICY, reviewedAt:REVIEWED_AT,
    knowledgeImportance, irreplaceability, durability, applicability, total,
    threshold:6, knowledgeImportanceMinimum:2, passed, rationale
  };
  if (!record.linkedNodes && publishedById.get(record.id)?.linkedNodes) {
    record.linkedNodes = [...publishedById.get(record.id).linkedNodes];
  }
  record.valueScore = score;
  record.scoreBatch = SCORE_BATCH;
  if (passed) {
    record.decision = originalDecision;
    delete record.previousDecision;
  } else {
    if (!record.previousDecision) record.previousDecision = originalDecision;
    record.decision = "rejected-low-importance";
    record.currentStatus = "current";
    record.reason = `价值评分 ${total}/10（知识重要性 ${knowledgeImportance}/3）：${rationale}`;
  }
  return { sequence:record.sequence, id:record.id, title:record.title, scores:score, finalDecision:record.decision };
});

const scoreBatch = {
  policy:POLICY,
  batch:{
    id:SCORE_BATCH, reviewedAt:REVIEWED_AT, candidateCount:60,
    selection:"Anthropic 收紧后通过清单按原审核顺序排列的前 60 份资料",
    admissionRule:"总分至少 6/10，且知识重要性至少 2/3"
  },
  results,
  summary:{
    reviewed:60,
    retained:results.filter(result => result.scores.passed).length,
    removed:results.filter(result => !result.scores.passed).length
  }
};

batches.forEach((batch, batchIndex) => {
  batch.admittedObjectIds = batch.records.filter(record => record.decision.startsWith("admitted-")).map(record => record.id);
  batch.summary = summarize(batch.records);
  fs.writeFileSync(auditPaths[batchIndex], `${JSON.stringify(batch, null, 2)}\n`, "utf8");
});
fs.writeFileSync(outputPath, `${JSON.stringify(scoreBatch, null, 2)}\n`, "utf8");

const firstBatch = batches[0];
const rows = firstBatch.records.filter(record => record.decision.startsWith("admitted-")).map(record => ({
  ...record,
  linkedNodes:record.linkedNodes || publishedById.get(record.id)?.linkedNodes || []
}));
const js = `/* Generated from anthropic-importance-batch-01.json and ${SCORE_BATCH}.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="anthropic"));\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"anthropic",title:row.title,publisher:"Anthropic",collection:"Anthropic 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${REVIEWED_AT}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Anthropic 的实现与声明","使用前应复核页面状态和版本"],tags:["anthropic","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${REVIEWED_AT}",reviewBatch:"anthropic-importance-batch-01",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),contentTier:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,valueScore:row.valueScore||null,scoreBatch:row.scoreBatch||"",recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","替代路径或关闭日期变化"]:[]}));\n})();\n`;
fs.writeFileSync(path.join(PROJECT_ROOT, "data", "library-official-anthropic-importance-01.js"), js, "utf8");

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const decisionByUrl = new Map(allRecords.map(record => [record.canonicalUrl, record]));
inventory.records.forEach(record => {
  const decision = decisionByUrl.get(record.canonicalUrl);
  if (!decision) return;
  record.reviewStatus = decision.decision;
  record.reviewReason = decision.reason;
  if (decision.decision.startsWith("admitted-")) record.cardId = decision.id;
  else delete record.cardId;
  if (decision.valueScore) {
    record.valueScore = decision.valueScore;
    record.scoreBatch = decision.scoreBatch;
  }
});
inventory.summary.admitted = inventory.records.filter(record => String(record.reviewStatus).startsWith("admitted-")).length;
inventory.summary.rejectedAfterContentReview = inventory.records.filter(record => String(record.reviewStatus).startsWith("rejected-")).length;
inventory.summary.pendingContentReview = inventory.records.filter(record => record.reviewStatus === "pending-importance-review").length;
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify(scoreBatch.summary, null, 2)}\n`);
