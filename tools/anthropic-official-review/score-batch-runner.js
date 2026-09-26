"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const POLICY = "anthropic-official-value-score-v1";
const auditPaths = [1, 2, 3, 4].map(number => path.join(PROJECT_ROOT, "proposals", "official-technical", `anthropic-importance-batch-0${number}.json`));
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json");

const contributionCategory = new Map([
  ["安全、权限与合规边界", "security-governance"],
  ["身份、权限与合规接口边界", "security-governance"],
  ["安全、权限、身份与数据边界", "security-governance"],
  ["企业部署、网络与运行环境", "security-governance"],
  ["Agent、工具与执行机制", "responses-agents-tools"],
  ["代理协作、会话与编排机制", "responses-agents-tools"],
  ["会话生命周期与并行工作协调", "responses-agents-tools"],
  ["核心 API 对象与调用契约", "responses-agents-tools"],
  ["检索、文件与可追溯知识处理", "responses-agents-tools"],
  ["Claude Code 实现、可靠性与生产实践", "codex-engineering"],
  ["Claude Code 稳定操作契约", "codex-engineering"],
  ["SDK、CLI 与自动化实现路径", "codex-engineering"],
  ["工具、扩展与自动化机制", "mcp-plugins-skills"],
  ["扩展体系、配置结构与技能版本契约", "mcp-plugins-skills"],
  ["关键平台实现与治理机制", "production-observability"],
  ["成本、使用量与可观测性", "production-observability"],
  ["成本、容量与服务等级边界", "production-observability"],
  ["API 版本、错误与稳定性契约", "production-observability"],
  ["评测、可靠性与故障处理", "evals-finetuning"],
  ["提示、推理与上下文管理", "models-prompting-output"],
  ["模型选型、成本与性能边界", "models-prompting-output"],
  ["模型与平台选型依据", "models-prompting-output"],
  ["模型与响应行为配置", "models-prompting-output"],
  ["API 消息、流式与结构化输出机制", "models-prompting-output"],
  ["上下文、缓存与持久记忆机制", "models-prompting-output"],
  ["迁移与生命周期决策", "migration-lifecycle"],
  ["迁移、兼容与生命周期决策", "migration-lifecycle"],
  ["协作渠道迁移与兼容边界", "migration-lifecycle"],
  ["Agent SDK 迁移与兼容决策", "migration-lifecycle"]
]);

function classifyTopic(record) {
  const text = [record.title, record.description, record.canonicalUrl].filter(Boolean).join(" ").toLowerCase();
  if (/vision|image|pdf|multimodal|streaming|stream\b|fine-grained tool streaming|视觉|图像|流式/.test(text)) return "multimodal-realtime";
  return contributionCategory.get(record.matrixContribution) || "responses-agents-tools";
}

function loadPublishedAnthropic() {
  global.window = {};
  require(path.join(PROJECT_ROOT, "data", "library.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
  for (let number = 1; number <= 4; number++) require(path.join(PROJECT_ROOT, "data", `library-official-anthropic-importance-0${number}.js`));
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

function generateDataFile(batch, batchNumber, publishedById) {
  const rows = batch.records.filter(record => record.decision.startsWith("admitted-")).map(record => ({
    ...record,
    linkedNodes:record.linkedNodes || publishedById.get(record.id)?.linkedNodes || []
  }));
  const prelude = batchNumber === 1
    ? '  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="anthropic"));\n'
    : "";
  const js = `/* Generated from ${batch.batch.id}.json and Anthropic value-score batches. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n${prelude}  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"anthropic",title:row.title,publisher:"Anthropic",collection:"Anthropic 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${REVIEWED_AT}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Anthropic 的实现与声明","使用前应复核页面状态和版本"],tags:["anthropic","官方技术资料",row.matrixContribution,row.primaryCategory],topicTags:[row.primaryCategory],primaryCategory:row.primaryCategory,linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${REVIEWED_AT}",reviewBatch:"${batch.batch.id}",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),contentTier:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,valueScore:row.valueScore||null,scoreBatch:row.scoreBatch||"",recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","替代路径或关闭日期变化"]:[]}));\n})();\n`;
  fs.writeFileSync(path.join(PROJECT_ROOT, "data", `library-official-anthropic-importance-0${batchNumber}.js`), js, "utf8");
}

function runScoreBatch({ batchNumber, definitions, candidateCount = 60 }) {
  const scoreBatchId = `anthropic-value-score-batch-0${batchNumber}`;
  const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${scoreBatchId}.json`);
  const batches = auditPaths.map(file => JSON.parse(fs.readFileSync(file, "utf8")));
  const allRecords = batches.flatMap(batch => batch.records);
  const byId = new Map(allRecords.map(record => [record.id, record]));
  const publishedById = new Map(loadPublishedAnthropic().map(item => [item.id, item]));
  const previous = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf8")) : null;
  const candidates = previous
    ? previous.results.map(result => byId.get(result.id))
    : allRecords.filter(record => record.decision.startsWith("admitted-") && !record.valueScore).slice(0, candidateCount);
  if (candidates.length !== candidateCount || candidates.some(record => !record)) throw new Error(`${scoreBatchId} must resolve exactly ${candidateCount} frozen candidates`);
  if (definitions.length !== candidateCount) throw new Error(`${scoreBatchId} needs ${candidateCount} score definitions, got ${definitions.length}`);

  const results = candidates.map((record, index) => {
    const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = definitions[index];
    const total = knowledgeImportance + irreplaceability + durability + applicability;
    const passed = total >= 6 && knowledgeImportance >= 2;
    const originalDecision = record.previousDecision || record.decision;
    const score = {
      policy:POLICY, reviewedAt:REVIEWED_AT,
      knowledgeImportance, irreplaceability, durability, applicability, total,
      threshold:6, knowledgeImportanceMinimum:2, passed, rationale
    };
    if (!record.linkedNodes && publishedById.get(record.id)?.linkedNodes) record.linkedNodes = [...publishedById.get(record.id).linkedNodes];
    record.valueScore = score;
    record.scoreBatch = scoreBatchId;
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
  const payload = {
    policy:POLICY,
    batch:{ id:scoreBatchId, reviewedAt:REVIEWED_AT, candidateCount,
      selection:`Anthropic 已通过且未评分清单按原审核顺序排列的第 ${batchNumber} 批 ${candidateCount} 份资料`,
      admissionRule:"总分至少 6/10，且知识重要性至少 2/3" },
    results,
    summary:{ reviewed:candidateCount, retained:results.filter(result => result.scores.passed).length, removed:results.filter(result => !result.scores.passed).length }
  };

  allRecords.forEach(record => {
    if (record.decision.startsWith("admitted-")) record.primaryCategory = classifyTopic(record);
    else delete record.primaryCategory;
  });

  batches.forEach((batch, index) => {
    batch.admittedObjectIds = batch.records.filter(record => record.decision.startsWith("admitted-")).map(record => record.id);
    batch.summary = summarize(batch.records);
    fs.writeFileSync(auditPaths[index], `${JSON.stringify(batch, null, 2)}\n`, "utf8");
    generateDataFile(batch, index + 1, publishedById);
  });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
  const decisionByUrl = new Map(allRecords.map(record => [record.canonicalUrl, record]));
  inventory.records.forEach(record => {
    const decision = decisionByUrl.get(record.canonicalUrl);
    if (!decision) return;
    record.reviewStatus = decision.decision;
    record.reviewReason = decision.reason;
    if (decision.decision.startsWith("admitted-")) {
      record.cardId = decision.id;
      record.primaryCategory = decision.primaryCategory;
    } else {
      delete record.cardId;
      delete record.primaryCategory;
    }
    if (decision.valueScore) {
      record.valueScore = decision.valueScore;
      record.scoreBatch = decision.scoreBatch;
    }
  });
  inventory.summary.admitted = inventory.records.filter(record => String(record.reviewStatus).startsWith("admitted-")).length;
  inventory.summary.rejectedAfterContentReview = inventory.records.filter(record => String(record.reviewStatus).startsWith("rejected-")).length;
  inventory.summary.pendingContentReview = inventory.records.filter(record => record.reviewStatus === "pending-importance-review").length;
  fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
  return payload;
}

module.exports = { runScoreBatch, classifyTopic };
