"use strict";

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const { loadDeepDivePages } = require("../deepdive-loader");
const { pageContentHash } = require("../deepdive-audit-contracts");
const { transformGraph } = require("../video-ingest/node-application");
const { graphFingerprint } = require("../video-ingest/shadow-review");

const ROOT = path.join(__dirname, "..", "..");
const STATE_SCHEMA_VERSION = 1;
const SIX_QUESTIONS = [
  "definition",
  "problem",
  "inputOutput",
  "mechanism",
  "interpretation",
  "boundary",
];
const QUEUE_BY_ROLE = {
  audit: "audit-queued",
  write: "write-queued",
  update: "update-queued",
  repair: "repair-queued",
};
const ACTIVE_BY_ROLE = {
  audit: "auditing",
  write: "writing",
  update: "updating",
  repair: "repairing",
};
const ROLE_PRIORITY = ["repair", "update", "write", "audit"];
const AUDIT_READABLE_EXTENSIONS = new Set([
  ".cjs", ".css", ".csv", ".html", ".js", ".json", ".md", ".mjs",
  ".svg", ".toml", ".ts", ".txt", ".xml", ".yaml", ".yml",
]);
const AUDIT_READ_MAX_BYTES = 512 * 1024;
const AUDIT_SEARCH_MAX_FILES = 6000;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  return [
    "一次只处理一个页面。",
    "将解释自然融入原有教学过程，不在章节末尾追加六问答案。",
    "保留正确且有效的原内容，不为了统一模板而机械改写。",
    "不得声称页面已经通过 L3；质量状态由控制器决定。",
  ].join("\n");
}

function auditContract() {
  return {
    schemaVersion: 1,
    requiredQuestions: clone(SIX_QUESTIONS),
    instruction: "逐节回答六问并引用当前正文证据；正文没有答案时保留空 answer/evidence，不替作者补写。",
    outputShape: {
      schemaVersion: 1,
      pageId: "<page-id>",
      pageHash: "sha256:...",
      reviewedAt: "YYYY-MM-DD",
      sections: [
        {
          section: 1,
          definition: { answer: "", evidence: "" },
          problem: { answer: "", evidence: "" },
          inputOutput: { answer: "", evidence: "" },
          mechanism: { answer: "", evidence: "" },
          interpretation: { answer: "", evidence: "" },
          boundary: { answer: "", evidence: "" },
        },
      ],
    },
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
    instruction: "只使用本任务包。完成后调用提交工具一次，然后结束本次任务。",
  };
  if (role === "audit") {
    return {
      ...common,
      page: clone(page),
      auditContract: auditContract(),
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
          "tools/audit-deepdive-benchmark.js",
          "tools/audit-deepdive-gold.js",
          "tools/deepdive-audit-contracts.js",
          "tools/validate-deepdives.js",
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
      outputShape: { page: clone(page), summary: "" },
      forbidden: ["读取其他页面", "读取审计答案", "只在末尾追加材料", "修改正式文件"],
    };
  }
  return {
    ...common,
    page: clone(page),
    defects: clone(record.blockers || []),
    writingPolicy: writingPolicy(root),
    outputShape: { page: clone(page), summary: "" },
    forbidden: ["读取独立审计答案", "读取门禁实现", "在章节末尾追加六问收束段", "修改正式文件"],
  };
}

function claimTask(root = ROOT, workerId = "codex-scheduled", requestedPageId = null) {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    expireLease(resolvedRoot, state);
    if (state.paused) return { status: "paused", task: null };
    const active = activeRecord(state);
    if (active) {
      return {
        status: "busy",
        task: null,
        active: { id: active.id, role: active.lease.role, expiresAt: active.lease.expiresAt },
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
    if (!selected) return { status: "idle", task: null };
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

function auditGaps(id, page, audit) {
  const gaps = [];
  if (!audit || typeof audit !== "object") return ["独立审计结果缺失"];
  if (audit.schemaVersion !== 1) gaps.push("独立审计 schemaVersion 必须为 1");
  if (audit.pageId !== id) gaps.push("独立审计 pageId 不匹配");
  if (audit.pageHash !== pageContentHash(page)) gaps.push("独立审计 pageHash 与当前正文不匹配");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt || "")) gaps.push("独立审计日期无效");
  if (!Array.isArray(audit.sections) || !audit.sections.length) {
    gaps.push("独立审计缺少逐节结果");
    return gaps;
  }
  audit.sections.forEach((section, index) => {
    const sectionNumber = Number.isInteger(section && section.section) ? section.section : index + 1;
    SIX_QUESTIONS.forEach(question => {
      const answer = section && section[question];
      if (!answer || !String(answer.answer || "").trim() || !String(answer.evidence || "").trim()) {
        gaps.push(`第 ${sectionNumber} 节：读者无法从正文确定 ${question}`);
      }
    });
  });
  return gaps;
}

function candidateRelativePath(id) {
  return `.stage2/results/${id}/candidate.json`;
}

function privateAuditRelativePath(id) {
  return `.stage2/results/${id}/audit.private.json`;
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
  const result = spawnSync(process.execPath, [path.join(root, "tools", script), ...args], {
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
      runGate(root, fixture, "validate-deepdives.js"),
      runGate(root, fixture, "audit-deepdive-gold.js", ["--require-candidate", record.id]),
      runGate(root, fixture, "audit-deepdive-benchmark.js", ["--require-benchmark", record.id]),
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
      runGate(root, root, "validate.js"),
      runGate(root, root, "validate-deepdives.js"),
      runGate(root, root, "audit-deepdive-benchmark.js", ["--require-benchmark", record.id]),
      runGate(root, root, "validate-video-applications.js"),
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
  if (role !== "audit") {
    const pageErrors = validatePage(record.id, result.page);
    if (pageErrors.length) throw new Error(pageErrors.join("\n"));
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
    if (role === "repair") record.repairAttempts += 1;
    record.state = "audit-queued";
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
    };
  }

  const page = currentPage(resolvedRoot, record);
  const auditInput = result.audit || (Array.isArray(result.sections) ? result : null);
  const audit = clone(auditInput);
  const gaps = auditGaps(record.id, page, audit);
  const privateRelative = privateAuditRelativePath(record.id);
  writeJson(withinRoot(resolvedRoot, privateRelative), audit || {});
  const evaluator = options.evaluateCandidate || evaluateCandidate;
  const gate = gaps.length
    ? { passed: false, results: [], blockers: gaps.map(message => ({ type: "coverage", message })) }
    : evaluator(resolvedRoot, record, page, audit);
  if (!gate.passed) {
    record.auditHash = null;
    record.auditFile = privateRelative;
    record.blockers = clone(gate.blockers || []);
    record.lease = null;
    if (record.repairAttempts >= state.policy.maxRepairAttempts) {
      record.state = "manual-review";
    } else {
      record.state = "repair-queued";
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
      status: "needs-repair",
      pageId: record.id,
      nextState: record.state,
      blockerCount: record.blockers.length,
    };
  }

  const publisher = options.publishCandidate || publishCandidate;
  const receipt = publisher(resolvedRoot, record, page, audit);
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
    record.updatedAt = new Date().toISOString();
    saveState(resolvedRoot, state);
    appendEvent(resolvedRoot, "page-retried", { id });
    return clone(record);
  } finally {
    release();
  }
}

function releaseLease(root = ROOT, id, reason = "manual-recovery") {
  const resolvedRoot = path.resolve(root);
  const release = acquireLock(resolvedRoot);
  try {
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (!record.lease) throw new Error(`页面 ${id} 当前没有活动租约`);
    const previousLease = clone(record.lease);
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
  SIX_QUESTIONS,
  applyCoreMembership,
  auditGaps,
  claimTask,
  enqueueNewNode,
  evaluateCandidate,
  gateDefects,
  initialize,
  loadState,
  mergePendingSupplements,
  pageOverrideSource,
  pageRegistrationSource,
  publishCandidate,
  readAuditProjectFile,
  refreshBlockers,
  releaseLease,
  retry,
  searchAuditProject,
  setPaused,
  sha256,
  status,
  submitResult,
  validatePage,
};
