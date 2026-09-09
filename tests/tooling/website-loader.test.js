'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const timers=new Map(),scripts=[];let serial=0;
 const window={setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id)};
 const document={createElement:()=>({remove(){this.removed=true;}}),head:{appendChild:s=>scripts.push(s)}};
 const context={window,document,Map,Promise,Error,encodeURIComponent};vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../../assets/app/runtime-loader.js'),'utf8'),context);
 const registry={},loader=window.AIMap.createDeepDiveLoader({runtime:{base:'fixture'},ids:new Set(['sample']),registry,revision:'test',t:key=>key});
 const pending=loader.ensureSource('sample');assert.equal(loader.ensureSource('sample'),pending);assert.equal(scripts.length,1);
 const rejected=assert.rejects(pending,/resourceError/);[...timers.values()][0]();await rejected;assert(scripts[0].removed);
 const retry=loader.ensureSource('sample');assert.equal(scripts.length,2);registry.sample={title:'fixture'};scripts[1].onload();assert.equal((await retry).title,'fixture');assert.equal(timers.size,0);
 console.log('PASS: loader deduplication, bounded failure, retry and timer cleanup');
})().catch(e=>{console.error(e);process.exitCode=1;});
