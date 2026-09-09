(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AI_PROGRESS_SUPABASE = factory();
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  // The official Supabase client owns session storage, refresh and auth errors.
  // Construct it with a publishable key; administrative secrets never belong here.
  function create(client) {
    const checked = response => { if (response.error) throw response.error; return response.data; };
    return Object.freeze({
      async sendCode(email) {
        return checked(await client.auth.signInWithOtp({email, options:{shouldCreateUser:true}}));
      },
      async verifyCode(email, token) {
        return checked(await client.auth.verifyOtp({email, token, type:'email'}));
      },
      async session() { return checked(await client.auth.getSession()).session; },
      onAuthChange(callback) { return client.auth.onAuthStateChange(callback).data.subscription; },
      async signOut() { return checked(await client.auth.signOut({scope:'local'})); },
      async deleteAccount() { return checked(await client.functions.invoke('delete-account',{body:{confirmation:'delete-account'}})); },
      async load() {
        // Range pagination: future additions must not silently truncate progress.
        const records = [];
        for (let offset=0;;offset+=500) {
          const rows = checked(await client.from('learning_progress')
            .select('node_id,field,value,version,content_revision')
            .order('node_id').order('field').range(offset,offset+499));
          records.push(...rows.map(row => ({nodeId:row.node_id, field:row.field, value:row.value,
            version:Number(row.version), contentRevision:row.content_revision})));
          if (rows.length < 500) return records;
        }
      },
      async apply(op) {
        return checked(await client.rpc('apply_learning_operation', {
          p_operation_id:op.operationId, p_node_id:op.nodeId, p_field:op.field,
          p_value:op.value, p_expected_version:op.expectedVersion,
          p_content_revision:op.contentRevision ?? null,
        }));
      },
    });
  }
  return Object.freeze({create});
});
