# Translation review hardening — 2026-09-13

This change modifies controller implementation and synthetic tests only. It does not rewrite previous audits, grant new repair attempts, spend provider budget, or publish pages.

## Review convergence

The controller derives finding history from accepted reviews and repair receipts. Findings are labelled new, unresolved, new-on-repaired-unit, or disputed-after-repair. A finding on a previously repaired unit under the same rule triggers manual adjudication before another automatic repair. This is a conservative conflict signal, not a claim that the latest reviewer is wrong. Both assessments remain available in diagnostics. Source ambiguity is explicitly distinguished from a requirement to add a narrower interpretation.

Review packets include exact repeated-source groups and require a final full-page terminology/title/reference sweep. Repeated long source/translation quotations in terminology findings are checked for omitted locations before acceptance. Missing locations reject the report and return precise feedback; the controller never fabricates additional findings. Repairs must cover all authorized units and cannot touch other units. New findings remain blocking and are labelled separately from repeated findings; full-page verification and existing repair limits remain in force.

These measures cannot prove that a model found every semantic defect in one pass. Conservative repeated-occurrence or conflict checks can require human review, including when identical phrases have different contextual meanings. No automatic adjudicator has been added.

## Output reliability

Only complete JSON objects are decoded; a complete Markdown JSON fence is accepted as a transport wrapper. Truncated JSON, invalid shapes, ungrounded quotes and short evidence remain errors. JSON/shape failures now have explicit review-contract diagnostics and feed the bounded retry path. No controller-authored rationale, guessed JSON repair, or fabricated citations are allowed. Successful validated submissions clear stale lastError while preserving historical errors and costs. Received responses remain saved before parsing. Existing uncertain-request protection, budget ceiling and retry limits are unchanged.

## Browser validation

The controller waits for fonts and layout, then tests 1440, 768, 390 and 320 CSS-pixel widths. Alongside canvas overflow and navigation/resource checks, it tests SVG label bounding-box collisions, labels spilling outside a candidate rectangle in the same SVG group, and article text clipped by hidden/clip containers. Intentional scroll containers remain supported. Failure diagnostics include viewport, text and geometry. Diagram semantics, arrow meaning, raster figures and arbitrary artistic SVG layouts still need separate review; geometric checks are not a semantic visual audit.

The new 768-pixel test found a real shared-header overflow. Reading-page header wrapping now starts at 1100 pixels. No reading content was modified.

## Verification and rollback

Passed synthetic controller tests: translation-quality (18 groups), translation-campaign (including malformed JSON recovery), translation-review-hardening, translation-review-correction, translation-reliability, translation-diagnostics, translation-qa and translation-auto-publication. Real headless Edge tests passed: translation-layout-browser and translation-auto-browser (all four viewport widths). No new live DeepSeek campaign was executed.

Pre-edit working copies are in `.tmp/translation-review-backup-20260913/`, with SHA-256 inventory in `.tmp/translation-review-backup-20260913-hashes.json`. HEAD at backup was `ee2b6cd1c8fb07a3a682def57168099db7b26bcd`. Restore only corresponding changed files from that directory; do not reset the entire dirty repository. Newly added files are `translation-review-ledger.js`, `translation-layout-checks.js`, their new hardening/layout tests and this document. Production Stage 2 records are not part of this rollback.
