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

const expectedId = "springer-nature-1007-978-3-031-73039-9-19";

function loadData(root) {
  for (const key of ["PRO_LIBRARY", "LIBRARY_PLATFORM_PROFILES", "LIBRARY_PROFILE_GUIDANCE", "LIBRARY_SOURCE_META", "SOFTWARE", "GRAPH"]) delete global.window?.[key];
  global.window = {};
  [
    "data/graph.js", "data/software.js", "data/library.js",
    "data/library-official-technical.js", "data/library-official-china.js",
    "data/library-platform-profiles.js", "data/library-source-meta.js",
    "data/library-new-sources.js", "data/library-arxiv.js",
    "data/library-neurips-proceedings.js", "data/library-pmlr.js",
    "data/library-openreview.js", "data/library-acl-anthology.js",
    "data/library-cvf-open-access.js", "data/library-ieee-xplore.js",
    "data/library-acm-digital-library.js", "data/library-springer-nature.js"
  ].forEach(file => {
    const resolved = path.join(root, file);
    delete require.cache[require.resolve(resolved)];
    require(resolved);
  });
  return window.PRO_LIBRARY.items;
}

const releaseRoot = process.env.LIBRARY_RELEASE_ROOT ? path.resolve(process.env.LIBRARY_RELEASE_ROOT) : path.join(PROJECT_ROOT, "site-release");
for (const root of [PROJECT_ROOT, releaseRoot]) {
  const records = loadData(root);
  assert.equal(records.filter(item => item.sourceSubcategory === "acm-dl").length, 9);
  const springer = records.filter(item => item.sourceSubcategory === "springer-nature");
  assert.equal(springer.length, 1);
  assert.equal(springer[0].id, expectedId);
  assert.equal(springer[0].discoveryOnly, false);
  assert.equal(springer[0].importanceReview.status, "passed");
  assert.match(springer[0].reviewStatus, /重要性审核通过/);
  assert.equal(springer[0].reproductionStatus, "未独立复现");
}

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
    await page.waitForSelector('[data-library-class="academic"]');
    await page.locator('[data-library-class="academic"]').click();
    await page.waitForSelector('[data-library-subcategory="acm-dl"]');
    await page.locator('[data-library-subcategory="acm-dl"]').click();
    assert.equal(await page.locator("#library-view .lib-card").count(), 9);
    await page.locator('[data-library-subcategory="springer-nature"]').click();
    assert.equal(await page.locator("#library-view .lib-card").count(), 1);
    await page.goto(base + `#/library/${expectedId}`);
    await page.waitForFunction(expected => document.querySelector(".d-title")?.textContent.length > 0 && new URLSearchParams(location.search).get("item") === expected && !location.hash, expectedId);
    const detail = await page.locator("#detail-body").innerText();
    assert.match(detail, /重要性审核通过/);
    assert.match(detail, /未独立复现/);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
    await new Promise(resolve => server.close(resolve));
  }
}

async function verifyLiveBrowser(base, browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(new URL(`?deploy=${Date.now()}#/library`, base).href, { waitUntil: "networkidle" });
    const skip = page.locator("#onboarding [data-skip]");
    if (await skip.isVisible()) await skip.click();
    await page.waitForSelector('[data-library-class="academic"]');
    await page.locator('[data-library-class="academic"]').click();
    await page.locator('[data-library-subcategory="acm-dl"]').click();
    assert.equal(await page.locator("#library-view .lib-card").count(), 9);
    await page.locator('[data-library-subcategory="springer-nature"]').click();
    assert.equal(await page.locator("#library-view .lib-card").count(), 1);
    await page.goto(new URL(`?deploy=${Date.now()}#/library/${expectedId}`, base).href, { waitUntil: "networkidle" });
    await page.waitForFunction(expected => document.querySelector(".d-title")?.textContent.length > 0 && new URLSearchParams(location.search).get("item") === expected && !location.hash, expectedId);
    const detail = await page.locator("#detail-body").innerText();
    assert.match(detail, /重要性审核通过/);
    assert.match(detail, /未独立复现/);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
}

(async () => {
  const candidates = [playwright.chromium.executablePath(), "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].filter(Boolean);
  const browser = await playwright.chromium.launch({ headless: true, executablePath: candidates.find(candidate => fs.existsSync(candidate)) });
  try {
    await verifyBrowser(PROJECT_ROOT, browser);
    await verifyBrowser(releaseRoot, browser);
    if (process.env.LIBRARY_LIVE_URL) await verifyLiveBrowser(process.env.LIBRARY_LIVE_URL, browser);
  } finally { await browser.close(); }
  console.log("PASS ACM nine plus Springer Nature one public records");
})().catch(error => { console.error(error); process.exitCode = 1; });
