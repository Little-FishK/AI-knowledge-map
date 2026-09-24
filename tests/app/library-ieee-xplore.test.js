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
  "data/library-neurips-proceedings.js", "data/library-pmlr.js",
  "data/library-openreview.js", "data/library-acl-anthology.js",
  "data/library-cvf-open-access.js", "data/library-ieee-xplore.js"
].forEach(file => require(path.join(PROJECT_ROOT, file)));

const expectedIds = ["ieee-10610665", "ieee-10611477", "ieee-11128000", "ieee-11128482"];
const records = window.PRO_LIBRARY.items.filter(item => item.sourceSubcategory === "ieee-xplore");
assert.deepEqual(records.map(item => item.id).sort(), expectedIds);
for (const record of records) {
  assert.equal(record.discoveryOnly, true);
  assert.equal(record.importanceReview.status, "needs-evidence");
  assert.match(record.reviewStatus, /缺乏 AI 重大贡献外部说明/);
  assert.match(record.reviewStatus, /上线不代表通过/);
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
    await page.waitForFunction(() => document.querySelectorAll("#library-view .lib-card").length > 150);
    await page.locator('[data-library-class="academic"]').click();
    await page.locator('[data-library-subcategory="ieee-xplore"]').click();
    assert.equal(await page.locator("#library-view .lib-card").count(), 4);
    for (const id of expectedIds) {
      await page.goto(base + `#/library/${id}`);
      await page.waitForFunction(expected => document.querySelector(".d-title")?.textContent.length > 0 && location.hash.endsWith(expected), id);
      assert.match(await page.locator("#detail-body").innerText(), /缺乏 AI 重大贡献外部说明/);
      assert.match(await page.locator("#detail-body").innerText(), /上线不代表/);
    }
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
  console.log("PASS IEEE Xplore four public needs-evidence records");
})().catch(error => { console.error(error); process.exitCode = 1; });
