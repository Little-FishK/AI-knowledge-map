window.DEEPDIVE['logprobs'] = window.createDeepDive({
  title:'Logprobs 与置信度：模型偏好不等于答案可信', subtitle:'从 token 对数概率、序列似然、校准和选择性预测理解何时 logprob 有用，以及分词与语义等价如何误导阈值。',
  thesis:'logprob 是模型对某个 token 在当前上下文中的对数概率，可用于排序与诊断；它衡量<b>模型内部相对偏好</b>，不是事实正确率，必须经过任务级校准才能当置信信号。',
  goals:['解释为何使用对数','计算序列 logprob','识别长度与分词偏差','设计校准与拒答阈值'],
  sections:[
    {title:'概率为什么取对数',kind:'math',badge:'数学',lead:'连乘很多小概率为何要改成求和？',body:'<div class="dd-formula">log P(x₁…xₙ)=Σₜ log P(xₜ|x&lt;t)</div><p>对数把连乘变求和，避免浮点下溢；logprob 越接近 0，token 概率越高。</p>'},
    {title:'token 分数不等于答案分数',badge:'粒度',lead:'一句答案的置信度如何从多个 token 得到？',body:'<p>总和偏爱短序列，平均值又可能掩盖一个关键低概率 token。分类最好比较受控标签的完整 token 序列；自由文本还存在多个语义等价表达。</p>'},
    {title:'高概率也会自信地错',badge:'边界',lead:'模型熟练复述错误信息时 logprob 会怎样？',body:'<p>训练数据中的常见说法、提示暗示和语言流畅度都会提高概率，即使事实错误。反之，正确但罕见的名字可能低概率。因此 logprob 不是事实验证器。</p>'},
    {title:'校准把分数映射到频率',kind:'math',badge:'校准',lead:'“置信 0.8”应满足什么经验含义？',body:'<p>在一组预测中，声称 0.8 的样本应约有 80% 正确。温度缩放、等距回归等可在独立校准集拟合映射；模型、提示或分布变化后需重校准。</p>'},
    {title:'选择性预测',kind:'eng',badge:'工程',lead:'低置信时系统应该做什么？',body:'<p>低于阈值可补检索、升级模型、请求澄清或转人工。阈值按错误代价与覆盖率选择：拒答越多通常风险更低，但产品可用性下降。</p>'},
    {title:'分词与接口陷阱',kind:'eng',badge:'实现',lead:'为什么比较“是”和“否”不能只读一个 token？',body:'<p>标签可能包含空格或被拆成多 token，候选也可能共享前缀。必须用实际 tokenizer 汇总完整序列，并确认 API 返回的是所需位置和候选集合。</p><div class="dd-note warn"><b>跨模型 logprob 不宜直接比较。</b>　词表、分词和训练分布不同。</div>'}
    ,{title:'完整手算：概率、logprob 与序列分数怎样互换',kind:'math',badge:'逐步演算',lead:'两个token概率0.8和0.25组成的答案有多大联合概率？',body:'<p>自回归条件概率相乘：P=0.8×0.25=<b>0.20</b>。自然对数分别是 log0.8≈−0.223、log0.25≈−1.386，总 logprob≈<b>−1.609</b>，再取exp恢复0.20。平均logprob为−0.805，对应几何平均概率exp(−0.805)≈0.447。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>聚合</th><th>数值</th><th>偏好</th></tr></thead><tbody><tr><td>总logprob</td><td>−1.609</td><td>短序列</td></tr><tr><td>平均logprob</td><td>−0.805</td><td>平均流畅，但可掩盖关键低点</td></tr><tr><td>最小token logprob</td><td>−1.386</td><td>暴露最弱位置，噪声大</td></tr></tbody></table></div><p>比较候选时必须先定义任务单位；标签分类与自由文本不能共用一个未经验证的聚合公式。</p>'}
    ,{title:'原创图：token信号必须经过任务校准才能触发行动',badge:'可视化',lead:'API返回的局部概率怎样变成可用的系统决策？',body:'<figure class="dd-fig"><svg viewBox="0 0 735 285" role="img" aria-label="token logprob经过序列聚合任务校准和风险阈值形成系统动作"><defs><marker id="lpa" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#788293"/></marker></defs><rect x="20" y="95" width="125" height="72" rx="9" fill="#21252d" stroke="#65a6d9"/><text x="82" y="122" text-anchor="middle" class="svg-t">token logprobs</text><text x="82" y="147" text-anchor="middle" class="svg-t" font-size="11">分词/上下文条件</text><path d="M145,131 L195,131" stroke="#788293" marker-end="url(#lpa)"/><rect x="200" y="95" width="125" height="72" rx="9" fill="#21252d" stroke="#8b76bd"/><text x="262" y="122" text-anchor="middle" class="svg-t">任务聚合</text><text x="262" y="147" text-anchor="middle" class="svg-t" font-size="11">标签序列/语义簇</text><path d="M325,131 L375,131" stroke="#788293" marker-end="url(#lpa)"/><rect x="380" y="95" width="125" height="72" rx="9" fill="#21252d" stroke="#d3a05a"/><text x="442" y="122" text-anchor="middle" class="svg-t">独立校准</text><text x="442" y="147" text-anchor="middle" class="svg-t" font-size="11">分数→经验正确率</text><path d="M505,131 L555,131" stroke="#788293" marker-end="url(#lpa)"/><rect x="560" y="65" width="150" height="132" rx="9" fill="#21252d" stroke="#cf7c72"/><text x="635" y="94" text-anchor="middle" class="svg-t">风险策略</text><text x="635" y="122" text-anchor="middle" class="svg-t" font-size="11">自动回答</text><text x="635" y="147" text-anchor="middle" class="svg-t" font-size="11">检索/升级</text><text x="635" y="172" text-anchor="middle" class="svg-t" font-size="11">拒答/转人工</text><text x="367" y="245" text-anchor="middle" class="svg-t">模型或分布变化 → 重新校准整条链</text></svg><figcaption>图 1　logprob只是原始信号；聚合、校准和成本阈值共同决定可执行动作。</figcaption></figure>'}
    ,{title:'候选标签必须比较完整序列概率',kind:'math',badge:'分词陷阱',lead:'“Yes”是一个token，“No answer”是两个token，怎样公平比较？',body:'<p>对每个候选，把共同提示固定，teacher-force整段标签并累加条件logprob。不能只读首token，因为候选可能共享前缀，也不能把API top-k之外的候选当概率0。若任务允许不同长度表达，应规定规范标签或用长度校正并在验证集确认。</p><div class="dd-formula">score(c)=Σ<sub>t=1…|c|</sub>log p(cₜ|prompt,c&lt;ₜ)</div><p>不同tokenizer会改变分段、序列长度和归一化空间，因此跨模型原始分数没有共同刻度。做模型路由时应分别校准，再比较预期风险，而非直接比较平均logprob。</p>'}
    ,{title:'语义不确定性要先合并等价表达',kind:'eng',badge:'自由文本',lead:'“巴黎”“Paris”“法国首都巴黎”该算三种答案吗？',body:'<p>对自由生成，多次采样的token序列概率分散到大量同义表述。可先用规则、执行结果或语义蕴含把答案聚成意义簇，再累加簇概率；聚类器自身会误合并/误拆分，必须标注验证。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>任务</th><th>等价判定</th><th>风险</th></tr></thead><tbody><tr><td>数学</td><td>解析并代数化简</td><td>格式/单位</td></tr><tr><td>代码</td><td>测试行为</td><td>测试不完备</td></tr><tr><td>事实问答</td><td>实体规范化/蕴含</td><td>别名与细节丢失</td></tr><tr><td>开放建议</td><td>语义聚类</td><td>边界主观</td></tr></tbody></table></div>'}
    ,{title:'常见误区与学习路线',badge:'误区与依赖',lead:'高概率描述模型熟悉度，不自动描述世界真相。',body:'<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>误区</th><th>更准确的理解</th></tr></thead><tbody><tr><td>logprob高就是事实正确</td><td>只表示当前模型偏好</td></tr><tr><td>平均token概率就是答案正确率</td><td>需任务级标签与校准</td></tr><tr><td>比较首token足够</td><td>候选可能多token或共享前缀</td></tr><tr><td>8/10一致等于80%可靠</td><td>采样相关且需经验校准</td></tr><tr><td>阈值一次设定长期有效</td><td>提示、模型和分布变化会失准</td></tr></tbody></table></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>依赖与延伸</th></tr></thead><tbody><tr><td>先修</td><td>概率、对数、tokenization、softmax</td></tr><tr><td><b>本页核心</b></td><td>序列分数、语义聚合、校准、选择性预测</td></tr><tr><td>相邻</td><td>不确定性校准、自一致性、模型路由</td></tr><tr><td>工程</td><td>API候选覆盖、阈值、漂移监控</td></tr></tbody></table></div><div class="dd-note warn"><b>不要把内部概率展示成未经证实的“可信度”。</b>高影响场景要用独立数据校准并提供安全回退。</div>'}
    ,{title:'从分数到行动：覆盖率—风险曲线比单一阈值更重要',kind:'eng',badge:'选择性预测',lead:'把阈值从−1.2提高到−0.5，系统究竟会变安全还是只是更少回答？',body:'<p>在验证集上按校准分数从高到低排序，逐步扩大自动回答集合。每个覆盖率点都计算已回答样本中的错误率：这形成覆盖率—风险曲线。阈值升高通常降低覆盖率，但风险未必单调下降；若高分区域恰好包含模板化幻觉，曲线会暴露校准失败。产品决策应比较期望成本，而不是只追求一个漂亮的准确率。</p><div class="dd-formula">E[cost(τ)] = C<sub>err</sub>·P(错误且接收) + C<sub>abstain</sub>·P(拒答) + C<sub>verify</sub>·P(升级验证)</div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>切片</th><th>为何单独画曲线</th><th>建议动作</th></tr></thead><tbody><tr><td>短答案 / 长答案</td><td>长度改变聚合分数</td><td>分别归一化与校准</td></tr><tr><td>常见域 / 新域</td><td>分布漂移导致过度自信</td><td>新域先检索或转人工</td></tr><tr><td>低损失 / 高损失错误</td><td>相同错误率的业务代价不同</td><td>采用不同阈值</td></tr><tr><td>模型或提示版本</td><td>分数刻度可能整体移动</td><td>版本级回放与重校准</td></tr></tbody></table></div><p>上线后还要记录分数、动作、最终标签和切片；只监控平均logprob无法发现某一语言、任务或答案长度上的局部失准。若真实标签延迟到达，可先监控分数分布与拒答率漂移，但它们只能触发调查，不能代替正确率回流。</p>'}
  ],
  chain:['模型输出 token 概率','对数使序列分数可加','长度与分词影响聚合','独立数据映射到正确频率','阈值换取覆盖与风险','分布变化后持续重校准'],
  quiz:[{q:'logprob 为何通常是负数？',a:'概率在 0 到 1，对数不大于 0。'},{q:'总序列分数为何偏短？',a:'每个负 logprob 相加会随长度降低。'},{q:'高 logprob 证明事实正确吗？',a:'不能，只表示模型更偏好。'},{q:'校准 0.8 的含义？',a:'该分桶长期约 80% 正确。'},{q:'阈值提高的代价？',a:'拒答/升级增加，覆盖率下降。'}],
  sources:[{title:'On Calibration of Modern Neural Networks',url:'https://arxiv.org/abs/1706.04599',note:'温度缩放与校准'},{title:'Selective Classification for Deep Neural Networks',url:'https://arxiv.org/abs/1705.08500',note:'覆盖-风险权衡'},{title:'Semantic Uncertainty',url:'https://arxiv.org/abs/2302.09664',note:'语义等价答案下的不确定性'}]
});

window.DEEPDIVE['logprobs'].html = window.DEEPDIVE['logprobs'].html
  .replace(
    '<div class="dd-formula">log P(x₁…xₙ)=Σₜ log P(xₜ|x&lt;t)</div>',
    '<div class="dd-formula" data-formula-id="logprobs-sequence"><math display="block" aria-label="序列 x 一到 x n 的对数概率等于各位置 t 的条件对数概率之和"><mrow><mi>log</mi><mi>P</mi><mo>(</mo><msub><mi>x</mi><mn>1</mn></msub><mo>…</mo><msub><mi>x</mi><mi>n</mi></msub><mo>)</mo><mo>=</mo><munder><mo>∑</mo><mi>t</mi></munder><mi>log</mi><mi>P</mi><mo>(</mo><msub><mi>x</mi><mi>t</mi></msub><mo>∣</mo><msub><mi>x</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo>)</mo></mrow></math></div><p class="dd-formula-note"><code>P</code> 表示模型给事件分配的概率，<code>log</code> 是自然对数，<code>xₜ</code> 是位置 t 的 token，<code>x&lt;t</code> 是它之前的前缀，<code>n</code> 是序列 token 总数，<code>t</code> 是求和位置索引。每项都不大于 0，所以总 logprob 越接近 0，模型对整段序列的相对偏好越高。</p>'
  )
  .replace(
    '<div class="dd-formula">score(c)=Σ<sub>t=1…|c|</sub>log p(cₜ|prompt,c&lt;ₜ)</div>',
    '<div class="dd-formula" data-formula-id="logprobs-candidate-score"><math display="block" aria-label="候选 c 的分数等于从 t 等于一到候选长度的每个 token 条件对数概率之和"><mrow><mi>score</mi><mo>(</mo><mi>c</mi><mo>)</mo><mo>=</mo><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mrow><mo>|</mo><mi>c</mi><mo>|</mo></mrow></munderover><mi>log</mi><mi>p</mi><mo>(</mo><msub><mi>c</mi><mi>t</mi></msub><mo>∣</mo><mi>prompt</mi><mo>,</mo><msub><mi>c</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo>)</mo></mrow></math></div><p class="dd-formula-note"><code>c</code> 是一个完整候选标签，<code>|c|</code> 是它的 token 数，<code>cₜ</code> 是第 t 个候选 token，<code>c&lt;t</code> 是候选已给出的前缀，<code>prompt</code> 是所有候选共用的提示，<code>p</code> 是当前条件下的 token 概率，<code>score(c)</code> 是整段候选的总 logprob。</p>'
  )
  .replace(
    '<div class="dd-formula">E[cost(τ)] = C<sub>err</sub>·P(错误且接收) + C<sub>abstain</sub>·P(拒答) + C<sub>verify</sub>·P(升级验证)</div>',
    '<div class="dd-formula" data-formula-id="logprobs-expected-cost"><math display="block" aria-label="阈值 tau 下的期望成本等于错误接收成本乘错误且接收概率，加拒答成本乘拒答概率，加升级验证成本乘升级验证概率"><mrow><mi>E</mi><mo>[</mo><mi>cost</mi><mo>(</mo><mi>τ</mi><mo>)</mo><mo>]</mo><mo>=</mo><msub><mi>C</mi><mi>err</mi></msub><mi>P</mi><mo>(</mo><mtext>错误且接收</mtext><mo>)</mo><mo>+</mo><msub><mi>C</mi><mi>abstain</mi></msub><mi>P</mi><mo>(</mo><mtext>拒答</mtext><mo>)</mo><mo>+</mo><msub><mi>C</mi><mi>verify</mi></msub><mi>P</mi><mo>(</mo><mtext>升级验证</mtext><mo>)</mo></mrow></math></div><p class="dd-formula-note"><code>E[cost(τ)]</code> 是阈值 τ 下的平均业务成本；<code>τ</code> 是自动接收阈值；<code>Cerr</code>、<code>Cabstain</code>、<code>Cverify</code> 分别是错误接收、拒答和升级验证一次的代价；<code>P</code> 是验证集上对应动作事件的经验概率。各项必须使用同一评测周期与任务切片。</p>'
  )
  .replace(
    '<p class="dd-lead">连乘很多小概率为何要改成求和？</p>',
    '<p class="dd-lead">连乘很多小概率为何要改成求和？</p><p>序列 logprob 的输入是每个位置在既定前缀下的 token 概率，输出是整段候选可相加比较的对数分数。对数把条件概率连乘变成求和并缓解下溢；分数越高只表示模型越偏好该 token 序列，不能推出事实更正确。</p>'
  )
  .replace(
    '<p class="dd-lead">一句答案的置信度如何从多个 token 得到？</p>',
    '<p class="dd-lead">一句答案的置信度如何从多个 token 得到？</p><p>答案聚合接收多个 token logprob，输出总和、平均值、最弱位置或任务自定义分数。总和随长度下降，平均值可能掩盖关键低概率 token；因此先定义任务单位和候选规范，再用验证集选择聚合方式。自由文本存在同义表达时，单一字符串分数边界尤其明显。</p>'
  )
  .replace(
    '<p class="dd-lead">模型熟练复述错误信息时 logprob 会怎样？</p>',
    '<p class="dd-lead">模型熟练复述错误信息时 logprob 会怎样？</p><p>事实诊断输入是模型高分回答与独立证据，输出是语言偏好和事实正确性的分别判断。训练频率、提示暗示和流畅模式都能提高 logprob，即使命题错误；罕见但正确的名字又可能低分。因此必须用检索、工具或人工证据验证世界事实。</p>'
  )
  .replace(
    '<p class="dd-lead">“置信 0.8”应满足什么经验含义？</p>',
    '<p class="dd-lead">“置信 0.8”应满足什么经验含义？</p><p>校准接收原始分数和独立数据上的真实标签，输出分数到经验正确率的映射。把相近分数分桶后，标为 0.8 的桶应长期约八成正确；这只在目标任务和分布上成立，模型、提示或输入分布变化后必须重新校准。</p>'
  )
  .replace(
    '<p class="dd-lead">低置信时系统应该做什么？</p>',
    '<p class="dd-lead">低置信时系统应该做什么？</p><p>选择性预测输入校准分数、错误代价和覆盖要求，输出自动回答、补检索、升级、澄清或拒答动作。阈值把更多低分样本交给安全回退，通常降低覆盖；是否值得必须用风险—覆盖曲线和业务成本判断，而非只看准确率。</p>'
  )
  .replace(
    '<p class="dd-lead">为什么比较“是”和“否”不能只读一个 token？</p>',
    '<p class="dd-lead">为什么比较“是”和“否”不能只读一个 token？</p><p>接口核验输入实际 tokenizer、候选完整文本和 API 返回位置，输出每个规范标签的完整序列分数。空格、共享前缀与多 token 切分都会改变可比范围；top-k 未返回不等于概率为零，跨模型原始 logprob 也没有共同刻度。</p>'
  )
  .replace(
    '<p class="dd-lead">两个token概率0.8和0.25组成的答案有多大联合概率？</p>',
    '<p class="dd-lead">两个token概率0.8和0.25组成的答案有多大联合概率？</p><p>手算输入两个条件概率，输出联合概率、总 logprob、平均 logprob 和几何平均概率。先相乘得 0.20，再分别取对数相加得 −1.609；这些数值描述同一序列偏好，但不同聚合偏好不同长度，不能混作答案正确率。</p>'
  )
  .replace(
    '<p class="dd-lead">API返回的局部概率怎样变成可用的系统决策？</p>',
    '<p class="dd-lead">API返回的局部概率怎样变成可用的系统决策？</p><p>决策链输入 token logprobs、任务单位、校准数据与业务代价，输出可审计的自动回答或回退动作。它依次做序列或语义聚合、独立校准和风险阈值决策；任何一层变化都要重放全链，不能把原始局部概率直接展示成可信度。</p>'
  )
  .replace(
    '<p class="dd-lead">“Yes”是一个token，“No answer”是两个token，怎样公平比较？</p>',
    '<p class="dd-lead">“Yes”是一个token，“No answer”是两个token，怎样公平比较？</p><p>候选比较输入共同提示和多个完整标签，输出各标签整段条件 logprob。用 teacher forcing 逐 token 累加，并按预先规定的标签与长度规则比较；tokenizer 改变后需重新计算，跨模型应先分别校准再比较预期风险。</p>'
  )
  .replace(
    '<p class="dd-lead">“巴黎”“Paris”“法国首都巴黎”该算三种答案吗？</p>',
    '<p class="dd-lead">“巴黎”“Paris”“法国首都巴黎”该算三种答案吗？</p><p>语义聚合输入多次生成的字符串与任务等价判定器，输出意义簇及每簇累计概率。规则、执行结果或语义蕴含把等价表达合并后，簇间分布才更接近任务不确定性；聚类器会误合并或误拆分，必须用人工标注验证。</p>'
  )
  .replace(
    '<p class="dd-lead">把阈值从−1.2提高到−0.5，系统究竟会变安全还是只是更少回答？</p>',
    '<p class="dd-lead">把阈值从−1.2提高到−0.5，系统究竟会变安全还是只是更少回答？</p><p>覆盖率—风险分析输入验证集校准分数、真实标签与动作成本，输出每个阈值的覆盖率、已接收错误率和期望成本。按分数排序逐步扩大自动集合即可画曲线；阈值升高若只降低覆盖却不降低风险，说明分数排序或校准在该切片失效。</p>'
  );
