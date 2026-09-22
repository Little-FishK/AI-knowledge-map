'use strict';
const VERSION='translation-layout-v1';
function eligible(page,status){
  return page.state==='held'&&page.reason==='resource-browser-check-failed'
    &&page.presentationRepairVersion!==VERSION
    &&/Layout validation failed|SVG text exceeds|Page overflow|Untranslated visible Chinese/.test(page.lastError?.message||'')
    &&status.state==='awaiting-resource-browser-human-review'
    &&[1,2,3,4,5,7,8].every(number=>status.gates?.some(g=>g.number===number&&g.status==='pass'));
}
module.exports={VERSION,eligible};
