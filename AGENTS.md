# Repository agent rules

## Understanding-page Stage 2

- Automated agents must access Stage 2 only through the `ai-knowledge-map-stage2` MCP server.
- Claim at most one task, submit exactly one result, and stop. Never claim a second task in the same Codex run.
- Do not edit official deep-dive files, graph data, audit files, `.stage2/state.json`, or `.stage2/results/` directly.
- The controller is the only writer allowed to publish an understanding page or integrate a new concept node.
- Audit agents must not write page content. Write, update, and repair agents must not invent or submit audit evidence.
- Audit agents may inspect project text and gate implementation only through the lease-bound `stage2_search_project` and `stage2_read_project_file` tools. They must not use direct filesystem access or copy old audit answers as their conclusion.
- Repair work may use only the sanitized defects included in its task packet; never search for a private audit answer.
- After the controller accepts the single submission, a scheduled Codex task should archive itself with the Codex task archival tool. Archiving is UI cleanup, not a Stage 2 data operation.
- A paused, busy, or idle response is a normal terminal result for a scheduled run.

The complete operating contract is in `docs/DEEPDIVE_STAGE2_AUTOMATION.md`.
