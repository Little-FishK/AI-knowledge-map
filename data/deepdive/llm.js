/* 理解原理页 —— 大语言模型 LLM
 * 写作规约见 docs/DEEPDIVE.md（一节一问 / 严格依赖顺序 / 直觉·数学·工程分层 /
 * 困惑当场点破 / 认知连续 > 技术完整）。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["llm"] = {
  title: "大语言模型 LLM",
  subtitle: "从「预测下一个词」到「像助手一样对话」",
  aliases: "Large Language Model · 大模型 · LLM",
  meta: "建议 40–55 分钟 · 基础 → 中级 · 需要：概率、向量、交叉熵（先读过「神经网络」「Transformer」深读页更顺）",
  thesis: "大语言模型本质是一个在海量文本上训练出来的超大 <code>Transformer</code>，它做的唯一一件事是：<b>给定前面的文本，预测下一个 token 的概率分布</b>。对话、翻译、推理、写代码，都是这个单一目标在规模足够大时被「逼」出来的副产品。看懂这一句，就抓住了它几乎所有能力与风险的来源。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>必要性</b>——旧的「一个任务一个模型」范式差在哪，为什么「一个通用语言模型」是质变。</li>
    <li><b>机制</b>——它每一步具体在算什么：从一串 token 到「下一个 token 的概率分布」。</li>
    <li><b>训练</b>——「预测下一个词」这个目标，怎样让它不用人工标注就能吃下整个互联网。</li>
    <li><b>根本困惑</b>——一个只会猜下一个词的模型，凭什么会推理、翻译、写代码。</li>
    <li><b>从基座到助手</b>——为什么预训练完的模型还不能当 ChatGPT 用，还要哪两步。</li>
    <li><b>一句话推出一切</b>——为什么幻觉是结构性的，为什么要 RAG、要对齐、会被提示注入、有知识截止。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　我们始终用一个最短的提示：<b>「法国的首都是 ___」</b>。全页跟着它走一遍——看它怎样被切成 token、变成向量、被算出「下一个词大概率是<b>巴黎</b>」，再滚动生成一整句。遇到符号别急着背，回到这个例子就清楚了。
</div>

<div class="dd-note intuition">
  <b>前置最小说明</b>　本页会用到几个来自其他概念的零件，这里给出「够用版」，想深入可看各自的深读页：<b>token</b>＝文本被切成的小片段；<b>嵌入 embedding</b>＝把每个 token 变成一串数字（向量）；<b>Transformer</b>＝一种能让每个位置「看」全部前文、并层层加工的神经网络；<b>softmax</b>＝把一组实数压成「加起来等于 1」的概率；<b>交叉熵</b>＝衡量「预测的概率分布」离「真实答案」有多远的损失。</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>为什么需要大语言模型<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：我们已经有神经网络了，为什么还要「大语言模型」这样一类特殊的东西？</p>

  <h3>1.1 旧世界：一个任务，一个模型，一堆标注</h3>
  <p>在 LLM 之前，处理语言是「分而治之」：情感分类训一个模型，机器翻译训另一个，问答、摘要、命名实体识别各训各的。每一个都要<b>大量人工标注</b>的专用数据，而且换个任务几乎从头再来。这条路能走，但又贵又碎，且每个模型都只懂自己那一小块。</p>

  <h3>1.2 关键转念：几乎所有语言任务都能写成「续写文本」</h3>
  <p>有一个朴素但极强的观察：把任务塞进文字里，它们就都变成了同一件事——<b>接着往下写</b>。</p>
  <div class="dd-note intuition"><b>把任务变成续写</b>
  翻译 = 续写「<code>英文：… 中文：___</code>」；
  问答 = 续写「<code>问：… 答：___</code>」；
  摘要 = 续写「<code>原文：… 摘要：___</code>」；
  情感分类 = 续写「<code>这条评价的情绪是：___</code>」。
  只要一个模型足够会「续写」，它就<b>用同一套参数</b>顺手做了所有这些任务——不必为每个任务单独建模型、单独标数据。</div>
  <p>于是问题从「怎么为每个任务建模型」变成了「怎么训练一个特别会续写的通用模型」。这个「特别会续写的模型」，就是大语言模型。它<b>值不值得</b>、<b>怎么做到</b>，是后面全部内容。</p>
  <div class="dd-note eng"><b>它不是万能，也不该万能</b>　LLM 擅长开放、语言性的任务。但要精确计算、要可靠事实、要严格可复现，直接问它并不合适——后面会看到这是它的<b>结构性</b>短板，而不是「再大一点就好」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它每一步到底在算什么<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">上一节说它「会续写」。抛开神秘感，续写这件事，机器每一步具体在算什么？</p>
  <p>答案朴素得让人意外：给定前面的一串 token，模型输出的是<b>整个词表上的一个概率分布</b>——词表里每一个候选 token，各自「接下来最可能是我」的概率。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 210" role="img" aria-label="给定前文，模型输出下一个 token 的概率分布">
      <text x="20" y="30" class="svg-t">前文：「法国 的 首都 是」　→　模型　→　下一个 token 的概率</text>
      <g font-size="14">
        <rect x="30" y="55" width="180" height="20" rx="3" fill="#21252d" stroke="#2c313b"/><rect x="30" y="55" width="128" height="20" rx="3" fill="#6b8cbe"/>
        <text x="222" y="70" class="svg-tn">巴黎　0.62</text>
        <rect x="30" y="85" width="180" height="20" rx="3" fill="#21252d" stroke="#2c313b"/><rect x="30" y="85" width="20" height="20" rx="3" fill="#6b8cbe" opacity=".7"/>
        <text x="222" y="100" class="svg-t">里昂　0.09</text>
        <rect x="30" y="115" width="180" height="20" rx="3" fill="#21252d" stroke="#2c313b"/><rect x="30" y="115" width="13" height="20" rx="3" fill="#6b8cbe" opacity=".6"/>
        <text x="222" y="130" class="svg-t">法国　0.05</text>
        <rect x="30" y="145" width="180" height="20" rx="3" fill="#21252d" stroke="#2c313b"/><rect x="30" y="145" width="8" height="20" rx="3" fill="#6b8cbe" opacity=".5"/>
        <text x="222" y="160" class="svg-t">一　0.03</text>
        <text x="222" y="188" class="svg-t">… 词表里其余几万个 token，概率都很小</text>
      </g>
    </svg>
    <figcaption>图 1　模型的每一步输出，不是一个词，而是<b>词表上所有 token 的一张概率表</b>。这张表由最后一层的数值经 <code>softmax</code> 归一化得到。</figcaption>
  </figure>

  <div class="dd-formula">P(下一个 token = w │ 前文) = softmax(z)_w</div>
  <p class="dd-formula-note"><code>z</code> 是模型最后一层为每个候选 token 算出的一个实数（logit）；softmax 把这一整排实数压成一张相加为 1 的概率表。</p>

  <h3>2.1 一次一个词：自回归生成</h3>
  <p>有了「下一个 token 的概率表」，怎么生成一整句？<b>把它接回去，再来一遍</b>：挑出「巴黎」，拼到前文末尾变成「法国的首都是巴黎」，再让模型预测<b>下一个</b> token（可能是「。」或「，」），如此滚动，直到生成结束符。这种「一次一个、每步都把已生成的接回输入」的方式，叫<b>自回归（autoregressive）</b>。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 150" role="img" aria-label="自回归生成的滚动循环">
      <rect x="20" y="40" width="150" height="34" rx="6" fill="#21252d" stroke="#2c313b"/><text x="95" y="62" text-anchor="middle" class="svg-tn">法国 的 首都 是</text>
      <line x1="170" y1="57" x2="220" y2="57" stroke="#6b7484" stroke-width="1.6" marker-end="url(#a2)"/>
      <rect x="220" y="42" width="70" height="30" rx="6" fill="#1a1d23" stroke="#6b8cbe"/><text x="255" y="62" text-anchor="middle" class="svg-t">模型</text>
      <line x1="290" y1="57" x2="340" y2="57" stroke="#6b7484" stroke-width="1.6" marker-end="url(#a2)"/>
      <rect x="340" y="42" width="90" height="30" rx="6" fill="#21252d" stroke="#4f9d78"/><text x="385" y="62" text-anchor="middle" class="svg-tn">巴黎</text>
      <path d="M385,74 C385,110 150,110 95,84" fill="none" stroke="#d3a05a" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#a3)"/>
      <text x="245" y="128" text-anchor="middle" class="svg-t" fill="#d3a05a">把生成的词拼回前文，再预测下一个</text>
      <defs>
        <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker>
        <marker id="a3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#d3a05a"/></marker>
      </defs>
    </svg>
    <figcaption>图 2　自回归：模型一次只吐一个 token，然后把它接回输入、再算下一个。你看到的「流畅长文」，是这个循环滚了很多次的结果。</figcaption>
  </figure>

  <div class="dd-note warn"><b>你可能会困惑</b>　「它是不是先在心里想好整句，再说出来？」——<b>不是</b>。它没有全局草稿，就是一步一步、每步只挑「此刻最可能的下一个 token」。这条性质后面很重要：它解释了为什么模型能一本正经地把话说圆、却在中途拐进一个根本不存在的事实。</div>

  <div class="dd-note math"><b>写成一个乘积</b>　整段文本的概率，被拆成每一步条件概率的连乘：<code>P(x₁…xₙ) = Π P(xₜ │ x₁…xₜ₋₁)</code>。这就是「语言模型」这个名字的数学含义——它建模的是<b>文本序列的概率</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>从文字到向量：token 与嵌入<span class="dd-badge math">数学</span><span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">第 2 节默默假设了模型「能读」前文。可模型只会算数字，「法国的首都是」这串汉字，怎么变成它能处理的东西？</p>
  <p>分两步：<b>切分</b>与<b>嵌入</b>。</p>
  <ol class="dd-steps">
    <li><b>分词（tokenization）</b>：文本先被切成一个个 <b>token</b>（子词片段），每个 token 对应词表里的一个编号。常见词往往整词一个 token，生僻词会被拆成几块。于是「法国的首都是」变成一串整数 id，比如 <code>[121, 340, 88, 502]</code>。</li>
    <li><b>嵌入（embedding）</b>：每个 token id 查一张大表，取出一个几百到几千维的<b>向量</b>；再叠加一个表示「它排在第几位」的<b>位置编码</b>。到这里，一串文字终于变成了一叠模型能做数学运算的向量。</li>
  </ol>
  <div class="dd-note intuition"><b>为什么必须先变成向量</b>　神经网络只会对连续数字做加权求和与非线性变换。离散的字符/词编号（1 号词、2 号词）本身没有「远近」可言；嵌入把它们放进一个连续空间，让<b>语义相近的词落在相近的位置</b>，模型才有的算。</div>
  <div class="dd-note eng"><b>一个务实的后果</b>　计费和「上下文长度」都按 token 算，不按字数；而且模型「看不见字母」——问它「strawberry 里有几个 r」常出错，因为字母信息在分词那一步就被打包进 token 了。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>中间那个 Transformer 做了什么<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">输入已经是一叠向量了。核心命题说「超大 Transformer」，那它把这些向量<b>怎么了</b>，才能算出下一个词？</p>
  <p>这里只讲它在 LLM 里扮演的角色（完整原理见 Transformer 深读页）。一句话：<b>它把「前文的每个 token 向量」反复加工，让每个位置的向量都吸收进它需要的上下文，最终得到一个「足以预测下一个 token」的表示。</b></p>
  <p>关键机制是<b>注意力</b>：处理某个位置时，模型对<b>前面所有位置</b>算一组「相关性权重」，按权重把它们的信息汇总过来。所以预测「首都是___」时，模型能把注意力落在「法国」上，而不是被语序束缚。很多个注意力层叠起来，信息就被逐层组合成越来越抽象的表示。</p>

  <h3>4.1 一个 LLM 特有的关键约束：因果掩码</h3>
  <p>训练时整段文本是一次性喂进去的。但预测第 t 个 token 时，模型<b>绝不能偷看</b>第 t 个及以后的词——否则就是「拿着答案预测答案」，学不到任何东西。为此在注意力里加一层<b>因果掩码（causal mask）</b>：每个位置只允许看它<b>左边</b>的位置。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 380 210" role="img" aria-label="因果掩码：每个位置只能看它左边的位置">
      <text x="190" y="24" text-anchor="middle" class="svg-t">行 = 正在预测的位置　列 = 它能看的位置</text>
      <g font-size="12">
        <text x="30" y="60" class="svg-t">法国</text><text x="30" y="95" class="svg-t">的</text><text x="30" y="130" class="svg-t">首都</text><text x="30" y="165" class="svg-t">是</text>
        <text x="95" y="44" class="svg-t">法</text><text x="145" y="44" class="svg-t">的</text><text x="195" y="44" class="svg-t">首</text><text x="245" y="44" class="svg-t">是</text>
      </g>
      <g>
        <rect x="85" y="50" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="135" y="50" width="34" height="24" fill="#21252d" stroke="#2c313b"/><rect x="185" y="50" width="34" height="24" fill="#21252d" stroke="#2c313b"/><rect x="235" y="50" width="34" height="24" fill="#21252d" stroke="#2c313b"/>
        <rect x="85" y="85" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="135" y="85" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="185" y="85" width="34" height="24" fill="#21252d" stroke="#2c313b"/><rect x="235" y="85" width="34" height="24" fill="#21252d" stroke="#2c313b"/>
        <rect x="85" y="120" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="135" y="120" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="185" y="120" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="235" y="120" width="34" height="24" fill="#21252d" stroke="#2c313b"/>
        <rect x="85" y="155" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="135" y="155" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="185" y="155" width="34" height="24" fill="#4f9d78" opacity=".8"/><rect x="235" y="155" width="34" height="24" fill="#4f9d78" opacity=".8"/>
      </g>
      <text x="300" y="110" class="svg-t">绿=可看</text><text x="300" y="132" class="svg-t">空=挡住</text>
    </svg>
    <figcaption>图 3　因果掩码是一张下三角。第一个词谁也看不到（只能靠自己），越往后能看的前文越多——这正是「只用前文预测下一个词」在计算上的实现。</figcaption>
  </figure>
  <div class="dd-note math"><b>它省了大工程</b>　有了因果掩码，一段长度 n 的文本喂一次，就同时得到了 n 个训练样本（每个位置都在「用它的前文预测它的下一个」）。这让训练效率极高，是海量文本能被高效利用的关键之一。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>训练目标：预训练就是一个巨大的交叉熵<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">结构清楚了。那这几千亿个参数，是怎么从数据里学出来的？为什么能用「整个互联网」这么多数据？</p>
  <p>诀窍在于目标选得巧：让模型预测下一个 token，而<b>正确答案就是文本里真实的下一个 token</b>——数据自己给自己当标签，<b>不需要任何人工标注</b>。这叫<b>自监督学习</b>，也正是它能吃下海量文本的根本原因：不用人标，数据就几乎无限。</p>
  <p>训练时用<b>交叉熵</b>损失衡量「预测的概率分布」离「真实的下一个 token」有多远，再用梯度下降把它压小：</p>
  <div class="dd-formula">L = − Σₜ log P(xₜ │ x₁…xₜ₋₁)</div>
  <p class="dd-formula-note">直觉：模型给「真实的下一个词」分配的概率越低，<code>−log</code> 越大，惩罚越重。训练就是把这个「对真相的惊讶程度」不断压小。</p>
  <div class="dd-note key"><b>为什么「不用标注」这么重要</b>　旧范式的天花板是人工标注：标得越多越贵越慢。自监督把这个瓶颈<b>拆掉了</b>——于是「加数据、加参数、加算力」成了可以持续下注的方向（这条经验规律叫缩放定律）。<b>「能 scale」这件事，根子就在「预测下一个词不用人标答案」。</b></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>为什么「猜下一个词」能学会推理<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">这是全页最反直觉、也最关键的一节。一个只会猜下一个词的模型，凭什么会翻译、写代码、甚至推理？</p>
  <div class="dd-note warn"><b>先承认这确实反直觉</b>　「预测下一个词」听起来像高级的输入法联想。但请注意一件事：<b>要把下一个词猜准，往往被迫理解到位。</b></div>
  <p>把「猜词」逼到极致，会发生什么：</p>
  <ul class="dd-steps">
    <li>要续写一段<b>推理</b>（「因为 A 且 B，所以 ___」），就得真的会那步推理，才能填对结论。</li>
    <li>要续写一段<b>代码</b>，就得懂语法和语义，否则下一个 token 填错程序就崩。</li>
    <li>要续写一段<b>对话</b>，就得建模对方的意图和语气。</li>
    <li>要续写「<code>1234 × 5678 = ___</code>」，就得掌握乘法的规律。</li>
  </ul>
  <p>换句话说，「预测下一个词」是一个<b>无所不包的任务</b>：它暗中要求模型理解语法、事实、逻辑、意图……<b>能力不是被显式教的，而是为了把词猜得更准，被当作副产品逼出来的。</b>没人专门教它翻译，但它学会了。</p>
  <div class="dd-note intuition"><b>压缩即理解</b>　还有一个视角：把海量文本压进有限参数里、还能高精度地续写，模型别无选择，只能去抓住文本背后<b>可复用的规律</b>（语法、常识、推理模式），而不是死记每句话。规律，就是理解。</div>
  <p>这一切都以<b>规模</b>为前提。参数、数据、算力按比例一起放大时，模型这种「猜词能力」会平滑地变强，很多具体能力也随之出现。</p>
  <div class="dd-note warn"><b>诚实的边角</b>　「某些能力在规模跨过某个点后<b>突然涌现</b>」是流行说法，但也有研究指出，换一种连续的评价方式后曲线其实是平滑上升的——「突然」可能来自我们用了非黑即白的指标。这个争论没有定论；知道它有争议即可，不必站队。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>生成时的旋钮：采样、温度、上下文窗口<span class="dd-badge math">数学</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">第 2 节说输出是「一张概率表」。既然是概率，具体怎么从里面挑词？这直接决定了它多稳、多有创意。</p>
  <h3>7.1 挑词：贪心 vs 采样</h3>
  <p>最简单是<b>贪心</b>：每步都挑概率最高的那个 token。稳，但容易呆板、重复。更常用的是<b>随机采样</b>：按概率大小掷骰子，高概率词更可能被选中，但低概率词也有机会——这带来多样性和「创意」。</p>
  <h3>7.2 温度：一个调「胆量」的旋钮</h3>
  <p>采样前，先把 logit 除以一个<b>温度</b> <code>T</code> 再做 softmax：</p>
  <div class="dd-formula">P(w) = softmax(z / T)_w</div>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>温度</th><th>对分布的影响</th><th>表现</th></tr></thead><tbody>
    <tr><td>T → 0</td><td>分布变尖，几乎只剩最高那个</td><td>确定、保守、可能重复</td></tr>
    <tr><td>T = 1</td><td>就用模型原本的分布</td><td>默认</td></tr>
    <tr><td>T &gt; 1</td><td>分布被摊平，低概率词也有机会</td><td>多样、有创意、也更容易跑偏</td></tr>
  </tbody></table></div>
  <div class="dd-note math"><b>温度其实在调「熵」</b>　用信息论的话说，温度调的是输出分布的<b>不确定性（熵）</b>：低温＝低熵＝更笃定，高温＝高熵＝更发散。所谓「让模型更有创意」，本质就是把这张概率表摊得更平一点。</div>
  <h3>7.3 上下文窗口：它一次能看多长前文</h3>
  <p>模型一次能吃进的 token 数有上限，叫<b>上下文窗口</b>。窗口之外的内容它<b>看不见</b>。而注意力要让每个位置看所有前文，开销随长度<b>平方</b>增长，这就是窗口不能随意做大的根本原因，也是长对话「聊着聊着忘了开头」的来源。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>从「基座」到「助手」：三步<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">预训练完，我们得到一个会「续写」的超强模型。可你把问题丢给它，它可能续写出<b>更多问题</b>而不是回答。为什么？还差哪几步？</p>
  <p>因为预训练只教了它「文本通常怎么接下去」，没教它「被提问时应该<b>回答</b>」。补齐要两步，合起来是今天所有对话模型走的三段路：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>阶段</th><th>做什么</th><th>补上了什么</th></tr></thead>
    <tbody>
      <tr><td>① 预训练（得到<b>基座模型</b>）</td><td>海量文本上自监督预测下一个词</td><td>渊博的语言、知识、模式——但不听话</td></tr>
      <tr><td>② 指令微调 SFT</td><td>用「指令 → 理想回答」的示范数据继续训练</td><td>学会「被问就答」的对话格式与习惯</td></tr>
      <tr><td>③ 偏好对齐（RLHF / DPO）</td><td>用人类对「哪个回答更好」的偏好来调</td><td>答得更有用、更安全、更像人想要的</td></tr>
    </tbody>
  </table></div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 120" role="img" aria-label="从基座模型到对话助手的三阶段">
      <g>
        <rect x="20" y="40" width="150" height="46" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="95" y="60" text-anchor="middle" class="svg-tn">基座模型</text><text x="95" y="78" text-anchor="middle" class="svg-t">博学 · 不听话</text>
        <line x1="170" y1="63" x2="205" y2="63" stroke="#6b7484" stroke-width="1.6" marker-end="url(#a4)"/>
        <rect x="205" y="40" width="150" height="46" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="280" y="60" text-anchor="middle" class="svg-tn">＋指令微调</text><text x="280" y="78" text-anchor="middle" class="svg-t">学会「被问就答」</text>
        <line x1="355" y1="63" x2="390" y2="63" stroke="#6b7484" stroke-width="1.6" marker-end="url(#a4)"/>
        <rect x="390" y="40" width="150" height="46" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="465" y="60" text-anchor="middle" class="svg-tn">＋偏好对齐</text><text x="465" y="78" text-anchor="middle" class="svg-t">有用 · 安全 · 像人想要</text>
      </g>
      <defs><marker id="a4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 4　你日常用的对话模型，都是走完这三步的产物。基座模型很强，但「能对话、听话、安全」是后两步教的。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>一句话，推出 LLM 的一切<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">现在把机制收束成一句能记一辈子的话——它几乎能推出 LLM 的所有典型行为和风险。</p>
  <div class="dd-note key"><b>记住这一句</b>　它输出的是<b>「在训练数据的统计规律下，最可能接下去的内容」，而不是「事实」</b>。它优化的是「像不像人写的下一个词」，从来不是「对不对」。</div>
  <p>从这一句往下推：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>由这句性质</th><th>直接推出</th></tr></thead>
    <tbody>
      <tr><td>只追求「最可能」，没有真值约束</td><td>会<b>幻觉</b>——把话说得流畅自信，内容却是编的</td></tr>
      <tr><td>知识全来自训练那一刻的数据</td><td>有<b>知识截止日期</b>；要最新/私有事实，得<b>外挂检索（RAG）</b></td></tr>
      <tr><td>「最可能说的」≠「应该说的」</td><td>需要<b>对齐</b>，才不会有用地帮倒忙</td></tr>
      <tr><td>在它眼里，指令和数据都只是 token</td><td>会被<b>提示注入</b>——藏在内容里的指令可能被当成命令执行</td></tr>
      <tr><td>一次一个 token、无全局草稿</td><td>能把错误答案也说得圆；靠「让它先写推理过程」等技巧改善</td></tr>
    </tbody>
  </table></div>
  <p>换句话说，幻觉、RAG、对齐、提示注入这些看似零散的话题，其实是<b>同一条根</b>长出来的枝——都源于「它建模的是似然，不是真相」。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">把全页串成一条链，逐环检查「每个环节为什么必须存在」。</p>
  <ol class="dd-chain">
    <li>把语言任务都改写成「续写」，就能用<b>一个</b>通用模型顶替一堆专用模型。<span>（§1）</span></li>
    <li>「续写」= 每步在词表上输出一张概率表，取一个词再拼回、滚动生成。<span>（§2）</span></li>
    <li>文字先被切成 token、再变成向量，模型才有的算。<span>（§3）</span></li>
    <li>Transformer 用带因果掩码的注意力，把前文加工成「足以预测下一个词」的表示。<span>（§4）</span></li>
    <li>训练目标是「预测真实的下一个词」，答案来自文本本身——不用标注，所以能吃海量数据、能 scale。<span>（§5）</span></li>
    <li>把「猜词」逼到极致，理解、推理、翻译作为副产品被逼出来；规模越大越强。<span>（§6）</span></li>
    <li>生成时用采样与温度在「稳」和「有创意」之间调，上下文窗口决定它能看多长。<span>（§7）</span></li>
    <li>预训练得到博学的基座；再经指令微调和偏好对齐，才成为听话、安全的助手。<span>（§8）</span></li>
    <li>而它终究建模的是似然而非真相——幻觉、RAG、对齐、注入都由此而来。<span>（§9）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能不看笔记，讲清「为什么预测下一个词不用标注、又能学会推理」，并说出「为什么幻觉是结构性的」，你就真正跨过了 LLM 的原理门槛。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>它像数据库，在「查」答案</td><td>它在<b>生成</b>最可能的下一个词；没有可查的条目，也因此会编</td></tr>
      <tr><td>它先想好整句再回答</td><td>一次一个 token 自回归生成，没有全局草稿</td></tr>
      <tr><td>它知道自己不知道</td><td>不知道。答对和瞎编，它做的是<b>同一件事</b>：挑最可能的下一个词</td></tr>
      <tr><td>参数量越大一定越强</td><td>要参数、数据、算力<b>按比例</b>配平；单拉一项会浪费</td></tr>
      <tr><td>它能实时知道最新消息</td><td>知识止于训练时；要最新/私有信息得靠检索（RAG）或工具</td></tr>
      <tr><td>调「温度」是在改它的知识</td><td>只是在改<b>挑词的随机性</b>（分布的熵），不改它会什么</td></tr>
      <tr><td>ChatGPT 就是预训练出来的</td><td>预训练只给基座；「会对话、听话、安全」是指令微调和对齐教的</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">12</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>「把任务改写成续写」为什么能让一个模型顶替一堆专用模型？</li>
    <li>模型每一步的输出到底是什么？为什么说它是「一张概率表」而不是「一个词」？</li>
    <li>自回归生成是什么意思？它和「先想好整句再说」有何本质不同？</li>
    <li>为什么预训练「不需要人工标注」？这一点和「能 scale」有什么关系？</li>
    <li>因果掩码解决了什么问题？没有它训练会出什么错？</li>
    <li>用一句话解释：为什么「只会猜下一个词」的模型能学会推理？</li>
    <li>温度调高和调低，分别让生成变成什么样？它在调分布的什么？</li>
    <li>为什么预训练完的基座模型还不能直接当聊天助手用？</li>
    <li>为什么说「幻觉是结构性的」，而不是「再大一点就能修好」？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>因为翻译/问答/摘要/分类都能表述成「给定前文，接着往下写」，于是同一套「会续写」的参数就能顺手做全部，不必各自建模型、各自标数据。</li>
      <li>是词表上所有候选 token 的一张概率分布（最后一层数值经 softmax 得到）；取其中一个（贪心或采样）才得到一个词。</li>
      <li>一次只生成一个 token、并把它拼回输入再预测下一个；它没有全局草稿，是逐词滚动出来的，所以能把错误也说得很圆。</li>
      <li>因为「正确答案」就是文本里真实的下一个 token，数据自己当标签；不靠人标，数据近乎无限，于是加数据/参数/算力成了可持续的路。</li>
      <li>它保证预测第 t 个词时只看前文、不偷看答案；没有它等于拿答案预测答案，学不到东西。</li>
      <li>因为要把下一个词猜准，往往被迫理解语法、事实、逻辑和意图——能力是为猜准而被逼出的副产品。</li>
      <li>调高＝分布摊平＝更随机多样也更易跑偏；调低＝分布变尖＝更确定保守；它调的是输出分布的不确定性（熵）。</li>
      <li>基座只学了「文本通常怎么接」，没学「被问要回答」；还要指令微调教它对话、偏好对齐教它有用又安全。</li>
      <li>因为它优化的目标是「最可能的下一个词」（似然），本就没有真值约束；规模能让它更像、更少错，但只要目标是似然而非真相，编造的可能就消不掉。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">13</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>神经网络、Transformer、注意力、token 与分词、嵌入、softmax、交叉熵、自监督学习</td></tr>
      <tr><td><b>本页核心</b></td><td>下一个 token 预测、自回归生成、因果掩码、预训练目标、采样与温度、上下文窗口、基座→SFT→对齐</td></tr>
      <tr><td>紧邻延伸</td><td>缩放定律、幻觉、RAG、对齐、RLHF、提示工程、提示注入</td></tr>
      <tr><td>更远</td><td>多模态、混合专家 MoE、推理模型、Agent、微调、量化与部署</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>过关标准</b>　讲清「为什么预测下一个词不用标注、又能学会推理」，并说出「为什么幻觉是结构性的」，你就跨过了 LLM 的原理门槛。</div>
</section>
`
};
