'use strict';
// Select complete approved records; never rewrite terminology decisions.
function relevantGlossary(terms, pageId, text) {
  const haystack=text.normalize('NFKC').toLowerCase();
  const mentions=value=>{
    if(typeof value!=='string'||!value.trim())return false;
    const needle=value.normalize('NFKC').toLowerCase();
    if(/[\u3400-\u9fff]/u.test(needle))return haystack.includes(needle);
    const escaped=needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp('(?<![a-z0-9])'+escaped+'(?![a-z0-9])','u').test(haystack);
  };
  return Object.fromEntries(Object.entries(terms).filter(([id,t])=>id===pageId||
    [id,t.zhHans,t.displayTitle,...(t.canonicalTerms||[]),...(t.acceptedAliases||[]),...(t.avoid||[])].some(mentions)));
}
function outsideContext(html, chapters) {
  // Remove complete chapter ranges, including nested sections as one range.
  // All outside text, attributes and containing markup remain byte-for-byte intact.
  const ranges=chapters.map(c=>({start:c.start,end:c.end})).sort((a,b)=>a.start-b.start||b.end-a.end);
  let cursor=0,result='';
  for(const r of ranges){
    if(!Number.isInteger(r.start)||!Number.isInteger(r.end)||r.start<0||r.end<r.start||r.end>html.length)throw Error('Invalid chapter context range');
    if(r.end<=cursor)continue;
    if(r.start<cursor)throw Error('Overlapping chapter context ranges');
    result+=html.slice(cursor,r.start)+'<!-- chapter omitted; see outline -->';cursor=r.end;
  }
  return result+html.slice(cursor);
}
module.exports={relevantGlossary,outsideContext};
