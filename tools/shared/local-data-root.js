"use strict";

const os = require("os");
const path = require("path");

const APPLICATION_DIRECTORY = "ai-knowledge-map";
const DATA_ROOT_ENVIRONMENT_VARIABLE = "AI_KNOWLEDGE_MAP_DATA_DIR";

function resolveLocalDataRoot(options = {}) {
  const environment = options.environment || process.env;
  const platform = options.platform || process.platform;
  const home = options.home || os.homedir();
  const configured = String(environment[DATA_ROOT_ENVIRONMENT_VARIABLE] || "").trim();
  if (configured) return path.resolve(configured);
  if (platform === "win32" && environment.LOCALAPPDATA) {
    return path.resolve(environment.LOCALAPPDATA, APPLICATION_DIRECTORY);
  }
  if (platform === "darwin") {
    return path.resolve(home, "Library", "Application Support", APPLICATION_DIRECTORY);
  }
  const stateHome = environment.XDG_STATE_HOME
    ? path.resolve(environment.XDG_STATE_HOME)
    : path.resolve(home, ".local", "state");
  return path.join(stateHome, APPLICATION_DIRECTORY);
}

function localDataPaths(options = {}) {
  const root = resolveLocalDataRoot(options);
  return {
    root,
    video: path.join(root, "video"),
    videoRaw: path.join(root, "video", "raw"),
    videoDependencies: path.join(root, "video", "deps"),
    stage2: path.join(root, "stage2"),
    stage2Results: path.join(root, "stage2", "results"),
    stage2Previews: path.join(root, "stage2", "previews"),
    stage2Events: path.join(root, "stage2", "events.jsonl"),
    stage2Backups: path.join(root, "stage2", "backups"),
    logs: path.join(root, "logs"),
  };
}

module.exports = {
  APPLICATION_DIRECTORY,
  DATA_ROOT_ENVIRONMENT_VARIABLE,
  localDataPaths,
  resolveLocalDataRoot,
};
