# Tooling layout

`tools/` contains executable project workflows. Implementations are grouped by
domain; commands should use their canonical domain paths directly.

## Local website

Double-click `启动网站.cmd` in the repository root to start the site on a
loopback-only HTTP address and open it in the default browser. The launcher
reuses the project server when it is already running, otherwise it selects an
available port starting at 8940. Use `tools/start-local-site.ps1 -NoOpen` when
the server should start without opening a browser window.

## Directories

- `graph/browser/`: optional browser-console layout experiments (`find-seed.js`, `dump-positions.js`); these are not production commands. Apply graph changes only through the authorized controller.
- `graph/gen-disc-layout.js`: deterministic layout generator; callers and tests use this canonical path.
- `deepdive/migrations/`: historical migration utilities, not the current content publication pipeline. Automated content changes still require the Stage 2 MCP controller.

- `shared/`: project-wide path and process helpers with no domain state.
- `graph/`: read-only graph storage diagnostics, canonical semantic
  fingerprinting, guarded shard-shadow generation, fail-closed dual-read validation,
  authoritative shard transactions, and deterministic `data/graph.js`
  materialization used by every official graph writer.
- `validators/`: graph, deep-dive, software, tutorial, video-application, and
  library validation implementations.
- `deepdive/quality/`: L2/L3/browser audits, L4 review validation, and their
  shared audit-contract modules.
- `deepdive/runtime/`: page loading and runtime build support shared across
  deep-dive workflows.
- `deepdive-stage2/`: the protected Stage 2 controller and MCP implementation;
  `core.js` is the stable public facade and `lib/` contains internal storage,
  audit access, content generation, editorial candidate construction/import,
  editorial candidate validation, result submission/state transitions,
  controller lifecycle/state commands, task queue/lease orchestration,
  content-generation/new-node queue commands, candidate gate execution, review
  recovery/preview, manual-review workflows, audit rules, publication
  transactions, and editorial rendering.
- `video-ingest/`: video proposal, review, application, and rollback workflows.

Generated or reviewed ingestion artifacts live in the top-level `artifacts/`
directory. Local media, transcripts, frames, dependency caches, Stage 2 private
results, previews, events, and logs live under the external local-data root.
Run `npm run local-data:paths` to display the resolved directories. Override the
default with `AI_KNOWLEDGE_MAP_DATA_DIR` when required.

Tests live in the top-level `tests/` directory, grouped into `app/`, `deepdive/`,
`stage2/`, `tooling/`, and `video-ingest/`. Tooling-specific documentation
belongs in `docs/` unless it must remain next to an executable.

## Migration contract

1. Move one domain at a time without changing its behavior.
2. Update internal callers, package scripts, CI, and documentation to the new path.
3. Resolve repository files through `shared/project-root.js`, not by counting
   parent directories from the implementation file.
4. Run the domain tests before removing or renaming the previous implementation.
5. Search CI, MCP configuration, scheduled controllers, tests, and documentation
   for stale paths before completing a migration.

Stage 2 is refactored behind its existing `core.js` facade. Its state, lease,
capability, and publication contracts must remain unchanged while internal
responsibilities move into focused modules.
