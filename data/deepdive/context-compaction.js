window.DEEPDIVE['context-compaction'] = window.createDeepDive({
  title:'上下文压缩：在 token 预算内保留决策所需信息', subtitle:'理解截断、摘要、抽取、检索与提示压缩的有损本质，并设计不可丢约束、来源追踪和压缩回归。',
  thesis:'上下文压缩是在固定窗口和成本下最大化任务相关信息；任何摘要或删减都是有损变换，必须把<b>目标、约束、未决事项和证据引用</b>设为受保护状态，并能回到原文核验。',
  goals:['区分截断/摘要/抽取/检索','设计受保护状态','测压缩率与任务损失','处理递归摘要漂移'],
  sections:[
    {title:'为什么不能只保最近消息',badge:'直觉',lead:'早期的一句关键约束为何可能比最近十轮更重要？',body:'<p>时间近不等于任务价值。直接滑窗会丢目标和决定；全量保留又增加成本、冲突和中间迷失。压缩需按职责而非仅按时间选择。</p>'},
    {title:'四种压缩方式',kind:'eng',badge:'方法',lead:'不同手段丢失的信息有何不同？',body:'<ul class="dd-steps"><li>截断：便宜但不可控。</li><li>摘要：流畅但可能幻觉和抹平分歧。</li><li>抽取：保指定字段但漏未知重要信息。</li><li>外存检索：保原文但可能取不回来。</li></ul>'},
    {title:'结构化状态与叙事分离',badge:'设计',lead:'哪些内容不应交给自由摘要决定？',body:'<p>将目标、验收条件、权限、已完成、未决和失败原因放入结构化状态；对话叙事可摘要。每项保留来源消息或工具结果 id，避免摘要变成唯一事实。</p>'},
    {title:'压缩率不是唯一指标',kind:'math',badge:'度量',lead:'token 减少 90% 是否就是好压缩？',body:'<div class="dd-formula">效用 = 任务成功增益 − λ·token成本 − μ·关键信息丢失</div><p>还需测问答可恢复性、约束保持、引用一致和后续任务成功；极高压缩通常提高遗漏风险。</p>'},
    {title:'递归摘要会漂移',kind:'eng',badge:'边界',lead:'每十轮摘要上一次摘要会发生什么？',body:'<p>小误差和遗漏逐代累积，原始分歧被改写成确定结论。定期从原始日志重建，保留里程碑快照和不可压缩字段，并允许用户纠正。</p>'},
    {title:'安全与隐私',kind:'eng',badge:'治理',lead:'摘要是否天然比原文更安全？',body:'<p>摘要仍可能包含敏感数据，也可能把不可信指令固化为长期规则。压缩前后都做作用域、保留期和来源标记；删除请求应覆盖摘要、索引和缓存。</p><div class="dd-note warn"><b>“更短”不是“更相关”。</b>　压缩器必须围绕当前任务评测。</div>'}
    ,{title:'完整示例：把 18k token 项目历史压进 4k 预算',kind:'math',badge:'案例推演',lead:'怎样分配预算，既不丢验收条件，也保留足够原始证据？',body:'<p>假设系统提示与工具说明占1,200 token，当前问题和回答预留1,300，真正可供历史使用的只剩1,500。原始历史18,000 token不能按比例盲缩；先把5条目标/约束、3个未决事项和最近工具状态抽成500 token结构化状态，再给里程碑摘要500 token，最后用剩余500 token检索最相关原文片段。</p><div class="dd-formula">B<sub>history</sub>=4000−1200−1300=1500 token；压缩率=1500/18000≈8.3%</div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>预算块</th><th>token</th><th>不可接受的失败</th></tr></thead><tbody><tr><td>受保护状态</td><td>500</td><td>目标、权限、验收条件被改写</td></tr><tr><td>里程碑摘要</td><td>500</td><td>把未决争议写成已决定</td></tr><tr><td>检索原文</td><td>500</td><td>找不到支撑当前决策的证据</td></tr></tbody></table></div><p>若后续问题改为追查某次失败，预算也应重分配：保留同一份受保护状态，但摘要和原文检索围绕失败时间线重建。由此可见，压缩结果是“任务条件下的视图”，不是可永久替代原始日志的真相。</p>'}
    ,{title:'原创图：压缩器应输出状态、摘要和可回查证据三条通道',badge:'可视化',lead:'为什么一段流畅摘要不足以支撑长期 Agent？',body:'<figure class="dd-fig"><svg viewBox="0 0 735 305" role="img" aria-label="原始事件流经过分类后进入受保护状态任务摘要和可检索原文并在组装上下文时合流"><defs><marker id="cca" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#788293"/></marker></defs><rect x="20" y="112" width="125" height="75" rx="9" fill="#21252d" stroke="#65a6d9"/><text x="82" y="142" text-anchor="middle" class="svg-t">原始事件流</text><text x="82" y="166" text-anchor="middle" class="svg-t" font-size="11">消息 / 工具 / 决策</text><path d="M145,149 L210,65" stroke="#788293" marker-end="url(#cca)"/><path d="M145,149 L210,149" stroke="#788293" marker-end="url(#cca)"/><path d="M145,149 L210,233" stroke="#788293" marker-end="url(#cca)"/><rect x="215" y="34" width="180" height="62" rx="9" fill="#21252d" stroke="#cf7c72"/><text x="305" y="60" text-anchor="middle" class="svg-t">受保护状态</text><text x="305" y="81" text-anchor="middle" class="svg-t" font-size="11">字段 + 来源 + 版本</text><rect x="215" y="118" width="180" height="62" rx="9" fill="#21252d" stroke="#d3a05a"/><text x="305" y="144" text-anchor="middle" class="svg-t">任务摘要</text><text x="305" y="165" text-anchor="middle" class="svg-t" font-size="11">有损、可重建</text><rect x="215" y="202" width="180" height="62" rx="9" fill="#21252d" stroke="#8b76bd"/><text x="305" y="228" text-anchor="middle" class="svg-t">原文索引</text><text x="305" y="249" text-anchor="middle" class="svg-t" font-size="11">检索 + 权限过滤</text><path d="M395,65 L485,132" stroke="#788293" marker-end="url(#cca)"/><path d="M395,149 L485,149" stroke="#788293" marker-end="url(#cca)"/><path d="M395,233 L485,166" stroke="#788293" marker-end="url(#cca)"/><rect x="490" y="105" width="215" height="90" rx="9" fill="#21252d" stroke="#72b293"/><text x="597" y="133" text-anchor="middle" class="svg-t">按当前任务组装</text><text x="597" y="158" text-anchor="middle" class="svg-t" font-size="11">约束优先 · 证据可回查</text><text x="597" y="179" text-anchor="middle" class="svg-t" font-size="11">超预算则明确降级</text></svg><figcaption>图 1　摘要只是一路；关键状态与原始证据必须保持独立生命周期。</figcaption></figure>'}
    ,{title:'受保护状态要像数据库记录，而不是散文',kind:'eng',badge:'状态契约',lead:'怎样防止“不要改生产库”在第三次摘要后变成“谨慎修改”？',body:'<p>为每个不可丢项保存类型、规范值、来源事件、写入者、时间、作用域、版本和状态。更新采用显式事件：新约束可以替代旧约束，但旧值仍留审计记录；没有授权的外部文本只能成为候选证据，不能写入权限或系统规则。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>字段</th><th>示例</th><th>压缩规则</th></tr></thead><tbody><tr><td>goal</td><td>修复导出超时</td><td>只能由用户/任务所有者改写</td></tr><tr><td>constraint</td><td>不得改生产数据</td><td>逐字保留并标来源</td></tr><tr><td>decision</td><td>采用流式导出</td><td>保留理由与替代方案</td></tr><tr><td>open_issue</td><td>P95仍待测</td><td>禁止摘要成“已通过”</td></tr><tr><td>evidence_ref</td><td>tool:run-184</td><td>保存引用，不复制成无源事实</td></tr></tbody></table></div>'}
    ,{title:'差异化压缩：代码、对话和工具输出不能用同一摘要器',kind:'eng',badge:'策略',lead:'一条命令的退出码与一段讨论的中心思想，哪一个更该逐字保留？',body:'<p>代码修改应保留文件、行号、补丁和测试结果；工具调用保留参数、退出状态与关键输出；讨论可抽取立场、决定和未决点；长文档适合先分块检索再局部摘要。压缩器必须认识信息类型，否则会把“测试失败，exit 1”润色成“测试已运行”，或把尚未采用的建议写成最终决定。</p><p>对高风险字段采用无损抽取与模式校验，对叙事采用有损摘要，对可回查材料只存索引。若预算不足，系统应暴露“哪些证据未装入”，而不是静默假装上下文完整。</p>'}
    ,{title:'如何做压缩回归：让原文与压缩版完成同一组后续任务',kind:'eng',badge:'实验',lead:'ROUGE 很高的摘要，为什么仍可能让 Agent 做错事？',body:'<p>字面重合不等于决策信息保真。建立带原始日志的任务集，为每段历史设计后续问题：复述目标、列出不可违反约束、继续未完成步骤、解释某次决定、定位证据、响应删除请求。分别用全量历史与压缩上下文运行，比较任务成功差、约束违例、无源断言和引用命中。</p><div class="dd-formula">Δtask = success(full context) − success(compacted context)</div><p>还要做多代压力测试：连续压缩10轮后从原始事件重建，对比受保护字段和未决事项。上线监控压缩触发频率、重建次数、用户纠正率和因遗漏导致的回退；模型、摘要提示或token预算变化都要重跑回归。</p>'}
    ,{title:'常见误区与学习路线',badge:'误区与依赖',lead:'压缩的目标不是最短，而是让下一步仍能正确行动。',body:'<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>误区</th><th>更准确的理解</th></tr></thead><tbody><tr><td>保留最近消息就够</td><td>价值取决于任务职责，不取决于时间</td></tr><tr><td>摘要写得通顺就是准确</td><td>必须核对约束、分歧和来源</td></tr><tr><td>长窗口不再需要压缩</td><td>成本、干扰与中间迷失仍存在</td></tr><tr><td>向量库等于无损外存</td><td>检索失败时信息等于不可见</td></tr><tr><td>删除原文即可遗忘</td><td>摘要、索引、缓存和备份都在范围内</td></tr></tbody></table></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>依赖与延伸</th></tr></thead><tbody><tr><td>先修</td><td>上下文窗口、tokenization、检索</td></tr><tr><td><b>本页核心</b></td><td>预算分配、状态契约、有损摘要、回查</td></tr><tr><td>相邻</td><td>Agent记忆、中间迷失、上下文工程</td></tr><tr><td>工程</td><td>事件日志、版本、权限、压缩回归</td></tr></tbody></table></div><div class="dd-note warn"><b>任何不可回查的摘要都不应成为唯一事实源。</b>对安全、权限与验收条件尤其如此。</div>'}
    ,{title:'压缩触发与并发隔离',kind:'eng',badge:'运行时',lead:'应该等窗口快满才压缩吗？两个并行子任务能共用同一摘要吗？',body:'<p>触发条件可同时包含token水位、阶段完成、主题切换和高价值事件：里程碑完成时生成稳定快照，接近窗口上限时再做预算压缩。只按水位触发会在最忙乱的中间步骤改写状态，也难以复现。</p><p>并发分支应从同一版本快照派生，各自记录新增事实与决定；汇合时按来源、版本和冲突规则合并，不能让最后完成的摘要覆盖另一分支。若基础快照已更新，旧分支需显式重放或标记过期。这样可避免“任务A的结论被任务B摘要吞掉”，并让一次错误压缩可定位、可回滚。</p>'}
  ],
  chain:['窗口与成本形成预算','识别不可丢状态','按任务摘要/抽取/外存','保留原文引用和版本','用后续任务测试信息损失','周期重建并处理删除与纠正'],
  quiz:[{q:'最近截断的主要风险？',a:'丢失早期目标和关键约束。'},{q:'摘要为何有损？',a:'会遗漏、合并分歧或产生错误概括。'},{q:'哪些内容应结构化？',a:'目标、约束、状态、未决和来源。'},{q:'怎样发现递归漂移？',a:'从原始日志重建并做恢复性测试。'},{q:'压缩率高是否足够？',a:'不够，还要任务成功和关键信息保持。'}],
  sources:[{title:'MemGPT',url:'https://arxiv.org/abs/2310.08560',note:'分层上下文管理'},{title:'LLMLingua',url:'https://arxiv.org/abs/2310.05736',note:'提示压缩'},{title:'Lost in the Middle',url:'https://arxiv.org/abs/2307.03172',note:'长上下文利用边界'}]
});

// 新版教学门禁补充：压缩页逐节回答六个基础问题，并把公式改为结构化 MathML。
{
  const page = window.DEEPDIVE['context-compaction'];
  const additions = [
    '<p>上下文压缩输入完整历史、当前任务和 token 预算，输出仍足以支持下一步决策的精简上下文。它按任务价值而非消息时间选择信息；结果变短只代表装入更少 token，不代表关键事实都保住。目标、权限和验收条件无法确认时不得直接丢弃原文。</p>',
    '<p>方法选择输入信息类型、预算和可接受损失，输出截断、摘要、字段抽取或外存检索方案。截断按位置删除，摘要重新表述，抽取保指定字段，检索保原文但按需取回；应根据最不能承受的失败选择或组合，而不是把四者当成等价压缩。</p>',
    '<p>结构化状态输入目标、约束、权限、进度、未决项和来源，输出可版本化字段；叙事摘要输入其余对话，输出可重建概述。字段更新受权限和事件规则控制，摘要不能覆盖状态。来源引用仍可回查时，压缩内容才不是唯一且不可验证的事实源。</p>',
    '<p>压缩效用输入后续任务收益、token 成本、关键信息损失及权重 λ、μ，输出一个用于比较方案的综合效用。λ 表示每单位 token 成本的惩罚，μ 表示关键信息丢失的惩罚；效用更高只在同一任务和权重口径下更好，不能跨风险场景直接比较。</p>',
    '<p>递归摘要输入上一代摘要和新事件，输出更短的新摘要；每次重写都可能累积遗漏和措辞偏差。与原始日志重建结果出现分歧说明摘要漂移，而不是原始事实改变。高风险字段必须无损保存，并允许从原始事件定期重建和人工纠正。</p>',
    '<p>安全治理输入原文与摘要的数据分类、来源、作用域和删除请求，输出保留、隔离、审计与删除动作。摘要可能继续保存敏感数据，也可能把外部恶意指令固化成长期规则；更短不等于更安全。没有可信来源的文本只能作为候选证据，不能升级为系统权限。</p>',
    '<p>预算案例输入 18k 历史、4k 总窗口、系统与回答预留，输出 1500 token 历史预算及状态、摘要、原文各 500 token 的分配。Bhistory 是历史预算，压缩率是装入历史与原历史之比；8.3% 只描述长度，不证明任务信息保真。任务改变时摘要和检索必须围绕新问题重建。</p>',
    '<p>三通道设计输入原始消息、工具和决策事件，输出受保护状态、任务摘要和带权限的原文索引，随后按当前任务合流。状态保硬约束，摘要保叙事，索引负责证据回查；一段流畅摘要无法替代三者。预算不足时必须明确哪些证据未装入。</p>',
    '<p>状态契约输入不可丢事项及来源事件，输出带类型、值、写入者、时间、作用域、版本和状态的记录。更新通过显式事件替换并保留审计历史，因此“未决”不会被润色成“已通过”。只有授权主体能改写目标、权限和硬约束。</p>',
    '<p>差异化压缩输入代码、讨论、工具输出或长文档，输出与类型匹配的补丁记录、决定摘要、执行证据或检索索引。先判断哪些字段必须逐字无损，再对叙事有损摘要；退出码、权限和测试结果不能只保“中心思想”。无法容纳的证据要显式报告缺失。</p>',
    '<p>压缩回归输入同一原始历史的全量版与压缩版以及一组后续任务，输出任务成功差 Δtask、约束违例、无源断言和引用命中。success(full context) 是全量上下文成功率，success(compacted context) 是压缩上下文成功率；差值越大表示压缩损失越严重。模型、提示或预算变化后必须重跑。</p>',
    '',
    '<p>触发与并发控制输入 token 水位、任务阶段、高价值事件和分支版本，输出压缩快照、分支增量及冲突合并结果。里程碑先形成稳定快照，各分支从同一版本派生并按来源合并；最后完成不等于有权覆盖。基础版本变化后旧分支必须重放或标记过期。</p>'
  ];
  const renderedSections = page.html.split("</section>");
  additions.forEach((html, index) => { if (html) renderedSections[index] += html; });
  page.html = renderedSections.join("</section>");
  const formulas = [
    '<div class="dd-formula"><math display="block" aria-label="上下文压缩综合效用"><mi>U</mi><mo>=</mo><mi>Gtask</mi><mo>−</mo><mi>λ</mi><mo>×</mo><mi>Ctoken</mi><mo>−</mo><mi>μ</mi><mo>×</mo><mi>Lcritical</mi></math></div>',
    '<div class="dd-formula"><math display="block" aria-label="历史预算与压缩率"><mi>Bhistory</mi><mo>=</mo><mn>4000</mn><mo>−</mo><mn>1200</mn><mo>−</mo><mn>1300</mn><mo>=</mo><mn>1500</mn><mi>token</mi><mo>;</mo><mi>R</mi><mo>=</mo><mfrac><mn>1500</mn><mn>18000</mn></mfrac><mo>≈</mo><mn>8.3</mn><mo>%</mo></math></div>',
    '<div class="dd-formula"><math display="block" aria-label="压缩造成的任务成功率差"><mi>Δtask</mi><mo>=</mo><mi>success(full context)</mi><mo>−</mo><mi>success(compacted context)</mi></math></div>'
  ];
  let formulaIndex = 0;
  page.html = page.html.replace(/<div class="dd-formula">[\s\S]*?<\/div>/g, () => formulas[formulaIndex++]);
}
