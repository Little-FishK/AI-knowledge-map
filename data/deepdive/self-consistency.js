window.DEEPDIVE['self-consistency'] = window.createDeepDive({
  title:'自洽性：用多条独立推理路径投票', subtitle:'理解采样多样性、答案聚合、相关错误、成本与置信估计，并区分多数一致和事实正确。',
  thesis:'自洽性对同一问题采样多条推理路径，以最终答案聚合减少单路径偶然错误；收益要求错误具有一定独立性，<b>多数共识仍可能系统性地错</b>。',
  goals:['解释自洽算法','选择温度和样本数','规范化答案聚合','识别相关错误与成本'],
  sections:[
    {title:'一条路径为何脆弱',badge:'直觉',lead:'同一模型换一次采样为什么可能算对？',body:'<p>早期推理选择会把后续带到不同路径。多次采样产生候选，若正确路径更常出现，多数投票可降低偶然分支错误。</p>'},
    {title:'投票的概率直觉',kind:'math',badge:'数学',lead:'独立样本怎样降低错误？',body:'<p>若每条路径正确率 p&gt;0.5 且近似独立，奇数 n 的多数正确概率随 n 上升；若错误高度相关或 p&lt;0.5，增加样本不会可靠改善。</p>'},
    {title:'多样性与质量的温度',kind:'eng',badge:'采样',lead:'温度为零能做自洽吗？',body:'<p>确定性解码会重复同一路径。适度温度产生多样性，过高则大量无效推理。温度、top-p 与样本数需在任务集上联合调节。</p>'},
    {title:'答案如何规范化',kind:'eng',badge:'聚合',lead:'“1/2”“0.5”和“50%”算同一答案吗？',body:'<p>数学题可解析并化简，分类用固定标签，开放问答需语义聚类或验证器。聚合器错误会把等价答案拆票或把不同答案合并。</p>'},
    {title:'共识不是事实',badge:'边界',lead:'十条路径一致为何仍可能错？',body:'<p>共享训练偏差、同一错误公式或提示暗示会导致相关错误。外部计算、检索、单元测试或独立模型验证比单纯增加同模型样本更强。</p>'},
    {title:'成本与停止',kind:'eng',badge:'工程',lead:'每题采样 40 次是否值得？',body:'<p>边际收益递减。可逐步采样，在票差足够大或验证器通过时停止；只对高价值、可聚合和单次不稳定任务启用，报告质量—成本曲线。</p><div class="dd-note warn"><b>投票比例未经校准。</b>　8/10 一致不自动等于 80% 正确率。</div>'}
    ,{title:'完整手算：独立正确率0.6时五票多数有多可靠',kind:'math',badge:'逐步演算',lead:'单路径只比随机稍好，多采样能提升多少？',body:'<p>若每条路径独立、正确率p=0.6，五条中至少三条正确的概率为：</p><div class="dd-formula">C(5,3)0.6³0.4²+C(5,4)0.6⁴0.4+0.6⁵=0.3456+0.2592+0.07776=<b>0.68256</b></div><p>从60%升到约68.3%，不是五倍。若p=0.4，多数正确率约31.7%，采样反而强化错误；若路径高度相关，有效样本数远小于5。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>条件</th><th>增加样本的结果</th></tr></thead><tbody><tr><td>p&gt;0.5、错误较独立</td><td>多数准确率上升</td></tr><tr><td>p&lt;0.5</td><td>多数更可能错</td></tr><tr><td>错误高度相关</td><td>收益快速饱和</td></tr></tbody></table></div>'}
    ,{title:'原创图：多路径只有经过规范化与验证才形成答案',badge:'可视化',lead:'采样十条“思维链”为什么不等于十个独立证人？',body:'<figure class="dd-fig"><svg viewBox="0 0 735 300" role="img" aria-label="同一问题采样多条路径规范化答案投票并外部验证"><defs><marker id="sca" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#788293"/></marker></defs><rect x="22" y="112" width="115" height="65" rx="9" fill="#21252d" stroke="#d3a05a"/><text x="80" y="150" text-anchor="middle" class="svg-t">同一问题</text><path d="M137,145 L205,75" stroke="#788293" marker-end="url(#sca)"/><path d="M137,145 L205,145" stroke="#788293" marker-end="url(#sca)"/><path d="M137,145 L205,215" stroke="#788293" marker-end="url(#sca)"/><rect x="210" y="45" width="135" height="52" rx="8" fill="#21252d" stroke="#65a6d9"/><rect x="210" y="119" width="135" height="52" rx="8" fill="#21252d" stroke="#65a6d9"/><rect x="210" y="193" width="135" height="52" rx="8" fill="#21252d" stroke="#65a6d9"/><text x="278" y="77" text-anchor="middle" class="svg-t">路径 A → 1/2</text><text x="278" y="151" text-anchor="middle" class="svg-t">路径 B → 0.5</text><text x="278" y="225" text-anchor="middle" class="svg-t">路径 C → 2/3</text><path d="M345,72 L415,125" stroke="#788293" marker-end="url(#sca)"/><path d="M345,145 L415,145" stroke="#788293" marker-end="url(#sca)"/><path d="M345,219 L415,165" stroke="#788293" marker-end="url(#sca)"/><rect x="420" y="100" width="130" height="90" rx="9" fill="#21252d" stroke="#8b76bd"/><text x="485" y="128" text-anchor="middle" class="svg-t">规范化投票</text><text x="485" y="153" text-anchor="middle" class="svg-t" font-size="11">1/2=0.5 两票</text><text x="485" y="176" text-anchor="middle" class="svg-t" font-size="11">2/3 一票</text><path d="M550,145 L605,145" stroke="#788293" marker-end="url(#sca)"/><rect x="610" y="100" width="105" height="90" rx="9" fill="#21252d" stroke="#cf7c72"/><text x="662" y="128" text-anchor="middle" class="svg-t">验证器</text><text x="662" y="153" text-anchor="middle" class="svg-t" font-size="11">计算/检索</text><text x="662" y="176" text-anchor="middle" class="svg-t" font-size="11">测试/规则</text></svg><figcaption>图 1　等价答案要先合票；多数结果仍需独立证据，路径共享同一模型并非统计独立。</figcaption></figure>'}
    ,{title:'相关错误决定有效样本数',kind:'math',badge:'相关性',lead:'五条路径都用了同一个错误公式，投票为何没有帮助？',body:'<p>共享模型、提示、训练数据与解码前缀使错误相关。等权平均估计的方差近似为 σ²[1+(n−1)ρ]/n；ρ=0时随1/n下降，ρ=1时完全不降。</p><div class="dd-formula">n<sub>eff</sub>≈n/[1+(n−1)ρ]</div><p>n=10、ρ=0.5时有效样本数约10/5.5=1.82。可通过不同提示分解、工具、模型家族或检索证据增加机制多样性，但也要防止聚合器偏爱冗长或同源答案。</p>'}
    ,{title:'顺序采样可用票差和验证结果提前停止',kind:'eng',badge:'成本控制',lead:'怎样避免每题固定采样40次？',body:'<p>先取少量样本，规范化答案；若领先票达到预设置信边界、外部验证通过或预算耗尽就停止。阈值必须在冻结数据上按错误成本调，不能把票占比直接当概率。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>停止信号</th><th>优点</th><th>风险</th></tr></thead><tbody><tr><td>固定票差</td><td>简单</td><td>未考虑相关性</td></tr><tr><td>序贯统计界</td><td>显式误差控制</td><td>假设可能不成立</td></tr><tr><td>验证器通过</td><td>使用外部证据</td><td>验证器漏洞</td></tr><tr><td>边际收益</td><td>直接权衡成本</td><td>需在线估计</td></tr></tbody></table></div>'}
    ,{title:'常见误区与学习路线',badge:'误区与依赖',lead:'自洽性是搜索与聚合策略，不是事实证明。',body:'<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>误区</th><th>更准确的理解</th></tr></thead><tbody><tr><td>样本越多一定越准</td><td>需要单路径优于随机且错误不完全相关</td></tr><tr><td>温度越高越多样越好</td><td>过高会降低单路径质量</td></tr><tr><td>多数答案就是事实</td><td>共享偏差可形成一致错误</td></tr><tr><td>字符串相同才能合票</td><td>需任务可靠的等价规范化</td></tr><tr><td>8/10票就是80%置信</td><td>票率需任务级校准</td></tr></tbody></table></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>依赖与延伸</th></tr></thead><tbody><tr><td>先修</td><td>采样参数、概率、思维链</td></tr><tr><td><b>本页核心</b></td><td>多数投票、错误相关、规范化、停止</td></tr><tr><td>增强</td><td>测试时计算、验证器、工具调用</td></tr><tr><td>评测</td><td>质量—成本曲线、校准、切片</td></tr></tbody></table></div><div class="dd-note warn"><b>不要把内部推理文本当独立证据。</b>优先验证最终答案和可检查的外部产物。</div>'}
    ,{title:'端到端案例：不是“十次生成”，而是一条可审计的搜索流程',kind:'eng',badge:'案例推演',lead:'一道药物剂量换算题如何在质量、风险与成本之间逐步决策？',body:'<p><b>第1步，定义答案空间。</b>要求最终输出“数值+单位”，先把 mg、g 和每日/每次剂量做单位规范化；缺少体重等必要变量时直接归为“信息不足”，不能让聚合器硬投票。<b>第2步，生成首批3条路径。</b>使用适度温度并要求每条路径给出可执行的算式，但聚合只读取最终结构化答案，不把冗长推理当额外票权。</p><p><b>第3步，合票与验证。</b>若两条为20 mg、一条为200 mg，票差看似足够，但剂量任务错误成本高，仍调用单位检查器和范围规则。若20 mg通过，输出答案并附计算依据；若验证失败，再采样2条采用不同分解提示的路径，而不是复制同一种解法。<b>第4步，停止。</b>到达5条仍无验证通过的共识，就拒绝自动回答并转专家。这样，样本数、提示、规范化、验证与停止原因都能写入追踪记录。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>阶段</th><th>可观测量</th><th>失败时动作</th></tr></thead><tbody><tr><td>采样</td><td>独特答案数、无效率</td><td>调整温度或约束格式</td></tr><tr><td>规范化</td><td>解析失败、单位冲突</td><td>澄清输入或拒答</td></tr><tr><td>聚合</td><td>票差、有效样本数</td><td>增加机制多样性</td></tr><tr><td>验证</td><td>规则/工具通过率</td><td>转人工而非继续投票</td></tr></tbody></table></div>'}
    ,{title:'怎样评测：必须同时报告单样本、聚合结果与预算',kind:'eng',badge:'实验设计',lead:'只报告“自一致准确率提高3%”为什么无法判断是否值得上线？',body:'<p>基线至少包含贪心单次、同温度单次、固定样本多数票和带验证器的序贯策略。对每种策略报告任务准确率、平均与P95调用次数、token成本、延迟以及拒答率；同时画质量—成本曲线。否则，40倍推理换来的小幅增益可能被误读为算法优势。</p><p>评测集还要按“可规范化答案、开放回答、验证器可用性、题目难度”切片。记录每条路径的最终答案、规范化簇、验证结果和停止原因，才能区分失败来自生成器、聚合器还是验证器。为避免调参泄漏，温度、样本上限和停止边界在开发集选择后冻结，只在独立测试集报告一次。</p><div class="dd-note"><b>关键消融：</b>保持总token预算近似不变，比较“更多短路径”“更少长路径”“不同模型路径”和“同模型重复路径”。它能回答真正的问题：收益来自计算量、路径多样性，还是验证器。</div>'}
  ],
  chain:['同题随机采样多条路径','保留适度多样性','抽取并规范化最终答案','多数或加权聚合','外部验证共识','按边际收益提前停止'],
  quiz:[{q:'自洽性依赖什么假设？',a:'正确答案较常出现且错误不完全相关。'},{q:'温度为零的问题？',a:'路径缺乏多样性。'},{q:'开放答案如何投票？',a:'先做可靠的语义/规则规范化。'},{q:'共识为何会错？',a:'共享偏差和系统性推理错误。'},{q:'如何控成本？',a:'渐进采样、置信停止和只用于适合任务。'}],
  sources:[{title:'Chain-of-Thought Prompting',url:'https://arxiv.org/abs/2201.11903',note:'思维链基础'},{title:'Self-Consistency Improves Chain of Thought Reasoning',url:'https://arxiv.org/abs/2203.11171',note:'自洽投票'},{title:'Training Verifiers to Solve Math Word Problems',url:'https://arxiv.org/abs/2110.14168',note:'多候选与验证器'}]
});

// 新版教学门禁补充：逐节说明采样、规范化、相关错误、验证、停止与评测边界。
{
  const page = window.DEEPDIVE['self-consistency'];
  const additions = [
    '<p>自洽性输入同一个可多路径求解的问题、采样配置和聚合规则，输出多条推理路径、规范化答案簇与聚合结果。它利用早期分支的随机差异，让较常出现的正确路径有机会在投票中胜出；解决的是单路径偶然错误。若多数路径共享同一偏差，投票仍会错；自洽性不能修复所有路径共同相信的错误前提。</p>',
    '<p>概率直觉输入单路径正确率 p、奇数样本数 n 和路径独立性，输出多数票正确概率。只有 p 大于 0.5 且错误近似独立时，增加 n 才通常提高多数正确率；p 小于 0.5 会强化错误，相关性高则收益饱和。该结论描述理想化投票，不等于事实正确保证。</p>',
    '<p>采样多样性输入温度、top-p、样本上限、单路径有效率和答案多样性，输出一组质量可用且机制不同的候选。温度为零常重复同一路径，过高会生成无效步骤；在开发集联合调节温度与样本数，并监控独特答案和解析失败。多样性是为了减少相关错误，不是越随机越好。</p>',
    '<p>答案规范化输入每条路径的最终结构化答案、单位、数值形式和任务等价规则，输出可投票的等价簇及解析失败。数学式化简、单位换算、固定标签或受控语义聚类后再计票；1/2、0.5、50% 应合为同簇。规范化簇决定每种答案最终获得多少票。规范化过细会拆票，过粗会把不同答案合并。</p>',
    '<p>共识解释输入票数、路径来源、外部证据、模型与提示多样性，输出共识强度和是否需要验证或拒答。多数只说明同一采样过程偏好某答案，不说明它符合世界事实；共享训练偏差会形成稳定错误。高影响结论应由计算器、检索、测试或独立规则验证。</p>',
    '<p>成本停止输入当前票差、有效样本数、验证结果、剩余预算、任务价值和错误成本，输出继续采样、停止回答、拒答或转人工。逐批采样并在验证通过、统计边界满足或边际收益低于成本时停止；不必每题固定采四十次。票占比未经校准，8/10 不能直接解释成 80% 正确率。</p>',
    '<p>五票手算输入独立单路径正确率 p=0.6，输出五条中至少三条正确的多数概率 Pmajority。按恰好三、四、五条正确的二项项相加，得到 0.3456+0.2592+0.07776=0.68256；即从 60% 提升到约 68.3%。p=0.4 时会降到约 31.7%，说明采样不是必然增益。</p>',
    '<p>流程图输入同一问题的多条路径、答案规范化器、投票器和外部验证器，输出最终答案、验证状态与各阶段追踪。先抽取最终答案，再把 1/2 与 0.5 合票，最后用计算检索测试规则检查多数结果；内部推理文本不增加票权。图展示的是可审计搜索流程，不是十个独立证人。</p>',
    '<p>相关性分析输入名义样本数 n、路径错误相关系数 ρ 和单路径方差，输出有效样本数 neff。近似式 neff=n/[1+(n−1)ρ]；n=10、ρ=0.5 时只有约 1.82 个独立样本的效果。不同提示、工具、模型家族和证据可增加机制多样性，但相关系数只是近似摘要。</p>',
    '<p>顺序采样输入当前规范化票数、相关性估计、外部验证、冻结停止边界和预算，输出继续、停止、验证或升级。先取少量样本，再按票差、序贯统计界、验证器结果或边际收益判断；所有阈值在开发集按错误成本确定后冻结。未满足假设时，固定票差不能提供误差保证。</p>',
    '<p>误区辨析输入“样本越多越准、温度越高越好、多数即事实、字符串投票、票率即置信”等主张，输出其缺失的 p、相关性、规范化、验证和校准条件。逐项回到适用假设，防止把搜索聚合策略说成事实证明。该表不能替代当前任务的质量成本实验。</p>',
    '<p>剂量案例输入数值单位问题、必要变量、首批三条路径、单位规则、范围检查和最多五条预算，输出结构化答案、验证结果或专家升级。先规范 mg/g 和每次每日，缺变量直接信息不足；20mg 两票也必须过单位与范围验证，失败后换分解再采两条。五条仍无验证共识就停止并转专家。</p>',
    '<p>策略评测输入贪心单次、同温度单次、固定多数和带验证的序贯策略，以及冻结测试集，输出准确率、P95 调用数、token、延迟、拒答和质量成本曲线。按答案可规范性、验证器可用性和难度切片，记录每条路径、簇、验证和停止原因。调参只在开发集完成，独立测试集只报告一次。</p>'
  ];
  const renderedSections = page.html.split("</section>");
  additions.forEach((html, index) => { renderedSections[index] += html; });
  page.html = renderedSections.join("</section>");
  const formulas = [
    '<div class="dd-formula"><math display="block" aria-label="五条路径多数正确概率"><mi>Pmajority</mi><mo>=</mo><mn>10</mn><msup><mi>p</mi><mn>3</mn></msup><msup><mrow><mo>(</mo><mn>1</mn><mo>−</mo><mi>p</mi><mo>)</mo></mrow><mn>2</mn></msup><mo>+</mo><mn>5</mn><msup><mi>p</mi><mn>4</mn></msup><mo>(</mo><mn>1</mn><mo>−</mo><mi>p</mi><mo>)</mo><mo>+</mo><msup><mi>p</mi><mn>5</mn></msup></math></div>',
    '<div class="dd-formula"><math display="block" aria-label="相关路径的有效样本数"><mi>neff</mi><mo>≈</mo><mfrac><mi>n</mi><mrow><mn>1</mn><mo>+</mo><mo>(</mo><mi>n</mi><mo>−</mo><mn>1</mn><mo>)</mo><mi>ρ</mi></mrow></mfrac></math></div>'
  ];
  let formulaIndex = 0;
  page.html = page.html.replace(/<div class="dd-formula">[\s\S]*?<\/div>/g, () => formulas[formulaIndex++]);
}
