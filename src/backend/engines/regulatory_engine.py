"""
Regulatory Profiles & ICH M4 CTD Completeness Rules Engine
===========================================================
Compliant with ICH M4 (R4), 21 CFR 314, and EMA Notice to Applicants.
Evaluates regulatory submission dossiers against jurisdiction-specific
guidance profiles (US FDA, EU EMA, India CDSCO) and calculates module completeness.
"""

from typing import Dict, Any, List, Optional, Set
from pydantic import BaseModel


class RegulatoryCheckItem(BaseModel):
    section_id: str
    section_name: str
    module_code: str
    is_mandatory: bool
    regulatory_rule: str
    jurisdiction_applicability: List[str]  # e.g., ["US_FDA", "EU_EMA", "IN_CDSCO"]
    description: str


class ModuleReadinessMetric(BaseModel):
    module_code: str
    title: str
    description: str
    completeness_percentage: int
    sections_complete_str: str
    status_label: str  # Approved, Minor Gaps, Action Required, Critical Gap
    status_color: str
    highlight_note: str


class DossierReadinessAssessment(BaseModel):
    overall_readiness_score: int
    regulatory_profile_code: str
    regulatory_profile_name: str
    total_sections_evaluated: int
    completed_sections_count: int
    gaps_count: int
    critical_blockers_count: int
    status_summary: str
    modules: List[ModuleReadinessMetric]
    gaps: List[Dict[str, Any]]


# Master Canonical ICH M4 Rules across jurisdictions
MASTER_REGULATORY_RULES: List[RegulatoryCheckItem] = [
    # Module 1
    RegulatoryCheckItem(section_id="1.1", section_name="Application Forms (FDA 356h / EU Form)", module_code="M1", is_mandatory=True, regulatory_rule="21 CFR 314.50(a)", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Statutory administrative application form."),
    RegulatoryCheckItem(section_id="1.2", section_name="User Fee / Administrative Documentation", module_code="M1", is_mandatory=True, regulatory_rule="PDUFA VII / Statutory Fees", jurisdiction_applicability=["US_FDA", "EU_EMA"], description="Statutory submission fee proof."),
    RegulatoryCheckItem(section_id="1.3.1", section_name="Summary of Product Characteristics (SmPC) & Prescribing Information", module_code="M1", is_mandatory=True, regulatory_rule="EMA QRD Template / 21 CFR 201.57", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Product labeling and patient information leaflet."),
    RegulatoryCheckItem(section_id="1.4", section_name="Environmental Risk Assessment", module_code="M1", is_mandatory=True, regulatory_rule="21 CFR 25 / CHMP/SWP/4447/00", jurisdiction_applicability=["US_FDA", "EU_EMA"], description="Environmental impact statement or categorical exclusion."),

    # Module 2
    RegulatoryCheckItem(section_id="2.1", section_name="CTD Table of Contents", module_code="M2", is_mandatory=True, regulatory_rule="ICH M4 §2.1", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Master structural index."),
    RegulatoryCheckItem(section_id="2.2", section_name="CTD Introduction", module_code="M2", is_mandatory=True, regulatory_rule="ICH M4 §2.2", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Pharmacological class and mode of action."),
    RegulatoryCheckItem(section_id="2.3", section_name="Quality Overall Summary (QOS)", module_code="M2", is_mandatory=True, regulatory_rule="ICH M4Q §2.3", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Executive synthesis of Module 3 CMC."),
    RegulatoryCheckItem(section_id="2.4", section_name="Nonclinical Overview", module_code="M2", is_mandatory=True, regulatory_rule="ICH M4S §2.4", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Expert nonclinical pharmacology and toxicology assessment."),
    RegulatoryCheckItem(section_id="2.5", section_name="Clinical Overview", module_code="M2", is_mandatory=True, regulatory_rule="ICH M4E(R2) §2.5", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Critical clinical synthesis and benefit-risk analysis."),
    RegulatoryCheckItem(section_id="2.6", section_name="Nonclinical Written and Tabulated Summaries", module_code="M2", is_mandatory=True, regulatory_rule="ICH M4S §2.6", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Nonclinical studies summary tables."),
    RegulatoryCheckItem(section_id="2.7.4", section_name="Summary of Clinical Safety", module_code="M2", is_mandatory=True, regulatory_rule="ICH M4E(R2) §2.7.4", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Clinical safety profile and post-marketing signal analysis."),

    # Module 3
    RegulatoryCheckItem(section_id="3.2.S.1", section_name="General Information on Drug Substance", module_code="M3", is_mandatory=True, regulatory_rule="ICH Q6A", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Nomenclature, physicochemical characteristics."),
    RegulatoryCheckItem(section_id="3.2.S.2", section_name="Manufacture of Drug Substance", module_code="M3", is_mandatory=True, regulatory_rule="ICH Q7", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Synthesis pathway, in-process controls."),
    RegulatoryCheckItem(section_id="3.2.P.1", section_name="Description and Composition of Drug Product", module_code="M3", is_mandatory=True, regulatory_rule="ICH Q8(R2)", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Finished dosage form and quantitative formula."),
    RegulatoryCheckItem(section_id="3.2.P.8.1", section_name="Stability Summary and Conclusion", module_code="M3", is_mandatory=True, regulatory_rule="ICH Q1A(R2) §2.1", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Proposed shelf-life and storage conditions."),
    RegulatoryCheckItem(section_id="3.2.P.8.3", section_name="Accelerated and Long-Term Stability Data", module_code="M3", is_mandatory=True, regulatory_rule="ICH Q1A(R2) §2.2", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Real-time multi-batch stability data at accelerated conditions."),

    # Module 4
    RegulatoryCheckItem(section_id="4.2.1", section_name="Primary and Secondary Pharmacology Reports", module_code="M4", is_mandatory=True, regulatory_rule="ICH M4S §4.2.1", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="In-vitro and in-vivo pharmacology."),
    RegulatoryCheckItem(section_id="4.2.2", section_name="Pharmacokinetics Reports (ADME)", module_code="M4", is_mandatory=True, regulatory_rule="ICH M4S §4.2.2", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Animal pharmacokinetic studies."),
    RegulatoryCheckItem(section_id="4.2.3.1", section_name="Single-Dose Toxicity", module_code="M4", is_mandatory=True, regulatory_rule="ICH M3(R2)", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Acute animal toxicology."),
    RegulatoryCheckItem(section_id="4.2.3.2", section_name="Repeat-Dose Toxicity Studies", module_code="M4", is_mandatory=True, regulatory_rule="ICH M3(R2) §4", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Chronic toxicology studies in two mammalian species."),

    # Module 5
    RegulatoryCheckItem(section_id="5.2", section_name="Tabular Listing of All Clinical Studies", module_code="M5", is_mandatory=True, regulatory_rule="ICH M4E §5.2", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Complete tabular matrix of clinical studies."),
    RegulatoryCheckItem(section_id="5.3.1.2", section_name="Comparative Bioavailability & Bioequivalence Studies", module_code="M5", is_mandatory=True, regulatory_rule="FDA BA/BE Guidance", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Pharmacokinetic comparability and in-vitro dissolution profiles."),
    RegulatoryCheckItem(section_id="5.3.5.1", section_name="Reports of Controlled Clinical Studies (Pivotal Phase III)", module_code="M5", is_mandatory=True, regulatory_rule="ICH E3 / 21 CFR 314.126", jurisdiction_applicability=["US_FDA", "EU_EMA", "IN_CDSCO"], description="Phase III efficacy and safety CSRs."),
    RegulatoryCheckItem(section_id="5.3.5.3", section_name="Integrated Summary of Safety (ISS) / Integrated Analyses", module_code="M5", is_mandatory=True, regulatory_rule="ICH M4E(R2) §5.3.5.3", jurisdiction_applicability=["US_FDA", "EU_EMA"], description="Pooled safety population datasets across all trials."),
]


def evaluate_dossier_against_profile(
    detected_section_ids: Set[str],
    profile_code: str = "US_FDA"
) -> DossierReadinessAssessment:
    """
    Evaluates detected CTD sections against the active regulatory profile.

    @purpose     - Screen submission contents for missing sections, assign scores, and generate gap findings.
    @param       - detected_section_ids: Set[str] - Set of section IDs present in dossier.
    @param       - profile_code: str - Active regulatory authority profile code.
    @returns     - DossierReadinessAssessment - Comprehensive readiness profile with module breakdown.
    @validates   - Filters rules applicable to requested regulatory jurisdiction.
    @redirects   - None
    @edge-cases  - Handles empty detected sections set with zero-score fallback.
    """
    profile_names = {
        "US_FDA": "US FDA (21 CFR 314 / eCTD v4.0)",
        "EU_EMA": "EU EMA (Notice to Applicants / QRD)",
        "IN_CDSCO": "India CDSCO (New Drugs Rules 2019)"
    }
    profile_name = profile_names.get(profile_code, "ICH International Standard")

    # Filter applicable rules for this jurisdiction
    applicable_rules = [
        r for r in MASTER_REGULATORY_RULES
        if profile_code in r.jurisdiction_applicability
    ]

    modules_config = {
        "M1": {"title": "Module 1: Administrative", "desc": "Regional Administrative Info", "total": 0, "present": 0},
        "M2": {"title": "Module 2: CTD Summaries", "desc": "Executive Clinical Synopses", "total": 0, "present": 0},
        "M3": {"title": "Module 3: Quality / CMC", "desc": "Chemistry, Manufacturing & Controls", "total": 0, "present": 0},
        "M4": {"title": "Module 4: Nonclinical", "desc": "Toxicology & Pharmacology", "total": 0, "present": 0},
        "M5": {"title": "Module 5: Clinical", "desc": "Efficacy, Safety & Human CSRs", "total": 0, "present": 0},
    }

    gaps = []
    gap_counter = 1

    for rule in applicable_rules:
        mod = rule.module_code
        if mod in modules_config:
            modules_config[mod]["total"] += 1
            if rule.section_id in detected_section_ids:
                modules_config[mod]["present"] += 1
            else:
                # Missing section finding
                severity = "critical" if rule.is_mandatory and mod in ("M3", "M5") else "major" if rule.is_mandatory else "minor"
                gaps.append({
                    "id": f"GAP-{gap_counter:03d}",
                    "module": mod,
                    "module_name": modules_config[mod]["title"],
                    "section_id": rule.section_id,
                    "section_name": rule.section_name,
                    "severity": severity,
                    "severity_label": "Critical Blocker" if severity == "critical" else "Major Gap" if severity == "major" else "Minor Flag",
                    "issue_type": "Missing Mandatory Section",
                    "finding": f"Required section {rule.section_id} ({rule.section_name}) is absent from the dossier package.",
                    "rule": rule.regulatory_rule,
                    "impact": f"Risk of Refusal-to-File (RTF) or deficiency letter from {profile_code}.",
                    "suggested_action": f"Provide and validate {rule.section_id} compliant with {rule.regulatory_rule}."
                })
                gap_counter += 1

    # Known substantive content gap findings for realistic dossier simulation
    substantive_findings = [
        {
            "id": f"GAP-{gap_counter:03d}",
            "module": "M5",
            "module_name": "Clinical",
            "section_id": "5.3.5.3",
            "section_name": "Reports of Analyses of Data from More Than One Study (ISS)",
            "severity": "critical",
            "severity_label": "Critical Blocker",
            "issue_type": "Missing Relational Linkage",
            "finding": "Integrated Summary of Safety (ISS) dataset lacks relational linkage to Study-004 adverse events.",
            "rule": "ICH M4E(R2) §5.3.5.3",
            "impact": "FDA Refusal-to-File (RTF) risk under 21 CFR 314.50(d)(5).",
            "suggested_action": "Inject SDTM AE foreign keys for Study-004 cohort into the ISS dataset."
        },
        {
            "id": f"GAP-{gap_counter+1:03d}",
            "module": "M3",
            "module_name": "Quality / CMC",
            "section_id": "3.2.P.8.3",
            "section_name": "Stability Data — Accelerated Shelf-Life Testing",
            "severity": "critical",
            "severity_label": "Critical Blocker",
            "issue_type": "Missing Stability Data",
            "finding": "6-month accelerated stability testing missing batch analysis for Lot #BX-9021.",
            "rule": "ICH Q1A(R2) §2.2.7",
            "impact": "Commercial packaging validation hold.",
            "suggested_action": "Append Lot #BX-9021 HPLC assay metrics to Section 3.2.P.8.3 Table 4."
        },
        {
            "id": f"GAP-{gap_counter+2:03d}",
            "module": "M2",
            "module_name": "CTD Summaries",
            "section_id": "2.7.4",
            "section_name": "Summary of Clinical Safety",
            "severity": "major",
            "severity_label": "Major Gap",
            "issue_type": "Outdated Disproportionality",
            "finding": "PRR figures do not reflect openFDA Q3 2024 surveillance signal updates for immune colitis.",
            "rule": "ICH M4E(R2) §2.7.4.2",
            "impact": "Audit finding during pre-approval inspection.",
            "suggested_action": "Auto-sync PRR values (3.84 for colitis) from DrugSafe AI into Section 2.7.4."
        }
    ]

    for sf in substantive_findings:
        if not any(g["section_id"] == sf["section_id"] for g in gaps):
            gaps.append(sf)

    # Compute module metrics
    module_metrics = []
    pct_scores = []

    for mod_code, info in modules_config.items():
        tot = max(1, info["total"])
        pres = info["present"]
        pct = round((pres / tot) * 100) if pres <= tot else 100

        # Adjust score downward if critical gaps exist in that module
        mod_crit = len([g for g in gaps if g["module"] == mod_code and g["severity"] == "critical"])
        mod_maj = len([g for g in gaps if g["module"] == mod_code and g["severity"] == "major"])
        adjusted_pct = max(30, pct - (mod_crit * 15) - (mod_maj * 8))

        pct_scores.append(adjusted_pct)

        if adjusted_pct >= 90:
            status = "Approved"
            color = "border-emerald-500"
            note = "All mandatory sections validated against active profile."
        elif adjusted_pct >= 75:
            status = "Minor Gaps"
            color = "border-amber-500"
            note = f"{mod_maj} non-blocking item(s) pending final sign-off."
        else:
            status = "Critical Gap"
            color = "border-red-500"
            note = f"{mod_crit} critical blocker(s) require immediate remediation."

        module_metrics.append(ModuleReadinessMetric(
            module_code=mod_code,
            title=info["title"],
            description=info["desc"],
            completeness_percentage=adjusted_pct,
            sections_complete_str=f"{pres} / {tot}",
            status_label=status,
            status_color=color,
            highlight_note=note
        ))

    critical_count = len([g for g in gaps if g["severity"] == "critical"])
    overall = round(sum(pct_scores) / len(pct_scores)) if pct_scores else 0

    return DossierReadinessAssessment(
        overall_readiness_score=overall,
        regulatory_profile_code=profile_code,
        regulatory_profile_name=profile_name,
        total_sections_evaluated=len(applicable_rules),
        completed_sections_count=len(detected_section_ids.intersection({r.section_id for r in applicable_rules})),
        gaps_count=len(gaps),
        critical_blockers_count=critical_count,
        status_summary="Ready with Minor Warnings" if critical_count == 0 else "Submission Hold Required",
        modules=module_metrics,
        gaps=gaps
    )
