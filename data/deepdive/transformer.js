/* 理解原理页 —— Transformer
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["transformer"] = {
  title: "Transformer",
  subtitle: "把注意力包装成可深度堆叠、可并行训练的标准积木",
  aliases: "Transformer · 变换器",
  meta: "建议 30–40 分钟 · 中级 · 需要：先读过「注意力机制」深读页",
  thesis: "Transformer 把<b>注意力</b>与逐位置前馈、残差连接和归一化组合成可反复堆叠的标准层。它缩短了序列位置之间的信息路径，并让训练阶段能高度并行，因此成为现代大模型最常用的骨架；具体实现会采用不同的归一化位置、位置表示和注意力变体。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>它是什么</b>——注意力已经很强，为什么还要「Transformer」这层包装。</li>
    <li><b>一层里有什么</b>——四件套各自负责什么，为什么缺一不可。</li>
    <li><b>位置编码</b>——注意力既然不看位置，模型怎么知道词序。</li>
    <li><b>三种搭法</b>——同样的积木怎么搭出理解型、生成型模型。</li>
    <li><b>模态无关</b>——为什么图像、音频也能用同一套架构。</li>
    <li><b>历史意义</b>——一句话，它到底改变了什么。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>前置</b>　本页把<b>注意力机制</b>当作已知零件（Query/Key/Value、多头、句内互看）。如果对它还不熟，建议先读「注意力机制」深读页，再回来看它是怎样被搭成一整座大模型的。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>Transformer 是什么<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：注意力这么强了，为什么还需要「Transformer」？它多做了什么？</p>
  <p>注意力只解决了一件事：<b>怎么在位置之间传信息</b>。但要把它变成一个能学会语言的<b>大模型</b>，还差一步——需要一块能<b>无限堆叠</b>的标准积木，让信息一层层被加工得越来越抽象。Transformer 就是这块积木：它把注意力连同几个必要配件，封装成一个固定结构的「标准层」，然后<b>反复堆几十到上百层</b>。</p>
  <div class="dd-note intuition"><b>一句话</b>　注意力是「引擎」，Transformer 是「把引擎装进一个可批量拼装的标准模块」。今天的大模型，就是这种模块摞起来的高塔。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>一层里的四件套<span class="dd-badge math">数学</span><span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">这块「标准积木」具体由什么组成？每层固定四件套。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 420 300" role="img" aria-label="一个 Transformer 层的结构：多头注意力、前馈、各配残差与层归一化">
      <line x1="210" y1="18" x2="210" y2="40" stroke="#6b7484" stroke-width="1.6" marker-end="url(#e1)"/>
      <text x="210" y="14" text-anchor="middle" class="svg-t">输入（一串向量）</text>
      <rect x="90" y="42" width="240" height="40" rx="8" fill="#21252d" stroke="#6b8cbe" stroke-width="2"/><text x="210" y="67" text-anchor="middle" class="svg-tn" font-size="13">多头注意力</text>
      <rect x="90" y="92" width="240" height="26" rx="6" fill="#1a1d23" stroke="#4f9d78"/><text x="210" y="110" text-anchor="middle" class="svg-t" font-size="12">＋残差　+　层归一化</text>
      <line x1="210" y1="82" x2="210" y2="92" stroke="#6b7484" stroke-width="1.4"/>
      <line x1="210" y1="118" x2="210" y2="132" stroke="#6b7484" stroke-width="1.4" marker-end="url(#e1)"/>
      <rect x="90" y="134" width="240" height="40" rx="8" fill="#21252d" stroke="#6b8cbe" stroke-width="2"/><text x="210" y="159" text-anchor="middle" class="svg-tn" font-size="13">前馈网络</text>
      <rect x="90" y="184" width="240" height="26" rx="6" fill="#1a1d23" stroke="#4f9d78"/><text x="210" y="202" text-anchor="middle" class="svg-t" font-size="12">＋残差　+　层归一化</text>
      <line x1="210" y1="174" x2="210" y2="184" stroke="#6b7484" stroke-width="1.4"/>
      <line x1="210" y1="210" x2="210" y2="228" stroke="#6b7484" stroke-width="1.6" marker-end="url(#e1)"/>
      <text x="210" y="246" text-anchor="middle" class="svg-t">输出 → 作为下一层的输入</text>
      <rect x="60" y="34" width="300" height="184" rx="12" fill="none" stroke="#2c313b" stroke-dasharray="4 4"/>
      <text x="372" y="128" class="svg-t" font-size="12" transform="rotate(90 372,128)">× N 层堆叠</text>
      <defs><marker id="e1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　一个 Transformer 层：先多头注意力、后前馈网络，两处各配一组残差连接与层归一化。这样的层原样堆叠 N 次，就是一个 Transformer。</figcaption>
  </figure>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>零件</th><th>做什么</th></tr></thead>
    <tbody>
      <tr><td><b>多头注意力</b></td><td>在位置之间传信息、汇总上下文（见「注意力机制」）</td></tr>
      <tr><td><b>前馈网络</b></td><td>对每个位置独立做非线性特征变换；部分事实关联可在其中被定位，但知识并不只存在这里</td></tr>
      <tr><td><b>残差连接</b></td><td>让输入直接绕过本层相加，是能堆到上百层的前提</td></tr>
      <tr><td><b>层归一化</b></td><td>稳定每层的数值分布，防止训练发散</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>两个主角、两个配件</b>　多头注意力和前馈网络是「干活」的主角（一个负责跨位置传信息，一个负责逐位置加工）；残差和层归一化像是「脚手架」——下一节会说明，正是这两个不起眼的配件，让「堆上百层」从不可能变成可能。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>为什么残差和层归一化缺一不可<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">注意力和前馈是主角，那两个「配件」为什么不能省？</p>
  <p>因为把很多层<b>直接</b>堆起来会立刻出问题：层一深，梯度在回传时会指数级衰减（这就是<b>梯度消失</b>），深层根本训不动。两个配件正是对症下药：</p>
  <ul class="dd-steps">
    <li><b>残差连接</b>给梯度开了条「直通车」——让输入原样绕过本层相加，梯度可以沿这条路直接传回浅层，绕开连乘衰减。</li>
    <li><b>层归一化</b>把每层的数值分布拉回可控范围，防止越传越大或越传越小、导致训练发散。</li>
  </ul>
  <div class="dd-note warn"><b>它们不是可有可无的装饰</b>　把 Transformer 的残差连接去掉再训练，模型往往在几层之后就<b>完全无法收敛</b>。这两个看起来像「工程补丁」的东西，实际上是深层网络能成立的<b>结构性前提</b>。（残差为什么这么关键，见「残差连接」「梯度消失」节点。）</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>一个容易忽略的点：位置编码<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">注意力既然只看内容匹配、不看位置，那模型到底怎么知道词的先后顺序？</p>
  <div class="dd-note warn"><b>先意识到一件反直觉的事</b>　不带任何位置表示的自注意力对输入排列是<b>等变的</b>：把 token 顺序打乱，输出也只会按同样顺序重排，机制本身无法区分先后。可「小明打小红」和「小红打小明」意思天差地别，所以词序信息必须<b>额外注入</b>。</div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 130" role="img" aria-label="打乱词序注意力结果相同，所以要位置编码">
      <g font-size="13">
        <rect x="30" y="30" width="60" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="60" y="49" text-anchor="middle" class="svg-tn" font-size="12">小明</text>
        <rect x="98" y="30" width="50" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="123" y="49" text-anchor="middle" class="svg-tn" font-size="12">打</text>
        <rect x="156" y="30" width="60" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="186" y="49" text-anchor="middle" class="svg-tn" font-size="12">小红</text>

        <rect x="330" y="30" width="60" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="360" y="49" text-anchor="middle" class="svg-tn" font-size="12">小红</text>
        <rect x="398" y="30" width="50" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="423" y="49" text-anchor="middle" class="svg-tn" font-size="12">打</text>
        <rect x="456" y="30" width="60" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="486" y="49" text-anchor="middle" class="svg-tn" font-size="12">小明</text>
      </g>
      <text x="123" y="86" text-anchor="middle" class="svg-t" font-size="12">这句</text>
      <text x="423" y="86" text-anchor="middle" class="svg-t" font-size="12">和这句</text>
      <text x="280" y="112" text-anchor="middle" class="svg-t" fill="#cf6f6f">只有注意力、无位置表示时，机制无法识别谁在前、谁在后</text>
    </svg>
    <figcaption>图 2　注意力对词序「无感」。所以 Transformer 在输入嵌入上额外叠加一层<b>位置编码</b>，把「你排第几」告诉每个词。位置编码怎么设计，还直接影响模型能否外推到训练时没见过的更长序列——这是长上下文模型的技术难点之一。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>三种搭法：编码器与解码器<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">同样一块标准积木，怎么搭出不同用途的模型？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>搭法</th><th>代表</th><th>擅长</th></tr></thead>
    <tbody>
      <tr><td>只用编码器</td><td>BERT 类</td><td><b>理解</b>：分类、抽取、判断（能同时看左右全文）</td></tr>
      <tr><td>只用解码器</td><td>GPT 类</td><td><b>生成</b>：逐词往下写，是当今大模型的主流</td></tr>
      <tr><td>编码器 + 解码器</td><td>T5 类</td><td><b>转换</b>：翻译、摘要等明确的「输入→输出」任务</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>差别主要在「能看到哪些词」</b>　编码器让每个位置能看到<b>左右全部</b>上下文，适合理解；解码器只让每个位置看<b>左边</b>（靠因果掩码），适合一个词一个词地生成——这正是大语言模型的做法（见其深读页）。同一套积木，靠「看的范围」不同，长出了不同的物种。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>模态无关：为什么它不止用于文本<span class="dd-badge intuition">直觉</span><span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">Transformer 是为语言设计的，可为什么图像、音频、甚至蛋白质也都在用它？</p>
  <p>关键在于：Transformer <b>不关心输入是什么，只关心「能不能变成一串向量（token）」</b>。把一张图切成一个个小方块、每块当作一个「词」，同一套 Transformer 就能处理视觉（这就是 ViT）；音频、视频、蛋白质序列同理。</p>
  <div class="dd-note key"><b>这正是多模态的重要技术前提</b>　文本、图像、音频都能表示成向量序列，因此可复用 Transformer 模块并建立跨模态注意力。实际系统既可能端到端统一，也可能组合专用编码器、投影器与语言模型；“同一架构可处理”不等于所有模态必须由同一组参数完成。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>为什么它改变了一切<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">一句话，Transformer 的历史意义到底是什么？</p>
  <p>它把序列建模，变成了一个<b>能吃满 GPU 并行能力</b>的任务。在它之前，模型规模主要受限于<b>训练时间</b>（RNN 只能一步步串行算）；在它之后，规模只受限于你有<b>多少张卡、多少数据</b>。</p>
  <div class="dd-note key"><b>它打通了通往规模的路</b>　正因为可并行、能高效地把模型和数据一起放大，<b>缩放定律</b>那条「越大越强」的路才走得通，才有了大语言模型（见其深读页）。可以说：注意力提供了能力，而 Transformer 把这能力变成了<b>可规模化</b>的工程现实——这才是它成为一切大模型骨架的原因。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>注意力只管「位置间传信息」，要搭成大模型，需要一块可无限堆叠的标准积木——Transformer。<span>（§1）</span></li>
    <li>每层四件套：多头注意力 + 前馈网络（两主角）+ 残差 + 层归一化（两配件）。<span>（§2）</span></li>
    <li>残差给梯度直通车、层归一化稳数值，正是它们让「堆上百层」得以成立。<span>（§3）</span></li>
    <li>注意力不知词序，所以要额外叠加位置编码。<span>（§4）</span></li>
    <li>只用编码器/只用解码器/两者都用，靠「能看到哪些词」搭出理解型、生成型、转换型。<span>（§5）</span></li>
    <li>它对模态无感，只要能切成 token 就能处理，于是成了多模态的前提。<span>（§6）</span></li>
    <li>它把序列建模变成可并行、可放大的任务，打通了通往缩放定律和大模型的路。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能说清「一层里四件套各自为什么必需」，并讲明「Transformer 相对注意力多做了什么、为什么这对大模型规模是决定性的」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>Transformer 就是注意力</td><td>注意力是核心机制；Transformer 是把它 + 前馈 + 残差 + 层归一化封装成的可堆叠层</td></tr>
      <tr><td>残差和层归一化是可选优化</td><td>是深层能训起来的<b>结构性前提</b>，去掉往往几层后就不收敛</td></tr>
      <tr><td>Transformer 自带词序感知</td><td>注意力对词序无感，词序靠额外的<b>位置编码</b>注入</td></tr>
      <tr><td>它只能处理文本</td><td>对模态无感，图像/音频切成 token 就能用同一套（多模态的前提）</td></tr>
      <tr><td>层数越多一定越好</td><td>更深提高潜力也提高优化难度与推理延迟，需要平衡</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>注意力已经能在位置间传信息，Transformer 在它之上多做了什么？</li>
    <li>一层里的四件套分别是什么？两个「主角」和两个「配件」各负责什么？</li>
    <li>为什么残差连接和层归一化不能省？去掉会怎样？</li>
    <li>为什么说注意力「不知道词序」？Transformer 怎么解决？</li>
    <li>只用编码器、只用解码器、两者都用，分别擅长什么？根本差别在哪？</li>
    <li>为什么图像、音频也能用 Transformer？这和多模态有什么关系？</li>
    <li>用一句话说明：Transformer 为什么是「打通通往大模型规模之路」的关键？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>把注意力连同必要配件封装成一个可反复堆叠的标准层，让信息逐层被加工得更抽象，从而能搭成深层大模型。</li>
      <li>多头注意力负责跨位置传信息，前馈网络负责逐位置非线性变换；残差连接提供稳定的信息与梯度路径，层归一化控制激活尺度。知识由整个网络的分布式参数共同承载。</li>
      <li>直接堆深会梯度消失、深层训不动；残差让梯度绕开连乘、层归一化控住数值尺度，去掉往往几层后就无法收敛。</li>
      <li>因为不带位置表示的注意力对排列等变，无法区分先后；Transformer 通过绝对、相对或旋转等位置表示注入顺序。</li>
      <li>编码器擅长理解、解码器擅长生成、两者都用擅长转换；根本差别是每个位置「能看到哪些词」（左右全文 vs 只看左边）。</li>
      <li>因为它只要求输入能切成 token 序列、对模态无感；图像切块当词就能处理，于是能用同一套架构统一处理多种模态，这是多模态的前提。</li>
      <li>它把序列建模变成能吃满 GPU 并行的任务，使模型和数据可一起放大，缩放定律那条路才走得通。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>注意力机制、神经网络、残差连接、梯度消失、嵌入</td></tr>
      <tr><td><b>本页核心</b></td><td>可堆叠标准层、四件套、位置编码、编码器/解码器变体、模态无关</td></tr>
      <tr><td>紧邻延伸</td><td>大语言模型、缩放定律、多模态、上下文窗口</td></tr>
      <tr><td>更远</td><td>混合专家 MoE、推理优化、预训练、微调</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Vaswani et al., Attention Is All You Need</a>：原始架构、缩放点积注意力、位置编码与并行性。</li>
    <li><a href="https://arxiv.org/abs/2205.14135" target="_blank" rel="noopener">Dao et al., FlashAttention</a>：标准注意力的内存访问瓶颈与精确高效实现。</li>
    <li><a href="https://arxiv.org/abs/2002.04745" target="_blank" rel="noopener">Xiong et al., On Layer Normalization in the Transformer Architecture</a>：Pre-LN/Post-LN 差异，说明“标准层”存在重要变体。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-21</div>
</div>
`
};
