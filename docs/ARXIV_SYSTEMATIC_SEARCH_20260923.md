# arXiv 系统检索记录

更新时间：2026-09-23T17:11:57.323507+00:00

本次计划尚未全部遍历完成。检索完成与内容审核完成分别记录。

| 指标 | 当前结果 |
|---|---:|
| 查询遍历并核验 | 12 / 144 |
| 去重后元数据候选 | 190,558 |
| 尚未内容审核 | 190,507 |
| 已有 78 篇收录种子的召回 | 58 / 78 |

## 检索范围

130节点的标题/摘要主题检索（1991至截止时刻，采用计算机/统计/信号分类或明确AI关键词的领域限定）+14相关分类近一年检索；全部分页遍历。跨分类、版本按基础ID去重。元数据命中不代表入库。

截止时刻：2026-09-23T16:33:00Z。每个查询全部翻页，超过深分页可用范围时按日期拆分。已经完整覆盖的大语言模型、神经网络查询集合通过 API 的 ANDNOT 运算排除，后续只补取集合之外的结果；覆盖依赖也逐项核验，没有本地猜测关键词匹配。没有 top-N 或每节点收录限额。

## 可复核材料

- [固定查询计划](../proposals/arxiv-catalog/systematic-search-plan.json)
- [逐查询结果及日期分区](../proposals/arxiv-catalog/systematic-search-results.json)
- [原始响应与分页核验](../proposals/arxiv-catalog/systematic-search-verification.json)
- [候选队列统计](../proposals/arxiv-catalog/review-queue-summary.json)
- [运行与恢复说明](../tools/arxiv-discovery/README.md)

完整元数据、命中关系、原始 Atom 响应及候选队列在项目的 `.local/arxiv-discovery/20260923-r2` 中，不进入网站发布包。

## 引文补查

引用标识已抽取，元数据解析尚未完成。

## 尚未完成的工作

本轮不自动增加网站收录量。新发现的论文还需要逐篇判断相关性、重要性、材料质量和贡献重合；元数据相关不等于值得收录。既有 78 篇的审核结论保留。

关键词检索不能证明绝对无遗漏；近一年分类检索不能替代更早年份各分类全部论文的审读。一跳显式 arXiv 引用不是全部参考文献，也未完成前向引用、勘误和撤回追踪。因此原有要求“候选均有处置且关键文献链无待查缺口”的总完成标记仍为 false。

## 逐入口进度

下表数量为该查询直接取得的 ID；使用覆盖依赖的查询不重复计入已由依赖查询完整取得的集合，不能把较小的补取量解释成主题论文总量。

| 入口 | 直接取得 | 已覆盖集合依赖 | 查询状态 | 原始分页核验 |
|---|---:|---|---|---|
| node-attention | 17,650 | 无 | complete | 通过 |
| node-transformer | 9,082 | 无 | complete | 通过 |
| node-residual-connection | 3,194 | 无 | complete | 通过 |
| node-vanishing-gradient | 564 | 无 | complete | 通过 |
| node-scaling-law | 2,868 | 无 | complete | 通过 |
| node-llm | 121,363 | 无 | complete | 通过 |
| node-tokenization | 32,983 | 无 | complete | 通过 |
| node-embedding | 4,564 | node-llm | complete | 通过 |
| node-context-window | 1,362 | node-llm | complete | 通过 |
| node-lost-in-middle | 20 | node-llm | complete | 通过 |
| node-sampling-params | 356 | node-llm | complete | 通过 |
| node-fine-tuning | 25,052 | node-llm | complete | 通过 |
| node-neural-network | 0 | node-llm | running | 未完成 |
| node-gradient-descent | 0 | 无 | not-started | 未完成 |
| node-backprop | 0 | 无 | not-started | 未完成 |
| node-overfitting | 0 | 无 | not-started | 未完成 |
| node-cnn | 0 | 无 | not-started | 未完成 |
| node-rnn | 0 | 无 | not-started | 未完成 |
| node-supervised-learning | 0 | 无 | not-started | 未完成 |
| node-unsupervised-learning | 0 | 无 | not-started | 未完成 |
| node-reinforcement-learning | 0 | 无 | not-started | 未完成 |
| node-self-supervised-learning | 0 | 无 | not-started | 未完成 |
| node-regularization | 0 | 无 | not-started | 未完成 |
| node-decision-tree | 0 | 无 | not-started | 未完成 |
| node-clustering | 0 | 无 | not-started | 未完成 |
| node-dimensionality-reduction | 0 | 无 | not-started | 未完成 |
| node-curse-of-dimensionality | 0 | 无 | not-started | 未完成 |
| node-pretraining | 0 | 无 | not-started | 未完成 |
| node-rag | 0 | 无 | not-started | 未完成 |
| node-vector-db | 0 | 无 | not-started | 未完成 |
| node-prompt-engineering | 0 | 无 | not-started | 未完成 |
| node-chunking | 0 | 无 | not-started | 未完成 |
| node-retrieval | 0 | 无 | not-started | 未完成 |
| node-reranking | 0 | 无 | not-started | 未完成 |
| node-constrained-decoding | 0 | 无 | not-started | 未完成 |
| node-prompt-caching | 0 | 无 | not-started | 未完成 |
| node-structured-output | 0 | 无 | not-started | 未完成 |
| node-cot | 0 | 无 | not-started | 未完成 |
| node-agent | 0 | 无 | not-started | 未完成 |
| node-tool-calling | 0 | 无 | not-started | 未完成 |
| node-mcp | 0 | 无 | not-started | 未完成 |
| node-mcp-architecture | 0 | 无 | not-started | 未完成 |
| node-agent-loop | 0 | 无 | not-started | 未完成 |
| node-agent-memory | 0 | 无 | not-started | 未完成 |
| node-diffusion | 0 | 无 | not-started | 未完成 |
| node-image-generation | 0 | 无 | not-started | 未完成 |
| node-multimodal | 0 | 无 | not-started | 未完成 |
| node-gan | 0 | 无 | not-started | 未完成 |
| node-speech | 0 | 无 | not-started | 未完成 |
| node-video-generation | 0 | 无 | not-started | 未完成 |
| node-controllable-generation | 0 | 无 | not-started | 未完成 |
| node-evaluation | 0 | 无 | not-started | 未完成 |
| node-advanced-rag | 0 | 无 | not-started | 未完成 |
| node-inference-optimization | 0 | 无 | not-started | 未完成 |
| node-quantization | 0 | 无 | not-started | 未完成 |
| node-deployment | 0 | 无 | not-started | 未完成 |
| node-rlhf | 0 | 无 | not-started | 未完成 |
| node-red-teaming | 0 | 无 | not-started | 未完成 |
| node-interpretability | 0 | 无 | not-started | 未完成 |
| node-moe | 0 | 无 | not-started | 未完成 |
| node-distillation | 0 | 无 | not-started | 未完成 |
| node-synthetic-data | 0 | 无 | not-started | 未完成 |
| node-model-families | 0 | 无 | not-started | 未完成 |
| node-hallucination | 0 | 无 | not-started | 未完成 |
| node-prompt-injection | 0 | 无 | not-started | 未完成 |
| node-jailbreak | 0 | 无 | not-started | 未完成 |
| node-reward-hacking | 0 | 无 | not-started | 未完成 |
| node-alignment | 0 | 无 | not-started | 未完成 |
| node-reasoning-models | 0 | 无 | not-started | 未完成 |
| node-agent-frameworks | 0 | 无 | not-started | 未完成 |
| node-multi-agent | 0 | 无 | not-started | 未完成 |
| node-guardrails | 0 | 无 | not-started | 未完成 |
| node-model-selection | 0 | 无 | not-started | 未完成 |
| node-in-context-learning | 0 | 无 | not-started | 未完成 |
| node-context-engineering | 0 | 无 | not-started | 未完成 |
| node-react | 0 | 无 | not-started | 未完成 |
| node-data-poisoning | 0 | 无 | not-started | 未完成 |
| node-adversarial-robustness | 0 | 无 | not-started | 未完成 |
| node-bias-fairness | 0 | 无 | not-started | 未完成 |
| node-privacy | 0 | 无 | not-started | 未完成 |
| node-governance | 0 | 无 | not-started | 未完成 |
| node-streaming | 0 | 无 | not-started | 未完成 |
| node-logprobs | 0 | 无 | not-started | 未完成 |
| node-system-prompt | 0 | 无 | not-started | 未完成 |
| node-self-consistency | 0 | 无 | not-started | 未完成 |
| node-tree-of-thoughts | 0 | 无 | not-started | 未完成 |
| node-observability | 0 | 无 | not-started | 未完成 |
| node-code-execution | 0 | 无 | not-started | 未完成 |
| node-computer-use | 0 | 无 | not-started | 未完成 |
| node-reflection | 0 | 无 | not-started | 未完成 |
| node-knowledge-graph | 0 | 无 | not-started | 未完成 |
| node-clip | 0 | 无 | not-started | 未完成 |
| node-vae | 0 | 无 | not-started | 未完成 |
| node-audio-generation | 0 | 无 | not-started | 未完成 |
| node-image-editing | 0 | 无 | not-started | 未完成 |
| node-super-resolution | 0 | 无 | not-started | 未完成 |
| node-world-models | 0 | 无 | not-started | 未完成 |
| node-content-detection | 0 | 无 | not-started | 未完成 |
| node-code-generation | 0 | 无 | not-started | 未完成 |
| node-planning | 0 | 无 | not-started | 未完成 |
| node-human-in-the-loop | 0 | 无 | not-started | 未完成 |
| node-coding-tools | 0 | 无 | not-started | 未完成 |
| node-workflow-orchestration | 0 | 无 | not-started | 未完成 |
| node-constitutional-ai | 0 | 无 | not-started | 未完成 |
| node-prefilling | 0 | 无 | not-started | 未完成 |
| node-citations | 0 | 无 | not-started | 未完成 |
| node-context-compaction | 0 | 无 | not-started | 未完成 |
| node-agent-skills | 0 | 无 | not-started | 未完成 |
| node-batch-norm | 0 | 无 | not-started | 未完成 |
| node-loss-function | 0 | 无 | not-started | 未完成 |
| node-information-theory | 0 | 无 | not-started | 未完成 |
| node-kernel-methods | 0 | 无 | not-started | 未完成 |
| node-post-training | 0 | 无 | not-started | 未完成 |
| node-positional-encoding | 0 | 无 | not-started | 未完成 |
| node-normalization | 0 | 无 | not-started | 未完成 |
| node-optimizer-schedule | 0 | 无 | not-started | 未完成 |
| node-peft-lora | 0 | 无 | not-started | 未完成 |
| node-distributed-training | 0 | 无 | not-started | 未完成 |
| node-contrastive-learning | 0 | 无 | not-started | 未完成 |
| node-model-merging | 0 | 无 | not-started | 未完成 |
| node-model-evaluation | 0 | 无 | not-started | 未完成 |
| node-model-routing | 0 | 无 | not-started | 未完成 |
| node-data-drift-monitoring | 0 | 无 | not-started | 未完成 |
| node-agent-identity-access | 0 | 无 | not-started | 未完成 |
| node-flow-matching | 0 | 无 | not-started | 未完成 |
| node-training-data-governance | 0 | 无 | not-started | 未完成 |
| node-uncertainty-calibration | 0 | 无 | not-started | 未完成 |
| node-test-time-compute | 0 | 无 | not-started | 未完成 |
| node-state-space-models | 0 | 无 | not-started | 未完成 |
| node-voice-cloning | 0 | 无 | not-started | 未完成 |
| category-cs.AI | 0 | 无 | not-started | 未完成 |
| category-cs.CL | 0 | 无 | not-started | 未完成 |
| category-cs.LG | 0 | 无 | not-started | 未完成 |
| category-stat.ML | 0 | 无 | not-started | 未完成 |
| category-cs.CV | 0 | 无 | not-started | 未完成 |
| category-cs.SD | 0 | 无 | not-started | 未完成 |
| category-eess.AS | 0 | 无 | not-started | 未完成 |
| category-cs.RO | 0 | 无 | not-started | 未完成 |
| category-cs.SE | 0 | 无 | not-started | 未完成 |
| category-cs.CR | 0 | 无 | not-started | 未完成 |
| category-cs.IR | 0 | 无 | not-started | 未完成 |
| category-cs.HC | 0 | 无 | not-started | 未完成 |
| category-cs.MA | 0 | 无 | not-started | 未完成 |
| category-cs.DC | 0 | 无 | not-started | 未完成 |
