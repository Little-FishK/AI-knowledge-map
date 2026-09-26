# IEEE Xplore 待审文章收集要求

版本：1.0｜生效：2026-09-24｜统计范围：IEEE Xplore 中出版年为 2024、2025、2026 的研究论文记录

本要求只定义哪些 IEEE Xplore 记录进入候选池，不把 IEEE 出版、会议录用、期刊分区、Early Access、引用或下载量当作重要性结论。正式收录继续执行[学术投稿内容重要性审核机制](ACADEMIC_IMPORTANCE_POLICY.md)。

## 1. 来源特点

- IEEE Xplore 同时收录期刊与杂志、会议、图书、课程和标准，并含 IEEE 之外的出版合作方；它不是单一会议论文集。
- 本轮只处理可唯一定位到 IEEE article number 的会议论文、期刊论文和 Early Access 论文。图书、课程、标准及非论文内容不进入学术论文候选池。
- Early Access 已通过同行评审并可引用，但可能尚未分配卷期；后续卷期记录与 Early Access 以 article number 和 DOI 合并，不重复计数。
- 期刊、会议与奖项机制各自独立。IEEE 品牌、某刊某会声望、引用量、下载量和检索排名都不能代替正式评价或 AI 重大贡献证据。

## 2. 三路候选入口

候选池为三路并集，按 IEEE article number 去重；任一路命中即可进入，不能把命中解释为审核通过。

### 2.1 AI 与计算智能核心出版物

全量纳入 2024–2026 年以下出版物或会议系列的研究论文记录：TAI、TNNLS、TPAMI、TETCI、TFS、TEVC、Transactions on Games、Computational Intelligence Magazine、Intelligent Systems、TCDS、TAffective，以及 IJCNN、IEEE CAI、ICDM、ICRA、IROS、ICMLA、SSCI、FUZZ-IEEE、IEEE CEC 等配置项。

出版题名按 IEEE Xplore 实际字段检索。若某个简称或短语为零命中，记录为覆盖缺口，不用近似名称臆造记录。

### 2.2 高精度 AI 技术题名补漏

跨所有刊会检索下列题名短语：foundation model、large language model、vision-language model、multimodal large language model、diffusion model、generative AI、self-supervised learning、reinforcement learning、federated learning、machine unlearning、retrieval-augmented generation、mixture of experts、in-context learning、test-time scaling、AI alignment、AI safety、adversarial robustness、model compression、neural architecture search、AI/ML accelerator 与 LLM inference。

不把 `machine learning`、`deep learning`、`neural network`、`transformer` 单词命中单独作为全库入口。2026-09-24 的界面核查中，仅题名包含 `machine learning`、`deep learning`、`transformer` 就分别返回 32,972、35,052、23,015 条；大量记录是行业应用移植。核心出版物全量路线与更精确的技术短语用于保留可审核的召回范围。

单次检索超过 IEEE Xplore 可稳定分页的约一万条时按年份拆分。本轮 `reinforcement learning` 已按 2024、2025、2026 三年分别抓取。

### 2.3 成熟评价与文献线索反查

从 IEEE 或会议官方最终论文奖名单反查论文记录。当前启用 ICRA 2024 与 ICRA 2025 的 `IEEE ICRA Best Conference Paper Award` 正奖；finalist、学生奖和专题奖不继承主会正奖资格。ICRA 2026 官方页面在检查日只列 finalists，因此不能推定 winner。

## 3. 去重与年份

- 以 IEEE article number 为主键；DOI 用于交叉核验。
- 出版年以 IEEE Xplore `publicationYear` 为本轮统计口径。会议日期与加入 Xplore 日期另有字段时不互相替代。
- Early Access 与最终卷期是同一 article number 时只计一次；同一成果若已从 arXiv、CVF、PMLR、OpenReview 等来源进入资料库，发布阶段合并来源与证据，不建重复卡片。

## 4. 与重要性审核衔接

候选逐条匹配机制 ID、获奖年、会议、赛道、完整奖项名和 winner 身份。未命中 enabled 机制的记录在步骤 2 暂缓；不会为 63,000 余篇论文重复制造“没有获奖”的伪精读记录。

精确命中奖项后继续核验论文身份、当前状态与 AI 重大贡献三问。机器人、控制、视觉里获得 Best Paper 的论文仍需外部专业说明，明确其为何对 AI 的理论、方法、架构、能力、基础设施或研究基础形成重大改变。

## 5. 当前候选池快照

| 年份 | 去重后候选 |
|---|---:|
| 2024 | 21,594 |
| 2025 | 26,917 |
| 2026（截至 2026-09-24） | 15,098 |
| **合计** | **63,609** |

按内容类型：期刊论文 23,052、会议论文 38,189、Early Access 2,368。按入口计数（可重叠）：核心出版物 27,812、高精度技术题名 37,837、成熟评价反查 4；三路合并去重后为 63,609。

## 6. 完成口径与限制

机器可复核快照保存每个查询、页码、官方结果总数、响应哈希、逐条 article number、DOI、题名、作者、摘要和命中路线。报告必须分别给出候选数、分年数量、机制精确匹配、步骤 5 待补证、六步完成和最终可上线数。

本候选池不是 IEEE Xplore 所有 AI 相关论文的全集：它以高召回的核心出版物和高精度技术题名补漏为可执行边界，并明确接受对一般应用论文的召回不足。新增正式奖项、官方结果、出版题名变体或后续卷期时做增量复审。

