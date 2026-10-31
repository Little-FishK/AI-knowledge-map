/* Generated from docs/IMAGE_CREATION_CURRICULUM.md. Run npm run build:tutorial-images after editing. */
window.IMAGE_TUTORIALS = {
  "image-generation": {
    "source": "docs/IMAGE_CREATION_CURRICULUM.md",
    "sourceHash": "cdd3b15fa5c2c1e6fd0d13ee333cd948e15caf3a656fa7f08dc432006625ad19",
    "language": "zh-Hans",
    "introduction": {
      "id": "course-image-generation-introduction",
      "title": "阅读说明",
      "html": "<p>使用 ChatGPT、Gemini、豆包等工具，通过文字需求、参考图和连续反馈生成或修改图片，属于技术层级较低，比较方便的图像创作。不属于本章范畴。</p>"
    },
    "chapter": {
      "id": "course-image-generation",
      "title": "第一章 专业图像生成与工作流",
      "sections": [
        {
          "id": "course-image-generation-section-1",
          "title": "Midjourney 的权威教程",
          "html": "<p>Midjourney 官方文档包含图文步骤和短视频，可以覆盖从第一次生成到参考图控制、局部修改的主要操作。</p>\n<table class=\"d-table\"><thead><tr><th>官方资料</th><th>主要内容</th></tr></thead><tbody><tr><td><a href=\"https://docs.midjourney.com/hc/en-us/articles/33329261836941-Getting-Started-Guide\" target=\"_blank\" rel=\"noopener noreferrer\">入门指南</a></td><td>网页端生成、设置、图片整理，以及后续编辑入口</td></tr><tr><td><a href=\"https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics\" target=\"_blank\" rel=\"noopener noreferrer\">提示词基础</a></td><td>怎样描述主体、媒介、环境、光线、颜色和构图</td></tr><tr><td><a href=\"https://docs.midjourney.com/hc/en-us/articles/32040250122381-Image-Prompts\" target=\"_blank\" rel=\"noopener noreferrer\">图片提示 Image Prompts</a></td><td>用图片影响内容、构图、颜色等视觉特征</td></tr><tr><td><a href=\"https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference\" target=\"_blank\" rel=\"noopener noreferrer\">风格参考 Style Reference</a></td><td>借用参考图的色彩、材质、媒介和光线风格</td></tr><tr><td><a href=\"https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model\" target=\"_blank\" rel=\"noopener noreferrer\">编辑模型 Edit Model</a></td><td>文字指令编辑、多参考图、局部修改与扩图</td></tr><tr><td><a href=\"https://docs.midjourney.com/hc/en-us/articles/33329329805581-Modifying-Your-Creations\" target=\"_blank\" rel=\"noopener noreferrer\">修改生成结果</a></td><td>变体、放大、Remix、平移和扩展画面等操作</td></tr></tbody></table>\n<p>使用这些资料时，要同时查看<a href=\"https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version\" target=\"_blank\" rel=\"noopener noreferrer\">版本与功能兼容表</a>。例如，当前官方文档中 V8 系列的参考图编辑与旧版 Character Reference、Omni Reference 的入口和兼容关系已有区别，照着旧教程操作可能找不到相同功能。</p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-2",
          "title": "Stable Diffusion 的权威教程与资料",
          "html": "<p>Stable Diffusion（SD）是图像生成模型家族，SDXL、SD 3.5 是其中的不同模型系列。实际创作时，需要通过操作软件或代码加载相应模型。阅读下面的资料前，先分清几种名称：</p>\n<table class=\"d-table\"><thead><tr><th>名称</th><th>是什么</th><th>实际用途</th></tr></thead><tbody><tr><td>模型卡 Model Card</td><td>模型发布页面上的说明文档</td><td>查看发布者、用途、模型文件、使用方法、配套要求、限制与许可；主要用于核对模型信息</td></tr><tr><td>ComfyUI</td><td>运行模型并组织生成步骤的操作软件</td><td>把加载模型、输入要求、生成、修改和保存等步骤表示为节点，用连线组成工作流；可以使用 SD 及其他模型</td></tr><tr><td>WebUI</td><td>通过网页界面操作模型的软件；这里指 AUTOMATIC1111 Stable Diffusion WebUI</td><td>通过文生图、图生图等面板中的输入框、滑块和按钮设置并执行任务</td></tr><tr><td>Diffusers</td><td>Hugging Face 维护的编程工具库</td><td>通过 Python 代码加载模型、生成或编辑图片；其文档也可用于查阅参数解释和输出对比</td></tr></tbody></table>\n<p>可以这样理解它们的关系：<strong>通过 ComfyUI 或 WebUI 操作模型，通过模型卡了解模型；需要用代码运行时，可以使用 Diffusers。</strong> 安装操作软件后，还需要准备相应的模型文件与配套组件。初学者可以先跟着界面工具的教程操作，再按需要查模型卡和参数说明，无需先学习 Python。</p>\n<table class=\"d-table\"><thead><tr><th>资料</th><th>提供者与用途</th></tr></thead><tbody><tr><td><a href=\"https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0\" target=\"_blank\" rel=\"noopener noreferrer\">SDXL 官方模型卡</a>、<a href=\"https://huggingface.co/stabilityai/stable-diffusion-3.5-large\" target=\"_blank\" rel=\"noopener noreferrer\">SD 3.5 Large 官方模型卡</a></td><td>Stability AI 提供。确认模型文件、使用方式、配套组件及限制</td></tr><tr><td><a href=\"https://docs.comfy.org/zh/tutorials/basic/text-to-image\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI 官方中文文生图教程</a></td><td>从加载模型、输入要求到运行和保存，适合动手入门；其中基础示例使用 SD 1.5</td></tr><tr><td><a href=\"https://comfyanonymous.github.io/ComfyUI_examples/\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI 维护者示例库</a></td><td>包含图生图、局部重绘、LoRA、ControlNet、放大、SDXL 等完整工作流；示例图片可载入 ComfyUI 查看流程</td></tr><tr><td><a href=\"https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features\" target=\"_blank\" rel=\"noopener noreferrer\">AUTOMATIC1111 项目功能文档</a></td><td>该 WebUI 自身的操作依据，覆盖局部重绘、参数对比、批处理、图片信息等；具体功能需结合所用版本</td></tr><tr><td><a href=\"https://huggingface.co/docs/diffusers/using-diffusers/img2img\" target=\"_blank\" rel=\"noopener noreferrer\">Hugging Face Diffusers 实操文档</a></td><td>偏代码，但参数解释和对比图很有价值，适合核对某个控制项到底有什么作用</td></tr></tbody></table>\n<p>其中，<strong>ComfyUI 官方中文教程和示例库最适合直接跟着做；Diffusers 更适合查清技术用法。</strong></p>\n<p>下面从创作实际出发介绍这些技术。</p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-3",
          "title": "1. 文生图：把视觉要求变成可比较的候选图",
          "html": "<p>需要表达的主要内容包括：</p>\n<ul><li><strong>主体</strong>：画什么，有几个，具有什么外形。</li><li><strong>动作与关系</strong>：谁在做什么，对象之间怎样安排。</li><li><strong>构图</strong>：远景或近景、主体位置、观察角度、留白。</li><li><strong>表现形式</strong>：摄影、水彩、线描、三维渲染等。</li><li><strong>光线与颜色</strong>：光源方向、明暗、冷暖和主要配色。</li><li><strong>画幅</strong>：横版、竖版，以及最终使用位置。</li></ul>\n<p>例如，下面这段是可以用于练习的需求描述：</p>\n<blockquote class=\"quote\"><p>一只橙色狐狸坐在雨后的森林小路上，侧面全身，主体位于画面右侧，左侧保留标题空间，水彩插画，低饱和绿色背景，柔和晨光，横版。</p></blockquote>\n<p>实际操作中，可以先比较主体和构图，再调整风格和细节。Midjourney 官方提示词指南也强调清楚表达关键特征，避免堆砌冗长要求。<a href=\"https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics\" target=\"_blank\" rel=\"noopener noreferrer\">提示词基础</a></p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-4",
          "title": "2. 参考图：明确让模型参考什么",
          "html": "<p>参考图片有几种不同用途，操作时需要分清：</p>\n<table class=\"d-table\"><thead><tr><th>参考目的</th><th>例子</th><th>对应操作</th></tr></thead><tbody><tr><td>内容与构图</td><td>参考房间布局、物体排列</td><td>图片提示、结构控制</td></tr><tr><td>风格</td><td>借用水彩质感、配色、光线</td><td>Midjourney Style Reference、适配的参考图方法</td></tr><tr><td>主体</td><td>在新场景中保持人物或产品特征</td><td>Midjourney 编辑参考、IP-Adapter 等</td></tr><tr><td>修改已有图片</td><td>保留大体画面，改变服装或环境</td><td>图生图、图像编辑</td></tr></tbody></table>\n<p><strong>风格相似与人物相同是不同目标。</strong> Midjourney 明确说明 Style Reference 主要传递整体视觉风格，不负责复制参考图中的人物或物体。SD 生态中的 IP-Adapter 则提供以图片配合文字引导生成的方式，并能调整参考图的影响强度。<a href=\"https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference\" target=\"_blank\" rel=\"noopener noreferrer\">Style Reference</a>、<a href=\"https://huggingface.co/docs/diffusers/using-diffusers/ip_adapter\" target=\"_blank\" rel=\"noopener noreferrer\">IP-Adapter 操作指南</a></p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-5",
          "title": "3. 图生图：在已有画面上控制变化程度",
          "html": "<p>图生图适合把草图进一步完成、改变表现形式，或在已有图片基础上生成变体。</p>\n<p>一个重要操作是调整 <strong>重绘强度</strong>，不同工具中可能叫 <code>strength</code> 或 <code>denoise</code>：</p>\n<ul><li>较低时，通常保留更多原图结构。</li><li>较高时，通常允许更大变化。</li><li>变化过小，目标修改可能没有发生；变化过大，满意的部分也可能被改掉。</li></ul>\n<p>可以固定其他设置，只比较不同强度下的结果，观察“保留原图”和“完成修改”的取舍。<a href=\"https://huggingface.co/docs/diffusers/using-diffusers/img2img\" target=\"_blank\" rel=\"noopener noreferrer\">Diffusers 图生图指南</a></p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-6",
          "title": "4. 局部重绘与扩图：限定修改发生的位置",
          "html": "<p>局部重绘先用蒙版指定区域，再描述该区域应该出现什么。例如，替换一顶帽子、清理背景杂物、修改某个物体。</p>\n<p>实操重点包括：</p>\n<ul><li>蒙版范围是否覆盖了完整对象和需要衔接的边缘。</li><li>是否给模型保留了足够的周围环境作为参考。</li><li>新内容的透视、光线、颜色是否与周围一致。</li><li>修改后有没有影响原本需要保留的部分。</li></ul>\n<p>扩图则用于在原画面外补充内容，例如把方形插画扩成横版封面。<a href=\"https://huggingface.co/docs/diffusers/using-diffusers/inpaint\" target=\"_blank\" rel=\"noopener noreferrer\">局部重绘指南</a>、<a href=\"https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model\" target=\"_blank\" rel=\"noopener noreferrer\">Midjourney 编辑说明</a></p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-7",
          "title": "5. ControlNet：用姿态、线条和深度控制画面结构",
          "html": "<p>当要求涉及明确的位置、动作和空间关系时，可以把这些条件直接作为控制图提供。</p>\n<table class=\"d-table\"><thead><tr><th>控制条件</th><th>实际用途</th></tr></thead><tbody><tr><td>边缘、线稿</td><td>保留建筑轮廓、物体边界或草图结构</td></tr><tr><td>人体姿态</td><td>指定站姿、坐姿、手臂和身体的大体动作</td></tr><tr><td>深度</td><td>指定远近、空间层次与物体的大体体积关系</td></tr></tbody></table>\n<p>常见流程是：<strong>准备参考图 → 提取所需控制图 → 检查控制图 → 加载匹配的控制模型 → 调整控制强度 → 生成并比较。</strong></p>\n<p>控制图本身值得先检查：姿态识别错误，后续生成就可能受到错误约束。ComfyUI 的示例也明确说明，普通照片需要通过相应预处理转换成控制模型要求的输入格式。<a href=\"https://comfyanonymous.github.io/ComfyUI_examples/controlnet/\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI ControlNet 示例</a>、<a href=\"https://huggingface.co/docs/diffusers/using-diffusers/controlnet\" target=\"_blank\" rel=\"noopener noreferrer\">Diffusers ControlNet 指南</a></p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-8",
          "title": "6. LoRA：为特定风格、人物或概念增加定制能力",
          "html": "<p>使用现成 LoRA 时，主要需要确认：</p>\n<ul><li>与哪个基础模型配套。</li><li>是否需要特定触发词。</li><li>推荐怎样设置影响强度。</li><li>加载后，对主体、风格和其他画面内容分别产生了什么影响。</li></ul>\n<p>可以先比较“未加载”和“加载一个 LoRA”的结果，再调整强度。训练自己的 LoRA 是进一步的定制工作，需要准备合适的训练图片和描述，并检查它在不同场景中的表现。<a href=\"https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters#lora\" target=\"_blank\" rel=\"noopener noreferrer\">Diffusers LoRA 使用说明</a>、<a href=\"https://comfyanonymous.github.io/ComfyUI_examples/lora/\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI LoRA 示例</a></p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-9",
          "title": "7. 参数调整：学会做对比，而不是背固定数值",
          "html": "<p>在 SD 的常见操作界面中，下面几项最值得掌握：</p>\n<table class=\"d-table\"><thead><tr><th>参数</th><th>操作上主要影响什么</th></tr></thead><tbody><tr><td>模型与版本</td><td>能生成的内容、风格和配套组件</td></tr><tr><td>宽高与比例</td><td>构图及最终可用尺寸</td></tr><tr><td>Seed 随机种子</td><td>控制随机起点，便于比较设置</td></tr><tr><td>Steps 步数</td><td>生成耗时和结果表现，需要按模型选择</td></tr><tr><td>CFG／引导强度</td><td>文字条件的影响程度，过高也可能损害结果</td></tr><tr><td>Sampler／Scheduler</td><td>生成方式的具体设置，影响速度和输出表现</td></tr><tr><td>Denoise／重绘强度</td><td>在图生图中改变原图的程度</td></tr></tbody></table>\n<p>这些参数应从模型或工作流的推荐设置开始调整。固定其他条件、一次比较少量变量，更容易判断变化原因；AUTOMATIC1111 的 X/Y/Z Plot 就是为这种参数对比提供的工具。<a href=\"https://docs.comfy.org/built-in-nodes/sampling/ksampler\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI 参数说明</a>、<a href=\"https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features#xyz-plot\" target=\"_blank\" rel=\"noopener noreferrer\">X/Y/Z 参数对比</a></p>\n<p>Seed 也不能单独保证跨模型、跨软件版本和跨设备得到完全相同的图，需要同时记录模型、参数和运行环境。<a href=\"https://huggingface.co/docs/diffusers/using-diffusers/reusing_seeds\" target=\"_blank\" rel=\"noopener noreferrer\">Diffusers 复现指南</a></p>",
          "headings": []
        },
        {
          "id": "course-image-generation-section-10",
          "title": "8. 放大与保存工作流：让结果能够继续使用",
          "html": "<p>图片选定后，可以使用放大模型增加输出尺寸，再检查文字、五官、材质和边缘有没有发生不合要求的变化。ComfyUI 提供了加载 ESRGAN 等放大模型的完整示例；相关技术的一手资料还包括 <a href=\"https://github.com/xinntao/Real-ESRGAN\" target=\"_blank\" rel=\"noopener noreferrer\">Real-ESRGAN 原作者项目</a>。<a href=\"https://comfyanonymous.github.io/ComfyUI_examples/upscale_models/\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI 放大示例</a></p>\n<p>保存成果时，除最终图片，还应保留模型名称、提示词、参考图、参数和工作流。这样以后要换尺寸、调整风格或继续制作同一套作品时，才能从已有成果接着做。</p>\n<p>以“同一个角色的三张场景插画”为例，就会同时用到：参考图保持主体特征、姿态控制安排动作、风格参考或 LoRA 保持视觉表现、局部重绘修正问题，以及工作流记录。<strong>实操的熟练程度，主要体现在能否为具体偏差选择合适的控制方法，并判断修改是否成功。</strong></p>",
          "headings": []
        }
      ]
    }
  },
  "image-photoshop-agent": {
    "source": "docs/IMAGE_CREATION_CURRICULUM.md",
    "sourceHash": "cdd3b15fa5c2c1e6fd0d13ee333cd948e15caf3a656fa7f08dc432006625ad19",
    "language": "zh-Hans",
    "introduction": {
      "id": "course-image-photoshop-agent-introduction",
      "title": "阅读说明",
      "html": "<p>本章面向已经会用自然语言描述需求的用户，目标是完成接入，让 Agent 直接操作 Photoshop。接通后，可以在对话中要求它检查图片、整理图层、修改文字、调整画面和导出文件，再根据结果继续提出修改意见。主要需要掌握的是接入与使用方法。</p>"
    },
    "chapter": {
      "id": "course-image-photoshop-agent",
      "title": "第二章 使用 Agent 辅助操作 Photoshop",
      "sections": [
        {
          "id": "course-image-photoshop-agent-section-1",
          "title": "选择接入方式",
          "html": "<p>有 Photoshop 内置助手和外部 Agent 两条路线：</p>\n<ul><li><strong>Photoshop 官方 AI Assistant</strong>：在 Photoshop 内直接输入要求，无需自行搭建 MCP。核对时，Adobe 仍将桌面端功能标为 Photoshop（Beta）早期测试功能。可在 Creative Cloud 中安装 Photoshop（Beta），打开图片后，点击应用右上角的 AI Assistant 图标进入对话；具体开放情况以当前版本与账户中的入口为准。<a href=\"https://helpx.adobe.com/photoshop/desktop/whats-new/ai-assistant-overview.html\" target=\"_blank\" rel=\"noopener noreferrer\">官方介绍与入口说明</a></li><li><strong>外部 Agent + MCP</strong>：在支持本地 MCP 工具调用的 AI 客户端中对话，由连接程序把操作传给 Photoshop。这里的 MCP 可以理解为让 Agent 调用 Photoshop 工具的接口。外部接入可选择下面任意一个项目。</li></ul>\n<table class=\"d-table\"><thead><tr><th>项目</th><th>控制方式</th><th>项目说明中的能力</th></tr></thead><tbody><tr><td><a href=\"https://github.com/drmedia/photoshop-mcp\" target=\"_blank\" rel=\"noopener noreferrer\">drmedia/photoshop-mcp</a></td><td>Photoshop UXP 插件桥接</td><td>文档、图层、选区、截图、保存与导出等操作</td></tr><tr><td><a href=\"https://github.com/airtaxi/PhotoshopMcpServer\" target=\"_blank\" rel=\"noopener noreferrer\">airtaxi/PhotoshopMcpServer</a></td><td>Windows COM 自动化</td><td>向支持 MCP 的 Agent 暴露 Photoshop 自动化操作，包括文档与图层信息、导出，以及执行 Photoshop 脚本</td></tr></tbody></table>\n<p>下面给出 Windows 接入步骤。两套外部方案选一套即可；它们都是第三方项目，版本要求与操作范围分别以各自说明为准。</p>",
          "headings": []
        },
        {
          "id": "course-image-photoshop-agent-section-2",
          "title": "接入方案 A：drmedia/photoshop-mcp（UXP 插件）",
          "html": "<p><strong>1. 准备运行环境</strong></p>\n<p>需要 Git、Node.js 22.12 或以上、Photoshop，以及 Adobe UXP Developer Tool。项目声明 Photoshop 最低版本为 25.0，作者记录的实际验证版本为 27.8；macOS 尚缺少完整验证，本节按 Windows 编写。<a href=\"https://github.com/drmedia/photoshop-mcp/blob/main/README_KO.md#필요한-것\" target=\"_blank\" rel=\"noopener noreferrer\">项目环境要求</a></p>\n<p>UXP Developer Tool 可通过 Creative Cloud 安装，首次启动时按提示启用 Developer Mode，允许加载开发中的插件。<a href=\"https://developer.adobe.com/photoshop/uxp/2022/guides/devtool/installation\" target=\"_blank\" rel=\"noopener noreferrer\">Adobe 安装说明</a></p>\n<p><strong>2. 下载并构建项目</strong></p>\n<p>以下使用 <code>C:/AI/Tools</code> 作为示例安装目录。在 PowerShell 中依次执行：</p>\n<pre><code class=\"language-powershell\">New-Item -ItemType Directory -Path C:/AI/Tools -Force\nSet-Location C:/AI/Tools\ngit clone https://github.com/drmedia/photoshop-mcp.git\nSet-Location C:/AI/Tools/photoshop-mcp\nnpm install\nnpm run build</code></pre>\n<p>构建会生成服务器与插件需要的文件。该项目核对时尚未发布到 npm，应按源码方式安装。<a href=\"https://github.com/drmedia/photoshop-mcp#quick-start\" target=\"_blank\" rel=\"noopener noreferrer\">构建说明</a>、<a href=\"https://github.com/drmedia/photoshop-mcp/blob/main/README_KO.md\" target=\"_blank\" rel=\"noopener noreferrer\">发布状态说明</a></p>\n<p><strong>3. 把插件加载进 Photoshop</strong></p>\n<ol><li>启动 Photoshop 和 UXP Developer Tool。</li><li>在 Developer Tool 中选择 <strong>Add Plugin</strong>，找到 <code>C:/AI/Tools/photoshop-mcp/photoshop-uxp/manifest.json</code>。</li><li>点击 <strong>Load</strong>，再在 Photoshop 的“插件 / Plugins”菜单中打开 <strong>Photoshop MCP</strong> 面板。</li></ol>\n<p>保留 Photoshop 与插件面板，接着配置 AI 客户端。<a href=\"https://github.com/drmedia/photoshop-mcp/blob/main/photoshop-uxp/README.md#설치\" target=\"_blank\" rel=\"noopener noreferrer\">插件加载说明</a></p>\n<p><strong>4. 在 Agent 客户端中添加 MCP 服务器</strong></p>\n<p>客户端必须支持启动本地 <strong>stdio MCP 服务器</strong>。以下以 Claude Desktop 的配置方式举例：打开 <code>%APPDATA%\\Claude\\claude_desktop_config.json</code>，把下面的服务器条目加入配置；已有其他服务器时，将其合并进现有 <code>mcpServers</code> 对象。</p>\n<pre><code class=\"language-json\">{\n  &quot;mcpServers&quot;: {\n    &quot;photoshop-uxp&quot;: {\n      &quot;command&quot;: &quot;node&quot;,\n      &quot;args&quot;: [\n        &quot;C:/AI/Tools/photoshop-mcp/packages/mcp-server/bin/photoshop-mcp.js&quot;\n      ],\n      &quot;env&quot;: {\n        &quot;PHOTOSHOP_MCP_BRIDGE&quot;: &quot;uxp&quot;,\n        &quot;PHOTOSHOP_MCP_PROFILE&quot;: &quot;full&quot;,\n        &quot;PHOTOSHOP_MCP_ALLOW&quot;: &quot;read,edit,external&quot;,\n        &quot;PHOTOSHOP_MCP_EXTENSIONS_ENABLED&quot;: &quot;none&quot;\n      }\n    }\n  }\n}</code></pre>\n<p>将安装路径换成自己的实际路径，保存后重启客户端。服务器由客户端按配置启动，无需再手工运行一个 <code>npm start</code> 实例。</p>\n<p>这些设置分别表示：连接真实的 UXP 插件、显示完整 Photoshop 工具、允许读取与编辑以及另存/导出文件、关闭本章用不到的扩展。项目默认只允许 <code>read,edit</code>，所以这里加入了保存与导出需要的 <code>external</code>；覆盖原文件等操作属于另一权限级别，不包含在此示例中。<a href=\"https://github.com/drmedia/photoshop-mcp/blob/main/.mcp.json\" target=\"_blank\" rel=\"noopener noreferrer\">项目启动配置</a>、<a href=\"https://github.com/drmedia/photoshop-mcp#configuration\" target=\"_blank\" rel=\"noopener noreferrer\">环境变量与权限说明</a>、<a href=\"https://github.com/airtaxi/PhotoshopMcpServer#claude-desktop\" target=\"_blank\" rel=\"noopener noreferrer\">Claude Desktop 配置位置示例</a></p>\n<p>使用其他 Agent 时，填写相同的启动命令、参数和环境变量，但采用该客户端自己的配置格式。例如 VS Code 可通过命令面板运行 <strong>MCP: Add Server → Command (stdio)</strong> 添加；不同客户端的顶层字段可能是 <code>mcpServers</code> 或 <code>servers</code>，不能直接混用。<a href=\"https://code.visualstudio.com/docs/agent-customization/mcp-servers\" target=\"_blank\" rel=\"noopener noreferrer\">VS Code 官方接入说明</a></p>\n<p><strong>5. 连接插件，并选择输出目录</strong></p>\n<p>回到 Photoshop MCP 面板，点击 <strong>Connect</strong>。<strong>插件加载成功后，默认仍不会主动连接</strong>，所以这一步需要单独执行。正常连接后，面板会显示桥接状态与端口；默认会在本机 8765–8774 端口中寻找服务器，通常无需手填端口。<a href=\"https://github.com/drmedia/photoshop-mcp/blob/main/photoshop-uxp/README.md#설치\" target=\"_blank\" rel=\"noopener noreferrer\">连接行为说明</a></p>\n<p>如需保存或导出，在该面板中由用户选择并授权一个输出文件夹。Agent 随后提供文件名，例如 <code>poster-v1.psd</code>，文件会写入这个文件夹；此项目不接受由 Agent 任意指定完整输出路径。<a href=\"https://github.com/drmedia/photoshop-mcp/blob/main/README_KO.md#파일-저장\" target=\"_blank\" rel=\"noopener noreferrer\">输出文件夹与保存规则</a></p>",
          "headings": []
        },
        {
          "id": "course-image-photoshop-agent-section-3",
          "title": "接入方案 B：airtaxi/PhotoshopMcpServer（Windows COM）",
          "html": "<p>这条路线通过 Windows COM 调用 Photoshop，无需加载上述 UXP 插件。需要 Windows、支持 COM 自动化和 <code>DoJavaScript</code> 的 Photoshop，以及 .NET 10 SDK 或以上。具体安装与客户端配置见<a href=\"https://github.com/airtaxi/PhotoshopMcpServer#requirements\" target=\"_blank\" rel=\"noopener noreferrer\">项目说明</a>。</p>\n<p><strong>1. 下载并生成可执行文件</strong></p>\n<p>在 PowerShell 中执行：</p>\n<pre><code class=\"language-powershell\">New-Item -ItemType Directory -Path C:/AI/Tools -Force\nSet-Location C:/AI/Tools\ngit clone https://github.com/airtaxi/PhotoshopMcpServer.git\nSet-Location C:/AI/Tools/PhotoshopMcpServer\ndotnet publish PhotoshopMcpServer/PhotoshopMcpServer.csproj -c Release -r win-x64 --self-contained</code></pre>\n<p>发布过程会构建项目。按照项目当前目录与目标框架，可执行文件位于下方配置所示位置。<a href=\"https://github.com/airtaxi/PhotoshopMcpServer#installation\" target=\"_blank\" rel=\"noopener noreferrer\">发布步骤</a>、<a href=\"https://github.com/airtaxi/PhotoshopMcpServer/blob/master/PhotoshopMcpServer/PhotoshopMcpServer.csproj\" target=\"_blank\" rel=\"noopener noreferrer\">项目目标框架</a></p>\n<p><strong>2. 配置客户端并连接</strong></p>\n<p>同样以 Claude Desktop 为例，把服务器条目加入其配置：</p>\n<pre><code class=\"language-json\">{\n  &quot;mcpServers&quot;: {\n    &quot;photoshop-com&quot;: {\n      &quot;command&quot;: &quot;C:/AI/Tools/PhotoshopMcpServer/PhotoshopMcpServer/bin/Release/net10.0-windows/win-x64/publish/PhotoshopMcpServer.exe&quot;\n    }\n  }\n}</code></pre>\n<p>换成自己的实际路径，保存并重启客户端，然后打开 Photoshop。其他 Agent 使用相同可执行文件作为本地 stdio 服务器的启动命令即可。<a href=\"https://github.com/airtaxi/PhotoshopMcpServer#option-b-run-published-executable\" target=\"_blank\" rel=\"noopener noreferrer\">可执行文件接入示例</a></p>\n<p>此项目既提供读取文档、查询图层和导出的工具，也允许 Agent 编写并执行 Photoshop JavaScript。日常使用时直接描述任务即可；用户无需先自行编写脚本。<a href=\"https://github.com/airtaxi/PhotoshopMcpServer#available-tools\" target=\"_blank\" rel=\"noopener noreferrer\">工具清单</a></p>",
          "headings": []
        },
        {
          "id": "course-image-photoshop-agent-section-4",
          "title": "确认接入成功",
          "html": "<p>在 Photoshop 中打开一张测试图片，在 Agent 客户端启用对应 MCP 工具，然后输入：</p>\n<blockquote class=\"quote\"><p>请实际调用 Photoshop 工具，读取当前文档名称、宽高和图层名称。只查询，先不要修改。</p></blockquote>\n<p>检查返回信息是否与 Photoshop 中的文档一致，并确认客户端出现了实际的工具调用记录。UXP 方案可以调用文档与图层查询工具；COM 方案可使用 <code>GetActiveDocumentInfo</code> 和 <code>GetLayerInfo</code>。仅显示服务器配置，或聊天中回复“已连接”，还不足以证明 Photoshop 已经接通。<a href=\"https://github.com/drmedia/photoshop-mcp/blob/main/docs/CORE_API.md\" target=\"_blank\" rel=\"noopener noreferrer\">UXP 工具参考</a>、<a href=\"https://github.com/airtaxi/PhotoshopMcpServer#available-tools\" target=\"_blank\" rel=\"noopener noreferrer\">COM 工具参考</a></p>\n<p>随后可做一次小修改验证：</p>\n<blockquote class=\"quote\"><p>在当前文档最上方新建一个空白图层，命名为“连接测试”，完成后重新查询图层，告诉我它的名称与位置。</p></blockquote>\n<p>最后测试一次另存与导出，确认指定目录中确实出现文件。使用 UXP 方案时，可输入：</p>\n<blockquote class=\"quote\"><p>将当前文档另存为 connect-test-v1.psd，保留图层，再导出 connect-test-v1.png。保存到我在 Photoshop MCP 面板中选定的文件夹，告诉我各文件的保存结果。</p></blockquote>\n<p>以上三步分别验证读取、编辑和文件输出。完成后即可进入日常对话操作。</p>",
          "headings": []
        },
        {
          "id": "course-image-photoshop-agent-section-5",
          "title": "接入后怎样下达任务",
          "html": "<p>已经会写提示词的用户，可以直接按“对象、修改要求、保留内容、交付结果”描述任务。例如：</p>\n<blockquote class=\"quote\"><p>把当前海报中名为“标题”的文字图层改成“秋季新品”，保留原字体、字号和位置。将结果另存为 poster-v1.psd，并导出 poster-v1.png。</p></blockquote>\n<p>看到结果后继续说“标题改成两行”“整体再亮一点”“只调整背景”即可。遇到对象不明确的图片，可以先要求 Agent 查询图层；使用 UXP 方案时，还可以要求它返回当前画面截图，再据此修改。</p>\n<p>接入后的可操作范围取决于所选工具。例如，读取和调整图层、置入已有背景，与调用生成式填充是不同功能；是否能够生成新背景、使用某项新 AI 功能，应查看工具清单并实际验证。</p>",
          "headings": []
        },
        {
          "id": "course-image-photoshop-agent-section-6",
          "title": "常见接入问题",
          "html": "<table class=\"d-table\"><thead><tr><th>现象</th><th>优先检查</th></tr></thead><tbody><tr><td>客户端启动服务器失败，工具列表为空</td><td>检查安装目录、构建产物和配置格式；UXP 方案确认 Node 可被客户端找到，安装运行环境后重启客户端</td></tr><tr><td>UXP 返回 <code>PHOTOSHOP_NOT_CONNECTED</code></td><td>确认 Photoshop 已打开、插件已 Load，并在面板中点击 Connect；确认客户端启动的是真实 <code>uxp</code> 桥接模式</td></tr><tr><td>能查询、能修改，但无法保存或导出</td><td>UXP 方案检查 <code>external</code> 权限与面板输出文件夹；同名文件已存在时换用新文件名</td></tr><tr><td>COM 服务器已启动，但 Photoshop 操作失败</td><td>先调用 <code>IsPhotoshopRunning</code>、<code>GetPhotoshopVersion</code>，核对本机版本是否支持项目要求的 COM 接口</td></tr><tr><td>某项功能没有工具或调用失败</td><td>让 Agent 查看实际工具列表与错误信息；UXP 方案可调用 <code>photoshop.diagnostics</code>，按诊断结果处理</td></tr></tbody></table>\n<p>资料与配置于 <strong>2026 年 10 月 31 日</strong>依据 Adobe、客户端官方文档及两个项目的源码说明核对；本节尚未在本机 Photoshop 中完成安装和操作验收。</p>",
          "headings": []
        }
      ]
    }
  },
  "image-workflow-reuse": {
    "source": "docs/IMAGE_CREATION_CURRICULUM.md",
    "sourceHash": "cdd3b15fa5c2c1e6fd0d13ee333cd948e15caf3a656fa7f08dc432006625ad19",
    "language": "zh-Hans",
    "introduction": {
      "id": "course-image-workflow-reuse-introduction",
      "title": "阅读说明",
      "html": "<p>本章围绕人物一致性、商品图、局部修改和图片放大，选取已有完整流程、配套说明与公开示例的方案。它们可作为复用起点，具体效果仍取决于输入素材与运行条件。本次于 2026 年 10 月 31 日核对资料和原始工作流配置，尚未进行本机图像生成验收。</p>\n<p><strong>工作流资源入口</strong></p>\n<table class=\"d-table\"><thead><tr><th>来源</th><th>提供什么</th><th>适合怎样使用</th></tr></thead><tbody><tr><td><a href=\"https://docs.comfy.org/interface/features/template\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI 官方模板</a></td><td>可加载的工作流、模型链接和运行说明</td><td>从模板开始，补齐模型后运行</td></tr><tr><td><a href=\"https://comfy.org/hub/workflows/\" target=\"_blank\" rel=\"noopener noreferrer\">Comfy 官方工作流目录</a></td><td>按商品图、光线、人物多角度、局部修改和放大等任务整理的流程</td><td>按目标任务查找候选</td></tr><tr><td><a href=\"https://comfyanonymous.github.io/ComfyUI_examples/\" target=\"_blank\" rel=\"noopener noreferrer\">ComfyUI 维护者示例库</a></td><td>SDXL、图生图、局部重绘、LoRA、ControlNet 和放大等示例</td><td>下载含工作流信息的原始图片并载入</td></tr><tr><td><a href=\"https://www.runcomfy.com/comfyui-workflows\" target=\"_blank\" rel=\"noopener noreferrer\">RunComfy 工作流库</a></td><td>案例说明、工作流 JSON 和平台预配置环境</td><td>在云端跟做，或按依赖说明在本地复用</td></tr></tbody></table>\n<p><strong>四类任务的选择对照</strong></p>\n<table class=\"d-table\"><thead><tr><th>任务</th><th>选用的现成流程</th><th>主要输入与条件</th></tr></thead><tbody><tr><td>人物一致性</td><td>IP-Adapter FaceID Plus v2 作者示例</td><td>清楚的人脸参考图；匹配的 SD 基础模型、FaceID、LoRA、视觉编码器与 InsightFace；研究用途</td></tr><tr><td>商品图</td><td>RunComfy Product Relighting；另附 IC-Light 本地基础示例</td><td>清晰产品图；可选背景和光照蒙版；完整流程与基础示例各用自己的配套组件</td></tr><tr><td>局部修改</td><td>ComfyUI 官方 Inpainting 示例</td><td>原图与修改蒙版；示例指定的专用重绘模型；原生节点</td></tr><tr><td>图片放大</td><td>ComfyUI 官方模型放大流程，配合 ESRGAN 或 Real-ESRGAN</td><td>原图与放大模型；基础流程无需 SD checkpoint、提示词或种子</td></tr></tbody></table>"
    },
    "chapter": {
      "id": "course-image-workflow-reuse",
      "title": "第三章 寻找与复用现成工作流",
      "sections": [
        {
          "id": "course-image-workflow-reuse-section-1",
          "title": "人物一致性案例 IP-Adapter FaceID Plus v2",
          "html": "<p><strong>适用条件与边界</strong></p>\n<p>适合用一张人脸参考图练习同一人物在不同场景中的面部特征保持。输入先选清楚、无遮挡、脸部居中的单人图；这套流程主要约束脸部身份，不同时保证服装、体型、动作和场景一致。模型作者也说明身份一致性并不完美。</p>\n<p>FaceID 模型卡明确限定研究用途，不应把这一案例作为可直接商用的人像方案。配套插件作者已将项目置于维护模式，复用时应记录能跑通的 ComfyUI 与插件版本，保留对应文件。<a href=\"https://huggingface.co/h94/IP-Adapter-FaceID\" target=\"_blank\" rel=\"noopener noreferrer\">用途与能力说明</a>、<a href=\"https://github.com/cubiq/ComfyUI_IPAdapter_plus\" target=\"_blank\" rel=\"noopener noreferrer\">插件安装与维护说明</a></p>\n<p><strong>资料与流程文件</strong></p>\n<ul><li><a href=\"https://raw.githubusercontent.com/cubiq/ComfyUI_IPAdapter_plus/main/examples/ipadapter_faceid.json\" target=\"_blank\" rel=\"noopener noreferrer\">作者的 FaceID 工作流 JSON</a>：保存为 JSON 后载入 ComfyUI。核对时该文件使用 SD 1.5 系列的 Realistic Vision V5.1 checkpoint，加载器选择 FACEID PLUS V2，输出起始尺寸为 512 × 512。</li><li><a href=\"https://huggingface.co/h94/IP-Adapter-FaceID/tree/main\" target=\"_blank\" rel=\"noopener noreferrer\">模型文件与使用说明</a>：SD 1.5 版与 SDXL 版分开，需选择同一模型家族的配套文件。</li><li><a href=\"https://www.runcomfy.com/comfyui-workflows/create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus\" target=\"_blank\" rel=\"noopener noreferrer\">RunComfy 人物一致性教程</a>：补充参考图准备、使用界面与效果示例；平台流程与作者 JSON 分别按各自说明使用。</li></ul>\n<p><strong>复用步骤</strong></p>\n<ol><li>下载作者 JSON 并载入。按插件 README 安装 ComfyUI_IPAdapter_plus，并在同一 ComfyUI 的 Python 环境安装 InsightFace。</li><li>准备 JSON 所用的 checkpoint。SD 1.5 分支使用 <code>ip-adapter-faceid-plusv2_sd15.bin</code>、配对的 <code>ip-adapter-faceid-plusv2_sd15_lora.safetensors</code> 与 README 指定的 ViT-H 视觉编码器。分别放入 <code>models/ipadapter</code>、<code>models/loras</code>、<code>models/clip_vision</code>；checkpoint 放入 <code>models/checkpoints</code>。InsightFace 的配套人脸模型按插件说明准备。</li><li>在 Load Image 选择自己的参考图，替换作者文件中的示例图片名；在 Checkpoint Loader 重新选择本机模型。统一加载器依赖文件命名，按 README 保留所需名称。</li><li>保留 FACEID PLUS V2 与其余起始配置，输入一个简单的新场景描述，先生成单张图片。确认参考图中的人脸被正常识别。</li><li>固定参考图、模型和其他设置，再改变场景或表现形式。面貌偏离时逐项比较参考图裁切、FaceID 影响强度与提示词，保存每次对比。</li><li>逐张检查五官、脸型、年龄感及侧面表现。服装或姿态有额外要求时，另行增加相应控制；不要把仅保持面部特征写成整个人物完全一致。</li></ol>",
          "headings": []
        },
        {
          "id": "course-image-workflow-reuse-section-2",
          "title": "商品图案例 产品重新布光与背景协调",
          "html": "<p><strong>适用条件与边界</strong></p>\n<p>适合已有产品照片，希望更换展示环境或调整照明的任务。完整案例选用 Andrea Baioni 的 Product Relighting，RunComfy 页面提供 JSON 下载入口、图示和作者视频。必需输入为清晰主体图，背景和光照蒙版可以选填；这些条件及下述开关来自<a href=\"https://www.runcomfy.com/comfyui-workflows/comfyui-product-relighting-workflow\" target=\"_blank\" rel=\"noopener noreferrer\">案例操作说明</a>。</p>\n<p>这类流程会重新生成或协调图像，输出应与原产品逐项比较外形、颜色、包装文字、标识和小零件。需要保持准确的标识或文字，可在后续精修时使用原素材恢复。</p>\n<p><strong>资料与流程文件</strong></p>\n<ul><li><a href=\"https://www.runcomfy.com/comfyui-workflows/comfyui-product-relighting-workflow\" target=\"_blank\" rel=\"noopener noreferrer\">Product Relighting 完整案例与工作流 JSON 下载入口</a>。</li><li><a href=\"https://www.youtube.com/watch?v=GsJaqesboTo\" target=\"_blank\" rel=\"noopener noreferrer\">作者配套视频</a>：从案例页链接进入的操作演示。</li><li><a href=\"https://github.com/lllyasviel/IC-Light\" target=\"_blank\" rel=\"noopener noreferrer\">IC-Light 原作者说明</a>：核对重新布光模型、输入条件与相关组件要求。</li><li><a href=\"https://github.com/kijai/ComfyUI-IC-Light\" target=\"_blank\" rel=\"noopener noreferrer\">IC-Light 的 ComfyUI 节点说明</a>及<a href=\"https://raw.githubusercontent.com/kijai/ComfyUI-IC-Light/main/example_workflows/ic_light_example_02.png\" target=\"_blank\" rel=\"noopener noreferrer\">本地基础工作流原始 PNG</a>：供单独练习基础重新布光。它是另一套流程，不替代完整商品图流程。</li></ul>\n<p><strong>完整商品图流程的复用步骤</strong></p>\n<ol><li>在案例页下载 Workflow.json，或打开平台预配置环境。本地导入时，按该 JSON 的节点与模型清单补齐依赖；平台预配置环境不等于本机已经具备同样组件。</li><li>在 Input Images 组上传 Subject Image。需要指定背景时上传 Background，并打开 Background Switch；需要光照蒙版时上传 Light Mask，并打开 Light Mask Switch。没有上传时保留相应关闭状态。</li><li>在 Input Prompts 填写简洁的产品描述与光线描述，例如产品材质、颜色，以及柔和侧光或冷色轮廓光。先保留其余设置，生成一版。</li><li>对照原产品检查两种输出：Color Matched Result 与 Relit Result。它们分别便于观察颜色协调和重新布光后的表现。</li><li>需要调整背景变化幅度时，比较 Denoise 设置；需要调整明暗时，再按案例的结果组说明修改。每次只改变少量设置。</li><li>保存所选结果、输入素材和流程配置，再进入 Photoshop 检查或修复产品细节。</li></ol>\n<p><strong>本地基础示例的运行条件</strong></p>\n<p>Kijai 的原始 PNG 内保存了 SD 1.5 分支的 <code>photon_v1.safetensors</code>、<code>iclight_sd15_fc.safetensors</code> 及 ImageResizeKJ 等节点配置。载入后需准备相应 checkpoint、ComfyUI-IC-Light 和所需 KJNodes；IC-Light 模型依节点说明放入 <code>models/unet</code> 下相应目录，再在加载节点中选择。替换示例输入图，在文本输入中描述主体和照明，先按原有约 512 像素配置练习；改用其他 checkpoint 应另作效果比较。</p>\n<p>IC-Light 原作者还特别指出，原始演示中的 BRIA RMBG 1.4 限非商业使用；如工作流使用了抠图模型，商品用途应检查该组件的条件，不能仅凭 IC-Light 主项目的代码许可判断整条流程。</p>",
          "headings": []
        },
        {
          "id": "course-image-workflow-reuse-section-3",
          "title": "局部修改案例 ComfyUI 官方 Inpainting",
          "html": "<p><strong>适用条件与边界</strong></p>\n<p>适合整体画面已满意，只修改帽子、衣服纹理或背景杂物等局部区域。需要原图和标明修改区域的蒙版。基础练习采用官方指定的 <code>512-inpainting-ema.safetensors</code>，先使用约 512 像素输入跑通，暂不加入第三方节点。</p>\n<p>原始流程文件名虽然包含 sd1.5，加载节点实际指定上述专用重绘文件；应以节点与模型要求为准，不能仅凭示例图片文件名判断模型版本。</p>\n<p><strong>资料与流程文件</strong></p>\n<ul><li><a href=\"https://docs.comfy.org/zh/tutorials/basic/inpaint\" target=\"_blank\" rel=\"noopener noreferrer\">官方中文局部重绘教程</a>：包含模型、输入图片、蒙版编辑与运行说明。</li><li><a href=\"https://raw.githubusercontent.com/Comfy-Org/example_workflows/refs/heads/main/image/basic/sd1.5_inpaint.png\" target=\"_blank\" rel=\"noopener noreferrer\">可拖入 ComfyUI 的原始工作流 PNG</a>。</li><li><a href=\"https://huggingface.co/Comfy-Org/stable-diffusion-2.1/blob/main/512-inpainting-ema.safetensors\" target=\"_blank\" rel=\"noopener noreferrer\">官方教程链接的模型文件页</a>。</li><li><a href=\"https://comfyanonymous.github.io/ComfyUI_examples/inpaint/\" target=\"_blank\" rel=\"noopener noreferrer\">维护者的局部重绘与扩图示例</a>。</li></ul>\n<p><strong>复用步骤</strong></p>\n<ol><li>下载原始 PNG，拖入 ComfyUI 或用 Workflow → Open 载入。使用原文件，避免截图或图片压缩后丢失流程信息。</li><li>下载指定模型，放入 <code>ComfyUI/models/checkpoints</code>，在 Load Checkpoint 中选择它。先保留模板的采样设置。</li><li>在 Load Image 上传官方配套输入图，先运行一次带已有透明蒙版的示例。</li><li>换成自己的原图，右击 Load Image 中的图片，打开 Open in MaskEditor，覆盖需要修改的对象及衔接边缘，并保存蒙版。</li><li>输入对目标内容的描述，例如把帽子换成红色针织帽。检查图像和蒙版均连接到 VAE Encode (for Inpainting)，再执行生成。</li><li>比较修改区域、边缘与周围画面。出现接缝时先调整蒙版范围；要求不变的区域也应与原图比较，必要时在 Photoshop 用蒙版将修改结果合回原图。</li><li>保存原图、蒙版、提示词及工作流。更换为 SDXL 或其他重绘模型时，使用相应配套流程重新确认参数。</li></ol>",
          "headings": []
        },
        {
          "id": "course-image-workflow-reuse-section-4",
          "title": "图片放大案例 ESRGAN 与 Real-ESRGAN 模型放大",
          "html": "<p><strong>适用条件与边界</strong></p>\n<p>适合构图已确定、需要增加像素尺寸的照片或插画。采用 ComfyUI 原生的模型放大流程，无需额外 SD checkpoint、提示词、LoRA 或随机种子。放大结果仍需检查文字、轮廓、五官和纹理；增加像素不能保证恢复原图中不存在的真实细节。</p>\n<p><strong>资料与流程文件</strong></p>\n<ul><li><a href=\"https://docs.comfy.org/zh/tutorials/basic/upscale\" target=\"_blank\" rel=\"noopener noreferrer\">官方中文放大教程</a>及<a href=\"https://raw.githubusercontent.com/Comfy-Org/example_workflows/refs/heads/main/image/basic/upscale_workflow.png\" target=\"_blank\" rel=\"noopener noreferrer\">基础工作流原始 PNG</a>。</li><li><a href=\"https://comfyanonymous.github.io/ComfyUI_examples/upscale_models/\" target=\"_blank\" rel=\"noopener noreferrer\">维护者的模型放大示例</a>。</li><li><a href=\"https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md\" target=\"_blank\" rel=\"noopener noreferrer\">Real-ESRGAN 原作者的模型列表</a>：提供照片与插画等用途的权重链接。它是可替换的放大模型来源，与官方示例默认使用的 4x-ESRGAN 分别识别。</li></ul>\n<p><strong>模型选择参考</strong></p>\n<table class=\"d-table\"><thead><tr><th>图片与目标</th><th>可比较的模型</th></tr></thead><tbody><tr><td>常规图像放大</td><td>RealESRGAN_x4plus 或 RealESRGAN_x2plus</td></tr><tr><td>动漫与插画</td><td>RealESRGAN_x4plus_anime_6B</td></tr><tr><td>优先降低耗时和显存占用</td><td>realesr-general-x4v3；原作者说明其去模糊、去噪能力较有限</td></tr></tbody></table>\n<p><strong>复用步骤</strong></p>\n<ol><li>下载官方工作流原始 PNG 并载入。首次练习可按官方教程使用 4x-ESRGAN；也可从 Real-ESRGAN 原作者列表下载对应的推理权重，避免下载用于训练的 netD 文件。</li><li>将模型放入 <code>ComfyUI/models/upscale_models</code>，在 UpscaleModelLoader 中选择。原工作流保存的 <code>RealESR/4x-ESRGAN.pth</code> 是作者目录记录，需按本机实际文件重新选择。</li><li>在 Load Image 上传待处理图。确认图像与放大模型连接到 ImageUpscaleWithModel，再运行流程并保存输出。</li><li>以实际像素尺寸检查输出。4 倍模型会将宽和高分别扩大约 4 倍；例如 512 × 512 变成约 2048 × 2048。</li><li>放大后在 100% 显示下比较纹理、边缘、文字和面部特征。普通图片与动漫图片可分别比较模型，选择符合用途的结果。</li><li>若运行时显存不足，先用小图测试或降低输入尺寸；需要大图时再选择提供分块处理的配套实现，并检查块间衔接。原作者命令行工具提供 tile 设置，它不是上述基础节点图中的同名参数。</li><li>在继续制作中可把生成流程的图像输出接入这一放大流程，并记录放大模型名称、倍率和输出尺寸。</li></ol>",
          "headings": []
        },
        {
          "id": "course-image-workflow-reuse-section-5",
          "title": "复用前的共同准备与结果记录",
          "html": "<p>上述流程均先按各自原始配置运行，再替换输入。模型、LoRA、节点和输入素材通常不会随一个 JSON 文件全部打包。没有明确来源依据时，不给出统一的最低显存承诺；本地需求受模型、输入尺寸、精度、同时加载的组件与软件版本影响。RunComfy 等云端环境按平台当前运行配置和费用说明使用。</p>\n<p>从官方模板开始时，可使用 Workflow → Browse Workflow Templates，按缺失提示补齐模型；作者分享的流程按 JSON 或原始 PNG 载入，再核对自定义节点。参考<a href=\"https://docs.comfy.org/interface/features/template\" target=\"_blank\" rel=\"noopener noreferrer\">模板操作说明</a>与<a href=\"https://support.comfy.org/articles/1536450065-missing-nodes-workflow-won-t-load\" target=\"_blank\" rel=\"noopener noreferrer\">缺失节点和模型排查</a>。</p>\n<p>建议每次保留以下记录，便于继续修改或比较候选：</p>\n<table class=\"d-table\"><thead><tr><th>记录项</th><th>内容</th></tr></thead><tbody><tr><td>流程来源</td><td>页面、文件名、下载日期，以及能够确认的版本或提交</td></tr><tr><td>运行配置</td><td>ComfyUI 与自定义节点版本、模型与配套文件、关键参数</td></tr><tr><td>输入与目标</td><td>参考图、蒙版、提示词、需要保留和修改的内容</td></tr><tr><td>检查结果</td><td>人物特征、产品细节、修改范围或放大纹理是否符合要求</td></tr><tr><td>实际投入</td><td>耗时、运行错误和人工修正量</td></tr></tbody></table>\n<p>随机种子与参数相同也不保证跨环境完全一致，复现条件见 <a href=\"https://huggingface.co/docs/diffusers/using-diffusers/reusing_seeds\" target=\"_blank\" rel=\"noopener noreferrer\">Diffusers 指南</a>。用同一批素材比较多个候选，才能判断哪条流程更适合当前任务。</p>",
          "headings": []
        }
      ]
    }
  }
};
