"""Write the human-readable 2025 closeout from validated structured results."""
import json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'proposals/academic-importance/arxiv-2025-20260923'
def read(n):return json.loads((OUT/n).read_text(encoding='utf-8'))
s=read('summary-v3.json');v=read('validation-v3.json');c=s['dispositions']
assert v['dispositionSumMatches'] and v['allSixStepsVerified']
text=f'''# 2025 年 arXiv 内容审核：本轮结果

按首次提交时间 2025-01-01 至 2025-12-31、与 2026 年相同的三路候选规则和重要性门槛，本轮共登记 **{s['candidateCount']:,} 篇候选**。其中 **3 篇完成六步审核并达到收录要求**。

## 结果

| 处置 | 篇数 | 含义 |
|---|---:|---|
| 可以收录 | {c['include-new']:,} | 六步均通过 |
| 暂缓 | {c['deferred']:,} | 本轮没有命中可采信的必要评价证据；保留候选，不作质量否定 |
| 待补证 | {c['needs-evidence']:,} | 存在奖项线索或奖项相关文字，但机制、身份或重大贡献依据未齐 |
| 合计 | {s['candidateCount']:,} | 每个 arXiv ID 恰有一个处置 |

## 可以收录的三篇

1. [1000 Layer Networks for Self-Supervised RL](https://arxiv.org/abs/2503.14858)：NeurIPS 2025 Best Paper。委员会认为该工作改变了强化学习难以有效训练深层网络的既有认识。结论限于对比式自监督强化学习及所测环境。
2. [Why Diffusion Models Don't Memorize](https://arxiv.org/abs/2505.17638)：NeurIPS 2025 Best Paper。委员会明确肯定其从训练动力学连接扩散模型的泛化与记忆问题。标题不能解释为所有扩散模型永不记忆。
3. [Gated Attention for Large Language Models](https://arxiv.org/abs/2505.06708)：NeurIPS 2025 Best Paper。委员会确认门控对训练稳定性、注意力汇聚和长上下文表现的贡献。现有结果不能保证对所有模型配置都成立。

三篇均已完成机制、身份、当前入口、AI 重大贡献、材料、重复与使用边界检查。只拟收录书目信息、原文链接和原创短评，尚未发布到网站。

## 候选池与审核深度

完整 Cornell arXiv 快照共有 {s['allArxiv2025FirstSubmissions']:,} 篇在 2025 年首次提交。对全部记录应用八个 AI 相关分类、130 个标题/摘要布尔检索式，并合并已核实的正式评价线索，得到去重候选池。

| 命中路径 | 数量（可重叠） |
|---|---:|
| AI 相关分类 | {s['routesOverlapping'].get('categories',0):,} |
| 专业关键词 | {s['routesOverlapping'].get('keywords',0):,} |
| 已匹配的正式评价线索 | {s['routesOverlapping'].get('external',0):,} |

实际审核深度：六步审核 {s['actualReviewDepths'].get('six-steps',0)} 篇，逐篇证据检查 {s['actualReviewDepths'].get('article-specific-evidence-check',0)} 篇，正式名单与元数据匹配 {s['actualReviewDepths'].get('official-list-and-metadata-match',0)} 篇，其余 {s['actualReviewDepths'].get('automated-evidence-lookup',0):,} 篇只完成必要证据查表。没有把后者写成已经精读摘要或全文。

## 结论边界

- “暂缓”不是淘汰，也不表示论文不重要；获得新的正式评价证据后可重新进入六步审核。
- 本轮外部评价证据以已经登记并核验的 2025 年机制和具体候选为边界，不声称穷尽全球所有奖项与专业综述。
- 2025 年获奖但 arXiv 首次提交不在 2025 年的论文，不计入本批次；首次提交年份优先于更新或获奖年份。
- 快照创建于 2026-09-19，足以完整覆盖 2025 年首次提交，但只反映抓取时的版本和状态。只有拟收录论文进行了逐篇当前入口核查。
- 分类和关键词用于宽召回，不代表命中论文已经对 AI 发展作出重大贡献。

## 可复查文件

- [汇总](../proposals/academic-importance/arxiv-2025-20260923/summary-v3.json)
- [逐篇处置](../proposals/academic-importance/arxiv-2025-20260923/review-results-v3.jsonl)
- [三篇完整通过记录](../proposals/academic-importance/arxiv-2025-20260923/selected-v3.json)
- [逐篇证据记录](../proposals/academic-importance/arxiv-2025-20260923/article-evidence-records-v3.json)
- [外部评价线索](../proposals/academic-importance/arxiv-2025-20260923/external-leads-v3.json)
- [奖项文字自动发现](../proposals/academic-importance/arxiv-2025-20260923/metadata-award-leads-v3.json)
- [校验结果](../proposals/academic-importance/arxiv-2025-20260923/validation-v3.json)

本报告完成的是冻结范围内的候选枚举和必要证据处置，不宣称 2025 年只有三篇重要 AI 论文。
'''
(ROOT/'docs/ARXIV_2025_REVIEW_RESULT_20260923.md').write_text(text,encoding='utf-8')
print(json.dumps({'report':'docs/ARXIV_2025_REVIEW_RESULT_20260923.md','candidates':s['candidateCount'],'dispositions':c},ensure_ascii=False))
