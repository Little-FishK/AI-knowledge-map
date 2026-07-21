/* 理解原理页 —— 训练数据治理 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["training-data-governance"] = {
  title: "训练数据治理",
  subtitle: "从数据来源到退役：让模型所学内容可解释、可审计、可纠偏",
  aliases: "Training Data Governance · 数据谱系 · 数据生命周期",
  meta: "建议 25–35 分钟 · 中级 · 需要：预训练、数据工程、安全治理",
  thesis: "训练数据治理不是一次性清洗，而是贯穿<b>获取、授权、筛选、去重、配比、训练、评测、响应与退役</b>的控制系统。它的目标不是得到“绝对干净”的语料，而是知道数据从哪里来、为何能用、怎样影响模型，以及出现问题时能够定位和处置。",
  html: `
<div class="dd-goals"><div class="dd-goals-h">读完这一页，你应该能自己回答：</div><ul>
  <li>数据治理为什么不等同于数据清洗？</li><li>来源、许可和处理记录为何必须形成谱系？</li>
  <li>去重怎样同时影响记忆、评测污染和训练效率？</li><li>数据配比为什么是模型行为的隐性控制杆？</li><li>删除原始样本为何不等于删除模型中的影响？</li>
</ul></div>
<div class="dd-note key"><b>运行例子</b>　一个团队发现模型会复述某段个人信息。仅删除对象存储里的文件并不能证明已部署权重不再受它影响；团队还需要靠谱系定位训练批次、判断是否重训或使用遗忘技术，并更新过滤器与回归测试。</div>

<section class="dd-sec"><h2><span class="dd-n">1</span>治理对象是一条生命周期<span class="dd-badge intuition">直觉</span></h2>
<p class="dd-lead">为什么“训练前清洗一次”远远不够？</p><p>数据会被抓取、转换、复制、混合并生成多个训练快照。来源规则会变化，隐私或版权请求会在训练后出现，模型失败又会产生新的修复数据。治理因此要保存每一步的输入、版本、规则、责任人和产物，让一次训练能够被复现和追溯。</p></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>谱系：回答从哪里来<span class="dd-badge eng">工程</span></h2>
<p>最小谱系至少记录来源 URI、获取时间、许可或使用依据、内容哈希、处理规则、数据集版本和进入过的训练任务。哈希能识别同一内容的副本，但不能单独证明权利；许可证标签能表达规则，但不能替代对来源真实性的核验。</p>
<ul class="dd-steps"><li><b>原始层</b>：尽量保留不可变快照与来源元数据。</li><li><b>处理层</b>：记录过滤、去重、脱敏和分类器版本。</li><li><b>混合层</b>：记录各来源权重和采样策略。</li><li><b>训练层</b>：把模型版本反向链接到确切数据快照。</li></ul></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>质量、过滤与去重<span class="dd-badge eng">工程</span></h2>
<p class="dd-lead">删除重复项只是节省磁盘吗？</p><p>重复内容会获得更高的有效采样权重，增加逐字记忆风险，也可能让公开测试题泄漏到训练集。精确哈希只能抓完全相同的副本；近似去重要在文档、段落和语义层面寻找变体，并权衡误删少数语言或合法模板的风险。</p><div class="dd-note warn"><b>过滤器也会带偏差。</b>　“高质量”分类器常继承主流语言和写作风格偏好，因此应按来源、语言与群体检查保留率，而不是只看总删除量。</div></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>数据配比是行为控制杆<span class="dd-badge math">机制</span></h2>
<p>训练不是简单地把所有文本拼起来。若来源 <i>i</i> 的采样概率为 p<sub>i</sub>，改变 p<sub>i</sub> 就改变模型看到该分布的频率。高质量代码、数学或多语言语料的权重会改变能力结构；配比过度又可能损伤通用能力或放大特定偏差。</p><div class="dd-formula">训练分布 P(x) = Σ p<sub>i</sub> P<sub>i</sub>(x)，且 Σ p<sub>i</sub> = 1</div><p class="dd-formula-note">配比是模型设计决策，必须与能力、安全和公平性评测一起版本化。</p></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>许可、隐私与删除请求<span class="dd-badge intuition">边界</span></h2>
<p>许可决定允许怎样使用，隐私控制决定是否应收集和保留，两者不是同一问题。收到删除请求后，可以可靠删除未来训练快照中的样本；但已经训练出的参数是许多样本共同作用的结果，不能把文件删除等同于模型遗忘。必要时需评估重训、机器遗忘、输出拦截及其验证证据。</p></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>污染、投毒与合成反馈环<span class="dd-badge eng">风险</span></h2>
<ul class="dd-steps"><li><b>评测污染</b>：测试题或答案进入训练集，分数虚高。</li><li><b>数据投毒</b>：攻击者注入触发器、错误事实或后门行为。</li><li><b>合成回流</b>：模型输出未经标识地重新进入语料，错误被放大。</li><li><b>来源漂移</b>：同一站点的内容与许可随时间改变。</li></ul><p>防线包括来源信誉、异常比例监控、相似样本检测、隔离高风险来源、签名或哈希清单，以及独立保留的评测集。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>把因果链连起来<span class="dd-badge intuition">综合</span></h2>
<ol class="dd-chain"><li>数据来源决定可用内容与初始风险。</li><li>授权和谱系决定是否能解释与追溯。</li><li>过滤、去重和配比重塑实际训练分布。</li><li>训练分布影响能力、偏差、记忆与安全行为。</li><li>独立评测检查这些影响是否符合目标。</li><li>事故和请求通过谱系反馈到数据、模型和控制措施。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>常见误解与自测<span class="dd-badge intuition">自测</span></h2>
<div class="dd-table-wrap"><table class="dd-table"><tbody><tr><td>开源可见就能任意训练</td><td>公开访问不自动等于许可、隐私和用途均无约束</td></tr><tr><td>去重越彻底越好</td><td>误删会损害稀有语言、模板任务和真实频率结构</td></tr><tr><td>删文件等于模型遗忘</td><td>已训练参数中的影响仍需单独评估和处置</td></tr></tbody></table></div>
<ol class="dd-quiz"><li>数据谱系最少要记录哪些信息？</li><li>为什么近似去重需要按群体检查？</li><li>数据配比怎样改变模型行为？</li><li>评测污染与数据投毒有何区别？</li><li>为何删除请求需要模型级验证？</li></ol>
<details class="dd-answers"><summary>参考答案</summary><ol><li>来源、时间、授权、哈希、处理规则、版本和训练关联。</li><li>过滤器可能对稀有语言或格式产生不成比例的误删。</li><li>它改变各类样本的有效采样概率。</li><li>前者让评测失真，后者意在改变或破坏模型行为。</li><li>删除源文件不会自动逆转其对既有权重的贡献。</li></ol></details></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2101.00027" target="_blank" rel="noopener">The Pile</a>：大规模语言模型语料的来源与构成。</li><li><a href="https://arxiv.org/abs/2107.06499" target="_blank" rel="noopener">Deduplicating Training Data Makes Language Models Better</a>：重复数据、记忆与污染。</li><li><a href="https://arxiv.org/abs/1803.09010" target="_blank" rel="noopener">Datasheets for Datasets</a>：数据集文档与生命周期问责框架。</li></ul><div class="dd-src-date">访问日期：2026-07-21</div></div>
`
};
