"use strict";

const fs = require("fs");
const path = require("path");

const AUDIT_READABLE_EXTENSIONS = new Set([
  ".cjs", ".css", ".csv", ".html", ".js", ".json", ".md", ".mjs",
  ".svg", ".toml", ".ts", ".txt", ".xml", ".yaml", ".yml",
]);
const AUDIT_READ_MAX_BYTES = 512 * 1024;
const AUDIT_SEARCH_MAX_FILES = 6000;

function createAuditProjectAccess({ defaultRoot, loadState, withinRoot }) {
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

  function readAuditProjectFile(root = defaultRoot, input = {}) {
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

  function searchAuditProject(root = defaultRoot, input = {}) {
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

  return {
    readAuditProjectFile,
    searchAuditProject,
  };
}

module.exports = { createAuditProjectAccess };
