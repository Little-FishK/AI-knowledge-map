'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {recover}=require('../../tools/deepdive-stage2/lib/translation-interrupted-operation');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'interrupted-operation-'));
const campaignId='sha256:'+'a'.repeat(64),requestHash='sha256:'+'b'.repeat(64),reason='User requested repair and continuation. Operator verified the original campaign controller process exited and no response was saved. Retain the complete unknown-charge reservation.';
const environment={STAGE2_DEEPSEEK_CAMPAIGN:campaignId,STAGE2_DEEPSEEK_LIVE:'1',STAGE2_RECOVER_INTERRUPTED_REQUEST:requestHash,STAGE2_RECOVER_INTERRUPTED_REASON:reason,STAGE2_RECOVER_INTERRUPTED_AUTHORIZATION:'sha256:'+crypto.createHash('sha256').update(JSON.stringify({campaignId,requestHash,reason})).digest('hex'),STAGE2_LEGACY_OWNER_VERIFIED:'no-active-controller'};
const make=()=>({calls:[{pageId:'sample',requestHash,state:'sending',phase:'quality',reservedUsd:.31}],pages:[{pageId:'sample',state:'quality',pendingQualityTask:true}]});
function setup(owner=''){const file=path.join(directory,'operation.lock');fs.writeFileSync(file,owner);fs.utimesSync(file,new Date(0),new Date(0));}
const run=(job,env=environment,alive=false)=>recover({directory,campaignId,job,environment:env,save:(file,value)=>fs.writeFileSync(file,JSON.stringify(value)),now:2000000,isAlive:()=>alive});
try{
 setup();const job=make();assert(run(job));assert.equal(job.calls[0].state,'uncertain');assert.equal(job.calls[0].reservedUsd,.31);assert.equal(job.calls[0].costUsd,undefined);assert.equal(job.pages[0].reason,'request-reconciliation-required');assert.equal(run(job),false);
 setup();assert.throws(()=>run(make(),{...environment,STAGE2_RECOVER_INTERRUPTED_AUTHORIZATION:'wrong'}));assert(fs.existsSync(path.join(directory,'operation.lock')));
 setup();assert.throws(()=>run(make(),{...environment,STAGE2_LEGACY_OWNER_VERIFIED:''}));
 setup(JSON.stringify({pid:123}));assert.throws(()=>run(make(),environment,true),/still alive/);
 setup();const saved=make();saved.calls[0].responseFile='saved.json';assert.throws(()=>run(saved),/Saved response/);
 setup();const ambiguous=make();ambiguous.calls.push({...ambiguous.calls[0]});assert.throws(()=>run(ambiguous));
 setup();fs.utimesSync(path.join(directory,'operation.lock'),new Date(2000000),new Date(2000000));assert.throws(()=>run(make()),/Recent/);
 console.log('PASS dead-controller recovery: exact authorization, old lock, owner checks, no saved response, retained charge, no audit acceptance and idempotency');
}finally{assert.equal(path.dirname(directory),path.resolve(os.tmpdir()));assert(path.basename(directory).startsWith('interrupted-operation-'));fs.rmSync(directory,{recursive:true,force:true});}
