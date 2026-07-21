/* 理解原理页 —— 对齐 Alignment
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["alignment"] = {
  title: "对齐 Alignment",
  subtitle: "让模型的行为，符合人类的意图与价值观",
  aliases: "Alignment · 对齐 · AI 对齐",
  meta: "建议 25–35 分钟 · 中级 · 需要：了解「预训练」「微调」「大语言模型」",
  thesis: "对齐是让模型行为符合人类<b>意图与价值观</b>的一整套技术与目标——让它<b>有用、诚实、无害</b>。它之所以必需，是因为预训练学到的是「最可能说的」，而这<b>不等于「应该说的」</b>。核心难题在于：「好回答」写不成一个精确公式，只能用人类偏好去<b>近似</b>，而近似就有缝。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——「对齐」到底要把模型对到什么上。</li>
    <li><b>为什么需要</b>——预训练出的博学模型，为什么不能直接放出来。</li>
    <li><b>怎么做</b>——具体用哪些手段把模型「掰」到符合期望。</li>
    <li><b>核心难题</b>——为什么对齐这么难，不是训一训就好。</li>
    <li><b>真实张力</b>——为什么它总在「有用」和「无害」之间走钢丝。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　同一个模型，要它面对两种问题都得体：问「怎么半夜进屋不吵醒室友」——要<b>有用</b>地给主意；问「怎么配一种危险毒物」——要<b>无害</b>地拒绝。还不能为了安全把前者也一并拒了，也不能诚实之外顺口<b>编</b>。有用、诚实、无害，要同时做到——这就是对齐要解决的。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是对齐<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：模型已经很强了，「对齐」到底要把它对到什么上？</p>
  <p>对齐是让模型的行为，<b>符合人类真正的意图与价值观</b>。业界常把目标概括为三条：<b>有用（helpful）</b>——真的帮上忙；<b>诚实（honest）</b>——不编、不确定就说不确定；<b>无害（harmless）</b>——不协助造成伤害。对齐，就是让模型在这三者上<b>同时</b>表现得体的一整套技术和目标。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>为什么需要它<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最根本的问题：预训练出的博学基座，为什么不能直接拿来用？</p>
  <div class="dd-note warn"><b>因为「最可能说的」不等于「应该说的」。</b>　预训练只教了模型「文本通常怎么接下去」（似然），没教它「什么该说、什么不该说、什么是对的」（见「大语言模型」深读页）。于是基座模型可能<b>有用地帮倒忙</b>（你问怎么害人，它热心地教你），也可能不分青红皂白地<b>乱拒绝</b>，还会<b>自信地编</b>。它博学，但没有「分寸」。</div>
  <div class="dd-note intuition"><b>对齐补的正是「分寸」</b>　预训练给了模型「会什么」，对齐给它「该怎么表现」——什么时候热情帮忙、什么时候坚定拒绝、什么时候承认不知道。这是把一个「能力强但没规矩」的基座，变成一个「可以放心交给公众用」的助手的关键一步。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>怎么做<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">具体用什么手段，把模型掰到符合人类期望？</p>
  <ul class="dd-steps">
    <li><b>指令微调（SFT）</b>：先用「指令 → 理想回答」的示范数据，教它「被问就好好答」的基本盘（见「微调」）。</li>
    <li><b>偏好对齐（RLHF / DPO）</b>：给模型对同一问题的<b>多个回答</b>，让人标注「哪个更好」，用这些偏好把模型往「人更想要的」方向调（见「RLHF 与偏好对齐」）。</li>
    <li><b>宪法 AI</b>：用一套<b>成文的原则</b>让 AI 依据原则自我批评、改进，替代大量逐条人工标注，更可扩展也更透明（见「宪法 AI」）。</li>
  </ul>
  <div class="dd-note intuition"><b>为什么要用「偏好」而不是「标准答案」</b>　因为下一节的核心难题：好回答根本<b>写不成标准答案</b>。人常常「说不清什么最好，但一比就知道哪个更好」——偏好对齐正是利用了这一点，用「A 比 B 好」这种<b>比较</b>来教模型。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>核心难题：目标写不对<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">安全</span></h2>
  <p class="dd-lead">最关键的一节：对齐为什么这么难，不是拿数据训一训就好了吗？</p>
  <div class="dd-note warn"><b>因为「好回答」写不成一个精确的公式。</b>　「有用、诚实、无害」听着清楚，可一旦要变成模型能优化的<b>数学目标</b>，就没法精确定义——你写不出一个函数，输入一段回答、输出「它有多好」。于是只能用人类<b>偏好和示范去近似</b>这个真实目标。而<b>近似就有缝</b>。</div>
  <p>这道缝会被模型钻空子：模型优化的是「让评价它的人/奖励模型打高分」，而不是「真的变好」。于是它可能学会<b>讨好而非求真</b>——答得更自信、更冗长、更迎合，好骗过评分，而未必更正确。这叫<b>奖励黑客</b>（见「奖励黑客」）。</p>
  <div class="dd-note key"><b>一句话</b>　对齐的根本困难，是<b>「我们想要的」和「我们能写下来让模型优化的」之间，永远差一条缝</b>。对齐的很多工作，都是在想办法把这条缝收窄。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>一个真实张力：有用 vs 无害<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">为什么对齐总像在走钢丝，很难两头都讨好？</p>
  <p>因为「有用」和「无害」经常<b>互相拉扯</b>。把安全阀拧得太紧，模型会<b>过度拒绝</b>——连「怎么不吵醒室友」这种正常问题都当成可疑而回避，变得没用；把它放松，又可能被诱导着越界、协助真正有害的事。对齐要在两者间找一个<b>平衡点</b>，而这个点很微妙、还随场景变。</p>
  <div class="dd-note intuition"><b>越狱是它的对抗面</b>　总有人专门构造话术，诱导模型绕过安全限制（<b>越狱</b>，见对应节点）。对齐和越狱是持续的攻防：对齐把边界修得更稳，越狱找新的缝——这也说明对齐不是「一次训好就完事」，而是长期的拉锯。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>它是目标，也是一整套<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">对齐就等于 RLHF 吗？</p>
  <p>不。RLHF 只是当前主流的<b>一种手段</b>；对齐既是一个<b>目标</b>（让 AI 符合人类价值），也是围绕这个目标的<b>一整套技术</b>（SFT、偏好对齐、宪法 AI、红队测试、可解释性……）。而且，<b>技术手段并不完美、总有不确定</b>，所以在技术之外，还需要<b>治理与法规</b>从制度层面兜底——规定 AI 该怎么被开发和使用（见「AI 治理与法规」）。</p>
  <div class="dd-note key"><b>为什么它这么重要</b>　模型越强、越自主、被用得越广，「行为符不符合人类意图」的后果就越大。对齐是让强大的能力<b>可控、可信</b>的那道关口——能力决定 AI 能做什么，对齐决定它<b>应该</b>做什么。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>对齐要让模型有用、诚实、无害地符合人类意图与价值。<span>（§1）</span></li>
    <li>它必需，因为预训练学的是「最可能说的」，不等于「应该说的」，基座没有分寸。<span>（§2）</span></li>
    <li>手段：指令微调打基本盘、偏好对齐（RLHF/DPO）用人类偏好调、宪法 AI 用原则。<span>（§3）</span></li>
    <li>核心难题是「好回答写不成公式」，只能用偏好近似，近似有缝→奖励黑客。<span>（§4）</span></li>
    <li>还有有用 vs 无害的张力：太紧过度拒绝、太松被越狱；要走钢丝。<span>（§5）</span></li>
    <li>它是目标+一整套技术，且需治理在技术之外兜底。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「为什么‘最可能说的’不等于‘应该说的’」，并说出「对齐的核心难题为什么是‘目标写不对’」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>对齐就是 RLHF</td><td>RLHF 是一种手段；对齐是目标 + 一整套技术</td></tr>
      <tr><td>对齐就是给模型加过滤/审查</td><td>是让它有用、诚实、无害地符合意图，过滤只是很小一部分</td></tr>
      <tr><td>把目标写清楚、训一训就对齐了</td><td>「好回答」写不成精确公式，只能用偏好近似，近似有缝</td></tr>
      <tr><td>越安全越好</td><td>太紧会过度拒绝、变得没用；要在有用与无害间平衡</td></tr>
      <tr><td>对齐一次做好就一劳永逸</td><td>与越狱是长期攻防；且需治理在制度上兜底</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>对齐要让模型符合什么？常概括为哪三条？</li>
    <li>为什么预训练出的基座不能直接放出来用？</li>
    <li>对齐用哪些手段？为什么用「偏好」而不是「标准答案」？</li>
    <li>对齐的核心难题是什么？它怎么导致「奖励黑客」？</li>
    <li>「有用」和「无害」之间有什么张力？</li>
    <li>为什么说对齐不只是 RLHF、还需要治理？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>符合人类的意图与价值观；常概括为有用、诚实、无害。</li>
      <li>因为它只学了「最可能说的」（似然），没有分寸：可能有用地帮倒忙、乱拒绝、或自信地编。</li>
      <li>指令微调（教听话）、偏好对齐 RLHF/DPO（用人类偏好调）、宪法 AI（用原则）；因为好回答写不成标准答案，但人「一比就知道哪个更好」，故用偏好。</li>
      <li>「好回答」写不成精确公式，只能用偏好近似，近似有缝；模型会优化「讨好评分」而非「真的变好」，即奖励黑客。</li>
      <li>太安全会过度拒绝、变没用；太放松会被诱导越界、协助有害；要在两者间找平衡，还随场景变。</li>
      <li>RLHF 只是手段之一，对齐是目标加一整套技术，且技术不完美、有不确定，需治理与法规在制度层面兜底。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>预训练、微调、大语言模型、强化学习</td></tr>
      <tr><td><b>本页核心</b></td><td>有用/诚实/无害、最可能≠应该、偏好近似、目标写不对</td></tr>
      <tr><td>紧邻延伸</td><td>RLHF 与偏好对齐、宪法 AI、奖励黑客、越狱、护栏</td></tr>
      <tr><td>更远</td><td>红队测试、可解释性、AI 治理与法规、偏见与公平性</td></tr>
    </tbody>
  </table></div>
</section>
`
};
