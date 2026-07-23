/* Codex 使用教程：YouTube 资源扩展。
 * 证据来自完整自动字幕、章节、公开视频页面与官方文档校准；不根据标题补写内容。
 */
(function () {
  "use strict";
  const root = window.TUTORIALS;
  const tutorial = root && root.items && root.items.codex;
  if (!tutorial) throw new Error("Codex 教程主数据尚未加载");

  const formal = (notes, quality) => ({
    evidence: "E2",
    status: "formal",
    reviewedAt: "2026-07-23",
    standards: { accuracy: 2, alignment: 2, reproducibility: 2, traceability: 2, safety: 2 },
    quality,
    notes
  });

  tutorial.meta = "10 条教程 · Bilibili 5 + YouTube 5 · 均按完整字幕/转录与操作画面达到 E2 正式收录";
  tutorial.overview = "教程按平台分栏。Bilibili 组适合中文完整上手、替代模型和项目实战；YouTube 组补上 OpenAI 官方 CLI／IDE 基线、桌面端新功能、非技术业务流程、本地与云端执行选择，以及文件和表格自动化。每条资源都先还原完整操作与完成标志，再说明它相对同页其他视频真正独特的价值。";
  tutorial.sourceNote = "现有 5 条 Bilibili 资源来自完整音频转录与关键帧 OCR；新增 5 条 YouTube 资源取得 en-orig 全程自动字幕、公开章节与页面元数据，并对官方 OpenAI 视频页面做浏览器核验。所有总结均为重新组织的原创中文，价格、套餐、模型名、按钮和插件会变化，以页面访问日 2026-07-23 的官方文档为准。";
  tutorial.accessDate = "2026-07-23";
  tutorial.learningPath = [
    "先看 OpenAI 官方 Getting started：完成 CLI/IDE 安装、仓库基线、AGENTS.md、权限和 MCP 最小闭环。",
    "需要桌面端全景时，看 Tech With Tim 或 John Kim：理解本地、云端、worktree、Plan、Review、插件、计算机控制和自动化。",
    "不以写代码为主时，看 Futurepedia 与 Skill Leap AI：用真实文件夹、票据、PDF、表格和业务仪表盘检验日常知识工作。",
    "最后回到自己的仓库：固定基线命令和验收标准，小任务先验证，再把稳定流程沉淀为 Skill 或 Automation。"
  ];

  tutorial.resources.push(
    {
      id: "yt-codex-openai-getting-started",
      platform: "youtube",
      title: "Getting started with Codex",
      creator: "OpenAI",
      url: "https://www.youtube.com/watch?v=px7XlbYgk7I",
      publishedAt: "2026-01-12",
      duration: "53:01",
      audience: "希望按官方口径掌握 Codex CLI、IDE 扩展、AGENTS.md、MCP 与无头集成的开发者",
      summary: "OpenAI 团队用 agents.md 开源站点贯穿完整上手：通过 npm 或 Homebrew 安装 CLI并登录，在仓库根目录启动会话；用 AGENTS.md 固化测试命令、代码约定和任务专属文档索引；配置 approval policy、workspace-write sandbox、通知和 web search；随后演示 CLI 与 IDE 中的文件引用、图片输入、TODO 实现、测试生成、代码审查和 Mermaid 文档。后半安装一个示例 MCP，并把 Context7 文档接入真实改动；最后用 codex exec 无头执行和输出 schema，把代码质量分析变成可由脚本消费的 JSON。",
      coverage: [
        { title: "安装并建立仓库基线", steps: ["用 npm 或 Homebrew 安装最新版 Codex CLI，执行登录后从目标仓库根目录启动。", "先让 Codex 只读说明项目入口、运行命令和测试，再运行仓库已有基线命令。", "在 IDE 安装官方扩展，确认终端与扩展面对的是同一个仓库和 Git 状态。"], done: "CLI 与 IDE 均能读取目标仓库，基线测试结果已记录。" },
        { title: "写一份不会塞满上下文的 AGENTS.md", steps: ["在根 AGENTS.md 写构建、测试、格式化命令和团队约定。", "把前端、执行计划等长资料拆到独立 Markdown，只在 AGENTS.md 中说明何时读取。", "当 Codex 花很久才找到某条命令时，把已验证命令补回规则文件并新开会话复测。"], done: "新会话无需重新解释即可找到正确命令，又不会每次加载所有专题材料。" },
        { title: "配置权限、搜索和 MCP", steps: ["检查 config.toml 中的 approval policy 与 sandbox mode，默认只允许工作区写入；联网和扩大权限按任务审批。", "需要实时资料时显式开启 web search，而不是假定模型已经联网。", "用 codex mcp add 或 config.toml 注册 MCP，重启/新开会话后先做一次最小工具调用。"], done: "Codex 能调用目标 MCP；高权限、联网和工作区外写入仍受到明确边界控制。" },
        { title: "从交互使用迁移到可验证自动化", steps: ["在 IDE 对未提交改动或指定基线运行 Code Review，检查文件与行号证据。", "用 codex exec 执行只读质量任务，并用输出 schema 约束总文件数、问题、位置、严重度和说明。", "用 jq 或程序解析 JSON；先在样本仓库人工复核，再接 CI、数据库或工单系统。"], done: "同一任务既能人工交互执行，也能以结构化输出被程序稳定消费。" }
      ],
      uniqueTechniques: [
        { title: "用 AGENTS.md 做“按需文档路由”", scenario: "团队规则很多，全部塞入根文件会浪费上下文，但不写又会让 Agent 反复猜。", steps: ["根文件只保留每次都需要的命令与边界。", "把 frontend.md、execplans.md 等专题资料分开。", "在根文件写清每类任务应读取哪个专题文件，并用新会话验证。"], result: "稳定规则始终可见，长资料只在相关任务中加载。", limitation: "被引用文档仍需维护；过期命令会稳定地产生错误。" },
        { title: "codex exec + JSON Schema 形成机器可读验收", scenario: "希望把一次代码质量检查接进 CI 或内部系统。", steps: ["先在交互会话调通分析提示。", "改用 codex exec 无头运行并指定输出 schema。", "解析 JSON、校验字段，再对高风险结论保留人工复核。"], result: "输出不再是难解析的自由文本，可进入确定性流水线。", limitation: "结构正确不代表问题判断正确；验证集与权限隔离仍不可省。" }
      ],
      caution: "这是官方的一手基线，但产品更新很快。视频里的模型名称、默认权限、配置字段和界面可能变化；MCP 会把外部内容引入上下文，web search 与无头模式也会扩大数据流。先在测试仓库运行，密钥只进安全存储，codex exec 的写权限与网络权限必须按任务最小化。",
      review: formal(
        "取得 YouTube en-orig 全程自动字幕（约821 KiB）、完整章节与公开视频页面；浏览器核验标题、OpenAI 已验证频道、53:01 时长和章节。逐段核对 npm/Homebrew、AGENTS.md 文档路由、approval/sandbox、codex mcp add、IDE Review、codex exec 与输出 schema，并以官方 Codex 文档链接校准。质量总分 66.25。",
        { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 3 }
      )
    },
    {
      id: "yt-codex-tech-with-tim-course",
      platform: "youtube",
      title: "Codex - Full Course for Beginners",
      creator: "Tech With Tim",
      url: "https://www.youtube.com/watch?v=ZXkeWiWB4xg",
      publishedAt: "2026-07-14",
      duration: "34:57",
      audience: "想系统认识桌面版 Codex、浏览器/计算机控制、Plan、Goal、worktree、Review 与自动化的初学者",
      summary: "视频从桌面应用的安装、界面、模型和 reasoning 选择开始，解释项目、聊天、浏览器与终端面板。随后安装插件并演示计算机控制，强调屏幕出现控制高亮时 Agent 正在操作；编码主线用一个多人棋类应用说明项目文件、预览、命令、上下文 compact、Plan 与 Goal/循环模式。收尾覆盖 Git worktree 并行隔离、/review 检查未提交改动、AGENTS.md 跨会话规则和定时 Automation。",
      coverage: [
        { title: "安装与界面定向", steps: ["安装桌面应用并登录，在设置里确认代码/非代码使用偏好。", "认识项目、聊天、浏览器和终端面板；模型、速度与 reasoning 按任务复杂度选择。", "建立一个练习项目，先让 Codex 列出将读取和写入的目录。"], done: "能在正确项目里打开聊天，并看懂文件、终端、预览和用量设置。" },
        { title: "插件与计算机控制", steps: ["从插件入口添加确实需要的能力，逐项阅读授权范围。", "启动计算机控制小任务，观察控制高亮、鼠标动作和失败位置。", "先用可撤销任务验证；涉及账号、发布、邮件或删除时保留人工确认。"], done: "Agent 能完成一个低风险界面任务，且你能随时停止并核对结果。" },
        { title: "Plan、Goal 与上下文管理", steps: ["复杂功能先开 Plan，审阅文件范围、架构和测试再执行。", "对需要多轮验证的目标使用 Goal/循环模式，并写清终止条件。", "上下文接近高占用时再 compact；压缩后让 Codex复述当前状态、未决问题和验收条件。"], done: "大任务有先审计划、可观察循环和清晰停止条件，压缩后没有丢失关键约束。" },
        { title: "用 Git 与自动化收尾", steps: ["并行改动放在不同 worktree，避免两个任务同时写同一目录。", "提交前运行 /review 检查未提交改动，并自行查看 diff 与测试。", "把稳定规则写入 AGENTS.md；只有人工重复验证过的流程才设为 Automation。"], done: "改动可隔离、可审阅、可回退；自动任务不会首次运行就直接进入长期后台执行。" }
      ],
      uniqueTechniques: [
        { title: "把 Goal 模式写成有停止条件的验证循环", scenario: "任务需要反复构建、测试和修复，普通一次性提示容易提前结束。", steps: ["定义可观察目标，例如所有测试通过且预览无指定错误。", "明确每轮动作与最大轮数/成本。", "失败达到阈值时停下并报告，而不是无限重试。"], result: "Agent 能持续推进，同时仍受预算和失败边界约束。", limitation: "循环会快速消耗用量；错误测试也可能让它朝错误目标优化。" }
      ],
      caution: "视频展示的计算机控制、插件、Automation 和 Goal 模式权限较高，且发布于访问日前不久，界面仍可能快速变化。不要把“允许本次会话全部编辑”扩展成长期全权限；浏览器账号、第三方插件和定时任务必须逐项审查数据访问与不可逆动作。",
      review: formal(
        "取得 YouTube en-orig 全程自动字幕（约843 KiB）和15段公开章节，逐段核对安装、UI、模型、插件、Computer Control、/compact、Plan、Goal、worktree、/review、AGENTS.md 与 Automation。视频含一段赞助内容，教程总结已剔除。质量总分 63.75。",
        { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 2 }
      )
    },
    {
      id: "yt-codex-futurepedia-beginner-advanced",
      platform: "youtube",
      title: "Full Codex Tutorial: Beginner to Advanced",
      creator: "Futurepedia",
      url: "https://www.youtube.com/watch?v=Cuw0pBjZUOM",
      publishedAt: "2026-06-30",
      duration: "22:06",
      audience: "不写代码但想用 Codex 处理文件、构建业务仪表盘、沉淀 Skill 与自动化的用户",
      summary: "教程把 Codex 当作本地文件与应用工作代理，而不是纯聊天工具。作者创建咖啡店项目，将销售、费用、员工和库存文件交给 Codex，先用 Plan 规划，再生成可在桌面和移动端查看的仪表盘并核对汇总。接着把反复调好的菜单/视觉流程封装为 Skill，创建定时运营报告 Automation，通过 Google Drive 等插件交付材料，并展示 Computer Use、手机远程触发、GitHub 与部署的连接关系。",
      coverage: [
        { title: "用项目和真实文件建立上下文", steps: ["为一个业务目标创建独立项目文件夹，放入去敏后的销售、库存和说明文件。", "让 Codex 先列出文件、字段、缺失值和将要计算的指标。", "开 Plan mode，确认仪表盘范围、计算逻辑和交付格式。"], done: "输入文件和指标定义清楚，计划获批前没有生成最终制品。" },
        { title: "生成并核验咖啡店仪表盘", steps: ["让 Codex 汇总销售、费用、人工和库存，并生成响应式本地仪表盘。", "抽取几项总计回到原始文件手算，检查高优先级告警是否有数据依据。", "在窄屏预览并修正布局；不要只凭“看起来漂亮”验收。"], done: "关键数字可回算，桌面和移动预览均可用。" },
        { title: "从一次成功流程生成 Skill", steps: ["先通过多轮对话把输出风格、输入和验收调到满意。", "再调用 Skill Creator，把稳定步骤、边界和示例打包。", "在新聊天使用新样本复测，失败时修改 Skill 而不是补一次性提示。"], done: "新会话对同类输入能复现结构和质量，且保留独立验证。" },
        { title: "连接插件、自动化和移动端", steps: ["只为所需应用添加插件并审查 OAuth 范围。", "用一次成功的运营报告流程创建定时 Automation，首次几次保留人工检查。", "需要手机触发时确保主机开机；交付前再决定是否推 GitHub 或部署。"], done: "定时任务可追踪，移动触发有主机条件，外部服务授权范围明确。" }
      ],
      uniqueTechniques: [
        { title: "先把流程调顺，再反向封装 Skill", scenario: "你知道想要的结果，却还不知道稳定步骤。", steps: ["用真实样本迭代到满意结果。", "让 Codex总结稳定输入、步骤、检查点和失败条件。", "封装后用不同样本做回归测试。"], result: "Skill 来源于经过验证的工作流，不是凭空写的一份抽象说明。", limitation: "如果原始样本单一，Skill 会把偶然细节误当规则。" }
      ],
      caution: "视频面向非技术用户，容易让人忽略代码、数据和权限审查。业务文件应先去敏；汇总数字必须回算；Google Drive、GitHub、手机远程与Computer Use都会扩大数据和操作范围。视频中的套餐、免费额度和部署入口以官方当前说明为准。",
      review: formal(
        "取得 YouTube en-orig 全程自动字幕（约464 KiB）和12段章节，核对咖啡店文件组织、Plan、仪表盘、Skill Creator、Automation、Plugin、Computer Use、Codex Mobile 与部署流程。营销链接未写入教程。质量总分 62.5。",
        { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 3, accessibility: 2 }
      )
    },
    {
      id: "yt-codex-john-kim-beginners-guide",
      platform: "youtube",
      title: "Complete Beginner's Guide to OpenAI’s Codex App",
      creator: "John Kim",
      url: "https://www.youtube.com/watch?v=nQFtsehu7h0",
      publishedAt: "2026-04-11",
      duration: "32:53",
      audience: "需要理解本地、云端、worktree和并行任务取舍，并建立提示与安全习惯的开发者",
      summary: "作者从 Claude Code 用户视角拆解 Codex App 的执行模型：同一任务可在当前本地目录、云端环境或 Git worktree 中运行，三者在环境、并行性和文件冲突上不同。教程随后讲项目侧栏、快捷键、模型和 reasoning/fast 权衡，再把高质量提示整理成 Goal、Context、Constraints、Done when 四部分。进阶覆盖 AGENTS.md、Skills、MCP、子代理、并行任务、sandbox/hooks、自动化和代码审查，并以“不要让两个任务同时改同一文件”“只自动化已调好的流程”收尾。",
      coverage: [
        { title: "选择正确执行位置", steps: ["当前目录的小任务用 Local；需要远程环境或不占本机时考虑 Cloud；并行写代码时建立独立 worktree。", "运行前记录分支、依赖和测试命令，确认云端环境拥有必要但最小的秘密。", "两个任务可能修改同一文件时不要并行，先拆边界或串行执行。"], done: "每个任务的目录、分支和环境明确，不会把并行误当成安全隔离。" },
        { title: "用四要素写提示", steps: ["Goal 写最终结果；Context 写相关文件与业务背景。", "Constraints 写不可改接口、风格、权限和成本。", "Done when 写测试、截图、命令或人工验收标准。"], done: "Codex 能复述四类信息，最终报告逐条对应 Done when。" },
        { title: "把规则、流程和工具分层", steps: ["跨会话仓库事实放 AGENTS.md；可重复流程放 Skill；外部能力通过 MCP/插件提供。", "子代理只承担上下文相对独立的调查或验证，要求返回摘要和证据。", "对每层分别测试：规则是否加载、Skill能否复现、工具权限是否最小。"], done: "长期规则、可复用工作流和外部执行能力没有混在一个超长提示中。" },
        { title: "安全地并行和自动化", steps: ["并行任务分 worktree，合并前独立跑测试与 Review。", "Automation 先手动重复成功多次，再设置频率和失败通知。", "涉及推送、发布、邮件或删除时保留审批，hooks不能代替权限控制。"], done: "自动与并行提高吞吐量，但每条链仍可追踪、可停止和可回退。" }
      ],
      uniqueTechniques: [
        { title: "用 Local / Cloud / Worktree 三问法分配任务", scenario: "同一个Codex界面提供多种执行方式，初学者容易只按方便选择。", steps: ["任务依赖本机未提交状态吗？是则 Local。", "需要远程运行或与本机解耦吗？是则 Cloud，并单独配置环境。", "会与另一个本地写任务冲突吗？是则 Worktree。"], result: "执行位置由依赖和冲突决定，而不是随意选择。", limitation: "Cloud 和 worktree 都不自动解决共享外部资源、数据库或同一API的并发冲突。" }
      ],
      caution: "视频中的模型、快捷键和界面是2026年4月版本；执行模式的语义应以当前客户端为准。云端运行涉及代码与密钥上传，worktree也会共享Git历史和外部服务。自动化前必须验证幂等性、失败通知和回滚。",
      review: formal(
        "取得 YouTube en-orig 全程自动字幕（约514 KiB）和14段章节，逐段核对 Local/Cloud/worktree、快捷键、模型与 reasoning、Goal/Context/Constraints/Done when、AGENTS.md、Skills、MCP、sub-agents、sandbox/hooks、review 和 automations。质量总分 63.75。",
        { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 3, accessibility: 3 }
      )
    },
    {
      id: "yt-codex-skill-leap-everyday-work",
      platform: "youtube",
      title: "Ultimate Guide To ChatGPT Codex for Everyday People",
      creator: "Skill Leap AI",
      url: "https://www.youtube.com/watch?v=BU3llOqYy8k",
      publishedAt: "2026-06-22",
      duration: "24:23",
      audience: "想用 Codex 处理票据、PDF、文件夹、表格、演示文稿和日程，而非主要编程的知识工作者",
      summary: "教程以日常文件工作为主：将票据图片放入项目文件夹，让 Codex提取商家、日期、金额和分类并生成 Excel 仪表盘；再把多份 PDF 发票抽成结构化表格；之后整理混乱文件夹、重命名和分类。作者解释 AGENTS.md 的长期项目说明与聊天内短期上下文，并展示插件连接外部应用、Skills复用演示文稿流程、Computer Use操作应用，以及每日简报等 Automation。视频同时明确指出计算机控制仍慢、消耗额度且需要谨慎授权。",
      coverage: [
        { title: "票据图片转可核查 Excel", steps: ["把少量去敏票据复制到独立文件夹，先让 Codex列出将提取的字段。", "要求保留来源文件名、无法识别标记和逐行金额，再生成分类与图表。", "随机抽样回看图片，复核商家、日期、税费、币种和总额。"], done: "Excel 总额可回算，每条记录能追溯到原图片，低置信字段未被静默猜测。" },
        { title: "PDF 发票批量结构化", steps: ["定义发票号、供应商、日期、税额、总额等目标字段。", "先跑两份样本检查版式差异，再扩到整个文件夹。", "把缺字段和解析失败单独列出，不让空值被当成零。"], done: "输出表覆盖全部输入，异常文件有清单，关键金额经抽样核对。" },
        { title: "安全整理文件夹", steps: ["先让 Codex只读提出分类、命名规则和预览清单。", "确认重名、扩展名和目标路径后再执行移动/重命名。", "保留映射日志或先复制到测试目录，完成后检查文件数量与哈希/大小。"], done: "整理前后文件数一致，重名没有覆盖，映射可用于回退。" },
        { title: "把插件、Skill与Automation组合", steps: ["插件只连接确实需要的应用并审查权限。", "把稳定的演示文稿或报表流程保存为 Skill，在新会话复测。", "每日简报等 Automation 先手动运行，确认输入源、失败处置和通知后再定时。"], done: "外部连接、可复用流程和定时触发各自有权限与验收记录。" }
      ],
      uniqueTechniques: [
        { title: "把每条结构化数据绑回来源文件", scenario: "图片/PDF批量抽取很容易生成看似整洁但无法审计的表格。", steps: ["输出中保留 source_file 和页码/图片名。", "无法识别的字段保留空值和原因，不让模型补猜。", "按来源抽样核对，并让总额与原始文件回算。"], result: "表格既能分析，也能回到原始证据纠错。", limitation: "OCR 对模糊票据、手写、币种和负数仍可能失败。" }
      ],
      caution: "票据、发票、邮件、云盘和日历可能含个人或财务数据，应先去敏并限制插件权限。文件移动必须先预览，避免覆盖。Computer Use 与 Automation不应获得长期无审批的支付、发送、删除或发布权限；视频中的套餐额度和模型名会变化。",
      review: formal(
        "取得 YouTube en-orig 全程自动字幕（约406 KiB）并核对票据图片→Excel、PDF发票→表格、文件夹整理、AGENTS.md、插件、Skills、Computer Use和每日简报Automation。该视频没有公开章节，使用完整字幕时间轴与画面页面核对，accessibility记2。质量总分 61.25。",
        { closure: 4, transfer: 4, completeness: 4, structure: 3, freshness: 4, accessibility: 2 }
      )
    }
  );
})();
