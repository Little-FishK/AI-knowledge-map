---
name: publish-stage2-provisional-page
description: >-
  Run the repository's complete page-locked Stage 2 workflow for one explicitly
  named official-recommendation node: generate chapter-by-chapter knowledge
  responses with a fresh content-generation subagent, import the hash-bound
  candidate, audit it, allow at most one repair and scoped verification, and
  either publish a red provisional review page or hold at manual review. Use
  for one-node understanding-page preparation, safe resumption, or scheduled
  Stage 2 runs. Never use it to grant final human approval.
---

# Publish a Stage 2 Provisional Page (opencode)

Use the `stage2` MCP server (`ai-knowledge-map-stage2`) as the only Stage 2 interface. Process exactly one existing official-recommendation node per invocation, resume safely from its controller state, and stop after the requested manual-review action. Never represent provisional publication as L3 Pass or final approval.

## Required input

Require both values before doing any mutating work:

- An explicit official recommendation order, such as `2.2`.
- An explicit `manual-review` action: `publish-provisional` or `hold`.

If either value is missing, ask for it with the question tool. Do not choose a page or publication action implicitly. Treat the user's order label as an official recommendation order, not as a page ID; resolve the page ID through the controller.

## Execute the workflow

Read [references/workflow.md](references/workflow.md) completely before acting. Follow its state-aware procedure and terminal rules exactly.

At a high level:

1. Resolve the requested order with `stage2_resolve_recommended_page` to exactly one existing page and inspect its Stage 2 state. Do not use the next-page scanner for an explicitly requested node.
2. If content generation is incomplete, enqueue the page and spawn one fresh `stage2-content-generation` subagent (opencode Task tool). That same subagent must process all eligible chapters in source order, use the exact chapter prompt defined in [references/workflow.md](references/workflow.md), save each complete response before reading the next, submit once, and stop.
3. Import the controller-owned response document with `stage2_import_editorial_candidate` and `useContentGenerationOutput: true`. Do not construct or edit the candidate directly.
4. Spawn fresh role-locked audit or repair subagents only as directed by controller state. Audit cannot edit content. Repair receives only sanitized defects. Permit at most one repair, followed by verification limited to the first audit's findings.
5. At `manual-review`, apply the explicit action. For `publish-provisional`, inspect, use the exact returned candidate hash once, re-inspect, require `published-provisional`, and stop. For `hold`, report the candidate hash, blockers, and publication state without publishing, then stop.

## Hard boundaries

- Claim at most one task and submit exactly one result in each worker run. Never claim a second task.
- Switching nodes always requires a new worker subagent with no inherited context.
- Never directly read or write `.stage2/state.json`, `.stage2/results/`, audit files, official deep-dive files, or graph data. The controller is the only publisher.
- Never read or process chapters named `常见误解`, `自测`, or `检查你是否真的理解`.
- Never bypass rejected validation with filesystem edits or command-line fallbacks.
- Never call final human approval/finalization. This skill ends at red provisional publication or held manual review.
- Treat `paused`, `busy`, and `idle` as normal terminal results. Report them and stop.
- The opencode MCP deployment does not carry Codex's per-profile tool allowlist or page-lock environment; enforce the role boundaries above with the state machine and these instructions, and never let a worker invoke controller-only tools.

For reusable invocation text, read [references/scheduled-prompts.md](references/scheduled-prompts.md).
