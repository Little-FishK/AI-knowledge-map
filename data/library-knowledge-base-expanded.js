/* 专业知识库与评测机构：按二级来源产品树补齐核心资料。
   数量是逐来源完整性审核的结果，不是预设配额；仅收独立方法、数据库、正式基准、
   权威结果入口和发生实质变化的重要版本。 */
(function () {
  "use strict";

  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) return;

  const defaults = {
    sourceClass: "knowledge-base",
    authorityTier: "A2",
    reviewStatus: "living",
    primarySource: true,
    discoveryOnly: false,
    accessedAt: "2026-09-24",
    selectionReason: "该资料在所属二级来源中具有独立的方法、数据范围、正式版本或权威结果价值。",
    linkedSoftware: []
  };
  const make = (group, row) => Object.assign({}, defaults, {
    id: row[0],
    sourceSubcategory: group.source,
    title: row[1],
    publisher: group.publisher,
    collection: group.collection,
    contentKind: row[2],
    url: row[3],
    summary: row[4],
    evidenceUse: row[5],
    limitations: group.limitations,
    tags: row[6],
    linkedNodes: row[7]
  });

  const groups = [
    {
      source: "mitre-atlas", publisher: "MITRE", collection: "MITRE ATLAS",
      limitations: ["持续更新，引用需标访问日期", "案例和缓解措施需结合具体系统验证"],
      rows: [
        ["mitre-atlas-data", "MITRE ATLAS Data", "版本化威胁知识数据集", "https://github.com/mitre-atlas/atlas-data", "以版本化 YAML、STIX 和表格数据发布 ATLAS 战术、技术、缓解措施、关系与案例。", "支持机器可读分析、版本复核和对 ATLAS 知识结构的完整引用。", ["AI安全", "威胁数据集"], ["red-teaming", "guardrails"]],
        ["mitre-safe-ai-framework", "MITRE SAFE-AI Framework", "AI 安全工程框架", "https://atlas.mitre.org/pdf-files/SAFEAI_Full_Report.pdf", "把 ATLAS 威胁知识转化为面向 AI 系统生命周期的安全工程活动。", "支持将对抗威胁纳入设计、测试、部署和运营流程。", ["AI安全", "安全工程"], ["red-teaming", "governance"]]
      ]
    },
    {
      source: "owasp-genai", publisher: "OWASP GenAI Security Project", collection: "OWASP GenAI",
      limitations: ["社区开放指南而非强制法规", "采用时需绑定版本并结合具体架构"],
      rows: [
        ["owasp-genai-red-teaming-guide", "OWASP GenAI Red Teaming Guide", "生成式 AI 红队指南", "https://genai.owasp.org/resource/genai-red-teaming-guide/", "给出生成式 AI 系统的红队范围、测试阶段、攻击技术和报告实践。", "支持设计可复用的生成式 AI 对抗测试流程。", ["红队", "生成式AI安全"], ["red-teaming"]],
        ["owasp-multi-agent-threat-modeling", "OWASP Multi-Agentic System Threat Modeling Guide v1.0", "多智能体威胁建模指南", "https://genai.owasp.org/resource/multi-agentic-system-threat-modeling-guide-v1-0/", "面向多智能体系统梳理信任边界、通信、权限和级联失效风险。", "支持多智能体架构的系统化威胁建模。", ["多智能体", "威胁建模"], ["agent", "red-teaming"]],
        ["owasp-genai-incident-response", "OWASP GenAI Incident Response Guide 1.0", "生成式 AI 事件响应指南", "https://genai.owasp.org/resource/genai-incident-response-guide-1-0/", "覆盖生成式 AI 事件的准备、检测、遏制、恢复与复盘。", "支持建立 AI 专属事件响应流程和证据保全要求。", ["事件响应", "生成式AI安全"], ["governance", "guardrails"]],
        ["owasp-genai-framework-crosswalk", "OWASP GenAI Security Industry Framework Crosswalk", "安全框架交叉映射", "https://genai.owasp.org/resource/genai-security-industry-framework-crosswalk/", "把 OWASP GenAI 风险与主要安全和治理框架的控制要求进行映射。", "支持跨框架控制复用与差距分析。", ["框架映射", "AI治理"], ["governance"]],
        ["owasp-ai-security-solutions", "OWASP AI Security Solutions Landscape", "AI 安全解决方案分类", "https://genai.owasp.org/initiatives/ai-security-solutions/", "按防护能力和应用阶段整理 AI 安全产品与开源方案。", "支持识别 AI 安全控制类别和工具覆盖范围。", ["安全工具", "解决方案分类"], ["guardrails"]]
      ]
    },
    {
      source: "aiid", publisher: "Responsible AI Collaborative", collection: "AI Incident Database",
      limitations: ["依赖公开报道并存在语言与地区偏差", "分类与收录不构成责任或因果认定"],
      rows: [
        ["aiid-taxonomies", "AIID Taxonomies", "AI 事故分类体系目录", "https://incidentdatabase.ai/taxonomies/", "集中提供 AIID 采用的事故分类法及其版本说明。", "支持选择合适的事故分类框架并核对字段定义。", ["AI事故", "分类法"], ["governance"]],
        ["aiid-classifications", "AIID Classifications and Research Tools", "事故分类与研究工具", "https://incidentdatabase.ai/apps/classifications/", "提供事故分类浏览、研究数据和下载入口。", "支持对事故库进行结构化检索、分析和复核。", ["AI事故", "研究数据"], ["governance"]],
        ["aiid-csetv1-taxonomy", "CSETv1 AI Harm Taxonomy", "AI 伤害分类法", "https://incidentdatabase.ai/taxonomies/csetv1/", "从伤害、受影响主体、系统角色与部署情境等维度编码 AI 事故。", "支持对现实 AI 伤害进行多维分类和比较。", ["AI伤害", "分类法"], ["governance"]]
      ]
    },
    {
      source: "mit-ai-risk-repository", publisher: "MIT AI Risk Initiative", collection: "MIT AI Risk Initiative",
      limitations: ["数据库持续更新，统计需标访问日期", "聚合分类不能代替具体系统风险评估"],
      rows: [
        ["mit-ai-incident-tracker", "MIT AI Incident Tracker", "AI 事故追踪与分析库", "https://airisk.mit.edu/ai-incident-tracker", "对公开 AI 事故报告进行结构化归类，并分析风险领域与事件模式。", "支持从现实事故观察 AI 风险类型与变化。", ["AI事故", "风险分析"], ["governance"]],
        ["mit-ai-governance-map", "MIT AI Governance Map", "AI 治理文件数据库", "https://airisk.mit.edu/ai-governance", "汇集并分类全球 AI 治理政策、原则、标准和框架文件。", "支持检索治理工具、主体、地域和主题覆盖。", ["AI治理", "政策数据库"], ["governance"]],
        ["mit-ai-incident-tracker-2026-update", "AI Incident Tracker：2026 年 6 月更新", "事故数据库重要版本说明", "https://airisk.mit.edu/blog/ai-incident-tracker-june-2026-update", "说明事故追踪器的数据规模、分类方式和本轮实质更新。", "支持解释当前事故库的覆盖范围和版本边界。", ["AI事故", "版本说明"], ["governance"]],
        ["mit-ai-governance-map-2026-update", "Mapping the AI Governance Landscape：2026 年 4 月更新", "治理数据库重要版本说明", "https://airisk.mit.edu/blog/mapping-the-ai-governance-landscape-april-2026-update", "说明治理地图的资料范围、分类维度与阶段性发现。", "支持解释治理数据库方法和当前覆盖。", ["AI治理", "版本说明"], ["governance"]]
      ]
    },
    {
      source: "mlcommons", publisher: "MLCommons", collection: "MLCommons Benchmarks",
      limitations: ["必须绑定套件、版本、分区和提交配置", "不同工作负载和正式度的结果不可直接混比"],
      rows: [
        ["ailuminate-safety-methodology", "AILuminate Safety Methodology", "生成式 AI 安全评测方法", "https://mlcommons.org/ailuminate/safety-methodology/", "规定危险类别、提示构造、响应分级、聚合和安全评级方法。", "支持精确解释 AILuminate 安全分数与适用边界。", ["AI安全评测", "方法"], ["model-evaluation", "red-teaming"]],
        ["ailuminate-official-results", "AILuminate General Purpose AI Chat Official Results", "生成式 AI 安全正式结果", "https://ailuminate.mlcommons.org/benchmarks/general_purpose_ai_chat/1.0-en_us-official-ensemble", "发布通用聊天模型在正式私有测试集上的安全评级和危险类别结果。", "支持绑定语言和版本的模型安全结果比较。", ["AI安全评测", "正式结果"], ["model-evaluation"]],
        ["ailuminate-jailbreak-whitepaper", "AILuminate Security and Jailbreak v0.5 Whitepaper", "越狱韧性评测白皮书", "https://mlcommons.org/ailuminate/jailbreak-v0.5-whitepaper/", "介绍面向生成式 AI 的越狱攻击集合、评分与安全评测设计。", "支持分析越狱评测的覆盖与方法。", ["越狱", "AI安全评测"], ["red-teaming", "model-evaluation"]],
        ["mlperf-endpoints", "MLPerf Endpoints", "在线推理服务基准", "https://mlcommons.org/benchmarks/endpoints/", "在受控负载下衡量在线模型端点的吞吐、延迟和服务表现。", "支持托管推理服务在指定负载下的性能比较。", ["在线推理", "MLPerf"], ["inference-optimization", "model-evaluation"]],
        ["mlperf-client", "MLPerf Client", "端侧 AI 基准", "https://mlcommons.org/benchmarks/client/", "面向个人计算设备测试语言、图像和智能体工作负载的性能与体验。", "支持端侧 AI 系统的跨设备和跨工作负载比较。", ["端侧AI", "MLPerf"], ["inference-optimization"]],
        ["mlperf-automotive", "MLPerf Automotive", "车载 AI 基准", "https://mlcommons.org/benchmarks/mlperf-automotive/", "针对汽车感知和座舱等场景定义性能与功耗评测。", "支持车载 AI 硬件和软件栈的标准化比较。", ["车载AI", "MLPerf"], ["model-evaluation"]],
        ["algoperf", "AlgoPerf Training Algorithms Benchmark", "训练算法基准", "https://mlcommons.org/benchmarks/algorithms/", "在固定工作负载和资源预算下比较训练算法达到目标质量的效率。", "支持优化算法在统一条件下的训练效率比较。", ["训练算法", "基准"], ["distributed-training", "model-evaluation"]],
        ["mlperf-storage", "MLPerf Storage", "AI 存储系统基准", "https://mlcommons.org/benchmarks/storage/", "覆盖训练数据、检查点、向量数据库和 KV 缓存等 AI 存储工作负载。", "支持 AI 基础设施存储性能与扩展性比较。", ["AI存储", "MLPerf"], ["distributed-training", "inference-optimization"]],
        ["mlperf-mobile", "MLPerf Mobile", "移动端 AI 基准", "https://mlcommons.org/benchmarks/inference-mobile/", "比较智能手机等移动设备上的视觉、语言与生成式 AI 推理性能。", "支持移动设备端推理性能和能效比较。", ["移动端AI", "MLPerf"], ["inference-optimization"]],
        ["mlperf-tiny", "MLPerf Tiny", "微控制器 AI 基准", "https://mlcommons.org/benchmarks/inference-tiny/", "面向超低功耗微控制器定义微型机器学习推理任务与测量规则。", "支持 TinyML 设备的性能与能效比较。", ["TinyML", "MLPerf"], ["inference-optimization"]]
      ]
    },
    {
      source: "metr", publisher: "METR", collection: "METR Evaluations",
      limitations: ["结果依赖模型访问方式、脚手架和任务集", "研究结论不能外推为全部真实工作表现"],
      rows: [
        ["metr-general-capability-evaluations", "METR General Capability Evaluations", "前沿模型能力评测方法", "https://metr.org/blog/2024-08-06-update-on-evaluations/", "介绍 METR 对自主完成复杂任务、信息获取和工具使用能力的评测路线。", "支持理解 METR 通用能力评测的设计和边界。", ["前沿模型", "能力评测"], ["agent", "model-evaluation"]],
        ["metr-re-bench", "RE-Bench：AI 研发能力评测", "AI 研发智能体基准", "https://metr.org/blog/2024-11-22-evaluating-r-d-capabilities-of-llms/", "让模型智能体和人类专家在受控时间预算下完成真实机器学习研发任务。", "支持比较前沿智能体的 AI 研发能力与人类基线。", ["AI研发", "Agent评测"], ["agent", "model-evaluation"]],
        ["metr-malt-dataset", "MALT Evaluation Integrity Dataset", "评测完整性数据集", "https://metr.org/blog/2025-10-14-malt-dataset-of-natural-and-prompted-behaviors/", "提供奖励作弊、装弱等评测完整性行为的人工复核智能体轨迹。", "支持训练和检验评测监控器。", ["评测完整性", "数据集"], ["agent", "red-teaming"]],
        ["metr-developer-productivity-study", "AI Tools and Experienced Open-Source Developer Productivity", "随机对照生产力研究", "https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf", "以随机对照设计测量有经验开发者在真实开源任务中使用 AI 工具的生产力影响。", "支持关于特定人群和时期下开发生产力影响的因果陈述。", ["开发者生产力", "随机对照试验"], ["agent", "model-evaluation"]],
        ["metr-algorithmic-holistic-evaluation", "Algorithmic vs. Holistic Evaluation", "评测方法研究", "https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/", "比较自动可验证任务与人工整体评审对智能体能力的不同测量结果。", "支持分析评测方式对能力趋势结论的影响。", ["评测方法", "Agent评测"], ["agent", "model-evaluation"]]
      ]
    },
    {
      source: "arc-prize", publisher: "ARC Prize Foundation", collection: "ARC-AGI",
      limitations: ["成绩必须绑定测试集、成本和验证状态", "单一抽象推理基准不代表完整通用智能"],
      rows: [
        ["arc-agi-1", "ARC-AGI-1", "静态抽象推理基准", "https://arcprize.org/arc-agi/1", "以少量输入输出示例测试对新颖抽象转换规则的归纳。", "支持说明 ARC-AGI 最初任务定义和公开评测。", ["抽象推理", "基准"], ["reasoning-models", "model-evaluation"]],
        ["arc-agi-2", "ARC-AGI-2", "高难度抽象推理基准", "https://arcprize.org/arc-agi/2", "通过重新设计的任务提高对组合推理、符号解释与泛化的要求。", "支持解释 ARC-AGI-2 相对第一代的设计变化。", ["抽象推理", "基准"], ["reasoning-models", "model-evaluation"]],
        ["arc-prize-2024-report", "ARC Prize 2024 Technical Report", "年度技术报告", "https://arcprize.org/media/arc-prize-2024-technical-report.pdf", "总结首届竞赛、参赛方法、验证结果和对抽象推理研究的发现。", "支持引用 2024 竞赛的方法和正式结论。", ["抽象推理", "技术报告"], ["reasoning-models"]],
        ["arc-agi-2-technical-report", "ARC-AGI-2 Technical Report", "基准技术报告", "https://arcprize.org/blog/arc-agi-2-technical-report", "说明第二代任务设计、难度控制、数据构建和基线表现。", "支持精确解释 ARC-AGI-2 的构造与评分。", ["抽象推理", "技术报告"], ["reasoning-models", "model-evaluation"]],
        ["arc-agi-testing-policy", "ARC-AGI Testing Policy", "官方测试与反污染政策", "https://arcprize.org/policy", "规定私有测试、提交验证、数据访问和榜单资格要求。", "支持判断 ARC-AGI 成绩的正式度和可比性。", ["测试政策", "反污染"], ["model-evaluation"]]
      ]
    },
    {
      source: "stanford-crfm", publisher: "Stanford CRFM", collection: "HELM",
      limitations: ["各子榜使用不同场景、指标和版本", "latest 页面会滚动更新，引用需记录访问日期"],
      rows: [
        ["helm-capabilities", "HELM Capabilities", "通用能力榜", "https://crfm.stanford.edu/helm/capabilities/latest/", "以多个场景和指标评估语言模型的通用能力。", "支持统一配置下的模型能力横向比较。", ["HELM", "通用能力"], ["model-evaluation"]],
        ["helm-audio", "HELM Audio", "音频语言模型榜", "https://crfm.stanford.edu/helm/audio/latest/", "综合评估音频理解与音频语言模型。", "支持音频模型的场景化能力比较。", ["音频模型", "HELM"], ["model-evaluation"]],
        ["helm-lite", "HELM Lite", "轻量综合能力榜", "https://crfm.stanford.edu/helm/lite/latest/", "以较低成本覆盖广泛语言模型能力场景。", "支持可复现的轻量广覆盖评测。", ["HELM", "轻量评测"], ["model-evaluation"]],
        ["helm-classic", "HELM Classic", "经典综合评测榜", "https://crfm.stanford.edu/helm/classic/latest/", "延续原始 HELM 论文的多场景、多指标和扰动评测。", "支持研究能力、鲁棒性、公平性和效率等多维表现。", ["HELM", "综合评测"], ["model-evaluation"]],
        ["helm-heim", "HEIM：Holistic Evaluation of Text-to-Image Models", "文生图综合评测榜", "https://crfm.stanford.edu/helm/heim/latest/", "从对齐、质量、原创性和风险等维度评估文生图模型。", "支持文生图模型的多维可复现比较。", ["文生图", "HELM"], ["model-evaluation"]],
        ["helm-instruct", "HELM Instruct", "指令遵循评测榜", "https://crfm.stanford.edu/helm/instruct/latest/", "用绝对评分方法评估模型对自然语言指令的遵循。", "支持比较指令模型的任务完成与响应质量。", ["指令遵循", "HELM"], ["model-evaluation"]],
        ["helm-mmlu", "HELM MMLU", "标准化知识与推理榜", "https://crfm.stanford.edu/helm/mmlu/latest/", "在统一提示和运行配置下复现 MMLU 评测。", "支持消除提示差异后的 MMLU 比较。", ["MMLU", "HELM"], ["model-evaluation"]],
        ["helm-vhelm", "VHELM：Vision-Language Model Evaluation", "视觉语言模型综合榜", "https://crfm.stanford.edu/helm/vhelm/latest/", "跨视觉问答、识别、推理和风险场景评估视觉语言模型。", "支持多模态模型的统一横向比较。", ["视觉语言模型", "HELM"], ["model-evaluation"]],
        ["helm-image2struct", "HELM Image2Struct", "图像结构化信息抽取榜", "https://crfm.stanford.edu/helm/image2struct/latest/", "评估视觉语言模型从图表、文档和界面图像提取结构化信息的能力。", "支持文档与界面理解能力比较。", ["多模态", "信息抽取"], ["model-evaluation"]],
        ["medhelm-v2", "MedHELM v2.0.0", "医疗语言模型评测榜", "https://crfm.stanford.edu/helm/medhelm/v2.0.0/", "以临床相关任务和多维指标评估医疗领域语言模型。", "支持医疗场景模型能力的版本化比较。", ["医疗AI", "HELM"], ["model-evaluation"]]
      ]
    },
    {
      source: "lmsys-arena", publisher: "Arena", collection: "Arena",
      limitations: ["用户偏好受人群、提示和展示方式影响", "动态榜单和方法变更需标注日期"],
      rows: [
        ["arena-ranking-method", "Arena Ranking Method", "人类偏好排名方法", "https://arena.ai/blog/ranking-method", "说明成对投票、Bradley-Terry 排名、不确定区间和榜单分组。", "支持解释 Arena 分数、排名差异和统计显著性。", ["人类偏好", "排名方法"], ["model-evaluation"]],
        ["arena-rank", "Arena-Rank", "开放偏好评测方法", "https://arena.ai/blog/arena-rank", "用 Arena 对战数据构建可复现的开放模型排序方法。", "支持研究自动评测与真实用户偏好的一致性。", ["人类偏好", "开放评测"], ["model-evaluation"]],
        ["search-arena", "Search Arena", "搜索增强模型竞技场", "https://arena.ai/blog/search-arena", "通过匿名成对比较评估联网搜索与答案生成系统。", "支持比较搜索增强系统的端到端用户偏好。", ["搜索智能体", "人类偏好"], ["agent", "model-evaluation"]],
        ["code-arena", "Code Arena", "代码生成竞技场", "https://arena.ai/blog/code-arena", "以真实代码需求和用户投票比较代码模型与代理系统。", "支持面向用户任务的代码生成偏好比较。", ["代码生成", "模型竞技场"], ["agent", "model-evaluation"]],
        ["arena-style-control", "Style Control for Arena Leaderboards", "风格偏差控制方法", "https://arena.ai/blog/style-control", "分析并控制回答长度、格式等风格因素对用户投票的影响。", "支持区分内容质量和呈现风格对排名的贡献。", ["评测偏差", "人类偏好"], ["model-evaluation"]],
        ["arena-factuality", "Factuality in Arena", "事实性分析方法", "https://arena.ai/blog/factuality-in-arena", "研究 Arena 偏好排名与回答事实准确性的关系。", "支持判断偏好榜对事实性的反映边界。", ["事实性", "人类偏好"], ["model-evaluation"]],
        ["arena-image-method", "Image Arena Improvements", "图像生成竞技场方法", "https://arena.ai/blog/image-arena-improvements", "说明图像竞技场的数据质量、匹配和排名改进。", "支持解释图像生成模型的人类偏好榜。", ["图像生成", "模型竞技场"], ["model-evaluation"]]
      ]
    },
    {
      source: "artificial-analysis", publisher: "Artificial Analysis", collection: "Artificial Analysis Methodology",
      limitations: ["结果会随模型、端点、价格和方法版本变化", "综合指数与不同模态的 Elo 不可直接互换"],
      rows: [
        ["artificial-analysis-coding-agents", "Coding Agent Leaderboard", "代码智能体榜", "https://artificialanalysis.ai/agents/coding-agents", "比较代码智能体在真实软件工程基准上的解决率、成本和运行表现。", "支持绑定脚手架和评测版本的代码智能体比较。", ["代码智能体", "排行榜"], ["agent", "model-evaluation"]],
        ["artificial-analysis-coding-agent-method", "Coding Agent Benchmarking Methodology", "代码智能体评测方法", "https://artificialanalysis.ai/methodology/coding-agents-benchmarking", "披露代码智能体任务、运行环境、重复测量和成本统计规则。", "支持解释代码智能体榜的可比性和边界。", ["代码智能体", "评测方法"], ["agent", "model-evaluation"]],
        ["artificial-analysis-agentperf", "AgentPerf", "通用智能体性能基准", "https://artificialanalysis.ai/methodology/agentperf", "从任务质量、速度和成本衡量智能体系统的端到端表现。", "支持多维比较智能体部署效果。", ["Agent评测", "性能"], ["agent", "model-evaluation"]],
        ["artificial-analysis-search-index", "Artificial Analysis Search Index", "搜索 API 基准方法", "https://artificialanalysis.ai/methodology/search-api", "固定答案模型和智能体循环，仅替换搜索服务以测量搜索 API 带来的质量提升。", "支持搜索服务在受控智能体设置下的比较。", ["搜索API", "Agent评测"], ["agent", "model-evaluation"]],
        ["artificial-analysis-endpoint-accuracy", "Endpoint Accuracy Index", "推理端点准确性基准", "https://artificialanalysis.ai/methodology/endpoint-accuracy-index", "比较同一模型在不同托管端点上的输出准确性与实现偏差。", "支持识别端点优化对模型质量的影响。", ["推理端点", "准确性"], ["inference-optimization", "model-evaluation"]],
        ["artificial-analysis-capability-indices", "Artificial Analysis Capability Indexes", "专项能力指数方法", "https://artificialanalysis.ai/methodology/capability-indices", "定义编程、数学、科学等专项能力指数的构成与聚合。", "支持正确解释专项能力分数。", ["能力指数", "评测方法"], ["model-evaluation"]],
        ["artificial-analysis-speech-method", "Speech-to-Speech Benchmarking Methodology", "语音模型评测方法", "https://artificialanalysis.ai/methodology/speech-to-speech-benchmarking", "比较实时语音模型的质量、延迟、价格与交互能力。", "支持语音对话模型和端点的多维比较。", ["语音模型", "评测方法"], ["model-evaluation"]],
        ["artificial-analysis-image-method", "Image Generation Benchmarking Methodology", "图像生成评测方法", "https://artificialanalysis.ai/image/methodology", "说明图像模型质量 Elo、生成速度、价格和统一设置。", "支持图像生成模型与服务的可比评测。", ["图像生成", "评测方法"], ["model-evaluation"]],
        ["artificial-analysis-video-method", "Video Generation Benchmarking Methodology", "视频生成评测方法", "https://artificialanalysis.ai/video/methodology", "覆盖文生视频、图生视频、编辑和含音频生成的质量、速度与价格测量。", "支持视频模型跨模态和端点的规范比较。", ["视频生成", "评测方法"], ["model-evaluation"]]
      ]
    },
    {
      source: "opencompass", publisher: "OpenCompass", collection: "OpenCompass",
      limitations: ["配置、数据集和模型版本持续更新", "公开数据集结果需考虑污染与提示敏感性"],
      rows: [
        ["opencompass-framework-overview", "OpenCompass 评测框架总览", "开源评测框架方法", "https://doc.opencompass.org.cn/user_guides/framework_overview.html", "说明数据、模型、推理、评测和汇总模块的标准化流水线。", "支持理解 OpenCompass 结果如何生成和复现。", ["中文评测", "开源框架"], ["model-evaluation"]],
        ["opencompass-dataset-catalog", "OpenCompass 数据集目录", "评测数据集清单", "https://doc.opencompass.org.cn/dataset_statistics.html", "集中列出支持的数据集、任务类型、样本规模与配置。", "支持核对评测覆盖与数据范围。", ["评测数据集", "中文评测"], ["model-evaluation"]],
        ["opencompass-metrics", "OpenCompass 指标计算说明", "评测指标方法", "https://doc.opencompass.org.cn/user_guides/metrics.html", "解释客观题、生成题和自定义任务的评分与汇总方式。", "支持正确解释不同任务的分数口径。", ["评测指标", "复现"], ["model-evaluation"]],
        ["compassarena-multimodal", "CompassArena 多模态竞技场", "多模态模型竞技场", "https://arena.opencompass.org.cn/", "以用户成对偏好评估图文理解与生成模型。", "支持中文生态多模态模型的人类偏好比较。", ["多模态", "模型竞技场"], ["model-evaluation"]]
      ]
    },
    {
      source: "superclue", publisher: "SuperCLUE / CLUEbenchmark", collection: "SuperCLUE",
      limitations: ["榜单题集和权重会随版本调整", "跨版本分数不可直接比较"],
      rows: [
        ["superclue-agent-benchmark-2025h1", "SuperCLUE Agent Benchmark 2025H1", "智能体综合评测", "https://www.cluebenchmarks.com/superclue_25H1", "评估中文场景下智能体的规划、工具使用和任务完成能力。", "支持中文智能体的版本化综合比较。", ["中文评测", "Agent评测"], ["agent", "model-evaluation"]],
        ["agentclue-mobile", "AgentCLUE-Mobile", "移动端智能体基准", "https://www.cluebenchmarks.com/superclue_2025", "面向移动应用真实操作任务评估智能体感知、规划与执行。", "支持移动端 GUI 智能体能力比较。", ["移动智能体", "中文评测"], ["agent", "model-evaluation"]]
      ]
    },
    {
      source: "flageval", publisher: "北京智源人工智能研究院", collection: "FlagEval",
      limitations: ["部分评测需申请或登录", "榜单和数据集维护状态需按页面版本确认"],
      rows: [
        ["flageval-docs-hub", "FlagEval 天秤评测体系", "评测平台与方法总览", "https://flageval.baai.ac.cn/docs/", "介绍语言、多模态、科学与安全等评测能力和平台结构。", "支持确认 FlagEval 的产品范围与官方入口。", ["中文评测", "评测平台"], ["model-evaluation"]],
        ["flageval-operation-process", "FlagEval 评测操作流程", "评测运行规范", "https://flageval.baai.ac.cn/docs/rules/evaluation-operation-process.html", "说明评测申请、模型接入、任务执行与结果发布流程。", "支持判断 FlagEval 结果的生成和审核环节。", ["评测流程", "复现"], ["model-evaluation"]],
        ["flageval-arena-method", "FlagEval Arena 介绍", "模型竞技场方法", "https://flageval.baai.ac.cn/docs/rules/arena-introduction.html", "说明匿名对战、用户投票和竞技场排名机制。", "支持解释平台偏好评测结果。", ["模型竞技场", "人类偏好"], ["model-evaluation"]],
        ["flageval-multimodal", "FlagEval 多模态评测", "多模态任务与数据集目录", "https://flageval.baai.ac.cn/docs/multimodal/", "汇总视觉语言和多模态生成相关任务、数据集与指标。", "支持核对多模态评测覆盖范围。", ["多模态", "中文评测"], ["model-evaluation"]]
      ]
    },
    {
      source: "swe-bench", publisher: "SWE-bench Team", collection: "SWE-bench",
      limitations: ["模型、智能体脚手架和运行预算共同决定成绩", "不同数据集变体的结果不可直接混比"],
      rows: [
        ["swe-bench-multimodal", "SWE-bench Multimodal", "视觉软件工程基准", "https://www.swebench.com/multimodal", "要求智能体结合 issue 中的截图或界面信息修复真实代码仓库问题。", "支持评估多模态软件工程智能体。", ["代码智能体", "多模态"], ["agent", "model-evaluation"]],
        ["swe-bench-multilingual", "SWE-bench Multilingual", "多语言软件工程基准", "https://www.swebench.com/multilingual.html", "覆盖九种非 Python 语言的真实 GitHub 修复任务。", "支持评估代码智能体跨编程语言泛化。", ["代码智能体", "多语言"], ["agent", "model-evaluation"]],
        ["swe-bench-lite", "SWE-bench Lite", "轻量软件工程基准", "https://www.swebench.com/lite", "提供更易运行的筛选子集，用于快速比较真实仓库修复能力。", "支持低成本复现和开发阶段评测。", ["代码智能体", "轻量基准"], ["agent", "model-evaluation"]],
        ["swe-bench-evaluation-harness", "SWE-bench Evaluation Harness", "容器化评测工具", "https://www.swebench.com/SWE-bench/guides/quickstart/", "说明数据下载、预测格式、容器构建和测试执行。", "支持复现 SWE-bench 提交并核对运行条件。", ["复现", "评测工具"], ["agent", "model-evaluation"]]
      ]
    },
    {
      source: "bfcl", publisher: "UC Berkeley Gorilla Team", collection: "BFCL",
      limitations: ["各代任务构成和权重不同", "实时 API 与工具环境会造成时间敏感性"],
      rows: [
        ["bfcl-v2-live", "BFCL V2：Live and Irrelevance Detection", "函数调用基准重要版本", "https://gorilla.cs.berkeley.edu/blogs/12_bfcl_v2_live.html", "加入实时函数、无关函数识别和数据污染缓解设计。", "支持解释 BFCL 从静态函数调用到实时评测的扩展。", ["函数调用", "实时评测"], ["tool-use", "model-evaluation"]],
        ["bfcl-v3-multiturn", "BFCL V3：Multi-Turn and Multi-Step", "多轮工具调用基准", "https://gorilla.cs.berkeley.edu/blogs/13_bfcl_v3_multi_turn.html", "增加多轮、多步骤和状态依赖的工具调用任务。", "支持评估智能体在连续交互中的工具规划和执行。", ["工具调用", "多轮Agent"], ["agent", "tool-use"]],
        ["bfcl-v4-memory", "BFCL V4：Memory Evaluation", "智能体记忆评测", "https://gorilla.cs.berkeley.edu/blogs/16_bfcl_v4_memory.html", "评估跨轮次检索、更新和利用信息的智能体记忆能力。", "支持解释 BFCL V4 记忆任务和评分。", ["Agent记忆", "工具调用"], ["agent", "tool-use"]],
        ["bfcl-v4-format-sensitivity", "BFCL V4：Prompt and Format Sensitivity", "格式鲁棒性评测", "https://gorilla.cs.berkeley.edu/blogs/17_bfcl_v4_prompt_variation.html", "测量工具定义、提示和输出格式变化对函数调用表现的影响。", "支持判断工具调用能力对格式的鲁棒性。", ["格式鲁棒性", "工具调用"], ["tool-use", "model-evaluation"]]
      ]
    }
  ];

  library.items.push(...groups.flatMap(group => group.rows.map(row => make(group, row))));
})();
