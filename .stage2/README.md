# 理解原理页第二阶段运行目录

本目录由 `tools/run-deepdive-stage2.js` 和 Stage 2 MCP 控制器维护。

- `state.json`：唯一进度事实源。
- `events.jsonl`：只追加事件日志。
- `policies/`：可交给写作者的稳定规则，不含审计答案或门禁实现。
- `results/<page-id>/candidate.json`：尚未发布的候选页面。
- `results/<page-id>/audit.private.json`：仅控制器和审计阶段使用，不会交给返修者。
- `results/<page-id>/completion.json`：L3 自动通过与正式发布回执。

Agent 不直接写正式页面。每次定时运行只领取一个任务、提交一次结果，然后归档并结束。audit 租约可以通过 MCP 的硬只读工具检查项目与门禁；其他角色仍只能使用任务包。
