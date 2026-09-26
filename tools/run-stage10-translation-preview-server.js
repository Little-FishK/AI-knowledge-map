"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const pageId = String(process.argv[2] || "").trim();
const reviewId = String(process.argv[3] || "").trim();
const requestedPort = Number(process.argv[4] || 8876);

if (!/^[a-z0-9][a-z0-9-]*$/.test(pageId)) throw new Error("Usage: node tools/run-stage10-translation-preview-server.js <pageId> <reviewId> [port]");
if (!/^sha256:[a-f0-9]{64}$/.test(reviewId)) throw new Error("Invalid reviewId");
if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) throw new Error("Invalid port");

function createClient() {
  const server = path.join(root, "tools", "deepdive-stage2", "mcp-server.js");
  const child = spawn(process.execPath, [server], {
    cwd: root,
    env: {
      ...process.env,
      DEEPDIVE_STAGE2_ROOT: root,
      STAGE2_MCP_PROFILE: "translation-publication",
      STAGE2_MCP_PAGE_ID: pageId,
      STAGE2_TRANSLATION_PUBLISH_HASH: "",
    },
    stdio: ["pipe", "pipe", "inherit"],
  });
  let buffer = "", nextId = 1;
  const pending = new Map();
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", chunk => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const message = JSON.parse(line);
      if (message.id != null && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message || "MCP error"));
        else resolve(message.result);
      }
    }
  });
  child.on("exit", code => {
    for (const { reject } of pending.values()) reject(new Error(`MCP exited before replying (${code})`));
    pending.clear();
  });
  function call(method, params) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    });
  }
  function notify(method, params) {
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
  }
  return { child, call, notify };
}

async function loadCandidate() {
  const client = createClient();
  try {
    await client.call("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "stage10-preview-server", version: "1.0" },
    });
    client.notify("notifications/initialized", {});
    let offset = 0, serialized = "";
    for (;;) {
      const result = await client.call("tools/call", {
        name: "stage2_preview_translation",
        arguments: { pageId, reviewId, offset, maxChars: 12000 },
      });
      if (result.isError) throw new Error(result.content?.[0]?.text || "Preview failed");
      const part = JSON.parse(result.content?.[0]?.text || "{}");
      serialized += part.content || "";
      if (part.done) break;
      if (!Number.isInteger(part.nextOffset) || part.nextOffset <= offset) throw new Error("Invalid preview pagination");
      offset = part.nextOffset;
    }
    const preview = JSON.parse(serialized);
    return preview;
  } finally {
    client.child.stdin.end();
  }
}

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function staticPath(urlPath) {
  const relative = decodeURIComponent(urlPath).replace(/^\/+/, "") || "index.html";
  const target = path.resolve(root, relative);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) return null;
  return target;
}

(async () => {
  const preview = await loadCandidate();
  const candidate = preview.candidate;
  if (!candidate || !candidate.artifactHash) throw new Error("Missing candidate");
  const envelope = { ...candidate, status: "human-approved", acceptanceHash: "preview-only-not-a-publication-receipt" };
  let previewMode = "approved";
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const rootMode = url.pathname === "/" ? url.searchParams.get("translation-preview-mode") : null;
    if (rootMode === "approved" || rootMode === "missing") previewMode = rootMode;
    if (url.pathname === `/data/content-locales/en/deepdive/${encodeURIComponent(pageId)}.json`) {
      if (previewMode === "missing") {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
        return response.end("Preview fallback simulation");
      }
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      return response.end(JSON.stringify(envelope));
    }
    if (url.pathname === "/__translation-pilot/mode") {
      const requestedMode = url.searchParams.get("value");
      if (requestedMode !== "approved" && requestedMode !== "missing") {
        response.writeHead(400, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
        return response.end(JSON.stringify({ error: "value must be approved or missing" }));
      }
      previewMode = requestedMode;
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      return response.end(JSON.stringify({ previewMode }));
    }
    if (url.pathname === "/__translation-pilot/info") {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      return response.end(JSON.stringify({
        pageId,
        reviewId,
        artifactHash: candidate.artifactHash,
        revision: candidate.payload.revision,
        resources: candidate.payload.resources,
        requiredBrowserChecks: preview.requiredBrowserChecks,
        previewMode,
        publicationAllowed: false,
        previewOnly: true,
      }));
    }
    const file = staticPath(url.pathname);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return response.end("Not found");
    }
    response.writeHead(200, {
      "Content-Type": types.get(path.extname(file).toLowerCase()) || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(response);
  });
  server.listen(requestedPort, "127.0.0.1", () => {
    const port = server.address().port;
    process.stdout.write(`${JSON.stringify({
      state: "ready",
      url: `http://127.0.0.1:${port}/?quality-audit=1&concept=${pageId}`,
      infoUrl: `http://127.0.0.1:${port}/__translation-pilot/info`,
      artifactHash: candidate.artifactHash,
      resourceCount: candidate.payload.resources.length,
      publicationAllowed: false,
    })}\n`);
  });
  const close = () => server.close(() => process.exit(0));
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
})().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
