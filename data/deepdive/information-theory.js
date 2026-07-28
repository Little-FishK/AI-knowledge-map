/* 理解原理页 —— 信息论与熵
 * 融入原文参照：image-generation.js
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["information-theory"] = {
  title: "信息论与熵：从概率到编码代价",
  subtitle: "先分清真实分布 P 与模型分布 Q，再从自信息、熵逐步推出交叉熵、KL 散度和困惑度。",
  meta: "建议 30–40 分钟 · 中级 · 需要：概率、加权平均、对数的基本概念",
  thesis: "信息论把「模型给真实事件多大概率」转换成可累加的编码代价：熵是知道真实分布时的最低平均代价，交叉熵是改用模型分布后的平均代价，KL 是两者之差。这些量只衡量概率匹配，<b>不直接代表事实性、语义价值或通用智能</b>。",

  quality: {
    contractVersion: 2,
    formulas: [],
    examples: [{
      section: 8,
      evidence: {
        setup: "天气 P=(1/2,1/4,1/4)，模型 Q=(1/2,3/8,1/8)",
        rule: "H(P,Q)=minusSigma P(x)log2 Q(x)",
        steps: "先用 P 自己码长求平均得 H(P)=1.5",
        interpretation: "Q 低估雪造成了主要额外代价",
      },
    }],
    termReviews: [{
      section: 9,
      reviewedAt: "2026-07-28",
      terms: [
        {
          name: "似然",
          meaning: "模型为已观察序列分配的整体概率",
          purpose: "比较模型对已观察文本的解释程度",
          definitionEvidence: "似然在这里表示模型给整句真实 token 序列分配了多大概率",
          purposeEvidence: "用来比较模型对已观察文本的解释程度",
        },
        {
          name: "对数似然",
          meaning: "逐步概率乘积取对数后得到的和",
          purpose: "把连乘改写成便于稳定计算的加法",
          definitionEvidence: "对数似然把逐步概率的乘法变成对数之和",
          purposeEvidence: "便于稳定计算",
        },
      ],
    }],
    sectionContracts: [
      { section: 1,
        definition: { answer: "定义事件集合、P 与 Q、对数和按 P 取期望。", evidence: "P(x) 表示事件 x 真实出现的概率" },
        problem: { answer: "解决后续公式对什么对象计算、怎样区分 P 与 Q。", evidence: "后面所有公式究竟在对什么对象做计算" },
        inputOutput: { answer: "输入是事件集合和分布，输出是概率值和加权期望。", evidence: "按 P 取期望" },
        mechanism: { answer: "计算先确认事件由 P 产生，按 Q 求损失后用 P 平均。", evidence: "后续所有计算都遵循一个规则" },
        interpretation: { answer: "教学例子直接给 P，现实 P 通常未知。", evidence: "现实中 P 通常未知" },
        boundary: { answer: "样本有偏差，频率不等于真实概率。", evidence: "样本可能有偏差" } },
      { section: 2,
        definition: { answer: "自信息衡量结果发生后消除的不确定性。", evidence: "消除的不确定性" },
        problem: { answer: "量化单次结果有多意外。", evidence: "一次结果有多意外" },
        inputOutput: { answer: "输入事件及真实概率，输出 bit 表示的自信息。", evidence: "bit 表示的自信息" },
        mechanism: { answer: "取概率以 2 为底对数再加负号。", evidence: "log<sub>2</sub>" },
        interpretation: { answer: "数值越大该结果越罕见。", evidence: "越罕见" },
        boundary: { answer: "高自信息不等于事件重要或正确。", evidence: "高自信息不等于事件重要" } },
      { section: 3,
        definition: { answer: "熵是把自信息按真实频率求加权平均。", evidence: "把每个事件的自信息按真实频率 P 求平均" },
        problem: { answer: "把单次意外程度汇总成分布级指标。", evidence: "怎样概括一个分布整体上有多难预测" },
        inputOutput: { answer: "输入完整分布 P，输出 bit/次 的平均不确定性。", evidence: "bit/次" },
        mechanism: { answer: "先求各事件自信息，再按 P(x) 加权相加。", evidence: "加权相加" },
        interpretation: { answer: "熵更高表示长期更难预测。", evidence: "长期平均更难预测" },
        boundary: { answer: "衡量不确定性非正确性，依赖分布稳定前提。", evidence: "编码解释依赖长期、无损和分布稳定" } },
      { section: 4,
        definition: { answer: "交叉熵是数据按 P 出现而由 Q 预测时的平均对数损失。", evidence: "平均对数损失" },
        problem: { answer: "衡量模型 Q 预测真实 P 时平均要付出多少代价。", evidence: "真实事件按 P 出现，模型却按 Q 分配概率" },
        inputOutput: { answer: "输入 P 和 Q，输出 bit/事件 的交叉熵。", evidence: "H(P,Q)" },
        mechanism: { answer: "P 决定频率，Q 决定每个事件的损失，P 加权平均。", evidence: "P 决定哪些事件多常出现" },
        interpretation: { answer: "数值较低表示 Q 给真实事件更高概率。", evidence: "数值较低表示 Q 平均给真实事件分配了更高概率" },
        boundary: { answer: "不同数据分布或单位下不能直接横向比较。", evidence: "不同数据分布、对数底数或预测单位下的数值不能直接横向比较" } },
      { section: 5,
        definition: { answer: "KL 散度衡量使用 Q 代替 P 后每次平均多付出的 bit 数。", evidence: "每次事件平均多付出的 bit 数" },
        problem: { answer: "分离模型概率放错位置造成的额外损失。", evidence: "模型概率放错位置造成的额外损失" },
        inputOutput: { answer: "输入有方向的 P 与 Q，输出 KL 散度。", evidence: "D<sub>KL</sub>" },
        mechanism: { answer: "先求交叉熵再减去 P 自身的熵。", evidence: "H(P,Q) 减去 H(P)" },
        interpretation: { answer: "为零表示完全匹配，越大代价越高。", evidence: "Q 在 P 会发生的事件上完全匹配" },
        boundary: { answer: "方向不可交换，P 未知只能估计。", evidence: "方向不可交换" } },
      { section: 6,
        definition: { answer: "比较几何坐标差与概率编码代价两类问题。", evidence: "几何坐标差与概率编码代价是两种不同问题" },
        problem: { answer: "防止把有方向的 KL 误当普通距离。", evidence: "防止把 KL 当作普通距离" },
        inputOutput: { answer: "输入概率向量，输出几何长度和对数代价。", evidence: "欧氏距离输出对称的几何长度" },
        mechanism: { answer: "欧氏距离开方，KL 按 P 加权对数比。", evidence: "逐坐标求差、平方并求和，再开方" },
        interpretation: { answer: "数值小都可表示接近但含义不同。", evidence: "单位和含义不同" },
        boundary: { answer: "两个数不能互换相加。", evidence: "不能互换或相加" } },
      { section: 7,
        definition: { answer: "困惑度把对数损失还原成熵等效分支数。", evidence: "困惑度的含义" },
        problem: { answer: "让抽象 bit/token 换成直观等效选择数。", evidence: "换成较直观的等效选择数" },
        inputOutput: { answer: "输入底数和平均损失，输出 PPL。", evidence: "PPL = 2" },
        mechanism: { answer: "用对应指数函数还原后统一比较口径。", evidence: "用对应指数函数还原" },
        interpretation: { answer: "更低 PPL 表示给真实 token 更高概率。", evidence: "更低 PPL 表示模型平均给真实 token 分配了更高概率" },
        boundary: { answer: "不代表事实性或推理能力，跨分词器不可直比。", evidence: "不代表真实候选数、事实性或推理能力" } },
      { section: 8,
        definition: { answer: "完整手算展示 P、Q 到熵等五个量的链条。", evidence: "依次产生熵、交叉熵、KL 和 PPL" },
        problem: { answer: "核对五个量的角色和计算链是否连贯。", evidence: "核对五个量的角色是否连贯" },
        inputOutput: { answer: "输入三天气 P、Q，输出四个汇总量。", evidence: "P=(1/2,1/4,1/4)" },
        mechanism: { answer: "先求熵再算交叉熵然后相减并指数化。", evidence: "从熵到 PPL 的完整链条" },
        interpretation: { answer: "Q 低估雪造成的额外代价最大。", evidence: "Q 低估雪的概率造成了主要额外代价" },
        boundary: { answer: "只验证算术链，不代表连续分布。", evidence: "不能代表连续分布或真实语言模型" } },
      { section: 9,
        definition: { answer: "经验交叉熵是有限文本上 token 平均负对数概率。", evidence: "平均负对数概率" },
        problem: { answer: "P 未知时提供可计算的训练信号。", evidence: "不知道 P，训练程序又是怎样得到交叉熵损失" },
        inputOutput: { answer: "输入 token 序列和概率，输出序列平均损失。", evidence: "序列或批次平均损失" },
        mechanism: { answer: "累加负对数概率除以 token 数跨样本平均。", evidence: "除以有效 token 数并跨样本平均" },
        interpretation: { answer: "训练损失下降表示贴合当前样本。", evidence: "更贴合当前训练样本" },
        boundary: { answer: "有抽样误差不能替代事实安全评测。", evidence: "不能替代事实、安全与独立任务评测" } },
    ],
  },

  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>P 和 Q 是什么</b>——真实分布和模型分布各自承担什么角色。</li>
    <li><b>自信息和熵</b>——一次事件的意外程度，和整个分布的平均不确定性。</li>
    <li><b>交叉熵和 KL</b>——用错了分布，平均要多付多少代价。</li>
    <li><b>困惑度</b>——把抽象的平均损失还原成更直观的等效选择数。</li>
    <li><b>这些量的边界</b>——它们衡量概率匹配，不衡量事实性、语义或智能。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　预测天气：真实天气按 <b>P=(晴 1/2, 雨 1/4, 雪 1/4)</b> 出现，模型却给出了不同的预测 <b>Q=(晴 1/2, 雨 3/8, 雪 1/8)</b>。如果根据 Q 来做预测或编码，平均多付出了多少？全页围绕这个三天气例子展开。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>先把 P、Q、对数和期望说清楚<span class="dd-badge math">起点</span></h2>
  <p class="dd-lead">后面所有公式究竟在对什么对象做计算？</p>
  <p>设一次试验可能产生有限个事件，例如天气集合 &Omega;={晴, 雨, 雪}。<b>P(x)</b> 表示事件 x 真实出现的概率——长期来看，25% 的天会下雪。<b>Q(x)</b> 则是模型给事件 x 分配的概率——比如模型以为只有 12.5% 的天会下雪。教学例子会直接给出 P，但现实中 P 通常未知，只能用样本频率近似。Q 则由模型给出。</p>
  <p>后续所有计算都遵循一个规则：事件仍然按 P 的频率出现，但损失或码长由 Q 决定，最后再用 P 做加权平均。这就是「按 P 取期望」——<b>E<sub>P</sub>[f(x)] = &Sigma;<sub>x</sub> P(x) f(x)</b>——用真实出现的概率当权重。</p>
  <div class="dd-note key"><b>为什么用对数？</b>　我们希望越罕见的事件带来的信息越多；同时，两个独立事件一起发生时，概率相乘，信息量应当相加。对数正好把乘法变成加法：log<sub>2</sub>(ab) = log<sub>2</sub>a + log<sub>2</sub>b。概率不超过 1，对数不大于 0，再加负号得到非负的信息量。本页用 <b>log<sub>2</sub></b> 作为底数，单位是 <b>bit</b>。1 bit 表示一次理想且均衡的二元区分所提供的信息。若改用 ln，单位变成 nat，数值只按固定比例缩放。</div>
  <div class="dd-note warn"><b>容易忽视的前提：</b>P 在现实中通常未知，我们只能用样本频率近似。样本可能有偏差，频率不等于真实概率。看到 P，先问「事件实际按谁出现」；看到 Q，先问「模型给这个真实事件多少概率」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>自信息：一次结果有多意外<span class="dd-badge math">自信息</span></h2>
  <p class="dd-lead">概率越小的事件一旦发生，为什么带来的信息越多？</p>
  <div class="dd-formula">I<sub>P</sub>(x) = &minus;log<sub>2</sub> P(x)</div>
  <p>如果某事件必然发生（P=1），观察到它没有消除任何不确定性，信息量为 0 bit。概率减半，自信息增加 1 bit：P 从 1/2、1/4 到 1/8，自信息依次是 1、2、3 bit。</p>
  <p>以三天气为例：晴的概率是 1/2，所以晴天发生了也不意外——I = &minus;log<sub>2</sub>(1/2) = 1 bit。雪的概率只有 1/4，下雪时 I = &minus;log<sub>2</sub>(1/4) = 2 bit——更罕见，所以信息量更大。</p>
  <p><b>这个数值表示什么？</b>它衡量"意外程度"，不是重要性。罕见的传感器噪声可以有很高自信息，却对任务没有价值。自信息只告诉你这个结果在 P 下有多罕见，不告诉你它值不值得关注。</p>
  <p><b>不能推出什么：</b>高自信息不等于事件重要、有用或正确；它只是一个关于概率的纯数学量。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>熵：真实分布自身的平均不确定性<span class="dd-badge math">熵</span></h2>
  <p class="dd-lead">单个事件的信息量有高有低，怎样概括一个分布整体上有多难预测？</p>
  <div class="dd-formula">H(P) = E<sub>x&sim;P</sub>[&minus;log<sub>2</sub>P(x)] = &minus;&Sigma;<sub>x</sub> P(x) log<sub>2</sub> P(x)</div>
  <p><b>熵就是把每个事件的自信息按真实频率 P 求平均。</b>对于 P=(1/2, 1/4, 1/4)，三个事件的信息量分别是 1、2、2 bit，加权平均：H(P) = 1/2 &times; 1 + 1/4 &times; 2 + 1/4 &times; 2 = <b>1.5 bit/次</b>。这表示长期来看，每次观察平均需要 1.5 bit 来描述结果。</p>
  <p>在 n 个可能结果上，均匀分布的熵最大（log<sub>2</sub>n bit）；确定分布的熵为 0。熵描述的是一个分布在重复试验中的平均不确定性——用来把不同事件的单次意外程度汇总成一个分布级别的量。</p>
  <div class="dd-note intuition"><b>怎样读熵：</b>H(P) 越高，表示长期平均更难预测。但熵高不表示每个事件都罕见，也不评价某条回答是否正确。"最低平均编码代价"是理想化、长期平均的无损编码结论，单个符号的实际码字还受整数长度、编码器和头部开销影响。</div>
  <p><b>边界：</b>熵衡量不确定性，不是正确性。一个完全随机的分布熵很高，但预测它毫无价值；一个确定但错误的预测，熵为零，但每猜必错。编码解释依赖长期、无损和分布稳定等前提。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>交叉熵：用 Q 为按 P 出现的数据付费<span class="dd-badge math">交叉熵</span></h2>
  <p class="dd-lead">真实事件按 P 出现，模型却按 Q 分配概率时，平均损失是多少？</p>
  <p>模型事先不知道下一次会出现什么，只能提交一整组预测概率 Q。事件 x 真正发生后，我们只检查模型给这个事件的概率 Q(x)，并把它转换为对数损失：<b>对事件 x 的损失 = &minus;log<sub>2</sub> Q(x)</b>。Q 给真实事件的概率越大，损失越小；如果 Q 很自信地漏掉真实事件，损失会非常大。</p>
  <p>由于事件实际仍按 P 出现，长期平均时必须用 P 作权重，这样就得到了<b>交叉熵</b>：</p>
  <div class="dd-formula">H(P,Q) = E<sub>x&sim;P</sub>[&minus;log<sub>2</sub>Q(x)] = &minus;&Sigma;<sub>x</sub> P(x) log<sub>2</sub> Q(x)</div>
  <p>名称里的"交叉"来自两个分布各司其职：<b>P 决定哪些事件多常出现，Q 决定模型为这些事件付出多少损失。</b>用三天气例子继续：Q 给晴的概率和 P 一样是 1/2，所以晴天的损失还是 1 bit；但 Q 给雪只有 1/8 的概率（P 给 1/4），雪一旦发生，损失是 &minus;log<sub>2</sub>(1/8) = 3 bit，比用 P 自带的 2 bit 多付出了整整 1 bit。</p>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>步骤</th><th>谁决定</th><th>要做的事</th></tr></thead><tbody>
  <tr><td>1. 事件出现</td><td>真实分布 P</td><td>决定晴、雨、雪各出现多频繁</td></tr>
  <tr><td>2. 模型报概率</td><td>模型分布 Q</td><td>给每个可能事件分配预测概率</td></tr>
  <tr><td>3. 计算单次损失</td><td>实际事件对应的 Q(x)</td><td>计算 &minus;log<sub>2</sub>Q(x)</td></tr>
  <tr><td>4. 求长期平均</td><td>P 作权重</td><td>得到交叉熵 H(P,Q)</td></tr>
  </tbody></table></div>
  <p><b>怎样读结果：</b>数值较低表示 Q 平均给真实事件分配了更高概率。若恰好 Q = P，交叉熵就退化为熵——这时模型完全掌握了真实分布，损失降到理论最低。但不同数据分布、对数底数或预测单位下的数值不能直接横向比较。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>KL 散度：交叉熵比熵多出的代价<span class="dd-badge math">KL</span></h2>
  <p class="dd-lead">KL 不需要凭空记忆，它可以从「用了错误的 Q 多花多少」直接推出。</p>
  <p>知道真实分布 P 时，平均理想码长是 H(P)；改用模型分布 Q 后，平均代价是 H(P,Q)。两者相减，就是模型概率放错位置造成的额外损失：</p>
  <div class="dd-formula">H(P,Q) &minus; H(P) = &Sigma;<sub>x</sub> P(x) log<sub>2</sub>[P(x)/Q(x)] = D<sub>KL</sub>(P&parallel;Q)</div>
  <p><b>KL 散度衡量使用 Q 代替 P 后，每次事件平均多付出的 bit 数。</b>用三天气例子来计算：H(P) = 1.5 bit，H(P,Q) &asymp; 1.6038 bit，所以 D<sub>KL</sub>(P&parallel;Q) &asymp; 0.1038 bit/次——模型对雪的概率分配过小，导致平均每次多付出约 0.1 bit。</p>
  <p>KL 有几个关键性质：它永远不小于 0（吉布斯不等式），只有 Q 和 P 完全一致时才等于 0。<b>方向不能交换</b>：D<sub>KL</sub>(P&parallel;Q) 用 P 加权，重点惩罚 Q 漏掉真实会发生的事件；如果某个 P(x) &gt; 0 而 Q(x) = 0，正向 KL 为正无穷。</p>
  <div class="dd-note intuition"><b>最小化交叉熵等于最小化 KL</b>——因为 H(P) 是常数。但训练集上的平均损失只是总体交叉熵的经验估计，训练损失下降不保证未知数据上的真实 KL 一定下降。</div>
  <p><b>边界：</b>KL 的方向不可交换；P 未知时只能估计；Q 给零概率会让它发散。因此 KL 是对数代价层面的比较，不是几何距离，也不是对"模型好坏"的全面评价。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>KL 与欧氏距离回答不同问题<span class="dd-badge math">距离比较</span></h2>
  <p class="dd-lead">既然 P 和 Q 都能写成概率向量，为什么不直接算两点间的直线距离？</p>
  <p>欧氏距离把两个分布当成普通向量，计算坐标差平方和的平方根：</p>
  <div class="dd-formula" data-display="mathml"><math display="block" aria-label="P 与 Q 的欧氏距离等于各事件概率之差的平方和再开平方"><mrow><msub><mi>d</mi><mn>2</mn></msub><mo>(</mo><mi>P</mi><mo>,</mo><mi>Q</mi><mo>)</mo><mo>=</mo><msqrt><mrow><munder><mo>&sum;</mo><mi>x</mi></munder><msup><mrow><mo>(</mo><mi>P</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>&minus;</mo><mi>Q</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>)</mo></mrow><mn>2</mn></msup></mrow></msqrt></mrow></math></div>
  <p>它衡量的是坐标差，具有对称性（d<sub>2</sub>(P,Q) = d<sub>2</sub>(Q,P)）并满足三角不等式。KL 则衡量概率比例造成的平均对数代价——不对称，也不满足三角不等式，因此严格说它是"散度"而不是数学上的距离。</p>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>问题</th><th>欧氏距离</th><th>KL(P&parallel;Q)</th></tr></thead><tbody>
  <tr><td>关注什么</td><td>概率坐标相差多远</td><td>Q 预测 P 时多付多少对数代价</td></tr>
  <tr><td>是否对称</td><td>是</td><td>否</td></tr>
  <tr><td>Q 漏掉 P 的可能事件</td><td>仍是有限数</td><td>若 Q(x)=0，则为正无穷</td></tr>
  <tr><td>单位</td><td>概率向量的几何尺度</td><td>本页使用 bit/事件</td></tr>
  </tbody></table></div>
  <p>以 P=(0.5, 0.25, 0.25)、Q=(0.5, 0.375, 0.125) 为例，欧氏距离约为 0.177，正向 KL 约为 0.104 bit。<b>两个数不能互换或相加</b>——它们回答的不是同一个问题。</p>
  <p><b>这项比较的价值：</b>防止把 KL 当作普通距离来计算。欧氏距离并非"错误"，只是不表达编码后悔或对数预测损失。数值较小都可表示某种接近，但单位和含义不同，不能据此宣称一种度量永远更好。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>困惑度：把平均对数损失还原到概率尺度<span class="dd-badge math">困惑度</span></h2>
  <p class="dd-lead">平均损失是 1.6 bit/token 很抽象，怎样换成较直观的等效选择数？</p>
  <div class="dd-formula">PPL = 2<sup>H(P,Q)</sup>　（损失单位为 bit/token）</div>
  <p>如果平均交叉熵是 2 bit/token，那么 PPL = 2<sup>2</sup> = 4。<b>困惑度的含义：</b>它表示模型的平均不确定性，与「每一步面对 4 个等概率候选」的情形相当，因此更准确的名称是<b>熵等效分支数</b>。</p>
  <p><b>它不是什么：</b>困惑度不是词表大小，也不表示模型真的每一步只考虑固定数量的词。PPL 越低只说明模型给实际 token 的平均概率更高。它不自动证明事实性、推理能力或安全性更好。</p>
  <p>这里提前用到 token——可以暂时把 token 理解为模型逐步预测的文本单位，正式分词机制将在后续节点学习。不同 tokenizer 会改变预测单位和序列长度，所以 token 级 PPL 通常不能跨 tokenizer 直接比较，跨分词器时可考虑统一语料上的 bits-per-byte 或 bits-per-character。</p>
  <div class="dd-note key"><b>底数必须匹配：</b>若训练损失使用自然对数（单位是 nat/token），应使用 PPL = exp(loss)；若使用 log<sub>2</sub>，才使用 2<sup>loss</sup>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>三符号例子：从 P、Q 一直算到困惑度<span class="dd-badge math">完整手算</span></h2>
  <p class="dd-lead">真实天气 P=(1/2, 1/4, 1/4)，模型 Q=(1/2, 3/8, 1/8)，每一步怎样对应前面的定义？</p>
  <figure class="dd-fig"><svg viewBox="0 0 680 245" role="img" aria-label="真实分布 P 与模型分布 Q 的编码长度、交叉熵和 KL 额外代价"><defs><marker id="it1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs><rect x="18" y="35" width="170" height="152" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="103" y="59" text-anchor="middle" class="svg-t">真实分布 P</text><text x="38" y="88" class="svg-t" font-size="10">晴：p=1/2 &rarr; 1 bit</text><text x="38" y="113" class="svg-t" font-size="10">雨：p=1/4 &rarr; 2 bit</text><text x="38" y="138" class="svg-t" font-size="10">雪：p=1/4 &rarr; 2 bit</text><text x="38" y="167" class="svg-t" font-size="10">H(P)=1.5 bit</text><path d="M188,110 L248,110" stroke="#6b7484" marker-end="url(#it1)"/><rect x="250" y="35" width="190" height="152" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="345" y="59" text-anchor="middle" class="svg-t">模型编码 Q</text><text x="270" y="88" class="svg-t" font-size="10">晴：q=1/2 &rarr; 1 bit</text><text x="270" y="113" class="svg-t" font-size="10">雨：q=3/8 &rarr; 1.415 bit</text><text x="270" y="138" class="svg-t" font-size="10">雪：q=1/8 &rarr; 3 bit</text><text x="270" y="163" class="svg-t" font-size="10">H(P,Q)&asymp;1.6038 bit</text><path d="M440,110 L500,110" stroke="#6b7484" marker-end="url(#it1)"/><rect x="502" y="57" width="160" height="108" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="582" y="82" text-anchor="middle" class="svg-t">额外代价</text><text x="582" y="108" text-anchor="middle" class="svg-t" font-size="10">D<sub>KL</sub>(P||Q)</text><text x="582" y="131" text-anchor="middle" class="svg-t" font-size="10">&asymp;0.1038 bit</text><text x="340" y="224" text-anchor="middle" class="svg-t" font-size="10">P 决定事件频率，Q 决定编码代价，相减得额外损失</text></svg><figcaption>图 1　同一组 P、Q 依次产生熵、交叉熵、KL 和 PPL。P 负责加权，Q 负责代价。</figcaption></figure>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>事件 x</th><th>P(x)</th><th>&minus;log<sub>2</sub>P(x)</th><th>Q(x)</th><th>&minus;log<sub>2</sub>Q(x)</th><th>P(x)[&minus;log<sub>2</sub>Q(x)]</th></tr></thead><tbody>
  <tr><td>晴</td><td>0.5</td><td>1</td><td>0.5</td><td>1</td><td>0.5000</td></tr>
  <tr><td>雨</td><td>0.25</td><td>2</td><td>0.375</td><td>1.415</td><td>0.3538</td></tr>
  <tr><td>雪</td><td>0.25</td><td>2</td><td>0.125</td><td>3</td><td>0.7500</td></tr>
  </tbody></table></div>
  <ol class="dd-steps">
    <li>先用 P 自己的码长求平均：H(P) = 1.5 bit。</li>
    <li>Q 对雪的预测偏低（1/8 vs P 的 1/4），雪发生时损失跳升到 3 bit。</li>
    <li>事件仍按 P 出现，把 Q 码长按 P 加权：H(P,Q) &asymp; 1.6038 bit。</li>
    <li>KL = H(P,Q) &minus; H(P) &asymp; 0.1038 bit/次——雪的概率放错位置是主要额外代价来源。</li>
    <li>指数化：PPL = 2<sup>1.6038</sup> &asymp; 3.04。</li>
  </ol>
  <p><b>怎样读这个结果：</b>Q 对雨分得过多、对雪分得过少，虽然总概率仍是 1，但概率放错位置就增加了平均损失。若 Q 把雪设为 0，雪一旦发生便产生无穷损失，交叉熵和正向 KL 都变为正无穷。</p>
  <p><b>边界：</b>这个三事件例子只验证算术与解释链。真实语言模型面对的是数以万计的 token 类型、连续分布和有限样本估计，同样的公式在不同规模下会有不同的数值行为。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>语言模型损失：样本平均不等于真实分布<span class="dd-badge eng">语言模型</span></h2>
  <p class="dd-lead">现实中不知道 P，训练程序又是怎样得到交叉熵损失的？</p>
  <p>语言模型把一句话分成 x<sub>1</sub>, &hellip;, x<sub>n</sub>，并在每一步给真实下一个 token 概率 Q(x<sub>t</sub> | x<sub>&lt;t</sub>)。<b>似然</b>在这里表示模型给整句真实 token 序列分配了多大概率，用来比较模型对已观察文本的解释程度。<b>对数似然</b>把逐步概率的乘法变成对数之和，便于稳定计算；再取负号，就把"概率越大越好"改写成"损失越小越好"：</p>
  <div class="dd-formula">NLL = &minus;&Sigma;<sub>t</sub> log Q(x<sub>t</sub> | x<sub>&lt;t</sub>)</div>
  <p>除以 token 数 n，得到平均 token 损失；再对训练批次求平均，就是常见的经验交叉熵。<b>它用有限样本近似未知的真实分布 P，而不是直接知道 P。</b></p>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>量</th><th>怎样得到</th><th>能否直接观察</th></tr></thead><tbody>
  <tr><td>总体交叉熵 H(P,Q)</td><td>对未知真实分布 P 取期望</td><td>通常不能精确观察</td></tr>
  <tr><td>训练损失</td><td>训练样本上的平均负对数概率</td><td>可计算，但可能过拟合</td></tr>
  <tr><td>验证/测试损失</td><td>未参与参数更新的样本平均</td><td>用于估计新数据表现，仍有抽样误差</td></tr>
  </tbody></table></div>
  <p>"训练损失下降"只说明模型更适合当前训练样本。要判断真实预测是否改善，还需独立验证集、分布切片以及事实性、推理、安全等任务指标。<b>训练损失是经验估计，不是真实交叉熵；验证损失是更好的近似，但同样受样本量、分布偏移和抽样偏差限制。</b></p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">不要孤立背公式：每一个新量都在回答上一步尚未回答的问题。</p>
  <ol class="dd-chain">
    <li>事件 x 按真实分布 P 出现，模型用 Q 给出预测。P 决定频率，Q 决定代价。<span>（&sect;1）</span></li>
    <li>&minus;log<sub>2</sub>P(x) 衡量事件在真实分布下的意外程度——自信息。<span>（&sect;2）</span></li>
    <li>按 P 平均 &minus;log<sub>2</sub>P(x)，得到分布自身的平均不确定性——熵 H(P)。<span>（&sect;3）</span></li>
    <li>按 P 平均模型损失 &minus;log<sub>2</sub>Q(x)，得到交叉熵 H(P,Q)。<span>（&sect;4）</span></li>
    <li>交叉熵减去熵，得到模型概率放错位置的额外代价——KL(P&parallel;Q)。<span>（&sect;5）</span></li>
    <li>KL 和欧氏距离衡量的是两种不同问题：对数代价 vs 几何坐标差。<span>（&sect;6）</span></li>
    <li>把平均交叉熵指数化，得到熵等效分支数——困惑度 PPL。<span>（&sect;7）</span></li>
    <li>三符号例子展示了整套计算链的数值落点。<span>（&sect;8）</span></li>
    <li>现实中 P 未知，训练损失是经验估计，不能自动代表真实交叉熵。<span>（&sect;9）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「交叉熵为什么 P 在外面加权、Q 在对数里面」，并能用三天气例子独立算出从熵到 PPL 的完整链条，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>P 是训练集里直接可见的真理</td><td>P 是未知的数据生成分布；样本频率只是估计，还可能受采样偏差影响</td></tr>
      <tr><td>交叉熵就是两个分布各算一次熵</td><td>事件频率来自 P，单次损失来自 Q，公式是 &minus;&Sigma;P log<sub>2</sub>Q</td></tr>
      <tr><td>KL 是两个概率向量的普通距离</td><td>KL 是有方向的平均对数代价，不对称且不满足三角不等式</td></tr>
      <tr><td>PPL = 20 表示模型只考虑 20 个 token</td><td>它只表示与 20 个等概率候选相当的平均不确定性</td></tr>
      <tr><td>PPL 下降说明回答更真实、更聪明</td><td>它只测实际 token 的平均预测概率，其他能力需要独立评测</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">12</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>给定 P(雨) = 0.25，计算"今天下雨"的自信息，并说明单位。</li>
    <li>给定 P = (0.5, 0.5)，计算 H(P)；如果改成 P = (1, 0)，熵怎样变化？</li>
    <li>在 H(P,Q) = &minus;&Sigma;P(x) log<sub>2</sub>Q(x) 中，为什么外面的权重是 P(x)，对数里面却是 Q(x)？</li>
    <li>怎样从 H(P,Q) 和 H(P) 推出 KL(P&parallel;Q)？这个差值表示什么？</li>
    <li>为什么欧氏距离不能替代 KL 来表达编码代价？</li>
    <li>假设平均损失为 3 bit/token，计算困惑度。它不表示什么？</li>
    <li>训练交叉熵持续下降但验证交叉熵开始上升，能否断言真实 KL 仍在下降？</li>
    <li>两个语言模型使用不同 tokenizer，A 的 PPL = 12，B 的 PPL = 15。能否直接断言 A 更好？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>I(雨) = &minus;log<sub>2</sub>0.25 = 2 bit。</li>
      <li>H(P) = 1 bit；P = (1,0) 时 H(P) = 0，因为结果已确定。</li>
      <li>P 决定真实事件出现的长期频率，负责加权；&minus;log<sub>2</sub>Q(x) 是模型的单次损失，所以 Q 在对数里面。</li>
      <li>相减得 &Sigma;P(x) log<sub>2</sub>[P(x)/Q(x)]，表示数据按 P 产生却使用 Q 编码时，平均多付出的 bit 数。</li>
      <li>欧氏距离只测概率坐标差且对称；KL 测按 P 加权的概率比例代价。尤其 P(x)&gt;0 而 Q(x)=0 时，欧氏距离有限而正向 KL 为正无穷。</li>
      <li>PPL = 8，表示与每步 8 个等概率候选相当的平均不确定性，不表示词表大小或事实性、推理、安全表现。</li>
      <li>不能。训练损失是训练样本的经验平均，可能因过拟合继续下降；验证损失上升反而提示泛化变差。真实 P 未知。</li>
      <li>不能。不同 tokenizer 会改变 token 单位和序列长度，应统一 tokenizer 或报告 bits-per-character，再结合任务指标。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">13</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>进入本页前</td><td>只需会读概率和加权平均；本页已补充对数、期望、P 与 Q</td></tr>
      <tr><td><b>本页核心</b></td><td>自信息、熵、交叉熵、KL 散度、困惑度</td></tr>
      <tr><td>下一步</td><td>损失函数、梯度下降、Token 与分词</td></tr>
      <tr><td>工程延伸</td><td>预训练、概率校准、采样参数、模型评测与分布漂移</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf" target="_blank" rel="noopener">Shannon, A Mathematical Theory of Communication</a>：自信息、熵、对数底数与无损编码的基本解释。</li><li><a href="https://www.deeplearningbook.org/contents/prob.html" target="_blank" rel="noopener">Deep Learning &mdash; Probability and Information Theory</a>：交叉熵、KL、非对称性及机器学习中的概率解释。</li><li><a href="https://web.stanford.edu/class/stats311/OldSyllabi/full_notes.pdf" target="_blank" rel="noopener">Stanford STATS 311: Information Theory and Statistics</a>：熵、KL 和编码观点的正式定义与性质。</li></ul><div class="dd-src-date">访问日期：2026-07-28</div></div>
`
};
