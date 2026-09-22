'use strict';
// Synthetic content only: verify publication policy without altering audit rules or real state.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createWebsiteBuild}=require('../../tools/deepdive-stage2/lib/website-build');
const {pageContentHash}=require('../../tools/deepdive/quality/deepdive-audit-contracts');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'website-policy-'));
const pages={sample:{title:'测试',html:'<section><h2>示例</h2><p>仅供测试</p></section>'}};
const hash=pageContentHash(pages.sample);
const state={pages:{sample:{state:'audit-queued',publication:{status:'published-provisional'},blockers:[],lease:null}}};
let evaluation={passed:false,accuracy:'not-established',teaching:{expertReview:'not-established'},records:{status:'historical-needs-upgrade'}};
let released=0;
try {
  fs.mkdirSync(path.join(root,'config'));fs.mkdirSync(path.join(root,'data'));
  fs.writeFileSync(path.join(root,'index.html'),'<html><head></head><body><main id="stage"></main></body></html>');
  fs.writeFileSync(path.join(root,'data/graph.js'),'window.GRAPH={nodes:[],edges:[]};');
  const setPolicy=value=>fs.writeFileSync(path.join(root,'config/site-publishing.json'),JSON.stringify({siteUrl:'https://example.org/',understandingPagePolicy:value}));
  const build=createWebsiteBuild({acquireLock:()=>()=>released++,loadState:()=>state,loadPages:()=>pages,evaluateAudit:()=>evaluation});
  const options={mode:'production',siteUrl:'https://example.org/'};
  setPolicy('approved-only');assert.equal(build(root,options).state,'blocked');
  setPolicy('open-reading');
  const stateBefore=JSON.stringify(state),pagesBefore=JSON.stringify(pages);
  let result=build(root,options);assert.equal(result.pages,1);assert.equal(result.eligible,0);
  let manifest=JSON.parse(fs.readFileSync(path.join(result.output,'release-manifest.json')));
  assert.equal(manifest.pages[0].reviewStatus,'pending-review');assert.equal(manifest.pages[0].eligible,false);
  evaluation={...evaluation,accuracy:'fail'};
  result=build(root,options);manifest=JSON.parse(fs.readFileSync(path.join(result.output,'release-manifest.json')));
  assert.equal(manifest.pages[0].reviewStatus,'needs-revision');assert.equal(result.pages,1);
  assert.equal(JSON.stringify(state),stateBefore);assert.equal(JSON.stringify(pages),pagesBefore);
  state.pages.sample={state:'published-approved',publication:{status:'published-approved',reviewStatus:'human-approved',pageHash:hash,publishedAt:'2026-09-08T00:00:00Z'},blockers:[],lease:null};
  evaluation={passed:true,accuracy:'pass',teaching:{expertReview:'pass'},records:{scope:'full'}};
  result=build(root,options);assert.equal(result.eligible,1);
  // A later audit policy upgrade changes review status, not public availability.
  evaluation={passed:false,accuracy:'not-established',teaching:{expertReview:'not-established'},records:{status:'historical-needs-upgrade'}};
  result=build(root,options);assert.equal(result.pages,1);assert.equal(result.eligible,0);
  setPolicy('approved-only');assert.equal(build(root,options).state,'blocked');
  state.pages.sample.lease={taskId:'active'};assert.throws(()=>build(root,options),/Active content worker/);
  assert.equal(released,7);
  state.pages.sample.lease=null;setPolicy('open-reading');
  const englishDir=path.join(root,'data/content-locales/en/deepdive');fs.mkdirSync(englishDir,{recursive:true});fs.writeFileSync(path.join(englishDir,'sample.json'),'{}');
  let translationStale=false;
  const envelope={schemaVersion:1,status:'machine-reviewed',artifactHash:'fixture-English-hash',payload:{pageId:'sample',page:{title:'Test',html:'<section><h2>Example</h2><p>Testing only.</p></section>'}}};
  const bilingualBuild=createWebsiteBuild({acquireLock:()=>()=>{},loadState:()=>state,loadPages:()=>pages,evaluateAudit:()=>evaluation,
    publishedTranslation:()=>{if(translationStale)throw Error('Stale fixture');return envelope;}});
  result=bilingualBuild(root,options);assert.equal(result.pages,2);
  assert(fs.existsSync(path.join(result.output,'en/concepts/sample/index.html')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(result.output,'data/content-locales/en/deepdive/sample.json'),'utf8')).status,'machine-reviewed');
  translationStale=true;assert.equal(bilingualBuild(root,options).pages,1);
  let validations=0;
  const changingBuild=createWebsiteBuild({acquireLock:()=>()=>{},loadState:()=>state,loadPages:()=>pages,evaluateAudit:()=>evaluation,
    publishedTranslation:()=>{if(++validations===2)throw Error('Stale or defective translation');return envelope;}});
  assert.throws(()=>changingBuild(root,options),/ENGLISH_BUILD_CHANGED: sample: Stale or defective translation; discard artifact/);
  const scopedHash='sha256:'+'a'.repeat(64),scopedEnvelope={...envelope,artifactHash:scopedHash},checked=[];
  fs.writeFileSync(path.join(englishDir,'unrelated.json'),'{}');
  let changed=false;
  const scopedBuild=createWebsiteBuild({acquireLock:()=>()=>{},loadState:()=>state,loadPages:()=>pages,evaluateAudit:()=>evaluation,
    publishedTranslation:(_root,id)=>{checked.push(id);assert.equal(id,'sample','unrelated English must not be revalidated for one-page deployment');return changed?{...scopedEnvelope,artifactHash:'sha256:'+'b'.repeat(64)}:scopedEnvelope;}});
  const scopedOptions={...options,englishPageId:'sample',expectedEnglishArtifactHash:scopedHash};
  assert.equal(scopedBuild(root,scopedOptions).pages,2);assert.deepEqual(checked,['sample','sample']);
  assert.throws(()=>scopedBuild(root,{...scopedOptions,englishPageId:'../bad'}),/Exact English/);
  assert.throws(()=>scopedBuild(root,{...options,englishPageId:'sample'}),/Exact English/);
  changed=true;assert.throws(()=>scopedBuild(root,scopedOptions),/unavailable or changed/);
  let scopedChecks=0;
  const driftingScopedBuild=createWebsiteBuild({acquireLock:()=>()=>{},loadState:()=>state,loadPages:()=>pages,evaluateAudit:()=>evaluation,
    publishedTranslation:()=>++scopedChecks===1?scopedEnvelope:{...scopedEnvelope,artifactHash:'sha256:'+'b'.repeat(64)}});
  assert.throws(()=>driftingScopedBuild(root,scopedOptions),/ENGLISH_BUILD_CHANGED/);
  console.log('PASS accepted English joins the website and runtime overlay; stale English omitted');
  console.log('PASS: publication independent of audit upgrades/failures; strict policy retained; source/state untouched; active lease respected');
} finally {
  if(path.dirname(root)!==path.resolve(os.tmpdir())||!path.basename(root).startsWith('website-policy-'))throw Error('Unsafe fixture cleanup');
  fs.rmSync(root,{recursive:true,force:true});
}
