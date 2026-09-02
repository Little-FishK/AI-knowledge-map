"use strict";

const assert = require("assert");
const path = require("path");
const {
  DATA_ROOT_ENVIRONMENT_VARIABLE,
  localDataPaths,
  resolveLocalDataRoot,
} = require("../../tools/shared/local-data-root");

const configured = resolveLocalDataRoot({
  environment: { [DATA_ROOT_ENVIRONMENT_VARIABLE]: "C:\\local-data" },
  platform: "win32",
  home: "C:\\Users\\example",
});
assert.strictEqual(configured, path.resolve("C:\\local-data"));

const windows = localDataPaths({
  environment: { LOCALAPPDATA: "C:\\Users\\example\\AppData\\Local" },
  platform: "win32",
  home: "C:\\Users\\example",
});
assert.strictEqual(windows.root, path.resolve("C:\\Users\\example\\AppData\\Local", "ai-knowledge-map"));
assert.strictEqual(windows.videoRaw, path.join(windows.root, "video", "raw"));
assert.strictEqual(windows.stage2Results, path.join(windows.root, "stage2", "results"));

const linux = resolveLocalDataRoot({
  environment: { XDG_STATE_HOME: "/tmp/state" },
  platform: "linux",
  home: "/home/example",
});
assert.strictEqual(linux, path.resolve("/tmp/state", "ai-knowledge-map"));

console.log("✓ 仓库外本机数据目录解析测试通过");
