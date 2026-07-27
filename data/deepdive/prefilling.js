/* 理解原理页 —— 响应预填充 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE['prefilling'] = window.createDeepDive({
  title:'响应预填充：让模型从一个给定的答案前缀继续',
  subtitle:'理解 assistant prefix 如何改变条件分布，并与输入 prefill、提示缓存和约束解码严格区分。',
  thesis:'响应预填充把一段 assistant 文本视为已经生成的前缀，模型只续写其后内容。它能强烈偏置开头、格式和语气，但仍是<b>概率条件</b>：错误前缀会锚定后续，且无法保证完整 schema、事实正确或动作安全。',
  goals:['解释前缀条件分布','手算续写概率变化','区分三种 prefill/caching','设计拼接、停止与验证流程'],
  sections:[
    {title:'模型不是重新回答，而是继续已开始的答案',badge:'直觉',lead:'assistant 消息已包含 {"action":"，模型接下来看到的任务发生了什么？',body:'<p>模型把该文本放在 assistant 侧历史中，预测其后的 next token。开场寒暄、Markdown 围栏或其他结构因与前缀不连续而概率下降，因此短前缀常比长篇“不要寒暄”更直接。</p><p>前缀也会锁定假设。预填“退款已批准，因为”会促使模型为既定结论找理由，即使订单不合格；它不是中性格式技巧。</p><div class="dd-note"><b>使用原则：</b>只预填你能独立保证正确且希望固定的最小文本；其余交给约束与校验。</div>'},
    {title:'它改变条件，不改变参数',kind:'math',badge:'机制',lead:'同一 prompt 加一个 assistant prefix，概率分布为什么会变化？',body:'<div class="dd-formula">P(y|x,p)=∏ₜ P(yₜ | x, p, y&lt;t)</div><p>x 是用户与系统上下文，p 是已提供的回答前缀。模型权重不变，但每一步注意到 p，所以续写分布改变。前缀越具体，可能路径越少；若 p 与模型模板或任务冲突，后续会在一个低概率区域勉强续写。</p><p>预填一个“{”只承诺 JSON 风格开头；预填完整 <code>{"action":"refund"</code> 已经替模型做出业务决定。二者风险完全不同。</p><div class="dd-note warn"><b>概率偏置不是硬保证。</b>　模型仍可能闭合对象后追加说明、漏字段或生成事实错误。</div>'},
    {title:'三种相似名称必须分开',badge:'消歧',lead:'response prefill、inference prefill 和 prompt caching 到底各是什么？',body:'<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>概念</th><th>对象</th><th>目的</th><th>是否改变输出条件</th></tr></thead><tbody><tr><td>响应预填充</td><td>assistant 文本前缀</td><td>引导开头/结构</td><td>是</td></tr><tr><td>输入 prefill 阶段</td><td>全部输入 token</td><td>计算输入 KV</td><td>不是产品控制，属推理计算</td></tr><tr><td>提示缓存</td><td>共同输入前缀 KV</td><td>跨请求复用计算</td><td>正确实现下否</td></tr><tr><td>约束解码</td><td>每步合法 token 集</td><td>保证形式语言</td><td>是，且为硬屏蔽</td></tr></tbody></table></div><p>“预填充加速”通常指输入计算；本页的“响应预填充”是把答案开头交给模型续写，概念和性能目标不同。</p>'},
    {title:'运行示例：一个字符怎样重新分配首步概率',kind:'math',badge:'逐步演算',lead:'无前缀时模型最爱说“当然”，预填 { 后会怎样？',body:'<figure class="dd-fig"><svg viewBox="0 0 700 250" role="img" aria-label="无响应前缀与预填左花括号后首个续写 token 概率变化"><rect x="20" y="50" width="280" height="154" rx="9" fill="#21252d" stroke="#6b8cbe"/><text x="160" y="76" text-anchor="middle" class="svg-t">无前缀：回答从零开始</text><text x="66" y="110" class="svg-t" font-size="11">“当然” .45</text><rect x="135" y="96" width="125" height="18" fill="#d3a05a"/><text x="66" y="140" class="svg-t" font-size="11">“{” .25</text><rect x="135" y="126" width="69" height="18" fill="#4f9d78"/><text x="66" y="170" class="svg-t" font-size="11">“```” .20</text><rect x="135" y="156" width="55" height="18" fill="#c77b72"/><rect x="400" y="50" width="280" height="154" rx="9" fill="#21252d" stroke="#4f9d78"/><text x="540" y="76" text-anchor="middle" class="svg-t">预填 “{”：模型只预测其后</text><text x="442" y="110" class="svg-t" font-size="11">“action” .60</text><rect x="520" y="96" width="130" height="18" fill="#4f9d78"/><text x="442" y="140" class="svg-t" font-size="11">“status” .25</text><rect x="520" y="126" width="54" height="18" fill="#6b8cbe"/><text x="442" y="170" class="svg-t" font-size="11">“note” .10</text><rect x="520" y="156" width="22" height="18" fill="#d3a05a"/><path d="M300,127 L398,127" stroke="#6b7484" stroke-dasharray="5 4"/></svg><figcaption>图 1　两个分布的事件空间不同：预填的“{”已不是候选，而是条件上下文的一部分。</figcaption></figure><p>不能把 .25→.60 说成同一 token 概率提升；无前缀分布预测答案首 token，预填后分布预测花括号之后的 token。正确评测是比较完整输出的结构通过率、内容质量与失败类型。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>方案</th><th>首次 JSON 语法</th><th>Schema</th><th>事实正确</th></tr></thead><tbody><tr><td>仅提示</td><td>94%</td><td>86%</td><td>80%</td></tr><tr><td>预填 {</td><td>98%</td><td>89%</td><td>80%</td></tr><tr><td>约束解码</td><td>100%</td><td>99%*</td><td>80%</td></tr></tbody></table></div><p>*取决于支持范围。示例强调前两层改善不会自动抬高事实正确率。</p>'},
    {title:'适合固定开场，不适合替模型做结论',kind:'eng',badge:'用途',lead:'哪些前缀是低风险格式骨架，哪些已经偷偷注入答案？',body:'<p>较适合：JSON 的开括号、固定标题、已验证的代码前文、语言/语气开场、枚举标签的共同前缀。高风险：成功/失败结论、用户身份、金额、引文、工具已执行状态和任何未经外部验证的事实。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>前缀</th><th>风险</th><th>替代</th></tr></thead><tbody><tr><td>{</td><td>低，但不能保完整 JSON</td><td>schema 约束</td></tr><tr><td>“根据政策证据：”</td><td>若证据实际缺失会误导</td><td>条件模板/拒答</td></tr><tr><td>“退款已批准”</td><td>锚定未经授权结论</td><td>工具确认后由服务器填</td></tr><tr><td>已有代码文件</td><td>旧代码可能含漏洞/注入</td><td>版本与测试校验</td></tr></tbody></table></div>'},
    {title:'API 模板、拼接与停止规则会制造隐藏错误',kind:'eng',badge:'实现',lead:'为什么有些服务不允许最后一条 assistant 消息非空？',body:'<p>聊天模板和安全策略由服务实现；有的 API 原生支持 assistant prefix，有的会拒绝、自动闭合或把它当历史回答。必须查接口并用真实模型测试：返回 delta 是否含前缀，计费是否包含，流式首事件从哪里开始。</p><p>客户端只拼接一次前缀，按 UTF-8 增量解码；停止串可能跨 token/事件，不能简单裁字符串；若前缀以半个转义或不完整 Unicode 结尾，会产生不可恢复路径。日志记录前缀版本但避免敏感原文。</p><div class="dd-note warn"><b>模板重复：</b>服务若把前缀回显，客户端再手动前置会得到 <code>{{</code> 或重复标题；契约测试必须覆盖。</div>'},
    {title:'错误前缀会造成锚定和“合理化”',kind:'eng',badge:'失败边界',lead:'为什么强迫答案以“是”开头，会让模型更自信地编理由？',body:'<p>自回归模型要生成与既有前缀连贯的后续。即使内部证据倾向“否”，已给定的“是，因为”也会让反驳变得语言上突兀，于是模型更可能搜寻支持性理由。这是条件生成的自然结果，不是模型主动撒谎。</p><p>用正反对照测试：同一问题分别预填“是”“否”和空前缀，观察结论敏感度；若事实随前缀翻转，说明系统在用格式控制替代证据。高风险任务只预填中性骨架。</p><div class="dd-note warn"><b>安全绕过风险：</b>预填可能把模型置于安全模板不常见的状态；供应商允许的前缀范围与安全行为要单独红队。</div>'},
    {title:'预填不能替代完整约束和业务验证',kind:'eng',badge:'可靠性',lead:'输出已经以 { 开头，仍要经过哪些门？',body:'<ol class="dd-steps"><li>等待完整输出和明确结束，断流不是完成。</li><li>解析 JSON 并做 schema 校验。</li><li>验证金额、日期、引用与跨字段不变量。</li><li>对实体查权威数据库，未知则询问。</li><li>工具执行按当前主体重新鉴权和幂等提交。</li><li>结构失败有限重试；同类重复则用约束解码或表单。</li></ol><p>若硬结构是核心要求，直接使用受支持的约束解码，比不断加长前缀和修复提示更可靠。预填适合作为兼容性或体验优化，不应被包装成保证。</p>'},
    {title:'评测要和无预填基线配对',badge:'评测',lead:'结构通过率上升后，怎样发现事实质量、拒答和安全被前缀伤害？',body:'<p>同一批输入配对运行空前缀与候选前缀，测首次语法/schema、字段准确、任务成功、事实、拒答、越权、长度、TTFT 和 token 成本；按缺信息、高风险、语言和长输入切片。</p><p>记录“前缀反转率”：给相反结论前缀时答案是否无证据翻转；故障测试断流、回显、重复拼接、Unicode、停止串和接口升级。只有格式改善且内容/风险不退化才可采用。</p><div class="dd-note"><b>成功标准：</b>前缀减少低价值开场或格式偏离，但不替模型决定未知事实，也不让下游降低校验。</div>'},
    {title:'常见误区与概念依赖',badge:'常见误区与学习路线',lead:'响应预填充是条件控制，强而简单，但也正因简单而容易被误用。',body:'<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>误区</th><th>更准确的理解</th></tr></thead><tbody><tr><td>预填会修改模型权重</td><td>只改变当前上下文条件</td></tr><tr><td>预填 { 保证 JSON</td><td>只固定开头，后续仍可偏离或截断</td></tr><tr><td>与 prompt cache 相同</td><td>一个引导输出，一个复用输入 KV 计算</td></tr><tr><td>前缀越长控制越好</td><td>越可能锚定错误事实和降低可恢复性</td></tr><tr><td>服务都支持同一语义</td><td>聊天模板、回显和安全行为因 API 而异</td></tr></tbody></table></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>概念依赖与延伸学习</th></tr></thead><tbody><tr><td>先修</td><td>自回归生成、条件概率、聊天模板</td></tr><tr><td><b>本页核心</b></td><td>assistant prefix、锚定、拼接、停止与配对评测</td></tr><tr><td>硬格式</td><td>结构化输出、约束解码、采样参数</td></tr><tr><td>性能区别</td><td>提示缓存、输入 prefill、流式输出与推理优化</td></tr></tbody></table></div>'}
  ],
  chain:['选择可独立保证正确的最小前缀','按真实 API 契约发送 assistant prefix','模型条件于前缀续写','正确拼接/停止并等待完整结果','做 schema/事实/权限验证','与空前缀配对评测并监控锚定'],
  quiz:[{q:'响应预填充改模型权重吗？',a:'不改，只把前缀加入当前条件上下文。'},{q:'为什么图中 .25 和 .60 不能直接比较成概率提升？',a:'它们对应不同预测位置和事件空间。'},{q:'响应预填充与提示缓存差什么？',a:'前者引导输出内容，后者复用相同输入前缀的 KV 计算。'},{q:'哪些内容不应预填？',a:'未经验证的结论、身份、金额、引用和工具状态。'},{q:'怎样检测锚定？',a:'对同一输入用空、正反结论前缀做配对，看是否无证据翻转。'}],
  sources:[{title:'Language Models as Programmable Systems',url:'https://arxiv.org/abs/2212.06094',note:'LMQL 与受控生成'},{title:'Guidance',url:'https://arxiv.org/abs/2307.09702',note:'交错控制与生成'},{title:'PICARD',url:'https://arxiv.org/abs/2109.05093',note:'与硬约束解码对照'},{title:'Anchoring Effects in Large Language Models',url:'https://arxiv.org/abs/2305.11627',note:'输入锚点对模型判断的影响'}]
});

// 新版教学门禁补充：逐节明确输入输出、工作机制、结果含义与适用边界。
{
  const page = window.DEEPDIVE['prefilling'];
  const additions = [
    '<p>响应预填充输入用户/系统上下文和一段已确认的 assistant 前缀，输出从该前缀之后继续的 token 序列。前缀被放进条件上下文，模型不是重新选择它；结果只表示续写与前缀连贯，不证明前缀中的事实正确。只应预填可独立保证正确的最小骨架。</p>',
    '<p>条件生成输入上下文 x、前缀 p 和先前续写，输出下一 token 的概率分布与最终续写。模型权重不变，注意力每步都读取 p，因此事件空间和概率改变；更具体的前缀会减少可选路径，但冲突或错误前缀会把续写锚在错误区域。</p>',
    '<p>概念消歧输入一个名为 prefill 或 cache 的功能及其作用对象，输出“响应前缀、输入计算、缓存复用或硬约束”中的一种分类。先看它处理 assistant 文本、输入 token、KV 结果还是合法 token 集，再判断它改变内容条件还是只减少计算。名称相似不能推出语义或接口兼容，实际行为仍以服务文档和契约测试为准。</p>',
    '<p>这个案例输入空前缀或“{”两种条件以及各自的首步候选，输出两个不同位置的概率分布和完整结构指标。“{”的 .25 与“action”的 .60 不是同一事件，不能说概率从 .25 提升到 .60；要解释的是完整输出的结构、事实与失败类型。</p>',
    '<p>前缀选择输入拟固定文本、证据状态和任务风险，输出中性骨架或“不使用预填”的决定。只固定 JSON 开括号、标题或已验证代码；结论、身份、金额、引文和工具状态必须由权威系统确认。前缀越长，越可能锚定未知事实。</p>',
    '<p>API 接入输入服务能力、assistant 前缀、流式事件和停止规则，输出正确拼接的一份完整结果。服务决定前缀是续写条件、历史答案还是非法消息，客户端再按契约拼接、解码和停止；回显或重复开头说明契约理解有误。半个转义、不完整 Unicode 和未经实测的接口都不适合直接上线。</p>',
    '<p>锚定测试输入同一问题的空前缀、“是”和“否”三个版本，输出结论变化和证据变化。模型按连贯性续写已有开头，所以理由随前缀翻转表示格式正在替代证据，而不是答案更可靠。高风险任务只能使用中性骨架，并需单独红队。</p>',
    '<p>业务验证输入完整模型输出、schema、权威数据与当前权限，输出可接受、拒绝或重新询问。系统依次检查完整性、结构、字段事实、实体权限和幂等提交；通过 JSON 解析只说明形式正确，不说明事实或动作获准。硬结构应优先使用约束解码，预填只作兼容或体验优化。</p>',
    '<p>配对评测输入相同样本的空前缀与候选前缀结果，输出格式、事实、拒答、安全、延迟和成本差异。按相同切片逐项比较并注入断流、回显和接口升级故障；只有格式改善且内容与风险不退化才可采用。模型、API 或模板版本变化后必须重新评测。</p>'
  ];
  const renderedSections = page.html.split("</section>");
  additions.forEach((html, index) => {
    if (html) renderedSections[index] += html;
  });
  page.html = renderedSections.join("</section>");
  page.html = page.html.replace(
    /<div class="dd-formula">[\s\S]*?<\/div>/,
    '<div class="dd-formula"><math display="block" aria-label="给定上下文和前缀时完整续写的条件概率"><mi>P</mi><mo>(</mo><mi>y</mi><mo>|</mo><mi>x</mi><mo>,</mo><mi>p</mi><mo>)</mo><mo>=</mo><munder><mo>∏</mo><mi>t</mi></munder><mi>P</mi><mo>(</mo><msub><mi>y</mi><mi>t</mi></msub><mo>|</mo><mi>x</mi><mo>,</mo><mi>p</mi><mo>,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo>)</mo></math></div>'
  );
}
