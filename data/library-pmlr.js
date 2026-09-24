/* PMLR 正式奖项论文的公开待补证目录。
 * 14 篇均已核实 PMLR 终版身份与 ICML 正奖，但缺乏 AI 重大贡献外部说明。
 * 上线不代表六步重要性审核通过。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("PMLR 资料包需要先加载资料库");

  const raw = [
    ["pmlr-v235-attias24a", 2024, "Information Complexity of Stochastic Convex Optimization: Applications to Generalization, Memorization, and Tracing", "Idan Attias, Gintare Karolina Dziugaite, Mahdi Haghifam, Roi Livni, Daniel M. Roy", "https://proceedings.mlr.press/v235/attias24a.html", "PMLR 235:2035-2068", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "随机凸优化的信息复杂度、泛化、记忆与追踪", ["information-theory", "gradient-descent", "overfitting"]],
    ["pmlr-v235-bruce24a", 2024, "Genie: Generative Interactive Environments", "Jake Bruce, Michael D Dennis, Ashley Edwards, Jack Parker-Holder, Yuge Shi, Edward Hughes, Matthew Lai, Aditi Mavalankar, Richie Steigerwald, Chris Apps, Yusuf Aytar, Sarah Maria Elisabeth Bechtle, Feryal Behbahani, Stephanie C.Y. Chan, Nicolas Heess, Lucy Gonzalez, Simon Osindero, Sherjil Ozair, Scott Reed, Jingwei Zhang, Konrad Zolna, Jeff Clune, Nando De Freitas, Satinder Singh, Tim Rocktäschel", "https://proceedings.mlr.press/v235/bruce24a.html", "PMLR 235:4603-4623", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "由视频生成可交互环境的生成式世界模型", ["world-models", "video-generation", "reinforcement-learning"]],
    ["pmlr-v235-carlini24a", 2024, "Stealing part of a production language model", "Nicholas Carlini, Daniel Paleka, Krishnamurthy Dj Dvijotham, Thomas Steinke, Jonathan Hayase, A. Feder Cooper, Katherine Lee, Matthew Jagielski, Milad Nasr, Arthur Conmy, Eric Wallace, David Rolnick, Florian Tramèr", "https://proceedings.mlr.press/v235/carlini24a.html", "PMLR 235:5680-5705", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "生产语言模型的信息提取与安全边界", ["llm", "privacy"]],
    ["pmlr-v235-esser24a", 2024, "Scaling Rectified Flow Transformers for High-Resolution Image Synthesis", "Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, Dustin Podell, Tim Dockhorn, Zion English, Robin Rombach", "https://proceedings.mlr.press/v235/esser24a.html", "PMLR 235:12606-12633", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "用于高分辨率图像合成的整流流 Transformer 扩展", ["flow-matching", "image-generation", "transformer"]],
    ["pmlr-v235-khan24a", 2024, "Debating with More Persuasive LLMs Leads to More Truthful Answers", "Akbir Khan, John Hughes, Dan Valentine, Laura Ruis, Kshitij Sachan, Ansh Radhakrishnan, Edward Grefenstette, Samuel R. Bowman, Tim Rocktäschel, Ethan Perez", "https://proceedings.mlr.press/v235/khan24a.html", "PMLR 235:23662-23733", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "利用大语言模型辩论提高答案真实性", ["llm", "alignment", "model-evaluation"]],
    ["pmlr-v235-kondratyuk24a", 2024, "VideoPoet: A Large Language Model for Zero-Shot Video Generation", "Dan Kondratyuk, Lijun Yu, Xiuye Gu, Jose Lezama, Jonathan Huang, Grant Schindler, Rachel Hornung, Vighnesh Birodkar, Jimmy Yan, Ming-Chang Chiu, Krishna Somandepalli, Hassan Akbari, Yair Alon, Yong Cheng, Joshua V. Dillon, Agrim Gupta, Meera Hahn, Anja Hauth, David Hendon, Alonso Martinez, David Minnen, Mikhail Sirotenko, Kihyuk Sohn, Xuan Yang, Hartwig Adam, Ming-Hsuan Yang, Irfan Essa, Huisheng Wang, David A Ross, Bryan Seybold, Lu Jiang", "https://proceedings.mlr.press/v235/kondratyuk24a.html", "PMLR 235:25105-25124", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "以大语言模型范式进行零样本视频生成", ["video-generation", "multimodal", "llm"]],
    ["pmlr-v235-lou24a", 2024, "Discrete Diffusion Modeling by Estimating the Ratios of the Data Distribution", "Aaron Lou, Chenlin Meng, Stefano Ermon", "https://proceedings.mlr.press/v235/lou24a.html", "PMLR 235:32819-32848", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "通过估计数据分布比率进行离散扩散建模", ["diffusion", "sampling-params"]],
    ["pmlr-v235-zhao24c", 2024, "Probabilistic Inference in Language Models via Twisted Sequential Monte Carlo", "Stephen Zhao, Rob Brekelmans, Alireza Makhzani, Roger Baker Grosse", "https://proceedings.mlr.press/v235/zhao24c.html", "PMLR 235:60704-60748", "Best Paper", "icml-2024-main-paper-award", "https://icml.cc/virtual/2024/awards_detail", "通过扭曲序贯蒙特卡洛进行语言模型概率推断", ["llm", "sampling-params"]],
    ["pmlr-v267-fischer-abaigar25a", 2025, "The Value of Prediction in Identifying the Worst-Off", "Unai Fischer-Abaigar, Christoph Kern, Juan Carlos Perdomo", "https://proceedings.mlr.press/v267/fischer-abaigar25a.html", "PMLR 267:17239-17261", "Outstanding Paper", "icml-2025-main-paper-award", "https://icml.cc/virtual/2025/awards_detail", "预测在识别最不利群体时的价值与限制", ["bias-fairness", "model-evaluation"]],
    ["pmlr-v267-givens25a", 2025, "Score Matching with Missing Data", "Josh Givens, Song Liu, Henry Reeve", "https://proceedings.mlr.press/v267/givens25a.html", "PMLR 267:19523-19561", "Outstanding Paper", "icml-2025-main-paper-award", "https://icml.cc/virtual/2025/awards_detail", "缺失数据条件下的得分匹配", ["diffusion"]],
    ["pmlr-v267-kim25ah", 2025, "Train for the Worst, Plan for the Best: Understanding Token Ordering in Masked Diffusions", "Jaeyeon Kim, Kulin Shah, Vasilis Kontonis, Sham M. Kakade, Sitan Chen", "https://proceedings.mlr.press/v267/kim25ah.html", "PMLR 267:30749-30768", "Outstanding Paper", "icml-2025-main-paper-award", "https://icml.cc/virtual/2025/awards_detail", "掩码扩散模型中的 token 顺序", ["diffusion", "llm"]],
    ["pmlr-v267-nagarajan25a", 2025, "Roll the dice & look before you leap: Going beyond the creative limits of next-token prediction", "Vaishnavh Nagarajan, Chen Henry Wu, Charles Ding, Aditi Raghunathan", "https://proceedings.mlr.press/v267/nagarajan25a.html", "PMLR 267:45395-45436", "Outstanding Paper", "icml-2025-main-paper-award", "https://icml.cc/virtual/2025/awards_detail", "超越下一 token 预测的生成与规划方法", ["llm", "reasoning-models"]],
    ["pmlr-v267-snell25a", 2025, "Conformal Prediction as Bayesian Quadrature", "Jake C. Snell, Thomas L. Griffiths", "https://proceedings.mlr.press/v267/snell25a.html", "PMLR 267:56068-56084", "Outstanding Paper", "icml-2025-main-paper-award", "https://icml.cc/virtual/2025/awards_detail", "把保形预测联系到贝叶斯求积", ["uncertainty-calibration"]],
    ["pmlr-v267-wu25i", 2025, "CollabLLM: From Passive Responders to Active Collaborators", "Shirley Wu, Michel Galley, Baolin Peng, Hao Cheng, Gavin Li, Yao Dou, Weixin Cai, James Zou, Jure Leskovec, Jianfeng Gao", "https://proceedings.mlr.press/v267/wu25i.html", "PMLR 267:67260-67283", "Outstanding Paper", "icml-2025-main-paper-award", "https://icml.cc/virtual/2025/awards_detail", "面向主动协作的大语言模型训练", ["llm", "fine-tuning", "reinforcement-learning"]]
  ];

  const entries = raw.map(([id, year, title, authors, url, citation, award, mechanismId, officialResultUrl, topic, linkedNodes]) => ({
    id,
    sourceClass: "academic",
    sourceSubcategory: "pmlr",
    title,
    publisher: authors.replace(/, /g, "、"),
    collection: `PMLR · ICML ${year} · ${award}`,
    contentKind: "研究论文（待补证目录）",
    authorityTier: "R",
    reviewStatus: "重要性审核待补：缺乏 AI 重大贡献外部说明；上线不代表通过",
    primarySource: true,
    discoveryOnly: true,
    url,
    publishedAt: String(year),
    accessedAt: "2026-09-24",
    summary: `该论文研究${topic}。已核实其获得 ICML ${year} ${award}，但当前缺乏外部专业说明来证明其对 AI 发展构成重大贡献，因此只作为公开待补证入口。`,
    selectionReason: `因精确匹配 ${mechanismId} 而公开登记。正式奖项和 PMLR 论文身份已经核实；官方结果页没有提供足以满足本站门槛的逐篇委员会贡献评语，作者摘要不能替代外部说明。`,
    evidenceUse: "可用于核对论文身份、作者、正式奖项和原文内容；当前不能作为本站已确认的 AI 重大贡献证据。",
    limitations: [
      "上线表示公开记录审核缺口，不表示六步重要性审核通过，也不表示本站认可论文全部结论。",
      "正式奖项证明该评价机制下的认可；补齐外部重大贡献说明前，不能据此宣称论文已重大改变 AI。"
    ],
    tags: ["待补证", `ICML ${year}`, award, "缺乏 AI 重大贡献外部说明"],
    linkedNodes,
    linkedSoftware: [],
    citation,
    reviewEvidence: {
      url: officialResultUrl,
      sections: `${award} 正式名单、PMLR 终版记录及重要性证据缺口`,
      checkedAt: "2026-09-24"
    },
    importanceReview: {
      status: "needs-evidence",
      mechanismId,
      awardYear: year,
      officialResultUrl,
      evidenceGap: "External professional explanation explicitly supporting a major AI contribution."
    }
  }));

  const allRecords = library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
  const existingIds = new Set(allRecords.map(item => item.id));
  const existingUrls = new Set(allRecords.map(item => item.url));
  const existingTitles = new Set(allRecords.map(item => item.title.normalize("NFKC").replace(/[‘’]/g, "'").toLocaleLowerCase()));
  entries.forEach(entry => {
    const normalizedTitle = entry.title.normalize("NFKC").replace(/[‘’]/g, "'").toLocaleLowerCase();
    if (existingIds.has(entry.id)) throw new Error(`PMLR 资料 id 重复：${entry.id}`);
    if (existingUrls.has(entry.url)) throw new Error(`PMLR 论文网址重复：${entry.url}`);
    if (existingTitles.has(normalizedTitle)) throw new Error(`PMLR 论文重复：${entry.title}`);
  });
  library.items.push(...entries);
})();
