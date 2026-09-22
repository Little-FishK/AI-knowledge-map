'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createQueue}=require('../tools/readiness/translation-deployment-queue');
const {sameBaseline,confirmLive}=require('../tools/readiness/deploy-translation-page');
(async()=>{
  const events=[],calls=[];let active=0,peak=0,release;
  const hold=new Promise(r=>release=r);
  const q=createQueue(async p=>{calls.push(p.pageId);peak=Math.max(peak,++active);if(p.pageId==='one')await hold;active--;if(p.pageId==='bad')throw Error('Push rejected');return {url:'https://example.test/'+p.pageId};},e=>events.push(e));
  const page=id=>({pageId:id,state:'published',artifactHash:'sha256:'+id});
  q.observe({pages:[page('one'),{pageId:'pending',state:'quality'}]});
  await new Promise(r=>setImmediate(r));assert.deepEqual(calls,['one']); // No wait for the pending page.
  q.observe({pages:[page('one'),page('bad'),page('two')]});release();
  assert.equal((await q.drain()).failed,true);assert.equal(peak,1);assert.deepEqual(calls,['one','bad','two']);
  assert.deepEqual(events.map(e=>e.event),['page-live','deployment-blocked','page-live']);
  assert.equal(events.filter(e=>e.pageId==='bad'&&e.event==='page-live').length,0);
  const scopedCalls=[];
  const scoped=createQueue(async p=>{scopedCalls.push(p.pageId);return {};},()=>{},['two']);
  scoped.observe({pages:[page('one'),page('two')]});await scoped.drain();
  assert.deepEqual(scopedCalls,['two']);
  assert.throws(()=>createQueue(async()=>{},()=>{},[]),/Invalid deployment page scope/);
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'deploy-baseline-'));
  try{
    const a=path.join(dir,'a'),b=path.join(dir,'b');fs.mkdirSync(a);fs.mkdirSync(b);
    for(const p of [a,b])fs.writeFileSync(path.join(p,'release-manifest.json'),JSON.stringify({files:{'x.html':{}}}));
    fs.writeFileSync(path.join(a,'x.html'),'line\n');fs.writeFileSync(path.join(b,'x.html'),'line\r\n');sameBaseline(a,b);
    fs.writeFileSync(path.join(b,'x.html'),'changed');assert.throws(()=>sameBaseline(a,b),/changed/);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
  const previous=global.fetch;let request;
  try{global.fetch=async url=>{request=url;return {status:200,text:async()=>'<p>live</p>\r\n'};};await confirmLive('https://example.test/page/','<p>live</p>\n',100);assert(request.includes('deploymentCheck='));}finally{global.fetch=previous;}
  console.log('PASS immediate per-page dispatch, serial deployment, deduplication, failure isolation, baseline protection and live content verification (mocked; no deployment)');
})().catch(e=>{console.error(e);process.exitCode=1;});
