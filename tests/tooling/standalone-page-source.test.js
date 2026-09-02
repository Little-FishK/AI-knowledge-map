"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  loadStandalonePageDirectory,
  loadStandalonePageSource,
  pageRegistrationSource,
} = require("../../tools/deepdive/runtime/standalone-page-source");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "deepdive-standalone-"));

try {
  const alpha = { title: "Alpha", subtitle: "A", thesis: "T", html: "<p>A</p>", quality: { score: 1 } };
  const beta = { title: "Beta", subtitle: "B", thesis: "T", html: "<p>B</p>" };
  fs.writeFileSync(path.join(fixture, "alpha.js"), pageRegistrationSource("alpha", alpha), "utf8");
  fs.writeFileSync(path.join(fixture, "beta.js"), pageRegistrationSource("beta", beta), "utf8");

  const forward = loadStandalonePageDirectory(fixture, { filenames: ["alpha.js", "beta.js"] });
  const reverse = loadStandalonePageDirectory(fixture, { filenames: ["beta.js", "alpha.js"] });
  assert.deepStrictEqual({ ...forward }, { ...reverse });
  assert.deepStrictEqual(forward.alpha, alpha);
  assert.deepStrictEqual(forward.beta, beta);

  assert.throws(
    () => loadStandalonePageSource(
      'window.DEEPDIVE={}; window.DEEPDIVE.alpha={title:"A"}; window.DEEPDIVE.beta={title:"B"};',
      "alpha.js",
      "alpha",
    ),
    /必须且只能注册一个页面/,
  );
  assert.throws(
    () => loadStandalonePageSource('window.DEEPDIVE={beta:{title:"B"}};', "alpha.js", "alpha"),
    /与文件名 alpha 不一致/,
  );
  assert.throws(
    () => loadStandalonePageSource(
      'window.DEEPDIVE={}; window.DEEPDIVE.alpha=window.createDeepDive({title:"A"});',
      "alpha.js",
      "alpha",
    ),
    /createDeepDive/,
  );
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log("✓ 独立理解原理页源码加载测试通过");
