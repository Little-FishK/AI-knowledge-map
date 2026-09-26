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
    // Record text is published in Chinese. When the interface is English, the
    // view reads a translated copy built from data/content-locales/en/library.js
    // (a Chinese → English string table, loaded only when first needed). Any
    // string without a translation stays in Chinese rather than disappearing.
    const ENGLISH_TABLE = "data/content-locales/en/library.js";
    let source = null;
    let viewLocale = "zh";
    const localeNow = () => /^en\b/i.test((global.document && global.document.documentElement.lang) || "") ? "en" : "zh";
    let software = global.SOFTWARE || null;
    let built = false;
    let selectedClass = "all";
    let selectedSubcategory = "all";
    let selectedTopicCategory = "all";
    let query = "";
    // The grid shows one page of cards at a time; any filter change returns to page 1.
    const PAGE_SIZE = 15;
    let page = 1;

    const bundle = [
      "data/library.js",
      "data/library-official-technical.js",
      "data/library-official-openai-importance-01.js",
      "data/library-official-openai-importance-02.js",
      "data/library-official-openai-importance-03.js",
      "data/library-official-openai-importance-04.js",
      "data/library-official-openai-importance-05.js",
      "data/library-official-anthropic-importance-01.js",
      "data/library-official-anthropic-importance-02.js",
      "data/library-official-anthropic-importance-03.js",
      "data/library-official-anthropic-importance-04.js",
      "data/library-official-google-deepmind-importance-01.js",
      "data/library-official-google-deepmind-importance-02.js",
      "data/library-official-microsoft-importance-01.js",
      "data/library-official-microsoft-importance-02.js",
      "data/library-official-microsoft-importance-03.js",
      "data/library-official-microsoft-importance-04.js",
      "data/library-official-microsoft-importance-05.js",
      "data/library-official-microsoft-importance-06.js",
      "data/library-official-microsoft-importance-07.js",
      "data/library-official-meta-ai-importance-01.js",
      "data/library-official-meta-ai-importance-02.js",
      "data/library-official-meta-ai-importance-03.js",
      "data/library-official-meta-ai-importance-04.js",
      "data/library-official-meta-ai-importance-05.js",
      "data/library-official-meta-ai-importance-06.js",
      "data/library-official-meta-ai-importance-07.js",
      "data/library-official-nvidia-importance-01.js",
      "data/library-official-nvidia-importance-02.js",
      "data/library-official-nvidia-importance-03.js",
      "data/library-official-nvidia-importance-04.js",
      "data/library-official-nvidia-importance-05.js",
      "data/library-official-nvidia-importance-06.js",
      "data/library-official-nvidia-importance-07.js",
      "data/library-official-china.js",
      "data/library-platform-profiles.js",
      "data/library-source-meta.js",
      "data/library-new-sources.js",
      "data/library-knowledge-base-core.js",
      "data/library-knowledge-base-expanded.js",
      "data/library-hackathon-kaggle.js",
      "data/library-arxiv.js",
      "data/library-neurips-proceedings.js",
      "data/library-pmlr.js",
      "data/library-openreview.js",
      "data/library-acl-anthology.js",
      "data/library-cvf-open-access.js",
      "data/library-ieee-xplore.js",
      "data/library-acm-digital-library.js",
      "data/library-springer-nature.js",
      "data/software.js",
    ];

    view.addEventListener("click", event => {
      const pageButton = event.target.closest("[data-library-page]");
      if (pageButton) {
        page = Number(pageButton.getAttribute("data-library-page")) || 1;
        renderItems();
        const toolbar = view.querySelector(".lib-toolbar");
        if (toolbar && toolbar.scrollIntoView) toolbar.scrollIntoView({ block: "start" });
        return;
      }
      const item = event.target.closest("[data-library-item]");
      if (item) {
        navigate({ name: "library-item", id: item.getAttribute("data-library-item") });
        return;
      }
      const sourceClass = event.target.closest("[data-library-class]");
      if (sourceClass) {
        selectedClass = sourceClass.getAttribute("data-library-class");
        selectedSubcategory = "all";
        page = 1;
        selectedTopicCategory = "all";
        view.querySelectorAll("[data-library-class]").forEach(button => button.classList.toggle("active", button === sourceClass));
        renderSubcategories();
        renderTopicCategories();
        renderItems();
        return;
      }
      const subcategory = event.target.closest("[data-library-subcategory]");
      if (subcategory) {
        selectedSubcategory = subcategory.getAttribute("data-library-subcategory");
        page = 1;
        selectedTopicCategory = "all";
        renderSubcategories();
        renderTopicCategories();
        renderItems();
        return;
      }
      const topic = event.target.closest("[data-library-topic]");
      if (topic) {
        selectedTopicCategory = topic.getAttribute("data-library-topic");
        page = 1;
        renderTopicCategories();
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
      page = 1;
      selectedTopicCategory = "all";
      view.querySelectorAll("[data-library-class]").forEach(button =>
        button.classList.toggle("active", button.getAttribute("data-library-class") === selectedClass));
      renderSubcategories();
      renderTopicCategories();
      renderItems();
    });

    const scheduleRender = debounce(() => renderItems(), 120);
    view.addEventListener("input", event => {
      const searchInput = event.target.closest(".lib-search");
      if (!searchInput) return;
      query = searchInput.value;
      page = 1;
      scheduleRender();
    });

    // Concept names follow the interface language, from the English graph
    // locale the app loads alongside the English interface.
    function nodeTitle(nodeId) {
      if (viewLocale === "en") {
        const nodes = global.AI_CONTENT_LOCALES && global.AI_CONTENT_LOCALES.en && global.AI_CONTENT_LOCALES.en.graph
          && global.AI_CONTENT_LOCALES.en.graph.collections && global.AI_CONTENT_LOCALES.en.graph.collections["graph.nodes"];
        const record = nodes && nodes[nodeId];
        if (record && record.fields && record.fields.title) return record.fields.title;
      }
      return byId[nodeId].title;
    }

    function translateDeep(value, table) {
      if (typeof value === "string") return Object.prototype.hasOwnProperty.call(table, value) ? table[value] : value;
      if (Array.isArray(value)) return value.map(entry => translateDeep(entry, table));
      if (value && typeof value === "object") {
        const copy = {};
        for (const key of Object.keys(value)) copy[key] = translateDeep(value[key], table);
        return copy;
      }
      return value;
    }

    // Points library, profiles and profileGuidance at the records for the
    // current interface language, loading the English table on first use.
    async function applyLocale() {
      const locale = localeNow();
      if (!source) return;
      if (locale === "en") {
        if (!global.AI_LIBRARY_LOCALES || !global.AI_LIBRARY_LOCALES.en) {
          try { await loadScriptsInOrder([ENGLISH_TABLE]); } catch (error) { console.error(error); }
        }
        const table = global.AI_LIBRARY_LOCALES && global.AI_LIBRARY_LOCALES.en && global.AI_LIBRARY_LOCALES.en.strings;
        if (table) {
          if (!source.english) source.english = {library: translateDeep(source.library, table), profiles: translateDeep(source.profiles, table), profileGuidance: translateDeep(source.profileGuidance, table)};
          ({library, profiles, profileGuidance} = source.english);
          viewLocale = "en";
          return;
        }
      }
      ({library, profiles, profileGuidance} = source);
      viewLocale = "zh";
    }

    async function ensureReady() {
      if (!built) view.innerHTML = `<div class="view-loading" role="status">${esc(t("library.loading"))}</div>`;
      await loadScriptsInOrder(bundle);
      if (!source && global.PRO_LIBRARY) source = {library: global.PRO_LIBRARY, profiles: global.LIBRARY_PLATFORM_PROFILES || {}, profileGuidance: global.LIBRARY_PROFILE_GUIDANCE || {}};
      software = global.SOFTWARE || software;
      if (localeNow() !== viewLocale || !library) {
        built = false;
        await applyLocale();
      }
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
      const overview = profile.overview || (viewLocale === "en"
        ? `${profile.positioning} ${profile.background} Operated or maintained by ${profile.organization}. Founders or initiators: ${profile.foundingTeam}`
        : `${profile.positioning}${profile.background}其运营或维护主体为${profile.organization}；关于创始或发起团队：${profile.foundingTeam}`);
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
          ${profile.tier ? `<div><dt>${esc(t("library.profile.tier"))}</dt><dd>${esc(t("library.tier." + String(profile.tier).toLowerCase()))}${profile.provenance ? ` · ${esc(t("library.provenance." + profile.provenance))}` : ""}</dd></div>` : ""}
          ${profile.originScope ? `<div><dt>${esc(t("library.profile.originScope"))}</dt><dd>${esc(t("library.scope." + profile.originScope))}</dd></div>` : ""}
          ${profile.sourceUse ? `<div><dt>${esc(t("library.profile.sourceUse"))}</dt><dd>${esc(t("library.use." + profile.sourceUse))}</dd></div>` : ""}
          ${profile.health ? `<div><dt>${esc(t("library.profile.health"))}</dt><dd>${esc(t("library.health." + profile.health))}</dd></div>` : ""}
          <div><dt>${esc(t("library.profile.background"))}</dt><dd>${esc(profile.background)}</dd></div>
          <div><dt>${esc(t("library.profile.organization"))}</dt><dd>${esc(profile.organization)}</dd></div>
          <div><dt>${esc(t("library.profile.foundingTeam"))}</dt><dd>${esc(profile.foundingTeam)}</dd></div>
        </dl>
        <div class="lib-profile-sections">
          <section><h4>${esc(t("library.profile.offers"))}</h4><ul>${offers.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
          <section><h4>${esc(t("library.profile.howToUse"))}</h4><ul>${howToUse.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
        </div>
        ${caution ? `<aside class="lib-profile-caution"><b>${esc(t("library.boundaries"))}</b><p>${esc(caution)}</p></aside>` : ""}
        <footer>${esc(t("library.profile.reviewedAt", { date: profile.reviewedAt }))}${profile.lastVerifiedAt ? ` · ${esc(t("library.profile.lastVerifiedAt", { date: profile.lastVerifiedAt }))}` : ""}</footer>
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
      (library.items || []).forEach(item => {
        const ids = new Set(sourceRecords(item).filter(record => record.sourceClass === source.id).map(record => record.sourceSubcategory));
        ids.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
      });
      container.innerHTML = `<div class="lib-subnav-head"><div><b>${source.order}. ${esc(source.label)} · ${esc(t("library.secondarySources"))}</b><span>${esc(source.short)}</span></div><em>${esc(t("common.count", { count: (source.subcategories || []).length }))}</em></div>
        <div class="lib-subchips">
          <button class="lib-subchip${selectedSubcategory === "all" ? " active" : ""}" type="button" data-library-subcategory="all">${esc(t("common.all"))} <span>${(library.items || []).filter(item => sourceRecords(item).some(record => record.sourceClass === source.id)).length}</span></button>
          ${(source.subcategories || []).map(subcategory => `<button class="lib-subchip${selectedSubcategory === subcategory.id ? " active" : ""}" type="button" data-library-subcategory="${esc(subcategory.id)}" title="${esc(subcategory.short)}">${esc(subcategory.label)} <span>${counts[subcategory.id] || 0}</span></button>`).join("")}
        </div>${platformProfileHtml(source)}`;
    }

    function sourceRecords(item) {
      return [item].concat(item.relatedMaterials || []);
    }

    function topicCategoryLabel(id) {
      return id ? t(`library.openaiTopic.${id}`) : "";
    }

    function renderTopicCategories() {
      const container = view.querySelector(".lib-topic-nav");
      if (!container || !library) return;
      const categories = (library.topicTaxonomies && library.topicTaxonomies[selectedSubcategory]) || [];
      const visible = selectedClass === "official" && categories.length > 0;
      if (!visible) {
        selectedTopicCategory = "all";
        container.hidden = true;
        container.innerHTML = "";
        return;
      }
      const source = sourceClassById("official");
      const subcategory = subcategoryById(source, selectedSubcategory) || { label:selectedSubcategory };
      const topicItems = (library.items || []).filter(item => item.sourceClass === "official" && item.sourceSubcategory === selectedSubcategory);
      const counts = {};
      topicItems.forEach(item => { counts[item.primaryCategory] = (counts[item.primaryCategory] || 0) + 1; });
      container.hidden = false;
      container.innerHTML = `<div class="lib-topic-head"><div><b>${esc(t("library.topicCategories", { source:subcategory.label }))}</b><span>${esc(t("library.topicCategories.hint"))}</span></div></div>
        <div class="lib-topic-chips" role="group" aria-label="${esc(t("library.topicCategories.aria", { source:subcategory.label }))}">
          <button class="lib-topic-chip${selectedTopicCategory === "all" ? " active" : ""}" type="button" data-library-topic="all">${esc(t("common.all"))} <span>${topicItems.length}</span></button>
          ${categories.map(category => `<button class="lib-topic-chip${selectedTopicCategory === category ? " active" : ""}" type="button" data-library-topic="${esc(category)}">${esc(topicCategoryLabel(category))} <span>${counts[category] || 0}</span></button>`).join("")}
        </div>`;
    }

    function matchesSource(record) {
      return (selectedClass === "all" || record.sourceClass === selectedClass) &&
        (selectedSubcategory === "all" || record.sourceSubcategory === selectedSubcategory);
    }

    function renderItems() {
      if (!library) return;
      const grid = view.querySelector(".lib-grid");
      const note = view.querySelector(".lib-filter-note");
      if (!grid) return;
      const normalizedQuery = query.trim().toLocaleLowerCase();
      const items = (library.items || []).filter(item => {
        if (!sourceRecords(item).some(matchesSource)) return false;
        if (selectedTopicCategory !== "all" && item.primaryCategory !== selectedTopicCategory) return false;
        if (!normalizedQuery) return true;
        const source = sourceClassById(item.sourceClass);
        const subcategory = subcategoryById(source, item.sourceSubcategory);
        return [item.title, item.publisher, item.collection, item.contentKind, item.summary, source && source.label, subcategory && subcategory.label, topicCategoryLabel(item.primaryCategory)]
          .concat(item.tags || [], (item.relatedMaterials || []).flatMap(record => [record.title, record.summary, ...(record.tags || [])])).join(" ").toLocaleLowerCase().includes(normalizedQuery);
      });
      const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
      page = Math.min(Math.max(1, page), pages);
      const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      if (note) note.textContent = pages > 1
        ? `${t("library.itemCount", { count: items.length })} · ${pagerText("library.page.status", `${page} / ${pages}`, { page, pages })}`
        : t("library.itemCount", { count: items.length });
      renderPager(pages);
      grid.innerHTML = visible.length ? visible.map(canonicalItem => {
        const item = sourceRecords(canonicalItem).find(matchesSource) || canonicalItem;
        const source = sourceClassById(item.sourceClass) || { label: item.sourceClass, color: "#7aa2d8" };
        const subcategory = subcategoryById(source, item.sourceSubcategory) || { label: item.sourceSubcategory };
        return `<article class="lib-card" data-library-item="${esc(canonicalItem.id)}" style="--source-color:${source.color}" tabindex="0">
          <div class="lib-card-top">
            <span class="lib-badge">${esc(source.label)}</span><span class="lib-subbadge">${esc(subcategory.label)}</span>
            ${item.primaryCategory ? `<span class="lib-topicbadge">${esc(topicCategoryLabel(item.primaryCategory))}</span>` : ""}
            ${item.discoveryOnly ? `<span class="lib-discovery">${esc(t("library.discoveryOnly"))}</span>` : ""}${item.regulatoryStatus ? `<span class="lib-discovery">${esc(t(`library.regulatoryStatus.${item.regulatoryStatus}`))}</span>` : ""}<span class="lib-tier">${esc(item.authorityTier)}</span>
          </div>
          <h3 class="lib-title">${esc(item.title)}</h3>
          <div class="lib-publisher">${esc(item.publisher)} · ${esc(item.contentKind)}</div>
          <p class="lib-summary">${esc(item.summary)}</p>
          <div class="lib-card-foot">${(item.tags || []).slice(0, 4).map(tag => `<span class="lib-tag">${esc(tag)}</span>`).join("")}</div>
        </article>`;
      }).join("") : `<div class="lib-empty">${esc(t("library.empty"))}</div>`;
    }

    // Numbered pager: first, last, and two pages either side of the current one.
    // A freshly deployed view can briefly meet a cached locale file; fall back
    // to a built-in label instead of showing the raw key.
    function pagerText(key, fallback, variables) {
      const text = t(key, variables);
      return text === key ? fallback : text;
    }

    function renderPager(pages) {
      const pager = view.querySelector(".lib-pager");
      if (!pager) return;
      if (pages < 2) { pager.hidden = true; pager.innerHTML = ""; return; }
      const shown = [...new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2])].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
      const button = (n, label, extra = "") => `<button type="button" class="lib-page${n === page ? " active" : ""}" data-library-page="${n}"${n === page ? ' aria-current="page"' : ""}${extra}>${label}</button>`;
      const parts = [];
      parts.push(page > 1 ? button(page - 1, esc(pagerText("library.page.prev", "‹")), ' rel="prev"') : `<button type="button" class="lib-page" disabled>${esc(pagerText("library.page.prev", "‹"))}</button>`);
      shown.forEach((n, index) => {
        if (index && n - shown[index - 1] > 1) parts.push('<span class="lib-page-gap" aria-hidden="true">…</span>');
        parts.push(button(n, String(n)));
      });
      parts.push(page < pages ? button(page + 1, esc(pagerText("library.page.next", "›")), ' rel="next"') : `<button type="button" class="lib-page" disabled>${esc(pagerText("library.page.next", "›"))}</button>`);
      pager.hidden = false;
      pager.setAttribute("aria-label", pagerText("library.page.aria", "Pages"));
      pager.innerHTML = parts.join("");
    }

    function build() {
      if (built || !library) return;
      const counts = {};
      (library.items || []).forEach(item => {
        new Set(sourceRecords(item).map(record => record.sourceClass)).forEach(id => { counts[id] = (counts[id] || 0) + 1; });
      });
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
          <div class="lib-topic-nav" hidden></div>
          <div class="lib-toolbar">
            <input class="lib-search" type="search" placeholder="${esc(t("library.search.placeholder"))}" aria-label="${esc(t("library.search.aria"))}">
            <span class="lib-filter-note"></span>
          </div>
          <div class="lib-grid"></div>
          <nav class="lib-pager" hidden></nav>
        </section>
      </div>`;
      view.querySelector(".lib-search").value = query;
      built = true;
      renderSubcategories();
      renderTopicCategories();
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
      const codedLabel = (prefix, value) => value ? t(`${prefix}.${value}`) : "";
      let html = `<div class="d-domain" style="color:${source.color}">${source.order}. ${esc(source.label)}
        <span style="color:var(--fg-faint)"> · ${esc(item.authorityTier)} · ${esc(item.contentKind)}</span></div>
        <h2 class="d-title">${esc(item.title)}</h2>
        <div class="d-summary">${esc(item.summary)}</div>
        <div class="d-sec"><h4>${esc(t("library.sourceRecord"))}</h4><dl class="lib-detail-meta">
          <dt>${esc(t("library.primarySourceClass"))}</dt><dd>${esc(source.label)}</dd><dt>${esc(t("library.secondarySourceClass"))}</dt><dd>${esc(subcategory.label)}</dd>
          ${item.primaryCategory ? `<dt>${esc(t("library.topicCategory"))}</dt><dd>${esc(topicCategoryLabel(item.primaryCategory))}</dd>` : ""}
          <dt>${esc(t("library.publisher"))}</dt><dd>${esc(item.publisher)}</dd><dt>${esc(t("library.collection"))}</dt><dd>${esc(item.collection)}</dd>
          <dt>${esc(t("library.reviewStatus"))}</dt><dd>${esc(item.reviewStatus)}</dd><dt>${esc(t("library.primarySource"))}</dt><dd>${esc(t(item.primarySource ? "common.yes" : "common.no"))}</dd>
          ${item.officialIdentifier ? `<dt>${esc(t("library.officialIdentifier"))}</dt><dd>${esc(item.officialIdentifier)}</dd>` : ""}
          ${item.regulatoryStatus ? `<dt>${esc(t("library.regulatoryStatus"))}</dt><dd>${esc(codedLabel("library.regulatoryStatus", item.regulatoryStatus))}</dd>` : ""}
          ${item.bindingForce ? `<dt>${esc(t("library.bindingForce"))}</dt><dd>${esc(codedLabel("library.bindingForce", item.bindingForce))}</dd>` : ""}
          <dt>${esc(t("library.accessedAt"))}</dt><dd>${esc(item.accessedAt)}</dd>
        </dl></div>
        ${item.selectionReason ? `<div class="d-sec"><h4>${esc(t("library.selectionReason"))}</h4><div class="d-body"><p>${esc(item.selectionReason)}</p></div></div>` : ""}
        <div class="d-sec"><h4>${esc(t("library.evidenceUse"))}</h4><div class="d-body"><p>${esc(item.evidenceUse)}</p></div></div>
        <div class="d-sec"><h4>${esc(t("library.boundaries"))}</h4><div class="d-body"><p>${(item.limitations || []).map(limit => `· ${esc(limit)}`).join("<br>")}</p></div></div>`;
      if (linkedNodes.length) html += `<div class="d-sec"><h4>${esc(t("library.linkedNodes"))}</h4>${linkedNodes.map(nodeId =>
        `<div class="rel"><span class="rel-to" data-goto="${esc(nodeId)}">${esc(nodeTitle(nodeId))}</span><span class="rel-lbl">${esc(t("library.viewOnMap"))}</span></div>`).join("")}</div>`;
      if (linkedSoftware.length) html += `<div class="d-sec"><h4>${esc(t("library.linkedSoftware"))}</h4>${linkedSoftware.map(itemSoftware =>
        `<div class="rel"><span class="rel-to" data-library-software="${esc(itemSoftware.id)}">${esc(itemSoftware.name)}</span><span class="rel-lbl">${esc(t("library.viewInSoftware"))}</span></div>`).join("")}</div>`;
      html += `<a class="lib-source-link" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(t("library.openOriginal"))} ↗</a>`;
      (item.relatedMaterials || []).forEach(record => {
        html += `<section class="d-sec"><h4>${esc(record.title)}</h4>
          <p>${esc(record.publisher)} · ${esc(record.collection)} · ${esc(record.authorityTier)} · ${esc(record.reviewStatus)}</p>
          <p>${esc(record.summary)}</p><p>${esc(record.selectionReason)}</p>
          <h4>${esc(t("library.evidenceUse"))}</h4><p>${esc(record.evidenceUse)}</p>
          <h4>${esc(t("library.boundaries"))}</h4><p>${(record.limitations || []).map(limit => esc(limit)).join("<br>")}</p>
          <a class="lib-source-link" href="${esc(record.url)}" target="_blank" rel="noopener">${esc(t("library.openOriginal"))} ↗</a></section>`;
      });
      detailBody.innerHTML = html;
      detail.classList.remove("closed");
      detailBody.scrollTop = 0;
      return true;
    }

    function refreshLanguage() {
      if (!built) return;
      built = false;
      if (localeNow() === viewLocale) { build(); return; }
      view.innerHTML = `<div class="view-loading" role="status">${esc(t("library.loading"))}</div>`;
      applyLocale().then(build, error => { console.error(error); build(); });
    }

    return Object.freeze({ ensureReady, findItem, openItem, refreshLanguage, view });
  };
})(window);
