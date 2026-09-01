"use strict";

const { sha256 } = require("../../../tools/video-ingest/core");

function collectEvidenceRefs(value, refs = []) {
  if (Array.isArray(value)) {
    value.forEach(item => collectEvidenceRefs(item, refs));
    return refs;
  }
  if (!value || typeof value !== "object") return refs;
  if (Array.isArray(value.evidenceRefs)) {
    value.evidenceRefs.forEach(ref => {
      if (ref && typeof ref === "object") refs.push(ref);
    });
  }
  Object.entries(value).forEach(([key, item]) => {
    if (key !== "evidenceRefs") collectEvidenceRefs(item, refs);
  });
  return refs;
}

function bindSyntheticEvidence(sourceProposal) {
  const proposal = JSON.parse(JSON.stringify(sourceProposal));
  const refs = collectEvidenceRefs(proposal);
  const durationSeconds = Math.max(60, ...refs.map(ref => Number(ref.end ?? ref.start ?? 0))) + 10;
  const frameRefs = [...new Map(refs
    .filter(ref => ref.frame)
    .map(ref => [ref.frame, ref])).values()];
  const evidence = {
    schemaVersion: 1,
    source: {
      ...proposal.source,
      platform: "Fixture",
      durationSeconds,
      accessedAt: "2026-07-24"
    },
    chapters: [{ start: 0, end: durationSeconds, title: "Synthetic test evidence" }],
    transcript: [{
      start: 0,
      end: durationSeconds,
      text: "Synthetic transcript created only for deterministic video-ingest tests."
    }],
    frames: frameRefs.map(ref => ({
      time: Number(ref.start || 0),
      file: ref.frame,
      ocr: "Synthetic frame text for deterministic tests."
    })),
    acquisition: {
      asr: "synthetic-fixture",
      transcriptComplete: true,
      ocrComplete: true,
      limitations: ["Not source evidence; test use only."],
      evidenceLevelSuggestion: "E2",
      requiresEditorialReview: false
    }
  };
  evidence.contentHash = sha256(evidence);
  proposal.evidenceHash = evidence.contentHash;
  return { evidence, proposal };
}

module.exports = { bindSyntheticEvidence };
