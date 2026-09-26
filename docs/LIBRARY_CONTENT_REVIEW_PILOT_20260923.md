# 内容审核试验：DeepSeek 与 METR 各 10 条

审核/查阅日：2026-09-23。执行 [内容审核机制 v1](LIBRARY_CONTENT_REVIEW_POLICY.md)。以下为编辑审核建议，未发布或改动正式资料。

## 1. 取样与现有库基线

预先固定栏目，按日期倒序取截至审核日的最近 10 条，不跳过弱内容：

- [DeepSeek Change Log](https://api-docs.deepseek.com/updates/)：10 个日期块，2026-09-10 至 2025-05-28；2025-12-01 同日的 V3.2 与 Speciale 算一条发布记录。这里审的是 API/模型变更栏目，不冒充其全部论文和 GitHub 产出。
- [METR Updates](https://metr.org/blog/)：10 篇，2026-09-22 至 2025-12-09。Research、Notes 和 Risk Assessment 是另外的栏目，不在连续取样分母中；候选正文链接的补充原件可以查，但不另算样本。

两个栏目的发布时间跨度、内容构成不同，不能用通过率评价谁更优秀。本轮按审核日可见版本回溯判断，不模拟文章最初发布当天的判断。

已核对本地 data/library*.js：DeepSeek 已有 V4-Pro 模型卡、V4 Preview 公告、V4.1 公告、V3 仓库、R1 仓库及指南等；METR 已有 metr-time-horizons-and-predeployment 机构入口。机构首页条目不等于其中全部报告已收录。

下列“新增”均相对此本地基线；“更新”包括向已有对象或本批拟建对象附加版本。合并只给出建议，不删除现有数据。

## 2. DeepSeek：2 条新增，8 条更新/合并

所有样本为发布方自述；通过表示可提供技术资料入口，不代表已验证性能。D 编号对应连续日期块，原文定位为 Change Log 中该日期；补充原件另列。

| 编号/日期 | 发布记录 | 读者用途与增量 | 材料判断、限制 | 结果与明确去向 |
|---|---|---|---|---|
| D1 2026-09-10 | V4.1-Flash | 理解新架构与缓存设计；attention、inference-optimization | 已读公告及模型卡 Introduction；足够介绍架构，当前 Pro 路由说法冲突，见下文 | 更新 deepseek-v41-flash-release，补模型卡与技术报告入口；不另加同名卡片 |
| D2 2026-08-21 | V4-Flash-Vision-Exp | 跟踪 V4 视觉扩展；multimodal | 原变更记录可证发布；后续已被替代，不能作为当前 API 推荐 | 更新 V4 资料对象的历史版本部分；主对象由 D5 对应已有卡片整理 |
| D3 2026-08-13 | V4-Pro Update | 了解线上版本变化；agent | 读变更块，详细公告抓取失败；只记公开变更，不把开放权重与 API 当前版本混为一谈 | 更新 deepseek-v4-pro-model-card 的关联版本记录；服务状态字段随 D1 待核 |
| D4 2026-07-31 | V4-Flash Update | 跟踪同架构后训练更新；model-families | 变更块明确版本关系；这是版本增量，不需要新成果卡 | 更新 V4 主对象的 Flash 版本历史 |
| D5 2026-04-24 | V4 发布 | 获取 V4 研究和部署材料；context-window | 公告抓取失败，已读官方 V4-Pro 模型卡 Introduction、Evaluation、部署部分，足够作为资料入口 | 更新已有 deepseek-v4-preview-release；与 deepseek-v4-pro-model-card 建立对象关联，建议汇成 V4 主对象并保留 Pro 子版本 |
| D6 2025-12-01 | V3.2 / Speciale | 研究思考与工具使用的结合；reasoning-models、agent | 公告有技术报告和两个模型入口；临时服务地址已过有效期，保留研究用途 | 收录：拟建 deepseek-v32-resource；Speciale 作为同报告下的变体入口 |
| D7 2025-09-29 | V3.2-Exp | 追溯 DSA 方法；attention | 原文有模型和技术报告；新信息值得保留，但属于 D6 的技术演进 | 更新本批 D6 对象，保留 Exp 的独立原件与日期 |
| D8 2025-09-22 | V3.1-Terminus | 查版本修正；model-families | 变更块记载优化；无独立方法材料，不单列 | 更新本批 D9 对象的修订历史 |
| D9 2025-08-21 | V3.1 | 理解混合思考模式和模板；reasoning-models | 官方模型卡有模式、模板和使用材料；独立使用价值超过一个普通 V3 补丁 | 收录：拟建 deepseek-v31-resource；关联已有 deepseek-v3-repo，不替换 V3 原研究 |
| D10 2025-05-28 | R1-0528 | 查 R1 系列后续版本；reasoning-models | 公告与权重入口可核查；不能沿用当时 API 说明作今天的教程 | 更新已有 deepseek-r1-repo，补版本链接 |

本轮不新建空的“V4 主对象”重复计数；如果实施合并，应选现有对象承接并保留旧 ID 跳转或关联。V3.1、V3.2 单列依据是使用方式和技术问题的独立性，不是小数版本号自动值得一张卡。

### 补充原件与证据定位

- D1：[发布公告](https://api-docs.deepseek.com/news/news260910/)，架构段和 API 段；[模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)，Introduction、技术报告入口。两者共同支撑技术资料用途，本轮没有复现实验。
- D3—D5：[V4-Pro 官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)，Introduction、Evaluation Results、How to Run Locally。模型卡自称 preview，不能据此认定它等同于日志的线上 GA 版本。
- D6：[V3.2 公告](https://api-docs.deepseek.com/news/news251201/)，Thinking in Tool-Use、Open Source Release 和临时服务说明。
- D7：[V3.2-Exp 公告](https://api-docs.deepseek.com/news/news250929/)，DSA 说明及 Open Source Release。
- D9：[V3.1 模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)，Introduction、Chat Template；公告抓取失败，没有把失败当作资料不存在。
- D10：[R1-0528 公告](https://api-docs.deepseek.com/news/news250528/)，版本特性及开放权重入口。

### 实际发现的冲突

D1 新闻页称 9 月 14 日后 Pro 请求转到 V4.1-Flash；Change Log 同日块又称将继续提供 V4-Pro 服务。两页公开表述不一致。处理：技术资源可以更新；“当前 Pro 路由/可用性”字段待核，不选一个说法冒充确定事实。要解除待核，需核对当前正式接口文档或取得官方澄清；本轮未调用付费 API。这个局部缺口不阻断架构资料的收录，因此不计整条待补。

## 3. METR：8 条新增，1 条合并，1 条不收录

M 编号对应 Updates 的连续顺序。标题链接为实际原文，日期按页面正文，不从 URL 推测。

| 编号/日期 | 内容与原文 | 读者用途/相关范围 | 材料、增量与限制 | 结果与去向 |
|---|---|---|---|---|
| M1 2026-09-22 | [Opus 5.5 预部署评测](https://metr.org/blog/2026-09-22-claude-opus-5-5/) | 了解 AI R&D 测量范围；model-evaluation | 列出任务、访问周期及限制，有新评测对象；部分支持材料非公开，厂商有文本审阅机会 | 收录：拟建 metr-opus55-evaluation；呈现为有限范围评测，不写成独立证实全面安全 |
| M2 2026-08-31 | [安全事件复盘](https://metr.org/blog/2026-08-31-security-update/) | 研究代理应用权限与凭据事故；agent-identity-access | 公开事件、原因和整改；是可迁移教训而非普通机构动态，当事方调查不等于外部定论 | 收录：拟建 metr-security-incidents-2026 |
| M3 2026-08-14 | [Funding update](https://metr.org/blog/2026-08-14-funding-update/) | 机构资金与计划 | 对来源关系审查有用，但不提供本库读者所需的独立技术资源 | 不收录为内容卡；资助与免费资源关系可记来源档案，不把它说成毫无价值 |
| M4 2026-07-28 | [失准行为事件调查建议](https://metr.org/blog/2026-07-28-investigating-ai-propensities-after-incidents/) | 组织调查问题、访问与披露；safety | 有具体问题框架及限制，9 月 5 日修订；属于提案，不是已验证统一标准 | 收录：拟建 metr-incident-investigation-framework，保留首发及修订日期 |
| M5 2026-06-26 | [GPT-5.6 Sol 预部署评测](https://metr.org/blog/2026-06-26-gpt-5-6-sol/) | 理解作弊处理如何影响测量；model-evaluation | 公开方法差异与不稳健性；NDA 和发布审阅需说明，不能把某个估计包装为稳定能力值 | 收录：拟建 metr-sol-evaluation；机构首页提及它不等于已有这份独立报告 |
| M6 2026-05-08 | [自动化 R&D 风险论证审阅](https://metr.org/blog/2026-05-08-rd-section-anthropic-risk-report-feb-2026-review/) | 识别论证与证据缺口；safety | 摘要明确审阅对象、问题及限制，有原版和更新版原件链接；部分背景非公开 | 收录：拟建 metr-rd-risk-review-2026；两个审阅版本合成一项，不作两条 |
| M7 2026-03-26 | [内部代理监控红队测试](https://metr.org/blog/2026-03-25-red-teaming-anthropic-agent-monitoring/) | 理解监控覆盖与评估边界；safety | 原短讯不足以详细讲方法，但已追到后来公开的风险报告相关节与附录，补足限定案例用途；合作测试，不称完全独立复现 | 收录：拟建 metr-monitoring-redteam-2026；以详细公开报告相关节为主入口，短讯作发布记录 |
| M8 2026-03-12 | [Opus 4.6 Sabotage Risk Report 审阅](https://metr.org/blog/2026-03-12-sabotage-risk-report-opus-4-6-review/) | 了解评估意识与风险论证；safety | 有具体审阅分歧及两版报告入口；与 M6 问题不同，与 M7 实验不同，不仅因都提 Anthropic 就合并 | 收录：拟建 metr-opus46-sabotage-review；区分原始版和修订版 |
| M9 2026-02-17 | [保密信息保护方式](https://metr.org/blog/2026-02-17-how-we-protect-confidential-information/) | 理解 M2 中组织原有控制与事故教训；safety | 有实际措施，但本批已有更具体的事故案例；内容不表示这些控制永远有效 | 更新本批 M2，作为事故前的制度背景原件，不另发机构制度卡 |
| M10 2025-12-09 | [前沿安全政策共同要素更新](https://metr.org/blog/2025-12-09-common-elements-of-frontier-ai-safety-policies/) | 比较政策结构；safety | 有专题正文与原始政策引用，综合分析有独立用途；不作为当前法律状态证明 | 收录：拟建 metr-safety-policy-common-elements；专题正文作主入口，公告附属 |

### 关键补证与阅读范围

已读各篇正文或执行摘要和限制。M6、M8 的完整附件链接已在正文确认，本轮判断仅支持“审阅资料入口及公开摘要”，未完成附件逐条论证复核，不对附件全部结论背书。

M7 不是见到“保密报告”就停止审核：[后来公开的 Frontier Risk Report](https://metr.org/blog/2026-05-19-frontier-risk-report/) 的 Red-teaming exercise 与 Appendix B 中 David Rein 的记录给出更多具体情况。本轮读了这些相关部分，未声称通审整份长报告。原短讯 URL 写 03-25，正文日期是 03-26，登记后者。研究是在当时访问与测试条件下完成，不能推断当前系统仍有同样问题。

M10 的[专题正文](https://metr.org/common-elements) 标示 2025-12-16，而公告为 12-09；分别保存，不把入口页与原件发布日期混成一个。没有把旧综合分析当作 2026 年最新政策核查。

## 4. 统计与规则修正

| 栏目样本 | 收录新对象 | 更新/合并 | 整条待补 | 不收录为内容卡 | 输入记录 |
|---|---:|---:|---:|---:|---:|
| DeepSeek Change Log | 2 | 8 | 0 | 0 | 10 |
| METR Updates | 8 | 1 | 0 | 1 | 10 |
| 合计 | 10 | 9 | 0 | 1 | 20 |

20 条发布记录不等于新增 20 张卡：本地基线下建议新增 10 个资料对象，另处理 9 项更新/合并。D1/D3 涉及同一个字段冲突，不额外计成两个待补条目。没有为了凑齐四种结果而人为制造整条待补案例；待补规则仍保留供真正阻断核心用途的缺证情况使用。

试验后的机制修正：

1. 数量按独立资料对象计，不按网页或公告计；必须先对照真实本地清单。
2. 内容价值不要求研究首创，框架、比较分析和失败案例也可以成立。
3. 核心用途与证据强度一起决定可写范围；不把作者自述变成本站结论，也不因不确定性就丢掉有教育价值的测量案例。
4. 跟随原文的后续公开材料再判缺证，避免把已经补充的信息遗漏；同时不假装看过未读附件。
5. 同源内部可以冲突，当前使用状态与历史研究价值必须分开。
6. 3—5 个候选是首批工作量建议，不是最终发布配额。METR 样本有 8 个独立用途时，不应为凑 5 个而删掉合格资料。

本试验不是两个来源全量内容的审计，也不能把 50% 新增比例套给全库。正式落地前应把以上拟建/合并建议转成具体资料卡，再按同一规则核验卡片实际表述。
