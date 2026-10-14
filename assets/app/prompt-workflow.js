/* Conversation foundations: optional prompting modules, shared by both locales. */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  const zhGroups = [
        {id:'A',name:'表达意图',purpose:'把目标、用途和交付形式说清楚。',items:[
          ['A1','我已经知道要什么','直接指定结果','目标和交付物已明确，例如翻译、摘要或改写。','请完成【任务】，输出【交付物】，用于【用途】。','形式不影响使用时，可以不指定。'],
          ['A2','知道用途，但不知道该做成什么','从用途说明结果','知道要解决的问题，尚未确定文章、表格、清单等形式。','我想让【对象】解决【问题】；请建议合适的交付形式。','实际目标比输出形式更重要。'],
          ['A3','我有喜欢的参考，但不好描述','用参照表达目标','用案例表达结构、风格、节奏或判断规则。','借鉴案例的【特点】，事实依据【本次材料】；【其他特征】不是要求。','参考案例与事实材料分开说明；加案例不保证更准确。'],
          ['A4','我还没想清楚要什么','共同发现需求','需求模糊，或者无法说清不满意之处。','我遇到【问题】；先通过关键问题或候选方案帮我明确目标。','不需要先凑出一份完整需求才能开始讨论。']
        ]},
        {id:'B',name:'提供条件',purpose:'提供相关信息，并说明材料的用途与范围。',items:[
          ['B1','我的情况会影响答案','补充必要背景','个人条件、受众已有知识或使用场景会改变结果。','背景是【事实】，我的条件与已有知识是【内容】。','只补充相关条件，已经说明的信息无需重复。'],
          ['B2','必须根据指定材料回答','限定证据范围','文档问答、总结、指定材料分析。','只依据【材料】；区分材料原文、允许的推导与无法确定的内容。','资料未直接写出结论，不等于一定不能推导。'],
          ['B3','需要查证或补充外部资料','允许补充信息','事实需要核实，或现有材料不够。','可通过【允许渠道】补充信息，注明关键来源与适用时间；无法访问时说明限制。','工具是否可用、来源是否支持结论，需要实际确认。'],
          ['B4','条件不全，不知道该不该继续','处理信息缺口','缺少信息、偏好或决定，需要约定继续的边界。','影响方向或授权的缺口先问我；【低影响选择】可自行决定。事实未知时保留未知，假设情景须标明。','假设可以用于探索，不能代替事实或行动授权。'],
          ['B5','资料不能随意使用或分享','限定信息使用权限','私人资料、组织文件、外部工具或服务。','仅可使用【资料】完成【用途】，不可向【对象】提供【内容】。','实际权限与访问设置也需要落实。']
        ]},
        {id:'C',name:'控制变化',purpose:'说清保留项、底线、取舍和决定权。',items:[
          ['C1','有些地方必须保留','保留与修改','修改已有文字、代码或方案，限制改动范围。','保留【满意部分】，只修改【范围】。','指出具体部分，避免只说“别乱改”。'],
          ['C2','有些要求必须做到，有些只是希望','底线与偏好','同时存在硬性要求和可以协商的期望。','必须满足【底线】，尽量做到【偏好】。','要求越多不代表效果越好。'],
          ['C3','有些要求不能同时满足','确定冲突优先级','简洁与完整、成本与效果等目标存在取舍。','冲突时优先【目标】并说明代价；无法满足底线时提出可选调整，不自行放宽。','强硬措辞不能消除实际矛盾。'],
          ['C4','有些决定需要我来确认','划定自主决定范围','委托执行，但保留特定事项的决定权。','【事项】可自行决定，涉及【触发条件】时由我确认。','确认点由实际授权决定，不必每一步都确认。']
        ]},
        {id:'D',name:'组织复杂过程',purpose:'确定怎么协作、投入多少、何时停止。',items:[
          ['D1','任务清楚，直接做就行','直接完成','任务明确，适合直接交付和检查。','请直接完成【交付物】，本次范围是【范围】。','可以只用一句话，不必先出计划。'],
          ['D2','我想先比较方向，再决定','先探索再选择','创作、策划、选题尚未确定方向。','先提出有实质差异的方案，说明适用条件，选定后再展开。','比较的应是实质差异，不只是换个说法。'],
          ['D3','中间成果需要先由我确认','分阶段确认','后续投入依赖人的体验、选择或承诺。','先完成【阶段】，确认【关键决定】后再继续。','只在确实需要决定或检查的地方停下来。'],
          ['D4','交给 AI 推进，但投入要有限度','在资源范围内委托','研究、自动化等多步任务，需要控制投入。','在【时间或成本上限】内安排工作；达到【停止条件】时报告已完成、未完成和所需决定。','预算耗尽不等于任务完成；实际限额也需工具支持。'],
          ['D5','我要自己学会','以学习为目标协作','练习、辅导、训练自己的判断与操作能力。','先让我尝试，再按表现给提示与反馈，并用新任务检查能否独立完成。','看懂答案与自己能完成，需要分别检查。']
        ]},
        {id:'E',name:'判断与修正',purpose:'开始前定标准；获得结果后核对、比较与修正。',items:[
          ['E1','我需要明确什么算完成','按标准验收','执行前确定标准，交付后检查是否满足。','以【标准】验收，区分必需项和加分项；用【检查方法】判断未满足部分。','标准可逐步明确；不要把改目标误认为原结果变好了。'],
          ['E2','我要核对事实与依据','核查事实与依据','事实性回答、报告和重要结论需要可追溯依据。','核对【关键结论】的依据，区分事实、推导与未知；注明实际核验范围。','自查不能代替必要的来源核查或实际运行。'],
          ['E3','几个方案各有优点，难以选择','比较方案','多个方案都合理，需要按用途作取舍。','按【维度与优先级】比较，说明适用条件；权重未确定时说明它如何影响选择。','喜欢、正确与成本是不同的评价维度。'],
          ['E4','已经试过，想根据反馈改进','根据真实反馈修正','已有试用、运行结果或受众反馈。','依据【实际反馈】调整【部分】，说明仍需验证的事项。','预测不能写成已经完成的真实验证。'],
          ['E5','结果某处不对，只想改这部分','定位偏差后修改','已有初稿，能够指出具体偏差。','【位置】不符合【标准】；保留【满意部分】，将其调整到【预期】。','区分事实错误、个人偏好和不符合用途。']
        ]}
      ];
  const enGroups = [
    {id:"A",name:"Express intent",purpose:"Clarify the goal, purpose and deliverable.",items:[
      ["A1","I know what I need","Specify the result","The goal and deliverable are clear, such as a translation, summary or rewrite.","Complete [task] and provide [deliverable] for [purpose].","Omit the format if it does not affect how you use the result."],
      ["A2","I know the purpose, but not the format","Start with the purpose","You know the problem to solve, but have not chosen an article, table or checklist.","I want [audience] to solve [problem]. Suggest a suitable deliverable.","The actual goal matters more than the output format."],
      ["A3","I have a reference I like","Use a reference","Examples can express structure, style, pacing or decision rules.","Borrow [features] from the example. Use [current materials] for facts; [other features] are not requirements.","Distinguish references from factual sources. Examples do not guarantee greater accuracy."],
      ["A4","I am still working out what I want","Discover the need together","The goal is vague, or you cannot explain what feels wrong.","I am facing [problem]. Help me clarify the goal through key questions or alternative proposals.","You do not need a complete specification to start a conversation."]
    ]},
    {id:"B",name:"Provide context",purpose:"Supply relevant information and define its role and scope.",items:[
      ["B1","My circumstances affect the answer","Add relevant background","Personal circumstances, prior knowledge or the setting change the result.","The background is [facts]. My circumstances and prior knowledge are [details].","Include relevant context without repeating information already supplied."],
      ["B2","Use only the specified materials","Define the evidence boundary","Document questions, summaries and analysis of specified sources.","Use only [materials]. Distinguish direct statements, permitted inferences and unknowns.","A conclusion may be inferable even when it is not stated verbatim."],
      ["B3","More information needs to be checked","Allow additional research","Facts need checking, or the available materials are insufficient.","Use [permitted channels] to gather information. Cite key sources and relevant dates; explain any access limits.","Verify that tools are available and sources support the conclusions."],
      ["B4","Some conditions are missing","Handle information gaps","Missing facts, preferences or decisions require boundaries for continuing.","Ask about gaps affecting direction or authorization. Decide [low-impact choices] yourself. Keep unknown facts unknown and label hypothetical scenarios.","Assumptions can support exploration, but cannot replace facts or authorization."],
      ["B5","The materials have usage restrictions","Limit information use","Private data, organizational documents and external tools or services.","Use [materials] only for [purpose]. Do not share [content] with [recipients].","Actual access controls and permissions must also be configured."]
    ]},
    {id:"C",name:"Control changes",purpose:"Define what stays, what is essential and who decides.",items:[
      ["C1","Some parts must stay unchanged","Preserve and modify","Editing existing writing, code or proposals within a defined scope.","Keep [approved parts] and change only [scope].","Identify specific parts rather than only saying 'do not change too much'."],
      ["C2","Some requirements are essential","Separate requirements and preferences","Hard constraints coexist with negotiable preferences.","You must meet [requirements]. Aim for [preferences].","More constraints do not automatically improve results."],
      ["C3","The requirements conflict","Set priorities for conflicts","Goals such as brevity and completeness, or cost and quality, compete.","Prioritize [goal] and explain the trade-off. If essential requirements cannot be met, offer adjustments rather than relaxing them yourself.","Forceful wording cannot remove real contradictions."],
      ["C4","Some decisions need my approval","Define decision authority","Delegate execution while retaining authority over specific matters.","Decide [matters] yourself. Ask me when [trigger] applies.","Approval points follow actual authority; not every step needs approval."]
    ]},
    {id:"D",name:"Organize the work",purpose:"Choose how to collaborate, how much to invest and when to stop.",items:[
      ["D1","The task is clear; go ahead","Complete directly","The task is clear and can be delivered and checked directly.","Complete [deliverable] directly, within [scope].","A single sentence may suffice; a plan is not always needed."],
      ["D2","I want to compare directions first","Explore, then choose","The direction for creative work, planning or topic selection is undecided.","Propose meaningfully different options and explain when each fits. Expand the selected option afterward.","Compare substantive differences, not merely different wording."],
      ["D3","I need to approve an intermediate result","Confirm key stages","Further work depends on a person's experience, choice or commitment.","Complete [stage] first. Continue after [key decision] is confirmed.","Pause where a meaningful decision or check is needed."],
      ["D4","AI can proceed within a budget","Delegate within resource limits","Multi-step research or automation with limited resources.","Work within [time or cost limit]. At [stopping condition], report completed work, unfinished work and decisions needed.","An exhausted budget does not mean completion. Tools must enforce actual limits."],
      ["D5","I want to learn the skill myself","Collaborate for learning","Practice, tutoring and developing your own judgment and skills.","Let me try first. Give hints and feedback based on my attempt, then use a new task to check independent performance.","Understanding an answer and completing a task independently need separate checks."]
    ]},
    {id:"E",name:"Evaluate and revise",purpose:"Set standards before starting; check, compare and revise afterward.",items:[
      ["E1","I need to define what counts as done","Check against standards","Define acceptance criteria before execution and check them afterward.","Evaluate against [criteria], separating essentials from extras. Use [checking method] to identify unmet requirements.","Criteria can evolve; changing the goal is different from improving the result."],
      ["E2","I need to verify facts and evidence","Check facts and sources","Factual answers, reports and important conclusions need traceable evidence.","Check the evidence for [key conclusions]. Separate facts, inferences and unknowns; state what was actually verified.","Self-checks cannot replace necessary source checks or actual execution."],
      ["E3","Several options have different strengths","Compare alternatives","Multiple options are reasonable and need evaluation for a purpose.","Compare using [dimensions and priorities]. Explain when each fits and how undecided weights affect the choice.","Preference, correctness and cost are different evaluation dimensions."],
      ["E4","I have real feedback to work from","Revise from real feedback","A trial, execution result or audience feedback is available.","Use [observed feedback] to adjust [part]. State what still needs testing.","A prediction is not a completed real-world test."],
      ["E5","Only part of the result needs fixing","Locate and correct a mismatch","A draft exists and you can identify a specific mismatch.","[Location] does not meet [criterion]. Preserve [good parts] and revise it toward [expected result].","Distinguish factual errors, preferences and fitness for purpose."]
    ]}
  ];
  const copy = {
    "zh-Hans": {
      title:"从一句需求到可用结果", intro:"五项能力 · 23 个可选模块 · 可组合，也可跳过",
      flow:"先看整体流程", stages:["说清要做什么","按需补充要求","AI 执行任务","检查与调整"],
      hints:["A 目标 ＋ E 什么结果可用","背景、参照、边界、协作安排","按已确定的目标与范围推进","E 对照标准，核对证据与反馈"],
      bypass:"已清楚，直接开始", done:"达标 → 采用结果", example:"简单任务示例：请把这段话翻译成英文。",
      choose:"遇到什么情况？", optional:"点选场景查看写法；浏览不等于必须使用。",
      groups:"五个核心单元", scenarios:"选择当前遇到的情况", scope:"适用范围", prompt:"可以这样说", note:"使用边界",
      feedback:"未达标 → 找到问题，再调整相关部分", feedbackHint:"问题可能涉及多个单元；不必重写整段提示词。",
      feedbackLabels:["方向偏了 ↩ A","资料有问题 ↩ B","边界没守住 ↩ C","推进不合适 ↩ D","不知如何验收 ↩ E"],
      feedbackDetails:["重新明确目标与用途；必要时借助候选方案澄清。","检查材料用途、范围、版本与缺口，再补充或核实。","明确保留项、底线与优先级，调整授权范围。","调整协作安排；工具、权限或资源不足时，先处理执行条件。","明确采用标准与验证方法；需要时收集真实反馈。"],
      description:"明确任务后可以直接执行，或按需补充要求后执行。检查结果，达标则采用，不达标则回到相关单元。模块不是必填表单。",
      execution:"此处展示协作流程，不会自动启动 AI 任务。"
    },
    en: {
      title:"From a request to a usable result", intro:"Five skills · 23 optional modules · Combine or skip as needed",
      flow:"See the overall workflow", stages:["Clarify the task","Add requirements as needed","AI carries out the task","Check and adjust"],
      hints:["A Goal + E What counts as usable","Context, references, boundaries and collaboration","Proceed within the agreed goal and scope","E Check standards, evidence and feedback"],
      bypass:"Already clear? Start directly", done:"Meets the criteria → Use the result", example:"Simple example: Translate this paragraph into English.",
      choose:"What situation are you facing?", optional:"Select a situation to see wording. Browsing does not make it a requirement.",
      groups:"Five core skills", scenarios:"Choose your current situation", scope:"When to use it", prompt:"You could say", note:"Limits and considerations",
      feedback:"Not good enough? Find the cause and adjust the relevant part", feedbackHint:"An issue may involve several skills. You need not rewrite the entire prompt.",
      feedbackLabels:["Wrong direction ↩ A","Material issues ↩ B","Boundaries missed ↩ C","Process issues ↩ D","Unclear acceptance ↩ E"],
      feedbackDetails:["Clarify the goal and purpose, using alternative proposals if needed.","Check the role, scope, version and gaps in the materials, then supplement or verify.","Clarify preserved parts, requirements and priorities, and adjust authority.","Adjust collaboration. Resolve tool, permission or resource limits where needed.","Define acceptance criteria and checking methods; collect real feedback if needed."],
      description:"After clarifying the task, proceed directly or add requirements as needed. Check the result: accept it if it meets the criteria; otherwise return to the relevant skill. Modules are not required form fields.",
      execution:"This shows the collaboration workflow; it does not start an AI task."
    }
  };
  app.mountPromptWorkflow = function (root, {language = "zh-Hans"} = {}) {
    const c = copy[language] || copy["zh-Hans"];
    const groups = language === "en" ? enGroups : zhGroups;
    const q = id => root.querySelector("#" + id);
    root.classList.add("prompt-workflow");
    root.lang = language;
    root.innerHTML = `
      <header class="pw-heading"><span class="course-tag">${c.intro}</span><h3>${c.title}</h3></header>
      <div class="pw-layout">
        <section aria-labelledby="pw-flow-title">
          <h3 id="pw-flow-title">${c.flow}</h3>
          <div class="pw-flow" id="pw-flow">
            <svg class="pw-edges" id="pw-edges" aria-hidden="true"><defs><marker id="pw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path></marker></defs><g id="pw-paths" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#pw-arrow)"></g></svg>
            ${c.stages.map((label,i) => `<div class="pw-stage" id="pw-stage-${i+1}"><button type="button" class="pw-button pw-stage-button" data-pw-stage="${i+1}" aria-controls="pw-detail" aria-pressed="${i===0}">${i+1} · ${label}</button><div class="pw-stage-hint">${c.hints[i]}</div></div>`).join("")}
            <div class="pw-bypass" id="pw-bypass">${c.bypass}</div>
          </div>
          <p class="pw-caption">${c.done}</p><p class="pw-muted">${c.example}</p>
          <p class="pw-muted" id="pw-execution" hidden>${c.execution}</p>
        </section>
        <section aria-labelledby="pw-choose-title">
          <h3 id="pw-choose-title">${c.choose}</h3><p class="pw-muted">${c.optional}</p>
          <div class="pw-categories" id="pw-categories" role="group" aria-label="${c.groups}"></div>
          <h4 id="pw-category-name"></h4><p id="pw-category-purpose" class="pw-muted"></p>
          <div class="pw-modules" id="pw-modules" role="group" aria-label="${c.scenarios}"></div>
          <div class="pw-detail" id="pw-detail" aria-live="polite" aria-atomic="true">
            <h4 id="pw-module-name"></h4>
            <dl><dt>${c.scope}</dt><dd id="pw-scope"></dd><dt>${c.prompt}</dt><dd class="pw-prompt" id="pw-prompt"></dd><dt>${c.note}</dt><dd id="pw-note"></dd></dl>
          </div>
        </section>
      </div>
      <section class="pw-feedback" aria-labelledby="pw-feedback-title"><h3 id="pw-feedback-title">${c.feedback}</h3>
        <div class="pw-feedback-links" id="pw-feedback"></div><p class="pw-muted" id="pw-feedback-detail" aria-live="polite">${c.feedbackHint}</p>
      </section><p class="sr-only">${c.description}</p>`;
    let state = {group:"A",module:"A1",stage:1,feedback:null};
    let renderedGroup = null;
    let frame = 0;
    let disposed = false;
    const stageMap = {1:["A","A1"],2:["B","B1"],3:["D","D1"],4:["E","E1"]};
    const feedbackMap = [["A","A4"],["B","B2"],["C","C1"],["D","D3"],["E","E1"]];
    const stageFor = group => group === "A" ? 1 : group === "E" ? 4 : 2;
    function button(text, attr, value, handler) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "pw-button"; b.textContent = text;
      b.setAttribute(attr, value); b.setAttribute("aria-controls","pw-detail");
      b.addEventListener("click",handler); return b;
    }
    function select(group,module,stage,feedback = null) {
      state = {group,module,stage,feedback}; render();
    }
    groups.forEach(g => q("pw-categories").append(button(g.id+" "+g.name,"data-pw-group",g.id,() => select(g.id,g.items[0][0],stageFor(g.id)))));
    feedbackMap.forEach(([group,module],i) => q("pw-feedback").append(button(c.feedbackLabels[i],"data-pw-feedback",i,() => select(group,module,stageFor(group),i))));
    root.querySelectorAll("[data-pw-stage]").forEach(b => b.addEventListener("click",() => {
      const stage = Number(b.dataset.pwStage); select(...stageMap[stage],stage);
    }));
    function scheduleEdges() {
      cancelAnimationFrame(frame);
      if (!disposed) frame = requestAnimationFrame(drawEdges);
    }
    function render() {
      const g = groups.find(g => g.id === state.group), m = g.items.find(m => m[0] === state.module);
      q("pw-category-name").textContent = g.id+" · "+g.name;
      q("pw-category-purpose").textContent = g.purpose;
      root.querySelectorAll("[data-pw-group]").forEach(b => b.setAttribute("aria-pressed",String(b.dataset.pwGroup === g.id)));
      root.querySelectorAll("[data-pw-stage]").forEach(b => b.setAttribute("aria-pressed",String(Number(b.dataset.pwStage) === state.stage)));
      root.querySelectorAll("[data-pw-feedback]").forEach(b => b.setAttribute("aria-pressed",String(Number(b.dataset.pwFeedback) === state.feedback)));
      // Keep the selected button in the DOM so keyboard focus survives selection.
      if (renderedGroup !== g.id) {
        q("pw-modules").replaceChildren(...g.items.map(item => button(item[1],"data-pw-module",item[0],() => select(g.id,item[0],state.stage,state.feedback))));
        renderedGroup = g.id;
      }
      root.querySelectorAll("[data-pw-module]").forEach(b => b.setAttribute("aria-pressed",String(b.dataset.pwModule === m[0])));
      q("pw-module-name").textContent = m[0]+" · "+m[2];
      q("pw-scope").textContent = m[3]; q("pw-prompt").textContent = m[4]; q("pw-note").textContent = m[5];
      q("pw-feedback-detail").textContent = state.feedback === null ? c.feedbackHint : c.feedbackDetails[state.feedback];
      q("pw-execution").hidden = state.stage !== 3;
      scheduleEdges();
    }
    function drawEdges() {
      if (disposed || !root.isConnected) return;
      const r = q("pw-flow").getBoundingClientRect(); if (!r.width) return;
      const boxes = [1,2,3,4].map(n => {
        const b = q("pw-stage-"+n).getBoundingClientRect();
        return {x:b.left-r.left,y:b.top-r.top,w:b.width,h:b.height};
      });
      q("pw-edges").setAttribute("viewBox","0 0 "+r.width+" "+r.height);
      const paths = [];
      for(let i=0;i<3;i++) { const a=boxes[i],b=boxes[i+1],x=a.x+a.w/2; paths.push("M "+x+" "+(a.y+a.h+6)+" L "+x+" "+(b.y-8)); }
      const a=boxes[0],b=boxes[2],start=a.y+20,end=b.y+20;
      paths.push("M "+(a.x-6)+" "+start+" H 26 V "+end+" H "+(b.x-7));
      q("pw-paths").replaceChildren(...paths.map(d => {const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",d);return p;}));
      q("pw-bypass").style.top = ((start+end)/2-q("pw-bypass").offsetHeight/2)+"px";
    }
    const observer = new ResizeObserver(scheduleEdges);
    observer.observe(q("pw-flow"));
    render();
    return () => {disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
  };
})(window);

