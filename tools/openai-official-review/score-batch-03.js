"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const POLICY = "openai-official-value-score-v1";
const REVIEWED_AT = "2026-09-24";
const SCORE_BATCH = "openai-value-score-batch-03";
const batchFiles = [1, 2, 3, 4, 5].map(number =>
  path.join(PROJECT_ROOT, "proposals", "official-technical", `openai-importance-batch-0${number}.json`)
);

/* knowledgeImportance, irreplaceability, durability, applicability, rationale */
const scores = new Map([
  [185,[2,2,2,2,"文件与实时转写的选型边界适用于多类语音应用，并具有稳定工程价值。"]],
  [186,[3,3,2,1,"未成年人数据、零保留和安全措施属于高风险应用不可替代的官方边界。"]],
  [199,[3,3,1,2,"当前模型家族的能力、提示与迁移差异直接影响广泛的技术选型，但型号会演进。"]],
  [201,[2,3,1,1,"沙箱与 MCP 密钥的存储、注入和访问边界是代理系统的重要安全契约。"]],
  [202,[3,3,2,2,"向量表示、距离与典型任务是语义检索和聚类系统的基础机制。"]],
  [205,[2,3,1,1,"图像理解微调的数据与训练边界具有独立价值，但适用任务和平台路径较窄。"]],
  [206,[2,2,2,1,"VAD 的轮次检测和阈值行为是实时语音正确交互的独立机制。"]],
  [207,[3,3,2,2,"GPT-Live、Realtime 与串联语音管线的架构比较是语音系统的主选型资料。"]],
  [209,[3,3,2,2,"联网搜索、引用和访问控制是构建时效性系统的核心工具机制。"]],
  [210,[3,3,2,2,"事件订阅、签名验证和重试处理是异步生产集成的基础协议。"]],
  [211,[2,2,2,1,"浏览器音频的 WebRTC 连接与临时凭据边界具有稳定实现价值。"]],
  [213,[3,3,2,2,"Responses WebSocket 的创建、续接和多路复用是低延迟工作流的核心协议。"]],
  [214,[2,2,2,1,"服务端音频流的 WebSocket 连接模型重要，但仅覆盖语音传输场景。"]],
  [216,[3,3,2,1,"短期身份令牌与工作负载认证直接决定企业自动化的凭据安全。"]],
  [217,[2,3,1,1,"零数据保留下的私有安全处理是特定合规部署不可替代的官方说明。"]],
  [220,[3,3,2,2,"MCP 服务端的工具、认证与产品接入边界是跨代理集成的核心知识。"]],
  [223,[3,3,1,2,"能力、上下文与价格比较直接支持模型选型，但具体参数时效较短。"]],
  [233,[2,1,0,1,"Beta Agents 流事件页已被当前正式协议和事件参考覆盖，且持久性不足。"]],
  [306,[2,2,1,1,"Live fork 通道的事件契约独立但非常专门，作为协议补充仍达到最低门槛。"]],
  [307,[2,3,1,1,"Live 主 WebSocket 的消息契约是正确实现实时主通道的官方依据。"]],
  [308,[2,3,1,1,"Live sideband 通道的服务端控制协议无法由主通道说明完全替代。"]],
  [395,[3,3,2,1,"Realtime 客户端事件定义是实现会话输入和控制的精确协议。"]],
  [398,[3,3,2,1,"Realtime 服务端事件定义决定增量输出、状态与错误处理。"]],
  [404,[3,3,2,2,"Responses 创建请求的输入、工具和状态字段是平台核心 API 契约。"]],
  [409,[3,3,2,2,"Responses 流事件是增量消费、工具调用和错误恢复的核心协议。"]],
  [410,[3,3,2,2,"Responses WebSocket 双向事件决定长连接工作流的正确实现。"]],
  [441,[2,3,2,1,"Webhook 事件类型为异步任务状态提供不可替代的精确参考。"]],
  [446,[3,3,2,2,"沙箱、审批与网络控制构成安全运行编码代理的核心信任模型。"]],
  [447,[2,2,2,2,"AGENTS.md 的作用域与继承决定项目指令如何稳定进入代理上下文。"]],
  [448,[2,3,2,1,"命令规则直接定义沙箱外执行授权边界，具有重要安全价值。"]],
  [450,[3,2,2,2,"子代理的委派、隔离和配置是复杂代理工作流的通用编排机制。"]],
  [456,[3,3,2,1,"App Server 协议是把 Codex 嵌入其他产品的核心集成边界。"]],
  [460,[2,2,1,2,"计划与事件触发任务有自动化价值，但依赖具体产品能力。"]],
  [461,[1,2,1,1,"主要说明浏览器产品能力，关键搜索与操作机制已有专门资料覆盖。"]],
  [462,[3,3,2,2,"插件的清单、能力与测试流程是可复用扩展的核心开发协议。"]],
  [463,[3,3,2,2,"技能的结构、发现和安全边界是扩展代理能力的基础机制。"]],
  [465,[3,3,2,2,"CLI 的交互、脚本和执行模式是本地 Codex 工作流的主入口。"]],
  [468,[3,3,2,2,"隔离云环境、委派和产物边界是云端编码代理的核心架构。"]],
  [469,[3,3,2,1,"域名访问与网络策略直接决定云代理的数据外流和供应链风险。"]],
  [470,[2,2,2,2,"差异审查、反馈和客户端协作是广泛适用的代码质量工作流。"]],
  [471,[3,3,2,2,"以编程方式控制本地代理的会话与事件是自动化集成的核心能力。"]],
  [474,[2,1,1,1,"高级配置说明与完整配置参考高度重叠，独立知识增量不足。"]],
  [476,[3,3,2,1,"配置与组织要求的完整字段语义是部署和治理不可替代的精确参考。"]],
  [481,[1,2,1,1,"主要描述近期计算机活动生成时间线的产品功能，技术知识增量有限。"]],
  [483,[2,2,1,2,"跨对话记忆的作用范围、控制和隐私边界影响广泛的工作流设计。"]],
  [484,[2,3,1,1,"网络安全模型分级和可信访问属于高风险能力的官方准入边界。"]],
  [485,[2,2,2,2,"隔离、最小权限和护栏配置可迁移到多数授权安全工作流。"]],
  [487,[2,3,1,1,"程序化工作流令牌的创建与生命周期是自动化接入的关键安全边界。"]],
  [492,[3,3,2,2,"云执行、连接账户、留存与审计边界是企业使用的核心安全依据。"]],
  [493,[3,3,2,2,"本地执行、设备访问和策略边界决定企业端点风险与责任。"]],
  [494,[3,2,2,2,"本地与云端执行、隐私和连接能力的比较是 ChatGPT Work 的主架构资料。"]],
  [496,[3,3,2,1,"合规 API 与审计事件的管理边界是企业调查和留痕的权威依据。"]],
  [498,[3,2,2,2,"分析、用量和审计面的责任划分是长期有效的企业治理方法。"]],
  [500,[2,2,2,1,"群组来源与工作区访问边界影响企业权限正确性，但场景集中于管理。"]],
  [502,[2,3,2,1,"集中下发默认值与强制要求是本地客户端治理的重要机制。"]],
  [503,[2,2,2,1,"插件与连接服务的工作区控制补充了企业外部访问治理。"]],
  [506,[3,3,2,2,"角色、工作区、运行时和源系统权限的分离是企业最小权限核心模型。"]],
  [507,[2,2,2,1,"服务账户的身份与令牌生命周期支持可靠自动化，但适用对象有限。"]],
  [508,[2,2,1,1,"工作区、文件系统和插件技能控制的比较具有治理价值但范围较窄。"]],
  [510,[2,2,2,1,"入职、权限变更和离职撤销构成企业身份生命周期的必要闭环。"]]
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
  throw new Error("Scoring batch 03 must resolve to exactly 60 unique records");
}
if (selected.some(record => record.scoreBatch && record.scoreBatch !== SCORE_BATCH)) {
  throw new Error("Scoring batch 03 overlaps a previously scored record");
}

const results = selected.map(record => {
  const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = scores.get(record.sequence);
  const total = knowledgeImportance + irreplaceability + durability + applicability;
  const passed = total >= 6 && knowledgeImportance >= 2;
  record.valueScore = {
    policy:POLICY, reviewedAt:REVIEWED_AT, knowledgeImportance, irreplaceability,
    durability, applicability, total, threshold:6, knowledgeImportanceMinimum:2, passed, rationale
  };
  record.scoreBatch = SCORE_BATCH;
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
  return { sequence:record.sequence, id:record.id, title:record.title, scores:record.valueScore, finalDecision:record.decision };
});

batches.forEach((batch, index) => {
  batch.admittedObjectIds = batch.records.filter(record => record.decision.startsWith("admitted-")).map(record => record.id);
  batch.summary = summary(batch.records);
  fs.writeFileSync(batchFiles[index], `${JSON.stringify(batch, null, 2)}\n`, "utf8");
});

const report = {
  policy:POLICY,
  batch:{
    id:SCORE_BATCH,
    reviewedAt:REVIEWED_AT,
    candidateCount:60,
    selection:"第二批之后，收紧清单中按原审核顺序排列的下一组 60 份未评分资料",
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
  path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-03.json"),
  `${JSON.stringify(report, null, 2)}\n`, "utf8"
);
process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
