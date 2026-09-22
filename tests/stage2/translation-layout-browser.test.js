'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
const {inspectLayout}=require('../../tools/deepdive-stage2/lib/translation-layout-checks');
const {chromium}=require(require.resolve('playwright',{paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage();
    async function inspect(body){await page.setContent('<article>'+body+'</article>');await page.evaluate(()=>document.fonts.ready);return page.locator('article').evaluate(inspectLayout);}
    let issues=await inspect('<svg width="500" height="200"><text x="10" y="30">First overlapping label</text><text x="20" y="30">Second overlapping label</text></svg>');
    assert(issues.some(x=>x.kind==='svg-label-overlap'));
    issues=await inspect('<svg width="500" height="200"><g><rect x="50" y="10" width="60" height="40"/><text x="30" y="35">A long node label</text></g></svg>');
    assert(issues.some(x=>x.kind==='svg-label-outside-node'));
    issues=await inspect('<div style="height:20px;overflow:hidden"><p>First line<br>Second line<br>Third line</p></div>');
    assert(issues.some(x=>x.kind==='clipped-content'));
    issues=await inspect('<div style="width:50px;overflow:auto"><pre>intentionally scrollable code example</pre></div><svg width="500" height="200"><text x="10" y="30">First label</text><text x="10" y="80">Second label</text></svg>');
    assert.deepEqual(issues,[]);
    const {repairLayout}=require('../../tools/readiness/translation-layout-repair');
    await page.setContent('<article><svg data-activation="tanh" viewBox="0 0 260 240" style="width:300px;font-size:18px"><rect x="6" y="6" width="248" height="228" fill="none"/><text x="42" y="207">−4</text><text x="218" y="207">4</text><text x="130" y="225" text-anchor="middle">−1 &lt; f(z) &lt; 1</text></svg></article>');
    const original=await page.locator('article').textContent();
    await page.locator('article').evaluate(repairLayout);
    assert.equal(await page.locator('article').textContent(),original);
    assert.equal(await page.locator('svg text').last().getAttribute('y'),'245');
    assert.equal(await page.locator('svg text').last().locator('tspan').count(),0);
    assert.deepEqual(await page.locator('article').evaluate(inspectLayout),[]);
    console.log('PASS real Edge label overlap, node-box overflow, clipped text and valid scroll containers');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
