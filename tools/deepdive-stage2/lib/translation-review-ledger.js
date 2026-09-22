'use strict';
// Controller-derived history, not model-authored approval. Never infer that a
// repeated finding is false: stop oscillation and preserve both assessments.
function classify(history, findings) {
  const reviews=history.filter(h=>h.type==='review');
  const repairs=history.filter(h=>h.type==='repair');
  return findings.map(f=>{
    const prior=reviews.flatMap(h=>(h.evidence?.findings||[]).map(x=>({...x,revision:h.revision})))
      .filter(x=>x.unitKey===f.unitKey&&x.rule===f.rule);
    const repaired=repairs.some(h=>Object.hasOwn(h.replacements||{},f.unitKey));
    return {...f,lifecycle:prior.length?(repaired?'disputed-after-repair':'unresolved'):(repaired?'new-on-repaired-unit':'new'),
      previousFindings:prior.map(({revision,reason,sourceQuote,translationQuote})=>({revision,reason,sourceQuote,translationQuote}))};
  });
}
function repeatedSources(units) {
  const groups=new Map();
  for(const u of units){const source=u.source.trim();if(source.length<4)continue;const g=groups.get(source)||[];g.push(u.key);groups.set(source,g);}
  return [...groups].filter(([,keys])=>keys.length>1).map(([source,unitKeys])=>({source,unitKeys}));
}
function missingOccurrences(units,findings) {
  const issues=[];
  if(!Array.isArray(findings))return issues;
  for(const f of findings||[]) {
    if(f?.rule!==4||typeof f.sourceQuote!=='string'||f.sourceQuote.trim().length<8||typeof f.translationQuote!=='string'||f.translationQuote.trim().length<8)continue;
    for(const u of units)if(u.key!==f.unitKey&&u.source.includes(f.sourceQuote)&&u.translation.includes(f.translationQuote)
      &&!findings.some(other=>other?.rule===4&&other.unitKey===u.key))
      issues.push({kind:'repeated-terminology-occurrence-needs-review',unitKey:u.key,relatedUnitKey:f.unitKey});
  }
  return issues;
}
module.exports={classify,repeatedSources,missingOccurrences};
