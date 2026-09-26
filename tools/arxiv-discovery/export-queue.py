"""Export every discovered ID for editorial review, without approving any paper."""
import collections, datetime as dt, json, pathlib, sqlite3

ROOT=pathlib.Path(__file__).resolve().parents[2]
plan=json.loads((ROOT/'proposals/arxiv-catalog/systematic-search-plan.json').read_text(encoding='utf-8'))
home=ROOT/plan['runDirectory']
db=sqlite3.connect(home/'discovery.sqlite')
db.execute('BEGIN') # Consistent snapshot even while discovery is running.
existing=json.loads((ROOT/'proposals/arxiv-catalog/records.json').read_text(encoding='utf-8'))['records']
decisions={r['arxivId']:r for r in existing}
members=collections.defaultdict(list)
for query,aid in db.execute('SELECT query_id,id FROM hits ORDER BY query_id'):
    members[aid].append(query)
refs={}
citations={}
if db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='reference_hits'").fetchone():
    refs={aid:json.loads(seeds)for aid,seeds in db.execute('SELECT id,seeds FROM reference_hits')}
if db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='citation_leads'").fetchone():
    citations={aid:json.loads(relations)for aid,relations in db.execute('SELECT id,relations FROM citation_leads')}
counts=collections.Counter()
target=home/'review-queue.jsonl'
temporary=home/'review-queue.jsonl.tmp'
with temporary.open('w',encoding='utf-8')as out:
    for aid,raw in db.execute('SELECT id,metadata FROM papers ORDER BY id'):
        record=decisions.get(aid)
        decision=record['decision']if record else'unreviewed'
        counts[decision]+=1
        row={'paper':json.loads(raw),'matchedQueries':members[aid],
             'queryMembershipMeaning':'Direct retrieval memberships only; later queries may reuse a complete earlier set without downloading or retagging its members.',
             'citingSeedIds':refs.get(aid,[]),'editorialDecision':decision,
             'citationIndexRelations':citations.get(aid,[]),
             'reviewRecord':'proposals/arxiv-catalog/records.json'if record else None,
             'duplicateReview':'existing-decision'if record else'canonical-id-only; contribution overlap not reviewed',
             'publishedByThisSearch':False}
        out.write(json.dumps(row,ensure_ascii=False)+'\n')
temporary.replace(target)
states=dict(db.execute('SELECT status,COUNT(*)FROM queries GROUP BY status'))
summary={'schemaVersion':1,'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),
         'planRevision':plan['revision'],'uniqueCandidates':sum(counts.values()),
         'editorialDecisions':dict(counts),'queryStates':states,
         'plannedQueries':len(plan['queries']),
         'allQueryTraversalsComplete':states.get('complete',0)==len(plan['queries']),
         'allCandidatesReviewed':counts.get('unreviewed',0)==0,
         'queue':target.relative_to(ROOT).as_posix(),
         'notes':['Every discovered canonical ID is exported; no top-N cutoff.',
                  'Query membership suggests relevance; it does not establish importance or a correct node assignment.',
                  'Version/cross-list duplicates are unified by ID; distinct IDs may still describe overlapping contributions.',
                  'Existing decisions are preserved. This exporter cannot admit or publish new material.']}
(ROOT/'proposals/arxiv-catalog/review-queue-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
db.close();print(json.dumps(summary,ensure_ascii=False))
