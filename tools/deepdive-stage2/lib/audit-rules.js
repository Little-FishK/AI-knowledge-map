"use strict";

const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const {AUDIT_POLICY_HASH}=require('../../deepdive/quality/audit-policy');
const {
  TEMPLATE_FAMILIES,
  plainText,
  scanNarrativeTemplates,
} = require("../../deepdive/quality/deepdive-narrative-audit");

function createAuditRules(options) {
  const {
    schemaVersion,
    sixQuestions,
    blockerCodes,
    warningCodes,
    legacyBlockerCodes,
    visibleRawLatexSections,
    auditContract,
    clone,
    sha256,
  } = options;

  function legacyAuditGaps(id, page, audit) {
    const gaps = [];
    const narrativeScan = scanNarrativeTemplates(page);
    const visiblePageText = [page.title, page.subtitle, page.thesis, page.html]
      .map(value => String(value || "").replace(/<[^>]+>/g, " "))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const sectionCount = (String(page.html || "").match(/<section\b/gi) || []).length;
    const rawLatexSections = visibleRawLatexSections(page);
    if (!audit || typeof audit !== "object") return ["独立审计结果缺失"];
    if (audit.schemaVersion !== 2) gaps.push("独立审计 schemaVersion 必须为 2");
    if (audit.pageId !== id) gaps.push("独立审计 pageId 不匹配");
    if (audit.pageHash !== pageContentHash(page)) gaps.push("独立审计 pageHash 与当前正文不匹配");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt || "")) gaps.push("独立审计日期无效");
    if (!["pass", "fail"].includes(audit.decision)) gaps.push("独立审计 decision 必须是 pass 或 fail");
    if (!Array.isArray(audit.blockingFindings)) {
      gaps.push("独立审计 blockingFindings 必须是数组");
    } else {
      audit.blockingFindings.forEach((finding, index) => {
        if (!finding || typeof finding !== "object") {
          gaps.push(`blockingFindings[${index}] 必须是对象`);
          return;
        }
        if (!legacyBlockerCodes.has(finding.code)) {
          gaps.push(`blockingFindings[${index}] 使用了非阻断代码：${finding.code || "<missing>"}`);
        }
        if (!String(finding.claim || "").trim()) gaps.push(`blockingFindings[${index}].claim 缺失`);
        if (!String(finding.evidence || "").trim()) {
          gaps.push(`blockingFindings[${index}].evidence 缺失`);
        } else {
          const evidence = String(finding.evidence).replace(/\s+/g, " ").trim();
          if (!visiblePageText.includes(evidence)) {
            gaps.push(`blockingFindings[${index}].evidence 不是当前正文中的可见证据`);
          }
        }
        if (!String(finding.rationale || "").trim()) gaps.push(`blockingFindings[${index}].rationale 缺失`);
        if (finding.section !== null && !Number.isInteger(finding.section)) {
          gaps.push(`blockingFindings[${index}].section 必须是章节序号或 null`);
        } else if (Number.isInteger(finding.section)
          && (finding.section < 1 || finding.section > sectionCount)) {
          gaps.push(`blockingFindings[${index}].section 超出当前正文章节范围`);
        }
      });
      if (audit.decision === "pass" && audit.blockingFindings.length) {
        gaps.push("decision=pass 时 blockingFindings 必须为空");
      }
      if (audit.decision === "fail" && !audit.blockingFindings.length) {
        gaps.push("decision=fail 时必须提供至少一个高置信阻断项");
      }
    }
    if (rawLatexSections.length && (audit.decision !== "fail"
      || !Array.isArray(audit.blockingFindings)
      || !audit.blockingFindings.some(finding => finding && finding.code === "formula-error"))) {
      gaps.push(`正文第 ${rawLatexSections.map(item => item.section).join("、")} 节显示原始 LaTeX 命令，必须以 formula-error 阻断`);
    }
    const narrativeAudit = audit.narrativeAudit;
    if (!narrativeAudit || typeof narrativeAudit !== "object") {
      gaps.push("独立审计缺少 narrativeAudit 模板化叙事检查");
    } else {
      const expectedSections = narrativeScan.sections.map(section => section.section);
      const reviewedSections = Array.isArray(narrativeAudit.reviewedSections)
        ? narrativeAudit.reviewedSections
        : [];
      const normalizedReviewed = [...new Set(reviewedSections.filter(Number.isInteger))].sort((a, b) => a - b);
      if (JSON.stringify(normalizedReviewed) !== JSON.stringify(expectedSections)) {
        gaps.push("narrativeAudit.reviewedSections 必须覆盖全部核心教学章节且不得重复");
      }
      if (!Array.isArray(narrativeAudit.sectionOpenings)
        || narrativeAudit.sectionOpenings.length !== narrativeScan.sectionCount) {
        gaps.push("narrativeAudit.sectionOpenings 必须逐个核心教学章节提供开场证据");
      } else {
        const openingSections = new Set();
        narrativeAudit.sectionOpenings.forEach((opening, index) => {
          const sectionNumber = Number.isInteger(opening && opening.section) ? opening.section : index + 1;
          const section = narrativeScan.sections.find(item => item.section === sectionNumber);
          if (openingSections.has(sectionNumber)) gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节重复`);
          openingSections.add(sectionNumber);
          if (!section) {
            gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节超出正文范围`);
            return;
          }
          const evidence = String(opening && opening.evidence || "").replace(/\s+/g, " ").trim();
          if (!evidence || !section.text.includes(evidence)) {
            gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节缺少当前正文中的开场证据`);
          }
          if (!TEMPLATE_FAMILIES.has(opening && opening.patternFamily)) {
            gaps.push(`narrativeAudit.sectionOpenings 第 ${sectionNumber} 节 patternFamily 非法`);
          }
        });
      }
      if (typeof narrativeAudit.pervasiveTemplateExpression !== "boolean") {
        gaps.push("narrativeAudit.pervasiveTemplateExpression 必须是布尔值");
      }
      if (!String(narrativeAudit.rationale || "").trim()) gaps.push("narrativeAudit.rationale 缺失");
      if (narrativeAudit.pervasiveTemplateExpression === true) {
        const hasTemplateBlocker = Array.isArray(audit.blockingFindings)
          && audit.blockingFindings.some(finding => finding && finding.code === "harmful-template-expression");
        if (audit.decision !== "fail" || !hasTemplateBlocker) {
          gaps.push("narrativeAudit 判定存在普遍模板化表达时，必须以 harmful-template-expression 判定 fail");
        }
      }
    }
    if (!Array.isArray(audit.sections) || !audit.sections.length) {
      gaps.push("独立审计缺少逐节结果");
      return gaps;
    }
    const expectedAuditSections = narrativeScan.sections.map(section => section.section);
    const submittedAuditSections = audit.sections
      .map(section => section && section.section)
      .filter(Number.isInteger);
    const uniqueSubmittedSections = [...new Set(submittedAuditSections)].sort((a, b) => a - b);
    if (JSON.stringify(uniqueSubmittedSections) !== JSON.stringify(expectedAuditSections)
      || submittedAuditSections.length !== uniqueSubmittedSections.length) {
      gaps.push("独立审计 sections 必须恰好覆盖全部核心教学章节且不得重复");
    }
    audit.sections.forEach((section, index) => {
      const sectionNumber = Number.isInteger(section && section.section) ? section.section : index + 1;
      const pageSection = narrativeScan.sections.find(item => item.section === sectionNumber);
      sixQuestions.forEach(question => {
        const answer = section && section[question];
        if (!answer || !String(answer.answer || "").trim() || !String(answer.evidence || "").trim()) {
          gaps.push(`第 ${sectionNumber} 节：读者无法从正文确定 ${question}`);
          return;
        }
        if (audit.decision === "pass" && String(answer.answer).trim().length < 16) {
          gaps.push(`第 ${sectionNumber} 节：${question} 的审计答案少于 16 字`);
        }
        const evidence = plainText(answer.evidence);
        if (!pageSection || !evidence || !pageSection.text.includes(evidence)) {
          gaps.push(`第 ${sectionNumber} 节：${question} 的 evidence 不是本节正文中的可见证据`);
        }
      });
    });
    return gaps;
  }

  function visibleAuditText(page) {
    return [page.title, page.subtitle, page.thesis, page.html]
      .map(value => plainText(String(value || "")))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function auditGaps(id, page, audit, contract = null) {
    if (audit && audit.schemaVersion === 2 && (!contract || contract.schemaVersion === 2 || (contract.schemaVersion===3&&contract.legacyCompatible))) {
      return legacyAuditGaps(id, page, audit);
    }
    const gaps = [];
    const expected = contract || auditContract();
    const mode = expected.mode || "full";
    const visibleText = visibleAuditText(page);
    const sectionCount = (String(page.html || "").match(/<section\b/gi) || []).length;
    const rawLatexSections = visibleRawLatexSections(page);
    if (!audit || typeof audit !== "object") return ["独立审查结果缺失"];
    const requiredVersion = expected.schemaVersion || schemaVersion;
    const unified = requiredVersion === 4;
    if (audit.schemaVersion !== requiredVersion) gaps.push(`独立审查 schemaVersion 必须为 ${requiredVersion}；旧审核需补审，不能改版本号迁移`);
    if (audit.pageId !== id) gaps.push("独立审查 pageId 不匹配");
    if (audit.pageHash !== pageContentHash(page)) gaps.push("独立审查 pageHash 与当前正文不匹配");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt || "")) gaps.push("独立审查日期无效");
    if (audit.reviewedAt > new Date().toISOString().slice(0,10)) gaps.push('独立审查日期不得晚于当前日期');
    const sectionTexts = [...String(page.html || '').matchAll(/<section\b[\s\S]*?<\/section>/gi)].map(m=>plainText(m[0]));
    const evidencedSections = new Set();
    function locatedEvidence(items, allowed, label) {
      if(!Array.isArray(items)||!items.length){gaps.push(`${label} 必须提供章节与逐字证据`);return;}
      if (!Array.isArray(allowed)) {gaps.push(`${label} 缺少有效章节范围`);return;}
      for(const item of items) {
        if(!item || !Number.isInteger(item.section)||!allowed.includes(item.section)
          ||!plainText(item.quote||'')||!sectionTexts[item.section-1]?.includes(plainText(item.quote)))gaps.push(`${label} 证据不在指定章节`);
        else evidencedSections.add(item.section);
      }
    }
    if(unified && audit.policyId !== 'whole-page-teaching-v4')gaps.push('审核 policyId 不匹配');
    if(unified && audit.policyHash !== AUDIT_POLICY_HASH)gaps.push('审核规则快照摘要不匹配');
    if (audit.mode !== mode) gaps.push(`独立审查 mode 必须为 ${mode}`);
    if (!["pass", "fail"].includes(audit.decision)) gaps.push("独立审查 decision 必须是 pass 或 fail");
    const findings = Array.isArray(audit.blockingFindings) ? audit.blockingFindings : null;
    if (!findings) gaps.push("独立审查 blockingFindings 必须是数组");
    (findings || []).forEach((finding, index) => {
      if (!finding || typeof finding !== "object") {
        gaps.push(`blockingFindings[${index}] 必须是对象`);
        return;
      }
      const verificationCodeAllowed = mode === "verification"
        && (expected.verificationFindings || []).some(item => item.findingId === finding.findingId && item.code === finding.code);
      if (!blockerCodes.has(finding.code) && !verificationCodeAllowed) {
        gaps.push(`blockingFindings[${index}] 使用了非阻断代码：${finding.code || "<missing>"}`);
      }
      ["claim", "evidence", "rationale", "acceptanceCriteria"].forEach(field => {
        if (!String(finding[field] || "").trim()) gaps.push(`blockingFindings[${index}].${field} 缺失`);
      });
      const evidence = plainText(finding.evidence);
      if (evidence && !visibleText.includes(evidence)) gaps.push(`blockingFindings[${index}].evidence 不是当前正文中的可见证据`);
      const sections = Array.isArray(finding.sections)
        ? finding.sections
        : (Number.isInteger(finding.section) ? [finding.section] : []);
      if (!sections.length || sections.some(section => !Number.isInteger(section) || section < 1 || section > sectionCount)) {
        gaps.push(`blockingFindings[${index}].sections 必须包含有效章节序号`);
      }
      if(unified && evidence && !sections.some(n=>sectionTexts[n-1]?.includes(evidence)))gaps.push(`blockingFindings[${index}] 证据不在所列章节`);
      if (finding.code === "source-support-blocked") {
        const urls = Array.isArray(finding.sourceUrls) ? finding.sourceUrls : [];
        if (!urls.length || urls.some(url => !/^https:\/\//.test(String(url)))) {
          gaps.push(`blockingFindings[${index}].sourceUrls 必须包含联网核验使用的 HTTPS 来源`);
        }
      }
    });
    if (audit.decision === "pass" && (findings || []).length) gaps.push("decision=pass 时 blockingFindings 必须为空");
    if (audit.decision === "fail" && !(findings || []).length) gaps.push("decision=fail 时必须提供至少一个 blocker");
    if (mode === "full" && rawLatexSections.length && (audit.decision !== "fail"
      || !(findings || []).some(finding => finding && finding.code === "formula-error"))) {
      gaps.push(`正文第 ${rawLatexSections.map(item => item.section).join("、")} 节显示原始 LaTeX 命令，必须以 formula-error 阻断`);
    }
    if (!Array.isArray(audit.warnings)) gaps.push("独立审查 warnings 必须是数组");
    (Array.isArray(audit.warnings) ? audit.warnings : []).forEach((warning, index) => {
      if (!warning || typeof warning !== "object") {
        gaps.push(`warnings[${index}] 必须是对象`);
        return;
      }
      if (!warningCodes.has(warning.code)) gaps.push(`warnings[${index}] 使用了非法 warning 代码`);
      if (!String(warning.message || warning.rationale || "").trim()) gaps.push(`warnings[${index}] 缺少说明`);
    });

    if (mode === "full") {
      if (!Array.isArray(audit.coreConcepts) || !audit.coreConcepts.length) {
        gaps.push("完整审查必须自行识别至少一个核心概念");
      } else {
          const names = new Set();
        audit.coreConcepts.forEach((concept, index) => {
          if(!concept || typeof concept!=='object' || Array.isArray(concept)){gaps.push(`coreConcepts[${index}] 必须是对象`);return;}
          const name = String(concept && concept.name || "").trim();
          if (!name) gaps.push(`coreConcepts[${index}].name 缺失`);
          if (names.has(name)) gaps.push(`coreConcepts[${index}] 核心概念重复：${name}`);
          names.add(name);
          if (!Array.isArray(concept.sections) || !concept.sections.length
            || concept.sections.some(section => !Number.isInteger(section) || section < 1 || section > sectionCount)) {
            gaps.push(`coreConcepts[${index}].sections 必须包含有效章节序号`);
          }
          for (const part of (unified ? sixQuestions : ["definition", "problem", "boundary"])) {
            const check = concept && concept[part];
            const optional = unified && ['inputOutput','mechanism','interpretation'].includes(part);
            if (!check || !(optional ? ['pass','fail','not-applicable'] : ['pass','fail']).includes(check.status)) {
              gaps.push(`coreConcepts[${index}].${part}.status 必须是 pass 或 fail`);
              continue;
            }
            if(unified) {
              locatedEvidence(check.evidence,concept.sections||[],`coreConcepts[${index}].${part}`);
              if(check.status==='not-applicable'&&!String(check.applicabilityReason||'').trim())gaps.push(`coreConcepts[${index}].${part} 不适用必须说明理由`);
            } else if (!String(check.evidence || "").trim() || !visibleText.includes(plainText(check.evidence))) {
              gaps.push(`coreConcepts[${index}].${part}.evidence 必须来自当前正文`);
            }
            if (!String(check.rationale || "").trim()) gaps.push(`coreConcepts[${index}].${part}.rationale 缺失`);
            if (check.status === "fail") {
              const code = `core-concept-${part}-missing`;
              if (!(findings || []).some(finding => finding && finding.code === code && String(finding.concept || "").trim() === name)) {
                gaps.push(`核心概念 ${name} 的 ${part} 失败时必须提交 ${code} blocker`);
              }
            }
          }
        });
      }
      if (Array.isArray(audit.verificationResults) && audit.verificationResults.length) gaps.push("完整审查不得提交 verificationResults");
      if(unified) {
        const sections=Array.from({length:sectionCount},(_,i)=>i+1);
        if(!Array.isArray(audit.reviewedSections)||JSON.stringify([...audit.reviewedSections].sort((a,b)=>a-b))!==JSON.stringify(sections))gaps.push('reviewedSections 必须恰好覆盖全部章节');
        for(const part of ['facts','formulas','figures','sources','consistency']) {
          const check=audit.pageChecks?.[part];
          const optional=['formulas','figures'].includes(part);
          if(!check || !(optional?['pass','fail','not-applicable']:['pass','fail']).includes(check.status)){gaps.push(`pageChecks.${part} 缺失或状态无效`);continue;}
          if(!String(check.rationale||'').trim())gaps.push(`pageChecks.${part}.rationale 缺失`);
          if(check.status!=='not-applicable')locatedEvidence(check.evidence,sections,`pageChecks.${part}`);
          if(check.status==='not-applicable' && part==='figures' && /<(svg|img|table)\b/i.test(page.html))gaps.push('正文存在图表，figures 不能标不适用');
          const explicitMath = /<math\b|\bdata-formula-id\s*=|\bclass\s*=\s*["'][^"']*\bdd-formula\b/i.test(page.html);
          if(check.status==='not-applicable' && part==='formulas' && explicitMath)gaps.push('正文存在明确公式标记，formulas 不能标不适用');
          if(check.status==='fail' && !(findings||[]).length)gaps.push(`pageChecks.${part} 失败必须提交阻断`);
        }
        const uncovered = sections.filter(section => !evidencedSections.has(section));
        if (uncovered.length) gaps.push(`全文审核缺少第 ${uncovered.join('、')} 章的检查证据；仅列 reviewedSections 不足以证明覆盖`);
      }
    } else {
      if(unified && (!expected.verificationScopeHash || audit.verificationScopeHash!==expected.verificationScopeHash))gaps.push('定向复核的首次缺陷绑定不匹配');
      if (Array.isArray(audit.coreConcepts) && audit.coreConcepts.length) gaps.push("定向复核不得重新生成核心概念清单");
      const expectedFindings = expected.verificationFindings || [];
      const results = Array.isArray(audit.verificationResults) ? audit.verificationResults : [];
      const expectedIds = expectedFindings.map(finding => finding.findingId).sort();
      const actualIds = results.map(result => result && result.findingId).sort();
      if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) gaps.push("定向复核必须逐项覆盖首轮全部阻断问题且不得增加新问题");
      results.forEach((result, index) => {
        if(!result || typeof result!=='object'){gaps.push(`verificationResults[${index}] 必须是对象`);return;}
        if (typeof result.resolved !== "boolean") gaps.push(`verificationResults[${index}].resolved 必须是布尔值`);
        if (!String(result.evidence || "").trim() || !visibleText.includes(plainText(result.evidence))) {
          gaps.push(`verificationResults[${index}].evidence 必须来自返修后的当前正文`);
        }
        if (!String(result.rationale || "").trim()) gaps.push(`verificationResults[${index}].rationale 缺失`);
      });
      const unresolvedIds = results.filter(result => result && result.resolved === false).map(result => result.findingId).sort();
      const submittedIds = (findings || []).map(finding => finding.findingId).sort();
      if (JSON.stringify(unresolvedIds) !== JSON.stringify(submittedIds)) gaps.push("定向复核的 blockingFindings 必须恰好对应仍未解决的首轮问题");
    }
    return gaps;
  }

  function auditBlockers(audit) {
    if (!audit || audit.decision !== "fail" || !Array.isArray(audit.blockingFindings)) return [];
    return audit.blockingFindings.map((finding, index) => ({
      type: "content-audit",
      code: finding.code,
      findingId: finding.findingId || sha256(`${finding.code}:${JSON.stringify(finding.sections || finding.section)}:${finding.claim}:${index}`).slice(0, 24),
      section: Number.isInteger(finding.section) ? finding.section : (finding.sections || [])[0] || null,
      sections: clone(finding.sections || (Number.isInteger(finding.section) ? [finding.section] : [])),
      concept: finding.concept || null,
      message: `${finding.claim}：${finding.rationale}`,
      evidence: finding.evidence,
      acceptanceCriteria: finding.acceptanceCriteria || "修复该问题并保留相关章节原意",
      sourceUrls: clone(finding.sourceUrls || []),
    }));
  }

  return { auditBlockers, auditGaps };
}

module.exports = { createAuditRules };
