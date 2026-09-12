# Side curtains trial — 2026-09-12

Rollback tag in source and public checkout: `codex/pre-map-curtains-20260912`.
Restore only `assets/app/graph-view.js` and `assets/style.css` from that source tag
to undo this trial, then rebuild through the Stage 2 website controller and verify
the public artifact before normal publication. Do not reset unrelated changes.

Curtains use map-viewport proportions approximated from the supplied screenshot:
opaque at 0–22% and 86–100%, fading at 22–28% and 80–86%. Their background matches
the dark map. They do not intercept pointer events or cover toolbar/sidebar UI.

Viewport changes update a transient visibility class. Conservative node and label
bounds use coordinates and font size independent of rendered visibility. Fully
covered nodes skip native drawing and custom artwork drawing; cached artwork is
released. Edges whose endpoints lie behind the same curtain are hidden; crossing
edges remain intact. No source graph records or coordinates are changed.

Validation: reveal a previously occluded node by panning, verify unchanged graph
coordinates; preserve relationship selection when toggling introduction; desktop,
mobile and onboarding regression; ordinary/official ring and reduced-motion tests.
Artifact verification passes. No device-specific FPS improvement is claimed.

Status: local preview only. Explicit authorization is required before publication.
