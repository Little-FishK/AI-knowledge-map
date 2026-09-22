'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {verify}=require('../../tools/verify-website');
const {safeFile}=require('../../tools/readiness/site-artifact');
const {chromium}=require(require.resolve('playwright',{paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
const root=path.resolve(process.argv[2]||'site-release');
const screenshots=process.argv[3]?path.resolve(process.argv[3]):null;
(async()=>{
  verify(root,true);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json')));
  const server=http.createServer((req,res)=>{
    const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
    let file;try{file=safeFile(root,name.endsWith('/')?name+'index.html':name);}catch(_){res.writeHead(400);return res.end();}
    if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png'};
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;const overflow=[],errors=[];
  try{
    browser=await chromium.launch({channel:'msedge',headless:true});
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}});
    const page=await context.newPage();
    for(const entry of manifest.pages){
      const response=await page.goto(`http://127.0.0.1:${server.address().port}/`+entry.path,{waitUntil:'load'});
      assert.equal(response.status(),200,entry.id);assert.equal(await page.locator('h1').count(),1,entry.id);
      assert((await page.locator('#dd-article').textContent()).length>100,entry.id);
      assert.equal(await page.locator('.dd-publication-notice').count(),entry.eligible?0:1,entry.id);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),new URL(entry.path.replace(/index.html$/,''),manifest.siteUrl).href);
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))overflow.push(entry.id+':desktop');
    }
    if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
    for(const width of [390,1440])for(const id of ['supervised-learning','gradient-descent','transformer','neural-network','information-theory']){
      await page.setViewportSize({width,height:1000});
      await page.goto(`http://127.0.0.1:${server.address().port}/zh/concepts/${id}/`);
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))overflow.push(id+':'+width);
      if(screenshots&&['gradient-descent','transformer'].includes(id))await page.screenshot({path:path.join(screenshots,`${id}-${width}.png`)});
    }
    const live=await browser.newPage({viewport:{width:1440,height:1000}});
    live.on('pageerror',e=>errors.push(e.message));
    await live.goto(`http://127.0.0.1:${server.address().port}/zh/concepts/transformer/`);
    assert.equal(await live.locator('.dd-publication-notice').getAttribute('data-review-status'),'needs-revision');
    assert.equal(await live.locator('.reading-toc').count()>0,true,'reading enhancements should load');
    assert.deepEqual(errors,[]);assert.deepEqual(overflow,[],'page overflow');
    console.log(JSON.stringify({status:'pass',desktopPages:manifest.pages.length,responsiveSamples:10,javascriptErrors:errors,overflow,screenshots},null,2));
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
