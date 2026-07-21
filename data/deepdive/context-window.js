/* 理解原理页 —— 上下文窗口 Context Window
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["context-window"] = {
  title: "上下文窗口",
  subtitle: "模型一次能「看见」的 token 总量上限",
  aliases: "Context Window · 上下文长度 · Context Length",
  meta: "建议 20–30 分钟 · 基础 → 中级 · 需要：了解「Token」「注意力」",
  thesis: "上下文窗口是模型单次能「看见」的 token 总量上限——你的提示、对话历史、检索来的材料、以及它正在生成的回答，全都挤在这个窗口里。<b>窗口之外的东西，模型完全看不见</b>。它由注意力的平方级开销所约束，是长对话「失忆」、长文档处理受限的根本原因。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——窗口里装的到底是哪些东西。</li>
    <li><b>关键澄清</b>——模型是不是真的「记住」了对话。</li>
    <li><b>为什么有限</b>——为什么不干脆做成无限大。</li>
    <li><b>塞满就好吗</b>——窗口够大，把所有资料都塞进去行不行。</li>
    <li><b>怎么应对</b>——内容超出窗口时有哪些办法。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你和模型聊了很久，开头告诉过它「我叫小明」。聊到很后面再问「我叫什么？」，它却答不上来了。问题不在于它「忘性大」，而在于——「我叫小明」那句话<b>已经滑出了上下文窗口</b>。全页解释这背后的机制。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是上下文窗口<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：模型一次到底能「看进去」多少东西？</p>
  <p>上下文窗口是模型单次处理时能容纳的 <b>token 总量上限</b>。要注意，这个窗口里装的<b>不只是你这句提问</b>，而是这一次要一起喂给模型的<b>全部内容</b>：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>窗口里装着</th><th>例子</th></tr></thead>
    <tbody>
      <tr><td>系统提示 / 指令</td><td>「你是一个客服助手…」</td></tr>
      <tr><td>对话历史</td><td>之前来回说过的每一句</td></tr>
      <tr><td>检索来的材料</td><td>RAG 捞回来的文档片段</td></tr>
      <tr><td>它正在生成的回答</td><td>输出也占窗口</td></tr>
    </tbody>
  </table></div>
  <p>这些加起来一旦超过上限，最早的内容就会被<b>截断</b>——模型再也看不见它。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>关键澄清：它不是「记忆」<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">开头那个例子的真正原因，藏在一个常见误解里：模型是不是把对话「记住」了？</p>
  <div class="dd-note warn"><b>不是。模型本身没有记忆。</b>　每一次调用，它都把「当前窗口里能看见的全部内容」<b>从头到尾重新读一遍</b>，答完就忘。所谓它「记得前面说过的话」，其实是因为——前面那些话<b>还被原样塞在这次的窗口里</b>重新喂了进去。一旦某句话因为太靠前被挤出窗口，它就<b>真的消失了</b>，模型再也无从知晓。</div>
  <div class="dd-note eng"><b>这解释了两件事</b>　① 为什么用 API 做多轮对话，每次都要<b>把历史一起发过去</b>——因为模型不会自己存；② 为什么长对话越聊越贵——历史越长，每次重发的 token 越多，而<b>计费按 token 算</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>为什么不能无限大<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">既然窗口越大越方便，为什么厂商不干脆做成无限？</p>
  <p>因为代价是<b>超线性</b>的。注意力要让每个位置都看遍所有位置，算量和显存都随序列长度<b>平方</b>增长——长度翻一倍，开销约变<b>四倍</b>（见「注意力机制」深读页第 6 节）。所以窗口越大，推理越慢、越贵。这不是厂商小气，而是机制的硬约束。</p>
  <div class="dd-note math"><b>一笔账</b>　1 千 token 的输入，注意力约算 100 万对；10 万 token 就是约 100 亿对。每把窗口拉长一档，都要付这种超线性的代价——这正是长上下文又慢又贵的根源。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>「塞得进」不等于「用得好」<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">就算模型支持很长的窗口，把所有资料一股脑塞进去，就万事大吉了吗？</p>
  <div class="dd-note warn"><b>并不是。</b>　长窗口有两个陷阱：其一，<b>中间迷失</b>——放在上下文<b>中段</b>的信息，利用率明显低于放在开头和结尾，模型容易「看漏」中间（见「中间迷失」节点）；其二，塞进大量<b>无关内容</b>会稀释注意力、混入噪声，反而让回答变差。</div>
  <div class="dd-note key"><b>一句话</b>　长上下文是一种<b>能力</b>，不是「无脑往里塞」的许可。<b>放什么、放多少、放在哪</b>，比「能放多少」更影响效果——关键材料尽量放在开头或结尾。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>怎么应对窗口限制<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">当要处理的内容超过窗口，或长对话开始失忆，有哪些办法？</p>
  <ul class="dd-steps">
    <li><b>只放相关的（RAG）</b>：不把整个知识库塞进去，而是<b>检索</b>出与当前问题最相关的少量片段再喂给模型（见「RAG」「检索」）。</li>
    <li><b>精心分配预算（上下文工程）</b>：决定每次调用窗口里到底放什么、按什么顺序——比雕琢单条提示更上层（见「上下文工程」）。</li>
    <li><b>压缩与摘要</b>：把过长的历史<b>压缩成摘要</b>再带上，腾出窗口（见「上下文压缩」）。</li>
    <li><b>外挂记忆</b>：让 Agent 把装不下的信息存到外部、需要时再取回（见「Agent 记忆」）。</li>
  </ul>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>上下文窗口是单次能看见的 token 上限，装着提示+历史+检索+输出，窗口外看不见。<span>（§1）</span></li>
    <li>模型本身没记忆，「记得前面」是因为前面还在窗口里被重新喂入；被挤出就真忘了。<span>（§2）</span></li>
    <li>窗口不能无限大，因为注意力的平方级开销让长窗口又慢又贵。<span>（§3）</span></li>
    <li>就算窗口够长，塞满也不等于用好：有中间迷失、有噪声稀释。<span>（§4）</span></li>
    <li>应对：RAG 只放相关的、上下文工程分配预算、压缩摘要、外挂记忆。<span>（§5）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「模型为什么其实没有记忆、却像记得对话」，并说出「窗口为什么不能无限大、以及塞满为什么不等于用好」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>模型能记住整段对话</td><td>它没有记忆；靠把历史重新塞进窗口才「记得」，挤出即忘</td></tr>
      <tr><td>窗口只装我的提问</td><td>还装系统提示、历史、检索材料、以及正在生成的输出</td></tr>
      <tr><td>窗口越大总是越好</td><td>越大越慢越贵，还有中间迷失；关键是放对内容</td></tr>
      <tr><td>把资料全塞进去最保险</td><td>噪声会稀释注意力、中段易被忽略，往往更差</td></tr>
      <tr><td>窗口不够是厂商抠门</td><td>是注意力平方级开销的硬约束</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>上下文窗口里到底装着哪些东西？</li>
    <li>模型「记得前面说过的话」的真实机制是什么？超出窗口会怎样？</li>
    <li>为什么窗口不能做成无限大？</li>
    <li>窗口足够大时，为什么「把所有资料都塞进去」不是好主意？</li>
    <li>内容超出窗口或长对话失忆时，有哪些应对手段？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>系统提示/指令、对话历史、检索来的材料、以及模型正在生成的输出。</li>
      <li>模型没记忆，每次把窗口内全部内容重新读一遍；前面的话还在窗口里才「记得」，一旦被挤出窗口就真的没了。</li>
      <li>因为注意力开销随长度平方增长，窗口越长越慢越贵，是机制的硬约束。</li>
      <li>因为有中间迷失（中段信息利用率低），且大量无关内容会稀释注意力、引入噪声，反而变差。</li>
      <li>用 RAG 只放相关片段、用上下文工程分配预算、压缩摘要历史、给 Agent 外挂记忆。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>Token 与分词、注意力机制、大语言模型</td></tr>
      <tr><td><b>本页核心</b></td><td>token 预算、无记忆、平方级开销、中间迷失、塞满≠用好</td></tr>
      <tr><td>紧邻延伸</td><td>中间迷失、RAG、上下文工程、上下文压缩、Agent 记忆</td></tr>
      <tr><td>更远</td><td>推理优化、提示缓存、思维链</td></tr>
    </tbody>
  </table></div>
</section>
`
};
