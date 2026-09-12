# Circular curtain and background-press fade trial

Rollback tag in both source and publishing repositories:
`codex/pre-round-curtains-20260912`. Restore only `assets/app/graph-view.js` and
`assets/style.css` from the source tag, rebuild through the website controller,
verify, and follow the normal publication workflow. Keep unrelated work intact.

The visible area is now a centered circle, with radius half the shorter map
viewport dimension. Its inner 78% is clear and the remaining radius fades to
the map background. Conservative node/label bounds outside the outer circle
are culled; horizontal crossing-edge preservation remains in place.

Background or edge pointer-down begins the interaction effects before any pan.
Node presses retain their selection behavior. Edge opacity transitions over
600 ms (previously 160 ms); visibility is removed after 650 ms, and release or
cancellation restores edges and decorative animation.

Validation: desktop/mobile onboarding and introduction regression; circular
curtain screenshot inspection; ordinary/official rings with reduced motion on/off;
background press starts fading without changing pan, edges remain in the fade
phase at 200 ms, actual drag and release recover correctly. Artifact verified.

Status: local preview; not yet published.
