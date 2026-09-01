"use strict";

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const { loadDeepDivePages } = require("../deepdive/runtime/deepdive-loader");
const { pageContentHash } = require("../deepdive/quality/deepdive-audit-contracts");
const {
  TEMPLATE_FAMILIES,
  narrativeTemplateBlockers,
  plainText,
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
const AUDIT_READABLE_EXTENSIONS = new Set([
  ".cjs", ".css", ".csv", ".html", ".js", ".json", ".md", ".mjs",
  ".svg", ".toml", ".ts", ".txt", ".xml", ".yaml", ".yml",
]);
const AUDIT_READ_MAX_BYTES = 512 * 1024;
const AUDIT_SEARCH_MAX_FILES = 6000;
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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

function sha256(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `sha256:${crypto.createHash("sha256").update(text).digest("hex")}`;
}

function stageDirectory(root = ROOT) {
  return path.join(path.resolve(root), ".stage2");
}

function stateFile(root = ROOT) {
  return path.join(stageDirectory(root), "state.json");
}

function eventsFile(root = ROOT) {
  return path.join(stageDirectory(root), "events.jsonl");
}

function lockFile(root = ROOT) {
  return path.join(stageDirectory(root), "controller.lock");
}

function resultDirectory(root, id) {
  return path.join(stageDirectory(root), "results", id);
}

function withinRoot(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  const relative = path.relative(path.resolve(root), absolute);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`目标路径越出项目根目录：${relativePath}`);
  }
  return absolute;
}

function atomicWrite(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, content, "utf8");
  fs.renameSync(temporary, file);
}

function acquireLock(root) {
  const file = lockFile(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    const descriptor = fs.openSync(file, "wx");
    fs.writeFileSync(descriptor, JSON.stringify({
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
    }), "utf8");
    fs.closeSync(descriptor);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    let stale = false;
    try {
      const details = readJson(file);
      stale = Date.now() - Date.parse(details.acquiredAt) > 2 * 60 * 60_000;
    } catch (_ignored) {
      stale = false;
    }
    if (!stale) throw new Error("第二阶段控制器正由另一个进程使用");
    fs.unlinkSync(file);
    return acquireLock(root);
  }
  return () => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  };
}

function writeJson(file, value) {
  atomicWrite(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function appendEvent(root, type, details = {}) {
  const event = {
    at: new Date().toISOString(),
    type,
    ...details,
  };
  fs.mkdirSync(stageDirectory(root), { recursive: true });
  fs.appendFileSync(eventsFile(root), `${JSON.stringify(event)}\n`, "utf8");
  return event;
}

function loadState(root = ROOT) {
  const file = stateFile(root);
  if (!fs.existsSync(file)) {
    throw new Error("第二阶段状态尚未初始化；先运行 stage2:init");
  }
  const state = readJson(file);
  if (state.schemaVersion !== STATE_SCHEMA_VERSION || !state.pages) {
    throw new Error("第二阶段状态文件版本无效");
  }
  return state;
}

function authorizeAuditProjectRead(root, taskId, leaseToken) {
  const state = loadState(root);
  const record = Object.values(state.pages).find(page =>
    page.lease && page.lease.taskId === taskId
  );
  if (!record) throw new Error("只读项目访问对应的审计租约不存在");
  if (record.lease.token !== leaseToken) throw new Error("只读项目访问的租约令牌无效");
  if (record.lease.role !== "audit") throw new Error("只有 audit 角色可以读取项目");
  if (Date.parse(record.lease.expiresAt) <= Date.now()) throw new Error("审计租约已经过期");
  return record;
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

function auditPathDenied(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/").replace(/^\.\//, "");
  const lower = normalized.toLowerCase();
  const basename = path.posix.basename(lower);
  return (
    !normalized
    || normalized.startsWith("/")
    || /^[a-z]:\//i.test(normalized)
    || lower === ".git"
    || lower.startsWith(".git/")
    || lower === ".stage2"
    || lower.startsWith(".stage2/")
    || lower === "node_modules"
    || lower.startsWith("node_modules/")
    || lower.includes("/node_modules/")
    || lower === "docs/deepdive-audits"
    || lower.startsWith("docs/deepdive-audits/")
    || basename === ".env"
    || basename.startsWith(".env.")
    || /\.(key|pem|pfx|p12|keystore)$/i.test(basename)
    || /(^|[-_.])(secret|secrets|credential|credentials)([-_.]|$)/i.test(basename)
  );
}

function resolveAuditReadableFile(root, relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/").replace(/^\.\//, "");
  if (auditPathDenied(normalized)) throw new Error(`审计只读接口禁止访问：${relativePath}`);
  if (!AUDIT_READABLE_EXTENSIONS.has(path.extname(normalized).toLowerCase())) {
    throw new Error(`审计只读接口不支持该文件类型：${relativePath}`);
  }
  const file = withinRoot(root, normalized);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(`项目文件不存在：${relativePath}`);
  }
  const realRoot = fs.realpathSync(path.resolve(root));
  const realFile = fs.realpathSync(file);
  const realRelative = path.relative(realRoot, realFile);
  if (!realRelative || realRelative.startsWith("..") || path.isAbsolute(realRelative)) {
    throw new Error(`项目文件通过链接越出根目录：${relativePath}`);
  }
  const size = fs.statSync(realFile).size;
  if (size > AUDIT_READ_MAX_BYTES) {
    throw new Error(`项目文件超过审计只读上限：${relativePath}`);
  }
  return { file: realFile, relativePath: normalized, size };
}

function readAuditProjectFile(root = ROOT, input = {}) {
  const resolvedRoot = path.resolve(root);
  const record = authorizeAuditProjectRead(
    resolvedRoot,
    input.taskId,
    input.leaseToken,
  );
  const target = resolveAuditReadableFile(resolvedRoot, input.path);
  const lines = fs.readFileSync(target.file, "utf8").split(/\r?\n/);
  const startLine = Math.max(1, Number(input.startLine) || 1);
  const requestedEnd = Number(input.endLine) || startLine + 399;
  const endLine = Math.min(lines.length, Math.max(startLine, requestedEnd), startLine + 399);
  return {
    status: "ok",
    pageId: record.id,
    path: target.relativePath,
    size: target.size,
    startLine,
    endLine,
    totalLines: lines.length,
    content: lines.slice(startLine - 1, endLine).join("\n"),
  };
}

function collectAuditReadableFiles(root) {
  const files = [];
  const visit = directory => {
    if (files.length >= AUDIT_SEARCH_MAX_FILES) return;
    const entries = fs.readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (files.length >= AUDIT_SEARCH_MAX_FILES) break;
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).replace(/\\/g, "/");
      if (auditPathDenied(relative) || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (
        entry.isFile()
        && AUDIT_READABLE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
        && entry.name
        && fs.statSync(absolute).size <= AUDIT_READ_MAX_BYTES
      ) {
        files.push(relative);
      }
    }
  };
  visit(root);
  return files;
}

function searchAuditProject(root = ROOT, input = {}) {
  const resolvedRoot = path.resolve(root);
  const record = authorizeAuditProjectRead(
    resolvedRoot,
    input.taskId,
    input.leaseToken,
  );
  const query = String(input.query || "").trim();
  if (query.length < 2 || query.length > 160) {
    throw new Error("项目搜索词长度必须为 2–160 个字符");
  }
  const prefix = String(input.pathPrefix || "").replace(/\\/g, "/").replace(/^\.\//, "");
  if (prefix && auditPathDenied(prefix)) throw new Error(`审计只读接口禁止搜索：${prefix}`);
  const maximum = Math.min(50, Math.max(1, Number(input.maxResults) || 20));
  const needle = query.toLocaleLowerCase();
  const matches = [];
  for (const relative of collectAuditReadableFiles(resolvedRoot)) {
    if (prefix && relative !== prefix && !relative.startsWith(`${prefix.replace(/\/$/, "")}/`)) {
      continue;
    }
    const lines = fs.readFileSync(path.join(resolvedRoot, relative), "utf8").split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      if (!lines[index].toLocaleLowerCase().includes(needle)) continue;
      matches.push({
        path: relative,
        line: index + 1,
        text: lines[index].trim().slice(0, 500),
      });
      if (matches.length >= maximum) break;
    }
    if (matches.length >= maximum) break;
  }
  return {
    status: "ok",
    pageId: record.id,
    query,
    pathPrefix: prefix || null,
    matches,
    truncated: matches.length >= maximum,
  };
}

function saveState(root, state) {
  state.updatedAt = new Date().toISOString();
  writeJson(stateFile(root), state);
  return state;
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

function cleanContentSectionTitle(headingHtml, fallback) {
  const withoutMetadata = String(headingHtml || "")
    .replace(/<span\b[^>]*class=["'][^"']*\bdd-n\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, " ")
    .replace(/<span\b[^>]*class=["'][^"']*\bdd-badge\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, " ");
  return plainText(withoutMetadata)
    .replace(/^\d+(?:\.\d+)*\s+/, "")
    .replace(/[。；]+$/g, "")
    .trim() || fallback;
}

function isSkippedContentGenerationTitle(title) {
  const normalized = String(title || "").replace(/\s+/g, "").replace(/[：:。；]/g, "");
  return CONTENT_GENERATION_SKIPPED_TITLES.some(item => normalized.includes(item.replace(/\s+/g, "")));
}

function isConfiguredRemovedSectionTitle(title, removedSectionTitles = DEFAULT_EDITORIAL_REMOVED_SECTIONS) {
  const normalized = String(title || "").replace(/\s+/g, "").replace(/[：:。；]/g, "");
  return (removedSectionTitles || []).some(item => {
    const removed = String(item || "").replace(/\s+/g, "").replace(/[：:。；]/g, "");
    return removed && normalized.includes(removed);
  });
}

function contentGenerationSections(page) {
  const html = String(page && page.html || "");
  const matches = [...html.matchAll(
    /<section\b[^>]*class=["'][^"']*\bdd-sec\b[^"']*["'][^>]*>[\s\S]*?<\/section>/gi,
  )];
  const source = matches.length
    ? matches.map(match => match[0])
    : [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)].map(match => match[0]);
  return source.map((sectionHtml, index) => {
    const headingMatch = sectionHtml.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const title = cleanContentSectionTitle(headingMatch && headingMatch[1], `第 ${index + 1} 章`);
    const bodyHtml = sectionHtml.replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/i, " ");
    return {
      sectionNumber: index + 1,
      title,
      skipped: isSkippedContentGenerationTitle(title),
      text: plainText(bodyHtml),
      html: sectionHtml,
      contentHash: sha256(sectionHtml),
    };
  });
}

function contentGenerationReviewMaterial(root, record) {
  const graphSource = fs.readFileSync(path.join(root, "data", "graph.js"), "utf8");
  const graphContext = { window: {} };
  vm.createContext(graphContext);
  vm.runInContext(graphSource, graphContext);
  const phases = graphContext.window.GRAPH
    && Array.isArray(graphContext.window.GRAPH.recommendedLearningPath)
    ? graphContext.window.GRAPH.recommendedLearningPath
    : [];
  const step = phases.flatMap(phase => phase.steps || [])
    .find(item => String(item[1]) === record.id);
  if (!step) throw new Error(`官方推荐学习路径中不存在页面：${record.id}`);
  const order = String(step[0]);
  const group = order.split(".")[0];
  const relativePath = `docs/deepdive-reviews/${group}x-section-text-review.md`;
  const file = withinRoot(root, relativePath);
  if (!fs.existsSync(file)) throw new Error(`缺少旧理解原理页章节审阅稿：${relativePath}`);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const escapedId = record.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pagePattern = new RegExp(`^##\\s+${order.replace(/\./g, "\\.")}\\s+(.+?)（${escapedId}）\\s*$`);
  const start = lines.findIndex(line => pagePattern.test(line));
  if (start < 0) throw new Error(`章节审阅稿中不存在页面：${order} ${record.id}`);
  const titleMatch = lines[start].match(pagePattern);
  const end = lines.findIndex((line, index) => index > start && /^##\s+/.test(line));
  const pageLines = lines.slice(start + 1, end < 0 ? lines.length : end);
  const sections = [];
  let current = null;
  pageLines.forEach(line => {
    const heading = line.match(/^###\s+(\d+(?:\.\d+)*)\s+(.+?)\s*$/);
    if (heading) {
      if (current) sections.push(current);
      current = {
        sectionNumber: sections.length + 1,
        sourceOrder: heading[1],
        title: heading[2].trim(),
        body: [],
      };
      return;
    }
    if (current) current.body.push(line);
  });
  if (current) sections.push(current);
  const normalizedSections = sections.map(section => {
    const text = section.body.join("\n").trim();
    return {
      sectionNumber: section.sectionNumber,
      sourceOrder: section.sourceOrder,
      title: section.title,
      skipped: isSkippedContentGenerationTitle(section.title),
      text,
      html: null,
      contentHash: sha256(text),
    };
  });
  if (!normalizedSections.length) throw new Error(`页面 ${record.id} 的章节审阅稿没有章节`);
  return {
    pageId: record.id,
    order,
    title: titleMatch[1].trim(),
    sourceFile: relativePath,
    sourceHash: sha256(fs.readFileSync(file, "utf8")),
    sections: normalizedSections,
  };
}

function contentGenerationManifest(material) {
  const sections = Array.isArray(material && material.sections)
    ? material.sections
    : contentGenerationSections(material);
  return {
    eligibleSections: sections.filter(section => !section.skipped).map(section => ({
      sectionNumber: section.sectionNumber,
      title: section.title,
      contentHash: section.contentHash,
    })),
    skippedSections: sections.filter(section => section.skipped).map(section => ({
      sectionNumber: section.sectionNumber,
      title: section.title,
      reason: "按内容生成合同跳过常见误解与自测章节",
    })),
  };
}

function contentGenerationOutputShape(material) {
  const manifest = contentGenerationManifest(material);
  return {
    pageId: "<page-id>",
    responses: manifest.eligibleSections.map(section => ({
      sectionNumber: section.sectionNumber,
      title: section.title,
      response: "<对该章节执行控制器返回的完整固定提示词后得到的原始回复>",
    })),
    summary: "<可选，至多 500 字>",
  };
}

function contentGenerationResponseEncodingError(value) {
  const text = String(value || "");
  if (text.includes("\uFFFD")) return "包含 Unicode 替换字符，疑似发生编码损坏";
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) {
    return "包含非法控制字符，疑似反斜杠转义被错误解析";
  }
  if (/\?{8,}/.test(text)) return "包含连续问号，疑似非 UTF-8 管道将正文替换为问号";
  return null;
}

function contentGenerationResultGaps(record, material, result) {
  const gaps = [];
  const manifest = contentGenerationManifest(material);
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return ["result 必须是对象"];
  }
  if (result.pageId !== record.id) gaps.push("result.pageId 与任务页面不一致");
  if (!Array.isArray(result.responses)) {
    gaps.push("result.responses 必须是数组");
    return gaps;
  }
  if (result.responses.length !== manifest.eligibleSections.length) {
    gaps.push("result.responses 必须恰好覆盖全部可处理章节");
  }
  const seen = new Set();
  result.responses.forEach((response, index) => {
    const expected = manifest.eligibleSections[index];
    if (!response || typeof response !== "object" || Array.isArray(response)) {
      gaps.push(`responses[${index}] 必须是对象`);
      return;
    }
    if (!Number.isInteger(response.sectionNumber)) {
      gaps.push(`responses[${index}].sectionNumber 必须是整数`);
    } else if (seen.has(response.sectionNumber)) {
      gaps.push(`章节 ${response.sectionNumber} 重复`);
    } else {
      seen.add(response.sectionNumber);
    }
    if (expected && response.sectionNumber !== expected.sectionNumber) {
      gaps.push(`responses[${index}] 必须对应第 ${expected.sectionNumber} 章并保持原顺序`);
    }
    if (expected && String(response.title || "").trim() !== expected.title) {
      gaps.push(`responses[${index}].title 与任务章节标题不一致`);
    }
    const responseText = String(response.response || "").trim();
    if (!responseText) gaps.push(`responses[${index}].response 不能为空`);
    const encodingError = contentGenerationResponseEncodingError(responseText);
    if (encodingError) gaps.push(`responses[${index}].response ${encodingError}`);
    if (responseText.length > CONTENT_GENERATION_MAX_RESPONSE_CHARS) {
      gaps.push(`responses[${index}].response 超过 ${CONTENT_GENERATION_MAX_RESPONSE_CHARS} 字符`);
    }
  });
  if (String(result.summary || "").length > 500) gaps.push("result.summary 最多 500 字符");
  return gaps;
}

function contentGenerationMarkdown(material, result) {
  const lines = [
    `# ${String(material && material.title || result.pageId)} Agent Responses`,
    "",
    `> 页面：${result.pageId}。以下内容按原页章节顺序，由同一个 content-generation Agent 对每章执行控制器返回的完整固定提示词后原样汇总。常见误解与自测章节未发送。`,
    "",
  ];
  result.responses.forEach(response => {
    lines.push(`## ${response.sectionNumber}. ${response.title}`, "", String(response.response).trim(), "");
  });
  return `${lines.join("\n").trim()}\n`;
}

function saveContentGenerationResponse(root = ROOT, input = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = Object.values(state.pages).find(page =>
      page.lease && page.lease.taskId === input.taskId
    );
    if (!record) throw new Error("内容生成响应对应的活动租约不存在");
    if (record.lease.token !== input.leaseToken) throw new Error("内容生成响应的租约令牌无效");
    if (record.lease.role !== "content-generation") throw new Error("只有 content-generation 角色可以保存章节回复");
    if (Date.parse(record.lease.expiresAt) <= Date.now()) throw new Error("内容生成租约已经过期");
    const material = contentGenerationReviewMaterial(resolvedRoot, record);
    const manifest = contentGenerationManifest(material);
    const savedResponses = Array.isArray(record.contentGeneration && record.contentGeneration.savedResponses)
      ? record.contentGeneration.savedResponses
      : [];
    const expected = manifest.eligibleSections[savedResponses.length];
    if (!expected) throw new Error("所有允许章节的回复均已保存");
    const sectionNumber = Number(input.sectionNumber);
    if (sectionNumber !== expected.sectionNumber) {
      throw new Error(`必须先保存第 ${expected.sectionNumber} 章“${expected.title}”的回复`);
    }
    if (input.title != null && String(input.title).trim() !== expected.title) {
      throw new Error("章节标题与当前待保存章节不一致");
    }
    const response = String(input.response || "").trim();
    if (!response) throw new Error("章节回复不能为空");
    const encodingError = contentGenerationResponseEncodingError(response);
    if (encodingError) throw new Error(`章节回复拒绝保存：${encodingError}`);
    if (response.length > CONTENT_GENERATION_MAX_RESPONSE_CHARS) {
      throw new Error(`章节回复超过 ${CONTENT_GENERATION_MAX_RESPONSE_CHARS} 字符`);
    }
    const saved = {
      sectionNumber: expected.sectionNumber,
      title: expected.title,
      response,
      savedAt: new Date().toISOString(),
    };
    savedResponses.push(saved);
    record.contentGeneration.savedResponses = savedResponses;
    record.contentGeneration.status = savedResponses.length === manifest.eligibleSections.length
      ? "responses-saved"
      : "in-progress";
    const outputRelative = record.contentGeneration.outputFile;
    const markdown = contentGenerationMarkdown(material, {
      pageId: record.id,
      responses: savedResponses,
    });
    atomicWrite(withinRoot(resolvedRoot, outputRelative), markdown);
    record.contentGeneration.outputHash = sha256(markdown);
    record.updatedAt = saved.savedAt;
    saveState(resolvedRoot, state);
    const next = manifest.eligibleSections[savedResponses.length] || null;
    appendEvent(resolvedRoot, "content-generation-response-saved", {
      id: record.id,
      taskId: input.taskId,
      sectionNumber: saved.sectionNumber,
      savedCount: savedResponses.length,
      remainingCount: manifest.eligibleSections.length - savedResponses.length,
    });
    return {
      status: "saved",
      pageId: record.id,
      sectionNumber: saved.sectionNumber,
      savedCount: savedResponses.length,
      totalCount: manifest.eligibleSections.length,
      outputFile: outputRelative,
      outputHash: record.contentGeneration.outputHash,
      nextSectionNumber: next ? next.sectionNumber : null,
      done: !next,
    };
  } finally {
    release();
  }
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

function readContentGenerationSection(root = ROOT, input = {}) {
  const resolvedRoot = path.resolve(root);
  const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
  if (record.lease.role !== "content-generation") {
    throw new Error("只有 content-generation 角色可以读取内容生成章节");
  }
  const requestedSection = Number(input.sectionNumber);
  if (!Number.isInteger(requestedSection) || requestedSection < 1) {
    throw new Error("sectionNumber 必须是正整数");
  }
  const material = contentGenerationReviewMaterial(resolvedRoot, record);
  const sections = material.sections;
  const section = sections.find(item => item.sectionNumber === requestedSection);
  if (!section) throw new Error(`页面 ${record.id} 不存在第 ${requestedSection} 章`);
  if (section.skipped) {
    throw new Error(`第 ${requestedSection} 章“${section.title}”按合同禁止发送给内容生成 Agent`);
  }
  const manifest = contentGenerationManifest(material);
  const savedCount = Array.isArray(record.contentGeneration && record.contentGeneration.savedResponses)
    ? record.contentGeneration.savedResponses.length
    : 0;
  const expected = manifest.eligibleSections[savedCount];
  if (!expected) throw new Error("所有允许章节均已处理，请提交最终结果");
  if (requestedSection !== expected.sectionNumber) {
    throw new Error(`必须按顺序读取第 ${expected.sectionNumber} 章“${expected.title}”`);
  }
  const eligible = sections.filter(item => !item.skipped);
  const position = eligible.findIndex(item => item.sectionNumber === requestedSection);
  const next = position >= 0 ? eligible[position + 1] : null;
  return {
    status: "ok",
    pageId: record.id,
    role: record.lease.role,
    prompt: CONTENT_GENERATION_PROMPT,
    section: {
      sectionNumber: section.sectionNumber,
      title: section.title,
      contentHash: section.contentHash,
      text: section.text,
      sourceOrder: section.sourceOrder,
    },
    nextSectionNumber: next ? next.sectionNumber : null,
    done: !next,
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

function validatePage(id, page) {
  const errors = [];
  if (!page || typeof page !== "object" || Array.isArray(page)) return ["result.page 必须是对象"];
  ["title", "subtitle", "thesis", "html"].forEach(key => {
    if (!String(page[key] || "").trim()) errors.push(`result.page.${key} 缺失`);
  });
  if (!/<section\b/i.test(String(page.html || ""))) errors.push("result.page.html 缺少教学章节");
  if (page.id && page.id !== id) errors.push("result.page.id 与任务页面不一致");
  return errors;
}

function exactHtmlBlocks(html, tag, className) {
  const pattern = new RegExp(`<${tag}\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
  return String(html || "").match(pattern) || [];
}

function htmlBlockWithClass(html, className) {
  const source = String(html || "");
  const classPattern = new RegExp(`class="[^"]*\\b${className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[^"]*"`, "i");
  const classMatch = classPattern.exec(source);
  if (!classMatch) return "";
  const openAt = source.lastIndexOf("<", classMatch.index);
  const tag = (source.slice(openAt).match(/^<([\w-]+)/) || [])[1];
  if (!tag) return "";
  const tokenPattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  tokenPattern.lastIndex = openAt;
  let depth = 0;
  let token;
  while ((token = tokenPattern.exec(source))) {
    if (token[0].startsWith("</")) depth -= 1;
    else if (!token[0].endsWith("/>")) depth += 1;
    if (depth === 0) return source.slice(openAt, tokenPattern.lastIndex);
  }
  return "";
}

function sectionRecordsForPreservation(html) {
  return (String(html || "").match(/<section\b[\s\S]*?<\/section>/gi) || []).map(sectionHtml => {
    const heading = (sectionHtml.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)
      || sectionHtml.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)
      || [])[1] || "";
    const headingWithoutMetadata = heading.replace(/<span\b[\s\S]*?<\/span>/gi, " ");
    return {
      html: sectionHtml,
      title: plainText(headingWithoutMetadata).replace(/^\d+(?:\.\d+)*\s+/, "").trim(),
    };
  });
}

function editorialPreservationReport(originalPage, candidatePage, removedSectionTitles = []) {
  const allowedRemoved = new Set((removedSectionTitles || []).map(title => String(title).trim()).filter(Boolean));
  const originalHtml = String(originalPage && originalPage.html || "");
  const candidateHtml = String(candidatePage && candidatePage.html || "");
  const originalSections = sectionRecordsForPreservation(originalHtml);
  const removedSections = originalSections.filter(section => (
    isConfiguredRemovedSectionTitle(section.title, [...allowedRemoved])
  ));
  const allowedRemovedTables = new Set(removedSections.flatMap(section => exactHtmlBlocks(section.html, "table", "dd-table")));
  const requiredFigures = exactHtmlBlocks(originalHtml, "figure", "dd-fig");
  const requiredTables = exactHtmlBlocks(originalHtml, "table", "dd-table")
    .filter(table => !allowedRemovedTables.has(table));
  const candidateFigures = exactHtmlBlocks(candidateHtml, "figure", "dd-fig");
  const candidateTables = exactHtmlBlocks(candidateHtml, "table", "dd-table");
  const candidateTableTexts = candidateTables.map(normalizedBlockText);
  const missingFigures = requiredFigures.filter(block => !candidateFigures.includes(block));
  const missingTables = requiredTables.filter(block => {
    const text = normalizedBlockText(block);
    return !text || !candidateTableTexts.includes(text);
  });
  const stillPresentRemovedSections = sectionRecordsForPreservation(candidateHtml)
    .filter(section => isConfiguredRemovedSectionTitle(section.title, [...allowedRemoved]))
    .map(section => section.title);
  return {
    passed: missingFigures.length === 0 && missingTables.length === 0 && stillPresentRemovedSections.length === 0,
    originalFigures: requiredFigures.length,
    candidateFigures: candidateFigures.length,
    originalRetainedTables: requiredTables.length,
    allowedRemovedTables: allowedRemovedTables.size,
    candidateTables: candidateTables.length,
    missingFigureCount: missingFigures.length,
    missingTableCount: missingTables.length,
    removedSectionTitles: [...allowedRemoved],
    stillPresentRemovedSections,
  };
}

function escapeEditorialHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractEditorialRadicals(value) {
  const radicals = [];
  const input = String(value || "");
  let source = "";
  for (let index = 0; index < input.length;) {
    if (input[index] !== "√") {
      source += input[index];
      index += 1;
      continue;
    }
    let cursor = index + 1;
    while (cursor < input.length && /\s/u.test(input[cursor])) cursor += 1;
    let radicand = "";
    let end = cursor;
    if (input[cursor] === "(") {
      let depth = 1;
      cursor += 1;
      const start = cursor;
      while (cursor < input.length && depth > 0 && input[cursor] !== "\n") {
        if (input[cursor] === "(") depth += 1;
        if (input[cursor] === ")") depth -= 1;
        cursor += 1;
      }
      if (depth === 0) {
        radicand = input.slice(start, cursor - 1);
        end = cursor;
      }
    } else {
      const simple = input.slice(cursor).match(/^([^\s()，,。；;:+\-*/=]+)/u);
      if (simple) {
        radicand = simple[1];
        end = cursor + simple[1].length;
      }
    }
    if (!radicand) {
      source += input[index];
      index += 1;
      continue;
    }
    const token = `\uE000RADICAL${radicals.length}\uE001`;
    radicals.push({ token, radicand });
    source += token;
    index = end;
  }
  return { source, radicals };
}

function renderEditorialInlineMarkdown(value) {
  const { source, radicals } = extractEditorialRadicals(value);
  let rendered = escapeEditorialHtml(source);
  rendered = rendered.replace(/`([^`]+)`/g, "<code>$1</code>");
  rendered = rendered.replace(/\\\((.+?)\\\)/g, '<span class="dd-inline-math" role="math">$1</span>');
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  radicals.forEach(({ token, radicand }) => {
    const safeRadicand = escapeEditorialHtml(radicand.trim());
    rendered = rendered.replace(
      token,
      `<math class="dd-inline-root" aria-label="根号 ${safeRadicand}"><msqrt><mtext>${safeRadicand}</mtext></msqrt></math>`,
    );
  });
  return rendered;
}

function markdownTableCells(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed.includes("|")) return null;
  const withoutEdges = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  const cells = withoutEdges.split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, "|"));
  return cells.length >= 2 ? cells : null;
}

function markdownTableAlignments(line) {
  const cells = markdownTableCells(line);
  if (!cells || cells.some(cell => !/^:?-{3,}:?$/.test(cell))) return null;
  return cells.map(cell => {
    if (cell.startsWith(":") && cell.endsWith(":")) return "center";
    if (cell.endsWith(":")) return "right";
    return "left";
  });
}

function normalizedBlockText(block) {
  return plainText(block).replace(/\s+/g, "").trim();
}

function tableRowTexts(block) {
  return [...String(block).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map(match => plainText(match[1]).replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter(Boolean);
}

function tableContentOverlap(a, b) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const shared = a.filter(row => setB.has(row)).length;
  return shared / Math.max(a.length, b.length);
}

function textBigrams(text) {
  const set = new Set();
  for (let index = 0; index < text.length - 1; index += 1) set.add(text.slice(index, index + 2));
  return set;
}

function textSimilarity(a, b) {
  if (!a || !b) return 0;
  const bigramsA = textBigrams(a);
  const bigramsB = textBigrams(b);
  let shared = 0;
  bigramsA.forEach(gram => { if (bigramsB.has(gram)) shared += 1; });
  return (2 * shared) / (bigramsA.size + bigramsB.size);
}

function tableBlocks(html) {
  return [...String(html || "").matchAll(/<div\b[^>]*class="[^"]*\bdd-table-wrap\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi)]
    .map(match => match[0]);
}

function renderEditorialTable(headerCells, alignments, bodyRows) {
  const cell = (tag, value, alignment) => (
    `<${tag} class="dd-align-${alignment}">${renderEditorialInlineMarkdown(value)}</${tag}>`
  );
  const header = `<thead><tr>${headerCells.map((value, index) => (
    cell("th", value, alignments[index] || "left")
  )).join("")}</tr></thead>`;
  const body = `<tbody>${bodyRows.map(row => `<tr>${headerCells.map((_, index) => (
    cell("td", row[index] || "", alignments[index] || "left")
  )).join("")}</tr>`).join("")}</tbody>`;
  return `<div class="dd-table-wrap"><table class="dd-table">${header}${body}</table></div>`;
}

function renderEditorialMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${renderEditorialInlineMarkdown(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(`<${list.tag}>${list.items.map(item => `<li>${renderEditorialInlineMarkdown(item)}</li>`).join("")}</${list.tag}>`);
    list = null;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.trim() === "\\[") {
      flushParagraph();
      flushList();
      const formula = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== "\\]") {
        formula.push(lines[index]);
        index += 1;
      }
      const source = formula.join("\n").trim();
      blocks.push(`<div class="dd-equation" role="math" aria-label="${escapeEditorialHtml(source.replace(/\s+/g, " "))}"><span>${escapeEditorialHtml(source)}</span></div>`);
      continue;
    }
    const headerCells = markdownTableCells(line);
    const alignments = index + 1 < lines.length ? markdownTableAlignments(lines[index + 1]) : null;
    if (headerCells && alignments && headerCells.length === alignments.length) {
      flushParagraph();
      flushList();
      const rows = [];
      index += 2;
      while (index < lines.length) {
        const cells = markdownTableCells(lines[index]);
        if (!cells || cells.length !== headerCells.length) break;
        rows.push(cells);
        index += 1;
      }
      index -= 1;
      blocks.push(renderEditorialTable(headerCells, alignments, rows));
      continue;
    }
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const tag = unordered ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push((unordered || ordered)[1].trim());
      continue;
    }
    flushList();
    const heading = line.match(/^#{3,6}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push(`<h3>${renderEditorialInlineMarkdown(heading[1])}</h3>`);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return blocks.join("\n");
}

function responseDocumentSections(markdown) {
  return [...String(markdown || "").matchAll(/(?:^|\n)##\s+(\d+)\.\s+([^\r\n]+)\r?\n\r?\n([\s\S]*?)(?=\r?\n##\s+\d+\.\s+|$)/g)]
    .map(match => ({
      sectionNumber: Number(match[1]),
      title: match[2].trim(),
      markdown: match[3].trim(),
    }));
}

function buildEditorialPageFromContentGeneration(root, record, publishedPage) {
  const generation = record.contentGeneration;
  if (!generation || generation.status !== "complete" || !generation.outputFile || !generation.outputHash) {
    throw new Error("页面没有已完成且可验证的 content-generation 输出");
  }
  const expectedRelative = `docs/deepdive-reviews/${record.id}-agent-responses.md`;
  if (generation.outputFile !== expectedRelative) throw new Error("content-generation 输出路径不符合页锁定规则");
  const sourcePath = withinRoot(root, generation.outputFile);
  if (!fs.existsSync(sourcePath)) throw new Error("content-generation 输出文件不存在");
  const markdown = fs.readFileSync(sourcePath, "utf8");
  const sourceHash = sha256(markdown);
  if (sourceHash !== generation.outputHash) throw new Error("content-generation 输出哈希与控制器记录不一致");
  const encodingError = contentGenerationResponseEncodingError(markdown);
  if (encodingError) throw new Error(`content-generation 输出拒绝导入：${encodingError}`);
  const generatedSections = responseDocumentSections(markdown);
  if (!generatedSections.length) throw new Error("content-generation 输出不包含可导入章节");
  const titles = new Set();
  generatedSections.forEach(section => {
    if (titles.has(section.title)) throw new Error(`content-generation 输出章节重复：${section.title}`);
    titles.add(section.title);
    if (isConfiguredRemovedSectionTitle(section.title)) {
      throw new Error(`content-generation 输出包含禁止章节：${section.title}`);
    }
    if (!section.markdown) throw new Error(`content-generation 输出章节为空：${section.title}`);
  });
  const originalSections = sectionRecordsForPreservation(publishedPage.html);
  const originalByTitle = new Map(originalSections.map(section => [section.title, section]));
  const renderedSections = generatedSections.map(section => {
    const original = originalByTitle.get(section.title);
    if (!original) throw new Error(`content-generation 章节无法匹配正式页：${section.title}`);
    const originalHeading = (original.html.match(/<h2\b[^>]*>[\s\S]*?<\/h2>/i)
      || original.html.match(/<h3\b[^>]*>[\s\S]*?<\/h3>/i)
      || [])[0]
      || `<h2><span class="dd-n">${section.sectionNumber}</span>${escapeEditorialHtml(section.title)}</h2>`;
    const renderedFull = renderEditorialMarkdown(section.markdown);
    const originalTables = exactHtmlBlocks(original.html, "table", "dd-table");
    const originalTableTexts = originalTables.map(normalizedBlockText).filter(Boolean);
    const originalRowSets = originalTables.map(tableRowTexts);
    let rendered = renderedFull;
    const renderedTableBlocks = tableBlocks(renderedFull);
    const renderedRowSets = renderedTableBlocks.map(tableRowTexts);
    renderedTableBlocks.forEach((block, index) => {
      const text = normalizedBlockText(block);
      if (text && originalTableTexts.some(originalText => originalText.includes(text) || text.includes(originalText))) {
        rendered = rendered.replace(block, "");
        return;
      }
      const rows = renderedRowSets[index];
      if (rows.length && originalRowSets.some(originalRows => tableContentOverlap(rows, originalRows) >= 0.8)) {
        rendered = rendered.replace(block, "");
        return;
      }
      if (text && originalTableTexts.some(originalText => textSimilarity(text, originalText) >= 0.85)) {
        rendered = rendered.replace(block, "");
      }
    });
    const renderedRowTexts = tableBlocks(rendered).map(tableRowTexts);
    const renderedTableTexts = tableBlocks(rendered).map(normalizedBlockText);
    const renderedText = plainText(rendered).replace(/\s+/g, "");
    const preservedBlocks = [
      ...exactHtmlBlocks(original.html, "figure", "dd-fig"),
      ...originalTables,
      ...exactHtmlBlocks(original.html, "div", "dd-formula"),
      ...exactHtmlBlocks(original.html, "div", "dd-src"),
    ].filter((block, index, all) => all.indexOf(block) === index)
      .filter(block => {
        if (!/^<table\b/i.test(block.trim())) return true;
        const text = normalizedBlockText(block);
        if (text && renderedText.includes(text)) return false;
        if (text && renderedTableTexts.some(renderedTableText => textSimilarity(text, renderedTableText) >= 0.85)) return false;
        const rows = tableRowTexts(block);
        return !rows.length || !renderedRowTexts.some(renderedRows => tableContentOverlap(rows, renderedRows) >= 0.8);
      });
    return `<section class="dd-sec" data-source="content-generation">${originalHeading}\n<div class="dd-agent-response">${rendered}</div>${preservedBlocks.length ? `\n${preservedBlocks.join("\n")}` : ""}\n</section>`;
  });
  const goalsBlock = htmlBlockWithClass(publishedPage.html, "dd-goals");
  const chainBlock = htmlBlockWithClass(publishedPage.html, "dd-chain");
  const sourceBlock = htmlBlockWithClass(publishedPage.html, "dd-src");
  if (!goalsBlock || !chainBlock || !sourceBlock) {
    throw new Error("正式页缺少可保留的学习目标、因果链或资料来源结构");
  }
  const candidateHtml = [goalsBlock, chainBlock, ...renderedSections, sourceBlock].join("\n");
  const allRequiredFigures = exactHtmlBlocks(publishedPage.html, "figure", "dd-fig");
  const missingFigures = allRequiredFigures.filter(block => !candidateHtml.includes(block));
  const removableTables = new Set(originalSections
    .filter(section => isConfiguredRemovedSectionTitle(section.title))
    .flatMap(section => exactHtmlBlocks(section.html, "table", "dd-table")));
  const allRequiredTables = exactHtmlBlocks(publishedPage.html, "table", "dd-table")
    .filter(block => !removableTables.has(block));
  const candidateTableTexts = exactHtmlBlocks(candidateHtml, "table", "dd-table")
    .map(normalizedBlockText);
  const missingTables = allRequiredTables.filter(block => {
    const text = normalizedBlockText(block);
    return !text || !candidateTableTexts.includes(text);
  });
  const missingPreservedBlocks = [...missingFigures, ...missingTables];
  if (missingPreservedBlocks.length) {
    renderedSections[renderedSections.length - 1] = renderedSections[renderedSections.length - 1]
      .replace(/\n<\/section>$/, `\n${missingPreservedBlocks.join("\n")}\n</section>`);
  }
  return {
    page: {
      ...clone(publishedPage),
      html: missingPreservedBlocks.length
        ? [goalsBlock, chainBlock, ...renderedSections, sourceBlock].join("\n")
        : candidateHtml,
    },
    source: {
      type: "content-generation-output",
      file: generation.outputFile,
      hash: sourceHash,
      sectionCount: generatedSections.length,
    },
  };
}

function editorialContentPolicyGaps(page) {
  const html = String(page && page.html || "");
  const visibleText = plainText(html);
  const headings = sectionRecordsForPreservation(html).map(section => section.title);
  const gaps = [];
  headings.filter(title => isConfiguredRemovedSectionTitle(title)).forEach(title => {
    gaps.push(`不得生成独立“${title}”章节`);
  });
  if (/\bdd-quiz\b/i.test(html)) gaps.push("不得生成自测题");
  if (/\bdd-answers\b/i.test(html)) gaps.push("不得生成自测答案");
  if (/√\s*\(/u.test(visibleText)) gaps.push("可见正文不得保留未排版的 √(…) 根式");
  if (/\|\s*:?-{3,}:?\s*\|/u.test(visibleText)) gaps.push("可见正文不得保留 Markdown 管道表格分隔行");
  const formulaBlocks = [...html.matchAll(/<div\b([^>]*)class="[^"]*\bdd-formula\b[^"]*"([^>]*)>([\s\S]*?)<\/div>/gi)];
  formulaBlocks.forEach((match, index) => {
    const attributes = `${match[1]} ${match[2]}`;
    const body = match[3];
    if (!plainText(body)) gaps.push(`第 ${index + 1} 个公式块为空`);
    if (/<code\b/i.test(body)) gaps.push(`第 ${index + 1} 个展示公式不得使用代码块渲染`);
    if (/data-(?:display|math)="mathml"/i.test(attributes)
      && (!/<math\b/i.test(body) || !/<math\b[^>]*aria-label="[^"]+"/i.test(body))) {
      gaps.push(`第 ${index + 1} 个 MathML 公式缺少 math 元素或 aria-label`);
    }
  });
  return gaps;
}

function visibleRawLatexSections(page) {
  const commandPattern = /\\(?:frac|partial|theta|varepsilon|epsilon|nabla|Delta|approx|times|cdot|rightarrow|left|right|mathsf|mathbb|operatorname|begin|end)\b/;
  return sectionRecordsForPreservation(page && page.html).map((section, index) => ({
    section: index + 1,
    text: plainText(section.html),
  })).filter(section => commandPattern.test(section.text));
}

function pageSourceSignature(page) {
  const html = String(page && page.html || "");
  const blocks = html.match(/<div\b[^>]*class="[^"]*\bdd-src\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
  return sha256(blocks.map(block => block.replace(/\s+/g, " ").trim()).join("\n"));
}

function evaluateEditorialCandidate(root, record, page) {
  const policyGaps = editorialContentPolicyGaps(page);
  const results = [runGate(root, root, TOOL_SCRIPTS.deepDiveValidator)];
  return {
    passed: policyGaps.length === 0 && results.every(result => result.passed),
    results,
    blockers: [
      ...policyGaps.map(message => ({ type: "format-policy", code: "forbidden-section", message })),
      ...results.filter(result => !result.passed).flatMap(result => gateDefects(result, record.id)),
    ],
  };
}

function ensureReviewHistory(record) {
  if (!Array.isArray(record.reviewHistory)) record.reviewHistory = [];
  return record.reviewHistory;
}

function compactBlocker(blocker) {
  return {
    code: String(blocker && (blocker.code || blocker.type || blocker.gate) || "blocker").slice(0, 160),
    section: Number.isInteger(blocker && blocker.section) ? blocker.section : null,
    message: String(blocker && (blocker.message || blocker.evidence) || JSON.stringify(blocker || {})).slice(0, 1000),
  };
}

function legacyAuditGaps(id, page, audit) {
  const gaps = [];
  const narrativeScan = scanNarrativeTemplates(page);
  const visiblePageText = [page.title, page.subtitle, page.thesis, page.html]
    .map(value => String(value || "").replace(/<[^>]+>/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const sectionCount = (String(page.html || "").match(/<section\b/gi) || []).length;
  const rawLatexSections = visibleRawLatexSections(page);
  if (!audit || typeof audit !== "object") return ["独立审计结果缺失"];
  if (audit.schemaVersion !== 2) {
    gaps.push("独立审计 schemaVersion 必须为 2");
  }
  if (audit.pageId !== id) gaps.push("独立审计 pageId 不匹配");
  if (audit.pageHash !== pageContentHash(page)) gaps.push("独立审计 pageHash 与当前正文不匹配");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt || "")) gaps.push("独立审计日期无效");
  if (!["pass", "fail"].includes(audit.decision)) {
    gaps.push("独立审计 decision 必须是 pass 或 fail");
  }
  if (!Array.isArray(audit.blockingFindings)) {
    gaps.push("独立审计 blockingFindings 必须是数组");
  } else {
    audit.blockingFindings.forEach((finding, index) => {
      if (!finding || typeof finding !== "object") {
        gaps.push(`blockingFindings[${index}] 必须是对象`);
        return;
      }
      if (!LEGACY_BLOCKER_CODES.has(finding.code)) {
        gaps.push(`blockingFindings[${index}] 使用了非阻断代码：${finding.code || "<missing>"}`);
      }
      if (!String(finding.claim || "").trim()) {
        gaps.push(`blockingFindings[${index}].claim 缺失`);
      }
      if (!String(finding.evidence || "").trim()) {
        gaps.push(`blockingFindings[${index}].evidence 缺失`);
      } else {
        const evidence = String(finding.evidence).replace(/\s+/g, " ").trim();
        if (!visiblePageText.includes(evidence)) {
          gaps.push(`blockingFindings[${index}].evidence 不是当前正文中的可见证据`);
        }
      }
      if (!String(finding.rationale || "").trim()) {
        gaps.push(`blockingFindings[${index}].rationale 缺失`);
      }
      if (finding.section !== null && !Number.isInteger(finding.section)) {
        gaps.push(`blockingFindings[${index}].section 必须是章节序号或 null`);
      } else if (Number.isInteger(finding.section)
        && (finding.section < 1 || finding.section > sectionCount)) {
        gaps.push(`blockingFindings[${index}].section 超出当前正文章节范围`);
      }
    });
    if (audit.decision === "pass" && audit.blockingFindings.length) {
      gaps.push("decision=pass 时 blockingFindings 必须为空");
    }
    if (audit.decision === "fail" && !audit.blockingFindings.length) {
      gaps.push("decision=fail 时必须提供至少一个高置信阻断项");
    }
  }
  if (rawLatexSections.length && (audit.decision !== "fail"
    || !Array.isArray(audit.blockingFindings)
    || !audit.blockingFindings.some(finding => finding && finding.code === "formula-error"))) {
    gaps.push(`正文第 ${rawLatexSections.map(item => item.section).join("、")} 节显示原始 LaTeX 命令，必须以 formula-error 阻断`);
  }
  const narrativeAudit = audit.narrativeAudit;
  if (!narrativeAudit || typeof narrativeAudit !== "object") {
    gaps.push("独立审计缺少 narrativeAudit 模板化叙事检查");
  } else {
    const expectedSections = narrativeScan.sections.map(section => section.section);
    const reviewedSections = Array.isArray(narrativeAudit.reviewedSections)
      ? narrativeAudit.reviewedSections
      : [];
    const normalizedReviewed = [...new Set(reviewedSections.filter(Number.isInteger))].sort((a, b) => a - b);
    if (JSON.stringify(normalizedReviewed) !== JSON.stringify(expectedSections)) {
      gaps.push("narrativeAudit.reviewedSections 必须覆盖全部核心教学章节且不得重复");
    }
    if (!Array.isArray(narrativeAudit.sectionOpenings)
      || narrativeAudit.sectionOpenings.length !== narrativeScan.sectionCount) {
      gaps.push("narrativeAudit.sectionOpenings 必须逐个核心教学章节提供开场证据");
    } else {
      const openingSections = new Set();
      narrativeAudit.sectionOpenings.forEach((opening, index) => {
        const sectionNumber = Number.isInteger(opening && opening.section)
          ? opening.section
          : index + 1;
        const section = narrativeScan.sections.find(item => item.section === sectionNumber);
        if (openingSections.has(sectionNumber)) {
          gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节重复`);
        }
        openingSections.add(sectionNumber);
        if (!section) {
          gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节超出正文范围`);
          return;
        }
        const evidence = String(opening && opening.evidence || "").replace(/\s+/g, " ").trim();
        if (!evidence || !section.text.includes(evidence)) {
          gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节缺少当前正文中的开场证据`);
        }
        if (!TEMPLATE_FAMILIES.has(opening && opening.patternFamily)) {
          gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节 patternFamily 非法`);
        }
      });
    }
    if (typeof narrativeAudit.pervasiveTemplateExpression !== "boolean") {
      gaps.push("narrativeAudit.pervasiveTemplateExpression 必须是布尔值");
    }
    if (!String(narrativeAudit.rationale || "").trim()) {
      gaps.push("narrativeAudit.rationale 缺失");
    }
    if (narrativeAudit.pervasiveTemplateExpression === true) {
      const hasTemplateBlocker = Array.isArray(audit.blockingFindings)
        && audit.blockingFindings.some(finding => finding && finding.code === "harmful-template-expression");
      if (audit.decision !== "fail" || !hasTemplateBlocker) {
        gaps.push("narrativeAudit 判定存在普遍模板化表达时，必须以 harmful-template-expression 判定 fail");
      }
    }
  }
  if (!Array.isArray(audit.sections) || !audit.sections.length) {
    gaps.push("独立审计缺少逐节结果");
    return gaps;
  }
  const expectedAuditSections = narrativeScan.sections.map(section => section.section);
  const submittedAuditSections = audit.sections
    .map(section => section && section.section)
    .filter(Number.isInteger);
  const uniqueSubmittedSections = [...new Set(submittedAuditSections)].sort((a, b) => a - b);
  if (JSON.stringify(uniqueSubmittedSections) !== JSON.stringify(expectedAuditSections)
    || submittedAuditSections.length !== uniqueSubmittedSections.length) {
    gaps.push("独立审计 sections 必须恰好覆盖全部核心教学章节且不得重复");
  }
  audit.sections.forEach((section, index) => {
    const sectionNumber = Number.isInteger(section && section.section) ? section.section : index + 1;
    const pageSection = narrativeScan.sections.find(item => item.section === sectionNumber);
    SIX_QUESTIONS.forEach(question => {
      const answer = section && section[question];
      if (!answer || !String(answer.answer || "").trim() || !String(answer.evidence || "").trim()) {
        gaps.push(`第 ${sectionNumber} 节：读者无法从正文确定 ${question}`);
        return;
      }
      if (audit.decision === "pass" && String(answer.answer).trim().length < 16) {
        gaps.push(`第 ${sectionNumber} 节：${question} 的审计答案少于 16 字`);
      }
      const evidence = plainText(answer.evidence);
      if (!pageSection || !evidence || !pageSection.text.includes(evidence)) {
        gaps.push(`第 ${sectionNumber} 节：${question} 的 evidence 不是本节正文中的可见证据`);
      }
    });
  });
  return gaps;
}

function visibleAuditText(page) {
  return [page.title, page.subtitle, page.thesis, page.html]
    .map(value => plainText(String(value || "")))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function auditGaps(id, page, audit, contract = null) {
  if (audit && audit.schemaVersion === 2 && (!contract || contract.schemaVersion === 2 || contract.legacyCompatible)) {
    return legacyAuditGaps(id, page, audit);
  }
  const gaps = [];
  const expected = contract || auditContract();
  const mode = expected.mode || "full";
  const visibleText = visibleAuditText(page);
  const sectionCount = (String(page.html || "").match(/<section\b/gi) || []).length;
  const rawLatexSections = visibleRawLatexSections(page);
  if (!audit || typeof audit !== "object") return ["独立审查结果缺失"];
  if (audit.schemaVersion !== AUDIT_SCHEMA_VERSION) gaps.push(`独立审查 schemaVersion 必须为 ${AUDIT_SCHEMA_VERSION}`);
  if (audit.pageId !== id) gaps.push("独立审查 pageId 不匹配");
  if (audit.pageHash !== pageContentHash(page)) gaps.push("独立审查 pageHash 与当前正文不匹配");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt || "")) gaps.push("独立审查日期无效");
  if (audit.mode !== mode) gaps.push(`独立审查 mode 必须为 ${mode}`);
  if (!["pass", "fail"].includes(audit.decision)) gaps.push("独立审查 decision 必须是 pass 或 fail");
  const findings = Array.isArray(audit.blockingFindings) ? audit.blockingFindings : null;
  if (!findings) gaps.push("独立审查 blockingFindings 必须是数组");
  (findings || []).forEach((finding, index) => {
    if (!finding || typeof finding !== "object") {
      gaps.push(`blockingFindings[${index}] 必须是对象`);
      return;
    }
    const verificationCodeAllowed = mode === "verification"
      && (expected.verificationFindings || []).some(item => item.findingId === finding.findingId && item.code === finding.code);
    if (!L3_BLOCKER_CODES.has(finding.code) && !verificationCodeAllowed) {
      gaps.push(`blockingFindings[${index}] 使用了非阻断代码：${finding.code || "<missing>"}`);
    }
    ["claim", "evidence", "rationale", "acceptanceCriteria"].forEach(field => {
      if (!String(finding[field] || "").trim()) gaps.push(`blockingFindings[${index}].${field} 缺失`);
    });
    const evidence = plainText(finding.evidence);
    if (evidence && !visibleText.includes(evidence)) gaps.push(`blockingFindings[${index}].evidence 不是当前正文中的可见证据`);
    const sections = Array.isArray(finding.sections)
      ? finding.sections
      : (Number.isInteger(finding.section) ? [finding.section] : []);
    if (!sections.length || sections.some(section => !Number.isInteger(section) || section < 1 || section > sectionCount)) {
      gaps.push(`blockingFindings[${index}].sections 必须包含有效章节序号`);
    }
    if (finding.code === "source-support-blocked") {
      const urls = Array.isArray(finding.sourceUrls) ? finding.sourceUrls : [];
      if (!urls.length || urls.some(url => !/^https:\/\//.test(String(url)))) {
        gaps.push(`blockingFindings[${index}].sourceUrls 必须包含联网核验使用的 HTTPS 来源`);
      }
    }
  });
  if (audit.decision === "pass" && (findings || []).length) gaps.push("decision=pass 时 blockingFindings 必须为空");
  if (audit.decision === "fail" && !(findings || []).length) gaps.push("decision=fail 时必须提供至少一个 blocker");
  if (mode === "full" && rawLatexSections.length && (audit.decision !== "fail"
    || !(findings || []).some(finding => finding && finding.code === "formula-error"))) {
    gaps.push(`正文第 ${rawLatexSections.map(item => item.section).join("、")} 节显示原始 LaTeX 命令，必须以 formula-error 阻断`);
  }
  if (!Array.isArray(audit.warnings)) gaps.push("独立审查 warnings 必须是数组");
  (Array.isArray(audit.warnings) ? audit.warnings : []).forEach((warning, index) => {
    if (!warning || typeof warning !== "object") {
      gaps.push(`warnings[${index}] 必须是对象`);
      return;
    }
    if (!L3_WARNING_CODES.has(warning.code)) gaps.push(`warnings[${index}] 使用了非法 warning 代码`);
    if (!String(warning.message || warning.rationale || "").trim()) gaps.push(`warnings[${index}] 缺少说明`);
  });

  if (mode === "full") {
    if (!Array.isArray(audit.coreConcepts) || !audit.coreConcepts.length) {
      gaps.push("完整审查必须自行识别至少一个核心概念");
    } else {
      const names = new Set();
      audit.coreConcepts.forEach((concept, index) => {
        const name = String(concept && concept.name || "").trim();
        if (!name) gaps.push(`coreConcepts[${index}].name 缺失`);
        if (names.has(name)) gaps.push(`coreConcepts[${index}] 核心概念重复：${name}`);
        names.add(name);
        if (!Array.isArray(concept.sections) || !concept.sections.length
          || concept.sections.some(section => !Number.isInteger(section) || section < 1 || section > sectionCount)) {
          gaps.push(`coreConcepts[${index}].sections 必须包含有效章节序号`);
        }
        for (const part of ["definition", "problem", "boundary"]) {
          const check = concept && concept[part];
          if (!check || !["pass", "fail"].includes(check.status)) {
            gaps.push(`coreConcepts[${index}].${part}.status 必须是 pass 或 fail`);
            continue;
          }
          if (!String(check.evidence || "").trim() || !visibleText.includes(plainText(check.evidence))) {
            gaps.push(`coreConcepts[${index}].${part}.evidence 必须来自当前正文`);
          }
          if (!String(check.rationale || "").trim()) gaps.push(`coreConcepts[${index}].${part}.rationale 缺失`);
          if (check.status === "fail") {
            const code = `core-concept-${part}-missing`;
            if (!(findings || []).some(finding => finding && finding.code === code && String(finding.concept || "").trim() === name)) {
              gaps.push(`核心概念 ${name} 的 ${part} 失败时必须提交 ${code} blocker`);
            }
          }
        }
      });
    }
    if (Array.isArray(audit.verificationResults) && audit.verificationResults.length) {
      gaps.push("完整审查不得提交 verificationResults");
    }
  } else {
    if (Array.isArray(audit.coreConcepts) && audit.coreConcepts.length) gaps.push("定向复核不得重新生成核心概念清单");
    const expectedFindings = expected.verificationFindings || [];
    const results = Array.isArray(audit.verificationResults) ? audit.verificationResults : [];
    const expectedIds = expectedFindings.map(finding => finding.findingId).sort();
    const actualIds = results.map(result => result && result.findingId).sort();
    if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) gaps.push("定向复核必须逐项覆盖首轮全部阻断问题且不得增加新问题");
    results.forEach((result, index) => {
      if (typeof result.resolved !== "boolean") gaps.push(`verificationResults[${index}].resolved 必须是布尔值`);
      if (!String(result.evidence || "").trim() || !visibleText.includes(plainText(result.evidence))) {
        gaps.push(`verificationResults[${index}].evidence 必须来自返修后的当前正文`);
      }
      if (!String(result.rationale || "").trim()) gaps.push(`verificationResults[${index}].rationale 缺失`);
    });
    const unresolvedIds = results.filter(result => result && result.resolved === false).map(result => result.findingId).sort();
    const submittedIds = (findings || []).map(finding => finding.findingId).sort();
    if (JSON.stringify(unresolvedIds) !== JSON.stringify(submittedIds)) gaps.push("定向复核的 blockingFindings 必须恰好对应仍未解决的首轮问题");
  }
  return gaps;
}

function auditBlockers(audit) {
  if (!audit || audit.decision !== "fail" || !Array.isArray(audit.blockingFindings)) return [];
  return audit.blockingFindings.map((finding, index) => ({
    type: "content-audit",
    code: finding.code,
    findingId: finding.findingId || sha256(`${finding.code}:${JSON.stringify(finding.sections || finding.section)}:${finding.claim}:${index}`).slice(0, 24),
    section: Number.isInteger(finding.section) ? finding.section : (finding.sections || [])[0] || null,
    sections: clone(finding.sections || (Number.isInteger(finding.section) ? [finding.section] : [])),
    concept: finding.concept || null,
    message: `${finding.claim}：${finding.rationale}`,
    evidence: finding.evidence,
    acceptanceCriteria: finding.acceptanceCriteria || "修复该问题并保留相关章节原意",
    sourceUrls: clone(finding.sourceUrls || []),
  }));
}

function validateAuditResult(root = ROOT, input = {}) {
  const resolvedRoot = path.resolve(root);
  const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
  if (!record.lease || record.lease.role !== "audit") {
    throw new Error("Audit preflight is available only to an active audit lease");
  }
  const page = currentPage(resolvedRoot, record);
  const gaps = auditGaps(record.id, page, input.result, auditContract(record));
  return {
    status: gaps.length ? "invalid" : "valid",
    pageId: record.id,
    gapCount: gaps.length,
    gaps,
  };
}

function validatePageResult(root = ROOT, input = {}) {
  const resolvedRoot = path.resolve(root);
  const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
  if (!record.lease || record.lease.role === "audit") {
    throw new Error("Page-result preflight is available only to an active write, update, or repair lease");
  }
  const result = input.result || {};
  const page = result.page;
  const originalPage = currentPage(resolvedRoot, record);
  const gaps = validatePage(record.id, page);
  if (record.editorialWorkflow) {
    gaps.push(...editorialContentPolicyGaps(page));
    if (record.lease.role === "repair" && pageSourceSignature(page) !== pageSourceSignature(originalPage)) {
      gaps.push("返修不得添加、删除或替换页面来源");
    }
    if (record.lease.role === "repair") {
      const preservation = editorialPreservationReport(originalPage, page, []);
      if (!preservation.passed) gaps.push("返修不得删除或改写已有图表");
      const rawLatexSections = visibleRawLatexSections(page);
      if (rawLatexSections.length) {
        gaps.push(`返修后第 ${rawLatexSections.map(item => item.section).join("、")} 节仍显示原始 LaTeX 命令`);
      }
    }
  }
  if (page && typeof page === "object" && !Array.isArray(page)) {
    for (const key of Object.keys(originalPage || {})) {
      if (!Object.hasOwn(page, key)) gaps.push(`result.page.${key} is missing from the complete page object`);
    }
  }
  if (!String(result.summary || "").trim()) gaps.push("result.summary is missing");
  return {
    status: gaps.length ? "invalid" : "valid",
    pageId: record.id,
    role: record.lease.role,
    gapCount: gaps.length,
    gaps,
  };
}

function candidateRelativePath(id) {
  return `.stage2/results/${id}/candidate.json`;
}

function privateAuditRelativePath(id) {
  return `.stage2/results/${id}/audit.private.json`;
}

function provisionalPublicationRelativePath(id) {
  return `.stage2/results/${id}/provisional-publication.json`;
}

function editorialPublicationRelativePath(id) {
  return `.stage2/results/${id}/editorial-publication.json`;
}

function pageOverrideSource(id, page) {
  return [
    "/* Generated by the Stage 2 controller. Do not edit by hand. */",
    "(function () {",
    `  const page = window.DEEPDIVE && window.DEEPDIVE[${JSON.stringify(id)}];`,
    `  if (!page) throw new Error(${JSON.stringify(`Stage 2 override target missing: ${id}`)});`,
    `  Object.assign(page, ${JSON.stringify(page, null, 2)});`,
    "})();",
    "",
  ].join("\n");
}

function pageRegistrationSource(id, page) {
  return [
    "/* Generated by the Stage 2 controller. Do not edit by hand. */",
    "window.DEEPDIVE = window.DEEPDIVE || {};",
    `window.DEEPDIVE[${JSON.stringify(id)}] = ${JSON.stringify(page, null, 2)};`,
    "",
  ].join("\n");
}

function runtimeSource(id, page) {
  return "/* Generated by tools/build-deepdive-runtime.js. Do not edit. */\n"
    + "window.DEEPDIVE=window.DEEPDIVE||{};"
    + `window.DEEPDIVE[${JSON.stringify(id)}]=${JSON.stringify(page)};\n`;
}

function runtimeManifestSource(ids) {
  return "/* Generated by tools/build-deepdive-runtime.js. Do not edit. */\n"
    + `window.DEEPDIVE_RUNTIME=${JSON.stringify({
      base: "data/deepdive-runtime",
      ids: [...new Set(ids)].sort(),
    })};\n`;
}

function loadRuntimeIds(root) {
  const file = path.join(root, "data", "deepdive-runtime", "manifest.js");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return (context.window.DEEPDIVE_RUNTIME && context.window.DEEPDIVE_RUNTIME.ids) || [];
}

function applyCoreMembership(graphSource, id) {
  const marker = /(\bcore\s*:\s*\[)/;
  const match = marker.exec(graphSource);
  if (!match) throw new Error("data/graph.js 缺少 core 数组");
  const start = graphSource.indexOf("[", match.index);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < graphSource.length; index++) {
    const character = graphSource[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character === "[") depth++;
    if (character === "]" && --depth === 0) {
      const body = graphSource.slice(start + 1, index);
      if (new RegExp(`["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(body)) return graphSource;
      const trimmed = graphSource.slice(0, index).replace(/\s+$/, "");
      const whitespace = graphSource.slice(trimmed.length, index);
      return `${trimmed},\n    ${JSON.stringify(id)}${whitespace}${graphSource.slice(index)}`;
    }
  }
  throw new Error("data/graph.js 的 core 数组未闭合");
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

function finalizeManualReview(root = ROOT, id, reason, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.state !== "manual-review") {
      throw new Error(`页面 ${id} 当前不是 manual-review：${record.state}`);
    }
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能复核发布`);
    if (String(reason || "").trim().length < 3) throw new Error("复核发布原因至少需要 3 个字符");
    if (!record.auditFile) throw new Error(`页面 ${id} 没有可复用的最终独立审计`);
    const auditPath = withinRoot(resolvedRoot, record.auditFile);
    if (!fs.existsSync(auditPath)) throw new Error(`独立审计文件不存在：${record.auditFile}`);
    const audit = readJson(auditPath);
    const page = currentPage(resolvedRoot, record);
    if (record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview) {
      const approvedPage = clone(page);
      delete approvedPage.publication;
      const machineBlockers = clone(record.blockers || []);
      const publisher = options.publishCandidate || publishEditorialHumanApprovedCandidate;
      const receipt = publisher(resolvedRoot, record, approvedPage, audit, options);
      const completionFile = path.join(resultDirectory(resolvedRoot, record.id), "completion.json");
      writeJson(completionFile, receipt);
      record.auditHash = sha256(audit);
      record.auditFile = `docs/deepdive-audits/${record.id}.json`;
      record.contentHash = pageContentHash(approvedPage);
      record.blockers = [];
      record.state = "published-approved";
      record.published = true;
      record.publication = {
        schemaVersion: 1,
        status: "published-approved",
        reviewStatus: "human-approved",
        pageHash: record.contentHash,
        publishedAt: new Date().toISOString(),
        machineBlockerCountAtApproval: machineBlockers.length,
      };
      record.editorialWorkflow.status = "human-approved";
      record.editorialWorkflow.auditMode = "complete";
      record.provisionalReceipt = null;
      record.finalReview = {
        status: "published-approved",
        completedAt: new Date().toISOString(),
        blockerCountAtApproval: machineBlockers.length,
        machineBlockers,
        humanApproved: true,
        reason: String(reason).slice(0, 500),
      };
      record.completionReceipt = path.relative(resolvedRoot, completionFile).replace(/\\/g, "/");
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "editorial-human-approved", {
        id,
        reason: String(reason).slice(0, 500),
        pageHash: record.contentHash,
        auditHash: record.auditHash,
        machineBlockerCountAtApproval: machineBlockers.length,
      });
      return {
        status: "published-approved",
        pageId: record.id,
        pageHash: record.contentHash,
        auditHash: record.auditHash,
        overriddenMachineBlockerCount: machineBlockers.length,
      };
    }
    const gaps = auditGaps(record.id, page, audit, auditContract(record));
    const explicitBlockers = gaps.length ? [] : auditBlockers(audit);
    const automaticNarrativeBlockers = narrativeTemplateBlockers(page, audit);
    const policyBlockers = [
      ...automaticNarrativeBlockers,
      ...gaps.map(message => ({ type: "coverage", message })),
      ...explicitBlockers,
    ];
    const evaluator = options.evaluateCandidate || evaluateCandidate;
    const gate = policyBlockers.length
      ? { passed: false, results: [], blockers: policyBlockers }
      : evaluator(resolvedRoot, record, page, audit);
    record.blockers = clone(gate.blockers || []);
    record.updatedAt = new Date().toISOString();
    if (!gate.passed) {
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "manual-review-recheck-blocked", {
        id,
        reason: String(reason).slice(0, 500),
        blockerCount: record.blockers.length,
      });
      return {
        status: "still-blocked",
        pageId: id,
        state: record.state,
        blockerCount: record.blockers.length,
        blockers: clone(record.blockers),
      };
    }

    const publisher = options.publishCandidate || publishCandidate;
    const approvedPage = clone(page);
    delete approvedPage.publication;
    const receipt = publisher(resolvedRoot, record, approvedPage, audit);
    const completionFile = path.join(resultDirectory(resolvedRoot, record.id), "completion.json");
    writeJson(completionFile, receipt);
    record.auditHash = sha256(audit);
    record.auditFile = `docs/deepdive-audits/${record.id}.json`;
    record.contentHash = pageContentHash(page);
    record.blockers = [];
    record.editorialWarnings = clone(gate.editorialWarnings || []);
    record.state = "l3-auto-passed";
    record.published = true;
    record.publication = {
      schemaVersion: 1,
      status: "published-approved",
      reviewStatus: "l3-auto-passed",
      pageHash: pageContentHash(approvedPage),
      publishedAt: new Date().toISOString(),
    };
    record.provisionalReceipt = null;
    record.finalReview = {
      status: "l3-auto-passed",
      completedAt: new Date().toISOString(),
      blockerCount: 0,
      reusedAudit: true,
      reason: String(reason).slice(0, 500),
    };
    record.completionReceipt = path.relative(resolvedRoot, completionFile).replace(/\\/g, "/");
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "manual-review-finalized", {
      id,
      reason: String(reason).slice(0, 500),
      pageHash: record.contentHash,
      auditHash: record.auditHash,
    });
    return {
      status: "l3-auto-passed",
      pageId: record.id,
      pageHash: record.contentHash,
      auditHash: record.auditHash,
      reusedAudit: true,
    };
  } finally {
    release();
  }
}

function targetRecord(root, relativePath, afterContent) {
  const file = withinRoot(root, relativePath);
  const beforeExists = fs.existsSync(file);
  const beforeContent = beforeExists ? fs.readFileSync(file, "utf8") : "";
  return {
    relativePath,
    beforeExists,
    beforeContent,
    afterContent,
    beforeHash: sha256(beforeContent),
    afterHash: sha256(afterContent),
  };
}

function restoreTarget(root, target) {
  const file = withinRoot(root, target.relativePath);
  if (target.beforeExists) atomicWrite(file, target.beforeContent);
  else if (fs.existsSync(file)) fs.unlinkSync(file);
}

function publishedTargets(root, record, page, audit) {
  const id = record.id;
  const targets = [];
  let graphContent = null;
  if (record.integration) {
    graphContent = fs.readFileSync(path.join(root, "data", "graph.js"), "utf8");
    const graphContext = { window: {} };
    vm.createContext(graphContext);
    vm.runInContext(graphContent, graphContext);
    if (
      record.integration.bindings
      && record.integration.bindings.graphHash
      && graphFingerprint(graphContext.window.GRAPH) !== record.integration.bindings.graphHash
    ) {
      throw new Error("正式地图已变化；新节点集成包需要重新计算学习路径与布局");
    }
    const manifest = { ...clone(record.integration), deepDive: page };
    graphContent = transformGraph(graphContent, manifest);
    if (manifest.core && manifest.core.requested) graphContent = applyCoreMembership(graphContent, id);
    targets.push(targetRecord(root, "data/graph.js", graphContent));
    targets.push(targetRecord(root, `data/deepdive/${id}.js`, pageRegistrationSource(id, page)));
  } else if (record.candidateFile) {
    targets.push(targetRecord(
      root,
      `data/deepdive/zzzzz-stage2-${id}.js`,
      pageOverrideSource(id, page),
    ));
  }
  targets.push(targetRecord(
    root,
    `docs/deepdive-audits/${id}.json`,
    `${JSON.stringify(audit, null, 2)}\n`,
  ));
  targets.push(targetRecord(root, `data/deepdive-runtime/${id}.js`, runtimeSource(id, page)));
  targets.push(targetRecord(
    root,
    "data/deepdive-runtime/manifest.js",
    runtimeManifestSource([...loadRuntimeIds(root), id]),
  ));
  const supplementIds = new Set((record.origin && record.origin.ids) || []);
  if (supplementIds.size) {
    const queue = loadSupplementQueue(root);
    let changed = false;
    (queue.items || []).forEach(item => {
      if (supplementIds.has(item.id) && item.status === "pending") {
        item.status = "applied";
        item.appliedAt = new Date().toISOString();
        item.stage2PageHash = pageContentHash(page);
        changed = true;
      }
    });
    if (changed) {
      targets.push(targetRecord(
        root,
        "data/video-concept-supplements.json",
        `${JSON.stringify(queue, null, 2)}\n`,
      ));
    }
  }
  return targets;
}

function publishCandidate(root, record, page, audit) {
  const targets = publishedTargets(root, record, page, audit);
  const written = [];
  try {
    targets.forEach(target => {
      const file = withinRoot(root, target.relativePath);
      const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
      if (sha256(current) !== target.beforeHash) {
        throw new Error(`正式目标在发布前变化：${target.relativePath}`);
      }
      atomicWrite(file, target.afterContent);
      written.push(target);
    });
    const validators = [
      runGate(root, root, TOOL_SCRIPTS.graphValidator),
      runGate(root, root, TOOL_SCRIPTS.deepDiveValidator),
      runGate(root, root, TOOL_SCRIPTS.deepDiveL3Audit, ["--require-benchmark", record.id]),
      runGate(root, root, TOOL_SCRIPTS.videoApplicationValidator),
    ];
    const failed = validators.find(result => !result.passed);
    if (failed) throw new Error(`发布后集成检查失败：${failed.script}\n${failed.output}`);
    const receipt = {
      schemaVersion: 1,
      status: "published",
      pageId: record.id,
      pageHash: pageContentHash(page),
      auditHash: sha256(audit),
      publishedAt: new Date().toISOString(),
      targets: targets.map(target => ({
        relativePath: target.relativePath,
        beforeHash: target.beforeHash,
        afterHash: target.afterHash,
      })),
      validators: validators.map(result => ({ script: result.script, passed: result.passed })),
    };
    receipt.receiptHash = sha256(receipt);
    return receipt;
  } catch (error) {
    written.reverse().forEach(target => restoreTarget(root, target));
    error.message += "\n已恢复本次发布写入。";
    throw error;
  }
}

function publishEditorialHumanApprovedCandidate(root, record, page, audit, options = {}) {
  const targets = publishedTargets(root, record, page, audit);
  const result = writePublicationTargets(root, record, targets, {
    ...options,
    validators: options.validators || (() => [
      runGate(root, root, TOOL_SCRIPTS.graphValidator),
      runGate(root, root, TOOL_SCRIPTS.deepDiveValidator),
      runGate(root, root, TOOL_SCRIPTS.videoApplicationValidator),
    ]),
  });
  const receipt = {
    schemaVersion: 1,
    status: "published-human-approved",
    pageId: record.id,
    pageHash: pageContentHash(page),
    auditHash: sha256(audit),
    publishedAt: new Date().toISOString(),
    machineBlockerCountAtApproval: (record.blockers || []).length,
    targets: (result.targets || targets).map(target => ({
      relativePath: target.relativePath,
      beforeHash: target.beforeHash,
      afterHash: target.afterHash,
    })),
    validators: (result.validators || []).map(item => ({ script: item.script, passed: item.passed })),
  };
  receipt.receiptHash = sha256(receipt);
  return receipt;
}

function provisionalPageMetadata(record, page, blockers, reason, publishedAt) {
  return {
    schemaVersion: 1,
    status: "published-provisional",
    reviewStatus: "manual-review",
    label: "未通过审计 · 暂行版本",
    blockerCount: blockers.length,
    candidateHash: pageContentHash(page),
    publishedAt,
    reason: String(reason).trim().slice(0, 500),
  };
}

function provisionalPublishedTargets(root, record, page, audit) {
  if (record.integration) {
    throw new Error("新概念节点不能以不合格暂行版本发布；必须先通过正式门禁");
  }
  const targets = [
    targetRecord(
      root,
      `data/deepdive/zzzzz-stage2-${record.id}.js`,
      pageOverrideSource(record.id, page),
    ),
    targetRecord(root, `data/deepdive-runtime/${record.id}.js`, runtimeSource(record.id, page)),
    targetRecord(
      root,
      "data/deepdive-runtime/manifest.js",
      runtimeManifestSource([...loadRuntimeIds(root), record.id]),
    ),
  ];
  if (audit) {
    targets.push(targetRecord(
      root,
      `docs/deepdive-audits/${record.id}.json`,
      `${JSON.stringify(audit, null, 2)}\n`,
    ));
  }
  return targets;
}

function writePublicationTargets(root, record, targets, options = {}) {
  const written = [];
  try {
    targets.forEach(target => {
      const file = withinRoot(root, target.relativePath);
      const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
      if (sha256(current) !== target.beforeHash) {
        throw new Error(`正式目标在暂行发布前变化：${target.relativePath}`);
      }
      atomicWrite(file, target.afterContent);
      written.push(target);
    });
    const validatorFactory = options.validators || (() => [
      runGate(root, root, TOOL_SCRIPTS.graphValidator),
      runGate(root, root, TOOL_SCRIPTS.deepDiveValidator),
      runGate(root, root, TOOL_SCRIPTS.videoApplicationValidator),
    ]);
    const validators = validatorFactory();
    const failed = validators.find(result => !result.passed);
    if (failed) throw new Error(`暂行发布后集成检查失败：${failed.script}\n${failed.output}`);
    return {
      targets,
      validators,
    };
  } catch (error) {
    written.reverse().forEach(target => restoreTarget(root, target));
    error.message += "\n已恢复本次暂行发布写入。";
    throw error;
  }
}

function editorialDraftMetadata(record, page, reviewStatus, blockerCount = 0) {
  const labels = {
    "audit-pending": "待审草稿",
    "repair-pending": "机器审查未通过 · 等待返修",
    "verification-pending": "返修完成 · 等待定向复核",
    "human-revision-pending": "人工退回 · 等待修改",
    "human-review-pending": "机器审查通过 · 等待人工审查",
    "human-review-blocked": "机器审查未通过 · 等待人工审查",
  };
  return {
    schemaVersion: 1,
    status: "published-editorial-draft",
    reviewStatus,
    label: labels[reviewStatus] || "待审草稿",
    blockerCount,
    candidateHash: pageContentHash(page),
    publishedAt: record.publication && record.publication.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reason: record.publication && record.publication.reason || "新版正文待审",
  };
}

function refreshEditorialDraftPublication(root, record, page, reviewStatus, blockerCount, options = {}) {
  const publication = editorialDraftMetadata(record, page, reviewStatus, blockerCount);
  const draftPage = { ...clone(page), publication };
  const targets = provisionalPublishedTargets(root, record, draftPage, null)
    .filter(target => !target.relativePath.endsWith("manifest.js"));
  const writer = options.publishEditorialDraft || ((targetRoot, targetRecordValue, targetValues) =>
    writePublicationTargets(targetRoot, targetRecordValue, targetValues, options));
  const result = writer(root, record, targets, publication) || { targets };
  record.publication = publication;

  if (record.editorialReceipt) {
    const receiptPath = withinRoot(root, record.editorialReceipt);
    if (fs.existsSync(receiptPath)) {
      const receipt = readJson(receiptPath);
      for (const target of result.targets || targets) {
        const saved = (receipt.targets || []).find(item => item.relativePath === target.relativePath);
        if (saved) {
          saved.afterContent = target.afterContent;
          saved.afterHash = target.afterHash;
        }
      }
      receipt.pageHash = pageContentHash(page);
      receipt.lastDraftStatus = reviewStatus;
      receipt.receiptHash = sha256({ ...receipt, receiptHash: undefined });
      writeJson(receiptPath, receipt);
    }
  }
  return publication;
}

function returnEditorialForRevision(root = ROOT, id, input = {}, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (!record.editorialWorkflow) throw new Error("只有新版正文流程可以使用人工定向退回");
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能人工退回`);
    if (record.state !== "manual-review") throw new Error(`页面 ${id} 当前不是 manual-review`);
    const reason = String(input.reason || "").trim();
    if (reason.length < 3) throw new Error("人工退回原因至少需要 3 个字符");
    const page = currentPage(resolvedRoot, record);
    const sectionCount = (String(page && page.html || "").match(/<section\b/gi) || []).length;
    const issues = Array.isArray(input.issues) ? input.issues : [];
    if (!issues.length) throw new Error("人工退回必须至少指出一个具体问题");
    const findings = issues.map((issue, index) => {
      const claim = String(issue && issue.claim || "").trim();
      const acceptanceCriteria = String(issue && issue.acceptanceCriteria || "").trim();
      const sections = Array.isArray(issue && issue.sections) ? issue.sections : [];
      if (!claim || !acceptanceCriteria) throw new Error(`人工问题 ${index + 1} 缺少问题说明或验收标准`);
      if (!sections.length || sections.some(section => !Number.isInteger(section) || section < 1 || section > sectionCount)) {
        throw new Error(`人工问题 ${index + 1} 必须指定有效章节序号`);
      }
      return {
        type: "human-review",
        code: "human-review-issue",
        findingId: sha256(`human:${id}:${index}:${claim}:${JSON.stringify(sections)}`).slice(0, 24),
        section: sections[0],
        sections: clone(sections),
        concept: issue.concept || null,
        message: claim,
        evidence: String(issue.evidence || "").trim(),
        acceptanceCriteria,
        sourceUrls: [],
      };
    });
    record.blockers = findings;
    record.state = "repair-queued";
    record.finalReview = null;
    record.editorialWorkflow.status = "human-revision-pending";
    record.editorialWorkflow.auditMode = "verification";
    record.editorialWorkflow.verificationSource = "human";
    record.editorialWorkflow.initialBlockingFindings = clone(findings);
    record.editorialWorkflow.humanRevisionCount = Number(record.editorialWorkflow.humanRevisionCount || 0) + 1;
    refreshEditorialDraftPublication(resolvedRoot, record, page, "human-revision-pending", findings.length, options);
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "editorial-returned-for-human-revision", {
      id,
      reason: reason.slice(0, 500),
      issueCount: findings.length,
      humanRevisionCount: record.editorialWorkflow.humanRevisionCount,
    });
    return {
      status: "repair-queued",
      pageId: id,
      nextState: record.state,
      issueCount: findings.length,
      verificationSource: "human",
    };
  } finally {
    release();
  }
}

function importEditorialCandidate(root = ROOT, id, input = {}, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    expireLease(resolvedRoot, state);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (activeRecord(state)) throw new Error("存在活动租约，不能导入人工整理候选页");
    if (!record.published || record.integration) {
      throw new Error("人工整理候选导入仅适用于已有正式理解页");
    }
    const replacingLegacyCandidate = ["audit-queued", "repair-queued"].includes(record.state)
      && input.useContentGenerationOutput === true
      && record.contentGeneration
      && record.contentGeneration.status === "complete"
      && (!record.publication || record.publication.status === "published-current");
    if (!["l3-auto-passed", "published-approved", "manual-review"].includes(record.state)
      && !replacingLegacyCandidate) {
      throw new Error(`页面 ${id} 当前状态为 ${record.state}，不能导入人工整理候选页`);
    }
    if (record.publication && ["published-provisional", "published-editorial-draft"].includes(record.publication.status)) {
      throw new Error(`页面 ${id} 已有未收尾的暂行或待审版本`);
    }
    const reason = String(input.reason || "").trim();
    if (reason.length < 3) throw new Error("候选导入原因至少需要 3 个字符");
    const publishedPage = loadDeepDivePages(resolvedRoot)[id];
    if (!publishedPage) throw new Error(`无法读取页面 ${id} 的当前正式版本`);
    const generatedCandidate = input.useContentGenerationOutput === true
      ? buildEditorialPageFromContentGeneration(resolvedRoot, record, publishedPage)
      : null;
    const page = generatedCandidate ? generatedCandidate.page : clone(input.page);
    if (page && typeof page === "object") delete page.publication;
    const pageErrors = validatePage(id, page);
    pageErrors.push(...editorialContentPolicyGaps(page));
    if (pageErrors.length) throw new Error(pageErrors.join("\n"));
    const narrativeBlockers = narrativeTemplateBlockers(page, null);
    if (narrativeBlockers.length) {
      throw new Error(`人工候选触发模板化叙事阻断：${narrativeBlockers.map(item => item.message).join("；")}`);
    }
    const removedSectionTitles = Array.isArray(input.removedSectionTitles)
      ? input.removedSectionTitles
      : DEFAULT_EDITORIAL_REMOVED_SECTIONS;
    let preservation = editorialPreservationReport(publishedPage, page, removedSectionTitles);
    if (generatedCandidate && !preservation.passed
      && (preservation.missingFigureCount || preservation.missingTableCount)) {
      const originalSections = sectionRecordsForPreservation(publishedPage.html);
      const allowedRemovedTables = new Set(originalSections
        .filter(section => isConfiguredRemovedSectionTitle(section.title, removedSectionTitles))
        .flatMap(section => exactHtmlBlocks(section.html, "table", "dd-table")));
      const candidateFigures = exactHtmlBlocks(page.html, "figure", "dd-fig");
      const candidateTables = exactHtmlBlocks(page.html, "table", "dd-table");
      const candidateTableTexts = candidateTables.map(normalizedBlockText);
      const missingBlocks = [
        ...exactHtmlBlocks(publishedPage.html, "figure", "dd-fig")
          .filter(block => !candidateFigures.includes(block)),
        ...exactHtmlBlocks(publishedPage.html, "table", "dd-table")
          .filter(block => {
            if (allowedRemovedTables.has(block)) return false;
            const text = normalizedBlockText(block);
            return !text || !candidateTableTexts.includes(text);
          }),
      ];
      if (missingBlocks.length) {
        page.html = String(page.html).replace(
          /\n<\/section>(?=[\s\S]*<div\b[^>]*class="[^"]*\bdd-src\b)/i,
          `\n${missingBlocks.join("\n")}\n</section>`,
        );
        preservation = editorialPreservationReport(publishedPage, page, removedSectionTitles);
      }
    }
    if (!preservation.passed) {
      throw new Error(`图表保留检查失败：缺图 ${preservation.missingFigureCount}，缺表 ${preservation.missingTableCount}，应删除但仍存在的章节 ${preservation.stillPresentRemovedSections.join("、") || "无"}`);
    }
    const now = new Date().toISOString();
    const pageHash = pageContentHash(page);
    const candidate = {
      schemaVersion: 1,
      pageId: id,
      role: "editorial-import",
      taskId: null,
      createdAt: now,
      summary: String(input.summary || "人工整理候选页").slice(0, 500),
      page,
      pageHash,
      preservation,
      source: generatedCandidate ? generatedCandidate.source : { type: "inline-page" },
    };
    const publication = {
      schemaVersion: 1,
      status: "published-editorial-draft",
      reviewStatus: "audit-pending",
      label: "待审草稿",
      candidateHash: pageHash,
      publishedAt: now,
      reason: reason.slice(0, 500),
    };
    const draftPage = { ...clone(page), publication };
    const previousRecord = {
      state: record.state,
      contentHash: record.contentHash,
      auditHash: record.auditHash,
      auditFile: record.auditFile,
      candidateFile: record.candidateFile,
      blockers: clone(record.blockers || []),
      editorialWarnings: clone(record.editorialWarnings || []),
      finalReview: clone(record.finalReview || null),
      published: Boolean(record.published),
      publication: clone(record.publication || null),
      editorialWorkflow: clone(record.editorialWorkflow || null),
      editorialReceipt: record.editorialReceipt || null,
    };
    const candidateRelative = candidateRelativePath(id);
    const candidateTarget = targetRecord(
      resolvedRoot,
      candidateRelative,
      `${JSON.stringify(candidate, null, 2)}\n`,
    );
    const publicationTargets = provisionalPublishedTargets(resolvedRoot, record, draftPage, null);
    const publisher = options.publishCandidate || ((targetRoot, targetRecordValue, targets) =>
      writePublicationTargets(targetRoot, targetRecordValue, targets, options));
    const publicationResult = publisher(
      resolvedRoot,
      record,
      [candidateTarget, ...publicationTargets],
    );
    const receipt = {
      schemaVersion: 1,
      status: "published-editorial-draft",
      pageId: id,
      pageHash,
      reason: reason.slice(0, 500),
      publishedAt: now,
      preservation,
      source: generatedCandidate ? generatedCandidate.source : { type: "inline-page" },
      previousRecord,
      targets: (publicationResult.targets || []).map(target => ({
        relativePath: target.relativePath,
        beforeExists: target.beforeExists,
        beforeContent: target.beforeContent,
        beforeHash: target.beforeHash,
        afterContent: target.afterContent,
        afterHash: target.afterHash,
      })),
      validators: (publicationResult.validators || []).map(result => ({
        script: result.script,
        passed: result.passed,
      })),
    };
    receipt.receiptHash = sha256(receipt);
    const receiptRelative = editorialPublicationRelativePath(id);
    const receiptPath = withinRoot(resolvedRoot, receiptRelative);
    try {
      writeJson(receiptPath, receipt);
      record.state = "audit-queued";
      record.attempt = 0;
      record.repairAttempts = 0;
      record.contentHash = pageHash;
      record.auditHash = null;
      record.auditFile = null;
      record.candidateFile = candidateRelative;
      record.blockers = [];
      record.editorialWarnings = [];
      record.finalReview = null;
      record.published = true;
      record.publication = publication;
      record.editorialWorkflow = {
        schemaVersion: 1,
        source: "human-curated-candidate",
        status: "machine-audit-pending",
        auditMode: "full",
        verificationSource: "machine",
        maxRepairAttempts: 1,
        initialBlockingFindings: [],
        requiresHumanReview: true,
        importedAt: now,
        removedSectionTitles: preservation.removedSectionTitles,
        preservation,
      };
      record.editorialReceipt = receiptRelative;
      record.provisionalReceipt = null;
      record.completionReceipt = null;
      record.updatedAt = now;
      saveState(resolvedRoot, state);
    } catch (error) {
      const targets = publicationResult.targets || [];
      [...targets].reverse().forEach(target => restoreTarget(resolvedRoot, target));
      if (fs.existsSync(receiptPath)) fs.unlinkSync(receiptPath);
      error.message += "\n已恢复人工候选导入产生的页面与私有文件。";
      throw error;
    }
    appendEvent(resolvedRoot, "editorial-candidate-imported", {
      id,
      pageHash,
      reason: reason.slice(0, 500),
      preservation,
      receiptHash: receipt.receiptHash,
    });
    return {
      status: "published-editorial-draft",
      pageId: id,
      workflowState: record.state,
      publicationState: record.publication.status,
      pageHash,
      preservation,
      receiptPath: receiptRelative,
      receiptHash: receipt.receiptHash,
    };
  } finally {
    release();
  }
}

function inspectPublicationCandidate(root = ROOT, id) {
  const resolvedRoot = path.resolve(root);
  const state = loadState(resolvedRoot);
  const record = state.pages[id];
  if (!record) throw new Error(`不存在页面状态：${id}`);
  const candidate = currentPage(resolvedRoot, record);
  const published = loadDeepDivePages(resolvedRoot)[id] || null;
  const formatGaps = candidate ? editorialContentPolicyGaps(candidate) : [];
  return {
    status: "ready",
    pageId: id,
    workflowState: record.state,
    publicationState: record.publication && record.publication.status
      ? record.publication.status
      : (record.published ? "published-current" : "unpublished"),
    active: Boolean(record.lease),
    candidateHash: candidate ? pageContentHash(candidate) : null,
    publishedHash: published ? pageContentHash(published) : null,
    blockerCount: (record.blockers || []).length,
    blockers: clone(record.blockers || []),
    formatGaps,
    canPublishProvisional: Boolean(
      candidate
      && !record.lease
      && !record.integration
      && ["manual-review", "l3-auto-passed"].includes(record.state)
      && !(record.publication && record.publication.status === "published-provisional")
    ),
    publication: clone(record.publication || null),
  };
}

function publishProvisionalPage(root = ROOT, id, expectedCandidateHash, reason, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能暂行发布`);
    if (!["manual-review", "l3-auto-passed"].includes(record.state)) {
      throw new Error(`页面 ${id} 当前状态为 ${record.state}，不能暂行发布`);
    }
    if (record.integration) {
      throw new Error("新概念节点不能以不合格暂行版本发布；必须先通过正式门禁");
    }
    if (record.publication && record.publication.status === "published-provisional") {
      throw new Error(`页面 ${id} 已是暂行版本；请先回滚或完成新的审计流程`);
    }
    const publishReason = String(reason || "").trim();
    if (publishReason.length < 3) throw new Error("暂行发布原因至少需要 3 个字符");
    const candidate = currentPage(resolvedRoot, record);
    if (!candidate) throw new Error(`页面 ${id} 没有可发布正文`);
    const formatGaps = editorialContentPolicyGaps(candidate);
    if (formatGaps.length) throw new Error(`候选页仍有格式缺陷：${formatGaps.join("；")}`);
    const candidateHash = pageContentHash(candidate);
    if (expectedCandidateHash !== candidateHash) {
      throw new Error(`候选哈希不匹配：期望 ${expectedCandidateHash || "（缺失）"}，当前 ${candidateHash}`);
    }
    let audit = null;
    if (record.auditFile) {
      const auditPath = withinRoot(resolvedRoot, record.auditFile);
      if (fs.existsSync(auditPath)) audit = readJson(auditPath);
    }
    const effectiveBlockers = (record.blockers || []).length
      ? clone(record.blockers)
      : [{
        type: "human-review-rejected",
        code: "human-review-rejected",
        message: publishReason.slice(0, 1000),
      }];
    const publishedAt = new Date().toISOString();
    const publication = provisionalPageMetadata(
      record,
      candidate,
      effectiveBlockers,
      publishReason,
      publishedAt,
    );
    const page = { ...clone(candidate), publication };
    const previousRecord = {
      state: record.state,
      contentHash: record.contentHash,
      blockers: clone(record.blockers || []),
      editorialWarnings: clone(record.editorialWarnings || []),
      finalReview: clone(record.finalReview || null),
      published: Boolean(record.published),
      publication: clone(record.publication || null),
      provisionalReceipt: record.provisionalReceipt || null,
    };
    const publisher = options.publishCandidate || ((targetRoot, targetRecordValue, targetPage, targetAudit) => {
      const targets = provisionalPublishedTargets(targetRoot, targetRecordValue, targetPage, targetAudit);
      return writePublicationTargets(targetRoot, targetRecordValue, targets, options);
    });
    const publicationResult = publisher(resolvedRoot, record, page, audit);
    const receipt = {
      schemaVersion: 1,
      status: "published-provisional",
      pageId: id,
      pageHash: candidateHash,
      previousState: previousRecord.state,
      workflowState: "manual-review",
      blockerCount: effectiveBlockers.length,
      reason: publishReason.slice(0, 500),
      publishedAt,
      targets: (publicationResult.targets || []).map(target => ({
        relativePath: target.relativePath,
        beforeExists: target.beforeExists,
        beforeContent: target.beforeContent,
        beforeHash: target.beforeHash,
        afterContent: target.afterContent,
        afterHash: target.afterHash,
      })),
      validators: (publicationResult.validators || []).map(result => ({
        script: result.script,
        passed: result.passed,
      })),
      previousRecord,
    };
    receipt.receiptHash = sha256(receipt);
    const receiptRelative = provisionalPublicationRelativePath(id);
    const receiptPath = withinRoot(resolvedRoot, receiptRelative);
    try {
      writeJson(receiptPath, receipt);
      record.state = "manual-review";
      record.contentHash = candidateHash;
      record.blockers = effectiveBlockers;
      record.published = true;
      record.publication = publication;
      record.provisionalReceipt = receiptRelative;
      record.finalReview = {
        status: "manual-review",
        completedAt: publishedAt,
        blockerCount: effectiveBlockers.length,
        provisionalPublished: true,
        reason: publishReason.slice(0, 500),
      };
      record.updatedAt = publishedAt;
      saveState(resolvedRoot, state);
    } catch (error) {
      const targets = publicationResult.targets || [];
      try {
        targets.forEach(target => {
          const file = withinRoot(resolvedRoot, target.relativePath);
          const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
          if (sha256(current) !== target.afterHash) {
            throw new Error(`正式目标在状态提交失败后变化：${target.relativePath}`);
          }
        });
        [...targets].reverse().forEach(target => restoreTarget(resolvedRoot, target));
        if (fs.existsSync(receiptPath)) fs.unlinkSync(receiptPath);
        error.message += "\n已恢复暂行发布目标与私有回执。";
      } catch (rollbackError) {
        error.message += `\n暂行发布自动回滚失败：${rollbackError.message}`;
      }
      throw error;
    }
    appendEvent(resolvedRoot, "manual-candidate-published-provisional", {
      id,
      previousState: previousRecord.state,
      pageHash: candidateHash,
      blockerCount: effectiveBlockers.length,
      reason: publishReason.slice(0, 500),
      receiptHash: receipt.receiptHash,
    });
    return {
      status: "published-provisional",
      pageId: id,
      workflowState: record.state,
      publicationState: record.publication.status,
      pageHash: candidateHash,
      blockerCount: effectiveBlockers.length,
      receiptPath: receiptRelative,
      receiptHash: receipt.receiptHash,
    };
  } finally {
    release();
  }
}

function rollbackProvisionalPage(root = ROOT, id, expectedCandidateHash, reason, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能回滚暂行版本`);
    if (!record.publication || record.publication.status !== "published-provisional") {
      throw new Error(`页面 ${id} 当前不是暂行发布版本`);
    }
    if (record.publication.candidateHash !== expectedCandidateHash) {
      throw new Error("暂行版本候选哈希不匹配，拒绝回滚");
    }
    const rollbackReason = String(reason || "").trim();
    if (rollbackReason.length < 3) throw new Error("回滚原因至少需要 3 个字符");
    const receiptRelative = record.provisionalReceipt || provisionalPublicationRelativePath(id);
    const receiptPath = withinRoot(resolvedRoot, receiptRelative);
    if (!fs.existsSync(receiptPath)) throw new Error(`暂行发布回执不存在：${receiptRelative}`);
    const receipt = readJson(receiptPath);
    if (receipt.pageId !== id || receipt.pageHash !== expectedCandidateHash) {
      throw new Error("暂行发布回执与当前页面不匹配");
    }
    const restore = options.restorePublication || ((targetRoot, targets) => {
      targets.forEach(target => {
        const file = withinRoot(targetRoot, target.relativePath);
        const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
        if (sha256(current) !== target.afterHash) {
          throw new Error(`正式目标在暂行发布后变化，拒绝覆盖：${target.relativePath}`);
        }
      });
      [...targets].reverse().forEach(target => restoreTarget(targetRoot, target));
    });
    restore(resolvedRoot, receipt.targets || []);
    const previous = receipt.previousRecord || {};
    record.state = previous.state || "manual-review";
    record.contentHash = previous.contentHash || record.contentHash;
    record.blockers = clone(previous.blockers || []);
    record.editorialWarnings = clone(previous.editorialWarnings || []);
    record.finalReview = clone(previous.finalReview || null);
    record.published = Boolean(previous.published);
    record.publication = clone(previous.publication || null);
    record.provisionalReceipt = previous.provisionalReceipt || null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "manual-candidate-provisional-rolled-back", {
      id,
      pageHash: expectedCandidateHash,
      restoredState: record.state,
      reason: rollbackReason.slice(0, 500),
      receiptHash: receipt.receiptHash || null,
    });
    return {
      status: "rolled-back",
      pageId: id,
      workflowState: record.state,
      publicationState: record.publication && record.publication.status
        ? record.publication.status
        : (record.published ? "published-current" : "unpublished"),
      restoredTargetCount: (receipt.targets || []).length,
    };
  } finally {
    release();
  }
}

function rollbackEditorialCandidate(root = ROOT, id, expectedCandidateHash, reason, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (record.lease) throw new Error(`页面 ${id} 正在执行，不能撤销待审候选`);
    const hasRecoverableEditorialCandidate = Boolean(
      record.candidateFile && record.editorialReceipt && record.contentHash,
    );
    if ((!record.publication || record.publication.status !== "published-editorial-draft")
      && !hasRecoverableEditorialCandidate) {
      throw new Error(`页面 ${id} 当前不是待审候选`);
    }
    const candidate = currentPage(resolvedRoot, record);
    const candidateHash = pageContentHash(candidate);
    if (candidateHash !== expectedCandidateHash || record.contentHash !== expectedCandidateHash) {
      throw new Error("待审候选哈希不匹配，拒绝撤销");
    }
    const rollbackReason = String(reason || "").trim();
    if (rollbackReason.length < 3) throw new Error("撤销原因至少需要 3 个字符");
    const receiptRelative = record.editorialReceipt || editorialPublicationRelativePath(id);
    const receiptPath = withinRoot(resolvedRoot, receiptRelative);
    if (!fs.existsSync(receiptPath)) throw new Error(`待审候选回执不存在：${receiptRelative}`);
    const receipt = readJson(receiptPath);
    if (receipt.pageId !== id) throw new Error("待审候选回执与当前页面不匹配");
    const candidateRelative = record.candidateFile;
    const publicationTargets = (receipt.targets || []).filter(target => target.relativePath !== candidateRelative);
    const restore = options.restorePublication || ((targetRoot, targets) => {
      targets.forEach(target => {
        const file = withinRoot(targetRoot, target.relativePath);
        const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
        if (sha256(current) !== target.afterHash) {
          throw new Error(`正式目标在待审发布后变化，拒绝覆盖：${target.relativePath}`);
        }
      });
      [...targets].reverse().forEach(target => restoreTarget(targetRoot, target));
    });
    restore(resolvedRoot, publicationTargets);
    const candidateTarget = (receipt.targets || []).find(target => target.relativePath === candidateRelative);
    if (candidateTarget) restoreTarget(resolvedRoot, candidateTarget);
    if (record.auditFile && record.auditFile.startsWith(".stage2/results/") && fs.existsSync(withinRoot(resolvedRoot, record.auditFile))) {
      fs.unlinkSync(withinRoot(resolvedRoot, record.auditFile));
    }
    const previous = receipt.previousRecord || {};
    record.state = previous.state || "manual-review";
    record.contentHash = previous.contentHash || null;
    record.auditHash = previous.auditHash || null;
    record.auditFile = previous.auditFile || null;
    record.candidateFile = previous.candidateFile || null;
    record.blockers = clone(previous.blockers || []);
    record.editorialWarnings = clone(previous.editorialWarnings || []);
    record.finalReview = clone(previous.finalReview || null);
    record.published = Boolean(previous.published);
    record.publication = clone(previous.publication || null);
    record.editorialWorkflow = clone(previous.editorialWorkflow || null);
    record.editorialReceipt = previous.editorialReceipt || null;
    record.provisionalReceipt = previous.provisionalReceipt || null;
    record.repairAttempts = 0;
    record.lease = null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "editorial-candidate-rolled-back", {
      id,
      pageHash: expectedCandidateHash,
      restoredState: record.state,
      reason: rollbackReason.slice(0, 500),
      receiptHash: receipt.receiptHash || null,
    });
    return {
      status: "rolled-back",
      pageId: id,
      workflowState: record.state,
      publicationState: record.publication && record.publication.status
        ? record.publication.status
        : (record.published ? "published-current" : "unpublished"),
      restoredTargetCount: publicationTargets.length + (candidateTarget ? 1 : 0),
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

function submitResult(root = ROOT, input = {}, options = {}) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    expireLease(resolvedRoot, state);
  const record = Object.values(state.pages).find(page =>
    page.lease && page.lease.taskId === input.taskId
  );
  if (!record) throw new Error("任务不存在、租约已过期或已经提交");
  if (record.lease.token !== input.leaseToken) throw new Error("租约令牌无效");
  const role = record.lease.role;
  const result = input.result || {};
  if (role === "content-generation") {
    const material = contentGenerationReviewMaterial(resolvedRoot, record);
    const savedResponses = Array.isArray(record.contentGeneration && record.contentGeneration.savedResponses)
      ? record.contentGeneration.savedResponses.map(({ sectionNumber, title, response }) => ({ sectionNumber, title, response }))
      : [];
    const completedResult = result.useSavedResponses === true
      ? { pageId: record.id, responses: savedResponses, summary: result.summary || "" }
      : result;
    const gaps = contentGenerationResultGaps(record, material, completedResult);
    if (JSON.stringify(completedResult.responses || []) !== JSON.stringify(savedResponses)) {
      gaps.push("result.responses 必须与逐章保存的完整回复完全一致");
    }
    if (gaps.length) throw new Error(gaps.join("\n"));
    const outputRelative = record.contentGeneration && record.contentGeneration.outputFile
      ? record.contentGeneration.outputFile
      : `docs/deepdive-reviews/${record.id}-agent-responses.md`;
    const markdown = contentGenerationMarkdown(material, completedResult);
    atomicWrite(withinRoot(resolvedRoot, outputRelative), markdown);
    const now = new Date().toISOString();
    const previousState = record.contentGeneration && record.contentGeneration.previousState
      ? record.contentGeneration.previousState
      : "audit-queued";
    record.contentGeneration = {
      ...(record.contentGeneration || {}),
      status: "complete",
      completedAt: now,
      responseCount: completedResult.responses.length,
      outputFile: outputRelative,
      outputHash: sha256(markdown),
      summary: String(completedResult.summary || "").slice(0, 500),
    };
    record.state = previousState;
    record.lease = null;
    record.updatedAt = now;
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "content-generation-completed", {
      id: record.id,
      taskId: input.taskId,
      responseCount: completedResult.responses.length,
      outputFile: outputRelative,
      nextState: record.state,
    });
    return {
      status: "content-generated",
      pageId: record.id,
      nextState: record.state,
      responseCount: completedResult.responses.length,
      outputFile: outputRelative,
      outputHash: record.contentGeneration.outputHash,
      uiCleanup: archiveCurrentTaskDirective("内容生成回复已保存，当前工作任务已终止"),
    };
  }
  if (role !== "audit") {
    const previousPage = currentPage(resolvedRoot, record);
    const pageErrors = validatePage(record.id, result.page);
    if (record.editorialWorkflow) {
      pageErrors.push(...editorialContentPolicyGaps(result.page));
      if (role === "repair" && pageSourceSignature(result.page) !== pageSourceSignature(previousPage)) {
        pageErrors.push("返修不得添加、删除或替换页面来源");
      }
      if (role === "repair") {
        const preservation = editorialPreservationReport(previousPage, result.page, []);
        if (!preservation.passed) pageErrors.push("返修不得删除或改写已有图表");
      }
    }
    if (pageErrors.length) throw new Error(pageErrors.join("\n"));
    const narrativeBlockers = narrativeTemplateBlockers(result.page, null);
    if (narrativeBlockers.length) {
      record.blockers = clone(narrativeBlockers);
      record.state = QUEUE_BY_ROLE[role];
      record.lease = null;
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "candidate-rejected", {
        id: record.id,
        taskId: input.taskId,
        role,
        reason: "harmful-template-expression",
        blockerCount: narrativeBlockers.length,
      });
      return {
        status: "rejected",
        pageId: record.id,
        nextState: record.state,
        blockerCount: narrativeBlockers.length,
        reason: "harmful-template-expression",
        uiCleanup: archiveCurrentTaskDirective("本次候选已拒绝并重新排队，当前工作任务已终止"),
      };
    }
    const candidate = {
      schemaVersion: 1,
      pageId: record.id,
      role,
      taskId: record.lease.taskId,
      createdAt: new Date().toISOString(),
      summary: String(result.summary || "").slice(0, 500),
      page: clone(result.page),
      pageHash: pageContentHash(result.page),
    };
    const relative = candidateRelativePath(record.id);
    writeJson(withinRoot(resolvedRoot, relative), candidate);
    record.candidateFile = relative;
    record.contentHash = candidate.pageHash;
    record.auditHash = null;
    record.auditFile = null;
    record.blockers = [];
    if (role === "repair") {
      record.repairAttempts += 1;
      const history = ensureReviewHistory(record);
      const openRound = [...history].reverse().find(round => !round.improvement);
      if (openRound) {
        openRound.improvement = {
          summary: candidate.summary,
          pageHash: candidate.pageHash,
          submittedAt: candidate.createdAt,
        };
      }
    }
    record.state = "audit-queued";
    if (record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview) {
      record.editorialWorkflow.status = role === "repair" ? "verification-pending" : "machine-audit-pending";
      if (role === "repair") record.editorialWorkflow.auditMode = "verification";
      record.editorialWorkflow.candidateUpdatedAt = candidate.createdAt;
      refreshEditorialDraftPublication(
        resolvedRoot,
        record,
        result.page,
        role === "repair" ? "verification-pending" : "audit-pending",
        (record.blockers || []).length,
        options,
      );
    }
    record.lease = null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "candidate-submitted", {
      id: record.id,
      taskId: input.taskId,
      role,
      pageHash: candidate.pageHash,
    });
    return {
      status: "accepted",
      pageId: record.id,
      nextState: record.state,
      pageHash: candidate.pageHash,
      uiCleanup: archiveCurrentTaskDirective("本次候选已接收，当前工作任务已终止"),
    };
  }

  const page = currentPage(resolvedRoot, record);
  const auditInput = result.audit || (Number.isInteger(result.schemaVersion) ? result : null);
  const audit = clone(auditInput);
  const activeAuditContract = auditContract(record);
  const gaps = auditGaps(record.id, page, audit, activeAuditContract);
  if (gaps.length) {
    record.auditHash = null;
    record.auditFile = null;
    record.blockers = [];
    record.lease = null;
    record.state = "audit-queued";
    record.finalReview = null;
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "audit-rejected", {
      id: record.id,
      taskId: input.taskId,
      nextState: record.state,
      reason: "invalid-audit-contract",
      issueCount: gaps.length,
      issues: clone(gaps),
    });
    return {
      status: "rejected",
      reason: "invalid-audit-contract",
      pageId: record.id,
      nextState: record.state,
      issueCount: gaps.length,
      issues: clone(gaps),
      uiCleanup: archiveCurrentTaskDirective("本次审计不符合提交合同，页面已重新排队等待新的独立审计"),
    };
  }
  const privateRelative = privateAuditRelativePath(record.id);
  writeJson(withinRoot(resolvedRoot, privateRelative), audit || {});
  const editorial = Boolean(record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview);
  const evaluator = options.evaluateCandidate || (editorial ? evaluateEditorialCandidate : evaluateCandidate);
  const explicitBlockers = auditBlockers(audit);
  const automaticNarrativeBlockers = activeAuditContract.mode === "verification"
    ? []
    : narrativeTemplateBlockers(page, audit);
  const policyBlockers = [
    ...automaticNarrativeBlockers,
    ...explicitBlockers,
  ];
  const gate = policyBlockers.length
    ? { passed: false, results: [], blockers: policyBlockers }
    : evaluator(resolvedRoot, record, page, audit);
  if (!gate.passed) {
    record.auditHash = null;
    record.auditFile = privateRelative;
    record.blockers = clone(gate.blockers || []);
    record.lease = null;
    const isVerification = editorial && activeAuditContract.mode === "verification";
    const maxRepairAttempts = editorial ? 1 : state.policy.maxRepairAttempts;
    if (isVerification || record.repairAttempts >= maxRepairAttempts) {
      record.state = "manual-review";
    } else {
      record.state = "repair-queued";
    }
    ensureReviewHistory(record).push({
      round: ensureReviewHistory(record).length + 1,
      auditedAt: new Date().toISOString(),
      pageHash: pageContentHash(page),
      auditDecision: "fail",
      reportedAuditDecision: audit && audit.decision || "invalid",
      defects: clone(gate.blockers || []).map(compactBlocker),
      improvement: null,
      nextState: record.state,
    });
    record.finalReview = record.state === "manual-review"
      ? {
        status: "manual-review",
        completedAt: new Date().toISOString(),
        blockerCount: record.blockers.length,
      }
      : null;
    if (record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview) {
      if (!isVerification && !Array.isArray(record.editorialWorkflow.initialBlockingFindings)) {
        record.editorialWorkflow.initialBlockingFindings = [];
      }
      if (!isVerification && !record.editorialWorkflow.initialBlockingFindings.length) {
        record.editorialWorkflow.initialBlockingFindings = clone(record.blockers);
        record.editorialWorkflow.verificationSource = "machine";
      }
      record.editorialWorkflow.status = record.state === "manual-review"
        ? "human-review-blocked"
        : "repair-pending";
      record.editorialWorkflow.auditMode = record.state === "manual-review" ? "complete" : "verification";
      record.editorialWorkflow.lastAuditedAt = new Date().toISOString();
      record.editorialWarnings = clone(audit.warnings || []);
      refreshEditorialDraftPublication(
        resolvedRoot,
        record,
        page,
        record.state === "manual-review" ? "human-review-blocked" : "repair-pending",
        record.blockers.length,
        options,
      );
    }
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "audit-failed", {
      id: record.id,
      taskId: input.taskId,
      nextState: record.state,
      blockerCount: record.blockers.length,
    });
    return {
      status: record.state === "manual-review" ? "awaiting-human-review" : "needs-repair",
      pageId: record.id,
      nextState: record.state,
      blockerCount: record.blockers.length,
      uiCleanup: archiveCurrentTaskDirective("本次审计已接收，后续由新的返修任务处理"),
    };
  }

  if (record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview) {
    record.auditHash = sha256(audit);
    record.auditFile = privateRelative;
    record.contentHash = pageContentHash(page);
    record.blockers = [];
    record.editorialWarnings = clone(gate.editorialWarnings || []);
    record.state = "manual-review";
    record.lease = null;
    record.editorialWorkflow.status = "human-review-pending";
    record.editorialWorkflow.auditMode = "complete";
    record.editorialWorkflow.machineAuditPassedAt = new Date().toISOString();
    record.finalReview = {
      status: "manual-review",
      completedAt: new Date().toISOString(),
      blockerCount: 0,
      machineAuditPassed: true,
    };
    record.editorialWarnings = clone(audit.warnings || []);
    refreshEditorialDraftPublication(
      resolvedRoot,
      record,
      page,
      "human-review-pending",
      0,
      options,
    );
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "editorial-machine-audit-passed", {
      id: record.id,
      taskId: input.taskId,
      pageHash: record.contentHash,
      auditHash: record.auditHash,
      nextState: record.state,
    });
    return {
      status: "awaiting-human-review",
      pageId: record.id,
      nextState: record.state,
      pageHash: record.contentHash,
      auditHash: record.auditHash,
      publicationState: record.publication && record.publication.status,
      uiCleanup: archiveCurrentTaskDirective("机器审查已通过，页面等待人工复核"),
    };
  }

  const publisher = options.publishCandidate || publishCandidate;
  const approvedPage = clone(page);
  delete approvedPage.publication;
  const receipt = publisher(resolvedRoot, record, approvedPage, audit);
  const completionFile = path.join(resultDirectory(resolvedRoot, record.id), "completion.json");
  writeJson(completionFile, receipt);
  record.auditHash = sha256(audit);
  record.auditFile = `docs/deepdive-audits/${record.id}.json`;
  record.contentHash = pageContentHash(page);
  record.blockers = [];
  record.editorialWarnings = clone(gate.editorialWarnings || []);
  record.state = "l3-auto-passed";
  record.lease = null;
  record.published = true;
  record.publication = {
    schemaVersion: 1,
    status: "published-approved",
    reviewStatus: "l3-auto-passed",
    pageHash: pageContentHash(approvedPage),
    publishedAt: new Date().toISOString(),
  };
  record.provisionalReceipt = null;
  record.finalReview = {
    status: "l3-auto-passed",
    completedAt: new Date().toISOString(),
    blockerCount: 0,
  };
  record.completionReceipt = path.relative(resolvedRoot, completionFile).replace(/\\/g, "/");
  record.updatedAt = new Date().toISOString();
  saveState(resolvedRoot, state);
  appendEvent(resolvedRoot, "page-l3-passed", {
    id: record.id,
    taskId: input.taskId,
    pageHash: record.contentHash,
    auditHash: record.auditHash,
  });
  return {
    status: "l3-auto-passed",
    pageId: record.id,
    pageHash: record.contentHash,
    auditHash: record.auditHash,
    uiCleanup: archiveCurrentTaskDirective("本次审计与发布已完成"),
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
