# Translation format normalization

The reviewer now returns `completed`, `findings`, and `summary`. A trusted campaign
request binds its completed response to the exact revision, batch and assigned
scope. The controller retains raw provider responses, raw parsed evidence and
normalization records. A missing or false completion declaration is rejected.
Legacy explicit batch/coverage responses remain strictly validated; mismatched
identities are never silently overwritten.

`wholePageRationale` can be renamed to `summary` only when the latter is absent.
Complete JSON fences are already handled by the transport decoder. Truncated
JSON, ambiguous fields, unsupported severity and ungrounded quotes remain errors.

Grounded findings from another unit in the same supplied page are retained, but
do not count as that other batch's coverage. Accepted batches are preserved when
a later batch fails; only the rejected batch is requested again. Individual
findings within an invalid batch are not yet independently accepted or patched.

Numeric normalization supports Chinese 千/万/亿, 百万, English magnitude words,
approximate millions/billions, and written zero when the source contains numeric
0. Approximate quantities remain distinct from exact quantities. Numeric checks
do not replace semantic review of counts, fragment boundaries, units or formulas.

SVG presentation continues to use the existing exact-text wrapping, box layout
templates, horizontal scrolling and four-width browser verification. Unknown
diagram layouts remain held rather than guessed or silently clipped. This change
does not implement a universal SVG layout engine or automatically rewrite audits.

Validation includes actual read-only MCP rechecks of attention, backprop and cnn:
their numeric-format blockers are cleared, while independent semantic review is
still pending. No production content or audit state was edited directly.
