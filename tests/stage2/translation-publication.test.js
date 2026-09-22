"use strict";
const assert = require("assert/strict");
const fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");
const { createTranslationPublication, assemble, BROWSER_CHECKS } = require("../../tools/deepdive-stage2/lib/translation-publication");
const { fixture } = require("./translation-publication-fixture");
const { createTranslationQuality } = require("../../tools/deepdive-stage2/lib/translation-quality");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "translation-publication-"));
let count = 0;
function test(name, action) { action(); count++; console.log(`PASS ${name}`); }
function setup(replacementAuthorization) {
  const value = fixture(); let authorization = "", stale = false;
  const controller = createTranslationPublication({ authorization: () => authorization, replacementAuthorization,
    withTranslationQualityMaterial: (_root, _id, _review, action) => action(value),
    withCurrentTranslationSnapshot: (_root, _id, _snapshot, action) => { if (stale) throw new Error("Stale source"); return action(); } });
  const preview = () => controller.previewTranslation(root, "sample", "fixture-review");
  const approval = () => { const p = preview(); return { artifactHash: p.candidate.artifactHash, approved: true, reviewer: "human-fixture",
    browserChecks: BROWSER_CHECKS.map(name => ({ name, passed: true, notes: "Synthetic acceptance for an isolated test only." })),
    resources: p.resourceKeys.map(key => ({ key, passed: true, notes: "Synthetic resource attestation; not a real audit." })),
    resourceSummary: "Synthetic fixture formulas, images and dependencies checked for testing the gate contract only." }; };
  return { value, preview, approval, authorize() { authorization = preview().candidate.artifactHash; }, stale() { stale = true; },
    publish(acceptance = approval()) { return controller.publishTranslation(root, "sample", "fixture-review", acceptance.artifactHash, acceptance); } };
}
try {
  test("layout-only draft preview cannot bypass publication assembly", () => {
    const value=fixture(); value.report.defects=[{rule:4,reason:'Unresolved translation defect'}];
    const preview=require('../../tools/deepdive-stage2/lib/translation-publication').layoutPreview(value);
    assert.equal(preview.publicationAllowed,false);
    assert.throws(()=>assemble(value),/defective/);
    value.report.state='stale';
    assert.throws(()=>require('../../tools/deepdive-stage2/lib/translation-publication').layoutPreview(value),/Stale/);
  });
  test("assembly preserves structure, code, links, SVG and self-test; translates header/attributes", () => {
    const result = assemble(fixture()); assert(result.payload.page.html.includes('<code>const value = 2;</code>'));
    assert(result.payload.page.html.includes('href="#check" title="Go to self-test"')); assert(result.payload.page.html.includes("Input → Output"));
    assert(result.payload.page.html.includes("Answer: no")); assert.equal(result.payload.page.title, "Example mechanism");
  });
  test("optional headers need not exist", () => {
    const value = fixture(); delete value.snapshot.capture.page.subtitle; assert.equal(assemble(value).payload.page.subtitle, undefined);
  });
  test("trusted source formatting is removed from the plain English thesis", () => {
    const value = fixture();
    value.snapshot.capture.page.thesis = "输入决定<b>最终输出</b>。";
    const thesis = value.material.chapters[0].units.find(unit => unit.id === "thesis:0");
    thesis.source = value.snapshot.capture.page.thesis;
    value.material.chapters[0].output.translations["thesis:0"] = "The input determines the <b>final output</b>.";
    assert.equal(assemble(value).payload.page.thesis, "The input determines the final output.");
    value.material.chapters[0].output.translations["thesis:0"] = "The input determines the <em>final output</em>.";
    assert.throws(() => assemble(value), /Thesis source markup mismatch/);
  });
  test("source offsets and markup injection are rejected", () => {
    const value = fixture(); value.material.chapters[1].units[0].start++; assert.throws(() => assemble(value), /source/);
    const other = fixture(); other.material.chapters[1].output.translations[other.material.chapters[1].units[0].id] = "<script>"; assert.throws(() => assemble(other), /Unsafe/);
  });
  test("preview does not publish", () => { const f = setup(); assert.equal(f.preview().publicationAllowed, false); assert.deepEqual(fs.readdirSync(root), []); });
  test("publication is disabled without exact launch authorization", () => { assert.throws(() => setup().publish(), /authorization/); });
  test("semantic/source approval cannot be bypassed by human browser form", () => {
    const f = setup(); f.authorize(); f.value.report.gates[0].status = "pending-human-source-approval"; assert.throws(() => f.publish(), /gates/);
  });
  test("browser and resource evidence must be complete", () => {
    const f = setup(); f.authorize(); const a = f.approval(); a.browserChecks.pop(); assert.throws(() => f.publish(a), /browser/);
    const b = f.approval(); b.resources.pop(); assert.throws(() => f.publish(b), /resource/);
  });
  test("source checked again under publication lock", () => { const f = setup(); f.authorize(); const a = f.approval(); f.stale(); assert.throws(() => f.publish(a), /Stale/); });
  test("changed translation invalidates approved artifact", () => {
    const f = setup(); f.authorize(); const a = f.approval(); f.value.material.chapters[0].output.translations["title:0"] = "A different title";
    assert.throws(() => f.publish(a), /changed/);
  });
  test("authorized fixture publication is idempotent and separate from Chinese state", () => {
    const f = setup(); f.authorize(); assert.equal(f.publish().state, "published-English"); assert.equal(f.publish().state, "already-published");
    assert(!fs.existsSync(path.join(root, ".stage2"))); assert(!fs.existsSync(path.join(root, "data/deepdive")));
    const envelope = JSON.parse(fs.readFileSync(path.join(root, "data/content-locales/en/deepdive/sample.json"))); assert.equal(envelope.status, "human-approved");
    assert(!Object.hasOwn(envelope, "acceptance")); assert(!JSON.stringify(envelope).includes("human-fixture"));
    assert(fs.existsSync(path.join(root, ".translation/publication-acceptance/sample")));
  });
  test("existing different English release is never silently overwritten", () => {
    const f = setup(); f.value.material.chapters[0].output.translations["title:0"] = "New title"; f.authorize(); assert.throws(() => f.publish(), /replacement/);
  });
  test("source refresh requires exact replacement binding, preserves old release, and retains gates", () => {
    const file = path.join(root, 'data/content-locales/en/deepdive/sample.json');
    const old = JSON.parse(fs.readFileSync(file, 'utf8'));
    let grant = { before: 'sha256:' + '0'.repeat(64), snapshotId: 'sha256:' + '1'.repeat(64) };
    const f = setup(() => ({ sample: grant }));
    f.value.material.snapshotId = grant.snapshotId;
    f.value.snapshot.capture.sourceContentHash = 'sha256:' + '2'.repeat(64);
    f.value.material.chapters[0].output.translations['title:0'] = 'Updated source translation';
    f.authorize();
    assert.throws(() => f.publish(), /replacement authorization/);
    grant.before = old.artifactHash; grant.snapshotId = 'sha256:' + '3'.repeat(64);
    assert.throws(() => f.publish(), /replacement authorization/);
    grant.snapshotId = f.value.material.snapshotId;
    f.value.report.gates[0].status = 'blocked';
    assert.throws(() => f.publish(), /gates/);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), old);
    f.value.report.gates[0].status = 'pass';
    assert.equal(f.publish().state, 'published-English');
    assert.equal(f.publish().state, 'already-published');
    const archive = path.join(root, '.translation/publication-history/sample', old.artifactHash.slice(7) + '.json');
    assert.deepEqual(JSON.parse(fs.readFileSync(archive, 'utf8')), old);
    assert.notEqual(JSON.parse(fs.readFileSync(file, 'utf8')).artifactHash, old.artifactHash);
  });
  test("real quality controller feeds publication and holds its revision lock", () => {
    const value = fixture(); value.snapshot.capture.glossary = { terms: {} }; value.snapshot.capture.approvalEvidence = { sourceEligibleForEnglishReview: true };
    const quality = createTranslationQuality({ storageDirectory: () => path.join(root, "isolated-quality"),
      translationReviewMaterial: () => ({ ...value.material, generation: { model: "fixture-model", reasoningEffort: "high" } }), checkTranslationSnapshot: () => ({ state: "prepared" }),
      readTranslationSnapshot: (_root, _id, _snapshot, offset, length) => {
        const text = JSON.stringify(value.snapshot), content = text.slice(offset, offset + length), nextOffset = offset + content.length;
        return { content, nextOffset, done: nextOffset === text.length };
      } });
    const initial = quality.beginTranslationQuality(root, "sample", "fixture-plan");
    const publisher = createTranslationPublication({ withTranslationQualityMaterial: quality.withTranslationQualityMaterial, withCurrentTranslationSnapshot: (_r, _p, _s, action) => action() });
    assert.equal(publisher.previewTranslation(root, "sample", initial.reviewId).gates[6].status, "pending-semantic-review");
    const packet = quality.translationQualityPacket(root, "sample", initial.reviewId, "review");
    quality.submitTranslationReview(root, "sample", initial.reviewId, initial.revision, {
      checkedUnits: packet.units.map(unit => ({ unitKey: unit.key, sourceQuote: unit.source, translationQuote: unit.translation, rationale: "Synthetic coverage evidence for the integration test only." })),
      wholePageRationale: "Synthetic whole-page evidence to exercise integration; this is not a real linguistic judgment.", findings: [],
    }, "fixture-reviewer");
    assert.equal(publisher.previewTranslation(root, "sample", initial.reviewId).gates[6].status, "pass");
    quality.withTranslationQualityMaterial(root, "sample", initial.reviewId, () => {
      assert.throws(() => quality.withTranslationQualityMaterial(root, "sample", initial.reviewId, () => {}), /EEXIST/);
    });
  });
  test("publisher MCP is page-locked; full coordinator cannot publish", () => {
    for (const profile of ["translation-publication", "full"]) {
      const result = spawnSync(process.execPath, [path.resolve(__dirname, "../../tools/deepdive-stage2/mcp-server.js")], { cwd: root,
        env: { ...process.env, DEEPDIVE_STAGE2_ROOT: root, STAGE2_MCP_PROFILE: profile, STAGE2_MCP_PAGE_ID: "sample", STAGE2_TRANSLATION_PUBLISH_HASH: "" },
        encoding: "utf8", timeout: 10000, input: [
          { id: 1, method: "tools/list", params: {} },
          { id: 2, method: "tools/call", params: { name: "stage2_publish_translation", arguments: { pageId: "other" } } },
        ].map(item => JSON.stringify({ jsonrpc: "2.0", ...item })).join("\n") + "\n" });
      assert.equal(result.status, 0, result.stderr); const replies = result.stdout.trim().split("\n").map(JSON.parse);
      assert.equal(replies[0].result.tools.some(tool => tool.name === "stage2_publish_translation"), profile !== "full"); assert.equal(replies[1].result.isError, true);
    }
  });
  console.log(`${count} publication tests passed; synthetic acceptance only.`);
} finally {
  assert.equal(path.dirname(root), path.resolve(os.tmpdir())); assert(path.basename(root).startsWith("translation-publication-"));
  fs.rmSync(root, { recursive: true, force: true });
}
