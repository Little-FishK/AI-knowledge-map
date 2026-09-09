"use strict";
const {createAuditRules}=require('../../deepdive-stage2/lib/audit-rules');
const {createEditorialCandidateValidation}=require('../../deepdive-stage2/lib/editorial-candidate-validation');
const {clone,sha256}=require('../../deepdive-stage2/lib/state-store');
const policy=require('./audit-policy');
const {pageContentHash}=require('./deepdive-audit-contracts');
const {visibleRawLatexSections}=createEditorialCandidateValidation({sha256,isConfiguredRemovedSectionTitle:()=>false});
const rules=createAuditRules({schemaVersion:4,sixQuestions:policy.SIX_QUESTIONS,blockerCodes:policy.L3_BLOCKER_CODES,
  warningCodes:policy.L3_WARNING_CODES,legacyBlockerCodes:policy.LEGACY_BLOCKER_CODES,visibleRawLatexSections,
  auditContract:()=>({schemaVersion:4,mode:'full'}),clone,sha256});
function evaluateAudit(id,page,audit,contract={schemaVersion:4,mode:'full'}) {
  const version=audit?.schemaVersion;
  const result={policyId:policy.AUDIT_POLICY_ID,policyHash:policy.AUDIT_POLICY_HASH,policyVersion:4,pageId:id,pageHash:pageContentHash(page),
    auditVersion:version||null,accuracy:'not-established',teaching:{expertReview:'not-established',learnerValidation:'not-tested'},
    records:{status:'incomplete'},passed:false,blockers:[]};
  if(version!==4) {
    result.records={status:version>=1&&version<=3?'historical-needs-upgrade':'missing-or-unsupported'};
    result.blockers=[{type:'audit-contract',code:'audit-upgrade-required',message:'历史审核保留；需要独立v4补审，不自动升级结论。'}];
    return result;
  }
  const gaps=rules.auditGaps(id,page,audit,contract);
  if(gaps.length){result.blockers=gaps.map(message=>({type:'audit-contract',code:'audit-contract-invalid',message}));return result;}
  result.records={status:'complete',scope:audit.mode,auditHash:sha256(audit)};
  result.blockers=rules.auditBlockers(audit);
  if(audit.mode==='verification') {
    result.teaching.expertReview='targeted-review-only';
    result.accuracy='targeted-review-only';
    result.passed=audit.decision==='pass'&&!result.blockers.length;
    return result;
  }
  const accuracyCodes=new Set(['factual-error','formula-error','numeric-error','terminology-error','source-support-blocked','image-text-mismatch','terminology-inconsistent']);
  result.accuracy=result.blockers.some(b=>accuracyCodes.has(b.code))||['facts','formulas','figures','sources','consistency'].some(k=>audit.pageChecks[k].status==='fail')?'fail':'pass';
  result.teaching.expertReview=result.blockers.length?'fail':'pass';
  result.passed=audit.decision==='pass'&&!result.blockers.length;
  return result;
}
module.exports={evaluateAudit};
