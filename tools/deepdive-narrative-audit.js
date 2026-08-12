"use strict";

const TEMPLATE_FAMILIES = new Set([
  "definition-copula",
  "understand-first",
  "judge-by",
  "other",
]);

function plainText(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionRecords(html) {
  const source = String(html || "");
  const core = [...source.matchAll(
    /<section\b([^>]*class="[^"]*\bdd-sec\b[^"]*"[^>]*)>([\s\S]*?)<\/section>/gi,
  )];
  const matches = core.length
    ? core
    : [...source.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)];
  return matches.map((match, index) => {
    const attributes = String(match[1] || "");
    const body = String(match[2] || "");
    const roleMatch = attributes.match(/\bdata-section-role\s*=\s*["']([^"']+)["']/i);
    const headingMatch = body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const bodyWithoutHeading = body
      .replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi, " ");
    const paragraphs = [...bodyWithoutHeading.matchAll(
      /<(?:p|li|blockquote)\b[^>]*>([\s\S]*?)<\/(?:p|li|blockquote)>/gi,
    )]
      .map(item => plainText(item[1]))
      .filter(item => item.length >= 6);
    const text = plainText(bodyWithoutHeading);
    const opening = paragraphs[0]
      || text.split(/[。！？!?；;]/).map(item => item.trim()).find(item => item.length >= 6)
      || text;
    return {
      section: index + 1,
      role: roleMatch ? roleMatch[1].trim().toLowerCase() : null,
      heading: headingMatch ? plainText(headingMatch[1]) : "",
      text,
      opening: opening.slice(0, 240),
    };
  });
}

function narrativeCoreSections(sections) {
  const explicitCore = sections.filter(section => section.role === "core");
  return explicitCore.length ? explicitCore : sections;
}

function openingPatternFamily(opening) {
  const value = String(opening || "")
    .replace(/^[（(]?\d+(?:\.\d+)*[）).、\s-]*/, "")
    .replace(/^(?:本节|这一节|这一章|首先|先)\s*[，,:：]?\s*/, "")
    .trim();
  if (!value) return "other";

  // “是在 / 是一类 / 是一种 / 是……”“指的是”“可以理解为”等均属于同一
  // 定义式开场家族，不能靠替换连接词逃避跨章节模板检查。
  if (/^(?:在[^，。！？]{1,30}[，,]\s*)?[^，。！？；：]{1,40}?(?:可以理解为|可理解为|指的是|定义为|称为|是(?:在|一(?:种|类|个|套|项)|用来|用于|由|把|指)?)/.test(value)) {
    return "definition-copula";
  }
  if (/^(?:要|为了)理解[^，。！？]{1,40}[，,]\s*(?:先|首先)/.test(value)) {
    return "understand-first";
  }
  if (/^(?:判断|评估|检查|验证)[^，。！？]{1,40}[，,]\s*(?:要|需要|应当|应该)?看/.test(value)) {
    return "judge-by";
  }
  return "other";
}

function scanNarrativeTemplates(page) {
  const allSections = sectionRecords(page && page.html);
  const sections = narrativeCoreSections(allSections);
  const inspected = sections.map(section => ({
    ...section,
    patternFamily: openingPatternFamily(section.opening),
  }));
  const counts = {};
  inspected.forEach(section => {
    if (section.patternFamily === "other") return;
    counts[section.patternFamily] = (counts[section.patternFamily] || 0) + 1;
  });
  const minimumRepeatedSections = Math.max(3, Math.ceil(inspected.length / 2));
  const pervasiveFamilies = Object.entries(counts)
    .filter(([, count]) => count >= minimumRepeatedSections)
    .map(([family]) => family);
  const affectedSections = inspected
    .filter(section => pervasiveFamilies.includes(section.patternFamily))
    .map(section => section.section);
  return {
    sectionCount: inspected.length,
    totalSectionCount: allSections.length,
    minimumRepeatedSections,
    pervasive: pervasiveFamilies.length > 0,
    pervasiveFamilies,
    affectedSections,
    sections: inspected,
    allSections,
  };
}

function narrativeTemplateBlockers(page, audit) {
  const scan = scanNarrativeTemplates(page);
  if (!scan.pervasive) return [];
  const samples = scan.sections
    .filter(section => scan.affectedSections.includes(section.section))
    .slice(0, 6)
    .map(section => `第 ${section.section} 节：“${section.opening.slice(0, 100)}”`);
  return [{
    type: "content-audit",
    code: "harmful-template-expression",
    section: null,
    message: `正文有 ${scan.affectedSections.length}/${scan.sectionCount} 个章节复用同一开场句式家族（${scan.pervasiveFamilies.join("、")}），达到“大量模板化表达明显损害教学叙事”的高置信阻断阈值。`,
    evidence: samples.join("；"),
    auditReportedDecision: audit && audit.decision || "invalid",
  }];
}

module.exports = {
  TEMPLATE_FAMILIES,
  narrativeTemplateBlockers,
  narrativeCoreSections,
  openingPatternFamily,
  plainText,
  scanNarrativeTemplates,
  sectionRecords,
};
