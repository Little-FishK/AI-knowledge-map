/* 理解原理页 —— 模型评测与基准 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["model-evaluation"] = {
  title: "模型评测与基准",
  subtitle: "把“这个模型更强”变成有条件、可复现、可解释的证据",
  aliases: "Model Evaluation · Benchmark · Evals",
  meta: "建议 25–35 分钟 · 中级 · 需要：模型选型、应用评测",
  thesis: "模型评测用固定任务、输入、工具权限、采样预算与评分规则衡量能力。一个分数只有在<b>测试未污染、条件一致、指标与真实目标一致</b>时才有意义；公开基准、私有保留集、人工盲评与安全测试必须组合使用。",
  html: `
<div class="dd-goals"><div class="dd-goals-h">读完这一页，你应该能自己回答：</div><ul><li>模型评测和应用评测差在哪？</li><li>公平比较必须固定哪些条件？</li><li>基准污染为何会制造虚假进步？</li><li>自动指标、LLM 裁判和人工评审各有什么偏差？</li><li>怎样设计一套可持续评测组合？</li></ul></div>
<div class="dd-note key"><b>运行例子</b>　两个代码模型都报告 60 分：一个只生成一次，另一个每题生成 100 次再挑最好答案。数字相同并不代表单次使用体验相同。</div>

<section class="dd-sec"><h2><span class="dd-n">1</span>模型评测在测什么<span class="dd-badge intuition">直觉</span></h2><p class="dd-lead">“模型能力”为什么不能靠聊天几次判断？</p><p>演示样例易被挑选，个人体验又受提示影响。模型评测用一组代表性任务系统测量知识、推理、代码、长上下文、鲁棒性和安全性，并报告失败分布，而不是只展示最佳案例。</p></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>模型评测 vs 应用评测<span class="dd-badge intuition">消歧</span></h2><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th></th><th>模型评测</th><th>应用评测</th></tr></thead><tbody><tr><td>对象</td><td>基础模型及其推理配置</td><td>提示、RAG、工具和界面组成的系统</td></tr><tr><td>问题</td><td>模型会什么</td><td>产品是否完成业务目标</td></tr><tr><td>结果</td><td>能力与风险剖面</td><td>端到端质量、成本、延迟</td></tr></tbody></table></div></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>可比性的四个条件<span class="dd-badge eng">工程</span></h2><ul class="dd-steps"><li><b>同数据</b>：题目、版本和过滤一致。</li><li><b>同预算</b>：token、候选数、重试与工具一致。</li><li><b>同评分</b>：解析、容错和裁判提示一致。</li><li><b>同统计</b>：报告样本量、方差或置信区间。</li></ul><div class="dd-note warn"><b>模型名称不够。</b>　同一模型的系统提示、温度、reasoning effort 和工具权限不同，结果就可能显著不同。</div></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>指标为什么会骗人<span class="dd-badge math">数学</span></h2><p class="dd-lead">分数客观，为什么结论仍可能错？</p><p>指标只压缩了某一侧表现。准确率忽略类别代价，平均分掩盖少数群体，pass@k 同时混入模型质量与采样预算。LLM 裁判还可能偏爱冗长、特定位置或与自己相似的答案。</p><div class="dd-formula">整体平均分 = Σ 分组权重 × 分组表现</div><p class="dd-formula-note">改变分组权重就会改变总分，所以必须同时展示关键切片。</p></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>基准污染与过拟合<span class="dd-badge eng">风险</span></h2><p class="dd-lead">模型高分可能只是见过答案吗？</p><p>公开题、答案和衍生讲解可能进入训练数据；团队也会反复针对同一基准调参。结果是对测试集过拟合。缓解方法包括时间更新题、私有保留集、相似样本检测和只公开评测协议而不公开全部题目。</p></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>一套稳健评测组合<span class="dd-badge eng">工程</span></h2><ul class="dd-steps"><li>公开基准用于与外界对齐。</li><li>私有保留集覆盖真实目标与近期数据。</li><li>人工盲评处理主观质量和裁判偏差。</li><li>红队测试寻找低频高危失败。</li><li>线上监控验证离线结论能否迁移。</li></ul></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>把因果链连起来<span class="dd-badge intuition">综合</span></h2><ol class="dd-chain"><li>模型能力不能靠挑选演示判断。</li><li>固定任务和条件才能产生可比较结果。</li><li>单一指标会压扁多维质量。</li><li>污染和反复调参会制造虚假进步。</li><li>因此要组合公开、私有、人工和安全评测。</li><li>评测结论必须带预算、成本和不确定性。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>自测<span class="dd-badge intuition">自测</span></h2><ol class="dd-quiz"><li>为什么模型评测不能替代应用评测？</li><li>比较推理模型时必须固定什么？</li><li>pass@1 和 pass@k 有何区别？</li><li>如何发现基准污染？</li><li>为什么需要分组指标？</li></ol><details class="dd-answers"><summary>参考答案</summary><ol><li>后者还包含提示、数据、工具和业务流程。</li><li>token、候选、重试、工具与评分规则。</li><li>一个看单次命中，一个还包含多次采样收益。</li><li>用保留集、时间切分和相似检测。</li><li>平均分会掩盖关键少数场景。</li></ol></details></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2211.09110" target="_blank" rel="noopener">HELM</a>：多场景、透明评测框架。</li><li><a href="https://arxiv.org/abs/2310.06770" target="_blank" rel="noopener">SWE-bench</a>：真实仓库级代码评测。</li><li><a href="https://arxiv.org/abs/2306.05685" target="_blank" rel="noopener">Judging LLM-as-a-Judge</a>：模型裁判偏差。</li></ul><div class="dd-src-date">访问日期：2026-07-21</div></div>
`
};
