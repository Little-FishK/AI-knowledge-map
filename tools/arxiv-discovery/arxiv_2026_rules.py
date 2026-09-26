"""Versioned title/abstract Boolean discovery rules, evaluated against public metadata."""
import collections,itertools,json,pathlib,re,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'proposals/academic-importance/arxiv-2026-20260923'
CATEGORIES={'cs.AI','cs.LG','stat.ML','cs.CL','cs.CV','cs.NE','cs.MA','cs.RO'}
def normalize(s):return ' '.join(re.findall(r'\w+',unicodedata.normalize('NFKC',s or '').casefold()))
def parse(q):
 tokens=re.findall(r'(?:ti|abs|cat):(?:"[^"]+"|[^\s()]+)|\bAND\b|\bOR\b|\(|\)',q)
 pos=0
 def atom():
  nonlocal pos
  token=tokens[pos];pos+=1
  if token=='(':
   value=disj();assert tokens[pos]==')';pos+=1;return value
  assert ':' in token,token
  field,term=token.split(':',1);return ('atom',field,normalize(term.strip('"')))
 def conj():
  nonlocal pos
  value=atom()
  while pos<len(tokens) and tokens[pos]=='AND':pos+=1;value=('and',value,atom())
  return value
 def disj():
  nonlocal pos
  value=conj()
  while pos<len(tokens) and tokens[pos]=='OR':pos+=1;value=('or',value,conj())
  return value
 tree=disj();assert pos==len(tokens)
 # The old query's domain-disjunction contains category atoms. The collection
 # policy now explicitly searches all fields, so replace that exact OR subtree.
 def leaves(t):return [t] if t[0]=='atom' else leaves(t[1])+leaves(t[2])
 def only_or(t):return t[0]=='atom' or (t[0]=='or' and only_or(t[1]) and only_or(t[2]))
 def globalize(t):
  if t[0]=='atom':assert t[1]!='cat','Unexpected standalone category restriction';return t
  ls=leaves(t)
  if t[0]=='or' and only_or(t) and any(x[1]=='cat' for x in ls):
   assert {x[2] for x in ls if x[1]=='cat'}=={'cs','stat','eess','math oc'},'Unexpected domain restriction'
   return ('true',)
  return (t[0],globalize(t[1]),globalize(t[2]))
 return globalize(tree)
def dnf(tree):
 if tree[0]=='true':return [frozenset()]
 if tree[0]=='atom':return [frozenset([(tree[1],tree[2])])]
 a,b=dnf(tree[1]),dnf(tree[2])
 return a+b if tree[0]=='or' else [x|y for x in a for y in b]
class Rules:
 def __init__(self):
  plan=json.loads((OUT/'keyword-plan-snapshot.json').read_text(encoding='utf-8'))
  self.queries=[];self.clauses=[];self.by_atom=collections.defaultdict(list)
  for q in plan['queries']:
   clauses=sorted(set(dnf(parse(q['query']))),key=lambda c:sorted(c))
   assert all(clauses),'A keyword query became unconditional'
   self.queries.append({'id':q['id'],'originalQuery':q['query'],'anyOf':[sorted(c) for c in clauses]})
   for clause in clauses:
    cid=len(self.clauses);self.clauses.append((q['id'],len(clause)))
    for atom in clause:self.by_atom[atom].append(cid)
  terms=sorted({term for _,term in self.by_atom},key=len,reverse=True)
  self.pattern=re.compile(r'(?<!\w)(?=('+'|'.join(map(re.escape,terms))+r')(?!\w))')
  self.expand={t:[s for s in terms if (' '+s+' ') in (' '+t+' ')] for t in terms}
 def match(self,title,abstract):
  atoms=set()
  for field,text in [('ti',title),('abs',abstract)]:
   for hit in self.pattern.finditer(normalize(text)):
    for term in self.expand[hit.group(1)]:
     if (field,term) in self.by_atom:atoms.add((field,term))
  counts=collections.Counter();queries=set()
  for atom in atoms:
   for cid in self.by_atom[atom]:counts[cid]+=1
  for cid,count in counts.items():
   qid,need=self.clauses[cid]
   if count==need:queries.add(qid)
  return sorted(queries),sorted(atoms)
if __name__=='__main__':
 rules=Rules()
 assert 'node-transformer' in rules.match('A transformer','attention is used')[0]
 assert 'node-transformer' not in rules.match('Power transformer','electrical power grid')[0]
 assert 'node-attention' in rules.match('Self-attention in models','')[0]
 assert not rules.match('A historical essay','No research terms here')[0]
 (OUT/'keyword-plan-global-v3.json').write_text(json.dumps({'version':3,'scope':'All arXiv title and abstract metadata; no subject-domain filter','matching':'NFKC casefold; punctuation-separated whole-token phrases; preserve AND/OR and title/abstract fields; all overlapping matches retained','queries':rules.queries},ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'queries':len(rules.queries),'clauses':len(rules.clauses),'atoms':len(rules.by_atom),'validation':'passed'}))
