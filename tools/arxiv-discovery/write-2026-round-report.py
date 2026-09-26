"""Render a readable closeout from the actual per-ID gate result counts."""
import collections,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'proposals/academic-importance/arxiv-2026-20260923'
def read(n):return json.loads((OUT/n).read_text(encoding='utf-8'))
s=read('summary-v3.json');c=s['dispositions'];coverage=read('collection-coverage-v3.json');v=read('validation-v3.json')
assert v['dispositionSumMatches'] and v['eligibleEveryStepPassed'] and v['recentMetadataMissing']==0
text=f'''# 2026 年 arXiv 内容审核：本轮结果

截至 2026-09-23，按本轮冻结的分类、关键词及外部线索范围，共 **{s['candidateCount']:,} 篇候选**。全部已登记必要证据门槛处置，**2 篇完成六步审核并达到收录要求**。本轮实验完成；不表示所有论文均已精读，也不表示 2026 全年已经结束。

用户确认的执行口径：“允许：缺必要证据即暂缓，证据齐备者完成六步审核”。本报告及逐条结果严格按此区分审核深度。

## 1. 结果

| 处置 | 篇数 | 含义 |
|---|---:|---|
| 可以收录 | {c['include-new']:,} | 六步通过；限书目信息、原文入口与原创简短说明 |
| 暂缓 | {c['deferred']:,} | 本轮证据索引没有可采信的必要依据，停止后续精读，保留候选 |
| 待补证 | {c['needs-evidence']:,} | 存在外部线索或奖项相关文字，但机制、身份或重大贡献依据未齐 |
| 争议复核 | {c['recheck']:,} | 已发现实质结论争议，暂停采用 |
| 合计 | {s['candidateCount']:,} | 每个 arXiv ID 恰有一条处置 |

暂缓与待补证不是“淘汰”，也不是“不重要”。自动查表未命中不证明没有获奖，更不证明没有贡献。奖项相关文字可能是提名、研讨会奖项或讨论其他论文，因此不直接判定正式获奖。

19 篇有独立的逐篇证据跟进记录，其中 2 篇沿用同日已完成的六步审核并复核入口，另外 17 篇完成了部分摘要、身份或外部证据检查。其他记录以元数据、官方名单匹配及必要证据查表为主。**没有把全部候选写成已完成语义相关性审核或全文精读。**

## 2. 通过的论文

1. [The Flexibility Trap: Rethinking the Value of Arbitrary Order in Diffusion Language Models](https://arxiv.org/abs/2601.15165)。ICML 2026 Outstanding Paper。委员会明确指出其揭示了扩散语言模型任意顺序生成中此前不明显的推理失败机制，并提出相应训练思路。收录说明须保留所测模型、数学和代码任务的边界。
2. [High-Accuracy Sampling for Diffusion Models and Log-Concave Distributions](https://arxiv.org/abs/2602.01338)。ICML 2026 Outstanding Paper。委员会明确确认其解决分数采样理论的长期问题，显著改善精度相关的理论复杂度。不能描述为已验证的端到端工程加速。

正式奖项与贡献定位均可追溯至 [ICML 2026 官方评奖报告](https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/)。原始材料、用途、与既有目录的重复核对及收录方式记录在 [完整通过记录](../proposals/academic-importance/arxiv-2026-20260923/selected-v3.json)。本轮生成可收录清单，尚未发布到网站。

## 3. 两个典型未通过案例

- **The Imperfective Paradox in Large Language Models（2601.09373）**：虽获得 ACL 2026 Best Paper，但已有[后续论文](https://arxiv.org/abs/2608.25005)质疑其基准设定、标签及结论范围，记为争议复核。批评论文本身不等于原论文已被证伪，也不等于撤奖。
- **Characterizing the Expressivity of Local Attention in Transformers（2605.00768）**：正式[获奖评语](https://aclanthology.org/2026.acl-long.1739/)支持其严谨性及理论和实践联系；在本轮偏严格的“AI 重大贡献”要求下，仍不足以确认其已实质改变重要技术路线，保留待补证。发现的相关后续论文与原文共享作者，未当作独立证据。

## 4. 候选池如何获得

首次提交日期须在 2026-01-01 至截止日。2026 年获奖但首次提交于 2025 年的论文不进入本次试验。

1. 完整扫描 Cornell 发布的 arXiv 元数据快照：共 3,173,422 条历史记录，其中首次提交于 2026 年的 {coverage['snapshotAll2026Records']:,} 条，覆盖至 {coverage['snapshotLatestFirstSubmission']}。文件校验及收据已保存。
2. 补齐 arXiv 全部 20 个一级学科近期列表及分页，公告日期覆盖 9 月 17、18、21、22、23 日。获得 {coverage['recentUniqueIds']:,} 个不同 ID，其中 {coverage['recentAlreadyInSnapshot']:,} 个与快照重叠，{coverage['recentNotInSnapshot']:,} 个不在快照中；全部元数据已解析，缺口为 0。
3. 对标题、摘要执行冻结的 130 个专业布尔检索式，并合并八类 AI 相关分类（包括跨分类）及外部评价线索。保留早先 API 检索已有的 {s['legacyPoolNonmatches']:,} 条本地精确短语规则未命中记录，明确标记历史命中来源，避免换检索实现时丢失候选。

| 路径 | 命中数（相互重叠） |
|---|---:|
| 分类 | {s['routesOverlapping']['categories']:,} |
| 专业关键词及已保存 API 命中 | {s['routesOverlapping']['keywords']:,} |
| 已匹配到本年 arXiv 的外部评价线索 | {s['routesOverlapping']['external']:,} |

不能把路径数量相加。宽检索会纳入一般 AI 研究、AI 应用及部分跨领域或歧义命中，这些都没有因此通过重要性门槛。

## 5. 完成范围与限制

- 完成的是**上述日期、检索规则和证据集范围内**的候选枚举及必要门槛处置，未宣布“2026 年只有两篇重要论文”。以后获得正式评价或补充明确重大贡献依据，暂缓项可以重新审核。
- 公共快照加近期公告无法包含尚未公开的投稿，也不包含 2026 年未来月份。
- 关键词采用 Unicode 标准化后的标题/摘要完整词组匹配，保留 AND/OR 逻辑；与 arXiv API 的词干规则不保证完全一致。关键词字典本身也不是所有 AI 相关研究的数学意义全集。
- 外部发现范围是已保存的 ICML、ACL、ICLR、CVPR、RSS、IJCAI、SIGIR、AAAI、CoNLL、IJCNLP-AACL 具体名单和跟进线索，未声称穷尽全球评价。仍有 {s['externalLeadsUnresolved']} 条名单线索未完成 arXiv 身份对应，另列待补；没有伪造 ID 纳入计数。这些论文可能已通过其他渠道入池，也可能没有 arXiv 版本。
- 其他年份、赛道和研讨会不继承已启用机制资格。快照中的旧论文也没有被冒充逐篇实时核查；通过项单独核查当前入口。
- 相同 ID 和版本已合并；不同 ID 的研究内容去重只在进入收录前进行。本轮两篇通过项已核对彼此和既有 78 篇目录。

## 6. 可复查的交付物

- [汇总与计数](../proposals/academic-importance/arxiv-2026-20260923/summary-v3.json)
- [逐篇处置清单](../proposals/academic-importance/arxiv-2026-20260923/review-results-v3.jsonl)：每篇的 ID、题名、日期、命中路径、处置理由、审核深度及证据位置。
- [逐篇证据跟进](../proposals/academic-importance/arxiv-2026-20260923/article-evidence-updates.json)
- [覆盖与分页校验](../proposals/academic-importance/arxiv-2026-20260923/collection-coverage-v3.json)
- [完整布尔关键词规则](../proposals/academic-importance/arxiv-2026-20260923/keyword-plan-global-v3.json)
- [外部名单处置](../proposals/academic-importance/arxiv-2026-20260923/external-leads-v3.json)
- [旧候选保留对账](../proposals/academic-importance/arxiv-2026-20260923/legacy-pool-reconciliation-v3.json)
- [结果校验与文件哈希](../proposals/academic-importance/arxiv-2026-20260923/validation-v3.json)

日期范围、唯一 ID、处置总和、通过项六步记录、争议项不得入选及近期元数据完整性校验均通过。旧阶段报告保留为历史记录，以本报告 v3 为本轮当前结论。
'''
(ROOT/'docs/ARXIV_2026_REVIEW_RESULT_20260923.md').write_text(text,encoding='utf-8')
old=ROOT/'docs/ARXIV_2026_REVIEW_PROGRESS_20260923.md';body=old.read_text(encoding='utf-8');notice='> 此文为早先阶段快照。当前结果见 [本轮完成报告](ARXIV_2026_REVIEW_RESULT_20260923.md)，以下数字不再代表当前进度。\n\n'
if notice not in body:old.write_text(notice+body,encoding='utf-8')
print(json.dumps({'report':'docs/ARXIV_2026_REVIEW_RESULT_20260923.md','candidates':s['candidateCount'],'dispositions':c},ensure_ascii=False))
