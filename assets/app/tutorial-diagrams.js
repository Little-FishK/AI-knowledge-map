/* Local Mermaid rendering for authored tutorial diagrams. No CDN at runtime.
 * Mermaid Tiny 12.2.0 (MIT): assets/vendor/mermaid-tiny-LICENSE.txt.
 */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  let libraryPromise;
  let renderNumber = 0;

  function loadLibrary(loadScriptsInOrder) {
    if (!libraryPromise) libraryPromise = loadScriptsInOrder(["assets/vendor/mermaid-tiny-12.2.0.min.js"]).then(() => {
      global.mermaid.initialize({
        startOnLoad: false, securityLevel: "strict", theme: "base",
        fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
        themeVariables: {
          fontSize: "16px", primaryColor: "#202f41", primaryTextColor: "#edf3fb",
          primaryBorderColor: "#87a5c4", lineColor: "#a8bdd4",
          secondaryColor: "#263b3b", tertiaryColor: "#263346",
          edgeLabelBackground: "#172231", clusterBkg: "#182333", clusterBorder: "#708ba7",
        },
        flowchart: {htmlLabels: false, useMaxWidth: false, nodeSpacing: 24, rankSpacing: 38, padding: 14},
      });
      return global.mermaid;
    }).catch(error => { libraryPromise = null; throw error; });
    return libraryPromise;
  }

  app.mountTutorialDiagrams = function (root, {loadScriptsInOrder, language = "zh-Hans"}) {
    const english = language === "en";
    const labels = english ? {
      fallback: "Flow ", suffix: " — flowchart", zoom: " zoom", out: "Zoom out", in: "Zoom in", fit: "Fit width", reset: "Original size",
      scale: "Current zoom", hint: "Scroll to see the full flow, or use the zoom controls.", region: ", scrollable",
      loading: "Rendering flowchart…", source: "View flowchart code", error: "The flowchart could not be displayed. Expand the source code below.",
    } : {
      fallback: "流程 ", suffix: "流程图", zoom: "缩放", out: "缩小", in: "放大", fit: "适应宽度", reset: "原始大小",
      scale: "当前缩放比例", hint: "可滚动查看完整流程，或使用按钮缩放。", region: "，可滚动查看",
      loading: "正在生成流程图…", source: "查看流程代码", error: "流程图暂时无法显示，请展开下方流程代码查看。",
    };
    const codes = [...root.querySelectorAll("pre > code.language-mermaid")];
    if (!codes.length) return () => {};
    let disposed = false;
    const cleanups = [];
    const entries = codes.map((code, index) => {
      const pre = code.parentElement;
      let heading = pre.previousElementSibling;
      while (heading && !/^H[23]$/.test(heading.tagName)) heading = heading.previousElementSibling;
      const title = (heading?.textContent || labels.fallback + (index + 1)) + labels.suffix;
      const figure = document.createElement("figure");
      figure.className = "course-diagram";
      figure.dataset.state = "loading";
      const caption = document.createElement("figcaption");
      caption.textContent = title;
      figure.append(caption);
      const controls = document.createElement("div");
      controls.className = "course-diagram-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", title + labels.zoom);
      for (const action of ["out", "in", "fit", "reset"]) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.diagramAction = action;
        button.textContent = labels[action];
        button.disabled = true;
        controls.append(button);
      }
      const percent = document.createElement("output");
      percent.className = "course-diagram-scale";
      percent.setAttribute("aria-label", labels.scale);
      controls.append(percent);
      figure.append(controls);
      const hint = document.createElement("p");
      hint.className = "course-diagram-hint";
      hint.textContent = labels.hint;
      figure.append(hint);
      const viewport = document.createElement("div");
      viewport.className = "course-diagram-viewport";
      viewport.tabIndex = 0;
      viewport.setAttribute("role", "region");
      viewport.setAttribute("aria-label", title + labels.region);
      const canvas = document.createElement("div");
      canvas.className = "course-diagram-canvas";
      const status = document.createElement("p");
      status.className = "course-diagram-status";
      status.setAttribute("role", "status");
      status.textContent = labels.loading;
      canvas.append(status);
      viewport.append(canvas);
      figure.append(viewport);
      const details = document.createElement("details");
      details.className = "course-diagram-source";
      const summary = document.createElement("summary");
      summary.textContent = labels.source;
      details.append(summary);
      pre.replaceWith(figure);
      details.append(pre);
      figure.append(details);
      return {figure, controls, percent, viewport, canvas, status, title, source: code.textContent};
    });

    (async () => {
      const mermaid = await loadLibrary(loadScriptsInOrder);
      if (document.fonts?.ready) await document.fonts.ready;
      for (const entry of entries) {
        if (disposed || !root.isConnected) break;
        const {figure, controls, percent, viewport, canvas, status, title, source} = entry;
        try {
          const result = await mermaid.render("course-flow-" + (++renderNumber), source);
          if (disposed || !figure.isConnected) break;
          canvas.innerHTML = result.svg;
          const svg = canvas.querySelector("svg");
          if (!svg?.viewBox.baseVal.width) throw new Error("Missing SVG bounds");
          svg.setAttribute("role", "img");
          svg.setAttribute("aria-label", title);
          const {width, height} = svg.viewBox.baseVal;
          let scale = Math.min(1, Math.max(0.85, (viewport.clientWidth - 24) / width));
          let fitMode = false;
          const update = () => {
            svg.style.maxWidth = "none";
            svg.style.width = width * scale + "px";
            svg.style.height = height * scale + "px";
            canvas.style.width = width * scale + "px";
            percent.textContent = Math.round(scale * 100) + "%";
          };
          const fit = () => { scale = Math.min(2, Math.max(0.15, (viewport.clientWidth - 24) / width)); update(); };
          const onClick = event => {
            const button = event.target.closest("[data-diagram-action]");
            if (!button) return;
            const action = button.dataset.diagramAction;
            const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / scale;
            const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / scale;
            fitMode = action === "fit";
            if (fitMode) fit();
            else {
              scale = action === "reset" ? 1 : Math.min(2.5, Math.max(0.15, scale + (action === "in" ? 0.15 : -0.15)));
              update();
              viewport.scrollLeft = centerX * scale - viewport.clientWidth / 2;
              viewport.scrollTop = centerY * scale - viewport.clientHeight / 2;
            }
          };
          controls.addEventListener("click", onClick);
          const observer = new ResizeObserver(() => { if (fitMode) fit(); });
          observer.observe(viewport);
          cleanups.push(() => { observer.disconnect(); controls.removeEventListener("click", onClick); });
          controls.querySelectorAll("button").forEach(button => { button.disabled = false; });
          update();
          // Start at the entry node, rather than an empty left margin on phones.
          const firstNode = svg.querySelector(".node");
          if (firstNode && viewport.scrollWidth > viewport.clientWidth) {
            const nodeBounds = firstNode.getBoundingClientRect();
            const viewportBounds = viewport.getBoundingClientRect();
            viewport.scrollLeft += nodeBounds.left + nodeBounds.width / 2 - viewportBounds.left - viewportBounds.width / 2;
          }
          figure.dataset.state = "ready";
        } catch (error) {
          canvas.replaceChildren(status);
          status.textContent = labels.error;
          figure.dataset.state = "error";
        }
      }
    })().catch(() => {
      if (disposed) return;
      entries.forEach(({figure, status}) => {
        figure.dataset.state = "error";
        status.textContent = labels.error;
      });
    });
    return () => { disposed = true; cleanups.forEach(dispose => dispose()); };
  };
})(window);
