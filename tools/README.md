# Tooling layout

`tools/` contains executable project workflows. Implementations are grouped by
domain; commands should use their canonical domain paths directly.

## Directories

- `shared/`: project-wide path and process helpers with no domain state.
- `validators/`: graph, deep-dive, software, tutorial, video-application, and
  library validation implementations.
- `deepdive/quality/`: L2/L3/browser audits, L4 review validation, and their
  shared audit-contract modules.
- `deepdive/runtime/`: page loading and runtime build support shared across
  deep-dive workflows.
- `deepdive-stage2/`: the protected Stage 2 controller and MCP implementation.
- `video-ingest/`: video proposal, review, application, and rollback workflows.
- `proposals/`: generated or reviewed ingestion artifacts; these are not
  executable source files.

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

The Stage 2 implementation is migrated last. Its state, lease, capability, and
publication contracts must remain unchanged throughout the tooling refactor.
