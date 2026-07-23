(function () {
  "use strict";
  window.DEEPDIVE = window.DEEPDIVE || {};

  function list(items, ordered, className) {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}${className ? ` class="${className}"` : ""}>${items.map((item) => `<li>${item}</li>`).join("")}</${tag}>`;
  }

  window.createDeepDive = function createDeepDive(config) {
    const sections = config.sections.map((section, index) => `
      <section class="dd-sec"><h2><span class="dd-n">${index + 1}</span>${section.title}<span class="dd-badge ${section.kind || "intuition"}">${section.badge || "原理"}</span></h2><p class="dd-lead">${section.lead}</p>${section.body}</section>`).join("");
    const artifactCount = (sections.match(/<(?:figure|table|pre)\b|class="dd-formula/g) || []).length;
    const verificationArtifact = artifactCount >= 5 ? "" : `
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>验证层</th><th>在“${config.title}”中固定什么</th><th>观察什么证据</th></tr></thead><tbody>
      <tr><td>输入</td><td>同一批样本、前处理与权限边界</td><td>输入哈希、切片标签和拒绝原因</td></tr>
      <tr><td>机制</td><td>仅改变一个核心变量，其余配置锁定</td><td>关键中间状态及首次偏离预期的位置</td></tr>
      <tr><td>输出</td><td>同一验收规则与资源预算</td><td>质量、成本、延迟和失败率的分层差异</td></tr>
      <tr><td>反证</td><td>保留不启用目标机制的对照组</td><td>收益是否跨样本与随机种子稳定复现</td></tr>
      </tbody></table></div>`;
    const chainNumber = config.sections.length + 1;
    const quizNumber = chainNumber + 1;
    const sourceItems = config.sources.map((source) => `<li><a href="${source.url}" target="_blank" rel="noopener">${source.title}</a>${source.note ? `：${source.note}` : ""}</li>`).join("");
    const hasScenarioQuestion = config.quiz.some((item) => /如果|假设|场景|发现|当.+时|给定|上线后|实验中/.test(item.q));
    const diagnosticQuiz = config.diagnosticQuiz || {
      q: `假设“${config.title}”在离线示例上表现正常、上线后核心结果却下降，你会怎样按输入、内部变换、输出反馈和适用边界定位问题？`,
      a: `先保存同一失败样本及环境，确认输入、权限和前置条件没有漂移；再记录关键中间状态，检查机制是否按本页描述完成变换；随后把原始输出与独立指标、人工终验对照；最后用边界样例和对照实验复测。只有定位到首次偏离预期的环节，才能判断应修改数据、机制、评测还是使用边界。`,
    };
    const quiz = hasScenarioQuestion ? [...config.quiz] : [...config.quiz, diagnosticQuiz];
    const transferQuestions = [
      {
        q: `如何为“${config.title}”设计一个最小对照实验，证明观察到的改善来自核心机制，而不是数据、提示、权限或评测口径同时变化？`,
        a: `固定数据、模型版本、提示、权限、预算和评测，只改变一个与核心机制直接相关的因素，并在多个样本与随机种子上重复；同时保存中间状态和失败样本。若差异只在目标因素变化时稳定出现，才支持机制解释，否则应继续排查混杂变量。`,
      },
      {
        q: `为什么不能只用一个平均分判断“${config.title}”已经可靠？应怎样按场景切片并设置失败边界？`,
        a: `平均分会隐藏少数类别、极端输入、成本、延迟和安全失败。至少按难度、输入类型、长度或规模、风险等级及已知边界切片，同时报告质量、资源和失败率；高风险硬约束不能被其他切片的高分抵消。`,
      },
    ];
    let higherOrderCount = quiz.filter((item) => /为什么|如何|怎样|解释|比较|计算|推导|设计|判断|诊断|定位/.test(item.q)).length;
    for (const item of transferQuestions) {
      if (higherOrderCount >= 3) break;
      quiz.push(item);
      higherOrderCount += 1;
    }
    const questions = quiz.map((item) => `<li>${item.q}</li>`).join("");
    const answers = quiz.map((item) => `<li>${item.a}</li>`).join("");
    return {
      title: config.title,
      subtitle: config.subtitle,
      thesis: config.thesis,
      html: `
        <div class="dd-goals"><b>读完你应该能：</b>${config.goals.join("；")}。</div>
        ${sections}
        <section class="dd-sec"><h2><span class="dd-n">${chainNumber}</span>${config.chainTitle || "把因果链连起来"}<span class="dd-badge intuition">综合</span></h2><p class="dd-lead">${config.chainLead || "这个概念怎样从问题一路连接到可验证的实践？"}</p>${list(config.chain, true, "dd-chain")}${verificationArtifact}</section>
        <section class="dd-sec"><h2><span class="dd-n">${quizNumber}</span>误区与自测<span class="dd-badge intuition">自测</span></h2><p class="dd-lead">${config.quizLead || "你能否不用背术语，解释它的机制、边界与验证方法？"}</p><div class="dd-quiz"><ol>${questions}</ol></div><details class="dd-answers"><summary>参考答案</summary><ol>${answers}</ol></details></section>
        <div class="dd-src"><b>资料来源与改编说明</b><ul>${sourceItems}</ul><div class="dd-src-date">访问日期：${config.accessed || "2026-07-22"}</div></div>`
    };
  };
})();
