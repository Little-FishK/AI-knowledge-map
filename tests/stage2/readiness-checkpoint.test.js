"use strict";
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {createReadinessCheckpoint}=require('../../tools/deepdive-stage2/lib/readiness-checkpoint');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'readiness-checkpoint-test-'));
fs.mkdirSync(path.join(root,'data'));fs.writeFileSync(path.join(root,'data','example.json'),'private body');
const runtime=path.join(root,'test-runtime');fs.mkdirSync(runtime);fs.writeFileSync(path.join(runtime,'state-object.json'),'private audit');fs.mkdirSync(path.join(runtime,'credentials'));fs.writeFileSync(path.join(runtime,'credentials','key'),'secret');
let released=0,active=false;
const deps={root,runtimeDirectory:()=>runtime,acquireLock:()=>()=>released++,loadState:()=>({pages:{x:{lease:active?{}:null}}})};
const r=createReadinessCheckpoint(deps);assert.equal(r.fileCount,2);assert.equal(r.restoredFilesVerified,2);assert.equal(r.excludedCount,1);assert.equal(released,1);assert(!JSON.stringify(r).includes('private'));assert(!fs.existsSync(path.join(r.directory,'saved','runtime','credentials')));
assert.equal(fs.readFileSync(path.join(r.directory,'restore-check','project','data','example.json'),'utf8'),'private body');
const next=createReadinessCheckpoint({...deps,prunePrevious:true});
assert.equal(next.prunedCheckpoints,1);assert(!fs.existsSync(r.directory));assert(fs.existsSync(next.directory));
assert.equal(fs.readFileSync(path.join(next.directory,'restore-check','project','data','example.json'),'utf8'),'private body');
active=true;assert.throws(()=>createReadinessCheckpoint(deps),/active content lease/);assert.equal(released,3);
// Fixture is retained in the OS temporary folder; no production restoration or deletion occurs.
console.log('✓ Checkpoint copies and independently restores files, excludes credentials, blocks active leases');
