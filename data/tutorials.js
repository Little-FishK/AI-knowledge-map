window.TUTORIALS = {
  "schemaVersion": 2,
  "meta": {
    "version": "2.1",
    "updatedAt": "2026-10-12"
  },
  "foundationId": "conversation-basics",
  "modules": [
    {
      "id": "conversation-basics",
      "title": "对话与基础任务",
      "titleEn": "Conversation and basic tasks",
      "summary": "学习与 AI 对话、表达需求和检查结果，为后续六个方向打好基础。",
      "summaryEn": "Learn to communicate with AI, describe tasks and check results before exploring the six directions.",
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
      "status": "planned",
      "subcategories": [],
      "lessons": []
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
      "summary": "从创作意图出发，学习图像生成、编辑与视觉表达。",
      "summaryEn": "Explore image generation, editing and visual expression, starting from a creative intent.",
      "color": "#b69bd7",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "planned",
      "subcategories": [],
      "lessons": []
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
      "id": "music-creation",
      "title": "音乐创作",
      "titleEn": "Music creation",
      "summary": "围绕音乐作品，学习构思、生成与调整。",
      "summaryEn": "Explore composing, generating and refining music.",
      "color": "#82b9ce",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "planned",
      "subcategories": [],
      "lessons": []
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
