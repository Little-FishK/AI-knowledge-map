# arXiv 100篇AI论文内容审核试验（2026-09-23）

本轮按v1.1六步规则逐篇处置100篇：**目前确认12篇可收录，其中7篇可新增、5篇已在库应更新证据；88篇暂缓补证。** 没有把88篇判为不重要，也没有修改网站发布数据。

## 样本与审核范围

样本固定为旧库78篇，加22篇来自ICLR 2025、ICML 2026、NeurIPS 2025、CVPR 2025及ACL 2025正式获奖名单的新候选。ID按首次清单固定，未因审核结果更换。这是偏向优质候选的定向样本，不是随机抽样，12%不能外推整个arXiv。

六步：①AI相关候选；②匹配正式评价机制；③核实正奖与论文身份；④独立依据支持AI重大贡献；⑤原件材料与当前状态；⑥用途、贡献去重与限定收录方式。前置门槛未通过则后续步骤记“未进入”，没有声称精读了100篇。

原78篇复用同日已保存的原始材料和编辑记录；对22篇新候选及7篇经典候选重取原始元数据，1篇HTTP 406由网页工具补核。对7篇拟新增候选下载原文并抽读关键方法、结论与局限。5篇已在库通过项复核了原件版本并引用既有正文记录。未复现实验、未逐条验证数学证明。

原机制清单20项，本次针对经典候选核实并登记6项历史/长期评价机制，保持原有门槛不变；不是因知名度直接放行。详见本轮机制快照与主机制文件。

## 结果

| 结论 | 篇数 | 含义 |
|---|---:|---|
| 可新增 | 7 | 六步证据满足，可进入编目 |
| 已在库，更新证据 | 5 | 值得收录，但不应重复建卡 |
| 已匹配正奖，AI重大性证据仍不足 | 17 | 包含15篇新候选及ResNet、BatchNorm |
| 尚未建立符合规则的正奖匹配 | 71 | 包含奖项范围未覆盖和Runner Up；不等于没有贡献 |
| 明确判定不值得收录 | 0 | 本次未取得足以支持这种否定结论的依据 |

## 已确认的12篇

| 论文 | 评价依据 | 重大贡献依据 | 处置 |
|---|---|---|---|
| [BERT](https://arxiv.org/abs/1810.04805) | [NAACL 2019 · Best Long Paper](https://aclanthology.org/N19-1423/) | [独立综述说明BERT成为NLP必要基线，并归纳150余项围绕其表示、训练和架构的研究；与正式奖项共同支持重大贡献。](https://aclanthology.org/2020.tacl-1.54.pdf) | 更新证据 |
| [GPT-3](https://arxiv.org/abs/2005.14165) | [NeurIPS 2020 · Best Paper Awards](https://blog.neurips.cc/2020/12/07/announcing-the-neurips-2020-award-recipients/) | [委员会指出规模扩展后的语言模型可不经额外训练执行多种少样本任务，预期具有重大且持久影响。](https://blog.neurips.cc/2020/12/07/announcing-the-neurips-2020-award-recipients/) | 更新证据 |
| [Adam](https://arxiv.org/abs/1412.6980) | [ICLR 2025 · Test of Time](https://blog.iclr.cc/2025/04/14/announcing-the-test-of-time-award-winners-from-iclr-2015/) | [官方明确指出Adam改变神经网络训练，广泛用于视觉、语言及强化学习。](https://blog.iclr.cc/2025/04/14/announcing-the-test-of-time-award-winners-from-iclr-2015/) | 更新证据 |
| [GAN](https://arxiv.org/abs/1406.2661) | [NeurIPS 2024 · Test of Time](https://blog.neurips.cc/2024/11/27/announcing-the-neurips-2024-test-of-time-paper-awards/) | [官方将其认定为生成建模的基础性工作，并说明十年间对后续研究的影响。](https://blog.neurips.cc/2024/11/27/announcing-the-neurips-2024-test-of-time-paper-awards/) | 更新证据 |
| [VAE](https://arxiv.org/abs/1312.6114) | [ICLR 2024 · Test of Time](https://blog.iclr.cc/2024/05/07/iclr-2024-test-of-time-award/) | [官方指出该工作把深度学习与可扩展概率推断结合，形成VAE并启发后续概率模型。](https://blog.iclr.cc/2024/05/07/iclr-2024-test-of-time-award/) | 更新证据 |
| [The Flexibility Trap](https://arxiv.org/abs/2601.15165) | [ICML 2026 · Outstanding Paper Award](https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/) | [委员会确认该工作揭示任意顺序生成绕过推理分叉、压缩解空间这一此前不明显的失效机制。](https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/) | 可新增 |
| [High-accuracy sampling](https://arxiv.org/abs/2602.01338) | [ICML 2026 · Outstanding Paper Award](https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/) | [委员会确认解决仅用梯度实现高精度采样的长期理论问题，改善误差依赖的复杂度。](https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/) | 可新增 |
| [A3C / Asynchronous Methods](https://arxiv.org/abs/1602.01783) | [ICML 2026 · Test of Time Award](https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/) | [官方指出异步并行actor-learners改变强化学习实践，形成后续方法的重要基础。](https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/) | 可新增 |
| [1000 Layer Networks](https://arxiv.org/abs/2503.14858) | [NeurIPS 2025 · Best Paper](https://neurips.cc/virtual/2025/loc/atlanta/awards_detail) | [委员会认为其改变了强化学习难以有效训练深层网络的认识。](https://blog.neurips.cc/2025/11/26/announcing-the-neurips-2025-best-paper-awards/) | 可新增 |
| [Why Diffusion Models Don’t Memorize](https://arxiv.org/abs/2505.17638) | [NeurIPS 2025 · Best Paper](https://neurips.cc/virtual/2025/loc/atlanta/awards_detail) | [委员会认定其从训练动力学解释生成模型泛化，连接实验与理论。](https://blog.neurips.cc/2025/11/26/announcing-the-neurips-2025-best-paper-awards/) | 可新增 |
| [Gated Attention](https://arxiv.org/abs/2505.06708) | [NeurIPS 2025 · Best Paper](https://neurips.cc/virtual/2025/loc/atlanta/awards_detail) | [委员会确认门控改善稳定性、注意力汇聚与长上下文表现，具有广泛采用潜力。](https://blog.neurips.cc/2025/11/26/announcing-the-neurips-2025-best-paper-awards/) | 可新增 |
| [Faster R-CNN](https://arxiv.org/abs/1506.01497) | [NeurIPS 2025 · Test of Time Award](https://neurips.cc/virtual/2025/loc/atlanta/awards_detail) | [官方指出可学习RPN替代手工区域建议，深刻影响视觉研究并成为后续工作的基础。](https://blog.neurips.cc/2025/11/26/announcing-the-test-of-time-paper-award-for-neurips-2025/) | 可新增 |

## 这次试验暴露的机制边界

- **不能把暂缓解释成低价值。** Transformer等论文本轮没有建立符合清单要求的正奖证据，不能由此否定其学术重要性；奖项年份与机制覆盖仍有限。
- **正奖硬门槛可能漏掉已被官方肯定的重大贡献。** Bahdanau注意力论文有ICLR官方重大影响评语，但身份是Runner Up，按现行规则暂缓。这里忠实执行规则，未擅自放宽。
- **“有详细评语”与“真正重大”也不能混同。** 一些ICLR/ACL获奖名单只有题名和作者，本轮保留待核，不能因为主办方未写长评语就认定论文低价值。需要补独立综述或后续研究。
- **前沿贡献不是长期影响已经实现。** 前沿通过项基于正式委员会的重大性评价，并在记录中保留研究条件与局限；不能写成已被十年验证。

因此，12篇是**本轮证据已经闭合的数量**，不是断言这100篇最终只有12篇重要。

## 100篇逐项结果

步骤列依次对应上述六步：✓通过；?待补证；—未进入。详细作者、版本、定位、正文证据、局限、去重理由、下一步均在[结构化审核记录](../proposals/academic-importance/arxiv-100-20260923/reviews.json)。

| # | arXiv / 论文 | 六步 | 结论与理由 |
|---:|---|---|---|
| 1 | [1706.03762 · Attention Is All You Need](https://arxiv.org/abs/1706.03762) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 2 | [1810.04805 · BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **更新已有**：独立综述说明BERT成为NLP必要基线，并归纳150余项围绕其表示、训练和架构的研究；与正式奖项共同支持重大贡献。 |
| 3 | [2005.14165 · Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **更新已有**：委员会指出规模扩展后的语言模型可不经额外训练执行多种少样本任务，预期具有重大且持久影响。 |
| 4 | [2001.08361 · Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 5 | [2203.15556 · Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 6 | [1512.03385 · Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：已核CVPR 2026 Longuet-Higgins获奖；当前证据有名单和奖项通则，尚缺本轮登记的具体残差学习影响评述。 |
| 7 | [1412.6980 · Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **更新已有**：官方明确指出Adam改变神经网络训练，广泛用于视觉、语言及强化学习。 |
| 8 | [1502.03167 · Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift](https://arxiv.org/abs/1502.03167) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：已核ICML 2025官方Test Of Time日程；官方页面间歇不可用，当前缺独立具体贡献评述，暂缓。 |
| 9 | [1406.2661 · Generative Adversarial Networks](https://arxiv.org/abs/1406.2661) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **更新已有**：官方将其认定为生成建模的基础性工作，并说明十年间对后续研究的影响。 |
| 10 | [1312.6114 · Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **更新已有**：官方指出该工作把深度学习与可扩展概率推断结合，形成VAE并启发后续概率模型。 |
| 11 | [2006.11239 · Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 12 | [2112.10752 · High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 13 | [2005.11401 · Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 14 | [2004.04906 · Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 15 | [1910.13461 · BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension](https://arxiv.org/abs/1910.13461) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 16 | [2201.11903 · Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 17 | [2203.11171 · Self-Consistency Improves Chain of Thought Reasoning in Language Models](https://arxiv.org/abs/2203.11171) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 18 | [2305.10601 · Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 19 | [2210.03629 · ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 20 | [2302.04761 · Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 21 | [2303.11366 · Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 22 | [2308.08155 · AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 23 | [2310.06770 · SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 24 | [2205.14135 · FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 25 | [2106.09685 · LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 26 | [2305.14314 · QLoRA: Efficient Finetuning of Quantized LLMs](https://arxiv.org/abs/2305.14314) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 27 | [2210.17323 · GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 28 | [2309.06180 · Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 29 | [2103.00020 · Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 30 | [2212.04356 · Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 31 | [2306.00978 · AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration](https://arxiv.org/abs/2306.00978) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 32 | [2302.13971 · LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 33 | [2203.02155 · Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 34 | [2305.18290 · Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 35 | [2307.15043 · Universal and Transferable Adversarial Attacks on Aligned Language Models](https://arxiv.org/abs/2307.15043) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 36 | [2302.12173 · Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection](https://arxiv.org/abs/2302.12173) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 37 | [2212.08073 · Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 38 | [2009.03300 · Measuring Massive Multitask Language Understanding](https://arxiv.org/abs/2009.03300) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 39 | [2211.09110 · Holistic Evaluation of Language Models](https://arxiv.org/abs/2211.09110) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 40 | [2307.03172 · Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 41 | [2312.00752 · Mamba: Linear-Time Sequence Modeling with Selective State Spaces](https://arxiv.org/abs/2312.00752) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 42 | [2206.04615 · Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models](https://arxiv.org/abs/2206.04615) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 43 | [2210.02747 · Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 44 | [2302.05543 · Adding Conditional Control to Text-to-Image Diffusion Models](https://arxiv.org/abs/2302.05543) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 45 | [2306.15687 · Voicebox: Text-Guided Multilingual Universal Speech Generation at Scale](https://arxiv.org/abs/2306.15687) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 46 | [2101.03961 · Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 47 | [1503.02531 · Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 48 | [1607.06450 · Layer Normalization](https://arxiv.org/abs/1607.06450) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 49 | [2609.26779 · CliffCompaction: Cost-Efficient Compaction for Long-Horizon Coding Agents](https://arxiv.org/abs/2609.26779) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 50 | [2609.26777 · SWE-Serve: Benchmarking Agentic Engineering For Production Inference Serving](https://arxiv.org/abs/2609.26777) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 51 | [2609.26760 · Grow the Harness, Not the Context: From Strategy-Free Scaffolds to Reusable Specialist Agents](https://arxiv.org/abs/2609.26760) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 52 | [2609.26758 · Type-Safe Is Not Error-Free: A Constrained Decision Head Follows the Option Name, Not the Rubric Bound to It](https://arxiv.org/abs/2609.26758) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 53 | [2609.26550 · JEV-as-a-Judge: Accept When Confident, Escalate When Unsure](https://arxiv.org/abs/2609.26550) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 54 | [2609.26532 · REFLEX with Jev for Efficient Selective Control in LLM Agents](https://arxiv.org/abs/2609.26532) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 55 | [2609.26461 · Reproducible AI Requires Reproducible Randomness](https://arxiv.org/abs/2609.26461) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 56 | [2301.02111 · Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers](https://arxiv.org/abs/2301.02111) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 57 | [1301.3781 · Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 58 | [1409.0473 · Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473) | ✓ / ? / — / — / — / — | **暂缓**：ICLR 2025官方明确为Runner Up；官方肯定注意力的重大影响，但v1.1只接纳正奖，故暂缓。 |
| 59 | [1211.5063 · On the difficulty of training Recurrent Neural Networks](https://arxiv.org/abs/1211.5063) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 60 | [1207.0580 · Improving neural networks by preventing co-adaptation of feature detectors](https://arxiv.org/abs/1207.0580) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 61 | [1312.5602 · Playing Atari with Deep Reinforcement Learning](https://arxiv.org/abs/1312.5602) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 62 | [1707.06347 · Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 63 | [1603.02754 · XGBoost: A Scalable Tree Boosting System](https://arxiv.org/abs/1603.02754) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 64 | [1607.00133 · Deep Learning with Differential Privacy](https://arxiv.org/abs/1607.00133) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 65 | [1706.04599 · On Calibration of Modern Neural Networks](https://arxiv.org/abs/1706.04599) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 66 | [1904.09751 · The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 67 | [1603.09320 · Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs](https://arxiv.org/abs/1603.09320) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 68 | [1901.04085 · Passage Re-ranking with BERT](https://arxiv.org/abs/1901.04085) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 69 | [2004.12832 · ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 70 | [2310.11511 · Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 71 | [2404.16130 · From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 72 | [2309.11495 · Chain-of-Verification Reduces Hallucination in Large Language Models](https://arxiv.org/abs/2309.11495) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 73 | [2301.10226 · A Watermark for Large Language Models](https://arxiv.org/abs/2301.10226) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 74 | [1910.02054 · ZeRO: Memory Optimizations Toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 75 | [1803.10122 · World Models](https://arxiv.org/abs/1803.10122) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 76 | [2209.07858 · Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned](https://arxiv.org/abs/2209.07858) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 77 | [2109.07958 · TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://arxiv.org/abs/2109.07958) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 78 | [2306.01708 · TIES-Merging: Resolving Interference When Merging Models](https://arxiv.org/abs/2306.01708) | ✓ / ? / — / — / — / — | **暂缓**：本轮核验的机制与名单中未建立正奖匹配；未穷尽其他年份/赛道，不能据此称论文不重要。 |
| 79 | [2406.05946 · Safety Alignment Should Be Made More Than Just a Few Tokens Deep](https://arxiv.org/abs/2406.05946) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立说明该失效解释或防御方法对AI安全研究的重大影响。 |
| 80 | [2407.10490 · Learning Dynamics of LLM Finetuning](https://arxiv.org/abs/2407.10490) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立评估该分析框架对后训练研究的重大作用。 |
| 81 | [2410.02355 · AlphaEdit: Null-Space Constrained Knowledge Editing for Language Models](https://arxiv.org/abs/2410.02355) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立评估知识保持方法的重大性；官方题名Model Editing与arXiv Knowledge Editing有差异，作者名单对应。 |
| 82 | [2601.15165 · The Flexibility Trap: Rethinking the Value of Arbitrary Order in Diffusion Language Models](https://arxiv.org/abs/2601.15165) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **可新增**：委员会确认该工作揭示任意顺序生成绕过推理分叉、压缩解空间这一此前不明显的失效机制。 |
| 83 | [2602.01338 · High-accuracy sampling for diffusion models and log-concave distributions](https://arxiv.org/abs/2602.01338) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **可新增**：委员会确认解决仅用梯度实现高精度采样的长期理论问题，改善误差依赖的复杂度。 |
| 84 | [1602.01783 · Asynchronous Methods for Deep Reinforcement Learning](https://arxiv.org/abs/1602.01783) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **可新增**：官方指出异步并行actor-learners改变强化学习实践，形成后续方法的重要基础。 |
| 85 | [2503.14858 · 1000 Layer Networks for Self-Supervised RL: Scaling Depth Can Enable New Goal-Reaching Capabilities](https://arxiv.org/abs/2503.14858) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **可新增**：委员会认为其改变了强化学习难以有效训练深层网络的认识。 |
| 86 | [2505.17638 · Why Diffusion Models Don't Memorize: The Role of Implicit Dynamical Regularization in Training](https://arxiv.org/abs/2505.17638) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **可新增**：委员会认定其从训练动力学解释生成模型泛化，连接实验与理论。 |
| 87 | [2505.06708 · Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free](https://arxiv.org/abs/2505.06708) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **可新增**：委员会确认门控改善稳定性、注意力汇聚与长上下文表现，具有广泛采用潜力。 |
| 88 | [1506.01497 · Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks](https://arxiv.org/abs/1506.01497) | ✓ / ✓ / ✓ / ✓ / ✓ / ✓ | **可新增**：官方指出可学习RPN替代手工区域建议，深刻影响视觉研究并成为后续工作的基础。 |
| 89 | [2503.11651 · VGGT: Visual Geometry Grounded Transformer](https://arxiv.org/abs/2503.11651) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：已获Best Paper，CVPR总结也描述其能力；仍需更明确的独立重大性或研究路线影响依据。 |
| 90 | [2402.11005 · A Theory of Response Sampling in LLMs: Part Descriptive and Part Prescriptive](https://arxiv.org/abs/2402.11005) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需证明该解释对通用模型评测或决策研究的重大贡献。 |
| 91 | [2502.01926 · Fairness through Difference Awareness: Measuring Desired Group Discrimination in LLMs](https://arxiv.org/abs/2502.01926) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需证明其改变AI公平评价方法，而不仅是引入一套新基准。 |
| 92 | [2406.06144 · Language Models Resist Alignment: Evidence From Data Compression](https://arxiv.org/abs/2406.06144) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需外部依据确认其对AI对齐理论或方法的重大作用。 |
| 93 | [2502.11089 · Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立论证该稀疏架构对AI计算路线的重大贡献。 |
| 94 | [2502.16487 · All That Glitters is Not Novel: Plagiarism in AI Generated Research](https://arxiv.org/abs/2502.16487) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立论证对科研Agent原创性评测的重大贡献；不把个案比例推广到所有AI研究。 |
| 95 | [2502.19249 · Between Circuits and Chomsky: Pre-pretraining on Formal Languages Imparts Linguistic Biases](https://arxiv.org/abs/2502.19249) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立确认该归纳偏置研究的重大性及适用范围。 |
| 96 | [2507.08342 · Beyond N-Grams: Rethinking Evaluation Metrics and Strategies for Multilingual Abstractive Summarization](https://arxiv.org/abs/2507.08342) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立确认对AI评价体系的重大改变，获奖及指标对比本身不够。 |
| 97 | [2410.12462 · Bridging the Language Gaps in Large Language Models with Inference-Time Cross-Lingual Intervention](https://arxiv.org/abs/2410.12462) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立确认跨语言模型改进的重大性与适用范围。 |
| 98 | [2412.09871 · Byte Latent Transformer: Patches Scale Better Than Tokens](https://arxiv.org/abs/2412.09871) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立确认该架构对tokenization或语言建模路线的重大作用。 |
| 99 | [2506.13216 · Capability Salience Vector: Fine-grained Alignment of Loss and Capabilities for Downstream Task Scaling Law](https://arxiv.org/abs/2506.13216) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立确认其对能力预测或规模规律研究的重大贡献。 |
| 100 | [2501.08292 · HALoGEN: Fantastic LLM Hallucinations and Where to Find Them](https://arxiv.org/abs/2501.08292) | ✓ / ✓ / ✓ / ? / — / — | **暂缓**：需独立确认其对AI可靠性评价的重大贡献，而不只依据基准规模。 |

## 文件与复核入口

- [固定样本](../proposals/academic-importance/arxiv-100-20260923/sample.json)
- [逐篇审核及证据定位](../proposals/academic-importance/arxiv-100-20260923/reviews.json)
- [本轮机制快照](../proposals/academic-importance/arxiv-100-20260923/mechanisms-snapshot.json)
- [结构检查结果](../proposals/academic-importance/arxiv-100-20260923/validation.json)

后续补证可以改变暂缓结果，需留存新日期与版本；本报告保留为本轮快照。
