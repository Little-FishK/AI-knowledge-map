# DeepSeek 官方技术资料学习候选池预筛（2026-09-24）

## 结论

- DeepSeek 第一方官方技术资料：**175 份**（中英文页面按同一资料去重）。
- 按“学习资料、优先对所有 AI 有用”的口径预筛后：**29 份**进入逐份重要性审核。
- 预筛淘汰：**146 份**。
- 29 份是候选池，不等于审核通过数，也不等于最终建卡数。

## 与 OpenAI、Anthropic 对齐的候选池口径

1. 只统计 DeepSeek 有发布资格的第一方资料；中英文版本只算一份。
2. 技术论文归学术一级来源；GitHub/Hugging Face 仓库、模型权重和源码归开源项目，不在本一级来源重复统计。
3. 先完整盘点 API 文档、主站技术动态、透明度材料和官方 Harness 文档，再做学习价值预筛。
4. 只保留能够迁移到其他模型、平台或 Agent 框架的知识。
5. 排除 API 参数、快速开始、价格/限流/错误码、集成操作、具体型号发布、模型卡、训练数据型号摘要、法律条款和 Harness 专属界面/插件参考。
6. 预筛通过项仍需逐份判断时效性、知识增量、替代关系和是否值得“一资料一卡”。

## 官方资料族与结果

| 官方资料族 | 原始资料 | 进入重要性审核 | 预筛淘汰 |
|---|---:|---:|---:|
| DeepSeek API Docs | 52 | 3 | 49 |
| DeepSeek Harness Docs | 94 | 25 | 69 |
| DeepSeek 主站（英文代表页，语言去重） | 23 | 0 | 23 |
| DeepSeek 透明度技术材料 | 6 | 1 | 5 |
| **合计** | **175** | **29** | **146** |

官方入口：

- <https://api-docs.deepseek.com/sitemap.xml>
- <https://www.deepseek.com/sitemap.xml>
- <https://www.deepseek.com/en/transparency/>
- <https://deepseek-harness.github.io/deepseek-harness/en/>
- <https://cdn.deepseek.com/policies/en-US/model-algorithm-disclosure.html>

## 29 份候选的构成

- API 通用机制：3 份——上下文缓存、思考模式、工具调用。
- Harness 可迁移架构：25 份——Agent 生命周期、能力边界、会话、压缩、工具执行、审批、权限、沙箱、子代理、系统提示、LLM 流式处理、持久化、规划、技能、工作流等。
- 模型原理与训练方法总览：1 份。

## 主要淘汰原因

| 原因 | 数量 |
|---|---:|
| Harness 具体子系统、界面或低通用性页面 | 29 |
| Harness 教程与开发操作 | 25 |
| 首页、索引或更新日志 | 22 |
| 型号发布公告与版本跑分 | 18 |
| Harness 生成式参考、配置与插件参考 | 15 |
| 快速开始、集成、价格、错误码、限流或用量 | 12 |
| API 请求/响应参考 | 9 |
| 模型卡与具体型号训练数据摘要 | 5 |
| 单一 API 功能指南 | 4 |
| DeepSeek 产品接口操作 | 4 |
| 法律与数据处理条款 | 3 |

## 数据文件

- 审核明细：`proposals/official-technical/deepseek-learning-prefilter-20260924.json`
- 可复现脚本：`tools/deepseek-official-review/build-learning-prefilter.js`

