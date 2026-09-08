/* AI 知识地图 — 理解原理页运行时加载器 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  app.createDeepDiveLoader = function createDeepDiveLoader(options) {
    const runtime = options.runtime;
    const ids = options.ids;
    const registry = options.registry;
    const revision = options.revision;
    const t = options.t;
    const loads = new Map();

    function ensureSource(id) {
      if (registry[id]) return Promise.resolve(registry[id]);
      if (!ids.has(id)) return Promise.reject(new Error(t("deepdive.missing", { id })));
      if (loads.has(id)) return loads.get(id);

      const load = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${runtime.base}/${encodeURIComponent(id)}.js?v=${encodeURIComponent(revision)}`;
        script.async = true;
        const timeout = global.setTimeout(() => script.onerror(), options.sourceTimeoutMs || 12000);
        script.onload = () => {
          global.clearTimeout(timeout);
          script.remove();
          if (registry[id]) resolve(registry[id]);
          else { loads.delete(id); reject(new Error(t("deepdive.unregistered", { id }))); }
        };
        script.onerror = () => {
          global.clearTimeout(timeout);
          script.remove();
          loads.delete(id);
          reject(new Error(t("deepdive.resourceError", { id })));
        };
        document.head.appendChild(script);
      });
      loads.set(id, load);
      return load;
    }

    async function digest(value) {
      const bytes = await global.crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value)));
      return "sha256:" + Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
    }
    async function ensure(id) {
      const locale = options.getLocale ? options.getLocale() : "zh-Hans";
      const source = await ensureSource(id);
      if (locale !== "en") return source;
      const fallback = () => ({ ...source, contentLocale: "zh-Hans", translationFallback: true });
      // file://, insecure hosts, unpublished or stale English always retain the complete Chinese page.
      if (!global.crypto?.subtle || global.location?.protocol === "file:"
        || ["published-provisional", "published-editorial-draft"].includes(source.publication?.status)) return fallback();
      const abort = new AbortController();
      const timeout = global.setTimeout(() => abort.abort(), options.englishTimeoutMs || 8000);
      try {
        const response = await global.fetch(`${options.englishBase || "data/content-locales/en/deepdive"}/${encodeURIComponent(id)}.json`, { cache: "no-store", signal: abort.signal });
        if (!response.ok) return fallback();
        const envelope = await response.json(), payload = envelope.payload;
        const sourceFields = {};
        for (const key of ["title", "subtitle", "aliases", "meta", "thesis", "html"]) if (source[key] !== undefined) sourceFields[key] = source[key];
        if (envelope.schemaVersion !== 1 || envelope.status !== "human-approved" || payload?.pageId !== id
          || envelope.artifactHash !== await digest(payload) || payload.sourceContentHash !== await digest(sourceFields)) return fallback();
        const page = payload.page;
        if (!page || typeof page.title !== "string" || typeof page.html !== "string"
          || ["subtitle", "aliases", "meta", "thesis"].some(key => page[key] !== undefined && !(typeof page[key] === "string"
            || Array.isArray(page[key]) && page[key].every(item => typeof item === "string")))) return fallback();
        return { ...page, contentLocale: "en", translationFallback: false, plainThesis: true, publication: source.publication };
      } catch (_) { return fallback(); }
      finally { global.clearTimeout(timeout); }
    }
    return Object.freeze({ ensure, ensureSource });
  };
})(window);
