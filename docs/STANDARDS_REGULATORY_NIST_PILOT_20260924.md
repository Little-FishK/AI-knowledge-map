# “标准与监管”NIST 单层审核试验

审核日期：2026-09-24｜适用机制：[标准与监管资料审核机制 v1.1](STANDARDS_REGULATORY_REVIEW_POLICY.md)｜结构化记录：[nist-pilot-20260924.json](../proposals/standards-regulatory/nist-pilot-20260924.json)

## 1. 测试范围

本轮只验证机制，不宣称穷尽 NIST 的全部 AI 资料。冻结范围为：

- 二级来源：`standards/nist`；
- 官方入口：NIST AI RMF 主页及资源页、NIST Publications、NIST CSRC、NIST AI Standards 页面；
- 候选类型：正式框架、配套指南、正式技术报告、初始公开草案、已被替代或撤销的历史稿、正式译本，以及用于负例验证的新闻页面；
- 时间范围：2021-10-20 至 2026-07-30；
- 检索与状态核查日：2026-09-24。

本范围是边界测试样本，不是 NIST 全量收集批次。以后进行全量收录时，必须另行冻结栏目、日期和分页范围。

## 2. 汇总结论

共审核 9 个候选：

| 结果 | 数量 | 含义 |
|---|---:|---|
| `admitted` | 4 | 独立资料对象，符合条件，应收录 |
| `merge-update` | 4 | 内容合格，但应作为既有对象的版本、译本或历史入口合并 |
| `pending` | 0 | 本轮没有无法判断的关键缺口 |
| `ineligible` | 1 | NIST 新闻页面不是独立标准或监管资料 |

结果验证了“合格全收”不等于“页面全收”：9 个页面均为 NIST 官方页面，但最终只有 4 个应成为独立资料卡；4 个应合并，1 个不应入库。

## 3. 逐项结果

### 3.1 NIST AI 100-1：AI Risk Management Framework 1.0

- 决定：`admitted`。
- 状态：`current`；NIST 页面同时说明 1.0 正在修订，不能据此把尚未发布的修订版当成现行文本。
- 约束力：`voluntary`，非美国法律强制要求。
- 适用边界：跨行业、用例无关，面向设计、开发、部署或使用 AI 系统的组织。
- 处理：新增独立主条目，并把后续 Playbook、译本和历史草案关联到它。
- 依据：[NIST 正式出版页](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10)、[AI RMF 主页](https://www.nist.gov/itl/ai-risk-management-framework)。

六项门槛均为 `pass`。正式编号、发布日期、自愿性质、AI 适用范围和当前修订状态均可由官方页面确认。

### 3.2 NIST AI 600-1：Generative AI Profile

- 决定：`merge-update`。
- 状态：`current`；约束力：`voluntary`。
- 原因：它是独立的生成式 AI 跨行业 Profile，内容适格，但资料库已存在 `nist-ai-600-1`，不应重复建卡。
- 处理：为既有条目补记正式编号、`current`、`voluntary`、跨行业适用范围以及与 AI RMF 1.0 的配套关系。
- 依据：[NIST 正式出版页](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)、[正式 PDF](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)。

六项门槛均为 `pass`；最终结果由去重规则从新增改为更新。

### 3.3 NIST AI RMF Playbook

- 决定：`admitted`。
- 状态：`current`；约束力：`guidance`。
- 独立用途：AI RMF 1.0 说明框架目标和结果，Playbook 提供 Govern、Map、Measure、Manage 四项功能的建议行动，回答实施问题，不是主框架的重复摘要。
- 限制：NIST 明确其内容会演进，并计划在 AI RMF 1.0 修订后更新；引用时必须保存查阅日期。
- 依据：[NIST AI RMF Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook)。

六项门槛均为 `pass`。

### 3.4 AI RMF Second Draft（2022-08-18）

- 决定：`merge-update`。
- 状态：`superseded`；约束力：`voluntary`。
- 原因：这是 NIST 官方公开征求意见稿，具有历史研究价值，但已由 2023 年 AI RMF 1.0 接替，不应作为现行框架或独立当前资料卡。
- 处理：作为 AI RMF 1.0 的版本历史和关联原件保存。
- 依据：[第二版草案 PDF](https://www.nist.gov/system/files/documents/2022/08/18/AI_RMF_2nd_draft.pdf)、[AI RMF Development](https://www.nist.gov/itl/ai-risk-management-framework/ai-rmf-development)。

六项门槛均为 `pass`；草案身份不会导致淘汰，版本关系决定合并。

### 3.5 AI RMF 1.0 Japanese Translation

- 决定：`merge-update`。
- 状态：`current`；约束力：`voluntary`。
- 原因：NIST 为日文译本建立了正式出版页和独立 DOI，但它仍是 AI RMF 1.0 的语言版本，不构成新的规范对象。
- 处理：作为 AI RMF 1.0 的正式译本入口关联，保留译本编号 `100-1 jpn` 和发布日期。
- 依据：[NIST 日文译本出版页](https://www.nist.gov/publications/ai-risk-management-framework-japanese-translation)。

六项门槛均为 `pass`。

### 3.6 NIST AI 100-2 E2025：Adversarial Machine Learning Taxonomy

- 决定：`admitted`。
- 状态：`current`；约束力：`guidance`。
- 独立用途：提供对抗性机器学习攻击与缓解措施的术语和分类体系，可支持 AI 安全概念、威胁分类及风险管理用语。
- 限制：官方页面列有潜在更新勘误；收录时必须关联 errata，不能把当前文本描述为无待修问题。
- 版本关系：该版是年度更新，不得与 2023 版和其初始公开草案混为同一发布日期或内容版本。
- 依据：[NIST CSRC 正式页](https://csrc.nist.gov/pubs/ai/100/2/e2025/final)、[正式 PDF](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf)。

六项门槛均为 `pass`。

### 3.7 NIST AI 100-2e2023 Initial Public Draft

- 决定：`merge-update`。
- 状态：`withdrawn`；约束力：`guidance`。
- 原因：官方 PDF 首页明确写明 2024-01-04 撤回，并指向 2024 年正式版。它可以保留为版本历史，不能作为现行建议单独建卡。
- 处理：关联到 AI 100-2 的版本链；同时记录后续 2025 年更新版，避免把“撤回”误解成整个 AML 分类项目已终止。
- 依据：[带撤回警示的官方 PDF](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2023.ipd.pdf)。

六项门槛均为 `pass`；准确识别撤回状态后合并。

### 3.8 Public-Facing AI Documentation “Zero Draft”

- 决定：`admitted`。
- 状态：`draft`；约束力：`guidance`。
- 独立用途：提供面向公众的 AI 文档指导与模板，是 NIST AI Standards Zero Drafts 项目的正式初始公开草案。
- 限制：NIST AI Standards 页面显示意见截止日为 2026-09-16，并说明后续可能形成最终修订；截至本轮核查，不能把它写成最终标准。
- 依据：[NIST 出版页](https://www.nist.gov/publications/guidance-and-templates-public-facing-ai-documentation-ai-standards-zero-draft-initial)、[NIST AI Standards 页面](https://www.nist.gov/artificial-intelligence/ai-standards)。

六项门槛均为 `pass`。本例证明草案可以收录，但状态必须直接进入标题附近的展示信息。

### 3.9 “AI RMF Workshop Attracts 800+”新闻页面

- 决定：`ineligible`。
- 门槛结果：官方身份 `pass`、AI 相关性 `pass`、对象适格 `fail`；后续状态、适用边界和版本去重记 `not-assessed`。
- 原因：这是研讨会新闻和参与人数报道，不是框架、标准、指南、正式草案或执法材料。页面内链接的正式草案和 RFI 分析应分别审核，不能让新闻页代替原件。
- 依据：[NIST 新闻页](https://www.nist.gov/news-events/news/2021/10/ai-risk-management-framework-workshop-attracts-800)。

本结果不否定新闻的发现价值，只是不把它建立为“标准与监管”资料对象。

## 4. 对机制的验证结果

六项硬门槛能够稳定区分：

- 官方发布与官方站内非规范性页面；
- 当前正式版本与草案、撤回稿、被替代稿；
- 独立资料对象与译本、版本、配套入口；
- 文件当前状态与法律/规范约束力。

试验同时发现一项术语缺口：原 v1.0 状态表没有适合“正式发布、当前可用、但自愿采用”的值。若使用 `effective`，可能被误解为法律生效。因此机制 v1.1 新增 `current`，并继续把 `voluntary` 或 `guidance` 记录在独立的约束力字段中。

## 5. 后续动作

1. 将现有 `nist-ai-600-1` 按本记录补齐状态、约束力和版本关系，不重复新增。
2. 若维护者批准试验结果，可新增 AI RMF 1.0、AI RMF Playbook、AI 100-2 E2025 和 Public-Facing AI Documentation Zero Draft 四个独立资料对象。
3. 在正式开展 NIST 全量收集前，另行制定覆盖栏目、日期、分页和完成计数；本试验不能冒充全量审核。
4. 下一轮用法规型来源测试 `binding`、`adopted` 和 `effective`，因为 NIST 样本主要验证的是自愿标准、框架和指南。
