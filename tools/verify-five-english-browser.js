'use strict';
const path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(require.resolve('playwright',{paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
  const p=await b.newPage();
  for(const id of ['constitutional-ai','clustering','regularization','voice-cloning','curse-of-dimensionality']) {
    for(const size of [{width:1440,height:1000},{width:390,height:844}]) {
      await p.setViewportSize(size);const r=await p.goto(new URL('en/concepts/'+id+'/',process.argv[2]).href);
      assert.equal(r.status(),200);assert.equal(await p.locator('#dd-article').getAttribute('lang'),'en');
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.equal(await p.locator('#btn-settings').count(),1);
      assert(await p.locator('a').evaluateAll((links,id)=>links.some(a=>a.getAttribute('href')==='/zh/concepts/'+id+'/'),id));
    }
    console.log('PASS '+id+' desktop/mobile English, navigation, settings, no overflow');
  }
}finally{await b.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
