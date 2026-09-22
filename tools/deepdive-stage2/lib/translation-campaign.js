"use strict";
// Trusted coordinator: model responses remain untrusted and go through the existing gates.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { configuration, createTranslationDeepSeek } = require('./translation-deepseek');
const { createDeepSeekClient } = require('./deepseek-client');
const hash = x => 'sha256:' + crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const check = (x, message) => { if (!x) throw Error(message); };
function safeDir(dir) {
  let current = path.parse(path.resolve(dir)).root;
  for (const part of path.resolve(dir).slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) fs.mkdirSync(current);
    check(fs.lstatSync(current).isDirectory() && !fs.lstatSync(current).isSymbolicLink(), 'Unsafe campaign directory');
  }
}
function save(file, value) {
  check(!fs.existsSync(file) || !fs.lstatSync(file).isSymbolicLink(), 'Unsafe campaign file');
  const temp = file + '.' + crypto.randomUUID() + '.tmp';
  try { fs.writeFileSync(temp, JSON.stringify(value), { flag: 'wx' }); fs.renameSync(temp, file); }
  finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}
function createTranslationCampaign(d) {
  const environment = d.environment || process.env;
  function location(root, id) {
    check(/^sha256:[a-f0-9]{64}$/.test(id), 'Invalid campaign ID');
    return path.join(d.storageDirectory(root), 'campaigns', id.slice(7));
  }
  function read(root, id) {
    const dir = location(root, id); safeDir(dir);
    const file = path.join(dir, 'campaign.json');
    check(!fs.lstatSync(file).isSymbolicLink(), 'Unsafe campaign file');
    const job = JSON.parse(fs.readFileSync(file, 'utf8'));
    check(hash(job.plan) === id, 'Campaign plan changed');
    return job;
  }
  function view(job) {
    return { campaignId: hash(job.plan), state: job.state, budgetUsd: job.plan.config.budgetUsd,
      automaticPendingPages:job.pages.filter(p=>!['published','held'].includes(p.state)).length,
      manualPendingPages:job.pages.filter(p=>p.state==='held'&&p.reason?.startsWith('manual-')).length,
      heldPages:job.pages.filter(p=>p.state==='held').length,
      reviewContract:job.reviewContractVersion===6?'translation-rounds-v1':job.reviewContractVersion>=5?'translation-review-v2':'legacy-v1',
      concurrency:job.concurrency||1,
      reservedUsd: job.calls.reduce((n, c) => n + c.reservedUsd, 0),
      accountedUsd: job.calls.reduce((n, c) => n + (c.costUsd ?? c.reservedUsd), 0),
      calls: job.calls.length, pages: job.pages.map(p => ({...p})), deployed: false };
  }
  function build(root, pages, inputConfig) {
    const config = configuration(inputConfig);
    check(config.budgetUsd <= 80, 'Campaign exceeds the authorized USD 80 ceiling');
    check(config.reasoningEffort === 'high', 'Campaign translation requires high');
    check(Array.isArray(pages) && pages.length > 0 && pages.length <= 130
      && new Set(pages.map(p => p.pageId)).size === pages.length, 'Explicit unique page scope required');
    for (const p of pages) {
      check(Object.keys(p).sort().join() === 'pageId,snapshotId' && /^[a-z0-9][a-z0-9-]*$/.test(p.pageId)
        && /^sha256:[a-f0-9]{64}$/.test(p.snapshotId), 'Invalid page snapshot binding');
      check(d.checkTranslationSnapshot(root, p.pageId, p.snapshotId).state === 'prepared', 'Stale campaign source');
    }
    const plan = { schemaVersion: 1, provider: 'deepseek', config, pages,
      policy: 'independent-review-two-repairs-auto-publication-v1' };
    const id = hash(plan), dir = location(root, id); safeDir(dir);
    const file = path.join(dir, 'campaign.json');
    if (!fs.existsSync(file)) save(file, { plan, reviewContractVersion:6, state: 'prepared', calls: [], pages: pages.map(p => ({ ...p, state: 'queued' })) });
    return view(read(root, id));
  }
  async function step(root, id) {
    const dir = location(root, id); safeDir(dir);
    if(environment.STAGE2_RECOVER_INTERRUPTED_REQUEST)require('./translation-interrupted-operation').recover({directory:dir,campaignId:id,job:read(root,id),environment,save});
    const lock = path.join(dir, 'operation.lock'); fs.writeFileSync(lock,JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()}),{flag:'wx'});
    try {
      const job = read(root, id), config = job.plan.config;
      check(environment.STAGE2_DEEPSEEK_CAMPAIGN === id && environment.STAGE2_DEEPSEEK_LIVE === '1'
        && environment.DEEPSEEK_ACCOUNT_ID === config.accountId, 'Exact campaign/account authorization required');
      const persist = () => save(path.join(dir, 'campaign.json'), job);
      function holdForHuman(page,trigger) {
        page.state='held';page.reason='manual-repair-required';
        page.manualIntervention={trigger,at:new Date().toISOString(),automaticSlotOccupied:false};
        delete page.pendingQualityTask;
      }
      if(environment.STAGE2_ROUND_REVIEW_CAMPAIGN===id&&job.reviewContractVersion!==6){
        check(!job.calls.some(c=>c.state==='sending'),'Cannot change review protocol during a live request');
        job.reviewContractVersion=6;job.roundReviewMigration={at:new Date().toISOString(),previousReceiptsRetained:true};persist();
      }
      const unresolved = p => p.pendingQualityTask || job.calls.some(c=>c.pageId===p.pageId&&['sending','uncertain','usage-review'].includes(c.state));
      // Unknown usage stays reserved. A response with invalid/excessive usage
      // still stops spending globally because its reservation may be insufficient.
      const unsafeUsage = () => job.calls.some(c=>c.state==='usage-review');
      if(environment.STAGE2_REPLACE_TRANSLATION_CAMPAIGN===id) {
        const hashes=JSON.parse(environment.STAGE2_REPLACE_TRANSLATION_REQUESTS||'null');
        const reason=environment.STAGE2_REPLACE_TRANSLATION_REASON;
        check(Array.isArray(hashes)&&hashes.length>0&&new Set(hashes).size===hashes.length,'Exact unique replacement requests required');
        check(typeof reason==='string'&&reason.length>=40,'Explicit replacement reason required');
        const targets=hashes.map(h=>{const matches=job.calls.filter(c=>c.requestHash===h&&['uncertain','abandoned-unknown'].includes(c.state));check(matches.length===1,'Unique original translation call required');return matches[0];});
        check(!job.calls.some(c=>['sending','uncertain','usage-review'].includes(c.state)&&!targets.includes(c)),'Other unsettled calls exist');
        for(const call of targets) {
          check(call.phase==='translating'&&['uncertain','abandoned-unknown'].includes(call.state),'Only uncertain translation requests can be replaced');
          check(!call.responseFile&&!call.responseId&&call.costUsd==null,'Saved response requires reconciliation');
          check(Number.isFinite(call.reservedUsd)&&call.reservedUsd>0,'Missing original reservation');
          const page=job.pages.find(p=>p.pageId===call.pageId);
          check(page?.planId&&d.checkTranslationSnapshot(root,page.pageId,page.snapshotId).state==='prepared','Replacement source changed');
        }
        for(const call of targets) {
          if(call.state==='abandoned-unknown')continue;
          const page=job.pages.find(p=>p.pageId===call.pageId);
          check(page.state==='held'&&page.reason==='request-reconciliation-required'&&!page.reviewId,'Expected interrupted translation page');
          createTranslationDeepSeek(d).replaceUncertainTranslation(root,page.pageId,page.planId,call.requestHash,reason);
          call.state='abandoned-unknown';call.resolution={kind:'operator-authorized-replacement-translation',reason,at:new Date().toISOString(),actualUsageKnown:false};
          page.state='translating';delete page.reason;job.state='running';persist();
        }
      }
      for(const p of job.pages.filter(unresolved)) {
        p.state='held';p.reason='request-reconciliation-required';
      }
      if(job.state==='needs-operator-review'&&!unsafeUsage()&&job.pages.some(unresolved))job.state='running';
      if(environment.STAGE2_REPLACE_UNCERTAIN_REQUEST) {
        const target=job.calls.find(c=>c.requestHash===environment.STAGE2_REPLACE_UNCERTAIN_REQUEST);
        check(target&&d.checkTranslationSnapshot(root,target.pageId,job.pages.find(p=>p.pageId===target.pageId).snapshotId).state==='prepared','Replacement source changed');
        if(require('./translation-uncertain-resolution').resolve(job,environment.STAGE2_REPLACE_UNCERTAIN_REQUEST,environment.STAGE2_REPLACE_UNCERTAIN_REASON))persist();
      }
      const concurrency=Number(environment.STAGE2_CAMPAIGN_CONCURRENCY||job.concurrency||1);
      check(Number.isInteger(concurrency)&&concurrency>=1&&concurrency<=5,'Concurrency must be between 1 and 5');
      job.concurrency=concurrency;
      if(environment.STAGE2_REVIEW_V2_CAMPAIGN===id&&job.reviewContractVersion!==5){
        check(!job.pages.some(p=>p.pendingQualityTask)&&!job.calls.some(c=>['sending','uncertain','usage-review'].includes(c.state)),'Cannot migrate an in-flight review');
        job.reviewContractVersion=5;job.reviewContractMigration={at:new Date().toISOString(),from:'legacy',to:'translation-review-v2'};
        for(const p of job.pages)if(p.state==='held'&&p.reason==='quality-contract-failed'&&p.reviewId&&d.quality.inspectTranslationQuality(root,p.pageId,p.reviewId).state==='awaiting-independent-review'){
          p.state='quality';delete p.reason;
        }
        if(job.pages.some(p=>p.state==='quality'))job.state='running';persist();
      }
      if(environment.STAGE2_RECONCILE_USAGE_REQUEST) {
        const target=job.calls.find(c=>c.requestHash===environment.STAGE2_RECONCILE_USAGE_REQUEST);
        check(target&&d.checkTranslationSnapshot(root,target.pageId,job.pages.find(p=>p.pageId===target.pageId).snapshotId).state==='prepared','Reconciliation source changed');
        if(require('./translation-usage-reconciliation').reconcile(job,dir,environment.STAGE2_RECONCILE_USAGE_REQUEST,Number(environment.STAGE2_REVIEW_MAX_OUTPUT_TOKENS)))persist();
      }
      // Explicit, idempotent operator recovery after fixing the cause; never erase history.
      const recovery=environment.STAGE2_CAMPAIGN_RECOVERY_ID;
      if(recovery&&!job.recoveries?.includes(recovery)) {
        check(/^[a-z0-9-]{8,80}$/.test(recovery),'Invalid recovery ID');
        const recoveryPages=environment.STAGE2_CAMPAIGN_RECOVERY_PAGES?JSON.parse(environment.STAGE2_CAMPAIGN_RECOVERY_PAGES):null;
        check(!recoveryPages||(Array.isArray(recoveryPages)&&recoveryPages.length&&recoveryPages.every(id=>job.pages.some(p=>p.pageId===id))),'Invalid recovery page scope');
        for(const p of job.pages.filter(p=>p.state==='held'&&p.reviewId&&!unresolved(p)&&(!recoveryPages||recoveryPages.includes(p.pageId)))) {
          let current=d.quality.inspectTranslationQuality(root,p.pageId,p.reviewId);
          const extra=environment.STAGE2_EXTRA_REPAIR_SCOPE?JSON.parse(environment.STAGE2_EXTRA_REPAIR_SCOPE):{};
          if(extra[p.pageId]) {
            current=d.quality.authorizeExtraRepair(root,p.pageId,p.reviewId,recovery,extra[p.pageId]);
            if(current.state==='needs-repair'){p.state='quality';p.qualityFailureLimit=(p.qualityContractFailures||0)+2;delete p.reason;}
          }
          if(current.state==='needs-repair'&&['stale','quality-contract-failed','manual-review-required','manual-repair-required'].includes(p.reason)) {p.state='quality';delete p.reason;}
          if(current.state==='awaiting-independent-review'&&['quality-contract-failed','manual-review-required','manual-repair-required','resource-browser-check-failed'].includes(p.reason)) {
            if(environment.STAGE2_REVIEW_MAX_OUTPUT_TOKENS){
              const max=Number(environment.STAGE2_REVIEW_MAX_OUTPUT_TOKENS);
              check(Number.isInteger(max)&&max>=config.maxOutputTokens&&max<=Math.min(128000,config.contextWindow/2),'Invalid review output allowance');
              p.qualityMaxOutputTokens=max;
            }
            p.qualityFailureLimit=(p.qualityContractFailures||0)+2;p.state='quality';delete p.reason;
          } else if(current.state==='awaiting-resource-browser-human-review'&&['resource-browser-check-failed','manual-review-required','manual-repair-required'].includes(p.reason)) {p.state='publication';delete p.reason;}
        }
        job.recoveries=(job.recoveries||[]).concat(recovery);
        if(job.pages.some(p=>['quality','publication'].includes(p.state)))job.state='running';
        persist();
      }
      // Old no-op records are terminal too: do not recover them as JSON/schema failures.
      for(const p of job.pages)if(p.state==='held'&&p.reason==='quality-contract-failed'
        &&p.lastError?.message==='No-op repair'&&!unresolved(p))holdForHuman(p,'no-op-repair');
      persist();
      if(['budget-exhausted','needs-operator-review'].includes(job.state))return view(job);
      if(unsafeUsage()){job.state='needs-operator-review';persist();return view(job);}
      const presentationRecovery=require('./translation-presentation-recovery');
      for(const p of job.pages.filter(p=>p.state==='held'&&p.reviewId&&!unresolved(p))){
        if(presentationRecovery.eligible(p,d.quality.inspectTranslationQuality(root,p.pageId,p.reviewId))){
          p.presentationRepairVersion=presentationRecovery.VERSION;p.state='publication';delete p.reason;
          job.state='running';persist();
        }
      }
      // A fully received response which failed only the evidence schema may be
      // regenerated from the saved translation. This is not an uncertain resend.
      let recoveredQualityPage = false;
      for (const candidate of job.pages) if (candidate.state === 'held' && candidate.reason === 'quality-contract-failed'
        && (job.reviewContractVersion>=5?(candidate.batchContractFailures||0)<2:(candidate.qualityContractFailures || 0) < (candidate.qualityFailureLimit||2)) && candidate.reviewId) {
        const status = d.quality.inspectTranslationQuality(root, candidate.pageId, candidate.reviewId);
        if (status.state === 'awaiting-independent-review') {
          candidate.qualityContractVersion = 4;
          candidate.state = 'quality'; delete candidate.reason;
          recoveredQualityPage = true;
        }
      }
      if (recoveredQualityPage) job.state = 'running';
      else if (job.state === 'completed') return view(job);
      const eligible = job.pages.filter(p => !['published', 'held'].includes(p.state)&&!unresolved(p));
      const ready=concurrency===1?eligible.slice(0,1):eligible;
      if (!ready.length) { job.state = job.pages.some(unresolved)?'needs-operator-review':'completed'; persist(); return view(job); }
      // One controller owns the on-disk ledger. Within it, up to five page
      // workers share the same job object. Synchronous reserve+persist is atomic
      // before any await; a second process is excluded by operation.lock.
      let publicationTail=Promise.resolve();
      async function processPage(page) {
      if (d.checkTranslationSnapshot(root, page.pageId, page.snapshotId).state !== 'prepared') {
        page.state = 'held'; page.reason = 'stale-source'; persist(); return view(job);
      }
      // A single shared transport accounts for translation, review and repair, including retries.
      const client = {
        assertAuthorized() { check(environment.DEEPSEEK_API_KEY || d.client, 'Missing DeepSeek credentials'); },
        preflight(plan,body) {
          if(['budget-exhausted','needs-operator-review'].includes(job.state)){
            const error=Error('Campaign scheduling stopped');error.code='SCHEDULING_STOPPED';throw error;
          }
          const inputBound = Buffer.byteLength(JSON.stringify(body)) + 2048;
          check(inputBound + body.max_tokens <= config.contextWindow, 'Campaign context bound exceeded');
          const reservedUsd = (inputBound * config.inputUsdPerMillion + body.max_tokens * config.outputUsdPerMillion) / 1e6;
          const spent = job.calls.reduce((n,c) => n + (c.costUsd ?? c.reservedUsd), 0);
          const limit=environment.STAGE2_CAMPAIGN_SPEND_LIMIT_USD===undefined?config.budgetUsd:Number(environment.STAGE2_CAMPAIGN_SPEND_LIMIT_USD);
          check(Number.isFinite(limit)&&limit>0&&limit<=config.budgetUsd,'Invalid reduced campaign spending limit');
          if(spent+reservedUsd>limit){job.state='budget-exhausted';persist();throw Error('Campaign budget exhausted');}
          return {inputBound,reservedUsd};
        },
        async complete(plan, body) {
          const {inputBound,reservedUsd}=client.preflight(plan,body);
          const call = { pageId: page.pageId, phase: page.state, requestHash: hash(body), reservedUsd, state: 'sending' };
          const finishTiming=require('./translation-timing').startTiming(call);
          job.calls.push(call); persist();
          // Authorization is narrowed to this exact derived request plan. Never mutate process.env.
          const provider = d.client || createDeepSeekClient({ environment: {...environment, STAGE2_DEEPSEEK_APPROVED_PLAN: plan.planId} });
          let response;
          try { response = await provider.complete(plan, body); }
          catch (error) { finishTiming(); call.error = require('./translation-error').failure(error,page.state,environment); call.state = 'uncertain'; persist(); throw Error('Uncertain campaign call'); }
          finishTiming();
          // Retain final response before parsing/validation; never persist hidden reasoning or credentials.
          call.responseFile='response-'+crypto.randomUUID()+'.json';
          save(path.join(dir,call.responseFile),{pageId:page.pageId,phase:page.state,requestHash:call.requestHash,
            id:response?.id,model:response?.model,usage:response?.usage,
            choices:response?.choices?.map(c=>({finish_reason:c.finish_reason,message:{role:c.message?.role,content:c.message?.content,refusal:!!c.message?.refusal,toolCallCount:c.message?.tool_calls?.length||0}}))});
          const usage = response?.usage;
          const valid = Number.isSafeInteger(usage?.prompt_tokens) && usage.prompt_tokens >= 0
            && Number.isSafeInteger(usage?.completion_tokens) && usage.completion_tokens >= 0
            && usage.prompt_tokens <= inputBound && usage.completion_tokens <= body.max_tokens;
          call.state = valid ? 'received' : 'usage-review';
          if (valid) call.costUsd = (usage.prompt_tokens * config.inputUsdPerMillion + usage.completion_tokens * config.outputUsdPerMillion) / 1e6;
          call.responseId = typeof response?.id === 'string' ? response.id : null;
          persist();
          check(valid, 'Unknown or excessive usage; campaign stopped');
          return response;
        }
      };
      const translation = createTranslationDeepSeek({ ...d, client });
      try {
        if (page.state === 'queued') {
          let offset = 0, text = '', part;
          do { part = d.readTranslationSnapshot(root, page.pageId, page.snapshotId, offset, 12000); text += part.content; offset = part.nextOffset; } while (!part.done);
          // Do not spend translating a source which cannot currently be published.
          if (!JSON.parse(text).capture.approvalEvidence.sourceEligibleForEnglishReview) {
            page.state = 'held'; page.reason = 'source-approval-required';
          } else {
            const plan = translation.buildDeepSeekTranslation(root, page.pageId, page.snapshotId, config);
            check(plan.attempts.length === 0, 'Existing paid plan requires explicit adoption; no duplicate accounting');
            page.planId = plan.planId; page.state = 'translating';
          }
        } else if (page.state === 'translating') {
          const before = translation.inspectDeepSeekTranslation(root, page.pageId, page.planId);
          const result = await translation.runDeepSeekTranslation(root, page.pageId, page.planId, before.state === 'needs-explicit-retry');
          if (result.state === 'received-unreviewed') { page.reviewId = d.quality.beginTranslationQuality(root, page.pageId, page.planId, 'deepseek').reviewId; page.state = 'quality'; }
          else if (['needs-operator-review', 'stale'].includes(result.state)) throw Error('Translation blocked: ' + result.state);
        } else if (page.state === 'quality') {
          page.qualityContractVersion = 4;
          if(job.reviewContractVersion===6&&d.quality.inspectTranslationQuality(root,page.pageId,page.reviewId).state==='awaiting-independent-review')d.quality.enableRoundReview(root,page.pageId,page.reviewId);
          if(job.reviewContractVersion===6)page.batchReviewProgress=d.quality.inspectTranslationQuality(root,page.pageId,page.reviewId).batchReviewProgress;
          const report = d.quality.inspectTranslationQuality(root, page.pageId, page.reviewId), next = report.reviewSchedule.next;
          if (!next) {
            if (report.state === 'awaiting-resource-browser-human-review') page.state = 'publication';
            else if(report.state==='manual-review-required')holdForHuman(page,report.repairCount>=2?'repair-limit-reached':'quality-adjudication-required');
            else { page.state = 'held'; page.reason = report.state; }
          } else {
            const role = next.role === 'translation-review' ? 'review' : 'repair';
            if(role==='review'&&job.reviewContractVersion>=5){
              const packet=d.quality.translationReviewBatchPacket(root,page.pageId,page.reviewId);
              const priorBatchId=page.reviewBatchId;
              if(page.reviewBatchId!==packet.batchId){page.reviewBatchId=packet.batchId;page.batchContractFailures=0;}
              const {prompt,...data}=packet;
              const body={model:config.model,stream:false,max_tokens:page.qualityMaxOutputTokens||config.maxOutputTokens,thinking:{type:'enabled'},
                reasoning_effort:next.reasoningEffort==='medium'?'high':next.reasoningEffort,response_format:{type:'json_object'},
                messages:[{role:'system',content:prompt},{role:'user',content:JSON.stringify({...data,
                  contractError:page.batchContractFailures?page.lastError:undefined,
                  replacementReview:page.replacementReview?{originalRequestHash:page.replacementReview.originalRequestHash,instruction:'Fresh independent review; no evidence was accepted from the lost response.'}:undefined})}]};
              const plan={provider:'deepseek',planId:hash({id,pageId:page.pageId,revision:packet.revision,body}),config};
              page.pendingQualityTask=true;persist();
              let response;
              const replay=environment.STAGE2_REPLAY_SAVED_REVIEW;
              if(replay&&!page.replayedResponses?.includes(replay)){
                const previous=[...job.calls].reverse().find(c=>c.pageId===page.pageId&&c.phase==='quality');
                check(previous?.requestHash===replay&&previous.state==='received'&&priorBatchId===packet.batchId,'Saved review request/scope mismatch');
                check(/^response-[a-f0-9-]+\.json$/.test(previous.responseFile||''),'Missing saved review');
                const file=path.join(dir,previous.responseFile);check(!fs.lstatSync(file).isSymbolicLink(),'Unsafe saved review');
                response=JSON.parse(fs.readFileSync(file,'utf8'));
                check(response.pageId===page.pageId&&response.requestHash===replay&&response.choices?.[0]?.finish_reason==='stop','Incomplete or mismatched saved response');
              }else response=await client.complete(plan,body);
              const choice=response?.choices?.[0];
              check(response?.model===config.model||/^deepseek-v4-pro-\d{4}$/.test(response?.model||''),'Wrong quality model');
              if(response.choices?.length!==1||choice.finish_reason!=='stop'||choice.message?.role!=='assistant'||choice.message.refusal||choice.message.tool_calls?.length||choice.message.toolCallCount){
                if(choice?.finish_reason==='length')page.qualityMaxOutputTokens=Math.min(128000,Math.floor(config.contextWindow/2),body.max_tokens*2);
                const error=Error('Incomplete review batch response');error.code='REVIEW_CONTRACT';error.issues=[{kind:'incomplete-batch-response',unitKey:null}];throw error;
              }
              const rawEvidence=require('./translation-review-correction').decode(choice.message.content),workerId='deepseek-review-'+crypto.randomUUID();
              const {evidence,normalization}=require('./translation-review-batches').normalizeResponse(packet,rawEvidence);
              if(require('./translation-review-correction').removeTrailingCommas(choice.message.content)!==choice.message.content)normalization.push('Removed JSON trailing separators outside strings; original response retained');
              save(path.join(dir,'task-'+workerId+'.json'),{contractVersion:packet.contractVersion,pageId:page.pageId,revision:packet.revision,
                batchId:packet.batchId,packetHash:hash(packet),requestHash:response.requestHash||hash(body),workerId,rawEvidence,normalization,evidence});
              const accepted=d.quality.submitTranslationReviewBatch(root,page.pageId,page.reviewId,packet.revision,evidence,workerId);
              page.batchReviewProgress=accepted.batchReviewProgress;page.batchContractFailures=0;
              if(replay&&response.requestHash===replay)page.replayedResponses=(page.replayedResponses||[]).concat(replay);
              delete page.lastError;delete page.pendingQualityTask;
            } else {
            // Fresh API task: full packet, no prior conversation, no tools, no cross-page memory.
            const packet = d.quality.translationQualityPacket(root, page.pageId, page.reviewId, role);
            const correction=role==='review'?require('./translation-review-correction').previous(dir,job,page,packet):null;
            const outputUnits=correction?packet.units.filter(u=>correction.keys.includes(u.key)):packet.units;
            const exactContract = role === 'review' ? {
              checkedUnits: Object.fromEntries(outputUnits.map(unit => [unit.key, ['exact source substring from this unit only','exact translation substring from this unit only','substantive unit-specific comparison, aim for 40-100 characters; minimum 20']])),
              wholePageRationale:'at least 40 characters assessing terminology, references and logic across the complete page',
              findings:[{rule:'integer 4, 7, or 8; use an empty array only when no defect exists',unitKey:'one supplied unit key',sourceQuote:'exact source substring',translationQuote:'exact translation substring',reason:'at least 20 characters describing the defect and its impact',mqmCategory:'one category from classificationContract',severity:'minor, major, or critical'}]
            } : Object.fromEntries(packet.units.map(unit=>[unit.key,'replacement English string']));
            let contractPrompt = role === 'review'
              ? `Return one JSON object with exactly checkedUnits, findings, wholePageRationale. checkedUnits must be an object containing every supplied unitKey exactly once (${packet.units.length} keys). Each value is exactly [sourceQuote, translationQuote, rationale]. Inspect every complete unit. Quotes must be copied verbatim from that unit alone, preserving case and punctuation; never prepend words from adjacent HTML units. Each rationale must be a substantive unit-specific comparison of at least 20 characters; aim for 40-100 characters, not generic approval. Whole-page rationale must be at least 40 characters. Check all lengths and exact quotes before responding. Do not use markdown. Exact structural template: ${JSON.stringify(exactContract)}`
              : `Return one JSON object keyed only by every supplied unitKey. Do not use markdown. Exact structural template: ${JSON.stringify(exactContract)}`;
            if(correction)contractPrompt=`Review the complete page and prior rejected report supplied as data. Correct checkedUnits ONLY for reviewOutputUnitKeys (${outputUnits.length} keys); unchanged unit evidence will be retained exactly. Independently reassess all findings and wholePageRationale and return their complete values, not a patch. If other unchanged evidence is substantively wrong, record it as a finding rather than silently approving it. Every corrected rationale must be a substantive 40-100 character comparison; minimum 20. Copy quotes exactly from their own unit. Return JSON only using this exact structure: ${JSON.stringify(exactContract)}`;
            const body = { model: config.model, stream: false, max_tokens: role==='review'?(page.qualityMaxOutputTokens||config.maxOutputTokens):config.maxOutputTokens,
              thinking: {type: 'enabled'}, reasoning_effort: next.reasoningEffort === 'medium' ? 'high' : next.reasoningEffort,
              response_format: {type: 'json_object'}, messages: [{role:'system', content:packet.prompt+'\n\n'+contractPrompt},
                {role:'user', content:JSON.stringify({...packet,outputContract:exactContract,
                  contractCorrections:page.lastError?.category==='review-contract'?page.lastError.issues:undefined,
                  contractError:page.lastError?.category==='review-contract'?page.lastError.message:undefined})}] };
            if(correction)body.messages[1].content=JSON.stringify({...JSON.parse(body.messages[1].content),previousRejectedReview:correction.evidence,reviewOutputUnitKeys:correction.keys});
            const plan = {provider:'deepseek', planId:hash({id, pageId:page.pageId, revision:packet.revision, body}), config};
            page.pendingQualityTask = true; persist();
            const response = await client.complete(plan, body);
            const choice = response?.choices?.[0];
            check(response?.model === config.model || /^deepseek-v4-pro-\d{4}$/.test(response?.model || ''), 'Wrong quality model');
            check(response.choices.length === 1 && choice.finish_reason === 'stop' && choice.message?.role === 'assistant'
              && !choice.message.refusal && !choice.message.tool_calls?.length, 'Incomplete quality response');
            const transported = require('./translation-review-correction').decode(choice.message.content), workerId = 'deepseek-' + role + '-' + crypto.randomUUID();
            let evidence = transported;
            if (role === 'review') {
              try { evidence=require('./translation-review-correction').merge(correction,transported,packet.units); }
              catch(cause){const error=Error(cause.message);error.code='REVIEW_CONTRACT';error.issues=[{kind:'invalid-review-shape',unitKey:null}];throw error;}
            }
            // Persist only final evidence, not reasoning_content. Exact citations validated by quality controller.
            save(path.join(dir, 'task-' + workerId + '.json'), {pageId:page.pageId, revision:packet.revision,
              packetHash:hash(packet), requestHash:hash(body), workerId, evidence});
            if(role==='review') {
              const issues=require('./translation-diagnostics').inspectEvidence(packet.units,evidence);
              issues.push(...require('./translation-review-ledger').missingOccurrences(packet.units,evidence.findings));
              if(Array.isArray(evidence.findings)) for(const item of evidence.findings) if(!require('./translation-qa').validClassification(item,true))issues.push({kind:'mqm-classification-required',unitKey:item?.unitKey||null});
              if(issues.length){const error=Error('Review evidence failed validation');error.code='REVIEW_CONTRACT';error.issues=issues;throw error;}
            }
            if (role === 'review') d.quality.submitTranslationReview(root, page.pageId, page.reviewId, packet.revision, evidence, workerId);
            else d.quality.repairTranslationUnits(root, page.pageId, page.reviewId, packet.revision, evidence, workerId);
            delete page.lastError;
            delete page.pendingQualityTask;
            }
          }
        } else if (page.state === 'publication') {
          page.presentationRepairVersion=require('./translation-presentation-recovery').VERSION;persist();
          const publish=publicationTail.then(()=>d.autoPublish(root,page.pageId,page.reviewId,id));
          publicationTail=publish.catch(()=>{});
          const result = await publish;
          page.state = result.state === 'published-English' || result.state === 'already-published' ? 'published' : 'held';
          page.reason = result.reason; page.artifactHash = result.artifactHash;
        }
      } catch (error) {
        if(error.code==='SCHEDULING_STOPPED'){delete page.pendingQualityTask;persist();return;}
        page.lastError=require('./translation-error').failure(error,page.state,environment);
        page.errors=(page.errors||[]).concat(page.lastError);
        // Quarantine only the affected page, retaining pending task and reservation.
        if (job.calls.some(c => c.pageId===page.pageId&&['sending','uncertain','usage-review'].includes(c.state)) || /budget exhausted/.test(error.message)) {
          if(/budget exhausted/.test(error.message)){job.state='budget-exhausted';delete page.pendingQualityTask;}
          else {page.state='held';page.reason='request-reconciliation-required';if(unsafeUsage())job.state='needs-operator-review';}
        } else if(error.code==='NO_OP_REPAIR'||error.message==='No-op repair') {
          holdForHuman(page,'no-op-repair');
        } else {
          if(page.state==='quality'){
            page.qualityContractFailures=(page.qualityContractFailures||0)+1;
            if(job.reviewContractVersion>=5)page.batchContractFailures=(page.batchContractFailures||0)+1;
          }
          page.reason = page.state === 'publication' ? 'resource-browser-check-failed'
            : page.state === 'quality' ? 'quality-contract-failed' : 'translation-plan-or-output-check-failed';
          page.state = 'held'; delete page.pendingQualityTask;
        }
      }
      persist();
      }
      let cursor=0;
      const workers=Array.from({length:Math.min(concurrency,ready.length)},async()=>{
        while(cursor<ready.length&&!['budget-exhausted','needs-operator-review'].includes(job.state)){
          const page=ready[cursor++];await processPage(page);
        }
      });
      const results=await Promise.allSettled(workers);
      if(results.some(r=>r.status==='rejected')){job.state='needs-operator-review';persist();throw Error('Page worker failed; inspect before resuming');}
      const retryAvailable=job.pages.some(p=>p.state==='held'&&p.reason==='quality-contract-failed'&&p.reviewId
        &&(job.reviewContractVersion>=5?(p.batchContractFailures||0)<2:(p.qualityContractFailures||0)<(p.qualityFailureLimit||2))
        &&d.quality.inspectTranslationQuality(root,p.pageId,p.reviewId).state==='awaiting-independent-review');
      if(!['budget-exhausted','needs-operator-review'].includes(job.state))job.state=job.pages.every(p=>['published','held'].includes(p.state))&&!retryAvailable?(job.pages.some(unresolved)?'needs-operator-review':'completed'):'running';
      persist(); return view(job);
    } finally { fs.unlinkSync(lock); }
  }
  async function handover(root,id) {
    check(environment.STAGE2_CAMPAIGN_HANDOVER===id,'Exact handover authorization required');
    const dir=location(root,id),lock=path.join(dir,'operation.lock');safeDir(dir);
    const deadline=Date.now()+10000;let acquired=false;
    while(!acquired){
      try {fs.closeSync(fs.openSync(lock,'wx'));acquired=true;}
      catch(e){if(e.code!=='EEXIST')throw e;if(Date.now()>=deadline)return {state:'busy',handover:false};await new Promise(r=>setTimeout(r,1));}
    }
    try {
      const job=read(root,id);
      check(!job.pages.some(p=>p.pendingQualityTask)&&!job.calls.some(c=>['sending','uncertain','usage-review'].includes(c.state)),'Outstanding request prevents handover');
      job.concurrency=5;job.handovers=(job.handovers||[]).concat({at:new Date().toISOString(),concurrency:5});
      save(path.join(dir,'campaign.json'),job);
      // The legacy launcher has no retry on EEXIST. Hold ownership across its
      // next step so it exits between requests, never while an API is active.
      await new Promise(r=>setTimeout(r,3000));
      return {handover:true,...view(job)};
    } finally {fs.unlinkSync(lock);}
  }
  return {build, inspect:(root,id) => view(read(root,id)), step,handover,
    diagnose:(root,id,pageIds)=>require('./translation-diagnostics').diagnose(d,root,location(root,id),read(root,id),pageIds)};
}
module.exports = {createTranslationCampaign};

