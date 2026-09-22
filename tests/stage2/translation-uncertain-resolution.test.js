'use strict';
const assert=require('node:assert/strict');
const {resolve}=require('../../tools/deepdive-stage2/lib/translation-uncertain-resolution');
const id='sha256:'+'a'.repeat(64),reason='User requests completing the page; retain unknown usage reservation and obtain a fresh independent review.';
const make=()=>({state:'needs-operator-review',calls:[{requestHash:id,pageId:'test',phase:'quality',state:'uncertain',reservedUsd:.65}],pages:[{pageId:'test',state:'held',reason:'request-reconciliation-required',pendingQualityTask:true,batchReviewProgress:{accepted:2,total:35}}]});
const job=make();assert(resolve(job,id,reason));assert.equal(job.calls[0].costUsd,undefined);assert.equal(job.calls[0].reservedUsd,.65);assert.equal(job.calls[0].resolution.auditAccepted,false);assert.equal(job.pages[0].batchReviewProgress.accepted,2);assert.equal(job.pages[0].state,'quality');assert.equal(resolve(job,id,reason),false);
for(const change of [j=>j.calls[0].state='sending',j=>j.calls[0].responseFile='saved.json',j=>j.calls[0].costUsd=0,j=>j.calls.push({...j.calls[0]}),j=>j.pages[0].pendingQualityTask=false]){const j=make();change(j);assert.throws(()=>resolve(j,id,reason));}
assert.throws(()=>resolve(make(),id,'short'));console.log('PASS exact authorized replacement retains unknown charge, prior review progress and idempotency; rejects live/saved/ambiguous calls');
