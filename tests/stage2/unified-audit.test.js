"use strict";
const assert=require('assert'),fs=require('fs'),path=require('path'),os=require('os');
const {evaluateAudit}=require('../../tools/deepdive/quality/audit-evaluation');
const {SIX_QUESTIONS,AUDIT_POLICY_HASH}=require('../../tools/deepdive/quality/audit-policy');
const {pageContentHash}=require('../../tools/deepdive/quality/deepdive-audit-contracts');
const core=require('../../tools/deepdive-stage2/core');
const {spawnSync}=require('child_process');
const {sha256}=require('../../tools/deepdive-stage2/lib/state-store');
const page={title:'Alpha',subtitle:'A concept',thesis:'A worked mechanism',quality:{sectionContracts:[{answer:'synthetic-old-answer-must-not-leak'}]},html:'<section class="dd-sec"><h2>Question</h2><p>The mechanism transforms the input into an output under a stated condition.</p></section><section class="dd-sec"><h2>Result</h2><p>This result is an estimate with a boundary.</p></section>'};
const quote='The mechanism transforms the input into an output under a stated condition.';
const check=()=>({status:'pass',evidence:[{section:1,quote}],rationale:'Synthetic test evidence, not a real content review.'});
function full(){const audit={schemaVersion:4,policyId:'whole-page-teaching-v4',policyHash:AUDIT_POLICY_HASH,pageId:'alpha',pageHash:pageContentHash(page),reviewedAt:'2026-08-01',mode:'full',decision:'pass',blockingFindings:[],warnings:[],reviewedSections:[1,2],coreConcepts:[{name:'Alpha',sections:[1,2],...Object.fromEntries(SIX_QUESTIONS.map(k=>[k,check()]))}],pageChecks:Object.fromEntries(['facts','formulas','figures','sources','consistency'].map(k=>[k,check()]))};audit.pageChecks.consistency.evidence.push({section:2,quote:'This result is an estimate with a boundary.'});return audit;}
assert(evaluateAudit('alpha',page,full()).passed);
assert.equal(evaluateAudit('alpha',page,full()).teaching.learnerValidation,'not-tested');
function rejects(change){const audit=full();change(audit);assert(!evaluateAudit('alpha',page,audit).passed);}
rejects(a=>a.pageHash='sha256:'+'0'.repeat(64));
rejects(a=>a.policyHash='sha256:'+'0'.repeat(64));
rejects(a=>a.coreConcepts[0].mechanism.evidence[0].section=2);
rejects(a=>delete a.coreConcepts[0].mechanism);
rejects(a=>a.reviewedSections=[1,1,2]);
rejects(a=>a.pageChecks.consistency.evidence.pop());
rejects(a=>a.coreConcepts[0].mechanism.status='not-applicable');
rejects(a=>{a.pageChecks.facts.status='fail';});
rejects(a=>a.reviewedAt='2999-01-01');
rejects(a=>a.reviewedSections={invalid:true});
rejects(a=>a.coreConcepts=[null]);
rejects(a=>a.coreConcepts[0].sections={invalid:true});
for(const markup of ['<div class="dd-formula">x = y</div>','<math><mi>x</mi></math>','<div data-formula-id="example">x = y</div>']) {
  const mathPage={...page,html:page.html.replace('</section>',markup+'</section>')};
  const noMath=full();noMath.pageHash=pageContentHash(mathPage);noMath.pageChecks.formulas.status='not-applicable';
  assert(!evaluateAudit('alpha',mathPage,noMath).passed);
}
const optional=full();Object.assign(optional.coreConcepts[0].inputOutput,{status:'not-applicable',applicabilityReason:'Synthetic applicability example'});assert(evaluateAudit('alpha',page,optional).passed);
for(const version of [1,2,3]){const old=full();old.schemaVersion=version;const r=evaluateAudit('alpha',page,old);assert(!r.passed);assert.equal(r.records.status,'historical-needs-upgrade');}
const cross=full();cross.coreConcepts[0].interpretation.evidence=[{section:2,quote:'This result is an estimate with a boundary.'}];assert(evaluateAudit('alpha',page,cross).passed);
const fail=full();fail.decision='fail';fail.coreConcepts[0].mechanism.status='fail';fail.blockingFindings=[{code:'core-concept-mechanism-missing',concept:'Alpha',sections:[1],claim:'Missing cause',evidence:quote,rationale:'Synthetic missing cause',acceptanceCriteria:'Explain cause'}];const failed=evaluateAudit('alpha',page,fail);assert.equal(failed.records.status,'complete');assert.equal(failed.accuracy,'pass');assert.equal(failed.teaching.expertReview,'fail');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'unified-audit-'));
function write(rel,text){const f=path.join(fixture,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,text);}
write('data/graph.js',"window.GRAPH={nodes:[{id:'alpha',title:'Alpha'}],edges:[],core:[],domains:{x:{title:'X'}},edgeTypes:{requires:{title:'requires'}},positions:{alpha:[0,0]},recommendedLearningPath:[{phase:'Basic',steps:[['1.3','alpha']]}]};");
write('data/deepdive/alpha.js','window.DEEPDIVE={alpha:'+JSON.stringify(page)+'};');
write('data/deepdive/.standalone-pages.json',JSON.stringify({schemaVersion:1,mode:'standalone-page',pageCount:1}));
write('data/deepdive-runtime/alpha.js','window.DEEPDIVE={alpha:'+JSON.stringify(page)+'};');
write('data/deepdive-runtime/manifest.js','window.DEEPDIVE_RUNTIME={base:"data/deepdive-runtime",ids:["alpha"]};');
write('index.html','<script src="data/deepdive-runtime/manifest.js"></script>');
core.initialize(fixture);core.setPaused(fixture,false);
const task=core.claimTask(fixture,'independent-fixture-auditor','alpha').task;
assert.equal(task.auditContract.schemaVersion,4);
assert.equal(task.auditContract.policyHash,AUDIT_POLICY_HASH);
assert(task.projectReadOnly.suggestedPaths.includes('tools/deepdive/quality/audit-policy.js'));
assert(!task.projectReadOnly.suggestedPaths.includes('tools/deepdive/quality/audit-deepdive-benchmark.js'));
assert.deepEqual(Object.keys(task.page).sort(),['html','subtitle','thesis','title']);
assert(!JSON.stringify(task.page).includes('synthetic-old-answer-must-not-leak'));
const continued=core.readTaskPacketPart(fixture,{taskId:task.taskId,leaseToken:task.leaseToken,part:'contract'});
assert(!JSON.stringify(continued).includes('synthetic-old-answer-must-not-leak'));
assert.throws(()=>core.readAuditProjectFile(fixture,{taskId:task.taskId,leaseToken:task.leaseToken,path:'data/deepdive/alpha.js'}),/禁止访问/);
assert.deepEqual(core.searchAuditProject(fixture,{taskId:task.taskId,leaseToken:task.leaseToken,query:'synthetic-old-answer-must-not-leak'}).matches,[]);
let published=false;
const receipt=core.submitResult(fixture,{taskId:task.taskId,leaseToken:task.leaseToken,result:full()},{evaluateCandidate:()=>({passed:true,results:[],blockers:[]}),publishCandidate:()=>{published=true;throw Error('Must not auto-publish v4');}});
assert.equal(receipt.nextState,'manual-review');assert(!published);
let state=core.loadState(fixture),record=state.pages.alpha;
assert.equal(record.qualityEvaluation.records.status,'complete');assert.equal(record.auditReceipts.length,1);
assert(record.auditFile.includes('audit-'));assert.equal(record.repairAttempts,0);
const invalidFinal=full();invalidFinal.policyHash='sha256:'+'0'.repeat(64);
const acceptedAuditPath=path.join(fixture,record.auditFile);
fs.writeFileSync(acceptedAuditPath,JSON.stringify(invalidFinal));
assert.throws(()=>core.finalizeManualReview(fixture,'alpha','Synthetic approval',{publishCandidate:()=>{throw Error('Must reject before publication');}}),/审核记录不完整/);
fs.writeFileSync(acceptedAuditPath,JSON.stringify(full()));
const approved=core.finalizeManualReview(fixture,'alpha','Synthetic explicit approval',{
  evaluateCandidate:()=>({passed:true,results:[],blockers:[]}),
  publishCandidate:()=>{write('docs/deepdive-audits/alpha.json',JSON.stringify(full()));return {status:'published'};}
});
assert.equal(approved.status,'published-approved');
state=core.loadState(fixture);record=state.pages.alpha;
assert.equal(record.publication.reviewStatus,'human-approved');
const before=JSON.stringify(state);
assert.throws(()=>core.queueAuditUpgrade(fixture,'alpha','sha256:'+'0'.repeat(64),'test drift'));
assert.equal(JSON.stringify(core.loadState(fixture)),before);
core.queueAuditUpgrade(fixture,'alpha',pageContentHash(page),'Synthetic migration preserves history');
state=core.loadState(fixture);assert.equal(state.pages.alpha.auditReceipts.length,1);assert.equal(state.pages.alpha.auditUpgrades.length,1);assert.equal(state.pages.alpha.repairAttempts,0);assert.equal(state.pages.alpha.state,'audit-queued');
assert.equal(state.pages.alpha.auditUpgradePublicationHold,true);
const initial=[{findingId:'case-1',code:'formula-error',section:1}];
const targeted={schemaVersion:4,policyId:'whole-page-teaching-v4',policyHash:AUDIT_POLICY_HASH,pageId:'alpha',pageHash:pageContentHash(page),reviewedAt:'2026-08-01',mode:'verification',decision:'pass',coreConcepts:[],blockingFindings:[],warnings:[],verificationScopeHash:sha256(initial),verificationResults:[{findingId:'case-1',resolved:true,evidence:quote,rationale:'Synthetic resolution'}]};
const targetResult=evaluateAudit('alpha',page,targeted,{schemaVersion:4,mode:'verification',verificationFindings:initial,verificationScopeHash:sha256(initial)});
assert(targetResult.passed);assert.equal(targetResult.teaching.expertReview,'targeted-review-only');
assert(!evaluateAudit('alpha',page,targeted).passed);
write('docs/deepdive-audits/alpha.json',JSON.stringify(full()));
write('docs/deepdive-l3-benchmark.json',JSON.stringify({reference:{id:'nonexistent-mutable-page',pageHash:'mismatched'}}));
const cli=path.resolve(__dirname,'../../tools/deepdive/quality/audit-deepdive-unified.js');
function run(){return spawnSync(process.execPath,[cli,'--page','alpha'],{cwd:fixture,env:{...process.env,DEEPDIVE_ROOT:fixture},encoding:'utf8'});}
let cliResult=run();assert.equal(cliResult.status,0,cliResult.stdout+cliResult.stderr);assert(JSON.parse(cliResult.stdout).passed);
const stale=full();stale.pageHash='sha256:'+'0'.repeat(64);write('docs/deepdive-audits/alpha.json',JSON.stringify(stale));assert.equal(run().status,1);
write('docs/deepdive-audits/alpha.json',JSON.stringify(targeted));assert.equal(run().status,1);
// Execute the publication transaction on this fixture and fail its new v4 gate.
// All written targets must roll back, and the legacy benchmark tool must never run.
const {createPublication}=require('../../tools/deepdive-stage2/lib/publication');
const calls=[];
const publication=createPublication({toolScripts:{graphValidator:'graph',deepDiveValidator:'structure',videoApplicationValidator:'video',deepDiveL3Audit:'legacy'},
  clone:structuredClone,sha256,atomicWrite:(file,text)=>fs.writeFileSync(file,text),readJson:file=>JSON.parse(fs.readFileSync(file,'utf8')),
  withinRoot:(root,relative)=>path.join(root,relative),writeJson:(file,value)=>fs.writeFileSync(file,JSON.stringify(value)),loadSupplementQueue:()=>({items:[]}),
  runGate:(root,cwd,script,args)=>{calls.push({script,args});return {script,passed:script!=='tools/deepdive/quality/audit-deepdive-unified.js',output:'synthetic rejected v4 gate'};}});
const targets=['data/deepdive/alpha.js','docs/deepdive-audits/alpha.json','data/deepdive-runtime/alpha.js','data/deepdive-runtime/manifest.js'].map(relativePath=>({relativePath,beforeContent:fs.readFileSync(path.join(fixture,relativePath),'utf8')}));
assert.throws(()=>publication.publishCandidate(fixture,{id:'alpha'},page,full()),/已恢复本次发布写入/);
for(const target of targets)assert.equal(fs.readFileSync(path.join(fixture,target.relativePath),'utf8'),target.beforeContent);
assert(calls.some(c=>c.script==='tools/deepdive/quality/audit-deepdive-unified.js'&&JSON.stringify(c.args)==='["--page","alpha"]'));
assert(!calls.some(c=>c.script==='legacy'));
const priorPublication={status:'published-approved',pageHash:pageContentHash(page)};
for(const preservedRecord of [
  {id:'alpha',auditPolicyVersion:4,publication:priorPublication},
  {id:'alpha',auditPolicyVersion:4,auditUpgradePublicationHold:true,publication:{status:'published-provisional'}}
]){
  const beforePublication=structuredClone(preservedRecord.publication);
  const preserved=publication.refreshEditorialDraftPublication(fixture,preservedRecord,page,'human-review-pending',0,{publishEditorialDraft:()=>{throw Error('Audit upgrade must not publish a draft');}});
  assert.deepEqual(preserved,beforePublication);assert.deepEqual(preservedRecord.publication,beforePublication);
}
function changedRun(extraEnv={}){return spawnSync(process.execPath,[cli,'--changed'],{cwd:fixture,env:{...process.env,DEEPDIVE_ROOT:fixture,DEEPDIVE_BASE_REF:'',GITHUB_BASE_REF:'',CI:'',...extraEnv},encoding:'utf8'});}
write('docs/deepdive-audits/alpha.json',JSON.stringify(full()));
assert.notEqual(changedRun().status,0,'An unavailable baseline must fail, even with a valid current audit');
function git(args){const result=spawnSync('git',['-c',`safe.directory=${fixture.replace(/\\/g,'/')}`,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid',...args],{cwd:fixture,encoding:'utf8'});assert.equal(result.status,0,result.stderr);return result.stdout.trim();}
git(['init','--quiet']);git(['add','data/deepdive']);git(['commit','--quiet','-m','Synthetic baseline']);
const base=git(['rev-parse','HEAD']);
assert.equal(JSON.parse(changedRun().stdout).checked,1,'Unchanged v4 evidence is still checked');
const historical=full();historical.schemaVersion=3;
write('docs/deepdive-audits/alpha.json',JSON.stringify(historical));
assert.equal(JSON.parse(changedRun().stdout).checked,0,'Unchanged historical audits are not labeled v4 passes');
assert.equal(changedRun({CI:'true'}).status,1,'CI without a base must check all pages');
write('data/deepdive/alpha.js','window.DEEPDIVE={alpha:'+JSON.stringify({...page,title:'Updated Alpha'})+'};');
assert.equal(changedRun().status,1,'Local changed historical content needs upgrade');
git(['add','data/deepdive']);git(['commit','--quiet','-m','Synthetic changed content']);
assert.equal(changedRun({DEEPDIVE_BASE_REF:base}).status,1,'Committed changes must be compared against the CI base');
assert.notEqual(changedRun({DEEPDIVE_BASE_REF:'missing-audit-base'}).status,0);
console.log('✓ Unified audit: version/evidence/coverage/applicability gates, distinct evaluations, manual publication, migration preservation and reference-independent CLI');
