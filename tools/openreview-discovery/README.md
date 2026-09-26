# OpenReview ICLR discovery and audit

`audit-iclr-proceedings.py` produces a complete, reproducible gate record for
ICLR 2024–2026 main-conference acceptances.

The script uses the final ICLR Proceedings pages as the paper-identity source
and keeps the organizer-reported acceptance counts as a reconciliation control.
It does not treat acceptance, presentation tier, review scores, citations, or
author identity as importance evidence.  Only an exact match to the enabled
year-specific Outstanding Paper winner list advances beyond gate 2.

Example:

```powershell
python tools/openreview-discovery/audit-iclr-proceedings.py `
  --cache-dir proposals/academic-importance/openreview-iclr-2024-2026-20260924/cache `
  --output-dir proposals/academic-importance/openreview-iclr-2024-2026-20260924
```

Run again with `--offline` to verify the saved source snapshots without network
access.
