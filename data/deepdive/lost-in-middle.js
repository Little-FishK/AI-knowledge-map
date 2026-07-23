window.DEEPDIVE = window.DEEPDIVE || {};

window.DEEPDIVE['lost-in-middle'] = {
  title: '中间迷失：上下文放得下，为何模型仍可能找不到？',
  subtitle: '理解长上下文中的位置效应，学会用受控实验测量它，并用检索、重排和结构设计降低关键证据被忽略的概率。',
  thesis: '“中间迷失”是长上下文中的经验位置效应：<b>输入容量不等于稳定利用能力</b>。它应通过固定内容、仅置换证据位置的实验确认，并优先用检索、重排、结构化装配和持续回归降低影响。',
  html: `
    <div class="dd-goals"><strong>读完你应该能：</strong>准确描述“中间迷失”现象；区分窗口容量与有效利用；设计位置置换实验；避免把相关性当因果解释；实施可验证的缓解方案。</div>
    <h2 class="sr-only">中间迷失原理正文</h2>

    <section class="dd-sec">
      <span class="dd-badge intuition">直觉</span>
      <h3>1. “中间迷失”具体指什么？</h3>
      <p class="dd-lead">当相关信息位于长上下文不同位置时，模型表现可能明显变化，位于中段时常更差。</p>
      <p>经典实验把同一条关键证据放在上下文开头、中间或结尾，其他条件尽量不变。部分模型呈现类似 U 形的位置曲线：首尾利用较好，中部较弱。这是经验现象，不意味着每个模型、每项任务或每个长度都必然如此。</p>
      <div class="dd-example"><strong>例子：</strong>在 30 份候选文档中只有一份包含答案。若仅改变这份文档的位置，准确率随位置变化，就说明系统对位置敏感。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">辨析</span>
      <h3>2. 上下文窗口与有效上下文有什么区别？</h3>
      <p class="dd-lead">窗口长度说明最多能输入多少 token，不保证每个 token 都被稳定、等价地利用。</p>
      <p>“支持 128K”是容量声明；“能从 128K 任意位置可靠取证”是任务表现。有效上下文还受任务难度、干扰项、检索需求、提示结构和模型版本影响。因此，不能用厂商窗口数字替代自己工作负载上的位置与长度评测。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge math">数学</span>
      <h3>3. 怎样把位置效应测成一条曲线？</h3>
      <p class="dd-lead">固定证据和问题，只改变证据的相对位置，再重复足够多样本。</p>
      <div class="dd-formula">A(p, L, d) = 在长度 L、位置 p、干扰强度 d 下的任务准确率</div>
      <p>将 p 归一化到 0 至 1，并分别报告不同长度 L 与干扰强度 d。需要随机化无关文档顺序、控制总 token 数、记录模型版本和解码参数。只比较一个开头样本和一个中间样本，无法排除样本难度和偶然波动。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">原理</span>
      <h3>4. 为什么会发生？</h3>
      <p class="dd-lead">研究观察到位置偏差，但其成因可能同时来自训练分布、模型机制与任务设计。</p>
      <p>可能因素包括首因/近因偏置、长距离检索困难、相似干扰项竞争，以及提示没有明确指出证据的结构。不同架构和训练方法会改变表现。注意力权重可作为诊断线索，却不能单独证明“模型因为某个注意力头失效而遗忘中间”。</p>
      <div class="dd-note warn"><strong>不要过度解释：</strong>现象得到复现，不等于存在一个适用于所有模型的单一机制答案。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>5. 如何降低关键证据被淹没？</h3>
      <p class="dd-lead">核心策略是减少无关上下文，并让任务与关键证据更容易彼此定位。</p>
      <ul>
        <li>先检索、重排和去重，只装配解决当前问题所需的片段。</li>
        <li>用标题、编号、来源与分隔符建立清晰结构，避免“文本墙”。</li>
        <li>将问题在证据之后重申，或把最高价值证据放在任务附近；具体位置以实验为准。</li>
        <li>复杂任务拆成检索、核验、综合多个阶段，保留中间引用。</li>
        <li>对超长资料先生成可追溯索引，而非不可核验的一段摘要。</li>
      </ul>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>6. 缓解方案怎样验证才可信？</h3>
      <p class="dd-lead">不能只测试“答案刚好在最前面”的理想布局，应覆盖位置、长度和干扰的组合。</p>
      <div class="dd-chain">建立位置基线 → 加入长度梯度 → 加入相似干扰 → 应用重排/结构方案 → 对比准确率与引用 → 分模型版本回归</div>
      <p>同时记录正确率、证据引用是否命中、延迟和 token 成本。若准确率上升但引用错误，模型可能凭先验猜对；若只在单一模板上改善，方案可能过拟合提示格式。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">边界</span>
      <h3>7. 哪些失败不能简单叫“中间迷失”？</h3>
      <p class="dd-lead">若证据未被检索、被截断、版本错误或问题本身含糊，根因不一定是位置。</p>
      <p>排查顺序应先确认最终请求中确实包含正确证据，再检查 token 截断、权限过滤、文档解析、召回与排序，最后才用位置置换判断模型利用问题。这样能避免用一个流行术语掩盖普通的数据管道故障。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">实践</span>
      <h3>8. 在产品中应设什么回归测试？</h3>
      <p class="dd-lead">模型、提示和检索器更新都可能改变有效上下文，因此位置测试应进入持续评测。</p>
      <p>保留一组可置换的多文档问答、键值检索与多跳任务；每次升级绘制分桶位置曲线，而非只报总平均分。对高风险答案要求引用证据，并在引用缺失或冲突时触发补检索或人工复核。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge math">案例推演</span>
      <h3>9. 一条位置曲线怎样算出来？</h3>
      <p class="dd-lead">把同一份退款例外证据放在 30 个等长文档的首部、中部和尾部，怎样区分真实位置效应与样本偶然？</p>
      <figure class="dd-fig"><svg viewBox="0 0 650 230" role="img" aria-label="答案证据在开头中间结尾时形成U形准确率曲线"><line x1="70" y1="180" x2="600" y2="180" stroke="#6b7484"/><line x1="70" y1="30" x2="70" y2="180" stroke="#6b7484"/><text x="335" y="214" text-anchor="middle" class="svg-t">关键证据的相对位置</text><text x="26" y="105" text-anchor="middle" class="svg-t" transform="rotate(-90 26 105)">准确率</text><polyline points="110,58 205,95 300,140 395,105 550,66" fill="none" stroke="#cf6f6f" stroke-width="3"/><circle cx="110" cy="58" r="5" fill="#cf6f6f"/><circle cx="300" cy="140" r="5" fill="#cf6f6f"/><circle cx="550" cy="66" r="5" fill="#cf6f6f"/><text x="110" y="46" text-anchor="middle" class="svg-t">85%</text><text x="300" y="158" text-anchor="middle" class="svg-t">57%</text><text x="550" y="54" text-anchor="middle" class="svg-t">80%</text><text x="110" y="198" text-anchor="middle" class="svg-t" font-size="10">开头</text><text x="300" y="198" text-anchor="middle" class="svg-t" font-size="10">中间</text><text x="550" y="198" text-anchor="middle" class="svg-t" font-size="10">结尾</text><polyline points="110,52 205,66 300,74 395,68 550,56" fill="none" stroke="#4f9d78" stroke-width="2" stroke-dasharray="7 4"/><text x="448" y="87" class="svg-t" fill="#4f9d78" font-size="10">重排并把证据放到任务附近后</text></svg><figcaption>图 1　示意性的 U 形位置曲线。红线是原始长上下文，绿虚线是检索重排后的结果；真实形状必须在具体模型、长度和任务上测量，不能把这张图当通用常数。</figcaption></figure>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>证据位置</th><th>正确 / 60</th><th>准确率</th><th>95% 区间之外还要控制</th></tr></thead><tbody><tr><td>开头 0–10%</td><td>51</td><td>85%</td><td>文档顺序、总 token、问题措辞</td></tr><tr><td>中间 45–55%</td><td>34</td><td>57%</td><td>同一证据、相似干扰项与解码参数</td></tr><tr><td>结尾 90–100%</td><td>48</td><td>80%</td><td>模型版本、随机种子与重复次数</td></tr><tr><td>中间 + 重排</td><td>46</td><td>77%</td><td>成本、引用正确率和是否只适配模板</td></tr></tbody></table></div>
      <div class="dd-note key"><strong>数值例子：</strong>原始中段为 <code>34/60≈56.7%</code>，重排后 <code>46/60≈76.7%</code>，绝对提升 20 个百分点。但若重排同时删除了 8 篇干扰文档，就不能把全部提升归因于“位置更靠后”；应再做只改位置、不改文档集合的消融。</div>
      <p><strong>最好采用配对实验。</strong>同一个问题实例分别生成开头、中间和结尾三个版本，使证据、干扰项、总长度和答案完全相同，只改变位置；这样每道题可作为自己的对照，减少题目难度差异。若任务需要两条分散证据，还应单独测试“两条都在中间”“一首一尾”“彼此相邻”等布局，因为多跳综合的失败不一定等同于单条事实检索失败。样本量较小时，百分比波动可能只是偶然，应同时给出置信区间，并在多个提示措辞上复验。</p>
      <p>产品门槛也应按风险设定：普通推荐可以容忍少量位置敏感，高风险政策或合规回答则应在每个位置桶都达到最低正确率与引用命中率，不能让较高总平均掩盖中段失效。</p>
      <div class="dd-note warn"><strong>不要只报总平均：</strong>若开头样本多、中间样本少，总分会掩盖最危险位置。至少按相对位置、上下文长度和干扰强度分桶，并报告样本量或置信区间。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">误区与路线</span>
      <h3>10. 常见误解与概念依赖</h3>
      <p class="dd-lead">这些说法把经验位置效应夸成单一机制、固定定律或所有长上下文错误的万能解释。</p>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>常见误解</th><th>更准确的理解</th></tr></thead><tbody><tr><td>支持 128K 就能可靠使用任意位置</td><td>容量是硬上限，有效利用需按任务和位置实测</td></tr><tr><td>中间信息一定最差</td><td>是常见经验模式，不同模型、长度和任务可能不同</td></tr><tr><td>注意力图能证明唯一原因</td><td>只能提供诊断线索，训练分布、干扰和提示结构也会影响</td></tr><tr><td>答案错就是中间迷失</td><td>先排查召回、解析、权限、版本与截断，再做位置置换</td></tr><tr><td>把证据放首尾即可根治</td><td>会与规则、问题和其他证据竞争；检索、结构与持续评测更重要</td></tr></tbody></table></div>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>学习层级</th><th>概念依赖与延伸学习</th></tr></thead><tbody><tr><td>先修</td><td>上下文窗口、注意力、检索与 RAG</td></tr><tr><td><strong>本页核心</strong></td><td>容量 vs 有效利用、位置置换、分桶曲线、干扰控制</td></tr><tr><td>紧邻</td><td>上下文工程、重排、上下文压缩、长上下文评测</td></tr><tr><td>工程延伸</td><td>引用与溯源、可观测性、模型回归、Agent 记忆</td></tr></tbody></table></div>
    </section>

    <div class="dd-quiz"><strong>自测：</strong><ol><li>为什么“模型支持 128K”不能证明它会可靠使用中间信息？</li><li>如何设计一个最小的位置效应实验？</li><li>发现答案错误后，为什么要先检查证据是否真的进入最终请求？</li><li>加入重排后中部准确率提高、首部准确率下降；你会怎样判断是位置偏差缓解，还是重排器把另一类证据挤出了预算？</li></ol></div>
    <details class="dd-answers"><summary>查看答案</summary><ol><li>容量与任务中的有效利用是两个不同指标。</li><li>固定问题、证据、干扰项和总长度，只置换证据位置并在多样本上比较。</li><li>检索、解析或截断故障也会造成相同表象，此时不能归因于模型位置偏差。</li><li>保存重排前后的候选、最终上下文和截断日志，在相同证据集合上只置换位置复测；若证据齐全时曲线改善才支持位置缓解，若首部所需证据已被过滤或截断，则是召回/预算回归。</li></ol></details>

    <div class="dd-src"><strong>来源与延伸阅读：</strong><ul><li><a href="https://arxiv.org/abs/2307.03172" target="_blank" rel="noopener">Liu et al., Lost in the Middle</a></li><li><a href="https://arxiv.org/abs/2404.06654" target="_blank" rel="noopener">Hsieh et al., RULER: What's the Real Context Size of Your Long-Context Language Models?</a></li><li><a href="https://aclanthology.org/2024.tacl-1.9/" target="_blank" rel="noopener">TACL publication: Lost in the Middle</a></li></ul><div class="dd-src-date">访问日期：2026-07-22</div></div>
  `
};
