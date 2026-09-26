# OpenAI 官方技术资料价值评分：第一批 60 份

日期：2026-09-24  
机制：`openai-official-value-score-v1`

## 评分规则

每份资料总分 10 分：知识重要性 0–3 分、不可替代性 0–3 分、持久性 0–2 分、适用范围 0–2 分。只有同时满足以下条件才保留：

- 总分至少 6 分；
- 知识重要性至少 2 分。

地图关联不参与评分，也不是准入门槛。

## 第一批结果

第一批为收紧后通过清单按原审核顺序排列的前 60 份资料。

| 结果 | 数量 |
|---|---:|
| 核心资料（8–10 分） | 29 |
| 补充资料（6–7 分） | 21 |
| 迁移资料 | 1 |
| **保留** | **51** |
| **删除** | **9** |

被删除的 9 份资料为：

| 资料 | 总分 | 知识重要性 | 淘汰原因 |
|---|---:|---:|---|
| GPT Action authentication | 5 | 2 | 总分不足 |
| GPT Actions | 4 | 1 | 总分与知识重要性均不足 |
| Production notes on GPT Actions | 5 | 2 | 总分不足 |
| Admin APIs | 5 | 1 | 总分与知识重要性均不足 |
| ChatGPT Developer mode | 5 | 1 | 总分与知识重要性均不足 |
| Custom voices | 5 | 1 | 总分与知识重要性均不足 |
| Error codes | 6 | 1 | 虽达到总分线，但知识重要性不足 |
| Fast mode | 4 | 1 | 总分与知识重要性均不足 |
| Image generation（工具子页） | 4 | 2 | 已被图像生成主指南覆盖，总分不足 |

逐条四维分数与理由保存在 [`openai-value-score-batch-01.json`](../proposals/official-technical/openai-value-score-batch-01.json)。淘汰项从前台资料库删除，原始候选、分数和淘汰理由仍保留在审计记录中。
