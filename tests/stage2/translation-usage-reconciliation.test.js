'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {reconcile}=require('../../tools/deepdive-stage2/lib/translation-usage-reconciliation');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'usage-reconciliation-'));
try {
 const requestHash='sha256:'+'a'.repeat(64),file='response-abcd.json';
 const response={requestHash,pageId:'test',phase:'quality',model:'deepseek-v4-pro',usage:{prompt_tokens:81496,completion_tokens:32001,total_tokens:113497},choices:[{finish_reason:'length',message:{role:'assistant',refusal:false,toolCallCount:0,content:'{"truncated":'}}]};
 const fixture=()=>({state:'needs-operator-review',plan:{config:{model:'deepseek-v4-pro',maxOutputTokens:32000,contextWindow:1000000,inputUsdPerMillion:1.32,outputUsdPerMillion:3.96}},calls:[{requestHash,pageId:'test',phase:'quality',state:'usage-review',responseFile:file,reservedUsd:.60285852}],pages:[{pageId:'test',state:'quality',pendingQualityTask:true}]});
 const save=x=>fs.writeFileSync(path.join(dir,file),JSON.stringify(x));save(response);
 const job=fixture();assert(reconcile(job,dir,requestHash,64000));
 assert.equal(job.calls[0].reconciliation.auditAccepted,false);assert.equal(job.pages[0].qualityMaxOutputTokens,64000);assert.equal(job.pages[0].state,'held');assert.equal(job.pages[0].pendingQualityTask,undefined);
 assert(Math.abs(job.calls[0].costUsd-.23429868)<1e-9);assert.equal(reconcile(job,dir,requestHash,64000),false);
 for(const change of [r=>r.choices[0].finish_reason='stop',r=>r.usage.total_tokens++,r=>r.requestHash='sha256:'+'b'.repeat(64),r=>r.usage.completion_tokens=90000]){const r=structuredClone(response);change(r);save(r);assert.throws(()=>reconcile(fixture(),dir,requestHash,64000));}
 save(response);const uncertain=fixture();uncertain.calls[0].state='uncertain';assert.throws(()=>reconcile(uncertain,dir,requestHash,64000));
 const exceeded=fixture();exceeded.calls[0].reservedUsd=.01;assert.throws(()=>reconcile(exceeded,dir,requestHash,64000));
 console.log('PASS exact saved truncated response accounted once, no audit acceptance; uncertain/mismatched/over-budget responses rejected');
}finally{assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));assert(path.basename(dir).startsWith('usage-reconciliation-'));fs.rmSync(dir,{recursive:true,force:true});}

