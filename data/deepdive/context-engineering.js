window.DEEPDIVE = window.DEEPDIVE || {};

window.DEEPDIVE['context-engineering'] = {
  title: '上下文工程：设计模型在这一刻真正能看见的信息',
  subtitle: '把提示词、检索证据、工具结果、记忆与历史消息当成有限预算下的信息系统，而不是把所有文本一股脑塞进窗口。',
  thesis: '上下文工程是在有限窗口内，对<b>规则、任务、证据、历史、工具结果和记忆</b>进行选择、排序、压缩、标注与更新；目标不是塞入最多文字，而是提供完成当前任务所需的最小充分且可追溯的信息。',
  html: `
    <div class="dd-goals"><strong>读完你应该能：</strong>区分提示工程与上下文工程；列出一次调用的上下文来源；分配 token 预算；设计检索、排序与压缩流程；处理来源、时效和提示注入风险。</div>
    <h2 class="sr-only">上下文工程原理正文</h2>

    <section class="dd-sec">
      <span class="dd-badge intuition">直觉</span>
      <h3>1. 模型回答时究竟“知道”什么？</h3>
      <p class="dd-lead">模型参数提供一般能力，而当前输出直接受这次调用中可见的上下文约束。</p>
      <p>一次实际调用可能包含系统规则、用户请求、会话历史、检索片段、工具返回、长期记忆、代码与输出格式。上下文工程就是决定这些信息如何被选择、转换、排序、标注和更新，使模型在有限窗口中拿到完成任务所需的最小充分证据。</p>
      <div class="dd-note"><strong>边界：</strong>提示工程重点打磨指令表达；上下文工程还管理外部信息的完整生命周期。两者重叠，但后者的系统范围更大。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>2. 上下文由哪些层组成？</h3>
      <p class="dd-lead">先按职责分层，才能处理冲突、更新和可观测性。</p>
      <ul>
        <li><strong>规则层：</strong>系统约束、权限、输出契约。</li>
        <li><strong>任务层：</strong>用户目标、验收条件、当前状态。</li>
        <li><strong>证据层：</strong>检索文档、数据库记录、工具结果与引用。</li>
        <li><strong>记忆层：</strong>跨轮偏好、已确认事实、阶段性摘要。</li>
        <li><strong>示例层：</strong>少样本示范和边界案例。</li>
      </ul>
      <p>每段内容最好带来源、时间、可信度和作用域。冲突时按明确的权限规则处理，而不是默认“离模型最近的文字最可信”。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge math">数学</span>
      <h3>3. token 预算应怎样分配？</h3>
      <p class="dd-lead">窗口足够装下不等于模型能同等有效地使用全部内容，还要给输出和工具往返留余量。</p>
      <div class="dd-formula">B<sub>window</sub> ≥ B<sub>rules</sub> + B<sub>task</sub> + B<sub>evidence</sub> + B<sub>history</sub> + B<sub>output reserve</sub></div>
      <p>先锁定不可删的规则、任务与输出预算，再将剩余容量分给高价值证据和必要历史。可按“预期信息增益 ÷ token 成本”排序候选片段；重复、过期和低置信内容应被去重、压缩或舍弃。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>4. 为什么检索到了还不够？</h3>
      <p class="dd-lead">召回只是找到候选，模型最终读到什么还取决于重排、切块、组织与引用。</p>
      <div class="dd-chain">查询改写 → 多路召回 → 权限/时效过滤 → 重排去重 → 邻接扩展 → 结构化装配 → 带引用生成</div>
      <p>切块需要保留标题、文档路径和相邻语境；重排要围绕当前子问题，而非只看语义相似度。关键结论可放在任务附近并用清晰标签组织，避免重要证据淹没在长上下文中。</p>
      <div class="dd-example"><strong>例子：</strong>回答 API 迁移问题时，与其检索十篇泛教程，不如保留当前版本迁移指南、受影响接口定义和项目中的实际调用位置，并注明各自版本。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">直觉</span>
      <h3>5. 历史和记忆为什么不能无限累积？</h3>
      <p class="dd-lead">旧上下文会过期、相互矛盾并消耗注意力，因此记忆是一项有写入和淘汰规则的数据治理工作。</p>
      <p>短期历史用于保持当前任务连续；阶段摘要保存已经验证的决定；长期记忆只记录跨任务仍有价值的稳定事实。每条记忆应能被更新或撤销，敏感信息要设作用域和保留期。摘要必须保留未解决问题、关键约束和证据链接，不能只留下流畅叙事。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>6. 外部文本如何避免变成隐形指令？</h3>
      <p class="dd-lead">检索文档和网页属于不可信数据，即使其中写着“忽略此前规则”。</p>
      <p>把外部内容放入明确的数据边界，保留来源和内容类型；工具调用采用最小权限与参数校验；高风险动作要求独立授权；输出引用回原证据。不要仅靠一句“忽略提示注入”防守，因为模型仍可能混淆数据与指令。</p>
      <div class="dd-note warn"><strong>检查：</strong>上下文质量不仅是相关性，还包括权限正确、来源可靠、时间有效和内容安全。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">工程</span>
      <h3>7. 如何观测并调试上下文系统？</h3>
      <p class="dd-lead">必须能重建“模型当时看见了什么”，否则失败只能被笼统归咎于模型。</p>
      <p>记录经过脱敏的最终上下文、各片段来源与得分、token 占用、裁剪原因、模型版本和输出引用。评测时分别测召回命中、排序质量、上下文忠实度、答案正确性和成本；用消融实验逐层移除内容，判断哪一层真正贡献了结果。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">辨析</span>
      <h3>8. “更长上下文”为什么不等于“更好系统”？</h3>
      <p class="dd-lead">容量解决的是能否放入，工程解决的是是否放对、摆对并及时更新。</p>
      <p>长窗口仍可能遭遇中间信息利用率下降、冲突证据、延迟和成本增长。成熟方案会先定义所需证据，再检索和压缩，并对关键位置、引用和失败路径进行评测，而不是把所有历史直接拼接。</p>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">运行示例</span>
      <h3>9. 一次 16K 退款问答怎样装配？</h3>
      <p class="dd-lead">用户问“签收 35 天、商品有质量问题还能退吗”，系统怎样把有限窗口变成最小充分证据包？</p>
      <figure class="dd-fig"><svg viewBox="0 0 650 210" role="img" aria-label="上下文工程从候选信息池过滤排序到最终上下文包"><defs><marker id="ce1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#6b7484"/></marker></defs><rect x="18" y="45" width="130" height="92" rx="8" fill="#21252d" stroke="#d3a05a"/><text x="83" y="70" text-anchor="middle" class="svg-t">候选信息池</text><text x="83" y="91" text-anchor="middle" class="svg-t" font-size="10">历史 · 检索 · 工具</text><text x="83" y="110" text-anchor="middle" class="svg-t" font-size="10">记忆 · 示例</text><path d="M148,91 L206,91" stroke="#6b7484" marker-end="url(#ce1)"/><rect x="208" y="45" width="140" height="92" rx="8" fill="#21252d" stroke="#4f9d78"/><text x="278" y="70" text-anchor="middle" class="svg-t">策略装配器</text><text x="278" y="91" text-anchor="middle" class="svg-t" font-size="10">权限/时效过滤</text><text x="278" y="110" text-anchor="middle" class="svg-t" font-size="10">重排 · 去重 · 压缩</text><path d="M348,91 L406,91" stroke="#6b7484" marker-end="url(#ce1)"/><rect x="408" y="32" width="224" height="118" rx="8" fill="#21252d" stroke="#6b8cbe"/><text x="520" y="56" text-anchor="middle" class="svg-t">最终上下文包</text><text x="520" y="78" text-anchor="middle" class="svg-t" font-size="10">受保护规则 + 当前任务</text><text x="520" y="97" text-anchor="middle" class="svg-t" font-size="10">订单事实 + 政策 A/B + 来源</text><text x="520" y="116" text-anchor="middle" class="svg-t" font-size="10">输出 schema + 4K 输出预留</text><text x="520" y="135" text-anchor="middle" class="svg-t" font-size="10">不含旧闲聊与无关到账说明</text><path d="M520,152 C515,193 278,194 278,139" fill="none" stroke="#6b7484" marker-end="url(#ce1)"/><text x="400" y="190" text-anchor="middle" class="svg-t" font-size="10">引用/失败回流，更新检索与装配策略</text></svg><figcaption>图 1　上下文工程是可观测的数据管道：候选内容先过权限、时效、相关性与预算，再进入最终请求；模型输出与引用结果反过来帮助诊断装配错误。</figcaption></figure>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>预算项</th><th>候选</th><th>最终</th><th>装配决定</th></tr></thead><tbody><tr><td>规则/任务</td><td>1K</td><td>1K</td><td>受保护，不由外部文档覆盖</td></tr><tr><td>历史</td><td>6K</td><td>1K</td><td>只保留订单号、签收日和已确认质量问题</td></tr><tr><td>证据</td><td>18K</td><td>5K</td><td>保留 30 天一般规则、质量例外及版本元数据</td></tr><tr><td>示例/schema</td><td>2K</td><td>1K</td><td>保留一条边界示例和输出契约</td></tr><tr><td>输出/工具余量</td><td>0</td><td>4K</td><td>避免回答或二次核验被截断</td></tr></tbody></table></div>
      <div class="dd-note key"><strong>逐步演算：</strong>候选总量 <code>1+6+18+2=27K</code>，无法进入 16K 窗口。装配后输入 <code>1+1+5+1=8K</code>，加 4K 输出/工具余量为 12K，还留 4K 安全空间。被删除的是低价值重复和旧闲聊，不是随机截掉最早文本。</div>
      <p><strong>“最小充分”不是字数最少。</strong>如果退款结论依赖一般规则、质量例外、订单日期和证据版本，那么四项缺一都不充分；反过来，十段重复政策即使相关，也不增加决定所需信息。装配器应围绕验收条件定义必要字段，再为每个字段选择最可信、最新且权限允许的证据。</p>
      <div class="dd-note warn"><strong>失败边界：</strong>压缩若把“质量问题不受 30 天限制”缩成“退款期限 30 天”，省下 token 却改变了事实。摘要必须保留例外、否定、数值、未解决项和来源；高风险字段可用结构化记录而非自由摘要。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge eng">评测</span>
      <h3>10. 怎样证明装配策略真的更好？</h3>
      <p class="dd-lead">最终答案变好或变差时，怎样区分是召回、筛选、压缩、排序还是模型本身造成的？</p>
      <p>先把成功事件拆成可观察关卡：必要证据被召回、经过权限与时效过滤后仍被保留、压缩没有改变关键事实、模型实际使用证据、答案通过业务验收。它们不是一个平均分可以互相补偿的条件；任何关键关卡失败，都可能使最终回答失败。</p>
      <div class="dd-formula">任务成功 = 必要证据召回 ∧ 装配后保留 ∧ 关键事实保真 ∧ 回答使用证据 ∧ 业务验收通过</div>
      <div class="dd-table-wrap"><table class="dd-table">
        <thead><tr><th>同一批 20 个退款问题</th><th>正确</th><th>平均输入</th><th>暴露的结论</th></tr></thead>
        <tbody>
          <tr><td>全部候选直接拼接</td><td>12/20</td><td>15.2K</td><td>噪声和冲突多，容量接近上限</td></tr>
          <tr><td>过滤 + 重排 + 保留例外</td><td><b>17/20</b></td><td>8.1K</td><td>更短但证据覆盖更完整</td></tr>
          <tr><td>在上一方案中删掉质量例外</td><td>11/20</td><td>7.5K</td><td>600 token 的节省破坏关键切片</td></tr>
          <tr><td>保留例外但去掉来源元数据</td><td>15/20</td><td>7.8K</td><td>答案可能正确，却难以验证版本与引用</td></tr>
        </tbody>
      </table></div>
      <p>这是一个教学用消融表，不是普适性能数字。真实项目应冻结问题、知识库快照、模型和评分规则，每次只移除或替换一个组件，并保留逐样本差异。若“删掉例外”只伤害质量问题切片，总体平均值可能掩盖风险；因此还要按任务、语言、权限和证据版本切片。</p>
      <div class="dd-note key"><strong>诊断顺序：</strong>先检查必要证据是否进入候选池，再检查它是否被过滤、压缩或截断，随后检查模型是否引用并正确使用，最后才比较模型版本。这样才能把“答错了”变成一个可修复的管道故障。</div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">误区与路线</span>
      <h3>11. 常见误解与概念依赖</h3>
      <p class="dd-lead">下面这些说法把“容量”“相关性”“摘要”和“记忆”误当成无需治理的文本堆叠。</p>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>常见误解</th><th>更准确的理解</th></tr></thead><tbody><tr><td>上下文工程就是写更长提示</td><td>还管理检索、权限、历史、记忆、工具结果、预算和可观测性</td></tr><tr><td>相关片段越多越保险</td><td>重复与冲突会稀释关键证据；要围绕当前子问题重排去重</td></tr><tr><td>摘要一定保真</td><td>摘要会丢否定、例外和来源，必须按字段验收并可追溯</td></tr><tr><td>长期记忆写入越多越懂用户</td><td>错误、过期和敏感记忆会持续污染；需要作用域、撤销与保留期</td></tr><tr><td>模型答错就是模型不够强</td><td>应先重建最终上下文，区分召回、装配、截断、证据和生成失败</td></tr></tbody></table></div>
      <div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>学习层级</th><th>概念依赖与延伸学习</th></tr></thead><tbody><tr><td>先修</td><td>上下文窗口、提示工程、检索与 RAG</td></tr><tr><td><strong>本页核心</strong></td><td>信息分层、预算分配、策略装配、来源/时效、记忆治理、可观测性</td></tr><tr><td>紧邻</td><td>中间迷失、上下文压缩、Agent 记忆、提示注入</td></tr><tr><td>工程延伸</td><td>重排、引用与溯源、评测、提示缓存、隐私与数据治理</td></tr></tbody></table></div>
    </section>

    <section class="dd-sec">
      <span class="dd-badge intuition">自测</span>
      <h3>12. 检查你是否真的理解</h3>
      <p class="dd-lead">请不要只复述术语，而要能为退款案例画出候选池、装配决定和失败归因。</p>
      <ol class="dd-quiz">
        <li>上下文工程为何不只是“写一个更长的 prompt”？</li>
        <li>16K 案例为什么只用了 8K 输入，而不是把剩余空间全部塞满？</li>
        <li>检索命中正确文档后，还需经过哪些关键步骤？</li>
        <li>长期记忆为什么必须支持更新、撤销和作用域？</li>
        <li>消融实验里删掉质量例外后，为什么总体平均分可能仍掩盖风险？</li>
      </ol>
      <details class="dd-answers"><summary>查看答案</summary><ol>
        <li>它还管理检索、工具结果、历史、记忆、权限、时效、token 预算、压缩、来源和可观测性。</li>
        <li>需要给输出、工具往返和长度波动留余量；目标是最小充分，不是把窗口填满。</li>
        <li>权限与时效过滤、围绕子问题重排、去重、补相邻语境、保真压缩、结构化装配、引用和最终验收。</li>
        <li>用户事实和环境会变化；错误、过期或越界记忆会持续污染后续任务，也可能扩大隐私暴露。</li>
        <li>质量问题可能只是少数切片；大量普通问题仍答对，会把这个高风险切片的明显退化平均掉。</li>
      </ol></details>
    </section>

    <div class="dd-src"><strong>来源与延伸阅读：</strong><ul><li><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener">Lewis et al., Retrieval-Augmented Generation</a>：外部检索证据如何进入生成链。</li><li><a href="https://arxiv.org/abs/2307.03172" target="_blank" rel="noopener">Liu et al., Lost in the Middle</a>：信息位置与长上下文有效利用的差距。</li><li><a href="https://arxiv.org/abs/2310.08560" target="_blank" rel="noopener">Packer et al., MemGPT</a>：分层记忆与有限上下文管理。</li><li><a href="https://arxiv.org/abs/2308.14508" target="_blank" rel="noopener">Bai et al., LongBench</a>：跨任务长上下文理解评测。</li></ul><div class="dd-src-date">访问日期：2026-07-22</div></div>
  `
};
