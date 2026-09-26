/* Score the first 60 Microsoft candidates with the shared 10-point value gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const POLICY = "microsoft-official-value-score-v1";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "microsoft-prefilter-inventory-20260924.json");
const evidencePath = path.join(PROJECT_ROOT, "proposals", "official-technical", "microsoft-value-score-batch-01-evidence.json");
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "microsoft-value-score-batch-01.json");
const dataPath = path.join(PROJECT_ROOT, "data", "library-official-microsoft-importance-01.js");

const definitions = [
  [3,3,2,2,"Agent Hooks 给出失败关闭的拦截契约，可统一落实治理、策略和运行时控制。"],
  [3,2,2,2,"后台智能体的并发委派、结果回收和生命周期管理是长任务系统的核心机制。"],
  [2,3,1,2,"后台响应的异步契约直接影响长耗时调用的可靠实现，但接口形态可能随框架演进。"],
  [3,3,2,1,"CodeAct 展示以代码作为行动空间的独特智能体范式，机制价值高但适用场景较集中。"],
  [2,2,2,1,"声明式智能体有配置、复现与治理价值，但主要服务采用该框架的团队。"],
  [3,2,2,2,"评测资料覆盖本地检查、自定义评估器与工作流评估，是上线前质量闭环的核心。"],
  [3,2,2,2,"有界循环、完成判定和审批逃生机制是可靠智能体控制的通用方法。"],
  [1,1,1,2,"页面主要说明如何向 Agent Framework 传入图像，属于操作步骤且可由多模态主资料替代。"],
  [3,2,2,2,"追踪、指标和遥测是生产智能体诊断与持续改进的基础能力。"],
  [3,2,2,2,"计划—执行、待办持久化和进度反馈对长任务智能体具有广泛架构价值。"],
  [3,1,2,2,"RAG 与智能体结合具有重要实践价值，但多数原理可由独立 RAG 主资料覆盖。"],
  [3,3,2,2,"FIDES 以信息流控制处理提示注入和数据外泄，提供不可由一般安全清单替代的机制。"],
  [3,3,2,2,"Agent Skills 的按需发现与加载协议是可移植能力封装的重要新范式。"],
  [3,2,2,2,"结构化输出是可靠工具链、验证和下游自动化的基础契约。"],
  [1,1,1,2,"工具类型与提供商支持矩阵只是导航性总览，具体知识已由各工具主资料覆盖。"],
  [1,2,1,1,"Code Interpreter 页面偏单一托管工具接入，缺少独立且广泛适用的机制增量。"],
  [3,2,2,2,"渐进暴露、调用门控和顺序约束直接降低工具误用，是通用智能体控制方法。"],
  [1,2,1,1,"File Search 页面偏框架工具调用，检索原理由 RAG 与检索主资料更完整覆盖。"],
  [3,2,2,2,"函数工具的模式、调用与结果回传是智能体连接外部能力的核心机制。"],
  [2,3,1,2,"托管 MCP 的执行边界和服务端契约具有官方独有性，但产品实现变化较快。"],
  [3,2,2,2,"本地 MCP 工具的发现、会话和调用模式对开放工具互操作具有广泛价值。"],
  [3,2,2,2,"工具审批把高风险行动纳入人在回路，是生产智能体安全的关键控制点。"],
  [1,1,1,1,"Web Search 页面主要是单一托管搜索工具接入，可由工具调用和检索资料替代。"],
  [2,1,2,2,"智能体概念页提供统一术语入口，但大量细节已由下属机制页面覆盖。"],
  [3,3,2,2,"内部管线解释中间件、上下文提供器与模型客户端的组合顺序，是理解框架行为的关键。"],
  [2,1,2,2,"会话与记忆总览建立必要概念边界，但独立增量主要来自后续专题页。"],
  [3,2,2,2,"以向量检索恢复历史的语义记忆模式可迁移到多数长程智能体系统。"],
  [3,2,2,2,"上下文压缩直接解决令牌预算、信息保真和长会话稳定性问题。"],
  [3,2,2,2,"上下文提供器把记忆、检索和运行信息组织为可插拔注入机制，适用面广。"],
  [2,2,2,2,"会话的创建、恢复和序列化是有状态智能体可靠运行的基础契约。"],
  [2,2,2,2,"状态持久化和外部存储抽象对可恢复智能体有稳定工程价值。"],
  [2,1,2,1,"自定义智能体说明扩展边界，但内容较依赖 Agent Framework 实现。"],
  [3,2,2,2,"中间件是横切治理、观测、安全和策略注入的核心扩展机制。"],
  [2,3,2,1,"区分智能体级与单次运行级作用域可避免状态泄漏和错误复用，结论较独特。"],
  [1,1,1,1,"聊天级中间件是框架内部的窄作用域实现，缺少独立知识增量。"],
  [1,1,1,2,"页面主要讲添加中间件的代码步骤，核心机制已由中间件总览覆盖。"],
  [1,1,2,1,"异常处理属于通用编程实践，页面未形成智能体领域不可替代的结论。"],
  [1,2,1,1,"结果覆盖是框架特定扩展点，适用范围窄且由中间件主资料涵盖。"],
  [2,2,2,1,"运行时上下文明确依赖注入与单次执行隔离，对中间件设计有实际价值。"],
  [2,2,2,1,"共享状态解释多个中间件协作时的状态边界，具有可复用工程价值。"],
  [3,2,2,2,"终止条件与护栏共同约束智能体失控，是安全运行的关键机制。"],
  [1,1,1,2,"页面主要说明启动和调用智能体的基本步骤，属于入门操作。"],
  [3,3,2,2,"运行中切换模型或推理提供商且保持上下文，是模型路由与韧性的独特架构问题。"],
  [3,2,2,2,"安全最佳实践覆盖输入、工具、权限与输出边界，对生产智能体普遍适用。"],
  [2,3,2,1,"Harness 展示组合式智能体运行时边界，官方架构说明独特但框架依赖较强。"],
  [2,1,2,2,"工作流概念页建立图、执行和状态的统一入口，但专题页承担主要增量。"],
  [2,2,1,1,"AgentExecutor 说明智能体嵌入工作流的适配边界，达到最低保留线但较实现相关。"],
  [1,2,1,1,"OffThread 与 Lockstep 页面主要针对 .NET 执行模式，跨平台学习价值有限。"],
  [1,2,1,1,"可重置执行器是 .NET 工作流的窄接口模式，不能形成独立核心知识。"],
  [3,2,2,2,"子工作流组合支持分层编排、隔离与复用，是复杂工作流的重要通用机制。"],
  [2,1,2,1,"构建器与执行页面偏框架 API，但仍提供图构建与运行生命周期的完整最小模型。"],
  [3,2,2,2,"边定义消息路由、条件分支和数据流，是图工作流语义的核心。"],
  [2,2,2,2,"事件机制提供可观测的执行信号和外部协调接口，对工作流控制有稳定价值。"],
  [3,2,2,2,"执行器定义工作单元、状态和消息处理边界，是工作流运行模型的核心。"],
  [2,2,1,2,"函数式工作流展示轻量编排模式，实用性高但装饰器接口可能变化。"],
  [3,2,2,2,"工作流状态的范围、持久化与恢复语义决定长任务正确性和容错。"],
  [3,2,2,2,"Durable Extension 系统说明检查点、恢复和持久执行，对长任务可靠性普遍重要。"],
  [1,2,1,1,"Foundry 托管智能体主要是 Microsoft 平台部署流程，跨平台知识增量不足。"],
  [2,2,2,2,"自托管协议与应用所有权边界对部署、治理和可移植性有直接价值。"],
  [3,3,2,2,"A2A 自托管说明开放代理互操作、任务执行器与适配边界，具有独立协议价值。"]
];

function slug(url) {
  return new URL(url).pathname.replace(/^\/en-us\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
}

function linkedNodes(record) {
  const value = `${record.url} ${record.title}`.toLowerCase();
  if (/evaluation/.test(value)) return ["model-evaluation", "agent"];
  if (/observability/.test(value)) return ["observability", "agent"];
  if (/rag|file-search/.test(value)) return ["rag", "agent"];
  if (/security|safety|guardrail|approval/.test(value)) return ["agent", "prompt-injection", "guardrails"];
  if (/structured-output/.test(value)) return ["structured-output", "agent"];
  if (/tool|mcp|code-interpreter|web-search/.test(value)) return ["tool-calling", "agent"];
  if (/memory|conversation|compaction|context-provider|session|storage/.test(value)) return ["agent-memory", "context-window", "agent"];
  if (/workflow|executor|edges|events|state/.test(value)) return ["workflow-orchestration", "agent-frameworks"];
  if (/model-routing|inference-provider/.test(value)) return ["model-selection", "agent"];
  if (/hosting|self-host|durable/.test(value)) return ["deployment", "agent-frameworks"];
  return ["agent", "agent-frameworks"];
}

const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
if (evidence.records.length !== 60 || definitions.length !== 60) throw new Error("Batch 01 must contain exactly 60 records and definitions");

const results = evidence.records.map((record, index) => {
  const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = definitions[index];
  const total = knowledgeImportance + irreplaceability + durability + applicability;
  const passed = total >= 6 && knowledgeImportance >= 2;
  return {
    sequence:index + 1,
    inventorySequence:record.sequence,
    id:record.url.endsWith("/agent-framework/concepts/agents") ? "microsoft-agent-framework" : `microsoft-${slug(record.url)}`,
    family:record.family,
    title:record.title,
    url:record.url,
    description:record.description,
    lastmod:record.lastmod,
    linkedNodes:linkedNodes(record),
    contentVerification:record.contentVerification,
    scores:{policy:POLICY,reviewedAt:REVIEWED_AT,knowledgeImportance,irreplaceability,durability,applicability,total,threshold:6,knowledgeImportanceMinimum:2,passed,rationale},
    finalDecision:passed ? (knowledgeImportance === 3 ? "admitted-core" : "admitted-supporting") : "rejected-low-value-score"
  };
});

const payload = {
  policy:POLICY,
  batch:{id:"microsoft-value-score-batch-01",reviewedAt:REVIEWED_AT,candidateCount:60,selection:"Microsoft 405 份待审母集按冻结顺序排列的第 1 批 60 份资料",admissionRule:"总分至少 6/10，且知识重要性至少 2/3"},
  results,
  summary:{reviewed:60,retained:results.filter(result => result.scores.passed).length,removed:results.filter(result => !result.scores.passed).length}
};

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const byUrl = new Map(results.map(result => [result.url, result]));
for (const record of inventory.records) {
  const result = byUrl.get(record.url);
  if (!result) continue;
  record.status = result.finalDecision;
  record.reason = result.scores.passed
    ? `价值评分 ${result.scores.total}/10；通过总分与知识重要性双重门槛。`
    : `价值评分 ${result.scores.total}/10（知识重要性 ${result.scores.knowledgeImportance}/3）：${result.scores.rationale}`;
  record.id = result.id;
  record.title = result.title;
  record.description = result.description;
  record.linkedNodes = result.linkedNodes;
  record.contentVerification = result.contentVerification;
  record.valueScore = result.scores;
  record.scoreBatch = payload.batch.id;
}
inventory.summary.pendingImportanceReview = inventory.records.filter(record => record.status === "pending-importance-review").length;
inventory.summary.valueScoreAdmitted = inventory.records.filter(record => String(record.status).startsWith("admitted-")).length;
inventory.summary.valueScoreRejected = inventory.records.filter(record => record.status === "rejected-low-value-score").length;
inventory.summary.byStatus = inventory.records.reduce((counts, record) => {
  counts[record.status] = (counts[record.status] || 0) + 1;
  return counts;
}, {});

const rows = results.filter(result => result.scores.passed);
const data = `/* Generated from microsoft-value-score-batch-01.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="microsoft"));\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"microsoft",title:row.title,publisher:"Microsoft",collection:"Microsoft 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.url,accessedAt:"${REVIEWED_AT}",summary:row.description,knowledgeDelta:row.scores.rationale,brandEvidenceDelta:row.scores.rationale,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Microsoft 的实现与声明","预览功能和产品生命周期使用前应复核"],tags:["microsoft","官方技术资料",row.family],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"价值评分通过",reviewPolicy:"${POLICY}",reviewedAt:"${REVIEWED_AT}",reviewBatch:"microsoft-value-score-batch-01",reviewDecision:row.finalDecision,contributionType:row.finalDecision.replace("admitted-",""),topicKey:row.id,currentStatus:"current",selectionReason:row.scores.rationale,valueScore:row.scores,scoreBatch:"microsoft-value-score-batch-01",recheckTriggers:[]}));\n})();\n`;

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
fs.writeFileSync(dataPath, data, "utf8");
process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
