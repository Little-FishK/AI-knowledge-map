/* 理解原理页 —— 监督学习 Supervised Learning
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["supervised-learning"] = {
  title: "监督学习",
  subtitle: "给足「题目 + 标准答案」，让模型学会自己答题",
  aliases: "Supervised Learning · 有监督学习",
  meta: "建议 25–35 分钟 · 基础 · 需要：函数、向量的基本概念",
  thesis: "监督学习是机器学习最基本的范式：喂给模型大量「输入 + 正确答案（标签）」的样本，让它学出一个从输入到输出的函数，好在<b>没见过的新输入</b>上也能给对答案。今天从垃圾邮件识别，到大模型的指令微调，底子都是它。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——「监督」到底监督了什么，标签是什么角色。</li>
    <li><b>两类任务</b>——分类和回归的区别，答案分别长什么样。</li>
    <li><b>学习在学什么</b>——抽象地说，训练就是在做一件什么事。</li>
    <li><b>成败标准</b>——为什么「训练集全做对」不算成功。</li>
    <li><b>它的短板</b>——标注这个瓶颈，怎样催生了无监督、自监督。</li>
    <li><b>今天的位置</b>——大模型时代，为什么还离不开它。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　教模型识别<b>垃圾邮件</b>：每个样本是一封邮件（输入），配一个人工标好的答案（标签：垃圾 / 正常）。给它看几万封这样标好的邮件，它就该学会给<b>新来的</b>邮件判断是不是垃圾。全页围绕它展开。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是监督学习<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：想让机器「学」一件事，最直接的办法是什么？</p>
  <p>最直接的办法，和教小孩做题一样：<b>给它一大叠「题目 + 标准答案」，让它做，做错了就纠正</b>。这里的「标准答案」，就是<b>标签（label）</b>；「监督」二字，指的正是<b>每个样本都有一个已知的正确答案在旁边盯着</b>，告诉模型对错。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>要素</th><th>在垃圾邮件例子里</th></tr></thead>
    <tbody>
      <tr><td>输入 x（特征）</td><td>一封邮件的内容</td></tr>
      <tr><td>标签 y（正确答案）</td><td>人工标注的「垃圾」或「正常」</td></tr>
      <tr><td>训练集</td><td>几万条「邮件 → 标签」样本</td></tr>
      <tr><td>目标</td><td>学一个规则，对<b>没标注过的新邮件</b>也判得准</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>关键在最后一行</b>　监督学习的价值不在于把见过的邮件背下来，而在于<b>推广到没见过的邮件</b>。这一点贯穿全页，第 4 节会专门讲。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>两种任务：分类与回归<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">上一节的标签是「垃圾/正常」。但答案不总是这种「几选一」。答案长什么样，把监督学习分成两大类。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>任务</th><th>答案是什么</th><th>例子</th></tr></thead>
    <tbody>
      <tr><td><b>分类</b></td><td>离散的类别（几选一）</td><td>垃圾/正常、猫/狗/鸟、好评/差评</td></tr>
      <tr><td><b>回归</b></td><td>连续的数值</td><td>房价、明天气温、点击率</td></tr>
    </tbody>
  </table></div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 220" role="img" aria-label="分类是画分界线，回归是拟合一条线">
      <g>
        <rect x="20" y="20" width="250" height="180" rx="8" fill="none" stroke="#2c313b"/>
        <text x="145" y="42" text-anchor="middle" class="svg-t">分类：画一条分界</text>
        <g fill="#6b8cbe"><circle cx="70" cy="80" r="5"/><circle cx="95" cy="110" r="5"/><circle cx="60" cy="140" r="5"/><circle cx="110" cy="150" r="5"/><circle cx="85" cy="165" r="5"/></g>
        <g fill="#cf6f6f"><circle cx="200" cy="70" r="5"/><circle cx="220" cy="100" r="5"/><circle cx="180" cy="120" r="5"/><circle cx="225" cy="140" r="5"/><circle cx="195" cy="160" r="5"/></g>
        <line x1="150" y1="55" x2="140" y2="190" stroke="#4f9d78" stroke-width="2"/>
      </g>
      <g>
        <rect x="290" y="20" width="250" height="180" rx="8" fill="none" stroke="#2c313b"/>
        <text x="415" y="42" text-anchor="middle" class="svg-t">回归：拟合一条线</text>
        <line x1="315" y1="185" x2="315" y2="60" stroke="#2c313b"/><line x1="315" y1="185" x2="520" y2="185" stroke="#2c313b"/>
        <g fill="#6b8cbe"><circle cx="340" cy="170" r="5"/><circle cx="375" cy="150" r="5"/><circle cx="410" cy="140" r="5"/><circle cx="440" cy="110" r="5"/><circle cx="480" cy="95" r="5"/><circle cx="505" cy="75" r="5"/></g>
        <line x1="325" y1="180" x2="515" y2="70" stroke="#d3a05a" stroke-width="2"/>
      </g>
    </svg>
    <figcaption>图 1　同样是「从输入预测输出」，分类学的是一条把类别分开的<b>边界</b>，回归学的是一条尽量穿过数据的<b>趋势线</b>。答案是离散还是连续，决定了用哪一类、配哪种损失。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>「学习」到底在学什么<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">分类、回归看着不同，但抽象成数学，训练在做的是<b>同一件事</b>。是什么？</p>
  <p>把要学的规则看成一个<b>带参数的函数</b> <code>f_θ</code>：喂进输入 x，吐出预测 <code>f_θ(x)</code>。学习，就是<b>调参数 θ，让预测尽量贴近标签</b>：</p>
  <div class="dd-formula">找 θ，使 &nbsp; Σᵢ L( f_θ(xᵢ) , yᵢ ) &nbsp; 最小</div>
  <p class="dd-formula-note"><code>L</code> 是损失函数，衡量「预测」离「标签」有多远；对全部样本求和再最小化，就是训练。</p>
  <div class="dd-note math"><b>这就把很多东西接上了</b>　「有标签 + 一个可微函数 + 一个损失 + 梯度下降」正是训练一个<b>神经网络</b>的标准配方（见「神经网络」深读页）。<b>神经网络是模型，监督学习是训练它的方式之一。</b>决策树、支持向量机（SVM）等经典模型同样用监督学习来训。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>成败标准：不是背，是泛化<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">既然训练是「让预测贴近标签」，那把训练集的标签全预测对，是不是就成功了？</p>
  <div class="dd-note warn"><b>恰恰不是</b>　模型参数一多，足以把训练集<b>死记硬背</b>下来——训练集 100 分，一遇到新邮件就抓瞎。真正要的是在<b>没见过的数据</b>上准，这叫<b>泛化</b>。</div>
  <p>所以标准做法是把数据分成三份，各司其职：</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 96" role="img" aria-label="数据分成训练、验证、测试三份">
      <rect x="20" y="30" width="330" height="34" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="185" y="52" text-anchor="middle" class="svg-tn" font-size="13">训练集</text>
      <rect x="356" y="30" width="90" height="34" rx="5" fill="#21252d" stroke="#4f9d78"/><text x="401" y="52" text-anchor="middle" class="svg-t">验证集</text>
      <rect x="452" y="30" width="88" height="34" rx="5" fill="#21252d" stroke="#d3a05a"/><text x="496" y="52" text-anchor="middle" class="svg-t">测试集</text>
      <text x="185" y="82" text-anchor="middle" class="svg-t">用来调参数</text>
      <text x="401" y="82" text-anchor="middle" class="svg-t">用来挑模型/超参</text>
      <text x="496" y="82" text-anchor="middle" class="svg-t">最后验收一次</text>
    </svg>
    <figcaption>图 2　训练集调参数，验证集帮你在不同模型/超参之间挑，测试集是<b>只用一次</b>的期末考——它模拟「真实世界的新数据」。测试集一旦被反复用来调，就等于泄题，失去意义。</figcaption>
  </figure>
  <div class="dd-note intuition"><b>和过拟合是同一件事</b>　训练误差一直降、验证误差却开始升，就是<b>过拟合</b>的信号——模型在背而非学。对付它的一整套手段（正则化、早停、加数据）见「过拟合」「正则化」节点。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>监督的代价：标注瓶颈<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">这么直接有效的办法，短板在哪？答案就藏在「监督」这两个字里。</p>
  <p>监督学习的燃料是<b>带标签的数据</b>，而标签几乎都要<b>人来标</b>：一封封邮件标垃圾/正常，一张张图圈出物体，一段段录音转成文字。这带来一个硬瓶颈：</p>
  <ul class="dd-steps">
    <li><b>贵、慢</b>：大规模标注是巨量人力，很多领域还得请专家（医学影像、法律）。</li>
    <li><b>有限</b>：标注量决定了模型能力的天花板——标得起多少，就大概只能学到多少。</li>
    <li><b>有歧义</b>：有些任务人自己都难标一致（这条评论算不算讽刺？）。</li>
  </ul>
  <div class="dd-note key"><b>这个瓶颈很重要</b>　正是「人工标注贵且有限」这件事，逼出了下一节的其它范式——尤其是<b>自监督</b>，它让数据<b>自己给自己当标签</b>，从而绕开人工标注、吃下海量数据。大模型的崛起，根子就在这里。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>它不是唯一范式：四种学法<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">如果没有现成的标准答案，机器还能怎么学？把监督学习放进更大的地图里看。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>范式</th><th>靠什么学</th><th>典型任务</th></tr></thead>
    <tbody>
      <tr><td><b>监督学习</b></td><td>带标签的样本</td><td>分类、回归</td></tr>
      <tr><td>无监督学习</td><td>无标签，自己找结构</td><td>聚类、降维</td></tr>
      <tr><td>自监督学习</td><td>无需人工标注，用数据本身构造答案</td><td>大模型预训练（预测下一个词）</td></tr>
      <tr><td>强化学习</td><td>在环境里试错，靠奖励信号</td><td>下棋、机器人、对齐里的 RLHF</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>自监督是「监督学习的聪明变体」</b>　它照样是「给输入、给答案、算损失」的那套机制，妙在<b>答案不用人标</b>——比如把「预测下一个词」当任务，正确答案就是文本里真实的下一个词（见「大语言模型」深读页第 5 节）。于是数据近乎无限，能一路 scale。理解监督学习，是理解这一切的地基。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>大模型时代，它还重要吗<span class="dd-badge eng">工程</span><span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">既然大模型靠自监督预训练，那还学监督学习干嘛？</p>
  <p>因为它是整座大厦的<b>通用语言</b>，在今天依然处处都在：</p>
  <ul class="dd-steps">
    <li><b>把基座变助手</b>：指令微调（SFT）就是监督学习——「指令」是输入，「理想回答」是标签（见「微调」深读页）。</li>
    <li><b>大量下游任务</b>：垂直领域的分类、打分、抽取，很多仍是标好数据做监督学习最省最稳。</li>
    <li><b>评测</b>：几乎所有带标准答案的评测集，本质都是监督学习的「测试集」。</li>
  </ul>
  <div class="dd-note key"><b>一句话定位</b>　大模型改变了「大部分知识从哪来」（自监督预训练），但<b>没有取代</b>监督学习——它退到了更关键的位置：<b>校准行为、适配任务、衡量好坏</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>给「输入 + 正确答案」的样本，让模型学一个从输入到输出的规则——这就是监督学习。<span>（§1）</span></li>
    <li>答案离散就是分类，连续就是回归。<span>（§2）</span></li>
    <li>抽象地看，训练 = 调参数让「预测」贴近「标签」，即最小化损失。<span>（§3）</span></li>
    <li>成功的标准不是背下训练集，而是在没见过的数据上准（泛化），故要分训练/验证/测试。<span>（§4）</span></li>
    <li>它的燃料是人工标签，而标注贵、慢、有限——这是它的天花板。<span>（§5）</span></li>
    <li>为绕开标注瓶颈，出现了无监督、自监督、强化学习；自监督让数据自造标签，撑起了大模型。<span>（§6）</span></li>
    <li>大模型时代它没被取代，而是转去校准行为（SFT）、适配下游、做评测。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「监督学习为什么追求泛化而不是背训练集」，并说出「自监督为什么被看作它的聪明变体、又为什么对大模型如此关键」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>监督学习 = 神经网络</td><td>它是一种<b>训练方式</b>；神经网络、决策树、SVM 都能用它来训</td></tr>
      <tr><td>训练集准了就成功了</td><td>目标是<b>泛化</b>到新数据；训练集满分可能只是过拟合</td></tr>
      <tr><td>数据越多一定越好</td><td>标签<b>质量与代表性</b>常比数量更关键；标注还很贵</td></tr>
      <tr><td>大模型时代它过时了</td><td>预训练是自监督，但 SFT、下游任务、评测仍是监督学习</td></tr>
      <tr><td>自监督是另一回事</td><td>自监督是监督学习的变体，区别只在「标签不用人标」</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>「监督」监督的是什么？标签在其中扮演什么角色？</li>
    <li>分类和回归的根本区别是什么？各举一例。</li>
    <li>用一句话说清：抽象地看，监督学习的训练在做什么？</li>
    <li>为什么「训练集全预测对」不代表模型成功？该怎么正确评估？</li>
    <li>监督学习最大的现实瓶颈是什么？它催生了哪种范式？</li>
    <li>为什么说自监督是监督学习的「聪明变体」？它对大模型为何关键？</li>
    <li>大模型时代，监督学习还在哪些环节发挥作用？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>监督的是「每个样本都有已知正确答案」；标签就是这个正确答案，训练时用它来判对错、算损失。</li>
      <li>答案是离散类别就是分类（垃圾/正常），是连续数值就是回归（房价）。</li>
      <li>调整模型参数，使它对训练样本的预测尽量贴近标签，即最小化损失。</li>
      <li>因为参数够多能背下训练集却不会泛化；要用独立的验证集选模型、只用一次的测试集验收，看它在没见过的数据上的表现。</li>
      <li>人工标注贵、慢、有限；这个瓶颈催生了自监督（以及无监督、强化学习）。</li>
      <li>因为它照用「输入-答案-损失」那套机制，只是答案由数据本身构造、不用人标；于是数据近乎无限，能撑起大模型预训练的规模。</li>
      <li>把基座变助手的指令微调（SFT）、大量下游垂直任务、以及带标准答案的评测。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>特征与标签、函数、向量、损失函数、梯度下降</td></tr>
      <tr><td><b>本页核心</b></td><td>标签、分类与回归、泛化、训练/验证/测试、四种学习范式</td></tr>
      <tr><td>紧邻延伸</td><td>神经网络、过拟合、正则化、无监督学习、自监督学习、强化学习</td></tr>
      <tr><td>更远</td><td>预训练、微调与指令微调、大语言模型、评测</td></tr>
    </tbody>
  </table></div>
</section>
`
};
