# Translation review v2

The batch campaign now defaults to defect-focused review. Existing legacy audits and reports remain unchanged. No per-unit rationale or quotes are generated for units with no findings; the model explicitly returns each assigned unit key once. Findings still require grounded source/translation quotes, a concrete explanation, MQM classification and severity. Explanation character-count minima are removed in v2; empty explanations remain invalid. Coverage declarations are evidence of model output, not proof of perfect semantic inspection.

## Execution

1. Derive a deterministic plan from the current material revision. Each unit batch has at most 60 units and ordinarily at most 12,000 source+translation characters; one oversized unit stays intact. Preserve source order.
2. Every independent request receives the complete bilingual page context once, with unit keys and kinds, glossary, warnings and source concerns. No repeated per-unit output templates or previous reviewer answers. The batch prompt identifies which units require detailed inspection.
3. Save each validated response in controller storage. A malformed response retries only its batch, with at most two contract failures before holding. Aggregate historical errors and costs are preserved.
4. After all unit batches, run a separate independent whole-page consistency pass. It also receives the Chinese HTML structure and repeated-source groups. It can report defects in any unit. All findings from earlier batches remain blocking; the consistency pass cannot silently erase them.
5. Only after every batch and the consistency pass has validated does the controller aggregate a v2 audit. It stores actual coverage declarations and response hashes; it never manufactures legacy per-unit quotes or rationales.
6. Source/revision, scope, reviewer separation, defect grounding and classification, repair limits, numeric/markup checks, budget/uncertain-request protection and resource/browser gates remain enforced. A content repair invalidates all batch results for the old revision; archived receipts remain available.

`summary` may be empty in unit batches and must be nonempty for consistency. The report is exactly `{batchId, checkedUnitKeys, findings, summary}`. The batch ID binds phase, scope and revision. Partial batch results are not publication approval and cannot be replaced by a legacy full-page submission.

## Existing campaigns

An operator may set `STAGE2_REVIEW_V2_CAMPAIGN` to the exact campaign ID when invoking the existing MCP campaign launcher. Migration refuses in-flight/uncertain requests, reuses existing translations, and resumes only contract-failed pages awaiting review. It does not change accepted legacy audits, reopen semantic disputes, grant extra content repairs, or erase billing/history. Repeated migration is idempotent. Per-batch contract retry counts are separate from cumulative historical failures. Keep the existing spending limit when resuming.

The full-page context is retransmitted for each batch, so total input and request counts may increase. The goal is much smaller and more reliable outputs, local retries and observable progress; no measured latency improvement is claimed before live evaluation. A synthetic 125-unit clean report fell from 15,146 to 2,339 bytes across all batch responses (about 85% smaller), not a measurement of live token cost or translation quality.

## Verification / rollback

Run `npm run test:translation-quality`. Tests cover batch bounds and exact coverage, wrong revisions/batch IDs, grounded findings, partial-result persistence, consistency failures retrying only that batch, reviewer/repair separation, revision invalidation, legacy compatibility and explicit migration without translating again. Publication and diagnostics regressions are checked separately.

Pre-edit copies of affected existing controller/test files and package.json are in `.tmp/review-v2-backup-20260913/`. Restore only relevant files; never roll back production audit/billing state. New files: `translation-review-batches.js`, `translation-review-batches.test.js`, and this document.
