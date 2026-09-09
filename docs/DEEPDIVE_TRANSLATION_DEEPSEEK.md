# DeepSeek 理解页翻译适配层

## 本次交付

新增 DeepSeek V4 Pro 的独立调用通道，保留原 OpenAI Batch 通道。代码接入与隔离测试完成；**未进行真实 API 联调、付费、上传、中文状态修改、英文发布或 Git 提交**。不能将本次测试称为 V4 Pro 的真实翻译质量验收。

| 部件 | 作用 |
|---|---|
| `tools/deepdive-stage2/lib/deepseek-client.js` | 固定 DeepSeek 地址、独立凭据、明确超时、响应大小限制、错误脱敏、禁止自动重试 |
| `tools/deepdive-stage2/lib/translation-deepseek.js` | 整页离线计划、逐章执行、独立账本、预算预留、严格接收合同、质量材料出口 |
| `core.js` / `mcp-server.js` | MCP 页锁定入口及提供方明确路由 |
| `tests/stage2/translation-deepseek.test.js` | 模拟网络与隔离 MCP 的回归测试 |

## 与 OpenAI Batch 的区别

这是本地控制器管理的逐章队列，不是 DeepSeek 托管 Batch，不调用 OpenAI 的上传、Batch 或 token 计数端点。每次执行工具最多发送一个章节请求；成功保存后，再次执行才继续下一章。不会后台自动跑完整页，不会创建定时任务。

当前采用 DeepSeek `/chat/completions`，而非假设 Responses/Batch 所有参数等价。保留冻结提示词原文，将输出 schema 放在任务数据中，使用 `response_format:json_object`；不声称提供方强制实现严格 JSON Schema。结果仍由本地合同检查每个单元的精确键、非空译文、源文疑点结构、消息角色、结束原因和模型身份。

思考强度必须显式指定 none/low/high/max；none 映射为关闭 thinking，其余映射为启用 thinking 和对应 reasoning_effort。不传工具、不把前章对话拼进后章。仅保留最终回答及必要响应元信息，不保存或返回 reasoning_content。图片英文化仍需单独处理，不会因换模型自动完成。

## 入口与授权

新 MCP 配置 `translation-deepseek` 必须绑定 `STAGE2_MCP_PAGE_ID`，只有三个工具：

1. `stage2_build_deepseek_translation`：从受控快照构建离线计划，不联网。
2. `stage2_inspect_deepseek_translation`：查看进度、费用预留和失败/不确定状态，不返回正文。
3. `stage2_run_deepseek_translation`：仅在获授权后执行下一章；`retry:true` 只重试当前已明确失败的章节。

`full` 协调配置也可调用这些工具，但不能绕过付费授权；审查、返修、中文控制器角色不因此获得 DeepSeek 调用权限。

构建配置必须完整指定：

| 字段 | 要求 |
|---|---|
| model | 当前仅允许 `deepseek-v4-pro`；别名后续更新需重新评估，实际响应模型写入回执 |
| accountId | 本机自定义非秘密账号标签，3—80 位字母/数字/下划线/连字符；不是 OpenAI projectId |
| contextWindow / maxOutputTokens | 明确已核验的容量；当前上限分别 1,000,000 / 384,000，输出必须小于上下文 |
| reasoningEffort | none / low / high / max，无默认降低推理强度；正式译文必须为 high 才能进入新的质量审核调度流程 |
| inputUsdPerMillion / outputUsdPerMillion | 明确提供并核验的峰时、缓存未命中输入及输出价格；不是旧价或 Batch 折扣价 |
| priceBasis | 必须为 `peak-cache-miss` |
| budgetUsd | 单计划所有章节和重试累计的美元预留上限 |
| maxAttempts | 每章最多尝试 1—3 次，重试仍需明确请求 |
| requestTimeoutMs | 单次调用超时 1,000—600,000 毫秒；根据长章节/推理耗时显式选择 |

费用价格值不硬编码为永久事实，启动人必须核实最新官方价；`priceBasis` 只是合同约束，不能证明输入的数字一定等于当前价格。

真实执行前，需明确批准向 **DeepSeek** 发送该页原文、章节上下文、相关术语和输出合同；不能沿用原来向 OpenAI 上传的授权。密钥仅在服务端安全配置：

- `DEEPSEEK_API_KEY`：DeepSeek 密钥，禁止发进聊天、命令参数、网页和版本库。
- `DEEPSEEK_ACCOUNT_ID`：与计划 accountId 相同的本地账号标签；这是操作防串号约束，不是向提供方验证账号身份。
- `STAGE2_DEEPSEEK_LIVE=1`：明确启用真实请求。
- `STAGE2_DEEPSEEK_APPROVED_PLAN`：用户核对内容范围和费用后批准的精确 planId。

Codex 桌面环境无法可靠继承 Windows 用户变量时，可通过 `save-deepseek-credential.ps1` 的系统凭据框把 Key 保存为当前 Windows 账户/机器绑定的 DPAPI 加密 CliXml。`start-mcp-with-deepseek.ps1` 仅在启动 MCP 子进程时解密到进程环境，配置文件只保存凭据文件路径，不保存 Key 明文。该文件不是跨机器备份；复制到其他账户或电脑不能解密。撤销 Key 后也应删除本地加密文件并重建凭据。

OpenAI 密钥、项目及 Batch 授权不会启用 DeepSeek；DeepSeek 也不会回退调用 OpenAI。地址固定为 `https://api.deepseek.com/chat/completions`，拒绝重定向和调用方自定义地址，避免密钥发往其他主机。

新增工具需在适当时候重连 MCP 才能使用。本轮不修改用户密钥/运行环境，不重启生产连接。

## 接收、费用与恢复

- 每页计划位于独立翻译数据根目录 `deepseek/<pageId>/<planHash>/job.json`；不读取或改写 OpenAI Batch 账本。
- 请求正文、提供方、模型、推理强度、账号标签、源快照、费用及限额均纳入计划摘要；计划被改动则拒绝继续。
- 输入按序列化 UTF-8 字节加额外开销保守估算，不调用未核验的远端计数接口、不静默截断。它不是提供方的精确 token 计数。
- 发送前持久化 sending 状态及费用预留；每次重试另占额度，已消耗预留不会因为失败释放。
- 对 usage 用峰时/缓存未命中价格估算，不抵扣缓存和非高峰优惠；是保守估算，不是核对后的账单，也不是平台硬消费限额。账号中其他计划的费用不包含在该上限中。
- usage 缺失记未知；实际 token 超出预留假设则停止后续调用，不能按零费用继续。
- API 错误、超时、断网、响应不可读、发送期间进程中断，都按结果不确定处理，不自动再发。即便客户端超时，远端也可能已完成并计费。
- 有明确响应但为空、漏项/多项、拒绝、截断、错误模型或非法结构时，不接收为合格译文；只可显式重试该章，最多达到计划的尝试次数。成功章不重发。
- 每章回复保存独立回执及摘要；整页收齐后重验回执、输出、源版本与任务身份，才进入质量流程。
- 源版本变化时保留收到的旧译文并标 stale，不发布、不继续付费；术语、资源及批准状态也沿用已有快照检查。
- 同计划操作加锁，不占用中文控制器锁等待网络。进程崩溃遗留锁不自动抢占；不能随意删锁或改账本。

当前没有恢复不确定请求、查询 DeepSeek 远端历史结果、对用量异常人工放行的 MCP 入口；这些情况会真正停住，需后续受控恢复设计和新的明确授权。不要绕过它新建计划或删除账本重复收费。

## 复用原质量与发布流程

收齐后调用 `stage2_begin_translation_quality`，明确 `provider:"deepseek"`。省略 provider 保持原来的 `openai` 行为；未知提供方被拒绝，不能以自动探测方式误读另一份账本。

之后继续原独立审查、限定返修、资源/浏览器验收、人工批准发布流程；正文结构保护、术语和语义门禁不放宽。DeepSeek 调用角色不能提交语义审查或发布。仅接收成功仍是 `received-unreviewed`，不是质量通过。

## 测试与官方依据

`npm run test:translation-deepseek`：14 组隔离测试，覆盖离线计划、不同提供方凭据隔离、逐章调用/重启续跑、思考参数、严格输出校验、重试上限、累计预算、不确定请求、未知用量、源过期、并发/崩溃、摘要与目录安全、质量入口及 MCP 权限。网络全部为模拟，没有正式正文、付费或真实语义审查。

`npm run test:stage2` 已纳入上述测试，同时回归原 OpenAI Batch、质量检查及发布流程。本次无前端改动，真实账号权限、V4 Pro 输出质量、长章节实际耗时仍需单页试点确认。

官方资料（2026-09-05 核验）：

- [Chat Completions 参数](https://api-docs.deepseek.com/api/create-chat-completion/)：请求与结束原因；全文抓取超时，参考官方检索返回的参数段落，真实联调仍须核验。
- [JSON Output](https://api-docs.deepseek.com/guides/json_mode/)：JSON 模式；不能替代本地精确结构与语义校验。
- [Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/)：开关、推理强度及 reasoning_content。
- [Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/)：容量、峰时/非高峰价格；真实计划建立时重新核验。

下一步：重连受控工具，核对神经网络页快照是否仍有效，明确推理强度、预算和 DeepSeek 上传授权，生成精确计划；安全配置密钥及精确计划授权后，才开始首个真实请求。
