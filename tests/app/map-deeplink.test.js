"use strict";

// Navigation integration only. Serve a synthetic deep-dive fixture so this test
// never opens Stage 2 page sources, runtime bodies, translations or audit data.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");

function playwright() {
  try { return require("playwright"); }
  catch (_) {
    return require(require.resolve("playwright", { paths: [path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node")] }));
  }
}

function respond(request, response) {
  let relative;
  try { relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/AI-knowledge-map(?=\/)/, "").replace(/^\/+/, "") || "index.html"; }
  catch (_) { response.writeHead(400).end(); return; }
  if (relative === "favicon.ico") { response.writeHead(204).end(); return; }
  if (relative === "data/deepdive-runtime/manifest.js") {
    response.writeHead(200, { "Content-Type": "text/javascript" }).end('window.DEEPDIVE_RUNTIME={base:"data/deepdive-runtime",ids:["supervised-learning","neural-network"],revision:"navigation-fixture"};');
    return;
  }
  if (/^data\/deepdive-runtime\/(supervised-learning|neural-network)\.js$/.test(relative)) {
    const id = path.basename(relative, ".js");
    response.writeHead(200, { "Content-Type": "text/javascript" }).end(`window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE[${JSON.stringify(id)}]={title:"Navigation fixture",html:"<p>Navigation fixture</p>"};`);
    return;
  }
  const allowed = relative === "index.html" || relative.startsWith("assets/") || relative === "data/graph.js"
    || relative.startsWith("data/locales/") || relative === "data/content-locales/en/graph.js";
  const file = path.resolve(PROJECT_ROOT, relative);
  if (!allowed || !file.startsWith(PROJECT_ROOT + path.sep)) { response.writeHead(404).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { "Content-Type": file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "text/html", "Cache-Control": "no-store" }).end(body);
  });
}

async function exercise(browser, base, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await context.addInitScript(() => localStorage.setItem("ai-knowledge-map.locale.v1", "zh-Hans"));
  const hash = expected => page.waitForFunction(value => location.hash === value, expected);
  const selected = id => page.waitForFunction(value => window.__cy?.nodes(".sel").map(node => node.id()).join() === value, id);
  try {
    await page.goto(`${base}?lang=en#/map/supervised-learning`);
    await selected("supervised-learning");
    await page.waitForFunction(() => document.documentElement.lang === "en");
    assert.match(await page.title(), /Supervised/);
    await page.reload();
    await selected("supervised-learning");

    // Manual choice overrides the query too, so reloading preserves the choice.
    await page.locator("#btn-settings").click();
    await page.locator("#settings-language-select").selectOption("zh-Hans");
    await page.waitForFunction(() => new URL(location.href).searchParams.get("lang") === "zh-Hans");
    await page.reload();
    await selected("supervised-learning");
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-Hans");

    await page.locator("#search").fill("神经网络");
    await page.locator('#search-results [data-id="neural-network"]').click();
    await hash("#/map/neural-network");
    await selected("neural-network");
    await page.locator('[data-dd="neural-network"]').click();
    await hash("#/concept/neural-network");
    await page.locator("#deepdive h1").filter({ hasText: "Navigation fixture" }).waitFor();
    await page.goBack();
    await hash("#/map/neural-network");
    await selected("neural-network");
    await page.goForward();
    await hash("#/concept/neural-network");
    await page.locator("#dd-back").click();
    await hash("#/map/neural-network");
    await selected("neural-network");
    await page.locator("#detail-close").click();
    await hash("#/map");
    await selected("");

    await page.goto(`${base}#/map/not-a-real-node`);
    await hash("#/map");
    await page.waitForFunction(() => Boolean(window.__cy));
    await selected("");
    // Preserve existing ordinary exploration semantics.
    await page.locator("#search").fill("神经网络");
    await page.locator('#search-results [data-id="neural-network"]').click();
    await selected("neural-network");
    assert.equal(new URL(page.url()).hash, "#/map");
    await page.goto(`${base}#/map/supervised-learning`);
    await selected("supervised-learning");
    await page.locator("#btn-reset").click();
    await hash("#/map");
    await selected("");
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}

async function main() {
  const { chromium } = playwright();
  const executablePath = [process.env.DEEP_DIVE_BROWSER_PATH, chromium.executablePath(), "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(file => file && fs.existsSync(file));
  const server = http.createServer(respond);
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const origin = `http://127.0.0.1:${server.address().port}`;
    await exercise(browser, `${origin}/`, { width: 1440, height: 900 });
    await exercise(browser, `${origin}/AI-knowledge-map/`, { width: 390, height: 844 });
    console.log("PASS: map deep links, language overrides, reload, history, return, reset and invalid IDs (desktop root + mobile project subpath; synthetic content only).");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
