"use strict";
// Local artifact preview only; supports GitHub Pages subpaths and real 404 status.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const {verify}=require('./verify-website'),{safeFile}=require('./readiness/site-artifact');
const root=path.resolve(process.argv[2]||''),port=Number(process.argv[3]||4993);
verify(root);const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8')),base=new URL(manifest.siteUrl).pathname;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(!url.pathname.startsWith(base)){res.writeHead(404);return res.end('Not found');}
    let relative=decodeURIComponent(url.pathname.slice(base.length));if(!relative||relative.endsWith('/'))relative+='index.html';
    let file=safeFile(root,relative),status=200;
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){file=path.join(root,'404.html');status=404;}
    const type=types[path.extname(file)]||'application/octet-stream',headers={'Content-Type':type,'X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
    let data=fs.readFileSync(file);
    if(/\bgzip\b/.test(req.headers['accept-encoding']||'')&&/text|json|xml/.test(type)){data=zlib.gzipSync(data);headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding';}
    res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:data);
  }catch(_){res.writeHead(400);res.end('Invalid path');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}${base}`));
