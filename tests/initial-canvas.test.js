const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os');
const {apply,markup}=require('../tools/readiness/initial-canvas');
const {chromium}=require(require.resolve('playwright',{paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
const original='<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://example.test/style.css"></head><body><h1>Reading</h1><p>Content unchanged</p></body></html>',fixed=apply(original);
assert.equal(apply(fixed),fixed);assert(fixed.indexOf(markup)<fixed.indexOf('<link'));assert.equal(fixed.replace(markup,''),original);
assert(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').includes(markup));
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({colorScheme:'light'});await page.route('https://example.test/style.css',route=>route.abort());
 await page.setContent(original);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),'rgba(0, 0, 0, 0)');
 await page.setContent(fixed);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),'rgb(20, 22, 26)');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),'dark');
 assert.equal(await page.locator('h1').textContent(),'Reading');
 await page.emulateMedia({media:'print'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),'rgb(255, 255, 255)');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),'light');
 console.log('PASS critical dark canvas without external CSS, unchanged content, idempotence and light printing');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
