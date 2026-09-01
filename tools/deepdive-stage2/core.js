"use strict";

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const { createAuditProjectAccess } = require("./lib/audit-project-access");
const { createAuditRules } = require("./lib/audit-rules");
const { createContentGeneration } = require("./lib/content-generation");
const { createEditorialCandidateImport } = require("./lib/editorial-candidate-import");
const { createEditorialCandidateValidation } = require("./lib/editorial-candidate-validation");
const { createManualReviewWorkflow } = require("./lib/manual-review-workflow");
const { createPublication } = require("./lib/publication");
const { createResultSubmissionWorkflow } = require("./lib/result-submission-workflow");
const {
  renderEditorialMarkdown,
} = require("./lib/editorial-markdown");
const { clone, createStateStore, sha256 } = require("./lib/state-store");
const { loadDeepDivePages } = require("../deepdive/runtime/deepdive-loader");
const { pageContentHash } = require("../deepdive/quality/deepdive-audit-contracts");
const {
  scanNarrativeTemplates,
} = require("../deepdive/quality/deepdive-narrative-audit");
const { transformGraph } = require("../video-ingest/node-application");
const { graphFingerprint } = require("../video-ingest/shadow-review");

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
  isConfiguredRemovedSectionTitle,
  readContentGenerationSection,
  saveContentGenerationResponse,
} = createContentGeneration({
  defaultRoot: ROOT,
  prompt: CONTENT_GENERATION_PROMPT,
  skippedTitles: CONTENT_GENERATION_SKIPPED_TITLES,
  removedSectionTitles: DEFAULT_EDITORIAL_REMOVED_SECTIONS,
  maxResponseChars: CONTENT_GENERATION_MAX_RESPONSE_CHARS,
  authorizeTaskLease,
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
const { auditBlockers, auditGaps } = createAuditRules({
  schemaVersion: AUDIT_SCHEMA_VERSION,
  sixQuestions: SIX_QUESTIONS,
  blockerCodes: L3_BLOCKER_CODES,
  warningCodes: L3_WARNING_CODES,
  legacyBlockerCodes: LEGACY_BLOCKER_CODES,
  visibleRawLatexSections,
  auditContract,
  clone,
  sha256,
});
const {
  applyCoreMembership,
  candidateRelativePath,
  editorialPublicationRelativePath,
  pageOverrideSource,
  pageRegistrationSource,
  privateAuditRelativePath,
  provisionalPageMetadata,
  provisionalPublicationRelativePath,
  provisionalPublishedTargets,
  publishCandidate,
  publishEditorialHumanApprovedCandidate,
  refreshEditorialDraftPublication,
  restoreTarget,
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
  runGate,
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

function archiveCurrentTaskDirective(reason) {
  return {
    required: true,
    tool: CODEX_TASK_ARCHIVE_TOOL,
    arguments: { archived: true },
    target: "current-task",
    reason,
    instruction: "调用 Codex 任务归档工具归档当前任务；省略 threadId，使工具作用于调用任务本身。归档后立即结束，不再领取任务。",
  };
}

function authorizeTaskLease(root, taskId, leaseToken) {
  const state = loadState(root);
  const record = Object.values(state.pages).find(page =>
    page.lease && page.lease.taskId === taskId
  );
  if (!record) throw new Error("任务包续读对应的活动租约不存在");
  if (record.lease.token !== leaseToken) throw new Error("任务包续读的租约令牌无效");
  if (Date.parse(record.lease.expiresAt) <= Date.now()) throw new Error("任务包续读的租约已经过期");
  return record;
}

function sourceRegistrationMap(root) {
  const directory = path.join(root, "data", "deepdive");
  const map = new Map();
  if (!fs.existsSync(directory)) return map;
  fs.readdirSync(directory).filter(file => file.endsWith(".js")).sort().forEach(file => {
    const source = fs.readFileSync(path.join(directory, file), "utf8");
    const ids = [
      ...source.matchAll(/window\.DEEPDIVE\s*\[\s*["']([^"']+)["']\s*\]\s*=/g),
      ...source.matchAll(/register\s*\(\s*["']([^"']+)["']/g),
    ].map(match => match[1]);
    ids.forEach(id => {
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(`data/deepdive/${file}`);
    });
  });
  return map;
}

function loadSupplementQueue(root) {
  const file = path.join(root, "data", "video-concept-supplements.json");
  if (!fs.existsSync(file)) return { schemaVersion: 1, items: [] };
  return readJson(file);
}

function pendingSupplements(root) {
  return (loadSupplementQueue(root).items || [])
    .filter(item => item.status === "pending" && item.decision === "supplement");
}

function basePageRecord(id, page, registrations) {
  return {
    id,
    origin: { type: "baseline", ids: [] },
    sourcePaths: registrations.get(id) || [],
    state: "audit-queued",
    attempt: 0,
    repairAttempts: 0,
    contentHash: pageContentHash(page),
    auditHash: null,
    blockers: [],
    editorialWarnings: [],
    candidateFile: null,
    auditFile: null,
    integration: null,
    lease: null,
    published: true,
    updatedAt: new Date().toISOString(),
  };
}

function mergePendingSupplements(root, state) {
  const grouped = new Map();
  pendingSupplements(root).forEach(item => {
    if (!grouped.has(item.targetNode)) grouped.set(item.targetNode, []);
    grouped.get(item.targetNode).push(item);
  });
  let imported = 0;
  grouped.forEach((items, id) => {
    const record = state.pages[id];
    if (!record) return;
    const known = new Set(record.origin.ids || []);
    const additions = items.filter(item => !known.has(item.id));
    if (!additions.length) return;
    record.origin = {
      type: "video-supplement",
      ids: [...known, ...additions.map(item => item.id)],
      supplements: [
        ...((record.origin && record.origin.supplements) || []),
        ...clone(additions),
      ],
    };
    if (!record.lease && !["l3-auto-passed", "manual-review"].includes(record.state)) {
      record.state = "update-queued";
    } else if (record.state === "l3-auto-passed") {
      record.state = "update-queued";
      record.auditHash = null;
    }
    record.updatedAt = new Date().toISOString();
    imported += additions.length;
  });
  return imported;
}

function initialize(root = ROOT, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const file = stateFile(resolvedRoot);
    const existing = fs.existsSync(file) && !options.force ? loadState(resolvedRoot) : null;
    const pages = loadDeepDivePages(resolvedRoot);
    const registrations = sourceRegistrationMap(resolvedRoot);
    const state = existing || {
      schemaVersion: STATE_SCHEMA_VERSION,
      mode: "serial",
      paused: false,
      policy: {
        maxRepairAttempts: 2,
        leaseMinutes: 45,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: {},
    };
    Object.entries(pages).forEach(([id, page]) => {
      if (!state.pages[id]) state.pages[id] = basePageRecord(id, page, registrations);
    });
    const imported = mergePendingSupplements(resolvedRoot, state);
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, existing ? "state-refreshed" : "state-initialized", {
      pageCount: Object.keys(state.pages).length,
      supplementsImported: imported,
    });
    return {
      pageCount: Object.keys(state.pages).length,
      supplementsImported: imported,
      state,
    };
  } finally {
    release();
  }
}

function roleForRecord(record) {
  return Object.entries(QUEUE_BY_ROLE).find(([, queue]) => queue === record.state)?.[0] || null;
}

function expireLease(root, state) {
  const now = Date.now();
  let expired = null;
  Object.values(state.pages).forEach(record => {
    if (!record.lease || expired) return;
    if (Date.parse(record.lease.expiresAt) > now) return;
    const role = record.lease.role;
    expired = { id: record.id, taskId: record.lease.taskId, role };
    record.state = QUEUE_BY_ROLE[role] || "blocked";
    record.lease = null;
    record.updatedAt = new Date().toISOString();
  });
  if (expired) {
    saveState(root, state);
    appendEvent(root, "lease-expired", expired);
  }
  return expired;
}

function activeRecord(state) {
  return Object.values(state.pages).find(record => record.lease) || null;
}

function readCandidate(root, record) {
  if (!record.candidateFile) return null;
  const file = withinRoot(root, record.candidateFile);
  return fs.existsSync(file) ? readJson(file) : null;
}

function currentPage(root, record) {
  const candidate = readCandidate(root, record);
  if (candidate && candidate.page) return candidate.page;
  return loadDeepDivePages(root)[record.id] || null;
}

function writingPolicy(root) {
  const file = path.join(stageDirectory(root), "policies", "writing-policy.md");
  const base = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8")
    : [
    "一次只处理一个页面。",
    "将解释自然融入原有教学过程，不追加合同答案段，不生成独立常见误解、自测或答案章节。",
    "保留正确且有效的原内容，不为了统一模板而机械改写。",
    "不得声称页面已经通过 L3；质量状态由控制器决定。",
    ].join("\n");
  return `${base.trim()}\n\n${WRITING_NARRATIVE_POLICY}`;
}

function writingNarrativeGuard(page, blockers = []) {
  const baseline = page ? scanNarrativeTemplates(page) : null;
  return {
    blockingCode: "harmful-template-expression",
    threshold: "同一句式家族覆盖至少 3 节且不少于全部教学章节一半",
    definitionFamilyExamples: ["是在", "是一类", "是一种", "是……", "指的是", "可以理解为"],
    instruction: "保留原文已有句式多样性；提交前逐节检查第一个实质句。命中阈值的候选会被控制器拒绝并重新排队，不会进入审计。",
    baseline: baseline ? {
      pervasive: baseline.pervasive,
      sectionOpenings: baseline.sections.map(section => ({
        section: section.section,
        evidence: section.opening,
        patternFamily: section.patternFamily,
      })),
    } : null,
    previousSubmissionDefects: clone(blockers || []),
  };
}

function auditContract(record = null) {
  const verificationFindings = record && record.editorialWorkflow
    && record.editorialWorkflow.auditMode === "verification"
    ? clone(record.editorialWorkflow.initialBlockingFindings || [])
    : [];
  const mode = verificationFindings.length ? "verification" : "full";
  const verificationSource = record && record.editorialWorkflow
    && record.editorialWorkflow.verificationSource === "human"
    ? "human"
    : "machine";
  return {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    legacyCompatible: Boolean(record && !record.editorialWorkflow),
    mode,
    decisionPolicy: {
      type: "binary",
      severity: ["blocker", "warning"],
      pass: mode === "verification"
        ? "首轮审查指出的全部问题均已解决"
        : "不存在任何高置信 blocker；warning 不阻断",
      fail: mode === "verification"
        ? "首轮审查至少一个问题仍未解决"
        : "至少存在一项有正文证据支持的高置信 blocker",
    },
    blockingCriteria: clone(L3_BLOCKING_CRITERIA),
    nonBlockingSignals: clone(L3_NON_BLOCKING_SIGNALS),
    verificationFindings,
    verificationSource,
    sourcePolicy: {
      internetAllowed: true,
      preferredSources: ["原始研究论文", "官方技术文档或标准", "大学与权威机构材料"],
      pageSourceMutation: "forbidden",
      instruction: "可以联网核验事实。若当前页面来源无法支持关键事实，只能提交 source-support-blocked；审查与返修 Agent都不得添加、删除或替换页面来源。",
    },
    instruction: mode === "verification"
      ? (verificationSource === "human"
        ? "这是人工退回修改后的定向验证。只验证 verificationFindings 中人工指出的问题，不发现新问题、不重新生成核心概念清单。逐项输出 resolved；完成后无论结果如何都直接回到人工审查。"
        : "这是唯一一轮机器返修后的定向复核。只验证 verificationFindings 中首次机器审查指出的问题，不发现新问题、不重新生成核心概念清单。逐项输出 resolved；全部 resolved 才能 pass。无论结果如何，控制器都进入人工审查，不再自动返修。")
      : "一个审查 Agent完成整页审查。先自行识别本页核心概念，主要依据标题、核心命题和主要教学内容，不把顺带术语、来源列表、概念依赖与延伸学习中的名称升级为核心概念。逐个核心概念检查：是什么、解决什么问题、适用边界。核心机制暂不作为独立硬性要求。同时审查知识/公式/术语/数值事实、跨章节有害重复、术语一致性和图文关系。只阻断严重模板化、语义残缺和明显影响理解的问题；章节依赖顺序、标题正文匹配、术语是否首次使用前解释不属于本合同。最终区分 blocker 与 warning，只有 blocker 导致 fail。",
    outputShape: {
      schemaVersion: AUDIT_SCHEMA_VERSION,
      pageId: "<page-id>",
      pageHash: "sha256:...",
      reviewedAt: "YYYY-MM-DD",
      mode,
      decision: "pass",
      blockingFindings: [],
      warnings: [],
      coreConcepts: mode === "full" ? [{
        name: "",
        sections: [1],
        definition: { status: "pass", evidence: "", rationale: "" },
        problem: { status: "pass", evidence: "", rationale: "" },
        boundary: { status: "pass", evidence: "", rationale: "" },
      }] : [],
      verificationResults: mode === "verification"
        ? verificationFindings.map(finding => ({ findingId: finding.findingId, resolved: true, evidence: "", rationale: "" }))
        : [],
    },
  };
}

function pageSubmissionShape(page) {
  const requiredKeys = Object.keys(page || {});
  return {
    page: {
      type: "object",
      source: "packet.page",
      requiredKeys,
      fieldTypes: Object.fromEntries(requiredKeys.map(key => {
        const value = page[key];
        const type = Array.isArray(value) ? "array" : (value === null ? "null" : typeof value);
        return [key, type];
      })),
      instruction: "提交以 packet.page 为底稿完成修改后的完整页面对象；保留所有未修改字段及其真实值，不要提交本结构说明。",
    },
    summary: {
      type: "string",
      maxLength: 120,
      instruction: "概括本次实际修改。",
    },
  };
}

function readTaskPacketPart(root = ROOT, input = {}) {
  const resolvedRoot = path.resolve(root);
  const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
  const page = currentPage(resolvedRoot, record);
  const part = String(input.part || "contract");
  if (part === "contract") {
    const packet = buildPacket(resolvedRoot, record, record.lease.role);
    delete packet.page;
    const pageMetadata = clone(page);
    delete pageMetadata.html;
    return {
      status: "ok",
      pageId: record.id,
      role: record.lease.role,
      packet,
      pageMetadata,
      pageDelivery: {
        tool: "stage2_read_task_packet",
        part: "page-html",
        totalChars: String(page.html || "").length,
        maxCharsPerCall: 12000,
        instruction: "从 offset=0 开始续读，按 nextOffset 顺序拼接 content，直到 done=true；拼接结果就是 result.page.html 的完整底稿。",
      },
    };
  }
  if (part !== "page-html") throw new Error(`不支持的任务包续读部分：${part}`);
  const html = String(page.html || "");
  const offset = Math.max(0, Math.min(html.length, Number(input.offset) || 0));
  const maxChars = Math.max(1000, Math.min(12000, Number(input.maxChars) || 12000));
  const nextOffset = Math.min(html.length, offset + maxChars);
  return {
    status: "ok",
    pageId: record.id,
    role: record.lease.role,
    part,
    offset,
    nextOffset,
    totalChars: html.length,
    done: nextOffset >= html.length,
    content: html.slice(offset, nextOffset),
  };
}

function buildPacket(root, record, role) {
  const page = currentPage(root, record);
  const common = {
    schemaVersion: 1,
    taskId: record.lease.taskId,
    pageId: record.id,
    role,
    leaseToken: record.lease.token,
    contentHash: page ? pageContentHash(page) : null,
    submitTool: "stage2_submit_result",
    uiCleanup: {
      ...archiveCurrentTaskDirective("Stage 2 单次工作已终止"),
      afterSubmitStatuses: clone(CODEX_TASK_ARCHIVE_STATUSES),
      onSubmitError: "保留当前任务，不归档，以便用户查看并处理异常。",
    },
    instruction: "只使用本任务包。write、update、repair 的 outputShape 是提交结构合同，不是可直接提交的示例值；result.page 必须是以 packet.page 为底稿完成修改后的完整真实页面对象。完成后调用提交工具一次；若返回 accepted、needs-repair、l3-auto-passed 或 rejected，必须调用 set_thread_archived({ archived: true }) 归档当前 Codex 任务，然后立即结束。提交抛错时不要归档，以便用户处理。",
  };
  if (role === "content-generation") {
    const material = contentGenerationReviewMaterial(root, record);
    const manifest = contentGenerationManifest(material);
    return {
      ...common,
      contentHash: material.sourceHash,
      prompt: CONTENT_GENERATION_PROMPT,
      sectionDelivery: {
        tool: "stage2_read_content_section",
        authorization: {
          taskId: record.lease.taskId,
          leaseToken: record.lease.token,
        },
        ...manifest,
        instruction: "严格按 eligibleSections 顺序一次读取一个章节。每章只使用任务包和读取接口返回的完整固定提示词，保存该章完整回复后再读取下一章。不得请求 skippedSections。",
      },
      outputFile: `docs/deepdive-reviews/${record.id}-agent-responses.md`,
      source: {
        order: material.order,
        title: material.title,
        file: material.sourceFile,
        hash: material.sourceHash,
      },
      outputShape: contentGenerationOutputShape(material),
      forbidden: ["读取其他页面", "读取私有审计", "读取常见误解章节", "读取自测章节", "修改正式页面", "处理第二个节点"],
    };
  }
  if (role === "audit") {
    return {
      ...common,
      page: clone(page),
      auditContract: auditContract(record),
      projectReadOnly: {
        tools: ["stage2_search_project", "stage2_read_project_file"],
        authorization: {
          taskId: record.lease.taskId,
          leaseToken: record.lease.token,
        },
        suggestedPaths: [...new Set([
          ...(record.sourcePaths || []),
          "AGENTS.md",
          "docs/DEEPDIVE.md",
          "docs/DEEPDIVE_QUALITY_GATE.md",
          "docs/DEEPDIVE_GATE_ERROR_CATALOG.md",
          TOOL_SCRIPTS.deepDiveL3Audit,
          TOOL_SCRIPTS.deepDiveL2Audit,
          "tools/deepdive/quality/deepdive-audit-contracts.js",
          TOOL_SCRIPTS.deepDiveValidator,
        ])],
        blocked: [
          ".git/",
          ".stage2/",
          "docs/deepdive-audits/",
          "node_modules/",
          "环境变量、密钥与凭据文件",
          "二进制文件和超过 512 KiB 的文件",
        ],
        instruction: "可按需读取项目与门禁信息以准确审计；接口是硬只读。不要复制旧审计答案代替独立判断。",
      },
      forbidden: ["修改正文", "查看作者理由", "替作者补写缺失答案", "复制其他页面或旧合同作为当前页结论"],
    };
  }
  if (role === "write") {
    return {
      ...common,
      material: clone(record.integration && record.integration.material),
      writingPolicy: writingPolicy(root),
      narrativeGuard: writingNarrativeGuard(null, record.blockers),
      outputShape: { page: { title: "", subtitle: "", aliases: "", meta: "", thesis: "", html: "" }, summary: "" },
      forbidden: ["读取其他页面", "读取审计答案", "修改正式文件", "自行授予 L3"],
    };
  }
  if (role === "update") {
    return {
      ...common,
      page: clone(page),
      supplements: clone((record.origin && record.origin.supplements) || []),
      writingPolicy: writingPolicy(root),
      narrativeGuard: writingNarrativeGuard(page, record.blockers),
      outputShape: pageSubmissionShape(page),
      forbidden: ["读取其他页面", "读取审计答案", "只在末尾追加材料", "修改正式文件"],
    };
  }
  return {
    ...common,
    page: clone(page),
    defects: clone(record.blockers || []),
    repairScope: record.editorialWorkflow ? {
      maximumRounds: 1,
      allowed: ["被指出的问题章节", "必要的相邻衔接句", "消除新发现的整页重复所必需的其他章节"],
      sourceMutation: "forbidden",
      sourceSignature: pageSourceSignature(page),
    } : undefined,
    writingPolicy: writingPolicy(root),
    narrativeGuard: writingNarrativeGuard(page, record.blockers),
    outputShape: pageSubmissionShape(page),
    forbidden: ["读取独立审计答案", "读取门禁实现", "新增独立常见误解章节", "新增自测或答案", "修改页面来源", "修改正式文件"],
  };
}

function claimTask(root = ROOT, workerId = "codex-scheduled", requestedPageId = null) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    expireLease(resolvedRoot, state);
    if (state.paused) {
      return {
        status: "paused",
        task: null,
        uiCleanup: archiveCurrentTaskDirective("Stage 2 已暂停，本次定时任务无需保留"),
      };
    }
    const active = activeRecord(state);
    if (active) {
      return {
        status: "busy",
        task: null,
        active: { id: active.id, role: active.lease.role, expiresAt: active.lease.expiresAt },
        uiCleanup: archiveCurrentTaskDirective("已有活动租约，本次定时任务正常结束"),
      };
    }
    let selected = null;
    let role = null;
    const requestedId = String(requestedPageId || "").trim();
    if (requestedId) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(requestedId)) {
        throw new Error("指定页面 ID 格式无效");
      }
      selected = state.pages[requestedId];
      if (!selected) throw new Error(`指定页面不在第二阶段队列：${requestedId}`);
      role = roleForRecord(selected);
      if (!role) throw new Error(`指定页面当前不可领取：${requestedId} (${selected.state})`);
    } else {
      for (const candidateRole of ROLE_PRIORITY) {
        selected = Object.values(state.pages)
          .filter(record => roleForRecord(record) === candidateRole)
          .sort((left, right) => left.id.localeCompare(right.id))[0];
        if (selected) {
          role = candidateRole;
          break;
        }
      }
    }
    if (!selected) {
      return {
        status: "idle",
        task: null,
        uiCleanup: archiveCurrentTaskDirective("Stage 2 当前无可领取任务"),
      };
    }
    const now = new Date();
    const token = crypto.randomBytes(24).toString("hex");
    const taskId = `${selected.id}:${role}:${selected.attempt + 1}:${token.slice(0, 8)}`;
    selected.attempt += 1;
    selected.state = ACTIVE_BY_ROLE[role];
    selected.lease = {
      taskId,
      token,
      role,
      workerId: String(workerId || "codex-scheduled").slice(0, 120),
      claimedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + state.policy.leaseMinutes * 60_000).toISOString(),
    };
    selected.updatedAt = now.toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "task-claimed", {
      id: selected.id,
      taskId,
      role,
      workerId: selected.lease.workerId,
      requested: Boolean(requestedId),
    });
    return { status: "claimed", task: buildPacket(resolvedRoot, selected, role) };
  } finally {
    release();
  }
}

function ensureReviewHistory(record) {
  if (!Array.isArray(record.reviewHistory)) record.reviewHistory = [];
  return record.reviewHistory;
}

function stageCandidateInFixture(fixture, record, page, audit) {
  const id = record.id;
  if (record.integration) {
    let graphSource = fs.readFileSync(path.join(fixture, "data", "graph.js"), "utf8");
    const graphContext = { window: {} };
    vm.createContext(graphContext);
    vm.runInContext(graphSource, graphContext);
    if (
      record.integration.bindings
      && record.integration.bindings.graphHash
      && graphFingerprint(graphContext.window.GRAPH) !== record.integration.bindings.graphHash
    ) {
      throw new Error("正式地图已变化；新节点集成包需要重新计算学习路径与布局");
    }
    const manifest = { ...clone(record.integration), deepDive: page };
    graphSource = transformGraph(graphSource, manifest);
    if (manifest.core && manifest.core.requested) graphSource = applyCoreMembership(graphSource, id);
    fs.writeFileSync(path.join(fixture, "data", "graph.js"), graphSource, "utf8");
    fs.writeFileSync(
      path.join(fixture, "data", "deepdive", `${id}.js`),
      pageRegistrationSource(id, page),
      "utf8",
    );
  } else {
    fs.writeFileSync(
      path.join(fixture, "data", "deepdive", `zzzzz-stage2-${id}.js`),
      pageOverrideSource(id, page),
      "utf8",
    );
  }
  fs.mkdirSync(path.join(fixture, "docs", "deepdive-audits"), { recursive: true });
  fs.writeFileSync(
    path.join(fixture, "docs", "deepdive-audits", `${id}.json`),
    `${JSON.stringify(audit, null, 2)}\n`,
    "utf8",
  );
  const compiled = loadDeepDivePages(fixture)[id];
  const runtimeIds = loadRuntimeIds(fixture);
  fs.writeFileSync(
    path.join(fixture, "data", "deepdive-runtime", `${id}.js`),
    runtimeSource(id, compiled),
    "utf8",
  );
  fs.writeFileSync(
    path.join(fixture, "data", "deepdive-runtime", "manifest.js"),
    runtimeManifestSource([...runtimeIds, id]),
    "utf8",
  );
}

function copyFixture(root) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "deepdive-stage2-"));
  fs.mkdirSync(path.join(fixture, "data"), { recursive: true });
  fs.mkdirSync(path.join(fixture, "docs"), { recursive: true });
  fs.copyFileSync(path.join(root, "index.html"), path.join(fixture, "index.html"));
  fs.copyFileSync(path.join(root, "data", "graph.js"), path.join(fixture, "data", "graph.js"));
  fs.cpSync(path.join(root, "data", "deepdive"), path.join(fixture, "data", "deepdive"), { recursive: true });
  fs.cpSync(path.join(root, "data", "deepdive-runtime"), path.join(fixture, "data", "deepdive-runtime"), { recursive: true });
  const docs = [
    "deepdive-l3-benchmark.json",
    "deepdive-l3-baseline.json",
    "deepdive-quality-baseline.json",
    "deepdive-quality-reviews.json",
  ];
  docs.forEach(name => {
    const source = path.join(root, "docs", name);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(fixture, "docs", name));
  });
  const auditSource = path.join(root, "docs", "deepdive-audits");
  if (fs.existsSync(auditSource)) {
    fs.cpSync(auditSource, path.join(fixture, "docs", "deepdive-audits"), { recursive: true });
  }
  return fixture;
}

function runGate(root, fixture, script, args = []) {
  const result = spawnSync(process.execPath, [path.join(root, ...script.split("/")), ...args], {
    cwd: fixture,
    encoding: "utf8",
    env: {
      ...process.env,
      GRAPH_ROOT: fixture,
      DEEPDIVE_ROOT: fixture,
    },
  });
  return {
    script,
    passed: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

function gateDefects(result, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const issuePattern = new RegExp(`^\\s*-\\s+${escapedId}:\\s+([A-Za-z0-9._-]+)\\s*$`, "gm");
  const issues = [...result.output.matchAll(issuePattern)].map(match => match[1]);
  if (!issues.length) {
    return [{
      type: "gate",
      gate: result.script,
      message: `${result.script} 未通过；读者可见缺口必须融入原有教学过程。`,
    }];
  }
  const labels = {
    definition: "定义",
    problem: "解决的问题",
    inputOutput: "输入与输出",
    mechanism: "工作机制",
    interpretation: "结果解释",
    boundary: "适用边界",
  };
  const bySection = new Map();
  issues.forEach(code => {
    const sectionMatch = code.match(/section-(\d+)$/);
    const section = sectionMatch ? Number(sectionMatch[1]) : null;
    const key = section || 0;
    if (!bySection.has(key)) bySection.set(key, { codes: [], missing: new Set() });
    const group = bySection.get(key);
    group.codes.push(code);
    Object.keys(labels).forEach(part => {
      if (code.includes(part)) group.missing.add(part);
    });
  });
  return [...bySection.entries()].map(([section, group]) => {
    const missing = [...group.missing];
    const names = missing.map(part => labels[part]).join("、") || "教学证据";
    return {
      type: "coverage",
      gate: result.script,
      section: section || null,
      missing,
      codes: group.codes,
      message: `${section ? `第 ${section} 节` : "当前页面"}：自动门禁无法从正文中的审计证据验证${names}；请在原有教学过程内澄清，不要追加合同式答案。`,
    };
  });
}

function evaluateCandidate(root, record, page, audit) {
  const fixture = copyFixture(root);
  try {
    stageCandidateInFixture(fixture, record, page, audit);
    const results = [
      runGate(root, fixture, TOOL_SCRIPTS.deepDiveValidator),
      runGate(root, fixture, TOOL_SCRIPTS.deepDiveL2Audit, ["--require-candidate", record.id]),
      runGate(root, fixture, TOOL_SCRIPTS.deepDiveL3Audit, ["--require-benchmark", record.id]),
    ];
    return {
      passed: results.every(result => result.passed),
      results,
      blockers: results.filter(result => !result.passed)
        .flatMap(result => gateDefects(result, record.id)),
    };
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

function refreshBlockers(root = ROOT, id) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能刷新缺陷`);
    if (!record.auditFile) throw new Error(`页面 ${id} 没有可复用的独立审计`);
    const auditPath = withinRoot(resolvedRoot, record.auditFile);
    if (!fs.existsSync(auditPath)) throw new Error(`独立审计文件不存在：${record.auditFile}`);
    const audit = readJson(auditPath);
    const page = currentPage(resolvedRoot, record);
    const gate = evaluateCandidate(resolvedRoot, record, page, audit);
    record.blockers = clone(gate.blockers || []);
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "blockers-refreshed", {
      id,
      blockerCount: record.blockers.length,
      passed: gate.passed,
    });
    return {
      status: "refreshed",
      pageId: id,
      passed: gate.passed,
      blockers: clone(record.blockers),
    };
  } finally {
    release();
  }
}

function enqueueContentGeneration(root = ROOT, id, reason) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    expireLease(resolvedRoot, state);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (activeRecord(state)) throw new Error("存在活动租约，不能排入内容生成任务");
    if (!record.published || record.integration) {
      throw new Error("内容生成只适用于已有正式理解页");
    }
    if (record.state === "published-approved") {
      throw new Error(`页面 ${id} 已由人工批准，无需重新生成内容`);
    }
    const enqueueReason = String(reason || "").trim();
    if (enqueueReason.length < 3) throw new Error("排队原因至少需要 3 个字符");
    const material = contentGenerationReviewMaterial(resolvedRoot, record);
    const manifest = contentGenerationManifest(material);
    if (!manifest.eligibleSections.length) throw new Error(`页面 ${id} 没有可用于内容生成的章节`);
    const previousState = record.contentGeneration
      && record.contentGeneration.status !== "complete"
      && record.contentGeneration.previousState
      ? record.contentGeneration.previousState
      : record.state;
    record.contentGeneration = {
      schemaVersion: 1,
      status: "queued",
      previousState,
      sourceOrder: material.order,
      sourceFile: material.sourceFile,
      sourceHash: material.sourceHash,
      outputFile: `docs/deepdive-reviews/${id}-agent-responses.md`,
      eligibleSections: clone(manifest.eligibleSections),
      skippedSections: clone(manifest.skippedSections),
      savedResponses: [],
      enqueuedAt: new Date().toISOString(),
      reason: enqueueReason.slice(0, 500),
    };
    record.state = "content-generation-queued";
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "content-generation-enqueued", {
      id,
      previousState,
      eligibleSectionCount: manifest.eligibleSections.length,
      skippedSectionCount: manifest.skippedSections.length,
      reason: enqueueReason.slice(0, 500),
    });
    return {
      status: "queued",
      pageId: id,
      previousState,
      nextState: record.state,
      outputFile: record.contentGeneration.outputFile,
      ...manifest,
    };
  } finally {
    release();
  }
}

function status(root = ROOT) {
  const resolvedRoot = path.resolve(root);
  const state = loadState(resolvedRoot);
  expireLease(resolvedRoot, state);
  const counts = {};
  Object.values(state.pages).forEach(record => {
    counts[record.state] = (counts[record.state] || 0) + 1;
  });
  const active = activeRecord(state);
  return {
    schemaVersion: state.schemaVersion,
    mode: state.mode,
    paused: state.paused,
    total: Object.keys(state.pages).length,
    counts,
    active: active ? {
      id: active.id,
      role: active.lease.role,
      taskId: active.lease.taskId,
      expiresAt: active.lease.expiresAt,
    } : null,
    updatedAt: state.updatedAt,
  };
}

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

function setPaused(root = ROOT, paused) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    state.paused = Boolean(paused);
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, state.paused ? "queue-paused" : "queue-resumed");
    return status(resolvedRoot);
  } finally {
    release();
  }
}

function retry(root = ROOT, id) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能重试`);
    record.repairAttempts = 0;
    record.state = "audit-queued";
    record.blockers = [];
    record.reviewHistory = [];
    record.finalReview = null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "page-retried", { id });
    return clone(record);
  } finally {
    release();
  }
}

function resetManualReview(root = ROOT, id, reason) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能重置`);
    if (record.state !== "manual-review") {
      throw new Error(`页面 ${id} 当前状态为 ${record.state}，只有 manual-review 可以重置`);
    }
    const resetReason = String(reason || "").trim();
    if (resetReason.length < 3) throw new Error("重置原因至少需要 3 个字符");
    const previousState = record.state;
    record.repairAttempts = 0;
    record.state = "audit-queued";
    record.blockers = [];
    record.reviewHistory = [];
    record.finalReview = null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "manual-review-reset", {
      id,
      previousState,
      nextState: record.state,
      reason: resetReason.slice(0, 500),
    });
    return {
      status: "reset",
      pageId: id,
      previousState,
      nextState: record.state,
      repairAttempts: record.repairAttempts,
      blockerCount: record.blockers.length,
    };
  } finally {
    release();
  }
}

function resetPassedPage(root = ROOT, id, reason) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能重置`);
    if (record.state !== "l3-auto-passed") {
      throw new Error(`页面 ${id} 当前状态为 ${record.state}，只有 l3-auto-passed 可以重置复审`);
    }
    const resetReason = String(reason || "").trim();
    if (resetReason.length < 3) throw new Error("重置原因至少需要 3 个字符");
    const previousState = record.state;
    const previousAuditHash = record.auditHash || null;
    const previousAuditFile = record.auditFile || null;
    const previousCompletionReceipt = record.completionReceipt || null;
    record.repairAttempts = 0;
    record.state = "audit-queued";
    record.auditHash = null;
    record.auditFile = null;
    record.blockers = [];
    record.editorialWarnings = [];
    record.reviewHistory = [];
    record.finalReview = null;
    record.completionReceipt = null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "passed-page-reset", {
      id,
      previousState,
      nextState: record.state,
      reason: resetReason.slice(0, 500),
      previousAuditHash,
      previousAuditFile,
      previousCompletionReceipt,
    });
    return {
      status: "reset",
      pageId: id,
      previousState,
      nextState: record.state,
      repairAttempts: record.repairAttempts,
      blockerCount: record.blockers.length,
      published: record.published,
    };
  } finally {
    release();
  }
}

function escapePreviewHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizePreviewHtml(value) {
  return String(value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s(?:href|src)\s*=\s*"javascript:[^"]*"/gi, "")
    .replace(/\s(?:href|src)\s*=\s*'javascript:[^']*'/gi, "");
}

function previewSections(html) {
  return [...String(html || "").matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)]
    .map((match, index) => {
      const sectionHtml = match[0];
      const headingHtml = (sectionHtml.match(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/i) || [])[1] || "";
      const heading = headingHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return { index: index + 1, heading, html: sectionHtml };
    });
}

function createManualReviewPreview(root = ROOT, id, input = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能生成复核预览`);
    if (record.state !== "manual-review") {
      throw new Error(`页面 ${id} 当前状态为 ${record.state}，只有 manual-review 可以生成复核预览`);
    }
    const candidateRecord = readCandidate(resolvedRoot, record);
    if (!candidateRecord || !candidateRecord.page) {
      throw new Error(`页面 ${id} 没有可预览的候选正文`);
    }
    const publishedPage = loadDeepDivePages(resolvedRoot)[id];
    if (!publishedPage) throw new Error(`页面 ${id} 没有正式正文可供比较`);
    const candidatePage = candidateRecord.page;
    const publishedSections = previewSections(publishedPage.html);
    const candidateSections = previewSections(candidatePage.html);
    const sectionCount = Math.max(publishedSections.length, candidateSections.length);
    const sectionDiffs = [];
    for (let index = 0; index < sectionCount; index += 1) {
      const before = publishedSections[index] || { index: index + 1, heading: "（正式页缺失）", html: "" };
      const after = candidateSections[index] || { index: index + 1, heading: "（候选页缺失）", html: "" };
      if (before.html !== after.html) {
        sectionDiffs.push({
          section: index + 1,
          beforeHeading: before.heading,
          afterHeading: after.heading,
          beforeHtml: before.html,
          afterHtml: after.html,
        });
      }
    }
    const comparedFields = ["title", "subtitle", "aliases", "meta", "thesis"];
    const changedFields = comparedFields.filter(field =>
      String(publishedPage[field] || "") !== String(candidatePage[field] || "")
    );
    const overrideRounds = Array.isArray(input.rounds) ? input.rounds.slice(0, 2) : [];
    const storedRounds = ensureReviewHistory(record).slice(0, 2).map(round => ({
      defects: (round.defects || []).map(defect => defect.message || defect.code || JSON.stringify(defect)),
      improvements: round.improvement && round.improvement.summary
        ? [round.improvement.summary]
        : [],
    }));
    const processRounds = (overrideRounds.length ? overrideRounds : storedRounds).map((round, index) => ({
      round: index + 1,
      defects: (Array.isArray(round.defects) ? round.defects : [])
        .map(item => String(item || "").trim().slice(0, 1000))
        .filter(Boolean),
      improvements: (Array.isArray(round.improvements) ? round.improvements : [])
        .map(item => String(item || "").trim().slice(0, 1000))
        .filter(Boolean),
    }));
    const finalStatus = String(
      input.finalStatus
      || record.finalReview && record.finalReview.status
      || record.state
    ).slice(0, 200);
    const listMarkup = items => items.length
      ? `<ul>${items.map(item => `<li>${escapePreviewHtml(item)}</li>`).join("")}</ul>`
      : "<span class=\"muted\">未记录</span>";
    const processRows = [0, 1].map(index => {
      const round = processRounds[index] || { defects: [], improvements: [] };
      return `<tr><th>第 ${index + 1} 轮</th><td>${listMarkup(round.defects)}</td><td>${listMarkup(round.improvements)}</td></tr>`;
    }).join("");
    const processMarkup = `<div class="table-scroll"><table class="process-table"><thead><tr><th>轮次</th><th>审查缺陷</th><th>改动内容</th></tr></thead>`
      + `<tbody>${processRows}<tr class="final-row"><th>最终状态</th><td colspan="2">${escapePreviewHtml(finalStatus)}</td></tr></tbody></table></div>`;
    const blockerMarkup = (record.blockers || []).length
      ? `<ol>${record.blockers.map(blocker => (
        `<li><code>${escapePreviewHtml(blocker.code || blocker.type || "blocker")}</code>`
        + `<div>${escapePreviewHtml(blocker.message || JSON.stringify(blocker))}</div></li>`
      )).join("")}</ol>`
      : "<p>控制器没有保存可展示的阻断项。</p>";
    const fieldMarkup = changedFields.length
      ? changedFields.map(field => (
        `<details><summary>${escapePreviewHtml(field)}</summary>`
        + `<div class="compare"><article><h4>正式页</h4><pre>${escapePreviewHtml(publishedPage[field] || "")}</pre></article>`
        + `<article><h4>最终候选</h4><pre>${escapePreviewHtml(candidatePage[field] || "")}</pre></article></div></details>`
      )).join("")
      : "<p>标题、摘要等页面字段没有变化。</p>";
    const sectionMarkup = sectionDiffs.length
      ? sectionDiffs.map(diff => (
        `<details><summary>第 ${diff.section} 节：${escapePreviewHtml(diff.beforeHeading)} → ${escapePreviewHtml(diff.afterHeading)}</summary>`
        + `<div class="compare"><article><h4>正式页</h4>${sanitizePreviewHtml(diff.beforeHtml) || "<p>缺失</p>"}</article>`
        + `<article><h4>最终候选</h4>${sanitizePreviewHtml(diff.afterHtml) || "<p>缺失</p>"}</article></div></details>`
      )).join("")
      : "<p>没有章节正文差异。</p>";
    const preview = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stage 2 人工复核预览 · ${escapePreviewHtml(candidatePage.title || id)}</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b0f16;color:#e7edf6;font:15px/1.7 system-ui,"Microsoft YaHei",sans-serif}
.warning{position:sticky;top:0;z-index:9;padding:11px 24px;background:#9a3412;color:white;font-weight:800}
main{max-width:1180px;margin:auto;padding:32px 24px 96px}nav{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
nav a{color:#bfdbfe;background:#172033;border:1px solid #334155;border-radius:999px;padding:7px 12px;text-decoration:none}
.hero,.panel,.dd-sec,.dd-goals,.dd-note,.dd-src{border:1px solid #334155;background:#111827;border-radius:15px;padding:22px;margin:18px 0}
.hero h1{font-size:36px;margin:0}.muted{color:#94a3b8}.hash{word-break:break-all;font-family:ui-monospace,monospace}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:14px}.compare article{min-width:0;border:1px solid #334155;border-radius:12px;padding:16px;background:#0f172a}
details{border:1px solid #334155;border-radius:12px;margin:10px 0;background:#101722}summary{cursor:pointer;padding:13px 16px;font-weight:750}
details>.compare{padding:0 14px 14px}pre{white-space:pre-wrap;word-break:break-word}.candidate{max-width:980px;margin:auto}
.dd-sec h2{font-size:24px}.dd-n{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#2563eb;margin-right:8px}
.dd-badge{float:right;color:#93c5fd;font-size:12px}.dd-lead{font-size:17px;color:#bfdbfe}.dd-note.key{border-color:#059669}.dd-note.warn{border-color:#d97706}
.dd-table-wrap{overflow:auto}.dd-table{width:100%;border-collapse:collapse}.dd-table th,.dd-table td{border:1px solid #3b4758;padding:9px;text-align:left}.dd-table th{background:#1f2937}
.table-scroll{overflow:auto}.process-table{width:100%;border-collapse:collapse}.process-table th,.process-table td{border:1px solid #3b4758;padding:12px;vertical-align:top;text-align:left}.process-table thead th{background:#1e293b}.process-table tbody th{white-space:nowrap;background:#172033}.process-table ul{margin:0;padding-left:20px}.final-row td{font-weight:800;color:#fbbf24}
a{color:#60a5fa}code{color:#fbbf24}@media(max-width:800px){.compare{grid-template-columns:1fr}}
</style></head><body>
<div class="warning">未发布候选 · 仅供 Stage 2 人工复核 · 不代表正式页面</div>
<main><header class="hero"><h1>${escapePreviewHtml(candidatePage.title || id)}</h1>
<div>${escapePreviewHtml(candidatePage.subtitle || "")}</div>
<p class="muted">状态：manual-review · 候选哈希</p><div class="hash">${escapePreviewHtml(pageContentHash(candidatePage))}</div></header>
<nav><a href="#process">流程展示表</a><a href="#candidate">最终候选</a><a href="#blockers">当前阻断项</a><a href="#fields">字段差异</a><a href="#sections">章节差异</a></nav>
<section id="process" class="panel"><h2>两轮审查与改进</h2>${processMarkup}</section>
<section id="candidate" class="panel"><h2>最终候选页面</h2><div class="candidate"><p>${sanitizePreviewHtml(candidatePage.thesis || "")}</p>${sanitizePreviewHtml(candidatePage.html)}</div></section>
<section id="blockers" class="panel"><h2>当前控制器阻断项（${(record.blockers || []).length}）</h2>${blockerMarkup}</section>
<section id="fields" class="panel"><h2>字段差异</h2>${fieldMarkup}</section>
<section id="sections" class="panel"><h2>章节差异（${sectionDiffs.length}）</h2>${sectionMarkup}</section>
</main></body></html>`;
    const relativePath = `.stage2/previews/${id}.html`;
    atomicWrite(withinRoot(resolvedRoot, relativePath), preview);
    return {
      status: "ready",
      pageId: id,
      state: record.state,
      previewPath: relativePath,
      candidateHash: pageContentHash(candidatePage),
      publishedHash: pageContentHash(publishedPage),
      changedFields,
      changedSections: sectionDiffs.map(diff => ({
        section: diff.section,
        beforeHeading: diff.beforeHeading,
        afterHeading: diff.afterHeading,
      })),
      processRounds,
      finalStatus,
      blockers: clone(record.blockers || []),
    };
  } finally {
    release();
  }
}

function releaseLease(root = ROOT, id, reason = "manual-recovery", expectedTaskId = null) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (!record.lease) throw new Error(`页面 ${id} 当前没有活动租约`);
    const previousLease = clone(record.lease);
    if (expectedTaskId && previousLease.taskId !== expectedTaskId) {
      throw new Error(`页面 ${id} 的活动 taskId 不匹配，拒绝释放租约`);
    }
    record.state = QUEUE_BY_ROLE[previousLease.role] || "manual-review";
    record.lease = null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "task-released", {
      id,
      taskId: previousLease.taskId,
      role: previousLease.role,
      reason: String(reason || "manual-recovery").slice(0, 500),
    });
    return {
      status: "released",
      pageId: id,
      releasedTaskId: previousLease.taskId,
      nextState: record.state,
    };
  } finally {
    release();
  }
}

function enqueueNewNode(root = ROOT, integration, material) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const id = integration && integration.node && integration.node.id;
    if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new Error("新节点 integration.node.id 缺失或格式无效");
    }
    if (state.pages[id]) throw new Error(`页面任务已存在：${id}`);
    if (loadDeepDivePages(resolvedRoot)[id]) throw new Error(`理解原理页已经存在：${id}`);
    state.pages[id] = {
    id,
    origin: { type: "video-new-node", ids: clone((material && material.originIds) || []) },
    sourcePaths: [],
    state: "write-queued",
    attempt: 0,
    repairAttempts: 0,
    contentHash: null,
    auditHash: null,
    blockers: [],
    editorialWarnings: [],
    candidateFile: null,
    auditFile: null,
    integration: clone({ ...integration, material }),
    lease: null,
    published: false,
    updatedAt: new Date().toISOString(),
    };
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "new-node-enqueued", { id });
    return clone(state.pages[id]);
  } finally {
    release();
  }
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
  pageOverrideSource,
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
