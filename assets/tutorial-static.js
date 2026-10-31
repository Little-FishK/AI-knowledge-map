/* Enhance existing diagram source blocks; the chapter text is already in HTML. */
(function () {
  "use strict";
  const app = window.AIMap;
  if (!app?.mountTutorialDiagrams || !document.querySelector("pre code.language-mermaid")) return;
  const siteRoot = new URL("../", document.currentScript.src);
  const loader = app.shared.createScriptLoader();
  app.mountTutorialDiagrams(document.querySelector(".tutorial-content"), {
    language: document.documentElement.lang,
    loadScriptsInOrder: files => loader.loadInOrder(files.map(file => new URL(file, siteRoot).href)),
  });
})();
