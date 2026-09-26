# OpenReview ICLR 2024 至 2026 审核结果

## 结论

本轮按《学术投稿内容重要性审核机制 1.2》处理 ICLR 2024、2025、2026 主会录用论文。组织方公布的录用决定总数为 11,319 篇；最终 ICLR Proceedings 可逐篇确认 11,314 篇，另有 5 篇存在“录用统计中存在、终版论文集中缺失”的身份差额，单列复核。

在 11,314 篇已确认论文中，10 篇与三届 ICLR Outstanding Paper 正奖名单精确匹配并进入完整重要性审核，其余论文因只有普通录用或展示等级，在第二步按规则暂缓。普通录用、Oral、Spotlight、Poster、OpenReview 分数和正面评语均未被当作通过通道。

最终结果为：

| 结果 | 数量 | 含义 |
|---|---:|---|
| 通过 | 5 | 正式正奖、论文身份、AI 重大贡献和内容检查均闭合 |
| 暂缓 | 11,307 | 当前没有启用的正式评价机制，或正奖成立但重大贡献证据仍未闭合 |
| 已识别复核 | 1 | 正奖成立，但官方评语同时保留关键批评且影响仍属前瞻判断 |
| 范围外 | 1 | 正奖和科研价值成立，但证据指向 AI 在其他学科的优秀应用，未证明对 AI 本身形成重大推动 |
| 身份待核 | 5 | 计入官方录用总数，但未进入最终 Proceedings，尚不能建立逐篇正式记录 |
| 合计 | 11,319 | 与三届组织方公布的录用决定数一致 |

## 分年度结果

| 年份 | 录用决定数 | 论文集可确认 | 正奖论文 | 通过 | 暂缓 | 复核 | 范围外 | 身份待核 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 2024 | 2,260 | 2,260 | 5 | 4 | 2,255 | 0 | 1 | 0 |
| 2025 | 3,704 | 3,703 | 3 | 0 | 3,703 | 0 | 0 | 1 |
| 2026 | 5,355 | 5,351 | 2 | 1 | 5,349 | 1 | 0 | 4 |

“暂缓”包含在第二步提前停止的普通录用论文，也包含正式获奖成立但 AI 重大贡献证据不足的论文。它不表示论文不重要或质量不高。

## 通过论文

### ICLR 2024

1. [Generalization in diffusion models arises from geometry-adaptive harmonic representations](https://proceedings.iclr.cc/paper_files/paper/2024/hash/cbaf319a4712385b5ba8a414808b5713-Abstract-Conference.html)
   - 委员会把该工作定位为理解图像扩散模型何时从记忆转向泛化的关键缺口，并将结果连接到架构归纳偏置和调和表示。
   - 边界：不能外推为所有扩散模型均不会记忆。

2. [Learning Interactive Real-World Simulators](https://proceedings.iclr.cc/paper_files/paper/2024/hash/c4d66eae503694424123b93ac0fbaf17-Abstract-Conference.html)
   - 委员会确认 UniSim 是把异构机器人数据统一用于基础模型训练的重要推进，并明确评价其统一视觉和语言控制接口的价值。
   - 边界：不能描述为已实现普适、准确的现实世界模拟。

3. [Never Train from Scratch: Fair Comparison of Long-Sequence Models Requires Data-Driven Priors](https://proceedings.iclr.cc/paper_files/paper/2024/hash/07cf32cf61224da628157b7ed0ce994a-Abstract-Conference.html)
   - 委员会确认从头训练会系统性低估长序列架构，并指出预训练和微调带来显著差异，改变了架构比较应采用的方法条件。
   - 边界：结论受所比较模型、数据先验和训练设置约束。

4. [Vision Transformers Need Registers](https://proceedings.iclr.cc/paper_files/paper/2024/hash/0b408293619f725fd30162af057e531a-Abstract-Conference.html)
   - 委员会确认该文识别视觉 Transformer 特征图中的高范数伪影，提出原因假设和简洁的 register token 修正方法，并指出其跨任务意义。
   - 边界：不能写成所有 Transformer 架构都必然因 registers 获益。

### ICLR 2026

5. [LLMs Get Lost In Multi-Turn Conversation](https://proceedings.iclr.cc/paper_files/paper/2026/hash/59f6421e64707225fdf5b28840679a07-Abstract-Conference.html)
   - 委员会确认训练数据与多轮部署之间存在重要错位，并肯定其可扩展评测方法以及在不完全指令场景中测得的明显能力与可靠性下降。
   - 边界：结果受所测模型和交互设计约束，委员会也记录了模型版本偏旧的问题。

## 未通过完整门槛的正奖论文

| 年份 | 论文 | 结果 | 原因 |
|---|---|---|---|
| 2024 | Protein Discovery with Discrete Walk-Jump Sampling | 范围外 | 官方评语主要证明其在抗体设计、蛋白序列建模和湿实验验证方面的价值；未证明它对 AI 方法本身形成重大推动。 |
| 2025 | Safety Alignment Should be Made More Than Just a Few Tokens Deep | 暂缓 | 官方页面证明正奖，但没有发表逐篇委员会贡献评语，缺少独立的重大贡献定位。 |
| 2025 | Learning Dynamics of LLM Finetuning | 暂缓 | 官方页面证明正奖，但缺少逐篇外部重大贡献说明。 |
| 2025 | AlphaEdit: Null-Space Constrained Knowledge Editing for Language Models | 暂缓 | 官方页面证明正奖，但缺少逐篇外部重大贡献说明；作者自述和基准结果不能替代该证据。 |
| 2026 | Transformers are Inherently Succinct | 复核 | 委员会肯定其概念意义，但同时记录批评，并以“可能促进后续研究”的前瞻措辞描述影响，尚不足以写成已经形成重大影响。 |

## 数据与可复核性

- 三届论文身份来自 ICLR 官方 Proceedings；解析数量分别为 2,260、3,703、5,351。
- 组织方录用总数来自 ICLR 2024、2025 Fact Sheet 和 ICLR 2026 审稿流程复盘。
- 三届正奖名单分别来自 ICLR 官方 2024、2025、2026 Outstanding Paper 公告。
- 全量逐篇记录、十篇正奖审核、五篇通过记录、差额记录和校验结果保存在 `proposals/academic-importance/openreview-iclr-2024-2026-20260924/`。
- 本轮没有声称逐字精读 11,319 篇全文。制度允许在第二步缺少可采信正式评价机制时提前停止；所有提前停止论文均保留了逐篇身份和暂缓理由。

## 当前限制

录用统计与最终论文集相差五篇：2025 年一篇、2026 年四篇。由于这些论文没有出现在终版 Proceedings 中，本轮不能在没有身份依据的情况下伪造题名或 OpenReview ID。它们不计入通过数，状态为身份待核。若后续从 OpenReview 获得其可复核身份，需要重新执行论文状态、奖项匹配和内容审核。
