'use strict';
// Runs inside the browser, using rendered geometry after fonts settle.
function inspectLayout(article) {
  const issues=[], tolerance=2;
  const bounds=el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};
  const visible=el=>{const s=getComputedStyle(el),b=bounds(el);return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&b.width>0&&b.height>0;};
  const outside=(b,a)=>b.left<a.left-tolerance||b.right>a.right+tolerance||b.top<a.top-tolerance||b.bottom>a.bottom+tolerance;
  const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>tolerance&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>tolerance;
  for(const [svgIndex,svg] of [...article.querySelectorAll('svg')].entries()) {
    const labels=[...svg.querySelectorAll('text')].filter(visible).map(el=>({el,box:bounds(el),text:el.textContent}));
    for(let i=0;i<labels.length;i++) {
      const a=labels[i];
      for(let j=i+1;j<labels.length;j++)if(overlap(a.box,labels[j].box))issues.push({kind:'svg-label-overlap',svgIndex,text:a.text,other:labels[j].text,bounds:a.box,otherBounds:labels[j].box});
      // A rect in the same group whose interior contains the label centre is
      // a candidate node box; whole-SVG backgrounds are excluded.
      const cx=(a.box.left+a.box.right)/2,cy=(a.box.top+a.box.bottom)/2,svgBox=bounds(svg);
      const boxes=[...a.el.parentElement.children].filter(el=>el.tagName.toLowerCase()==='rect'&&visible(el)).map(bounds)
        .filter(b=>b.width*b.height<svgBox.width*svgBox.height*.8&&cx>b.left&&cx<b.right&&cy>b.top&&cy<b.bottom).sort((x,y)=>x.width*x.height-y.width*y.height);
      if(boxes[0]&&outside(a.box,boxes[0]))issues.push({kind:'svg-label-outside-node',svgIndex,text:a.text,bounds:a.box,container:boxes[0]});
    }
  }
  for(const el of article.querySelectorAll('p,li,td,th,pre,h1,h2,h3,figcaption')) {
    if(!visible(el))continue;
    const range=document.createRange();range.selectNodeContents(el);const b=range.getBoundingClientRect();
    for(let parent=el;parent&&article.contains(parent);parent=parent.parentElement){
      const s=getComputedStyle(parent),a=bounds(parent);
      if((/hidden|clip/.test(s.overflowX)&&(b.left<a.left-tolerance||b.right>a.right+tolerance))||(/hidden|clip/.test(s.overflowY)&&(b.top<a.top-tolerance||b.bottom>a.bottom+tolerance))) {
        issues.push({kind:'clipped-content',tag:el.tagName,text:el.textContent.slice(0,160)});break;
      }
    }
  }
  return issues;
}
module.exports={inspectLayout};
