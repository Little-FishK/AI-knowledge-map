# ACL Anthology candidate audit

This tool reads the official ACL Anthology XML snapshot, constructs the 2024–2026 three-route candidate union defined in `docs/ACL_ANTHOLOGY_COLLECTION_POLICY.md`, deduplicates records, and applies the academic-importance gates with early stopping.

```powershell
& 'C:\Users\Lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' tools/acl-anthology-discovery/audit-candidates.py `
  --anthology-root .tmp/acl-anthology-official `
  --output proposals/academic-importance/acl-anthology-2024-2026-20260924
```

The output keeps one JSONL record per candidate. A gate-2 deferral does not claim that the paper abstract or full text received semantic review.
