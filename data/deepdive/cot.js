/* 理解原理页 —— 思维链 CoT Chain-of-Thought
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["cot"] = {
  title: "思维链 CoT",
  subtitle: "让模型先写出一步步推理，再给答案——复杂题上更准",
  aliases: "Chain-of-Thought · CoT · 思维链",
  meta: "建议 20–30 分钟 · 中级 · 需要：了解「大语言模型」怎样逐词生成",
  thesis: "思维链提示用示例或指令诱导模型生成<b>中间推理步骤</b>，在部分多步任务上可提高准确率。它为自回归生成提供额外计算轨迹，但效果依赖模型规模、任务与提示；输出的解释不必忠实反映内部计算。现代推理系统还可能隐藏原始轨迹，只返回简短答案或摘要。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——「写出推理再答」具体指什么。</li>
    <li><b>为什么有效</b>——写出来和不写，凭什么差这么多。</li>
    <li><b>怎么触发</b>——怎么让模型产生思维链。</li>
    <li><b>进阶</b>——自洽性、思维树是怎么加强它的。</li>
    <li><b>和推理模型的关系</b>——现在的「推理模型」和思维链什么关系。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　问：「一个班 23 人，又转来 5 人，分成 4 组，每组几人？」<br>
  <b>直接答</b>：模型可能张口就来「6 人」（错，(23+5)/4=7）。<br>
  <b>写出推理</b>：「先算总人数 23+5=28，再 28÷4=7，每组 7 人。」——对了。全页解释这一字之差背后的机制。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是思维链<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：怎么让模型少犯「不假思索、一步答错」的错？</p>
  <p>办法出奇简单：<b>别让它直接蹦答案，而要它先把推理过程一步步写出来，最后再给结论。</b>就像考试时「写出解题步骤」而不是只填一个数。上面那道题，逼它写出「先求和、再相除」，答案就从错的 6 变成对的 7。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 150" role="img" aria-label="直接答容易错，写出推理更准">
      <g>
        <rect x="20" y="30" width="240" height="90" rx="8" fill="none" stroke="#cf6f6f"/>
        <text x="140" y="52" text-anchor="middle" class="svg-t">直接答</text>
        <text x="140" y="78" text-anchor="middle" class="svg-tn" font-size="13">问 → 「6 人」</text>
        <text x="140" y="104" text-anchor="middle" class="svg-t" fill="#cf6f6f" font-size="12">一步跳到答案，容易错 ✗</text>
      </g>
      <g>
        <rect x="300" y="30" width="240" height="90" rx="8" fill="none" stroke="#4f9d78"/>
        <text x="420" y="52" text-anchor="middle" class="svg-t">写出推理</text>
        <text x="420" y="76" text-anchor="middle" class="svg-tn" font-size="12">23+5=28 → 28÷4=7</text>
        <text x="420" y="104" text-anchor="middle" class="svg-t" fill="#4f9d78" font-size="12">拆成小步，每步更容易对 ✓</text>
      </g>
    </svg>
    <figcaption>图 1　同一道题、同一个模型：直接答容易在心算里翻车；把推理一步步写出来，就把一道难题拆成了几步简单运算，正确率明显上升。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>为什么它有效<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的一节：写出来和不写，凭什么差这么多？模型不是本来就「会」吗？</p>
  <p>回忆大模型怎么生成：<b>一次一个 token、没有全局草稿</b>（见「大语言模型」深读页）。这意味着：</p>
  <ul class="dd-steps">
    <li><b>直接答</b>，等于要求它<b>一步就蹦出整道难题的最终答案</b>——中间的多步推理全靠一次生成「暗中完成」，很容易在某一步出错还没机会纠正。</li>
    <li><b>写出推理</b>，等于把一道难题<b>拆成一串小步</b>，每一步只需在前面步骤的基础上「接对下一步」。而且<b>已经写出的步骤，成了后面步骤的上下文</b>——模型能「看着自己刚写的」继续往下推，稳得多。</li>
  </ul>
  <div class="dd-note key"><b>一句话</b>　思维链可类比为给模型一张<b>外显草稿纸</b>：增加中间 token，让后续 token 能条件化在已生成步骤上。但这是有用直觉，不等于这些文字完整揭示了模型真实内部计算。</div>
  <div class="dd-note math"><b>逐步演算：步骤的价值在于可检查</b>　题目“23 人转来 5 人，平均分 4 组”可写成状态序列：<code>n₀=23</code>，转入后 <code>n₁=23+5=28</code>，分组后 <code>g=n₁/4=7</code>。最后还可反向验算 <code>7×4=28</code>。若中间误写 <code>23+5=27</code>，可见步骤让错误位置暴露；但语言步骤本身仍可能写错，所以机器可计算的算术最好交给计算器或代码验证。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>怎么触发它<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">怎么让模型产生思维链，而不是直接蹦答案？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>方式</th><th>怎么做</th></tr></thead>
    <tbody>
      <tr><td><b>few-shot 思维链</b></td><td>在提示里给一两个「带推理过程」的示例，模型照着「先推理再答」的样子办（这就是上下文学习，见其深读页）</td></tr>
      <tr><td><b>zero-shot</b></td><td>不给示例，只加一句「<b>让我们一步一步思考</b>」，也常能触发它写出步骤</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>它其实是提示工程的一招</b>　思维链是「让它分步」这条提示套路的代表；而它能靠示例触发，正因为模型有上下文学习——你在示例里演示「答案要带推理」，它就照做（见「提示工程」「上下文学习」）。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>进阶变体<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">单条思维链还能怎么加强？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>变体</th><th>思路</th></tr></thead>
    <tbody>
      <tr><td><b>自洽性</b></td><td>同一题<b>独立解多次</b>（用较高温度制造多样），再对答案<b>取多数票</b>，比单条链更稳（见「自洽性」）</td></tr>
      <tr><td><b>思维树</b></td><td>不走一条道，而是像搜索一样<b>展开多个分支、评估、回溯</b>，适合更难的规划类问题（见「思维树 ToT」）</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>共同点</b>　它们都在「让模型多想、想得更结构化」上做文章：一条链嫌单薄，就多来几条投票，或展开成一棵树择优。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>和「推理模型」的关系<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">现在有一类专门的「推理模型」，它和思维链是什么关系？</p>
  <p>思维链最初是一种<b>提示技巧</b>：用指令或示例引出中间步骤。推理模型则通过专门后训练学习怎样使用更多推理预算；预算可能用于更长轨迹，也可能用于多候选、搜索、验证器或工具，而且原始轨迹可以不向用户展示。两者相关，但“写出长篇过程”不是推理模型的定义。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>代价<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">多生成中间步骤带来额外计算，什么时候这份“草稿纸”反而不值得？</p>
  <ul class="dd-steps">
    <li><b>更慢、更贵</b>：写出推理意味着<b>输出变长</b>，生成更多 token，延迟和费用都上去了。</li>
    <li><b>占上下文窗口</b>：长推理会挤占宝贵的窗口预算（见「上下文窗口」）。</li>
    <li><b>不是所有题都需要</b>：简单问题上强行思维链，只会让回答啰嗦；它的价值集中在<b>多步推理</b>的难题。</li>
  </ul>
  <div class="dd-note warn"><b>一个提醒</b>　模型「写出来的推理」不总等于它「真实的内部计算」——有时步骤看着合理、结论却错，或结论对而步骤是事后编的。思维链<b>提升</b>准确率，但不<b>保证</b>正确，也不该被当作对模型内部的可靠解释。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">现在从逐 token 生成推到“为何中间步骤能帮忙、又为何不能当作真相证明”。</p>
  <ol class="dd-chain">
    <li>让模型先写推理再答，把「一步答难题」换成「一步步来」——这就是思维链。<span>（§1）</span></li>
    <li>它有效，是因为模型一次一个 token、没有草稿；拆成小步后每步更易接对，且已写的步骤成了后面的上下文。<span>（§2）</span></li>
    <li>触发靠 few-shot 示例（上下文学习）或一句「一步步思考」。<span>（§3）</span></li>
    <li>可用自洽性（多次投票）、思维树（多分支择优）加强。<span>（§4）</span></li>
    <li>推理模型通过后训练学习使用推理预算；它可产生隐藏轨迹，也可结合多候选、搜索、验证与工具，不只是思维链的“训练版”。<span>（§5）</span></li>
    <li>代价是更慢更贵、占窗口、且不保证真对；简单题不必用。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能用「模型逐词生成、没有草稿」解释「为什么写出推理会更准」，并说清「思维链和推理模型的区别」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">下面这些说法把准确率提升、模型能力、解释忠实性和使用成本混成了一件事。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>思维链让模型更聪明了</td><td>没改模型；只是把难题拆成小步，让它发挥得更稳</td></tr>
      <tr><td>写出的推理=模型真实思路</td><td>不一定；步骤可能是事后编的，提升但不保证正确</td></tr>
      <tr><td>所有任务都该用思维链</td><td>价值在多步推理难题；简单题只会啰嗦、更慢更贵</td></tr>
      <tr><td>思维链就是推理模型</td><td>前者是引出中间步骤的提示范式；后者通过后训练学习使用推理预算，轨迹可隐藏且计算形式更多</td></tr>
      <tr><td>它零成本</td><td>输出变长，更慢、更贵、占窗口</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>思维链具体让模型做什么？</li>
    <li>用「逐词生成、没有草稿」解释：为什么写出推理会更准？</li>
    <li>触发思维链有哪两种常见方式？</li>
    <li>自洽性和思维树分别怎么加强思维链？</li>
    <li>思维链和「推理模型」有什么区别？</li>
    <li>思维链有哪些代价？为什么不是所有题都该用？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>让它在给答案前先一步步写出推理过程，最后再给结论。</li>
      <li>模型一次一个 token、没有全局草稿；直接答等于一步蹦出难题答案易错，写推理把它拆成小步、每步只需接对，且已写步骤成为后续上下文，更稳。</li>
      <li>few-shot：给带推理过程的示例；zero-shot：加一句「让我们一步一步思考」。</li>
      <li>自洽性：同题多次独立解、取多数票；思维树：展开多分支、评估、回溯择优。</li>
      <li>思维链是提示层面的中间步骤范式；推理模型通过后训练学习使用推理预算，不一定展示原始轨迹，也不只依赖一条长链。</li>
      <li>输出变长导致更慢更贵、占上下文窗口，且不保证推理真对；简单题不必用。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>大语言模型、逐词生成、上下文学习、提示工程</td></tr>
      <tr><td><b>本页核心</b></td><td>写出推理、拆解难题、触发方式、代价</td></tr>
      <tr><td>紧邻延伸</td><td>自洽性、思维树 ToT、推理模型、上下文窗口</td></tr>
      <tr><td>更远</td><td>ReAct、自我反思、评测</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noopener">Wei et al., Chain-of-Thought Prompting</a>：思维链提示的原始实验与适用范围。</li>
    <li><a href="https://arxiv.org/abs/2203.11171" target="_blank" rel="noopener">Wang et al., Self-Consistency</a>：多条推理路径采样与答案聚合。</li>
    <li><a href="https://openai.com/index/evaluating-chain-of-thought-monitorability/" target="_blank" rel="noopener">OpenAI, Evaluating chain-of-thought monitorability</a>：可见推理文本、内部过程与监控边界。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-22</div>
</div>
`
};

// 新版教学门禁补充：逐节说明 CoT 的输入输出、机制、触发、变体和忠实性边界。
{
  const page = window.DEEPDIVE["cot"];
  const additions = [
    '<p>思维链提示输入一个多步问题和分步指令或示例，输出中间步骤与最终答案。它把直接猜结论改成先写可检查的局部状态，例如先算 23+5=28，再算 28÷4=7；步骤可为后续生成提供上下文。它能提高部分任务准确率，但中间文字仍可能错误或事后合理化。</p>',
    '<p>逐步机制输入初始状态 n0=23、转入操作和分组规则，输出 n1=28、g=7 及反向检查 7×4=28。规则是先更新总人数 n1=n0+5，再计算 g=n1/4，最后把结果乘四验证；若中间写成 27，错误位置立即可见。外显步骤提供额外计算轨迹，却不是模型内部计算的完整忠实记录。</p>',
    '<p>触发方式输入任务、模型能力、示例数量和输出要求，输出直接答案、few-shot 思维链或 zero-shot 分步回答。few-shot 给一两个带步骤示例让模型模仿格式，zero-shot 只要求逐步处理；先用直接答案做基线，再按任务实测增益。高风险结果仍需计算器、代码或来源验证，不能只因写了步骤就放行。</p>',
    '<p>进阶变体输入单链结果、采样预算、候选多样性、答案聚合规则和搜索评价器，输出自洽投票或思维树搜索结果。自洽性多次独立采样后按答案聚合，思维树展开分支、评价并回溯；二者都用更多计算降低单条路径偶然错误。候选高度相关或评价器失准时，多想仍可能一致地错。</p>',
    '<p>概念关系输入能力来源、预算控制、计算形态和轨迹可见性，输出提示式思维链或推理模型的判断。思维链主要以提示引出中间文字，推理模型经后训练学习怎样使用更长轨迹、多候选、搜索、验证和工具；原始轨迹可以隐藏。两者相关但不能用是否展示长解释来等同。</p>',
    '<p>使用决策输入任务步数、可验证性、延迟费用、上下文预算、风险和解释用途，输出直接答、分步生成、外部工具或转人工。多步数学和代码可从步骤与验证受益，简单格式化常不值得增加 token；长步骤还会挤占上下文。可见思维链不是可靠可解释性证据，也不保证答案正确。</p>'
  ];
  const renderedSections = page.html.split("</section>");
  additions.forEach((html, index) => { renderedSections[index] += html; });
  page.html = renderedSections.join("</section>");
  page.html = page.html.replace('<span class="dd-n">2</span>为什么它有效', '<span class="dd-n">2</span>为什么它有效：逐步演算');
}
