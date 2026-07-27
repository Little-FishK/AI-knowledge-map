/* 理解原理页 —— 幻觉 Hallucination
 * 写作规约见 docs/DEEPDIVE.md。全文原创，图示自绘。
 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["hallucination"] = {
  title: "幻觉 Hallucination",
  subtitle: "流畅、自信、却是编的——为什么这是结构性的，而不是「再大一点就好」",
  aliases: "Hallucination · 幻觉 · 一本正经地胡说",
  meta: "建议 20–30 分钟 · 中级 · 需要：了解「大语言模型」怎样预测下一个词",
  thesis: "幻觉是模型生成的<b>看似可信却缺乏依据或事实错误</b>的内容。下一 token 训练优化的是数据似然，不直接验证世界事实，因此会产生结构性风险；但数据质量、后训练、检索、工具、校准与拒答都能显著改变错误率。应把“存在不可消除的风险边界”与“所有幻觉都必然发生”区分开。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul>
    <li><b>是什么</b>——幻觉和普通「答错」有何不同。</li>
    <li><b>为什么消不掉</b>——为什么它是结构性的，而非「再大一点就好」。</li>
    <li><b>为什么这么自信</b>——编就编吧，为什么语气那么笃定、最害人。</li>
    <li><b>什么时候高发</b>——哪些情况下更容易幻觉。</li>
    <li><b>怎么对付</b>——有哪些缓解手段（注意：缓解，不是根治）。</li>
  </ul>
</div>

<div class="dd-note key">
  <b>贯穿全页的最小例子</b>　你问：「介绍一下张伟 2019 年发表的那篇关于图神经网络的论文。」——这个人、这篇论文<b>可能根本不存在</b>。但模型不会说「查无此文」，而是<b>流畅地编出</b>一个像模像样的标题、期刊、摘要。全页解释它为什么会这样、又为什么这么自信。
</div>

<section class="dd-sec">
  <h2><span class="dd-n">1</span>什么是幻觉<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">本节回答：模型答错很正常，为什么「幻觉」要被单独拎出来说？</p>
  <p>因为它不是普通的「答错」。普通错误往往磕磕巴巴、或明显不确定；幻觉却是<b>流畅、自信、细节丰富，编得像真的一样</b>——编造的论文有标题有期刊，虚构的 API 有名字有参数。正因为它「看起来太可信」，才格外危险：你很难一眼看出哪句是真、哪句是它现编的。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">2</span>为什么它是结构性的<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">最关键的一节：为什么再大的模型也消不掉幻觉，它不是个能修的 bug 吗？</p>
  <div class="dd-note warn"><b>因为它源于模型的本质。</b>　大模型建模的是「<b>在训练数据的统计规律下，最可能接下去的内容</b>」——它优化的是「像不像人写的下一个词」，<b>从来不是「对不对」</b>（见「大语言模型」深读页第 9 节）。它没有一个「真相数据库」去核对，也<b>不知道自己不知道</b>。</div>
  <figure class="dd-fig">
    <svg viewBox="0 0 560 130" role="img" aria-label="答对和瞎编，模型做的是同一件事">
      <rect x="20" y="30" width="250" height="70" rx="8" fill="none" stroke="#4f9d78"/>
      <text x="145" y="52" text-anchor="middle" class="svg-t" font-size="12">「法国的首都是__」</text>
      <text x="145" y="76" text-anchor="middle" class="svg-tn" font-size="12">→ 巴黎（对）</text>
      <text x="145" y="94" text-anchor="middle" class="svg-t" font-size="10">数据里出现无数次</text>
      <rect x="290" y="30" width="250" height="70" rx="8" fill="none" stroke="#cf6f6f"/>
      <text x="415" y="52" text-anchor="middle" class="svg-t" font-size="12">「张伟那篇论文是__」</text>
      <text x="415" y="76" text-anchor="middle" class="svg-tn" font-size="12">→ 流畅编一个（错）</text>
      <text x="415" y="94" text-anchor="middle" class="svg-t" font-size="10">数据里没有，照样挑最可能的词</text>
    </svg>
    <figcaption>图 1　两种情况下，模型做的是<b>同一件事</b>：挑「最可能的下一个词」。区别只在于——第一种，训练数据里有正确答案；第二种没有，但它照样会流畅地续下去。所以「答对」和「瞎编」在机制上没有分界。</figcaption>
  </figure>
  <div class="dd-note key"><b>更精确的结论</b>　纯语言建模目标不提供通用事实验证器，所以对开放世界和长尾事实始终有剩余风险；理论结果也只在特定分布与校准假设下给出下界。规模、数据、检索、工具和后训练可以显著降低某些类别的幻觉，但不能给所有问题提供零错误保证。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">3</span>为什么它还这么自信<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">编就编吧，为什么语气那么笃定？这恰恰是最害人的地方。</p>
  <p>因为「<b>流畅、自信、像人写的</b>」正是模型被训练去追求的<b>表面特征</b>，而这套特征和「内容对不对」是<b>两回事</b>。模型学会了「怎么把话说得像专家」，但没学会「不确定时该露怯」。于是它对真相和对编造，用的是<b>同样笃定的口吻</b>。</p>
  <div class="dd-note intuition"><b>它不会「知道自己在编」</b>　人编瞎话时心里清楚；模型没有这种自我察觉——它只是在挑最可能的词，编造那一刻，它「以为」自己在正常作答。所以你不能指望它自己标出「这段是我瞎猜的」。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">4</span>什么时候更容易幻觉<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">幻觉不是均匀发生的：哪些信号说明模型正在从“有依据回答”滑向“按语言模式补全”？</p>
  <ul class="dd-steps">
    <li><b>训练数据里没有或很稀疏</b>：冷门人物、小众事实、你公司的私有信息——它没见过，只能编。</li>
    <li><b>问了训练截止之后的事</b>：最新消息它压根不知道（知识截止）。</li>
    <li><b>被诱导</b>：你问「张伟那篇论文」时预设了它存在，模型容易顺着你的预设编。</li>
    <li><b>采样温度高</b>：温度调高会让它更「放飞」，更偏离高概率的稳妥答案（见「信息论与熵」）。</li>
  </ul>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">5</span>怎么对付它<span class="dd-badge eng">工程</span></h2>
  <p class="dd-lead">既然消不掉，能怎么把它压到可控？</p>
  <ul class="dd-steps">
    <li><b>RAG 给真实材料</b>：回答前先检索、让它<b>基于给定资料</b>作答，把回答「锚」在真实内容上（见「RAG」）。</li>
    <li><b>要求引用出处</b>：让它标明每句来自哪份材料，你能<b>一键核对</b>（见「引用与溯源」）。</li>
    <li><b>分解、计算与验证</b>：对推理题可要求列步骤或调用计算器、代码执行器；步骤本身仍可能错，关键结论要用外部证据验证。</li>
    <li><b>不确定性与转人工</b>：经校准和任务验证后，可综合多次采样一致性、检索覆盖、验证器分数或 token 概率筛查风险；原始 logprobs 不等同于事实正确率。</li>
    <li><b>提示允许「不知道」</b>：明确告诉它「不确定就说不知道，别编」，能减少一部分。</li>
  </ul>
  <div class="dd-note warn"><b>关键认知：这些都是「缓解」，不是「根治」</b>　RAG 检索错了、材料本身错了、或问题超出材料范围，幻觉照样发生。只要底层目标是似然而非真相，<b>就没有一劳永逸的解法</b>。正确心态：<b>凡是重要的事实，都要核对</b>，别把它的自信当保证。</div>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>案例推演：核验“张伟论文”</th><th>系统获得的证据</th><th>应该怎样回答</th></tr></thead>
    <tbody>
      <tr><td>直接生成</td><td>只有用户预设和模型参数记忆</td><td>不能据此补标题、期刊和 DOI</td></tr>
      <tr><td>作者+年份+主题检索</td><td>学术索引无精确匹配，却有多位同名作者</td><td>把“论文存在”降为未证实，而非挑最像的一篇</td></tr>
      <tr><td>交叉核对</td><td>作者主页、DOI 注册库仍无匹配</td><td>明确说未找到，并列出检索范围与同名歧义</td></tr>
      <tr><td>请求补充</td><td>让用户提供机构、题名片段或链接</td><td>把拒绝编造转成可继续取证的下一步</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>校准不是语气变软</b>　可靠输出要让断言强度跟证据覆盖匹配：“未在这些来源找到”比“这篇论文不存在”更准确；“可能是同名作者”比凭空选定一个张伟更可核验。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">6</span>怎样把长回答拆成可核验事实<span class="dd-badge math">评测</span></h2>
  <p class="dd-lead">一段回答往往真假混杂；只打“整段正确/错误”会掩盖最危险的那一句。</p>
  <p>先把输出拆成最小的可核验原子断言，再根据指定证据集标为“支持、矛盾、证据未覆盖、不可核验”。这评测的是<b>相对证据的事实精度</b>，不等于穷尽世界真相。</p>
  <div class="dd-formula" data-formula-id="atomic-fact-support-rate" data-display="mathml"><math display="block" aria-label="原子事实支持率等于被可靠来源支持的可核验断言数量除以全部可核验断言数量"><mrow><msub><mi>R</mi><mtext>支持</mtext></msub><mo>=</mo><mfrac><mtext>被可靠来源支持的可核验断言数</mtext><mtext>全部可核验断言数</mtext></mfrac></mrow></math></div>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>“张伟论文”回答中的原子断言</th><th>证据判定</th><th>处置</th></tr></thead>
    <tbody>
      <tr><td>作者名为张伟</td><td>未覆盖：同名作者过多</td><td>请求机构等消歧信息</td></tr>
      <tr><td>发表于 2019 年</td><td>未覆盖</td><td>不得补全</td></tr>
      <tr><td>题名为《Graph…》</td><td>矛盾：所给 DOI 指向另一论文</td><td>关键错误，整段不得发布</td></tr>
      <tr><td>主题涉及图神经网络</td><td>仅来自用户预设</td><td>标为待证，而非引用用户当来源</td></tr>
      <tr><td>“我没有找到精确匹配”</td><td>由检索日志支持</td><td>可输出，并说明检索范围</td></tr>
    </tbody>
  </table></div>
  <p>假设 5 个可核验断言中只有 3 个被支持，支持率是 <code>3÷5=60%</code>。但平均分不是唯一门槛：若那 1 个矛盾项是药物剂量、金额或 DOI 等关键字段，即使其余都对也应整体失败。生产评测应同时报告支持率、关键矛盾率、证据覆盖率和拒答后的任务覆盖率。</p>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">7</span>定位失败：检索、生成还是引用<span class="dd-badge eng">诊断</span></h2>
  <p class="dd-lead">“有引用”并不等于“引用支持这句话”，错误需要沿流水线分层归因。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>评测层</th><th>核心问题</th><th>典型失败</th></tr></thead>
    <tbody>
      <tr><td>检索覆盖</td><td>需要的证据是否被取回？</td><td>索引缺失、查询错、同名消歧失败</td></tr>
      <tr><td>证据质量</td><td>来源是否原始、可信且仍有效？</td><td>二手转述、过期页面、来源互相抄袭</td></tr>
      <tr><td>忠实性</td><td>回答是否只陈述材料真正支持的内容？</td><td>把“相关”扩写成因果，把未提及写成否定</td></tr>
      <tr><td>引用正确性</td><td>每个引用是否指向对应断言？</td><td>真实链接却不支持邻近句子</td></tr>
      <tr><td>选择性回答</td><td>证据不足时是否拒答或转人工？</td><td>为追求覆盖率而强答</td></tr>
    </tbody>
  </table></div>
  <div class="dd-note key"><b>区分三个目标</b>　闭卷事实性问“与世界事实是否一致”；给定材料忠实性问“是否受证据支持”；引用正确性问“链接是否真的支撑相邻断言”。三者相关，但不能互相替代。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">8</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
  <p class="dd-lead">从下一 token 似然推到为什么重要事实需要取证、来源映射和适时拒答。</p>
  <ol class="dd-chain">
    <li>幻觉是流畅、自信却编造的内容，比普通答错更难识别。<span>（§1）</span></li>
    <li>它是结构性的：模型建模似然不是真相，答对和瞎编是同一个动作。<span>（§2）</span></li>
    <li>它这么自信，是因为「像人写的」是训练目标、与对错无关，且它不知道自己不知道。<span>（§3）</span></li>
    <li>数据稀疏、超训练截止、被诱导、高温时更易发生。<span>（§4）</span></li>
    <li>可用 RAG、可核验引用、外部工具、校准与人工复核来降低风险；任何单一措施都有失效模式。<span>（§5）</span></li>
    <li>长回答应拆成原子断言，并分别检查检索覆盖、证据质量、忠实性、引用与拒答。<span>（§6–7）</span></li>
  </ol>
  <div class="dd-note key"><b>过关标准</b>　如果你能解释“语言似然不等于事实真值”，并能为具体场景设计检索、引用验证、拒答和人工复核的组合控制，你就抓住了幻觉治理的内核。</div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">9</span>常见误解<span class="dd-badge intuition">直觉</span></h2>
  <p class="dd-lead">这些误区分别把规模、自信语气、RAG 和自我报告错当成了事实保证。</p>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>误解</th><th>更准确的理解</th></tr></thead>
    <tbody>
      <tr><td>幻觉是能修好的 bug</td><td>是结构性的：目标是似然而非真相，消不掉、只能缓解</td></tr>
      <tr><td>模型越大就不会幻觉了</td><td>更大更博学、错更少，但机制没变，仍会幻觉</td></tr>
      <tr><td>它自信就说明它有把握</td><td>自信是训练出的口吻，与对错无关；它不知道自己不知道</td></tr>
      <tr><td>用了 RAG 就不会幻觉</td><td>只是缓解；检索错、材料错、超范围时照样编</td></tr>
      <tr><td>能让它自己标出哪句是编的</td><td>它没有这种自我察觉，编造时「以为」在正常作答</td></tr>
    </tbody>
  </table></div>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">10</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
  <p class="dd-lead">请为一个“可能不存在的对象”设计先取证、再作答或拒答的流程。</p>
  <ol class="dd-quiz">
    <li>幻觉和普通「答错」有什么不同？为什么更危险？</li>
    <li>为什么说幻觉是结构性的？「答对」和「瞎编」有什么关系？</li>
    <li>它为什么总是那么自信？</li>
    <li>哪些情况下更容易幻觉？</li>
    <li>为什么原子事实支持率还要搭配关键矛盾率和证据覆盖率？</li>
  </ol>
  <details class="dd-answers"><summary>参考答案</summary>
    <ol>
      <li>它流畅、自信、细节丰富、编得像真的，难以一眼识别，因此比磕巴的普通错误更容易骗到人。</li>
      <li>因为模型建模的是「最可能接下去的内容」（似然）而非真相，没有真值约束；答对和瞎编都是「挑最可能的下一个词」这同一个动作。</li>
      <li>因为「流畅自信、像人写的」是训练追求的口吻，和内容对错无关，而且它不知道自己不知道。</li>
      <li>训练数据没有或稀疏、问了训练截止后的事、被问题预设诱导、采样温度高。</li>
      <li>平均支持率可能掩盖一个高影响错误，且低覆盖时系统可通过少说话“刷高”支持率；所以要同时看关键矛盾、证据覆盖和拒答后的任务覆盖。</li>
    </ol>
  </details>
</section>

<section class="dd-sec">
  <h2><span class="dd-n">11</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
  <div class="dd-table-wrap"><table class="dd-table">
    <thead><tr><th>学习层级</th><th>涉及概念</th></tr></thead>
    <tbody>
      <tr><td>先修</td><td>大语言模型、预测下一个 token、采样与温度</td></tr>
      <tr><td><b>本页核心</b></td><td>似然非真相、结构性、自信的口吻、缓解非根治</td></tr>
      <tr><td>紧邻延伸</td><td>RAG、引用与溯源、思维链、Logprobs 与置信度、检索</td></tr>
      <tr><td>更远</td><td>对齐、评测、可解释性、推理模型</td></tr>
    </tbody>
  </table></div>
</section>

<div class="dd-src">
  <b>资料来源与改编说明</b>
  <ul>
    <li><a href="https://arxiv.org/abs/2311.14648" target="_blank" rel="noopener">Kalai &amp; Vempala, Calibrated Language Models Must Hallucinate</a>：对任意事实分布中不可避免错误的理论边界；不等于所有幻觉都无法降低。</li>
    <li><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener">Lewis et al., Retrieval-Augmented Generation</a>：外部检索对知识密集任务的帮助及其边界。</li>
    <li><a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noopener">Ouyang et al., InstructGPT</a>：后训练如何改善有用性、真实性与拒答行为。</li>
    <li><a href="https://arxiv.org/abs/2305.14251" target="_blank" rel="noopener">Min et al., FActScore</a>：把长文本拆成原子事实并计算有可靠来源支持的比例。</li>
  </ul>
  <div class="dd-src-date">访问日期：2026-07-23</div>
</div>
`
};

// 新版教学门禁补充：逐节说明幻觉的定义、成因、诊断、缓解与证据边界。
{
  const page = window.DEEPDIVE["hallucination"];
  const additions = [
    '<p>幻觉判断输入模型输出、可核验断言和权威证据，输出“支持、矛盾、未覆盖或不可核验”的标记。它专指看似可信却缺乏依据或事实错误的生成，危险来自流畅细节让读者难以察觉；普通计算错误也可能严重，但不一定具有这种伪造依据的外观。没有指定证据范围时，不能把“暂未找到”直接写成“不存在”。</p>',
    '<p>结构性风险分析输入训练目标、问题和模型可用证据，输出是否存在只靠语言似然无法验证的事实缺口。下一 token 训练根据上下文提高可能续词的概率，并不查询一个通用真相裁判；长尾或开放世界问题即使缺证据也仍可产生语言上合理的续写。规模、数据和工具能降低风险，但不能对所有未知事实给出零错误保证。</p>',
    '<p>表面自信分析输入生成概率、表达风格、证据覆盖和校准结果，输出“语气强度是否与证据匹配”的判断。训练可让肯定句更流畅，却不使肯定语气成为事实概率；模型也没有可直接读取的内在“我正在编造”标志。应依赖外部验证和经任务校准的风险信号，而不是把措辞笃定或自述当证据。</p>',
    '<p>高发条件判断输入知识覆盖、时间范围、问题预设、采样温度和可用资料，输出需要检索、澄清、降温或拒答的风险动作。冷门私有事实、知识截止后的事件、带错误预设的问题和高温采样更易把系统推向模式补全；这些只是提高风险的信号，不表示每次必错。即使低温也可能稳定复现同一错误。</p>',
    '<p>缓解流程输入待核验问题、检索来源、工具结果、证据覆盖和任务风险，输出有引用的回答、带范围的“不确定”、澄清问题或转人工。以“张伟论文”为例，先按作者年份主题检索，再交叉核对作者主页和 DOI；仍无精确匹配就说明检索范围并请求机构信息。RAG、引用和提示都可能失效，高影响断言必须由外部证据验证。</p>',
    '<p>原子事实评测输入一段回答和指定证据集，输出可核验断言数 Nverifiable、被支持数 Nsupported、支持率 Rsupport 以及关键矛盾率和覆盖率。先拆到每条能独立查证的最小断言，再逐条映射来源，最后用 Nsupported/Nverifiable 计算比例；5 条中 3 条支持即 60%。一个药量、金额或 DOI 的关键矛盾可让整段失败，不能只看平均支持率。</p>',
    '<p>分层诊断输入检索候选、来源版本、回答断言、引用映射和拒答行为，输出检索覆盖、证据质量、忠实性、引用正确性或选择性回答的失败归因。它解决有引用但引用不支持断言时如何定位错误的问题。先问证据是否取回，再问来源是否可靠、陈述是否超出来源、链接是否对应邻句，最后检查证据不足时是否拒答。闭卷事实性、给定材料忠实性和引用正确性是不同目标，不能互相替代。</p>'
  ];
  const renderedSections = page.html.split("</section>");
  additions.forEach((html, index) => { renderedSections[index] += html; });
  page.html = renderedSections.join("</section>");
  page.html = page.html.replace('<span class="dd-n">5</span>怎么对付它', '<span class="dd-n">5</span>怎么对付它：案例推演');
  page.html = page.html.replace(
    /<div class="dd-formula" data-formula-id="atomic-fact-support-rate"[\s\S]*?<\/div>/,
    '<div class="dd-formula" data-formula-id="atomic-fact-support-rate" data-display="mathml"><math display="block" aria-label="原子事实支持率"><mi>Rsupport</mi><mo>=</mo><mfrac><mi>Nsupported</mi><mi>Nverifiable</mi></mfrac></math></div>'
  );
}
