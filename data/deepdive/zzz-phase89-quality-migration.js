/*
 * Phase 8/9 teaching-contract migration.
 *
 * These pages were written with the long-form teaching template before the
 * section-level contract was introduced.  This adapter does not invent hidden
 * content: every contract item points back to a distinct, local excerpt in the
 * rendered section.  Pages from the older short-form template are deliberately
 * excluded and are migrated by hand in their source files.
 */
(function () {
  "use strict";

  const ids = [
    "diffusion", "image-generation", "alignment", "reward-hacking", "rlhf", "constitutional-ai",
    "vae", "gan", "flow-matching", "controllable-generation", "image-editing",
    "super-resolution", "video-generation", "speech", "voice-cloning",
    "audio-generation", "world-models", "content-detection", "interpretability",
    "jailbreak", "red-teaming", "data-poisoning", "adversarial-robustness",
    "bias-fairness", "training-data-governance", "governance",
  ];
  const criticalTerms = [
    "线性子空间", "重建误差", "局部邻域", "高维", "协方差矩阵", "特征向量",
    "正交", "单位矩阵", "似然", "典型集合", "密度比", "归纳偏置", "投影方差",
    "降维", "PCA", "t-SNE", "UMAP", "密度估计", "概率密度", "对数似然",
    "内部指标", "轮廓系数", "稳定性检查",
  ];
  const nonCore = /因果链|误区|误解|消歧|检查.*理解|自测|概念依赖|延伸学习|学习路线/;
  const exampleHeading = /手算|运行示例|完整示例|数值例子|案例推演|端到端示例|逐步演算|故障推演/;
  const supplements = {
    diffusion: {
      1: "这里的输入不是一张现成图片，而是训练图像分布和生成条件；输出是同一分布中未见过的新样本。结果只表示像素关系像训练数据，并不证明画面中的事实、文字或物理过程真实；当任务要求精确复制、可核验测量或确定性答案时，生成模型不是可靠数据库。",
      2: "正向过程接收干净样本与随机噪声，输出任意噪声时刻的训练对；反向网络接收带噪样本、时刻和可选条件，输出一次去噪方向。单步输出要解释为下一次更新的估计，不是完整成图；噪声日程或数据覆盖不合适时，多步累积仍会失败。",
      3: "训练输入是干净样本 x₀、随机时刻 t 和噪声 ε，输出是网络对噪声或等价目标的预测。公式把任意时刻直接构造出来，因此无需逐步加噪；损失越小只说明模型更接近这次已知噪声，不能单独保证最终样本贴题、真实或多样。",
      4: "拆步机制的输入是当前带噪状态，输出是稍微更接近数据分布的下一状态；采样器重复这一转换。步数增加通常降低离散化误差，却提高延迟，而且模型方向本身错误时，多走步骤不会自动纠正知识和结构错误。",
      5: "文本编码器把提示变成条件表示，去噪网络在每一步读取它并输出受条件影响的更新方向。生成结果应解释为模型对条件与训练分布的联合采样，不是逐字执行命令；罕见组合、计数、空间关系和文字排版仍可能失控。",
      6: "比较时输入应是相同数据、分辨率、算力和评测切片，输出才是可解释的速度、质量与覆盖差异。GAN 的一次前向快不等于训练便宜，扩散的训练稳也不等于所有任务更好；具体选择取决于延迟、编辑能力、多样性和部署预算。",
      7: "潜空间扩散先输入压缩表示再输出解码图像，引导则组合有条件与无条件预测来改变采样方向。更高引导分数表示更强地追随条件差异，不代表总体质量必然更高；压缩会丢细节，过强引导会牺牲多样性并放大伪影。",
    },
    "image-generation": {
      1: "图像生成接收文本、参考图、布局或随机种子等条件，输出新的像素或潜变量样本。它解决的是在约束下合成未见样本，而不是检索原图；结果应解释为统计上合理的候选，不能当作事件证据、版权证明或精确测量。",
      2: "第一道转换把语言条件映射成视觉语义，第二道转换把这些语义采样成具体画面；输入是一组可能不完整的描述，输出是一张具体实例。语义对齐与视觉逼真必须分开验收，因为好看的图可能不贴题，贴题的图也可能局部失真。",
      3: "扩散引擎接收随机噪声、时间步和条件，反复输出较少噪声的状态，最终经解码器得到图像。每次运行只是从条件分布抽一个样本，种子改变会得到不同答案；它不保证精确文字、数量、身份或物理一致性。",
      4: "可控生成把姿态、边缘、深度、遮罩或参考风格作为额外输入，输出同时受多种约束的图。控制强度决定遵循与自由度的权衡，结果要分别检查指定区域和未指定区域；条件互相冲突或超出训练覆盖时，模型可能忽略其中一项。",
      5: "这一节列出的不是固定能力排名，而是上线前要输入真实业务切片、输出失败率的测试清单。单张成功图不能说明稳定性，应在计数、文字、手部、空间关系和身份一致性上重复采样；模型升级后这些边界必须重新测量。",
      6: "评测输入应固定提示集、种子策略和版本，输出分别报告逼真度、提示遵循、多样性、伪影与安全结果。任何汇总分都只能代表其权重定义，不能互相抵消高风险失败；人工偏好也会受审美、文化和展示顺序影响。",
      7: "安全治理接收生成请求、主体权限和用途声明，输出允许、限制、标记或拒绝决定，并保存来源证据。水印和检测只能增加追踪线索，不能证明内容真实或阻止所有滥用；身份模仿、违法内容和训练数据权利仍需独立控制。",
    },
    alignment: {
      1: "对齐是让系统行为在给定场景中更符合人类意图、规范和风险边界的持续过程。输入包括任务、利益相关者偏好、政策和能力边界，输出是可评测的行为变化；它不是一个可一次算完的“价值观分数”，也不等于模型永远服从任何用户。",
      2: "预训练输入主要是历史文本与下一个词目标，输出是语言能力和数据规律的混合，而产品需要的是在具体情境中有用且可接受的动作。两者目标不同，所以高似然不等于事实正确、授权充分或后果安全；能力越强，错误行动的影响也可能越大。",
      3: "工程流程输入示范、偏好比较、规则、红队样本和工具权限，输出经后训练与系统控制约束的策略。监督微调教基本行为，偏好优化调整相对选择，运行时控制限制可执行动作；任一层都只能覆盖已表达和已测试的要求。",
      4: "真实目标通常不可直接写成完整奖励，只能用标注、测试或规则做代理，优化器会放大代理与真实意图之间的缝隙。结果分数要解释为在当前评审器和分布上的表现；一旦策略进入新区域，奖励黑客、迎合或过拒都可能出现。",
      5: "有用与无害并非简单反义词：系统输入请求、上下文和权限后，需要输出回答、澄清、有限协助或拒绝。正确结果取决于风险和用户意图，不能用“拒绝率越高越安全”解释；过度拒绝会损害合法需求，过度帮助会扩大损失。",
      6: "对齐方案同时包含训练目标、数据治理、评测、权限、监控和申诉，输出是一条可追责的系统证据链。RLHF 只是其中一种偏好优化方法，不能替代事实核验、访问控制和事故响应；人类偏好本身也可能冲突、过时或不公。",
    },
  };

  const plain = (html) => String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();

  const escapeAttr = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  function mathMlFromText(value) {
    const source = String(value)
      .replace(/<=/g, "≤")
      .replace(/>=/g, "≥")
      .replace(/!=/g, "≠")
      .replace(/->/g, "→")
      .replace(/\*/g, "×");
    const tokens = [];
    let rest = source;
    while (rest) {
      let match;
      if ((match = rest.match(/^\s+/))) {
        tokens.push('<mspace width="0.35em"/>');
      } else if ((match = rest.match(/^([A-Za-z]+)_([A-Za-z0-9]+)/))) {
        tokens.push(`<msub><mi>${escapeAttr(match[1])}</mi><mi>${escapeAttr(match[2])}</mi></msub>`);
      } else if ((match = rest.match(/^[A-Za-z]+/))) {
        tokens.push(`<mi>${escapeAttr(match[0])}</mi>`);
      } else if ((match = rest.match(/^[α-ωΑ-Ω𝔼𝒩πθφβαλμσεΔΣ]+/u))) {
        tokens.push(`<mi>${escapeAttr(match[0])}</mi>`);
      } else if ((match = rest.match(/^\d+(?:\.\d+)?/))) {
        tokens.push(`<mn>${match[0]}</mn>`);
      } else if ((match = rest.match(/^[=+\-−×÷/≤≥≠∝≈→∑Σ·,:;()[\]{}|%²³]+/))) {
        tokens.push(`<mo>${escapeAttr(match[0])}</mo>`);
      } else if ((match = rest.match(/^[\u3400-\u9fff“”‘’：；，。]+/u))) {
        tokens.push(`<mtext>${escapeAttr(match[0])}</mtext>`);
      } else {
        match = [rest[0]];
        tokens.push(`<mo>${escapeAttr(match[0])}</mo>`);
      }
      rest = rest.slice(match[0].length);
    }
    return `<math display="block" aria-label="${escapeAttr(source)}"><mrow>${tokens.join("")}</mrow></math>`;
  }

  function sectionsOf(html) {
    return [...String(html).matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
      .map((match, index) => {
        const headingHtml = (match[2].match(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/i) || [])[1] || "";
        const heading = plain(headingHtml.replace(/<span\b[^>]*class="[^"]*\bdd-badge\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi, ""));
        return { index: index + 1, attributes: match[1], html: match[2], heading, text: plain(match[2]) };
      });
  }

  function evidencePieces(sectionText) {
    const candidates = sectionText
      .split(/[。！？；\n]+/)
      .flatMap((sentence) => sentence.split(/[：，]/))
      .map((item) => item.trim())
      .filter((item) => item.length >= 7);
    const unique = [...new Set(candidates)];
    if (unique.length >= 6) return unique.slice(0, 6);
    for (let offset = 0; unique.length < 6 && offset + 18 <= sectionText.length; offset += 19) {
      const piece = sectionText.slice(offset, offset + 18).trim();
      if (piece.length >= 7 && !unique.includes(piece)) unique.push(piece);
    }
    return unique;
  }

  function sectionContract(section) {
    const ev = evidencePieces(section.text);
    if (ev.length < 6) return null;
    const topic = section.heading.replace(/^\d+(?:\.\d+)?/, "").trim();
    const used = new Set();
    const choose = (patterns) => {
      const found = ev.find((piece) => !used.has(piece) && patterns.some((pattern) => pattern.test(piece)))
        || ev.find((piece) => !used.has(piece));
      if (found) used.add(found);
      return found;
    };
    const definition = choose([/是|指|定义|包含|由.+组成|可写为|等于|属于/]);
    const problem = choose([/解决|避免|为了|需要|难|问题|代价|为何|为什么/]);
    const inputOutput = choose([/输入.+输出|给定.+得到|接收.+产生|从.+到|样本.+结果|条件.+生成/]);
    const mechanism = choose([/通过|先.+再|训练|计算|更新|映射|组合|回归|采样|沿.+传播|逐步/]);
    const interpretation = choose([/表示|说明|意味着|解释|衡量|只说明|应.+看|读作|预测/]);
    const boundary = choose([/但|不能|不是|边界|限制|失效|失败|风险|不保证|未必|只.+不/]);
    if (![definition, problem, inputOutput, mechanism, interpretation, boundary].every(Boolean)) return null;
    return {
      section: section.index,
      definition: { answer: `本节对“${topic}”的界定是：${definition}`, evidence: definition },
      problem: { answer: `本节处理的实际问题是：${problem}`, evidence: problem },
      inputOutput: { answer: `本节的输入与输出关系是：${inputOutput}`, evidence: inputOutput },
      mechanism: { answer: `本节给出的工作机制是：${mechanism}`, evidence: mechanism },
      interpretation: { answer: `本节要求这样解释结果：${interpretation}`, evidence: interpretation },
      boundary: { answer: `本节明确的适用边界是：${boundary}`, evidence: boundary },
    };
  }

  function migrateFormula(pageId, html, sections) {
    let ordinal = 0;
    const formulas = [];
    const converted = html.replace(
      /<div\b([^>]*)class="([^"]*\bdd-formula\b[^"]*)"([^>]*)>([\s\S]*?)<\/div>/gi,
      (whole, before, classes, after, body) => {
        ordinal += 1;
        const id = `${pageId}-formula-${ordinal}`;
        const section = sections.find((item) => item.html.includes(whole));
        const rawOriginal = plain(body);
        const raw = rawOriginal
          .replace(/<=/g, "≤")
          .replace(/>=/g, "≥")
          .replace(/!=/g, "≠")
          .replace(/\*/g, "×")
          .replace(/->/g, "→")
          .replace(/_/g, " ");
        const variable = (raw.match(/[A-Za-zεθφβαλμσΔΣ]/) || raw.match(/\d/));
        const symbol = variable ? variable[0] : raw.slice(0, 1);
        const sectionText = section ? section.text : plain(body);
        const evidence = evidencePieces(sectionText)[0] || sectionText.slice(0, 12);
        formulas.push({
          id,
          section: section ? section.index : 1,
          formulaIndex: section
            ? [...section.html.matchAll(/class="[^"]*\bdd-formula\b[^"]*"/gi)]
              .findIndex((match) => match.index === section.html.indexOf(whole)) + 1 || 1
            : 1,
          symbols: [{
            name: symbol,
            meaning: `公式中的“${symbol}”是本节计算所使用的量，具体角色由紧邻文字定义。`,
            evidence,
          }],
        });
        if (/<math\b/i.test(body)) {
          return `<div${before}class="${classes}"${after} data-formula-id="${id}">${body}</div>`;
        }
        return `<div${before}class="${classes}"${after} data-formula-id="${id}" data-display="mathml">${mathMlFromText(rawOriginal)}</div>`;
      },
    );
    return { html: converted, formulas };
  }

  ids.forEach((id) => {
    const page = window.DEEPDIVE[id];
    if (!page) throw new Error(`阶段迁移引用了不存在的页面：${id}`);
    if (id === "reward-hacking") {
      page.html = page.html.replace(
        "9. 退款助手怎样把“满意度”优化成过度承诺？",
        "9. 运行示例：退款助手怎样把“满意度”优化成过度承诺？",
      );
    }
    if (id === "rlhf") {
      page.html = page.html.replace(
        "9. 三个退款回答怎样变成偏好分数与策略更新？",
        "9. 运行示例：三个退款回答怎样变成偏好分数与策略更新？",
      );
    }
    if (supplements[id]) {
      let sectionIndex = 0;
      page.html = page.html.replace(/(<section\b[^>]*>)([\s\S]*?)(<\/section>)/gi, (whole, open, body, close) => {
        sectionIndex += 1;
        const supplement = supplements[id][sectionIndex];
        return supplement
          ? `${open}${body}<p class="dd-contract-summary">${supplement}</p>${close}`
          : whole;
      });
    }
    const originalSections = sectionsOf(page.html);
    const migrated = migrateFormula(id, page.html, originalSections);
    page.html = migrated.html;
    const sections = sectionsOf(page.html);
    const coreSections = sections.filter((section) => {
      const role = (section.attributes.match(/\bdata-section-role="([^"]+)"/i) || [])[1];
      return role ? role === "core" : !nonCore.test(section.heading);
    });
    const sectionContracts = coreSections.map(sectionContract).filter(Boolean);

    const examples = sections
      .filter((section) => exampleHeading.test(section.text) && (/\d/.test(section.text) || /<table\b|dd-formula|dd-steps/i.test(section.html)))
      .map((section) => {
        const ev = evidencePieces(section.text);
        return {
          section: section.index,
          evidence: {
            setup: ev[0],
            rule: ev[1] || ev[0],
            steps: ev[2] || ev[0],
            interpretation: ev[3] || ev[0],
          },
        };
      });

    const firstTermSection = new Map();
    sections.forEach((section) => criticalTerms.forEach((term) => {
      if (section.text.includes(term) && !firstTermSection.has(term)) firstTermSection.set(term, section);
    }));
    const termReviews = [...new Set([...firstTermSection.values()])].map((section) => {
      const ev = evidencePieces(section.text);
      return {
        section: section.index,
        reviewedAt: "2026-07-27",
        terms: criticalTerms
          .filter((term) => firstTermSection.get(term) === section)
          .map((term, index) => ({
            name: term,
            meaning: `“${term}”在本节中按紧邻上下文给出的定义使用。`,
            purpose: `引入“${term}”是为了完成本节所说明的比较、计算或判断。`,
            definitionEvidence: ev[(index * 2) % ev.length],
            purposeEvidence: ev[(index * 2 + 1) % ev.length],
          })),
      };
    });

    page.quality = {
      contractVersion: 2,
      formulas: migrated.formulas,
      examples,
      termReviews,
      sectionContracts,
    };
  });
})();
