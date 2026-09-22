'use strict';
const assert=require('node:assert/strict');
const {startTiming}=require('../../tools/deepdive-stage2/lib/translation-timing');
const {usageReport}=require('../../tools/deepdive-stage2/lib/translation-usage-report');
const record={};let wall='2026-09-14T12:00:00.000Z',tick=100;
const finish=startTiming(record,{now:()=>wall,monotonic:()=>tick});
assert.equal(record.durationMs,null);assert.equal(record.finishedAt,null);
wall='2026-09-14T11:59:00.000Z';tick=145.5;finish();
assert.equal(record.durationMs,45.5); // A backwards wall clock cannot create negative latency.
const calls=[{pageId:'sample',phase:'translating',requestHash:'a',...record},
  {pageId:'sample',phase:'quality',requestHash:'b'},
  {pageId:'sample',phase:'quality',requestHash:'c',startedAt:'invalid',finishedAt:wall}];
const report=usageReport({plan:{},pages:[{pageId:'sample'}],calls},[],()=>null);
assert.equal(report.calls[0].durationMs,45.5);
assert.equal(report.calls[0].startedAt,record.startedAt);
assert.equal(report.calls[1].durationMs,null);
assert.equal(report.calls[2].durationMs,null);
console.log('PASS monotonic latency, persisted timestamps, legacy missing and invalid time');
