/* Task-oriented curriculum. Published Agent lessons use their approved Markdown; planned chapter cards use docs/AGENT_AUTOMATION_CURRICULUM.md. Run npm run build:tutorial-agents. */
window.TUTORIALS = {
  "schemaVersion": 2,
  "meta": {
    "version": "3.0",
    "updatedAt": "2026-10-30"
  },
  "foundationId": "conversation-basics",
  "modules": [
    {
      "id": "conversation-basics",
      "title": "对话与基础任务",
      "titleEn": "Conversation and basic tasks",
      "summary": "学习与 AI 对话、表达需求和检查结果，为后续学习方向打好基础。",
      "summaryEn": "Learn to communicate with AI, describe tasks and check results before exploring the learning directions.",
      "color": "#7aa2d8",
      "prerequisites": [],
      "topics": [],
      "status": "available",
      "subcategories": [],
      "lessons": [
        {
          "id": "prompt-workflow",
          "kind": "interactive-workflow",
          "title": "从一句需求到可用结果",
          "titleEn": "From a request to a usable result"
        }
      ]
    },
    {
      "id": "agents-automation",
      "title": "AI Agent 和自动化",
      "titleEn": "AI agents and automation",
      "summary": "围绕目标组织搜索、信息处理与工具调用，逐步完成多步骤任务。",
      "summaryEn": "Use search, information processing and tools to complete multi-step tasks.",
      "color": "#77bba5",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [
        "search"
      ],
      "status": "available",
      "subcategories": [],
      "lessons": [
        {
          "id": "agent-foundations",
          "kind": "reading",
          "title": "什么是 Agent？什么时候需要用到？",
          "titleEn": "What is an agent, and when should you use one?",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans",
            "en"
          ]
        },
        {
          "id": "agent-building",
          "kind": "reading",
          "title": "如何制作 Agent？",
          "titleEn": "How to build an agent",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans",
            "en"
          ]
        },
        {
          "id": "agent-discovery",
          "kind": "reading",
          "title": "如何寻找 Agent",
          "titleEn": "How to find an agent",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans",
            "en"
          ]
        },
        {
          "id": "automation",
          "kind": "reading",
          "title": "自动化工作流",
          "titleEn": "Automation workflows",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans",
            "en"
          ]
        },
        {
          "id": "agent-evaluation",
          "kind": "reading",
          "title": "评分与改进系统",
          "titleEn": "Evaluation and improvement",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans",
            "en"
          ]
        }
      ],
      "chapters": [
        {
          "id": "agent-foundations",
          "number": 1,
          "title": "一. 什么是 Agent？什么时候需要用到？",
          "titleEn": "I. What is an agent, and when should you use one?",
          "status": "available",
          "source": "docs/AGENT_FOUNDATIONS.md",
          "summary": "理解 Agent 与工作流的关系、行动与反馈循环，以及工具、知识、记忆、自主性和权限。",
          "summaryEn": "Understand agents, workflows, action and feedback, tools, knowledge, memory and permissions.",
          "languages": [
            "zh-Hans",
            "en"
          ],
          "sourceEn": "docs/en/AGENT_FOUNDATIONS.md"
        },
        {
          "id": "agent-building",
          "legacyModuleId": "agent-creation",
          "number": 2,
          "title": "二. 如何制作 Agent？",
          "titleEn": "II. How to build an agent",
          "status": "available",
          "source": "docs/AGENT_BUILDING.md",
          "summary": "配置话题知识、跨对话记忆和语音交流，制作后台运行的 Agent，并了解发布与开源许可。",
          "summaryEn": "Configure knowledge, memory, voice and background execution, and learn about publishing and open-source licenses.",
          "languages": [
            "zh-Hans",
            "en"
          ],
          "sourceEn": "docs/en/AGENT_BUILDING.md"
        },
        {
          "id": "agent-discovery",
          "legacyModuleId": "agent-discovery",
          "number": 3,
          "title": "三. 如何寻找 Agent",
          "titleEn": "III. How to find an agent",
          "status": "available",
          "source": "docs/AGENT_RESOURCES.md",
          "summary": "认识 skill 与 Harness，寻找现成 Agent、技能、运行程序和工作流的具体入口。",
          "summaryEn": "Understand skills and harnesses, and find agents, skills, runtimes and reusable workflows.",
          "languages": [
            "zh-Hans",
            "en"
          ],
          "sourceEn": "docs/en/AGENT_RESOURCES.md"
        },
        {
          "id": "automation",
          "legacyModuleId": "automation",
          "number": 4,
          "title": "四. 自动化工作流",
          "titleEn": "IV. Automation workflows",
          "status": "available",
          "source": "docs/AGENT_AUTOMATION.md",
          "summary": "学习工作流拆分、模型与程序分工、处理路径和检查反馈，通过十个完整案例理解设计方法。",
          "summaryEn": "Design workflow steps, assign work, route tasks and apply feedback through ten complete examples.",
          "languages": [
            "zh-Hans",
            "en"
          ],
          "sourceEn": "docs/en/AGENT_AUTOMATION.md"
        },
        {
          "id": "agent-evaluation",
          "legacyModuleId": "agent-evaluation",
          "number": 5,
          "title": "五. 评分与改进系统",
          "titleEn": "V. Evaluation and improvement",
          "status": "available",
          "source": "docs/AGENT_EVALUATION.md",
          "summary": "认识四类评估工具，使用 LangSmith 运行评估、阅读报告，并结合人工修改和自动优化改进提示词。",
          "summaryEn": "Explore evaluation tools, run LangSmith evaluations, read reports and improve prompts through manual changes and automatic optimization.",
          "languages": [
            "zh-Hans",
            "en"
          ],
          "sourceEn": "docs/en/AGENT_EVALUATION.md"
        }
      ]
    },
    {
      "id": "ai-coding",
      "title": "AI 编程",
      "titleEn": "AI coding",
      "summary": "从传统编程的五个核心环节出发，学习编程思路与重要技术，再了解 AI 如何逐步提供帮助。",
      "summaryEn": "Learn programming methods and essential techniques through five core stages, then explore how AI can assist each stage.",
      "color": "#d2ac72",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "available",
      "subcategories": [],
      "lessons": [
        {
          "id": "coding-foundations",
          "kind": "reading",
          "title": "传统编程",
          "titleEn": "Traditional programming",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans",
            "en"
          ]
        },
        {
          "id": "coding-assistance",
          "kind": "reading",
          "title": "AI 如何助力传统编程",
          "titleEn": "How AI assists programming",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans",
            "en"
          ]
        }
      ],
      "chapters": [
        {
          "id": "coding-foundations",
          "title": "传统编程",
          "titleEn": "Traditional programming",
          "summary": "认识编程的五个核心环节，以及运行环境、程序结构、Git、测试与调试等重要技术。",
          "summaryEn": "Learn the five core stages of programming, from environments and code structure to Git, testing and debugging.",
          "number": 1,
          "status": "available",
          "source": "docs/AI_CODING.md",
          "sourceEn": "docs/en/AI_CODING.md",
          "languages": [
            "zh-Hans",
            "en"
          ]
        },
        {
          "id": "coding-assistance",
          "title": "AI 如何助力传统编程",
          "titleEn": "How AI assists programming",
          "summary": "沿着五个核心环节，了解可以直接使用的 Agent、Skill 和工具。",
          "summaryEn": "Explore agents, skills and tools that help with each of the five programming stages.",
          "number": 2,
          "status": "available",
          "source": "docs/AI_CODING.md",
          "sourceEn": "docs/en/AI_CODING.md",
          "languages": [
            "zh-Hans",
            "en"
          ]
        }
      ]
    },
    {
      "id": "image-creation",
      "title": "图像创作",
      "titleEn": "Image creation",
      "summary": "学习专业图像生成、通过 Agent 操作 Photoshop，以及寻找和复用现成工作流。",
      "summaryEn": "Explore professional image generation, agent-assisted Photoshop and reusable workflows.",
      "color": "#b69bd7",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "available",
      "subcategories": [],
      "lessons": [
        {
          "id": "image-generation",
          "kind": "reading",
          "title": "专业图像生成与工作流",
          "titleEn": "Professional image generation and workflows",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "image-photoshop-agent",
          "kind": "reading",
          "title": "使用 Agent 辅助操作 Photoshop",
          "titleEn": "Use an agent to operate Photoshop",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "image-workflow-reuse",
          "kind": "reading",
          "title": "寻找与复用现成工作流",
          "titleEn": "Find and reuse existing workflows",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans"
          ]
        }
      ],
      "chapters": [
        {
          "id": "image-generation",
          "title": "专业图像生成与工作流",
          "titleEn": "Professional image generation and workflows",
          "summary": "使用 Midjourney 与 Stable Diffusion，理解参考图、局部重绘、ControlNet、LoRA 和生成参数。",
          "summaryEn": "Use Midjourney and Stable Diffusion with references, inpainting, ControlNet, LoRA and generation settings.",
          "number": 1,
          "status": "available",
          "source": "docs/IMAGE_CREATION_CURRICULUM.md",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "image-photoshop-agent",
          "title": "使用 Agent 辅助操作 Photoshop",
          "titleEn": "Use an agent to operate Photoshop",
          "summary": "接入 Photoshop 内置助手或外部 MCP 工具，通过自然语言完成编辑与导出。",
          "summaryEn": "Connect Photoshop's assistant or external MCP tools, then edit and export through natural-language requests.",
          "number": 2,
          "status": "available",
          "source": "docs/IMAGE_CREATION_CURRICULUM.md",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "image-workflow-reuse",
          "title": "寻找与复用现成工作流",
          "titleEn": "Find and reuse existing workflows",
          "summary": "按人物一致性、商品图、局部修改和图片放大，查找资料并复用现成流程。",
          "summaryEn": "Reuse workflows for character consistency, product images, local edits and upscaling.",
          "number": 3,
          "status": "available",
          "source": "docs/IMAGE_CREATION_CURRICULUM.md",
          "languages": [
            "zh-Hans"
          ]
        }
      ]
    },
    {
      "id": "video-creation",
      "title": "视频创作",
      "titleEn": "Video creation",
      "summary": "学习即梦、通义万相与海螺的视频生成，通过 Agent 操作编辑软件，并复用原作者工作流。",
      "summaryEn": "Generate with Jimeng, Wan and Hailuo, connect agents to video editors and follow original creators' workflows.",
      "color": "#d293a9",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "available",
      "subcategories": [],
      "lessons": [
        {
          "id": "video-generation",
          "kind": "reading",
          "title": "专业视频生成平台、基本介绍与教程",
          "titleEn": "Professional video generation platforms and tutorials",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "video-editing-agent",
          "kind": "reading",
          "title": "使用 Agent 操作专业视频编辑平台",
          "titleEn": "Use an agent to operate professional video editors",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "video-workflow-reuse",
          "kind": "reading",
          "title": "新人可以复用的工作流",
          "titleEn": "Existing workflows for beginners",
          "language": "zh-Hans",
          "languages": [
            "zh-Hans"
          ]
        }
      ],
      "chapters": [
        {
          "id": "video-generation",
          "title": "专业视频生成平台、基本介绍与教程",
          "titleEn": "Professional video generation platforms and tutorials",
          "summary": "了解即梦、通义万相与海螺，阅读官方教程并掌握视频生成的控制点。",
          "summaryEn": "Explore Jimeng, Wan and Hailuo, their official tutorials and generation controls.",
          "number": 1,
          "status": "available",
          "source": "docs/VIDEO_CREATION_CURRICULUM.md",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "video-editing-agent",
          "title": "使用 Agent 操作专业视频编辑平台",
          "titleEn": "Use an agent to operate professional video editors",
          "summary": "选择达芬奇或 Premiere，连接 Agent，通过自然语言处理视频工程。",
          "summaryEn": "Connect an agent to DaVinci Resolve or Premiere for natural-language editing.",
          "number": 2,
          "status": "available",
          "source": "docs/VIDEO_CREATION_CURRICULUM.md",
          "languages": [
            "zh-Hans"
          ]
        },
        {
          "id": "video-workflow-reuse",
          "title": "新人可以复用的工作流",
          "titleEn": "Existing workflows for beginners",
          "summary": "跟随原作者的即梦、Wan 和 H3 案例，查看教程、素材获取条件与实际使用版本。",
          "summaryEn": "Follow original creators' Jimeng, Wan and H3 workflows with source tutorials and version details.",
          "number": 3,
          "status": "available",
          "source": "docs/VIDEO_CREATION_CURRICULUM.md",
          "languages": [
            "zh-Hans"
          ]
        }
      ]
    },
    {
      "id": "other-brands-tasks",
      "title": "其他品牌与任务",
      "titleEn": "Other brands and tasks",
      "summary": "容纳前述方向之外的品牌专题与专项任务。",
      "summaryEn": "Explore brand-specific topics and specialized tasks outside the other directions.",
      "color": "#b2b59b",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "planned",
      "subcategories": [],
      "lessons": []
    }
  ],
  "items": {},
  "platforms": []
};
