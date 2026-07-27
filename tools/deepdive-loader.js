"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadDeepDivePages(root) {
  const context = { window: {} };
  vm.createContext(context);
  const directory = path.join(root, "data", "deepdive");
  fs.readdirSync(directory)
    .filter(file => file.endsWith(".js"))
    .sort()
    .forEach(file => {
      const fullPath = path.join(directory, file);
      vm.runInContext(fs.readFileSync(fullPath, "utf8"), context, { filename: fullPath });
    });
  return context.window.DEEPDIVE || {};
}

module.exports = { loadDeepDivePages };
