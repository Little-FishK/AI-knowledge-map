# arXiv 系统检索

检索范围由 `proposals/arxiv-catalog/systematic-search-plan.json` 固定：130 个本站节点的题名、摘要查询覆盖 1991 年至截止时刻；14 个相关分类查询覆盖最近一年。领域限定用于减少同名概念误匹配。没有每节点篇数配额，也没有按相关度只取前若干条的截断。

此范围可以验证是否遍历完毕，但不能证明未被关键词命中的论文不存在。分类近一年查询补充了新术语召回；78 篇已收录论文正文中的显式 arXiv 标识提供一跳引用线索。这不等于所有年份全部分类或完整引文网络。

在项目根目录运行（Python 3，仅标准库）：

```powershell
python tools/arxiv-discovery/harvest.py
python tools/arxiv-discovery/reference-seeds.py
python tools/arxiv-discovery/reference-fetch.py
python tools/arxiv-discovery/harvest.py --report-only
python tools/arxiv-discovery/verify.py
python tools/arxiv-discovery/export-queue.py
python tools/arxiv-discovery/write-report.py
```

`reference-fetch.py` 必须等主题检索结束再运行。API 请求保持单连接、至少间隔 3.1 秒，遵循 [arXiv API 使用要求](https://info.arxiv.org/help/api/tou.html)。不要并行启动多个采集进程。状态查询不访问网络：`python tools/arxiv-discovery/status.py`。

`harvest.py` 自动恢复：已完成查询跳过；未完成查询重放缓存并继续。查询定义被哈希锁定，修改已有查询必须使用新运行目录，避免把不同范围的证据混在一起。`--only <query-id>` 用于重试单个查询，`--report-only` 仅刷新汇总。

每次 API 响应保留原始压缩 Atom、请求 URL 和 SHA-256。超过 8,000 条时按提交日期递归拆分；API 分钟上界对应 `:00` 秒，分段总数不足时单独补查边界分钟，并排除相邻两段，确保无重叠、无缺口。每页最多 2,000 条，所有页必须遍历。重复 ID、页码错误、总量变化和服务端异常均使查询保持未完成。独立验证器核对原始响应、分页和查询成员集合；不能用采集进程正常退出代替验证通过。

为减少重复下载，后续查询可以依赖已完整取得的 `node-llm`、`node-neural-network` 集合。实际请求是 `Q ANDNOT (已覆盖查询)`，结果加上原集合覆盖 Q 的全部命中。依赖查询必须完成，验证时还必须先通过原始响应核验；排除表达式、日期范围、补取分页和集合互斥都要验证。汇总中的 `coveredByQueries` 记录依赖，`reportedTotalMeaning` 明确数字是完整结果还是补取结果。后者不能当作该主题总论文数。候选的 `matchedQueries` 仅列直接采集关系，不穷举所有可能匹配的主题。

运行目录在计划的 `runDirectory` 中，包含 `discovery.sqlite`、`responses/` 和导出的 `review-queue.jsonl`。大体积原始数据留在本地，不打包进网站。轻量计划、汇总和验证报告保存在 `proposals/arxiv-catalog/`，便于审阅与重新运行。

队列逐篇包含官方元数据、命中查询、种子引用线索与原有审核处置。新命中统一为 `unreviewed`，不自动变成入库、排除或重要。相同基础 arXiv ID 的版本与跨分类条目去重；不同 ID 的贡献重合仍需内容审核。网站发布数据不会被采集脚本修改。

测试：`python tests/tooling/arxiv-discovery.test.py`。
