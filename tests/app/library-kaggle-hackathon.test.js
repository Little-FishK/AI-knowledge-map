"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "../..", "site-release");
let playwright;
try { playwright = require("playwright"); }
catch (_) { playwright = require(path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")); }

(async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const target = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!target.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(target, (error, content) => {
      if (error) return res.writeHead(404).end();
      const type = { ".js":"text/javascript", ".html":"text/html", ".css":"text/css", ".json":"application/json" }[path.extname(target)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type":type });
      res.end(content);
    });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const candidates = [playwright.chromium.executablePath(), "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].filter(Boolean);
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless:true, executablePath:candidates.find(candidate => fs.existsSync(candidate)) });
    const page = await browser.newPage({ viewport:{ width:1440, height:1000 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/#/library`);
    const skip = page.locator("#onboarding [data-skip]");
    if (await skip.isVisible()) await skip.click();
    await page.locator('[data-library-class="hackathon"]').click();
    await page.locator('[data-library-subcategory="kaggle"]').click();
    await page.waitForFunction(() => document.querySelectorAll("#library-view .lib-card").length === 157);
    assert.equal(await page.locator("#library-view .lib-card").count(), 157);
    assert.equal(await page.locator('[data-library-item="kaggle-pokemon-tcg-ai-battle-challenge-strategy-01"]').count(), 1);
    assert.deepEqual(errors, []);
    await page.close();
    console.log("PASS: production library exposes exactly 157 reviewed Kaggle hackathon projects");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
