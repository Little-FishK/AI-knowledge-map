# OpenAI 官方技术资料重要性审核进度

审核机制：`official-technical-importance-v2`

机制说明：[OFFICIAL_TECHNICAL_REVIEW_POLICY.md](./OFFICIAL_TECHNICAL_REVIEW_POLICY.md)

审核母集：[openai-rereview-inventory-20260924.json](../proposals/official-technical/openai-rereview-inventory-20260924.json)

## 重新开始

此前四批审核只足以判断页面是否独立，没有把“重要性”作为建卡前的硬门槛，其通过结论全部作废。旧批次数据不再由资料库加载，也不参与当前校验。

新的审核顺序是：官方性 → 知识对应 → 重要性 → 边际增量 → 时效性 → 建卡粒度。只有前五项通过，才进入“一份资料是否一张卡”的判断。

## 母集状态

| 项目 | 数量 |
|---|---:|
| 官方目录原始条目 | 983 |
| 目录或整集合导出 | 11 |
| 重复路由 | 43 |
| 独立内容候选 | 929 |
| 已完成重要性审核 | 929 |
| 已通过并建卡 | 258 |
| 已淘汰 | 671 |
| 待重要性审核 | 0 |

## 新第一批：200 份

第一批取官方母集按原始目录顺序排除容器和重复路由后的前 200 份，不按预计通过率抽样。

| 结论 | 数量 |
|---|---:|
| 核心资料 | 57 |
| 必要补充资料 | 52 |
| 当前迁移资料 | 5 |
| **通过合计** | **114** |
| 低重要性 | 47 |
| 已弃用、临近关闭或被当前路径替代 | 22 |
| 知识重复 | 10 |
| 目录、导航或信息流 | 7 |
| **淘汰合计** | **86** |

本批前 60 份通过清单已完成 10 分制价值复核：51 份通过，9 份因总分低于 6 分或知识重要性低于 2 分移出前台。整批当前通过率为 57%。这个比例不是目标，也不影响后续批次；每份资料仍按相同硬门槛独立判断。

下一组 60 份通过清单也已完成价值复核：53 份通过，7 份移出前台；两批累计已评分 120 份，保留 104 份，淘汰 16 份。第二批逐项结果见 [OFFICIAL_TECHNICAL_OPENAI_VALUE_SCORE_BATCH_02_20260924.md](./OFFICIAL_TECHNICAL_OPENAI_VALUE_SCORE_BATCH_02_20260924.md)。

第三组 60 份完成价值复核：56 份通过，4 份移出前台；三批累计已评分 180 份，保留 160 份，淘汰 20 份。第三批逐项结果见 [OFFICIAL_TECHNICAL_OPENAI_VALUE_SCORE_BATCH_03_20260924.md](./OFFICIAL_TECHNICAL_OPENAI_VALUE_SCORE_BATCH_03_20260924.md)。

第四组 60 份完成价值复核：56 份通过，4 份移出前台；四批累计已评分 240 份，保留 216 份，淘汰 24 份。第四批逐项结果见 [OFFICIAL_TECHNICAL_OPENAI_VALUE_SCORE_BATCH_04_20260924.md](./OFFICIAL_TECHNICAL_OPENAI_VALUE_SCORE_BATCH_04_20260924.md)。

本批保留的代表性主资料包括 Agents 运行时比较、Function calling、MCP、Computer use、Conversation state、Prompt caching、Structured Outputs、模型选型、生产最佳实践、安全与数据控制。快速开始、ChatKit 界面定制、云沙箱厂商配置、Terraform 操作变体、旧模型专题页，以及即将关闭的 Evals/Agent Builder 操作文档没有因“页面独立”而建卡；必要的迁移指南则按过渡资料保留。

逐项决定：[openai-importance-batch-01.json](../proposals/official-technical/openai-importance-batch-01.json)

## 新第二批：200 份

第二批为冻结母集中的第 201—400 份候选，包括 28 份指南和 172 份 API Reference。API Reference 的单个 CRUD 方法、参数页和窄事件查询页不因“实现时可能查阅”而自动建卡；只有承担关键协议、事件模型、安全边界或选型作用的参考资料通过。

| 结论 | 数量 |
|---|---:|
| 核心资料 | 8 |
| 必要补充资料 | 12 |
| **通过合计** | **20** |
| 低重要性 | 131 |
| 知识重复 | 32 |
| 已弃用、临近关闭或被当前路径替代 | 13 |
| 目录、导航或信息流 | 4 |
| **淘汰合计** | **180** |

本批最终通过率为 10%。保留对象主要是 Embeddings、Vision fine-tuning、Voice agents、Web search、Webhooks、WebSocket Mode、Workload identity federation、MCP server、模型比较，以及少数完整事件协议参考。第三批发现当前正式版 Responses WebSocket 事件参考后，第二批的 Beta 事件页被替换并改判为知识重复。大量方法级 API Reference 只保留在官方站点作为查表入口，不转化为知识卡。

逐项决定：[openai-importance-batch-02.json](../proposals/official-technical/openai-importance-batch-02.json)

## 新第三批：200 份

第三批为冻结母集中的第 401—600 份候选，包括 43 份 API Reference、155 份 ChatGPT/Codex 文档和 2 份插件文档。

| 结论 | 数量 |
|---|---:|
| 核心资料 | 34 |
| 必要补充资料 | 32 |
| 当前迁移资料 | 1 |
| **通过合计** | **67** |
| 低重要性 | 90 |
| 目录、导航或信息流 | 22 |
| 知识重复 | 15 |
| 已弃用、临近关闭或被当前路径替代 | 6 |
| **淘汰合计** | **133** |

本批通过率为 33.5%。保留对象集中在 Responses 正式协议、Codex 沙箱与审批、Agent 配置、技能与插件、运行环境、企业权限和治理、Codex Security，以及 WebMCP 和插件发布规范。设置页、命令速查、产品功能入口、安装教程、第三方集成变体和方法级 API Reference 不建卡。

逐项决定：[openai-importance-batch-03.json](../proposals/official-technical/openai-importance-batch-03.json)

## 新第四批：200 份

第四批为冻结母集中的第 601—800 份候选，包括插件开发文档、Workspace Agents、Agentic Commerce、官方开发博客、Cookbook 和学习资源。

| 结论 | 数量 |
|---|---:|
| 核心资料 | 13 |
| 必要补充资料 | 56 |
| 当前迁移资料 | 3 |
| **通过合计** | **72** |
| 低重要性 | 60 |
| 知识重复 | 49 |
| 目录、导航或信息流 | 14 |
| 已弃用、被替代或合并 | 5 |
| **淘汰合计** | **128** |

收紧后本批通过率为 36%。保留对象集中在插件架构与安全、Workspace Agent 身份与触发协议、Agentic Commerce 交易与支付规范，以及具有独立工程方法的官方技术文章和 Cookbook。Cookbook、Developer Blog 和 Learning Resources 的通过项统一降为补充层；SDK 语言版本和示例仓库并入对应主资料。

逐项决定：[openai-importance-batch-04.json](../proposals/official-technical/openai-importance-batch-04.json)

## 新第五批：129 份

第五批为冻结母集中的第 801—929 份候选，包括学习资源尾部、概览视频、Developer Showcase 和 Ads 文档。

| 结论 | 数量 |
|---|---:|
| 核心资料 | 0 |
| 必要补充资料 | 0 |
| **通过合计** | **0** |
| 低重要性 | 98 |
| 知识重复 | 23 |
| 目录、导航或信息流 | 8 |
| **淘汰合计** | **129** |

收紧后本批通过率为 0%。73 个 Showcase 页面只证明案例存在，没有稳定、可迁移的实现知识，全部不建卡；概览视频和前批指南的旧路由同样不重复收录。18 条原已通过的 Ads 资料全部移出 AI 专业知识默认资料库，继续保留在审计账本中。

逐项决定：[openai-importance-batch-05.json](../proposals/official-technical/openai-importance-batch-05.json)

## 完成状态

冻结母集中的 929 份独立候选已全部完成原重要性审核；价值评分已完成四批共 240 份。当前通过 258 份，淘汰 671 份，总通过率 27.8%。后续批次继续执行“总分至少 6 分且知识重要性至少 2 分”的门槛。
