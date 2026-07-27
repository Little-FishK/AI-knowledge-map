/* 理解原理页 —— 推理时计算与验证器 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["test-time-compute"] = {
  title: "推理时计算与验证器",
  subtitle: "不改权重，靠采样、搜索、工具与检查把额外计算换成更可靠的答案",
  aliases: "Test-time Compute · Inference-time Scaling · Verifier",
  meta: "建议 25–35 分钟 · 高级 · 需要：采样、推理模型、强化学习",
  thesis: "推理时计算把部分能力预算从训练阶段移到回答阶段：模型可以生成更长轨迹、提出多个候选、搜索解空间，并用验证器选择或修正结果。收益取决于<b>候选多样性、搜索策略与验证信号</b>，不是简单地让模型多输出 token。",
  html: `
<div class="dd-goals"><div class="dd-goals-h">读完这一页，你应该能自己回答：</div><ul><li>推理时扩展与扩大训练规模有什么区别？</li><li>并行采样、串行推理和搜索分别适合什么任务？</li><li>为什么候选数增加会出现边际收益递减？</li><li>验证器错误时会发生什么？</li><li>怎样在准确率、延迟和成本之间分配预算？</li></ul></div>
<div class="dd-note key"><b>运行例子</b>　一道代码题单次生成成功率不高。系统生成多个候选，用编译器和单元测试淘汰失败项，再让模型修复最有希望的候选。增加计算有效，是因为测试提供了与“看起来合理”不同的外部反馈。</div>

<section class="dd-sec"><h2><span class="dd-n">1</span>训练时扩展与推理时扩展<span class="dd-badge intuition">直觉</span></h2><p class="dd-lead">同样多一倍计算，为什么训练前支付和每次请求支付是两种产品决策？</p><p>训练时扩展把更多计算投入权重学习，成本在部署前支付并被所有请求共享；推理时扩展按请求投入额外计算，可以对难题多花预算、简单题少花预算。前者改变模型参数，后者改变模型如何使用现有参数和外部工具。推理预算可以动态路由，却会直接增加每个请求延迟、费用和峰值能耗，也无法创造权重与上下文中完全缺失的知识。</p></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>四种主要计算方式<span class="dd-badge eng">工程</span></h2><p class="dd-lead">额外 token、额外候选、搜索节点和工具调用提供的是同一种收益吗？</p><ul class="dd-steps"><li><b>更长的串行轨迹</b>：适合强依赖的分解、计算、检查和修正。</li><li><b>并行候选</b>：扩大覆盖，适合多个相对独立解法。</li><li><b>显式搜索</b>：保存状态、展开候选并用评分剪枝。</li><li><b>工具执行</b>：调用代码、检索、求解器或环境取得新证据。</li></ul><p>不同任务的可验证性不同。数学和代码常有强检查器；开放式写作只有模糊偏好，额外搜索更容易优化错目标。应先识别瓶颈是缺少深度、覆盖还是反馈，再选择计算形态。</p></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>候选数与边际收益<span class="dd-badge math">数学</span></h2><p class="dd-lead">增加第 k 个候选时，为什么每次新增的覆盖越来越少？</p><p>若每个候选独立且单次成功概率为 p，至少一个成功的概率是：</p><div class="dd-formula">P(至少一个成功) = 1 − (1 − p)<sup>k</sup></div><p class="dd-formula-note">这是理想上界式直觉。现实候选共享同一模型和提示，错误高度相关；而且系统还必须识别哪个候选成功，所以 k 增大不会自动兑现全部收益。</p></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>验证器决定搜索方向<span class="dd-badge eng">机制</span></h2><p class="dd-lead">候选已经生成，怎样知道该选哪一个？</p><p>验证器可检查最终答案，也可给中间步骤打分。结果验证适合有明确终态的任务；过程验证能更早剪掉错误分支，但标注成本更高，也可能把某种解题风格误当成正确性。编译器和形式化证明器通常比模型自评提供更独立的信号，仍需检查覆盖范围、版本与跨领域漂移。</p><div class="dd-note warn"><b>验证器也是攻击面。</b>　只要评分规则存在漏洞，搜索就会集中找到高分但错误的输出，即奖励黑客。</div></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>搜索不是无限写思维链<span class="dd-badge intuition">边界</span></h2><p class="dd-lead">怎样区分有状态探索和同一错误的冗长改写？</p><p>有效计算需要状态、动作、停止条件和反馈。每次扩展应产生新候选、填补证据槽位或改变验证状态；让模型重复思考可能只有冗长而无新信息的轨迹。公开展示长推理文本也不等于内部计算更可靠。系统可以保留必要的中间状态、使用隐藏草稿或结构化工具调用，并向用户提供可核验的简洁解释。</p></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>预算分配与停止策略<span class="dd-badge eng">工程</span></h2><p class="dd-lead">什么时候继续搜索的期望收益已经低于新增延迟和费用？</p><ul class="dd-steps"><li>先用轻量模型估计难度或不确定性。</li><li>简单请求直接回答，困难请求升级模型或候选数。</li><li>发现强验证证据后提前停止。</li><li>设置 token、调用次数、墙钟时间和金额上限。</li><li>按任务切片报告质量—成本—延迟曲线。</li></ul><p>好的路由策略优化的是单位成本收益，而不是所有请求都使用最大预算；还要记录被错误降级的困难样本，防止路由器只降低平均成本。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>把因果链连起来<span class="dd-badge intuition">综合</span></h2><ol class="dd-chain"><li>基础模型给出候选分布，而非保证正确答案。</li><li>额外采样或搜索扩大被探索的解空间。</li><li>多样性决定新计算是否带来不同尝试。</li><li>验证信号区分更可靠与更差的分支。</li><li>选择、修正和提前停止把信号转成质量收益。</li><li>相关错误、弱验证器与预算上限造成收益递减。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>四个代码候选怎样兑现计算收益<span class="dd-badge math">运行示例</span></h2><p class="dd-lead">单次修复成功率 35%，生成 4 个候选时“至少一个正确”与“最终选对”为什么是两个不同概率？</p><figure class="dd-fig"><svg viewBox="0 0 680 235" role="img" aria-label="测试时计算从难度路由到四候选生成、编译测试验证和提前停止的流程"><defs><marker id="tc1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs><rect x="18" y="55" width="110" height="78" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="73" y="79" text-anchor="middle" class="svg-t">难度路由</text><text x="73" y="101" text-anchor="middle" class="svg-t" font-size="10">简单：k=1</text><text x="73" y="119" text-anchor="middle" class="svg-t" font-size="10">困难：k=4</text><path d="M128,94 L174,94" stroke="#6b7484" marker-end="url(#tc1)"/><rect x="176" y="34" width="146" height="120" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="249" y="58" text-anchor="middle" class="svg-t">候选生成</text><text x="249" y="81" text-anchor="middle" class="svg-t" font-size="10">C1：复合键 ✓</text><text x="249" y="100" text-anchor="middle" class="svg-t" font-size="10">C2：禁用缓存 ✗</text><text x="249" y="119" text-anchor="middle" class="svg-t" font-size="10">C3：延长 TTL ✗</text><text x="249" y="138" text-anchor="middle" class="svg-t" font-size="10">C4：仅清缓存 ✗</text><path d="M322,94 L368,94" stroke="#6b7484" marker-end="url(#tc1)"/><rect x="370" y="34" width="142" height="120" rx="8" fill="#21252d" stroke="#c77b72"/><text x="441" y="58" text-anchor="middle" class="svg-t">外部验证器</text><text x="441" y="82" text-anchor="middle" class="svg-t" font-size="10">编译 → 隔离测试</text><text x="441" y="101" text-anchor="middle" class="svg-t" font-size="10">命中保护测试</text><text x="441" y="120" text-anchor="middle" class="svg-t" font-size="10">资源/权限检查</text><text x="441" y="139" text-anchor="middle" class="svg-t" font-size="10">发现唯一通过则停止</text><path d="M512,94 L558,94" stroke="#6b7484" marker-end="url(#tc1)"/><rect x="560" y="55" width="102" height="78" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="611" y="79" text-anchor="middle" class="svg-t">选择 C1</text><text x="611" y="101" text-anchor="middle" class="svg-t" font-size="10">输出证据</text><text x="611" y="119" text-anchor="middle" class="svg-t" font-size="10">不执行发布</text><path d="M441,155 C435,215 249,215 249,156" fill="none" stroke="#6b7484" marker-end="url(#tc1)"/><text x="345" y="207" text-anchor="middle" class="svg-t" font-size="10">全部失败时，只把诊断反馈给有限修正轮；预算耗尽后透明停止</text></svg><figcaption>图 1　额外计算通过“扩大候选集合 + 独立验证”兑现；并行采样只提高正确候选出现机会，验证器决定能否找到它。</figcaption></figure><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>量</th><th>计算</th><th>结果</th><th>含义</th></tr></thead><tbody><tr><td>至少一个正确（独立上界）</td><td>1−(1−0.35)⁴</td><td>82.1%</td><td>候选池覆盖上界</td></tr><tr><td>错误相关后的实测覆盖</td><td>标注 100 题中 68 题含正确候选</td><td>68%</td><td>共享盲点使独立式高估</td></tr><tr><td>验证器从含解集合选对</td><td>85%</td><td>0.85</td><td>选择并非完美</td></tr><tr><td>端到端成功</td><td>0.68×0.85</td><td>57.8%</td><td>仍高于单次 35%</td></tr></tbody></table></div><p>从 35% 到 57.8% 是有价值提升，但成本近似增加 4 倍候选生成外加验证。若验证器只有 55% 选择准确，端到端变为 37.4%，几乎吃掉收益；若候选高度同质，增加 k 也不会接近独立公式。应同时优化多样性和验证，而不是只扩 token。</p><div class="dd-note warn"><b>失败边界：</b>验证器只能检查它编码的契约。单元测试漏掉并发隔离时，搜索会更高效地找到“通过测试但仍有漏洞”的补丁；保留隐藏测试、保护验收和权限边界。</div></section>

<section class="dd-sec"><h2><span class="dd-n">9</span>预算路由、误区与学习路线<span class="dd-badge eng">路线</span></h2><p class="dd-lead">为什么最好的策略不是所有请求固定使用最大 k 和最长轨迹？</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>路由信号</th><th>预算动作</th><th>风险</th></tr></thead><tbody><tr><td>强外部验证、低成本候选</td><td>扩大 k，命中后提前停</td><td>验证覆盖漏洞</td></tr><tr><td>高置信简单题</td><td>k=1 或短轨迹</td><td>难度估计误判</td></tr><tr><td>开放式偏好任务</td><td>少量候选 + 人评/明确 rubric</td><td>自评迎合与模式坍塌</td></tr><tr><td>高风险不可逆动作</td><td>在沙箱模拟，执行前审批</td><td>不能靠采样多数授权</td></tr><tr><td>无进展或预算耗尽</td><td>停止并报告未知</td><td>强行给答案造成幻觉</td></tr></tbody></table></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>概念依赖与延伸</th></tr></thead><tbody><tr><td>先修</td><td>采样参数、概率、推理模型、代码执行</td></tr><tr><td><b>本页核心</b></td><td>并行候选、串行轨迹、搜索、验证器、提前停止与预算路由</td></tr><tr><td>紧邻</td><td>自一致性、思维树、反思、后训练</td></tr><tr><td>工程延伸</td><td>模型路由、评测、奖励投机、可观测性和人在回路</td></tr></tbody></table></div><p>上线评测画质量—成本—p95 延迟前沿，并按难度、领域和验证器类型切片。相同总 token 下比较长单轨迹与多短候选，才能判断任务需要深度还是覆盖；总成功率会掩盖路由器把困难或少数领域错误地降级。</p></section>

<section class="dd-sec"><h2><span class="dd-n">10</span>常见误解与自测<span class="dd-badge intuition">自测</span></h2><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>常见误解</th><th>更准确的理解</th></tr></thead><tbody><tr><td>token 越多答案越好</td><td>没有新探索或反馈时，更多 token 可能只是重复错误</td></tr><tr><td>best-of-k 必然提高准确率</td><td>还需要足够多样的候选和能识别正确项的选择器</td></tr><tr><td>模型自评就是验证</td><td>同源模型的错误可能相关，外部检查通常更独立</td></tr></tbody></table></div>
<ol class="dd-quiz"><li>推理时扩展为什么适合按难度分配？</li><li>独立公式为何会高估真实收益？</li><li>过程验证和结果验证有何取舍？</li><li>为什么强验证器能让搜索更有效？</li><li>停止策略至少应约束哪些资源？</li></ol><details class="dd-answers"><summary>参考答案</summary><ol><li>计算按请求支付，可只升级困难样本。</li><li>候选错误相关且选择器并不完美。</li><li>过程反馈早但昂贵，结果反馈便宜但稀疏。</li><li>它能可靠剪枝并把预算集中到有希望的路径。</li><li>token、调用次数、时间和金额。</li></ol></details></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2203.11171" target="_blank" rel="noopener">Self-Consistency Improves Chain of Thought Reasoning</a>：多路径采样与一致性选择。</li><li><a href="https://arxiv.org/abs/2305.20050" target="_blank" rel="noopener">Let's Verify Step by Step</a>：过程监督与验证器。</li><li><a href="https://arxiv.org/abs/2305.10601" target="_blank" rel="noopener">Tree of Thoughts</a>：显式搜索、评估与回溯。</li></ul><div class="dd-src-date">访问日期：2026-07-21</div></div>
`
};

// 新版教学门禁补充：逐节说明计算形态、候选覆盖、验证器、停止和预算路由。
{
  const page = window.DEEPDIVE["test-time-compute"];
  const additions = [
    '<p>扩展方式比较输入训练预算、请求难度、推理预算、延迟费用和知识边界，输出训练时扩展或推理时扩展的选择。训练计算改变权重并由请求共享，推理计算按请求增加候选、搜索、工具和验证；后者可动态路由却直接增加服务成本。两者都不能保证创造训练与上下文完全缺失的事实。</p>',
    '<p>计算形态选择输入任务依赖深度、解法覆盖、状态空间、外部可验证性和工具可用性，输出长串行轨迹、并行候选、显式搜索或工具执行。深依赖用串行，多个解法用并行，有状态分支用搜索，缺新证据用工具；先诊断瓶颈再选形态。开放偏好任务的弱反馈可能让额外计算优化错目标。</p>',
    '<p>候选覆盖输入单次成功概率 p、候选数 k 和候选相关性，输出至少一个成功候选的理想概率 Pcoverage。独立假设下 Pcoverage=1−(1−p)^k，新增候选的覆盖增益随 k 增加而递减；真实候选共享模型提示，通常相关并低于上界。该式只估候选池覆盖，不包含验证器能否选对。</p>',
    '<p>验证器输入候选答案或过程、明确契约、测试规则、版本和领域，输出通过、失败、分数或修正反馈。结果验证检查终态，过程验证提前剪枝，编译器和形式规则通常比同源自评更独立；但任何验证器都有覆盖漏洞。搜索会主动利用评分漏洞，所以高分不等于真实正确。</p>',
    '<p>状态搜索输入当前状态、合法动作、新证据、停止条件和反馈，输出可追踪的状态变化与候选。每次扩展应填补证据、改变验证状态或产生不同候选；重复生成同一错误的冗长文字不算新增探索。向用户提供的简洁可核验解释与内部计算长度是两件事。</p>',
    '<p>预算策略输入难度估计、校准不确定性、验证结果、token、调用、墙钟、金额上限和任务价值，输出预算档位、提前停止、升级或报告未知。简单请求短答，困难且可验证请求扩候选，出现强证据就停止；同时记录被错误降级的难例。目标是单位成本质量收益，而非所有请求用最大预算。</p>',
    '<p>因果链输入基础候选分布、探索多样性、验证信号、选择修正和预算上限，输出额外计算为何产生或没有产生质量收益的解释。新增计算先扩大覆盖，再由验证器识别，最后由停止策略兑现；任何一层失效都会造成收益递减。该链用于诊断，不是新的正确性保证。</p>',
    '<p>代码案例输入单次成功率 35%、k=4 候选、实测覆盖 68% 和验证器选择准确率 85%，输出候选覆盖、选择率与端到端成功 57.8%。先用独立式得到 82.1% 上界，再以实测覆盖替代，最后算 0.68×0.85；候选出现和最终选对是两个事件。验证器若仅 55%，收益几乎被吃掉。</p>',
    '<p>预算路由输入任务难度、验证强度、候选成本、风险可逆性、SLO 和历史切片表现，输出 k、轨迹长度、模型、沙箱审批或停止未知。强验证低成本任务可扩 k，高风险动作只在沙箱模拟并在执行前授权，开放偏好任务使用明确 rubric 与人评。上线应报告质量成本 p95 前沿和困难切片误降级。</p>',
    '<p>误区自测输入“token 越多越好、best-of-k 必然提升、模型自评就是验证”等主张，输出被遗漏的多样性、选择器、外部契约和成本条件。逐项用覆盖、选择和端到端结果反驳。自测只检查概念理解，不能代替当前模型与验证器的实证评测。</p>'
  ];
  const renderedSections = page.html.split("</section>");
  additions.forEach((html, index) => { renderedSections[index] += html; });
  page.html = renderedSections.join("</section>");
  page.html = page.html.replace(
    /<div class="dd-formula">[\s\S]*?<\/div>/,
    '<div class="dd-formula"><math display="block" aria-label="至少一个成功候选的独立上界"><mi>Pcoverage</mi><mo>=</mo><mn>1</mn><mo>−</mo><msup><mrow><mo>(</mo><mn>1</mn><mo>−</mo><mi>p</mi><mo>)</mo></mrow><mi>k</mi></msup></math></div>'
  );
}
