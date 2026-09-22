"use strict";

// All direct reads/writes below are synthetic fixtures, never production Stage 2.
const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { createTranslationPreparation } = require("../../tools/deepdive-stage2/lib/translation-preparation");
const { createStateStore } = require("../../tools/deepdive-stage2/lib/state-store");
const { pageContentHash } = require("../../tools/deepdive/quality/deepdive-audit-contracts");
const { pageRegistrationSource } = require("../../tools/deepdive/runtime/standalone-page-source");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "source-human-confirmation-"));
const digest = value => `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
function write(relative, text) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
const page = { title: "示例", subtitle: "边界", aliases: ["别名"], meta: "版本", thesis: "条件", html: '<section><h2>概念</h2><p>正文</p><img src="assets/figure.svg"></section>' };
const state = { schemaVersion: 2, pages: { alpha: { id: "alpha", state: "audit-queued", published: true, blockers: [], lease: null } } };
const store = createStateStore({ defaultRoot: root, schemaVersion: 2 });
const controller = createTranslationPreparation({ defaultRoot: root, acquireLock: store.acquireLock, loadState: store.loadState, storageDirectory: value => path.join(value, ".translation") });
const options = { expectedSourceHash: pageContentHash(page), expectedContentHash: digest(page), humanConfirmed: true, statement: "维护者在当前任务中明确确认此版本；没有历史机器记录。" };
const capture = () => controller.exportTranslationSnapshot(root, "alpha", options.expectedSourceHash);
const register = (overrides = {}) => controller.registerSourceHumanConfirmation(root, "alpha", { ...options, ...overrides });
function mcp(profile, args, authorization = options.expectedContentHash, method = "tools/call") {
  const result = spawnSync(process.execPath, [path.resolve(__dirname, "../../tools/deepdive-stage2/mcp-server.js")], {
    cwd: root, env: { ...process.env, DEEPDIVE_STAGE2_ROOT: root, STAGE2_MCP_PROFILE: profile, STAGE2_MCP_PAGE_ID: "alpha", STAGE2_HUMAN_CONFIRMATION_HASH: authorization, STAGE2_MCP_MANUAL_REVIEW_ACTION: "hold" },
    input: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: method === "tools/call" ? { name: "stage2_register_source_human_confirmation", arguments: { pageId: "alpha", ...options, ...args } } : {} }) + "\n",
    encoding: "utf8", timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim()).result;
}
let count = 0;
function test(name, fn) { fn(); count++; console.log(`PASS ${name}`); }
try {
  write("data/deepdive/alpha.js", pageRegistrationSource("alpha", page));
  write("data/locales/terminology.js", 'window.AI_TERMINOLOGY={revision:"test",nodeTerms:{alpha:{status:"approved",displayTitle:"Example"}}};');
  write("data/graph.js", 'window.GRAPH={nodes:[{id:"alpha",title:"示例"}]};');
  write("assets/figure.svg", "<svg></svg>");
  store.saveState(root, state);
  const originalState = fs.readFileSync(store.stateFile(root), "utf8"), originalPage = fs.readFileSync(path.join(root, "data/deepdive/alpha.js"), "utf8");
  const before = capture();
  test("requires explicit confirmation and both matching hashes", () => {
    assert.equal(before.approvalEvidence.sourceEligibleForEnglishReview, false);
    assert.throws(() => register({ humanConfirmed: false }), /Explicit/);
    assert.throws(() => register({ statement: " " }), /statement/);
    assert.throws(() => register({ expectedSourceHash: `sha256:${"0".repeat(64)}` }), /mismatch/);
    assert.throws(() => register({ expectedContentHash: `sha256:${"0".repeat(64)}` }), /mismatch/);
    assert(!fs.existsSync(path.join(root, ".translation/human-confirmations")));
  });
  test("dedicated page-locked MCP capability requires exact launch authorization", () => {
    for (const profile of ["full", "translation", "controller", "audit", "repair", "content-generation", "translation-review", "translation-quality"]) {
      // Review profile requires an independent worker ID; use only listing elsewhere.
      if (profile === "translation-review") continue;
      assert.equal(mcp(profile).isError, true, profile);
    }
    assert.deepEqual(mcp("human-confirmation", {}, "", "tools/list").tools.map(item => item.name), ["stage2_register_source_human_confirmation"]);
    assert.equal(mcp("human-confirmation", {}, "").isError, true);
    assert.equal(mcp("human-confirmation", { pageId: "beta" }).isError, true);
    assert.equal(mcp("human-confirmation", { pageId: undefined }).isError, true);
    assert.equal(mcp("human-confirmation", { expectedContentHash: `sha256:${"0".repeat(64)}` }).isError, true);
    assert(!fs.existsSync(path.join(root, ".translation/human-confirmations")));
  });
  let receipt;
  test("real MCP registers present-time human evidence independently and idempotently", () => {
    const result = mcp("human-confirmation"); assert.notEqual(result.isError, true, JSON.stringify(result));
    receipt = register(); assert.deepEqual(register(), receipt);
    assert.equal(receipt.kind, "current-maintainer-confirmed");
    assert.equal(receipt.workflowState, "audit-queued");
    assert.equal(receipt.historicalApprovalVerified, false);
    assert.equal(receipt.machineAuditStatus, "not-asserted");
    assert.equal(receipt.publicationAllowed, false);
    assert(Date.now() - Date.parse(receipt.confirmedAt) < 60000);
    assert.equal(fs.readdirSync(path.join(root, ".translation/human-confirmations/alpha")).length, 1);
    assert.equal(fs.readFileSync(store.stateFile(root), "utf8"), originalState);
    assert.equal(fs.readFileSync(path.join(root, "data/deepdive/alpha.js"), "utf8"), originalPage);
    assert.deepEqual(fs.readdirSync(path.join(root, ".stage2")), ["state.json"]);
  });
  test("old snapshot is stale; refreshed snapshot has current confirmation without machine pass", () => {
    assert.equal(controller.checkTranslationSnapshot(root, "alpha", before.snapshotId).state, "stale");
    const current = capture();
    assert.equal(current.approvalEvidence.kind, "current-maintainer-confirmed");
    assert.equal(current.approvalEvidence.sourceEligibleForEnglishReview, true);
    assert.equal(current.approvalEvidence.recordDigest, receipt.receiptId);
    assert.equal(current.publicationAllowed, false);
    assert.equal(controller.checkTranslationSnapshot(root, "alpha", current.snapshotId).state, "prepared");
  });
  test("metadata and dependent resource changes cannot reuse confirmation", () => {
    write("data/deepdive/alpha.js", pageRegistrationSource("alpha", { ...page, aliases: ["新别名"] }));
    assert.equal(capture().approvalEvidence.sourceEligibleForEnglishReview, false);
    assert.throws(() => register(), /mismatch/);
    write("data/deepdive/alpha.js", originalPage);
    write("assets/figure.svg", "<svg>changed</svg>");
    assert.equal(capture().approvalEvidence.sourceEligibleForEnglishReview, false);
    write("assets/figure.svg", "<svg></svg>");
  });
  test("workflow changes, blockers, revocation and leases invalidate or block use", () => {
    for (const change of [{ state: "repair-queued" }, { state: "manual-review", blockers: ['defect'] }, { publication: { status: "published-editorial-draft" } }, { blockers: ["defect"] }, { publication: { revoked: true } }, { finalReview: { humanApproved: false } }]) {
      store.saveState(root, { ...state, pages: { alpha: { ...state.pages.alpha, ...change } } });
      assert.equal(capture().approvalEvidence.sourceEligibleForEnglishReview, false);
      assert.throws(() => register(), /blockers|revoked|ineligible/);
    }
    store.saveState(root, { ...state, pages: { alpha: state.pages.alpha, beta: { lease: { id: "busy" } } } });
    assert.throws(() => register(), /busy/);
    write(".stage2/state.json", originalState);
  });
  test("provisional source requires fresh exact confirmation and preserves Chinese status", () => {
    const provisional={...state,pages:{alpha:{...state.pages.alpha,publication:{status:'published-provisional'}}}};
    store.saveState(root,provisional);
    const unchanged=fs.readFileSync(store.stateFile(root),'utf8');
    assert.equal(capture().approvalEvidence.sourceEligibleForEnglishReview,false);
    assert.throws(()=>register({humanConfirmed:false}),/Explicit/);
    register();
    assert.equal(capture().approvalEvidence.sourceEligibleForEnglishReview,true);
    assert.equal(capture().publicationAllowed,false);
    assert.equal(fs.readFileSync(store.stateFile(root),'utf8'),unchanged);
    write('.stage2/state.json',originalState);
  });
  test('manual-review without blockers accepts only explicit current-source confirmation',()=>{
    store.saveState(root,{...state,pages:{alpha:{...state.pages.alpha,state:'manual-review'}}});
    const unchanged=fs.readFileSync(store.stateFile(root),'utf8');
    assert.equal(capture().approvalEvidence.sourceEligibleForEnglishReview,false);
    assert.throws(()=>register({humanConfirmed:false}),/Explicit/);
    register();assert.equal(capture().approvalEvidence.sourceEligibleForEnglishReview,true);
    assert.equal(fs.readFileSync(store.stateFile(root),'utf8'),unchanged);
    write('.stage2/state.json',originalState);
  });
  test("tampered confirmation fails closed", () => {
    const directory = path.join(root, ".translation/human-confirmations/alpha"), file = path.join(directory, fs.readdirSync(directory).find(name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8')).receiptId===receipt.receiptId));
    const text = fs.readFileSync(file, "utf8"), tampered = JSON.parse(text); tampered.statement = "changed";
    fs.writeFileSync(file, JSON.stringify(tampered)); assert.throws(capture, /integrity/);
    fs.writeFileSync(file, text);
  });
  console.log(`${count} source human confirmation tests passed (isolated fixtures).`);
} finally {
  assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
  assert(path.basename(root).startsWith("source-human-confirmation-"));
  fs.rmSync(root, { recursive: true, force: true });
}
