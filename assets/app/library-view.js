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
      if (!built) view.innerHTML = `<div class="view-loading" role="status">正在加载专业资料库…</div>`;
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
        ? `<a class="lib-profile-link" href="${esc(profile.website)}" target="_blank" rel="noopener">访问官方网站 ↗</a>`
        : `<span class="lib-profile-no-link">集合型来源 · 无统一网址</span>`;
      return `<article class="lib-platform-profile" aria-labelledby="lib-profile-title">
        <header class="lib-profile-title">
          <div><span>${profile.kind === "collection" ? "来源集合" : "平台档案"}</span><h3 id="lib-profile-title">${esc(subcategory.label)}</h3></div>
          ${website}
        </header>
        <div class="lib-profile-intro"><span>正式介绍</span><p>${esc(overview)}</p></div>
        <section class="lib-profile-strengths"><h4>平台优势与特征</h4><div>${strengths.map(item => `<p>${esc(item)}</p>`).join("")}</div></section>
        <dl class="lib-profile-facts">
          <div><dt>发展背景</dt><dd>${esc(profile.background)}</dd></div>
          <div><dt>相关公司 / 组织</dt><dd>${esc(profile.organization)}</dd></div>
          <div><dt>创始人 / 发起团队</dt><dd>${esc(profile.foundingTeam)}</dd></div>
        </dl>
        <div class="lib-profile-sections">
          <section><h4>这个网站主要提供什么</h4><ul>${offers.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
          <section><h4>在资料库中如何使用</h4><ul>${howToUse.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
        </div>
        ${caution ? `<aside class="lib-profile-caution"><b>使用边界</b><p>${esc(caution)}</p></aside>` : ""}
        <footer>资料复核日期：${esc(profile.reviewedAt)}</footer>
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
        container.innerHTML = `<div class="lib-subnav-head"><div><b>二级来源</b><span>共 ${(library.sourceClasses || []).reduce((sum, group) => sum + (group.subcategories || []).length, 0)} 个平台与来源集合</span></div></div>
          <div class="lib-sub-overview"><span>选择一个具体平台，会同时定位到它所属的一级来源。</span>
            <select class="lib-sub-select" aria-label="选择二级来源"><option value="">浏览全部二级来源…</option>${options}</select>
          </div>`;
        return;
      }
      const counts = {};
      (library.items || []).filter(item => item.sourceClass === source.id)
        .forEach(item => { counts[item.sourceSubcategory] = (counts[item.sourceSubcategory] || 0) + 1; });
      container.innerHTML = `<div class="lib-subnav-head"><div><b>${source.order}. ${esc(source.label)} · 二级来源</b><span>${esc(source.short)}</span></div><em>${(source.subcategories || []).length} 个</em></div>
        <div class="lib-subchips">
          <button class="lib-subchip${selectedSubcategory === "all" ? " active" : ""}" type="button" data-library-subcategory="all">全部 <span>${(library.items || []).filter(item => item.sourceClass === source.id).length}</span></button>
          ${(source.subcategories || []).map(subcategory => `<button class="lib-subchip${selectedSubcategory === subcategory.id ? " active" : ""}" type="button" data-library-subcategory="${esc(subcategory.id)}" title="${esc(subcategory.short)}">${esc(subcategory.label)} <span>${counts[subcategory.id] || 0}</span></button>`).join("")}
        </div>${platformProfileHtml(source)}`;
    }

    function renderItems() {
      if (!library) return;
      const grid = view.querySelector(".lib-grid");
      const note = view.querySelector(".lib-filter-note");
      if (!grid) return;
      const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
      const items = (library.items || []).filter(item => {
        if (selectedClass !== "all" && item.sourceClass !== selectedClass) return false;
        if (selectedSubcategory !== "all" && item.sourceSubcategory !== selectedSubcategory) return false;
        if (!normalizedQuery) return true;
        const source = sourceClassById(item.sourceClass);
        const subcategory = subcategoryById(source, item.sourceSubcategory);
        return [item.title, item.publisher, item.collection, item.contentKind, item.summary, source && source.label, subcategory && subcategory.label]
          .concat(item.tags || []).join(" ").toLocaleLowerCase("zh-CN").includes(normalizedQuery);
      });
      if (note) note.textContent = `${items.length} 条资料`;
      grid.innerHTML = items.length ? items.map(item => {
        const source = sourceClassById(item.sourceClass) || { label: item.sourceClass, color: "#7aa2d8" };
        const subcategory = subcategoryById(source, item.sourceSubcategory) || { label: item.sourceSubcategory };
        return `<article class="lib-card" data-library-item="${esc(item.id)}" style="--source-color:${source.color}" tabindex="0">
          <div class="lib-card-top">
            <span class="lib-badge">${esc(source.label)}</span><span class="lib-subbadge">${esc(subcategory.label)}</span>
            ${item.discoveryOnly ? `<span class="lib-discovery">仅作发现</span>` : ""}<span class="lib-tier">${esc(item.authorityTier)}</span>
          </div>
          <h3 class="lib-title">${esc(item.title)}</h3>
          <div class="lib-publisher">${esc(item.publisher)} · ${esc(item.contentKind)}</div>
          <p class="lib-summary">${esc(item.summary)}</p>
          <div class="lib-card-foot">${(item.tags || []).slice(0, 4).map(tag => `<span class="lib-tag">${esc(tag)}</span>`).join("")}</div>
        </article>`;
      }).join("") : `<div class="lib-empty">当前来源分类和搜索条件下没有资料。</div>`;
    }

    function build() {
      if (built || !library) return;
      const counts = {};
      (library.items || []).forEach(item => { counts[item.sourceClass] = (counts[item.sourceClass] || 0) + 1; });
      view.innerHTML = `<header class="lib-head">
        <div><h2>专业资料库</h2><p>按信息来源分类，保留证据用途、适用边界和与知识地图的关联。</p></div>
        <div class="lib-count">9 类一级来源 · ${(library.sourceClasses || []).reduce((sum, source) => sum + (source.subcategories || []).length, 0)} 个二级来源 · ${(library.items || []).length} 条种子资料</div>
      </header>
      <div class="lib-layout">
        <nav class="lib-sources" aria-label="资料来源分类">
          <button class="lib-source active" type="button" data-library-class="all" style="--source-color:var(--accent)">
            <span class="lib-source-order">ALL</span><span class="lib-source-label">全部来源</span><span class="lib-source-count">${(library.items || []).length}</span>
          </button>
          ${(library.sourceClasses || []).map(source => `<button class="lib-source" type="button" data-library-class="${esc(source.id)}" style="--source-color:${source.color}">
            <span class="lib-source-order">${source.order}</span><span class="lib-source-label">${esc(source.label)}</span><span class="lib-source-count">${counts[source.id] || 0}</span>
          </button>`).join("")}
        </nav>
        <section class="lib-content">
          <div class="lib-subnav"></div>
          <div class="lib-toolbar">
            <input class="lib-search" type="search" placeholder="搜索标题、发布者、资料形式或标签" aria-label="搜索专业资料">
            <span class="lib-filter-note"></span>
          </div>
          <div class="lib-grid"></div>
        </section>
      </div>`;
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
        <div class="d-sec"><h4>来源记录</h4><dl class="lib-detail-meta">
          <dt>一级来源</dt><dd>${esc(source.label)}</dd><dt>二级来源</dt><dd>${esc(subcategory.label)}</dd>
          <dt>发布者</dt><dd>${esc(item.publisher)}</dd><dt>资料集合</dt><dd>${esc(item.collection)}</dd>
          <dt>发布状态</dt><dd>${esc(item.reviewStatus)}</dd><dt>一手来源</dt><dd>${item.primarySource ? "是" : "否"}</dd>
          <dt>访问日期</dt><dd>${esc(item.accessedAt)}</dd>
        </dl></div>
        ${item.selectionReason ? `<div class="d-sec"><h4>为什么入选</h4><div class="d-body"><p>${esc(item.selectionReason)}</p></div></div>` : ""}
        <div class="d-sec"><h4>可以支持什么</h4><div class="d-body"><p>${esc(item.evidenceUse)}</p></div></div>
        <div class="d-sec"><h4>使用边界</h4><div class="d-body"><p>${(item.limitations || []).map(limit => `· ${esc(limit)}`).join("<br>")}</p></div></div>`;
      if (linkedNodes.length) html += `<div class="d-sec"><h4>关联节点</h4>${linkedNodes.map(nodeId =>
        `<div class="rel"><span class="rel-to" data-goto="${esc(nodeId)}">${esc(byId[nodeId].title)}</span><span class="rel-lbl">在地图中查看</span></div>`).join("")}</div>`;
      if (linkedSoftware.length) html += `<div class="d-sec"><h4>关联软件</h4>${linkedSoftware.map(itemSoftware =>
        `<div class="rel"><span class="rel-to" data-library-software="${esc(itemSoftware.id)}">${esc(itemSoftware.name)}</span><span class="rel-lbl">在软件目录中查看</span></div>`).join("")}</div>`;
      html += `<a class="lib-source-link" href="${esc(item.url)}" target="_blank" rel="noopener">打开原始资料 ↗</a>`;
      detailBody.innerHTML = html;
      detail.classList.remove("closed");
      detailBody.scrollTop = 0;
      return true;
    }

    return Object.freeze({ ensureReady, findItem, openItem, view });
  };
})(window);
