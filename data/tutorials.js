/* AI 软件使用教程
 *
 * 和概念深读页分开：DEEPDIVE 解释“为什么”，TUTORIALS 解决“怎么上手”。
 * 资源按平台归类；每条只保留编辑提炼后的稳定方法，不复制原视频/文章正文。
 */
window.TUTORIALS = {
  meta: { version: "0.1", updatedAt: "2026-07-21" },

  platforms: [
    { id: "bilibili", label: "Bilibili", emoji: "📺", color: "#d86b91" },
    { id: "xiaohongshu", label: "小红书", emoji: "📕", color: "#d85e5e" },
    { id: "youtube", label: "YouTube", emoji: "▶️", color: "#d45d5d" },
    { id: "github", label: "GitHub", emoji: "🐙", color: "#8b94a8" },
    { id: "articles", label: "文章与文档", emoji: "📄", color: "#6b8cbe" }
  ],

  items: {
    codex: {
      title: "Codex 使用教程",
      subtitle: "从安装、任务规划到扩展与真实项目验证",
      meta: "5 个 Bilibili 教程 · 编辑复核 2026-07-21 · 面向初学者与开发者",
      overview: "真正有效的 Codex 工作流不是让它一次性“把项目写完”，而是先交代仓库规则和验收标准，再让 Agent 规划、修改、运行验证并接受人工审查。插件、Skills、MCP 和模型替换都是扩展层，不能替代清楚的任务边界与可执行反馈。",
      sourceNote: "以下内容依据公开视频页面、简介、章节/选集与演示主题进行交叉提炼，不是逐字字幕。视频界面、模型名称、登录与第三方接入配置会变化；实际操作前应再核对官方文档，并谨慎对待第三方下载、中转服务与密钥配置。",
      accessDate: "2026-07-21",
      learningPath: [
        "先用完整入门教程认识安装、计划、代码管理、记忆、Skills 与 MCP 的边界。",
        "再学习任务分叉、归档和可复用工作流，把一次对话升级为可管理的开发过程。",
        "只有在确有成本、隐私或模型选择需求时，再研究第三方 API 或本地模型接入。",
        "最后用一个可编译、可运行、有源码的真实项目检验工作流，而不是只看演示。"
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
          audience: "第一次系统使用 Codex 的读者",
          focus: "覆盖前置准备、安装、功能模块、控制与引导、计划模式、代码管理、记忆、插件与自动化、Skills、MCP。",
          takeaways: [
            "把计划模式放在大改动之前：先让 Codex说明范围、文件和验证方式，再允许执行。",
            "代码管理与记忆解决的是两类不同问题：前者保护可回退性，后者保存跨任务规则和偏好。",
            "插件、Skills 与 MCP 分别扩展界面能力、可复用流程和外部工具连接；不要把三者混成一个概念。"
          ],
          caution: "覆盖很广，适合作为目录；具体按钮和模型额度最容易过时。"
        },
        {
          id: "bili-codex-zero-to-one",
          platform: "bilibili",
          title: "Codex 从 0 到 1：Annotate / Fork / Archive / Plan / Plugin / Skill",
          creator: "马克的技术工作坊",
          url: "https://www.bilibili.com/video/BV1c9EK6KEW4/",
          publishedAt: "2026-06-08",
          duration: "58:37",
          audience: "已经完成安装、希望管理复杂任务的用户",
          focus: "围绕标注、任务分叉、归档、计划、插件和 Skill 构建完整工作流。",
          takeaways: [
            "Fork 的价值是保留当前上下文，同时并行探索另一条实现路线，避免把主任务试乱。",
            "Archive 用来收束已完成或暂停的任务；任务卫生会直接影响长期使用时的检索与注意力。",
            "Annotate 和 Plan 应把意图变成可检查的约束；Plugin 与 Skill 则把重复做法固化下来。"
          ],
          caution: "高级功能的名称和入口可能随客户端更新，重点应放在分叉、回退、归档和复用这些稳定方法。"
        },
        {
          id: "bili-codex-third-party-model",
          platform: "bilibili",
          title: "如何使用第三方模型驱动 Codex",
          creator: "马克的技术工作坊",
          url: "https://www.bilibili.com/video/BV1cmTu6mEL3/",
          publishedAt: "2026-06-28",
          duration: "10:17",
          audience: "需要替换模型提供方或控制调用成本的进阶用户",
          focus: "演示在不依赖 OpenAI 账号的情况下，用第三方模型端点驱动 Codex。",
          takeaways: [
            "Codex 的 Agent 工作流与底层模型服务可以解耦，但“能接通”不等于工具调用、长上下文和代码质量完全兼容。",
            "替换模型后应重新做仓库级基准：读代码、改文件、运行测试、处理失败和长任务都要验证。",
            "API 地址、模型名和凭证应放在受控配置中；不要把长期密钥写进提示、仓库或教程截图。"
          ],
          caution: "第三方端点涉及可靠性、隐私、计费和账号风险；本页不为任何中转服务背书。"
        },
        {
          id: "bili-codex-local-model",
          platform: "bilibili",
          title: "Codex 接入 Ollama、llama.cpp 本地大模型",
          creator: "零度解说",
          url: "https://www.bilibili.com/video/BV153Gm6sE6J/",
          publishedAt: "2026-05-27",
          duration: "12:52",
          audience: "重视本地隐私、离线使用或固定算力成本的用户",
          focus: "通过 Ollama 或 llama.cpp 为 Codex 提供本地模型推理。",
          takeaways: [
            "本地化把代码和提示保留在自己的机器上，也把显存、速度、模型下载和运行维护责任带回本地。",
            "“没有按 token 计费”不等于零成本：硬件、能耗、上下文长度和推理等待时间都要计入。",
            "编程 Agent 对工具调用遵循、补丁质量和错误恢复要求很高；本地模型必须用真实仓库测试，而不是只看聊天效果。"
          ],
          caution: "视频简介含第三方下载入口；优先从 Ollama、llama.cpp 和模型作者的官方来源安装。"
        },
        {
          id: "bili-codex-qt-project",
          platform: "bilibili",
          title: "Codex 从零开发 C++ / Qt 贪吃蛇",
          creator: "周旋机器视觉",
          url: "https://www.bilibili.com/video/BV1QPDaBqEox/",
          publishedAt: "2026-04-07",
          duration: "18:29",
          audience: "希望观察真实项目生成—编译—修正闭环的开发者",
          focus: "在 VS Code 环境中用 Codex 从零实现可运行的 C++ / Qt 小项目，并提供源码仓库。",
          takeaways: [
            "选择能编译运行的小项目作为练习，比让 Agent 输出孤立代码片段更能暴露环境、依赖和接口问题。",
            "任务应拆成项目骨架、核心逻辑、界面、构建和验收；每一步完成后立刻编译或运行。",
            "源码仓库使读者能比较最终差异、复现构建并检查 Agent 是否真的完成要求。"
          ],
          caution: "演示项目证明的是工作流，不代表生成代码无需人工审查；依赖版本和构建配置仍需开发者负责。"
        }
      ]
    }
  }
};
