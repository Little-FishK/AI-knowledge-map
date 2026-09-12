# Node cache and pixel ratio trial — 2026-09-12

Rollback tag in both repositories: `codex/pre-cache-resolution-20260912`.
Restore only `assets/app/graph-view.js` from that source tag to reverse this trial,
then rebuild through the controller and follow the verified publication workflow.
Do not reset unrelated workspace changes or force-push the public branch.

Both Cytoscape and the decorative canvas now use pixel ratio 1. Compared with
the previous cap of 1.5, this reduces canvas pixel count by 55.6% on screens that
previously reached that cap. It can soften rendering on high-density displays;
there is no measured device-independent FPS claim.

During viewport dragging, each visible node's face, fixed ring and official-order
number or support gradient is rasterized into a temporary canvas. Repaints reuse
that image until its scale, angle, classes, opacity or official order changes.
Caches are discarded when the gesture ends and when the renderer is destroyed.

Validation: onboarding regression; ordinary and official ring pixel tests with
deviceScaleFactor 2 and reduced motion on/off; ring canvas resolution assertion;
cached drag redraw performs zero canvas rotations; pause/resume, hover, edge
fade/restore and interrupted gestures pass. Built artifact verification passes.

Status: local preview only, pending publication authorization.
