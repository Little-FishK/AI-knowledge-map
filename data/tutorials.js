/* AI 软件使用教程
 *
 * 和概念深读页分开：DEEPDIVE 解释“为什么”，TUTORIALS 解决“怎么上手”。
 * 每条资源先还原完整教学路径，再提炼相对其他资源独有、可复现的技巧。
 */
window.TUTORIALS = {
  meta: { version: "0.5", updatedAt: "2026-07-22" },

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
      meta: "5 个 Bilibili 教程 · 全部逐段转录后重写 2026-07-22 · 均达 E2 正式收录",
      overview: "这里不再用几句观点代替教程。每个视频先按实际教学主题说明要做什么、怎么做以及做到什么算完成；然后再提炼它相对另外四个视频最独特的工作方法。平台通过左侧栏切换，视频卡片可折叠，新增平台不会把读者推到页面底部。",
      sourceNote: "5 条资源均已用 yt-dlp 下载音频（合集按 11 分P分别下载）、Groq/whisper-large-v3 全程转录并对关键帧 OCR，逐条按视频改写、仅用官方资料核对术语，evidence 均为 E2、status 均为 formal。界面入口、模型名与兼容性可能随版本变化；第三方下载、中转服务、OAuth 授权与模型端点需自行核验隐私、费用和凭证风险。",
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
          summary: "「尚学堂·百战程序员／编程大佬陈悠秀」用一个 codex-shop 电商项目贯穿 11 节，把 Codex 从安装讲到 MCP。前半是基础：装好并登录、认识对话/文件修改/命令执行/审批等模块、用计划模式（点加号 → 计划模式）先规划大改造（示范把 codex-shop 改成 Vue3）、用 Git 与分叉/worktree 保护代码；后半是长期记忆与扩展：用 AGENTS.md 和「设置→个性化→自定义指令」让规则跨对话生效，用插件（GitHub、Gmail，需 OAuth）配合自动化把「每周拉 Star Top10 发邮件」做成定时任务，用 / 触发官方/第三方/自建 Skill 产出 PDF·PPT·海报，用 MCP（设置→MCP 服务器 + config.toml 的 [mcp_servers.github] + GitHub 令牌）接上 GitHub 管 Issue/PR。下面把 11 个章节还原成 10 组可完成的操作。",
          coverage: [
            { title: "前置准备", steps: ["确认项目能在本机独立运行，并记录构建、测试和启动命令；否则 Codex 无法判断改动是否成功。", "安装 Git；若走 CLI 路线再准备 Node.js 与 npm。进入项目目录执行 git status，先提交或备份已有工作。", "在项目根目录准备 AGENTS.md：至少写目录结构、运行命令、代码规范、禁止修改项和验收标准。没有该文件时，可在 CLI 用 /init 生成骨架后再人工补全。"], done: "Codex 打开的正是目标仓库，git status 可读，项目基线命令能够运行。" },
            { title: "安装与首次启动", steps: ["CLI 可执行 npm install --global @openai/codex；桌面端或 IDE 用户则安装对应官方客户端／扩展。", "运行 codex，选择 Sign in with ChatGPT；也可执行 codex login 后完成浏览器登录。", "用 codex --version 和 codex login status 检查安装与认证，再从项目根目录启动会话。"], done: "能在正确目录进入 Codex，且它可读取仓库、回答项目结构问题。" },
            { title: "功能模块", steps: ["先让 Codex只读扫描仓库并复述入口文件、依赖、测试与风险点，验证上下文是否正确。", "再给一个小任务，观察它读取文件、修改文件、运行命令、请求审批、返回差异与验证结果的完整循环。", "在提交前打开 diff／Review 面板逐块检查；发现问题时直接对具体改动给反馈，再让 Codex 修正。"], done: "你能区分对话结论、真实文件改动、终端执行结果和待审批动作，而不是只看最终回复。" },
            { title: "控制与引导", steps: ["提示中写清 Goal、Context、Constraints 和 Done when，例如目标功能、相关目录、不可改接口以及必须通过的测试。", "用文件引用或明确路径限制阅读范围；涉及删除、联网、密钥或大规模改动时先要求说明影响。", "运行中发现方向错误就立即补充约束；把新的长期仓库规则写回 AGENTS.md，不要只留在本次聊天。"], done: "Codex 能复述目标与边界，最终报告逐条对应验收条件。" },
            { title: "计划模式", steps: ["普通模式下你一描述需求 AI 就直接写代码；复杂改造建议先开计划模式：点输入框左侧的加号 → 选「计划模式」（不是斜杠命令）。", "计划模式的流程是：你的需求 → AI 提出澄清问题 → 生成含架构与测试方案的详细计划 → 你确认 → 才真正执行。视频用「把 codex-shop 从 HTML/CSS/JS 改造成 Vue3」演示。", "先看计划再放行：删掉越界工作、补上遗漏验收项，确认后 Codex 才按计划动工。"], done: "大改造在写代码前先有可审的计划，你确认后才执行，而不是边猜边改。" },
            { title: "代码管理", steps: ["任务开始前创建分支或独立 worktree，并留下干净基线提交。", "每完成一个可运行的小阶段就检查 git diff，运行相关测试；稳定后提交一个语义清晰的 commit。", "出错时优先根据 diff 定位并回退单个块或文件；不要把无关的用户改动一起覆盖。"], done: "每个阶段都可从 Git 恢复，最终提交只包含本任务文件且测试结果可追溯。" },
            { title: "记忆系统", steps: ["痛点：每开一个新对话就是全新上下文，AI 不记得之前的对话、对项目也一片空白；项目一复杂就得反复交代背景。", "项目级方案是 AGENTS.md（写给 Codex 的项目规则文件，必须在当前项目里用）：可直接让 Codex「通读当前项目，把学到的信息用中文清晰地写进 AGENTS.md」，它会自动生成含用户偏好、项目概览、运行命令、关键文件、页面结构的规则文件。", "全局方案是 设置 → 个性化 → 自定义指令（讲师视其为 AGENTS.md 的等价物），写通用工作约定，如「改 JS 必跑 npm test」「装依赖优先 pnpm」。若刚写完没生效，关掉 Codex 重开即可。"], done: "换新对话后，项目规则（AGENTS.md）与全局约定（自定义指令）仍自动生效，不必每次重讲背景。" },
            { title: "插件与自动化", steps: ["插件是第三方为 Codex 打包的能力包，市场很丰富（GitHub、Gmail、Chrome、Linear、Vercel…）。点左侧「插件」装 GitHub 与 Gmail，各需用账号 OAuth 授权（邮件插件目前只有 Gmail）；装好后在对话里打 / 就能看到 github、gmail。", "组合示范：一句话让「/github 拉本月 AI 项目 Star 增长 Top10 → /gmail 发到我邮箱」，Codex 依次调两个插件完成。", "自动化：接着说「把上述任务做成自动化，每周五 17:30 发邮件」，左侧「自动化」就多出一个定时任务；也能用自然语言「每天上午 9 点提醒我喝水」让它自动识别频率、生成一个 automation。"], done: "插件按需接上外部服务；把一次成功的流程固化成按时或按事件触发的自动化任务。" },
            { title: "Skills", steps: ["视频把 Skills 分三种用法：官方、第三方、自己编写（编写细节引用了作者另一期专讲）；用 / 斜杠即可触发某个 Skill。", "官方 Skill 示范：装官方 PDF Skill，用「/pdf 在当前目录创建一个 PDF，把对话历史都放进去」生成（Codex 用 reportlab 生成、pdftoppm 抽查中文排版）。", "第三方 Skill 示范：下载 guizang-ppt-skill 的 zip 解压，放进项目下的 codex-skills 文件夹，用「/guizang-ppt-skill 根据以下材料生成 PPT…」产出单文件网页 PPT；自写 Skill 用已有的 /iwen-creative 生成一张海报（走 imagegen 技能）。"], done: "官方/第三方/自建三类 Skill 都能用 / 触发，把重复产出（PDF、PPT、海报）标准化。" },
            { title: "MCP", steps: ["MCP（模型上下文协议）是给大模型的标准化工具箱，用来接第三方文档、外部工具或共享信息；示范接 GitHub MCP 管 Issue/PR（这些操作光靠 git 命令做不了，需要 GitHub API）。", "设置 → MCP 服务器 → 添加服务器，两种方式：本地 STDIO 命令，或流式 HTTP（远程）。GitHub 支持远程，最简用 config.toml 写 [mcp_servers.github] 加 url=\"https://api.githubcopilot.com/mcp/\"；GUI 里选流式 HTTP 填名称、URL 和 Bearer 令牌（令牌到 GitHub → Settings → Developer settings → Personal access tokens 生成、勾选所需权限）。", "关键：配置完必须退出 Codex 重开才生效。再用「用 GitHub 的 MCP 看我项目最近 5 个 Issue 并按优先级排序」验证工具确实可用。"], done: "MCP 服务器连接成功，Codex 能调用 GitHub 等外部工具并返回可核验结果。" }
          ],
          uniqueTechniques: [
            { title: "把“全功能参观”变成一套仓库上手验收表", scenario: "最适合第一次把 Codex 引入真实项目，而不是看完视频后只记住功能名。", steps: ["按视频顺序建立十项清单：安装、读仓库、小改动、Plan、Git、Memory、Plugin／自动化、Skill、MCP。", "每项都在同一个练习仓库留下证据：命令输出、diff、commit、AGENTS.md、Skill 文件或 MCP 状态。", "只有当前一项达到上面的“完成标志”才进入下一项；失败就记录是环境、权限、提示还是模型能力问题。"], result: "最终得到的是一个可运行、可回退、带规则与扩展的 Codex 样板仓库，而不是一页功能名词笔记。" }
          ],
          caution: "覆盖很广，适合作主目录入口。视频用桌面版 Codex + VS Code、demo 项目 codex-shop 演示；按钮位置、模型名（GPT-5.5）、套餐额度与插件/MCP 入口会随版本变化。涉及授权与外发的操作要当心：Gmail/GitHub 插件是 OAuth 授权第三方访问你的邮箱/仓库；MCP 的 GitHub 令牌等同仓库钥匙、只离线保存别提交；自动化会按时自动执行，后台改代码建议放 worktree 并先审几次再长期启用。",
          review: {
            evidence: "E2",
            status: "formal",
            reviewedAt: "2026-07-22",
            standards: { accuracy: 2, alignment: 2, reproducibility: 2, traceability: 2, safety: 2 },
            quality: { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 3, accessibility: 2 },
            notes: "据 yt-dlp 逐 P 下载 11 个分P音频 + Groq/whisper-large-v3 全程转录（约 900 段）并对各 P 关键帧 OCR。进阶 5 章已逐段核对并按视频改写：计划模式=加号菜单（非 /plan）、记忆=AGENTS.md 与 个性化·自定义指令（非 Enable memories 开关）、插件与自动化=GitHub+Gmail OAuth 组合+定时、Skills=/ 斜杠触发官方/三方/自写（非 $skill-creator）、MCP=设置→MCP 服务器 + config.toml [mcp_servers.github] + GitHub 令牌 + 退出重开（非 codex mcp add）；纠正了旧稿多处凭官方文档臆测的写法。安装/前置/功能/控制/代码管理各章转录一致、表述与官方文档对齐。demo 项目 codex-shop；质量总分 66.25；原视频无 CC 字幕、由音频取证，accessibility 记 2。"
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
          summary: "马克用一个 HTML 记事本「马克笔记」从 0 迭代到 Electron 桌面版，串起 Codex 的进阶用法。建出首版后在网页预览上做 Annotate（把反馈绑定到具体界面元素）；进阶用 Fork 复制对话（Local 复用原目录、New Worktree 用 git worktree 开隔离目录，二者都只复制对话、不回滚代码，回滚要靠 git）、用 Archive 归档而非删除、用 AGENTS.md 让「每次自动 git commit」等规则跨对话生效、用 Plan mode 规划大改造、用 Side Chat 与 Steer 在任务运行中插话；扩展篇讲 Plugin（App 提供工具即 Action + Skill 提供说明，示范 Presentations 做 PPT、Chrome 抓 Product Hunt、Computer Use 操作日历）、自建 Skill、定时任务与 Codex Mobile 手机远程操控。",
          coverage: [
            { title: "Annotate：把反馈钉在界面元素上", steps: ["建出首版马克笔记后，在网页预览区选中某个具体元素做 Annotate（如「把左上角的‘2条笔记’去掉」）。", "批注作为 1 annotation 回到对话，Codex 只改这一处并同步调整测试。", "用 Annotate 而非整句描述，反馈定位更准、改动范围更小。"], done: "每条批注都对应界面上一个明确元素，被精确修掉。" },
            { title: "Fork：复制对话，Local vs New Worktree", steps: ["在某条消息上点 Fork 图标，两个选项：Fork into Local（新对话复用当前目录）与 Fork into New Worktree（用 git worktree 开一个隔离新目录，两条对话代码互不影响，适合并行做两个功能）。", "关键：两者都只复制对话、都不回滚代码。", "要回滚代码得用 git：Cmd+J 开终端 → git log → reset 到某个 commit。"], done: "你能按需要选隔离或共享目录做 A/B，并清楚代码回滚归 git 管。" },
            { title: "Archive 与 AGENTS.md：收纳对话、固化规则", steps: ["归档（点对话旁图标 → Confirm）是隐藏不是删除，可在 Cmd+, → Archived Chats 里恢复或彻底删。", "想让「每次改完自动 git commit」跨对话生效，别只在输入框说（只对当前对话有效），而在项目根写 AGENTS.md——Codex 每开新对话都会读它当指令。", "AGENTS.md 里还可写代码风格、命名、技术栈、项目背景；写得越好 Codex 越顺手。"], done: "历史对话可归档可找回；换新对话后仓库级规则仍自动生效。" },
            { title: "Plan / Side Chat / Steer：驾驭大任务", steps: ["大改造（如把网页版改成 Electron+React+TS 桌面端）先点 + → Plan mode，Codex 先问清关键选择，再产出含测试与架构的计划，你确认或提修改意见后才动工。", "任务运行时输入 -site 开 Side Chat 问轻量问题，不打断左侧主任务。", "想中途立刻插入要求（如「logo 两种模式都要清晰」）就点 Steer 按钮把消息即时发给 Codex，而不是等它做完。"], done: "大任务先有可审计划，运行中还能不打断地追加信息与纠偏。" },
            { title: "Plugin / Skill / 自动化 / 手机远程", steps: ["侧栏 Plugins 里安装插件；一个 Plugin = App（把 Codex 连到某服务、提供一批工具即 Action，类似 MCP 工具；如 Gmail App 有 24 个）+ Skill（给模型看的说明书）。", "示范：Presentations 插件做 PPT（可用 @presentations 强制）、Chrome 插件抓 Product Hunt 热门产品、Computer Use 用独立虚拟鼠标操作日历。", "还能用 Attach Electron 把运行中的应用截图喂给 Codex（ImageGen 技能做海报）、自建 Skill（如 MarkNotes Code Review）、用 Add Automation 建每日定时任务、用 Codex Mobile 扫码后在手机上远程指挥电脑端 Codex。"], done: "你能给 Codex 装外部能力、沉淀自有 Skill、让任务定时或从手机触发。" }
          ],
          uniqueTechniques: [
            { title: "Fork 复制对话、git 回滚代码——分清两件事", scenario: "想在某个中间状态开分支试不同方向，又担心代码被搞乱。", steps: ["在目标消息上 Fork；要两条对话完全隔离就选 New Worktree（git worktree 开新目录），只想复制对话历史就选 Local。", "无论哪种，代码都不会自动回滚。", "要回滚就 Cmd+J 开终端，用 git log / reset 到对应 commit。"], result: "对话分支与代码版本各自独立管理，A/B 试验不互相污染。", limitation: "New Worktree 依赖 git worktree 概念，非 git 项目或不熟 worktree 时收益有限。" },
            { title: "用 Side Chat 问、用 Steer 插——不打断长任务", scenario: "Codex 正在跑一个耗时任务，你既想问点别的、又想临时追加一条要求。", steps: ["想问轻量问题就在输入框打 -site 开 Side Chat，不影响左侧主任务。", "想让当前任务立刻纳入新要求就点 Steer 立即下发，而不是等它做完。", "Steer 用清晰指令，避免打断模型正在进行的思路。"], result: "长任务运行期间仍能并行提问与实时纠偏。", limitation: "Side Chat 只适合轻量问题；Steer 打断可能改变模型正在进行的思路。" }
          ],
          caution: "功能入口（Fork/Archive/Plan/Steer/Plugins/Automations/Codex Mobile）与套餐、模型名（GPT-5.5）会随客户端更新变化；Computer Use 与 Codex Mobile 会让 Codex 用虚拟鼠标操作你的电脑、并允许手机远程触发，涉及较高权限，请在可控环境下使用并逐次确认。Plugin 的 App 会把 Codex 接到 Gmail 等外部服务，安装即授予其一批 Action，注意数据与授权范围。",
          review: {
            evidence: "E2",
            status: "formal",
            reviewedAt: "2026-07-22",
            standards: { accuracy: 2, alignment: 2, reproducibility: 2, traceability: 2, safety: 2 },
            quality: { closure: 4, transfer: 4, completeness: 4, structure: 4, freshness: 3, accessibility: 2 },
            notes: "据 yt-dlp 下载音频 + Groq/whisper-large-v3 全程转录（569 段）并对 167 帧界面 OCR 逐条重写；Fork 的 Local/New Worktree 差异、AGENTS.md 跨对话生效、Plan/Side Chat(-site)/Steer、Plugin 的 App+Skill 结构（Gmail 24 个 Action）、Presentations/Chrome/Computer Use、Attach Electron+ImageGen、Add Automation 与 Codex Mobile 扫码远程均取自转录与 OCR、并对照官方资料。质量总分 66.25；原视频无 CC 字幕、由音频取证，accessibility 记 2。"
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
          summary: "视频演示不用 OpenAI 账号、改用国产模型（以 DeepSeek 为例，GLM/Kimi 同理）驱动 Codex。核心不是改 config.toml，而是借助第三方 GUI「CC Switch」新增 DeepSeek 配置，并开启它的「本地路由」在 Codex 的 Responses 协议与 DeepSeek 的 ChatCompletions 协议之间做双向格式转换——这一步才是让第三方模型真正能驱动 Codex（而不只是能聊天）的关键。最后固定/确认所用的具体模型（V4 Flash / V4 Pro）。",
          coverage: [
            { title: "装好 Codex，确认它绕不开 OpenAI 账号", steps: ["打开 OpenAI 页面下载 Codex，按常规方式安装。", "启动后 Codex 要求登录：两个选项一是用 ChatGPT 账号，二是「其他方法」——点进去会发现「其他方法」其实是填 OpenAI API key，两条都需要 OpenAI 账号。", "先把 Codex 关掉，等第三方配置好后再打开。"], done: "你已确认默认登录都要 OpenAI 账号，并退出 Codex 准备走第三方路线。" },
            { title: "申请 DeepSeek API key", steps: ["打开 DeepSeek 用量页面；余额为 0 就先充值，约 5 元基本够用。", "进入 API keys 页面点「创建 API key」，起个名字（如 default）后点创建。", "DeepSeek 只展示这把 key 一次，之后不再显示——立即复制并妥善离线保存，再关闭弹窗。"], done: "你手里有一把 DeepSeek API key，且已保存（页面不会再显示）。" },
            { title: "用 CC Switch 新增并启用 DeepSeek 配置", steps: ["打开 CC Switch 官网点免费下载，会跳到 GitHub Releases；展开 Show All Assets，按系统（Windows/macOS）选对应安装包并安装。", "打开 CC Switch，点右上角「+」新增配置，在预设供应商里选 DeepSeek，往下把刚才的 API key 粘进去，点添加。", "把鼠标移到新配置上点「启用」。"], done: "CC Switch 里出现并启用了一个 DeepSeek 配置。" },
            { title: "开启本地路由，桥接 Responses 与 ChatCompletions", steps: ["启用时 CC Switch 会警告：此供应商用 OpenAI Chat（ChatCompletions）格式，需路由服务。原因是 Codex 用的是 Responses 协议，而 DeepSeek 等多数供应商只提供 ChatCompletions，两者不兼容。", "点齿轮进设置 → 路由 → 本地路由，打开开关（让格式转换开关显示到主页，便于以后开关）。", "返回主页，点开这个路由开关。路由会把 Codex 的 Responses 请求转成 ChatCompletions 发给模型，再把模型响应转回 Responses。"], done: "路由已开启，Codex 与 DeepSeek 之间的协议格式差异被自动转换。" },
            { title: "启动 Codex 验证，并固定/确认具体模型", steps: ["打开 Codex：这次直接进入、不再要求 OpenAI 登录，随便发条消息能正常回复。", "此时 Codex 把模型标成 Custom，看不出用的是 DeepSeek V4 Flash 还是 V4 Pro；到 CC Switch 点编辑往下看可确认当前是哪个。", "想固定用 Pro：在 CC Switch 编辑配置的「模型映射」里删掉 deepseek-v4-flash 一项、只留 pro，保存；再重启 CC Switch 和 Codex 使其生效。", "打开配置文件 ~/.codex/config.toml 确认默认模型已是 deepseek-v4-pro，回 Codex 新建对话发个请求最终验证。"], done: "Codex 无需 OpenAI 账号即可运行，且 config.toml 里确认默认模型正是你选定的 DeepSeek 模型。" }
          ],
          uniqueTechniques: [
            { title: "用「本地路由」桥接 Responses 与 ChatCompletions", scenario: "任何「第三方/兼容端点聊天能通、但在 Codex 里用不了」的情形——根因几乎都是协议格式不匹配。", steps: ["认出报错关键词：供应商用 ChatCompletions、Codex 要 Responses、需先启动路由。", "在 CC Switch 设置里开「本地路由」，它双向转换两种格式。", "验证时别只看「能不能聊天」，要让 Codex 真正读文件/改文件跑一次，确认工具调用也通——聊天通不代表 Agent 能力通。"], result: "第三方模型不仅能对话，还能真正驱动 Codex 的读写、执行等 Agent 工作流。", limitation: "依赖 CC Switch 这个第三方 GUI 及其当前行为；直接手改 config.toml 也能达到同样效果，但需自己处理 wire_api 与转换。" },
            { title: "删「模型映射」只留一项来固定默认模型", scenario: "CC Switch 没有直接切模型的选项、Codex 侧又不显示/不切换模型（视频中疑似 bug）时的绕行办法。", steps: ["回 CC Switch 点编辑，找到「模型映射」一栏。", "把不想用的一项（如 deepseek-v4-flash）删掉，只留目标模型（pro），保存。", "重启 CC Switch 和 Codex 生效，再用 ~/.codex/config.toml 里的默认模型确认。"], result: "在 UI 缺少切换入口时，仍能把默认模型稳定固定到某个具体型号。", limitation: "是针对当前版本 bug 的临时手法；日后 Codex 补上模型切换后可能不再需要。" }
          ],
          caution: "这是「第三方 GUI（CC Switch）+ 本地路由」方案：你的代码与请求会经路由发往 DeepSeek 云端，注意隐私与数据合规；API key 只离线保存，别写进仓库、提示词或截图，别提交到 git。CC Switch 属第三方工具、DeepSeek 需充值，均从官方来源获取并自担费用与账号风险。视频中 Codex 不显示/不切换模型疑似 bug，日后可能修复；按钮位置、模型名（DeepSeek V4 Flash/Pro）与路由入口可能随版本变化，请以 ~/.codex/config.toml 的实际内容为准。",
          review: {
            evidence: "E2",
            status: "formal",
            reviewedAt: "2026-07-21",
            standards: { accuracy: 2, alignment: 2, reproducibility: 2, traceability: 2, safety: 2 },
            quality: { closure: 4, transfer: 4, completeness: 4, structure: 3, freshness: 3, accessibility: 2 },
            notes: "据 yt-dlp 下载音频 + faster-whisper(small) 全程转录（262 段、约 10 分钟）逐条重写；协议格式（Responses vs ChatCompletions）与模型名对照官方资料核对。质量总分 63.75（核心推荐档）。注：原视频无 CC 字幕、由音频转录取证，故 accessibility 记 2。"
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
          summary: "零度解说用桌面版 Codex 演示两条本地模型路线，全程可离线、免 OpenAI 账号与 API key。主线走 Ollama：装最新版 Ollama（视频强调只有 0.24+ 才完全适配 Codex），按显存在 4B–40B 里拉取代码模型（编程首选 Qwen3.6 与 Gemma 4），再用一键命令 ollama launch codex-app 在弹出的模型选择器里选中本地模型。进阶走 llama.cpp：改 ~/.codex/config.toml 指向本地端点，用带 --jinja 的固定命令启动 llama-server，可加载 GGUF（含无审查版）模型。视频还给出一个高价值排错：Ollama 默认上下文过长会让 Codex 卡在重连死循环，必须调小。",
          coverage: [
            { title: "装应用、拉本地模型", steps: ["下载安装 Codex 桌面应用（约 1.9GB；Mac 版分 Intel 与 M 芯片，别下错）。", "安装并升级到最新版 Ollama——视频强调只有 0.24 及以上才完全适配 Codex，旧版必须升级。", "按显存在 4B–40B 里选代码模型：编程首选 Qwen3.6（27B / 35B-A3B）与 Gemma 4（31B），用 ollama run qwen3.6:27b 之类命令拉取（27B 量化约 17GB）；不确定就用应用内「选择模型」让它按显存自动推荐。"], done: "Ollama 服务在跑，目标模型已拉到本地。" },
            { title: "一键把 Ollama 接进 Codex", steps: ["执行 ollama launch codex-app，会弹出模型选择器，同时列出本地模型与 kimi-k2.6、glm-5.1 等云端项，选你的本地模型。", "Codex 自动重启，右下角显示 Ollama 即接管成功；问它模型它可能自称「基于 GPT-5」——这是幻觉，不可信。", "要完全自动化可在设置开「完全访问权限」（免逐次批准即可读写文件、联网执行，风险自负）；要让它自动操作浏览器，则允许「控制内置浏览器」、装 Chrome 的 Codex 扩展并开「电脑操控」。"], done: "Codex 用的是本地模型，且能连续读写文件。" },
            { title: "治卡顿：把上下文调小", steps: ["默认装好后 Agent 常卡在 Reconnecting 1/5 的死循环、跑得极慢。", "根因是 Ollama 默认上下文长度（32K）过长；到 Ollama 设置把 Context length 改成 16K 或 8K。", "重跑同一任务对比：Agent 代理速度明显提升，不再反复重连。"], done: "同一任务能连续完成读文件—改代码—执行，而不是卡在重连。" },
            { title: "进阶：llama.cpp 跑 GGUF 模型", steps: ["改用户 ~/.codex/config.toml，新增 [model_providers.llamacpp] 指向本地地址、设 wire_api 与对应 profile，并把 model 名写成你 llama.cpp 加载的 GGUF 名。", "用固定命令启动：llama-server.exe -m models\\你的模型.gguf -ngl 999 -c 16384 -n 2048 -fa on --jinja --host 127.0.0.1 --port 8080；视频强调必须带 --jinja，否则后续会出错。", "回 Codex 确认它连到本地 8080 端点、工具调用可用，再进真实任务。"], done: "config.toml 的 model 与 llama.cpp 端点一致，Codex 能连上本地端点执行 Agent 工作流。" }
          ],
          uniqueTechniques: [
            { title: "调小 Ollama 上下文，解开 Agent 重连死循环", scenario: "本地模型接进 Codex 后能聊天，一旦真正干活就不停 Reconnecting、慢到不可用。", steps: ["先确认卡点是重连，而非模型不存在或端口错误。", "到 Ollama 设置把 Context length 从默认 32K 降到 16K 或 8K。", "重跑同一任务，对比首 token 与总耗时确认提速。"], result: "本地 Agent 从「能连不能干」变成可连续完成工具调用。", limitation: "上下文调小会牺牲可处理的长文件/长历史，需按任务在速度与上下文间取舍。" },
            { title: "断网验证「真本地」，别信模型自报家门", scenario: "想确认 Codex 真在用本地模型，而不是偷偷走云端。", steps: ["直接问模型时它可能自称「基于 GPT-5」——这是幻觉，不能作为依据。", "改为开飞行模式或物理断网，再让它执行一个任务。", "仍能正常思考并读写文件，即证明推理在本机进行。"], result: "用可观察的行为、而非模型自述来判定本地化。", limitation: "只证明「推理在本地」，工具、日志、缓存是否外发仍需单独核查。" }
          ],
          caution: "视频简介与演示含第三方博客的下载入口与「越狱版/无审查」GGUF 模型：优先从 Ollama、llama.cpp 与模型作者官方来源获取，无审查模型有合规与安全风险，来路不明的「一键对接/启动命令」务必看懂再粘贴。「完全访问权限」会让 Codex 免批准读写文件并联网执行，仅在隔离环境开启。模型名（Qwen3.6、Gemma 4）、Ollama 适配版本号与命令参数会随版本变化，以官方文档和 ~/.codex/config.toml 实际内容为准。",
          review: {
            evidence: "E2",
            status: "formal",
            reviewedAt: "2026-07-22",
            standards: { accuracy: 2, alignment: 2, reproducibility: 2, traceability: 2, safety: 2 },
            quality: { closure: 4, transfer: 4, completeness: 4, structure: 3, freshness: 3, accessibility: 2 },
            notes: "据 yt-dlp 下载音频 + Groq/whisper-large-v3 全程转录（135 段）并对 82 帧界面 OCR 逐条重写；ollama launch codex-app、config.toml 的 [model_providers.llamacpp]、llama-server 启动命令（含 --jinja）、Ollama 上下文 32K→16K/8K 排错均取自画面 OCR 并与官方文档核对。修正了旧稿凭文档臆测的 CLI 写法（codex --oss / oss_provider）——视频实际走桌面版一键接入。质量总分 63.75；原视频无 CC 字幕、由音频取证，accessibility 记 2。"
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
          summary: "这是「工业软件开发训练营」里的实战演示：作者全程不写一行代码，只做需求整理与和 Codex 交互，做出一个 C++/Qt Widgets 的贪吃蛇。关键在动手前先把自己当产品经理写清需求与技术约束（Qt Widgets 不用 QML、CMake 管理、纯代码不使用 .ui 文件、src/bin 目录结构），再给一份编程规范模板约定命名等习惯；随后在 VS Code 里把需求发给 Codex，让它生成工程、本地用 CMake 构建并跑起来，再把「多余控制台窗口」「加注释」「设置软件图标」等问题逐个交回 Codex 修改重编。",
          coverage: [
            { title: "先当产品经理：写清需求与技术约束", steps: ["列出功能需求：蛇自动移动、方向键控制、吃食物增长、撞墙或自撞即结束。", "写死技术约束：C++、Qt Widgets（不用 QML）、CMake 管理、纯代码不使用 .ui 文件；交互用键盘、定时器实时刷新。", "定好界面与工程结构：左游戏区右侧边栏、积分板、重开/暂停按钮、绿蛇红食物、结束弹窗；源码放 src/、exe/pdb 等产物放 bin/。"], done: "一份 AI 能照着做的需求，而不是一句「写个贪吃蛇」。" },
            { title: "给一份编程规范模板", steps: ["在 doc/ 下放一个 md，约定命名与代码习惯：私有成员用 m_ 还是 _、类名大驼峰还是小驼峰等。", "因为不明说 AI 不会知道你的习惯，模板可网上找现成或让 AI 先生成再改。", "把模板作为文件交给 Codex，而不是塞进一句话 prompt。"], done: "生成代码的命名与结构符合你的规范，而非随机风格。" },
            { title: "发给 Codex 生成并本地构建", steps: ["在 VS Code 打开项目文件夹，切到 Codex，把需求 prompt 发过去。", "它生成 CMake 工程后在本地构建；遇到需要执行命令（如调用 CMake）会请求批准，选是。", "编译通过后 exe 落到 bin/，并附一份说明技术栈与架构的 README。"], done: "项目能在本机构建运行，重开、暂停/继续、缩放都正常。" },
            { title: "把问题逐个交回 Codex 修", steps: ["发现多余的控制台黑窗 → 告诉现象，它把可执行改成 GUI 子系统并重新调用本地 CMake 重编。", "要注释 → 它只在状态流转、绘制逻辑等阅读门槛高处加简明注释，不改功能、不塞无意义注释。", "要图标 → 从图标站（如 iconfont）取 64/128px 图放进项目，让它设为软件图标；若提示 exe 被占用，先关掉运行中的程序再编。"], done: "每个改动都在本地立即重编验证，功能不被破坏。" }
          ],
          uniqueTechniques: [
            { title: "需求 + 规范模板前置，把「写个贪吃蛇」变成可交付工单", scenario: "从 0 到 1 让 Agent 写原生 C++/Qt 这类强约束项目。", steps: ["先把功能、技术约束、交互、界面、目录结构逐条写死。", "再单独给一份命名/风格规范模板。", "两份都作为文件交给 Codex，而不是塞进一句话 prompt；生成后按约束逐条验收。"], result: "生成代码在结构、命名、构建方式上可控可验收，作者评价比自己手写更好。", limitation: "演示未展示完整 CMakeLists 与源码细节（源码需到作者主页领取），复现的是流程而非逐行代码。" },
            { title: "用「现象 → 根因 → 最小修改 → 重编」迭代收尾", scenario: "生成的程序能跑但有细节问题：多余窗口、缺注释、缺图标。", steps: ["把可观察的现象（如出现一个多余控制台窗口）告诉 Codex，让它定位根因（此处是 GUI 子系统设置）。", "要求最小改动，并让它重新调用本地 CMake 构建。", "每次改完立即运行手测，再进入下一处。"], result: "依赖 Codex 读写本地文件、调用本地 CMake 的 agent 能力，把演示级项目打磨到可用。", limitation: "改动默认直接落到本地文件，需自己用 git 基线与 diff 审阅把关。" }
          ],
          caution: "这是演示性质的小项目，证明的是「需求整理 + 规范前置 + 本地构建迭代」这套工作流，不代表生成代码免人工审查；源码需到作者主页领取，视频并未提供公开 GitHub 仓库。Qt 版本、编译器套件、CMake 配置与平台差异仍由开发者负责；Codex 默认会把改动直接写入本地文件，建议用 git 基线与 diff 审阅把关。",
          review: {
            evidence: "E2",
            status: "formal",
            reviewedAt: "2026-07-22",
            standards: { accuracy: 2, alignment: 2, reproducibility: 2, traceability: 2, safety: 2 },
            quality: { closure: 4, transfer: 4, completeness: 3, structure: 3, freshness: 3, accessibility: 2 },
            notes: "据 yt-dlp 下载音频 + Groq/whisper-large-v3 全程转录（171 段）逐条重写；需求/技术约束（Qt Widgets 不用 QML、CMake、不用 .ui、src/bin 结构）、GUI 子系统修控制台窗口、注释与 iconfont 图标接入均来自转录与标题页 OCR。修正旧稿虚构的 GitHub 源码仓库（zhouxuan2023/snakerewind 在视频中不存在，源码经作者主页领取）与「可编译切片」的理想化描述（视频实为一次性生成 + 迭代修问题）。低清视频未下全、OCR 帧偏少但转录完整。质量总分 60。"
          }
        }
      ]
    }
  }
};
