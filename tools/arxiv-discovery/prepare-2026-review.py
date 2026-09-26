"""Freeze the available 2026 review queue; never treat missing evidence as rejection."""
import collections
import hashlib
import json
import pathlib
import re
import sqlite3
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'proposals/academic-importance/arxiv-2026-20260923'
OUT.mkdir(parents=True, exist_ok=True)
CATEGORIES = {'cs.AI', 'cs.LG', 'stat.ML', 'cs.CL', 'cs.CV', 'cs.NE', 'cs.MA', 'cs.RO'}
START, END = '2026-01-01', '2026-09-24'

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def title_key(title):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', title).encode('ascii', 'ignore').decode().lower())

db_path = ROOT / '.local/arxiv-discovery/20260923-r2/discovery.sqlite'
db = sqlite3.connect(db_path.resolve().as_uri() + '?mode=ro', uri=True)
plan_path = ROOT / 'proposals/arxiv-catalog/systematic-search-plan.json'
plan = json.loads(plan_path.read_text(encoding='utf-8'))
queries = {q['id']: q for q in plan['queries'] if q['kind'] == 'topic-history-and-frontier'}
trial_path = ROOT / 'proposals/academic-importance/arxiv-100-20260923/reviews.json'
trial = json.loads(trial_path.read_text(encoding='utf-8'))
prior = {r['arxivId']: r for r in trial['records']}
keyword_hits = collections.defaultdict(set)
for query_id, aid in db.execute('SELECT query_id,id FROM hits'):
    if query_id in queries:
        keyword_hits[aid].add(query_id)

papers = {}
for aid, raw in db.execute('SELECT id,metadata FROM papers ORDER BY id'):
    m = json.loads(raw)
    if not START <= m.get('published', '') < END:
        continue
    cats = sorted(CATEGORIES.intersection(m.get('categories', [])))
    hits = sorted(keyword_hits.get(aid, []))
    if cats or hits:
        papers[aid] = {'metadata': m, 'categoryMatches': cats, 'keywordQueryIds': hits, 'externalLeads': []}

# This is a discovery lead list, not a newly enabled award mechanism or a pass decision.
acl_titles = '''The Imperfective Paradox in Large Language Models
Memory Efficiency and Resource-Rational Encoding in Sentence Processing
Characterizing the Expressivity of Local Attention in Transformers
MauBERT: Universal Phonetic Inductive Biases for Few-Shot Acoustic Units Discovery
Evolutionary Guided Decoding: Iterative Value Refinement for LLMs
Beyond the Final Actor: Modeling the Dual Roles of Creator and Editor for Fine-Grained LLM-Generated Text Detection
Lying with Truths: Open-Channel Multi-Agent Collusion for Belief Manipulation via Generative Montage
Hierarchical Acoustic-Semantic Modeling: Modality Separation and Semantic Coherence for Full-Duplex SLMs
Mind the (DH) Gap! A Contrast in Risky Choices Between Reasoning and Conversational LLMs
MediEval: A Unified Medical Benchmark for Patient-Contextual and Knowledge-Grounded Reasoning in LLMs
Maximizing Local Entropy Where It Matters: Prefix-Aware Localized LLM Unlearning
GeoRA: Geometry-Aware Low-Rank Adaptation for RLVR
CURE: Critique-Driven Unified Reinforcement Learning for Test-Time Self-Improvement
Systematicity between Forms and Meanings across Languages Supports Efficient Communication
Rethinking Entropy Interventions in RLVR: An Entropy Change Perspective
From Local to Global: Revisiting Structured Pruning Paradigms for Large Language Models
Massively Multilingual Joint Segmentation and Glossing
CAR-bench: Evaluating the Consistency and Limit-Awareness of LLM Agents under Real-World Uncertainty
ViLL-E: Video LLM Embeddings for Retrieval
CxMP: A Linguistic Minimal-Pair Benchmark for Evaluating Constructional Understanding in Language Models
CIG: Measuring Conversational Information Gain in Deliberative Dialogues with Semantic Memory Dynamics'''.splitlines()
acl_url = 'https://2026.aclweb.org/program/best_papers/'
leads = [{'title': t, 'sourceUrl': acl_url, 'section': 'Best Papers' if i < 3 else 'Outstanding Papers',
          'identityStatus': 'unverified-title-lead', 'checkedAt': '2026-09-23'} for i, t in enumerate(acl_titles)]
keys = {title_key(x['title']): x for x in leads}
lead_matches = []
for aid, raw in db.execute('SELECT id,metadata FROM papers ORDER BY id'):
    m = json.loads(raw)
    lead = keys.get(title_key(m['title']))
    if not lead:
        continue
    in_year = START <= m.get('published', '') < END
    lead_matches.append({'arxivId': aid, 'published': m.get('published'), 'in2026Batch': in_year,
                         'title': m['title'], 'sourceUrl': acl_url, 'identityStatus': 'title-match-needs-author-verification'})
    if in_year:
        papers.setdefault(aid, {'metadata': m, 'categoryMatches': [], 'keywordQueryIds': [], 'externalLeads': []})
        papers[aid]['externalLeads'].append(lead)

missing_prior = []
primary_records = {r['arxivId']: r for r in json.loads((trial_path.parent / 'primary-records.json').read_text(encoding='utf-8'))['records']}
for aid, r in prior.items():
    if not aid.startswith('26'):
        continue
    if aid in papers:
        if r.get('evaluation'):
            papers[aid]['externalLeads'].append({'sourceUrl': r['evaluation']['evidenceUrl'], 'priorReviewId': r['index']})
    elif r.get('evaluation'):
        source = primary_records[aid]
        meta = source['meta']
        published = meta['citation_date'][0].replace('/', '-')
        assert START <= published < END
        papers[aid] = {
            'metadata': {'arxivId': aid, 'title': r['title'], 'authors': r['authors'], 'published': published,
                         'abstract': meta.get('citation_abstract', [''])[0], 'url': r['url'],
                         'version': r['reviewedVersion'], 'categories': [],
                         'provenance': 'Prior primary-records.json citation metadata; first-submission date verified'},
            'categoryMatches': [], 'keywordQueryIds': [],
            'externalLeads': [{'sourceUrl': r['evaluation']['evidenceUrl'], 'priorReviewId': r['index']}]}
    else:
        missing_prior.append(aid)

counts = collections.Counter()
eligible = []
lead_review_path = OUT / 'lead-relevance-reviews.json'
lead_reviews = {r['arxivId']: r for r in json.loads(lead_review_path.read_text(encoding='utf-8'))['records']}
with (OUT / 'queue.jsonl').open('w', encoding='utf-8') as stream:
    for aid, item in sorted(papers.items()):
        r = prior.get(aid)
        decision = 'unreviewed'
        if r:
            decision = 'eligible-prior-review-reconfirmed' if r['decision'] in ('include-new', 'update-existing') else 'prior-review-needs-evidence'
        elif aid in lead_reviews:
            decision = 'relevance-reviewed-needs-evidence'
        if decision == 'eligible-prior-review-reconfirmed':
            assert aid in ('2601.15165', '2602.01338')
            assert all(s['status'] == 'passed' for s in r['steps'])
            eligible.append(r)
        counts[decision] += 1
        record = {'arxivId': aid, **item, 'batchReviewStatus': decision,
                  'relevanceScreening': r['relevance']['status'] if r else lead_reviews.get(aid, {}).get('relevance', 'unreviewed'),
                  'leadReviewReference': 'lead-relevance-reviews.json#' + aid if aid in lead_reviews else None,
                  'priorReviewReference': {'path': str(trial_path.relative_to(ROOT)).replace('\\', '/'), 'index': r['index'], 'policyVersion': r['policyVersion']} if r else None,
                  'nextAction': 'See retained six-step evidence; no publication action in this experiment.' if decision.startswith('eligible') else 'Review relevance and obtain article-specific official evaluation/major-contribution evidence. Absence of a local match is not rejection.'}
        stream.write(json.dumps(record, ensure_ascii=False) + '\n')

write('eligible-prior-reviews.json', {'note': 'Two same-day prior reviews retained after rechecking official ICML results and arXiv landing pages. This is not the final selection count for the batch.', 'records': eligible})
write('external-leads.json', {'coverage': 'Partial: ACL 2026 Best Papers and Outstanding Papers title leads; special tracks not enumerated.', 'leads': leads, 'localTitleMatches': lead_matches, 'missingPriorIds': missing_prior})
write('keyword-plan-snapshot.json', {'source': str(plan_path.relative_to(ROOT)).replace('\\', '/'), 'sourceSha256': hashlib.sha256(plan_path.read_bytes()).hexdigest(), 'note': 'Existing concrete title/abstract queries reused as partial discovery evidence, not proof of complete keyword coverage.', 'queries': list(queries.values())})
summary = {
    'asOf': '2026-09-23', 'status': 'partial-queue-created-review-incomplete',
    'collectionPolicyVersion': '1.1', 'importancePolicyVersion': '1.2',
    'fromInclusive': START, 'beforeExclusive': END, 'dateField': 'published',
    'queuedDistinctArxivIds': len(papers),
    'categoryRouteCount': sum(bool(p['categoryMatches']) for p in papers.values()),
    'keywordRouteCount': sum(bool(p['keywordQueryIds']) for p in papers.values()),
    'externalLeadRouteCount': sum(bool(p['externalLeads']) for p in papers.values()),
    'statusCounts': dict(counts), 'confirmedEligibleSoFar': len(eligible),
    'finalSelectedCount': None, 'all2026ArxivCoverageComplete': False,
    'allQueuedPapersReviewed': False, 'rejectionCount': 0,
    'queueSha256': hashlib.sha256((OUT / 'queue.jsonl').read_bytes()).hexdigest(),
    'networkChecks': [{'endpoint': e, 'result': 'HTTP 406'} for e in ['https://arxiv.org/api/query', 'https://export.arxiv.org/api/query']],
    'limitations': ['Category/keyword enumeration is incomplete; both public API count attempts returned HTTP 406.',
                   'External awards and literature lead inventory is incomplete; a limited whitelist cannot prove absence of recognition.',
                   'Eleven new leads received abstract-level relevance review; other newly queued papers remain unreviewed.',
                   'Unreviewed and missing-evidence records are not rejected.',
                   'Cross-ID identity deduplication is incomplete; no final whole-year selection rate can be calculated.'],
    'publishedDataWritten': False
}
assert summary['categoryRouteCount'] == 44799
assert sum(counts.values()) == len(papers)
assert len(eligible) == 2
write('summary.json', summary)
write('validation.json', {'uniqueIds': len(papers), 'statusCountConserved': True, 'yearBoundsChecked': True,
                          'eligiblePriorReviewsHaveSixPassedSteps': True, 'finalCountLeftUnknown': True,
                          'allUnreviewedRetained': True, 'queueSha256': summary['queueSha256']})
print(json.dumps(summary, ensure_ascii=True))
