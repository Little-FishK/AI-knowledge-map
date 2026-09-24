/* arXiv 资料编辑收录；逐条证据与未覆盖范围见 docs/ARXIV_CONTENT_REVIEW_20260923.md。
 * 同一成果的多入口合并；不收录未经审核的候选，不保存论文全文。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("arXiv资料包需要先加载资料库");
  const entries = [
  {
    "id": "arxiv-1706-03762",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1706.03762",
    "reviewedVersion": "v7",
    "title": "Attention Is All You Need",
    "publisher": "Ashish Vaswani 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1706.03762",
    "publishedAt": "2017-06-12",
    "accessedAt": "2026-09-23",
    "summary": "用多头自注意力、位置编码和编码器—解码器结构构建 Transformer，改变序列建模对循环计算的依赖。",
    "selectionReason": "基础方法：用多头自注意力、位置编码和编码器—解码器结构构建 Transformer，改变序列建模对循环计算的依赖。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 架构、§6 实验、§7 结论；本轮核对 v7。",
    "limitations": [
      "原文以机器翻译与句法分析为主；不能由这些实验推出所有任务均优于循环网络。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "Transformer",
      "注意力机制",
      "位置编码与 RoPE"
    ],
    "linkedNodes": [
      "transformer",
      "attention",
      "positional-encoding"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1706.03762v7",
      "sections": "§3 架构、§6 实验、§7 结论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1810-04805",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1810.04805",
    "reviewedVersion": "v2",
    "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    "publisher": "Jacob Devlin 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1810.04805",
    "publishedAt": "2018-10-11",
    "accessedAt": "2026-09-23",
    "summary": "以掩码语言建模预训练双向文本表示，再对分类、问答等任务微调，是理解编码器预训练的重要原作。",
    "selectionReason": "基础方法：以掩码语言建模预训练双向文本表示，再对分类、问答等任务微调，是理解编码器预训练的重要原作。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 实验、§5 消融；本轮核对 v2。",
    "limitations": [
      "原文的下一句预测消融结论限定于其训练设置；不能认为所有后续编码器都必须使用该目标。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "预训练",
      "自监督学习",
      "嵌入 Embedding"
    ],
    "linkedNodes": [
      "pretraining",
      "self-supervised-learning",
      "embedding"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1810.04805v2",
      "sections": "§3 方法、§4 实验、§5 消融",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2005-14165",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2005.14165",
    "reviewedVersion": "v4",
    "title": "Language Models are Few-Shot Learners",
    "publisher": "Tom B. Brown 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2005.14165",
    "publishedAt": "2020-05-28",
    "accessedAt": "2026-09-23",
    "summary": "通过不同规模 GPT-3 的零样本、单样本与少样本实验，研究不更新权重的上下文学习。",
    "selectionReason": "关键研究：通过不同规模 GPT-3 的零样本、单样本与少样本实验，研究不更新权重的上下文学习。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 结果、§4 污染、§5 限制；本轮核对 v4。",
    "limitations": [
      "部分推理任务仍有明显弱点；须结合污染分析，不能把参数量视为任务能力保证。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "大语言模型 LLM",
      "上下文学习"
    ],
    "linkedNodes": [
      "llm",
      "in-context-learning"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2005.14165v4",
      "sections": "§2 方法、§3 结果、§4 污染、§5 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2001-08361",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2001.08361",
    "reviewedVersion": "v1",
    "title": "Scaling Laws for Neural Language Models",
    "publisher": "Jared Kaplan 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2001.08361",
    "publishedAt": "2020-01-23",
    "accessedAt": "2026-09-23",
    "summary": "研究语言建模损失随参数、数据和计算预算变化的经验规律，为训练资源分配提供可检验模型。",
    "selectionReason": "基础方法：研究语言建模损失随参数、数据和计算预算变化的经验规律，为训练资源分配提供可检验模型。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§1.2 规律、§3—6 实验、§8 讨论；本轮核对 v1。",
    "limitations": [
      "这是给定训练条件下的经验拟合；计算最优分配须结合 Chinchilla 等后续修正，不能当作普遍定律。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "缩放定律"
    ],
    "linkedNodes": [
      "scaling-law"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2001.08361v1",
      "sections": "§1.2 规律、§3—6 实验、§8 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2203-15556",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2203.15556",
    "reviewedVersion": "v1",
    "title": "Training Compute-Optimal Large Language Models",
    "publisher": "Jordan Hoffmann 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2203.15556",
    "publishedAt": "2022-03-29",
    "accessedAt": "2026-09-23",
    "summary": "重新估计固定计算预算下模型规模与训练 token 的分配，并用 Chinchilla 对预测进行验证。",
    "selectionReason": "关键改进：重新估计固定计算预算下模型规模与训练 token 的分配，并用 Chinchilla 对预测进行验证。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 三种估计、§4 Chinchilla、§5 讨论；本轮核对 v1。",
    "limitations": [
      "计算最优训练不等于包含推理开销的部署总成本最优；比例依赖数据与训练条件。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "缩放定律",
      "预训练"
    ],
    "linkedNodes": [
      "scaling-law",
      "pretraining"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2203.15556v1",
      "sections": "§3 三种估计、§4 Chinchilla、§5 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1512-03385",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1512.03385",
    "reviewedVersion": "v1",
    "title": "Deep Residual Learning for Image Recognition",
    "publisher": "Kaiming He 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1512.03385",
    "publishedAt": "2015-12-10",
    "accessedAt": "2026-09-23",
    "summary": "通过残差分支和捷径连接学习映射增量，针对深层网络训练退化给出方法与图像识别实验。",
    "selectionReason": "基础方法：通过残差分支和捷径连接学习映射增量，针对深层网络训练退化给出方法与图像识别实验。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 残差学习、§4 ImageNet/CIFAR 实验；本轮核对 v1。",
    "limitations": [
      "训练退化与过拟合不是同一问题；残差连接不能保证任意深度或任务都更好。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "残差连接",
      "卷积神经网络 CNN"
    ],
    "linkedNodes": [
      "residual-connection",
      "cnn"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1512.03385v1",
      "sections": "§3 残差学习、§4 ImageNet/CIFAR 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1412-6980",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1412.6980",
    "reviewedVersion": "v9",
    "title": "Adam: A Method for Stochastic Optimization",
    "publisher": "Diederik P. Kingma 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1412.6980",
    "publishedAt": "2014-12-22",
    "accessedAt": "2026-09-23",
    "summary": "用梯度一阶矩和二阶矩的滑动估计及偏差校正构造 Adam 优化器，提供算法与实验。",
    "selectionReason": "基础方法：用梯度一阶矩和二阶矩的滑动估计及偏差校正构造 Adam 优化器，提供算法与实验。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 算法、§3 偏差校正、§6 实验；本轮核对 v9。",
    "limitations": [
      "原文不能证明任意非凸训练都收敛或优于 SGD；超参数仍需验证。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "梯度下降",
      "优化器与学习率调度"
    ],
    "linkedNodes": [
      "gradient-descent",
      "optimizer-schedule"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/pdf/1412.6980v9",
      "sections": "§2 算法、§3 偏差校正、§6 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1502-03167",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1502.03167",
    "reviewedVersion": "v3",
    "title": "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift",
    "publisher": "Sergey Ioffe 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1502.03167",
    "publishedAt": "2015-02-11",
    "accessedAt": "2026-09-23",
    "summary": "提出按小批量统计量归一化并学习缩放、平移的 Batch Normalization，比较训练速度与精度。",
    "selectionReason": "基础方法：提出按小批量统计量归一化并学习缩放、平移的 Batch Normalization，比较训练速度与精度。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 算法、§4 实验；本轮核对 v3。",
    "limitations": [
      "训练与推理使用不同统计方式；标题中的内部协变量偏移解释不能作为机制已获定论的证明。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "批归一化 Batch Norm",
      "层归一化与 RMSNorm"
    ],
    "linkedNodes": [
      "batch-norm",
      "normalization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/pdf/1502.03167v3",
      "sections": "§3 算法、§4 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1406-2661",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1406.2661",
    "reviewedVersion": "v1",
    "title": "Generative Adversarial Networks",
    "publisher": "Ian J. Goodfellow 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1406.2661",
    "publishedAt": "2014-06-10",
    "accessedAt": "2026-09-23",
    "summary": "把生成器与判别器组织成对抗训练，给出目标函数、理想化分析和初始生成实验。",
    "selectionReason": "基础方法：把生成器与判别器组织成对抗训练，给出目标函数、理想化分析和初始生成实验。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 对抗网络、§4 理论条件、§5—6 实验与缺点；本轮核对 v1。",
    "limitations": [
      "理论结果依赖理想化条件，不能保证实际神经网络训练稳定或避免模式坍塌。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "生成对抗网络 GAN",
      "图像生成"
    ],
    "linkedNodes": [
      "gan",
      "image-generation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1406.2661v1",
      "sections": "§3 对抗网络、§4 理论条件、§5—6 实验与缺点",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1312-6114",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1312.6114",
    "reviewedVersion": "v11",
    "title": "Auto-Encoding Variational Bayes",
    "publisher": "Diederik P Kingma 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1312.6114",
    "publishedAt": "2013-12-20",
    "accessedAt": "2026-09-23",
    "summary": "通过重参数化估计变分下界，并训练近似后验网络，形成变分自编码器的核心学习方法。",
    "selectionReason": "基础方法：通过重参数化估计变分下界，并训练近似后验网络，形成变分自编码器的核心学习方法。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 VAE、§5 实验；本轮核对 v11。",
    "limitations": [
      "近似后验与潜变量假设影响结果；下界优化不等于精确后验推断。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "变分自编码器 VAE"
    ],
    "linkedNodes": [
      "vae"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1312.6114v11",
      "sections": "§2 方法、§3 VAE、§5 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2006-11239",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2006.11239",
    "reviewedVersion": "v2",
    "title": "Denoising Diffusion Probabilistic Models",
    "publisher": "Jonathan Ho 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2006.11239",
    "publishedAt": "2020-06-19",
    "accessedAt": "2026-09-23",
    "summary": "研究逐步加噪与学习去噪的扩散生成，说明噪声预测目标与去噪分数匹配的联系。",
    "selectionReason": "基础方法：研究逐步加噪与学习去噪的扩散生成，说明噪声预测目标与去噪分数匹配的联系。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 参数化与目标、§4 实验；本轮核对 v2。",
    "limitations": [
      "原作采样需要多次模型调用；图像实验不能直接代表后来的快速采样或视频生成效果。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "扩散模型",
      "图像生成"
    ],
    "linkedNodes": [
      "diffusion",
      "image-generation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2006.11239v2",
      "sections": "§3 参数化与目标、§4 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2112-10752",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2112.10752",
    "reviewedVersion": "v2",
    "title": "High-Resolution Image Synthesis with Latent Diffusion Models",
    "publisher": "Robin Rombach 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2112.10752",
    "publishedAt": "2021-12-20",
    "accessedAt": "2026-09-23",
    "summary": "将扩散建模移入压缩潜空间，并引入条件控制，在生成质量与计算开销间取得新的取舍。",
    "selectionReason": "关键改进：将扩散建模移入压缩潜空间，并引入条件控制，在生成质量与计算开销间取得新的取舍。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 实验、§5 限制；本轮核对 v2。",
    "limitations": [
      "压缩会损失细节；采样仍有成本，文本控制和复杂组合能力有局限。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "扩散模型",
      "图像生成"
    ],
    "linkedNodes": [
      "diffusion",
      "image-generation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2112.10752v2",
      "sections": "§3 方法、§4 实验、§5 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2005-11401",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2005.11401",
    "reviewedVersion": "v4",
    "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    "publisher": "Patrick Lewis 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2005.11401",
    "publishedAt": "2020-05-22",
    "accessedAt": "2026-09-23",
    "summary": "把稠密检索器与序列生成器结合，比较按序列与按 token 使用检索证据的 RAG 模型。",
    "selectionReason": "基础方法：把稠密检索器与序列生成器结合，比较按序列与按 token 使用检索证据的 RAG 模型。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3—4 实验、§6 讨论；本轮核对 v4。",
    "limitations": [
      "检索内容可能错误或带偏见；检索增强不保证回答真实，也不等同于所有现代 RAG 系统。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "RAG 检索增强生成",
      "检索与语义搜索"
    ],
    "linkedNodes": [
      "rag",
      "retrieval"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2005.11401v4",
      "sections": "§2 方法、§3—4 实验、§6 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2004-04906",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2004.04906",
    "reviewedVersion": "v3",
    "title": "Dense Passage Retrieval for Open-Domain Question Answering",
    "publisher": "Vladimir Karpukhin 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2004.04906",
    "publishedAt": "2020-04-10",
    "accessedAt": "2026-09-23",
    "summary": "以问题和段落双编码器及负样本训练实现稠密段落检索，检验其对开放域问答的作用。",
    "selectionReason": "基础方法：以问题和段落双编码器及负样本训练实现稠密段落检索，检验其对开放域问答的作用。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 DPR、§5 检索与消融、§6 问答；本轮核对 v3。",
    "limitations": [
      "稀有实体与关键词匹配仍可能有利于 BM25；不能宣称稠密检索全面取代稀疏检索。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "检索与语义搜索",
      "嵌入 Embedding"
    ],
    "linkedNodes": [
      "retrieval",
      "embedding"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2004.04906v3",
      "sections": "§3 DPR、§5 检索与消融、§6 问答",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1910-13461",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1910.13461",
    "reviewedVersion": "v1",
    "title": "BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension",
    "publisher": "Mike Lewis 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1910.13461",
    "publishedAt": "2019-10-29",
    "accessedAt": "2026-09-23",
    "summary": "用双向编码器与自回归解码器重建受损文本，系统比较去噪目标对理解和生成任务的影响。",
    "selectionReason": "基础方法：用双向编码器与自回归解码器重建受损文本，系统比较去噪目标对理解和生成任务的影响。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 模型、§4 目标比较、§5 实验；本轮核对 v1。",
    "limitations": [
      "不同破坏策略与预训练目标表现依任务变化；不是所有任务通用最优方案。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "预训练",
      "自监督学习"
    ],
    "linkedNodes": [
      "pretraining",
      "self-supervised-learning"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1910.13461v1",
      "sections": "§2 模型、§4 目标比较、§5 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2201-11903",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2201.11903",
    "reviewedVersion": "v6",
    "title": "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    "publisher": "Jason Wei 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2201.11903",
    "publishedAt": "2022-01-28",
    "accessedAt": "2026-09-23",
    "summary": "在提示示例中加入中间推理步骤，研究思维链对算术、常识和符号任务的影响。",
    "selectionReason": "基础方法：在提示示例中加入中间推理步骤，研究思维链对算术、常识和符号任务的影响。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3—5 实验、§6 讨论；本轮核对 v6。",
    "limitations": [
      "效果依模型规模和提示而变；生成的推理文字不等于内部机制的忠实解释。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "思维链 CoT",
      "提示工程"
    ],
    "linkedNodes": [
      "cot",
      "prompt-engineering"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2201.11903v6",
      "sections": "§2 方法、§3—5 实验、§6 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2203-11171",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2203.11171",
    "reviewedVersion": "v4",
    "title": "Self-Consistency Improves Chain of Thought Reasoning in Language Models",
    "publisher": "Xuezhi Wang 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2203.11171",
    "publishedAt": "2022-03-21",
    "accessedAt": "2026-09-23",
    "summary": "采样多条推理路径并聚合最终答案，检验自一致性相对贪心思维链解码的收益。",
    "selectionReason": "关键改进：采样多条推理路径并聚合最终答案，检验自一致性相对贪心思维链解码的收益。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 对比、§5 限制；本轮核对 v4。",
    "limitations": [
      "多次采样增加成本；多数答案也可能共同出错，聚合结果不能替代事实核验。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "自洽性",
      "思维链 CoT"
    ],
    "linkedNodes": [
      "self-consistency",
      "cot"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2203.11171v4",
      "sections": "§2 方法、§3 对比、§5 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2305-10601",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2305.10601",
    "reviewedVersion": "v2",
    "title": "Tree of Thoughts: Deliberate Problem Solving with Large Language Models",
    "publisher": "Shunyu Yao 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2305.10601",
    "publishedAt": "2023-05-17",
    "accessedAt": "2026-09-23",
    "summary": "把中间思路作为可评估、可回溯的搜索状态，用思维树探索多条问题求解路径。",
    "selectionReason": "关键改进：把中间思路作为可评估、可回溯的搜索状态，用思维树探索多条问题求解路径。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 搜索方法、§4 实验、§6 限制；本轮核对 v2。",
    "limitations": [
      "主实验集中于三类任务；搜索开销和错误的状态评估可能抵消收益。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "思维树 ToT",
      "规划与任务分解"
    ],
    "linkedNodes": [
      "tree-of-thoughts",
      "planning"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2305.10601v2",
      "sections": "§3 搜索方法、§4 实验、§6 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2210-03629",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2210.03629",
    "reviewedVersion": "v3",
    "title": "ReAct: Synergizing Reasoning and Acting in Language Models",
    "publisher": "Shunyu Yao 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2210.03629",
    "publishedAt": "2022-10-06",
    "accessedAt": "2026-09-23",
    "summary": "让语言推理与环境行动交替进行，研究 ReAct 在问答、事实核验与交互任务中的表现。",
    "selectionReason": "基础方法：让语言推理与环境行动交替进行，研究 ReAct 在问答、事实核验与交互任务中的表现。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3—4 实验、§6 结论；本轮核对 v3。",
    "limitations": [
      "表现依工具反馈、示例和动作空间；可读轨迹不保证推理正确或行动安全。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "ReAct 推理+行动",
      "Agent 循环"
    ],
    "linkedNodes": [
      "react",
      "agent-loop"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2210.03629v3",
      "sections": "§2 方法、§3—4 实验、§6 结论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2302-04761",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2302.04761",
    "reviewedVersion": "v1",
    "title": "Toolformer: Language Models Can Teach Themselves to Use Tools",
    "publisher": "Timo Schick 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2302.04761",
    "publishedAt": "2023-02-09",
    "accessedAt": "2026-09-23",
    "summary": "通过采样工具调用、执行并按后续文本损失筛选训练样本，让模型学习何时使用外部工具。",
    "selectionReason": "关键改进：通过采样工具调用、执行并按后续文本损失筛选训练样本，让模型学习何时使用外部工具。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 工具、§4 实验、§7 限制；本轮核对 v1。",
    "limitations": [
      "原文工具集和调用形式有限；未把每次工具调用成本纳入决策，也不是通用工具安全方案。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "工具调用 / 函数调用"
    ],
    "linkedNodes": [
      "tool-calling"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2302.04761v1",
      "sections": "§2 方法、§3 工具、§4 实验、§7 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2303-11366",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2303.11366",
    "reviewedVersion": "v4",
    "title": "Reflexion: Language Agents with Verbal Reinforcement Learning",
    "publisher": "Noah Shinn 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2303.11366",
    "publishedAt": "2023-03-20",
    "accessedAt": "2026-09-23",
    "summary": "把任务反馈转成语言反思并存入记忆，研究不更新模型权重的多轮 Agent 改进。",
    "selectionReason": "基础方法：把任务反馈转成语言反思并存入记忆，研究不更新模型权重的多轮 Agent 改进。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 实验、§5 限制；本轮核对 v4。",
    "limitations": [
      "反馈和自评可能错误；依赖重试预算，语言强化不等同于通过梯度更新的强化学习。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "自我反思",
      "Agent 记忆"
    ],
    "linkedNodes": [
      "reflection",
      "agent-memory"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2303.11366v4",
      "sections": "§3 方法、§4 实验、§5 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2310-06770",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2310.06770",
    "reviewedVersion": "v3",
    "title": "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?",
    "publisher": "Carlos E. Jimenez 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2310.06770",
    "publishedAt": "2023-10-10",
    "accessedAt": "2026-09-23",
    "summary": "从真实 GitHub 问题和补丁构造可执行软件修复评测，区分修复目标测试与保持既有行为。",
    "selectionReason": "关键资源：从真实 GitHub 问题和补丁构造可执行软件修复评测，区分修复目标测试与保持既有行为。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 基准、§4—5 实验、§7 讨论、附录A验证；本轮核对 v3。",
    "limitations": [
      "基准的仓库、语言和测试覆盖有限；测试通过不等于补丁完整正确，也不代表当前榜单。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "模型评测与基准",
      "代码生成 / AI 编程"
    ],
    "linkedNodes": [
      "model-evaluation",
      "code-generation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2310.06770v3",
      "sections": "§2 基准、§4—5 实验、§7 讨论、附录A验证",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2205-14135",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2205.14135",
    "reviewedVersion": "v2",
    "title": "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
    "publisher": "Tri Dao 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2205.14135",
    "publishedAt": "2022-05-27",
    "accessedAt": "2026-09-23",
    "summary": "通过分块与重计算减少注意力计算的显存读写，在保持精确注意力的同时改善速度和内存使用。",
    "selectionReason": "关键改进：通过分块与重计算减少注意力计算的显存读写，在保持精确注意力的同时改善速度和内存使用。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 算法与IO分析、§4 实验、§5 限制；本轮核对 v2。",
    "limitations": [
      "精确指算法而非浮点逐位一致；加速依赖硬件和内核，不改变标准注意力的二次计算规模。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "注意力机制",
      "推理优化"
    ],
    "linkedNodes": [
      "attention",
      "inference-optimization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2205.14135v2",
      "sections": "§3 算法与IO分析、§4 实验、§5 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2106-09685",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2106.09685",
    "reviewedVersion": "v2",
    "title": "LoRA: Low-Rank Adaptation of Large Language Models",
    "publisher": "Edward J. Hu 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2106.09685",
    "publishedAt": "2021-06-17",
    "accessedAt": "2026-09-23",
    "summary": "冻结基座权重，以低秩增量矩阵完成适配，比较 LoRA 与全参数微调及其他参数高效方法。",
    "selectionReason": "基础方法：冻结基座权重，以低秩增量矩阵完成适配，比较 LoRA 与全参数微调及其他参数高效方法。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§4 方法、§5 实验、§7 秩分析、§8 展望；本轮核对 v2。",
    "limitations": [
      "秩、目标层和任务都会影响效果；不能保证任意任务与全参数微调等效。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "参数高效微调 PEFT / LoRA",
      "微调 Fine-tuning"
    ],
    "linkedNodes": [
      "peft-lora",
      "fine-tuning"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2106.09685v2",
      "sections": "§4 方法、§5 实验、§7 秩分析、§8 展望",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2305-14314",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2305.14314",
    "reviewedVersion": "v1",
    "title": "QLoRA: Efficient Finetuning of Quantized LLMs",
    "publisher": "Tim Dettmers 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2305.14314",
    "publishedAt": "2023-05-23",
    "accessedAt": "2026-09-23",
    "summary": "结合量化基座、低秩适配器、双重量化与分页优化器，降低大模型微调的显存门槛。",
    "selectionReason": "关键改进：结合量化基座、低秩适配器、双重量化与分页优化器，降低大模型微调的显存门槛。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 QLoRA、§4—5 实验、§8 限制；本轮核对 v1。",
    "limitations": [
      "原文未证明33B和65B规模全面匹配16位全参数微调；显存数字依序列长度与批量而变。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "参数高效微调 PEFT / LoRA",
      "量化 Quantization"
    ],
    "linkedNodes": [
      "peft-lora",
      "quantization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2305.14314v1",
      "sections": "§3 QLoRA、§4—5 实验、§8 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2210-17323",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2210.17323",
    "reviewedVersion": "v2",
    "title": "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",
    "publisher": "Elias Frantar 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2210.17323",
    "publishedAt": "2022-10-31",
    "accessedAt": "2026-09-23",
    "summary": "利用近似二阶信息逐层压缩预训练 Transformer 权重，研究低位训练后量化的精度与部署取舍。",
    "selectionReason": "关键改进：利用近似二阶信息逐层压缩预训练 Transformer 权重，研究低位训练后量化的精度与部署取舍。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§4 算法、§5 验证、§6 限制；本轮核对 v2。",
    "limitations": [
      "主要压缩权重；加速依硬件与实现，不等于所有计算减少，低位宽会带来任务相关误差。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "量化 Quantization"
    ],
    "linkedNodes": [
      "quantization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2210.17323v2",
      "sections": "§4 算法、§5 验证、§6 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2309-06180",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2309.06180",
    "reviewedVersion": "v1",
    "title": "Efficient Memory Management for Large Language Model Serving with PagedAttention",
    "publisher": "Woosuk Kwon 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2309.06180",
    "publishedAt": "2023-09-12",
    "accessedAt": "2026-09-23",
    "summary": "用分页式 KV 缓存管理和共享机制构建 vLLM，解决动态生成中缓存预留与碎片造成的浪费。",
    "selectionReason": "关键改进：用分页式 KV 缓存管理和共享机制构建 vLLM，解决动态生成中缓存预留与碎片造成的浪费。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§4 方法、§6 评测、§7 消融、§8 讨论；本轮核对 v1。",
    "limitations": [
      "吞吐提升依负载、模型与硬件；论文实验不能作为当前版本的固定性能承诺。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "部署形态",
      "推理优化"
    ],
    "linkedNodes": [
      "deployment",
      "inference-optimization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2309.06180v1",
      "sections": "§4 方法、§6 评测、§7 消融、§8 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2103-00020",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2103.00020",
    "reviewedVersion": "v1",
    "title": "Learning Transferable Visual Models From Natural Language Supervision",
    "publisher": "Alec Radford 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2103.00020",
    "publishedAt": "2021-02-26",
    "accessedAt": "2026-09-23",
    "summary": "以图文对比学习训练 CLIP，并用自然语言描述实现零样本图像分类，研究跨数据集迁移。",
    "selectionReason": "基础方法：以图文对比学习训练 CLIP，并用自然语言描述实现零样本图像分类，研究跨数据集迁移。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 迁移、§6 限制、§7 影响；本轮核对 v1。",
    "limitations": [
      "细粒度、计数等任务仍有弱点；文本提示和数据偏差会改变表现。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "CLIP 图文对比学习",
      "多模态",
      "对比学习"
    ],
    "linkedNodes": [
      "clip",
      "multimodal",
      "contrastive-learning"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2103.00020v1",
      "sections": "§2 方法、§3 迁移、§6 限制、§7 影响",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2212-04356",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2212.04356",
    "reviewedVersion": "v1",
    "title": "Robust Speech Recognition via Large-Scale Weak Supervision",
    "publisher": "Alec Radford 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2212.04356",
    "publishedAt": "2022-12-06",
    "accessedAt": "2026-09-23",
    "summary": "通过大规模弱监督多语言语音训练研究 Whisper 的零样本识别、翻译与鲁棒性。",
    "selectionReason": "关键资源：通过大规模弱监督多语言语音训练研究 Whisper 的零样本识别、翻译与鲁棒性。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 实验、§4 消融、§6 限制；本轮核对 v1。",
    "limitations": [
      "低资源语言表现不均；长音频解码和文本规范化影响结果，不能保证无幻觉转写。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "语音识别与合成"
    ],
    "linkedNodes": [
      "speech"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2212.04356v1",
      "sections": "§2 方法、§3 实验、§4 消融、§6 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2306-00978",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2306.00978",
    "reviewedVersion": "v6",
    "title": "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration",
    "publisher": "Ji Lin 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2306.00978",
    "publishedAt": "2023-06-01",
    "accessedAt": "2026-09-23",
    "summary": "根据激活统计保护重要权重通道，配合低位内核研究 AWQ 的模型压缩与端侧推理。",
    "selectionReason": "关键改进：根据激活统计保护重要权重通道，配合低位内核研究 AWQ 的模型压缩与端侧推理。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 AWQ、§4 TinyChat、§5 实验；本轮核对 v6。",
    "limitations": [
      "校准集、位宽和设备影响效果；仅减小权重不自动带来同等端到端加速。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "量化 Quantization"
    ],
    "linkedNodes": [
      "quantization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2306.00978v6",
      "sections": "§3 AWQ、§4 TinyChat、§5 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2302-13971",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2302.13971",
    "reviewedVersion": "v1",
    "title": "LLaMA: Open and Efficient Foundation Language Models",
    "publisher": "Hugo Touvron 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2302.13971",
    "publishedAt": "2023-02-27",
    "accessedAt": "2026-09-23",
    "summary": "报告初代 LLaMA 的数据配方、架构与评测，展示更充分训练较小模型的研究路线。",
    "selectionReason": "关键资源：报告初代 LLaMA 的数据配方、架构与评测，展示更充分训练较小模型的研究路线。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 训练、§3 结果、§5 风险；本轮核对 v1。",
    "limitations": [
      "初代模型、许可与结果不能套用到后续 Llama 版本；模型仍有偏见、毒性和错误。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "主流模型家族",
      "预训练"
    ],
    "linkedNodes": [
      "model-families",
      "pretraining"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2302.13971v1",
      "sections": "§2 训练、§3 结果、§5 风险",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2203-02155",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2203.02155",
    "reviewedVersion": "v1",
    "title": "Training language models to follow instructions with human feedback",
    "publisher": "Long Ouyang 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2203.02155",
    "publishedAt": "2022-03-04",
    "accessedAt": "2026-09-23",
    "summary": "通过示范微调、偏好奖励模型与 PPO 训练 InstructGPT，比较人类偏好及能力回退。",
    "selectionReason": "基础方法：通过示范微调、偏好奖励模型与 PPO 训练 InstructGPT，比较人类偏好及能力回退。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 结果、§5 讨论；本轮核对 v1。",
    "limitations": [
      "对齐的是特定标注群体和任务分布；偏好提升不意味着真实、安全或无偏。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "RLHF 与偏好对齐",
      "后训练 Post-training"
    ],
    "linkedNodes": [
      "rlhf",
      "post-training"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2203.02155v1",
      "sections": "§3 方法、§4 结果、§5 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2305-18290",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2305.18290",
    "reviewedVersion": "v3",
    "title": "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
    "publisher": "Rafael Rafailov 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2305.18290",
    "publishedAt": "2023-05-29",
    "accessedAt": "2026-09-23",
    "summary": "把偏好优化转为直接作用于策略的分类目标，比较 DPO 与显式奖励建模加强化学习的训练流程。",
    "selectionReason": "关键改进：把偏好优化转为直接作用于策略的分类目标，比较 DPO 与显式奖励建模加强化学习的训练流程。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§4 DPO目标、§5 理论分析、§6 实验；本轮核对 v3。",
    "limitations": [
      "依赖偏好数据、参考策略与目标假设；不保证偏好等于事实正确或所有任务优于RLHF。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "对齐 Alignment",
      "后训练 Post-training"
    ],
    "linkedNodes": [
      "alignment",
      "post-training"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2305.18290v3",
      "sections": "§4 DPO目标、§5 理论分析、§6 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2307-15043",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2307.15043",
    "reviewedVersion": "v2",
    "title": "Universal and Transferable Adversarial Attacks on Aligned Language Models",
    "publisher": "Andy Zou 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2307.15043",
    "publishedAt": "2023-07-27",
    "accessedAt": "2026-09-23",
    "summary": "研究对齐语言模型中的可迁移对抗提示，提供评测拒答与对抗鲁棒性的方法材料。",
    "selectionReason": "边界研究：研究对齐语言模型中的可迁移对抗提示，提供评测拒答与对抗鲁棒性的方法材料。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：攻击方法、实验设置与迁移评测、限制；本轮核对 v2。",
    "limitations": [
      "成功率依模型、攻击设置和接口版本；不能推断所有现行防护均失效。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "越狱 Jailbreak",
      "对抗样本与鲁棒性"
    ],
    "linkedNodes": [
      "jailbreak",
      "adversarial-robustness"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2307.15043v2",
      "sections": "攻击方法、实验设置与迁移评测、限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2302-12173",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2302.12173",
    "reviewedVersion": "v2",
    "title": "Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection",
    "publisher": "Kai Greshake 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2302.12173",
    "publishedAt": "2023-02-23",
    "accessedAt": "2026-09-23",
    "summary": "通过间接提示注入分析外部检索内容与应用指令混淆的风险，研究集成语言模型应用的信任边界。",
    "selectionReason": "边界研究：通过间接提示注入分析外部检索内容与应用指令混淆的风险，研究集成语言模型应用的信任边界。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：威胁模型、攻击场景、实验与缓解讨论；本轮核对 v2。",
    "limitations": [
      "属于特定系统和演示案例的安全研究；不能以个别攻击代表当前所有产品状态。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "提示注入"
    ],
    "linkedNodes": [
      "prompt-injection"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2302.12173v2",
      "sections": "威胁模型、攻击场景、实验与缓解讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2212-08073",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2212.08073",
    "reviewedVersion": "v1",
    "title": "Constitutional AI: Harmlessness from AI Feedback",
    "publisher": "Yuntao Bai 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2212.08073",
    "publishedAt": "2022-12-15",
    "accessedAt": "2026-09-23",
    "summary": "用显式原则生成批评和修订，再以 AI 偏好反馈训练模型，研究 Constitutional AI 的对齐流程。",
    "selectionReason": "基础方法：用显式原则生成批评和修订，再以 AI 偏好反馈训练模型，研究 Constitutional AI 的对齐流程。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：监督学习阶段、AI反馈强化学习、评测与讨论；本轮核对 v1。",
    "limitations": [
      "原则选择与AI评价仍可能产生偏差；无害性不等于普遍价值共识。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "宪法 AI",
      "对齐 Alignment"
    ],
    "linkedNodes": [
      "constitutional-ai",
      "alignment"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2212.08073v1",
      "sections": "监督学习阶段、AI反馈强化学习、评测与讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2009-03300",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2009.03300",
    "reviewedVersion": "v3",
    "title": "Measuring Massive Multitask Language Understanding",
    "publisher": "Dan Hendrycks 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2009.03300",
    "publishedAt": "2020-09-07",
    "accessedAt": "2026-09-23",
    "summary": "建立涵盖多学科知识与推理的 MMLU 评测，用统一选择题测试模型的任务间表现。",
    "selectionReason": "关键资源：建立涵盖多学科知识与推理的 MMLU 评测，用统一选择题测试模型的任务间表现。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：数据集构建、实验与分析；本轮核对 v3。",
    "limitations": [
      "选择题成绩不能代表交互任务、可靠性或全面智能；须留意数据污染与提示设置。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "模型评测与基准"
    ],
    "linkedNodes": [
      "model-evaluation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2009.03300v3",
      "sections": "数据集构建、实验与分析",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2211-09110",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2211.09110",
    "reviewedVersion": "v2",
    "title": "Holistic Evaluation of Language Models",
    "publisher": "Percy Liang 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2211.09110",
    "publishedAt": "2022-11-16",
    "accessedAt": "2026-09-23",
    "summary": "以场景与多维指标组织 HELM，比较准确性、鲁棒性、校准、偏差和效率等取舍。",
    "selectionReason": "关键资源：以场景与多维指标组织 HELM，比较准确性、鲁棒性、校准、偏差和效率等取舍。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：场景与指标分类、评测方法、结果与限制；本轮核对 v2。",
    "limitations": [
      "场景与可访问模型有限；结果是特定版本快照，不能压缩成永久总排名。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "模型评测与基准",
      "LLM 应用评测"
    ],
    "linkedNodes": [
      "model-evaluation",
      "evaluation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2211.09110v2",
      "sections": "场景与指标分类、评测方法、结果与限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2307-03172",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2307.03172",
    "reviewedVersion": "v3",
    "title": "Lost in the Middle: How Language Models Use Long Contexts",
    "publisher": "Nelson F. Liu 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2307.03172",
    "publishedAt": "2023-07-06",
    "accessedAt": "2026-09-23",
    "summary": "通过改变相关信息位置，检验长上下文模型的信息利用能力，揭示中部信息易被忽略的现象。",
    "selectionReason": "边界研究：通过改变相关信息位置，检验长上下文模型的信息利用能力，揭示中部信息易被忽略的现象。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：多文档问答、键值检索、位置控制实验、讨论；本轮核对 v3。",
    "limitations": [
      "结论限定于所测模型和任务；不能把早期实验直接套用于所有后续长上下文系统。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "中间迷失",
      "上下文窗口"
    ],
    "linkedNodes": [
      "lost-in-middle",
      "context-window"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2307.03172v3",
      "sections": "多文档问答、键值检索、位置控制实验、讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2312-00752",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2312.00752",
    "reviewedVersion": "v2",
    "title": "Mamba: Linear-Time Sequence Modeling with Selective State Spaces",
    "publisher": "Albert Gu 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2312.00752",
    "publishedAt": "2023-12-01",
    "accessedAt": "2026-09-23",
    "summary": "用输入依赖的选择机制与高效扫描实现 Mamba 状态空间模型，研究长序列建模的效率取舍。",
    "selectionReason": "关键改进：用输入依赖的选择机制与高效扫描实现 Mamba 状态空间模型，研究长序列建模的效率取舍。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 选择性状态空间、§4 实验；本轮核对 v2。",
    "limitations": [
      "线性序列开销不意味着所有检索或推理任务优于注意力模型；效果依模型和任务。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "状态空间模型与 Mamba"
    ],
    "linkedNodes": [
      "state-space-models"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2312.00752v2",
      "sections": "§3 选择性状态空间、§4 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2206-04615",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2206.04615",
    "reviewedVersion": "v3",
    "title": "Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models",
    "publisher": "Aarohi Srivastava 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2206.04615",
    "publishedAt": "2022-06-09",
    "accessedAt": "2026-09-23",
    "summary": "通过 BIG-bench 的多样任务研究语言模型能力与规模变化，并公开任务设计和评测资源。",
    "selectionReason": "关键资源：通过 BIG-bench 的多样任务研究语言模型能力与规模变化，并公开任务设计和评测资源。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：任务构建、模型评测、结果分析与限制；本轮核对 v3。",
    "limitations": [
      "任务分布、提示和指标影响结论；跨规模表现不等于已证明普遍的能力涌现规律。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "模型评测与基准"
    ],
    "linkedNodes": [
      "model-evaluation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/pdf/2206.04615v3",
      "sections": "任务构建、模型评测、结果分析与限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2210-02747",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2210.02747",
    "reviewedVersion": "v2",
    "title": "Flow Matching for Generative Modeling",
    "publisher": "Yaron Lipman 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2210.02747",
    "publishedAt": "2022-10-06",
    "accessedAt": "2026-09-23",
    "summary": "通过回归概率路径的向量场训练连续归一化流，比较不同路径设计下的 Flow Matching 生成。",
    "selectionReason": "基础方法：通过回归概率路径的向量场训练连续归一化流，比较不同路径设计下的 Flow Matching 生成。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 Flow Matching、§4 条件路径、§6 实验；本轮核对 v2。",
    "limitations": [
      "路径、ODE求解器和采样预算影响结果；不意味着生成无需数值求解或所有任务更快。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "Flow Matching / Rectified Flow"
    ],
    "linkedNodes": [
      "flow-matching"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2210.02747v2",
      "sections": "§3 Flow Matching、§4 条件路径、§6 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2302-05543",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2302.05543",
    "reviewedVersion": "v3",
    "title": "Adding Conditional Control to Text-to-Image Diffusion Models",
    "publisher": "Lvmin Zhang 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2302.05543",
    "publishedAt": "2023-02-10",
    "accessedAt": "2026-09-23",
    "summary": "以可训练控制分支给预训练扩散模型加入边缘、深度、姿态等空间条件，形成 ControlNet 方法。",
    "selectionReason": "关键改进：以可训练控制分支给预训练扩散模型加入边缘、深度、姿态等空间条件，形成 ControlNet 方法。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 实验与消融；本轮核对 v3。",
    "limitations": [
      "控制质量依输入条件和训练数据；不能保证精确几何、身份一致或任意复杂约束。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "可控生成",
      "图像生成"
    ],
    "linkedNodes": [
      "controllable-generation",
      "image-generation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2302.05543v3",
      "sections": "§3 方法、§4 实验与消融",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2306-15687",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2306.15687",
    "reviewedVersion": "v2",
    "title": "Voicebox: Text-Guided Multilingual Universal Speech Generation at Scale",
    "publisher": "Matthew Le 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2306.15687",
    "publishedAt": "2023-06-23",
    "accessedAt": "2026-09-23",
    "summary": "以条件流匹配和语音填补训练 Voicebox，研究文本引导的多语言语音生成与编辑。",
    "selectionReason": "关键改进：以条件流匹配和语音填补训练 Voicebox，研究文本引导的多语言语音生成与编辑。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：模型与训练任务、语音生成及编辑评测、影响与限制；本轮核对 v2。",
    "limitations": [
      "报告中的模型和数据可获取性有限；不能将作者评测等同于可直接部署的公开服务。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "音频与音乐生成",
      "语音识别与合成"
    ],
    "linkedNodes": [
      "audio-generation",
      "speech"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2306.15687v2",
      "sections": "模型与训练任务、语音生成及编辑评测、影响与限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2101-03961",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2101.03961",
    "reviewedVersion": "v3",
    "title": "Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity",
    "publisher": "William Fedus 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2101.03961",
    "publishedAt": "2021-01-11",
    "accessedAt": "2026-09-23",
    "summary": "通过每个 token 选择单一专家的路由机制，研究 Switch Transformer 的稀疏扩展与训练稳定性。",
    "selectionReason": "基础方法：通过每个 token 选择单一专家的路由机制，研究 Switch Transformer 的稀疏扩展与训练稳定性。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：Switch路由、训练稳定性、预训练与迁移实验；本轮核对 v3。",
    "limitations": [
      "总参数量不同于每次激活量；专家负载、通信与训练不稳定会影响收益。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "混合专家 MoE"
    ],
    "linkedNodes": [
      "moe"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2101.03961v3",
      "sections": "Switch路由、训练稳定性、预训练与迁移实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1503-02531",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1503.02531",
    "reviewedVersion": "v1",
    "title": "Distilling the Knowledge in a Neural Network",
    "publisher": "Geoffrey Hinton 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1503.02531",
    "publishedAt": "2015-03-09",
    "accessedAt": "2026-09-23",
    "summary": "用温度软化的教师输出训练较小学生模型，说明知识蒸馏与硬标签训练的差异。",
    "selectionReason": "基础方法：用温度软化的教师输出训练较小学生模型，说明知识蒸馏与硬标签训练的差异。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：蒸馏目标、MNIST与语音实验、讨论；本轮核对 v1。",
    "limitations": [
      "学生仍受容量和训练分布限制；压缩不保证保留教师的全部能力或可靠性。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "模型蒸馏"
    ],
    "linkedNodes": [
      "distillation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1503.02531v1",
      "sections": "蒸馏目标、MNIST与语音实验、讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1607-06450",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1607.06450",
    "reviewedVersion": "v1",
    "title": "Layer Normalization",
    "publisher": "Jimmy Lei Ba 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1607.06450",
    "publishedAt": "2016-07-21",
    "accessedAt": "2026-09-23",
    "summary": "按单个样本的层内特征计算归一化统计量，研究 Layer Normalization 在循环等网络中的训练表现。",
    "selectionReason": "基础方法：按单个样本的层内特征计算归一化统计量，研究 Layer Normalization 在循环等网络中的训练表现。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：方法、相关方法比较、实验；本轮核对 v1。",
    "limitations": [
      "归一化维度不同于BatchNorm；效果依架构，不保证在所有视觉任务中更好。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "层归一化与 RMSNorm"
    ],
    "linkedNodes": [
      "normalization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1607.06450v1",
      "sections": "方法、相关方法比较、实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1301-3781",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1301.3781",
    "reviewedVersion": "v3",
    "title": "Efficient Estimation of Word Representations in Vector Space",
    "publisher": "Tomas Mikolov 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1301.3781",
    "publishedAt": "2013-01-16",
    "accessedAt": "2026-09-23",
    "summary": "用 CBOW 与 Skip-gram 高效学习词向量，并通过语义、句法关系任务评价表示质量。",
    "selectionReason": "基础方法：用 CBOW 与 Skip-gram 高效学习词向量，并通过语义、句法关系任务评价表示质量。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 模型、§4—5 实验、§6 结论；本轮核对 v3。",
    "limitations": [
      "静态词向量不区分同一词的不同语境；类比成绩不等于普遍语言理解。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "嵌入 Embedding"
    ],
    "linkedNodes": [
      "embedding"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1301.3781v3",
      "sections": "§3 模型、§4—5 实验、§6 结论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1409-0473",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1409.0473",
    "reviewedVersion": "v7",
    "title": "Neural Machine Translation by Jointly Learning to Align and Translate",
    "publisher": "Dzmitry Bahdanau 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1409.0473",
    "publishedAt": "2014-09-01",
    "accessedAt": "2026-09-23",
    "summary": "通过对源句表示进行软对齐，让翻译解码器按需关注输入位置，缓解固定长度表示瓶颈。",
    "selectionReason": "基础方法：通过对源句表示进行软对齐，让翻译解码器按需关注输入位置，缓解固定长度表示瓶颈。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 对齐方法、§4—5 翻译实验；本轮核对 v7。",
    "limitations": [
      "原作针对特定机器翻译设置；注意力权重不自动构成因果解释。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "注意力机制",
      "循环神经网络 RNN"
    ],
    "linkedNodes": [
      "attention",
      "rnn"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1409.0473v7",
      "sections": "§3 对齐方法、§4—5 翻译实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1211-5063",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1211.5063",
    "reviewedVersion": "v2",
    "title": "On the difficulty of training Recurrent Neural Networks",
    "publisher": "Razvan Pascanu 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1211.5063",
    "publishedAt": "2012-11-21",
    "accessedAt": "2026-09-23",
    "summary": "从分析、几何与动态系统角度研究循环网络的梯度消失与爆炸，并检验梯度裁剪等处理方法。",
    "selectionReason": "边界研究：从分析、几何与动态系统角度研究循环网络的梯度消失与爆炸，并检验梯度裁剪等处理方法。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：梯度分析、处理策略、实验；本轮核对 v2。",
    "limitations": [
      "梯度裁剪主要处理爆炸，不能把它说成单独解决梯度消失的通用办法。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "梯度消失",
      "循环神经网络 RNN"
    ],
    "linkedNodes": [
      "vanishing-gradient",
      "rnn"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1211.5063v2",
      "sections": "梯度分析、处理策略、实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1207-0580",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1207.0580",
    "reviewedVersion": "v1",
    "title": "Improving neural networks by preventing co-adaptation of feature detectors",
    "publisher": "Geoffrey E. Hinton 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1207.0580",
    "publishedAt": "2012-07-03",
    "accessedAt": "2026-09-23",
    "summary": "通过训练时随机丢弃特征检测器，减少神经网络对固定特征组合的依赖，研究 dropout 正则化。",
    "selectionReason": "基础方法：通过训练时随机丢弃特征检测器，减少神经网络对固定特征组合的依赖，研究 dropout 正则化。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：随机丢弃方法、图像与语音实验、模型平均讨论；本轮核对 v1。",
    "limitations": [
      "收益依模型、数据量与丢弃率；不是所有架构都应采用相同丢弃设置。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "过拟合",
      "正则化"
    ],
    "linkedNodes": [
      "overfitting",
      "regularization"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1207.0580v1",
      "sections": "随机丢弃方法、图像与语音实验、模型平均讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1312-5602",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1312.5602",
    "reviewedVersion": "v1",
    "title": "Playing Atari with Deep Reinforcement Learning",
    "publisher": "Volodymyr Mnih 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1312.5602",
    "publishedAt": "2013-12-19",
    "accessedAt": "2026-09-23",
    "summary": "把卷积网络、Q学习与经验回放结合，从游戏像素学习动作价值，是深度强化学习的早期关键实验。",
    "selectionReason": "基础方法：把卷积网络、Q学习与经验回放结合，从游戏像素学习动作价值，是深度强化学习的早期关键实验。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§4 算法、§5 游戏实验、§6 结论；本轮核对 v1。",
    "limitations": [
      "这是七个Atari游戏上的早期版本；不应混用后续Nature版的方法细节或成绩。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "强化学习"
    ],
    "linkedNodes": [
      "reinforcement-learning"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1312.5602v1",
      "sections": "§4 算法、§5 游戏实验、§6 结论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1707-06347",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1707.06347",
    "reviewedVersion": "v2",
    "title": "Proximal Policy Optimization Algorithms",
    "publisher": "John Schulman 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1707.06347",
    "publishedAt": "2017-07-20",
    "accessedAt": "2026-09-23",
    "summary": "以裁剪或KL约束的替代目标更新策略，比较 PPO 的实现复杂度、稳定性与控制任务表现。",
    "selectionReason": "基础方法：以裁剪或KL约束的替代目标更新策略，比较 PPO 的实现复杂度、稳定性与控制任务表现。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2—4 目标、§5 算法、§6 实验；本轮核对 v2。",
    "limitations": [
      "裁剪目标不是严格性能单调提升保证；结果依奖励、采样与超参数。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "强化学习",
      "RLHF 与偏好对齐"
    ],
    "linkedNodes": [
      "reinforcement-learning",
      "rlhf"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/pdf/1707.06347v2",
      "sections": "§2—4 目标、§5 算法、§6 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1603-02754",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1603.02754",
    "reviewedVersion": "v3",
    "title": "XGBoost: A Scalable Tree Boosting System",
    "publisher": "Tianqi Chen 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1603.02754",
    "publishedAt": "2016-03-09",
    "accessedAt": "2026-09-23",
    "summary": "结合稀疏感知分裂、加权分位数草图与缓存优化，构建可扩展的 XGBoost 梯度提升树系统。",
    "selectionReason": "关键资源：结合稀疏感知分裂、加权分位数草图与缓存优化，构建可扩展的 XGBoost 梯度提升树系统。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2—4 方法与系统、§6 实验；本轮核对 v3。",
    "limitations": [
      "论文系统实验不代表当前版本性能；树模型仍需控制过拟合并验证数据分布。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "决策树与集成方法",
      "监督学习"
    ],
    "linkedNodes": [
      "decision-tree",
      "supervised-learning"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1603.02754v3",
      "sections": "§2—4 方法与系统、§6 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1607-00133",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1607.00133",
    "reviewedVersion": "v2",
    "title": "Deep Learning with Differential Privacy",
    "publisher": "Martín Abadi 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1607.00133",
    "publishedAt": "2016-07-01",
    "accessedAt": "2026-09-23",
    "summary": "结合逐样本梯度裁剪、加噪与隐私损失核算，研究具有差分隐私保证的深度学习训练。",
    "selectionReason": "基础方法：结合逐样本梯度裁剪、加噪与隐私损失核算，研究具有差分隐私保证的深度学习训练。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法与隐私核算、§4 实现、§5 实验；本轮核对 v2。",
    "limitations": [
      "保证依采样、噪声、预算与完整实现；不等于数据匿名化或自动符合隐私法规。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "隐私与数据合规",
      "训练数据治理"
    ],
    "linkedNodes": [
      "privacy",
      "training-data-governance"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1607.00133v2",
      "sections": "§3 方法与隐私核算、§4 实现、§5 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1706-04599",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1706.04599",
    "reviewedVersion": "v2",
    "title": "On Calibration of Modern Neural Networks",
    "publisher": "Chuan Guo 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1706.04599",
    "publishedAt": "2017-06-14",
    "accessedAt": "2026-09-23",
    "summary": "比较现代神经网络的置信度与实际准确率，评测温度缩放等后处理校准方法。",
    "selectionReason": "边界研究：比较现代神经网络的置信度与实际准确率，评测温度缩放等后处理校准方法。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 定义、§3 失准、§4—5 校准方法与结果；本轮核对 v2。",
    "limitations": [
      "需要独立校准数据；分类校准不能直接保证分布漂移下或生成文本中的真实性。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "不确定性校准与选择性预测",
      "Logprobs 与置信度"
    ],
    "linkedNodes": [
      "uncertainty-calibration",
      "logprobs"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1706.04599v2",
      "sections": "§2 定义、§3 失准、§4—5 校准方法与结果",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1904-09751",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1904.09751",
    "reviewedVersion": "v2",
    "title": "The Curious Case of Neural Text Degeneration",
    "publisher": "Ari Holtzman 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1904.09751",
    "publishedAt": "2019-04-22",
    "accessedAt": "2026-09-23",
    "summary": "比较开放式生成中的最大似然解码与采样退化，并以动态累积概率截断提出核采样。",
    "selectionReason": "关键改进：比较开放式生成中的最大似然解码与采样退化，并以动态累积概率截断提出核采样。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 解码、§4—6 自动与人工评测；本轮核对 v2。",
    "limitations": [
      "重点是开放文本生成；不能由此否定束搜索在翻译等任务中的价值。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "采样与解码参数"
    ],
    "linkedNodes": [
      "sampling-params"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1904.09751v2",
      "sections": "§3 解码、§4—6 自动与人工评测",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1603-09320",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1603.09320",
    "reviewedVersion": "v4",
    "title": "Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs",
    "publisher": "Yu. A. Malkov 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1603.09320",
    "publishedAt": "2016-03-30",
    "accessedAt": "2026-09-23",
    "summary": "使用分层小世界图实现近似最近邻检索，分析索引结构、搜索效率与召回率取舍。",
    "selectionReason": "基础方法：使用分层小世界图实现近似最近邻检索，分析索引结构、搜索效率与召回率取舍。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：图构建与搜索算法、复杂度与实验比较；本轮核对 v4。",
    "limitations": [
      "近似搜索不保证精确最近邻；内存、构建参数和数据分布影响性能。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "向量数据库",
      "检索与语义搜索"
    ],
    "linkedNodes": [
      "vector-db",
      "retrieval"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/pdf/1603.09320v4",
      "sections": "图构建与搜索算法、复杂度与实验比较",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1901-04085",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1901.04085",
    "reviewedVersion": "v5",
    "title": "Passage Re-ranking with BERT",
    "publisher": "Rodrigo Nogueira 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1901.04085",
    "publishedAt": "2019-01-13",
    "accessedAt": "2026-09-23",
    "summary": "将查询与候选段落联合输入 BERT 重排，验证交叉编码器在检索后排序中的作用。",
    "selectionReason": "关键改进：将查询与候选段落联合输入 BERT 重排，验证交叉编码器在检索后排序中的作用。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 实验；本轮核对 v5。",
    "limitations": [
      "仅重排已召回候选，不能找回召回阶段完全遗漏的文档；计算成本随候选数增长。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "重排 Reranking"
    ],
    "linkedNodes": [
      "reranking"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1901.04085v5",
      "sections": "§2 方法、§3 实验",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2004-12832",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2004.12832",
    "reviewedVersion": "v2",
    "title": "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT",
    "publisher": "Omar Khattab 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2004.12832",
    "publishedAt": "2020-04-27",
    "accessedAt": "2026-09-23",
    "summary": "通过分别编码查询和文档、再进行 token 级延迟交互，实现 ColBERT 的检索质量与效率折中。",
    "selectionReason": "关键改进：通过分别编码查询和文档、再进行 token 级延迟交互，实现 ColBERT 的检索质量与效率折中。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 质量与成本评测；本轮核对 v2。",
    "limitations": [
      "多向量表示增加索引成本；原文速度比较依实现、硬件和候选规模。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "重排 Reranking",
      "检索与语义搜索"
    ],
    "linkedNodes": [
      "reranking",
      "retrieval"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2004.12832v2",
      "sections": "§3 方法、§4 质量与成本评测",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2310-11511",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2310.11511",
    "reviewedVersion": "v1",
    "title": "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection",
    "publisher": "Akari Asai 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2310.11511",
    "publishedAt": "2023-10-17",
    "accessedAt": "2026-09-23",
    "summary": "训练反思 token 来决定何时检索并评估证据与生成内容，使 Self-RAG 可按任务调整检索行为。",
    "selectionReason": "关键改进：训练反思 token 来决定何时检索并评估证据与生成内容，使 Self-RAG 可按任务调整检索行为。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 训练与推理、§4—5 实验、伦理边界；本轮核对 v1。",
    "limitations": [
      "自评与引用仍可能错误；需要专门训练，不能等同于添加一句反思提示。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "高级 RAG",
      "RAG 检索增强生成"
    ],
    "linkedNodes": [
      "advanced-rag",
      "rag"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2310.11511v1",
      "sections": "§3 训练与推理、§4—5 实验、伦理边界",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2404-16130",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2404.16130",
    "reviewedVersion": "v2",
    "title": "From Local to Global: A Graph RAG Approach to Query-Focused Summarization",
    "publisher": "Darren Edge 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2404.16130",
    "publishedAt": "2024-04-24",
    "accessedAt": "2026-09-23",
    "summary": "从文档构建实体图与社区摘要，研究 GraphRAG 对整库主题归纳等全局问题的回答能力。",
    "selectionReason": "关键改进：从文档构建实体图与社区摘要，研究 GraphRAG 对整库主题归纳等全局问题的回答能力。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 分析、§5 结果、§6 讨论；本轮核对 v2。",
    "limitations": [
      "建图有额外成本，评测侧重全局问题；不能宣称所有局部查询都优于向量RAG。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "知识图谱与 GraphRAG",
      "高级 RAG"
    ],
    "linkedNodes": [
      "knowledge-graph",
      "advanced-rag"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2404.16130v2",
      "sections": "§3 方法、§4 分析、§5 结果、§6 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2309-11495",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2309.11495",
    "reviewedVersion": "v2",
    "title": "Chain-of-Verification Reduces Hallucination in Large Language Models",
    "publisher": "Shehzaad Dhuliawala 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2309.11495",
    "publishedAt": "2023-09-20",
    "accessedAt": "2026-09-23",
    "summary": "把初稿拆成独立验证问题，再据回答修订输出，研究核查链对事实性错误的影响。",
    "selectionReason": "关键改进：把初稿拆成独立验证问题，再据回答修订输出，研究核查链对事实性错误的影响。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 CoVe、§4 实验、§6 限制；本轮核对 v2。",
    "limitations": [
      "核验仍依赖模型已有能力，会增加调用成本且不能消除幻觉。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "幻觉 Hallucination"
    ],
    "linkedNodes": [
      "hallucination"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2309.11495v2",
      "sections": "§3 CoVe、§4 实验、§6 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2301-10226",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2301.10226",
    "reviewedVersion": "v4",
    "title": "A Watermark for Large Language Models",
    "publisher": "John Kirchenbauer 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2301.10226",
    "publishedAt": "2023-01-24",
    "accessedAt": "2026-09-23",
    "summary": "在生成采样中嵌入统计信号并设计检测检验，研究语言模型文本水印的质量与可检测性。",
    "selectionReason": "基础方法：在生成采样中嵌入统计信号并设计检测检验，研究语言模型文本水印的质量与可检测性。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3—4 方法与分析、§6 实验、§7 攻击与边界；本轮核对 v4。",
    "limitations": [
      "检测只针对匹配方案的水印；短文本、改写与密钥条件影响效果，不能作通用AI文本鉴定。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "AIGC 检测与水印"
    ],
    "linkedNodes": [
      "content-detection"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2301.10226v4",
      "sections": "§3—4 方法与分析、§6 实验、§7 攻击与边界",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1910-02054",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1910.02054",
    "reviewedVersion": "v3",
    "title": "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models",
    "publisher": "Samyam Rajbhandari 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1910.02054",
    "publishedAt": "2019-10-04",
    "accessedAt": "2026-09-23",
    "summary": "通过分片优化器状态、梯度和参数减少分布式训练中的冗余，分析 ZeRO 的显存与通信取舍。",
    "selectionReason": "关键改进：通过分片优化器状态、梯度和参数减少分布式训练中的冗余，分析 ZeRO 的显存与通信取舍。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§4—8 分片与通信、§10 实现评测；本轮核对 v3。",
    "limitations": [
      "不同分片阶段的通信成本不同；大规模可行性估算不等于每一规模都完成实测。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "分布式训练与并行策略"
    ],
    "linkedNodes": [
      "distributed-training"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1910.02054v3",
      "sections": "§4—8 分片与通信、§10 实现评测",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-1803-10122",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "1803.10122",
    "reviewedVersion": "v4",
    "title": "World Models",
    "publisher": "David Ha 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/1803.10122",
    "publishedAt": "2018-03-27",
    "accessedAt": "2026-09-23",
    "summary": "用压缩视觉表示与循环环境模型训练控制器，探索在学习到的模拟环境中优化策略。",
    "selectionReason": "基础方法：用压缩视觉表示与循环环境模型训练控制器，探索在学习到的模拟环境中优化策略。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 模型、§3—4 实验、§7 讨论；本轮核对 v4。",
    "limitations": [
      "实验基于有限游戏环境；模型误差和被策略利用的模拟漏洞会限制迁移。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "世界模型与 3D 生成"
    ],
    "linkedNodes": [
      "world-models"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/1803.10122v4",
      "sections": "§2 模型、§3—4 实验、§7 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2209-07858",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2209.07858",
    "reviewedVersion": "v2",
    "title": "Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned",
    "publisher": "Deep Ganguli 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2209.07858",
    "publishedAt": "2022-08-23",
    "accessedAt": "2026-09-23",
    "summary": "记录人类红队测试流程、攻击数据和模型比较，分析安全评测的覆盖与测量局限。",
    "selectionReason": "关键资源：记录人类红队测试流程、攻击数据和模型比较，分析安全评测的覆盖与测量局限。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4 结果、§5 限制；本轮核对 v2。",
    "limitations": [
      "参与者、任务与伤害判定限制覆盖；未发现攻击不能证明模型安全。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "红队测试",
      "人在回路"
    ],
    "linkedNodes": [
      "red-teaming",
      "human-in-the-loop"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2209.07858v2",
      "sections": "§3 方法、§4 结果、§5 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2109-07958",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2109.07958",
    "reviewedVersion": "v2",
    "title": "TruthfulQA: Measuring How Models Mimic Human Falsehoods",
    "publisher": "Stephanie Lin 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2109.07958",
    "publishedAt": "2021-09-08",
    "accessedAt": "2026-09-23",
    "summary": "用易诱发常见误解的问题构造 TruthfulQA，区分模仿训练文本与给出真实答案。",
    "selectionReason": "关键资源：用易诱发常见误解的问题构造 TruthfulQA，区分模仿训练文本与给出真实答案。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 基准、§3—4 实验、§5 讨论；本轮核对 v2。",
    "limitations": [
      "范围是有限人工构造问题；得分不是全面真实性证明，也不测量蓄意欺骗能力。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "幻觉 Hallucination",
      "模型评测与基准"
    ],
    "linkedNodes": [
      "hallucination",
      "model-evaluation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2109.07958v2",
      "sections": "§2 基准、§3—4 实验、§5 讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2306-01708",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2306.01708",
    "reviewedVersion": "v2",
    "title": "TIES-Merging: Resolving Interference When Merging Models",
    "publisher": "Prateek Yadav 等",
    "collection": "arXiv · 历史研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "已作资料编辑审核；非同行评审结论",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2306.01708",
    "publishedAt": "2023-06-02",
    "accessedAt": "2026-09-23",
    "summary": "通过裁去微小更新、协调符号冲突再合并任务向量，研究 TIES 对模型合并干扰的处理。",
    "selectionReason": "关键改进：通过裁去微小更新、协调符号冲突再合并任务向量，研究 TIES 对模型合并干扰的处理。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§4 方法、§5—7 实验、附录A限制；本轮核对 v2。",
    "limitations": [
      "需要兼容的模型参数和基座；合并可能牺牲单任务效果，不能任意混合不同架构。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "历史研究",
      "模型合并与适配器组合"
    ],
    "linkedNodes": [
      "model-merging"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2306.01708v2",
      "sections": "§4 方法、§5—7 实验、附录A限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2609-26779",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2609.26779",
    "reviewedVersion": "v1",
    "title": "CliffCompaction: Cost-Efficient Compaction for Long-Horizon Coding Agents",
    "publisher": "Trang Nguyen 等",
    "collection": "arXiv · 前沿初判",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "前沿初判；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2609.26779",
    "publishedAt": "2026-09-22",
    "accessedAt": "2026-09-23",
    "summary": "以保留原文的裁剪方式压缩长任务历史，研究 Agent 上下文保真、成本与测试时扩展的取舍。",
    "selectionReason": "前沿关键改进：以保留原文的裁剪方式压缩长任务历史，研究 Agent 上下文保真、成本与测试时扩展的取舍。以问题、对照设计及可核查材料作初步重要性判断，尚无独立复现背书。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 方法、§3 实验、§8 限制；本轮核对 v1。",
    "limitations": [
      "前沿初判；限定编程任务与所测框架，未独立复现，不能套用摘要中的最大节省比例。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "前沿初判",
      "上下文压缩",
      "上下文工程"
    ],
    "linkedNodes": [
      "context-compaction",
      "context-engineering"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2609.26779v1",
      "sections": "§2 方法、§3 实验、§8 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2609-26777",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2609.26777",
    "reviewedVersion": "v1",
    "title": "SWE-Serve: Benchmarking Agentic Engineering For Production Inference Serving",
    "publisher": "Jennifer Williams 等",
    "collection": "arXiv · 前沿初判",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "前沿初判；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2609.26777",
    "publishedAt": "2026-09-22",
    "accessedAt": "2026-09-23",
    "summary": "建立面向推理服务工程的 SWE-Serve 任务集，以端到端测试检验局部通过与服务正确之间的差距。",
    "selectionReason": "前沿关键资源：建立面向推理服务工程的 SWE-Serve 任务集，以端到端测试检验局部通过与服务正确之间的差距。以问题、对照设计及可核查材料作初步重要性判断，尚无独立复现背书。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：任务构建与测试设计、实验、§6 限制；本轮核对 v1。",
    "limitations": [
      "前沿初判；53个SGLang任务、CPU或单H100，未覆盖生产维护全部维度。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "前沿初判",
      "模型评测与基准",
      "AI Agent"
    ],
    "linkedNodes": [
      "model-evaluation",
      "agent"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2609.26777v1",
      "sections": "任务构建与测试设计、实验、§6 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2609-26760",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2609.26760",
    "reviewedVersion": "v1",
    "title": "Grow the Harness, Not the Context: From Strategy-Free Scaffolds to Reusable Specialist Agents",
    "publisher": "Laizhen Li 等",
    "collection": "arXiv · 前沿初判",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "前沿初判；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2609.26760",
    "publishedAt": "2026-09-22",
    "accessedAt": "2026-09-23",
    "summary": "从失败轨迹中改进可复用的 Agent 控制代码，并通过独立门控任务回滚能力退化。",
    "selectionReason": "前沿关键改进：从失败轨迹中改进可复用的 Agent 控制代码，并通过独立门控任务回滚能力退化。以问题、对照设计及可核查材料作初步重要性判断，尚无独立复现背书。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§3 方法、§4.1 数据划分、§4.4 消融；本轮核对 v1。",
    "limitations": [
      "前沿初判；限两类基准和三个模型，需区分离线优化成本与在线调用节省。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "前沿初判",
      "Agent 框架",
      "Agent 循环"
    ],
    "linkedNodes": [
      "agent-frameworks",
      "agent-loop"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2609.26760v1",
      "sections": "§3 方法、§4.1 数据划分、§4.4 消融",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2609-26758",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2609.26758",
    "reviewedVersion": "v1",
    "title": "Type-Safe Is Not Error-Free: A Constrained Decision Head Follows the Option Name, Not the Rubric Bound to It",
    "publisher": "Yu Sun 等",
    "collection": "arXiv · 前沿初判",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "前沿初判；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2609.26758",
    "publishedAt": "2026-09-22",
    "accessedAt": "2026-09-23",
    "summary": "在保持问题与判定规则不变时置换选项名称，揭示类型合法输出仍可能发生系统性语义误判。",
    "selectionReason": "前沿边界研究：在保持问题与判定规则不变时置换选项名称，揭示类型合法输出仍可能发生系统性语义误判。以问题、对照设计及可核查材料作初步重要性判断，尚无独立复现背书。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：名称置换及中性对照实验、§6 讨论、§7 限制；本轮核对 v1。",
    "limitations": [
      "前沿初判；限定英文任务与所测决策模型；中性名称对照不构成所有结构化输出系统的通用修复。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "前沿初判",
      "结构化输出",
      "LLM 应用评测"
    ],
    "linkedNodes": [
      "structured-output",
      "evaluation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2609.26758v1",
      "sections": "名称置换及中性对照实验、§6 讨论、§7 限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2609-26550",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2609.26550",
    "reviewedVersion": "v1",
    "title": "JEV-as-a-Judge: Accept When Confident, Escalate When Unsure",
    "publisher": "Yubo Li 等",
    "collection": "arXiv · 前沿初判",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "前沿初判；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2609.26550",
    "publishedAt": "2026-09-22",
    "accessedAt": "2026-09-23",
    "summary": "比较专用判断器、生成模型与奖励模型，并用冻结阈值将低置信度评审升级给更强模型。",
    "selectionReason": "前沿关键改进：比较专用判断器、生成模型与奖励模型，并用冻结阈值将低置信度评审升级给更强模型。以问题、对照设计及可核查材料作初步重要性判断，尚无独立复现背书。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：评审对比、冻结级联、人工裁决、§5—7 边界；本轮核对 v1。",
    "limitations": [
      "前沿初判；复杂推导等任务有差距，阈值需独立校准，价格只代表测量时快照。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "前沿初判",
      "LLM 应用评测",
      "模型评测与基准"
    ],
    "linkedNodes": [
      "evaluation",
      "model-evaluation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2609.26550v1",
      "sections": "评审对比、冻结级联、人工裁决、§5—7 边界",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2609-26532",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2609.26532",
    "reviewedVersion": "v1",
    "title": "REFLEX with Jev for Efficient Selective Control in LLM Agents",
    "publisher": "Tiantong Wu 等",
    "collection": "arXiv · 前沿初判",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "前沿初判；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2609.26532",
    "publishedAt": "2026-09-22",
    "accessedAt": "2026-09-23",
    "summary": "将有限动作决策与开放式生成分开，比较 REFLEX 的选择性升级策略及外部基准中的收益边界。",
    "selectionReason": "前沿边界研究：将有限动作决策与开放式生成分开，比较 REFLEX 的选择性升级策略及外部基准中的收益边界。以问题、对照设计及可核查材料作初步重要性判断，尚无独立复现背书。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：控制架构、干预实验、外部验证、§6—7 讨论限制；本轮核对 v1。",
    "limitations": [
      "前沿初判；依赖单一专有判断器，外部基准并未全面胜过便宜生成模型级联。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "前沿初判",
      "Agent 循环",
      "Agent 身份、权限与密钥管理"
    ],
    "linkedNodes": [
      "agent-loop",
      "agent-identity-access"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2609.26532v1",
      "sections": "控制架构、干预实验、外部验证、§6—7 讨论限制",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2609-26461",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2609.26461",
    "reviewedVersion": "v1",
    "title": "Reproducible AI Requires Reproducible Randomness",
    "publisher": "Anthony Bertrand 等",
    "collection": "arXiv · 前沿初判",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "前沿初判；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2609.26461",
    "publishedAt": "2026-09-22",
    "accessedAt": "2026-09-23",
    "summary": "比较 Mersenne Twister 与 Philox 在多个Python生态中的实现，检验种子和内部状态能否保证随机序列一致。",
    "selectionReason": "前沿边界研究：比较 Mersenne Twister 与 Philox 在多个Python生态中的实现，检验种子和内部状态能否保证随机序列一致。以问题、对照设计及可核查材料作初步重要性判断，尚无独立复现背书。",
    "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：PDF实验环境、跨库比较及结论（§6—10）；本轮核对 v1。",
    "limitations": [
      "前沿初判；绑定所测算法与软件版本，只研究随机流，未解决整个训练过程的可复现性。",
      "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
    ],
    "tags": [
      "前沿初判",
      "模型评测与基准"
    ],
    "linkedNodes": [
      "model-evaluation"
    ],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/pdf/2609.26461v1",
      "sections": "PDF实验环境、跨库比较及结论（§6—10）",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2404-02905",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2404.02905",
    "reviewedVersion": "v2",
    "title": "Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction",
    "publisher": "Keyu Tian 等",
    "collection": "arXiv · 重要研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "六步审核通过；NeurIPS 2024 Best Paper；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2404.02905",
    "publishedAt": "2024-04-03",
    "accessedAt": "2026-09-23",
    "summary": "把视觉自回归生成从逐像素或逐 token 顺序预测改写为由粗到细的“下一尺度预测”，并展示生成质量、效率与扩展规律。",
    "selectionReason": "重大贡献：NeurIPS 2024 最佳论文。官方委员会将 VAR 评价为具有影响力和开创性的视觉自回归模型，并肯定其模型创新、生成质量、效率及扩展证据。",
    "evidenceUse": "可用于理解视觉自回归生成、下一尺度预测及相应实验。原文定位：方法、ImageNet 实验与扩展分析；本轮核对 v2。",
    "limitations": [
      "证据集中于论文所测图像生成设置，不能据此断言 VAR 在所有任务上都优于扩散模型。",
      "已核对论文与正式奖项证据，但未独立复现实验。"
    ],
    "tags": ["重要研究", "NeurIPS 最佳论文", "图像生成", "自回归模型"],
    "linkedNodes": ["image-generation"],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2404.02905v2",
      "sections": "方法、ImageNet 实验与扩展分析",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2406-02507",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2406.02507",
    "reviewedVersion": "v3",
    "title": "Guiding a Diffusion Model with a Bad Version of Itself",
    "publisher": "Tero Karras 等",
    "collection": "arXiv · 重要研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "六步审核通过；NeurIPS 2024 Best Paper；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2406.02507",
    "publishedAt": "2024-06-04",
    "accessedAt": "2026-09-23",
    "summary": "提出 Autoguidance：用同一扩散模型较弱的版本取代 classifier-free guidance 的无条件模型，以改善生成质量与多样性的权衡。",
    "selectionReason": "重大贡献：NeurIPS 2024 最佳论文。官方委员会明确肯定其对常用引导方法的替代方案，以及在图像质量和多样性方面的显著改进。",
    "evidenceUse": "可用于理解扩散模型引导、Autoguidance 及质量—多样性权衡。原文定位：方法、ImageNet 实验与讨论；本轮核对 v3。",
    "limitations": [
      "结论主要由所测图像扩散模型支持，不能外推到每种模态或每个扩散模型。",
      "已核对论文与正式奖项证据，但未独立复现实验。"
    ],
    "tags": ["重要研究", "NeurIPS 最佳论文", "扩散模型", "图像生成"],
    "linkedNodes": ["diffusion", "image-generation"],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2406.02507v3",
      "sections": "方法、ImageNet 实验与讨论",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2503-14858",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2503.14858",
    "reviewedVersion": "v4",
    "title": "1000 Layer Networks for Self-Supervised RL: Scaling Depth Can Enable New Goal-Reaching Capabilities",
    "publisher": "Kevin Wang 等",
    "collection": "arXiv · 重要研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "六步审核通过；NeurIPS 2025 Best Paper；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2503.14858",
    "publishedAt": "2025-03-19",
    "accessedAt": "2026-09-23",
    "summary": "研究自监督对比强化学习的网络深度扩展，显示更深网络可显著提升目标到达能力，并改变智能体学到的行为。",
    "selectionReason": "重大贡献：NeurIPS 2025 最佳论文。评选委员会认为该工作改变了强化学习难以有效训练深层网络的既有认识。",
    "evidenceUse": "可用于理解自监督对比强化学习中的深度扩展及目标条件学习。原文定位：§4.2、§4.5、§5 Limitations；本轮核对 v4。",
    "limitations": [
      "深度扩展会增加计算量；结果依赖对比式强化学习与所测环境，不能推广到所有强化学习算法。",
      "已核对论文与正式奖项证据，但未独立复现实验。"
    ],
    "tags": ["重要研究", "NeurIPS 最佳论文", "强化学习", "自监督学习"],
    "linkedNodes": ["reinforcement-learning", "self-supervised-learning"],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2503.14858v4",
      "sections": "§4.2、§4.5、§5 Limitations",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2505-17638",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2505.17638",
    "reviewedVersion": "v2",
    "title": "Why Diffusion Models Don't Memorize: The Role of Implicit Dynamical Regularization in Training",
    "publisher": "Tony Bonnaire 等",
    "collection": "arXiv · 重要研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "六步审核通过；NeurIPS 2025 Best Paper；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2505.17638",
    "publishedAt": "2025-05-23",
    "accessedAt": "2026-09-23",
    "summary": "从训练动力学研究扩散模型由泛化走向记忆的两个时间尺度，以实验和理论连接生成质量、数据规模与过拟合。",
    "selectionReason": "重大贡献：NeurIPS 2025 最佳论文。评选委员会肯定其从训练动力学解释生成模型泛化，并把实验观察与理论分析连接起来。",
    "evidenceUse": "可用于理解扩散模型训练中的泛化、记忆与隐式动力学正则化。原文定位：§2、§4 Limitations and future works；本轮核对 v2。",
    "limitations": [
      "理论采用简化模型，主要实验是无条件扩散；标题不能理解为所有扩散模型永不记忆训练数据。",
      "已核对论文与正式奖项证据，但未独立复现实验。"
    ],
    "tags": ["重要研究", "NeurIPS 最佳论文", "扩散模型", "泛化与记忆"],
    "linkedNodes": ["diffusion"],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2505.17638v2",
      "sections": "§2、§4 Limitations and future works",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2505-06708",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2505.06708",
    "reviewedVersion": "v1",
    "title": "Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free",
    "publisher": "Zihan Qiu 等",
    "collection": "arXiv · 重要研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "六步审核通过；NeurIPS 2025 Best Paper；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2505.06708",
    "publishedAt": "2025-05-10",
    "accessedAt": "2026-09-23",
    "summary": "系统比较软最大注意力的门控变体，发现把逐头 sigmoid 门置于 SDPA 之后可改善训练稳定性、注意力汇聚与长上下文外推。",
    "selectionReason": "重大贡献：NeurIPS 2025 最佳论文。评选委员会确认门控对稳定性、注意力汇聚和长上下文表现的贡献，并指出其广泛采用潜力。",
    "evidenceUse": "可用于理解注意力门控、attention sink 与长上下文外推。原文定位：§3.2、§4.3、Limitations；本轮核对 v1。",
    "limitations": [
      "论文尚未完整解释长上下文机制；实验收益不能保证在所有模型配置中成立。",
      "已核对论文与正式奖项证据，但未独立复现实验。"
    ],
    "tags": ["重要研究", "NeurIPS 最佳论文", "注意力机制", "长上下文"],
    "linkedNodes": ["attention", "context-window"],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2505.06708v1",
      "sections": "§3.2、§4.3、Limitations",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2601-15165",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2601.15165",
    "reviewedVersion": "v4",
    "title": "The Flexibility Trap: Rethinking the Value of Arbitrary Order in Diffusion Language Models",
    "publisher": "Zanlin Ni 等",
    "collection": "arXiv · 重要研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "六步审核通过；ICML 2026 Outstanding Paper；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2601.15165",
    "publishedAt": "2026-01-21",
    "accessedAt": "2026-09-23",
    "summary": "揭示扩散语言模型的任意顺序生成可能绕过关键推理分叉并压缩解空间，并据此提出更直接的强化学习训练方案。",
    "selectionReason": "重大贡献：ICML 2026 杰出论文。评奖委员会确认该工作揭示了任意顺序生成中此前不明显的推理失效机制。",
    "evidenceUse": "可用于理解扩散语言模型的解码顺序、推理边界和强化学习训练。原文定位：§3.2、§4、§7；本轮核对 v4。",
    "limitations": [
      "结论限于所测扩散语言模型及数学、代码任务，不能推出任意顺序在所有任务中都无效。",
      "已核对论文与正式奖项证据，但未独立复现实验。"
    ],
    "tags": ["重要研究", "ICML 杰出论文", "扩散语言模型", "强化学习"],
    "linkedNodes": ["llm", "reinforcement-learning"],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2601.15165v4",
      "sections": "§3.2、§4、§7",
      "checkedAt": "2026-09-23"
    }
  },
  {
    "id": "arxiv-2602-01338",
    "sourceClass": "academic",
    "sourceSubcategory": "arxiv",
    "arxivId": "2602.01338",
    "reviewedVersion": "v2",
    "title": "High-accuracy sampling for diffusion models and log-concave distributions",
    "publisher": "Fan Chen 等",
    "collection": "arXiv · 重要研究",
    "contentKind": "研究论文",
    "authorityTier": "R",
    "reviewStatus": "六步审核通过；ICML 2026 Outstanding Paper；未独立复现",
    "primarySource": true,
    "discoveryOnly": false,
    "url": "https://arxiv.org/abs/2602.01338",
    "publishedAt": "2026-02-01",
    "accessedAt": "2026-09-23",
    "summary": "给出扩散模型与对数凹分布的高精度采样算法，在相应假设下把目标误差依赖改进到多对数级步数。",
    "selectionReason": "重大贡献：ICML 2026 杰出论文。评奖委员会确认其解决仅用梯度实现高精度采样的长期理论问题，并改善误差依赖的复杂度。",
    "evidenceUse": "可用于理解扩散采样的理论复杂度、高精度误差依赖与 FORS 方法。原文定位：§3.1 FORS、§6；本轮核对 v2。",
    "limitations": [
      "这是依赖分数估计等假设的理论结果；论文把实现与实验留待未来，不能宣传为已验证的端到端工程加速。",
      "已核对论文与正式奖项证据，但未独立复现实验。"
    ],
    "tags": ["重要研究", "ICML 杰出论文", "扩散模型", "采样理论"],
    "linkedNodes": ["diffusion"],
    "linkedSoftware": [],
    "reviewEvidence": {
      "url": "https://arxiv.org/html/2602.01338v2",
      "sections": "§3.1 FORS、§6",
      "checkedAt": "2026-09-23"
    }
  }
  ];
  const retained = {
  "id": "vall-e-paper",
  "sourceClass": "academic",
  "sourceSubcategory": "arxiv",
  "arxivId": "2301.02111",
  "reviewedVersion": "v1",
  "title": "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers",
  "publisher": "Chengyi Wang 等",
  "collection": "arXiv · 历史研究",
  "contentKind": "研究论文",
  "authorityTier": "R",
  "reviewStatus": "已作资料编辑审核；非同行评审结论",
  "primarySource": true,
  "discoveryOnly": false,
  "url": "https://arxiv.org/abs/2301.02111",
  "publishedAt": "2023-01-05",
  "accessedAt": "2026-09-23",
  "summary": "以神经音频编解码 token 和声学提示训练 VALL-E，研究零样本说话人条件的文本转语音。",
  "selectionReason": "关键研究：以神经音频编解码 token 和声学提示训练 VALL-E，研究零样本说话人条件的文本转语音。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
  "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：模型方法、语音合成评测与限制；本轮核对 v1。",
  "limitations": [
    "作者的语音与提示条件有限；不能把实验结果推广到全部声音克隆系统。",
    "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
  ],
  "tags": [
    "历史研究",
    "声音克隆",
    "语音识别与合成",
    "Token 与分词"
  ],
  "linkedNodes": [
    "voice-cloning",
    "speech",
    "tokenization"
  ],
  "linkedSoftware": [],
  "reviewEvidence": {
    "url": "https://arxiv.org/html/2301.02111v1",
    "sections": "模型方法、语音合成评测与限制",
    "checkedAt": "2026-09-23"
  }
};
  const original = library.items.find(item => item.id === retained.id);
  if (!original) throw new Error("VALL-E原始条目缺失");
  Object.assign(original, retained);
  const framework = library.items.find(item => item.id === "microsoft-autogen-docs");
  if (!framework) throw new Error("AutoGen官方资料缺失，无法合并研究入口");
  framework.relatedMaterials = [{
  "id": "arxiv-2308-08155",
  "sourceClass": "academic",
  "sourceSubcategory": "arxiv",
  "arxivId": "2308.08155",
  "reviewedVersion": "v2",
  "title": "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
  "publisher": "Qingyun Wu 等",
  "collection": "arXiv · 历史研究",
  "contentKind": "研究论文",
  "authorityTier": "R",
  "reviewStatus": "已作资料编辑审核；非同行评审结论",
  "primarySource": true,
  "discoveryOnly": false,
  "url": "https://arxiv.org/abs/2308.08155",
  "publishedAt": "2023-08-16",
  "accessedAt": "2026-09-23",
  "summary": "以可会话 Agent 和对话编程组织多 Agent 协作，并用代码、推理等应用展示框架设计。",
  "selectionReason": "关键资源：以可会话 Agent 和对话编程组织多 Agent 协作，并用代码、推理等应用展示框架设计。作为相关技术路线的原始方法、关键改进或评测材料，提供现有库未覆盖的研究证据。",
  "evidenceUse": "可用于核对作者提出的方法、评测设计及限定实验结果。原文定位：§2 框架、§3 应用、§4 讨论；本轮核对 v2。",
  "limitations": [
    "论文记录初始框架及当时实验，不能当作当前版本 API 说明；多 Agent 不保证更可靠。",
    "本条收录的是原文入口与编辑简介；未复现实验，不能据 arXiv 收录身份推断同行评审或当前最优。"
  ],
  "tags": [
    "历史研究",
    "多 Agent 编排",
    "Agent 框架"
  ],
  "linkedNodes": [
    "multi-agent",
    "agent-frameworks"
  ],
  "linkedSoftware": [],
  "reviewEvidence": {
    "url": "https://arxiv.org/html/2308.08155v2",
    "sections": "§2 框架、§3 应用、§4 讨论",
    "checkedAt": "2026-09-23"
  }
}];
  framework.linkedNodes = Array.from(new Set(framework.linkedNodes.concat(["multi-agent","agent-frameworks"])));
  library.items.push(...entries);
})();
