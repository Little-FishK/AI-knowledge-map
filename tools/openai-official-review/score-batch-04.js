"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const POLICY = "openai-official-value-score-v1";
const REVIEWED_AT = "2026-09-24";
const SCORE_BATCH = "openai-value-score-batch-04";
const batchFiles = [1, 2, 3, 4, 5].map(number =>
  path.join(PROJECT_ROOT, "proposals", "official-technical", `openai-importance-batch-0${number}.json`)
);

/* knowledgeImportance, irreplaceability, durability, applicability, rationale */
const scores = new Map([
  [513,[3,3,1,2,"区分 ChatGPT、Codex 各客户端、云端与 API 的模型授权边界，直接影响企业选型。"]],
  [514,[3,3,2,2,"依赖、工具、环境变量和网络策略构成可复现云执行环境的核心机制。"]],
  [515,[3,3,2,2,"本地、工作树和云环境的隔离与文件归属是 Codex 运行架构的主选型知识。"]],
  [516,[2,2,2,1,"本地环境动作和工作树初始化具有稳定价值，但主要服务本地 Codex 用户。"]],
  [517,[2,2,2,2,"工作树隔离支持并行代理任务，机制稳定且可迁移到广泛的软件工程场景。"]],
  [518,[3,3,2,2,"MCP 的配置、认证和工具信任边界是 Codex 外部能力接入的核心协议。"]],
  [519,[2,2,1,1,"录制工作流并转为技能具有独立复用价值，但依赖当前产品能力。"]],
  [520,[2,2,2,1,"成熟度标签决定功能能否用于生产，是稳定的发布风险判断依据。"]],
  [525,[2,2,2,1,"GitHub 事件触发 Codex 的权限与输出边界有自动化价值，但适用面集中。"]],
  [528,[3,3,2,2,"生命周期钩子的触发点、执行责任和安全边界是扩展 Codex 的核心机制。"]],
  [529,[2,2,2,2,"编辑器上下文、执行与审查工作流覆盖广泛开发场景并具有稳定边界。"]],
  [535,[2,1,2,2,"实践建议适用范围广且较持久，但多数原则可由运行、提示和环境主资料推导。"]],
  [537,[3,2,2,2,"长任务的目标、检查点和完成条件是保持代理可靠性的通用方法。"]],
  [538,[2,3,0,1,"被移除 MCP 服务到 App Server 的官方迁移映射不可替代，但仅在迁移窗口有效。"]],
  [539,[3,3,1,2,"质量、速度和任务类型的模型权衡直接影响 Codex 使用，具体型号会变化。"]],
  [541,[3,3,2,2,"codex exec 的输入输出、退出状态与 CI 行为是可靠自动化的核心契约。"]],
  [545,[3,3,2,2,"文件、网络、命令与审批的权限组合是本地代理最小权限设计的核心。"]],
  [558,[3,3,2,2,"跨客户端沙箱的隔离和边界决定代理执行的基础安全模型。"]],
  [559,[3,3,1,1,"审批复核代理的路由与裁决机制是高权限执行的重要安全边界。"]],
  [560,[3,3,2,2,"安全扫描、证据确认与修复工作流构成 Codex Security 的主能力和责任边界。"]],
  [568,[2,2,1,1,"TypeScript 扫描生命周期接口支持自动化，但主要是 Codex Security 的语言 SDK 补充。"]],
  [571,[3,2,2,2,"资产、攻击面和信任假设直接决定安全发现的优先级与有效性。"]],
  [572,[3,2,2,2,"基于证据比较结构性加固方案是可迁移的安全工程方法。"]],
  [573,[3,2,2,2,"针对变更集发现安全回归并接入 CI 是广泛适用的安全审查模式。"]],
  [577,[2,2,2,1,"结构化结果、SARIF 和严重性策略对 CI 集成有用，但限于特定扫描器。"]],
  [595,[3,3,2,2,"WebMCP 为网站暴露可控工具的协议与安全边界是独立的核心知识。"]],
  [597,[2,2,2,1,"Windows 原生沙箱的能力和故障边界影响安全使用，但平台适用范围有限。"]],
  [598,[1,1,2,1,"主要是 WSL 安装和排障变体，未形成独立于环境与沙箱主资料的核心知识。"]],
  [599,[2,3,2,1,"工具、资源与组件字段是实现插件 UI 不可替代的精确模式参考。"]],
  [600,[2,2,2,1,"发布插件的 MCP 和 UI 约束具有长期质量价值，但主要服务插件开发者。"]],
  [602,[3,3,2,2,"插件 MCP 的身份、OAuth 与令牌处理是外部工具集成的核心安全协议。"]],
  [603,[3,3,2,2,"实时数据、受控工具和 MCP 服务端设计是插件能力的基础实现机制。"]],
  [604,[3,3,2,2,"围绕 MCP 工具封装可重复工作流是插件知识层的核心构造方式。"]],
  [608,[3,3,2,2,"技能、MCP 依赖与清单的打包关系是可分发插件的核心契约。"]],
  [610,[3,3,2,2,"技能、MCP 与可选 UI 的组合和责任边界是插件体系的主架构知识。"]],
  [613,[2,2,1,1,"连接、测试和评估流程会影响正确发布，但属于插件主资料的实现补充。"]],
  [615,[2,3,2,1,"远程 MCP 与 UI 的公开审核要求是发布不可替代的官方准入边界。"]],
  [618,[2,3,1,1,"报价请求转换合同精确且不可替代，但只适用于本地服务插件。"]],
  [620,[2,3,1,1,"产品结账转换合同对接入方必要，但知识集中于单一商业流程。"]],
  [621,[2,3,1,1,"餐厅预订转换合同具有独立协议价值，但适用范围很窄。"]],
  [622,[3,3,2,2,"插件数据流、权限和隐私边界是第三方扩展的核心安全依据。"]],
  [625,[3,2,2,2,"把用例收敛为清晰、最小的 MCP 工具表面是通用代理工具设计方法。"]],
  [627,[3,3,2,1,"Workspace Agent bearer 凭据的签发和使用是服务端自动化的核心认证边界。"]],
  [628,[3,3,2,1,"从服务端触发工作区 Agent 的请求与运行契约是自动化集成核心协议。"]],
  [629,[2,2,1,1,"商业集成上线检查具有工程价值，但适用范围集中于 Agentic Commerce。"]],
  [630,[2,1,2,1,"运营建议较持久，但大部分可由生产清单和协议规范替代。"]],
  [632,[3,3,2,2,"主体、委派、订单与支付概念构成 Agentic Commerce 的基础模型。"]],
  [633,[3,3,2,2,"结账状态、请求与回调是商户接入不可替代的核心交易协议。"]],
  [634,[3,3,2,2,"委托支付的授权与安全边界是支付服务商接入的核心协议。"]],
  [641,[2,2,1,1,"商品数据字段影响发现与结账，但属于商业目录的专门补充。"]],
  [643,[2,1,1,1,"经验总结中的关键方法已有插件、技能和 MCP 主文档覆盖，独立增量不足。"]],
  [645,[2,1,1,1,"自动化案例证明工作流可行，但核心机制已由 WebMCP、技能和长任务资料覆盖。"]],
  [649,[2,2,1,1,"开放代理 harness 的平台视角补充产品文档，但作为技术博客仅进入补充层。"]],
  [650,[2,1,1,1,"自定义代码审查规则的做法已由代码审查与项目指令资料覆盖。"]],
  [652,[2,2,1,1,"实时语音更新中的实现细节有补充价值，但会随产品快速变化。"]],
  [657,[2,2,2,1,"私有 MCP 的网络边界与流式认证案例补充了隧道主文档。"]],
  [662,[2,2,1,2,"技能描述、AGENTS.md 与提示去膨胀方法适用较广，但依赖当前模型行为。"]],
  [663,[2,2,2,2,"长周期任务的计划、状态与恢复模式具有稳定且广泛的实践价值。"]],
  [665,[3,2,2,2,"Shell、技能与压缩的组合解释长任务上下文和执行架构，具有独立方法价值。"]],
  [667,[3,2,2,2,"用评测系统化测试技能把代理扩展纳入可重复质量闭环。"]]
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
  throw new Error("Scoring batch 04 must resolve to exactly 60 unique records");
}
if (selected.some(record => record.scoreBatch && record.scoreBatch !== SCORE_BATCH)) {
  throw new Error("Scoring batch 04 overlaps a previously scored record");
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
    selection:"第三批之后，收紧清单中按原审核顺序排列的下一组 60 份未评分资料",
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
  path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-04.json"),
  `${JSON.stringify(report, null, 2)}\n`, "utf8"
);
process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
