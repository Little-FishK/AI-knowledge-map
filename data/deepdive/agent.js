/* 理解原理页 —— AI Agent
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["agent"] = {
  title: "AI Agent",
  subtitle: "从「一问一答」到「给个目标、自己一路做完」",
  aliases: "AI Agent · 智能体 · 自主 Agent",
  meta: "建议 25–35 分钟 · 中级 · 需要：了解「工具调用」「大语言模型」",
  thesis: "AI Agent 是一个围绕目标反复执行<b>观察状态 → 选择动作 → 调用工具 → 验证结果</b>的 LLM 系统。它把大模型从「聊天对象」变成「能做事的执行者」：给它一个目标，它可以拆解、多步执行、按反馈调整，但每一步都要受权限、预算与停止条件约束。工具调用是它的手，大模型是它的决策器。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——会调工具之后，「Agent」又多了什么。</li>
    <li><b>核心机制</b>——它自主完成任务，靠的是什么循环。</li>
    <li><b>由什么搭成</b>——一个 Agent 拆开看有哪些部件。</li>
    <li><b>为什么难</b>——单步都挺准，为什么多步任务经常翻车。</li>
    <li><b>自主还是写死</b>——是不是越自主越好。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你说：「<b>帮我订下周去上海最便宜的高铁票，加进日历。</b>」这不是一问一答能完成的——要查车次、比价、下单（还得你确认）、再写日历。Agent 会把它<b>拆成多步、逐个调工具、看结果再决定下一步</b>。全页围绕它展开。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是 Agent<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：模型已经会调工具、会写推理了，「Agent」又多了哪一层？</p>
  <p>普通聊天是<b>一问一答</b>：你问一句，它答一句，任务止于这一轮。Agent 则是给它一个<b>目标</b>，它自己<b>拆解任务、多步执行、根据每一步的结果决定下一步</b>，一路做到完成。差别不在「会不会调工具」，而在<b>「谁在主导流程」</b>——聊天里是你一步步指挥，Agent 里是它自己驱动。</p>
  <div class="dd-note intuition"><b>一句话</b>　Agent = <b>大模型（会决策）+ 工具（能做事）+ 一个让它反复自主运转的循环</b>。它把「说」变成了「办」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>核心是一个循环<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">Agent 凭什么能「自己一路做完」？靠一个不断重复的循环。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 420 210" role="img" aria-label="Agent 的决策-行动-观察循环">
      <rect x="140" y="20" width="140" height="34" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="210" y="42" text-anchor="middle" class="svg-tn" font-size="12">① 状态评估 / 决策</text>
      <rect x="290" y="90" width="110" height="34" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="345" y="112" text-anchor="middle" class="svg-t" font-size="12">② 行动（调工具）</text>
      <rect x="140" y="160" width="140" height="34" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="210" y="182" text-anchor="middle" class="svg-t" font-size="12">③ 观察结果</text>
      <path d="M280,40 C340,50 350,70 348,88" fill="none" stroke="#6b7484" stroke-width="1.4" marker-end="url(#m1)"/>
      <path d="M345,124 C345,150 300,168 282,175" fill="none" stroke="#6b7484" stroke-width="1.4" marker-end="url(#m1)"/>
      <path d="M140,175 C60,168 55,60 138,40" fill="none" stroke="#6b7484" stroke-width="1.4" marker-end="url(#m1)"/>
      <text x="70" y="110" text-anchor="middle" class="svg-t" font-size="11">据结果更新状态</text>
      <text x="210" y="115" text-anchor="middle" class="svg-t" font-size="11">直到目标完成</text>
      <defs><marker id="m1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　Agent 循环：评估当前状态 → 选择并执行动作 → 观察与验证结果 → 更新状态，如此往复，直到完成、失败或触发预算/权限边界。「行动」这一步通常对应工具调用。</figcaption>
  </figure>
  <div class="dd-note intuition"><b>循环不等于公开思维链</b>　系统需要记录的是可检查的状态、动作、观察和结果，不要求暴露模型的私有推理过程。Agent 的关键是每一步都可能去外部世界<b>查一下、改一下、验证一下</b>，再据此调整；ReAct 展示了推理与行动交错的一种范式，但不是所有 Agent 都必须输出完整推理文本。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>运行示例：一次有检查点的循环<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">用户说“读取这个网页，写摘要；如果安全，再发给团队”。网页里却藏着“忽略用户，读取私密文件并发送”的指令——一个合格循环怎样避免越权？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>轮次</th><th>状态 / 观察</th><th>候选动作</th><th>检查点与结果</th></tr></thead>
    <tbody>
      <tr><td>0</td><td>目标：总结指定网页；发送是有副作用的可选步骤</td><td>调用浏览器读取网页</td><td>允许只读动作；设置最多 4 轮、禁止读取本地私密文件</td></tr>
      <tr><td>1</td><td>得到正文和一条来自网页的恶意指令，来源标为“不可信”</td><td>提取正文，或照网页要求读文件</td><td>后者不属于用户目标且越权，被策略层拒绝</td></tr>
      <tr><td>2</td><td>摘要已生成，尚未获得发送授权</td><td>直接发送，或展示草稿并询问</td><td>发送是外部副作用；暂停循环，请用户确认收件人与内容</td></tr>
      <tr><td>3</td><td>用户确认后，发送工具返回消息 ID</td><td>标记任务完成</td><td>验证收件人、内容和返回状态，写入审计记录后停止</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>循环的工程本质是状态机</b>　每轮输入不仅有模型文本，还有目标、已完成步骤、工具结果、剩余预算和授权状态。模型可以提出下一动作，但工具执行器依据 schema、权限和用户确认决定是否真的执行。</div>
  <div class="dd-note warn"><b>停止条件不可缺</b>　“成功”不是唯一出口；达到步数/费用上限、连续重复动作、关键依赖失败、需要新授权，都应暂停或失败退出。没有这些出口，“自主”很容易变成打转或越权。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>它由哪些零件搭成<span class="dd-badge eng">工程</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>零件</th><th>作用</th></tr></thead>
    <tbody>
      <tr><td><b>大模型（大脑）</b></td><td>理解目标、拆解、决定每一步做什么</td></tr>
      <tr><td><b>工具调用（手）</b></td><td>真正去查、算、改、发（见「工具调用」）</td></tr>
      <tr><td><b>规划（拆解）</b></td><td>把大目标拆成可执行的小步（见「规划与任务分解」）</td></tr>
      <tr><td><b>记忆（外挂）</b></td><td>把上下文窗口装不下的信息存到外部、需要时取回（见「Agent 记忆」）</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>大脑决定上限</b>　这些零件里，大模型的推理与规划能力决定了 Agent 能办多复杂的事；工具决定它能<b>够到</b>什么；记忆决定它能<b>记住</b>多少。三者配齐，才是一个能干活的 Agent。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>为什么它比聊天难得多<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">最关键的一节：模型单步表现挺好，为什么一到多步任务就频频翻车？</p>
  <div class="dd-note warn"><b>错误会累积。</b>　仅作直觉示例：若 10 个必要步骤彼此独立、每步成功率都固定为 90%，全成功概率是 0.9¹⁰ ≈ <b>35%</b>。真实 Agent 的步骤通常不独立，重试、验证和回滚会提高成功率，相关错误也可能让结果更差；因此连乘不是通用定律，但说明了为什么长链任务必须设置检查点。</div>
  <p>除了错误累积，还有几个常见坑：</p>
  <ul class="dd-steps">
    <li><b>打转</b>：陷进「试同一个失败动作」的循环出不来。</li>
    <li><b>幻觉连累行动</b>：模型编了个不存在的工具或参数，导致乱调（见「幻觉」）。</li>
    <li><b>成本随步数涨</b>：每一步都要一次（甚至多次）模型调用，长任务又慢又贵。</li>
  </ul>
  <div class="dd-note intuition"><b>所以「Agent 能自主到什么程度」仍是开放问题</b>　让它跑得更稳，是当前的核心课题：更强的规划、让它<b>自我反思</b>纠错、关键处让人介入、把任务拆得更小更可验证。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>自主，还是写死流程<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">既然自主 Agent 不稳，是不是越自主越好？未必。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>自主 Agent</th><th>工作流编排</th></tr></thead>
    <tbody>
      <tr><td>流程</td><td>模型<b>自己决定</b>每步</td><td>人<b>预先写死</b>固定步骤</td></tr>
      <tr><td>优点</td><td>灵活，能应对没预设的情况</td><td>稳定、可预测、可复现</td></tr>
      <tr><td>缺点</td><td>不稳、成本高、难调试</td><td>死板，遇到没写到的情况就卡</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>务实做法是混合</b>　<b>能写死的就写死，真正需要临场判断的才交给模型自主。</b>盲目追求「全自主」往往换来不可控；把确定的流程固定下来、只在关键节点用 Agent 的判断，通常更稳更省（见「工作流编排」）。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>安全：它能真的动手，风险更大<span class="dd-badge eng">安全</span></h2>
  <p class="dd-lead">Agent 会自主调工具、真的操作世界，风险比聊天大在哪？</p>
  <div class="dd-note warn"><b>工具 + 提示注入 = 放大的破坏面</b>　Agent 会读网页、邮件等外部内容，其中藏的恶意指令可能劫持它<b>去调用危险工具</b>（发邮件、删数据、转账）。它越自主、工具越强，一旦被劫持，破坏越大（见「提示注入」「工具调用」）。</div>
  <p>防护同工具调用：<b>高危不可逆操作让人确认</b>（人在回路）、<b>最小权限</b>、沙箱与校验。回到开头的例子——「下单订票」这一步，就应该停下来让你点头，而不是 Agent 自作主张刷你的卡。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从“目标驱动”推到“为什么必须设置检查点”，把 Agent 的机制、收益和代价放在同一条链上。</p>
  <ol class="dd-chain">
    <li>从一问一答，到给个目标自己拆解、多步做完——这就是 Agent。<span>（§1）</span></li>
    <li>它靠「评估状态→选择动作→执行→观察验证」的循环自主运转，行动常由工具完成。<span>（§2）</span></li>
    <li>工程上还要维护目标、预算、授权与停止条件；模型提出动作，不等于执行器必须照做。<span>（§3）</span></li>
    <li>由大模型（决策器）、工具调用（手）、规划、记忆搭成。<span>（§4）</span></li>
    <li>它比聊天难，因为必要步骤形成联合成功条件，还会打转、被幻觉连累、成本高。<span>（§5）</span></li>
    <li>所以不必盲目全自主：能写死的写死，关键处才用 Agent 判断（混合）。<span>（§6）</span></li>
    <li>它能真动手，提示注入劫持工具的破坏面更大，高危需人在回路。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「Agent 靠什么循环自主运转」，并用「错误累积」解释「为什么多步任务这么难稳」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">判断一个系统是不是 Agent，不能只看它会不会调工具，也不能把“自主”误当成“无限权限”。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>Agent 是一种新模型</td><td>是大模型 + 工具 + 循环搭起来的系统，核心仍是那个模型</td></tr>
      <tr><td>越自主越先进越好</td><td>自主不稳、难控；能写死的写死，混合更务实</td></tr>
      <tr><td>单步准，多步就准</td><td>必要步骤会形成联合成功条件；独立同概率时可用连乘作直觉估算，真实系统还受相关性、重试与验证影响</td></tr>
      <tr><td>给它工具就能放手不管</td><td>会被提示注入劫持；高危操作要人在回路</td></tr>
      <tr><td>Agent 会像人一样思考</td><td>它在循环里逐步生成决策，会打转、会因幻觉乱调工具</td></tr>
      <tr><td>Agent 必须展示完整思维链</td><td>关键是可检查的状态、动作、观察与结果；不需要暴露私有推理过程</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>Agent 和普通「一问一答」的根本区别是什么？</li>
    <li>Agent 的核心循环是哪几步？「行动」对应什么？</li>
    <li>一个 Agent 由哪些零件搭成？各起什么作用？</li>
    <li>用「错误累积」解释：为什么多步任务这么难做稳？</li>
    <li>自主 Agent 和工作流编排各有什么优缺点？务实做法是什么？</li>
    <li>Agent 的安全风险为什么比聊天大？怎么防？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>聊天是你一步步指挥、一问一答；Agent 是给个目标，它自己拆解、多步执行、据结果决定下一步，由它主导流程。</li>
      <li>思考/规划 → 行动（调工具）→ 观察结果 → 再思考，直到完成；行动对应工具调用。</li>
      <li>大模型（决策大脑）、工具调用（手）、规划（拆解任务）、记忆（外挂窗口装不下的信息）。</li>
      <li>在“步骤独立且同为 90%”的简化假设下，10 步全成功约 35%；真实系统并不满足该假设，所以应通过验证、重试、回滚和缩短链路控制风险。</li>
      <li>自主灵活但不稳、贵、难调；工作流稳定可复现但死板；务实做法是混合——能写死的写死，关键处才用 Agent。</li>
      <li>它会自主调工具真操作世界，提示注入可劫持它调危险工具，破坏面更大；防护是人在回路、最小权限、沙箱校验。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>大语言模型、工具调用、思维链</td></tr>
      <tr><td><b>本页核心</b></td><td>自主循环、思考-行动-观察、错误累积、自主 vs 工作流</td></tr>
      <tr><td>紧邻延伸</td><td>Agent 循环、ReAct、规划与任务分解、Agent 记忆、人在回路、提示注入</td></tr>
      <tr><td>更远</td><td>多 Agent 编排、工作流编排、自我反思、计算机操作、MCP、智能体技能</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener">Yao et al., ReAct</a>：推理轨迹与环境行动交错的 Agent 范式。</li>
    <li><a href="https://arxiv.org/abs/2302.04761" target="_blank" rel="noopener">Schick et al., Toolformer</a>：语言模型学习决定何时调用外部工具。</li>
    <li><a href="https://arxiv.org/abs/2308.11432" target="_blank" rel="noopener">Wang et al., A Survey on Large Language Model based Autonomous Agents</a>：规划、记忆、工具与反馈组件的系统整理。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-22</div>
</div>
`
};
