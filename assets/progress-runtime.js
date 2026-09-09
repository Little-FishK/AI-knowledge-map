(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AI_PROGRESS_RUNTIME = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const GUEST_KEY = 'ai-knowledge-map.progress.guest.v1';
  const ACCOUNT_PREFIX = 'ai-knowledge-map.progress.account.';

  function create(options) {
    const model = options.model;
    const adapter = options.adapter || null;
    const storage = options.storage;
    const listeners = new Set();
    let state = load(GUEST_KEY, 'guest');
    let session = null;
    let lastError = null;
    let flushPromise = null;
    let guestImportPreview = [];
    let sessionGeneration = 0;
    let loading = false;

    function safeGet(key) { try { return storage?.getItem(key) || ''; } catch (_) { return ''; } }
    function safeSet(key, value) { try { storage?.setItem(key, value); return true; } catch (_) { return false; } }
    function safeRemove(key) { try { storage?.removeItem(key); return true; } catch (_) { return false; } }
    function load(key, owner) {
      try {
        const value = JSON.parse(safeGet(key));
        if (value && value.schemaVersion === 1 && value.owner === owner && value.records && Array.isArray(value.pending)) return value;
      } catch (_) {}
      return model.empty(owner);
    }
    function stateKey(owner = state.owner) { return owner === 'guest' ? GUEST_KEY : ACCOUNT_PREFIX + owner + '.v1'; }
    function persist() { return safeSet(stateKey(), JSON.stringify(state)); }
    function finishImport() {
      const decision=state.guestImportDecision;
      if(!decision?.pendingKeys)return;
      if(decision.pendingKeys.some(key=>state.conflicts[key]||state.pending.some(op=>model.key(op.nodeId,op.field)===key)))return;
      state.guestImportDecision={completedAt:new Date().toISOString()};
    }
    function snapshot() { return {state: JSON.parse(JSON.stringify(state)), session, error:lastError, loading, importPreview:JSON.parse(JSON.stringify(guestImportPreview))}; }
    function emit() { const value = snapshot(); listeners.forEach(listener => listener(value)); }
    function operationId() {
      if (options.randomUUID) return options.randomUUID();
      if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
      throw Error('Secure operation IDs are unavailable');
    }
    function migrateLegacy(ids) {
      state = model.migrateLegacy(state, ids || []);
      persist(); emit();
    }
    async function change(nodeId, field, value, contentRevision = null) {
      lastError = null;
      const owner = state.owner;
      state = model.change(state, nodeId, field, value, operationId(), contentRevision);
      persist(); emit();
      if (owner === 'guest') return snapshot();
      return flush();
    }
    async function flush() {
      if (!adapter || state.owner === 'guest') return snapshot();
      if (flushPromise) return flushPromise;
      const owner = state.owner;
      const generation = sessionGeneration;
      flushPromise = (async () => {
        lastError = null;
        while (sessionGeneration === generation && state.owner === owner && state.pending.length) {
          const op = state.pending[0];
          try {
            const response = await adapter.apply(op);
            if (sessionGeneration !== generation) return snapshot();
            state = model.acknowledge(state, owner, op.operationId, response);
            finishImport();
            persist(); emit();
          } catch (error) {
            if (sessionGeneration === generation && state.owner === owner) { lastError = error; persist(); emit(); }
            break;
          }
        }
        return snapshot();
      })();
      try { return await flushPromise; } finally { flushPromise = null; }
    }
    async function refresh() {
      if(!adapter||state.owner==='guest')return snapshot();
      const generation=sessionGeneration;
      try { const rows=await adapter.load();if(generation!==sessionGeneration)return snapshot();state=model.receive(state,rows);guestImportPreview=state.guestImportDecision?[]:model.importPreview(load(GUEST_KEY,'guest'),state);lastError=null;persist();emit();return flush(); }
      catch(error){if(generation===sessionGeneration){lastError=error;emit();}return snapshot();}
    }
    async function switchAccount(nextSession) {
      const owner = nextSession?.user?.id || 'guest';
      // Auth emits SIGNED_IN before verifyOtp resolves, and can emit it again
      // for the same session. Do not restart the in-flight progress read.
      if (owner !== 'guest' && session?.user?.id === owner && state.owner === owner) {
        session=nextSession;return snapshot();
      }
      const generation=++sessionGeneration;
      session = nextSession;
      loading=owner!=='guest';
      if (owner === 'guest') { state = load(GUEST_KEY, 'guest');guestImportPreview=[]; }
      else {
        state = load(stateKey(owner), owner);
        guestImportPreview=[];lastError=null;emit();
        let rows;
        try { rows=await adapter.load(); }
        catch(error){if(generation!==sessionGeneration)return snapshot();loading=false;lastError=error;persist();emit();return snapshot();}
        if(generation!==sessionGeneration)return snapshot();
        state = model.receive(state, rows);
        const guest=load(GUEST_KEY,'guest');
        guestImportPreview=state.guestImportDecision?[]:model.importPreview(guest,state);
      }
      loading=false;lastError = null; persist(); emit();
      if (owner !== 'guest') await flush();
      return snapshot();
    }
    async function start() {
      const legacy = (() => { try { const value = JSON.parse(safeGet(options.legacyKey)); return Array.isArray(value) ? value.filter(id => typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 120) : []; } catch (_) { return []; } })();
      migrateLegacy(legacy);
      if (!adapter) return snapshot();
      const current = await adapter.session();
      if (current) await switchAccount(current);
      adapter.onAuthChange((_event, nextSession) => {
        switchAccount(nextSession).catch(error => { lastError = error; emit(); });
      });
      options.eventTarget?.addEventListener?.('online', () => { refresh().catch(() => {}); });
      options.eventTarget?.addEventListener?.('storage', event => {
        if(event.key!==stateKey()||!event.newValue)return;
        if(state.owner!=='guest'){refresh().catch(()=>{});return;}
        try{const incoming=JSON.parse(event.newValue);if(incoming?.schemaVersion===1&&incoming.owner==='guest'&&incoming.records){state={...state,records:{...state.records,...incoming.records},legacyImported:state.legacyImported||incoming.legacyImported};emit();}}catch(_){}
      });
      return snapshot();
    }
    async function sendCode(email) { lastError = null; return adapter.sendCode(email); }
    async function verifyCode(email, token) {
      const result = await adapter.verifyCode(email, token);
      if (result.session) await switchAccount(result.session);
      return result;
    }
    async function signOut() { await adapter.signOut(); return switchAccount(null); }
    async function deleteAccount() {
      if(!adapter||state.owner==='guest')throw Error('Sign in before deleting the account');
      const accountKey=stateKey(),result=await adapter.deleteAccount();safeRemove(accountKey);session=null;state=load(GUEST_KEY,'guest');guestImportPreview=[];lastError=null;emit();return result;
    }
    async function resolveConflict(nodeId, field, choice) {
      state = model.resolve(state,nodeId,field,choice,operationId());
      finishImport();
      lastError = null;persist();emit();
      return flush();
    }
    async function completeGuestImport(choices) {
      if (state.owner==='guest') throw Error('Sign in before importing');
      if(state.guestImportDecision)return flush();
      const allowed=new Set(guestImportPreview.map(item=>item.key));
      for(const [key,choice] of Object.entries(choices||{}))if(!allowed.has(key)||!['local','remote'].includes(choice))throw Error('Invalid import choice');
      let candidate=state;const pendingKeys=[];
      for(const item of guestImportPreview) {
        const choice=choices?.[item.key]||'remote';
        if(choice==='local'){candidate=model.change(candidate,item.local.nodeId,item.local.field,item.local.value,operationId(),item.local.contentRevision);pendingKeys.push(item.key);}
      }
      state=candidate;state.guestImportDecision={pendingKeys};finishImport();guestImportPreview=[];lastError=null;persist();emit();
      return flush();
    }
    function exportData() { return JSON.stringify({exportVersion:1,exportedAt:new Date().toISOString(),progress:snapshot().state},null,2); }
    function subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); }
    return Object.freeze({change, completeGuestImport, deleteAccount, exportData, flush, get:snapshot, migrateLegacy, refresh, resolveConflict, sendCode, signOut, start, subscribe, verifyCode});
  }
  return Object.freeze({create});
});
