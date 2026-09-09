/* Claude Code 使用教程：Bilibili + YouTube。
 * 证据来自完整字幕/本地转录、关键帧 OCR、公开视频页面与 Anthropic 官方文档校准。
 */
(function () {
  "use strict";
  const root = window.TUTORIALS;
  if (!root || !root.items) throw new Error("教程主数据尚未加载");

  const formal = (notes, quality) => ({
    evidence: "E2",
    status: "formal",
    reviewedAt: "2026-07-23",
    standards: { accuracy: 2, alignment: 2, reproducibility: 2, traceability: 2, safety: 2 },
    quality,
    notes
  });

  root.meta = { version: "1.0", updatedAt: "2026-07-23" };
  root.items["claude-code"] = {
    title: "Claude Code 使用教程",
    subtitle: "从官方最佳实践，到中文完整上手、Skills、MCP 与真实项目",
    meta: "10 条教程 · Bilibili 5 + YouTube 5 · 均达到 E2 正式收录",
    overview: "本页不把 Claude Code 简化成“会写代码的聊天框”。10 条教程共同覆盖终端安装、权限模式、CLAUDE.md、上下文与会话、Git、Plan、Skills、Hooks、Subagents、MCP、IDE、网页/应用实战和非技术工作。每条资源都给出可复现步骤、完成标志、独特价值与风险边界。",
    sourceNote: "YouTube 5 条均取得全程自动字幕、公开视频元数据和章节/画面证据；Bilibili 5 条均完成全程音频转录，并以公开视频章节、说明或场景关键帧交叉复核（其中 3 条保留完整转录+OCR 证据包，2 条另以详细页面提纲和播放器画面复核）。涉及安装命令、模型名、套餐、权限和目录结构的易变事实，以访问日 2026-07-23 的 Anthropic 官方 Claude Code 文档校准。正文为原创中文重组，不复制长段字幕。",
    accessDate: "2026-07-23",
    officialSources: [
      { label: "Claude Code 功能概览", url: "https://code.claude.com/docs/en/features-overview" },
      { label: "权限配置", url: "https://code.claude.com/docs/en/permissions" },
      { label: "Hooks", url: "https://code.claude.com/docs/en/hooks" },
      { label: "Subagents", url: "https://code.claude.com/docs/en/sub-agents" },
      { label: ".claude 目录与 CLAUDE.md", url: "https://code.claude.com/docs/en/claude-directory" }
    ],
    learningPath: [
      "先看 Anthropic 的 Mastering Claude Code：完成安装、项目问答、CLAUDE.md、会话恢复、图片与 IDE 最小闭环。",
      "再看 Anthropic Best Practices 或马克的中文教程：把 Plan、验证、权限、上下文压缩、Git 和状态交接变成工作习惯。",
      "按需进入 Skills 专题、Hooks/Subagents/MCP 全景教程；只安装可审计来源，并为工具写最小权限。",
      "最后选 Traversy 的开发项目、Futurepedia 的非技术项目或 AE MCP 实战，把所学迁移到自己的真实任务。"
    ],
    resources: [
      {
        id: "bili-claude-mark-complete",
        platform: "bilibili",
        title: "Claude Code 保姆级教程：从安装到插件完整掌握",
        creator: "马克的技术工作坊",
        url: "https://www.bilibili.com/video/BV14rzQB9EJj/",
        publishedAt: "2026-01-25",
        duration: "44:44",
        audience: "希望用一条中文长教程掌握安装、权限、会话、CLAUDE.md、Hooks、Skills、Subagents 与插件的初学者",
        summary: "视频先完成 Claude Code 安装、登录与终端基本交互，再区分普通、Plan 和跳过权限检查等模式，演示 Bash、后台任务、回退、图片与 Figma MCP。中段集中处理会话恢复、上下文占用和压缩，并把项目约束沉淀到 CLAUDE.md。后段依次解释 Hook 的事件自动化、Skill 的按需工作流、Subagent 的隔离上下文和 Plugin 的打包分发，形成从一次任务到可复用 Agent 工程的完整地图。",
        coverage: [
          { title: "安装、登录与三类执行模式", steps: ["按当前官方安装页完成安装并验证版本，从目标项目目录启动。", "先在默认模式运行只读问答，再用 Plan 审查复杂任务的文件范围与步骤。", "把每次 Bash 与写文件授权当成边界；不要为省点击长期使用跳过权限检查。"], done: "能解释当前模式允许什么，且一个小任务在受控权限下完成并通过验证。" },
          { title: "会话、上下文与回退", steps: ["用 resume/历史入口恢复正确会话，先让 Claude 复述任务状态。", "观察上下文占用，长任务在压缩前记录目标、已改文件、测试和未决问题。", "误改先用内置回退或 Git diff 定位；关键节点仍以 Git 提交作为可靠恢复点。"], done: "恢复或压缩后约束没有丢失，任何重要改动都能回到已知版本。" },
          { title: "把项目知识写进 CLAUDE.md", steps: ["只写稳定的构建、测试、架构约束与禁区，长资料改成按需引用。", "在新会话检查规则是否自动加载，并让 Claude 运行基线命令。", "发现规则过期时更新文件，避免靠旧对话记忆继续工作。"], done: "新会话无需重复说明即可使用正确命令，文件仍短且可维护。" },
          { title: "扩展 Hook、Skill、Subagent 与 Plugin", steps: ["Hook 从只读日志或格式检查开始，明确事件、输入、退出码与超时。", "稳定流程做成 Skill；可独立调查交给 Subagent，并规定返回证据。", "需要组合 Skills、Hooks、Agents 或 MCP 时再用 Plugin，安装后逐项检查来源与权限。"], done: "四种扩展各有清晰职责，并各完成一次可撤销的小规模验证。" }
        ],
        uniqueTechniques: [
          { title: "压缩前写状态交接单", scenario: "长会话即将压缩或需要跨天继续，最怕目标和验证状态丢失。", steps: ["写下目标、已改文件、已跑命令与结果。", "列出未决问题、下一步和禁止事项。", "新上下文先读取交接单并复述，再继续改动。"], result: "会话压缩不再等于重新猜测项目状态。", limitation: "交接单若未随实际进度更新，也会把错误稳定带入下一阶段。" }
        ],
        caution: "视频演示的跳过权限检查参数会显著扩大风险，不应成为日常默认。Figma MCP、插件和 Hooks 都可能读取文件或执行命令；只用可信来源、固定版本并审计配置。模型名、套餐和界面以当前官方文档为准。",
        review: formal(
          "完整音频转录结合 44:44 画面与公开时间轴复核；浏览器核验视频标题、作者、日期和章节。覆盖安装登录、模式、Bash、Plan、危险权限、后台任务、Rewind、图片、Figma MCP、resume、context/compact、CLAUDE.md、Hook、Skill、SubAgent 与 Plugin。质量总分 65。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 3, accessibility: 4 }
        )
      },
      {
        id: "bili-claude-skills",
        platform: "bilibili",
        title: "手把手教你在 Claude Code 中熟练使用 Skill 技能",
        creator: "我是阿众",
        url: "https://www.bilibili.com/video/BV1BFouBYERu/",
        publishedAt: "2026-04-23",
        duration: "09:59",
        audience: "已经会基本对话，想正确安装、创建、触发和管理 Claude Code Skills 的用户",
        summary: "视频用近十分钟讲清 Skill 是包含 SKILL.md、可选参考资料、示例和脚本的能力目录，并与能同时打包 Skills、Hooks、Agents、MCP 等内容的 Plugin 区分。实操展示项目级与用户级目录、手动复制、命令行工具和插件三种安装路径；随后调用官方 Skill Creator 创建 Conventional Commits 技能，解释 description 自动匹配、手动斜杠触发、disable-model-invocation、allowed-tools、argument-hint 和 effort；最后用 /skills 与 /plugin 查看、停用和寻找技能。",
        coverage: [
          { title: "先判断该用 Skill 还是 Plugin", steps: ["单一可复用知识/流程优先 Skill；需要同时交付 Hooks、Agents、MCP 或多个 Skill 时再考虑 Plugin。", "检查目录中 SKILL.md、references、examples 和 scripts 的职责。", "把项目专用能力放项目目录，跨项目通用能力放用户目录。"], done: "能力边界和安装范围明确，没有为了一个简单流程引入整套插件。" },
          { title: "审查并安装第三方 Skill", steps: ["先看仓库来源、许可证、最近更新和全部脚本，不只看下载量。", "选择手动复制、受信 CLI 或插件安装，并记录版本/提交。", "新会话用无敏感数据的样本触发，核对它实际读取的文件与工具。"], done: "Skill 在预期范围出现并能触发，来源、版本和权限可追溯。" },
          { title: "创建并测试自己的 Skill", steps: ["用 Skill Creator 描述目标、输入、输出、成功标准和边界。", "检查生成的 SKILL.md，特别是 name、description、步骤和 allowed-tools。", "准备命中与不应命中的测试提示，观察自动触发是否准确。"], done: "新 Skill 对目标任务可复现，对无关任务不会误触发。" },
          { title: "控制触发与日常管理", steps: ["需要只手动调用时设置相应元数据，避免模型自动触发高风险流程。", "用 /skills 查看来源与启用状态，用 /plugin 管理插件携带的 Skills。", "停用或删除前确认项目级/用户级位置，防止改错同名能力。"], done: "能说明每个 Skill 来自哪里、何时触发、可用哪些工具，以及如何撤销。" }
        ],
        uniqueTechniques: [
          { title: "用正反样本测试 description", scenario: "Skill 的自动触发主要取决于简短描述，写得太宽会误触发，太窄又找不到。", steps: ["写三条应该触发的真实请求。", "写三条词汇相似但不应触发的请求。", "逐轮调整 description，直到两组样本都符合预期。"], result: "Skill 的发现逻辑从主观描述变成可回归的触发测试。", limitation: "模型与版本变化仍可能影响匹配，关键流程可改为手动调用。" }
        ],
        caution: "视频展示的第三方技能市场、npx 安装与开源仓库并不等于官方背书。安装前必须读脚本和工具声明；会执行 Git、Shell、网络或发布动作的 Skill 应限制为手动触发并保留确认。目录和元数据字段以当前官方文档为准。",
        review: formal(
          "取得 259 段完整 Whisper 转录与 74 个去重 OCR 关键帧；逐段核对 00:28 Skill、01:34 Plugin 区别、02:42 三种安装、04:48 创建、06:37 触发、08:04 管理、08:57 来源。命令与元数据由画面和官方目录文档交叉校准。质量总分 63.75。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 2 }
        )
      },
      {
        id: "bili-claude-qiu-zhi-60min",
        platform: "bilibili",
        title: "全网最全！60 分钟全面掌握 Claude Code",
        creator: "秋芝2046",
        url: "https://www.bilibili.com/video/BV1NvRyBzEhq/",
        publishedAt: "2026-05-05",
        duration: "56:08",
        audience: "非程序员或零基础用户，希望理解 Agent 原理并完成项目、Git、上下文与高级扩展全流程",
        summary: "教程先用 LLM loop 与本地 Harness 解释 Claude Code 为什么能读写文件和执行工具，再配置 IDE、安装 Claude Code 与模型。番茄钟项目贯穿 Plan、默认与自动编辑权限、依赖安装、文件引用、临时隔离问答和内置多 Agent。中段把 Git/GitHub 当作真正的版本后悔药，演示上下文占用、主动压缩、状态栏和 CLAUDE.md。后段按知识、流程、工具、混合四类讲 Skills，并继续覆盖 MCP、CLI、Subagent 等高级扩展，最后回顾完整闭环。",
        coverage: [
          { title: "理解并安装本地 Agent", steps: ["理解模型提出动作、Harness 执行工具并返回结果的循环，先确认它能接触哪些本机资源。", "安装后检查版本，从练习目录启动并完成信任提示。", "如使用第三方模型/切换工具，单独验证兼容性、凭证去向与费用。"], done: "Claude Code 能在练习目录工作，且你能说清模型、执行器和权限边界。" },
          { title: "用番茄钟项目练 Plan 与权限", steps: ["先让 Claude 提问并生成计划，审阅结构、依赖和验收。", "从默认审批开始；npm 安装等 Bash 命令逐次检查，不永久放行宽泛模式。", "运行项目并查看界面，引用具体文件修正问题。"], done: "项目能启动，关键功能可操作，依赖和文件改动均在预期范围。" },
          { title: "用 Git 建立可靠回退", steps: ["初始化 Git 并查看首次 diff，敏感文件写入忽略规则。", "在功能稳定点提交；需要远端备份时再连接 GitHub。", "回退前先保存当前状态并确认目标提交，不把推送当作自动动作。"], done: "项目有清晰提交历史，能从一次故障改动恢复到最近稳定点。" },
          { title: "管理上下文并按需扩展", steps: ["查看占用，在压缩前保存项目状态；稳定规则写入简短 CLAUDE.md。", "Skills 只在匹配任务时加载正文，避免把所有手册塞进启动上下文。", "MCP/CLI 提供工具，Subagent 做隔离调查；每项扩展先做最小调用。"], done: "新会话能恢复项目，扩展按需加载且每项能力都经过单独验证。" }
        ],
        uniqueTechniques: [
          { title: "用“知识、流程、工具、混合”给 Skill 分类", scenario: "不知道某份经验应该写进 CLAUDE.md、Skill 还是外部工具。", steps: ["纯规范与参考归为知识型。", "稳定步骤与验收归为流程型。", "需要脚本/API 的归为工具型；组合前述内容则为混合型。"], result: "大段资料从启动上下文移到按需加载的可维护模块。", limitation: "分类只是设计工具；高风险工具仍需独立权限和测试。" }
        ],
        caution: "视频中作者展示并偏好更危险的权限方式，这不适合作为通用建议；本页改按最小权限重写。第三方模型切换器、自动安装和 GitHub 绑定都会处理凭证或执行外部命令，应核验源码与官方文档，密钥不得写入仓库。",
        review: formal(
          "取得 1255 段完整 Whisper 转录、公开章节和 13 个去重关键帧。章节覆盖认识/安装/模型、番茄钟项目、权限模式、Git/GitHub、上下文、CLAUDE.md、Skills/MCP/CLI/Subagent 与复盘；对危险权限观点作了明确纠偏。质量总分 63.75。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 2 }
        )
      },
      {
        id: "bili-claude-muzi-ultimate",
        platform: "bilibili",
        title: "Claude Code 终极指南：基础、进阶与 AI Web 实战",
        creator: "木子不写代码",
        url: "https://www.bilibili.com/video/BV1TTR8BaEnL/",
        publishedAt: "2026-05-07",
        duration: "52:59",
        audience: "想从安装和权限一路走到 Tools、Hooks、Skills、Subagents，并做出完整网页应用的学习者",
        summary: "视频以基础、进阶、实战三段组织内容：基础段安装 Claude Code、配置模型/供应方式、认识项目与权限；进阶段拆解 Plugins、内置 Tools、Hooks、Skills 和 Subagents 的职责与组合；实战段让 Claude 规划并生成一个 AI Web 应用，再通过运行、预览、反馈和修复完成闭环。重点不是一次提示生成代码，而是先给上下文和验收，允许 Agent 调工具，再用可观察结果迭代。",
        coverage: [
          { title: "完成安装与安全配置", steps: ["按官方方式安装并验证版本，从独立练习项目启动。", "如接第三方模型服务，确认端点、计费、日志和密钥存储；不要照抄来源不明配置。", "从默认权限开始，检查读写目录与每条 Shell 命令。"], done: "基础会话可运行，凭证未进代码库，权限范围可解释。" },
          { title: "理解扩展能力的协作", steps: ["Tools 是单次可执行能力；Hook 绑定生命周期事件。", "Skill 保存可复用工作流；Subagent 用独立上下文处理边界清楚的子任务。", "Plugin 用于组合分发多种能力；为每类扩展写输入、输出、失败和超时条件，再做最小测试。"], done: "能根据问题选择扩展类型，而不是把所有能力堆进一个提示。" },
          { title: "规划 AI Web 应用", steps: ["先明确用户、页面、数据流、模型调用和完成标准。", "让 Claude 输出文件与实施计划，人工检查依赖、API 边界和敏感信息。", "分阶段实现静态界面、核心交互和真实模型连接。"], done: "应用结构与数据边界明确，前端在没有真实密钥时也能先验证。" },
          { title: "运行、预览与修复", steps: ["运行 lint、测试和开发服务器，记录真实输出。", "在浏览器检查主要流程、错误状态和窄屏布局，把截图/报错反馈给 Claude。", "修复后重复相同验证，并查看 Git diff。"], done: "核心流程、失败状态和响应式布局均通过可重复检查。" }
        ],
        uniqueTechniques: [
          { title: "把扩展能力写成同一张契约表", scenario: "Tools、Hooks、Skills、Subagents 混用时，失败责任很难定位。", steps: ["为每个扩展记录触发条件与输入。", "记录可用工具、超时、输出和失败处置。", "逐个验证后再组合进实战。"], result: "复杂 Agent 流程可拆解、可测试，也更容易撤销。", limitation: "组合后的交互仍可能产生新风险，需要端到端测试。" }
        ],
        caution: "第三方模型配置可能暴露提示、代码和密钥；只有明确数据处理条款时才使用。Hooks 和 Subagents 能并行执行命令，必须限制路径、网络和并发。AI Web 应用的客户端不得包含服务端 API 密钥。",
        review: formal(
          "Groq 完成 743 段全程转录；浏览器另核验公开页面标题、木子不写代码作者、2026-05-07 日期、53:00 播放器与三段详细说明：安装/第三方模型/权限，Plugins/Tools/Hooks/Skills/Subagents，以及 AI Web App 实战。关键专有名词与权限规则按官方文档复核。质量总分 62.5。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 1 }
        )
      },
      {
        id: "bili-claude-ae-mcp",
        platform: "bilibili",
        title: "Claude Code + AE MCP：用 AI 自动生成表达式与自适应动画",
        creator: "YTBeer",
        url: "https://www.bilibili.com/video/BV1XZ9iBoE6Y/",
        publishedAt: "2026-05-01",
        duration: "12:00",
        audience: "熟悉 After Effects，希望让 Claude Code 生成表达式并控制合成的动效设计师",
        summary: "视频先解释 MCP 是 Claude Code 与 After Effects 之间的桥梁，再准备 Claude Code、AE 与第三方 AE MCP 项目，通过项目脚本和 AE 内桥接面板建立连接。实操用自然语言生成太阳升起等场景、运动图形和表达式，并让 Claude 在 AE 中迭代；也展示不连接 MCP 时只生成表达式再手动复制的降级路径。最后处理嵌套属性等桥接限制，强调复杂效果仍需 AE 经验和人工预览。",
        coverage: [
          { title: "审查并准备 AE MCP", steps: ["确认 Claude Code 与 AE 可用，先备份当前工程。", "打开第三方 MCP 仓库，阅读 README、安装脚本、许可证与所需端口/权限。", "固定可信版本并在测试目录运行安装脚本。"], done: "依赖来源和版本已记录，测试工程可安全回退。" },
          { title: "建立 Claude Code—AE 桥接", steps: ["启动 MCP server，再在 AE 中打开相应桥接面板/脚本。", "在 Claude Code 中注册服务器并新开会话。", "先查询合成列表或创建一个空图层，验证双向通信。"], done: "Claude 能读取 AE 状态并完成一个无破坏的最小动作。" },
          { title: "生成场景与表达式", steps: ["用自然语言写清合成、图层、属性、时长和视觉目标。", "先生成简单太阳升起或文字抖动，逐项检查关键帧与表达式。", "复杂动画分层迭代，遇到嵌套属性错误时缩小到具体属性。"], done: "AE 预览可播放，表达式无报错，修改只影响目标图层。" },
          { title: "保留无 MCP 的降级路径", steps: ["连接不稳定时让 Claude 只输出表达式与应用位置。", "人工复制到 AE，核对图层名和属性类型。", "保存版本并渲染短预览后再扩展。"], done: "即使桥接失败，仍能以可审查的表达式完成任务。" }
        ],
        uniqueTechniques: [
          { title: "先做只读/单图层握手", scenario: "第三方 MCP 一连上就让 Agent 改整份 AE 工程，失败成本很高。", steps: ["先查询合成与图层列表。", "再在测试合成创建一个临时图层。", "确认状态回读与撤销都正常后才操作正式合成。"], result: "连接、权限与对象映射在低风险动作中得到验证。", limitation: "握手成功不代表复杂嵌套属性都受支持。" }
        ],
        caution: "视频明确使用非 Adobe 官方的 AE MCP；安装脚本和桥接器能控制创作软件，必须审查源码、固定版本并先备份工程。Claude 生成的表达式可能低效或引用错误属性，最终以 AE 报错、预览和渲染结果为准。",
        review: formal(
          "取得 333 段完整 Whisper 转录与 14 个去重 OCR 关键帧；核对 MCP 概念、第三方 GitHub 项目、安装脚本、AE 桥接面板、太阳升起场景、表达式自动应用、无 MCP 复制路径及嵌套属性限制。质量总分 61.25。",
          { closure: 4, transfer: 4, completeness: 4, structure: 3, freshness: 4, accessibility: 2 }
        )
      },
      {
        id: "yt-claude-anthropic-best-practices",
        platform: "youtube",
        title: "Claude Code best practices | Code w/ Claude",
        creator: "Anthropic",
        url: "https://www.youtube.com/watch?v=gv0WHhKelSE",
        publishedAt: "2025-07-31",
        duration: "25:53",
        audience: "已经开始使用 Claude Code，想按官方团队经验提升搜索、规划、验证和长任务交接质量的开发者",
        summary: "Anthropic 工程师解释 Claude Code 不预先索引仓库，而用 Agent 搜索按需理解代码；建议用简短 CLAUDE.md 固化常用命令和风格。核心工作法是先探索和计划，再用 Todo 推进；用测试、截图、lint 和真实运行给 Agent 闭环反馈；复杂问题明确要求更深思考。视频还展示 IDE 集成、多个并行实例，以及把当前状态写进文件后交给新会话继续的长任务策略。",
        coverage: [
          { title: "让 Agent 主动搜索代码库", steps: ["从仓库根目录提问架构和相关文件，要求引用路径。", "让 Claude 用搜索工具定位实现，不把整个仓库一次性粘进上下文。", "核对它选择的入口与调用链，再决定改动范围。"], done: "计划中的每个关键文件都有仓库证据，而非凭文件名猜测。" },
          { title: "用 CLAUDE.md 与 Plan 建立方向", steps: ["把测试、格式化和重要约定写进简短 CLAUDE.md。", "复杂任务先探索并形成计划/待办，人工调整顺序与边界。", "执行中持续更新 Todo，避免遗漏验证。"], done: "新会话能找到正确命令，执行进度与原计划可对照。" },
          { title: "给 Claude 可观察反馈", steps: ["实现后运行测试、lint 和类型检查。", "界面任务提供截图或让 Agent 用浏览器检查。", "失败时反馈原始输出，修复后重复同一验证。"], done: "“完成”由真实工具结果证明，不只是 Claude 的文字声明。" },
          { title: "并行与状态交接", steps: ["独立调查可开并行实例，写任务避免改同一文件。", "长会话结束前把状态写入项目内临时交接文件。", "新会话先读交接文件、Git diff 和测试结果再继续。"], done: "并行任务没有文件冲突，新会话能准确复述剩余工作。" }
        ],
        uniqueTechniques: [
          { title: "用仓库内状态文件接力会话", scenario: "上下文即将耗尽，但任务尚未完成。", steps: ["记录当前目标、决策和已改文件。", "附上命令输出、失败点和下一步。", "在新会话只加载状态文件与必要代码，再复核后继续。"], result: "交接状态可版本化、可审阅，比依赖聊天压缩更可靠。", limitation: "临时状态可能包含敏感信息，完成后应清理或移出提交。" }
        ],
        caution: "这是 2025 年官方演讲，核心方法仍适用，但命令、界面与模型已经变化。并行实例会共享外部服务并可能写冲突；状态文件避免写密钥。要求“深度思考”不能替代测试和人工审查。",
        review: formal(
          "取得 YouTube en-orig 全程自动字幕并逐段核对 agentic search、CLAUDE.md、计划/Todo、测试与截图反馈、深度思考、IDE、并行实例和状态文件交接；以 2026-07-23 官方文档校准易变语法。质量总分 63.75。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 2, accessibility: 4 }
        )
      },
      {
        id: "yt-claude-anthropic-mastering",
        platform: "youtube",
        title: "Mastering Claude Code in 30 minutes",
        creator: "Anthropic",
        url: "https://www.youtube.com/watch?v=6eBSHbLKuN0",
        publishedAt: "2025-05-22",
        duration: "28:07",
        audience: "希望从官方演示快速完成安装、代码库问答、工具调用、CLAUDE.md、会话与 IDE 的开发者",
        summary: "官方团队从安装与启动讲起，让 Claude 对现有项目做代码库问答，并解释它如何通过 CLI 工具与 MCP 扩展行动能力。教程展示 CLAUDE.md 的层级与上下文用途、Esc 中断、历史回退、resume/continue 恢复会话、图片输入和 IDE 配合。重点是把 Claude Code 置于真实仓库，让它引用代码、运行命令和观察结果，而不是在无项目上下文的对话里生成孤立代码。",
        coverage: [
          { title: "安装并进入真实仓库", steps: ["按当前官方方式安装，检查版本和登录状态。", "从目标仓库根目录启动，先问项目结构、入口和测试命令。", "运行基线测试并记录现状。"], done: "Claude 能引用正确文件，基线结果在改动前已保存。" },
          { title: "认识工具与 MCP", steps: ["观察 Claude 使用搜索、读取、编辑与 Shell 工具的过程。", "只有确有外部系统需求时才添加 MCP，并阅读服务器配置。", "新会话先做只读最小调用，再批准写操作。"], done: "内置与外部工具边界清楚，MCP 调用可追踪且权限最小。" },
          { title: "分层维护 CLAUDE.md", steps: ["把全局个人偏好、项目规则和子目录规则放到合适层级。", "只保留稳定、频繁需要的命令与约束。", "新会话让 Claude 复述已加载规则并运行一条基线命令。"], done: "规则在正确目录生效，没有用一个超长文件覆盖所有场景。" },
          { title: "控制和恢复会话", steps: ["输出偏离时用 Esc 中断，再补足约束。", "用历史/回退检查先前提示与改动；退出后用 resume 或 continue 恢复。", "需要视觉上下文时粘贴图片，并同时说明预期与验收。"], done: "能中断错误路径、恢复正确会话，并用文件/图片证据继续任务。" }
        ],
        uniqueTechniques: [
          { title: "把规则放在最窄有效层级", scenario: "大型仓库不同目录有不同命令和约定。", steps: ["全局只放个人通用偏好。", "仓库根放全项目命令。", "子目录放局部框架或测试规则，并在对应目录开启新会话验证。"], result: "规则不会污染无关任务，也减少互相冲突。", limitation: "层级过多会增加维护成本，应定期去重。" }
        ],
        caution: "官方视频较早，安装命令、会话 UI 和 CLAUDE.md 行为应以当前文档为准。MCP 会扩大数据访问；图片可能包含敏感信息。resume 前确认目标仓库与分支，避免在错误状态继续写入。",
        review: formal(
          "取得 YouTube en-orig 全程自动字幕，核对安装、项目问答、CLI/MCP 工具、CLAUDE.md 层级、Esc/历史/resume/continue、图片和 IDE；官方一手来源，旧语法以当前文档校准。质量总分 62.5。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 2, accessibility: 3 }
        )
      },
      {
        id: "yt-claude-tech-with-tim-full-course",
        platform: "youtube",
        title: "Claude Code - Full Tutorial for Beginners",
        creator: "Tech With Tim",
        url: "https://www.youtube.com/watch?v=ntDIxaeo3Wg",
        publishedAt: "2026-02-27",
        duration: "35:48",
        audience: "需要系统掌握安装、编辑器、命令、Plan、模型、Git、CLAUDE.md、Tasks 与 Skills 的编程初学者",
        summary: "视频依次完成环境与编辑器准备、Claude Code 安装和基础对话，解释常用命令、权限模式和快捷键；随后用 Plan 先审复杂改动，说明模型与成本选择，再把 Git 提交纳入工作流。后半用 CLAUDE.md 保存项目规则，演示 Tasks 拆分长工作，并把稳定流程沉淀成 Skills。整体适合作为从首次启动到可维护仓库工作的连续课程。",
        coverage: [
          { title: "准备环境并完成首次会话", steps: ["检查终端、Git、编辑器和项目依赖，再按官方安装方式安装。", "从练习仓库启动，确认信任目录和默认权限。", "先做只读问答和一个小改动，查看 diff。"], done: "Claude Code、编辑器和 Git 都指向同一项目，小改动可运行并可撤销。" },
          { title: "命令、快捷键与 Plan", steps: ["熟悉帮助、状态、清理/压缩、会话和模式命令。", "复杂任务切到 Plan，要求列文件、风险、测试与完成标准。", "审阅计划后再执行，偏离时中断而非继续追加模糊提示。"], done: "能主动控制会话和模式，计划得到人工批准后才写代码。" },
          { title: "模型、成本与 Git", steps: ["按任务难度选模型/思考强度，简单任务不必最高成本。", "改动前确认分支和基线，完成后查看 diff、跑测试。", "只提交与任务相关文件，推送和发布保留人工确认。"], done: "结果有测试和清晰提交，成本选择与任务难度匹配。" },
          { title: "从 CLAUDE.md 到 Tasks/Skills", steps: ["稳定项目规则写 CLAUDE.md。", "长任务拆为可验证 Tasks，每个任务有输入与完成标志。", "反复成功的任务再做成 Skill，并用新样本复测。"], done: "规则、一次任务计划和复用流程各自存放，不依赖单一长会话。" }
        ],
        uniqueTechniques: [
          { title: "按任务成本选择模型与思考强度", scenario: "所有任务都用最强配置会浪费额度，过低配置又容易返工。", steps: ["把任务分为机械修改、常规实现和架构/调试。", "从匹配的最低档开始并设验证。", "只有验证失败或复杂度上升时升级。"], result: "用验证结果驱动算力升级，而不是固定使用最高档。", limitation: "产品模型名和计费会变化，不能照搬视频数值。" }
        ],
        caution: "模型名、套餐和快捷键会变化；成本建议只保留方法，不采用视频中的具体价格。Skills 或 CLAUDE.md 中不要写密钥。Git 提交不是代码正确性的证明，仍要运行测试和人工 review。",
        review: formal(
          "取得 YouTube en-orig 全程自动字幕和公开章节，核对 setup/dependencies/editor、basics、commands/modes/shortcuts、Plan、model selection、Git、CLAUDE.md、Tasks 与 Skills。质量总分 63.75。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 2 }
        )
      },
      {
        id: "yt-claude-traversy-crash-course",
        platform: "youtube",
        title: "Claude Code Crash Course For Developers",
        creator: "Traversy Media",
        url: "https://www.youtube.com/watch?v=C2GpeepcmYs",
        publishedAt: "2026-06-22",
        duration: "1:03:23",
        audience: "想在现有项目中实练权限、Plan、CLAUDE.md、Skill、Playwright MCP 与代码审查 Subagent 的开发者",
        summary: "课程先细讲 allow/ask/deny 权限规则，再进入一个已有项目，用 /init 生成 CLAUDE.md，查看上下文与会话日志。主项目先重构加密货币 CLI，再规划并添加收藏功能；之后创建项目级 Skill，把重复任务固定下来。最后注册 Playwright MCP 进行浏览器验证，并建立专门 code reviewer Subagent。超过一小时的长度让读者能看到真实改动、运行、失败和复核，而不只是功能清单。",
        coverage: [
          { title: "配置 allow / ask / deny", steps: ["列出项目需要的只读、写入和 Shell 行为。", "低风险确定动作放 allow，高风险或外部动作保持 ask，敏感路径和命令放 deny。", "用无害命令测试三条规则，确认匹配顺序。"], done: "权限配置能允许必要工作、拦截禁区，并对危险动作提问。" },
          { title: "初始化并理解现有项目", steps: ["从干净分支启动，运行 /init 后人工精简 CLAUDE.md。", "让 Claude 解释架构并引用文件，查看上下文和会话日志。", "运行现有测试/CLI，记录基线。"], done: "项目规则准确，Claude 的架构说明可回到代码，基线已保存。" },
          { title: "Plan 重构与新增功能", steps: ["重构前先 Plan 文件边界、兼容性和测试。", "分步修改 CLI，再为收藏功能定义数据与用户流程。", "每阶段运行命令和测试，查看 diff 后提交。"], done: "重构不破坏原功能，收藏功能有独立验证和清晰提交。" },
          { title: "Skill、Playwright MCP 与 reviewer Subagent", steps: ["把项目重复流程做成项目级 Skill。", "安装 Playwright MCP 后新开会话，先访问本地页并截图。", "建立只读 code reviewer Subagent，要求返回文件、行号、严重度和理由。"], done: "Skill 可复现，浏览器证据可查看，审查报告可定位且没有直接改代码。" }
        ],
        uniqueTechniques: [
          { title: "把代码审查隔离为只读 Subagent", scenario: "主会话刚写完代码，容易延续原有假设并漏看问题。", steps: ["给审查 Agent 独立上下文和只读工具。", "要求按文件/行号返回证据与严重度。", "主会话逐项复现，确认后再修复。"], result: "作者与审查者上下文分离，问题更容易被独立发现。", limitation: "Subagent 仍使用模型判断，不能代替测试、静态分析与人工审查。" }
        ],
        caution: "权限通配规则很容易写宽；尤其不能把 git push、删除和网络请求长期自动允许。Playwright MCP 能操作已登录浏览器，先用隔离配置。Subagent 的结论需要复现，项目 Skill 也应随代码变化更新。",
        review: formal(
          "取得 YouTube en-orig 全程自动字幕和章节，逐段核对 permissions allow/ask/deny、现有项目、/init、CLAUDE.md、context/session logs、Plan 重构与功能、项目 Skill、Playwright MCP（重启/新会话）和 reviewer Subagent。质量总分 66.25。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 3 }
        )
      },
      {
        id: "yt-claude-futurepedia-nontechnical",
        platform: "youtube",
        title: "Full Claude Code Tutorial for Non-Technical Beginners in 2026",
        creator: "Futurepedia",
        url: "https://www.youtube.com/watch?v=bqJzIWAEn40",
        publishedAt: "2026-04-30",
        duration: "40:52",
        audience: "不以编程为职业，想用 Claude Code 制作游戏、网站、扩展、自动化和移动应用的用户",
        summary: "视频用六个项目带非技术用户理解 Claude Code：小游戏和网站建立文件/预览/迭代基本循环；Chrome 扩展引入浏览器安装与权限；自动化项目连接 MCP/工具；带视觉/API 的卡路里应用练移动响应和外部服务；最后通过 GitHub 和部署交付。课程不断回到 Plan、上下文、CLAUDE.md、并行会话、Skills/Plugins 和安全审查，强调“能生成”不等于可以不验证。",
        coverage: [
          { title: "用小项目学 Plan 与迭代", steps: ["为小游戏或静态站创建独立目录，写清目标、素材和完成标准。", "先 Plan 页面与文件，再生成并本地预览。", "把具体截图、浏览器错误和交互反馈给 Claude，逐轮修正。"], done: "项目在本地可打开，核心交互与窄屏布局经人工验证。" },
          { title: "制作 Chrome 扩展", steps: ["明确最小权限、页面和数据流，让 Claude 生成 manifest 与源码。", "用开发者模式加载未打包扩展，检查控制台与权限提示。", "测试无数据、错误和卸载场景，不直接发布。"], done: "扩展在测试配置中工作，所请求权限与实际功能一致。" },
          { title: "连接 MCP、API 与视觉能力", steps: ["只选择必要工具，凭证放环境变量。", "先用假数据验证流程，再连接真实 API/MCP。", "检查网络失败、额度、上传图片隐私和响应式界面。"], done: "外部调用有失败处理，密钥不在客户端或仓库，数据范围明确。" },
          { title: "GitHub、部署与安全复核", steps: ["提交前查看 diff、忽略密钥和生成物，运行测试。", "推送到新仓库后，用受控环境变量部署预览。", "让 Claude 做安全检查，但人工复核权限、依赖和公开 URL。"], done: "公开版本不含秘密，主要功能、权限和错误状态均经过部署后检查。" }
        ],
        uniqueTechniques: [
          { title: "用项目梯度逐步扩大权限", scenario: "非技术用户容易一开始就连接账号、API 和部署，难以定位风险。", steps: ["先做完全本地的小项目。", "再增加浏览器扩展等有限权限。", "最后才接 API、MCP、GitHub 与部署，每层独立验收。"], result: "能力和风险同步递增，出错时能回到上一层。", limitation: "示例成功不代表生产安全，真实用户数据需要额外合规评估。" }
        ],
        caution: "无代码门槛不代表无安全责任。Chrome 扩展、MCP、API、GitHub 和部署会把本地任务扩大到真实账号与公开网络；密钥只能放安全存储，发布前检查依赖、许可证、数据收集和权限。视频中的平台入口与额度会变化。",
        review: formal(
          "取得 YouTube en-orig 全程自动字幕与公开章节，核对六个项目、Plan/iterate/context/CLAUDE.md、parallel sessions、MCP/tools、API key、GitHub/deploy、Skills/Plugins 与 security review。质量总分 63.75。",
          { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 4, accessibility: 2 }
        )
      }
    ]
  };
})();
