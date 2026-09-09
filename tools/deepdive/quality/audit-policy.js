"use strict";
const AUDIT_SCHEMA_VERSION=4;
const AUDIT_POLICY_ID="whole-page-teaching-v4";
const SIX_QUESTIONS = [
  "definition",
  "problem",
  "inputOutput",
  "mechanism",
  "interpretation",
  "boundary",
];
const L3_BLOCKING_CRITERIA = [
  {code:"core-concept-inputOutput-missing",category:"teaching",label:"核心概念的输入输出缺少必要解释"},
  {code:"core-concept-mechanism-missing",category:"teaching",label:"核心机制或因果链缺少必要解释"},
  {code:"core-concept-interpretation-missing",category:"teaching",label:"结果含义缺少必要解释"},
  { code: "factual-error", category: "fact", label: "知识事实错误" },
  { code: "formula-error", category: "fact", label: "公式、推导或符号关系错误" },
  { code: "terminology-error", category: "fact", label: "术语含义使用错误" },
  { code: "numeric-error", category: "fact", label: "数值、计算或量级错误" },
  { code: "source-support-blocked", category: "fact", label: "现有来源不能支持关键事实；来源列表不得由返修 Agent 修改" },
  { code: "core-concept-definition-missing", category: "concept", label: "核心概念没有解释是什么" },
  { code: "core-concept-problem-missing", category: "concept", label: "核心概念没有解释解决什么问题" },
  { code: "core-concept-boundary-missing", category: "concept", label: "核心概念没有解释适用边界" },
  { code: "harmful-repetition", category: "whole-page", label: "跨章节存在明显损害阅读的重复" },
  { code: "terminology-inconsistent", category: "whole-page", label: "同一术语或符号前后不一致" },
  { code: "image-text-mismatch", category: "whole-page", label: "正文与图表表达矛盾或引用错位" },
  { code: "harmful-template-expression", label: "大量模板化表达明显损害教学叙事" },
  { code: "semantic-fragment", label: "语义残缺或明显无法理解" },
];
const L3_NON_BLOCKING_SIGNALS = [
  { code: "minor-repetition", label: "轻微重复但不影响理解" },
  { code: "minor-terminology-style", label: "术语写法可统一但含义没有冲突" },
  { code: "minor-image-caption", label: "图注或衔接可改善但图文没有矛盾" },
  { code: "minor-readability", label: "表达可以更顺畅但不存在语义残缺" },
];
const L3_BLOCKER_CODES = new Set(L3_BLOCKING_CRITERIA.map(item => item.code));
const L3_WARNING_CODES = new Set(L3_NON_BLOCKING_SIGNALS.map(item => item.code));
const LEGACY_BLOCKER_CODES = new Set([...L3_BLOCKER_CODES, "critical-factual-error"]);

const POLICY_SNAPSHOT=Object.freeze({version:4,id:AUDIT_POLICY_ID,parts:SIX_QUESTIONS,
  optionalParts:['inputOutput','mechanism','interpretation'],pageChecks:['facts','formulas','figures','sources','consistency'],
  blockingCriteria:L3_BLOCKING_CRITERIA,nonBlockingSignals:L3_NON_BLOCKING_SIGNALS,
  evidence:'current-page-section-quotes',verification:'first-findings-only',learnerValidation:'separate',publication:'human-review'});
const AUDIT_POLICY_HASH='sha256:'+require('crypto').createHash('sha256').update(JSON.stringify(POLICY_SNAPSHOT)).digest('hex');
module.exports={AUDIT_SCHEMA_VERSION,AUDIT_POLICY_ID,AUDIT_POLICY_HASH,POLICY_SNAPSHOT,SIX_QUESTIONS,L3_BLOCKING_CRITERIA,L3_NON_BLOCKING_SIGNALS,L3_BLOCKER_CODES,L3_WARNING_CODES,LEGACY_BLOCKER_CODES};
