# Review artifacts

This directory contains project-owned review and ingestion artifacts that are
useful for audit history but are not executable tooling or runtime website data.

- `ingest/`: human-readable ingestion proposals.
- `video-ingest/`: video proposals, editorial reviews, calibration baselines,
  shadow-review results, and node-package previews.

Large source media, transcripts, frames, temporary packets, application plans,
and rollback receipts belong in the external `video/raw` local-data directory.
Run `npm run local-data:paths -- videoRaw` from the repository to locate it.
