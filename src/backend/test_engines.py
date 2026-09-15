"""
Unit Tests: Statistical Engine & CTD Regulatory Engine
======================================================
Verifies mathematical precision of PRR, ROR, Chi2, EBGM,
and eCTD XML structure parsing and gap analysis.
"""

import unittest
from statistical_engine import (
    ContingencyTable,
    solve_disproportionality,
    get_calculated_signals,
)
from ctd_engine import (
    parse_dossier_structure,
    evaluate_submission_readiness,
)
from ai_service import generate_bob_response


class TestStatisticalEngine(unittest.TestCase):

    def test_prr_and_ror_calculation(self):
        # A = 100, B = 1000, C = 200, D = 10000
        # Rate target = 100 / 1100 = 0.090909
        # Rate background = 200 / 10200 = 0.0196078
        # Expected PRR = 0.090909 / 0.0196078 = 4.636
        # Expected ROR = (100 * 10000) / (1000 * 200) = 1000000 / 200000 = 5.0
        table = ContingencyTable(a=100, b=1000, c=200, d=10000)
        metrics = solve_disproportionality(table)

        self.assertAlmostEqual(metrics.prr, 4.64, delta=0.05)
        self.assertAlmostEqual(metrics.ror, 5.0, delta=0.05)
        self.assertTrue(metrics.prr_ci_lower > 0)
        self.assertTrue(metrics.prr_ci_upper > metrics.prr)
        self.assertTrue(metrics.chi_square > 50)
        self.assertTrue(metrics.is_signal)
        self.assertEqual(metrics.signal_strength, "Critical")

    def test_null_or_zero_values(self):
        table = ContingencyTable(a=0, b=100, c=50, d=500)
        metrics = solve_disproportionality(table)
        self.assertEqual(metrics.prr, 0.0)
        self.assertFalse(metrics.is_signal)

    def test_calculated_signals_cohort(self):
        signals = get_calculated_signals()
        self.assertGreaterEqual(len(signals), 5)
        # Verify first signal has highest PRR
        self.assertGreaterEqual(signals[0]["prr"], signals[-1]["prr"])

    def test_drug_filter(self):
        signals = get_calculated_signals(drug_filter="Pembrolizumab")
        for s in signals:
            self.assertEqual(s["drug"], "Pembrolizumab")


class TestCTDEngine(unittest.TestCase):

    def test_xml_structure_parser(self):
        sample_xml = """
        <ectd:ectd xmlns:ectd="http://www.ich.org/ectd">
            <ectd:leaf ID="sec-2.5">
                <ectd:title>2.5 Clinical Overview</ectd:title>
            </ectd:leaf>
            <ectd:leaf ID="sec-5.3.5.3">
                <ectd:title>5.3.5.3 Integrated Summary of Safety</ectd:title>
            </ectd:leaf>
        </ectd:ectd>
        """
        sections = parse_dossier_structure(sample_xml, "index.xml")
        self.assertIn("2.5", sections)
        self.assertIn("5.3.5.3", sections)

    def test_dossier_evaluation(self):
        report = evaluate_submission_readiness()
        self.assertGreaterEqual(report.overall_score, 70)
        self.assertEqual(len(report.modules), 5)
        self.assertGreaterEqual(len(report.gaps), 3)


class TestAIService(unittest.TestCase):

    def test_module_5_query(self):
        resp = generate_bob_response("What are the blockers in Module 5?")
        self.assertIn("Module 5", resp["reply"])
        self.assertIn("5.3.5.3", resp["reply"])

    def test_prr_query(self):
        resp = generate_bob_response("Explain PRR for Pembrolizumab colitis")
        self.assertIn("PRR Score", resp["reply"])
        self.assertIn("3.84", resp["reply"])


if __name__ == "__main__":
    unittest.main()
