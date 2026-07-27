window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["sampling-params"] = {
  title: "采样与解码参数：从 logits 到最终序列",
  subtitle: "用一组可手算的候选分布串起 temperature、top-k、top-p、重复惩罚、停止条件与随机种子，理解每个旋钮改变哪一步、不能保证什么。",
  thesis: "语言模型每一步只给出条件 logits；解码器把它们变形、过滤、归一化并选择一个 token，再把选择反馈成下一步上下文。温度改变相对概率，top-k/top-p 改变候选支持集，惩罚依赖历史，停止规则决定边界。它们只能在模型已有偏好上重新分配选择，<b>低随机性不等于真实性，高多样性也不等于创造力</b>。",
  html: `
<div class="dd-goals"><div class="dd-goals-h">读完这一页，你应该能自己回答：</div><ul><li>logit、概率、贪心与采样之间是什么关系？</li><li>温度为什么不改变候选排名，却会改变 top-p 集合大小？</li><li>top-k 和 top-p 各在什么分布形状下过严或过松？</li><li>重复惩罚、停止串和最大长度分别改变哪一环？</li><li>怎样为抽取、代码、创作和评测选择并验证解码策略？</li></ul></div>
<div class="dd-note key"><b>不要把参数名当统一标准。</b>不同服务对 temperature=0、top-p 与 top-k 的先后、penalty 公式、seed 和停止串有不同实现。可靠配置必须记录完整解码管线、模型版本和服务端默认值，而不只是几个数字。</div>

<section class="dd-sec"><h2><span class="dd-n">1</span>生成是一条反复闭环，不是一次分类<span class="dd-badge intuition">全景</span></h2><p class="dd-lead">第一个 token 的一次随机差异，为什么会改写后面整段回答？</p>
<figure class="dd-fig"><svg viewBox="0 0 780 285" role="img" aria-label="自回归生成从 logits 变形、过滤、采样并反馈上下文的循环"><defs><marker id="sam-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker></defs><g fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#sam-a)"><path d="M140 120H200M320 120H380M500 120H560M680 120H735"/><path d="M700 150C700 245 95 245 95 150"/></g><g stroke="currentColor" stroke-width="2"><rect x="20" y="80" width="120" height="80" rx="12" fill="#8b5cf6" opacity=".2"/><rect x="200" y="80" width="120" height="80" rx="12" fill="#0ea5e9" opacity=".2"/><rect x="380" y="80" width="120" height="80" rx="12" fill="#f59e0b" opacity=".2"/><rect x="560" y="80" width="120" height="80" rx="12" fill="#10b981" opacity=".2"/><rect x="735" y="80" width="35" height="80" rx="10" fill="#ef4444" opacity=".2"/></g><g class="svg-t" text-anchor="middle"><text x="80" y="112">模型输出</text><text x="80" y="140">全词表 logits</text><text x="260" y="112">温度/惩罚</text><text x="260" y="140">修改分数</text><text x="440" y="112">top-k/top-p</text><text x="440" y="140">过滤候选</text><text x="620" y="112">归一化并</text><text x="620" y="140">选择 token</text><text x="752" y="112">停?</text><text x="385" y="265">未停止：把 token 追加到上下文，重新计算下一步分布</text></g></svg><figcaption>每一步的选择都会成为下一步条件，因此序列概率是沿路径的条件概率乘积；局部“第二名”可能打开完全不同的后续分支。</figcaption></figure></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>logits 只是相对分数，softmax 才给概率<span class="dd-badge math">基础</span></h2><p class="dd-lead">给所有 logits 同时加 100，概率为什么不变？</p><div class="dd-formula" data-formula-id="sampling-softmax"><math display="block" aria-label="候选 i 的概率 p i 等于 e 的 z i 次方除以所有候选 j 的 e 的 z j 次方之和，也等于所有 logit 同减常数 c 后的对应比值"><mrow><msub><mi>p</mi><mi>i</mi></msub><mo>=</mo><mfrac><msup><mi>e</mi><msub><mi>z</mi><mi>i</mi></msub></msup><munder><mo>∑</mo><mi>j</mi></munder><msup><mi>e</mi><msub><mi>z</mi><mi>j</mi></msub></msup></mfrac><mo>=</mo><mfrac><msup><mi>e</mi><mrow><msub><mi>z</mi><mi>i</mi></msub><mo>−</mo><mi>c</mi></mrow></msup><munder><mo>∑</mo><mi>j</mi></munder><msup><mi>e</mi><mrow><msub><mi>z</mi><mi>j</mi></msub><mo>−</mo><mi>c</mi></mrow></msup></mfrac></mrow></math></div><p class="dd-formula-note"><code>zᵢ</code> 是候选 token i 的原始 logit，<code>pᵢ</code> 是 softmax 后抽到该候选的概率，<code>j</code> 遍历词表中的全部候选，<code>c</code> 是同时从所有 logits 减去的常数，通常取最大 logit 以避免指数溢出。分子分母同乘相同因子后比值不变，所以平移全部 logits 不改变概率。</p><p>softmax 只依赖 logit 差。数值实现通常减去最大 logit 再指数化，避免溢出。概率是“在当前提示与已生成前缀下，模型相对偏好哪个 token”的度量，不是事实正确率，也不等于完整答案的置信度。</p><p>贪心解码选择最大 logit；随机采样按归一化概率抽取。若分布为 [0.7,0.2,0.1]，采样很多次的频率趋近该比例，但单次完全可能选择 0.1 的候选。</p></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>手算温度：同一排名怎样变尖或变平<span class="dd-badge math">数值例子</span></h2><p class="dd-lead">对 logits [2,1,0]，温度从 0.5 调到 2 会发生什么？</p><div class="dd-formula" data-formula-id="sampling-temperature"><math display="block" aria-label="温度 T 下候选 i 的概率 p i 等于 z i 除以 T 后的 softmax"><mrow><msub><mi>p</mi><mi>i</mi></msub><mo>(</mo><mi>T</mi><mo>)</mo><mo>=</mo><mi>softmax</mi><mo>(</mo><mfrac><msub><mi>z</mi><mi>i</mi></msub><mi>T</mi></mfrac><mo>)</mo></mrow></math></div><p class="dd-formula-note"><code>T</code> 是大于 0 的温度，<code>zᵢ</code> 是候选 i 的 logit，<code>pᵢ(T)</code> 是缩放后候选 i 的抽样概率。小 T 放大 logit 差使分布变尖，大 T 缩小差异使分布变平；正温度不会改变候选排序。</p>
<table class="dd-table"><thead><tr><th>温度 T</th><th>缩放后 logits</th><th>softmax 概率（约）</th><th>分布形状</th></tr></thead><tbody><tr><td>0.5</td><td>[4,2,0]</td><td>[0.867,0.117,0.016]</td><td>很尖，第一名占主导</td></tr><tr><td>1</td><td>[2,1,0]</td><td>[0.665,0.245,0.090]</td><td>原始相对差异</td></tr><tr><td>2</td><td>[1,0.5,0]</td><td>[0.506,0.307,0.186]</td><td>更平，尾部更容易被选</td></tr></tbody></table>
<p>正温度除法不改变 logit 排名，所以纯 top-k 的成员不变；但概率累计速度改变，top-p 的集合可能改变。T→0 的数学表达不可直接除零，服务通常把 temperature=0 特判为贪心或采用自己的最小值。</p></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>top-k：固定候选数，不看概率间隔<span class="dd-badge math">截断</span></h2><p class="dd-lead">保留前 3 名，在模型极确定与极犹豫时为什么不是同一强度？</p><p>top-k 把排名 k 之后的 logits 设为负无穷，再对剩余候选归一化。它容易解释、计算稳定，但候选数量与分布形状脱钩：若第一名概率 0.99，仍保留 k−1 个极弱项；若前 100 个几乎均匀，k=3 又会任意删除大量同等合理选项。</p>
<table class="dd-table"><thead><tr><th>原始概率</th><th>top-2 保留</th><th>重归一化</th></tr></thead><tbody><tr><td>0.665 / 0.245 / 0.090</td><td>0.665 / 0.245 / 0</td><td>0.731 / 0.269 / 0</td></tr></tbody></table><p>截断后的数值才是实际抽样概率。记录 logprobs 时必须说明返回的是原始模型分布、温度后分布，还是截断重归一化后的分布。</p></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>top-p：固定累计质量，候选数随犹豫变化<span class="dd-badge math">核采样</span></h2><p class="dd-lead">p=0.8 时，为什么低温只留一个候选，高温可能留下三个？</p><p>按概率从大到小累加，保留使累计概率首次达到阈值 p 的最小前缀。沿用本页 logits：</p>
<table class="dd-table"><thead><tr><th>T</th><th>概率</th><th>top-p=0.8 的最小集合</th></tr></thead><tbody><tr><td>0.5</td><td>[0.867,0.117,0.016]</td><td>只需第 1 个（0.867≥0.8）</td></tr><tr><td>1</td><td>[0.665,0.245,0.090]</td><td>前 2 个（累计 0.910）</td></tr><tr><td>2</td><td>[0.506,0.307,0.186]</td><td>前 2 个（累计 0.813）</td></tr></tbody></table>
<p>top-p 会在确定位置自动收缩，在不确定位置扩大，比固定 k 更适应分布形状；但“达到阈值的 token 是否包含”、并列排序和最低保留数仍取决于实现。</p></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>参数组合的先后会改变最终分布<span class="dd-badge eng">管线</span></h2><p class="dd-lead">temperature、penalty、top-k、top-p 同时打开时，谁先执行？</p>
<figure class="dd-fig"><svg viewBox="0 0 760 300" role="img" aria-label="采样处理顺序对候选概率的影响"><g stroke="currentColor" stroke-width="2"><rect x="35" y="45" width="130" height="52" rx="9" fill="#8b5cf6" opacity=".2"/><rect x="215" y="45" width="130" height="52" rx="9" fill="#0ea5e9" opacity=".2"/><rect x="395" y="45" width="130" height="52" rx="9" fill="#f59e0b" opacity=".2"/><rect x="575" y="45" width="130" height="52" rx="9" fill="#10b981" opacity=".2"/><rect x="35" y="190" width="130" height="52" rx="9" fill="#8b5cf6" opacity=".2"/><rect x="215" y="190" width="130" height="52" rx="9" fill="#f59e0b" opacity=".2"/><rect x="395" y="190" width="130" height="52" rx="9" fill="#0ea5e9" opacity=".2"/><rect x="575" y="190" width="130" height="52" rx="9" fill="#10b981" opacity=".2"/><g fill="none"><path d="M165 71H215M345 71H395M525 71H575M165 216H215M345 216H395M525 216H575"/></g></g><g class="svg-t" text-anchor="middle"><text x="100" y="77">历史惩罚</text><text x="280" y="77">温度</text><text x="460" y="77">top-p</text><text x="640" y="77">采样</text><text x="100" y="222">历史惩罚</text><text x="280" y="222">top-p</text><text x="460" y="222">温度</text><text x="640" y="222">采样</text><text x="380" y="135">顺序 A 与顺序 B 的 top-p 支持集可能不同</text><text x="380" y="277">因此必须以服务实现为准，不能只凭参数名推断</text></g></svg><figcaption>温度改变累计概率，惩罚还可能改变排名；在截断前后应用会得到不同候选集。许多 API 不承诺统一顺序。</figcaption></figure>
<p>同时设 top-k 与 top-p 常取两者交集，可能比任一单独策略严格得多。默认值也可能隐式开启某种截断；做可归因实验时从单一机制开始，再逐项组合。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>重复惩罚修改的是历史相关分数<span class="dd-badge eng">历史</span></h2><p class="dd-lead">为什么减少“的的的”也可能破坏代码变量和固定术语？</p><table class="dd-table"><thead><tr><th>常见概念</th><th>典型作用</th><th>主要风险</th></tr></thead><tbody><tr><td>presence penalty</td><td>某 token 出现过即施加一次惩罚</td><td>必要复用也被压制</td></tr><tr><td>frequency penalty</td><td>随出现次数增加惩罚</td><td>长文术语一致性下降</td></tr><tr><td>repetition penalty</td><td>按实现对已见 token 的 logit 乘/除</td><td>正负 logit 处理与 tokenizer 边界复杂</td></tr><tr><td>no-repeat n-gram</td><td>硬禁止重复 n-gram</td><td>语法、引用与代码可能无路可走</td></tr></tbody></table><p>“词”的重复在 token 层可能跨多个片段；大小写、空格前缀和形态变化又可能是不同 token。惩罚不是语义去重器，应按任务检查必要重复、循环长度和事实一致性。</p></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>停止条件决定边界，不决定内容完整性<span class="dd-badge eng">终止</span></h2><p class="dd-lead">EOS、停止字符串和 max tokens 有什么本质区别？</p><table class="dd-table"><thead><tr><th>机制</th><th>触发位置</th><th>失败模式</th></tr></thead><tbody><tr><td>EOS token</td><td>模型采样到专用终止 ID</td><td>模板 ID 错或被过滤，模型不停</td></tr><tr><td>停止字符串</td><td>解码文本匹配字节/字符序列</td><td>跨 token/流式块边界，截掉用户内容</td></tr><tr><td>最大新 token</td><td>达到硬预算</td><td>JSON、代码或句子中途截断</td></tr><tr><td>语法接受态</td><td>约束解码器确认结构完成</td><td>格式完成但语义仍可能错误</td></tr></tbody></table><p>停止串可能由多个 token 组成，也可能出现在引用文本中。流式服务必须跨块保留匹配状态，并明确返回中是否包含停止串。结构化任务应把 finish reason、解析成功和内容校验分开记录。</p></section>

<section class="dd-sec"><h2><span class="dd-n">9</span>贪心、采样、束搜索分别优化什么<span class="dd-badge intuition">策略</span></h2><p class="dd-lead">每步选最高概率，为什么不保证整条序列概率最高？</p><p>贪心只做局部最优，早期最高 token 可能通向低概率后续；束搜索同时保留若干累计分数较高的前缀，近似寻找高序列概率，但长度偏置与模式坍缩需处理。随机采样不追求最高概率序列，而是从模型分布保留多样路径。</p>
<table class="dd-table"><thead><tr><th>策略</th><th>优点</th><th>适合</th><th>边界</th></tr></thead><tbody><tr><td>贪心</td><td>快、低随机</td><td>简单抽取、基线</td><td>局部最优、可能循环</td></tr><tr><td>束搜索</td><td>探索多个高分前缀</td><td>传统翻译等目标较窄任务</td><td>贵，开放生成常显得单调</td></tr><tr><td>截断采样</td><td>多样且避开极低概率尾部</td><td>对话、创作、多候选</td><td>结果是分布，需重复评测</td></tr></tbody></table></section>

<section class="dd-sec"><h2><span class="dd-n">10</span>按任务选择参数，而不是寻找万能配方<span class="dd-badge eng">决策</span></h2><p class="dd-lead">“代码用 0、创作用 1”为什么仍只是粗略经验？</p>
<table class="dd-table"><thead><tr><th>任务</th><th>起始思路</th><th>必须配套的验证</th></tr></thead><tbody><tr><td>分类/抽取</td><td>低随机或约束候选</td><td>标签 token、校准、解析与拒答</td></tr><tr><td>结构化 JSON</td><td>约束解码优先，低随机辅助</td><td>schema 合法与字段语义分别测</td></tr><tr><td>代码补丁</td><td>较窄候选，可生成多个</td><td>编译、测试、安全扫描</td></tr><tr><td>事实问答</td><td>随机性不是核心控制</td><td>检索引用、工具与事实核验</td></tr><tr><td>创意发散</td><td>适度提高熵，多候选</td><td>新颖性、约束满足与人工选择</td></tr><tr><td>自洽推理</td><td>独立采样多条路径</td><td>答案可比较、成本与系统性偏差</td></tr></tbody></table>
<div class="dd-note warn"><b>降低温度只能让模型更稳定地选择它原本偏好的答案。</b>如果最高概率路径是幻觉、偏见或错误算法，temperature=0 会稳定复现错误，而不是修复知识。</div></section>

<section class="dd-sec"><h2><span class="dd-n">11</span>固定 seed 为什么仍未必完全可复现<span class="dd-badge eng">复现</span></h2><p class="dd-lead">随机数相同，分布或执行顺序稍变会发生什么？</p><p>seed 只固定某个随机数生成器的序列。模型权重、tokenizer、提示字节、浮点内核、并行归约、批处理、解码实现或服务更新只要改变，累计概率边界就可能越过同一个随机数，后续路径全部分叉。某些硬件算子本身也不是位级确定。</p><p>复现实验应保存模型/服务版本、完整请求、默认参数、seed、输出 token ID 与 logprobs；托管 API 若只提供“尽力而为”的 seed，应把结果视为近似复现而非证明。</p></section>

<section class="dd-sec"><h2><span class="dd-n">12</span>随机系统应该怎样评测<span class="dd-badge eng">实验</span></h2><ol class="dd-steps"><li><b>固定输入集与版本：</b>保存精确提示、模板、模型和 tokenizer。</li><li><b>建立贪心基线：</b>先看模型最偏好路径的质量和失败。</li><li><b>一次只扫一个机制：</b>温度、top-p、top-k、惩罚分别形成曲线。</li><li><b>重复独立采样：</b>报告均值、方差、分位数、最坏失败与成功率。</li><li><b>同时测质量和多样性：</b>不同字符串不一定是有价值差异。</li><li><b>记录结束原因：</b>EOS、stop、长度截断、错误要分开。</li><li><b>按任务外部验证：</b>代码跑测试、事实查证据、结构过解析器。</li><li><b>做交互消融：</b>组合参数后移除一项，确认收益不是偶然。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">13</span>因果链、常见误解与自测<span class="dd-badge intuition">综合</span></h2><ol class="dd-chain"><li>模型按当前前缀输出全词表 logits。</li><li>历史惩罚或约束按已生成内容修改可选分数。</li><li>温度缩放 logit 差，改变分布熵而不改正温度下的排名。</li><li>top-k/top-p 删除尾部候选并形成新的支持集。</li><li>剩余分数归一化后，贪心或随机规则选出一个 token。</li><li>token 追加到上下文，下一步分布随路径改变。</li><li>EOS、停止串、语法状态或长度预算终止循环。</li><li>最终质量由多次任务验证证明，不由某个参数数字保证。</li></ol>
<table class="dd-table"><thead><tr><th>误解</th><th>更准确的说法</th></tr></thead><tbody><tr><td>temperature=0 就没有幻觉</td><td>它只选高分路径，最高分也可能错。</td></tr><tr><td>top-p=0.9 固定保留 90% token</td><td>它保留累计概率至少 0.9 的最小高概率集合。</td></tr><tr><td>top-k 与 top-p 数字越小越好</td><td>过严会删除正确或必要候选。</td></tr><tr><td>固定 seed 必然逐字一致</td><td>还依赖版本、数值内核、批处理和解码实现。</td></tr><tr><td>logprob 是事实置信度</td><td>它是模型在当前条件下的相对语言偏好。</td></tr></tbody></table>
<ol class="dd-quiz"><li>为什么正温度不改变 top-k 成员，却可能改变 top-p 成员？</li><li>本页 T=1、p=0.8 时保留哪两个候选？重归一化前累计多少？</li><li>每步贪心为什么不保证整条序列概率最高？</li><li>重复惩罚为什么可能破坏代码？</li><li>同 seed 输出变化时，除随机数外应核对什么？</li></ol><details class="dd-answers"><summary>参考答案</summary><ol><li>正数缩放保持排名，所以 top-k 不变；概率陡峭度和累计速度改变，所以 top-p 边界会变。</li><li>前两个，累计约 0.665+0.245=0.910。</li><li>局部最高 token 可能通向很低概率的后续，而较低的第一步可能拥有更高累计路径。</li><li>变量、缩进片段、括号和关键字常需精确重复，token 级惩罚不懂语义必要性。</li><li>模型/tokenizer/提示、完整参数与默认值、服务版本、浮点内核、并行批处理和解码顺序。</li></ol></details></section>

<section class="dd-sec"><h2><span class="dd-n">14</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2><table class="dd-table"><thead><tr><th>方向</th><th>接下来读</th><th>关键问题</th></tr></thead><tbody><tr><td>分数从哪里来</td><td><a href="#" data-node="llm">大语言模型</a></td><td>自回归条件分布怎样由 Transformer 产生？</td></tr><tr><td>候选单位</td><td><a href="#" data-node="tokenization">Token 与分词</a></td><td>停止串和惩罚怎样受 token 边界影响？</td></tr><tr><td>观察概率</td><td><a href="#" data-node="logprobs">Logprobs</a></td><td>暴露的是管线哪一阶段的概率？</td></tr><tr><td>硬格式保证</td><td><a href="#" data-node="constrained-decoding">约束解码</a></td><td>如何把非法 token 概率直接置零？</td></tr><tr><td>多路径可靠性</td><td><a href="#" data-node="self-consistency">自洽性采样</a></td><td>多次采样何时能用投票换可靠性？</td></tr><tr><td>真实性边界</td><td><a href="#" data-node="hallucination">幻觉</a></td><td>为何解码参数不能替代证据核验？</td></tr></tbody></table><div class="dd-note key"><b>过关标准</b>　你能从一排 logits 手算温度、top-k、top-p 后的候选分布，指出组合参数的实现依赖，并为具体任务设计含多次采样、结束原因和外部验证的评测。</div></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/1904.09751" target="_blank" rel="noopener">The Curious Case of Neural Text Degeneration</a>：核采样与开放文本退化。</li><li><a href="https://aclanthology.org/P18-1107/" target="_blank" rel="noopener">Hierarchical Neural Story Generation</a>：top-k 采样在长文本生成中的使用。</li><li><a href="https://arxiv.org/abs/2210.15191" target="_blank" rel="noopener">Truncation Sampling as Language Model Desmoothing</a>：截断采样分析。</li><li><a href="https://aclanthology.org/2023.tacl-1.7/" target="_blank" rel="noopener">Locally Typical Sampling</a>：基于局部典型性的替代解码视角。</li></ul><p>生成闭环图、处理顺序图、logits 手算、停止/惩罚对照表和评测流程均为本项目原创组织。</p><div class="dd-src-date">访问日期：2026-07-22</div></div>`
};

window.DEEPDIVE["sampling-params"].html = window.DEEPDIVE["sampling-params"].html
  .replace(
    '<p class="dd-lead">第一个 token 的一次随机差异，为什么会改写后面整段回答？</p>',
    '<p class="dd-lead">第一个 token 的一次随机差异，为什么会改写后面整段回答？</p><p>自回归解码循环的输入是当前提示和已生成前缀，输出是一个新 token 或停止信号。模型先给全词表 logits，解码器变形、过滤并选择一个 token，再把它追加为下一步输入；因此某一步的微小分叉会改变之后每一步的条件分布。单条输出只是这条路径的结果，不代表其他采样路径相同。</p>'
  )
  .replace(
    '<p class="dd-lead">给所有 logits 同时加 100，概率为什么不变？</p>',
    '<p class="dd-lead">给所有 logits 同时加 100，概率为什么不变？</p><p>softmax 接收整个词表的相对 logits，输出和为 1 的下一 token 概率分布。指数化放大分数差，再用总和归一化；所有 logits 同加常数只会让分子分母同乘一个因子。概率表示当前前缀下的模型偏好，不是事实正确率，也不能直接当整段答案置信度。</p>'
  )
  .replace(
    '<p class="dd-lead">对 logits [2,1,0]，温度从 0.5 调到 2 会发生什么？</p>',
    '<p class="dd-lead">对 logits [2,1,0]，温度从 0.5 调到 2 会发生什么？</p><p>温度缩放输入原始 logits 和正数 T，输出尖锐度改变的新概率分布。先用每个 logit 除以 T，再做 softmax；T 小时高分候选占比上升，T 大时尾部占比上升。它不增加模型知识，且 T=0 通常是服务自定义的贪心特判而非公式中的合法除数。</p>'
  )
  .replace(
    '<p class="dd-lead">保留前 3 名，在模型极确定与极犹豫时为什么不是同一强度？</p>',
    '<p class="dd-lead">保留前 3 名，在模型极确定与极犹豫时为什么不是同一强度？</p><p>top-k 接收候选分数和整数 k，输出只含排名前 k 的支持集及重归一化概率。它把其余候选分数置为负无穷后重新归一化；实际抽样概率必须读截断后的数值。固定候选数不感知概率间隔，因此在极尖或极平分布上都可能过松或过严。</p>'
  )
  .replace(
    '<p class="dd-lead">p=0.8 时，为什么低温只留一个候选，高温可能留下三个？</p>',
    '<p class="dd-lead">p=0.8 时，为什么低温只留一个候选，高温可能留下三个？</p><p>top-p 接收已排序概率和累计阈值 p，输出累计质量首次达到阈值的最小候选前缀。分布尖时集合自动缩小，分布平时集合扩大；保留下来的概率还要再次归一化。阈值边界是否包含、并列顺序和最低候选数属于具体实现，不能只凭参数名假定。</p>'
  )
  .replace(
    '<p class="dd-lead">temperature、penalty、top-k、top-p 同时打开时，谁先执行？</p>',
    '<p class="dd-lead">temperature、penalty、top-k、top-p 同时打开时，谁先执行？</p><p>解码管线的输入是原始 logits、生成历史和全部参数，输出是最终支持集与抽样分布。惩罚会改分数甚至排名，温度会改累计速度，截断再删除候选，所以交换步骤可能产生不同结果。参数组合只能按服务实现解释，实验时应从单一机制开始逐项加入。</p>'
  )
  .replace(
    '<p class="dd-lead">为什么减少“的的的”也可能破坏代码变量和固定术语？</p>',
    '<p class="dd-lead">为什么减少“的的的”也可能破坏代码变量和固定术语？</p><p>重复惩罚接收已生成 token 历史和当前 logits，输出对出现过的 token 调整后的分数。presence 看是否出现，frequency 看次数，硬 n-gram 则直接禁用特定续写。较低重复率不等于语义更好；代码、引用和术语需要精确复用时，惩罚可能删除唯一正确候选。</p>'
  )
  .replace(
    '<p class="dd-lead">EOS、停止字符串和 max tokens 有什么本质区别？</p>',
    '<p class="dd-lead">EOS、停止字符串和 max tokens 有什么本质区别？</p><p>终止器接收新 token、已解码文本、语法状态和剩余预算，输出继续生成或停止及结束原因。EOS 在 token 层触发，停止串在文本匹配层触发，max tokens 是硬预算，语法接受态只证明结构完成。停止成功不能解释为内容完整或语义正确，流式跨块与引用中误命中仍需处理。</p>'
  )
  .replace(
    '<p class="dd-lead">每步选最高概率，为什么不保证整条序列概率最高？</p>',
    '<p class="dd-lead">每步选最高概率，为什么不保证整条序列概率最高？</p><p>序列策略接收每一步的候选分布，输出一条或多条完成序列。贪心只保留局部第一名，束搜索保留若干累计高分前缀，随机采样按分布保留多样路径；最终应按任务质量解释，而非把高模型概率等同正确。束宽、长度偏置和开放生成退化限制了束搜索的适用范围。</p>'
  )
  .replace(
    '<p class="dd-lead">“代码用 0、创作用 1”为什么仍只是粗略经验？</p>',
    '<p class="dd-lead">“代码用 0、创作用 1”为什么仍只是粗略经验？</p><p>参数选择接收任务成功标准、风险、成本和模型服务实现，输出候选解码配置与外部验收方案。先建立低随机基线，再围绕目标指标扫描单个机制并复测组合；低温只让既有高分路径更稳定，无法修复知识错误、偏见或错误算法。</p>'
  )
  .replace(
    '<p class="dd-lead">随机数相同，分布或执行顺序稍变会发生什么？</p>',
    '<p class="dd-lead">随机数相同，分布或执行顺序稍变会发生什么？</p><p>复现输入是 seed、完整请求、模型与 tokenizer 版本、解码实现和执行环境，输出是可比较的 token 路径。seed 只固定随机数序列；任一概率边界或抽取顺序变化都可能让同一随机数选中不同 token。托管服务的固定 seed 通常只能提供近似复现，不构成逐字一致保证。</p>'
  )
  .replace(
    '<section class="dd-sec"><h2><span class="dd-n">12</span>随机系统应该怎样评测<span class="dd-badge eng">实验</span></h2><ol class="dd-steps">',
    '<section class="dd-sec"><h2><span class="dd-n">12</span>随机系统应该怎样评测<span class="dd-badge eng">实验</span></h2><p class="dd-lead">一次生成的好坏为什么不能代表某组采样参数的总体质量？</p><p>随机解码评测接收固定输入集、系统版本和参数候选，输出多次独立采样的质量、多样性、方差、成本与失败分布。先固定其余条件逐项扫描，再重复采样并用解析器、测试或证据做外部验证；均值不能掩盖最坏失败，高字符串差异也不自动等于有价值的多样性。</p><ol class="dd-steps">'
  )
  .replace(
    '<mfrac><msup><mi>e</mi><msub><mi>z</mi><mi>i</mi></msub></msup><munder><mo>∑</mo><mi>j</mi></munder><msup><mi>e</mi><msub><mi>z</mi><mi>j</mi></msub></msup></mfrac>',
    '<mfrac><msup><mi>e</mi><msub><mi>z</mi><mi>i</mi></msub></msup><mrow><munder><mo>∑</mo><mi>j</mi></munder><msup><mi>e</mi><msub><mi>z</mi><mi>j</mi></msub></msup></mrow></mfrac>'
  )
  .replace(
    '<mfrac><msup><mi>e</mi><mrow><msub><mi>z</mi><mi>i</mi></msub><mo>−</mo><mi>c</mi></mrow></msup><munder><mo>∑</mo><mi>j</mi></munder><msup><mi>e</mi><mrow><msub><mi>z</mi><mi>j</mi></msub><mo>−</mo><mi>c</mi></mrow></msup></mfrac>',
    '<mfrac><msup><mi>e</mi><mrow><msub><mi>z</mi><mi>i</mi></msub><mo>−</mo><mi>c</mi></mrow></msup><mrow><munder><mo>∑</mo><mi>j</mi></munder><msup><mi>e</mi><mrow><msub><mi>z</mi><mi>j</mi></msub><mo>−</mo><mi>c</mi></mrow></msup></mrow></mfrac>'
  )
  .replace(
    '<code>zᵢ</code> 是候选 token i 的原始 logit',
    '<code>e</code> 是自然指数函数的底数，<code>i</code> 是当前候选编号，<code>zᵢ</code> 是候选 token i 的原始 logit'
  );
