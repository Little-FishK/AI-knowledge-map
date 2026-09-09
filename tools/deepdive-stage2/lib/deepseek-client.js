"use strict";

// Separate provider credentials and fixed destination. No SDK retries, uploads or hosted Batch emulation.
function createDeepSeekClient({ environment = process.env, fetchImpl = globalThis.fetch } = {}) {
  function assertAuthorized(plan) {
    if (plan.provider !== "deepseek" || environment.STAGE2_DEEPSEEK_LIVE !== "1"
      || environment.STAGE2_DEEPSEEK_APPROVED_PLAN !== plan.planId
      || !environment.DEEPSEEK_API_KEY || environment.DEEPSEEK_ACCOUNT_ID !== plan.config.accountId) {
      throw new Error("DeepSeek disabled, exact plan/account not authorized or credentials missing");
    }
  }
  async function complete(plan, body) {
    assertAuthorized(plan);
    try {
      const response = await fetchImpl("https://api.deepseek.com/chat/completions", {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(plan.config.requestTimeoutMs),
        headers: { Authorization: `Bearer ${environment.DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // Never expose upstream error bodies or exception text (may contain source or credentials).
      if (!response.ok) throw new Error("http-error");
      let bytes = 0; const chunks = [];
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > 16 * 1024 * 1024) throw new Error("response-too-large");
        chunks.push(Buffer.from(chunk));
      }
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch (_) {
      throw new Error("DeepSeek response uncertain or unreadable; automatic resend forbidden");
    }
  }
  return { assertAuthorized, complete };
}
module.exports = { createDeepSeekClient };
