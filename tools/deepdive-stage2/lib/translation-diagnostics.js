'use strict';
// Read-only controller diagnostics. Never invokes a provider or submits evidence.
const fs = require('node:fs'), path = require('node:path');
function inspectEvidence(units, evidence) {
  const issues = [], byKey = new Map(units.map(u => [u.key, u]));
  const add = (kind, key) => issues.push({kind, unitKey:key || null});
  const checked = evidence?.checkedUnits;
  if(!evidence||Object.keys(evidence).sort().join()!=='checkedUnits,findings,wholePageRationale')add('unexpected-evidence-fields');
  if (!Array.isArray(checked)) return [{kind:'checkedUnits-not-array',unitKey:null}];
  if (checked.length !== units.length) add('unit-count');
  if (new Set(checked.map(x=>x?.unitKey)).size !== checked.length) add('duplicate-unit');
  function quotes(item) {
    if(!item||typeof item!=='object'){add('invalid-unit-evidence');return;}
    const unit = byKey.get(item.unitKey);
    if (!unit) { add('unknown-unit',item.unitKey); return; }
    for (const [field, text] of [['sourceQuote',unit.source],['translationQuote',unit.translation]]) {
      if (typeof item[field] !== 'string' || !item[field].trim() || !text.includes(item[field])) add(field+'-not-exact',item.unitKey);
    }
  }
  for (const item of checked) {
    quotes(item);
    if (typeof item?.rationale !== 'string' || item.rationale.trim().length < 20) add('rationale-too-short',item?.unitKey);
  }
  if (typeof evidence.wholePageRationale !== 'string' || evidence.wholePageRationale.trim().length < 40) add('whole-page-rationale-too-short');
  if (!Array.isArray(evidence.findings)) add('findings-not-array');
  else for (const item of evidence.findings) {
    quotes(item);
    if (![4,7,8].includes(item?.rule)) add('finding-rule',item?.unitKey);
    if (typeof item?.reason !== 'string' || item.reason.trim().length < 20) add('finding-reason-too-short',item?.unitKey);
  }
  return issues;
}
async function diagnose(d, root, dir, job, pageIds) {
  if(pageIds&&(!Array.isArray(pageIds)||!pageIds.length||pageIds.some(id=>!job.pages.some(p=>p.pageId===id))))throw Error('Invalid diagnostic page scope');
  const tasks = fs.readdirSync(dir).filter(n=>/^task-deepseek-(review|repair)-[a-f0-9-]+\.json$/.test(n)).map(n=>{
    const file=path.join(dir,n);
    if(fs.lstatSync(file).isSymbolicLink())throw Error('Unsafe diagnostic task');
    return JSON.parse(fs.readFileSync(file,'utf8'));
  });
  const pages=[];
  for(const page of job.pages) {
    if(pageIds&&!pageIds.includes(page.pageId))continue;
    const result={pageId:page.pageId,state:page.state,reason:page.reason}; pages.push(result);
    if(!page.reviewId)continue;
    await d.quality.withTranslationQualityMaterial(root,page.pageId,page.reviewId,async value=>{
      const units=value.material.chapters.flatMap(c=>c.units.map(u=>({...u,key:c.chapterId+'/'+u.id,translation:c.output.translations[u.id]})));
      result.qualityState=value.report.state;
      result.snapshotId=value.material.snapshotId;
      result.revision=value.report.revision;
      result.findingHistory=value.report.findingHistory;
      result.interventionReason=value.report.interventionReason;
      result.qualitySummary=value.report.qualitySummary;
      result.systemError=page.lastError||null;
      result.defects=value.report.defects;
      result.localizedDefects=units.filter(u=>value.report.defects.some(x=>x.unitKey===u.key)).map(u=>({unitKey:u.key,source:u.source,translation:u.translation}));
      result.savedTasks=tasks.filter(t=>t.pageId===page.pageId).map(t=>{
        if(t.contractVersion==='translation-rounds-v1')return {workerId:t.workerId,revisionMatches:t.revision===value.report.revision,contractVersion:t.contractVersion,findings:t.evidence.findings.map(f=>{const u=units.find(u=>u.key===f.unitKey);return {...f,source:u?.source,translation:u?.translation};})};
        if(t.contractVersion==='translation-review-v2'){
          let issues=null;
          if(t.revision===value.report.revision){
            try {const batches=require('./translation-review-batches'),batch=batches.plan(t.revision,units).find(b=>b.batchId===t.batchId);if(!batch)throw Error('Unknown batch');batches.validate(batch,t.evidence,units);issues=[];}
            catch(e){issues=e.issues||[{kind:e.message}];}
          }
          return {workerId:t.workerId,contractVersion:t.contractVersion,batchId:t.batchId,revisionMatches:t.revision===value.report.revision,issues};
        }
        const issues=t.workerId.startsWith('deepseek-review-')&&t.revision===value.report.revision?inspectEvidence(units,t.evidence):null;
        const samples=issues?.filter((x,i,a)=>a.findIndex(y=>y.kind===x.kind)===i).map(issue=>{
          const item=t.evidence.checkedUnits.find(x=>x.unitKey===issue.unitKey);
          const unit=units.find(x=>x.key===issue.unitKey);
          return {...issue,source:unit?.source,translation:unit?.translation,sourceQuote:item?.sourceQuote,translationQuote:item?.translationQuote,rationale:item?.rationale};
        });
        return {workerId:t.workerId,revisionMatches:t.revision===value.report.revision,
          ...(t.workerId.startsWith('deepseek-review-') ? {issues,samples} : {replacements:t.evidence})};
      });
      result.qualityCalls=job.calls.filter(c=>c.pageId===page.pageId&&c.phase==='quality').length;
      if(page.reason==='resource-browser-check-failed'||process.env.STAGE2_LAYOUT_DIAGNOSTICS==='1') {
        try {
          const candidate=require('./translation-publication').layoutPreview(value);
          result.svgPresentationSource=candidate.payload.page.html.match(/<svg\b[\s\S]*?<\/svg>/gi);
          result.mathPresentationSource=candidate.payload.page.html.match(/<math\b[\s\S]*?<\/math>/gi);
          result.svgLayoutSource={headers:candidate.payload.page.html.match(/<svg\b[^>]*>/gi),endings:candidate.payload.page.html.match(/<\/svg[^>]*>/gi),labels:candidate.payload.page.html.match(/<text\b[^>]*>/gi)};
          await require('./translation-browser-verifier').verifyTranslationBrowser(root,candidate,value.snapshot.capture.page,{captureDiagrams:process.env.STAGE2_LAYOUT_DIAGNOSTICS==='1'});
          result.browserRecheck={passed:true};
        } catch(e) { result.browserRecheck={passed:false,error:e.message,diagnostic:require('./translation-error').failure(e,'publication')}; }
      }
    });
  }
  const usageIssues=job.calls.filter(c=>c.state==='usage-review').map(c=>{
    if(!/^response-[a-f0-9-]+\.json$/.test(c.responseFile||''))return {pageId:c.pageId,error:'Missing saved response'};
    const file=path.join(dir,c.responseFile);if(fs.lstatSync(file).isSymbolicLink())throw Error('Unsafe response file');
    const response=JSON.parse(fs.readFileSync(file,'utf8'));
    return {pageId:c.pageId,phase:c.phase,requestHash:c.requestHash,reservedUsd:c.reservedUsd,
      maxOutputTokens:job.plan.config.maxOutputTokens,usage:response.usage,responseId:response.id,
      model:response.model,finishReasons:response.choices?.map(x=>x.finish_reason)};
  });
  const uncertainCalls=job.calls.filter(c=>['sending','uncertain'].includes(c.state)).map(c=>({
    pageId:c.pageId,phase:c.phase,state:c.state,requestHash:c.requestHash,
    reservedUsd:c.reservedUsd,responseSaved:!!c.responseFile,error:c.error||null
  }));
  const recentResponses=job.calls.filter(c=>c.responseFile).slice(-5).map(c=>{
    if(!/^response-[a-f0-9-]+\.json$/.test(c.responseFile))throw Error('Unsafe response name');
    const file=path.join(dir,c.responseFile);if(fs.lstatSync(file).isSymbolicLink())throw Error('Unsafe response file');
    const r=JSON.parse(fs.readFileSync(file,'utf8'));
    let reviewContractShape=null;
    if(c.phase==='quality')try{const raw=JSON.parse(r.choices?.[0]?.message?.content);if(Array.isArray(raw.findings))reviewContractShape={fields:Object.keys(raw),findings:raw.findings.map(f=>({unitKey:f.unitKey,rule:f.rule,reasonType:typeof f.reason,reasonLength:typeof f.reason==='string'?f.reason.length:null,fields:Object.keys(f)}))};}catch(_){}
    let syntax=null;const content=r.choices?.[0]?.message?.content;
    if(typeof content==='string')try{JSON.parse(content);}catch(e){const pos=Number(e.message.match(/position (\d+)/)?.[1]);syntax={error:e.message,length:content.length,excerpt:Number.isFinite(pos)?content.slice(Math.max(0,pos-100),pos+100):content.slice(-150)};}
    return {pageId:c.pageId,state:c.state,requestHash:c.requestHash,usage:r.usage,finishReasons:r.choices?.map(x=>x.finish_reason),syntax,reviewContractShape};
  });
  const usageReport=require('./translation-usage-report').usageReport(job,tasks,name=>{
    if(!/^response-[a-f0-9-]+\.json$/.test(name))throw Error('Unsafe response name');
    const file=path.join(dir,name);if(fs.lstatSync(file).isSymbolicLink())throw Error('Unsafe response file');
    return JSON.parse(fs.readFileSync(file,'utf8'));
  });
  return {readOnly:true,providerCalls:0,deployed:false,pages,usageIssues,uncertainCalls,recentResponses,usageReport};
}
module.exports={diagnose,inspectEvidence};
