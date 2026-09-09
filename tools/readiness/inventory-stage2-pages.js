"use strict";
// Metadata only, through MCP. No direct production-state or content access.
const { spawn } = require("child_process"), path = require("path"), fs = require("fs");
const root = path.resolve(__dirname, "../..");
async function main() {
  const child = spawn(process.execPath, [path.join(root, "tools/deepdive-stage2/mcp-server.js")], { cwd: root, windowsHide: true,
    env: { ...process.env, DEEPDIVE_STAGE2_ROOT: root, STAGE2_MCP_PROFILE: "full", STAGE2_MCP_MANUAL_REVIEW_ACTION: "hold" }, stdio: ["pipe", "pipe", "pipe"] });
  let buffer = "", serial = 0; const pending = new Map();
  child.stdout.on("data", chunk => { buffer += chunk; while (buffer.includes("\n")) {
    const end = buffer.indexOf("\n"), line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
    if (!line.trim()) continue;
    const result = JSON.parse(line), task = pending.get(result.id);
    if (task) { pending.delete(result.id); clearTimeout(task.timer); result.error ? task.reject(Error(JSON.stringify(result.error))) : task.resolve(result.result); }
  } });
  child.stderr.on("data", chunk => process.stderr.write(chunk));
  const rpc = (method, params) => new Promise((resolve, reject) => {
    const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error("MCP timeout")); }, 30000);
    pending.set(id, { resolve, reject, timer }); child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
  const call = async (name, args = {}) => { const result = await rpc("tools/call", { name, arguments: args }); if (result.isError) throw Error(JSON.stringify(result)); return JSON.parse(result.content.find(c => c.type === "text").text); };
  try {
    await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "page-metadata-inventory", version: "1" } });
    const inventory = await call("stage2_inventory_pages");
    const counts = {}; for (const page of inventory.pages) counts[page.workflowState] = (counts[page.workflowState] || 0) + 1;
    const candidates = [];
    for (const page of inventory.pages.filter(p => p.workflowState !== "audit-queued" || p.pageId === "supervised-learning")) {
      candidates.push(await call("stage2_inspect_publication_candidate", { pageId: page.pageId }));
    }
    const result = { inventory, counts, candidates };
    const directory = path.join(root, ".tmp/website-preview"); fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "page-metadata-inventory.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ total: inventory.total, counts, candidates }, null, 2));
  } finally { for (const task of pending.values()) clearTimeout(task.timer); child.stdin.end(); child.kill(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
