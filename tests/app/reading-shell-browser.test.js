'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(require.resolve('playwright',{paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
const root=path.resolve(process.argv[2]);
const server=http.createServer((req,res)=>{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'');
  if(!name || name.endsWith('/'))name+='index.html';
  const file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep))return res.writeHead(404).end();
  fs.readFile(file,(err,body)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.json')?'application/json':'text/html');res.end(body);});
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const p=await browser.newPage({viewport:{width:2048,height:1000}}),errors=[];
    p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
    await p.addInitScript(()=>localStorage.setItem('ai-knowledge-map.onboarding.v1',JSON.stringify({version:1,skipped:true,read:0,cursor:0})));
    await p.goto(base+'/zh/concepts/llm/');await p.waitForFunction(()=>!!window.AI_SETTINGS);
    assert.equal(await p.locator('h1').count(),1);
    assert.equal(await p.locator('.preview-header').count(),0);
    assert.equal(await p.locator('#topbar [data-progress-account-button]').count(),0);
    assert.equal(await p.locator('#btn-reset, #btn-onboarding').count(),0);
    const selectors=['.brand','.mode-nav','.search-wrap','#btn-settings'];
    const reading=await Promise.all(selectors.map(s=>p.locator('#topbar '+s).boundingBox()));
    await p.locator('#btn-settings').click();
    await p.locator('#settings-account [data-progress-account-button]').waitFor();
    await p.locator('#settings-account [data-progress-account-button]').click();
    assert(await p.locator('.progress-account-dialog').isVisible());
    await p.keyboard.press('Escape');await p.keyboard.press('Escape');
    assert(await p.locator('#settings-overlay').evaluate(e=>e.classList.contains('hidden')));
    await p.locator('#btn-settings').click();await p.locator('#settings-language-select').selectOption('en');
    await p.waitForURL(base+'/en/concepts/llm/');
    assert.equal(await p.locator('#dd-article').getAttribute('lang'),'en');
    await p.locator('#btn-settings').click();
    await p.locator('#settings-language-select').selectOption('zh-Hans');
    await p.waitForURL(base+'/zh/concepts/llm/');
    assert.equal(await p.locator('#dd-article').getAttribute('lang'),'zh-Hans');
    await p.screenshot({path:'.tmp/reading-shell-desktop.png'});
    await p.locator('[data-mode="graph"]').click();await p.waitForFunction(()=>!!window.__cy);
    assert.equal(await p.locator('#btn-reset, #btn-onboarding').count(),2);
    const map=await Promise.all(selectors.map(s=>p.locator('#topbar '+s).boundingBox()));
    reading.forEach((r,i)=>{assert(Math.abs(r.x-map[i].x)<2,selectors[i]+' x matches map: '+r.x+' / '+map[i].x);assert.equal(r.height,map[i].height);});
    await p.goto(base+'/zh/concepts/llm/');await p.waitForFunction(()=>!!window.AI_SETTINGS);
    await p.setViewportSize({width:390,height:844});await p.screenshot({path:'.tmp/reading-shell-mobile.png'});
    assert(await p.locator('#btn-settings').isVisible(),'mobile settings remains accessible');
    await p.locator('#btn-settings').click();assert(await p.locator('#settings-dialog').isVisible());await p.keyboard.press('Escape');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile no page overflow');
    await p.locator('#btn-settings').click();await p.locator('#settings-language-select').selectOption('en');
    await p.waitForURL(base+'/en/concepts/llm/');
    assert.equal(await p.locator('#dd-article').getAttribute('lang'),'en');
    // Without a published counterpart, stay on the available original and
    // explain the fallback instead of constructing a nonexistent route.
    await p.goto(base+'/zh/concepts/llm/');
    await p.evaluate(()=>document.querySelector('.preview-next a[lang="en"]').remove());
    await p.locator('#btn-settings').click();await p.locator('#settings-language-select').selectOption('en');
    await p.locator('#reading-language-notice').waitFor();
    assert.equal(new URL(p.url()).pathname,'/zh/concepts/llm/');
    assert.deepEqual(errors,[]);console.log('PASS reading toolbar omits map actions; map retains them; settings/account, locale and mobile');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
