'use strict';
// Independent scheduler. Production data is accessed only through MCP.
const fs=require('node:fs'),path=require('node:path'),{spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.resolve(root,f),'utf8').replace(/^\uFEFF/,''));
function select(order,sources,ledger,assets,inventory){
 const excluded=new Set([...ledger.assignedPages,...ledger.excludedHeldPages,...ledger.sourceConfirmationRejected]);
 // Recommended order is a priority, not the complete website inventory.
 const orderedIds=new Set(order.map(p=>p.pageId));
 const candidates=[...order,...assets.filter(p=>!orderedIds.has(p.pageId)).sort((a,b)=>a.pageId.localeCompare(b.pageId))];
 return candidates.filter(p=>!excluded.has(p.pageId)&&sources.some(s=>s.pageId===p.pageId&&s.eligible)
  &&assets.some(a=>a.pageId===p.pageId&&!a.englishArtifactExists)
  &&inventory.some(a=>a.pageId===p.pageId&&!a.active)).slice(0,5)
  .map(p=>({pageId:p.pageId,snapshotId:sources.find(s=>s.pageId===p.pageId).snapshotId}));
}
function terminal(status){return status.state==='completed'&&status.pages.every(p=>['published','held'].includes(p.state));}
function parkAuthorized(status, campaignId){
 return status.campaignId===campaignId&&status.state==='needs-operator-review'
  &&status.pages.some(p=>p.state==='held')&&status.pages.every(p=>['held','published'].includes(p.state));
}
function mcp(name,args,profile='full',pageId){
 const p=spawnSync(process.execPath,[path.join(__dirname,'deepdive-stage2/mcp-server.js')],{cwd:root,windowsHide:true,encoding:'utf8',timeout:60000,maxBuffer:4000000,
  env:{...process.env,STAGE2_MCP_PROFILE:profile,STAGE2_MCP_PAGE_ID:pageId||'',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold',DEEPDIVE_STAGE2_ROOT:root},
  input:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})+'\n'});
 if(p.status!==0)throw Error('MCP process failed');const r=JSON.parse(p.stdout.trim());
 if(r.error||r.result?.isError)throw Error('MCP rejected '+name);
 return JSON.parse(r.result.content.find(c=>c.type==='text').text);
}
async function main(){
 const lock=path.join(root,'.tmp/translation-renewal.lock');
 const fd=fs.openSync(lock,'wx');fs.writeFileSync(fd,String(process.pid));fs.closeSync(fd);
 const ledgerPath=path.join(root,'.tmp/translation-renewal-ledger.json');let ledger=read(ledgerPath);
 const save=()=>{const tmp=ledgerPath+'.next';fs.writeFileSync(tmp,JSON.stringify(ledger,null,2));fs.renameSync(tmp,ledgerPath);};
 const emit=e=>{e.at=new Date().toISOString();fs.appendFileSync(path.join(root,'.tmp/translation-renewal-events.jsonl'),JSON.stringify(e)+'\n');console.log(JSON.stringify(e));};
 function notify(e){
  const key=[ledger.activeCampaignId,e.pageId,e.event,e.state||''].join('/');
  ledger.desktopEvents=ledger.desktopEvents||[];if(ledger.desktopEvents.includes(key))return;
  ledger.desktopEvents.push(key);save();emit(e);
  const message=e.event==='page-live'?`${e.pageId}: LIVE`:e.pageId?`${e.pageId}: ${e.state||e.event}. ${e.reason||''}`:`Translation queue: ${e.event}`;
  const p=spawn('powershell.exe',['-NoProfile','-File',path.join(__dirname,'translation-desktop-notify.ps1'),'-Message',message],{windowsHide:true,stdio:'ignore'});p.on('error',()=>emit({event:'desktop-notification-failed'}));
 }
 try {
  // Never silently resume an interrupted runner: outstanding requests may be chargeable.
  const old=mcp('stage2_inspect_translation_campaign',{campaignId:ledger.activeCampaignId});
  const parked=parkAuthorized(old,process.env.STAGE2_RENEWAL_PARK_CAMPAIGN);
  if((!terminal(old)&&!parked)||!fs.existsSync(path.join(root,ledger.activePrefix+'-exit.txt')))throw Error('Previous runner not safely finished');
  if(parked){
   ledger.batches.at(-1).parkedForReconciliation=true;
   ledger.batches.at(-1).accountedUsd=old.accountedUsd;
   save();emit({event:'previous-batch-parked',campaignId:old.campaignId,accountedUsd:old.accountedUsd});
  }
  // Reconcile published artifacts before renewing after a deployment failure.
  // deploy verifies existing live receipts and resumes pushes idempotently; no model calls.
  for(const page of old.pages.filter(p=>p.state==='published')){
   const result=await require('./readiness/deploy-translation-page').deploy(page,old.campaignId);
   const event={event:'page-live',pageId:page.pageId,...result};
   fs.appendFileSync(path.join(root,ledger.activePrefix+'-run.jsonl'),JSON.stringify(event)+'\n');
   notify(event);
  }
  for(const p of old.pages)if(p.state==='held'&&!ledger.excludedHeldPages.includes(p.pageId))ledger.excludedHeldPages.push(p.pageId);
  save();
  while(!fs.existsSync(path.join(root,'.tmp/translation-renewal.stop'))){
   const assets=mcp('stage2_inventory_page_assets',{}).pages, inventory=mcp('stage2_inventory_pages',{}).pages;
   if(inventory.some(p=>p.active))throw Error('Stage 2 active lease; scheduling stopped');
   const pages=select(read(ledger.officialOrderFile),read(ledger.confirmedSourcesFile),ledger,assets,inventory);
   if(!pages.length){
    const untranslated=assets.filter(p=>!p.englishArtifactExists).map(p=>p.pageId);
    notify({event:untranslated.length?'queue-no-eligible-pages':'queue-complete',remainingUntranslatedPages:untranslated,
     reason:untranslated.length?'No eligible unassigned pages; untranslated pages still need attention':undefined});return;
   }
   for(const p of pages){const check=mcp('stage2_check_translation_snapshot',p,'translation',p.pageId);if(check.state!=='prepared')throw Error('Snapshot stale: '+p.pageId);}
   const config={...read('.tmp/confirmed-five-plan.json').config,budgetUsd:15};
   const status=mcp('stage2_build_translation_campaign',{pages,config},'translation-campaign');
   if(status.state!=='prepared'||status.calls!==0)throw Error('Existing campaign requires operator inspection');
   const prefix='.tmp/independent-'+status.campaignId.slice(7,23);
   ledger.activeCampaignId=status.campaignId;ledger.activePrefix=prefix;
   ledger.assignedPages.push(...pages.map(p=>p.pageId));ledger.batches.push({campaignId:status.campaignId,prefix,pages:pages.map(p=>p.pageId)});save();
   emit({event:'batch-started',campaignId:status.campaignId,pages:pages.map(p=>p.pageId),budgetUsd:15});
   const code=await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[path.join(__dirname,'run-translation-campaign.js'),'run',status.campaignId],{cwd:root,windowsHide:true,env:{...process.env,STAGE2_DEEPSEEK_LIVE:'1',STAGE2_DEEPSEEK_CAMPAIGN:status.campaignId,STAGE2_CAMPAIGN_CONCURRENCY:'5',STAGE2_CAMPAIGN_SPEND_LIMIT_USD:'15',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},stdio:['ignore','pipe','pipe']});
    fs.writeFileSync(path.join(root,prefix+'.pid'),String(child.pid));let buffer='';
    child.stdout.on('data',chunk=>{fs.appendFileSync(path.join(root,prefix+'-run.jsonl'),chunk);buffer+=chunk;let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);try{const e=JSON.parse(line);if(['page-automatic-ended','page-live','page-deployment-failed','deployment-blocked','deployment-failed','deployment-monitor-blocked'].includes(e.event))notify(e);}catch{}}});
    child.stderr.on('data',chunk=>fs.appendFileSync(path.join(root,prefix+'-run.err'),chunk));
    child.on('error',reject);child.on('close',code=>{fs.writeFileSync(path.join(root,prefix+'-exit.txt'),String(code));resolve(code);});
   });
   const finished=mcp('stage2_inspect_translation_campaign',{campaignId:status.campaignId});
   for(const p of finished.pages){if(['published','held'].includes(p.state))notify({event:'page-automatic-ended',pageId:p.pageId,state:p.state,reason:p.reason});if(p.state==='held'&&!ledger.excludedHeldPages.includes(p.pageId))ledger.excludedHeldPages.push(p.pageId);}
   ledger.batches.at(-1).state=finished.state;ledger.batches.at(-1).accountedUsd=finished.accountedUsd;save();
   if(![0,2].includes(code)||!terminal(finished))throw Error('Batch requires operator inspection; no new paid requests');
   const events=fs.readFileSync(path.join(root,prefix+'-run.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l));
   for(const p of finished.pages.filter(p=>p.state==='published'))if(!events.some(e=>e.event==='page-live'&&e.pageId===p.pageId))throw Error('Deployment not verified: '+p.pageId);
   emit({event:'batch-ended',campaignId:status.campaignId});
  }
  emit({event:'queue-stopped'});
 }catch(e){notify({event:'queue-blocked',reason:e.message});process.exitCode=1;}
 finally{fs.unlinkSync(lock);}
}
module.exports={select,terminal,parkAuthorized};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});

