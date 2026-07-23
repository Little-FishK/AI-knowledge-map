/* 理解原理页 —— 越狱 Jailbreak */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["jailbreak"] = {
  title: "越狱 Jailbreak",
  subtitle: "用精心构造的输入诱导模型越过原本的行为边界",
  aliases: "Jailbreak · Safety Bypass · 安全绕过",
  meta: "建议 25–35 分钟 · 中级 · 需要：AI 对齐、提示注入、护栏",
  thesis: "越狱攻击利用模型在<b>遵循指令、续写模式与执行安全策略</b>之间的不稳定冲突，使其输出原本会拒绝的内容。它针对模型的行为防线；提示注入则常针对应用的指令层级与工具权限。两者可组合，因此防御必须覆盖模型、上下文和执行层。",
  html: `
<div class="dd-goals"><div class="dd-goals-h">读完这一页，你应该能自己回答：</div><ul><li>越狱与提示注入有什么交集和区别？</li><li>为什么换一种编码或叙事形式可能绕过拒答？</li><li>通用后缀攻击在优化什么？</li><li>为什么补丁式关键词过滤总会漏掉变体？</li><li>怎样设计不泄露危险细节的安全评测？</li></ul></div>
<div class="dd-note key"><b>安全说明</b>　本页解释机制与防御，不提供可直接复用的攻击提示。理解越狱的目的，是建立测试分类、纵深防御和事件响应能力。</div>

<section class="dd-sec"><h2><span class="dd-n">1</span>行为边界不是形式证明<span class="dd-badge intuition">直觉</span></h2><p class="dd-lead">模型平时会拒绝，为什么换个说法就可能答？</p><p>安全训练让大量危险输入附近的输出概率偏向拒绝，但自然语言空间巨大，训练不可能覆盖每种语言、编码、角色扮演和多轮组合。攻击者寻找的是训练分布之外、仍能触发不安全续写的表达。</p></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>越狱与提示注入<span class="dd-badge intuition">消歧</span></h2><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th></th><th>越狱</th><th>提示注入</th></tr></thead><tbody><tr><td>主要目标</td><td>绕过模型内容或行为限制</td><td>改变应用原本指令与工具行为</td></tr><tr><td>攻击面</td><td>模型策略与分类器</td><td>不可信文本、检索内容、工具输出</td></tr><tr><td>典型后果</td><td>生成被禁止内容</td><td>泄密、错误工具调用、越权动作</td></tr></tbody></table></div><p>一个注入可以先夺取指令控制，再用越狱绕过内容防线，两者不能只选一个防。</p></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>攻击怎样搜索薄弱区域<span class="dd-badge math">机制</span></h2><p class="dd-lead">所谓“通用后缀”为什么能迁移到多个问题？</p><p>白盒攻击可优化一段 token，使模型在多种危险请求后更倾向于产生肯定式开头或目标序列。形式上是在约束 token 空间中降低目标输出的负对数概率。迁移成功说明多个模型可能共享相似训练数据、表示和安全策略，但迁移不是必然。</p><div class="dd-formula">suffix* = arg min<sub>suffix</sub> Σ −log P(target | request + suffix)</div></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>为什么关键词黑名单不够<span class="dd-badge eng">工程</span></h2><p>同一意图可被翻译、拆字、编码、隐喻或分散到多轮；严格黑名单又会误伤正常的研究、新闻和防御讨论。更稳健的系统按语义与上下文评估风险，并把内容判断与工具权限分开。</p></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>纵深防御<span class="dd-badge eng">工程</span></h2><ul class="dd-steps"><li>用多样化对抗数据继续训练模型和安全分类器。</li><li>输入与输出联合判断，保留会话上下文。</li><li>对工具使用最小权限、参数校验和人工审批。</li><li>限制敏感数据进入上下文，避免成功越狱后直接泄露。</li><li>监控变体、异常重试与攻击成功率，快速更新门禁。</li></ul><div class="dd-note warn"><b>拒答成功不等于系统安全。</b>　如果模型能访问高权限工具，真正的门禁必须在执行器，而不是依赖它每次都说“不”。</div></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>怎样安全评测<span class="dd-badge eng">评测</span></h2><p class="dd-lead">不能公开危险答案时，怎样测防御？</p><p>使用分级危害类别、封闭测试集和只记录是否越界的评分器；同时测正常请求误拒率。对多轮、不同语言、编码和自适应攻击分别切片，并让红队在受控环境中测试工具副作用。报告模型与防线版本，因为补丁会迅速改变结果。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>把因果链连起来<span class="dd-badge intuition">综合</span></h2><ol class="dd-chain"><li>安全训练只覆盖巨大输入空间的一部分。</li><li>攻击者搜索拒答策略的分布外薄弱点。</li><li>编码、角色和优化后缀产生大量变体。</li><li>关键词补丁无法覆盖语义等价表达。</li><li>模型与分类器降低成功率，执行权限限制后果。</li><li>持续对抗评测才能跟上攻击迁移。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>常见误解与自测<span class="dd-badge intuition">自测</span></h2><ol class="dd-quiz"><li>越狱为何不是模型“知道密码”？</li><li>它和提示注入的主要目标分别是什么？</li><li>通用后缀优化的对象是什么？</li><li>为什么必须同时测误拒率？</li><li>工具层如何限制越狱后果？</li></ol><details class="dd-answers"><summary>参考答案</summary><ol><li>它是在高维输入空间寻找策略失效的表达。</li><li>一个绕过行为限制，一个夺取应用指令控制。</li><li>让目标输出在多类请求上的条件概率升高。</li><li>过严防御会让正常用途不可用。</li><li>最小权限、参数约束、审批和沙箱不依赖模型自律。</li></ol></details></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://arxiv.org/abs/2307.15043" target="_blank" rel="noopener">Universal and Transferable Adversarial Attacks on Aligned Language Models</a>：通用后缀攻击。</li><li><a href="https://arxiv.org/abs/2404.01318" target="_blank" rel="noopener">JailbreakBench</a>：开放且可复现的越狱评测框架。</li><li><a href="https://www.anthropic.com/research/constitutional-classifiers" target="_blank" rel="noopener">Constitutional Classifiers</a>：分类器防御与大规模红队。</li></ul><div class="dd-src-date">访问日期：2026-07-22</div></div>`
};
