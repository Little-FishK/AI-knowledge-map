"""Resolve explicit citation leads after topic harvesting (one API connection)."""
import gzip,hashlib,json,pathlib,re,sqlite3,time,urllib.parse,urllib.request
from harvest import parse_feed
ROOT=pathlib.Path(__file__).resolve().parents[2]
plan=json.loads((ROOT/'proposals/arxiv-catalog/systematic-search-plan.json').read_text(encoding='utf-8'))
home=ROOT/plan['runDirectory'];db=sqlite3.connect(home/'discovery.sqlite')
if db.execute("SELECT COUNT(*)FROM queries WHERE status='running'").fetchone()[0]:
    raise SystemExit('Topic harvester is still running; do not open another API connection.')
refs=json.loads((ROOT/'proposals/arxiv-catalog/reference-search-seeds.json').read_text(encoding='utf-8'))['references']
db.executescript('CREATE INDEX IF NOT EXISTS hits_by_id ON hits(id); CREATE TABLE IF NOT EXISTS reference_hits(id TEXT PRIMARY KEY,seeds TEXT,status TEXT,receipt TEXT);')
pending=[];last=0
for r in refs:
    existing=db.execute('SELECT 1 FROM papers WHERE id=?',(r['arxivId'],)).fetchone()
    if existing:
        by_topic=db.execute('SELECT 1 FROM hits WHERE id=? LIMIT 1',(r['arxivId'],)).fetchone()
        if by_topic:
            db.execute('INSERT OR REPLACE INTO reference_hits VALUES(?,?,?,?)',(r['arxivId'],json.dumps(r['citingSeedIds']),'resolved-by-topic-query',None))
        elif not db.execute('SELECT 1 FROM reference_hits WHERE id=?',(r['arxivId'],)).fetchone():
            pending.append(r)
    else:pending.append(r)
db.commit()
def fetch(rows):
    global last
    url='https://export.arxiv.org/api/query?'+urllib.parse.urlencode({'id_list':','.join(r['arxivId']for r in rows),'max_results':len(rows)})
    file=home/'responses'/(hashlib.sha256(url.encode()).hexdigest()+'.xml.gz')
    if file.exists():raw=gzip.decompress(file.read_bytes())
    else:
        time.sleep(max(0,3.1-(time.monotonic()-last)))
        last=time.monotonic()
        with urllib.request.urlopen(url,timeout=90)as response:raw=response.read()
        file.write_bytes(gzip.compress(raw))
    _,_,metadata=parse_feed(raw)
    found={r['arxivId']:r for r in metadata}
    for r in rows:
        aid=r['arxivId'];paper=found.get(aid)
        if paper:db.execute('INSERT OR REPLACE INTO papers VALUES(?,?)',(aid,json.dumps(paper,ensure_ascii=False)))
        db.execute('INSERT OR REPLACE INTO reference_hits VALUES(?,?,?,?)',(aid,json.dumps(r['citingSeedIds']),'resolved-by-id'if paper else'not-returned',json.dumps({'url':url,'cache':file.name,'sha256':hashlib.sha256(raw).hexdigest()})))
    db.commit();print('Reference batch:',len(rows),'returned:',len(found),flush=True)
def resolve(rows):
    try:fetch(rows)
    except Exception as e:
        if len(rows)>1:
            mid=len(rows)//2;resolve(rows[:mid]);resolve(rows[mid:])
        else:
            r=rows[0];db.execute('INSERT OR REPLACE INTO reference_hits VALUES(?,?,?,?)',(r['arxivId'],json.dumps(r['citingSeedIds']),'unresolved-error',json.dumps({'error':str(e)})));db.commit()
for start in range(0,len(pending),100):resolve(pending[start:start+100])
result={'date':'2026-09-23','scope':'78篇已收录种子论文中显式arXiv标识的一跳参考线索；不是完整引文网络', 'total':len(refs),'statuses':dict(db.execute('SELECT status,COUNT(*) FROM reference_hits GROUP BY status').fetchall()),'unresolved':[{'arxivId':r[0],'status':r[1],'detail':json.loads(r[2])if r[2]else None}for r in db.execute("SELECT id,status,receipt FROM reference_hits WHERE status NOT LIKE 'resolved-%'")]}
(ROOT/'proposals/arxiv-catalog/reference-search-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False));db.close()
