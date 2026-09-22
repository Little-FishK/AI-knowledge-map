# Beginner learning positioning

Published commit: `6ecf16e` on `gh-pages`.

## Changes

- Root static title: 零基础免费学 AI | Learn AI from Scratch · AI 知识地图.
- Runtime English title: Learn AI from Scratch: Free Guide for Beginners | AI Knowledge Map.
- Runtime Chinese title: 零基础免费学 AI：概念与入门学习指南 | AI 知识地图.
- Prevent both map initialization and the introductory guide from replacing the learning-oriented title with a generic brand or Chinese guide title.
- Root description includes English beginner/free/concept-map positioning and a short Chinese summary.
- Visible expandable bilingual introduction on the map; full localized introduction on `/en/` and `/zh/`.
- Professional AI resources and practical agent tutorials are explicitly described as planned features.
- Localized guides retain separate self-canonicals and reciprocal hreflang; no automatic language redirection was added.

## Validation

- Production artifact verification passed: 260 existing reading pages, 594 public files.
- The scoped release tool checks that every file outside five permitted presentation files is unchanged; publication identities are unchanged.
- Monolingual/bilingual artifact tests passed, including the missing-language link case.
- Desktop English guide and expanded map introduction visually checked.
- Mobile English guide checked at 390 × 844; no horizontal overflow.
- Browser title checked during first-visit onboarding and after returning to the map.
- Cloudflare public versions of all five changed presentation files match the release hashes.

## Follow-up priorities

1. Distinct favicon and consistent WebSite brand identity.
2. Improve English discovery through the dedicated `/en/` landing page.
3. Topic hubs: AI fundamentals, language models, RAG, agents.
4. Beginner question pages based on real query demand, not near-duplicate keyword variants.
5. Clear prerequisites and learning outcomes at each learning entry.
6. Crawlable prerequisite/next-step/related-topic links.
7. Unique concise page titles and descriptions aligned with visible content.
8. Accurate visible author/reviewer information, citations, and update history.
9. Original diagrams and practical examples with descriptive alternatives.
10. Mobile loading/responsiveness/layout stability measured with real Core Web Vitals.
11. Accurate structured data without fabricated ratings or unsupported course claims.
12. Monitor Search Console by query, language, landing page, impressions and click-through rate.
13. Earn relevant educational/community references through useful original resources.
14. Maintain canonical consistency between apex and www; do not split the same content into competing canonical hosts.

Google independently chooses titles and snippets after recrawling. These changes do not guarantee the exact displayed text or ranking.

References:
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://huggingface.co/learn/llm-course/chapter1/1
- https://developer.mozilla.org/en-US/docs/Learn_web_development

## Homepage presentation correction

User requested removal of the visible expandable homepage introduction. Release `d9954bd` removes only that block and updates its manifest hash. The complete head (title, descriptions, structured data, canonical and verification tags) is byte-for-byte unchanged. Production artifact validation passed for 260 reading pages. The build pipeline no longer injects this block.
