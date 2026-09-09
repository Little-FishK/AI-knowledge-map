"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const vm = require("vm");

const root = path.join(__dirname, "..");

function usage() {
  throw new Error([
    "用法：",
    "  node tools/run-stage2-editorial-controller.js import --page <id> --candidate <js> --reason <文本>",
    "  node tools/run-stage2-editorial-controller.js errata --page <id> --packet <json> --hash <sha256:...> --reason <文本>",
    "  node tools/run-stage2-editorial-controller.js finalize --page <id> --reason <文本>",
    "  node tools/run-stage2-editorial-controller.js return --page <id> --issues <json> --reason <文本>",
    "  node tools/run-stage2-editorial-controller.js rollback --page <id> --hash <sha256:...> --reason <文本>",
  ].join("\n"));
}

function argsObject(values) {
  const result = { command: values[2] || "" };
  for (let index = 3; index < values.length; index += 2) {
    const key = values[index];
    if (!key || !key.startsWith("--") || values[index + 1] == null) usage();
    result[key.slice(2)] = values[index + 1];
  }
  return result;
}

function loadCandidate(file, pageId) {
  const absolute = path.resolve(root, file);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("候选文件必须位于当前项目内");
  }
  if (!fs.existsSync(absolute)) throw new Error(`候选文件不存在：${relative}`);
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(absolute, "utf8"), context, { filename: absolute });
  const page = context.window.DEEPDIVE && context.window.DEEPDIVE[pageId];
  if (!page) throw new Error(`候选文件没有注册页面 ${pageId}`);
  return JSON.parse(JSON.stringify(page));
}

function loadIssues(file) {
  const absolute = path.resolve(root, file);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("问题文件必须位于当前项目内");
  const issues = JSON.parse(fs.readFileSync(absolute, "utf8"));
  if (!Array.isArray(issues) || !issues.length) throw new Error("问题文件必须是非空 JSON 数组");
  return issues;
}

function callMcp(pageId, toolName, toolArgs) {
  const request = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "stage2-editorial-controller", version: "1.0.0" } } },
    { jsonrpc: "2.0", method: "notifications/initialized", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: toolName, arguments: toolArgs } },
  ].map(item => JSON.stringify(item)).join("\n") + "\n";
  const child = spawnSync(process.execPath, [path.join(root, "tools", "deepdive-stage2", "mcp-server.js")], {
    cwd: root,
    env: {
      ...process.env,
      STAGE2_MCP_PROFILE: "controller",
      STAGE2_MCP_PAGE_ID: pageId,
      STAGE2_MCP_WORKER_ID: `editorial-controller-${pageId}`,
      STAGE2_MCP_ALLOW_PROVISIONAL_PUBLISH: "0",
      STAGE2_MCP_MANUAL_REVIEW_ACTION: "hold",
    },
    input: request,
    encoding: "utf8",
    timeout: 120000,
  });
  if (child.status !== 0) throw new Error(child.stderr || `MCP 控制器退出：${child.status}`);
  const messages = child.stdout.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  const response = messages.find(message => message.id === 2);
  if (!response || response.error) throw new Error(response && response.error ? response.error.message : "MCP 控制器没有返回结果");
  const block = response.result && response.result.content && response.result.content[0];
  if (!block || block.type !== "text") throw new Error("MCP 控制器返回格式无效");
  const result = JSON.parse(block.text);
  if (response.result.isError || result.error) throw new Error(result.error || block.text);
  return result;
}

const input = argsObject(process.argv);
const pageId = String(input.page || "").trim();
const reason = String(input.reason || "").trim();
if (!/^[a-z0-9][a-z0-9-]*$/.test(pageId) || reason.length < 3) usage();

let result;
if (input.command === "errata") {
  if (!input.packet || !/^sha256:[a-f0-9]{64}$/.test(input.hash || "")) usage();
  const absolute = path.resolve(root, input.packet), relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("勘误文件必须位于当前项目内");
  const packet = JSON.parse(fs.readFileSync(absolute, "utf8"));
  const { errataDigest } = require("./deepdive-stage2/lib/editorial-errata");
  if (errataDigest(packet) !== input.hash) throw new Error("勘误文件与授权摘要不一致");
  process.env.STAGE2_EDITORIAL_ERRATA_HASH = input.hash;
  result = callMcp(pageId, "stage2_import_editorial_candidate", { pageId, errata: packet, reason,
    summary: input.summary || "人工采用的精确原文勘误，等待独立审核与最终确认" });
} else if (input.command === "import") {
  if (!input.candidate) usage();
  result = callMcp(pageId, "stage2_import_editorial_candidate", {
    pageId,
    page: loadCandidate(input.candidate, pageId),
    reason,
    summary: input.summary || "逐章生成、去重并恢复原页视觉组件后的完整候选页",
    removedSectionTitles: ["常见误解", "检查你是否真的理解"],
  });
} else if (input.command === "finalize") {
  result = callMcp(pageId, "stage2_finalize_manual_review", { pageId, reason });
} else if (input.command === "return") {
  if (!input.issues) usage();
  result = callMcp(pageId, "stage2_return_editorial_for_revision", {
    pageId,
    reason,
    issues: loadIssues(input.issues),
  });
} else if (input.command === "rollback") {
  if (!/^sha256:[a-f0-9]{64}$/.test(String(input.hash || ""))) usage();
  result = callMcp(pageId, "stage2_rollback_editorial_candidate", {
    pageId,
    expectedCandidateHash: input.hash,
    reason,
  });
} else {
  usage();
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
