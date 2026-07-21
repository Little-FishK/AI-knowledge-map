/* 理解原理页 —— 预训练 Pre-training
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["pretraining"] = {
  title: "预训练",
  subtitle: "在海量无标注文本上自监督学习，一次性把「通用能力」灌进模型",
  aliases: "Pre-training · 预训练",
  meta: "建议 20–30 分钟 · 中级 · 需要：了解「自监督/监督学习」「大语言模型」",
  thesis: "预训练让模型从大规模数据中学习可迁移表示与生成规律，是基础模型能力的重要来源。自回归模型常做下一 token 预测，编码器也可用掩码预测，多模态模型还会混合对比、重建等目标。数据筛选、去重、配比与训练计算同样关键；后训练则进一步塑造指令遵循、偏好与安全行为。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>为什么「预」</b>——为什么不直接针对任务训练，而要先来一步「预」训练。</li>
    <li><b>怎么训</b>——这份「通用底子」具体是怎么学出来的。</li>
    <li><b>凭什么</b>——只是预测下一个词，怎么就灌进了语言、常识、推理。</li>
    <li><b>产出什么</b>——预训练完，得到的是能直接用的助手吗。</li>
    <li><b>为什么贵</b>——为什么只有少数机构做得起预训练。</li>
  </ul>
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>为什么要「预」训练<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：为什么不直接拿任务数据训练，非要先来一步「预」训练？</p>
  <p>直接针对某个任务训练，要专门标注的数据，而且学到的只有那一小块本事。预训练换了个两段式的思路：<b>先</b>在海量通用数据上学出一个「通用底子」（语言怎么用、世界大致什么样），<b>再</b>针对具体任务做少量调整。「预」，就是「在面对具体任务之前，先打好通用基础」。</p>
  <div class="dd-note intuition"><b>先通才，后专才</b>　这就像人先接受多年通识教育（预训练），再做岗前专项培训（微调）。通识那一步最贵、最耗时，但一次做好，之后各种专项都能快速上手。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它具体怎么训<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">这份「通用底子」，是怎么从数据里学出来的？</p>
  <p>核心是<b>从数据本身构造监督信号</b>。自回归模型预测下一 token，BERT 类编码器预测被遮住的 token，多模态系统还会用图文对比或重建目标。以自回归为例，用交叉熵衡量预测分布与真实下一 token 的差距，再用梯度下降更新参数。它减少了逐样本人工标签需求，但高质量数据并非无限：采集许可、清洗、去重、语言与领域配比都会直接影响能力、偏见和记忆风险。</p>
  <div class="dd-note math"><b>一句话</b>　预训练 = <b>在尽可能多的文本上，反复做「预测下一个词」这一个自监督任务</b>。简单到反直觉，却是整座大厦的地基。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>凭什么这一步能灌进这么多能力<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的疑问：只是预测下一个词，怎么就学到了语法、常识，甚至推理？</p>
  <p>因为<b>要把下一个词猜准，往往被迫理解到位</b>：续写推理就得会推理，续写代码就得懂语法，续写对话就得建模意图。于是「预测下一个词」暗中要求模型掌握语言、事实、逻辑——这些能力不是被显式教的，而是为了把词猜得更准，<b>作为副产品被逼出来的</b>（这一点在「大语言模型」深读页第 6 节讲透）。</p>
  <div class="dd-note intuition"><b>规模是前提</b>　这些能力只有当预训练的<b>规模足够大</b>（参数、数据、算力按比例一起放大）时才充分涌现。「越大越强」这条经验规律叫<b>缩放定律</b>，正是它让「不断把预训练做大」成了可以持续下注的方向。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>产出的是「基座模型」<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">预训练跑完，我们是不是就得到一个能用的助手了？</p>
  <div class="dd-note warn"><b>还不是。</b>　预训练结束时得到的是<b>基座模型（base model）</b>：知识渊博，但<b>不听话</b>——你问它一个问题，它可能顺着续写出<b>更多问题</b>，而不是回答。因为它只学了「文本通常怎么接下去」，没学「被提问时应该回答」。</div>
  <p>要把基座变成能对话的助手，还要两步：<b>指令微调</b>教它「被问就答」，<b>偏好对齐</b>教它答得有用又安全（见「微调」「对齐」深读页）。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 110" role="img" aria-label="从海量文本到基座模型再到助手">
      <rect x="20" y="40" width="120" height="40" rx="8" fill="#21252d" stroke="#6b7484"/><text x="80" y="58" text-anchor="middle" class="svg-t" font-size="11">海量无标注文本</text><text x="80" y="73" text-anchor="middle" class="svg-t" font-size="10">近乎无限</text>
      <line x1="140" y1="60" x2="175" y2="60" stroke="#6b7484" stroke-width="1.4" marker-end="url(#j1)"/>
      <text x="200" y="47" text-anchor="middle" class="svg-t" font-size="10">预训练</text><text x="200" y="76" text-anchor="middle" class="svg-t" font-size="10">自监督</text>
      <rect x="230" y="40" width="120" height="40" rx="8" fill="#21252d" stroke="#6b8cbe" stroke-width="2"/><text x="290" y="58" text-anchor="middle" class="svg-tn" font-size="11">基座模型</text><text x="290" y="73" text-anchor="middle" class="svg-t" font-size="10">博学 · 不听话</text>
      <line x1="350" y1="60" x2="385" y2="60" stroke="#6b7484" stroke-width="1.4" marker-end="url(#j1)"/>
      <text x="410" y="47" text-anchor="middle" class="svg-t" font-size="10">微调</text><text x="410" y="76" text-anchor="middle" class="svg-t" font-size="10">+对齐</text>
      <rect x="440" y="40" width="110" height="40" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="495" y="58" text-anchor="middle" class="svg-tn" font-size="11">对话助手</text><text x="495" y="73" text-anchor="middle" class="svg-t" font-size="10">听话 · 安全</text>
      <defs><marker id="j1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　预训练负责灌进「知识与能力」，得到博学但不听话的基座；微调与对齐负责校准「行为」，把基座变成你日常用的助手。三步缺一不可。</figcaption>
  </figure>
  <div class="dd-note key"><b>分工记住这一句</b>　<b>预训练给「会什么」，微调对齐给「怎么表现」。</b>模型的绝大部分知识和能力，都是预训练那一步灌进去的。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>它为什么这么贵<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">既然预训练这么关键，为什么不是人人都能做？</p>
  <p>前沿通用模型的从头预训练会消耗大规模数据、加速器集群与长期工程投入，成本通常只有少数机构能承担；但“小模型预训练”并非绝对做不起。总训练预算还要在参数量与 token 数之间分配，Chinchilla 等工作表明：只增参数而训练数据不足，并非计算最优。</p>
  <div class="dd-note intuition"><b>这也正是「微调」存在的理由</b>　既然预训练这么贵，绝大多数人不会从头来，而是<b>站在别人预训练好的模型上做微调</b>（迁移学习）——花很小的代价，就借用了那份天价的通用底子（见「微调」深读页）。预训练与微调，是「一次昂贵的通才养成」和「无数次廉价的专才适配」的分工。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>针对任务直接训练又贵又窄，于是先学通用底子、再适配任务——这就是「预」训练。<span>（§1）</span></li>
    <li>它用数据自身构造监督信号：自回归模型预测下一 token，其他架构也可用掩码、对比或重建目标，因此能利用大规模弱标注数据。<span>（§2）</span></li>
    <li>猜词逼理解，加上规模，语言/常识/推理作为副产品被灌进模型。<span>（§3）</span></li>
    <li>产出的是博学但不听话的基座，还需微调+对齐才成助手。<span>（§4）</span></li>
    <li>预训练同时吃海量数据、算力、时间，极贵，所以大多数人转而在基座上微调。<span>（§5）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「预训练为什么能不用标注就学到这么多」，并说出「基座模型和对话助手差在哪两步」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>预训练需要大量人工标注</td><td>是<b>自监督</b>，答案来自文本本身，不用人标</td></tr>
      <tr><td>预训练完就是 ChatGPT</td><td>得到的是不听话的基座，还需指令微调和对齐</td></tr>
      <tr><td>模型的能力主要靠微调</td><td>绝大部分知识和能力来自预训练；微调主要改行为</td></tr>
      <tr><td>预训练目标很复杂</td><td>就一个简单目标：预测下一个词；复杂的是规模</td></tr>
      <tr><td>谁都能预训练一个大模型</td><td>需海量数据+算力+时间，极贵；多数人做微调</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>为什么要先「预」训练，而不是直接针对任务训练？</li>
    <li>预训练用什么目标、什么监督方式？为什么能用海量数据？</li>
    <li>只是预测下一个词，为什么能灌进语言、常识、推理？规模起什么作用？</li>
    <li>预训练产出的「基座模型」为什么还不能当助手用？还差哪两步？</li>
    <li>预训练为什么贵？这和「微调」的流行有什么关系？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>直接针对任务训练要标注、且只学一小块；先学通用底子再适配任务，通用那步一次做好、之后各任务都能快速上手。</li>
      <li>监督信号来自数据自身：可预测下一 token、遮住的 token，或使用对比/重建目标。这样减少人工标签需求，但数据仍受质量、许可、去重和配比约束。</li>
      <li>因为猜准下一个词往往被迫理解语法/事实/逻辑，能力作为副产品被逼出；规模足够大时这些能力才充分涌现（缩放定律）。</li>
      <li>基座只学了「文本怎么接」，不会「被问就答」；还需指令微调（教对话）和偏好对齐（教有用又安全）。</li>
      <li>因为它同时吃海量数据、成千上万显卡、数月时间；正因如此，多数人不从头预训练，而在别人的基座上做廉价的微调。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>监督学习、自监督学习、大语言模型、Transformer</td></tr>
      <tr><td><b>本页核心</b></td><td>两段式（预训练→微调）、自监督预测下一个词、基座模型、通才 vs 专才</td></tr>
      <tr><td>紧邻延伸</td><td>缩放定律、微调、对齐、指令微调</td></tr>
      <tr><td>更远</td><td>合成数据、蒸馏、量化与部署</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noopener">Brown et al., Language Models are Few-Shot Learners</a>：自回归预训练与上下文学习。</li>
    <li><a href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noopener">Devlin et al., BERT</a>：掩码语言建模说明预训练目标并不只有下一 token 预测。</li>
    <li><a href="https://arxiv.org/abs/2203.15556" target="_blank" rel="noopener">Hoffmann et al., Training Compute-Optimal Large Language Models</a>：模型规模与训练 token 数的计算最优权衡。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-21</div>
</div>
`
};
