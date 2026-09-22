'use strict';
// All production access uses the restricted MCP controller. No direct state reads.
const {spawn}=require('node:child_process'), path=require('node:path'), fs=require('node:fs');
async function main() {
  const [action,value]=process.argv.slice(2);
  if(!['build','inspect','run','handover'].includes(action)||!value)throw Error('Usage: node tools/run-translation-campaign.js build <plan.json> | inspect/run/handover <campaignId>');
  const root=path.resolve(__dirname,'..');
  const deployment=action==='run'?require('./readiness/translation-deployment-queue').createQueue(
    require('./readiness/deploy-translation-page').deploy,event=>console.log(JSON.stringify(event)),
    process.env.STAGE2_CAMPAIGN_RECOVERY_PAGES?JSON.parse(process.env.STAGE2_CAMPAIGN_RECOVERY_PAGES):null):null;
  const manualNotified=new Set();
  const terminalNotified=new Set();
  function observe(status){
    deployment.observe(status);
    for(const p of status.pages||[])if(!['published','held'].includes(p.state)){
      terminalNotified.delete(p.pageId);manualNotified.delete(p.pageId);
    }
    for(const p of status.pages||[])if(['published','held'].includes(p.state)&&!terminalNotified.has(p.pageId)){
      // A rejected report may still be retried by the controller in this run.
      if(p.state==='held'&&p.reason==='quality-contract-failed'&&['prepared','running'].includes(status.state))continue;
      terminalNotified.add(p.pageId);
      console.log(JSON.stringify({event:'page-automatic-ended',pageId:p.pageId,state:p.state,...(p.state==='held'?{reason:p.reason,error:p.lastError?.message}:{})}));
    }
    for(const p of status.pages||[])if(p.state==='held'&&p.reason?.startsWith('manual-')&&!manualNotified.has(p.pageId)){
      manualNotified.add(p.pageId);
      console.log(JSON.stringify({event:'page-needs-human',pageId:p.pageId,reason:p.reason,
        trigger:p.manualIntervention?.trigger,automaticSlotOccupied:false}));
    }
  }
  let monitor=null,monitoring=false;
  const child=spawn(process.execPath,[path.join(__dirname,'deepdive-stage2/mcp-server.js')],{cwd:root,windowsHide:true,
    env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:action==='handover'?'full':'translation-campaign',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},stdio:['pipe','pipe','pipe']});
  let buffer='',serial=0;const pending=new Map();
  function rejectAll(){for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Controller stopped; inspect before resuming'));}pending.clear();}
  child.on('error',rejectAll);child.on('exit',rejectAll);
  // Never print controller stderr: a dependency could include private source in an exception.
  child.stderr.resume();
  child.stdout.on('data',chunk=>{buffer+=chunk;let end;while((end=buffer.indexOf('\n'))>=0){
    const line=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!line.trim())continue;
    try {const r=JSON.parse(line),p=pending.get(r.id);if(!p)continue;pending.delete(r.id);clearTimeout(p.timer);
      if(r.error||r.result?.isError)p.reject(Error('Controller rejected operation; no automatic retry'));
      else p.resolve(r.result);
    }catch(_){rejectAll();child.kill();}
  }});
  const call=(method,params)=>new Promise((resolve,reject)=>{const id=++serial;
    const timer=setTimeout(()=>{pending.delete(id);reject(Error('Controller timeout; no automatic retry'));child.kill();},1200000);
    pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
  try {
    await call('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'translation-campaign',version:'1'}});
    const request=async(name,args)=>{const r=await call('tools/call',{name,arguments:args});return JSON.parse(r.content.find(c=>c.type==='text').text);};
    if(action==='build'){console.log(JSON.stringify(await request('stage2_build_translation_campaign',JSON.parse(fs.readFileSync(value,'utf8'))),null,2));return;}
    if(action==='handover'){console.log(JSON.stringify(await request('stage2_handover_translation_campaign',{campaignId:value})));return;}
    let result=await request('stage2_inspect_translation_campaign',{campaignId:value});
    console.log(JSON.stringify(result));
    if(action==='inspect')return;
    // Recovery starts from historical held/published states. Notify when this
    // run reaches a terminal state, not when merely reading the old receipt.
    if(process.env.STAGE2_CAMPAIGN_RECOVERY_ID)for(const p of result.pages||[]){
      if(['held','published'].includes(p.state))terminalNotified.add(p.pageId);
      if(p.state==='held')manualNotified.add(p.pageId);
    }
    observe(result);
    // Watch publication receipts while other pages still await model responses.
    // Inspect is read-only; deployments are serialized by a separate queue.
    monitoring=true;
    monitor=(async()=>{while(monitoring){await new Promise(r=>setTimeout(r,1000));if(!monitoring)break;
      try{observe(await request('stage2_inspect_translation_campaign',{campaignId:value}));}
      catch(e){console.log(JSON.stringify({event:'deployment-monitor-blocked',error:e.message}));break;}
    }})();
    let checkedForRecovery = false;
    while(!checkedForRecovery || ['prepared','running'].includes(result.state)) {
      checkedForRecovery = true;
      result=await request('stage2_step_translation_campaign',{campaignId:value});
      console.log(JSON.stringify(result));
      observe(result);
    }
    monitoring=false;await monitor;
    if((await deployment.drain()).failed)process.exitCode=2;
    if(result.pages.some(p=>p.state==='held'))process.exitCode=2;
    if(result.state!=='completed')process.exitCode=2;
  } finally {monitoring=false;if(monitor)await monitor;if(deployment)await deployment.drain();child.stdin.end();child.kill();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
