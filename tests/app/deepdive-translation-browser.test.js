"use strict";
const assert = require("assert/strict"), fs = require("fs"), path = require("path"), os = require("os"), http = require("http");
const { chromium } = require("playwright");
const { pathToFileURL } = require("url");
const { fixture, hash } = require("../stage2/translation-publication-fixture");
const { assemble } = require("../../tools/deepdive-stage2/lib/translation-publication");
const root = path.resolve(__dirname, "../..");
const source = fixture().snapshot.capture.page;
const envelope = { ...assemble(fixture()), status: process.argv.includes('--machine-reviewed') ? 'machine-reviewed' : 'human-approved' };
const files = ["assets/style.css", "assets/app/runtime-loader.js", "assets/app/deepdive-view.js", "data/locales/en/ui.js", "data/locales/zh-Hans/ui.js"];
const content = new Map(files.map(file => [`/${file}`, fs.readFileSync(path.join(root, file))]));
const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), "translation-browser-stage9-"));
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/style.css"><title>Stage 9 isolated fixture</title>
<button id="open">Open fixture</button><div id="deepdive" class="hidden"><header class="dd-top"><button id="dd-back" class="dd-back">Back</button><span id="dd-top-name" class="dd-top-name"></span><button id="settings" class="dd-back">Language</button><select id="language" aria-label="Language" hidden><option value="en">English</option><option value="zh-Hans">简体中文</option></select><button id="dd-close" class="dd-x">×</button></header><div class="dd-scroll"><article id="dd-article"></article></div></div>
<script src="/data/locales/en/ui.js"></script><script src="/data/locales/zh-Hans/ui.js"></script><script src="/assets/app/runtime-loader.js"></script><script src="/assets/app/deepdive-view.js"></script>
<script>
let locale='en'; window.DEEPDIVE={};
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=key=>window.AI_LOCALES[locale].messages[key]||key;
const ids=new Set(['sample']);
const loader=AIMap.createDeepDiveLoader({runtime:{base:'/source'},ids,registry:DEEPDIVE,revision:'fixture',t,getLocale:()=>locale,englishTimeoutMs:500});
const view=AIMap.createDeepDiveView({element:document.getElementById('deepdive'),ids,byId:{},escapeHtml:esc,ensurePage:loader.ensure,renderLearning:()=>'',bindLearning:()=>{},preloadNeighbors:()=>{},router:{parse:()=>({name:'map'})},navigate:()=>view.close(),t});
document.getElementById('open').onclick=()=>view.open('sample');
document.getElementById('settings').onclick=()=>document.getElementById('language').hidden=false;
document.getElementById('language').onchange=event=>{locale=event.target.value;document.documentElement.lang=locale;view.open('sample');};
</script></html>`;
let mode = "approved", sourceMode = "normal", browser, server;
let count = 0;
async function test(name, action) { await action(); count++; console.log(`PASS ${name}`); }
(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname === "/") return res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
    if (url.pathname === "/source/sample.js") {
      const page = { ...source };
      if (sourceMode === "provisional") page.publication = { status: "published-provisional", blockerCount: 2 };
      if (sourceMode === "changed") page.title = "原文已经更新";
      return res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" }).end(`window.DEEPDIVE.sample=${JSON.stringify(page)};`);
    }
    if (url.pathname === "/data/content-locales/en/deepdive/sample.json") {
      if (mode === "missing") return res.writeHead(404).end();
      if (mode === "invalid") return res.writeHead(200).end("invalid JSON");
      const data = JSON.parse(JSON.stringify(envelope));
      if (mode === "tampered") data.payload.page.title = "Tampered";
      if (mode === "unapproved") data.status = "draft";
      if (mode === "incomplete") { delete data.payload.page.html; data.artifactHash = hash(data.payload); }
      const send = () => res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(data));
      if (mode === "slow") return setTimeout(send, 900);
      return send();
    }
    if (content.has(url.pathname)) return res.writeHead(200, { "Content-Type": url.pathname.endsWith(".css") ? "text/css" : "text/javascript; charset=utf-8" }).end(content.get(url.pathname));
    res.writeHead(204).end();
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch({ channel: process.env.TRANSLATION_BROWSER_CHANNEL || "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  const url = `http://127.0.0.1:${server.address().port}`;
  const open = async () => { await page.goto(url); await page.locator("#open").click(); };
  const title = expected => page.locator("h1").filter({ hasText: expected }).waitFor();
  await test("approved English loads all sections with native self-test and anchor navigation", async () => {
    await open(); await title("Example mechanism"); assert.equal(await page.locator("#dd-article").getAttribute("lang"), "en");
    await page.getByText("See the self-test", { exact: true }).click(); assert(page.url().endsWith("#check"));
    await page.locator("summary").click(); assert(await page.getByText("Answer: no", { exact: true }).isVisible());
    assert.equal(await page.locator("code").textContent(), "const value = 2;");
    assert.equal(await page.locator("svg text").textContent(), "Input → Output");
    await page.locator(".dd-scroll").evaluate(element => { element.scrollTop = 0; });
    await page.screenshot({ path: path.join(artifacts, "desktop-english.png") });
  });
  await test("Language control switches entire page both ways", async () => {
    await page.locator("#settings").click(); await page.locator("#language").selectOption("zh-Hans"); await title("示例机制");
    assert.equal(await page.locator("#dd-article").getAttribute("lang"), "zh-Hans");
    await page.locator("#language").selectOption("en"); await title("Example mechanism");
  });
  for (const failure of ["missing", "invalid", "tampered", "unapproved", "incomplete", "slow"]) await test(`${failure} English falls back to the complete Chinese page`, async () => {
    mode = failure; await open(); await title("示例机制"); assert.equal(await page.locator(".dd-language-notice").count(), 1);
    assert.equal(await page.locator("#dd-article").getAttribute("lang"), "zh-Hans"); assert.equal(await page.locator("svg text").textContent(), "输入 → 输出");
  });
  await test("late English cannot overwrite a newer Chinese selection", async () => {
    mode = "slow"; await open(); await page.locator("#settings").click(); await page.locator("#language").selectOption("zh-Hans");
    await title("示例机制"); await page.waitForTimeout(1000); assert.equal(await page.locator("h1").textContent(), "示例机制");
  });
  await test("changed Chinese invalidates English; provisional marker survives fallback", async () => {
    mode = "approved"; sourceMode = "changed"; await open(); await title("原文已经更新"); assert.equal(await page.locator(".dd-language-notice").count(), 1);
    sourceMode = "provisional"; await open(); await title("示例机制"); assert.equal(await page.locator(".dd-provisional-notice").count(), 1);
    assert.equal(await page.locator(".dd-language-notice").count(), 1);
  });
  await test("mobile English and fallback layout; close/back/Escape work", async () => {
    sourceMode = "normal"; mode = "approved"; await page.setViewportSize({ width: 390, height: 844 }); await open(); await title("Example mechanism");
    assert(await page.locator(".dd-scroll").evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    await page.screenshot({ path: path.join(artifacts, "mobile-english.png") });
    await page.locator("#dd-close").click(); assert(await page.locator("#deepdive").isHidden());
    mode = "missing"; await page.locator("#open").click(); await title("示例机制");
    assert(await page.locator(".dd-scroll").evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    await page.screenshot({ path: path.join(artifacts, "mobile-fallback.png") });
    await page.locator("#dd-back").click(); assert(await page.locator("#deepdive").isHidden());
    await page.locator("#open").click(); await title("示例机制"); await page.keyboard.press("Escape"); assert(await page.locator("#deepdive").isHidden());
  });
  await test("direct file opening retains the complete Chinese page without English fetch", async () => {
    const local = html.replaceAll('="/assets/', `="${pathToFileURL(path.join(root, "assets")).href}/`)
      .replaceAll('="/data/', `="${pathToFileURL(path.join(root, "data")).href}/`)
      .replace("window.DEEPDIVE={};", `window.DEEPDIVE={sample:${JSON.stringify(source)}};`);
    const file = path.join(artifacts, "offline-fixture.html"); fs.writeFileSync(file, local);
    await page.goto(pathToFileURL(file).href); await page.locator("#open").click(); await title("示例机制");
    assert.equal(await page.locator(".dd-language-notice").count(), 1);
  });
  assert.deepEqual(errors, []);
  console.log(`${count} isolated browser tests passed. Screenshots: ${artifacts}`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); });
