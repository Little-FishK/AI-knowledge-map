"use strict";
const {pageContentHash}=require('../../deepdive/quality/deepdive-audit-contracts');
const {evaluateAudit}=require('../../deepdive/quality/audit-evaluation');
const {AUDIT_POLICY_HASH}=require('../../deepdive/quality/audit-policy');
function createAuditUpgrade(d) {
  function inspect(root,id) {
    const release=d.acquireLock(root);
    try {
      const state=d.loadState(root),record=state.pages[id];
      if(!record)throw Error('Page missing');
      const page=d.currentPage(root,record),audit=record.auditFile?d.readJson(d.withinRoot(root,record.auditFile)):null;
      const findings=record.editorialWorkflow?.initialBlockingFindings||[];
      return {pageId:id,state:record.state,active:Boolean(record.lease),candidateHash:pageContentHash(page),
        publication:record.publication?.status||null,storedAuditVersion:audit?.schemaVersion||null,
        evaluation:evaluateAudit(id,page,audit,{schemaVersion:4,mode:audit?.mode||'full',verificationFindings:findings,verificationScopeHash:d.sha256(findings)})};
    } finally {release();}
  }
  function queue(root,id,expectedHash,reason) {
    const release=d.acquireLock(root);
    try {
      const state=d.loadState(root),record=state.pages[id];
      if(Object.values(state.pages).some(p=>p.lease))throw Error('Active lease; finish before migration');
      if(!record || !['manual-review','repair-queued','audit-queued','published-approved','l3-auto-passed'].includes(record.state))throw Error('Unsupported migration state');
      if(String(reason||'').trim().length<3)throw Error('Migration reason required');
      const page=d.currentPage(root,record);
      if(pageContentHash(page)!==expectedHash)throw Error('Candidate changed');
      if(record.auditPolicyVersion===4&&record.state==='audit-queued')return {status:'already-queued',pageId:id};
      const oldAudit=record.auditFile?d.readJson(d.withinRoot(root,record.auditFile)):null;
      const snapshot={record:d.clone(record),page,audit:oldAudit,reason,createdAt:new Date().toISOString()};
      const relative=`.stage2/results/${id}/upgrade-${d.sha256(snapshot).slice(7)}.json`;
      d.writeJson(d.withinRoot(root,relative),snapshot);
      record.auditUpgrades=[...(record.auditUpgrades||[]),{snapshot:relative,fromVersion:oldAudit?.schemaVersion||null,toVersion:4,policyHash:AUDIT_POLICY_HASH,sourceHash:expectedHash,reason}];
      record.auditPolicyVersion=4;record.auditFile=null;record.auditHash=null;record.blockers=[];record.finalReview=null;
      record.auditUpgradePublicationHold=true;
      record.qualityEvaluation={policyVersion:4,status:'pending-independent-review',learnerValidation:'not-tested'};
      record.state='audit-queued';record.updatedAt=snapshot.createdAt;
      // Preserve repair budget, history and existing publication; policy migration is not a fresh repair allowance.
      if(record.editorialWorkflow){record.editorialWorkflow.auditMode='full';record.editorialWorkflow.initialBlockingFindings=[];}
      d.saveState(root,state);
      return {status:'audit-upgrade-queued',pageId:id,candidateHash:expectedHash,policyVersion:4,published:false,previousSnapshot:relative};
    } finally {release();}
  }
  return {inspectAuditUpgrade:inspect,queueAuditUpgrade:queue};
}
module.exports={createAuditUpgrade};
