'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=x=>'sha256:'+crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function recover({directory,campaignId,job,environment,save,now=Date.now(),isAlive=pid=>{try{process.kill(pid,0);return true;}catch(e){return e.code!=='ESRCH';}}}){
 const requestHash=environment.STAGE2_RECOVER_INTERRUPTED_REQUEST;
 if(!requestHash)return false;
 const reason=environment.STAGE2_RECOVER_INTERRUPTED_REASON;
 assert(environment.STAGE2_DEEPSEEK_CAMPAIGN===campaignId&&environment.STAGE2_DEEPSEEK_LIVE==='1','Exact campaign authorization required');
 assert(environment.STAGE2_RECOVER_INTERRUPTED_AUTHORIZATION===hash({campaignId,requestHash,reason}),'Exact interrupted-operation authorization required');
 assert(typeof reason==='string'&&reason.length>=80,'Verified inactive-controller explanation required');
 const calls=job.calls.filter(c=>c.requestHash===requestHash);assert.equal(calls.length,1);
 const call=calls[0];if(call.interruptedOperationRecovery)return false;
 const recoveryLock=path.join(directory,'interrupted-recovery.lock');fs.closeSync(fs.openSync(recoveryLock,'wx'));
 try{
 assert.equal(call.state,'sending');assert.equal(call.phase,'quality');
 assert(!call.responseFile&&!call.responseId&&call.costUsd==null,'Saved response must be reconciled');
 assert(!job.calls.some(c=>c!==call&&['sending','uncertain','usage-review'].includes(c.state)),'Other unsettled calls exist');
 const page=job.pages.find(p=>p.pageId===call.pageId);assert(page?.pendingQualityTask);
 const lock=path.join(directory,'operation.lock'),stat=fs.lstatSync(lock);
 assert(stat.isFile()&&!stat.isSymbolicLink(),'Unsafe operation lock');
 assert(now-stat.mtimeMs>=1200000,'Recent operation cannot be recovered');
 const raw=fs.readFileSync(lock,'utf8');
 if(raw.trim()){const owner=JSON.parse(raw);assert(Number.isInteger(owner.pid)&&owner.pid>0);assert(!isAlive(owner.pid),'Controller still alive');}
 else assert(environment.STAGE2_LEGACY_OWNER_VERIFIED==='no-active-controller','Legacy lock requires operator process verification');
 call.state='uncertain';call.interruptedOperationRecovery={at:new Date(now).toISOString(),reason,actualUsageKnown:false,originalReservationRetained:true};
 page.state='held';page.reason='request-reconciliation-required';job.state='running';
 save(path.join(directory,'campaign.json'),job);
 fs.unlinkSync(lock);return true;
 }finally{fs.unlinkSync(recoveryLock);}
}
module.exports={recover};
