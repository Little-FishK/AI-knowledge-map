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
  "data/library-new-sources.js", "data/library-arxiv.js",
  "data/library-neurips-proceedings.js", "data/library-openreview.js",
  "data/library-acl-anthology.js"
].forEach(file => require(path.join(PROJECT_ROOT, file)));

const sourceRecords = item => [item, ...(item.relatedMaterials || [])];
const records = window.PRO_LIBRARY.items.flatMap(sourceRecords).filter(item => item.sourceSubcategory === "neurips-proceedings");
assert.equal(records.length, 5);
assert.equal(records.filter(item => item.existingLibraryId).length, 4);
assert.equal(records.filter(item => !item.existingLibraryId).length, 1);
assert.ok(records.every(item => item.reviewStatus.includes("六步审核通过")));
const corrected = window.PRO_LIBRARY.items.find(item => item.id === "arxiv-2406-02507");
assert.equal(corrected.discoveryOnly, true);
assert.match(corrected.reviewStatus, /Runner-up/);

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
    await page.locator('[data-library-subcategory="neurips-proceedings"]').click();
    assert.equal(await page.locator("#library-view .lib-card").count(), 5);
    await page.goto(base + "#/library/arxiv-2404-02905");
    await page.waitForFunction(() => document.querySelector(".d-title")?.textContent.startsWith("Visual Autoregressive"));
    assert.match(await page.locator("#detail-body").innerText(), /NeurIPS 2024 · Main Conference · Best Paper/);
    await page.goto(base + "#/library/neurips-2024-dd2eb5250696753ea37141bbd89bb569");
    await page.waitForFunction(() => document.querySelector(".d-title")?.textContent.startsWith("Stochastic Taylor"));
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
    await new Promise(resolve => server.close(resolve));
  }
}

(async () => {
  const candidates = [playwright.chromium.executablePath(), "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].filter(Boolean);
  const browser = await playwright.chromium.launch({ headless: true, executablePath: candidates.find(candidate => fs.existsSync(candidate)) });
  try {
    await verifyBrowser(PROJECT_ROOT, browser);
    await verifyBrowser(path.join(PROJECT_ROOT, "site-release"), browser);
  } finally { await browser.close(); }
  console.log("PASS NeurIPS Proceedings 5 reviewed records and Runner-up correction");
})().catch(error => { console.error(error); process.exitCode = 1; });
