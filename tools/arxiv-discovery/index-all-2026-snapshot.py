"""Retain all 2026 metadata for cross-field lead matching and delta reconciliation."""
import datetime,email.utils,json,pathlib,re,sqlite3,time,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[2]; HOME=ROOT/'.local/arxiv-2026-review'
db=sqlite3.connect(HOME/'all-2026.sqlite'); db.execute('CREATE TABLE IF NOT EXISTS papers(id TEXT PRIMARY KEY,metadata TEXT)')
count=0; scanned=0; last=time.monotonic()
with zipfile.ZipFile(HOME/'cornell-arxiv-20260919.zip') as z,z.open('arxiv-metadata-oai-snapshot.json') as f:
 for raw in f:
  scanned+=1
  if not re.match(rb'^\s*\{\s*"id"\s*:\s*"26',raw):continue
  m=json.loads(raw); v=min(m['versions'],key=lambda v:int(v['version'][1:]));stamp=email.utils.parsedate_to_datetime(v['created']).astimezone(datetime.timezone.utc).isoformat().replace('+00:00','Z')
  if not '2026-01-01'<=stamp<'2026-09-24':continue
  m['published']=stamp;db.execute('INSERT OR REPLACE INTO papers VALUES(?,?)',(m['id'],json.dumps(m,ensure_ascii=False))); count+=1
  if count%5000==0:db.commit()
  if time.monotonic()-last>20:print(json.dumps({'all2026Indexed':count}),flush=True);last=time.monotonic()
db.commit(); print(json.dumps({'all2026Indexed':count,'allSnapshotLinesRead':scanned,'complete':True}),flush=True)
(HOME/'all-2026-index.json').write_text(json.dumps({'count':count,'scanned':scanned,'complete':True}),encoding='utf-8')
