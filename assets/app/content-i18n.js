/* AI 知识地图 — 结构化内容语言覆盖层（整条记录回退） */
(function (root, factory) {
  "use strict";

  const api = factory();
  if (root) {
    const app = root.AIMap = root.AIMap || {};
    app.contentI18n = api;
  }
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const STATUS_PUBLISHED = "published";
  const HAN_PATTERN = /[\u3400-\u9fff]/u;

  function sameRevision(expected, actual) {
    if (!expected) return true;
    if (!actual || typeof actual !== "object") return false;
    return Object.keys(expected).every(key => String(expected[key] || "") === String(actual[key] || ""));
  }

  function sameValueShape(source, translated) {
    if (Array.isArray(source)) {
      return Array.isArray(translated) && source.length === translated.length
        && source.every((value, index) => sameValueShape(value, translated[index]));
    }
    if (source === null) return translated === null;
    if (typeof source === "object") {
      return Boolean(translated && typeof translated === "object" && !Array.isArray(translated)
        && Object.keys(source).every(key => Object.prototype.hasOwnProperty.call(translated, key)
          && sameValueShape(source[key], translated[key])));
    }
    return typeof source === typeof translated;
  }

  function validatePublishedRecord(candidate, source, requiredFields) {
    if (!candidate || candidate.status !== STATUS_PUBLISHED || !candidate.fields
        || typeof candidate.fields !== "object") return false;
    return requiredFields.every(field => {
      if (!Object.prototype.hasOwnProperty.call(candidate.fields, field)) return false;
      if (field === "aliases") {
        return Array.isArray(candidate.fields[field])
          && candidate.fields[field].every(value => typeof value === "string");
      }
      return sameValueShape(source[field], candidate.fields[field]);
    });
  }

  function collectStrings(value, result = []) {
    if (typeof value === "string") result.push(value);
    else if (Array.isArray(value)) value.forEach(item => collectStrings(item, result));
    else if (value && typeof value === "object") Object.values(value).forEach(item => collectStrings(item, result));
    return result;
  }

  function collectWikiRefs(value) {
    const refs = new Set();
    collectStrings(value).forEach(text => {
      for (const match of text.matchAll(/\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g)) refs.add(match[1]);
    });
    return [...refs].sort();
  }

  function sameStringSet(left, right) {
    return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
  }

  function preservesSourceAnchors(source, fields) {
    const sourceSources = source.sources || [];
    const translatedSources = fields.sources || [];
    if (sourceSources.some((item, index) => !translatedSources[index]
      || item.type !== translatedSources[index].type || item.ref !== translatedSources[index].ref)) return false;
    const sourceActivity = source.activity || [];
    const translatedActivity = fields.activity || [];
    return !sourceActivity.some((item, index) =>
      !translatedActivity[index] || item.date !== translatedActivity[index].date);
  }

  function validateGraphNodeTranslation(candidate, source, locale) {
    const fields = candidate.fields;
    if (Array.isArray(fields.aliases) && new Set(fields.aliases).size !== fields.aliases.length) return false;
    if (!sameStringSet(collectWikiRefs(source), collectWikiRefs(fields))) return false;
    if (!preservesSourceAnchors(source, fields)) return false;
    return locale !== "en" || !collectStrings(fields).some(text => HAN_PATTERN.test(text));
  }

  function resolveRecord(options) {
    const source = options.source;
    const sourceLocale = options.sourceLocale;
    const requestedLocale = options.locale;
    if (requestedLocale === sourceLocale) {
      return Object.freeze({
        record: source,
        requestedLocale,
        effectiveLocale: sourceLocale,
        fallbackUsed: false,
        reason: "source",
      });
    }

    const pack = options.pack;
    if (!pack) return fallback("missing-pack");
    if (!sameRevision(options.sourceRevision, pack.source && pack.source[options.sourceName])) {
      return fallback("stale-source");
    }
    const collection = pack.collections && pack.collections[options.collection];
    const candidate = collection && collection[options.id];
    if (!validatePublishedRecord(candidate, source, options.requiredFields)
        || (typeof options.validateCandidate === "function"
          && !options.validateCandidate(candidate, source, requestedLocale))) {
      return fallback(candidate ? "incomplete-record" : "missing-record");
    }
    return Object.freeze({
      record: Object.freeze(Object.assign({}, source, candidate.fields)),
      requestedLocale,
      effectiveLocale: requestedLocale,
      fallbackUsed: false,
      reason: "published",
    });

    function fallback(reason) {
      return Object.freeze({
        record: source,
        requestedLocale,
        effectiveLocale: sourceLocale,
        fallbackUsed: true,
        reason,
      });
    }
  }

  function createContentI18n(options) {
    const config = options || {};
    const manifest = config.manifest;
    if (!manifest || !manifest.locales) throw new TypeError("内容国际化需要语言清单");
    const sourceLocale = manifest.sourceLocale || manifest.defaultLocale;
    const registry = config.registry || {};
    const documentRef = config.document || (typeof document !== "undefined" ? document : null);
    const getLocale = typeof config.getLocale === "function" ? config.getLocale : () => sourceLocale;
    const loads = new Map();

    function defaultLoadAsset(locale, assetName, path) {
      if (!documentRef || !documentRef.createElement || !documentRef.head) {
        return Promise.reject(new Error(`没有可用的内容脚本加载环境：${locale}/${assetName}`));
      }
      return new Promise((resolve, reject) => {
        const script = documentRef.createElement("script");
        script.src = path;
        script.async = true;
        script.onload = () => { script.remove(); resolve(); };
        script.onerror = () => { script.remove(); reject(new Error(`内容语言资源加载失败：${locale}/${assetName}`)); };
        documentRef.head.appendChild(script);
      });
    }

    function ensureLocale(locale) {
      if (locale === sourceLocale) return Promise.resolve(null);
      const entry = manifest.locales[locale];
      if (!entry) return Promise.reject(new RangeError(`不支持的内容语言：${locale}`));
      const assets = entry.content || {};
      const assetEntries = Object.entries(assets);
      if (!assetEntries.length) return Promise.resolve(null);
      const ready = () => Boolean(registry[locale]
        && assetEntries.every(([assetName]) => registry[locale][assetName]));
      if (ready()) return Promise.resolve(registry[locale]);
      if (loads.has(locale)) return loads.get(locale);
      const loader = config.loadAsset || defaultLoadAsset;
      const load = Promise.all(assetEntries
        .filter(([assetName]) => !registry[locale] || !registry[locale][assetName])
        .map(([assetName, path]) => loader(locale, assetName, path))).then(() => {
        if (!ready()) throw new Error(`内容语言资源加载后未完整注册：${locale}`);
        return registry[locale];
      }).catch(error => {
        loads.delete(locale);
        throw error;
      });
      loads.set(locale, load);
      return load;
    }

    function resolve(collection, id, source, requiredFields, sourceInfo, validateCandidate) {
      const locale = getLocale();
      const info = sourceInfo || {};
      return resolveRecord({
        collection,
        id,
        source,
        requiredFields,
        locale,
        sourceLocale,
        pack: registry[locale] && registry[locale][info.name],
        sourceName: info.name,
        sourceRevision: info.revision,
        validateCandidate,
      });
    }

    function graphSourceInfo(meta) {
      return {
        name: "graph",
        revision: { version: meta && meta.version, updatedAt: meta && meta.updatedAt },
      };
    }

    function graphNodeFields(node) {
      return ["title", "aliases", "summary", "body", "cases", "activity", "sources"]
        .filter(field => Object.prototype.hasOwnProperty.call(node, field));
    }

    return Object.freeze({
      ensureLocale,
      resolve,
      resolveGraphDomain(id, source, meta) {
        return resolve("graph.domains", id, source, ["label"], graphSourceInfo(meta),
          (candidate, _source, locale) => locale !== "en" || !HAN_PATTERN.test(candidate.fields.label));
      },
      resolveGraphEdgeType(id, source, meta) {
        return resolve("graph.edgeTypes", id, source, ["label"], graphSourceInfo(meta),
          (candidate, _source, locale) => locale !== "en" || !HAN_PATTERN.test(candidate.fields.label));
      },
      resolveGraphNode(id, source, meta) {
        return resolve("graph.nodes", id, source, graphNodeFields(source), graphSourceInfo(meta),
          validateGraphNodeTranslation);
      },
    });
  }

  return Object.freeze({
    collectWikiRefs,
    createContentI18n,
    resolveRecord,
    validateGraphNodeTranslation,
    validatePublishedRecord,
  });
});
