#!/usr/bin/env python3
"""Build an auditable ICLR 2024-2026 candidate census and gate decisions.

The official ICLR proceedings are the canonical identity source for papers that
actually reached publication.  The conference acceptance totals are retained as
a separate reconciliation control because a small number of accepted papers did
not appear in the final proceedings.

This script intentionally does not infer importance from acceptance, presentation
tier, review scores, citations, or author identity.  Only exact title matches to
an enabled, year-specific Outstanding Paper mechanism advance beyond gate 2.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable


BASE = "https://proceedings.iclr.cc"
YEARS = (2024, 2025, 2026)
ACCEPTED_TOTALS = {2024: 2260, 2025: 3704, 2026: 5355}
PROCEEDINGS_TOTALS = {2024: 2260, 2025: 3703, 2026: 5351}
ACCEPTED_TOTAL_EVIDENCE = {
    2024: "https://media.iclr.cc/Conferences/ICLR2024/ICLR2024-Fact_Sheet.pdf",
    2025: "https://media.iclr.cc/Conferences/ICLR2025/ICLR2025_Fact_Sheet.pdf",
    2026: "https://blog.iclr.cc/2026/03/31/a-retrospective-on-the-iclr-2026-review-process/",
}


AWARDS = {
    2024: {
        "url": "https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/",
        "titles": {
            "Generalization in diffusion models arises from geometry-adaptive harmonic representations": {
                "importance": "passed",
                "ai_status": "supported",
                "disposition": "include",
                "area": "diffusion",
                "nodes": ["diffusion", "image-generation", "generalization"],
                "reason": "The award committee identifies a critical missing piece in understanding when image diffusion models generalize rather than memorize and ties the result to architectural inductive bias and harmonic representations.",
                "limits": "The evidence concerns the studied image-diffusion setting and does not establish a universal non-memorization result for all diffusion models.",
            },
            "Learning Interactive Real-World Simulators": {
                "importance": "passed",
                "ai_status": "supported",
                "disposition": "include",
                "area": "world models and robotics",
                "nodes": ["world-models", "multimodal", "reinforcement-learning"],
                "reason": "The award committee calls UniSim a significant step toward aggregating heterogeneous robot data into foundation-model training through a unified visual-and-language control interface.",
                "limits": "The evidence supports a major simulator and data-unification contribution; it does not establish general-purpose real-world simulation accuracy.",
            },
            "Never Train from Scratch: Fair Comparison of Long-Sequence Models Requires Data-Driven Priors": {
                "importance": "passed",
                "ai_status": "supported",
                "disposition": "include",
                "area": "sequence modeling evaluation",
                "nodes": ["transformer", "state-space-models", "model-evaluation"],
                "reason": "The award committee reports that pretraining and fine-tuning can produce dramatic gains and that scratch training can systematically underestimate long-sequence architectures, changing how architecture comparisons should be conducted.",
                "limits": "The conclusion is methodological and depends on the evaluated long-sequence models, data priors, and training setups.",
            },
            "Protein Discovery with Discrete Walk-Jump Sampling": {
                "importance": "out-of-scope",
                "ai_status": "out-of-scope",
                "disposition": "do-not-include",
                "area": "AI for protein design",
                "nodes": ["sampling-params", "diffusion"],
                "reason": "The award commentary centers on antibody design, protein-sequence modeling, and wet-lab validation. It establishes an excellent AI-enabled scientific application but does not establish a major change to AI methods outside that application.",
                "limits": "This is a scope decision, not a negative judgment on scientific quality or biological importance.",
            },
            "Vision Transformers Need Registers": {
                "importance": "passed",
                "ai_status": "supported",
                "disposition": "include",
                "area": "vision transformers",
                "nodes": ["transformer", "attention", "computer-vision"],
                "reason": "The award committee identifies a concrete transformer feature-map pathology, credits the paper with explanatory hypotheses and a simple register-token remedy, and notes impact beyond the evaluated tasks.",
                "limits": "The evidence supports the register-token diagnosis and remedy in vision transformers, not a claim that registers improve every transformer architecture.",
            },
        },
    },
    2025: {
        "url": "https://blog.iclr.cc/2025/04/22/announcing-the-outstanding-paper-awards-at-iclr-2025/",
        "titles": {
            "Safety Alignment Should be Made More Than Just a Few Tokens Deep.": {
                "importance": "needs-evidence",
                "ai_status": "needs-evidence",
                "disposition": "deferred",
                "area": "alignment",
                "nodes": ["alignment", "guardrails", "jailbreak"],
                "reason": "The official page proves the Outstanding Paper award but provides no paper-specific committee assessment establishing that the work materially changed the alignment field.",
                "limits": "The paper abstract and authors' claims cannot fill the independent major-contribution evidence gate.",
            },
            "Learning Dynamics of LLM Finetuning.": {
                "importance": "needs-evidence",
                "ai_status": "needs-evidence",
                "disposition": "deferred",
                "area": "fine-tuning",
                "nodes": ["fine-tuning", "llm", "training-data-governance"],
                "reason": "The official page proves the Outstanding Paper award but does not publish a paper-specific contribution assessment sufficient for the site's major-AI-contribution gate.",
                "limits": "A specific independent assessment or later field-level evidence is still required.",
            },
            "AlphaEdit: Null-Space Constrained Knowledge Editing for Language Models": {
                "importance": "needs-evidence",
                "ai_status": "needs-evidence",
                "disposition": "deferred",
                "area": "model editing",
                "nodes": ["llm", "fine-tuning", "knowledge-graph"],
                "awardLocator": "AlphaEdit: Null-Space Constrained Model Editing for Language Models.",
                "reason": "The official page proves the Outstanding Paper award but gives no paper-specific committee explanation showing a major change to AI research or practice.",
                "limits": "Novelty and benchmark gains reported by the authors are insufficient without independent major-contribution evidence.",
            },
        },
    },
    2026: {
        "url": "https://blog.iclr.cc/2026/04/23/announcing-the-iclr-2026-outstanding-papers/",
        "titles": {
            "Transformers are Inherently Succinct": {
                "importance": "recheck",
                "ai_status": "needs-evidence",
                "disposition": "deferred",
                "area": "transformer theory",
                "nodes": ["transformer", "rnn", "information-theory"],
                "reason": "The committee describes a strong conceptual message but expressly notes critiques and uses prospective language about possible future influence; that does not yet close the major-contribution gate.",
                "limits": "The result should be revisited after the critiques and follow-up theoretical or empirical work mature.",
            },
            "LLMs Get Lost In Multi-Turn Conversation": {
                "importance": "passed",
                "ai_status": "supported",
                "disposition": "include",
                "area": "multi-turn LLM evaluation",
                "nodes": ["llm", "model-evaluation", "context-window"],
                "reason": "The committee identifies a consequential training-deployment mismatch, credits a scalable evaluation method, and confirms a marked reliability decline in realistic underspecified multi-turn interactions.",
                "limits": "The findings are bounded by the evaluated models and interaction design; the committee also notes concerns about dated models.",
            },
        },
    },
}


CURRENT_LIBRARY_TITLES = {
    "Auto-Encoding Variational Bayes",
    "Generative Adversarial Networks",
    "Adam: A Method for Stochastic Optimization",
    "Deep Residual Learning for Image Recognition",
    "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    "Language Models are Few-Shot Learners",
    "Training Compute-Optimal Large Language Models",
    "Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction",
    "Guiding a Diffusion Model with a Bad Version of Itself",
    "1000 Layer Networks for Self-Supervised RL: Scaling Depth Can Enable New Goal-Reaching Capabilities",
    "Why Diffusion Models Don't Memorize: The Role of Implicit Dynamical Regularization in Training",
    "Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free",
    "The Flexibility Trap: Rethinking the Value of Arbitrary Order in Diffusion Language Models",
    "High-accuracy sampling for diffusion models and log-concave distributions",
}


def normalize_title(value: str) -> str:
    value = unicodedata.normalize("NFKC", html.unescape(value))
    value = re.sub(r"\s+", " ", value).strip().casefold()
    return value.rstrip(".")


@dataclass
class Paper:
    year: int
    proceedings_id: str
    title: str
    authors: list[str]
    url: str


class ProceedingsParser(HTMLParser):
    def __init__(self, year: int):
        super().__init__(convert_charrefs=True)
        self.year = year
        self._paper_href: str | None = None
        self._in_title = False
        self._title_parts: list[str] = []
        self._in_authors = False
        self._author_parts: list[str] = []
        self.papers: list[Paper] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag == "a" and attrs_dict.get("title") == "paper title":
            self._paper_href = attrs_dict.get("href")
            self._in_title = True
            self._title_parts = []
        elif tag == "span" and "paper-authors" in (attrs_dict.get("class") or "").split():
            self._in_authors = True
            self._author_parts = []

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_parts.append(data)
        if self._in_authors:
            self._author_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._in_title:
            self._in_title = False
        if tag == "span" and self._in_authors:
            self._in_authors = False
            if self._paper_href is None:
                return
            title = "".join(self._title_parts).strip()
            authors = [x.strip() for x in "".join(self._author_parts).split(",") if x.strip()]
            href = self._paper_href
            match = re.search(r"/hash/([^/]+?)-Abstract-Conference\.html$", href)
            proceedings_id = match.group(1) if match else href.rsplit("/", 1)[-1]
            self.papers.append(Paper(self.year, proceedings_id, title, authors, BASE + href))
            self._paper_href = None
            self._title_parts = []
            self._author_parts = []


def parse_proceedings(year: int, text: str) -> list[Paper]:
    parser = ProceedingsParser(year)
    parser.feed(text)
    return parser.papers


def fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "ai-knowledge-map-audit/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read().decode("utf-8")


def paper_record(paper: Paper, checked_at: str) -> dict:
    award = AWARDS[paper.year]
    award_by_normalized = {normalize_title(title): (title, data) for title, data in award["titles"].items()}
    matched = award_by_normalized.get(normalize_title(paper.title))
    duplicate = normalize_title(paper.title) in {normalize_title(x) for x in CURRENT_LIBRARY_TITLES}
    base = {
        "recordId": f"iclr-{paper.year}-{paper.proceedings_id}",
        "policyVersion": "1.2",
        "checkedAt": checked_at,
        "paper": {
            "title": paper.title,
            "authors": paper.authors,
            "publishedYear": paper.year,
            "canonicalUrl": paper.url,
            "source": "ICLR Proceedings",
            "venueId": f"ICLR.cc/{paper.year}/Conference",
            "reviewedVersion": "final proceedings record",
        },
        "candidate": {
            "route": "accepted-main-conference",
            "identityStatus": "verified-in-proceedings",
            "acceptanceEvidence": ACCEPTED_TOTAL_EVIDENCE[paper.year],
        },
        "currentStanding": {
            "checkedUrls": [paper.url],
            "checkedAt": checked_at,
            "findings": "Present in the final ICLR proceedings.",
            "unresolvedConcern": None,
        },
    }
    if not matched:
        base.update({
            "evaluation": {
                "mechanismId": None,
                "awardName": None,
                "awardYear": None,
                "track": "Conference",
                "recipientStatus": None,
                "officialResultUrl": None,
                "resultLocator": None,
                "identityEvidence": [paper.url],
            },
            "importance": {
                "status": "deferred",
                "route": None,
                "reason": "ICLR acceptance is not an enabled importance mechanism, and no exact match to the enabled Outstanding Paper winner list was found.",
                "nextAction": "Recheck only if a new enabled paper-specific award or independent major-contribution assessment appears.",
            },
            "aiDevelopmentContribution": {
                "status": "needs-evidence",
                "reason": "No enabled formal evaluation mechanism matched; author claims, reviews, scores, citations, and presentation tier cannot substitute.",
                "nextAction": "Wait for qualifying external evidence.",
            },
            "contentReview": {
                "finalDisposition": "deferred-before-full-content-review",
                "duplicateCheck": "existing-library-match" if duplicate else "not-run-after-early-stop",
            },
        })
        return base

    award_title, decision = matched
    mechanism_id = f"iclr-{paper.year}-outstanding"
    base.update({
        "evaluation": {
            "mechanismId": mechanism_id,
            "awardName": "Outstanding Paper",
            "awardYear": paper.year,
            "track": "Conference",
            "recipientStatus": "winner",
            "officialResultUrl": award["url"],
            "resultLocator": decision.get("awardLocator", award_title),
            "identityEvidence": [paper.url, award["url"]],
        },
        "importance": {
            "status": decision["importance"],
            "route": "contemporary",
            "reason": decision["reason"],
            "nextAction": None if decision["importance"] == "passed" else "Obtain a paper-specific independent assessment that closes the major-contribution claim.",
        },
        "aiDevelopmentContribution": {
            "status": decision["ai_status"],
            "aiResearchArea": decision["area"],
            "specificChangeToAi": decision["reason"],
            "whyMajorRatherThanRelated": decision["reason"] if decision["ai_status"] == "supported" else None,
            "externalAssessments": [{
                "url": award["url"],
                "locator": decision.get("awardLocator", award_title),
                "assessor": f"ICLR {paper.year} Outstanding Paper Committee",
                "relationshipToPaperAuthors": "independent conference award committee",
                "supportedClaim": decision["reason"],
                "checkedAt": checked_at,
            }],
            "reason": decision["reason"],
            "limits": decision["limits"],
        },
        "contentReview": {
            "siteUse": "Explain the paper's verified AI contribution and its evidence boundary.",
            "linkedNodes": decision["nodes"],
            "relevance": "passed" if decision["ai_status"] == "supported" else decision["ai_status"],
            "materialSufficiency": "passed" if decision["ai_status"] == "supported" else "not-run",
            "duplicateCheck": "duplicate-existing-library" if duplicate else "no-exact-title-match-in-current-14",
            "rightsCheck": "link-to-official-record-only",
            "existingLibraryId": None,
            "finalDisposition": decision["disposition"],
        },
    })
    return base


def count(records: Iterable[dict], path: tuple[str, ...], expected: str) -> int:
    result = 0
    for record in records:
        value = record
        for key in path:
            value = value.get(key, {})
        if value == expected:
            result += 1
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--checked-at", default="2026-09-24")
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    args.cache_dir.mkdir(parents=True, exist_ok=True)

    all_records: list[dict] = []
    by_year: dict[int, dict] = {}
    for year in YEARS:
        cache = args.cache_dir / f"iclr-{year}-proceedings.html"
        if cache.exists():
            text = cache.read_text(encoding="utf-8")
        elif args.offline:
            raise SystemExit(f"Missing offline cache: {cache}")
        else:
            text = fetch(f"{BASE}/paper_files/paper/{year}")
            cache.write_text(text, encoding="utf-8")
        papers = parse_proceedings(year, text)
        if len(papers) != PROCEEDINGS_TOTALS[year]:
            raise SystemExit(f"ICLR {year}: expected {PROCEEDINGS_TOTALS[year]} proceedings papers, parsed {len(papers)}")
        normalized_titles = [normalize_title(p.title) for p in papers]
        if len(normalized_titles) != len(set(normalized_titles)):
            raise SystemExit(f"ICLR {year}: duplicate normalized proceedings titles")
        award_titles = {normalize_title(x) for x in AWARDS[year]["titles"]}
        missing_awards = award_titles.difference(normalized_titles)
        if missing_awards:
            raise SystemExit(f"ICLR {year}: award titles missing from proceedings: {sorted(missing_awards)}")
        records = [paper_record(p, args.checked_at) for p in papers]
        all_records.extend(records)
        by_year[year] = {
            "acceptedDecisionCount": ACCEPTED_TOTALS[year],
            "proceedingsIdentityCount": len(records),
            "acceptedNotInProceedingsUnidentified": ACCEPTED_TOTALS[year] - len(records),
            "awardWinners": count(records, ("evaluation", "recipientStatus"), "winner"),
            "passed": count(records, ("importance", "status"), "passed"),
            "deferred": count(records, ("importance", "status"), "deferred") + count(records, ("importance", "status"), "needs-evidence"),
            "recheck": count(records, ("importance", "status"), "recheck"),
            "outOfScope": count(records, ("importance", "status"), "out-of-scope"),
        }

    output_jsonl = args.output_dir / "review-results.jsonl"
    with output_jsonl.open("w", encoding="utf-8", newline="\n") as handle:
        for record in all_records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")

    award_records = [r for r in all_records if r["evaluation"]["recipientStatus"] == "winner"]
    selected_records = [r for r in all_records if r["contentReview"]["finalDisposition"] == "include"]
    (args.output_dir / "award-reviews.json").write_text(
        json.dumps(award_records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (args.output_dir / "selected.json").write_text(
        json.dumps(selected_records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    unresolved = [
        {
            "year": year,
            "count": ACCEPTED_TOTALS[year] - PROCEEDINGS_TOTALS[year],
            "status": "recheck",
            "reason": "Included in the official acceptance total but absent from the final proceedings identity list; individual OpenReview identities remain to be reconciled.",
            "acceptanceEvidence": ACCEPTED_TOTAL_EVIDENCE[year],
            "proceedingsUrl": f"{BASE}/paper_files/paper/{year}",
        }
        for year in YEARS
        if ACCEPTED_TOTALS[year] != PROCEEDINGS_TOTALS[year]
    ]
    (args.output_dir / "unresolved-acceptance-reconciliation.json").write_text(
        json.dumps(unresolved, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    summary = {
        "schemaVersion": 1,
        "policyVersion": "1.2",
        "checkedAt": args.checked_at,
        "scope": "ICLR 2024-2026 main-conference accepted papers; workshops, Tiny Papers, Blogposts, rejects, withdrawals and desk rejects excluded.",
        "acceptedDecisionTotal": sum(ACCEPTED_TOTALS.values()),
        "identifiedProceedingsRecords": len(all_records),
        "unidentifiedAcceptedNotInProceedings": sum(ACCEPTED_TOTALS[y] - PROCEEDINGS_TOTALS[y] for y in YEARS),
        "fullyAccountedTotal": len(all_records) + sum(ACCEPTED_TOTALS[y] - PROCEEDINGS_TOTALS[y] for y in YEARS),
        "awardWinnerRecords": count(all_records, ("evaluation", "recipientStatus"), "winner"),
        "passed": count(all_records, ("importance", "status"), "passed"),
        "deferred": count(all_records, ("importance", "status"), "deferred") + count(all_records, ("importance", "status"), "needs-evidence"),
        "recheckIdentified": count(all_records, ("importance", "status"), "recheck"),
        "recheckUnidentified": sum(ACCEPTED_TOTALS[y] - PROCEEDINGS_TOTALS[y] for y in YEARS),
        "outOfScope": count(all_records, ("importance", "status"), "out-of-scope"),
        "byYear": by_year,
        "importantBoundary": "Ordinary acceptance, oral/spotlight/poster tier, OpenReview scores and positive reviews do not pass the importance gate.",
        "artifacts": {
            "records": output_jsonl.name,
            "awardReviews": "award-reviews.json",
            "selected": "selected.json",
            "unresolved": "unresolved-acceptance-reconciliation.json",
        },
    }
    (args.output_dir / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    validation = {
        "status": "passed",
        "checks": {
            "identifiedRecordCountMatchesProceedings": len(all_records) == sum(PROCEEDINGS_TOTALS.values()),
            "identifiedPlusUnresolvedMatchesAcceptedTotal": summary["fullyAccountedTotal"] == summary["acceptedDecisionTotal"],
            "awardWinnerCountMatchesOfficialLists": len(award_records) == 10,
            "selectedCountMatchesPassedImportance": len(selected_records) == summary["passed"],
            "allRecordsHaveUniqueIds": len({r["recordId"] for r in all_records}) == len(all_records),
            "allRecordsHaveCurrentStanding": all(r["currentStanding"]["checkedAt"] for r in all_records),
            "noOrdinaryAcceptancePassed": all(
                r["evaluation"]["recipientStatus"] == "winner"
                for r in selected_records
            ),
        },
    }
    if not all(validation["checks"].values()):
        validation["status"] = "failed"
    (args.output_dir / "validation.json").write_text(
        json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    if validation["status"] != "passed":
        raise SystemExit("Generated audit failed validation")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
