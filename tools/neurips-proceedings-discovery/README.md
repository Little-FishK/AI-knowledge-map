# NeurIPS Proceedings candidate pool

Build the 2024–2026 candidate pool defined in `docs/NEURIPS_PROCEEDINGS_COLLECTION_POLICY.md` from official final Proceedings indexes.

```powershell
node tools/neurips-proceedings-discovery/build-candidate-pool.js `
  --output proposals/academic-importance/neurips-proceedings-2024-2026-20260924
```

The command saves the official index HTML, hashes each source, preserves every paper's original track, writes one JSONL candidate per paper, and records unavailable 2026 Proceedings endpoints. It does not perform the six-step importance review.

Recheck the saved snapshot without network access:

```powershell
node tools/neurips-proceedings-discovery/build-candidate-pool.js `
  --output proposals/academic-importance/neurips-proceedings-2024-2026-20260924 `
  --offline
```

Apply the academic-importance mechanism with gate-2 early stopping:

```powershell
node tools/neurips-proceedings-discovery/audit-candidates.js `
  --input proposals/academic-importance/neurips-proceedings-2024-2026-20260924/candidates.jsonl `
  --output proposals/academic-importance/neurips-proceedings-2024-2026-review-20260924
```

The audit writes one result per candidate. Only exact matches to an enabled main-track Best Paper winner proceed through all six steps; Runner-up and other-track awards remain discovery evidence.
