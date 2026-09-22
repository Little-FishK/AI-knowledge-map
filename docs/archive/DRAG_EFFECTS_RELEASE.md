# Drag effects trial — 2026-09-12

Rollback tag in the source and publishing repositories:
`codex/pre-drag-effects-20260912`.
Source baseline: `b400e400b72427afec7bcc601712b12a0e67e082`.
Public baseline: `33d40f4a326d52fcfc37d6be7fe95fa5d72289db`.

Only actual pointer-held viewport panning activates this optimization. Decorative
ring angles stop advancing, hover emphasis clears, and the ring layer repaints
only when invalidated by the moving map. Edges and their labels fade out in
160 ms and become non-visible after 180 ms without changing graph layout.
Release restores original edge styles and rotation. Pointer cancellation, window
blur and document hiding clear the temporary state as well.

Validation: onboarding/browser regression plus ordinary and official ring pixel
tests, each with reduced motion on/off. Actual pointer dragging changes the pan,
freezes ring pixels while held, hides edges, and restores rotation/edges after
release. Blur cancellation also restores edges. These checks establish behavior;
no device-specific frame-rate improvement is claimed.

To roll back this trial, restore only `assets/app/graph-view.js` from the source
baseline, rebuild through `node tools/build-website.js production`, verify the
artifact and follow the normal publication workflow. Never reset unrelated
workspace changes or force-push the public branch.

Published with explicit user authorization as `f6be6cf` on `gh-pages`.
The live release manifest and renderer hash were verified against the tested build.
Cached node images and reduced render resolution are outside this first trial.
