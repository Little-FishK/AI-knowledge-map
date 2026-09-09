# Fifteen-step graph-node translation workflow

Use this checklist for every requested batch. The unit of publication is a complete graph-node record.

## 1. Establish the batch

Read `data/graph.js` without editing it. Resolve the requested IDs or, when only a count is supplied, choose the next unpublished IDs in `GRAPH.recommendedLearningPath` order. Confirm that each ID exists and is not already published.

Why: stable selection prevents cherry-picking easy nodes and preserves the designed learning sequence.

## 2. Capture the complete Chinese source

For each selected ID, inspect its title, aliases, summary, complete body, cases, activity, sources, and all `[[concept-id]]` references. Record source counts and anchors before translating.

Why: the English overlay must not silently omit difficult fields or detach evidence.

## 3. Identify terminology decisions

Extract the page title and important reusable concepts. Inspect existing entries and references in `data/locales/terminology.js` and the rules in `docs/TERMINOLOGY.md`.

Why: terminology must be decided before prose is written, not normalized inconsistently afterward.

## 4. Verify uncertain terms with authoritative sources

Use current primary or authoritative sources when a term, capitalization, hyphenation, acronym, or concept boundary is uncertain. Prefer standards, official glossaries, original papers, and official product documentation. Record only sources actually consulted; do not claim a standards review that did not occur.

Why: this separates project preference from externally verified usage and reduces plausible-but-wrong translations.

## 5. Approve the terminology entry

Update the node entry with `displayTitle`, decomposed `canonicalTerms` when the page combines concepts, legitimate `acceptedAliases`, misleading forms in `avoid`, context, boundary notes, actual references, `status: "approved"`, and the truthful `standardsReview` state. Add a source-registry entry only when needed.

Why: published content is gated by an explicit, reviewable naming decision.

## 6. Translate the title and aliases

Set the node title exactly to the approved `displayTitle`. Translate aliases independently for English. Remove Chinese aliases and exclude related-but-distinct techniques, components, implementations, or subtypes.

Why: aliases affect search and discovery, so false synonyms are functional defects.

## 7. Translate the summary

Write a concise English summary that preserves the Chinese source's central claim, scope, and important limitation. Do not add unsupported promises or collapse a nuanced statement into marketing language.

Why: the summary is a high-visibility conceptual contract for the page.

## 8. Translate the complete body

Translate every paragraph, heading, list, table, emphasis marker, formula explanation, and contrast in the source body. Preserve pedagogical order and causal logic while using natural English. Do not summarize, pad, or import claims merely because they appear in external terminology sources.

Markdown tables are parser-sensitive. Inside a Markdown table cell, never use a labeled Wiki link of the form `[[concept-id|visible label]]`: its pipe can be parsed as a column separator and expose broken Wiki markup in the rendered page. Use `[[concept-id]]` instead and let the localization runtime supply the translated node title. Preserve the table's intended row and column structure.

Why: semantic fidelity depends on reasoning structure, not sentence-by-sentence word substitution.

## 9. Preserve internal links semantically

Keep every `[[concept-id]]` target exactly. Translate only optional visible labels, such as `[[attention|attention]]`. The multiset of referenced IDs in the English record must equal the source record.

Why: IDs encode knowledge-graph identity and navigation; changing or dropping them breaks meaning and links.

## 10. Translate every case

Preserve the source case count and order. Translate every case title and full text, including setup, mechanism, result, caveat, and any internal references.

Why: examples are part of the teaching content and cannot be sacrificed to finish a batch faster.

## 11. Preserve activity and source evidence

When the source contains visible activity text, translate the visible prose while preserving dates and identity fields. Preserve source count, URLs, reference values, and anchors exactly; keep official paper and product titles in their official form unless the schema provides a separate display translation.

Why: evidence provenance is shared data, not freeform translation material.

## 12. Perform a node-level semantic audit

Before publishing, compare source and target for each ID:

- all required fields are present;
- case and source counts match;
- source URLs/anchors and stable values match;
- internal reference IDs match;
- no Han characters remain in the translated node record;
- terminology is consistent and avoided forms are absent;
- no Markdown table cell contains a labeled Wiki link with an internal pipe, and table rows retain their intended column count;
- explanations remain correct and readable in context.

Correct defects rather than weakening the checks.

## 13. Publish the overlay and update bookkeeping

Add the full record under `data/content-locales/en/graph.js` with `status: "published"`. Update truthful revision metadata, the explicit published-node regression set, official-path coverage assertions, the next unpublished fallback checkpoint, inventory counts, `README.md`, `docs/I18N.md`, and `docs/TERMINOLOGY.md` when their stated totals change.

Why: content, runtime metadata, tests, and public progress claims must move together.

## 14. Run automated gates

At minimum run:

```text
node --check data/content-locales/en/graph.js
node --check data/locales/terminology.js
npm run test:terminology
npm run test:content-i18n
npm run i18n:inventory
npm run test:i18n
npm run test:routing
npm run validate
npm run test:app
git diff --check
```

Also run a per-batch comparison for selected IDs covering status, approved terminology, exact title match, Han-character absence, case/source parity, source anchors, internal-reference equality, and the absence of `[[concept-id|visible label]]` inside Markdown table cells. Do not treat a test that failed and was not rerun as passing.

Why: different gates catch schema, naming, semantic-link, fallback, and integration failures.

## 15. Exercise the real UI and report honestly

Start a local preview without deploying. In a real browser:

1. Open the map.
2. Open Settings and choose English.
3. Confirm the interface changes immediately and the preference is retained.
4. Search for and open every selected node, closing the previous detail before searching for the next.
5. Check the visible title, aliases, summary, body, cases, scrolling, and layout. For every rendered table, confirm that rows and columns remain aligned and that no raw `[[`, `]]`, or partial Wiki-link text is visible.
6. Open the next unpublished fallback node and confirm it remains a complete Chinese record.
7. Check browser errors and warnings.

Account for debounced search rather than assuming an attempted key press selected a new node. Verify the visible heading after every selection.

The final report must list the translated IDs and titles, automated and browser-test outcomes, new coverage totals, remaining nodes, any visible mixed-language content from untranslated neighbors or custom edge labels, files changed, and whether the work was committed. Browser QA is incomplete if the environment cannot perform it; say so explicitly instead of claiming success.
