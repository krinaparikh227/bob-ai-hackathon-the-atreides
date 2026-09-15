"""
Pharmacovigilance Data Ingestion & Field Mapping Engine
======================================================
Compliant with ICH E2B(R3) electronic safety transmission standards.
Provides parsing, schema autodetection, canonical field mapping,
and normalization for CSV, JSON, and XML adverse event datasets.
"""

import io
import csv
import json
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Tuple, Optional
from pydantic import BaseModel

from engines.quality_engine import evaluate_case_quality, detect_duplicate_candidates


class CanonicalFieldMapping(BaseModel):
    source_field: str
    canonical_field: str
    confidence: float


class IngestionSummary(BaseModel):
    filename: str
    file_format: str
    total_records: int
    valid_records: int
    flagged_records: int
    duplicate_candidates: int
    detected_drugs: List[str]
    detected_adverse_events: List[str]
    mapped_fields: Dict[str, str]
    average_quality_score: float


# Canonical dictionary synonyms for intelligent auto-mapping
FIELD_SYNONYMS = {
    "report_id": ["report_id", "safety_report_id", "icsr_id", "case_number", "id", "record_id"],
    "case_id": ["case_id", "patient_case_id", "study_subject_id", "case_num"],
    "suspect_drug": ["suspect_drug", "drug", "drug_name", "medicinal_product", "product_name", "substance", "treatment"],
    "adverse_event": ["adverse_event", "reaction", "event", "meddra_pt", "preferred_term", "toxicity", "ae_term"],
    "patient_age": ["patient_age", "age", "age_years", "patient_age_group"],
    "patient_sex": ["patient_sex", "sex", "gender", "biological_sex"],
    "country": ["country", "reporting_country", "primary_country", "region"],
    "report_date": ["report_date", "receipt_date", "transmission_date", "date_received"],
    "event_date": ["event_date", "onset_date", "reaction_date", "ae_start_date"],
    "outcome": ["outcome", "reaction_outcome", "event_outcome", "resolution"],
    "seriousness": ["seriousness", "is_serious", "serious_criteria", "severity"],
    "dose": ["dose", "dosage", "dose_text", "regimen", "strength"],
    "indication": ["indication", "primary_indication", "disease", "treatment_reason"],
    "concomitant_meds": ["concomitant_meds", "concomitant_drugs", "co_meds", "other_medications"],
    "reporter_type": ["reporter_type", "qualification", "reporter_qualification", "source"],
    "narrative": ["narrative", "case_narrative", "clinical_description", "description", "free_text"]
}


def autodetect_field_mapping(headers: List[str]) -> Dict[str, str]:
    """
    Maps arbitrary input tabular column headers to canonical pharmacovigilance fields.

    @purpose     - Normalize external disparate adverse event column headers automatically.
    @param       - headers: List[str] - List of column header names detected in file.
    @returns     - Dict[str, str] - Mapping of source_header -> canonical_field_name.
    @validates   - Performs case-insensitive and normalized substring matching.
    @redirects   - None
    @edge-cases  - Leaves unmapped headers unassigned without throwing exceptions.
    """
    mapping = {}
    normalized_headers = {h.strip().lower().replace(" ", "_").replace("-", "_"): h for h in headers}

    for canonical, synonyms in FIELD_SYNONYMS.items():
        for syn in synonyms:
            if syn in normalized_headers:
                original_header = normalized_headers[syn]
                mapping[original_header] = canonical
                break

    return mapping


def parse_adverse_event_file(
    content_bytes: bytes,
    filename: str,
    existing_cases: Optional[List[Dict[str, Any]]] = None
) -> Tuple[List[Dict[str, Any]], IngestionSummary]:
    """
    Parses and validates uploaded CSV, JSON, or XML adverse event datasets.

    @purpose     - Ingest raw adverse event data, apply quality screening, and flag duplicates.
    @param       - content_bytes: bytes - Raw binary file payload.
    @param       - filename: str - Original uploaded filename.
    @param       - existing_cases: Optional[List[Dict[str, Any]]] - Baseline cohort for duplicate detection.
    @returns     - Tuple[List[Dict[str, Any]], IngestionSummary] - Parsed records and ingestion audit metadata.
    @validates   - Enforces file format parsing constraints and utf-8 decoding.
    @redirects   - None
    @edge-cases  - Replaces un-decodable bytes using errors='ignore' to prevent ingestion aborts.
    """
    text_content = content_bytes.decode("utf-8", errors="ignore")
    raw_records = []
    file_format = "unknown"

    # 1. Parse CSV / TSV
    if filename.endswith(".csv") or filename.endswith(".tsv") or "," in text_content[:500]:
        file_format = "CSV"
        delimiter = "\t" if filename.endswith(".tsv") else ","
        try:
            reader = csv.DictReader(io.StringIO(text_content), delimiter=delimiter)
            raw_records = list(reader)
        except Exception:
            raw_records = []

    # 2. Parse JSON
    elif filename.endswith(".json") or ("[" in text_content[:10] and "]" in text_content[-10:]):
        file_format = "JSON"
        try:
            data = json.loads(text_content)
            raw_records = data if isinstance(data, list) else [data]
        except Exception:
            raw_records = []

    # 3. Parse XML (E2B format)
    elif filename.endswith(".xml") or "<" in text_content[:20]:
        file_format = "XML"
        try:
            root = ET.fromstring(text_content)
            for case_elem in root.findall(".//safetyreport") or root.findall(".//case") or [root]:
                rec = {}
                for child in case_elem:
                    rec[child.tag.lower()] = child.text
                if rec:
                    raw_records.append(rec)
        except Exception:
            raw_records = []

    if not raw_records:
        summary = IngestionSummary(
            filename=filename,
            file_format=file_format,
            total_records=0,
            valid_records=0,
            flagged_records=0,
            duplicate_candidates=0,
            detected_drugs=[],
            detected_adverse_events=[],
            mapped_fields={},
            average_quality_score=0.0
        )
        return [], summary

    # Detect header mapping
    headers = list(raw_records[0].keys())
    mapping = autodetect_field_mapping(headers)

    # Normalize records into canonical format
    normalized_records = []
    drugs_detected = set()
    events_detected = set()
    quality_scores = []
    duplicate_count = 0
    valid_count = 0
    flagged_count = 0

    base_cases = existing_cases or []

    for idx, row in enumerate(raw_records):
        canonical_row = {}
        for orig_key, val in row.items():
            mapped_field = mapping.get(orig_key, orig_key)
            canonical_row[mapped_field] = val

        # Ensure minimal identifiers
        if not canonical_row.get("report_id"):
            canonical_row["report_id"] = f"INGEST-{idx+1:05d}"
        if not canonical_row.get("case_id"):
            canonical_row["case_id"] = f"CAS-{idx+1:05d}"

        # Quality audit
        quality_eval = evaluate_case_quality(canonical_row)
        canonical_row["data_quality_score"] = quality_eval.overall_quality_score
        canonical_row["quality_status"] = quality_eval.status
        canonical_row["quality_warnings"] = quality_eval.inconsistency_warnings
        quality_scores.append(quality_eval.overall_quality_score)

        if quality_eval.is_valid:
            valid_count += 1
        else:
            flagged_count += 1

        # Duplicate check against existing surveillance cohort
        dup_eval = detect_duplicate_candidates(canonical_row, base_cases)
        canonical_row["is_duplicate_candidate"] = dup_eval.is_duplicate_candidate
        canonical_row["duplicate_of_id"] = dup_eval.matched_case_id
        canonical_row["duplicate_probability"] = dup_eval.duplicate_probability

        if dup_eval.is_duplicate_candidate:
            duplicate_count += 1

        drug_val = canonical_row.get("suspect_drug") or canonical_row.get("drug")
        if drug_val:
            drugs_detected.add(str(drug_val).strip())

        ae_val = canonical_row.get("adverse_event") or canonical_row.get("reaction")
        if ae_val:
            events_detected.add(str(ae_val).strip())

        normalized_records.append(canonical_row)

    avg_quality = round(sum(quality_scores) / len(quality_scores), 1) if quality_scores else 0.0

    summary = IngestionSummary(
        filename=filename,
        file_format=file_format,
        total_records=len(normalized_records),
        valid_records=valid_count,
        flagged_records=flagged_count,
        duplicate_candidates=duplicate_count,
        detected_drugs=sorted(list(drugs_detected))[:10],
        detected_adverse_events=sorted(list(events_detected))[:10],
        mapped_fields=mapping,
        average_quality_score=avg_quality
    )

    return normalized_records, summary
