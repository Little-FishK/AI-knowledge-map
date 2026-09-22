"use strict";
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {loadDeepDivePages}=require('../../deepdive/runtime/deepdive-loader');
const {pageContentHash}=require('../../deepdive/quality/deepdive-audit-contracts');
const {evaluateAudit}=require('../../deepdive/quality/audit-evaluation');
const {approvedSource}=require('./translation-preparation');
const {writeArtifact,safeFile}=require('../../readiness/site-artifact');
const {policy:publicationPolicy,canPublish}=require('../../readiness/publication-policy');
function createWebsiteBuild(d) {
  return function buildWebsite(root, {siteUrl,mode='preview',englishPageId,expectedEnglishArtifactHash}={}) {
    if(!['preview','production'].includes(mode))throw Error('Invalid build mode');
    const scoped=englishPageId!==undefined||expectedEnglishArtifactHash!==undefined;
    if(scoped&&(!/^[a-z0-9][a-z0-9-]*$/.test(englishPageId||'')||!/^sha256:[a-f0-9]{64}$/.test(expectedEnglishArtifactHash||'')))throw Error('Exact English page and artifact hash required');
    // Validation takes the source lock itself; do it before the build lock, then
    // validate again after the artifact is written. Stale translations are omitted.
    const english=new Map();
    if(d.publishedTranslation) {
      const dir=path.join(root,'data/content-locales/en/deepdive');
      if(fs.existsSync(dir))for(const name of fs.readdirSync(dir)) {
        if(!/^[a-z0-9][a-z0-9-]*\.json$/.test(name))continue;
        const id=name.slice(0,-5);
        if(scoped&&id!==englishPageId)continue;
        try {const value=d.publishedTranslation(root,id);if(value)english.set(id,value);}catch(error){if(scoped)throw error;}
      }
    }
    if(scoped&&english.get(englishPageId)?.artifactHash!==expectedEnglishArtifactHash)throw Error('Requested English artifact unavailable or changed');
    const release=d.acquireLock(root);
    let built;
    try {
      const state=d.loadState(root),pages=(d.loadPages||loadDeepDivePages)(root),entries=[],inventory=[];
      const configFile=safeFile(root,'config/site-publishing.json');
      const config=fs.existsSync(configFile)?JSON.parse(fs.readFileSync(configFile,'utf8')):{};
      const accessPolicy=publicationPolicy(config.understandingPagePolicy);
      if(Object.values(state.pages).some(r=>r.lease))throw Error('Active content worker; retry build after lease ends');
      for(const [id,page] of Object.entries(pages).sort(([a],[b])=>a.localeCompare(b))) {
        const record=state.pages[id]||{},sourceHash=pageContentHash(page);
        let eligible=false,reason='current-human-approval-required';
        const audit=record.auditFile?d.readJson(d.withinRoot(root,record.auditFile)):null;
        const evaluation=(d.evaluateAudit||evaluateAudit)(id,page,audit);
        if(approvedSource(record,sourceHash).sourceEligibleForEnglishReview) {
          eligible=evaluation.passed && evaluation.accuracy==='pass' && evaluation.teaching.expertReview==='pass' && evaluation.records.scope==='full';
          reason=eligible?'eligible':'current-full-audit-required';
        }
        const reviewStatus=eligible?'reviewed':evaluation.accuracy==='fail'
          || record.state==='repair-queued' || record.publication?.reviewStatus==='human-revision-pending'
          ? 'needs-revision':'pending-review';
        const entry={id,page,locale:'zh',sourceHash,eligible,reviewStatus,publicAccess:accessPolicy==='open-reading'||eligible};
        inventory.push({id,eligible,reason,publicAccess:canPublish(entry,accessPolicy)});
        if(mode==='preview'||canPublish(entry,accessPolicy))entries.push(entry);
        const translated=english.get(id);
        if(translated) {
          const en={...entry,page:translated.payload.page,locale:'en',englishVerified:true,
            translationEnvelope:translated,publicAccess:entry.publicAccess};
          if(mode==='preview'||canPublish(en,accessPolicy))entries.push(en);
        }
      }
      // English entries originate only from version-bound controller acceptance.
      if(mode==='production'&&!entries.length)return {state:'blocked',reason:'No pages currently meet human approval and full current audit gates',eligible:0,total:inventory.length,deployed:false};
      const context={window:{}};vm.createContext(context);
      vm.runInContext(fs.readFileSync(safeFile(root,'data/graph.js'),'utf8'),context,{timeout:5000});
      const output=path.join(root,'.tmp','site-releases',`${mode}-${Date.now()}-${crypto.randomUUID().slice(0,8)}`);
      // Refuse redirecting build output through an existing junction.
      safeFile(root,path.relative(root,output).replace(/\\/g,'/'));
      built={state:'built',...writeArtifact({root,output,entries,inventory,siteUrl,mode,publicationPolicy:accessPolicy,graph:context.window.GRAPH})};
    } finally {release();}
    for(const [id,en] of english) {
      try {
        if(d.publishedTranslation(root,id)?.artifactHash!==en.artifactHash)throw Error('Artifact hash changed');
      } catch(error) {
        throw Error(`ENGLISH_BUILD_CHANGED: ${id}: ${error.message}; discard artifact`);
      }
    }
    return built;
  };
}
module.exports={createWebsiteBuild};
