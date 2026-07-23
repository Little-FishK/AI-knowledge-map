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
<p>可以用单元测试、答案检查器、证明器或过程验证器给反馈。结果奖励稀疏但定义清楚，过程反馈更早指出哪一步偏离，却需要昂贵标注且可能偏好特定解法。模型由此学习拆解、搜索、检查与修正，形成推理模型的重要训练来源。</p><p>验证器不是事实本身：测试覆盖、证明器公理和规则代码决定可见目标。弱验证器会被奖励黑客利用，所以要保留隐藏测试、对抗样例和独立终验，并监控训练奖励与真实任务指标是否背离。</p></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>它改变什么、不改变什么<span class="dd-badge intuition">边界</span></h2>
<ul class="dd-steps"><li><b>擅长改变</b>：行为方式、格式、拒答边界、工具选择、推理策略。</li><li><b>可能重分配</b>：已有能力何时被调用。</li><li><b>不保证</b>：注入精确可更新事实、消除幻觉、在分布外稳定泛化。</li><li><b>可能损伤</b>：过窄数据会造成能力回归或过度拒答。</li></ul><p>能力“出现”与“被稳定调用”要分开测：基座模型可能在少量采样中解出题，却不会默认采用该策略；后训练可提高触发概率，但也可能让模型过早套用固定模板。评测应同时看 pass@1、更多采样下的能力上限和跨提示鲁棒性，判断究竟新增了能力、提高了可访问性，还是只改变表面风格。</p><p>事实更新还涉及删除与时间：权重很难证明某条旧政策已彻底移除，也无法自然给出处。需要可撤销、可审计知识时，检索或工具查询通常比继续训练更合适。</p></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>评测与数据闭环<span class="dd-badge eng">工程</span></h2>
<p class="dd-lead">训练损失下降，是否说明助手真的更好？</p>
<p>必须在独立保留集上同时测帮助性、事实性、安全、推理、格式、延迟与成本，并按语言、领域、风险和长度切片。新失败样例可回流成训练数据，但测试集不能直接混入训练，否则形成污染；应保留永不训练的终验集，并记录每批数据来源与去重关系。</p><p>采用阶段闸门：SFT 后先查基础能力，偏好阶段后查帮助/迎合与拒答，可验证训练后查目标任务和验证器外泛化。若总分升高但某类用户或任务回归，不能用平均值掩盖。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>把因果链连起来<span class="dd-badge intuition">综合</span></h2><p class="dd-lead">数据、目标和约束怎样逐层改变同一个基座分布？</p>
<ol class="dd-chain"><li>预训练提供广泛能力，但目标不是用户意图。</li><li>SFT 用示范建立助手基本行为。</li><li>偏好优化处理没有唯一答案的质量取舍。</li><li>可验证反馈训练搜索、检查与修正。</li><li>代理目标可能被钻空子，所以要约束并独立评测。</li><li>后训练塑造行为，不替代外部事实系统。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>同一个退款提示怎样穿过三阶段<span class="dd-badge math">运行示例</span></h2><p class="dd-lead">基座模型会续写、SFT 助手会回答，偏好与可验证反馈又分别改变什么？</p><figure class="dd-fig"><svg viewBox="0 0 680 235" role="img" aria-label="同一基座模型经过 SFT、偏好优化和可验证反馈形成助手行为的后训练流程"><defs><marker id="pt1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs><rect x="18" y="48" width="120" height="95" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="78" y="73" text-anchor="middle" class="svg-t">基座模型</text><text x="78" y="96" text-anchor="middle" class="svg-t" font-size="10">续写网页/对话皆可能</text><text x="78" y="116" text-anchor="middle" class="svg-t" font-size="10">用户意图不是目标</text><path d="M138,95 L182,95" stroke="#6b7484" marker-end="url(#pt1)"/><rect x="184" y="37" width="132" height="116" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="250" y="62" text-anchor="middle" class="svg-t">SFT 示范</text><text x="250" y="85" text-anchor="middle" class="svg-t" font-size="10">指令→直接回答</text><text x="250" y="104" text-anchor="middle" class="svg-t" font-size="10">引用字段/schema</text><text x="250" y="123" text-anchor="middle" class="svg-t" font-size="10">危险请求→合适拒绝</text><text x="250" y="142" text-anchor="middle" class="svg-t" font-size="10">建立基本助手分布</text><path d="M316,95 L360,95" stroke="#6b7484" marker-end="url(#pt1)"/><rect x="362" y="37" width="132" height="116" rx="8" fill="#21252d" stroke="#c77b72"/><text x="428" y="62" text-anchor="middle" class="svg-t">偏好优化</text><text x="428" y="85" text-anchor="middle" class="svg-t" font-size="10">同提示回答 A/B</text><text x="428" y="104" text-anchor="middle" class="svg-t" font-size="10">更有帮助且不臆断</text><text x="428" y="123" text-anchor="middle" class="svg-t" font-size="10">KL/参考约束</text><text x="428" y="142" text-anchor="middle" class="svg-t" font-size="10">处理质量取舍</text><path d="M494,95 L538,95" stroke="#6b7484" marker-end="url(#pt1)"/><rect x="540" y="37" width="122" height="116" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="601" y="62" text-anchor="middle" class="svg-t">可验证反馈</text><text x="601" y="85" text-anchor="middle" class="svg-t" font-size="10">日期/政策规则检查</text><text x="601" y="104" text-anchor="middle" class="svg-t" font-size="10">代码/数学测试</text><text x="601" y="123" text-anchor="middle" class="svg-t" font-size="10">搜索、检查、修正</text><text x="601" y="142" text-anchor="middle" class="svg-t" font-size="10">仍需独立终验</text><path d="M601,154 C594,216 250,216 250,155" fill="none" stroke="#6b7484" marker-end="url(#pt1)"/><text x="425" y="210" text-anchor="middle" class="svg-t" font-size="10">评测发现回归或奖励漏洞 → 修数据/验证器；测试集不直接回流训练</text></svg><figcaption>图 1　三阶段使用不同监督信号：SFT 模仿示范，偏好优化排序可行回答，可验证反馈奖励能被外部检查的结果或过程。</figcaption></figure><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>候选回答</th><th>SFT 似然</th><th>偏好概率</th><th>规则验证</th><th>最终解释</th></tr></thead><tbody><tr><td>A：一律超过 30 天不可退</td><td>0.45</td><td>0.20</td><td>失败：忽略质量例外</td><td>流畅但事实条件不完整</td></tr><tr><td>B：质量问题可能适用例外，并核对订单</td><td>0.35</td><td>0.70</td><td>通过</td><td>保留</td></tr><tr><td>C：保证全额退款</td><td>0.20</td><td>0.10</td><td>失败：无订单证据</td><td>过度承诺</td></tr></tbody></table></div><p>偏好数据把 B 相对 A 的胜率从原始候选倾向中抬高，但“偏好 0.70”不是事实正确率；外部规则验证进一步检查日期、质量例外和订单字段。若验证器只检查是否出现“质量问题”，模型可能学会堆关键词而不核对订单，这就是奖励投机。</p><div class="dd-note key"><b>阶段分工：</b>SFT 先让有效行为进入模型分布；偏好优化在候选间移动概率质量；可验证反馈把搜索预算导向可检查目标。任何阶段都不能超过数据、奖励和评测覆盖。</div><div class="dd-note warn"><b>失败边界：</b>后训练会改变已有能力的可访问方式，也可能产生过度拒绝、迎合、模式化措辞和领域回归。上线必须同时保留基座能力、目标行为和安全切片，不能只看一个总奖励。</div></section>

<section class="dd-sec"><h2><span class="dd-n">9</span>概念依赖与评测路线<span class="dd-badge eng">路线</span></h2><p class="dd-lead">怎样避免把后训练、微调、对齐、RLHF 和事实更新混成同一个词？</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>概念依赖与延伸</th></tr></thead><tbody><tr><td>先修</td><td>预训练、监督微调、交叉熵、采样</td></tr><tr><td><b>本页核心</b></td><td>SFT、偏好数据、RLHF/DPO、可验证奖励、KL 约束与回归</td></tr><tr><td>紧邻</td><td>对齐、推理模型、测试时计算、奖励投机</td></tr><tr><td>工程延伸</td><td>模型评测、训练数据治理、RAG、人在回路与安全护栏</td></tr></tbody></table></div><p>训练评测至少分三层：离线目标是否优化、目标行为是否改善、未直接优化的能力是否回归。还要与提示工程、RAG 或更强基座比较同等成本收益；如果只是需要最新政策，把事实写进权重通常比检索更难更新、删除与溯源。</p></section>

<section class="dd-sec"><h2><span class="dd-n">10</span>常见误解与自测<span class="dd-badge intuition">自测</span></h2>
<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>常见误解</th><th>更准确的理解</th></tr></thead><tbody><tr><td>后训练就是 RLHF</td><td>RLHF 只是偏好阶段之一，还包括 SFT、DPO、拒绝采样和可验证训练</td></tr><tr><td>后训练让模型学会所有新事实</td><td>更适合塑造行为；可更新事实通常用检索</td></tr><tr><td>奖励越高越好</td><td>弱奖励会诱发奖励黑客，必须看独立评测</td></tr></tbody></table></div>
<ol class="dd-quiz"><li>为什么预训练模型不能直接等同于助手？</li><li>SFT 与偏好优化分别解决什么？</li><li>为什么验证器既有用又危险？</li><li>后训练为什么不能替代 RAG？</li></ol>
<details class="dd-answers"><summary>参考答案</summary><ol><li>预训练优化似然而非用户意图。</li><li>SFT 教基本示范行为；偏好优化处理多个可行回答的排序。</li><li>它提供客观反馈，但代理不准时会被模型钻空子。</li><li>权重中的事实难更新、难溯源，检索更合适。</li></ol></details></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noopener">InstructGPT</a>：SFT、偏好数据与 RLHF 流程。</li><li><a href="https://arxiv.org/abs/2305.18290" target="_blank" rel="noopener">Direct Preference Optimization</a>：直接偏好目标。</li><li><a href="https://arxiv.org/abs/2305.20050" target="_blank" rel="noopener">Let's Verify Step by Step</a>：过程监督与验证器。</li></ul><div class="dd-src-date">访问日期：2026-07-21</div></div>
`
};
