import json,pathlib,sqlite3
root=pathlib.Path(__file__).resolve().parents[2]
plan=json.loads((root/'proposals/arxiv-catalog/systematic-search-plan.json').read_text(encoding='utf-8'))
db=sqlite3.connect(root/plan['runDirectory']/'discovery.sqlite')
print(json.dumps({'uniquePapers':db.execute('SELECT COUNT(*) FROM papers').fetchone()[0],'queryHits':db.execute('SELECT COUNT(*) FROM hits').fetchone()[0],'statuses':dict(db.execute('SELECT status,COUNT(*) FROM queries GROUP BY status').fetchall()),'planned':len(plan['queries']),'recentPages':db.execute('SELECT query_id,partition,start,total,count FROM pages ORDER BY rowid DESC LIMIT 2').fetchall(),'errors':db.execute("SELECT id,details FROM queries WHERE status='incomplete'").fetchall()},ensure_ascii=False))
