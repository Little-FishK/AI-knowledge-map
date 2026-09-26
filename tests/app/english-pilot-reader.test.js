"use strict";
// Actual MCP-exported candidate, isolated transport. The approval flag below is
// test-only: it exercises the release reader without writing a publication.
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os"), http = require("node:http"), crypto = require("node:crypto");
const root = path.resolve(__dirname, "../.."), output = path.join(root, ".tmp/website-preview");
let chromium;
try { ({ chromium } = require("playwright")); } catch (_) { ({ chromium } = require(require.resolve("playwright", { paths: [path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node")] }))); }
const value = JSON.parse(fs.readFileSync(path.join(output, "supervised-learning.english-candidate.json"), "utf8"));
const snapshot = JSON.parse(fs.readFileSync(path.join(output, "supervised-learning.snapshot.json"), "utf8"));
require("../../tools/readiness/render-english-pilot").render(value, snapshot); // integrity/source guard
const source = snapshot.page, translated = value.candidate.payload.page;
const envelope = { ...value.candidate, status: "human-approved" };
const files = ["assets/style.css", "assets/app/runtime-loader.js", "assets/app/deepdive-view.js", "data/locales/en/ui.js", "data/locales/zh-Hans/ui.js"];
const content = new Map(files.map(file => ["/" + file, fs.readFileSync(path.join(root, file))]));
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/style.css"><title>Isolated candidate acceptance</title>
<button id="open">Open sample</button><div id="deepdive" class="hidden"><header class="dd-top"><button id="dd-back">Back</button><span id="dd-top-name"></span><select id="language" aria-label="Language"><option value="en">English</option><option value="zh-Hans">简体中文</option></select><button id="dd-close">Close</button></header><div class="dd-scroll"><article id="dd-article"></article></div></div>
<script src="/data/locales/en/ui.js"></script><script src="/data/locales/zh-Hans/ui.js"></script><script src="/assets/app/runtime-loader.js"></script><script src="/assets/app/deepdive-view.js"></script><script>
let locale='en';window.DEEPDIVE={};const id='supervised-learning';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=key=>window.AI_LOCALES[locale].messages[key]||key;
const ids=new Set([id]);const loader=AIMap.createDeepDiveLoader({runtime:{base:'/source'},ids,registry:DEEPDIVE,revision:'isolated-candidate',t,getLocale:()=>locale,englishTimeoutMs:500});
const view=AIMap.createDeepDiveView({element:document.getElementById('deepdive'),ids,byId:{},escapeHtml:esc,ensurePage:loader.ensure,renderLearning:()=>'',bindLearning:()=>{},preloadNeighbors:()=>{},router:{parse:()=>({name:'concept',id})},navigate:route=>{history.replaceState(null,'','/?node='+encodeURIComponent(route.id));view.close();},t});
document.getElementById('open').onclick=()=>{history.replaceState(null,'','/?concept='+encodeURIComponent(id));view.open(id);};
document.getElementById('language').onchange=event=>{locale=event.target.value;document.documentElement.lang=locale;view.open(id);};
</script></html>`;
let mode = "approved", browser, server;
const checks = [];
(async () => {
  server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/") return res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
    if (pathname === "/source/supervised-learning.js") return res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" }).end(`window.DEEPDIVE["supervised-learning"]=${JSON.stringify(source)};`);
    if (pathname === "/data/content-locales/en/deepdive/supervised-learning.json") {
      if (mode === "missing") return res.writeHead(404).end();
      if (mode === "invalid") return res.writeHead(200).end("invalid JSON");
      const data = JSON.parse(JSON.stringify(envelope));
      if (mode === "unapproved") data.status = "draft";
      if (mode === "tampered") data.payload.page.title = "Tampered";
      if (mode === "stale") { data.payload.sourceContentHash = "sha256:obsolete"; data.artifactHash = "sha256:" + crypto.createHash("sha256").update(JSON.stringify(data.payload)).digest("hex"); }
      const send = () => res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(data));
      return mode === "slow" ? setTimeout(send, 900) : send();
    }
    if (content.has(pathname)) return res.writeHead(200, { "Content-Type": pathname.endsWith("css") ? "text/css" : "text/javascript; charset=utf-8" }).end(content.get(pathname));
    res.writeHead(204).end();
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const title = text => page.getByRole("heading", { level: 1, name: text, exact: true }).waitFor();
  const open = async () => { await page.goto(origin); await page.locator("#open").click(); };
  const check = async (name, action) => { await action(); checks.push(name); console.log("PASS " + name); };
  await check("complete actual English, protected code and reference URLs", async () => {
    await open(); await title(translated.title);
    assert.equal(await page.locator("#dd-article").getAttribute("lang"), "en");
    assert.equal(await page.locator("#dd-article svg").count(), 2);
    assert.equal(await page.locator("#dd-article table").count(), 7);
    const dom = await page.evaluate(html => { const div = document.createElement('div'); div.innerHTML = html; return { codes: [...div.querySelectorAll('code')].map(x => x.outerHTML), links: [...div.querySelectorAll('a[href^="http"]')].map(x => x.href) }; }, translated.html);
    assert.deepEqual(await page.locator("#dd-article code").evaluateAll(xs => xs.map(x => x.outerHTML)), dom.codes);
    assert.deepEqual(await page.locator('#dd-article a[href^="http"]').evaluateAll(xs => xs.map(x => x.href)), dom.links);
    await page.locator("summary").click(); assert(await page.locator("details").getAttribute("open") !== null);
  });
  await check("same concept Chinese/English switch; exact Chinese body restored", async () => {
    await page.locator("#language").selectOption("zh-Hans"); await title(source.title);
    assert.equal(await page.locator(".dd-split-legend").count(), 0);
    assert(await page.locator("#dd-article").evaluate((article, html) => { const div = document.createElement("div"); div.innerHTML = html; return article.innerHTML.includes(div.innerHTML); }, source.html));
    await page.locator("#language").selectOption("en"); await title(translated.title);
    assert.equal(await page.locator(".dd-split-legend dt").count(), 3);
  });
  for (const size of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) await check(`actual resources ${size.width}px`, async () => {
    await page.setViewportSize(size); await open(); await title(translated.title);
    assert(await page.locator(".dd-scroll").evaluate(x => x.scrollWidth <= x.clientWidth + 1));
    const diagrams = await page.locator(".dd-diagram-scroll svg").evaluateAll(xs => xs.map(svg => {
      const labels = [...svg.querySelectorAll('text')].filter(x => getComputedStyle(x).display !== 'none').map(x => { const r = x.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, height: r.height }; });
      const r = svg.getBoundingClientRect(); return { labels, left: r.left, right: r.right };
    }));
    for (const diagram of diagrams) for (const [i, label] of diagram.labels.entries()) {
      assert(label.height >= 12 && label.x >= diagram.left - 1 && label.right <= diagram.right + 1);
      for (const other of diagram.labels.slice(i + 1)) assert(!(label.x < other.right && label.right > other.x && label.y < other.bottom && label.bottom > other.y), "overlapping SVG labels");
    }
    if (size.width < 600) {
      const scroll = page.locator(".dd-diagram-scroll").first(); await scroll.focus(); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(300);
      assert(await scroll.evaluate(x => x.scrollLeft > 0));
      const tables = await page.locator(".dd-table-wrap, .dd-sec > .dd-table").evaluateAll(xs => xs.map(x => x.scrollWidth > x.clientWidth));
      assert.equal(tables.length, 7); assert(tables.every(Boolean));
    }
    await page.locator(".dd-scroll").evaluate(x => x.scrollTop = 0);
    await page.screenshot({ path: path.join(output, `reader-${size.width}.png`) });
  });
  for (const failure of ["missing", "invalid", "unapproved", "tampered", "stale", "slow"]) await check(`${failure}: complete Chinese fallback`, async () => {
    mode = failure; await open(); await title(source.title);
    assert.equal(await page.locator("#dd-article").getAttribute("lang"), "zh-Hans");
    assert.equal(await page.locator(".dd-language-notice").count(), 1);
    assert.equal(await page.locator(".dd-split-legend").count(), 0);
    assert(await page.locator("#dd-article").evaluate((article, html) => { const div = document.createElement("div"); div.innerHTML = html; return article.innerHTML.includes(div.innerHTML); }, source.html));
  });
  await check("late response cannot overwrite Chinese or reopen closed reader", async () => {
    mode = "slow"; await open(); await page.locator("#language").selectOption("zh-Hans"); await title(source.title);
    await page.waitForTimeout(1000); assert.equal(await page.locator("h1").textContent(), source.title);
    await open(); await page.locator("#dd-close").click(); await page.waitForTimeout(1000); assert(await page.locator("#deepdive").isHidden());
  });
  await check("back, close, Escape preserve map target; reopen works", async () => {
    mode = "approved";
    for (const action of ["#dd-back", "#dd-close", "Escape"]) {
      await open(); await title(translated.title);
      if (action === "Escape") await page.keyboard.press(action); else await page.locator(action).click();
      assert(await page.locator("#deepdive").isHidden()); assert(new URL(page.url()).searchParams.get("node") === "supervised-learning");
    }
  });
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(output, "reader-acceptance.json"), JSON.stringify({ artifactHash: value.candidate.artifactHash, checks, pageErrors: errors, publicationAllowed: false, scope: "Actual candidate in production loader/view with isolated transport and simulated eligibility; no human acceptance or public deployment", implementationHashes: Object.fromEntries(files.map(file => [file, crypto.createHash("sha256").update(content.get('/' + file)).digest('hex')])) }, null, 2));
  console.log(`${checks.length} checks passed; no publication or paid API call.`);
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); });

