/* 理解原理页 —— 神经网络
 *
 * 每个概念节点可有一个「理解原理」深读页，注册到 window.DEEPDIVE[nodeId]。
 * 详情页在大区标签右侧出现「理解原理」按钮，点击后打开本页（#deepdive 全屏阅读视图）。
 *
 * 写作规约（见 docs/DEEPDIVE.md，源于对 Codex 初稿 5 个错误的复盘）：
 *   ① 每节回答由前文引出的唯一问题（顶部 .dd-lead 显式写出）——不为覆盖知识点而堆内容；
 *   ② 严格概念依赖顺序——用到的词必须已在前文建立（CNN/Transformer/计算图等只进末尾延伸节）；
 *   ③ 分清三个层级并用 .dd-badge 标注：直觉 / 数学 / 工程；
 *   ④ 在最易困惑处放 .dd-note.warn「你可能会困惑」并当场解决；
 *   ⑤ 全文原创，参考 Google ML Crash Course（CC BY 4.0）重新组织，不复制其交互组件。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["neural-network"] = {
  title: "神经网络",
  subtitle: "从「为什么需要」到「如何通过反向传播学会」",
  aliases: "Neural Network · 人工神经网络 · ANN",
  meta: "建议 45–60 分钟 · 基础 → 中级 · 需要：代数、函数、导数",
  thesis: "神经网络的本质不是「很多节点」，而是<b>可微分的非线性函数复合</b>。前向传播算出答案，损失函数度量错误，反向传播用链式法则把错误分配给每个参数，优化器再据此微调——四步合成一个能从数据里学习的闭环。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>必要性</b>——为什么线性模型处理不了图像、语言这类问题，而神经网络可以。</li>
    <li><b>结构</b>——输入层、隐藏层、输出层、节点、权重、偏置、激活函数各自负责什么。</li>
    <li><b>推理</b>——一条输入怎样经过加权求和与非线性变换，最终变成预测。</li>
    <li><b>学习</b>——损失、梯度、链式法则、反向传播、梯度下降如何合成一个闭环。</li>
    <li><b>数学</b>——读懂 <code>z = Wx + b</code>、<code>a = φ(z)</code>、<code>θ ← θ − η∇L(θ)</code>，并能手算一次更新。</li>
    <li><b>边界</b>——什么时候该用它、什么时候不该，怎样识别过拟合与训练失败。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　从头到尾我们只用一个网络当例子：<b>2 个输入 → 2 个 ReLU 隐藏节点 → 1 个 Sigmoid 输出</b>。前面用它讲结构和道理，第 9 节用它做一次完整的数字手算。你不必一次记住所有符号，遇到时回看这里即可。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>为什么需要神经网络<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节要回答一个最根本的问题：既然有简单的线性模型，为什么还要更复杂的东西？</p>

  <h3>1.1 线性模型的能力到哪里为止</h3>
  <p>一个线性模型学的是输入的一个<b>加权和</b>。以二分类为例，它能画出的分界只有一条直线、一个平面、或更高维里的一个「超平面」——本质上是一刀平的切分。</p>
  <div class="dd-formula">y′ = w₁x₁ + w₂x₂ + … + wₙxₙ + b</div>
  <p class="dd-formula-note">权重 <code>w</code> 决定每个输入的影响方向与强弱，偏置 <code>b</code> 决定这条边界整体平移多少。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 640 260" role="img" aria-label="线性边界无法分开同心环，曲线可以">
      <g transform="translate(0,0)">
        <rect x="20" y="20" width="280" height="210" rx="8" fill="none" stroke="#2c313b"/>
        <text x="160" y="44" text-anchor="middle" class="svg-t">一条直线：分不开</text>
        <!-- outer ring (class B, red) -->
        <g fill="#cf6f6f">
          <circle cx="160" cy="150" r="4"/><circle cx="100" cy="120" r="4"/><circle cx="220" cy="120" r="4"/>
          <circle cx="110" cy="185" r="4"/><circle cx="210" cy="185" r="4"/><circle cx="160" cy="95" r="4"/>
          <circle cx="80" cy="150" r="4"/><circle cx="240" cy="150" r="4"/>
        </g>
        <!-- inner cluster (class A, blue) -->
        <g fill="#6b8cbe"><circle cx="160" cy="150" r="4" fill="#6b8cbe" opacity="0"/>
          <circle cx="150" cy="145" r="4"/><circle cx="170" cy="150" r="4"/><circle cx="160" cy="135" r="4"/><circle cx="158" cy="160" r="4"/>
        </g>
        <line x1="55" y1="215" x2="265" y2="70" stroke="#d3a05a" stroke-width="2" stroke-dasharray="5 4"/>
      </g>
      <g transform="translate(320,0)">
        <rect x="20" y="20" width="280" height="210" rx="8" fill="none" stroke="#2c313b"/>
        <text x="160" y="44" text-anchor="middle" class="svg-t">一条曲线：分得开</text>
        <g fill="#cf6f6f">
          <circle cx="160" cy="150" r="4"/><circle cx="100" cy="120" r="4"/><circle cx="220" cy="120" r="4"/>
          <circle cx="110" cy="185" r="4"/><circle cx="210" cy="185" r="4"/><circle cx="160" cy="95" r="4"/>
          <circle cx="80" cy="150" r="4"/><circle cx="240" cy="150" r="4"/>
        </g>
        <g fill="#6b8cbe">
          <circle cx="150" cy="145" r="4"/><circle cx="170" cy="150" r="4"/><circle cx="160" cy="135" r="4"/><circle cx="158" cy="160" r="4"/>
        </g>
        <ellipse cx="160" cy="150" rx="42" ry="38" fill="none" stroke="#4f9d78" stroke-width="2"/>
      </g>
    </svg>
    <figcaption>图 1　左：内圈一类、外圈一类，任何直线都会同时切错两边。右：一条闭合曲线才能把它们分开。神经网络要造的，正是这种弯曲的边界。</figcaption>
  </figure>

  <h3>1.2 「手工造特征」为什么不够</h3>
  <p>你可能会说：给线性模型喂一些组合特征（比如 <code>x₁x₂</code>、<code>x₁²</code>、到圆心的距离）不就弯了吗？确实——特征工程能把一些非线性问题掰成线性。但当输入是几千、几百万维（一张图的每个像素、一段话的每个词），而有用的组合又事先不知道时，<b>靠人枚举特征会迅速失控</b>。</p>
  <div class="dd-note intuition"><b>神经网络的真正价值</b>　不是「层多」，而是让模型<b>在训练中自己学出有用的中间特征</b>，而不再需要人一个个手工设计。后面会看到，隐藏层就是这些「学出来的特征」所在的地方。</div>

  <h3>1.3 那「多堆几层线性」行不行</h3>
  <p>一个自然的想法：既然一层不够，多叠几层线性变换总该更强吧？把两层写出来（先不加任何非线性）：</p>
  <div class="dd-formula">h = W₁x + b₁　　y = W₂h + b₂</div>
  <p>把第一行代进第二行：</p>
  <div class="dd-formula">y = W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂)</div>
  <div class="dd-note math"><b>数学结论</b>　两个线性/仿射变换复合，结果<b>仍是一个线性/仿射变换</b>（记 <code>W = W₂W₁</code> 即可）。所以无论叠多少纯线性层，整体永远等价于<b>一层</b>——深度本身不产生任何新的表达能力。</div>
  <p>这就逼出了下一个问题：既然深度靠「叠线性」换不来能力，那能力到底从哪里来？答案是在层与层之间插入一个<b>非线性</b>函数。它是谁、怎么起作用——是第 4 节的主题。在那之前，我们得先把网络的结构讲清楚。</p>

  <div class="dd-note eng"><b>工程提醒：必要，但不是万能</b>　神经网络擅长高维感知数据（图像/语音/文本）、复杂非线性关系、大规模样本。对小的表格数据、需要严格可解释、或几条规则就够的问题，线性模型、树模型或显式规则往往<b>更合适、更省、更可控</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>网络的结构：它由什么组成<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">上一节说到「非线性要插在层之间」。那么「层」「节点」到底是什么？本节把结构拆开，看每个零件负责什么。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 640 300" role="img" aria-label="一个 2-2-1 的全连接前馈网络">
      <!-- edges input->hidden -->
      <g stroke="#3a4150" stroke-width="1.4">
        <line x1="150" y1="95" x2="330" y2="95"/><line x1="150" y1="95" x2="330" y2="205"/>
        <line x1="150" y1="205" x2="330" y2="95"/><line x1="150" y1="205" x2="330" y2="205"/>
        <!-- hidden->output -->
        <line x1="330" y1="95" x2="500" y2="150"/><line x1="330" y1="205" x2="500" y2="150"/>
      </g>
      <!-- highlight one weight -->
      <line x1="150" y1="95" x2="330" y2="205" stroke="#d3a05a" stroke-width="2.4"/>
      <text x="232" y="150" class="svg-t" fill="#d3a05a">w</text>
      <!-- nodes -->
      <g>
        <circle cx="150" cy="95" r="22" fill="#21252d" stroke="#6b8cbe" stroke-width="2"/><text x="150" y="100" text-anchor="middle" class="svg-tn">x₁</text>
        <circle cx="150" cy="205" r="22" fill="#21252d" stroke="#6b8cbe" stroke-width="2"/><text x="150" y="210" text-anchor="middle" class="svg-tn">x₂</text>
        <circle cx="330" cy="95" r="22" fill="#21252d" stroke="#4f9d78" stroke-width="2"/><text x="330" y="100" text-anchor="middle" class="svg-tn">h₁</text>
        <circle cx="330" cy="205" r="22" fill="#21252d" stroke="#4f9d78" stroke-width="2"/><text x="330" y="210" text-anchor="middle" class="svg-tn">h₂</text>
        <circle cx="500" cy="150" r="22" fill="#21252d" stroke="#cf6f6f" stroke-width="2"/><text x="500" y="155" text-anchor="middle" class="svg-tn">ŷ</text>
      </g>
      <text x="150" y="255" text-anchor="middle" class="svg-t">输入层</text>
      <text x="330" y="255" text-anchor="middle" class="svg-t">隐藏层（ReLU）</text>
      <text x="500" y="255" text-anchor="middle" class="svg-t">输出层（Sigmoid）</text>
      <text x="150" y="40" text-anchor="middle" class="svg-t">特征进来</text>
      <text x="500" y="40" text-anchor="middle" class="svg-t">预测出去</text>
    </svg>
    <figcaption>图 2　贯穿全页的最小网络。每条连线是一个可学习的权重 <code>w</code>（高亮那条只是示意其中一条）；每个非输入圆圈是一个节点，先加权求和、再过激活函数。</figcaption>
  </figure>

  <table class="dd-table">
    <thead><tr><th>组成</th><th>它是什么</th><th>它解决什么</th></tr></thead>
    <tbody>
      <tr><td>输入层</td><td>承载特征向量 x，通常不做学习计算</td><td>把现实对象（像素、词、数值）变成一串数字</td></tr>
      <tr><td>权重 w</td><td>每条连线上的可学习系数</td><td>决定信息被放大、抑制还是反向</td></tr>
      <tr><td>偏置 b</td><td>每个非输入节点的可学习常数</td><td>平移触发门槛，使节点不必过原点</td></tr>
      <tr><td>节点 / 神经元</td><td>先加权求和，再过激活函数</td><td>检测某一种模式并输出响应强度</td></tr>
      <tr><td>隐藏层</td><td>输入与输出之间的中间层</td><td>逐层形成对任务更有用的新表示</td></tr>
      <tr><td>激活函数 φ</td><td>作用在加权和上的非线性函数</td><td>打破「多层仍等于一层」的线性坍缩</td></tr>
      <tr><td>输出层</td><td>把最终表示映射为任务输出</td><td>产生数值、概率或类别分布</td></tr>
    </tbody>
  </table>

  <h3>2.1 一个节点到底算了什么</h3>
  <div class="dd-formula">z = w·x + b = Σᵢ wᵢxᵢ + b　　　a = φ(z)</div>
  <p class="dd-formula-note"><code>z</code> 叫预激活值；<code>a</code> 是节点过完激活后、传给下一层的输出。</p>
  <div class="dd-note intuition"><b>把节点想成「可学习的模式探测器」</b>　向量 <code>w</code> 指定它关心哪个方向；点积 <code>w·x</code> 衡量输入与这个方向有多吻合；偏置 <code>b</code> 调节它多容易被触发；激活函数决定这份响应怎样通过。一个节点，只会检查<b>一种</b>模式。</div>

  <h3>2.2 为什么一层要放很多节点</h3>
  <p class="dd-lead">既然一个节点只认一种模式，那真实任务往往同时依赖很多模式——于是自然要很多节点。</p>
  <p>识别一张图，可能既要看横向边缘、纵向边缘、颜色对比，还要看这些局部怎样组合。所以一层会安排许多节点<b>并行地看同一份输入</b>，各自学不同的 <code>w</code> 和 <code>b</code>。这一层的输出于是不再是一个答案，而是 m 个探测器响应拼成的<b>新向量</b>：</p>
  <div class="dd-formula">a = [a₁, a₂, …, a_m]ᵀ</div>
  <p>下一层不再直接面对原始输入，而是面对这些响应——它可以把若干「边缘响应」组合成「角点」，再把角点组合成「局部形状」。<b>隐藏层的意义就在这里：它为下一层制造更好用的输入。</b></p>
  <div class="dd-note math"><b>矩阵只是压缩记号，不是新原理</b>　同时算一层的 m 个节点时，把它们的权重按行排成一个矩阵 <code>W</code>，就能把 m 条同样结构的式子缩写成一行：<code>z = Wx + b</code>，<code>a = φ(z)</code>。看到矩阵不必紧张，它只是「别一条条抄」的省事写法。</div>

  <h3>2.3 参数量：网络为什么容易变大</h3>
  <p>一个全连接层，若有 <code>n_in</code> 个输入、<code>n_out</code> 个节点，参数量是：</p>
  <div class="dd-formula">参数量 = n_in × n_out + n_out</div>
  <p>比如我们的例子 2 输入 → 2 隐藏 → 1 输出：<code>(2×2+2) + (2×1+1) = 9</code> 个参数。真实网络动辄上亿。参数越多、表达力越强，但计算、显存和<b>过拟合</b>风险也越大。网络设计的核心不是「越大越好」，而是让容量匹配数据量和任务难度。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>前向传播：网络怎样给出答案<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">结构有了，先看它「正着用」时怎么算出一个预测——这是后面讲「学习」的前提。</p>
  <p>前向传播（forward pass）就是从输入到输出，一层层算下去：</p>
  <ol class="dd-steps">
    <li>预处理输入 x（标准化数值、编码类别、缩放像素等）。</li>
    <li>算第一隐藏层的预激活 <code>z⁽¹⁾ = W⁽¹⁾x + b⁽¹⁾</code>。</li>
    <li>过激活函数 <code>a⁽¹⁾ = φ(z⁽¹⁾)</code>。</li>
    <li>把 <code>a⁽¹⁾</code> 当作下一层的输入，重复「线性变换 + 非线性」。</li>
    <li>输出层按任务选一个合适的变换，得到预测 <code>ŷ</code>。</li>
  </ol>
  <div class="dd-note key"><b>推理 ≠ 训练</b>　真实使用时通常<b>只做前向传播</b>，不改参数，只回答「在当前参数下，输出是什么」。训练则还要多回答三件事：错了多少？每个参数该负多大责任？下一步怎么改？——这正是第 6–8 节要建立的。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>激活函数：非线性从哪里来<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">第 1.3 节欠下的账：能力靠层间的非线性。这个非线性，就是激活函数 φ。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 640 200" role="img" aria-label="ReLU、Sigmoid、tanh 三种激活函数的形状">
      <g transform="translate(0,0)">
        <line x1="30" y1="100" x2="190" y2="100" stroke="#2c313b"/><line x1="110" y1="30" x2="110" y2="170" stroke="#2c313b"/>
        <polyline points="30,100 110,100 185,40" fill="none" stroke="#6b8cbe" stroke-width="2.4"/>
        <text x="110" y="192" text-anchor="middle" class="svg-t">ReLU = max(0, z)</text>
      </g>
      <g transform="translate(220,0)">
        <line x1="30" y1="100" x2="190" y2="100" stroke="#2c313b"/><line x1="110" y1="30" x2="110" y2="170" stroke="#2c313b"/>
        <path d="M30,150 C80,150 90,50 110,50 C130,50 140,50 190,50" fill="none" stroke="#4f9d78" stroke-width="2.4" transform="translate(0,0)"/>
        <path d="M35,145 C85,140 100,60 110,60 C120,60 140,55 185,55" fill="none" stroke="#4f9d78" stroke-width="2.4"/>
        <text x="110" y="192" text-anchor="middle" class="svg-t">Sigmoid → 0~1</text>
      </g>
      <g transform="translate(440,0)">
        <line x1="30" y1="100" x2="190" y2="100" stroke="#2c313b"/><line x1="110" y1="30" x2="110" y2="170" stroke="#2c313b"/>
        <path d="M35,160 C85,155 100,55 110,55" fill="none" stroke="#d3a05a" stroke-width="2.4" transform="translate(0,45) scale(1,0.9)"/>
        <path d="M35,150 C85,148 105,100 110,100 C115,100 135,52 185,48" fill="none" stroke="#d3a05a" stroke-width="2.4"/>
        <text x="110" y="192" text-anchor="middle" class="svg-t">tanh → −1~1</text>
      </g>
    </svg>
    <figcaption>图 3　三种常见激活函数的形状。它们的共同点是<b>都不是直线</b>——正是这个「拐弯」给了网络表达非线性的能力。</figcaption>
  </figure>

  <table class="dd-table">
    <thead><tr><th>函数</th><th>公式 / 范围</th><th>典型用途</th><th>主要代价</th></tr></thead>
    <tbody>
      <tr><td>ReLU</td><td>max(0, z)</td><td>多数隐藏层的稳健起点</td><td>z&lt;0 时梯度为 0，可能「死亡」</td></tr>
      <tr><td>Leaky ReLU</td><td>max(αz, z)</td><td>缓解死亡 ReLU</td><td>负半轴还要选个 α</td></tr>
      <tr><td>Sigmoid</td><td>1/(1+e⁻ᶻ)，0~1</td><td>二分类输出概率、门控</td><td>两端饱和，隐藏层易梯度消失</td></tr>
      <tr><td>tanh</td><td>−1~1</td><td>需要零中心输出时</td><td>仍会饱和</td></tr>
      <tr><td>GELU</td><td>平滑门控</td><td>现代 Transformer 隐藏层常见</td><td>计算略复杂</td></tr>
      <tr><td>Softmax</td><td>eᶻⁱ / Σⱼeᶻʲ</td><td>互斥多分类的输出层</td><td>类别多时计算与校准需注意</td></tr>
    </tbody>
  </table>

  <h3>4.1 ReLU 这么简单，凭什么能造出复杂边界</h3>
  <p>ReLU 在 <code>z=0</code> 处有一个「折点」。单个 ReLU 节点把输入空间切成「激活 / 不激活」两块；很多节点叠在一起，就把空间切成许多小块，<b>每块内部近似是直的、块与块之间斜率不同</b>。层层组合，这些分段直线就能拼出任意复杂的弯曲边界——这正好回应了图 1 里那条「需要曲线」。</p>

  <h3>4.2 先分清：隐藏层的激活 vs 输出层的变换</h3>
  <div class="dd-note warn"><b>你可能会困惑</b>　「Sigmoid、Softmax 不是也常出现在最后一层吗，它们到底算激活还是别的？」——这里要先划清界限，别把两件事混一起：</div>
  <table class="dd-table">
    <thead><tr><th>位置</th><th>它要回答的问题</th><th>常见选择</th></tr></thead>
    <tbody>
      <tr><td>隐藏层</td><td>怎样产生复杂、可组合的内部表示？</td><td>ReLU、GELU、tanh</td></tr>
      <tr><td>输出层</td><td>最终答案应该是什么范围和含义？</td><td>线性、Sigmoid、Softmax</td></tr>
    </tbody>
  </table>
  <p>隐藏层的激活是为了<b>制造非线性</b>；输出层的变换是为了<b>把内部数值翻译成有含义的答案</b>（比如一个概率）。它们长得像，目的不同。<b>输出层到底选哪种，不能只看它自己，还要连着「任务」和「损失函数」一起定——这个账留到第 6 节还。</b></p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>根本原理：可微分的函数复合<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">结构、前向、非线性都有了，现在把它们抽象成一句能记一辈子的话。</p>
  <div class="dd-note key"><b>一句话</b>　神经网络把一个复杂映射，拆成很多简单、<b>可微分</b>的小函数首尾相接。<b>函数复合</b>提供表达能力（能表示多复杂的关系），<b>可微分</b>提供可训练性（能算出每个参数该往哪调）。这两半，正好对应后面的前向与反向。</div>

  <h3>5.1 表示学习：层在「换坐标系」</h3>
  <p>每一层都在<b>重新编码</b>上一层的信息。对图像，早层可能响应边缘纹理，中层组合成局部形状，高层再组合成对象部件与类别证据。要点不是这些层一定对应人能命名的概念，而是它们逐层产生了对<b>最终任务</b>更好用的坐标系统——这就是「表示学习」，也是 1.1 节说的「自动学特征」的实现。</p>

  <h3>5.2 深与宽是两个不同的旋钮</h3>
  <table class="dd-table">
    <thead><tr><th>维度</th><th>增大它通常意味着</th><th>常见风险</th></tr></thead>
    <tbody>
      <tr><td>宽度（每层节点数）</td><td>同一抽象层级上并行检测更多模式</td><td>参数、显存、过拟合上升</td></tr>
      <tr><td>深度（隐藏层数）</td><td>用更多级复合表达层级结构</td><td>梯度传播与优化更难</td></tr>
    </tbody>
  </table>
  <div class="dd-note warn"><b>别被「万能逼近」误导</b>　理论上足够大的网络能逼近几乎任意连续函数，但这<b>不等于</b>它容易训练、也<b>不等于</b>它能凭空得到数据里没有的规律。表达能力、可优化性、样本效率、泛化能力，是四个必须分开看的问题。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>从内部数值到答案：输出层与损失<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">第 4.2 节欠的账在这里还：最后一个隐藏层给出的还只是一堆内部数值，要训练它，必须连续回答两个问题——这些数值怎样表示答案？答案又错了多少？</p>

  <h3>6.1 输出层：规定「答案的含义」</h3>
  <table class="dd-table">
    <thead><tr><th>任务</th><th>输出层变换</th><th>输出的含义</th><th>为什么这样选</th></tr></thead>
    <tbody>
      <tr><td>回归</td><td>线性 / 无激活</td><td>任意实数</td><td>房价、温度不该被压进 0~1</td></tr>
      <tr><td>二分类</td><td>Sigmoid</td><td>正类概率 0~1</td><td>把一个实数压成概率</td></tr>
      <tr><td>互斥多分类</td><td>Softmax</td><td>各类概率、和为 1</td><td>类别互相竞争，只能选一个</td></tr>
      <tr><td>多标签</td><td>每类独立 Sigmoid</td><td>每个标签各自的概率</td><td>多个标签可同时成立</td></tr>
    </tbody>
  </table>
  <p>可见 4.2 节说的「输出层变换」不是孤立技巧，而是<b>网络内部表示与真实任务之间的接口</b>。含义定下来，才能定义一种与之匹配的「错误度量」。</p>

  <h3>6.2 损失函数：把「错」变成一个可优化的数字</h3>
  <p>模型没法直接优化「看起来还行」。它需要一个<b>标量</b>目标 <code>L</code>，度量预测 <code>ŷ</code> 与真实 <code>y</code> 差多少。训练就是找一组参数 <code>θ</code>（网络里全部权重和偏置），让训练集上的平均损失尽量低、同时还能推广到新数据：</p>
  <div class="dd-formula">θ* = arg min_θ　(1/N) Σᵢ L(f(xᵢ; θ), yᵢ)</div>
  <table class="dd-table">
    <thead><tr><th>损失</th><th>示例公式</th><th>直觉</th></tr></thead>
    <tbody>
      <tr><td>均方误差 MSE</td><td>(ŷ − y)²</td><td>大误差被平方放大，常用于回归</td></tr>
      <tr><td>二元交叉熵 BCE</td><td>−[y ln ŷ + (1−y) ln(1−ŷ)]</td><td>正确类给的概率越低，罚得越重</td></tr>
      <tr><td>多类交叉熵</td><td>−Σₖ yₖ ln pₖ</td><td>只盯真实类别被分到的概率</td></tr>
    </tbody>
  </table>
  <div class="dd-note key"><b>损失 ≠ 评价指标</b>　损失是模型要最小化的<b>训练信号</b>，必须可求导；准确率、F1、AUC 是给人看的<b>评价指标</b>，往往不可导，因此一般不直接拿来做反向传播的目标。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>梯度下降：为什么要朝梯度的反方向走<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">现在有了一个「错多少」的数字，可网络有成千上万个参数。问题变成：该同时怎样改这些参数，才能让损失下降？</p>

  <h3>7.1 梯度先告诉你的其实是「上升最快」的方向</h3>
  <p>梯度 <code>∇_θ L</code> 是损失对每个参数的偏导数拼成的向量。关键要澄清一个常见误解：它<b>不是</b>直接指向最低点，而只描述当前位置附近——如果朝各个方向都走相同长度的一小步，<b>沿梯度方向损失升得最快</b>。</p>
  <div class="dd-formula">L(θ + εu) ≈ L(θ) + ε ∇L(θ)·u　（‖u‖ = 1）</div>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 220" role="img" aria-label="一维损失曲线上的梯度下降">
      <path d="M40,40 C160,240 400,240 520,40" fill="none" stroke="#3a4150" stroke-width="2"/>
      <!-- points stepping down -->
      <circle cx="120" cy="150" r="6" fill="#cf6f6f"/><circle cx="200" cy="192" r="6" fill="#d3a05a"/>
      <circle cx="280" cy="205" r="6" fill="#4f9d78"/>
      <line x1="120" y1="150" x2="185" y2="182" stroke="#6b8cbe" stroke-width="2" marker-end="url(#ah)"/>
      <line x1="200" y1="192" x2="266" y2="203" stroke="#6b8cbe" stroke-width="2" marker-end="url(#ah)"/>
      <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b8cbe"/></marker></defs>
      <text x="280" y="228" text-anchor="middle" class="svg-t">最低点（损失最小）</text>
      <text x="90" y="140" class="svg-t" fill="#cf6f6f">起点</text>
      <text x="470" y="70" class="svg-t">损失 L(θ)</text>
    </svg>
    <figcaption>图 4　把损失想成一条山谷。梯度指向「上坡最陡」的方向，所以每一步朝它的<b>反方向</b>（下坡最陡）走一小段，就能逐步逼近谷底。</figcaption>
  </figure>

  <div class="dd-note key"><b>直接回答标题的问题</b>　梯度给出「最快上升」，取负就是「最快下降」——这就是梯度下降。（顺带：并没有一个唯一的「下降最慢方向」；只要选得几乎与梯度垂直，下降就能慢到接近 0，白白浪费一步。）</div>

  <h3>7.2 方向对，还不等于一步到位</h3>
  <p>负梯度只保证在<b>足够小</b>的邻域内最陡。损失面是弯的，步子迈大了可能冲过谷底，所以还要用<b>学习率</b> <code>η</code> 控制步长：</p>
  <div class="dd-formula">θ ← θ − η ∇_θ L(θ)</div>
  <p class="dd-formula-note"><code>η</code> 太小则训练慢，太大则震荡甚至发散。</p>
  <p>把它放进一个循环，就是最基本的训练过程：</p>
  <ol class="dd-steps">
    <li>随机初始化参数，打破节点间的对称（见 10.1）。</li>
    <li>取一小批数据前向传播，得到预测。</li>
    <li>算这批的损失。</li>
    <li>反向传播，得到每个参数的梯度（第 8 节）。</li>
    <li>优化器按梯度和学习率更新参数。</li>
    <li>重复许多批、许多轮，并盯着训练/验证曲线。</li>
  </ol>
  <table class="dd-table">
    <thead><tr><th>术语</th><th>准确含义</th></tr></thead>
    <tbody>
      <tr><td>参数 parameter</td><td>模型内部<b>训练学到</b>的权重和偏置</td></tr>
      <tr><td>超参数 hyperparameter</td><td>训练者<b>手动设</b>的学习率、批大小、层数等</td></tr>
      <tr><td>batch</td><td>一次参数更新用到的一小批样本</td></tr>
      <tr><td>epoch</td><td>训练集被完整过一遍</td></tr>
      <tr><td>iteration / step</td><td>一次「前向 + 反向 + 更新」</td></tr>
    </tbody>
  </table>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>反向传播：链式法则如何分配责任<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">第 7 节反复用到「每个参数的梯度」。可网络有几百万参数，这些梯度到底怎么高效地算出来？</p>
  <div class="dd-note key"><b>先纠一个最常见的误解</b>　反向传播<b>不是</b>另一种优化器，而是<b>高效计算梯度的方法</b>。算完梯度后，真正更新参数的是梯度下降 / Adam。两者分工不同。</div>
  <p>它从输出端出发，用链式法则把「一个参数的微小变化」怎样一环环传到损失，逐层相乘：</p>
  <div class="dd-formula">∂L/∂w = ∂L/∂ŷ · ∂ŷ/∂a · ∂a/∂z · ∂z/∂w</div>
  <p class="dd-formula-note">链式法则把「参数变 → 节点变 → 预测变 → 损失变」这条因果链接了起来。</p>

  <h3>8.1 信用分配问题</h3>
  <p>一个预测可能是几百万参数共同作用的结果。损失只说「最终错了多少」，没说哪条连接该负责。梯度恰好回答：<b>只把某个参数增大一丁点，损失会怎么变</b>。正梯度说明增大它会让损失上升（所以该减小它），负梯度反之。</p>

  <h3>8.2 为什么不干脆「每个参数试一遍」</h3>
  <p>一个朴素办法：把某个权重稍微调大，重算一次损失看变化，再调回去换下一个。一百万个参数，就要约一百万次额外的前向计算——不可行。</p>
  <p>反向传播抓住了网络里的<b>共享结构</b>：许多靠前的参数，最终都要经过同一个靠后的节点才影响损失。于是只需先算一次「损失对这个后续节点有多敏感」，再把这份结果沿各条进入路径分发下去，就能继续分给更早的参数——<b>算过的下游影响不为每个参数重算</b>。一次从后往前的遍历，就拿到全部梯度。</p>
  <table class="dd-table">
    <thead><tr><th>做法</th><th>怎样估计参数影响</th><th>主要代价</th></tr></thead>
    <tbody>
      <tr><td>逐个试参数</td><td>每改一个参数，重做一次完整前向</td><td>参数越多，重复计算越多</td></tr>
      <tr><td>反向传播</td><td>从损失出发，逐层复用已算出的下游影响</td><td>一次反向即得全部梯度</td></tr>
    </tbody>
  </table>
  <div class="dd-note intuition"><b>不必先学新术语</b>　「计算图」「动态规划」可以用来精确描述这种复用，但它们<b>不是</b>理解反向传播的前提。核心就一句：<b>从后往前算一次，把同一份下游影响沿不同路径分发，而不是为每个参数从头再算。</b></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>完整手算：一次前向 + 一次更新<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">前面所有零件，在这里合成一次真实的数字演算。用的正是开头那个 2→2→1 的网络。</p>
  <p><b>任务</b>：输入 <code>x = [1, 2]</code>，真实标签 <code>y = 1</code>。网络 2 输入 → 2 个 ReLU 隐藏节点 → 1 个 Sigmoid 输出。做一次学习率 <code>η = 0.1</code> 的梯度下降更新。</p>

  <h3>9.1 初始参数</h3>
  <div class="dd-formula">W₁ = [[0.5, −0.25], [1.0, 0.5]]，　b₁ = [0, −1]<br>W₂ = [1.2, −0.7]，　b₂ = 0.3</div>
  <p class="dd-formula-note">W₁ 的每一行对应一个隐藏节点。</p>

  <h3>9.2 前向传播</h3>
  <ol class="dd-steps">
    <li>隐藏层预激活 <code>z₁ = W₁x + b₁ = [0.5·1 − 0.25·2,　1·1 + 0.5·2 − 1] = [0, 1]</code></li>
    <li>ReLU：<code>a₁ = [max(0,0), max(0,1)] = [0, 1]</code></li>
    <li>输出预激活 <code>z₂ = 1.2·0 + (−0.7)·1 + 0.3 = −0.4</code></li>
    <li>Sigmoid：<code>ŷ = 1/(1+e^0.4) ≈ 0.4013</code></li>
    <li>二元交叉熵：<code>L = −ln(0.4013) ≈ 0.913</code></li>
  </ol>

  <h3>9.3 反向传播</h3>
  <div class="dd-note math"><b>一个漂亮的简化</b>　Sigmoid 与二元交叉熵搭配时，输出层的梯度极简：<code>∂L/∂z₂ = ŷ − y</code>。这也是二分类默认这样配对的实用原因之一。</div>
  <ol class="dd-steps">
    <li><code>δ₂ = ŷ − y = 0.4013 − 1 = −0.5987</code></li>
    <li>输出权重梯度 <code>∂L/∂W₂ = δ₂·a₁ = [0, −0.5987]</code>；偏置 <code>∂L/∂b₂ = −0.5987</code></li>
    <li>传回隐藏层 <code>∂L/∂a₁ = W₂ᵀδ₂ = [−0.7184, 0.4191]</code></li>
    <li>ReLU 导数：节点1 的 z=0 取 0，节点2 的 z=1 取 1，故 <code>δ₁ = [0, 0.4191]</code></li>
    <li>第一层梯度 <code>∂L/∂W₁ = δ₁·xᵀ = [[0,0],[0.4191,0.8382]]</code>；<code>∂L/∂b₁ = [0, 0.4191]</code></li>
  </ol>

  <h3>9.4 更新并验证</h3>
  <div class="dd-formula">W_new = W_old − 0.1·∂L/∂W　　b_new = b_old − 0.1·∂L/∂b</div>
  <table class="dd-table">
    <thead><tr><th>参数</th><th>更新前</th><th>梯度</th><th>更新后</th></tr></thead>
    <tbody>
      <tr><td>W₂ 第二项</td><td>−0.7000</td><td>−0.5987</td><td>−0.6401</td></tr>
      <tr><td>b₂</td><td>0.3000</td><td>−0.5987</td><td>0.3599</td></tr>
      <tr><td>W₁ 第二行</td><td>[1.0, 0.5]</td><td>[0.4191, 0.8382]</td><td>[0.9581, 0.4162]</td></tr>
      <tr><td>b₁ 第二项</td><td>−1.0000</td><td>0.4191</td><td>−1.0419</td></tr>
    </tbody>
  </table>
  <p>用新参数再前向一次，预测从 <b>0.4013 升到约 0.4702</b>，损失从 <b>0.913 降到约 0.755</b>。一次更新很小，但成千上万批累积起来，网络就逐渐长出有效的内部表示。</p>
  <div class="dd-note key"><b>这才是「学习」</b>　训练不是把答案存进某个节点，而是让<b>所有参数沿着能降低总损失的方向，一起发生微小的协同变化</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>训练为什么会失败<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">原理讲通了，落地时还有一层现实：同样的网络，训练常常就是不收敛。先认识几种典型失败。</p>
  <table class="dd-table">
    <thead><tr><th>现象</th><th>根因</th><th>常见应对</th></tr></thead>
    <tbody>
      <tr><td>梯度消失</td><td>深层链式乘积里很多小于 1 的导数连乘</td><td>ReLU/GELU、残差连接、合适初始化与归一化</td></tr>
      <tr><td>梯度爆炸</td><td>连乘与权重尺度过大</td><td>降学习率、梯度裁剪、归一化、合理初始化</td></tr>
      <tr><td>死亡 ReLU</td><td>节点长期落在负半轴，输出和梯度都为 0</td><td>降学习率、Leaky ReLU、检查初始化</td></tr>
      <tr><td>训练损失不降</td><td>数据/标签错、学习率不当、梯度断裂</td><td>先用极小数据集故意过拟合，逐层查数值与梯度</td></tr>
      <tr><td>训练好、验证差</td><td>记住了训练细节，没学到可泛化规律</td><td>更多数据、正则化、早停、减小模型（见第 11 节）</td></tr>
    </tbody>
  </table>

  <h3>10.1 初始化不是细节</h3>
  <p>如果同一层所有节点用<b>完全相同</b>的初始参数，它们会收到相同梯度、永远保持相同，等于只有一个节点在干活。随机初始化就是用来<b>打破这种对称</b>；Xavier/Glorot、He 这类方法还会按层宽控制方差，让信号和梯度在层间不过快放大或缩小。</p>

  <h3>10.2 归一化与残差连接</h3>
  <p>批归一化 / 层归一化帮忙控制中间数值的尺度；残差连接让一层去学「在输入基础上加点什么」，同时给梯度开一条更直的回传路。<b>它们不是神经网络定义里必需的零件，却是深层网络能稳定训练的关键工程结构</b>——这也是原理层和工程层的分界。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>泛化：训练集好还不够<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">10.1 提到「训练好、验证差」。为什么这是核心难题，而不是小毛病？</p>
  <p>神经网络参数极多，多到足以<b>把训练样本背下来</b>。可真正的目标是在<b>没见过</b>的数据上也保持低误差——这叫泛化。所以必须始终把数据分成训练集 / 验证集 / 测试集，并按验证表现来挑架构和超参数。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 220" role="img" aria-label="训练损失持续下降，验证损失先降后升">
      <line x1="50" y1="30" x2="50" y2="185" stroke="#2c313b"/><line x1="50" y1="185" x2="520" y2="185" stroke="#2c313b"/>
      <path d="M55,60 C150,120 320,165 515,178" fill="none" stroke="#6b8cbe" stroke-width="2.4"/>
      <path d="M55,75 C170,150 250,150 340,120 C420,95 470,80 515,70" fill="none" stroke="#cf6f6f" stroke-width="2.4"/>
      <line x1="300" y1="30" x2="300" y2="185" stroke="#d3a05a" stroke-width="1.6" stroke-dasharray="5 4"/>
      <text x="300" y="24" text-anchor="middle" class="svg-t" fill="#d3a05a">早停点</text>
      <text x="470" y="172" class="svg-t" fill="#6b8cbe">训练损失</text>
      <text x="430" y="60" class="svg-t" fill="#cf6f6f">验证损失</text>
      <text x="285" y="205" text-anchor="middle" class="svg-t">训练时间 →</text>
    </svg>
    <figcaption>图 5　训练损失一路降，不代表模型一路变好。当验证损失开始回升，模型已经在「背」而非「学」——那一刻正是该早停的地方。</figcaption>
  </figure>

  <table class="dd-table">
    <thead><tr><th>方法</th><th>作用机制</th><th>注意</th></tr></thead>
    <tbody>
      <tr><td>L2 / 权重衰减</td><td>惩罚过大的权重，偏向更平滑的解</td><td>太强会欠拟合</td></tr>
      <tr><td>Dropout</td><td>训练时随机屏蔽部分节点，减少共适应</td><td>推理时关闭并处理缩放</td></tr>
      <tr><td>早停</td><td>验证损失开始变差就停</td><td>要保存最佳验证检查点</td></tr>
      <tr><td>数据增强</td><td>制造保持标签不变的合理变化</td><td>增强要符合真实任务不变性</td></tr>
      <tr><td>减小模型</td><td>直接降低容量</td><td>可能牺牲表达能力</td></tr>
    </tbody>
  </table>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">12</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">泛化是最后一道检验，但它不是凭空冒出的新主题。现在把全页串成一条链，逐环检查「每个概念为什么必须存在」。</p>
  <ol class="dd-chain">
    <li>输入 x 把现实对象表示成数字；单个线性模型表达不了复杂的非线性关系。<span>（§1）</span></li>
    <li>节点用权重和偏置检查一种模式；很多节点并行，形成一层新表示。<span>（§2）</span></li>
    <li>层间的激活函数打破线性坍缩，使多层复合能构造复杂函数。<span>（§4）</span></li>
    <li>前向传播把输入逐层变成内部表示；输出层再翻译成有任务含义的预测。<span>（§3、§6）</span></li>
    <li>损失函数把预测错误压缩成一个可比较、可求导的数字。<span>（§6）</span></li>
    <li>反向传播用链式法则算出每个参数对损失的责任；负梯度给出最快下降方向。<span>（§7、§8）</span></li>
    <li>优化器反复更新参数，让训练损失下降；验证数据再检查这种改进能不能迁移到没见过的样本。<span>（§9、§11）</span></li>
  </ol>
  <div class="dd-note key"><b>为什么到这里才算闭环</b>　网络能拟合训练数据，只说明「表达 + 优化」成功；只有<b>验证表现也变好</b>，才说明它学到的关系有泛化价值。所以这条链不是停在「损失下降」，而是停在「未见数据上受检验」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">13</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>节点就是生物神经元</td><td>只是受生物启发的数学计算单元，不能据此推断认知机制</td></tr>
      <tr><td>层数越多一定越好</td><td>深度提高表达潜力，也提高优化难度与成本</td></tr>
      <tr><td>隐藏层会自动学成人类概念</td><td>它学的是对任务有用的分布式表示，未必可命名、可解释</td></tr>
      <tr><td>反向传播 = 梯度下降</td><td>反向传播<b>算</b>梯度；梯度下降 / Adam <b>用</b>梯度更新</td></tr>
      <tr><td>梯度指向下降方向</td><td>梯度指向<b>最快上升</b>方向；梯度下降用它的反方向</td></tr>
      <tr><td>训练损失低就说明成功</td><td>还要看验证、测试与真实分布上的表现</td></tr>
      <tr><td>万能逼近 = 无所不能</td><td>只说明存在某种近似能力，不保证数据够、训得动、能泛化</td></tr>
    </tbody>
  </table>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">14</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>不用激活函数时，为什么十层全连接网络仍等价于一层？</li>
    <li>权重和偏置分别控制什么？为什么偏置不是可有可无？</li>
    <li>隐藏层叫「隐藏」，是因为它不可观测，还是因为它夹在输入和目标之间？</li>
    <li>前向传播、反向传播、优化器各自完成什么工作？</li>
    <li>梯度明明指向损失上升最快的方向，为什么梯度下降还要先算它？「下降最慢的方向」为什么没有实用价值？</li>
    <li>学习率太大时，损失曲线通常会怎样？</li>
    <li>二分类为什么常用 Sigmoid + 二元交叉熵这对搭配？</li>
    <li>训练损失继续降、验证损失却上升，说明了什么？</li>
    <li>为什么梯度消失会<b>先</b>伤害靠近输入的层？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>线性/仿射变换的复合仍是一个线性/仿射变换，可把多组矩阵与偏置合并成一组。</li>
      <li>权重控制输入的方向与强度；偏置平移响应阈值，使决策边界不必过原点。</li>
      <li>主要因为它们不是数据里直接给的输入或标签，而是模型内部学到的中间表示。</li>
      <li>前向传播算预测；反向传播用链式法则算梯度；优化器用梯度更新参数。</li>
      <li>梯度的反方向就是同等步长下的最快下降方向；几乎与梯度垂直的方向下降可以慢到接近 0，甚至一阶近似下不变，因此无法有效减少损失。</li>
      <li>可能震荡、突然升高甚至发散，无法稳定收敛。</li>
      <li>Sigmoid 把输出压成 0~1 概率；交叉熵对「错且自信」的预测强惩罚，且两者搭配后梯度极简（ŷ − y）。</li>
      <li>模型在过拟合；应考虑早停、正则化、增数据或减容量。</li>
      <li>靠近输入的层，其梯度要穿过更多后续层的小导数连乘，因此更容易趋近 0。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">15</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>特征、标签、线性回归、逻辑回归、向量与矩阵、导数</td></tr>
      <tr><td><b>本页核心</b></td><td>节点、权重、偏置、隐藏层、激活函数、损失、前向传播、反向传播、梯度下降</td></tr>
      <tr><td>训练深化</td><td>初始化、mini-batch、Adam、学习率调度、归一化、正则化、过拟合</td></tr>
      <tr><td>架构延伸</td><td>卷积神经网络、循环神经网络、注意力、Transformer、残差网络</td></tr>
      <tr><td>可信与部署</td><td>可解释性、校准、分布偏移、鲁棒性、推理延迟、模型压缩</td></tr>
    </tbody>
  </table>
  <div class="dd-note key"><b>过关标准</b>　如果你能不背诵地讲清「非线性为什么必要」，并能从 <code>z = Wx + b</code> 一路推到一次梯度更新，你就已经真正跨过了神经网络的原理门槛。</div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>　本文为 AI 知识地图的原创中文教学页，结构与部分教学要点参考 Google Machine Learning Crash Course（内容除另有说明外采用 CC BY 4.0），并作了重新组织、扩写、手算推导与原创制图；未复制其交互组件。
  <ul>
    <li><a href="https://developers.google.com/machine-learning/crash-course/neural-networks" target="_blank" rel="noopener">Google ML Crash Course: Neural networks ↗</a></li>
    <li><a href="https://developers.google.com/machine-learning/crash-course/neural-networks/backpropagation" target="_blank" rel="noopener">Google: Training using backpropagation ↗</a></li>
    <li><a href="https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent" target="_blank" rel="noopener">Google: Gradient descent ↗</a></li>
    <li><a href="https://developers.google.com/machine-learning/crash-course/overfitting/overfitting" target="_blank" rel="noopener">Google: Overfitting ↗</a></li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-20</div>
</div>
`
};
