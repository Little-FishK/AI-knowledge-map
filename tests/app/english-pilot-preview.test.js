"use strict";

// Integration against the local MCP-derived snapshot; never reads Stage 2 files.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");
const { render } = require("../../tools/readiness/render-english-pilot");
const outputRoot = path.join(PROJECT_ROOT, ".tmp", "website-preview");

function playwright() {
  try { return require("playwright"); }
  catch (_) { return require(require.resolve("playwright", { paths: [path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node")] })); }
}

async function main() {

  const source = JSON.parse(fs.readFileSync(path.join(outputRoot, "supervised-learning.snapshot.json"), "utf8"));
  const value = JSON.parse(fs.readFileSync(path.join(outputRoot, "supervised-learning.english-candidate.json"), "utf8"));
  const snapshot = { page: value.candidate.payload.page };
  assert.deepEqual(snapshot.page.html.match(/<code\b[^>]*>[\s\S]*?<\/code>/g), source.page.html.match(/<code\b[^>]*>[\s\S]*?<\/code>/g), "Protected code/formula fragments remain byte-identical");
  const html = render(value, source);
  const withoutPresentation = html.replace(/<dl class="preview-split-legend"[\s\S]*?<\/dl>/g, "")
    .replace(/<div class="preview-diagram-scroll"[^>]*>(<svg\b[\s\S]*?<\/svg>)<\/div><p class="preview-diagram-hint">[^<]*<\/p>/g, "$1");
  assert.ok(withoutPresentation.includes(`<!-- source-body:start -->${snapshot.page.html}<!-- source-body:end -->`), "Controller candidate remains intact apart from labelled presentation additions.");
  assert.throws(() => render({ ...value, publicationAllowed: true }, source), /integrity/);
  assert.throws(() => render(value, { ...source, snapshotId: "wrong" }), /source mismatch/);
  const output = path.join(outputRoot, "pages/en/concepts/supervised-learning/index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, html);
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
      const response = await page.goto(`${origin}/preview/en/concepts/supervised-learning/`);
      assert.equal(response.status(), 200);
      assert.match(response.headers()["x-robots-tag"], /noindex/);
      assert.equal(await page.locator("h1").textContent(), snapshot.page.title);
      for (const tag of ["section", "figure", "svg", "table", "details"]) {
        const expected = (snapshot.page.html.match(new RegExp(`<${tag}\\b`, "g")) || []).length;
        assert.equal(await page.locator(`#dd-article ${tag}`).count(), expected, `${label}: preserved ${tag}`);
      }
      assert.equal(await page.locator("script").count(), 0);
      assert.equal(await page.locator('html').getAttribute("lang"), "en");
      assert.ok(await page.locator(".dd-sec p").first().evaluate(element => parseFloat(getComputedStyle(element).fontSize)) >= 16, "Main body font respects the preview reading size.");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: page overflow`);
      const diagrams = await page.locator("article svg").evaluateAll(svgs => svgs.map(svg => {
        const outer = svg.getBoundingClientRect();
        const labels = [...svg.querySelectorAll("text")].filter(el => getComputedStyle(el).display !== "none").map(el => {
          const r = el.getBoundingClientRect(); return { text: el.textContent, left: r.left, top: r.top, right: r.right, bottom: r.bottom, height: r.height };
        });
        return { readable: labels.every(r => r.height >= 12), clipped: labels.some(r => r.left < outer.left - 1 || r.right > outer.right + 1 || r.top < outer.top - 1 || r.bottom > outer.bottom + 1),
          overlap: labels.some((a, i) => labels.slice(i + 1).some(b => Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)) };
      }));
      assert.ok(diagrams.every(d => d.readable && !d.clipped && !d.overlap), `${label}: diagram labels readable without clipping or overlap`);
      assert.equal(await page.locator(".preview-split-legend dt").count(), 3);
      if (label === "mobile") {
        const scroll = page.locator(".preview-diagram-scroll").first();
        await scroll.focus(); await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(300); // Allow native smooth scrolling; page scripts remain disabled.
        assert.ok(await scroll.evaluate(el => el.scrollLeft > 0), "Focused diagram scrolls with the keyboard");
        assert.equal(await page.locator(".dd-table-wrap, .dd-sec > .dd-table").count(), 7);
        assert.ok(await page.locator(".dd-table-wrap, .dd-sec > .dd-table").evaluateAll(wrappers => wrappers.every(el => el.scrollWidth > el.clientWidth && getComputedStyle(el).overflowX === "auto")), "All seven tables retain usable column widths with local scrolling");
        const tableScroll = page.locator(".dd-table-wrap").first();
        await tableScroll.focus(); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(300);
        assert.ok(await tableScroll.evaluate(el => el.scrollLeft > 0), "Table columns are reachable using the keyboard");
      }
      await page.screenshot({ path: path.join(outputRoot, `english-${label}.png`) });
      const details = page.locator("details").first();
      if (await details.count()) {
        await details.locator("summary").click();
        assert.equal(await details.getAttribute("open"), "", "Native self-test disclosure works without JavaScript.");
      }
      await page.locator('.preview-next a[href*="node=supervised-learning"]').click();
      assert.equal(new URL(page.url()).searchParams.get("node"), "supervised-learning");
      await page.goBack();
      assert.equal(await page.locator("h1").textContent(), snapshot.page.title);
      const privateCopy = await context.request.get(`${origin}/.tmp/website-preview/supervised-learning.snapshot.json`);
      assert.equal(privateCopy.status(), 404, "Snapshot metadata is not served.");
      await context.close();
    }
    console.log("PASS: actual unpublished English candidate preview; no-JS desktop/mobile reading, readable diagrams, scrollable tables, protected code, keyboard navigation and private snapshot isolation.");
  } finally {
    if (browser) await browser.close();
    child.kill();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

