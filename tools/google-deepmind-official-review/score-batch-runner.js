"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-24";
const POLICY = "google-deepmind-official-value-score-v1";
const auditPaths = [1, 2].map(number => path.join(
  PROJECT_ROOT, "proposals", "official-technical", `google-deepmind-importance-batch-0${number}.json`
));
const inventoryPath = path.join(
  PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-rereview-inventory-20260924.json"
);

function loadPublishedItems() {
  global.window = {};
  require(path.join(PROJECT_ROOT, "data", "library.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
  for (let number = 1; number <= 2; number++) {
    require(path.join(PROJECT_ROOT, "data", `library-official-google-deepmind-importance-0${number}.js`));
  }
  return global.window.PRO_LIBRARY.items.filter(item =>
    item.sourceClass === "official" && item.sourceSubcategory === "google-deepmind"
  );
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
  const rows = batch.records
    .filter(record => record.decision.startsWith("admitted-"))
    .map(record => ({
      ...record,
      linkedNodes:record.linkedNodes || publishedById.get(record.id)?.linkedNodes || []
    }));
  const prelude = batchNumber === 1
    ? '  window.PRO_LIBRARY.items=window.PRO_LIBRARY.items.filter(item=>!(item.sourceClass==="official"&&item.sourceSubcategory==="google-deepmind"));\n'
    : "";
  const js = `/* Generated from ${batch.batch.id}.json and Google/DeepMind value-score batches. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n${prelude}  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"google-deepmind",title:row.title,publisher:"Google",collection:"Google / Google DeepMind 官方技术资料",contentKind:"开发者指南",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${REVIEWED_AT}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 Google 的实现与声明","预览模型、价格和生命周期使用前应复核"],tags:["google","google-deepmind","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"价值评分通过",reviewPolicy:"google-deepmind-official-value-score-v1",reviewedAt:"${REVIEWED_AT}",reviewBatch:row.scoreBatch||row.reviewBatch,reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,valueScore:row.valueScore||null,scoreBatch:row.scoreBatch||"",recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","模型访问或替代状态变化"]:[]}));\n})();\n`;
  fs.writeFileSync(path.join(
    PROJECT_ROOT, "data", `library-official-google-deepmind-importance-0${batchNumber}.js`
  ), js, "utf8");
}

function runScoreBatch({ batchNumber, definitions, candidateCount = 60 }) {
  const scoreBatchId = `google-deepmind-value-score-batch-0${batchNumber}`;
  const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${scoreBatchId}.json`);
  const batches = auditPaths.map(file => JSON.parse(fs.readFileSync(file, "utf8")));
  const allRecords = batches.flatMap(batch => batch.records);
  const byId = new Map(allRecords.map(record => [record.id, record]));
  const publishedById = new Map(loadPublishedItems().map(item => [item.id, item]));
  const previous = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf8")) : null;
  const candidates = previous
    ? previous.results.map(result => byId.get(result.id))
    : allRecords.filter(record => record.decision.startsWith("admitted-") && !record.valueScore).slice(0, candidateCount);
  if (candidates.length !== candidateCount || candidates.some(record => !record)) {
    throw new Error(`${scoreBatchId} must resolve exactly ${candidateCount} frozen candidates`);
  }
  if (definitions.length !== candidateCount) {
    throw new Error(`${scoreBatchId} needs ${candidateCount} score definitions, got ${definitions.length}`);
  }

  const results = candidates.map((record, index) => {
    const [knowledgeImportance, irreplaceability, durability, applicability, rationale] = definitions[index];
    const total = knowledgeImportance + irreplaceability + durability + applicability;
    const passed = total >= 6 && knowledgeImportance >= 2;
    const originalDecision = record.previousDecision || record.decision;
    const scores = {
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
    if (!record.linkedNodes && publishedById.get(record.id)?.linkedNodes) {
      record.linkedNodes = [...publishedById.get(record.id).linkedNodes];
    }
    record.valueScore = scores;
    record.scoreBatch = scoreBatchId;
    if (passed) {
      record.decision = originalDecision;
      delete record.previousDecision;
    } else {
      if (!record.previousDecision) record.previousDecision = originalDecision;
      record.decision = "rejected-low-value-score";
      record.currentStatus = "current";
      record.reason = `价值评分 ${total}/10（知识重要性 ${knowledgeImportance}/3）：${rationale}`;
    }
    return { sequence:record.sequence, id:record.id, title:record.title, scores, finalDecision:record.decision };
  });

  const payload = {
    policy:POLICY,
    batch:{
      id:scoreBatchId,
      reviewedAt:REVIEWED_AT,
      candidateCount,
      selection:`Google/DeepMind 已通过重要性初审且未评分清单按原审核顺序排列的第 ${batchNumber} 批 ${candidateCount} 份资料`,
      admissionRule:"总分至少 6/10，且知识重要性至少 2/3"
    },
    results,
    summary:{
      reviewed:candidateCount,
      retained:results.filter(result => result.scores.passed).length,
      removed:results.filter(result => !result.scores.passed).length
    }
  };

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
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
  return payload;
}

module.exports = { runScoreBatch };
