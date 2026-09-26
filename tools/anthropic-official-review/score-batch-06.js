"use strict";

const { runScoreBatch } = require("./score-batch-runner");

runScoreBatch({ batchNumber:6, candidateCount:6, definitions:[
  [3,2,2,1,"成本、token 和缓存追踪是控制 Agent SDK 生产预算的重要能力。"],
  [3,3,2,1,"OpenTelemetry traces、metrics 与 events 构成 Agent SDK 的核心可观测性路径。"],
  [2,1,1,1,"Todo tracking 主要是进度呈现辅助能力，可由通用任务状态和工具事件替代。"],
  [3,3,2,2,"生产托管涉及子进程、持久化、扩缩容、可观测性和多租户隔离，是核心部署资料。"],
  [3,3,2,2,"隔离、凭据和网络控制构成安全部署自主 Agent 的关键工程原则。"],
  [2,3,1,1,"法律协议、合规认证和安全声明是企业采用的官方边界，但技术适用面相对集中。"]
] });
