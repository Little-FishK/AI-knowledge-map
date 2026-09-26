# OpenAI 官方技术资料价值评分：第二批 60 份

日期：2026-09-24  
机制：`openai-official-value-score-v1`

## 评分规则

每份资料总分 10 分：知识重要性 0–3 分、不可替代性 0–3 分、持久性 0–2 分、适用范围 0–2 分。只有同时满足以下条件才保留：

- 总分至少 6 分；
- 知识重要性至少 2 分。

地图关联不参与评分，也不是准入门槛。

## 第二批结果

第二批为第一批之后，收紧清单中按原审核顺序排列的下一组 60 份未评分资料。

| 结果 | 数量 |
|---|---:|
| 核心资料（8–10 分） | 29 |
| 补充资料（6–7 分） | 20 |
| 迁移资料 | 4 |
| **保留** | **53** |
| **删除** | **7** |

被删除的 7 份资料为：

| 资料 | 总分 | 知识重要性 | 淘汰原因 |
|---|---:|---:|---|
| OpenAI models in Amazon Bedrock | 5 | 2 | 渠道差异与配置范围窄，且易随平台变化 |
| Prompt cache diagnostics | 5 | 2 | 诊断子流程可由缓存主指南和日志方法替代 |
| Prompting GPT-Live | 5 | 2 | 单一产品的提示技巧，跨场景增量有限 |
| Realtime translation | 5 | 2 | 主要是转写与语音能力的特定组合 |
| Reinforcement fine-tuning use cases | 5 | 2 | 关键机制已由强化微调主指南覆盖 |
| Sandbox lifecycle | 5 | 2 | 操作流程可由沙箱主资料覆盖 |
| Spend limits | 5 | 1 | 属于管理配置，不是核心技术知识 |

逐条四维分数与理由保存在 [`openai-value-score-batch-02.json`](../proposals/official-technical/openai-value-score-batch-02.json)。淘汰项从前台资料库删除，原始候选、分数和淘汰理由仍保留在审计记录中。
