/* 理解原理页 —— MCP 模型上下文协议 Model Context Protocol
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["mcp"] = {
  title: "MCP 模型上下文协议",
  subtitle: "让任何工具和数据，都能用同一个标准接口插进 AI 应用",
  aliases: "MCP · Model Context Protocol · 模型上下文协议",
  meta: "建议 20–30 分钟 · 中级 · 需要：先了解「工具调用」",
  thesis: "MCP 是一个<b>开放协议</b>，规范模型应用如何发现并使用外部工具、资源与提示。Host 管理用户体验和权限，内部 Client 与 Server 建立一对一会话，通过 JSON-RPC 完成初始化、版本与能力协商，再经 stdio 或 Streamable HTTP 传输消息。“M×N 变 M+N”是生态复用的理想化直觉，不代表不同服务无需认证、授权和语义适配。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>解决什么痛点</b>——已经有工具调用了，为什么还需要一个「协议」。</li>
    <li><b>是什么</b>——一句话说清 MCP 是什么、类比什么。</li>
    <li><b>和工具调用的分工</b>——它和工具调用不是一回事吗。</li>
    <li><b>三个角色</b>——一次 MCP 连接里，Host / Client / Server 谁是谁。</li>
    <li><b>带来什么</b>——标准化之后，AI 工具生态发生了什么变化。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你希望你的 AI 助手能<b>读你的 GitHub 仓库</b>。没有 MCP：每一个助手（Claude Desktop、某 IDE、某 Agent）都得各自写一套「怎么连 GitHub」的对接。有了 MCP：GitHub 只提供<b>一个 MCP server</b>，任何支持 MCP 的助手插上就能用。全页围绕这个「插上就能用」展开。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>它要解决的痛点<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：既然「工具调用」已经能让模型用工具了，为什么还需要一个协议？</p>
  <p>工具调用解决的是「<b>模型怎么表达它要调一个工具</b>」。但它没解决另一个问题：<b>成千上万的工具和数据源，怎么标准地接进各种各样的 AI 应用</b>？</p>
  <p>没有统一标准时，是这样的局面：有 M 个 AI 应用、N 个工具/数据源，每个应用要用每个工具，都得<b>单独写一套对接</b>——总共 <b>M×N</b> 套定制集成。应用多、工具多，这个数字就爆炸；工具方每出一个新应用要重接一遍，应用方每加一个新工具也要重写一遍。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 210" role="img" aria-label="没有标准时 M×N 套定制对接，杂乱">
      <text x="140" y="24" text-anchor="middle" class="svg-t">没有标准：M × N 套定制对接</text>
      <g>
        <rect x="30" y="45" width="70" height="26" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="65" y="63" text-anchor="middle" class="svg-t" font-size="11">应用A</text>
        <rect x="30" y="95" width="70" height="26" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="65" y="113" text-anchor="middle" class="svg-t" font-size="11">应用B</text>
        <rect x="30" y="145" width="70" height="26" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="65" y="163" text-anchor="middle" class="svg-t" font-size="11">应用C</text>
        <rect x="200" y="45" width="70" height="26" rx="5" fill="#21252d" stroke="#d3a05a"/><text x="235" y="63" text-anchor="middle" class="svg-t" font-size="11">GitHub</text>
        <rect x="200" y="95" width="70" height="26" rx="5" fill="#21252d" stroke="#d3a05a"/><text x="235" y="113" text-anchor="middle" class="svg-t" font-size="11">数据库</text>
        <rect x="200" y="145" width="70" height="26" rx="5" fill="#21252d" stroke="#d3a05a"/><text x="235" y="163" text-anchor="middle" class="svg-t" font-size="11">文件系统</text>
        <g stroke="#cf6f6f" stroke-width="1" opacity=".65">
          <line x1="100" y1="58" x2="200" y2="58"/><line x1="100" y1="58" x2="200" y2="108"/><line x1="100" y1="58" x2="200" y2="158"/>
          <line x1="100" y1="108" x2="200" y2="58"/><line x1="100" y1="108" x2="200" y2="108"/><line x1="100" y1="108" x2="200" y2="158"/>
          <line x1="100" y1="158" x2="200" y2="58"/><line x1="100" y1="158" x2="200" y2="108"/><line x1="100" y1="158" x2="200" y2="158"/>
        </g>
      </g>
      <text x="430" y="24" text-anchor="middle" class="svg-t">有 MCP：M + N，各接一次</text>
      <g>
        <rect x="330" y="45" width="60" height="26" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="360" y="63" text-anchor="middle" class="svg-t" font-size="11">应用A</text>
        <rect x="330" y="95" width="60" height="26" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="360" y="113" text-anchor="middle" class="svg-t" font-size="11">应用B</text>
        <rect x="330" y="145" width="60" height="26" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="360" y="163" text-anchor="middle" class="svg-t" font-size="11">应用C</text>
        <rect x="430" y="93" width="50" height="30" rx="6" fill="#1a1d23" stroke="#4f9d78" stroke-width="2"/><text x="455" y="112" text-anchor="middle" class="svg-tn" font-size="11">MCP</text>
        <rect x="510" y="45" width="45" height="26" rx="5" fill="#21252d" stroke="#d3a05a"/><text x="532" y="63" text-anchor="middle" class="svg-t" font-size="10">GitHub</text>
        <rect x="510" y="95" width="45" height="26" rx="5" fill="#21252d" stroke="#d3a05a"/><text x="532" y="113" text-anchor="middle" class="svg-t" font-size="10">数据库</text>
        <rect x="510" y="145" width="45" height="26" rx="5" fill="#21252d" stroke="#d3a05a"/><text x="532" y="163" text-anchor="middle" class="svg-t" font-size="10">文件</text>
        <g stroke="#4f9d78" stroke-width="1.2">
          <line x1="390" y1="58" x2="430" y2="103"/><line x1="390" y1="108" x2="430" y2="108"/><line x1="390" y1="158" x2="430" y2="113"/>
          <line x1="480" y1="103" x2="510" y2="58"/><line x1="480" y1="108" x2="510" y2="108"/><line x1="480" y1="113" x2="510" y2="158"/>
        </g>
      </g>
    </svg>
    <figcaption>图 1　左：没有标准，M 个应用 × N 个工具 = M×N 套两两定制的对接，杂乱且难维护。右：有了 MCP 这个统一接口，每个应用、每个工具都只接一次 MCP，就能互通——M×N 降到 M+N。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>MCP 是什么：AI 世界的「USB-C」<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">一句话，MCP 到底是什么？</p>
  <p>MCP 是一个<b>开放标准协议</b>：它规定了「工具和数据源怎么<b>暴露</b>自己」，以及「AI 应用怎么<b>连接</b>并使用它们」。就像 <b>USB-C</b> 统一了充电和数据口——不管什么设备、什么线，认准这个口就能插；也像 <b>HTTP</b> 统一了浏览器和网站的对话方式。定好一套接口，<b>两边各按标准实现一次，就能互通</b>，不必两两定制。</p>
  <div class="dd-note key"><b>它把 M×N 变成 M+N</b>　工具方实现<b>一次</b> MCP server（比如官方的 GitHub server），就能被所有支持 MCP 的应用使用；应用方实现<b>一次</b> MCP client，就能接入整个 MCP 生态里的工具。新增一个工具，是「＋1」，不是「×M」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>它和工具调用的分工<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">你可能会想：这不就是工具调用吗？——它们是两层不同的事，得分清。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>工具调用</th><th>MCP</th></tr></thead>
    <tbody>
      <tr><td>解决哪层问题</td><td><b>模型层面</b>：模型怎么表达「我要调这个工具」</td><td><b>连接层面</b>：工具/数据怎么标准地暴露、应用怎么连</td></tr>
      <tr><td>类比</td><td>「点单」的动作</td><td>统一的「菜单格式 + 后厨接口」标准</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>换个说法</b>　工具调用告诉你「模型会点单」；MCP 告诉你「所有餐厅的菜单和后厨，都按同一套标准来做，于是任何一个会点单的助手，走进任何一家餐厅都能直接点」。前者是能力，后者是让这能力<b>规模化、可复用</b>的标准。MCP 底下仍然用工具调用，它标准化的是「工具从哪来、怎么接进来」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>三个角色：Host / Client / Server<span class="dd-badge math">数学</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">一次 MCP 连接里，有三个角色。搞清谁是谁，整件事就清楚了。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>角色</th><th>是谁</th><th>例子</th></tr></thead>
    <tbody>
      <tr><td><b>Host（宿主）</b></td><td>跑着模型、面向用户的那个应用</td><td>Claude Desktop、某 IDE、某 Agent</td></tr>
      <tr><td><b>Client（客户端）</b></td><td>Host 内部、负责连<b>一个</b> Server 的连接器</td><td>Host 里连 GitHub server 的那根「插头」</td></tr>
      <tr><td><b>Server（服务端）</b></td><td>暴露某个工具/数据源能力的一方</td><td>GitHub server、数据库 server、文件系统 server</td></tr>
    </tbody>
  </table></div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 180" role="img" aria-label="Host 里有多个 Client，各连一个 Server">
      <rect x="20" y="40" width="200" height="110" rx="10" fill="none" stroke="#6b8cbe" stroke-width="2"/>
      <text x="120" y="32" text-anchor="middle" class="svg-t">Host（AI 应用）</text>
      <circle cx="70" cy="75" r="10" fill="#1a1d23" stroke="#6b8cbe"/><text x="70" y="98" text-anchor="middle" class="svg-t" font-size="10">Client</text>
      <circle cx="120" cy="75" r="10" fill="#1a1d23" stroke="#6b8cbe"/><text x="120" y="98" text-anchor="middle" class="svg-t" font-size="10">Client</text>
      <circle cx="170" cy="75" r="10" fill="#1a1d23" stroke="#6b8cbe"/><text x="170" y="98" text-anchor="middle" class="svg-t" font-size="10">Client</text>
      <text x="120" y="135" text-anchor="middle" class="svg-t" font-size="11">模型在这里跑</text>
      <line x1="80" y1="75" x2="360" y2="55" stroke="#4f9d78" stroke-width="1.4" marker-end="url(#i1)"/>
      <line x1="130" y1="75" x2="360" y2="95" stroke="#4f9d78" stroke-width="1.4" marker-end="url(#i1)"/>
      <line x1="180" y1="75" x2="360" y2="135" stroke="#4f9d78" stroke-width="1.4" marker-end="url(#i1)"/>
      <rect x="360" y="40" width="160" height="30" rx="6" fill="#21252d" stroke="#d3a05a"/><text x="440" y="60" text-anchor="middle" class="svg-t" font-size="11">GitHub Server</text>
      <rect x="360" y="80" width="160" height="30" rx="6" fill="#21252d" stroke="#d3a05a"/><text x="440" y="100" text-anchor="middle" class="svg-t" font-size="11">数据库 Server</text>
      <rect x="360" y="120" width="160" height="30" rx="6" fill="#21252d" stroke="#d3a05a"/><text x="440" y="140" text-anchor="middle" class="svg-t" font-size="11">文件系统 Server</text>
      <defs><marker id="i1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#4f9d78"/></marker></defs>
    </svg>
    <figcaption>图 2　一个 Host（AI 应用）里可以有多个 Client，每个 Client 连一个 Server。要多接一个工具，就在 Host 里加一个 Client 去连它的 Server——即插即用。（三角色与传输方式的细节见「MCP 架构」节点。）</figcaption>
  </figure>
  <div class="dd-note math"><b>Server 通常暴露三类东西</b>　<b>工具（tools）</b>是可调用操作；<b>资源（resources）</b>是可读取上下文；<b>提示（prompts）</b>是用户可选择的模板。它们的控制主体不同：工具常由模型决定调用，资源由应用管理，提示通常由用户显式选择。</div>
  <div class="dd-note eng"><b>连接不是“插上就直接调用”</b>　Client 与 Server 先以 JSON-RPC 完成 <code>initialize</code> 握手，协商协议版本与双方能力，再进入正常会话；本地常用 <code>stdio</code>，远程常用 Streamable HTTP。只有协商声明的能力才应被使用，生命周期与错误也要按协议处理。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>运行示例：从握手到调用工具<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">把“连接一个天气 Server 并查纽约天气”走一遍：协议负责把能力变成可发现、可验证的消息序列，但不替 Host 决定是否授权。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>阶段</th><th>消息</th><th>这一步解决什么</th></tr></thead>
    <tbody>
      <tr><td>① 发起握手</td><td>Client → Server：<code>initialize</code></td><td>声明协议版本、Client 信息与支持的能力</td></tr>
      <tr><td>② 协商结果</td><td>Server → Client：<code>InitializeResult</code></td><td>选定协议版本，返回 Server 信息及它支持的能力</td></tr>
      <tr><td>③ 握手完成</td><td>Client → Server：<code>notifications/initialized</code></td><td>确认初始化结束，双方进入正常会话</td></tr>
      <tr><td>④ 发现能力</td><td>Client → Server：<code>tools/list</code></td><td>取得工具名、描述和输入 schema，例如 <code>get_weather(city)</code></td></tr>
      <tr><td>⑤ 发起调用</td><td>Client → Server：<code>tools/call</code></td><td>Host 选中工具并验证参数后，发送 <code>{city: "New York"}</code></td></tr>
      <tr><td>⑥ 处理结果</td><td>Server → Client：调用结果</td><td>Host 标记来源、检查错误，再决定哪些内容进模型、哪些动作需用户确认</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note math"><b>关键边界</b>　能力协商只说明“双方会什么”，不等于“用户授权做什么”。即使 Server 声明了写文件或发消息工具，Host 仍应独立执行权限检查；工具返回值也是外部数据，不会因为走了 MCP 就自动可信。</div>
  <div class="dd-note key"><b>把协议看成状态机</b>　初始化完成前不能随意调用；发现工具后，模型提出的是候选调用；真正执行前还要经过参数校验、权限与同意检查。MCP 规范消息交换，Host 保留最终控制权。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>标准化带来了什么<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">把接口统一之后，AI 工具生态发生了什么实质变化？</p>
  <ul class="dd-steps">
    <li><b>工具可复用</b>：工具方实现一次 MCP server，兼容相同核心原语、传输和授权条件的 Host 就能复用，不必两两重写。</li>
    <li><b>应用可扩展</b>：一个 Agent 支持 MCP 后，可以按需接入兼容的 server；实际可用性仍取决于协议版本、认证授权和扩展能力。</li>
    <li><b>可组合</b>：文件系统 + 数据库 + 浏览器几个 server 拼起来，同一个 Agent 就能跨系统协作完成复杂任务。</li>
  </ul>
  <div class="dd-note key"><b>为什么这是件大事</b>　它把「给 AI 接工具」从<b>一次性的定制活</b>，变成了<b>可积累的公共生态</b>——就像有了 USB 标准之后，外设厂商和电脑厂商不用再两两适配。这是 AI 应用能快速长出「手和脚」的关键基础设施之一（所以它被标为演进中的活跃方向）。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>安全：连外部 Server 的代价<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">「插上就能用」很爽，但连接外部 server 也引入了新的信任问题。</p>
  <ul class="dd-steps">
    <li><b>Server 本身可能不可信</b>：一个恶意或被攻陷的 server，可能滥用它被授予的权限，或返回误导性内容。<b>只连你信任的 server。</b></li>
    <li><b>工具结果里可能夹带提示注入</b>：server 返回的内容会进入模型的上下文，其中若藏有恶意指令，可能劫持模型去调用别的危险工具（见「提示注入」「工具调用」第 6 节）。</li>
    <li><b>权限与授权</b>：给 server 的访问权限要遵循最小权限；涉及高危操作，仍需人在回路确认。</li>
  </ul>
  <div class="dd-note warn"><b>标准降低了接入门槛，也降低了「接入坏东西」的门槛</b>　正因为「插上就能用」，更要对<b>插的是什么</b>保持警惕。MCP 解决的是「怎么连」，不替你判断「该不该连、连了给多大权限」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">现在把“为什么要标准化”一路连到“为什么协议不能替代授权”，检查每个结论从哪里来。</p>
  <ol class="dd-chain">
    <li>工具调用让模型会「点单」，但没解决「成千上万工具怎么标准接入各种应用」。<span>（§1）</span></li>
    <li>没有标准时是 M×N 套两两定制，会爆炸。<span>（§1）</span></li>
    <li>MCP 是一个开放标准（AI 界的 USB-C），两边各按标准实现一次即可互通，M×N 降到 M+N。<span>（§2）</span></li>
    <li>它和工具调用分属两层：一个是模型能力，一个是连接标准；MCP 底下仍用工具调用。<span>（§3）</span></li>
    <li>一次连接有三个角色：Host（应用）、Client（连接器）、Server（暴露工具/数据/提示）。<span>（§4）</span></li>
    <li>连接先经历初始化、能力协商、发现与调用；协议规定消息顺序，Host 负责授权和结果处置。<span>（§5）</span></li>
    <li>标准化让工具可复用、应用可扩展、能力可组合，形成公共生态。<span>（§6）</span></li>
    <li>但连外部 server 引入信任问题：恶意 server、工具结果里的提示注入、权限管理。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「MCP 为什么把 M×N 变成 M+N」，并说出「它和工具调用分别解决哪一层的问题」，你就抓住了 MCP 的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">下面这些说法都把“协议兼容”“能力声明”和“安全授权”混成了一件事。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>MCP 就是工具调用</td><td>工具调用是模型能力（怎么点单）；MCP 是连接标准（工具怎么接进来）</td></tr>
      <tr><td>MCP 是某个产品或模型</td><td>是一个<b>开放协议/标准</b>，谁都能实现 server 或 client</td></tr>
      <tr><td>用了 MCP 就自动安全</td><td>它只管「怎么连」；连不可信 server、给太大权限的风险仍需你把控</td></tr>
      <tr><td>Server 只能提供「工具」</td><td>还能暴露资源（可读数据）和提示（模板）</td></tr>
      <tr><td>接一个新工具要改所有应用</td><td>工具方实现一次 server，所有支持 MCP 的应用即可复用</td></tr>
      <tr><td>Server 声明了能力就等于获准执行</td><td>能力协商只说明支持什么；Host 仍须按用户意图、权限和风险独立授权</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>已经有工具调用了，MCP 还多解决了什么问题？</li>
    <li>为什么说没有标准时是「M×N」，有了 MCP 是「M+N」？</li>
    <li>用一个类比说清 MCP 是什么。</li>
    <li>MCP 和工具调用分别解决哪一层的问题？两者什么关系？</li>
    <li>Host、Client、Server 各是谁？举例说明。</li>
    <li>MCP 的 Server 通常暴露哪三类东西？</li>
    <li>从 <code>initialize</code> 到 <code>tools/call</code> 要经过哪些关键阶段？能力协商为何不等于授权？</li>
    <li>连接外部 MCP server 有哪些安全风险？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>解决「成千上万的工具/数据源怎么用统一标准接入各种 AI 应用」，避免每个应用对每个工具都写一套专用对接。</li>
      <li>没标准时 M 个应用各自对接 N 个工具要 M×N 套定制；有了 MCP，每个应用、每个工具各按标准接一次即可互通，共 M+N。</li>
      <li>像 AI 世界的 USB-C（或 HTTP）：定好统一接口，工具和应用两边各实现一次就能插上互通。</li>
      <li>工具调用是模型层面的能力（怎么表达要调工具）；MCP 是连接层面的标准（工具怎么暴露、应用怎么连）；MCP 底下仍用工具调用。</li>
      <li>Host 是跑模型的应用（如 Claude Desktop/IDE）；Client 是 Host 里连某个 Server 的连接器；Server 暴露某工具/数据源（如 GitHub server）。</li>
      <li>工具（可调用的操作）、资源（可读的数据）、提示（预设模板）。</li>
      <li>初始化请求 → 返回协商结果 → initialized 通知 → tools/list 发现 → 校验并 tools/call → 处理结果；协商只描述能力，是否允许执行仍由 Host 的权限和用户意图决定。</li>
      <li>恶意或被攻陷的 server、工具返回内容里夹带的提示注入、以及过大的权限；应只连可信 server、最小权限、高危操作人在回路。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>工具调用 / 函数调用、大语言模型、AI Agent</td></tr>
      <tr><td><b>本页核心</b></td><td>开放标准、M×N→M+N、Host/Client/Server、tools/resources/prompts</td></tr>
      <tr><td>紧邻延伸</td><td>MCP 架构、AI Agent、Agent 循环、提示注入、人在回路</td></tr>
      <tr><td>更远</td><td>智能体技能、上下文工程、多 Agent 编排、计算机操作</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://modelcontextprotocol.io/specification/2025-11-25/server/index" target="_blank" rel="noopener">MCP Specification 2025-11-25: Server Features</a>：Resources、Prompts、Tools 三类服务端原语与控制边界。</li>
    <li><a href="https://modelcontextprotocol.io/specification/2025-11-25/schema" target="_blank" rel="noopener">MCP Specification 2025-11-25: Schema Reference</a>：初始化、能力协商、工具发现和调用的消息结构。</li>
    <li><a href="https://modelcontextprotocol.io/docs/learn/architecture" target="_blank" rel="noopener">MCP Architecture Overview</a>：Host/Client/Server 连接模型与 stdio、Streamable HTTP 传输。</li>
    <li><a href="https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices" target="_blank" rel="noopener">MCP Security Best Practices</a>：最小权限、令牌与本地 Server 风险。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-22</div>
</div>
`
};
