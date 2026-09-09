/* AI 知识地图 — 学习进度与推荐路径面板 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  app.createLearningView = function createLearningView(options) {
    const graph = options.graph;
    const domains = options.domains;
    const byId = options.byId;
    const recommendedPath = options.recommendedPath;
    const recommendedIndex = options.recommendedIndex;
    const esc = options.escapeHtml;
    const storageKey = options.storageKey;
    const ensureDeepDive = options.ensureDeepDive;
    const navigate = options.navigate;
    const selectNode = options.selectNode;
    const isDeepDiveActive = options.isDeepDiveActive;
    const t = options.t;
    const content = options.content;
    const elements = {};
    const buttons = new Map();
    const nodeIndex = new Map(graph.nodes.map((node, index) => [node.id, index]));
    const learnedNodes = loadLearnedNodes();

    function localizedNode(id) {
      const source = byId[id];
      return source && content ? content.resolveGraphNode(id, source, graph.meta).record : source;
    }

    function localizedDomain(id) {
      const source = domains[id] || { color: "#888", label: id };
      return content ? content.resolveGraphDomain(id, source, graph.meta).record : source;
    }

    function loadLearnedNodes() {
      try {
        const saved = JSON.parse(global.localStorage.getItem(storageKey) || "[]");
        return new Set(Array.isArray(saved) ? saved.filter(id => !!byId[id]) : []);
      } catch (error) {
        console.warn("学习进度读取失败，将使用空进度：", error);
        return new Set();
      }
    }

    function saveLearnedNodes() {
      try {
        global.localStorage.setItem(storageKey, JSON.stringify(Array.from(learnedNodes)));
      } catch (error) {
        console.warn("学习进度保存失败：", error);
      }
    }

    function preloadNeighbors(id) {
      const currentIndex = recommendedIndex.get(id);
      const previous = Number.isInteger(currentIndex) ? recommendedPath[currentIndex - 1] : null;
      const next = Number.isInteger(currentIndex) ? recommendedPath[currentIndex + 1] : null;
      if (previous) ensureDeepDive(previous.id).catch(error => console.warn(error.message));
      if (next) ensureDeepDive(next.id).catch(error => console.warn(error.message));
    }

    function renderButtonHtml(id) {
      const learned = learnedNodes.has(id);
      const currentIndex = recommendedIndex.get(id);
      const previousStep = Number.isInteger(currentIndex) ? recommendedPath[currentIndex - 1] : null;
      const nextStep = Number.isInteger(currentIndex) ? recommendedPath[currentIndex + 1] : null;
      const previousNode = previousStep && localizedNode(previousStep.id);
      const nextNode = nextStep && localizedNode(nextStep.id);
      const previousButton = previousStep && previousNode
        ? `<button type="button" class="dd-path-btn dd-prev-btn" data-prev-node="${esc(previousStep.id)}" aria-label="${esc(t("learning.previous.aria", { order: previousStep.order, title: previousNode.title }))}">
            <span aria-hidden="true">←</span>
            <span class="dd-path-copy"><small>${esc(t("learning.previous", { order: previousStep.order }))}</small><strong>${esc(previousNode.title)}</strong></span>
          </button>`
        : "";
      const nextButton = nextStep && nextNode
        ? `<button type="button" class="dd-path-btn dd-next-btn" data-next-node="${esc(nextStep.id)}" aria-label="${esc(t("learning.next.aria", { order: nextStep.order, title: nextNode.title }))}">
            <span class="dd-path-copy"><small>${esc(t("learning.next", { order: nextStep.order }))}</small><strong>${esc(nextNode.title)}</strong></span>
            <span aria-hidden="true">→</span>
          </button>`
        : "";
      return `<section class="dd-learning-complete">
        <div>
          <div class="dd-learning-kicker">${t(learned ? "learning.progress.updated" : "learning.progress.question")}</div>
          <div class="dd-learning-copy">${t(learned ? "learning.progress.updatedDescription" : "learning.progress.description")}</div>
        </div>
        <div class="dd-learning-actions">
          ${previousButton}
          <button type="button" class="dd-learn-btn${learned ? " is-learned" : ""}" data-learn-node="${esc(id)}" aria-pressed="${learned}">
            ${t(learned ? "learning.marked" : "learning.mark")}
          </button>
          ${nextButton}
        </div>
      </section>`;
    }

    function makeButton(node) {
      node = localizedNode(node.id);
      const domain = localizedDomain(node.domain);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "learning-node";
      button.setAttribute("data-learning-goto", node.id);
      button.title = domain.label;
      button.innerHTML = `<span class="dot" style="background:${domain.color}"></span><span>${esc(node.title)}</span>`;
      return button;
    }

    function setEmptyState(list, isDone) {
      if (!list) return;
      const hasNodes = !!list.querySelector(".learning-node");
      let empty = list.querySelector(".learning-empty");
      if (hasNodes) {
        if (empty) empty.remove();
        return;
      }
      if (!empty) {
        empty = document.createElement("div");
        empty.className = "learning-empty";
        empty.textContent = t(isDone ? "learning.empty.done" : "learning.empty.todo");
        list.appendChild(empty);
      }
    }

    function updateCounts() {
      const total = graph.nodes.length;
      const doneCount = learnedNodes.size;
      const percent = total ? Math.round(doneCount / total * 100) : 0;
      if (!elements["learning-done-count"]) return;
      elements["learning-done-count"].textContent = doneCount;
      elements["learning-total-count"].textContent = t("learning.nodeCount", { count: total });
      elements["learning-percent"].textContent = `${percent}%`;
      elements["learning-progress-bar"].style.width = `${percent}%`;
      elements["learning-done-label"].textContent = doneCount;
      elements["learning-todo-label"].textContent = total - doneCount;
    }

    function renderPanel() {
      const doneList = elements["learning-done-list"];
      const todoList = elements["learning-todo-list"];
      if (!doneList || !todoList) return;
      doneList.innerHTML = "";
      todoList.innerHTML = "";
      buttons.clear();
      graph.nodes.forEach(node => {
        const button = makeButton(node);
        buttons.set(node.id, button);
        (learnedNodes.has(node.id) ? doneList : todoList).appendChild(button);
      });
      setEmptyState(doneList, true);
      setEmptyState(todoList, false);
      updateCounts();
    }

    function insertButtonInOrder(list, id) {
      const button = buttons.get(id);
      if (!button) return;
      const start = (nodeIndex.get(id) ?? -1) + 1;
      for (let index = start; index < graph.nodes.length; index++) {
        const other = buttons.get(graph.nodes[index].id);
        if (other && other.parentNode === list) {
          list.insertBefore(button, other);
          return;
        }
      }
      list.appendChild(button);
    }

    function toggle(id) {
      if (!byId[id]) return;
      const nowLearned = !learnedNodes.has(id);
      if (nowLearned) learnedNodes.add(id);
      else learnedNodes.delete(id);
      saveLearnedNodes();

      const doneList = elements["learning-done-list"];
      const todoList = elements["learning-todo-list"];
      if (buttons.has(id) && doneList && todoList) {
        insertButtonInOrder(nowLearned ? doneList : todoList, id);
        setEmptyState(doneList, true);
        setEmptyState(todoList, false);
        updateCounts();
      } else {
        renderPanel();
      }

      if (isDeepDiveActive(id)) {
        const current = document.querySelector(".dd-learning-complete");
        if (current) {
          current.outerHTML = renderButtonHtml(id);
          bindButtons();
        }
      }
    }

    function bindButtons() {
      const button = document.querySelector("[data-learn-node]");
      if (button) button.addEventListener("click", () => toggle(button.getAttribute("data-learn-node")));
      const previousButton = document.querySelector("[data-prev-node]");
      if (previousButton) previousButton.addEventListener("click", () =>
        navigate({ name: "concept", id: previousButton.getAttribute("data-prev-node") }));
      const nextButton = document.querySelector("[data-next-node]");
      if (nextButton) nextButton.addEventListener("click", () =>
        navigate({ name: "concept", id: nextButton.getAttribute("data-next-node") }));
    }

    function init() {
      [
        "learning-done-count", "learning-total-count", "learning-percent", "learning-progress-bar",
        "learning-done-label", "learning-todo-label", "learning-done-list", "learning-todo-list",
      ].forEach(id => { elements[id] = document.getElementById(id); });
      [elements["learning-done-list"], elements["learning-todo-list"]].forEach(list => {
        if (!list) return;
        list.addEventListener("click", event => {
          const button = event.target.closest("[data-learning-goto]");
          if (button) selectNode(button.getAttribute("data-learning-goto"), true);
        });
      });
      renderPanel();
    }

    return Object.freeze({
      bindButtons,
      init,
      preloadNeighbors,
      refreshLanguage: renderPanel,
      renderButtonHtml,
    });
  };
})(window);
