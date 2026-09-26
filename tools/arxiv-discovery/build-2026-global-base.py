"""Evaluate every 2026 snapshot record using the complete Boolean keyword plan."""
import hashlib,json,pathlib,sqlite3,time
from arxiv_2026_rules import ROOT,OUT,CATEGORIES,Rules
HOME=ROOT/'.local/arxiv-2026-review';rules=Rules()
source=sqlite3.connect(HOME/'all-2026.sqlite');target=sqlite3.connect(HOME/'global-v3.sqlite')
target.execute('CREATE TABLE IF NOT EXISTS papers(id TEXT PRIMARY KEY,metadata TEXT,routes TEXT)')
count=0;selected=0;last=time.monotonic()
for aid,raw in source.execute('SELECT id,metadata FROM papers ORDER BY id'):
 m=json.loads(raw);count+=1;cats=sorted(CATEGORIES.intersection(m['categories'].split()));queries,atoms=rules.match(m['title'],m['abstract'])
 if cats or queries:
  record={'arxivId':aid,'title':' '.join(m['title'].split()),'abstract':m['abstract'],'authors':m['authors_parsed'],'published':m['published'],'categories':m['categories'].split(),'comments':m.get('comments'),'doi':m.get('doi'),'journal':m.get('journal-ref'),'url':'https://arxiv.org/abs/'+aid,'versionHistory':m['versions'],'provenance':'Cornell snapshot created 2026-09-19; enumerated entirely'}
  routes={'categoryMatches':cats,'keywordQueryIds':queries,'keywordAtoms':atoms,'externalSources':[]}
  target.execute('INSERT OR REPLACE INTO papers VALUES(?,?,?)',(aid,json.dumps(record,ensure_ascii=False),json.dumps(routes)));selected+=1
 if count%5000==0:target.commit()
 if time.monotonic()-last>20:print(json.dumps({'scanned':count,'selected':selected}),flush=True);last=time.monotonic()
target.commit();report={'scanned':count,'selected':selected,'complete':count==250450,'keywordPlanSha256':hashlib.sha256((OUT/'keyword-plan-global-v3.json').read_bytes()).hexdigest()}
(HOME/'global-v3-base.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
