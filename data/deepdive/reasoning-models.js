/* 理解原理页 —— 推理模型 Reasoning Models
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["reasoning-models"] = {
  title: "推理模型",
  subtitle: "回答前先生成一大段「思考」，用推理时的算力换准确率",
  aliases: "Reasoning Models · 推理模型 · 慢思考模型",
  meta: "建议 20–30 分钟 · 中级 · 需要：了解「思维链」「缩放定律」",
  thesis: "推理模型是一类回答前会<b>自动生成一大段「思考」</b>（长思维链）、再给答案的模型。它把「思维链」从提示技巧<b>内化进了训练</b>，并开辟了一条新的扩展轴——过去靠「把模型做大」（预训练缩放），它靠「回答时多想」（测试时缩放）：同一个模型，想得越久，难题上越准。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——为什么有一类模型「回答很慢」，还被当成进步。</li>
    <li><b>vs 思维链</b>——这不就是让模型写思维链吗，区别在哪。</li>
    <li><b>新的扩展轴</b>——为什么它和「把模型做大」并列为一个大方向。</li>
    <li><b>代价</b>——多想有什么代价。</li>
    <li><b>局限</b>——想得越久就一定越对吗。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　一道竞赛数学题。普通模型往往<b>秒答</b>——快，但难题上常错；推理模型会<b>先「想」几十秒</b>，在心里（其实是写出来）演算、试错、检查，再给答案——慢，但对的概率高得多。全页解释这「慢」为什么是进步。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是推理模型<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：为什么有一类模型故意「回答很慢」，反而被当成进步？</p>
  <p>普通大模型倾向于<b>直接给答案</b>。推理模型不一样：面对难题，它会先<b>自动生成一大段推理过程</b>——拆解、演算、试不同思路、自我检查——然后才给出最终答案。这段「思考」通常很长、也很花时间，但换来的是<b>难题上明显更高的准确率</b>。它把算力从「训练时」挪了一部分到「回答时」。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它和思维链什么关系<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">「先想再答」听着不就是思维链吗？区别到底在哪？</p>
  <p>关键区别在<b>「谁让它想的」</b>：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>思维链（提示技巧）</th><th>推理模型（训练进模型）</th></tr></thead>
    <tbody>
      <tr><td>怎么触发</td><td><b>你</b>在提示里引导（给示例、或说「一步步想」）</td><td>模型<b>自发</b>产生，不用你引导</td></tr>
      <tr><td>能力从哪来</td><td>普通模型的临时发挥</td><td>用强化学习等<b>训练</b>出「怎么想才有效」</td></tr>
      <tr><td>推理质量</td><td>看提示、不稳定</td><td>训练过、更长更稳、会自我检查纠错</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>一句话</b>　思维链是「你教模型这次先想一下」；推理模型是「模型被训练成<b>天生就会</b>先想很久、还想得好」。后者把前者从一个提示技巧，变成了模型自带的能力（见「思维链」深读页）。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>一条新的扩展轴：测试时缩放<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的一节：它为什么被看作和「把模型做大」并列的一个大方向？</p>
  <p>过去让模型更强，主要靠<b>预训练缩放</b>——把参数、数据、算力在<b>训练时</b>一起做大（缩放定律，见其节点）。但这条路越来越贵、且高质量数据在见底。推理模型开辟了<b>第二条轴</b>：</p>
  <div class="dd-note key"><b>测试时缩放（test-time scaling）</b>　同一个模型，在<b>回答时</b>投入更多算力（想得更久、生成更长的推理），准确率就能继续提升。也就是说，除了「训练时把模型做大」，现在还能「回答时让它多想」——这是一条<b>独立的、可持续加注</b>的新维度。</div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 120" role="img" aria-label="普通模型直接答，推理模型先长思考再答">
      <g>
        <rect x="20" y="30" width="240" height="70" rx="8" fill="none" stroke="#6b7484"/>
        <text x="140" y="52" text-anchor="middle" class="svg-t" font-size="12">普通模型</text>
        <text x="140" y="76" text-anchor="middle" class="svg-tn" font-size="12">问 → 答（秒）</text>
        <text x="140" y="94" text-anchor="middle" class="svg-t" font-size="10" fill="#cf6f6f">快，但难题常错</text>
      </g>
      <g>
        <rect x="300" y="30" width="240" height="70" rx="8" fill="none" stroke="#c25f5f"/>
        <text x="420" y="52" text-anchor="middle" class="svg-t" font-size="12">推理模型</text>
        <text x="420" y="76" text-anchor="middle" class="svg-tn" font-size="11">问 →〔长思考〕→ 答</text>
        <text x="420" y="94" text-anchor="middle" class="svg-t" font-size="10" fill="#4f9d78">慢，但难题上更准</text>
      </g>
    </svg>
    <figcaption>图 1　用「回答时的算力」换「准确率」：普通模型图快，推理模型愿意为难题多花时间想。这段长思考，就是它把测试时算力转化成正确率的方式。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>代价<span class="dd-badge eng">工程</span></h2>
  <ul class="dd-steps">
    <li><b>慢、贵</b>：一大段思考意味着生成<b>大量额外的 token</b>，延迟和费用都显著上升。</li>
    <li><b>占上下文窗口</b>：长推理会吃掉宝贵的窗口预算（见「上下文窗口」）。</li>
    <li><b>不是所有任务都值得</b>：简单问题（「今天星期几格式化一下」）上强行长思考，纯属浪费——又慢又贵还没更好。</li>
  </ul>
  <div class="dd-note intuition"><b>所以要「因题施策」</b>　难的多步推理（数学、代码、复杂逻辑）用推理模型最划算；日常简答用普通模型即可。很多产品会<b>按问题难度自动切换</b>该不该「多想」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>局限：想得久 ≠ 一定对<span class="dd-badge eng">工程</span></h2>
  <div class="dd-note warn"><b>别把「长思考」当成「正确保证」</b>　推理模型显著提升了难题准确率，但<b>不保证对</b>：它可能一路想歪、把错误越推越「圆」；而且它<b>写出来的推理，未必忠实反映内部真实的计算</b>——步骤看着严谨、结论却错，或结论对而步骤是事后凑的。所以它的「思考过程」是有用的参考，<b>不是可靠的证明</b>，重要结论仍需核对。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>推理模型回答前先自动生成一大段思考再答，慢但难题上更准。<span>（§1）</span></li>
    <li>它把思维链从「你引导的提示技巧」内化成「训练出的自带能力」。<span>（§2）</span></li>
    <li>它开辟了测试时缩放：除了训练时做大，还能回答时多想，是第二条扩展轴。<span>（§3）</span></li>
    <li>代价是慢、贵、占窗口，简单任务不值得。<span>（§4）</span></li>
    <li>但想得久不等于一定对，思考过程也未必忠实——重要结论仍需核对。<span>（§5）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「推理模型和思维链的区别」，并说出「测试时缩放为什么是一条新的扩展轴」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>回答慢是模型变差了</td><td>是故意多想以换取难题上的准确率</td></tr>
      <tr><td>推理模型就是让它写思维链</td><td>思维链是提示技巧；推理模型把「先想再答」训进了模型、自发产生</td></tr>
      <tr><td>它靠的还是把模型做得更大</td><td>是新的一条轴——测试时缩放，回答时多投入算力</td></tr>
      <tr><td>所有任务都该用推理模型</td><td>简单题用它纯浪费；难的多步推理才划算</td></tr>
      <tr><td>它写出的推理就是它的真实思路，且一定对</td><td>未必忠实、也不保证正确，重要结论仍需核对</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>推理模型回答问题时和普通模型有什么不同？为什么这被当成进步？</li>
    <li>推理模型和思维链最关键的区别是什么？</li>
    <li>什么是「测试时缩放」？它和「预训练缩放」有何不同？</li>
    <li>推理模型有哪些代价？为什么不是所有任务都该用？</li>
    <li>为什么说「想得久不等于一定对」？该怎么对待它的思考过程？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>它回答前先自动生成一大段推理再答，慢但在难题上准确率明显更高；这是用回答时的算力换准确率。</li>
      <li>思维链靠你在提示里引导、是普通模型的临时发挥；推理模型把「先想再答」用训练内化成自带能力，自发产生更长更稳的推理。</li>
      <li>测试时缩放是在回答时投入更多算力（想更久）来提升准确率；预训练缩放是在训练时把模型/数据/算力做大。二者是两条独立的扩展轴。</li>
      <li>慢、贵（大量思考 token）、占窗口；简单题上长思考是浪费，难的多步推理才划算。</li>
      <li>因为它可能想歪、把错误越推越圆，且写出的推理未必忠实反映内部计算；思考过程只是参考、不是证明，重要结论仍需核对。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>思维链 CoT、大语言模型、缩放定律</td></tr>
      <tr><td><b>本页核心</b></td><td>长思考、内化 vs 提示、测试时缩放、想久≠一定对</td></tr>
      <tr><td>紧邻延伸</td><td>RLHF、自洽性、思维树、上下文窗口</td></tr>
      <tr><td>更远</td><td>合成数据、评测、可解释性、Agent</td></tr>
    </tbody>
  </table></div>
</section>
`
};
