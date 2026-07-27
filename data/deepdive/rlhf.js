window.DEEPDIVE = window.DEEPDIVE || {};

window.DEEPDIVE['rlhf'] = {
  title: 'RLHF 与偏好对齐：把“人更喜欢什么”转成可训练信号',
  subtitle: '从示范数据、偏好比较、奖励模型到策略优化，理解 RLHF 在优化什么，以及它为什么不能等同于“让模型绝对安全”。',
  thesis: 'RLHF 的本质是把有限标注者对候选回答的相对偏好变成可优化的代理信号；经典流程由 <b>SFT、偏好比较、奖励建模与受约束策略优化</b>组成，因此奖励提高必须由独立能力与安全评测复核。',
  html: `
    <div class="dd-goals"><strong>读完你应该能：</strong>画出经典 RLHF 流程；解释奖励模型如何从成对比较学习；读懂 KL 约束的作用；区分 RLHF、SFT 与 DPO；识别偏好数据的局限。</div>
    <h2 class="sr-only">RLHF 原理正文</h2>

    <section class="dd-sec">
      <span class="dd-badge intuition">直觉</span>
      <h3>1. 为什么不能只靠“标准答案”训练？</h3>
      <p class="dd-lead">许多开放式任务没有唯一答案，但人可以比较两个回答哪个更好。</p>
      <p>监督微调（SFT）要求示范者写出理想回答，成本高且覆盖有限。偏好学习把问题改成“回答 A 和 B 哪个更符合有用、真实、无害等要求”，再从大量相对判断中学习一个可优化的方向。RLHF 的关键不是读心，而是把人的比较选择压缩成训练信号。</p>
      <div class="dd-example"><strong>例子：</strong>面对“解释递归”，回答 A 准确但术语密集，回答 B 准确且有最小代码示例。标注者选择 B，提供的是相对偏好，不是一个客观的满分数值。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>2. 经典 RLHF 流水线有哪些环节？</h3>
      <p class="dd-lead">通常先教模型基本行为，再学习人的偏好，最后让策略朝高奖励方向移动。</p>
      <ol>
        <li><strong>SFT：</strong>用人工示范或高质量指令数据，让基础模型学会按指令回答。</li>
        <li><strong>采样与比较：</strong>对同一提示生成多个候选，由人排序或成对选择。</li>
        <li><strong>奖励建模：</strong>训练奖励模型，为“提示 + 回答”输出一个相对分数。</li>
        <li><strong>策略优化：</strong>常用 PPO 等强化学习方法，提高预期奖励，同时限制策略偏离参考模型。</li>
      </ol>
      <p>这四步是经典 InstructGPT 路线，不代表所有现代对齐系统都必须使用同一种优化器或同一种标注方式。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge math">数学</span>
      <h3>3. 奖励模型怎样从“二选一”学到分数？</h3>
      <p class="dd-lead">它学习的是两个回答的相对胜率，而不是回答的绝对价值。</p>
      <p>若标注者更喜欢回答 y<sub>w</sub> 而不是 y<sub>l</sub>，Bradley–Terry 形式可写成：</p>
<div class="dd-formula" data-display="mathml"><math display="block" aria-label="给定提示 x，回答 y w 胜过回答 y l 的概率，等于二者奖励差经过 sigmoid"><mi>P</mi><mo>(</mo><msub><mi>y</mi><mi>w</mi></msub><mo>≻</mo><msub><mi>y</mi><mi>l</mi></msub><mo>|</mo><mi>x</mi><mo>)</mo><mo>=</mo><mi>σ</mi><mo>(</mo><mi>r</mi><mo>(</mo><mi>x</mi><mo>,</mo><msub><mi>y</mi><mi>w</mi></msub><mo>)</mo><mo>−</mo><mi>r</mi><mo>(</mo><mi>x</mi><mo>,</mo><msub><mi>y</mi><mi>l</mi></msub><mo>)</mo><mo>)</mo></math></div>
      <p>训练会增大优选回答与落选回答的分差。奖励分数只在当前数据、标注准则和候选分布中有意义；不能把 8 分解释成现实世界中固定的“质量 8 分”。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge math">数学</span>
      <h3>4. 为什么策略优化需要 KL 约束？</h3>
      <p class="dd-lead">只追奖励模型的高分，策略可能钻代理指标的空子并远离原本会说人话的模型。</p>
<div class="dd-formula" data-display="mathml"><math display="block" aria-label="最大化回答奖励的期望，减去 beta 乘当前策略与参考策略的 KL 散度"><munder><mo>max</mo><msub><mi>π</mi><mi>θ</mi></msub></munder><mrow><mi>𝔼</mi><mo>[</mo><mi>r</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo>)</mo><mo>]</mo></mrow><mo>−</mo><mi>β</mi><mo>·</mo><mi>KL</mi><mo>(</mo><msub><mi>π</mi><mi>θ</mi></msub><mo>(</mo><mo>·</mo><mo>|</mo><mi>x</mi><mo>)</mo><mo>∥</mo><msub><mi>π</mi><mtext>ref</mtext></msub><mo>(</mo><mo>·</mo><mo>|</mo><mi>x</mi><mo>)</mo><mo>)</mo></math></div>
      <p>第一项鼓励高奖励回答，第二项惩罚相对参考策略的剧烈漂移，β 控制两者权衡。KL 不是安全证明；它只是让更新更保守，降低语言崩坏、模式坍缩和奖励过度优化的风险。</p>
      <div class="dd-note warn"><strong>易错点：</strong>“奖励上升”只说明更符合奖励模型，不自动说明更真实、更安全或更符合所有用户。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">直觉</span>
      <h3>5. 人类偏好为什么也是有噪声的代理？</h3>
      <p class="dd-lead">标注者只能根据看见的回答和准则做判断，偏好会受知识、文化、措辞和时间压力影响。</p>
      <p>常见偏差包括偏爱更长、更自信或格式更漂亮的回答；对专业事实无法核验；不同标注者对“有帮助”和“无害”的权重不同。工程上要明确 rubric、培训标注者、测量一致性、保留分歧，并对高风险领域引入专家。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>6. DPO 与 RLHF 是什么关系？</h3>
      <p class="dd-lead">DPO 使用同类偏好对，但绕过显式奖励模型和在线强化学习循环。</p>
      <p>直接偏好优化（DPO）把偏好目标重写为策略与参考策略的对数概率差，直接提高优选回答的相对概率。它通常更易训练，但仍依赖偏好数据、参考模型和超参数，也仍可能继承数据偏差。准确说法是：DPO 是偏好对齐方法，不是经典“奖励模型 + PPO”流水线的同义词。</p>
      <div class="dd-example"><strong>选择提示：</strong>需要稳定、简单的离线训练时可先考虑 DPO；需要在线探索、复杂奖励组合或环境交互时，强化学习路线仍有价值。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>7. 如何验证对齐真的改善了产品？</h3>
      <p class="dd-lead">训练奖励不能代替独立评测，必须在未参与训练的任务与风险集上复核。</p>
      <div class="dd-chain">明确目标与冲突 → 设计标注准则 → 检查一致性 → 训练偏好目标 → 监控奖励/KL → 独立能力与安全评测 → 红队和上线监控</div>
      <p>至少同时看任务成功率、事实性、安全违规、拒答过度、群体差异与真人盲评。若只报告奖励模型分数，就无法排除奖励黑客或对单一评审器过拟合。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">辨析</span>
      <h3>8. 哪些常见说法需要修正？</h3>
      <p class="dd-lead">RLHF 是把一组偏好压进模型的工程方法，不是一次完成的价值观证明。</p>
      <ul>
        <li>RLHF 不等于“让模型永不犯错”，它优化的是有限数据上的代理信号。</li>
        <li>SFT、奖励建模和策略优化作用不同，不能把整个流程都叫奖励模型。</li>
        <li>对齐与能力可能互相促进也可能冲突，需要分维度评测。</li>
      </ul>
    </section>

    <section class="dd-sec"><span class="dd-badge math">运行示例</span><h3>9. 三个退款回答怎样变成偏好分数与策略更新？</h3><p class="dd-lead">标注者选择“核对订单后说明质量例外”，奖励模型怎样把相对比较压成一维分数，又会丢掉什么？</p><figure class="dd-fig"><svg viewBox="0 0 680 235" role="img" aria-label="退款回答经过人工成对比较、奖励模型和 KL 约束策略优化的 RLHF 流程"><defs><marker id="rh1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs><rect x="18" y="43" width="138" height="116" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="87" y="67" text-anchor="middle" class="svg-t">SFT 策略采样</text><text x="38" y="91" class="svg-t" font-size="10">A：保证退款</text><text x="38" y="111" class="svg-t" font-size="10">B：核验后说明例外</text><text x="38" y="131" class="svg-t" font-size="10">C：一律拒绝</text><text x="38" y="150" class="svg-t" font-size="10">同一提示、候选可比</text><path d="M156,101 L202,101" stroke="#6b7484" marker-end="url(#rh1)"/><rect x="204" y="43" width="132" height="116" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="270" y="67" text-anchor="middle" class="svg-t">人工偏好</text><text x="270" y="92" text-anchor="middle" class="svg-t" font-size="10">B ≻ A</text><text x="270" y="112" text-anchor="middle" class="svg-t" font-size="10">B ≻ C</text><text x="270" y="132" text-anchor="middle" class="svg-t" font-size="10">A vs C 有分歧</text><text x="270" y="151" text-anchor="middle" class="svg-t" font-size="10">保留标注者/理由</text><path d="M336,101 L382,101" stroke="#6b7484" marker-end="url(#rh1)"/><rect x="384" y="43" width="132" height="116" rx="8" fill="#21252d" stroke="#c77b72"/><text x="450" y="67" text-anchor="middle" class="svg-t">奖励模型</text><text x="450" y="92" text-anchor="middle" class="svg-t" font-size="10">r(A)=−0.6</text><text x="450" y="112" text-anchor="middle" class="svg-t" font-size="10">r(B)=+1.2</text><text x="450" y="132" text-anchor="middle" class="svg-t" font-size="10">r(C)=−0.1</text><text x="450" y="151" text-anchor="middle" class="svg-t" font-size="10">分数只在数据内相对</text><path d="M516,101 L562,101" stroke="#6b7484" marker-end="url(#rh1)"/><rect x="564" y="43" width="98" height="116" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="613" y="67" text-anchor="middle" class="svg-t">策略优化</text><text x="613" y="92" text-anchor="middle" class="svg-t" font-size="10">提高 P(B)</text><text x="613" y="112" text-anchor="middle" class="svg-t" font-size="10">KL 约束漂移</text><text x="613" y="132" text-anchor="middle" class="svg-t" font-size="10">独立评测</text><text x="613" y="151" text-anchor="middle" class="svg-t" font-size="10">检查迎合/过拒</text><path d="M613,160 C607,214 270,215 270,161" fill="none" stroke="#6b7484" marker-end="url(#rh1)"/><text x="440" y="208" text-anchor="middle" class="svg-t" font-size="10">发现偏差 → 修 rubric/采样/标注，而不是把奖励分数当真值</text></svg><figcaption>图 1　偏好数据先把候选变成成对顺序，奖励模型再压成标量；压缩方便优化，也会隐藏偏好冲突和少数意见。</figcaption></figure><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>比较</th><th>奖励差 Δr</th><th>σ(Δr)</th><th>解释</th></tr></thead><tbody><tr><td>B ≻ A</td><td>1.2−(−0.6)=1.8</td><td>约 0.858</td><td>模型预测 B 胜率 85.8%</td></tr><tr><td>B ≻ C</td><td>1.2−(−0.1)=1.3</td><td>约 0.786</td><td>模型预测 B 胜率 78.6%</td></tr><tr><td>A vs C</td><td>−0.5</td><td>约 0.378</td><td>偏向 C，但不代表 C 绝对好</td></tr></tbody></table></div><p>给所有奖励同时加 100，不改变任何分差或胜率，说明奖励零点没有绝对含义。更重要的是，一维 r 会把真实性、帮助性、拒绝适当性压在一起；训练时应保留分维度评测，避免模型只学会最容易讨好标注者的表面特征。</p><div class="dd-note warn"><b>失败边界：</b>候选由旧策略采样，偏好模型只见过这一分布；新策略为了高分生成分布外文本时，奖励外推可能失真。KL、在线抽查、奖励模型集成和独立终验共同限制，但不能证明无漏洞。</div></section>

    <section class="dd-sec"><span class="dd-badge eng">路线</span><h3>10. 常见误区与概念依赖</h3><p class="dd-lead">RLHF 是有限群体、有限候选和有限准则上的偏好代理，不是统一价值函数。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>常见误解</th><th>更准确的理解</th></tr></thead><tbody><tr><td>奖励 8 分代表绝对质量 8 分</td><td>奖励主要通过候选分差识别相对偏好</td></tr><tr><td>多数偏好等于事实正确</td><td>标注者可能无法核验专业事实，需独立证据评测</td></tr><tr><td>KL 项能保证安全</td><td>它限制策略漂移，不修复奖励目标和权限漏洞</td></tr><tr><td>DPO 消除了 RLHF 问题</td><td>它简化优化，仍继承候选、偏好和参考策略偏差</td></tr><tr><td>一个平均偏好代表所有用户</td><td>应保存分歧并按群体、场景与风险切片</td></tr></tbody></table></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>概念依赖与延伸</th></tr></thead><tbody><tr><td>先修</td><td>强化学习、SFT、概率与 logits</td></tr><tr><td><b>本页核心</b></td><td>成对偏好、Bradley–Terry 奖励、PPO/KL、DPO 与数据分布</td></tr><tr><td>紧邻</td><td>后训练、对齐、奖励投机、宪法式 AI</td></tr><tr><td>工程延伸</td><td>标注治理、人在回路、模型评测、偏见公平与红队</td></tr></tbody></table></div></section>

    <div class="dd-quiz"><strong>自测：</strong><ol><li>为什么奖励模型学到的是相对偏好而非绝对真理？</li><li>KL 项过小可能带来什么问题？</li><li>DPO 为什么仍然不能消除偏好数据偏差？</li><li>训练奖励持续上升，但专业事实正确率下降；你会怎样判断是奖励投机、标注准则缺陷还是候选分布漂移？</li></ol></div>
    <details class="dd-answers"><summary>查看答案</summary><ol><li>训练标签来自候选之间的选择，且受数据与标注准则约束。</li><li>策略可能为追求代理奖励而过度偏离参考模型，出现奖励黑客或语言质量退化。</li><li>DPO 改变了优化形式，没有改变偏好标签的来源与覆盖边界。</li><li>在未参与训练的事实集上复核，并切分旧/新策略候选；检查奖励模型对错误高分样本的理由及标注者分歧。错误样式迎合 rubric 指向代理漏洞，原始偏好本身错误指向准则或标注缺陷，只在新候选出现则提示分布外外推。</li></ol></details>

    <div class="dd-src"><strong>来源与延伸阅读：</strong><ul><li><a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noopener">Ouyang et al., Training language models to follow instructions with human feedback</a></li><li><a href="https://arxiv.org/abs/1706.03741" target="_blank" rel="noopener">Christiano et al., Deep Reinforcement Learning from Human Preferences</a></li><li><a href="https://arxiv.org/abs/2305.18290" target="_blank" rel="noopener">Rafailov et al., Direct Preference Optimization</a></li></ul><div class="dd-src-date">访问日期：2026-07-22</div></div>
  `
};
