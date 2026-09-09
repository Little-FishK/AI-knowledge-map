"use strict";
// Production content stays behind MCP. This launcher receives only an artifact receipt.
const {spawn}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const mode=process.argv[2]||'preview';
const siteUrl=process.argv[3]||'https://little-fishk.github.io/AI-knowledge-map/';
const child=spawn(process.execPath,[path.join(__dirname,'deepdive-stage2/mcp-server.js')],{cwd:root,windowsHide:true,env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:'website-build',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},stdio:['pipe','pipe','pipe']});
let buffer='',finished=false;
const timer=setTimeout(()=>finish(1,'MCP build timeout'),120000);
function finish(code,message){if(finished)return;finished=true;clearTimeout(timer);if(message)console.log(message);child.stdin.end();child.kill();process.exitCode=code;}
function send(id,method,params){child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');}
child.on('error',e=>finish(1,e.message));child.on('exit',()=>{if(!finished)finish(1,'Controller exited before receipt');});
child.stderr.on('data',chunk=>process.stderr.write(chunk));
child.stdout.on('data',chunk=>{buffer+=chunk;let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!line.trim())continue;try{const r=JSON.parse(line);if(r.error)return finish(1,JSON.stringify(r.error));if(r.id===1)send(2,'tools/call',{name:'stage2_build_website',arguments:{mode,siteUrl}});if(r.id===2){const result=r.result;if(result.isError)return finish(1,JSON.stringify(result));const receipt=JSON.parse(result.content.find(c=>c.type==='text').text);finish(receipt.state==='built'?0:2,JSON.stringify(receipt,null,2));}}catch(e){finish(1,e.message);}}});
send(1,'initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'website-builder',version:'1'}});
