"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { createTranslationPreparation } = require("../../tools/deepdive-stage2/lib/translation-preparation");
const { createTranslationBatch, validateOutput } = require("../../tools/deepdive-stage2/lib/translation-batch");
const { createOpenAIBatchClient } = require("../../tools/deepdive-stage2/lib/openai-batch-client");
const { createStateStore } = require("../../tools/deepdive-stage2/lib/state-store");
const { createTranslationQuality } = require("../../tools/deepdive-stage2/lib/translation-quality");
const { pageRegistrationSource } = require("../../tools/deepdive/runtime/standalone-page-source");
const { pageContentHash } = require("../../tools/deepdive/quality/deepdive-audit-contracts");
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "translation-batch-"));
let passed = 0;
const config = { model: "fixture-model", projectId: "proj_fixture", contextWindow: 100000, maxOutputTokens: 2000,
  reasoningEffort: "high", inputUsdPerMillion: 1, outputUsdPerMillion: 2, budgetUsd: 2, maxAttempts: 3 };
function json(value, status = 200) { return new Response(JSON.stringify(value), { status }); }
function createFixture(name, override = {}) {
  const root = path.join(fixtureRoot, name); fs.mkdirSync(root);
  function write(relative, value) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); }
  const page = { title: "测试", subtitle: "边界", thesis: "保持事实", html: '<section><h2>机制</h2><p>条件与否定。</p></section><section><h2>自测</h2><p>答案：否</p></section>' };
  write("data/deepdive/alpha.js", pageRegistrationSource("alpha", page));
  write("data/graph.js", 'window.GRAPH={nodes:[{id:"alpha",title:"测试"}]};');
  write("data/locales/terminology.js", 'window.AI_TERMINOLOGY={revision:"fixture-v1",nodeTerms:{alpha:{status:"approved",displayTitle:"Test"}}};');
  const store = createStateStore({ defaultRoot: root, schemaVersion: 2 });
  store.saveState(root, { schemaVersion: 2, pages: { alpha: { id: "alpha", published: true, state: "audit-queued", lease: null } } });
  const beforeState = fs.readFileSync(store.stateFile(root), "utf8"), beforeSource = fs.readFileSync(path.join(root, "data/deepdive/alpha.js"), "utf8");
  const storageDirectory = value => path.join(value, ".translation");
  const preparation = createTranslationPreparation({ defaultRoot: root, acquireLock: store.acquireLock, loadState: store.loadState, storageDirectory });
  const snapshot = preparation.exportTranslationSnapshot(root, "alpha", pageContentHash(page));
  const environment = { OPENAI_API_KEY: "secret-fixture-key", OPENAI_PROJECT_ID: "proj_fixture" };
  const remote = { calls: [], files: new Map(), batches: [], uploads: 0, creates: 0, mode: "success", tokenCount: 100 };
  async function fetchImpl(url, options) {
    assert(url.startsWith("https://api.openai.com/v1/")); assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, "Bearer secret-fixture-key");
    remote.calls.push({ url, method: options.method });
    if (url.endsWith("/responses/input_tokens")) {
      const body = JSON.parse(options.body); assert.equal(body.model, "fixture-model"); assert.equal(body.input.length, 2);
      return json({ object: "response.input_tokens", input_tokens: remote.tokenCount });
    }
    if (url.endsWith("/files")) {
      assert.equal(options.body.get("purpose"), "batch");
      const text = await options.body.get("file").text(), id = `file_${++remote.uploads}`; remote.files.set(id, text);
      for (const line of text.trim().split("\n").map(JSON.parse)) {
        assert.equal(line.url, "/v1/responses"); assert.equal(line.body.store, false); assert.equal(line.body.truncation, "disabled");
        assert.deepEqual(line.body.reasoning, { effort: "high" });
        assert.equal(line.body.text.format.strict, true); assert.equal(line.body.text.format.type, "json_schema");
      }
      if (remote.mode === "upload-timeout") throw new Error("sensitive upstream text");
      return json({ id });
    }
    if (url.endsWith("/batches") && options.method === "POST") {
      const body = JSON.parse(options.body); assert.equal(body.completion_window, "24h");
      const batch = { ...body, id: `batch_${++remote.creates}`, status: "in_progress" }; remote.batches.push(batch);
      if (remote.mode === "create-timeout") throw new Error("simulated response lost after creation");
      return json(batch);
    }
    if (url.includes("/batches?")) return json({ data: remote.batches, has_more: false });
    if (/\/batches\/batch_/.test(url)) {
      const batch = remote.batches.find(item => url.endsWith(item.id)); assert(batch); return json(batch);
    }
    if (/\/files\/file_.*\/content$/.test(url)) return new Response(remote.files.get(url.split("/").at(-2)));
    throw new Error("Unexpected mock request");
  }
  const client = createOpenAIBatchClient({ environment, fetchImpl });
  const service = createTranslationBatch({ storageDirectory, ...preparation, client });
  const built = service.buildTranslationBatch(root, "alpha", snapshot.snapshotId, { ...config, ...override });
  function authorize() { environment.STAGE2_BATCH_LIVE = "1"; environment.STAGE2_BATCH_APPROVED_PLAN = built.planId; }
  function job() { return JSON.parse(fs.readFileSync(path.join(storageDirectory(root), "batches/alpha", built.planId.slice(7), "job.json"), "utf8")); }
  function finish({ failFirst = false, duplicate = false, unknown = false, incomplete = false, missing = false, noUsage = false, remoteStatus = "completed" } = {}) {
    const batch = remote.batches.at(-1); assert(batch);
    const requests = remote.files.get(batch.input_file_id).trim().split("\n").map(JSON.parse);
    const rows = requests.map((request, index) => {
      const required = request.body.text.format.schema.properties.translations.required;
      const value = { translations: Object.fromEntries(required.map(id => [id, "English translation"])), sourceConcerns: [] };
      if (failFirst && index === 0) delete value.translations[required[0]];
      return { custom_id: request.custom_id, response: { status_code: 200, body: { status: incomplete ? "incomplete" : "completed",
        usage: noUsage ? undefined : { input_tokens: 100, output_tokens: 50 },
        output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(value) }] }] } } };
    });
    if (duplicate) rows.push(rows[0]); if (unknown) rows[0].custom_id = "unknown"; if (missing) rows.pop();
    batch.status = remoteStatus; batch.output_file_id = `file_output_${remote.batches.length}`;
    remote.files.set(batch.output_file_id, rows.reverse().map(JSON.stringify).join("\n") + "\n");
  }
  const submit = retry => service.submitTranslationBatch(root, "alpha", built.planId, retry);
  const collect = () => service.collectTranslationBatch(root, "alpha", built.planId);
  const reconcile = () => service.reconcileTranslationBatch(root, "alpha", built.planId);
  const inspect = () => service.inspectTranslationBatch(root, "alpha", built.planId);
  return { root, write, page, snapshot, preparation, service, built, remote, environment, authorize, job, finish, submit, collect, reconcile, inspect,
    verifyUntouched() { assert.equal(fs.readFileSync(store.stateFile(root), "utf8"), beforeState); assert.equal(fs.readFileSync(path.join(root, "data/deepdive/alpha.js"), "utf8"), beforeSource); } };
}
async function test(name, run) { await run(); passed++; console.log(`PASS ${name}`); }
(async () => {
  try {
    await test("dry plan deterministic, no network, credentials/project/plan gates enforced", async () => {
      const f = createFixture("dry"); assert.equal(f.remote.calls.length, 0); assert.equal(f.built.requestCount, 3);
      assert.deepEqual(f.service.buildTranslationBatch(f.root, "alpha", f.snapshot.snapshotId, config), f.built);
      await assert.rejects(f.submit, /disabled/); f.authorize(); f.environment.OPENAI_PROJECT_ID = "proj_wrong";
      await assert.rejects(f.submit, /authorized/); assert.equal(f.remote.calls.length, 0); f.verifyUntouched();
    });
    await test("upload, create, unordered download, durable unreviewed outputs and usage", async () => {
      const f = createFixture("happy"); f.authorize(); const sent = await f.submit(); assert.equal(sent.state, "submitted");
      await f.submit(); assert.equal(f.remote.creates, 1); assert.equal(f.remote.uploads, 1);
      assert.equal((await f.collect()).state, "submitted"); f.finish(); const received = await f.collect();
      assert.equal(received.received, 3); assert.equal(received.state, "received-unreviewed"); assert.equal(received.publicationAllowed, false);
      assert.equal(received.attempts[0].usage.inputTokens, 300); assert(received.attempts[0].costEstimateUsd > 0);
      const quality = createTranslationQuality({ storageDirectory: root => path.join(root, ".translation"),
        translationReviewMaterial: f.service.translationReviewMaterial, ...f.preparation });
      const review = quality.beginTranslationQuality(f.root, "alpha", f.built.planId);
      assert.equal(review.gates[1].status, "pass"); assert.equal(review.gates[6].status, "pending-semantic-review");
      assert.equal(review.publicationAllowed, false);
      const calls = f.remote.calls.length; await f.collect(); await f.submit(); assert.equal(f.remote.calls.length, calls);
      f.verifyUntouched();
    });
    await test("partial failure retries only failed chapters with new custom IDs", async () => {
      const f = createFixture("partial"); f.authorize(); await f.submit(); f.finish({ failFirst: true });
      assert.equal((await f.collect()).state, "partial"); await assert.rejects(f.submit, /Explicit retry/);
      await f.submit(true); const pending = f.remote.files.get(f.remote.batches.at(-1).input_file_id).trim().split("\n").map(JSON.parse);
      assert.equal(pending.length, 1); assert(pending[0].custom_id.endsWith("attempt-2"));
      f.finish(); assert.equal((await f.collect()).received, 3); assert(f.inspect().reservedUsd > f.built.estimateUsd / 10);
    });
    await test("uncertain create is reconciled without duplicate paid submission", async () => {
      const f = createFixture("uncertain"); f.authorize(); f.remote.mode = "create-timeout";
      await assert.rejects(f.submit, /uncertain/); await assert.rejects(f.submit, /reconcile/); assert.equal(f.remote.creates, 1);
      assert.equal((await f.reconcile()).state, "submitted"); assert.equal(f.remote.creates, 1);
      f.finish(); assert.equal((await f.collect()).received, 3);
    });
    await test("lost upload receipt fails closed and never echoes upstream text", async () => {
      const f = createFixture("upload-unknown"); f.authorize(); f.remote.mode = "upload-timeout";
      await assert.rejects(f.submit, error => /uncertain/.test(error.message) && !error.message.includes("sensitive"));
      await assert.rejects(f.reconcile, /receipt missing/); await assert.rejects(f.submit, /reconcile/); assert.equal(f.remote.uploads, 1);
    });
    await test("source changes prevent submission and mark received results stale", async () => {
      const f = createFixture("stale"); f.authorize(); await f.submit();
      f.write("data/deepdive/alpha.js", pageRegistrationSource("alpha", { ...f.page, title: "Changed" }));
      f.finish(); assert.equal((await f.collect()).state, "stale"); await assert.rejects(() => f.submit(true), /stale/);
      assert.equal(f.remote.creates, 1);
    });
    await test("token context overflow and insufficient budget prevent paid batch creation", async () => {
      const f = createFixture("limits"); f.authorize(); f.remote.tokenCount = 100001;
      await assert.rejects(f.submit, /context/); assert.equal(f.remote.creates, 0); assert.equal(f.remote.uploads, 0);
      assert.throws(() => f.service.buildTranslationBatch(f.root, "alpha", f.snapshot.snapshotId, { ...config, budgetUsd: 0.0000001 }), /budget/);
    });
    await test("duplicate or unknown custom IDs quarantine download without accepting output", async () => {
      for (const option of ["duplicate", "unknown"]) {
        const f = createFixture(option); f.authorize(); await f.submit(); f.finish({ [option]: true });
        await assert.rejects(f.collect, /custom_id/); assert.equal(f.inspect().received, 0);
      }
    });
    await test("expired/incomplete/missing results do not count as successful translations", async () => {
      const f = createFixture("expired"); f.authorize(); await f.submit(); f.finish({ incomplete: true, missing: true, remoteStatus: "expired" });
      const result = await f.collect(); assert.equal(result.received, 0); assert.equal(result.attempts[0].failures.length, 3);
      assert.equal(result.attempts[0].costEstimateUsd, null);
    });
    await test("missing usage remains unknown, not a zero invoice", async () => {
      const f = createFixture("usage"); f.authorize(); await f.submit(); f.finish({ noUsage: true });
      assert.equal((await f.collect()).attempts[0].costEstimateUsd, null);
    });
    await test("retry cap prevents unlimited retranslations", async () => {
      const f = createFixture("retry-cap", { maxAttempts: 1 }); f.authorize(); await f.submit(); f.finish({ incomplete: true }); await f.collect();
      await assert.rejects(() => f.submit(true), /Retry limit/); assert.equal(f.remote.creates, 1);
    });
    await test("refusals, empty and extra translations are rejected", () => {
      assert.throws(() => validateOutput({ status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "refusal", refusal: "No" }] }] }, { unitIds: ["u1"] }), /refusal/);
      for (const translations of [{ u1: "" }, { u1: "English", extra: "Extra" }]) {
        const body = { status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify({ translations, sourceConcerns: [] }) }] }] };
        assert.throws(() => validateOutput(body, { unitIds: ["u1"] }), /translation|extra/);
      }
    });
    await test("cumulative retry budget cannot be bypassed by partial failures", async () => {
      const f = createFixture("budget");
      // Reserve based on actual prompt token count plus schema allowance, not just source length.
      f.remote.tokenCount = 30000;
      const configWithBudget = { ...config, budgetUsd: 0.13 };
      const built = f.service.buildTranslationBatch(f.root, "alpha", f.snapshot.snapshotId, configWithBudget);
      f.environment.STAGE2_BATCH_LIVE = "1"; f.environment.STAGE2_BATCH_APPROVED_PLAN = built.planId;
      await f.service.submitTranslationBatch(f.root, "alpha", built.planId);
      f.finish({ incomplete: true }); await f.service.collectTranslationBatch(f.root, "alpha", built.planId);
      await assert.rejects(() => f.service.submitTranslationBatch(f.root, "alpha", built.planId, true), /budget/);
      assert.equal(f.remote.creates, 1);
    });
    await test("error file is collected and errors never become translations", async () => {
      const f = createFixture("error-file"); f.authorize(); await f.submit();
      const batch = f.remote.batches[0], requests = f.remote.files.get(batch.input_file_id).trim().split("\n").map(JSON.parse);
      batch.status = "failed"; batch.error_file_id = "file_errors";
      f.remote.files.set(batch.error_file_id, requests.map(request => JSON.stringify({ custom_id: request.custom_id, error: { code: "batch_expired", message: "fixture" } })).join("\n"));
      const result = await f.collect(); assert.equal(result.received, 0); assert.equal(result.attempts[0].failures.length, 3);
    });
    await test("no unique reconciliation match keeps the paid attempt blocked", async () => {
      const f = createFixture("no-match"); f.authorize(); f.remote.mode = "create-timeout";
      await assert.rejects(f.submit); f.remote.batches = [];
      await assert.rejects(f.reconcile, /unique/); await assert.rejects(f.submit, /reconcile/);
      assert.equal(f.remote.creates, 1);
    });
    await test("same-plan concurrency blocked and no global Stage 2 lock held during upload", async () => {
      const f = createFixture("lock"); f.authorize();
      const lock = path.join(f.root, ".translation/batches/alpha", f.built.planId.slice(7), "operation.lock");
      fs.writeFileSync(lock, "fixture lock"); await assert.rejects(f.submit, /busy/); fs.unlinkSync(lock);
      await f.submit(); assert(!fs.existsSync(path.join(f.root, ".stage2/controller.lock"))); f.verifyUntouched();
    });
    await test("MCP Batch profile is page locked and live calls disabled by default", () => {
      const f = createFixture("mcp");
      const requests = [
        { id: 1, method: "tools/list", params: {} },
        { id: 2, method: "tools/call", params: { name: "stage2_submit_translation_batch", arguments: { pageId: "alpha", planId: f.built.planId } } },
        { id: 3, method: "tools/call", params: { name: "stage2_inspect_translation_batch", arguments: { pageId: "beta", planId: f.built.planId } } },
        { id: 4, method: "tools/call", params: { name: "stage2_submit_result", arguments: {} } },
      ];
      const result = spawnSync(process.execPath, [path.resolve(__dirname, "../../tools/deepdive-stage2/mcp-server.js")], {
        cwd: f.root, env: { ...process.env, DEEPDIVE_STAGE2_ROOT: f.root, STAGE2_MCP_PROFILE: "translation-batch", STAGE2_MCP_PAGE_ID: "alpha", STAGE2_BATCH_LIVE: "0" },
        input: requests.map(item => JSON.stringify({ jsonrpc: "2.0", ...item })).join("\n") + "\n", encoding: "utf8", timeout: 10000,
      });
      assert.equal(result.status, 0, result.stderr);
      const replies = new Map(result.stdout.trim().split("\n").map(line => JSON.parse(line)).map(item => [item.id, item.result]));
      assert.equal(replies.get(1).tools.length, 5); assert.equal(replies.get(2).isError, true); assert.equal(replies.get(3).isError, true); assert.equal(replies.get(4).isError, true);
    });
    console.log(`${passed} Batch integration tests passed; mock transport only, zero real API calls.`);
  } finally {
    assert.equal(path.dirname(fixtureRoot), path.resolve(os.tmpdir())); assert(path.basename(fixtureRoot).startsWith("translation-batch-"));
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
