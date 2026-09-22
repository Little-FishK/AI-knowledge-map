'use strict';
// Read-only launcher for exact current translation-source hashes via Stage 2 MCP.
const {spawnSync}=require('node:child_process'),path=require('node:path');
const [pageId]=process.argv.slice(2);
if(!/^[a-z0-9][a-z0-9-]*$/.test(pageId||''))throw Error('Exact pageId required');
const root=path.resolve(__dirname,'..');
const child=spawnSync(process.execPath,[path.join(__dirname,'deepdive-stage2/mcp-server.js')],{
  cwd:root,windowsHide:true,encoding:'utf8',timeout:30000,
  env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:'full',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},
  input:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'stage2_inspect_translation_source_binding',arguments:{pageId}}})+'\n'
});
if(child.status!==0)throw Error('Translation source binding controller failed');
const response=JSON.parse(child.stdout.trim());
if(response.error||response.result?.isError)throw Error(response.error?.message || response.result?.content?.find(c=>c.type==='text')?.text || 'Translation source binding inspection rejected');
console.log(response.result.content.find(c=>c.type==='text').text);
