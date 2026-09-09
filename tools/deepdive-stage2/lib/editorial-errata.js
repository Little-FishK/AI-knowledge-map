"use strict";

const crypto = require("crypto");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const digest = value => "sha256:" + crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const check = (ok, message) => { if (!ok) throw new Error(message); };
const keys = (value, expected) => value && !Array.isArray(value) && Object.keys(value).sort().join() === expected.split(",").sort().join();

// Pure candidate construction. The caller holds the source lock and persists
// the authorization receipt in the same transaction as the editorial draft.
function applyEditorialErrata(pageId, source, packet, authorization, consumed = []) {
  check(keys(packet, "schemaVersion,pageId,sourceHash,changes"), "Invalid errata packet fields");
  check(packet.schemaVersion === 1 && packet.pageId === pageId, "Errata page binding mismatch");
  const packetHash = digest(packet);
  check(/^sha256:[a-f0-9]{64}$/.test(authorization || "") && authorization === packetHash, "Explicit exact errata authorization required");
  check(!consumed.some(item => item.packetHash === packetHash), "Errata authorization already consumed");
  check(packet.sourceHash === pageContentHash(source), "Errata source changed");
  check(Array.isArray(packet.changes) && packet.changes.length > 0 && packet.changes.length <= 100, "Invalid errata change count");
  let end = 0;
  const issues = new Set();
  for (const change of packet.changes) {
    check(keys(change, "issueId,start,end,before,after"), "Invalid errata change fields");
    check(typeof change.issueId === "string" && /^[A-Za-z0-9-]{1,80}$/.test(change.issueId) && !issues.has(change.issueId), "Invalid or duplicate errata issue");
    issues.add(change.issueId);
    check(Number.isInteger(change.start) && Number.isInteger(change.end) && change.start >= end && change.end > change.start, "Errata spans overlap or are unsorted");
    check(typeof change.before === "string" && typeof change.after === "string" && change.after.trim() && change.before !== change.after, "Empty or unchanged errata");
    check(source.html.slice(change.start, change.end) === change.before && change.end <= source.html.length, "Errata exact source span mismatch");
    check(!/<\s*(?:script|iframe|object|embed|foreignObject|base|meta|link|form)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:/i.test(change.after), "Unsafe errata markup");
    end = change.end;
  }
  const page = JSON.parse(JSON.stringify(source));
  delete page.publication;
  for (const change of [...packet.changes].reverse()) page.html = page.html.slice(0, change.start) + change.after + page.html.slice(change.end);
  return { page, receipt: { type: "human-authorized-errata", packetHash, sourceHash: packet.sourceHash,
    candidateHash: pageContentHash(page), packet: JSON.parse(JSON.stringify(packet)) } };
}

module.exports = { applyEditorialErrata, errataDigest: digest };
