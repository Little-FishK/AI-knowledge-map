/* AI 知识地图 — 位置路由：只用无片段的路径 + 查询参数地址
 *
 * 三个交互视图各有一个真实目录（GitHub Pages 无需重写规则）：
 *   /                       地图
 *   /?node=<id>             地图定位到某个节点
 *   /?concept=<id>          就地打开理解原理页（未发布时的回退阅读器）
 *   /software/              软件目录      /software/?item=<id>  软件详情
 *   /software/?tutorial=<id> 教程        /library/             专业资料库
 *   /library/?item=<id>     资料详情
 *
 * 语言等既有查询参数（?lang=）在导航时原样保留。
 * 导航依赖 history.pushState，需要一个 http(s) 源：本地预览请用项目自带的本地站点启动器，
 * 正式站点由 GitHub Pages 提供。直接以 file:// 打开时地图与内容仍会渲染，但浏览器禁止
 * pushState，地址栏不会随视图变化，这不再是受支持的用法。
 * 旧 `#/...` 地址继续解析（parse/format 保留给旧书签），加载时就地升级为路径形式。
 */
(function (root, factory) {
  "use strict";

  const api = factory();
  if (root) root.APP_ROUTER = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const ROUTES_WITH_ID = new Set(["map", "concept", "software", "tutorial", "library"]);

  // pushState changes the document URL, which would also change the base used by
  // scripts loaded later (for example data/software.js after entering /software/).
  // Freeze the shell's initial base as an absolute URL before any navigation.
  // View shells already resolve their <base href="../"> to the site root here.
  const STABLE_BASE_URI = (() => {
    if (typeof document === "undefined" || !document.baseURI) return "";
    try {
      const initial = new URL(document.baseURI);
      const base = document.querySelector("base") || document.createElement("base");
      base.href = initial.href;
      if (!base.parentNode && document.head) document.head.prepend(base);
      return base.href;
    } catch (_) {
      return "";
    }
  })();

  function decodeSegment(value) {
    try {
      return decodeURIComponent(value);
    } catch (_) {
      return "";
    }
  }

  // Legacy fragment contract. Kept only so old `#/...` bookmarks still resolve and
  // so nothing silently drops the ability to recognise them; no code emits these
  // fragments any more.
  function parse(hash) {
    const raw = String(hash || "").replace(/^#/, "");
    const segments = raw.split("/").filter(Boolean).map(decodeSegment);
    if (!segments.length) return { name: "map" };

    const [section, id, ...rest] = segments;
    if (rest.length || !ROUTES_WITH_ID.has(section)) {
      return { name: "not-found", path: raw };
    }
    if (section === "map") return id ? { name: "map", id } : { name: "map" };
    if (section === "concept") return id ? { name: "concept", id } : { name: "not-found", path: raw };
    if (section === "software") return id ? { name: "software-item", id } : { name: "software" };
    if (section === "tutorial") return id ? { name: "tutorial", id } : { name: "not-found", path: raw };
    return id ? { name: "library-item", id } : { name: "library" };
  }

  // Inverse of parse(); also legacy-only. Navigation never produces fragments.
  function format(route) {
    const value = route || { name: "map" };
    const id = value.id == null ? "" : encodeURIComponent(String(value.id));
    switch (value.name) {
      case "map": return id ? `#/map/${id}` : "";
      case "concept": return id ? `#/concept/${id}` : "";
      case "software": return "#/software";
      case "software-item": return id ? `#/software/${id}` : "#/software";
      case "tutorial": return id ? `#/tutorial/${id}` : "#/software";
      case "library": return "#/library";
      case "library-item": return id ? `#/library/${id}` : "#/library";
      default: return "";
    }
  }

  // The site root is whatever directory hosts the current shell document. The
  // build injects <base href="../"> into /library/ and /software/ copies so it
  // resolves to the site root instead of the view directory.
  function siteRoot(baseURI) {
    try {
      if (baseURI) return new URL(baseURI, typeof location !== "undefined" ? location.href : undefined);
      if (STABLE_BASE_URI) return new URL(STABLE_BASE_URI);
      if (typeof document !== "undefined" && document.baseURI) return new URL(document.baseURI);
    } catch (_) {
      return null;
    }
    return null;
  }

  function currentLocation() {
    return typeof window !== "undefined" ? window.location : null;
  }

  function parsePath(location, baseURI) {
    const root = siteRoot(baseURI);
    if (!root) return { name: "map" };
    let here;
    try {
      here = new URL(location.href);
    } catch (_) {
      return { name: "map" };
    }
    if (here.origin !== root.origin || !here.pathname.startsWith(root.pathname)) {
      return { name: "not-found", path: here.pathname };
    }
    const relative = here.pathname.slice(root.pathname.length)
      .replace(/(?:^|\/)index\.html$/, "")
      .replace(/\/+$/, "");
    const query = new URLSearchParams(here.search);
    if (!relative) {
      const concept = query.get("concept");
      if (concept) return { name: "concept", id: concept };
      const node = query.get("node");
      return node ? { name: "map", id: node } : { name: "map" };
    }
    if (relative === "library") {
      const item = query.get("item");
      return item ? { name: "library-item", id: item } : { name: "library" };
    }
    if (relative === "software") {
      const tutorial = query.get("tutorial");
      if (tutorial) return { name: "tutorial", id: tutorial };
      const item = query.get("item");
      return item ? { name: "software-item", id: item } : { name: "software" };
    }
    return { name: "not-found", path: here.pathname };
  }

  // A legacy #/... fragment wins so old bookmarks keep working; otherwise the
  // clean path is authoritative.
  function parseLocation(location, baseURI) {
    const here = location || currentLocation();
    if (!here) return { name: "map" };
    const hash = String(here.hash || "");
    if (hash && hash !== "#" && hash !== "#/") {
      const route = parse(hash);
      if (route.name !== "not-found") return route;
    }
    return parsePath(here, baseURI);
  }

  // Returns an absolute URL for the clean contract, or null when there is no base
  // to resolve against, the document sits on a scheme that cannot host pushState
  // (file:// has a null origin), or the route is unknown. Callers must not invent
  // a fallback URL: a null here means "the view can render but the URL cannot move".
  function formatPath(route, baseURI, search) {
    const root = siteRoot(baseURI);
    if (!root || !/^https?:$/.test(root.protocol)) return null;
    const value = route || { name: "map" };
    const id = value.id == null ? "" : String(value.id);
    const params = new URLSearchParams();
    const language = new URLSearchParams(search || "").get("lang");
    if (language) params.set("lang", language);
    let pathname = root.pathname;
    switch (value.name) {
      case "map":
        if (id) params.set("node", id);
        break;
      case "concept":
        if (!id) return null;
        params.set("concept", id);
        break;
      case "software":
        pathname += "software/";
        break;
      case "software-item":
        if (!id) return null;
        pathname += "software/";
        params.set("item", id);
        break;
      case "tutorial":
        if (!id) return null;
        pathname += "software/";
        params.set("tutorial", id);
        break;
      case "library":
        pathname += "library/";
        break;
      case "library-item":
        if (!id) return null;
        pathname += "library/";
        params.set("item", id);
        break;
      default:
        return null;
    }
    const query = params.toString();
    return `${root.origin}${pathname}${query ? `?${query}` : ""}`;
  }

  function emitLocationChange(oldURL, newURL) {
    try {
      window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL }));
    } catch (_) {
      window.dispatchEvent(new Event("hashchange"));
    }
  }

  // Path navigation is the only contract. pushState needs an http(s) origin, so a
  // document opened from disk cannot navigate; that degrades to "render the view,
  // leave the address bar alone" instead of throwing.
  function navigate(route, options) {
    if (typeof window === "undefined") return false;
    const opts = options || {};
    const absolute = formatPath(route, opts.baseURI, window.location.search);
    if (!absolute) return false;
    try {
      const target = new URL(absolute);
      target.hash = "";
      const current = new URL(window.location.href);
      current.hash = "";
      if (current.href === target.href && !window.location.hash) return false;
      const oldURL = window.location.href;
      if (opts.replace) window.history.replaceState(null, "", target.href);
      else window.history.pushState(null, "", target.href);
      // replaceState and pushState emit no event, and the application renders on
      // location changes only.
      if (!opts.silent) emitLocationChange(oldURL, target.href);
      return true;
    } catch (_) {
      return false;
    }
  }

  return { parse, format, parseLocation, formatPath, navigate, siteRoot };
});
