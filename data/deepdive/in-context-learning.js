/* 理解原理页 —— 上下文学习 In-Context Learning
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["in-context-learning"] = {
  title: "上下文学习",
  subtitle: "不改一个参数，只靠提示里的几个例子就学会新任务",
  aliases: "In-Context Learning · ICL · 情境学习 · few-shot 学习",
  meta: "建议 25–35 分钟 · 基础 → 中级 · 需要：了解「大语言模型」怎样预测下一个词",
  thesis: "上下文学习是大模型的一种能力：仅凭提示里给出的几个示例，它就能<b>当场</b>学会一个新任务——全程<b>不更新任何权重</b>。它不是「训练」，而是「预测下一个词」这个本事的直接延伸：模型把提示当成一份<b>任务说明书</b>，在一次前向传播里现学现用。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——zero-shot / few-shot 到底指什么，「不训练就学会」是什么意思。</li>
    <li><b>与微调的区别</b>——同样是「学新任务」，改不改权重带来了哪些根本差异。</li>
    <li><b>凭什么</b>——一个只会猜下一个词的模型，看几个例子就会照做，机制上说得通吗。</li>
    <li><b>反直觉发现</b>——为什么示例的标签「对不对」，没你想的那么重要。</li>
    <li><b>怎么用好</b>——示例的数量、选择、顺序、格式，各自怎么影响效果。</li>
    <li><b>边界</b>——它这么方便，为什么还需要微调；它的天花板在哪。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　一个「情感分类」的 few-shot 提示：<br>
  <code>评论：这家餐厅太棒了 → 正面</code><br>
  <code>评论：又贵又难吃 → 负面</code><br>
  <code>评论：服务很周到 → ___</code><br>
  没有任何训练，模型看完前两行，就会把第三行补成「正面」。全页围绕它展开。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是上下文学习<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：不做任何训练，怎么可能让模型「学会」一个它没专门练过的新任务？</p>
  <p>办法出奇简单：<b>把任务的几个示例直接写进提示里</b>，模型读完就照着做。按给几个示例，分成三档：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>档位</th><th>提示里给几个示例</th><th>例子</th></tr></thead>
    <tbody>
      <tr><td>zero-shot（零示例）</td><td>0 个，只给任务描述</td><td>「判断下面评论的情感：又贵又难吃」</td></tr>
      <tr><td>one-shot（单示例）</td><td>1 个</td><td>给 1 组「评论 → 情感」，再问新的</td></tr>
      <tr><td>few-shot（少示例）</td><td>几个</td><td>就是上面那个最小例子</td></tr>
    </tbody>
  </table></div>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 180" role="img" aria-label="few-shot 提示的构成：几组示例加一个查询">
      <text x="20" y="26" class="svg-t">一个 few-shot 提示 = 几组「输入 → 输出」示例 ＋ 一个待答的查询</text>
      <g font-size="13">
        <rect x="24" y="42" width="230" height="26" rx="4" fill="#21252d" stroke="#2c313b"/><text x="34" y="59" class="svg-tn" font-size="13">评论：这家餐厅太棒了</text>
        <text x="266" y="59" class="svg-t">→</text><rect x="284" y="42" width="70" height="26" rx="4" fill="#21252d" stroke="#4f9d78"/><text x="319" y="59" text-anchor="middle" class="svg-tn" font-size="13">正面</text>
        <text x="380" y="59" class="svg-t">示例 1</text>

        <rect x="24" y="76" width="230" height="26" rx="4" fill="#21252d" stroke="#2c313b"/><text x="34" y="93" class="svg-tn" font-size="13">评论：又贵又难吃</text>
        <text x="266" y="93" class="svg-t">→</text><rect x="284" y="76" width="70" height="26" rx="4" fill="#21252d" stroke="#cf6f6f"/><text x="319" y="93" text-anchor="middle" class="svg-tn" font-size="13">负面</text>
        <text x="380" y="93" class="svg-t">示例 2</text>

        <rect x="24" y="112" width="230" height="26" rx="4" fill="#1a1d23" stroke="#6b8cbe"/><text x="34" y="129" class="svg-tn" font-size="13">评论：服务很周到</text>
        <text x="266" y="129" class="svg-t">→</text><rect x="284" y="112" width="70" height="26" rx="4" fill="#1a1d23" stroke="#d3a05a" stroke-dasharray="4 3"/><text x="319" y="129" text-anchor="middle" class="svg-t" font-size="13">？</text>
        <text x="380" y="129" class="svg-t" fill="#d3a05a">查询：模型来补</text>
      </g>
    </svg>
    <figcaption>图 1　few-shot 提示的骨架：前面几行用「输入 → 输出」演示任务，最后一行只给输入、把输出留空。模型要做的，还是它唯一会做的事——预测下一个 token，而此刻「最可能的下一个 token」正好是「正面」。</figcaption>
  </figure>

  <h3>1.1 运行示例：连标签含义也由上下文临时定义</h3>
  <p>把熟悉的“正面/负面”换成任意标签 <code>zorp</code>/<code>blip</code>，就能更清楚地看到模型究竟从提示里恢复了什么：</p>
  <table class="dd-table"><thead><tr><th>提示行</th><th>模型可提取的信息</th></tr></thead><tbody><tr><td>“太棒了” → zorp</td><td>zorp 与正向情感关联</td></tr><tr><td>“又贵又难吃” → blip</td><td>blip 与负向情感关联</td></tr><tr><td>“服务很周到” → ?</td><td>沿临时映射应输出 zorp</td></tr></tbody></table>
  <p>这不是把 <code>zorp</code> 的新含义永久写入权重，而是在当前 token 序列里利用示例建立临时映射。删除前两行后，模型没有理由在下一次请求中继续按这个约定回答。</p>

  <div class="dd-note warn"><b>「学习」二字要小心</b>　它并没有像人那样把知识「记住」。这里的「学」是<b>当场照着示例办</b>，全程不改一个权重；<b>对话一结束就忘</b>，下次还得把示例重新给一遍。后面第 2、7 节会把这层含义说透。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它和微调的根本区别<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">你可能会问：让模型「学会新任务」，不是已经有「微调」了吗？这两者差在哪？</p>
  <p>差在一件根本的事：<b>改不改权重</b>。微调是在训练阶段用数据<b>永久改造</b>模型的参数；上下文学习是在使用阶段靠一段提示<b>临时适配</b>，参数一动不动。</p>

  <figure class="dd-fig">
    <svg viewBox="0 0 560 200" role="img" aria-label="微调改权重、上下文学习不改权重">
      <text x="20" y="24" class="svg-t">微调（训练时）</text>
      <rect x="24" y="34" width="90" height="30" rx="6" fill="#21252d" stroke="#2c313b"/><text x="69" y="53" text-anchor="middle" class="svg-t">标注数据</text>
      <line x1="114" y1="49" x2="150" y2="49" stroke="#6b7484" stroke-width="1.6" marker-end="url(#b1)"/>
      <rect x="150" y="34" width="80" height="30" rx="6" fill="#1a1d23" stroke="#d3a05a"/><text x="190" y="53" text-anchor="middle" class="svg-t">训练</text>
      <line x1="230" y1="49" x2="266" y2="49" stroke="#6b7484" stroke-width="1.6" marker-end="url(#b1)"/>
      <rect x="266" y="34" width="150" height="30" rx="6" fill="#21252d" stroke="#4f9d78"/><text x="341" y="53" text-anchor="middle" class="svg-tn" font-size="13">权重被改了（持久）</text>

      <text x="20" y="118" class="svg-t">上下文学习（使用时）</text>
      <rect x="24" y="128" width="120" height="30" rx="6" fill="#21252d" stroke="#2c313b"/><text x="84" y="147" text-anchor="middle" class="svg-t">提示（含示例）</text>
      <line x1="144" y1="143" x2="180" y2="143" stroke="#6b7484" stroke-width="1.6" marker-end="url(#b1)"/>
      <rect x="180" y="128" width="100" height="30" rx="6" fill="#1a1d23" stroke="#6b8cbe"/><text x="230" y="147" text-anchor="middle" class="svg-t">一次前向</text>
      <line x1="280" y1="143" x2="316" y2="143" stroke="#6b7484" stroke-width="1.6" marker-end="url(#b1)"/>
      <rect x="316" y="128" width="80" height="30" rx="6" fill="#21252d" stroke="#4f9d78"/><text x="356" y="147" text-anchor="middle" class="svg-tn" font-size="13">答案</text>
      <text x="410" y="147" class="svg-t" fill="#6b8cbe">权重没变</text>
      <defs><marker id="b1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 2　微调是一次「改造模型」的工程，结果写进权重、对之后所有请求都生效；上下文学习是一次「临时借用」，只在这一段提示里有效，请求一结束就没了。</figcaption>
  </figure>

  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>上下文学习</th><th>微调</th></tr></thead>
    <tbody>
      <tr><td>改权重吗</td><td>不改</td><td>改</td></tr>
      <tr><td>要什么</td><td>一段带示例的提示</td><td>一批标注数据 + 一次训练</td></tr>
      <tr><td>多快见效</td><td>即时</td><td>要训练，慢</td></tr>
      <tr><td>能持续多久</td><td>一次性，用完就忘</td><td>永久，之后请求都带着</td></tr>
      <tr><td>容量</td><td>受上下文窗口限制，示例塞不多</td><td>可用海量样本</td></tr>
      <tr><td>成本结构</td><td>每次请求都为示例付 token</td><td>训练一次贵，之后每次请求省</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note eng"><b>一句话记住分工</b>　上下文学习是<b>运行时的临时适配</b>，微调是<b>训练时的永久改造</b>。任务少、要立刻用、经常变，选前者；任务固定、样本多、要长期稳定省成本，选后者。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>它凭什么成立<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的一节：一个训练目标只是「预测下一个词」的模型，凭什么看几个例子就会照做，还没人教过它「学习」？</p>
  <div class="dd-note warn"><b>先把疑点摆明</b>　模型从没被显式训练过「读示例、归纳规律、应用到新输入」。上下文学习是一种<b>没被直接教、却自己冒出来的</b>能力。它从哪来？</div>
  <p>线索藏在预训练数据里。互联网文本中<b>充满了「重复的模式」</b>：一份格式统一的列表、一串「问：… 答：…」、一段一问一答的对话、一张「英文—中文」对照表。要把这些文本的下一个词<b>猜准</b>，模型别无选择，必须学会一件事：</p>
  <div class="dd-note intuition"><b>识别当前正在进行的模式，并接着这个模式往下写。</b>　看到前面是「A → 甲、B → 乙」，要续写「C → ___」，最可能的下一个 token 当然是「按同样的映射，C 对应的那个」。few-shot 提示，正是<b>人为造出</b>这样一个模式：给几组「输入→输出」，模型识别出「哦，现在在做 X→Y 的映射」，于是对新输入照做。</div>
  <p>所以上下文学习不是一种新能力，而是<b>「预测下一个词」被逼出来的副产品</b>——和推理、翻译一样（见「大语言模型」深读页第 6 节）。</p>
  <div class="dd-note intuition"><b>一个更精确的视角：示例在「定位任务」</b>　示例的主要作用，可能不是「从零教你这个任务」，而是告诉模型：<b>在你预训练学过的成千上万种模式里，现在要调用的是哪一种</b>。模型早就见过无数情感分类式的文本，示例只是把它「拨」到那个频道上。这个视角能解释下一节那个反直觉的发现。</div>
  <div class="dd-note eng"><b>诚实说一句</b>　「上下文学习内部到底在发生什么」仍是<b>活跃的研究课题</b>，有多种解释（任务定位、隐式地在前向传播里做类似梯度下降的更新等），尚无定论。上面给的是能站得住、也够用的直觉，不是盖棺结论。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>反直觉：示例标签「对不对」没那么重要<span class="dd-badge math">数学</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">既然靠示例学，那示例的标签是不是必须全对？本节讲一个让很多人意外的实验发现。</p>
  <p>研究者做过一个对照：把 few-shot 示例的标签<b>故意打乱、随机配</b>（「太棒了 → 负面」这种错配），再看模型表现。结果——<b>性能常常只掉一点点</b>。但如果动的是另外三样东西，性能会<b>大幅下滑</b>：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>动什么</th><th>对性能的影响</th><th>说明什么</th></tr></thead>
    <tbody>
      <tr><td>把示例标签打乱（错配）</td><td>影响较小</td><td>示例不是靠「提供正确知识」起作用</td></tr>
      <tr><td>破坏输出格式（分隔符、排版乱）</td><td>影响大</td><td>示例在演示「答案长什么样」</td></tr>
      <tr><td>换掉标签集合（正/负 → 无关词）</td><td>影响大</td><td>示例在圈定「可能的答案范围」</td></tr>
      <tr><td>用无关的输入分布</td><td>影响大</td><td>示例在演示「输入大概是什么样」</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>结论</b>　few-shot 示例主要在演示<b>任务的「样子」</b>——输入长什么样、答案什么格式、标签有哪几种——而<b>不是</b>在给模型灌输一条条正确知识。这正好印证第 3 节的「任务定位」：示例是把模型拨到对的频道，正确的判断力它早在预训练里就有了。</div>
  <div class="dd-note warn"><b>别误读成「示例可以乱写」</b>　这说的是「标签个别错配」影响不大，<b>不是</b>鼓励你给错示例。格式、标签集合、输入分布都要<b>对且一致</b>；在更难、更专业的任务上，示例的正确性依然重要。把它当成「给模板」，而不是「随便给」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>怎么把示例给好<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">既然效果全靠这几个示例，那到底怎么给，才最有效？</p>
  <ul class="dd-steps">
    <li><b>数量</b>：从 0 到 1、到几个，提升最明显；再往上<b>边际递减</b>，而且每个示例都占上下文窗口的预算——不是越多越好。</li>
    <li><b>选择</b>：挑<b>和当前查询相似</b>、质量高的示例；若是分类，尽量<b>覆盖各个类别</b>，别让模型误以为答案只有一种。</li>
    <li><b>顺序</b>：模型对示例顺序<b>敏感</b>，还常有「离查询越近影响越大」的近因偏置。别把同类示例堆在一起，打散更稳。</li>
    <li><b>格式</b>：用<b>一致、清晰</b>的分隔符和排版（如统一的「输入：… 输出：…」）。第 4 节已说明：格式一致往往比标签个别正确更影响结果。</li>
  </ul>

  <figure class="dd-fig">
    <svg viewBox="0 0 520 200" role="img" aria-label="示例数量与效果：0到几个提升大，之后趋平">
      <line x1="50" y1="30" x2="50" y2="165" stroke="#2c313b"/><line x1="50" y1="165" x2="470" y2="165" stroke="#2c313b"/>
      <polyline points="50,150 120,80 190,62 300,52 440,48" fill="none" stroke="#6b8cbe" stroke-width="2.4"/>
      <g fill="#6b8cbe"><circle cx="50" cy="150" r="4"/><circle cx="120" cy="80" r="4"/><circle cx="190" cy="62" r="4"/><circle cx="300" cy="52" r="4"/><circle cx="440" cy="48" r="4"/></g>
      <text x="46" y="182" text-anchor="middle" class="svg-t">0</text><text x="120" y="182" text-anchor="middle" class="svg-t">1</text><text x="190" y="182" text-anchor="middle" class="svg-t">2</text><text x="300" y="182" text-anchor="middle" class="svg-t">4</text><text x="440" y="182" text-anchor="middle" class="svg-t">8 …</text>
      <text x="250" y="197" text-anchor="middle" class="svg-t">示例个数</text>
      <text x="30" y="90" class="svg-t" transform="rotate(-90 30,90)">效果</text>
      <text x="150" y="120" class="svg-t" fill="#d3a05a">前几个提升最大</text>
      <text x="330" y="40" class="svg-t">之后边际递减，还占窗口</text>
    </svg>
    <figcaption>图 3　示例不是越多越好：0→1→2 通常提升最大，再加就趋平，而每个示例都在花上下文窗口的预算。挑得准，比堆得多更重要。</figcaption>
  </figure>
  <div class="dd-note eng"><b>它属于更大的一层</b>　「往窗口里放哪些示例、怎么排」本质是<b>上下文工程</b>的一部分；给单条提示配示例，则是<b>提示工程</b>里最常用的一招。上下文学习，就是这招之所以有效的原理。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>一种特殊的用法：让示例演示「怎么想」<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">前面示例只给了「输入 → 答案」。如果示例里连「怎么一步步想出答案」也写出来，会怎样？</p>
  <p>那模型就会<b>照着「先推理、再给答案」这个模式</b>来答新问题——这就是 few-shot 思维链。你没有教它推理，只是用示例设定了「输出里应该包含推理步骤」这一模式，模型便照办。</p>
  <div class="dd-note intuition"><b>它依然是上下文学习</b>　思维链之所以能靠几个示例触发，正因为上下文学习让模型「照着示例的样子续写」。当示例的样子是「带推理过程的解答」，模型续写出来的，也就是带推理过程的解答。（详见「思维链 CoT」的说明。）</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>边界与代价<span class="dd-badge eng">工程</span><span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">它这么方便、又不用训练，那为什么还需要微调？它的天花板在哪？</p>
  <ul class="dd-steps">
    <li><b>受窗口限制</b>：示例都挤在上下文窗口里，塞不了太多；示例一多，又慢又贵，还可能触发「中间迷失」（长上下文里中段信息被忽略）。</li>
    <li><b>不稳定</b>：对示例的<b>措辞、顺序、格式</b>都敏感，换个排列结果就变，难复现、难保证。</li>
    <li><b>不持久、不更新知识</b>：什么都没写进权重，<b>每次请求都得把示例重放一遍</b>；它也不会因此真正「记住」新知识。</li>
    <li><b>不等于真掌握</b>：一旦查询<b>超出示例覆盖的范围</b>，容易崩。任务复杂、专有、样本多时，微调通常更稳，长期看每次请求还更省 token。</li>
  </ul>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>更适合上下文学习</th><th>更适合微调</th></tr></thead>
    <tbody>
      <tr><td>任务多变、要立刻试</td><td>任务固定、长期跑</td></tr>
      <tr><td>只有几个示例</td><td>有大量标注样本</td></tr>
      <tr><td>不想训练、不想维护模型</td><td>要稳定、可复现、低单次成本</td></tr>
      <tr><td>原型验证、临时需求</td><td>规模化、对格式和风格要求严</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>务实建议</b>　两者不是对立，而是<b>阶梯</b>：先用上下文学习快速验证「这事模型能不能做」，跑通、量上来了、要长期稳定省成本，再考虑微调固化下来。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">把全页串成一条链，逐环检查每个结论从何而来。</p>
  <ol class="dd-chain">
    <li>把几个示例写进提示，模型读完就照做——这就是上下文学习（zero / one / few-shot）。<span>（§1）</span></li>
    <li>它和微调的根本区别是「改不改权重」：临时适配 vs 永久改造。<span>（§2）</span></li>
    <li>它之所以成立，是因为「预测下一个词」逼模型学会了「识别模式并接着写」，示例把它拨到对的任务频道。<span>（§3）</span></li>
    <li>所以示例主要在演示「任务的样子」（格式/标签集合/输入分布），而非灌输正确知识——标签个别错配影响不大。<span>（§4）</span></li>
    <li>因此给示例讲究：数量适度、选相似且覆盖全、打散顺序、格式一致。<span>（§5）</span></li>
    <li>把示例的「样子」换成带推理过程，就顺手得到 few-shot 思维链。<span>（§6）</span></li>
    <li>但它受窗口所限、不稳定、不持久、超出示例范围易崩——这划出了它与微调的分界。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「为什么一个只会猜下一个词的模型能靠几个例子学会新任务」，并说出「示例主要在演示任务的样子、而不是灌输知识」，你就抓住了上下文学习的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>上下文学习会更新模型</td><td>不改任何权重；用完就忘，下次得重给示例</td></tr>
      <tr><td>示例越多越好</td><td>0→几个提升最大，之后边际递减，还占窗口预算</td></tr>
      <tr><td>示例标签必须全对才行</td><td>标签个别错配影响不大；真正关键是格式、标签集合、输入分布要对且一致</td></tr>
      <tr><td>它和微调是同一件事</td><td>一个是运行时临时适配，一个是训练时永久改造</td></tr>
      <tr><td>它是模型的一个「附加模块」</td><td>它是「预测下一个词」被逼出来的副产品，不是单独训练的功能</td></tr>
      <tr><td>换个示例顺序结果应该一样</td><td>模型对顺序敏感，排列不同结果可能明显不同</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>zero-shot、one-shot、few-shot 分别指什么？</li>
    <li>上下文学习和微调最根本的区别是什么？由此各带来哪些取舍？</li>
    <li>用一句话解释：为什么「只会预测下一个词」的模型能靠几个示例学会新任务？</li>
    <li>把 few-shot 示例的标签随机打乱，性能常常掉得不多，这说明示例主要在起什么作用？</li>
    <li>既然标签个别错配影响不大，那示例里哪几样东西是不能乱的？</li>
    <li>为什么示例不是越多越好？至少说出两个原因。</li>
    <li>few-shot 思维链为什么也算上下文学习的一种？</li>
    <li>什么情况下应该从上下文学习转向微调？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>提示里分别给 0 个、1 个、几个「输入→输出」示例；示例越多，越是在「演示」任务该怎么做。</li>
      <li>根本区别是改不改权重：上下文学习不改（临时、即时、用完就忘、受窗口限制），微调改（持久、要训练、可用海量样本、单次请求更省）。</li>
      <li>因为「预测下一个词」逼它学会了「识别当前模式并接着写」，几个示例正好构造出一个「输入→输出」的模式，模型对新输入照做。</li>
      <li>说明示例主要在演示「任务长什么样」（格式、标签范围、输入样子），而不是在提供正确知识；它是把模型拨到对的任务频道。</li>
      <li>输出格式、标签集合（可能的答案范围）、输入分布——这三样要对且一致。</li>
      <li>其一，0→几个之后提升边际递减；其二，示例占上下文窗口预算，多了又慢又贵、还可能中间迷失。</li>
      <li>因为它靠「把示例的样子设成带推理过程的解答」来触发，模型照着这个样子续写，本质仍是照示例办事。</li>
      <li>任务固定、样本多、要长期稳定和低单次成本，或对格式/风格要求严、查询常超出少量示例覆盖范围时。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>大语言模型、预测下一个 token、自回归生成、提示</td></tr>
      <tr><td><b>本页核心</b></td><td>zero/one/few-shot、任务定位、示例的格式与顺序、与微调的对比</td></tr>
      <tr><td>紧邻延伸</td><td>提示工程、上下文工程、思维链 CoT、上下文窗口、微调</td></tr>
      <tr><td>更远</td><td>缩放定律、检索增强生成 RAG（把「示例/资料」换成检索来的）、涌现能力之争</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noopener">Language Models are Few-Shot Learners</a>：大模型 few-shot 上下文学习的系统实验。</li><li><a href="https://arxiv.org/abs/2202.12837" target="_blank" rel="noopener">Rethinking the Role of Demonstrations</a>：标签、格式与输入分布在示例中的作用。</li><li><a href="https://arxiv.org/abs/2111.02080" target="_blank" rel="noopener">An Explanation of In-context Learning as Implicit Bayesian Inference</a>：上下文学习机制的一种理论解释。</li></ul><div class="dd-src-date">访问日期：2026-07-22</div></div>
`
};

window.DEEPDIVE["in-context-learning"].html = window.DEEPDIVE["in-context-learning"].html
  .replace(
    '<p class="dd-lead">本节回答：不做任何训练，怎么可能让模型「学会」一个它没专门练过的新任务？</p>',
    '<p class="dd-lead">本节回答：不做任何训练，怎么可能让模型「学会」一个它没专门练过的新任务？</p><p>上下文学习的输入是任务说明、零个或多个输入—输出示例以及一个新查询，输出是模型按提示中临时规律生成的答案。模型在一次前向计算中利用示例，不更新参数；结果只说明当前请求中成功遵循了映射，删除示例或换一次请求后约定不会自动保留。</p>'
  )
  .replace(
    '<p class="dd-lead">你可能会问：让模型「学会新任务」，不是已经有「微调」了吗？这两者差在哪？</p>',
    '<p class="dd-lead">你可能会问：让模型「学会新任务」，不是已经有「微调」了吗？这两者差在哪？</p><p>比较的输入是任务稳定性、样本量、延迟、调用规模和维护约束，输出是临时提示适配或参数训练方案。上下文学习每次把示例作为 token 参与前向计算；微调则用损失和梯度更新权重。前者适合快速试验，后者适合长期固化，但两者也可以组合使用。</p>'
  )
  .replace(
    '<p class="dd-lead">最关键的一节：一个训练目标只是「预测下一个词」的模型，凭什么看几个例子就会照做，还没人教过它「学习」？</p>',
    '<p class="dd-lead">最关键的一节：一个训练目标只是「预测下一个词」的模型，凭什么看几个例子就会照做，还没人教过它「学习」？</p><p>机制视角的输入是带重复格式和映射关系的 token 序列，输出是符合该局部模式的下一个 token 分布。预训练让模型练习补全大量列表、问答和对照表，因此示例可以帮助它定位当前任务模式。不过这是一种解释力较强的工作模型，不是已经证明的唯一内部算法。</p>'
  )
  .replace(
    '<p class="dd-lead">既然靠示例学，那示例的标签是不是必须全对？本节讲一个让很多人意外的实验发现。</p>',
    '<p class="dd-lead">既然靠示例学，那示例的标签是不是必须全对？本节讲一个让很多人意外的实验发现。</p><p>该对照实验输入原始 few-shot 提示及分别打乱标签、格式、标签集合或输入分布的版本，输出各版本任务分数。每次只改变一项，比较性能下降幅度；下降小表示该项在当前任务影响较弱，不表示它在所有任务都不重要。专业任务与新知识映射仍可能高度依赖正确示例。</p>'
  )
  .replace(
    '<p class="dd-lead">既然效果全靠这几个示例，那到底怎么给，才最有效？</p>',
    '<p class="dd-lead">既然效果全靠这几个示例，那到底怎么给，才最有效？</p><p>示例选择接收候选示例、当前查询和 token 预算，输出数量适中、类别覆盖、顺序稳定且格式统一的提示。先保证正确与一致，再优先选与查询相似且覆盖边界的样本，并用多个顺序复测；结果应看目标切片上的稳定收益，而不是只看某一次排列。</p>'
  )
  .replace(
    '<p class="dd-lead">前面示例只给了「输入 → 答案」。如果示例里连「怎么一步步想出答案」也写出来，会怎样？</p>',
    '<p class="dd-lead">前面示例只给了「输入 → 答案」。如果示例里连「怎么一步步想出答案」也写出来，会怎样？</p><p>few-shot 思维链的输入是包含中间推理格式的示例和新问题，输出是模型仿照该格式生成的步骤与答案。它通过模式续写诱导更长的中间计算，但生成步骤看似合理不等于事实正确；应以最终答案、可验证中间结果和任务边界共同验收。</p>'
  )
  .replace(
    '<p class="dd-lead">它这么方便、又不用训练，那为什么还需要微调？它的天花板在哪？</p>',
    '<p class="dd-lead">它这么方便、又不用训练，那为什么还需要微调？它的天花板在哪？</p><p>边界判断输入是窗口容量、提示敏感性、知识新颖度、请求规模和稳定性要求，输出是继续用 ICL、转向微调或两者组合的决策。若增加示例只提高 token 成本却不再改善分桶质量，或换顺序就越过业务阈值，就说明临时适配已接近实用边界。</p>'
  );
