/* AI 知识地图 — 前端公共工具 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function createScriptLoader() {
    const loads = new Map();

    function loadOnce(src) {
      if (loads.has(src)) return loads.get(src);
      const load = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => {
          loads.delete(src);
          reject(new Error(`资源加载失败：${src}`));
        };
        document.head.appendChild(script);
      });
      loads.set(src, load);
      return load;
    }

    async function loadInOrder(srcs) {
      for (const src of srcs) await loadOnce(src);
    }

    return Object.freeze({ loadOnce, loadInOrder });
  }

  function createMarkdownRenderer(nodesById) {
    const byId = nodesById || {};

    return function markdownLite(text) {
      if (!text) return "";
      const inline = value => escapeHtml(value)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\[\[([a-z0-9-]+)\]\]/g, (match, id) => byId[id]
          ? `<span class="xref" data-goto="${id}">${escapeHtml(byId[id].title)}</span>`
          : `<span class="xref-bad" title="没有这个节点">${id}?</span>`);

      return text.split(/\n\n+/).map(block => {
        const lines = block.split("\n");

        if (lines.length >= 3 && lines[0].trim().startsWith("|") && /^\|[\s:|-]+\|$/.test(lines[1].trim())) {
          const row = (line, tag) => "<tr>" + line.trim().replace(/^\||\|$/g, "").split("|")
            .map(cell => `<${tag}>${inline(cell.trim())}</${tag}>`).join("") + "</tr>";
          return `<table class="d-table"><thead>${row(lines[0], "th")}</thead><tbody>`
            + lines.slice(2).map(line => row(line, "td")).join("") + "</tbody></table>";
        }

        if (lines.every(line => line.trim().startsWith("- "))) {
          return "<p>" + lines.map(line => inline(line.replace(/^\s*- /, "· "))).join("<br>") + "</p>";
        }
        if (lines[0].trim().startsWith("> ")) {
          return '<p class="quote">' + inline(block.replace(/^\s*> ?/gm, "")) + "</p>";
        }
        return "<p>" + lines.map(inline).join("<br>") + "</p>";
      }).join("");
    };
  }

  app.shared = Object.freeze({
    createMarkdownRenderer,
    createScriptLoader,
    debounce,
    escapeHtml,
  });
})(window);
