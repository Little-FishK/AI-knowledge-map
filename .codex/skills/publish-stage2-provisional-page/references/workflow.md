# Complete page-locked workflow

This is the operational contract for one existing understanding page. The controller and its lease-bound MCP tools are the sole authority for identity, source chapters, candidate data, audit scope, repair scope, hashes, state transitions, publication, and rollback.

## Phase A: Resolve and resume

1. Call `stage2_resolve_recommended_page` with the supplied official `order`. Require `status: resolved`, the exact requested order, and `tracked: true`. Record its controller `pageId` and `contentGeneration` status; do not infer the slug from the display name. This exact resolver returns terminal pages instead of skipping to a later node. Do not use `stage2_next_recommended_page` for an explicitly requested page.
2. Use `stage2_status` only for a compact safety check and `stage2_inspect_publication_candidate` for the page-specific state. Never read Stage 2 state files directly.
3. Select the next action from the controller state:

| Observed condition | Next action |
|---|---|
| Already `published-approved` | Report that human approval already exists; do nothing and stop. |
| `published-provisional` with `manual-review` | Verify the page/hash/publication state and stop; do not republish. |
| `manual-review` with no completed content-generation output | Run Phase B first; do not publish an old candidate as this run's result. |
| `manual-review` with completed content-generation output already imported | Apply the explicitly supplied action. |
| Valid completed content-generation output exists but no imported candidate | Import it; do not regenerate it. |
| `audit-queued` / `repair-queued` | Run only the role named by the state. |
| Active lease, `busy`, `paused`, or `idle` | Report the controller response and stop. |
| Eligible existing page awaiting content preparation | Continue with Phase B. |
| State or recommended page does not match the requested node | Report the mismatch and stop. Do not perform any page-level action on the returned other node. |

Do not reset, release, retry, roll back, or overwrite merely to force the happy path. Those actions require a controller response or separate user authorization.

## Phase B: Generate the complete source responses

4. Queue the page once with `stage2_enqueue_content_generation(pageId, reason)`. The page must be an existing page that is not `published-approved`.
5. Spawn one fresh agent with role `stage2_content_generation`, locked to this page. Do not give it context from another node and do not reuse it later for another node.
6. The content agent calls `stage2_claim_task` once with this `pageId`. If the result is `paused`, `busy`, or `idle`, it stops without claiming again.
7. The controller resolves the old chapter source only from `docs/deepdive-reviews/<leading-order-digit>x-section-text-review.md`. The agent must not open that file itself. It receives only an ordered eligible-section list.
8. For each eligible section in source order, the same agent calls `stage2_read_content_section` once for that section, then answers using exactly this prompt and no replacement prompt:

   ```text
   把当前章节解析并改写为可直接用于“理解原理页”的完整教学正文。

   自然讲清本节的核心概念是什么、解决什么问题、输入与输出、关键机制与因果链、公式或示例中每一步的含义、结果应如何解释，以及适用条件和边界。将这些内容融入连贯叙述，不要使用固定的模板或审计清单。

   以当前章节材料为事实边界。可以补充理解该机制所必需的通用解释和推导，但不得新增缺少材料支持的关键事实、具体数据、来源或结论；不得依赖尚未读取的其他章节。保留原有事实、数字、术语含义及图表表达的关系。

   公式使用可直接显示的 Unicode 数学符号，例如 ∂、×、ε、≤、→，不得输出带反斜杠的 LaTeX 命令。

   不要生成“常见误解”、自测、答案或额外总结章节；不要出现“以下是解析”“本节主要介绍”等元话语。避免重复、空泛类比和模板化表达。输出只包含可以直接采用的章节正文。
   ```

9. The agent immediately saves the complete response with `stage2_save_content_response`. It may read the next section only after save succeeds.
10. Never request, read, summarize, or save sections titled `常见误解`, `自测`, or `检查你是否真的理解`. The controller also rejects them.
11. After all eligible sections are saved, the agent calls `stage2_submit_result` exactly once and stops. The controller atomically writes `docs/deepdive-reviews/<pageId>-agent-responses.md`, clears the lease, and restores the pre-generation workflow state.

## Phase C: Import and validate the candidate

12. Confirm that the controller reports no active content lease and that content generation did not elevate publication state.
13. Import with `stage2_import_editorial_candidate` using the resolved `pageId`, a clear reason, and `useContentGenerationOutput: true`. Do not pass a separately reconstructed page and do not edit the response document or official page directly.
14. Let the controller convert the hash-matched response file into the complete candidate. It must retain the page title and goals, knowledge chain, original figures and tables unless explicitly removed, formula metadata, and sources.
15. Require the import gates to accept the exact candidate. They include structural integrity, retained figures/tables, UTF-8 text integrity, replacement/question-mark/control-character checks, formula metadata, and visible raw-LaTeX detection. A formula is not acceptable when commands such as `\theta`, `\frac`, or `\varepsilon` appear as literal page text.
16. On accepted import, the controller creates a reversible red-marked editorial draft and queues audit. On rejection, report the precise gate response and stop; never patch restricted files to bypass it.

## Phase D: Independent audit and one repair maximum

17. For `audit-queued`, spawn one fresh `stage2_audit` agent locked to this page. It claims once, reads its contract and candidate only through lease-bound Stage 2 tools, performs the whole-page factual/concept/relationship/style/formula audit, validates its audit result, submits once, and stops. It must not write page content or reuse a prior audit answer.
18. If the valid audit has no blocker, proceed to `manual-review`. If it yields sanitized content blockers, the controller may queue one `stage2_repair` agent. The repair agent claims once, uses only its sanitized defects and current candidate, validates and submits one complete repaired page, and stops. It must not search for the private audit answer or invent audit evidence.
19. After that one repair, run only the controller-directed verification of the first audit's findings. Do not discover new defects during scoped verification. Whether verification passes or still has blockers, the next terminal workflow state is `manual-review`. Contract-invalid audit submissions are rejected and re-queued for a fresh audit; they do not consume the one content-repair allowance.

## Phase E: Apply the explicit manual-review action

20. Inspect with `stage2_inspect_publication_candidate` and require no active lease.

For `hold`:

- Do not call `stage2_publish_provisional_page`.
- Report workflow state, publication state, candidate hash, and remaining blockers.
- Stop. Do not finalize.

For `publish-provisional`:

- Require `workflowState: manual-review`, `canPublishProvisional: true`, and a `candidateHash` from the just-completed inspection.
- Call `stage2_publish_provisional_page` at most once with the same `pageId`, that exact hash as `expectedCandidateHash`, and the user's authorization reason.
- Re-inspect once. Require `publicationState: published-provisional`, the expected candidate hash, the red provisional marker, and no active lease.
- Report any remaining blockers accurately. The workflow remains `manual-review`; this is not L3 Pass and not `published-approved`.
- Stop. Never call `stage2_finalize_manual_review`.

## Failure and task cleanup

- If any hash changes, tool capability is unavailable, a gate rejects, or the controller reports an unexpected state, stop and report the exact response plus the safe next state. Do not improvise a direct write.
- Each spawned worker is page-locked, role-locked, single-claim, single-submit, and terminal after submission.
- When a submission response instructs UI cleanup, archive that completed worker task using the Codex task archival tool. Do not archive tasks that failed or require user attention.
- A scheduled invocation processes only this page and then ends, even if another page is ready.
