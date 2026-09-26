"""Resumable public category pagination; a failed page never certifies coverage."""
import argparse
import datetime
import gzip
import hashlib
import json
import pathlib
import sqlite3
import time
import urllib.request
from harvest import parse_feed

ROOT = pathlib.Path(__file__).resolve().parents[2]
HOME = ROOT / '.local/arxiv-2026-review'
HOME.mkdir(parents=True, exist_ok=True)
(HOME / 'responses').mkdir(exist_ok=True)
CATS = ['cs.AI', 'cs.LG', 'stat.ML', 'cs.CL', 'cs.CV', 'cs.NE', 'cs.MA', 'cs.RO']
parser = argparse.ArgumentParser()
parser.add_argument('--pages', type=int, default=30)
args = parser.parse_args()
db = sqlite3.connect(HOME / 'categories.sqlite')
db.executescript('''
CREATE TABLE IF NOT EXISTS papers(id TEXT PRIMARY KEY,metadata TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS hits(category TEXT,id TEXT,PRIMARY KEY(category,id));
CREATE TABLE IF NOT EXISTS pages(category TEXT,start INTEGER,count INTEGER,total INTEGER,url TEXT,sha256 TEXT,firstDate TEXT,lastDate TEXT,PRIMARY KEY(category,start));
CREATE TABLE IF NOT EXISTS states(category TEXT PRIMARY KEY,nextStart INTEGER,status TEXT,lastError TEXT);
''')
last_request = 0
requests = 0
for category in CATS:
    state = db.execute('SELECT nextStart,status FROM states WHERE category=?', (category,)).fetchone()
    if state and state[1] == 'complete-to-2026-boundary':
        continue
    start = state[0] if state else 0
    while requests < args.pages:
        url = f'https://export.arxiv.org/api/query?search_query=cat:{category}&start={start}&max_results=200&sortBy=submittedDate&sortOrder=descending'
        key = hashlib.sha256(url.encode()).hexdigest()
        cache = HOME / 'responses' / (key + '.xml.gz')
        try:
            if cache.exists():
                raw = gzip.decompress(cache.read_bytes())
            else:
                time.sleep(max(0, 3.1 - (time.monotonic() - last_request)))
                last_request = time.monotonic()
                requests += 1
                with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'AIKnowledgeMap-LibraryResearch/1.0 (single-connection metadata discovery)'}), timeout=35) as response:
                    raw = response.read()
                cache.write_bytes(gzip.compress(raw))
            total, returned_start, rows = parse_feed(raw)
            if returned_start != start or (not rows and start < total):
                raise ValueError('Pagination is inconsistent or empty before end')
            dates = [r['published'] for r in rows]
            if dates != sorted(dates, reverse=True):
                raise ValueError('Unexpected submission-date ordering')
            ids = {r['arxivId'] for r in rows}
            if len(ids) != len(rows):
                raise ValueError('Duplicate IDs within page')
            for r in rows:
                if category not in r['categories']:
                    raise ValueError('Response category mismatch')
                if '2026-01-01' <= r['published'] < '2026-09-24':
                    if db.execute('SELECT 1 FROM hits WHERE category=? AND id=?', (category, r['arxivId'])).fetchone():
                        raise ValueError('Repeated ID across pages; index shifted')
                    db.execute('INSERT OR REPLACE INTO papers VALUES(?,?)', (r['arxivId'], json.dumps(r, ensure_ascii=False)))
                    db.execute('INSERT INTO hits VALUES(?,?)', (category, r['arxivId']))
            db.execute('INSERT INTO pages VALUES(?,?,?,?,?,?,?,?)', (category, start, len(rows), total, url, hashlib.sha256(raw).hexdigest(), dates[0] if dates else None, dates[-1] if dates else None))
            start += len(rows)
            complete = bool(dates and dates[-1] < '2026-01-01') or start >= total
            status = 'complete-to-2026-boundary' if complete else 'partial'
            db.execute('INSERT OR REPLACE INTO states VALUES(?,?,?,NULL)', (category, start, status))
            db.commit()
            print(json.dumps({'category': category, 'nextStart': start, 'status': status, 'lastDate': dates[-1] if dates else None}), flush=True)
            if complete:
                break
        except Exception as exc:
            db.rollback()
            db.execute('INSERT OR REPLACE INTO states VALUES(?,?,?,?)', (category, start, 'blocked-page', str(exc)))
            db.commit()
            print(json.dumps({'category': category, 'start': start, 'error': str(exc)}), flush=True)
            break
    if requests >= args.pages:
        break
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'unique2026Ids': db.execute('SELECT COUNT(*) FROM papers').fetchone()[0],
          'states': [{'category': r[0], 'nextStart': r[1], 'status': r[2], 'lastError': r[3]} for r in db.execute('SELECT * FROM states')],
          'expectedCategories': CATS,
          'allCategoriesComplete': db.execute("SELECT COUNT(*) FROM states WHERE status='complete-to-2026-boundary'").fetchone()[0] == len(CATS),
          'importanceReviewComplete': False}
(HOME / 'coverage.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report), flush=True)
