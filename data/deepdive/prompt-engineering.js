/* 理解原理页 —— 提示工程 Prompt Engineering
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["prompt-engineering"] = {
  title: "提示工程",
  subtitle: "设计输入的措辞与结构，让模型稳定产出你想要的结果",
  aliases: "Prompt Engineering · 提示词工程",
  meta: "建议 20–30 分钟 · 基础 → 中级 · 需要：了解「大语言模型」「上下文学习」",
  thesis: "提示工程是通过设计输入的措辞与结构，让模型稳定产出想要结果的一门手艺。它之所以有效，是因为模型对输入<b>极其敏感</b>——同一个问题换个问法，结果可能天差地别；而它又是<b>零成本</b>的：不改一个权重，只改你怎么问。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——不训练、不改模型，怎么让它产出你要的东西。</li>
    <li><b>凭什么</b>——同一个模型，换个问法凭什么结果差这么多。</li>
    <li><b>怎么写</b>——有效提示的几招通用套路。</li>
    <li><b>底层原理</b>——为什么「给示例、给格式」就管用。</li>
    <li><b>边界</b>——提示压不稳时，该往哪走。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你要模型帮写一段产品文案。
  模糊地问「<b>给我写个手表文案</b>」→ 得到一段泛泛、没重点的话；
  换成「<b>为一款主打续航的运动手表，写 3 条面向跑者的社媒短文案，每条不超过 20 字，口吻活力</b>」→ 立刻好用得多。
  同一个模型，差别全在<b>怎么问</b>。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是提示工程<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：不训练、不改模型，怎么让它稳定产出我想要的结果？</p>
  <p>答案就是<b>把「怎么问」设计好</b>。提示工程不碰模型内部，只经营你喂给它的那段输入——说清要什么、给谁看、什么格式、什么口吻、给不给例子。像开头那个手表文案：把受众、卖点、条数、字数、风格都讲明白，输出质量立刻不同。</p>
  <div class="dd-note intuition"><b>它是「零成本」的第一手段</b>　提示工程不改一个权重、即时生效、随时可改。所以面对任何需求，它几乎总是你<b>第一个该试</b>的办法——试通了就到此为止，省下训练和检索的成本。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>凭什么「怎么问」影响这么大<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的疑问：模型没变，只是问法变了，凭什么结果差这么多？</p>
  <p>回忆大模型的本质：它在预测「<b>在你给的这段文字之后，最可能接下去的内容</b>」（见「大语言模型」深读页）。你的提示，就是它<b>接龙的起点和条件</b>。提示越清楚、约束越具体，模型能锁定「该说什么」的范围就越窄、越准；提示越含糊，它就只能往「最泛泛、最安全」的方向接，于是给你一段正确的废话。</p>
  <div class="dd-note key"><b>一句话</b>　你不是在「命令」一个理解你的人，而是在<b>给一个接龙引擎设定一个尽量明确的开头</b>。开头设定得越好，它接出来的东西越合你意。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>几招通用套路<span class="dd-badge eng">工程</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>套路</th><th>做什么</th><th>例</th></tr></thead>
    <tbody>
      <tr><td>清晰具体</td><td>说清任务、受众、约束，别让它猜</td><td>「面向跑者、每条≤20字」</td></tr>
      <tr><td>给角色</td><td>设定身份/视角，收敛风格</td><td>「你是资深文案」</td></tr>
      <tr><td>指定格式</td><td>要什么结构就明说</td><td>「输出 3 条，用列表」</td></tr>
      <tr><td>给示例（few-shot）</td><td>演示一两个「输入→输出」，让它照做</td><td>见「上下文学习」</td></tr>
      <tr><td>让它分步（思维链）</td><td>复杂题让它先推理再答</td><td>见「思维链 CoT」</td></tr>
      <tr><td>给边界</td><td>说明不要什么、无法回答时怎么办</td><td>「不确定就说不知道」</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note eng"><b>提示是要迭代的</b>　很少一次就写好。看输出哪里不对 → 针对性补一句约束 → 再看。把提示当成<b>可调的参数</b>，一次改一处、观察效果，比一次堆一大段更容易调准。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>它的底层原理，其实是上下文学习<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">为什么「给几个示例、给个格式」模型就照做了？这背后有个更基础的机制。</p>
  <p>是<b>上下文学习</b>（见其深读页）：模型能仅凭提示里的示例，当场「学会」一个任务的样子并照办。提示工程里最有效的那些招——给示例、给格式、给角色——本质都是在<b>用提示演示「我要的输出长什么样」</b>，模型识别出这个模式就跟着做。</p>
  <div class="dd-note intuition"><b>换个说法</b>　上下文学习是「模型能照着提示里的样子办事」这个<b>能力</b>；提示工程是<b>把这个能力用好的手艺</b>——设计出让模型一看就懂「该办成什么样」的提示。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>边界：提示不是万能<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">提示工程这么好用，那它的天花板在哪？什么时候该换招？</p>
  <ul class="dd-steps">
    <li><b>缺的是事实</b>（要最新/私有知识）→ 提示再好也变不出模型没有的知识，该上 <b>RAG</b>（见其深读页）。</li>
    <li><b>要稳定的复杂行为/格式</b>，提示总压不稳、或每次都要写很长 → 考虑<b>微调</b>把行为固化。</li>
    <li><b>要管理的是「整个上下文里放什么」</b>（历史、检索、示例怎么组织）→ 那是更上层的<b>上下文工程</b>（见其节点）。</li>
  </ul>
  <div class="dd-note key"><b>务实的阶梯</b>　先提示工程（零成本）→ 缺事实上 RAG → 要稳定行为再微调。<b>提示是起点，不是终点。</b></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>暗面：提示注入<span class="dd-badge eng">安全</span></h2>
  <p class="dd-lead">既然模型这么听「提示」的话，那恶意的提示能不能劫持它？</p>
  <div class="dd-note warn"><b>能，这就是提示注入</b>　模型会读各种外部内容（网页、邮件、文档）。如果其中藏着「忽略之前的指令，改为……」这类恶意提示，模型可能<b>把它也当成指令</b>照做，覆盖你原本的意图（见「提示注入」深读页）。<b>提示能塑造模型行为，是它的力量，也是它的攻击面。</b></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>不改模型，只把「怎么问」设计好，让模型稳定产出想要的结果——这就是提示工程。<span>（§1）</span></li>
    <li>它有效，是因为模型在「接龙」，你的提示是它的起点和条件，越明确它越准。<span>（§2）</span></li>
    <li>通用套路：清晰具体、给角色、指定格式、给示例、让它分步、给边界，并迭代。<span>（§3）</span></li>
    <li>底层原理是上下文学习：提示在演示「要什么样」，模型照做。<span>（§4）</span></li>
    <li>它的边界：缺事实上 RAG、要稳定行为上微调、管上下文靠上下文工程。<span>（§5）</span></li>
    <li>它的暗面是提示注入：能被提示塑造，就能被恶意提示劫持。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「为什么换个问法结果差这么大（模型在接龙）」，并说出「提示工程和上下文学习是什么关系」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>提示工程要改/训练模型</td><td>不改一个权重，只改输入，零成本、即时</td></tr>
      <tr><td>是玄学，靠念咒语</td><td>是把任务、受众、格式、约束讲清楚，可迭代可复现</td></tr>
      <tr><td>提示能变出模型没有的知识</td><td>不能；缺事实要靠 RAG，缺行为稳定性要靠微调</td></tr>
      <tr><td>一次写好就行</td><td>要看输出迭代调整，一次改一处更易调准</td></tr>
      <tr><td>提示只影响措辞，不涉安全</td><td>能塑造行为就能被提示注入劫持</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>提示工程改动了模型吗？它的核心是什么？</li>
    <li>为什么同一个模型换个问法，结果会差很多？</li>
    <li>说出至少四种有效提示的通用套路。</li>
    <li>「给示例、给格式就管用」，背后是什么机制？</li>
    <li>什么情况下提示工程压不住，该换成 RAG 或微调？</li>
    <li>提示工程的「暗面」是什么？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>没改模型；核心是设计输入的措辞与结构，让模型稳定产出想要的结果，零成本、即时。</li>
      <li>因为模型在预测「你给的文字之后最可能接下去的内容」，提示是它接龙的起点和条件，越明确越能锁定该说什么。</li>
      <li>清晰具体、给角色、指定格式、给示例（few-shot）、让它分步（思维链）、给边界——并迭代。</li>
      <li>上下文学习：提示在演示「要什么样的输出」，模型识别模式后照做。</li>
      <li>缺最新/私有事实用 RAG；要稳定复杂行为或提示总压不稳用微调；管理整个上下文放什么靠上下文工程。</li>
      <li>提示注入：藏在外部内容里的恶意提示可能被当成指令、覆盖原意图。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>大语言模型、上下文学习</td></tr>
      <tr><td><b>本页核心</b></td><td>措辞与结构、清晰具体/角色/格式/示例、迭代、零成本调控</td></tr>
      <tr><td>紧邻延伸</td><td>思维链 CoT、系统提示、上下文工程、RAG、微调、提示注入</td></tr>
      <tr><td>更远</td><td>自洽性、思维树、结构化输出、提示缓存</td></tr>
    </tbody>
  </table></div>
</section>
`
};
