(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AI_ONBOARDING_MODEL = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const key = 'ai-knowledge-map.onboarding.v1';
  function normalize(value, count) {
    const valid = value && value.version === 1;
    const read = valid && Number.isInteger(value.read) ? Math.max(0, Math.min(count, value.read)) : 0;
    const cursor = valid && Number.isInteger(value.cursor) ? Math.max(0, Math.min(read, count - 1, value.cursor)) : Math.min(read, count - 1);
    return {version: 1, read, cursor, skipped: valid && value.skipped === true};
  }
  function unlocked(state, count) { return state.skipped || state.read === count; }
  function visit(state, index, count) {
    return Number.isInteger(index) && index >= 0 && index < count && index <= state.read ? {...state, cursor: index} : state;
  }
  function advance(state, count) {
    const read = Math.max(state.read, state.cursor + 1);
    return {...state, read, cursor: Math.min(count - 1, state.cursor + 1)};
  }
  function merge(local, remote, count) {
    const other = normalize(remote, count);
    return {...local, read: Math.max(local.read, other.read), skipped: local.skipped || other.skipped};
  }
  return Object.freeze({key, normalize, unlocked, visit, advance, merge});
});
