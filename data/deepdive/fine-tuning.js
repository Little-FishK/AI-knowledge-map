/* 理解原理页 —— 微调 Fine-tuning
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["fine-tuning"] = {
  title: "微调 Fine-tuning",
  subtitle: "在预训练的「通才」上继续训练，调成某个任务的「专才」",
  aliases: "Fine-tuning · 微调 · 指令微调 SFT",
  meta: "建议 30–40 分钟 · 中级 · 需要：了解「预训练」「监督学习」「大语言模型」的基本概念",
  thesis: "微调是在一个<b>已经预训练好</b>的大模型上，用一批针对性的数据<b>继续训练</b>、微微改动它的权重，把「通才」调成某个任务或领域的「专才」。它站在预训练的肩膀上，省去了从零训练的天价成本——背后的原理叫<b>迁移学习</b>。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——微调和「从零训练」差在哪，为什么它便宜得多。</li>
    <li><b>凭什么有效</b>——迁移学习：为什么不必重头学，改一改就行。</li>
    <li><b>能改什么、不能改什么</b>——微调擅长改行为，不擅长塞事实。</li>
    <li><b>指令微调</b>——ChatGPT 的「会听话」是怎么调出来的。</li>
    <li><b>省钱的关键</b>——为什么不必改动全部几千亿参数（LoRA）。</li>
    <li><b>怎么选</b>——面对需求，先试提示、还是 RAG、还是微调。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的两个最小例子</b>　① 把一个通用大模型微调成<b>「只输出规范 JSON」</b>的模型；② 把它微调成带某种<b>固定语气/风格</b>的客服助手。留意一个共同点：这两件事都是在<b>改「行为方式」</b>，而不是在往模型里塞新事实——这正是第 3 节的分水岭。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是微调<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：已经有了强大的预训练模型，怎么让它专精我这一件事？</p>
  <p>从零训练一个大模型，要海量数据、成千上万张显卡、几个月时间——绝大多数人做不起。微调换了个思路：<b>拿别人预训练好的模型当起点，用你自己的一小批数据，让它接着训练一会儿</b>，权重只被<b>轻微</b>调整。通才于是变成了专才。</p>
  <p>微调的输入是预训练模型、任务样本和训练配置，输出是适配后的权重或一个可挂载的适配器。训练仍然计算任务损失并用梯度更新参数，只是起点不是随机权重、数据范围也更窄。留出任务指标提高说明模型更适合当前任务；若通用能力或其他语言切片下降，则说明专精伴随回归。数据太少、任务差异太大或基础模型本来不会该任务时，“轻推一步”未必够。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>从零训练</th><th>微调</th></tr></thead>
    <tbody>
      <tr><td>起点</td><td>随机初始化的空白模型</td><td>已预训练好的模型</td></tr>
      <tr><td>数据量</td><td>海量</td><td>少量、针对性</td></tr>
      <tr><td>成本</td><td>天价（算力/时间/数据）</td><td>相对很低</td></tr>
      <tr><td>产出</td><td>一个通用能力</td><td>一个专精某任务/领域的版本</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>一句话</b>　微调不是「造一个新模型」，而是<b>「把一个现成的好模型，往你的方向推一小步」</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它凭什么有效：迁移学习<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的疑问：为什么用一小批数据「接着训一会儿」就够，不必从头学？</p>
  <p>因为预训练模型<b>早就学到了大量通用的、可复用的东西</b>：语言的语法结构、常识、基本推理，图像里的边缘纹理和形状。这些底层能力对几乎所有下游任务都有用。你要专精的那件事，往往只需要在这些通用能力之上<b>做小幅调整</b>——把已有的表示「拨」向你的目标。这种「把一个领域学到的能力搬到另一个任务上」的思路，叫<b>迁移学习</b>。</p>
  <p>输入是源任务中学到的参数表示和少量目标任务样本，输出是对目标任务更合适的决策边界或生成行为。梯度会优先调整当前样本最相关的表示与输出方向，而不是从零重新发现全部语言规律。目标数据越接近预训练覆盖、基础表示越可复用，迁移通常越省样本；若领域、模态或标签含义差异很大，还可能出现负迁移，表现甚至不如更简单的专用方案。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 170" role="img" aria-label="迁移学习：在庞大的预训练能力上做小幅微调">
      <rect x="30" y="45" width="200" height="80" rx="10" fill="#21252d" stroke="#6b7484"/><text x="130" y="80" text-anchor="middle" class="svg-tn">预训练模型</text><text x="130" y="102" text-anchor="middle" class="svg-t">通用能力 · 天价训练</text>
      <line x1="230" y1="85" x2="285" y2="85" stroke="#6b7484" stroke-width="1.6" marker-end="url(#c1)"/>
      <text x="257" y="72" text-anchor="middle" class="svg-t" font-size="11">＋少量</text><text x="257" y="104" text-anchor="middle" class="svg-t" font-size="11">任务数据</text>
      <rect x="285" y="55" width="90" height="60" rx="10" fill="#1a1d23" stroke="#d3a05a"/><text x="330" y="90" text-anchor="middle" class="svg-t">微调</text>
      <line x1="375" y1="85" x2="430" y2="85" stroke="#6b7484" stroke-width="1.6" marker-end="url(#c1)"/>
      <rect x="430" y="45" width="110" height="80" rx="10" fill="#21252d" stroke="#4f9d78"/><text x="485" y="80" text-anchor="middle" class="svg-tn">专才模型</text><text x="485" y="102" text-anchor="middle" class="svg-t">精于你的任务</text>
      <defs><marker id="c1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　贵的那一步（预训练）别人已经替你做完了。微调只在这份庞大能力上，用少量数据推一小步——这就是它省数据、省算力的全部来源。</figcaption>
  </figure>
  <div class="dd-note intuition"><b>类比</b>　一个已经博学的人转行，不必回炉重上小学，只要针对新岗位做一段<b>专项培训</b>就能上手。微调之于预训练模型，就是这段专项培训。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>它能改什么、不能改什么<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">这是全页最实用、也最容易用错的一节：什么问题该用微调，什么问题不该？</p>
  <div class="dd-note key"><b>一句话分水岭</b>　微调擅长改<b>「行为」</b>——格式、语气、风格、做事方式；不擅长可靠地塞进<b>「大量新事实」</b>——那更适合外挂检索（RAG）。</div>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>你的需求</th><th>更该用</th><th>为什么</th></tr></thead>
    <tbody>
      <tr><td>让它稳定只输出某种格式（JSON）</td><td>微调</td><td>这是行为习惯，示范多了就固化</td></tr>
      <tr><td>让它用某种固定语气/风格答</td><td>微调</td><td>同上，风格是可训练的行为</td></tr>
      <tr><td>让它掌握某专业领域的表达方式</td><td>微调</td><td>调的是「怎么说」，不是「记住哪条」</td></tr>
      <tr><td>让它知道我公司最新的文档/数据</td><td>RAG（检索）</td><td>事实要可更新、可溯源；微调塞事实易学不牢又过时</td></tr>
      <tr><td>只是想让它这一次按要求做</td><td>提示 / 上下文学习</td><td>不用训练、迭代快，但仍有 token 与评测成本</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note warn"><b>最常见的用错</b>　「我想让模型知道我们公司的知识」——很多人第一反应是微调，其实多半该用 <b>RAG</b>：知识会变，检索能随时更新、还能给出处；而把一堆事实硬塞进权重，既容易记不牢，又可能挤掉别的能力（见第 6 节的「遗忘」）。<b>记不住的事实交给检索，改不动的习惯交给微调。</b></div>
  <p>做选择时，输入应是需求类型、知识更新频率、可追溯要求、调用量与延迟预算，输出是提示、RAG、微调或组合方案。格式通过率提高可证明行为更稳定；不能据此推断事实覆盖更完整。行为与知识常同时存在，因此实际系统可以用微调固定格式，再用 RAG 提供可更新证据。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>指令微调：把「基座」调成「助手」<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">上一节说微调擅长「改行为」。有一个最重要的行为改造，你天天在用——它就是这么来的。</p>
  <p>预训练完的<b>基座模型</b>只会「续写」，你问它问题，它可能续写出更多问题而不是回答。<b>指令微调（SFT）</b>就是用大量「指令 → 理想回答」的示范数据，对它做一次监督微调，教会它<b>「被问就答」</b>这个行为。</p>
  <div class="dd-note math"><b>它就是监督学习</b>　这里「指令」是输入、「理想回答」是标签，标准的监督学习一套（见「监督学习」深读页）。所以严格说：<b>指令微调 = 在预训练模型上做的一次监督学习</b>。</div>
  <p>之后往往还有一步<b>偏好对齐（RLHF / DPO）</b>，用人类对「哪个回答更好」的偏好把它调得更有用、更安全。「预训练 → 指令微调 → 偏好对齐」这三步，就是今天所有对话助手的来路（详见「大语言模型」深读页第 8 节）。</p>
  <p>SFT 样本输入指令和上下文，目标输出是示范回答的 token；交叉熵逐步提高示范回答的概率。指令遵循率上升表示模型更常复现训练规范，不代表回答事实必然正确。示范未覆盖、彼此冲突或把拒答标准写错时，模型会继承这些缺陷；偏好对齐也只是下一阶段，不能替代独立安全与事实评测。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>不必改全部参数：参数高效微调<span class="dd-badge math">数学</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">一个现实问题：模型有几千亿参数，微调一次是不是也得改动全部、也很贵？</p>
  <p>好消息是：<b>不用</b>。既然只是「推一小步」，那就没必要动全部权重。<b>参数高效微调（PEFT）</b>把绝大多数原参数<b>冻结不动</b>，只训练一小撮新增的参数。最流行的做法是 <b>LoRA</b>：在原权重旁边挂两个<b>低秩小矩阵</b>，只训练它们，用来表示「该在原权重上加的那点改动」。“秩”可先理解为矩阵中彼此独立的变化方向数量；低秩假设任务适配只需少数方向，不必任意改变原权重的每个自由度。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 180" role="img" aria-label="全量微调改动整块权重，LoRA 只训练旁挂的小矩阵">
      <g>
        <text x="120" y="30" text-anchor="middle" class="svg-t">全量微调</text>
        <rect x="70" y="45" width="100" height="100" rx="6" fill="#d3a05a" opacity=".75"/><text x="120" y="100" text-anchor="middle" class="svg-tn" font-size="12">整块都训</text>
      </g>
      <g>
        <text x="400" y="30" text-anchor="middle" class="svg-t">LoRA（参数高效）</text>
        <rect x="300" y="45" width="100" height="100" rx="6" fill="#21252d" stroke="#6b7484"/><text x="350" y="92" text-anchor="middle" class="svg-t" font-size="12">冻结</text><text x="350" y="110" text-anchor="middle" class="svg-t" font-size="12">（不动）</text>
        <text x="415" y="98" class="svg-t">＋</text>
        <rect x="432" y="55" width="60" height="16" rx="3" fill="#4f9d78"/><rect x="432" y="119" width="16" height="26" rx="3" fill="#4f9d78"/>
        <text x="500" y="66" class="svg-t" font-size="11">只训</text><text x="500" y="140" class="svg-t" font-size="11">小矩阵</text>
      </g>
    </svg>
    <figcaption>图 2　全量微调更新整块权重（贵、每个任务存一整个模型）；LoRA 冻结原权重，只训练旁边两个低秩小矩阵。可训练参数常能降到不足 1%，显存大减，而且一个基座能挂多个「适配器」按需切换。</figcaption>
  </figure>
  <h3>5.1 运行示例：一个秩 1 LoRA 怎样改写输出</h3>
  <p>用 2×2 玩具权重展示低秩更新。设基座矩阵 <code>W=I</code>，LoRA 用列向量 <code>B=[0.2,0.1]ᵀ</code> 与行向量 <code>A=[1,−1]</code> 相乘：</p>
  <div class="dd-formula" data-formula-id="fine-tuning-lora-rank-one" data-display="mathml"><math display="block" aria-label="权重增量 delta W 等于列向量 B 乘行向量 A，结果是一个秩至多为一的二乘二矩阵"><mrow><mi>ΔW</mi><mo>=</mo><mi>B</mi><mi>A</mi><mo>=</mo><mrow><mo>[</mo><mtable><mtr><mtd><mn>0.2</mn></mtd><mtd><mo>−</mo><mn>0.2</mn></mtd></mtr><mtr><mtd><mn>0.1</mn></mtd><mtd><mo>−</mo><mn>0.1</mn></mtd></mtr></mtable><mo>]</mo></mrow><mspace width="0.8em"/><mtext>rank</mtext><mo>(</mo><mi>ΔW</mi><mo>)</mo><mo>≤</mo><mn>1</mn></mrow></math></div>
  <p class="dd-formula-note"><code>W</code> 是冻结的基座权重，<code>ΔW</code> 是适配器学到的增量；<code>A</code> 把输入压到一个低维方向，<code>B</code> 再把该方向展开回输出空间。这里 A 只有一行、B 只有一列，所以乘积最多提供一个独立变化方向，记作 <code>rank(ΔW)≤1</code>。</p>
  <table class="dd-table"><thead><tr><th>步骤</th><th>输入 x=[3,1] 时的结果</th></tr></thead><tbody><tr><td>基座输出 <code>Wx</code></td><td><code>[3,1]</code></td></tr><tr><td>适配器增量 <code>ΔWx</code></td><td><code>[0.4,0.2]</code></td></tr><tr><td>合并输出 <code>(W+ΔW)x</code></td><td><code>[3.4,1.2]</code></td></tr></tbody></table>
  <p>训练只更新 A、B，W 保持冻结；部署时可动态挂载适配器，也可把 ΔW 合并进 W。真实 LoRA 还有缩放因子、目标层选择与 dropout，这些都会改变有效更新强度。</p>
  <div class="dd-note eng"><b>为什么这在实践里是默认</b>　LoRA 这类方法省显存、训得快，还能<b>一个基座 + 多个可插拔适配器</b>——切任务就换个小矩阵，不必各存一份满血大模型。对大多数团队，参数高效微调是起点，全量微调只在必要时才上。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>三个最容易翻车的坑<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">微调看着简单，但翻车也集中在几个固定的地方。</p>
  <ul class="dd-steps">
    <li><b>过拟合</b>：微调数据往往很少，模型容易把这几百条<b>背下来</b>、丢掉泛化。应对：低学习率、早停、正则化、别训太多轮（见「过拟合」「正则化」）。</li>
    <li><b>灾难性遗忘</b>：一门心思学新任务，把预训练学到的<b>通用能力忘了</b>（变得只会 JSON、别的都退化）。应对：用参数高效微调、更低学习率、在数据里<b>掺一些通用样本</b>。</li>
    <li><b>数据质量 &gt; 数量</b>：微调的效果高度取决于示范数据的质量。<b>几百条高质量、格式一致的样本，常胜过一大堆噪声。</b>脏数据会被模型忠实地学下来。</li>
  </ul>
  <div class="dd-note warn"><b>一个反直觉点</b>　微调不是「喂得越多越好」。数据脏、量大、训得久，往往比小而精更糟——因为你在教它「照着这些（不好的）例子办」。<b>先把几百条样本打磨干净，再谈规模。</b></div>
  <p>风险检查的输入是训练曲线、独立任务集、通用能力基线和分层数据审计，输出是过拟合、遗忘或数据缺陷的定位。训练损失继续下降而验证集变差，是过拟合信号；目标任务提高但通用集下降，是遗忘信号；错误集中复制示范措辞，则应先修数据。低学习率、早停、通用样本混合和 PEFT 能降低风险，但不能替代独立留出集。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>怎么选：微调，还是先别微调<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">面对一个真实需求，第一步该做什么？答案通常<b>不是</b>「马上微调」。</p>
  <p>把三种手段看成一个<b>由轻到重的阶梯</b>，从最省的试起，不够了再往上走：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>阶梯</th><th>手段</th><th>先试它，如果……</th></tr></thead>
    <tbody>
      <tr><td>① 最轻</td><td>提示 / 上下文学习</td><td>调措辞、给几个示例就够 → 到此为止（无需训练、见「上下文学习」）</td></tr>
      <tr><td>② 中</td><td>RAG 检索</td><td>缺的是<b>事实/最新知识</b> → 外挂检索，别塞进权重</td></tr>
      <tr><td>③ 最重</td><td>微调</td><td>要的是<b>稳定的行为/格式/风格</b>，且提示压不稳、量也上来了 → 才微调</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>务实顺序</b>　先用提示/上下文学习<b>快速验证</b>「模型到底能不能做这件事」；缺事实就加 RAG；只有当你需要把某种<b>行为固化下来、且要长期稳定又省单次成本</b>时，微调才真正划算。<b>微调是终点，不是起点。</b></div>
  <p>这条阶梯的输入是同一批代表性需求、质量门槛和总成本约束，输出是达到门槛的最轻方案。应在相同测试集上比较质量、延迟、单次 token、训练与维护成本；方案越重，版本管理和回归测试负担越大。它是默认试验顺序而非绝对规则：严格离线、极低延迟或大调用量场景，微调可能更早变得经济。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从预训练权重到稳定新行为，数据、更新范围和验证怎样共同约束迁移？</p>
  <ol class="dd-chain">
    <li>从零训练太贵，于是拿预训练模型当起点、用少量数据继续训一小会儿——这就是微调。<span>（§1）</span></li>
    <li>它有效，是因为预训练已学到通用能力，微调只需小幅调整（迁移学习）。<span>（§2）</span></li>
    <li>所以微调擅长改「行为/格式/风格」，塞「大量新事实」则该交给 RAG。<span>（§3）</span></li>
    <li>最重要的一次行为改造是指令微调（SFT）：用「指令→理想回答」把基座教成会听话的助手，本质是监督学习。<span>（§4）</span></li>
    <li>既然只推一小步，就不必动全部参数——LoRA 冻结原权重、只训小矩阵，省显存又可插拔。<span>（§5）</span></li>
    <li>常见翻车在过拟合、灾难性遗忘、数据质量差三处。<span>（§6）</span></li>
    <li>因此面对需求，先提示、再 RAG、最后才微调——从轻到重。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「微调为什么便宜（迁移学习）」，并准确说出「什么该微调、什么该用 RAG」，你就抓住了它最实用的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>微调是从头训练一个新模型</td><td>是在<b>预训练模型</b>上继续训、微调权重，成本低得多</td></tr>
      <tr><td>想让模型「知道」我的资料就该微调</td><td>可更新的事实更适合 <b>RAG</b>；微调擅长改行为而非记事实</td></tr>
      <tr><td>微调要改动全部参数</td><td>LoRA 等参数高效方法只训不到 1% 的参数就够</td></tr>
      <tr><td>数据越多微调越好</td><td>质量与一致性常比数量更关键；脏数据会被忠实学下来</td></tr>
      <tr><td>微调只会变强、不会变弱</td><td>可能过拟合，或<b>灾难性遗忘</b>丢掉原有通用能力</td></tr>
      <tr><td>有需求就该先微调</td><td>先提示/上下文学习、再 RAG，微调是最后一档</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>微调和「从零训练」最根本的区别是什么？为什么它便宜得多？</li>
    <li>用「迁移学习」解释：为什么用一小批数据继续训一会儿就够？</li>
    <li>「让模型稳定输出 JSON」和「让模型知道公司最新文档」，分别该用微调还是 RAG？为什么？</li>
    <li>指令微调（SFT）在做什么？为什么说它本质是监督学习？</li>
    <li>LoRA 是怎么做到「不改动全部参数」的？带来哪些好处？</li>
    <li>什么是灾难性遗忘？怎样缓解？</li>
    <li>面对一个新需求，为什么通常不该一上来就微调？正确的顺序是什么？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>从零训练从随机初始化开始、要海量数据和算力；微调从预训练好的模型出发、只用少量数据轻微调整，因此便宜得多。</li>
      <li>预训练已学到通用可复用的表示（语法、常识、底层特征），下游任务只需在此之上小幅调整，无需重头学。</li>
      <li>JSON 是行为/格式，用微调固化；公司最新文档是会变的事实，用 RAG 外挂检索（可更新、可溯源），塞进权重易学不牢又过时。</li>
      <li>用「指令→理想回答」示范数据把基座教成会回答；指令是输入、理想回答是标签，正是监督学习。</li>
      <li>冻结原权重，只在旁边训练两个低秩小矩阵来表示改动；可训练参数常不到 1%，省显存、训得快，且一个基座能挂多个可插拔适配器。</li>
      <li>为学新任务而丢掉预训练的通用能力；可用参数高效微调、更低学习率、在数据里掺通用样本来缓解。</li>
      <li>因为提示/上下文学习无需训练、迭代快，往往就够；缺可更新事实时考虑 RAG。常见评估顺序是「提示/ICL → RAG → 微调」，但应按质量、延迟与维护成本选择。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>预训练、监督学习、大语言模型、神经网络与权重</td></tr>
      <tr><td><b>本页核心</b></td><td>迁移学习、指令微调 SFT、参数高效微调 / LoRA、灾难性遗忘、微调 vs RAG vs 提示</td></tr>
      <tr><td>紧邻延伸</td><td>过拟合、正则化、上下文学习、检索增强生成 RAG、对齐与 RLHF</td></tr>
      <tr><td>更远</td><td>量化与部署、蒸馏、评测、模型选型</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2106.09685" target="_blank" rel="noopener">Hu et al., LoRA</a>：低秩适配的参数高效微调机制。</li>
    <li><a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noopener">Ouyang et al., InstructGPT</a>：监督微调、偏好数据与强化学习阶段。</li>
    <li><a href="https://arxiv.org/abs/2305.14314" target="_blank" rel="noopener">Dettmers et al., QLoRA</a>：量化基础模型上的高效微调。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-21</div>
</div>
`
};
