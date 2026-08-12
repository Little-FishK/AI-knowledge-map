# Stage 2 理解原理页流水线 · 会话交接说明

> 这份文件是给**标准 Claude Code CLI** 里一个全新会话看的。它不记得之前那段对话，请先读完本文件，再动手。

## 0. 唯一能跑这条流水线的环境

- **必须在标准 Claude Code CLI 里跑**（它会读 `.mcp.json` 和 `.claude/settings.json`）。
- **不要在 Cowork/桌面 App 里跑**：那个 App 忽略项目 `.mcp.json` 与 `settings.json` 的 deny 规则，锁不生效、控制器也接不进去。
- 权限模式保持 **Manual（default）**：每个动作都弹窗，由用户逐条把关。

## 1. 这是什么

给 130 个概念的「理解原理」深读页跑质量流水线：**audit（独立审计）→ 通过则控制器原子发布（l3-auto-passed）；不通过则 repair（返修）→ 再 audit**。设计详见 `docs/DEEPDIVE_STAGE2_AUTOMATION.md`；写作标准见 `docs/DEEPDIVE.md`；质量门禁见 `docs/DEEPDIVE_QUALITY_GATE.md`。

控制器本体：`tools/deepdive-stage2/core.js`；MCP 窄接口：`tools/deepdive-stage2/mcp-server.js`；进度事实源：`.stage2/state.json`。

## 2. 已配置好的「controller-only」隔离

- `.mcp.json` 已接入 `stage2` MCP server（`/mcp` 应看到 11 个 `stage2_*` 工具）。
- `.claude/settings.json` 已上锁：
  - **deny**：`Edit`/`Write`/`NotebookEdit`/`Bash`（不许直接改文件、不许跑 shell），读 `.stage2/` 与 `docs/deepdive-audits/`（私有状态与私有审计），以及 4 个**控制面**工具 `stage2_reset_manual_review`/`stage2_create_manual_review_preview`/`stage2_finalize_manual_review`/`stage2_release_lease`（**只有人类操作员能用**，走 CLI `node tools/run-deepdive-stage2.js ...`）。
  - **allow**：7 个控制器内容工具（status / next_recommended_page / claim_task / submit_result / read_task_packet / search_project / read_project_file）。
- 子代理白名单：`.claude/agents/stage2-audit.md`、`stage2-repair.md`（如需处理新节点/视频补充，再加 `stage2-write`、`stage2-update`）。

**净化由控制器代码完成，不靠编排者居中**：audit 提交 `blockingFindings` → 控制器转成不含答案的 `defects` → 放进 repair 的任务包。repair 看不到审计原文。

## 3. 怎么跑一页(一轮)

1. `stage2_next_recommended_page`（起点 `startOrder` 默认 `"1.3"`）查官方推荐路径上的下一张待处理页，拿到它的 pageId。
2. 用 **Task 工具起一个 `stage2-audit` 子代理**（全新上下文），让它 `stage2_claim_task`（可带 pageId）→ 独立六问审计 → `stage2_submit_result`。
3. 控制器自动跑门禁：
   - 通过 → 原子发布，状态变 `l3-auto-passed`；
   - 不通过 → 状态变 `repair-queued`，`record.blockers` 存净化后的 defects。
4. 若进了 repair：用 Task 起一个 **`stage2-repair` 子代理**，让它 claim → 按 `defects` 重写正文 → submit → 回到 audit 复审。每页最多自动返修 2 次，超限进 `manual-review`（交人）。
5. 编排者(主线)自己**不要** claim/submit，只负责 `stage2_status` / `stage2_next_recommended_page` + 起子代理。

## 4. 现在的进度(截至交接)

`stage2_status`：total 130 · audit-queued 102 · repair-queued 9 · update-queued 4 · manual-review 1 · l3-auto-passed 14。

## 5. 立即任务

对**官方推荐路径上的 2.1 节点**跑第一轮:先 `stage2_next_recommended_page` 确认它的 pageId，再起 `stage2-audit` 子代理走 audit → (通过发布 / 不通过 repair)。

## 6. 注意

- 全局同一时刻只允许一个租约(一次一页)。
- 不要手改 `.stage2/`、租约或私有审计。
- 遇到 `manual-review`：由**用户**用 CLI 决定(`node tools/run-deepdive-stage2.js retry|release <id>`、`refresh-blockers`)，Claude 无权调那些控制面工具。
