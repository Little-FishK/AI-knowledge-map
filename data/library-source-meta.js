/* 专业资料库来源治理元数据（v0.7 改造）。
   本文件做三件事：
   1. 为新入册的二级来源补齐平台档案；
   2. 修正已过时的档案事实；
   3. 为全部二级来源写入治理字段：tier（级别）、provenance（一手/二手）、originScope（归属区）、
      purposes（用途）、cadence（复核节奏）、health（健康度）、sourceUse（在本站的角色）、lastVerifiedAt（状态复核日期）。
   判定依据见 docs/FRONTIER_SOURCE_POLICY.md。 */
(function () {
  "use strict";

  const profiles = window.LIBRARY_PLATFORM_PROFILES;
  const platform = (website, positioning, background, organization, foundingTeam) => ({
    kind: "platform", website, positioning, background, organization, foundingTeam, reviewedAt: "2026-09-22"
  });
  const collection = (positioning, background, organization, foundingTeam = "集合型来源，没有单一创始团队。") => ({
    kind: "collection", website: null, positioning, background, organization, foundingTeam, reviewedAt: "2026-09-22"
  });

  /* ---------- 1. 新增二级来源档案 ---------- */
  Object.assign(profiles, {
    "standards/uk-aisi": platform("https://www.aisi.gov.uk/", "英国政府设立的前沿 AI 安全研究与评测机构。", "2023 年 Bletchley Park AI 安全峰会后设立，承担前沿模型评测、技术研究与国际合作，并作为《国际 AI 安全报告》秘书处，同时开源 Inspect 评测框架。", "UK AI Security Institute，隶属英国科学、创新与技术部（DSIT）。", "由英国政府设立，属公共研究机构，没有商业创始团队。"),
    "standards/intl-ai-safety-report": platform("https://internationalaisafetyreport.org/", "由多国专家共同撰写、面向政策制定者的 AI 能力与风险科学证据综述。", "依 2023 年 Bletchley 峰会 30 国授权、由英国政府委托建立；首版于 2025 年 1 月发布，2026 年 2 月 3 日发布第二版，其间另发中间版 Key Update。报告只综述证据，不提政策建议。", "报告办公室由 UK AI Security Institute 提供秘书处支持；专家顾问团来自 30 多个国家以及欧盟、OECD 与联合国。", "由 Yoshua Bengio 主持，撰稿团队超过 100 位独立专家。"),
    "standards/us-ftc": platform("https://www.ftc.gov/industry/technology/artificial-intelligence", "美国联邦贸易委员会关于 AI 的正式规则、业务指南与执法文件。", "FTC 依《联邦贸易委员会法》第 5 条等职权处理 AI 相关的欺骗性宣称与不公平行为，公开执法案例、政策声明与业务指南。", "United States Federal Trade Commission，美国政府独立监管机构。", "1914 年设立的美国联邦机构，没有商业创始团队。"),
    "standards/us-caisi": platform("https://www.nist.gov/caisi", "美国从事 AI 标准、测试与评测的政府机构。", "在原 NIST AI 相关工作基础上组建，为前沿模型提供独立第三方评测与测量方法，并向基准机构采购评测能力、参与国际评测合作。", "Center for AI Standards and Innovation（CAISI），隶属美国商务部 NIST。", "由美国联邦政府设立，属公共机构。"),
    "standards/china-cac": platform("https://www.cac.gov.cn/", "中国互联网与生成式 AI 管理的正式文件发布机构。", "依《生成式人工智能服务管理暂行办法》等规则承担生成式 AI 服务的备案、监管与执法信息公开，发布部门规章、通知与处罚信息。", "中华人民共和国国家互联网信息办公室（国家网信办）。", "中国国家行政机关，没有商业创始团队。"),
    "standards/china-tc260": platform("https://www.tc260.org.cn/", "中国网络安全与 AI 安全国家标准的立项与制修订平台。", "全国网络安全标准化技术委员会负责网络安全、数据安全与 AI 安全相关国家标准的立项、征求意见与发布，下设人工智能安全治理等专项工作组。", "全国网络安全标准化技术委员会（TC260），秘书处设于中国电子技术标准化研究院。", "由国家标准管理机构设立的标准化技术组织。"),
    "standards/china-caict": platform("https://www.caict.ac.cn/", "中国信息通信研究院的 AI 评测、标准与产业研究原始报告。", "作为国家级研究机构，发布模型评测、可信 AI 评估、标准研究与产业数据报告，并承担多项评测标准与测试体系建设。注：该站对自动化访问返回 412，链接存活需人工核对。", "中国信息通信研究院（CAICT）。", "中国国家级研究机构，没有商业创始团队。"),

    "official/deepseek": platform("https://api-docs.deepseek.com/", "DeepSeek 模型的技术报告、模型卡、API 文档与变更日志的一手来源。", "深度求索以开源权重与公开技术报告为主要发布方式，API 变更日志逐次记录模型版本、能力指标与价格调整，是核对模型事实最直接的入口。", "杭州深度求索人工智能基础技术研究有限公司（DeepSeek）。", "由梁文锋创立，团队源自幻方量化体系；具体版本细节以其技术报告为准。"),
    "official/qwen": platform("https://qwen.readthedocs.io/", "Qwen 模型系列的官方文档、模型卡与开源仓库入口。", "阿里 Qwen 团队以开源权重、官方文档与模型卡发布版本细节，覆盖语言、视觉、音频模型及推理部署工具链。", "Alibaba Group 通义千问（Qwen）团队。", "由阿里巴巴 Qwen 团队研发并发布，官方文档托管于 Read the Docs。"),
    "official/moonshot-ai": platform("https://github.com/MoonshotAI/Kimi-K3", "Moonshot AI 的模型技术报告、权重发布与训练 Infra 开源记录。", "月之暗面以「权重 + 技术报告 + 训练 Infra」同步开源的方式发布 Kimi 系列；Kimi K3 于 2026 年 7 月开源 2.8 万亿参数权重、技术报告，以及 MoonEP、FlashKDA、AgentEnv 三项训练基础设施。", "Moonshot AI（月之暗面）。", "由杨植麟等创立；公开资料以其技术报告与模型仓库为准。"),
    "official/zhipu-ai": platform("https://docs.bigmodel.cn/", "Zhipu AI（GLM）开放平台的官方文档、模型卡与接口说明。", "智谱 AI 通过 BigModel 开放平台发布 GLM 系列模型文档、接口、定价与版本更新，并以技术报告与开放权重披露模型细节。", "北京智谱华章科技有限公司（Zhipu AI）。", "源自清华大学知识工程实验室团队，由唐杰等发起。"),

    "knowledge-base/owasp-genai": platform("https://genai.owasp.org/", "生成式 AI 与智能体应用安全风险的开放知识库与清单标准。", "项目由 OWASP 社区自 2023 年发展而来；2026 年 8 月发布 OWASP GenAI LLM Top 10 2026，首次把数千条真实事故数据计入排名，并同期扩出 Top 10 for Agentic Applications 与 Agent Control Standard。", "OWASP GenAI Security Project（OWASP 基金会下的开放社区项目）。", "由 Steve Wilson 等安全从业者发起，现由社区委员会与数百位贡献者维护。"),
    "knowledge-base/aiid": platform("https://incidentdatabase.ai/", "为 AI 现实损害事件编号、建档并做统计分析的公开数据库。", "参照航空业事故学习机制建立，持续收录媒体与研究报告中的 AI 事件并归类；2026 年事件编号已到 #1700 段位，并按季度发布分批汇总与统计。", "Responsible AI Collaborative（非营利组织）。", "由研究者社区发起，现由非营利团队与志愿者编辑共同维护。"),
    "knowledge-base/mit-ai-risk-repository": platform("https://airisk.mit.edu/", "对 AI 风险与事故分类体系做系统汇编与映射的研究数据库。", "把现有风险分类法、公开事故数据库与 EU AI Act 风险等级做交叉映射，并统计事故发生在系统生命周期的哪个阶段、由谁造成，为「风险从哪来」提供可计算口径。", "MIT FutureTech 研究团队。", "由 MIT 研究团队主持，并与事故数据库、国际机构协作。"),
    "knowledge-base/metr": platform("https://metr.org/", "独立机构对前沿 AI 模型做预部署评测，并公开任务时长度量。", "以前沿模型危险能力评测与「agent 能可靠完成多长任务」的研究著称；2026 年对 GPT-5.6 Sol 的预部署评测公开了作弊率对结论的影响，以及同一数据集下差别极大的不确定性区间。", "METR（Model Evaluation and Threat Research），独立非营利研究机构。", "由 Beth Barnes 等研究者创立，团队来自 AI 安全研究社区。"),
    "knowledge-base/arc-prize": platform("https://arcprize.org/", "ARC-AGI 系列抽象推理与交互式智能体基准的非营利测试与奖金项目。", "由 ARC-AGI 系列基准发展而来；ARC-AGI-3 于 2026 年 3 月 25 日发布，人类可 100% 完成而当时全部前沿模型得分低于 1%。ARC Prize 同时向 NIST CAISI 提供基准，并与 Kaggle 合作举办竞赛。", "ARC Prize Foundation（非营利基金会）。", "由 Mike Knoop（Zapier、Ndea）与 François Chollet（Keras、Ndea、ARC-AGI）共同发起。"),
    "knowledge-base/opencompass": platform("https://rank.opencompass.org.cn/", "开源的大模型与多模态模型评测体系与月度更新榜单。", "由上海人工智能实验室建设，从大模型评测扩展到科学智能、AI 计算系统、具身智能与安全可信等方向；榜单与复现配置开源，按月度持续更新。", "上海人工智能实验室（上海 AI Lab）。", "由上海人工智能实验室研究团队建设，属公共科研机构项目。"),
    "knowledge-base/superclue": platform("https://www.superclueai.com/", "中文大模型的综合性测评基准与月度榜单。", "延续 2019 年发起的 CLUE 中文语言理解基准，转向通用大模型综合评测；按数学推理、科学推理、代码与智能体编程、精确指令遵循、幻觉控制与任务规划等维度每月出新题并发布榜单。", "SuperCLUE 中文大模型测评基准团队。", "由 CLUE 基准团队发展而来，公开页面未稳定披露公司化主体。"),
    "knowledge-base/flageval": platform("https://flageval.baai.ac.cn/", "语言与多模态大模型的公开评测体系与榜单。", "由北京智源人工智能研究院建设，覆盖基础能力、安全与多模态测评，并提供评测工具与开放数据集。", "北京智源人工智能研究院（BAAI）。", "由智源研究院研究团队建设，属非营利科研机构项目。"),
    "knowledge-base/swe-bench": platform("https://www.swebench.com/", "以真实代码仓库缺陷修复为核心任务的官方评测榜单。", "用真实 issue 与隐藏测试衡量「能否在他人项目中定位并修对」，是代码智能体最常被引用的仓库级基准；官方榜与提交规范公开。", "SWE-bench 官方团队。", "由普林斯顿大学研究者发起，现由官方团队与开源社区共同维护。"),
    "knowledge-base/bfcl": platform("https://gorilla.cs.berkeley.edu/leaderboard", "面向工具调用与函数调用能力的公开专榜。", "由 Berkeley Gorilla 项目维护，评测模型在给定函数集合下的调用正确性、参数合法性与并行及多轮调用能力。", "UC Berkeley Gorilla 项目团队。", "由 UC Berkeley 研究团队发起并维护。"),

    "industry-analysis/cset": platform("https://cset.georgetown.edu/", "新兴技术安全与政策研究中自产原始数据集的机构。", "以 AI 人才、算力、事故与出口管制等议题的原始数据集和实证研究著称，定期发布可下载数据与政策分析。", "Center for Security and Emerging Technology（CSET），乔治城大学。", "设立于乔治城大学，由 Jason Matheny 等发起。")
  });

  /* ---------- 2. 修正已过时的档案事实与已迁移域名（由链接存活校验发现） ---------- */
  Object.assign(profiles["knowledge-base/lmsys-arena"], {
    website: "https://arena.ai/",
    positioning: "通过匿名模型对战与真实用户投票开展开放式大模型评测。",
    background: "Chatbot Arena 于 2023 年由 LMSYS / UC Berkeley SkyLab 团队推出，2024 年迁移到独立站点，2025 年从学术项目独立为公司并完成融资，评测范围从文本扩展到视觉与智能体对战。",
    organization: "Arena（2025 年起独立运营的商业实体）；与原 LMSYS 研究团队保持学术合作。"
  });
  Object.assign(profiles["hackathon/mlh"], { website: "https://www.mlh.com/" });
  Object.assign(profiles["hackathon/zindi"], { website: "https://zindi.world/" });

  /* ---------- 3. 治理元数据 ---------- */
  window.LIBRARY_SOURCE_META = {
    "academic/arxiv": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept", "fact"], cadence: "daily", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "academic/openreview": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept", "fact"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-24" },
    "academic/acl-anthology": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-24" },
    "academic/neurips-proceedings": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept", "fact"], cadence: "yearly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-24" },
    "academic/pmlr": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept"], cadence: "yearly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-24" },
    "academic/cvf-open-access": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept"], cadence: "yearly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-24" },
    "academic/ieee-xplore": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "academic/acm-dl": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "academic/springer-nature": { tier: "S", provenance: "primary", originScope: "foundations", purposes: ["concept"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },

    "standards/nist": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept", "fact"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "standards/iso-iec": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "standards/ieee-standards": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "standards/eu-institutions": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "standards/uk-aisi": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "standards/intl-ai-safety-report": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["fact"], cadence: "yearly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "standards/us-ftc": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "standards/us-caisi": { tier: "A", provenance: "primary", originScope: "safety", purposes: ["fact"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "standards/china-cac": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "standards/china-tc260": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept", "fact"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "standards/china-caict": { tier: "A", provenance: "primary", originScope: "safety", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "standards/oecd": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept", "fact"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "standards/un-agencies": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },

    "official/openai": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "official/anthropic": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "official/google-deepmind": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "official/microsoft": { tier: "A", provenance: "primary", originScope: "building", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "official/meta-ai": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "official/nvidia": { tier: "A", provenance: "primary", originScope: "foundations", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "official/hugging-face-official": { tier: "A", provenance: "primary", originScope: "building", purposes: ["fact"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "official/aws": { tier: "A", provenance: "primary", originScope: "building", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "official/deepseek": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "official/qwen": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "official/moonshot-ai": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "official/zhipu-ai": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "official/vendor-docs-other": { tier: "B", provenance: "primary", originScope: "cross", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },

    "knowledge-base/mitre-atlas": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/owasp-genai": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/aiid": { tier: "S", provenance: "primary", originScope: "safety", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/mit-ai-risk-repository": { tier: "A", provenance: "secondary", originScope: "safety", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/mlcommons": { tier: "A", provenance: "primary", originScope: "frontier", purposes: ["fact"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/metr": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/arc-prize": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/stanford-crfm": { tier: "A", provenance: "primary", originScope: "frontier", purposes: ["concept", "fact"], cadence: "static", health: "maintenance", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/lmsys-arena": { tier: "A", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/artificial-analysis": { tier: "A", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/opencompass": { tier: "A", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/superclue": { tier: "A", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/flageval": { tier: "A", provenance: "primary", originScope: "frontier", purposes: ["fact", "news"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/swe-bench": { tier: "A", provenance: "primary", originScope: "coding", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/bfcl": { tier: "A", provenance: "primary", originScope: "coding", purposes: ["fact"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "knowledge-base/nvd-cve": { tier: "B", provenance: "primary", originScope: "safety", purposes: ["fact"], cadence: "daily", health: "degraded", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },

    "industry-analysis/stanford-ai-index": { tier: "A", provenance: "primary", originScope: "cross", purposes: ["fact"], cadence: "yearly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "industry-analysis/epoch-ai": { tier: "S", provenance: "primary", originScope: "frontier", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "industry-analysis/gartner": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "market-forecast", lastVerifiedAt: "2026-09-22" },
    "industry-analysis/mckinsey": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["fact"], cadence: "yearly", health: "active", sourceUse: "market-forecast", lastVerifiedAt: "2026-09-22" },
    "industry-analysis/deloitte": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["fact"], cadence: "yearly", health: "active", sourceUse: "market-forecast", lastVerifiedAt: "2026-09-22" },
    "industry-analysis/rand": { tier: "A", provenance: "primary", originScope: "safety", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "industry-analysis/semianalysis": { tier: "A", provenance: "primary", originScope: "foundations", purposes: ["fact"], cadence: "weekly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "industry-analysis/cset": { tier: "A", provenance: "primary", originScope: "safety", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-09-22" },
    "industry-analysis/specialist-research-other": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["fact"], cadence: "quarterly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },

    "public-talks/university-courses": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["concept"], cadence: "static", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "public-talks/conference-channels": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["concept"], cadence: "yearly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "public-talks/research-seminars": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["concept"], cadence: "monthly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "public-talks/standards-webinars": { tier: "B", provenance: "secondary", originScope: "safety", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "public-talks/technical-conferences": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["concept", "news"], cadence: "yearly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "public-talks/professional-podcasts": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["concept"], cadence: "weekly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "public-talks/education-platforms": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["concept"], cadence: "static", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },

    "hackathon/kaggle": { tier: "A", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "weekly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },
    "hackathon/devpost": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "weekly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },
    "hackathon/lablab": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "monthly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },
    "hackathon/mlh": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "monthly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },
    "hackathon/hugging-face-events": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "monthly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },
    "hackathon/tianchi": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "monthly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },
    "hackathon/datafountain": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "monthly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },
    "hackathon/zindi": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["discovery"], cadence: "monthly", health: "active", sourceUse: "discovery", lastVerifiedAt: "2026-07-25" },

    "creator/andrej-karpathy": { tier: "B", provenance: "secondary", originScope: "foundations", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "creator/jeremy-howard": { tier: "B", provenance: "secondary", originScope: "foundations", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "creator/lilian-weng": { tier: "B", provenance: "secondary", originScope: "foundations", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "creator/chip-huyen": { tier: "B", provenance: "secondary", originScope: "building", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "creator/sebastian-raschka": { tier: "B", provenance: "secondary", originScope: "foundations", purposes: ["concept"], cadence: "monthly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "creator/simon-willison": { tier: "B", provenance: "secondary", originScope: "building", purposes: ["concept", "news"], cadence: "weekly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "creator/threeblueonebrown": { tier: "B", provenance: "secondary", originScope: "foundations", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },
    "creator/creator-other": { tier: "B", provenance: "secondary", originScope: "cross", purposes: ["concept"], cadence: "quarterly", health: "active", sourceUse: "explainer", lastVerifiedAt: "2026-07-25" },

    "open-source/github-canonical": { tier: "A", provenance: "primary", originScope: "coding", purposes: ["concept", "fact"], cadence: "daily", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "open-source/gitlab-canonical": { tier: "B", provenance: "primary", originScope: "coding", purposes: ["concept", "fact"], cadence: "daily", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "open-source/hugging-face-community": { tier: "A", provenance: "primary", originScope: "building", purposes: ["concept", "fact"], cadence: "daily", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "open-source/apache-foundation": { tier: "A", provenance: "primary", originScope: "building", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "open-source/linux-foundation": { tier: "A", provenance: "primary", originScope: "building", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "open-source/cncf": { tier: "B", provenance: "primary", originScope: "building", purposes: ["concept", "fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "open-source/package-registries": { tier: "B", provenance: "primary", originScope: "building", purposes: ["fact"], cadence: "daily", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" },
    "open-source/self-hosted-repositories": { tier: "B", provenance: "primary", originScope: "building", purposes: ["fact"], cadence: "monthly", health: "active", sourceUse: "evidence", lastVerifiedAt: "2026-07-25" }
  };

  /* ---------- 4. 把治理字段合并进档案，供前端直接读取 ---------- */
  const meta = window.LIBRARY_SOURCE_META;
  Object.keys(meta).forEach(key => {
    if (profiles[key]) Object.assign(profiles[key], meta[key]);
  });
})();
