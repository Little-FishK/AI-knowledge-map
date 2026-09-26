"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const POLICY = "openai-official-value-score-v1";
const REVIEWED_AT = "2026-09-24";
const batchFiles = [1, 2, 3, 4, 5].map(number =>
  path.join(PROJECT_ROOT, "proposals", "official-technical", `openai-importance-batch-0${number}.json`)
);

/* knowledgeImportance, irreplaceability, durability, applicability, rationale */
const scores = new Map([
  [3,   [2,1,1,1,"认证选项会影响正确接入，但知识主要服务 GPT Actions，且可由通用 OAuth 与安全资料部分替代。"]],
  [4,   [1,1,1,1,"主要介绍 GPT Actions 产品能力和接入方向，独立机制与跨场景知识增量有限。"]],
  [6,   [2,1,1,1,"包含超时、速率限制和安全等生产约束，但适用范围窄且多项原则已有通用生产指南覆盖。"]],
  [8,   [2,3,0,1,"为退役 Assistants API 提供不可替代的当前迁移对照，但价值随迁移窗口结束而下降。"]],
  [12,  [2,3,1,2,"弃用时间与替代路径直接影响生产决策，且只能由官方状态资料权威确认。"]],
  [15,  [1,2,1,1,"Admin API 对组织运维有用，但主要是管理自动化，不构成多数 AI 开发者所需的核心技术知识。"]],
  [17,  [2,1,1,2,"覆盖复现、token 与参数等实际使用问题，适用面较广，但多为已有指南的综合补充。"]],
  [19,  [2,2,2,1,"明确 Agent 定义中指令、模型、工具和运行行为的责任边界，属于稳定的 SDK 构造知识。"]],
  [20,  [3,3,2,2,"直接比较 Agents API、Agents SDK 与 Responses API，是运行时选型和责任边界的主资料。"]],
  [21,  [3,3,2,1,"定义托管 Codex harness、会话与环境责任，是 Agents API 架构不可替代的官方入口。"]],
  [24,  [2,2,2,2,"把质量、速度、成本与可靠性组织成生产检查项，对多数 Responses 部署有长期复用价值。"]],
  [25,  [2,2,1,1,"说明结构化补丁这一独立工具协议，但主要适用于编码 Agent 集成。"]],
  [26,  [3,3,2,1,"解释 harness、环境和应用服务器的边界，是正确设计 Agents API 系统的核心架构资料。"]],
  [27,  [2,3,1,1,"异步工具调用的等待、结果交付与恢复协议无法由普通同步工具指南替代。"]],
  [28,  [2,2,1,2,"提供语音、转写与实时交互的官方选型入口，覆盖面广但部分产品路径会变化。"]],
  [30,  [2,2,1,2,"后台异步执行直接影响长任务设计，机制重要且适用于多类生产工作负载。"]],
  [31,  [2,2,2,1,"批处理的吞吐、速率与成本模型稳定且影响离线任务架构，但适用场景相对专门。"]],
  [33,  [1,2,1,1,"主要说明 ChatGPT Developer mode 的产品功能与 MCP 访问范围，跨产品知识增量有限。"]],
  [36,  [2,1,2,2,"引用组织方式具有广泛实践价值和较强持久性，但并非 OpenAI 独有机制。"]],
  [38,  [2,1,1,2,"代码生成使用建议适用面广，但与一般提示、模型选型和 Codex 资料存在较多重叠。"]],
  [39,  [2,2,2,2,"托管 Python 执行的能力与文件产物边界会影响方案选型，并具有稳定工程价值。"]],
  [40,  [2,3,1,1,"主体、受众、声明、作用域与令牌生命周期属于不可由普通身份指南替代的精确安全契约。"]],
  [41,  [3,3,2,2,"长会话压缩的状态与上下文机制直接影响 Agent 可靠性、成本和连续性。"]],
  [43,  [3,3,2,2,"计算机操作的观察—动作循环、执行环境和安全边界是独立的核心 Agent 机制。"]],
  [44,  [2,2,1,1,"补充动作处理器、执行服务和用户同意等正确集成细节，但范围限于 Computer Use。"]],
  [54,  [3,2,2,2,"内容凭证、水印与验证边界影响生成内容治理，知识长期有效且跨多模态场景。"]],
  [55,  [3,3,2,2,"会话状态、响应串联与持久化选择是多轮系统设计的核心且不可替代。"]],
  [56,  [2,2,2,2,"模型、token、缓存与异步策略的成本权衡适用于多数生产系统并具有持续价值。"]],
  [58,  [2,3,2,2,"多模态、文件和工具输入的服务端精确计数是预算与上下文控制的独有官方能力。"]],
  [59,  [3,3,2,1,"CSAM 风险处置涉及高风险合规边界，必须依赖官方专门指导，虽然目标场景较窄。"]],
  [60,  [1,2,1,1,"主要说明获批自定义声音的产品流程，重要性和适用范围不足以进入专业精选库。"]],
  [61,  [3,3,2,1,"请求级网络安全检查、访问限制与申诉构成高风险部署的官方安全边界。"]],
  [62,  [3,3,2,2,"数据使用、保留和控制直接决定隐私合规与系统架构，是不可替代的官方依据。"]],
  [64,  [2,2,1,1,"深度研究模型具有独立工具与输出约束，但主要服务特定研究型任务。"]],
  [65,  [2,2,1,1,"委派、上下文和函数执行会影响 GPT-Live 正确实现，但知识集中于单一实时产品。"]],
  [67,  [3,2,2,2,"偏好数据训练机制与适用任务属于重要模型优化知识，原则可跨模型复用。"]],
  [69,  [1,2,1,2,"错误码资料具有较高查表价值，但主要承担故障查询而非机制或架构知识。"]],
  [72,  [3,3,2,2,"评测集、指标与持续评估方法是生产 AI 系统的核心方法论和官方基线。"]],
  [73,  [2,3,1,1,"Agents API 的事件与持久化 item 契约影响流式消费和恢复，具有独立协议价值。"]],
  [74,  [1,2,0,1,"主要描述当前加速档位和价格相关能力，时效短且属于产品选项。"]],
  [75,  [2,2,1,2,"文件类型与输入处理差异会影响多模态实现，适用于较广的文档处理场景。"]],
  [76,  [3,3,2,2,"托管向量库、检索流程与限制直接决定 RAG 实现和平台选型。"]],
  [77,  [2,2,2,2,"文件转写、流式转写和专用语音功能具有稳定接口边界和广泛应用价值。"]],
  [78,  [2,2,1,1,"环境文件提取与产物保留影响 Agent 输出交付，但适用范围限于 Agents API 环境。"]],
  [79,  [3,3,2,2,"训练数据、迭代与质量控制方法直接决定微调成败，具有长期通用价值。"]],
  [80,  [2,2,1,1,"Flex 的异步成本和服务等级影响特定批量任务，但属于平台专用处理模式。"]],
  [82,  [3,3,2,2,"函数模式、调用循环和结果回传是工具型 LLM 系统的基础协议。"]],
  [85,  [2,2,1,1,"GPT-Live 的后端选择和连接路径影响首次正确实现，但内容具有入门和产品绑定特征。"]],
  [86,  [2,2,1,1,"Realtime 的连接、会话和语音 Agent 路径具有实现价值，但快速开始本身可替代性中等。"]],
  [89,  [3,3,2,2,"护栏、审批与人工复核是 Agent 安全执行的核心控制机制。"]],
  [90,  [3,3,2,2,"生成与编辑接口、输入输出和模型能力边界直接影响多模态实现选型。"]],
  [91,  [2,0,1,1,"该工具页的关键知识已由图像生成主指南覆盖，独立增量不足。"]],
  [93,  [2,2,2,2,"图像提示和编辑方法可跨任务复用，并补充主接口文档未覆盖的实践边界。"]],
  [94,  [3,2,2,2,"统一说明图像理解与生成能力边界，是多模态方案的重要总入口。"]],
  [96,  [2,2,2,2,"追踪、调试与 MCP 集成对 Agent 可观测性和生产可靠性具有广泛价值。"]],
  [97,  [2,3,2,1,"组织和项目级 IP 限制是企业接入的精确安全边界，但适用对象相对集中。"]],
  [99,  [3,3,2,2,"生成长度、并行、流式与架构的延迟权衡适用于多数 LLM 生产系统。"]],
  [100, [2,2,1,1,"本地 shell 的执行责任和接入方式是 Agent 工具的重要边界，但场景集中于编码与自动化。"]],
  [101, [3,3,2,2,"角色、项目、组织和最小权限模型直接影响企业治理与安全架构。"]],
  [105, [2,3,1,1,"GPT-Live 会话、长对话、错误与恢复构成独立运行协议，但产品适用范围较窄。"]]
]);

function summary(records) {
  return records.reduce((result, record) => {
    result[record.decision] = (result[record.decision] || 0) + 1;
    if (record.decision.startsWith("admitted-")) result.admitted += 1;
    else result.rejected += 1;
    return result;
  }, { reviewed:records.length, admitted:0, rejected:0 });
}

const batches = batchFiles.map(file => JSON.parse(fs.readFileSync(file, "utf8")));
const records = batches.flatMap(batch => batch.records);
const selected = [...scores.keys()].map(sequence => records.find(record => record.sequence === sequence));
if (selected.some(record => !record) || selected.length !== 60 || new Set(selected.map(record => record.id)).size !== 60) {
  throw new Error("Scoring batch 01 must resolve to exactly 60 unique records");
}

const results = selected.map(record => {
  const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = scores.get(record.sequence);
  const total = knowledgeImportance + irreplaceability + durability + applicability;
  const passed = total >= 6 && knowledgeImportance >= 2;
  record.valueScore = {
    policy:POLICY,
    reviewedAt:REVIEWED_AT,
    knowledgeImportance,
    irreplaceability,
    durability,
    applicability,
    total,
    threshold:6,
    knowledgeImportanceMinimum:2,
    passed,
    rationale
  };
  record.scoreBatch = "openai-value-score-batch-01";
  if (passed) {
    if (record.currentStatus !== "transition") {
      record.decision = total >= 8 ? "admitted-core" : "admitted-supporting";
      record.contentTier = total >= 8 ? "core" : "supporting";
    }
    record.reason = `价值评分 ${total}/10（知识重要性 ${knowledgeImportance}/3）：${rationale}`;
    delete record.tighteningAction;
  } else {
    if (record.decision.startsWith("admitted-")) record.previousDecision = record.decision;
    record.decision = "rejected-low-importance";
    record.currentStatus = "current";
    record.reason = `价值评分 ${total}/10，知识重要性 ${knowledgeImportance}/3；未同时达到总分 6 分和知识重要性 2 分门槛。${rationale}`;
    record.replacementCheck = "未通过 10 分制价值门槛，不再生成前台资料卡";
    record.tighteningAction = "removed-by-value-score";
    delete record.contentTier;
    delete record.comparedWith;
    delete record.uniqueDelta;
    delete record.recheckAt;
    delete record.recheckTriggers;
  }
  return {
    sequence:record.sequence,
    id:record.id,
    title:record.title,
    scores:record.valueScore,
    finalDecision:record.decision
  };
});

batches.forEach((batch, index) => {
  batch.admittedObjectIds = batch.records.filter(record => record.decision.startsWith("admitted-")).map(record => record.id);
  batch.summary = summary(batch.records);
  fs.writeFileSync(batchFiles[index], `${JSON.stringify(batch, null, 2)}\n`, "utf8");
});

const report = {
  policy:POLICY,
  batch:{
    id:"openai-value-score-batch-01",
    reviewedAt:REVIEWED_AT,
    candidateCount:60,
    selection:"收紧后通过清单按原审核顺序排列的前 60 份资料",
    admissionRule:"总分至少 6/10，且知识重要性至少 2/3"
  },
  results,
  summary:{
    reviewed:results.length,
    admitted:results.filter(result => result.finalDecision.startsWith("admitted-")).length,
    rejected:results.filter(result => !result.finalDecision.startsWith("admitted-")).length,
    core:results.filter(result => result.finalDecision === "admitted-core").length,
    supporting:results.filter(result => result.finalDecision === "admitted-supporting").length,
    transition:results.filter(result => result.finalDecision === "admitted-transition").length
  }
};
fs.writeFileSync(
  path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-01.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);
process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
