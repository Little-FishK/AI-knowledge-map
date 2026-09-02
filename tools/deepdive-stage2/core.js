"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createAuditProjectAccess } = require("./lib/audit-project-access");
const { createAuditRules } = require("./lib/audit-rules");
const { createCandidateGate } = require("./lib/candidate-gate");
const { createContentGeneration } = require("./lib/content-generation");
const { createControllerLifecycle } = require("./lib/controller-lifecycle");
const { createEditorialCandidateImport } = require("./lib/editorial-candidate-import");
const { createEditorialCandidateValidation } = require("./lib/editorial-candidate-validation");
const { createManualReviewWorkflow } = require("./lib/manual-review-workflow");
const { createManualReviewPreviewServices } = require("./lib/manual-review-preview");
const { createNewNodeQueue } = require("./lib/new-node-queue");
const { createPublication } = require("./lib/publication");
const { createResultSubmissionWorkflow } = require("./lib/result-submission-workflow");
const { createReviewRecovery } = require("./lib/review-recovery");
const { createTaskOrchestration } = require("./lib/task-orchestration");
const {
  renderEditorialMarkdown,
} = require("./lib/editorial-markdown");
const { clone, createStateStore, sha256 } = require("./lib/state-store");

const ROOT = path.join(__dirname, "..", "..");
const TOOL_SCRIPTS = Object.freeze({
  graphValidator: "tools/validators/graph.js",
  deepDiveValidator: "tools/validators/deepdives.js",
  videoApplicationValidator: "tools/validators/video-applications.js",
  deepDiveL2Audit: "tools/deepdive/quality/audit-deepdive-gold.js",
  deepDiveL3Audit: "tools/deepdive/quality/audit-deepdive-benchmark.js",
});
const STATE_SCHEMA_VERSION = 1;
const {
  acquireLock,
  appendEvent,
  atomicWrite,
  loadState,
  readJson,
  resultDirectory,
  saveState,
  stageDirectory,
  stateFile,
  withinRoot,
  writeJson,
} = createStateStore({
  defaultRoot: ROOT,
  schemaVersion: STATE_SCHEMA_VERSION,
});
const {
  readAuditProjectFile,
  searchAuditProject,
} = createAuditProjectAccess({
  defaultRoot: ROOT,
  loadState,
  withinRoot,
});
const AUDIT_SCHEMA_VERSION = 3;
const CONTENT_GENERATION_PROMPT = [
  "把当前章节解析并改写为可直接用于“理解原理页”的完整教学正文。",
  "自然讲清本节的核心概念是什么、解决什么问题、输入与输出、关键机制与因果链、公式或示例中每一步的含义、结果应如何解释，以及适用条件和边界。将这些内容融入连贯叙述，不要使用固定的模板或审计清单。",
  "以当前章节材料为事实边界。可以补充理解该机制所必需的通用解释和推导，但不得新增缺少材料支持的关键事实、具体数据、来源或结论；不得依赖尚未读取的其他章节。保留原有事实、数字、术语含义及图表表达的关系。",
  "公式使用可直接显示的 Unicode 数学符号，例如 ∂、×、ε、≤、→，不得输出带反斜杠的 LaTeX 命令。",
  "不要生成“常见误解”、自测、答案或额外总结章节；不要出现“以下是解析”“本节主要介绍”等元话语。避免重复、空泛类比和模板化表达。输出只包含可以直接采用的章节正文。",
].join("\n\n");
const SIX_QUESTIONS = [
  "definition",
  "problem",
  "inputOutput",
  "mechanism",
  "interpretation",
  "boundary",
];
const L3_BLOCKING_CRITERIA = [
  { code: "factual-error", category: "fact", label: "知识事实错误" },
  { code: "formula-error", category: "fact", label: "公式、推导或符号关系错误" },
  { code: "terminology-error", category: "fact", label: "术语含义使用错误" },
  { code: "numeric-error", category: "fact", label: "数值、计算或量级错误" },
  { code: "source-support-blocked", category: "fact", label: "现有来源不能支持关键事实；来源列表不得由返修 Agent 修改" },
  { code: "core-concept-definition-missing", category: "concept", label: "核心概念没有解释是什么" },
  { code: "core-concept-problem-missing", category: "concept", label: "核心概念没有解释解决什么问题" },
  { code: "core-concept-boundary-missing", category: "concept", label: "核心概念没有解释适用边界" },
  { code: "harmful-repetition", category: "whole-page", label: "跨章节存在明显损害阅读的重复" },
  { code: "terminology-inconsistent", category: "whole-page", label: "同一术语或符号前后不一致" },
  { code: "image-text-mismatch", category: "whole-page", label: "正文与图表表达矛盾或引用错位" },
  { code: "harmful-template-expression", label: "大量模板化表达明显损害教学叙事" },
  { code: "semantic-fragment", label: "语义残缺或明显无法理解" },
];
const L3_NON_BLOCKING_SIGNALS = [
  { code: "minor-repetition", label: "轻微重复但不影响理解" },
  { code: "minor-terminology-style", label: "术语写法可统一但含义没有冲突" },
  { code: "minor-image-caption", label: "图注或衔接可改善但图文没有矛盾" },
  { code: "minor-readability", label: "表达可以更顺畅但不存在语义残缺" },
];
const L3_BLOCKER_CODES = new Set(L3_BLOCKING_CRITERIA.map(item => item.code));
const L3_WARNING_CODES = new Set(L3_NON_BLOCKING_SIGNALS.map(item => item.code));
const LEGACY_BLOCKER_CODES = new Set([...L3_BLOCKER_CODES, "critical-factual-error"]);
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
  saveState,
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
  refreshEditorialDraftPublication,
  resultDirectory,
  runGate,
  saveState,
  sha256,
  validatePage,
  visibleRawLatexSections,
  withinRoot,
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
  ROOT,
  CONTENT_GENERATION_PROMPT,
  SIX_QUESTIONS,
  L3_BLOCKING_CRITERIA,
  L3_NON_BLOCKING_SIGNALS,
  applyCoreMembership,
  auditBlockers,
  auditGaps,
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
  loadState,
  mergePendingSupplements,
  nextRecommendedPage,
  resolveRecommendedPage,
  pageRegistrationSource,
  publishCandidate,
  publishProvisionalPage,
  readAuditProjectFile,
  readContentGenerationSection,
  readTaskPacketPart,
  refreshBlockers,
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
  submitResult,
  validateAuditResult,
  validatePageResult,
  validatePage,
};
