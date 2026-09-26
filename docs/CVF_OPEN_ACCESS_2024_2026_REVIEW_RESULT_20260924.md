# CVF Open Access 2024–2026 候选池与重要性审核结果

检查日：2026-09-24｜候选池：19,813 篇｜可上线：0 篇

## 结论

按[CVF Open Access 候选池规则](CVF_OPEN_ACCESS_COLLECTION_POLICY.md)建立候选池，再逐条执行[学术投稿内容重要性审核机制](ACADEMIC_IMPORTANCE_POLICY.md)：

| 年份 | 候选 | 通过 | 待补证 | 暂缓 |
|---|---:|---:|---:|---:|
| 2024 | 4,537 | 0 | 0 | 4,537 |
| 2025 | 8,102 | 0 | 1 | 8,101 |
| 2026 | 7,174 | 0 | 0 | 7,174 |
| **合计** | **19,813** | **0** | **1** | **19,812** |

因此，本批没有论文满足全部六步要求，当前没有可上线文章。

## 唯一精确命中正式机制的论文

### VGGT: Visual Geometry Grounded Transformer

- 作者：Jianyuan Wang、Minghao Chen、Nikita Karaev、Andrea Vedaldi、Christian Rupprecht、David Novotny
- CVF 终版：[CVPR 2025 paper page](https://openaccess.thecvf.com/content/CVPR2025/html/Wang_VGGT_Visual_Geometry_Grounded_Transformer_CVPR_2025_paper.html)
- 正式评价：[CVPR 2025 Best Paper](https://cvpr.thecvf.com/Conferences/2025/BestPapersDemos)
- 审核：步骤 1–3 通过；步骤 4 为官方页面范围内的有限状态核验；步骤 5 待补证；步骤 6 未运行。
- 原因：正式 Best Paper 结果与 CVF 终版题名、六位作者完全对应，但现有材料仍没有足够明确的独立专业说明，证明它具体对 AI 发展形成了什么重大贡献。作者摘要和获奖事实不能代替这一门槛。
- 重复处理：与既有 `arXiv:2503.11651` 是同一成果；未来补证通过时只合并 CVF 终版和奖项证据，不新增重复卡片。

## 其余论文为何暂缓

当前机制登记表中，落在本批出版年份并能精确应用的只有 `cvpr-2025-best`。其余 19,812 篇没有命中同一会议、年份、轨道、完整奖项名和 winner 身份均一致的已启用正式评价机制，因此在步骤 2 暂缓。这里包括普通录用、Oral、Highlight、Findings 和 workshop 论文；暂缓不等于否定论文质量。

`cvpr-2026-longuet-higgins` 虽已启用，但其赛道是 CVPR 2016 papers，评价的是十年前论文，不属于本批 2024–2026 出版候选基数。

## 覆盖与可复核性

- 可访问记录：主会 14,936、workshop 3,935、CVPR 2026 Findings 942；合计 19,813，单篇 URL 去重后无重复。
- 来源分页：7 个 workshop 菜单、388 个论文分页。
- 覆盖缺口：ICCV 2025 菜单的 `CVAUI & AAMVEM` 与 `MRR 2025` 两条路由在检查日返回 HTTP 403；尝试可预测别名只得到不含论文的通用页。报告不臆造这两个页面的论文数，待官方路由恢复后做增量抓取与审核。
- 机器可复核结果位于 `proposals/academic-importance/cvf-open-access-2024-2026-20260924/`：候选池、来源哈希、逐条审核、待补证记录和空的上线清单均已保存。

## 发布决定

六步通过清单 `selected.json` 仍为空。2026-09-24 用户明确授权将 VGGT 作为公开待补证条目发布，因此网站新增该论文的 CVF 终版入口，并强制标注“缺乏 AI 重大贡献外部说明；上线不代表通过”。这项编辑发布决定不改变其 `needs-evidence` 审核状态。若后续取得独立 AI 重大贡献说明，或新增并启用其他 CVPR／ICCV／WACV 精确奖项机制，应只对相应记录增量复审。
