# 理解页英文翻译：阶段 7 Batch 接入

后续阶段 8 已实现离线检查与独立角色修复接口，见 [DEEPDIVE_TRANSLATION_QUALITY.md](DEEPDIVE_TRANSLATION_QUALITY.md)。本阶段 Batch 接收结果仍是未审译文，不自动启动审查或发布。

## 当前交付边界

已实现 OpenAI REST 传输适配、全页请求计划、持久任务账本、输入计数、预算预留、提交、状态查询、输出/错误收集、单章失败重试与不明确提交的远端核对。测试使用隔离数据和模拟 fetch，不访问真实 API，不读取密钥文件，不操作生产页面/中文审核状态。

本阶段只生成 `received-unreviewed` 译文，不等于语义通过，不改变中文批准状态，也不发布英文页面。阶段 8 的九项检查、阶段 9 的 HTML 重组和前端加载尚未实现。完整真实 API 联调需要用户确认模型、API 项目、上传范围和预算后另行进行。

## 部件

| 文件 | 责任 |
|---|---|
| `tools/deepdive-stage2/lib/openai-batch-client.js` | 固定 OpenAI 地址、服务器端环境凭据、计数/上传/创建/读取 REST 请求；禁止重定向及自动重试 |
| `tools/deepdive-stage2/lib/translation-batch.js` | 从受控快照准备整页章节、不可变计划、独立账本、预算和结果接收 |
| `tools/deepdive-stage2/mcp-server.js` | 新增页锁定 translation-batch 权限配置及异步接口 |
| `tests/stage2/translation-batch.test.js` | 模拟传输与真实隔离 MCP 进程测试；没有真实网络调用 |

运行数据位于阶段 4—6 使用的翻译数据根目录下：`batches/<pageId>/<planHash>/job.json`。原始输出和错误文件分别保存，并记录文件内容摘要；译文保存对应请求、尝试次数、响应编号、返回模型及译文摘要。计划摘要覆盖源快照、模型、价格、预算、全部请求正文及输出约束；读取时重新校验。

## MCP 接口

`translation-batch` 配置必须指定 `STAGE2_MCP_PAGE_ID`，只开放下列五个工具。full 配置可协调调用，但同样受联网授权检查。旧 audit、repair、controller、content-generation 和 translation 配置不增加付费权限。

| 工具 | 操作 |
|---|---|
| `stage2_build_translation_batch` | 本地生成整页计划。输入 pageId、snapshotId、config；返回 planId、请求数与预估费用，不联网 |
| `stage2_inspect_translation_batch` | 查看本地状态、各次批号、失败章节及用量；不返回正文 |
| `stage2_submit_translation_batch` | 核验授权/源版本、计数、预算预留、上传并提交；retry=true 才允许失败章节再试 |
| `stage2_reconcile_translation_batch` | 查找具有同一 planId、attemptId 和输入文件的唯一远端批次，不重新创建 |
| `stage2_collect_translation_batch` | 查询一次远端状态；终态时下载输出和错误，按 custom_id 接收未审译文 |

没有常驻轮询或后台定时器。collect 是一次检查；若需要持续监控，应另行授权产品的定时任务，不在当前对话中无限等待。

## 使用顺序

1. 通过准备接口取得完整快照及 snapshotId。
2. 明确 config：model、projectId、contextWindow、maxOutputTokens、reasoningEffort、inputUsdPerMillion、outputUsdPerMillion、budgetUsd、maxAttempts。当前翻译审核调度策略要求 reasoningEffort=`high`，并把它写入 Responses 请求；价格必须是已核验的 Batch 每百万 token 美元价格，不是普通调用价格。无默认模型或默认价格，maxAttempts 为 1—3。
3. build 返回精确 planId。先核对页范围、请求数、输出容量和预算，再由用户授权真实上传。
4. 在服务端安全环境配置 `OPENAI_API_KEY`、`OPENAI_PROJECT_ID`；不要把密钥发到聊天、网页、命令参数或版本库。当前没有改动用户的环境或 MCP 配置。
5. 仅在明确授权后，服务端设置 `STAGE2_BATCH_LIVE=1` 和 `STAGE2_BATCH_APPROVED_PLAN=<精确 planId>`。计划变化后旧授权不适用，项目不匹配也拒绝联网。
6. 重新连接具备所需环境的 MCP，再 submit。不要在源码中直接调用控制器处理生产数据。
7. 用 collect 接收结果，用 inspect 查看失败和费用；确认重试时传 retry=true，只重试未成功接收的章节。
8. 结果留在未审区，后续交给阶段 8；任何操作均不允许直接发布。

输入计数也会将原文发给 OpenAI，所以不是本地预检：同样必须满足精确计划和项目授权。构建计划时的字节估算则完全离线。

## 请求格式与版本一致性

每章一个 `/v1/responses` 请求；当前一页形成一个批次，页头/章节外文本也在其中。不截断正文、不删除自测，也不把多页拼成一个有共享上下文的对话。JSONL 采用唯一 custom_id，包含稳定任务摘要和尝试编号。

请求使用 `text.format` 的严格 JSON Schema；`store:false`，`truncation:disabled`，明确 `max_output_tokens`。系统输入使用阶段 6 固定提示词，用户输入是冻结章节数据和术语。没有网络/工具调用权限，也不使用依赖先前响应的对话状态。

不假设返回顺序与输入一致。重复/未知编号、坏 JSONL 会阻断本次导入，原始下载保留；缺失、HTTP 错误、拒绝、不完整响应、缺字段、多字段、空译文都不会计作成功。接收成功仅表示传输与输出结构有效，不代表翻译质量合格。

提交前和计数后核验源快照；下载后再核验。源页在远端处理期间改变时保留旧译文但标记 stale，不将其当作新版本发布。

## 费用与恢复

- 离线计划按输入字节数加结构开销估算；真实提交前使用输入计数接口计算消息 token，再额外保留 JSON Schema 的保守字节额度。该数值不是完整请求的精确计费 token，也不是模型容量自动发现结果；contextWindow/maxOutputTokens 必须人工核实。
- 每次提交按预留输入及最大输出计算费用预留。所有尝试累计不得超过本计划预算，失败尝试也不释放预留。价格由明确配置提供；这不是平台级硬消费上限，账单以 OpenAI 为准。
- 接收后记录实际返回的 input_tokens/output_tokens，并按配置价格估算费用，不把估算称为已核对账单。不抵扣缓存折扣，因此可能偏高；用量缺失返回未知，不当作零费用。
- 同一计划的操作由独立短期锁保护，不占用中文 Stage 2 锁等待 Batch。输入计数或读取失败不自动重试；用户可在确认后重复调用。
- 在上传/创建前持久记录阶段。POST 超时、异常或进程中断造成不明确状态时，不自动重发。若已记录 fileId，reconcile 可从远端列表中查找唯一匹配批次；找不到或多于一个匹配均保持阻断。
- 上传回执丢失时可能留下孤立文件；当前不自动删除、不重新上传，也不自动认定“没有创建批次”。需维护人员核对远端后再处理。
- 进程崩溃遗留的 operation.lock 不会按时间自动抢占。必须先确认进程已停止，再按受控维护流程处理；当前没有自动清除锁接口。正常异常路径会释放锁，持久账本保留，重启后可 inspect/reconcile/collect。
- 当前没有取消批次、删除远端文件、跨计划共享预算或跨计划复用译文功能；这些不是本阶段默认授权的操作。

## 测试与官方依据

`npm run test:translation-batch` 运行本轮 17 项模拟测试；`npm run test:stage2` 已包含准备和 Batch 测试及旧控制器回归。模拟测试验证协议与状态逻辑，不能证明账号权限、选定模型/Schema 的真实支持或实际翻译质量。

接入依据 OpenAI Docs 核对的官方资料：

- [Batch 指南](https://developers.openai.com/api/docs/guides/batch)：异步 JSONL、唯一请求编号及输出处理。
- [Batch API](https://developers.openai.com/api/reference/resources/batches)：创建、状态、文件和元数据。
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)：结构化输出与拒绝处理。
- [输入 token 计数](https://developers.openai.com/api/reference/resources/responses/subresources/input_tokens/methods/count)：消息输入计数。

下一步：阶段 8 实现九项检查与修复；真实付费试点需单独确认，不因本阶段测试通过自动启动。
