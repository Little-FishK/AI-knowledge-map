# arXiv 内容审核与实际入库记录

日期：2026-09-23。已写入本地网站运行数据；没有部署线上网站。

## 结果

处理81条候选记录：原目录59条，加按节点缺口补查的22篇。78篇通过，其中76篇新建资料、VALL-E更新既有记录、AutoGen合入官方框架记录；1篇暂缓、2篇因本站范围不符排除。通过项包含71篇历史研究与7篇前沿初判。**本批候选全部有处置，不代表全arXiv的重要文章已收齐。**

入库文件为 [data/library-arxiv.js](../data/library-arxiv.js)。资料库现有220个独立对象；AutoGen论文是一个既有对象的附属原件，在arXiv下可发现，但不在全库重复计数。原始入口和中文编辑简介进入网站，不转载论文全文，也不把许可不明的图表搬入站内。

## 审核方法与证据边界

按[内容规则](LIBRARY_CONTENT_REVIEW_POLICY.md)及[重要性与去重规则](ARXIV_COLLECTION_SCOPE.md)，核对arXiv原始题名、作者、首次日期、正文版本，审读摘要、结论及支持简介的相关方法、实验和限制段落。PDF用于没有可用HTML的论文。下表提供复核定位，不表示逐篇逐行通读、复现实验、审计全部代码或验证数学证明；这是资料编辑审核，不是同行评审。

重要性判断围绕技术路线的原始方法、实质改进、基准资源或对重要假设的纠正。早期Scaling Laws与Chinchilla共同保留，避免删掉被修正但重要的历史研究；BatchNorm的原始机制解释不写成定论；DPR、RAG和Self-RAG分别提供检索器、组合生成架构与自适应检索的贡献，不能因同主题就合并。

结构化记录保存具体贡献、限制、已核版本、正文定位和正文文本指纹。部分条目另有后续文献的题名引用线索，供追踪技术关系；这些引用不等同于独立复现，也不是单独的通过依据。前沿七篇按材料和贡献作初判，不因新发布或机构名称直接通过；出现修订、复现或纠错应更新同一成果。

本轮补查曾发现两个手工编号与预期题名不匹配：1302.4389实际是Maxout Networks，1607.03497实际是Heavy spin-2 Dark Matter。均未按错误题名入库；分别核对并改用1211.5063与1607.00133。元数据核对必须在写库前完成。

## 去重结果

- VALL-E以2301.02111为身份键更新，保留vall-e-paper地址，不再新建。
- AutoGen论文2308.08155与microsoft-autogen-docs归入同一框架对象；论文自己的作者、版本、R级研究证据与使用边界独立展示，不继承官方文档的权威等级。
- LLaMA初代论文与持续更新的Llama产品文档用途不同；前者记录特定模型代际的训练及实验，后者说明现行产品操作，保留为不同资料。
- LoRA与QLoRA、GPTQ与AWQ、RAG与GraphRAG、SWE-bench与SWE-Serve保留：各自改变方法、资源条件、任务或评测范围。不能仅按主题词去重。
- 与现有全库题名、原始URL及成果用途逐项对照。新增条目使用arXiv基础ID唯一键，版本不是新条目；校验器连同附属原件检查身份，禁止abs/pdf/html入口重复收录。

## 历史研究：71篇

| 论文及已核版本 | 处置 | 贡献与入选依据 | 原文定位 |
|---|---|---|---|
| [Attention Is All You Need](https://arxiv.org/abs/1706.03762v7) | 新增 | 用多头自注意力、位置编码和编码器—解码器结构构建 Transformer，改变序列建模对循环计算的依赖。 | §3 架构、§6 实验、§7 结论 |
| [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805v2) | 新增 | 以掩码语言建模预训练双向文本表示，再对分类、问答等任务微调，是理解编码器预训练的重要原作。 | §3 方法、§4 实验、§5 消融 |
| [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165v4) | 新增 | 通过不同规模 GPT-3 的零样本、单样本与少样本实验，研究不更新权重的上下文学习。 | §2 方法、§3 结果、§4 污染、§5 限制 |
| [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361v1) | 新增 | 研究语言建模损失随参数、数据和计算预算变化的经验规律，为训练资源分配提供可检验模型。 | §1.2 规律、§3—6 实验、§8 讨论 |
| [Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556v1) | 新增 | 重新估计固定计算预算下模型规模与训练 token 的分配，并用 Chinchilla 对预测进行验证。 | §3 三种估计、§4 Chinchilla、§5 讨论 |
| [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385v1) | 新增 | 通过残差分支和捷径连接学习映射增量，针对深层网络训练退化给出方法与图像识别实验。 | §3 残差学习、§4 ImageNet/CIFAR 实验 |
| [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980v9) | 新增 | 用梯度一阶矩和二阶矩的滑动估计及偏差校正构造 Adam 优化器，提供算法与实验。 | §2 算法、§3 偏差校正、§6 实验 |
| [Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift](https://arxiv.org/abs/1502.03167v3) | 新增 | 提出按小批量统计量归一化并学习缩放、平移的 Batch Normalization，比较训练速度与精度。 | §3 算法、§4 实验 |
| [Generative Adversarial Networks](https://arxiv.org/abs/1406.2661v1) | 新增 | 把生成器与判别器组织成对抗训练，给出目标函数、理想化分析和初始生成实验。 | §3 对抗网络、§4 理论条件、§5—6 实验与缺点 |
| [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114v11) | 新增 | 通过重参数化估计变分下界，并训练近似后验网络，形成变分自编码器的核心学习方法。 | §2 方法、§3 VAE、§5 实验 |
| [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239v2) | 新增 | 研究逐步加噪与学习去噪的扩散生成，说明噪声预测目标与去噪分数匹配的联系。 | §3 参数化与目标、§4 实验 |
| [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752v2) | 新增 | 将扩散建模移入压缩潜空间，并引入条件控制，在生成质量与计算开销间取得新的取舍。 | §3 方法、§4 实验、§5 限制 |
| [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401v4) | 新增 | 把稠密检索器与序列生成器结合，比较按序列与按 token 使用检索证据的 RAG 模型。 | §2 方法、§3—4 实验、§6 讨论 |
| [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906v3) | 新增 | 以问题和段落双编码器及负样本训练实现稠密段落检索，检验其对开放域问答的作用。 | §3 DPR、§5 检索与消融、§6 问答 |
| [BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension](https://arxiv.org/abs/1910.13461v1) | 新增 | 用双向编码器与自回归解码器重建受损文本，系统比较去噪目标对理解和生成任务的影响。 | §2 模型、§4 目标比较、§5 实验 |
| [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903v6) | 新增 | 在提示示例中加入中间推理步骤，研究思维链对算术、常识和符号任务的影响。 | §2 方法、§3—5 实验、§6 讨论 |
| [Self-Consistency Improves Chain of Thought Reasoning in Language Models](https://arxiv.org/abs/2203.11171v4) | 新增 | 采样多条推理路径并聚合最终答案，检验自一致性相对贪心思维链解码的收益。 | §2 方法、§3 对比、§5 限制 |
| [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601v2) | 新增 | 把中间思路作为可评估、可回溯的搜索状态，用思维树探索多条问题求解路径。 | §3 搜索方法、§4 实验、§6 限制 |
| [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629v3) | 新增 | 让语言推理与环境行动交替进行，研究 ReAct 在问答、事实核验与交互任务中的表现。 | §2 方法、§3—4 实验、§6 结论 |
| [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761v1) | 新增 | 通过采样工具调用、执行并按后续文本损失筛选训练样本，让模型学习何时使用外部工具。 | §2 方法、§3 工具、§4 实验、§7 限制 |
| [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366v4) | 新增 | 把任务反馈转成语言反思并存入记忆，研究不更新模型权重的多轮 Agent 改进。 | §3 方法、§4 实验、§5 限制 |
| [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155v2) | 合并既有资料 | 以可会话 Agent 和对话编程组织多 Agent 协作，并用代码、推理等应用展示框架设计。 | §2 框架、§3 应用、§4 讨论 |
| [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770v3) | 新增 | 从真实 GitHub 问题和补丁构造可执行软件修复评测，区分修复目标测试与保持既有行为。 | §2 基准、§4—5 实验、§7 讨论、附录A验证 |
| [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135v2) | 新增 | 通过分块与重计算减少注意力计算的显存读写，在保持精确注意力的同时改善速度和内存使用。 | §3 算法与IO分析、§4 实验、§5 限制 |
| [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685v2) | 新增 | 冻结基座权重，以低秩增量矩阵完成适配，比较 LoRA 与全参数微调及其他参数高效方法。 | §4 方法、§5 实验、§7 秩分析、§8 展望 |
| [QLoRA: Efficient Finetuning of Quantized LLMs](https://arxiv.org/abs/2305.14314v1) | 新增 | 结合量化基座、低秩适配器、双重量化与分页优化器，降低大模型微调的显存门槛。 | §3 QLoRA、§4—5 实验、§8 限制 |
| [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323v2) | 新增 | 利用近似二阶信息逐层压缩预训练 Transformer 权重，研究低位训练后量化的精度与部署取舍。 | §4 算法、§5 验证、§6 限制 |
| [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180v1) | 新增 | 用分页式 KV 缓存管理和共享机制构建 vLLM，解决动态生成中缓存预留与碎片造成的浪费。 | §4 方法、§6 评测、§7 消融、§8 讨论 |
| [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020v1) | 新增 | 以图文对比学习训练 CLIP，并用自然语言描述实现零样本图像分类，研究跨数据集迁移。 | §2 方法、§3 迁移、§6 限制、§7 影响 |
| [Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356v1) | 新增 | 通过大规模弱监督多语言语音训练研究 Whisper 的零样本识别、翻译与鲁棒性。 | §2 方法、§3 实验、§4 消融、§6 限制 |
| [AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration](https://arxiv.org/abs/2306.00978v6) | 新增 | 根据激活统计保护重要权重通道，配合低位内核研究 AWQ 的模型压缩与端侧推理。 | §3 AWQ、§4 TinyChat、§5 实验 |
| [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971v1) | 新增 | 报告初代 LLaMA 的数据配方、架构与评测，展示更充分训练较小模型的研究路线。 | §2 训练、§3 结果、§5 风险 |
| [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155v1) | 新增 | 通过示范微调、偏好奖励模型与 PPO 训练 InstructGPT，比较人类偏好及能力回退。 | §3 方法、§4 结果、§5 讨论 |
| [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290v3) | 新增 | 把偏好优化转为直接作用于策略的分类目标，比较 DPO 与显式奖励建模加强化学习的训练流程。 | §4 DPO目标、§5 理论分析、§6 实验 |
| [Universal and Transferable Adversarial Attacks on Aligned Language Models](https://arxiv.org/abs/2307.15043v2) | 新增 | 研究对齐语言模型中的可迁移对抗提示，提供评测拒答与对抗鲁棒性的方法材料。 | 攻击方法、实验设置与迁移评测、限制 |
| [Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection](https://arxiv.org/abs/2302.12173v2) | 新增 | 通过间接提示注入分析外部检索内容与应用指令混淆的风险，研究集成语言模型应用的信任边界。 | 威胁模型、攻击场景、实验与缓解讨论 |
| [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073v1) | 新增 | 用显式原则生成批评和修订，再以 AI 偏好反馈训练模型，研究 Constitutional AI 的对齐流程。 | 监督学习阶段、AI反馈强化学习、评测与讨论 |
| [Measuring Massive Multitask Language Understanding](https://arxiv.org/abs/2009.03300v3) | 新增 | 建立涵盖多学科知识与推理的 MMLU 评测，用统一选择题测试模型的任务间表现。 | 数据集构建、实验与分析 |
| [Holistic Evaluation of Language Models](https://arxiv.org/abs/2211.09110v2) | 新增 | 以场景与多维指标组织 HELM，比较准确性、鲁棒性、校准、偏差和效率等取舍。 | 场景与指标分类、评测方法、结果与限制 |
| [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172v3) | 新增 | 通过改变相关信息位置，检验长上下文模型的信息利用能力，揭示中部信息易被忽略的现象。 | 多文档问答、键值检索、位置控制实验、讨论 |
| [Mamba: Linear-Time Sequence Modeling with Selective State Spaces](https://arxiv.org/abs/2312.00752v2) | 新增 | 用输入依赖的选择机制与高效扫描实现 Mamba 状态空间模型，研究长序列建模的效率取舍。 | §3 选择性状态空间、§4 实验 |
| [Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models](https://arxiv.org/abs/2206.04615v3) | 新增 | 通过 BIG-bench 的多样任务研究语言模型能力与规模变化，并公开任务设计和评测资源。 | 任务构建、模型评测、结果分析与限制 |
| [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747v2) | 新增 | 通过回归概率路径的向量场训练连续归一化流，比较不同路径设计下的 Flow Matching 生成。 | §3 Flow Matching、§4 条件路径、§6 实验 |
| [Adding Conditional Control to Text-to-Image Diffusion Models](https://arxiv.org/abs/2302.05543v3) | 新增 | 以可训练控制分支给预训练扩散模型加入边缘、深度、姿态等空间条件，形成 ControlNet 方法。 | §3 方法、§4 实验与消融 |
| [Voicebox: Text-Guided Multilingual Universal Speech Generation at Scale](https://arxiv.org/abs/2306.15687v2) | 新增 | 以条件流匹配和语音填补训练 Voicebox，研究文本引导的多语言语音生成与编辑。 | 模型与训练任务、语音生成及编辑评测、影响与限制 |
| [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961v3) | 新增 | 通过每个 token 选择单一专家的路由机制，研究 Switch Transformer 的稀疏扩展与训练稳定性。 | Switch路由、训练稳定性、预训练与迁移实验 |
| [Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531v1) | 新增 | 用温度软化的教师输出训练较小学生模型，说明知识蒸馏与硬标签训练的差异。 | 蒸馏目标、MNIST与语音实验、讨论 |
| [Layer Normalization](https://arxiv.org/abs/1607.06450v1) | 新增 | 按单个样本的层内特征计算归一化统计量，研究 Layer Normalization 在循环等网络中的训练表现。 | 方法、相关方法比较、实验 |
| [Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers](https://arxiv.org/abs/2301.02111v1) | 保留并更新 | 以神经音频编解码 token 和声学提示训练 VALL-E，研究零样本说话人条件的文本转语音。 | 模型方法、语音合成评测与限制 |
| [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781v3) | 新增 | 用 CBOW 与 Skip-gram 高效学习词向量，并通过语义、句法关系任务评价表示质量。 | §3 模型、§4—5 实验、§6 结论 |
| [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473v7) | 新增 | 通过对源句表示进行软对齐，让翻译解码器按需关注输入位置，缓解固定长度表示瓶颈。 | §3 对齐方法、§4—5 翻译实验 |
| [On the difficulty of training Recurrent Neural Networks](https://arxiv.org/abs/1211.5063v2) | 新增 | 从分析、几何与动态系统角度研究循环网络的梯度消失与爆炸，并检验梯度裁剪等处理方法。 | 梯度分析、处理策略、实验 |
| [Improving neural networks by preventing co-adaptation of feature detectors](https://arxiv.org/abs/1207.0580v1) | 新增 | 通过训练时随机丢弃特征检测器，减少神经网络对固定特征组合的依赖，研究 dropout 正则化。 | 随机丢弃方法、图像与语音实验、模型平均讨论 |
| [Playing Atari with Deep Reinforcement Learning](https://arxiv.org/abs/1312.5602v1) | 新增 | 把卷积网络、Q学习与经验回放结合，从游戏像素学习动作价值，是深度强化学习的早期关键实验。 | §4 算法、§5 游戏实验、§6 结论 |
| [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347v2) | 新增 | 以裁剪或KL约束的替代目标更新策略，比较 PPO 的实现复杂度、稳定性与控制任务表现。 | §2—4 目标、§5 算法、§6 实验 |
| [XGBoost: A Scalable Tree Boosting System](https://arxiv.org/abs/1603.02754v3) | 新增 | 结合稀疏感知分裂、加权分位数草图与缓存优化，构建可扩展的 XGBoost 梯度提升树系统。 | §2—4 方法与系统、§6 实验 |
| [Deep Learning with Differential Privacy](https://arxiv.org/abs/1607.00133v2) | 新增 | 结合逐样本梯度裁剪、加噪与隐私损失核算，研究具有差分隐私保证的深度学习训练。 | §3 方法与隐私核算、§4 实现、§5 实验 |
| [On Calibration of Modern Neural Networks](https://arxiv.org/abs/1706.04599v2) | 新增 | 比较现代神经网络的置信度与实际准确率，评测温度缩放等后处理校准方法。 | §2 定义、§3 失准、§4—5 校准方法与结果 |
| [The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751v2) | 新增 | 比较开放式生成中的最大似然解码与采样退化，并以动态累积概率截断提出核采样。 | §3 解码、§4—6 自动与人工评测 |
| [Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs](https://arxiv.org/abs/1603.09320v4) | 新增 | 使用分层小世界图实现近似最近邻检索，分析索引结构、搜索效率与召回率取舍。 | 图构建与搜索算法、复杂度与实验比较 |
| [Passage Re-ranking with BERT](https://arxiv.org/abs/1901.04085v5) | 新增 | 将查询与候选段落联合输入 BERT 重排，验证交叉编码器在检索后排序中的作用。 | §2 方法、§3 实验 |
| [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832v2) | 新增 | 通过分别编码查询和文档、再进行 token 级延迟交互，实现 ColBERT 的检索质量与效率折中。 | §3 方法、§4 质量与成本评测 |
| [Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511v1) | 新增 | 训练反思 token 来决定何时检索并评估证据与生成内容，使 Self-RAG 可按任务调整检索行为。 | §3 训练与推理、§4—5 实验、伦理边界 |
| [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130v2) | 新增 | 从文档构建实体图与社区摘要，研究 GraphRAG 对整库主题归纳等全局问题的回答能力。 | §3 方法、§4 分析、§5 结果、§6 讨论 |
| [Chain-of-Verification Reduces Hallucination in Large Language Models](https://arxiv.org/abs/2309.11495v2) | 新增 | 把初稿拆成独立验证问题，再据回答修订输出，研究核查链对事实性错误的影响。 | §3 CoVe、§4 实验、§6 限制 |
| [A Watermark for Large Language Models](https://arxiv.org/abs/2301.10226v4) | 新增 | 在生成采样中嵌入统计信号并设计检测检验，研究语言模型文本水印的质量与可检测性。 | §3—4 方法与分析、§6 实验、§7 攻击与边界 |
| [ZeRO: Memory Optimizations Toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054v3) | 新增 | 通过分片优化器状态、梯度和参数减少分布式训练中的冗余，分析 ZeRO 的显存与通信取舍。 | §4—8 分片与通信、§10 实现评测 |
| [World Models](https://arxiv.org/abs/1803.10122v4) | 新增 | 用压缩视觉表示与循环环境模型训练控制器，探索在学习到的模拟环境中优化策略。 | §2 模型、§3—4 实验、§7 讨论 |
| [Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned](https://arxiv.org/abs/2209.07858v2) | 新增 | 记录人类红队测试流程、攻击数据和模型比较，分析安全评测的覆盖与测量局限。 | §3 方法、§4 结果、§5 限制 |
| [TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://arxiv.org/abs/2109.07958v2) | 新增 | 用易诱发常见误解的问题构造 TruthfulQA，区分模仿训练文本与给出真实答案。 | §2 基准、§3—4 实验、§5 讨论 |
| [TIES-Merging: Resolving Interference When Merging Models](https://arxiv.org/abs/2306.01708v2) | 新增 | 通过裁去微小更新、协调符号冲突再合并任务向量，研究 TIES 对模型合并干扰的处理。 | §4 方法、§5—7 实验、附录A限制 |

## 前沿初判：7篇

| 论文及已核版本 | 处置 | 贡献与入选依据 | 原文定位 |
|---|---|---|---|
| [CliffCompaction: Cost-Efficient Compaction for Long-Horizon Coding Agents](https://arxiv.org/abs/2609.26779v1) | 新增 | 以保留原文的裁剪方式压缩长任务历史，研究 Agent 上下文保真、成本与测试时扩展的取舍。 | §2 方法、§3 实验、§8 限制 |
| [SWE-Serve: Benchmarking Agentic Engineering For Production Inference Serving](https://arxiv.org/abs/2609.26777v1) | 新增 | 建立面向推理服务工程的 SWE-Serve 任务集，以端到端测试检验局部通过与服务正确之间的差距。 | 任务构建与测试设计、实验、§6 限制 |
| [Grow the Harness, Not the Context: From Strategy-Free Scaffolds to Reusable Specialist Agents](https://arxiv.org/abs/2609.26760v1) | 新增 | 从失败轨迹中改进可复用的 Agent 控制代码，并通过独立门控任务回滚能力退化。 | §3 方法、§4.1 数据划分、§4.4 消融 |
| [Type-Safe Is Not Error-Free: A Constrained Decision Head Follows the Option Name, Not the Rubric Bound to It](https://arxiv.org/abs/2609.26758v1) | 新增 | 在保持问题与判定规则不变时置换选项名称，揭示类型合法输出仍可能发生系统性语义误判。 | 名称置换及中性对照实验、§6 讨论、§7 限制 |
| [JEV-as-a-Judge: Accept When Confident, Escalate When Unsure](https://arxiv.org/abs/2609.26550v1) | 新增 | 比较专用判断器、生成模型与奖励模型，并用冻结阈值将低置信度评审升级给更强模型。 | 评审对比、冻结级联、人工裁决、§5—7 边界 |
| [REFLEX with Jev for Efficient Selective Control in LLM Agents](https://arxiv.org/abs/2609.26532v1) | 新增 | 将有限动作决策与开放式生成分开，比较 REFLEX 的选择性升级策略及外部基准中的收益边界。 | 控制架构、干预实验、外部验证、§6—7 讨论限制 |
| [Reproducible AI Requires Reproducible Randomness](https://arxiv.org/abs/2609.26461v1) | 新增 | 比较 Mersenne Twister 与 Philox 在多个Python生态中的实现，检验种子和内部状态能否保证随机序列一致。 | PDF实验环境、跨库比较及结论（§6—10） |

## 暂缓与排除

| 论文及已核版本 | 处置 | 贡献与入选依据 | 原文定位 |
|---|---|---|---|
| [The Delegation Blind Spot: Auditing Product Decisions from Agent Choices](https://arxiv.org/abs/2609.26642v1) | 暂缓 | 合成用户与有限分类下的可识别性审计有明确用途，但尚不足以证明它是本站产品决策研究的关键成果；不是因没有引用而淘汰。 | 见试审记录 |
| [Quantum-Aided Active Device Detection in Energy-Harvesting Symbiotic Radio Networks](https://arxiv.org/abs/2609.26565v1) | 范围排除 | 前次样本未找到本站直接用途，未判断学术质量 | 见试审记录 |
| [Neutral-Atom-based Quantum Optimization for Resource Allocation in NOMA Networks](https://arxiv.org/abs/2609.26556v1) | 范围排除 | 前次样本未找到本站直接用途，未判断学术质量 | 见试审记录 |

The Delegation Blind Spot的内容可用性与重要性分开处理：原试审的有限用途结论保留，但当前证据不足以进入“重要论文”集合。需补真实用户/独立应用证据，或证明相对既有识别与决策理论的实质增量；不是因为没有引用而否决新作。两个量子通信论文仅作范围筛除，没有评价学术质量。

## 覆盖范围与未完成工作

本批首发年份跨度2012—2026，不限制按篇数入选。候选关联91个现有节点；其余39个节点仍无候选。即使已有资料的91个节点，也没有完成全部年份、分类和分页的系统检索，不能称已充分覆盖。所有130节点的历史与前沿检索完成标记继续为false。

本轮完成的是已知候选处置与一轮缺口补查。尚未完成：跨分类分页检索、参考文献链的全部回溯与前向修正追踪、2024—2026各方向的完整增量检索；视频生成、可解释性、数据投毒、合成数据等仍有明显缺口。MCP等协议主题也需要官方规范，不应为了论文数量强行匹配。用户的“所有重要且不重复”仍是持续覆盖目标，不能用78这个数字替代。

检索状态见[130节点覆盖表](../proposals/arxiv-catalog/coverage.json)，逐篇记录见[结构化目录](../proposals/arxiv-catalog/records.json)。本轮没有配置定时任务。

## 验证

- 专业资料库校验通过：来源分类、节点关系、字段、版本依据与全库arXiv基础ID无重复；其他来源的8项既有覆盖待补提示保留。
- 浏览器回归通过：HTTP与file两种入口均能加载78条arXiv结果；AutoGen分类可见、全库仅一条，详情保留官方文档与论文两种原件；直接论文路由、搜索、暂缓条目不展示均正常。
- 浏览器、校验器、链接检查、国际化清单、发布清单已接入新数据包。未执行线上部署。
