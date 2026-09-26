# 前沿来源审核试验：六个来源

审核日、统一查阅日：2026-09-23。首创窗口：2025-09-23 至 2026-09-23（含端点）。按 [v2 来源准入机制](FRONTIER_SOURCE_POLICY.md) 进行人工试审，下次例行复核建议为 2027-03-22。

“已有”指本地 data/library.js 明确登记；“未登记”指未找到对应专名条目，不表示过去曾被审核拒绝。本次只记录来源资格，不新增网站资料、不挑选展示内容、不改正式目录。独立性结论依据公开作者及机构署名，未作非公开关系调查。

## 1. 结果总表

| 来源及审核范围 | 本地状态 | 一手 | 首创 | 应答 | 归属 | 结论 |
|---|---|---|---|---|---|---|
| DeepSeek：官方原创模型与技术研究 | 已有 official/deepseek | 通过 | 通过 | 通过 | 通过 | admitted，可入池 |
| METR：原创能力测量与评测方法 | 已有 knowledge-base/metr | 通过 | 通过 | 通过 | 通过 | admitted，可入池 |
| Ai2：Olmo 开放模型研究与发布 | 未登记独立条目 | 通过 | 通过 | 通过 | 通过 | admitted，可入池 |
| Sakana AI：原创 AI 研究与系统 | 未登记独立条目 | 通过 | 通过 | 通过 | 通过 | admitted，可入池 |
| arXiv：AI 预印本投稿托管渠道 | 已有 academic/arxiv | 渠道角色 | 不适用 | 不适用 | 有对应领域 | channel-only，保留原件渠道身份 |
| Semantic Scholar：通用论文检索与聚合服务 | 未登记独立条目 | 不通过 | 未审 | 未审 | retrieval | 当前范围不符合原创发布者资格，可作发现入口 |

通过结果没有优先顺序或名额限制。arXiv 没有被淘汰：原件渠道本身不等同于一个原创研究主体，不能把托管论文作者的贡献整体转给平台。Semantic Scholar 的自研研究与数据项目不在本次检索服务范围内，不能沿用本行结论。

## 2. DeepSeek

范围：DeepSeek 团队的官方模型发布及配套技术研究。归属：foundations；attention、reasoning-models。

- 一手与首创：[DeepSeek-V3.2-Exp 官方发布](https://api-docs.deepseek.com/news/news250929/)，2025-09-29；定位标题、DSA 介绍与模型/报告链接。团队发布自身模型及 DeepSeek Sparse Attention 技术，属于窗口内实质原创贡献。
- 应答：[ESS 论文](https://arxiv.org/abs/2512.10576)，2025-12-11；[正文](https://arxiv.org/html/2512.10576v1) 定位作者署名、摘要和方法。署名为百度 Baige AI 团队，对 V3.2-Exp 的缓存机制开展独立系统研究，属于实际研究使用，非简单转载。
- 限制：这里只证明模型研究来源具备资格；未独立验证官方性能或 ESS 的实验结论。

## 3. METR

范围：METR 原创 AI 能力测量、任务集及评测方法。归属：frontier、safety；model-evaluation、agent。

- 一手与首创：[Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)，2026-01-29；定位任务集扩展与测量更新部分。任务集由 170 扩展到 228，结合评测基础设施与新测量，构成实质贡献；没有把时间跨度概念本身说成 2026 年首次提出。
- 应答：[Frontier AI Forecasting Has a Measurement Problem](https://arxiv.org/abs/2608.14903)，2026-08-14；[正文](https://arxiv.org/html/2608.14903v1) 定位作者/独立研究声明及 METR TH1.1 冻结数据分析。作者 Fabricio F. Costa 使用该测量序列作方法审视；公开署名未列 METR，并声明无外部资助，满足本轮最低独立应答要求。批评也是应答，不代表本次认可其批评结论。
- 排除的弱证据：[Epoch 的 METR 数据页](https://epoch.ai/benchmarks/metr-time-horizons) 镜像原数据，不能称独立复现；[Epoch 2025 影响报告](https://epoch.ai/latest/epoch-impact-report-2025) 披露与 METR 的资助合作关系，不能仅凭不同网站就当独立证据。

## 4. Ai2 / Olmo

范围：Ai2 的 Olmo 开放模型研究与发布，不扩大到 Ai2 全部网站服务。归属：foundations；pretraining、reasoning-models。

- 一手与首创：[Olmo 3 官方发布](https://allenai.org/blog/olmo3)，2025-11-20；定位首发日期及开放权重、代码、数据和中间检查点说明。页面后来增加 Olmo 3.1 更新，不用后来的更新日期冒充首发。
- 应答：[Artificial Analysis Openness Index 发布及初始评估](https://artificialanalysis.ai/articles/announcing-artificial-analysis-openness-index)，2025-12-01；定位 Initial Findings 中 Olmo 3、Dolci 及软件开放情况的分析。外部评测主体将其作为具体评估对象，属于实质评价。
- 限制：应答证明的是开放性被独立审视，不是能力领先或训练结果被复现；本轮未发现公开署名中的共同作者关系。

## 5. Sakana AI

范围：Sakana AI 原创 AI 研究与系统，覆盖演化搜索与长程代理研究。归属：coding、building；agent、multi-agent。

- 一手与首创：[Marlin 官方发布](https://sakana.ai/marlin-release/)，2026-06-15；定位商业发布与此前 2026 年 4 月 beta 的说明。自研代理系统在当前窗口内首次对外提供，构成来源的新产物证据。这里不把 6 月正式发布说成最早 beta，也不评判产品是否值得展示。
- 应答：[LEVI](https://arxiv.org/abs/2605.09764)，2026-05-10；[正文](https://arxiv.org/html/2605.09764v1) 定位作者署名、摘要、Related Work 与 Evaluation。Temoor Tanveer 署名 Independent Researcher，具体讨论并比较 Sakana 的 ShinkaEvolve。按公开署名满足独立应答；部分比较采用已有论文结果，应称比较而非独立复现。
- 首创与应答来自不同成果，仍然通过：判断的是 Sakana 来源，而不是要求 Marlin 这一个产品已经收到独立回应。
- 日期陷阱：[ShinkaEvolve 论文](https://arxiv.org/abs/2509.19349) 首次提交为 2025-09-17，早于窗口；[官方博客](https://sakana.ai/shinka-evolve/) 为 2025-09-25，不能靠晚发博客重置首创日期。旧成果收到应答仍可证明来源的应答闸门。
- 关系陷阱：[Simple Baselines are Competitive with Code Evolution](https://arxiv.org/html/2602.16805v1) 有 Sakana AI 共同作者，不把它单独作为完全独立的应答证据；替换证据后再判断来源，而非据此拒绝来源。

## 6. arXiv

范围：AI 相关预印本作者投稿与版本托管。已有 academic/arxiv。

- 角色证据：[arXiv About](https://info.arxiv.org/about/index.html) 说明其研究分享平台定位。论文页面另列作者与版本史，例如上述 ShinkaEvolve 和 ESS 原件。
- 结论：保留 primary-channel 身份，可通向实际原创主体；不把“arXiv 托管了首创论文”转写成“arXiv 研究团队作出该首创”。本轮不对全站论文赋予统一资格。
- 后续若发现值得审核的团队，可创建团队来源审核记录；这是来源身份解析，不是本轮逐篇挑选展示。

## 7. Semantic Scholar

范围：通用论文搜索、索引和聚合服务，不包含其团队的独立研究项目。归属：retrieval。

- 角色证据：[官方 About](https://webflow.semanticscholar.org/about) 说明其 AI 研究发现工具定位，以及通过出版商合作、数据来源和网络收集建立论文索引。
- 结论：外部论文的聚合索引不能证明该检索入口是这些论文的原创发布者，因此一手闸门不通过；首创和应答没有继续评分，不能写成两项均失败。可登记为 discovery。
- 边界：该团队也有自研研究和数据产物，若以这些项目为候选，须重新确定范围并审核。不能因为“是搜索平台”就否定其所有原创能力。

## 8. 试验对机制的检验

1. 两个已有原创来源与两个新增候选均通过；没有为保留旧名单或排斥新来源改变门槛。
2. Sakana 案例验证：首创日期必须查原件；首创与应答可来自不同产物；共同作者不能当独立证明。
3. METR 案例验证：原创测量可以成立；镜像和合作不是独立复现；外部批评可以构成应答。
4. arXiv 与 Semantic Scholar 验证：原件托管、原创发布、发现索引不能混成一种来源身份。
5. 全部结论都停在来源资格，未推导“该例证应该展示”“全部资料可信”或“必须只保留几家”。
