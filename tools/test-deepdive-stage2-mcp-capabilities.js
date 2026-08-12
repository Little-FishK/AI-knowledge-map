"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

function createFixture() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-mcp-capabilities-"));
  fs.mkdirSync(path.join(fixture, ".stage2"), { recursive: true });
  fs.writeFileSync(path.join(fixture, ".stage2", "state.json"), `${JSON.stringify({
    schemaVersion: 1,
    mode: "serial",
    paused: true,
    policy: { maxRepairAttempts: 2, leaseMinutes: 45 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: {
      alpha: {
        id: "alpha",
        state: "audit-queued",
        attempt: 0,
        repairAttempts: 0,
        blockers: [],
        lease: null,
        updatedAt: new Date().toISOString(),
      },
    },
  }, null, 2)}\n`, "utf8");
  return fixture;
}

function runServer(profile, requests, envOverrides = {}) {
  const fixture = createFixture();
  const server = spawn(process.execPath, [
    path.join(__dirname, "deepdive-stage2", "mcp-server.js"),
  ], {
    cwd: fixture,
    env: {
      ...process.env,
      DEEPDIVE_STAGE2_ROOT: fixture,
      STAGE2_MCP_PROFILE: profile,
      STAGE2_MCP_PAGE_ID: "alpha",
      ...envOverrides,
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  return new Promise((resolve, reject) => {
    let buffer = "";
    let stderr = "";
    let completedResult = null;
    const responses = new Map();
    const timeout = setTimeout(() => {
      server.kill();
      reject(new Error(`MCP capability test timed out (${profile})`));
    }, 5000);

    server.stderr.setEncoding("utf8");
    server.stderr.on("data", chunk => { stderr += chunk; });
    server.stdout.setEncoding("utf8");
    server.stdout.on("data", chunk => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        responses.set(message.id, message);
      }
      if (requests.every(request => responses.has(request.id))) {
        clearTimeout(timeout);
        completedResult = requests.map(request => responses.get(request.id));
        server.kill();
      }
    });
    server.on("error", reject);
    server.on("close", code => {
      clearTimeout(timeout);
      fs.rmSync(fixture, { recursive: true, force: true });
      if (completedResult) return resolve(completedResult);
      reject(new Error(stderr || `MCP server exited with ${code}`));
    });

    for (const request of requests) server.stdin.write(`${JSON.stringify(request)}\n`);
  });
}

function call(id, name, args = {}) {
  return {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: { name, arguments: args },
  };
}

(async () => {
  const controller = await runServer("controller", [
    { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    call(2, "stage2_claim_task", { pageId: "alpha" }),
    call(3, "stage2_publish_provisional_page", {
      pageId: "alpha",
      expectedCandidateHash: `sha256:${"0".repeat(64)}`,
      reason: "not authorized",
    }),
  ]);
  assert.deepStrictEqual(
    controller[0].result.tools.map(tool => tool.name),
    ["stage2_status", "stage2_next_recommended_page", "stage2_inspect_publication_candidate"],
  );
  assert.strictEqual(controller[1].result.isError, true);
  assert.match(controller[1].result.content[0].text, /not available/);
  assert.strictEqual(controller[2].result.isError, true);
  assert.match(controller[2].result.content[0].text, /not available/);

  const publishingController = await runServer("controller", [
    { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    call(2, "stage2_inspect_publication_candidate", { pageId: "beta" }),
    call(3, "stage2_publish_provisional_page", {
      pageId: "beta",
      expectedCandidateHash: `sha256:${"0".repeat(64)}`,
      reason: "authorized page-lock test",
    }),
  ], {
    STAGE2_MCP_ALLOW_PROVISIONAL_PUBLISH: "1",
  });
  assert.deepStrictEqual(
    publishingController[0].result.tools.map(tool => tool.name),
    [
      "stage2_status",
      "stage2_next_recommended_page",
      "stage2_inspect_publication_candidate",
      "stage2_publish_provisional_page",
    ],
  );
  assert.strictEqual(publishingController[1].result.isError, true);
  assert.match(publishingController[1].result.content[0].text, /locked to page alpha/);
  assert.strictEqual(publishingController[2].result.isError, true);
  assert.match(publishingController[2].result.content[0].text, /locked to page alpha/);

  const audit = await runServer("audit", [
    { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    call(2, "stage2_search_project", {
      taskId: "wrong",
      leaseToken: "wrong",
      query: "fixture",
    }),
    call(3, "stage2_claim_task", { pageId: "alpha" }),
    call(4, "stage2_claim_task", { pageId: "alpha" }),
  ]);
  assert.deepStrictEqual(
    audit[0].result.tools.map(tool => tool.name),
    [
      "stage2_claim_task",
      "stage2_search_project",
      "stage2_read_project_file",
      "stage2_read_task_packet",
      "stage2_validate_audit_result",
      "stage2_submit_result",
    ],
  );
  assert.strictEqual(audit[1].result.isError, true);
  assert.match(audit[1].result.content[0].text, /No lease/);
  assert.strictEqual(JSON.parse(audit[2].result.content[0].text).status, "paused");
  assert.strictEqual(audit[3].result.isError, true);
  assert.match(audit[3].result.content[0].text, /single claim/);

  const repair = await runServer("repair", [
    { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    call(2, "stage2_search_project", {
      taskId: "wrong",
      leaseToken: "wrong",
      query: "fixture",
    }),
    call(3, "stage2_claim_task", { pageId: "alpha" }),
    call(4, "stage2_claim_task", { pageId: "alpha" }),
  ]);
  assert.deepStrictEqual(
    repair[0].result.tools.map(tool => tool.name),
    ["stage2_claim_task", "stage2_read_task_packet", "stage2_validate_page_result", "stage2_submit_result"],
  );
  assert.strictEqual(repair[1].result.isError, true);
  assert.match(repair[1].result.content[0].text, /not available/);
  assert.strictEqual(JSON.parse(repair[2].result.content[0].text).status, "paused");
  assert.strictEqual(repair[3].result.isError, true);
  assert.match(repair[3].result.content[0].text, /single claim/);

  console.log("✓ Stage 2 MCP capability profiles enforce page-locked controller publication, worker boundaries, and one claim");
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
