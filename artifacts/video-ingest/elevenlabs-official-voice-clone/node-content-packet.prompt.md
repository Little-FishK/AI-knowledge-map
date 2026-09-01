# 新节点完整内容写作任务

这是已通过双阶段影子复核的新节点内容任务。严格遵守 `task.rules`，只返回填好的 `outputTemplate` JSON。

```json
{
  "schemaVersion": 1,
  "mode": "node-content-writing-packet",
  "generatedAt": "2026-07-24T18:46:50.768Z",
  "bindings": {
    "proposalHash": "sha256:9685216228988afbcba2d89d9af847e2b1fe4d2d89958699431ab5c1831340fb",
    "evidenceHash": "sha256:ecfd1fd17bf74c351ad9eb117674be563f5d506fa40954a698a2511b4b6f5b96",
    "assessmentHash": "sha256:d43093c7b2b78c6fed30b7027f1d4ebe5337b2b03165eca3e9ba35e859b567ee",
    "graphHash": "sha256:1b6dc3bc50e91a03ad65a7315647678643a0e0169ea9ce33723bc67bbc180efc"
  },
  "task": {
    "objective": "为已通过双阶段影子门禁的新节点撰写完整详情正文和神经网络级理解原理页。",
    "rules": [
      "只使用 assessment 中已通过的节点身份、关系、断言和来源，不擅自扩大概念边界。",
      "详情正文按是什么→机制→约束/影响→怎么应对组织，并包含至少一个可验证案例。",
      "理解原理页必须形成输入→变换→输出→反馈→边界的机制闭环。",
      "至少9节、4个学习目标、一个可复现贯穿示例、原创教学制品、误区、失败诊断和延伸路线。",
      "至少5道非背诵型自测并提供完整答案。",
      "来源至少3个，优先一手或权威来源，标注访问日期与版本边界。",
      "正文原创表达；不得复制视频字幕或外部来源的大段文字。",
      "只返回 outputTemplate 形状的 JSON，不返回Markdown前后缀。"
    ],
    "automaticGates": [
      "L1",
      "L2",
      "L3",
      "关系",
      "学习路径",
      "布局",
      "哈希绑定"
    ],
    "formalWrite": false
  },
  "candidate": {
    "term": "Voice Cloning",
    "decision": "new",
    "rationale": "来源增强后，声音克隆可以与普通 TTS 稳定消歧：普通 TTS 的核心是把文本映射为语音，声音克隆额外接收目标说话者参考音频，并把说话者身份作为独立条件注入合成。即时或零样本克隆可在推理时从数秒参考语音提取 speaker embedding，或把声学 codec tokens 作为 prompt，不更新目标说话者专属权重；专业克隆则用较长目标语音微调模型参数。它还具有独立评测轴：除可懂度和自然度外，必须测目标说话者相似度；并具有授权、身份冒用、检测与溯源等专属安全边界。现有 speech 总览仅区分 STT 与 TTS，没有覆盖目标身份条件化、零样本与微调双机制、说话者相似度评测和克隆专属治理，因此值得拆为新节点。",
    "targetNode": null,
    "nodeScores": {
      "identity": 4,
      "mechanism": 4,
      "nonDuplication": 3,
      "practicalValue": 4,
      "relationshipPotential": 4,
      "sourceQuality": 4
    },
    "supplementCriteria": null,
    "coreCandidate": false,
    "coreScores": null,
    "evidenceRefs": [
      {
        "start": 0,
        "end": 50.06
      },
      {
        "start": 53.3,
        "end": 84.66
      },
      {
        "start": 285.285,
        "end": 319.105
      },
      {
        "start": 588.515,
        "end": 628.775
      }
    ],
    "nearestNodes": [
      "speech",
      "controllable-generation"
    ],
    "proposedEdges": [
      {
        "from": "voice-cloning",
        "label": "目标说话者条件化的语音合成",
        "to": "speech",
        "type": "is-a"
      },
      {
        "from": "voice-cloning",
        "label": "参考音频控制说话者身份",
        "to": "controllable-generation",
        "type": "is-a"
      },
      {
        "from": "voice-cloning",
        "label": "专业克隆更新目标说话者参数",
        "to": "fine-tuning",
        "type": "uses"
      },
      {
        "from": "voice-cloning",
        "label": "复制可识别的声音生物特征",
        "to": "privacy",
        "type": "threatens"
      },
      {
        "from": "content-detection",
        "label": "鉴别合成或冒用音频",
        "to": "voice-cloning",
        "type": "mitigates"
      }
    ],
    "externalSources": [
      {
        "title": "Transfer Learning from Speaker Verification to Multispeaker Text-To-Speech Synthesis",
        "url": "https://arxiv.org/abs/1806.04558",
        "authorityType": "primary research paper",
        "supportScope": "给出 speaker encoder、受 speaker embedding 条件化的 TTS synthesizer 与 vocoder 三组件机制；数秒参考语音可为训练未见说话者生成语音，并以自然度、说话者相似度和说话者验证 EER 评测。"
      },
      {
        "title": "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers",
        "url": "https://arxiv.org/abs/2301.02111",
        "authorityType": "primary research paper",
        "supportScope": "给出以三秒声学提示和文本音素为条件生成 codec tokens 的零样本克隆机制，并使用 WER、自然度和 speaker similarity 评测未见说话者。"
      },
      {
        "title": "Voice cloning: how it works",
        "url": "https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning",
        "authorityType": "official technical documentation",
        "supportScope": "明确即时克隆是推理时 few-shot conditioning、无权重更新；专业克隆通过目标语音微调权重，并说明数据质量、跨风格一致性与 voice-captcha 的边界。"
      },
      {
        "title": "The FTC Voice Cloning Challenge",
        "url": "https://www.ftc.gov/news-events/contests/ftc-voice-cloning-challenge",
        "authorityType": "government consumer-protection authority",
        "supportScope": "确认声音克隆带来欺诈、冒用生物特征和创作者声音的专属风险，并把干预分为预防或认证、实时检测和事后鉴别。"
      },
      {
        "title": "ASVspoof 2021 Evaluation Plan",
        "url": "https://www.asvspoof.org/asvspoof2021/asvspoof2021_evaluation_plan.pdf",
        "authorityType": "research benchmark specification",
        "supportScope": "提供真人语音与 spoofed speech 二分类的标准评测设置，并以 t-DCF 和 EER 评估反欺骗系统。"
      }
    ],
    "claims": [
      {
        "text": "即时或零样本声音克隆可在不更新目标说话者专属权重的情况下，用短参考语音形成 speaker embedding 或声学 prompt，在推理时条件化语音合成。",
        "sourceUrls": [
          "https://arxiv.org/abs/1806.04558",
          "https://arxiv.org/abs/2301.02111",
          "https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning"
        ],
        "evidenceRefs": [
          {
            "start": 15.74,
            "end": 50.06
          }
        ]
      },
      {
        "text": "专业声音克隆与即时克隆不是单纯速度差异：前者用目标说话者数据微调模型权重，数据量和质量会直接影响一致性与跨风格表现。",
        "sourceUrls": [
          "https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning"
        ],
        "evidenceRefs": [
          {
            "start": 285.285,
            "end": 319.105
          }
        ]
      },
      {
        "text": "声音克隆评测至少包含语音可懂度、自然度和目标说话者相似度三个相互独立的轴；常用证据包括 WER、MOS/CMOS、SMOS、嵌入相似度和说话者验证 EER。",
        "sourceUrls": [
          "https://arxiv.org/abs/1806.04558",
          "https://arxiv.org/abs/2301.02111"
        ],
        "evidenceRefs": []
      },
      {
        "text": "声音克隆复制可识别的声音身份，风险不等同于普通 TTS；治理需要覆盖生成前授权或认证、生成中的实时检测，以及生成后的 spoof 鉴别和溯源。",
        "sourceUrls": [
          "https://www.ftc.gov/news-events/contests/ftc-voice-cloning-challenge",
          "https://www.asvspoof.org/asvspoof2021/asvspoof2021_evaluation_plan.pdf",
          "https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning"
        ],
        "evidenceRefs": [
          {
            "start": 588.515,
            "end": 605.17
          }
        ]
      }
    ],
    "proposedLearningPath": {
      "phase": "多模态生成系统",
      "order": "8.10",
      "afterNodes": [
        "speech"
      ],
      "beforeNodes": [
        "audio-generation"
      ],
      "rationale": "先理解一般 STT/TTS，再学习目标说话者条件化、零样本克隆与说话者微调；随后再扩展到非语音音效和音乐生成。"
    },
    "disqualifiers": [],
    "proposedNode": {
      "id": "voice-cloning",
      "title": "声音克隆",
      "aliases": [
        "Voice Cloning",
        "语音克隆",
        "音色克隆",
        "Voice Clone",
        "Zero-shot Voice Cloning"
      ],
      "domain": "generation",
      "maturity": "evolving",
      "summary": "从目标说话者的参考语音提取身份表示或声学提示，生成该说话者从未说过的新语音；可在推理时零样本条件化，也可用较长语音微调模型提高一致性。",
      "definition": "声音克隆是目标说话者条件化的语音合成：输入不仅包含要说的文本，还包含代表某个说话者身份、音色、口音和部分韵律的参考语音条件。",
      "mechanisms": [
        "零样本或即时克隆：speaker encoder 将数秒参考语音压成说话者 embedding，或 neural codec 模型直接把参考声学 tokens 作为 prompt；生成时条件化，不更新目标说话者权重。",
        "专业或适配式克隆：用较长的目标说话者数据微调模型参数，提高跨文本、情绪和说话风格的一致性。",
        "合成阶段同时受文本内容条件和说话者身份条件控制，再由声学模型或 codec 解码器生成波形。"
      ],
      "boundaries": [
        "普通 TTS 解决文本到语音；声音克隆额外要求从参考音频适配指定说话者，尤其是训练时未见说话者。",
        "Voice conversion 变换已有源语音的说话者身份；文本驱动的声音克隆可直接让目标声音说任意新文本。",
        "Voice design 从描述创造新声音；声音克隆以真实目标说话者为参照，因而带来更强的授权与身份冒用风险。"
      ],
      "evaluation": [
        "可懂度：WER 或人工转录准确性。",
        "自然度：MOS、CMOS 等主观语音质量评分。",
        "说话者保持：SMOS、speaker-embedding cosine similarity、说话者验证 EER。",
        "鲁棒性：跨文本、语言、情绪、语速、噪声与录音设备的一致性。"
      ],
      "safety": [
        "采集和克隆前取得目标说话者明确授权，并验证提交者与声音所有者的关系。",
        "对生成音频保留来源追踪、水印或可审计记录。",
        "部署实时 deepfake 检测与事后 spoof 鉴别，并明确检测存在误报、漏报和分布漂移。"
      ]
    }
  },
  "relatedNodes": [
    {
      "id": "fine-tuning",
      "title": "微调 Fine-tuning",
      "aliases": [
        "Fine-tuning",
        "SFT",
        "精调"
      ],
      "summary": "在预训练模型的基础上，用特定数据继续训练，改变模型的权重。",
      "domain": "foundations"
    },
    {
      "id": "speech",
      "title": "语音识别与合成",
      "aliases": [
        "Speech",
        "STT",
        "TTS",
        "语音识别",
        "语音合成",
        "ASR"
      ],
      "summary": "语音转文字（识别）与文字转语音（合成），两个反向的任务。",
      "domain": "generation"
    },
    {
      "id": "controllable-generation",
      "title": "可控生成",
      "aliases": [
        "Controllable Generation",
        "ControlNet",
        "可控性",
        "条件控制"
      ],
      "summary": "在纯文本提示之外，用额外条件精确控制生成结果。",
      "domain": "generation"
    },
    {
      "id": "privacy",
      "title": "隐私与数据合规",
      "aliases": [
        "Privacy",
        "数据合规",
        "PII",
        "记忆与泄露"
      ],
      "summary": "模型可能记住并泄露训练数据，加上数据出境等合规约束，是落地的硬门槛。",
      "domain": "safety"
    },
    {
      "id": "content-detection",
      "title": "AIGC 检测与水印",
      "aliases": [
        "Content Detection",
        "AI Watermarking",
        "AI生成检测",
        "深度伪造检测",
        "溯源"
      ],
      "summary": "判断一张图/一段文/一段音是不是 AI 生成的——生成能力越强，越难也越必要。",
      "domain": "generation"
    }
  ],
  "evidence": {
    "source": {
      "url": "https://www.youtube.com/watch?v=AiRksVoiUAI",
      "platform": "Youtube",
      "title": "How to Clone Your Voice with AI - Realistic AI Voice Clones (Full Tutorial)",
      "creator": "ElevenLabs",
      "publishedAt": "2025-09-04",
      "durationSeconds": 675,
      "accessedAt": "2026-07-24"
    },
    "transcript": [
      {
        "start": 0,
        "end": 3.76,
        "text": "In this video, you're going to learn how to clone your own voice so you can create voiceovers that"
      },
      {
        "start": 3.76,
        "end": 7.52,
        "text": "sound like you by typing it out. Voice cloning means you can create new voiceovers that sound"
      },
      {
        "start": 7.52,
        "end": 11.44,
        "text": "just like you, fix mistakes in content you've already recorded, or speak an entirely new"
      },
      {
        "start": 11.44,
        "end": 15.68,
        "text": "language, sans devoir enregistrer à nouveau. You simply type some text and generate. Before we get"
      },
      {
        "start": 15.68,
        "end": 19.6,
        "text": "started, there's two different voice clones we can create. The first is Instant Voice Clone,"
      },
      {
        "start": 19.6,
        "end": 24.4,
        "text": "or IBC, which gives you a voice clone in seconds from just a minute or two of clean audio. It's"
      },
      {
        "start": 24.4,
        "end": 29.84,
        "text": "fast to create but may struggle with unique voices or accents. However, Professional Voice Cloning,"
      },
      {
        "start": 29.84,
        "end": 34.82,
        "text": "or PVC on the other hand, trains a dedicated model using much more of your audio,"
      },
      {
        "start": 34.82,
        "end": 37.26,
        "text": "usually anywhere between 30 minutes to several hours."
      },
      {
        "start": 37.26,
        "end": 39.68,
        "text": "This gives you a hyper-realistic, high-fidelity clone"
      },
      {
        "start": 39.68,
        "end": 43.62,
        "text": "that can capture the subtle tone, emotion and delivery of your voice."
      },
      {
        "start": 43.62,
        "end": 46.16,
        "text": "And now, the PVC takes a few hours to process,"
      },
      {
        "start": 46.16,
        "end": 50.06,
        "text": "but for accuracy and consistency, it's a much better voice clone in the long run."
      },
      {
        "start": 50.06,
        "end": 53.3,
        "text": "Now, before I show you how to create a voice clone, let's cover a couple of things first."
      },
      {
        "start": 53.3,
        "end": 56.14,
        "text": "First of all, the quality of the audio you provide is the most important part,"
      },
      {
        "start": 56.14,
        "end": 60.74,
        "text": "and for the best results, ideally you're recording on a professional mic setup in a quiet room."
      },
      {
        "start": 60.74,
        "end": 64.92,
        "text": "And you can even use a pop filter to avoid the plosives in your recordings."
      },
      {
        "start": 64.92,
        "end": 68.32,
        "text": "And now, not everyone has access to this equipment, and that's okay,"
      },
      {
        "start": 68.32,
        "end": 70.96,
        "text": "because plenty of voice clones have been made without."
      },
      {
        "start": 70.96,
        "end": 74.4,
        "text": "Just make sure your voice is the only thing you can hear in the recordings."
      },
      {
        "start": 74.4,
        "end": 79.18,
        "text": "Because background noise and unwanted audio may have an effect on the final result of your voice clone,"
      },
      {
        "start": 79.18,
        "end": 84.66,
        "text": "leading to inaccurate clones or the occasional unwanted audio artifact in your text-to-speech generations."
      },
      {
        "start": 84.66,
        "end": 90.26,
        "text": "And now that we've covered some of the basics and we'll go into more detail later, let's begin by creating an instant voice clone."
      },
      {
        "start": 90.26,
        "end": 93.3,
        "text": "And to follow along, you can click the first link down in the description below."
      },
      {
        "start": 93.3,
        "end": 97.1,
        "text": "In Eleven Labs, to start cloning your voice, you want to click on Voices in the left toolbar."
      },
      {
        "start": 97.1,
        "end": 100.78,
        "text": "And then we head over to this button right here where it says Create or Clone a Voice."
      },
      {
        "start": 100.78,
        "end": 104.04,
        "text": "If we click this, you'll notice we have a couple of different options."
      },
      {
        "start": 104.04,
        "end": 106.18,
        "text": "The first one being Voice Design."
      },
      {
        "start": 106.18,
        "end": 109.04,
        "text": "But below this, we have Instant Voice Clone and Professional Voice Clone."
      },
      {
        "start": 109.04,
        "end": 110.44,
        "text": "Let's start with Instant Voice Clone."
      },
      {
        "start": 110.44,
        "end": 116.34,
        "text": "So if I click Instant Voice Clone, we're now prompted to record or upload some recordings of our voice."
      },
      {
        "start": 116.34,
        "end": 120.32,
        "text": "And so here, all we have to do, very simple, we just click record and let's begin."
      },
      {
        "start": 120.32,
        "end": 123.74,
        "text": "We can actually choose the microphone that we want to use to record the Instant Voice Clone."
      },
      {
        "start": 123.74,
        "end": 129.88,
        "text": "And so here I'm going to select Scarlett 2i2, which is the audio interface that's using my Shure SM7B microphone."
      },
      {
        "start": 129.88,
        "end": 131.74,
        "text": "I can go ahead and click start."
      },
      {
        "start": 131.74,
        "end": 135.98,
        "text": "We have a three second countdown and the Instant Voice Clone is now recording."
      },
      {
        "start": 135.98,
        "end": 141.3,
        "text": "and you can see this with the audio waveforms in the bottom left of this box. For each recording"
      },
      {
        "start": 141.3,
        "end": 145.92,
        "text": "you do for the Instant Voice clone, you need to record at least 10 seconds and then you can go up"
      },
      {
        "start": 145.92,
        "end": 152.04,
        "text": "to a limit of 30 seconds. And now if I click stop on the first recording, you'll notice we now have"
      },
      {
        "start": 152.04,
        "end": 158.2,
        "text": "this first recording saved right here. Now I can go ahead and do another recording. And while I'm"
      },
      {
        "start": 158.2,
        "end": 161.98,
        "text": "doing this second recording for my Instant Voice clone, I'm going to explain this quick little box"
      },
      {
        "start": 161.98,
        "end": 177.645,
        "text": "down here below If you not recording on a professional microphone or there a little bit of background noise in your audio recordings you can actually just tick this box and 11 labs will automatically remove background noise from your audio recordings and so if i just click stop now i have two audio recordings and you can submit"
      },
      {
        "start": 177.645,
        "end": 183.405,
        "text": "as many as you like until this little green sphere is full and remember the more audio recordings you"
      },
      {
        "start": 183.405,
        "end": 187.665,
        "text": "provide the better the results of the instant voice clone and before you click next you can go"
      },
      {
        "start": 187.665,
        "end": 192.045,
        "text": "ahead and preview each of your recordings and if you're not happy you can delete them and re-record"
      },
      {
        "start": 192.045,
        "end": 197.165,
        "text": "as many times as you need. Once we're happy, here I have 45 seconds of recording, I'm going to click"
      },
      {
        "start": 197.165,
        "end": 203.425,
        "text": "next and now I can name my instant voice clone. So here I'm going to say Alec IVC, short for Alex"
      },
      {
        "start": 203.425,
        "end": 207.805,
        "text": "Instant Voice Clone. Here we can then add the language that we were speaking in our voice clone"
      },
      {
        "start": 207.805,
        "end": 211.405,
        "text": "because you can create voice clones in multiple different languages and if you want, if you were"
      },
      {
        "start": 211.405,
        "end": 216.185,
        "text": "creating multiple voice clones, you could even add a label such as the accent. However, here I'm not"
      },
      {
        "start": 216.185,
        "end": 220.425,
        "text": "doing that so I'm just going to remove this and then below that you can also add a quick description"
      },
      {
        "start": 220.425,
        "end": 223.985,
        "text": "just so you can find and remember what the voice clone is."
      },
      {
        "start": 223.985,
        "end": 225.305,
        "text": "And then here, you just need to confirm"
      },
      {
        "start": 225.305,
        "end": 227.445,
        "text": "that you have the rights and consent to upload"
      },
      {
        "start": 227.445,
        "end": 229.745,
        "text": "and use the voice recordings that you've submitted."
      },
      {
        "start": 229.745,
        "end": 232.685,
        "text": "So we check that and now we click save voice."
      },
      {
        "start": 232.685,
        "end": 235.465,
        "text": "Within a matter of seconds,"
      },
      {
        "start": 235.465,
        "end": 237.905,
        "text": "as you can see, we can now try out the new voice clone."
      },
      {
        "start": 237.905,
        "end": 239.085,
        "text": "And so you can go and speak with it"
      },
      {
        "start": 239.085,
        "end": 240.705,
        "text": "using conversational AI agent."
      },
      {
        "start": 240.705,
        "end": 243.445,
        "text": "You can narrate a full story within the 11 Lab Studio."
      },
      {
        "start": 243.445,
        "end": 245.065,
        "text": "But here, just to show you a quick example,"
      },
      {
        "start": 245.065,
        "end": 246.565,
        "text": "I'm going to click generate speech"
      },
      {
        "start": 246.565,
        "end": 248.265,
        "text": "and let's listen to what it sounds like."
      },
      {
        "start": 248.265,
        "end": 249.305,
        "text": "So here, as you can see,"
      },
      {
        "start": 249.305,
        "end": 255.825,
        "text": "I'm now within the text-to-speech tool in 11 Labs and on the right we can see that my instant voice clone is selected."
      },
      {
        "start": 255.825,
        "end": 261.465,
        "text": "And here I just want to make it clear that the best model to use for voice clones is the 11 Multilingual V2."
      },
      {
        "start": 261.465,
        "end": 268.825,
        "text": "We do have 11 V3 Alpha but that's a research preview and it means the results you'll get will be less consistent across your generations."
      },
      {
        "start": 268.825,
        "end": 274.845,
        "text": "And you'll notice that for 11 Multilingual V2 it will be the highest quality and it's even recommended for this specific voice that I've chosen."
      },
      {
        "start": 274.845,
        "end": 277.525,
        "text": "So we're just going to stick on 11 multilingual v2."
      },
      {
        "start": 277.525,
        "end": 281.105,
        "text": "And now let's just hear a silly joke from my professional voice clone."
      },
      {
        "start": 281.105,
        "end": 283.545,
        "text": "Why don't skeletons fight each other?"
      },
      {
        "start": 283.545,
        "end": 285.285,
        "text": "They don't have the guts."
      },
      {
        "start": 285.285,
        "end": 290.105,
        "text": "And so as you can see, we've now got an instant voice clone that sounds like me with just a few clicks."
      },
      {
        "start": 290.105,
        "end": 296.785,
        "text": "However, you might have noticed that it doesn't quite nail my exact tone, emotion and delivery."
      },
      {
        "start": 296.785,
        "end": 299.945,
        "text": "And to do this, we want to use a professional voice clone."
      },
      {
        "start": 299.945,
        "end": 303.605,
        "text": "Professional voice cloning delivers much more accurate and expressive results."
      },
      {
        "start": 303.605,
        "end": 308.185,
        "text": "And before I show you, let's cover some quick tips on how to make a great professional voice clone."
      },
      {
        "start": 308.185,
        "end": 313.005,
        "text": "First of all, you need to provide at least 30 minutes of audio, ideally closer to two hours."
      },
      {
        "start": 313.005,
        "end": 315.405,
        "text": "And if you can, stretch it all the way to three."
      },
      {
        "start": 315.405,
        "end": 319.105,
        "text": "Remember, the more high quality audio you provide, the better the voice clone."
      },
      {
        "start": 319.105,
        "end": 324.405,
        "text": "Next, if you can, you want to record in an acoustically treated or dampened room to cut down echo and noise."
      },
      {
        "start": 324.405,
        "end": 326.645,
        "text": "For example, in front of me, I have some voice panels."
      },
      {
        "start": 326.645,
        "end": 345.75,
        "text": "Below me I have a carpet and I have a couple of cushions around the room just to make sure this environment is better for recording After that you want to make sure that you keeping the recording noise So you want no background music no background sounds or any other voices that interfere with the recordings that you are using You want to also try and use some professional recording gear ideally a"
      },
      {
        "start": 345.75,
        "end": 351.21,
        "text": "professional mic like the Shure SM7B running through an XLR to an audio interface and remember"
      },
      {
        "start": 351.21,
        "end": 356.07,
        "text": "when using a professional mic especially if you're recording quite close it is a good idea to use a"
      },
      {
        "start": 356.07,
        "end": 359.99,
        "text": "pop filter to avoid the plosives into the microphone and when it comes to recording you"
      },
      {
        "start": 359.99,
        "end": 364.03,
        "text": "also want to control the volume and you want to aim for steady levels anywhere between minus 23"
      },
      {
        "start": 364.03,
        "end": 370.27,
        "text": "and minus 18 decibels rms peaking at around minus 3 db and before actually submitting your audio"
      },
      {
        "start": 370.27,
        "end": 374.75,
        "text": "recordings you could do some processing on it to get the exact sound that you'd like for example"
      },
      {
        "start": 374.75,
        "end": 379.35,
        "text": "you could use a parametric equalizer to reduce some of the low end if you think your voice is"
      },
      {
        "start": 379.35,
        "end": 383.05,
        "text": "sounding too boomy doing this will mean you'll never have to edit the audio of your professional"
      },
      {
        "start": 383.05,
        "end": 387.59,
        "text": "voice clone because it will always sound exactly how you want it to and with that being said let"
      },
      {
        "start": 387.59,
        "end": 391.23,
        "text": "show you how to create your professional voice clone. Back in Eleven Labs we just want to click"
      },
      {
        "start": 391.23,
        "end": 395.89,
        "text": "on voices and then we click on the same button create or clone a voice and this time we just go"
      },
      {
        "start": 395.89,
        "end": 401.35,
        "text": "to professional voice clone. Here we want to click on create a new voice clone and we'll be prompted"
      },
      {
        "start": 401.35,
        "end": 405.73,
        "text": "with a bunch of tips on how to make a great professional voice clone which are the tips that"
      },
      {
        "start": 405.73,
        "end": 410.61,
        "text": "I just walked you through but feel free to go through all of these in detail to make sure that"
      },
      {
        "start": 410.61,
        "end": 414.71,
        "text": "you capture the best possible recordings for your professional voice clone and there's even another"
      },
      {
        "start": 414.71,
        "end": 419.79,
        "text": "video here by James which is a great watch too. If we click create a new voice clone we're now taken"
      },
      {
        "start": 419.79,
        "end": 424.57,
        "text": "into the professional voice clone maker and here the very first thing we can do is we can name our"
      },
      {
        "start": 424.57,
        "end": 429.37,
        "text": "voice. So this time I'm just going to call it Alex professional voice clone. We can select the"
      },
      {
        "start": 429.37,
        "end": 434.61,
        "text": "language, add the description, the accent, it's the same as the instant voice clone and you'll notice"
      },
      {
        "start": 434.61,
        "end": 438.41,
        "text": "that on the right here the layout is a little bit different to the instant voice clone layout. Here"
      },
      {
        "start": 438.41,
        "end": 444.15,
        "text": "we can click this button, go ahead and upload some samples or again we can record directly into 11"
      },
      {
        "start": 444.15,
        "end": 449.11,
        "text": "Labs. And now if I record directly into Eleven Labs, you'll notice that we can actually choose"
      },
      {
        "start": 449.11,
        "end": 454.57,
        "text": "between scripts in different languages or even upload our own script. So if I go to English,"
      },
      {
        "start": 454.57,
        "end": 458.95,
        "text": "I could choose a conversational script. And then when I start recording, I can read through this"
      },
      {
        "start": 458.95,
        "end": 463.33,
        "text": "entire script. And as you can see, there's a lot here because remember, we need some long"
      },
      {
        "start": 463.33,
        "end": 467.79,
        "text": "recordings. And when you click on start recording, each recording needs to be at least 30 seconds."
      },
      {
        "start": 467.79,
        "end": 472.15,
        "text": "But again, you can do as many as you like. Let me show you what it looks like when you upload"
      },
      {
        "start": 472.15,
        "end": 477.13,
        "text": "your own samples. So if I click on upload samples I can select some audio that I've already prepared"
      },
      {
        "start": 477.13,
        "end": 482.25,
        "text": "for my voice clone and I just click open and while this is uploading and processing at the top here"
      },
      {
        "start": 482.25,
        "end": 487.55,
        "text": "you can see that we have some different thresholds for the ideal amount of audio that we need to"
      },
      {
        "start": 487.55,
        "end": 493.01,
        "text": "create a good professional voice clone. I've just uploaded 30 minutes and 30 seconds of pre-processed"
      },
      {
        "start": 493.01,
        "end": 498.75,
        "text": "audio for my voice clone and we've hit the good threshold. So ideally I would want to upload at"
      },
      {
        "start": 498.75,
        "end": 512.575,
        "text": "another hour or two to get some really really good results and so I going to upload the final two files that I prepared for this professional voice clone And then once that done I going to go ahead and click next on"
      },
      {
        "start": 512.575,
        "end": 516.695,
        "text": "the bottom right. And in case you're interrupted during the creation of your professional voice"
      },
      {
        "start": 516.695,
        "end": 521.135,
        "text": "clone, everything is automatically saved so you can leave and come back later. And so now you can"
      },
      {
        "start": 521.135,
        "end": 525.615,
        "text": "see that I've uploaded one hour and 31 minutes of audio for this professional voice clone. And for"
      },
      {
        "start": 525.615,
        "end": 530.615,
        "text": "the purpose of this tutorial, that will do. And before you submit the recordings, just by clicking"
      },
      {
        "start": 530.615,
        "end": 534.955,
        "text": "next you'll notice that you've got a few different options here on the right again you can preview"
      },
      {
        "start": 534.955,
        "end": 540.855,
        "text": "the audio that you've uploaded or just recorded you'll also delete them and you can also download"
      },
      {
        "start": 540.855,
        "end": 545.055,
        "text": "them if you're recording directly into 11 lab sometimes it's nice to have those recordings"
      },
      {
        "start": 545.055,
        "end": 549.815,
        "text": "as a backup in case you want to create another professional voice clone later and we also have"
      },
      {
        "start": 549.815,
        "end": 554.935,
        "text": "a few audio settings for each file you'll notice that I can actually trim the audio so let's say I"
      },
      {
        "start": 554.935,
        "end": 559.475,
        "text": "upload an audio file but I know I didn't want the second half of it I could go ahead and do that"
      },
      {
        "start": 559.475,
        "end": 568.235,
        "text": "And then if there were multiple speakers within that audio, so let's say you were using audio from a podcast, you can actually separate the speakers into different audio files."
      },
      {
        "start": 568.235,
        "end": 572.655,
        "text": "So you only have your own voice and not the other person from within that podcast."
      },
      {
        "start": 572.655,
        "end": 581.915,
        "text": "And then if there was a little bit of background noise in that recording, again, you can toggle this on to remove the background noise and clean the audio files using 11 Labs."
      },
      {
        "start": 581.915,
        "end": 586.275,
        "text": "So I'm not going to do any of this because I've already done pre-processing on my audio files."
      },
      {
        "start": 586.275,
        "end": 588.515,
        "text": "And now all I have to do is click next."
      },
      {
        "start": 588.515,
        "end": 593.275,
        "text": "And here we have one final step before we can begin creating our professional voice clone."
      },
      {
        "start": 593.275,
        "end": 595.275,
        "text": "And that is verifying the voice."
      },
      {
        "start": 595.275,
        "end": 602.235,
        "text": "And this is essentially an extra security step just to make sure you have the rights and the consent to professionally clone this voice."
      },
      {
        "start": 602.235,
        "end": 606.935,
        "text": "Curiosity sparks the joy of discovery in every child."
      },
      {
        "start": 606.935,
        "end": 611.095,
        "text": "And once that's done, as you can see, the professional voice clone is now being prepared."
      },
      {
        "start": 611.095,
        "end": 613.055,
        "text": "And this can take anywhere between two to six hours."
      },
      {
        "start": 613.055,
        "end": 615.915,
        "text": "On average, I tend to find it takes around three hours,"
      },
      {
        "start": 615.915,
        "end": 617.355,
        "text": "but this just depends on how many people"
      },
      {
        "start": 617.355,
        "end": 618.955,
        "text": "are also creating professional voice clones"
      },
      {
        "start": 618.955,
        "end": 620.455,
        "text": "and how long the queue is."
      },
      {
        "start": 620.455,
        "end": 621.355,
        "text": "And once it's created,"
      },
      {
        "start": 621.355,
        "end": 622.895,
        "text": "you'll be able to use it with text-to-speech,"
      },
      {
        "start": 622.895,
        "end": 624.755,
        "text": "speech-to-speech, conversational AI,"
      },
      {
        "start": 624.755,
        "end": 625.775,
        "text": "speak other languages,"
      },
      {
        "start": 625.775,
        "end": 628.775,
        "text": "and any of the AI voice tools within 11Labs."
      },
      {
        "start": 628.775,
        "end": 631.515,
        "text": "And so here's a quick preview of my professional voice clone."
      },
      {
        "start": 631.515,
        "end": 632.975,
        "text": "If you're enjoying the video so far,"
      },
      {
        "start": 632.975,
        "end": 634.735,
        "text": "don't hesitate to leave a like and subscribe"
      },
      {
        "start": 634.735,
        "end": 637.195,
        "text": "if you want to see more content like this."
      },
      {
        "start": 637.195,
        "end": 639.235,
        "text": "And so now that you have a professional voice clone,"
      },
      {
        "start": 639.235,
        "end": 640.555,
        "text": "if you miss a line in a video,"
      },
      {
        "start": 640.555,
        "end": 641.915,
        "text": "you can just type it out and swap it out"
      },
      {
        "start": 641.915,
        "end": 647.035,
        "text": "without having to re-record. You could also add calls to actions to your video's end screens,"
      },
      {
        "start": 647.035,
        "end": 651.835,
        "text": "again just by typing. You could even generate hundreds of hook variations for your trial reels"
      },
      {
        "start": 651.835,
        "end": 657.835,
        "text": "on Instagram so you can A-B test and then maintain voice consistency across all of your videos even"
      },
      {
        "start": 657.835,
        "end": 661.615,
        "text": "while you're on holiday. And the creative possibilities with your professional voice clone"
      },
      {
        "start": 661.615,
        "end": 666.035,
        "text": "are pretty much endless. If you have any questions about creating your own voice clone,"
      },
      {
        "start": 666.035,
        "end": 670.175,
        "text": "drop a comment in the comment section down below and if you want to see more videos about AI audio"
      },
      {
        "start": 670.175,
        "end": 675,
        "text": "and content. Don't forget to like this video and subscribe if you want to see more. Thanks for watching."
      }
    ],
    "frames": [
      {
        "time": 0,
        "file": "evidence_frames/f_00001.jpg",
        "ocr": "Soyoucancreatevoiceovers, | thatsoundlikeyou,bytypingitout."
      },
      {
        "time": 12,
        "file": "evidence_frames/f_00002.jpg",
        "ocr": ""
      },
      {
        "time": 24,
        "file": "evidence_frames/f_00003.jpg",
        "ocr": "Professional Voice Clone(PVC)"
      },
      {
        "time": 36,
        "file": "evidence_frames/f_00004.jpg",
        "ocr": "Tone | Hyper-realistic | Emotion | High-fidelity clone"
      },
      {
        "time": 48,
        "file": "evidence_frames/f_00005.jpg",
        "ocr": "Quality of audio"
      },
      {
        "time": 60,
        "file": "evidence_frames/f_00006.jpg",
        "ocr": "Useapopfiltertoremoveplosives | Plosive=soundsfrom\"P&B\""
      },
      {
        "time": 72,
        "file": "evidence_frames/f_00007.jpg",
        "ocr": ""
      },
      {
        "time": 84,
        "file": "evidence_frames/f_00008.jpg",
        "ocr": ""
      },
      {
        "time": 96,
        "file": "evidence_frames/f_00009.jpg",
        "ocr": "Addanew voice | New for | V3"
      },
      {
        "time": 108,
        "file": "evidence_frames/f_00010.jpg",
        "ocr": "Instant Voice Clone | Avid noisy environments | Check microphone quality | Upload Audio | Use consistent equipment | Background sounds interfere | Try exernal units or headphone Don’t change recording | sunsau Aajenb fujpaooea qM | mics for better audio capture. | equipment between samples. | DFeedback | Click to upload, or drag and drop | Record audio | 10 seconds of audio required"
      },
      {
        "time": 180,
        "file": "evidence_frames/f_00016.jpg",
        "ocr": ""
      },
      {
        "time": 192,
        "file": "evidence_frames/f_00017.jpg",
        "ocr": "InstantVoiceClone | Upload Audio | Preview voice | Voice Information | Name | DFeedback | Label | Value | Language | Add label | Description | 1 hereby contim that 1 have all necessary rights or consents to upload and clone these voice | samples and that. 1 will not use the pliatform-generated content. for any illegal, fraudulent, or | harmful purpose. 1 reaffim my obiigation to abide by EevenLabs"
      },
      {
        "time": 204,
        "file": "evidence_frames/f_00018.jpg",
        "ocr": ""
      },
      {
        "time": 216,
        "file": "evidence_frames/f_00019.jpg",
        "ocr": "InstantVoiceClone | Upload Audio | Preview voice | Voice Information | Name | DFeedback | Alec IVC | Label | Value | Language | English | Add label | Description | I hereby confim that I have all necessary rights or consents to upload and clone these voice | samples and that. I will not use the platform-generated content for any illegal, fraudulent, or | harmful purpose.1reafirm my obligation to a"
      },
      {
        "time": 240,
        "file": "evidence_frames/f_00021.jpg",
        "ocr": ""
      },
      {
        "time": 264,
        "file": "evidence_frames/f_00023.jpg",
        "ocr": "Selectamodel | Eleven v3(alpha) | The most expressive model. Supports 70+ languages.Requires | more prompt engineering than our previous models. In alpha | and the reliability will improve over time. | Afrikaans | Arabic | Armenian | +71more... | ElevenMultilingualv2 | HighQuality | Our | jife-like, emotionally rich mode in 29 languages. Best | overs,audiobooks,post-production, or any other | cont"
      },
      {
        "time": 288,
        "file": "evidence_frames/f_00025.jpg",
        "ocr": ""
      },
      {
        "time": 300,
        "file": "evidence_frames/f_00026.jpg",
        "ocr": ""
      },
      {
        "time": 312,
        "file": "evidence_frames/f_00027.jpg",
        "ocr": "Good | 30mins | Best | 2 hrs | Better | 1 hr | Upload samples | Record yourself | Your samples | PVC Traning Audio.wav | Processing | Your workcspace data isn't used to train our :"
      },
      {
        "time": 324,
        "file": "evidence_frames/f_00028.jpg",
        "ocr": "Acousticpanelsandcarpetsabsorbreflections, | reducingechoforclearer,moreprofessionalsound."
      },
      {
        "time": 336,
        "file": "evidence_frames/f_00029.jpg",
        "ocr": "Makesuretheenvironmentaroundyouisquiet"
      },
      {
        "time": 360,
        "file": "evidence_frames/f_00031.jpg",
        "ocr": "Targetaudiolevelrecording-23dBto-18dB | RMS:Representstheaverageloudnessofyouraudio. | Peaking:thebriefspikeswhen audiosuddenlygetstooloud."
      },
      {
        "time": 372,
        "file": "evidence_frames/f_00032.jpg",
        "ocr": "Clip Fx Editor-Parametric Equalizer:Audio 2,Voice Clone Tutorial.m4a,Effect4,00:06:15:08 | Presets: | VocalEnhancer | Gain | 40 | 20 | -20 | 40 | 60 | 10 | 15 | OdB | 10k | Frequency | 80Hz | 66Hz | 50Hz | 200Hz | 265Hz | 2861Hz | 12800Hz | 17458Hz | 18000Hz | Gain | 24dB/Oct | -7,6.d8 | OdB | 69dB | 6,3dB | OdB | 13,9dB | 24dB/Oct | Q/Width | 1.5 | Band | HP | LP | Constant:QOWidthUlra-QuietRange"
      },
      {
        "time": 384,
        "file": "evidence_frames/f_00033.jpg",
        "ocr": "IElevenLabs | Creative Platform | Home | 88voices | Introducing Eleven Music | Playground | ElevenLabs workspace | Goodafternoon,Alec | Have a questic | Talk to EI | Text to Speech | 8Voice Changer | Sound Effects | Voice lsolator | Products | Studio | Music | Instant speech | Audiobook | Conversational Al | Music | paga punos | Dubbed video | Dubing | Speech to Text | Latest from the library | Cr"
      },
      {
        "time": 396,
        "file": "evidence_frames/f_00034.jpg",
        "ocr": "ProresslonaryoiceClone | sound truly | ellent | Use professional recording equipment | Use high-quality recording equipment for optimal results as the Al will clone everything about the | audio High-qalty input = highqualty output.Any microphone will work,but an XLR mic going into | adedicedaudiointerface wouidb urecomendationAfewgeneralecendationsn | low-end would be something like an Audio Techn"
      },
      {
        "time": 408,
        "file": "evidence_frames/f_00035.jpg",
        "ocr": "Tips for making a great Professional Voice Clone | Here's a 4 minute guide to get the best results | How to make your | Professional Voice Clone | sound truly | Lellent | Use professional recording equipment | Use a Pop filter | Keep the recording noise free | Record in acoustically-treated room | Create new clone"
      },
      {
        "time": 420,
        "file": "evidence_frames/f_00036.jpg",
        "ocr": "Professional Voice Clone | Upload samples on the right and fill out details below. | Voice name | Aled | Language uset | Alec | This will allow ! | Alec's PVC | English | Alec’s old wizard | How would you describe this voice? Tihis de | Voice Library if you share your voice. | saduespeodn | Record yourself | Tips to help you get started | Label | Value | Click to read through the best way to get a"
      },
      {
        "time": 444,
        "file": "evidence_frames/f_00038.jpg",
        "ocr": "Professional Voice Clone | Upload samples on the right and fill out details below. | Record audio samples | Voice name | This is how your voice wilappe | Use a pro-grade mic | For the best results we recon | Alec'sPVC | not yield the best results. | Language used in audio samples | Avoid noisy environments | For the estesultscord in | English | Use a pre-selected script | creating | on the type of"
      },
      {
        "time": 456,
        "file": "evidence_frames/f_00039.jpg",
        "ocr": "Professional Voice Clone | Upload samples on the right and fil out details below. | Voicename | Youwant tohearsomethingkind ofridiculous?Myrecent | This is how yo | attempt atmeal prepping.So anyway,bought allthesefancy | Alec'sPVC | containers.Color-coded everything.Imean...yeah,spentan | sadues opne uposn aCenfur | This willatow us to process the audio corecty | entireSundaycooking.Just...feelin"
      },
      {
        "time": 468,
        "file": "evidence_frames/f_00040.jpg",
        "ocr": "ProfessionalVoice Clone | Upload samples on the right and fil oult details below. | Voice name | This is how your voice wil appear in the Voice Library | Alec's PVC | Language used in audio samples | This willalow us to process the audio correctly | English | How would you describe this voice? Tnis description will shd | Voice Library if you share your voice | Record yourself | Tips to help you ge"
      },
      {
        "time": 480,
        "file": "evidence_frames/f_00041.jpg",
        "ocr": ""
      },
      {
        "time": 504,
        "file": "evidence_frames/f_00043.jpg",
        "ocr": "Good | Professional Voice Clone | Upload samples on the right and fil oult details below. | Voice name | This is hoer yov | r voice will appear in the Voice Library | Alec's PVC | Better | Language used in audio samples | 1hr | This will allow us to process the audio correctly | 30 minutes provided | English | Upload samples | Record yourself | How would you describe this voice? This description w"
      },
      {
        "time": 516,
        "file": "evidence_frames/f_00044.jpg",
        "ocr": "Good | Professional Voice Clone | Upload samples on the right and fill out details below. | Voice name | voice wnll appear in the Voice Librafy | Alec's PVC | Better | saldues opne ui posn abenbue | 1h | This will allow us to process the audio correctly | 31m | papiAoud sagn | English | Upload samples | Record yourself | How would you describe this voice? This de | Voice Library if you shane your "
      },
      {
        "time": 552,
        "file": "evidence_frames/f_00047.jpg",
        "ocr": "Good | Professional Voice Clone | Upload samples on the right and fill out details below. | Voice name | Settings | Alec's PVC | Clean audio fles on your behalf | Background noise removal | Better | sajdues opne upasn aenBue | 1hr | esprovided | English | Trim audio | 0:00 | 30:30 | Record yourvelf | Description | Howr would you describe this voice? This description wil show up in the | Voice Libr"
      },
      {
        "time": 564,
        "file": "evidence_frames/f_00048.jpg",
        "ocr": ""
      },
      {
        "time": 576,
        "file": "evidence_frames/f_00049.jpg",
        "ocr": "Good | Professional Voice Clone | Upload samples on the right and fill out details below. | Voice name | Settings | Alec'sPVC | Background noise removal | Clean audio fles on your behalf | Better | sadues oipne upasn abenBue | This willallow us to process the audio correctly | esprovided | English | Trim audio | 0:00 | 30:30 | Recordyourselt | Howr would you describe this voice? This description w"
      },
      {
        "time": 588,
        "file": "evidence_frames/f_00050.jpg",
        "ocr": ""
      },
      {
        "time": 600,
        "file": "evidence_frames/f_00051.jpg",
        "ocr": "Verifyyourvoice | You hereby confirm that you have all necessary rights or consents to upload and clone these voice samples. | You taike fullresponsibiity for the accuracy of the files you upload to and generate on the Platform. You | reaffirm your obligation to abide by ElevenLabsTerms of Service and Privacy Policy | Curiositysparksthejoyof | discoveryineverychild. | 0:00 | Submit recording | Bac"
      },
      {
        "time": 612,
        "file": "evidence_frames/f_00052.jpg",
        "ocr": ""
      },
      {
        "time": 624,
        "file": "evidence_frames/f_00053.jpg",
        "ocr": ""
      },
      {
        "time": 636,
        "file": "evidence_frames/f_00054.jpg",
        "ocr": "Eflect Cont | Transcript | suogde | Alien_s_Brooklym_Caf_Encounter | eti Colo | roe: [no dips) | No captions available | Create captionsfrom transcript | Creste new caption track | Import captions from fle | 00:00:06:16 | Q | :00:07:00 | 00:00:08:00 | Frame Rune | Media Start | ers_Boky_Ca_Enc24p0 ps | 00000000 | 00000000 | 00000000 | 00:000000 | 21 | 34 | 7 | 91:90:00:00"
      },
      {
        "time": 648,
        "file": "evidence_frames/f_00055.jpg",
        "ocr": "Reels Friendsp | startup | Wevemrda oatSlirTupOR"
      },
      {
        "time": 660,
        "file": "evidence_frames/f_00056.jpg",
        "ocr": ""
      }
    ]
  },
  "outputTemplate": {
    "schemaVersion": 1,
    "candidateTerm": "Voice Cloning",
    "proposalHash": "sha256:9685216228988afbcba2d89d9af847e2b1fe4d2d89958699431ab5c1831340fb",
    "evidenceHash": "sha256:ecfd1fd17bf74c351ad9eb117674be563f5d506fa40954a698a2511b4b6f5b96",
    "assessmentHash": "sha256:d43093c7b2b78c6fed30b7027f1d4ebe5337b2b03165eca3e9ba35e859b567ee",
    "createdAt": "2026-07-24",
    "node": {
      "aliases": [],
      "maturity": "stable",
      "heat": 0.5,
      "body": "",
      "cases": [],
      "sources": []
    },
    "deepDive": {
      "title": "声音克隆",
      "subtitle": "",
      "aliases": "",
      "meta": "",
      "thesis": "",
      "html": ""
    }
  }
}
```
