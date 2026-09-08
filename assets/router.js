/* AI 知识地图 — 离线兼容的 Hash 路由 */
(function (root, factory) {
  "use strict";

  const api = factory();
  if (root) root.APP_ROUTER = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const ROUTES_WITH_ID = new Set(["map", "concept", "software", "tutorial", "library"]);

  function decodeSegment(value) {
    try {
      return decodeURIComponent(value);
    } catch (_) {
      return "";
    }
  }

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

  function format(route) {
    const value = route || { name: "map" };
    const id = value.id == null ? "" : encodeURIComponent(String(value.id));
    switch (value.name) {
      case "map": return id ? `#/map/${id}` : "#/map";
      case "concept": return id ? `#/concept/${id}` : "#/map";
      case "software": return "#/software";
      case "software-item": return id ? `#/software/${id}` : "#/software";
      case "tutorial": return id ? `#/tutorial/${id}` : "#/software";
      case "library": return "#/library";
      case "library-item": return id ? `#/library/${id}` : "#/library";
      default: return "#/map";
    }
  }

  function navigate(route, options) {
    if (typeof window === "undefined") return false;
    const nextHash = format(route);
    if (window.location.hash === nextHash) return false;
    if (options && options.replace) {
      try {
        const nextUrl = new URL(window.location.href);
        nextUrl.hash = nextHash.slice(1);
        window.history.replaceState(null, "", nextUrl.href);
      } catch (_) {
        window.location.replace(nextHash);
      }
    } else {
      window.location.hash = nextHash.slice(1);
    }
    return true;
  }

  return { parse, format, navigate };
});
