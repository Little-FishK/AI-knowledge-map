"use strict";

// Integration against the local MCP-derived snapshot; never reads Stage 2 files.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");
const { build } = require("../../tools/readiness/render-concept-preview");
const outputRoot = path.join(PROJECT_ROOT, ".tmp", "website-preview");

function playwright() {
  try { return require("playwright"); }
  catch (_) { return require(require.resolve("playwright", { paths: [path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node")] })); }
}

async function main() {
  build();
  const snapshot = JSON.parse(fs.readFileSync(path.join(outputRoot, "supervised-learning.snapshot.json"), "utf8"));
  const child = spawn(process.execPath, [path.join(PROJECT_ROOT, "tools/run-public-site-preview.js"), "0"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let browser;
  try {
    const origin = await new Promise((resolve, reject) => {
      let buffer = "";
      const timer = setTimeout(() => reject(new Error("Preview startup timeout")), 10000);
      child.on("error", error => { clearTimeout(timer); reject(error); });
      child.on("exit", code => { clearTimeout(timer); reject(new Error(`Preview exited: ${code}`)); });
      child.stdout.on("data", chunk => {
        buffer += chunk;
        if (!buffer.includes("\n")) return;
        try { const ready = JSON.parse(buffer.split("\n")[0]); clearTimeout(timer); resolve(new URL(ready.url).origin); }
        catch (error) { clearTimeout(timer); reject(error); }
      });
    });
    const { chromium } = playwright();
    const executablePath = [process.env.DEEP_DIVE_BROWSER_PATH, chromium.executablePath(), "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(file => file && fs.existsSync(file));
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    for (const [label, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport, javaScriptEnabled: false });
      const page = await context.newPage();
      const response = await page.goto(`${origin}/preview/zh/concepts/supervised-learning/`);
      assert.equal(response.status(), 200);
      assert.match(response.headers()["x-robots-tag"], /noindex/);
      assert.equal(await page.locator("h1").textContent(), snapshot.page.title);
      for (const tag of ["section", "figure", "table", "details"]) {
        const expected = (snapshot.page.html.match(new RegExp(`<${tag}\\b`, "g")) || []).length;
        assert.equal(await page.locator(`#dd-article ${tag}`).count(), expected, `${label}: preserved ${tag}`);
      }
      assert.equal(await page.locator("script").count(), 0);
      assert.equal(await page.locator('html').getAttribute("lang"), "zh-Hans");
      assert.ok(await page.locator(".dd-sec p").first().evaluate(element => parseFloat(getComputedStyle(element).fontSize)) >= 16, "Main body font respects the preview reading size.");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: page overflow`);
      await page.screenshot({ path: path.join(outputRoot, `${label}.png`) });
      const details = page.locator("details").first();
      if (await details.count()) {
        await details.locator("summary").click();
        assert.equal(await details.getAttribute("open"), "", "Native self-test disclosure works without JavaScript.");
      }
      await page.locator(".preview-map").click();
      assert.equal(new URL(page.url()).hash, "#/map/supervised-learning");
      await page.goBack();
      assert.equal(await page.locator("h1").textContent(), snapshot.page.title);
      const privateCopy = await context.request.get(`${origin}/.tmp/website-preview/supervised-learning.snapshot.json`);
      assert.equal(privateCopy.status(), 404, "Snapshot metadata is not served.");
      await context.close();
    }
    console.log("PASS: actual snapshot standalone preview; no-JS desktop/mobile reading, preserved figures/tables/self-test, map link/back and private snapshot isolation.");
  } finally {
    if (browser) await browser.close();
    child.kill();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
