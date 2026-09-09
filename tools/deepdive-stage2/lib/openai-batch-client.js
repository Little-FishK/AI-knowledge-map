"use strict";

// Deliberately no SDK auto-retries: an uncertain POST must not create a second paid batch.
function createOpenAIBatchClient({ environment = process.env, fetchImpl = globalThis.fetch } = {}) {
  async function request(plan, method, route, body, multipart = false) {
    if (environment.STAGE2_BATCH_LIVE !== "1" || environment.STAGE2_BATCH_APPROVED_PLAN !== plan.planId) {
      throw new Error("Live Batch disabled or exact plan not authorized");
    }
    if (!environment.OPENAI_API_KEY || environment.OPENAI_PROJECT_ID !== plan.config.projectId) {
      throw new Error("Missing API credentials or approved project mismatch");
    }
    const headers = { Authorization: `Bearer ${environment.OPENAI_API_KEY}`, "OpenAI-Project": plan.config.projectId };
    if (!multipart && body !== undefined) headers["Content-Type"] = "application/json";
    let response;
    try {
      response = await fetchImpl(`https://api.openai.com/v1${route}`, {
        method, headers, body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
        signal: AbortSignal.timeout(45000), redirect: "error",
      });
    } catch (_) { throw new Error("OpenAI transport outcome uncertain; reconcile before retrying"); }
    // Never echo server error bodies, which may contain source text or credentials.
    if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}; no automatic retry`);
    const chunks = []; let bytes = 0;
    try {
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > 64 * 1024 * 1024) throw new Error("response-size-limit");
        chunks.push(Buffer.from(chunk));
      }
      const text = Buffer.concat(chunks).toString("utf8");
      return route.endsWith("/content") ? text : JSON.parse(text);
    } catch (_) { throw new Error("OpenAI response unreadable or exceeds local size limit; no automatic retry"); }
  }
  function id(value, prefix) {
    if (typeof value !== "string" || !new RegExp(`^${prefix}[-_][A-Za-z0-9_-]+$`).test(value)) throw new Error("Invalid OpenAI object ID");
    return value;
  }
  return {
    assertAuthorized(plan) {
      if (environment.STAGE2_BATCH_LIVE !== "1" || environment.STAGE2_BATCH_APPROVED_PLAN !== plan.planId
        || !environment.OPENAI_API_KEY || environment.OPENAI_PROJECT_ID !== plan.config.projectId) throw new Error("Live Batch disabled, credentials missing, or exact plan/project not authorized");
    },
    count(plan, body) { return request(plan, "POST", "/responses/input_tokens", { model: body.model, input: body.input }); },
    upload(plan, jsonl, filename) {
      const form = new FormData(); form.set("purpose", "batch");
      form.set("file", new Blob([jsonl], { type: "application/jsonl" }), filename);
      return request(plan, "POST", "/files", form, true);
    },
    create(plan, fileId, attemptId) {
      return request(plan, "POST", "/batches", { input_file_id: id(fileId, "file"), endpoint: "/v1/responses", completion_window: "24h",
        metadata: { translation_plan: plan.planId, translation_attempt: attemptId } });
    },
    retrieve(plan, batchId) { return request(plan, "GET", `/batches/${id(batchId, "batch")}`); },
    list(plan, after) { return request(plan, "GET", `/batches?limit=100${after ? `&after=${encodeURIComponent(id(after, "batch"))}` : ""}`); },
    content(plan, fileId) { return request(plan, "GET", `/files/${id(fileId, "file")}/content`); },
  };
}
module.exports = { createOpenAIBatchClient };
