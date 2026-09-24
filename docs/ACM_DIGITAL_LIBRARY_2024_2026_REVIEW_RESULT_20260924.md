# ACM Digital Library 2024–2026 候选池与重要性审核结果

检查日：2026-09-24｜候选池：24,406 篇｜六步通过：0 篇｜待补 AI 重大贡献证据：9 篇

## 结论

按[ACM Digital Library 候选池规则](ACM_DIGITAL_LIBRARY_COLLECTION_POLICY.md)建立三路并集，再逐条执行[学术投稿内容重要性审核机制](ACADEMIC_IMPORTANCE_POLICY.md)：

| 年份 | 候选 | 通过 | 待补 AI 重大贡献证据 | 暂缓于机制门槛 |
|---|---:|---:|---:|---:|
| 2024 | 7,481 | 0 | 0 | 7,481 |
| 2025 | 8,995 | 0 | 9 | 8,986 |
| 2026 | 7,930 | 0 | 0 | 7,930 |
| **合计** | **24,406** | **0** | **9** | **24,397** |

**严格结论：本批当前没有论文满足全部六步要求，因此可直接上线为“审核通过”的论文是 0 篇。** 九篇论文精确命中当前 enabled 的正式正奖机制，但都停在步骤 5；如维护者以后明确授权，可以用“缺乏 AI 重大贡献外部说明”的公开待补证状态上线，但不能标成审核通过。

## 九篇正式获奖但待补证的论文

| 机制 | 论文与 ACM DOI | 步骤 5 结论 |
|---|---|---|
| SIGIR 2025 Best Paper | [WARP: An Efficient Engine for Multi-Vector Retrieval](https://dl.acm.org/doi/10.1145/3726302.3729904) | 官方名单确认 winner，但没有委员会说明其为何构成 AI 发展的重大改变。 |
| FAccT 2025 Best Paper | [A Framework for Auditing Chatbots for Dialect-Based Quality-of-Service Harms](https://dl.acm.org/doi/10.1145/3715275.3732137) | 外部审计框架具有明确 FAccT 价值，但官方理由没有证明其重大改变 AI 的理论、方法、架构或能力。 |
| FAccT 2025 Best Paper | [External Evaluation of Discrimination Mitigation Efforts in Meta's Ad Delivery](https://dl.acm.org/doi/10.1145/3715275.3732170) | 重要的问责与实证结果，不等于对 AI 发展本身的重大贡献。 |
| FAccT 2025 Best Paper | [“You Cannot Sound Like GPT”: Signs of language discrimination and resistance in computer science publishing](https://dl.acm.org/doi/10.1145/3715275.3732202) | 官方理由支持社会技术重要性，但没有建立 AI 技术发展的重大贡献。 |
| SIGGRAPH 2025 Best Paper | [Shape Space Spectra](https://dl.acm.org/doi/10.1145/3731148) | 官方说明聚焦几何处理与模拟，没有建立 AI 重大贡献。 |
| SIGGRAPH 2025 Best Paper | [CAST: Component-Aligned 3D Scene Reconstruction From an RGB Image](https://dl.acm.org/doi/10.1145/3730841) | 单图 3D 重建有技术价值，但现有官方说明不足以证明它重大改变 AI 发展。 |
| SIGGRAPH 2025 Best Paper | [TokenVerse: Versatile Multi-Concept Personalization in Token Modulation Space](https://dl.acm.org/doi/10.1145/3730843) | 与生成模型直接相关，但官方页面主要描述论文能力，没有给出独立的“重大 AI 贡献”判断。 |
| SIGGRAPH 2025 Best Paper | [Vector-Valued Monte Carlo Integration Using Ratio Control Variates](https://dl.acm.org/doi/10.1145/3731175) | 渲染与 Monte Carlo 方法贡献明确，未建立 AI 发展层面的重大性。 |
| SIGGRAPH 2025 Best Paper | [Transformer IMU Calibrator: Dynamic On-Body IMU Calibration for Inertial Motion Capture](https://dl.acm.org/doi/10.1145/3730937) | Transformer 应用改进明确，但外部材料未证明其为 AI 发展的重大贡献。 |

九篇论文的 ACM DOI 页和官方奖项源均在 2026-09-24 核验，未看到更正、撤回、撤稿或撤奖标记。这只是截至检查日的有限状态核验。

## 其余 24,397 篇为何暂缓

其余记录没有精确命中当前 enabled 的同一会议、年份、赛道、完整奖项和 winner 身份，因此在步骤 2 暂缓。这里包括普通录用、期刊发表、Honorable Mention、学生奖、仅由出版物或题名关键词召回的论文，以及当前尚未写入 enabled 白名单的 2024／2026 奖项。ACM 出版身份、开放获取、引用与下载量均未用于通过。

本轮严格沿用现有机制清单，没有自行把 2024 或 2026 的奖项系列扩展为 enabled。若机制清单后续新增这些年份，相关 DOI 已在候选池中，可做增量反查，无需重抓全库。

## 覆盖与可复核性

- 扫描记录：会议论文 101,756、期刊论文 20,695。
- 去重候选：会议论文 19,210、期刊论文 5,196。
- 路线命中（可重叠）：核心出版物 14,970、高精度题名 11,687、正式评价反查 9。
- 123 个 Crossref 游标响应页及 SHA-256 哈希、候选池、逐条门槛结果、九篇待补证记录和空的上线清单保存在 `proposals/academic-importance/acm-digital-library-2024-2026-20260924/`。

## 发布状态

`selected.json` 为空；本轮没有执行网站发布，也没有把九篇待补证论文写入正式资料库。

