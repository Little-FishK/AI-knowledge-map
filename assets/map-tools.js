(function(global){
 'use strict';const text=(zh,en)=>document.documentElement.lang==='en'?en:zh,esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 function init(){
  const cy=global.__cy,api=global.AI_MAP_VIEW;
  if(!cy||!api||cy.container().dataset.mapToolsReady==='true')return;
  cy.container().dataset.mapToolsReady='true';
  const tools=global.AI_READER_TOOLS;
  // Keep zoom feedback accessible without recreating a floating toolbar.
  const status=document.createElement('span');status.id='map-tool-status';
  status.className='sr-only';status.setAttribute('role','status');cy.container().append(status);
  const output=document.getElementById('map-zoom-level');
  if(output){
   const input=document.createElement('input');input.id=output.id;input.type='number';input.min='20';input.max='300';input.step='5';
   input.setAttribute('aria-label',text('\u7f29\u653e\u767e\u5206\u6bd4','Zoom percentage'));output.replaceWith(input);
   const update=()=>{if(document.activeElement!==input)input.value=String(Math.round(cy.zoom()*100));};
   const commit=()=>{const value=Number(input.value);if(!input.value||!Number.isFinite(value)||value<20||value>300){input.value=String(Math.round(cy.zoom()*100));status.textContent=text('\u8bf7\u8f93\u516520\u5230300\u4e4b\u95f4\u7684\u767e\u5206\u6bd4\u3002','Enter a percentage between 20 and 300.');return;}cy.zoom({level:value/100,renderedPosition:{x:cy.width()/2,y:cy.height()/2}});};
   input.onchange=commit;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit();input.blur();}};cy.on('zoom',update);update();
  }
  // Previously shared view links continue to restore their saved map state.
  const raw=new URLSearchParams(location.search).get('view');
  if(raw){const value=tools.decodeView(raw);if(!api.apply(value))status.textContent=text('\u6b64\u89c6\u56fe\u94fe\u63a5\u65e0\u6548\uff0c\u5df2\u4fdd\u7559\u9ed8\u8ba4\u89c6\u56fe\u3002','This view link is invalid. The default view is retained.');}
  cy.on('tap','edge',event=>showRelation(event.target));
  function showRelation(edge){const a=edge.source(),b=edge.target(),data=global.GRAPH,e=data.edges[Number(edge.id().slice(1))],type=data.edgeTypes[e?.type];let dialog=document.getElementById('map-relation-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='map-relation-dialog';document.body.append(dialog);}dialog.innerHTML=`<button data-relation-close aria-label="${text('关闭','Close')}">×</button><h2>${esc(a.data('label'))} → ${esc(b.data('label'))}</h2><p><strong>${esc(type?.label||e?.type||'')}</strong> · ${esc(e?.label||text('图谱未提供进一步说明','No further explanation in the graph'))}</p><p>${text('这段说明来自当前图谱标签，不能单凭连线判断必要前提。请结合两端理解页与来源核对。','This explanation uses the published graph label. A connection alone does not establish a necessary prerequisite; consult both reading pages and their sources.')}</p>${e?.type==='prerequisite'?`<p>${text('先修箭头的方向约定仍待统一，请同时参考官方推荐学习顺序。','The prerequisite arrow convention still needs review; also consult the recommended learning order.')}</p>`:''}<p><a href="/zh/concepts/${a.id()}/#reading-sources">${text('起点解释与来源','Source concept and references')}</a> · <a href="/zh/concepts/${b.id()}/#reading-sources">${text('终点解释与来源','Target concept and references')}</a></p>`;dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal();}
 }
 global.addEventListener('ai-app-ready',init);if(global.__cy)init();
})(window);
