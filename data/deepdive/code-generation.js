/* 理解原理页 —— 代码生成 / AI 编程 Code Generation
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["code-generation"] = {
  title: "代码生成 / AI 编程",
  subtitle: "让模型写代码，从补全一行到实现整个功能",
  aliases: "Code Generation · AI 编程 · Coding",
  meta: "建议 25–35 分钟 · 中级 · 需要：了解「大语言模型」「工具调用」",
  thesis: "代码生成让大模型写代码——从补全一行，到实现整个功能、跨文件改动。它之所以成为大模型<b>最成功的应用之一</b>，是因为代码有三个绝佳性质：本身是文本（预训练见过海量）、有明确语法且<b>可执行验证</b>（对错能测）、模式重复多。可验证，让它能「写了就跑、跑错就改」，形成别的任务少有的自我纠正闭环。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——让模型写代码，和让它写文章有何不同。</li>
    <li><b>为什么这么成功</b>——为什么「写代码」成了大模型最成功的应用之一。</li>
    <li><b>怎么进化的</b>——从补全一行，到自主编程 Agent。</li>
    <li><b>关键搭档</b>——光会写还不够，还差什么。</li>
    <li><b>能直接信吗</b>——AI 写的代码有哪些坑。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你对着一段代码说：「<b>给这个函数加上缓存。</b>」模型要读懂这个函数、写出改动、最好还能<b>跑一下测试确认没弄坏别的</b>。全页围绕「写 → 跑 → 改」这个闭环展开。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是 AI 编程<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：让模型写代码，和让它写一段文案，本质上有什么不同？</p>
  <p>表面看都是「生成文本」，但代码有个散文没有的性质：<b>它要能运行、且对错分明</b>。AI 编程覆盖从小到大的一整条谱系——补全你正在打的这一行、按注释生成一个函数、实现一整个功能、跨多个文件重构。程度不同，内核一样：<b>让模型把「意图」翻译成「能跑的代码」</b>。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>为什么代码特别适合大模型<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的一节：同样是生成，为什么「写代码」偏偏成了大模型落地最成功的方向之一？</p>
  <p>因为代码同时具备三个绝佳性质：</p>
  <ul class="dd-steps">
    <li><b>本身是文本</b>：预训练时模型见过<b>海量</b>开源代码，写代码正是它的老本行。</li>
    <li><b>可执行验证</b>：代码对不对，<b>跑一下就知道</b>——报错、测试挂了，都是明确的反馈。这和散文「好不好」没有客观标准截然不同。</li>
    <li><b>模式重复、结构化</b>：语法严格、套路多（增删改查、循环、错误处理），非常适合模型「按模式续写」。</li>
  </ul>
  <div class="dd-note key"><b>「可验证」是重中之重，但验证只覆盖已表达的规格</b>　编译器、测试和静态分析能提供客观反馈；然而测试可能缺边界条件，程序也可能“测试全绿但需求理解错了”。可靠闭环需要先把需求变成可检查的验收条件，再结合单元测试、集成测试、安全扫描与人工审查。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>从「补全」到「编程 Agent」<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">AI 编程不是一步到位的，它沿着「管得越来越宽」进化。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>阶段</th><th>能做什么</th></tr></thead>
    <tbody>
      <tr><td>补全</td><td>你打字时实时补下一行/一段（如早期 Copilot）</td></tr>
      <tr><td>对话式</td><td>用自然语言让它生成、解释、改一段代码</td></tr>
      <tr><td>仓库级</td><td>读懂整个项目、跨文件改动（见「AI 编程工具」）</td></tr>
      <tr><td>自主编程 Agent</td><td>给个任务，自己读代码、改多个文件、跑测试、看报错再改（见「AI Agent」「Claude Code」）</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>越往后，越依赖 Agent 那一套</b>　「补全」只需模型会写；「自主编程」则要它像 Agent 一样循环——规划、调工具（读文件、跑命令）、看结果再改。所以 AI 编程的高级形态，本质是<b>把 Agent 用在了代码上</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>关键搭档：代码执行<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">光会「写」代码还不够。要让它真正靠谱，还差最重要的一步。</p>
  <p>那就是<b>把代码真的跑起来</b>。让模型写完就执行、拿运行或测试的结果回来，它就能<b>发现自己写错了、并据此修改</b>——「写 → 跑 → 看报错 → 改 → 再跑」，形成闭环（见「代码执行与沙箱」）。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 420 130" role="img" aria-label="写-跑-改的闭环">
      <rect x="30" y="48" width="90" height="34" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="75" y="70" text-anchor="middle" class="svg-t" font-size="12">写代码</text>
      <line x1="120" y1="65" x2="160" y2="65" stroke="#6b7484" stroke-width="1.4" marker-end="url(#n1)"/>
      <rect x="160" y="48" width="90" height="34" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="205" y="70" text-anchor="middle" class="svg-t" font-size="12">跑 / 测</text>
      <line x1="250" y1="65" x2="290" y2="65" stroke="#6b7484" stroke-width="1.4" marker-end="url(#n1)"/>
      <rect x="290" y="48" width="100" height="34" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="340" y="70" text-anchor="middle" class="svg-t" font-size="12">看报错→改</text>
      <path d="M340,82 C340,110 120,110 75,84" fill="none" stroke="#6b7484" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#n1)"/>
      <defs><marker id="n1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　可验证带来的闭环：写完就跑，用真实的报错和测试结果来纠错，再改再跑。正是这个客观反馈，让 AI 编程能自我纠正——这是写文案等任务给不了的。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>上下文决定成败<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">为什么同一个模型，写个小函数很强，一放进你的大项目就常出错？</p>
  <p>因为它<b>没看到项目的全貌</b>。真实代码库里，一段改动往往要顾及别处的接口、命名约定、依赖关系——这些都在别的文件里。如果没把<b>相关的上下文喂给它</b>（相关文件、函数签名、项目约定），它只能凭猜，于是写出「单看没错、放进项目就崩」的代码。所以仓库级 AI 编程的核心，是<b>上下文工程</b>：把对的上下文，在有限的窗口里喂对（见「上下文工程」「上下文窗口」）。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>能直接信吗：风险<span class="dd-badge eng">安全</span></h2>
  <p class="dd-lead">AI 写的代码，能闭眼合并吗？</p>
  <ul class="dd-steps">
    <li><b>幻觉编 API</b>：它可能<b>一本正经地调用一个不存在的函数或库</b>——名字看着合理，其实根本没有（见「幻觉」）。</li>
    <li><b>看着对、其实有 bug</b>：能跑通不代表逻辑对；边界情况、并发、数值精度上藏着隐患。</li>
    <li><b>安全漏洞</b>：可能写出有注入、越权等问题的代码，或照抄了训练数据里的坏范例。</li>
    <li><b>过度信任</b>：代码越长、越像模像样，越容易让人放松审查——恰恰危险。</li>
  </ul>
  <div class="dd-note warn"><b>把它当「很强但会犯错的初级工程师」</b>　高产、好用，但产出<b>必须审、必须测</b>。AI 编程的正确用法是「人把关的加速器」，不是「无人监督的替代品」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6.5</span>怎么评估：片段题不等于真实仓库<span class="dd-badge math">数学</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">一个模型在小函数基准上很强，能否推出它会修真实项目？</p>
  <p>不能直接推出。函数生成常用 <b>pass@k</b>：采样 k 个候选，只要至少一个通过隐藏测试就算成功；它衡量“多试几次能否命中”。仓库级任务还要求定位相关文件、理解依赖、修改最小范围并通过回归测试，SWE-bench 一类评测更接近这种流程。比较结果时还要固定测试集、工具权限、采样预算和是否允许重试，否则分数不可直接比较。</p>
  <div class="dd-note math"><b>指标边界</b>　pass@1 关注单次命中，pass@k 还包含采样预算带来的收益；测试通过只证明通过了现有测试，不证明代码安全、性能合格或完全符合用户意图。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>AI 编程让模型把意图翻译成能跑的代码，从补全到实现功能。<span>（§1）</span></li>
    <li>它成功，因为代码是文本（海量训练）、可执行验证（对错能测）、模式多。<span>（§2）</span></li>
    <li>它沿补全→对话→仓库级→自主编程 Agent 进化，高级形态就是把 Agent 用在代码上。<span>（§3）</span></li>
    <li>关键搭档是代码执行：写→跑→看报错→改的闭环让它能自我纠正。<span>（§4）</span></li>
    <li>但在大项目里，上下文喂不对就会瞎写，故核心是上下文工程。<span>（§5）</span></li>
    <li>风险：编不存在的 API、隐藏 bug、安全漏洞、过度信任——必须审必须测。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「为什么‘可验证’让代码成了大模型最成功的应用之一」，并说出「仓库级为什么高度依赖上下文」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>写代码和写文章对模型是一回事</td><td>代码可执行验证、对错分明，故能自我纠正</td></tr>
      <tr><td>能跑通就说明代码对</td><td>跑通≠逻辑对；边界/安全/性能仍需审</td></tr>
      <tr><td>模型不会编不存在的 API</td><td>会；幻觉在代码上表现为调用根本不存在的函数/库</td></tr>
      <tr><td>小片段强，大项目自然也强</td><td>大项目要喂对上下文，否则会瞎写</td></tr>
      <tr><td>AI 能取代程序员、无需审查</td><td>是需人把关的加速器，产出必须审必须测</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>相比写文案，代码有哪三个让它特别适合大模型的性质？</li>
    <li>为什么说「可验证」是 AI 编程成功的关键？</li>
    <li>AI 编程从补全到自主编程 Agent，越到高级越依赖什么？</li>
    <li>代码执行为什么是 AI 编程的关键搭档？</li>
    <li>为什么模型在大项目里更容易出错？核心该做什么？</li>
    <li>AI 写的代码有哪些必须警惕的风险？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>本身是文本（预训练见过海量代码）、可执行验证（对错能测）、模式重复且结构化。</li>
      <li>因为写错能被运行/测试当场抓出并据此改，形成客观反馈的自我纠正闭环，这是散文类任务没有的。</li>
      <li>越依赖 Agent 那套：规划、调工具（读文件/跑命令）、看结果再改。</li>
      <li>因为写完能真跑，用报错和测试结果纠错，形成「写-跑-改」闭环，让产出更可靠。</li>
      <li>因为它没看到项目全貌（别处的接口/约定/依赖）；核心是上下文工程，把相关上下文在有限窗口里喂对。</li>
      <li>编不存在的 API、看着对其实有 bug、引入安全漏洞、以及因为像模像样而被过度信任；必须审、必须测。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>大语言模型、工具调用、AI Agent</td></tr>
      <tr><td><b>本页核心</b></td><td>可执行验证、写-跑-改闭环、从补全到编程 Agent、上下文决定成败</td></tr>
      <tr><td>紧邻延伸</td><td>代码执行与沙箱、AI 编程工具、上下文工程、幻觉、人在回路</td></tr>
      <tr><td>更远</td><td>规划与任务分解、工作流编排、评测</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2107.03374" target="_blank" rel="noopener">Chen et al., Evaluating Large Language Models Trained on Code</a>：代码模型训练与 pass@k 评测。</li>
    <li><a href="https://arxiv.org/abs/2310.06770" target="_blank" rel="noopener">Jimenez et al., SWE-bench</a>：真实仓库级软件工程任务评测。</li>
    <li><a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener">Yao et al., ReAct</a>：工具交互与反馈循环，可迁移到编码 Agent。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-21</div>
</div>
`
};
