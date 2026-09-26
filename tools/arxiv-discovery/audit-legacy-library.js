"use strict";
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const context = {window:{}};
for (const file of ["data/library.js","data/library-official-technical.js","data/library-official-china.js","data/library-platform-profiles.js","data/library-source-meta.js","data/library-new-sources.js","data/library-arxiv.js","data/library-openreview.js","data/library-acl-anthology.js"])
  vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});

const current = new Set(["2404.02905","2406.02507","2503.14858","2505.17638","2505.06708","2601.15165","2602.01338"]);
const passed = {
  "1312.6114": {mechanismId:"iclr-2024-tot", award:"ICLR 2024 Test of Time", evidenceUrl:"https://blog.iclr.cc/2024/05/07/iclr-2024-test-of-time-award/", reason:"官方评语确认该工作把深度学习与可扩展概率推断结合，形成 VAE 并持续影响后续概率模型。"},
  "1406.2661": {mechanismId:"neurips-2024-tot", award:"NeurIPS 2024 Test of Time Paper Award", evidenceUrl:"https://blog.neurips.cc/2024/11/27/announcing-the-neurips-2024-test-of-time-paper-awards/", reason:"官方评语将 GAN 定位为生成建模的基础工作，并确认其十年间对研究和多领域应用的持续影响。"},
  "1412.6980": {mechanismId:"iclr-2025-tot", award:"ICLR 2025 Test of Time", evidenceUrl:"https://blog.iclr.cc/2025/04/14/announcing-the-test-of-time-award-winners-from-iclr-2015/", reason:"官方评语确认 Adam 改变神经网络训练，已广泛用于视觉、语言和强化学习等多类架构与任务。"},
  "1512.03385": {mechanismId:"cvpr-2016-best", award:"CVPR 2016 Best Paper", evidenceUrl:"https://cvpr2016.thecvf.com/", reason:"CVPR 官方将 ResNet 论文列为主会最佳论文；原文贡献直接解决深层网络优化并形成广泛采用的残差架构。"},
  "1810.04805": {mechanismId:"naacl-2019-best-long", award:"NAACL 2019 Best Long Paper", evidenceUrl:"https://www.aclweb.org/adminwiki/index.php/2019Q3_Reports:_NAACL_2019", reason:"NAACL 官方记录将 BERT 列为最佳长论文；其双向预训练与微调范式直接改变 NLP 表示学习。"},
  "2005.14165": {mechanismId:"neurips-2020-best", award:"NeurIPS 2020 Best Paper", evidenceUrl:"https://blog.neurips.cc/2020/12/07/announcing-the-neurips-2020-award-recipients/", reason:"委员会确认规模化语言模型表现出无需参数更新的少样本学习，并预计对领域产生实质和持久影响。"},
  "2203.15556": {mechanismId:"neurips-2022-outstanding", award:"NeurIPS 2022 Outstanding Paper", evidenceUrl:"https://blog.neurips.cc/2022/11/21/announcing-the-neurips-2022-awards/", reason:"委员会确认该工作重新界定固定算力下模型规模与训练数据的取舍，改变社区理解语言模型扩展的方式。"}
};

const all=[];
for(const item of context.window.PRO_LIBRARY.items){
  if(item.sourceSubcategory==="arxiv"&&!current.has(item.arxivId))all.push(item);
  for(const related of item.relatedMaterials||[])if(related.sourceSubcategory==="arxiv"&&!current.has(related.arxivId))all.push({...related,mergedInto:item.id});
}
all.sort((a,b)=>(a.publishedAt||"").localeCompare(b.publishedAt||"")||a.arxivId.localeCompare(b.arxivId));
if(all.length!==78)throw Error(`Expected 78 legacy records, found ${all.length}`);

const records=all.map(item=>{
  const evidence=passed[item.arxivId];
  if(!evidence)return {
    arxivId:item.arxivId,title:item.title,url:item.url,existingLibraryId:item.id,mergedInto:item.mergedInto||null,
    relevance:{status:"passed",linkedNodes:item.linkedNodes||[]},
    steps:[{step:1,status:"passed"},{step:2,status:"deferred",reason:"截至本轮证据集，未匹配已启用机制的正式正奖或时间检验奖；未据此断言从未获奖。"}],
    importanceStatus:"deferred",decision:"retain-candidate-no-new-approval",
    reason:"本版必要的重要性证据不足；停止于机制门槛，未重新执行全文内容审核。",
    nextAction:"等待或补充符合政策的正式评价证据。"
  };
  return {
    arxivId:item.arxivId,title:item.title,url:item.url,existingLibraryId:item.id,mergedInto:item.mergedInto||null,
    relevance:{status:"passed",linkedNodes:item.linkedNodes||[]},
    steps:[1,2,3,4,5,6].map(step=>({step,status:"passed"})),
    evaluation:{...evidence,recipientStatus:"winner",verified:true,checkedAt:"2026-09-23"},
    currentStanding:{status:"no-adverse-signal-on-checked-entrances",checkedAt:"2026-09-23",entrances:[item.url,evidence.evidenceUrl]},
    aiDevelopmentContribution:{status:"supported",reason:evidence.reason},
    importanceStatus:"passed",
    contentReview:{status:"passed-limited-use",existingLibraryId:item.id,finalDisposition:"retain-existing",limitations:item.limitations||[],rightsCheck:"仅保留书目信息、原文链接与原创短评；不转载论文全文或图片。"},
    decision:"retain-existing"
  };
});
const counts={total:records.length,passed:records.filter(x=>x.importanceStatus==="passed").length,deferred:records.filter(x=>x.importanceStatus==="deferred").length};
const output={schemaVersion:1,policyVersion:"1.2",scope:"78 legacy arXiv materials present before the 2024–2026 review additions",checkedAt:"2026-09-23",counts,records};
const dir=path.join(root,"proposals/academic-importance/arxiv-legacy-20260923");fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,"reviews.json"),JSON.stringify(output,null,2)+"\n");
const lines=["# 原有 arXiv 资料重要性重审","",`日期：2026-09-23｜规则：v1.2｜总数：${counts.total}｜通过：${counts.passed}｜暂缓：${counts.deferred}`,"","## 结论","","原有条目不继承旧规则的“基础方法、关键改进、前沿初判”。本轮只在正式评价机制、论文身份、AI 重大贡献和内容边界均闭合时通过；缺必要证据的条目保留候选身份并暂缓，不判为低质量或不重要。","","## 通过（完成六步）",""];
for(const x of records.filter(x=>x.importanceStatus==="passed"))lines.push(`- [${x.arxivId} · ${x.title}](${x.url})：${x.evaluation.award}。${x.aiDevelopmentContribution.reason}`);
lines.push("","## 暂缓（停止于必要证据门槛）","",`其余 ${counts.deferred} 篇逐条记录在 \`reviews.json\`。每条均保留 arXiv ID、题名、既有资料 ID、节点关联、停止步骤、原因和下一步；“未匹配”只表示本轮证据集没有闭合，不表示论文从未获奖。`,"","## 网站处置","","通过项标记为“六步审核通过”；暂缓项标记为“重要性审核暂缓：本版必要证据不足”。暂缓条目暂不自动删除，等待维护者决定旧资料的展示政策。","");
fs.writeFileSync(path.join(dir,"REPORT.md"),lines.join("\n"));
console.log(JSON.stringify(counts));
