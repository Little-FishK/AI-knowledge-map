"""Publish an honest discovery snapshot; preserve independent editorial decisions."""
import datetime as dt,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
base=ROOT/'proposals/arxiv-catalog'
read=lambda name:json.loads((base/name).read_text(encoding='utf-8'))
plan=read('systematic-search-plan.json');results=read('systematic-search-results.json')
verification=read('systematic-search-verification.json');queue=read('review-queue-summary.json')
refs=read('reference-search-results.json')if(base/'reference-search-results.json').exists()else None
verified={r['id']:r for r in verification['queries']}
queries={q['id']:q for q in results['queries']}
coverage=read('coverage.json')
for node in coverage['coverage']:
    q=queries['node-'+node['nodeId']];v=verified.get(q['id'],{})
    node['systematicDiscovery']={
        'planRevision':plan['revision'],'queryId':q['id'],'queryStatus':q['status'],
        'queryTraversalVerified':v.get('verified',False),
        'matchedCanonicalIds':q['uniqueHarvested'],
        'matchedCountMeaning':q.get('reportedTotalMeaning','all matching IDs'),
        'coveredByQueries':q.get('coveredByQueries',[]),
        'candidateStore':results['database'],'queryEvidence':'systematic-search-results.json',
        'verificationEvidence':'systematic-search-verification.json',
        'importanceReviewComplete':False}
    node['discoveryStatus']='query-traversal-verified-review-pending'if v.get('verified')else'systematic-search-in-progress'
    # Earlier completion fields require editorial disposition and citation-chain closure.
    # Metadata retrieval cannot satisfy those conditions by itself.
    node['historicalSearchComplete']=False;node['frontierSearchComplete']=False
coverage['updatedAt']=dt.datetime.now(dt.timezone.utc).date().isoformat()
(base/'coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
missing=verification['knownAcceptedSeedRecall']['missingIds']
complete=verification['allQueryTraversalsVerified']
lines=['# arXiv 系统检索记录','',
       '更新时间：'+dt.datetime.now(dt.timezone.utc).isoformat(),'',
       ('已验证本次计划全部查询的分页遍历。'if complete else'本次计划尚未全部遍历完成。')+'检索完成与内容审核完成分别记录。','',
       '| 指标 | 当前结果 |','|---|---:|',
       f"| 查询遍历并核验 | {verification['verifiedQueries']} / {verification['plannedQueries']} |",
       f"| 去重后元数据候选 | {queue['uniqueCandidates']:,} |",
       f"| 尚未内容审核 | {queue['editorialDecisions'].get('unreviewed',0):,} |",
       f"| 已有 78 篇收录种子的召回 | {78-len(missing)} / 78 |",'',
       '## 检索范围','',plan['description'],'',
       '截止时刻：'+plan['cutoffUTC']+'。每个查询全部翻页，超过深分页可用范围时按日期拆分。已经完整覆盖的大语言模型、神经网络查询集合通过 API 的 ANDNOT 运算排除，后续只补取集合之外的结果；覆盖依赖也逐项核验，没有本地猜测关键词匹配。没有 top-N 或每节点收录限额。','',
       '## 可复核材料','',
       '- [固定查询计划](../proposals/arxiv-catalog/systematic-search-plan.json)',
       '- [逐查询结果及日期分区](../proposals/arxiv-catalog/systematic-search-results.json)',
       '- [原始响应与分页核验](../proposals/arxiv-catalog/systematic-search-verification.json)',
       '- [候选队列统计](../proposals/arxiv-catalog/review-queue-summary.json)',
       '- [运行与恢复说明](../tools/arxiv-discovery/README.md)','',
       '完整元数据、命中关系、原始 Atom 响应及候选队列在项目的 `'+plan['runDirectory']+'` 中，不进入网站发布包。','',
       '## 引文补查','']
if refs:
    lines += [f"从 78 篇已收录论文正文抽取 {refs['total']} 个不同的显式 arXiv 引用标识。解析状态：`{json.dumps(refs['statuses'],ensure_ascii=False)}`。",'',
              '[引用线索](../proposals/arxiv-catalog/reference-search-seeds.json) · [解析结果与未解决项](../proposals/arxiv-catalog/reference-search-results.json)','']
else:lines+=['引用标识已抽取，元数据解析尚未完成。','']
lines+=['## 尚未完成的工作','',
        '本轮不自动增加网站收录量。新发现的论文还需要逐篇判断相关性、重要性、材料质量和贡献重合；元数据相关不等于值得收录。既有 78 篇的审核结论保留。','',
        '关键词检索不能证明绝对无遗漏；近一年分类检索不能替代更早年份各分类全部论文的审读。一跳显式 arXiv 引用不是全部参考文献，也未完成前向引用、勘误和撤回追踪。因此原有要求“候选均有处置且关键文献链无待查缺口”的总完成标记仍为 false。','',
        '## 逐入口进度','',
        '下表数量为该查询直接取得的 ID；使用覆盖依赖的查询不重复计入已由依赖查询完整取得的集合，不能把较小的补取量解释成主题论文总量。','',
        '| 入口 | 直接取得 | 已覆盖集合依赖 | 查询状态 | 原始分页核验 |','|---|---:|---|---|---|']
for q in results['queries']:
    lines.append(f"| {q['id']} | {q['uniqueHarvested']:,} | {', '.join(q.get('coveredByQueries',[]))or'无'} | {q['status']} | {'通过'if verified.get(q['id'],{}).get('verified')else'未完成'} |")
(ROOT/'docs/ARXIV_SYSTEMATIC_SEARCH_20260923.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'verifiedQueries':verification['verifiedQueries'],'plannedQueries':len(plan['queries']),'uniqueCandidates':queue['uniqueCandidates'],'discoveryComplete':complete,'contentReviewComplete':False}))
