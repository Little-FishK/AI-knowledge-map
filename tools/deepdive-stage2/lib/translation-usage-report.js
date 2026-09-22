'use strict';
// Pure accounting projection. Exports no prompts, response text or hidden reasoning.
function usageReport(job,tasks,readResponse){
  const seen=new Set(),reviewCounts=new Map();
  const calls=job.calls.map((c,index)=>{
    const response=c.responseFile?readResponse(c.responseFile):null;
    const task=tasks.find(t=>t.requestHash===c.requestHash&&t.pageId===c.pageId);
    let role=c.phase==='translating'?'translation':task?.workerId?.startsWith('deepseek-repair-')?'repair':task?.workerId?.startsWith('deepseek-review-')?'review':'unclassified';
    if(role==='unclassified'&&c.phase==='quality'){
      try{const value=JSON.parse(response?.choices?.[0]?.message?.content);if(value&&Array.isArray(value.findings))role='review';}catch(_){}
    }
    if(role==='review'){const n=reviewCounts.get(c.pageId)||0;reviewCounts.set(c.pageId,n+1);role=n?'subsequent-review':'initial-review';}
    const key=c.pageId+':'+c.requestHash,repeatedExactRequest=seen.has(key);seen.add(key);
    const usage=response?.usage;
    return {index:index+1,pageId:c.pageId,purpose:role,state:c.state,requestHash:c.requestHash,
      inputTokens:usage?.prompt_tokens??null,outputTokens:usage?.completion_tokens??null,
      reasoningTokens:usage?.completion_tokens_details?.reasoning_tokens??null,
      costUsd:c.costUsd??null,startedAt:c.startedAt??null,finishedAt:c.finishedAt??null,
      durationMs:Number.isFinite(c.durationMs)&&c.durationMs>=0?c.durationMs:
        c.startedAt&&c.finishedAt&&Number.isFinite(Date.parse(c.finishedAt)-Date.parse(c.startedAt))&&Date.parse(c.finishedAt)>=Date.parse(c.startedAt)?Date.parse(c.finishedAt)-Date.parse(c.startedAt):null,
      repeatedExactRequest,findingsReported:task?.evidence?.findings?.length??null,
      repairUnitKeys:role==='repair'&&task?Object.keys(task.evidence):[],
      finishReason:response?.choices?.[0]?.finish_reason??null};
  });
  const summarize=rows=>({calls:rows.length,inputTokens:rows.reduce((s,r)=>s+(r.inputTokens||0),0),outputTokens:rows.reduce((s,r)=>s+(r.outputTokens||0),0),reasoningTokens:rows.reduce((s,r)=>s+(r.reasoningTokens||0),0),costUsd:rows.reduce((s,r)=>s+(r.costUsd||0),0),missingUsage:rows.filter(r=>r.inputTokens===null||r.outputTokens===null).length,repeatedExactRequests:rows.filter(r=>r.repeatedExactRequest).length});
  return {campaignId:'sha256:'+require('node:crypto').createHash('sha256').update(JSON.stringify(job.plan)).digest('hex'),
    notes:['Output tokens include reasoning tokens; do not add reasoning again.','Subsequent reviews include verification or report retries; this label alone does not prove waste.','Historical calls without start/end timestamps have unknown duration.','Reported findings are model claims, not counts of confirmed valid defects.'],
    totals:summarize(calls),byPurpose:[...new Set(calls.map(c=>c.purpose))].map(purpose=>({purpose,...summarize(calls.filter(c=>c.purpose===purpose))})),
    byPage:job.pages.map(p=>({pageId:p.pageId,...summarize(calls.filter(c=>c.pageId===p.pageId))})),calls};
}
module.exports={usageReport};
