# Texture detail threshold

The bundled Cytoscape canvas renderer uses ceil(log2(zoom * pixelRatio))
to select element and layer texture levels and calculate text visibility.
With the application's pixelRatio of 1, level 1 previously began above 100%.

The local vendor patch promotes effective scales at or above 0.8 to at least
level 1. All three calculations are synchronized. Lower scales and levels
above 1 retain the original behavior. This does not increase canvas pixelRatio.

When upgrading Cytoscape, reapply or replace this patch and run
`node tests/app/texture-threshold.test.js`. The prior vendor file in Git is
the rollback source; no graph layout or content changes are needed.

The 80% threshold patch was published as `36d1bfc`; live manifest and vendor
hashes were verified. Publication rollback tag:
`codex/pre-texture-threshold-20260913` in the publishing checkout.

## Local text clarity follow-up

The native graph canvas now uses pixelRatio 2 for labels and graph strokes.
The decorative artwork canvas remains at pixelRatio 1 with its drag cache.
Core and all-node views were checked in a browser at 80% zoom; canvas ratios
were verified and screenshots reviewed. Native canvas pixel area increases
fourfold, so device-specific drag performance should be checked in preview.
This follow-up is separate from the published threshold patch.
