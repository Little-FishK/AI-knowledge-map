"""Build an evidence lookup, without treating lookup misses as completed reviews."""
import collections,json,pathlib,re,sqlite3
ROOT=pathlib.Path(__file__).resolve().parents[2]
HOME=ROOT/'.local/arxiv-2026-review'
OUT=ROOT/'proposals/academic-importance/arxiv-2026-20260923'
db=sqlite3.connect(HOME/'snapshot.sqlite')
claims=[]
rx=re.compile(r'(?:best|outstanding|distinguished|test[ -]of[ -]time|classic)\s+(?:student\s+)?paper(?:\s+award)?|(?:paper|research)\s+award',re.I)
for aid,raw in db.execute('SELECT id,metadata FROM papers ORDER BY id'):
    m=json.loads(raw)
    pieces=[{'field':k,'text':m.get(k)} for k in ('comments','journal','title','abstract') if m.get(k) and rx.search(m[k])]
    if pieces:claims.append({'arxivId':aid,'title':m['title'],'published':m['published'],'claims':pieces,'status':'unverified-author-metadata-claim'})
(OUT/'metadata-award-leads.json').write_text(json.dumps({'note':'Automated claim detection only. Claims can refer to related work, nominations or nonqualifying awards. No pass and no rejection.', 'records':claims},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'metadataAwardClaims':len(claims),'categoryRoute':db.execute("SELECT COUNT(*) FROM routes WHERE categories!='[]'").fetchone()[0],'keywordRoute':db.execute("SELECT COUNT(*) FROM routes WHERE keywordMatches!='[]'").fetchone()[0]}))
for c in claims:print(json.dumps({'id':c['arxivId'],'title':c['title'],'claims':[{**p,'text':p['text'][:350]} for p in c['claims']]},ensure_ascii=False))
