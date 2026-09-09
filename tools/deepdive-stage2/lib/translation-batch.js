"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createOpenAIBatchClient } = require("./openai-batch-client");
const digest = value => `sha256:${crypto.createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex")}`;
const check = (condition, message) => { if (!condition) throw new Error(message); };
const terminal = new Set(["completed", "failed", "expired", "cancelled"]);
const batchStates = new Set([...terminal, "validating", "in_progress", "finalizing", "cancelling"]);
function validateConfig(config) {
  const keys = ["model", "projectId", "contextWindow", "maxOutputTokens", "reasoningEffort", "inputUsdPerMillion", "outputUsdPerMillion", "budgetUsd", "maxAttempts"];
  check(config && Object.keys(config).every(key => keys.includes(key)) && keys.every(key => Object.hasOwn(config, key)), "Explicit model, project, token limits, Batch prices, budget and attempts required");
  check(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,100}$/.test(config.model) && /^proj_[A-Za-z0-9_-]+$/.test(config.projectId), "Invalid model/project");
  for (const key of ["contextWindow", "maxOutputTokens", "maxAttempts"]) check(Number.isSafeInteger(config[key]) && config[key] > 0, `Invalid ${key}`);
  check(config.maxAttempts <= 3 && config.maxOutputTokens < config.contextWindow, "Invalid limits");
  check(config.reasoningEffort === "high", "Translation generation reasoning effort must be high");
  for (const key of ["inputUsdPerMillion", "outputUsdPerMillion", "budgetUsd"]) check(Number.isFinite(config[key]) && config[key] > 0, `Invalid ${key}`);
  return JSON.parse(JSON.stringify(config));
}
function tokenAllowance(body) { return Buffer.byteLength(JSON.stringify(body.text)) + 1024; }
function estimatedCost(config, input, count) { return (input * config.inputUsdPerMillion + count * config.maxOutputTokens * config.outputUsdPerMillion) / 1e6; }
function plainDirectory(directory) {
  const absolute = path.resolve(directory), parsed = path.parse(absolute); let current = parsed.root;
  for (const segment of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) fs.mkdirSync(current);
    const stat = fs.lstatSync(current); check(stat.isDirectory() && !stat.isSymbolicLink(), "Unsafe Batch storage directory");
  }
}
function validateOutput(body, request) {
  check(body && body.status === "completed" && !body.error && !body.incomplete_details, "incomplete-response");
  const messages = (body.output || []).filter(item => item.type === "message");
  check(messages.length === 1 && messages[0].role === "assistant", "missing-message");
  const content = messages[0].content;
  check(Array.isArray(content) && content.length === 1 && content[0].type === "output_text", "refusal-or-invalid-content");
  const value = JSON.parse(content[0].text), expected = request.unitIds;
  check(value && Object.keys(value).sort().join() === "sourceConcerns,translations", "invalid-output-keys");
  check(value.translations && !Array.isArray(value.translations) && Object.keys(value.translations).sort().join() === [...expected].sort().join(), "missing-or-extra-units");
  check(expected.every(id => typeof value.translations[id] === "string" && value.translations[id].trim()), "empty-or-invalid-translation");
  check(Array.isArray(value.sourceConcerns) && value.sourceConcerns.every(item => item && Object.keys(item).sort().join() === "reason,unitId"
    && expected.includes(item.unitId) && typeof item.reason === "string" && item.reason.trim()), "invalid-source-concerns");
  return value;
}

function createTranslationBatch({ storageDirectory, readTranslationSnapshot, prepareTranslationTask, checkTranslationSnapshot, client = createOpenAIBatchClient() }) {
  function directory(root, pageId, planId) {
    check(typeof pageId === "string" && /^[a-z0-9][a-z0-9-]*$/.test(pageId), "Invalid pageId");
    check(typeof planId === "string" && /^sha256:[a-f0-9]{64}$/.test(planId), "Invalid planId");
    return path.join(storageDirectory(root), "batches", pageId, planId.slice(7));
  }
  function save(file, value) {
    check(!fs.existsSync(file) || !fs.lstatSync(file).isSymbolicLink(), "Unsafe Batch file");
    const temporary = `${file}.${crypto.randomUUID()}.tmp`;
    try { fs.writeFileSync(temporary, JSON.stringify(value), { flag: "wx" }); fs.renameSync(temporary, file); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  function load(root, pageId, planId) {
    const dir = directory(root, pageId, planId); plainDirectory(dir);
    const file = path.join(dir, "job.json"); check(!fs.lstatSync(file).isSymbolicLink(), "Unsafe Batch file");
    const job = JSON.parse(fs.readFileSync(file, "utf8"));
    const { planId: recorded, ...content } = job.plan;
    check(recorded === planId && digest(content) === planId && job.plan.pageId === pageId, "Batch plan integrity mismatch");
    return job;
  }
  function view(job) {
    return { planId: job.plan.planId, pageId: job.plan.pageId, snapshotId: job.plan.snapshotId, model: job.plan.config.model,
      requestCount: job.plan.requests.length, state: job.state, reservedUsd: job.reservedUsd, budgetUsd: job.plan.config.budgetUsd,
      estimateUsd: job.plan.estimateUsd, estimateBasis: "configured Batch prices; not an invoice", publicationAllowed: false,
      received: Object.keys(job.results).length,
      attempts: job.attempts.map(attempt => ({ id: attempt.id, state: attempt.state, batchId: attempt.batchId || null, requestCount: attempt.ids.length,
        failures: attempt.failures || [], usage: attempt.usage || null, costEstimateUsd: attempt.costEstimateUsd ?? null })) };
  }
  async function locked(root, pageId, planId, run) {
    const dir = directory(root, pageId, planId); plainDirectory(dir);
    const lock = path.join(dir, "operation.lock");
    // No timed lock stealing: uncertainty after process failure must remain visible.
    let descriptor;
    try { descriptor = fs.openSync(lock, "wx"); }
    catch (error) { if (error.code === "EEXIST") throw new Error("Batch operation busy; stale lock requires operator verification"); throw error; }
    fs.writeFileSync(descriptor, JSON.stringify({ pid: process.pid, at: new Date().toISOString() })); fs.closeSync(descriptor);
    try { return await run(job => save(path.join(dir, "job.json"), job), dir); }
    finally { fs.unlinkSync(lock); }
  }
  function fresh(root, plan) { check(checkTranslationSnapshot(root, plan.pageId, plan.snapshotId).state === "prepared", "Source snapshot stale; no upload or retry allowed"); }
  function buildTranslationBatch(root, pageId, snapshotId, inputConfig) {
    const config = validateConfig(inputConfig);
    let offset = 0, text = "", part;
    do { part = readTranslationSnapshot(root, pageId, snapshotId, offset, 12000); text += part.content; offset = part.nextOffset; } while (!part.done);
    const snapshot = JSON.parse(text);
    fresh(root, { pageId, snapshotId });
    const chapters = ["page-header", ...new Set(snapshot.capture.manifest.units.map(unit => unit.chapterId))];
    const requests = chapters.map(chapterId => {
      const task = prepareTranslationTask(root, pageId, snapshotId, chapterId);
      const body = { model: config.model, store: false, max_output_tokens: config.maxOutputTokens, truncation: "disabled",
        reasoning: { effort: config.reasoningEffort },
        input: [{ role: "system", content: task.prompt }, { role: "user", content: JSON.stringify(task.data) }],
        text: { format: { type: "json_schema", name: "understanding_translation", strict: true, schema: task.outputSchema } } };
      const inputBound = Buffer.byteLength(JSON.stringify(body.input)) + tokenAllowance(body);
      check(inputBound + config.maxOutputTokens <= config.contextWindow, "Conservative context limit exceeded; split task explicitly");
      return { customId: task.taskId.slice(7), chapterId, unitIds: task.data.units.map(unit => unit.id), body, inputBound };
    });
    check(requests.length <= 50000, "Batch request limit exceeded");
    const estimateUsd = estimatedCost(config, requests.reduce((sum, item) => sum + item.inputBound, 0), requests.length);
    check(estimateUsd <= config.budgetUsd, "Estimated batch cost exceeds approved plan budget");
    const content = { schemaVersion: 1, pageId, snapshotId, config, requests, estimateUsd };
    const plan = { planId: digest(content), ...content }, dir = directory(root, pageId, plan.planId);
    plainDirectory(dir);
    // Build is content-addressed and identical concurrent builds have identical initial state.
    const file = path.join(dir, "job.json");
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ plan, state: "prepared", reservedUsd: 0, attempts: [], results: {} }), { flag: "wx" });
    return view(load(root, pageId, plan.planId));
  }
  function inspectTranslationBatch(root, pageId, planId) { return view(load(root, pageId, planId)); }
  function translationReviewMaterial(root, pageId, planId) {
    const job = load(root, pageId, planId);
    check(job.plan.requests.length === Object.keys(job.results).length, "Incomplete Batch: collect all chapters before review");
    const chapters = job.plan.requests.map(request => {
      const result = job.results[request.customId];
      check(result && result.outputHash === digest(result.output), "Translation output integrity mismatch");
      const task = prepareTranslationTask(root, pageId, job.plan.snapshotId, request.chapterId);
      check(task.taskId.slice(7) === request.customId, "Translation task identity mismatch");
      return { chapterId: request.chapterId, units: task.data.units, output: result.output };
    });
    return { provider: "openai", planId, pageId, snapshotId: job.plan.snapshotId,
      generation: { model: job.plan.config.model, reasoningEffort: job.plan.config.reasoningEffort }, chapters };
  }
  async function submitTranslationBatch(root, pageId, planId, retry = false) {
    return locked(root, pageId, planId, async persist => {
      const job = load(root, pageId, planId), plan = job.plan;
      client.assertAuthorized(plan); fresh(root, plan);
      const pending = plan.requests.filter(request => !Object.hasOwn(job.results, request.customId));
      if (!pending.length) return view(job);
      if (job.attempts.length) {
        const last = job.attempts.at(-1);
        if (last.state !== "collected") {
          check(!["uploading", "creating", "uncertain"].includes(last.state), "Uncertain attempt; reconcile before any resubmission");
          return view(job);
        }
        check(retry === true, "Explicit retry required");
      }
      check(job.attempts.length < plan.config.maxAttempts, "Retry limit reached");
      const counts = [];
      for (const request of pending) {
        const result = await client.count(plan, request.body);
        check(Number.isSafeInteger(result.input_tokens) && result.input_tokens >= 0, "Invalid API token count");
        // Count endpoint covers input messages. Schema allowance remains separately conservative.
        const input = result.input_tokens + tokenAllowance(request.body);
        check(input + plan.config.maxOutputTokens <= plan.config.contextWindow, "Token count exceeds configured context window");
        counts.push({ customId: request.customId, inputTokens: result.input_tokens, reservedInputTokens: input });
      }
      const reserve = estimatedCost(plan.config, counts.reduce((sum, item) => sum + item.reservedInputTokens, 0), pending.length);
      check(job.reservedUsd + reserve <= plan.config.budgetUsd, "Cumulative reservation exceeds budget; retries are not free");
      const attempt = { id: `attempt-${job.attempts.length + 1}`, ids: pending.map(item => item.customId), counts, state: "uploading", reservedUsd: reserve };
      const jsonl = pending.map(item => JSON.stringify({ custom_id: `${item.customId}-${attempt.id}`, method: "POST", url: "/v1/responses", body: item.body })).join("\n") + "\n";
      check(Buffer.byteLength(jsonl) <= 200000000, "Batch upload too large");
      fresh(root, plan); // token counting may take time; check again before exporting the file.
      job.attempts.push(attempt); job.reservedUsd += reserve; job.state = "submitting"; persist(job);
      try {
        const file = await client.upload(plan, jsonl, `${planId.slice(7)}-${attempt.id}.jsonl`);
        check(/^file[-_][A-Za-z0-9_-]+$/.test(file.id || ""), "Invalid upload receipt");
        attempt.fileId = file.id; attempt.state = "creating"; persist(job);
        const batch = await client.create(plan, file.id, attempt.id);
        bindBatch(attempt, plan, batch);
        job.state = "submitted"; persist(job);
      } catch (_) {
        attempt.state = "uncertain"; job.state = "needs-reconciliation"; persist(job);
        throw new Error("Submission outcome uncertain; inspect and reconcile, do not resubmit");
      }
      return view(job);
    });
  }
  function bindBatch(attempt, plan, batch) {
    check(/^batch[-_][A-Za-z0-9_-]+$/.test(batch.id || "") && batch.input_file_id === attempt.fileId && batch.endpoint === "/v1/responses"
      && batch.metadata?.translation_plan === plan.planId && batch.metadata?.translation_attempt === attempt.id && batchStates.has(batch.status), "Batch receipt identity mismatch");
    attempt.batchId = batch.id; attempt.state = batch.status;
  }
  async function reconcileTranslationBatch(root, pageId, planId) {
    return locked(root, pageId, planId, async persist => {
      const job = load(root, pageId, planId); client.assertAuthorized(job.plan);
      const attempt = job.attempts.at(-1); check(attempt && ["uncertain", "uploading", "creating"].includes(attempt.state), "No uncertain attempt");
      check(attempt.fileId, "Upload receipt missing; operator must inspect remote files; automatic resubmission blocked");
      let after, matches = [];
      for (let page = 0; page < 100; page++) {
        const listed = await client.list(job.plan, after); check(Array.isArray(listed.data), "Invalid batch list");
        matches.push(...listed.data.filter(item => item.metadata?.translation_plan === planId && item.metadata?.translation_attempt === attempt.id));
        if (!listed.has_more) {
          check(matches.length === 1, "No unique remote batch found; keep uncertain and do not resubmit");
          bindBatch(attempt, job.plan, matches[0]); job.state = "submitted"; persist(job); return view(job);
        }
        check(listed.last_id && listed.last_id !== after, "Invalid pagination cursor"); after = listed.last_id;
      }
      throw new Error("Reconciliation search limit reached; no resubmission authorized");
    });
  }
  async function collectTranslationBatch(root, pageId, planId) {
    return locked(root, pageId, planId, async (persist, dir) => {
      const job = load(root, pageId, planId), plan = job.plan; client.assertAuthorized(plan);
      const attempt = job.attempts.at(-1); check(attempt?.batchId, "No confirmed batch; reconcile first");
      if (attempt.state === "collected") return view(job);
      const batch = await client.retrieve(plan, attempt.batchId);
      check(batch.id === attempt.batchId, "Wrong batch returned"); bindBatch(attempt, plan, batch);
      if (!terminal.has(batch.status)) { persist(job); return view(job); }
      const lines = [];
      for (const key of ["output_file_id", "error_file_id"]) {
        if (!batch[key]) continue;
        const text = await client.content(plan, batch[key]);
        save(path.join(dir, `${attempt.id}-${key}.json`), { fileId: batch[key], contentHash: digest(text), text });
        try { lines.push(...text.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line))); }
        catch (_) { throw new Error("Malformed Batch JSONL; download retained for controlled inspection"); }
      }
      const byId = new Map(), expected = new Set(attempt.ids.map(id => `${id}-${attempt.id}`));
      for (const line of lines) {
        check(expected.has(line.custom_id) && !byId.has(line.custom_id), "Unknown/duplicate output custom_id; quarantine entire download");
        byId.set(line.custom_id, line);
      }
      const failures = [], usage = { inputTokens: 0, outputTokens: 0, complete: true };
      for (const id of attempt.ids) {
        const request = plan.requests.find(item => item.customId === id), line = byId.get(`${id}-${attempt.id}`);
        const measured = line?.response?.body?.usage;
        if (Number.isSafeInteger(measured?.input_tokens) && measured.input_tokens >= 0 && Number.isSafeInteger(measured?.output_tokens) && measured.output_tokens >= 0) {
          usage.inputTokens += measured.input_tokens; usage.outputTokens += measured.output_tokens;
        } else usage.complete = false;
        try {
          check(line && !line.error && line.response?.status_code === 200, "missing-or-api-error");
          const output = validateOutput(line.response.body, request);
          job.results[id] = { attemptId: attempt.id, output, outputHash: digest(output),
            responseId: line.response.body.id || null, responseModel: line.response.body.model || null,
            status: "received-unreviewed" };
        } catch (_) { failures.push({ chapterId: request.chapterId, customId: id, reason: "missing-error-refusal-incomplete-or-schema-invalid" }); }
      }
      attempt.state = "collected"; attempt.remoteStatus = batch.status; attempt.failures = failures; attempt.usage = usage;
      attempt.costEstimateUsd = usage.complete ? (usage.inputTokens * plan.config.inputUsdPerMillion + usage.outputTokens * plan.config.outputUsdPerMillion) / 1e6 : null;
      try { job.sourceState = checkTranslationSnapshot(root, pageId, plan.snapshotId).state; } catch (_) { job.sourceState = "unverified"; }
      job.state = job.sourceState !== "prepared" ? "stale" : failures.length ? "partial" : "received-unreviewed";
      persist(job); return view(job);
    });
  }
  return { buildTranslationBatch, inspectTranslationBatch, submitTranslationBatch, reconcileTranslationBatch, collectTranslationBatch, translationReviewMaterial };
}
module.exports = { createTranslationBatch, validateOutput, validateConfig };
