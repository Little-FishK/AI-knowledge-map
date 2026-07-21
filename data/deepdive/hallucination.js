/* 理解原理页 —— 幻觉 Hallucination
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["hallucination"] = {
  title: "幻觉 Hallucination",
  subtitle: "流畅、自信、却是编的——为什么这是结构性的，而不是「再大一点就好」",
  aliases: "Hallucination · 幻觉 · 一本正经地胡说",
  meta: "建议 20–30 分钟 · 中级 · 需要：了解「大语言模型」怎样预测下一个词",
  thesis: "幻觉是模型生成的<b>流畅、自信、却事实错误或虚构</b>的内容。它不是偶发的 bug，而是<b>结构性</b>的：模型建模的是「最可能接下去的文本」（似然），不是「真相」——它没有真值约束，也「不知道自己不知道」。答对和瞎编，它做的其实是同一件事：挑最可能的下一个词。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——幻觉和普通「答错」有何不同。</li>
    <li><b>为什么消不掉</b>——为什么它是结构性的，而非「再大一点就好」。</li>
    <li><b>为什么这么自信</b>——编就编吧，为什么语气那么笃定、最害人。</li>
    <li><b>什么时候高发</b>——哪些情况下更容易幻觉。</li>
    <li><b>怎么对付</b>——有哪些缓解手段（注意：缓解，不是根治）。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你问：「介绍一下张伟 2019 年发表的那篇关于图神经网络的论文。」——这个人、这篇论文<b>可能根本不存在</b>。但模型不会说「查无此文」，而是<b>流畅地编出</b>一个像模像样的标题、期刊、摘要。全页解释它为什么会这样、又为什么这么自信。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是幻觉<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：模型答错很正常，为什么「幻觉」要被单独拎出来说？</p>
  <p>因为它不是普通的「答错」。普通错误往往磕磕巴巴、或明显不确定；幻觉却是<b>流畅、自信、细节丰富，编得像真的一样</b>——编造的论文有标题有期刊，虚构的 API 有名字有参数。正因为它「看起来太可信」，才格外危险：你很难一眼看出哪句是真、哪句是它现编的。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>为什么它是结构性的<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的一节：为什么再大的模型也消不掉幻觉，它不是个能修的 bug 吗？</p>
  <div class="dd-note warn"><b>因为它源于模型的本质。</b>　大模型建模的是「<b>在训练数据的统计规律下，最可能接下去的内容</b>」——它优化的是「像不像人写的下一个词」，<b>从来不是「对不对」</b>（见「大语言模型」深读页第 9 节）。它没有一个「真相数据库」去核对，也<b>不知道自己不知道</b>。</div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 130" role="img" aria-label="答对和瞎编，模型做的是同一件事">
      <rect x="20" y="30" width="250" height="70" rx="8" fill="none" stroke="#4f9d78"/>
      <text x="145" y="52" text-anchor="middle" class="svg-t" font-size="12">「法国的首都是__」</text>
      <text x="145" y="76" text-anchor="middle" class="svg-tn" font-size="12">→ 巴黎（对）</text>
      <text x="145" y="94" text-anchor="middle" class="svg-t" font-size="10">数据里出现无数次</text>
      <rect x="290" y="30" width="250" height="70" rx="8" fill="none" stroke="#cf6f6f"/>
      <text x="415" y="52" text-anchor="middle" class="svg-t" font-size="12">「张伟那篇论文是__」</text>
      <text x="415" y="76" text-anchor="middle" class="svg-tn" font-size="12">→ 流畅编一个（错）</text>
      <text x="415" y="94" text-anchor="middle" class="svg-t" font-size="10">数据里没有，照样挑最可能的词</text>
    </svg>
    <figcaption>图 1　两种情况下，模型做的是<b>同一件事</b>：挑「最可能的下一个词」。区别只在于——第一种，训练数据里有正确答案；第二种没有，但它照样会流畅地续下去。所以「答对」和「瞎编」在机制上没有分界。</figcaption>
  </figure>
  <div class="dd-note key"><b>结论</b>　只要模型的目标是「似然」而非「真相」，幻觉的可能性就<b>无法从根上消除</b>。规模能让它更博学、错得更少，但改变不了这个底层机制——所以是「结构性」的，不是「再大一点就好」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>为什么它还这么自信<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">编就编吧，为什么语气那么笃定？这恰恰是最害人的地方。</p>
  <p>因为「<b>流畅、自信、像人写的</b>」正是模型被训练去追求的<b>表面特征</b>，而这套特征和「内容对不对」是<b>两回事</b>。模型学会了「怎么把话说得像专家」，但没学会「不确定时该露怯」。于是它对真相和对编造，用的是<b>同样笃定的口吻</b>。</p>
  <div class="dd-note intuition"><b>它不会「知道自己在编」</b>　人编瞎话时心里清楚；模型没有这种自我察觉——它只是在挑最可能的词，编造那一刻，它「以为」自己在正常作答。所以你不能指望它自己标出「这段是我瞎猜的」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>什么时候更容易幻觉<span class="dd-badge eng">工程</span></h2>
  <ul class="dd-steps">
    <li><b>训练数据里没有或很稀疏</b>：冷门人物、小众事实、你公司的私有信息——它没见过，只能编。</li>
    <li><b>问了训练截止之后的事</b>：最新消息它压根不知道（知识截止）。</li>
    <li><b>被诱导</b>：你问「张伟那篇论文」时预设了它存在，模型容易顺着你的预设编。</li>
    <li><b>采样温度高</b>：温度调高会让它更「放飞」，更偏离高概率的稳妥答案（见「信息论与熵」）。</li>
  </ul>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>怎么对付它<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">既然消不掉，能怎么把它压到可控？</p>
  <ul class="dd-steps">
    <li><b>RAG 给真实材料</b>：回答前先检索、让它<b>基于给定资料</b>作答，把回答「锚」在真实内容上（见「RAG」）。</li>
    <li><b>要求引用出处</b>：让它标明每句来自哪份材料，你能<b>一键核对</b>（见「引用与溯源」）。</li>
    <li><b>思维链</b>：让它先推理再答，减少「跳步瞎猜」（见「思维链」）。</li>
    <li><b>低置信转人工</b>：用模型对答案的置信度（logprobs）筛出不确定的，交人复核。</li>
    <li><b>提示允许「不知道」</b>：明确告诉它「不确定就说不知道，别编」，能减少一部分。</li>
  </ul>
  <div class="dd-note warn"><b>关键认知：这些都是「缓解」，不是「根治」</b>　RAG 检索错了、材料本身错了、或问题超出材料范围，幻觉照样发生。只要底层目标是似然而非真相，<b>就没有一劳永逸的解法</b>。正确心态：<b>凡是重要的事实，都要核对</b>，别把它的自信当保证。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>幻觉是流畅、自信却编造的内容，比普通答错更难识别。<span>（§1）</span></li>
    <li>它是结构性的：模型建模似然不是真相，答对和瞎编是同一个动作。<span>（§2）</span></li>
    <li>它这么自信，是因为「像人写的」是训练目标、与对错无关，且它不知道自己不知道。<span>（§3）</span></li>
    <li>数据稀疏、超训练截止、被诱导、高温时更易发生。<span>（§4）</span></li>
    <li>可用 RAG、引用、思维链、低置信转人工、允许说不知道来缓解——但都非根治。<span>（§5）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「为什么答对和瞎编在机制上是同一件事」，并说出「为什么所有手段都只是缓解而非根治」，你就抓住了幻觉的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>幻觉是能修好的 bug</td><td>是结构性的：目标是似然而非真相，消不掉、只能缓解</td></tr>
      <tr><td>模型越大就不会幻觉了</td><td>更大更博学、错更少，但机制没变，仍会幻觉</td></tr>
      <tr><td>它自信就说明它有把握</td><td>自信是训练出的口吻，与对错无关；它不知道自己不知道</td></tr>
      <tr><td>用了 RAG 就不会幻觉</td><td>只是缓解；检索错、材料错、超范围时照样编</td></tr>
      <tr><td>能让它自己标出哪句是编的</td><td>它没有这种自我察觉，编造时「以为」在正常作答</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>幻觉和普通「答错」有什么不同？为什么更危险？</li>
    <li>为什么说幻觉是结构性的？「答对」和「瞎编」有什么关系？</li>
    <li>它为什么总是那么自信？</li>
    <li>哪些情况下更容易幻觉？</li>
    <li>有哪些缓解手段？为什么它们都不是「根治」？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>它流畅、自信、细节丰富、编得像真的，难以一眼识别，因此比磕巴的普通错误更容易骗到人。</li>
      <li>因为模型建模的是「最可能接下去的内容」（似然）而非真相，没有真值约束；答对和瞎编都是「挑最可能的下一个词」这同一个动作。</li>
      <li>因为「流畅自信、像人写的」是训练追求的口吻，和内容对错无关，而且它不知道自己不知道。</li>
      <li>训练数据没有或稀疏、问了训练截止后的事、被问题预设诱导、采样温度高。</li>
      <li>RAG 给真实材料、要求引用、思维链、低置信转人工、允许说不知道；因为只要目标是似然而非真相，检索/材料/范围一出问题幻觉照样发生，无法一劳永逸。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>大语言模型、预测下一个 token、采样与温度</td></tr>
      <tr><td><b>本页核心</b></td><td>似然非真相、结构性、自信的口吻、缓解非根治</td></tr>
      <tr><td>紧邻延伸</td><td>RAG、引用与溯源、思维链、Logprobs 与置信度、检索</td></tr>
      <tr><td>更远</td><td>对齐、评测、可解释性、推理模型</td></tr>
    </tbody>
  </table></div>
</section>
`
};
