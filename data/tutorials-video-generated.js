/* 视频双轨入库 v0.2 的确定性输出。
 *
 * 本文件由 tools/video-ingest/apply-proposal.js 重建。不要手工在执行逻辑中
 * 添加资源；批准后的规范数据只写入 VIDEO_TUTORIAL_GENERATED。
 */
(function () {
  "use strict";

  const generated = {
  "schemaVersion": 1,
  "pages": {
    "n8n": {
      "mode": "create-page",
      "page": {
        "title": "n8n / Zapier 使用教程",
        "subtitle": "从第一条经审核的视频资源建立可复现的上手路径",
        "meta": "1 条 YouTube教程 · 视频双轨入库 v0.2",
        "overview": "n8n 官方用一个聊天型 Agent 贯穿完整入门闭环：先区分“只根据输入生成输出”的 LLM 与“能围绕任务多步调用工具”的 Agent，并说明简单规则更适合确定性节点；随后从空白工作流添加 Chat Trigger、AI Agent 和 Chat Model，保存 API 凭据、选择模型并测试输入输出。后半重点解释 Prompt Source、System Message 的角色/风格/边界、用表达式注入当前时间，以及 Window Buffer Memory 如何按 session ID 带回历史消息。最后激活工作流、打开托管聊天页，并从 Executions 检查线上运行。",
        "sourceNote": "本页由视频双轨提案确定性生成；资源绑定证据 sha256:1982e89cebb…。完整哈希保留在提案与批准记录中。界面、模型和服务配置可能变化，操作前请复核当前官方文档。",
        "accessDate": "2026-07-24",
        "officialSources": [],
        "learningPath": [
          "先判断该不该使用 Agent：能说明一个应使用普通节点的步骤和一个适合交给 Agent 的步骤。",
          "搭出最小聊天 Agent：测试聊天有回复，AI Agent 节点显示成功执行，输入字段可在 JSON 视图核对。",
          "控制任务与系统提示：Agent 能遵守角色和风格，并能通过表达式使用当前运行态信息。",
          "加入会话记忆并发布：同一会话能正确引用上文，公开聊天入口可用，生产执行可在列表中追踪。"
        ],
        "resources": [
          {
            "id": "yt-n8n-ai-agent-part1",
            "platform": "youtube",
            "title": "Building AI Agents: Chat Trigger, Memory, and System/User Messages Explained [Part 1]",
            "creator": "n8n",
            "url": "https://www.youtube.com/watch?v=yzvLfHb0nqE",
            "publishedAt": "2024-11-29",
            "duration": "20:16",
            "audience": "第一次使用 n8n，希望从空白画布搭出带系统提示、会话记忆和公开聊天入口的 AI Agent 初学者",
            "summary": "n8n 官方用一个聊天型 Agent 贯穿完整入门闭环：先区分“只根据输入生成输出”的 LLM 与“能围绕任务多步调用工具”的 Agent，并说明简单规则更适合确定性节点；随后从空白工作流添加 Chat Trigger、AI Agent 和 Chat Model，保存 API 凭据、选择模型并测试输入输出。后半重点解释 Prompt Source、System Message 的角色/风格/边界、用表达式注入当前时间，以及 Window Buffer Memory 如何按 session ID 带回历史消息。最后激活工作流、打开托管聊天页，并从 Executions 检查线上运行。",
            "coverage": [
              {
                "title": "先判断该不该使用 Agent",
                "steps": [
                  "把 LLM 看成输入文本到输出文本的生成函数，把 Agent 看成围绕目标反复调用模型和工具的控制流程。",
                  "对格式校验等规则明确的任务保留确定性节点，不用更慢、更贵的 Agent 代替简单条件。",
                  "只把自然语言、多模态理解或动态工具选择交给模型。"
                ],
                "done": "能说明一个应使用普通节点的步骤和一个适合交给 Agent 的步骤。"
              },
              {
                "title": "搭出最小聊天 Agent",
                "steps": [
                  "新建工作流，用 On chat message received 作为 Chat Trigger。",
                  "添加 AI Agent，并连接一个 Chat Model；在凭据界面保存模型供应商 API key。",
                  "选择当前可用模型，打开测试聊天发送消息，并检查 Chat Trigger 的 sessionId、action 和 chatInput。"
                ],
                "done": "测试聊天有回复，AI Agent 节点显示成功执行，输入字段可在 JSON 视图核对。"
              },
              {
                "title": "控制任务与系统提示",
                "steps": [
                  "默认让 Prompt Source 读取上游 chatInput；需要固定任务时再切换到 Define below。",
                  "在 System Message 中分别写角色、输出风格和边界，边界尽量改成可执行行为，例如不确定时先追问。",
                  "需要时间等运行态上下文时用表达式注入，并实际提问验证结果。"
                ],
                "done": "Agent 能遵守角色和风格，并能通过表达式使用当前运行态信息。"
              },
              {
                "title": "加入会话记忆并发布",
                "steps": [
                  "先用两轮相关问题证明无记忆时无法恢复上文，再连接 Window Buffer Memory。",
                  "让 Memory 从 Chat Trigger 自动读取 session ID；保持同一会话，再做一轮记忆测试。",
                  "激活工作流，打开 production chat URL；发送消息后到 Executions 检查运行状态和各节点输入输出。"
                ],
                "done": "同一会话能正确引用上文，公开聊天入口可用，生产执行可在列表中追踪。"
              }
            ],
            "uniqueTechniques": [
              {
                "title": "确定性节点与 Agent 混合，而非全盘 Agent 化",
                "scenario": "一个流程既有固定校验规则，又有自然语言理解或动态工具选择。",
                "steps": [
                  "先列出可以用条件、正则或普通代码稳定完成的步骤。",
                  "只把需要语义判断或多步工具决策的部分交给 Agent。",
                  "分别观察延迟、费用和错误位置，再调整边界。"
                ],
                "result": "流程保留可预测骨架，同时只在真正需要的位置使用模型能力。",
                "limitation": "视频只讲原则，没有给出生产级重试、回退和评估方案。"
              },
              {
                "title": "用反例验证记忆真的生效",
                "scenario": "界面已经连上 Memory，但不确定历史消息是否按会话正确传入。",
                "steps": [
                  "未连接 Memory 时先发送“数字是 3”，再问“数字是什么”，记录失败表现。",
                  "连接 Window Buffer Memory，并确认 session ID 来自 Chat Trigger。",
                  "在同一会话重复两轮测试，同时查看 Memory 与 Chat Model 的执行日志。"
                ],
                "result": "不是凭节点连线猜测，而是用前后对照证明会话记忆确实工作。",
                "limitation": "Window Buffer 只覆盖有限上下文；跨会话持久化和隐私保留策略需要另行设计。"
              }
            ],
            "caution": "视频发布于 2024 年，n8n 的节点名称、界面、可选模型与公开聊天设置可能已变化，应以当前官方文档为准。API key 只能保存在 n8n 凭据系统中，不写进提示词、节点文本或仓库。激活 Hosted Chat 会产生可访问入口；涉及公司系统或敏感数据时应设置认证、限制来源和文件类型，并审查日志保留。System Message 不能可靠消除幻觉，关键操作仍需确定性校验、最小权限和人工批准。",
            "review": {
              "evidence": "E2",
              "status": "formal",
              "reviewedAt": "2026-07-24",
              "standards": {
                "accuracy": 2,
                "alignment": 2,
                "reproducibility": 2,
                "traceability": 2,
                "safety": 2
              },
              "quality": {
                "closure": 4,
                "transfer": 3,
                "completeness": 3,
                "structure": 4,
                "freshness": 2,
                "accessibility": 4
              },
              "notes": "视频由 n8n 官方发布，完整演示了从空白工作流到可公开访问的聊天型 AI Agent：选择 Chat Trigger、连接 AI Agent 与 Chat Model、配置凭据和模型、编写 System Message、加入 Window Buffer Memory、用同一会话验证记忆、激活并检查执行记录。操作闭环清楚且画面可核对，适合成为 n8n 教程页的一条正式入门资源；但它是 2024 年的系列 Part 1，只应声称覆盖第一个聊天 Agent，而不是 n8n 全功能。"
            }
          }
        ]
      },
      "resources": [
        {
          "id": "yt-n8n-ai-agent-part1",
          "platform": "youtube",
          "title": "Building AI Agents: Chat Trigger, Memory, and System/User Messages Explained [Part 1]",
          "creator": "n8n",
          "url": "https://www.youtube.com/watch?v=yzvLfHb0nqE",
          "publishedAt": "2024-11-29",
          "duration": "20:16",
          "audience": "第一次使用 n8n，希望从空白画布搭出带系统提示、会话记忆和公开聊天入口的 AI Agent 初学者",
          "summary": "n8n 官方用一个聊天型 Agent 贯穿完整入门闭环：先区分“只根据输入生成输出”的 LLM 与“能围绕任务多步调用工具”的 Agent，并说明简单规则更适合确定性节点；随后从空白工作流添加 Chat Trigger、AI Agent 和 Chat Model，保存 API 凭据、选择模型并测试输入输出。后半重点解释 Prompt Source、System Message 的角色/风格/边界、用表达式注入当前时间，以及 Window Buffer Memory 如何按 session ID 带回历史消息。最后激活工作流、打开托管聊天页，并从 Executions 检查线上运行。",
          "coverage": [
            {
              "title": "先判断该不该使用 Agent",
              "steps": [
                "把 LLM 看成输入文本到输出文本的生成函数，把 Agent 看成围绕目标反复调用模型和工具的控制流程。",
                "对格式校验等规则明确的任务保留确定性节点，不用更慢、更贵的 Agent 代替简单条件。",
                "只把自然语言、多模态理解或动态工具选择交给模型。"
              ],
              "done": "能说明一个应使用普通节点的步骤和一个适合交给 Agent 的步骤。"
            },
            {
              "title": "搭出最小聊天 Agent",
              "steps": [
                "新建工作流，用 On chat message received 作为 Chat Trigger。",
                "添加 AI Agent，并连接一个 Chat Model；在凭据界面保存模型供应商 API key。",
                "选择当前可用模型，打开测试聊天发送消息，并检查 Chat Trigger 的 sessionId、action 和 chatInput。"
              ],
              "done": "测试聊天有回复，AI Agent 节点显示成功执行，输入字段可在 JSON 视图核对。"
            },
            {
              "title": "控制任务与系统提示",
              "steps": [
                "默认让 Prompt Source 读取上游 chatInput；需要固定任务时再切换到 Define below。",
                "在 System Message 中分别写角色、输出风格和边界，边界尽量改成可执行行为，例如不确定时先追问。",
                "需要时间等运行态上下文时用表达式注入，并实际提问验证结果。"
              ],
              "done": "Agent 能遵守角色和风格，并能通过表达式使用当前运行态信息。"
            },
            {
              "title": "加入会话记忆并发布",
              "steps": [
                "先用两轮相关问题证明无记忆时无法恢复上文，再连接 Window Buffer Memory。",
                "让 Memory 从 Chat Trigger 自动读取 session ID；保持同一会话，再做一轮记忆测试。",
                "激活工作流，打开 production chat URL；发送消息后到 Executions 检查运行状态和各节点输入输出。"
              ],
              "done": "同一会话能正确引用上文，公开聊天入口可用，生产执行可在列表中追踪。"
            }
          ],
          "uniqueTechniques": [
            {
              "title": "确定性节点与 Agent 混合，而非全盘 Agent 化",
              "scenario": "一个流程既有固定校验规则，又有自然语言理解或动态工具选择。",
              "steps": [
                "先列出可以用条件、正则或普通代码稳定完成的步骤。",
                "只把需要语义判断或多步工具决策的部分交给 Agent。",
                "分别观察延迟、费用和错误位置，再调整边界。"
              ],
              "result": "流程保留可预测骨架，同时只在真正需要的位置使用模型能力。",
              "limitation": "视频只讲原则，没有给出生产级重试、回退和评估方案。"
            },
            {
              "title": "用反例验证记忆真的生效",
              "scenario": "界面已经连上 Memory，但不确定历史消息是否按会话正确传入。",
              "steps": [
                "未连接 Memory 时先发送“数字是 3”，再问“数字是什么”，记录失败表现。",
                "连接 Window Buffer Memory，并确认 session ID 来自 Chat Trigger。",
                "在同一会话重复两轮测试，同时查看 Memory 与 Chat Model 的执行日志。"
              ],
              "result": "不是凭节点连线猜测，而是用前后对照证明会话记忆确实工作。",
              "limitation": "Window Buffer 只覆盖有限上下文；跨会话持久化和隐私保留策略需要另行设计。"
            }
          ],
          "caution": "视频发布于 2024 年，n8n 的节点名称、界面、可选模型与公开聊天设置可能已变化，应以当前官方文档为准。API key 只能保存在 n8n 凭据系统中，不写进提示词、节点文本或仓库。激活 Hosted Chat 会产生可访问入口；涉及公司系统或敏感数据时应设置认证、限制来源和文件类型，并审查日志保留。System Message 不能可靠消除幻觉，关键操作仍需确定性校验、最小权限和人工批准。",
          "review": {
            "evidence": "E2",
            "status": "formal",
            "reviewedAt": "2026-07-24",
            "standards": {
              "accuracy": 2,
              "alignment": 2,
              "reproducibility": 2,
              "traceability": 2,
              "safety": 2
            },
            "quality": {
              "closure": 4,
              "transfer": 3,
              "completeness": 3,
              "structure": 4,
              "freshness": 2,
              "accessibility": 4
            },
            "notes": "视频由 n8n 官方发布，完整演示了从空白工作流到可公开访问的聊天型 AI Agent：选择 Chat Trigger、连接 AI Agent 与 Chat Model、配置凭据和模型、编写 System Message、加入 Window Buffer Memory、用同一会话验证记忆、激活并检查执行记录。操作闭环清楚且画面可核对，适合成为 n8n 教程页的一条正式入门资源；但它是 2024 年的系列 Part 1，只应声称覆盖第一个聊天 Agent，而不是 n8n 全功能。"
          }
        }
      ]
    },
    "elevenlabs": {
      "mode": "create-page",
      "page": {
        "title": "ElevenLabs 使用教程",
        "subtitle": "从第一条经审核的视频资源建立可复现的上手路径",
        "meta": "1 条 YouTube教程 · 视频双轨入库 v0.2",
        "overview": "教程先用短录音创建 Instant Voice Clone，再用较长且经过清理的单说话人素材创建 Professional Voice Clone，覆盖模型选择、录音质量、样本管理、说话人分离、同意确认、声音验证和生成测试。",
        "sourceNote": "本页由视频双轨提案确定性生成；资源绑定证据 sha256:ecfd1fd17bf7…。完整哈希保留在提案与批准记录中。界面、模型和服务配置可能变化，操作前请复核当前官方文档。",
        "accessDate": "2026-07-24",
        "officialSources": [],
        "learningPath": [
          "创建即时声音克隆：能够用短样本创建可用的即时克隆，并通过测试语句检查音色与表达稳定性。",
          "准备专业克隆素材：样本达到平台质量提示要求，并且训练集合只保留目标说话人的清晰语音。",
          "验证并训练专业声音：专业克隆通过声音验证并完成训练，测试结果在音色、可懂度和跨句一致性上可接受。"
        ],
        "resources": []
      },
      "resources": [
        {
          "id": "yt-elevenlabs-official-voice-cloning",
          "platform": "youtube",
          "title": "How to Clone Your Voice with AI - Realistic AI Voice Clones",
          "creator": "ElevenLabs",
          "url": "https://www.youtube.com/watch?v=AiRksVoiUAI",
          "publishedAt": "2025-09-04",
          "duration": "11:15",
          "audience": "希望使用 ElevenLabs 创建本人声音克隆，并理解快速克隆与高保真专业克隆差异的内容创作者和开发者。",
          "summary": "教程先用短录音创建 Instant Voice Clone，再用较长且经过清理的单说话人素材创建 Professional Voice Clone，覆盖模型选择、录音质量、样本管理、说话人分离、同意确认、声音验证和生成测试。",
          "coverage": [
            {
              "title": "创建即时声音克隆",
              "steps": [
                "进入 Voices，选择 Create or Clone a Voice 和 Instant Voice Clone。",
                "录制或上传仅包含本人声音的干净样本，预览并删除不合格片段。",
                "填写语言与说明，确认拥有声音权利和同意后保存。",
                "在 Text to Speech 中选择克隆声音并生成测试语句。"
              ],
              "done": "能够用短样本创建可用的即时克隆，并通过测试语句检查音色与表达稳定性。"
            },
            {
              "title": "准备专业克隆素材",
              "steps": [
                "在安静、低混响环境中用稳定设备录制至少约半小时素材。",
                "保持单一说话人、稳定音量与麦克风位置，去除音乐、噪声和其他人声。",
                "上传素材后检查总时长，必要时裁剪、降噪或分离说话人。"
              ],
              "done": "样本达到平台质量提示要求，并且训练集合只保留目标说话人的清晰语音。"
            },
            {
              "title": "验证并训练专业声音",
              "steps": [
                "创建 Professional Voice Clone，填写名称、语言、口音和说明。",
                "提交样本后完成现场声音验证，证明声音主体与样本相符。",
                "等待训练完成，再分别测试文本转语音、语音转语音或多语言输出。"
              ],
              "done": "专业克隆通过声音验证并完成训练，测试结果在音色、可懂度和跨句一致性上可接受。"
            }
          ],
          "uniqueTechniques": [
            {
              "title": "把即时条件化与专用微调分开选择",
              "scenario": "需要先验证声音是否适合克隆，但又不想一开始就投入长录音和数小时训练。",
              "steps": [
                "先用一至两分钟干净单人录音创建 Instant Voice Clone。",
                "用未出现在样本中的句子测试音色、口音、数字和专有名词。",
                "只有即时克隆的身份方向正确、且确实需要更高一致性时，再收集长素材创建 Professional Voice Clone。"
              ],
              "result": "短样本路径适合快速试验；长样本专用训练适合追求音色、情绪和跨内容一致性。",
              "limitation": "即时克隆表现不佳可能来自样本质量或分布外口音，不能只凭一次失败断定专业克隆也不可行。"
            },
            {
              "title": "在训练前处理多人录音",
              "scenario": "可用素材来自访谈或播客，除了目标说话人还包含主持人、嘉宾和背景声。",
              "steps": [
                "先按说话人分离或切出只含目标主体的片段。",
                "逐段预听，删除串话、音乐、明显混响和错误分离片段。",
                "上传后再次抽查平台预处理结果，确保训练集合没有其他人的声音。"
              ],
              "result": "先分离说话人并只选择声音主体，避免模型把其他人声或背景伪影学习进克隆。",
              "limitation": "自动说话人分离会漏分或产生伪影；高质量专业克隆仍优先使用从源头单独录制的素材。"
            },
            {
              "title": "把声音验证放在训练许可之前",
              "scenario": "样本技术质量已经达标，但平台仍需确认提交者有权训练这一身份声音。",
              "steps": [
                "先阅读并确认样本权利、使用目的和平台条款。",
                "由声音主体现场朗读随机验证句，完成活体式声音核验。",
                "验证通过后才提交专业训练，并保留授权与生成记录。"
              ],
              "result": "技术上可合成不等于获得授权；验证步骤把声音主体与训练请求绑定。",
              "limitation": "一次平台验证不能替代所有地区、用途和后续传播所需的法律授权，也不能阻止输出被二次滥用。"
            }
          ],
          "caution": "只克隆本人或已按平台规则获得授权的声音。公开录音不等于允许克隆；原始音频和说话人表示都属于敏感身份数据。模型可能复制噪声、混响、口音与录音伪影，生成内容还需检查可懂度、数字和专有名词，不能把“听起来像”当成身份认证。",
          "review": {
            "evidence": "E2",
            "status": "formal",
            "reviewedAt": "2026-07-24",
            "standards": {
              "accuracy": 2,
              "alignment": 2,
              "reproducibility": 2,
              "traceability": 2,
              "safety": 2
            },
            "quality": {
              "closure": 4,
              "transfer": 4,
              "completeness": 4,
              "structure": 4,
              "freshness": 3,
              "accessibility": 4
            },
            "notes": "ElevenLabs 官方教程完整演示即时声音克隆与专业声音克隆，从样本录制、清理、说话人分离、权利确认和声音验证一直到生成测试，操作闭环完整，并明确展示了质量与授权边界。"
          }
        }
      ]
    }
  }
};
  window.VIDEO_TUTORIAL_GENERATED = generated;

  const root = window.TUTORIALS;
  if (!root || !root.items) throw new Error("视频教程扩展加载前必须先加载 data/tutorials.js");

  Object.entries(generated.pages).forEach(([softwareId, entry]) => {
    if (!root.items[softwareId]) {
      if (entry.mode !== "create-page" || !entry.page) {
        throw new Error(`视频教程 ${softwareId} 要追加资源，但教程页不存在`);
      }
      root.items[softwareId] = entry.page;
    }

    const tutorial = root.items[softwareId];
    tutorial.resources = Array.isArray(tutorial.resources) ? tutorial.resources : [];
    (entry.resources || []).forEach((resource) => {
      const duplicate = tutorial.resources.some((item) =>
        item.id === resource.id || item.url === resource.url
      );
      if (!duplicate) tutorial.resources.push(resource);
    });
  });
})();
