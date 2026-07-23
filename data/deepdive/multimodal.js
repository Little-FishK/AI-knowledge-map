/* 理解原理页 —— 多模态 Multimodal
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["multimodal"] = {
  title: "多模态",
  subtitle: "让一个模型同时看懂图、听懂声、读懂字",
  aliases: "Multimodal · 多模态大模型",
  meta: "建议 25–35 分钟 · 中级 · 需要：了解「Transformer」「嵌入」的基本概念",
  thesis: "多模态指一个模型同时处理文本、图像、音频、视频等不同「模态」的信息。它靠两块基石成立：<b>Transformer 对模态无感</b>（什么都能切成 token），以及把不同模态<b>对齐到同一个语义空间</b>（让「猫的图」和「猫」这个词靠得近）。模态一旦打通，图文问答、文生图、看屏幕操作界面才成为可能。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>为什么要</b>——为什么用一个模型统一处理图文声，而不是各用各的。</li>
    <li><b>凭什么能</b>——为语言设计的架构，凭什么能吃图像和声音。</li>
    <li><b>灵魂在哪</b>——图的 token 和文的 token，怎么让模型知道它们说的是同一件事。</li>
    <li><b>怎么接上</b>——一个会说话的模型，怎么长出「眼睛」。</li>
    <li><b>解锁了什么</b>——模态打通后，哪些以前做不到的事成为可能。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　给模型一张<b>「猫趴在键盘上」的照片</b>，问它「图里在干什么？」。要答对，它必须<b>同时</b>理解图像的内容和文字的问题，还要把两者对应起来。这一件小事，需要本页讲的全部机制。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>为什么要「多模态」<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：为什么要费劲让一个模型同时处理图、文、声，而不是各任务各训一个专用模型？</p>
  <p>两个理由。其一，<b>现实任务本就是跨模态的</b>：看图说话、听声辨物、读带插图的文档——把图文声完全割裂会丢失联系。其二，把不同模态接入<b>同一模型系统</b>后，可以联合条件化并做跨模态推理。这里的“同一系统”可能是端到端统一模型，也可能由专用编码器、投影器、适配器和语言模型模块组成。</p>
  <div class="dd-note intuition"><b>一句话</b>　多模态不是「把几个模型拼在一起」，而是让<b>一个模型</b>在一个统一的表示里，同时容纳并关联不同模态——这才有「1 + 1 &gt; 2」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>第一块基石：Transformer 对模态无感<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">Transformer 是为语言设计的，凭什么能拿来处理图像和声音？</p>
  <p>因为它<b>不关心输入是什么，只关心「能不能切成一串 token（向量）」</b>。把一张图切成一个个小方块、每块当作一个「词」，把音频切成一帧帧，同一套 Transformer 就能照单处理（见「Transformer」深读页第 6 节）。这块基石解决了「<b>能不能一起算</b>」的问题。</p>
  <div class="dd-note warn"><b>但「能一起算」不等于「懂它们是一回事」</b>　把猫的图切成 token、把「猫」这个字也变成 token，塞进同一个模型——它们此刻只是两串各说各话的数字。模型凭什么知道<b>这串图 token 和那个字，指的是同一个东西</b>？这就要第二块基石。</p></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>第二块基石：把不同模态对齐到同一个语义空间<span class="dd-badge math">数学</span><span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">核心的一节：怎么让「猫的图」和「猫」这个词，在模型眼里对应上？</p>
  <p>一种重要方法是学习<b>可比较的跨模态表示</b>：让配对的图文向量靠近、不配对的推远，这正是 CLIP 的路线。但多模态系统不一定把所有 token 永久压进单一共享空间；也可以保留视觉特征，再通过投影器或交叉注意力把它们接入语言模型。共同目标是<b>建立可学习的模态对齐与信息通道</b>。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 220" role="img" aria-label="图像和文本被映射到同一个语义空间并对齐">
      <rect x="20" y="40" width="110" height="40" rx="6" fill="#21252d" stroke="#a86fa8"/><text x="75" y="65" text-anchor="middle" class="svg-t" font-size="12">图：猫</text>
      <rect x="20" y="140" width="110" height="40" rx="6" fill="#21252d" stroke="#6b8cbe"/><text x="75" y="165" text-anchor="middle" class="svg-t" font-size="12">字：「猫」</text>
      <line x1="130" y1="60" x2="300" y2="95" stroke="#6b7484" stroke-width="1.4" marker-end="url(#f1)"/>
      <line x1="130" y1="160" x2="300" y2="110" stroke="#6b7484" stroke-width="1.4" marker-end="url(#f1)"/>
      <rect x="300" y="30" width="240" height="160" rx="8" fill="none" stroke="#2c313b"/>
      <text x="420" y="24" text-anchor="middle" class="svg-t" font-size="11">共享语义空间</text>
      <circle cx="360" cy="100" r="6" fill="#a86fa8"/><circle cx="378" cy="108" r="6" fill="#6b8cbe"/>
      <text x="360" y="135" text-anchor="middle" class="svg-t" font-size="11" fill="#4f9d78">猫图 与「猫」→ 靠在一起</text>
      <circle cx="480" cy="60" r="6" fill="#a86fa8"/><circle cx="498" cy="68" r="6" fill="#6b8cbe"/>
      <text x="490" y="48" text-anchor="middle" class="svg-t" font-size="11">车图 与「汽车」</text>
      <defs><marker id="f1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　对齐：不同模态各有自己的编码器，但都被映射进<b>同一个</b>语义空间，让「猫的图」和「猫」这个词落在相近的位置。有了对齐，图 token 和字 token 才「说同一种语言」。</figcaption>
  </figure>
  <div class="dd-note math"><b>CLIP 就是干这个的</b>　用海量「图 + 对应文字说明」的配对，训练两个编码器（一个看图、一个读文），<b>让配对的图和文向量靠拢、不配对的推开</b>——正是「嵌入」里那套对比训练，只不过跨了模态。训练完，图和文就共享了一个空间。这也是文生图能「按文字找到对应画面」的地基（见「CLIP」「图像生成」节点）。</div>
  <div class="dd-note key"><b>数值例子：对齐如何变成可比较分数</b>　设猫图向量 <code>v=(0.8,0.6)</code>，文本“猫”向量 <code>t₁=(1,0)</code>，文本“键盘”向量 <code>t₂=(0.6,0.8)</code>，三者长度都为 1。余弦相似度为点积：<code>v·t₁=0.8</code>，<code>v·t₂=0.96</code>。这张“猫趴键盘”的局部视觉表示会更匹配“键盘”。训练会提高正确图文配对相对批内错误配对的分数；但单个相似度不是概率，也不保证模型能数清键帽或理解空间关系。</div>
  <div class="dd-note key"><b>对齐是多模态的灵魂</b>　Transformer 让不同模态<b>能一起算</b>，对齐让它们<b>说同一种语言</b>。没有对齐，多模态就只是几串互不相干的 token 硬凑在一起。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>怎么把「看」接到「说」上<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">具体到一个已经很会说话的大语言模型，怎么让它长出「眼睛」？</p>
  <p>一种主流做法很直接：用一个<b>视觉编码器</b>把图像变成一串「视觉 token」，再用一个投影层把它们<b>对齐进大模型的词向量空间</b>，当成一些特殊的「词」<b>拼在文字 token 前面</b>，一起喂给大模型。于是大模型能像「读文字」一样「读」这张图，然后照常自回归地生成回答。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 120" role="img" aria-label="视觉编码器把图变成视觉token，和文字token一起喂给大模型">
      <rect x="20" y="45" width="70" height="34" rx="6" fill="#21252d" stroke="#a86fa8"/><text x="55" y="66" text-anchor="middle" class="svg-t" font-size="12">图像</text>
      <line x1="90" y1="62" x2="120" y2="62" stroke="#6b7484" stroke-width="1.4" marker-end="url(#g1)"/>
      <rect x="120" y="45" width="90" height="34" rx="6" fill="#1a1d23" stroke="#6b8cbe"/><text x="165" y="66" text-anchor="middle" class="svg-t" font-size="11">视觉编码器</text>
      <line x1="210" y1="62" x2="240" y2="62" stroke="#6b7484" stroke-width="1.4" marker-end="url(#g1)"/>
      <rect x="240" y="45" width="90" height="34" rx="6" fill="#21252d" stroke="#4f9d78"/><text x="285" y="66" text-anchor="middle" class="svg-t" font-size="11">视觉 token</text>
      <text x="285" y="98" text-anchor="middle" class="svg-t" font-size="11" fill="#6b7484">＋文字 token</text>
      <line x1="330" y1="62" x2="360" y2="62" stroke="#6b7484" stroke-width="1.4" marker-end="url(#g1)"/>
      <rect x="360" y="40" width="90" height="44" rx="8" fill="#1a1d23" stroke="#6b8cbe" stroke-width="2"/><text x="405" y="66" text-anchor="middle" class="svg-tn" font-size="12">大模型</text>
      <line x1="450" y1="62" x2="480" y2="62" stroke="#6b7484" stroke-width="1.4" marker-end="url(#g1)"/>
      <text x="518" y="66" text-anchor="middle" class="svg-t" font-size="11">答案</text>
      <defs><marker id="g1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 2　给大模型装眼睛的常见做法：图像 → 视觉编码器 → 视觉 token（投影进词向量空间）→ 和文字 token 拼在一起 → 喂给大模型。模型于是能「边看图边答话」。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>模态打通，解锁了什么<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">把图文声接进同一个模型后，哪些以前做不到的事成为可能？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>能力</th><th>靠什么</th></tr></thead>
    <tbody>
      <tr><td>图文问答、读懂文档里的图表</td><td>同一模型里图文对齐、联合推理</td></tr>
      <tr><td>文生图 / 文生视频</td><td>文本与图像在共享空间对齐，才能「按文字找到画面」（见「图像生成」）</td></tr>
      <tr><td>Agent 看屏幕、操作界面</td><td>把界面截图当作视觉输入来理解（见「计算机操作」「AI Agent」）</td></tr>
      <tr><td>无障碍：读图给视障者、语音交互</td><td>跨模态转换（图→文、文→声）</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>它是 LLM 的自然扩展</b>　多模态大模型，可以看成给大语言模型<b>加装了处理其它模态的入口和对齐</b>——核心的「理解与生成」还是那套（见「大语言模型」深读页）。这也是为什么今天主流模型几乎都是原生多模态的。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>代价与挑战<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">它有什么新的坑，是纯文本模型没有的？</p>
  <ul class="dd-steps">
    <li><b>对齐质量决定上限</b>：图文对齐得不好，模型就会「看错」；多模态的成败，很大程度取决于对齐训练的数据与质量。</li>
    <li><b>信息密度差异大</b>：一张高清图的信息量远超一句话，切成 token 后又长又贵，处理长视频尤其吃算力。</li>
    <li><b>幻觉在图上照样有</b>：模型可能把图里<b>根本没有</b>的东西说得有鼻子有眼（「图中有只狗」——其实没有）。它描述的仍是「最可能的说法」，不是「看到的事实」。</li>
  </ul>
  <div class="dd-note warn"><b>别把它当「客观的眼睛」</b>　多模态模型「看图说话」，本质还是在生成最可能的文本，只不过多了图像作为条件。它<b>会看错、会脑补</b>，关键场景仍需核对，别把它的描述当成对图像的客观读数。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">现在从“现实任务跨模态”一路推到“为什么统一 token 之后仍需要对齐和验证”。</p>
  <ol class="dd-chain">
    <li>现实任务跨模态，且一个模型统一处理能让不同模态互相印证——所以要多模态。<span>（§1）</span></li>
    <li>第一块基石：Transformer 对模态无感，什么都能切成 token 一起算。<span>（§2）</span></li>
    <li>但「能一起算」不等于「懂它们是一回事」，所以需要第二块基石。<span>（§2→3）</span></li>
    <li>第二块基石：建立跨模态对齐；可以是 CLIP 式共享表示，也可以是投影器或交叉注意力连接。<span>（§3）</span></li>
    <li>工程上，用视觉编码器把图变成视觉 token、投影进词向量空间，和文字 token 一起喂给大模型。<span>（§4）</span></li>
    <li>模态打通后解锁图文问答、文生图、看屏幕操作、无障碍等。<span>（§5）</span></li>
    <li>但对齐质量决定上限、信息密度差异大、图上也会幻觉。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能说清「多模态靠哪两块基石成立」，尤其能讲明「为什么‘对齐到同一个语义空间’才是灵魂」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">下面这些说法分别混淆了统一计算接口、共享表示、模块化系统和客观感知。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>多模态就是把几个专用模型拼起来</td><td>是让<b>一个</b>模型在统一表示里容纳并关联多种模态</td></tr>
      <tr><td>能把图切成 token 就算多模态了</td><td>还必须把模态<b>对齐</b>到同一语义空间，否则各说各话</td></tr>
      <tr><td>它像人一样「看到」图像</td><td>它把图像当条件来生成最可能的文本，会看错、会脑补</td></tr>
      <tr><td>多模态是全新的架构</td><td>多是给大语言模型加装模态入口与对齐，核心仍是那套理解与生成</td></tr>
      <tr><td>看图描述可当作客观读数</td><td>图上也有幻觉，关键场景需核对</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>为什么要用一个模型处理多模态，而不是各模态各训一个？</li>
    <li>Transformer 凭什么能处理图像和音频？这解决了多模态的哪一半问题？</li>
    <li>「能一起算」为什么不等于「懂它们是一回事」？还差什么？</li>
    <li>什么是模态对齐？CLIP 是怎么做对齐的？</li>
    <li>工程上，怎么给一个大语言模型「装上眼睛」？</li>
    <li>模态打通后，举出至少三种被解锁的能力。</li>
    <li>为什么说多模态模型「看图说话」时仍会幻觉？该如何对待它的描述？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>现实任务跨模态；一个模型统一处理能让不同模态互相印证、补充、做跨模态推理，比拼装更强。</li>
      <li>因为它只要求输入能切成 token 序列、对模态无感；这解决了「能不能一起算」的问题。</li>
      <li>因为不同模态的 token 此刻只是各说各话的数字，模型不知道它们指同一事物；还差把它们对齐到同一语义空间。</li>
      <li>让不同模态描述同一事物的向量落到同一空间且靠近；CLIP 用海量图文配对做对比训练，让配对的图文向量靠拢、不配对的推开。</li>
      <li>用视觉编码器把图变成视觉 token，投影进词向量空间，和文字 token 拼在一起喂给大模型，模型便能边看边答。</li>
      <li>图文问答/读图表、文生图或文生视频、Agent 看屏幕操作界面、读图给视障者等无障碍应用。</li>
      <li>因为它本质是把图当条件生成最可能的文本、而非客观读取图像，会把图里没有的东西说得有；关键场景需核对，别当客观读数。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>Transformer、嵌入、Token 与分词、大语言模型</td></tr>
      <tr><td><b>本页核心</b></td><td>模态无感、共享语义空间、模态对齐、视觉编码器接入</td></tr>
      <tr><td>紧邻延伸</td><td>CLIP、图像生成、计算机操作、AI Agent</td></tr>
      <tr><td>更远</td><td>视频生成、语音识别与合成、世界模型</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2103.00020" target="_blank" rel="noopener">Radford et al., CLIP</a>：图文对比学习与共享表示空间。</li>
    <li><a href="https://arxiv.org/abs/2204.14198" target="_blank" rel="noopener">Alayrac et al., Flamingo</a>：视觉编码器、跨注意力与语言模型的模块化组合。</li>
    <li><a href="https://arxiv.org/abs/2304.08485" target="_blank" rel="noopener">Liu et al., LLaVA</a>：视觉指令微调与视觉投影连接器。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-22</div>
</div>
`
};
