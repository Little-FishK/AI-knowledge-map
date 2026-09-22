# DeepSeek 多页翻译自动流程

2026-09-13：用户授权维护控制器源码及隔离测试，选择 DeepSeek V4 Pro，执行时间不限，总预算 80 美元。本次实现没有调用付费 API，也没有部署网站。

## 已实现

- `translation-campaign` MCP 配置：离线创建绑定页面快照与配置的队列、查看进度、推进一个阶段。启动器连续调用，自动跨页；不领取中文 Stage 2 任务。
- 翻译逐章 high；独立审核按完整页上下文，medium 在 DeepSeek 中映射为 high；定点返修 high；复验 low。审核与返修均为新的独立 API 请求，不继承任何页或前一阶段的对话。保留现有完整逐单元引用合同和两轮返修上限。
- 同一队列的翻译、审核、返修及明确失败的章节重试共用预算。调用前预留，收到完整用量后按配置的峰时缓存未命中价格结算；不能据此声称这是提供方账单或账户硬限额。
- 来源过期、证据无效、返修用尽和资源/浏览器不通过时保留该页。预算不足停止整个队列。超时、未知用量或进程中断不自动重发；需要受控核对后恢复，当前不提供猜测恢复功能。
- 实际 Edge 检查桌面/手机、英文正文、中文原文跳转、语言切换稳定性、资源加载、SVG 字体越界及页面错误。位图、视频、canvas、iframe 和不可验证资源暂缓，需要独立视觉验收。
- 自动验收由控制器内部验证器产生，调用方不能提交一个伪造的 passed 对象。英文产物使用 `machine-reviewed`，不冒充 `human-approved` 或中文 L3 Pass。
- 网站构建收录有当前快照及验收回执的英文产物，生成英文路由、语言对应链接、搜索条目和地图英文加载文件；过期或不合格产物被排除。原有人工发布入口不变。

## 仍生效的来源门槛

自动发布不等于批准中文来源。现有规则 1 要求当前中文版本具有可核验的来源批准。队列在这一条件缺失时，**在付费前**标记 `source-approval-required`。不因为中文已经允许公开阅读就自动生成来源批准。

本次通过 MCP 清点：共 130 页，128 页没有英文产物，neural-network 和 supervised-learning 有英文文件（存在不等于当前可发布）。另以 LLM 冻结快照核实：`sourceEligibleForEnglishReview=false`。没有声称所有 128 页都已完成准入核验。

如果要让这类页面自动发布，需要单独明确批量中文来源采纳的范围和版本，或明确调整英文发布的来源政策；不能把模型审核伪装成人工批准。

## 运行方式

所有生产操作通过 MCP。三个工具：

1. `stage2_build_translation_campaign`：`pages:[{pageId,snapshotId}]` 与原 DeepSeek 完整 `config`。快照从现有 MCP 导出。配置包含预算 `budgetUsd:80`、模型 `deepseek-v4-pro`、generation `high`、账号标签、上下文/输出限制、最新核实的峰时价格、超时和重试次数。
2. `stage2_inspect_translation_campaign`：`campaignId`。
3. `stage2_step_translation_campaign`：`campaignId`；自动完成一个当前阶段。

命令入口：

```powershell
node tools/run-translation-campaign.js build <包含pages和config的本地JSON>
node tools/run-translation-campaign.js inspect <campaignId>
node tools/run-translation-campaign.js run <campaignId>
```

真实执行需要进程环境中的 `DEEPSEEK_API_KEY`、匹配配置的 `DEEPSEEK_ACCOUNT_ID`、`STAGE2_DEEPSEEK_LIVE=1` 和授权的 `STAGE2_DEEPSEEK_CAMPAIGN=<campaignId>`。不要把密钥放进命令参数、配置文件或 Git。启动器显式设置中文 manual-review action 为 hold。

队列文件在受控翻译目录的 `campaigns/<hash>/`。已有付费单页计划不自动纳入另一份预算，需要明确受控迁移，不能新建计划绕过未知请求。成功页面不会重复付费。异常中断的锁/账本不得手工删除。

这里的“发布”是控制器写入英文产物；命令返回 `deployed:false`。网站生产构建与远端部署是后续环节，目前没有自动推送 GitHub Pages，用户此前关于部署目标的问题尚未得到答复。

## 验证与回退

新增测试：`translation-campaign.test.js`、`translation-auto-publication.test.js`、`translation-auto-browser.test.js`。模型响应和语义证据采用合成夹具；浏览器测试实际启动 Edge。这些测试不代表真实 DeepSeek 翻译质量已验收。

回退基线由 MCP 创建于 `.tmp/website-preview/phase1-3/checkpoint-HXYyHq`，1834 文件已验证可独立恢复；清单 SHA-256 为 `6c64da4cf2e53377aceac659f3f46e9a22b8fdf8bbe7cf58b27f413cd21c40cc`。恢复应通过控制器按范围执行，不覆盖期间其他工作，不回滚已产生的调用账本或重复发送请求。
