# 专业资料库

专业资料库用于保存重要但不一定适合成为节点或软件教程的高质量信息。一级导航严格按九类信息来源分类，二级导航细分到具体平台、机构、集合或经认证个人；内容形式与主题只作为筛选标签。

九个一级来源各自拥有独立审核机制。某一一级来源的准入门槛、字段和数量策略不得改变其他一级来源的审核结论；跨来源共用的只有 ID、网址、来源归属和站内关联等机械完整性检查。

正式数据位于 `data/library.js`，注册为 `window.PRO_LIBRARY`。
官方技术资料精选包位于 `data/library-official-technical.js`，在基础资料之后追加到同一资料库。
二级来源的平台档案位于 `data/library-platform-profiles.js`，注册为 `window.LIBRARY_PLATFORM_PROFILES`。
来源治理元数据（级别、一手性、归属区、用途、节奏、健康度、角色、状态复核日期）位于 `data/library-source-meta.js`，注册为 `window.LIBRARY_SOURCE_META`，并在载入时合并进对应档案。
Kaggle 黑客马拉松经五项硬门槛审核通过的 157 个获奖项目位于 `data/library-hackathon-kaggle.js`，原始审核记录位于 `proposals/hackathon/kaggle-admitted-projects-20260924.json`。这些记录默认标记为 `discoveryOnly`：用于发现实现流程、数据、评测与约束，不把赛事名次等同于同行评审或独立复现。
追前沿与安全/监管类的新增种子资料位于 `data/library-new-sources.js`。
来源标准见 [FRONTIER_SOURCE_POLICY.md](FRONTIER_SOURCE_POLICY.md)，内容检查见 [通用内容规则](LIBRARY_CONTENT_REVIEW_POLICY.md)。学术投稿另用 [重要性审核机制](ACADEMIC_IMPORTANCE_POLICY.md) 和 [评价机制白名单](../proposals/academic-importance/README.md)。
“标准与监管”使用 [单层专用审核机制](STANDARDS_REGULATORY_REVIEW_POLICY.md) 和 [审核记录模板](../proposals/standards-regulatory/review-template.json)：六项硬门槛通过即收录，不设评分、排名或配额。边界验证见 [NIST 试审记录](STANDARDS_REGULATORY_NIST_PILOT_20260924.md) 与 [ISO/IEC 试审记录](STANDARDS_REGULATORY_ISO_IEC_PILOT_20260924.md)；其余 11 个二级来源的完成情况见 [全量审核结果](STANDARDS_REGULATORY_REMAINING_SOURCES_REVIEW_20260924.md)。
“黑客马拉松”使用独立的[竞赛与黑客马拉松内容审核机制](HACKATHON_CONTENT_REVIEW_POLICY.md)和[审核记录模板](../proposals/hackathon/review-template.json)。本类不设候选池或两阶段流程，每个项目直接检查五项硬门槛：身份可确认、AI 专业相关、产物可访问、知识有增量、奖项符合要求；其中第五项只允许主奖、正式赛道冠军和明确 AI 技术主题的专项奖通过。边界验证见 [Kaggle 试审记录](HACKATHON_KAGGLE_PILOT_20260924.md)。

每条资料至少包含：

- 唯一 ID、一级来源、二级来源、标题、发布者和具体集合；
- 内容形式、权威等级、审核状态与是否一手；
- 原始 HTTPS 地址和访问日期；
- 原创摘要、允许支持的证据范围和局限；
- 标签，以及关联节点和软件；
- 官方技术资料还必须使用该一级来源当前机制；OpenAI 使用 `official-technical-importance-v2`，其他已审品牌暂沿用 `official-knowledge-matrix-v1`。所有通过项均须记录审核日期、知识增量、品牌证据增量和逐条入选理由；
- `discoveryOnly`，明确该资料是否只能用于发现。

修改后运行：

```powershell
npm run validate
```

资料进入库不表示它可以自动改变节点、教程或学习路径。晋升必须进入各自已有的门禁流程。

官方技术资料采用独立的[知识矩阵审核机制](OFFICIAL_TECHNICAL_REVIEW_POLICY.md)：每条必须补上现有知识主题，或提供会影响理解、选型、使用与比较的品牌差异证据；只证明“该品牌也有此功能”的资料不收。每个二级来源至少有一条通过审核的资料，但不设篇数配额。结构化记录使用[审核模板](../proposals/official-technical/review-template.json)；机制边界已经过 [OpenAI 试审](OFFICIAL_TECHNICAL_OPENAI_PILOT_20260924.md)验证。当前全局选材清单见 [OFFICIAL_TECHNICAL_CURATED.md](OFFICIAL_TECHNICAL_CURATED.md)。

## 两级来源结构

- `sourceClasses[].id`：九类固定一级来源。
- `sourceClasses[].subcategories[]`：该类允许使用的二级平台或来源集合。
- `items[].sourceClass`：资料对象的主要一级来源。
- `items[].sourceSubcategory`：主要二级来源，必须存在于对应一级来源中。
- `items[].primaryCategory`：来源内部的主知识分类；当前 OpenAI 官方技术资料使用固定 10 类。
- `items[].topicTags[]`：供检索和后续交叉筛选使用的主题分类标识。
- `items[].relatedMaterials[]`：同一成果的附属原件，保留各自来源、题名、版本、证据等级、简介和限制。全库只计一个对象，各来源筛选均可发现；不把官方文档的等级套给研究论文。

OpenAI 的 10 类知识分类、口径与当前数量见 [OpenAI 官方技术资料分类发布记录](OFFICIAL_TECHNICAL_OPENAI_TOPIC_CLASSIFICATION_20260924.md)。该层只在用户进入“官方技术资料 / OpenAI”后出现，不替代一级来源、二级来源或准入评分。

二级来源是分类与审核边界，不是对整个平台的内容背书。例如 `academic/arxiv` 表示资料来自 arXiv，仍需逐篇判断作者、版本、证据和论文状态；`open-source/github-canonical` 只允许项目确认的主仓库，不代表 GitHub 上所有仓库可信。

arXiv经审核内容位于 `data/library-arxiv.js`，需要在基础库和官方资料包之后加载。2026-09-23轮次处理81条记录，78篇进入本地网站，详细处置见 [arXiv审核记录](ARXIV_CONTENT_REVIEW_20260923.md)。收录数量没有上限，已入库数量不表示系统检索完成。修改后运行 `node tools/validators/library.js` 与 `node tests/app/library-arxiv.test.js`；后者检查两种浏览器入口及跨来源合并行为。

OpenReview 候选池的正式收录内容位于 `data/library-openreview.js`。2026-09-24 轮次核对 ICLR 2024—2026 的 11,319 条接收决定，5 篇完成六步审核并发布；正式论文链接采用 ICLR 最终论文集，奖项证据和未收录处置见 [OpenReview/ICLR 审核记录](OPENREVIEW_ICLR_2024_2026_REVIEW_RESULT_20260924.md)。修改后运行 `node tools/validators/library.js` 与 `node tests/app/library-openreview.test.js`。

ACL Anthology 的公开待补证目录位于 `data/library-acl-anthology.js`。2026-09-24 轮次对 31,043 篇候选完成门槛处置，公开 52 篇精确命中已启用正式奖项机制的论文；其中 51 篇标明“缺乏 AI 重大贡献独立证据”，1 篇标明关键证据冲突待复核。所有条目均为 `discoveryOnly`，上线不表示重要性通过。候选规则与处置见 [ACL Anthology 审核记录](ACL_ANTHOLOGY_2024_2026_REVIEW_RESULT_20260924.md)。

NeurIPS Proceedings 的正式收录内容位于 `data/library-neurips-proceedings.js`。2026-09-24 轮次对 10,380 篇候选完成身份与机制门槛核对，5 篇主赛道 Best Paper 正奖完成六步审核并可发布；其中 4 篇合并到既有 arXiv 卡片，STDE 新增一张卡片。`Guiding a Diffusion Model with a Bad Version of Itself` 经官方奖项分组复核为 Runner-up，已改为重要性暂缓，不计入这 5 篇。候选规则与处置见 [NeurIPS Proceedings 审核记录](NEURIPS_PROCEEDINGS_2024_2026_REVIEW_RESULT_20260924.md)。

PMLR 的公开待补证目录位于 `data/library-pmlr.js`。2026-09-24 轮次覆盖 102 个正式卷、12,448 篇候选；14 篇精确匹配 ICML 2024/2025 主研究论文正奖，但缺少逐篇 AI 重大贡献外部说明。应用户明确发布决定，这 14 篇以 `discoveryOnly=true` 和 `needs-evidence` 状态公开，所有卡片均标注“上线不代表通过”。候选规则与处置见 [PMLR 审核记录](PMLR_2024_2026_REVIEW_RESULT_20260924.md)。

CVF Open Access 的公开待补证目录位于 `data/library-cvf-open-access.js`。2026-09-24 轮次处置 19,813 篇可访问候选；VGGT 精确匹配 CVPR 2025 Best Paper，但缺少 AI 重大贡献外部说明。应用户明确发布决定，该论文以 `discoveryOnly=true` 和 `needs-evidence` 状态公开，卡片明确标注“上线不代表通过”。候选规则与处置见 [CVF Open Access 审核记录](CVF_OPEN_ACCESS_2024_2026_REVIEW_RESULT_20260924.md)。

IEEE Xplore 的公开待补证目录位于 `data/library-ieee-xplore.js`。2026-09-24 轮次处置 63,609 篇候选；四篇论文精确匹配 ICRA 2024/2025 Best Conference Paper 正奖，但缺少足以满足本站门槛的 AI 重大贡献外部说明。应用户明确发布决定，四篇均以 `discoveryOnly=true` 和 `needs-evidence` 状态公开，卡片明确标注“上线不代表通过”。候选规则与处置见 [IEEE Xplore 审核记录](IEEE_XPLORE_2024_2026_REVIEW_RESULT_20260924.md)。

“黑客马拉松”一级来源采用独立的单次五门槛机制：身份可确认、AI 专业相关、产物可访问、知识有增量、奖项符合要求。Kaggle 2024—2026 批次覆盖 18 场目录活动、248 个官方结果项目；157 个通过，15 个因知识增量证据不足暂缓，76 个不通过，其中 70 个因第五项奖项门槛失败。范围、逐赛事计数与理由见 [Kaggle 全量审核记录](HACKATHON_KAGGLE_2024_2026_FULL_REVIEW_20260924.md)。

## 二级来源档案

每个二级来源必须有一份档案，并在用户选中该来源时先于资料列表显示：

- `kind`：`platform` 或 `collection`；
- `website`：平台型来源必须提供 HTTPS 官网；集合型来源必须为 `null`，页面明确显示“无统一网址”；
- `positioning`：该平台或集合在资料体系中的定位；
- `background`：形成时间、发展脉络与重要边界；
- `organization`：相关公司、机构或运营主体；
- `foundingTeam`：创始人、发起团队，或为何不存在单一创始团队；
- `reviewedAt`：档案事实的最近复核日期。

页面不能只显示一句定位。它必须把定位、发展背景、运营组织和发起团队组织成连续介绍，并继续展示：

- 不少于 90 个中文字符的正式介绍；
- 至少 3 项平台优势与特征；
- 这个网站或来源主要提供什么；
- 在资料库中应当如何使用；
- 不能由该来源单独支持什么。

九类来源的通用介绍指南位于 `window.LIBRARY_PROFILE_GUIDANCE`。具体平台可以用 `overview`、`strengths`、`offers`、`howToUse` 和 `caution` 覆盖通用指南，例如 IEEE Standards 使用强调标准全生命周期、共识机制、工程覆盖和实施生态的专用说明。

平台档案用于帮助用户判断来源，不改变资料的权威等级，也不替代逐条证据审核。

## 来源治理字段

每个二级来源除档案外，还必须在 `data/library-source-meta.js` 登记治理元数据。判定依据见 [FRONTIER_SOURCE_POLICY.md](FRONTIER_SOURCE_POLICY.md)：

- `tier`：`S` / `A` / `B` / `archive`。**v1 遗留的编辑分层，不是当前来源准入依据**；v2 已取消以 S/A/B 作为准入门槛，改用「一手 / 首创 / 应答 / 归属」四道闸门。字段于 2026-09-25 冻结保留，待四道闸门覆盖全部二级来源后迁移并删除，见 [FRONTIER_SOURCE_POLICY.md](FRONTIER_SOURCE_POLICY.md) 第 6 节；
- `provenance`：`primary` / `secondary`；
- `originScope`：六大区之一或 `cross`，该来源服务哪个板块；
- `purposes`：`concept` / `fact` / `news` / `discovery`；
- `cadence`：`daily` / `weekly` / `monthly` / `quarterly` / `yearly` / `static`；
- `health`：`active` / `maintenance` / `degraded` / `retired`；
- `sourceUse`：`evidence` / `explainer` / `market-forecast` / `discovery`；
- `lastVerifiedAt`：来源状态的最近复核日期。

校验器强制以下规则：声明 `news` 用途的来源不得 `cadence: static`；`explainer` 与 `market-forecast` 必须为 `secondary`；超过 180 天未复核会被列为待办。`tier` 只做值域校验，不再驱动 `provenance` 与 `health`——v2 明确 health、回访频率与链接存活只是维护状态，不是可信度排名。页面在既有档案卡片中直接展示级别、归属区、角色与健康度，级别一项标注为 v1 遗留。

## 链接与状态维护

`tools/validators/library.js` 只能校验网址格式，无法发现停运、跳转和内容漂移。链接存活由独立脚本负责：

```powershell
node tools/validators/library-links.js --concurrency 10 --timeout 20000
```

它把结果分成五档：可用、域名已迁移、站点拒绝自动化访问（400/403/406/412/429 与重定向环路）、网络层无法判定、需要处理（404/410/5xx/域名无法解析）。只有最后一档会导致退出码非零。

新增来源后可定向复核，避免整站重跑：

```powershell
node tools/validators/library-links.js --only official/deepseek --concurrency 6 --timeout 20000
```

`--only <子串>` 匹配网址或来源标识（如 `standards/china-`、`knowledge-base/`），并会连同「可用」结果一起打印，便于逐条确认。

2026-09-24 重建“官方技术资料”时已把 Anthropic 文档迁至 `platform.claude.com`，并删除已迁移、已弃用、仅属产品总览或无知识增量的旧入口。
