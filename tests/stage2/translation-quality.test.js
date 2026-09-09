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
  test("Chinese magnitude equivalence preserves values without weakening numeric guards", () => {
    const f = fixture("magnitude-equivalence");
    const { mechanical } = require("../../tools/deepdive-stage2/lib/translation-quality");
    for (const [source, translation, passes] of [
      ["范围 0 到 1，以及 0 到 100 万", "Ranges 0 to 1, and 0 to 1,000,000", true],
      ["1.5 万", "15,000", true], ["2 亿", "200,000,000", true],
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
