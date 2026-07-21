/* 理解原理页 —— 图像生成 Image Generation
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["image-generation"] = {
  title: "图像生成",
  subtitle: "把一句话变成一张没人拍过的图",
  aliases: "Image Generation · 文生图 · Text-to-Image",
  meta: "建议 20–30 分钟 · 中级 · 需要：了解「扩散模型」「嵌入/多模态」",
  thesis: "图像生成是根据文本（或其它条件）<b>造出一张全新图像</b>的任务。它要同时办成两件事：<b>读懂文字</b>（并把文字和图像对齐），和<b>把图画出来</b>（当今主流引擎是扩散模型）。理解它的关键，是分清「任务」和「引擎」，并看清它现在还做不好什么。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——AI「画图」到底在干嘛，是拼贴现成图吗。</li>
    <li><b>两件核心事</b>——一句话变成一张图，中间要解决什么。</li>
    <li><b>引擎是什么</b>——具体靠什么把图画出来。</li>
    <li><b>怎么更可控</b>——只给一句话太粗，怎么精确控制。</li>
    <li><b>还做不好什么</b>——现在的图像生成有哪些老大难。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　输入「<b>一只戴帽子的柯基，油画风格，坐在海边</b>」，期待得到一张符合这句话、且此前不存在的图。全页看它怎么把这句话变成画，以及为什么「让图里准确写出一行字」反而比画柯基更难。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是图像生成<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：AI「画」一张没人拍过的图，它是从图库里拼出来的吗？</p>
  <p>不是。图像生成是<b>造出一张全新的图</b>——不是检索、也不是把现成素材拼贴，而是逐像素生成一张<b>此前不存在</b>的图像。输入通常是一句文本描述（「文生图」），也可以叠加别的条件（一张参考图、一个姿势、一块要重绘的区域）。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它要同时办成两件事<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">「一句话 → 一张图」，中间其实要跨过两道坎。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>要办的事</th><th>解决什么</th><th>靠什么</th></tr></thead>
    <tbody>
      <tr><td>① 读懂文字</td><td>把「戴帽子的柯基、油画、海边」理解成图像层面的意思</td><td>文本理解 + 图文对齐（见「嵌入」「CLIP」「多模态」）</td></tr>
      <tr><td>② 把图画出来</td><td>逐像素生成一张协调、逼真的新图</td><td>生成引擎（主流是扩散模型）</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>分清「任务」和「引擎」</b>　图像生成是<b>任务</b>；扩散模型是当前实现它最主流的<b>引擎</b>（早年还有 GAN，也有自回归等其它路线）。任务不变，引擎会换——这也是这个领域进步这么快的原因。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>引擎：当今主要是扩散<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">具体靠什么把图画出来？</p>
  <p>当今主流引擎是<b>扩散模型</b>：从一团随机噪声出发，<b>一步步去噪</b>，图像逐渐「显影」出来；而你的文字被作为<b>条件</b>注入每一步，让它朝「符合描述」的方向去噪（完整机制见「扩散模型」深读页）。除扩散外，也有自回归（像写文字一样一块块生成图）等路线，各有取舍。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>怎么让它更听话<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">只给一句话，控制太粗——想要精确的构图、姿势、局部修改，怎么办？</p>
  <ul class="dd-steps">
    <li><b>可控生成</b>：在文字之外再加<b>额外条件</b>——一张线稿、一个人体姿势、一张深度图，让生成严格贴着它来（如 ControlNet）；或只重绘图里<b>指定的一块</b>（局部重绘），其余保持不动（见「可控生成」）。</li>
    <li><b>图像编辑</b>：不是从零生成，而是<b>在已有图上按指令改</b>（换背景、去除某物、扩图），实用场景的主力（见「图像编辑」）。</li>
  </ul>
  <div class="dd-note intuition"><b>一句话</b>　纯文生图是「说什么画什么」，可控生成和编辑则给了你<b>更细的方向盘</b>——从「碰运气」走向「可精确调」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>它现在还做不好什么<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">图像生成很惊艳，但有几个稳定的软肋，知道它们能少踩坑。</p>
  <ul class="dd-steps">
    <li><b>图里写字</b>：让画面里出现一行<b>拼写正确</b>的文字（海报、logo）长期是老大难——模型擅长「画得像字」，不擅长「写对字」（有些工具如 Ideogram 专攻此项）。</li>
    <li><b>手指与复杂结构</b>：手、牙齿、对称物体容易出错（多根手指）。</li>
    <li><b>一致性</b>：让<b>同一个角色</b>在多张图里保持长相一致，很难。</li>
    <li><b>事实性</b>：它生成的是「<b>看起来对</b>」的图，不是「真的准确」的图——和大模型的<b>幻觉</b>同源。要求科学准确的示意图时尤其要核对（见「幻觉」）。</li>
  </ul>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>它带来的新问题<span class="dd-badge eng">安全</span></h2>
  <p class="dd-lead">能凭空造出逼真图像，也带来了纯技术之外的麻烦。</p>
  <ul class="dd-steps">
    <li><b>版权争议</b>：训练数据里包含大量受版权保护的作品，「学了别人的画风再生成」的边界仍在争论。</li>
    <li><b>深度伪造</b>：能生成以假乱真的人物图像，用于造谣、诈骗、侵权。</li>
    <li><b>检测与水印</b>：由此催生「判断一张图是不是 AI 生成」的技术，和生成能力在军备竞赛（见「AIGC 检测与水印」）。</li>
  </ul>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <ol class="dd-chain">
    <li>图像生成是造一张全新的图，不是检索拼贴。<span>（§1）</span></li>
    <li>它要同时办两件事：读懂文字（图文对齐）+ 把图画出来（生成引擎）。<span>（§2）</span></li>
    <li>当今引擎主要是扩散：去噪生成，文字作为条件注入。<span>（§3）</span></li>
    <li>可控生成和图像编辑给了更细的方向盘。<span>（§4）</span></li>
    <li>软肋：图里写字、手指、一致性、事实性（与幻觉同源）。<span>（§5）</span></li>
    <li>还带来版权、深伪、检测水印等技术之外的问题。<span>（§6）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能分清「图像生成是任务、扩散是引擎」，并说出「为什么‘图里准确写字’比画好一只柯基还难」，你就抓住了它的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>AI 画图是从图库拼贴</td><td>是逐像素生成一张全新、此前不存在的图</td></tr>
      <tr><td>图像生成 = 扩散模型</td><td>图像生成是任务，扩散是当今主流引擎（还有 GAN、自回归等）</td></tr>
      <tr><td>它生成的图是准确的</td><td>是「看起来对」，可能与事实不符，与幻觉同源</td></tr>
      <tr><td>写好提示就能让图里出现正确文字</td><td>「图中准确写字」仍是老大难，需专门能力/工具</td></tr>
      <tr><td>生成能力只是技术问题</td><td>还牵涉版权、深伪、检测水印等伦理与法律问题</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <ol class="dd-quiz">
    <li>AI 图像生成是检索拼贴现成图吗？它到底在做什么？</li>
    <li>「一句话变成一张图」要同时办成哪两件事？各靠什么？</li>
    <li>「图像生成」和「扩散模型」是什么关系？</li>
    <li>想精确控制构图/姿势或只改局部，有哪些手段？</li>
    <li>图像生成现在有哪些稳定的软肋？为什么说「事实性」问题和幻觉同源？</li>
    <li>它带来了哪些技术之外的问题？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>不是拼贴；是逐像素生成一张全新、此前不存在的图。</li>
      <li>读懂文字（文本理解+图文对齐）和把图画出来（生成引擎）；分别靠 CLIP 式对齐和扩散等引擎。</li>
      <li>图像生成是任务，扩散是当今实现它最主流的引擎，此外还有 GAN、自回归等路线。</li>
      <li>可控生成（加线稿/姿势/深度等额外条件、局部重绘）和图像编辑（在已有图上按指令改）。</li>
      <li>图里写字、手指与复杂结构、多图角色一致性、事实性；事实性是因为它生成「看起来对」而非「真的准」，与大模型幻觉同源。</li>
      <li>训练数据版权争议、深度伪造、以及由此催生的 AIGC 检测与水印。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>扩散模型、嵌入、CLIP、多模态</td></tr>
      <tr><td><b>本页核心</b></td><td>任务 vs 引擎、文本理解+对齐、软肋（写字/一致性/事实性）</td></tr>
      <tr><td>紧邻延伸</td><td>可控生成、图像编辑、超分辨率、生成对抗网络 GAN</td></tr>
      <tr><td>更远</td><td>视频生成、AIGC 检测与水印、幻觉、AI 治理</td></tr>
    </tbody>
  </table></div>
</section>
`
};
