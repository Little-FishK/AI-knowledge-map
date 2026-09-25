/* 中国前沿实验室官方技术资料包：当前仅发布 DeepSeek。
   Qwen、Moonshot AI、Zhipu AI 已按资料库治理要求下线。

   登记规则（与 data/library-new-sources.js 一致）：
   - selectionReason 必须写明通过的是哪道闸门（一手 / 首创 / 应答 / 归属）；
   - url 必须落在 tools/validators/library.js 中该二级分类的域名白名单内；
   - url 全局唯一，且必须为可直接访问的 HTTPS 原始地址。 */
(function () {
  "use strict";

  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) {
    throw new Error("加载中国前沿实验室官方资料前必须先加载 data/library.js");
  }

  const ACCESSED_AT = "2026-09-23";

  const publishers = {
    "deepseek": "DeepSeek（深度求索）"
  };

  /* 不同内容类型的使用边界不同：文档、模型卡、代码仓库、发布公告各有各的失效方式。 */
  const limitationsByKind = {
    "官方技术文档": [
      "只支持该厂商当前公开接口、参数与官方建议，不能替代跨平台独立比较",
      "在线文档会持续更新，涉及版本、价格、限额与区域可用性时必须复核原页"
    ],
    "官方模型卡": [
      "模型卡由发布方自述，能力声明需由第三方评测或独立复现交叉验证",
      "权重许可与商业使用条件以模型卡与随附许可证为准，可能随时调整"
    ],
    "官方代码仓库": [
      "仓库由厂商自行维护，代码与权重的可用范围以仓库声明的许可证为准",
      "星标数与活跃度只是关注度信号，不能当作能力结论"
    ],
    "官方发布公告": [
      "公告是发布方自述，性能与价格数字需以实际接口表现和账单为准",
      "公告发布后不会回填修订，引用必须带发布日期，避免当作最新状态"
    ]
  };

  const entries = [
    /* ---------- DeepSeek ---------- */
    {
      id: "deepseek-v4-pro-model-card",
      vendor: "deepseek",
      title: "DeepSeek-V4-Pro 模型卡",
      kind: "官方模型卡",
      collection: "Hugging Face 官方模型卡",
      url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro",
      summary: "V4 系列中 Pro 档的官方开放权重与模型卡，文本生成类，同时以 API 服务形态提供。模型卡给出架构说明、调用方式与许可条款，是核对「开放权重版本与线上 API 版本是否同一档」的一手依据。",
      reason: "一手闸门：权重与模型卡由深度求索自身发布，非第三方转述；归属追前沿区与官方技术资料类。",
      evidenceUse: "可直接支持「V4-Pro 是否开源、以什么许可发布、官方自述支持哪些任务」这类陈述；跨模型能力比较需另找独立评测。",
      tags: ["DeepSeek", "官方模型卡", "开放权重", "追前沿"],
      nodes: ["llm", "model-families", "pretraining"]
    },
    {
      id: "deepseek-v41-flash-release",
      vendor: "deepseek",
      title: "DeepSeek-V4.1-Flash 发布公告",
      kind: "官方发布公告",
      collection: "DeepSeek API 官方文档 · 公告",
      url: "https://api-docs.deepseek.com/news/news260910/",
      publishedAt: "2026-09-10",
      summary: "V4.1-Flash 上线的官方公告，标题口径为「更聪明、更快、更省」，把该版本定位在速度与成本一侧。它是该型号首次公开的能力与效率表述，需与文档中的价格页和实际接口表现对照阅读。",
      reason: "一手闸门：版本发布口径由厂商在自家 API 文档站首发；首创闸门：该版本号与定位的首次公开表述即在此页。",
      evidenceUse: "可支持「该版本何时上线、官方如何定位它」这类陈述；具体性能与价格数字必须回到定价页或实测。",
      tags: ["DeepSeek", "发布公告", "V4.1-Flash"],
      nodes: ["llm", "model-selection", "inference-optimization"]
    },
    {
      id: "deepseek-v4-preview-release",
      vendor: "deepseek",
      title: "DeepSeek V4 Preview 发布公告",
      kind: "官方发布公告",
      collection: "DeepSeek API 官方文档 · 公告",
      url: "https://api-docs.deepseek.com/news/news260424/",
      publishedAt: "2026-04-24",
      summary: "V4 预览版的上线公告，正文明确「进入高性价比的 100 万令牌上下文时代」并宣布开源。这条公告是 V4 系列（含后续 Pro 与 Flash）的起点，也是「百万级上下文进入低价区间」这一判断的原始出处。",
      reason: "首创闸门：百万级上下文与开源承诺的首次官方表述即在此页；一手闸门：由厂商自身发布并带明确日期。",
      evidenceUse: "可支持「长上下文何时进入低价区间、由谁先宣布开源」这类陈述；实际上下文上限与计费仍需核对当前定价页。",
      tags: ["DeepSeek", "发布公告", "长上下文", "开源"],
      nodes: ["context-window", "llm", "model-families"]
    },
    {
      id: "deepseek-harness",
      vendor: "deepseek",
      title: "DeepSeek Harness（Agent 运行时）",
      kind: "官方代码仓库",
      collection: "DeepSeek 官方仓库",
      url: "https://github.com/deepseek-ai/deepseek-harness",
      publishedAt: "2026-08-13",
      summary: "官方开源的 Agent 运行时框架，自述定位是「一切皆插件」（Everything is a Plugin），以 TypeScript 编写，主题标签为 AI Agent 与插件体系，项目主页为 deepseek.com/harness。它是该组织公开仓库中关注度最高的一项。",
      reason: "一手闸门：代码、插件规范与项目主页均由深度求索自身维护；归属编程与 Agent 区。",
      evidenceUse: "可支持「该厂商是否提供自有 Agent 运行时、以什么方式扩展」这类陈述；框架优劣需另行实测。",
      tags: ["DeepSeek", "Agent", "开源仓库", "TypeScript"],
      nodes: ["agent", "agent-frameworks", "agent-skills"]
    },
    {
      id: "deepseek-v3-repo",
      vendor: "deepseek",
      title: "DeepSeek-V3 官方仓库",
      kind: "官方代码仓库",
      collection: "DeepSeek 官方仓库",
      url: "https://github.com/deepseek-ai/DeepSeek-V3",
      publishedAt: "2024-12-26",
      summary: "第三代主力模型的官方仓库，给出权重、推理与微调指引。该系列公开的架构路线（多头潜在注意力与混合专家相结合）被后续 V4 系列沿用，也是开源社区围绕其编写推理内核的起点。",
      reason: "一手闸门：权重与代码由厂商自身发布；首创闸门：该架构组合的开源实现首次公开于此系列。",
      evidenceUse: "可支持「该架构何时开源、官方提供哪些部署路径」这类陈述；架构效果需参考论文或独立复现。",
      tags: ["DeepSeek", "开源权重", "MoE", "MLA"],
      nodes: ["moe", "attention", "llm"]
    },
    {
      id: "deepseek-r1-repo",
      vendor: "deepseek",
      title: "DeepSeek-R1 官方仓库",
      kind: "官方代码仓库",
      collection: "DeepSeek 官方仓库",
      url: "https://github.com/deepseek-ai/DeepSeek-R1",
      publishedAt: "2025-01-20",
      summary: "推理模型 R1 的官方仓库，说明其以强化学习激发长链推理的训练思路，并提供蒸馏小模型的做法。该系列是把「思维链」推向公开讨论、并大规模开放权重的代表性产出。",
      reason: "一手闸门：权重与训练说明由厂商自身发布；应答闸门：长期被引用为开源推理模型的比较基准。",
      evidenceUse: "可支持「推理能力可否靠强化学习从基础模型激发出来」这类讨论的原始出处；结论强弱需看后续复现。",
      tags: ["DeepSeek", "推理模型", "开源权重", "思维链"],
      nodes: ["reasoning-models", "cot", "rlhf"]
    },
    {
      id: "deepseek-ocr-repo",
      vendor: "deepseek",
      title: "DeepSeek-OCR 官方仓库",
      kind: "官方代码仓库",
      collection: "DeepSeek 官方仓库",
      url: "https://github.com/deepseek-ai/DeepSeek-OCR",
      publishedAt: "2025-10-17",
      summary: "官方 OCR 模型仓库，主题是「上下文光学压缩」——把文档图像压缩为更少的视觉令牌再交给语言模型处理。它代表了一条不同于纯文本切分的长文档处理路线，也是理解多模态与上下文成本之间关系的一手材料。",
      reason: "首创闸门：「上下文光学压缩」这一提法由该仓库提出；一手闸门：代码与权重由厂商自身发布。",
      evidenceUse: "可支持「长文档能否用视觉压缩降低令牌消耗」这类陈述；压缩率与精度取舍需看仓库实验数据。",
      tags: ["DeepSeek", "OCR", "多模态", "上下文"],
      nodes: ["multimodal", "context-compaction", "tokenization"]
    },
    {
      id: "deepseek-thinking-mode-doc",
      vendor: "deepseek",
      title: "思考模式（Thinking Mode）",
      kind: "官方技术文档",
      collection: "DeepSeek API 官方文档 · 指南",
      url: "https://api-docs.deepseek.com/guides/thinking_mode/",
      summary: "说明模型在输出最终答案前先输出思维链的推理模式，以及该模式下请求参数与返回字段的差异。它是把「推理模型」与「普通对话模型」在工程上区分开的官方口径。",
      reason: "一手闸门：接口行为由厂商自身定义并文档化；归属追前沿区与推理策略相关节点。",
      evidenceUse: "可直接支持「该模型如何开启推理、返回结构有何不同」这类工程陈述。",
      tags: ["DeepSeek", "推理模式", "API文档"],
      nodes: ["reasoning-models", "cot", "sampling-params"]
    },
    {
      id: "deepseek-context-caching-doc",
      vendor: "deepseek",
      title: "上下文硬盘缓存（Context Caching）",
      kind: "官方技术文档",
      collection: "DeepSeek API 官方文档 · 指南",
      url: "https://api-docs.deepseek.com/guides/kv_cache/",
      summary: "介绍对所有用户默认开启的硬盘上下文缓存：命中缓存的输入令牌按更低价格计费，且无需修改调用方式即可受益。它把提示缓存从「可选优化」变成了默认行为，是解读其定价结构与缓存机制关系的关键文档。",
      reason: "一手闸门：缓存策略与计费口径由厂商自身公布；首创闸门：默认开启的硬盘级缓存是其价格结构的独有说明。",
      evidenceUse: "可支持「缓存如何影响成本、是否需要改代码」这类陈述；命中率与实际折扣需以账单为准。",
      tags: ["DeepSeek", "提示缓存", "成本优化"],
      nodes: ["prompt-caching", "inference-optimization"]
    },
    {
      id: "deepseek-models-and-pricing",
      vendor: "deepseek",
      title: "模型与价格（Models & Pricing）",
      kind: "官方技术文档",
      collection: "DeepSeek API 官方文档 · 快速开始",
      url: "https://api-docs.deepseek.com/quick_start/pricing/",
      summary: "以「每百万令牌」为单位列出各模型的输入价、输出价与缓存命中价，是判断其性价比定位的原始价格表。价格属动态信息，引用时必须标注读取日期并与实际账单核对。",
      reason: "一手闸门：价格由厂商自身公布，是价格类陈述唯一权威的出处；归属模型选型与成本节点。",
      evidenceUse: "可直接支持「某模型的官方标价是多少」这类陈述，但必须同时给出读取日期。",
      tags: ["DeepSeek", "定价", "成本"],
      nodes: ["model-selection", "prompt-caching"]
    },

    /* ---------- Qwen ---------- */
    {
      id: "qwen38-27b-model-card",
      vendor: "qwen",
      title: "Qwen3.8-27B 模型卡",
      kind: "官方模型卡",
      collection: "Hugging Face 官方模型卡",
      url: "https://huggingface.co/Qwen/Qwen3.8-27B",
      summary: "Qwen3.8 系列中 270 亿参数档的开放权重与模型卡，支持图文输入。它是该组织在 Hugging Face 上点赞与下载量最高的模型，可作为该系列开放权重发布的代表样本。",
      reason: "一手闸门：权重与模型卡由通义千问团队自身发布；归属追前沿区与官方技术资料类。",
      evidenceUse: "可支持「该系列有哪些开放权重档位、以什么许可发布」这类陈述；能力排名需另找独立评测。",
      tags: ["Qwen", "官方模型卡", "开放权重", "多模态"],
      nodes: ["llm", "multimodal", "model-families"]
    },
    {
      id: "qwen38-repo",
      vendor: "qwen",
      title: "Qwen3.8 官方仓库",
      kind: "官方代码仓库",
      collection: "Qwen 官方仓库",
      url: "https://github.com/QwenLM/Qwen3.8",
      publishedAt: "2025-09-11",
      summary: "当前主推系列的官方仓库，给出权重清单、推理部署与微调入口，并以 qwen.ai 作为产品主页；系列同时覆盖文本与多模态规格。",
      reason: "一手闸门：仓库与产品主页由通义千问团队维护；归属追前沿区与模型家族节点。",
      evidenceUse: "可支持「该系列由谁发布、提供哪些使用方式」这类陈述；版本差异需对照仓库更新记录。",
      tags: ["Qwen", "开源仓库", "模型系列"],
      nodes: ["llm", "model-families"]
    },
    {
      id: "qwen3-repo",
      vendor: "qwen",
      title: "Qwen3 官方仓库",
      kind: "官方代码仓库",
      collection: "Qwen 官方仓库",
      url: "https://github.com/QwenLM/Qwen3",
      publishedAt: "2024-02-05",
      summary: "Qwen3 系列官方仓库，给出各尺寸权重的下载、推理与微调方式，是该团队开源模型的主仓库之一，也是理解「同一底座按尺寸分层开放」这一做法的入口。",
      reason: "一手闸门：仓库由通义千问团队自身维护；应答闸门：长期作为开源中文模型比较的参照仓库。",
      evidenceUse: "可支持「该系列开放了哪些尺寸、如何部署」这类陈述。",
      tags: ["Qwen", "开源仓库", "模型系列"],
      nodes: ["llm", "model-families"]
    },
    {
      id: "qwen-code",
      vendor: "qwen",
      title: "Qwen Code（终端编码 Agent）",
      kind: "官方代码仓库",
      collection: "Qwen 官方仓库",
      url: "https://github.com/QwenLM/qwen-code",
      publishedAt: "2025-06-26",
      summary: "官方开源的终端编码 Agent，主题标签包含 agentic、MCP 与开发者工具，使用文档托管在其 GitHub Pages 站点。它把模型能力直接落到「在命令行里改代码」这一形态。",
      reason: "一手闸门：代码与文档由通义千问团队自身维护；归属编程与 Agent 区。",
      evidenceUse: "可支持「该厂商是否提供自有编码 Agent、支持哪些协议」这类陈述；使用效果需另行实测。",
      tags: ["Qwen", "编码Agent", "命令行", "开源"],
      nodes: ["coding-tools", "agent", "mcp"]
    },
    {
      id: "qwen-agent-framework",
      vendor: "qwen",
      title: "Qwen-Agent 框架",
      kind: "官方代码仓库",
      collection: "Qwen 官方仓库",
      url: "https://github.com/QwenLM/Qwen-Agent",
      publishedAt: "2023-09-22",
      summary: "基于 Qwen 的 Agent 框架，官方列出函数调用、MCP、代码解释器与检索增强生成等能力，并附带示例应用（含浏览器扩展）。它把「模型 + 工具 + 记忆」的常见组合收敛为一套可直接运行的参考实现。",
      reason: "一手闸门：框架由通义千问团队自身发布；归属 Agent 与工具系统区。",
      evidenceUse: "可支持「官方推荐的 Agent 组装方式是什么」这类陈述；框架成熟度需看社区使用情况。",
      tags: ["Qwen", "Agent框架", "工具调用"],
      nodes: ["agent-frameworks", "tool-calling", "rag", "mcp"]
    },
    {
      id: "qwen3-vl-repo",
      vendor: "qwen",
      title: "Qwen3-VL 官方仓库",
      kind: "官方代码仓库",
      collection: "Qwen 官方仓库",
      url: "https://github.com/QwenLM/Qwen3-VL",
      publishedAt: "2024-08-29",
      summary: "Qwen3 系列的视觉语言分支官方仓库，给出权重、推理与部署说明；视觉理解是该团队与纯文本模型并行推进的主线能力之一。",
      reason: "一手闸门：仓库与权重由通义千问团队自身发布；归属多模态节点。",
      evidenceUse: "可支持「该系列的多模态能力以什么形态开放」这类陈述。",
      tags: ["Qwen", "多模态", "开源仓库"],
      nodes: ["multimodal", "llm"]
    },
    {
      id: "qwen-quickstart-doc",
      vendor: "qwen",
      title: "Qwen 快速开始",
      kind: "官方技术文档",
      collection: "Qwen 官方文档（qwen.readthedocs.io）",
      url: "https://qwen.readthedocs.io/en/latest/getting_started/quickstart.html",
      summary: "官方文档的入门页，说明如何取得权重并在本地完成第一次推理，与「关键概念」页共同构成理解该系列使用方式的最短路径。",
      reason: "一手闸门：文档由通义千问团队维护；归属官方技术资料类。",
      evidenceUse: "可直接支持「如何上手该系列模型」这类操作性问题。",
      tags: ["Qwen", "官方文档", "快速开始"],
      nodes: ["llm"]
    },
    {
      id: "qwen-key-concepts-doc",
      vendor: "qwen",
      title: "Qwen 关键概念（Key Concepts）",
      kind: "官方技术文档",
      collection: "Qwen 官方文档（qwen.readthedocs.io）",
      url: "https://qwen.readthedocs.io/en/latest/getting_started/concepts.html",
      summary: "官方文档的概念页，用于解释该系列在命名、规格与调用方式上的术语，是把型号名称与真实能力对应起来的官方口径。",
      reason: "一手闸门：术语定义由通义千问团队自身给出；归属模型家族与官方技术资料类。",
      evidenceUse: "可支持「某类型号名对应什么规格」这类术语澄清，避免从名称想当然推断能力。",
      tags: ["Qwen", "官方文档", "术语"],
      nodes: ["llm", "model-families"]
    },
    {
      id: "qwen-function-calling-doc",
      vendor: "qwen",
      title: "Qwen 函数调用（Function Calling）",
      kind: "官方技术文档",
      collection: "Qwen 官方文档（qwen.readthedocs.io）",
      url: "https://qwen.readthedocs.io/en/latest/framework/function_call.html",
      summary: "官方文档的工具调用章节，说明如何把外部函数暴露给模型并处理调用结果；这是把对话模型接成可执行 Agent 的接口层依据。",
      reason: "一手闸门：接口约定由通义千问团队自身文档化；归属工具调用节点。",
      evidenceUse: "可直接支持「该系列如何声明与解析工具调用」这类工程陈述。",
      tags: ["Qwen", "官方文档", "工具调用"],
      nodes: ["tool-calling", "agent"]
    },
    {
      id: "qwen-vllm-deployment-doc",
      vendor: "qwen",
      title: "Qwen 用 vLLM 部署",
      kind: "官方技术文档",
      collection: "Qwen 官方文档（qwen.readthedocs.io）",
      url: "https://qwen.readthedocs.io/en/latest/deployment/vllm.html",
      summary: "官方文档中关于用 vLLM 部署该系列模型的章节，给出启动参数与吞吐、显存之间的取舍建议；属于「模型不变、成本可变」这一类工程知识。",
      reason: "一手闸门：部署建议由通义千问团队自身给出；归属部署与推理优化节点。",
      evidenceUse: "可支持「该系列在 vLLM 上如何配置」这类操作性问题；实测吞吐需自行压测。",
      tags: ["Qwen", "官方文档", "部署", "vLLM"],
      nodes: ["deployment", "inference-optimization"]
    },

    /* ---------- Moonshot AI ---------- */
    {
      id: "kimi-k3-model-card",
      vendor: "moonshot-ai",
      title: "Kimi-K3 模型卡",
      kind: "官方模型卡",
      collection: "Hugging Face 官方模型卡",
      url: "https://huggingface.co/moonshotai/Kimi-K3",
      summary: "Kimi K3 的官方开放权重与模型卡，属图文输入模型；它是该组织在 Hugging Face 上点赞与下载量最高的权重发布，可作为其开放路线的代表样本。",
      reason: "一手闸门：权重与模型卡由月之暗面自身发布；归属追前沿区与官方技术资料类。",
      evidenceUse: "可支持「K3 是否开放权重、以什么形态提供」这类陈述；能力结论需独立复现。",
      tags: ["Moonshot AI", "Kimi", "官方模型卡", "开放权重"],
      nodes: ["llm", "model-families", "multimodal"]
    },
    {
      id: "kimi-k3-repo",
      vendor: "moonshot-ai",
      title: "Kimi-K3 官方仓库",
      kind: "官方代码仓库",
      collection: "Kimi 官方仓库",
      url: "https://github.com/MoonshotAI/Kimi-K3",
      publishedAt: "2026-07-27",
      summary: "K3 官方仓库，自述定位为「Open Frontier Intelligence」，即把前沿智能以开放权重形式发布。仓库与模型卡是同一发布的两个入口，对照阅读可区分「权重可用」与「托管服务可用」。",
      reason: "一手闸门：仓库由月之暗面自身维护；首创闸门：该系列以开放权重形式发布的首次公开表述在此。",
      evidenceUse: "可支持「该前沿模型是否开源、何时开源」这类陈述；工程可用性需以仓库说明与许可为准。",
      tags: ["Moonshot AI", "Kimi K3", "开源仓库", "开放权重"],
      nodes: ["llm", "model-families"]
    },
    {
      id: "kimi-k2-repo",
      vendor: "moonshot-ai",
      title: "Kimi-K2 官方仓库",
      kind: "官方代码仓库",
      collection: "Kimi 官方仓库",
      url: "https://github.com/MoonshotAI/Kimi-K2",
      publishedAt: "2025-07-03",
      summary: "K2 系列官方仓库，是该团队转向大规模开源路线的关键系列，仓库给出权重与部署说明；其后的 K2.5、K2.6、K2.7-Code 等分支均由此延伸。",
      reason: "一手闸门：仓库由月之暗面自身维护；应答闸门：该系列长期作为开源前沿模型的比较对象被引用。",
      evidenceUse: "可支持「开源路线从哪一代开始、后续如何分化」这类陈述。",
      tags: ["Moonshot AI", "Kimi K2", "开源仓库"],
      nodes: ["llm", "model-families"]
    },
    {
      id: "kimi-k25-repo",
      vendor: "moonshot-ai",
      title: "Kimi-K2.5 官方仓库",
      kind: "官方代码仓库",
      collection: "Kimi 官方仓库",
      url: "https://github.com/MoonshotAI/Kimi-K2.5",
      publishedAt: "2026-01-30",
      summary: "K2.5 官方仓库，自述定位为「Open Visual Agentic Intelligence」，即把视觉与 Agent 能力合并进同一开放权重系列；与 K3 的「前沿智能」定位形成分工。",
      reason: "一手闸门：仓库由月之暗面自身维护；归属多模态与 Agent 区。",
      evidenceUse: "可支持「该系列如何按能力分化不同档位」这类陈述。",
      tags: ["Moonshot AI", "Kimi K2.5", "视觉Agent", "开源"],
      nodes: ["multimodal", "agent", "llm"]
    },
    {
      id: "kimi-code-cli",
      vendor: "moonshot-ai",
      title: "Kimi Code CLI",
      kind: "官方代码仓库",
      collection: "Kimi 官方仓库",
      url: "https://github.com/MoonshotAI/kimi-code",
      publishedAt: "2026-05-22",
      summary: "官方命令行编码 Agent（TypeScript，MIT 许可），自述为「下一代 Agent 的起点」，使用文档托管在 kimi.com/code/docs。它取代了已归档的旧版 Python 命令行工具，是该团队在编码场景的现行入口。",
      reason: "一手闸门：代码与文档由月之暗面自身维护；归属编程与 Agent 区。",
      evidenceUse: "可支持「该团队当前推荐的编码 Agent 是哪一个」这类陈述。",
      tags: ["Moonshot AI", "编码Agent", "命令行", "开源"],
      nodes: ["coding-tools", "agent", "agent-skills"]
    },
    {
      id: "moonshot-moba",
      vendor: "moonshot-ai",
      title: "MoBA：块注意力混合",
      kind: "官方代码仓库",
      collection: "Kimi 官方仓库",
      url: "https://github.com/MoonshotAI/MoBA",
      publishedAt: "2025-02-17",
      summary: "面向长上下文大模型的注意力机制开源实现，把「稀疏注意力该选哪些块」这个问题用混合专家式的路由方式处理；主题标签覆盖混合专家、训练与推理服务，是长上下文成本问题的一条官方技术路线。",
      reason: "首创闸门：该机制的开源实现由团队自身发布；一手闸门：代码与说明为一手材料。",
      evidenceUse: "可支持「长上下文注意力成本有哪些公开解决思路」这类陈述；效果需参考论文或独立复现。",
      tags: ["Moonshot AI", "注意力机制", "长上下文", "开源"],
      nodes: ["attention", "context-window", "moe"]
    },
    {
      id: "kimi-audio-repo",
      vendor: "moonshot-ai",
      title: "Kimi-Audio 官方仓库",
      kind: "官方代码仓库",
      collection: "Kimi 官方仓库",
      url: "https://github.com/MoonshotAI/Kimi-Audio",
      publishedAt: "2025-04-25",
      summary: "开源音频基础模型仓库，覆盖音频理解、生成与对话三类任务；是该团队把开放权重从文本扩展到语音模态的官方产出。",
      reason: "一手闸门：模型与代码由月之暗面自身发布；归属多模态生成区。",
      evidenceUse: "可支持「该团队的开放权重覆盖到哪些模态」这类陈述。",
      tags: ["Moonshot AI", "音频", "语音", "开源"],
      nodes: ["speech", "audio-generation", "multimodal"]
    },
    {
      id: "kimi-k27-code-model-card",
      vendor: "moonshot-ai",
      title: "Kimi-K2.7-Code 模型卡",
      kind: "官方模型卡",
      collection: "Hugging Face 官方模型卡",
      url: "https://huggingface.co/moonshotai/Kimi-K2.7-Code",
      summary: "K2 系列中专攻代码的开放权重模型卡；在官方模型矩阵里，它是「同一底座、按任务分化」这一策略的具体体现，适合与通用 K2 分支对照理解。",
      reason: "一手闸门：权重与模型卡由月之暗面自身发布；归属编程区。",
      evidenceUse: "可支持「该系列是否为代码任务单独发布权重」这类陈述；编码能力排名需另看独立榜单。",
      tags: ["Moonshot AI", "代码模型", "官方模型卡"],
      nodes: ["coding-tools", "code-generation", "llm"]
    },
    {
      id: "kimi-open-platform-quickstart",
      vendor: "moonshot-ai",
      title: "Kimi 开放平台：快速开始",
      kind: "官方技术文档",
      collection: "Kimi 开放平台文档",
      url: "https://platform.kimi.com/docs/get-api-key",
      summary: "开放平台文档的入门页，说明从创建 API Key 到完成第一次调用的完整步骤，是「如何接入 Kimi 服务」的官方口径。",
      reason: "一手闸门：接入流程由厂商自身文档化；归属官方技术资料类。",
      evidenceUse: "可直接支持「接入该服务需要哪些步骤」这类操作性问题。",
      tags: ["Moonshot AI", "Kimi", "API文档", "快速开始"],
      nodes: ["llm"]
    },
    {
      id: "kimi-open-platform-pricing",
      vendor: "moonshot-ai",
      title: "Kimi 模型推理价格说明",
      kind: "官方技术文档",
      collection: "Kimi 开放平台文档",
      url: "https://platform.kimi.com/docs/pricing/chat",
      summary: "开放平台的计费文档，解释令牌计费单位、输入输出分别计价、缓存优惠与各模型价格入口。价格属动态信息，引用时必须标注读取日期。",
      reason: "一手闸门：计费口径由厂商自身公布，是价格类陈述唯一权威的出处；归属模型选型与成本节点。",
      evidenceUse: "可直接支持「某模型官方标价是多少」这类陈述，但须同时给出读取日期。",
      tags: ["Moonshot AI", "定价", "成本"],
      nodes: ["model-selection", "prompt-caching"]
    },

    /* ---------- Zhipu AI ---------- */
    {
      id: "glm-5-repo",
      vendor: "zhipu-ai",
      title: "GLM-5 官方仓库",
      kind: "官方代码仓库",
      collection: "GLM 官方仓库",
      url: "https://github.com/zai-org/GLM-5",
      publishedAt: "2026-02-09",
      summary: "GLM-5 官方仓库，自述主题为「从氛围编程走向 Agentic 工程」，主题标签覆盖 agentic 智能体、长时程任务与编码，并指向官方博客作为技术说明入口。",
      reason: "一手闸门：仓库与说明由智谱自身维护；归属编程与 Agent 区。",
      evidenceUse: "可支持「该代模型官方主打什么能力方向」这类陈述；实际效果需独立评测。",
      tags: ["Zhipu AI", "GLM", "开源仓库", "Agentic"],
      nodes: ["coding-tools", "agent", "llm"]
    },
    {
      id: "glm-52-model-card",
      vendor: "zhipu-ai",
      title: "GLM-5.2 模型卡",
      kind: "官方模型卡",
      collection: "Hugging Face 官方模型卡",
      url: "https://huggingface.co/zai-org/GLM-5.2",
      summary: "GLM-5.2 的官方开放权重与模型卡，文本生成类，是该组织文本模型中点赞最高、下载量近百万的权重发布；与 GLM-5.3 分支并列构成现行主力。",
      reason: "一手闸门：权重与模型卡由智谱自身发布；归属追前沿区与官方技术资料类。",
      evidenceUse: "可支持「该档模型是否开放权重、以什么许可发布」这类陈述。",
      tags: ["Zhipu AI", "GLM-5.2", "官方模型卡", "开放权重"],
      nodes: ["llm", "model-families"]
    },
    {
      id: "glm-ocr-repo",
      vendor: "zhipu-ai",
      title: "GLM-OCR 官方仓库",
      kind: "官方代码仓库",
      collection: "GLM 官方仓库",
      url: "https://github.com/zai-org/GLM-OCR",
      publishedAt: "2026-02-02",
      summary: "官方 OCR 模型仓库，自述追求「准、快、全」三者兼顾，主题标签为 GLM、图像转文本与 OCR；该模型同时以开放权重与平台接口两种方式提供。",
      reason: "一手闸门：代码与权重由智谱自身发布；归属多模态节点。",
      evidenceUse: "可支持「该厂商 OCR 能力以什么形态提供」这类陈述；精度需看官方或第三方评测。",
      tags: ["Zhipu AI", "GLM", "OCR", "开源"],
      nodes: ["multimodal"]
    },
    {
      id: "open-autoglm",
      vendor: "zhipu-ai",
      title: "Open-AutoGLM（手机 Agent）",
      kind: "官方代码仓库",
      collection: "GLM 官方仓库",
      url: "https://github.com/zai-org/Open-AutoGLM",
      publishedAt: "2025-12-08",
      summary: "官方开源的手机操作 Agent 模型与框架，自述目标是「让人人可用 AI 手机」，主题标签为 Agent 与手机操作智能体。它把「让模型直接操作手机界面」这一类能力做成了可复现的开放产出。",
      reason: "一手闸门：模型与框架由智谱自身发布；归属计算机操作与 Agent 区。",
      evidenceUse: "可支持「手机操作类 Agent 有哪些开放实现」这类陈述；稳定性需参考实测。",
      tags: ["Zhipu AI", "手机Agent", "计算机操作", "开源"],
      nodes: ["computer-use", "agent", "agent-frameworks"]
    },
    {
      id: "cogvideo-repo",
      vendor: "zhipu-ai",
      title: "CogVideo / CogVideoX 官方仓库",
      kind: "官方代码仓库",
      collection: "GLM 官方仓库",
      url: "https://github.com/zai-org/CogVideo",
      publishedAt: "2022-05-29",
      summary: "官方文生视频与图生视频模型仓库，涵盖 ICLR 2023 的 CogVideo 与 2024 年的 CogVideoX 两代；是该团队在视频生成方向上持续多年的开源线。",
      reason: "一手闸门：代码与权重由智谱自身发布；应答闸门：长期作为开源视频生成的参照实现。",
      evidenceUse: "可支持「开源视频生成有哪些持续维护的实现」这类陈述。",
      tags: ["Zhipu AI", "视频生成", "开源"],
      nodes: ["video-generation", "diffusion"]
    },
    {
      id: "glm-53-doc",
      vendor: "zhipu-ai",
      title: "GLM-5.3 模型文档",
      kind: "官方技术文档",
      collection: "智谱开放平台文档",
      url: "https://docs.bigmodel.cn/cn/guide/models/text/glm-5.3",
      summary: "开放平台中 GLM-5.3 的官方模型文档，给出上下文长度、能力项与调用参数等规格口径；是该档位模型「官方承诺什么」的原始出处。",
      reason: "一手闸门：规格与参数由智谱自身文档化；归属模型选型节点。",
      evidenceUse: "可直接支持「该模型官方标称的规格是什么」这类陈述。",
      tags: ["Zhipu AI", "GLM-5.3", "官方文档"],
      nodes: ["llm", "model-selection"]
    },
    {
      id: "glm-53-flash-doc",
      vendor: "zhipu-ai",
      title: "GLM-5.3-Flash 模型文档",
      kind: "官方技术文档",
      collection: "智谱开放平台文档",
      url: "https://docs.bigmodel.cn/cn/guide/models/vlm/glm-5.3-flash",
      summary: "GLM-5.3-Flash 与 FlashX 的官方文档（归入视觉语言模型分类），说明该快速档在价格与延迟上的取舍；与 GLM-5.3 主档对照可读出官方对模型分层的策略。",
      reason: "一手闸门：分层规格由智谱自身文档化；归属模型选型与多模态节点。",
      evidenceUse: "可支持「同一代模型如何按速度与价格分层」这类陈述。",
      tags: ["Zhipu AI", "GLM-5.3-Flash", "官方文档"],
      nodes: ["model-selection", "multimodal", "inference-optimization"]
    },
    {
      id: "glm-image-doc",
      vendor: "zhipu-ai",
      title: "GLM-Image 模型文档",
      kind: "官方技术文档",
      collection: "智谱开放平台文档",
      url: "https://docs.bigmodel.cn/cn/guide/models/image-generation/glm-image",
      summary: "图像生成模型的官方文档，给出调用方式与生成规格；是平台侧图像能力的一手口径，与开放权重侧的 OCR、视频生成形成互补。",
      reason: "一手闸门：接口与规格由智谱自身文档化；归属图像生成节点。",
      evidenceUse: "可直接支持「该平台图像生成能力如何调用」这类操作性问题。",
      tags: ["Zhipu AI", "图像生成", "官方文档"],
      nodes: ["image-generation", "diffusion"]
    },
    {
      id: "glm-thinking-doc",
      vendor: "zhipu-ai",
      title: "深度思考（Thinking）",
      kind: "官方技术文档",
      collection: "智谱开放平台文档",
      url: "https://docs.bigmodel.cn/cn/guide/capabilities/thinking",
      summary: "开放平台对「深度思考」能力的说明页，讲清该模式在请求与返回上的表现；与 DeepSeek 的思考模式文档并读，可比较不同厂商对推理模式的接口设计差异。",
      reason: "一手闸门：能力开关与返回结构由智谱自身定义；归属推理模型与思维链节点。",
      evidenceUse: "可直接支持「该平台如何开启推理模式」这类工程陈述。",
      tags: ["Zhipu AI", "推理模式", "官方文档"],
      nodes: ["reasoning-models", "cot"]
    },
    {
      id: "glm-model-filing-doc",
      vendor: "zhipu-ai",
      title: "模型备案信息",
      kind: "官方技术文档",
      collection: "智谱开放平台文档",
      url: "https://docs.bigmodel.cn/cn/guide/platform/filing",
      summary: "平台公示其已备案的生成式人工智能服务信息，是「在中国境内提供生成式 AI 服务需完成备案」这一合规要求在厂商侧的一手材料。此类材料在境外厂商文档中并不存在，属中国监管环境的直接证据。",
      reason: "一手闸门：备案信息由提供服务的厂商自身公示；归属 AI 治理与合规节点，是理解境内合规要求的原始出处。",
      evidenceUse: "可支持「境内提供生成式 AI 服务需要什么手续」这类陈述；备案批次与编号需以公示页面当前内容为准。",
      tags: ["Zhipu AI", "合规", "备案", "AI治理"],
      nodes: ["governance", "training-data-governance"]
    }
  ];

  entries.filter((entry) => entry.vendor === "deepseek").forEach((entry) => {
    const item = {
      id: entry.id,
      sourceClass: "official",
      sourceSubcategory: entry.vendor,
      title: entry.title,
      publisher: publishers[entry.vendor],
      collection: entry.collection,
      contentKind: entry.kind,
      authorityTier: "A1",
      reviewStatus: "current",
      primarySource: true,
      discoveryOnly: false,
      url: entry.url,
      accessedAt: ACCESSED_AT,
      summary: entry.summary,
      selectionReason: entry.reason,
      evidenceUse: entry.evidenceUse,
      limitations: entry.limitations || limitationsByKind[entry.kind],
      tags: entry.tags,
      linkedNodes: entry.nodes,
      linkedSoftware: []
    };
    if (entry.publishedAt) item.publishedAt = entry.publishedAt;
    library.items.push(item);
  });
})();
