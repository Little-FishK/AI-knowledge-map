"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function createLocalDataMigration(dependencies) {
  const {
    defaultRoot,
    acquireLock,
    appendEvent,
    loadState,
    runtimeDirectory,
    stageDirectory,
  } = dependencies;

  function inventory(target) {
    if (!fs.existsSync(target)) return { exists: false, files: 0, bytes: 0, digest: null };
    const stat = fs.statSync(target);
    const records = [];
    const visit = (absolute, relative) => {
      const current = fs.statSync(absolute);
      if (current.isDirectory()) {
        for (const name of fs.readdirSync(absolute).sort()) {
          visit(path.join(absolute, name), relative ? `${relative}/${name}` : name);
        }
        return;
      }
      if (!current.isFile()) throw new Error(`本机数据迁移不支持特殊文件：${absolute}`);
      const hash = crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
      records.push({ path: relative, bytes: current.size, hash });
    };
    visit(target, "");
    const digest = crypto.createHash("sha256").update(JSON.stringify(records)).digest("hex");
    return {
      exists: true,
      files: records.length,
      bytes: records.reduce((sum, item) => sum + item.bytes, 0),
      digest: `sha256:${digest}`,
    };
  }

  function paths(root = defaultRoot) {
    const projectStage = stageDirectory(root);
    const localStage = runtimeDirectory(root);
    return [
      { name: "results", source: path.join(projectStage, "results"), target: path.join(localStage, "results") },
      { name: "previews", source: path.join(projectStage, "previews"), target: path.join(localStage, "previews") },
      { name: "events", source: path.join(projectStage, "events.jsonl"), target: path.join(localStage, "events.jsonl") },
      { name: "state-backup", source: path.join(projectStage, "state.json.bak"), target: path.join(localStage, "backups", "state.json.bak") },
    ];
  }

  function status(root = defaultRoot) {
    return {
      projectStageDirectory: stageDirectory(root),
      localStageDirectory: runtimeDirectory(root),
      external: path.resolve(stageDirectory(root)) !== path.resolve(runtimeDirectory(root)),
      items: paths(root).map(item => ({
        name: item.name,
        source: item.source,
        target: item.target,
        sourceInventory: inventory(item.source),
        targetInventory: inventory(item.target),
      })),
    };
  }

  function moveVerified(source, target) {
    const before = inventory(source);
    if (!before.exists) return { status: "missing", inventory: before };
    if (fs.existsSync(target)) throw new Error(`迁移目标已存在，拒绝覆盖：${target}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    try {
      fs.renameSync(source, target);
    } catch (error) {
      if (error.code !== "EXDEV") throw error;
      const temporary = `${target}.migrating-${process.pid}-${Date.now()}`;
      try {
        fs.cpSync(source, temporary, { recursive: true, errorOnExist: true, force: false });
        const copied = inventory(temporary);
        if (JSON.stringify(copied) !== JSON.stringify(before)) {
          throw new Error(`迁移副本校验失败：${source}`);
        }
        fs.renameSync(temporary, target);
        fs.rmSync(source, { recursive: true, force: false });
      } finally {
        if (fs.existsSync(temporary)) fs.rmSync(temporary, { recursive: true, force: true });
      }
    }
    const after = inventory(target);
    if (JSON.stringify(after) !== JSON.stringify(before)) {
      throw new Error(`迁移后完整性校验失败：${target}`);
    }
    return { status: "migrated", inventory: after };
  }

  function migrate(root = defaultRoot, reason = "") {
    const resolvedRoot = path.resolve(root);
    if (path.resolve(stageDirectory(resolvedRoot)) === path.resolve(runtimeDirectory(resolvedRoot))) {
      throw new Error("Stage 2 本机数据目录尚未配置到项目目录之外");
    }
    if (String(reason || "").trim().length < 3) throw new Error("迁移原因不能为空");
    const legacyLock = path.join(stageDirectory(resolvedRoot), "controller.lock");
    if (fs.existsSync(legacyLock)) throw new Error("旧 Stage 2 控制器锁仍存在，拒绝迁移");
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const active = Object.values(state.pages || {}).find(record => record && record.lease);
      if (active) throw new Error(`页面 ${active.id} 仍有活动租约，拒绝迁移`);
      const moved = paths(resolvedRoot).map(item => ({
        name: item.name,
        source: item.source,
        target: item.target,
        ...moveVerified(item.source, item.target),
      }));
      appendEvent(resolvedRoot, "local-data-migrated", {
        reason: String(reason).trim(),
        items: moved.map(item => ({ name: item.name, status: item.status, inventory: item.inventory })),
      });
      return {
        status: "migrated",
        reason: String(reason).trim(),
        localStageDirectory: runtimeDirectory(resolvedRoot),
        items: moved,
      };
    } finally {
      release();
    }
  }

  return { inventory, migrate, paths, status };
}

module.exports = { createLocalDataMigration };
