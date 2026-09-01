"use strict";

const fs = require("fs");
const path = require("path");
const { loadDeepDivePages } = require("../../deepdive/runtime/deepdive-loader");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const {
  narrativeTemplateBlockers,
  plainText,
} = require("../../deepdive/quality/deepdive-narrative-audit");
const {
  escapeEditorialHtml,
  normalizedBlockText,
  renderEditorialMarkdown,
  responseDocumentSections,
  tableBlocks,
  tableContentOverlap,
  tableRowTexts,
  textSimilarity,
} = require("./editorial-markdown");

function createEditorialCandidateImport(options) {
  const {
    defaultRoot,
    defaultRemovedSectionTitles,
    acquireLock,
    activeRecord,
    appendEvent,
    clone,
    contentGenerationResponseEncodingError,
    editorialContentPolicyGaps,
    editorialPreservationReport,
    exactHtmlBlocks,
    expireLease,
    htmlBlockWithClass,
    isConfiguredRemovedSectionTitle,
    loadState,
    candidateRelativePath,
    editorialPublicationRelativePath,
    provisionalPublishedTargets,
    restoreTarget,
    saveState,
    sectionRecordsForPreservation,
    sha256,
    targetRecord,
    validatePage,
    withinRoot,
    writeJson,
    writePublicationTargets,
  } = options;

  function buildEditorialPageFromContentGeneration(root, record, publishedPage) {
    const generation = record.contentGeneration;
    if (!generation || generation.status !== "complete" || !generation.outputFile || !generation.outputHash) {
      throw new Error("页面没有已完成且可验证的 content-generation 输出");
    }
    const expectedRelative = `docs/deepdive-reviews/${record.id}-agent-responses.md`;
    if (generation.outputFile !== expectedRelative) throw new Error("content-generation 输出路径不符合页锁定规则");
    const sourcePath = withinRoot(root, generation.outputFile);
    if (!fs.existsSync(sourcePath)) throw new Error("content-generation 输出文件不存在");
    const markdown = fs.readFileSync(sourcePath, "utf8");
    const sourceHash = sha256(markdown);
    if (sourceHash !== generation.outputHash) throw new Error("content-generation 输出哈希与控制器记录不一致");
    const encodingError = contentGenerationResponseEncodingError(markdown);
    if (encodingError) throw new Error(`content-generation 输出拒绝导入：${encodingError}`);
    const generatedSections = responseDocumentSections(markdown);
    if (!generatedSections.length) throw new Error("content-generation 输出不包含可导入章节");
    const titles = new Set();
    generatedSections.forEach(section => {
      if (titles.has(section.title)) throw new Error(`content-generation 输出章节重复：${section.title}`);
      titles.add(section.title);
      if (isConfiguredRemovedSectionTitle(section.title)) {
        throw new Error(`content-generation 输出包含禁止章节：${section.title}`);
      }
      if (!section.markdown) throw new Error(`content-generation 输出章节为空：${section.title}`);
    });
    const originalSections = sectionRecordsForPreservation(publishedPage.html);
    const originalByTitle = new Map(originalSections.map(section => [section.title, section]));
    const renderedSections = generatedSections.map(section => {
      const original = originalByTitle.get(section.title);
      if (!original) throw new Error(`content-generation 章节无法匹配正式页：${section.title}`);
      const originalHeading = (original.html.match(/<h2\b[^>]*>[\s\S]*?<\/h2>/i)
        || original.html.match(/<h3\b[^>]*>[\s\S]*?<\/h3>/i)
        || [])[0]
        || `<h2><span class="dd-n">${section.sectionNumber}</span>${escapeEditorialHtml(section.title)}</h2>`;
      const renderedFull = renderEditorialMarkdown(section.markdown);
      const originalTables = exactHtmlBlocks(original.html, "table", "dd-table");
      const originalTableTexts = originalTables.map(normalizedBlockText).filter(Boolean);
      const originalRowSets = originalTables.map(tableRowTexts);
      let rendered = renderedFull;
      const renderedTableBlocks = tableBlocks(renderedFull);
      const renderedRowSets = renderedTableBlocks.map(tableRowTexts);
      renderedTableBlocks.forEach((block, index) => {
        const text = normalizedBlockText(block);
        if (text && originalTableTexts.some(originalText => originalText.includes(text) || text.includes(originalText))) {
          rendered = rendered.replace(block, "");
          return;
        }
        const rows = renderedRowSets[index];
        if (rows.length && originalRowSets.some(originalRows => tableContentOverlap(rows, originalRows) >= 0.8)) {
          rendered = rendered.replace(block, "");
          return;
        }
        if (text && originalTableTexts.some(originalText => textSimilarity(text, originalText) >= 0.85)) {
          rendered = rendered.replace(block, "");
        }
      });
      const renderedRowTexts = tableBlocks(rendered).map(tableRowTexts);
      const renderedTableTexts = tableBlocks(rendered).map(normalizedBlockText);
      const renderedText = plainText(rendered).replace(/\s+/g, "");
      const preservedBlocks = [
        ...exactHtmlBlocks(original.html, "figure", "dd-fig"),
        ...originalTables,
        ...exactHtmlBlocks(original.html, "div", "dd-formula"),
        ...exactHtmlBlocks(original.html, "div", "dd-src"),
      ].filter((block, index, all) => all.indexOf(block) === index)
        .filter(block => {
          if (!/^<table\b/i.test(block.trim())) return true;
          const text = normalizedBlockText(block);
          if (text && renderedText.includes(text)) return false;
          if (text && renderedTableTexts.some(renderedTableText => textSimilarity(text, renderedTableText) >= 0.85)) return false;
          const rows = tableRowTexts(block);
          return !rows.length || !renderedRowTexts.some(renderedRows => tableContentOverlap(rows, renderedRows) >= 0.8);
        });
      return `<section class="dd-sec" data-source="content-generation">${originalHeading}\n<div class="dd-agent-response">${rendered}</div>${preservedBlocks.length ? `\n${preservedBlocks.join("\n")}` : ""}\n</section>`;
    });
    const goalsBlock = htmlBlockWithClass(publishedPage.html, "dd-goals");
    const chainBlock = htmlBlockWithClass(publishedPage.html, "dd-chain");
    const sourceBlock = htmlBlockWithClass(publishedPage.html, "dd-src");
    if (!goalsBlock || !chainBlock || !sourceBlock) {
      throw new Error("正式页缺少可保留的学习目标、因果链或资料来源结构");
    }
    const candidateHtml = [goalsBlock, chainBlock, ...renderedSections, sourceBlock].join("\n");
    const allRequiredFigures = exactHtmlBlocks(publishedPage.html, "figure", "dd-fig");
    const missingFigures = allRequiredFigures.filter(block => !candidateHtml.includes(block));
    const removableTables = new Set(originalSections
      .filter(section => isConfiguredRemovedSectionTitle(section.title))
      .flatMap(section => exactHtmlBlocks(section.html, "table", "dd-table")));
    const allRequiredTables = exactHtmlBlocks(publishedPage.html, "table", "dd-table")
      .filter(block => !removableTables.has(block));
    const candidateTableTexts = exactHtmlBlocks(candidateHtml, "table", "dd-table")
      .map(normalizedBlockText);
    const missingTables = allRequiredTables.filter(block => {
      const text = normalizedBlockText(block);
      return !text || !candidateTableTexts.includes(text);
    });
    const missingPreservedBlocks = [...missingFigures, ...missingTables];
    if (missingPreservedBlocks.length) {
      renderedSections[renderedSections.length - 1] = renderedSections[renderedSections.length - 1]
        .replace(/\n<\/section>$/, `\n${missingPreservedBlocks.join("\n")}\n</section>`);
    }
    return {
      page: {
        ...clone(publishedPage),
        html: missingPreservedBlocks.length
          ? [goalsBlock, chainBlock, ...renderedSections, sourceBlock].join("\n")
          : candidateHtml,
      },
      source: {
        type: "content-generation-output",
        file: generation.outputFile,
        hash: sourceHash,
        sectionCount: generatedSections.length,
      },
    };
  }

  function importEditorialCandidate(root = defaultRoot, id, input = {}, importOptions = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      expireLease(resolvedRoot, state);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (activeRecord(state)) throw new Error("存在活动租约，不能导入人工整理候选页");
      if (!record.published || record.integration) {
        throw new Error("人工整理候选导入仅适用于已有正式理解页");
      }
      const replacingLegacyCandidate = ["audit-queued", "repair-queued"].includes(record.state)
        && input.useContentGenerationOutput === true
        && record.contentGeneration
        && record.contentGeneration.status === "complete"
        && (!record.publication || record.publication.status === "published-current");
      if (!["l3-auto-passed", "published-approved", "manual-review"].includes(record.state)
        && !replacingLegacyCandidate) {
        throw new Error(`页面 ${id} 当前状态为 ${record.state}，不能导入人工整理候选页`);
      }
      if (record.publication && ["published-provisional", "published-editorial-draft"].includes(record.publication.status)) {
        throw new Error(`页面 ${id} 已有未收尾的暂行或待审版本`);
      }
      const reason = String(input.reason || "").trim();
      if (reason.length < 3) throw new Error("候选导入原因至少需要 3 个字符");
      const publishedPage = loadDeepDivePages(resolvedRoot)[id];
      if (!publishedPage) throw new Error(`无法读取页面 ${id} 的当前正式版本`);
      const generatedCandidate = input.useContentGenerationOutput === true
        ? buildEditorialPageFromContentGeneration(resolvedRoot, record, publishedPage)
        : null;
      const page = generatedCandidate ? generatedCandidate.page : clone(input.page);
      if (page && typeof page === "object") delete page.publication;
      const pageErrors = validatePage(id, page);
      pageErrors.push(...editorialContentPolicyGaps(page));
      if (pageErrors.length) throw new Error(pageErrors.join("\n"));
      const narrativeBlockers = narrativeTemplateBlockers(page, null);
      if (narrativeBlockers.length) {
        throw new Error(`人工候选触发模板化叙事阻断：${narrativeBlockers.map(item => item.message).join("；")}`);
      }
      const removedSectionTitles = Array.isArray(input.removedSectionTitles)
        ? input.removedSectionTitles
        : defaultRemovedSectionTitles;
      let preservation = editorialPreservationReport(publishedPage, page, removedSectionTitles);
      if (generatedCandidate && !preservation.passed
        && (preservation.missingFigureCount || preservation.missingTableCount)) {
        const originalSections = sectionRecordsForPreservation(publishedPage.html);
        const allowedRemovedTables = new Set(originalSections
          .filter(section => isConfiguredRemovedSectionTitle(section.title, removedSectionTitles))
          .flatMap(section => exactHtmlBlocks(section.html, "table", "dd-table")));
        const candidateFigures = exactHtmlBlocks(page.html, "figure", "dd-fig");
        const candidateTables = exactHtmlBlocks(page.html, "table", "dd-table");
        const candidateTableTexts = candidateTables.map(normalizedBlockText);
        const missingBlocks = [
          ...exactHtmlBlocks(publishedPage.html, "figure", "dd-fig")
            .filter(block => !candidateFigures.includes(block)),
          ...exactHtmlBlocks(publishedPage.html, "table", "dd-table")
            .filter(block => {
              if (allowedRemovedTables.has(block)) return false;
              const text = normalizedBlockText(block);
              return !text || !candidateTableTexts.includes(text);
            }),
        ];
        if (missingBlocks.length) {
          page.html = String(page.html).replace(
            /\n<\/section>(?=[\s\S]*<div\b[^>]*class="[^"]*\bdd-src\b)/i,
            `\n${missingBlocks.join("\n")}\n</section>`,
          );
          preservation = editorialPreservationReport(publishedPage, page, removedSectionTitles);
        }
      }
      if (!preservation.passed) {
        throw new Error(`图表保留检查失败：缺图 ${preservation.missingFigureCount}，缺表 ${preservation.missingTableCount}，应删除但仍存在的章节 ${preservation.stillPresentRemovedSections.join("、") || "无"}`);
      }
      const now = new Date().toISOString();
      const pageHash = pageContentHash(page);
      const candidate = {
        schemaVersion: 1,
        pageId: id,
        role: "editorial-import",
        taskId: null,
        createdAt: now,
        summary: String(input.summary || "人工整理候选页").slice(0, 500),
        page,
        pageHash,
        preservation,
        source: generatedCandidate ? generatedCandidate.source : { type: "inline-page" },
      };
      const publication = {
        schemaVersion: 1,
        status: "published-editorial-draft",
        reviewStatus: "audit-pending",
        label: "待审草稿",
        candidateHash: pageHash,
        publishedAt: now,
        reason: reason.slice(0, 500),
      };
      const draftPage = { ...clone(page), publication };
      const previousRecord = {
        state: record.state,
        contentHash: record.contentHash,
        auditHash: record.auditHash,
        auditFile: record.auditFile,
        candidateFile: record.candidateFile,
        blockers: clone(record.blockers || []),
        editorialWarnings: clone(record.editorialWarnings || []),
        finalReview: clone(record.finalReview || null),
        published: Boolean(record.published),
        publication: clone(record.publication || null),
        editorialWorkflow: clone(record.editorialWorkflow || null),
        editorialReceipt: record.editorialReceipt || null,
      };
      const candidateRelative = candidateRelativePath(id);
      const candidateTarget = targetRecord(
        resolvedRoot,
        candidateRelative,
        `${JSON.stringify(candidate, null, 2)}\n`,
      );
      const publicationTargets = provisionalPublishedTargets(resolvedRoot, record, draftPage, null);
      const publisher = importOptions.publishCandidate || ((targetRoot, targetRecordValue, targets) =>
        writePublicationTargets(targetRoot, targetRecordValue, targets, importOptions));
      const publicationResult = publisher(
        resolvedRoot,
        record,
        [candidateTarget, ...publicationTargets],
      );
      const receipt = {
        schemaVersion: 1,
        status: "published-editorial-draft",
        pageId: id,
        pageHash,
        reason: reason.slice(0, 500),
        publishedAt: now,
        preservation,
        source: generatedCandidate ? generatedCandidate.source : { type: "inline-page" },
        previousRecord,
        targets: (publicationResult.targets || []).map(target => ({
          relativePath: target.relativePath,
          beforeExists: target.beforeExists,
          beforeContent: target.beforeContent,
          beforeHash: target.beforeHash,
          afterContent: target.afterContent,
          afterHash: target.afterHash,
        })),
        validators: (publicationResult.validators || []).map(result => ({
          script: result.script,
          passed: result.passed,
        })),
      };
      receipt.receiptHash = sha256(receipt);
      const receiptRelative = editorialPublicationRelativePath(id);
      const receiptPath = withinRoot(resolvedRoot, receiptRelative);
      try {
        writeJson(receiptPath, receipt);
        record.state = "audit-queued";
        record.attempt = 0;
        record.repairAttempts = 0;
        record.contentHash = pageHash;
        record.auditHash = null;
        record.auditFile = null;
        record.candidateFile = candidateRelative;
        record.blockers = [];
        record.editorialWarnings = [];
        record.finalReview = null;
        record.published = true;
        record.publication = publication;
        record.editorialWorkflow = {
          schemaVersion: 1,
          source: "human-curated-candidate",
          status: "machine-audit-pending",
          auditMode: "full",
          verificationSource: "machine",
          maxRepairAttempts: 1,
          initialBlockingFindings: [],
          requiresHumanReview: true,
          importedAt: now,
          removedSectionTitles: preservation.removedSectionTitles,
          preservation,
        };
        record.editorialReceipt = receiptRelative;
        record.provisionalReceipt = null;
        record.completionReceipt = null;
        record.updatedAt = now;
        saveState(resolvedRoot, state);
      } catch (error) {
        const targets = publicationResult.targets || [];
        [...targets].reverse().forEach(target => restoreTarget(resolvedRoot, target));
        if (fs.existsSync(receiptPath)) fs.unlinkSync(receiptPath);
        error.message += "\n已恢复人工候选导入产生的页面与私有文件。";
        throw error;
      }
      appendEvent(resolvedRoot, "editorial-candidate-imported", {
        id,
        pageHash,
        reason: reason.slice(0, 500),
        preservation,
        receiptHash: receipt.receiptHash,
      });
      return {
        status: "published-editorial-draft",
        pageId: id,
        workflowState: record.state,
        publicationState: record.publication.status,
        pageHash,
        preservation,
        receiptPath: receiptRelative,
        receiptHash: receipt.receiptHash,
      };
    } finally {
      release();
    }
  }

  return {
    buildEditorialPageFromContentGeneration,
    importEditorialCandidate,
  };
}

module.exports = { createEditorialCandidateImport };
