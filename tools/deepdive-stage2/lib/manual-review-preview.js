"use strict";

const path = require("path");
const { loadDeepDivePages: loadDeepDivePagesFromDisk } = require("../../deepdive/runtime/deepdive-loader");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");

function createManualReviewPreviewServices(dependencies) {
  const {
    defaultRoot,
    acquireLock,
    atomicWrite,
    clone,
    loadDeepDivePages = loadDeepDivePagesFromDisk,
    loadState,
    readCandidate,
    withinRoot,
  } = dependencies;

  function ensureReviewHistory(record) {
    if (!Array.isArray(record.reviewHistory)) record.reviewHistory = [];
    return record.reviewHistory;
  }

  function escapePreviewHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizePreviewHtml(value) {
    return String(value || "")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
      .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
      .replace(/\s(?:href|src)\s*=\s*"javascript:[^"]*"/gi, "")
      .replace(/\s(?:href|src)\s*=\s*'javascript:[^']*'/gi, "");
  }

  function previewSections(html) {
    return [...String(html || "").matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)]
      .map((match, index) => {
        const sectionHtml = match[0];
        const headingHtml = (sectionHtml.match(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/i) || [])[1] || "";
        const heading = headingHtml
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return { index: index + 1, heading, html: sectionHtml };
      });
  }

  function createManualReviewPreview(root = defaultRoot, id, input = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能生成复核预览`);
      if (record.state !== "manual-review") {
        throw new Error(`页面 ${id} 当前状态为 ${record.state}，只有 manual-review 可以生成复核预览`);
      }
      const candidateRecord = readCandidate(resolvedRoot, record);
      if (!candidateRecord || !candidateRecord.page) {
        throw new Error(`页面 ${id} 没有可预览的候选正文`);
      }
      const publishedPage = loadDeepDivePages(resolvedRoot)[id];
      if (!publishedPage) throw new Error(`页面 ${id} 没有正式正文可供比较`);
      const candidatePage = candidateRecord.page;
      const publishedSections = previewSections(publishedPage.html);
      const candidateSections = previewSections(candidatePage.html);
      const sectionCount = Math.max(publishedSections.length, candidateSections.length);
      const sectionDiffs = [];
      for (let index = 0; index < sectionCount; index += 1) {
        const before = publishedSections[index] || { index: index + 1, heading: "（正式页缺失）", html: "" };
        const after = candidateSections[index] || { index: index + 1, heading: "（候选页缺失）", html: "" };
        if (before.html !== after.html) {
          sectionDiffs.push({
            section: index + 1,
            beforeHeading: before.heading,
            afterHeading: after.heading,
            beforeHtml: before.html,
            afterHtml: after.html,
          });
        }
      }
      const comparedFields = ["title", "subtitle", "aliases", "meta", "thesis"];
      const changedFields = comparedFields.filter(field =>
        String(publishedPage[field] || "") !== String(candidatePage[field] || "")
      );
      const overrideRounds = Array.isArray(input.rounds) ? input.rounds.slice(0, 2) : [];
      const storedRounds = ensureReviewHistory(record).slice(0, 2).map(round => ({
        defects: (round.defects || []).map(defect => defect.message || defect.code || JSON.stringify(defect)),
        improvements: round.improvement && round.improvement.summary
          ? [round.improvement.summary]
          : [],
      }));
      const processRounds = (overrideRounds.length ? overrideRounds : storedRounds).map((round, index) => ({
        round: index + 1,
        defects: (Array.isArray(round.defects) ? round.defects : [])
          .map(item => String(item || "").trim().slice(0, 1000))
          .filter(Boolean),
        improvements: (Array.isArray(round.improvements) ? round.improvements : [])
          .map(item => String(item || "").trim().slice(0, 1000))
          .filter(Boolean),
      }));
      const finalStatus = String(
        input.finalStatus
        || record.finalReview && record.finalReview.status
        || record.state
      ).slice(0, 200);
      const listMarkup = items => items.length
        ? `<ul>${items.map(item => `<li>${escapePreviewHtml(item)}</li>`).join("")}</ul>`
        : "<span class=\"muted\">未记录</span>";
      const processRows = [0, 1].map(index => {
        const round = processRounds[index] || { defects: [], improvements: [] };
        return `<tr><th>第 ${index + 1} 轮</th><td>${listMarkup(round.defects)}</td><td>${listMarkup(round.improvements)}</td></tr>`;
      }).join("");
      const processMarkup = `<div class="table-scroll"><table class="process-table"><thead><tr><th>轮次</th><th>审查缺陷</th><th>改动内容</th></tr></thead>`
        + `<tbody>${processRows}<tr class="final-row"><th>最终状态</th><td colspan="2">${escapePreviewHtml(finalStatus)}</td></tr></tbody></table></div>`;
      const blockerMarkup = (record.blockers || []).length
        ? `<ol>${record.blockers.map(blocker => (
          `<li><code>${escapePreviewHtml(blocker.code || blocker.type || "blocker")}</code>`
          + `<div>${escapePreviewHtml(blocker.message || JSON.stringify(blocker))}</div></li>`
        )).join("")}</ol>`
        : "<p>控制器没有保存可展示的阻断项。</p>";
      const fieldMarkup = changedFields.length
        ? changedFields.map(field => (
          `<details><summary>${escapePreviewHtml(field)}</summary>`
          + `<div class="compare"><article><h4>正式页</h4><pre>${escapePreviewHtml(publishedPage[field] || "")}</pre></article>`
          + `<article><h4>最终候选</h4><pre>${escapePreviewHtml(candidatePage[field] || "")}</pre></article></div></details>`
        )).join("")
        : "<p>标题、摘要等页面字段没有变化。</p>";
      const sectionMarkup = sectionDiffs.length
        ? sectionDiffs.map(diff => (
          `<details><summary>第 ${diff.section} 节：${escapePreviewHtml(diff.beforeHeading)} → ${escapePreviewHtml(diff.afterHeading)}</summary>`
          + `<div class="compare"><article><h4>正式页</h4>${sanitizePreviewHtml(diff.beforeHtml) || "<p>缺失</p>"}</article>`
          + `<article><h4>最终候选</h4>${sanitizePreviewHtml(diff.afterHtml) || "<p>缺失</p>"}</article></div></details>`
        )).join("")
        : "<p>没有章节正文差异。</p>";
      const preview = `<!doctype html>
  <html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Stage 2 人工复核预览 · ${escapePreviewHtml(candidatePage.title || id)}</title>
  <style>
  :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b0f16;color:#e7edf6;font:15px/1.7 system-ui,"Microsoft YaHei",sans-serif}
  .warning{position:sticky;top:0;z-index:9;padding:11px 24px;background:#9a3412;color:white;font-weight:800}
  main{max-width:1180px;margin:auto;padding:32px 24px 96px}nav{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
  nav a{color:#bfdbfe;background:#172033;border:1px solid #334155;border-radius:999px;padding:7px 12px;text-decoration:none}
  .hero,.panel,.dd-sec,.dd-goals,.dd-note,.dd-src{border:1px solid #334155;background:#111827;border-radius:15px;padding:22px;margin:18px 0}
  .hero h1{font-size:36px;margin:0}.muted{color:#94a3b8}.hash{word-break:break-all;font-family:ui-monospace,monospace}
  .compare{display:grid;grid-template-columns:1fr 1fr;gap:14px}.compare article{min-width:0;border:1px solid #334155;border-radius:12px;padding:16px;background:#0f172a}
  details{border:1px solid #334155;border-radius:12px;margin:10px 0;background:#101722}summary{cursor:pointer;padding:13px 16px;font-weight:750}
  details>.compare{padding:0 14px 14px}pre{white-space:pre-wrap;word-break:break-word}.candidate{max-width:980px;margin:auto}
  .dd-sec h2{font-size:24px}.dd-n{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#2563eb;margin-right:8px}
  .dd-badge{float:right;color:#93c5fd;font-size:12px}.dd-lead{font-size:17px;color:#bfdbfe}.dd-note.key{border-color:#059669}.dd-note.warn{border-color:#d97706}
  .dd-table-wrap{overflow:auto}.dd-table{width:100%;border-collapse:collapse}.dd-table th,.dd-table td{border:1px solid #3b4758;padding:9px;text-align:left}.dd-table th{background:#1f2937}
  .table-scroll{overflow:auto}.process-table{width:100%;border-collapse:collapse}.process-table th,.process-table td{border:1px solid #3b4758;padding:12px;vertical-align:top;text-align:left}.process-table thead th{background:#1e293b}.process-table tbody th{white-space:nowrap;background:#172033}.process-table ul{margin:0;padding-left:20px}.final-row td{font-weight:800;color:#fbbf24}
  a{color:#60a5fa}code{color:#fbbf24}@media(max-width:800px){.compare{grid-template-columns:1fr}}
  </style></head><body>
  <div class="warning">未发布候选 · 仅供 Stage 2 人工复核 · 不代表正式页面</div>
  <main><header class="hero"><h1>${escapePreviewHtml(candidatePage.title || id)}</h1>
  <div>${escapePreviewHtml(candidatePage.subtitle || "")}</div>
  <p class="muted">状态：manual-review · 候选哈希</p><div class="hash">${escapePreviewHtml(pageContentHash(candidatePage))}</div></header>
  <nav><a href="#process">流程展示表</a><a href="#candidate">最终候选</a><a href="#blockers">当前阻断项</a><a href="#fields">字段差异</a><a href="#sections">章节差异</a></nav>
  <section id="process" class="panel"><h2>两轮审查与改进</h2>${processMarkup}</section>
  <section id="candidate" class="panel"><h2>最终候选页面</h2><div class="candidate"><p>${sanitizePreviewHtml(candidatePage.thesis || "")}</p>${sanitizePreviewHtml(candidatePage.html)}</div></section>
  <section id="blockers" class="panel"><h2>当前控制器阻断项（${(record.blockers || []).length}）</h2>${blockerMarkup}</section>
  <section id="fields" class="panel"><h2>字段差异</h2>${fieldMarkup}</section>
  <section id="sections" class="panel"><h2>章节差异（${sectionDiffs.length}）</h2>${sectionMarkup}</section>
  </main></body></html>`;
      const relativePath = `.stage2/previews/${id}.html`;
      atomicWrite(withinRoot(resolvedRoot, relativePath), preview);
      return {
        status: "ready",
        pageId: id,
        state: record.state,
        previewPath: relativePath,
        candidateHash: pageContentHash(candidatePage),
        publishedHash: pageContentHash(publishedPage),
        changedFields,
        changedSections: sectionDiffs.map(diff => ({
          section: diff.section,
          beforeHeading: diff.beforeHeading,
          afterHeading: diff.afterHeading,
        })),
        processRounds,
        finalStatus,
        blockers: clone(record.blockers || []),
      };
    } finally {
      release();
    }
  }

  return {
    createManualReviewPreview,
    ensureReviewHistory,
    escapePreviewHtml,
    previewSections,
    sanitizePreviewHtml,
  };
}

module.exports = { createManualReviewPreviewServices };
