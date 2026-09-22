"use strict";
const {pageContentHash}=require('../../deepdive/quality/deepdive-audit-contracts');
const APPROVED_HASH='sha256:93364d1606596feb1f4731c28367c873fc69f049ddfccbbea36a3816d4e4435c';
const SOURCES=['https://arxiv.org/abs/2202.05262','https://arxiv.org/abs/1910.10683'];
function amendSources(original){
 const page=JSON.parse(JSON.stringify(original));
 const blocks=page.html.match(/<div\b[^>]*class="[^"]*\bdd-src\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi)||[];
 if(blocks.length!==1||SOURCES.some(url=>blocks[0].includes(url)))throw Error('Unexpected source list');
 const addition=`<p><a href="${SOURCES[0]}" target="_blank" rel="noopener noreferrer">Meng et al. — Locating and Editing Factual Associations in GPT (NeurIPS 2022)</a>：特定自回归 Transformer 中间层前馈模块参与事实关联存储、定位与编辑；不表示所有知识仅存在于前馈网络。</p><p><a href="${SOURCES[1]}" target="_blank" rel="noopener noreferrer">Raffel et al. — Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer (JMLR 2020)</a>：T5 的编码器—解码器文本到文本框架及问答、摘要等任务用途。</p>`;
 page.html=page.html.replace(blocks[0],blocks[0].replace(/<\/div>$/i,addition+'</div>'));
 return page;
}
function createAuthorizedSources(d){return function(root,expectedCandidateHash){
 const release=d.acquireLock(root);
 try{
  const state=d.loadState(root),record=state.pages.transformer;
  if(Object.values(state.pages).some(p=>p.lease))throw Error('Active lease');
  if(!record||record.state!=='audit-queued'||!record.editorialWorkflow)throw Error('Unexpected workflow');
  const original=d.currentPage(root,record);
  if(expectedCandidateHash!==APPROVED_HASH||pageContentHash(original)!==APPROVED_HASH)throw Error('Authorized candidate changed');
  const page=amendSources(original),hash=pageContentHash(page);
  const receipt={type:'human-authorized-source-amendment',beforeHash:APPROVED_HASH,afterHash:hash,sourceUrls:SOURCES,
   authorization:'用户在确认补入 ROME 与 T5 两篇原始论文的提问后明确回复“你来补一下”；只追加这两项引用，独立复核后再发布。',createdAt:new Date().toISOString()};
  const relative=`.stage2/results/transformer/authorized-sources-${hash.slice(7)}.json`;
  d.writeJson(d.withinRoot(root,relative),{schemaVersion:1,pageId:'transformer',role:'repair',page,pageHash:hash,receipt});
  record.authorizedRepairHistory=[...(record.authorizedRepairHistory||[]),{...receipt,previousCandidateFile:record.candidateFile,previousAuditFile:record.auditFile}];
  record.candidateFile=relative;record.contentHash=hash;record.auditFile=null;record.auditHash=null;
  record.updatedAt=receipt.createdAt;
  d.saveState(root,state);
  return {status:'authorized-sources-added',pageId:'transformer',candidateHash:hash,nextState:record.state,published:false,receipt};
 }finally{release();}
};}
module.exports={createAuthorizedSources,amendSources,APPROVED_HASH,SOURCES};
