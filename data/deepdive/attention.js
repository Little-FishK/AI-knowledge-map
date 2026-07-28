/* 理解原理页 —— 注意力机制 Attention
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["attention"] = {
  title: "注意力机制",
  subtitle: "处理每个词时，让模型自己决定该「看」句子里的哪些词",
  aliases: "Attention · Self-Attention · 自注意力",
  meta: "建议 30–40 分钟 · 中级 · 需要：向量点积、softmax、了解「神经网络」",
  thesis: "标准全局注意力让每个查询与可见键计算匹配分数，再按归一化权重汇总值；本质是一次<b>由内容、位置与掩码共同决定权重的加权和</b>。它缩短远距离信息路径并允许训练时并行处理位置，但权重不是解释保证，也不自动等于正确因果关系。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>要解决什么</b>——理解一个词时，模型面临的核心难题是什么。</li>
    <li><b>核心机制</b>——Query / Key / Value 三步，怎样让模型「自己决定该看谁」。</li>
    <li><b>为什么是转折点</b>——它比旧的序列模型强在哪两点。</li>
    <li><b>多头</b>——为什么要并行跑好几组注意力。</li>
    <li><b>代价</b>——它的平方级开销从何而来，又约束了什么。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　一句话：<b>「小明把书给了小红，因为她生日到了。」</b>　当模型处理「<b>她</b>」这个词时，得知道「她」指的是<b>小红</b>——它必须「看向」句子里正确的那个词。注意力，就是让它学会看向谁的机制。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>要解决的核心难题<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：理解一句话里的某个词，到底难在哪？</p>
  <p>理解一个词，几乎总要看它和句子里<b>哪些别的词</b>有关。处理「她」，就得联系到「小红」；而「小红」可能在好几个词之外。难点有二：<b>相关的词可能离得很远</b>，而且<b>该看谁是随内容变的</b>，不能靠固定规则。注意力指的是让模型自己决定该看谁的一套机制，专门解决这种不靠固定规则、又要为每个词找对相关词的难题。它输入一串词的表示，先为当前词和其余词逐一比较相关度，再据此输出每个词该重点看向谁。正因为权重来自内容比较，某个词被看重，就表示它在当下与当前词更相关，而不是它在句子里离得最近。</p>
  <div class="dd-note intuition"><b>旧办法为什么不够</b>　在注意力之前，主流是循环网络（RNN）：像读书一样<b>按顺序</b>一个词一个词处理，把“记忆”沿链条往后传。长路径会让早先信息更难保留，而且时间步之间难以并行；门控 RNN 能缓解但不能消除这两个结构约束。第 5 节会逐项比较。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>核心机制：Query / Key / Value<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">怎么让模型「自己决定该看哪些词」？答案是一套三步的匹配-加权流程；这套流程可以理解为让每个词自己去和别人比匹配、再按匹配度汇总信息的机制，用于解决模型该重点看句中哪些词的问题。</p>
  <p>每个词先产出三个向量，各有分工：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>向量</th><th>角色</th><th>一句话</th></tr></thead>
    <tbody>
      <tr><td>Query（查询）</td><td>我在找什么</td><td>「她」发出：我在找我指代的那个人</td></tr>
      <tr><td>Key（键）</td><td>我能提供什么</td><td>每个词亮出一张「标签」，供别人匹配</td></tr>
      <tr><td>Value（值）</td><td>我的实际内容</td><td>一旦被选中，真正被汇总走的信息</td></tr>
    </tbody>
  </table></div>
  <p>于是每个词输入自己的查询、键、值，先算查询与所有键的匹配，再归一成权重、按权重汇总所有值，输出一个看完全场后的新表示。具体三步是：</p>
  <ol class="dd-steps">
    <li><b>算匹配度</b>：用当前词的 Query 去和<b>所有</b>词的 Key 做点积——点积越大，越「对味」。</li>
    <li><b>归一化成权重</b>：把这排匹配度过一个 softmax，变成一组相加为 1 的权重（谁匹配高，谁权重大）。</li>
    <li><b>加权求和</b>：按这组权重，把所有词的 Value 加权平均，作为当前词「看完全场后」得到的新表示。</li>
  </ol>
  <div class="dd-formula">Attention(Q, K, V) = softmax( Q·Kᵀ / <span class="dd-radical" role="math" aria-label="d 的平方根"><span class="dd-radicand">d</span></span> ) · V</div>
  <p class="dd-formula-note"><b>符号逐个解释：</b>Attention 表示这整套注意力计算的输出。Q、K、V 分别是所有可见 token 的查询、键、值向量排成的矩阵；上标 T 表示转置，使每个查询能与每个键做点积；d 是每个键/查询向量的维数，除以它的平方根是为防止维数增加时点积过大；softmax 把每个查询对应的一排分数变为和为 1 的权重，最后乘 V 完成加权求和。掩码和位置偏置若存在，会在 softmax 前共同修改分数。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 180" role="img" aria-label="处理「她」时，注意力权重偏向「小红」">
      <g font-size="14">
        <rect x="30" y="40" width="70" height="30" rx="5" fill="#21252d" stroke="#2c313b"/><text x="65" y="60" text-anchor="middle" class="svg-tn" font-size="13">小明</text>
        <rect x="130" y="40" width="70" height="30" rx="5" fill="#21252d" stroke="#2c313b"/><text x="165" y="60" text-anchor="middle" class="svg-tn" font-size="13">书</text>
        <rect x="230" y="40" width="70" height="30" rx="5" fill="#21252d" stroke="#4f9d78" stroke-width="2"/><text x="265" y="60" text-anchor="middle" class="svg-tn" font-size="13">小红</text>
        <rect x="330" y="40" width="70" height="30" rx="5" fill="#21252d" stroke="#2c313b"/><text x="365" y="60" text-anchor="middle" class="svg-tn" font-size="13">生日</text>
      </g>
      <rect x="430" y="120" width="70" height="30" rx="5" fill="#1a1d23" stroke="#6b8cbe" stroke-width="2"/><text x="465" y="140" text-anchor="middle" class="svg-tn" font-size="13">她</text>
      <text x="465" y="112" text-anchor="middle" class="svg-t" font-size="11">Query</text>
      <line x1="450" y1="120" x2="80" y2="72" stroke="#6b7484" stroke-width="1"/>
      <line x1="452" y1="120" x2="165" y2="72" stroke="#6b7484" stroke-width="1"/>
      <line x1="454" y1="120" x2="265" y2="72" stroke="#4f9d78" stroke-width="3.5"/>
      <line x1="456" y1="120" x2="365" y2="72" stroke="#6b7484" stroke-width="1.2"/>
      <text x="330" y="100" class="svg-t" fill="#4f9d78" font-size="12">权重最高 → 看向「小红」</text>
    </svg>
    <figcaption>图 1　处理「她」时，它的 Query 和每个词的 Key 匹配，softmax 后「小红」拿到最高权重，于是「她」主要汇总了「小红」的信息。粗细即权重大小。</figcaption>
  </figure>

  <div class="dd-note math"><b>抓住这一句</b>　权重不是按“离得近就固定更大”的规则分配，而是由 <b>Query–Key 内容匹配、位置机制和掩码</b>共同算出。「她」看向「小红」，主要因为它们在这个头里“对味”，而不是仅仅因为相邻；如果模型使用 RoPE、相对位置偏置或局部窗口，距离和可见性也会影响最终分数。权重高只表示该词在这个头里更匹配，但这不是解释概率，也不能证明它是结论的唯一原因。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>手算一次缩放点积注意力<span class="dd-badge math">数值例子</span></h2>
  <p class="dd-lead">从两组匹配分数到最终输出，softmax 和 Value 各改变了什么？</p>
  <p>这段手算描述缩放点积注意力怎样把分数变成一次加权混合，为了看清权重到底怎样落到具体数值。设单个查询 <code>q=[1,0]</code>，两个键 <code>k₁=[1,0]</code>、<code>k₂=[0,1]</code>，键维度 <code>d=2</code>；对应值为 <code>v₁=[2,0]</code>、<code>v₂=[0,4]</code>：</p>
  <table class="dd-table"><thead><tr><th>步骤</th><th>计算</th><th>结果（约）</th></tr></thead><tbody><tr><td>点积</td><td><code>[q·k₁,q·k₂]</code></td><td><code>[1,0]</code></td></tr><tr><td>缩放</td><td><code>[1,0]/<span class="dd-radical" role="math" aria-label="2 的平方根"><span class="dd-radicand">2</span></span></code></td><td><code>[0.707,0]</code></td></tr><tr><td>softmax</td><td><code>exp(s)/Σexp(s)</code></td><td><code>[0.670,0.330]</code></td></tr><tr><td>加权和</td><td><code>0.670v₁+0.330v₂</code></td><td><code>[1.340,1.320]</code></td></tr></tbody></table>
  <p>第一把键更匹配，所以它的 Value 权重更大；输出却不是复制 <code>v₁</code>，而是两个 Value 的混合。Key 决定“取多少”，Value 决定“取什么”，二者不能混为一谈。整个手算输入查询、键、值，先做点积与缩放、再归一并加权求和，就输出一个混合向量。权重更大，就表示这把键更匹配。</p>
  <div class="dd-note warn"><b>注意力权重不是解释概率。</b>它只描述当前头、当前层的一次信息混合系数；残差、其他头和后续层仍会改写表示。高权重不证明某 token 是模型结论的唯一原因。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>自注意力：句子内部互相看<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">上一节的 Q、K、V 都从哪来？这决定了「谁在看谁」。</p>
  <p>查询、键、值都来自同一句话的注意力，称为<b>自注意力（self-attention）</b>；它用于解决句子内部各词如何互相参照。它输入同一句话的词表示，先让每个词与同句所有词比较相关度，再据权重更新，输出每个词看过全句后的新表示——我们的运行示例「她」在同一句里找到「小红」，就是这样。某个词主要看向另一个词，就表示两者在句内更相关，但这只是同一句内部的关系，换成跨句就是另一回事。</p>
  <div class="dd-note intuition"><b>还有一种「跨着看」</b>　如果 Query 来自一个序列、Key/Value 来自<b>另一个</b>序列，就是<b>交叉注意力</b>，常见于翻译（让译文的每个词去看原文）。机制完全一样，只是「看的对象」换成了另一串。本页之后仍以自注意力为主。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>为什么它是转折点<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">最关键的一节：注意力到底比之前的 RNN 强在哪，值得取而代之？</p>
  <p>相较于按时间步串行传递的经典 RNN，它改善了两个关键瓶颈：</p>
  <p>从输入输出看，它接收整段序列中所有 token 的表示，并同时输出每个位置融合可见上下文后的新表示；“并行”指这些位置不必像 RNN 那样等待前一个时间步完成。注意力之所以是转折点，可以理解为它用一层内的直接连接替代了旧的逐步传递，正是为了解决长距离依赖难学和无法并行这两个瓶颈：计算时每个位置先与所有可见位置直接匹配，再并行地一次算完。路径更短，就表示远距信息更容易学到，但更短的路径不保证权重一定落在正确位置。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 200" role="img" aria-label="RNN 逐步传递路径长，注意力任意两词直连">
      <text x="20" y="30" class="svg-t">RNN：信息沿链条逐步传，隔得越远越衰减、还必须串行</text>
      <g>
        <circle cx="60" cy="60" r="16" fill="#21252d" stroke="#6b7484"/><circle cx="160" cy="60" r="16" fill="#21252d" stroke="#6b7484"/><circle cx="260" cy="60" r="16" fill="#21252d" stroke="#6b7484"/><circle cx="360" cy="60" r="16" fill="#21252d" stroke="#6b7484"/><circle cx="460" cy="60" r="16" fill="#21252d" stroke="#cf6f6f"/>
        <line x1="76" y1="60" x2="144" y2="60" stroke="#6b7484" stroke-width="1.6" marker-end="url(#d1)"/><line x1="176" y1="60" x2="244" y2="60" stroke="#6b7484" stroke-width="1.6" marker-end="url(#d1)"/><line x1="276" y1="60" x2="344" y2="60" stroke="#6b7484" stroke-width="1.6" marker-end="url(#d1)"/><line x1="376" y1="60" x2="444" y2="60" stroke="#6b7484" stroke-width="1.6" marker-end="url(#d1)"/>
        <text x="260" y="95" text-anchor="middle" class="svg-t" fill="#cf6f6f">第 1 个词要影响第 5 个词，得走 4 步</text>
      </g>
      <text x="20" y="135" class="svg-t">注意力：任意两词直接相连，路径长度都是 1，且同时算</text>
      <g>
        <circle cx="60" cy="165" r="16" fill="#21252d" stroke="#6b8cbe"/><circle cx="160" cy="165" r="16" fill="#21252d" stroke="#6b8cbe"/><circle cx="260" cy="165" r="16" fill="#21252d" stroke="#6b8cbe"/><circle cx="360" cy="165" r="16" fill="#21252d" stroke="#6b8cbe"/><circle cx="460" cy="165" r="16" fill="#21252d" stroke="#6b8cbe"/>
        <path d="M60,149 C160,110 360,110 460,149" fill="none" stroke="#4f9d78" stroke-width="2"/>
        <path d="M160,149 C260,120 360,120 460,149" fill="none" stroke="#4f9d78" stroke-width="1.2" opacity=".6"/>
        <path d="M60,181 C200,205 320,205 460,181" fill="none" stroke="#4f9d78" stroke-width="1.2" opacity=".6"/>
      </g>
      <defs><marker id="d1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 2　经典 RNN 中相隔 n 个时间步的信息要经过长度随 n 增长的传递链；全局注意力让任意两个可见位置在一层内直接交互。路径更短有利于学习远距依赖，但仍要经过投影、softmax 与后续层，并非“没有衰减”。</figcaption>
  </figure>

  <ul class="dd-steps">
    <li><b>长距离信息路径更短</b>。RNN 里隔 n 个词通常要走 n 步；全局自注意力让任意两位置在一层内直接交互。短路径有利于学习远距离依赖，但不保证模型一定会把权重放在正确位置。</li>
    <li><b>可以并行</b>。RNN 必须算完第 t 步才能算第 t+1 步；注意力的所有位置<b>同时</b>计算，能吃满 GPU。</li>
  </ul>
  <div class="dd-note key"><b>第二点被严重低估</b>　「能并行」直接决定了「把模型和数据一起放大」在工程上<b>可行</b>。没有并行，训练大模型的时间会长到不现实——<b>没有注意力的并行，就没有缩放定律那条路，也就没有今天的大模型规模。</b></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>多头注意力：为什么要好几组<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">一组注意力只能按一种方式衡量「相关」。可词与词的关系有很多种，一组够吗？</p>
  <p><b>多头注意力</b>是一种在同一层并行跑多组注意力、各看一种相关方式的机制，用于解决单组注意力只能按一种方式衡量相关的问题。它输入同一批词表示，先在各自的子空间分别做注意力，再把多组结果拼接、投影，输出综合了多个视角的新表示。有些头会呈现语法、指代或位置模式——这只表示分工可能在训练中形成，但这种分工是学出来的、而非架构预先指定，也有许多头相互冗余。</p>
  <div class="dd-note intuition"><b>分工若出现，是训练学出来的</b>　没人预先指定某个头“专管指代”。多头提供的是多个表示子空间和并行路由机会，最后拼接并投影；能否形成稳定可解释分工要靠实证分析。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>它的代价：平方级开销<span class="dd-badge math">数学</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">这么强，代价是什么？答案藏在「每个词都要看所有词」这句话里。</p>
  <p><b>平方级开销</b>衡量的是每个词都要与所有词两两匹配带来的成本，搞清它是为了解决长上下文为什么又慢又贵。设 <code>n</code> 是序列的 token 数，模型输入序列里全部位置的表示，先让每个位置与所有位置两两算分、再归一化与加权，输出每个位置的新表示；因此注意力分数矩阵有 <code>n²</code> 个元素，计算量与朴素显存占用随长度平方增长。长度翻倍成本就翻四倍，这表示开销是超线性的，但实际总成本还包含投影与前馈层，FlashAttention、滑窗或稀疏注意力也会改变显存常数或复杂度。</p>
  <div class="dd-note math"><b>算一笔账</b>　1 千个 token 的输入，注意力要算约 100 万对；10 万个 token 就是约 <b>100 亿</b>对。这就是长上下文推理又慢又贵的原因——不是厂商不愿意给，而是每一档长度都要付超线性的代价。</div>
  <p>这条平方开销直接约束了两件事：</p>
  <ul class="dd-steps">
    <li>它是<b>上下文窗口</b>无法随意放大的根本原因——窗口越长，开销越吃不消。</li>
    <li>长窗口还会暴露<b>「中间迷失」</b>等位置偏差：模型可能更善用开头和结尾的信息。这是训练分布、位置表示和注意模式等多因素结果，不能只归因于“权重被摊薄”。</li>
  </ul>
  <div class="dd-note eng"><b>一整条优化路线</b>　围绕这个瓶颈，有稀疏注意力（只算部分位置对）、滑窗注意力（只看邻近范围）、以及工程层面的 FlashAttention（不降复杂度，但大幅减少显存搬运）。它们缓解开销，但「平方」这个根本量级仍在。</div>
  <div class="dd-note key"><b>怎样验证优化真的有效：</b>固定模型权重、精度、batch 和硬件，按 1K、4K、16K 等长度同时记录任务正确率、峰值显存、吞吐与 p95 延迟；再做证据位置置换，确认加速没有通过截断或局部窗口悄悄损伤远距信息。若速度提高但长距离题准确率下降，先诊断可见范围与 mask，再比较内核实现，而不是只看注意力热图。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从匹配分数到可扩展序列建模，关键因果环节怎样闭合？</p>
  <ol class="dd-chain">
    <li>理解一个词要看句中相关的词，而相关的词可能很远、且随内容变——旧的 RNN 应付不了。<span>（§1）</span></li>
    <li>注意力用 Q/K/V 三步：Query·Key 算匹配、softmax 成权重、按权重加权求和 Value。<span>（§2）</span></li>
    <li>softmax 把缩放分数变成权重，Value 加权和产生新的表示；权重不是因果解释。<span>（§3）</span></li>
    <li>Q/K/V 都来自同一句话时，就是自注意力：句子内部互相看。<span>（§4）</span></li>
    <li>它让任意两位置在一层内直接交互、又能并行训练，改善经典 RNN 的长路径与串行瓶颈。<span>（§5）</span></li>
    <li>多头提供多个投影子空间；专门化可能出现，也可能冗余。<span>（§6）</span></li>
    <li>标准全局注意力的分数矩阵有平方级开销；长上下文还会出现位置偏差，但“中间迷失”不能只归因于平方复杂度。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「注意力的权重为什么由内容而非位置决定」，并说出「它凭哪两点取代了 RNN、又为什么这对大模型规模至关重要」，你就抓住了它的内核。下一步：看这块机制怎样被包装成可堆叠的标准层——「Transformer」深读页。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">哪些直觉把信息混合、解释性与位置关系混成了一件事？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>注意力只靠「位置远近」决定看谁</td><td>基础项来自 Query·Key 内容匹配；位置编码、相对偏置与掩码也可共同改变分数，并非固定按距离分配</td></tr>
      <tr><td>注意力就是 Transformer</td><td>注意力是一种机制；Transformer 是用它搭起的可堆叠架构（见其深读页）</td></tr>
      <tr><td>多头是为了算得更快</td><td>是为了从<b>多个不同视角</b>看相关，分工是学出来的</td></tr>
      <tr><td>上下文窗口不够是厂商小气</td><td>是注意力平方级开销的硬约束，每加长一档都超线性变贵</td></tr>
      <tr><td>注意力自己知道词序</td><td>不带位置表示的自注意力对排列等变；词序要另外注入（见 Transformer 的位置编码）</td></tr>
      <tr><td>最高注意力权重就是模型答案的原因</td><td>它只是某层某头的混合系数；残差、其他头和后续层共同决定输出</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>Query、Key、Value 各自扮演什么角色？三步流程是怎样的？</li>
    <li>为什么不能说注意力权重只由位置远近决定？位置机制和掩码又会怎样参与？</li>
    <li>自注意力和交叉注意力的区别是什么？</li>
    <li>注意力靠哪两点取代了 RNN？其中「可并行」为什么对大模型如此关键？</li>
    <li>多头注意力为什么要跑好几组？各组的分工是怎么来的？</li>
    <li>注意力的开销为什么是序列长度的平方？这约束了什么？</li>
    <li>为什么说注意力本身「不知道词序」？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>Query=我在找什么，Key=我能提供什么，Value=我的实际内容；用 Query 和所有 Key 点积算匹配、softmax 成权重、再对所有 Value 加权求和。</li>
      <li>基础匹配来自 Query 与 Key 的点积，而不是固定的“越近越大”规则；但 RoPE、相对位置偏置和掩码会把位置或可见性写进 softmax 前分数，所以最终权重由这些因素共同决定。</li>
      <li>自注意力的 Q/K/V 来自同一序列（句内互看）；交叉注意力的 Q 来自一个序列、K/V 来自另一个（如译文看原文）。</li>
      <li>其一，全局注意力让任意两词在一层内直接交互，缩短长距离信息路径；其二，训练时所有位置可并行计算。短路径有利于远距离依赖，但不是必然正确关注的保证。</li>
      <li>一组投影只提供一个表示子空间，多头提供多种并行路由机会；语法、指代或位置分工可能在训练中出现，也可能冗余，并不是每个头都有固定职责。</li>
      <li>标准全局注意力让每个位置与所有位置匹配，分数矩阵有 n² 项；它约束窗口成本。中间迷失还受训练分布、位置表示与注意模式影响。</li>
      <li>因为不带位置表示的自注意力对输入排列等变：输入怎样重排，输出就怎样重排，无法识别先后；词序要靠额外的位置表示注入。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>向量与点积、softmax、神经网络、循环神经网络 RNN</td></tr>
      <tr><td><b>本页核心</b></td><td>Query/Key/Value、自注意力与交叉注意力、路径长度与并行、多头、平方级开销</td></tr>
      <tr><td>紧邻延伸</td><td>Transformer、位置编码、梯度消失、上下文窗口、中间迷失</td></tr>
      <tr><td>更远</td><td>缩放定律、大语言模型、推理优化（FlashAttention 等）</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Vaswani et al., Attention Is All You Need</a>：Q/K/V、缩放点积、多头注意力、路径长度与复杂度。</li>
    <li><a href="https://arxiv.org/abs/2205.14135" target="_blank" rel="noopener">Dao et al., FlashAttention</a>：精确注意力的 IO 复杂度与显存优化。</li>
    <li><a href="https://arxiv.org/abs/2307.03172" target="_blank" rel="noopener">Liu et al., Lost in the Middle</a>：长上下文中的位置偏差实验。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-21</div>
</div>
`
};
