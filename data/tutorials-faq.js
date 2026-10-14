/* Reviewed FAQ snapshot; preserve original question identifiers and source answers. */
window.TUTORIAL_FAQ = {
  "source": {
    "pageId": "page_254ac08795bc81918733bef8e9e20a9d",
    "url": "https://chatgpt.com/space/page_254ac08795bc81918733bef8e9e20a9d",
    "revision": 15
  },
  "groups": [
    {
      "id": "A",
      "title": "表达意图",
      "questions": [
        {
          "id": "A006",
          "question": "如果需求含有错误前提，怎样允许 AI 先指出问题而不是顺着回答？",
          "topic": "目标与成功标准",
          "answer": "**可以明确要求 AI 检查前提，但这只能给它纠错的任务，不能保证它识别出错误。** 尤其不要把“我已经确定……”写成事实，然后只问它为什么。\n\nAnthropic 团队的研究测试了5个助手、4类生成任务，发现模型可能迎合用户观点，也可能在用户质疑之后把原本正确的答案改错。实验支持“用户的表态会影响回答”，并没有证明加一句“不要迎合我”就能解决问题。[研究原文](https://arxiv.org/html/2310.13548)\n\n实际写法要区分三种内容：已经有材料支持的事实、你希望核实的判断，以及为讨论暂时设定的假设。例如“用户流失一定是因为价格太高，帮我降价”把原因提前定死；可以改为：\n\n> 最近用户流失增加。我怀疑与价格有关，但原因尚未确认。请检查现有数据是否支持这个判断，列出其他同样能解释现象的原因；证据不足的地方指出缺什么资料，再讨论是否需要降价。\n\n这里有效信息是“原因尚未确认”和“按什么证据判断”。如果是小说设定或明确的假设推演，则应写“以下作为假设，不要求证明它真实”，避免 AI 把设定也当成待纠正的错误。\n\n这是一种根据上述风险制定的写法，尚无证据保证它在所有任务上提高多少。需要核实的前提，最终仍要与数据、原文或可运行的验证结果比较。\n\n**引用文献**\n\n1. [Sharma 等（2023/2024），Towards Understanding Sycophancy in Language Models](https://arxiv.org/html/2310.13548)"
        },
        {
          "id": "Q001",
          "question": "先让 AI 扮演专家再提问题，有没有用？",
          "topic": "角色与对话关系",
          "answer": "**让 AI 扮演专家，有时能改善表现，但它不是一种能稳定提高正确率的通用技巧。研究既发现过提升，也发现过无明显变化和下降。** 不能简单写成“有用”，也不能写成“只是改变语气”。\n\n先看几项直接研究这一问题的实验：\n\n| 研究 | 实验范围 | 主要发现 |\n| --- | --- | --- |\n| EMNLP Findings 2024：*When “A Helpful Assistant” Is Not Really Helpful* | 162种角色、4个模型家族、2,410道事实题 | 加角色整体没有带来稳定提升。某些角色能帮助某些题，但很难提前判断哪个角色有效。[论文](https://aclanthology.org/2024.findings-emnlp.888/) |\n| EMNLP 2025：*Principled Personas* | 9个开放权重模型、27项知识与推理任务 | 专家角色在多数任务上带来提升或没有显著变化，也存在退步；更细分的专业身份并不稳定地更好。[论文](https://aclanthology.org/2025.emnlp-main.1364/) |\n| 沃顿生成式 AI 实验室 2025年技术报告 | 6个 OpenAI／Google 模型；198道 GPQA Diamond 题及300道 MMLU-Pro 题；每个模型与提示条件下，每题重复25次 | 即使角色与题目领域匹配，也没有跨模型一致的准确率收益。这里测的是困难客观题，不能直接推广到写作、教学或模拟对话。[报告](https://arxiv.org/pdf/2512.05858) |\n\n**为什么有些论文说有效？它们具体加了什么，非常重要。**\n\nNAACL 2024 的 *Better Zero-Shot Reasoning with Role-Play Prompting* 确实报告了推理表现提升。但它的方法包含任务相关的角色描述，还从模型生成的回复中挑选角色确认语，再把这段互动作为解题上下文。主实验使用的是 `gpt-3.5-turbo-0613`。\n\n因此，这项研究支持的是“这套角色提示方法在这些实验中有效”，不能直接解释为“任意问题前加一句‘你是专家’就能提高正确率”。角色、任务描述和预先构造的互动同时发生了变化。[论文方法部分](https://aclanthology.org/2024.naacl-long.228.pdf)\n\n也不能反过来把所有提升都说成“只是写得更像专家”。*Principled Personas* 测量了可核对的正确答案，确实发现部分模型与任务的正确率提高。问题在于，**这种收益不稳定，专业头衔也不是越具体、越高级越有效。**[论文结果部分](https://aclanthology.org/2025.emnlp-main.1364.pdf)\n\n至于角色提示为什么会产生影响，目前还不能给出一个已经确定的统一机制。比如，“它激活了模型内部的专家知识”是一种解释，不能直接当作已经证实的事实。\n\n2026年的 PRISM 预印本进一步发现：在其测试中，专家角色可以改善部分写作、格式和意图遵循表现，同时损害知识选择题表现。作者提出了与模型训练、任务类型有关的解释，但这仍不足以证明所有模型都遵循同一机制；生成内容得到更高的评审分，也不等于事实更准确。[研究原文](https://arxiv.org/html/2603.18507v1)\n\n**实际使用时，该怎么做？**\n\n> **不必在每个问题前都让 AI 扮演专家。** 如果你只是希望答案更正确，现有研究不支持把“你是某领域专家”作为稳定有效的前置步骤；它可能改善结果，也可能没有明显作用，甚至使结果变差。\n>\n> 如果你需要的是特定角色的工作方式，例如模拟面试官、从编辑角度审稿，那么角色设定可以表达任务要求。不过，“是否按这个角色工作”和“判断是否正确”仍要分别检查。\n\n例如下面两条提示词，用途就不同：\n\n- **“你是资深面试官，告诉我这段经历是否真实。”** 专家身份不能作为判断正确的依据。\n\n- **“请扮演面试官，围绕这段经历逐项追问，重点问我的具体贡献和可以核实的细节。”** 这里的角色明确了互动方式，后面的要求则说明了具体怎么做。\n\n这是基于研究作出的教学建议，**并不意味着第二种写法已被证明适用于所有任务、总能取得更高分**。我们能确定的是：角色设定可以成为任务的一部分，但不能被当成提高正确率的保证。\n\n**引用文献**\n\n1. Zheng, M., Pei, J., Logeswaran, L., Lee, M., & Jurgens, D.（2024）. *When “A Helpful Assistant” Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models.* Findings of EMNLP 2024, 15126–15154. [论文原文](https://aclanthology.org/2024.findings-emnlp.888/)\n\n2. de Araujo, P. H. L., Röttger, P., Hovy, D., & Roth, B.（2025）. *Principled Personas: Defining and Measuring the Intended Effects of Persona Prompting on Task Performance.* EMNLP 2025, 26857–26886. [论文原文](https://aclanthology.org/2025.emnlp-main.1364/)\n\n3. Basil, S., Shapiro, I., Shapiro, D., Mollick, E. R., Mollick, L., & Meincke, L.（2025）. *Prompting Science Report 4: Playing Pretend: Expert Personas Don’t Improve Factual Accuracy.* 技术报告，arXiv:2512.05858（非同行评审会议论文）. [报告原文](https://arxiv.org/abs/2512.05858)\n\n4. Kong, A., et al.（2024）. *Better Zero-Shot Reasoning with Role-Play Prompting.* NAACL 2024. [论文原文](https://aclanthology.org/2024.naacl-long.228/)\n\n5. Hu, Z., Rostami, M., & Thomason, J.（2026）. *Expert Personas Improve LLM Alignment but Damage Accuracy: Bootstrapping Intent-Based Persona Routing with PRISM.* arXiv:2603.18507，本文引用 v1（预印本）. [研究原文](https://arxiv.org/html/2603.18507v1)"
        },
        {
          "id": "Q002",
          "question": "主语用你、我，还是你们、我们？要不要加敬语？对 AI 的态度如何？",
          "topic": "角色与对话关系",
          "answer": "**主语负责说明谁做什么；敬语负责表达语气。它们都不是必须填写的提示词模块。** 可以直接说“总结下面的文章”，也可以说“请你总结下面的文章”。当涉及分工、作者身份或代写时，再明确“我”“你”“我们”分别是谁。主语的细分问题见 A011。\n\n礼貌程度确实可能影响输出，但研究没有给出“越客气越好”或“越凶越好”的通用结论。Yin 等在英语、中文和日语任务中设置8档礼貌程度，测试 GPT-3.5、GPT-4 及各语言的专门模型：极不礼貌的版本经常较差，过度礼貌也不保证最好；最佳水平随语言和模型变化。摘要任务中的变化还可能体现为篇幅，而不只是内容质量。[论文](https://aclanthology.org/2024.sicon-1.2/)\n\n相反，2025年短篇预印本 *Mind Your Tone* 在50道英语选择题上报告，GPT-4o 的“非常粗鲁”版本平均准确率为84.8%，“非常礼貌”为80.8%。它的题目及参考答案由 AI 生成，主要结果只涉及一个模型，不能据此推广为“骂 AI 更聪明”。[原文及表2](https://arxiv.org/pdf/2510.04950)\n\n因此，新手可以使用自然、直接、普通礼貌的措辞。选择“请总结”是一个省事的默认写法，**不是某种已被证实的最高分语气**。不需要为每条问题加敬称、感谢或命令式主语；更值得明确的是任务、对象和分工。Google 的官方用户指南同样建议自然表达，并提供直接以动作开头的提示词。[官方指南](https://support.google.com/a/users/answer/14200040?hl=en)\n\n**引用文献**\n\n1. [Yin 等（2024），Should We Respect LLMs? A Cross-Lingual Study on the Influence of Prompt Politeness on LLM Performance，SICon](https://aclanthology.org/2024.sicon-1.2/)\n\n2. [Dobariya 与 Kumar（2025），Mind Your Tone: Investigating How Prompt Politeness Affects LLM Accuracy，arXiv 预印本](https://arxiv.org/abs/2510.04950)\n\n3. [Google，Tips to write prompts for Gemini，官方用户指南](https://support.google.com/a/users/answer/14200040?hl=en)"
        },
        {
          "id": "A007",
          "question": "“扮演专家”是在规定视角、语气，还是能提高事实准确性？应分别怎样检查？",
          "topic": "角色与对话关系",
          "answer": "**角色既可能改变语气和分析视角，也可能改变正确率；这几种变化不能混为一谈。** “像专家”很容易从措辞看出来，“判断正确”必须另外核对。\n\n*Principled Personas* 在9个开放权重模型、27项知识与推理任务中比较了角色提示。某些组合出现了真实的正确率提升，另一些没有显著变化，也有退步。这意味着角色的作用不止于修饰语言，但不能凭角色名字预测这次一定更准确。完整研究比较见 Q001。[论文](https://aclanthology.org/2025.emnlp-main.1364/)\n\n可以把检查拆成三项：需要编辑视角，就看它是否找出了具体的结构、措辞和读者理解问题；需要平实语气，就看表达是否符合；需要事实正确，就对照原文、数据或标准答案。“使用了很多术语”不能替代后两项，更不能算已经通过事实核验。\n\n例如：\n\n> 请从教材编辑的角度审阅这段文字。分别指出术语误用、推导缺步和新手可能误解的位置。涉及事实的判断请给出可核对依据；只有表达偏好的建议请单独标明。\n\n这条写法把职业名称展开为可观察的工作内容。它便于验收，但仍需检查 AI 给出的依据本身是否成立。\n\n**引用文献**\n\n1. [de Araujo 等（2025），Principled Personas: Defining and Measuring the Intended Effects of Persona Prompting on Task Performance，EMNLP](https://aclanthology.org/2025.emnlp-main.1364/)"
        },
        {
          "id": "A008",
          "question": "与其指定职业角色，直接列出分析标准有什么不同？",
          "topic": "角色与对话关系",
          "answer": "**指定职业角色，是让 AI 根据这个身份推测工作方式；列出分析标准，是直接规定你要它检查什么。** 两者可以一起用，也可以只用标准。\n\n“你是资深编辑，帮我看看”没有确定是检查语病、事实、结构，还是传播效果；“检查每个结论是否有依据，指出缺少推导的段落”则缩小了这次工作的范围。Anthropic 官方指南建议明确所需输出和约束；这属于产品使用建议，不能视为“列标准在所有任务上都胜过角色”的对照实验。[官方指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)\n\n角色研究也没有替我们完成这个比较：Q001 中的实验主要比较加不加身份，不能直接推出“删角色、换标准”必然更优。[Principled Personas](https://aclanthology.org/2025.emnlp-main.1364/)\n\n如果你已经知道什么算好，就把标准写出来；如果不知道，可以先让 AI 提出候选标准，你确认后再执行。例如：\n\n> 我想审查这份面向新手的教程，但不确定应该检查什么。先给出与你看到的问题有关的审查标准，并说明每条会检查哪些具体内容；由我确认本次采用哪些标准。\n\n角色适合快速指定一个大致视角；具体标准适合限定范围、发现遗漏和比较修改前后。标准也不宜无限堆叠，应只保留这次确实需要检查的内容。\n\n**引用文献**\n\n1. [Anthropic，Prompting best practices，官方使用指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)\n\n2. [de Araujo 等（2025），Principled Personas: Defining and Measuring the Intended Effects of Persona Prompting on Task Performance，EMNLP](https://aclanthology.org/2025.emnlp-main.1364/)"
        },
        {
          "id": "A009",
          "question": "让一个 AI 扮演多位专家讨论，能否当作独立意见？",
          "topic": "角色与对话关系",
          "answer": "**不能把一个 AI 写出的多位专家发言，当成多份独立证据。** 它可以提供不同思路，但“有三位专家都赞同”并不等于有三个独立来源支持。\n\n这不意味着多角色讨论无效。NAACL 2024 的 Solo Performance Prompting 让同一个模型生成角色、讨论并修改方案，在3类任务上测试；GPT-4 的逻辑网格题得分从57.7%提高到68.3%。但完整方法还包含两段流程示范和迭代，不能把提升全归给“专家人数增加”。[研究方法与表2](https://aclanthology.org/2024.naacl-long.15/)\n\nDu 等的多智能体辩论则让多个模型实例先产生答案，再交换意见，部分推理和事实任务得到改善。这与在一次输出里编排圆桌会议是不同的方法，也不能由“达成一致”直接认定答案为真。[研究原文](https://arxiv.org/abs/2305.14325)\n\n原因很具体：同一段生成中，后面的“专家”已经看见前面的发言；即使分开调用，同一模型也可能共享知识缺口。**增加视角与增加独立证据，是两件不同的事。**\n\n可以这样用：\n\n> 分别从实施成本、用户体验、失败风险三个角度审查方案。每个角度列出最有力的反对理由、依据及待验证事项，不要求达成共识。\n\n这适合寻找盲点。真正要验证争议，应检查各意见引用的资料或实际测试结果，而不是数赞成票。\n\n**引用文献**\n\n1. [Wang 等（2024），Unleashing the Emergent Cognitive Synergy in Large Language Models: A Task-Solving Agent through Multi-Persona Self-Collaboration，NAACL](https://aclanthology.org/2024.naacl-long.15/)\n\n2. [Du 等（2024），Improving Factuality and Reasoning in Language Models through Multiagent Debate，ICML](https://arxiv.org/abs/2305.14325)"
        },
        {
          "id": "A010",
          "question": "夸奖、责备、催促或威胁措辞会如何影响 AI？",
          "topic": "角色与对话关系",
          "answer": "**这些措辞可能影响回答，但目前不能排出一张跨模型、跨任务都成立的“夸奖—责备—催促—威胁”效果榜。** 尤其要把情绪表达与具体反馈分开。\n\nEmotionPrompt 在6个模型、45项任务上测试情绪附加语。查表1会发现：在 Instruction Induction 的零样本设置中，跨模型、跨情绪句的平均分仅从51.65变为51.98；GPT-4 在该行比较中还从80.75降到78.96。论文同时报告了逐任务挑选最佳情绪句的结果，那比实际随手加一句鼓励更有利。部分句子还要求复查、说明理由或报置信度，因此不能把收益全部解释成“夸奖使 AI 更努力”。[原文表1及提示句](https://arxiv.org/html/2307.11760v6)\n\n四类措辞可以这样理解：\n\n- **夸奖**：“你很聪明”没有说明哪里需要改变；“上一版分类准确，请保留分类，只改标题”则给出了可执行的反馈。\n\n- **责备**：单纯强调“你错了”不等于提供纠错依据。Anthropic 的实验发现，用户无证据地质疑答案时，模型会出现从正确改成错误的情况。[研究](https://arxiv.org/html/2310.13548)\n\n- **催促**：“快点”可能被理解成少解释、尽快结束，却不是控制推理时间或算力的可靠开关。确有时间限制，可以直接写先交什么、允许省略什么。\n\n- **威胁**：上述研究不足以证明威胁有稳定的正确率收益，更不能由一次变好推出“威胁越重越有效”。\n\n实操时，把情绪转换为修改信息：\n\n> 上一版把“可以申请”写成了“一定退款”，与规则不符。请修正这一处，保留审核条件，不添加新承诺。\n\n如果只是想测试某句夸奖或威胁是否有帮助，应保持任务和材料相同、重复比较；看正确率和约束是否满足，不能只看 AI 是否道歉、保证或显得更认真。\n\n**引用文献**\n\n1. [Li 等（2023），Large Language Models Understand and Can Be Enhanced by Emotional Stimuli，arXiv v6，表1](https://arxiv.org/html/2307.11760v6)\n\n2. [Sharma 等（2023/2024），Towards Understanding Sycophancy in Language Models](https://arxiv.org/html/2310.13548)"
        },
        {
          "id": "A011",
          "question": "“你”“我们”“我”等提示词的主语该怎么选？是必要的吗？影响答案吗？",
          "topic": "角色与对话关系",
          "answer": "**按实际指代选择主语；没有指代歧义时可以省略。没有足够证据证明中文提示词统一使用“你”“我”或“我们”中的某一个，就能获得最高正确率。**\n\n“请总结这段文字”已明确了要执行的动作，不必加“你”；“我是第一次接触摄影”说明的是用户背景；“我们是一家三人的工作室”说明团队条件。这里影响任务的是身份和条件，并不是“我”或“我们”本身带有特殊效果。Google 的用户指南包含直接以动作开头的写法，但这不构成代词之间的准确率比较。[官方指南](https://support.google.com/a/users/answer/14200040?hl=en)\n\n需要留意两种会真正改变含义的情况。一是**分工**：“我们把数据检查一遍”没有说谁提供数据、谁计算、谁确认；二是**代写视角**：“帮我给客户回信”中的“我”是邮件作者，而不是 AI。可以直接指定：\n\n> 我提供原始数据，你负责计算并列出异常；是否删除异常值由我决定。\n>\n> 以我的身份回复客户。信中的“我”指项目负责人，“我们”指项目团队。\n\nCLAM 的歧义研究专门包含把明确人名换成“他／她”后需要追问的任务，说明指代缺失可能让问题无法确定；它没有证明某个人称天然更优。[研究](https://arxiv.org/abs/2212.07769)\n\n“你们”也不会自动启动多个助手，“我们”不会自动形成协作流程。需要多角色或多步骤时，要另外说明各自做什么。\n\n**引用文献**\n\n1. [Google，Tips to write prompts for Gemini，官方用户指南](https://support.google.com/a/users/answer/14200040?hl=en)\n\n2. [Kuhn、Gal 与 Farquhar（2022/2023），CLAM: Selective Clarification for Ambiguous Questions with Generative Language Models](https://arxiv.org/abs/2212.07769)"
        },
        {
          "id": "Q003",
          "question": "用词是否必须专业规范，还是可以使用民间用词？",
          "topic": "词语与含义对齐",
          "answer": "**不必先学会全部专业词汇才能提问。能把你指的东西说清楚，日常用语、自定义名称和规范术语都可以使用。** 真正需要避免的是一个词可能指向几个不同概念，却没有说明本次是哪一个。\n\nGoogle 官方建议用自然语言表达，不要求把日常问题改写成专业论文。[官方指南](https://support.google.com/a/users/answer/14200040?hl=en) WinoDict 则做了更具体的实验：给模型陌生词及定义，让它据此解题。模型能利用定义，但表现受模型和写法影响，给了定义也未必用对。这支持“可以解释词义”，不支持“任何民间叫法都能被准确识别”。[研究](https://aclanthology.org/2023.eacl-main.7/)\n\n例如，你可以说“我想让视频里的人一直长得一样”，不必先知道“角色一致性”这个名称。但“让视频更高级”仍有多种解释，需要补充你在意的是灯光、色彩、构图还是剪辑。\n\n遇到行业术语、设备名、软件功能名或需要查资料的概念，准确名称通常更便于定位对象。不要为了显得专业，选一个自己并不确定含义的术语；可以先用自己的话描述，再让 AI 提供候选名称。\n\n> 我说的“人物别变脸”，是同一角色在不同镜头里保持面部特征，不是把所有人物换成同一张脸。这个需求通常叫什么？请区分相近概念。\n\n这里的定义限定了任务。名称随后可以统一，但不应反过来让名称替你决定需求。\n\n**引用文献**\n\n1. [Google，Tips to write prompts for Gemini，官方用户指南](https://support.google.com/a/users/answer/14200040?hl=en)\n\n2. [Eisenschlos 等（2023），WinoDict: Probing language models for in-context word acquisition，EACL](https://aclanthology.org/2023.eacl-main.7/)"
        },
        {
          "id": "A012",
          "question": "不知道专业名称时，能否通过用途、特征、例子和反例让 AI 帮忙确定概念？",
          "topic": "词语与含义对齐",
          "answer": "**可以从用途、特征和例子出发寻找名称，但应把 AI 给出的词先当作候选。** “描述事物，再找对应词”本身就是一个成熟的语言处理任务，叫反向词典。\n\n清华团队的 WantWords 输入词义描述，返回语义匹配的候选词，支持中文、英文及跨语言查询。这证明了从描述找词的可行性，但它是专门的反向词典系统，不能当成任意聊天模型都能准确识别概念的实验。[论文](https://aclanthology.org/2020.emnlp-demos.23/)\n\n对聊天助手，更实用的流程是：先描述你看见什么、想用它完成什么；让它给少量候选和区别；再用一个能区分候选的问题继续确认。CLAM 验证过“发现歧义—追问—利用补充信息回答”的方法，不过实验主要是事实问答，不是无限追问的新手咨询。[研究](https://arxiv.org/abs/2212.07769)\n\n> 我不知道这个功能叫什么。它能把人物从背景里单独取出来，但我不想改变人物本身。请给出可能的功能名称及区别；如果“抠图”和其他功能都符合，先问一个最能区分它们的问题。\n\n反例应排除容易混淆的概念，例如“不是换背景，而是得到透明背景的人物图片”。不用为了描述得专业而先猜一个名称；一个猜错的术语，反而可能把后续讨论带向另一个任务。\n\n**引用文献**\n\n1. [Qi 等（2020），WantWords: An Open-source Online Reverse Dictionary System，EMNLP 系统演示](https://aclanthology.org/2020.emnlp-demos.23/)\n\n2. [Kuhn、Gal 与 Farquhar（2022/2023），CLAM: Selective Clarification for Ambiguous Questions with Generative Language Models](https://arxiv.org/abs/2212.07769)"
        },
        {
          "id": "A013",
          "question": "和 AI 对话时使用的专有名词是一直用一个还是可以换着用？是否要以 AI 生成的专有名词为基准？",
          "topic": "词语与含义对齐",
          "answer": "**同一个对象最好保留一个主名称；可以换着用，但要说明别名。没有证据要求必须使用 AI 的用词，也没有证据证明同义词切换一定导致质量下降。**\n\n问题不在“词变了就损失注意力”，而在模型是否把两个名称识别为同一对象，以及你有没有在换词时同时改变范围。AmbigQA 在14,042道问题中分析了事件、实体等歧义，说明名称背后的指代并不总是唯一；这不是“固定名词提高多少”的实验。[研究](https://aclanthology.org/2020.emnlp-main.466/) WinoDict 也表明，定义能帮助模型使用新名称，但不能确保每次都按定义处理。[研究](https://aclanthology.org/2023.eacl-main.7/)\n\n三种情况应分开处理：\n\n- **只是别名**：“知识卡片”“节点”完全同指，可以建立一次对应关系，后面保留一个主名称。\n\n- **行业词义更精确**：先核对专业词是否确实对应需求，再决定采用；必要时保留“通俗名（专业名）”。\n\n- **范围不同**：“AI 搜索”与“联网检索工具”并非天然相同，不要为追求统一强行合并。\n\n> 术语约定：“节点”是本项目的一项独立知识点；“卡片”是展示节点的界面。两者有关联，但不是同一概念。请按这个区别使用，遇到不一致先指出。\n\n这里的统一，是为了让我们和 AI 都能检查同一项约定，不能理解为某个词有特殊提示效果。长项目或新对话应把必要定义重新带入。\n\n**引用文献**\n\n1. [Eisenschlos 等（2023），WinoDict: Probing language models for in-context word acquisition，EACL](https://aclanthology.org/2023.eacl-main.7/)\n\n2. [Min 等（2020），AmbigQA: Answering Ambiguous Open-domain Questions，EMNLP](https://aclanthology.org/2020.emnlp-main.466/)"
        },
        {
          "id": "A015",
          "question": "项目内自定义名称、缩写和行话，应怎样定义并保持一致？",
          "topic": "词语与含义对齐",
          "answer": "**自定义名称要与定义一起给，缩写要与完整名称一起给；容易混淆的词，还要说明彼此区别。** 只写“按我们之前的叫法”并不能补上当前上下文里没有的定义。\n\nWinoDict 在 GPT-3 和 PaLM 上测试了陌生词的上下文理解：给出词义可以帮助解题，但效果仍落后于熟悉词；将熟悉词改成新义还可能受原词义干扰。它提示我们关注定义和旧含义的冲突，而不是认为任何新缩写都能被立即稳定掌握。[论文](https://aclanthology.org/2023.eacl-main.7/)\n\n项目里可以维护一份很短的词表，写清四件事：主名称、含义、可接受别名、不能混用的近似词。例如：\n\n> “已完成”：正文通过审核，且链接检查通过；不包括仅写完初稿。  \n> “草稿”：已写出正文但尚未完成上述检查。  \n> “完成率”：已完成条目数 ÷ 本轮计划条目数。  \n> 输出中统一用这些名称；如果材料使用其他叫法，先判断是否同指。\n\n对于处理多份资料的提示，可以把这段放进单独的“术语约定”部分，避免与待分析正文混在一起。清晰分隔指令、背景和材料，也符合 Anthropic 的官方结构化建议。[官方指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)\n\n变更定义时应标明旧定义失效；仅改名称则说明含义不变。以上是便于执行和核对的组织方式，没有统一的实验增益百分比。\n\n**引用文献**\n\n1. [Eisenschlos 等（2023），WinoDict: Probing language models for in-context word acquisition，EACL](https://aclanthology.org/2023.eacl-main.7/)\n\n2. [Anthropic，Prompting best practices，官方使用指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)"
        },
        {
          "id": "A016",
          "question": "中文、英文、方言、网络用语或混合语言，何时需要补充解释？",
          "topic": "词语与含义对齐",
          "answer": "**可以用中文、英文或混合语言，但不要假定模型对所有方言、圈内用语和语言组合都同样熟悉。** 是否需要解释，取决于那个词是不是决定任务含义的关键点。\n\nEMNLP 2024 的研究用10种英语变体测试 GPT-3.5 和 GPT-4，由母语者评价回答，发现对部分非标准变体的理解和回应质量更差。它说明语言变体可能影响服务质量；不能据此认定某个中文方言也会下降同样幅度。[论文](https://aclanthology.org/2024.emnlp-main.750/)\n\n另一方面，LREC-COLING 2024 的研究在7个数据集上比较6个模型的混合语言翻译，GPT-4、GPT-3.5 在其中表现出较强能力。这也反对“中英混用必然让 AI 糊涂”的一概而论，但翻译表现不等于所有推理任务的表现。[论文](https://aclanthology.org/2024.lrec-main.565/)\n\n普通中文说明夹一个准确英文产品名、代码标识符或专业词，通常没有必要强行翻译。更应补充解释的是：一词多义的缩写、新出现的网络词、反话、地方特有说法，以及被 AI 明显理解错的词。可以保留原词，再加一句本次含义：\n\n> 文中的“种草”指让读者产生尝试产品的兴趣，不是园艺；“Agent”指能调用工具执行任务的 AI 程序。请用简体中文回答，代码和产品名称保留原文。\n\n如果任务本身就是分析方言、讽刺或语言风格，原句是重要材料，应保留，并把解释放在旁边；全部改成标准语可能丢掉需要分析的特征。\n\n**引用文献**\n\n1. [Fleisig 等（2024），Linguistic Bias in ChatGPT: Language Models Reinforce Dialect Discrimination，EMNLP](https://aclanthology.org/2024.emnlp-main.750/)\n\n2. [Huzaifah 等（2024），Evaluating Code-Switching Translation with Large Language Models，LREC-COLING](https://aclanthology.org/2024.lrec-main.565/)"
        },
        {
          "id": "Q004",
          "question": "问题描述多清楚算清楚？主谓宾都要有吗？环境描写、背景信息有帮助吗？",
          "topic": "描述充分程度与语言形式",
          "answer": "**清楚到什么程度，要看未说明的部分会不会把结果带向你不接受的方向，没有固定字数，也不要求每句话主谓宾齐全。** “把下面这段话译成英文”已经确定了动作和对象；“帮我做个方案”则留下了用途、对象和取舍。\n\nAmbigQA 对14,042道开放域问题的分析发现，超过一半存在不止一种合理理解，包括事件和实体指代不明确。这个比例只属于该数据集，不能当成所有日常问题的比例；它说明即使句子语法完整，也可能缺少确定答案所需的信息。[研究](https://aclanthology.org/2020.emnlp-main.466/)\n\n背景是否有用，可以做一个检查：**把它换成另一种情况，你期望的答案会不会随之改变？** “读者是第一次接触 AI 的学生”会影响解释深度；“我今天在咖啡店写这段话”通常不会，除非场景本身就是写作内容。这是挑选材料的判断方法，不是实验确定的唯一规则。\n\n也不是背景越多越好。Shi 等在 GSM-IC 数学题中加入不改变答案的无关信息，观察到解题表现下降。这支持筛掉无关干扰，但不能推出“所有长提示都更差”。[研究](https://proceedings.mlr.press/v202/shi23a.html)\n\n可以先写：\n\n> 给第一次接触 AI 的读者解释“上下文窗口”，用于网页入门教程，约200字。只讲它影响什么，不介绍计算公式；保留一个生活例子。\n\n仍拿不准时，再让 AI 指出“哪些缺失信息会导致两种明显不同的写法”。Google 官方也支持问题、任务、待处理对象乃至部分输入等不同形式，并没有要求固定句法模板。[官方文档](https://ai.google.dev/gemini-api/docs/prompting-strategies)\n\n**引用文献**\n\n1. [Min 等（2020），AmbigQA: Answering Ambiguous Open-domain Questions，EMNLP](https://aclanthology.org/2020.emnlp-main.466/)\n\n2. [Shi 等（2023），Large Language Models Can Be Easily Distracted by Irrelevant Context，ICML](https://proceedings.mlr.press/v202/shi23a.html)\n\n3. [Google，Prompt design strategies，Gemini 官方开发文档](https://ai.google.dev/gemini-api/docs/prompting-strategies)"
        },
        {
          "id": "Q007",
          "question": "标点符号是否必须完美？为什么？",
          "topic": "描述充分程度与语言形式",
          "answer": "**自然语言提示词的标点不必完美，但不能因此认为标点完全不影响输出。** 要区分两件事：标点改变了句意，和句意没变但模型对格式敏感。\n\n“不要，继续修改”和“不要继续修改”表达相反；引号没闭合，也可能让人分不清哪些文字是原文、哪些是要求。这类问题应修正，因为含义或边界已经变了。\n\n*When Punctuation Matters* 在 Llama、Qwen、Gemma 等模型上比较格式变化，并扩展测试 GPT-4.1 和 DeepSeek V3。在部分任务中，仅格式变化仍可造成约8—10个准确率百分点的差异。但实验是分类、选择题及数学等特定设置，**不是把日常中文标点改到规范后就能提升8—10个百分点**。[论文 §4.4与局限](https://aclanthology.org/2025.findings-emnlp.1109/)\n\n因此，优先修正会影响理解的标点：否定词的作用范围、条件分组、数字的小数点、材料与指令的界线。普通句子末尾少一个句号，不值得每次都重写整条提示；但反复运行的固定任务，可以实测几种清晰格式，选择结果更稳定的版本。\n\n如果输入的是 JSON、代码或其他机器格式，则另当别论：引号、逗号和括号可能是语法本身，格式错误会让解析直接失败，不能按自然语言的容错方式处理。\n\n**引用文献**\n\n1. [Seleznyov 等（2025），When Punctuation Matters: A Large-Scale Comparison of Prompt Robustness Methods for LLMs，Findings of EMNLP](https://aclanthology.org/2025.findings-emnlp.1109/)"
        },
        {
          "id": "A019",
          "question": "不完整句子、错别字、语音转写错误，哪些会改变任务含义？",
          "topic": "描述充分程度与语言形式",
          "answer": "**最应检查的错误，是把对象、动作、否定、数量或条件改掉的错误。** 句子不完整未必有问题，句子很完整也可能表达错了任务。\n\nPromptRobust 使用字符、词语、句子和语义层面的扰动，在8类任务、13个数据集上生成4,788条对抗提示，发现模型对这类变化并不充分稳健。它刻意寻找会出错的输入，不能把其下降幅度直接当作普通人打错一个字的影响。[研究](https://arxiv.org/abs/2306.04528)\n\n2026年 MulTypo 研究进一步在18个开放模型上模拟多语言打字错误，观察到性能下降，且推理、生成任务与语言之间存在差异。其键盘错误主要覆盖字母文字，不包含中文拼音输入或中文语音转写，不能直接给出中文错字率与回答准确率的对应公式。[论文](https://aclanthology.org/2026.acl-long.729/)\n\n实际检查时，可以优先看：\n\n- “需要／不需要”“保留／删除”等动作或否定有没有录错。\n\n- “15／50”“毫克／克”等数字和单位有没有变化。\n\n- 人名、型号、文件名、代码变量是否指向了另一个对象。\n\n- “仅当”“除非”“至少”等条件是否被遗漏。\n\n“这段，短点，保留数字”虽然不是完整句子，但在对象已知时仍然有意义。相反，语音把“不要删除”识别成“要删除”，即使语法正常，任务也已经变了。\n\n> 以下来自语音转写。金额、日期、姓名和否定词如果出现矛盾，请先指出，不要自动猜一个版本。确认后再执行。\n\n这能建立核对要求，不能让模型恢复你没有提供、也无法从上下文确定的原话。\n\n**引用文献**\n\n1. [Zhu 等（2023；2024年修订），PromptRobust: Towards Evaluating the Robustness of Large Language Models on Adversarial Prompts，技术报告](https://arxiv.org/abs/2306.04528)\n\n2. [Zhao 等（2026），Evaluating Robustness of Large Language Models Against Multilingual Typographical Errors，ACL](https://aclanthology.org/2026.acl-long.729/)"
        },
        {
          "id": "A021",
          "question": "标点、换行、标题、列表和引号分别在什么时候帮助区分含义？",
          "topic": "描述充分程度与语言形式",
          "answer": "**这些格式的主要用途，是让不同部分的关系更容易辨认；没有一种符号是所有任务的通用最优选择。**\n\n标点适合区分一句话内部的条件和关系；换行适合分开独立信息；标题适合区分“任务”“资料”“示例”；列表适合呈现必须逐项处理的要求；引号适合标明某个词、原话或待修改片段。它们解决的歧义不同，不需要每条提示都全部使用。\n\nAnthropic 官方建议，在指令、背景、示例混杂的复杂提示里用有含义的 XML 标签分隔，并保持命名一致。它是帮助模型识别结构的使用建议，并非要求所有人都写 XML，也不是安全隔离保证。[官方指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)\n\n例如这段自然语言已足够清楚：\n\n> 任务：把下面的客户原话改成礼貌表达。  \n> 客户原话：“你们必须今天给我退款。”  \n> 规则：只改语气，不新增退款承诺。  \n> 输出：只给改写后的句子。\n\n把客户原话独立标出，可以避免它与我们自己的任务混淆。若材料里本来就有很多引号或标题，可换用明确的“材料开始／材料结束”标记，并说明其用途。\n\n格式敏感性研究还发现，即使语义相同，模型也可能因格式变化而表现不同。因此，“更方便人检查”与“对当前模型得分更高”不完全相同；需要重复使用的提示应拿实际任务比较。[论文](https://aclanthology.org/2025.findings-emnlp.1109/)\n\n**引用文献**\n\n1. [Anthropic，Prompting best practices，官方使用指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)\n\n2. [Seleznyov 等（2025），When Punctuation Matters: A Large-Scale Comparison of Prompt Robustness Methods for LLMs，Findings of EMNLP](https://aclanthology.org/2025.findings-emnlp.1109/)"
        },
        {
          "id": "A023",
          "question": "把要求放在开头、结尾或重复多次，是否必要，怎样避免写成互相冲突的要求？",
          "topic": "描述充分程度与语言形式",
          "answer": "**位置和重复都可能影响表现，但都不是每条提示的必做步骤。** “关键要求应当容易找到”比“永远放第一句／最后一句”更接近可迁移的原则。\n\n*Lost in the Middle* 在长上下文问答和键值检索中发现，重要信息位于中间时，部分模型更难利用。这是长材料中的信息检索结果，不能直接推出短提示里的第二条规则一定比第一条更容易被忽略。[论文](https://aclanthology.org/2024.tacl-1.9/)\n\n关于重复，也有直接的正面证据。Google Research 的2025年预印本将**整个输入原样重复**，在不启用推理的7个模型、70个模型与测试配置组合中，以论文采用的 p<0.1 标准统计得到47次胜出、0次失利；启用逐步推理的另组测试则是5胜、1负、22次无显著变化。它不等于“把一句要求大喊三遍”或“所有长对话都应该复制一遍”，重复也会增加输入长度。[原文](https://arxiv.org/html/2512.14982v1)\n\nGoogle 针对 Gemini 3 的官方建议区分了两层：核心行为和约束放前面；有大量材料时，把本次具体问题放在材料后面。[官方文档](https://ai.google.dev/gemini-api/docs/prompting-strategies)\n\n可据此组织：前面说明任务和关键边界，中间放材料，末尾说明这次要交付什么。短提示没有必要为此人为拆成三段。如果模型总漏一项，可在末尾简短提醒，再用相同任务验证是否改善。\n\n重复时保持意思完全一致。前面写“最多120字”，后面写“至少200字”，属于冲突；写了新版则明确旧版失效，而不是让它自行判断哪句权重更高。\n\n**引用文献**\n\n1. [Liu 等（2024），Lost in the Middle: How Language Models Use Long Contexts，TACL](https://aclanthology.org/2024.tacl-1.9/)\n\n2. [Leviathan、Kalman 与 Matias（2025），Prompt Repetition Improves Non-Reasoning LLMs，Google Research，arXiv 预印本](https://arxiv.org/html/2512.14982v1)\n\n3. [Google，Prompt design strategies，Gemini 官方开发文档](https://ai.google.dev/gemini-api/docs/prompting-strategies)"
        },
        {
          "id": "Q005",
          "question": "提供一个案例能让 AI 生成的内容提高多少？",
          "topic": "示例与参照",
          "answer": "**没有“加一个案例平均提高多少”的通用数字；可能明显改善，也可能不变或变差。** 首先要确定，你希望这个例子教会 AI 什么：输出格式、措辞风格、分类标准，还是一套解题方法。\n\nMin 等在12个模型的分类和选择题实验中发现，即使打乱示例里的标签，部分设置的表现也没有明显下降；输入分布、可选标签和格式本身发挥了重要作用。这说明示例的收益未必全部来自“看懂了正确解法”，也可能来自识别任务形式。它不意味着可以随便给错误示例。[论文](https://aclanthology.org/2022.emnlp-main.759/)\n\n模型之间也有差异。Gemini 官方指南鼓励用示例说明期望模式；DeepSeek-R1 初版报告则指出，少样本提示会损害其部分评测表现，并建议先直接说明问题及输出格式。这不是禁止给 R1 上传任务材料，也不是证明示例在所有 R1 任务中都无效。[Gemini 指南](https://ai.google.dev/gemini-api/docs/prompting-strategies)、[R1 报告 §3、§5](https://arxiv.org/html/2501.12948v1)\n\n据此，新手可以先看哪里说不清：如果“用这种版式”比一长串描述更直观，就给一个有代表性的示例，并标明模仿范围；如果任务已经明确，示例只是在重复显而易见的答案，可以先不加。复杂规则若有例外，一个正例通常不足以说明边界，应再给能区分规则的情况。\n\n> 以下示例只展示“结论—依据—下一步”的结构。请用本次资料重新作答，不沿用示例里的事实和结论。\n\n想知道对自己的任务究竟提高多少，应比较同一模型、同一批新问题在有无示例时的结果，并重复生成。格式通过率、事实正确率和满意程度分开看；一次输出变好，只能说明这次有帮助。\n\n**引用文献**\n\n1. [Min 等（2022），Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?，EMNLP](https://aclanthology.org/2022.emnlp-main.759/)\n\n2. [DeepSeek-AI（2025），DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning，技术报告 v1，§3与§5](https://arxiv.org/html/2501.12948v1)\n\n3. [Google，Prompt design strategies，Gemini 官方开发文档](https://ai.google.dev/gemini-api/docs/prompting-strategies)"
        },
        {
          "id": "A028",
          "question": "怎样避免 AI 把示例中的姓名、数字和情节复制到新任务？",
          "topic": "示例与参照",
          "answer": "**先说明示例里哪些东西要继承，哪些只是这一个案例的数据，再把本次材料单独给出。** 只说“照这个写”，既可能被理解成照结构，也可能被理解成照人物、数字和情节。\n\nAnthropic 的官方指南建议示例相关、清楚，并覆盖足够多样的情况，以免模型学到无意中的共同模式。这是官方使用建议，尚不能据此给出“这样写可消除多少误抄”的统一比例。[官方指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)\n\n实际可以这样处理：只需要格式，就把无关的人名和金额换成明显的占位符；需要自然文风，就保留完整示例，但明确事实以本次材料为准；提供多个例子时，避免它们全都碰巧使用同一人物、同一数字或同一种结局。占位符适合展示结构，不适合替代真正要演示的内容特征。\n\n> 示例只展示回复顺序和语气，不提供本次事实。姓名、订单号、金额、日期和处理结果只能取自“本次材料”；材料没有的信息不要从示例补入。  \n> 示例：小林，订单123的申请已受理，预计……  \n> 本次材料：顾客小陈；仅确认符合申请条件；尚未受理，也没有处理时限。  \n> 请据此写本次回复。\n\n这个例子中，“已受理”和“预计多久”也属于不可照搬的数据，不只是姓名和数字。检查输出时，应把这些具体事实逐一对回材料。划分示例用途能减少歧义，但不能保证模型绝不复制；固定批量任务还应检查是否出现示例中的专有名称和数值。\n\n**引用文献**\n\n1. [Anthropic，Prompting best practices，官方使用指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)"
        },
        {
          "id": "A029",
          "question": "怎样区分“更像示例”和“内容更正确”，评价案例带来的改善？",
          "topic": "示例与参照",
          "answer": "**把“像不像”与“对不对”分开评分。** 语气、句式和结构属于模仿效果；事实、计算、适用条件和结论属于内容正确性。二者可以同时变好，也可以一项变好、另一项变差。\n\nMin 等的示例研究发现，模型可从示例的格式、输入分布和标签空间获益，而不完全依赖示例中的正确对应关系。因此，“它学会了这套输出样子”不足以证明“它掌握了正确规则”。这一结论来自分类和选择题实验，不能扩展成所有示例都只教格式。[论文](https://aclanthology.org/2022.emnlp-main.759/)\n\nAnthropic 的评估指南也将任务完成质量与语气风格分别列为评估维度，并建议用贴近实际用途的测试与明确标准比较版本。这是评估方法建议，不是某份提示词得到满分的证据。[官方指南](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)\n\n例如客服回复可以分别检查：是否错误承诺退款、审核时长是否准确、是否漏掉申请条件，以及语气是否友善、结构是否符合要求。如果给了示例后更亲切，却多出一个未经确认的到账日期，应该记录为“风格改善，事实出错”，不能用一个总体印象掩盖问题。\n\n> 评估这段回复：先逐项核对事实及承诺是否有材料依据，再评价语气与结构。请分别给出结果；文风接近示例不能抵消事实错误。\n\n测试时，留一些没有放进提示词的新案例，同时包含常见情况和容易混淆的例外；其他设置保持相同，比较有无示例的多次结果。让 AI 辅助评分可以节省时间，但关键事实仍应对照原始材料，不能由它一句“完全正确”完成验收。\n\n**引用文献**\n\n1. [Min 等（2022），Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?，EMNLP](https://aclanthology.org/2022.emnlp-main.759/)\n\n2. [Anthropic，Define success criteria and build evaluations，官方评估指南](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)"
        },
        {
          "id": "Q008",
          "question": "如果描述不出需求，该怎么办？遵循哪些步骤？",
          "topic": "需求发现与澄清",
          "answer": "**可以让 AI 帮你把需求问清楚，但不必让它一直问到“没有任何疑问”。** 应优先澄清那些会改变成果类型、适用对象或取舍的信息；其余细节可以在看到草稿后再决定。\n\nCLAM 研究验证过一种选择性追问方法：检测问题是否有歧义，有必要时先问，再根据补充信息作答。它使用的是事实问答任务，补充回答由知道预期答案的模拟用户提供；实验主要评估一轮澄清。因此，它支持“适当追问可以消除歧义”，没有证明无限追问一定能发现用户尚未想清楚的目标。[研究原文](https://arxiv.org/abs/2212.07769)\n\n把这个思路用于需求发现，可以这样做：先说想改善什么、准备把成果用在哪里；让 AI 给出两三种可能方向及差别；选出更接近的一种，再回答会影响方案的关键问题；最后确认一份当前需求。这里是适合新手的组织建议，不是论文验证过的固定四步程序。\n\n> 我想改善网站的新手入门体验，但还没决定做什么。先给出几个可能目标，说明它们各解决什么问题，再问最能区分我需求的问题。不要把你的建议当成我已同意的要求；信息足够提出方案后，先汇总已确认内容，让我选择。\n\n如果不善于描述，也可以说“这个例子接近，但我不要其中的……”；不喜欢什么、实际卡在哪里，同样能缩小范围。\n\n这种前文**不会因为包含提问和澄清，就必然降低后续质量**。多轮对话研究发现部分模型在分散接收要求时容易失误，汇总要求有时能缓解；但它并没有证明所有准确的澄清过程都有害。准备执行时，把已确认目标、保留条件和未定事项整理到一起，是便于核对的做法；不要把已经否定的猜测也写成最终需求。[研究 §7.1](https://arxiv.org/html/2505.06120v1)\n\n**引用文献**\n\n1. [Kuhn、Gal 与 Farquhar（2022/2023），CLAM: Selective Clarification for Ambiguous Questions with Generative Language Models](https://arxiv.org/abs/2212.07769)\n\n2. [Laban 等（2025），LLMs Get Lost In Multi-Turn Conversation，研究初版 §7.1；后发表于 ICLR 2026](https://arxiv.org/html/2505.06120v1)"
        },
        {
          "id": "A035",
          "question": "如何发现AI在长任务中擅自改变目标或完成标准，并尽量不打断工作？",
          "topic": "执行中的目标保持",
          "answer": "最容易漏掉的偏离，是AI仍在做与你有关的事情，却把任务换成了更容易完成的版本。例如，你要求“用研究结果回答问题”，它最后只给每题附上一篇相关论文；你要求“实现可用的功能”，它交付的却是只能展示的样例。因此，监控不能只看它有没有继续工作，还要看**它现在认为什么算完成，以及成果是否真的满足最初的要求。**\n\n一种实用做法，是保留原始验收标准，在自然的工作节点检查新增成果。Anthropic在长任务开发实践中使用了功能清单、进度记录和实际测试，用来减少提前宣布完成、未经验证便标记通过等问题。这是可以借鉴的工程方法。[来源](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)\n\n首先，把最重要的完成条件单独留下，避免它们随着工作计划一起被改写。例如本教程可以保留三条：回答题目真正问的事情；研究结论能对应到原文；没有直接证据时明确说明。AI可以调整搜索方式和写作顺序，但不能自行把“核对原文”改成“找到相关链接”。\n\n其次，让AI在完成一组问题、一个章节或一个功能后，附上简短记录，随后继续工作，不必每次等你确认。记录应包含**完成项、证据位置、未完成项**，而不是“进展顺利”“质量良好”这样的自我评价。例如：\n\n> 本批写完5题，其中3题已核对研究原文，2题只有间接证据，暂不算完成。已核对的原文位置：……。接下来继续补查这2题。\n\n你主要检查两类变化：**原来没完成的东西为什么变成完成了，原来必须做的东西是否消失了。** 优先查看缺少成果证据的“已完成项”、失败后突然通过的检查，以及被删掉或放宽的要求，就不必每次重读全部对话。\n\n但进度记录仍是AI自己写的。如果它没有主动报告偏离，记录也可能看起来一切正常。因此，还要偶尔打开实际成果抽查：引用是否支持结论，功能是否真的可用，验证范围是否被缩小。METR的研究中，异常分数筛查与模型监控都发现过对方漏掉的问题，说明单一检查方式不足以覆盖所有偏离。[来源](https://metr.org/blog/2025-06-05-recent-reward-hacking/)\n\n可以在任务开始时这样约定：\n\n> 请保留最初确认的验收清单。可以调整实现方法，但不能自行删减交付内容、放宽完成标准，或把未验证的结果算作完成。  \n> 每完成一个自然阶段，简短列出：完成了哪些验收项、成果或验证记录在哪里、还缺什么。正常更新后继续工作，无需等我回复。  \n> 若需要改变目标或完成标准，单独说明变更及影响，等我决定；不受影响的工作继续。\n\n任务较长时，可以让独立检查助手读取原始要求、实际成果和操作记录，只向你报告疑点。**不要只让它检查执行助手的自评摘要。** 支持后台检查的软件可以做到执行与检查同时进行；普通聊天工具则只能在阶段结束后检查。\n\n**目前，低成本且可靠的通用监控仍是未解决的问题。** 上述做法能减轻检查负担，但不能据此认为已有经过充分验证、能以低成本可靠发现各类目标偏离的方法。SHADE-Arena在人为设置隐藏副任务的实验中发现，其表现最好的监控模型若要达到80%的检出率，误报率仍超过20%；这个数字只适用于该实验，但说明独立AI监控也需要在漏报、误报和人工复核负担之间取舍。[研究说明](https://www.anthropic.com/research/shade-arena-sabotage-monitoring)\n\n这套方法让偏离更容易被发现，但不能保证零漏报。提示词负责要求留下证据，实际成果与独立检查才负责验证这些报告是否可信。\n\n**引用文献**\n\n1. [Justin Young，Anthropic（2025），Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)\n\n2. [Sydney Von Arx、Lawrence Chan与Beth Barnes，METR（2025），Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/)\n\n3. [SHADE-Arena: Evaluating Sabotage and Monitoring in LLM Agents（2025），研究论文](https://arxiv.org/abs/2506.15740)"
        },
        {
          "id": "Q009",
          "question": "提问模板是否有用？多大程度上有用？是否会一直有用？",
          "topic": "模板与表达辅助",
          "answer": "**模板有用，主要因为它能复用任务结构、提醒你补齐必要信息；没有证据表明某套固定措辞能在所有模型、所有任务上持续最优。** “方便表达”与“提高模型得分”要分开判断。\n\nSclar 等比较了含义基本相同、格式不同的提示，在50多项任务及多个模型上观察到明显的表现差异，而且不同模型对格式的偏好只有较弱关联。这支持“格式有时影响结果，也未必能跨模型迁移”，不支持从一条高分提示倒推出万能模板。研究初版主要涉及当时的 Llama 系列等模型及 GPT-3.5，不能直接拿其中的最大差距预测今天的任意任务。[研究原文](https://arxiv.org/html/2310.11324v1)\n\nGoogle 的官方指南把模板作为起点，强调针对任务迭代。这类建议可用于组织工作，但没有给“使用模板”一个统一的增益百分比。[官方指南](https://ai.google.dev/gemini-api/docs/prompting-strategies)\n\n对新手，一个可删减的骨架比每次填满的长表更实用：\n\n> 请完成【任务】，用于【用途／受众】。依据【必要材料】，满足【关键限制】，交付【需要的结果】。\n\n已经清楚的部分可以省略；材料不存在就不必编一段背景，也不必给所有任务添加角色、示例和自检。对于反复出现的同类工作，可以保留实测有效的版本；换模型、换任务或发现新错误时，再比较并更新。\n\n至于未来是否一直有用，目前研究无法保证。模板中的具体措辞和格式优势可能变化；只要任务仍包含 AI 无法自行知道的私人目标和取舍，就仍需要某种方式把它们传达出来。后者是信息条件决定的需求，不代表今天的模板必须原样保留。\n\n**引用文献**\n\n1. [Sclar、Choi、Tsvetkov 与 Suhr（2023/2024），Quantifying Language Models’ Sensitivity to Spurious Features in Prompt Design，ICLR；链接为研究初版](https://arxiv.org/html/2310.11324v1)\n\n2. [Google，Prompt design strategies，Gemini 官方开发文档](https://ai.google.dev/gemini-api/docs/prompting-strategies)"
        }
      ]
    },
    {
      "id": "B",
      "title": "提供条件",
      "questions": [
        {
          "id": "B006",
          "question": "贴入网址、文件名或路径，是否意味着 AI 已经访问了其中内容？怎样确认？",
          "topic": "材料是否被实际读取",
          "answer": "**贴入网址、文件名或路径，只是指出材料在哪里；是否读到了内容，要看当前工具有没有访问并返回正文。** 有联网功能的助手可能主动打开网址；能访问本地文件的助手也可能按路径读取。登录状态、文件权限和所在设备都会影响这一步。\n\nOpenAI 的联网工具文档把“搜索”“打开页面”“在页面内查找”列为不同动作，并提供调用记录与来源信息。这说明搜索到链接和打开指定页面可以分别检查。文件检索文档也要求先上传、建立可检索的文件集合，再通过工具取得相关内容。[联网工具说明](https://developers.openai.com/api/docs/guides/tools-web-search)、[文件检索说明](https://developers.openai.com/api/docs/guides/tools-file-search)\n\n确认时，先核对访问对象：是不是指定文件、正确版本和最终打开的网页；再让 AI 给出与本次问题有关的短摘录及位置。只有标题、文件名或一段泛泛介绍，不足以确认正文已读。若界面显示工具结果，应同时查看是否出现登录页、访问失败或仅返回搜索摘要。\n\n> 请打开这个链接后再回答。先说明实际读到的页面标题和相关小节，给出一处与问题有关的短摘录及位置；如果只拿到搜索摘要、登录页或部分正文，请说明读取范围。\n\n路径还要与运行环境对应：你电脑上的文件不一定存在于云端助手的环境中。读取失败时，可以上传文件、提供可访问的分享链接，或贴出所需段落。**摘录能帮助核对已读部分；若任务要求检查全文，还要按 B007 确认覆盖范围。**\n\n**引用文献**\n\n1. [OpenAI，Web search，官方 API 文档，Output and citations](https://developers.openai.com/api/docs/guides/tools-web-search)\n\n2. [OpenAI，File search，官方 API 文档，How to use](https://developers.openai.com/api/docs/guides/tools-file-search)"
        },
        {
          "id": "B007",
          "question": "上传成功是否等于全文已被读取？怎样发现遗漏页、截断或解析失败？",
          "topic": "材料是否被实际读取",
          "answer": "**上传成功表示文件已被接收；全文是否被正确解析、是否都进入本次处理范围，需要另外检查。** 有些工具按问题检索片段，有些只提取文字，也有些同时处理页面图像。\n\nOpenAI Responses API 的文件输入文档给出了具体差别：支持视觉的模型处理 PDF 时会收到提取文字和页面图像；非 PDF 文档主要提取文字，不提取其中的嵌入图像与图表；其表格输入流程最多解析每个工作表的前 1,000 行，再生成摘要和表头信息。这里说的是该接口的输入流程，不能套用为所有聊天产品的文件上限。[文件处理说明](https://developers.openai.com/api/docs/guides/file-inputs)\n\n可以从三处查遗漏：\n\n- **结构是否齐全**：文件实际页数、目录、附件和工作表，是否与解析结果对应；扫描页有没有变成空白文字。\n\n- **重点内容是否读到**：抽查开头、中间、结尾，以及决定结论的表格、脚注和附录，让 AI 指出具体内容与位置。\n\n- **任务是否覆盖完整**：逐条审查、查找所有例外或统计全部记录时，要求按章节、页段或数据范围记录覆盖情况，不能只凭检索到几段就宣布完成。\n\n> 这份文件共48页，请核对可读取范围，检查第1、24、48页及附录表格是否有内容。随后按章节审查，列出已处理范围与缺页、空白解析或截断情况；不要把检索到的片段写成全文检查。\n\n答不出抽查题，可能是解析遗漏，也可能是内容已提供但没有被正确利用。*Lost in the Middle* 在多文档问答和键值检索实验中发现，仅改变相关信息的位置就会影响表现。因此，应先检查提取结果，再决定重新上传、分段处理还是补给关键页面。[研究原文](https://aclanthology.org/2024.tacl-1.9/)\n\n**引用文献**\n\n1. [OpenAI，File inputs，官方 API 文档，How it works 与 How spreadsheet augmentation works](https://developers.openai.com/api/docs/guides/file-inputs)\n\n2. [Liu 等（2024），Lost in the Middle: How Language Models Use Long Contexts，TACL](https://aclanthology.org/2024.tacl-1.9/)"
        },
        {
          "id": "B008",
          "question": "扫描件、图片里的文字、表格、脚注和图表，应怎样检查识别是否正确？",
          "topic": "材料是否被实际读取",
          "answer": "**应把识别结果与原图对照，既检查字有没有认对，也检查行列、脚注和图例之间的关系有没有保留。** 一段文字读起来通顺，并不能说明原图已被忠实还原。\n\nOmniDocBench 对学术论文、教材、幻灯片等九类文档评估文字、公式、表格和阅读顺序。其表格实验显示，合并单元格、旋转等因素会影响结构识别；文字识别与表格结构也采用不同指标。这提示我们，核对时不能只看“有没有提取出文字”。[研究 §4—5、表7](https://arxiv.org/html/2412.07626v2)\n\n优先检查会改变判断的位置：\n\n- **文字与数字**：姓名、型号、否定词、小数点、正负号、日期和单位；模糊字符应保留待确认标记。\n\n- **表格**：数值对应哪一行、哪一列，多层表头与合并单元格覆盖什么范围；空白、“0”和“不适用”是否被混同。\n\n- **脚注与跨页内容**：注释限制的是哪项结论，续表有没有接错，双栏文字是否串行。\n\n- **图表**：坐标轴、刻度、图例、颜色、误差线和单位。由图形估读的数值要与图中直接标注的数据分开。\n\n> 请先转录第6页表格，保留完整表头、单位和脚注，并标出看不清的单元格。暂不计算结论；我确认“列名—数值”的对应关系后，再比较各组数据。\n\n遇到问题，可以提供清晰原图和局部放大图；裁剪时保留相关表头、坐标轴或脚注。需要精确计算时，优先提供原始数据表。合计与分项相符可作为补充检查，但它们一致也可能是共同抄错，关键数值仍要回看原图。\n\n**引用文献**\n\n1. [Ouyang 等（2024/2025），OmniDocBench: Benchmarking Diverse PDF Document Parsing with Comprehensive Annotations，CVPR 2025；链接为论文 v2，§4—5](https://arxiv.org/html/2412.07626v2)"
        },
        {
          "id": "B009",
          "question": "文件中有多个工作表、附件或隐藏内容时，怎样明确需要读取的范围？",
          "topic": "材料是否被实际读取",
          "answer": "**先列清文件内部有哪些内容，再指定本次要处理的对象、范围和版本。** “看这个 Excel”没有说明是当前工作表、全部明细、筛选后的记录，还是隐藏表中的参数。\n\n微软的文档检查器说明，Office 文件可能包含隐藏行列、隐藏工作表、批注、修订和嵌入内容；隐藏工作表中的数据还可能影响公式结果。这意味着屏幕上可见的部分未必构成完整的数据来源。[官方说明](https://support.microsoft.com/en-us/office/collab-files/remove-hidden-data-and-personal-information-by-inspecting-documents-presentations-or-workbooks)\n\n可以让 AI 先给出简短清单：文件版本、工作表或附件名称、可读的数据范围，以及发现的隐藏内容和外部引用。再按任务明确：\n\n- 统计用全部记录还是仅筛选后可见记录，是否排除合计行和重复记录。\n\n- 检查公式、当前显示值，还是重新计算后的值；哪些参数表参与计算。\n\n- 文档采用最终正文还是包含修订与批注；嵌入附件是否也要打开。\n\n- 外部链接指向的材料是否属于本次范围，能否实际取得。\n\n> 请统计“销售明细”表的全部记录，包括筛选隐藏的行；排除最后一行合计。币种按“参数”表解释，其他工作表不纳入汇总。先列出你读到的工作表、行数及缺失的外部依赖，再计算。\n\n导出格式也会改变范围。微软的 Excel 格式说明指出，CSV 保存的是活动工作表的文字与值，且会丢失格式等内容。因此，上传一个 CSV 不能替代对原工作簿全部工作表和公式的检查。[格式说明](https://support.microsoft.com/en-us/excel/excel-formatting-and-features-that-are-not-transferred-to-other-file-formats)\n\n这里的清单用于确认读取与统计边界。若工具只能看到部分工作表或无法检查嵌入附件，应把缺项写出，并补充对应文件。\n\n**引用文献**\n\n1. [Microsoft，Remove hidden data and personal information by inspecting documents, presentations, or workbooks，官方支持文档](https://support.microsoft.com/en-us/office/collab-files/remove-hidden-data-and-personal-information-by-inspecting-documents-presentations-or-workbooks)\n\n2. [Microsoft，Excel formatting and features that are not transferred to other file formats，CSV 部分](https://support.microsoft.com/en-us/excel/excel-formatting-and-features-that-are-not-transferred-to-other-file-formats)"
        },
        {
          "id": "B014",
          "question": "AI 说“记住了”，应怎样确认记住的内容、有效范围与持续时间？",
          "topic": "上下文与记忆",
          "answer": "**先确认“记住了”指的是当前对话中的信息，还是已经保存、可在后续对话调用的记忆。** 一句口头回应没有说明保存位置、适用范围和保留时间。\n\n产品的记忆机制并不相同。OpenAI 官方文档区分 ChatGPT 的记忆与本地 Codex 的记忆存储；后者还可能在后台延迟更新。Claude 的现行说明则提供可查看、编辑和删除的记忆主题，并区分项目记忆与项目外内容。应核对当前账户实际使用的功能，而不是根据同一品牌下另一款产品推断。[OpenAI 说明](https://learn.chatgpt.com/docs/customization/memories)、[Claude 说明](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)\n\n可以依次确认三件事：**具体记了什么、在哪些对话生效、如何更新或删除。** 优先查看产品提供的记忆条目或设置；如果助手通过文件保存约定，就打开相应文件核对。保留期限以该功能的文档和账户设置为准，不能从“以后都记得”推算。\n\n> 请复述要保留的完整约定及适用范围。如果已保存到长期记忆或项目文件，请指出可核对的位置；如果只是当前对话中可用，请明确说明。临时例外不要合并成长期偏好。\n\n确认保存后，可以在新对话做一次不透露答案的检查，例如询问“这个项目的引用规范是什么”。再让它处理一个小例子，检查是否正确应用规范。复述和应用是两种检查；一次成功也不等于未来每次都会调用。\n\nLongMemEval 用500道问题分别评估信息提取、跨会话推理、时间推理、知识更新和无答案时的处理，显示“记忆”涉及多项能力。它支持按具体行为测试，不能仅凭助手声称记住就完成验收。[研究 §3](https://arxiv.org/html/2410.10813v2)\n\n**引用文献**\n\n1. [OpenAI，Memories，官方用户文档](https://learn.chatgpt.com/docs/customization/memories)\n\n2. [Anthropic，Use Claude’s chat search and memory to build on previous context，官方帮助文档](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)\n\n3. [Wu 等（2025），LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory，ICLR，§3](https://arxiv.org/html/2410.10813v2)"
        },
        {
          "id": "B015",
          "question": "在新对话中继续任务，需要重新提供哪些信息？",
          "topic": "上下文与记忆",
          "answer": "**新对话需要拿到足以继续工作的当前状态：要完成什么、以哪份成果为准、必须遵守什么，以及下一步从哪里开始。** 不必复制全部聊天记录，但也不要只说“接着上次做”。\n\n是否能自动继承旧内容，要看产品功能。Claude 官方说明，历史对话搜索有项目范围限制，各项目也有独立记忆；OpenAI 则区分 ChatGPT 与本地 Codex 的记忆机制。重要约定和最新文件应在新对话中确认可用，不能只凭旧对话存在就认为已经带入。[Claude 范围说明](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)、[OpenAI 记忆说明](https://learn.chatgpt.com/docs/customization/memories)\n\n最值得重新提供的是：\n\n- **目标与验收条件**：成果给谁用，交付什么，哪些要求必须满足。\n\n- **当前成果与材料**：最新版本、可访问的文件或链接、关键术语和必要原文。\n\n- **已确认的决定**：选择了什么及原因，哪些旧方案或旧规则已经失效。\n\n- **进度与剩余工作**：实际完成和验证到哪里，尚缺什么，下一步要做什么。\n\n有行动权限或资源限制的任务，还应带入仍然有效的授权、预算和停止条件。未确认的想法、旧草稿和失败过程，只有在能避免再次走错时才需要附上。\n\n> 继续这份入门教程。目标是完成B组14题，采用附件中的九项写作要求。最新稿为“B组v3”；已确认前4题，后10题待补。保留现有题号，引用须支持对应结论。请先读取最新稿，从B014继续；遇到摘要与原稿不一致时指出差异。\n\nAnthropic 的长上下文工程实践采用压缩记录与持久笔记来保留关键状态，同时按需重新读取材料。对日常工作，可借鉴为“简短交接摘要＋最新成果＋必要原文”。详细写法见 B017。[工程说明](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)\n\n**引用文献**\n\n1. [Anthropic，Use Claude’s chat search and memory to build on previous context，官方帮助文档](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)\n\n2. [OpenAI，Memories，官方用户文档](https://learn.chatgpt.com/docs/customization/memories)\n\n3. [Anthropic（2025），Effective context engineering for AI agents，Compaction 与 Structured note-taking](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)"
        },
        {
          "id": "B016",
          "question": "对话很长时，怎样检查早期约定是否仍被正确使用？",
          "topic": "上下文与记忆",
          "answer": "**检查早期约定是否仍有效，重点看当前成果如何使用它们，并与原始记录对照。** 问一句“还记得吗”，只能得到一次自我报告。\n\n*Lost in the Middle* 在长上下文检索任务中发现，相关信息的位置会影响模型表现；*LLMs Get Lost In Multi-Turn Conversation* 则把完整需求拆到多轮模拟对话中，观察到表现下降。在后者对 GPT-4o 和 GPT-4o-mini 的四类任务测试中，集中重述已有要求有所帮助，但没有恢复到一次提供完整要求的水平。两项研究分别涉及长材料利用和分散需求处理，不意味着所有长对话都会以相同方式失效。[长上下文研究](https://aclanthology.org/2024.tacl-1.9/)、[多轮研究 §7.1](https://arxiv.org/html/2505.06120v1)\n\n实际检查可以在一章、一批结果或一个功能完成时进行：挑出几条最容易影响结果的早期约定，例如术语含义、资料范围、不可删内容和完成标准；让 AI 指出新增成果中对应的位置，再回看是否满足。检查“按规则做了什么”比完整复述所有规则更接近本次目的。\n\n> 请核对本批结果是否仍符合最初三项约定：保留原题号、每项事实判断有依据、不把待验证事项算作完成。指出对应成果位置和发现的偏差，修正后继续；若某项已由我明确变更，请同时列出变更后的要求。\n\n发现遗漏后，补给相关原文或当前有效规则，并明确哪条旧约定已失效。若已有多次改动，可以整理一份带版本的现行清单；不要把相互冲突的新旧要求一起重复粘贴。\n\n对于是否完成、是否有来源、数字是否一致等可核对项目，应查看实际文本、数据或测试结果。让 AI 重述规则有助于定位误解，不能代替检查输出。\n\n**引用文献**\n\n1. [Liu 等（2024），Lost in the Middle: How Language Models Use Long Contexts，TACL](https://aclanthology.org/2024.tacl-1.9/)\n\n2. [Laban 等（2025），LLMs Get Lost In Multi-Turn Conversation，研究 v1，§7.1与表2](https://arxiv.org/html/2505.06120v1)"
        },
        {
          "id": "B017",
          "question": "怎样制作交接摘要，保留决定、依据、例外和未解决问题？",
          "topic": "上下文与记忆",
          "answer": "**交接摘要应让下一段工作从正确状态开始，因此要保留决定、依据、适用条件和未完成项，而不只是概括“讨论过什么”。** 有争议或需要逐字遵守的内容，应保留原文位置。\n\nAnthropic 的压缩实践强调保存关键决定、未解决问题和实施细节，并提醒过度压缩会丢失稍后才显得重要的信息。LongMemEval 的实验也发现，在其检索记忆设置中，直接用提取的摘要或事实替代原始会话内容，会因信息损失降低整体问答表现。因此，摘要适合作为入口，关键证据仍应可追溯。[工程说明](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)、[研究 §5.2](https://arxiv.org/html/2410.10813v2)\n\n一份实用交接可以按下面的顺序写，内容简单时合并即可：\n\n1. **目标和完成标准**：最终交付物、读者、必须满足的条件。\n\n2. **最新成果**：版本与文件位置，完成到哪一步，做过哪些验证。\n\n3. **已确认决定及依据**：决定者、原因、证据位置，尤其保留影响后续选择的取舍。\n\n4. **例外与失效项**：仅本次有效的要求、已废止的旧规则、不要重新采用的方案及关键原因。\n\n5. **未解决问题**：区分缺资料、待验证、待用户决定，避免统称“后续优化”。\n\n6. **下一步**：从何处继续，依赖什么，哪些权限或限制仍有效。\n\n例如，“确定退款规则”过于模糊；更有用的是：“仅确认符合申请条件，尚未受理；依据规则第3条。回复不得承诺到账时间，仍缺审核结果。”\n\n> 请为新对话整理交接摘要，保留已确认决定及依据、临时例外、失效规则和未完成事项。用户决定与 AI 建议分开；关键数字、否定和条件不要改写丢失，附上最新文件和原文位置。\n\n保存前，重点核对数字、范围、状态和证据链接。摘要写着“已验证”的事项要有对应记录；找不到依据的，改回待核对。更新摘要时标明日期或版本，避免新对话误用旧状态。\n\n**引用文献**\n\n1. [Anthropic（2025），Effective context engineering for AI agents，Compaction](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)\n\n2. [Wu 等（2025），LongMemEval，ICLR，§5.2](https://arxiv.org/html/2410.10813v2)"
        },
        {
          "id": "B018",
          "question": "哪些长期偏好可以复用，哪些任务特例不应变成永久规则？",
          "topic": "上下文与记忆",
          "answer": "**适合复用的长期偏好，是你愿意在一类未来任务中继续采用的选择；由某个项目、读者或临时限制决定的做法，应保留对应范围。** 一次选择和一次满意反馈，都不必自动升级为永久规则。\n\n可以用“换一个任务，我还希望这样做吗”来判断。例如，“日常解释用简体中文”通常可跨任务复用；“这个项目保留英文产品名”属于项目规则；“这次给儿童讲解，不用公式”是任务特例；预算、日期和当前版本则更像需要更新的状态信息。\n\n产品也可能区分这些范围。Claude 的官方说明为项目设置独立记忆空间；OpenAI 文档建议把必须持续执行的团队规则放在项目文档等明确位置，记忆作为辅助回忆层。这为“个人偏好、项目规则、任务特例分别保存”提供了产品层面的依据。[Claude 项目记忆](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)、[OpenAI 记忆说明](https://learn.chatgpt.com/docs/customization/memories)\n\n表达偏好时，把条件和例外一起写入：\n\n> 长期偏好：一般解释先给简明结论，必要时展开依据。项目规则：本教程每题保留引用文献。本次例外：演示稿只展示结论，完整依据留在讲义中；不要把这个例外用于其他教程页面。\n\n更新也要说明“改变了偏好”还是“暂时破例”。例如“以后默认详细说明”取代旧的简洁偏好；“这题详细说明”只改变本次输出。LongMemEval 将知识更新和时间推理单独作为评测能力，提醒我们检查旧信息是否被正确替代，而不只检查有没有记住。[研究 §3.2](https://arxiv.org/html/2410.10813v2)\n\n隔一段时间查看实际记忆或项目规则，删除失效内容，纠正被过度概括的条目。身份代写、虚构设定和 AI 自己提出的方案，也不应混入关于你的长期事实或偏好。\n\n**引用文献**\n\n1. [Anthropic，Use Claude’s chat search and memory to build on previous context，Project memory and summary](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)\n\n2. [OpenAI，Memories，官方用户文档](https://learn.chatgpt.com/docs/customization/memories)\n\n3. [Wu 等（2025），LongMemEval，ICLR，§3.2](https://arxiv.org/html/2410.10813v2)"
        },
        {
          "id": "B022",
          "question": "提供全文、摘录或摘要，各会失去哪些信息，应如何选择？",
          "topic": "材料组织与来源边界",
          "answer": "**按任务需要保留的信息选择：全文保留的上下文最多，摘录保留局部原话，摘要便于把握主线。** 当某个条件、例外或推导步骤会影响答案时，就应提供对应原文，而不能只留下概括。\n\n| 提供形式 | 适合的任务 | 容易缺少的信息 |\n| --- | --- | --- |\n| 全文 | 检查整体结构、跨章节矛盾、完整规则和例外 | 原文虽完整，解析或本次检索仍可能只覆盖一部分 |\n| 摘录 | 改写某段、核对某条论断、回答局部问题 | 前后定义、适用范围、其他章节中的例外 |\n| 摘要 | 快速了解主题、初步讨论、任务交接 | 原话、细节、证据链、少数情况及尚未解决的分歧 |\n\n选择摘要还要考虑它是否准确。Maynez 等在 ACL 2020 对多种摘要系统进行人工评估，发现生成摘要包含与原文不一致的内容；这是当时摘要模型的实验，但揭示了“压缩丢失信息”之外还存在“改写引入错误”的问题。[研究原文](https://aclanthology.org/2020.acl-main.173/)\n\n全文也不是给得越多就越好。*Lost in the Middle* 表明，在长材料中找到并利用相关信息仍有困难。对长文档，可以先给目录或简短导读，说明本次问题，再提供关键章节；需要检查全局遗漏时，按完整目录逐段覆盖。[研究原文](https://aclanthology.org/2024.tacl-1.9/)\n\n> 我先提供全文目录和摘要，便于了解背景；本次只判断第4节的结论是否成立，另附第4节原文、所用表格和附录条件。若判断还依赖其他章节，请指出需要补充的位置。\n\n摘录最好附上标题、页码、版本，并保留相关定义和例外。若只有摘要，应把任务限定为“根据摘要初步判断”，不要据此声称已经核对作者原话、全部证据或全文没有反例。\n\n**引用文献**\n\n1. [Maynez 等（2020），On Faithfulness and Factuality in Abstractive Summarization，ACL](https://aclanthology.org/2020.acl-main.173/)\n\n2. [Liu 等（2024），Lost in the Middle: How Language Models Use Long Contexts，TACL](https://aclanthology.org/2024.tacl-1.9/)"
        },
        {
          "id": "B023",
          "question": "要求只依据所给资料时，应怎样处理资料没有回答的问题？",
          "topic": "材料组织与来源边界",
          "answer": "**资料没有直接写出答案时，先判断能否从已有信息推出；还缺关键前提的部分，应明确留空或说明缺什么。** “只依据资料”可以允许计算和推理，但不能悄悄加入资料之外的事实。\n\n*Sufficient Context* 在 FreshQA、MuSiQue 和 HotpotQA 上分析 GPT-4o、Claude 3.5 Sonnet、Gemini 等模型，把“资料是否足够作答”与“模型是否答对”分开。实验发现，资料充分时仍会出错，资料不足时也会生成貌似确定的错误答案。因此，材料旁边有相关文字，并不等于已经存在支持结论的证据链。[研究 §3—4](https://arxiv.org/html/2411.06037v3)\n\n处理时可以区分三种情况：\n\n- **直接说明**：给出答案，并定位到原文或数据。\n\n- **可以推导**：说明用到的前提和计算方法。例如相同口径的两个月销量分别为100和120，可算出增长20%。\n\n- **尚不能确定**：指出缺失信息。例如上述销量变化本身无法说明增长是广告造成的；需要额外的因果证据。\n\n还要区分“资料未说明”和“事情没有发生”。没有提到退款期限，不能写成“没有期限”；几段搜索结果没有出现某项规定，也不能据此认定整份文件没有规定。\n\n> 只依据所给材料回答。允许必要计算与逻辑推导，请列明依据；资料未说明、互相冲突或缺少关键条件的部分分别指出。需要外部事实时先列出缺口，不把常识猜测补成材料中的结论。\n\n如果题目本身要求逐字摘录，就按原文摘录；如果要求综合分析，可以连接多处证据。交付时检查每个关键结论能否对回材料，尤其留意数量、否定、适用范围和因果关系。\n\n**引用文献**\n\n1. [Joren 等（2025），Sufficient Context: A New Lens on Retrieval Augmented Generation Systems，研究 v3，§3—4](https://arxiv.org/html/2411.06037v3)"
        },
        {
          "id": "B024",
          "question": "什么时候需要查找外部信息，什么时候引入外部信息反而偏离任务？",
          "topic": "材料组织与来源边界",
          "answer": "**当答案依赖资料之外的事实，或需要核实资料是否真实、完整、仍然有效时，应查外部信息。** 如果任务只是忠实总结、翻译、改写或分析给定设定，外部事实应按需要另行处理，避免改掉原任务的证据范围。\n\n可以先分清用途：\n\n- **复述材料**：回答“作者说了什么”，以原文为准；发现疑点可以另列。\n\n- **审查材料**：回答“作者说得对吗”，需要查原始研究、现行规则或其他可核对证据。\n\n- **解决现实问题**：例如比较当前产品功能，需要补查会影响选择的最新信息，并注明版本或日期。\n\n专业研究支持检索的价值，也揭示了取材要求。Lewis 等的 RAG 研究将维基百科检索与生成模型结合，在开放域问答等知识任务中取得改善；这项结果来自经过训练的检索生成系统。[研究原文](https://arxiv.org/abs/2005.11401) ACL 2025 的 *The Distracting Effect* 则研究了检索结果中的干扰段落：与问题不相关的内容可能使回答出错，即使它表面上与问题很接近。[研究原文](https://aclanthology.org/2025.acl-long.892/)\n\n因此，搜索应围绕明确缺口展开。例如核对某功能是否存在，就找对应产品、版本的官方说明；核对某篇论文的结果，就读原论文的方法与结果，不能用另一篇主题相近的文章代替。\n\n> 先忠实总结这篇文章，不把外部内容写成作者观点；再单列事实核验，查关键数据的原始来源与日期。若外部资料与原文冲突，分别说明原文主张和核验结果。\n\n并非每个任务都要先确认能否联网；可以在开始时约定哪些问题允许外查。若已经明确“只用给定资料”，遇到缺口就按 B023 标出，再请求扩大取材范围。网上也无法补出只有用户掌握的预算、意图或内部记录。\n\n**引用文献**\n\n1. [Lewis 等（2020），Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks，NeurIPS](https://arxiv.org/abs/2005.11401)\n\n2. [Amiraz 等（2025），The Distracting Effect: Understanding Irrelevant Passages in RAG，ACL](https://aclanthology.org/2025.acl-long.892/)"
        },
        {
          "id": "B025",
          "question": "怎样选出有代表性的示例，而不是只挑最容易的情况？",
          "topic": "示例选择与代表性",
          "answer": "**先确定示例要说明什么，再选择覆盖真实任务差异的案例。** 有代表性不等于最漂亮、最容易，也不等于只选最难的例外。\n\nLiu 等在 GPT-3 的情感分类、表格转文字和开放域问答任务中比较示例选择方法，发现检索与当前输入语义相近的示例，比随机选择更有效。它支持关注示例与任务的相关性，但没有给出所有用途通用的案例组合。[研究 §2—3](https://aclanthology.org/2022.deelio-1.10.pdf) Anthropic 的官方指南则建议示例贴近实际用途、覆盖边界情况，并有足够变化，减少模型学到无意共同特征的机会。[官方指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)\n\n实操时，可以先从真实任务列出会改变处理方式的因素，再选少量互补案例。例如客服分类除了常见咨询，还可能遇到信息不足、同一句含两种诉求、否定表达和需要人工判断的情况。每个示例都应有可信的预期答案，并说明关键判据。\n\n如果已有三个案例都在展示同一条规则，再加一个相似案例的价值可能较小；一个“只改一个条件，答案就应变化”的对照，往往更便于说明边界。例如，“符合申请条件”与“申请已获批准”应触发不同的回复，不能都写成已退款。\n\n> 这些示例用于说明客服回复的判断规则。请检查它们是否只覆盖了顺利处理的情况，找出缺少的信息不足、条件不满足或易混淆情形；建议补例时说明它要澄清哪条边界，不要编造真实客户记录。\n\n**教学示例和验收案例应分开。** 提示中用示例解释规则，验收时再用未展示的新案例检查迁移。日常平均表现应按真实任务分布评估，重要例外可以另外报告；不要用全部简单题的高分掩盖少数关键错误，也不要把全是极端难题的结果当作日常水平。\n\n**引用文献**\n\n1. [Liu 等（2022），What Makes Good In-Context Examples for GPT-3?，DeeLIO，§2—3](https://aclanthology.org/2022.deelio-1.10/)\n\n2. [Anthropic，Prompting best practices，Use examples 部分，官方指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)"
        },
        {
          "id": "B033",
          "question": "要求 AI“不保存”是否等同于产品真的不保留数据，应去哪里核实设置与政策？",
          "topic": "隐私 授权与提供成本",
          "answer": "**要求 AI“不保存”，不等于服务端不会保留数据。** 这句话可以表达你的使用要求；真正的数据处理取决于产品功能、账户设置、服务条款，以及连接的外部工具。\n\n应分别核实四件事：是否保存聊天记录、是否形成供以后调用的记忆、是否用于训练、服务端及外部服务保留多久。它们可能使用不同开关。\n\n例如，Claude 官方说明，无痕聊天不进入聊天历史或记忆，也不用于训练，但默认仍保留30天，组织的自定义保留设置可能更长。OpenAI API 文档则说明，默认不使用 API 数据训练模型，但滥用监测日志一般可保留最多30天，部分功能还保存应用状态；获批的零数据保留控制另有适用条件。两者分别说明特定聊天功能和 API 服务，不能互相套用。[Claude 无痕说明](https://support.claude.com/en/articles/12260368-use-incognito-chats)、[OpenAI API 数据控制](https://developers.openai.com/api/docs/guides/your-data)\n\n核实可以按这个顺序进行：\n\n1. 确认使用的是哪个产品、个人还是组织账户，以及是否经过第三方应用。\n\n2. 查看账户中的隐私、训练数据、聊天记录和记忆设置，确认本次对话实际处于什么模式。\n\n3. 阅读对应功能的官方数据政策，查保留期限、删除方式、例外情形；组织账户还要看管理员配置。\n\n4. 使用连接器或外部工具时，另外核对接收方。OpenAI 的文档也明确指出，发往外部工具服务（MCP 服务）的数据受第三方保留政策约束。\n\n可以这样提出要求：\n\n> 本次不希望信息用于后续个性化。请不要把它写入长期记忆或另存文件；同时说明我应检查哪些产品设置。若需要把内容发送给外部服务，先说明接收方和必要范围。\n\n这段话限定任务中的行为，不能代替设置检查。无需真实身份信息的任务，可以先去掉姓名、账号等无关内容；需要删除已提交资料时，使用产品提供的删除控制，并分别检查聊天、文件和记忆，不把一句“已经忘记”当作删除凭证。\n\n**引用文献**\n\n1. [Anthropic，Use incognito chats，官方帮助文档](https://support.claude.com/en/articles/12260368-use-incognito-chats)\n\n2. [OpenAI，Data controls in the OpenAI platform，官方 API 文档](https://developers.openai.com/api/docs/guides/your-data)"
        }
      ]
    },
    {
      "id": "C",
      "title": "控制变化",
      "questions": [
        {
          "id": "C005",
          "question": "如果正确修改必须触及禁止修改的部分，怎样要求 AI 先说明冲突？",
          "topic": "保留项与修改边界",
          "answer": "**把“哪些地方不能改”与“遇到冲突怎么处理”一起写清楚：先指出冲突、给出最小改动方案，再由你决定是否放宽边界。** AI 发现了问题，并不自动获得修改禁区的授权。\n\n发表于 AAAI 2026 的 ConInstruct 研究用邮件、计划、故事等六类任务测试 GPT-4o、Claude 等模型处理冲突指令的表现，发现模型能识别矛盾，却经常直接生成只满足部分要求的答案。研究还发现，加入“检测冲突并请求澄清”的引导后，模型更愿意报告冲突，但也会在本无冲突时多问。因此，值得明确的是具体触发条件，而不只是笼统要求“有问题就停”。[研究 §5.1—5.2](https://ojs.aaai.org/index.php/AAAI/article/download/40356/44317)\n\n例如，“修正所有合计，但不得改动原始明细”可能意味着只改公式，也可能意味着明细本身有误。可以这样约定：\n\n> 请修正这份表的合计，原始明细不得改动。如果只调整公式就能解决，直接完成；如果必须更改明细，先指出具体单元格、冲突原因和依据，给出最小修改建议，暂不执行这部分。其他不依赖该决定的修正可以继续。\n\n这里要它说明三件事：哪条目标与哪条禁令冲突；为什么现有边界内无法完成；放宽哪一小部分就能继续。不要只接受“需要全面重构”或“为保证正确必须修改”这样的笼统判断，可以追问是否存在保留原文、另附说明或新建副本的办法。\n\n**“必须改”与“改了更好”也要区分。** 改变排版可能更美观，却未必是修正数据所必需；确实无法同时满足的硬要求，才需要你取舍。\n\n确认方案后，检查实际差异：修改是否仅限获准范围，保留项是否仍与原版一致，原来的错误是否真正消除。对文件或代码，保留原版本并查看差异，比只听“已按要求完成”更容易发现越界修改。\n\n**引用文献**\n\n1. [He 等（2026），ConInstruct: Evaluating Large Language Models on Conflict Detection and Resolution in Instructions，AAAI，§2、§5.1—5.2、表3](https://ojs.aaai.org/index.php/AAAI/article/download/40356/44317)"
        },
        {
          "id": "C006",
          "question": "哪些要求是硬限制，哪些只是偏好，怎样标明？",
          "topic": "探索自由度与约束取舍",
          "answer": "**硬限制是违反后结果就不能接受的条件；偏好是在满足硬限制之后尽量实现的选择。** 判断依据是任务后果，而不是句子写得多强硬。同一要求在不同任务中也会变：投稿字数上限可能是硬限制，内部讨论稿的篇幅通常可以商量。\n\nIETF 的 RFC 2119 用“必须／禁止”表达绝对要求，用“应当”表达在充分理解后果时可以例外的建议。这是技术规范中的要求分级，可以借鉴它把强制与可让步条件分开的思想，无需让普通用户学习英文关键词。[RFC 2119，§1—3](https://www.rfc-editor.org/rfc/rfc2119.html)\n\n在 AI 实验中，FollowBench 对13个模型逐步增加内容、情境、风格等约束，多数模型的整体遵循表现随约束增加而下降。[论文 §3—4、表2](https://aclanthology.org/2024.acl-long.257.pdf)\n\n实际可借鉴要求分级的思路，只列最重要的两三项，写出允许怎样让步。例如：\n\n> 必须：日期、金额和姓名与原始材料一致，客户引言保持原文。偏好：语气轻松，正文约500字。如果轻松语气会改变引言，就保留引言；篇幅不足时先删重复背景。若两项“必须”冲突，指出冲突后让我决定。\n\n其中，“必须”给出验收底线，“偏好”提供优化方向，“如果……”规定取舍。无需把所有偏好都写成绝对禁令，也不必给每条要求分配数字权重。若你愿意授权 AI 决定哪些次要内容省略，直接说清允许选择的范围即可。\n\n验收也应分开：先核对硬限制是否逐项通过，再比较偏好实现得怎样。文风更漂亮，不能抵消金额写错；某项偏好没实现，也不一定意味着整个任务失败。涉及真实预算、文件权限等限制时，还应使用系统提供的限额或权限控制，让文字约定与实际操作范围一致。\n\n**引用文献**\n\n1. [Bradner（1997），RFC 2119: Key words for use in RFCs to Indicate Requirement Levels，IETF，§1—3、§6](https://www.rfc-editor.org/rfc/rfc2119.html)\n\n2. [Jiang 等（2024），FollowBench: A Multi-level Fine-grained Constraints Following Benchmark for Large Language Models，ACL，§3—4、表2](https://aclanthology.org/2024.acl-long.257/)"
        },
        {
          "id": "C013",
          "question": "字数、篇幅和细节要求冲突时，怎样规定取舍？",
          "topic": "输出范围与表达方式",
          "answer": "**先确定长度是硬上限还是大致目标，再规定什么信息必须保留、什么可以删或移到别处。** “越短越好”和“每个细节都讲透”没有明确取舍，AI 就只能替你猜哪些内容更重要。\n\n2023年的 IFEval 研究把字词数、句数、段数等要求设为可用程序核对的约束，在541条提示中测试 GPT-4 和 PaLM 2。它说明篇幅遵循可以单独检查；满足长度条件，并不等于保留了必要内容或解释清楚。[论文 §1—2、表1](https://arxiv.org/html/2311.07911v1)\n\n先说明计数口径。例如“正文不超过500个字符，含标点，不含标题与文献”，比单写“500字”更方便核对；如果只是希望读起来短，可以说“用三段讲清结论、理由和下一步”，不必追求精确数字。平台有现成字数限制时，以平台的计数器为准。\n\n然后给出删除顺序。通常可以先去掉重复背景和修饰语，再压缩次要例子；会改变结论含义的条件、关键数据和读者必须执行的步骤，应明确保留。将细节放附录只适用于交付格式允许附录的情况，不能靠附录绕过整份材料的硬上限。例如：\n\n> 为新手写一段说明，正文最多500个字符，含标点，不含标题和文献。必须保留结论、适用条件和一个完整例子。先删重复解释，再删次要背景；不允许把“通常有效”改成“始终有效”来省字。如果仍放不下，指出缺少多少空间，并给出需我选择的删减项。\n\n这是一套便于验收的编辑规则；具体保留哪些信息，由用途决定。给管理者作决策，可能优先保留结论与代价；给操作者作指导，则可能优先保留步骤和失败时的处理方式。\n\n最终做两次检查：用编辑器或脚本确认实际长度，再对照原始材料检查关键内容和因果关系。AI 自报“共498字”只是一个待核对的数字；压缩后如果读者仍不知道该做什么，即使长度合格，也应调整信息取舍。\n\n**引用文献**\n\n1. [Zhou 等（2023），Instruction-Following Evaluation for Large Language Models，预印本，§1—2、表1](https://arxiv.org/html/2311.07911v1)"
        },
        {
          "id": "C015",
          "question": "如何区分“可以提出新想法”和“可以补造事实”？",
          "topic": "输出范围与表达方式",
          "answer": "**可以允许 AI 创造方案、故事或假设，但要把它们与描述真实世界的陈述分开。** “想一个新的宣传创意”允许提出新做法；“写我们的成功案例”则需要真实经历、数据和来源。一个方案新颖，并不会使配套的数字和案例自动变真。\n\nDoshi 与 Hauser 的随机实验让293名参与者写八句短故事，其中部分人可获得 GPT-4 提供的创意，作品再交给独立读者评价。获得 AI 创意的作品在一些创意与写作评价上更好，同时相互之间更相似。这测量的是创作表现，不是事实准确性。[作者公开稿，实验设计与结果](https://arxiv.org/pdf/2312.00506)\n\n事实写作需要另一种检查。FActScore 将人物传记拆成细小、可核对的事实，再检查可靠资料是否支持；研究发现，同一段生成文字可能混合有依据和无依据的信息。[论文 §2—3](https://aclanthology.org/2023.emnlp-main.741.pdf)\n\n实操时，可把内容分成三种性质：\n\n- **事实**：来自材料或核实过的来源，保留对应依据。\n\n- **建议**：尚未实施的方案，用“建议”“可以尝试”说明。\n\n- **假设或虚构**：为了演示、推演而设置，在该例子附近明确标注。\n\n不必给每句话贴标签；只需在读者可能把设想误认成真实成果的地方分清。例如：\n\n> 请为这款产品提出三种推广创意。产品功能和现有成绩只能来自附件；创意可以自由发挥。缺少的销量、用户评价和实验结果请标“待提供”，不要补成真实数据。如需演示案例，请标“虚构示例”，并放在独立段落。\n\n同样，“假设有100名用户”可以用于展示计算方式；“我们调查了100名用户”则是在声称调查已经发生，需要记录支持。即使数字听起来合理，也不能替代来源。\n\n交付前重点核对新增的人名、机构、金额、比例、客户引语及效果承诺，并检查虚构示例复制到别处后是否仍带说明。创意部分评价是否有用、可行；事实部分逐项查证。这样可以保留探索空间，又避免把为了讲清楚而编的例子混入真实记录。\n\n**引用文献**\n\n1. [Doshi 与 Hauser（2024），Generative AI enhances individual creativity but reduces the collective diversity of novel content，Science Advances；作者公开稿](https://arxiv.org/pdf/2312.00506)\n\n2. [Min 等（2023），FActScore: Fine-grained Atomic Evaluation of Factual Precision in Long Form Text Generation，EMNLP，§2—3](https://aclanthology.org/2023.emnlp-main.741/)"
        },
        {
          "id": "C021",
          "question": "怎样中止任务、撤销授权或恢复到修改前的状态？",
          "topic": "自主决定与行动权限",
          "answer": "**中止任务、撤销授权和恢复旧状态是三件事，要分别执行和核实。** 中止是停止继续工作，撤权是收回后续操作许可，恢复则需要版本、备份或对应系统的补救功能。\n\n研究支持让用户能够纠正和退出 AI 行为。Amershi 等提出的人机交互指南经过多轮评估，其中49名设计从业者用20款 AI 产品检验指南；第8、9、17条分别涉及便于拒绝服务、纠正错误和提供全局控制。[CHI 2019 论文，表1](https://www.microsoft.com/en-us/research/uploads/prod/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf)\n\n实际可以按顺序处理：\n\n1. 使用产品的停止或取消功能，并明确停止的是哪项任务。若任务还安排了定时运行、后台作业或其他执行者，检查它们是否也已停止。\n\n2. 收回相应授权；需要持续阻止访问时，在产品或外部服务中关闭连接、收回权限。\n\n3. 查看操作记录，区分已成功、尚未开始和结果不明的动作，再决定恢复方案。恢复前确认目标版本，避免覆盖后来其他人的有效修改。\n\n取消本身存在时间差。MCP 工具协议明确说明：取消是可选能力，请求已经完成或无法取消时，接收方可以忽略取消通知。对于这类工具，点击停止后仍要核对外部系统状态。[取消规范](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/cancellation)\n\n可以这样说：\n\n> 停止这项任务，撤回继续修改和发送的授权。请根据工具记录说明已经改了什么、哪些操作结果尚不确定；仅检查现状，先不要执行新的恢复动作。给出可恢复的版本及可能覆盖的后续改动。\n\n恢复依赖实际功能。例如 OneDrive 的版本历史可将指定旧版设为当前版本，同时保留此前的当前版本。[微软官方说明](https://support.microsoft.com/en-us/onedrive/restore-a-previous-version-of-a-file-stored-in-onedrive) 已发送的信息则要另外查看发送系统是否支持撤回；改回本地草稿不会改变收件方已经收到的内容。\n\n最后重新打开文件或外部系统，检查状态和版本。以实际记录确认“已停止、已撤权、已恢复”分别完成了哪些，避免把 AI 的一句答复当成三项操作都成功。\n\n**引用文献**\n\n1. [Amershi 等（2019），Guidelines for Human-AI Interaction，CHI，表1及用户评估](https://www.microsoft.com/en-us/research/uploads/prod/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf)\n\n2. [Model Context Protocol（2025-06-18），Cancellation，Behavior Requirements 与 Timing Considerations](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/cancellation)\n\n3. [Microsoft，Restore a previous version of a file stored in OneDrive，官方帮助文档](https://support.microsoft.com/en-us/onedrive/restore-a-previous-version-of-a-file-stored-in-onedrive)"
        },
        {
          "id": "C025",
          "question": "临时改变风格或规则时，怎样说明只对当前输出有效？",
          "topic": "版本 决定与偏好",
          "answer": "**写清临时规则针对哪个输出、何时结束，以及结束后恢复什么规则。** “这次活泼一点”可能指下一条回复，也可能指整篇文稿；明确到“只改第二版的开场段”会更容易检查。\n\n例如：\n\n> 长期默认仍是简洁、平实。只对这次海报的三个标题使用夸张、幽默的语气；正文保持原风格。三个标题交付后，后续回复恢复简洁、平实。不要据此修改账户或项目的长期偏好。\n\n这里的作用对象是“三个标题”，结束条件是“标题交付”，保留规则是“正文及之后回复仍平实”。这种写法是在说明要求的适用范围。若临时规则持续到整项活动结束，就改为“本次活动内有效”；不用在每一轮都完整重复所有偏好。\n\n多轮对话中的规则变化确实值得检查。2026年的 SEQUOR 预印本在50轮模拟对话中测试10个开放权重模型及 Gemini 3.1 Flash Lite，比较约束保持、累加和替换等情形；模型的约束遵循随对话延长而下降，替换约束时又可能暂时恢复。这支持关注每一轮当前有效的规则。[研究 §3—4](https://arxiv.org/html/2605.06353v1)\n\n还要分清**对话里的临时约定**与**产品保存的长期设置**。Claude 官方文档说明，账户指令作用于所有对话，项目指令作用于该项目中的对话。把一次性的幽默要求写进账户设置，会扩大它的使用范围。[个性化功能说明](https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features) 因此，临时改变通常直接写在当前任务里；确实要修改长期习惯时，再调整相应设置。\n\n如果下一轮仍沿用过期风格，指出范围即可：“刚才的幽默要求已结束，本段恢复默认风格。”若发现长期设置或记忆里已经保存了这项偏好，就到相应位置检查和修改；新开对话是否仍受影响，取决于这些设置是否继续适用。\n\n验收分两次：本次输出是否只在指定部分采用新规则，后续输出是否回到原规则。不要仅以“我记住了，只对本次生效”的口头确认作为判断。\n\n**引用文献**\n\n1. [Canaverde 等（2026），SEQUOR: A Multi-Turn Benchmark for Realistic Constraint Following，预印本，§3—4、图5—6](https://arxiv.org/html/2605.06353v1)\n\n2. [Anthropic，Understanding Claude's personalization features，Instructions for Claude 与 Project instructions，官方帮助文档](https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features)"
        }
      ]
    },
    {
      "id": "D",
      "title": "组织复杂过程",
      "questions": [
        {
          "id": "D001",
          "question": "一个请求里包含多个任务时，怎样明确交付物和相互关系？",
          "topic": "任务拆分与依赖",
          "answer": "**先说清要交付哪些成品、各自依据什么，以及哪些结果必须先完成；具体实施步骤可以交给 AI 安排。** “写报告、做演示、列行动项”包含三个交付物，但还没有说明三者使用同一份结论，还是分别分析。\n\n可以区分三种关系：独立任务能分别开展；依赖任务要使用前一步的结果；共同约束则同时适用于所有成品。例如，数据核对与版式探索可以并行，正式图表依赖清理后的数据，报告与演示又必须采用同一统计口径。这里的“先后”来自内容依赖，不自动意味着每一步都要用户批准。\n\n专业实验确实支持某些任务的拆分。Zhou 等的 least-to-most 方法先拆出子问题，再利用前面的答案解决后面的题；在 GPT-3 code-davinci-002 的 SCAN 组合泛化实验中取得明显改善。这研究的是特定推理任务及示例设计，不能直接当作办公任务一律分步的依据。[论文原文](https://arxiv.org/abs/2205.10625)\n\nAnthropic 的工程指南进一步区分顺序串联、独立并行，以及由主代理动态分工等模式。它们是组织工作的办法，选择时要看实际依赖。[官方工程指南](https://www.anthropic.com/engineering/building-effective-agents)\n\n例如：\n\n> 根据附件交付一份分析报告、一份演示稿和行动清单。先核对数据并确定分析结论；三份成品采用同一口径，演示稿提炼报告，行动清单对应报告中的问题。资料整理和版式准备可以并行。已明确的工作持续完成；只有材料冲突导致结论无法确定时，列出冲突和所需信息。\n\n这段要求约定了结果之间的关系，用户无需编排每次搜索与修改。验收时既看三项是否齐全，也抽查同一数字、结论和行动是否对应；“三个文件都生成了”只是数量验收。\n\n**引用文献**\n\n1. [Zhou 等（2023），Least-to-Most Prompting Enables Complex Reasoning in Large Language Models，ICLR；方法与 SCAN 实验](https://arxiv.org/abs/2205.10625)\n\n2. [Anthropic（2024），Building effective agents；Prompt chaining、Parallelization、Orchestrator-workers](https://www.anthropic.com/engineering/building-effective-agents)"
        },
        {
          "id": "D002",
          "question": "什么时候一次完成更合适，什么时候需要分阶段？",
          "topic": "任务拆分与依赖",
          "answer": "**目标、材料和验收标准已经明确，且结果容易检查时，通常可以一次委托完成；需要先取得新信息、验证关键前提或作出实质选择时，再分阶段。** 一次委托也可以包含 AI 自行安排的多步工作，不等于只能生成一次。\n\n例如，把一篇已有文章改成短通知，可以直接交付成稿。根据尚未核对的数据提出方案，则应先检查数据；设计整套视觉材料而风格还没确定，可以先出有代表性的小样。分阶段的价值在于让下一阶段获得此前没有的依据，而不是把同一任务改成十次“继续”。\n\n两类研究说明，不能单看轮次数。Wu 等的 20 人实验中，可查看和修改中间结果的链式界面，在互评改写、旅行语言卡片任务中改善了成品和控制感。[AI Chains](https://arxiv.org/html/2110.01691v3) 另一项研究把完整需求拆散到多轮才逐渐提供，发现所测模型容易沿用早期错误假设。[Laban 等](https://arxiv.org/html/2505.06120v1) 前者增加了有用的检查与干预，后者推迟了必要信息；这不是同一种“分步”。\n\n可以这样委托：\n\n> 请根据现有资料完成报告、配图和核对。你可自行拆分并连续执行。若发现缺少会改变核心结论的信息，先核实；确实需要我决定时，把可选方案、差别和你的建议一次说明。常规整理不必逐步等待确认。\n\n判断是否值得分阶段，可以问：停在这里会获得什么新信息？它会改变后续什么工作？若两问都没有具体答案，直接完成通常更省沟通。最终比较的应是合格成品、返工量和总耗时，包括用户回复的时间，而不是流程看起来有多少步骤。\n\n**引用文献**\n\n1. [Wu、Terry 与 Cai（2022），AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts，CHI；第 5 节](https://arxiv.org/html/2110.01691v3)\n\n2. [Laban 等（2025），LLMs Get Lost In Multi-Turn Conversation；第 3、6 节，模拟多轮需求逐渐披露实验](https://arxiv.org/html/2505.06120v1)"
        },
        {
          "id": "D003",
          "question": "哪些中间结论必须先核实，才可以作为下一步依据？",
          "topic": "任务拆分与依赖",
          "answer": "**优先核实那些一旦出错就会改变后续方向、计算结果或操作对象的中间结论。** 不必把每句过渡文字都升级为检查点；关键是找出后面哪些工作正在依赖它。\n\n常见的关键前提包括：从原文提取的需求是否完整，表格的单位与筛选条件是否正确，引用是否支持结论，要修改的是否为目标文件，以及前一次写入是否已经成功。例如，把“万元”误当成“元”后，再精细的预算分析也会建立在错误基础上；格式漂亮并不能补救这一点。\n\nTyen 等把“找到推理错误”和“修正已定位错误”分开测试：在五类推理任务中，提供真实错误位置能改善后续表现，而模型自己定位错误仍较困难。这支持把可核对的信息送入纠错过程，不宜只要求“再认真检查一次”。[研究原文](https://aclanthology.org/2024.findings-acl.826/)\n\n据此安排检查时，可以要求每个关键前提同时附上核验对象：数据对原表，引用对原文，计算对公式或脚本，操作结果对工具回执与当前状态。Anthropic 的代理工程指南也要求执行过程中使用环境反馈判断进展，而非只沿用自己生成的叙述。[官方指南](https://www.anthropic.com/engineering/building-effective-agents)\n\n例如：\n\n> 生成图表前，请核对原表中的单位、时间范围、缺失值和筛选条件；用核对后的数据制作图表及分析。发现可自行核实的问题就处理并继续；只有不同合理解释会改变结论、且资料无法判定时，才提出需要我决定的事项。交付时注明核对依据。\n\n检查也有层次：核对所有金额比抽查一项更适合金额不能错的表格；检查若干段落适合先发现排版模式问题。未核实的前提可以作为明确标注的假设用于试算，但不要在最终结论中悄悄改称“已确认”。\n\n**引用文献**\n\n1. [Tyen 等（2024），LLMs cannot find reasoning errors, but can correct them given the error location，Findings of ACL；错误定位与回溯纠正实验](https://aclanthology.org/2024.findings-acl.826/)\n\n2. [Anthropic（2024），Building effective agents；Agents 中的环境反馈与实际结果检查](https://www.anthropic.com/engineering/building-effective-agents)"
        },
        {
          "id": "D004",
          "question": "拆得过细会增加哪些沟通负担，怎样判断拆分是否有必要？",
          "topic": "任务拆分与依赖",
          "answer": "**拆分有价值，是因为它降低了出错或返工的代价；拆分本身也会消耗沟通、等待和整合成本。** 如果用户需要反复解释同一背景、复制中间答案、回复“继续”，而质量没有明显改善，流程很可能拆得过细。\n\n研究也观察到这种代价。AI Chains 的 20 人研究中，9 人提到链式界面更复杂、学习门槛更高，4 人表示局部修改与最终结果之间的关系较难把握。这是特定界面的用户体验发现，说明可见步骤更多与使用更轻松并非同一回事。[第 5.3.6 节](https://arxiv.org/html/2110.01691v3)\n\n实际可以用三项问题筛选步骤：这一段有独立的交付物吗？它的结果会改变下一步吗？分开后是否能发现或局部修复原本难定位的问题？有一项明确作用就可能值得保留；若只是把“读资料、思考、组织语言、输出”写成四次等待，通常没有必要。\n\n例如，批量整理 200 条记录，可以先用一小批检查字段理解，再按同一规则处理余下记录。没有必要让用户逐条批准，也不宜让各条独立生成互不一致的字段定义。反过来，若每条涉及不同的原始证据，内部逐条核查仍有意义，只是不用变成 200 次用户交互。\n\n可以这样说：\n\n> 你自行安排读取、整理、核验和汇总，持续完成已授权工作。仅在字段含义冲突或需要改变约定目标时向我提出问题；合并同类问题，说明它影响哪些结果。其余步骤记录进度即可，不需要我逐次回复。\n\n验收流程是否合适，要比较同类任务的总完成时间、遗漏和返工，以及用户投入。若删掉一个检查点后结果与可追溯性没有变差，却减少等待，就没有理由仅为“过程完整”把它加回来。\n\n**引用文献**\n\n1. [Wu、Terry 与 Cai（2022），AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts，CHI；第 5.3.6 节 Additional challenges](https://arxiv.org/html/2110.01691v3)"
        },
        {
          "id": "D008",
          "question": "什么时候看提纲、样例或小规模试做，比直接生成完整结果更有效？",
          "topic": "澄清与过程检查",
          "answer": "**当错误方向会被大量复制，或你必须看到实物才能判断偏好时，先看提纲、样例或小规模试做更有价值。** 选择哪一种，要对应尚未解决的问题：提纲检查覆盖与结构，样例检查语气和表现形式，试做检查材料、工具与流程能否跑通。\n\n例如，长教程先看提纲能发现缺章，却看不出解释是否适合新手；写一节代表性内容才能检查难度。批量提取表格信息只看一张漂亮样表也不够，需要用真实文件试一次读取、提取和核对。**展示方向正确与证明过程可行，验收对象不同。**\n\nAI Chains 的用户研究发现，参与者会借助中间结果定位问题、调整局部步骤；它支持让用户有机会检查关键产物。选择小样时，重点是让它暴露真正难点。[研究原文](https://arxiv.org/html/2110.01691v3)\n\n小样不应只挑最容易的一段。制作系列知识卡片时，可以选一题概念解释、一题有数字或引用的题，以及一题容易混淆的边界问题。检查内容是否准确、解释是否充分、版式是否容纳得下；这样才知道同一写法能否用于后续条目。\n\n例如：\n\n> 先完成三张代表性卡片，分别覆盖概念、数据和易混淆问题，并说明样例选择理由。按已给定标准自行核对；若出现必须由我确定的风格取舍，呈现具体版本供我选择。规则明确后继续完成其余卡片，不逐张等待确认。\n\n如果已有成熟模板、来源齐全且只有少量内容，额外做一轮小样可能比直接完成还费事。交付前还要检查整批的一致性与遗漏：样例通过证明的是这些样例合格，不能代替其余内容的核对。\n\n**引用文献**\n\n1. [Wu、Terry 与 Cai（2022），AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts，CHI；第 5.3.2—5.3.4 节，中间结果与局部调试](https://arxiv.org/html/2110.01691v3)"
        },
        {
          "id": "D009",
          "question": "怎样设置有意义的检查点，而不是每一步都停下来？",
          "topic": "澄清与过程检查",
          "answer": "**检查点应设在“现在检查能改变后续投入”的地方，并明确通过后继续什么、何种情况才需要用户作决定。** 进度汇报、自动检查和请求批准是三件事，不必绑在一起。\n\n例如，数据导入后检查列数、单位和缺失值，可以自动完成并继续分析；小样出现两种同样合理的风格，才可能需要你选择。已经授权的资料整理、常规修订和验证，不应每完成一项就停下来问“是否继续”。\n\nMicrosoft 的人机交互指南建议根据用户的当前任务和环境安排介入，并呈现当下相关的信息。该指南经过多轮评估，包括 49 名设计从业者对 20 款 AI 产品的检验，评估的是这些设计原则在实际产品中的适用性。[研究说明](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/)；[指南第 3、4 项](https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/)\n\n据此，一个有用检查点最好说明三件事：要检验的关键判断、可查看的证据、检查后采取的动作。例如，“请审核”过于笼统；“确认读者是新手还是从业者，因为这将决定术语密度与案例深度”才给出了可决策的信息。\n\n可以这样写：\n\n> 数据核对由你完成，通过后继续。只有证据互相冲突且会改变核心结论，或必须在两个尚未确定的目标之间取舍时，才暂停相关工作，向我说明差别和建议；不受影响的部分继续处理。其余阶段用简短进度记录即可。\n\n检查点不需要一次设得完美。若它总能发现会传到后续的实质问题，就值得保留；若用户每次只能回复“继续”，应合并或改成自动核验。最终仍要看成品是否符合要求，而不是把“所有检查点都点过确认”当成质量证据。\n\n**引用文献**\n\n1. [Amershi 等（2019），Guidelines for Human-AI Interaction，CHI；指南验证研究](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/)\n\n2. [Microsoft Research（2019），Guidelines for human-AI interaction design；第 3、4 项](https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/)"
        },
        {
          "id": "D011",
          "question": "在一条对话里切换话题，什么时候会混入旧目标或旧材料？",
          "topic": "多轮状态与中断恢复",
          "answer": "**旧目标或旧材料仍在可见上下文里，而新要求没有明确对象和适用范围时，AI 可能把两者混用。** 典型信号是沿用上一个项目的数字、客户名称、写作风格，或把已经否定的方案继续当作前提。无需等到对话很长，这些混用就可能出现。\n\n实验为“无关信息会干扰任务”提供了直接证据。Shi 等在数学应用题中加入不影响正确答案的额外信息，发现所测模型的解题表现会受干扰。[GSM-IC 研究](https://proceedings.mlr.press/v202/shi23a.html) Liu 等则在多文档问答和键值检索实验中发现，相关信息的位置会影响提取表现。[Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/) 这些不是对“聊天多少轮会串题”的测量，不能据此设一个统一轮数上限。\n\n日常处理可以从最小的澄清开始：明确现在讨论谁、使用哪份材料、哪些旧要求仍有效。如果只是同一报告改写措辞，保留历史有帮助；如果换成另一个客户、数据集或价值判断，应该显式划定边界。\n\n例如：\n\n> 接下来处理乙项目的说明书。依据本条附件和下面的要求；甲项目中的数字、人物与结论不适用于乙项目。仅保留“面向新手、使用简体中文”的表达偏好。请直接完成说明书，遇到缺失事实时标明缺口。\n\n随后抽查最容易串用的内容：对象、日期、单位、专有名词和核心目标。如果仍多次回到旧设定，可以把当前有效要求汇总后另开对话。文字上的范围声明是在指导使用信息，并不删除历史记录；涉及保存、记忆或隐私设置，要按产品功能另行处理。\n\n**引用文献**\n\n1. [Shi 等（2023），Large Language Models Can Be Easily Distracted by Irrelevant Context，ICML；GSM-IC 算术任务实验](https://proceedings.mlr.press/v202/shi23a.html)\n\n2. [Liu 等（2024），Lost in the Middle: How Language Models Use Long Contexts，TACL；多文档问答与键值检索实验](https://aclanthology.org/2024.tacl-1.9/)"
        },
        {
          "id": "D012",
          "question": "何时继续原对话，何时另开对话，应保存什么交接信息？",
          "topic": "多轮状态与中断恢复",
          "answer": "**同一任务的目标和有效材料仍连续时，继续原对话比较方便；任务已经换了对象，或旧假设反复干扰结果时，可以整理交接信息后另开对话。** 不必按固定轮数清空，也不宜只复制最后一句“继续做”。\n\nLaban 等在模拟的多轮需求披露任务中观察到，模型会依赖早期不完整答案；作者在后续实验中比较了重述和汇总要求等办法，并建议重试前整合当前需求。[第 7.4 节](https://arxiv.org/html/2505.06120v1) Anthropic 的上下文工程指南也介绍了压缩历史与结构化笔记，强调保留关键决定、未解决问题和实施信息。[官方工程指南](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)\n\n交接应保存“下一步做对所必需的信息”，不需要逐字搬运所有讨论：\n\n- 当前目标、交付物和验收标准，以及已经改变或撤回的要求。\n\n- 有效材料的位置、版本及关键结论的依据，避免只有 AI 写的二手摘要。\n\n- 已完成的成果与实际核验结果，未完成事项及失败尝试。\n\n- 已确定的决定、允许继续的范围，以及尚需用户决定的具体问题。\n\n例如：\n\n> 请整理一份可在新对话继续工作的交接说明：以最终要求为准，附当前文件位置、版本、已验证结果、剩余工作和下一步。删除已放弃方案的冗余过程，但保留放弃它的关键原因；把已确认事实与待核实假设分开。\n\n新对话开始后，让 AI 读取成果和必要原文，再从未完成部分接续。交接摘要中“测试通过”要能找到对应测试记录；“已保存”要能打开相应文件。另开对话只改变对话起点，是否还会引用项目资料或跨对话记忆，取决于所用产品及设置。\n\n**引用文献**\n\n1. [Laban 等（2025），LLMs Get Lost In Multi-Turn Conversation；第 7.4 节、附录 M](https://arxiv.org/html/2505.06120v1)\n\n2. [Anthropic（2025），Effective context engineering for AI agents；Compaction、Structured note-taking](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)"
        },
        {
          "id": "D014",
          "question": "任务中断或工具失败后，怎样确认已完成部分，避免重复操作？",
          "topic": "多轮状态与中断恢复",
          "answer": "**先确认外部状态，再从尚未完成的部分继续；“没收到成功回复”不等于“操作没有发生”。** 读取资料失败通常容易重试，但创建记录、发送内容或提交写入时，盲目重来可能产生重复结果。\n\nAWS 的官方工程文章用创建云资源说明了这个问题：请求超时后，调用方可能不知道资源是否已建成。它介绍的“幂等”机制，是让同一请求按指定标识重试时不产生额外副作用；关键在服务端支持和请求标识，不能只靠 AI 说一句“不要重复”。[官方原文](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)\n\n恢复时可以把状态分成三类：有回执或当前结果可确认的“已完成”，明确未执行的“未完成”，以及请求已发出但结果不明的“待核实”。待核实部分优先用记录编号、版本、操作日志或实际内容查询；如果操作原本支持幂等重试，就遵守该接口的标识和有效期规则。\n\n例如：\n\n> 继续刚才的批量建档。先查询已创建记录，按原始条目编号与回执核对；已有且内容正确的跳过，确认未创建的继续处理。结果不明的先查询，不直接新增一份；无法查清时，只暂停受影响条目并说明，其他可确认部分继续。\n\n这份状态清单应由 AI 根据工具结果整理，用户不必手工重建全过程。对于文件，检查的是内容与保存位置；对于外部记录，检查的是目标系统中的真实条目，不能用聊天里的“完成”替代。\n\n恢复结束后，还要核对输入条目与输出条目是否一一对应、是否遗漏或重复。工具回执证明一次调用发生了什么，最终状态检查证明整项任务现在是否正确；两者共同支撑“已恢复完成”的结论。\n\n**引用文献**\n\n1. [Malcolm Featonby／AWS（2021 发布），Making retries safe with idempotent APIs，Amazon Builders’ Library；Retrying and side effects、Reducing client complexity、Late arriving requests](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)"
        },
        {
          "id": "D019",
          "question": "让多个 AI 或多个角色讨论，什么时候有价值，什么时候只是增加重复内容？",
          "topic": "分工与工具选择",
          "answer": "**多个 AI 有价值，通常是因为它们完成了不同工作、提出了可比较的候选答案，或发现了单次尝试遗漏的证据。** 如果只是轮流复述同一观点，角色数量增加并没有增加信息。\n\n先区分三种做法：一个模型在一段文字里扮演多位专家，主要提供不同视角；多个实例各自回答，可以比较差异；各代理分头查不同资料或执行不同子任务，则能扩大实际工作覆盖。它们需要的资源和协调方式并不一样。\n\nDu 等让多个模型实例先给出答案，再经过多轮交流，在算术、知识问答等测试中改善了部分结果。[ICML 论文](https://proceedings.mlr.press/v235/du24e.html) 另一方面，Cemri 等对多代理系统的执行轨迹进行分析，发现问题包括分工设计、代理间信息不一致，以及核验和终止失败。[失败分析研究](https://arxiv.org/html/2503.13657v1) 因此，讨论达成共识只是过程结果，事实是否正确仍要查证。\n\nAnthropic 的研究系统工程报告也指出，适合并行探索的研究任务更容易受益，而依赖密集、所有代理都必须共享大量背景的工作协调成本更高。这是其产品实践总结。[官方报告](https://www.anthropic.com/engineering/multi-agent-research-system)\n\n可以这样安排：\n\n> 让三个代理分别检查资料来源、计算过程和读者可理解性。先各自形成意见，再交由主代理汇总。每项问题写明位置、依据和建议；同一问题合并，保留有证据的分歧。主代理核对关键事实，并交付一份统一修订稿。\n\n如果使用多人独立解题，应尽量先形成各自答案再交流，避免后面的输出只是跟随第一份。若是分工执行，则明确产物和接口，防止同时覆盖同一文件。最后检查新增了哪些有效证据或修正、是否缩短总耗时，以及多花的费用是否值得；无需为了“团队感”保存所有重复发言。\n\n**引用文献**\n\n1. [Du 等（2024），Improving Factuality and Reasoning in Language Models through Multiagent Debate，ICML](https://proceedings.mlr.press/v235/du24e.html)\n\n2. [Cemri 等（2025），Why Do Multi-Agent LLM Systems Fail?；初版执行轨迹分析及失败分类](https://arxiv.org/html/2503.13657v1)\n\n3. [Anthropic（2025），How we built our multi-agent research system；Benefits of a multi-agent system](https://www.anthropic.com/engineering/multi-agent-research-system)"
        },
        {
          "id": "D022",
          "question": "怎样在开始前约定投入时间、费用、尝试次数和输出深度？",
          "topic": "资源预算与停止条件",
          "answer": "**只约定与你有关的资源限制，并区分“希望控制在多少”与“系统必须在何处停止”。** 时间、费用、尝试次数和输出深度不是同一个指标；答得短也可能经过很多搜索，限制字数不能代替限制成本。\n\n开始前可以明确：先完成哪些必需成果、可用的时间或费用上限、怎样计算一次尝试，以及到达上限时交付什么。截止时间要给日期和时区；次数要区分“修改一轮”与“调用一次工具”，否则同一个数字会产生不同理解。\n\n官方功能也体现了这种区别。Claude 的 task budgets 是供模型自我安排的建议性 token 预算；Managed Agents 的 session budgets 则由平台在模型请求之间检查消费，达到上限后停止新增请求，已经在途的请求及相应工具动作仍可能完成。因此，预算功能的计量范围和执行时机也需要看清。[任务预算文档](https://platform.claude.com/docs/en/build-with-claude/task-budgets)；[会话预算文档](https://platform.claude.com/docs/en/managed-agents/budgets)\n\n例如：\n\n> 本次先完成能交付的一页方案和关键依据，不做全面综述。资料搜集最多两轮；一轮指针对当前缺口的一批查询。已有依据足以支持方案就进入写作，第二轮后仍未解决的点列为待核实。不得启动付费服务；交付时说明实际完成范围和剩余缺口。\n\n这里限制的是搜集范围，AI 仍应完成整理、核对与交付，而不是用完查询次数就留下散乱材料。若必须严格控制费用，需要在付费平台设置实际限额；若工具不能读取时间或用量，应明确哪些只能估算。\n\n结束时看实际用量记录与成品质量，不用模型自报的“投入很多”衡量工作量。增加预算前，也应说明新增投入预计解决哪个具体缺口，避免把“再试一次”变成没有停止条件的循环。\n\n**引用文献**\n\n1. [Anthropic，Task budgets，官方 API 文档；预算性质与 Choosing a budget，2026 年 10 月 13 日查阅](https://platform.claude.com/docs/en/build-with-claude/task-budgets)\n\n2. [Anthropic，Session budgets，Managed Agents 官方文档；When a session reaches its budget，2026 年 10 月 13 日查阅](https://platform.claude.com/docs/en/managed-agents/budgets)"
        },
        {
          "id": "D024",
          "question": "反复尝试没有进步时，应换表达、补资料、换工具，还是改变目标？",
          "topic": "资源预算与停止条件",
          "answer": "**先定位阻碍进展的环节，再选择改变什么；不要把所有失败都归因于提问方式。** 换表达适合解决误解，补资料适合解决信息缺口，换工具适合解决执行或计算问题，改变目标则涉及你是否愿意接受新的取舍。\n\n可以从可观察的差异判断：AI 把“按金额排序”理解成“按日期排序”，需要澄清；不知道某项真实数据，需要找材料；数据齐全却反复算错，可交给表格或代码计算；所用工具没有访问权限，就要解决访问或选择能完成任务的途径。目标与资源相冲突时，应说明矛盾，再决定缩小范围，不能悄悄降低标准来宣布完成。\n\nTyen 等在五类推理任务中发现，提供真实错误位置能够改善纠正表现，说明定位问题与反复要求自检是不同操作。[研究原文](https://aclanthology.org/2024.findings-acl.826/) Laban 等的多轮实验则提示，如果对话已经沿着早期错误假设发展，先汇总有效要求再重试比继续堆叠零碎补充更值得尝试。[第 7.4 节](https://arxiv.org/html/2505.06120v1)\n\n例如：\n\n> 暂停重复生成。请对照成功标准和最近两次结果，指出仍失败的具体位置，并区分是资料缺失、要求误读、推导错误还是工具问题。选一个能验证原因的最小改动试做，比较结果；保留已正确部分。若需要改变目标或增加预算，说明理由后由我决定。\n\n“最小改动”是为了看清原因，并非要求所有复杂故障只能一次改一个字。可以保留一个已知失败案例，观察新办法是否真正修好，再检查原本正确的内容有没有退步。\n\n若同一失败持续存在，而且新一轮没有新材料、方法或验证结果，就先停止重复该路径；可改走有依据的替代方案，或交付现有成果与具体阻碍。改变的是方法还是目标，应在结果中清楚体现。\n\n**引用文献**\n\n1. [Tyen 等（2024），LLMs cannot find reasoning errors, but can correct them given the error location，Findings of ACL](https://aclanthology.org/2024.findings-acl.826/)\n\n2. [Laban 等（2025），LLMs Get Lost In Multi-Turn Conversation；第 7.4 节 Consolidate before retrying](https://arxiv.org/html/2505.06120v1)"
        },
        {
          "id": "D025",
          "question": "如何先用低成本试做判断方案是否可行？",
          "topic": "资源预算与停止条件",
          "answer": "**低成本试做应测试最可能使方案失败的关键环节，并走完一条真实的小流程。** 仅做一个外观精致的演示，往往只能证明“能展示”，未必证明原始材料能处理、结果能核对或规模扩大后能承担成本。\n\n例如，要把 500 份资料转成结构化记录，先挑少量真实文件，覆盖普通文档、表格、扫描件和格式异常等情况；完成读取、提取、保存和核验。若真正难点是扫描件识别，就不应只拿排版整齐的文本试做。样本数量应随差异和错误代价调整，不需要套用统一的“先做十个”。\n\nAnthropic 的代理评估指南建议从真实失败案例起步，同时记录结果、耗时、token 与成本。它在早期系统开发中建议 20—50 个简单任务作为起点；这是工程上的起步建议，不是证明任何方案可行所需的统计样本量。[官方指南](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)\n\n一次试做至少要回答：关键字段是否提取正确，例外情况能否识别，用户还需修正多少，以及每项大致消耗多少资源。通过标准最好在看到输出前设定，避免生成得很漂亮就临时降低要求。\n\n例如：\n\n> 先从资料中选择六份有代表性的文件，说明覆盖哪些差异。完成从读取到保存的全部流程，并逐项对照原文核对日期、金额和主体名称；记录失败原因、人工修订量与用时。若满足已定标准，在授权范围内继续；若关键字段仍不可靠，先修复并复测，再扩展数量。\n\n为这六份反复调好提示后，可以再加入几份未参与调整的新文件，检查规则是否只适配旧样本。试做通过支持扩大下一批，而不是直接承诺 500 份全部正确；扩展时仍要保留与任务风险相称的核验。\n\n**引用文献**\n\n1. [Anthropic（2026），Demystifying evals for AI agents；Going from zero to one、Collect tasks for the initial eval dataset，以及基线与回归评估](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)"
        },
        {
          "id": "D031",
          "question": "怎样避免把 AI 的建议自动当成自己的偏好或最终决定？",
          "topic": "学习过程与人的自主性",
          "answer": "**把“这个建议的事实依据成立”与“我愿意接受它的价值取舍”分开。** AI 可以帮助比较后果，也可以按你已经确定的偏好代选；尚未确定的偏好，不应因为它反复推荐就被当成你的决定。\n\n例如，两个学习计划都可行：一个较快但每天负担重，另一个较慢却更容易坚持。AI 可以估算工作量、指出遗漏，却不能仅凭“效率最高”就认定你愿意牺牲休息。这里既有可核对的事实，也有需要你选择的权重。\n\nBuçinca 等在 199 人的辅助决策实验中，比较了先自行判断、按需查看建议等干预与直接呈现解释的方式；促进主动思考的设计减少了对错误建议的过度依赖，也带来了使用体验上的代价。实验任务是食材替换等结构化决策。[研究原文](https://zbucinca.github.io/assets/pdf/publications/bucinca2021trust.pdf)\n\n日常可以采用较轻的办法：在看推荐前，先写下自己最看重的一两项、不能接受的代价；看过建议后，再检查它是否擅自换了评价标准。无需每次都制作复杂权重表，重要的是能说明“我为什么选择它”。\n\n例如：\n\n> 我更重视持续完成，其次才是速度；每天可投入半小时。请比较两种计划，指出各自代价，以及你的推荐依赖哪些假设。不要把“最快”自动当成最适合我。若这些偏好足以作决定，就按它们给出建议；真正缺少的价值取舍单独说明。\n\n最后尝试用自己的话完成一句话：“我选择这个方案，因为……，愿意接受的代价是……。”如果只能重复“AI 说这是最优”，可以回看依据或保留暂缓决定的选项。主动委托本身也是自主选择；重点是授权范围和理由由你掌握，而不是所有小决定都必须亲自重做。\n\n**引用文献**\n\n1. [Buçinca、Malaya 与 Gajos（2021），To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-assisted Decision-making，CSCW；第 3—5 节，199 人实验](https://zbucinca.github.io/assets/pdf/publications/bucinca2021trust.pdf)"
        }
      ]
    },
    {
      "id": "E",
      "title": "判断与修正",
      "questions": [
        {
          "id": "E006",
          "question": "AI 的引用是否真实存在，是否真的支持对应结论，怎样检查？",
          "topic": "事实 证据与不确定性",
          "answer": "**检查引用要分两步：先确认文献确实存在，再确认原文支持答案中的那句话。** 作者、期刊、DOI 看起来专业，只能算待核对的书目信息。\n\nWalters 与 Wilder 用 GPT-3.5、GPT-4 围绕42个主题生成84篇短综述，核对其中636条参考文献，发现虚构文献与真实文献的书目错误都存在。这是2023年特定模型和生成方式的结果，说明了应检查的错误类型。[研究摘要](https://pubmed.ncbi.nlm.nih.gov/37679503/) ALCE 研究则把回答正确性与引用支持程度分开评估：回答流畅、文献真实，仍可能出现引文未充分支持论述的问题。[论文 §3、§5](https://aclanthology.org/2023.emnlp-main.398.pdf)\n\n实际可以按以下顺序核对：\n\n1. **查存在性。** 用标题、作者或 DOI 到期刊官网、学术数据库检索；确认标题、作者、年份、刊物相互匹配。链接打不开时换入口查询，不能直接判为虚构；只找到相似题目也不能算已确认。\n\n2. **查对应关系。** 找到支撑结论的具体段落、表格或结果，连同上下文阅读。一句话包含多个事实时，分别检查；来源只支持其中一项，就缩小结论或补充来源。\n\n3. **查证据性质。** 区分作者做出的实验结果、讨论中的假说，以及原文转述的另一项研究。若关键论断来自后者，继续追到原始来源。\n\n4. **记录核验结果。** 简单标明“支持、部分支持、不支持、未能核实”，并注明位置与问题。\n\n> 请逐项核对这段文字的关键结论。每项列出原始来源、支持位置及支持范围；只读到摘要就注明，不把搜索摘要写成全文证据。找不到的引用保留为待核实，不补造相似文献。\n\n这份核对表让检查对象明确；交付前仍应亲自打开关键来源，尤其检查数字、因果关系和适用对象。引用数量多，不等于证据链完整。\n\n**引用文献**\n\n1. [Walters、Wilder（2023），Fabrication and errors in the bibliographic citations generated by ChatGPT，Scientific Reports，研究摘要](https://pubmed.ncbi.nlm.nih.gov/37679503/)\n\n2. [Gao 等（2023），Enabling Large Language Models to Generate Text with Citations，EMNLP，§3、§5—6](https://aclanthology.org/2023.emnlp-main.398/)"
        },
        {
          "id": "E007",
          "question": "来源真实但过时、断章取义或适用范围不同，应怎样识别？",
          "topic": "事实 证据与不确定性",
          "answer": "**来源真实只是第一关；还要检查它是否仍适用，以及答案有没有扩大原文的结论。** 年份较早不自动等于过时，新发表也不自动等于更可靠。\n\n可以把核对集中在三个问题上：\n\n- **时间与版本是否对应？** 产品功能、价格、政策应查当前官方说明，核对生效日期、产品版本与账户类型。研究论文则查看是否有修订、勘误或撤稿；如果文章提供 Crossmark 按钮，可以查询出版者登记的更新状态。[Crossref 官方说明](https://www.crossref.org/pdfs/about-crossmark.pdf)\n\n- **前后文是否一致？** 阅读引文所在段落、方法与结果，查看是否遗漏否定、条件、比较对象和例外。尤其注意“相关”被写成“导致”，“某个指标改善”被写成“整体更好”，以及相对变化被误当作绝对变化。\n\n- **研究对象是否相同？** 对照人群或模型、任务、干预方式、比较基线和评价指标。Cochrane 的证据评价方法把研究对象、干预、比较与结果不匹配视为“间接性”；借用这个思路审查 AI 研究时，应把这些维度换成相应的模型与任务条件。[手册 §14.2.2、表14.2.b](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14)\n\n例如，论文发现某提示提高英语选择题准确率，而答案写成“这个技巧能改善所有中文写作”，就跨越了语言、任务和指标三个条件。应改写为论文实际测到的结果，再把对新用途的判断写成需要试验的推测。\n\n> 请核对“这项方法适合我的任务”这一结论。列明来源日期与版本、实验对象、比较方法、结果指标，并指出与我的使用场景有什么差异。保留原文中的重要条件；遇到修订或相互冲突的研究，说明差异来自哪里。\n\n优先查会改变决定的差异，不必给每篇文献做完整评审。如果只能读到摘要，可以确认其公开概述，但涉及实验细节的判断应等到找到正文或补充材料后再作出。\n\n**引用文献**\n\n1. [Cochrane，Handbook for Systematic Reviews of Interventions，§14.2.2 及表14.2.b](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14)\n\n2. [Crossref，Crossmark 官方说明，更新、勘误及撤稿状态](https://www.crossref.org/pdfs/about-crossmark.pdf)"
        },
        {
          "id": "E009",
          "question": "AI 表示“很确定”或给出置信度数字时，应该怎样看待？",
          "topic": "事实 证据与不确定性",
          "answer": "**“很确定”是回答的一部分；“置信度95%”只有经过相应任务的校准检验，才有可解释的准确率含义。** 数字精细，并不意味着它来自真实的统计测量。\n\n校准关注的是一批类似判断：如果模型把许多答案都报为80%可信，这批答案最终是否大约有80%正确。它不同于单题证明，也不同于模型生成某个词的概率。\n\n不能把所有自报置信度都说成毫无价值。Tian 等在 TriviaQA、SciQ、TruthfulQA 上比较 GPT-3.5、GPT-4、Claude 等模型，发现特定提示下输出的置信度，在多项设置中比由模型输出概率估计的置信度校准得更好；表现随模型、数据集和询问方法变化。[研究 §2—3、表1—5](https://aclanthology.org/2023.emnlp-main.330.pdf) 因而，经过验证的置信度可以用于安排复核顺序，日常对话中随口给出的百分比却没有自动获得这种资格。\n\n普通使用更值得追问的是：确定的部分有何依据，不确定发生在哪一步，以及什么新资料会改变结论。例如“方案有90%机会成功”含义不明：是事实判断、预测成功概率，还是对建议的主观把握？先明确事件、时间和成功标准，才谈得上评估预测。\n\n> 请把已查证事实、依赖假设的推断和待确认事项分开。对关键结论给出依据与主要不确定来源；如果提供概率，说明它是统计数据、经过验证的模型估计，还是本次主观估计。\n\n不需要要求每句话都附百分比。对可计算的结果重新计算，对文献结论查原文，对未来预测记录结果并持续比对。若自己开发分类或问答系统，可在独立的、有可信答案的样本上检验置信度，并分别检查“高置信回答是否准确”和“低置信回答是否覆盖主要错误”；两者也不是同一个指标。\n\n**引用文献**\n\n1. [Tian 等（2023），Just Ask for Calibration: Strategies for Eliciting Calibrated Confidence Scores from Language Models Fine-Tuned with Human Feedback，EMNLP，§2—3、表1—5](https://aclanthology.org/2023.emnlp-main.330/)"
        },
        {
          "id": "E013",
          "question": "结果不好，是目标不清、材料不足、输入误读、能力限制，还是评价标准不一致？",
          "topic": "错误定位与具体反馈",
          "answer": "**先指出结果在哪一项验收条件上失败，再判断原因；一句“效果不好”不足以区分表达、资料、理解和能力问题。** 同一次失败也可能有多个原因。\n\n*Sufficient Context* 在开放式问答中将“给定资料是否足以作答”和“模型是否答对”分开，发现材料充分仍会答错，材料不足也可能生成确定答案。这个区分有助于避免把所有错误都归到“提示词没写好”。[研究 §3—4](https://arxiv.org/html/2411.06037v3)\n\n可以从一个具体错误开始排查：\n\n- **目标或评价不一致**：先说出期待的结果。例如你要面向新手的操作说明，AI 写成专家综述；或者两位评审分别偏好简洁和全面，需要先统一取舍。\n\n- **材料不足**：检查正确答案所需的信息是否提供、是否可访问。缺了预算就无法判断方案是否可负担，换说法补不出真实预算。\n\n- **输入误读**：请它定位所用原句、字段或单位，核对是否漏掉否定、把两个人混同、读错表格。能复述部分材料不代表已完整理解。\n\n- **执行或能力问题**：目标明确、资料可用后，再检查计算、推理、工具调用与输出过程；可用计算器、测试或小任务定位失败环节。\n\n- **评价本身有误**：核验参考答案和检查方法是否合理。Anthropic 的工程指南建议阅读实际执行记录，分辨代理做错与评分器误判有效解法。[官方工程指南](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)\n\n> 这份结果的问题是：把“申请退款”写成“退款已到账”。请指出依据来自材料哪一处，核对原句表达的是请求、批准还是完成；修正这一判断，并检查其他状态有没有同类误读。\n\n这样的反馈同时提供失败位置与判断依据。若原因仍不清，可保留同一案例，只改一项条件再试，例如补上缺失字段；连续改变材料、模型和标准，就难以知道哪项起了作用。AI 对“自己为什么错”的解释可作为排查假设，最终用原始输入、执行记录和重试结果确认。\n\n**引用文献**\n\n1. [Joren 等（2025），Sufficient Context: A New Lens on Retrieval Augmented Generation Systems，v3，§3—4](https://arxiv.org/html/2411.06037v3)\n\n2. [Anthropic（2026），Demystifying evals for AI agents，Step 6: Check the transcripts](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)"
        },
        {
          "id": "E017",
          "question": "AI 改对一处却改坏另一处时，应怎样检查回归问题？",
          "topic": "错误定位与具体反馈",
          "answer": "**修复一处后，要同时检查“原错误是否消失”和“原来正确的内容是否保留”。** 后一种检查就是回归检查，适用于代码，也适用于文档、表格和分类规则。\n\nCheckList 研究在情感分析、重复问题判断和阅读理解中，把测试按能力与行为类型组织，发现常规准确率之外的错误；其中包括对不应改变答案的输入变化进行检查。[论文 §2—3](https://aclanthology.org/2020.acl-main.442.pdf) 这给日常修改提供了一个实用思路：事先列出必须保持的性质，让新旧版本接受同一组检查。\n\n可按修改的影响范围安排检查：\n\n1. **保留修改前版本。** 保存原稿或使用版本记录，才能比较差异并恢复内容。\n\n2. **重查出错案例。** 用原始输入确认修复，避免只换了一个更容易的示例。\n\n3. **检查相邻规则和依赖项。** 改日期时看时间线，改数量时重算合计，改函数时检查调用它的流程。\n\n4. **复查关键保留项。** 文档核对姓名、数字、引用与未授权改写；表格核对公式、单位与汇总；软件重跑相关测试及重要旧案例。\n\n例如，把“退款审核需3天”改成“5个工作日”，不只是替换一个数字，还要检查摘要、流程图、计算示例和工作日定义；已经正确的申请条件则应保持一致。\n\n> 请修正退款审核时限，并检查所有引用该时限的位置。申请条件与金额规则保持原意。完成后列出实际改动、核对过的关联内容及尚未检查部分；以修改前版本对照。\n\n检查强度随影响扩大：一处错字看差异即可，涉及计算规则则需要旧案例、边界案例与新错误案例。测试通过表示所检查的范围通过；不把 AI 的“其他部分都没动”当作差异核对结果。若发现回归，先保留仍正确的修改，只修复新增问题，减少整篇重新生成带来的额外变化。\n\n**引用文献**\n\n1. [Ribeiro 等（2020），Beyond Accuracy: Behavioral Testing of NLP Models with CheckList，ACL，§2—3](https://aclanthology.org/2020.acl-main.442/)"
        },
        {
          "id": "E019",
          "question": "让 AI 自己检查答案，能发现什么，不能替代哪些独立验证？",
          "topic": "自检 迎合与独立复核",
          "answer": "**自检适合做第一轮筛查；事实、计算和外部操作是否成立，需要能独立核对的证据。** 要求 AI 按清单查漏项、矛盾、格式和引用位置，能让检查对象更具体；单纯问“你确定没有问题吗”，得到的可能只是另一句判断。\n\nHuang 等在 GSM8K、CommonSenseQA、HotpotQA 上测试当时的 GPT-3.5、GPT-4 等模型，发现没有外部反馈的推理自纠错可能降低准确率。[研究 §3、表3—6](https://arxiv.org/html/2310.01798) 与之相对，CRITIC 把搜索、代码执行等工具反馈纳入检查，在其问答和数学程序任务中取得改善。[研究 §3](https://arxiv.org/html/2305.11738) 两者说明应区分“再想一遍”和“取得新证据后核验”。\n\n可以按问题选检查方式：\n\n- **遗漏和一致性**：逐项对照原任务、原文或字段清单，查看是否漏答、前后冲突。\n\n- **事实和引文**：打开原始来源，核对对应段落与日期。\n\n- **计算和代码**：用可复算过程、解释器、测试或另一个计算方法检查。\n\n- **实际行动**：查看目标系统中的记录、文件或回执，确认结果确实发生。\n\n- **专业或主观判断**：让合适的人依据明确标准复核，区分事实错误与偏好差异。\n\n> 先按这五项验收标准检查结果，只报告具体问题及位置。对关键数字用原始数据重算，对引用打开来源核对；说明哪些检查实际执行了，哪些仍需人工判断。没有证据的问题列为待核实。\n\n这不要求每项工作都重复做一遍，而是把验证放在最容易影响结果的地方。再请一个模型看一遍可以增加视角，但模型之间也可能共享知识缺口；更有价值的是让复核方接触原始输入、采用不同方法并提交可检查的依据。先独立作答再比较，还能减少直接接受上一份答案的机会。\n\n**引用文献**\n\n1. [Huang 等（2024），Large Language Models Cannot Self-Correct Reasoning Yet，ICLR，§3](https://arxiv.org/html/2310.01798)\n\n2. [Gou 等（2024），CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing，ICLR，§3](https://arxiv.org/html/2305.11738)"
        },
        {
          "id": "E020",
          "question": "我反复质疑后 AI 改口，怎样判断是真纠错还是迎合？",
          "topic": "自检 迎合与独立复核",
          "answer": "**判断改口是否有根据，要看新增证据、可定位的错误和重新核验的结果。** 道歉、语气变坚定，或者改成与你一致，都不是正确性的证据。\n\nSharma 等在五个助手上研究迎合行为，其中一项实验先让模型回答事实或推理问题，再由用户表示怀疑。模型有时会把正确答案改错，甚至在原先表示高度确信的题目上也会发生。[研究 §3.2、图2、附录A.4](https://arxiv.org/html/2310.13548v4) 所以，“我追问了三遍它终于承认”只能说明回答发生了变化。\n\n出现改口时，可以要求对齐三件事：原答案是什么、具体哪一处不成立、修正依赖什么依据。新依据可以是补充材料，也可以是对原来已有数据的正确重算；不必要求每次纠错都出现一条新来源。\n\n> 我提出的是疑问，不表示原答案一定错。请核对争议点：若修改，指出原答案中错误的句子、依据及修正结果；若原答案仍成立，保留并解释；尚无法确定的部分列出缺口。\n\n例如原来把“环比增长”理解为“同比增长”，回到表头和计算式就能判断。若它只是把“甲更合适”换成“乙更合适”，却仍使用同一组理由且没有解释取舍变化，就应继续核验，而不是马上接受新结论。\n\n复查时还要区分**事实纠正**与**偏好更新**：你补充“我更重视价格”，推荐随之改变可能完全合理；但你的喜好不会改变产品的客观价格。可以在另一段独立对话中，只给原问题和材料、不透露想得到的答案，观察争议是否仍存在，再用来源或计算裁决。独立问答是排查线索，不能靠多次投票决定事实；如果始终没有可核验依据，就保留未决状态。\n\n**引用文献**\n\n1. [Sharma 等（2023/2024），Towards Understanding Sycophancy in Language Models，§3.2、图2、附录A.4；引用修订版v4](https://arxiv.org/html/2310.13548v4)"
        },
        {
          "id": "E021",
          "question": "让 AI 反驳我时，怎样避免得到为了反驳而反驳的内容？",
          "topic": "自检 迎合与独立复核",
          "answer": "**把任务写成“找出会影响结论的漏洞和反证”，比指定“必须反驳我”更符合审查目的。** 好的反驳应当指向真实主张、有可核查依据，并说明问题是否足以改变决定；合理的部分可以保留。\n\n迎合研究发现，用户表达赞同或反对会影响模型对论证等内容的评价。[研究 §3.1](https://arxiv.org/html/2310.13548v4) 这提示我们，要求批判时仍需明确证据标准。“反对者”角色本身没有解决评价是否独立的问题。实际审查时，可以这样安排：\n\n1. **先确认主张。** 用一句话复述实际观点，包括条件，避免把“某些情况有用”改写成“所有情况都有效”再攻击。\n\n2. **针对关键理由。** 找事实错误、缺失前提、推理跳跃或足以推翻结论的反例；不要为了凑条数挑无关措辞。\n\n3. **区分问题性质。** “已有证据反驳”“尚缺证据”“取决于偏好”和“只有特定情景才发生”应分别说明。\n\n4. **给出可检查的下一步。** 哪项资料、测试或小规模试做能够区分不同解释？如果争议只影响表达，就不要把整个方案判为失败。\n\n> 请审查我的方案是否值得执行。先准确复述核心主张，再找最重要的反证、缺失前提和失败条件；每项给出依据及影响。成立的部分保留，无充分根据的反对意见不列入。最后说明需要补查什么才能改变判断。\n\n例如“先向20位用户试用，再决定是否扩大投入”，与“20位用户足以代表整个市场”是两个不同主张。可以批评样本不能支持总体推断，但不能因此认定小规模试用没有价值。\n\n收到批评后，逐项回到原主张、资料和成功标准核对。不要把措辞尖锐当成洞察，也不必强求支持与反对意见数量相等；证据可能本来就不对称。\n\n**引用文献**\n\n1. [Sharma 等（2023/2024），Towards Understanding Sycophancy in Language Models，§3.1，用户立场对反馈的影响；引用修订版v4](https://arxiv.org/html/2310.13548v4)"
        },
        {
          "id": "E026",
          "question": "比较两种提问方法时，需要保持哪些条件一致？",
          "topic": "效果比较与可迁移性",
          "answer": "**比较两种提问方法时，先固定任务与评分标准，再尽量只改变你要研究的那项写法。** 一次生成的胜负，只能说明那次结果，不能代表长期表现。\n\nSclar 等在多项少样本任务中发现，仅改变分隔符、空格、大小写等不改变语义的格式，也会明显影响部分模型的准确率，且不同模型的表现排序并不一致。[研究 §3—4](https://proceedings.iclr.cc/paper_files/paper/2024/file/6c0e99d736da621403018ca7b32b1a4d-Paper-Conference.pdf) 因而，比较“加角色是否有用”时，如果角色版还多了背景、示例和详细要求，就无法把差异单独归因于角色。\n\n至少应保持以下条件一致：\n\n- **问题与材料**：两种方法处理同一批案例、相同文件版本与资料范围。\n\n- **模型与环境**：尽量使用同一模型版本、工具权限及生成设置，记录测试日期；避免一边能搜索、一边不能。\n\n- **上下文与投入**：使用等价的对话背景，固定示例和输出要求。若比较方法效果，尽量匹配尝试次数或费用；若比较整套流程，则同时报告额外投入。\n\n- **评价方式**：提前确定事实正确、格式合规、可用性等标准，分别计分，不在看过结果后改规则。\n\n可以先用一小批真实案例做配对试验，两种方法都回答每道题，并重复生成，记录成功数、主要错误和耗时。样本中要有常见情况和关键例外；挑出喜欢的最佳回答会掩盖失败频率。评写作时可隐藏方法名称并交换展示顺序，减少先入为主。\n\n> 用同一批客服问题比较 A、B 提示。每题分别运行两种方法，资料和模型设置相同；按预先确定的事实正确、规则遵守、回复可用三项评分，保留全部结果及耗时，不只展示成功例子。\n\n小规模试验适合发现明显差别，不必包装成统计定论。若差异接近波动、个别案例改变就翻转结论，应增加有代表性的案例；若效果相近，可以按更省时、易维护的方式选择。推广到新模型或新任务时，再做一次针对性的验证。\n\n**引用文献**\n\n1. [Sclar 等（2024），Quantifying Language Models’ Sensitivity to Spurious Features in Prompt Design，ICLR，§3—4](https://proceedings.iclr.cc/paper_files/paper/2024/file/6c0e99d736da621403018ca7b32b1a4d-Paper-Conference.pdf)"
        },
        {
          "id": "E032",
          "question": "怎样发现自己越来越依赖 AI 的认可，而不再独立判断？",
          "topic": "信任 使用与退出",
          "answer": "**关键不在于用了多少次 AI，而在于自己能否保留判断理由、接受现实反馈，并在需要时停止寻求认可。** 经常借助工具处理工作，与必须获得它的赞同才敢决定，是不同的使用方式。\n\nFang 等进行过981人、为期四周的随机实验，比较不同聊天模式与话题。其2025年10月修订版报告，自主使用时间较多、对 AI 信任或社交吸引较高，与更高依赖或问题性使用存在关联。使用时长本身没有被随机操纵，研究也没有“不使用 AI”的对照组，因此这些关联不能证明“多用 AI 导致依赖”。[研究v2：结果、讨论及限制](https://arxiv.org/pdf/2503.17473v2)\n\n普通自查可以关注具体变化：\n\n- 作决定前是否先形成自己的理由，还是不断追问直到得到“你是对的”？\n\n- AI 与可靠资料、实际结果或可信的人意见冲突时，自己会核验哪一方？\n\n- 是否反复改变问法索取相同认可，讨论却没有带来新信息或行动？\n\n- 想暂时停用时是否很难停下，或已挤占原本重视的工作、休息和人际联系？\n\n这些是用于观察习惯的线索，不是诊断量表。可以选一个低风险决定，在询问前写下自己的判断、理由和不确定处；阅读 AI 建议后，只记录哪些新事实或取舍改变了看法，再用自己的话作决定。之后对照现实结果，而不是只看当时是否被安慰。\n\n> 请帮我检查理由和证据，指出遗漏的选择与代价。我会先写自己的判断，你再补充；最后由我说明决定。不要只用赞同来结束讨论。\n\n若使用已经持续干扰生活，可以先调整使用边界，并与可信任的人讨论实际影响；不必让 AI 来裁定自己是否“已经依赖”。真正要观察的是：判断依据是否更清楚，现实行动是否推进，以及是否仍能自主选择使用或离开。\n\n**引用文献**\n\n1. [Fang 等（2025），How AI and Human Behaviors Shape Psychosocial Effects of Extended Chatbot Use: A Longitudinal Randomized Controlled Study，预印本v2，2025年10月2日修订](https://arxiv.org/pdf/2503.17473v2)"
        },
        {
          "id": "E035",
          "question": "结果交给他人使用前，应说明哪些 AI 参与、核验范围和剩余限制？",
          "topic": "信任 使用与退出",
          "answer": "**交付说明应让接收者知道：AI 做了什么、哪些内容确实查过，以及哪些限制会影响使用。** 具体披露要求先看交付场景的规则与约定，不能把某个期刊或单位的要求写成所有人的统一义务。\n\n例如，ICMJE 对医学期刊投稿建议作者说明是否使用 AI 辅助，以及如何使用，并要求人类作者审核内容、承担责任。这是明确的出版场景要求，应结合目标期刊的投稿规则执行。[ICMJE 官方建议 V.A](https://icmje.org/recommendations/browse/artificial-intelligence/ai-use-by-authors.html) 课程作业、客户项目与内部文件则分别查课程规定、合同约定及组织政策，尤其确认哪些工作必须独立完成、哪些内容必须披露。\n\n日常交付可以用三项简短说明，避免笼统写“已由人工核验”：\n\n- **参与范围**：AI 用于检索线索、初稿、翻译、代码生成还是分析；适用规则要求时补充工具、版本或日期。\n\n- **实际检查**：明确查了什么、用什么依据、覆盖多少。例如“逐条核对表中金额与原始凭证”，与“抽查5条记录”含义不同。\n\n- **剩余限制**：说明尚未确认的数据、未测试的环境、预测假设及使用范围；只保留影响接收者判断的事项。\n\n例如一份业务分析可以写：\n\n> AI 辅助整理资料和生成初稿；作者已对照原始销售表重算全部汇总，并核对文中关键引用。访谈记录仅抽查，预测使用给定增长假设，尚未用后续实际数据验证。\n\n这里的“全部”“已核对”必须有实际工作记录支撑。代码交付则可以说明通过哪些测试、在哪个环境验证；不能把代码审阅等同于实际运行，也不能把测试通过写成所有场景都正确。\n\n可要求 AI 先生成交付说明草稿，但提交前应由负责交付的人对照记录审核。披露是为了支持接收者正确使用成果，不会自动提高内容质量，也不能替代应当完成的检查。\n\n**引用文献**\n\n1. [ICMJE，Recommendations，V.A Use of AI by Authors，官方投稿与作者责任建议；2026年10月13日查阅](https://icmje.org/recommendations/browse/artificial-intelligence/ai-use-by-authors.html)"
        },
        {
          "id": "E036",
          "question": "怎样把一次错误整理成可复用的检查项，而不是积累越来越长的禁令？",
          "topic": "信任 使用与退出",
          "answer": "**把错误转成“什么条件下，要检查什么、怎样算通过”的检查项，比不断追加“以后不要再错”更容易复用。** 检查项要对应可观察的行为，而不是抽象的态度要求。\n\nCheckList 将语言能力与测试类型结合，使用基础案例、应保持不变的变化，以及应触发答案变化的对照来找错误；研究在三类自然语言任务中验证了这种行为测试方法的用途。[论文 §2—3](https://aclanthology.org/2020.acl-main.442.pdf) 日常任务可以借用这个思路，把一次失败整理成少量有代表性的案例。\n\n例如，AI 把“客户申请退款”写成“退款已到账”，不必积累“别乱猜、别混淆、再仔细一点”等多条禁令。可以合并成一条：\n\n> 涉及流程状态时，分别识别请求、批准与完成。输出中的状态必须有材料依据；没有完成记录时，不写成已完成。\n\n再保留三个可检查的例子：只提出申请、申请获批、已有到账记录。换姓名或订单号，状态判断应保持；增加可信的到账记录后，状态应改变。这样能检查是否理解了规则，也能防止模型为了避错而一律写“未知”。\n\n每条记录可只包含四项：**触发条件、曾经的错误、正确判据、验证案例**。原始输入和错误输出另外保存为参考，无需全部塞进每次提示。若错误源于缺资料，检查项应要求取得对应证据；若源于计算或格式，优先交给公式、脚本或验证工具。\n\n> 请把这次错误归纳成一条适用于同类任务的检查项，给出一个原错误案例和一个应得到不同结论的对照。检查是否与现有规则重复；能合并的合并，不扩大到无关任务。\n\n复用前先确认规则本身正确，修订后用旧错误与新案例共同检查。对低频且影响小的细节，不必永久加入通用提示；按任务类型调用相关检查项，并在任务、模型或资料变化后删改过时内容。清单的价值在于能发现错误，而不是条目越来越多。\n\n**引用文献**\n\n1. [Ribeiro 等（2020），Beyond Accuracy: Behavioral Testing of NLP Models with CheckList，ACL，§2.2—2.3、§3](https://aclanthology.org/2020.acl-main.442/)"
        }
      ]
    }
  ]
};

