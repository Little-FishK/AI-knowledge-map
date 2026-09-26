"""Write the readable 2024 closeout from validated structured results."""
import json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'proposals/academic-importance/arxiv-2024-20260923'
def read(n):return json.loads((OUT/n).read_text(encoding='utf-8'))
s=read('summary-v3.json');v=read('validation-v3.json');c=s['dispositions'];assert v['dispositionSumMatches'] and v['allSixStepsVerified']
text=f'''# 2024 年 arXiv 内容审核：本轮结果

按首次提交时间 2024-01-01 至 2024-12-31、与 2025/2026 年相同的三路候选规则和重要性门槛，本轮共登记 **{s['candidateCount']:,} 篇候选**。其中 **{c.get('include-new',0)} 篇完成六步审核并达到收录要求**。

## 结果

| 处置 | 篇数 | 含义 |
|---|---:|---|
| 可以收录 | {c.get('include-new',0):,} | 六步均通过 |
| 暂缓 | {c.get('deferred',0):,} | 本轮没有命中可采信的必要评价证据；保留候选 |
| 待补证 | {c.get('needs-evidence',0):,} | 存在评价线索，但机制、身份或重大贡献依据未齐 |
| 合计 | {s['candidateCount']:,} | 每个 arXiv ID 恰有一个处置 |

## 可以收录的论文

1. [Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction](https://arxiv.org/abs/2404.02905)：NeurIPS 2024 Best Paper。把视觉自回归生成重构为由粗到细的“下一尺度预测”。官方委员会将本届正奖论文定位为高影响、开创性工作，并明确肯定其模型创新、生成质量、效率及扩展规律。结论不能外推为所有任务上全面优于扩散模型。
2. [Guiding a Diffusion Model with a Bad Version of Itself](https://arxiv.org/abs/2406.02507)：NeurIPS 2024 Best Paper。提出以较弱版本的同一扩散模型替代无条件模型进行 Autoguidance，处理常用 classifier-free guidance 的质量、多样性权衡。官方委员会明确指出该替代方案及其显著改进；适用结论限于所测图像扩散模型。

两篇均完成机制资格、论文身份、当前入口、AI 重大贡献、材料、重复和使用边界检查。只拟收录书目信息、原文链接和原创短评，尚未发布到网站。

## 候选池与审核深度

完整 arXiv 快照中共有 {s['allArxiv2024FirstSubmissions']:,} 篇在 2024 年首次提交。对全部记录应用八个 AI 相关分类、130 个标题/摘要布尔检索式，再合并正式评价线索，得到去重候选池。

| 命中路径 | 数量（可重叠） |
|---|---:|
| AI 相关分类 | {s['routesOverlapping'].get('categories',0):,} |
| 专业关键词 | {s['routesOverlapping'].get('keywords',0):,} |
| 正式评价线索 | {s['routesOverlapping'].get('external',0):,} |

审核深度分别为：六步审核 {s['actualReviewDepths'].get('six-steps',0)} 篇，逐篇证据检查 {s['actualReviewDepths'].get('article-specific-evidence-check',0)} 篇，官方名单与元数据匹配 {s['actualReviewDepths'].get('official-list-and-metadata-match',0)} 篇，必要证据自动查表 {s['actualReviewDepths'].get('automated-evidence-lookup',0):,} 篇。后者没有被写成已经精读摘要或全文。

## 本轮补查

此前机制表对 2024 年当届论文奖覆盖不足。本轮新增核实 NeurIPS 2024 主赛道 Best Paper 机制，并核对四篇 2024 首次提交的获奖论文：上述两篇满足重大 AI 贡献门槛；Stochastic Taylor Derivative Estimator 和 PRISM Alignment Dataset 仍缺足以达到本站严格门槛的重大 AI 发展定位，保留待补证。

另有六条 ICLR/ICML 官方获奖题名没有在 2024 候选题名索引中匹配，主要可能是首次提交年份不同或题名对应尚未完成。它们保留在外部线索清单，没有伪造 arXiv ID，也没有计入 2024 结果。

## 结论边界

- 暂缓和待补证不是淘汰，也不表示论文不重要。
- 外部评价范围仍是已登记机制及本轮明确补查的 ICLR、NeurIPS、ICML 2024 官方名单，不宣称穷尽全球所有奖项与综述。
- 获奖年份不替代首次提交年份。2025 年获奖但 2024 年首次提交的论文归入本批次。
- 分类和关键词只负责宽召回，不代表论文已经对 AI 发展作出重大贡献。
- 快照创建于 2026-09-19；只有拟收录论文进行了当前入口复核。

## 可复查文件

- [汇总](../proposals/academic-importance/arxiv-2024-20260923/summary-v3.json)
- [逐篇处置](../proposals/academic-importance/arxiv-2024-20260923/review-results-v3.jsonl)
- [完整通过记录](../proposals/academic-importance/arxiv-2024-20260923/selected-v3.json)
- [NeurIPS 2024 机制核验](../proposals/academic-importance/arxiv-2024-20260923/neurips-2024-mechanism-verification.json)
- [外部评价线索](../proposals/academic-importance/arxiv-2024-20260923/external-leads-v3.json)
- [校验结果](../proposals/academic-importance/arxiv-2024-20260923/validation-v3.json)

本报告完成的是冻结范围内的候选枚举和必要证据处置，不宣称 2024 年只有两篇重要 AI 论文。
'''
(ROOT/'docs/ARXIV_2024_REVIEW_RESULT_20260923.md').write_text(text,encoding='utf-8');print(json.dumps({'report':'docs/ARXIV_2024_REVIEW_RESULT_20260923.md','candidates':s['candidateCount'],'dispositions':c},ensure_ascii=False))
