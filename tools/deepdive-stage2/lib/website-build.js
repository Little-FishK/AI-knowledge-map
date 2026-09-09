"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {loadDeepDivePages}=require('../../deepdive/runtime/deepdive-loader');
const {pageContentHash}=require('../../deepdive/quality/deepdive-audit-contracts');
const {evaluateAudit}=require('../../deepdive/quality/audit-evaluation');
const {approvedSource}=require('./translation-preparation');
const {writeArtifact,safeFile}=require('../../readiness/site-artifact');
function createWebsiteBuild(d) {
  return function buildWebsite(root, {siteUrl,mode='preview'}={}) {
    if(!['preview','production'].includes(mode))throw Error('Invalid build mode');
    const release=d.acquireLock(root);
    try {
      const state=d.loadState(root),pages=loadDeepDivePages(root),entries=[],inventory=[];
      if(Object.values(state.pages).some(r=>r.lease))throw Error('Active content worker; retry build after lease ends');
      for(const [id,page] of Object.entries(pages).sort(([a],[b])=>a.localeCompare(b))) {
        const record=state.pages[id]||{},sourceHash=pageContentHash(page);
        let eligible=false,reason='current-human-approval-required';
        if(approvedSource(record,sourceHash).sourceEligibleForEnglishReview) {
          const audit=record.auditFile?d.readJson(d.withinRoot(root,record.auditFile)):null;
          const evaluation=evaluateAudit(id,page,audit);
          eligible=evaluation.passed && evaluation.accuracy==='pass' && evaluation.teaching.expertReview==='pass' && evaluation.records.scope==='full';
          reason=eligible?'eligible':'current-full-audit-required';
        }
        inventory.push({id,eligible,reason});
        if(mode==='preview'||eligible)entries.push({id,page,locale:'zh',sourceHash,eligible});
      }
      // This milestone deliberately generates no translations. English routes are supported by the renderer;
      // adding existing English artifacts needs their version-bound translation acceptance, not a guessed fallback.
      if(mode==='production'&&!entries.length)return {state:'blocked',reason:'No pages currently meet human approval and full current audit gates',eligible:0,total:inventory.length,deployed:false};
      const context={window:{}};vm.createContext(context);
      vm.runInContext(fs.readFileSync(safeFile(root,'data/graph.js'),'utf8'),context,{timeout:5000});
      const output=path.join(root,'.tmp','site-releases',`${mode}-${Date.now()}-${crypto.randomUUID().slice(0,8)}`);
      // Refuse redirecting build output through an existing junction.
      safeFile(root,path.relative(root,output).replace(/\\/g,'/'));
      return {state:'built',...writeArtifact({root,output,entries,inventory,siteUrl,mode,graph:context.window.GRAPH})};
    } finally {release();}
  };
}
module.exports={createWebsiteBuild};
