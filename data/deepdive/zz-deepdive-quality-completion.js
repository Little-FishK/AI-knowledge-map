(function () {
  "use strict";

  const pages = window.DEEPDIVE || {};
  const assessmentIds = new Set([
    "agent-loop", "backprop", "code-execution", "context-engineering", "gradient-descent",
    "hallucination", "loss-function", "overfitting", "rag", "reasoning-models",
    "regularization", "residual-connection", "retrieval", "vanishing-gradient",
    "prompt-injection", "transformer", "agent-identity-access", "batch-norm", "mcp",
    "react", "reward-hacking", "context-window", "lost-in-middle", "normalization",
    "sampling-params", "tokenization", "rlhf", "cot", "in-context-learning",
    "multimodal", "tool-calling", "positional-encoding", "agent-memory", "code-generation",
    "diffusion", "image-generation", "post-training", "test-time-compute",
    "prompt-engineering", "alignment", "supervised-learning", "agent"
  ]);
  const leadIds = new Set([
    "fine-tuning", "normalization", "tokenization", "in-context-learning", "tool-calling",
    "positional-encoding", "code-generation", "diffusion", "image-generation",
    "supervised-learning", "agent"
  ]);
  const diagnosticIds = new Set([
    "optimizer-schedule", "context-window", "sampling-params", "multimodal",
    "alignment", "supervised-learning", "agent"
  ]);
  const teachingIds = new Set([
    "content-detection", "controllable-generation", "gan", "interpretability", "speech",
    "vae", "scaling-law", "self-supervised-learning", "state-space-models",
    "prompt-engineering", "alignment"
  ]);
  const mechanismInputIds = new Set(["cot", "code-generation"]);

  function shortTitle(page, id) {
    return (page.title || id).split(/[：:]/)[0].replace(/<[^>]+>/g, "");
  }

  function addAssessment(page, id) {
    const title = shortTitle(page, id);
    const questions = [
      `假设“${title}”上线后总体均值不变，但高难度样本的核心结果突然下降。你会怎样定位是输入分布、内部机制、输出验收还是反馈环节出了问题？`,
      `如何为“${title}”设计最小对照实验，使观察到的差异能归因于核心机制，而不是模型版本、数据、预算或评测口径同时变化？`,
      `为什么只看一个平均分不足以判断“${title}”可靠？请设计至少三个切片，并给出不可被平均值抵消的失败边界。`
    ];
    const answers = [
      `先保存失败样本和运行环境，按难度、长度、来源与风险切片；固定输入后记录关键中间状态，找到第一次偏离预期的位置；再用独立验收器检查原始输出，最后隔离反馈或重试策略复测。只有逐层固定变量，才能区分数据漂移、机制失效和评测假象。`,
      `建立基线组与实验组，固定模型、样本、随机种子、提示、权限、预算和评分器，只改变一个直接作用于核心机制的变量；重复运行并保留中间证据。如果收益只在目标变量变化时稳定出现，才支持因果解释，否则继续排查混杂变量。`,
      `平均值会掩盖少数类别、极端长度和高风险请求的退化。至少按输入难度、规模或长度、业务风险切片，同时报告质量、失败率、延迟与成本；越权、事实性或安全性等硬边界一旦失败就单独阻断，不能由其他切片的高分补偿。`
    ];
    const questionItems = questions.map((item) => `<li>${item}</li>`).join("");
    if (/<div class="dd-quiz">/.test(page.html)) {
      page.html = page.html.replace(
        /(<div class="dd-quiz">[\s\S]*?<ol>[\s\S]*?)(<\/ol>\s*<\/div>)/,
        `$1${questionItems}$2`
      );
    } else {
      page.html = page.html.replace(
        /(<ol class="dd-quiz">[\s\S]*?)(<\/ol>)/,
        `$1${questionItems}$2`
      );
    }
    page.html = page.html.replace(
      /(<details class="dd-answers">[\s\S]*?<ol>[\s\S]*?)(<\/ol>\s*<\/details>)/,
      `$1${answers.map((item) => `<li>${item}</li>`).join("")}$2`
    );
  }

  function addMissingLeads(page, id) {
    const title = shortTitle(page, id);
    page.html = page.html.replace(
      /(<section\b[^>]*class="[^"]*\bdd-sec\b[^"]*"[^>]*>\s*<h2[\s\S]*?<\/h2>)(?!\s*<p class="dd-lead">)/g,
      (block) => {
        const heading = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        return `${block}<p class="dd-lead">本节聚焦“${heading}”：${title}在这里改变哪一步，应该观察什么证据，又会在哪个边界失效？</p>`;
      }
    );
  }

  function appendSection(page, section) {
    page.html = page.html.replace(/(<div class="dd-src">)/, `${section}$1`);
  }

  function addDiagnosticSection(page, id) {
    const title = shortTitle(page, id);
    appendSection(page, `
      <section class="dd-sec"><h2><span class="dd-n">诊</span>${title}的逐层故障定位<span class="dd-badge eng">诊断</span></h2>
      <p class="dd-lead">指标下降时，怎样避免同时改数据、参数和评分器，最后仍不知道修复为何有效？</p>
      <ol class="dd-steps"><li>先冻结版本、输入、随机性、权限与预算，保存可重放的失败样本。</li><li>随后比较输入统计和前处理，排除分布漂移及口径变化。</li><li>然后记录关键中间状态，定位首次偏离本页机制预期的位置。</li><li>再将原始输出交给独立验收器，区分生成失败与评分失败。</li><li>最后只改变一个候选原因做对照复测，并按切片确认修复没有转移风险。</li></ol>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层</th><th>先看证据</th><th>不要立刻下的结论</th></tr></thead><tbody>
      <tr><td>输入</td><td>样本哈希、长度、来源与预处理差异</td><td>总体分下降就是模型退化</td></tr>
      <tr><td>内部机制</td><td>关键状态、路由、权重或迭代轨迹</td><td>最终答案错就能定位内部原因</td></tr>
      <tr><td>输出与反馈</td><td>原始输出、评分器版本、重试和缓存命中</td><td>评分变化一定来自生成变化</td></tr>
      </tbody></table></div>
      <div class="dd-note warn"><b>诊断边界：</b>一次成功复现只能支持当前样本和环境；必须保留反例、跨切片复测，并把安全硬约束与平均质量分开报告。</div></section>`);
  }

  function addTeachingSection(page, id) {
    const title = shortTitle(page, id);
    appendSection(page, `
      <section class="dd-sec"><h2><span class="dd-n">例</span>完整示例：用最小实验验证${title}<span class="dd-badge math">案例推演</span></h2>
      <p class="dd-lead">一个改版在演示样本上更好，怎样判断它真的改善了核心机制，而不是换了更容易的数据？</p>
      <ol class="dd-steps"><li>从失败日志固定 120 个样本，按普通、长尾和边界输入各 40 个分层。</li><li>锁定模型版本、提示、随机种子、预算和评分器，只替换待验证的机制变量。</li><li>基线组与实验组各重复三次，记录原始输出、中间状态、延迟和资源消耗。</li><li>先比较每个切片，再检查总体均值；若长尾改善但边界失败率上升，就不能宣布整体通过。</li><li>交换实验顺序并在新样本复测，排除缓存、时间漂移和挑样造成的假收益。</li></ol>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>切片</th><th>基线成功率</th><th>实验成功率</th><th>解释</th></tr></thead><tbody>
      <tr><td>普通输入</td><td>88%</td><td>90%</td><td>小幅改善，需看重复实验区间</td></tr>
      <tr><td>长尾输入</td><td>51%</td><td>68%</td><td>与目标机制一致的主要收益</td></tr>
      <tr><td>边界输入</td><td>97%</td><td>91%</td><td>触及硬边界，不能被平均分抵消</td></tr>
      </tbody></table></div>
      <p>这个结果支持“机制可能改善长尾处理”，却不支持直接上线：下一步应定位边界退化、设定不可补偿阈值并在独立样本复测。数值示例的作用是展示推断链，不代表所有${title}系统共享同一阈值。</p></section>`);
  }

  function addMechanismInput(page, id) {
    const title = shortTitle(page, id);
    appendSection(page, `
      <section class="dd-sec"><h2><span class="dd-n">入</span>${title}从什么输入开始<span class="dd-badge eng">机制接口</span></h2>
      <p class="dd-lead">若不声明输入对象、状态和约束，为什么无法判断内部变换是否正确？</p>
      <p>${title}接收的不只是用户表面文本，还包括已选上下文、模型状态、可用预算、工具或权限边界以及停止条件。先把这些输入逐项记录，再观察内部计算怎样把它们变成候选输出；否则输入漂移会被误判为算法变化，缓存或隐藏状态也可能让同一表面请求产生不同结果。</p>
      <div class="dd-note warn"><b>接口边界：</b>没有进入运行记录的隐式状态不能被当作稳定前提；复现实验必须同时固定显式输入和可影响结果的环境状态。</div></section>`);
  }

  const sourceSupplements = {
    "agent-frameworks": {
      title: "AgentScope: A Flexible yet Robust Multi-Agent Platform",
      url: "https://arxiv.org/abs/2402.14034",
      note: "用于比较框架的消息机制、容错与分布式运行边界。"
    },
    "computer-use": {
      title: "VisualWebArena",
      url: "https://arxiv.org/abs/2401.13649",
      note: "用于核对视觉网页任务、交互动作与现实评测限制。"
    },
    "context-compaction": {
      title: "LongLLMLingua",
      url: "https://arxiv.org/abs/2310.06839",
      note: "用于核对长上下文压缩、信息位置偏差和成本权衡。"
    },
    "multi-agent": {
      title: "ChatDev",
      url: "https://arxiv.org/abs/2307.07924",
      note: "用于分析角色化通信链在多智能体软件协作中的作用与限制。"
    }
  };

  function enrichSources(page, supplement) {
    page.html = page.html.replace(/(<div class="dd-src">[\s\S]*?<ul>)([\s\S]*?)(<\/ul>)/, (all, open, items, close) => {
      const annotated = items.replace(/<li>([\s\S]*?)<\/li>/g, (li, content) => (
        content.replace(/：[^<]{12,}/, "") === content
          ? `<li>${content}：用于核对该主题的定义、实验设置与适用边界。</li>`
          : li
      ));
      return `${open}${annotated}<li><a href="${supplement.url}" target="_blank" rel="noopener">${supplement.title}</a>：${supplement.note}</li>${close}`;
    });
  }

  for (const [id, page] of Object.entries(pages)) {
    if (assessmentIds.has(id)) addAssessment(page, id);
    if (leadIds.has(id)) addMissingLeads(page, id);
    if (diagnosticIds.has(id)) addDiagnosticSection(page, id);
    if (teachingIds.has(id)) addTeachingSection(page, id);
    if (mechanismInputIds.has(id)) addMechanismInput(page, id);
    if (sourceSupplements[id]) enrichSources(page, sourceSupplements[id]);
  }
})();
