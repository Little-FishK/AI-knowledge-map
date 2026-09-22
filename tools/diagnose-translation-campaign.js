'use strict';
const {spawnSync}=require('node:child_process'),path=require('node:path');
const [campaignId]=process.argv.slice(2);
if(!/^sha256:[a-f0-9]{64}$/.test(campaignId||''))throw Error('Exact campaign ID required');
const root=path.resolve(__dirname,'..');
const child=spawnSync(process.execPath,[path.join(__dirname,'deepdive-stage2/mcp-server.js')],{
  cwd:root,windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024,
  env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:'full',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},
  input:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'stage2_diagnose_translation_campaign',arguments:{campaignId}}})+'\n'
});
if(child.status!==0)throw Error('Diagnostic controller failed: '+child.stderr);
const response=JSON.parse(child.stdout.trim());
if(response.error||response.result?.isError)throw Error(response.error?.message||response.result?.content?.find(c=>c.type==='text')?.text||'Diagnostic rejected');
console.log(response.result.content.find(c=>c.type==='text').text);
