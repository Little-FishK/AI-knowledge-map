# Tooling layout

`tools/` contains executable project workflows. Implementations are grouped by
domain; root-level JavaScript files are legacy-compatible command entrypoints
while callers migrate to the grouped paths.

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

Tests are moving to the top-level `tests/` directory by domain. Tooling-specific
documentation belongs in `docs/` unless it must remain next to an executable.

## Migration contract

1. Move one domain at a time without changing its behavior.
2. Keep the previous command path as a thin compatibility entrypoint.
3. Resolve repository files through `shared/project-root.js`, not by counting
   parent directories from the implementation file.
4. Update package scripts and internal callers only after both paths pass the
   same tests.
5. Remove compatibility entrypoints only after CI, MCP configuration, scheduled
   controllers, tests, and documentation no longer reference them.

The Stage 2 implementation is migrated last. Its state, lease, capability, and
publication contracts must remain unchanged throughout the tooling refactor.
