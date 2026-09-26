# OpenAI 官方技术资料分类发布记录（2026-09-24）

对通过 10 分制门槛（总分至少 6 分，且知识重要性至少 2 分）的 258 条 OpenAI 官方技术资料，增加一层来源内部的知识主题分类。该分类用于浏览和检索，不改变准入结论、核心/补充分层、评分或来源等级。

| 分类标识 | 中文名称 | 数量 |
| --- | --- | ---: |
| `security-governance` | 安全、身份与企业治理 | 53 |
| `responses-agents-tools` | Responses、Agents 与工具 | 49 |
| `codex-engineering` | Codex 工程与工作流 | 30 |
| `mcp-plugins-skills` | MCP、插件与技能 | 28 |
| `production-observability` | 生产工程与可观测性 | 24 |
| `multimodal-realtime` | 多模态、语音与实时 | 22 |
| `evals-finetuning` | 评测、微调与质量优化 | 18 |
| `models-prompting-output` | 模型、提示与输出 | 17 |
| `migration-lifecycle` | 迁移与生命周期 | 11 |
| `agentic-commerce` | Agentic Commerce 与交易协议 | 6 |

总计：258 条。

## 发布规则

- 每条已发布 OpenAI 资料必须且只能有一个 `primaryCategory`。
- `topicTags` 至少包含该主分类；搜索同时覆盖分类的中英文显示名称。
- 10 类筛选只在用户明确选择“官方技术资料 / OpenAI”时显示，避免污染其他品牌和来源的导航。
- 分类依据来自逐条审核记录中的 `matrixContribution`，由生成器确定性映射；未知贡献类型会使生成失败，不能静默落入“其他”。
- 校验器锁定 10 类、258 条总数和逐类数量，防止生成数据、审核记录和前台卡片漂移。
