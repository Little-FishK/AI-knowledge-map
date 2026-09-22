"use strict";

const fs = require("fs");
const {createAuthorizedRepair}=require('./lib/information-theory-authorized-repair');
const {createAuditUpgrade}=require('./lib/audit-upgrade');
const path = require("path");
const vm = require("vm");
const { createReadinessCheckpoint } = require('./lib/readiness-checkpoint');
const { createAuditProjectAccess } = require("./lib/audit-project-access");
const { createAuditRules } = require("./lib/audit-rules");
const { createCandidateGate } = require("./lib/candidate-gate");
const { createContentGeneration } = require("./lib/content-generation");
const { createContentGenerationResponseStore } = require("./lib/content-generation-response-store");
const { createControllerLifecycle } = require("./lib/controller-lifecycle");
const { createEditorialCandidateImport } = require("./lib/editorial-candidate-import");
const { createEditorialCandidateValidation } = require("./lib/editorial-candidate-validation");
const { createManualReviewWorkflow } = require("./lib/manual-review-workflow");
const { createManualReviewPreviewServices } = require("./lib/manual-review-preview");
const { createLocalDataMigration } = require("./lib/local-data-migration");
const { createNewNodeQueue } = require("./lib/new-node-queue");
const { createPublication } = require("./lib/publication");
const { createResultSubmissionWorkflow } = require("./lib/result-submission-workflow");
const { createReviewRecovery } = require("./lib/review-recovery");
const { createStateDiagnostics } = require("./lib/state-diagnostics");
const { createStateV2Backfill } = require("./lib/state-v2-backfill");
const { createStateV2Cutover } = require("./lib/state-v2-cutover");
const { createStateV2DualRead } = require("./lib/state-v2-dual-read");
const { createStateV2Shadow } = require("./lib/state-v2-shadow");
const { createTaskOrchestration } = require("./lib/task-orchestration");
const { createTranslationPreparation } = require("./lib/translation-preparation");
const { createTranslationBatch } = require("./lib/translation-batch");
const { createTranslationDeepSeek } = require("./lib/translation-deepseek");
const { createTranslationQuality } = require("./lib/translation-quality");
const { createTranslationPublication } = require("./lib/translation-publication");
const {
  renderEditorialMarkdown,
} = require("./lib/editorial-markdown");
const { clone, createStateStore, sha256 } = require("./lib/state-store");
const { resolveLocalDataRoot } = require("../shared/local-data-root");

const ROOT = path.join(__dirname, "..", "..");
const TOOL_SCRIPTS = Object.freeze({
  graphValidator: "tools/validators/graph.js",
  deepDiveValidator: "tools/validators/deepdives.js",
  videoApplicationValidator: "tools/validators/video-applications.js",
  deepDiveL2Audit: "tools/deepdive/quality/audit-deepdive-gold.js",
  deepDiveL3Audit: "tools/deepdive/quality/audit-deepdive-benchmark.js",
});
const STATE_SCHEMA_VERSION = 2;
const {
  acquireLock,
  appendEvent,
  atomicWrite,
  loadState,
  readJson,
  resultDirectory,
  runtimeDirectory,
  saveState,
  stageDirectory,
  stateFile,
  withinRoot,
  writeJson,
} = createStateStore({
  defaultRoot: ROOT,
  schemaVersion: STATE_SCHEMA_VERSION,
  localDataRoot: resolveLocalDataRoot(),
});
const { loadState: loadLegacyState } = createStateStore({
  defaultRoot: ROOT,
  schemaVersion: 1,
  localDataRoot: resolveLocalDataRoot(),
});
const translationStorageDirectory = root => path.resolve(root) === path.resolve(ROOT)
  ? path.join(resolveLocalDataRoot(), "deepdive-translation")
  : path.join(path.resolve(root), ".translation");
const {
  inspectTranslationSourceBinding,
  registerSourceHumanConfirmation,
  exportTranslationSnapshot,
  readTranslationSnapshot,
  prepareTranslationTask,
  checkTranslationSnapshot,
  withCurrentTranslationSnapshot,
} = createTranslationPreparation({
  defaultRoot: ROOT,
  acquireLock,
  loadState,
  storageDirectory: translationStorageDirectory,
});
const translationBatch = createTranslationBatch({
  storageDirectory: translationStorageDirectory,
  readTranslationSnapshot,
  prepareTranslationTask,
  checkTranslationSnapshot,
});
const translationQuality = createTranslationQuality({
  storageDirectory: translationStorageDirectory,
  translationReviewMaterial: (root, pageId, planId, provider = "openai") => {
    if (provider === "deepseek") return translationDeepSeek.translationReviewMaterial(root, pageId, planId);
    if (provider === "openai") return translationBatch.translationReviewMaterial(root, pageId, planId);
    throw new Error("Unknown translation provider");
  },
  readTranslationSnapshot,
  checkTranslationSnapshot,
});
const translationDeepSeek = createTranslationDeepSeek({
  storageDirectory: translationStorageDirectory,
  readTranslationSnapshot,
  prepareTranslationTask,
  checkTranslationSnapshot,
});
const translationPublication = createTranslationPublication({
  storageDirectory: translationStorageDirectory,
  withTranslationQualityMaterial: translationQuality.withTranslationQualityMaterial,
  withCurrentTranslationSnapshot,
  automaticVerifier: require('./lib/translation-browser-verifier').verifyTranslationBrowser,
});
const translationCampaign = require('./lib/translation-campaign').createTranslationCampaign({
  storageDirectory: translationStorageDirectory, readTranslationSnapshot, prepareTranslationTask,
  checkTranslationSnapshot, quality: translationQuality,
  autoPublish: translationPublication.autoPublishTranslation,
});
const { stateStorageReport } = createStateDiagnostics({
  defaultRoot: ROOT,
  loadState,
  stateFile,
  withinRoot,
});
const {
  readResponseObject,
  readResponsesDual,
  readResponsesV2,
  writeResponseObject,
} = createContentGenerationResponseStore({
  atomicWrite,
  clone,
  readJson,
  sha256,
  withinRoot,
});
const { backfillStateV2Objects } = createStateV2Backfill({
  defaultRoot: ROOT,
  acquireLock,
  appendEvent,
  clone,
  loadState: loadLegacyState,
  readResponseObject,
  saveState,
  sha256,
  writeResponseObject,
});
const { buildStateV2Shadow, rehydrateShadow } = createStateV2Shadow({
  defaultRoot: ROOT,
  acquireLock,
  atomicWrite,
  clone,
  loadState: loadLegacyState,
  readResponseObject,
  readJson,
  sha256,
  writeResponseObject,
  withinRoot,
});
const { validateStateV2DualRead } = createStateV2DualRead({
  defaultRoot: ROOT,
  clone,
  loadState: loadLegacyState,
  readJson,
  readResponsesDual,
  rehydrateShadow,
  sha256,
  withinRoot,
});
const { switchStateV2 } = createStateV2Cutover({
  defaultRoot: ROOT,
  acquireLock,
  appendEvent,
  atomicWrite,
  clone,
  readJson,
  readResponseObject,
  rehydrateShadow,
  sha256,
  stateFile,
  withinRoot,
});
const {
  migrate: migrateLocalData,
  status: localDataStatus,
} = createLocalDataMigration({
  defaultRoot: ROOT,
  acquireLock,
  appendEvent,
  loadState,
  runtimeDirectory,
  stageDirectory,
});
const {
  readAuditProjectFile,
  searchAuditProject,
} = createAuditProjectAccess({
  defaultRoot: ROOT,
  loadState,
  withinRoot,
});
const {AUDIT_SCHEMA_VERSION,AUDIT_POLICY_ID,SIX_QUESTIONS,L3_BLOCKING_CRITERIA,L3_NON_BLOCKING_SIGNALS,L3_BLOCKER_CODES,L3_WARNING_CODES,LEGACY_BLOCKER_CODES}=require("../deepdive/quality/audit-policy");
const CONTENT_GENERATION_PROMPT = [
  "把当前章节解析并改写为可直接用于“理解原理页”的完整教学正文。",
  "自然讲清本节的核心概念是什么、解决什么问题、输入与输出、关键机制与因果链、公式或示例中每一步的含义、结果应如何解释，以及适用条件和边界。将这些内容融入连贯叙述，不要使用固定的模板或审计清单。",
  "以当前章节材料为事实边界。可以补充理解该机制所必需的通用解释和推导，但不得新增缺少材料支持的关键事实、具体数据、来源或结论；不得依赖尚未读取的其他章节。保留原有事实、数字、术语含义及图表表达的关系。",
  "公式使用可直接显示的 Unicode 数学符号，例如 ∂、×、ε、≤、→，不得输出带反斜杠的 LaTeX 命令。",
  "不要生成“常见误解”、自测、答案或额外总结章节；不要出现“以下是解析”“本节主要介绍”等元话语。避免重复、空泛类比和模板化表达。输出只包含可以直接采用的章节正文。",
].join("\n\n");
const QUEUE_BY_ROLE = {
  audit: "audit-queued",
  write: "write-queued",
  update: "update-queued",
  repair: "repair-queued",
  "content-generation": "content-generation-queued",
};
const ACTIVE_BY_ROLE = {
  audit: "auditing",
  write: "writing",
  update: "updating",
  repair: "repairing",
  "content-generation": "content-generating",
};
const ROLE_PRIORITY = ["repair", "update", "write", "audit"];
const WRITING_NARRATIVE_POLICY = [
  "【大量模板化表达硬约束】不得把原文中多样化的章节开场统一改写成定义句。",
  "“是在 / 是一类 / 是一种 / 是…… / 指的是 / 可以理解为”等都属于同一个 definition-copula 句式家族，替换连接词不算句式多样化。",
  "只修改审查明确指出的问题章节、必要的相邻衔接句，以及为消除新发现的整页重复所必需的其他章节。",
  "提交前逐节检查第一个实质句：同一句式家族不得覆盖至少 3 节且不少于全部教学章节一半。",
  "优先保留原文已有的提问、案例、冲突、现象、因果和责任场景开场；若不影响本次缺陷修复，不得将其改成“X 是 X”。",
  "不生成独立‘常见误解’章节，不生成自测及答案；必要的误解澄清应融入对应正文。",
  "返修不得添加、删除或替换页面来源，也不得修改未被指出的章节；仅可连带修改必要的相邻衔接句，或为消除新发现的整页重复而修改其他章节。",
].join("\n");
const CODEX_TASK_ARCHIVE_TOOL = "set_thread_archived";
const CODEX_TASK_ARCHIVE_STATUSES = [
  "accepted",
  "content-generated",
  "needs-repair",
  "l3-auto-passed",
  "awaiting-human-review",
  "rejected",
];
const DEFAULT_EDITORIAL_REMOVED_SECTIONS = ["常见误解", "常见误区", "自测", "检查你是否真的理解"];
const CONTENT_GENERATION_SKIPPED_TITLES = ["常见误解", "常见误区", "自测", "检查你是否真的理解"];
const CONTENT_GENERATION_MAX_RESPONSE_CHARS = 100_000;
const {
  contentGenerationManifest,
  contentGenerationMarkdown,
  contentGenerationOutputShape,
  contentGenerationResponseEncodingError,
  contentGenerationResultGaps,
  contentGenerationReviewMaterial,
  contentGenerationSections,
  enqueueContentGeneration,
  isConfiguredRemovedSectionTitle,
  readContentGenerationSection,
  saveContentGenerationResponse,
} = createContentGeneration({
  defaultRoot: ROOT,
  prompt: CONTENT_GENERATION_PROMPT,
  skippedTitles: CONTENT_GENERATION_SKIPPED_TITLES,
  removedSectionTitles: DEFAULT_EDITORIAL_REMOVED_SECTIONS,
  maxResponseChars: CONTENT_GENERATION_MAX_RESPONSE_CHARS,
  activeRecord: (...args) => activeRecord(...args),
  authorizeTaskLease: (...args) => authorizeTaskLease(...args),
  clone,
  expireLease: (...args) => expireLease(...args),
  sha256,
  acquireLock,
  appendEvent,
  atomicWrite,
  loadState,
  readResponsesV2,
  saveState,
  writeResponseObject,
  withinRoot,
});
const {
  editorialContentPolicyGaps,
  editorialPreservationReport,
  exactHtmlBlocks,
  htmlBlockWithClass,
  pageSourceSignature,
  sectionRecordsForPreservation,
  validatePage,
  visibleRawLatexSections,
} = createEditorialCandidateValidation({
  isConfiguredRemovedSectionTitle,
  sha256,
});
const {
  activeRecord,
  archiveCurrentTaskDirective,
  auditContract,
  authorizeTaskLease,
  claimTask,
  currentPage,
  expireLease,
  readCandidate,
  readTaskPacketPart,
  releaseLease,
} = createTaskOrchestration({
  defaultRoot: ROOT,
  toolScripts: TOOL_SCRIPTS,
  queueByRole: QUEUE_BY_ROLE,
  activeByRole: ACTIVE_BY_ROLE,
  rolePriority: ROLE_PRIORITY,
  writingNarrativePolicy: WRITING_NARRATIVE_POLICY,
  auditSchemaVersion: AUDIT_SCHEMA_VERSION,
  blockingCriteria: L3_BLOCKING_CRITERIA,
  nonBlockingSignals: L3_NON_BLOCKING_SIGNALS,
  archiveTool: CODEX_TASK_ARCHIVE_TOOL,
  archiveStatuses: CODEX_TASK_ARCHIVE_STATUSES,
  contentGenerationPrompt: CONTENT_GENERATION_PROMPT,
  acquireLock,
  appendEvent,
  clone,
  contentGenerationManifest,
  contentGenerationOutputShape,
  contentGenerationReviewMaterial,
  loadState,
  pageSourceSignature,
  readJson,
  saveState,
  stageDirectory,
  withinRoot,
});
const {
  initialize,
  loadSupplementQueue,
  mergePendingSupplements,
  retry,
  setPaused,
  status,
} = createControllerLifecycle({
  defaultRoot: ROOT,
  schemaVersion: STATE_SCHEMA_VERSION,
  queueByRole: QUEUE_BY_ROLE,
  acquireLock,
  activeRecord,
  appendEvent,
  clone,
  expireLease,
  loadState,
  readJson,
  saveState,
  stateFile,
});
const {
  resetManualReview,
  resetPassedPage,
} = createReviewRecovery({
  defaultRoot: ROOT,
  acquireLock,
  appendEvent,
  loadState,
  saveState,
});
const { enqueueNewNode } = createNewNodeQueue({
  defaultRoot: ROOT,
  acquireLock,
  appendEvent,
  clone,
  loadState,
  saveState,
});
const { auditBlockers, auditGaps } = createAuditRules({
  schemaVersion: AUDIT_SCHEMA_VERSION,
  sixQuestions: SIX_QUESTIONS,
  blockerCodes: L3_BLOCKER_CODES,
  warningCodes: L3_WARNING_CODES,
  legacyBlockerCodes: LEGACY_BLOCKER_CODES,
  visibleRawLatexSections,
  auditContract: (...args) => auditContract(...args),
  clone,
  sha256,
});
const {
  applyCoreMembership,
  candidateRelativePath,
  editorialPublicationRelativePath,
  loadRuntimeIds,
  pageRegistrationSource,
  privateAuditRelativePath,
  provisionalPageMetadata,
  provisionalPublicationRelativePath,
  provisionalPublishedTargets,
  publishCandidate,
  publishEditorialHumanApprovedCandidate,
  refreshEditorialDraftPublication,
  restoreTarget,
  runtimeManifestSource,
  runtimeSource,
  targetRecord,
  writePublicationTargets,
} = createPublication({
  toolScripts: TOOL_SCRIPTS,
  clone,
  sha256,
  atomicWrite,
  readJson,
  withinRoot,
  writeJson,
  loadSupplementQueue,
  runGate: (...args) => runGate(...args),
});
const {
  evaluateCandidate,
  diagnoseCandidateGate,
  gateDefects,
  refreshBlockers,
  runGate,
} = createCandidateGate({
  defaultRoot: ROOT,
  toolScripts: TOOL_SCRIPTS,
  acquireLock,
  appendEvent,
  applyCoreMembership,
  clone,
  currentPage,
  loadRuntimeIds,
  loadState,
  pageRegistrationSource,
  readJson,
  runtimeManifestSource,
  runtimeSource,
  saveState,
  withinRoot,
});
const {
  createManualReviewPreview,
  ensureReviewHistory,
} = createManualReviewPreviewServices({
  defaultRoot: ROOT,
  acquireLock,
  atomicWrite,
  clone,
  loadState,
  readCandidate,
  withinRoot,
});
const {
  submitResult,
  validateAuditResult,
  validatePageResult,
} = createResultSubmissionWorkflow({
  defaultRoot: ROOT,
  toolScripts: TOOL_SCRIPTS,
  queueByRole: QUEUE_BY_ROLE,
  acquireLock,
  appendEvent,
  archiveCurrentTaskDirective,
  atomicWrite,
  auditBlockers,
  auditContract,
  auditGaps,
  authorizeTaskLease,
  candidateRelativePath,
  clone,
  contentGenerationMarkdown,
  contentGenerationResultGaps,
  contentGenerationReviewMaterial,
  currentPage,
  editorialContentPolicyGaps,
  editorialPreservationReport,
  ensureReviewHistory,
  evaluateCandidate,
  expireLease,
  gateDefects,
  loadState,
  pageSourceSignature,
  privateAuditRelativePath,
  publishCandidate,
  readResponsesV2,
  refreshEditorialDraftPublication,
  resultDirectory,
  runGate,
  saveState,
  sha256,
  validatePage,
  visibleRawLatexSections,
  withinRoot,
  writeResponseObject,
  writeJson,
});
const {
  importEditorialCandidate,
} = createEditorialCandidateImport({
  defaultRoot: ROOT,
  defaultRemovedSectionTitles: DEFAULT_EDITORIAL_REMOVED_SECTIONS,
  acquireLock,
  activeRecord,
  appendEvent,
  clone,
  contentGenerationResponseEncodingError,
  editorialContentPolicyGaps,
  editorialPreservationReport,
  exactHtmlBlocks,
  expireLease,
  htmlBlockWithClass,
  isConfiguredRemovedSectionTitle,
  loadState,
  candidateRelativePath,
  editorialPublicationRelativePath,
  provisionalPublishedTargets,
  restoreTarget,
  saveState,
  sectionRecordsForPreservation,
  sha256,
  targetRecord,
  validatePage,
  withinRoot,
  writeJson,
  writePublicationTargets,
});
const {
  finalizeManualReview,
  inspectPublicationCandidate,
  publishProvisionalPage,
  returnEditorialForRevision,
  rollbackEditorialCandidate,
  rollbackProvisionalPage,
} = createManualReviewWorkflow({
  defaultRoot: ROOT,
  acquireLock,
  appendEvent,
  loadState,
  readJson,
  resultDirectory,
  saveState,
  withinRoot,
  writeJson,
  clone,
  sha256,
  currentPage,
  auditContract,
  auditGaps,
  auditBlockers,
  evaluateCandidate,
  editorialContentPolicyGaps,
  publishCandidate,
  publishEditorialHumanApprovedCandidate,
  refreshEditorialDraftPublication,
  provisionalPageMetadata,
  provisionalPublishedTargets,
  writePublicationTargets,
  provisionalPublicationRelativePath,
  editorialPublicationRelativePath,
  restoreTarget,
});

function recommendedPathPages(root) {
  const resolvedRoot = path.resolve(root);
  const graphSource = fs.readFileSync(path.join(resolvedRoot, "data", "graph.js"), "utf8");
  const graphContext = { window: {} };
  vm.createContext(graphContext);
  vm.runInContext(graphSource, graphContext);
  const phases = graphContext.window.GRAPH
    && Array.isArray(graphContext.window.GRAPH.recommendedLearningPath)
    ? graphContext.window.GRAPH.recommendedLearningPath
    : [];
  return phases.flatMap(phase => (phase.steps || []).map(step => ({
    order: String(step[0]),
    pageId: String(step[1]),
    phase: String(phase.phase || ""),
  })));
}

function resolveRecommendedPage(root = ROOT, order) {
  const resolvedRoot = path.resolve(root);
  const requestedOrder = String(order || "");
  const page = recommendedPathPages(resolvedRoot).find(item => item.order === requestedOrder);
  if (!page) throw new Error(`官方推荐学习路径中不存在节点：${requestedOrder}`);
  const state = loadState(resolvedRoot);
  const record = state.pages[page.pageId] || null;
  return {
    status: "resolved",
    order: page.order,
    pageId: page.pageId,
    phase: page.phase,
    tracked: Boolean(record),
    pageState: record ? record.state : null,
    active: Boolean(record && record.lease),
    activeRole: record && record.lease ? record.lease.role : null,
    contentGeneration: record && record.contentGeneration ? {
      status: record.contentGeneration.status || null,
      sourceOrder: record.contentGeneration.sourceOrder || null,
      outputFile: record.contentGeneration.outputFile || null,
      outputHash: record.contentGeneration.outputHash || null,
    } : null,
  };
}

function nextRecommendedPage(root = ROOT, startOrder = "1.3") {
  const resolvedRoot = path.resolve(root);
  const state = loadState(resolvedRoot);
  const ordered = recommendedPathPages(resolvedRoot);
  const startIndex = ordered.findIndex(item => item.order === String(startOrder));
  if (startIndex < 0) throw new Error(`官方推荐学习路径中不存在起点：${startOrder}`);
  const terminalStates = new Set(["l3-auto-passed", "published-approved", "manual-review"]);
  const next = ordered.slice(startIndex).find(item => {
    const record = state.pages[item.pageId];
    return record && !terminalStates.has(record.state);
  });
  if (!next) {
    return {
      status: "complete",
      startOrder: String(startOrder),
      remaining: 0,
    };
  }
  const record = state.pages[next.pageId];
  return {
    status: "next",
    startOrder: String(startOrder),
    order: next.order,
    pageId: next.pageId,
    phase: next.phase,
    pageState: record.state,
    active: Boolean(record.lease),
    activeRole: record.lease ? record.lease.role : null,
  };
}

module.exports = {
  buildWebsite: require('./lib/website-build').createWebsiteBuild({acquireLock,loadState,readJson,withinRoot, publishedTranslation:translationPublication.publishedTranslation}),
  ...createAuditUpgrade({acquireLock,loadState,currentPage,readJson,withinRoot,writeJson,saveState,clone,sha256}),
  applyInformationTheoryAuthorizedRepair: createAuthorizedRepair({acquireLock,loadState,currentPage,writeJson,withinRoot,saveState}),
  applyTransformerAuthorizedSources: require('./lib/transformer-authorized-sources').createAuthorizedSources({acquireLock,loadState,currentPage,writeJson,withinRoot,saveState}),
  inspectTranslationSourceBinding,
  registerSourceHumanConfirmation,
  translationQuality,
  translationPublication,
  translationBatch,
  translationDeepSeek,
  translationCampaign,
  exportTranslationSnapshot,
  readTranslationSnapshot,
  prepareTranslationTask,
  checkTranslationSnapshot,
  ROOT,
  CONTENT_GENERATION_PROMPT,
  SIX_QUESTIONS,
  L3_BLOCKING_CRITERIA,
  L3_NON_BLOCKING_SIGNALS,
  applyCoreMembership,
  auditBlockers,
  auditGaps,
  backfillStateV2Objects,
  buildStateV2Shadow,
  claimTask,
  contentGenerationSections,
  createManualReviewPreview,
  enqueueContentGeneration,
  enqueueNewNode,
  editorialContentPolicyGaps,
  evaluateCandidate,
  finalizeManualReview,
  gateDefects,
  initialize,
  importEditorialCandidate,
  inspectPublicationCandidate,
  localDataStatus,
  loadState,
  mergePendingSupplements,
  migrateLocalData,
  nextRecommendedPage,
  resolveRecommendedPage,
  pageRegistrationSource,
  publishCandidate,
  publishProvisionalPage,
  readAuditProjectFile,
  readContentGenerationSection,
  readTaskPacketPart,
  refreshBlockers,
  diagnoseCandidateGate,
  createReadinessCheckpoint: (root = ROOT, options = {}) => createReadinessCheckpoint({root,runtimeDirectory,acquireLock,loadState,prunePrevious:options.prunePrevious===true}),
  releaseLease,
  renderEditorialMarkdown,
  resetManualReview,
  resetPassedPage,
  returnEditorialForRevision,
  rollbackProvisionalPage,
  rollbackEditorialCandidate,
  retry,
  searchAuditProject,
  saveContentGenerationResponse,
  setPaused,
  sha256,
  status,
  stateStorageReport,
  submitResult,
  switchStateV2,
  validateAuditResult,
  validateStateV2DualRead,
  validatePageResult,
  validatePage,
};
