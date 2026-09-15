"""
Pharmacovigilance Data Quality & Duplicate Detection Engine
===========================================================
Compliant with E2B(R3) clinical data standards and CIOMS guidelines.
Provides deterministic data quality assessment (completeness, validity, consistency)
and multi-layered fuzzy duplicate case candidate detection.
"""

import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class DataQualityAssessment(BaseModel):
    record_id: str
    overall_quality_score: int  # 0 to 100
    is_valid: bool
    missing_critical_fields: List[str]
    missing_optional_fields: List[str]
    inconsistency_warnings: List[str]
    critical_errors: List[str]
    status: str  # Validated, Flagged, Incomplete


class DuplicateDetectionResult(BaseModel):
    candidate_case_id: str
    matched_case_id: Optional[str]
    is_duplicate_candidate: bool
    duplicate_probability: float  # 0.0 to 1.0
    matching_fields: List[str]
    supporting_evidence: str
    review_status: str  # Pending Review, Confirmed Duplicate, Dismissed


def evaluate_case_quality(record: Dict[str, Any]) -> DataQualityAssessment:
    """
    Evaluates an adverse event case record across completeness, validity, and consistency.

    @purpose     - Screen safety records to compute numerical quality score and identify missing data.
    @param       - record: Dict[str, Any] - Raw adverse event case dictionary.
    @returns     - DataQualityAssessment - Detailed quality breakdown with score (0-100).
    @validates   - Checks presence of critical fields (drug, reaction, report_id).
    @redirects   - None
    @edge-cases  - Handles null, None, and empty string fields without exceptions.
    """
    score = 100
    critical_errors = []
    missing_critical = []
    missing_optional = []
    warnings = []

    rec_id = str(record.get("report_id") or record.get("case_id") or "UNKNOWN")

    # 1. Critical Field Completeness
    drug = record.get("drug") or record.get("suspect_drug") or record.get("product_name")
    if not drug or not str(drug).strip():
        missing_critical.append("suspect_drug")
        critical_errors.append("Missing primary suspect drug identification.")
        score -= 30

    reaction = record.get("reaction") or record.get("adverse_event") or record.get("meddra_pt")
    if not reaction or not str(reaction).strip():
        missing_critical.append("reaction")
        critical_errors.append("Missing primary adverse event reaction term.")
        score -= 30

    if not record.get("report_id") and not record.get("case_id"):
        missing_critical.append("report_id")
        critical_errors.append("Missing mandatory regulatory report identification number.")
        score -= 20

    # 2. Optional Demographics & Clinical Completeness
    age = record.get("patient_age")
    if age is None or age == "":
        missing_optional.append("patient_age")
        score -= 5
    else:
        try:
            age_float = float(age)
            if age_float < 0 or age_float > 125:
                warnings.append(f"Impossible patient age value detected: {age_float} years.")
                score -= 10
        except (ValueError, TypeError):
            warnings.append(f"Malformed patient age format: {age}")
            score -= 5

    sex = record.get("patient_sex") or record.get("gender")
    if not sex:
        missing_optional.append("patient_sex")
        score -= 5
    elif str(sex).upper() not in ("M", "F", "MALE", "FEMALE", "UNKNOWN", "OTHER"):
        warnings.append(f"Non-standard patient sex code: {sex}")
        score -= 2

    # 3. Temporal Consistency
    rep_date = str(record.get("report_date") or "")
    evt_date = str(record.get("event_date") or "")

    date_regex = r"^\d{4}-\d{2}-\d{2}$"
    if rep_date and not re.match(date_regex, rep_date[:10]):
        warnings.append(f"Report date format does not comply with ISO 8601 (YYYY-MM-DD): {rep_date}")
        score -= 5
    if evt_date and not re.match(date_regex, evt_date[:10]):
        warnings.append(f"Event date format does not comply with ISO 8601 (YYYY-MM-DD): {evt_date}")
        score -= 5

    if rep_date and evt_date and len(rep_date) >= 10 and len(evt_date) >= 10:
        if rep_date[:10] < evt_date[:10]:
            warnings.append(f"Chronological inversion: Report date ({rep_date}) precedes event onset date ({evt_date}).")
            score -= 15

    # 4. Outcome and Seriousness Consistency
    is_fatal = record.get("is_fatal")
    outcome = str(record.get("outcome") or "").lower()
    if is_fatal is True and "recovered" in outcome:
        warnings.append("Conflicting clinical status: Record marked as fatal but outcome specified as recovered.")
        score -= 15

    final_score = max(0, min(100, score))
    is_valid = len(critical_errors) == 0 and final_score >= 50

    if final_score >= 85 and is_valid:
        status_label = "Validated"
    elif is_valid:
        status_label = "Flagged"
    else:
        status_label = "Incomplete"

    return DataQualityAssessment(
        record_id=rec_id,
        overall_quality_score=final_score,
        is_valid=is_valid,
        missing_critical_fields=missing_critical,
        missing_optional_fields=missing_optional,
        inconsistency_warnings=warnings,
        critical_errors=critical_errors,
        status=status_label
    )


def detect_duplicate_candidates(
    candidate: Dict[str, Any],
    existing_cases: List[Dict[str, Any]],
    similarity_threshold: float = 0.70
) -> DuplicateDetectionResult:
    """
    Screens an adverse event case against existing surveillance cohorts to identify potential duplicates.

    @purpose     - Prevent double-counting in disproportionality statistics by flagging candidate duplicates.
    @param       - candidate: Dict[str, Any] - Incoming candidate case record.
    @param       - existing_cases: List[Dict[str, Any]] - Surveillance database case population.
    @param       - similarity_threshold: float - Cutoff probability for duplicate candidate classification.
    @returns     - DuplicateDetectionResult - Match determination and field evidence breakdown.
    @validates   - Compares identifiers, active substances, adverse events, and demographic attributes.
    @redirects   - None
    @edge-cases  - Handles empty existing cases list by returning negative match.
    """
    cand_id = str(candidate.get("report_id") or candidate.get("case_id") or "CANDIDATE")
    cand_drug = str(candidate.get("drug") or candidate.get("suspect_drug") or "").strip().lower()
    cand_ae = str(candidate.get("reaction") or candidate.get("adverse_event") or "").strip().lower()
    cand_age = candidate.get("patient_age")
    cand_sex = str(candidate.get("patient_sex") or "").strip().upper()
    cand_country = str(candidate.get("country") or "").strip().upper()
    cand_narrative = str(candidate.get("narrative_text") or candidate.get("narrative") or "").strip().lower()

    best_match_id = None
    best_probability = 0.0
    best_matching_fields = []
    best_evidence = "No significant matches found in current surveillance cohort."

    for existing in existing_cases:
        exist_id = str(existing.get("report_id") or existing.get("case_id") or "")
        if exist_id == cand_id:
            continue

        match_score = 0.0
        matching_fields = []

        # 1. Exact or closely matching Case ID check
        if cand_id and exist_id and (cand_id in exist_id or exist_id in cand_id):
            match_score += 0.40
            matching_fields.append("case_id_pattern")

        # 2. Suspect Drug Match
        exist_drug = str(existing.get("drug") or existing.get("suspect_drug") or "").strip().lower()
        if cand_drug and exist_drug and (cand_drug in exist_drug or exist_drug in cand_drug):
            match_score += 0.25
            matching_fields.append("suspect_drug")

        # 3. Adverse Event Reaction Match
        exist_ae = str(existing.get("reaction") or existing.get("adverse_event") or "").strip().lower()
        if cand_ae and exist_ae and (cand_ae in exist_ae or exist_ae in cand_ae):
            match_score += 0.25
            matching_fields.append("adverse_event")

        # 4. Patient Demographics Match
        exist_age = existing.get("patient_age")
        if cand_age is not None and exist_age is not None:
            try:
                if abs(float(cand_age) - float(exist_age)) <= 1.0:
                    match_score += 0.15
                    matching_fields.append("patient_age")
            except (ValueError, TypeError):
                pass

        exist_sex = str(existing.get("patient_sex") or "").strip().upper()
        if cand_sex and exist_sex and cand_sex == exist_sex:
            match_score += 0.10
            matching_fields.append("patient_sex")

        exist_country = str(existing.get("country") or "").strip().upper()
        if cand_country and exist_country and cand_country == exist_country:
            match_score += 0.05
            matching_fields.append("country")

        # 5. Narrative Keyword Overlap
        exist_narrative = str(existing.get("narrative_text") or existing.get("narrative") or "").strip().lower()
        if cand_narrative and exist_narrative:
            cand_words = set(re.findall(r"\b\w{4,}\b", cand_narrative))
            exist_words = set(re.findall(r"\b\w{4,}\b", exist_narrative))
            if cand_words and exist_words:
                overlap = len(cand_words.intersection(exist_words)) / max(1, len(cand_words))
                if overlap >= 0.50:
                    match_score += 0.20
                    matching_fields.append("narrative_content")

        normalized_prob = min(1.0, match_score)
        if normalized_prob > best_probability:
            best_probability = normalized_prob
            best_match_id = exist_id
            best_matching_fields = matching_fields
            best_evidence = f"Matching criteria: {', '.join(matching_fields)} with similarity confidence of {round(normalized_prob * 100)}%."

    is_duplicate = (best_probability >= similarity_threshold)
    return DuplicateDetectionResult(
        candidate_case_id=cand_id,
        matched_case_id=best_match_id if is_duplicate else None,
        is_duplicate_candidate=is_duplicate,
        duplicate_probability=round(best_probability, 2),
        matching_fields=best_matching_fields if is_duplicate else [],
        supporting_evidence=best_evidence if is_duplicate else "No duplicate candidates detected.",
        review_status="Pending Review" if is_duplicate else "Unique Record"
    )
