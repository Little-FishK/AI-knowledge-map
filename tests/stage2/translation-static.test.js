'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const {fixture}=require('./translation-publication-fixture');
const {createTranslationPublication,BROWSER_CHECKS}=require('../../tools/deepdive-stage2/lib/translation-publication');
const {configuration}=require('../../tools/readiness/render-static-concept');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'static-controller-'));
const v=fixture();v.material.pageId='supervised-learning';let stale=false;
const c=createTranslationPublication({authorization:()=>c.previewTranslation(root,'supervised-learning','fixture-review').candidate.artifactHash,withTranslationQualityMaterial:(_r,_p,_v,cb)=>cb(v),withCurrentTranslationSnapshot:(_r,_p,_s,cb)=>{if(stale)throw Error('Stale');return cb();}});
const preview=c.previewTranslation(root,'supervised-learning','fixture-review'),hash=preview.candidate.artifactHash;
const build=()=>c.buildStaticTranslation(root,'supervised-learning','fixture-review',hash,'https://example.com/AI-knowledge-map/');
try {
 assert.throws(build,/Approved English/);
 const acceptance={artifactHash:hash,approved:true,reviewer:'fixture-human',browserChecks:BROWSER_CHECKS.map(name=>({name,passed:true,notes:'Isolated synthetic test evidence only.'})),resources:preview.resourceKeys.map(key=>({key,passed:true,notes:'Isolated synthetic resource acceptance.'})),resourceSummary:'Synthetic acceptance only; never represents a real page review.'};
 c.publishTranslation(root,'supervised-learning','fixture-review',hash,acceptance);
 assert.equal(build().state,'built-static-bilingual');
 const first=build();assert.deepEqual(build(),first);
 const zh=fs.readFileSync(path.join(root,'zh/concepts/supervised-learning/index.html'),'utf8');
 const en=fs.readFileSync(path.join(root,'en/concepts/supervised-learning/index.html'),'utf8');
 assert(zh.includes(v.snapshot.capture.page.html));assert(en.includes('Example mechanism'));assert(!en.includes('noindex'));assert(en.includes('rel="canonical"'));assert(en.includes('hreflang="zh-Hans"'));assert(en.includes('/AI-knowledge-map/assets/style.css'));assert(en.includes('application/ld+json'));assert(!en.includes('fixture-human'));
 stale=true;assert.throws(build,/Stale/);stale=false;
 assert.throws(()=>c.buildStaticTranslation(root,'supervised-learning','fixture-review','sha256:wrong','https://example.com/'),/changed/);
 assert.throws(()=>configuration('https://example.com/path-without-slash'),/trailing/);
 assert.throws(()=>configuration('http://example.com/'),/HTTPS/);
 const file=path.join(root,'data/content-locales/en/deepdive/supervised-learning.json'),published=JSON.parse(fs.readFileSync(file));published.status='draft';fs.writeFileSync(file,JSON.stringify(published));assert.throws(build,/mismatch/);
 console.log('PASS static controller: approved-only, receipt-bound, unchanged Chinese, deterministic build, stale/tamper guards, canonical/hreflang/base paths and privacy.');
}finally{fs.rmSync(root,{recursive:true,force:true});}
