# Workspace maintenance

## Keep the working source separate from deployment copies

- `assets/`, `tools/`, `tests/`, `config/`, and source documentation contain real development work. Untracked files here are not automatically disposable.
- `data/`, deep-dive audits and Stage 2 state are controller-owned. Use the Stage 2 MCP contract for content operations; do not clean or restore these paths manually.
- `site-release/` is a tracked build artifact. It is not necessarily the current production baseline. Do not reset it or remove its untracked files as general workspace cleanup.
- `.tmp/` contains local diagnostics, runners, screenshots and deployment artifacts. Git ignores it, but parts of it are operational dependencies.

## Protected local deployment records

Keep `.tmp/translation-deployments/baseline.json` and the output directory it names. Keep all deployment receipt JSON files. Receipts migrated to `pageContentSha256` verify the live response against the preserved SHA-256 of the original page (normalizing CRLF to LF), so their old full-site outputs can be removed after verification. Unmigrated receipts first read their output directory and otherwise recover the exact page from the recorded Git commit. Do not prune Git history required by these receipts.

The current retained public build and archive are under `.tmp/current-version/`. Its `workspace-checkpoint.json` points to a controller-owned source/runtime backup with an independently verified restore copy. `production-receipt.json` records the exact archived release commit; later website changes do not retroactively update this snapshot. Preserve this directory and the referenced checkpoint. Neither backup contains external service credentials.

The Stage 2 checkpoint tool accepts `prunePrevious: true` only for explicitly requested backup cleanup. It removes recognized old controller checkpoints only after the replacement backup has passed its copy and restore checks. Other runtime/audit records are not old website builds and remain protected.

Keep usage reports, recovery reports and backup directories until an explicit retention policy replaces them. Existing helper scripts may use their current absolute paths, so bulk moves are unsafe too.

## Remove obsolete translation worktrees

Preview from PowerShell:

```powershell
./tools/cleanup-deployment-worktrees.ps1
```

Apply:

```powershell
./tools/cleanup-deployment-worktrees.ps1 -Apply
```

The tool shares the publisher's deployment lock and only considers immediate `checkout-<timestamp>-<id>` directories under `.tmp/translation-deployments/`. It preserves current baseline/release commits, locked worktrees, unmerged commits, and any modified, untracked or ignored files. It removes eligible worktrees through Git without `--force`; branches and their commit history remain available. Each run saves an inventory and result log under `.tmp/workspace-cleanup/`.

The tool uses the locally recorded `origin/gh-pages` history. An outdated local reference conservatively retains newer worktrees. It neither fetches nor publishes.

## Source-control categories (2026-09-22)

Keep translation/controller tooling and tests, interface code and tests, build/deployment tooling,
project documentation/proposals, controller-produced content records, and release artifacts in
separate commits. Recording existing controller output in Git does not approve it, change its
review status, or publish it. Live controller state in `.stage2/state.json` is not part of this
source closeout; do not reset it merely to make `git status` clean.

`site-release/` is fully tracked as the existing 130-page Chinese publication fixture. Its
manifest is verified by `tests/tooling/website-release.test.js`. It is a historical snapshot,
not the current bilingual production version. The manually dispatched `publish-website.yml`
uploads this directory, so do not dispatch it to redeploy the current site without first
preparing the intended complete artifact. This categorization does not trigger deployment.
The current live version remains the `gh-pages` commit referenced by the deployment baseline.

Personal assistant memory, temporary inspection helpers, the local promotion workbook, and
the duplicate Baidu download stay local and ignored. The canonical public ownership proof
is tracked under `config/site-verification/`. Public proposal text is project documentation;
credentials, account sessions, and private user settings do not belong in it.

Before committing generated artifacts, preserve their byte representation (including line
endings) so that a fresh checkout still matches the release manifest. Do not use `git clean`
to hide outstanding source work.
