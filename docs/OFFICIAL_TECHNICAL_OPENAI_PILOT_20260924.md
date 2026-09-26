# “官方技术资料”OpenAI 试审记录

> 历史说明：本文件只记录机制试跑，已由 [OpenAI 全量审核进度与结论](OFFICIAL_TECHNICAL_OPENAI_REREVIEW_PROGRESS_20260924.md) 和 [价值评分第一批](OFFICIAL_TECHNICAL_OPENAI_VALUE_SCORE_BATCH_01_20260924.md) 替代为当前基准。

审核日期：2026-09-24｜机制：[官方技术资料审核机制 v1.0](OFFICIAL_TECHNICAL_REVIEW_POLICY.md)｜结构化记录：[openai-pilot-20260924.json](../proposals/official-technical/openai-pilot-20260924.json)

## 1. 测试范围

本轮用于验证机制，不宣称穷尽 OpenAI 全部资料。冻结范围为：

- 二级来源：`official/openai`；
- 官方域名：`developers.openai.com`；
- 候选类型：核心 API 技术指南、迁移指南、快速开始，以及一个已进入弃用期的旧平台页面；
- 候选数：12；
- 检索与状态核查日：2026-09-24。

测试刻意覆盖五类边界：品牌差异、当前但变化快的资料、过渡性迁移资料、同主题快速开始、无知识增量的入门页和已弃用对象。

## 2. 汇总结论

| 决定 | 数量 | 处理 |
|---|---:|---|
| `admitted-general` | 0 | 本批没有需要由 OpenAI 页面新建的通用概念 |
| `admitted-brand-evidence` | 9 | 收录为 OpenAI 实现、限制、选型或迁移证据 |
| `merge-update` | 1 | Agents SDK quickstart 合并到 Agents 主条目 |
| `pending` | 0 | 无未决关键事实 |
| `ineligible-no-gap` | 1 | Developer quickstart 不补知识或品牌判断缺口 |
| `ineligible-no-delta` | 0 | 本批无此结果 |
| `ineligible-obsolete` | 1 | 旧 Working with evals 页面对应平台已进入关闭时间表 |

结果说明：官方身份只是前提，12 个官方页面最终只有 9 个形成独立资料卡。

## 3. 逐项结果

| 候选 | 决定 | 知识矩阵结论 |
|---|---|---|
| Agents | `admitted-brand-evidence` | Agents API、Agents SDK 与 Responses API 的职责差异影响运行时选型 |
| Using tools | `admitted-brand-evidence` | OpenAI 托管工具、函数工具、MCP 和工具搜索影响集成方式 |
| Structured outputs | `admitted-brand-evidence` | 函数调用与 `text.format` 的选择影响输出契约 |
| Prompt caching | `admitted-brand-evidence` | 缓存边界与命中机制影响延迟、成本和上下文组织 |
| Evaluate agent workflows | `admitted-brand-evidence` | 当前以 traces、graders、datasets 和 eval runs 组织代理评测；设置关闭日复核 |
| Realtime API | `admitted-brand-evidence` | WebRTC/WebSocket、临时凭证与插话影响语音代理架构 |
| Image generation | `admitted-brand-evidence` | Image API 与 Responses 图像工具差异影响生成/编辑流程 |
| Migrate to the Responses API | `admitted-brand-evidence` | 当前迁移仍涉及对象、状态、工具结果与流式事件差异 |
| Model guidance | `admitted-brand-evidence` | 当前模型族和参数限制影响选型，但必须高频复核 |
| Agents SDK quickstart | `merge-update` | 当前且有操作价值，但比 Agents 主入口更窄，不单独建卡 |
| Developer quickstart | `ineligible-no-gap` | 主要是密钥、安装和首个请求，不形成知识或选型增量 |
| Working with evals | `ineligible-obsolete` | 对应 Evals 平台已宣布弃用且有当前评测入口替代 |

## 4. 关键证据

- [Agents](https://developers.openai.com/api/docs/guides/agents) 当前直接比较 Agents API、Agents SDK 与 Responses API 的运行位置、状态和工具责任。
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) 区分函数调用和结构化响应格式的使用场景。
- [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) 说明缓存边界、前缀匹配和上下文变化对复用的影响。
- [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals) 仍是当前代理评测决策入口。
- [Deprecations](https://developers.openai.com/api/docs/deprecations) 说明旧 Evals 平台计划在 2026-10-31 转为只读、2026-11-30 关闭，因此旧 Evals 页面不能作为长期当前资料。
- [Realtime API](https://developers.openai.com/api/docs/guides/realtime) 说明当前 GA 语音代理、连接和会话路径。
- [Image generation](https://developers.openai.com/api/docs/guides/image-generation) 说明 Image API 与 Responses 图像工具的不同用途。
- [Migrate to the Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses) 仍提供 Chat Completions/旧 Assistants 到 Responses 的当前迁移差异。
- [Model guidance](https://developers.openai.com/api/docs/guides/latest-model) 提供当前模型族的选型、限制与迁移参数。

## 5. 对机制的验证

本轮验证了：

- 品牌重复不必删除：只要差异影响使用或选型，可以作为品牌证据收录；
- 页面仍在线不等于仍适用：弃用状态优先于链接存活；
- 快速开始不必独立建卡：可合并为主条目的操作入口；
- 核心品牌可以有较多资料，但数量来自差异密度，不来自配额；
- 同一候选可以当前有效但带复核触发条件，例如代理评测和模型指导页。

本批没有产生 `admitted-general`。这不是机制缺陷，而是因为知识地图已经存在智能体、工具调用、结构化输出、缓存、评测、实时交互和图像生成等通用主题；OpenAI 页面在本批主要承担品牌实现证据。

## 6. 数据处理

试审后 `official/openai` 独立资料卡由 5 条调整为 9 条。新增 Realtime API、Image generation、Responses migration 和 Model guidance；Agents SDK quickstart 只在审核记录中保留合并关系；Developer quickstart 与旧 Working with evals 不入库。

`Evaluate agent workflows` 设置 2026-11-30 复核触发点；`Model guidance` 在默认模型族或弃用公告变化时复核。试审结果由资料库校验器与结构化记录自动对照。
