# Springer Nature 候选池规则

版本：1.0｜执行日期：2026-09-24｜适用范围：2024-01-01 至 2026-09-24 首次出版的研究论文与会议论文。

## 来源特点

Springer Nature 不是单一会议论文库，而是跨学科出版集团。其平台同时包含三千余种期刊、图书、章节和每年两千余种会议论文集。普通 Springer Nature 发表、Nature 品牌、期刊声望、访问量或引用量都不能直接证明论文对 AI 发展有重大贡献。

因此候选池不能把全平台所有记录都当成 AI 候选，也不能只搜索标题中的 `AI`。本轮采用三路并集并按 DOI 去重：

1. **AI 核心期刊路由。**按 Crossref 覆盖更完整的纸本或电子 ISSN，完整收集 Nature Machine Intelligence、Machine Learning、Artificial Intelligence Review、Neural Computing and Applications、International Journal of Computer Vision、Autonomous Robots、Data Mining and Knowledge Discovery、Cognitive Computation、Machine Vision and Applications、AI & Society 的时段内记录。
2. **专业标题关键词路由。**在 Springer Nature 的 Crossref 成员元数据中检索基础模型、大语言模型、视觉语言模型、扩散模型、生成式 AI、RAG、强化学习、自监督学习、联邦学习、机器遗忘、MoE、上下文学习、测试时计算、对齐、安全、对抗鲁棒、架构搜索、模型压缩和推理等精确术语，再用本地正则严格复核题名。
3. **成熟评价与文献线索路由。**从具体年份、赛道和正奖的官方名单反查 Springer Nature 出版身份；本轮包括 ECCV 2024 主会 Best Paper。

## 文献类型与去重

- 接受 `journal-article` 与 `book-chapter`。Springer 的计算机会议论文通常以 LNCS 等图书章节登记，不能只取 `proceedings-article`。
- DOI 是本轮主去重键；会议版、预印本和期刊扩展版不因题名相似自动合并。
- 期刊路由保留期刊内全部时段记录，之后再做相关性与重要性审核；关键词路由只保留题名严格命中项。
- Crossref 标题检索是相关性排序。本轮每个术语保存前 1000 条并严格回筛，属于可复现的高召回候选池，不宣称穷尽 Springer Nature 的全部 AI 论文。

## 审核口径

所有候选按《学术投稿内容重要性审核机制》1.2 执行。没有匹配到已启用的具体评价机制时，可在第二步暂缓；这只表示本版证据集未闭合，不表示论文从未获奖或不重要。正式奖项仍须单独通过 AI 重大贡献外部证据、身份、当前状态和内容价值检查。
