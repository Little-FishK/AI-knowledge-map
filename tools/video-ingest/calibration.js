"use strict";

const DEFAULT_POLICY = {
  minimumJobs: 10,
  minimumCandidates: 30,
  minimumNewGold: 5,
  minimumExistingGold: 10,
  minimumRejectGold: 5,
  minimumCoreGold: 3,
  minimumResolvedCoverage: 0.95,
  minimumDecisionAccuracy: 0.9,
  minimumNewPrecision: 1,
  minimumNewRecall: 0.8,
  maximumDuplicateEscapeRate: 0,
  maximumRejectEscapeRate: 0,
  minimumCorePrecision: 1,
  minimumCoreRecall: 0.8
};

function ratio(numerator, denominator) {
  return denominator ? numerator / denominator : null;
}

function fixed(value) {
  return value == null ? null : Number(value.toFixed(4));
}

function calibrate(batch, labels, options = {}) {
  if (!batch || batch.mode !== "shadow-batch" || !Array.isArray(batch.results)) {
    throw new Error("batch 必须是 v0.3 shadow-batch 报告");
  }
  if (!labels || labels.schemaVersion !== 1 || !Array.isArray(labels.samples)) {
    throw new Error("labels 必须是 schemaVersion=1 且包含 samples");
  }
  const policy = { ...DEFAULT_POLICY, ...(labels.policy || {}), ...(options.policy || {}) };
  const resultById = new Map(batch.results.map(item => [item.id, item]));
  const rows = [];
  const errors = [];
  labels.samples.forEach(sample => {
    const result = resultById.get(sample.id);
    if (!result) {
      errors.push(`批次缺标注样本 ${sample.id}`);
      return;
    }
    const candidates = new Map((result.candidates || []).map(item => [item.term, item]));
    (sample.expected || []).forEach(expected => {
      const predicted = candidates.get(expected.term);
      if (!predicted) {
        errors.push(`样本 ${sample.id} 缺候选 ${expected.term}`);
        return;
      }
      rows.push({
        sampleId: sample.id,
        term: expected.term,
        expectedDecision: expected.decision,
        expectedCore: Boolean(expected.coreCandidate),
        predictedDecision: predicted.predictedDecision,
        predictedCore: Boolean(predicted.predictedCore),
        resolved: Boolean(predicted.predictedDecision),
        decisionCorrect: predicted.predictedDecision === expected.decision,
        blockers: predicted.blockers || []
      });
    });
  });

  const resolved = rows.filter(row => row.resolved);
  const goldNew = rows.filter(row => row.expectedDecision === "new");
  const predictedNew = rows.filter(row => row.predictedDecision === "new");
  const newTruePositive = rows.filter(row => row.expectedDecision === "new" && row.predictedDecision === "new").length;
  const existingGold = rows.filter(row => ["merge", "supplement"].includes(row.expectedDecision));
  const rejectGold = rows.filter(row => row.expectedDecision === "reject");
  const goldCore = rows.filter(row => row.expectedCore);
  const predictedCore = rows.filter(row => row.predictedCore);
  const coreTruePositive = rows.filter(row => row.expectedCore && row.predictedCore).length;
  const jobIds = new Set(rows.map(row => row.sampleId));
  const metrics = {
    jobs: jobIds.size,
    candidates: rows.length,
    resolved: resolved.length,
    unresolved: rows.length - resolved.length,
    resolvedCoverage: fixed(ratio(resolved.length, rows.length)),
    decisionAccuracy: fixed(ratio(resolved.filter(row => row.decisionCorrect).length, resolved.length)),
    newGold: goldNew.length,
    newPredicted: predictedNew.length,
    newPrecision: fixed(ratio(newTruePositive, predictedNew.length)),
    newRecall: fixed(ratio(newTruePositive, goldNew.length)),
    existingGold: existingGold.length,
    duplicateEscapes: existingGold.filter(row => row.predictedDecision === "new").length,
    duplicateEscapeRate: fixed(ratio(
      existingGold.filter(row => row.predictedDecision === "new").length,
      existingGold.length
    )),
    rejectGold: rejectGold.length,
    rejectEscapes: rejectGold.filter(row => row.predictedDecision === "new").length,
    rejectEscapeRate: fixed(ratio(
      rejectGold.filter(row => row.predictedDecision === "new").length,
      rejectGold.length
    )),
    coreGold: goldCore.length,
    corePredicted: predictedCore.length,
    corePrecision: fixed(ratio(coreTruePositive, predictedCore.length)),
    coreRecall: fixed(ratio(coreTruePositive, goldCore.length))
  };

  const checks = [
    ["minimumJobs", metrics.jobs >= policy.minimumJobs, metrics.jobs, policy.minimumJobs],
    ["minimumCandidates", metrics.candidates >= policy.minimumCandidates, metrics.candidates, policy.minimumCandidates],
    ["minimumNewGold", metrics.newGold >= policy.minimumNewGold, metrics.newGold, policy.minimumNewGold],
    ["minimumExistingGold", metrics.existingGold >= policy.minimumExistingGold, metrics.existingGold, policy.minimumExistingGold],
    ["minimumRejectGold", metrics.rejectGold >= policy.minimumRejectGold, metrics.rejectGold, policy.minimumRejectGold],
    ["minimumCoreGold", metrics.coreGold >= policy.minimumCoreGold, metrics.coreGold, policy.minimumCoreGold],
    ["minimumResolvedCoverage", metrics.resolvedCoverage != null && metrics.resolvedCoverage >= policy.minimumResolvedCoverage, metrics.resolvedCoverage, policy.minimumResolvedCoverage],
    ["minimumDecisionAccuracy", metrics.decisionAccuracy != null && metrics.decisionAccuracy >= policy.minimumDecisionAccuracy, metrics.decisionAccuracy, policy.minimumDecisionAccuracy],
    ["minimumNewPrecision", metrics.newPrecision != null && metrics.newPrecision >= policy.minimumNewPrecision, metrics.newPrecision, policy.minimumNewPrecision],
    ["minimumNewRecall", metrics.newRecall != null && metrics.newRecall >= policy.minimumNewRecall, metrics.newRecall, policy.minimumNewRecall],
    ["maximumDuplicateEscapeRate", metrics.duplicateEscapeRate != null && metrics.duplicateEscapeRate <= policy.maximumDuplicateEscapeRate, metrics.duplicateEscapeRate, policy.maximumDuplicateEscapeRate],
    ["maximumRejectEscapeRate", metrics.rejectEscapeRate != null && metrics.rejectEscapeRate <= policy.maximumRejectEscapeRate, metrics.rejectEscapeRate, policy.maximumRejectEscapeRate],
    ["minimumCorePrecision", metrics.corePrecision != null && metrics.corePrecision >= policy.minimumCorePrecision, metrics.corePrecision, policy.minimumCorePrecision],
    ["minimumCoreRecall", metrics.coreRecall != null && metrics.coreRecall >= policy.minimumCoreRecall, metrics.coreRecall, policy.minimumCoreRecall]
  ].map(([name, passed, actual, threshold]) => ({ name, passed, actual, threshold }));

  return {
    schemaVersion: 1,
    mode: "shadow-calibration",
    generatedAt: options.generatedAt || new Date().toISOString(),
    policy,
    metrics,
    checks,
    errors,
    failures: [
      ...errors,
      ...checks.filter(check => !check.passed).map(check =>
        `${check.name}: actual=${check.actual} threshold=${check.threshold}`
      )
    ],
    readyForAutomaticApplicationDevelopment: errors.length === 0 && checks.every(check => check.passed),
    formalWrites: 0,
    rows
  };
}

function renderCalibration(report) {
  const lines = [
    "# 视频概念轨 v0.5 影子校准",
    "",
    `- 样本任务：${report.metrics.jobs}`,
    `- 标注候选：${report.metrics.candidates}`,
    `- 已解析覆盖率：${report.metrics.resolvedCoverage == null ? "无" : Math.round(report.metrics.resolvedCoverage * 100) + "%"}`,
    `- 决策准确率：${report.metrics.decisionAccuracy == null ? "无" : Math.round(report.metrics.decisionAccuracy * 100) + "%"}`,
    `- 新节点精确率 / 召回率：${report.metrics.newPrecision} / ${report.metrics.newRecall}`,
    `- 重复节点逃逸率：${report.metrics.duplicateEscapeRate}`,
    `- 拒绝项误收率：${report.metrics.rejectEscapeRate}`,
    `- 核心节点精确率 / 召回率：${report.metrics.corePrecision} / ${report.metrics.coreRecall}`,
    `- 可以进入自动应用开发：${report.readyForAutomaticApplicationDevelopment ? "是" : "否"}`,
    `- 正式写入：${report.formalWrites}`,
    "",
    "## 门禁",
    ""
  ];
  report.checks.forEach(check => {
    lines.push(`- ${check.passed ? "✓" : "✗"} ${check.name}：${check.actual} / ${check.threshold}`);
  });
  if (report.errors.length) {
    lines.push("", "## 数据错误", "");
    report.errors.forEach(error => lines.push(`- ${error}`));
  }
  return lines.join("\n") + "\n";
}

module.exports = { DEFAULT_POLICY, calibrate, renderCalibration };
