"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { createDeepSeekClient } = require("./deepseek-client");
const { validateOutput } = require("./translation-batch");
const hash = value => `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
const check = (ok, message) => { if (!ok) throw new Error(message); };
function configuration(value) {
  const keys = ["model", "accountId", "contextWindow", "maxOutputTokens", "reasoningEffort", "inputUsdPerMillion", "outputUsdPerMillion", "priceBasis", "budgetUsd", "maxAttempts", "requestTimeoutMs"];
  check(value && Object.keys(value).sort().join() === keys.sort().join(), "Explicit DeepSeek configuration required");
  check(value.model === "deepseek-v4-pro", "This adapter is validated for deepseek-v4-pro only");
  check(typeof value.accountId === "string" && /^[A-Za-z0-9_-]{3,80}$/.test(value.accountId), "Invalid local account label");
  for (const key of ["contextWindow", "maxOutputTokens", "maxAttempts"]) check(Number.isSafeInteger(value[key]) && value[key] > 0, `Invalid ${key}`);
  check(value.contextWindow <= 1000000 && value.maxOutputTokens <= 384000 && value.maxOutputTokens < value.contextWindow && value.maxAttempts <= 3, "Invalid limits");
  check(["none", "low", "high", "max"].includes(value.reasoningEffort), "Explicit reasoning effort required");
  check(Number.isSafeInteger(value.requestTimeoutMs) && value.requestTimeoutMs >= 1000 && value.requestTimeoutMs <= 600000, "Invalid request timeout");
  check(value.priceBasis === "peak-cache-miss", "Reserve at verified peak/cache-miss prices, not off-peak or cache-hit prices");
  for (const key of ["inputUsdPerMillion", "outputUsdPerMillion", "budgetUsd"]) check(Number.isFinite(value[key]) && value[key] > 0, `Invalid ${key}`);
  return JSON.parse(JSON.stringify(value));
}
function safeDirectory(directory, create = true) {
  const absolute = path.resolve(directory); let current = path.parse(absolute).root;
  for (const part of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (create && !fs.existsSync(current)) fs.mkdirSync(current);
    check(fs.lstatSync(current).isDirectory() && !fs.lstatSync(current).isSymbolicLink(), "Unsafe DeepSeek directory");
  }
}
function normalizedOutput(response, request) {
  check(typeof response?.model === "string" && (response.model === "deepseek-v4-pro" || /^deepseek-v4-pro-\d{4}$/.test(response.model)), "Wrong response model");
  check(Array.isArray(response.choices) && response.choices.length === 1 && response.choices[0].finish_reason === "stop", "Incomplete/refused response");
  const message = response.choices[0].message;
  check(message?.role === "assistant" && !message.refusal && !message.tool_calls?.length && typeof message.content === "string", "Invalid assistant message");
  // Reuse the existing exact field/unit contract, not JSON validity alone.
  return validateOutput({ status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: message.content }] }] }, request);
}
function usageOf(response) {
  const usage = response?.usage;
  if (!Number.isSafeInteger(usage?.prompt_tokens) || usage.prompt_tokens < 0 || !Number.isSafeInteger(usage?.completion_tokens) || usage.completion_tokens < 0) return null;
  return { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens };
}
function createTranslationDeepSeek({ storageDirectory, readTranslationSnapshot, prepareTranslationTask, checkTranslationSnapshot, client = createDeepSeekClient() }) {
  function directory(root, id, planId) {
    check(typeof id === "string" && /^[a-z0-9][a-z0-9-]*$/.test(id) && typeof planId === "string" && /^sha256:[a-f0-9]{64}$/.test(planId), "Invalid page/plan ID");
    return path.join(storageDirectory(root), "deepseek", id, planId.slice(7));
  }
  function save(file, value) {
    check(!fs.existsSync(file) || !fs.lstatSync(file).isSymbolicLink(), "Unsafe DeepSeek file");
    const temp = `${file}.${crypto.randomUUID()}.tmp`;
    try { fs.writeFileSync(temp, JSON.stringify(value), { flag: "wx" }); fs.renameSync(temp, file); }
    finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
  }
  function load(root, id, planId) {
    const dir = directory(root, id, planId); safeDirectory(dir, false);
    const file = path.join(dir, "job.json"); check(!fs.lstatSync(file).isSymbolicLink(), "Unsafe DeepSeek job");
    const job = JSON.parse(fs.readFileSync(file, "utf8")), { planId: saved, ...content } = job.plan;
    check(saved === planId && hash(content) === planId && job.plan.pageId === id && job.plan.provider === "deepseek", "DeepSeek plan integrity mismatch");
    return job;
  }
  function fresh(root, plan) { check(checkTranslationSnapshot(root, plan.pageId, plan.snapshotId).state === "prepared", "Stale source; no paid call/review allowed"); }
  function view(job) {
    return { provider: "deepseek", planId: job.plan.planId, pageId: job.plan.pageId, snapshotId: job.plan.snapshotId,
      model: job.plan.config.model, state: job.state, requestCount: job.plan.requests.length, received: Object.keys(job.results).length,
      estimateUsd: job.plan.estimateUsd, reservedUsd: job.reservedUsd, budgetUsd: job.plan.config.budgetUsd,
      estimateBasis: "configured peak/cache-miss reservation; not an invoice or provider-enforced spending limit", publicationAllowed: false,
      attempts: job.attempts.map(({ chapterId, number, state, usage, costEstimateUsd, startedAt, finishedAt, durationMs }) => ({ chapterId, number, state, usage: usage ?? null, costEstimateUsd: costEstimateUsd ?? null,
        startedAt: startedAt ?? null, finishedAt: finishedAt ?? null, durationMs: durationMs ?? null })) };
  }
  function buildDeepSeekTranslation(root, pageId, snapshotId, inputConfig) {
    const config = configuration(inputConfig); fresh(root, { pageId, snapshotId });
    let offset = 0, text = "", part;
    do { part = readTranslationSnapshot(root, pageId, snapshotId, offset, 12000); text += part.content; offset = part.nextOffset; } while (!part.done);
    const snapshot = JSON.parse(text), chapters = ["page-header", ...new Set(snapshot.capture.manifest.units.map(unit => unit.chapterId))];
    const requests = chapters.map(chapterId => {
      const task = prepareTranslationTask(root, pageId, snapshotId, chapterId);
      const body = { model: config.model, stream: false, max_tokens: config.maxOutputTokens,
        thinking: { type: config.reasoningEffort === "none" ? "disabled" : "enabled" },
        ...(config.reasoningEffort === "none" ? {} : { reasoning_effort: config.reasoningEffort }),
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: task.prompt }, { role: "user", content: JSON.stringify({ ...task.data, outputSchema: task.outputSchema }) }] };
      const inputBound = Buffer.byteLength(JSON.stringify(body)) + 2048;
      check(inputBound + config.maxOutputTokens <= config.contextWindow, "Conservative context limit exceeded; explicit subdivision required");
      return { customId: task.taskId.slice(7), chapterId, unitIds: task.data.units.map(unit => unit.id), body, inputBound,
        reserveUsd: (inputBound * config.inputUsdPerMillion + config.maxOutputTokens * config.outputUsdPerMillion) / 1e6 };
    });
    const estimateUsd = requests.reduce((sum, request) => sum + request.reserveUsd, 0);
    check(estimateUsd <= config.budgetUsd, `Estimated cost exceeds budget: reserved USD ${estimateUsd.toFixed(6)}, limit USD ${config.budgetUsd.toFixed(2)}; input reservation USD ${requests.reduce((sum, request) => sum + request.inputBound * config.inputUsdPerMillion / 1e6, 0).toFixed(6)}; output reservation USD ${(requests.length * config.maxOutputTokens * config.outputUsdPerMillion / 1e6).toFixed(6)}. No provider request sent.`);
    const content = { schemaVersion: 1, provider: "deepseek", pageId, snapshotId, config, requests, estimateUsd };
    const plan = { planId: hash(content), ...content }, dir = directory(root, pageId, plan.planId); safeDirectory(dir);
    const file = path.join(dir, "job.json");
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ plan, state: "prepared", reservedUsd: 0, attempts: [], results: {} }), { flag: "wx" });
    return view(load(root, pageId, plan.planId));
  }
  function inspectDeepSeekTranslation(root, pageId, planId) { return view(load(root, pageId, planId)); }
  // Called only by the campaign's exact operator-authorized recovery path.
  // Preserve both the failed attempt and its reservation; never accept a lost response.
  function replaceUncertainTranslation(root, pageId, planId, requestHash, reason) {
    const dir=directory(root,pageId,planId),lock=path.join(dir,'operation.lock');
    fs.closeSync(fs.openSync(lock,'wx'));
    try {
      const job=load(root,pageId,planId);fresh(root,job.plan);
      check(typeof reason==='string'&&reason.length>=40,'Explicit replacement reason required');
      const requests=job.plan.requests.filter(r=>hash(r.body)===requestHash);
      check(requests.length===1,'Exact unique translation request required');
      const request=requests[0], attempts=job.attempts.filter(a=>a.customId===request.customId);
      if(attempts.some(a=>a.state==='abandoned-unknown'&&a.replacementRequestHash===requestHash))return view(job);
      check(!Object.hasOwn(job.results,request.customId),'Completed chapter cannot be replaced');
      check(attempts.length>0&&attempts.length<job.plan.config.maxAttempts,'Chapter retry limit reached');
      const attempt=attempts.at(-1);
      check(attempt.state==='uncertain'&&!attempt.receiptHash&&!attempt.usage,'Saved response requires reconciliation');
      check(!fs.existsSync(path.join(dir,`${request.customId}-${attempt.number}.json`)),'Saved receipt requires reconciliation');
      check(!job.attempts.some(a=>a!==attempt&&['sending','uncertain','usage-review'].includes(a.state)),'Other unsettled chapter calls exist');
      attempt.state='abandoned-unknown';attempt.replacementRequestHash=requestHash;
      attempt.resolution={reason,at:new Date().toISOString(),actualUsageKnown:false};
      job.state='needs-explicit-retry';save(path.join(dir,'job.json'),job);return view(job);
    } finally {fs.unlinkSync(lock);}
  }
  async function runDeepSeekTranslation(root, pageId, planId, retry = false) {
    const dir = directory(root, pageId, planId); safeDirectory(dir);
    const lock = path.join(dir, "operation.lock"), fd = fs.openSync(lock, "wx"); fs.closeSync(fd);
    try {
      const job = load(root, pageId, planId), plan = job.plan, persist = () => save(path.join(dir, "job.json"), job);
      client.assertAuthorized(plan); fresh(root, plan);
      check(!job.attempts.some(item => ["sending", "uncertain", "usage-review"].includes(item.state)), "Uncertain call or usage requires operator review; resend forbidden");
      const request = plan.requests.find(item => !Object.hasOwn(job.results, item.customId));
      if (!request) return view(job);
      // Campaign admission precedes the single-page sending record. A refusal
      // before network dispatch is not an uncertain provider request.
      if(client.preflight)client.preflight(plan,request.body);
      const previous = job.attempts.filter(item => item.customId === request.customId);
      check(!previous.length || retry === true, "Explicit retry required for failed chapter");
      check(previous.length < plan.config.maxAttempts, "Chapter retry limit reached");
      check(job.reservedUsd + request.reserveUsd <= plan.config.budgetUsd, "Cumulative reservation exceeds budget");
      const attempt = { customId: request.customId, chapterId: request.chapterId, number: previous.length + 1, state: "sending" };
      const finishTiming = require('./translation-timing').startTiming(attempt);
      job.attempts.push(attempt); job.reservedUsd += request.reserveUsd; job.state = "running"; persist();
      let response;
      try { response = await client.complete(plan, request.body); }
      catch (_) { finishTiming(); attempt.state = "uncertain"; job.state = "needs-operator-review"; persist(); return view(job); }
      finishTiming();
      // Retain only response fields needed for traceability/validation; reasoning_content is never stored or exposed.
      const receipt = { id: response?.id ?? null, model: response?.model ?? null, usage: response?.usage ?? null,
        choices: Array.isArray(response?.choices) ? response.choices.map(choice => ({ finish_reason: choice.finish_reason,
          message: { role: choice.message?.role, content: choice.message?.content, refusal: choice.message?.refusal,
            tool_calls: choice.message?.tool_calls?.length ? ["unexpected-tool-call"] : [] } })) : null };
      const receiptName = `${request.customId}-${attempt.number}.json`;
      save(path.join(dir, receiptName), receipt); attempt.receiptHash = hash(receipt);
      attempt.usage = usageOf(response);
      attempt.costEstimateUsd = attempt.usage ? (attempt.usage.inputTokens * plan.config.inputUsdPerMillion + attempt.usage.outputTokens * plan.config.outputUsdPerMillion) / 1e6 : null;
      try {
        const output = normalizedOutput(response, request);
        job.results[request.customId] = { output, outputHash: hash(output), responseId: response.id ?? null, responseModel: response.model,
          status: "received-unreviewed", receiptName, receiptHash: attempt.receiptHash };
        attempt.state = "received-unreviewed";
      } catch (_) { attempt.state = "invalid-output"; }
      if (!attempt.usage || attempt.usage.inputTokens > request.inputBound || attempt.usage.outputTokens > plan.config.maxOutputTokens) attempt.state = "usage-review";
      job.state = attempt.state === "usage-review" ? "needs-operator-review" : attempt.state === "invalid-output" ? "needs-explicit-retry"
        : Object.keys(job.results).length === plan.requests.length ? "received-unreviewed" : "partial";
      try { fresh(root, plan); } catch (_) { job.state = "stale"; }
      persist(); return view(job);
    } finally { fs.unlinkSync(lock); }
  }
  function translationReviewMaterial(root, pageId, planId) {
    const job = load(root, pageId, planId); fresh(root, job.plan);
    check(job.state === "received-unreviewed" && job.plan.requests.length === Object.keys(job.results).length, "Incomplete or blocked DeepSeek plan");
    const chapters = job.plan.requests.map(request => {
      const result = job.results[request.customId]; check(result && hash(result.output) === result.outputHash, "DeepSeek output integrity mismatch");
      check(/^[a-f0-9]{64}-[1-3]\.json$/.test(result.receiptName), "Invalid receipt path");
      const file = path.join(directory(root, pageId, planId), result.receiptName); check(!fs.lstatSync(file).isSymbolicLink(), "Unsafe receipt");
      const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
      check(hash(receipt) === result.receiptHash && hash(normalizedOutput(receipt, request)) === result.outputHash, "DeepSeek receipt integrity mismatch");
      const task = prepareTranslationTask(root, pageId, job.plan.snapshotId, request.chapterId);
      check(task.taskId.slice(7) === request.customId, "DeepSeek task identity mismatch");
      return { chapterId: request.chapterId, units: task.data.units, output: result.output };
    });
    return { provider: "deepseek", pageId, planId, snapshotId: job.plan.snapshotId,
      generation: { model: job.plan.config.model, reasoningEffort: job.plan.config.reasoningEffort }, chapters };
  }
  return { buildDeepSeekTranslation, inspectDeepSeekTranslation, runDeepSeekTranslation, translationReviewMaterial, replaceUncertainTranslation };
}
module.exports = { createTranslationDeepSeek, normalizedOutput, configuration };
