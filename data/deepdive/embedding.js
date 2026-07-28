/* 理解原理页 —— 嵌入 Embedding
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["embedding"] = {
  title: "嵌入 Embedding",
  subtitle: "把文字变成向量，让「意思相近」变成「距离相近」",
  aliases: "Embedding · 向量表示 · 词向量",
  meta: "建议 25–35 分钟 · 基础 → 中级 · 需要：向量、距离/夹角的基本概念",
  thesis: "嵌入是由训练目标塑造的表示坐标：它把 token、句子、图像等对象映射为连续向量，使<b>对当前任务重要的相似性</b>能由距离或夹角近似。它不是天然完整的“语义真值”；训练配对、池化、相似度和负样本共同决定空间保留什么、忽略什么。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——把文本变成向量，为什么是「让意思近的靠得近」。</li>
    <li><b>凭什么</b>——向量的距离凭什么正好对应语义的远近，是巧合吗。</li>
    <li><b>能干嘛</b>——把语义变成可计算之后，解锁了哪些以前做不到的事。</li>
    <li><b>两个「嵌入」</b>——为什么它有时是模型的一层、有时又是一个独立模型。</li>
    <li><b>两个坑</b>——换模型要重建索引、对「否定」不敏感，各是怎么回事。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你在帮助中心搜「<b>怎么退货</b>」，而文档里写的是「<b>商品返还流程</b>」。两句话<b>没有一个共同的关键词</b>，传统关键词搜索会漏掉它。嵌入要做的，就是让这两句话的向量<b>靠得很近</b>，从而被找到。全页围绕它展开。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是嵌入<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：想让机器判断「两段话意思相近」，第一步要解决什么？</p>
  <p><b>嵌入是一种把文本映射成连续向量的表示方法。</b>它要解决的问题是：机器只会算数字，不能直接比较两段文字的意思。所以第一步是把文本变成数字——但不是随便变，而要变得让「意思近」体现成「数字近」。把一段文本输入嵌入模型，它先编码文本、再输出一个几百到几千维的向量；两个向量的距离越近，就表示这两段文本语义越相近。可以把它想成给每段话在一张「语义地图」上标了个坐标——但这张地图是某个模型自己的坐标系，换一个嵌入模型，同一段话的坐标就不再可比。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 230" role="img" aria-label="语义空间里，意思相近的内容聚在一起">
      <rect x="20" y="20" width="520" height="195" rx="8" fill="none" stroke="#2c313b"/>
      <g font-size="12">
        <circle cx="110" cy="70" r="5" fill="#6b8cbe"/><text x="120" y="74" class="svg-t">猫</text>
        <circle cx="140" cy="95" r="5" fill="#6b8cbe"/><text x="150" y="99" class="svg-t">狗</text>
        <circle cx="105" cy="120" r="5" fill="#6b8cbe"/><text x="115" y="124" class="svg-t">宠物</text>
        <text x="120" y="52" class="svg-t" fill="#6b8cbe">动物一簇</text>

        <circle cx="410" cy="65" r="5" fill="#d3a05a"/><text x="420" y="69" class="svg-t">汽车</text>
        <circle cx="440" cy="90" r="5" fill="#d3a05a"/><text x="450" y="94" class="svg-t">火车</text>
        <text x="410" y="47" class="svg-t" fill="#d3a05a">交通工具一簇</text>

        <circle cx="240" cy="165" r="5" fill="#4f9d78"/><text x="252" y="169" class="svg-t">怎么退货</text>
        <circle cx="300" cy="180" r="5" fill="#4f9d78"/><text x="312" y="184" class="svg-t">商品返还流程</text>
        <text x="240" y="205" class="svg-t" fill="#4f9d78">没有共同词，但意思近 → 挨在一起</text>
      </g>
    </svg>
    <figcaption>图 1　把内容放进一张「语义地图」：意思相近的自动聚成一簇。注意「怎么退货」和「商品返还流程」——它们没有共同关键词，却因为意思相近而挨在一起。这正是嵌入的全部价值所在。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>凭什么「距离能等于语义」<span class="dd-badge math">数学</span><span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的疑问：向量的远近，凭什么正好对应意思的远近？这不会是碰巧吧？</p>
  <p>向量的远近为什么等于语义，不是碰巧，可以理解为训练目标逼出来的几何性质；它用于回答的正是凭什么向量远近能对应意思远近。训练时输入大量意思相近或无关的样本对，先据这些配对调整参数、再让相近的向量靠拢、无关的向量推开，最终输出一个语义被编码进几何的向量空间。相近样本被不断拉近，就表示模型学到了它们的关联。</p>
  <div class="dd-note intuition"><b>更早的词向量，靠一个更朴素的假设</b>　「<b>上下文相似的词，意思也相似</b>」。「猫」和「狗」周围出现的词（喂、养、可爱、宠物店）高度重合，于是让它们的向量自然靠近。无论哪种训练方式，「距离 = 语义」都不是设计出来的规则，而是<b>训练的副产品</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>它把「语义」变成了可计算的东西<span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">有了这张语义地图，我们具体能算什么？</p>
  <p>余弦相似度是一个用两个向量夹角的余弦值比较方向的指标。它用于解决怎样判断两段话是不是在讲同一件事：不再需要它们共享字面词汇，只要看两个向量的夹角——夹角越小、越同向，就越相近。于是输入两个嵌入向量，先算点积、再除以两者长度，就输出一个相似度分数——语义第一次变成了能用一个数直接比较的量。</p>
  <div class="dd-formula">相似度 = cos(θ) = (A·B) / (‖A‖ ‖B‖)</div>
  <p class="dd-formula-note"><b>符号逐个解释：</b><code>A</code> 和 <code>B</code> 是要比较的两个嵌入向量；<code>θ</code> 是它们之间的夹角；<code>A·B</code> 是点积；<code>‖A‖</code> 与 <code>‖B‖</code> 是各自的长度。分母先消除长度影响，因此余弦只比较方向。结果范围是 −1 到 1：越接近 1 越同向，接近 0 表示近乎垂直，接近 −1 表示方向相反。它只表示<b>同一嵌入模型空间</b>里的相似程度，不能跨模型比较，也不能脱离真实任务直接解释为“正确概率”。</p>
  <div class="dd-note math"><b>一个经典演示：向量还能做算术</b>　<code>国王 − 男人 + 女人 ≈ 女王</code>。这说明向量空间里的<b>方向本身</b>就承载了语义关系（这里「从男到女」是一个稳定的方向）。语义被编码进了几何。</div>
  <div class="dd-note key"><b>这就是一大片技术的地基</b>　「把语义变成可算的向量」直接撑起了：<b>检索与语义搜索、向量数据库、RAG、聚类</b>——它们本质都在做「找向量最近的邻居」或「把相近的向量归堆」。理解嵌入，就理解了这些的共同底层。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>手算一个余弦相似度<span class="dd-badge math">数值例子</span></h2>
  <p class="dd-lead">“更同向”怎样变成一个可复算的排名？</p>
  <p>这次手算描述余弦相似度怎样把方向差异变成可排序的分数，为的是解决更同向怎样落成可复算排名。用二维玩具向量代替真实的数百维向量。查询 <code>q=[1,0]</code>，候选“返还商品”是 <code>a=[0.8,0.6]</code>，候选“列车时刻”是 <code>b=[−0.6,0.8]</code>；三者长度都为 1：</p>
  <table class="dd-table"><thead><tr><th>候选</th><th>点积</th><th>余弦与结论</th></tr></thead><tbody><tr><td>a</td><td><code>0.8</code></td><td><code>0.8</code>，更相关</td></tr><tr><td>b</td><td><code>−0.6</code></td><td><code>−0.6</code>，更不相关</td></tr></tbody></table><p>展开计算分别是 <code>1×0.8 + 0×0.6 = 0.8</code> 与 <code>1×(−0.6) + 0×0.8 = −0.6</code>；因为三个向量都是单位长度，分母均为 1。整个过程输入查询与候选向量，先做点积、再按长度归一，就输出每个候选的相似度。</p>
  <figure class="dd-fig"><svg viewBox="0 0 650 270" role="img" aria-label="查询向量与两个候选向量的夹角比较"><defs><marker id="emb-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker></defs><line x1="120" y1="215" x2="560" y2="215" stroke="currentColor" opacity=".3"/><line x1="300" y1="245" x2="300" y2="25" stroke="currentColor" opacity=".3"/><g stroke-width="5" fill="none" marker-end="url(#emb-a)"><path d="M300 215L510 215" stroke="#8b5cf6"/><path d="M300 215L468 89" stroke="#10b981"/><path d="M300 215L174 47" stroke="#ef4444"/></g><path d="M380 215A80 80 0 0 0 364 167" fill="none" stroke="#10b981" stroke-width="3"/><g class="svg-t"><text x="520" y="218">q=[1,0]</text><text x="475" y="82">a，cos=0.8</text><text x="80" y="42">b，cos=−0.6</text><text x="382" y="174">夹角小</text></g></svg><figcaption>余弦只比较方向，不比较长度。真实检索常先把向量归一化，使点积直接等于余弦相似度。</figcaption></figure>
  <div class="dd-note warn"><b>数值高只表示模型空间里的相似，不等于业务上正确。</b>阈值必须在真实查询、难负例与标签上校准；不同模型的 0.8 没有统一含义，<b>不能跨模型直接照搬</b>。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>两个容易混的「嵌入」<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">你可能已经注意到：有时说嵌入是「模型里的一层」，有时又说它是「一个独立模型」。这是两回事，别混。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>Transformer 内部的输入嵌入层</th><th>RAG 里说的「嵌入模型」</th></tr></thead>
    <tbody>
      <tr><td>是什么</td><td>模型架构的一部分</td><td>一个独立训练的模型</td></tr>
      <tr><td>输出谁的向量</td><td>每个 <b>token</b> 的向量</td><td>整<b>段文本</b>的一个向量</td></tr>
      <tr><td>目标</td><td>给 Transformer 喂输入（见其深读页）</td><td>让整段话的语义可比较、可检索</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note warn"><b>为什么要分清</b>　这里比较的是两个同名却不同的嵌入，为了解决该用哪一个嵌入的选型问题。两者名字都叫「嵌入」，但一个是把 token 送进模型的第一层，一个是产出「整段文本表示」的专用模型：嵌入层先逐词给向量、再交给后续网络，嵌入模型则直接把整段话汇总成一个向量。它们输入同样是文本，输出却分别是每个词的向量或整段文本的一个向量。用途不同表示不能互相替代，但两者都叫嵌入，混用就会让选型和实现出错。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>最典型的用武之地：语义搜索<span class="dd-badge intuition">直觉</span><span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">回到开头那个例子——嵌入到底让什么「关键词搜索做不到的事」成为可能？</p>
  <p>关键词搜索靠<b>字面匹配</b>：查询词必须和文档里的词对上，所以查「怎么退货」命中不了只写「商品返还流程」的文档。语义搜索正是为了解决关键词搜索漏掉这类没有共同词的相关文档——它指的是按意思而非字面找最近邻的检索方式：输入查询和文档库，先把两者都嵌入成向量、再输出离查询最近的那些文档，匹配的是意思不是字。于是「退货」和「返还流程」尽管没有共同词，也能被召回；某文档被召回，就表示它与查询意思相近，但召回质量依赖嵌入好坏，平均召回好也不保证每条都对。</p>
  <div class="dd-note key"><b>它是 RAG 的心脏</b>　检索增强生成（RAG）回答问题前，就是用嵌入做语义搜索、从知识库里捞出相关材料，再交给大模型作答。<b>嵌入的质量，直接决定了检索能不能捞对</b>——而检索捞得对不对，往往是 RAG 效果的真正瓶颈（见「检索」「向量数据库」「RAG」节点）。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>实践里的两个坑<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">用嵌入最容易在哪翻车？下面两个坑描述换模型和否定两种失败，认识它们是为了避免嵌入在工程落地时最常见的两类翻车。</p>
  <ul class="dd-steps">
    <li><b>换嵌入模型，必须重建整个索引</b>。同一批文本输入不同模型，输出的向量先落到不同空间、再被拿来混用，就会得到一堆噪声——A 模型的「猫」和 B 模型的「猫」坐标毫无可比性。换模型 = 全部重新嵌入。</li>
    <li><b>对「否定」不敏感</b>。「适合儿童」和「<b>不</b>适合儿童」，字面几乎一样，向量也可能<b>非常接近</b>，但这只表示表面相似、意思其实正相反。这类「一个字翻转全意」的场景，光靠向量相似度容易出错，要用别的手段兜底（如加规则、重排、结构化过滤）。</li>
  </ul>
  <div class="dd-note intuition"><b>顺带解两个新词：高维与降维。</b>　“高维”只表示一个向量有很多坐标，例如 768 维就是 768 个数共同描述一段文本；维数增加后，样本间距离可能越来越接近、难以区分，这类现象常被概括为“维度灾难”。训练后的嵌入通常不是随机散点，而会形成与训练任务有关的结构，所以高维距离仍可能有用；但这不是保证，必须用真实检索样本验证。为了让人观察，常用“降维”把数百维临时映射成二维或三维图。降维图只是一种有损投影：它适合发现可疑簇和离群点，不能证明原空间的检索质量，也不能取代 Recall@k 等任务指标。</div>
  <div class="dd-note key"><b>如何验证检索质量：</b>先建立带相关等级的查询—文档小金集，报告 Recall@k、nDCG 或 MRR，再按否定表达、数字、专有名词、语言和文本长度切片。若平均召回很好但“不适合儿童”仍命中“适合儿童”，应诊断为困难负例与排序边界问题，加入结构化过滤或重排；不要只看二维降维图是否“聚成一团”。换模型时还要在同一金集上复测并重建索引。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从对象到向量、再到检索结果，中间哪些选择共同定义“相似”？</p>
  <ol class="dd-chain">
    <li>机器要比「意思」，先得把文本变成数字，且让「意思近」体现成「数字近」——这就是嵌入。<span>（§1）</span></li>
    <li>「距离 = 语义」不是设计的，是训练让相近靠拢、无关推开逼出来的。<span>（§2）</span></li>
    <li>于是判断两段话是否同义，只需算向量夹角；语义第一次变成可计算的量。<span>（§3）</span></li>
    <li>余弦相似度把向量方向关系变成可排序的数，但阈值只能由真实任务校准。<span>（§4）</span></li>
    <li>注意区分两个「嵌入」：Transformer 的输入嵌入层（每个 token）vs 独立的嵌入模型（整段文本）。<span>（§5）</span></li>
    <li>它最典型的用途是语义搜索：按意思而非字面找最近邻，这是 RAG 的心脏。<span>（§6）</span></li>
    <li>两个必知的坑：换模型要重建索引、对否定不敏感。<span>（§7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「向量的距离为什么能等于语义」，并说出「语义搜索凭什么能召回没有共同关键词的文档」，你就抓住了嵌入的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">哪些说法把任务相关的表示空间误当成了天然语义真理？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>嵌入就是把词编个号</td><td>是变成<b>连续向量</b>，且让语义相近的向量靠近；编号没有「远近」可言</td></tr>
      <tr><td>距离等于语义是设计出来的规则</td><td>是训练目标（让相近靠拢）逼出来的副产品</td></tr>
      <tr><td>不同模型的向量可以混用</td><td>不能；不在同一空间，换模型必须重建索引</td></tr>
      <tr><td>语义相似度什么都能判</td><td>对「否定」等一字翻转的情形不敏感，需别的手段兜底</td></tr>
      <tr><td>「嵌入层」和「嵌入模型」是一回事</td><td>一个输出 token 向量、是架构一层；一个输出整段文本向量、是独立模型</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>嵌入把文本变成什么？关键性质是什么？</li>
    <li>向量的距离凭什么能对应语义的远近？（用「训练目标」解释）</li>
    <li>有了嵌入，判断两段话是否同义为什么不再需要共享关键词？具体算什么？</li>
    <li>「Transformer 的输入嵌入层」和「RAG 的嵌入模型」有何区别？</li>
    <li>语义搜索为什么能召回「怎么退货 / 商品返还流程」这种没有共同词的配对？</li>
    <li>为什么换一个嵌入模型就必须重建整个索引？</li>
    <li>为什么嵌入对「适合儿童 / 不适合儿童」这种否定容易判错？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>变成一个高维连续向量；关键性质是语义相近的文本，向量距离也近。</li>
      <li>训练时用「相近/无关」的样本对，调参数让相近的向量靠拢、无关的推开，反复后向量几何就编码了语义。</li>
      <li>因为语义已被编码进向量，只要算两个向量的夹角（余弦相似度）即可，不必有共同字面词。</li>
      <li>前者是架构一层、输出每个 token 的向量；后者是独立模型、输出整段文本的一个向量，用于检索。</li>
      <li>因为它匹配的是意思而非字面：两句话意思相近，向量就靠近，于是查询能找到它。</li>
      <li>因为不同模型的向量不在同一空间，坐标不可比；旧库的向量和新模型的查询向量混用会得到无意义的结果。</li>
      <li>因为字面几乎一样，向量也很接近，但意思相反；纯相似度分不出这一字之差的语义翻转。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>向量、点积与夹角、Token 与分词、神经网络</td></tr>
      <tr><td><b>本页核心</b></td><td>语义坐标、余弦相似度、嵌入层 vs 嵌入模型、语义搜索</td></tr>
      <tr><td>紧邻延伸</td><td>检索与语义搜索、向量数据库、RAG、聚类、维度灾难、降维</td></tr>
      <tr><td>更远</td><td>多模态（跨模态共享嵌入空间）、CLIP、知识图谱</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/1301.3781" target="_blank" rel="noopener">Mikolov et al., Efficient Estimation of Word Representations in Vector Space</a>：分布式词向量及其训练目标。</li>
    <li><a href="https://arxiv.org/abs/1908.10084" target="_blank" rel="noopener">Reimers &amp; Gurevych, Sentence-BERT</a>：句向量、余弦相似度与语义检索。</li>
    <li><a href="https://arxiv.org/abs/2103.00020" target="_blank" rel="noopener">Radford et al., Learning Transferable Visual Models From Natural Language Supervision</a>：跨模态图文嵌入与对比学习。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-21</div>
</div>
`
};
