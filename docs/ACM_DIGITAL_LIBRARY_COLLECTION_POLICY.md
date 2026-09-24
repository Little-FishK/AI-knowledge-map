# ACM Digital Library 待审文章收集要求

版本：1.0｜生效：2026-09-24｜统计范围：ACM 自有出版物中出版年为 2024、2025、2026（截至 2026-09-24）的研究论文

本要求只定义哪些 ACM Digital Library 记录进入候选池，不把 ACM 出版、会议录用、期刊发表、引用、下载量或开放获取状态当作重要性结论。正式收录继续执行[学术投稿内容重要性审核机制](ACADEMIC_IMPORTANCE_POLICY.md)。

## 1. 来源特点

- ACM Digital Library 同时包含 ACM 自有全文出版物与跨出版社的 Guide to Computing Literature。为防止把索引记录误算成 ACM 论文，本轮只收 DOI 前缀为 `10.1145` 的 ACM 出版记录。
- ACM 自有出版物横跨会议录、期刊、杂志、通讯和其他内容。本轮只处理 `proceedings-article` 与 `journal-article`；杂志文章、书章、前言、勘误和非研究内容不进入候选池。
- ACM 已从 2026-01-01 起把期刊、会议录和杂志转为开放获取。开放获取只改变可访问性，不改变重要性判断。
- 不把 ACM 品牌、SIG 声望、期刊或会议名称、引用、下载量及搜索排序作为审核通过依据。

## 2. 三路候选入口

候选池为三路并集，以规范化 DOI 去重；任一路命中即可进入，但命中不等于审核通过。

### 2.1 AI 与相邻基础领域核心出版物

全量纳入配置中的 ACM 核心场馆研究论文，包括 SIGIR、KDD、CIKM、WSDM、RecSys、The Web Conference、ACM Multimedia、FAccT、AIES、IUI、HRI、SIGGRAPH／ACM Transactions on Graphics，以及 TIST、TKDD、TOIS、TORS、TOMM、ACM Transactions on Artificial Intelligence、ACM Journal on Responsible Computing 等。

这里有意覆盖信息检索、数据挖掘、推荐、负责任计算、智能交互、机器人交互和图形／生成方向。核心场馆全量入口是候选召回，不表示每一篇都与 AI 重大进展有关。

### 2.2 高精度 AI 技术题名补漏

跨全部 ACM 自有会议和期刊检索 foundation model、large language model、vision-language model、multimodal LLM、diffusion model、generative AI、retrieval-augmented generation、reinforcement learning、self-supervised learning、federated learning、machine unlearning、mixture of experts、in-context learning、test-time scaling／compute、AI alignment、AI safety、adversarial robustness、neural architecture search、model compression、AI／ML accelerator 与 LLM inference 等题名短语。

不把 `machine learning`、`deep learning`、`neural network` 或 `transformer` 单词命中单独作为全库入口，以避免候选池被一般应用论文淹没。

### 2.3 已启用正式评价反查

从当前 `enabled` 的 ACM 论文奖机制反查正式 winner：

- `sigir-2025-best`：SIGIR 2025 Best Paper Award；
- `facct-2025-best`：FAccT 2025 Best Paper Award；
- `siggraph-2025-best`：SIGGRAPH 2025 Technical Papers Best Paper。

Honorable Mention、学生奖和其他类别不继承正奖资格。`siggraph-2025-tot` 的获奖论文发表于 2013–2015 年，超出本轮 2024–2026 出版范围，不纳入本候选池。

## 3. 去重、年份与元数据

- 主键为规范化 DOI；ACM DOI 链接统一为 `https://dl.acm.org/doi/<doi>`。
- 出版年依次取 Crossref 的 `published`、`published-online`、`published-print`、`issued` 年份，且必须落在本轮范围。
- Crossref 仅作为 ACM DOI 前缀记录的批量元数据传输层；论文身份、奖项和当前状态仍以 ACM DL 与会议官方页面核验。
- 同一成果若已由 arXiv、OpenReview、PMLR、CVF 等来源进入资料库，发布阶段合并来源证据，不建立重复卡片。

## 4. 与重要性审核衔接

候选逐条匹配机制 ID、年份、会议、赛道、完整奖项和 winner 身份。未命中 enabled 机制的记录在步骤 2 暂缓；不会为数万篇普通录用制造重复的“无奖项”伪精读记录。

精确命中奖项后继续核验论文身份、当前状态和 AI 重大贡献三问。图形学、检索或公平治理的 Best Paper 仍需独立外部说明，明确其为何重大改变 AI 的理论、方法、架构、能力、基础设施或研究基础。

## 5. 当前候选池快照

扫描 ACM DOI 前缀下 101,756 条会议论文元数据与 20,695 条期刊论文元数据后，三路并集得到：

| 年份 | 去重后候选 |
|---|---:|
| 2024 | 7,481 |
| 2025 | 8,995 |
| 2026（截至 2026-09-24） | 7,930 |
| **合计** | **24,406** |

按内容类型：会议论文 19,210、期刊论文 5,196。按入口计数（可重叠）：核心出版物 14,970、高精度题名 11,687、正式评价反查 9；合并去重后为 24,406。

## 6. 完成口径与限制

机器可复核快照保存每个 Crossref 游标页的响应哈希、DOI、题名、作者、出版物、年份、类型和命中路线。报告必须分别给出候选数、分年数量、机制精确匹配、步骤 5 待补证、六步通过和最终可上线数。

本候选池不是 ACM Digital Library 所有 AI 相关论文的全集。它排除了 Guide 中的第三方出版物和低精度的一般应用命中，也受 Crossref 元数据完整性与日期字段影响。新增正式奖项机制、出版物别名、元数据修订或 2026 后续出版记录时应增量复审。

