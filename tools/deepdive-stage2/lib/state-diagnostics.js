"use strict";

const crypto = require("crypto");
const fs = require("fs");

const LARGE_STATE_BYTES = 1024 * 1024;
const LARGE_VALUE_BYTES = 64 * 1024;
const MAX_LEAF_PATHS = 40;
const MAX_TRAVERSAL_DEPTH = 12;
const SAFE_FIELD_NAME = /^[A-Za-z0-9_.-]{1,120}$/;
const LOGICAL_RUNTIME_PATH = /^\.stage2\/(results|previews)\/(.+)$/;

function jsonBytes(value) {
  const serialized = JSON.stringify(value);
  return Buffer.byteLength(serialized === undefined ? "null" : serialized, "utf8");
}

function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function percent(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

function displayPath(parts) {
  return parts.join(".").replace(/\.\[\]/g, "[]");
}

function addLeafStat(stats, parts, value) {
  const key = displayPath(parts);
  const bytes = jsonBytes(value);
  const type = valueType(value);
  const current = stats.get(key) || {
    path: key,
    occurrences: 0,
    totalBytes: 0,
    maxBytes: 0,
    types: {},
  };
  current.occurrences += 1;
  current.totalBytes += bytes;
  current.maxBytes = Math.max(current.maxBytes, bytes);
  current.types[type] = (current.types[type] || 0) + 1;
  stats.set(key, current);
}

function collectLeafStats(value, parts, stats, context, depth = 0) {
  if (depth >= MAX_TRAVERSAL_DEPTH) {
    addLeafStat(stats, [...parts, "[depth-limit]"], value);
    context.depthLimitedValues += 1;
    return;
  }
  if (Array.isArray(value)) {
    if (!value.length) {
      addLeafStat(stats, parts, value);
      return;
    }
    value.forEach(item => collectLeafStats(item, [...parts, "[]"], stats, context, depth + 1));
    return;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) {
      addLeafStat(stats, parts, value);
      return;
    }
    entries.forEach(([field, child]) => {
      if (!SAFE_FIELD_NAME.test(field)) {
        context.hiddenUnsafeFieldNames += 1;
        addLeafStat(stats, [...parts, "[hidden-field]"], child);
        return;
      }
      collectLeafStats(child, [...parts, field], stats, context, depth + 1);
    });
    return;
  }
  addLeafStat(stats, parts, value);
}

function collectRuntimeReferences(value, references) {
  if (typeof value === "string") {
    const normalized = value.replace(/\\/g, "/");
    if (LOGICAL_RUNTIME_PATH.test(normalized)) {
      references.set(normalized, (references.get(normalized) || 0) + 1);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectRuntimeReferences(item, references));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(child => collectRuntimeReferences(child, references));
  }
}

function createStateDiagnostics({ defaultRoot, loadState, stateFile, withinRoot }) {
  function stateStorageReport(root = defaultRoot) {
    const state = loadState(root);
    const compactState = JSON.stringify(state);
    const serializedBytes = Buffer.byteLength(compactState, "utf8");
    const file = stateFile(root);
    const sourceFileBytes = fs.statSync(file).size;

    const topLevelFields = Object.entries(state).map(([field, value]) => ({
      field: SAFE_FIELD_NAME.test(field) ? field : "[hidden-field]",
      type: valueType(value),
      bytes: jsonBytes(value),
      percentOfState: percent(jsonBytes(value), serializedBytes),
      itemCount: Array.isArray(value)
        ? value.length
        : (value && typeof value === "object" ? Object.keys(value).length : null),
    })).sort((left, right) => right.bytes - left.bytes || left.field.localeCompare(right.field));

    const pages = state.pages && typeof state.pages === "object" ? state.pages : {};
    const pageFields = new Map();
    const leafStats = new Map();
    const traversal = { hiddenUnsafeFieldNames: 0, depthLimitedValues: 0 };
    let totalPageRecordBytes = 0;
    let maxPageRecordBytes = 0;

    Object.values(pages).forEach(record => {
      const recordBytes = jsonBytes(record);
      totalPageRecordBytes += recordBytes;
      maxPageRecordBytes = Math.max(maxPageRecordBytes, recordBytes);
      if (!record || typeof record !== "object" || Array.isArray(record)) return;
      Object.entries(record).forEach(([field, value]) => {
        const safeField = SAFE_FIELD_NAME.test(field) ? field : "[hidden-field]";
        if (safeField === "[hidden-field]") traversal.hiddenUnsafeFieldNames += 1;
        const bytes = jsonBytes(value);
        const type = valueType(value);
        const current = pageFields.get(safeField) || {
          field: safeField,
          presentOnPages: 0,
          totalBytes: 0,
          maxBytes: 0,
          stringBytes: 0,
          maxStringBytes: 0,
          types: {},
        };
        current.presentOnPages += 1;
        current.totalBytes += bytes;
        current.maxBytes = Math.max(current.maxBytes, bytes);
        current.types[type] = (current.types[type] || 0) + 1;
        if (type === "string") {
          current.stringBytes += bytes;
          current.maxStringBytes = Math.max(current.maxStringBytes, bytes);
        }
        pageFields.set(safeField, current);
        collectLeafStats(value, ["pages", "*", safeField], leafStats, traversal);
      });
    });

    const pageCount = Object.keys(pages).length;
    const fieldReport = [...pageFields.values()]
      .map(item => ({
        ...item,
        averageBytesWhenPresent: item.presentOnPages
          ? Number((item.totalBytes / item.presentOnPages).toFixed(2))
          : 0,
        percentOfPageRecords: percent(item.totalBytes, totalPageRecordBytes),
      }))
      .sort((left, right) => right.totalBytes - left.totalBytes || left.field.localeCompare(right.field));
    const largestLeafPaths = [...leafStats.values()]
      .map(item => ({
        ...item,
        averageBytes: item.occurrences
          ? Number((item.totalBytes / item.occurrences).toFixed(2))
          : 0,
        percentOfPageRecords: percent(item.totalBytes, totalPageRecordBytes),
      }))
      .sort((left, right) => right.totalBytes - left.totalBytes || left.path.localeCompare(right.path))
      .slice(0, MAX_LEAF_PATHS);

    const runtimeReferences = new Map();
    collectRuntimeReferences(state, runtimeReferences);
    const areaStats = new Map();
    let existingUniqueReferences = 0;
    let missingUniqueReferences = 0;
    let referencedFileBytes = 0;
    for (const [logicalPath, occurrences] of runtimeReferences.entries()) {
      const match = logicalPath.match(LOGICAL_RUNTIME_PATH);
      const area = match ? match[1] : "unknown";
      const current = areaStats.get(area) || {
        area,
        occurrences: 0,
        uniqueReferences: 0,
        existingUniqueReferences: 0,
        missingUniqueReferences: 0,
        referencedFileBytes: 0,
      };
      current.occurrences += occurrences;
      current.uniqueReferences += 1;
      let exists = false;
      try {
        const absolute = withinRoot(root, logicalPath);
        exists = fs.existsSync(absolute) && fs.statSync(absolute).isFile();
        if (exists) {
          const bytes = fs.statSync(absolute).size;
          current.referencedFileBytes += bytes;
          referencedFileBytes += bytes;
        }
      } catch (_ignored) {
        exists = false;
      }
      if (exists) {
        current.existingUniqueReferences += 1;
        existingUniqueReferences += 1;
      } else {
        current.missingUniqueReferences += 1;
        missingUniqueReferences += 1;
      }
      areaStats.set(area, current);
    }

    const warningCodes = [];
    if (sourceFileBytes > LARGE_STATE_BYTES) warningCodes.push("state-file-over-1mb");
    if (fieldReport.some(item => item.maxBytes > LARGE_VALUE_BYTES)) {
      warningCodes.push("large-page-field-value");
    }
    if (largestLeafPaths.some(item => item.maxBytes > LARGE_VALUE_BYTES)) {
      warningCodes.push("large-leaf-value");
    }
    if (missingUniqueReferences) warningCodes.push("missing-runtime-reference");
    if (traversal.hiddenUnsafeFieldNames) warningCodes.push("hidden-unsafe-field-name");
    if (traversal.depthLimitedValues) warningCodes.push("diagnostic-depth-limit-reached");

    return {
      schemaVersion: 1,
      readOnly: true,
      state: {
        stateSchemaVersion: state.schemaVersion,
        sourceFile: ".stage2/state.json",
        sourceFileBytes,
        serializedBytes,
        digest: `sha256:${crypto.createHash("sha256").update(compactState).digest("hex")}`,
        topLevelFields,
      },
      pages: {
        count: pageCount,
        totalRecordBytes: totalPageRecordBytes,
        averageRecordBytes: pageCount ? Number((totalPageRecordBytes / pageCount).toFixed(2)) : 0,
        maxRecordBytes: maxPageRecordBytes,
        fields: fieldReport,
        largestLeafPaths,
      },
      runtimeReferences: {
        occurrences: [...runtimeReferences.values()].reduce((sum, count) => sum + count, 0),
        uniqueReferences: runtimeReferences.size,
        existingUniqueReferences,
        missingUniqueReferences,
        referencedFileBytes,
        areas: [...areaStats.values()].sort((left, right) => left.area.localeCompare(right.area)),
      },
      safeguards: {
        valuesIncluded: false,
        pageIdsIncluded: false,
        maximumLeafPaths: MAX_LEAF_PATHS,
        hiddenUnsafeFieldNames: traversal.hiddenUnsafeFieldNames,
        depthLimitedValues: traversal.depthLimitedValues,
      },
      warningCodes,
    };
  }

  return { stateStorageReport };
}

module.exports = { createStateDiagnostics };
