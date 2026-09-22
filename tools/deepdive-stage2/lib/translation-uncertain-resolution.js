'use strict';
const assert=require('node:assert/strict');
// Operator-authorized replacement review. The lost response is never accepted
// and its full reservation remains charged against the shared spending limit.
function resolve(job,requestHash,reason) {
  assert(/^sha256:[a-f0-9]{64}$/.test(requestHash),'Exact request hash required');
  assert(typeof reason==='string'&&reason.length>=40,'Explicit operator reason required');
  const matches=job.calls.filter(c=>c.requestHash===requestHash);
  assert.equal(matches.length,1,'Unique original request required');
  const call=matches[0];
  if(call.state==='abandoned-unknown')return false;
  assert.equal(call.state,'uncertain');assert.equal(call.phase,'quality');
  assert(!call.responseFile&&!call.responseId&&call.costUsd==null,'Saved response requires reconciliation');
  assert(Number.isFinite(call.reservedUsd)&&call.reservedUsd>0);
  assert(!job.calls.some(c=>c!==call&&['sending','uncertain','usage-review'].includes(c.state)),'Other unsettled calls exist');
  const page=job.pages.find(p=>p.pageId===call.pageId);
  assert(page?.pendingQualityTask&&page.state==='held'&&page.reason==='request-reconciliation-required');
  call.state='abandoned-unknown';
  call.resolution={kind:'operator-authorized-replacement-review',reason,at:new Date().toISOString(),actualUsageKnown:false,auditAccepted:false};
  page.replacementReview={originalRequestHash:requestHash,reason};
  delete page.pendingQualityTask;delete page.reason;page.state='quality';job.state='running';
  return true;
}
module.exports={resolve};
