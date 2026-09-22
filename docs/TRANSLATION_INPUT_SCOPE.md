# Translation input scope v2

New snapshots use `deepdive-en-preparation-v2`. No model, prompt, output schema, writable unit, review gate or pricing configuration changes.

Each request includes the current page term and full approved term records mentioned by the page title, chapter outline, selected context or writable source units. Matching includes Chinese names, canonical English names, aliases, prohibited alternatives and stable IDs; Latin matches use word boundaries and NFKC normalization. Selected records retain all notes and distinctions. This is deterministic lexical selection, not a guarantee of complete semantic relevance; independent bilingual review remains required.

For `outside`, complete chapter ranges are replaced by omission comments. All text and markup outside chapters, including figures/tables and containing wrappers, remain intact. Nested chapters are removed as one outer range. The chapter outline remains available. Normal chapter HTML is unchanged. No arbitrary character truncation is used.

Existing v1 snapshots keep the original full glossary, full outside HTML, task IDs and request structure. Freshness checks still compare source, glossary, resources and approval under the snapshot's own preparation revision. Existing paid plans must not be silently regenerated or migrated. V2 applies when a new snapshot is exported by the authorized controller; a newly started controller loads the changed code.

## Offline check

Using the previously MCP-exported `inference-optimization` page-header task: approved glossary entries decrease from 130 to 3 (llm, tokenization, inference-optimization). Prompt plus serialized user payload decreases from 60,576 to 4,715 JavaScript characters (92.2%). This excludes API message framing and is not a token, billing, latency or quality measurement. Source units and output schema are unchanged. No paid requests were made.

## Verification

Run `npm run test:translation-preparation`. Tests cover alias/forbidden-term matching, Latin boundaries, Unicode normalization, nested sections, outside figure preservation and v1 task/freshness compatibility. The Batch and DeepSeek mock suites also pass. Translation quality after input reduction still requires real-run review; do not claim measured quality parity from these structural tests.
