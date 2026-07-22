/* AI 软件使用教程
 *
 * 和概念深读页分开：DEEPDIVE 解释“为什么”，TUTORIALS 解决“怎么上手”。
 * 每条资源先还原完整教学路径，再提炼相对其他资源独有、可复现的技巧。
 */
window.TUTORIALS = {
  meta: { version: "0.3", updatedAt: "2026-07-21" },

  /* 评分块 review（TUTORIALS.md 三层审核落到数据，由 tools/validate-tutorials.js 强制校验）：
   *   evidence : "E0"|"E1"|"E2"|"E3"          —— 第一层证据等级
   *   status   : "formal"|"candidate"          —— 最终状态；formal 须过全部三层
   *   standards: {accuracy,alignment,reproducibility,traceability,safety} 各 0|1|2（第二层，正式收录须全 2）
   *   quality  : {closure,transfer,completeness,structure,freshness,accessibility} 各 0-4 级（第三层，权重 20/15/15/10/5/5，换算满分 70，正式收录须 ≥53）
   *   candidate 可暂缺 standards/quality（记为 null）。 */

  platforms: [
    { id: "bilibili", label: "Bilibili", emoji: "📺", color: "#d86b91" },
    { id: "xiaohongshu", label: "小红书", emoji: "📕", color: "#d85e5e" },
    { id: "youtube", label: "YouTube", emoji: "▶️", color: "#d45d5d" },
    { id: "github", label: "GitHub", emoji: "🐙", color: "#8b94a8" },
    { id: "articles", label: "文章与文档", emoji: "📫", color: "#6b8cbe" }
  ],

  items: {
    codex: {
      title: "Codex 使用教程",
      subtitle: "从安装、任务规划到扩展与真实项目验证",
      meta: "5 个 Bilibili 教程 · 逐项重写 2026-07-21 · 操作细节经当前官方资料校准",
      overview: "这里不再用几句观点代替教程。每个视频先按实际教学主题说明要做什么、怎么做以及做到什么算完成；然后再提炼它相对另外四个视频最独特的工作方法。平台通过左侧栏切换，视频卡片可折叠，新增平台不会把读者推到页面底部。",
      sourceNote: "视频内容依据公开视频页面、简介、章节或选集标题与演示主题提炼，并非逐字字幕。为了让操作能够真正执行，Codex 的安装、配置、Memory、Skills、Plugins、MCP、第三方与本地模型部分使用 2026-07-21 的 OpenAI 官方资料校准；界面入口和兼容性仍可能随版本变化。第三方下载、中转服务与模型端点需自行核验隐私、费用和凭证风险。",
      accessDate: "2026-07-21",
      officialSources: [
        { label: "Codex Best practices", url: "https://learn.chatgpt.com/guides/best-practices" },
        { label: "Memories", url: "https://learn.chatgpt.com/docs/customization/memories" },
        { label: "Build skills", url: "https://learn.chatgpt.com/docs/build-skills" },
        { label: "Model Context Protocol", url: "https://learn.chatgpt.com/docs/extend/mcp" },
        { label: "Advanced configuration", url: "https://learn.chatgpt.com/docs/config-file/config-advanced" }
      ],
      learningPath: [
        "第一次使用：先看完整教程，完成安装、登录、仓库规则、计划、验证、Memory、Skill 和 MCP 的最小闭环。",
        "已经能运行 Codex：学习 Annotate、Fork、Archive 和 Plan，把一次对话升级成可分支、可反馈、可收尾的任务。",
        "确有成本、隐私或模型选择需求：再学习第三方 API 与 Ollama／llama.cpp，本地或替代模型必须重新做仓库级能力测试。",
        "最后用 C++／Qt 贪吃蛇项目检验：环境能否构建、Codex 能否分步实现、错误能否被修复、结果能否复现。"
      ],
      resources: [
        {
          id: "bili-codex-complete-2026",
          platform: "bilibili",
          title: "Codex 保姆级完整教程：从安装到 Skills 与 MCP",
          creator: "编程大佬陈悠秀",
          url: "https://www.bilibili.com/video/BV1BVEs6LENZ/",
          publishedAt: "2026-06-07",
          duration: "1:34:36（11 节）",
          audience: "第一次系统使用 Codex，希望把全部基础能力实际走一遍的读者",
          summary: "这是一条全景式入门路线：先准备运行环境并安装、登录 Codex，再认识对话、文件修改、命令执行和审批等核心模块；随后学习怎样用明确提示和计划模式控制大型修改，用 Git 与审查保护代码，用 Memory 和 AGENTS.md 保存不同层级的长期信息；最后把稳定流程做成 Skill，把外部工具接成 MCP，并理解插件与自动化分别解决分发和重复执行问题。下面将 11 个章节还原成 10 组可完成的操作。",
          coverage: [
            { title: "前置准备", steps: ["确认项目能在本机独立运行，并记录构建、测试和启动命令；否则 Codex 无法判断改动是否成功。", "安装 Git；若走 CLI 路线再准备 Node.js 与 npm。进入项目目录执行 git status，先提交或备份已有工作。", "在项目根目录准备 AGENTS.md：至少写目录结构、运行命令、代码规范、禁止修改项和验收标准。没有该文件时，可在 CLI 用 /init 生成骨架后再人工补全。"], done: "Codex 打开的正是目标仓库，git status 可读，项目基线命令能够运行。" },
            { title: "安装与首次启动", steps: ["CLI 可执行 npm install --global @openai/codex；桌面端或 IDE 用户则安装对应官方客户端／扩展。", "运行 codex，选择 Sign in with ChatGPT；也可执行 codex login 后完成浏览器登录。", "用 codex --version 和 codex login status 检查安装与认证，再从项目根目录启动会话。"], done: "能在正确目录进入 Codex，且它可读取仓库、回答项目结构问题。" },
            { title: "功能模块", steps: ["先让 Codex只读扫描仓库并复述入口文件、依赖、测试与风险点，验证上下文是否正确。", "再给一个小任务，观察它读取文件、修改文件、运行命令、请求审批、返回差异与验证结果的完整循环。", "在提交前打开 diff／Review 面板逐块检查；发现问题时直接对具体改动给反馈，再让 Codex 修正。"], done: "你能区分对话结论、真实文件改动、终端执行结果和待审批动作，而不是只看最终回复。" },
            { title: "控制与引导", steps: ["提示中写清 Goal、Context、Constraints 和 Done when，例如目标功能、相关目录、不可改接口以及必须通过的测试。", "用文件引用或明确路径限制阅读范围；涉及删除、联网、密钥或大规模改动时先要求说明影响。", "运行中发现方向错误就立即补充约束；把新的长期仓库规则写回 AGENTS.md，不要只留在本次聊天。"], done: "Codex 能复述目标与边界，最终报告逐条对应验收条件。" },
            { title: "计划模式", steps: ["复杂任务先输入 /plan 或用 Shift+Tab 进入 Plan mode。", "要求计划列出要检查和修改的文件、依赖关系、测试方式、风险与需要你决定的问题。", "审核计划：删掉越界工作、补上遗漏验收项；确认后再切回执行，让 Codex 按阶段实现并在每阶段验证。"], done: "编码开始前已有可审查的文件级计划，执行后能逐项对照，而不是边猜边改。" },
            { title: "代码管理", steps: ["任务开始前创建分支或独立 worktree，并留下干净基线提交。", "每完成一个可运行的小阶段就检查 git diff，运行相关测试；稳定后提交一个语义清晰的 commit。", "出错时优先根据 diff 定位并回退单个块或文件；不要把无关的用户改动一起覆盖。"], done: "每个阶段都可从 Git 恢复，最终提交只包含本任务文件且测试结果可追溯。" },
            { title: "记忆系统", steps: ["桌面端打开 Settings > Personalization > Enable memories，或在 config.toml 写入 [features] 下 memories = true。", "在会话中输入 /memories，分别决定本会话是否读取旧记忆、是否可成为未来记忆来源。", "个人偏好可交给 Memory；必须执行的团队规则放进仓库 AGENTS.md。不要依赖 Memory 保存密钥，也不要假设聊天结束后会立即生成记忆。"], done: "新会话能复用允许保存的个人上下文，而换成员或关闭 Memory 时，仓库关键规则仍由 AGENTS.md 生效。" },
            { title: "插件与自动化", steps: ["需要现成外部能力时从 Plugins 目录安装插件；插件可以打包 Skills、连接器或 MCP 能力。", "重复且稳定的任务先在普通会话测试提示，再创建 Scheduled task，明确频率、项目、运行位置和输出。", "会修改代码的后台任务优先放到 worktree；先审查前几次运行，再决定是否长期启用。"], done: "插件确实提供了所需工具；自动化每次运行都有固定输入、隔离位置、结果入口和失败处理方式。" },
            { title: "Skills", steps: ["选择一个反复出现的单一工作，例如发布前检查；写清输入、步骤、输出、必做项与禁止项。", "用 $skill-creator 生成，或在 .agents/skills/<name>/SKILL.md 写 name、description 和操作指令；description 要能准确触发。", "用真实任务测试自动触发与 $技能名 显式触发，修正漏步骤后再提交到仓库；需要跨团队安装时再打包为插件。"], done: "同类任务无需重复长提示，Skill 每次都产出相同结构且不会误触发无关任务。" },
            { title: "MCP", steps: ["先明确缺少的外部上下文或动作，例如文档检索、浏览器或 Figma；不要为已有本地能力重复接入。", "桌面端在 Settings > MCP servers 添加 STDIO 命令或 Streamable HTTP URL；CLI 也可用 codex mcp add <name> -- <command>。", "重启客户端，输入 /mcp 或运行 codex mcp list 查看连接；用一个只读小请求确认工具可发现、参数正确，再决定写操作的审批策略。"], done: "服务器处于 connected，Codex 能调用目标工具并返回可核验结果，失败时能定位到启动、认证或权限层。" }
          ],
          uniqueTechniques: [
            { title: "把“全功能参观”变成一套仓库上手验收表", scenario: "最适合第一次把 Codex 引入真实项目，而不是看完视频后只记住功能名。", steps: ["按视频顺序建立十项清单：安装、读仓库、小改动、Plan、Git、Memory、Plugin／自动化、Skill、MCP。", "每项都在同一个练习仓库留下证据：命令输出、diff、commit、AGENTS.md、Skill 文件或 MCP 状态。", "只有当前一项达到上面的“完成标志”才进入下一项；失败就记录是环境、权限、提示还是模型能力问题。"], result: "最终得到的是一个可运行、可回退、带规则与扩展的 Codex 样板仓库，而不是一页功能名词笔记。" }
          ],
          caution: "覆盖很广，适合作为主目录；视频中的按钮位置、模型名和额度可能变化，本页已按 2026-07-21 官方资料校准操作。",
          review: {
            evidence: "E1",
            status: "candidate",
            reviewedAt: "2026-07-21",
            standards: null,
            quality: null,
            notes: "证据来自视频页面/简介/章节·选集标题与演示主题，非逐段观看或字幕；部分步骤经 2026-07-21 官方资料校准补全而非从画面提取。按 TUTORIALS.md 保守定 E1、暂列候选，需完整观看补足证据升 E2 后方可评分转正式收录。"
          }
        },
        {
          id: "bili-codex-zero-to-one",
          platform: "bilibili",
          title: "Codex 从 0 到 1：Annotate / Fork / Archive / Plan / Plugin / Skill",
          creator: "马克的技术工作坊",
          url: "https://www.bilibili.com/video/BV1c9EK6KEW4/",
          publishedAt: "2026-06-08",
          duration: "58:37",
          audience: "已完成安装，希望管理复杂任务、并行方案和可复用流程的用户",
          summary: "这条视频不再重复基础安装，而是围绕一个任务的生命周期展开：先用 Plan 明确修改范围；在 diff 上 Annotate，把反馈绑定到具体代码；当存在两种实现路线时 Fork 当前上下文并行试验；把完成或暂停的聊天 Archive；最后把验证过的做法做成 Skill，并在需要连接外部服务或团队分发时组合进 Plugin。",
          coverage: [
            { title: "Plan：先冻结问题与验收", steps: ["切到 Plan mode，让 Codex 只调查不修改。", "要求输出受影响文件、方案选项、风险、测试和待确认问题。", "你确认选项与验收条件后才允许实现。"], done: "计划中的每个步骤都能对应到文件或检查命令。" },
            { title: "Annotate：对着差异反馈", steps: ["实现后打开 diff／Review 面板，定位到错误的具体行或代码块。", "写清“现状为什么错、期望行为是什么、如何验证”，把批注送回当前任务。", "让 Codex只修批注涉及的范围，再次查看差异和测试。"], done: "反馈不再是笼统的“改好一点”，每条批注都被修复或明确解释。" },
            { title: "Fork：保留上下文做 A／B 方案", steps: ["在架构选择或修复路线不确定时，从已有任务执行 Fork。", "原任务保留方案 A，新分支明确只探索方案 B，并给两边相同验收命令。", "比较 diff 大小、测试、性能和维护成本，选择一个继续；不要把两个方案未经审查地混合。"], done: "两个方案共享问题背景但拥有独立改动，可用同一标准比较。" },
            { title: "Archive：完成任务的收尾", steps: ["确认最终结果已提交或结论已记录。", "把已完成、重复或明确暂停的任务归档，保留仍需要跟进的任务。", "需要恢复时从 Settings 的 Archived chats 查找并取消归档。"], done: "活跃任务列表只保留当前工作，历史任务仍可检索。" },
            { title: "Plugin 与 Skill：从一次成功到重复成功", steps: ["先把重复流程写成聚焦的 Skill，并用真实输入验证。", "需要给团队安装、同时携带多个 Skills 或连接器时，再创建 Plugin 作为分发包。", "安装后用显式调用测试触发、工具权限和输出格式，再开放自动选择。"], done: "工作流可重复执行；Skill 负责怎么做，Plugin 负责把流程与连接能力安装和分发。" }
          ],
          uniqueTechniques: [
            { title: "Fork + Annotate 的双路线评审", scenario: "适合重构、框架选择、性能修复等无法仅靠讨论决定的任务。", steps: ["先用 Plan 固定共同验收标准。", "Fork 后让 A 方案追求最小改动，让 B 方案追求长期结构；两边都必须运行同一组测试。", "分别在 diff 上 Annotate 风险点，让两个分支各修一轮。", "按通过率、改动面、复杂度和回退成本打表，只合入胜出的方案，归档另一分支。"], result: "架构选择有可运行证据，主任务不会被试验性代码和反复讨论污染。" }
          ],
          caution: "功能名称和入口会随客户端更新；稳定价值在于计划、行级反馈、上下文分支、任务归档和流程复用。",
          review: {
            evidence: "E1",
            status: "candidate",
            reviewedAt: "2026-07-21",
            standards: null,
            quality: null,
            notes: "证据来自视频页面/简介/章节·选集标题与演示主题，非逐段观看或字幕。按 TUTORIALS.md 保守定 E1、暂列候选，需完整观看补足证据升 E2 后方可评分转正式收录。"
          }
        },
        {
          id: "bili-codex-third-party-model",
          platform: "bilibili",
          title: "如何使用第三方模型驱动 Codex",
          creator: "马克的技术工作坊",
          url: "https://www.bilibili.com/video/BV1cmTu6mEL3/",
          publishedAt: "2026-06-28",
          duration: "10:17",
          audience: "需要替换模型提供方、接入代理或控制调用成本的进阶用户",
          summary: "视频聚焦把 Codex 的 Agent 外壳与默认模型服务解耦：准备第三方端点与凭证，在用户级 config.toml 定义模型提供方，选择该 provider 和模型后启动 Codex，再用一次包含读文件、改文件、运行测试和失败修复的任务验证兼容性。关键不在“聊天能回复”，而在端点是否支持 Codex 所需协议、流式响应与工具调用。",
          coverage: [
            { title: "准备服务参数", steps: ["从服务商官方控制台取得 base URL、模型 ID、认证方式和计费／数据策略。", "确认端点支持 Codex 当前需要的 Responses 协议与工具调用；只兼容普通聊天接口并不等于可驱动 Agent。", "把密钥放入环境变量或受控凭证系统，不写进仓库、提示词或截图。"], done: "四项参数都有官方来源，且已知道数据会发送到哪里。" },
            { title: "配置自定义 provider", steps: ["打开用户级 ~/.codex/config.toml；provider 认证和重定向配置不要放进项目级 .codex/config.toml。", "设置 model_provider 和 model；在 [model_providers.<名称>] 中填写 name、base_url、env_key，兼容端点需要时写 wire_api = \"responses\"。", "启动新会话；临时测试也可用命令行覆盖，但长期配置应有清晰名称并可撤销。"], done: "Codex 启动时选中目标 provider，密钥未出现在 git diff。" },
            { title: "做 Agent 兼容性验收", steps: ["任务一：读取多个文件并准确复述依赖。", "任务二：修改一个小功能并正确生成工具调用。", "任务三：运行测试、读取失败输出、自主修复后复跑。", "再测试较长上下文、取消操作和限流错误；记录成功率、延迟与费用。"], done: "不仅能对话，而且能稳定完成读取—修改—测试—纠错闭环。" }
          ],
          uniqueTechniques: [
            { title: "可热切换的 Provider 基准卡", scenario: "适合在默认模型、代理和多家模型之间做成本／能力选择。", steps: ["为每个 provider 使用独立配置名称和相同测试仓库。", "固定三道任务：跨文件理解、带测试的小改动、故意制造一次失败后的修复。", "记录完成率、工具调用错误、总耗时、人工接管次数和实际费用。", "只有达到基线的 provider 才进入真实仓库；低成本但频繁需要人工修复的方案不算更便宜。"], result: "替换模型从主观聊天观感变成可复测的工程决策。" }
          ],
          caution: "第三方端点涉及可靠性、隐私、计费和账号风险；本页不为任何中转服务背书，协议不兼容时不要强行用于生产代码。",
          review: {
            evidence: "E1",
            status: "candidate",
            reviewedAt: "2026-07-21",
            standards: null,
            quality: null,
            notes: "证据来自视频页面/简介/章节·选集标题与演示主题，非逐段观看或字幕；配置步骤经官方资料校准。按 TUTORIALS.md 保守定 E1、暂列候选，需完整观看补足证据升 E2 后方可评分转正式收录。"
          }
        },
        {
          id: "bili-codex-local-model",
          platform: "bilibili",
          title: "Codex 接入 Ollama、llama.cpp 本地大模型",
          creator: "零度解说",
          url: "https://www.bilibili.com/video/BV153Gm6sE6J/",
          publishedAt: "2026-05-27",
          duration: "12:52",
          audience: "重视代码不出本机、离线使用或固定算力成本的用户",
          summary: "这条视频把第三方 provider 进一步落到本机：先安装 Ollama 或 llama.cpp，下载适合显存／内存的代码模型并启动本地 API；再让 Codex 的 OSS 模式或自定义 provider 指向本地地址；最后通过真实仓库测试工具调用、长上下文、速度和显存占用。Ollama 是 Codex 可直接选择的本地提供方；llama.cpp 则必须启动与当前 Codex wire API 兼容的服务端点，否则只能聊天、不能可靠执行 Agent 工作流。",
          coverage: [
            { title: "建立本地推理服务", steps: ["从 Ollama、llama.cpp 和模型作者的官方来源安装或下载，先根据显存／内存选择量化和上下文长度。", "Ollama 拉取模型后启动服务；llama.cpp 用 server 模式加载模型，并确认监听地址只开放到需要的网卡。", "先用服务自身的命令或 HTTP 健康检查验证模型能响应，再接 Codex。"], done: "本地 API 稳定响应，任务管理器或 GPU 工具能看到模型确实在本机运行。" },
            { title: "让 Codex 选择本地模型", steps: ["Ollama 可运行 codex --oss --local-provider ollama；长期使用可在 config.toml 设置 oss_provider = \"ollama\"。", "若用自定义兼容端点，在用户 config.toml 创建 model_providers 项，填写本地 base_url 与 model，并确认端点支持 Responses 与工具调用。", "启动后先让 Codex读取一个小文件，再尝试一次无副作用命令；失败时区分模型不存在、端口错误、协议不兼容和上下文溢出。"], done: "网络请求指向本地端口，Codex 能连续完成读取与工具调用。" },
            { title: "验证质量与资源成本", steps: ["在真实仓库依次测试导航、修改、编译／测试和错误恢复。", "记录首 token 延迟、总耗时、峰值显存／内存、上下文上限和工具调用失败率。", "降低模型尺寸或上下文虽可提速，但每次调整后都要重跑同一基准。"], done: "你知道该模型在哪类任务可用、何时必须换回更强模型，而不是只确认它能聊天。" }
          ],
          uniqueTechniques: [
            { title: "本地隐私闭环验收", scenario: "适合私有代码、离线环境或不能把源码发送给外部服务的项目。", steps: ["关闭不需要的外部 MCP、插件和网络工具，避免“模型本地”但工具仍向外发送数据。", "让 Codex 读取带有虚构敏感标记的测试仓库，同时观察本机端口与外连记录。", "完成一次修改—构建—修复循环，并记录资源峰值。", "确认日志、缓存和会话文件的保存位置与清理策略，再决定是否进入真实私有仓库。"], result: "隐私判断覆盖模型、工具、日志和缓存整条数据路径，而不是仅凭 localhost 地址。" }
          ],
          caution: "视频简介含第三方下载入口；优先使用 Ollama、llama.cpp 和模型作者的官方来源。llama.cpp 是否兼容取决于服务端点和当前 Codex 协议。",
          review: {
            evidence: "E1",
            status: "candidate",
            reviewedAt: "2026-07-21",
            standards: null,
            quality: null,
            notes: "证据来自视频页面/简介/章节·选集标题与演示主题，非逐段观看或字幕；本地部署步骤经官方资料校准。按 TUTORIALS.md 保守定 E1、暂列候选，需完整观看补足证据升 E2 后方可评分转正式收录。"
          }
        },
        {
          id: "bili-codex-qt-project",
          platform: "bilibili",
          title: "Codex 从零开发 C++ / Qt 贪吃蛇",
          creator: "周旋机器视觉",
          url: "https://www.bilibili.com/video/BV1QPDaBqEox/",
          publishedAt: "2026-04-07",
          duration: "18:29",
          audience: "希望观察真实项目从生成、编译到修错闭环的开发者",
          summary: "这条视频用可运行项目检验 Codex，而不是继续介绍功能：在 VS Code 中准备 C++ 编译器、Qt 与构建工具，让 Codex 先识别环境并规划文件结构；再按游戏状态、移动规则、碰撞与食物、Qt 绘制、输入和计分逐层实现；每一层立刻编译运行，把错误日志交回 Codex 修复；最后与公开视频提供的源码仓库比较结构并复现构建。",
          coverage: [
            { title: "准备可验证的 C++／Qt 环境", steps: ["安装 VS Code、与 Qt 套件匹配的 C++ 编译器、Qt 和 CMake／qmake，并在终端确认版本。", "先手工创建最小窗口项目并成功构建，排除环境问题。", "把真实构建与运行命令写入 AGENTS.md，让 Codex 不必猜测工具链。"], done: "空白 Qt 窗口可启动，Codex 在同一终端环境能执行构建命令。" },
            { title: "先规划项目骨架", steps: ["让 Codex 先给出文件树和职责：游戏状态／规则、Qt 窗口／绘制、输入与构建配置分离。", "明确网格尺寸、移动节拍、反向移动规则、碰撞、计分、暂停与重新开始等验收条件。", "确认计划后只生成最小骨架并立即编译。"], done: "骨架能构建，规则层不依赖具体绘图细节。" },
            { title: "按功能切片实现", steps: ["先实现蛇身数据、方向和定时移动；用可观察输出验证。", "再加食物随机位置、增长、自撞／边界判定和重新开始。", "最后接 Qt paintEvent／定时器／键盘事件，加入计分和界面反馈。"], done: "每增加一项功能都能单独运行验证，失败不会同时跨越多个层。" },
            { title: "把编译错误变成下一轮输入", steps: ["每次只执行实际项目的构建命令，把完整首个错误及上下文交给 Codex。", "要求先解释根因和将改哪些文件，再执行最小修复。", "重新全量构建并手测移动、吃食物、碰撞、暂停和重开；通过后再提交。"], done: "项目从干净检出可复现构建，核心玩法逐项通过。" },
            { title: "用源码仓库复盘", steps: ["打开视频给出的 GitHub 仓库 zhouxuan2023/snakerewind，记录依赖和构建说明。", "比较自己的文件结构、规则实现和构建配置，不直接用最终代码覆盖过程。", "从新目录克隆并按 README 构建，确认教程结果不是仅在作者机器上可运行。"], done: "读者能独立复现，并能解释自己的实现与参考仓库的差异。" }
          ],
          uniqueTechniques: [
            { title: "以“可编译切片”驱动 Agent", scenario: "适合 C++、Qt、原生依赖等环境错误和代码错误容易混在一起的项目。", steps: ["先锁定一个已通过的最小构建基线。", "每轮只加入一个纵向切片，例如“方向输入 → 状态更新 → 画面可见”，而不是一次生成完整游戏。", "失败时只修当前切片的第一个根因；构建通过后做对应手测并提交。", "最终从空目录复现构建，防止 Codex 无意依赖未提交文件或本机缓存。"], result: "错误定位范围始终很小，生成代码是否真的可运行由编译器和行为测试决定。" }
          ],
          caution: "演示项目证明的是工作流，不代表生成代码无需人工审查；Qt 版本、编译器套件、构建缓存和平台差异仍由开发者负责。",
          review: {
            evidence: "E1",
            status: "candidate",
            reviewedAt: "2026-07-21",
            standards: null,
            quality: null,
            notes: "证据来自视频页面/简介/章节·选集标题与演示主题及公开源码仓库线索，非逐段观看或字幕。按 TUTORIALS.md 保守定 E1、暂列候选，需完整观看补足证据升 E2 后方可评分转正式收录。"
          }
        }
      ]
    }
  }
};
