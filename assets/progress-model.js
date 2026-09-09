(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AI_PROGRESS_MODEL = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const fields = Object.freeze(['read', 'understood', 'practiced', 'legacyLearned']);
  const clone = value => JSON.parse(JSON.stringify(value));
  function validate(nodeId, field, value) {
    if (typeof nodeId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nodeId) || nodeId.length > 120)
      throw Error('Invalid concept ID');
    if (!fields.includes(field) || typeof value !== 'boolean') throw Error('Invalid progress state');
  }
  function key(nodeId, field) { validate(nodeId, field, false); return nodeId + '/' + field; }
  function empty(owner = 'guest') { return {schemaVersion: 1, owner, records: {}, pending: [], conflicts: {}, legacyImported: false}; }
  function migrateLegacy(state, ids) {
    if (state.owner !== 'guest' || state.legacyImported) return clone(state);
    if (!Array.isArray(ids)) throw Error('Legacy progress must be an array');
    const next = clone(state);
    for (const id of ids) {
      validate(id, 'legacyLearned', true);
      const k = key(id, 'legacyLearned');
      if (!Object.hasOwn(next.records, k)) next.records[k] = {nodeId: id, field: 'legacyLearned', value: true, version: 0, contentRevision: null};
    }
    next.legacyImported = true;
    return next;
  }
  function change(state, nodeId, field, value, operationId, contentRevision = null) {
    validate(nodeId, field, value);
    if (typeof operationId !== 'string' || !operationId.length) throw Error('Operation ID required');
    const next = clone(state), k = key(nodeId, field), old = next.records[k];
    if (next.pending.some(op => op.nodeId === nodeId && op.field === field)) throw Error('This field has a pending change');
    if (next.conflicts[k]) throw Error('Resolve conflict first');
    const record = {nodeId, field, value, version: old?.version || 0, contentRevision};
    next.records[k] = record;
    if (state.owner !== 'guest') next.pending.push({...record, operationId, expectedVersion: record.version});
    return next;
  }
  function receive(state, rows) {
    const next = clone(state);
    for (const row of rows) {
      validate(row.nodeId, row.field, row.value);
      if (!Number.isSafeInteger(row.version) || row.version < 1) throw Error('Invalid server version');
      const k = key(row.nodeId, row.field);
      const pending = next.pending.find(op => op.nodeId === row.nodeId && op.field === row.field);
      if (!pending) next.records[k] = clone(row);
      // In-flight operations must reach the server for idempotent receipt lookup;
      // a newer fetched row alone does not prove the local operation failed.
    }
    return next;
  }
  function acknowledge(state, owner, operationId, response) {
    if (owner !== state.owner) return clone(state);
    const next = clone(state), op = next.pending.find(item => item.operationId === operationId);
    if (!op) return next;
    const k = key(op.nodeId, op.field), row = response.record;
    if (!row || row.nodeId !== op.nodeId || row.field !== op.field) throw Error('Mismatched receipt');
    validate(row.nodeId, row.field, row.value);
    if (!Number.isSafeInteger(row.version) || row.version < 0) throw Error('Invalid receipt version');
    if (!['applied', 'conflict'].includes(response.status)) throw Error('Invalid receipt status');
    next.pending = next.pending.filter(item => item.operationId !== operationId);
    if (response.status === 'conflict') next.conflicts[k] = {local: op, remote: clone(row)};
    else next.records[k] = clone(row);
    return next;
  }
  function resolve(state, nodeId, field, choice, operationId) {
    const next = clone(state), k = key(nodeId, field), conflict = next.conflicts[k];
    if (!conflict || !['local', 'remote'].includes(choice)) throw Error('Invalid conflict resolution');
    next.records[k] = conflict.remote;
    delete next.conflicts[k];
    return choice === 'remote' ? next : change(next, nodeId, field, conflict.local.value, operationId, conflict.local.contentRevision);
  }
  function importPreview(guest, account) {
    if (guest.owner !== 'guest' || account.owner === 'guest') throw Error('Invalid import owners');
    return Object.entries(guest.records).map(([k, record]) => ({
      key: k, local: clone(record), remote: account.records[k] ? clone(account.records[k]) : null,
      conflict: !!account.records[k] && account.records[k].value !== record.value,
    }));
  }
  return Object.freeze({fields, key, empty, migrateLegacy, change, receive, acknowledge, resolve, importPreview});
});
