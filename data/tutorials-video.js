/* Generated from docs/VIDEO_CREATION_CURRICULUM.md. Run npm run build:tutorial-video after editing. */
window.VIDEO_TUTORIALS = {
  "video-generation": {
    "source": "docs/VIDEO_CREATION_CURRICULUM.md",
    "sourceHash": "44ec3cf3097312e3bba79f91fdd84cf9f7fded4532819d35c2da6838e1485a65",
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
          "html": "<table class=\"d-table\"><thead><tr><th>输入与任务</th><th>主要控制什么</th><th>首次练习可以怎样做</th></tr></thead><tbody><tr><td>文字生成视频</td><td>主体、动作、场景与摄影方式</td><td>一个主体、一个动作、一个短镜头</td></tr><tr><td>图片生成视频</td><td>初始外观与构图，再补充运动</td><td>用产品或场景图生成缓慢运动</td></tr><tr><td>首尾帧生成</td><td>起点、终点及两者之间的变化</td><td>同一对象的两种相近状态</td></tr><tr><td>多素材参考</td><td>人物、道具、动作、镜头或声音</td><td>给每份素材指定一种用途</td></tr><tr><td></td></tr><tr><td>多片段成片</td><td>顺序、节奏、转场及音画衔接</td><td>把三个通过检查的镜头组成短片</td></tr></tbody></table>",
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
    }
  },
  "video-editing-agent": {
    "source": "docs/VIDEO_CREATION_CURRICULUM.md",
    "sourceHash": "44ec3cf3097312e3bba79f91fdd84cf9f7fded4532819d35c2da6838e1485a65",
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
          "title": "5. 常见问题与结果检查",
          "html": "<table class=\"d-table\"><thead><tr><th>现象</th><th>优先检查</th></tr></thead><tbody><tr><td>Agent 只有建议，软件没有变化</td><td>是否启用了实际编辑工具，是否出现调用记录，回读的工程是否正确</td></tr><tr><td>Resolve 服务启动但读不到工程</td><td>Studio 版本、本地脚本设置、Resolve 是否运行，以及工程是否打开</td></tr><tr><td>Premiere 插件没有连接</td><td>开发者模式、UXP 插件是否 Load、PPMCP Bridge 是否运行、面板是否 Active</td></tr><tr><td>MCP 工具为空</td><td>客户端是否支持本地 stdio、启动路径是否有效、配置是否按客户端格式合并</td></tr><tr><td>某个菜单功能无法通过 Agent 执行</td><td>查看当前接口与工具的支持范围；保留错误信息，转到软件中完成该步骤</td></tr><tr><td>保存成功但没有测试视频</td><td>工程保存与视频导出分别检查，核对渲染状态和实际输出文件</td></tr></tbody></table>",
          "headings": []
        }
      ]
    }
  },
  "video-workflow-reuse": {
    "source": "docs/VIDEO_CREATION_CURRICULUM.md",
    "sourceHash": "44ec3cf3097312e3bba79f91fdd84cf9f7fded4532819d35c2da6838e1485a65",
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
    }
  }
};
