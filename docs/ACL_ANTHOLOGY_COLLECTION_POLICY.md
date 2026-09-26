# ACL Anthology 待审文章收集要求

版本：1.0｜生效：2026-09-24｜统计快照：ACL Anthology 官方元数据提交 `e4d087a11bc06b4600281bba45c40f3ab7a41bbe`（2026-09-22）

本要求只定义哪些 ACL Anthology 记录进入审核候选池，不预判论文重要性，也不把会议录用、Findings 身份或 ACL 品牌当作通过依据。最终收录继续执行[学术投稿内容重要性审核机制](ACADEMIC_IMPORTANCE_POLICY.md)。

## 1. 时间与记录单位

- 本轮范围为出版年份 2024、2025、2026；2026 只统计快照时已经进入 ACL Anthology 官方元数据的记录，后续新增另做增量。
- 以 Anthology paper record 为基本单位；卷首、序言、完整论文集 PDF、索引页和活动页不计为论文。
- 优先用 Anthology ID 去重；再用 DOI，以及规范化题名加作者核查跨卷重复。修订版本不重复计数，撤回、更正与勘误作为当前状态证据保留。

## 2. 三路取并集

候选池 = 核心研究卷 ∪ 专业关键词补漏 ∪ 成熟评价与文献线索反查，合并后按论文身份去重。任一路命中即可入池。

### 2.1 核心研究卷

整卷纳入正式研究论文，不先按获奖、引用量或主题热度筛选：

- ACL、EMNLP、NAACL、EACL 主会的 long、short 或 main research paper 卷；
- AACL / IJCNLP-AACL、COLING / LREC-COLING 的主会研究论文卷；
- Findings of ACL、EMNLP、NAACL、EACL、AACL / IJCNLP；
- Transactions of the ACL（TACL）与 Computational Linguistics（CL）当年研究论文。

Findings 必须纳入候选池：它是正式研究论文出版通道，不能因为不在主会展示层级就提前排除；但 Findings 身份本身不构成重要性证据。

### 2.2 专业关键词补漏

对未进入核心研究卷的其他 Anthology 论文，在题名和摘要中使用版本化专业词表补漏，覆盖：

- 基础模型、语言模型、Transformer、注意力、状态空间与新架构；
- 预训练、后训练、微调、对齐、强化学习、推理与测试时计算；
- 检索增强、知识编辑、Agent、工具使用、规划与记忆；
- 多模态、视觉语言、语音语言与统一生成模型；
- 评测、可靠性、幻觉、安全、隐私、公平、鲁棒性与可解释性；
- 训练和推理效率、量化、蒸馏、稀疏化、MoE、长上下文与系统基础设施。

只命中宽泛词如 `AI`、`NLP`、`model`、`language` 或 `dataset` 不足以入池。命中只表示值得初筛，不证明相关性或重大性。

### 2.3 成熟评价与文献线索

- 反查 ACL 及相关会议、期刊的 Best Paper、Outstanding Paper、Test of Time / Classic Paper 等正式结果；奖项名称、年份和赛道必须原样保留。
- 从专业综述、技术回顾或已审核关键论文中反查明确讨论的基础方法和关键评测。
- Award、SAC Highlight、Oral、Best Demo、学生奖等标签均保留原级别；只有已启用的正式机制才可能进入后续重要性通过判断。

## 3. 默认不整卷纳入的材料

以下材料不通过“核心研究卷”整卷进入，但若命中成熟评价或明确文献线索，可单篇补入并保留受限身份：

- system demonstrations、tutorial abstracts、keynotes、invited talks；
- Student Research Workshop、doctoral consortium；
- workshop、shared task、challenge、system description 与 competition report；
- industry track、资源说明、数据论文和 survey-only 卷；
- 序言、组织者报告、目录、致谢、勘误和完整论文集记录。

这不是认定上述材料质量较低，而是避免把平台中的展示、教学、竞赛和组织材料与研究贡献论文混为一个候选总体。Workshop 中真正改变 AI 方法的论文仍可由第二或第三路补入。

## 4. 核心池快照

官方 XML 的 `<paper>` 记录计数排除了每卷额外的 frontmatter，因此可能比活动网页显示的“papers”少 1。当前核心研究卷基线为：

| 年份 | 主会研究卷 | Findings | TACL / CL | 核心池合计 |
|---|---:|---:|---:|---:|
| 2024 | 4,547 | 2,432 | 136 | 7,115 |
| 2025 | 5,218 | 3,414 | 120 | 8,752 |
| 2026（截至快照） | 2,741 | 2,517 | 126 | 5,384 |
| **合计** | **12,506** | **8,363** | **382** | **21,251** |

“主会研究卷”包含本节已列的 ACL 家族、AACL / IJCNLP-AACL 与 COLING / LREC-COLING 主卷；不含 demo、industry、tutorial、SRW。21,251 是三路合并前的核心基线，不是最终候选池总数；关键词和成熟线索补漏完成并去重后才能报告最终总量。

## 5. 初筛和审核衔接

候选池中的论文先按题名、摘要和出版信息标记为 `相关`、`待判断` 或 `范围外`。相关或待判断记录再进入既有六步审核；没有匹配到已启用正式评价机制的论文可按现行授权在重要性门槛处暂缓，但必须保留论文身份、命中渠道与暂缓原因。

普通录用、主会/Findings 身份、SAC Highlight、引用量与 Anthology 页面上的 Award 字段都不能跳过机制核验和 AI 重大贡献门槛。已在网站以 arXiv 或其他入口收录的同一成果只更新或合并证据，不新增重复卡片。

## 6. 完成口径

最终报告分别列出：各路线命中数、并集去重数、初筛三种状态、匹配正式机制数、完成六步审核数、暂缓/待复核数、最终收录数以及与既有资料合并数。任何未解析 XML、未完成年份、未处理奖项名单或关键词版本都必须列为覆盖缺口。

官方元数据以 ACL Anthology 的权威 XML 为准；抓取快照需保存提交哈希、提交时间、实际卷清单与生成程序版本，使后续增量能够复现。
