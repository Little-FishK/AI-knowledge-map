"use strict";
// Each entry gets a fresh page-locked MCP process and one build attempt.
const { spawn } = require("child_process");
const path = require("path");
const root = path.resolve(__dirname, "..");
async function session(pageId, action) {
  const child = spawn(process.execPath, [path.join(root, "tools/deepdive-stage2/mcp-server.js")], {
    cwd: root, windowsHide: true, env: { ...process.env, DEEPDIVE_STAGE2_ROOT: root,
      STAGE2_MCP_PROFILE: "translation-static", STAGE2_MCP_PAGE_ID: pageId,
      STAGE2_MCP_MANUAL_REVIEW_ACTION: "hold", STAGE2_STATIC_BUILD: "true" },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let buffer = "", serial = 0;
  const waiting = new Map();
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", chunk => {
    buffer += chunk;
    while (buffer.includes("\n")) {
      const end = buffer.indexOf("\n"), line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
      if (!line.trim()) continue;
      const response = JSON.parse(line), pending = waiting.get(response.id);
      if (pending) { waiting.delete(response.id); clearTimeout(pending.timer); response.error ? pending.reject(new Error(JSON.stringify(response.error))) : pending.resolve(response.result); }
    }
  });
  child.stderr.on("data", chunk => process.stderr.write(chunk));
  child.on("exit", code => { for (const pending of waiting.values()) { clearTimeout(pending.timer); pending.reject(new Error(`MCP exited ${code}`)); } waiting.clear(); });
  function rpc(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++serial, timer = setTimeout(() => { waiting.delete(id); reject(new Error("MCP response timeout")); }, 30000);
      waiting.set(id, { resolve, reject, timer });
      child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }
  async function call(name, args) {
    const result = await rpc("tools/call", { name, arguments: args });
    if (result.isError) throw new Error(JSON.stringify(result));
    return JSON.parse(result.content.find(item => item.type === "text").text);
  }
  try {
    await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "static-concept-build", version: "1.0" } });
    return await action(call);
  } finally { child.stdin.end(); child.kill(); }
}
function validatePlan(plan) {
  const { validId } = require("./deepdive-stage2/lib/static-output");
  if (plan?.schemaVersion !== 1 || !Array.isArray(plan.pages) || !plan.pages.length) throw Error("Nonempty static build plan required");
  require("./readiness/render-static-concept").configuration(plan.siteUrl);
  const ids = new Set();
  for (const entry of plan.pages) {
    if (!validId(entry.pageId) || ids.has(entry.pageId) || ![entry.reviewId, entry.artifactHash].every(x => /^sha256:[a-f0-9]{64}$/.test(x || ""))) throw Error("Invalid or duplicate static build entry");
    ids.add(entry.pageId);
  }
  return plan;
}
async function run(plan, openSession = session) {
  validatePlan(plan); // Validate all entries before performing any mutation.
  const results = [];
  for (const { pageId, reviewId, artifactHash } of plan.pages) {
    try {
      const receipt = await openSession(pageId, call => call("stage2_build_static_translation", { pageId, reviewId, artifactHash, siteUrl: plan.siteUrl }));
      results.push({ pageId, status: "built", receipt });
    } catch (error) { results.push({ pageId, status: "failed", error: error.message }); }
  }
  return { state: results.some(r => r.status === "failed") ? "partial-or-failed" : "built", results, deployed: false };
}
if (require.main === module) (async () => {
  const argument = process.argv[2];
  const filename = argument && !argument.startsWith("https://") ? path.resolve(argument) : path.join(root, "config/static-concepts.json");
  const plan = JSON.parse(require("fs").readFileSync(filename, "utf8"));
  if (argument?.startsWith("https://")) plan.siteUrl = argument; // Legacy URL argument.
  const result = await run(plan);
  console.log(JSON.stringify(result, null, 2));
  if (result.state !== "built") process.exitCode = 1;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { validatePlan, run };
