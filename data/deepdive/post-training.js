/* 理解原理页 —— 后训练 Post-training */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["post-training"] = {
  title: "后训练 Post-training",
  subtitle: "预训练给能力，后训练决定这些能力怎样被调用和呈现",
  aliases: "Post-training · 后训练 · 从基座到助手",
  meta: "建议 25–35 分钟 · 中级 · 需要：预训练、微调、RLHF",
  thesis: "后训练是在基座模型之后，用指令示范、偏好比较和可验证反馈继续优化模型。它不是单一算法，而是一条把<b>会续写的基座</b>塑造成<b>会遵循意图、分配推理预算并控制风险的助手</b>的训练流水线。",
  html: `
<div class="dd-goals"><div class="dd-goals-h">读完这一页，你应该能自己回答：</div><ul>
  <li>后训练和预训练、微调分别是什么关系？</li><li>SFT、偏好优化和可验证奖励各解决什么？</li>
  <li>为什么后训练能改变行为，却不适合当事实数据库？</li><li>为什么推理模型也离不开后训练？</li><li>怎样评估能力增益与回归？</li>
</ul></div>
<div class="dd-note key"><b>运行例子</b>　同一个基座模型既可能续写网页，也可能回答问题。后训练用“用户指令 → 理想回答”和偏好反馈，让它学会在对话中选择后者，并在危险请求上拒绝。</div>

<section class="dd-sec"><h2><span class="dd-n">1</span>它在训练链条里的位置<span class="dd-badge intuition">直觉</span></h2>
<p class="dd-lead">预训练结束后，模型已经博学，为什么还不能直接当助手？</p>
<p>预训练优化文本似然，学到广泛模式；后训练改用更接近产品目标的数据和反馈，塑造指令遵循、风格、工具使用、安全边界与推理策略。<b>后训练是阶段总称，微调是其中使用的参数更新手段。</b></p></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>第一层：监督微调 SFT<span class="dd-badge eng">工程</span></h2>
<p class="dd-lead">怎样先教会模型“收到指令就这样回答”？</p>
<p>收集高质量的“指令—理想回答”示范，用交叉熵继续训练。SFT 建立基本行为分布：回答而非随意续写、按格式输出、在合适位置拒绝。它高度依赖示范覆盖和质量。</p>
<div class="dd-note warn"><b>SFT 学的是示范分布。</b>　示范没覆盖的新场景仍可能失败；把大量最新事实塞进 SFT 也难以更新和溯源，变化知识通常更适合 RAG。</div></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>第二层：偏好优化<span class="dd-badge math">数学</span></h2>
<p class="dd-lead">当“最好回答”写不成唯一标准答案时怎么办？</p>
<p>让标注者比较同一提示的多个回答，再用 RLHF 或 DPO 提高被偏好回答的概率。比较信号比逐字标准答案灵活，但它只是人类目标的代理，可能偏爱冗长、自信或迎合。</p>
<div class="dd-formula">优化目标 ≈ 提高偏好回答概率 − 偏离参考模型的约束</div>
<p class="dd-formula-note">KL 或等价约束防止模型为了追逐偏好分数而彻底偏离 SFT 行为。</p></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>第三层：可验证反馈与推理<span class="dd-badge eng">工程</span></h2>
<p class="dd-lead">数学、代码等有客观答案的任务，能否用更强反馈？</p>
<p>可以用单元测试、答案检查器、证明器或过程验证器给反馈。模型由此学习拆解、搜索、检查与修正，形成推理模型的重要训练来源。但弱验证器会被奖励黑客利用。</p></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>它改变什么、不改变什么<span class="dd-badge intuition">边界</span></h2>
<ul class="dd-steps"><li><b>擅长改变</b>：行为方式、格式、拒答边界、工具选择、推理策略。</li><li><b>可能重分配</b>：已有能力何时被调用。</li><li><b>不保证</b>：注入精确可更新事实、消除幻觉、在分布外稳定泛化。</li><li><b>可能损伤</b>：过窄数据会造成能力回归或过度拒答。</li></ul></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>评测与数据闭环<span class="dd-badge eng">工程</span></h2>
<p class="dd-lead">训练损失下降，是否说明助手真的更好？</p>
<p>必须在独立保留集上同时测帮助性、事实性、安全、推理、格式、延迟与成本，并按场景切片。新失败样例可回流成训练数据，但测试集不能直接混入训练，否则形成污染。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>把因果链连起来<span class="dd-badge intuition">综合</span></h2>
<ol class="dd-chain"><li>预训练提供广泛能力，但目标不是用户意图。</li><li>SFT 用示范建立助手基本行为。</li><li>偏好优化处理没有唯一答案的质量取舍。</li><li>可验证反馈训练搜索、检查与修正。</li><li>代理目标可能被钻空子，所以要约束并独立评测。</li><li>后训练塑造行为，不替代外部事实系统。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>常见误解与自测<span class="dd-badge intuition">自测</span></h2>
<div class="dd-table-wrap"><table class="dd-table"><tbody><tr><td>后训练就是 RLHF</td><td>RLHF 只是偏好阶段之一，还包括 SFT、DPO、拒绝采样和可验证训练</td></tr><tr><td>后训练让模型学会所有新事实</td><td>更适合塑造行为；可更新事实通常用检索</td></tr><tr><td>奖励越高越好</td><td>弱奖励会诱发奖励黑客，必须看独立评测</td></tr></tbody></table></div>
<ol class="dd-quiz"><li>为什么预训练模型不能直接等同于助手？</li><li>SFT 与偏好优化分别解决什么？</li><li>为什么验证器既有用又危险？</li><li>后训练为什么不能替代 RAG？</li></ol>
<details class="dd-answers"><summary>参考答案</summary><ol><li>预训练优化似然而非用户意图。</li><li>SFT 教基本示范行为；偏好优化处理多个可行回答的排序。</li><li>它提供客观反馈，但代理不准时会被模型钻空子。</li><li>权重中的事实难更新、难溯源，检索更合适。</li></ol></details></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noopener">InstructGPT</a>：SFT、偏好数据与 RLHF 流程。</li><li><a href="https://arxiv.org/abs/2305.18290" target="_blank" rel="noopener">Direct Preference Optimization</a>：直接偏好目标。</li><li><a href="https://arxiv.org/abs/2305.20050" target="_blank" rel="noopener">Let's Verify Step by Step</a>：过程监督与验证器。</li></ul><div class="dd-src-date">访问日期：2026-07-21</div></div>
`
};
