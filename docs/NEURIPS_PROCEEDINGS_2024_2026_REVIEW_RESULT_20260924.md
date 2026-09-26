# NeurIPS Proceedings 2024–2026 审核结果

日期：2026-09-24｜机制：《学术投稿内容重要性审核机制》1.2

## 结论

本轮处理官方 NeurIPS Proceedings 候选池 10,380 篇。所有记录完成论文身份与评价机制门槛核对；未匹配已启用正式机制的论文在第二步提前停止，不声称精读了 10,380 篇全文。

| 结果 | 数量 | 含义 |
|---|---:|---|
| 通过 | 5 | 主赛道 Best Paper 正奖、AI 重大贡献、身份、材料与受限使用检查均闭合 |
| 暂缓 | 10,375 | 普通录用，或只有未启用的 Runner-up / 其他赛道奖项 |
| 合计 | 10,380 | 与候选池逐篇记录一致 |

分年度结果：2024 年 4,493 篇中通过 2 篇、暂缓 4,491 篇；2025 年 5,887 篇中通过 3 篇、暂缓 5,884 篇；2026 官方 Proceedings 尚未发布，本轮为 0 篇。

## 可以上线的论文

### 2024

1. **Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction**
   - NeurIPS Proceedings ID：`neurips-2024-9a24e284b187f662681440ba15c416fb`
   - 结论：通过。委员会确认其主赛道 Best Paper 身份，并突出下一尺度视觉自回归、多尺度 VQ-VAE、效率与缩放证据。
   - 边界：不能外推为对所有扩散模型或视觉任务普遍占优。
   - 去重：已以 `arxiv-2404-02905` 上线，应合并 NeurIPS 正式出版与奖项证据，不新增重复卡片。

2. **Stochastic Taylor Derivative Estimator: Efficient amortization for arbitrary differential operators**
   - NeurIPS Proceedings ID：`neurips-2024-dd2eb5250696753ea37141bbd89bb569`
   - 结论：通过。官方将其列为主赛道 Best Paper，并明确指出它为使用高阶导数的监督学习开辟新路径；方法同时处理高维和高阶微分算子的计算困难。
   - 边界：主要证据来自 PINN 和微分算子监督，不能表述为所有神经网络训练的通用加速。
   - 去重：现有资料库无精确题名或 arXiv ID 记录，可新增一张卡片。

### 2025

3. **1000 Layer Networks for Self-Supervised RL: Scaling Depth Can Enable New Goal-Reaching Capabilities**
   - NeurIPS Proceedings ID：`neurips-2025-e74ee34cc0f2d0780f34ee77d8fba25b`
   - 结论：通过。委员会认为它挑战了强化学习难以训练超深网络的常见认识。
   - 边界：结果依赖特定对比式自监督 RL、批量缩放和模拟环境。
   - 去重：合并到既有 `arxiv-2503-14858`。

4. **Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free**
   - NeurIPS Proceedings ID：`neurips-2025-904e89bb4e632e75fb47f093b620b257`
   - 结论：通过。委员会确认 SDPA 输出门控在稳定性、注意力汇聚和长上下文方面的系统证据，并认为该建议易于采用。
   - 边界：不能保证所有模型、数据与注意力变体均获得相同收益。
   - 去重：合并到既有 `arxiv-2505-06708`。

5. **Why Diffusion Models Don’t Memorize: The Role of Implicit Dynamical Regularization in Training**
   - NeurIPS Proceedings ID：`neurips-2025-ceb7f3cc876a6dcb15130a645b5a4507`
   - 结论：通过。委员会将其评价为扩散模型隐式正则化动力学的基础性工作。
   - 边界：理论依赖可处理模型，标题不能理解为扩散模型永不记忆。
   - 去重：合并到既有 `arxiv-2505-17638`。

## 奖项命中但不能上线的记录

- 2024 两篇 Runner-up：`Guiding a Diffusion Model with a Bad Version of Itself`、`Not All Tokens Are What You Need for Pretraining`。
- 2024 Datasets & Benchmarks Best Paper：`The PRISM Alignment Dataset...`。
- 2025 三篇 Runner-up：`Does Reinforcement Learning Really Incentivize...`、`Optimal Mistake Bounds for Transductive Online Learning`、`Superposition Yields Robust Neural Scaling`。
- 2025 Datasets & Benchmarks Best Paper：`Artificial Hivemind...`。

这些记录的奖项真实存在，但现行白名单只启用了相应年份的主赛道 Best Paper 正奖。Runner-up 和其他赛道不能自动继承。

## 旧记录纠错

`Guiding a Diffusion Model with a Bad Version of Itself` 目前以 `arxiv-2406-02507` 出现在正式资料库，但官方 2024 公告把它列在 **Runners ups for the main track**，不是 Best Paper 正奖。旧审核把它写成 Best Paper，违反精确匹配要求。下一次发布必须移除该条正式通过状态，或改为“暂缓：Runner-up 机制未启用”。

## 数据文件

- 全量逐篇结果：`proposals/academic-importance/neurips-proceedings-2024-2026-review-20260924/review-results.jsonl`
- 五篇通过记录：`proposals/academic-importance/neurips-proceedings-2024-2026-review-20260924/selected.json`
- 十二篇官方奖项命中：`proposals/academic-importance/neurips-proceedings-2024-2026-review-20260924/award-matches.json`
- 汇总与纠错：`proposals/academic-importance/neurips-proceedings-2024-2026-review-20260924/summary.json`
