/* 理解原理页 —— 推理模型 Reasoning Models
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["reasoning-models"] = {
  title: "推理模型",
  subtitle: "把更多训练与推理时算力用于搜索、验证和修正，换取难题准确率",
  aliases: "Reasoning Models · 推理模型 · 慢思考模型",
  meta: "建议 20–30 分钟 · 中级 · 需要：了解「思维链」「缩放定律」",
  thesis: "推理模型通过专门的后训练，让模型更会把计算预算用在<b>拆解、搜索、验证与修正</b>上。测试时可以给它更高的 reasoning effort：可能是一条更长的内部推理轨迹，也可能是多条候选、搜索或验证器协作。关键不是把文字写得更长，而是<b>把更多推理时计算转化成更高的解题成功率</b>。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——为什么有一类模型「回答很慢」，还被当成进步。</li>
    <li><b>vs 思维链</b>——这不就是让模型写思维链吗，区别在哪。</li>
    <li><b>新的扩展轴</b>——为什么它和「把模型做大」并列为一个大方向。</li>
    <li><b>代价</b>——多想有什么代价。</li>
    <li><b>局限</b>——想得越久就一定越对吗。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　一道竞赛数学题。普通模型可能直接给出第一个候选答案；推理模型会用更多计算做拆解、尝试和检查，再给最终答案。原始推理轨迹可能对用户隐藏，产品只展示最终答案或摘要；所以本页讨论的是<b>计算过程</b>，不是界面上是否出现一大段文字。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是推理模型<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：为什么有一类模型故意「回答很慢」，反而被当成进步？</p>
  <p>普通聊天模型通常用较固定的计算预算直接生成答案。推理模型则经过专门后训练，学会在难题上投入更多中间计算：拆解、演算、尝试不同路径、检查并修正。额外预算常能提高数学、代码和复杂逻辑任务的成功率，但收益取决于任务、模型和预算，并非时间越长必然越准。</p>
  <div class="dd-note warn"><b>“思考”不等于展示给用户的文字</b>　有些开放模型会返回完整推理轨迹，有些产品隐藏原始轨迹，只给答案或简短摘要。不能根据界面上有没有“思考过程”，判断模型内部是否使用了推理计算。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它和思维链什么关系<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">「先想再答」听着不就是思维链吗？区别到底在哪？</p>
  <p>关键区别在<b>「谁让它想的」</b>：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>思维链（提示技巧）</th><th>推理模型（训练进模型）</th></tr></thead>
    <tbody>
      <tr><td>怎么触发</td><td>提示中给推理示例或要求分步</td><td>模型和服务提供推理预算/努力等级，不一定展示原始轨迹</td></tr>
      <tr><td>能力从哪来</td><td>主要利用预训练模型已有能力</td><td>用强化学习、可验证奖励、过程/结果监督等后训练优化推理策略</td></tr>
      <tr><td>计算方式</td><td>通常生成一条可见的中间步骤</td><td>可用更长单轨迹，也可结合多样采样、搜索、验证或工具</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>一句话</b>　思维链是用提示引出中间步骤；推理模型则通过后训练，学习<b>怎样更有效地使用推理预算</b>。二者相关，但“输出一段很长的解释”既不是推理模型的充分条件，也不是必要条件。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>一条新的扩展轴：测试时缩放<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的一节：它为什么被看作和「把模型做大」并列的一个大方向？</p>
  <p>过去让模型更强，主要靠<b>预训练缩放</b>——把参数、数据、算力在<b>训练时</b>一起做大（缩放定律，见其节点）。但这条路越来越贵、且高质量数据在见底。推理模型开辟了<b>第二条轴</b>：</p>
  <div class="dd-note key"><b>测试时缩放（test-time scaling）</b>　同一个模型或模型系统，在回答时投入更多算力：延长单条推理、采样多条候选再投票、搜索解空间、调用工具验证，或让验证器筛选答案。更多计算在许多难题上能提高准确率，但通常存在收益递减，且错误的搜索策略也可能白白烧算力。</div>
  <div class="dd-note math"><b>数值例子：多候选为何可能有用</b>　仅作直觉假设：每条候选独立，单条做对概率为 35%。采样 4 条时，“至少一条正确”的概率为 <code>1−(1−0.35)⁴≈82%</code>；但如果验证器在存在正确候选时只有 80% 概率选中，端到端上限约为 <code>0.82×0.80≈66%</code>，且计算接近 4 倍。真实候选高度相关，收益通常低于独立假设；验证器变强与候选多样性同样重要。</div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 120" role="img" aria-label="普通模型直接答，推理模型先长思考再答">
      <g>
        <rect x="20" y="30" width="240" height="70" rx="8" fill="none" stroke="#6b7484"/>
        <text x="140" y="52" text-anchor="middle" class="svg-t" font-size="12">普通模型</text>
        <text x="140" y="76" text-anchor="middle" class="svg-tn" font-size="12">问 → 答（秒）</text>
        <text x="140" y="94" text-anchor="middle" class="svg-t" font-size="10" fill="#cf6f6f">快，但难题常错</text>
      </g>
      <g>
        <rect x="300" y="30" width="240" height="70" rx="8" fill="none" stroke="#c25f5f"/>
        <text x="420" y="52" text-anchor="middle" class="svg-t" font-size="12">推理模型</text>
        <text x="420" y="76" text-anchor="middle" class="svg-tn" font-size="11">问 →〔长思考〕→ 答</text>
        <text x="420" y="94" text-anchor="middle" class="svg-t" font-size="10" fill="#4f9d78">慢，但难题上更准</text>
      </g>
    </svg>
    <figcaption>图 1　用回答时计算换准确率。长推理只是其中一种实现；多候选、搜索和验证同样属于测试时缩放。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>预算怎样分配才值得<span class="dd-badge math">推导</span></h2>
  <p class="dd-lead">多想一次带来多少新增成功，是否值得额外延迟与费用？</p>
  <div class="dd-formula"><code>期望效用(b) = 成功概率(b) × 任务价值 − 计算成本(b) − 延迟损失(b)</code></div>
  <p><code>b</code> 是候选数、搜索步数或推理努力等级。下面是教学用的同一批 100 道题，不代表任何特定模型：预算从 1 增至 4，正确数由 48 增至 67，额外 300 单位计算换来 19 道题；再增至 8，只多 3 道题却再花 400 单位。收益递减意味着系统应按题目难度、可验证性和错误代价路由，而不是给所有请求同一最高预算。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>任务</th><th>建议预算</th><th>理由</th><th>主要验收</th></tr></thead>
    <tbody>
      <tr><td>改日期格式</td><td>低：单次生成</td><td>简单、可确定性检查</td><td>模式匹配与样例测试</td></tr>
      <tr><td>竞赛数学题</td><td>中高：多候选+验证</td><td>难但答案常可验证</td><td>代回、符号计算或证明检查</td></tr>
      <tr><td>冷门事实问答</td><td>推理预算不是主旋钮</td><td>多想不能创造缺失证据</td><td>检索、引用与拒答</td></tr>
      <tr><td>高影响决策</td><td>按风险增加验证而非只加长度</td><td>验证器也可能同源犯错</td><td>独立工具、规则与人工复核</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>可验证性决定预算价值</b>　当答案能被单元测试、代回或形式规则快速判断时，多候选搜索更容易兑现收益；若没有外部真值信号，延长同一模型的思考可能只让错误更完整。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>代价<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">多一份推理预算具体花在哪里，为什么简单任务常得不偿失？</p>
  <ul class="dd-steps">
    <li><b>慢、贵</b>：更长轨迹、更多候选或额外验证都会增加计算、延迟和费用。</li>
    <li><b>占资源</b>：可见或隐藏的推理 token、候选轨迹和工具结果都消耗推理预算；不同服务是否计入公开上下文由实现决定。</li>
    <li><b>不是所有任务都值得</b>：简单问题（「今天星期几格式化一下」）上强行长思考，纯属浪费——又慢又贵还没更好。</li>
  </ul>
  <div class="dd-note intuition"><b>所以要「因题施策」</b>　难的多步推理（数学、代码、复杂逻辑）用推理模型最划算；日常简答用普通模型即可。很多产品会<b>按问题难度自动切换</b>该不该「多想」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>局限：想得久 ≠ 一定对<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">如果搜索方向、候选或验证器本身错了，增加计算会发生什么？</p>
  <div class="dd-note warn"><b>别把高预算当成正确保证</b>　模型可能在错误前提上搜索得更深，验证器也可能被“看起来合理”的答案骗过。可见的解释不保证忠实反映全部内部计算；隐藏的原始轨迹又无法由用户直接审计。数学应做独立验算，代码应执行测试，事实应核对来源。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>失败发生在哪一层<span class="dd-badge eng">诊断</span></h2>
  <p class="dd-lead">“高预算仍答错”不是一种故障；先分清候选、验证器、停止规则还是外部证据出了问题。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>失败层</th><th>可观察现象</th><th>优先改什么</th></tr></thead>
    <tbody>
      <tr><td>候选覆盖</td><td>采样很多次都没有正确路径</td><td>模型能力、提示、工具或分解策略</td></tr>
      <tr><td>候选相关</td><td>多条答案换措辞但共享同一错误</td><td>提高采样多样性或引入异构方法</td></tr>
      <tr><td>验证器选择</td><td>正确候选存在却被错误答案压过</td><td>验证数据、过程检查与独立规则</td></tr>
      <tr><td>停止规则</td><td>早停漏掉正确解，或无收益仍继续烧算力</td><td>基于边际收益、置信与硬预算停止</td></tr>
      <tr><td>证据缺失</td><td>逻辑连贯但事实前提不可核验</td><td>检索、工具或拒答，而非继续内省</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note warn"><b>验证器不是裁判真理。</b>　过程监督能帮助定位中间错误，但验证器也受训练分布、覆盖和偏差限制；生产评测应分别记录“正确候选是否出现”和“出现后是否被选中”。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从后训练得到的推理策略，一路推到测试时预算、收益递减与外部验证。</p>
  <ol class="dd-chain">
    <li>推理模型经后训练学会把更多计算用于拆解、搜索、验证和修正。<span>（§1）</span></li>
    <li>它与提示式思维链相关，但原始轨迹可以隐藏，计算也不只是一条长文字链。<span>（§2）</span></li>
    <li>测试时缩放可以增加轨迹长度、候选数、搜索或验证；收益随任务而异并会递减。<span>（§3）</span></li>
    <li>预算要按任务价值、难度与可验证性分配，收益通常递减。<span>（§4）</span></li>
    <li>代价是慢、贵、占窗口，简单任务不值得。<span>（§5）</span></li>
    <li>但想得久不等于一定对；候选覆盖、验证器、停止规则和证据都可能失败。<span>（§6–7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「推理模型和思维链的区别」，并说出「测试时缩放为什么是一条新的扩展轴」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">下面这些说法分别把延迟、可见文字长度、计算预算和正确性画了等号。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>回答慢是模型变差了</td><td>是故意多想以换取难题上的准确率</td></tr>
      <tr><td>推理模型就是让它写很长的思维链</td><td>核心是后训练和推理预算；轨迹可隐藏，也可用多候选、搜索、验证或工具</td></tr>
      <tr><td>测试时缩放就是多生成 token</td><td>长度只是一个旋钮，还包括采样数量、搜索宽度、验证次数和工具反馈</td></tr>
      <tr><td>所有任务都该用推理模型</td><td>简单题用它纯浪费；难的多步推理才划算</td></tr>
      <tr><td>它写出的推理就是它的真实思路，且一定对</td><td>未必忠实、也不保证正确，重要结论仍需核对</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <p class="dd-lead">请为一个简单格式化任务和一道难数学题分别选择预算，并解释为什么不同。</p>
  <ol class="dd-quiz">
    <li>推理模型回答问题时和普通模型有什么不同？为什么这被当成进步？</li>
    <li>推理模型和思维链最关键的区别是什么？</li>
    <li>什么是「测试时缩放」？它和「预训练缩放」有何不同？</li>
    <li>为什么可验证任务更适合增加测试时预算？</li>
    <li>高预算仍答错时，怎样区分候选覆盖失败和验证器失败？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>它经专门后训练，能在难题上投入更多拆解、搜索和验证计算；慢是额外预算的结果，不是目的本身。</li>
      <li>思维链是用提示引出中间步骤；推理模型学习怎样有效使用推理预算，原始轨迹可能隐藏，也不只靠一条长链。</li>
      <li>测试时缩放是在回答阶段增加轨迹、候选、搜索或验证计算；预训练缩放是在训练阶段扩大模型、数据和算力。前者的收益依任务而异且会递减。</li>
      <li>因为单元测试、代回或规则能低成本筛选候选，把额外搜索转化为可确认的收益；无真值信号时，多想可能只放大同一错误。</li>
      <li>先看正确候选是否曾出现：从未出现是覆盖问题；已出现却没被选中是验证器问题。两者应分别计量。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>思维链 CoT、大语言模型、缩放定律</td></tr>
      <tr><td><b>本页核心</b></td><td>推理后训练、推理预算、长轨迹/多候选/搜索/验证、隐藏 CoT、收益递减</td></tr>
      <tr><td>紧邻延伸</td><td>RLHF、自洽性、思维树、上下文窗口</td></tr>
      <tr><td>更远</td><td>合成数据、评测、可解释性、Agent</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://openai.com/index/learning-to-reason-with-llms/" target="_blank" rel="noopener">OpenAI：Learning to reason with LLMs（训练时与测试时计算）↗</a></li>
    <li><a href="https://openai.com/index/evaluating-chain-of-thought-monitorability/" target="_blank" rel="noopener">OpenAI：Evaluating chain-of-thought monitorability（隐藏推理与可监控性）↗</a></li>
    <li><a href="https://arxiv.org/abs/2203.11171" target="_blank" rel="noopener">Wang et al.：Self-Consistency Improves Chain of Thought Reasoning ↗</a></li>
    <li><a href="https://arxiv.org/abs/2408.03314" target="_blank" rel="noopener">Snell et al.：Scaling LLM Test-Time Compute Optimally（按难度分配预算）↗</a></li>
    <li><a href="https://arxiv.org/abs/2305.20050" target="_blank" rel="noopener">Lightman et al.：Let's Verify Step by Step（过程监督与验证器）↗</a></li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-23</div>
</div>
`
};
