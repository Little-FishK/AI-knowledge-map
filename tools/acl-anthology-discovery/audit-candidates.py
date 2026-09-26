#!/usr/bin/env python3
"""Build and gate the 2024-2026 ACL Anthology candidate pool from official XML."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


CORE_VOLUMES = {
    2024: {
        "2024.acl": {"long", "short"},
        "2024.emnlp": {"main"},
        "2024.naacl": {"long", "short"},
        "2024.eacl": {"long", "short"},
        "2024.lrec": {"main"},
        "2024.findings": "*",
        "2024.tacl": "*",
        "2024.cl": "*",
    },
    2025: {
        "2025.acl": {"long", "short"},
        "2025.emnlp": {"main"},
        "2025.naacl": {"long", "short"},
        "2025.coling": {"main"},
        "2025.ijcnlp": {"long", "short"},
        "2025.findings": "*",
        "2025.tacl": "*",
        "2025.cl": "*",
    },
    2026: {
        "2026.acl": {"long", "short"},
        "2026.eacl": {"long", "short"},
        "2026.findings": "*",
        "2026.tacl": "*",
        "2026.cl": "*",
    },
}

KEYWORD_PATTERNS = {
    "foundation-and-architecture": re.compile(
        r"\b(foundation models?|large language models?|language models?|llms?|transformer|self-attention|"
        r"state space model|mamba|mixture[- ]of[- ]experts|\bmoe\b|diffusion model|world model)\b", re.I
    ),
    "training-and-reasoning": re.compile(
        r"\b(pre[- ]?train|post[- ]?train|fine[- ]?tun|instruction tun|preference optimization|"
        r"reinforcement learning|rlhf|rlvr|test[- ]time (compute|scal)|chain[- ]of[- ]thought|reasoning model)\b", re.I
    ),
    "retrieval-agents-and-memory": re.compile(
        r"\b(retrieval[- ]augmented|\brag\b|knowledge edit|language model agent|llm agent|agentic|"
        r"tool[- ]use|tool learning|planning agent|agent memory|long[- ]context)\b", re.I
    ),
    "multimodal-models": re.compile(
        r"\b(multimodal (language )?model|vision[- ]language model|audio[- ]language model|speech language model|"
        r"video language model|\bvlm\b|\bmlm\b)\b", re.I
    ),
    "evaluation-reliability-and-safety": re.compile(
        r"\b(hallucination|jailbreak|alignment|model safety|language model safety|llm safety|"
        r"robustness|uncertainty calibration|machine unlearning|model unlearning|interpretability|"
        r"mechanistic interpretability|bias evaluation|fairness evaluation|model evaluation|llm evaluation)\b", re.I
    ),
    "efficiency-and-infrastructure": re.compile(
        r"\b(quantization|knowledge distillation|model distillation|speculative decod|sparse attention|"
        r"inference acceleration|inference efficiency|training efficiency|parameter[- ]efficient|lora|peft)\b", re.I
    ),
}

ENABLED = {
    ("2025.acl", "Best Paper"): ("acl-2025-best", "Best Paper"),
    ("2025.acl", "Outstanding Paper"): ("acl-2025-outstanding", "Outstanding Paper"),
    ("2026.acl", "Best Paper"): ("acl-2026-best", "Best Paper Award"),
    ("2026.acl", "Outstanding Paper"): ("acl-2026-outstanding", "Outstanding Paper Award"),
    ("2024.tacl", "TACL 2024 Best Paper"): ("tacl-2024-best-awarded-2025", "Best Paper Award"),
}

OFFICIAL_RESULTS = {
    "acl-2025-best": "https://2025.aclweb.org/program/awards/",
    "acl-2025-outstanding": "https://2025.aclweb.org/program/awards/",
    "tacl-2024-best-awarded-2025": "https://2025.aclweb.org/program/awards/",
    "acl-2026-best": "https://2026.aclweb.org/program/best_papers/",
    "acl-2026-outstanding": "https://2026.aclweb.org/program/best_papers/",
}


def text(element):
    return "" if element is None else "".join(element.itertext()).strip()


def norm(value):
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def git_value(root: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-c", f"safe.directory={root.as_posix()}", *args], cwd=root, text=True).strip()


def parse_records(xml_root: Path):
    records = []
    for year in (2024, 2025, 2026):
        for path in sorted(xml_root.glob(f"{year}.*.xml")):
            tree = ET.parse(path)
            collection = tree.getroot()
            collection_id = collection.attrib["id"]
            for volume in collection.findall("volume"):
                volume_id = volume.attrib["id"]
                meta = volume.find("meta")
                venues = [text(node) for node in meta.findall("venue")] if meta is not None else []
                booktitle = text(meta.find("booktitle")) if meta is not None else ""
                configured = CORE_VOLUMES[year].get(collection_id)
                is_core = configured == "*" or isinstance(configured, set) and volume_id in configured
                for paper in volume.findall("paper"):
                    paper_id = paper.attrib["id"]
                    title = text(paper.find("title"))
                    abstract = text(paper.find("abstract"))
                    authors = []
                    for author in paper.findall("author"):
                        name = " ".join(part for part in (text(author.find("first")), text(author.find("middle")), text(author.find("last"))) if part)
                        if name:
                            authors.append(name)
                    awards = [award.attrib.get("name", "").strip() for award in paper.findall("award")]
                    keyword_hits = [name for name, pattern in KEYWORD_PATTERNS.items() if pattern.search(f"{title}\n{abstract}")]
                    routes = []
                    if is_core:
                        routes.append("core-research-volume")
                    if keyword_hits:
                        routes.append("professional-keyword")
                    if awards:
                        routes.append("mature-evaluation-lead")
                    if not routes:
                        continue
                    anthology_id = f"{collection_id}-{volume_id}.{paper_id}"
                    records.append({
                        "anthologyId": anthology_id,
                        "year": year,
                        "collectionId": collection_id,
                        "volumeId": volume_id,
                        "venues": venues,
                        "booktitle": booktitle,
                        "title": title,
                        "authors": authors,
                        "abstract": abstract,
                        "doi": text(paper.find("doi")) or None,
                        "url": f"https://aclanthology.org/{anthology_id}/",
                        "awards": awards,
                        "keywordHits": keyword_hits,
                        "candidateRoutes": routes,
                        "revisionCount": len(paper.findall("revision")),
                    })
    return records


def deduplicate(records):
    output = []
    index = {}
    for record in records:
        key = "doi:" + record["doi"].casefold() if record["doi"] else "work:" + norm(record["title"]) + ":" + norm("|".join(record["authors"]))
        if key not in index:
            record["aliases"] = []
            index[key] = len(output)
            output.append(record)
            continue
        current = output[index[key]]
        if "core-research-volume" in record["candidateRoutes"] and "core-research-volume" not in current["candidateRoutes"]:
            record["aliases"] = current["aliases"] + [{"anthologyId": current["anthologyId"], "url": current["url"]}]
            output[index[key]] = record
            current = record
        else:
            current["aliases"].append({"anthologyId": record["anthologyId"], "url": record["url"]})
        current["candidateRoutes"] = sorted(set(current["candidateRoutes"] + record["candidateRoutes"]))
        current["keywordHits"] = sorted(set(current["keywordHits"] + record["keywordHits"]))
        current["awards"] = sorted(set(current["awards"] + record["awards"]))
    return output


def audit(record, checked_at):
    matches = []
    for award in record["awards"]:
        enabled = ENABLED.get((record["collectionId"], award))
        if enabled:
            matches.append({
                "mechanismId": enabled[0],
                "awardName": enabled[1],
                "rawAward": award,
                "officialResultUrl": OFFICIAL_RESULTS[enabled[0]],
                "identityEvidence": [record["url"], OFFICIAL_RESULTS[enabled[0]]],
            })

    if not matches:
        importance = {
            "status": "deferred",
            "gateStoppedAt": 2,
            "reason": "No exact match to an enabled year-, venue-, track-, and award-specific mechanism. Publication venue, Findings status, presentation tier, metadata keywords, and non-enabled awards cannot substitute.",
        }
        contribution = {"status": "not-entered-after-early-stop"}
    elif record["title"] == "The Imperfective Paradox in Large Language Models":
        importance = {
            "status": "recheck",
            "gateStoppedAt": 4,
            "reason": "The enabled ACL 2026 Best Paper identity matches, but an identified follow-up critique disputes benchmark construction, labels, and conclusion scope; this is a conflict requiring review, not proof of retraction.",
        }
        contribution = {"status": "recheck", "evidenceGap": "Resolve the documented methodological dispute before any new publication decision."}
    else:
        importance = {
            "status": "needs-evidence",
            "gateStoppedAt": 4,
            "reason": "The official result and Anthology metadata verify an enabled award, but the enabled result page supplies no paper-specific committee rationale establishing a major change to AI; the paper abstract is author-authored and cannot fill the independent-evidence requirement.",
        }
        contribution = {"status": "needs-evidence", "evidenceGap": "Independent professional assessment explicitly supporting a major AI contribution."}

    return {
        "recordId": "acl-anthology-" + record["anthologyId"],
        "policyVersion": "1.2",
        "collectionPolicyVersion": "1.0",
        "checkedAt": checked_at,
        "paper": {key: record[key] for key in ("anthologyId", "year", "title", "authors", "doi", "url", "collectionId", "volumeId", "venues", "booktitle", "revisionCount")},
        "candidate": {
            "routes": record["candidateRoutes"],
            "keywordHits": record["keywordHits"],
            "awardsInAnthologyMetadata": record["awards"],
            "aliases": record["aliases"],
        },
        "evaluation": {"matches": matches},
        "aiDevelopmentContribution": contribution,
        "importance": importance,
        "contentReview": {"status": "not-entered-unless-importance-passes"},
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--anthology-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--checked-at", default="2026-09-24")
    args = parser.parse_args()
    repo = args.anthology_root.resolve()
    xml_root = repo / "data" / "xml"
    if not xml_root.is_dir():
        raise SystemExit(f"ACL Anthology XML not found: {xml_root}")

    raw = parse_records(xml_root)
    candidates = deduplicate(raw)
    audits = [audit(record, args.checked_at) for record in candidates]
    out = args.output.resolve()
    out.mkdir(parents=True, exist_ok=True)
    results_path = out / "review-results.jsonl"
    with results_path.open("w", encoding="utf-8", newline="\n") as handle:
        for item in audits:
            handle.write(json.dumps(item, ensure_ascii=False, sort_keys=True) + "\n")

    by_year = {}
    for year in (2024, 2025, 2026):
        subset = [item for item in audits if item["paper"]["year"] == year]
        by_year[str(year)] = {
            "candidates": len(subset),
            "core": sum("core-research-volume" in item["candidate"]["routes"] for item in subset),
            "keyword": sum("professional-keyword" in item["candidate"]["routes"] for item in subset),
            "awardLead": sum("mature-evaluation-lead" in item["candidate"]["routes"] for item in subset),
            "passed": sum(item["importance"]["status"] == "passed" for item in subset),
            "deferred": sum(item["importance"]["status"] == "deferred" for item in subset),
            "needsEvidence": sum(item["importance"]["status"] == "needs-evidence" for item in subset),
            "recheck": sum(item["importance"]["status"] == "recheck" for item in subset),
        }
    status_counts = Counter(item["importance"]["status"] for item in audits)
    mechanism_counts = Counter(match["mechanismId"] for item in audits for match in item["evaluation"]["matches"])
    sha256 = hashlib.sha256(results_path.read_bytes()).hexdigest()
    summary = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "checkedAt": args.checked_at,
        "anthologySnapshot": {
            "commit": git_value(repo, "rev-parse", "HEAD"),
            "commitTime": git_value(repo, "log", "-1", "--format=%cI"),
            "source": "https://github.com/acl-org/acl-anthology",
        },
        "rawRouteMatchedRecords": len(raw),
        "candidateCount": len(audits),
        "deduplicatedAliases": sum(len(item["candidate"]["aliases"]) for item in audits),
        "statusCounts": dict(sorted(status_counts.items())),
        "mechanismMatchCounts": dict(sorted(mechanism_counts.items())),
        "byYear": by_year,
        "passedCount": status_counts.get("passed", 0),
        "resultsSha256": sha256,
        "notes": [
            "Ordinary acceptance, Findings status, SAC Highlights, presentation tier, and non-enabled award labels do not pass importance.",
            "Records without an enabled mechanism stop at gate 2; no claim is made that their abstracts or full texts were read.",
            "Enabled award matches stop at gate 4 when the official result lacks paper-specific independent major-AI-contribution evidence.",
        ],
    }
    (out / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    selected = [item for item in audits if item["importance"]["status"] == "passed"]
    (out / "selected.json").write_text(json.dumps(selected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    mechanism_reviews = [item for item in audits if item["evaluation"]["matches"]]
    (out / "mechanism-reviews.json").write_text(json.dumps(mechanism_reviews, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checks = {
        "candidateCountMatchesYears": len(audits) == sum(row["candidates"] for row in by_year.values()),
        "statusCountConservesCandidates": len(audits) == sum(status_counts.values()),
        "coreBaselineMatchesPolicy": [by_year[str(year)]["core"] for year in (2024, 2025, 2026)] == [7115, 8752, 5384],
        "uniqueRecordIds": len({item["recordId"] for item in audits}) == len(audits),
        "everyCandidateHasRoute": all(item["candidate"]["routes"] for item in audits),
        "enabledMechanismMatchCount": len(mechanism_reviews) == 52,
        "selectedMatchesPassed": len(selected) == status_counts.get("passed", 0),
        "noOrdinaryAcceptancePassed": all(item["evaluation"]["matches"] for item in selected),
    }
    validation = {"status": "passed" if all(checks.values()) else "failed", "checks": checks}
    (out / "validation.json").write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if validation["status"] != "passed":
        raise SystemExit(json.dumps(validation, ensure_ascii=False))
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
