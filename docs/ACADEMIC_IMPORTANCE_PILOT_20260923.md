# 学术论文重要性机制试审

日期：2026-09-23｜历史试审规则：1.0｜范围：验证重要性证据能否正确进入相应状态，不代替原文内容审读，不新增网站条目。

> 以下表格保留v1.0历史判断，不作为v1.1现行通过记录。

## 真实材料案例

| 论文/材料 | 核实的评价 | 本规则结论 | 原因和后续动作 |
|---|---|---|---|
| Adam: A Method for Stochastic Optimization | ICLR 2025 Test of Time 正奖 | 重要性通过，长期贡献认可 | 官方结果直接链接 arXiv:1412.6980，题名与作者对应；已有库条目后续补录证据，不重复新增 |
| VGGT: Visual Geometry Grounded Transformer | CVPR 2025 Best Paper | 重要性通过，当届突出贡献认可 | 官方获奖页与 arXiv:2503.11651 的题名、六位作者对应；其余内容检查仍待完成，不在此轮发布 |
| Neural Machine Translation by Jointly Learning to Align and Translate | ICLR 2025 Test of Time Runner Up | 暂缓；这条证据不能触发正奖通道 | 不能因它广受认可就省略 Runner Up；允许以后补充其他已启用机制的证据，不断言其不重要 |
| SAM 2: Segment Anything in Images and Videos | ICLR 2025 Honorable Mention | 暂缓；本版未启用该荣誉 | 不能写成 Outstanding Paper winner；这不影响论文原来的学术地位 |
| OLMoTrace: Tracing Language Model Outputs Back to Trillions of Training Tokens | ACL 2025 Best Demo | 暂缓学术重要性；可另按工具/资源审核 | 演示奖不自动变成论文研究贡献奖 |

核查依据：

- [ICLR 2025 时间检验正式结果](https://blog.iclr.cc/2025/04/14/announcing-the-test-of-time-award-winners-from-iclr-2015/)：明确区分正奖与 Runner Up，直接链接两篇 arXiv 原件。
- [Adam 原件](https://arxiv.org/abs/1412.6980)：Diederik P. Kingma、Jimmy Ba；与官方名单对应。
- [CVPR 2025 正式结果](https://cvpr.thecvf.com/Conferences/2025/BestPapersDemos)与[VGGT 原件](https://arxiv.org/abs/2503.11651)：Jianyuan Wang、Minghao Chen、Nikita Karaev、Andrea Vedaldi、Christian Rupprecht、David Novotny，对应一致。
- [ICLR 2025 Outstanding 正式结果](https://blog.iclr.cc/2025/04/22/announcing-the-outstanding-paper-awards-at-iclr-2025/)：SAM 2 位于 Honorable Mentions。
- [ACL 2025 正式结果](https://2025.aclweb.org/program/awards/)：OLMoTrace 位于 Best Demo。

检查者：Codex。本次查看上述官方获奖页面及 Adam、VGGT 的 arXiv 页面时，未见相关撤奖或撤回提示；这是这些页面在检查日可见的状态，不是对所有勘误、争议或外部记录的全面排查。新发布时仍需重新检查。

## 构造的边界案例（不是真实论文评价）

| 输入场景 | 应得结论 | 防止什么错误 |
|---|---|---|
| 使用 ICLR 2025 机制 ID 为 2026 获奖主张背书 | 待核实 | 跨年继承资格 |
| 主会白名单下填入 workshop 同名 Best Paper | 待核实 | 跨赛道继承资格 |
| 只有 arXiv 投稿、10万引用或高审稿均分 | 暂缓 | 用传播量/评分代替正式贡献遴选 |
| 官方确实获奖，但 arXiv 链接对应另一个同名成果 | 待核实 | 把奖项错误绑定到论文 |
| 正式获奖论文出现尚未解决的撤稿/撤奖通知 | 待复核 | 让旧荣誉覆盖新问题 |
| 重要性通过，但与本站范围无关 | 重要性结论保留；最终不收录 | 把重要性等同于收录资格 |
| 重要性通过，且与已有论文是同一成果不同入口 | 更新/合并既有条目 | 重复计数 |

结果：两条真实正奖路径可以使用；三种真实非正奖信号不会被误放行；七类构造边界有明确处置。未给任何论文重新打学术分，也未据此改动既有78篇的发布数据。

## v1.1 范围收紧复核

- Adam：既有官方时间检验评语明确关联神经网络训练方法及跨AI任务的广泛采用，能够支持AI重大贡献门槛；复核采用该具体评语，不能只写“获奖”。
- VGGT：上一轮只验证了CVPR正奖与论文身份，尚未记录足以支持AI发展重大贡献的外部评语。现行状态改为 needs-evidence，不继承v1.0的重要性通过；这不是认定该论文没有重大贡献。
- 构造案例：传统系统或图形论文即使获专业正奖，若只证明所属领域价值，AI重大贡献门槛仍不通过。
- 构造案例：AI会议正奖论文只有“小幅提高某应用任务指标”的证据，不因会议品牌通过。
- 构造案例：跨领域论文有明确外部证据证明改变AI关键训练方法，可定向核其专业奖项，不因所属领域被排除。
- 所有既有78篇仍在重审清单，未批量改变网站发布数据。
