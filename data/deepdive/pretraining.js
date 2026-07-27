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
  <p><b>把任务说完整：</b>预训练输入的是大规模通用数据和一个尚未学会任务规律的模型，输出是一份可继续微调或直接用于表示提取的参数检查点。训练过程中，模型反复从数据自身构造目标、计算损失并更新参数；我们要通过留出集损失和多类能力评测判断“通用底子”是否形成，而不能只看训练损失。它适合复用广泛规律，但若目标领域与预训练数据相差很远，仍需领域适配，甚至应选择专用模型。</p>
  <div class="dd-note intuition"><b>先通才，后专才</b>　这就像人先接受多年通识教育（预训练），再做岗前专项培训（微调）。通识那一步最贵、最耗时，但一次做好，之后各种专项都能快速上手。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它具体怎么训<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">这份「通用底子」，是怎么从数据里学出来的？</p>
  <p>核心是<b>从数据本身构造监督信号</b>。自回归模型预测下一 token，BERT 类编码器预测被遮住的 token，多模态系统还会用图文对比或重建目标。以自回归为例，用交叉熵衡量预测分布与真实下一 token 的差距，再用梯度下降更新参数。它减少了逐样本人工标签需求，但高质量数据并非无限：采集许可、清洗、去重、语言与领域配比都会直接影响能力、偏见和记忆风险。</p>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>预训练目标</th><th>输入怎样构造</th><th>模型输出什么</th><th>适用重点</th></tr></thead><tbody><tr><td>下一 token 预测</td><td>给定左侧前缀</td><td>下一 token 的词表概率</td><td>自回归生成模型</td></tr><tr><td>掩码预测</td><td>遮住序列中的部分 token</td><td>被遮位置的词表概率</td><td>双向编码表示</td></tr><tr><td>对比或重建</td><td>配对视图，或被破坏的样本</td><td>匹配分数，或还原后的样本</td><td>视觉与多模态表示</td></tr></tbody></table></div>
  <p>三者都在解决“怎样让原始数据自己提供学习目标”，却不是可以随意互换的同一算法。目标决定模型每次能看见什么、输出什么，也影响它更擅长生成、编码还是跨模态匹配。验证时必须使用与目标相符的留出数据，并额外检查数据泄漏、重复样本和目标与下游任务的错位。</p>
  <div class="dd-note math"><b>一句话</b>　预训练 = <b>在尽可能多的文本上，反复做「预测下一个词」这一个自监督任务</b>。简单到反直觉，却是整座大厦的地基。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>手算一次 next-token 训练信号<span class="dd-badge math">数值例子</span></h2>
  <p class="dd-lead">一句文本怎样同时产生多个训练样本，预测变准又怎样让损失下降？</p>
  <p>文本 <code>猫 喜欢 鱼 &lt;EOS&gt;</code> 经过右移，会产生三次预测：看到“猫”预测“喜欢”，看到“猫 喜欢”预测“鱼”，再预测结束符。假设模型给三个正确 token 的概率依次为 0.50、0.25、0.80：</p>
  <table class="dd-table"><thead><tr><th>前缀</th><th>正确下一个 token</th><th>正确概率 p</th><th>损失 −ln p</th></tr></thead><tbody><tr><td>猫</td><td>喜欢</td><td>0.50</td><td>0.693</td></tr><tr><td>猫 喜欢</td><td>鱼</td><td>0.25</td><td>1.386</td></tr><tr><td>猫 喜欢 鱼</td><td>&lt;EOS&gt;</td><td>0.80</td><td>0.223</td></tr></tbody></table>
  <div class="dd-formula" data-formula-id="pretraining-cross-entropy-perplexity" data-display="mathml"><math display="block" aria-label="平均交叉熵等于三个位置负对数概率的平均，约为零点七六七；困惑度等于平均交叉熵的指数，约为二点一五"><mtable><mtr><mtd><mover><mi>L</mi><mo>¯</mo></mover><mo>=</mo><mo>−</mo><mfrac><mn>1</mn><mn>3</mn></mfrac><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mn>3</mn></munderover><mi>ln</mi><mo> </mo><msub><mi>p</mi><mi>t</mi></msub><mo>=</mo><mfrac><mrow><mn>0.693</mn><mo>+</mo><mn>1.386</mn><mo>+</mo><mn>0.223</mn></mrow><mn>3</mn></mfrac><mo>≈</mo><mn>0.767</mn></mtd></mtr><mtr><mtd><mi>PPL</mi><mo>=</mo><mi>exp</mi><mo>(</mo><mover><mi>L</mi><mo>¯</mo></mover><mo>)</mo><mo>=</mo><mi>exp</mi><mo>(</mo><mn>0.767</mn><mo>)</mo><mo>≈</mo><mn>2.15</mn></mtd></mtr></mtable></math></div>
  <p class="dd-formula-note"><b>符号说明：</b><code>L̄</code> 是三个预测位置的平均交叉熵，<code>t</code> 是位置编号，<code>pₜ</code> 是模型在位置 t 分给正确 token 的概率，<code>ln</code> 是自然对数。<code>PPL</code> 是困惑度，<code>exp</code> 是以自然常数 e 为底的指数函数，正好把平均负对数损失变回概率尺度；在相同分词器和数据上，PPL 越小通常表示模型越会预测后续。</p>
  <p>第二个位置最不确定，贡献最大损失。反向传播会同时调整共享参数，使相似上下文下正确 token 的 logit 相对上升。若一次更新后“鱼”的概率从 0.25 升到 0.50，该位置损失就从 1.386 降到 0.693。</p>
  <figure class="dd-fig"><svg viewBox="0 0 700 250" role="img" aria-label="同一文本右移产生三个下一 token 训练目标"><defs><marker id="pre-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker></defs><g class="svg-t"><text x="55" y="60">猫</text><text x="170" y="60">喜欢</text><text x="300" y="60">鱼</text><text x="405" y="60">&lt;EOS&gt;</text><text x="55" y="125">输入前缀逐步增长</text><text x="55" y="190">每个位置都有一个监督目标</text></g><g stroke-width="3" fill="none" marker-end="url(#pre-a)"><path d="M75 70C105 100 140 100 165 70" stroke="#8b5cf6"/><path d="M195 70C220 100 270 100 295 70" stroke="#0ea5e9"/><path d="M320 70C340 100 380 100 400 70" stroke="#10b981"/></g><g class="svg-t"><text x="105" y="145">预测“喜欢”</text><text x="255" y="145">预测“鱼”</text><text x="420" y="145">预测结束</text></g></svg><figcaption>训练不是每段文本只给一个标签；长度为 L 的序列通常贡献约 L 个 next-token 监督位置，因此大规模原始文本可自动产生密集训练信号。</figcaption></figure>
  <div class="dd-note warn"><b>低困惑度不等于事实更真或助手更好。</b>它只表示在评测文本分布上更会预测 token；数据污染、记忆、风格捷径和任务错位都可能让该指标与真实能力分离。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>凭什么这一步能灌进这么多能力<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的疑问：只是预测下一个词，怎么就学到了语法、常识，甚至推理？</p>
  <p>因为要降低许多不同文本上的预测误差，模型必须形成能复用的语法、语义、代码结构和事实共现表示：只背某一句，无法解释大量新前缀。输入是跨主题的大规模样本，训练直接输出的是更低损失和更新后的内部表示；翻译、代码或推理成绩，是这些表示被提示和评测任务调用后的外部表现。</p>
  <p>这里不能把“会续写推理文本”直接等同于可靠推理。模型可能复用了抽象规律，也可能记住模板或利用表面线索。若新组合题、反事实题和分布外样本仍能稳定答对，才有更强的泛化证据；若只在熟悉格式上成功，就不能声称学到了通用算法。</p>
  <div class="dd-note intuition"><b>规模怎样读</b>　增加参数、数据和算力，通常能平滑降低预测损失，并可能使某些能力越过可用阈值；这类经验关系称为<b>缩放定律</b>。但规模不是充分条件：数据质量、目标设计、模型结构和评测口径都会改变结果，“更大”也不保证事实可靠或对所有群体更公平。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>产出的是「基座模型」<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">预训练跑完，我们是不是就得到一个能用的助手了？</p>
  <div class="dd-note warn"><b>还不是。</b>　预训练结束时得到的是<b>基座模型（base model）</b>：知识渊博，但<b>不听话</b>——你问它一个问题，它可能顺着续写出<b>更多问题</b>，而不是回答。因为它只学了「文本通常怎么接下去」，没学「被提问时应该回答」。</div>
  <p>要把基座变成能对话的助手，还要两步：<b>指令微调</b>教它「被问就答」，<b>偏好对齐</b>教它答得有用又安全（见「微调」「对齐」深读页）。</p>
  <p>因此本阶段的输入是预训练数据流，输出是基座模型检查点及其训练记录；“能续写且留出损失较低”说明语言建模目标取得进展，不说明它已经遵循指令。后续训练可以改变回答习惯和偏好，却也不能保证事实正确；高风险用途仍要独立评测、检索或工具验证。</p>
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
  <h2><span class="dd-n">6</span>它为什么这么贵<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">既然预训练这么关键，为什么不是人人都能做？</p>
  <p>前沿通用模型的从头预训练会消耗大规模数据、加速器集群与长期工程投入，成本通常只有少数机构能承担；但“小模型预训练”并非绝对做不起。总训练预算还要在参数量与 token 数之间分配，Chinchilla 等工作表明：只增参数而训练数据不足，并非计算最优。</p>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>成本来源</th><th>为什么会增长</th><th>工程结果</th></tr></thead><tbody><tr><td>计算与显存</td><td>更多参数和 token 需要更多前向、反向计算</td><td>决定训练时长与加速器规模</td></tr><tr><td>通信</td><td>多设备要同步梯度、参数或激活</td><td>集群利用率可能被网络拖住</td></tr><tr><td>数据工程</td><td>采集、许可、过滤、去重和配比需反复迭代</td><td>决定污染、偏见和长尾覆盖</td></tr><tr><td>失败与验证</td><td>硬件故障、数值异常和坏批次会中断长训练</td><td>需要检查点、监控和恢复系统</td></tr></tbody></table></div>
  <p>预算规划的输入是目标模型规模、训练 token 数、硬件效率和数据方案，输出是预计计算量、时间、成本及可恢复的检查点计划。实际吞吐低于理论峰值并不一定表示模型设计错误，也可能是通信或数据管线瓶颈；反过来，训练跑得快也不代表数据和能力质量达标。小规模领域模型、继续预训练或直接微调何者合适，要按数据量、任务差异和预算选择。</p>
  <div class="dd-note intuition"><b>这也正是「微调」存在的理由</b>　既然预训练这么贵，绝大多数人不会从头来，而是<b>站在别人预训练好的模型上做微调</b>（迁移学习）——花很小的代价，就借用了那份天价的通用底子（见「微调」深读页）。预训练与微调，是「一次昂贵的通才养成」和「无数次廉价的专才适配」的分工。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从原始文本到基座模型，监督信号、优化与后训练怎样接成一条链？</p>
  <ol class="dd-chain">
    <li>针对任务直接训练又贵又窄，于是先学通用底子、再适配任务——这就是「预」训练。<span>（§1）</span></li>
    <li>它用数据自身构造监督信号：自回归模型预测下一 token，其他架构也可用掩码、对比或重建目标，因此能利用大规模弱标注数据。<span>（§2）</span></li>
    <li>每个位置以 −ln p 贡献损失，整段文本自动产生密集监督；梯度让正确 token 的相对概率上升。<span>（§3）</span></li>
    <li>预测目标迫使模型压缩许多可复用结构，但能力与数据、规模和任务分布共同决定。<span>（§4）</span></li>
    <li>产出的是博学但不听话的基座，还需微调+对齐才成助手。<span>（§5）</span></li>
    <li>预训练同时消耗数据、算力、通信与工程时间，所以多数团队复用基座再适配。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「预训练为什么能不用标注就学到这么多」，并说出「基座模型和对话助手差在哪两步」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">哪些说法把自监督、语言建模指标和助手行为混成了一件事？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>预训练需要大量人工标注</td><td>是<b>自监督</b>，答案来自文本本身，不用人标</td></tr>
      <tr><td>预训练完就是 ChatGPT</td><td>得到的是不听话的基座，还需指令微调和对齐</td></tr>
      <tr><td>模型的能力主要靠微调</td><td>绝大部分知识和能力来自预训练；微调主要改行为</td></tr>
      <tr><td>所有预训练都只有下一 token 目标</td><td>自回归模型常用它；编码器、多模态模型还会用掩码、对比、重建等目标</td></tr>
      <tr><td>谁都能预训练一个大模型</td><td>需海量数据+算力+时间，极贵；多数人做微调</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
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
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
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
