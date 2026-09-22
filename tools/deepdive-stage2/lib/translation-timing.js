'use strict';
const {performance}=require('node:perf_hooks');
// Wall time identifies the attempt; monotonic elapsed time survives clock adjustments.
// Start immediately before persisting the dispatch record. Includes that write and
// transport/response decoding, but not scheduling, output validation or deployment.
function startTiming(record, clock={now:()=>new Date().toISOString(), monotonic:()=>performance.now()}) {
  record.startedAt=clock.now();
  record.finishedAt=null;
  record.durationMs=null;
  const start=clock.monotonic();
  return () => {
    record.finishedAt=clock.now();
    record.durationMs=Math.max(0,clock.monotonic()-start);
  };
}
module.exports={startTiming};
