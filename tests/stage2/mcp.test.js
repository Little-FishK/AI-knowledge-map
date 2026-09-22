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
    schemaVersion: 2,
    storage: {
      schemaVersion: 1,
      contentGenerationSavedResponses: "external-content-addressed",
    },
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
  env: { ...process.env, DEEPDIVE_STAGE2_ROOT: fixture, STAGE2_MCP_PROFILE: "full", STAGE2_MCP_MANUAL_REVIEW_ACTION: "hold" },
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
  if (messages.length < 10) return;
  clearTimeout(timeout);
  try {
    const byId = new Map(messages.map(message => [message.id, message]));
    const initializeResponse = byId.get(1);
    const toolsResponse = byId.get(2);
    const resetResponse = byId.get(3);
    const releaseResponse = byId.get(4);
    const passedResetResponse = byId.get(5);
    const storageResponse = byId.get(6);
    const shadowResponse = byId.get(7);
    const backfillResponse = byId.get(8);
    const dualReadResponse = byId.get(9);
    const cutoverResponse = byId.get(10);
    assert.strictEqual(initializeResponse.result.serverInfo.name, "ai-knowledge-map-stage2");
    const toolNames = toolsResponse.result.tools.map(tool => tool.name);
    assert.strictEqual(new Set(toolNames).size, toolNames.length, "MCP tool names must be unique");
    // Independent API contract: deriving this list from the server would hide
    // accidental additions/removals. Tool ordering is not part of the contract.
    assert.deepStrictEqual(
      [...toolNames].sort(),
      [
        "stage2_build_website",
        "stage2_build_deepseek_translation",
        "stage2_inspect_deepseek_translation",
        "stage2_run_deepseek_translation",
        "stage2_preview_translation",
        "stage2_begin_translation_quality",
        "stage2_inspect_translation_quality",
        "stage2_read_translation_quality_packet",
        "stage2_build_translation_batch",
        "stage2_inspect_translation_batch",
        "stage2_submit_translation_batch",
        "stage2_reconcile_translation_batch",
        "stage2_collect_translation_batch",
        "stage2_inspect_translation_source_binding",
        "stage2_export_translation_snapshot",
        "stage2_read_translation_snapshot",
        "stage2_prepare_translation_task",
        "stage2_check_translation_snapshot",
        "stage2_inventory_pages",
        "stage2_inspect_audit_upgrade",
        "stage2_queue_audit_upgrade",
        "stage2_diagnose_candidate_gate",
        "stage2_apply_information_theory_authorized_repair",
        "stage2_apply_transformer_authorized_sources",
        "stage2_create_readiness_checkpoint",
        "stage2_inventory_page_assets",
        "stage2_inspect_published_translation",
        "stage2_status",
        "stage2_state_storage_report",
        "stage2_build_state_v2_shadow",
        "stage2_backfill_state_v2_objects",
        "stage2_validate_state_v2_dual_read",
        "stage2_switch_state_v2",
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
        "stage2_amend_translation_units",
        "stage2_amend_duplicate_formula",
        "stage2_adjudicate_translation_findings",
        "stage2_handover_translation_campaign",
        "stage2_diagnose_translation_campaign",
        "stage2_build_translation_campaign",
        "stage2_inspect_translation_campaign",
        "stage2_step_translation_campaign",
      ].sort(),
    );
    const claimTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_claim_task");
    assert.strictEqual(claimTool.inputSchema.properties.pageId.pattern, "^[a-z0-9][a-z0-9-]*$");
    assert.match(claimTool.description, /uiCleanup/);
    const submitTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_submit_result");
    assert.match(submitTool.description, /归档当前 Codex 任务/);
    const resetTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_reset_manual_review");
    assert.deepStrictEqual(resetTool.inputSchema.required, ["pageId", "reason"]);
    const importTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_import_editorial_candidate");
    assert.deepStrictEqual(importTool.inputSchema.required, ["pageId", "reason"]);
    assert.strictEqual(importTool.inputSchema.properties.useContentGenerationOutput.type, "boolean");
    assert.strictEqual(importTool.inputSchema.anyOf[1].properties.useContentGenerationOutput.const, true);
    assert.match(importTool.description, /图表保留/);
    const passedResetTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_reset_passed_page");
    assert.deepStrictEqual(passedResetTool.inputSchema.required, ["pageId", "reason"]);
    const previewTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_create_manual_review_preview");
    assert.deepStrictEqual(previewTool.inputSchema.required, ["pageId"]);
    assert.strictEqual(previewTool.inputSchema.properties.rounds.maxItems, 2);
    const finalizeTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_finalize_manual_review");
    assert.deepStrictEqual(finalizeTool.inputSchema.required, ["pageId", "reason"]);
    const inspectPublicationTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_inspect_publication_candidate");
    assert.deepStrictEqual(inspectPublicationTool.inputSchema.required, ["pageId"]);
    const provisionalTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_publish_provisional_page");
    assert.deepStrictEqual(provisionalTool.inputSchema.required, ["pageId", "expectedCandidateHash", "reason"]);
    assert.match(provisionalTool.description, /不伪造 L3 通过/);
    const rollbackTool = toolsResponse.result.tools.find(tool => tool.name === "stage2_rollback_provisional_page");
    assert.deepStrictEqual(rollbackTool.inputSchema.required, ["pageId", "expectedCandidateHash", "reason"]);
    const resetResult = JSON.parse(resetResponse.result.content[0].text);
    const passedResetResult = JSON.parse(passedResetResponse.result.content[0].text);
    const releaseResult = JSON.parse(releaseResponse.result.content[0].text);
    assert.strictEqual(Object.hasOwn(resetResponse.result, "structuredContent"), false);
    assert.strictEqual(Object.hasOwn(passedResetResponse.result, "structuredContent"), false);
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
    const storageReport = JSON.parse(storageResponse.result.content[0].text);
    assert.strictEqual(storageReport.readOnly, true);
    assert.strictEqual(storageReport.pages.count, 3);
    assert.strictEqual(storageReport.safeguards.valuesIncluded, false);
    assert.strictEqual(storageReport.safeguards.pageIdsIncluded, false);
    assert.strictEqual(shadowResponse.result.isError, true);
    assert.match(shadowResponse.result.content[0].text, /状态文件版本无效/);
    assert.strictEqual(backfillResponse.result.isError, true);
    assert.match(backfillResponse.result.content[0].text, /状态文件版本无效/);
    assert.strictEqual(dualReadResponse.result.isError, true);
    assert.match(dualReadResponse.result.content[0].text, /状态文件版本无效/);
    assert.strictEqual(cutoverResponse.result.isError, true);
    assert.match(cutoverResponse.result.content[0].text, /正式 Schema v2 状态已经变化/);
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
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 10,
  method: "tools/call",
  params: {
    name: "stage2_switch_state_v2",
    arguments: {
      expectedSourceDigest: `sha256:${"0".repeat(64)}`,
      expectedShadowDigest: `sha256:${"0".repeat(64)}`,
    },
  },
})}\n`);
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 9,
  method: "tools/call",
  params: {
    name: "stage2_validate_state_v2_dual_read",
    arguments: {
      expectedSourceDigest: `sha256:${"0".repeat(64)}`,
    },
  },
})}\n`);
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 8,
  method: "tools/call",
  params: {
    name: "stage2_backfill_state_v2_objects",
    arguments: {
      expectedSourceDigest: `sha256:${"0".repeat(64)}`,
    },
  },
})}\n`);
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 7,
  method: "tools/call",
  params: {
    name: "stage2_build_state_v2_shadow",
    arguments: {
      expectedSourceDigest: `sha256:${"0".repeat(64)}`,
    },
  },
})}\n`);
server.stdin.write(`${JSON.stringify({
  jsonrpc: "2.0",
  id: 6,
  method: "tools/call",
  params: {
    name: "stage2_state_storage_report",
    arguments: {},
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
