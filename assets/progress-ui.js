(function (global) {
  'use strict';
  const PROJECT_URL = 'https://jjmihlewnbkfwpfgtfqi.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_FYW6WzBOKzOO4vuvyop-WQ_RcLWLyhS';
  const english = () => document.documentElement.lang === 'en';
  const text = (zh, en) => english() ? en : zh;
  const model = global.AI_PROGRESS_MODEL;
  const runtimeFactory = global.AI_PROGRESS_RUNTIME;
  const adapterFactory = global.AI_PROGRESS_SUPABASE;
  if (!model || !runtimeFactory) return;

  let adapter = null;
  if (global.supabase?.createClient && adapterFactory) {
    const client = global.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'ai-knowledge-map.auth.v1'},
    });
    adapter = adapterFactory.create(client);
  }
  const runtime = runtimeFactory.create({model, adapter, storage:global.localStorage,eventTarget:global,
    legacyKey:'ai-knowledge-map.learned.v1', randomUUID:()=>global.crypto.randomUUID()});
  let snapshot = runtime.get();
  let loginEmail = '';

  function nodeIdFor(article) {
    if (article?.dataset.conceptId) return article.dataset.conceptId;
    const path = location.pathname.match(/\/concepts\/([a-z0-9-]+)\/?$/);
    if (path) return path[1];
    const hash = location.hash.match(/^#\/(?:concept|map)\/([a-z0-9-]+)/);
    return hash ? hash[1] : '';
  }
  function recordValue(id, field) { return snapshot.state.records[model.key(id, field)]?.value === true; }
  function statusCopy() {
    if (Object.keys(snapshot.state.conflicts).length) return text('发现同步冲突，请选择保留哪个版本', 'Sync conflict: choose which version to keep.');
    if (snapshot.error) return text('同步失败，记录保留在本机，可稍后重试', 'Sync failed. Your change remains on this device.');
    if (snapshot.state.pending.length) return text('正在同步…', 'Syncing…');
    return snapshot.state.owner === 'guest'
      ? text('访客进度保存在当前浏览器', 'Guest progress is saved in this browser')
      : text('已同步到账号', 'Synced to your account');
  }
  function renderCard(article) {
    const id = nodeIdFor(article);
    if (!id) return;
    const signature = [snapshot.state.owner, Boolean(snapshot.error), snapshot.state.pending.some(op=>op.nodeId===id),
      JSON.stringify(Object.values(snapshot.state.conflicts).filter(item=>item.local.nodeId===id)),
      ...['read','understood','practiced'].map(field=>recordValue(id,field))].join('|');
    let card = article.querySelector(':scope > .progress-card');
    if (!card) {
      card = document.createElement('section'); card.className = 'progress-card'; card.dataset.progressFor = id;
      const before = article.querySelector(':scope > .dd-feedback');
      if (before) article.insertBefore(card, before); else article.append(card);
    }
    if (card.dataset.signature === signature) return;
    card.dataset.signature = signature;
    card.innerHTML = `<div class="progress-card-head"><div><strong>${text('我的学习进度','My learning progress')}</strong><p>${statusCopy()}</p></div></div>
      <div class="progress-fields" role="group" aria-label="${text('本页学习进度','Progress for this page')}">
        ${[['read','读过','Read'],['understood','自认为理解','I understand'],['practiced','完成自测','Self-test done']].map(([field,zh,en]) =>
          `<button type="button" data-progress-field="${field}" aria-pressed="${recordValue(id,field)}"${snapshot.state.pending.some(op=>op.nodeId===id&&op.field===field)?' disabled':''}>${recordValue(id,field)?'✓ ':''}${text(zh,en)}</button>`).join('')}
      </div>${conflictHtml(id)}`;
    card.querySelectorAll('[data-progress-field]').forEach(button => button.addEventListener('click', () => {
      const field = button.dataset.progressField;
      runtime.change(id, field, !recordValue(id, field)).catch(() => {});
    }));
    card.querySelectorAll('[data-conflict-choice]').forEach(button=>button.addEventListener('click',()=>{
      runtime.resolveConflict(id,button.dataset.field,button.dataset.conflictChoice).catch(()=>{});
    }));
  }
  function conflictHtml(id) {
    return Object.values(snapshot.state.conflicts).filter(item=>item.local.nodeId===id).map(item=>{
      const field=item.local.field,label={read:text('读过','Read'),understood:text('自认为理解','I understand'),practiced:text('完成自测','Self-test done'),legacyLearned:text('旧版已学习','Legacy learned')}[field];
      return `<div class="progress-conflict" role="alert"><strong>${label}</strong><span>${text('本机','This device')}: ${item.local.value?'✓':'—'} · ${text('云端','Cloud')}: ${item.remote.value?'✓':'—'}</span><div><button type="button" data-field="${field}" data-conflict-choice="local">${text('保留本机','Keep this device')}</button><button type="button" data-field="${field}" data-conflict-choice="remote">${text('采用云端','Use cloud')}</button></div></div>`;
    }).join('');
  }
  function refreshCards() { document.querySelectorAll('#dd-article').forEach(renderCard); refreshAccountButton(); }
  function accountHosts() { return [...document.querySelectorAll('#topbar .topbar-actions, .preview-header, .dd-top')]; }
  function ensureAccountButtons() {
    return accountHosts().map((host,index) => {
      let button=host.querySelector(':scope > [data-progress-account-button]');
      if (!button) {
        button=document.createElement('button');button.type='button';button.className='progress-account-button';
        button.dataset.progressAccountButton='';button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',openDialog);
        const close=host.querySelector('#dd-close');if(close)host.insertBefore(button,close);else host.append(button);
      }
      if(index===0)button.id='progress-account-button';
      return button;
    });
  }
  function refreshAccountButton() {
    const label=snapshot.state.owner==='guest'?text('登录同步','Sign in to sync'):text('账号已登录','Signed in');
    ensureAccountButtons().forEach(button=>{if(button.textContent!==label)button.textContent=label;});
  }
  function dialog() {
    let overlay=document.getElementById('progress-account-overlay');
    if(overlay)return overlay;
    overlay=document.createElement('div');overlay.id='progress-account-overlay';overlay.className='progress-account-overlay hidden';
    overlay.innerHTML=`<button class="progress-account-backdrop" type="button" aria-label="${text('关闭','Close')}"></button><section class="progress-account-dialog" role="dialog" aria-modal="true" aria-labelledby="progress-account-title"><button class="progress-account-close" type="button" aria-label="${text('关闭','Close')}">×</button><h2 id="progress-account-title">${text('账号与同步','Account and sync')}</h2><div class="progress-account-content"></div></section>`;
    document.body.append(overlay); overlay.querySelector('.progress-account-backdrop').onclick=closeDialog;overlay.querySelector('.progress-account-close').onclick=closeDialog;
    overlay.addEventListener('keydown',event=>{if(event.key==='Escape')closeDialog();});return overlay;
  }
  function setDialogMessage(message,error=false){const node=dialog().querySelector('.progress-account-message');if(node){node.textContent=message;node.classList.toggle('is-error',error);}}
  function openDialog(){const overlay=dialog(),content=overlay.querySelector('.progress-account-content');overlay.classList.remove('hidden');
    if(snapshot.state.owner!=='guest') {
      const imports=snapshot.importPreview||[];
      content.innerHTML=`<p>${text('你已登录，学习进度会跨设备同步。','You are signed in. Progress syncs across devices.')}</p>${imports.length?`<form data-import-form><fieldset><legend>${text('导入登录前保存在此浏览器的进度','Import progress saved in this browser before sign-in')}</legend>${imports.map((item,index)=>{const label=`${item.local.nodeId} · ${item.local.field}`,local=`${text('本机','This device')}: ${item.local.value?'✓':'—'}`,remote=item.remote?`${text('云端','Cloud')}: ${item.remote.value?'✓':'—'}`:text('云端没有记录','No cloud record');return `<div class="progress-import-row"><strong>${label}</strong><label><input type="radio" name="import-${index}" value="local" ${item.conflict?'':'checked'}>${local}</label><label><input type="radio" name="import-${index}" value="remote" ${item.conflict?'checked':''}>${remote}</label></div>`;}).join('')}<button type="submit">${text('应用选择','Apply choices')}</button></fieldset></form>`:''}<p class="progress-account-message"></p><div class="progress-account-actions"><button type="button" data-export>${text('导出进度','Export progress')}</button><button type="button" data-sign-out>${text('退出登录','Sign out')}</button><button type="button" class="progress-delete-account" data-delete>${text('删除账号','Delete account')}</button></div>`;
      content.querySelector('[data-import-form]')?.addEventListener('submit',async event=>{event.preventDefault();const choices={};imports.forEach((item,index)=>{choices[item.key]=event.currentTarget.elements[`import-${index}`].value;});try{await runtime.completeGuestImport(choices);closeDialog();}catch(error){setDialogMessage(error.message,true);}});
      content.querySelector('[data-export]').onclick=()=>{const blob=new Blob([runtime.exportData()],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='ai-knowledge-map-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),0);};
      content.querySelector('[data-sign-out]').onclick=async()=>{if(snapshot.state.pending.length&&!global.confirm(text('仍有未同步记录。确认退出并保留记录供下次恢复？','Some changes are not synced. Sign out and keep them for the next session?')))return;await runtime.signOut();closeDialog();};
      content.querySelector('[data-delete]').onclick=async()=>{if(!global.confirm(text('删除账号会永久删除云端学习进度。确认继续？','Deleting your account permanently removes cloud progress. Continue?')))return;try{await runtime.deleteAccount();closeDialog();}catch(error){setDialogMessage(error.message,true);}};
    }
    else content.innerHTML=`<form data-email-form><label>${text('邮箱','Email')}<input type="email" required autocomplete="email"></label><button type="submit">${text('发送验证码','Send code')}</button></form><form data-code-form class="hidden"><label>${text('六位验证码','Six-digit code')}<input inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="one-time-code"></label><button type="submit">${text('登录','Sign in')}</button></form><p class="progress-account-message" role="status"></p>`;
    content.querySelector('[data-email-form]')?.addEventListener('submit',async event=>{event.preventDefault();if(!adapter)return setDialogMessage(text('账号服务暂不可用','Account service is unavailable'),true);const emailForm=event.currentTarget,codeForm=content.querySelector('[data-code-form]');loginEmail=emailForm.querySelector('input').value.trim();try{await runtime.sendCode(loginEmail);emailForm.classList.add('hidden');codeForm.classList.remove('hidden');setDialogMessage(text('验证码已发送，请检查邮箱','Code sent. Check your email.'));codeForm.querySelector('input').focus();}catch(error){setDialogMessage(error.message,true);}});
    content.querySelector('[data-code-form]')?.addEventListener('submit',async event=>{event.preventDefault();try{await runtime.verifyCode(loginEmail,event.currentTarget.querySelector('input').value.trim());closeDialog();}catch(error){setDialogMessage(error.message,true);}});
    overlay.querySelector('input,button')?.focus();
  }
  function closeDialog(){dialog().classList.add('hidden');}
  runtime.subscribe(value=>{snapshot=value;refreshCards();});
  const observer=new MutationObserver(refreshCards);observer.observe(document.body,{childList:true,subtree:true});
  runtime.start().catch(error=>console.error('Progress initialization failed',error));
  refreshCards();
})(window);
