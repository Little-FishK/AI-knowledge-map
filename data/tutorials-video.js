/* Generated from docs/VIDEO_CREATION_CURRICULUM.md. Run npm run build:tutorial-video after editing. */
window.VIDEO_TUTORIALS = {
  "video-generation": {
    "source": "docs/VIDEO_CREATION_CURRICULUM.md",
    "sourceHash": "390dd385bada0fc0ac37f2400f6f21a12a8e738ebe26d433dd680ea57b86732a",
    "language": "zh-Hans",
    "introduction": {
      "id": "course-video-generation-introduction",
      "title": "阅读说明",
      "html": "<p>本板块面向已经会通过自然语言表达需求、希望进一步控制视频结果的读者。第一章认识专业生成平台与教程；第二章学习生成大致内容后的精细处理，以及让 AI 直接驱动工具的方法；第三章提供新人可以跟做的现成工作流。</p>\n<p>资料核对日期：2026 年 10 月 31 日。本文已完成资料核对与三章正文编写；接入和生成步骤尚未完成本机软件操作、付费调用或效果验收。第三章收录原作者公开的案例与教程，作者演示与本站实际复现分别说明。调研取舍与工作流文件记录见 [资料核对记录](VIDEO_CREATION_RESEARCH.md)。</p>"
    },
    "chapter": {
      "id": "course-video-generation",
      "title": "第一章 专业视频生成平台、基本介绍与教程",
      "sections": [
        {
          "id": "course-video-generation-section-1",
          "title": "1. 先分清模型、平台和工作流",
          "html": "<table class=\"d-table\"><thead><tr><th>输入与任务</th><th>主要控制什么</th><th>首次练习可以怎样做</th></tr></thead><tbody><tr><td>文字生成视频</td><td>主体、动作、场景与摄影方式</td><td>一个主体、一个动作、一个短镜头</td></tr><tr><td>图片生成视频</td><td>初始外观与构图，再补充运动</td><td>用产品或场景图生成缓慢运动</td></tr><tr><td>首尾帧生成</td><td>起点、终点及两者之间的变化</td><td>同一对象的两种相近状态</td></tr><tr><td>多素材参考</td><td>人物、道具、动作、镜头或声音</td><td>给每份素材指定一种用途</td></tr><tr><td>多片段成片</td><td>顺序、节奏、转场及音画衔接</td><td>把三个通过检查的镜头组成短片</td></tr></tbody></table>",
          "headings": []
        },
        {
          "id": "course-video-generation-section-2",
          "title": "2. 三个生成平台",
          "html": "<p>结合当前可查的独立评测、创作控制与课程用途，第一章只重点介绍下面三条路线。推荐顺序是课程的学习安排；文生、图生与编辑有不同榜单，不把它们合成未经定义的统一总排名。</p>\n<table class=\"d-table\"><thead><tr><th>平台与重点模型</th><th>推荐理由与适用任务</th><th>官方入口与教程</th></tr></thead><tbody><tr><td>即梦／Dreamina：Seedance 2.5</td><td>综合首选，适合从参考图出发制作多镜头内容，并继续做指令编辑。所查 Artificial Analysis 图生视频榜第 1、视频编辑榜第 2</td><td><a href=\"https://jimeng.jianying.com/\" target=\"_blank\" rel=\"noopener noreferrer\">即梦入口</a>、<a href=\"https://seed.bytedance.com/en/seedance2_5\" target=\"_blank\" rel=\"noopener noreferrer\">模型介绍</a>、<a href=\"https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide?lang=zh\" target=\"_blank\" rel=\"noopener noreferrer\">官方提示词教程</a></td></tr><tr><td>通义万相：Wan 3.0</td><td>重点学习从文字生成镜头及后续编辑。所查 Artificial Analysis 文生视频与视频编辑榜均第 1</td><td><a href=\"https://www.alibabacloud.com/blog/wan3-0-30-second-ai-video-generation-from-any-input_603452\" target=\"_blank\" rel=\"noopener noreferrer\">Alibaba Cloud 官方模型介绍与入口</a></td></tr><tr><td>海螺：MiniMax H3</td><td>重点学习图片生成视频与多模态参考。所查 Arena 图生视频榜第 1；Artificial Analysis 文生视频榜第 3</td><td><a href=\"https://hailuoai.video/\" target=\"_blank\" rel=\"noopener noreferrer\">海螺入口</a>、<a href=\"https://platform.minimax.io/docs/guides/video-generation\" target=\"_blank\" rel=\"noopener noreferrer\">MiniMax 官方视频教程</a></td></tr></tbody></table>",
          "headings": []
        },
        {
          "id": "course-video-generation-section-3",
          "title": "3. 三个平台怎样开始学习",
          "html": "<table class=\"d-table\"><thead><tr><th>平台</th><th>首选教程</th><th>补充教程</th></tr></thead><tbody><tr><td>即梦／Dreamina：Seedance 2.5</td><td><a href=\"https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide?lang=zh\" target=\"_blank\" rel=\"noopener noreferrer\">Seedance 2.5 官方提示词指南（中文）</a></td><td><a href=\"https://xyq.jianying.com/tutorials/seedance-2-5\" target=\"_blank\" rel=\"noopener noreferrer\">小云雀 Seedance 2.5 官方操作手册（小云雀界面）</a></td></tr><tr><td>通义万相：Wan 3.0</td><td><a href=\"https://help.aliyun.com/zh/model-studio/wan3-video-generation-prompt-guide\" target=\"_blank\" rel=\"noopener noreferrer\">万相 3.0 官方视频生成 Prompt 指南（中文）</a></td><td><a href=\"https://help.aliyun.com/zh/model-studio/wan3-video-generation-guide\" target=\"_blank\" rel=\"noopener noreferrer\">万相 3.0 官方视频生成使用指南（API）</a></td></tr><tr><td>海螺：MiniMax H3</td><td><a href=\"https://design.minimax.io/h3\" target=\"_blank\" rel=\"noopener noreferrer\">MiniMax H3 官方教程与工作流中心</a></td><td><a href=\"https://platform.minimax.io/docs/guides/video-generation\" target=\"_blank\" rel=\"noopener noreferrer\">MiniMax H3 官方视频生成指南（API）</a></td></tr></tbody></table>",
          "headings": []
        },
        {
          "id": "course-video-generation-section-4",
          "title": "4. 掌握生成视频的几个控制点",
          "html": "<p><strong>先控制动作，再增加复杂度。</strong> 对一个短镜头，写清谁在做什么、动作怎样开始和结束、摄影机是否移动。画面已有主体时，重复堆叠外观形容词可能使真正重要的动作要求不够突出。需要多个镜头时，把每个镜头的作用分别写清；可参考 <a href=\"https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/writing-effective-text-prompts-for-video-generation.html\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe 提示词教程</a>。</p>\n<p><strong>给参考素材分工。</strong> 人物图负责身份，产品图负责外观，视频负责动作或运镜，声音负责台词或节奏。多份参考互相冲突时，先减少素材，再检查结果。参考是一种控制条件，输出仍需逐帧或逐段检查。</p>\n<p><strong>首尾帧限定两端，过程仍需设计。</strong> 起点是关着的盒子、终点是打开的盒子，提示词应描述打开过程；如果两张图的场景、视角和对象差异很大，模型需要自行补出更多变化。先用画幅和构图接近的两张图练习。<a href=\"https://support.google.com/flow/answer/16353334?hl=en\" target=\"_blank\" rel=\"noopener noreferrer\">Flow 首尾帧说明</a></p>",
          "headings": []
        }
      ]
    },
    "translations": {
      "en": {
        "source": "docs/en/VIDEO_CREATION_CURRICULUM.md",
        "sourceHash": "218f4bb9b5e7c47b50be2d89d894a52779d9511de206192555586955dd40331f",
        "language": "en",
        "introduction": {
          "id": "course-video-generation-introduction",
          "title": "Reading note",
          "html": "<p>This course is for readers who can already express requirements in natural language and want greater control over video results. Chapter 1 introduces professional generation platforms and tutorials; Chapter 2 covers refinement after generating an initial result and ways to let AI operate tools directly; Chapter 3 provides existing workflows beginners can follow.</p>\n<p>Resources checked: October 31, 2026. Research verification and the three chapters are complete; connection and generation instructions have not been tested in local software, paid calls or output acceptance checks. Chapter 3 collects creators&#39; published cases and tutorials, distinguishing their demonstrations from actual reproduction by this site. Research choices and workflow file records are in the [research verification notes](VIDEO_CREATION_RESEARCH.md).</p>"
        },
        "chapter": {
          "id": "course-video-generation",
          "title": "Chapter 1 Professional video generation platforms and tutorials",
          "sections": [
            {
              "id": "course-video-generation-section-1",
              "title": "1. Distinguish models, platforms and workflows",
              "html": "<table class=\"d-table\"><thead><tr><th>Input and task</th><th>Main controls</th><th>A first exercise</th></tr></thead><tbody><tr><td>Text-to-video</td><td>Subject, action, scene and cinematography</td><td>One subject, one action and one short shot</td></tr><tr><td>Image-to-video</td><td>Initial appearance and composition, followed by motion</td><td>Add slow movement to a product or scene image</td></tr><tr><td>First and last frames</td><td>Starting point, endpoint and the transition</td><td>Two similar states of the same object</td></tr><tr><td>Multiple references</td><td>Characters, props, actions, camera movement or sound</td><td>Assign one purpose to each reference</td></tr><tr><td>Combining clips</td><td>Order, pacing, transitions and audiovisual continuity</td><td>Assemble three checked shots into a short video</td></tr></tbody></table>",
              "headings": []
            },
            {
              "id": "course-video-generation-section-2",
              "title": "2. Three generation platforms",
              "html": "<p>Based on the independent evaluations, creative controls and course needs available at verification time, this chapter focuses on three routes. Their order is a learning sequence. Text-to-video, image-to-video and editing have different leaderboards; they are not merged into an undefined overall ranking.</p>\n<table class=\"d-table\"><thead><tr><th>Platform and focus model</th><th>Reasons and suitable tasks</th><th>Official entry points and tutorials</th></tr></thead><tbody><tr><td>Jimeng / Dreamina: Seedance 2.5</td><td>First overall choice for this course, suitable for reference-based multishot content and subsequent instruction editing. Ranked first in the checked Artificial Analysis image-to-video list and second in video editing</td><td><a href=\"https://jimeng.jianying.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Jimeng</a>, <a href=\"https://seed.bytedance.com/en/seedance2_5\" target=\"_blank\" rel=\"noopener noreferrer\">model overview</a>, <a href=\"https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide?lang=zh\" target=\"_blank\" rel=\"noopener noreferrer\">official prompt guide</a></td></tr><tr><td>Tongyi Wan: Wan 3.0</td><td>Focus on generating shots from text and editing afterward. Ranked first in both checked Artificial Analysis text-to-video and editing lists</td><td><a href=\"https://www.alibabacloud.com/blog/wan3-0-30-second-ai-video-generation-from-any-input_603452\" target=\"_blank\" rel=\"noopener noreferrer\">Alibaba Cloud model overview and entry point</a></td></tr><tr><td>Hailuo: MiniMax H3</td><td>Focus on image-to-video and multimodal references. Ranked first in the checked Arena image-to-video list and third in Artificial Analysis text-to-video</td><td><a href=\"https://hailuoai.video/\" target=\"_blank\" rel=\"noopener noreferrer\">Hailuo</a>, <a href=\"https://platform.minimax.io/docs/guides/video-generation\" target=\"_blank\" rel=\"noopener noreferrer\">official MiniMax video tutorial</a></td></tr></tbody></table>",
              "headings": []
            },
            {
              "id": "course-video-generation-section-3",
              "title": "3. Where to start learning each platform",
              "html": "<table class=\"d-table\"><thead><tr><th>Platform</th><th>First-choice tutorial</th><th>Supplement</th></tr></thead><tbody><tr><td>Jimeng / Dreamina: Seedance 2.5</td><td><a href=\"https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide?lang=zh\" target=\"_blank\" rel=\"noopener noreferrer\">Official Seedance 2.5 prompt guide (Chinese)</a></td><td><a href=\"https://xyq.jianying.com/tutorials/seedance-2-5\" target=\"_blank\" rel=\"noopener noreferrer\">Official Xiaoyunque Seedance 2.5 manual (Xiaoyunque interface)</a></td></tr><tr><td>Tongyi Wan: Wan 3.0</td><td><a href=\"https://help.aliyun.com/zh/model-studio/wan3-video-generation-prompt-guide\" target=\"_blank\" rel=\"noopener noreferrer\">Official Wan 3.0 video prompt guide (Chinese)</a></td><td><a href=\"https://help.aliyun.com/zh/model-studio/wan3-video-generation-guide\" target=\"_blank\" rel=\"noopener noreferrer\">Official Wan 3.0 video generation guide (API)</a></td></tr><tr><td>Hailuo: MiniMax H3</td><td><a href=\"https://design.minimax.io/h3\" target=\"_blank\" rel=\"noopener noreferrer\">Official MiniMax H3 tutorial and workflow center</a></td><td><a href=\"https://platform.minimax.io/docs/guides/video-generation\" target=\"_blank\" rel=\"noopener noreferrer\">Official MiniMax H3 video generation guide (API)</a></td></tr></tbody></table>",
              "headings": []
            },
            {
              "id": "course-video-generation-section-4",
              "title": "4. Learn the main video controls",
              "html": "<p><strong>Control actions before increasing complexity.</strong> For a short shot, specify who does what, how the action starts and ends, and whether the camera moves. If the image already contains the subject, repeated appearance adjectives can obscure the action that matters. For multiple shots, explain each shot&#39;s role separately. See the <a href=\"https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/writing-effective-text-prompts-for-video-generation.html\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe prompt tutorial</a>.</p>\n<p><strong>Give references separate roles.</strong> A character image supplies identity, a product image appearance, a video action or camera movement, and audio dialogue or rhythm. When references conflict, reduce them first and inspect the result. References are conditioning inputs; outputs still need inspection by frame or segment.</p>\n<p><strong>First and last frames constrain the ends; the transition still needs design.</strong> If the first frame is a closed box and the last an open box, describe the opening action. Large differences in scene, angle or objects leave more changes for the model to invent. Start with two images having similar framing and composition. <a href=\"https://support.google.com/flow/answer/16353334?hl=en\" target=\"_blank\" rel=\"noopener noreferrer\">Flow first/last-frame documentation</a></p>",
              "headings": []
            }
          ]
        },
        "translatedFrom": {
          "source": "docs/VIDEO_CREATION_CURRICULUM.md",
          "sourceHash": "390dd385bada0fc0ac37f2400f6f21a12a8e738ebe26d433dd680ea57b86732a"
        }
      }
    }
  },
  "video-editing-agent": {
    "source": "docs/VIDEO_CREATION_CURRICULUM.md",
    "sourceHash": "390dd385bada0fc0ac37f2400f6f21a12a8e738ebe26d433dd680ea57b86732a",
    "language": "zh-Hans",
    "introduction": {
      "id": "course-video-editing-agent-introduction",
      "title": "阅读说明",
      "html": "<p>AI 生成镜头后，通常还要调整片段长度、镜头顺序、画面构图、颜色和声音。本章先选定专业视频编辑平台，再完成 Agent 接入，让你通过自然语言操作已有工程，并根据预览继续修改。</p>"
    },
    "chapter": {
      "id": "course-video-editing-agent",
      "title": "第二章 使用 Agent 操作专业视频编辑平台",
      "sections": [
        {
          "id": "course-video-editing-agent-section-1",
          "title": "1. 选定两个编辑平台",
          "html": "<p>本章选择 <strong>DaVinci Resolve Studio（达芬奇）</strong> 和 <strong>Adobe Premiere Pro</strong>，依据是专业后期能力、可继续编辑的工程，以及有资料可核对的 Agent 接入方式。两者选一个学习即可。</p>\n<table class=\"d-table\"><thead><tr><th>平台</th><th>选择理由</th><th>Agent 接入路线</th><th>建议怎样选</th></tr></thead><tbody><tr><td><a href=\"https://www.blackmagicdesign.com/products/davinciresolve\" target=\"_blank\" rel=\"noopener noreferrer\">DaVinci Resolve Studio</a></td><td>在同一工程中完成剪辑、调色、Fusion 合成与 Fairlight 声音后期</td><td>21.1 已加入官方 AI 助手集成；也可使用下文的第三方 MCP</td><td>新建后期流程、重视画面与声音统一处理时，优先从它开始</td></tr><tr><td><a href=\"https://www.adobe.com/products/premiere.html\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe Premiere Pro</a></td><td>时间线精剪、文字与图形制作，以及 Adobe 素材协作</td><td>内置 AI Assistant（beta）；外部 Agent 可通过第三方 PPMCP 接入</td><td>已在使用 Photoshop、After Effects 或 Premiere 工程时，优先沿用它</td></tr></tbody></table>\n<p>平台具备某项编辑功能，与 Agent 能调用这项功能，需要分别确认。学习时先接通查询、一次小修改和工程保存，再扩大任务范围。</p>",
          "headings": []
        },
        {
          "id": "course-video-editing-agent-section-2",
          "title": "2. DaVinci Resolve Studio：连接外部 Agent",
          "html": "<p><strong>官方接入与本章采用的步骤</strong></p>\n<p>Blackmagic 已在 <a href=\"https://www.blackmagicdesign.com/media/partial/release/20260908-03\" target=\"_blank\" rel=\"noopener noreferrer\">Resolve 21.1 官方更新说明</a>中确认 AI 助手集成，列出的任务包括分析工程、整理素材、调整设置、剪出精选片段和批量渲染。使用对应版本时，可先查 <a href=\"https://www.blackmagicdesign.com/support\" target=\"_blank\" rel=\"noopener noreferrer\">官方支持中心</a>中的 21.1 手册与新版功能介绍，采用随软件提供的接入方式。</p>\n<p>下面展开的是 <strong>第三方 <code>samuelgursky/davinci-resolve-mcp</code> 路线</strong>，便于按作者安装文档逐项完成环境准备、客户端配置和连接检查。它与官方集成是两套方案，选择其中一套连接即可。<a href=\"https://github.com/samuelgursky/davinci-resolve-mcp\" target=\"_blank\" rel=\"noopener noreferrer\">项目说明</a></p>\n<p><strong>1. 准备软件与脚本环境</strong></p>\n<p>按作者要求准备 Resolve Studio 18.5 或以上、Git，以及 64 位 Python 3.10 或以上；下面的命令使用 Python 3.12。媒体分析还需 ffmpeg，并确保命令能从 PATH 找到；转录等功能的额外依赖按任务补齐。启动 Resolve，打开用于练习的工程。在 <strong>Preferences → System → General → External scripting using</strong> 中选择 <strong>Local</strong>，保存设置。<a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/install.md\" target=\"_blank\" rel=\"noopener noreferrer\">安装与版本要求</a></p>\n<p>本节按 Studio 编写。免费版的脚本接口与桥接条件随版本变化，不直接套用本节步骤。</p>\n<p><strong>2. 下载项目并生成客户端配置</strong></p>\n<p>在选定的工具目录打开 PowerShell，依次执行：</p>\n<pre><code class=\"language-powershell\">git clone https://github.com/samuelgursky/davinci-resolve-mcp.git\nSet-Location davinci-resolve-mcp\npy -3.12 install.py --clients manual</code></pre>\n<p>安装器会建立运行环境并输出手动接入配置。将它生成的启动命令、参数与环境变量加入你的 Agent 客户端；路径使用安装器给出的实际值。已有其他 MCP 配置时，合并服务器条目。其他安装方式与故障诊断见同一份 <a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/install.md\" target=\"_blank\" rel=\"noopener noreferrer\">作者安装文档</a>。</p>\n<p><strong>3. 连接并检查当前工程</strong></p>\n<p>客户端需要支持启动本地 <strong>stdio MCP 服务</strong>。保存配置并重启客户端，启用 Resolve 工具，同时保持 Resolve 和工程打开。先让 Agent 读取当前工程名称、时间线、轨道和片段，核对返回信息与软件界面是否一致。</p>\n<p><strong>4. 从明确支持的编辑操作开始</strong></p>\n<p>可以先练习素材整理、片段属性调整、标记、渲染设置等任务。涉及剪切、移动或替换片段时，让 Agent 先检查当前接口是否支持相应操作，再执行。<a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/kernels/timeline-edit-kernel.md\" target=\"_blank\" rel=\"noopener noreferrer\">时间线操作边界</a>区分支持、部分支持和受限操作；软件界面能完成的任务，接口未必提供相同控制。</p>\n<p><strong>软件与接入教程</strong>：<a href=\"https://www.blackmagicdesign.com/products/davinciresolve/training\" target=\"_blank\" rel=\"noopener noreferrer\">Blackmagic 官方培训</a>、<a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/install.md\" target=\"_blank\" rel=\"noopener noreferrer\">MCP 安装指南</a>、<a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/kernels/timeline-edit-kernel.md\" target=\"_blank\" rel=\"noopener noreferrer\">时间线能力说明</a>。</p>",
          "headings": []
        },
        {
          "id": "course-video-editing-agent-section-3",
          "title": "3. Adobe Premiere Pro：内置助手与外部 Agent",
          "html": "<p><strong>路线 A：内置 AI Assistant</strong></p>\n<p>如果当前版本与账户已提供助手，在 Premiere 中打开工程，通过 <strong>Window → Assistant</strong> 进入对话。Adobe 的 <a href=\"https://helpx.adobe.com/premiere/desktop/premiere-ai-assistant/overview.html\" target=\"_blank\" rel=\"noopener noreferrer\">官方说明</a>仍将其标为 beta；列出的任务包括素材分箱与重命名、转录、标记，以及初步片段组合。</p>\n<p>这条路线适合先用自然语言整理素材和搭建粗剪。需要精确修改片段、构图或音量时，检查助手当时支持的动作，也可选择下面的外部接入路线。</p>\n<p><strong>路线 B：外部 Agent + PPMCP</strong></p>\n<p>本章选用第三方项目 <a href=\"https://github.com/CaYatur/PremiereProMCP\" target=\"_blank\" rel=\"noopener noreferrer\">CaYatur/PremiereProMCP（PPMCP）</a>。它通过 UXP 插件与本地桥接程序连接 Premiere，再把编辑工具提供给 Agent。下面按作者主要测试的 Windows 环境编写。</p>\n<p><strong>1. 准备 Premiere 与插件加载工具</strong></p>\n<p>使用 <strong>Premiere 26.0 或以上</strong>，安装 Adobe UXP Developer Tool。在 Premiere 的 <strong>Settings → Plugins</strong> 中启用 <strong>Enable developer mode</strong>，重启 Premiere。Adobe 通用 UXP 教程支持的最低版本与这个项目的最低版本不同，本节采用项目要求的 26.0。<a href=\"https://github.com/CaYatur/PremiereProMCP\" target=\"_blank\" rel=\"noopener noreferrer\">项目版本要求</a>、<a href=\"https://developer.adobe.com/premiere-pro/uxp/plugins/\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe 插件加载说明</a></p>\n<p><strong>2. 安装 PPMCP</strong></p>\n<p>从 <a href=\"https://github.com/CaYatur/PremiereProMCP/releases\" target=\"_blank\" rel=\"noopener noreferrer\">作者 Releases</a> 下载 <code>PPMCP-Setup-x.x.x.zip</code>，完整解压，保留 <code>Setup.bat</code> 与 <code>payload</code> 的相对位置，再运行 <code>Setup.bat</code>。安装后打开作者生成的连接说明：</p>\n<ul><li><code>%APPDATA%/PPMCP/HOW-TO-USE.txt</code>：使用步骤与本机实际路径。</li><li><code>%APPDATA%/PPMCP/HOW-TO-CONNECT.txt</code>：程序、服务器与插件入口。</li><li><code>%APPDATA%/PPMCP/mcp-config-snippet.json</code>：供客户端合并使用的配置片段。</li></ul>\n<p>以上为作者提供的发布包安装方式，本章没有在本机执行安装。<a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">完整安装指南</a></p>\n<p><strong>3. 启动桥接并加载插件</strong></p>\n<p>运行安装器建立的 <strong>PPMCP Bridge</strong> 快捷方式。打开 Premiere 与 UXP Developer Tool，在后者选择 <strong>Add Plugin</strong>，使用 <code>HOW-TO-CONNECT.txt</code> 中的插件 manifest 路径，再点击 <strong>Load</strong>。在 Premiere 中打开 PPMCP 面板，确认状态为 <strong>Active</strong>；面板关闭后，可从 <strong>Window → UXP Plugins</strong> 找回。<a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">作者连接步骤</a>、<a href=\"https://developer.adobe.com/premiere-pro/uxp/plugins/\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe 面板入口说明</a></p>\n<p><strong>4. 配置 Agent 客户端</strong></p>\n<p>将生成的 MCP 配置片段合并到客户端，保存后重启。PPMCP 使用本地 <strong>stdio</strong>：客户端启动指定的 Node 程序，并以服务器入口文件作为参数。它不能填进只接受远程 MCP URL 的连接框。不同客户端配置格式有差异，按 <a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">作者的客户端配置章节</a>填写；使用安装器生成的真实路径。</p>\n<p><strong>5. 核对能够执行的操作</strong></p>\n<p>作者记录的实机验证包含读取工程与序列、部分片段剪辑、位置与缩放、音量增益，以及工程保存和序列截图。完整工具表还包含未逐项实测的功能，不能仅凭工具数量判断可靠性。<a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/docs/FEATURES.md\" target=\"_blank\" rel=\"noopener noreferrer\">工具与验证状态</a></p>\n<p>可编辑 MOGRT 文字需要作者另列的 CEP Text Bridge；PNG 文字覆盖层与可编辑字幕不同。新增轨道等操作也可能受 UXP 接口限制，先检查当前版本的支持状态。</p>\n<p><strong>软件与接入教程</strong>：<a href=\"https://helpx.adobe.com/premiere/desktop.html\" target=\"_blank\" rel=\"noopener noreferrer\">Premiere 官方帮助</a>、<a href=\"https://helpx.adobe.com/premiere/desktop/premiere-ai-assistant/overview.html\" target=\"_blank\" rel=\"noopener noreferrer\">内置助手说明</a>、<a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">PPMCP 安装指南</a>、<a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/docs/FEATURES.md\" target=\"_blank\" rel=\"noopener noreferrer\">工具能力与限制</a>。</p>",
          "headings": []
        },
        {
          "id": "course-video-editing-agent-section-4",
          "title": "4. 常见问题与结果检查",
          "html": "<table class=\"d-table\"><thead><tr><th>现象</th><th>优先检查</th></tr></thead><tbody><tr><td>Agent 只有建议，软件没有变化</td><td>是否启用了实际编辑工具，是否出现调用记录，回读的工程是否正确</td></tr><tr><td>Resolve 服务启动但读不到工程</td><td>Studio 版本、本地脚本设置、Resolve 是否运行，以及工程是否打开</td></tr><tr><td>Premiere 插件没有连接</td><td>开发者模式、UXP 插件是否 Load、PPMCP Bridge 是否运行、面板是否 Active</td></tr><tr><td>MCP 工具为空</td><td>客户端是否支持本地 stdio、启动路径是否有效、配置是否按客户端格式合并</td></tr><tr><td>某个菜单功能无法通过 Agent 执行</td><td>查看当前接口与工具的支持范围；保留错误信息，转到软件中完成该步骤</td></tr><tr><td>保存成功但没有测试视频</td><td>工程保存与视频导出分别检查，核对渲染状态和实际输出文件</td></tr></tbody></table>",
          "headings": []
        }
      ]
    },
    "translations": {
      "en": {
        "source": "docs/en/VIDEO_CREATION_CURRICULUM.md",
        "sourceHash": "218f4bb9b5e7c47b50be2d89d894a52779d9511de206192555586955dd40331f",
        "language": "en",
        "introduction": {
          "id": "course-video-editing-agent-introduction",
          "title": "Reading note",
          "html": "<p>After generating shots, you generally still need to adjust clip lengths, shot order, composition, color and sound. This chapter first chooses professional editors, then connects an agent so you can operate an existing project through natural language and refine it after previewing.</p>"
        },
        "chapter": {
          "id": "course-video-editing-agent",
          "title": "Chapter 2 Use an agent to operate professional video editors",
          "sections": [
            {
              "id": "course-video-editing-agent-section-1",
              "title": "1. Choose between two editors",
              "html": "<p>This chapter selects <strong>DaVinci Resolve Studio</strong> and <strong>Adobe Premiere Pro</strong> for their professional postproduction capabilities, editable projects and documented agent connections. Choose either one to learn.</p>\n<table class=\"d-table\"><thead><tr><th>Platform</th><th>Why it was selected</th><th>Agent connection route</th><th>How to choose</th></tr></thead><tbody><tr><td><a href=\"https://www.blackmagicdesign.com/products/davinciresolve\" target=\"_blank\" rel=\"noopener noreferrer\">DaVinci Resolve Studio</a></td><td>Editing, grading, Fusion compositing and Fairlight audio in one project</td><td>Version 21.1 added official AI assistant integration; third-party MCP is another option below</td><td>Start here for a new postproduction workflow emphasizing integrated image and audio work</td></tr><tr><td><a href=\"https://www.adobe.com/products/premiere.html\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe Premiere Pro</a></td><td>Precise timeline editing, text and graphics, and Adobe asset collaboration</td><td>Built-in AI Assistant (beta); third-party PPMCP for an external agent</td><td>Continue with it if you already use Photoshop, After Effects or Premiere projects</td></tr></tbody></table>\n<p>An editor having a feature and an agent being able to call it are separate questions. Begin by connecting queries, one small edit and project saving, then expand the task.</p>",
              "headings": []
            },
            {
              "id": "course-video-editing-agent-section-2",
              "title": "2. DaVinci Resolve Studio: connect an external agent",
              "html": "<p><strong>Official integration and the route used here</strong></p>\n<p>Blackmagic confirmed AI assistant integration in its <a href=\"https://www.blackmagicdesign.com/media/partial/release/20260908-03\" target=\"_blank\" rel=\"noopener noreferrer\">official Resolve 21.1 release notes</a>. Listed tasks include project analysis, media organization, setting changes, highlight edits and batch rendering. For that version, consult the 21.1 manual and new-feature guides in the <a href=\"https://www.blackmagicdesign.com/support\" target=\"_blank\" rel=\"noopener noreferrer\">official support center</a> and use the connection method supplied with the software.</p>\n<p>The instructions below cover the <strong>third-party <code>samuelgursky/davinci-resolve-mcp</code> route</strong>, whose installation documentation provides environment preparation, client configuration and connection checks. This and the official integration are separate solutions; choose one. <a href=\"https://github.com/samuelgursky/davinci-resolve-mcp\" target=\"_blank\" rel=\"noopener noreferrer\">Project documentation</a></p>\n<p><strong>1. Prepare the editor and scripting environment</strong></p>\n<p>The author requires Resolve Studio 18.5 or later, Git, and 64-bit Python 3.10 or later; the commands below use Python 3.12. Media analysis also needs ffmpeg available on PATH; add dependencies for transcription and other features as needed. Start Resolve and open a practice project. Set <strong>Preferences → System → General → External scripting using</strong> to <strong>Local</strong>, then save. <a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/install.md\" target=\"_blank\" rel=\"noopener noreferrer\">Installation and version requirements</a></p>\n<p>This section is written for Studio. Scripting and bridge conditions in the free edition vary by version; do not apply these steps unchanged.</p>\n<p><strong>2. Download the project and generate client configuration</strong></p>\n<p>Open PowerShell in your chosen tools directory and run:</p>\n<pre><code class=\"language-powershell\">git clone https://github.com/samuelgursky/davinci-resolve-mcp.git\nSet-Location davinci-resolve-mcp\npy -3.12 install.py --clients manual</code></pre>\n<p>The installer creates the runtime environment and prints manual connection settings. Add its generated command, arguments and environment variables to your agent client using the actual paths it supplies. Merge the server entry if other MCP configurations exist. The same <a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/install.md\" target=\"_blank\" rel=\"noopener noreferrer\">author&#39;s installation guide</a> covers other installation methods and troubleshooting.</p>\n<p><strong>3. Connect and inspect the current project</strong></p>\n<p>Your client must support launching a local <strong>stdio MCP service</strong>. Save the configuration, restart the client and enable the Resolve tools while leaving Resolve and the project open. First ask the agent to read the project name, timelines, tracks and clips, then compare its response with the editor.</p>\n<p><strong>4. Begin with explicitly supported edits</strong></p>\n<p>Start with media organization, clip-property changes, markers or render settings. Before cutting, moving or replacing clips, ask the agent to check that its interface supports the operation. The <a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/kernels/timeline-edit-kernel.md\" target=\"_blank\" rel=\"noopener noreferrer\">timeline operation limits</a> distinguish supported, partially supported and restricted operations; an interface may not expose everything available in the editor UI.</p>\n<p><strong>Editor and connection tutorials</strong>: <a href=\"https://www.blackmagicdesign.com/products/davinciresolve/training\" target=\"_blank\" rel=\"noopener noreferrer\">official Blackmagic training</a>, <a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/install.md\" target=\"_blank\" rel=\"noopener noreferrer\">MCP installation guide</a>, <a href=\"https://github.com/samuelgursky/davinci-resolve-mcp/blob/main/docs/kernels/timeline-edit-kernel.md\" target=\"_blank\" rel=\"noopener noreferrer\">timeline capabilities</a>.</p>",
              "headings": []
            },
            {
              "id": "course-video-editing-agent-section-3",
              "title": "3. Adobe Premiere Pro: built-in assistant and external agents",
              "html": "<p><strong>Route A: built-in AI Assistant</strong></p>\n<p>If your version and account include the assistant, open a project in Premiere and choose <strong>Window → Assistant</strong>. Adobe&#39;s <a href=\"https://helpx.adobe.com/premiere/desktop/premiere-ai-assistant/overview.html\" target=\"_blank\" rel=\"noopener noreferrer\">official overview</a> still labels it beta; listed tasks include bins and renaming, transcription, markers and initial clip assembly.</p>\n<p>Use this route to organize media and build a rough cut with natural language. For precise clip, composition or volume edits, check the assistant&#39;s current supported actions, or choose the external route below.</p>\n<p><strong>Route B: external agent + PPMCP</strong></p>\n<p>This chapter uses the third-party project <a href=\"https://github.com/CaYatur/PremiereProMCP\" target=\"_blank\" rel=\"noopener noreferrer\">CaYatur/PremiereProMCP (PPMCP)</a>. A UXP plugin and local bridge connect Premiere and expose editing tools to an agent. The following instructions use Windows, the author&#39;s primary testing environment.</p>\n<p><strong>1. Prepare Premiere and the plugin loader</strong></p>\n<p>Use <strong>Premiere 26.0 or later</strong> and install Adobe UXP Developer Tool. Enable <strong>Enable developer mode</strong> in Premiere&#39;s <strong>Settings → Plugins</strong>, then restart Premiere. Adobe&#39;s general UXP tutorials and this project have different minimum versions; this section follows the project&#39;s 26.0 requirement. <a href=\"https://github.com/CaYatur/PremiereProMCP\" target=\"_blank\" rel=\"noopener noreferrer\">Project requirements</a>, <a href=\"https://developer.adobe.com/premiere-pro/uxp/plugins/\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe plugin loading documentation</a></p>\n<p><strong>2. Install PPMCP</strong></p>\n<p>Download <code>PPMCP-Setup-x.x.x.zip</code> from the <a href=\"https://github.com/CaYatur/PremiereProMCP/releases\" target=\"_blank\" rel=\"noopener noreferrer\">author&#39;s releases</a>. Extract it completely, keeping the relative locations of <code>Setup.bat</code> and <code>payload</code>, then run <code>Setup.bat</code>. After installation, open the generated instructions:</p>\n<ul><li><code>%APPDATA%/PPMCP/HOW-TO-USE.txt</code>: usage and actual local paths.</li><li><code>%APPDATA%/PPMCP/HOW-TO-CONNECT.txt</code>: application, server and plugin entry points.</li><li><code>%APPDATA%/PPMCP/mcp-config-snippet.json</code>: configuration to merge into your client.</li></ul>\n<p>This is the author&#39;s release-package installation method; it has not been run on this site&#39;s local machine. <a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">Full installation guide</a></p>\n<p><strong>3. Start the bridge and load the plugin</strong></p>\n<p>Run the <strong>PPMCP Bridge</strong> shortcut created by the installer. Open Premiere and UXP Developer Tool; select <strong>Add Plugin</strong> in the latter using the plugin manifest path in <code>HOW-TO-CONNECT.txt</code>, then click <strong>Load</strong>. Open the PPMCP panel in Premiere and confirm <strong>Active</strong> status. Reopen a closed panel through <strong>Window → UXP Plugins</strong>. <a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">Author&#39;s connection steps</a>, <a href=\"https://developer.adobe.com/premiere-pro/uxp/plugins/\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe panel entry points</a></p>\n<p><strong>4. Configure the agent client</strong></p>\n<p>Merge the generated MCP snippet into the client, save and restart it. PPMCP uses local <strong>stdio</strong>: the client launches the specified Node program with the server entry file as an argument. It cannot be entered into a connector accepting only remote MCP URLs. Configuration formats vary; follow the <a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">author&#39;s client configuration section</a> using the installer&#39;s actual paths.</p>\n<p><strong>5. Verify supported operations</strong></p>\n<p>The author&#39;s recorded real-machine checks include reading projects and sequences, some clip edits, position and scale, audio gain, project saving and sequence screenshots. The full tool list also includes features not individually tested; tool count alone does not establish reliability. <a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/docs/FEATURES.md\" target=\"_blank\" rel=\"noopener noreferrer\">Tools and validation status</a></p>\n<p>Editable MOGRT text needs the author&#39;s additional CEP Text Bridge. A PNG text overlay is different from editable captions. Creating tracks and other operations can also be constrained by UXP; check the current version&#39;s support first.</p>\n<p><strong>Editor and connection tutorials</strong>: <a href=\"https://helpx.adobe.com/premiere/desktop.html\" target=\"_blank\" rel=\"noopener noreferrer\">official Premiere help</a>, <a href=\"https://helpx.adobe.com/premiere/desktop/premiere-ai-assistant/overview.html\" target=\"_blank\" rel=\"noopener noreferrer\">built-in assistant overview</a>, <a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/INSTALL.md\" target=\"_blank\" rel=\"noopener noreferrer\">PPMCP installation guide</a>, <a href=\"https://github.com/CaYatur/PremiereProMCP/blob/main/docs/FEATURES.md\" target=\"_blank\" rel=\"noopener noreferrer\">tool capabilities and limits</a>.</p>",
              "headings": []
            },
            {
              "id": "course-video-editing-agent-section-4",
              "title": "4. Troubleshooting and result checks",
              "html": "<table class=\"d-table\"><thead><tr><th>Symptom</th><th>Check first</th></tr></thead><tbody><tr><td>Agent gives advice but the editor does not change</td><td>Actual editing tools are enabled, calls are recorded, and project readback identifies the right project</td></tr><tr><td>Resolve service starts but cannot read a project</td><td>Studio version, local scripting settings, running Resolve and an open project</td></tr><tr><td>Premiere plugin is not connected</td><td>Developer mode, loaded UXP plugin, running PPMCP Bridge and Active panel status</td></tr><tr><td>MCP tool list is empty</td><td>Client support for local stdio, valid launch paths and correctly merged client-specific configuration</td></tr><tr><td>A menu feature cannot be called by the agent</td><td>Current interface/tool support; retain the error and complete that step in the editor</td></tr><tr><td>Saving succeeds but there is no test video</td><td>Check project saving and video export separately, including render status and the actual file</td></tr></tbody></table>",
              "headings": []
            }
          ]
        },
        "translatedFrom": {
          "source": "docs/VIDEO_CREATION_CURRICULUM.md",
          "sourceHash": "390dd385bada0fc0ac37f2400f6f21a12a8e738ebe26d433dd680ea57b86732a"
        }
      }
    }
  },
  "video-workflow-reuse": {
    "source": "docs/VIDEO_CREATION_CURRICULUM.md",
    "sourceHash": "390dd385bada0fc0ac37f2400f6f21a12a8e738ebe26d433dd680ea57b86732a",
    "language": "zh-Hans",
    "introduction": {
      "id": "course-video-workflow-reuse-introduction",
      "title": "阅读说明",
      "html": "<p>本章收录原作者已经公开的制作案例，以即梦为重点。每条都注明作者、教程、实际使用的工具，以及素材或提示词的获取位置。下文只概括来源明确写出的制作顺序，完整操作跟随原教程。</p>\n<table class=\"d-table\"><thead><tr><th>路线</th><th>原作者与现成案例</th><th>可以直接找到什么</th></tr></thead><tbody><tr><td>即梦 Agent，先从这条开始</td><td>AI产品狙击手／Kevin Zhu：中秋动画</td><td>作者图文教程、即梦作品、逐镜头说明与“做同款”入口</td></tr><tr><td>即梦智能多帧</td><td>AI产品狙击手／Kevin Zhu：饮料产品展示</td><td>作者案例与多张图片作为关键帧的制作方法</td></tr><tr><td>即梦 Seedance 2.0</td><td>HiShineAi：赛车短片宫格分镜工作流</td><td>作者视频教程、工具组合与分镜到成片的流程说明</td></tr><tr><td>Wan 3.0</td><td>The Workflow Lab／Terence Sia：替换自己的视频角色</td><td>分步图文、截图、可编辑提示词与最终结果</td></tr><tr><td>MiniMax H3 + Seedance 2.5</td><td>Curious Refuge／Tyler Smith：先做样片再出成片</td><td>实际迭代记录、参考图、前后结果与完整图文教程</td></tr></tbody></table>\n<p>原作者采用的版本和界面保持原样：即梦案例中包含旧版模型；Wan 与 H3 案例分别使用 Higgsfield、Magnific 的模型入口。它们不是万相、海螺原站的按钮教程，也不能直接按第一章的新模型名称替换。教程可阅读不代表配套素材全部公开，具体获取条件见各条说明。</p>"
    },
    "chapter": {
      "id": "course-video-workflow-reuse",
      "title": "第三章 新人可以复用的工作流",
      "sections": [
        {
          "id": "course-video-workflow-reuse-section-1",
          "title": "1. 即梦 Agent：复用作者的中秋动画",
          "html": "<p><strong>原作者</strong>：AI产品狙击手／Kevin Zhu。教程发表于 2025 年 10 月 9 日。</p>\n<p><strong>教程与作品</strong>：<a href=\"https://www.techgogogo.com/2025/10/09/一分钟生成中秋动画！即梦智能体实战/\" target=\"_blank\" rel=\"noopener noreferrer\">《一分钟生成中秋动画！即梦智能体实战！》</a>；<a href=\"https://jimeng.jianying.com/ai-tool/work-detail/7557309615910686002?itemType=53&amp;workDetailType=AiVideo\" target=\"_blank\" rel=\"noopener noreferrer\">作者的即梦作品与做同款入口</a>。</p>\n<p>作者用即梦 Agent 制作家庭团聚主题动画，并提供了自己的作品链接。作品页公开分镜，内容从提灯回家、家人相聚延续到庭院赏月；页面标注 <strong>Seedance 1.0 mini、42 秒、16:9</strong>。</p>\n<p><strong>原作者的流程</strong>：通过 Agent 描述动画需求，生成多镜头作品，再从分享作品进入同款创作。</p>\n<p><strong>怎样复用这条现成流程</strong>：先读作者教程，再打开作品页查看各镜头；使用页面的“做同款”进入平台提供的复用入口，按原教程继续。保留原分镜结构后，再调整主题与内容。</p>\n<p><strong>素材与版本条件</strong>：原页可查看镜头图与视频提示词；本次未取得作者最初交给 Agent 的完整总提示词，因此不另写一份代替。做同款后的可编辑范围与旧模型是否仍可用，需要在登录后的界面确认。</p>",
          "headings": []
        },
        {
          "id": "course-video-workflow-reuse-section-2",
          "title": "2. 即梦智能多帧：复用饮料产品展示方法",
          "html": "<p><strong>原作者</strong>：AI产品狙击手／Kevin Zhu。教程发表于 2025 年 8 月 20 日。</p>\n<p><strong>原教程</strong>：<a href=\"https://www.techgogogo.com/2025/08/20/一键生成炸裂产品展示视频！即梦实战第27集/\" target=\"_blank\" rel=\"noopener noreferrer\">《一键生成炸裂产品展示视频！即梦实战第27集！》</a>。</p>\n<p>作者以自己设计的虚构饮料制作展示 demo，使用的是当时即梦的<strong>智能多帧</strong>功能。</p>\n<p><strong>原作者的流程</strong>：准备多张产品图片作为关键帧，再分别描述当前帧如何过渡到下一帧，组成产品展示视频。</p>\n<p><strong>怎样复用这条现成流程</strong>：从原教程学习图片排列与帧间过渡的写法，再换成自己的产品图片。重点复用作者的关键帧组织方法；模型与控件按照原教程辨认，不改称 Seedance 2.5 专用流程。</p>\n<p><strong>素材条件</strong>：本次读到的原文没有公开原始产品图片下载包、完整帧间提示词或固定生成参数。该条是作者的演示教程，不标成可下载的一键工作流。</p>",
          "headings": []
        },
        {
          "id": "course-video-workflow-reuse-section-3",
          "title": "3. 即梦 Seedance 2.0：跟做赛车短片分镜工作流",
          "html": "<p><strong>原作者</strong>：HiShineAi。发布于 2026 年 2 月 27 日。</p>\n<p><strong>原视频教程</strong>：<a href=\"https://www.bilibili.com/video/BV1xYADzCERe/\" target=\"_blank\" rel=\"noopener noreferrer\">《10倍效率！利用九宫格分镜制作Ai短片工作流》</a>。</p>\n<p>作者以赛车短片演示完整制作思路，公开列出的核心工具为 <strong>Gemini、Nano Banana Pro、即梦 Seedance 2.0</strong>。</p>\n<p><strong>原作者的流程</strong>：用 Gemini 梳理分镜逻辑，通过九宫格或二十五宫格统一视觉，再结合 Seedance 2.0 与单帧镜头完成短片。</p>\n<p><strong>怎样复用这条现成流程</strong>：沿原视频学习分镜规划、宫格画面与单帧镜头如何配合。先保留作者的工具组合跟做，再考虑更换题材；不要把宫格分镜教程简化成一条自行拼出的提示词。</p>\n<p><strong>素材条件</strong>：作者简介说明提示词模板需按其要求联系获取，不是公开直链下载。本次核对到原账号、案例说明和流程简介，未取得完整字幕、逐步参数或模板正文；这些内容直接看原视频，不在这里补写。</p>",
          "headings": []
        },
        {
          "id": "course-video-workflow-reuse-section-4",
          "title": "4. Wan 3.0：保留自己的表演，更换视频角色",
          "html": "<p><strong>原作者</strong>：The Workflow Lab／Terence Sia。教程标注核对日期为 2026 年 10 月 23 日。</p>\n<p><strong>原教程</strong>：<a href=\"https://theworkflowlab.ai/tutorials/transform-yourself-with-wan-3-0\" target=\"_blank\" rel=\"noopener noreferrer\">《Transform yourself with Wan 3.0》</a>；<a href=\"https://theworkflowlab.ai/about\" target=\"_blank\" rel=\"noopener noreferrer\">作者介绍</a>；<a href=\"https://www.instagram.com/reel/DeyCIiwTPxv/\" target=\"_blank\" rel=\"noopener noreferrer\">原教程链接的 Instagram 演示</a>。</p>\n<p>这条教程实际使用 <strong>Higgsfield 中的 Wan 3.0</strong>，并披露与 Higgsfield 的合作关系。页面有操作截图、角色参考图、提示词及最终结果。</p>\n<p><strong>原作者的流程</strong>：</p>\n<ol><li>录制自己的表演，保留动作、表情与声音。</li><li>按作者提供的角色参考图提示词制作角色图。</li><li>在 Higgsfield 的 Video → Create Video 中选择 Wan 3.0。</li><li>使用 <strong>References</strong> 上传角色图与自拍视频，核对素材编号。</li><li>从原文复制 <strong>Your editable transformation prompt</strong>，替换时长与画幅等字段。</li><li>设置输出、开启声音，生成后检查角色、动作与声音，再下载结果。</li></ol>\n<p><strong>提示词获取</strong>：直接使用原教程的两个可编辑模板。原文另列了作者实际使用的长提示词，其中包含在指定时刻添加咖啡杯的额外动作；作者明确区分了它与给读者复用的简化模板。</p>",
          "headings": []
        },
        {
          "id": "course-video-workflow-reuse-section-5",
          "title": "5. MiniMax H3：复用“样片确认后再出成片”的流程",
          "html": "<p><strong>原作者</strong>：Curious Refuge／Tyler Smith。原页日期显示为 10 月 9 日。</p>\n<p><strong>原教程</strong>：<a href=\"https://curiousrefuge.com/blog/how-to-save-money-on-ai-generations\" target=\"_blank\" rel=\"noopener noreferrer\">《How to Save Money on AI Video Generation》</a>。</p>\n<p>作者在 <strong>Magnific</strong> 中制作酒吧对话的三镜头片段，公开了角色图、场景参考、多轮生成及最终组合结果。本节收录其中 <strong>MiniMax H3 做样片、Seedance 2.5 出成片</strong> 的路线。</p>\n<p><strong>原作者的流程</strong>：</p>\n<ol><li>将三个镜头拆成两部分：前两个镜头合成约 10 秒片段，第三个镜头单独制作。</li><li>上传角色图与场景参考，用 MiniMax H3 Max 的低分辨率输出反复调整构图和调度。</li><li>确认方向后，把调整后的提示词用于 Seedance 2.5 标准模式，生成成片版本。</li><li>制作第三个镜头时，再加入前面已生成的片段作为连续性参考，最后组合。</li></ol>\n<p><strong>素材与使用条件</strong>：原文有参考图和迭代结果，但没有公开本案例完整生成提示词，不补造模板。作者的金额、耗时与画质判断来自该次 Magnific 测试，不作为海螺官网的价格或效果承诺。</p>\n<p>原文还测试了 Seedance 自身的 Draft → HD 路线，并比较两种方法的结果；想减少平台与模型切换时，可直接阅读作者这一部分的实测结论。</p>",
          "headings": []
        },
        {
          "id": "course-video-workflow-reuse-section-6",
          "title": "6. 按原教程选择复用方式",
          "html": "<table class=\"d-table\"><thead><tr><th>你想怎样开始</th><th>对应原教程</th></tr></thead><tbody><tr><td>先打开一个已有作品做同款</td><td>中秋 Agent 动画：有即梦作品入口</td></tr><tr><td>用自己的产品图片制作展示片</td><td>饮料智能多帧：跟作者学习关键帧与过渡</td></tr><tr><td>学习多镜头短片的组织方法</td><td>HiShineAi 赛车短片：按原视频跟做</td></tr><tr><td>希望直接获得作者公开的可编辑提示词</td><td>Terence Sia 的 Wan 3.0 角色替换教程</td></tr><tr><td>研究生成迭代与成片成本</td><td>Tyler Smith 的 H3 样片到 Seedance 成片教程</td></tr></tbody></table>\n<p>本章已核对作者页面、原文或公开简介与链接；尚未在账号中实际复现。没有公开的原始素材、提示词、参数或字幕，不从成片反推补写。</p>",
          "headings": []
        }
      ]
    },
    "translations": {
      "en": {
        "source": "docs/en/VIDEO_CREATION_CURRICULUM.md",
        "sourceHash": "218f4bb9b5e7c47b50be2d89d894a52779d9511de206192555586955dd40331f",
        "language": "en",
        "introduction": {
          "id": "course-video-workflow-reuse-introduction",
          "title": "Reading note",
          "html": "<p>This chapter collects creators&#39; published production cases, emphasizing Jimeng. Each entry identifies the creator, tutorial, actual tools and where to obtain assets or prompts. Only sequences explicitly documented in the sources are summarized; follow the original tutorials for complete operation.</p>\n<table class=\"d-table\"><thead><tr><th>Route</th><th>Original creator and existing case</th><th>What you can find directly</th></tr></thead><tbody><tr><td>Jimeng Agent: start here</td><td>AI Product Sniper / Kevin Zhu: Mid-Autumn animation</td><td>Illustrated tutorial, Jimeng work, shot descriptions and a “Make similar” entry point</td></tr><tr><td>Jimeng Smart Multiframe</td><td>AI Product Sniper / Kevin Zhu: drink product showcase</td><td>Creator&#39;s demonstration and using multiple images as keyframes</td></tr><tr><td>Jimeng Seedance 2.0</td><td>HiShineAi: grid-storyboard workflow for a racing short</td><td>Original video, tool combination and storyboard-to-video process</td></tr><tr><td>Wan 3.0</td><td>The Workflow Lab / Terence Sia: replace your video character</td><td>Illustrated steps, screenshots, editable prompts and final output</td></tr><tr><td>MiniMax H3 + Seedance 2.5</td><td>Curious Refuge / Tyler Smith: drafts before final output</td><td>Actual iterations, references, before/after outputs and a full illustrated tutorial</td></tr></tbody></table>\n<p>Keep the authors&#39; versions and interfaces: the Jimeng cases include older models; the Wan and H3 cases use Higgsfield and Magnific, respectively. They are not button-by-button tutorials for the Wan or Hailuo original sites, and the newer model names in Chapter 1 cannot simply be substituted. A readable tutorial does not mean all assets are public; see each entry&#39;s access conditions.</p>"
        },
        "chapter": {
          "id": "course-video-workflow-reuse",
          "title": "Chapter 3 Existing workflows for beginners",
          "sections": [
            {
              "id": "course-video-workflow-reuse-section-1",
              "title": "1. Jimeng Agent: reuse the creator's Mid-Autumn animation",
              "html": "<p><strong>Original creator</strong>: AI Product Sniper / Kevin Zhu. Published October 9, 2025.</p>\n<p><strong>Tutorial and work</strong>: <a href=\"https://www.techgogogo.com/2025/10/09/一分钟生成中秋动画！即梦智能体实战/\" target=\"_blank\" rel=\"noopener noreferrer\">“Generate a Mid-Autumn animation in one minute! Jimeng Agent in practice!”</a>; <a href=\"https://jimeng.jianying.com/ai-tool/work-detail/7557309615910686002?itemType=53&amp;workDetailType=AiVideo\" target=\"_blank\" rel=\"noopener noreferrer\">creator&#39;s Jimeng work and Make similar entry</a>.</p>\n<p>The creator used Jimeng Agent for a family-reunion animation and supplied a link to the work. The public storyboard runs from returning home with a lantern through a family reunion to moon viewing in a courtyard. The page labels it <strong>Seedance 1.0 mini, 42 seconds, 16:9</strong>.</p>\n<p><strong>Creator&#39;s process</strong>: describe the animation to the agent, generate a multishot work, then use the shared work to begin a similar creation.</p>\n<p><strong>How to reuse this existing process</strong>: read the tutorial, inspect each shot on the work page, then use “Make similar” to enter the platform&#39;s reuse flow and follow the original instructions. Retain the storyboard structure before adjusting theme and content.</p>\n<p><strong>Assets and version conditions</strong>: the original page exposes shot images and video prompts. The complete initial request to the agent was not obtained in this research, so no substitute is written here. Confirm the editable scope and continued availability of the older model after logging in.</p>",
              "headings": []
            },
            {
              "id": "course-video-workflow-reuse-section-2",
              "title": "2. Jimeng Smart Multiframe: reuse the drink showcase method",
              "html": "<p><strong>Original creator</strong>: AI Product Sniper / Kevin Zhu. Published August 20, 2025.</p>\n<p><strong>Original tutorial</strong>: <a href=\"https://www.techgogogo.com/2025/08/20/一键生成炸裂产品展示视频！即梦实战第27集/\" target=\"_blank\" rel=\"noopener noreferrer\">“Create an explosive product showcase in one click! Jimeng practice, episode 27!”</a>.</p>\n<p>The creator demonstrated a fictional drink of their own design with Jimeng&#39;s then-current <strong>Smart Multiframe</strong> feature.</p>\n<p><strong>Creator&#39;s process</strong>: prepare several product images as keyframes and describe the transition from each frame to the next to assemble the showcase.</p>\n<p><strong>How to reuse this existing process</strong>: study the image ordering and transition descriptions, then substitute your product images. Reuse the keyframe organization method; identify models and controls from the original tutorial rather than calling this a Seedance 2.5-specific workflow.</p>\n<p><strong>Asset conditions</strong>: the inspected article did not publish an original product-image package, complete interframe prompts or fixed generation settings. This is a demonstration tutorial, not a downloadable one-click workflow.</p>",
              "headings": []
            },
            {
              "id": "course-video-workflow-reuse-section-3",
              "title": "3. Jimeng Seedance 2.0: follow the racing storyboard workflow",
              "html": "<p><strong>Original creator</strong>: HiShineAi. Published February 27, 2026.</p>\n<p><strong>Original video tutorial</strong>: <a href=\"https://www.bilibili.com/video/BV1xYADzCERe/\" target=\"_blank\" rel=\"noopener noreferrer\">“10× efficiency! A workflow for AI shorts using nine-panel storyboards”</a>.</p>\n<p>The creator demonstrates the overall process with a racing short, listing <strong>Gemini, Nano Banana Pro and Jimeng Seedance 2.0</strong> as the core tools.</p>\n<p><strong>Creator&#39;s process</strong>: organize shot logic in Gemini, establish consistent visuals through nine- or twenty-five-panel grids, then combine Seedance 2.0 and individual-frame shots into a short.</p>\n<p><strong>How to reuse this existing process</strong>: follow the original video to learn how storyboard planning, grid images and individual shots work together. Keep the creator&#39;s tool combination for a first attempt, then change the subject; do not replace the storyboard method with an invented single prompt.</p>\n<p><strong>Asset conditions</strong>: the creator&#39;s description says prompt templates require contacting them as instructed; there is no public direct download. This research verified the original account, case description and workflow summary, but did not obtain full subtitles, step-by-step parameters or template text. Consult the video for those details; they are not filled in here.</p>",
              "headings": []
            },
            {
              "id": "course-video-workflow-reuse-section-4",
              "title": "4. Wan 3.0: retain your performance while changing the character",
              "html": "<p><strong>Original creator</strong>: The Workflow Lab / Terence Sia. The tutorial&#39;s stated verification date is October 23, 2026.</p>\n<p><strong>Original tutorial</strong>: <a href=\"https://theworkflowlab.ai/tutorials/transform-yourself-with-wan-3-0\" target=\"_blank\" rel=\"noopener noreferrer\">“Transform yourself with Wan 3.0”</a>; <a href=\"https://theworkflowlab.ai/about\" target=\"_blank\" rel=\"noopener noreferrer\">about the creator</a>; <a href=\"https://www.instagram.com/reel/DeyCIiwTPxv/\" target=\"_blank\" rel=\"noopener noreferrer\">Instagram demonstration linked by the tutorial</a>.</p>\n<p>This tutorial actually uses <strong>Wan 3.0 inside Higgsfield</strong> and discloses a partnership with Higgsfield. It includes interface screenshots, a character reference, prompts and the final output.</p>\n<p><strong>Creator&#39;s process</strong>:</p>\n<ol><li>Record your performance, retaining movement, expressions and sound.</li><li>Create a character image using the provided character-reference prompt.</li><li>Select Wan 3.0 in Higgsfield under Video → Create Video.</li><li>Upload the character image and performance video under <strong>References</strong> and check their identifiers.</li><li>Copy <strong>Your editable transformation prompt</strong> from the original article and replace fields such as duration and aspect ratio.</li><li>Set the output, enable sound, generate and inspect character, motion and audio, then download.</li></ol>\n<p><strong>Obtaining the prompts</strong>: use the two editable templates in the original tutorial. It also lists the creator&#39;s actual longer prompt, including the extra action of adding a coffee cup at a specified time. The author explicitly distinguishes it from the simpler reusable template.</p>",
              "headings": []
            },
            {
              "id": "course-video-workflow-reuse-section-5",
              "title": "5. MiniMax H3: approve a draft before generating the final",
              "html": "<p><strong>Original creator</strong>: Curious Refuge / Tyler Smith. The original page displays October 9.</p>\n<p><strong>Original tutorial</strong>: <a href=\"https://curiousrefuge.com/blog/how-to-save-money-on-ai-generations\" target=\"_blank\" rel=\"noopener noreferrer\">“How to Save Money on AI Video Generation”</a>.</p>\n<p>The creator made a three-shot bar conversation in <strong>Magnific</strong>, publishing character images, scene references, multiple iterations and the final assembly. This section covers the <strong>MiniMax H3 draft → Seedance 2.5 final</strong> route.</p>\n<p><strong>Creator&#39;s process</strong>:</p>\n<ol><li>Divide the three shots into two parts: combine the first two into approximately ten seconds and make the third separately.</li><li>Upload character and scene references; iterate on composition and staging with low-resolution MiniMax H3 Max outputs.</li><li>Once the direction is approved, use the revised prompt in Seedance 2.5 standard mode for the final version.</li><li>For the third shot, add the previously generated clip as a continuity reference, then assemble the results.</li></ol>\n<p><strong>Assets and usage conditions</strong>: the article includes references and iteration results but does not publish the full generation prompt for this case; no template is invented here. Its cost, time and quality judgments come from that Magnific test, not a Hailuo-site price or quality promise.</p>\n<p>The article also tests Seedance&#39;s own Draft → HD route and compares the methods. Read that comparison if you want fewer platform and model switches.</p>",
              "headings": []
            },
            {
              "id": "course-video-workflow-reuse-section-6",
              "title": "6. Choose how to reuse an original tutorial",
              "html": "<table class=\"d-table\"><thead><tr><th>How you want to start</th><th>Corresponding original tutorial</th></tr></thead><tbody><tr><td>Open an existing work and make a similar one</td><td>Mid-Autumn Agent animation: includes a Jimeng work entry point</td></tr><tr><td>Make a showcase with your product images</td><td>Drink Smart Multiframe: study keyframes and transitions</td></tr><tr><td>Learn to organize a multishot short</td><td>HiShineAi racing short: follow the original video</td></tr><tr><td>Obtain publicly available editable prompts</td><td>Terence Sia&#39;s Wan 3.0 character-transformation tutorial</td></tr><tr><td>Study generation iterations and final-output costs</td><td>Tyler Smith&#39;s H3 drafts to Seedance final tutorial</td></tr></tbody></table>\n<p>This chapter checked creator pages, original articles or public descriptions and links, but has not reproduced the cases in accounts. Original assets, prompts, parameters or subtitles that were not published are not reverse-engineered from finished videos and invented here.</p>",
              "headings": []
            }
          ]
        },
        "translatedFrom": {
          "source": "docs/VIDEO_CREATION_CURRICULUM.md",
          "sourceHash": "390dd385bada0fc0ac37f2400f6f21a12a8e738ebe26d433dd680ea57b86732a"
        }
      }
    }
  }
};
