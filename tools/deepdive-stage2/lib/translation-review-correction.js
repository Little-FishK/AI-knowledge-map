'use strict';
const fs=require('node:fs'),path=require('node:path');
function previous(dir,job,page,packet) {
  if(page.lastError?.category!=='review-contract')return null;
  const keys=[...new Set((page.lastError.issues||[]).map(x=>x.unitKey).filter(Boolean))];
  if(!keys.length||!keys.every(k=>packet.units.some(u=>u.key===k)))return null;
  const call=[...job.calls].reverse().find(c=>c.pageId===page.pageId&&c.phase==='quality'&&c.state==='received');
  if(!call)return null;
  for(const name of fs.readdirSync(dir).filter(n=>/^task-deepseek-review-[a-f0-9-]+\.json$/.test(n))) {
    const file=path.join(dir,name);if(fs.lstatSync(file).isSymbolicLink())throw Error('Unsafe prior review file');
    const task=JSON.parse(fs.readFileSync(file,'utf8'));
    if(task.requestHash===call.requestHash&&task.revision===packet.revision&&task.pageId===page.pageId&&Array.isArray(task.evidence?.checkedUnits))return {keys,evidence:task.evidence,requestHash:call.requestHash};
  }
  return null;
}
function merge(previous,patch,units) {
  const keys=previous?previous.keys:units.map(u=>u.key),checked=patch?.checkedUnits;
  if(!checked||Array.isArray(checked)||Object.keys(checked).length!==keys.length||!keys.every(k=>Object.hasOwn(checked,k)))throw Error('Incomplete compact review coverage');
  const byKey=new Map((previous?.evidence.checkedUnits||[]).map(u=>[u.unitKey,u]));
  for(const key of keys){const item=checked[key];if(!Array.isArray(item)||item.length!==3)throw Error('Invalid compact unit evidence');byKey.set(key,{unitKey:key,sourceQuote:item[0],translationQuote:item[1],rationale:item[2]});}
  return {checkedUnits:units.map(u=>byKey.get(u.key)),findings:patch.findings,wholePageRationale:patch.wholePageRationale};
}
function decode(content) {
  try {
    if(typeof content!=='string')throw Error('Missing JSON text');
    // Strip only a complete transport fence. Never guess truncated JSON or
    // repair quotations/evidence locally.
    const text=content.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i,'$1');
    const value=JSON.parse(removeTrailingCommas(text));
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Expected JSON object');
    return value;
  } catch(cause) {
    const error=Error('Review JSON could not be decoded: '+cause.message);
    error.code='REVIEW_CONTRACT';error.issues=[{kind:'invalid-json',unitKey:null}];throw error;
  }
}
// Remove separators only outside JSON strings and immediately before a closing
// object/array delimiter. Never insert missing text, quotes or brackets.
function removeTrailingCommas(text){
  let result='',quoted=false,escaped=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){result+=c;if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
    if(c==='"')quoted=true;
    if(c===','){let j=i+1;while(/\s/.test(text[j]||'')&&j<text.length)j++;if(text[j]==='}'||text[j]===']')continue;}
    result+=c;
  }
  return result;
}
module.exports={previous,merge,decode,removeTrailingCommas};
