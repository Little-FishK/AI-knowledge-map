/* Score the first 60 Meta AI candidates with the shared four-dimensional 10-point gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const POLICY = "meta-ai-official-value-score-v1";
const BATCH_ID = "meta-ai-value-score-batch-01";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json");
const evidencePath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${BATCH_ID}-evidence.json`);
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${BATCH_ID}.json`);
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-meta-ai-importance-01.js");
const reportPath = path.join(PROJECT_ROOT, "docs", "OFFICIAL_TECHNICAL_META_AI_VALUE_SCORE_BATCH_01_20260924.md");

const definitions = [
  [1,1,1,1,"产品门户主要承担入口和营销导航，独立技术知识不足。"],
  [1,1,1,2,"文档首页是下级指南的集合导航，核心内容由专题页完整承载。"],
  [1,1,1,1,"API reference 首页只是端点目录，不能替代具体协议指南或完整 schema。"],
  [1,1,1,2,"Cookbook 首页聚合示例，按规则默认属于补充层，且本页本身没有独立机制结论。"],
  [1,1,2,1,"研究门户不属于官方技术文档本批边界，论文应进入学术来源审核。"],
  [1,1,1,1,"帮助中心集中处理账号、账单和常见操作，技术学习价值有限。"],
  [3,2,1,2,"比较 Claude Agent SDK 与 Codex app-server 的代理循环和协议映射，能支持框架接入决策。"],
  [2,2,1,2,"API 密钥生命周期和请求认证是可靠接入的必要安全边界。"],
  [2,1,1,2,"编码代理接入展示兼容配置和工作流，但知识高度依赖具体客户端。"],
  [3,3,2,2,"原生 computer tool 的截图—动作循环、驱动责任和安全边界构成独特的计算机使用代理机制。"],
  [3,2,2,2,"错误类型、重试、退避和幂等处理直接决定生产集成的可靠性。"],
  [2,2,1,2,"内联文件与 Files API 引用的生命周期差异是多模态请求的重要实现边界。"],
  [3,2,1,2,"多轮图像生成与编辑的输入、参考图和迭代语义是核心多模态能力。"],
  [2,2,2,2,"图像 URL、base64 与已上传文件的输入边界可迁移到多数视觉理解系统。"],
  [3,3,2,2,"SAM 的文本提示分割、图像与视频跟踪以及流式掩码输出具有不可替代的模型机制价值。"],
  [3,3,1,2,"模型页集中给出各模型家族的能力、输入输出、上下文和托管方式，是选型主依据。"],
  [2,1,1,2,"总览建立产品与模型家族的整体关系，虽与专题页重叠但仍提供最低限度的选型入口。"],
  [2,3,1,2,"官方价格、数据使用层级和速率限制是部署决策的独有事实，但变化较快。"],
  [3,3,2,2,"自动前缀缓存的命中条件、成本与延迟语义直接影响提示结构和生产优化。"],
  [1,1,1,2,"Quickstart 主要用于完成第一次调用，已被总览、协议和 SDK 指南覆盖。"],
  [3,2,1,2,"reasoning_effort 对推理预算、延迟和输出质量的控制是模型使用的关键边界。"],
  [2,2,1,1,"SAM 客户端库定义分割线协议的解析、遮罩渲染和视频播放，范围较窄但实现价值独立。"],
  [2,2,2,2,"SAM 总览解释图像与视频分割的任务模型、输入输出和适用范围。"],
  [3,3,2,1,"分割 wire lines、帧级 boxes/masks 与对象 id 的解析规则是正确消费 SAM 输出的独有契约。"],
  [3,3,2,2,"概念提示、单概念约束、属性过滤和视频流式请求共同定义 SAM 提示分割的核心方法。"],
  [1,1,1,2,"SDK 页主要列举兼容客户端和初始化方式，协议知识由对应 API 指南覆盖。"],
  [3,2,1,2,"搜索调用、引用注释和实时信息接地是降低时效性幻觉的核心工作流。"],
  [3,2,1,2,"流式与文件转录、说话人区分和端点检测构成可复用的语音转文本能力边界。"],
  [3,2,2,2,"JSON Schema 约束和严格输出验证是可靠自动化与下游解析的基础机制。"],
  [2,2,2,2,"推理前精确计算完整渲染输入有助于控制上下文溢出、成本和批处理。"],
  [3,2,2,2,"函数定义、模型选择调用、客户端执行和结果回传是代理工具链的核心闭环。"],
  [3,3,2,2,"延迟加载工具和命名空间可同时缩减上下文并保持缓存前缀，是大工具集代理的独特机制。"],
  [3,2,1,2,"统一理解视频、音频和文本提示的输入限制与输出语义具有重要多模态价值。"],
  [3,3,1,2,"对 Responses、Chat Completions 和 Messages 的能力与状态语义进行同平台比较，直接支持协议选型。"],
  [2,1,2,2,"Chat Completions 指南提供完整消息和流式交互模型，但主要机制已是行业通用协议。"],
  [2,2,1,2,"Messages 兼容层的内容块、工具和流式语义对跨供应商迁移具有明确价值。"],
  [3,3,2,2,"Responses API 的跨轮推理回放、工具循环、搜索与文件输入是 Meta 代理工作负载的主协议。"],
  [1,1,1,1,"Chat Completions 参考首页只有子页面导航。"],
  [1,2,1,1,"单一 create 端点的字段表已由 Chat Completions 指南与完整 schema 覆盖。"],
  [2,3,1,1,"完整 Chat Completions schema 是精确实现兼容协议的独有契约，但主要面向接入开发者。"],
  [1,1,1,1,"Files 参考首页只有 CRUD 端点目录。"],
  [1,1,1,1,"删除文件是单一 CRUD 操作，不形成独立 AI 知识。"],
  [1,1,1,1,"列举文件是单一 CRUD 操作，不形成独立 AI 知识。"],
  [1,1,1,1,"读取文件元数据是单一 CRUD 操作，可由 Files 总指南覆盖。"],
  [1,1,1,1,"下载文件内容是单一 CRUD 操作，可由 Files 总指南覆盖。"],
  [1,1,1,1,"Files schema 仅描述通用文件对象和错误结构，独立 AI 增量不足。"],
  [1,1,1,2,"上传文件是基础操作步骤，知识已包含在文件处理指南中。"],
  [1,1,1,1,"Images 参考首页只有生成和编辑端点导航。"],
  [1,2,1,1,"单一图像生成端点字段已被图像生成主指南和完整 schema 覆盖。"],
  [1,2,1,1,"单一图像编辑端点字段已被图像生成主指南和完整 schema 覆盖。"],
  [2,2,1,1,"完整 Images schema 精确定义生成、编辑、输入与返回结构，达到实现参考的最低保留线。"],
  [1,1,1,1,"Messages 参考首页只是兼容端点导航。"],
  [1,1,1,1,"计数端点的调用细节已由 Token counting 主指南覆盖。"],
  [1,2,1,1,"单一 create message 端点已由 Messages 协议指南和完整 schema 覆盖。"],
  [2,3,1,1,"完整 Messages schema 是验证 Anthropic 兼容层内容块、工具和流式事件的精确契约。"],
  [1,1,1,1,"Models 参考首页只有两个读取端点的导航。"],
  [1,1,1,1,"列举模型是基础发现操作，模型选型知识由 Models 主指南提供。"],
  [1,1,1,1,"读取单一模型元数据是基础操作，缺少独立知识增量。"],
  [1,1,1,1,"Models schema 内容窄且已被模型指南和端点说明覆盖。"],
  [1,1,1,1,"Responses 参考首页仅链接后续端点和 schema，核心协议由 Responses 指南承载。"]
];

function slug(url) {
  const value = new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return value || "home";
}

function topic(record) {
  const value = `${record.canonicalUrl} ${record.title}`.toLowerCase();
  if (/sam|segment/.test(value)) return "media-segmentation";
  if (/image/.test(value)) return "image-generation-understanding";
  if (/speech|video|audio/.test(value)) return "multimodal-audio-video";
  if (/tool/.test(value)) return "tools-agents";
  if (/agent|computer-use|coding-agent/.test(value)) return "tools-agents";
  if (/responses|chat-completions|messages|protocol/.test(value)) return "api-protocols";
  if (/file/.test(value)) return "files";
  if (/structured|token|reasoning|prompt-caching/.test(value)) return "model-control";
  if (/model/.test(value)) return "models-selection";
  if (/auth|error|pricing|rate-limit/.test(value)) return "production-operations";
  return "navigation-supplement";
}

function linkedNodes(record) {
  const key = topic(record);
  if (key === "media-segmentation") return ["image-editing", "multimodal"];
  if (key === "image-generation-understanding") return ["multimodal", "diffusion"];
  if (key === "multimodal-audio-video") return ["multimodal", "speech"];
  if (key === "tools-agents") return ["agent", "tool-calling", "agent-frameworks"];
  if (key === "api-protocols") return ["deployment", "agent", "tool-calling"];
  if (key === "files") return ["multimodal", "rag", "deployment"];
  if (key === "model-control") return ["structured-output", "context-window", "prompt-engineering"];
  if (key === "models-selection") return ["model-selection", "multimodal"];
  if (key === "production-operations") return ["deployment", "observability", "agent-identity-access"];
  return ["llm"];
}

const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
if (evidence.records.length !== 60 || definitions.length !== 60) throw new Error("Meta batch 01 must contain exactly 60 evidence records and definitions");

const results = evidence.records.map((record, index) => {
  const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = definitions[index];
  const total = knowledgeImportance + irreplaceability + durability + applicability;
  const passed = total >= 6 && knowledgeImportance >= 2;
  return {
    sequence:index + 1,
    inventorySequence:record.sequence,
    id:`meta-ai-${slug(record.canonicalUrl)}`,
    topic:topic(record),
    title:record.pageTitle || record.title,
    url:record.canonicalUrl,
    description:record.pageDescription || record.description,
    linkedNodes:linkedNodes(record),
    contentVerification:record.contentVerification,
    scores:{policy:POLICY,reviewedAt:REVIEWED_AT,knowledgeImportance,irreplaceability,durability,applicability,total,threshold:6,knowledgeImportanceMinimum:2,passed,rationale},
    finalDecision:passed ? (knowledgeImportance === 3 ? "admitted-core" : "admitted-supporting") : "rejected-low-value-score"
  };
});

const admitted = results.filter(result => result.scores.passed);
for (const result of admitted) {
  const peers = admitted.filter(peer => peer.topic === result.topic && peer.id !== result.id).slice(0, 2);
  result.comparedWith = peers.map(peer => peer.id);
  result.uniqueDelta = peers.length
    ? `相较于${peers.map(peer => `《${peer.title}》`).join("、")}，本资料的独立增量是：${result.scores.rationale}`
    : `本批同主题没有可直接替代资料；独立增量是：${result.scores.rationale}`;
}

const payload = {
  policy:POLICY,
  batch:{id:BATCH_ID,reviewedAt:REVIEWED_AT,candidateCount:60,selection:"Meta AI 397 份待审母集按冻结顺序排列的第 1 批 60 份资料",admissionRule:"总分至少 6/10，且知识重要性至少 2/3"},
  results,
  summary:{reviewed:60,retained:admitted.length,removed:results.length - admitted.length}
};

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const byKey = new Map(evidence.records.map((record, index) => [`${record.setId}|${record.canonicalUrl}`, results[index]]));
for (const record of inventory.records) {
  if (record.scoreBatch === BATCH_ID && record.duplicateOf) {
    record.reviewStatus = "ineligible-duplicate-route";
    record.reviewReason = "与 meta-model-api 中的同一官方资料重复；保留首次出现的 canonical URL。";
    for (const key of ["cardId", "linkedNodes", "contentVerification", "valueScore", "scoreBatch", "comparedWith", "uniqueDelta"]) delete record[key];
    continue;
  }
  if (record.duplicateOf) continue;
  const result = byKey.get(`${record.setId}|${record.canonicalUrl}`);
  if (!result) continue;
  record.reviewStatus = result.finalDecision;
  record.reviewReason = result.scores.passed
    ? `价值评分 ${result.scores.total}/10；通过总分与知识重要性双重门槛。`
    : `价值评分 ${result.scores.total}/10（知识重要性 ${result.scores.knowledgeImportance}/3）：${result.scores.rationale}`;
  record.cardId = result.scores.passed ? result.id : undefined;
  record.linkedNodes = result.linkedNodes;
  record.contentVerification = result.contentVerification;
  record.valueScore = result.scores;
  record.scoreBatch = BATCH_ID;
  if (result.scores.passed) {
    record.comparedWith = result.comparedWith;
    record.uniqueDelta = result.uniqueDelta;
  }
}
inventory.batch.status = "in-progress";
inventory.summary.admitted = inventory.records.filter(record => String(record.reviewStatus).startsWith("admitted-")).length;
inventory.summary.rejectedAfterContentReview = inventory.records.filter(record => record.reviewStatus === "rejected-low-value-score").length;
inventory.summary.pendingContentReview = inventory.records.filter(record => record.reviewStatus === "pending-importance-review").length;

const data = `/* Generated from ${BATCH_ID}.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="meta-ai"));\n  const rows=${JSON.stringify(admitted)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"meta-ai",title:row.title,publisher:"Meta",collection:"Meta AI 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.url,accessedAt:"${REVIEWED_AT}",summary:row.description,knowledgeDelta:row.scores.rationale,brandEvidenceDelta:row.uniqueDelta,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Meta 的实现与声明","预览产品、价格和接口版本使用前应复核"],tags:["meta-ai","官方技术资料",row.topic],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"价值评分通过",reviewPolicy:"${POLICY}",reviewedAt:"${REVIEWED_AT}",reviewBatch:"${BATCH_ID}",reviewDecision:row.finalDecision,contributionType:row.finalDecision.replace("admitted-",""),contentTier:row.finalDecision.replace("admitted-",""),topicKey:row.id,currentStatus:"current",selectionReason:row.scores.rationale,valueScore:row.scores,scoreBatch:"${BATCH_ID}",comparedWith:row.comparedWith,uniqueDelta:row.uniqueDelta,recheckTriggers:["Meta Model API 结束预览","模型或协议版本变化"]}));\n})();\n`;

const report = `# Meta AI 官方技术资料价值评分：第 1 批\n\n日期：${REVIEWED_AT}  \n评分机制：知识重要性 0–3、不可替代性 0–3、持久性 0–2、适用范围 0–2  \n保留门槛：总分至少 6/10，且知识重要性至少 2/3\n\n| 指标 | 数量 |\n|---|---:|\n| 本批审核 | 60 |\n| 保留 | ${admitted.length} |\n| 移除 | ${results.length - admitted.length} |\n| 剩余待审 | ${inventory.summary.pendingContentReview} |\n\n本批主要移除文档门户、Cookbook 集合页、Quickstart、SDK 导航、API 参考目录和被上位指南或完整 schema 覆盖的单一 CRUD/调用端点。保留资料集中在代理循环、计算机使用、错误处理、多模态、SAM、协议选型、结构化输出、工具调用和工具搜索。\n`;

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
fs.writeFileSync(dataPath, data, "utf8");
fs.writeFileSync(reportPath, report, "utf8");
process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
