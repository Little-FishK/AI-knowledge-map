"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const POLICY = "openai-official-value-score-v1";
const REVIEWED_AT = "2026-09-24";
const SCORE_BATCH = "openai-value-score-batch-02";
const batchFiles = [1, 2, 3, 4, 5].map(number =>
  path.join(PROJECT_ROOT, "proposals", "official-technical", `openai-importance-batch-0${number}.json`)
);

/* knowledgeImportance, irreplaceability, durability, applicability, rationale */
const scores = new Map([
  [107,[3,3,2,2,"远程 MCP 的信任、审批和数据共享边界是工具接入的核心协议知识。"]],
  [108,[2,2,1,1,"中途转向与续接队列具有独立运行价值，但只覆盖特定长流程控制场景。"]],
  [109,[2,3,0,1,"迁出 Agent Builder 的官方映射不可替代，但只在短期迁移窗口内有效。"]],
  [110,[2,3,0,1,"提示对象迁移需要官方字段映射，但价值会随旧对象退出而消失。"]],
  [111,[2,3,0,1,"GPT-Live 迁移路径只能由官方准确说明，但面向特定语音产品且时效短。"]],
  [112,[3,3,1,2,"Responses API 迁移改变状态、工具和输出处理，是广泛适用的主迁移资料。"]],
  [113,[3,3,2,2,"误对齐监控的覆盖、阻断和告警边界直接影响高风险部署。"]],
  [116,[3,2,1,2,"模型选型影响质量、成本和延迟，适用广泛，但具体型号会持续变化。"]],
  [119,[3,3,2,2,"文本与图像审核的输入输出和风险分类是生产安全的基础能力。"]],
  [120,[2,2,1,1,"托管多智能体委派机制有独立价值，但主要服务 Agents API 使用者。"]],
  [121,[2,3,1,1,"Responses 多智能体的事件和恢复协议无法由一般编排介绍替代。"]],
  [122,[2,3,2,1,"双向 TLS 的证书验证与轮换是企业网络接入的精确安全边界。"]],
  [124,[2,2,1,1,"进度、用量和运行观察对排障有用，但限于 Agents API 运维。"]],
  [125,[2,1,1,1,"主要说明 Amazon Bedrock 的渠道差异与配置，知识范围窄且易随平台变化。"]],
  [126,[2,2,1,1,"托管沙箱的计算与文件边界影响正确选型，但适用范围集中。"]],
  [127,[3,2,2,2,"提示、检索、微调和评测的组合决策是提升准确率的长期方法论。"]],
  [129,[3,2,2,2,"handoff 与 agent-as-tool 的责任边界是多智能体架构的核心知识。"]],
  [130,[2,2,1,1,"技能与 MCP 的插件封装具有复用价值，但属于特定代理运行时能力。"]],
  [131,[2,2,1,1,"已知输出前缀的延迟优化机制具有独立价值，但适用任务较窄。"]],
  [132,[2,3,2,1,"Private Link 的网络隔离与 DNS 边界是企业接入不可替代的官方依据。"]],
  [133,[3,2,2,2,"密钥、安全、扩展和成本构成从原型到生产的通用工程基线。"]],
  [134,[2,3,1,1,"程序化工具调用的允许范围与恢复协议具有独立机制价值。"]],
  [135,[2,1,1,1,"仅用于定位提示缓存未命中的诊断子流程，可由缓存主指南和日志方法替代。"]],
  [136,[3,3,2,2,"缓存命中规则直接影响多数长提示应用的成本与延迟架构。"]],
  [140,[3,2,2,2,"提示结构、版本化和评测闭环是广泛适用且长期有效的基础方法。"]],
  [141,[2,1,1,1,"主要是 GPT-Live 对话风格与打断的产品提示技巧，跨场景增量有限。"]],
  [143,[2,2,2,1,"实时语音提示的轮次、打断和测试原则具有持久价值，但场景集中。"]],
  [145,[3,3,2,2,"限流维度、退避与容量规划是所有生产 API 客户端的基础约束。"]],
  [147,[3,3,2,2,"实时会话、音频事件与状态管理是语音应用的核心协议。"]],
  [148,[2,2,2,2,"实时转写的会话和增量事件边界稳定且适用多类音频应用。"]],
  [149,[2,1,1,1,"实时翻译主要是转写与语音能力的特定组合，独立知识增量不足。"]],
  [150,[2,2,1,1,"实时会话内函数和 MCP 工具接入有独立实现价值，但适用面较窄。"]],
  [152,[3,3,2,2,"推理强度、推理 token 与跨轮状态是正确使用推理模型的核心机制。"]],
  [153,[3,2,2,2,"对抗测试的方法与评测位置是高可靠 AI 系统的长期安全基线。"]],
  [154,[3,3,1,1,"强化微调的任务条件和评分器机制不可替代，但平台能力仍在快速演进。"]],
  [155,[2,1,1,1,"用例集合提供参考，但关键机制已由强化微调主指南覆盖。"]],
  [156,[2,2,2,1,"结果表面与可恢复状态的区分会影响代理工作流的正确持久化。"]],
  [157,[3,3,2,2,"向量库、语义检索与过滤构成平台 RAG 实现的核心知识。"]],
  [158,[2,2,1,1,"启动、跟随和续接会话是 Agents API 的必要运行知识，但产品绑定较强。"]],
  [160,[3,3,2,2,"运行循环、流式输出与会话状态策略是 Agents SDK 的核心契约。"]],
  [161,[3,2,2,2,"审核、红队、人类监督和输入约束构成通用生产安全基线。"]],
  [162,[3,3,2,2,"安全分类器与 safety identifier 的阻断边界只能由官方权威定义。"]],
  [164,[3,2,2,1,"沙箱与编排的责任分离直接影响代理执行架构和隔离设计。"]],
  [165,[2,1,1,1,"环境启动、重连和停止主要是操作流程，核心生命周期可由沙箱主资料覆盖。"]],
  [166,[3,3,2,2,"工作负载隔离、网络限制和凭据保护是代理执行的核心安全边界。"]],
  [167,[2,3,1,1,"出站隧道的私网 MCP 连接模型具有不可替代的企业接入价值。"]],
  [168,[2,2,1,1,"自托管计算与文件责任边界影响部署选择，但只服务特定沙箱模式。"]],
  [169,[2,3,1,1,"服务端会话控制和私有工具执行是语音应用的重要信任边界。"]],
  [170,[2,2,1,1,"生命周期 webhook 的事件契约支持可靠自动化，但仅是会话运维补充。"]],
  [171,[3,3,2,2,"命令执行、托管与本地运行责任是代理工具系统的基础安全协议。"]],
  [172,[2,2,1,1,"可复用技能的发现和装载机制有独立价值，但依赖特定工具运行时。"]],
  [173,[1,2,1,1,"月度支出限制属于管理配置与成本控制功能，不是核心技术知识。"]],
  [174,[3,3,2,2,"SSE 事件、增量输出和错误处理是低延迟生成应用的基础协议。"]],
  [175,[3,3,2,2,"JSON Schema 约束与拒绝处理是可靠结构化集成的核心机制。"]],
  [176,[3,3,1,2,"训练数据、作业与评测闭环是模型定制核心知识，但平台路径正在变化。"]],
  [177,[2,3,1,1,"SIP 与音频桥接的连接边界不可由普通实时指南完全替代。"]],
  [179,[3,3,2,2,"消息角色、输入输出与文本格式是 OpenAI API 的基础生成契约。"]],
  [180,[2,2,2,2,"语音合成的模型、格式和流式边界稳定且适用范围广。"]],
  [182,[2,3,1,1,"延迟加载大规模工具表面的协议直接解决上下文与选取问题。"]],
  [184,[2,2,2,1,"代理活动追踪与 OTLP 导出对生产排障有长期价值，但范围限于代理系统。"]]
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
  throw new Error("Scoring batch 02 must resolve to exactly 60 unique records");
}
if (selected.some(record => record.scoreBatch && record.scoreBatch !== SCORE_BATCH)) {
  throw new Error("Scoring batch 02 overlaps a previously scored record");
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
    selection:"第一批之后，收紧清单中按原审核顺序排列的下一组 60 份未评分资料",
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
  path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-02.json"),
  `${JSON.stringify(report, null, 2)}\n`, "utf8"
);
process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
