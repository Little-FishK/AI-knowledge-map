import importlib.util
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "tools" / "acl-anthology-discovery" / "audit-candidates.py"
SPEC = importlib.util.spec_from_file_location("acl_audit", SCRIPT)
MOD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MOD)


class AclAuditTests(unittest.TestCase):
    def test_enabled_mechanisms_are_exact(self):
        self.assertIn(("2025.acl", "Best Paper"), MOD.ENABLED)
        self.assertNotIn(("2025.acl", "Best Demo"), MOD.ENABLED)
        self.assertNotIn(("2025.findings", "Outstanding Paper"), MOD.ENABLED)

    def test_generic_words_do_not_trigger_keyword_route(self):
        text = "An AI model for language data"
        self.assertFalse(any(pattern.search(text) for pattern in MOD.KEYWORD_PATTERNS.values()))

    def test_specific_terms_trigger_keyword_route(self):
        text = "Mechanistic interpretability for sparse attention in large language models"
        hits = [name for name, pattern in MOD.KEYWORD_PATTERNS.items() if pattern.search(text)]
        self.assertIn("foundation-and-architecture", hits)
        self.assertIn("evaluation-reliability-and-safety", hits)
        self.assertIn("efficiency-and-infrastructure", hits)


if __name__ == "__main__":
    unittest.main()
