'use strict';
// Runs in the released page AND in browser acceptance. Never changes words,
// formulas, font sizes, visibility, or the semantic candidate.
async function repairLayout(article) {
  await document.fonts.ready;
  const records=[];
  for(const [index,svg] of [...article.querySelectorAll('svg')].entries()) {
    // Activation charts have a range caption beneath the x-axis ticks. Keep
    // that formula on its own row before generic label wrapping measures it.
    if(['relu','sigmoid','tanh'].includes(svg.dataset.activation)&&svg.getAttribute('viewBox')==='0 0 260 240'){
      const caption=[...svg.querySelectorAll('text')].find(t=>t.getAttribute('x')==='130'&&t.getAttribute('y')==='225');
      const frame=svg.querySelector('rect[x="6"][y="6"][width="248"][height="228"]');
      if(caption&&frame){caption.setAttribute('y','245');frame.setAttribute('height','248');svg.setAttribute('viewBox','0 0 260 260');records.push({round:1,kind:'space-activation-chart-caption',svgIndex:index});}
    }
    const diagramLabel=svg.getAttribute('aria-label');
    if(diagramLabel==='Data split into training, validation, and test sets'&&svg.getAttribute('viewBox')==='0 0 560 96'){
      const bars=[...svg.querySelectorAll('rect')],texts=[...svg.querySelectorAll('text')];
      if(bars.length===3&&texts.length===6){
        // Stack the three proportional bars so longer captions have a full row.
        // Widths still encode the original split; all labels retain their text.
        for(let i=0;i<3;i++){
          bars[i].setAttribute('x','20');bars[i].setAttribute('y',String(40+108*i));
          for(const [text,y] of [[texts[i],25+108*i],[texts[i+3],90+108*i]]){
            text.setAttribute('x','20');text.setAttribute('y',String(y));text.setAttribute('text-anchor','start');
          }
        }
        svg.setAttribute('viewBox','0 0 560 328');svg.style.minWidth='560px';
        records.push({round:1,kind:'stack-data-split-bars',svgIndex:index});
      }
    }
    if(!svg.dataset.translationReviewedSpacing&&diagramLabel==='Number of examples and effectiveness: large gains from 0 to a few, then plateauing'){
      for(const text of svg.querySelectorAll('text')){
        if(text.textContent==='After that, marginal returns decline and they also consume the context window.'){text.setAttribute('x','150');text.setAttribute('y','20');}
        if(text.textContent==='Number of examples')text.setAttribute('y','220');
      }
      svg.setAttribute('viewBox','0 0 520 240');
    }
    if(!svg.dataset.translationReviewedSpacing&&diagramLabel==="Instructions and data are the same string of tokens in the model's eyes"){
      const label=[...svg.querySelectorAll('text')].find(t=>t.textContent==='Webpage body (data to be processed)');
      if(label)label.setAttribute('x','250');
    }
    // Reviewed English diagrams need larger geometric spacing, while keeping
    // their words, relationships and readable font size unchanged.
    const reviewedDiagram=[
       'Attention gives the same result when word order is scrambled, so positional encoding is needed.',
       'Comparison of the same refund policy using fixed chunking and structured parent-child chunking',
       'Untrusted input passes in order through input, context, model, output, and the tool execution guardrail, with runtime monitoring covering the entire path',
       'Refund requests routed by escalation score to the small model and strong model and fed back through sampled audit.',
       'Comparison of exact vector scan and HNSW hierarchical nearest-neighbor graph search',
       'Five-Step Loop of Tool Calling','Reliability diagram for three confidence buckets and human handoff threshold','RAG three steps: Retrieval, Augmentation, Generation',
       'Without a standard: M×N custom integrations, messy','Composition of a few-shot prompt: several examples plus one query',
       'Number of examples and effectiveness: large gains from 0 to a few, then plateauing',"Instructions and data are the same string of tokens in the model's eyes"].includes(diagramLabel);
    if(reviewedDiagram&&!svg.dataset.translationReviewedSpacing){
      const shapes=[...svg.querySelectorAll('rect,text,path,line,circle,polyline')].filter(el=>!el.closest('defs'));
      const safe=shapes.every(el=>(!el.hasAttribute('d')||(el.getAttribute('d').match(/[a-z]/gi)||[]).every(c=>'MLHVCSQTZmlhvcsqtz'.includes(c)))&&
        (!el.hasAttribute('transform')||['rotate(-90 20 115)','rotate(-90 30,90)'].includes(el.getAttribute('transform'))));
      if(safe){
        const scale=2.5;
        for(const el of shapes){
          for(const attr of ['x','y','width','height','rx','ry','x1','x2','y1','y2','cx','cy','r'])if(el.hasAttribute(attr)&&Number.isFinite(Number(el.getAttribute(attr))))el.setAttribute(attr,String(Number(el.getAttribute(attr))*scale));
          if(el.hasAttribute('d'))el.setAttribute('d',el.getAttribute('d').replace(/-?\d*\.?\d+/g,n=>String(Number(n)*scale)));
          if(el.hasAttribute('points'))el.setAttribute('points',el.getAttribute('points').replace(/-?\d*\.?\d+/g,n=>String(Number(n)*scale)));
          if(el.hasAttribute('transform'))el.setAttribute('transform',el.getAttribute('transform')==='rotate(-90 20 115)'?'rotate(-90 50 287.5)':'rotate(-90 75 225)');
        }
        const v=svg.viewBox.baseVal;svg.setAttribute('viewBox',`${v.x*scale} ${v.y*scale} ${v.width*scale} ${v.height*scale}`);
        svg.style.minWidth=svg.viewBox.baseVal.width+'px';svg.dataset.translationReviewedSpacing='true';
        records.push({round:1,kind:'space-reviewed-english-diagram',svgIndex:index});
      }
    }
    if(svg.getAttribute('aria-label')==='U-shaped accuracy curve when answer evidence is at the beginning, middle, and end'&&!svg.dataset.translationAxisExpanded){
      const axis=[...svg.querySelectorAll('text')].find(t=>t.textContent==='Relative position of key evidence');
      const legend=[...svg.querySelectorAll('text')].find(t=>t.textContent==='After reranking and placing evidence near the task');
      if(axis&&legend){axis.setAttribute('y','235');svg.setAttribute('viewBox','0 0 880 260');svg.style.minWidth='880px';svg.dataset.translationAxisExpanded='true';records.push({round:1,kind:'space-reviewed-chart-axis',svgIndex:index});}
    }
    if(svg.querySelector('[transform]'))continue;
    // These reviewed diagrams use coordinate-only connectors and flat
    // rectangles. Give their translated labels more room without scaling text.
    if(svg.querySelector('marker#as29,marker#m27a,marker#sr31,marker#tt1,marker#iam1')&&!svg.dataset.translationGeometryExpanded) {
      const shapes=[...svg.querySelectorAll('rect,text,path')].filter(el=>!el.closest('defs'));
      const simple=shapes.every(el=>el.tagName.toLowerCase()!=='path'||(el.getAttribute('d')?.match(/[a-z]/gi)||[]).every(command=>'MLHVCSQTZmlhvcsqtz'.includes(command)));
      if(simple){
        const scale=1.8;
        for(const el of shapes){
          for(const attr of ['x','y','width','height','rx','ry'])if(el.hasAttribute(attr)&&Number.isFinite(Number(el.getAttribute(attr))))el.setAttribute(attr,String(Number(el.getAttribute(attr))*scale));
          if(el.hasAttribute('d'))el.setAttribute('d',el.getAttribute('d').replace(/-?\d*\.?\d+/g,n=>String(Number(n)*scale)));
        }
        const v=svg.viewBox.baseVal;svg.setAttribute('viewBox',`${v.x*scale} ${v.y*scale} ${v.width*scale} ${v.height*scale}`);
        svg.style.minWidth=svg.viewBox.baseVal.width+'px';svg.dataset.translationGeometryExpanded='true';
        records.push({round:1,kind:'expand-reviewed-diagram-geometry',svgIndex:index});
      }
    }
    const labels=[...svg.querySelectorAll('text')];
    const original=labels.map(t=>t.textContent);
    const nodes=[...svg.querySelectorAll('rect')].map(el=>({el,box:el.getBBox(),labels:[]})).filter(n=>n.box.width<svg.viewBox.baseVal.width*.8);
    const owners=new Map();
    for(const text of labels){const x=Number(text.getAttribute('x')),y=Number(text.getAttribute('y'));
      const node=nodes.filter(n=>x>n.box.x&&x<n.box.x+n.box.width&&y>n.box.y&&y<n.box.y+n.box.height).sort((a,b)=>a.box.width*a.box.height-b.box.width*b.box.height)[0];
      if(node){node.labels.push(text);owners.set(text,node);}}
    // Round 1: wrap plain labels within their own node/column. Complex tspans
    // and transformed labels are deliberately left for explicit repair.
    for(const text of labels) {
      if([...text.children].some(el=>el.tagName.toLowerCase()!=='tspan'||el.children.length||el.hasAttribute('baseline-shift')||el.hasAttribute('dy')||el.hasAttribute('font-size'))||text.closest('[transform]'))continue;
      const b=text.getBBox(), x=Number(text.getAttribute('x')),y=Number(text.getAttribute('y'));
      if(!Number.isFinite(x)||!Number.isFinite(y)||!b.width)continue;
      const vb=svg.viewBox.baseVal,anchor=getComputedStyle(text).textAnchor;
      let available=anchor==='middle'?2*Math.min(x-vb.x,vb.x+vb.width-x):anchor==='end'?x-vb.x:vb.x+vb.width-x;
      const boxes=owners.has(text)?[owners.get(text).box]:[];
      if(boxes.length){const r=boxes[0];available=Math.min(available,anchor==='middle'?2*Math.min(x-r.x,r.x+r.width-x)-12:anchor==='end'?x-r.x-6:r.x+r.width-x-6);}
      for(const other of labels){if(other===text||boxes.length)continue;const ob=other.getBBox();if(Math.abs(ob.y-b.y)>b.height)continue;
        const ox=Number(other.getAttribute('x'));if(ox>x)available=Math.min(available,anchor==='middle'?ox-x-12:ob.x-x-12);
      }
      if(available<40||b.width<=available)continue;
      const originalLabel=text.textContent;
      const tokens=originalLabel.match(/[^\s/]+\/?\s*|\/\s*/g)||[],lines=[];let line=originalLabel.match(/^\s*/)[0];
      const probe=document.createElementNS('http://www.w3.org/2000/svg','tspan');text.textContent='';text.append(probe);
      for(const token of tokens){
        probe.textContent=line+token;
        if(line&&probe.getComputedTextLength()>available){lines.push(line);line='';}
        for(const char of token){probe.textContent=line+char;if(line&&probe.getComputedTextLength()>available){lines.push(line);line='';}line+=char;}
      }
      if(line)lines.push(line);
      let floor=Infinity;
      for(const other of labels){if(other===text||boxes.length)continue;const ob=other.getBBox();if(ob.y>b.y+b.height/2&&ob.x<b.x+b.width&&ob.x+ob.width>b.x)floor=Math.min(floor,ob.y-3);}
      if(b.y+b.height+(lines.length-1)*(b.height+3)>floor){text.textContent=originalLabel;continue;}
      text.replaceChildren();
      lines.forEach((value,i)=>{const span=document.createElementNS('http://www.w3.org/2000/svg','tspan');span.setAttribute('x',String(x));span.setAttribute('y',String(y+i*(b.height+3)));span.textContent=value;text.append(span);});
      records.push({round:1,kind:'wrap-svg-label',svgIndex:index,text:text.textContent});
    }
    for(const node of nodes){let floor=node.box.y+6;
      for(const text of node.labels.sort((a,b)=>Number(a.getAttribute('y'))-Number(b.getAttribute('y')))){
        const b=text.getBBox(),shift=Math.max(0,floor-b.y);
        if(shift){for(const el of [text,...text.querySelectorAll('tspan[y]')])el.setAttribute('y',String(Number(el.getAttribute('y'))+shift));records.push({round:2,kind:'space-node-labels',svgIndex:index});}
        floor=b.y+shift+b.height+6;
      }
      if(node.labels.length&&floor>node.box.y+node.box.height){node.el.setAttribute('height',String(floor-node.box.y));records.push({round:2,kind:'grow-node-box',svgIndex:index});}
    }
    // Captions below a row must follow boxes that grew to fit wrapped labels.
    for(const text of labels.filter(t=>!owners.has(t))){
      const b=text.getBBox(),y=Number(text.getAttribute('y'));
      const preceding=nodes.filter(n=>y>n.box.y+n.box.height&&b.x<n.box.x+n.box.width&&b.x+b.width>n.box.x);
      const floor=Math.max(-Infinity,...preceding.map(n=>{const r=n.el.getBBox();return r.y+r.height+6;}));
      const shift=Math.max(0,floor-b.y);
      if(shift){for(const el of [text,...text.querySelectorAll('tspan[y]')])el.setAttribute('y',String(Number(el.getAttribute('y'))+shift));records.push({round:2,kind:'space-row-caption',svgIndex:index});}
    }
    // Round 2: include every visible label in the canvas, with original scale
    // retained via min-width and the existing horizontal scroll container.
    const vb=svg.viewBox.baseVal, boxes=labels.map(t=>t.getBBox());
    const left=Math.min(vb.x,...boxes.map(b=>b.x-8)),top=Math.min(vb.y,...boxes.map(b=>b.y-8));
    const right=Math.max(vb.x+vb.width,...boxes.map(b=>b.x+b.width+8)),bottom=Math.max(vb.y+vb.height,...boxes.map(b=>b.y+b.height+8));
    if(left!==vb.x||top!==vb.y||right!==vb.x+vb.width||bottom!==vb.y+vb.height){svg.setAttribute('viewBox',`${left} ${top} ${right-left} ${bottom-top}`);svg.style.minWidth=(right-left)+'px';records.push({round:2,kind:'expand-svg-canvas',svgIndex:index});}
    if(labels.some((t,i)=>t.textContent!==original[i]))throw Error('Layout repair changed text');
  }
  // Math and code keep their full content and become scrollable on narrow screens.
  for(const math of article.querySelectorAll('math[display="block"],pre')) {math.style.maxWidth='100%';math.style.overflowX='auto';}
  for(const table of article.querySelectorAll('table')){
    if(table.parentElement.dataset.translationTableScroll)continue;
    const wrapper=document.createElement('div');wrapper.dataset.translationTableScroll='true';
    wrapper.style.maxWidth='100%';wrapper.style.overflowX='auto';wrapper.tabIndex=0;
    wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Scrollable table');
    table.before(wrapper);wrapper.append(table);records.push({round:2,kind:'scroll-table'});
  }
  return records;
}
function script(){return `<script>window.translationLayoutReady=(${repairLayout.toString()})(document.getElementById('dd-article'));window.translationLayoutReady.catch(function(){});</script>`;}
// Exact glossary for natural-language MathML labels only. Unknown labels stay
// visible and fail acceptance. Operators, numbers, TeX and code are untouched.
function formulaLabels(html) {
  const glossary={"保留":"retained","生成":"generated","真实":"real","合成":"synthetic","；解释依赖基线选择":"; the explanation depends on the choice of baseline","解释依赖基线选择":"the explanation depends on the choice of baseline","内容":"content","的有效权重":"effective weight","样本":"sample","属于":"belongs to","的重复簇":"duplicate cluster","采样权重":"sampling weight","步下政策目标曝光":"steps: policy target exposure","步":"steps","训练":"training","请求":"requests","单次推理":"per-inference","运维与失败":"operations and failures","均等机会差距":"equal opportunity gap","总":"total","连接协商":"connection negotiation","发现":"discovery","策略":"policy","工具":"tools","模型":"model",'教师':'teacher','学生':'student','硬标签':'hard labels','最小':'min','最大':'max','偏好':'preference','参考':'ref','最坏':'worst','重试':'retries','单轮':'round','排队与启动':'queue and startup','全局':'global','气泡':'bubble','微批':'microbatch','数据并行':'data parallel','错误且接收':'incorrect and accepted','拒答':'abstain','升级验证':'escalated verification','合并':'merged','基座':'base','当':'when','不乘 TP 或 PP':'not multiplied by TP or PP'};
  const accessibleLabels={
    '内容 z 的有效权重 w(z) ∝ Σⱼ 1[样本 j 属于 z 的重复簇] · 采样权重ⱼ':'Effective weight of content z: w(z) ∝ Σⱼ 1[sample j belongs to the duplicate cluster of z] · sampling weightⱼ',
    'P训练(x)=Σᵢ pᵢPᵢ(x)，Σpᵢ=1；100k 步下政策目标曝光 15%≈15k 步':'P_training(x)=Σᵢ pᵢPᵢ(x), Σpᵢ=1; over 100k steps, policy target exposure 15%≈15k steps',
    '最终保留样本 x y 的相对密度，正比于生成器产生该样本的密度，乘验证器接受概率，再乘覆盖权重':'The relative density of retained samples x, y is proportional to their generator density times the verifier acceptance probability times the coverage weight',
    '第 t 代训练分布等于一减 alpha 乘真实数据分布，加 alpha 乘第 t 代合成数据分布':'The generation-t training distribution equals one minus alpha times the real-data distribution, plus alpha times the generation-t synthetic-data distribution',
    'f(x)=f(x₀)+Σ contribution；解释依赖基线选择':'f(x)=f(x₀)+Σ contribution; the explanation depends on the choice of baseline'
  };
  return html.replace(/<math\b[\s\S]*?<\/math>/gi,math=>math
    .replace(/aria-label="([^"]*)"/, (match,label)=>Object.hasOwn(accessibleLabels,label)?`aria-label="${accessibleLabels[label]}"`:match)
    .replace(/(<(?:mtext|mi)\b[^>]*>)([^<>]*)(<\/(?:mtext|mi)>)/g,(match,start,label,end)=>Object.hasOwn(glossary,label.trim())?start+label.replace(label.trim(),glossary[label.trim()])+end:match));
}
module.exports={repairLayout,script,formulaLabels};



