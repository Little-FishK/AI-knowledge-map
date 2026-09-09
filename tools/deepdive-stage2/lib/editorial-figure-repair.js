"use strict";
const crypto = require("crypto");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const digest = value => "sha256:" + crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const check = (ok, message) => { if (!ok) throw new Error(message); };
const figures = html => String(html).match(/<figure\b[^>]*class="[^"]*\bdd-fig\b[^"]*"[^>]*>[\s\S]*?<\/figure>/gi) || [];
const sections = html => String(html).match(/<section\b[\s\S]*?<\/section>/gi) || [];

// A trusted, page-locked repair launcher may authorize exactly one figure in
// one first-audit finding. It does not reset or replace the editorial workflow.
function figureRepairBaseline(record, original, candidate, rawGrant) {
  if (!rawGrant) return { baseline: original, receipt: null };
  const grant = JSON.parse(rawGrant);
  check(grant && Object.keys(grant).sort().join() === "candidateHash,findingId,pageId,section", "Invalid figure repair authorization");
  check(record.lease?.role === "repair" && record.editorialWorkflow?.requiresHumanReview
    && record.editorialWorkflow.maxRepairAttempts === 1 && record.repairAttempts === 0, "Figure repair requires the existing single editorial repair");
  check(grant.pageId === record.id && grant.candidateHash === pageContentHash(original), "Figure repair page/source changed");
  const findings = record.editorialWorkflow.initialBlockingFindings || [];
  check(findings.some(f => f.findingId === grant.findingId && f.code === "image-text-mismatch" && f.section === grant.section), "Figure repair must bind a first-audit figure finding");
  check(Number.isInteger(grant.section) && grant.section > 0, "Invalid figure section");
  const oldSections = sections(original.html), newSections = sections(candidate.html);
  check(oldSections.length === newSections.length, "Figure repair cannot change section count");
  const oldFigures = figures(oldSections[grant.section - 1] || ""), newFigures = figures(newSections[grant.section - 1] || "");
  check(oldFigures.length === 1 && newFigures.length === 1, "Figure repair requires one unambiguous figure in the authorized section");
  const before = oldFigures[0], after = newFigures[0];
  check(before !== after, "Authorized figure repair must change the figure");
  check(!/<\s*(?:script|iframe|object|embed|foreignObject|base|meta|link|form)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:/i.test(after), "Unsafe figure repair markup");
  const allBefore = figures(original.html), allAfter = figures(candidate.html);
  const index = allBefore.indexOf(before);
  check(index >= 0 && allBefore.length === allAfter.length && allBefore.lastIndexOf(before) === index
    && allAfter[index] === after && allBefore.every((f, i) => i === index || allAfter[i] === f), "Figure repair changed an unauthorized figure");
  return { baseline: { ...original, html: original.html.replace(before, after) }, receipt: {
    authorization: grant, authorizationHash: digest(grant), beforeFigureHash: digest(before), afterFigureHash: digest(after),
  } };
}
module.exports = { figureRepairBaseline };
