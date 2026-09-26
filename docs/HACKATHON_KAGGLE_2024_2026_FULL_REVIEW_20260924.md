# Kaggle 2024—2026 正式奖项批次全量审核

审核日期：2026-09-24｜审核机制：[竞赛与黑客马拉松内容审核机制](HACKATHON_CONTENT_REVIEW_POLICY.md)｜结构化记录：[kaggle-full-review-20260924.json](../proposals/hackathon/kaggle-full-review-20260924.json)

## 范围与口径

本批检查 Kaggle 官方 `Completed + Hackathons` 目录中，结束日期位于 2024-01-01 至 2026-09-24 的全部活动。黑客马拉松不采用候选池或两阶段审核；项目直接接受五项硬门槛：身份可确认、AI 专业相关、产物可访问、知识有增量、奖项符合要求。

第五项只允许三类奖项通过：赛事主奖、正式赛道冠军、明确 AI 技术主题的专项奖。Honorable Mention、普通入围、无正式奖项权益的 Finalist、主办方精选、社区推荐和未获奖项目均不通过第五项。

`Finalist`、`Semi-finalist` 和 `Runner-up` 若由官方规则明确授予奖金、奖品或正式名次权益，则按主奖处理；仅有展示或晋级资格则不处理。

目录共命中 18 场活动。17 场形成 248 个官方结果项目并直接接受五项门槛审核；课程活动 `5-Day AI Agents: Intensive Vibe Coding Course With Google` 没有项目结果。

## 结论

| 处置 | 数量 | 含义 |
|---|---:|---|
| `admitted` | 157 | 五项硬门槛全部通过，后续可建 `discoveryOnly` 资料卡 |
| `pending` | 15 | 奖项、身份、AI 相关性和产物成立，但知识增量证据不足 |
| `ineligible` | 76 | 70 个奖项门槛失败；另有 6 个项目在 AI 相关或知识增量门槛失败 |
| `merge-update` | 0 | 本批尚未进入建卡去重阶段 |

70 个 Honorable Mention、主办方精选等项目没有从审核中消失，也不是“候选阶段淘汰”；它们直接接受审核，并因第五项 `awardEligible: fail` 计入 `ineligible`。

## 分赛事结果

| 赛事 | 官方结果项目 | 通过 | 暂缓 | 不收 |
|---|---:|---:|---:|---:|
| Pokémon TCG AI Battle Challenge - Strategy | 8 | 8 | 0 | 0 |
| Gemma 4 Good | 14 | 14 | 0 | 0 |
| Measuring AGI | 14 | 14 | 0 | 0 |
| MedGemma Impact Challenge | 9 | 9 | 0 | 0 |
| Google Tunix Hackathon | 15 | 6 | 0 | 9 |
| NFL Big Data Bowl 2026 - Analytics | 5 | 5 | 0 | 0 |
| Gemini 3 Vibe Coding | 50 | 35 | 15 | 0 |
| BigQuery AI Hackathon | 11 | 9 | 0 | 2 |
| OpenAI gpt-oss-20b Red-Teaming | 20 | 10 | 0 | 10 |
| Gemma 3n Impact Challenge | 8 | 8 | 0 | 0 |
| Meta Kaggle Hackathon | 6 | 1 | 0 | 5 |
| OpenAI to Z Challenge | 5 | 5 | 0 | 0 |
| Unlock Global Communication with Gemma | 20 | 5 | 0 | 15 |
| NFL Big Data Bowl 2025 | 18 | 10 | 0 | 8 |
| Gemini Long Context | 12 | 3 | 0 | 9 |
| AI Assistants for Data Tasks with Gemma | 15 | 5 | 0 | 10 |
| NFL Big Data Bowl 2024 | 18 | 10 | 0 | 8 |
| **合计** | **248** | **157** | **15** | **76** |

## 第五项门槛带来的变化

在 248 个官方结果项目中，第五项奖项门槛使 70 项直接判为 `ineligible`：

- Tunix 的 9 个 Honorable Mention；
- BigQuery AI 的 2 个 Honorable Mention；
- GPT-OSS 红队赛的 10 个 Honorable Mention；
- Gemma Language Tuning 的 15 个非正式奖项赛后精选；
- NFL 2025 的 8 个 Honorable Mention；
- Gemini Long Context 的 8 个 Honorable Mention；
- Data Assistants with Gemma 的 10 个 Honorable Mention；
- NFL 2024 的 8 个 Honorable Mention。

这些项目不再因为产物完整、主办方推荐或技术内容较好而进入黑客马拉松一级来源；它们仍可由开源仓库、论文或官方技术资料等独立机制审核。

## 为什么仍有 15 个暂缓

Gemini 3 官方一次列出 50 个 Winner，因此全部通过第五项奖项门槛。但其中 15 个项目的公开摘要主要是产品定位或一句功能说明，例如 `Writer's Block`、`Prompt Crafter`、`Equation Whisperer` 和 `Amarello.ai`，尚不足以证明新的工作流、实现、数据、评测或应用约束。

这些项目是第四项 `knowledgeDelta: unknown`，不是奖项门槛失败。补出完整实现或评测证据后才能转为 `admitted`。

## 已获合格奖项但仍不收的 6 项

- Meta Kaggle 的五个正式名次项目，核心是社区活跃、用户流失、平台战略或历史分析，第二项 `aiRelevant` 失败；只有语义数据集推荐项目 `Echoes of Interest` 通过。
- Gemini Long Context 正式 Winner `FrameCut` 的公开 Notebook 主要实现视频描述，与宣传中的端到端自然语言编辑能力存在明显差距，第四项 `knowledgeDelta` 失败。

这说明第五项不是“获奖即通过”。奖项只是一项硬门槛，另外四项仍须独立通过。

## 旧版 Analytics 页处理

- NFL 2024：五个 Finalist 与五个 Runner-up 均获得现金奖，按主奖处理；八个 Honorable Mention 不处理。
- NFL 2025：五个 Finalist 与五个 Semi-finalist 均获得现金奖，按主奖处理；八个 Honorable Mention 不处理。
- Gemini Long Context：四个正式 Winner 通过第五项；八个 Honorable Mention 在第五项失败。
- Data Assistants with Gemma：五个正式类别冠军通过第五项；十个 Honorable Mention 在第五项失败。
- Gemma Language Tuning：赛事规则设置的五个正式主奖通过第五项；Google 赛后文章中的其他十五个精选项目在第五项失败。

## 关键边界

1. 五项门槛一次性执行，不存在候选池或第二阶段。
2. “主奖”不限于机械前三名，但必须有官方正式授奖证据。
3. 技术专项奖必须指向明确 AI 技术主题；泛化的影响力、社区或展示奖不够。
4. 审核通过只表示赛事成果具有发现价值，不证明生产级可靠性、医学有效性或一般能力。
5. 本轮只完成审核处置，尚未发布 157 张资料卡；建卡前仍需跨来源去重和知识节点映射。

## 官方核查入口

- [Kaggle Completed + Hackathons 目录](https://www.kaggle.com/competitions?listOption=completed&sortOption=recentlyClosed&requireHackathons=true)
- [Gemini 3 官方 Winners](https://www.kaggle.com/competitions/gemini-3/hackathon-winners)
- [OpenAI gpt-oss 官方结果公告](https://www.kaggle.com/competitions/openai-gpt-oss-20b-red-teaming/discussion/608537)
- [Gemini Long Context 官方结果公告](https://www.kaggle.com/competitions/gemini-long-context/discussion/552419)
- [Data Assistants with Gemma 官方结果公告](https://www.kaggle.com/competitions/data-assistants-with-gemma/discussion/499090)
- [Gemma Language Tuning 官方赛后材料](https://developers.googleblog.com/unlock-global-communication-gemma-projects/)
- [NFL Big Data Bowl 2025 官方结果 PDF](https://storage.googleapis.com/kaggle-forum-message-attachments/3110100/21745/BDB%20announcement%202025%20winners.pdf)
- [NFL Big Data Bowl 2024 官方结果公告](https://www.kaggle.com/competitions/nfl-big-data-bowl-2024/discussion/472712)
