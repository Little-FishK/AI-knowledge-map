/* Node detail markup and relations, kept separate from map layout and rendering. */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  app.createGraphDetail = function createGraphDetail(options) {
    const G = options.graph;
    const byId = options.byId;
    const KEY_EDGES = options.keyEdges;
    const localizedNodeResult = options.localizedNodeResult;
    const localizedDomain = options.localizedDomain;
    const localizedEdgeType = options.localizedEdgeType;
    const localizedNode = options.localizedNode;
    const DEEPDIVE_IDS = options.deepDiveIds;
    const esc = options.escapeHtml;
    const tr = options.t;
    const mdLite = options.markdown;
    const detail = options.detail;
    const detailBody = options.detailBody;
    const ensureDeepDive = options.ensureDeepDive;

    function relationsOf(id) {
      const out = [];
      G.edges.forEach(e => {
        if (!byId[e.from] || !byId[e.to]) return;
        if (e.from === id) out.push({ dir: "out", type: e.type, other: e.to, label: e.label });
        else if (e.to === id) out.push({ dir: "in", type: e.type, other: e.from, label: e.label });
      });
      // 关键关系排前面
      return out.sort((a, b) => (KEY_EDGES.indexOf(b.type) - KEY_EDGES.indexOf(a.type)));
    }

    function openDetail(id) {
      const sourceNode = byId[id];
      if (!sourceNode) return;
      const localized = localizedNodeResult(id);
      const n = localized.record;
      const dom = localizedDomain(n.domain);
      const evolving = n.maturity === "evolving";

      let h = "";
      const hasDeep = DEEPDIVE_IDS.has(id);
      h += `<div class="d-domain" style="color:${dom.color}">${dom.emoji} ${esc(dom.label)}`
         + (evolving ? `<span class="mat-tag" title="${esc(tr("map.detail.evolving.title"))}">${esc(tr("map.detail.evolving"))}</span>` : "")
         + (hasDeep ? `<button class="dd-open" data-dd="${esc(id)}" title="${esc(tr("map.detail.deepDive.open"))}">📖 ${esc(tr("map.detail.deepDive"))}</button>` : "")
         + `</div>`;
      h += `<h2 class="d-title">${esc(n.title)}</h2>`;
      if (n.aliases && n.aliases.length) h += `<div class="d-alias">${n.aliases.map(esc).join(" · ")}</div>`;
      h += `<div class="d-summary">${esc(n.summary || "")}</div>`;

      if (n.body) h += `<div class="d-sec"><h4>${esc(tr("map.detail.description"))}</h4><div class="d-body">${mdLite(n.body, { localizeLinks: !localized.fallbackUsed })}</div></div>`;

      if (n.cases && n.cases.length) {
        h += `<div class="d-sec"><h4>${esc(tr("map.detail.cases"))}</h4>`;
        n.cases.forEach(c => {
          h += `<div class="case"><div class="case-t">${esc(c.title)}</div>
                <div class="case-x">${mdLite(c.text, { localizeLinks: !localized.fallbackUsed }).replace(/^<p>|<\/p>$/g, "")}</div></div>`;
        });
        h += `</div>`;
      }

      const rels = relationsOf(id);
      h += `<div class="d-sec"><h4>${esc(tr("map.detail.related"))} <span style="color:var(--fg-faint);font-weight:400">${rels.length}</span></h4>`;
      if (!rels.length) h += `<div class="d-empty">${esc(tr("map.detail.noRelations"))}</div>`;
      rels.forEach(r => {
        const t = localizedEdgeType(r.type);
        const arrow = r.dir === "out" ? "→" : "←";
        h += `<div class="rel">
                <span class="rel-type" style="background:${t.color}">${esc(t.label)}</span>
                <span style="color:var(--fg-faint)">${arrow}</span>
                <span class="rel-to" data-goto="${esc(r.other)}">${esc(localizedNode(r.other).title)}</span>
                ${r.label ? `<span class="rel-lbl">${esc(r.label)}</span>` : ""}
              </div>`;
      });
      h += `</div>`;

      if (n.activity && n.activity.length) {
        h += `<div class="d-sec"><h4>${esc(tr("map.detail.activity"))}</h4>`;
        n.activity.forEach(a => {
          h += `<div class="act"><div class="act-d">${esc(a.date)}</div>
                <div class="act-t">${esc(a.title)}</div>
                <div class="act-x">${esc(a.text)}</div></div>`;
        });
        h += `</div>`;
      }

      if (n.sources && n.sources.length) {
        h += `<div class="d-sec"><h4>${esc(tr("map.detail.sources"))}</h4>`;
        n.sources.forEach(s => {
          h += `<div class="src">${s.ref
            ? `<a href="${esc(s.ref)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`
            : esc(s.title)}</div>`;
        });
        h += `</div>`;
      }

      detailBody.innerHTML = h;
      detail.classList.remove("collapsed");
      detail.classList.remove("closed");
      detailBody.scrollTop = 0;
      // 内联链接由 detailBody 的委托监听统一处理
      if (hasDeep) ensureDeepDive(id).catch(error => console.warn(error.message));
    }

    return openDetail;
  };
})(window);
