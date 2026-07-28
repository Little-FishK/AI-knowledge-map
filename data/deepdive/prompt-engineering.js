/* 理解原理页 —— 提示工程 Prompt Engineering
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["prompt-engineering"] = {
  title: "提示工程",
  subtitle: "设计输入的措辞与结构，让模型稳定产出你想要的结果",
  aliases: "Prompt Engineering · 提示词工程",
  meta: "建议 20–30 分钟 · 基础 → 中级 · 需要：了解「大语言模型」「上下文学习」",
  thesis: "提示工程是通过设计输入的措辞、结构、示例与约束，提高模型产出符合要求结果的概率。它不改模型权重、迭代快，但并非零成本：更长的提示会增加 token、延迟、维护与评测成本，且跨模型迁移时需要重新验证。",
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
  <div class="dd-note intuition"><b>它是「无需训练」的第一手段</b>　提示工程不改权重、即时生效、随时可改，通常适合先验证需求。但提示越长，推理费用、延迟、维护和回归评测成本越高；“不用训练”不等于“零成本”。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>凭什么「怎么问」影响这么大<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的疑问：模型没变，只是问法变了，凭什么结果差这么多？</p>
  <p>回忆大模型的本质：它在预测「<b>在你给的这段文字之后，最可能接下去的内容</b>」（见「大语言模型」深读页）。你的提示，就是它<b>接龙的起点和条件</b>。提示越清楚、约束越具体，模型能锁定「该说什么」的范围就越窄、越准；提示越含糊，它就只能往「最泛泛、最安全」的方向接，于是给你一段正确的废话。</p>
  <div class="dd-note key"><b>一句话</b>　你不是在「命令」一个理解你的人，而是在<b>给一个接龙引擎设定一个尽量明确的开头</b>。开头设定得越好，它接出来的东西越合你意。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>运行示例：把含糊愿望改成任务契约<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">怎样把一句含糊愿望，改写成模型和评测器都能执行的任务契约？</p>
  <figure class="dd-fig"><svg viewBox="0 0 620 180" role="img" aria-label="提示从目标、上下文、约束到输出契约的分层结构"><defs><marker id="pe1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs><rect x="20" y="55" width="115" height="62" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="77" y="80" text-anchor="middle" class="svg-t">目标</text><text x="77" y="100" text-anchor="middle" class="svg-t" font-size="10">回答退款政策</text><path d="M135,86 L172,86" stroke="#6b7484" marker-end="url(#pe1)"/><rect x="174" y="55" width="125" height="62" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="236" y="80" text-anchor="middle" class="svg-t">上下文</text><text x="236" y="100" text-anchor="middle" class="svg-t" font-size="10">用户订单 + 资料</text><path d="M299,86 L336,86" stroke="#6b7484" marker-end="url(#pe1)"/><rect x="338" y="55" width="125" height="62" rx="8" fill="#21252d" stroke="#cf6f6f"/><text x="400" y="80" text-anchor="middle" class="svg-t">边界</text><text x="400" y="100" text-anchor="middle" class="svg-t" font-size="10">无依据就澄清</text><path d="M463,86 L500,86" stroke="#6b7484" marker-end="url(#pe1)"/><rect x="502" y="55" width="98" height="62" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="551" y="80" text-anchor="middle" class="svg-t">输出契约</text><text x="551" y="100" text-anchor="middle" class="svg-t" font-size="10">结论 + 引用</text><text x="310" y="148" text-anchor="middle" class="svg-t" font-size="10">每一层都应能用测试样例检查，而不是靠“更专业一点”等主观咒语</text></svg><figcaption>图 1　有效提示像接口契约：先定义目标，再提供必要上下文，写清禁止越过的边界，最后规定可验证输出。角色描述只是辅助，不应代替权限或事实来源。</figcaption></figure>
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
  <div class="dd-note key"><b>运行示例：退款助手</b>　初版“回答退款问题”在 20 个测试里只有 11 个同时给出期限和出处。加入任务范围、允许引用的资料、无证据时的澄清策略，以及 JSON 字段 <code>decision/reason/source</code> 后，17 个通过；剩余 3 个失败都涉及质量问题例外，说明下一步应补检索证据或业务规则，而不是继续堆“请认真、请专业”。提示改进应对应可观察失败。</div>
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
  <div class="dd-note key"><b>务实的阶梯</b>　先用提示工程低成本验证 → 缺可更新事实时考虑 RAG → 需要跨大量请求保持特定行为时再评估微调。具体顺序仍取决于质量、延迟、隐私与运维约束。<b>提示是起点，不是终点。</b></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>暗面：提示注入<span class="dd-badge eng">安全</span></h2>
  <p class="dd-lead">既然模型这么听「提示」的话，那恶意的提示能不能劫持它？</p>
  <div class="dd-note warn"><b>能，这就是提示注入</b>　模型会读各种外部内容（网页、邮件、文档）。如果其中藏着「忽略之前的指令，改为……」这类恶意提示，模型可能<b>把它也当成指令</b>照做，覆盖你原本的意图（见「提示注入」深读页）。<b>提示能塑造模型行为，是它的力量，也是它的攻击面。</b></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从条件生成推到任务契约、迭代评测、能力边界和提示注入风险。</p>
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
  <p class="dd-lead">这些误区把提示当训练、知识库、一次性文案或安全控制面。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>提示工程要改/训练模型</td><td>不改权重、只改输入，通常迭代快；仍有 token、延迟、维护与评测成本</td></tr>
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
      <li>不改模型权重；核心是设计输入的措辞、结构、示例与约束来提高命中率。它即时但并非零成本。</li>
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
      <tr><td><b>本页核心</b></td><td>措辞与结构、清晰具体/角色/格式/示例、迭代、无需训练但需评测</td></tr>
      <tr><td>紧邻延伸</td><td>思维链 CoT、系统提示、上下文工程、RAG、微调、提示注入</td></tr>
      <tr><td>更远</td><td>自洽性、思维树、结构化输出、提示缓存</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noopener">Brown et al., GPT-3</a>：零样本、单样本与少样本上下文学习。</li>
    <li><a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noopener">Wei et al., Chain-of-Thought Prompting</a>：示例化中间步骤对复杂推理的影响。</li>
    <li><a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener">Yao et al., ReAct</a>：推理提示与外部行动交错的设计。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-22</div>
</div>
`
};

window.DEEPDIVE["prompt-engineering"].html = window.DEEPDIVE["prompt-engineering"].html
  .replace('<p class="dd-lead">本节回答：不训练、不改模型，怎么让它稳定产出我想要的结果？</p>', '<p class="dd-lead">本节回答：不训练、不改模型，怎么让它稳定产出我想要的结果？</p><p>提示工程可以理解为不改模型、只设计输入措辞与结构来提高命中率的手艺，用于解决怎样不训练就让模型稳定产出想要结果的问题；它输入任务目标、受众、上下文、边界和输出要求，先把这些讲清并写成可提交的提示，再交给模型执行，输出可被测试的提示与结果。输出更符合要求通常表示约束命中率提高，但它不更新权重，效果只对已测模型成立，换模型或分布后需要重新验证。</p>')
  .replace('<p class="dd-lead">最关键的疑问：模型没变，只是问法变了，凭什么结果差这么多？</p>', '<p class="dd-lead">最关键的疑问：模型没变，只是问法变了，凭什么结果差这么多？</p><p>提示对结果的影响可以理解为它重新设定了模型接龙的起点与条件，用于解决模型没变、只问法变凭什么差这么多的疑问；它输入提示和已有前缀，先把提示当作接龙的起点与条件，再据此预测最可能接下去的内容，输出下一步的续写。提示越明确越表示锁定该说什么的范围越窄，但更符合要求只说明约束命中率提高，不表示模型获得了新知识。</p>')
  .replace('<p class="dd-lead">怎样把一句含糊愿望，改写成模型和评测器都能执行的任务契约？</p>', '<p class="dd-lead">怎样把一句含糊愿望，改写成模型和评测器都能执行的任务契约？</p><p>任务契约可以理解为把含糊愿望改写成模型和评测器都能执行的明确规格，用于解决怎样让提示可迭代、可验证的问题；它输入原始需求和失败样本，先定目标、上下文、边界与输出结构，再一次只改一个因素并在固定测试集复测，输出一份可评测的提示契约。分数改善表示某类失败在减少，但若改善不能对应具体失败，就只是不可归因的提示堆叠。</p>')
  .replace('<p class="dd-lead">为什么「给几个示例、给个格式」模型就照做了？这背后有个更基础的机制。</p>', '<p class="dd-lead">为什么「给几个示例、给个格式」模型就照做了？这背后有个更基础的机制。</p><p>提示工程之所以管用，可以理解为它借用了模型的上下文学习能力，用于解决为什么给示例、给格式模型就照做的问题；它输入提示中的示例和新查询，先在前向计算里定位输入到输出的规律，再按这个模式生成，输出符合示例样式的回答。能照示例办事说明模型在做上下文学习，但这种模仿不写进权重，也不保证每个提示都被忠实遵循。</p>')
  .replace('<p class="dd-lead">提示工程这么好用，那它的天花板在哪？什么时候该换招？</p>', '<p class="dd-lead">提示工程这么好用，那它的天花板在哪？什么时候该换招？</p><p>这一节描述提示工程的能力边界与该换招的时机，用于解决什么时候提示压不住、该换招的问题；它输入失败类型、知识来源、稳定性、调用规模和成本，先判断缺的是事实、硬格式还是稳定行为，再决定继续改提示、接入检索还是微调，输出一个换招决策。提示压不稳通常表示问题超出措辞层面，但提示不能创造知识、权限或确定性保证。</p>')
  .replace('<p class="dd-lead">既然模型这么听「提示」的话，那恶意的提示能不能劫持它？</p>', '<p class="dd-lead">既然模型这么听「提示」的话，那恶意的提示能不能劫持它？</p><p>提示注入可以理解为把恶意指令藏进外部内容、劫持模型行为的攻击，用于解决提示的力量为何同时是攻击面的问题；它输入混有可信指令与不可信外部文本的上下文，先让模型像读数据一样读进外部文字，再可能把其中的指令也当成命令执行，输出偏离原任务的行为。模型照做外部指令表示提示能塑造行为这点被反过来利用，但检测到攻击语句不表示建立了安全边界，真正防护要靠权限隔离与人工确认。</p>');
