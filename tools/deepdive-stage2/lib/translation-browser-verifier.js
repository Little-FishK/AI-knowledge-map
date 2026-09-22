'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), http = require('node:http');
const assert = require('node:assert/strict');
const renderer = require('../../readiness/render-static-concept');
const shell = require('../../readiness/reading-shell');
const {safeFile} = require('../../readiness/site-artifact');
// Real browser observations only. Raster figures are held for a separate visual review.
async function verifyTranslationBrowser(root, candidate, source, {captureDiagrams=false}={}) {
  const {pageId, page, dependencies} = candidate.payload;
  assert(!/<img\b|<video\b|<iframe\b|<canvas\b/i.test(page.html), 'Raster/media resource requires independent visual review');
  assert(!(dependencies || []).some(d => !['hashed-local','link-preserved','internal-reference'].includes(d.status)
    && !require('./translation-local-style').isLocalLayoutStyle(d)), 'Unresolved resource dependencies');
  const {chromium} = require(require.resolve('playwright', {paths:[path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
  const home = fs.readFileSync(safeFile(root,'index.html'),'utf8');
  const pages = {};
  for (const [locale, body] of [['en',page],['zh',source]]) {
    const html = renderer.render(pageId, body, locale, 'https://ai-knowledge-map.com/');
    pages[`/${locale}/concepts/${pageId}/`] = shell.apply(html.replace('</head>', '<link rel="stylesheet" href="/assets/reading.css"></head>'), home, '/', {});
  }
  const server = http.createServer((req,res) => {
    try {
      const url = new URL(req.url,'http://localhost'), name = decodeURIComponent(url.pathname);
      if (pages[name]) return res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(pages[name]);
      if (!/^\/(assets|data\/locales)\//.test(name)) return res.writeHead(404).end();
      const file = safeFile(root,name.slice(1));
      const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream';
      res.writeHead(200,{'Content-Type':type}); res.end(fs.readFileSync(file));
    } catch (_) { res.writeHead(404).end(); }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({channel:'msedge',headless:true});
    const p = await browser.newPage({viewport:{width:1440,height:1000}}), errors=[], failed=[];
    const base = `http://127.0.0.1:${server.address().port}`;
    p.on('pageerror',e=>errors.push(e.message));
    p.on('response',r=>{if(r.url().startsWith(base) && r.status()>=400)failed.push(r.url());});
    await p.route('**/*',r=>r.request().url().startsWith(base) ? r.continue() : r.abort());
    await p.goto(base+`/en/concepts/${pageId}/`);
    const layoutRepairs=await p.evaluate(()=>window.translationLayoutReady), defects=[];
    assert.equal(await p.locator('#dd-article').getAttribute('lang'),'en');
    assert.equal(await p.locator('h1').textContent(),page.title);
    const contentText = await p.locator('#dd-article').evaluate(el=>{const copy=el.cloneNode(true);copy.querySelectorAll('.preview-next').forEach(n=>n.remove());return copy.textContent;});
    assert.equal(await p.locator('#dd-article svg').count(),(source.html.match(/<svg\b/gi)||[]).length);
    for (const size of [{width:1440,height:1000},{width:768,height:1024},{width:390,height:844},{width:320,height:740}]) {
      await p.setViewportSize(size);
      await p.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
      assert(await p.locator('#dd-article').isVisible());
      assert(await p.locator('#btn-settings').isVisible());
      const documentOverflow=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        elements:[...document.querySelectorAll('body *')].filter(el=>{const b=el.getBoundingClientRect();return b.width&&b.right>innerWidth+1;}).slice(0,8).map(el=>({tag:el.tagName,id:el.id,classes:el.className?.baseVal??el.className}))}));
      if(documentOverflow.scrollWidth>documentOverflow.width+1)defects.push({kind:'page-overflow',viewport:size,...documentOverflow});
      const overflow=await p.locator('#dd-article svg').evaluateAll(svgs=>svgs.flatMap((svg,index)=>{
        const box=svg.getBoundingClientRect();
        return [...svg.querySelectorAll('text')].flatMap(text=>{const b=text.getBoundingClientRect();
          return b.left>=box.left-2&&b.right<=box.right+2&&b.top>=box.top-2&&b.bottom<=box.bottom+2?[]:[{index,text:text.textContent,markup:text.outerHTML,viewBox:svg.getAttribute('viewBox'),bounds:{left:b.left-box.left,right:b.right-box.right,top:b.top-box.top,bottom:b.bottom-box.bottom}}];});
      }));
      defects.push(...overflow.map(issue=>({kind:'svg-canvas-overflow',viewport:size,...issue})));
      const layoutIssues=await p.locator('#dd-article').evaluate(require('./translation-layout-checks').inspectLayout);
      defects.push(...layoutIssues.map(issue=>({viewport:size,...issue})));
      if(captureDiagrams && size.width===1440) {
        const directory=path.join(root,'.tmp','translation-layout-review');
        // Screenshots are diagnostics, never acceptance inputs.
        fs.mkdirSync(directory,{recursive:true});
        const diagrams=p.locator('#dd-article svg');
        for(let i=0;i<await diagrams.count();i++)await diagrams.nth(i).screenshot({path:path.join(directory,`${pageId}-${i}.png`)});
      }
    }
    // The tokenization lesson deliberately uses 猫 as a Unicode/UTF-8 example.
    // Translating the example to "cat" would invalidate its three-byte claim.
    const retainedEncodingExample=pageId==='tokenization'&&source.html.includes('猫')&&contentText.includes('UTF-8')&&/3 bytes/.test(contentText);
    let untranslatedText=retainedEncodingExample?contentText.replace(/猫/g,''):contentText;
    // These are the literal source tokens of a next-token probability exercise,
    // reused in its SVG and table, not untranslated explanatory prose.
    const retainedTrainingExample=pageId==='pretraining'&&source.html.includes('猫 喜欢 鱼')&&source.html.includes('EOS')&&contentText.includes('0.25')&&contentText.includes('1.386');
    if(retainedTrainingExample){
      const pieces=await p.locator('#dd-article').evaluate(el=>{const copy=el.cloneNode(true);copy.querySelectorAll('.preview-next').forEach(n=>n.remove());const walk=document.createTreeWalker(copy,NodeFilter.SHOW_TEXT),pieces=[];while(walk.nextNode())pieces.push(walk.currentNode.nodeValue);return pieces;});
      untranslatedText=pieces.join('\n').replace(/\p{Script=Han}+/gu,token=>['猫','喜欢','鱼'].includes(token)?'':token);
    }
    // Speech normalization explains Chinese readings and polyphonic characters.
    // Only the source-backed examples in that English explanatory paragraph
    // are exempt; Chinese prose elsewhere still fails acceptance.
    const speechExamples=['三百','三元','银行','行走'];
    const retainedSpeechExample=pageId==='speech'&&speechExamples.every(token=>source.html.includes(token));
    if(retainedSpeechExample){
      const pieces=await p.locator('#dd-article').evaluate(el=>{const copy=el.cloneNode(true);copy.querySelectorAll('.preview-next').forEach(n=>n.remove());const walk=document.createTreeWalker(copy,NodeFilter.SHOW_TEXT),pieces=[];while(walk.nextNode())pieces.push(walk.currentNode.nodeValue);return pieces;});
      untranslatedText=pieces.map(piece=>/numbers/.test(piece)&&/abbreviations/.test(piece)&&/pronunciation/.test(piece)&&speechExamples.every(token=>piece.includes(token))
        ?piece.replace(/\p{Script=Han}+/gu,token=>['三百','元','三元','行','银行','行走'].includes(token)?'':token):piece).join('\n');
    }
    // The tool lesson's protected JSON/function arguments must stay literal.
    // Exempt only the two quoted source values, never surrounding prose.
    const retainedToolExample=pageId==='tool-calling'&&source.html.includes('get_weather')&&source.html.includes('send_notification')&&source.html.includes('北京32°C');
    if(retainedToolExample)untranslatedText=untranslatedText.replace(/(["'])北京(?:32°C)?\1/g,'');
    if(/\p{Script=Han}/u.test(untranslatedText))defects.push({kind:'untranslated-visible-text',samples:untranslatedText.match(/[^\n]{0,60}\p{Script=Han}[^\n]{0,100}/gu)?.slice(0,12)||[]});
    if(defects.length){const error=Error('Layout validation failed after bounded automatic repair: '+JSON.stringify(defects).slice(0,1500));error.code='PRESENTATION_REPAIR_EXHAUSTED';error.issues=defects;error.layoutRepairs=layoutRepairs||[];throw error;}
    // Language settings change the UI; an absent counterpart must never relabel the article.
    const english = await p.locator('#dd-article').innerText();
    await p.locator('#btn-settings').click();
    await p.locator('#settings-language-select').selectOption('zh-Hans');
    await p.waitForFunction(()=>document.documentElement.lang==='zh-Hans');
    assert.equal(await p.locator('#dd-article').getAttribute('lang'),'en');
    assert.equal(await p.locator('#dd-article').innerText(),english);
    await p.locator('#settings-language-select').selectOption('en');
    await p.locator('#settings-language-select').selectOption('zh-Hans');
    await p.locator('#settings-language-select').selectOption('en');
    await p.waitForFunction(()=>document.documentElement.lang==='en');
    assert.equal(await p.locator('#dd-article').innerText(),english);
    await p.keyboard.press('Escape');
    const counterpart = p.locator(`a[href="/zh/concepts/${pageId}/"]`).first();
    await counterpart.click();
    assert.equal(await p.locator('#dd-article').getAttribute('lang'),'zh-Hans');
    assert.equal(await p.locator('h1').textContent(),source.title);
    assert.equal(errors.length,0,'Browser exception'); assert.equal(failed.length,0,'Missing preview resource');
    const notes = {
      english:'Rendered exact English candidate; title and article language match; untranslated Han characters are blocked except narrowly source-bound literal Unicode, next-token or speech-pronunciation examples.',
      chinese:'Navigated to the frozen Chinese counterpart and verified its title and article language.',
      fallback:'Static language settings preserve the original English article and its language when switching UI language to Chinese.',
      'rapid-switch':'Switched the shared language selector repeatedly and verified the English article remained unchanged.',
      navigation:'Clicked the actual Chinese counterpart link and verified the resulting Chinese article.',
      resources:'All requested local preview assets returned successfully; inline SVG count retained; frozen inline layout styles have only explicitly allowed non-fetching declarations; raster/media held before testing.',
      desktop:'At 1440 x 1000 the article and settings button are visible without document horizontal overflow.',
      mobile:'At 768, 390 and 320 CSS-pixel widths, checked document overflow, SVG label collisions, node-box overflow and clipped article text after fonts settled.',
      console:'No pageerror events or failed local HTTP responses during both page visits and language switching.'
    };
    return {kind:'automated-browser-resource-v1', artifactHash:candidate.artifactHash, approved:true,
      reviewer:'controller-playwright-static-v1', browserChecks:Object.entries(notes).map(([name,notes])=>({name,notes,passed:true})),
      layoutRepairs:layoutRepairs||[],
      literalTeachingExamples:retainedTrainingExample?{pageId,tokens:['猫','喜欢','鱼'],basis:'Exact source sentence tokens retained in next-token probability exercise, its diagram and its table; explanatory Chinese remains blocked.'}:retainedSpeechExample?{pageId,tokens:speechExamples,basis:'Source-bound Chinese readings and polyphonic character examples within the English normalization paragraph only.'}:retainedToolExample?{pageId,tokens:['北京','北京32°C'],basis:'Only exact quoted values from source tool-call arguments; all unquoted Chinese prose remains blocked.'}:null,
      formulaPresentation:{policy:'Exact MathML mi/mtext glossary: 教师=teacher, 学生=student, 硬标签=hard labels, 最小=min, 最大=max, 偏好=preference, 参考=ref; numbers and operators unchanged; unknown labels remain blocking.',
        applied:require('../../readiness/translation-layout-repair').formulaLabels(page.html)!==page.html},
      resources:candidate.payload.resources.map((_,i)=>({key:`resource:${i}`,passed:true,notes:notes.resources})),
      resourceSummary:'Deterministic source structure and dependency guards plus actual browser loading and visible-text checks. Raster/video/canvas/iframe resources are excluded and held for separate visual review.'};
  } finally { if(browser)await browser.close(); await new Promise(resolve=>server.close(resolve)); }
}
module.exports = {verifyTranslationBrowser};
