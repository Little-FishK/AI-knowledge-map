/* 理解原理页 —— 扩散模型 Diffusion
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["diffusion"] = {
  title: "扩散模型",
  subtitle: "学习「从一团噪声一步步去噪」，把图像「显影」出来",
  aliases: "Diffusion Model · 扩散模型 · 去噪扩散",
  meta: "建议 25–35 分钟 · 中级 · 需要：了解「神经网络」「自监督学习」",
  thesis: "扩散模型是当今图像生成的主流方法。它的核心巧思是把「凭空生成一张图」这个难题，拆成<b>一连串简单的去噪小步</b>：训练时学会「把加了噪声的图还原一点」，生成时就从<b>纯噪声出发、反复去噪</b>，像照片显影一样，一张图逐渐浮现。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>难在哪</b>——凭空造一张逼真的新图，难点是什么。</li>
    <li><b>核心思路</b>——「加噪」和「去噪」两个过程各是什么。</li>
    <li><b>为什么拆步</b>——为什么不一步从噪声到图，非要走很多步。</li>
    <li><b>文本怎么控制</b>——一句话怎么指挥它画出对应的图。</li>
    <li><b>vs GAN</b>——以前的图像生成方法差在哪。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你输入「<b>一只戴帽子的柯基</b>」。扩散模型不会「一笔画出」它，而是<b>从一团完全随机的雪花噪声出发，一步步把噪声擦掉</b>，柯基的轮廓、毛色、帽子逐渐清晰——像老照片在显影液里慢慢浮现。全页解释这背后的机制。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>它要解决的难题<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：让 AI 凭空造一张<b>没人拍过、却合理逼真</b>的图，难在哪？</p>
  <p>难在「一步到位」几乎不可能。一张图有几百万个像素，它们要<b>互相协调</b>才合理（柯基的两只眼睛要对称、帽子要戴在头上、光影要一致）。让模型<b>一次</b>就吐出这么多协调好的像素，太难了。扩散模型的聪明之处，是<b>不这么干</b>。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>核心思路：加噪与去噪<span class="dd-badge intuition">直觉</span><span class="dd-badge math">数学</span></h2>
  <p class="dd-lead">扩散模型怎么把「凭空生成」这个难题，变成一件可学的事？靠一正一反两个过程。</p>
  <ul class="dd-steps">
    <li><b>正向（加噪）</b>：拿一张清晰的真图，<b>一步步往上撒噪声</b>，撒很多步，直到它变成一团纯噪声。这个过程很简单、且<b>自动生成了训练样本</b>——每一步的「加噪前 / 加噪后」都是一对现成的题目和答案（这是自监督，见「自监督学习」）。</li>
    <li><b>反向（去噪）</b>：训练一个神经网络，学会把这个过程<b>倒过来</b>——给它一张「有噪声的图」，让它预测「该去掉哪些噪声、还原成更清晰一点的图」。</li>
  </ul>
  <p>学会去噪之后，<b>生成</b>就水到渠成：从一团<b>随机噪声</b>出发（这团噪声里其实什么都没有），让模型<b>反复去噪</b>，一步步「显影」出一张全新的图。</p>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 120" role="img" aria-label="从纯噪声一步步去噪，图像逐渐显现">
      <g>
        <rect x="20" y="35" width="70" height="55" rx="6" fill="#3a4150"/><text x="55" y="108" text-anchor="middle" class="svg-t" font-size="10">纯噪声</text>
        <rect x="130" y="35" width="70" height="55" rx="6" fill="#4a5160"/><text x="165" y="108" text-anchor="middle" class="svg-t" font-size="10">去一点</text>
        <rect x="240" y="35" width="70" height="55" rx="6" fill="#5a6472"/><text x="275" y="108" text-anchor="middle" class="svg-t" font-size="10">更清晰</text>
        <rect x="350" y="35" width="70" height="55" rx="6" fill="#7d8a70"/><text x="385" y="108" text-anchor="middle" class="svg-t" font-size="10">快好了</text>
        <rect x="460" y="35" width="70" height="55" rx="6" fill="#c08a4a"/><text x="495" y="55" text-anchor="middle" class="svg-tn" font-size="11">柯基</text><text x="495" y="108" text-anchor="middle" class="svg-t" font-size="10">成图</text>
      </g>
      <g stroke="#6b7484" stroke-width="1.4">
        <line x1="90" y1="62" x2="126" y2="62" marker-end="url(#o1)"/><line x1="200" y1="62" x2="236" y2="62" marker-end="url(#o1)"/><line x1="310" y1="62" x2="346" y2="62" marker-end="url(#o1)"/><line x1="420" y1="62" x2="456" y2="62" marker-end="url(#o1)"/>
      </g>
      <defs><marker id="o1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs>
    </svg>
    <figcaption>图 1　生成过程：从纯噪声出发，模型每一步只去掉一点点噪声，几十步之后，一张符合描述的图就「显影」了出来。训练时它学的，正是「怎么把噪声去掉一点」。</figcaption>
  </figure>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>为什么要拆成很多步<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">既然目标是从噪声得到图，为什么不训练一个模型「一步」搞定，非要走几十步？</p>
  <p>因为「一步从纯噪声到完美图」和第 1 节说的「一步到位」一样难。而<b>拆成很多小步</b>后，每一步的任务都<b>简单得多</b>：只需从「噪声多一点的图」还原成「噪声少一点的图」——这是个模型学得会的小活。很多个简单小步<b>累积</b>起来，就完成了原本不可能的大跳跃。</p>
  <div class="dd-note intuition"><b>和思维链是同一种智慧</b>　这和「思维链」把难题拆成一步步推理，是同一个道理：<b>把一个做不到的大跳跃，换成一连串做得到的小步</b>。扩散在像素上这么做，思维链在推理上这么做。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>文本怎么指挥它<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">上面的去噪能生成「某张图」，但怎么让它生成「戴帽子的柯基」这张我要的图？</p>
  <p>办法是把<b>文本作为条件</b>，注入到每一步去噪里——让模型不只是「去噪」，而是「朝着<b>符合这句描述</b>的方向去噪」。这依赖<b>文本和图像的对齐</b>：模型得知道「戴帽子的柯基」这句话，对应到图像空间里大概长什么样。这份对齐正是 <b>CLIP</b> 那类图文对比学习提供的（见「CLIP」「多模态」「嵌入」）。</p>
  <div class="dd-note intuition"><b>一句话</b>　去噪决定「怎么画出一张合理的图」，文本条件决定「画成<b>哪一张</b>」。两者合起来，就是「文生图」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>和 GAN 的对比<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">扩散之前，图像生成的主力是 GAN。它们差在哪，扩散为什么后来居上？</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th></th><th>GAN</th><th>扩散模型</th></tr></thead>
    <tbody>
      <tr><td>怎么生成</td><td>生成器与判别器<b>对抗</b>，一步生成</td><td>从噪声<b>多步去噪</b></td></tr>
      <tr><td>速度</td><td>生成快</td><td>要走多步，较慢</td></tr>
      <tr><td>稳定性/多样性</td><td>训练不稳、易「模式坍缩」（只会生成少数几种）</td><td>更稳、更多样、更可控</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>为什么扩散赢了</b>　它把生成拆成许多可学的小步，训练更稳、样本更多样、也更容易被文本等条件控制。代价是生成慢（要走多步），但通过「潜在扩散」（在压缩后的小空间里去噪，见「VAE」）等手段大幅提了速。见「生成对抗网络 GAN」节点。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>凭空一步造出协调逼真的图太难。<span>（§1）</span></li>
    <li>扩散把它拆开：正向加噪造训练样本，反向学去噪。<span>（§2）</span></li>
    <li>生成时从纯噪声反复去噪显影；拆成小步是因为每小步都简单可学。<span>（§2、§3）</span></li>
    <li>把文本作为条件注入去噪，靠图文对齐让它朝符合描述的方向生成。<span>（§4）</span></li>
    <li>相比 GAN，扩散更稳、更多样、更可控，成了主流（代价是慢）。<span>（§5）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能讲清「扩散为什么要把生成拆成加噪-去噪的很多小步」，并说出「文本是怎么指挥去噪方向的」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>它从素材库里拼贴现成图</td><td>是从随机噪声去噪生成全新的图，不是检索拼贴</td></tr>
      <tr><td>一步就能从噪声生成图</td><td>要走很多步，每步只去掉一点噪声</td></tr>
      <tr><td>加噪那一步没用</td><td>加噪自动造出「加噪前/后」的训练样本对，是自监督的关键</td></tr>
      <tr><td>文本靠魔法就懂了</td><td>靠图文对齐（CLIP 式），把文字条件注入每步去噪</td></tr>
      <tr><td>扩散一定比 GAN 好</td><td>更稳更多样更可控，但更慢；各有取舍</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>凭空生成一张逼真图，难点在哪？</li>
    <li>扩散的「正向加噪」和「反向去噪」各做什么？加噪那步有什么用？</li>
    <li>生成时模型从什么出发、怎么得到一张图？</li>
    <li>为什么要拆成很多步，而不是一步到位？</li>
    <li>文本是怎么指挥扩散生成对应图像的？靠什么？</li>
    <li>扩散相比 GAN 的优劣是什么？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>一张图有海量像素要互相协调才合理，让模型一次吐出这么多协调好的像素太难。</li>
      <li>正向：给真图逐步加噪直到纯噪声，自动生成「加噪前/后」的训练样本对（自监督）；反向：训练模型把加了噪的图还原清晰一点。加噪那步造出了训练数据。</li>
      <li>从一团随机噪声出发，反复去噪，图像逐步「显影」出来。</li>
      <li>因为一步从纯噪声到完美图太难；拆成小步后每步只需去掉一点噪声、简单可学，累积起来完成大跳跃。</li>
      <li>把文本作为条件注入每步去噪，让它朝符合描述的方向去噪；依赖 CLIP 式的图文对齐。</li>
      <li>扩散更稳、更多样、更可控，但生成较慢；GAN 一步生成快但易不稳/模式坍缩。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>神经网络、自监督学习、嵌入</td></tr>
      <tr><td><b>本页核心</b></td><td>加噪-去噪、多步生成、文本条件注入、vs GAN</td></tr>
      <tr><td>紧邻延伸</td><td>图像生成、CLIP、多模态、生成对抗网络 GAN、VAE</td></tr>
      <tr><td>更远</td><td>可控生成、视频生成、图像编辑、超分辨率</td></tr>
    </tbody>
  </table></div>
</section>
`
};
