/* 专业资料库二级来源档案。事实以官方页面为主，集合型来源明确标注“无统一网址”。 */
(function () {
  "use strict";

  const platform = (website, positioning, background, organization, foundingTeam) => ({
    kind: "platform", website, positioning, background, organization, foundingTeam, reviewedAt: "2026-07-25"
  });
  const collection = (positioning, background, organization, foundingTeam = "集合型来源，没有单一创始团队。") => ({
    kind: "collection", website: null, positioning, background, organization, foundingTeam, reviewedAt: "2026-07-25"
  });

  window.LIBRARY_PLATFORM_PROFILES = {
    "academic/arxiv": platform("https://arxiv.org/", "开放获取的科研预印本与电子论文库。", "1991 年由 Paul Ginsparg 在洛斯阿拉莫斯国家实验室创建，先服务高能物理，后扩展到数学、计算机科学等领域；2026 年进入独立非营利运营阶段。", "arXiv 非营利组织；历史上长期由 Cornell University 运营和支持。", "Paul Ginsparg 创建，早期社区与 Cornell 团队持续建设。"),
    "academic/openreview": platform("https://openreview.net/", "支持投稿、同行评审、讨论、出版和开放 API 的学术基础设施。", "源自 2012 年前后的开放同行评审实验，逐步成为众多 AI 旗舰会议的投稿与评审平台。", "OpenReview Foundation，501(c)(3) 非营利组织；源自 UMass Amherst 信息抽取与综合实验室。", "Andrew McCallum 及其 UMass Amherst 实验室团队发起。"),
    "academic/acl-anthology": platform("https://aclanthology.org/", "计算语言学、语音与自然语言处理领域的开放论文库。", "由 ACL 社区建设，集中保存 ACL 及相关组织会议和期刊论文，长期依靠编辑与志愿者维护。", "Association for Computational Linguistics（ACL）。", "ACL 学术共同体发起并由历届 Anthology 编辑团队维护，不对应商业创始人。"),
    "academic/neurips-proceedings": platform("https://papers.neurips.cc/", "NeurIPS 正式录用论文和会议论文集。", "NeurIPS 源于 1987 年的神经信息处理系统会议，论文集记录机器学习和计算神经科学的重要研究。", "Neural Information Processing Systems Foundation。", "由早期 NIPS 研究共同体和会议组织者发起；论文集由基金会与历届程序团队维护。"),
    "academic/pmlr": platform("https://proceedings.mlr.press/", "机器学习会议和研讨会论文集的开放出版系列。", "前身为 JMLR Workshop and Conference Proceedings，各卷对应独立会议或研讨会，作者保留版权。", "JMLR / Proceedings of Machine Learning Research 编辑体系。", "由机器学习学术共同体建立；系列编辑长期包括 Neil D. Lawrence 与 Mark Reid。"),
    "academic/cvf-open-access": platform("https://openaccess.thecvf.com/", "计算机视觉会议论文的开放版本仓库。", "为 CVPR、ICCV、WACV 等会议提供及时开放的作者定稿版本，正式出版版本通常同时进入 IEEE Xplore。", "Computer Vision Foundation（CVF）。", "由计算机视觉学术共同体与 CVF 理事会建设，不对应单一商业创始人。"),
    "academic/ieee-xplore": platform("https://ieeexplore.ieee.org/", "IEEE 期刊、会议、标准和技术出版物的数字图书馆。", "建立在 IEEE 长期出版体系之上，汇集电气、电子、计算机与相关工程资料。", "Institute of Electrical and Electronics Engineers（IEEE）。", "IEEE 由 AIEE 与 IRE 于 1963 年合并形成；Xplore 由 IEEE 出版与技术团队建设。"),
    "academic/acm-dl": platform("https://dl.acm.org/", "计算机科学与信息技术出版物的数字图书馆。", "收录 ACM 期刊、会议论文集、杂志和社区出版物，是计算机领域主要学术检索入口之一。", "Association for Computing Machinery（ACM）。", "ACM 于 1947 年由早期计算机专业人士共同成立；数字图书馆由 ACM 出版体系建设。"),
    "academic/springer-nature": platform("https://link.springer.com/", "跨学科期刊、图书和会议论文的学术出版平台。", "Springer Nature 于 2015 年由 Springer Science+Business Media 与 Nature Publishing Group 等业务合并形成。", "Springer Nature Group。", "源自多个历史出版机构的合并，不对应单一现代创始团队。"),

    "standards/nist": platform("https://www.nist.gov/artificial-intelligence", "美国联邦层面的测量科学、技术标准和风险管理资料来源。", "NIST 创建于 1901 年，AI 资料包括 AI RMF、生成式 AI Profile、测量和评估工作。", "美国商务部 National Institute of Standards and Technology。", "美国国会设立的联邦机构，不属于创业公司。"),
    "standards/iso-iec": platform("https://www.iso.org/artificial-intelligence.html", "国际通用标准及 AI 联合技术标准的发布体系。", "ISO 与 IEC 通过 ISO/IEC JTC 1 及其 SC 42 等委员会制定 AI、数据和软件相关国际标准。", "ISO 与 IEC 两个国际非政府标准组织。", "由各国标准机构共同组成，没有单一创始团队。"),
    "standards/ieee-standards": platform("https://standards.ieee.org/", "工程技术标准、工作组和标准开发流程平台。", "IEEE Standards Association 延续 IEEE 工程标准传统，AI 领域覆盖伦理、透明度、治理和系统工程。", "IEEE Standards Association。", "源自 IEEE 会员和标准委员会体系，不对应单一创始人。"),
    "standards/eu-institutions": platform("https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai", "欧盟 AI 法规、实施规则和政策文件的官方入口集合。", "欧盟委员会、议会、理事会及相关机构共同形成 AI Act 等监管体系。", "欧盟机构体系。", "超国家公共机构集合，没有公司或创业创始团队。"),
    "standards/us-regulators": platform("https://www.usa.gov/federal-agencies", "美国联邦监管机构及其 AI 相关规则、指南和执法文件集合。", "FTC、FDA、EEOC、SEC 等机构按各自法定职权处理 AI 的消费者保护、医疗、就业和金融问题。", "美国联邦政府各独立部门与监管机构。", "法定机构集合，没有统一创始团队。"),
    "standards/china-standards-regulators": platform("https://www.gov.cn/zhengce/", "中国国家法规、政策、国家标准和技术文件的官方来源集合。", "国务院、国家网信办、国家标准化管理委员会及相关技术委员会分别承担政策、监管与标准工作。", "中国政府及国家标准体系相关机构。", "公共机构集合，没有统一商业创始团队。"),
    "standards/oecd": platform("https://oecd.ai/", "政府间 AI 政策、指标、原则和政策观察平台。", "OECD 于 2019 年通过 AI Principles，OECD.AI 用于汇总政策、数据与跨国实践。", "Organisation for Economic Co-operation and Development。", "由成员经济体组成的政府间组织，没有公司创始人。"),
    "standards/un-agencies": platform("https://www.un.org/en/global-issues/artificial-intelligence", "联合国系统内 AI 治理、伦理、通信和发展议题的官方资料集合。", "UNESCO、ITU、联合国秘书处等机构在各自授权范围内发布建议、决议和技术资料。", "联合国及其专门机构。", "多边公共机构集合，没有统一创始团队。"),

    "official/openai": platform("https://openai.com/", "OpenAI 模型、产品、研究、安全与开发者资料的一手来源。", "OpenAI 于 2015 年成立，逐步从研究组织发展为训练和部署通用 AI 系统的机构。", "OpenAI。", "由 Sam Altman、Elon Musk、Greg Brockman、Ilya Sutskever、Wojciech Zaremba、John Schulman 等共同发起。"),
    "official/anthropic": platform("https://www.anthropic.com/", "Claude 模型、开发者文档、研究和安全披露的一手来源。", "Anthropic 于 2021 年成立，重点研究和部署可靠、可解释、可控的 AI 系统。", "Anthropic PBC。", "由 Dario Amodei、Daniela Amodei 及一批前 OpenAI 研究与工程成员共同创立。"),
    "official/google-deepmind": platform("https://deepmind.google/", "Google 与 Google DeepMind 模型、研究和开发者能力的一手来源。", "DeepMind 于 2010 年成立、2014 年被 Google 收购，2023 年与 Google Brain 体系整合为 Google DeepMind。", "Google DeepMind，隶属 Alphabet / Google。", "DeepMind 由 Demis Hassabis、Shane Legg、Mustafa Suleyman 创立；Google Brain 由 Google 研究团队发展。"),
    "official/microsoft": platform("https://www.microsoft.com/ai", "Microsoft AI、Azure AI、Copilot、研究和产品文档的一手来源。", "Microsoft 于 1975 年成立，AI 资料分布在 Microsoft Research、Azure、GitHub 与产品文档体系。", "Microsoft Corporation。", "Bill Gates 与 Paul Allen 创立。"),
    "official/meta-ai": platform("https://ai.meta.com/", "Meta 模型、研究、模型卡和官方开源项目的一手来源。", "Meta 的 AI 研究体系由 FAIR 等团队发展，覆盖基础模型、计算机视觉、语音与推荐系统。", "Meta Platforms, Inc.。", "Facebook 于 2004 年由 Mark Zuckerberg 与 Eduardo Saverin、Dustin Moskovitz、Andrew McCollum、Chris Hughes 等共同创立。"),
    "official/nvidia": platform("https://developer.nvidia.com/ai", "GPU、CUDA、AI 框架、模型和部署技术资料的一手来源。", "NVIDIA 于 1993 年成立，随后由图形计算扩展到通用 GPU 计算和 AI 基础设施。", "NVIDIA Corporation。", "Jensen Huang、Chris Malachowsky、Curtis Priem 共同创立。"),
    "official/hugging-face-official": platform("https://huggingface.co/docs", "Hugging Face 平台、Transformers 等官方库和课程资料的一手来源。", "Hugging Face 于 2016 年成立，后来发展为模型、数据集、应用和开源工具协作平台。", "Hugging Face, Inc.。", "Clément Delangue、Julien Chaumond、Thomas Wolf 共同创立。"),
    "official/aws": platform("https://aws.amazon.com/ai/", "AWS 云端 AI、Bedrock、SageMaker 和基础设施资料的一手来源。", "Amazon Web Services 于 2006 年正式推出，随后形成覆盖训练、推理、托管模型和企业服务的云平台。", "Amazon Web Services，隶属 Amazon。", "由 Amazon 内部团队创建，早期业务建设由 Andy Jassy 等领导；不是独立创业公司。"),
    "official/vendor-docs-other": collection("尚未单列的厂商官方文档、模型卡、系统卡和更新日志。", "用于容纳经过逐一登记但数量不足以独立成类的厂商；不能把厂商官网整体视为可信。", "随具体资料记录实际公司、研究机构和产品团队。"),

    "knowledge-base/mitre-atlas": platform("https://atlas.mitre.org/", "面向 AI 系统的对抗威胁战术、技术和案例知识库。", "MITRE 于 2020 年前后公开 ATLAS，并与政府、企业和研究社区持续维护攻击技术与案例。", "The MITRE Corporation 及 ATLAS 社区。", "由 MITRE 研究团队与合作机构发起，不属于商业创业平台。"),
    "knowledge-base/mlcommons": platform("https://mlcommons.org/", "面向机器学习训练、推理、存储和安全的公共基准组织。", "MLCommons 于 2020 年围绕 MLPerf 等项目形成工程与研究联盟，推动可比较的公开测量。", "MLCommons Association，非营利工程联盟。", "由 MLPerf 社区、产业和学术参与者共同组建，不对应单一创始人。"),
    "knowledge-base/stanford-crfm": platform("https://crfm.stanford.edu/", "基础模型研究、透明度、评测和 HELM 基准平台。", "Stanford CRFM 于 2021 年在 Stanford HAI 体系内成立，推动基础模型的系统研究与社会分析。", "Stanford Center for Research on Foundation Models。", "由 Percy Liang 等 Stanford 研究者和跨学科团队发起。"),
    "knowledge-base/lmsys-arena": platform("https://lmarena.ai/", "通过匿名模型对战和用户偏好收集开展开放式大模型评测。", "Chatbot Arena 于 2023 年由 LMSYS / UC Berkeley SkyLab 团队推出，2024 年迁移到独立站点并继续扩展评测范围。", "Arena 团队；与 LMSYS 非营利研究组织保持合作。", "Lianmin Zheng、Wei-Lin Chiang 等研究者，与 Ion Stoica、Joseph E. Gonzalez 等导师团队共同发起。"),
    "knowledge-base/papers-with-code": platform("https://paperswithcode.com/", "把机器学习论文、代码实现、数据集和基准结果连接起来的索引。", "平台于 2018 年前后出现，后进入 Meta AI 生态；资料适合作发现和定位实现，排行榜仍需回到原论文与代码核验。", "Papers with Code / Meta AI 生态。", "由 Robert Stojnic 等团队创建并发展。"),
    "knowledge-base/artificial-analysis": platform("https://artificialanalysis.ai/", "独立比较 AI 模型能力、价格、速度、延迟和开放程度的评测平台。", "面向快速变化的模型市场建立统一方法和实测数据，提供模型与供应商对比。", "Artificial Analysis。", "由独立 AI 分析与工程团队创建；公开页面未把全部历史归于单一创始人。"),
    "knowledge-base/nvd-cve": platform("https://nvd.nist.gov/", "公开漏洞标识、影响范围和安全元数据的权威数据库体系。", "CVE 于 1999 年由 MITRE 推出；NVD 由 NIST 在 CVE 基础上补充分析、评分和检索能力。", "NIST 运营 NVD；MITRE 管理 CVE 项目。", "美国公共安全基础设施项目，由 MITRE 与 NIST 团队建设。"),
    "knowledge-base/benchmark-other": collection("尚未单列的专项基准、红队平台和独立测试组织。", "只接收公开测试方法、样本范围、版本与局限的评测来源；榜单本身不等于事实。", "随具体条目记录评测机构、资助关系和维护团队。"),

    "industry-analysis/stanford-ai-index": platform("https://hai.stanford.edu/ai-index", "用年度报告和公开数据追踪 AI 研究、产业、经济、政策与社会影响。", "AI Index 项目于 2017 年启动，后来纳入 Stanford HAI，依靠跨机构专家和数据伙伴编制年度报告。", "Stanford Institute for Human-Centered Artificial Intelligence。", "由 Stanford 学术团队和早期指导委员会发起，报告由年度编辑、研究与数据团队共同完成。"),
    "industry-analysis/epoch-ai": platform("https://epoch.ai/", "研究 AI 模型、算力、数据、算法进展和潜在经济影响。", "Epoch 于 2021 年从志愿者数据研究小组起步，在 2022 年训练算力趋势研究后扩展为正式机构。", "Epoch AI，独立非营利研究机构。", "由 Jaime Sevilla 等早期研究者和志愿者团队发起，后形成跨学科研究团队。"),
    "industry-analysis/gartner": platform("https://www.gartner.com/en/artificial-intelligence", "面向企业决策者的技术市场研究、供应商分析和咨询。", "Gartner 于 1979 年成立，以 IT 市场研究和 Magic Quadrant 等方法闻名。", "Gartner, Inc.。", "Gideon Gartner 创立。"),
    "industry-analysis/mckinsey": platform("https://www.mckinsey.com/capabilities/quantumblack/our-insights", "企业 AI 采用、组织转型和行业应用研究。", "McKinsey 成立于 1926 年；其 QuantumBlack 等团队承担数据科学和 AI 研究与咨询。", "McKinsey & Company。", "James O. McKinsey 创立；AI 分析由现代 QuantumBlack 与行业研究团队完成。"),
    "industry-analysis/deloitte": platform("https://www.deloitte.com/global/en/issues/generative-ai.html", "企业 AI 调研、治理、行业应用和专业服务分析。", "Deloitte 的历史始于 1845 年，现由全球成员所网络开展审计、咨询、税务和风险服务。", "Deloitte Touche Tohmatsu Limited 及成员所网络。", "William Welch Deloitte 创立早期事务所；现代网络由多次合并形成。"),
    "industry-analysis/rand": platform("https://www.rand.org/topics/artificial-intelligence.html", "AI 政策、国家安全、公共治理和社会影响研究。", "RAND 于二战后由 Project RAND 演变而来，1948 年成为独立非营利研究机构。", "RAND Corporation。", "源自美国陆军航空军与 Douglas Aircraft 的研究项目，非典型单一创始人机构。"),
    "industry-analysis/semianalysis": platform("https://semianalysis.com/", "AI 芯片、数据中心、模型基础设施与半导体产业分析。", "以技术拆解、成本模型和供应链研究覆盖 GPU、加速器、云和前沿模型训练。", "SemiAnalysis。", "由 Dylan Patel 创建并发展为专业分析团队。"),
    "industry-analysis/specialist-research-other": collection("尚未单列的专业研究机构、行业分析团队和事故复盘来源。", "用于收纳有清晰方法、利益披露和专业边界的研究；咨询宣传不能直接晋升为证据。", "随具体来源记录公司、研究机构、资助者和作者团队。"),

    "public-talks/university-courses": collection("大学官方发布的课程、公开课和研讨课。", "来源单位是具体大学、院系或课程主页；视频托管平台只是传播渠道。", "随课程记录大学、院系、授课教师和维护团队。"),
    "public-talks/conference-channels": collection("学术会议官方发布的主题演讲、论文报告和圆桌讨论。", "只收录由会议或学会确认的官方频道与议程记录，关键结论应回到论文。", "随资料记录会议基金会、学会或当届组织委员会。"),
    "public-talks/research-seminars": collection("研究机构、实验室和大学中心的公开研讨会。", "适合了解研究动机与前沿线索，但口头报告不能替代正式论文和数据。", "随资料记录主办实验室、机构与讲者团队。"),
    "public-talks/standards-webinars": collection("标准和监管机构对正式文件的公开讲解。", "用于理解实施背景和术语，不得用口头解释取代正式规范文本。", "随资料记录 NIST、ISO、IEEE、监管机构等实际主办方。"),
    "public-talks/technical-conferences": collection("厂商开发者大会和官方技术专场。", "适合确认产品发布、接口演示和路线图；性能宣传仍需独立评测。", "随资料记录主办公司、产品部门和演讲团队。"),
    "public-talks/professional-podcasts": collection("有明确主持人、嘉宾、主题和完整记录的专业长篇访谈。", "用于保存专家解释、行业历史和观点；事实断言需要回到一手资料核验。", "随节目记录制作机构、主持团队、嘉宾和利益关系。"),
    "public-talks/education-platforms": collection("承载系统课程的开放教育平台与专业教学系列。", "平台只负责分发，课程资格取决于开课机构、教师背景、更新日期和课程材料。", "随课程记录平台公司、大学或创作团队。"),

    "hackathon/kaggle": platform("https://www.kaggle.com/competitions", "数据科学竞赛、数据集、Notebook 和社区方案平台。", "Kaggle 于 2010 年成立，2017 年被 Google 收购；竞赛常由企业和研究机构提供赛题与数据。", "Kaggle，隶属 Google。", "Anthony Goldbloom 与 Ben Hamner 共同创立。"),
    "hackathon/devpost": platform("https://devpost.com/hackathons", "企业、学校和社区黑客马拉松的组织与项目展示平台。", "平台前身 ChallengePost，于 2009 年成立，后更名为 Devpost。", "Devpost, Inc.。", "Brandon Kessler 创立。"),
    "hackathon/lablab": platform("https://lablab.ai/", "围绕生成式 AI、智能体和厂商技术举办在线黑客马拉松。", "通过限时活动、团队协作、导师支持和项目展示推动 AI 原型开发。", "lablab.ai。", "由 New Native 生态团队创建并运营。"),
    "hackathon/mlh": platform("https://mlh.io/", "面向学生和开发者社区的黑客马拉松联盟与活动体系。", "Major League Hacking 于 2013 年成立，为校园和社区活动提供认证、资源和组织支持。", "Major League Hacking。", "Mike Swift 与 Jonathan Gottfried 共同创立。"),
    "hackathon/hugging-face-events": platform("https://huggingface.co/events", "Hugging Face 社区冲刺、课程活动、挑战赛和项目展示入口。", "依托 Hugging Face 模型、数据集和 Spaces 生态组织开放协作活动。", "Hugging Face, Inc. 与活动合作方。", "平台由 Clément Delangue、Julien Chaumond、Thomas Wolf 创立；每场活动另有主办团队。"),
    "hackathon/tianchi": platform("https://tianchi.aliyun.com/", "中文算法竞赛、数据集、学习和产业赛题平台。", "由阿里云运营，连接企业问题、公开数据和数据科学开发者。", "阿里云计算有限公司。", "由阿里云内部团队建设；阿里巴巴由马云等创始团队建立。"),
    "hackathon/datafountain": platform("https://www.datafountain.cn/", "中文数据科学竞赛、数据开放与人才实践平台。", "通过政府、企业和科研赛题组织算法竞赛与解决方案征集。", "DataFountain 平台运营团队。", "公开资料未稳定披露单一创始人，按平台运营主体与具体赛事主办方记录。"),
    "hackathon/zindi": platform("https://zindi.africa/", "面向非洲及全球问题的数据科学竞赛与人才社区。", "Zindi 于 2018 年上线，通过企业、政府和社会议题连接数据科学人才。", "Zindi Africa。", "Celina Lee、Megan Yates、Ekow Duker 共同创立。"),

    "creator/andrej-karpathy": platform("https://karpathy.ai/", "神经网络、语言模型、计算机视觉和 AI 工程教学。", "曾参与 Stanford CS231n、OpenAI 与 Tesla AI 工作，以从零实现和机制讲解著称。", "个人独立创作；经历包括 OpenAI、Tesla 与 Eureka Labs。", "Andrej Karpathy 本人；此分类只在其明确专业范围内有效。"),
    "creator/jeremy-howard": platform("https://www.fast.ai/", "强调实践优先的深度学习教育和开源工具。", "fast.ai 通过免费课程和软件降低深度学习门槛，并推动 ULMFiT 等实践研究。", "fast.ai 与 Answer.AI 等团队。", "Jeremy Howard 与 Rachel Thomas 共同创建 fast.ai。"),
    "creator/lilian-weng": platform("https://lilianweng.github.io/", "深度学习、生成模型、智能体与安全主题的长篇研究综述。", "个人技术博客以梳理论文脉络、公式和方法分类见长，适合作为文献入口。", "个人创作；作者职业经历与具体文章披露为准。", "Lilian Weng 本人。"),
    "creator/chip-huyen": platform("https://huyenchip.com/", "机器学习系统、AI 工程、实时推理和职业教育。", "通过书籍、课程和文章连接模型开发与生产系统实践。", "个人创作及其参与创建的 AI 工程项目团队。", "Chip Huyen 本人；涉及公司的事实需回到相应公司官方资料。"),
    "creator/sebastian-raschka": platform("https://sebastianraschka.com/", "机器学习、深度学习和大语言模型的代码化教学。", "通过教材、课程、文章和开源实现解释模型训练与工程细节。", "个人学术与教育创作。", "Sebastian Raschka 本人。"),
    "creator/simon-willison": platform("https://simonwillison.net/", "LLM 工具、模型发布、软件开发和数据工程的持续观察。", "长期记录可复现实验、工具用法和行业变化，并维护 Datasette 等开源项目。", "个人创作与独立开源项目。", "Simon Willison 本人；其早期创业经历包括共同创建 Django 项目生态相关产品。"),
    "creator/threeblueonebrown": platform("https://www.3blue1brown.com/", "以动画和几何直觉解释数学、神经网络与相关基础概念。", "YouTube 教育频道始于 2015 年，以自研动画工具 Manim 和长篇可视化课程形成影响力。", "3Blue1Brown 独立教育品牌。", "Grant Sanderson 创建并主导内容制作。"),
    "creator/creator-other": collection("尚未单列、但已按专业范围认证的个人创作者。", "必须记录个人履历、利益关系、擅长范围和复核日期；声望不能跨领域继承。", "随具体人物记录个人、工作机构和内容发行渠道。"),

    "open-source/github-canonical": platform("https://github.com/", "项目明确声明的 GitHub 主仓库、发行版、Issue、PR 和提交历史。", "GitHub 于 2008 年上线，成为主流 Git 托管与协作平台；平台身份不证明仓库质量。", "GitHub, Inc.，隶属 Microsoft。", "Tom Preston-Werner、Chris Wanstrath、P. J. Hyett、Scott Chacon 共同创立。"),
    "open-source/gitlab-canonical": platform("https://gitlab.com/", "项目明确声明的 GitLab 主仓库和 DevSecOps 协作记录。", "GitLab 项目始于 2011 年，后来发展为开源核心与商业服务并存的平台。", "GitLab Inc. 及开源社区。", "Dmitriy Zaporozhets 与 Sid Sijbrandij 共同创立公司和商业化团队。"),
    "open-source/hugging-face-community": platform("https://huggingface.co/", "独立社区发布的模型、数据集、Spaces 和代码仓库。", "Hugging Face Hub 形成面向机器学习资产的版本化协作平台；社区条目必须逐仓库审核。", "Hugging Face, Inc. 及仓库各自维护者。", "平台由 Clément Delangue、Julien Chaumond、Thomas Wolf 创立。"),
    "open-source/apache-foundation": platform("https://www.apache.org/", "Apache 治理下的开源项目、发布版和社区决策记录。", "Apache Software Foundation 于 1999 年成立，以开放、社区主导的项目治理著称。", "Apache Software Foundation。", "由 Apache HTTP Server 早期开发者组成的 Apache Group 发起。"),
    "open-source/linux-foundation": platform("https://www.linuxfoundation.org/", "Linux Foundation 及 LF AI & Data 等基金会治理项目。", "Linux Foundation 于 2000 年由 Open Source Development Labs 与相关组织演变，后托管大量关键开源项目。", "The Linux Foundation。", "由产业与开源社区组织合并形成，不对应单一创业创始人。"),
    "open-source/cncf": platform("https://www.cncf.io/", "云原生计算基金会治理的开源项目和成熟度体系。", "CNCF 于 2015 年在 Linux Foundation 下成立，Kubernetes 是首个捐赠项目。", "Cloud Native Computing Foundation，隶属 Linux Foundation。", "由 Google、Linux Foundation 与早期云原生产业成员共同发起。"),
    "open-source/package-registries": collection("PyPI、npm、crates.io 等正式软件包发行与版本记录。", "注册表证明某版本被发布，不自动证明源码来源、安全性或维护质量。", "随生态记录 Python Packaging Authority、npm/GitHub、Rust Foundation 等实际运营组织。"),
    "open-source/self-hosted-repositories": collection("项目官方维护、但不依赖主流公共平台的自托管主仓库。", "适用于拥有明确域名、维护者、版本和签名记录的独立项目基础设施。", "随具体项目记录基金会、公司或社区维护团队。")
  };

  window.LIBRARY_PROFILE_GUIDANCE = {
    academic: {
      strengths: ["能够追踪研究的原始版本和作者信息", "保留投稿、评审或出版语境", "便于继续定位论文、数据与实现"],
      offers: ["论文全文、摘要、作者和版本信息", "投稿、评审或正式出版状态", "会议、期刊及补充材料入口"],
      howToUse: ["先确认论文版本和评审状态", "重要结论回到方法、实验和局限原文", "用独立论文或复现实验交叉验证"],
      caution: "收录或发表不代表所有结论都正确；预印本尤其不能自动视为同行评审证据。"
    },
    standards: {
      strengths: ["由多方参与形成可复用的技术共识", "编号、状态、委员会和修订历史较清晰", "强调互操作、安全、质量与实施一致性"],
      offers: ["正式标准、草案、项目编号和状态", "负责委员会、工作组和制定流程", "实施指南、解释、认证或一致性评估入口"],
      howToUse: ["引用时写清标准编号、年份和状态", "先确认是否为正式生效版本", "判断它是否被法律、合同或采购规则采用"],
      caution: "技术标准通常是共识文件，不自动等同于法律，也不能单独证明某种技术在现实中有效。"
    },
    official: {
      strengths: ["最接近产品当前实现和官方承诺", "接口、版本、限制和迁移信息更新较直接", "可以确认厂商自身披露的系统边界"],
      offers: ["产品文档、API和版本说明", "模型卡、系统卡、安全披露和官方公告", "官方示例、限制与迁移说明"],
      howToUse: ["用于确认该产品当前声称和实现的行为", "绑定访问日期、产品版本和地区", "性能与安全宣传再交由独立评测验证"],
      caution: "官方资料是产品事实的一手来源，但厂商不能作为自身性能优越性和普遍安全性的唯一裁判。"
    },
    "knowledge-base": {
      strengths: ["把分散案例或测试结果组织为结构化数据", "便于跨对象比较和长期追踪", "通常提供指标、版本或方法说明"],
      offers: ["结构化条目、基准、排行榜或案例库", "测试方法、数据集、指标和版本记录", "跨模型、跨系统或跨事件的对照信息"],
      howToUse: ["先阅读方法、样本和版本说明", "区分实测、估算与厂商自报结果", "追踪条目底层论文、数据和代码"],
      caution: "排行榜名次和知识库条目会随方法、样本和版本变化，不能脱离测试条件使用。"
    },
    "industry-analysis": {
      strengths: ["连接技术变化与产业、组织和政策环境", "适合观察长期趋势和跨机构差异", "经常整合调查、访谈和多来源数据"],
      offers: ["趋势数据、市场调查和跨对象分析", "产业结构、采用情况和成本研究", "政策、事故或技术路线复盘"],
      howToUse: ["检查方法、样本、资助和利益关系", "把预测与已发生事实分开", "对关键数字寻找原始数据或第二来源"],
      caution: "咨询报告和行业分析可能包含商业立场、付费样本或预测模型，不能按机构声望直接升级为事实。"
    },
    "public-talks": {
      strengths: ["能够保留讲者的推理过程和实践经验", "比正式论文更适合入门和建立直觉", "常能发现尚未整理成文的前沿线索"],
      offers: ["课程、演讲、访谈和技术讲解", "讲者对研究动机与实践经验的解释", "论文、工具和进一步资料线索"],
      howToUse: ["确认主办方、讲者和发布日期", "操作内容需按当前版本复现", "关键事实回到论文、标准或官方文档"],
      caution: "口头讲解适合理解和发现，不等同于同行评审、正式标准或可复现实验。"
    },
    hackathon: {
      strengths: ["能快速暴露新工具的组合方式和应用方向", "保留团队、赛题与原型的形成过程", "适合发现尚未成熟但有启发性的项目"],
      offers: ["赛题、数据、规则和提交记录", "获奖项目、原型演示和团队信息", "早期应用方向与实现线索"],
      howToUse: ["默认作为新概念和软件发现入口", "核对代码、数据许可和可复现性", "生产可用性必须另做工程验证"],
      caution: "完成演示或获得奖项不代表项目已经安全、稳定、可扩展或经过独立验证。"
    },
    creator: {
      strengths: ["解释风格稳定，便于形成连续学习路径", "常把论文原理转化为代码和直观示例", "个人经验能够补足正式资料的实践语境"],
      offers: ["专业解释、课程、实验和个人判断", "跨论文脉络整理与工程经验", "代码、演示和进一步阅读入口"],
      howToUse: ["只在已认证的专业范围内使用", "区分可复现实验、个人判断和历史叙述", "事实断言回到一手资料交叉验证"],
      caution: "个人权威不能跨领域继承；关注度、表达能力和从业经历都不能替代证据。"
    },
    "open-source": {
      strengths: ["直接展示功能是否真正进入代码和发行版", "变更过程、讨论和责任人通常可追踪", "可以通过本地运行和测试进行独立复核"],
      offers: ["主仓库代码、提交和版本发布记录", "Issue、PR、RFC与维护者讨论", "接口、许可证、依赖和实现状态"],
      howToUse: ["确认这是项目声明的主仓库", "引用具体版本、提交或发布日期", "性能、安全和兼容性结论必须独立复测"],
      caution: "Star、Fork和下载量只能反映传播或使用程度，不能证明代码正确、安全或持续维护。"
    }
  };

  Object.assign(window.LIBRARY_PLATFORM_PROFILES["standards/ieee-standards"], {
    overview: "IEEE Standards是IEEE Standards Association维护的全球工程技术标准平台。它的价值不只在于提供最终标准文本，还把标准从立项、工作组协作、审议批准到修订维护的整个生命周期公开组织起来，因此用户能够判断一份文件处于什么状态、由谁负责以及何时更新。平台覆盖计算机、通信、网络安全、能源、医疗、交通和人工智能等广泛领域，尤其擅长把跨厂商、跨系统的互操作性、安全性和质量要求转化为可共同采用的技术规则。IEEE SA依靠全球专家、企业、研究机构和公共部门参与形成共识，这种可追踪的治理过程，是它区别于企业白皮书和一般技术文章的核心优势。",
    strengths: [
      "完整覆盖标准生命周期：不仅能找正式标准，也能追踪项目状态、委员会、工作组和修订历史",
      "共识机制成熟：强调直接参与、正当程序、利益平衡、透明和广泛开放",
      "工程覆盖面广：从底层通信和硬件延伸到软件系统、网络安全、AI评测与治理",
      "实施生态完整：标准检索之外，还连接全文访问、培训、认证和一致性评估"
    ],
    offers: [
      "检索已发布标准和正在开发的标准项目，并按计算机、网络、安全、能源等领域浏览",
      "查看标准状态、批准与发布日期、负责委员会、工作组和版本历史",
      "进入购买、IEEE Xplore订阅、Standards Reading Room或IEEE GET免费访问入口",
      "了解标准开发流程、治理文件、会员参与、一致性评估和认证项目"
    ],
    howToUse: [
      "先搜索标准编号或关键词，再确认页面标注的是正式标准、批准草案还是开发项目",
      "正式引用必须带完整编号和年份，例如IEEE 3198-2025",
      "需要全文时再根据页面提供的购买、订阅、Reading Room或GET方式获取",
      "涉及AI时重点核对C/AISC等委员会、测试范围、指标定义和适用边界"
    ],
    caution: "IEEE SA是标准制定与管理入口，IEEE Xplore更偏全文获取。IEEE标准通常属于技术共识，是否具有强制力取决于法律、合同、采购制度或行业规则是否采用它。"
  });
})();
