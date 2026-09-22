const {test}=require('node:test'),assert=require('node:assert/strict');
const {select,terminal}=require('./run-translation-renewal');
test('explicit restart can park only the exact batch with no active pages',()=>{
 const {parkAuthorized}=require('./run-translation-renewal');
 const s={campaignId:'exact',state:'needs-operator-review',pages:[{state:'held'}]};
 assert.equal(parkAuthorized(s,'exact'),true);
 assert.equal(parkAuthorized({...s,pages:[{state:'held'},{state:'published'}]},'exact'),true);
 assert.equal(parkAuthorized({...s,pages:[{state:'published'}]},'exact'),false);
 assert.equal(parkAuthorized({...s,pages:[]},'exact'),false);
 assert.equal(parkAuthorized(s,undefined),false);
 assert.equal(parkAuthorized(s,'different'),false);
 assert.equal(parkAuthorized({...s,pages:[{state:'translating'}]},'exact'),false);
 assert.equal(parkAuthorized({...s,state:'running'},'exact'),false);
});
test('select skips assigned, held, source-blocked, active and already translated pages',()=>{
 const ids=['assigned','held','source-blocked','active','translated','fresh1','fresh2','fresh3','fresh4','fresh5','fresh6'];
 const order=ids.map(pageId=>({pageId})),sources=ids.map(pageId=>({pageId,eligible:true,snapshotId:pageId}));
 const assets=ids.map(pageId=>({pageId,englishArtifactExists:pageId==='translated'}));
 const inventory=ids.map(pageId=>({pageId,active:pageId==='active'}));
 const chosen=select(order,sources,{assignedPages:['assigned'],excludedHeldPages:['held'],sourceConfirmationRejected:['source-blocked']},assets,inventory);
 assert.deepEqual(chosen.map(p=>p.pageId),['fresh1','fresh2','fresh3','fresh4','fresh5']);
});
test('only safely completed batches can renew, including held pages',()=>{
 assert.equal(terminal({state:'completed',pages:[{state:'published'},{state:'held'}]}),true);
 for(const state of ['running','budget-exhausted','needs-operator-review'])assert.equal(terminal({state,pages:[{state:'held'}]}),false);
 assert.equal(terminal({state:'completed',pages:[{state:'quality'}]}),false);
});
test('recommended path prioritizes pages without excluding other confirmed current pages',()=>{
 const ids=['agent','held-extra','llm','priority','unconfirmed'];
 const sources=ids.filter(id=>id!=='unconfirmed').map(pageId=>({pageId,eligible:true,snapshotId:pageId}));
 const assets=ids.map(pageId=>({pageId,englishArtifactExists:false}));
 const inventory=ids.map(pageId=>({pageId,active:false}));
 const ledger={assignedPages:[],excludedHeldPages:['held-extra'],sourceConfirmationRejected:[]};
 assert.deepEqual(select([{pageId:'priority'}],sources,ledger,assets,inventory).map(p=>p.pageId),['priority','agent','llm']);
});
