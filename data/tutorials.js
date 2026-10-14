/* Task-oriented curriculum. The foundation includes an interactive prompting workflow.
 * Empty legacy collections preserve read-only tooling compatibility; brand ingestion is retired. */
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
      "lessons": [{
        "id": "prompt-workflow",
        "kind": "interactive-workflow",
        "title": "从一句需求到可用结果",
        "titleEn": "From a request to a usable result"
      }]
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
      "summary": "用 AI 辅助理解、编写、调试与验证代码，完成软件开发任务。",
      "summaryEn": "Use AI to understand, write, debug and verify code for software projects.",
      "color": "#d2ac72",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "planned",
      "subcategories": [],
      "lessons": []
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
      "summary": "围绕视频作品，学习从创意构思到画面生成与制作。",
      "summaryEn": "Explore video ideas, generated footage and production workflows.",
      "color": "#d293a9",
      "prerequisites": [
        "conversation-basics"
      ],
      "topics": [],
      "status": "planned",
      "subcategories": [],
      "lessons": []
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
