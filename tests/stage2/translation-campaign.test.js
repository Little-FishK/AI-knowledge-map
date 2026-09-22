'use strict';
// Synthetic fixtures and mock provider only; no paid API or production access.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {fixture,hash}=require('./translation-publication-fixture');
const {createTranslationCampaign}=require('../../tools/deepdive-stage2/lib/translation-campaign');
const {createTranslationDeepSeek}=require('../../tools/deepdive-stage2/lib/translation-deepseek');
const {createTranslationQuality}=require('../../tools/deepdive-stage2/lib/translation-quality');
const {spawnSync}=require('node:child_process');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'translation-campaign-test-'));
let serial=0;
function setup(overrides={},modern=false,pageCount=2,parallelOptions={}) {
  const f=fixture(),storage=path.join(root,String(++serial)),requests=[],published=[];
  f.snapshot.capture.approvalEvidence={sourceEligibleForEnglishReview:true};f.snapshot.capture.glossary={terms:{}};
  let eligible=true,stale=false,uncertain=false,bad=false,fullUsage=false,invalidReview=false,malformedReview=false;
  const config={model:'deepseek-v4-pro',accountId:'fixture-account',contextWindow:1000000,maxOutputTokens:4000,reasoningEffort:'high',inputUsdPerMillion:1.32,outputUsdPerMillion:3.96,priceBasis:'peak-cache-miss',budgetUsd:80,maxAttempts:2,requestTimeoutMs:60000,...overrides};
  const environment={STAGE2_DEEPSEEK_LIVE:'1',DEEPSEEK_ACCOUNT_ID:config.accountId};
  const metrics={active:0,peak:0,publishing:0,publicationPeak:0};
  if(parallelOptions.concurrency)environment.STAGE2_CAMPAIGN_CONCURRENCY=String(parallelOptions.concurrency);
  const d={storageDirectory:()=>storage,environment,
    checkTranslationSnapshot:()=>({state:stale?'stale':'prepared'}),
    readTranslationSnapshot:(_r,_p,_s,o,n)=>{f.snapshot.capture.approvalEvidence.sourceEligibleForEnglishReview=eligible;const s=JSON.stringify(f.snapshot);return {content:s.slice(o,o+n),nextOffset:Math.min(o+n,s.length),done:o+n>=s.length};},
    prepareTranslationTask:(_r,p,s,c)=>{const chapter=f.material.chapters.find(x=>x.chapterId===c);return {taskId:hash({p,c}),prompt:'Translate exact units to JSON.',data:{units:chapter.units},outputSchema:{}};},
    autoPublish:async(_r,p)=>{metrics.publishing++;metrics.publicationPeak=Math.max(metrics.publicationPeak,metrics.publishing);if(parallelOptions.delay)await new Promise(r=>setTimeout(r,parallelOptions.delay));published.push(p);metrics.publishing--;return {state:'published-English',artifactHash:hash(p)};},
    client:{async complete(_plan,body){requests.push(body);const number=requests.length;metrics.active++;metrics.peak=Math.max(metrics.peak,metrics.active);if(parallelOptions.delay)await new Promise(r=>setTimeout(r,parallelOptions.delay));metrics.active--;if(uncertain||parallelOptions.failNth===number)throw Error('fixture network failure');
      const packet=JSON.parse(body.messages[1].content);let output;
      if(['translation-review-v2','translation-rounds-v1'].includes(packet.contractVersion))output={batchId:packet.batchId,checkedUnitKeys:packet.reviewUnitKeys,findings:[],summary:packet.phase!=='units'?'Terminology and references agree across the entire synthetic page.':''};
      else if(packet.role==='review')output={checkedUnits:Object.fromEntries(packet.units.map(u=>[u.key,[u.source,u.translation,'Synthetic test evidence for exact unit coverage.']])),wholePageRationale:'Synthetic fixture only: cross-chapter meanings and terminology agree.',findings:[]};
      else if(packet.role==='repair')output=Object.fromEntries(packet.units.map(u=>[u.key,parallelOptions.noOpRepair?u.translation:f.material.chapters.find(c=>c.chapterId===u.chapterId).output.translations[u.id]]));
      else {const chapter=f.material.chapters.find(c=>c.units[0].id===packet.units[0].id);output=JSON.parse(JSON.stringify(chapter.output));if(bad&&chapter.chapterId!=='page-header'){for(const u of chapter.units)if(u.source==='2'){output.translations[u.id]='3';bad=false;break;}}}
      if(packet.role==='review'&&invalidReview){if(modern)output.checkedUnitKeys=['unknown'];else output.checkedUnits[packet.units[0].key][2]='OK';}
      if(packet.reviewOutputUnitKeys)output.checkedUnits=Object.fromEntries(Object.entries(output.checkedUnits).filter(([key])=>packet.reviewOutputUnitKeys.includes(key)));
      let content=JSON.stringify(output);if(packet.role==='review'&&malformedReview){content='{"checkedUnits":';malformedReview=false;}
      return {id:'mock',model:config.model,choices:[{finish_reason:parallelOptions.truncateNth===number?'length':'stop',message:{role:'assistant',content,reasoning_content:'DO NOT STORE THIS'}}],usage:{prompt_tokens:100,completion_tokens:fullUsage||parallelOptions.truncateNth===number?body.max_tokens:100}};
    }}
  };
  const translation=createTranslationDeepSeek(d);
  d.quality=createTranslationQuality({...d,translationReviewMaterial:(r,p,id)=>translation.translationReviewMaterial(r,p,id)});
  const ids=Array.from({length:pageCount},(_,i)=>['one','two'][i]||'page-'+i);
  const engine=createTranslationCampaign(d),plan=engine.build(root,ids.map(pageId=>({pageId,snapshotId:hash(pageId)})),config);
  // Preserve the old test matrix as an on-disk pre-v2 campaign fixture.
  if(!parallelOptions.rounds){const file=path.join(storage,'campaigns',plan.campaignId.slice(7),'campaign.json');const legacy=JSON.parse(fs.readFileSync(file));if(modern)legacy.reviewContractVersion=5;else delete legacy.reviewContractVersion;fs.writeFileSync(file,JSON.stringify(legacy));}
  environment.STAGE2_DEEPSEEK_CAMPAIGN=plan.campaignId;
  return {engine,plan,requests,published,environment,storage,metrics,fullUsage(){fullUsage=true;},eligible(v){eligible=v;},stale(){stale=true;},uncertain(){uncertain=true;},bad(){bad=true;},
    malformedReview(){malformedReview=true;},invalidReview(value=true){invalidReview=value;},step:()=>engine.step(root,plan.campaignId),inspect:()=>engine.inspect(root,plan.campaignId)};
}
(async()=>{
  const resumed=setup({},true,1,{rounds:true,failNth:2});let rr=resumed.plan;
  for(let i=0;i<10&&rr.state!=='needs-operator-review';i++)rr=await resumed.step();
  assert.equal(rr.state,'needs-operator-review');assert.equal(resumed.requests.length,2);
  const resumeFile=path.join(resumed.storage,'campaigns',rr.campaignId.slice(7),'campaign.json');
  const beforeResume=JSON.parse(fs.readFileSync(resumeFile)),lost=beforeResume.calls.find(c=>c.state==='uncertain');
  const reserved=lost.reservedUsd;
  await resumed.step();assert.equal(resumed.requests.length,2);
  resumed.environment.STAGE2_REPLACE_TRANSLATION_CAMPAIGN=rr.campaignId;
  resumed.environment.STAGE2_REPLACE_TRANSLATION_REQUESTS=JSON.stringify([lost.requestHash]);
  resumed.environment.STAGE2_REPLACE_TRANSLATION_REASON='User explicitly requested completion of these partial translations with old unknown costs retained.';
  for(let i=0;i<20&&rr.state!=='completed';i++)rr=await resumed.step();
  assert.equal(resumed.published.length,1);
  const afterResume=JSON.parse(fs.readFileSync(resumeFile));
  assert.equal(afterResume.calls.find(c=>c.state==='abandoned-unknown').reservedUsd,reserved);
  assert.equal(afterResume.calls.filter(c=>c.requestHash===lost.requestHash).length,2);
  assert.equal(afterResume.calls.filter(c=>c.requestHash===beforeResume.calls[0].requestHash).length,1);
  const doneCalls=resumed.requests.length;await resumed.step();assert.equal(resumed.requests.length,doneCalls);
  console.log('PASS exact partial translation recovery retains unknown reservation, reuses completed chapters and is idempotent');
  const noOp=setup({},true,8,{concurrency:2,noOpRepair:true});noOp.bad();let noOpResult=noOp.plan;
  for(let i=0;i<40&&noOpResult.state!=='completed';i++)noOpResult=await noOp.step();
  assert.equal(noOpResult.state,'completed');assert.equal(noOpResult.manualPendingPages,1);
  assert.equal(noOpResult.automaticPendingPages,0);assert.equal(noOp.published.length,7);
  const manual=noOpResult.pages.find(p=>p.reason==='manual-repair-required');
  assert.equal(manual.manualIntervention.trigger,'no-op-repair');
  assert.equal(manual.manualIntervention.automaticSlotOccupied,false);
  assert.equal(noOp.requests.filter(b=>JSON.parse(b.messages[1].content).role==='repair').length,1);
  const beforeNoOp=noOp.requests.length;await noOp.step();assert.equal(noOp.requests.length,beforeNoOp);
  console.log('PASS no-op repair exits automatic queue immediately, later pages fill workers, no automatic retry');
  const truncatedRound=setup({},true,1,{rounds:true,truncateNth:4});let tr=truncatedRound.plan;
  for(let i=0;i<20&&tr.state!=='completed';i++)tr=await truncatedRound.step();
  assert.equal(truncatedRound.published.length,1);assert.equal(truncatedRound.requests[4].max_tokens,truncatedRound.requests[3].max_tokens*2);
  console.log('PASS saved length-limited round increases next output allowance within shared budget');
  const rounds=setup({},true,2,{rounds:true});let roundResult=rounds.plan;
  for(let i=0;i<20&&roundResult.state!=='completed';i++)roundResult=await rounds.step();
  assert.deepEqual(rounds.published,['one','two']);
  const timedJob=JSON.parse(fs.readFileSync(path.join(rounds.storage,'campaigns',rounds.plan.campaignId.slice(7),'campaign.json')));
  assert(timedJob.calls.every(c=>Number.isFinite(c.durationMs)&&c.durationMs>=0&&Number.isFinite(Date.parse(c.startedAt))&&Number.isFinite(Date.parse(c.finishedAt))));
  const roundRequests=rounds.requests.map(b=>JSON.parse(b.messages[1].content)).filter(p=>p.contractVersion==='translation-rounds-v1');
  assert.equal(roundRequests.length,2);assert(roundRequests.every(p=>p.phase==='full-review'&&p.batchCount===1));
  console.log('PASS one full review request per page, including consistency, then publication');
  const parallel=setup({},true,8,{concurrency:5,delay:25});let parallelResult=parallel.plan;
  for(let i=0;i<20&&parallelResult.state!=='completed';i++)parallelResult=await parallel.step();
  assert.equal(parallel.published.length,8);assert.equal(parallel.metrics.peak,5);assert.equal(parallel.metrics.publicationPeak,1);assert.equal(parallelResult.concurrency,5);
  assert.equal(parallelResult.calls,40);assert(parallelResult.pages.every(p=>!p.pendingQualityTask));
  const limited=setup({},true,8,{concurrency:5,delay:25});limited.environment.STAGE2_CAMPAIGN_SPEND_LIMIT_USD='.04';await limited.step();const limitResult=await limited.step();
  assert.equal(limitResult.state,'budget-exhausted');assert(limitResult.accountedUsd<=.04);assert(limitResult.reservedUsd<=.04);assert.equal(limited.requests.length,2);
  const fault=setup({},true,8,{concurrency:5,delay:25,failNth:1});await fault.step();const faultResult=await fault.step();
  assert.equal(faultResult.state,'running');assert.equal(fault.requests.length,8);assert.equal(fault.metrics.active,0);
  const failedJob=JSON.parse(fs.readFileSync(path.join(fault.storage,'campaigns',fault.plan.campaignId.slice(7),'campaign.json')));
  const failedCall=failedJob.calls.find(c=>c.state==='uncertain');
  assert(failedCall&&Number.isFinite(failedCall.durationMs)&&failedCall.finishedAt);
  let isolated=faultResult;for(let i=0;i<20&&isolated.state==='running';i++)isolated=await fault.step();
  assert.equal(fault.published.length,7);assert(!fault.published.includes('one'));assert.equal(isolated.state,'needs-operator-review');
  const beforeIsolation=fault.requests.length;await fault.step();assert.equal(fault.requests.length,beforeIsolation);assert.equal(isolated.pages[0].reason,'request-reconciliation-required');
  const lock=setup({},true,2,{concurrency:5,delay:30});await lock.step();const inFlight=lock.step();await assert.rejects(lock.step(),/EEXIST/);await inFlight;
  const handover=setup({},true);await assert.rejects(handover.engine.handover(root,handover.plan.campaignId),/authorization/);
  handover.environment.STAGE2_CAMPAIGN_HANDOVER=handover.plan.campaignId;
  const handed=await handover.engine.handover(root,handover.plan.campaignId);assert.equal(handed.concurrency,5);assert.equal(handed.handover,true);assert.equal(handover.requests.length,0);
  console.log('PASS five concurrent pages, serialized publishing, shared budget admission, in-flight settlement and exclusive controller ownership');
  const modern=setup({},true);let modernResult=modern.plan;
  for(let i=0;i<40&&modernResult.state!=='completed';i++)modernResult=await modern.step();
  assert.deepEqual(modern.published,['one','two']);
  const modernReviews=modern.requests.map(b=>JSON.parse(b.messages[1].content)).filter(p=>p.contractVersion==='translation-review-v2');
  assert.equal(modernReviews.length,4);assert.deepEqual(modernReviews.map(p=>p.phase),['units','consistency','units','consistency']);
  assert(modernReviews.every(p=>!p.outputContract&&!p.prompt&&!p.units&&p.pageContext.length));
  console.log('PASS new campaigns use compact batch review plus independent whole-page consistency without legacy templates');
  const partial=setup({},true);let progress=partial.plan;
  for(let i=0;i<20&&progress.pages[0].batchReviewProgress?.accepted!==1;i++)progress=await partial.step();
  assert.equal(progress.pages[0].batchReviewProgress.accepted,1);
  partial.invalidReview();progress=await partial.step();assert.equal(progress.pages[0].reason,'quality-contract-failed');
  assert.equal(progress.pages[0].batchReviewProgress.accepted,1);
  partial.invalidReview(false);progress=await partial.step();assert.equal(progress.pages[0].batchReviewProgress.accepted,2);
  const phases=partial.requests.map(b=>JSON.parse(b.messages[1].content)).filter(p=>p.contractVersion==='translation-review-v2').map(p=>p.phase);
  assert.deepEqual(phases,['units','consistency','consistency']);
  console.log('PASS failed consistency retries only its own batch, preserving previously accepted unit review');
  const malformed=setup();malformed.malformedReview();let recovered=malformed.plan;
  for(let i=0;i<35&&recovered.state!=='completed';i++)recovered=await malformed.step();
  assert.deepEqual(malformed.published,['one','two']);
  assert.equal(recovered.pages[0].errors[0].category,'review-contract');
  assert.equal(recovered.pages[0].lastError,undefined);
  assert(malformed.requests.some(b=>JSON.parse(b.messages[1].content).contractError?.includes('decoded')));
  console.log('PASS malformed review JSON is retained, retried with exact error, and cleared after successful validation');
  const f=setup();assert.equal(f.requests.length,0);
  let r=f.plan;for(let i=0;i<30&&r.state!=='completed';i++)r=await f.step();
  assert.equal(r.state,'completed');assert.deepEqual(f.published,['one','two']);assert.equal(f.requests.length,8);
  assert.equal(f.requests.filter(b=>JSON.parse(b.messages[1].content).role==='review').length,2);
  assert(r.accountedUsd<r.reservedUsd);console.log('PASS multi-page translation, independent review, shared budget and publication dispatch');
  const repair=setup();repair.bad();r=repair.plan;for(let i=0;i<35&&r.state!=='completed';i++)r=await repair.step();
  assert.deepEqual(repair.published,['one','two']);assert(repair.requests.some(b=>JSON.parse(b.messages[1].content).role==='repair'));
  console.log('PASS exact-unit repair followed by independent review');
  const invalid=setup();invalid.invalidReview();r=invalid.plan;
  for(let i=0;i<30&&r.state!=='completed';i++)r=await invalid.step();
  assert.equal(invalid.published.length,0);
  assert(r.pages.every(p=>p.qualityContractFailures===2&&p.lastError.category==='review-contract'));
  assert(r.pages.every(p=>p.lastError.issues.some(x=>x.kind==='rationale-too-short')));
  const retried=invalid.requests.map(b=>JSON.parse(b.messages[1].content)).filter(p=>p.contractCorrections?.length);
  assert.equal(retried.length,2);assert(retried.every(p=>!Array.isArray(p.outputContract.checkedUnits)));
  const privateDir=path.join(invalid.storage,'campaigns',invalid.plan.campaignId.slice(7));
  const responses=fs.readdirSync(privateDir).filter(n=>n.startsWith('response-'));
  assert.equal(responses.length,invalid.requests.length);
  assert(responses.every(n=>!fs.readFileSync(path.join(privateDir,n),'utf8').includes('DO NOT STORE THIS')));
  console.log('PASS rejected review retains final response, logs exact issues, provides feedback, and stops after two failures');
  // A later operator amendment can require review while retaining the earlier
  // presentation hold reason. Recovery must inspect current quality state.
  const heldFixtureFile=path.join(privateDir,'campaign.json');
  const heldFixture=JSON.parse(fs.readFileSync(heldFixtureFile));
  heldFixture.pages[0].reason='resource-browser-check-failed';
  fs.writeFileSync(heldFixtureFile,JSON.stringify(heldFixture));
  invalid.invalidReview(false);invalid.environment.STAGE2_CAMPAIGN_RECOVERY_ID='fixture-recovery-001';
  for(let i=0;i<12;i++)r=await invalid.step();
  assert.deepEqual(invalid.published,['one','two']);
  assert(r.pages.every(p=>p.qualityContractFailures===2&&p.qualityFailureLimit===4));
  const recoveredCalls=invalid.requests.length;await invalid.step();assert.equal(invalid.requests.length,recoveredCalls);
  console.log('PASS explicit recovery preserves failure history and is idempotent');
  const migration=setup();migration.invalidReview();r=migration.plan;
  for(let i=0;i<30&&r.state!=='completed';i++)r=await migration.step();
  const translationCalls=migration.requests.filter(b=>!JSON.parse(b.messages[1].content).role).length;
  migration.invalidReview(false);migration.environment.STAGE2_REVIEW_V2_CAMPAIGN=migration.plan.campaignId;
  r=await migration.step();for(let i=0;i<30&&r.state!=='completed';i++)r=await migration.step();
  assert.deepEqual(migration.published,['one','two']);assert.equal(r.reviewContract,'translation-review-v2');
  assert(r.pages.every(p=>p.qualityContractFailures===2));
  assert.equal(migration.requests.filter(b=>!JSON.parse(b.messages[1].content).role).length,translationCalls);
  const migrationCalls=migration.requests.length;await migration.step();assert.equal(migration.requests.length,migrationCalls);
  console.log('PASS explicit v2 migration reuses saved translations and preserves errors, accounting and idempotency');
  const held=setup();held.eligible(false);await held.step();await held.step();assert.equal(held.requests.length,0);assert(held.inspect().pages.every(p=>p.reason==='source-approval-required'));
  console.log('PASS unapproved sources held before spending');
  const uncertain=setup({},true,1);await uncertain.step();uncertain.uncertain();await uncertain.step();assert.equal(uncertain.inspect().state,'needs-operator-review');
  assert.equal((await uncertain.step()).state,'needs-operator-review');assert.equal(uncertain.requests.length,1);console.log('PASS uncertain page remains quarantined without resends');
  const denied=setup();denied.environment.STAGE2_DEEPSEEK_CAMPAIGN='wrong';await assert.rejects(denied.step(),/authorization/);assert.equal(denied.requests.length,0);
  console.log('PASS exact campaign authorization');
  const stale=setup();stale.stale();await stale.step();assert.equal(stale.requests.length,0);assert.equal(stale.inspect().pages[0].reason,'stale-source');
  console.log('PASS stale source is held without payment');
  const budget=setup({budgetUsd:0.065});budget.fullUsage();r=budget.plan;
  for(let i=0;i<30&&['prepared','running'].includes(r.state);i++)r=await budget.step();
  assert.equal(r.state,'budget-exhausted');assert(r.accountedUsd<=0.065);const paid=budget.requests.length;
  await budget.step();assert.equal(budget.requests.length,paid);console.log('PASS shared budget stops before sending unaffordable next task');
  const interrupted=setup();const jobFile=path.join(interrupted.storage,'campaigns',interrupted.plan.campaignId.slice(7),'campaign.json');
  const job=JSON.parse(fs.readFileSync(jobFile));job.pages[0].pendingQualityTask=true;fs.writeFileSync(jobFile,JSON.stringify(job));
  const crash=await interrupted.step();assert.equal(crash.pages[0].reason,'request-reconciliation-required');assert.equal(interrupted.requests.length,0);assert.equal(crash.pages[1].state,'translating');console.log('PASS crash isolates affected page without blocking unrelated work');
  const listed=spawnSync(process.execPath,[path.resolve(__dirname,'../../tools/deepdive-stage2/mcp-server.js')],{
    env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:'translation-campaign',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold',STAGE2_DEEPSEEK_LIVE:'0'},
    input:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})+'\n',encoding:'utf8'});
  assert.equal(listed.status,0,listed.stderr);const tools=JSON.parse(listed.stdout.trim()).result.tools.map(t=>t.name).sort();
  assert.deepEqual(tools,['stage2_build_translation_campaign','stage2_inspect_translation_campaign','stage2_step_translation_campaign']);
  console.log('PASS dedicated MCP profile exposes only campaign operations');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>fs.rmSync(root,{recursive:true,force:true}));
