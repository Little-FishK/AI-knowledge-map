/* Generated from openai-importance-batch-05.json by tighten-selection.js. */
(function(){
  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;
  const rows=[];
  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"openai",sourceSet:row.setId,primaryCategory:row.primaryCategory,topicTags:[row.primaryCategory],title:row.title,publisher:"OpenAI",collection:"OpenAI 官方技术资料",contentKind:row.contentKind||function contentKind(record) {
  if (record.setId === "api-reference") return "API Reference";
  if (record.setId === "cookbook") return "官方工程案例";
  if (record.setId === "developer-blog") return "官方技术文章";
  if (record.setId === "plugins") return "插件开发文档";
  if (record.setId === "commerce") return "商业协议文档";
  if (record.setId === "chatgpt-codex") return "产品与开发文档";
  return "开发者指南";
}(row),authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"2026-09-24",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 OpenAI 的实现与声明","使用前应复核页面状态和版本"],tags:["openai","官方技术资料",row.matrixContribution,row.primaryCategory],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"2026-09-24",reviewBatch:"openai-importance-batch-05",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),contentTier:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,valueScore:row.valueScore||null,scoreBatch:row.scoreBatch||"",comparedWith:row.comparedWith||[],uniqueDelta:row.uniqueDelta||"",mergedFrom:row.mergedFrom||[],recheckAt:row.recheckAt||"",recheckTriggers:row.recheckTriggers||[]}));
})();
