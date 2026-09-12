# Ring repaint scheduling — 2026-09-12

Before changing the renderer, its source and existing ring browser test were
committed as `5bb53af` in the project repository. Other unrelated working changes
were not included. Tag: `codex/pre-ring-scheduler-20260912`.

The same tag in `.tmp/public-reading-publish-20260912` identifies the complete
previous public release, `9c2851d105e91ac31d063bbeb1e87fb23870d90b`.

The optimization changes only `assets/app/graph-view.js`: map render events mark
the ring layer dirty; a single animation-frame loop paints it. Idle rotation
retains the 30 Hz target. Rotation rates and hover effects are unchanged.

Validation: a burst of 30 map render events produces zero synchronous ring
paints and exactly one paint on the next animation frame; onboarding/browser
regression and ordinary/official ring visual tests pass, including reduced motion.
This verifies scheduling and appearance, not a guaranteed device-wide FPS gain.

## Rollback

Restore only `assets/app/graph-view.js` from source commit `5bb53af`, then rebuild
using `node tools/build-website.js production` and the established controller
publication workflow. Verify and promote the build, commit the restored public
renderer and release manifest in the isolated publishing checkout, and push
normally to `gh-pages`. Do not reset the main workspace or force-push: other
unrelated edits and subsequent releases must remain intact.
