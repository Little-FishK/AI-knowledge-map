"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sha256(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `sha256:${crypto.createHash("sha256").update(text).digest("hex")}`;
}

function createStateStore({ defaultRoot, schemaVersion }) {
  function stageDirectory(root = defaultRoot) {
    return path.join(path.resolve(root), ".stage2");
  }

  function stateFile(root = defaultRoot) {
    return path.join(stageDirectory(root), "state.json");
  }

  function eventsFile(root = defaultRoot) {
    return path.join(stageDirectory(root), "events.jsonl");
  }

  function lockFile(root = defaultRoot) {
    return path.join(stageDirectory(root), "controller.lock");
  }

  function resultDirectory(root, id) {
    return path.join(stageDirectory(root), "results", id);
  }

  function withinRoot(root, relativePath) {
    const absolute = path.resolve(root, relativePath);
    const relative = path.relative(path.resolve(root), absolute);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`目标路径越出项目根目录：${relativePath}`);
    }
    return absolute;
  }

  function atomicWrite(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(temporary, content, "utf8");
    fs.renameSync(temporary, file);
  }

  function readJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  function acquireLock(root) {
    const file = lockFile(root);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    try {
      const descriptor = fs.openSync(file, "wx");
      fs.writeFileSync(descriptor, JSON.stringify({
        pid: process.pid,
        acquiredAt: new Date().toISOString(),
      }), "utf8");
      fs.closeSync(descriptor);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      let stale = false;
      try {
        const details = readJson(file);
        stale = Date.now() - Date.parse(details.acquiredAt) > 2 * 60 * 60_000;
      } catch (_ignored) {
        stale = false;
      }
      if (!stale) throw new Error("第二阶段控制器正由另一个进程使用");
      fs.unlinkSync(file);
      return acquireLock(root);
    }
    return () => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    };
  }

  function writeJson(file, value) {
    atomicWrite(file, `${JSON.stringify(value, null, 2)}\n`);
  }

  function appendEvent(root, type, details = {}) {
    const event = {
      at: new Date().toISOString(),
      type,
      ...details,
    };
    fs.mkdirSync(stageDirectory(root), { recursive: true });
    fs.appendFileSync(eventsFile(root), `${JSON.stringify(event)}\n`, "utf8");
    return event;
  }

  function loadState(root = defaultRoot) {
    const file = stateFile(root);
    if (!fs.existsSync(file)) {
      throw new Error("第二阶段状态尚未初始化；先运行 stage2:init");
    }
    const state = readJson(file);
    if (state.schemaVersion !== schemaVersion || !state.pages) {
      throw new Error("第二阶段状态文件版本无效");
    }
    return state;
  }

  function saveState(root, state) {
    state.updatedAt = new Date().toISOString();
    writeJson(stateFile(root), state);
    return state;
  }

  return {
    acquireLock,
    appendEvent,
    atomicWrite,
    eventsFile,
    loadState,
    lockFile,
    readJson,
    resultDirectory,
    saveState,
    stageDirectory,
    stateFile,
    withinRoot,
    writeJson,
  };
}

module.exports = {
  clone,
  createStateStore,
  sha256,
};
