import importlib.util
import pathlib
import sys
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "tools" / "openreview-discovery" / "audit-iclr-proceedings.py"
spec = importlib.util.spec_from_file_location("iclr_audit", SCRIPT)
audit = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = audit
spec.loader.exec_module(audit)


class IclrAuditTests(unittest.TestCase):
    def test_parser_keeps_title_authors_and_hash(self):
        source = """
        <a title="paper title" href="/paper_files/paper/2024/hash/abc-Abstract-Conference.html">A &amp; B</a>
        <span class="paper-authors">One Author, Two Author</span>
        """
        papers = audit.parse_proceedings(2024, source)
        self.assertEqual(len(papers), 1)
        self.assertEqual(papers[0].proceedings_id, "abc")
        self.assertEqual(papers[0].title, "A & B")
        self.assertEqual(papers[0].authors, ["One Author", "Two Author"])

    def test_title_matching_ignores_terminal_period_and_case(self):
        self.assertEqual(
            audit.normalize_title("Learning Dynamics of LLM Finetuning."),
            audit.normalize_title("learning dynamics of llm finetuning"),
        )

    def test_acceptance_reconciliation_is_explicit(self):
        self.assertEqual(
            sum(audit.ACCEPTED_TOTALS.values()) - sum(audit.PROCEEDINGS_TOTALS.values()),
            5,
        )

    def test_only_ten_award_winners_advance_to_full_assessment(self):
        self.assertEqual(sum(len(x["titles"]) for x in audit.AWARDS.values()), 10)


if __name__ == "__main__":
    unittest.main()
