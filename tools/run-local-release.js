'use strict';
// Serve only files in the verified publication, never the source workspace.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {verify}=require('./verify-website');
const {safeFile}=require('./readiness/site-artifact');
const root=path.resolve(__dirname,'..');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'.tmp/translation-deployments/baseline.json'),'utf8'));
const output=path.resolve(baseline.output);
if(!output.startsWith(root+path.sep))throw Error('Publication must be inside this workspace');
verify(output,true);
const manifest=JSON.parse(fs.readFileSync(path.join(output,'release-manifest.json'),'utf8'));
const port=Number(process.argv[2]||8940);
if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml'};
const server=http.createServer((req,res)=>{
  const headers={'Cache-Control':'no-store','X-AIMap-Local-Release':baseline.commit};
  try{
    let name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\//,'');
    if(!name||name.endsWith('/'))name+='index.html';
    if(!Object.hasOwn(manifest.files,name)){res.writeHead(404,headers).end('Not found');return;}
    const file=safeFile(output,name);
    res.writeHead(200,{...headers,'Content-Type':types[path.extname(file)]||'application/octet-stream'});
    const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);
  }catch{res.writeHead(400,headers).end('Bad request');}
});
server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({state:'ready',url:`http://127.0.0.1:${server.address().port}/`,commit:baseline.commit})));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>process.exit(0)));
