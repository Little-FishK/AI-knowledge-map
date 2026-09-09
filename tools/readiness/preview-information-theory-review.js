"use strict";
// Call the full MCP controller; never read candidates, audits or state here.
const path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const server=spawn(process.execPath,[path.join(root,'tools/deepdive-stage2/mcp-server.js')],{
  cwd:root,env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:'full',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},
  stdio:['pipe','pipe','pipe'],windowsHide:true
});
let buffer='',done=false;
const timer=setTimeout(()=>finish(1),60000);
function finish(code){if(done)return;done=true;clearTimeout(timer);server.kill();process.exitCode=code;}
function send(id,method,params){server.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');}
server.on('error',()=>finish(1));
server.on('exit',()=>{if(!done)finish(1);});
server.stderr.on('data',()=>{});
server.stdout.setEncoding('utf8');
server.stdout.on('data',chunk=>{
  buffer+=chunk;
  let end;
  while((end=buffer.indexOf('\n'))>=0){
    const line=buffer.slice(0,end);buffer=buffer.slice(end+1);
    if(!line.trim())continue;
    const message=JSON.parse(line);
    if(message.id===1){
      if(message.error){console.log(JSON.stringify(message.error));finish(1);return;}
      send(2,'tools/call',{name:'stage2_create_manual_review_preview',arguments:{pageId:'information-theory',localBrowserPreview:true}});
    }
    if(message.id===2){console.log(JSON.stringify(message.result||message.error,null,2));finish(message.error||message.result?.isError?1:0);}
  }
});
send(1,'initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'information-theory-review-preview',version:'1.0'}});

