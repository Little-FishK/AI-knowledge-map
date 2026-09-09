'use strict';
const assert=require('node:assert/strict');
const model=require('../../assets/progress-model');
const {create}=require('../../assets/progress-runtime');
const makeStorage=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
(async()=>{
  const cloud=new Map(),receipts=new Map();let sequence=0,online=true,events={},loseReceipt=false;
  const adapter={async session(){return {user:{id:'closeout-account'}};},onAuthChange(){},async load(){if(!online)throw Error('offline');return [...cloud.values()];},async apply(op){
    if(!online)throw Error('offline');
    if(receipts.has(op.operationId))return receipts.get(op.operationId);
    const key=model.key(op.nodeId,op.field),old=cloud.get(key)||{nodeId:op.nodeId,field:op.field,value:false,version:0};
    const response=old.version===op.expectedVersion?{status:'applied',record:{...old,value:op.value,version:old.version+1}}:{status:'conflict',record:{...old}};
    if(response.status==='applied')cloud.set(key,response.record);receipts.set(op.operationId,response);
    if(loseReceipt){loseReceipt=false;throw Error('response lost after commit');}return response;
  }};
  const storage=makeStorage(),id=()=>`closeout-${++sequence}`;
  const guest=create({model,storage,randomUUID:id});await guest.start();await guest.change('supervised-learning','read',true);
  let a=create({model,storage,adapter,randomUUID:id,eventTarget:{addEventListener(name,fn){events[name]=fn;}}});await a.start();
  online=false;await a.completeGuestImport({'supervised-learning/read':'local'});
  assert.equal(a.get().state.guestImportDecision.completedAt,undefined);
  assert.equal(a.get().state.pending.length,1);assert(a.get().error);
  const operation=a.get().state.pending[0].operationId;
  // Reload offline, then reconnect: retain the same operation, no duplicate import.
  a=create({model,storage,adapter,randomUUID:id,eventTarget:{addEventListener(name,fn){events[name]=fn;}}});await a.start();
  assert.equal(a.get().state.pending[0].operationId,operation);
  online=true;loseReceipt=true;events.online();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(a.get().state.guestImportDecision.completedAt,undefined,'lost receipt is not import completion');
  await a.refresh();assert.equal(a.get().state.pending.length,0);assert(a.get().state.guestImportDecision.completedAt);
  assert.equal(cloud.get('supervised-learning/read').version,1,'retry must not apply twice');
  assert.equal(JSON.parse(storage.getItem('ai-knowledge-map.progress.guest.v1')).records['supervised-learning/read'].value,true);
  // Independent device cancels; offline stale device must expose a conflict.
  const b=create({model,storage:makeStorage(),adapter,randomUUID:id});await b.start();
  online=false;await a.change('supervised-learning','read',false);
  online=true;await b.change('supervised-learning','read',false);
  await a.refresh();assert(a.get().state.conflicts['supervised-learning/read']);
  await a.resolveConflict('supervised-learning','read','remote');await b.refresh();
  assert.equal(a.get().state.records['supervised-learning/read'].value,false);
  assert.equal(b.get().state.records['supervised-learning/read'].value,false);
  // A conflicting import is not complete until the user's resolution is saved.
  const storage2=makeStorage(),guest2=create({model,storage:storage2,randomUUID:id});await guest2.start();await guest2.change('supervised-learning','read',true);
  const c=create({model,storage:storage2,adapter,randomUUID:id});await c.start();
  await b.change('supervised-learning','read',true);
  await c.completeGuestImport({'supervised-learning/read':'local'});
  assert(c.get().state.conflicts['supervised-learning/read']);assert.equal(c.get().state.guestImportDecision.completedAt,undefined);
  await c.resolveConflict('supervised-learning','read','local');assert(c.get().state.guestImportDecision.completedAt);
  const queued=receipts.size;await c.completeGuestImport({'supervised-learning/read':'local'});assert.equal(receipts.size,queued);
  console.log('PASS: offline import/reload, lost receipt retry, independent-device conflict, cancellation, guest backup and import completion gate (simulated cloud)');
})().catch(error=>{console.error(error);process.exitCode=1;});
