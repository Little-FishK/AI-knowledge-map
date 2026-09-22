const {test}=require('node:test'),assert=require('node:assert/strict');
const {buildWithRetry}=require('../tools/readiness/retry-website-build');
test('retry an invalidated build once with a fresh build',async()=>{
 let calls=0;assert.equal(await buildWithRetry(async()=>{if(++calls===1)throw Error('ENGLISH_BUILD_CHANGED: sample');return 'fresh';}),'fresh');assert.equal(calls,2);
});
test('persistent changes stop after two attempts',async()=>{
 let calls=0;await assert.rejects(buildWithRetry(async()=>{calls++;throw Error('ENGLISH_BUILD_CHANGED: sample');}));assert.equal(calls,2);
});
test('other failures do not retry',async()=>{
 let calls=0;await assert.rejects(buildWithRetry(async()=>{calls++;throw Error('Missing acceptance');}));assert.equal(calls,1);
});
