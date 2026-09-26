"""Stream every snapshot line; select 2026 by v1 date, then apply reproducible routes."""
import collections
import datetime
import email.utils
import hashlib
import json
import pathlib
import re
import sqlite3
import time
import unicodedata
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
HOME = ROOT / '.local/arxiv-2026-review'
archive_path = HOME / 'cornell-arxiv-20260919.zip'
plan_path = ROOT / 'proposals/academic-importance/arxiv-2026-20260923/keyword-plan-snapshot.json'
plan = json.loads(plan_path.read_text(encoding='utf-8'))
CATS = {'cs.AI', 'cs.LG', 'stat.ML', 'cs.CL', 'cs.CV', 'cs.NE', 'cs.MA', 'cs.RO'}

def normalize(text):
    return ' '.join(re.findall(r'\w+', unicodedata.normalize('NFKC', text).casefold()))

terms = collections.defaultdict(set)
for q in plan['queries']:
    for term in q['terms']:
        terms[normalize(term)].add(q['id'])
pattern = re.compile(r'(?<!\w)(?:' + '|'.join(re.escape(t) for t in sorted(terms, key=len, reverse=True)) + r')(?!\w)')
db = sqlite3.connect(HOME / 'snapshot.sqlite')
db.executescript('''
CREATE TABLE IF NOT EXISTS papers(id TEXT PRIMARY KEY,metadata TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS routes(id TEXT PRIMARY KEY,categories TEXT,keywordMatches TEXT);
CREATE TABLE IF NOT EXISTS run(key TEXT PRIMARY KEY,value TEXT);
''')
if db.execute("SELECT 1 FROM run WHERE key='complete'").fetchone():
    print('Snapshot already completely imported; see snapshot-import.json')
    raise SystemExit(0)
lines = 0
all_2026 = 0
selected = 0
dates = []
last = time.monotonic()
with zipfile.ZipFile(archive_path) as archive, archive.open('arxiv-metadata-oai-snapshot.json') as stream:
    for raw in stream:
        lines += 1
        # IDs of recent papers encode announcement year. Historical IDs cannot have a 2026 v1.
        if not re.match(rb'^\s*\{\s*"id"\s*:\s*"26', raw):
            continue
        m = json.loads(raw)
        first = min(m['versions'], key=lambda x: int(x['version'][1:]))
        stamp = email.utils.parsedate_to_datetime(first['created']).astimezone(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
        if not '2026-01-01' <= stamp < '2026-09-24':
            continue
        all_2026 += 1
        dates.append(stamp)
        cats = sorted(CATS.intersection(m['categories'].split()))
        text_fields = [normalize(m['title']), normalize(m['abstract'])]
        matched = sorted(set(x.group() for field in text_fields for x in pattern.finditer(field)))
        if not cats and not matched:
            continue
        selected += 1
        record = {'arxivId': m['id'], 'title': ' '.join(m['title'].split()), 'abstract': m['abstract'],
                  'authors': m.get('authors_parsed', m.get('authors')), 'published': stamp,
                  'updated': m.get('update_date'), 'categories': m['categories'].split(),
                  'doi': m.get('doi'), 'journal': m.get('journal-ref'), 'comments': m.get('comments'),
                  'versionHistory': m['versions'], 'url': 'https://arxiv.org/abs/' + m['id'],
                  'provenance': 'Cornell public arXiv snapshot file created 2026-09-19'}
        db.execute('INSERT OR REPLACE INTO papers VALUES(?,?)', (m['id'], json.dumps(record, ensure_ascii=False)))
        db.execute('INSERT OR REPLACE INTO routes VALUES(?,?,?)', (m['id'], json.dumps(cats), json.dumps(matched)))
        if selected % 2000 == 0:
            db.commit()
        if time.monotonic() - last > 20:
            print(json.dumps({'snapshotLinesRead': lines, 'all2026': all_2026, 'selected': selected}), flush=True)
            last = time.monotonic()
db.execute("INSERT OR REPLACE INTO run VALUES('complete','true')")
db.commit()
report = {'sourceArchive': str(archive_path.relative_to(ROOT)).replace('\\', '/'),
          'allSnapshotLinesRead': lines, 'all2026RecordsInSnapshot': all_2026,
          'selectedDistinctArxivIds': db.execute('SELECT COUNT(*) FROM papers').fetchone()[0],
          'minimumFirstSubmission': min(dates), 'maximumFirstSubmission': max(dates),
          'snapshotFullyTraversed': True, 'snapshotCrcCheckedByZipReader': True,
          'keywordSemantics': 'NFKC/casefold, punctuation/whitespace to token separators, whole-token phrase matching independently in title and abstract; longest overlapping phrase wins for provenance, union membership unchanged.',
          'keywordTerms': len(terms), 'keywordPlanSha256': hashlib.sha256(plan_path.read_bytes()).hexdigest(),
          'categoryRoute': sorted(CATS), 'allArxivThroughSeptember23Complete': False,
          'note': 'Snapshot enumeration is complete; post-snapshot submissions still need a delta and external leads still need matching. No importance decision.'}
(HOME / 'snapshot-import.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report), flush=True)
