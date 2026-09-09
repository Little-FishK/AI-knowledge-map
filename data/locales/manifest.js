/* AI 知识地图 — 语言资源清单。结构化内容按完整记录覆盖与回退。 */
window.I18N_MANIFEST = Object.freeze({
  schemaVersion: 1,
  revision: "2026-09-04-architecture-batch-2",
  sourceLocale: "zh-Hans",
  defaultLocale: "zh-Hans",
  storageKey: "ai-knowledge-map.locale.v1",
  terminology: "data/locales/terminology.js",
  locales: Object.freeze({
    "zh-Hans": Object.freeze({
      nativeLabel: "简体中文",
      direction: "ltr",
      aliases: Object.freeze(["zh", "zh-CN", "zh-SG"]),
      matchLanguage: false,
      ui: "data/locales/zh-Hans/ui.js",
      content: Object.freeze({}),
      selectable: true,
      status: "source",
    }),
    en: Object.freeze({
      nativeLabel: "English",
      direction: "ltr",
      aliases: Object.freeze([]),
      ui: "data/locales/en/ui.js",
      content: Object.freeze({ graph: "data/content-locales/en/graph.js" }),
      selectable: true,
      status: "content-partial",
    }),
  }),
});
