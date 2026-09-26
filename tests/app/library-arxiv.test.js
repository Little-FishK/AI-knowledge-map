"use strict";
// Exercise the real lazy loader and cross-source deduplication through the UI.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const os = require("node:os");
const {pathToFileURL} = require("node:url");
const root = path.resolve(__dirname, "../..");
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
      const type = {".js":"text/javascript", ".html":"text/html", ".css":"text/css", ".json":"application/json"}[path.extname(target)] || "application/octet-stream";
      res.writeHead(200, {"Content-Type": type}); res.end(content);
    });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const candidates = [process.env.DEEP_DIVE_BROWSER_PATH, playwright.chromium.executablePath(), "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].filter(Boolean);
  let browser;
  try {
    browser = await playwright.chromium.launch({headless:true, executablePath:candidates.find(p=>fs.existsSync(p))});
    for (const base of [`http://127.0.0.1:${server.address().port}/`, pathToFileURL(path.join(root, "index.html")).href]) {
      const page = await browser.newPage({viewport:{width:1440,height:1000}});
      const errors=[]; page.on("pageerror", e=>errors.push(e.message));
      await page.goto(base + "#/library");
      const skip=page.locator('#onboarding [data-skip]');
      if(await skip.isVisible()) await skip.click();
      await page.waitForFunction(()=>document.querySelectorAll('#library-view .lib-card').length >= 15);
      await page.locator('[data-library-class="academic"]').click();
      await page.locator('[data-library-subcategory="arxiv"]').click();
      assert.equal(await page.locator('#library-view .lib-card').count(),14);
      assert.equal(await page.locator('[data-library-item="microsoft-autogen-docs"]').count(),0);
      assert.equal(await page.locator('[data-library-item="arxiv-2609-26642"]').count(),0);
      await page.goto(base+'#/library/arxiv-1810-04805');
      await page.waitForFunction(()=>document.querySelector('.d-title')?.textContent.startsWith('BERT:'));
      assert.match(await page.locator('.d-summary').innerText(),/双向文本表示/);
      await page.goto(base+'#/library');
      await page.locator('[data-library-class="all"]').click();
      await page.locator('.lib-search').fill('AutoGen');
      await page.waitForFunction(()=>document.querySelectorAll('#library-view .lib-card').length===1);
      assert.equal(await page.locator('#library-view .lib-card').count(),1);
      await page.locator('.lib-search').fill('Gated Attention');
      await page.waitForFunction(()=>document.querySelector('.lib-title')?.textContent.startsWith('Gated Attention'));
      assert.match(await page.locator('.lib-summary').innerText(),/注意力/);
      assert.deepEqual(errors,[]);
      await page.close();
      console.log('PASS library arXiv filtering, merged material, direct route, search: '+base);
    }
  } finally {
    if(browser) await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
