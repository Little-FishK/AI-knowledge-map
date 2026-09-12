'use strict';
const assert = require('node:assert/strict'), path = require('node:path'), os = require('node:os'), fs = require('node:fs');
const {chromium} = require(require.resolve('playwright', {paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
(async()=>{
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    for (const reduced of [false,true]) {
      const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:reduced?'reduce':'no-preference'});
      const errors=[]; page.on('pageerror', e=>errors.push(e.message));
      await page.addInitScript(()=>localStorage.setItem('ai-knowledge-map.onboarding.v1',JSON.stringify({version:1,skipped:true,read:0,cursor:0})));
      await page.goto((process.argv[2]||'http://127.0.0.1:5103/')+'?lang=zh-Hans#/map');
      await page.waitForFunction(()=>window.__cy?.nodes('.motion-art').length===130);
      const official=process.argv.includes('--official');
      if(official){
        await page.locator('#official-path-toggle').click();
        const palette=await page.evaluate(()=>window.__cy.nodes('.official-path-node').map(n=>({order:String(n.data('officialOrder')),fill:n.style('background-color'),ink:n.style('color')})));
        assert.equal(palette.length,130,'every official number retained');
        assert(palette.every(n=>n.order.includes('.')?n.fill==='rgb(23,19,11)'&&n.ink==='rgb(228,184,93)':n.fill==='rgb(228,184,93)'&&n.ink==='rgb(23,19,11)'), 'gold/black number hierarchy');
        assert(await page.evaluate(()=>window.__cy.edges('.overview-curve').length>30),'same overview edge styles');
      }
      const center=await page.evaluate(()=>{const cy=window.__cy,n=cy.getElementById('llm');cy.zoom(1.5);cy.center(n);const p=n.renderedPosition(),b=cy.container().getBoundingClientRect();return{x:p.x+b.left,y:p.y+b.top};});
      async function pixels(){return page.evaluate(()=>{
        const cy=window.__cy,n=cy.getElementById('llm'),p=n.renderedPosition(),c=document.getElementById('node-ring-motion'),ctx=c.getContext('2d'),d=c.width/cy.container().clientWidth,s=n.width()*cy.zoom()*d;
        const im=ctx.getImageData(Math.round(p.x*d-s*.7),Math.round(p.y*d-s*.7),Math.ceil(s*1.4),Math.ceil(s*1.4));
        let face=0,ring=0,white=0,outer=0;const ringPixels=[];
        for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){
          const r=Math.hypot(x-s*.7,y-s*.7)/s,i=(y*im.width+x)*4,v=im.data[i]+im.data[i+1]*3+im.data[i+2]*7;
          if(r<.30)face=(face+v*(i+1))%1000000007;
          if(r>.42&&r<.49){ring=(ring+v*(i+1))%1000000007;ringPixels.push(im.data[i],im.data[i+1],im.data[i+2]);}
          if(r>.37&&r<.42&&im.data[i]>235&&im.data[i+1]>235&&im.data[i+2]>235&&im.data[i+3]>200)white++;
          if(r>.52&&r<.59&&im.data[i+3]>100)outer++;
        }
        return {face,ring,ringPixels,white,outer,position:{...n.position()}};
      });}
      await page.waitForTimeout(1200);const a=await pixels();await page.waitForTimeout(700);const b=await pixels();
      assert.equal(a.face,b.face,'face remains fixed');assert.deepEqual(a.position,b.position,'node never drifts');
      const ringDifference=a.ringPixels.reduce((sum,v,i)=>sum+Math.abs(v-b.ringPixels[i]),0)/a.ringPixels.length;
      if(reduced)assert(ringDifference<0.2,'reduced motion stops spin (allow canvas rounding)');else assert(ringDifference>0.2,'ring rotates');
      await page.mouse.move(center.x,center.y);await page.waitForTimeout(600);const hovered=await pixels();
      assert(hovered.white>10,'white band appears without click');assert(hovered.outer>b.outer+10,'ring expands');
      assert.equal(hovered.face,b.face);assert(await page.locator('#detail').evaluate(el=>el.classList.contains('closed')),'hover never opens detail');
      fs.mkdirSync('.tmp/ring-motion-qa',{recursive:true});await page.screenshot({path:`.tmp/ring-motion-qa/${official?'official-':''}hover-${reduced}.png`});
      await page.mouse.move(10,10);await page.waitForTimeout(800);assert((await pixels()).white<5,'white emphasis clears');
      await page.mouse.click(center.x,center.y);await page.waitForTimeout(500);assert(!await page.locator('#detail').evaluate(el=>el.classList.contains('closed')),'click still works');
      if(official){
        await page.locator('#official-path-toggle').click();
        assert(await page.evaluate(()=>window.__cy.nodes('.official-path-node').length===0),'leaving official restores ordinary map');
      }
      assert.deepEqual(errors,[]);console.log('PASS ring motion, fixed face, hover white/expansion, leave, click; reduced='+reduced+', official='+official);await page.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
