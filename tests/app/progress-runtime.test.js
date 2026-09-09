'use strict';
const assert=require('node:assert/strict');
const model=require('../../assets/progress-model');
const runtimeFactory=require('../../assets/progress-runtime');
const memory=new Map([['ai-knowledge-map.learned.v1','["supervised-learning","bad id"]']]);
const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
const applied=[];
let authListener=()=>{};
const adapter={
  async session(){return null;},onAuthChange(fn){authListener=fn;return {unsubscribe(){}};},
  async sendCode(email){return {email};},async verifyCode(email){return {session:{user:{id:'account-a',email}}};},
  async signOut(){},async load(){return [];},async apply(op){applied.push(op);return {status:'applied',record:{nodeId:op.nodeId,field:op.field,value:op.value,version:1,contentRevision:null}};},
};
(async()=>{
  let n=0;const runtime=runtimeFactory.create({model,adapter,storage,legacyKey:'ai-knowledge-map.learned.v1',randomUUID:()=>`op-${++n}`});
  await runtime.start();
  assert.equal(runtime.get().state.records['supervised-learning/legacyLearned'].value,true);
  assert.equal(runtime.get().state.records['bad id/legacyLearned'],undefined);
  await runtime.change('supervised-learning','read',true);
  assert.equal(runtime.get().state.pending.length,0);assert.equal(applied.length,0);
  await runtime.verifyCode('person@example.invalid','123456');
  assert.equal(runtime.get().state.owner,'account-a');
  await runtime.change('supervised-learning','read',true);
  assert.equal(applied[0].operationId,'op-2');assert.equal(runtime.get().state.records['supervised-learning/read'].version,1);
  authListener('SIGNED_OUT',null);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(runtime.get().state.owner,'guest');assert.equal(runtime.get().state.records['supervised-learning/read'].value,true);
  let attempts=0;
  const retryAdapter={...adapter,async session(){return {user:{id:'retry-account'}};},onAuthChange(){return {unsubscribe(){}};},async load(){return [];},async apply(op){attempts++;if(attempts===1)throw Error('offline');return {status:'applied',record:{nodeId:op.nodeId,field:op.field,value:op.value,version:1,contentRevision:null}};}};
  const retryRuntime=runtimeFactory.create({model,adapter:retryAdapter,storage:{getItem(){return null;},setItem(){}},randomUUID:()=>`retry-${attempts+1}`});
  await retryRuntime.start();await retryRuntime.change('supervised-learning','read',true);
  assert.equal(retryRuntime.get().state.pending.length,1);assert(retryRuntime.get().error);
  await retryRuntime.flush();assert.equal(retryRuntime.get().state.pending.length,0);assert.equal(retryRuntime.get().error,null);
  let conflictAttempt=0;
  const conflictAdapter={...adapter,async session(){return {user:{id:'conflict-account'}};},onAuthChange(){return {unsubscribe(){}};},async load(){return [{nodeId:'supervised-learning',field:'read',value:false,version:2,contentRevision:null}];},async apply(op){conflictAttempt++;return conflictAttempt===1?{status:'conflict',record:{nodeId:op.nodeId,field:op.field,value:false,version:2,contentRevision:null}}:{status:'applied',record:{nodeId:op.nodeId,field:op.field,value:op.value,version:3,contentRevision:null}};}};
  const conflictRuntime=runtimeFactory.create({model,adapter:conflictAdapter,storage:{getItem(){return null;},setItem(){}},randomUUID:()=>`conflict-${conflictAttempt+1}`});
  await conflictRuntime.start();await conflictRuntime.change('supervised-learning','read',true);
  assert(conflictRuntime.get().state.conflicts['supervised-learning/read']);
  await conflictRuntime.resolveConflict('supervised-learning','read','local');
  assert.equal(conflictRuntime.get().state.records['supervised-learning/read'].value,true);assert.equal(conflictRuntime.get().state.records['supervised-learning/read'].version,3);
  assert.equal(JSON.parse(conflictRuntime.exportData()).exportVersion,1);
  const importMemory=new Map(),importStorage={getItem:key=>importMemory.get(key)||null,setItem:(key,value)=>importMemory.set(key,value),removeItem:key=>importMemory.delete(key)};
  let importId=0;const guestRuntime=runtimeFactory.create({model,storage:importStorage,randomUUID:()=>`guest-${++importId}`});await guestRuntime.start();await guestRuntime.change('supervised-learning','understood',true);
  let deleted=false;const importAdapter={...adapter,async session(){return {user:{id:'import-account'}};},onAuthChange(){return {unsubscribe(){}};},async load(){return [];},async apply(op){return {status:'applied',record:{nodeId:op.nodeId,field:op.field,value:op.value,version:1,contentRevision:null}};},async deleteAccount(){deleted=true;return {deleted:true};}};
  const importRuntime=runtimeFactory.create({model,adapter:importAdapter,storage:importStorage,randomUUID:()=>`import-${++importId}`});await importRuntime.start();
  assert(importRuntime.get().importPreview.some(item=>item.key==='supervised-learning/understood'));
  await importRuntime.completeGuestImport({'supervised-learning/understood':'local'});
  assert.equal(importRuntime.get().state.records['supervised-learning/understood'].value,true);assert.equal(importRuntime.get().importPreview.length,0);
  await importRuntime.deleteAccount();assert(deleted);assert.equal(importRuntime.get().state.owner,'guest');assert.equal(importMemory.has('ai-knowledge-map.progress.account.import-account.v1'),false);
  // Delayed cloud reads must not cross a logout or account switch boundary.
  let raceAuth,releaseLoad;
  const raceAdapter={...adapter,onAuthChange(fn){raceAuth=fn;return {unsubscribe(){}};},async load(){return new Promise(resolve=>{releaseLoad=resolve;});}};
  const raceRuntime=runtimeFactory.create({model,adapter:raceAdapter,storage:{getItem(){return null;},setItem(){}}});
  await raceRuntime.start();
  raceAuth('SIGNED_IN',{user:{id:'old-account'}});
  raceAuth('SIGNED_OUT',null);
  releaseLoad([{nodeId:'private-node',field:'read',value:true,version:1}]);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(raceRuntime.get().state.owner,'guest');
  assert.equal(raceRuntime.get().state.records['private-node/read'],undefined);
  raceAuth('SIGNED_IN',{user:{id:'account-b'}});
  releaseLoad([]);await new Promise(resolve=>setImmediate(resolve));
  const staleRefresh=raceRuntime.refresh();
  raceAuth('SIGNED_OUT',null);
  releaseLoad([{nodeId:'private-node',field:'read',value:true,version:2}]);
  await staleRefresh;
  assert.equal(raceRuntime.get().state.owner,'guest');
  assert.equal(raceRuntime.get().state.records['private-node/read'],undefined);
  // A valid OTP remains a successful login even if progress cannot load.
  let loginAuth,rejectProgress,loginLoads=0;
  const loginSession={user:{id:'login-account'}};
  const loginAdapter={...adapter,onAuthChange(fn){loginAuth=fn;return {unsubscribe(){}};},
    async load(){loginLoads++;return new Promise((resolve,reject)=>{rejectProgress=reject;});},
    async verifyCode(){loginAuth('SIGNED_IN',loginSession);return {session:loginSession};}};
  const loginRuntime=runtimeFactory.create({model,adapter:loginAdapter,storage:{getItem(){return null;},setItem(){}}});
  await loginRuntime.start();await loginRuntime.verifyCode('person@example.invalid','123456');
  assert.equal(loginRuntime.get().state.owner,'login-account');assert.equal(loginRuntime.get().loading,true);
  assert.equal(loginLoads,1,'SIGNED_IN and OTP response must share the progress load');
  rejectProgress(Error('cloud unavailable'));await new Promise(resolve=>setImmediate(resolve));
  assert.equal(loginRuntime.get().state.owner,'login-account');assert.equal(loginRuntime.get().loading,false);
  assert.equal(loginRuntime.get().error.message,'cloud unavailable');
  const noEventRuntime=runtimeFactory.create({model,adapter:{...adapter,async load(){throw Error('offline');}},storage:{getItem(){return null;},setItem(){}}});
  await noEventRuntime.start();await noEventRuntime.verifyCode('person@example.invalid','123456');
  assert.equal(noEventRuntime.get().state.owner,'account-a');assert.equal(noEventRuntime.get().error.message,'offline');
  console.log('PASS: migration, isolation, retry, conflicts, import, export, deletion, stale reads and successful login despite progress failure');
})().catch(error=>{console.error(error);process.exitCode=1;});
