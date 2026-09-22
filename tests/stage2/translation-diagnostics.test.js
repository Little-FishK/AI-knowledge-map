'use strict';
const assert=require('node:assert/strict');
const {inspectEvidence}=require('../../tools/deepdive-stage2/lib/translation-diagnostics');
const units=[{key:'s/u1',source:'准确的中文引用',translation:'An exact English quotation.'}];
const evidence={checkedUnits:[{unitKey:'s/u1',sourceQuote:'中文',translationQuote:'English',rationale:'The English preserves the source meaning.'}],findings:[],wholePageRationale:'The page preserves terminology, references, and logical qualifications.'};
assert.deepEqual(inspectEvidence(units,evidence),[]);
const bad=structuredClone(evidence);
bad.checkedUnits[0].translationQuote='english';bad.checkedUnits[0].rationale='OK';
assert.deepEqual(inspectEvidence(units,bad).map(x=>x.kind),['translationQuote-not-exact','rationale-too-short']);
assert.deepEqual(inspectEvidence(units,{checkedUnits:{}}).map(x=>x.kind),['checkedUnits-not-array']);
console.log('translation diagnostics tests passed');
// An unrelated page's busy lock must not obstruct explicitly scoped diagnosis.
(async()=>{
  const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'diagnostic-scope-'));
  try{
    const job={plan:{fixture:true},pages:[{pageId:'busy',reviewId:'locked'},{pageId:'target'}],calls:[]};
    const d={quality:{withTranslationQualityMaterial(){throw Error('Unrelated locked page read');}}};
    const result=await require('../../tools/deepdive-stage2/lib/translation-diagnostics').diagnose(d,dir,dir,job,['target']);
    assert.deepEqual(result.pages.map(p=>p.pageId),['target']);
    await assert.rejects(require('../../tools/deepdive-stage2/lib/translation-diagnostics').diagnose(d,dir,dir,job,['missing']),/Invalid diagnostic page scope/);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
