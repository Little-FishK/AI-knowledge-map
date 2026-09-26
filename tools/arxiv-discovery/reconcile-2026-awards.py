"""Match official ACL award metadata to arXiv identities; matches remain leads."""
import collections,hashlib,json,pathlib,re,sqlite3,unicodedata,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[2];HOME=ROOT/'.local/arxiv-2026-review';OUT=ROOT/'proposals/academic-importance/arxiv-2026-20260923'
def key(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
index=collections.defaultdict(dict)
for path in [ROOT/'.local/arxiv-discovery/20260923-r2/discovery.sqlite',HOME/'snapshot.sqlite',HOME/'all-2026.sqlite']:
 if not path.exists():continue
 db=sqlite3.connect(path)
 for aid,raw in db.execute('SELECT id,metadata FROM papers'):
  m=json.loads(raw);index[key(m['title'])][aid]=m
 db.close()
xml=HOME/'2026.acl.xml';root=ET.parse(xml).getroot();rows=[]
for v in root.findall('volume'):
 for p in v.findall('paper'):
  award=p.find('award')
  if award is None:continue
  title=''.join(p.find('title').itertext());identifier=f"{root.attrib['id']}-{v.attrib['id']}.{p.attrib['id']}"
  matches=[]
  for aid,m in index[key(title)].items():matches.append({'arxivId':aid,'title':m['title'],'published':m.get('published'),'authors':m.get('authors_parsed',m.get('authors')),'in2026':bool('2026-01-01'<=m.get('published','')<'2026-09-24'),'matchStatus':'normalized-title-match-needs-identity-check'})
  rows.append({'title':title,'anthologyId':identifier,'url':f'https://aclanthology.org/{identifier}/','authors':[(a.findtext('first','')+' '+a.findtext('last','')).strip() for a in p.findall('author')],'award':award.attrib['name'],'hasAwardCitation':bool((award.text or '').strip()),'arxivMatches':matches})
report={'sourceUrl':'https://raw.githubusercontent.com/acl-org/acl-anthology/master/data/xml/2026.acl.xml','sourceSha256':hashlib.sha256(xml.read_bytes()).hexdigest(),'checkedAt':'2026-09-23','note':'Official identity and award discovery, including special tracks. No automatic mechanism qualification or major-contribution decision. Whole XML retained in local cache.','records':rows}
(OUT/'acl-anthology-award-leads.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
for r in rows:print(json.dumps({k:r[k] for k in ('title','anthologyId','award','hasAwardCitation','arxivMatches')},ensure_ascii=False))
