"""Enumerate every 2025-v1 arXiv record and build the frozen three-route base.

The Cornell snapshot is read completely. Category and keyword hits are stored;
external evaluation leads are merged in the finalizer rather than inferred here.
"""
import datetime,email.utils,json,pathlib,re,sqlite3,time,zipfile
from arxiv_2026_rules import ROOT,CATEGORIES,Rules

SOURCE=ROOT/'.local/arxiv-2026-review/cornell-arxiv-20260919.zip'
HOME=ROOT/'.local/arxiv-2025-review';HOME.mkdir(parents=True,exist_ok=True)
db=sqlite3.connect(HOME/'global-v3.sqlite')
db.execute('CREATE TABLE IF NOT EXISTS papers(id TEXT PRIMARY KEY,metadata TEXT,routes TEXT)')
rules=Rules();scanned=year_records=selected=0;last=time.monotonic()
with zipfile.ZipFile(SOURCE) as z,z.open('arxiv-metadata-oai-snapshot.json') as f:
 for raw in f:
  scanned+=1
  if not re.match(rb'^\s*\{\s*"id"\s*:\s*"25',raw):continue
  m=json.loads(raw);v=min(m['versions'],key=lambda x:int(x['version'][1:]));stamp=email.utils.parsedate_to_datetime(v['created']).astimezone(datetime.timezone.utc).isoformat().replace('+00:00','Z')
  if not '2025-01-01'<=stamp<'2026-01-01':continue
  year_records+=1;cats=sorted(CATEGORIES.intersection(m['categories'].split()));queries,atoms=rules.match(m['title'],m['abstract'])
  if cats or queries:
   meta={'arxivId':m['id'],'title':' '.join(m['title'].split()),'abstract':m['abstract'],'authors':m['authors_parsed'],'published':stamp,'categories':m['categories'].split(),'comments':m.get('comments'),'doi':m.get('doi'),'journal':m.get('journal-ref'),'url':'https://arxiv.org/abs/'+m['id'],'versionHistory':m['versions'],'provenance':'Cornell snapshot created 2026-09-19; enumerated entirely'}
   routes={'categoryMatches':cats,'keywordQueryIds':queries,'keywordAtoms':atoms,'externalSources':[]}
   db.execute('INSERT OR REPLACE INTO papers VALUES(?,?,?)',(m['id'],json.dumps(meta,ensure_ascii=False),json.dumps(routes)));selected+=1
  if selected and selected%5000==0:db.commit()
  if time.monotonic()-last>20:print(json.dumps({'snapshotLines':scanned,'all2025':year_records,'selected':selected}),flush=True);last=time.monotonic()
db.commit();report={'snapshotLinesRead':scanned,'all2025FirstSubmissions':year_records,'selected':selected,'complete':scanned==3173422,'dateRange':'[2025-01-01,2026-01-01) UTC'}
(HOME/'base-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps(report),flush=True)
