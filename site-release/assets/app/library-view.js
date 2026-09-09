/* AI 知识地图 — 专业资料库视图 */
(function (global) {
  "use strict";

  const app = global.AIMap = global.AIMap || {};

  app.createLibraryView = function createLibraryView(options) {
    const view = options.view;
    const detail = options.detail;
    const detailBody = options.detailBody;
    const byId = options.byId;
    const esc = options.escapeHtml;
    const debounce = options.debounce;
    const loadScriptsInOrder = options.loadScriptsInOrder;
    const navigate = options.navigate;
    const t = options.t;
    let library = global.PRO_LIBRARY || null;
    let profiles = global.LIBRARY_PLATFORM_PROFILES || {};
    let profileGuidance = global.LIBRARY_PROFILE_GUIDANCE || {};
    let software = global.SOFTWARE || null;
    let built = false;
    let selectedClass = "all";
    let selectedSubcategory = "all";
    let query = "";

    const bundle = [
      "data/library.js",
      "data/library-official-technical.js",
      "data/library-platform-profiles.js",
      "data/software.js",
    ];

    view.addEventListener("click", event => {
      const item = event.target.closest("[data-library-item]");
      if (item) {
        navigate({ name: "library-item", id: item.getAttribute("data-library-item") });
        return;
      }
      const sourceClass = event.target.closest("[data-library-class]");
      if (sourceClass) {
        selectedClass = sourceClass.getAttribute("data-library-class");
        selectedSubcategory = "all";
        view.querySelectorAll("[data-library-class]").forEach(button => button.classList.toggle("active", button === sourceClass));
        renderSubcategories();
        renderItems();
        return;
      }
      const subcategory = event.target.closest("[data-library-subcategory]");
      if (subcategory) {
        selectedSubcategory = subcategory.getAttribute("data-library-subcategory");
        renderSubcategories();
        renderItems();
      }
    });

    view.addEventListener("keydown", event => {
      const item = event.target.closest("[data-library-item]");
      if (item && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        navigate({ name: "library-item", id: item.getAttribute("data-library-item") });
      }
    });

    view.addEventListener("change", event => {
      const dropdown = event.target.closest(".lib-sub-select");
      if (!dropdown || !dropdown.value) return;
      [selectedClass, selectedSubcategory] = dropdown.value.split("::");
      view.querySelectorAll("[data-library-class]").forEach(button =>
        button.classList.toggle("active", button.getAttribute("data-library-class") === selectedClass));
      renderSubcategories();
      renderItems();
    });

    const scheduleRender = debounce(() => renderItems(), 120);
    view.addEventListener("input", event => {
      const searchInput = event.target.closest(".lib-search");
      if (!searchInput) return;
      query = searchInput.value;
      scheduleRender();
    });

    async function ensureReady() {
      if (!built) view.innerHTML = `<div class="view-loading" role="status">${esc(t("library.loading"))}</div>`;
      await loadScriptsInOrder(bundle);
      library = global.PRO_LIBRARY || library;
      profiles = global.LIBRARY_PLATFORM_PROFILES || profiles;
      profileGuidance = global.LIBRARY_PROFILE_GUIDANCE || profileGuidance;
      software = global.SOFTWARE || software;
      build();
    }

    function sourceClassById(id) {
      return library && (library.sourceClasses || []).find(item => item.id === id);
    }

    function subcategoryById(source, id) {
      return source && (source.subcategories || []).find(item => item.id === id);
    }

    function platformProfile(source, subcategory) {
      return source && subcategory && profiles[`${source.id}/${subcategory.id}`];
    }

    function platformProfileHtml(source) {
      if (!source || selectedSubcategory === "all") return "";
      const subcategory = subcategoryById(source, selectedSubcategory);
      const profile = platformProfile(source, subcategory);
      if (!subcategory || !profile) return "";
      const guidance = profileGuidance[source.id] || {};
      const overview = profile.overview || `${profile.positioning}${profile.background}其运营或维护主体为${profile.organization}；关于创始或发起团队：${profile.foundingTeam}`;
      const strengths = profile.strengths || guidance.strengths || [];
      const offers = profile.offers || guidance.offers || [];
      const howToUse = profile.howToUse || guidance.howToUse || [];
      const caution = profile.caution || guidance.caution || "";
      const website = profile.website
        ? `<a class="lib-profile-link" href="${esc(profile.website)}" target="_blank" rel="noopener">${esc(t("library.profile.website"))} ↗</a>`
        : `<span class="lib-profile-no-link">${esc(t("library.profile.noWebsite"))}</span>`;
      return `<article class="lib-platform-profile" aria-labelledby="lib-profile-title">
        <header class="lib-profile-title">
          <div><span>${esc(t(profile.kind === "collection" ? "library.profile.collection" : "library.profile.platform"))}</span><h3 id="lib-profile-title">${esc(subcategory.label)}</h3></div>
          ${website}
        </header>
        <div class="lib-profile-intro"><span>${esc(t("library.profile.introduction"))}</span><p>${esc(overview)}</p></div>
        <section class="lib-profile-strengths"><h4>${esc(t("library.profile.strengths"))}</h4><div>${strengths.map(item => `<p>${esc(item)}</p>`).join("")}</div></section>
        <dl class="lib-profile-facts">
          <div><dt>${esc(t("library.profile.background"))}</dt><dd>${esc(profile.background)}</dd></div>
          <div><dt>${esc(t("library.profile.organization"))}</dt><dd>${esc(profile.organization)}</dd></div>
          <div><dt>${esc(t("library.profile.foundingTeam"))}</dt><dd>${esc(profile.foundingTeam)}</dd></div>
        </dl>
        <div class="lib-profile-sections">
          <section><h4>${esc(t("library.profile.offers"))}</h4><ul>${offers.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
          <section><h4>${esc(t("library.profile.howToUse"))}</h4><ul>${howToUse.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
        </div>
        ${caution ? `<aside class="lib-profile-caution"><b>${esc(t("library.boundaries"))}</b><p>${esc(caution)}</p></aside>` : ""}
        <footer>${esc(t("library.profile.reviewedAt", { date: profile.reviewedAt }))}</footer>
      </article>`;
    }

    function renderSubcategories() {
      const container = view.querySelector(".lib-subnav");
      if (!container || !library) return;
      const source = sourceClassById(selectedClass);
      if (!source) {
        const options = (library.sourceClasses || []).map(group =>
          `<optgroup label="${esc(group.order + ". " + group.label)}">${(group.subcategories || []).map(subcategory =>
            `<option value="${esc(group.id + "::" + subcategory.id)}">${esc(subcategory.label)} — ${esc(subcategory.short)}</option>`).join("")}</optgroup>`).join("");
        const sourceCount = (library.sourceClasses || []).reduce((sum, group) => sum + (group.subcategories || []).length, 0);
        container.innerHTML = `<div class="lib-subnav-head"><div><b>${esc(t("library.secondarySources"))}</b><span>${esc(t("library.secondarySources.count", { count: sourceCount }))}</span></div></div>
          <div class="lib-sub-overview"><span>${esc(t("library.secondarySources.hint"))}</span>
            <select class="lib-sub-select" aria-label="${esc(t("library.secondarySources.select"))}"><option value="">${esc(t("library.secondarySources.browse"))}</option>${options}</select>
          </div>`;
        return;
      }
      const counts = {};
      (library.items || []).filter(item => item.sourceClass === source.id)
        .forEach(item => { counts[item.sourceSubcategory] = (counts[item.sourceSubcategory] || 0) + 1; });
      container.innerHTML = `<div class="lib-subnav-head"><div><b>${source.order}. ${esc(source.label)} · ${esc(t("library.secondarySources"))}</b><span>${esc(source.short)}</span></div><em>${esc(t("common.count", { count: (source.subcategories || []).length }))}</em></div>
        <div class="lib-subchips">
          <button class="lib-subchip${selectedSubcategory === "all" ? " active" : ""}" type="button" data-library-subcategory="all">${esc(t("common.all"))} <span>${(library.items || []).filter(item => item.sourceClass === source.id).length}</span></button>
          ${(source.subcategories || []).map(subcategory => `<button class="lib-subchip${selectedSubcategory === subcategory.id ? " active" : ""}" type="button" data-library-subcategory="${esc(subcategory.id)}" title="${esc(subcategory.short)}">${esc(subcategory.label)} <span>${counts[subcategory.id] || 0}</span></button>`).join("")}
        </div>${platformProfileHtml(source)}`;
    }

    function renderItems() {
      if (!library) return;
      const grid = view.querySelector(".lib-grid");
      const note = view.querySelector(".lib-filter-note");
      if (!grid) return;
      const normalizedQuery = query.trim().toLocaleLowerCase();
      const items = (library.items || []).filter(item => {
        if (selectedClass !== "all" && item.sourceClass !== selectedClass) return false;
        if (selectedSubcategory !== "all" && item.sourceSubcategory !== selectedSubcategory) return false;
        if (!normalizedQuery) return true;
        const source = sourceClassById(item.sourceClass);
        const subcategory = subcategoryById(source, item.sourceSubcategory);
        return [item.title, item.publisher, item.collection, item.contentKind, item.summary, source && source.label, subcategory && subcategory.label]
          .concat(item.tags || []).join(" ").toLocaleLowerCase().includes(normalizedQuery);
      });
      if (note) note.textContent = t("library.itemCount", { count: items.length });
      grid.innerHTML = items.length ? items.map(item => {
        const source = sourceClassById(item.sourceClass) || { label: item.sourceClass, color: "#7aa2d8" };
        const subcategory = subcategoryById(source, item.sourceSubcategory) || { label: item.sourceSubcategory };
        return `<article class="lib-card" data-library-item="${esc(item.id)}" style="--source-color:${source.color}" tabindex="0">
          <div class="lib-card-top">
            <span class="lib-badge">${esc(source.label)}</span><span class="lib-subbadge">${esc(subcategory.label)}</span>
            ${item.discoveryOnly ? `<span class="lib-discovery">${esc(t("library.discoveryOnly"))}</span>` : ""}<span class="lib-tier">${esc(item.authorityTier)}</span>
          </div>
          <h3 class="lib-title">${esc(item.title)}</h3>
          <div class="lib-publisher">${esc(item.publisher)} · ${esc(item.contentKind)}</div>
          <p class="lib-summary">${esc(item.summary)}</p>
          <div class="lib-card-foot">${(item.tags || []).slice(0, 4).map(tag => `<span class="lib-tag">${esc(tag)}</span>`).join("")}</div>
        </article>`;
      }).join("") : `<div class="lib-empty">${esc(t("library.empty"))}</div>`;
    }

    function build() {
      if (built || !library) return;
      const counts = {};
      (library.items || []).forEach(item => { counts[item.sourceClass] = (counts[item.sourceClass] || 0) + 1; });
      const secondaryCount = (library.sourceClasses || []).reduce((sum, source) => sum + (source.subcategories || []).length, 0);
      view.innerHTML = `<header class="lib-head">
        <div><h2>${esc(t("library.title"))}</h2><p>${esc(t("library.intro"))}</p></div>
        <div class="lib-count">${esc(t("library.summaryCount", { primary: (library.sourceClasses || []).length, secondary: secondaryCount, items: (library.items || []).length }))}</div>
      </header>
      <div class="lib-layout">
        <nav class="lib-sources" aria-label="${esc(t("library.sources.aria"))}">
          <button class="lib-source${selectedClass === "all" ? " active" : ""}" type="button" data-library-class="all" style="--source-color:var(--accent)">
            <span class="lib-source-order">ALL</span><span class="lib-source-label">${esc(t("library.allSources"))}</span><span class="lib-source-count">${(library.items || []).length}</span>
          </button>
          ${(library.sourceClasses || []).map(source => `<button class="lib-source${selectedClass === source.id ? " active" : ""}" type="button" data-library-class="${esc(source.id)}" style="--source-color:${source.color}">
            <span class="lib-source-order">${source.order}</span><span class="lib-source-label">${esc(source.label)}</span><span class="lib-source-count">${counts[source.id] || 0}</span>
          </button>`).join("")}
        </nav>
        <section class="lib-content">
          <div class="lib-subnav"></div>
          <div class="lib-toolbar">
            <input class="lib-search" type="search" placeholder="${esc(t("library.search.placeholder"))}" aria-label="${esc(t("library.search.aria"))}">
            <span class="lib-filter-note"></span>
          </div>
          <div class="lib-grid"></div>
        </section>
      </div>`;
      view.querySelector(".lib-search").value = query;
      built = true;
      renderSubcategories();
      renderItems();
    }

    function findItem(id) {
      return library && (library.items || []).find(item => item.id === id);
    }

    function openItem(id) {
      const item = findItem(id);
      if (!item) return false;
      const source = sourceClassById(item.sourceClass) || { label: item.sourceClass, color: "#7aa2d8" };
      const subcategory = subcategoryById(source, item.sourceSubcategory) || { label: item.sourceSubcategory };
      const linkedNodes = (item.linkedNodes || []).filter(nodeId => byId[nodeId]);
      const linkedSoftware = (item.linkedSoftware || []).map(softwareId =>
        software && (software.items || []).find(entry => entry.id === softwareId)).filter(Boolean);
      let html = `<div class="d-domain" style="color:${source.color}">${source.order}. ${esc(source.label)}
        <span style="color:var(--fg-faint)"> · ${esc(item.authorityTier)} · ${esc(item.contentKind)}</span></div>
        <h2 class="d-title">${esc(item.title)}</h2>
        <div class="d-summary">${esc(item.summary)}</div>
        <div class="d-sec"><h4>${esc(t("library.sourceRecord"))}</h4><dl class="lib-detail-meta">
          <dt>${esc(t("library.primarySourceClass"))}</dt><dd>${esc(source.label)}</dd><dt>${esc(t("library.secondarySourceClass"))}</dt><dd>${esc(subcategory.label)}</dd>
          <dt>${esc(t("library.publisher"))}</dt><dd>${esc(item.publisher)}</dd><dt>${esc(t("library.collection"))}</dt><dd>${esc(item.collection)}</dd>
          <dt>${esc(t("library.reviewStatus"))}</dt><dd>${esc(item.reviewStatus)}</dd><dt>${esc(t("library.primarySource"))}</dt><dd>${esc(t(item.primarySource ? "common.yes" : "common.no"))}</dd>
          <dt>${esc(t("library.accessedAt"))}</dt><dd>${esc(item.accessedAt)}</dd>
        </dl></div>
        ${item.selectionReason ? `<div class="d-sec"><h4>${esc(t("library.selectionReason"))}</h4><div class="d-body"><p>${esc(item.selectionReason)}</p></div></div>` : ""}
        <div class="d-sec"><h4>${esc(t("library.evidenceUse"))}</h4><div class="d-body"><p>${esc(item.evidenceUse)}</p></div></div>
        <div class="d-sec"><h4>${esc(t("library.boundaries"))}</h4><div class="d-body"><p>${(item.limitations || []).map(limit => `· ${esc(limit)}`).join("<br>")}</p></div></div>`;
      if (linkedNodes.length) html += `<div class="d-sec"><h4>${esc(t("library.linkedNodes"))}</h4>${linkedNodes.map(nodeId =>
        `<div class="rel"><span class="rel-to" data-goto="${esc(nodeId)}">${esc(byId[nodeId].title)}</span><span class="rel-lbl">${esc(t("library.viewOnMap"))}</span></div>`).join("")}</div>`;
      if (linkedSoftware.length) html += `<div class="d-sec"><h4>${esc(t("library.linkedSoftware"))}</h4>${linkedSoftware.map(itemSoftware =>
        `<div class="rel"><span class="rel-to" data-library-software="${esc(itemSoftware.id)}">${esc(itemSoftware.name)}</span><span class="rel-lbl">${esc(t("library.viewInSoftware"))}</span></div>`).join("")}</div>`;
      html += `<a class="lib-source-link" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(t("library.openOriginal"))} ↗</a>`;
      detailBody.innerHTML = html;
      detail.classList.remove("closed");
      detailBody.scrollTop = 0;
      return true;
    }

    function refreshLanguage() {
      if (!built) return;
      built = false;
      build();
    }

    return Object.freeze({ ensureReady, findItem, openItem, refreshLanguage, view });
  };
})(window);
