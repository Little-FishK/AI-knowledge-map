# OpenAI 官方技术资料价值评分：第四批 60 份

日期：2026-09-24  
机制：`openai-official-value-score-v1`

## 评分规则

每份资料总分 10 分：知识重要性 0–3 分、不可替代性 0–3 分、持久性 0–2 分、适用范围 0–2 分。只有同时满足以下条件才保留：

- 总分至少 6 分；
- 知识重要性至少 2 分。

地图关联不参与评分，也不是准入门槛。

## 第四批结果

第四批为第三批之后，收紧清单中按原审核顺序排列的下一组 60 份未评分资料。

| 结果 | 数量 |
|---|---:|
| 核心资料（8–10 分） | 35 |
| 补充资料（6–7 分） | 20 |
| 迁移资料 | 1 |
| **保留** | **56** |
| **删除** | **4** |

被删除的 4 份资料为：

| 资料 | 总分 | 知识重要性 | 淘汰原因 |
|---|---:|---:|---|
| WSL | 5 | 1 | 主要是平台安装与排障变体，缺少独立核心知识 |
| 15 lessons learned building ChatGPT Apps | 5 | 2 | 关键方法已被插件、技能和 MCP 主文档覆盖 |
| Automating repetitive work at OpenAI with Codex | 5 | 2 | 案例机制已由 WebMCP、技能和长任务资料覆盖 |
| Custom Code Review rules for Codex | 5 | 2 | 已被代码审查和项目指令资料覆盖 |

逐条四维分数与理由保存在 [`openai-value-score-batch-04.json`](../proposals/official-technical/openai-value-score-batch-04.json)。淘汰项从前台资料库删除，原始候选、分数和淘汰理由仍保留在审计记录中。
