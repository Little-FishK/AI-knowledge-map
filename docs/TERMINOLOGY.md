# 中英术语表

本项目使用 `data/locales/terminology.js` 作为中英术语决策的唯一数据源。中文节点名称继续由 `data/graph.js` 管理，术语表不复制中文权威数据；它分别记录英文页面标题、页面涉及的规范术语、可接受别名、应避免写法、语境、说明、参考来源和审核状态。

## 当前范围

- 图谱节点：130/130 已进入术语清单
- 项目已批准英文名称：130
- 待审英文名称：0
- 外部来源逐条复核：113
- 非节点通用术语：尚未系统收录

“项目已批准”表示该名称已用于当前英文图谱内容，并通过项目一致性检查；它不代表已经逐条对照国家标准或国际标准。`standardsReview` 单独记录外部标准复核进度，避免把内部使用决定误写成标准结论。

## 参考来源优先级

1. 中文基础 AI 术语优先参考 [GB/T 41867—2022《信息技术 人工智能 术语》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=195F522C14AD9A1A0094FF66D0B1EF1B)。
2. 英文正式概念边界参考 [ISO/IEC 22989:2022](https://www.iso.org/standard/74296.html)。
3. 机器学习、LLM 和生成式 AI 的工程用法参考 [Google Machine Learning Glossary](https://developers.google.com/machine-learning/glossary)。
4. 软件界面及产品本地化用语参考 [Microsoft Terminology](https://learn.microsoft.com/globalization/reference/microsoft-terminology)。
5. 标准未覆盖或行业尚未统一的前沿术语，由项目明确选择并记录例外理由。

外部资料用于核对术语和概念边界，不批量复制受版权保护的定义。项目说明使用原创表达，并在术语条目中记录参考来源。

## 状态

| 状态 | 含义 | 是否可用于发布英文内容 |
|---|---|---|
| `draft` | 尚未确定英文标准名称 | 否 |
| `reviewed` | 已完成初步术语核对，等待项目批准 | 否 |
| `approved` | 已批准为项目标准名称 | 是 |

`standardsReview` 使用独立的 `pending` / `reviewed` 状态。项目可以先批准行业通用写法，再补做标准来源核对，但不能把 `pending` 描述为“符合国家或国际标准”。

## 条目规则

每个术语以稳定节点 ID 为键，至少形成以下信息：

- `zhHans`：运行时从中文图谱读取，不在术语表重复维护；
- `displayTitle`：网站中显示的唯一英文页面标题；
- `canonicalTerms`：页面所涉及的一个或多个可复用规范术语；复合页面标题必须拆分记录；
- `acceptedAliases`：正文中可接受的缩写或替代形式；
- `avoid`：容易混淆、格式错误或不适合本项目的写法；
- `context`：同一英文词在不同领域含义不同时的适用语境；
- `note`：首次展开、大小写、连字符或概念边界说明；
- `references`：实际参考过的来源 ID；
- `status`：项目审核状态；
- `standardsReview`：外部标准复核状态。

别名数量不要求和中文源记录相同。不同语言的合理别名数量天然可能不同；门禁检查重复别名和禁用写法，而不是为了结构对称制造重复英文。

## 发布流程

每批英文内容按以下顺序处理：

1. 从本批中文原文提取关键术语。
2. 在术语表中确定标准英文、别名、禁用写法和语境。
3. 将术语状态推进到 `reviewed`，完成复核后再改为 `approved`。
4. 使用已批准术语翻译节点正文。
5. 运行术语、结构、内部引用和中文残留检查。
6. 语义复核通过后，将完整英文记录标记为 `published`。

发布门禁要求每个英文节点的标题与术语表 `displayTitle` 完全一致。正文中的概念用词以 `canonicalTerms` 为准。术语条目可以先于正文获批，但正文不能在术语仍为 `draft` 或 `reviewed` 时发布。

## 当前重点例外

| 概念 | 项目标准英文 | 约束 |
|---|---|---|
| `agent` | AI Agent | 与 RL agent 区分；不使用 `Proxy` 作为该概念名称 |
| `alignment` | AI Alignment | `Alignment Training` 只表示训练过程，不能替代整个概念 |
| `fine-tuning` | Fine-tuning | 固定使用连字符写法 |
| `post-training` | Post-training | 固定使用连字符写法 |
| `llm` | Large Language Model (LLM) | 首次出现使用全称，后续可用 LLM |
| `rag` | Retrieval-Augmented Generation (RAG) | 首次出现使用全称，后续可用 RAG |
| `mcp` | Model Context Protocol (MCP) | 首次出现展开协议全称 |
| `pretraining` | Pre-training | `Pretraining` 作为可接受行业变体 |
| `agent` | AI Agent | 页面标题面向读者；规范术语为 `Agent`，并与 RL agent 区分 |
| `tool-calling` | Tool Calling | `Function Calling` 作为平台相关别名或更具体的工具类型 |
| `cot` | Chain of Thought (CoT) | 作前置修饰语时允许 `chain-of-thought` |
| `multimodal` | Multimodal Models | `Multimodal AI` 只用于更宽泛的领域语境 |

## 检查

运行：

```bash
npm run test:terminology
npm run i18n:inventory
```

术语检查会验证 130 个节点均存在清单记录、审核状态有效、参考来源存在、别名与禁用写法不重复，以及所有已发布英文节点的标题都与批准术语一致。
