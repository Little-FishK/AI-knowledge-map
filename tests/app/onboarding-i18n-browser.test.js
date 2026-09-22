'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '../..');
let playwright;
try { playwright = require('playwright'); }
catch (_) { playwright = require(require.resolve('playwright', {paths: [path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]})); }
const {chromium} = playwright;
const executablePath = [process.env.DEEP_DIVE_BROWSER_PATH, chromium.executablePath(), 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => p && fs.existsSync(p));
const key = 'ai-knowledge-map.onboarding.v1';
const fixtureManifest = 'window.DEEPDIVE_RUNTIME={base:"data/deepdive-runtime",ids:["supervised-learning"],revision:"onboarding-test"};';
const fixturePage = 'window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE["supervised-learning"]={title:"Navigation fixture",html:"<p>Navigation fixture</p>"};';
// Only public UI/data are served; Stage 2 bodies are replaced with a synthetic navigation fixture.
const server = http.createServer((request, response) => {
  const relative = new URL(request.url, 'http://localhost').pathname.replace(/^\/+/, '') || 'index.html';
  if (relative === 'data/deepdive-runtime/manifest.js') return response.writeHead(200, {'Content-Type':'text/javascript'}).end(fixtureManifest);
  if (relative === 'data/deepdive-runtime/supervised-learning.js') return response.writeHead(200, {'Content-Type':'text/javascript'}).end(fixturePage);
  const allowed = relative === 'index.html' || relative.startsWith('assets/') || relative === 'data/graph.js' || relative.startsWith('data/locales/') || relative === 'data/content-locales/en/graph.js' || /^data\/(software|tutorials[^/]*|library[^/]*)\.js$/.test(relative);
  const file = path.resolve(root, relative);
  if (!allowed || !file.startsWith(root + path.sep)) return response.writeHead(404).end();
  fs.readFile(file, (error, body) => {
    if (error) return response.writeHead(404).end();
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/html';
    response.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store'}).end(body);
  });
});
async function fixtureRoutes(context) {
  await context.route('**/data/deepdive-runtime/manifest.js', route => route.fulfill({contentType:'text/javascript',body:fixtureManifest}));
  await context.route('**/data/deepdive-runtime/supervised-learning.js', route => route.fulfill({contentType:'text/javascript',body:fixturePage}));
  await context.route('https://**/*', route => route.abort());
}
async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch({executablePath, headless: true});
  const errors = [];
  const shots = path.join(root, '.tmp', 'onboarding-qa');
  fs.mkdirSync(shots, {recursive:true});
  try {
    for (const width of [1440, 375]) {
      const bilingual = await browser.newContext({viewport:{width,height:1000}});
      await fixtureRoutes(bilingual);
      const en = await bilingual.newPage();
      en.on('pageerror',e=>errors.push(e.message));
      await en.goto(base + '?lang=en');
      await en.waitForFunction(()=>!!window.AI_SETTINGS);
      assert.equal(await en.locator('#onboarding').getAttribute('lang'),'en');
      assert.equal(await en.locator('.onboarding-route').evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length),width===1440?3:2);
      assert(!/[\u3400-\u9fff]/u.test(await en.locator('#onboarding').innerText()));
      await en.screenshot({path:path.join(shots,`english-${width}.png`),fullPage:true});
      for (let i=0;i<6;i++) {
        await en.locator(`[data-visit="${i}"]`).click();
        assert(!/[\u3400-\u9fff]/u.test(await en.locator('#onboarding').innerText()));
        assert.equal(await en.locator('.dd-sec').count(),3);
        assert.equal(await en.evaluate(()=>document.querySelector('#onboarding').scrollWidth<=innerWidth),true);
        assert.deepEqual(await en.locator('.dd-fig svg text').evaluateAll(nodes=>nodes.filter(n=>{const b=n.getBBox();return b.x<0||b.x+b.width>336;}).map(n=>n.textContent)),[], 'diagram labels fit their cards');
        if(i===2) {
          await en.locator('.dd-fig').scrollIntoViewIfNeeded();
          await en.screenshot({path:path.join(shots,`english-lesson-${width}.png`)});
          await en.locator('[data-settings]').click();
          await en.locator('#settings-language-select').selectOption('zh-Hans');
          await en.waitForFunction(()=>document.querySelector('#onboarding').lang==='zh-Hans');
          assert.equal(await en.locator('#onboarding-lesson-title').textContent(),'怎样让AI听明白我的意思？');
          await en.locator('#settings-language-select').selectOption('en');
          await en.waitForFunction(()=>document.querySelector('#onboarding').lang==='en');
          await en.locator('#settings-close').click();
          assert.equal(await en.locator('[data-settings]').evaluate(n=>n===document.activeElement),true);
          assert.equal(await en.evaluate(k=>JSON.parse(localStorage.getItem(k)).read,key),2);
          assert.equal(await en.locator('#onboarding-lesson-title').textContent(),'How do I help AI understand what I mean?');
        }
        await en.locator('[data-read]').click();
      }
      assert.equal(await en.evaluate(k=>JSON.parse(localStorage.getItem(k)).read,key),6);
      await bilingual.close();
    }
    assert.deepEqual(errors,[]);
    console.log('PASS bilingual onboarding: six lessons, language switching, progress, desktop/mobile layout and diagram bounds');
  } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
