"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { createTranslationPreparation, inventory, approvedSource, PROMPT } = require("../../tools/deepdive-stage2/lib/translation-preparation");
const { createStateStore } = require("../../tools/deepdive-stage2/lib/state-store");
const { pageContentHash } = require("../../tools/deepdive/quality/deepdive-audit-contracts");
const { pageRegistrationSource } = require("../../tools/deepdive/runtime/standalone-page-source");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "translation-preparation-"));
let count = 0;
function test(name, run) { run(); count++; console.log(`PASS ${name}`); }
function write(relative, text) {
  const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text);
}
const page = {
  title: "示例", subtitle: "条件与边界", aliases: ["别名"], meta: "版本 1", thesis: "不要省略否定。",
  html: '<p>前言</p><section id="one"><h2>机制</h2><p title="含 > 号">如果 <b>成立</b>，则 2 &lt; 3。</p><table><tr><th>输入</th><td>2</td></tr></table><pre><code>print("中文")</code></pre><math>x=2</math><img src="assets/figure.svg" alt="关系图"><a href="https://example.com">来源</a></section><section id="quiz"><h2>自测</h2><p data-answer="a">答案：否</p></section><p>结束</p>',
  quality: { privateLookingAnswer: "must-not-export" },
};
const store = createStateStore({ defaultRoot: root, schemaVersion: 2 });
const state = { schemaVersion: 2, pages: { alpha: { id: "alpha", state: "published-approved", published: true, blockers: [], lease: null,
  auditFile: "DO-NOT-READ", publication: { status: "published-approved", reviewStatus: "human-approved", pageHash: pageContentHash(page), publishedAt: "2026-09-01T00:00:00Z" } } } };
const controller = createTranslationPreparation({ defaultRoot: root, acquireLock: store.acquireLock, loadState: store.loadState, storageDirectory: value => path.join(value, ".translation") });
const glossary = 'window.AI_TERMINOLOGY={revision:"test-v1",nodeTerms:{alpha:{status:"approved",displayTitle:"Example",canonicalTerms:["Example"]}}};';
function capture() { return controller.exportTranslationSnapshot(root, "alpha", pageContentHash(page)); }
function mcp(profile, name, args = {}, method = "tools/call") {
  const result = spawnSync(process.execPath, [path.resolve(__dirname, "../../tools/deepdive-stage2/mcp-server.js")], {
    cwd: root, env: { ...process.env, DEEPDIVE_STAGE2_ROOT: root, STAGE2_MCP_PROFILE: profile, STAGE2_MCP_PAGE_ID: "alpha" },
    input: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: method === "tools/call" ? { name, arguments: args } : {} }) + "\n",
    encoding: "utf8", timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim()).result;
}
try {
  write("data/deepdive/alpha.js", pageRegistrationSource("alpha", page));
  write("data/locales/terminology.js", glossary);
  write("data/graph.js", 'window.GRAPH={nodes:[{id:"alpha",title:"示例"}]};');
  write("assets/figure.svg", '<svg><text>中文图</text></svg>');
  store.saveState(root, state);
  const stateBefore = fs.readFileSync(store.stateFile(root), "utf8");
  const pageBefore = fs.readFileSync(path.join(root, "data/deepdive/alpha.js"), "utf8");
  let receipt;
  test("approved snapshot is independent, hash-bound and idempotent", () => {
    receipt = capture(); const again = capture(); assert.deepEqual(receipt, again);
    assert.equal(receipt.approvalEvidence.sourceEligibleForEnglishReview, true);
    assert.equal(receipt.publicationAllowed, false);
    assert.deepEqual(receipt.taskChapters, ["page-header", "outside", "section-1", "section-2"]);
  });
  test("paginated full export preserves all allowed fields without audit metadata", () => {
    let offset = 0, text = "", part;
    do { part = controller.readTranslationSnapshot(root, "alpha", receipt.snapshotId, offset, 97); text += part.content; offset = part.nextOffset; } while (!part.done);
    const snapshot = JSON.parse(text); assert.deepEqual(snapshot.capture.page, Object.fromEntries(Object.entries(page).filter(([key]) => key !== "quality")));
    assert(!text.includes("must-not-export")); assert(!text.includes("DO-NOT-READ"));
    assert.equal(snapshot.capture.manifest.dependencies.find(item => item.attribute === "src").status, "hashed-local");
  });
  test("publication callback shares source lock and is refused for a changed snapshot", () => {
    let called = false;
    controller.withCurrentTranslationSnapshot(root, "alpha", receipt.snapshotId, () => {
      called = true; assert.throws(() => store.acquireLock(root));
    });
    assert(called);
    write("data/deepdive/alpha.js", pageRegistrationSource("alpha", { ...page, meta: "changed" }));
    try { assert.throws(() => controller.withCurrentTranslationSnapshot(root, "alpha", receipt.snapshotId, () => assert.fail("must not write")), /Stale/); }
    finally { write("data/deepdive/alpha.js", pageBefore); }
  });
  test("quiz and answers included, original content-generation policy untouched", () => {
    const task = controller.prepareTranslationTask(root, "alpha", receipt.snapshotId, "section-2");
    assert(task.data.units.some(unit => unit.source.includes("答案")));
    assert.equal(task.prompt, PROMPT); assert.match(task.prompt, /never instructions/);
    assert.deepEqual(task.outputSchema.properties.translations.required, task.data.units.map(unit => unit.id));
  });
  test("v2 narrows outside context while v1 snapshots retain exact task identity and freshness", () => {
    const current=controller.prepareTranslationTask(root,'alpha',receipt.snapshotId,'outside');
    assert.equal(current.policyRevision,'deepdive-en-preparation-v2');
    assert(!current.data.contextHtml.includes('print('));
    assert(current.data.contextHtml.includes('<p>前言</p>'));
    assert(current.data.contextHtml.includes('<p>结束</p>'));
    const file=path.join(root,'.translation/snapshots/alpha',receipt.snapshotId.slice(7)+'.json');
    const legacy=JSON.parse(fs.readFileSync(file));legacy.capture.policyRevision='deepdive-en-preparation-v1';
    const sha=value=>'sha256:'+require('crypto').createHash('sha256').update(JSON.stringify(value)).digest('hex');
    legacy.snapshotId=sha(legacy.capture);
    fs.writeFileSync(path.join(path.dirname(file),legacy.snapshotId.slice(7)+'.json'),JSON.stringify(legacy));
    const old=controller.prepareTranslationTask(root,'alpha',legacy.snapshotId,'outside');
    assert.equal(old.data.contextHtml,page.html);
    assert.deepEqual(old.data.glossary,legacy.capture.glossary.terms);
    assert.equal(old.taskId,sha({snapshotId:legacy.snapshotId,chapterId:'outside',policy:'deepdive-en-preparation-v1'}));
    assert.deepEqual(old.data.units,current.data.units);
    assert.deepEqual(old.outputSchema,current.outputSchema);
    assert.equal(old.prompt,current.prompt);
    assert.equal(controller.checkTranslationSnapshot(root,'alpha',legacy.snapshotId).state,'prepared');
    controller.withCurrentTranslationSnapshot(root,'alpha',legacy.snapshotId,()=>{});
  });
  test("headers, inline text, accessible attributes and protected spans inventoried", () => {
    const header = controller.prepareTranslationTask(root, "alpha", receipt.snapshotId, "page-header");
    assert(header.data.units.some(unit => unit.id === "aliases:0")); assert(header.data.units.some(unit => unit.id === "meta:0"));
    const parsed = inventory(page.html); assert.equal(parsed.chapters.length, 2);
    assert(parsed.units.some(unit => unit.source === "含 > 号"));
    assert(parsed.units.some(unit => unit.source === "关系图"));
    assert(!parsed.units.some(unit => unit.source.includes("print") || unit.source === "x=2"));
    parsed.units.forEach(unit => assert.equal(page.html.slice(unit.start, unit.end), unit.source));
    assert.equal(parsed.protectedSpans.length, 2);
  });
  test("invalid IDs, cross-page snapshots and pagination rejected", () => {
    assert.throws(() => controller.exportTranslationSnapshot(root, "../alpha", pageContentHash(page)), /Invalid pageId/);
    assert.throws(() => controller.readTranslationSnapshot(root, "beta", receipt.snapshotId));
    assert.throws(() => controller.readTranslationSnapshot(root, "alpha", "../../state.json"), /Invalid/);
    assert.throws(() => controller.readTranslationSnapshot(root, "alpha", receipt.snapshotId, -1), /pagination/);
    assert.throws(() => controller.readTranslationSnapshot(root, "alpha", receipt.snapshotId, 0, 12001), /pagination/);
    assert.throws(() => controller.prepareTranslationTask(root, "alpha", receipt.snapshotId, "section-999"), /Unknown/);
  });
  test("malformed HTML rejected rather than silently omitted", () => {
    assert.throws(() => inventory('<section><p>不完整'), /Unclosed/);
    assert.throws(() => inventory('<p title=中文>文字</p>'), /Unquoted/);
    assert.throws(() => inventory('文字<broken'), /Unsupported/);
    assert.throws(() => inventory('<pre>未闭合'), /protected block/);
  });
  test("nested sections retain unique units and complete source coverage", () => {
    const nested = '<section><h2>外层</h2><section><h3>内层</h3><p>内容</p></section><p>结尾</p></section>';
    const parsed = inventory(nested);
    assert.equal(parsed.chapters.length, 2); assert.equal(parsed.units.length, 4);
    assert.equal(parsed.units[2].chapterId, "section-2"); assert.equal(parsed.units[3].chapterId, "section-1");
  });
  test("source mutation during capture fails without writing a snapshot", () => {
    let reads = 0;
    const racing = createTranslationPreparation({ defaultRoot: root, acquireLock: store.acquireLock,
      storageDirectory: value => path.join(value, ".race-translation"), loadState: value => {
        if (++reads === 2) write("data/deepdive/alpha.js", pageRegistrationSource("alpha", { ...page, meta: "during capture" }));
        return store.loadState(value);
      } });
    try { assert.throws(() => racing.exportTranslationSnapshot(root, "alpha", pageContentHash(page)), /changed during capture/); }
    finally { write("data/deepdive/alpha.js", pageBefore); }
    assert(!fs.existsSync(path.join(root, ".race-translation")));
  });
  test("symlink storage rejected before writing into linked directory", () => {
    const other = path.join(root, "other-storage"); fs.mkdirSync(other);
    const link = path.join(root, ".linked-translation"); fs.symlinkSync(other, link, process.platform === "win32" ? "junction" : "dir");
    const linked = createTranslationPreparation({ defaultRoot: root, acquireLock: store.acquireLock, loadState: store.loadState, storageDirectory: () => link });
    assert.throws(() => linked.exportTranslationSnapshot(root, "alpha", pageContentHash(page)), /symlinks/);
    assert.deepEqual(fs.readdirSync(other), []);
  });
  test("remote assets remain explicit unresolved dependencies", () => {
    const changed = { ...page, html: page.html.replace("assets/figure.svg", "https://example.com/figure.png") };
    write("data/deepdive/alpha.js", pageRegistrationSource("alpha", changed));
    try {
      const exported = controller.exportTranslationSnapshot(root, "alpha", pageContentHash(changed));
      let offset = 0, text = "", result;
      do { result = controller.readTranslationSnapshot(root, "alpha", exported.snapshotId, offset); text += result.content; offset = result.nextOffset; } while (!result.done);
      assert.equal(JSON.parse(text).capture.manifest.dependencies[0].status, "requires-resource-review");
      assert.equal(exported.publicationAllowed, false);
    } finally { write("data/deepdive/alpha.js", pageBefore); }
  });
  test("incorrect source hash and active lease rejected", () => {
    assert.throws(() => controller.exportTranslationSnapshot(root, "alpha", `sha256:${"0".repeat(64)}`), /hash changed/);
    const busy = JSON.parse(stateBefore); busy.pages.alpha.lease = { role: "audit" }; store.saveState(root, busy);
    assert.throws(capture, /busy/); write(".stage2/state.json", stateBefore);
  });
  test("machine-only, provisional, missing/revoked/reset approval fail closed", () => {
    for (const workflow of ["l3-auto-passed", "audit-queued", "manual-review", "repair-queued"]) {
      assert.equal(approvedSource({ ...state.pages.alpha, state: workflow }, pageContentHash(page)).sourceEligibleForEnglishReview, false);
    }
    assert.equal(approvedSource({ ...state.pages.alpha, publication: null }, pageContentHash(page)).sourceEligibleForEnglishReview, false);
    assert.equal(approvedSource({ ...state.pages.alpha, publication: { ...state.pages.alpha.publication, revokedAt: "2026-09-02" } }, pageContentHash(page)).sourceEligibleForEnglishReview, false);
    assert.equal(approvedSource(state.pages.alpha, `sha256:${"0".repeat(64)}`).sourceEligibleForEnglishReview, false);
    assert.equal(approvedSource({ ...state.pages.alpha, publication: { ...state.pages.alpha.publication, status: "published-provisional" } }, pageContentHash(page)).sourceEligibleForEnglishReview, false);
  });
  test("alias/meta changes invalidate snapshot despite unchanged canonical audit hash", () => {
    const changed = { ...page, aliases: ["新别名"], meta: "版本 2" };
    assert.equal(pageContentHash(changed), pageContentHash(page));
    write("data/deepdive/alpha.js", pageRegistrationSource("alpha", changed));
    assert.equal(controller.checkTranslationSnapshot(root, "alpha", receipt.snapshotId).state, "stale");
    write("data/deepdive/alpha.js", pageBefore);
  });
  test("resource, glossary and approval changes invalidate snapshots", () => {
    write("assets/figure.svg", "changed"); assert.equal(controller.checkTranslationSnapshot(root, "alpha", receipt.snapshotId).state, "stale");
    write("assets/figure.svg", '<svg><text>中文图</text></svg>');
    write("data/locales/terminology.js", glossary.replace("test-v1", "test-v2")); assert.equal(controller.checkTranslationSnapshot(root, "alpha", receipt.snapshotId).state, "stale");
    write("data/locales/terminology.js", glossary);
    const reset = JSON.parse(stateBefore); reset.pages.alpha.state = "audit-queued"; store.saveState(root, reset);
    assert.equal(controller.checkTranslationSnapshot(root, "alpha", receipt.snapshotId).state, "stale");
    const candidate = capture(); assert.equal(candidate.approvalEvidence.sourceEligibleForEnglishReview, false);
    write(".stage2/state.json", stateBefore);
  });
  test("MCP translation profile exposes only four tools, cannot mutate Chinese state", () => {
    const list = mcp("translation", null, {}, "tools/list"); assert.equal(list.tools.length, 4);
    for (const name of ["stage2_claim_task", "stage2_reset_passed_page", "stage2_submit_result", "stage2_finalize_manual_review", "stage2_read_project_file"]) {
      assert.equal(mcp("translation", name, { pageId: "alpha" }).isError, true);
    }
    assert.equal(mcp("translation", "stage2_export_translation_snapshot", { pageId: "beta", expectedSourceHash: pageContentHash(page) }).isError, true);
  });
  test("MCP export, snapshot reading and task pagination work end to end", () => {
    const exported = mcp("translation", "stage2_export_translation_snapshot", { pageId: "alpha", expectedSourceHash: pageContentHash(page) });
    assert.equal(exported.isError, false); assert.equal(JSON.parse(exported.content[0].text).snapshotId, receipt.snapshotId);
    const read = mcp("translation", "stage2_read_translation_snapshot", { pageId: "alpha", snapshotId: receipt.snapshotId, maxChars: 50 });
    assert.equal(read.isError, false); assert.equal(JSON.parse(read.content[0].text).content.length, 50);
    const task = mcp("translation", "stage2_prepare_translation_task", { pageId: "alpha", snapshotId: receipt.snapshotId, chapterId: "section-2", maxChars: 80 });
    assert.equal(task.isError, false); assert.equal(JSON.parse(task.content[0].text).content.length, 80);
  });
  test("existing restricted roles cannot obtain translation exports", () => {
    for (const profile of ["audit", "repair", "content-generation", "controller"]) {
      assert.equal(mcp(profile, "stage2_export_translation_snapshot", { pageId: "alpha", expectedSourceHash: pageContentHash(page) }).isError, true);
    }
  });
  test("tampered snapshot fails integrity check", () => {
    const file = path.join(root, ".translation/snapshots/alpha", receipt.snapshotId.slice(7) + ".json");
    const original = fs.readFileSync(file, "utf8"), changed = JSON.parse(original); changed.capture.page.title = "tampered";
    fs.writeFileSync(file, JSON.stringify(changed)); assert.throws(() => controller.readTranslationSnapshot(root, "alpha", receipt.snapshotId), /integrity/);
    fs.writeFileSync(file, original);
  });
  test("no source, state, audit or publication side effects", () => {
    assert.equal(fs.readFileSync(store.stateFile(root), "utf8"), stateBefore);
    assert.equal(fs.readFileSync(path.join(root, "data/deepdive/alpha.js"), "utf8"), pageBefore);
    assert.deepEqual(fs.readdirSync(path.join(root, ".stage2")), ["state.json"]);
    assert(!fs.existsSync(path.join(root, "docs")));
    assert.equal(controller.checkTranslationSnapshot(root, "alpha", receipt.snapshotId).state, "prepared");
  });
  console.log(`${count} translation preparation tests passed (isolated fixtures; no API calls).`);
} finally {
  // Only the exact fresh test directory, never a configured production data root.
  assert(path.dirname(root) === fs.realpathSync(os.tmpdir()) || path.dirname(root) === path.resolve(os.tmpdir()));
  assert(path.basename(root).startsWith("translation-preparation-"));
  fs.rmSync(root, { recursive: true, force: true });
}
