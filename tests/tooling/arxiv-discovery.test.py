import importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('harvest',ROOT/'tools/arxiv-discovery/harvest.py')
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
class DiscoveryTests(unittest.TestCase):
    def test_exclusion_preserves_dates_and_boolean_groups(self):
        q={'query':'ti:agent OR abs:agent','from':'202001010000','to':'202012312359'}
        prior={'query':'ti:LLM','from':'199101010000','to':'202609231633'}
        result=h.effective_query(q,'202006010000','202006302359',[prior])
        self.assertEqual(result,'((ti:agent OR abs:agent) AND submittedDate:[202006010000 TO 202006302359]) ANDNOT (((ti:LLM) AND submittedDate:[199101010000 TO 202609231633]))')
    def test_ids(self):
        self.assertEqual(h.canonical('http://arxiv.org/abs/1706.03762v7'),'1706.03762')
        self.assertEqual(h.canonical('https://arxiv.org/pdf/cs/9901001v2.pdf'),'cs/9901001')
    def test_empty_feed_without_count_is_not_completion(self):
        with self.assertRaisesRegex(ValueError,'no totalResults'):h.parse_feed(b'<feed xmlns="http://www.w3.org/2005/Atom"/>')
    def test_page_exhaustion(self):
        pages={0:(3,[{'arxivId':'a'},{'arxivId':'b'}]),2:(3,[{'arxivId':'c'}])}
        result=h.exhaust(lambda b,e,s:pages[s],'202001010000','202012312359')
        self.assertEqual(result['unique'],3)
    def test_repeated_page_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'Repeated IDs'):
            h.exhaust(lambda b,e,s:(3,[{'arxivId':'a'},{'arxivId':'b'}]),'202001010000','202012312359')
    def test_empty_later_page_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'Empty page'):
            h.exhaust(lambda b,e,s:(3,[{'arxivId':'a'}]if s==0 else[]),'202001010000','202012312359')
    def test_changed_total_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'Total changed'):
            h.exhaust(lambda b,e,s:(3,[{'arxivId':'a'}])if s==0 else(2,[{'arxivId':'b'}]),'202001010000','202012312359')
    def test_date_partitions_are_disjoint_and_complete(self):
        calls=[]
        def fetch(b,e,s):
            calls.append((b,e,s))
            if b=='202001010000'and e=='202001010003':return 4,[{'arxivId':'a'}]
            return 2,[{'arxivId':b+'a'},{'arxivId':b+'b'}]
        result=h.exhaust(fetch,'202001010000','202001010003',split_limit=2)
        self.assertEqual(calls[1:],[('202001010000','202001010001',0),('202001010002','202001010003',0)])
        self.assertEqual(result['total'],4)
    def test_partition_gap_is_rejected(self):
        def fetch(b,e,s,excluded=None):return (4,[{'arxivId':'a'}])if e=='202001010003'and b=='202001010000'else(1,[{'arxivId':b}])
        with self.assertRaisesRegex(ValueError,'Partition totals differ'):h.exhaust(fetch,'202001010000','202001010003',split_limit=2)
    def test_subminute_gap_is_fetched_with_disjoint_bridge(self):
        def fetch(b,e,s,excluded=None):
            if excluded:
                self.assertEqual(excluded,[('202001010000','202001010001'),('202001010002','202001010003')])
                return 1,[{'arxivId':'gap-paper'}]
            return (3,[{'arxivId':'a'}])if b=='202001010000'and e=='202001010003'else(1,[{'arxivId':b}])
        result=h.exhaust(fetch,'202001010000','202001010003',split_limit=2)
        self.assertEqual(sum(c['total']for c in result['children']),3)
        self.assertEqual(len(result['children']),3)
if __name__=='__main__':unittest.main()
