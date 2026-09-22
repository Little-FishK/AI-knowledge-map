# 验收通过后直接部署

`node tools/run-translation-campaign.js run <campaignId>` 现在内置正式部署步骤，不再依赖 heartbeat 发布。

- 每秒通过 MCP 只读检查页面状态；发现控制器 `published` 和精确 `artifactHash` 后立即入队，不等待其他页面的模型请求结束。
- 部署队列串行执行：核对配置的远端及域名、获取最新 gh-pages、独立 worktree、MCP production 构建、限定页面合并、产物校验、普通快进推送、正式 URL 内容核对。
- 只有正式网址返回 200 且 HTML 与产物一致才输出 `page-live`；错误输出 `deployment-blocked`，不会伪装为上线成功。其他页继续处理。
- `.tmp/translation-deployments/` 保存公开部署回执、提交、回退基线及产物路径。已推送但尚未确认的提交可以恢复验证，已上线相同版本不重复推送。
- 配置在 `config/translation-deployment.json`。初始公开基线来自本机已验证的 `.tmp/tokenization-scoped-release`，随后用部署回执中的新产物作为基线。远端与基线不一致时停止，避免覆盖别人发布的内容。
- `inspect`、`build` 和 `handover` 不触发部署。此变更没有恢复已暂停自动任务，也没有运行付费翻译或推送。

验收和部署是两个不同状态：控制器负责前者，运行器负责后者。heartbeat 后续仅用于通知和异常协助，不再是上线必经步骤。
