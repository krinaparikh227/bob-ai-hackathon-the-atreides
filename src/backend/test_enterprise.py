"""
Enterprise Test Suite: Pharmacovigilance & Regulatory Systems
=============================================================
Verifies:
  - Disproportionality metrics (PRR, ROR, Chi2, EBGM) with known contingency tables
  - Edge cases: zero counts, low observation thresholds, division by zero
  - Data quality scoring and multi-factor duplicate case detection
  - Multi-format ingestion and schema auto-mapping
  - Clinical NLP narrative extraction and MedDRA terminology normalization
  - Regulatory profile validation and CTD module completeness scoring
  - Cross-document factual conflict detection
  - Evidence traceability graph lineage
  - 21 CFR Part 11 audit trail event persistence
  - Authentication, password hashing, and token signature validation
"""

import sys
import os
import unittest

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from engines.signal_engine import (
    ContingencyTable,
    PRRAlgorithm,
    RORAlgorithm,
    ChiSquareAlgorithm,
    EBGMAlgorithm,
    compute_all_metrics,
    calculate_prioritization_score,
    generate_signal_explainability,
)
from engines.quality_engine import evaluate_case_quality, detect_duplicate_candidates
from engines.ingestion_engine import parse_adverse_event_file, autodetect_field_mapping
from engines.nlp_engine import normalize_medical_term, extract_entities_from_narrative
from engines.regulatory_engine import evaluate_dossier_against_profile
from engines.consistency_engine import analyze_cross_document_consistency
from engines.traceability_engine import build_traceability_graph
from engines.audit_engine import record_audit_event, query_audit_trail
from auth.security import hash_password, verify_password, create_access_token, decode_access_token
from db.session import SessionLocal, Base, engine


class TestStatisticalEngine(unittest.TestCase):
    """
    Validates mathematical accuracy and boundary protection of statistical disproportionality algorithms.
    """

    def test_prr_and_ror_known_contingency(self):
        # A = 100, B = 1000, C = 200, D = 10000
        # Rate target = 100 / 1100 = 0.090909
        # Rate background = 200 / 10200 = 0.0196078
        # Expected PRR = 0.090909 / 0.0196078 = 4.636
        # Expected ROR = (100 * 10000) / (1000 * 200) = 5.0
        table = ContingencyTable(a=100, b=1000, c=200, d=10000)
        metrics = compute_all_metrics(table)

        self.assertAlmostEqual(metrics["prr"], 4.64, delta=0.05)
        self.assertAlmostEqual(metrics["ror"], 5.0, delta=0.05)
        self.assertTrue(metrics["prr_ci_lower"] > 0)
        self.assertTrue(metrics["prr_ci_upper"] > metrics["prr"])
        self.assertTrue(metrics["chi_square"] > 50)
        self.assertTrue(metrics["is_signal"])
        self.assertEqual(metrics["severity"], "Critical")

    def test_zero_count_boundary_safety(self):
        # A = 0 (No target drug reports)
        table = ContingencyTable(a=0, b=100, c=50, d=500)
        metrics = compute_all_metrics(table)
        self.assertEqual(metrics["prr"], 0.0)
        self.assertEqual(metrics["ror"], 0.0)
        self.assertFalse(metrics["is_signal"])

    def test_low_observation_evans_gating(self):
        # A = 2 (< 3 reports required by Evans' / FDA criteria)
        table = ContingencyTable(a=2, b=10, c=1, d=500)
        metrics = compute_all_metrics(table)
        self.assertFalse(metrics["is_signal"])

    def test_prioritization_score_breakdown(self):
        breakdown = calculate_prioritization_score(
            prr=4.2,
            case_count=180,
            serious_count=40,
            fatal_count=3,
            velocity_pct=42.0
        )
        self.assertGreaterEqual(breakdown.overall_score, 50.0)
        self.assertIn(breakdown.priority_tier, ("Medium", "High", "Critical"))
        self.assertTrue(breakdown.prr_component > 0)

    def test_explainability_narrative_completeness(self):
        table = ContingencyTable(a=184, b=14210, c=1240, d=372400)
        metrics = compute_all_metrics(table)
        exp = generate_signal_explainability(
            drug_name="Pembrolizumab",
            adverse_event="Immune-mediated colitis",
            metrics=metrics
        )
        self.assertIn("what_detected", exp)
        self.assertIn("statistical_strength", exp)
        self.assertIn("potential_confounders", exp)
        self.assertIn("recommended_next_step", exp)


class TestDataQualityAndDuplicates(unittest.TestCase):
    """
    Validates data quality scoring and duplicate candidate detection.
    """

    def test_perfect_quality_case(self):
        record = {
            "report_id": "ICSR-9999",
            "case_id": "CAS-9999",
            "suspect_drug": "Pembrolizumab",
            "reaction": "Colitis",
            "patient_age": 55.0,
            "patient_sex": "F",
            "country": "US",
            "report_date": "2024-05-10",
            "event_date": "2024-05-01",
            "outcome": "Recovered",
            "is_fatal": False
        }
        res = evaluate_case_quality(record)
        self.assertTrue(res.is_valid)
        self.assertGreaterEqual(res.overall_quality_score, 90)
        self.assertEqual(len(res.critical_errors), 0)

    def test_corrupted_case_quality(self):
        record = {
            "report_id": None,
            "suspect_drug": "",
            "reaction": "",
            "patient_age": 145.0,  # Impossible age
            "report_date": "2024-01-01",
            "event_date": "2024-05-01",  # Report date precedes event date
            "is_fatal": True,
            "outcome": "Recovered completely"  # Fatal vs recovered conflict
        }
        res = evaluate_case_quality(record)
        self.assertFalse(res.is_valid)
        self.assertLess(res.overall_quality_score, 50)
        self.assertGreater(len(res.critical_errors), 0)
        self.assertGreater(len(res.inconsistency_warnings), 0)

    def test_duplicate_candidate_detection(self):
        existing = [{
            "report_id": "ICSR-BASE-01",
            "case_id": "CAS-BASE-01",
            "suspect_drug": "Pembrolizumab",
            "reaction": "Myocarditis",
            "patient_age": 71.0,
            "patient_sex": "M",
            "country": "DE",
            "narrative_text": "Elderly patient died from heart failure following lung cancer immunotherapy."
        }]

        candidate = {
            "report_id": "ICSR-DUP-01",
            "case_id": "CAS-BASE-01-COPY",
            "suspect_drug": "Pembrolizumab",
            "reaction": "Myocarditis",
            "patient_age": 71.0,
            "patient_sex": "M",
            "country": "DE",
            "narrative_text": "Patient died in hospital after heart problems following immunotherapy."
        }

        dup_res = detect_duplicate_candidates(candidate, existing)
        self.assertTrue(dup_res.is_duplicate_candidate)
        self.assertEqual(dup_res.matched_case_id, "ICSR-BASE-01")
        self.assertGreaterEqual(dup_res.duplicate_probability, 0.70)


class TestIngestionAndNLP(unittest.TestCase):
    """
    Validates CSV/JSON file ingestion and clinical NLP entity extraction.
    """

    def test_csv_adverse_event_parsing(self):
        csv_data = (
            "report_id,drug,reaction,age,gender,report_date\n"
            "REP-001,Pembrolizumab,Colitis,65,Female,2024-06-01\n"
            "REP-002,Semaglutide,Gastroparesis,45,Female,2024-06-02\n"
        ).encode("utf-8")

        records, summary = parse_adverse_event_file(csv_data, "test_cases.csv")
        self.assertEqual(summary.total_records, 2)
        self.assertEqual(summary.valid_records, 2)
        self.assertIn("Pembrolizumab", summary.detected_drugs)

    def test_meddra_normalization(self):
        norm = normalize_medical_term("patient experienced severe colitis")
        self.assertEqual(norm.normalized_pt, "Immune-mediated colitis")
        self.assertEqual(norm.normalized_soc, "Gastrointestinal disorders")
        self.assertEqual(norm.coding_level, "PT")

    def test_clinical_narrative_extraction(self):
        narrative = (
            "A 68-year-old female receiving Pembrolizumab 200 mg IV developed severe colitis "
            "12 days post Cycle 2. Hospitalized for intravenous corticosteroids."
        )
        entities = extract_entities_from_narrative(narrative)
        self.assertIsNotNone(entities.suspect_product)
        self.assertEqual(entities.suspect_product.value, "Pembrolizumab")
        self.assertIsNotNone(entities.patient_age)
        self.assertEqual(entities.patient_age.value, "68")
        self.assertIsNotNone(entities.patient_sex)
        self.assertEqual(entities.patient_sex.value, "Female")


class TestRegulatoryAndConsistencyEngines(unittest.TestCase):
    """
    Validates CTD structural audits, cross-document conflicts, and evidence graph.
    """

    def test_dossier_profile_evaluation(self):
        detected = {"1.1", "1.2", "2.1", "2.2", "2.5", "3.2.S.1", "5.2"}
        assessment = evaluate_dossier_against_profile(detected, profile_code="US_FDA")
        self.assertGreater(assessment.total_sections_evaluated, 15)
        self.assertEqual(len(assessment.modules), 5)
        self.assertGreater(assessment.gaps_count, 0)

    def test_cross_document_conflict_detection(self):
        conflicts = analyze_cross_document_consistency()
        self.assertGreaterEqual(len(conflicts), 2)
        critical_conflicts = [c for c in conflicts if c.severity == "Critical"]
        self.assertTrue(len(critical_conflicts) >= 1)

    def test_traceability_graph_generation(self):
        graph = build_traceability_graph("SIG-101")
        self.assertGreaterEqual(len(graph.nodes), 6)
        self.assertGreaterEqual(len(graph.edges), 5)
        self.assertTrue(any(n.node_type == "Requirement" for n in graph.nodes))


class TestSecurityAndAudit(unittest.TestCase):
    """
    Validates authentication tokens, password hashing, and 21 CFR Part 11 audit logging.
    """

    def test_password_hashing_and_verification(self):
        pwd = "EnterpriseSecurePassword2026!"
        hashed = hash_password(pwd)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("WrongPassword!", hashed))

    def test_jwt_token_flow(self):
        payload = {"sub": "analyst@pharma-safety.org", "role": "pharmacovigilance_analyst"}
        token = create_access_token(payload)
        decoded = decode_access_token(token)
        self.assertEqual(decoded["sub"], "analyst@pharma-safety.org")
        self.assertEqual(decoded["role"], "pharmacovigilance_analyst")

    def test_audit_event_persistence(self):
        db = SessionLocal()
        try:
            event = record_audit_event(
                db=db,
                actor_email="qa_test@pharma-safety.org",
                action="TEST_ACTION",
                resource_type="TEST_RESOURCE",
                reason="Verification unit test"
            )
            db.commit()

            logs = query_audit_trail(db=db, actor_filter="qa_test@pharma-safety.org")
            self.assertTrue(len(logs) >= 1)
            self.assertEqual(logs[0].action, "TEST_ACTION")
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
