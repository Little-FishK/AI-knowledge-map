'use strict';
const assert=require('node:assert/strict');
const {decode}=require('../../tools/deepdive-stage2/lib/translation-review-correction');
const {missingOccurrences,repeatedSources}=require('../../tools/deepdive-stage2/lib/translation-review-ledger');
assert.deepEqual(decode('```json\n{"findings":[]}\n```'),{findings:[]});
for(const input of ['{"findings":','[]','null','prefix {"a":1}',undefined])assert.throws(()=>decode(input),e=>e.code==='REVIEW_CONTRACT'&&e.issues[0].kind==='invalid-json');
const units=[{key:'a',source:'重复引用的完整中文标题',translation:'Repeated incorrect English title'},
  {key:'b',source:'重复引用的完整中文标题',translation:'Repeated incorrect English title'},
  {key:'c',source:'不同的上下文',translation:'Repeated incorrect English title'}];
const finding={rule:4,unitKey:'a',sourceQuote:units[0].source,translationQuote:units[0].translation};
assert.deepEqual(missingOccurrences(units,[finding]).map(x=>x.unitKey),['b']);
assert.deepEqual(missingOccurrences(units,[finding,{...finding,unitKey:'b'}]),[]);
assert.deepEqual(repeatedSources(units)[0].unitKeys,['a','b']);
console.log('PASS strict JSON transport recovery and repeated terminology coverage without inventing findings');
