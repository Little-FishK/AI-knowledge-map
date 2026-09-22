'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
// Explicit reconciliation of a fully saved LENGTH response, never a timeout or
// unknown request. Accounting the response does not accept its audit evidence.
function reconcile(job,dir,requestHash,maxOutputTokens) {
  assert(/^sha256:[a-f0-9]{64}$/.test(requestHash),'Exact request hash required');
  const matches=job.calls.filter(c=>c.requestHash===requestHash);
  assert.equal(matches.length,1,'Unique saved request required');
  const call=matches[0];
  if(call.state==='received-truncated')return false;
  assert.equal(call.state,'usage-review');assert.equal(call.phase,'quality');
  assert(!job.calls.some(c=>['sending','uncertain'].includes(c.state)),'Uncertain request cannot be reconciled');
  assert(/^response-[a-f0-9-]+\.json$/.test(call.responseFile||''));
  const file=path.join(dir,call.responseFile);assert(!fs.lstatSync(file).isSymbolicLink());
  const response=JSON.parse(fs.readFileSync(file,'utf8')),u=response.usage,c=job.plan.config;
  assert.equal(response.requestHash,requestHash);assert.equal(response.pageId,call.pageId);assert.equal(response.phase,'quality');
  assert(response.model===c.model||/^deepseek-v4-pro-\d{4}$/.test(response.model));
  assert.equal(response.choices?.length,1);assert.equal(response.choices[0].finish_reason,'length');
  assert.equal(response.choices[0].message.role,'assistant');
  assert(!response.choices[0].message.refusal&&!response.choices[0].message.toolCallCount);
  assert([u?.prompt_tokens,u?.completion_tokens,u?.total_tokens].every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.equal(u.total_tokens,u.prompt_tokens+u.completion_tokens);
  assert(u.total_tokens<=c.contextWindow);
  assert(u.completion_tokens>=c.maxOutputTokens&&u.completion_tokens<=c.maxOutputTokens+1,'Unexpected output overrun');
  const cost=(u.prompt_tokens*c.inputUsdPerMillion+u.completion_tokens*c.outputUsdPerMillion)/1e6;
  assert(cost<=call.reservedUsd,'Recorded charge exceeds reservation');
  assert(Number.isSafeInteger(maxOutputTokens)&&maxOutputTokens>c.maxOutputTokens&&maxOutputTokens<=Math.min(128000,c.contextWindow/2));
  const page=job.pages.find(p=>p.pageId===call.pageId);assert(page?.pendingQualityTask&&page.state==='quality');
  call.state='received-truncated';call.costUsd=cost;
  call.reconciliation={kind:'saved-length-response',at:new Date().toISOString(),requestHash,usage:u,auditAccepted:false};
  page.errors=(page.errors||[]).concat({at:new Date().toISOString(),phase:'quality',category:'review-contract',message:'Saved audit response reached its length limit; evidence rejected, usage reconciled.',countsAsSemanticDefect:false});
  delete page.pendingQualityTask;page.state='held';page.reason='quality-contract-failed';
  page.qualityContractFailures=(page.qualityContractFailures||0)+1;
  page.qualityMaxOutputTokens=maxOutputTokens;
  page.lastError={category:'review-contract',message:'Previous audit was truncated. Return a complete review using the increased output allowance.',issues:[{kind:'truncated-review',unitKey:null}]};
  job.state='running';return true;
}
module.exports={reconcile};
