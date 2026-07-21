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

<section class="dd-sec"><h2><span class="dd-n">1</span>训练时扩展与推理时扩展<span class="dd-badge intuition">直觉</span></h2><p>训练时扩展把更多计算投入权重学习，成本在部署前支付并被所有请求共享；推理时扩展按请求投入额外计算，可以对难题多花预算、简单题少花预算。前者改变模型参数，后者改变模型如何使用现有参数和外部工具。</p></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>四种主要计算方式<span class="dd-badge eng">工程</span></h2><ul class="dd-steps"><li><b>更长的串行轨迹</b>：分解、计算、检查和修正。</li><li><b>并行候选</b>：独立采样多个答案后投票或排序。</li><li><b>显式搜索</b>：展开若干中间状态并剪枝。</li><li><b>工具执行</b>：调用代码、检索、求解器或环境取得反馈。</li></ul><p>不同任务的可验证性不同。数学和代码常有强检查器；开放式写作只有模糊偏好，额外搜索更容易优化错目标。</p></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>候选数与边际收益<span class="dd-badge math">数学</span></h2><p>若每个候选独立且单次成功概率为 p，至少一个成功的概率是：</p><div class="dd-formula">P(至少一个成功) = 1 − (1 − p)<sup>k</sup></div><p class="dd-formula-note">这是理想上界式直觉。现实候选共享同一模型和提示，错误高度相关；而且系统还必须识别哪个候选成功，所以 k 增大不会自动兑现全部收益。</p></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>验证器决定搜索方向<span class="dd-badge eng">机制</span></h2><p class="dd-lead">候选已经生成，怎样知道该选哪一个？</p><p>验证器可检查最终答案，也可给中间步骤打分。结果验证适合有明确终态的任务；过程验证能更早剪掉错误分支，但标注成本更高，也可能把某种解题风格误当成正确性。编译器和形式化证明器通常比模型自评提供更独立的信号。</p><div class="dd-note warn"><b>验证器也是攻击面。</b>　只要评分规则存在漏洞，搜索就会集中找到高分但错误的输出，即奖励黑客。</div></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>搜索不是无限写思维链<span class="dd-badge intuition">边界</span></h2><p>有效计算需要状态、动作、停止条件和反馈。让模型重复思考可能产生冗长而无新信息的轨迹；公开展示长推理文本也不等于内部计算更可靠。系统可以保留必要的中间状态、使用隐藏草稿或结构化工具调用，并向用户提供可核验的简洁解释。</p></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>预算分配与停止策略<span class="dd-badge eng">工程</span></h2><ul class="dd-steps"><li>先用轻量模型估计难度或不确定性。</li><li>简单请求直接回答，困难请求升级模型或候选数。</li><li>发现强验证证据后提前停止。</li><li>设置 token、调用次数、墙钟时间和金额上限。</li><li>按任务切片报告质量—成本—延迟曲线。</li></ul><p>好的路由策略优化的是单位成本收益，而不是所有请求都使用最大预算。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>把因果链连起来<span class="dd-badge intuition">综合</span></h2><ol class="dd-chain"><li>基础模型给出候选分布，而非保证正确答案。</li><li>额外采样或搜索扩大被探索的解空间。</li><li>多样性决定新计算是否带来不同尝试。</li><li>验证信号区分更可靠与更差的分支。</li><li>选择、修正和提前停止把信号转成质量收益。</li><li>相关错误、弱验证器与预算上限造成收益递减。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>常见误解与自测<span class="dd-badge intuition">自测</span></h2><div class="dd-table-wrap"><table class="dd-table"><tbody><tr><td>token 越多答案越好</td><td>没有新探索或反馈时，更多 token 可能只是重复错误</td></tr><tr><td>best-of-k 必然提高准确率</td><td>还需要足够多样的候选和能识别正确项的选择器</td></tr><tr><td>模型自评就是验证</td><td>同源模型的错误可能相关，外部检查通常更独立</td></tr></tbody></table></div>
<ol class="dd-quiz"><li>推理时扩展为什么适合按难度分配？</li><li>独立公式为何会高估真实收益？</li><li>过程验证和结果验证有何取舍？</li><li>为什么强验证器能让搜索更有效？</li><li>停止策略至少应约束哪些资源？</li></ol><details class="dd-answers"><summary>参考答案</summary><ol><li>计算按请求支付，可只升级困难样本。</li><li>候选错误相关且选择器并不完美。</li><li>过程反馈早但昂贵，结果反馈便宜但稀疏。</li><li>它能可靠剪枝并把预算集中到有希望的路径。</li><li>token、调用次数、时间和金额。</li></ol></details></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2203.11171" target="_blank" rel="noopener">Self-Consistency Improves Chain of Thought Reasoning</a>：多路径采样与一致性选择。</li><li><a href="https://arxiv.org/abs/2305.20050" target="_blank" rel="noopener">Let's Verify Step by Step</a>：过程监督与验证器。</li><li><a href="https://arxiv.org/abs/2305.10601" target="_blank" rel="noopener">Tree of Thoughts</a>：显式搜索、评估与回溯。</li></ul><div class="dd-src-date">访问日期：2026-07-21</div></div>
`
};
