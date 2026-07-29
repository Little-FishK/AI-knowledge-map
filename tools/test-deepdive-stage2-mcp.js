"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-mcp-test-"));
fs.mkdirSync(path.join(fixture, ".stage2"), { recursive: true });
fs.writeFileSync(
  path.join(fixture, ".stage2", "state.json"),
  `${JSON.stringify({
    schemaVersion: 1,
    mode: "serial",
    paused: true,
    policy: { maxRepairAttempts: 2, leaseMinutes: 45 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: {},
  }, null, 2)}\n`,
  "utf8",
);

const server = spawn(process.execPath, [
  path.join(__dirname, "deepdive-stage2", "mcp-server.js"),
], {
  cwd: fixture,
  env: { ...process.env, DEEPDIVE_STAGE2_ROOT: fixture },
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
const messages = [];
let finished = false;
let requestedExitCode = 0;

function cleanup(code = 0) {
  if (finished) return;
  finished = true;
  requestedExitCode = code;
  server.kill();
  process.exitCode = code;
}

const timeout = setTimeout(() => {
  console.error("MCP 测试超时");
  cleanup(1);
}, 5000);

server.stdout.setEncoding("utf8");
server.stdout.on("data", chunk => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (line) messages.push(JSON.parse(line));
  }
  if (messages.length < 2) return;
  clearTimeout(timeout);
  try {
    assert.strictEqual(messages[0].result.serverInfo.name, "ai-knowledge-map-stage2");
    assert.deepStrictEqual(
      messages[1].result.tools.map(tool => tool.name),
      [
        "stage2_status",
        "stage2_claim_task",
        "stage2_search_project",
        "stage2_read_project_file",
        "stage2_submit_result",
      ],
    );
    const claimTool = messages[1].result.tools.find(tool => tool.name === "stage2_claim_task");
    assert.strictEqual(claimTool.inputSchema.properties.pageId.pattern, "^[a-z0-9][a-z0-9-]*$");
    console.log("✓ 第二阶段 MCP：初始化、工具清单和 JSONL stdio 协议测试通过");
    cleanup(0);
  } catch (error) {
    console.error(error.stack || error.message);
    cleanup(1);
  }
});

server.stderr.on("data", chunk => process.stderr.write(chunk));
server.on("error", error => {
  clearTimeout(timeout);
  console.error(error.message);
  cleanup(1);
});
server.on("close", () => {
  try {
    fs.rmSync(fixture, { recursive: true, force: true });
  } catch (error) {
    console.error(error.message);
    requestedExitCode = 1;
  }
  process.exitCode = requestedExitCode;
});

server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "fixture", version: "1.0.0" },
  },
})}\n`);
server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`);
