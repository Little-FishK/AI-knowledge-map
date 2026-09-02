"use strict";

const { localDataPaths } = require("./shared/local-data-root");

const paths = localDataPaths();
const requested = process.argv[2] || "all";
if (requested === "all") {
  process.stdout.write(`${JSON.stringify(paths, null, 2)}\n`);
} else if (Object.hasOwn(paths, requested)) {
  process.stdout.write(`${paths[requested]}\n`);
} else {
  console.error(`未知本机数据路径：${requested}`);
  process.exitCode = 2;
}
