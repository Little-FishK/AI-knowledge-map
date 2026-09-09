---
name: ai-knowledge-map-node-translation
description: Translate one or more AI Knowledge Map graph-node records from the authoritative Simplified Chinese graph into the English content overlay, using the project terminology registry, official learning order, whole-record fallback contract, semantic gates, and browser verification. Use only for graph node cards/details; do not use for Stage 2 understanding pages or other site content types.
---

# AI Knowledge Map Node Translation

Translate the requested graph nodes into publishable English without changing the authoritative Chinese graph or graph topology.

## Scope and invariants

- Work from the AI Knowledge Map repository root. Read `AGENTS.md` before acting.
- This skill handles records in `data/graph.js` that are published through `data/content-locales/en/graph.js`.
- Never edit `data/graph.js`, graph shards, node IDs, edge topology, coordinates, official learning-path structure, or Stage 2/deep-dive files.
- Do not translate or run the understanding-page Stage 2 workflow. That is a separate controlled process.
- Keep `zh-Hans` authoritative. English is a complete-record overlay: publish all required fields together or keep the node on Chinese fallback.
- Preserve every `[[concept-id]]` target, source URL, source anchor, date, enum, and other stable identity exactly. Localize only visible prose and link labels.
- Use `data/locales/terminology.js` as the only English naming authority. A published node needs an `approved` terminology entry, and its title must exactly equal `displayTitle`.
- Treat aliases as language-specific semantic choices, not structural copies. Do not promote examples, components, or subtypes into aliases.
- Preserve existing user changes. Do not commit, deploy, or publish externally unless the user requests it.

## Required workflow

Read [references/translation-workflow.md](references/translation-workflow.md) completely before selecting or translating nodes. Follow all 15 steps for every requested batch.

Read `docs/TERMINOLOGY.md` before editing terminology and the relevant current sections of `docs/I18N.md` before updating coverage or fallback checkpoints.

If the user gives a count but no IDs, select the next unpublished nodes in `GRAPH.recommendedLearningPath` order. Report the chosen IDs before editing. If the user gives IDs, keep that selection unless an ID is missing or already published; explain any substitution rather than silently changing scope.

## Completion contract

A batch is complete only when:

- every selected node has one full `published` English record;
- terminology, record structure, source alignment, and internal references pass automated gates;
- the published-set regression test and the next whole-record fallback checkpoint are updated;
- actual language switching and per-node detail rendering have been exercised in a browser;
- the final report separates node-body coverage from any Chinese that comes from untranslated neighboring nodes or relation-instance labels;
- test results, coverage counts, remaining count, and Git commit state are stated accurately.

Stop and report a concrete blocker if authoritative terminology cannot be resolved, the Chinese source is internally inconsistent, or safe browser verification is unavailable. Do not lower quality, shorten records, omit cases, or weaken tests to satisfy a requested node count.
