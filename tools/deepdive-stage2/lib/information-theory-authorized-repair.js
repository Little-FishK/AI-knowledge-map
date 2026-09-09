"use strict";
const {pageContentHash}=require('../../deepdive/quality/deepdive-audit-contracts');
const SOURCE='https://huggingface.co/docs/transformers/perplexity';
const APPROVED_HASH='sha256:91c155d089a7fe2654b371317ee48b2bb384bf24dce4511c89c854ba470207ee';
function repairPage(original) {
  const page=JSON.parse(JSON.stringify(original));
  const sections=[...page.html.matchAll(/<section\b[\s\S]*?<\/section>/gi)];
  const target=sections[7];
  if(!target)throw Error('Missing authorized section');
  const before=target[0];
  const figures=before.match(/<svg\b[\s\S]*?<\/svg>/gi)||[];
  if(figures.length!==1 || (figures[0].match(/D<sub>KL<\/sub>\(P\|\|Q\)/g)||[]).length!==1)throw Error('Figure differs from authorized finding');
  const figure=figures[0].replace('D<sub>KL</sub>(P||Q)','D<tspan baseline-shift="sub" font-size="75%">KL</tspan>(P||Q)');
  const after=before.replace(figures[0],figure);
  page.html=page.html.slice(0,target.index)+after+page.html.slice(target.index+before.length);
  const sources=page.html.match(/<div\b[^>]*class="[^"]*\bdd-src\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi)||[];
  if(sources.length!==1 || page.html.includes(SOURCE))throw Error('Source list differs from authorized scope');
  const source=sources[0].replace(/<\/div>$/i,`<p><a href="${SOURCE}" target="_blank" rel="noopener noreferrer">Hugging Face — Perplexity of fixed-length models</a>：困惑度定义、交叉熵关系与分词方式对比较的影响。</p></div>`);
  page.html=page.html.replace(sources[0],source);
  return page;
}
function createAuthorizedRepair(d) {
  return function apply(root,expectedCandidateHash) {
    const release=d.acquireLock(root);
    try {
      const state=d.loadState(root),record=state.pages['information-theory'];
      if(Object.values(state.pages).some(p=>p.lease))throw Error('Active lease');
      if(!record||record.state!=='repair-queued'||record.editorialWorkflow)throw Error('Unexpected workflow; no reset permitted');
      const original=d.currentPage(root,record);
      if(expectedCandidateHash!==APPROVED_HASH||pageContentHash(original)!==APPROVED_HASH)throw Error('Authorized candidate changed');
      const findings=record.blockers||[];
      if(!findings.some(f=>f.code==='formula-error'&&f.section===8)||!findings.some(f=>f.code==='source-support-blocked'&&f.section===7))throw Error('Findings changed');
      const page=repairPage(original),hash=pageContentHash(page);
      const relative=`.stage2/results/information-theory/authorized-repair-${hash.slice(7)}.json`;
      const receipt={type:'human-authorized-limited-repair',beforeHash:APPROVED_HASH,afterHash:hash,
        authorization:'用户确认：第8节SVG下标标记及第7节Hugging Face官方来源；独立审核后再评估发布。',
        sections:[7,8],sourceUrl:SOURCE,createdAt:new Date().toISOString()};
      // New immutable candidate first; a failed state write leaves the old candidate authoritative.
      d.writeJson(d.withinRoot(root,relative),{schemaVersion:1,pageId:record.id,role:'repair',page,pageHash:hash,receipt});
      record.authorizedRepairHistory=[...(record.authorizedRepairHistory||[]),{...receipt,previousCandidateFile:record.candidateFile,
        previousAuditFile:record.auditFile,findings}];
      record.candidateFile=relative;record.contentHash=hash;record.auditFile=null;record.auditHash=null;
      record.blockers=[];record.repairAttempts+=1;record.state='audit-queued';record.updatedAt=receipt.createdAt;
      d.saveState(root,state);
      return {status:'authorized-repair-applied',pageId:record.id,candidateHash:hash,nextState:record.state,published:false,receipt};
    } finally {release();}
  };
}
module.exports={repairPage,createAuthorizedRepair,APPROVED_HASH,SOURCE};
