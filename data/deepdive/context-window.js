/* 理解原理页 —— 上下文窗口 Context Window
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["context-window"] = {
  title: "上下文窗口",
  subtitle: "模型一次能「看见」的 token 总量上限",
  aliases: "Context Window · 上下文长度 · Context Length",
  meta: "建议 20–30 分钟 · 基础 → 中级 · 需要：了解「Token」「注意力」",
  thesis: "上下文窗口是一次请求中模型可直接条件化的 token 预算——系统指令、提示、对话历史、检索材料、工具结果与生成内容会共同占用预算。窗口之外的信息不会自动参与本次计算，除非应用重新检索、摘要或以外部记忆注入。标准全局注意力的平方开销是重要约束之一，但位置表示、训练长度、缓存、硬件和注意力变体也共同决定可用窗口。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——窗口里装的到底是哪些东西。</li>
    <li><b>关键澄清</b>——模型是不是真的「记住」了对话。</li>
    <li><b>为什么有限</b>——为什么不干脆做成无限大。</li>
    <li><b>塞满就好吗</b>——窗口够大，把所有资料都塞进去行不行。</li>
    <li><b>怎么应对</b>——内容超出窗口时有哪些办法。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你和模型聊了很久，开头告诉过它「我叫小明」。聊到很后面再问「我叫什么？」，它却答不上来了。问题不在于它「忘性大」，而在于——「我叫小明」那句话<b>已经滑出了上下文窗口</b>。全页解释这背后的机制。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是上下文窗口：16K 数值例子<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：模型一次到底能「看进去」多少东西？</p>
  <p>上下文窗口是模型单次处理时能容纳的 <b>token 总量上限</b>。要注意，这个窗口里装的<b>不只是你这句提问</b>，而是这一次要一起喂给模型的<b>全部内容</b>：</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>窗口里装着</th><th>例子</th></tr></thead>
    <tbody>
      <tr><td>系统提示 / 指令</td><td>「你是一个客服助手…」</td></tr>
      <tr><td>对话历史</td><td>之前来回说过的每一句</td></tr>
      <tr><td>检索来的材料</td><td>RAG 捞回来的文档片段</td></tr>
      <tr><td>它正在生成的回答</td><td>输出也占窗口</td></tr>
    </tbody>
  </table></div>
  <p>这些加起来一旦超过上限，系统就必须拒绝、裁剪或压缩；若应用采用“丢掉最早内容”的策略，开头信息会先消失，但具体行为取决于产品实现。</p>
  <figure class="dd-fig"><svg viewBox="0 0 650 205" role="img" aria-label="十六千 token 窗口的预算分配与超预算重排"><rect x="20" y="48" width="80" height="42" fill="#6b8cbe"/><rect x="100" y="48" width="210" height="42" fill="#d3a05a"/><rect x="310" y="48" width="180" height="42" fill="#4f9d78"/><rect x="490" y="48" width="120" height="42" fill="#cf6f6f"/><text x="60" y="74" text-anchor="middle" class="svg-tn" font-size="10">规则 1K</text><text x="205" y="74" text-anchor="middle" class="svg-tn" font-size="10">历史 7K</text><text x="400" y="74" text-anchor="middle" class="svg-tn" font-size="10">证据 6K</text><text x="550" y="74" text-anchor="middle" class="svg-tn" font-size="10">输出 4K</text><text x="325" y="35" text-anchor="middle" class="svg-t">原计划 18K ＞ 16K：至少 2K 无法同时存在</text><rect x="20" y="132" width="80" height="42" fill="#6b8cbe"/><rect x="100" y="132" width="90" height="42" fill="#d3a05a"/><rect x="190" y="132" width="120" height="42" fill="#4f9d78"/><rect x="310" y="132" width="120" height="42" fill="#cf6f6f"/><rect x="430" y="132" width="180" height="42" fill="none" stroke="#6b7484" stroke-dasharray="5 4"/><text x="60" y="158" text-anchor="middle" class="svg-tn" font-size="10">规则 1K</text><text x="145" y="158" text-anchor="middle" class="svg-tn" font-size="10">摘要 3K</text><text x="250" y="158" text-anchor="middle" class="svg-tn" font-size="10">证据 4K</text><text x="370" y="158" text-anchor="middle" class="svg-tn" font-size="10">输出 4K</text><text x="520" y="158" text-anchor="middle" class="svg-t" font-size="10">余量 4K</text><text x="325" y="196" text-anchor="middle" class="svg-t" font-size="10">压缩和检索不是为了塞满，而是给关键证据、工具往返和输出留下余量</text></svg><figcaption>图 1　上下文窗口是共享预算，不是“输入最多 16K、输出永远另算”。实际计数规则因服务而异，设计时应同时核算输入、输出预留和工具往返。</figcaption></figure>
  <div class="dd-note key"><b>数值例子</b>　在 16K 预算里，规则 1K + 历史 7K + 证据 6K + 计划输出 4K = 18K，超出 2K。若粗暴截掉最早 2K，可能正好丢掉用户姓名或约束；更稳的方案是把历史压成 3K、只检索 4K 高价值证据，总占用 12K，留下 4K 给工具结果波动或更长回答。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>关键澄清：它不是「记忆」<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">开头那个例子的真正原因，藏在一个常见误解里：模型是不是把对话「记住」了？</p>
  <div class="dd-note warn"><b>基础推理调用通常是无状态的。</b>　模型不会自动保留上一次请求；应用需要把相关历史、摘要或外部记忆重新放进本次输入。聊天产品可以在服务端保存会话，所以用户体验上像“记得”，但真正参与当前生成的仍是被装配进本次上下文的内容。某句话若既未保留、也未摘要或检索回来，模型本次就无从使用。</div>
  <div class="dd-note eng"><b>这解释了两件事</b>　① 为什么用 API 做多轮对话，每次都要<b>把历史一起发过去</b>——因为模型不会自己存；② 为什么长对话越聊越贵——历史越长，每次重发的 token 越多，而<b>计费按 token 算</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>为什么不能无限大<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">既然窗口越大越方便，为什么厂商不干脆做成无限？</p>
  <p>对<b>标准全局自注意力</b>，n 个位置会形成 n² 个注意力分数，朴素实现的相关算量和显存因此呈平方增长。实际推理还受 KV 缓存、带宽、位置外推和训练分布影响；滑窗、稀疏注意力与高效内核可以改变复杂度或常数。所以平方开销是重要约束，但不是唯一原因。</p>
  <div class="dd-note math"><b>一笔账</b>　1 千 token 的输入，注意力约算 100 万对；10 万 token 就是约 100 亿对。每把窗口拉长一档，都要付这种超线性的代价——这正是长上下文又慢又贵的根源。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>注意力计算、KV 容量和有效长度不是一回事<span class="dd-badge math">数学</span><span class="dd-badge eng">系统</span></h2>
  <p class="dd-lead">同样宣称支持 16K，为什么有的请求慢、有的并发一高就 OOM，还有的虽然跑完却答错？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>限制</th><th>它约束什么</th><th>典型观察</th><th>不能由什么替代</th></tr></thead>
    <tbody>
      <tr><td>注意力计算/IO</td><td>处理长前缀的时间和中间读写</td><td>输入越长，首 token 越慢</td><td>显存放得下不代表算得快</td></tr>
      <tr><td>KV cache</td><td>活跃 token 与并发请求容量</td><td>单请求能跑，并发后 OOM/驱逐</td><td>FlashAttention 不会消除长期 KV</td></tr>
      <tr><td>位置与训练分布</td><td>模型是否学会在该长度取用信息</td><td>短文本好，长文本准确率下降</td><td>API 接受 16K 不证明有效利用 16K</td></tr>
      <tr><td>应用装配</td><td>关键证据是否进入且摆在可用位置</td><td>换顺序或去噪后答案改变</td><td>换更长窗口不修复错误证据</td></tr>
    </tbody>
  </table></div>
  <div class="dd-formula" data-formula-id="context-window-kv-bytes"><math display="block" aria-label="KV 缓存字节数 B 下标 K V 约等于二乘层数 L、KV 头数 H 下标 K V、头维度 d 下标 h、已缓存 token 数 n 和每元素字节数 b"><mrow><msub><mi>B</mi><mrow><mi>K</mi><mi>V</mi></mrow></msub><mo>≈</mo><mn>2</mn><mi>L</mi><msub><mi>H</mi><mrow><mi>K</mi><mi>V</mi></mrow></msub><msub><mi>d</mi><mi>h</mi></msub><mi>n</mi><mi>b</mi></mrow></math></div>
  <p class="dd-formula-note"><code>B<sub>KV</sub></code> 是单个请求的 KV 缓存字节数；系数 2 表示每层同时保存 Key 和 Value。<code>L</code> 是层数，<code>H<sub>KV</sub></code> 是每层 KV 头数，<code>d<sub>h</sub></code> 是每个头的维度，<code>n</code> 是已经缓存的 token 数，<code>b</code> 是每个数值元素占用的字节数。这个近似式用于估算容量，不包含模型权重、临时工作区和内存碎片。</p>
  <p>例如 32 层、8 个 KV 头、头维度 128、FP16、16K token：<code>2×32×8×128×16000×2</code> ≈ 2.10×10⁹ 字节，约 1.95 GiB/请求，还没算模型权重、激活工作区和碎片。采用分组查询注意力、KV 量化或分页管理会改变数字，但“上下文长度同时消耗并发容量”这条关系仍在。</p>
  <div class="dd-note warn"><b>声明窗口 ≠ 有效窗口。</b>　接口能接收某个长度，只证明输入没有被立即拒绝；要按长度、证据位置、任务类型和语言画准确率曲线，并同时记录首 token 延迟、KV 占用和失败率。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>「塞得进」不等于「用得好」<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">就算模型支持很长的窗口，把所有资料一股脑塞进去，就万事大吉了吗？</p>
  <div class="dd-note warn"><b>并不是。</b>　长窗口有两个陷阱：其一，<b>中间迷失</b>——放在上下文<b>中段</b>的信息，利用率明显低于放在开头和结尾，模型容易「看漏」中间（见「中间迷失」节点）；其二，塞进大量<b>无关内容</b>会稀释注意力、混入噪声，反而让回答变差。</div>
  <div class="dd-note key"><b>一句话</b>　长上下文是一种<b>能力</b>，不是「无脑往里塞」的许可。<b>放什么、放多少、放在哪</b>，比「能放多少」更影响效果——关键材料尽量放在开头或结尾。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>怎么应对窗口限制<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">当要处理的内容超过窗口，或长对话开始失忆，有哪些办法？</p>
  <ul class="dd-steps">
    <li><b>只放相关的（RAG）</b>：不把整个知识库塞进去，而是<b>检索</b>出与当前问题最相关的少量片段再喂给模型（见「RAG」「检索」）。</li>
    <li><b>精心分配预算（上下文工程）</b>：决定每次调用窗口里到底放什么、按什么顺序——比雕琢单条提示更上层（见「上下文工程」）。</li>
    <li><b>压缩与摘要</b>：把过长的历史<b>压缩成摘要</b>再带上，腾出窗口（见「上下文压缩」）。</li>
    <li><b>外挂记忆</b>：让 Agent 把装不下的信息存到外部、需要时再取回（见「Agent 记忆」）。</li>
  </ul>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从一次调用的共享预算，推到无状态、计算代价、有效利用与外部记忆。</p>
  <ol class="dd-chain">
    <li>上下文窗口是单次能看见的 token 上限，装着提示+历史+检索+输出，窗口外看不见。<span>（§1）</span></li>
    <li>模型本身没记忆，「记得前面」是因为前面还在窗口里被重新喂入；被挤出就真忘了。<span>（§2）</span></li>
    <li>窗口不能无限大：标准全局注意力的平方开销、KV 缓存、硬件、位置表示与训练长度共同形成约束。<span>（§3）</span></li>
    <li>计算、KV 容量、有效利用和应用装配是四个不同瓶颈，声明长度不能互相替代它们。<span>（§4）</span></li>
    <li>就算窗口够长，塞满也不等于用好：有中间迷失、有噪声稀释。<span>（§5）</span></li>
    <li>应对：RAG 只放相关的、上下文工程分配预算、压缩摘要、外挂记忆。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「模型为什么其实没有记忆、却像记得对话」，并说出「窗口为什么不能无限大、以及塞满为什么不等于用好」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">这些误解把产品保存的会话、模型可见上下文、声明容量和有效利用混为一谈。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>模型能记住整段对话</td><td>它没有记忆；靠把历史重新塞进窗口才「记得」，挤出即忘</td></tr>
      <tr><td>窗口只装我的提问</td><td>还装系统提示、历史、检索材料、以及正在生成的输出</td></tr>
      <tr><td>窗口越大总是越好</td><td>越大越慢越贵，还有中间迷失；关键是放对内容</td></tr>
      <tr><td>把资料全塞进去最保险</td><td>噪声会稀释注意力、中段易被忽略，往往更差</td></tr>
      <tr><td>窗口不够只是厂商抠门</td><td>标准注意力平方开销很重要，但缓存、硬件、位置表示与训练长度也会约束可用窗口</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <p class="dd-lead">请为一个 16K 请求分配规则、历史、证据、工具结果和输出预算，并说明裁剪顺序。</p>
  <ol class="dd-quiz">
    <li>上下文窗口里到底装着哪些东西？</li>
    <li>模型「记得前面说过的话」的真实机制是什么？超出窗口会怎样？</li>
    <li>为什么窗口不能做成无限大？</li>
    <li>为什么 API 接受 16K 输入，不能证明模型能有效使用全部 16K？</li>
    <li>内容超出窗口或长对话失忆时，有哪些应对手段？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>系统提示/指令、对话历史、检索来的材料、以及模型正在生成的输出。</li>
      <li>模型没记忆，每次把窗口内全部内容重新读一遍；前面的话还在窗口里才「记得」，一旦被挤出窗口就真的没了。</li>
      <li>标准全局注意力会形成 n² 个位置对，且 KV 缓存、带宽、位置外推和训练长度也有限；高效或稀疏变体能缓解但不能免费扩展。</li>
      <li>声明容量只说明输入被接受；位置/训练分布、证据装配、中间迷失和噪声仍会降低实际任务准确率，需要按长度和位置实测。</li>
      <li>用 RAG 只放相关片段、用上下文工程分配预算、压缩摘要历史、给 Agent 外挂记忆。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>Token 与分词、注意力机制、大语言模型</td></tr>
      <tr><td><b>本页核心</b></td><td>token 预算、无记忆、平方级开销、中间迷失、塞满≠用好</td></tr>
      <tr><td>紧邻延伸</td><td>中间迷失、RAG、上下文工程、上下文压缩、Agent 记忆</td></tr>
      <tr><td>更远</td><td>推理优化、提示缓存、思维链</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Vaswani et al., Attention Is All You Need</a>：标准自注意力的序列长度复杂度。</li>
    <li><a href="https://arxiv.org/abs/2307.03172" target="_blank" rel="noopener">Liu et al., Lost in the Middle</a>：长上下文信息位置对任务表现的影响。</li>
    <li><a href="https://arxiv.org/abs/2205.14135" target="_blank" rel="noopener">Dao et al., FlashAttention</a>：精确注意力的内存访问瓶颈与优化边界。</li>
    <li><a href="https://arxiv.org/abs/2308.14508" target="_blank" rel="noopener">Bai et al., LongBench</a>：跨任务、跨语言的长上下文理解评测。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-22</div>
</div>
`
};

window.DEEPDIVE["context-window"].html = window.DEEPDIVE["context-window"].html
  .replace(
    '<p>这些加起来一旦超过上限',
    '<p>上下文窗口可以理解为一次调用中模型能直接看到的内容预算，用于解决一次调用里哪些信息能直接影响下一步生成的容量问题；它输入系统规则、历史、检索证据、工具结果和输出预留，先按分词器计数，再按产品策略接受、裁剪或压缩，输出一个不超过上限的布局。窗口大小只表示容量上限，不表示每个位置的信息都能被同样准确地使用。原始信息一旦滑出窗口，本次生成就不能再直接用到它。</p><p>这些加起来一旦超过上限'
  )
  .replace(
    '<div class="dd-note eng"><b>这解释了两件事</b>',
    '<p>无状态可以理解为模型每次调用都不自动保留上一次的内容，用于解决它为何看似记得对话却会突然失忆的问题；它输入本次显式提交的消息与取回内容，先把相关历史、摘要或检索结果重新装进输入，再据此生成，输出只以这些内容为条件的回答。回答能提到旧信息，说明该信息本轮仍在窗口里，但若既未保留也未检索回来，模型本次就不是真的记得。</p><div class="dd-note eng"><b>这解释了两件事</b>'
  )
  .replace(
    '<div class="dd-note math"><b>一笔账</b>',
    '<p>平方级开销可以理解为每个位置都要与所有位置两两算注意力带来的成本，用于解决窗口为什么不能无限放大的问题；它输入序列长度，先让每个位置与全部位置两两算分，再对这张分数表做归一化，输出的计算与显存随长度平方增长。长度扩大十倍位置对约扩大一百倍，说明代价是超线性的，但这解释的是标准全局注意力的主要瓶颈，不是所有实现的唯一约束。</p><div class="dd-note math"><b>一笔账</b>'
  )
  .replace(
    '<p class="dd-lead">同样宣称支持 16K，为什么有的请求慢、有的并发一高就 OOM，还有的虽然跑完却答错？</p>',
    '<p class="dd-lead">同样宣称支持 16K，为什么有的请求慢、有的并发一高就 OOM，还有的虽然跑完却答错？</p><p>这一节比较的是同一个声称长度背后的四种不同限制，用于解决为什么同样支持长度却有的慢、有的并发就崩、有的答错的问题；诊断输入是请求长度、并发、硬件、证据位置和任务结果，先分别核算计算与读写、缓存容量、训练长度和装配，再定位真正的瓶颈，输出对四类问题的分别判断。接口返回成功只表示输入被接收，不表示模型能有效利用整段长度，因此不能用一类指标替代另一类。</p>'
  )
  .replace(
    '<div class="dd-note key"><b>一句话</b>　长上下文是一种',
    '<p>有效上下文可以理解为模型在当前任务里真正能取用并用对的信息，用于解决把资料塞满窗口为什么不等于用好的问题；它输入候选材料及其顺序，先由注意力从大量内容中挑线索，再据此作答，输出带证据的答案。同一份材料放开头结尾还是中段会明显改变结果，说明位置和噪声都在起作用，但一次答对并不表示整段窗口都被可靠使用。</p><div class="dd-note key"><b>一句话</b>　长上下文是一种'
  )
  .replace(
    '<ul class="dd-steps">',
    '<p>窗口治理可以理解为在内容超预算时决定保留、检索、压缩和排序的一套方法，用于解决内容装不下或长对话失忆时该怎么办的问题；它输入超预算材料、任务目标和失败代价，先保护不可丢的规则与当前任务，再检索高价值证据、压缩可恢复历史并留出输出余量，输出一份可用的窗口布局。答案质量、证据覆盖和成本一起变好，才表示治理有效，但摘要可能漏细节、检索可能漏召回。</p><ul class="dd-steps">'
  );
