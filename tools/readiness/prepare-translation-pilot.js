"use strict";

// Production source is accessed only through the page-locked Stage 2 MCP server.
// Copies are local preparation artifacts, not controller records or publication.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const root = path.resolve(__dirname, "../..");
const pageId = process.argv[2], snapshotId = process.argv[3];
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageId || "") || !/^sha256:[a-f0-9]{64}$/.test(snapshotId || "")) {
  throw new Error("Usage: node tools/readiness/prepare-translation-pilot.js <pageId> <snapshotId>");
}
const child = spawn(process.execPath, [path.join(root, "tools/deepdive-stage2/mcp-server.js")], {
  cwd: root, windowsHide: true, env: { ...process.env, DEEPDIVE_STAGE2_ROOT: root,
    STAGE2_MCP_PROFILE: "translation", STAGE2_MCP_PAGE_ID: pageId, STAGE2_MCP_MANUAL_REVIEW_ACTION: "hold" },
  stdio: ["pipe", "pipe", "pipe"],
});
let buffer = "", serial = 0;
const waiting = new Map();
function fail(error) { for (const pending of waiting.values()) { clearTimeout(pending.timer); pending.reject(error); } waiting.clear(); }
child.on("error", fail);
child.on("exit", code => fail(new Error(`MCP exited ${code}`)));
child.stderr.on("data", chunk => process.stderr.write(chunk));
child.stdout.setEncoding("utf8");
child.stdout.on("data", chunk => {
  buffer += chunk;
  while (buffer.includes("\n")) {
    const end = buffer.indexOf("\n"), line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
    if (!line.trim()) continue;
    try {
      const response = JSON.parse(line), pending = waiting.get(response.id);
      if (pending) {
        waiting.delete(response.id); clearTimeout(pending.timer);
        response.error ? pending.reject(new Error(JSON.stringify(response.error))) : pending.resolve(response.result);
      }
    } catch (error) { fail(error); }
  }
});
function rpc(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial, timer = setTimeout(() => { waiting.delete(id); reject(new Error("MCP response timeout")); }, 30000);
    waiting.set(id, { resolve, reject, timer });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
async function call(name, args) {
  const result = await rpc("tools/call", { name, arguments: { pageId, snapshotId, ...args } });
  if (result.isError) throw new Error(JSON.stringify(result));
  return JSON.parse(result.content.find(item => item.type === "text").text);
}
async function complete(name, args = {}) {
  let offset = 0, text = "";
  while (true) {
    const part = await call(name, { ...args, offset, maxChars: 12000 });
    if (typeof part.content !== "string" || part.nextOffset !== offset + part.content.length || (!part.done && !part.content.length)) throw new Error("Invalid MCP pagination");
    text += part.content; offset = part.nextOffset;
    if (part.done) return JSON.parse(text);
  }
}
const digest = value => `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
async function run() {
  await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "translation-pilot-preparation", version: "1.0" } });
  if ((await call("stage2_check_translation_snapshot")).state !== "prepared") throw new Error("Source snapshot is stale");
  const snapshot = await complete("stage2_read_translation_snapshot"), capture = snapshot.capture;
  if (snapshot.snapshotId !== snapshotId || digest(capture) !== snapshotId || capture.pageId !== pageId) throw new Error("Snapshot integrity mismatch");
  const chapterIds = ["page-header", ...new Set(capture.manifest.units.map(unit => unit.chapterId))];
  const packets = [];
  for (const chapterId of chapterIds) {
    const packet = await complete("stage2_prepare_translation_task", { chapterId });
    if (packet.snapshotId !== snapshotId || packet.chapterId !== chapterId || packet.sourceContentHash !== capture.sourceContentHash || !packet.prompt) throw new Error("Task binding mismatch");
    packets.push(packet);
  }
  if ((await call("stage2_check_translation_snapshot")).state !== "prepared") throw new Error("Source changed while preparing tasks");
  const directory = path.join(root, ".tmp/website-preview/translation", pageId, snapshotId.slice(7));
  // Reject symlink/junction redirection before writing local copies.
  let current = root;
  for (const segment of path.relative(root, directory).split(path.sep)) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error("Local preparation path is a link");
    fs.mkdirSync(current, { recursive: true });
  }
  const report = { schemaVersion: 1, pageId, snapshotId, sourceContentHash: capture.sourceContentHash,
    status: "prepared-not-translated", sourceEvidence: capture.approvalEvidence.kind,
    sourceEligibleForEnglishReview: capture.approvalEvidence.sourceEligibleForEnglishReview,
    taskCount: packets.length, unitCount: packets.reduce((total, packet) => total + packet.data.units.length, 0),
    tasks: packets.map(packet => ({ chapterId: packet.chapterId, taskId: packet.taskId, unitCount: packet.data.units.length,
      utf8Bytes: Buffer.byteLength(JSON.stringify(packet), "utf8"), title: capture.manifest.chapters.find(chapter => chapter.id === packet.chapterId)?.title || packet.chapterId })),
    resources: { inlineSvgCount: (capture.page.html.match(/<svg\b/gi) || []).length,
      tableCount: (capture.page.html.match(/<table\b/gi) || []).length,
      detailsCount: (capture.page.html.match(/<details\b/gi) || []).length,
      protectedSpanCount: capture.manifest.protectedSpans.length, dependencies: capture.manifest.dependencies },
    validation: { sourceCurrent: true, exactTaskPromptsPreserved: true, translated: false, semanticReview: "not-started", browserReview: "not-started" },
    publicationAllowed: false };
  for (const packet of packets) fs.writeFileSync(path.join(directory, `${packet.chapterId}.task.json`), JSON.stringify(packet, null, 2));
  fs.writeFileSync(path.join(directory, "readiness.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }, null, 2));
}
run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => { child.stdin.end(); child.kill(); });
