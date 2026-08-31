# Repository agent rules

## Understanding-page Stage 2

- Automated agents must access Stage 2 only through the `ai-knowledge-map-stage2` MCP server.
- Content preparation uses the independent `content-generation` role. A page-locked controller queues one existing, not-yet-human-approved page; it resolves the page's official order and reads the old chapter source only from `docs/deepdive-reviews/<leading-order-digit>x-section-text-review.md`. One fresh Agent then reads only that page's eligible chapters through `stage2_read_content_section`, in source order, and uses the complete exact prompt returned by the task packet and section-read tool for every chapter; never abbreviate, replace, or supplement that prompt.
- The same content-generation Agent must handle every eligible chapter of one page. It must save the complete response for the current chapter before reading the next. It must never read or process chapters titled `常见误解`, `自测`, or `检查你是否真的理解`.
- Content-generation output is written by the controller to `docs/deepdive-reviews/<pageId>-agent-responses.md`. Switching to another node requires a new Agent with no inherited context; never reuse a prior page's Agent.
- Claim at most one task, submit exactly one result, and stop. Never claim a second task in the same Codex run.
- Do not edit official deep-dive files, graph data, audit files, `.stage2/state.json`, or `.stage2/results/` directly.
- The controller is the only writer allowed to publish an understanding page or integrate a new concept node.
- Human-curated full-page candidates must be imported through the page-locked Stage 2 editorial controller. It verifies retained figures and tables, publishes a red-marked review draft, allows at most one repair, limits the following audit to the first audit's findings, and always requires explicit human finalization before approved publication.
- Every restricted controller launch must explicitly choose the `manual-review` action: `publish-provisional` or `hold`. When provisional publication is authorized, the content agent stops first; the page-locked controller then inspects the exact candidate hash, publishes it once with the red provisional marker, verifies the publication state, and stops. Never represent this as L3 Pass.
- Audit agents must not write page content. Write, update, and repair agents must not invent or submit audit evidence.
- Audit agents may inspect project text and gate implementation only through the lease-bound `stage2_search_project` and `stage2_read_project_file` tools. They must not use direct filesystem access or copy old audit answers as their conclusion.
- Repair work may use only the sanitized defects included in its task packet; never search for a private audit answer.
- After the controller accepts the single submission, a scheduled Codex task should archive itself with the Codex task archival tool. Archiving is UI cleanup, not a Stage 2 data operation.
- A paused, busy, or idle response is a normal terminal result for a scheduled run.

The complete operating contract is in `docs/DEEPDIVE_STAGE2_AUTOMATION.md`.
