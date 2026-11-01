(function () {
  'use strict';
  let failed=false;
  const panel=document.createElement('section');panel.id='startup-status';panel.hidden=true;panel.setAttribute('role','status');
  document.body.append(panel);
  function update() {
    if(document.documentElement.dataset.appReady==='true'){panel.remove();clearInterval(timer);return;}
    if(window.AI_ONBOARDING?.isOpen()){panel.hidden=true;return;}
    const en=document.documentElement.lang==='en';
    panel.hidden=false;panel.replaceChildren();
    const message=document.createElement('p');message.textContent=failed
      ? (en?'The interactive view could not finish loading. Retry or use the text directory.':'交互页面未能完成加载。可重试或先使用文字目录。')
      : (en?'Loading the interactive view…':'正在加载交互页面…');panel.append(message);
    if(failed){const retry=document.createElement('button');retry.textContent=en?'Retry':'重试';retry.onclick=()=>location.reload();panel.append(retry);
      const link=document.createElement('a');link.href='/search/?lang='+document.documentElement.lang;link.textContent=en?'Text directory':'文字目录';panel.append(link);}
  }
  const timer=setInterval(update,1000);
  setTimeout(()=>{failed=true;update();},15000);
  window.addEventListener('ai-app-ready',update);
  window.addEventListener('ai-app-failed',()=>{failed=true;update();});
})();
