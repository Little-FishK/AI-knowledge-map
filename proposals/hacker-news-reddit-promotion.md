# Hacker News and Reddit promotion

Prepared on 2026-09-21.

## Shared links and facts

- Live English site: https://ai-knowledge-map.com/?lang=en
- Source code: https://github.com/Little-FishK/AI-knowledge-map
- 130 AI concepts
- 416 typed relationships
- 9-stage suggested learning path
- English and Simplified Chinese explanations
- Search, filters, concept relationships, and learning-progress tracking
- No account required to browse or read
- Original code: MIT
- Project-owned original articles and explanatory figures: CC BY 4.0
- Honest limitation: some supporting software, tutorial, and reference-directory records are still available only in Chinese

## Hacker News / Show HN

HN's current guidelines say not to post generated or AI-edited text. The project is a reasonable Show HN candidate because visitors can directly interact with the map without signing up, but the final title and author comment must be written by the project owner in their own words.

### Human-written title checklist

- Start with `Show HN:`.
- Say what was built, not that it is revolutionary, comprehensive, or the best.
- Mention one concrete differentiator: the concept relationships, the nine-stage path, or bilingual explanations.
- Keep the title compact and avoid SEO phrasing.

### Human-written first-comment outline

Write a short comment in your own voice covering these points:

1. The personal problem that led you to build the project: beginner AI resources list terms but often do not show dependencies or a useful order.
2. What can be tried immediately: browse 130 concepts connected by 416 typed relationships, turn on the nine-stage path, open an explanation, and track progress.
3. Access: the map and explanations work without an account; progress sync is optional.
4. Languages: English and Simplified Chinese; note that some supporting directories still fall back to Chinese.
5. Licensing: code is MIT and project-owned educational content is CC BY 4.0.
6. One specific request for feedback, such as whether the prerequisite edges and stage ordering make sense to experienced ML practitioners.

Do not paste this outline as the comment. Rewrite it personally to comply with HN's no-generated-text rule.

## r/learnmachinelearning

### Suggested post type

Text post with the live link and repository in the body. Select a `Resource`, `Project`, or closest non-commercial flair if offered.

### Title

I built a free bilingual map of 130 AI concepts for beginners

### Body

I built AI Knowledge Map because beginner resources often explain individual terms without showing what depends on what or what to learn next.

The site connects 130 AI concepts with 416 typed relationships and organizes them into a suggested nine-stage path, from foundations and machine learning through LLMs, RAG, agents, and AI safety. Each concept opens into an English or Chinese explanation, and you can search, filter the map, and track learning progress.

Implementation-wise, I modeled the curriculum as a directed graph rather than a flat list: concepts are nodes, and the 416 edges record relationships such as prerequisites and related ideas. The learning path is a separate ordered layer over the same graph, so learners can either follow a sequence or explore freely.

Live site: https://ai-knowledge-map.com/?lang=en

Source: https://github.com/Little-FishK/AI-knowledge-map

It is free to browse and read, and no account is required. The code is MIT licensed; project-owned original articles and explanatory figures are CC BY 4.0. One current limitation is that some supporting software, tutorial, and reference-directory records are still Chinese-only.

I would especially appreciate feedback on two things: whether the prerequisite relationships are sensible, and whether the nine-stage order would help someone starting from zero. Which concepts or links would you change?

### Rule fit

- Educational resource sharing is allowed in r/learnmachinelearning.
- Same content should be posted at most once per week.
- The post states that the resource is free and contains no referral, paid-course, or financial solicitation.
- Do not repost the same project in the subreddit within seven days.
