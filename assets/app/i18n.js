/* AI 知识地图 — 离线兼容的国际化核心 */
(function (root, factory) {
  "use strict";

  const api = factory();
  if (root) {
    const app = root.AIMap = root.AIMap || {};
    app.i18n = api;
  }
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const PLACEHOLDER_PATTERN = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

  function canonicalizeLocale(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      return Intl.getCanonicalLocales(value.trim().replace(/_/g, "-"))[0] || "";
    } catch (_) {
      return "";
    }
  }

  function localeParts(value) {
    const canonical = canonicalizeLocale(value);
    if (!canonical) return null;
    try {
      const locale = new Intl.Locale(canonical);
      return { canonical, language: locale.language, script: locale.script || "" };
    } catch (_) {
      const [language] = canonical.split("-");
      return { canonical, language, script: "" };
    }
  }

  function validateManifest(manifest) {
    if (!manifest || typeof manifest !== "object") throw new TypeError("国际化清单必须是对象");
    if (!manifest.locales || typeof manifest.locales !== "object") throw new TypeError("国际化清单缺少 locales");
    const localeIds = Object.keys(manifest.locales);
    if (!localeIds.length) throw new TypeError("国际化清单至少需要一种语言");
    localeIds.forEach(locale => {
      if (canonicalizeLocale(locale) !== locale) throw new TypeError(`语言代码不是规范的 BCP 47：${locale}`);
      const entry = manifest.locales[locale];
      if (!entry || typeof entry !== "object") throw new TypeError(`语言配置无效：${locale}`);
      if (!entry.ui) throw new TypeError(`语言配置缺少界面资源：${locale}`);
      if (!entry.direction || !["ltr", "rtl", "auto"].includes(entry.direction)) {
        throw new TypeError(`语言文字方向无效：${locale}`);
      }
    });
    const sourceLocale = canonicalizeLocale(manifest.sourceLocale || manifest.defaultLocale);
    const defaultLocale = canonicalizeLocale(manifest.defaultLocale || sourceLocale);
    if (!manifest.locales[sourceLocale]) throw new TypeError("国际化清单的源语言不存在");
    if (!manifest.locales[defaultLocale]) throw new TypeError("国际化清单的默认语言不存在");
    return { sourceLocale, defaultLocale };
  }

  function matchLocale(requested, manifest) {
    const requestedParts = localeParts(requested);
    if (!requestedParts) return "";
    const locales = manifest.locales || {};
    const localeIds = Object.keys(locales);

    const exact = localeIds.find(locale => locale === requestedParts.canonical);
    if (exact) return exact;

    for (const locale of localeIds) {
      const aliases = locales[locale].aliases || [];
      if (aliases.some(alias => canonicalizeLocale(alias) === requestedParts.canonical)) return locale;
    }

    for (const locale of localeIds) {
      const candidate = localeParts(locale);
      if (!candidate || candidate.language !== requestedParts.language) continue;
      if (candidate.script && requestedParts.script && candidate.script !== requestedParts.script) continue;
      if (locales[locale].matchLanguage === false) continue;
      return locale;
    }
    return "";
  }

  function resolveInitialLocale(options) {
    const manifest = options.manifest;
    const { defaultLocale } = validateManifest(manifest);
    const candidates = [
      options.urlLocale,
      options.savedLocale,
      ...(Array.isArray(options.navigatorLanguages) ? options.navigatorLanguages : []),
    ];
    for (const candidate of candidates) {
      const matched = matchLocale(candidate, manifest);
      if (matched && manifest.locales[matched].selectable !== false) return matched;
    }
    return defaultLocale;
  }

  function extractPlaceholders(message) {
    const result = new Set();
    String(message || "").replace(PLACEHOLDER_PATTERN, (_, name) => {
      result.add(name);
      return _;
    });
    return [...result].sort();
  }

  function interpolate(message, variables) {
    const values = variables || {};
    return String(message).replace(PLACEHOLDER_PATTERN, (placeholder, name) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : placeholder);
  }

  function safeRead(storage, key) {
    if (!storage || !key) return "";
    try {
      return storage.getItem(key) || "";
    } catch (_) {
      return "";
    }
  }

  function safeWrite(storage, key, value) {
    if (!storage || !key) return false;
    try {
      storage.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  }

  function safeRemove(storage, key) {
    if (!storage || !key) return false;
    try {
      storage.removeItem(key);
      return true;
    } catch (_) {
      return false;
    }
  }

  function createI18n(options) {
    const config = options || {};
    const manifest = config.manifest;
    const { sourceLocale, defaultLocale } = validateManifest(manifest);
    const registry = config.registry || {};
    const documentRef = config.document || (typeof document !== "undefined" ? document : null);
    const storage = config.storage || (typeof localStorage !== "undefined" ? localStorage : null);
    const storageKey = config.storageKey || manifest.storageKey || "ai-knowledge-map.locale.v1";
    const listeners = new Set();
    const loads = new Map();
    let currentLocale = defaultLocale;
    let latestRequest = 0;

    function messagesFor(locale) {
      const pack = registry[locale];
      if (!pack) return null;
      return pack.messages && typeof pack.messages === "object" ? pack.messages : pack;
    }

    function defaultLoadLocale(locale, entry) {
      if (!documentRef || !documentRef.createElement || !documentRef.head) {
        return Promise.reject(new Error(`没有可用的脚本加载环境：${locale}`));
      }
      return new Promise((resolve, reject) => {
        const script = documentRef.createElement("script");
        script.src = entry.ui;
        script.async = true;
        script.onload = () => {
          script.remove();
          resolve();
        };
        script.onerror = () => {
          script.remove();
          reject(new Error(`语言资源加载失败：${locale}`));
        };
        documentRef.head.appendChild(script);
      });
    }

    function ensureLocale(locale) {
      if (messagesFor(locale)) return Promise.resolve(messagesFor(locale));
      if (loads.has(locale)) return loads.get(locale);
      const entry = manifest.locales[locale];
      if (!entry) return Promise.reject(new RangeError(`不支持的语言：${locale}`));
      const loader = config.loadLocale || defaultLoadLocale;
      const load = Promise.resolve(loader(locale, entry)).then(() => {
        const messages = messagesFor(locale);
        if (!messages) throw new Error(`语言资源加载后未注册：${locale}`);
        return messages;
      }).catch(error => {
        loads.delete(locale);
        throw error;
      });
      loads.set(locale, load);
      return load;
    }

    function applyDocumentLanguage(locale) {
      if (!documentRef || !documentRef.documentElement) return;
      const entry = manifest.locales[locale];
      documentRef.documentElement.lang = locale;
      documentRef.documentElement.dir = entry.direction;
      documentRef.documentElement.dataset.locale = locale;
    }

    async function setLocale(requested, setOptions) {
      const matched = matchLocale(requested, manifest);
      if (!matched) throw new RangeError(`不支持的语言：${requested}`);
      const allowUnavailable = Boolean(setOptions && setOptions.allowUnavailable);
      if (manifest.locales[matched].selectable === false && !allowUnavailable) {
        throw new RangeError(`语言尚未开放：${matched}`);
      }
      const requestId = ++latestRequest;
      await ensureLocale(sourceLocale);
      if (matched !== sourceLocale) await ensureLocale(matched);
      if (requestId !== latestRequest) return currentLocale;
      const previousLocale = currentLocale;
      currentLocale = matched;
      applyDocumentLanguage(matched);
      const shouldPersist = !setOptions || setOptions.persist !== false;
      if (shouldPersist) safeWrite(storage, storageKey, matched);
      if (previousLocale !== matched) {
        listeners.forEach(listener => listener({ locale: matched, previousLocale }));
      }
      return matched;
    }

    async function initialize(initialOptions) {
      const init = initialOptions || {};
      const savedWasProvided = Object.prototype.hasOwnProperty.call(init, "savedLocale");
      const savedLocale = savedWasProvided ? init.savedLocale : safeRead(storage, storageKey);
      const savedMatch = matchLocale(savedLocale, manifest);
      if (!savedWasProvided && savedLocale
          && (!savedMatch || manifest.locales[savedMatch].selectable === false)) {
        safeRemove(storage, storageKey);
      }
      const locale = resolveInitialLocale({
        manifest,
        urlLocale: init.urlLocale,
        savedLocale,
        navigatorLanguages: init.navigatorLanguages || (
          typeof navigator !== "undefined" ? navigator.languages : []
        ),
      });
      return setLocale(locale, { persist: false });
    }

    function translate(key, variables) {
      const currentMessages = messagesFor(currentLocale) || {};
      const sourceMessages = messagesFor(sourceLocale) || {};
      let message = currentMessages[key];
      let fallbackUsed = false;
      if (typeof message !== "string") {
        message = sourceMessages[key];
        fallbackUsed = typeof message === "string";
      }
      if (typeof message !== "string") message = key;
      if (typeof config.onMissing === "function" && (!Object.prototype.hasOwnProperty.call(currentMessages, key) || message === key)) {
        config.onMissing({ key, locale: currentLocale, fallbackUsed });
      }
      return interpolate(message, variables);
    }

    function has(key, locale = currentLocale) {
      const messages = messagesFor(locale);
      return Boolean(messages && typeof messages[key] === "string");
    }

    function subscribe(listener) {
      if (typeof listener !== "function") throw new TypeError("语言订阅者必须是函数");
      listeners.add(listener);
      return () => listeners.delete(listener);
    }

    function localeForFormatting(locale) {
      return matchLocale(locale || currentLocale, manifest) || defaultLocale;
    }

    function localize(rootNode) {
      const scope = rootNode || documentRef;
      if (!scope) return 0;
      const bindings = [
        ["data-i18n", "textContent"],
        ["data-i18n-title", "title"],
        ["data-i18n-aria-label", "aria-label"],
        ["data-i18n-placeholder", "placeholder"],
      ];
      let localized = 0;
      bindings.forEach(([marker, target]) => {
        const selector = `[${marker}]`;
        const nodes = [];
        if (typeof scope.matches === "function" && scope.matches(selector)) nodes.push(scope);
        if (typeof scope.querySelectorAll === "function") nodes.push(...scope.querySelectorAll(selector));
        nodes.forEach(node => {
          const key = node.getAttribute(marker);
          if (!key) return;
          const value = translate(key);
          if (target === "textContent") node.textContent = value;
          else node.setAttribute(target, value);
          localized += 1;
        });
      });
      return localized;
    }

    return Object.freeze({
      compare(left, right, options, locale) {
        return new Intl.Collator(localeForFormatting(locale), options).compare(String(left), String(right));
      },
      ensureLocale,
      formatDate(value, options, locale) {
        return new Intl.DateTimeFormat(localeForFormatting(locale), options).format(value);
      },
      formatList(values, options, locale) {
        return new Intl.ListFormat(localeForFormatting(locale), options).format(values);
      },
      formatNumber(value, options, locale) {
        return new Intl.NumberFormat(localeForFormatting(locale), options).format(value);
      },
      getLocale: () => currentLocale,
      getLocaleMeta: locale => manifest.locales[matchLocale(locale, manifest) || currentLocale],
      getSupportedLocales: options => Object.keys(manifest.locales).filter(locale =>
        !options || !options.selectableOnly || manifest.locales[locale].selectable !== false),
      has,
      initialize,
      localize,
      pluralCategory(value, options, locale) {
        return new Intl.PluralRules(localeForFormatting(locale), options).select(value);
      },
      setLocale,
      subscribe,
      t: translate,
    });
  }

  return Object.freeze({
    canonicalizeLocale,
    createI18n,
    extractPlaceholders,
    interpolate,
    matchLocale,
    resolveInitialLocale,
    validateManifest,
  });
});
