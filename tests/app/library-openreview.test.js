"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");
let playwright;
try { playwright = require("playwright"); }
catch (_) { playwright = require(path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")); }

global.window = {};
[
  "data/graph.js", "data/software.js", "data/library.js",
  "data/library-official-technical.js", "data/library-official-china.js",
  "data/library-platform-profiles.js", "data/library-source-meta.js",
  "data/library-new-sources.js", "data/library-arxiv.js", "data/library-openreview.js"
].forEach(file => require(path.join(PROJECT_ROOT, file)));

const allRecords = window.PRO_LIBRARY.items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
const records = allRecords.filter(item => item.sourceClass === "academic" && item.sourceSubcategory === "openreview");
assert.equal(records.length, 5);
assert.equal(new Set(records.map(item => item.id)).size, 5);
assert.equal(new Set(records.map(item => item.url)).size, 5);
assert.ok(records.every(item => item.reviewStatus.includes("六步审核通过")));
assert.deepEqual(records.map(item => item.title).sort(), [
  "Generalization in diffusion models arises from geometry-adaptive harmonic representations",
  "LLMs Get Lost In Multi-Turn Conversation",
  "Learning Interactive Real-World Simulators",
  "Never Train from Scratch: Fair Comparison of Long-Sequence Models Requires Data-Driven Priors",
  "Vision Transformers Need Registers"
].sort());

async function verifyBrowser(siteRoot, browser) {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const target = path.resolve(siteRoot, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!target.startsWith(siteRoot + path.sep)) return res.writeHead(403).end();
    fs.readFile(target, (error, content) => {
      if (error) return res.writeHead(404).end();
      const type = { ".js": "text/javascript", ".html": "text/html", ".css": "text/css", ".json": "application/json" }[path.extname(target)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type }); res.end(content);
    });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    const base = `http://127.0.0.1:${server.address().port}/`;
    await page.goto(base + "#/library");
    const skip = page.locator("#onboarding [data-skip]");
    if (await skip.isVisible()) await skip.click();
    await page.waitForFunction(() => document.querySelectorAll("#library-view .lib-card").length >= 15);
    await page.locator('[data-library-class="academic"]').click();
    await page.locator('[data-library-subcategory="openreview"]').click();
    assert.equal(await page.locator("#library-view .lib-card").count(), 5);
    await page.goto(base + "#/library/openreview-iclr-2026-59f6421e64707225fdf5b28840679a07");
    await page.waitForFunction(() => document.querySelector(".d-title")?.textContent === "LLMs Get Lost In Multi-Turn Conversation");
    assert.match(await page.locator(".d-summary").innerText(), /多轮/);
    assert.deepEqual(errors, []);
    console.log(`PASS OpenReview browser publication: ${path.basename(siteRoot)}`);
  } finally {
    await page.close();
    await new Promise(resolve => server.close(resolve));
  }
}

(async () => {
  const candidates = [process.env.DEEP_DIVE_BROWSER_PATH, playwright.chromium.executablePath(), "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].filter(Boolean);
  const browser = await playwright.chromium.launch({ headless: true, executablePath: candidates.find(candidate => fs.existsSync(candidate)) });
  try {
    await verifyBrowser(PROJECT_ROOT, browser);
    await verifyBrowser(path.join(PROJECT_ROOT, "site-release"), browser);
  } finally {
    await browser.close();
  }
  console.log("PASS OpenReview/ICLR 5 篇正式收录记录");
})().catch(error => { console.error(error); process.exitCode = 1; });
