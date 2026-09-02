"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");

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
    pages: {
      alpha: {
        id: "alpha",
        state: "manual-review",
        repairAttempts: 2,
        blockers: [{ type: "fixture", message: "待人工复核" }],
        lease: null,
        updatedAt: new Date().toISOString(),
      },
      beta: {
        id: "beta",
        state: "repairing",
        repairAttempts: 1,
        blockers: [],
        lease: {
          role: "repair",
          taskId: "beta:repair:2:fixture",
          token: "fixture-token",
          workerId: "fixture-worker",
          startedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60000).toISOString(),
        },
        updatedAt: new Date().toISOString(),
      },
      gamma: {
        id: "gamma",
        state: "l3-auto-passed",
        repairAttempts: 0,
        auditHash: "fixture-audit-hash",
        auditFile: "docs/deepdive-audits/gamma.json",
        blockers: [],
        editorialWarnings: [],
        reviewHistory: [],
        finalReview: { status: "l3-auto-passed" },
        completionReceipt: ".stage2/results/gamma/completion.json",
        lease: null,
        published: true,
        updatedAt: new Date().toISOString(),
      },
    },
  }, null, 2)}\n`,
  "utf8",
);

const server = spawn(process.execPath, [
  path.join(PROJECT_ROOT, "tools", "deepdive-stage2", "mcp-server.js"),
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
  if (messages.length < 5) return;
  clearTimeout(timeout);
  try {
    assert.strictEqual(messages[0].result.serverInfo.name, "ai-knowledge-map-stage2");
    assert.deepStrictEqual(
      messages[1].result.tools.map(tool => tool.name),
      [
        "stage2_status",
        "stage2_local_data_status",
        "stage2_migrate_local_data",
        "stage2_next_recommended_page",
        "stage2_resolve_recommended_page",
        "stage2_claim_task",
        "stage2_enqueue_content_generation",
        "stage2_import_editorial_candidate",
        "stage2_reset_manual_review",
        "stage2_reset_passed_page",
        "stage2_create_manual_review_preview",
        "stage2_finalize_manual_review",
        "stage2_return_editorial_for_revision",
        "stage2_rollback_editorial_candidate",
        "stage2_inspect_publication_candidate",
        "stage2_publish_provisional_page",
        "stage2_rollback_provisional_page",
        "stage2_release_lease",
        "stage2_search_project",
        "stage2_read_project_file",
        "stage2_read_task_packet",
        "stage2_read_content_section",
        "stage2_save_content_response",
        "stage2_validate_audit_result",
        "stage2_validate_page_result",
        "stage2_submit_result",
      ],
    );
    const claimTool = messages[1].result.tools.find(tool => tool.name === "stage2_claim_task");
    assert.strictEqual(claimTool.inputSchema.properties.pageId.pattern, "^[a-z0-9][a-z0-9-]*$");
    assert.match(claimTool.description, /uiCleanup/);
    const submitTool = messages[1].result.tools.find(tool => tool.name === "stage2_submit_result");
    assert.match(submitTool.description, /归档当前 Codex 任务/);
    const resetTool = messages[1].result.tools.find(tool => tool.name === "stage2_reset_manual_review");
    assert.deepStrictEqual(resetTool.inputSchema.required, ["pageId", "reason"]);
    const importTool = messages[1].result.tools.find(tool => tool.name === "stage2_import_editorial_candidate");
    assert.deepStrictEqual(importTool.inputSchema.required, ["pageId", "reason"]);
    assert.strictEqual(importTool.inputSchema.properties.useContentGenerationOutput.type, "boolean");
    assert.strictEqual(importTool.inputSchema.anyOf[1].properties.useContentGenerationOutput.const, true);
    assert.match(importTool.description, /图表保留/);
    const passedResetTool = messages[1].result.tools.find(tool => tool.name === "stage2_reset_passed_page");
    assert.deepStrictEqual(passedResetTool.inputSchema.required, ["pageId", "reason"]);
    const previewTool = messages[1].result.tools.find(tool => tool.name === "stage2_create_manual_review_preview");
    assert.deepStrictEqual(previewTool.inputSchema.required, ["pageId"]);
    assert.strictEqual(previewTool.inputSchema.properties.rounds.maxItems, 2);
    const finalizeTool = messages[1].result.tools.find(tool => tool.name === "stage2_finalize_manual_review");
    assert.deepStrictEqual(finalizeTool.inputSchema.required, ["pageId", "reason"]);
    const inspectPublicationTool = messages[1].result.tools.find(tool => tool.name === "stage2_inspect_publication_candidate");
    assert.deepStrictEqual(inspectPublicationTool.inputSchema.required, ["pageId"]);
    const provisionalTool = messages[1].result.tools.find(tool => tool.name === "stage2_publish_provisional_page");
    assert.deepStrictEqual(provisionalTool.inputSchema.required, ["pageId", "expectedCandidateHash", "reason"]);
    assert.match(provisionalTool.description, /不伪造 L3 通过/);
    const rollbackTool = messages[1].result.tools.find(tool => tool.name === "stage2_rollback_provisional_page");
    assert.deepStrictEqual(rollbackTool.inputSchema.required, ["pageId", "expectedCandidateHash", "reason"]);
    const resetResult = JSON.parse(messages[2].result.content[0].text);
    const passedResetResult = JSON.parse(messages[3].result.content[0].text);
    const releaseResult = JSON.parse(messages[4].result.content[0].text);
    assert.strictEqual(Object.hasOwn(messages[2].result, "structuredContent"), false);
    assert.strictEqual(Object.hasOwn(messages[3].result, "structuredContent"), false);
    assert.strictEqual(resetResult.status, "reset");
    assert.strictEqual(resetResult.previousState, "manual-review");
    assert.strictEqual(resetResult.nextState, "audit-queued");
    assert.strictEqual(releaseResult.status, "released");
    assert.strictEqual(releaseResult.pageId, "beta");
    assert.strictEqual(releaseResult.nextState, "repair-queued");
    assert.strictEqual(passedResetResult.status, "reset");
    assert.strictEqual(passedResetResult.previousState, "l3-auto-passed");
    assert.strictEqual(passedResetResult.nextState, "audit-queued");
    assert.strictEqual(passedResetResult.published, true);
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
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "stage2_reset_manual_review",
    arguments: {
      pageId: "alpha",
      reason: "fixture authorized re-audit",
    },
  },
})}\n`);
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 5,
  method: "tools/call",
  params: {
    name: "stage2_reset_passed_page",
    arguments: {
      pageId: "gamma",
      reason: "fixture authorized passed-page re-audit",
    },
  },
})}\n`);
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 4,
  method: "tools/call",
  params: {
    name: "stage2_release_lease",
    arguments: {
      pageId: "beta",
      taskId: "beta:repair:2:fixture",
      reason: "fixture failed submission recovery",
    },
  },
})}\n`);
