"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { createTranslationQuality } = require("../../tools/deepdive-stage2/lib/translation-quality");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "translation-quality-"));
let count = 0;
const clone = value => JSON.parse(JSON.stringify(value));
function test(name, action) { action(); count++; console.log(`PASS ${name}`); }
function fixture(id, bad = false, resources = false) {
  const material = { pageId: id, planId: "plan", snapshotId: "snapshot",
    generation: { model: "fixture-model", reasoningEffort: "high" }, chapters: [
    { chapterId: "page-header", units: [{ id: "title:0", source: "机制", kind: "plain-text" }], output: { translations: { "title:0": "Mechanism" }, sourceConcerns: [] } },
    { chapterId: "section-1", units: [{ id: "u1", source: "输入 2 时成立。", kind: "text" }, { id: "u2", source: "答案：否", kind: "attribute" }],
      output: { translations: { u1: bad ? "It holds for 3." : "It holds for 2.", u2: "Answer: no" }, sourceConcerns: [] } },
  ] };
  const snapshot = { capture: { page: { html: '<section><p>输入 2 时成立。</p><p>答案：否</p></section>' },
    approvalEvidence: { sourceEligibleForEnglishReview: true }, glossary: { terms: { term: { zhHans: "机制", displayTitle: "Mechanism" } } },
    manifest: { units: [{ chapterId: "section-1" }], resources: resources ? [{ tag: "img" }] : [], protectedSpans: [], dependencies: [] } } };
  let sourceState = "prepared";
  const quality = createTranslationQuality({ storageDirectory: () => root,
    translationReviewMaterial: () => clone(material), checkTranslationSnapshot: () => ({ state: sourceState }),
    readTranslationSnapshot: (_root, _page, _snapshot, offset, maxChars) => {
      const text = JSON.stringify(snapshot), content = text.slice(offset, offset + maxChars), nextOffset = offset + content.length;
      return { content, nextOffset, done: nextOffset === text.length };
    } });
  let initial = quality.beginTranslationQuality(root, id, "plan");
  const inspect = () => quality.inspectTranslationQuality(root, id, initial.reviewId);
  const packet = role => quality.translationQualityPacket(root, id, initial.reviewId, role || "review");
  const evidence = (findings = []) => ({
    checkedUnits: packet().units.map(unit => ({ unitKey: unit.key, sourceQuote: unit.source, translationQuote: unit.translation,
      rationale: "The translation preserves the meaning and qualifications of this source unit." })),
    wholePageRationale: "All sections were compared together for consistent terminology, reference resolution and relationships between explanations and the self-test.", findings,
  });
  const review = (value = evidence(), who = "reviewer-one") => quality.submitTranslationReview(root, id, initial.reviewId, inspect().revision, value, who);
  const repair = (value, who = "repairer-one", revision = inspect().revision) => quality.repairTranslationUnits(root, id, initial.reviewId, revision, value, who);
  return { material, snapshot, quality, initial, inspect, packet, evidence, review, repair, stale() { sourceState = "stale"; } };
}
try {
  test('operator amendment is exact, defect-scoped and requires independent re-review',()=>{
    const f=fixture('operator-amendment',true),current=f.inspect();
    const args={pageId:'operator-amendment',reviewId:current.reviewId,revision:current.revision,replacements:{'section-1/u1':'It holds for 2.'},reason:'User requested fixing the localized numeric defect; preserve the exact authoritative source value.'};
    const call=a=>f.quality.amendTranslationUnits(root,a.pageId,a.reviewId,a.revision,a.replacements,a.reason);
    const authorize=a=>process.env.STAGE2_AUTHORIZED_UNIT_AMENDMENT='sha256:'+require('crypto').createHash('sha256').update(JSON.stringify(a)).digest('hex');
    try{assert.throws(()=>call(args),/authorization/);
      const bad={...args,replacements:{'page-header/title:0':'Changed title'}};authorize(bad);assert.throws(()=>call(bad),/sanitized/);
      authorize(args);const result=call(args);assert.equal(result.state,'awaiting-independent-review');assert.equal(result.publicationAllowed,false);
      assert.throws(()=>call(args),/revision/);
    }finally{delete process.env.STAGE2_AUTHORIZED_UNIT_AMENDMENT;}
  });
  test('round review allows one explicitly scoped extra repair without accepting its result',()=>{
    const page='round-extra',f=fixture(page),q=f.quality,id=f.initial.reviewId;
    q.enableRoundReview(root,page,id);
    const submit=(p,key,who)=>{const u=p.pageContext.find(u=>u.key===key);return q.submitTranslationReviewBatch(root,page,id,p.revision,{batchId:p.batchId,checkedUnitKeys:p.reviewUnitKeys,findings:key?[{rule:7,unitKey:key,sourceQuote:u.source,translationQuote:u.translation,reason:'Synthetic localized omission needs a precise wording correction.',mqmCategory:'accuracy/omission',severity:'minor'}]:[],summary:'All assigned units and their related context were checked independently.'},who);};
    submit(q.translationReviewBatchPacket(root,page,id),'page-header/title:0','extra-initial');
    f.repair({'page-header/title:0':'Mechanism overview'});
    submit(q.translationReviewBatchPacket(root,page,id),'section-1/u2','extra-verifier');
    assert.equal(f.inspect().state,'manual-review-required');
    assert.equal(q.authorizeExtraRepair(root,page,id,'authorized-round-extra',['section-1/u2']).state,'needs-repair');
    const repaired=f.repair({'section-1/u2':'The answer is no.'},'extra-repairer');
    assert.equal(repaired.state,'awaiting-independent-review');assert(repaired.extraRepair.used);
    assert.throws(()=>q.authorizeExtraRepair(root,page,id,'another-round-extra',['section-1/u2']),/already/);
  });
  test('full round then scoped verification preserves unchanged audit provenance',()=>{
    const f=fixture('round-provenance'),q=f.quality,id=f.initial.reviewId;
    q.enableRoundReview(root,'round-provenance',id);
    let p=q.translationReviewBatchPacket(root,'round-provenance',id);
    const title=p.pageContext[0];
    const submit=(packet,findings,who)=>q.submitTranslationReviewBatch(root,'round-provenance',id,packet.revision,{batchId:packet.batchId,checkedUnitKeys:packet.reviewUnitKeys,findings,summary:'The assigned text and cross references have been independently compared.'},who);
    submit(p,[{rule:7,unitKey:title.key,sourceQuote:title.source,translationQuote:title.translation,reason:'Synthetic title requires a clearer qualifier.',mqmCategory:'accuracy/mistranslation',severity:'minor'}],'round-first');
    f.repair({[title.key]:'Mechanism overview'});
    p=q.translationReviewBatchPacket(root,'round-provenance',id);
    assert.equal(p.phase,'verification');assert.deepEqual(p.reviewUnitKeys,[title.key]);
    const result=submit(p,[],'round-verifier');assert.equal(result.state,'awaiting-resource-browser-human-review');
    assert.equal(result.batchReviewProgress.total,1);
  });
  test('false-positive adjudication requires exact authorization and preserves audit history',()=>{
    const hash=value=>'sha256:'+require('node:crypto').createHash('sha256').update(JSON.stringify(value)).digest('hex');
    const f=fixture('adjudicate'),u=f.packet().units[0];
    const finding={rule:8,unitKey:u.key,sourceQuote:u.source,translationQuote:u.translation,reason:'Synthetic capitalization preference without a semantic difference.'};
    f.review(f.evidence([finding]));const before=f.inspect();
    const decisions=[{findingHash:hash(finding),reason:'User-authorized dismissal of a synthetic stylistic false positive.'}];
    const args={pageId:'adjudicate',reviewId:before.reviewId,revision:before.revision,decisions};
    assert.throws(()=>f.quality.adjudicate(root,args.pageId,args.reviewId,args.revision,decisions),/authorization/);
    process.env.STAGE2_TRANSLATION_ADJUDICATION=hash(args);
    try {const after=f.quality.adjudicate(root,args.pageId,args.reviewId,args.revision,decisions);assert.equal(after.defects.length,0);assert.equal(after.adjudications.length,1);assert.equal(after.adjudications[0].machineAuditAsserted,false);assert.equal(after.publicationAllowed,false);f.stale();assert.throws(()=>f.quality.adjudicate(root,args.pageId,args.reviewId,args.revision,decisions),/Stale/);}finally{delete process.env.STAGE2_TRANSLATION_ADJUDICATION;}
  });
  test('authorized source notes are distinct from false positives and cannot waive ordinary additions',()=>{
    const hash=value=>'sha256:'+require('node:crypto').createHash('sha256').update(JSON.stringify(value)).digest('hex');
    const f=fixture('source-note'),unitKey='section-1/u1';
    f.review(f.evidence([{rule:7,unitKey,sourceQuote:'输入 2',translationQuote:'It holds for 2.',reason:'A synthetic source ambiguity needs a labelled note.'}]));
    const translation='It holds for 2. [Source discrepancy: the source uses inconsistent labels.]';
    f.repair({[unitKey]:translation});
    const finding={rule:8,unitKey,sourceQuote:'输入 2',translationQuote:translation,reason:'The labelled source note is added explanatory content.',mqmCategory:'accuracy/addition',severity:'minor'};
    f.review(f.evidence([finding]),'note-reviewer');
    const current=f.inspect();
    const decisions=[{findingHash:hash(finding),disposition:'authorized-source-note',reason:'The operator explicitly authorizes the clearly labelled source-discrepancy note. It preserves the source value and distinguishes the annotation from translated source prose.'}];
    const args={pageId:'source-note',reviewId:current.reviewId,revision:current.revision,decisions};
    process.env.STAGE2_TRANSLATION_ADJUDICATION=hash(args);
    try{const r=f.quality.adjudicate(root,args.pageId,args.reviewId,args.revision,decisions);assert.equal(r.adjudications[0].kind,'operator-authorized-source-note');assert.equal(r.adjudications[0].machineAuditAsserted,false);assert.equal(r.publicationAllowed,false);}finally{delete process.env.STAGE2_TRANSLATION_ADJUDICATION;}
    const ordinary=fixture('ordinary-addition'),u=ordinary.packet().units[0];
    const bad={...finding,unitKey:u.key,sourceQuote:u.source,translationQuote:u.translation};ordinary.review(ordinary.evidence([bad]));
    const q=ordinary.inspect(),ds=[{...decisions[0],findingHash:hash(bad)}];
    process.env.STAGE2_TRANSLATION_ADJUDICATION=hash({pageId:'ordinary-addition',reviewId:q.reviewId,revision:q.revision,decisions:ds});
    try{assert.throws(()=>ordinary.quality.adjudicate(root,'ordinary-addition',q.reviewId,q.revision,ds),/explicit labelled/);}finally{delete process.env.STAGE2_TRANSLATION_ADJUDICATION;}
  });
  test('v2 batches persist progress, reject partial acceptance and isolate reviewers from repair',()=>{
    const f=fixture('v2-batches'),q=f.quality,id=f.initial.reviewId;
    const packet=()=>q.translationReviewBatchPacket(root,'v2-batches',id);
    const evidence=p=>({batchId:p.batchId,checkedUnitKeys:p.reviewUnitKeys,findings:[],summary:p.phase==='consistency'?'The page uses consistent terminology and references.':''});
    const submit=(p,e,who)=>q.submitTranslationReviewBatch(root,'v2-batches',id,p.revision,e,who);
    const p1=packet();const a=submit(p1,evidence(p1),'batch-reviewer-one');
    assert.equal(a.state,'awaiting-independent-review');assert.equal(a.batchReviewProgress.accepted,1);assert.equal(a.gates[6].status,'pending-semantic-review');
    assert.throws(()=>submit(p1,evidence(p1),'batch-reviewer-two'),/batch/);
    assert.throws(()=>f.review(f.evidence()),/Partial batch/);
    const p2=packet();assert.equal(p2.phase,'consistency');
    assert.throws(()=>submit(p2,{...evidence(p2),summary:''},'batch-reviewer-two'),/summary/);
    assert.equal(packet().batchId,p2.batchId);assert.equal(f.inspect().batchReviewProgress.accepted,1);
    const u=p2.pageContext.find(u=>u.key==='section-1/u1');
    const finding={rule:7,unitKey:u.key,sourceQuote:u.source,translationQuote:u.translation,reason:'Qualification lost.',mqmCategory:'accuracy/omission',severity:'major'};
    const result=submit(p2,{...evidence(p2),findings:[finding]},'batch-reviewer-two');
    assert.equal(result.state,'needs-repair');
    assert.throws(()=>f.repair({'section-1/u1':'For input 2, the condition holds.'},'batch-reviewer-one'),/reviewer cannot/i);
    f.repair({'section-1/u1':'For input 2, the condition holds.'},'independent-repairer');
    assert.equal(f.inspect().batchReviewProgress,null);assert.notEqual(packet().batchId,p1.batchId);
    assert.throws(()=>submit(p1,evidence(p1),'new-reviewer'),/revision/);
  });
  test('re-review preserves findings and blocks automatic reversal after scoped repair',()=>{
    const f=fixture('review-dispute');
    const finding=()=>{const u=f.packet().units.find(u=>u.id==='u1');return {rule:7,unitKey:u.key,sourceQuote:u.source,translationQuote:u.translation,reason:'Ambiguous source should use regression testing in this example.'};};
    f.review(f.evidence([finding()]));
    f.repair({'section-1/u1':'For input 2, regression testing holds.'});
    const reversed={...finding(),reason:'Regression testing adds an unsupported interpretation to this source.'};
    const r=f.review(f.evidence([reversed]),'reviewer-two');
    assert.equal(r.state,'manual-review-required');
    assert.equal(r.findingHistory[0].lifecycle,'disputed-after-repair');
    assert.equal(r.findingHistory[0].previousFindings.length,1);
    assert.equal(r.reviewSchedule.next,null);
    assert.throws(()=>f.repair({'section-1/u1':'It holds for 2.'}),/adjudication/);
  });
  test('new findings on untouched units remain distinguishable and repairable',()=>{
    const f=fixture('new-review-finding');
    const a=f.packet().units.find(u=>u.id==='u1');
    f.review(f.evidence([{rule:7,unitKey:a.key,sourceQuote:a.source,translationQuote:a.translation,reason:'Synthetic first finding needs localized wording repair.'}]));
    f.repair({'section-1/u1':'For input 2, the condition holds.'});
    const b=f.packet().units.find(u=>u.id==='u2');
    const r=f.review(f.evidence([{rule:7,unitKey:b.key,sourceQuote:b.source,translationQuote:b.translation,reason:'Newly discovered issue in a previously untouched unit.'}]),'reviewer-two');
    assert.equal(r.state,'needs-repair');assert.equal(r.findingHistory[0].lifecycle,'new');
    assert.deepEqual(r.repairableUnitKeys,[b.key]);
  });
  test('explicit extra repair is revision-bound, exact-scope, single-use and independently reviewed',()=>{
    const f=fixture('extra-repair',true);
    f.repair({'section-1/u1':'It holds for 4.'});f.repair({'section-1/u1':'It holds for 2.'});
    const unit=f.packet().units.find(u=>u.id==='u1');
    const finding={rule:7,unitKey:unit.key,sourceQuote:unit.source,translationQuote:unit.translation,reason:'Synthetic wording defect requires a scoped correction.'};
    f.review(f.evidence([finding]));
    assert.equal(f.inspect().state,'manual-review-required');
    assert.throws(()=>f.quality.authorizeExtraRepair(root,'extra-repair',f.initial.reviewId,'human-extra-001',['section-1/u2']),/scope/);
    const grant=()=>f.quality.authorizeExtraRepair(root,'extra-repair',f.initial.reviewId,'human-extra-001',['section-1/u1']);
    assert.equal(grant().state,'needs-repair');assert.equal(grant().repairCount,2);
    assert.throws(()=>f.repair({'section-1/u2':'No'}),/scope/);
    const result=f.repair({'section-1/u1':'For input 2, the condition holds.'},'new-independent-repairer');
    assert.equal(result.repairCount,3);assert.equal(result.extraRepair.used,true);assert.equal(result.state,'awaiting-independent-review');
    assert.equal(grant().repairCount,3);
    assert.throws(()=>f.repair({'section-1/u1':'It holds for 2.'}),/limit/);
    assert.throws(()=>f.quality.authorizeExtraRepair(root,'extra-repair',f.initial.reviewId,'human-extra-002',['section-1/u1']),/already/);
  });
  test('MQM metadata survives review and sanitized repair without relaxing minor defects',()=>{
    const f=fixture('mqm-minor'),unit=f.packet().units.find(u=>u.id==='u1');
    const finding={rule:7,unitKey:unit.key,sourceQuote:unit.source,translationQuote:unit.translation,
      reason:'Synthetic localized mistranslation requiring independent correction.',mqmCategory:'accuracy/mistranslation',severity:'minor'};
    const result=f.review(f.evidence([finding]));
    assert.equal(result.state,'needs-repair');assert.equal(result.publicationAllowed,false);
    assert.equal(result.qualitySummary.layers.find(l=>l.name==='semantic').status,'blocked');
    assert.equal(result.qualitySummary.issues[0].severity,'minor');
    assert.equal(f.packet('repair').defects[0].mqmCategory,'accuracy/mistranslation');
    assert(!JSON.stringify(f.packet('repair')).includes('reviewer-one'));
  });
  test('MQM classification rejects invalid category/rule while legacy findings remain readable',()=>{
    const f=fixture('mqm-invalid'),unit=f.packet().units.find(u=>u.id==='u1');
    const finding={rule:4,unitKey:unit.key,sourceQuote:unit.source,translationQuote:unit.translation,
      reason:'Synthetic terminology defect with exact source and translation quotes.',mqmCategory:'accuracy/omission',severity:'major'};
    assert.throws(()=>f.review(f.evidence([finding])),/MQM/);
    delete finding.mqmCategory;delete finding.severity;
    const result=f.review(f.evidence([finding]));
    assert.equal(result.qualitySummary.issues[0].severity,'unassessed');
    assert.equal(result.qualitySummary.issues[0].classificationOrigin,'rule-mapping');
  });
  test("Chinese magnitude equivalence preserves values without weakening numeric guards", () => {
    const f = fixture("magnitude-equivalence");
    const { mechanical } = require("../../tools/deepdive-stage2/lib/translation-quality");
    for (const [source, translation, passes] of [
      ['第三章第二节；方案一：40 token','Chapter 3, Section 2; Option 1: 40 tokens',true],
      ['第三章第二节','Chapter 3, Section 3',false],
      ['2022 年 3 月','March 2022',true],['2022 年 3 月','May 2022',false],
      ['10 秒，12毫秒','10-second clip, 12 milliseconds',true],['10 秒','10 milliseconds',false],
      ['0.7 到 0.8','0.7-to-0.8',true],['-0.8','0.8',false],
      ['标题 &#39;例子&#39;','Title “example”',true],
      ['值 &#49;','Value 1',true],['值 &#49;','Value 2',false],
      ['五千元','five thousand yuan',true],['五千元','six thousand yuan',false],
      ['一万亿','one trillion',true],['一千六百万','sixteen million',true],
      ['120−100=20 百万美元','120−100=20 million US dollars',true],
      ['100 百万美元','100 million US dollars',true],
      ['100 百万美元','100 US dollars',false],
      ['百分之十，九折','ten percent; ten percent discount',true],
      ['九折','twenty percent discount',false],
      ['百次挑最好','best of a hundred attempts',true],
      ['几百万','several million',true],['几百万','one million',false],
      ['超过六成','more than 60%',true],['超过六成','more than 70%',false],
      ['一成不变','immutable',true],['超过六成半','over 65%',true],
      ['统一成续写','unified into continuation',true],['约八成','about eight out of ten',true],['九成','ninety percent',true],
      ['十二千 token','Twelve-thousand-token',true],['一千六百万','sixteen million',true],
      ['百次挑最好，一百次','best-of-100, a hundred times',true],
      ["范围 0 到 1，以及 0 到 100 万", "Ranges 0 to 1, and 0 to 1,000,000", true],
      ["1.5 万", "15,000", true], ["2 亿", "200,000,000", true],
      ["13 万个 scale，1600 多万个权重，不到 1%", "130,000 scales, over 16 million weights, less than 1%", true],
      ["1600 多万", "over 160 million", false],
      ["1 千个 token，100 万个位置对，100 亿个位置对", "1 thousand tokens, 1 million pairs, 10 billion pairs", true],
      ["百万参数，两百万次，十亿参数，二十亿次", "one million parameters, two million passes, one billion parameters, two billion passes", true],
      ["数百万甚至数十亿个参数", "millions or even billions of parameters", true],
      ["数百万参数", "billions of parameters", false],
      ["数百万参数", "one million parameters", false],
      ["两个 0", "two zeros", true], ["两个 0", "two ones", false],
      ["十万样本", "100000 samples", true], ["十万样本", "100,000 samples", true],
      ["100万样本/单元", "1 million samples per unit", true],
      ["100万样本/单元", "one million samples per unit", true],
      ["十万样本", "10000 samples", false], ["100万样本", "10 million samples", false],
      ["一百二十三万", "1,230,000", true], ["100万", "1 million%", false],
      ["一亿两千万", "120 million", true], ["一百万像素", "one-megapixel", true],
      ["每轴十格，一百万样本", "ten cells per axis, one million samples", true],
      ["十万样本", "one million samples", false],
      ["十亿样本", "a billion samples", true], ["十万", "one hundred thousand", true],
      ["100万 GB", "1 million GB", true], ["100万 GB", "1 million MB", false],
      ["-2 万", "-20,000", true], ["100 万", "100", false],
      ["100 万", "100,000", false], ["100 万", "1,000,000%", false],
      ["范围 0 到 1，以及 100 万", "Range 0 to 2, and 1,000,000", false],
      ["v1.2，100 万", "v1.3, 1,000,000", false],
      ["2026-09-07，100 万", "2026-09-08, 1,000,000", false],
      ["100 分", "100%", false], ["100 万 GB", "1,000,000 MB", false],
    ]) {
      f.material.chapters[1].units[0].source = source;
      f.material.chapters[1].output.translations.u1 = translation;
      const report = mechanical(f.snapshot, f.material, "prepared");
      assert.equal(!report.defects.some(d => d.rule === 5), passes, source + " → " + translation);
    }
  });
  test("nine gates exist; clean text is not semantic approval or browser pass", () => {
    const f = fixture("clean"); const result = f.inspect();
    assert.equal(result.gates.length, 9); assert.equal(result.state, "awaiting-independent-review");
    assert.equal(result.gates[6].status, "pending-semantic-review"); assert.equal(result.gates[8].status, "pending-stage9-browser-test");
    assert.equal(result.publicationAllowed, false);
    assert.deepEqual(result.reviewSchedule.next, { phase: "initial-review", role: "translation-review", reasoningEffort: "medium", scope: "full-page" });
    assert.equal(f.packet().schedule.reasoningEffort, "medium");
  });
  test("numeric defect localized and repair packet excludes private audit history", () => {
    const f = fixture("numeric", true); assert.equal(f.inspect().gates[4].status, "fail");
    const repair = f.packet("repair"); assert.deepEqual(repair.units.map(unit => unit.key), ["section-1/u1"]);
    assert(!Object.hasOwn(repair, "history")); assert(!Object.hasOwn(repair, "checkedUnits"));
    assert.deepEqual(repair.schedule, { phase: "repair", role: "translation-repair", reasoningEffort: "high", scope: "sanitized-defect-units" });
  });
  test("out-of-scope and no-op repair rejected; valid repair reruns checks", () => {
    const f = fixture("repair", true);
    assert.throws(() => f.repair({ "section-1/u2": "Changed" }), /scope/);
    assert.throws(() => f.repair({ "section-1/u1": "It holds for 3." }), /No-op/);
    assert.equal(f.repair({ "section-1/u1": "It holds for 2." }).gates[4].status, "pass");
    assert.equal(f.inspect().state, "awaiting-independent-review");
  });
  test("partial, fabricated and identity-overriding evidence rejected", () => {
    const f = fixture("evidence"); const short = f.evidence(); short.checkedUnits.pop(); assert.throws(() => f.review(short), /coverage/);
    const fake = f.evidence(); fake.checkedUnits[0].translationQuote = "not in translation"; assert.throws(() => f.review(fake), /coverage/);
    assert.throws(() => f.review({ ...f.evidence(), reviewerId: "forged" }), /coverage/);
  });
  test("grounded full-page review does not pass resources/browser or publish", () => {
    const f = fixture("resource", false, true); const result = f.review();
    assert.equal(result.gates[6].status, "pass"); assert.equal(result.gates[7].status, "pass");
    assert.equal(result.gates[5].status, "pending-resource-review"); assert.equal(result.gates[8].status, "pending-stage9-browser-test");
    assert.equal(result.publicationAllowed, false); assert.throws(() => f.review(), /scheduled|One review/);
  });
  test("semantic finding repairs invalidate review and reject stale revision", () => {
    const f = fixture("semantic");
    const finding = { rule: 7, unitKey: "section-1/u1", sourceQuote: "成立", translationQuote: "holds", reason: "Fixture semantic concern requires a more precise English rendering." };
    const reviewed = f.review(f.evidence([finding])); assert.equal(reviewed.gates[6].status, "fail");
    assert.throws(() => f.repair({ "section-1/u1": "It applies for 2." }, "reviewer-one"), /Reviewer cannot repair/);
    const repaired = f.repair({ "section-1/u1": "It applies for 2." }); assert.equal(repaired.gates[6].status, "pending-semantic-review");
    assert.deepEqual(repaired.reviewSchedule.next, { phase: "verification", role: "translation-review", reasoningEffort: "low", scope: "full-page" });
    assert.equal(f.packet().schedule.reasoningEffort, "low");
    assert.throws(() => f.repair({ "section-1/u1": "It holds for 2." }, "repairer-one", reviewed.revision), /changed/);
    assert.throws(() => f.review(f.evidence(), "repairer-one"), /Independent/);
    assert.equal(f.review(f.evidence(), "reviewer-two").gates[6].status, "pass");
  });
  test("repair limit escalates instead of weakening checks", () => {
    const f = fixture("cap", true);
    f.repair({ "section-1/u1": "It holds for 4." }); f.repair({ "section-1/u1": "It holds for 5." });
    assert.equal(f.inspect().state, "manual-review-required"); assert.throws(() => f.repair({ "section-1/u1": "It holds for 2." }), /limit/);
  });
  test("changed source blocks review and repair", () => {
    const reviewFixture = fixture("stale-review"); const evidence = reviewFixture.evidence(); reviewFixture.stale();
    assert.equal(reviewFixture.inspect().state, "stale"); assert.throws(() => reviewFixture.review(evidence), /changed/);
    const repairFixture = fixture("stale-repair", true); repairFixture.stale();
    assert.throws(() => repairFixture.repair({ "section-1/u1": "It holds for 2." }), /changed/);
  });
  test("non-high generation cannot enter the scheduled quality workflow", () => {
    const f = fixture("generation-effort");
    f.material.generation.reasoningEffort = "low";
    assert.throws(() => f.quality.beginTranslationQuality(root, "generation-effort", "plan"), /must be high/);
  });
  test("attribute injection rejected, glossary/CJK issues remain visible", () => {
    const f = fixture("markup"); f.material.chapters[1].output.translations.u2 = '" onclick="alert(1)';
    f.material.chapters[0].output.translations["title:0"] = "机制";
    const result = f.quality.beginTranslationQuality(root, "markup", "plan");
    assert.equal(result.gates[2].status, "fail"); assert(result.warnings.some(item => item.rule === 4)); assert(result.warnings.some(item => item.rule === 7));
  });
  test("quality roles enforce MCP separation, page lock and read-before-submit", () => {
    for (const profile of ["translation-quality", "translation-review", "translation-repair"]) {
      const result = spawnSync(process.execPath, [path.resolve(__dirname, "../../tools/deepdive-stage2/mcp-server.js")], {
        cwd: root, env: { ...process.env, DEEPDIVE_STAGE2_ROOT: root, STAGE2_MCP_PROFILE: profile, STAGE2_MCP_PAGE_ID: "alpha", STAGE2_MCP_WORKER_ID: `${profile}-fixture` }, encoding: "utf8", timeout: 10000,
        input: [
          { id: 1, method: "tools/list", params: {} },
          { id: 2, method: "tools/call", params: { name: "stage2_submit_translation_review", arguments: { pageId: "alpha", reviewId: "x", revision: "x", evidence: {} } } },
          { id: 3, method: "tools/call", params: { name: "stage2_repair_translation_units", arguments: { pageId: "beta" } } },
        ].map(item => JSON.stringify({ jsonrpc: "2.0", ...item })).join("\n") + "\n",
      });
      assert.equal(result.status, 0, result.stderr); const replies = result.stdout.trim().split("\n").map(JSON.parse);
      assert.equal(replies[0].result.tools.length, 2); assert.equal(replies[1].result.isError, true); assert.equal(replies[2].result.isError, true);
      const packetTool = replies[0].result.tools.find(tool => tool.name === "stage2_read_translation_quality_packet");
      if (profile === "translation-quality") assert.equal(packetTool, undefined);
      else {
        assert(packetTool.inputSchema.required.includes("reasoningEffort"));
        assert.deepEqual(packetTool.inputSchema.properties.reasoningEffort.enum, ["low", "medium", "high"]);
      }
    }
  });
  test("no production or Chinese state generated by quality workflow", () => {
    assert.deepEqual(fs.readdirSync(root), ["quality"]);
  });
  console.log(`${count} translation quality tests passed; synthetic evidence only, no live audit/API/publication.`);
} finally {
  assert.equal(path.dirname(root), path.resolve(os.tmpdir())); assert(path.basename(root).startsWith("translation-quality-"));
  fs.rmSync(root, { recursive: true, force: true });
}
