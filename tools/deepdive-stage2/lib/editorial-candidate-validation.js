"use strict";

const { plainText } = require("../../deepdive/quality/deepdive-narrative-audit");
const { normalizedBlockText } = require("./editorial-markdown");

function createEditorialCandidateValidation(options) {
  const { isConfiguredRemovedSectionTitle, sha256 } = options;

  function validatePage(id, page) {
    const errors = [];
    if (!page || typeof page !== "object" || Array.isArray(page)) return ["result.page 必须是对象"];
    ["title", "subtitle", "thesis", "html"].forEach(key => {
      if (!String(page[key] || "").trim()) errors.push(`result.page.${key} 缺失`);
    });
    if (!/<section\b/i.test(String(page.html || ""))) errors.push("result.page.html 缺少教学章节");
    if (page.id && page.id !== id) errors.push("result.page.id 与任务页面不一致");
    return errors;
  }

  function exactHtmlBlocks(html, tag, className) {
    const pattern = new RegExp(`<${tag}\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
    return String(html || "").match(pattern) || [];
  }

  function htmlBlockWithClass(html, className) {
    const source = String(html || "");
    const classPattern = new RegExp(`class="[^"]*\\b${className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[^"]*"`, "i");
    const classMatch = classPattern.exec(source);
    if (!classMatch) return "";
    const openAt = source.lastIndexOf("<", classMatch.index);
    const tag = (source.slice(openAt).match(/^<([\w-]+)/) || [])[1];
    if (!tag) return "";
    const tokenPattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
    tokenPattern.lastIndex = openAt;
    let depth = 0;
    let token;
    while ((token = tokenPattern.exec(source))) {
      if (token[0].startsWith("</")) depth -= 1;
      else if (!token[0].endsWith("/>")) depth += 1;
      if (depth === 0) return source.slice(openAt, tokenPattern.lastIndex);
    }
    return "";
  }

  function sectionRecordsForPreservation(html) {
    return (String(html || "").match(/<section\b[\s\S]*?<\/section>/gi) || []).map(sectionHtml => {
      const heading = (sectionHtml.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)
        || sectionHtml.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)
        || [])[1] || "";
      const headingWithoutMetadata = heading.replace(/<span\b[\s\S]*?<\/span>/gi, " ");
      return {
        html: sectionHtml,
        title: plainText(headingWithoutMetadata).replace(/^\d+(?:\.\d+)*\s+/, "").trim(),
      };
    });
  }

  function editorialPreservationReport(originalPage, candidatePage, removedSectionTitles = []) {
    const allowedRemoved = new Set((removedSectionTitles || []).map(title => String(title).trim()).filter(Boolean));
    const originalHtml = String(originalPage && originalPage.html || "");
    const candidateHtml = String(candidatePage && candidatePage.html || "");
    const originalSections = sectionRecordsForPreservation(originalHtml);
    const removedSections = originalSections.filter(section => (
      isConfiguredRemovedSectionTitle(section.title, [...allowedRemoved])
    ));
    const allowedRemovedTables = new Set(removedSections.flatMap(section => exactHtmlBlocks(section.html, "table", "dd-table")));
    const requiredFigures = exactHtmlBlocks(originalHtml, "figure", "dd-fig");
    const requiredTables = exactHtmlBlocks(originalHtml, "table", "dd-table")
      .filter(table => !allowedRemovedTables.has(table));
    const candidateFigures = exactHtmlBlocks(candidateHtml, "figure", "dd-fig");
    const candidateTables = exactHtmlBlocks(candidateHtml, "table", "dd-table");
    const candidateTableTexts = candidateTables.map(normalizedBlockText);
    const missingFigures = requiredFigures.filter(block => !candidateFigures.includes(block));
    const missingTables = requiredTables.filter(block => {
      const text = normalizedBlockText(block);
      return !text || !candidateTableTexts.includes(text);
    });
    const stillPresentRemovedSections = sectionRecordsForPreservation(candidateHtml)
      .filter(section => isConfiguredRemovedSectionTitle(section.title, [...allowedRemoved]))
      .map(section => section.title);
    return {
      passed: missingFigures.length === 0 && missingTables.length === 0 && stillPresentRemovedSections.length === 0,
      originalFigures: requiredFigures.length,
      candidateFigures: candidateFigures.length,
      originalRetainedTables: requiredTables.length,
      allowedRemovedTables: allowedRemovedTables.size,
      candidateTables: candidateTables.length,
      missingFigureCount: missingFigures.length,
      missingTableCount: missingTables.length,
      removedSectionTitles: [...allowedRemoved],
      stillPresentRemovedSections,
    };
  }

  function editorialContentPolicyGaps(page) {
    const html = String(page && page.html || "");
    const visibleText = plainText(html);
    const headings = sectionRecordsForPreservation(html).map(section => section.title);
    const gaps = [];
    headings.filter(title => isConfiguredRemovedSectionTitle(title)).forEach(title => {
      gaps.push(`不得生成独立“${title}”章节`);
    });
    if (/\bdd-quiz\b/i.test(html)) gaps.push("不得生成自测题");
    if (/\bdd-answers\b/i.test(html)) gaps.push("不得生成自测答案");
    if (/√\s*\(/u.test(visibleText)) gaps.push("可见正文不得保留未排版的 √(…) 根式");
    if (/\|\s*:?-{3,}:?\s*\|/u.test(visibleText)) gaps.push("可见正文不得保留 Markdown 管道表格分隔行");
    const formulaBlocks = [...html.matchAll(/<div\b([^>]*)class="[^"]*\bdd-formula\b[^"]*"([^>]*)>([\s\S]*?)<\/div>/gi)];
    formulaBlocks.forEach((match, index) => {
      const attributes = `${match[1]} ${match[2]}`;
      const body = match[3];
      if (!plainText(body)) gaps.push(`第 ${index + 1} 个公式块为空`);
      if (/<code\b/i.test(body)) gaps.push(`第 ${index + 1} 个展示公式不得使用代码块渲染`);
      if (/data-(?:display|math)="mathml"/i.test(attributes)
        && (!/<math\b/i.test(body) || !/<math\b[^>]*aria-label="[^"]+"/i.test(body))) {
        gaps.push(`第 ${index + 1} 个 MathML 公式缺少 math 元素或 aria-label`);
      }
    });
    return gaps;
  }

  function visibleRawLatexSections(page) {
    const commandPattern = /\\(?:frac|partial|theta|varepsilon|epsilon|nabla|Delta|approx|times|cdot|rightarrow|left|right|mathsf|mathbb|operatorname|begin|end)\b/;
    return sectionRecordsForPreservation(page && page.html).map((section, index) => ({
      section: index + 1,
      text: plainText(section.html),
    })).filter(section => commandPattern.test(section.text));
  }

  function pageSourceSignature(page) {
    const html = String(page && page.html || "");
    const blocks = html.match(/<div\b[^>]*class="[^"]*\bdd-src\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
    return sha256(blocks.map(block => block.replace(/\s+/g, " ").trim()).join("\n"));
  }

  return {
    editorialContentPolicyGaps,
    editorialPreservationReport,
    exactHtmlBlocks,
    htmlBlockWithClass,
    pageSourceSignature,
    sectionRecordsForPreservation,
    validatePage,
    visibleRawLatexSections,
  };
}

module.exports = { createEditorialCandidateValidation };
