'use strict';
function failure(error, phase, environment = {}) {
  let message = String(error?.message || 'Unknown error');
  for (const [key,value] of Object.entries(environment)) if (/KEY|TOKEN|SECRET|PASSWORD/i.test(key) && typeof value==='string' && value.length>=6) message=message.split(value).join('[redacted]');
  message=message.replace(/Bearer\s+\S+|sk-[A-Za-z0-9_-]+/gi,'[redacted]');
  const presentation=phase==='publication'&&/Layout validation failed|SVG text exceeds|Page overflow|Untranslated visible Chinese|Raster\/media resource|Unresolved resource dependencies|Missing preview resource/.test(message);
  return {at:new Date().toISOString(),phase,name:error?.name||'Error',message:message.slice(0,2000),
    layer:presentation?'presentation':'system',countsAsSemanticDefect:false,
    category:error?.code==='REVIEW_CONTRACT'?'review-contract':/budget/i.test(message)?'budget':/uncertain|usage/i.test(message)?'transport-or-billing':phase==='publication'?'browser-or-resource':'controller-or-output',
    issues:Array.isArray(error?.issues)?error.issues.slice(0,1000):[],
    layoutRepairs:Array.isArray(error?.layoutRepairs)?error.layoutRepairs:[],
    repairExhausted:error?.code==='PRESENTATION_REPAIR_EXHAUSTED'};
}
module.exports={failure};
