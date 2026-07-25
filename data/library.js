/* 专业资料库 —— 一级分类严格按信息来源，而不是内容主题或文件形式。 */
window.PRO_LIBRARY = {
  meta: {
    version: "0.3",
    updatedAt: "2026-07-25",
    note: "九类一级来源已细分到平台、机构、集合或认证个人，并为每个二级来源建立档案；目录不代表整个平台进入白名单。"
  },
  sourceClasses: [
    {
      id: "academic", order: 1, label: "学术投稿", short: "论文、正式出版与预印本", color: "#7797c7", authority: "A2–R",
      subcategories: [
        { id: "arxiv", label: "arXiv", short: "AI、计算机与相关学科预印本" },
        { id: "openreview", label: "OpenReview", short: "开放投稿、评审与会议论坛" },
        { id: "acl-anthology", label: "ACL Anthology", short: "计算语言学论文与会议论文集" },
        { id: "neurips-proceedings", label: "NeurIPS Proceedings", short: "NeurIPS 正式论文集" },
        { id: "pmlr", label: "PMLR", short: "ICML、AISTATS 等机器学习会议论文集" },
        { id: "cvf-open-access", label: "CVF Open Access", short: "CVPR、ICCV、WACV 论文集" },
        { id: "ieee-xplore", label: "IEEE Xplore", short: "IEEE 期刊、会议与技术出版物" },
        { id: "acm-dl", label: "ACM Digital Library", short: "ACM 期刊与会议论文" },
        { id: "springer-nature", label: "Springer Nature", short: "Nature 系列与 Springer 学术出版物" }
      ]
    },
    {
      id: "standards", order: 2, label: "标准与监管", short: "标准、法规与监管框架", color: "#d19a66", authority: "A1",
      subcategories: [
        { id: "nist", label: "NIST", short: "美国国家标准与技术研究院" },
        { id: "iso-iec", label: "ISO / IEC", short: "国际标准化组织与国际电工委员会" },
        { id: "ieee-standards", label: "IEEE Standards", short: "IEEE 技术标准与工作组" },
        { id: "eu-institutions", label: "欧盟机构", short: "欧盟委员会、议会及监管机构" },
        { id: "us-regulators", label: "美国监管机构", short: "FTC、FDA、EEOC 等正式文件" },
        { id: "china-standards-regulators", label: "中国标准与监管机构", short: "网信办、国标委及相关技术委员会" },
        { id: "oecd", label: "OECD", short: "AI 原则、政策观察与政府间框架" },
        { id: "un-agencies", label: "联合国机构", short: "UNESCO、ITU 等规范与建议" }
      ]
    },
    {
      id: "official", order: 3, label: "官方技术资料", short: "官方文档、模型卡、公告与仓库", color: "#68a889", authority: "A1–A2",
      subcategories: [
        { id: "openai", label: "OpenAI", short: "文档、系统卡、研究与更新日志" },
        { id: "anthropic", label: "Anthropic", short: "文档、模型卡、研究与安全资料" },
        { id: "google-deepmind", label: "Google / DeepMind", short: "模型文档、研究与开发者资料" },
        { id: "microsoft", label: "Microsoft", short: "Azure AI、研究与产品技术资料" },
        { id: "meta-ai", label: "Meta AI", short: "模型卡、研究与官方项目资料" },
        { id: "nvidia", label: "NVIDIA", short: "开发者文档、模型与硬件技术资料" },
        { id: "hugging-face-official", label: "Hugging Face 官方", short: "官方文档、课程与平台公告" },
        { id: "aws", label: "AWS", short: "Bedrock、SageMaker 与云端 AI 文档" },
        { id: "vendor-docs-other", label: "其他厂商官方资料", short: "经单独登记的产品官方文档" }
      ]
    },
    {
      id: "knowledge-base", order: 4, label: "专业知识库与评测机构", short: "知识库、基准与公共评测", color: "#9b82c4", authority: "A2–B",
      subcategories: [
        { id: "mitre-atlas", label: "MITRE ATLAS", short: "AI 对抗威胁知识库" },
        { id: "mlcommons", label: "MLCommons", short: "训练、推理与安全公共基准" },
        { id: "stanford-crfm", label: "Stanford CRFM / HELM", short: "基础模型透明度与评测" },
        { id: "lmsys-arena", label: "LMSYS / Arena", short: "模型竞技场与开放评测" },
        { id: "papers-with-code", label: "Papers with Code", short: "论文、代码与基准成绩索引" },
        { id: "artificial-analysis", label: "Artificial Analysis", short: "模型性能、价格与速度评测" },
        { id: "nvd-cve", label: "NVD / CVE", short: "漏洞与安全事件数据库" },
        { id: "benchmark-other", label: "专项评测机构", short: "经登记的领域基准与测试组织" }
      ]
    },
    {
      id: "industry-analysis", order: 5, label: "专家与行业分析", short: "专业报告、趋势与跨对象分析", color: "#c58a72", authority: "B",
      subcategories: [
        { id: "stanford-ai-index", label: "Stanford AI Index", short: "年度 AI 数据与趋势报告" },
        { id: "epoch-ai", label: "Epoch AI", short: "算力、模型规模与趋势研究" },
        { id: "gartner", label: "Gartner", short: "企业技术市场研究" },
        { id: "mckinsey", label: "McKinsey", short: "企业采用与产业调查" },
        { id: "deloitte", label: "Deloitte", short: "行业应用与组织调研" },
        { id: "rand", label: "RAND", short: "政策、安全与战略研究" },
        { id: "semianalysis", label: "SemiAnalysis", short: "AI 基础设施与半导体分析" },
        { id: "specialist-research-other", label: "其他专项研究机构", short: "经范围认证的行业与专家研究" }
      ]
    },
    {
      id: "public-talks", order: 6, label: "公开视频与讲座", short: "公开课、会议演讲与技术分享", color: "#5e9fb5", authority: "B–R",
      subcategories: [
        { id: "university-courses", label: "大学公开课", short: "高校正式课程与研讨课" },
        { id: "conference-channels", label: "学术会议官方频道", short: "会议主办方发布的演讲与报告" },
        { id: "research-seminars", label: "研究机构研讨会", short: "研究实验室与机构公开报告" },
        { id: "standards-webinars", label: "标准组织网络研讨会", short: "标准、监管与治理机构讲解" },
        { id: "technical-conferences", label: "厂商技术大会", short: "官方开发者大会与技术专场" },
        { id: "professional-podcasts", label: "专业播客与访谈", short: "有完整嘉宾与主题记录的长篇内容" },
        { id: "education-platforms", label: "开放教育平台", short: "经审核的课程平台与教学系列" }
      ]
    },
    {
      id: "hackathon", order: 7, label: "黑客马拉松", short: "赛题、获奖项目与原型", color: "#d0b15c", authority: "R",
      subcategories: [
        { id: "kaggle", label: "Kaggle", short: "数据科学竞赛、数据集与方案" },
        { id: "devpost", label: "Devpost", short: "企业与社区黑客马拉松项目" },
        { id: "lablab", label: "lablab.ai", short: "AI 专题黑客马拉松与项目" },
        { id: "mlh", label: "Major League Hacking", short: "学生与社区黑客马拉松" },
        { id: "hugging-face-events", label: "Hugging Face 活动", short: "社区冲刺、竞赛与 Spaces 项目" },
        { id: "tianchi", label: "阿里云天池", short: "算法竞赛、数据集与获奖方案" },
        { id: "datafountain", label: "DataFountain", short: "中文数据科学竞赛平台" },
        { id: "zindi", label: "Zindi", short: "非洲与全球数据科学竞赛" }
      ]
    },
    {
      id: "creator", order: 8, label: "权威创作者", short: "经限定专业范围认证的个人来源", color: "#b67ba4", authority: "B",
      subcategories: [
        { id: "andrej-karpathy", label: "Andrej Karpathy", short: "神经网络、语言模型与工程教学" },
        { id: "jeremy-howard", label: "Jeremy Howard", short: "深度学习实践与 fast.ai 教学" },
        { id: "lilian-weng", label: "Lilian Weng", short: "深度学习与智能体研究综述" },
        { id: "chip-huyen", label: "Chip Huyen", short: "机器学习系统与 AI 工程" },
        { id: "sebastian-raschka", label: "Sebastian Raschka", short: "机器学习与大模型教学" },
        { id: "simon-willison", label: "Simon Willison", short: "LLM 工具、应用与行业观察" },
        { id: "threeblueonebrown", label: "3Blue1Brown", short: "数学与神经网络可视化解释" },
        { id: "creator-other", label: "其他认证创作者", short: "按明确专业范围单独登记" }
      ]
    },
    {
      id: "open-source", order: 9, label: "开源项目与代码仓库", short: "独立社区项目的主仓库与版本记录", color: "#84919f", authority: "B–R",
      subcategories: [
        { id: "github-canonical", label: "GitHub 主仓库", short: "项目声明的 GitHub canonical repository" },
        { id: "gitlab-canonical", label: "GitLab 主仓库", short: "项目声明的 GitLab canonical repository" },
        { id: "hugging-face-community", label: "Hugging Face 社区仓库", short: "独立社区模型、数据集与 Spaces" },
        { id: "apache-foundation", label: "Apache 基金会项目", short: "Apache 治理下的正式项目仓库" },
        { id: "linux-foundation", label: "Linux Foundation / LF AI", short: "基金会治理的 AI 与基础设施项目" },
        { id: "cncf", label: "CNCF 项目", short: "云原生基金会治理的项目" },
        { id: "package-registries", label: "软件包注册表", short: "PyPI、npm、crates.io 等正式发行记录" },
        { id: "self-hosted-repositories", label: "独立自托管仓库", short: "项目官方维护的非平台主仓库" }
      ]
    }
  ],
  items: [
    {
      id: "vall-e-paper",
      sourceClass: "academic",
      sourceSubcategory: "arxiv",
      title: "Neural Codec Language Models are Zero-Shot TTS Synthesizers",
      publisher: "Microsoft Research",
      collection: "arXiv 预印本",
      contentKind: "论文",
      authorityTier: "R",
      reviewStatus: "preprint",
      primarySource: true,
      discoveryOnly: false,
      url: "https://arxiv.org/abs/2301.02111",
      publishedAt: "2023-01-05",
      accessedAt: "2026-07-24",
      summary: "提出以神经音频编解码 token 和声学提示实现零样本文本转语音的路线，是理解 acoustic prompt 与声音克隆的重要一手研究。",
      evidenceUse: "可支持论文所提出的方法、实验设置与作者报告的结果；尚需独立来源验证泛化能力。",
      limitations: ["预印本身份不能等同于同行评审结论", "作者实验不能自动推广到所有声音克隆系统"],
      tags: ["语音", "声音克隆", "神经音频编解码"],
      linkedNodes: ["voice-cloning", "speech", "tokenization"],
      linkedSoftware: []
    },
    {
      id: "nist-ai-600-1",
      sourceClass: "standards",
      sourceSubcategory: "nist",
      title: "AI RMF：Generative Artificial Intelligence Profile",
      publisher: "NIST",
      collection: "NIST AI 600-1",
      contentKind: "风险管理框架",
      authorityTier: "A1",
      reviewStatus: "published",
      primarySource: true,
      discoveryOnly: false,
      url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
      publishedAt: "2024-07-26",
      accessedAt: "2026-07-24",
      summary: "把生成式 AI 的风险与建议行动映射到 NIST AI RMF，为治理、评测、内容来源和事件管理提供规范性参考。",
      evidenceUse: "可支持 NIST 框架自身的风险分类和建议，不代表法律强制要求。",
      limitations: ["属于自愿风险管理框架", "具体行业和地区仍需适用法规与组织制度"],
      tags: ["治理", "风险管理", "生成式AI"],
      linkedNodes: ["governance", "model-evaluation", "training-data-governance"],
      linkedSoftware: []
    },
    {
      id: "elevenlabs-voice-cloning-docs",
      sourceClass: "official",
      sourceSubcategory: "vendor-docs-other",
      title: "Voice cloning：how it works",
      publisher: "ElevenLabs",
      collection: "ElevenLabs Documentation",
      contentKind: "官方技术文档",
      authorityTier: "A1",
      reviewStatus: "current",
      primarySource: true,
      discoveryOnly: false,
      url: "https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning",
      accessedAt: "2026-07-24",
      summary: "说明 Instant Voice Cloning 与 Professional Voice Cloning 的产品机制、输入要求和适用边界。",
      evidenceUse: "可直接支持 ElevenLabs 当前产品行为；跨产品机制仍需论文和独立资料。",
      limitations: ["厂商文档不构成跨平台性能比较", "界面、配额和能力会随版本变化"],
      tags: ["声音克隆", "官方文档", "音频"],
      linkedNodes: ["voice-cloning", "speech"],
      linkedSoftware: ["elevenlabs"]
    },
    {
      id: "mitre-atlas",
      sourceClass: "knowledge-base",
      sourceSubcategory: "mitre-atlas",
      title: "MITRE ATLAS",
      publisher: "MITRE",
      collection: "Adversarial Threat Landscape for AI Systems",
      contentKind: "威胁知识库",
      authorityTier: "A2",
      reviewStatus: "living",
      primarySource: false,
      discoveryOnly: false,
      url: "https://atlas.mitre.org/",
      accessedAt: "2026-07-24",
      summary: "持续维护针对 AI 系统的攻击战术与技术，并把真实观察和红队演示组织成结构化知识库。",
      evidenceUse: "可支持 ATLAS 中已登记的技术分类和案例映射；单一条目仍需追踪其底层证据。",
      limitations: ["知识库覆盖受公开案例影响", "分类存在更新和合并"],
      tags: ["AI安全", "攻击技术", "红队"],
      linkedNodes: ["governance", "evaluation"],
      linkedSoftware: []
    },
    {
      id: "stanford-ai-index-2026",
      sourceClass: "industry-analysis",
      sourceSubcategory: "stanford-ai-index",
      title: "2026 AI Index Report",
      publisher: "Stanford Institute for Human-Centered AI",
      collection: "AI Index",
      contentKind: "行业研究报告",
      authorityTier: "B",
      reviewStatus: "published",
      primarySource: false,
      discoveryOnly: false,
      url: "https://hai.stanford.edu/ai-index",
      publishedAt: "2026-04-13",
      accessedAt: "2026-07-24",
      summary: "汇总研究、技术性能、责任 AI、经济与政策数据，为判断 AI 发展速度和治理缺口提供跨来源年度观察。",
      evidenceUse: "适合支持报告所汇总的趋势与统计；重要数字应继续追踪到报告引用的原始数据。",
      limitations: ["年度汇总存在时间滞后", "跨来源指标的口径并不完全一致"],
      tags: ["行业趋势", "责任AI", "政策"],
      linkedNodes: ["governance", "model-evaluation"],
      linkedSoftware: []
    },
    {
      id: "stanford-cs25",
      sourceClass: "public-talks",
      sourceSubcategory: "university-courses",
      title: "CS25：Transformers United V6",
      publisher: "Stanford University",
      collection: "CS25 公开研讨课",
      contentKind: "公开课与讲座",
      authorityTier: "B",
      reviewStatus: "current",
      primarySource: false,
      discoveryOnly: false,
      url: "https://web.stanford.edu/class/cs25/",
      publishedAt: "2026-03-30",
      accessedAt: "2026-07-24",
      summary: "邀请 Transformer 研究者讲解最新研究、应用与挑战，适合作为前沿发现和论文入口。",
      evidenceUse: "讲座可提供解释和研究线索；关键结论应回到讲者引用的论文或正式资料。",
      limitations: ["课程讲座不等同于同行评审", "不同讲者的证据标准可能不同"],
      tags: ["Transformer", "公开课", "前沿研究"],
      linkedNodes: ["transformer"],
      linkedSoftware: []
    },
    {
      id: "ibm-agentic-hackathon",
      sourceClass: "hackathon",
      sourceSubcategory: "lablab",
      title: "Agentic AI Hackathon with IBM watsonx Orchestrate",
      publisher: "lablab.ai",
      collection: "官方比赛与获奖项目页",
      contentKind: "黑客马拉松",
      authorityTier: "R",
      reviewStatus: "event-record",
      primarySource: true,
      discoveryOnly: true,
      url: "https://lablab.ai/ai-hackathons/agentic-ai-hackathon-ibm-watsonx-orchestrate/live",
      accessedAt: "2026-07-24",
      summary: "记录 Agentic AI 赛题、参赛技术与获奖原型，可用于发现新工作流和早期项目。",
      evidenceUse: "只用于发现候选软件、教程和概念，不得单独支持正式节点。",
      limitations: ["演示不等于生产可用", "获奖不等于技术结论已经独立验证"],
      tags: ["Agent", "原型", "watsonx"],
      linkedNodes: ["agent", "multi-agent"],
      linkedSoftware: []
    },
    {
      id: "karpathy-zero-to-hero",
      sourceClass: "creator",
      sourceSubcategory: "andrej-karpathy",
      title: "Neural Networks：Zero to Hero",
      publisher: "Andrej Karpathy",
      collection: "创作者官方课程",
      contentKind: "代码课程",
      authorityTier: "B",
      reviewStatus: "published",
      primarySource: true,
      discoveryOnly: false,
      url: "https://karpathy.ai/zero-to-hero.html",
      accessedAt: "2026-07-24",
      summary: "从零用代码构建神经网络、语言模型和 GPT，适合把抽象机制落实为可运行实现。",
      evidenceUse: "可支持课程中可复现的代码教学；理论和历史断言仍需教材或论文交叉验证。",
      limitations: ["权威范围限定在神经网络与语言模型工程教学", "课程实现为教学简化版"],
      tags: ["神经网络", "GPT", "代码教学"],
      linkedNodes: ["neural-network", "transformer"],
      linkedSoftware: []
    },
    {
      id: "llama-cpp-repository",
      sourceClass: "open-source",
      sourceSubcategory: "github-canonical",
      title: "llama.cpp",
      publisher: "ggml-org",
      collection: "项目主仓库",
      contentKind: "开源代码仓库",
      authorityTier: "B",
      reviewStatus: "maintained",
      primarySource: true,
      discoveryOnly: false,
      url: "https://github.com/ggml-org/llama.cpp",
      accessedAt: "2026-07-24",
      summary: "独立社区维护的 C/C++ 大模型推理项目，主仓库记录支持模型、量化、后端、接口和版本变化。",
      evidenceUse: "可直接支持项目实现、接口和版本事实；性能与安全结论必须独立复测。",
      limitations: ["提交频繁，必须绑定具体版本", "仓库 Star 和流行度不能证明正确性"],
      tags: ["本地推理", "C++", "开源项目"],
      linkedNodes: ["inference-optimization"],
      linkedSoftware: ["ollama"]
    }
  ]
};
