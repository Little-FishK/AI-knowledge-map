"use strict";
// Server-rendered directory pages for the professional library.
//
// The interactive /library/ view renders from fifty window.* data scripts, so a
// crawler that does not execute JavaScript sees an empty shell: none of the
// reviewed sources are reachable. These pages publish the same records as plain
// HTML, grouped by the taxonomy that governs admission, so every accepted source
// is readable and linkable without JavaScript.
//
// Presentation only: no record is added, removed or reworded here.
const fs = require("node:fs");
const path = require("node:path");
const {LIBRARY_DATA_FILES} = require("../shared/library-data-files");

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));

// Every secondary source gets its own page, and its records are paginated at
// this size, so no page grows into a whole data set and every page stays focused.
const PAGE_SIZE = 15;
// A secondary source with fewer records than this is listed in full on its class
// page instead of getting a page of its own: a one-record page is too thin to be
// worth indexing, and the reader loses nothing by seeing it one level up.
const MIN_OWN_PAGE = 2;
// How many record titles the class page previews for each secondary source.
const PREVIEW = 3;
// ItemList entries are capped: the HTML already carries every record, and a
// structured-data list of thousands of URLs adds weight without adding meaning.
const ITEM_LIST_LIMIT = 200;

const loaded = new Map();
const viewExtras = new WeakMap();

// The library data are ordered global scripts (library.js first, then files that
// push into window.PRO_LIBRARY), so they are executed in the declared order.
// With browserErrors, a script that throws is recorded and skipped, as a browser
// would: each <script> fails alone. Used only to mirror an already published
// release exactly; a workspace build still fails on the first broken file.
function loadLibrary(root, files = LIBRARY_DATA_FILES, {browserErrors = null} = {}) {
  const key = `${root}\n${files.join("\n")}\n${browserErrors ? "tolerant" : "strict"}`;
  if (loaded.has(key)) return loaded.get(key);
  const previous = global.window;
  global.window = {};
  try {
    for (const file of files) {
      const absolute = path.join(root, file);
      if (!fs.existsSync(absolute)) continue;
      try {
        require(absolute);
      } catch (error) {
        if (!browserErrors) throw Error(`专业资料库数据无法加载：${file}（${error.message}）`);
        browserErrors.push({file, message: error.message});
      }
    }
    const library = global.window.PRO_LIBRARY || null;
    if (!library || !Array.isArray(library.items)) return null;
    // Platform profiles load alongside the records; the interactive view shows them.
    viewExtras.set(library, {profiles: global.window.LIBRARY_PLATFORM_PROFILES || {}, profileGuidance: global.window.LIBRARY_PROFILE_GUIDANCE || {}});
    loaded.set(key, library);
    return library;
  } finally {
    global.window = previous;
  }
}

// Chrome text for each published language. Record text is translated before
// rendering (see localizeLibrary); these strings are the page furniture around it.
const TEXT = {
  zh: {
    lang: "zh-Hans", mapLang: "zh-Hans", prefix: "", section: "专业资料库",
    publisher: "出版方", collection: "所属集合", kind: "形式", tier: "权威分层", status: "审核状态",
    discovery: "证据分级：仅用于发现，不得单独支持正式结论。",
    use: "证据用途", limits: "使用边界", nodes: "关联概念", accessed: "链接复核时间",
    colon: "：", listSep: "；", joinLimits: list => list.join("；"), enumSep: "、", paren: (a, b) => `${a}（${b}）`,
    classNavAria: "一级来源", subNavAria: "同类二级来源", pagerAria: "分页", prev: "上一页", next: "下一页",
    pageOf: (n, t) => `第 ${n} / ${t} 页：`, count: n => `${n} 条`,
    classNavLabel: (s) => `${s.order}. ${s.label}（${s.short}，${s.count} 条）`,
    registryAria: "二级来源登记", registryTitle: "二级来源登记",
    registryIntro: (label, rows, used) => `${label}共登记 ${rows} 个二级来源，其中 ${used} 个已有收录条目。未收录的来源同样列出，以便区分「未收录」与「不存在」。`,
    admitted: n => `收录 ${n} 条`, policy: p => `收录机制 ${p}`, tiers: t => `权威分层 ${t}`, none: " · 暂无收录条目",
    authority: a => `本类权威分层：${a}。`, reviewPolicy: p => `收录机制：${p}`,
    hubIntro: (s, n, g, own, size, note) => `${s.label}（${s.short}）共收录 ${n} 条资料，分属 ${g} 个二级来源。${own ? `收录较多的二级来源有独立目录页，每页 ${size} 条。` : ""}${note}`,
    hubDescription: (s, n, g) => `${s.label}（${s.short}）共 ${n} 条已收录资料，分属 ${g} 个二级来源，含审核机制与权威分层。`,
    previews: "各来源代表资料", previewCount: n => `（${n} 条）`, more: " 等", subSchema: label => `${label}（二级来源）`,
    subTitle: (s, sub, suffix) => `${s.label}：${sub.label}${suffix}`, pageSuffix: n => `（第 ${n} 页）`, pageCrumb: n => `第 ${n} 页`,
    subIntro: (s, sub, n, total) => `${s.label} · ${sub.label}。${sub.short ? `${sub.short}。` : ""}本来源共收录 ${n} 条已通过本类收录机制的资料${total > 1 ? `，分 ${total} 页列出` : ""}，均可直接跳转到原始来源。`,
    subIntroLater: (s, sub, n, first, last) => `${s.label} · ${sub.label}：共 ${n} 条，本页为第 ${first}–${last} 条。`,
    subDescription: (s, sub, n) => `${sub.label}（${sub.short || s.short}）共 ${n} 条已收录资料，含来源、证据用途与使用边界。`,
    subDescriptionLater: (s, sub, n, first, last) => `${s.label} · ${sub.label}已收录资料第 ${first}–${last} 条（共 ${n} 条），含来源、证据用途与使用边界。`,
    unclassified: "未分类来源",
  },
  en: {
    lang: "en", mapLang: "en", prefix: "en/", section: "Professional Library",
    publisher: "Publisher", collection: "Collection", kind: "Format", tier: "Authority tier", status: "Review status",
    discovery: "Evidence grade: for discovery only; must not by itself support a formal conclusion.",
    use: "Evidence use", limits: "Limitations", nodes: "Related concepts", accessed: "Link last checked",
    colon: ": ", listSep: "; ", joinLimits: list => list.map(text => text.replace(/[.;]\s*$/, "")).join(". ") + ".", enumSep: ", ", paren: (a, b) => `${a} (${b})`,
    classNavAria: "Source categories", subNavAria: "Other sources in this category", pagerAria: "Pages", prev: "Previous", next: "Next",
    pageOf: (n, t) => `Page ${n} of ${t}: `, count: n => `${n} ${n === 1 ? "entry" : "entries"}`,
    classNavLabel: (s) => `${s.order}. ${s.label} (${s.short}, ${s.count} ${s.count === 1 ? "entry" : "entries"})`,
    registryAria: "Registered sources", registryTitle: "Registered sources",
    registryIntro: (label, rows, used) => `${label} has ${rows} registered sources, ${used} of which have admitted entries. Sources with no entries yet are listed too, so that "not yet admitted" is not mistaken for "does not exist".`,
    admitted: n => `${n} ${n === 1 ? "entry" : "entries"} admitted`, policy: p => `review policy ${p}`, tiers: t => `authority tier ${t}`, none: " · no entries admitted yet",
    authority: a => `Authority tiers in this category: ${a}. `, reviewPolicy: p => `Admission policy: ${p}`,
    hubIntro: (s, n, g, own, size, note) => `${s.label} (${s.short}) holds ${n} ${n === 1 ? "entry" : "entries"} from ${g} ${g === 1 ? "source" : "sources"}. ${own ? `Larger sources have their own directory pages, ${size} entries per page. ` : ""}${note}`,
    hubDescription: (s, n, g) => `${s.label} (${s.short}): ${n} admitted ${n === 1 ? "entry" : "entries"} from ${g} ${g === 1 ? "source" : "sources"}, with review policies and authority tiers.`,
    previews: "Highlights by source", previewCount: n => ` (${n} ${n === 1 ? "entry" : "entries"})`, more: " and more", subSchema: label => `${label} (sources)`,
    subTitle: (s, sub, suffix) => `${s.label}: ${sub.label}${suffix}`, pageSuffix: n => ` (page ${n})`, pageCrumb: n => `Page ${n}`,
    subIntro: (s, sub, n, total) => `${s.label} · ${sub.label}. ${sub.short ? `${sub.short}. ` : ""}This source has ${n} ${n === 1 ? "entry" : "entries"} admitted under this category's review policy${total > 1 ? `, listed across ${total} pages` : ""}; each links directly to the original.`,
    subIntroLater: (s, sub, n, first, last) => `${s.label} · ${sub.label}: ${n} entries in total; this page lists entries ${first}–${last}.`,
    subDescription: (s, sub, n) => `${sub.label} (${sub.short || s.short}): ${n} admitted ${n === 1 ? "entry" : "entries"} with sources, evidence use and limitations.`,
    subDescriptionLater: (s, sub, n, first, last) => `${s.label} · ${sub.label}: admitted entries ${first}–${last} of ${n}, with sources, evidence use and limitations.`,
    unclassified: "Unclassified source",
  },
};

const hasHan = value => /[一-鿿]/.test(String(value ?? ""));
// Text written in English on a Chinese page is marked, so readers and search
// engines do not treat it as Chinese.
const inLatin = value => value && !hasHan(value) && /[A-Za-z]/.test(value);

// Returns a copy of the library whose visible text is in English. Any Chinese
// string without a translation is reported, never published half-translated.
// Personal names written in CJK scripts are kept as written.
function localizeLibrary(library, translations) {
  const missing = new Set();
  const tr = value => {
    if (typeof value !== "string" || !hasHan(value)) return value;
    if (Object.prototype.hasOwnProperty.call(translations, value)) return translations[value];
    missing.add(value);
    return value;
  };
  const items = library.items.map(item => ({
    ...item,
    title: tr(item.title), summary: tr(item.summary), evidenceUse: tr(item.evidenceUse),
    publisher: tr(item.publisher), collection: tr(item.collection), contentKind: tr(item.contentKind),
    reviewStatus: tr(item.reviewStatus), limitations: (item.limitations || []).map(tr),
  }));
  const sourceClasses = (library.sourceClasses || []).map(source => ({
    ...source, label: tr(source.label), short: tr(source.short), authority: tr(source.authority), reviewPolicy: tr(source.reviewPolicy),
    subcategories: (source.subcategories || []).map(sub => ({...sub, label: tr(sub.label), short: tr(sub.short)})),
  }));
  return {library: {...library, items, sourceClasses}, missing: [...missing]};
}

function conceptLink(id, {base, published, T}) {
  const locale = T.prefix ? "en" : "zh";
  return published.has(id) ? `${base}${locale}/concepts/${id}/` : `${base}?lang=${T.mapLang}&amp;node=${encodeURIComponent(id)}`;
}

function itemCard(item, context) {
  const {base, published, nodeIds, dropped, T, conceptTitles} = context;
  // Ghost ids must never become dead links; the graph is the only authority on
  // which concepts exist.
  const nodes = (item.linkedNodes || []).filter(id => {
    if (nodeIds.has(id)) return true;
    dropped.set(id, (dropped.get(id) || 0) + 1);
    return false;
  });
  const limits = (item.limitations || []).filter(Boolean);
  const field = (label, value) => value ? `${label}${T.colon}${esc(value)}` : "";
  const trail = [
    field(T.publisher, item.publisher), field(T.collection, item.collection), field(T.kind, item.contentKind),
    field(T.tier, item.authorityTier), field(T.status, item.reviewStatus),
  ].filter(Boolean).join(" · ");
  const latin = value => !T.prefix && inLatin(value) ? ' lang="en"' : "";
  return [
    `<li class="rd-item" id="item-${esc(item.id)}">`,
    `<h3${latin(item.title)}><a href="${esc(item.url)}" rel="noopener noreferrer">${esc(item.title)}</a></h3>`,
    `<p class="rd-meta">${trail}</p>`,
    item.discoveryOnly ? `<p class="rd-badge">${T.discovery}</p>` : "",
    item.summary ? `<p class="rd-summary"${latin(item.summary)}>${esc(item.summary)}</p>` : "",
    item.evidenceUse ? `<p class="rd-use"><b>${T.use}${T.colon}</b>${esc(item.evidenceUse)}</p>` : "",
    limits.length ? `<p class="rd-limit"><b>${T.limits}${T.colon}</b>${esc(T.joinLimits(limits))}</p>` : "",
    nodes.length ? `<p class="rd-nodes"><b>${T.nodes}${T.colon}</b>${nodes.map(id => `<a href="${conceptLink(id, {base, published, T})}">${esc((conceptTitles && conceptTitles.get(id)) || id)}</a>`).join(" · ")}</p>` : "",
    item.accessedAt ? `<p class="rd-access">${T.accessed}${T.colon}${esc(item.accessedAt)}</p>` : "",
    "</li>",
  ].filter(Boolean).join("");
}

function list(items, context) {
  return `<ul class="rd-list">${items.map(item => itemCard(item, context)).join("")}</ul>`;
}

function classNav(classes, currentId, base, T) {
  return `<nav class="rd-classnav" aria-label="${T.classNavAria}"><ul>${classes.map(source => {
    const label = esc(T.classNavLabel(source));
    return `<li>${source.id === currentId ? `<span aria-current="page">${label}</span>` : `<a href="${base}${T.prefix}library/${esc(source.id)}/">${label}</a>`}</li>`;
  }).join("")}</ul></nav>`;
}

// Sibling secondary sources of one class, so a reader can switch source without
// going back to the class page.
function siblingNav(groups, currentId, base, classPath, T) {
  if (groups.length < 2) return "";
  return `<nav class="rd-subnav" aria-label="${T.subNavAria}"><ul>${groups.map(({sub, items}) => {
    const label = esc(T.paren(sub.label, T.count(items.length)));
    return `<li>${sub.id === currentId ? `<span aria-current="page">${label}</span>` : `<a href="${base}${classPath}${esc(sub.id)}/">${label}</a>`}</li>`;
  }).join("")}</ul></nav>`;
}

// Page 1 lives at the secondary source's own URL; later pages at page/N/.
const pagePath = (subPath, number) => number === 1 ? subPath : `${subPath}page/${number}/`;

function pager(subPath, number, total, base, T) {
  if (total < 2) return "";
  const href = n => `${base}${pagePath(subPath, n)}`;
  const links = [];
  if (number > 1) links.push(`<a rel="prev" href="${href(number - 1)}">${T.prev}</a>`);
  for (let n = 1; n <= total; n++) links.push(n === number ? `<span aria-current="page">${n}</span>` : `<a href="${href(n)}">${n}</a>`);
  if (number < total) links.push(`<a rel="next" href="${href(number + 1)}">${T.next}</a>`);
  return `<nav class="rd-pager" aria-label="${T.pagerAria}">${T.pageOf(number, total)}${links.join(" ")}</nav>`;
}

// The registry lists every declared secondary source, including those with no
// accepted record yet: a class that admits one source must not look as if the
// other declared sources do not exist. Each row carries the review mechanism and
// authority tiers actually present, read from the records themselves.
function sourceRegistry(sourceClass, items, hrefFor, T) {
  const declared = sourceClass.subcategories || [];
  const declaredIds = new Set(declared.map(sub => sub.id));
  const undeclared = [...new Set(items.map(item => item.sourceSubcategory))].filter(id => !declaredIds.has(id)).map(id => ({id, label: id, short: ""}));
  const rows = [...declared, ...undeclared];
  if (!rows.length) return "";
  const used = rows.filter(sub => items.some(item => item.sourceSubcategory === sub.id)).length;
  return [
    `<nav class="rd-sources" aria-label="${T.registryAria}"><h2>${T.registryTitle}</h2>`,
    `<p>${esc(T.registryIntro(sourceClass.label, rows.length, used))}</p>`,
    `<ul>${rows.map(sub => {
      const group = items.filter(item => item.sourceSubcategory === sub.id);
      const policies = [...new Set(group.map(item => item.reviewPolicy).filter(Boolean))];
      const tiers = [...new Set(group.map(item => item.authorityTier).filter(Boolean))];
      const detail = [T.admitted(group.length), policies.length ? T.policy(policies.join(T.enumSep)) : "", tiers.length ? T.tiers(tiers.join(T.enumSep)) : ""].filter(Boolean).map(esc).join(" · ");
      const name = esc(sub.short ? T.paren(sub.label, sub.short) : sub.label);
      return `<li>${group.length ? `<a href="${hrefFor(sub)}">${name}</a>` : name} — ${detail}${group.length ? "" : T.none}</li>`;
    }).join("")}</ul></nav>`,
  ].join("");
}

function authorityNote(sourceClass, T) {
  const parts = [];
  if (sourceClass.authority) parts.push(T.authority(sourceClass.authority));
  if (sourceClass.reviewPolicy) parts.push(T.reviewPolicy(sourceClass.reviewPolicy));
  return parts.join("");
}

function itemListSchema(spec) {
  const offset = spec.offset || 0;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: spec.name,
    url: spec.url,
    numberOfItems: spec.elements.length,
    itemListElement: spec.elements.slice(0, ITEM_LIST_LIMIT).map((entry, index) => ({"@type": "ListItem", position: offset + index + 1, name: entry.name, url: entry.url})),
  };
}

// Groups a class's records by secondary source: declared sources first, in
// taxonomy order, then any source the records name but the taxonomy does not.
function groupsFor(sourceClass, items) {
  const declared = sourceClass.subcategories || [];
  const declaredIds = new Set(declared.map(sub => sub.id));
  const groups = declared.map(sub => ({sub, items: items.filter(item => item.sourceSubcategory === sub.id)})).filter(group => group.items.length);
  for (const id of new Set(items.map(item => item.sourceSubcategory))) {
    if (!declaredIds.has(id)) groups.push({sub: {id, label: id || "—", short: ""}, items: items.filter(item => item.sourceSubcategory === id)});
  }
  return groups;
}

// Returns presentation for every generated page. The caller owns metadata,
// canonical URLs, sitemap registration and file writing.
//
// Layout: /library/<class>/ is a hub over its secondary sources;
// /library/<class>/<source>/ is page 1 of that source's records and
// /library/<class>/<source>/page/<n>/ the following pages, pageSize records each.
// With locale "en" the same tree is published under /en/library/ from a
// translated copy of the records; `translations` maps Chinese text to English
// and every page carries `pairPath`, the path of its counterpart in the other
// language, so the caller can register hreflang alternates.
// dataFiles defaults to the workspace list; an already published release passes
// the files its own library view loads.
// A source with fewer than minOwnPage records is listed in full on the class hub.
// Pages after the first carry listed:false, so text directories link each
// source once while the sitemap still registers every page.
function libraryPages(root, {siteUrl, base, nodes = [], publishedConcepts = [], pageSize = PAGE_SIZE, minOwnPage = MIN_OWN_PAGE, preview = PREVIEW, dataFiles = LIBRARY_DATA_FILES, browserErrors = null, locale = "zh", translations = null, conceptTitles = null} = {}) {
  const loadedLibrary = loadLibrary(root, dataFiles, {browserErrors});
  if (!loadedLibrary || !loadedLibrary.items.length) return {pages: [], items: 0, dropped: new Map(), classes: []};
  if (!(Number.isInteger(pageSize) && pageSize > 0)) throw Error(`专业资料库分页大小无效：${pageSize}`);
  const T = TEXT[locale];
  if (!T) throw Error(`Unsupported library locale: ${locale}`);
  let library = loadedLibrary;
  if (locale === "en") {
    if (!translations) throw Error("English library pages need a translation table");
    const localized = localizeLibrary(loadedLibrary, translations);
    if (localized.missing.length) throw Error(`English library translation missing for ${localized.missing.length} strings, e.g. ${localized.missing.slice(0, 3).join(" | ")}`);
    library = localized.library;
  }
  const nodeIds = new Set(nodes.map(node => node.id));
  const published = new Set(publishedConcepts);
  const dropped = new Map();
  const context = {base, published, nodeIds, dropped, T, conceptTitles};

  const byClass = new Map();
  for (const item of library.items) {
    if (!byClass.has(item.sourceClass)) byClass.set(item.sourceClass, []);
    byClass.get(item.sourceClass).push(item);
  }
  const classes = (library.sourceClasses || [])
    .filter(source => (byClass.get(source.id) || []).length)
    .map(source => ({...source, count: byClass.get(source.id).length}));
  // Records whose class is absent from the taxonomy still need a home.
  for (const [id, items] of byClass) {
    if (!classes.some(source => source.id === id)) classes.push({id, order: classes.length + 1, label: id, short: T.unclassified, count: items.length});
  }
  classes.sort((a, b) => (a.order || 0) - (b.order || 0));

  const pages = [];
  const section = {name: T.section, path: `${T.prefix}library/`};
  const absolute = relative => new URL(relative, siteUrl).href;
  const elementsOf = items => items.map(item => ({name: item.title, url: item.url}));
  const pairOf = relative => locale === "en" ? relative.slice(T.prefix.length) : `en/${relative}`;

  for (const source of classes) {
    const items = byClass.get(source.id);
    const classPath = `${T.prefix}library/${source.id}/`;
    const classUrl = absolute(classPath);
    const groups = groupsFor(source, items);
    const own = groups.filter(group => group.items.length >= minOwnPage);
    const inline = groups.filter(group => group.items.length < minOwnPage);
    const ownIds = new Set(own.map(group => group.sub.id));
    const subHref = sub => ownIds.has(sub.id) ? `${base}${classPath}${esc(sub.id)}/` : `#sub-${esc(sub.id)}`;

    // Class hub: what the class is, how it is reviewed, and where each source lives.
    // Each source with its own page gets a short preview of its records; sources
    // too small for a page of their own are listed here in full.
    pages.push({
      path: classPath,
      pairPath: pairOf(classPath),
      locale: T.lang,
      title: source.label,
      navLabel: T.paren(source.label, T.count(items.length)),
      description: T.hubDescription(source, items.length, groups.length),
      section,
      breadcrumbs: [{name: source.label, url: classUrl}],
      body: [
        `<p class="rd-intro">${esc(T.hubIntro(source, items.length, groups.length, own.length, pageSize, authorityNote(source, T)))}</p>`,
        sourceRegistry(source, items, subHref, T),
        own.length ? `<section class="rd-previews"><h2>${T.previews}</h2><ul>${own.map(({sub, items: records}) => `<li><a href="${subHref(sub)}">${esc(sub.label)}</a>${esc(T.previewCount(records.length))}${T.colon}${records.slice(0, preview).map(item => esc(item.title)).join(T.listSep)}${records.length > preview ? T.more : ""}</li>`).join("")}</ul></section>` : "",
        inline.map(group => `<section id="sub-${esc(group.sub.id)}"><h2>${esc(group.sub.label)}</h2>${group.sub.short ? `<p class="rd-subnote">${esc(T.paren(group.sub.short, T.count(group.items.length)))}</p>` : ""}${list(group.items, context)}</section>`).join(""),
        classNav(classes, source.id, base, T),
      ].join(""),
      extraSchemas: [itemListSchema({name: T.subSchema(source.label), url: classUrl, elements: groups.map(group => ({name: group.sub.label, url: ownIds.has(group.sub.id) ? absolute(`${classPath}${group.sub.id}/`) : `${classUrl}#sub-${group.sub.id}`}))})],
    });

    // Secondary sources: one URL each, paginated.
    for (const {sub, items: records} of own) {
      const subPath = `${classPath}${sub.id}/`;
      const total = Math.ceil(records.length / pageSize);
      for (let number = 1; number <= total; number++) {
        const path = pagePath(subPath, number);
        const url = absolute(path);
        const slice = records.slice((number - 1) * pageSize, number * pageSize);
        const first = (number - 1) * pageSize + 1, last = first + slice.length - 1;
        const suffix = total > 1 ? T.pageSuffix(number) : "";
        const intro = number === 1
          ? `<p class="rd-intro">${esc(T.subIntro(source, sub, records.length, total))}</p><p class="rd-note">${esc(authorityNote(source, T))}</p>`
          : `<p class="rd-intro">${esc(T.subIntroLater(source, sub, records.length, first, last))}</p>`;
        pages.push({
          path,
          pairPath: pairOf(path),
          locale: T.lang,
          title: T.subTitle(source, sub, suffix),
          navLabel: T.paren(sub.label, T.count(records.length)),
          listed: number === 1,
          description: number === 1 ? T.subDescription(source, sub, records.length) : T.subDescriptionLater(source, sub, records.length, first, last),
          section,
          breadcrumbs: [{name: source.label, url: classUrl}, {name: sub.label, url: absolute(subPath)}, ...(number > 1 ? [{name: T.pageCrumb(number), url}] : [])],
          body: [
            intro,
            pager(subPath, number, total, base, T),
            list(slice, context),
            pager(subPath, number, total, base, T),
            siblingNav(own, sub.id, base, classPath, T),
            classNav(classes, source.id, base, T),
          ].join(""),
          extraSchemas: [itemListSchema({name: `${sub.label}${suffix}`, url, elements: elementsOf(slice), offset: first - 1})],
        });
      }
    }
  }
  return {pages, items: library.items.length, dropped, classes, library};
}

// Every Chinese string the interactive library view can show: record fields
// (including related materials), the source taxonomy and platform profiles.
// Returns those without an English translation, so a build can refuse to ship
// an English view that would fall back to Chinese.
function untranslatedViewStrings(library, translations) {
  const missing = new Set();
  const walk = value => {
    if (typeof value === "string") { if (hasHan(value) && !Object.prototype.hasOwnProperty.call(translations, value)) missing.add(value); return; }
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  const viewFields = ["title", "summary", "publisher", "contentKind", "collection", "reviewStatus", "limitations", "evidenceUse", "selectionReason", "tags", "officialIdentifier", "bindingForce"];
  for (const item of library.items) for (const record of [item, ...(item.relatedMaterials || [])]) for (const field of viewFields) walk(record[field]);
  for (const source of library.sourceClasses || []) {
    walk([source.label, source.short, source.authority, source.reviewPolicy]);
    for (const sub of source.subcategories || []) walk([sub.label, sub.short]);
  }
  const extras = viewExtras.get(library);
  if (extras) { walk(extras.profiles); walk(extras.profileGuidance); }
  return [...missing];
}

// The runtime form of the translation table, loaded by the interactive view
// only when the interface is English.
function englishLibraryScript(translations) {
  const strings = Object.fromEntries(Object.keys(translations).sort().map(key => [key, translations[key]]));
  return "/* Generated from data/content-locales/en/library.json: Chinese → English text for the professional library view. */\n"
    + "window.AI_LIBRARY_LOCALES = window.AI_LIBRARY_LOCALES || {};\n"
    + "window.AI_LIBRARY_LOCALES.en = Object.freeze({schemaVersion: 1, locale: \"en\", strings: Object.freeze(" + JSON.stringify(strings) + ")});\n";
}

// Section index for the English tree. The Chinese /library/ is the interactive
// view, so this page has no language pair of its own.
function englishLibraryIndex(english, {base}) {
  const hubs = english.pages.filter(page => page.path.split("/").length === 4);
  const body = [
    `<p class="rd-intro">A reviewed directory of AI sources: official technical documentation, academic papers, standards and regulation, evaluation organizations, hackathon projects and more. Every entry records who published it, how it was admitted, what it can serve as evidence for and where its limits are, and links straight to the original source.</p>`,
    `<p class="rd-note">${english.items} entries in ${hubs.length} source categories. Each category page lists its registered sources; larger sources have their own pages of ${PAGE_SIZE} entries each. The same directory is available in Chinese, and the interactive library view lets you filter and search it.</p>`,
    `<nav class="rd-classnav" aria-label="Source categories"><ul>${hubs.map(page => `<li><a href="${base}${page.path}">${esc(page.navLabel)}</a> — ${esc(page.description)}</li>`).join("")}</ul></nav>`,
    `<p class="rd-lang"><a href="${base}library/" hreflang="zh-Hans" lang="zh-Hans">专业资料库（中文，交互视图）</a></p>`,
  ].join("");
  return {path: "en/library/", pairPath: null, locale: "en", title: "Professional Library", navLabel: "Professional Library (English)", description: `A reviewed directory of ${english.items} AI sources in ${hubs.length} categories, from official documentation and papers to standards, evaluations and hackathon projects.`, section: null, breadcrumbs: [], body, extraSchemas: []};
}

// The link placed above a directory page's body that leads to its counterpart.
function languageLink(page, base) {
  if (!page.pairPath) return "";
  return page.locale === "en"
    ? `<p class="rd-lang"><a href="${base}${page.pairPath}" hreflang="zh-Hans" lang="zh-Hans">中文版</a></p>`
    : `<p class="rd-lang"><a href="${base}${page.pairPath}" hreflang="en" lang="en">English version</a></p>`;
}

module.exports = {libraryPages, loadLibrary, localizeLibrary, untranslatedViewStrings, englishLibraryScript, englishLibraryIndex, languageLink, itemListSchema, esc, ITEM_LIST_LIMIT, PAGE_SIZE, MIN_OWN_PAGE, TEXT};
