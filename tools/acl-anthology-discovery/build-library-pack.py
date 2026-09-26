#!/usr/bin/env python3
"""Generate the public ACL Anthology pending-evidence library pack."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


TOPICS = {
    "foundation-and-architecture": ("基础模型与模型架构", ["llm", "transformer"]),
    "training-and-reasoning": ("训练、对齐与推理", ["fine-tuning", "reasoning-models"]),
    "retrieval-agents-and-memory": ("检索、Agent 与记忆", ["rag", "agent"]),
    "multimodal-models": ("多模态模型", ["multimodal"]),
    "evaluation-reliability-and-safety": ("评测、可靠性与安全", ["model-evaluation"]),
    "efficiency-and-infrastructure": ("训练推理效率与基础设施", ["inference-optimization"]),
}


def entry(item):
    paper = item["paper"]
    match = item["evaluation"]["matches"][0]
    recheck = item["importance"]["status"] == "recheck"
    labels, nodes = [], []
    for hit in item["candidate"]["keywordHits"]:
        if hit in TOPICS:
            label, linked = TOPICS[hit]
            labels.append(label)
            nodes.extend(linked)
    labels = list(dict.fromkeys(labels)) or ["计算语言学与语言技术"]
    nodes = list(dict.fromkeys(nodes))
    status = "重要性审核待复核：关键证据冲突；上线不代表通过" if recheck else "重要性审核待补：缺乏 AI 重大贡献独立证据；上线不代表通过"
    award_year = 2025 if match["mechanismId"] == "tacl-2024-best-awarded-2025" else paper["year"]
    venue = "TACL 2024" if paper["collectionId"] == "2024.tacl" else f"ACL {paper['year']}"
    summary = (
        f"该论文涉及{'、'.join(labels)}。已核实其获得 {venue} {match['awardName']}，"
        + ("但存在尚未解决的关键证据冲突，当前仅作为待复核入口。" if recheck else "但当前尚缺独立外部证据支持其对 AI 发展构成重大贡献，当前仅作为待补证入口。")
    )
    reason = (
        f"因精确匹配已启用机制 {match['mechanismId']} 而公开登记。正式奖项与论文身份已经核实；"
        + ("关键证据冲突尚未解决，不得作为重要性已通过的资料使用。" if recheck else "官方结果未提供足以满足本站门槛的逐篇重大贡献评语，作者摘要不能替代独立评价。")
    )
    return {
        "id": "acl-anthology-" + paper["anthologyId"],
        "sourceClass": "academic",
        "sourceSubcategory": "acl-anthology",
        "anthologyId": paper["anthologyId"],
        "title": paper["title"],
        "publisher": "、".join(paper["authors"]),
        "collection": f"ACL Anthology · {venue} · {match['awardName']}",
        "contentKind": "研究论文（待补证目录）",
        "authorityTier": "R",
        "reviewStatus": status,
        "primarySource": True,
        "discoveryOnly": True,
        "url": paper["url"],
        "publishedAt": str(paper["year"]),
        "accessedAt": item["checkedAt"],
        "summary": summary,
        "selectionReason": reason,
        "evidenceUse": "可用于核对论文身份、作者、正式奖项和原文内容；当前只能作为发现与补证入口，不能作为本站已确认的 AI 重大贡献证据。",
        "limitations": [
            "上线表示公开记录审核缺口，不表示重要性审核通过，也不表示本站认可论文全部结论。",
            "正式奖项可以证明该评价机制下的认可；在补齐独立重大贡献证据前，不能据此宣称论文已重大改变 AI。" if not recheck else "正式奖项身份成立，但关键证据冲突尚未解决；不能把批评自动写成论文已被证伪或奖项已被撤销。",
        ],
        "tags": ["待复核" if recheck else "待补证", venue, match["awardName"], *labels],
        "linkedNodes": nodes,
        "linkedSoftware": [],
        "reviewEvidence": {
            "url": match["officialResultUrl"],
            "sections": f"{match['awardName']} 正式名单、ACL Anthology 论文记录及重要性证据缺口",
            "checkedAt": item["checkedAt"],
        },
        "importanceReview": {
            "status": item["importance"]["status"],
            "mechanismId": match["mechanismId"],
            "awardYear": award_year,
            "officialResultUrl": match["officialResultUrl"],
            "evidenceGap": item["aiDevelopmentContribution"].get("evidenceGap"),
        },
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reviews", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    reviews = json.loads(args.reviews.read_text(encoding="utf-8"))
    entries = [entry(item) for item in reviews]
    if len(entries) != 52 or len({item["id"] for item in entries}) != 52:
        raise SystemExit("Expected 52 unique ACL Anthology mechanism records")
    payload = json.dumps(entries, ensure_ascii=False, indent=2)
    source = """/* ACL Anthology 正式奖项论文的公开待补证目录。
 * 上线只公开论文、奖项与审核缺口；所有条目 discoveryOnly=true，均未通过 AI 重大贡献门槛。 */
(function () {
  \"use strict\";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error(\"ACL Anthology 资料包需要先加载资料库\");
  const entries = __ENTRIES__;
  const records = library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
  const ids = new Set(records.map(item => item.id));
  const titles = new Set(records.map(item => item.title.toLocaleLowerCase()));
  entries.forEach(entry => {
    if (ids.has(entry.id)) throw new Error(`ACL Anthology 资料 id 重复：${entry.id}`);
    if (titles.has(entry.title.toLocaleLowerCase())) throw new Error(`ACL Anthology 论文重复：${entry.title}`);
  });
  library.items.push(...entries);
})();
""".replace("__ENTRIES__", payload)
    args.output.write_text(source, encoding="utf-8", newline="\n")
    print(json.dumps({"output": str(args.output), "entries": len(entries)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
