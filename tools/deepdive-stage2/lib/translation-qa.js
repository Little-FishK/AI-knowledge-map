'use strict';
// Project subset inspired by MQM Core. Classification never grants publication.
const CATEGORIES=Object.freeze(['accuracy/mistranslation','accuracy/omission','accuracy/addition','accuracy/consistency','terminology']);
const SEVERITIES=Object.freeze(['minor','major','critical']);
const CONTRACT=Object.freeze({version:'mqm-subset-v1',categories:CATEGORIES,severities:SEVERITIES,
  instructions:'For each semantic finding provide mqmCategory and severity. Use terminology for rule 4 and accuracy categories for rules 7/8. Explain the impact in reason. Minor means a localized issue without changing the key meaning; major changes meaning or impairs understanding; critical reverses a crucial conclusion or instruction. All findings still block publication; severity is not a pass score.'});
function validClassification(item, required=false) {
  if(!item||typeof item!=='object')return false;
  if(item.mqmCategory===undefined&&item.severity===undefined)return !required;
  return CATEGORIES.includes(item.mqmCategory)&&SEVERITIES.includes(item.severity)
    && (item.rule===4?item.mqmCategory==='terminology':[7,8].includes(item.rule)&&item.mqmCategory.startsWith('accuracy/'));
}
function layers(gates) {
  return Object.entries({source:[1],mechanical:[2,3,5],semantic:[4,7,8],presentation:[6,9]}).map(([name,numbers])=>{
    const checks=gates.filter(g=>numbers.includes(g.number));
    return {name,gates:numbers,status:checks.some(g=>['fail','blocked'].includes(g.status))?'blocked':checks.length===numbers.length&&checks.every(g=>g.status==='pass')?'pass':'pending'};
  });
}
function summarize(gates,defects) {
  return {classificationVersion:CONTRACT.version,layers:layers(gates),issues:defects.map(d=>({rule:d.rule,unitKey:d.unitKey||null,
    layer:d.rule===1?'source':[2,3,5].includes(d.rule)?'mechanical':[6,9].includes(d.rule)?'presentation':'semantic',
    category:d.mqmCategory||(d.rule===4?'terminology':d.rule===5?'number-or-symbol-mismatch':d.rule===3?'markup':d.rule===2?'coverage':'unclassified'),
    severity:d.severity||'unassessed',classificationOrigin:d.mqmCategory?'reviewer':'rule-mapping',blocking:true})),
    scoringPolicy:'No aggregate score; every accepted defect remains blocking. Legacy findings are not assigned invented severity.'};
}
module.exports={CONTRACT,validClassification,summarize};
