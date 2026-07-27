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
  <p>不是简单从图库检索或拼贴。生成模型从学到的数据分布中采样新的图像表示；具体系统可能在<b>像素空间、压缩潜空间或离散视觉 token</b>中生成，再解码成图像。输出通常是训练集中未直接存在的新样本，但仍可能复现训练样本片段，因此不能把“全新”理解为绝对无记忆。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>它要同时办成两件事<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">「一句话 → 一张图」，中间其实要跨过两道坎。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>要办的事</th><th>解决什么</th><th>靠什么</th></tr></thead>
    <tbody>
      <tr><td>① 读懂文字</td><td>把「戴帽子的柯基、油画、海边」理解成图像层面的意思</td><td>文本理解 + 图文对齐（见「嵌入」「CLIP」「多模态」）</td></tr>
      <tr><td>② 把图画出来</td><td>在像素、潜变量或视觉 token 空间生成，再解码为协调的新图</td><td>扩散、自回归等生成引擎</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note intuition"><b>分清「任务」和「引擎」</b>　图像生成是<b>任务</b>；扩散模型是当前实现它最主流的<b>引擎</b>（早年还有 GAN，也有自回归等其它路线）。任务不变，引擎会换——这也是这个领域进步这么快的原因。</div>
  <figure class="dd-fig"><svg viewBox="0 0 650 185" role="img" aria-label="文本条件经过编码器进入生成引擎并解码为图像"><defs><marker id="ig1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs><rect x="18" y="60" width="132" height="60" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="84" y="84" text-anchor="middle" class="svg-t">文本条件</text><text x="84" y="104" text-anchor="middle" class="svg-t" font-size="10">柯基 · 帽子 · 海边</text><path d="M150,90 L198,90" stroke="#6b7484" marker-end="url(#ig1)"/><rect x="200" y="60" width="110" height="60" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="255" y="84" text-anchor="middle" class="svg-t">文本编码器</text><text x="255" y="104" text-anchor="middle" class="svg-t" font-size="10">条件表示 c</text><path d="M310,90 L358,90" stroke="#6b7484" marker-end="url(#ig1)"/><rect x="360" y="48" width="126" height="84" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="423" y="76" text-anchor="middle" class="svg-t">生成引擎</text><text x="423" y="96" text-anchor="middle" class="svg-t" font-size="10">噪声/视觉 token</text><text x="423" y="114" text-anchor="middle" class="svg-t" font-size="10">逐步受 c 条件化</text><path d="M486,90 L534,90" stroke="#6b7484" marker-end="url(#ig1)"/><rect x="536" y="60" width="96" height="60" rx="8" fill="#21252d" stroke="#cf6f6f"/><text x="584" y="84" text-anchor="middle" class="svg-t">解码成图</text><text x="584" y="104" text-anchor="middle" class="svg-t" font-size="10">再做验收</text><text x="325" y="160" text-anchor="middle" class="svg-t" font-size="10">语义对齐决定“画什么”，生成引擎决定“怎样形成图像表示”</text></svg><figcaption>图 1　文生图不是一句文字直接变像素。文本先成为条件表示，生成引擎在像素、潜空间或视觉 token 中采样，再解码并接受独立验收。</figcaption></figure>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>运行示例：固定 4 个验收项</th><th>样本 1</th><th>样本 2</th></tr></thead><tbody><tr><td>柯基主体</td><td>✓</td><td>✓</td></tr><tr><td>帽子戴在头上</td><td>✗（漂浮）</td><td>✓</td></tr><tr><td>海边场景</td><td>✓</td><td>✓</td></tr><tr><td>油画风格</td><td>✓</td><td>△（偏照片）</td></tr></tbody></table></div>
  <div class="dd-note warn"><b>“整体相似”会掩盖属性绑定错误</b>　两张图都可能获得很高的图文相似度，但只有样本 2 满足帽子与柯基的空间关系。评测要拆成对象、数量、属性、关系、文字和风格，而不是只看一分或挑最好看的样例。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>引擎：当今主要是扩散<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">具体靠什么把图画出来？</p>
  <p>当今主流引擎是<b>扩散模型</b>：从一团随机噪声出发，<b>一步步去噪</b>，图像逐渐「显影」出来；而你的文字被作为<b>条件</b>注入每一步，让它朝「符合描述」的方向去噪（完整机制见「扩散模型」深读页）。除扩散外，也有自回归（像写文字一样一块块生成图）等路线，各有取舍。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>完整示例：怎么让它更听话<span class="dd-badge eng">案例推演</span></h2>
  <p class="dd-lead">只给一句话，控制太粗——想要精确的构图、姿势、局部修改，怎么办？</p>
  <ul class="dd-steps">
    <li><b>可控生成</b>：在文字之外再加<b>额外条件</b>——一张线稿、一个人体姿势、一张深度图，让生成严格贴着它来（如 ControlNet）；或只重绘图里<b>指定的一块</b>（局部重绘），其余保持不动（见「可控生成」）。</li>
    <li><b>图像编辑</b>：不是从零生成，而是<b>在已有图上按指令改</b>（换背景、去除某物、扩图），实用场景的主力（见「图像编辑」）。</li>
  </ul>
  <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>步骤</th><th>输入</th><th>本步要检查的输出</th></tr></thead><tbody><tr><td>1　确定目标</td><td>“红外套人物站在桥左侧，背景是雨夜城市”</td><td>对象、位置、服装和场景被拆成可检查条件</td></tr><tr><td>2　约束构图</td><td>人物姿态骨架与桥面深度图</td><td>人物位置和透视遵循控制图</td></tr><tr><td>3　生成候选</td><td>同一条件下固定 4 个随机种子</td><td>分别检查贴题、自然度和候选间多样性</td></tr><tr><td>4　局部修订</td><td>只遮罩错误的手部区域</td><td>手部改善且脸、衣服、桥面未被意外改写</td></tr></tbody></table></div>
  <p>这个案例不是教模型“一次猜中”，而是把模糊愿望变成条件、采样和局部验收。若姿态图与文字要求冲突，应先明确优先级；若四个候选都在同一位置失败，应回查条件表示或模型覆盖，而不是只继续抽卡。</p>
  <div class="dd-note intuition"><b>一句话</b>　纯文生图是「说什么画什么」，可控生成和编辑则给了你<b>更细的方向盘</b>——从「碰运气」走向「可精确调」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>它现在还做不好什么<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">能力随模型快速变化，下面不是永久缺陷清单，而是部署时应持续评测的高风险维度。</p>
  <ul class="dd-steps">
    <li><b>图中文字与版式</b>：新模型已明显改善短文本，但长文、多语言、精确排版与可编辑字体仍需逐模型评测。</li>
    <li><b>组合与复杂结构</b>：手部只是一个例子；更普遍的是计数、空间关系、遮挡、对称和多对象属性绑定可能出错。</li>
    <li><b>一致性</b>：让<b>同一个角色</b>在多张图里保持长相一致，很难。</li>
    <li><b>事实性</b>：它生成的是「<b>看起来对</b>」的图，不是「真的准确」的图——和大模型的<b>幻觉</b>同源。要求科学准确的示意图时尤其要核对（见「幻觉」）。</li>
  </ul>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6.5</span>怎么评估：好看、贴题与安全不是一个分数<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">“这张图质量高”到底是在说什么？</p>
  <p>至少要分开评估：<b>感知质量</b>（是否自然）、<b>提示对齐</b>（对象、关系、文字是否符合要求）、<b>多样性</b>、<b>身份/角色一致性</b>、<b>事实与安全</b>。自动指标可用于批量回归，但难覆盖构图偏好与高风险语义；产品验收应组合固定提示集、人工盲评、失败类型标注和安全红队。</p>
  <div class="dd-note key"><b>避免只挑最好看的样例</b>　同一提示多次采样后挑一张展示，会掩盖单次成功率。评测必须固定采样预算、分辨率、编辑条件和随机种子策略，才能比较版本。</div>
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
  <p class="dd-lead">从文本语义、条件注入到图像采样与分项验收，把“看起来不错”拆成可检查机制。</p>
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
      <tr><td>AI 画图是从图库拼贴</td><td>通常是从学到的分布采样图像表示，不是简单检索拼贴；但模型可能记忆并复现训练片段</td></tr>
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
      <li>不是简单拼贴；它在像素、潜变量或视觉 token 空间采样并解码，但仍需防范训练样本记忆与复现。</li>
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

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2112.10752" target="_blank" rel="noopener">Rombach et al., Latent Diffusion Models</a>：潜空间文生图与条件交叉注意力。</li>
    <li><a href="https://arxiv.org/abs/2205.11487" target="_blank" rel="noopener">Saharia et al., Imagen</a>：文本编码、级联扩散与图文对齐。</li>
    <li><a href="https://arxiv.org/abs/2204.06125" target="_blank" rel="noopener">Ramesh et al., Hierarchical Text-Conditional Image Generation with CLIP Latents</a>：CLIP 潜变量与扩散解码。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-22</div>
</div>
`
};
