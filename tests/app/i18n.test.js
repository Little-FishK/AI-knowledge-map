"use strict";

const assert = require("assert");
const {
  canonicalizeLocale,
  createI18n,
  extractPlaceholders,
  interpolate,
  matchLocale,
  resolveInitialLocale,
  validateManifest,
} = require("../../assets/app/i18n.js");

const manifest = {
  sourceLocale: "zh-Hans",
  defaultLocale: "zh-Hans",
  storageKey: "test.locale",
  locales: {
    "zh-Hans": {
      direction: "ltr",
      aliases: ["zh", "zh-CN", "zh-SG"],
      matchLanguage: false,
      ui: "zh.js",
    },
    en: { direction: "ltr", aliases: [], ui: "en.js" },
    ar: { direction: "rtl", aliases: [], ui: "ar.js" },
  },
};

async function main() {
  assert.strictEqual(canonicalizeLocale("EN_us"), "en-US");
  assert.strictEqual(canonicalizeLocale("not a locale"), "");
  assert.strictEqual(matchLocale("en-GB", manifest), "en");
  assert.strictEqual(matchLocale("zh-CN", manifest), "zh-Hans");
  assert.strictEqual(matchLocale("zh-TW", manifest), "");
  assert.strictEqual(matchLocale("fr", manifest), "");

  assert.strictEqual(resolveInitialLocale({
    manifest,
    urlLocale: "en-US",
    savedLocale: "zh-Hans",
    navigatorLanguages: ["ar"],
  }), "en");
  assert.strictEqual(resolveInitialLocale({
    manifest,
    savedLocale: "fr",
    navigatorLanguages: ["ar-EG"],
  }), "ar");
  assert.strictEqual(resolveInitialLocale({ manifest, navigatorLanguages: ["fr-FR"] }), "zh-Hans");

  const gatedManifest = {
    ...manifest,
    locales: {
      ...manifest.locales,
      en: { ...manifest.locales.en, selectable: false },
    },
  };
  assert.strictEqual(resolveInitialLocale({
    manifest: gatedManifest,
    savedLocale: "en-US",
    navigatorLanguages: ["zh-CN"],
  }), "zh-Hans");

  assert.deepStrictEqual(extractPlaceholders("{name}: {count} / {name}"), ["count", "name"]);
  assert.strictEqual(interpolate("你好，{name}（{missing}）", { name: "Ada" }), "你好，Ada（{missing}）");
  assert.deepStrictEqual(validateManifest(manifest), {
    sourceLocale: "zh-Hans",
    defaultLocale: "zh-Hans",
  });
  assert.throws(() => validateManifest({ locales: {} }), /至少需要一种语言/);

  const values = new Map([[manifest.storageKey, "zh-Hans"]]);
  const storage = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const documentElement = { lang: "", dir: "", dataset: {} };
  const document = { documentElement };
  const registry = {
    "zh-Hans": {
      messages: {
        greeting: "你好，{name}",
        sourceOnly: "只有中文",
      },
    },
  };
  const loadCalls = [];
  const missing = [];
  const packs = {
    en: { messages: { greeting: "Hello, {name}" } },
    ar: { messages: { greeting: "مرحبا، {name}" } },
  };
  const i18n = createI18n({
    manifest,
    registry,
    storage,
    document,
    loadLocale: async locale => {
      loadCalls.push(locale);
      registry[locale] = packs[locale];
    },
    onMissing: event => missing.push(event),
  });

  await i18n.initialize({ urlLocale: "en-US", navigatorLanguages: ["ar"] });
  assert.strictEqual(i18n.getLocale(), "en");
  assert.deepStrictEqual(loadCalls, ["en"]);
  assert.strictEqual(values.get(manifest.storageKey), "zh-Hans");
  assert.deepStrictEqual(documentElement, { lang: "en", dir: "ltr", dataset: { locale: "en" } });
  assert.strictEqual(i18n.t("greeting", { name: "Ada" }), "Hello, Ada");
  assert.strictEqual(i18n.t("sourceOnly"), "只有中文");
  assert.deepStrictEqual(missing.pop(), { key: "sourceOnly", locale: "en", fallbackUsed: true });
  assert.strictEqual(i18n.has("greeting"), true);
  assert.strictEqual(i18n.has("sourceOnly"), false);

  const events = [];
  const unsubscribe = i18n.subscribe(event => events.push(event));
  await i18n.setLocale("ar-EG");
  assert.strictEqual(values.get(manifest.storageKey), "ar");
  assert.strictEqual(documentElement.lang, "ar");
  assert.strictEqual(documentElement.dir, "rtl");
  assert.deepStrictEqual(events, [{ locale: "ar", previousLocale: "en" }]);
  unsubscribe();
  await i18n.setLocale("zh-CN");
  assert.strictEqual(events.length, 1);
  await assert.rejects(i18n.setLocale("fr"), /不支持的语言/);
  assert.strictEqual(i18n.getLocale(), "zh-Hans");

  function fakeElement(attributes) {
    const values = new Map(Object.entries(attributes));
    return {
      textContent: "",
      getAttribute: name => values.has(name) ? values.get(name) : null,
      setAttribute: (name, value) => values.set(name, value),
    };
  }
  const textNode = fakeElement({ "data-i18n": "sourceOnly" });
  const titleNode = fakeElement({ "data-i18n-title": "greeting" });
  const localizedNodes = [textNode, titleNode];
  const localizeRoot = {
    querySelectorAll: selector => {
      const marker = selector.slice(1, -1);
      return localizedNodes.filter(node => node.getAttribute(marker) !== null);
    },
  };
  assert.strictEqual(i18n.localize(localizeRoot), 2);
  assert.strictEqual(textNode.textContent, "只有中文");
  assert.strictEqual(titleNode.getAttribute("title"), "你好，{name}");

  let gatedLoadCount = 0;
  const gatedValues = new Map([[manifest.storageKey, "en"]]);
  const gated = createI18n({
    manifest: gatedManifest,
    registry: { "zh-Hans": registry["zh-Hans"] },
    storage: {
      getItem: key => gatedValues.get(key) || null,
      setItem: (key, value) => gatedValues.set(key, value),
      removeItem: key => gatedValues.delete(key),
    },
    loadLocale: async () => { gatedLoadCount += 1; },
  });
  assert.deepStrictEqual(gated.getSupportedLocales({ selectableOnly: true }), ["zh-Hans", "ar"]);
  await gated.initialize({ navigatorLanguages: ["zh-CN"] });
  assert.strictEqual(gatedValues.has(manifest.storageKey), false);
  await assert.rejects(gated.setLocale("en"), /尚未开放/);
  assert.strictEqual(gatedLoadCount, 0);

  assert.strictEqual(typeof i18n.formatNumber(1234.5), "string");
  assert.strictEqual(typeof i18n.formatDate(new Date("2026-09-03T00:00:00Z")), "string");
  assert.strictEqual(typeof i18n.formatList(["甲", "乙"]), "string");
  assert.strictEqual(typeof i18n.compare("a", "b"), "number");
  assert.strictEqual(typeof i18n.pluralCategory(2), "string");

  const failingManifest = {
    sourceLocale: "zh-Hans",
    defaultLocale: "zh-Hans",
    locales: {
      "zh-Hans": manifest.locales["zh-Hans"],
      fr: { direction: "ltr", ui: "fr.js" },
    },
  };
  const failing = createI18n({
    manifest: failingManifest,
    registry: { "zh-Hans": registry["zh-Hans"] },
    loadLocale: async () => { throw new Error("network failed"); },
  });
  await assert.rejects(failing.setLocale("fr"), /network failed/);
  assert.strictEqual(failing.getLocale(), "zh-Hans");

  let finishEnglish;
  const raceRegistry = { "zh-Hans": registry["zh-Hans"] };
  const racing = createI18n({
    manifest,
    registry: raceRegistry,
    loadLocale: locale => new Promise(resolve => {
      if (locale === "en") finishEnglish = () => {
        raceRegistry.en = packs.en;
        resolve();
      };
    }),
  });
  const slowEnglish = racing.setLocale("en");
  await Promise.resolve();
  await racing.setLocale("zh-Hans");
  finishEnglish();
  await slowEnglish;
  assert.strictEqual(racing.getLocale(), "zh-Hans");

  console.log("i18n runtime tests passed");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
