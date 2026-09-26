# “竞赛与黑客马拉松”Kaggle 内容审核试验

审核日期：2026-09-24｜适用机制：[竞赛与黑客马拉松内容审核机制 v1.1](HACKATHON_CONTENT_REVIEW_POLICY.md)｜结构化记录：[kaggle-pilot-20260924.json](../proposals/hackathon/kaggle-pilot-20260924.json)

## 1. 测试目的与范围

本轮使用四个边界样本验证单次五门槛机制，不宣称穷尽 Kaggle：

- Agents Intensive - Capstone Project：正式赛道冠军且产物完整；
- ARC Prize 2024 Omni-ARC：正式主奖第二名且技术报告完整；
- ARC Prize 2024 第 13 名方案：产物完整、知识有增量，但没有合格奖项；
- Restaurant Revenue Prediction 第一名：主奖成立，但产物和知识增量不足。

## 2. 汇总结论

| 结果 | 数量 | 含义 |
|---|---:|---|
| `admitted` | 2 | 五项硬门槛全部通过 |
| `ineligible` | 2 | 一项或多项硬门槛失败 |

结果同时验证了两条边界：获得第一名不能抵消产物和知识增量失败；代码和技术报告完整也不能抵消奖项门槛失败。

## 3. 逐项审核

### 3.1 Chaos Playbook Engine

- 奖项：Enterprise Agents 赛道第一名，`awardEligible: pass`。
- 身份、AI 相关性、产物和知识增量均为 `pass`。
- 决定：`admitted`。
- 依据：[赛事说明](https://www.kaggle.com/competitions/agents-intensive-capstone-project/overview)、[官方获奖公告](https://www.kaggle.com/competitions/agents-intensive-capstone-project/discussion/663531)、[项目 write-up](https://www.kaggle.com/competitions/agents-intensive-capstone-project/writeups/new-writeup-1763223319877)。

### 3.2 ARC Prize 2024：Omni-ARC approach

- 奖项：正式主奖第二名，`awardEligible: pass`。
- 身份、AI 相关性、产物和知识增量均为 `pass`。
- 决定：`admitted`。
- 依据：[赛事页](https://www.kaggle.com/competitions/arc-prize-2024)、[最终榜](https://www.kaggle.com/competitions/arc-prize-2024/leaderboard)、[第 2 名 write-up](https://www.kaggle.com/competitions/arc-prize-2024/writeups/guillermo-barbadillo-2nd-place-solution-for-the-ar)。

### 3.3 ARC Prize 2024：第 13 名公开代码方案

- 身份、AI 相关性、产物和知识增量均为 `pass`。
- 奖项：最终第 13 名，不属于赛事主奖、赛道冠军或明确技术主题专项奖，`awardEligible: fail`。
- 决定：`ineligible`。
- 依据：[赛事页](https://www.kaggle.com/competitions/arc-prize-2024)、[最终榜](https://www.kaggle.com/competitions/arc-prize-2024/leaderboard)、[第 13 名 write-up](https://www.kaggle.com/competitions/arc-prize-2024/writeups/nikola-hu-sharing-my-arc-prize-2024-code-31-points)。

本例说明第五项是独立硬门槛：产物完整、方法有价值，仍不能作为“黑客马拉松”一级来源收录；它可以再由开源仓库等独立机制审核。

### 3.4 Restaurant Revenue Prediction：Winning Solution

- 奖项：第一名主奖，`awardEligible: pass`。
- 身份和 AI 专业相关为 `pass`。
- 产物可访问与知识有增量均为 `fail`：页面表示暂不公开代码，现有内容只简述常规 GBM、预处理和集成。
- 决定：`ineligible`。
- 依据：[官方 winning solution 页面](https://www.kaggle.com/competitions/restaurant-revenue-prediction/writeups/arsenal-winning-solution)。

## 4. 机制验证结论

黑客马拉松机制不设候选池，也不分第一、第二阶段。所有项目直接检查五项硬门槛：

1. 身份可确认；
2. AI 专业相关；
3. 产物可访问；
4. 知识有增量；
5. 奖项符合要求。

五项互不补偿。该机制既能拒绝“有奖但无技术内容”，也能拒绝“技术完整但没有合格奖项”。
