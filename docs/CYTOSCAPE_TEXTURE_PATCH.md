# Texture detail threshold

The bundled Cytoscape canvas renderer uses ceil(log2(zoom * pixelRatio))
to select element and layer texture levels and calculate text visibility.
With the application's pixelRatio of 1, level 1 previously began above 100%.

The custom 80% promotion has been removed at the user's request. Element,
layer and text calculations now use the original Cytoscape expressions.
The native graph canvas retains pixelRatio 2; its normal texture caching
still adapts to zoom, without an additional 80% rule.

When upgrading Cytoscape, do not reapply the removed patch. Run
`node tests/app/texture-threshold.test.js` to verify native cache calculations.

The 80% threshold patch was published as `36d1bfc`; live manifest and vendor
hashes were verified. Publication rollback tag:
`codex/pre-texture-threshold-20260913` in the publishing checkout.

## Text clarity

The native graph canvas now uses pixelRatio 2 for labels and graph strokes.
The decorative artwork canvas remains at pixelRatio 1 with its drag cache.
Core and all-node views were checked in a browser at 80% zoom; canvas ratios
were verified and screenshots reviewed. Native canvas pixel area increases
fourfold, so device-specific drag performance should be checked in preview.
The 2x canvas and 1350ms edge recovery were published as `b8a075b`.
The subsequent local adjustment halves recovery to 675ms, with cleanup at
725ms, and removes the custom texture threshold. Fade-out remains 600ms.
