/* AI 知识地图 — 理解原理页运行时加载器 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  app.createDeepDiveLoader = function createDeepDiveLoader(options) {
    const runtime = options.runtime;
    const ids = options.ids;
    const registry = options.registry;
    const revision = options.revision;
    const loads = new Map();

    function ensure(id) {
      if (registry[id]) return Promise.resolve(registry[id]);
      if (!ids.has(id)) return Promise.reject(new Error(`不存在理解原理页：${id}`));
      if (loads.has(id)) return loads.get(id);

      const load = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${runtime.base}/${encodeURIComponent(id)}.js?v=${encodeURIComponent(revision)}`;
        script.async = true;
        script.onload = () => {
          script.remove();
          if (registry[id]) resolve(registry[id]);
          else reject(new Error(`理解原理页加载后未注册：${id}`));
        };
        script.onerror = () => {
          script.remove();
          loads.delete(id);
          reject(new Error(`理解原理页加载失败：${id}`));
        };
        document.head.appendChild(script);
      });
      loads.set(id, load);
      return load;
    }

    return Object.freeze({ ensure });
  };
})(window);
