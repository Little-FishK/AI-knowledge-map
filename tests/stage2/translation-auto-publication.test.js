'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {fixture,hash}=require('./translation-publication-fixture');
const {createTranslationPublication,BROWSER_CHECKS}=require('../../tools/deepdive-stage2/lib/translation-publication');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'translation-auto-publication-'));
(async()=>{
  const f=fixture(),id=hash('campaign');let authorization='',calls=0,fail=false;
  const controller=createTranslationPublication({campaignAuthorization:()=>authorization,
    withTranslationQualityMaterial:(_r,_p,_id,action)=>action(f),withCurrentTranslationSnapshot:(_r,_p,_s,action)=>action(),
    automaticVerifier:async(_root,candidate)=>{calls++;if(fail)throw Error('Browser failed');return {
      kind:'automated-browser-resource-v1',artifactHash:candidate.artifactHash,approved:true,reviewer:'synthetic-machine-verifier',
      browserChecks:BROWSER_CHECKS.map(name=>({name,passed:true,notes:'Synthetic assertion for testing the publication contract only.'})),
      resources:candidate.payload.resources.map((_,i)=>({key:`resource:${i}`,passed:true,notes:'Synthetic assertion for testing the resource contract only.'})),
      resourceSummary:'Synthetic acceptance only, not a real browser inspection or an actual translation review.'};}});
  await assert.rejects(controller.autoPublishTranslation(root,'sample','fixture-review',id),/campaign/);assert.equal(calls,0);
  authorization=id;f.report.gates[0].status='pending';await assert.rejects(controller.autoPublishTranslation(root,'sample','fixture-review',id),/gates/);assert.equal(calls,0);
  f.report.gates[0].status='pass';fail=true;await assert.rejects(controller.autoPublishTranslation(root,'sample','fixture-review',id),/Browser/);assert(!fs.existsSync(path.join(root,'data')));
  fail=false;await controller.autoPublishTranslation(root,'sample','fixture-review',id);
  const envelope=controller.publishedTranslation(root,'sample');assert.equal(envelope.status,'machine-reviewed');
  assert.equal((await controller.autoPublishTranslation(root,'sample','fixture-review',id)).state,'already-published');
  f.report.gates[6].status='fail';assert.throws(()=>controller.publishedTranslation(root,'sample'),/stale or failed/);
  console.log('PASS automatic publication requires exact authorization, existing source/semantic gates, verified browser receipt; machine status, idempotency and stale rejection');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>fs.rmSync(root,{recursive:true,force:true}));
