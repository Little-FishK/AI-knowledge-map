/* 理解原理页 —— 检索与语义搜索 Retrieval
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["retrieval"] = {
  title: "检索与语义搜索",
  subtitle: "从知识库里找出最相关的少量内容，喂给模型作答",
  aliases: "Retrieval · 语义搜索 · Semantic Search",
  meta: "建议 25–35 分钟 · 中级 · 需要：了解「嵌入」「上下文窗口」",
  thesis: "检索是从大量文档里，找出与当前问题<b>最相关的少量片段</b>的过程。它有两条路：关键词检索（对字面）和语义检索（对意思，靠嵌入找最近邻）。因为窗口装不下整个知识库，模型答得好不好，往往取决于<b>检索有没有捞对</b>——这也是 RAG 效果的真正瓶颈。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>为什么要检索</b>——为什么不把整个知识库直接给模型。</li>
    <li><b>两条路</b>——关键词检索和语义检索的区别，各自何时更好。</li>
    <li><b>怎么运作</b>——离线和在线两个阶段各做什么。</li>
    <li><b>为什么是瓶颈</b>——为什么说「检索捞不对，后面再强也白搭」。</li>
    <li><b>怎么捞得更准</b>——重排等改进手段。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　用户问「<b>怎么退货？</b>」，你的知识库里有上万篇文档，正确答案藏在一篇叫「<b>商品返还流程</b>」的文里。检索要做的，就是从这上万篇里，把这一篇（及少数几篇相关的）<b>准确捞出来</b>，再交给模型作答。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>为什么要「检索」<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：既然要基于知识库回答，为什么不干脆把整个知识库都塞给模型？</p>
  <p>因为塞不下、也不划算。模型的<b>上下文窗口</b>有限（见其深读页），几万篇文档根本装不进去；就算装得下，也又慢又贵，还会因为噪声太多而「中间迷失」。所以正确做法是：<b>先从海量文档里挑出最相关的一小撮</b>，只把这一小撮喂给模型。这个「挑」的过程，就是检索。</p>
  <div class="dd-note intuition"><b>一句话</b>　检索是<b>「大海捞针」的那一步</b>：把与问题相关的少量材料，从知识库里准确捞出来，供模型作答。捞得准不准，直接决定答得好不好。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>两条路：对字面 vs 对意思<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">「找相关文档」怎么找？有两种根本不同的思路。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>关键词检索</th><th>语义检索</th></tr></thead>
    <tbody>
      <tr><td>匹配什么</td><td>字面词是否重合</td><td>意思是否相近</td></tr>
      <tr><td>怎么做</td><td>倒排索引等（传统搜索）</td><td>把查询和文档都<b>嵌入</b>成向量，找最近邻</td></tr>
      <tr><td>「退货 / 返还流程」</td><td>没共同词，<b>漏掉</b></td><td>意思相近，<b>能召回</b></td></tr>
      <tr><td>强在</td><td>精确词、专有名词、编号</td><td>换了说法、同义、跨语言</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note math"><b>语义检索靠嵌入</b>　把每篇文档和查询都变成向量（意思近则向量近，见「嵌入」深读页），再算查询向量和各文档向量的<b>相似度</b>（余弦距离），取最近的几个。这就是「退货」能召回「商品返还流程」的原因——它们没有共同词，但向量靠得近。</div>
  <div class="dd-note eng"><b>实践常用「混合检索」</b>　关键词和语义各有盲区，把两者结果<b>融合</b>，往往比单用一种更稳——既不漏精确的编号词，也不错过换了说法的表达。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>它怎么运作：离线 + 在线<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">以语义检索为例，一次检索背后分两个阶段。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 200" role="img" aria-label="离线建库与在线检索两阶段">
      <text x="20" y="24" class="svg-t">离线（建库，一次性）</text>
      <rect x="20" y="34" width="80" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="60" y="52" text-anchor="middle" class="svg-t" font-size="11">文档</text>
      <line x1="100" y1="48" x2="128" y2="48" stroke="#6b7484" stroke-width="1.3" marker-end="url(#k1)"/>
      <rect x="128" y="34" width="80" height="28" rx="5" fill="#21252d" stroke="#2c313b"/><text x="168" y="52" text-anchor="middle" class="svg-t" font-size="11">切块</text>
      <line x1="208" y1="48" x2="236" y2="48" stroke="#6b7484" stroke-width="1.3" marker-end="url(#k1)"/>
      <rect x="236" y="34" width="80" height="28" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="276" y="52" text-anchor="middle" class="svg-t" font-size="11">嵌入</text>
      <line x1="316" y1="48" x2="344" y2="48" stroke="#6b7484" stroke-width="1.3" marker-end="url(#k1)"/>
      <rect x="344" y="34" width="110" height="28" rx="5" fill="#21252d" stroke="#4f9d78"/><text x="399" y="52" text-anchor="middle" class="svg-t" font-size="11">存进向量库</text>

      <text x="20" y="112" class="svg-t">在线（每次查询）</text>
      <rect x="20" y="122" width="90" height="28" rx="5" fill="#1a1d23" stroke="#6b8cbe"/><text x="65" y="140" text-anchor="middle" class="svg-t" font-size="11">查询：怎么退货</text>
      <line x1="110" y1="136" x2="138" y2="136" stroke="#6b7484" stroke-width="1.3" marker-end="url(#k1)"/>
      <rect x="138" y="122" width="70" height="28" rx="5" fill="#21252d" stroke="#6b8cbe"/><text x="173" y="140" text-anchor="middle" class="svg-t" font-size="11">嵌入</text>
      <line x1="208" y1="136" x2="236" y2="136" stroke="#6b7484" stroke-width="1.3" marker-end="url(#k1)"/>
      <rect x="236" y="122" width="110" height="28" rx="5" fill="#21252d" stroke="#4f9d78"/><text x="291" y="140" text-anchor="middle" class="svg-t" font-size="11">找最近邻</text>
      <line x1="346" y1="136" x2="374" y2="136" stroke="#6b7484" stroke-width="1.3" marker-end="url(#k1)"/>
      <rect x="374" y="122" width="150" height="28" rx="5" fill="#1a1d23" stroke="#d3a05a"/><text x="449" y="140" text-anchor="middle" class="svg-t" font-size="11">Top-K：商品返还流程…</text>
      <defs><marker id="k1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　离线：把文档切成小块、逐块嵌入、存进向量数据库（见「文档切分」「向量数据库」）。在线：把查询嵌入，到库里找最相似的前 K 个片段（近似最近邻）返回。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>为什么它是 RAG 的真正瓶颈<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">RAG 里，模型很强、生成很流畅，为什么大家反复强调「问题多半出在检索」？</p>
  <div class="dd-note key"><b>捞错了，后面全白搭</b>　RAG 的逻辑是「先检索、再让模型基于检索到的材料作答」。如果检索这一步<b>没捞到</b>正确文档，那模型手里根本没有正确材料——它要么答不上来，要么干脆<b>编</b>（幻觉）。<b>「garbage in, garbage out」</b>：喂进去的材料不对，再强的模型也救不回来。所以在很多 RAG 系统里，效果的天花板不在模型，而在检索。</div>
  <p>常见的检索失败：查询和文档用词差太远、切块把关键信息切散了、相关文档被更多不相关的挤出了 Top-K。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>怎么捞得更准<span class="dd-badge eng">工程</span></h2>
  <ul class="dd-steps">
    <li><b>重排</b>：先用快而糙的检索捞回一批候选（比如 50 条），再用一个更精细的模型<b>逐条精算相关性、重新排序</b>，取最好的几条。「先粗筛后精排」（见「重排」）。</li>
    <li><b>查询改写</b>：把用户口语化的问题改写、扩展成更利于检索的形式，或拆成多个子查询（属「高级 RAG」）。</li>
    <li><b>混合检索</b>：关键词 + 语义融合，互补盲区。</li>
    <li><b>调切块</b>：块太大混入噪声、太小切散语义，切法直接影响能不能命中。</li>
  </ul>
  <div class="dd-note intuition"><b>怎么知道捞得准不准</b>　要用<b>评测</b>：常看召回率（该捞的有没有捞到）等指标。没有评测，检索的好坏就只能靠感觉，优化无从下手（见「LLM 应用评测」）。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>窗口装不下整个知识库，所以要先检索出最相关的少量材料。<span>（§1）</span></li>
    <li>检索有两条路：对字面的关键词检索、对意思的语义检索（靠嵌入找最近邻），常混合使用。<span>（§2）</span></li>
    <li>流程分离线建库（切块→嵌入→存向量库）和在线查询（查询嵌入→找最近邻→Top-K）。<span>（§3）</span></li>
    <li>它是 RAG 的瓶颈：检索捞不对，模型没有正确材料，只能答错或编。<span>（§4）</span></li>
    <li>用重排、查询改写、混合检索、调切块来提升，并用评测衡量。<span>（§5）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「语义检索为什么能召回没有共同关键词的文档」，并说出「为什么检索是 RAG 效果的天花板」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>检索就是关键词搜索</td><td>还有语义检索（靠嵌入找意思相近），常两者混合</td></tr>
      <tr><td>RAG 效果差都是模型不行</td><td>多半是检索没捞对；材料不对，再强的模型也救不回</td></tr>
      <tr><td>语义检索总比关键词好</td><td>精确词/编号/专名上关键词更稳，故常混合</td></tr>
      <tr><td>Top-K 越大越保险</td><td>会混入更多噪声、稀释注意力；重排比堆量更有效</td></tr>
      <tr><td>建好库就一劳永逸</td><td>换嵌入模型要重建索引；切块和检索策略需持续调</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>为什么不把整个知识库直接塞给模型，而要先检索？</li>
    <li>关键词检索和语义检索的根本区别是什么？各自更擅长哪种情况？</li>
    <li>语义检索的离线和在线两阶段各做什么？</li>
    <li>为什么说检索是 RAG 的真正瓶颈？</li>
    <li>有哪些提升检索准确度的手段？「重排」是怎么工作的？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>因为上下文窗口装不下海量文档，且塞太多又慢又贵、易中间迷失；先挑出最相关的少量材料再喂给模型。</li>
      <li>关键词对字面词是否重合，语义对意思是否相近；前者擅长精确词/编号/专名，后者擅长换了说法/同义/跨语言，常混合。</li>
      <li>离线把文档切块、嵌入、存进向量库；在线把查询嵌入、到库里找最近邻、返回 Top-K 片段。</li>
      <li>因为若检索没捞到正确文档，模型就没有正确材料，只能答错或编；效果天花板在检索而非模型。</li>
      <li>重排（先粗筛一批候选、再精算相关性重新排序取最好几条）、查询改写、混合检索、调切块，并用评测衡量。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>嵌入、上下文窗口、Token 与分词</td></tr>
      <tr><td><b>本页核心</b></td><td>关键词 vs 语义检索、最近邻、离线/在线、检索即瓶颈、重排</td></tr>
      <tr><td>紧邻延伸</td><td>RAG、向量数据库、文档切分、重排、高级 RAG、评测</td></tr>
      <tr><td>更远</td><td>知识图谱与 GraphRAG、中间迷失、上下文工程</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2004.04906" target="_blank" rel="noopener">Karpukhin et al., Dense Passage Retrieval</a>：问题与段落双编码、内积检索。</li>
    <li><a href="https://arxiv.org/abs/1908.10084" target="_blank" rel="noopener">Reimers &amp; Gurevych, Sentence-BERT</a>：可用于语义相似搜索的句向量。</li>
    <li><a href="https://arxiv.org/abs/2004.12832" target="_blank" rel="noopener">Khattab &amp; Zaharia, ColBERT</a>：晚交互检索及精度—成本折中。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-21</div>
</div>
`
};
