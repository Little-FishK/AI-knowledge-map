"use strict";
// Convert the user's original numbered plan into a traceable task ledger.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,'');
const stages=['一','二','三','四','五','六','七','八','九','十','十一','十二'];
let stage=0; const tasks=[];
for(const line of source.split(/\r?\n/)){
  const heading=line.match(/^第(.+?)阶段[：:](.+)$/);if(heading){stage=stages.indexOf(heading[1])+1;continue;}
  const task=line.match(/^(\d+)\.\s*(.+)$/);if(task)tasks.push({id:Number(task[1]),stage,description:task[2]});
}
assert.equal(tasks.length,84);assert.deepEqual(tasks.map(t=>t.id),Array.from({length:84},(_,i)=>i+1));
const specific={
1:['完成本次基线','无','版本关系及可恢复基线','Git隔离恢复及控制器1720文件备份恢复通过；部署提交存在已记录限制'],
2:['完成资产盘点','1','逐项资产清单','398产品记录及130理解页、155图、511表已列出；文件存在不等于发布资格'],
3:['完成本次核验记录','1、2','PHASE1_3_CURRENT_REVIEW.md','历史与本次证据分开，未知不算通过'],
4:['完成','用户确认','已确认范围及暂停边界','与用户最近要求一致'],
5:['完成','原计划','本文件及原文副本','84项ID连续，目的、依赖、交付物、验收和状态齐全'],
11:['标准已制定；执行中','已存在内容','CONTENT_QUALITY_STANDARD.md','每页检查8项教学要素'],
12:['记录结构已建立；全站证据未齐','11','三维独立评价清单','不以机器通过替代教学效果'],
13:['待逐页语义核验','11、12','术语与跨页关系问题清单','结构校验和语义核验分别记录'],
14:['部分页面完成','11、12','图表/例子核验记录','坐标、数值、公式、正文逐项一致'],
15:['依赖第二阶段讨论；未开始新旅程设计','7、10','基础旅程优先批次','用户先讨论路径；现有顺序只用于存量检查'],
16:['进行中','11–14','130页维护清单及受控修改记录','全部逐页核验，不预设重写'],
17:['结构/链接初查完成；语义与复现未完成','2、11','软件教程资料逐记录检查','官方事实、时效、用途、可复现性分别验证'],
18:['规则及本地双语反馈入口完成；线上与真实闭环待验证','12','CONTENT_CORRECTION_WORKFLOW.md及反馈入口','本地中英模板已验收；实际反馈追踪、复验关闭仍需证据']};
const rows=tasks.map(t=>{const x=specific[t.id]||[t.stage===2?'等待与用户讨论':t.stage===10?'真实用户测试按用户要求暂缓':'本轮暂停扩展；历史局部成果待归并',t.stage===2?'开始前与用户讨论':`依原计划第${t.stage}阶段前置条件`,t.description.split('。')[0], '按原文要求提供实测证据，不凭状态推断'];return {...t,status:x[0],dependencies:x[1],deliverable:x[2],acceptance:x[3]};});
const md=['# 原计划84项统一任务表','','唯一阶段编号依据为用户的12阶段原计划。旧M1/M2是技术里程碑，不等于阶段编号。2026-09-08核验。','', '本轮只推进第一、第三阶段；第二阶段开始前必须与用户讨论。真实用户测试仍暂缓；不自动推进英文迁移、静态扩展或上线。','', '| 项目 | 阶段 | 目的/任务 | 依赖 | 交付物 | 验收 | 状态 |','|---|---|---|---|---|---|---|',...rows.map(t=>`| ${t.id} | ${t.stage} | ${t.description.replace(/\|/g,'／')} | ${t.dependencies} | ${t.deliverable} | ${t.acceptance} | ${t.status} |`)].join('\n')+'\n';
fs.writeFileSync(path.join(root,'docs/ORIGINAL_84_TASKS.md'),md);
fs.writeFileSync(path.join(root,'docs/ORIGINAL_MATURITY_PLAN.txt'),source);
console.log(JSON.stringify({tasks:rows.length,stages:12,output:'docs/ORIGINAL_84_TASKS.md'}));
