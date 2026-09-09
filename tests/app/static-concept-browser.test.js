'use strict';
const assert=require('assert/strict'),path=require('path'),fs=require('fs'),os=require('os'),{spawn}=require('child_process');
const {chromium}=require(require.resolve('playwright',{paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
const root=path.resolve(__dirname,'../..');
(async()=>{
 const child=spawn(process.execPath,[path.join(root,'tools/run-public-site-preview.js'),'0'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});let browser;
 try{
 const origin=await new Promise((resolve,reject)=>{let buffer='';child.stdout.on('data',chunk=>{buffer+=chunk;if(buffer.includes('\n'))resolve(new URL(JSON.parse(buffer.trim()).url).origin);});child.on('error',reject);});
 browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[];
 for(const width of [1440,390]){
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const locale of ['zh','en']){
   const url=origin+'/AI-knowledge-map/'+locale+'/concepts/supervised-learning/';const response=await page.goto(url);assert.equal(response.status(),200);
   assert.equal(await page.locator('html').getAttribute('lang'),locale==='en'?'en':'zh-Hans');
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://little-fishk.github.io/AI-knowledge-map/'+locale+'/concepts/supervised-learning/');
   assert.equal(await page.locator('link[rel=alternate]').count(),2);assert.equal(await page.locator('meta[name=robots]').count(),0);
   assert.equal(await page.locator('svg').count(),2);assert.equal(await page.locator('table').count(),7);assert.equal(await page.locator('code').count(),31);
   assert.equal(await page.locator('script:not([type="application/ld+json"])').count(),0);
   const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.equal(schema['@type'],'LearningResource');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.locator('summary').click();assert.notEqual(await page.locator('details').getAttribute('open'),null);
   if(locale==='en'){assert.equal(await page.locator('.preview-split-legend dt').count(),3);if(width===390){const scroll=page.locator('.preview-diagram-scroll').first();await scroll.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);assert(await scroll.evaluate(x=>x.scrollLeft>0));}}
   await page.screenshot({path:path.join(root,'.tmp/website-preview',`static-${locale}-${width}.png`)});
   await page.locator('.preview-header a[lang]').click();assert(page.url().includes('/'+(locale==='en'?'zh':'en')+'/concepts/supervised-learning/'));
   console.log('PASS no-JS static '+locale+' '+width+'px; metadata, resources, native self-test, language link');
  }
  await context.close();
 }
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/AI-knowledge-map/en/concepts/supervised-learning/');await page.locator('.preview-next a').first().click();await page.waitForFunction(()=>window.__cy?.nodes('.sel').map(n=>n.id()).join()==='supervised-learning');
 await page.locator('[data-dd="supervised-learning"]').click();await page.locator('#dd-article[lang="en"] h1').waitFor();await page.locator('.dd-static-link').click();assert(page.url().endsWith('/AI-knowledge-map/en/concepts/supervised-learning/'));
 const sitemap=await page.request.get(origin+'/AI-knowledge-map/sitemap-concepts.xml');assert.equal(sitemap.status(),200);assert((await sitemap.text()).includes('/en/concepts/supervised-learning/'));
 const privateResponse=await page.request.get(origin+'/.stage2/state.json');assert.equal(privateResponse.status(),404);
 assert.deepEqual(errors,[]);console.log('PASS actual static → selected map → English reader → static; sitemap and private file isolation');
 }finally{if(browser)await browser.close();child.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});

