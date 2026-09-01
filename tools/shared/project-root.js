"use strict";

const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

function resolveProjectRoot(environmentVariable) {
  const configuredRoot = environmentVariable && process.env[environmentVariable];
  return configuredRoot ? path.resolve(configuredRoot) : PROJECT_ROOT;
}

function resolveFromProjectRoot(root, ...segments) {
  return path.resolve(root, ...segments);
}

function isWithinProjectRoot(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertWithinProjectRoot(root, candidate, label = "path") {
  if (!isWithinProjectRoot(root, candidate)) {
    throw new Error(`${label} must stay within the project root: ${candidate}`);
  }
  return path.resolve(candidate);
}

module.exports = {
  PROJECT_ROOT,
  assertWithinProjectRoot,
  isWithinProjectRoot,
  resolveFromProjectRoot,
  resolveProjectRoot
};
