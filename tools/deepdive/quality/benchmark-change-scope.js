"use strict";

const { isDeepStrictEqual } = require("util");

function withoutReferenceHash(benchmark) {
  if (!benchmark || typeof benchmark !== "object" || Array.isArray(benchmark)) return null;
  const copy = JSON.parse(JSON.stringify(benchmark));
  if (!copy.reference || typeof copy.reference !== "object" || Array.isArray(copy.reference)) {
    return null;
  }
  delete copy.reference.pageHash;
  return copy;
}

function benchmarkChangeScope(before, after) {
  const beforeWithoutHash = withoutReferenceHash(before);
  const afterWithoutHash = withoutReferenceHash(after);
  const referenceId = after?.reference?.id;
  if (
    !beforeWithoutHash
    || !afterWithoutHash
    || typeof referenceId !== "string"
    || !referenceId
    || before?.reference?.id !== referenceId
    || !isDeepStrictEqual(beforeWithoutHash, afterWithoutHash)
  ) {
    return { allPages: true, pageIds: [] };
  }
  return { allPages: false, pageIds: [referenceId] };
}

module.exports = { benchmarkChangeScope };
