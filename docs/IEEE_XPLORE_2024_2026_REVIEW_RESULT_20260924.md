# IEEE Xplore 2024–2026 候选池与重要性审核结果

检查日：2026-09-24｜候选池：63,609 篇｜六步通过：0 篇｜公开待补证：4 篇

## 结论

按[IEEE Xplore 候选池规则](IEEE_XPLORE_COLLECTION_POLICY.md)建立三路并集，再逐条执行[学术投稿内容重要性审核机制](ACADEMIC_IMPORTANCE_POLICY.md)：

| 年份 | 候选 | 通过 | 待补 AI 重大贡献证据 | 暂缓于机制门槛 |
|---|---:|---:|---:|---:|
| 2024 | 21,594 | 0 | 2 | 21,592 |
| 2025 | 26,917 | 0 | 2 | 26,915 |
| 2026 | 15,098 | 0 | 0 | 15,098 |
| **合计** | **63,609** | **0** | **4** | **63,605** |

因此，本批目前没有论文满足全部六步要求。经维护者明确决定，四篇精确命中正式奖项机制的论文以“公开待补证”状态上线；它们仍不是审核通过文章。

## 四篇精确命中正式机制但仍待补证的论文

### NoMaD: Goal Masked Diffusion Policies for Navigation and Exploration

- IEEE Xplore：[article 10610665](https://ieeexplore.ieee.org/document/10610665/)，DOI `10.1109/ICRA57147.2024.10610665`。
- 正式评价：[ICRA 2024 Best Conference Paper winner](https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/icra%202024/awards-and-finalists/index.html)。官方页使用缩短题名，四位作者与 Xplore 记录对应。
- 结论：步骤 1–4 通过或有限通过；步骤 5 待补。官方页确认正奖但未给出为什么该工作对 AI 发展构成重大贡献的委员会说明；作者摘要不能代替外部证据。

### Open X-Embodiment: Robotic Learning Datasets and RT-X Models

- IEEE Xplore：[article 10611477](https://ieeexplore.ieee.org/document/10611477/)，DOI `10.1109/ICRA57147.2024.10611477`。
- 正式评价：[ICRA 2024 Best Conference Paper winner](https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/icra%202024/awards-and-finalists/index.html)。
- 结论：步骤 1–4 通过或有限通过；步骤 5 待补。奖项名单没有说明委员会如何判断它实质改变了 AI／机器人学习；论文和作者所属项目的自述不满足独立外部证据要求。

### Marginalizing and Conditioning Gaussians onto Linear Approximations of Smooth Manifolds with Applications in Robotics

- IEEE Xplore：[article 11128000](https://ieeexplore.ieee.org/document/11128000/)，DOI `10.1109/ICRA55743.2025.11128000`。
- 正式评价：[ICRA 2025 Best Conference Paper winner](https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/ICRA2025/2025.ieee-icra.org/program/awards-and-finalists/index.html)。
- 结论：步骤 1–4 通过或有限通过；步骤 5 待补。委员会称其为机器人约束优化提供通用的紧致不确定性估计方法，这足以说明机器人领域的突出贡献，但没有明确建立其对 AI 发展造成重大改变。

### MAC-VO: Metrics-Aware Covariance for Learning-Based Stereo Visual Odometry

- IEEE Xplore：[article 11128482](https://ieeexplore.ieee.org/document/11128482/)，DOI `10.1109/ICRA55743.2025.11128482`。
- 正式评价：[ICRA 2025 Best Conference Paper winner](https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/ICRA2025/2025.ieee-icra.org/program/awards-and-finalists/index.html)。
- 结论：步骤 1–4 通过或有限通过；步骤 5 待补。委员会确认其学习式度量不确定性模型改善视觉里程计的鲁棒性与准确性，但这仍是边界明确的机器人视觉改进，现有外部材料没有证明它构成 AI 发展的重大贡献。

四篇论文的 Xplore 正式页与奖项页均在 2026-09-24 检查，未看到更正、撤回、撤稿或撤奖标记；这是截至检查日的有限状态核验，不是对未来状态的保证。

## 其余 63,605 篇为何暂缓

其余记录没有精确命中当前 enabled 的同一会议、年份、赛道、完整奖项名和 winner 身份，因此在步骤 2 暂缓。这里包括普通录用、期刊发表、Early Access、奖项 finalist、专题奖、学生奖，以及仅由题名关键词命中的论文。引用、下载量和 IEEE 出版身份均未用于通过。

`ICRA 2026` 官方页面在检查日仍只列 award finalists，没有最终 winner 身份，本轮不提前启用或推定结果。

## 覆盖与可复核性

- 去重后内容类型：期刊论文 23,052、会议论文 38,189、Early Access 2,368。
- 路线命中（可重叠）：核心出版物 27,812、高精度题名 37,837、奖项反查 4。
- IEEE Xplore 单次 `reinforcement learning` 检索超过稳定分页范围，已按年份拆分后抓取。
- `IEEE International Conference on Machine Learning and Applications` 与 `IEEE Symposium Series on Computational Intelligence` 两个配置短语在当前 Xplore 出版题名字段中零命中；零命中保留为题名变体覆盖缺口，不臆造记录。
- 机器可复核结果位于 `proposals/academic-importance/ieee-xplore-2024-2026-20260924/`：候选池、查询快照与哈希、逐条门槛结果、四篇待补证记录和空的上线清单均已保存。

## 发布决定

六步通过清单 `selected.json` 仍为空。经维护者明确决定，四篇 ICRA 正奖论文发布为公开待补证目录，统一标注“缺乏 AI 重大贡献外部说明；上线不代表审核通过”。该发布决定不改变六步审核结论；补齐独立的 AI 重大贡献说明前，不得把它们标为通过。
