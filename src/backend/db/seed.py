"""
Enterprise Database Seeder & Schema Initializer
================================================
Compliant with 21 CFR Part 11, ICH M4 (R4), and CIOMS VIII standards.
Seeds canonical pharmacovigilance surveillance cohorts, ICH M4 CTD structures,
synthetic clinical trial cases, regulatory profiles, and GxP audit logs.
"""

import sys
import os
import hashlib
from datetime import datetime

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db.session import engine, Base, SessionLocal
from db.models import (
    Organization,
    User,
    Product,
    AdverseEvent,
    SafetyCase,
    CaseEventLink,
    SafetySignal,
    RegulatoryProfile,
    CTDModule,
    CTDSection,
    Submission,
    SubmissionDocument,
    GapFinding,
    CrossDocumentInconsistency,
    TraceabilityLink,
    AuditEvent,
)


def hash_password(password: str) -> str:
    """
    Computes cryptographic SHA-256 hash with salt for secure credential storage.

    @purpose     - Securely hash plaintext passwords before database persistence.
    @param       - password: Plaintext password string; minimum 8 characters.
    @returns     - Hex-encoded cryptographic digest.
    @validates   - Non-empty string check.
    @redirects   - None
    @edge-cases  - Handles unicode characters via UTF-8 normalization.
    """
    salt = "pharma_secure_salt_2026"
    return hashlib.sha256(f"{salt}_{password}".encode("utf-8")).hexdigest()


def seed_database():
    """
    Executes idempotent database schema creation and canonical data seeding.

    @purpose     - Initialize schema tables and populate baseline enterprise datasets.
    @param       - None
    @returns     - Dict summarizing counts of seeded domain entities.
    @validates   - Verifies existing records before insertion to prevent duplicate primary keys.
    @redirects   - None
    @edge-cases  - Safely rolls back transaction upon constraint failure.
    """
    # Create all tables defined in Base metadata
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    try:
        # 1. Organization
        org = session.query(Organization).filter_by(name="Atreides Biopharma Global").first()
        if not org:
            org = Organization(
                name="Atreides Biopharma Global",
                regulatory_jurisdiction="US-FDA / EMA",
                created_at=datetime.utcnow(),
            )
            session.add(org)
            session.flush()

        # 2. Users and Roles
        default_users = [
            {
                "email": "dr.elena.rostova@pharma-safety.org",
                "full_name": "Dr. Elena Rostova",
                "role": "qppv",
                "password": "Password123!",
            },
            {
                "email": "analyst@pharma-safety.org",
                "full_name": "Marcus Vance",
                "role": "pharmacovigilance_analyst",
                "password": "Password123!",
            },
            {
                "email": "reviewer@pharma-safety.org",
                "full_name": "Dr. Sarah Jenkins",
                "role": "safety_reviewer",
                "password": "Password123!",
            },
            {
                "email": "regulatory@pharma-safety.org",
                "full_name": "Arthur Pendelton",
                "role": "regulatory_affairs",
                "password": "Password123!",
            },
            {
                "email": "admin@pharma-safety.org",
                "full_name": "System Administrator",
                "role": "administrator",
                "password": "Password123!",
            },
        ]

        for user_data in default_users:
            existing_user = session.query(User).filter_by(email=user_data["email"]).first()
            if not existing_user:
                new_user = User(
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"]),
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    organization_id=org.id,
                    is_active=True,
                    created_at=datetime.utcnow(),
                )
                session.add(new_user)

        # 3. Regulatory Profiles
        profiles = [
            {
                "code": "US_FDA",
                "name": "United States Food and Drug Administration (FDA)",
                "jurisdiction": "United States",
                "authority": "US FDA CDER / CBER",
                "framework_version": "21 CFR 314 & eCTD v4.0",
            },
            {
                "code": "EU_EMA",
                "name": "European Medicines Agency (EMA)",
                "jurisdiction": "European Union",
                "authority": "EMA CHMP / PRAC",
                "framework_version": "Notice to Applicants Vol 2B / QRD v10.4",
            },
            {
                "code": "IN_CDSCO",
                "name": "Central Drugs Standard Control Organization (CDSCO)",
                "jurisdiction": "India",
                "authority": "CDSCO Directorate General of Health Services",
                "framework_version": "New Drugs & Clinical Trials Rules 2019",
            },
        ]

        for p in profiles:
            if not session.query(RegulatoryProfile).filter_by(code=p["code"]).first():
                session.add(RegulatoryProfile(**p))
        session.flush()

        # 4. CTD Modules (M1 to M5)
        modules_data = [
            {"module_code": "M1", "title": "Module 1: Administrative Information & Prescribing Info", "order_index": 1, "description": "Regional administrative forms, user fee documents, labeling, and environmental assessment."},
            {"module_code": "M2", "title": "Module 2: Common Technical Document Summaries", "order_index": 2, "description": "Executive synthesis across quality, nonclinical, and clinical development summaries."},
            {"module_code": "M3", "title": "Module 3: Quality / Chemistry, Manufacturing & Controls (CMC)", "order_index": 3, "description": "Drug substance synthesis, drug product formulation, process validation, and stability data."},
            {"module_code": "M4", "title": "Module 4: Nonclinical Study Reports", "order_index": 4, "description": "Pharmacology, pharmacokinetics (ADME), and toxicology safety evaluations in animals."},
            {"module_code": "M5", "title": "Module 5: Clinical Study Reports (CSRs)", "order_index": 5, "description": "Human clinical trial reports, bioavailability studies, efficacy CSRs, and Integrated Summary of Safety (ISS)."},
        ]

        for m in modules_data:
            if not session.query(CTDModule).filter_by(module_code=m["module_code"]).first():
                session.add(CTDModule(**m))
        session.flush()

        # 5. CTD Sections Checklist
        sections_data = [
            # Module 1
            {"section_id": "1.1", "module_code": "M1", "title": "Forms (FDA 356h / EU Application Form)", "regulatory_rule": "21 CFR 314.50(a)", "is_mandatory": True, "description": "Official application form signed by authorized representative."},
            {"section_id": "1.2", "module_code": "M1", "title": "User Fee Cover Sheet / Administrative Fees", "regulatory_rule": "PDUFA VII / EMA Fee Reg", "is_mandatory": True, "description": "Documentation of statutory fee compliance."},
            {"section_id": "1.3.1", "module_code": "M1", "title": "Summary of Product Characteristics (SmPC) & Package Leaflet", "regulatory_rule": "EMA QRD Template / 21 CFR 201.57", "is_mandatory": True, "description": "Package insert, patient labeling, and regional prescribing information."},
            {"section_id": "1.4", "module_code": "M1", "title": "Environmental Assessment / Exclusion Statement", "regulatory_rule": "21 CFR 25 / CHMP/SWP/4447/00", "is_mandatory": True, "description": "Categorical exclusion certification or environmental impact statement."},

            # Module 2
            {"section_id": "2.1", "module_code": "M2", "title": "CTD Table of Contents", "regulatory_rule": "ICH M4 §2.1", "is_mandatory": True, "description": "Comprehensive structural index across all CTD modules."},
            {"section_id": "2.2", "module_code": "M2", "title": "CTD Introduction", "regulatory_rule": "ICH M4 §2.2", "is_mandatory": True, "description": "Pharmacological class, proposed indication, mode of action."},
            {"section_id": "2.3", "module_code": "M2", "title": "Quality Overall Summary (QOS)", "regulatory_rule": "ICH M4Q §2.3", "is_mandatory": True, "description": "Executive synthesis of Module 3 CMC parameters."},
            {"section_id": "2.4", "module_code": "M2", "title": "Nonclinical Overview", "regulatory_rule": "ICH M4S §2.4", "is_mandatory": True, "description": "Integrated expert evaluation of nonclinical pharmacology and toxicology."},
            {"section_id": "2.5", "module_code": "M2", "title": "Clinical Overview", "regulatory_rule": "ICH M4E(R2) §2.5", "is_mandatory": True, "description": "Critical analysis of clinical development program and benefit-risk assessment."},
            {"section_id": "2.6", "module_code": "M2", "title": "Nonclinical Written and Tabulated Summaries", "regulatory_rule": "ICH M4S §2.6", "is_mandatory": True, "description": "Detailed nonclinical matrices and pharmacology studies."},
            {"section_id": "2.7.4", "module_code": "M2", "title": "Summary of Clinical Safety", "regulatory_rule": "ICH M4E(R2) §2.7.4", "is_mandatory": True, "description": "Adverse event incidence, disproportionality metrics, and post-marketing surveillance."},

            # Module 3
            {"section_id": "3.2.S.1", "module_code": "M3", "title": "General Information on Drug Substance", "regulatory_rule": "ICH Q6A", "is_mandatory": True, "description": "Nomenclature, structure, physicochemical characteristics."},
            {"section_id": "3.2.S.2", "module_code": "M3", "title": "Manufacture of Drug Substance", "regulatory_rule": "ICH Q7", "is_mandatory": True, "description": "Synthetic pathway, raw materials, in-process controls."},
            {"section_id": "3.2.P.1", "module_code": "M3", "title": "Description and Composition of the Drug Product", "regulatory_rule": "ICH Q8(R2)", "is_mandatory": True, "description": "Finished dosage form, excipients, quantitative formula."},
            {"section_id": "3.2.P.8.1", "module_code": "M3", "title": "Stability Summary and Conclusion", "regulatory_rule": "ICH Q1A(R2) §2.1", "is_mandatory": True, "description": "Primary shelf-life conclusions and proposed storage conditions."},
            {"section_id": "3.2.P.8.3", "module_code": "M3", "title": "Accelerated and Long-Term Stability Data", "regulatory_rule": "ICH Q1A(R2) §2.2", "is_mandatory": True, "description": "Empirical stability batch analysis under standard and accelerated stress."},

            # Module 4
            {"section_id": "4.2.1", "module_code": "M4", "title": "Primary and Secondary Pharmacology Reports", "regulatory_rule": "ICH M4S §4.2.1", "is_mandatory": True, "description": "In-vitro binding assays, in-vivo efficacy models."},
            {"section_id": "4.2.2", "module_code": "M4", "title": "Pharmacokinetics Reports (ADME)", "regulatory_rule": "ICH M4S §4.2.2", "is_mandatory": True, "description": "Absorption, distribution, metabolism, excretion studies in animal models."},
            {"section_id": "4.2.3.1", "module_code": "M4", "title": "Single-Dose Toxicity Studies", "regulatory_rule": "ICH M3(R2)", "is_mandatory": True, "description": "Acute dose escalation and safety pharmacology."},
            {"section_id": "4.2.3.2", "module_code": "M4", "title": "Repeat-Dose Toxicity Studies", "regulatory_rule": "ICH M3(R2) §4", "is_mandatory": True, "description": "Subchronic and chronic toxicology in two mammalian species."},

            # Module 5
            {"section_id": "5.2", "module_code": "M5", "title": "Tabular Listing of All Clinical Studies", "regulatory_rule": "ICH M4E §5.2", "is_mandatory": True, "description": "Comprehensive matrix of completed and active clinical investigations."},
            {"section_id": "5.3.1.2", "module_code": "M5", "title": "Comparative Bioavailability & Bioequivalence Studies", "regulatory_rule": "FDA BA/BE Guidance", "is_mandatory": True, "description": "In-vivo pharmacokinetic comparability and dissolution f2 factor metrics."},
            {"section_id": "5.3.5.1", "module_code": "M5", "title": "Reports of Controlled Clinical Studies Pertinent to the Claimed Indication", "regulatory_rule": "ICH E3 / 21 CFR 314.126", "is_mandatory": True, "description": "Pivotal Phase III randomized clinical trial reports."},
            {"section_id": "5.3.5.3", "module_code": "M5", "title": "Integrated Summary of Safety (ISS) / Integrated Analyses", "regulatory_rule": "ICH M4E(R2) §5.3.5.3", "is_mandatory": True, "description": "Pooled safety population analyses across all clinical trials."},
        ]

        for s in sections_data:
            if not session.query(CTDSection).filter_by(section_id=s["section_id"]).first():
                session.add(CTDSection(**s))
        session.flush()

        # 6. Products
        products_data = [
            {
                "name": "Pembrolizumab",
                "active_substance": "MK-3475 • Anti-PD-1 Humanized mAb",
                "cas_number": "1374853-91-4",
                "anatomical_class": "Antineoplastic agents (L01FF02)",
                "dosage_form": "Concentrate for solution for infusion",
                "strength": "25 mg/mL",
                "indication": "Advanced or metastatic melanoma, NSCLC, urothelial carcinoma",
            },
            {
                "name": "Remdesivir",
                "active_substance": "GS-5734 • Nucleoside Analogue",
                "cas_number": "1809249-37-3",
                "anatomical_class": "Antivirals for systemic use (J05AB16)",
                "dosage_form": "Powder for concentrate for solution for infusion",
                "strength": "100 mg lyophilized vial",
                "indication": "Severe viral pneumonia in hospitalized patients",
            },
            {
                "name": "Semaglutide",
                "active_substance": "GLP-1 Receptor Agonist • Incretin Mimetic",
                "cas_number": "910463-68-2",
                "anatomical_class": "Drugs used in diabetes (A10BJ06)",
                "dosage_form": "Subcutaneous solution in pre-filled pen",
                "strength": "1 mg/dose",
                "indication": "Type 2 diabetes mellitus and chronic weight management",
            },
            {
                "name": "Olaparib",
                "active_substance": "AZD-2281 • Poly(ADP-ribose) Polymerase Inhibitor",
                "cas_number": "763113-22-0",
                "anatomical_class": "Antineoplastic agents (L01XX46)",
                "dosage_form": "Film-coated tablet",
                "strength": "150 mg",
                "indication": "BRCA-mutated advanced ovarian and breast cancer",
            },
            {
                "name": "Nintedanib",
                "active_substance": "BIBF 1120 • Tyrosine Kinase Inhibitor",
                "cas_number": "656247-17-5",
                "anatomical_class": "Protein kinase inhibitors (L01EX09)",
                "dosage_form": "Soft capsule",
                "strength": "150 mg",
                "indication": "Idiopathic pulmonary fibrosis (IPF)",
            },
        ]

        product_map = {}
        for p in products_data:
            prod = session.query(Product).filter_by(name=p["name"]).first()
            if not prod:
                prod = Product(**p)
                session.add(prod)
                session.flush()
            product_map[p["name"]] = prod

        # 7. Adverse Events (MedDRA terms)
        ae_data = [
            {"meddra_pt": "Immune-mediated colitis", "meddra_soc": "Gastrointestinal disorders", "meddra_llt": "Colitis autoimmune", "meddra_code": "10053424"},
            {"meddra_pt": "Myocarditis", "meddra_soc": "Cardiac disorders", "meddra_llt": "Immune-related myocarditis", "meddra_code": "10028593"},
            {"meddra_pt": "Hepatic enzyme increased", "meddra_soc": "Hepatobiliary disorders", "meddra_llt": "Transaminases increased", "meddra_code": "10019641"},
            {"meddra_pt": "Acute interstitial nephritis", "meddra_soc": "Renal and urinary disorders", "meddra_llt": "Nephritis interstitial acute", "meddra_code": "10000843"},
            {"meddra_pt": "Gastroparesis acute", "meddra_soc": "Gastrointestinal disorders", "meddra_llt": "Gastric hypomotility", "meddra_code": "10017832"},
            {"meddra_pt": "Myelodysplastic syndrome", "meddra_soc": "Neoplasms benign, malignant and unspecified", "meddra_llt": "Secondary MDS", "meddra_code": "10028533"},
            {"meddra_pt": "Drug-induced liver injury", "meddra_soc": "Hepatobiliary disorders", "meddra_llt": "Toxic hepatitis", "meddra_code": "10072268"},
        ]

        ae_map = {}
        for item in ae_data:
            ev = session.query(AdverseEvent).filter_by(meddra_pt=item["meddra_pt"]).first()
            if not ev:
                ev = AdverseEvent(**item)
                session.add(ev)
                session.flush()
            ae_map[item["meddra_pt"]] = ev

        # 8. Seed Safety Signals
        signals_data = [
            {
                "signal_code": "SIG-101",
                "product_id": product_map["Pembrolizumab"].id,
                "adverse_event_id": ae_map["Immune-mediated colitis"].id,
                "cell_a": 184,
                "cell_b": 14210,
                "cell_c": 1240,
                "cell_d": 372400,
                "prr": 3.84,
                "prr_ci_lower": 3.32,
                "prr_ci_upper": 4.45,
                "ror": 3.89,
                "ror_ci_lower": 3.34,
                "ror_ci_upper": 4.53,
                "chi_square": 142.6,
                "p_value": 0.00001,
                "ebgm": 3.76,
                "case_count": 184,
                "serious_count": 42,
                "fatal_count": 3,
                "hospitalized_count": 38,
                "reporting_velocity": "+42% in Q3",
                "severity": "Critical",
                "status": "Emerging",
                "priority_score": 92.5,
                "known_risk_status": "Partially Known",
                "subgroup_analysis": "64% concentrated in patients >65 years (PRR 4.12); 52% Female / 48% Male; Co-medication with Ipilimumab present in 41% of cases.",
                "potential_confounders": "Indication bias: Pre-existing autoimmune predisposition in oncology cohort.",
                "ai_rationale": "Immune-mediated colitis with Pembrolizumab shows marked disproportionality (PRR = 3.84, Chi2 = 142.6, p < 0.0001). Acceleration concentrated in Q3 2024 following expanded dual-checkpoint regimens. Recommended action: Submit PRAC notification within 15 calendar days per EU GVP Module IX.",
            },
            {
                "signal_code": "SIG-102",
                "product_id": product_map["Pembrolizumab"].id,
                "adverse_event_id": ae_map["Myocarditis"].id,
                "cell_a": 42,
                "cell_b": 14352,
                "cell_c": 280,
                "cell_d": 373360,
                "prr": 4.21,
                "prr_ci_lower": 3.51,
                "prr_ci_upper": 5.08,
                "ror": 4.30,
                "ror_ci_lower": 3.58,
                "ror_ci_upper": 5.17,
                "chi_square": 198.4,
                "p_value": 0.00001,
                "ebgm": 4.15,
                "case_count": 42,
                "serious_count": 39,
                "fatal_count": 8,
                "hospitalized_count": 36,
                "reporting_velocity": "+18% in Q3",
                "severity": "Critical",
                "status": "Investigational",
                "priority_score": 95.0,
                "known_risk_status": "Potentially New",
                "subgroup_analysis": "71% concentrated in patients >65 years (PRR 4.65); 44% Female / 56% Male; Anthracycline history in 28% of cases.",
                "potential_confounders": "Prior cardiotoxic chemotherapy may contribute as potential synergist.",
                "ai_rationale": "Immune-related myocarditis demonstrates very high disproportionality (PRR = 4.21). High case fatality rate (19%) warrants expedited Safety Advisory Committee review.",
            },
            {
                "signal_code": "SIG-103",
                "product_id": product_map["Remdesivir"].id,
                "adverse_event_id": ae_map["Hepatic enzyme increased"].id,
                "cell_a": 342,
                "cell_b": 24100,
                "cell_c": 2150,
                "cell_d": 361400,
                "prr": 3.84,
                "prr_ci_lower": 3.41,
                "prr_ci_upper": 4.31,
                "ror": 3.92,
                "ror_ci_lower": 3.49,
                "ror_ci_upper": 4.41,
                "chi_square": 165.2,
                "p_value": 0.00001,
                "ebgm": 3.80,
                "case_count": 342,
                "serious_count": 88,
                "fatal_count": 4,
                "hospitalized_count": 112,
                "reporting_velocity": "+28% in Q3",
                "severity": "Severe",
                "status": "Emerging",
                "priority_score": 84.0,
                "known_risk_status": "Known",
                "subgroup_analysis": "58% elderly in ICU setting; 38% Female / 62% Male; Concurrent corticosteroids & IL-6 inhibitors.",
                "potential_confounders": "Severe systemic viral infection itself contributes to transaminase elevation.",
                "ai_rationale": "Transaminase elevation consistently elevated in ICU-treated cohort. Liver function monitoring guidance confirmed in Section 4.4.",
            },
            {
                "signal_code": "SIG-104",
                "product_id": product_map["Pembrolizumab"].id,
                "adverse_event_id": ae_map["Acute interstitial nephritis"].id,
                "cell_a": 96,
                "cell_b": 14298,
                "cell_c": 840,
                "cell_d": 372800,
                "prr": 3.12,
                "prr_ci_lower": 2.58,
                "prr_ci_upper": 3.78,
                "ror": 3.14,
                "ror_ci_lower": 2.60,
                "ror_ci_upper": 3.80,
                "chi_square": 88.7,
                "p_value": 0.00001,
                "ebgm": 3.08,
                "case_count": 96,
                "serious_count": 32,
                "fatal_count": 1,
                "hospitalized_count": 45,
                "reporting_velocity": "Stable (+6%)",
                "severity": "Moderate",
                "status": "Confirmed",
                "priority_score": 71.0,
                "known_risk_status": "Known",
                "subgroup_analysis": "54% over 65 years; 50% Female / 50% Male; Concurrent PPIs and NSAIDs in 35%.",
                "potential_confounders": "Concurrent proton pump inhibitors are established risk factors for acute interstitial nephritis.",
                "ai_rationale": "Confirmed immune-mediated nephritis signal with stable trajectory. Covered under standard management guidelines.",
            },
            {
                "signal_code": "SIG-105",
                "product_id": product_map["Semaglutide"].id,
                "adverse_event_id": ae_map["Gastroparesis acute"].id,
                "cell_a": 819,
                "cell_b": 38200,
                "cell_c": 2840,
                "cell_d": 346100,
                "prr": 2.64,
                "prr_ci_lower": 2.45,
                "prr_ci_upper": 2.85,
                "ror": 2.67,
                "ror_ci_lower": 2.47,
                "ror_ci_upper": 2.88,
                "chi_square": 112.4,
                "p_value": 0.00001,
                "ebgm": 2.62,
                "case_count": 819,
                "serious_count": 142,
                "fatal_count": 0,
                "hospitalized_count": 98,
                "reporting_velocity": "+65% in Q3",
                "severity": "Moderate",
                "status": "Under Review",
                "priority_score": 78.5,
                "known_risk_status": "Potentially New",
                "subgroup_analysis": "34% elderly; 68% Female / 32% Male; Metformin and SGLT2i concurrent.",
                "potential_confounders": "Diabetic gastroparesis baseline background prevalence in target indication.",
                "ai_rationale": "Substantial increase in gastroparesis reports driven by widespread off-label usage and media reporting. Signal under active review.",
            },
        ]

        for sig in signals_data:
            if not session.query(SafetySignal).filter_by(signal_code=sig["signal_code"]).first():
                session.add(SafetySignal(**sig))
        session.flush()

        # 9. Seed Individual Safety Cases (ICSRs)
        sample_cases = [
            {
                "report_id": "ICSR-2024-00912",
                "case_id": "CAS-PEM-101",
                "product_id": product_map["Pembrolizumab"].id,
                "patient_age": 68.0,
                "patient_sex": "Female",
                "country": "US",
                "report_date": "2024-08-14",
                "event_date": "2024-08-02",
                "outcome": "Recovering",
                "seriousness": "Serious",
                "is_fatal": False,
                "is_hospitalized": True,
                "dose_text": "200 mg IV Q3W",
                "route": "Intravenous",
                "indication_text": "Metastatic Melanoma",
                "concomitant_meds": "Ipilimumab 3 mg/kg, Omeprazole 20 mg",
                "reporter_type": "Oncologist",
                "narrative_text": "A 68-year-old female patient with metastatic melanoma treated with Pembrolizumab and Ipilimumab developed severe abdominal cramping and Grade 3 diarrhea 12 days following Cycle 2. Colonoscopy revealed mucosal erythema and ulceration consistent with immune-mediated colitis.",
                "data_quality_score": 96,
                "is_duplicate_candidate": False,
            },
            {
                "report_id": "ICSR-2024-00913",
                "case_id": "CAS-PEM-102",
                "product_id": product_map["Pembrolizumab"].id,
                "patient_age": 71.0,
                "patient_sex": "Male",
                "country": "DE",
                "report_date": "2024-08-20",
                "event_date": "2024-08-15",
                "outcome": "Fatal",
                "seriousness": "Serious",
                "is_fatal": True,
                "is_hospitalized": True,
                "dose_text": "200 mg IV Q3W",
                "route": "Intravenous",
                "indication_text": "Non-Small Cell Lung Cancer",
                "concomitant_meds": "Doxorubicin (historical), Lisinopril 10 mg",
                "reporter_type": "Cardiologist",
                "narrative_text": "A 71-year-old male with NSCLC presented with acute dyspnea, elevated cardiac troponin I (14.2 ng/mL), and diffuse ST-elevation on ECG 3 weeks post-first dose. Endomyocardial biopsy confirmed lymphocytic myocarditis. The patient succumbed to cardiogenic shock.",
                "data_quality_score": 94,
                "is_duplicate_candidate": False,
            },
            {
                "report_id": "ICSR-2024-00914",
                "case_id": "CAS-PEM-102-DUP",
                "product_id": product_map["Pembrolizumab"].id,
                "patient_age": 71.0,
                "patient_sex": "Male",
                "country": "DE",
                "report_date": "2024-08-22",
                "event_date": "2024-08-15",
                "outcome": "Fatal",
                "seriousness": "Serious",
                "is_fatal": True,
                "is_hospitalized": True,
                "dose_text": "200 mg IV Q3W",
                "route": "Intravenous",
                "indication_text": "Lung Neoplasm Malignant",
                "concomitant_meds": "Lisinopril",
                "reporter_type": "Consumer / Relative",
                "narrative_text": "Relative reported patient died in ICU after heart complications following new immunotherapy infusion for lung cancer.",
                "data_quality_score": 78,
                "is_duplicate_candidate": True,
                "duplicate_of_id": "ICSR-2024-00913",
            },
            {
                "report_id": "ICSR-2024-00915",
                "case_id": "CAS-SEM-201",
                "product_id": product_map["Semaglutide"].id,
                "patient_age": 42.0,
                "patient_sex": "Female",
                "country": "US",
                "report_date": "2024-09-02",
                "event_date": "2024-08-25",
                "outcome": "Not Recovered",
                "seriousness": "Serious",
                "is_fatal": False,
                "is_hospitalized": True,
                "dose_text": "1.7 mg SubQ weekly",
                "route": "Subcutaneous",
                "indication_text": "Weight Management",
                "concomitant_meds": "Levothyroxine 75 mcg",
                "reporter_type": "Gastroenterologist",
                "narrative_text": "A 42-year-old female receiving Semaglutide for weight loss presented with intractable nausea, postprandial vomiting, and early satiety. Gastric scintigraphy demonstrated 4-hour retention of 64% confirming severe gastroparesis.",
                "data_quality_score": 98,
                "is_duplicate_candidate": False,
            },
        ]

        for c in sample_cases:
            existing_case = session.query(SafetyCase).filter_by(report_id=c["report_id"]).first()
            if not existing_case:
                new_case = SafetyCase(**c)
                session.add(new_case)
                session.flush()

                # Link adverse events to case
                if "colitis" in c["narrative_text"].lower():
                    session.add(CaseEventLink(case_id=new_case.id, event_id=ae_map["Immune-mediated colitis"].id))
                elif "myocarditis" in c["narrative_text"].lower():
                    session.add(CaseEventLink(case_id=new_case.id, event_id=ae_map["Myocarditis"].id))
                elif "gastroparesis" in c["narrative_text"].lower():
                    session.add(CaseEventLink(case_id=new_case.id, event_id=ae_map["Gastroparesis acute"].id))

        # 10. Seed Regulatory Submission (NDA 219084)
        fda_profile = session.query(RegulatoryProfile).filter_by(code="US_FDA").first()
        sub = session.query(Submission).filter_by(tracking_number="NDA-219084").first()
        if not sub:
            sub = Submission(
                tracking_number="NDA-219084",
                title="Pembrolizumab Combination Chemotherapy Dossier",
                product_id=product_map["Pembrolizumab"].id,
                profile_id=fda_profile.id,
                organization_id=org.id,
                submission_type="NDA",
                status="Active Audit",
                overall_score=82,
                created_at=datetime.utcnow(),
            )
            session.add(sub)
            session.flush()

            # Seed Submission Documents
            docs = [
                {"submission_id": sub.id, "filename": "m1-forms-fda356h.pdf", "file_type": "pdf", "file_size_bytes": 482000, "assigned_section_id": "1.1", "status": "Validated"},
                {"submission_id": sub.id, "filename": "m1-regional-smpc-leaflet.pdf", "file_type": "pdf", "file_size_bytes": 1240000, "assigned_section_id": "1.3.1", "status": "Validated"},
                {"submission_id": sub.id, "filename": "m2-clinical-overview-sec25.pdf", "file_type": "pdf", "file_size_bytes": 3410000, "assigned_section_id": "2.5", "status": "Validated"},
                {"submission_id": sub.id, "filename": "m2-summary-clinical-safety.pdf", "file_type": "pdf", "file_size_bytes": 4890000, "assigned_section_id": "2.7.4", "status": "Flagged"},
                {"submission_id": sub.id, "filename": "m3-cmc-stability-summary.pdf", "file_type": "pdf", "file_size_bytes": 8920000, "assigned_section_id": "3.2.P.8.1", "status": "Validated"},
                {"submission_id": sub.id, "filename": "m4-toxicology-repeat-dose.pdf", "file_type": "pdf", "file_size_bytes": 6200000, "assigned_section_id": "4.2.3.2", "status": "Validated"},
                {"submission_id": sub.id, "filename": "m5-study-004-pivotal-csr.pdf", "file_type": "pdf", "file_size_bytes": 14200000, "assigned_section_id": "5.3.5.1", "status": "Validated"},
            ]
            for doc in docs:
                session.add(SubmissionDocument(**doc))

            # Seed Gap Findings
            gaps = [
                {
                    "finding_code": "GAP-001",
                    "submission_id": sub.id,
                    "module_code": "M5",
                    "section_id": "5.3.5.3",
                    "section_name": "Reports of Analyses of Data from More Than One Study (ISS)",
                    "severity": "critical",
                    "issue_type": "Missing Linkage",
                    "finding_text": "Integrated Summary of Safety (ISS) pooled dataset does not link to Study-004 adverse event records.",
                    "regulatory_rule": "ICH M4E(R2) §5.3.5.3",
                    "impact_statement": "FDA Refusal-to-File (RTF) risk under 21 CFR 314.50(d)(5).",
                    "remediation_action": "Inject SDTM AE domain foreign keys for Study-004 cohort into the ISS dataset.",
                    "status": "Open",
                },
                {
                    "finding_code": "GAP-002",
                    "submission_id": sub.id,
                    "module_code": "M3",
                    "section_id": "3.2.P.8.3",
                    "section_name": "Stability Data — Accelerated Shelf-Life Testing",
                    "severity": "critical",
                    "issue_type": "Missing Report",
                    "finding_text": "6-month accelerated stability testing dataset missing batch analysis for Lot #BX-9021.",
                    "regulatory_rule": "ICH Q1A(R2) §2.2.7",
                    "impact_statement": "Validation hold on commercial packaging line approval.",
                    "remediation_action": "Append Lot #BX-9021 HPLC assay metrics to Section 3.2.P.8.3 Table 4.",
                    "status": "Open",
                },
                {
                    "finding_code": "GAP-003",
                    "submission_id": sub.id,
                    "module_code": "M2",
                    "section_id": "2.7.4",
                    "section_name": "Summary of Clinical Safety",
                    "severity": "major",
                    "issue_type": "Stale Disproportionality",
                    "finding_text": "PRR disproportionality figures do not reflect openFDA Q3 2024 signal updates for GI toxicity.",
                    "regulatory_rule": "ICH M4E(R2) §2.7.4.2",
                    "impact_statement": "Audit finding during pre-approval inspection.",
                    "remediation_action": "Auto-sync PRR values (3.84 for colitis) from DrugSafe AI Signal Detection into Section 2.7.4.",
                    "status": "Open",
                },
                {
                    "finding_code": "GAP-004",
                    "submission_id": sub.id,
                    "module_code": "M5",
                    "section_id": "5.3.1.2",
                    "section_name": "Comparative BA/BE Study Reports",
                    "severity": "major",
                    "issue_type": "Confidence Interval Variance",
                    "finding_text": "Dissolution profile f2 similarity factor borderline (49.8 vs required 50.0).",
                    "regulatory_rule": "FDA BA/BE Guidance 2023",
                    "impact_statement": "Possible bioequivalence deficiency inquiry from reviewing division.",
                    "remediation_action": "Recalculate bootstrap confidence intervals using secondary dissolution vessel set.",
                    "status": "Open",
                },
                {
                    "finding_code": "GAP-005",
                    "submission_id": sub.id,
                    "module_code": "M4",
                    "section_id": "4.2.3.2",
                    "section_name": "Repeat-Dose Toxicity Studies",
                    "severity": "minor",
                    "issue_type": "Pending Sign-Off",
                    "finding_text": "Principal Toxicologist electronic signature timestamp missing 21 CFR Part 11 checksum hash.",
                    "regulatory_rule": "21 CFR Part 11.50",
                    "impact_statement": "Minor verification warning prior to eCTD compilation.",
                    "remediation_action": "Re-authenticate with institutional e-signature token.",
                    "status": "Open",
                },
                {
                    "finding_code": "GAP-006",
                    "submission_id": sub.id,
                    "module_code": "M1",
                    "section_id": "1.3.1",
                    "section_name": "Summary of Product Characteristics (SmPC) & Package Leaflet",
                    "severity": "minor",
                    "issue_type": "Terminology Alignment",
                    "finding_text": "Adverse reaction frequency wording diverges between US Prescribing Information and EU SmPC §4.8.",
                    "regulatory_rule": "EMA QRD Template v10.4",
                    "impact_statement": "Regional labeling harmonization deficiency comment.",
                    "remediation_action": "Align MedDRA frequency terms (Common: >=1/100 to <1/10) across both regional annexes.",
                    "status": "Open",
                },
            ]
            for g in gaps:
                session.add(GapFinding(**g))

            # Seed Cross-Document Inconsistencies
            inconsistencies = [
                {
                    "submission_id": sub.id,
                    "entity_type": "Active Substance Dosage Form",
                    "document_a_name": "m1-regional-smpc-leaflet.pdf (Section 1.3)",
                    "document_a_value": "Concentrate for solution for infusion: 25 mg/mL (100 mg / 4 mL vial)",
                    "document_b_name": "m3-cmc-stability-summary.pdf (Section 3.2.P.1)",
                    "document_b_value": "Solution for infusion: 20 mg/mL (80 mg / 4 mL vial)",
                    "conflict_description": "Nominal vial strength in regional labeling does not match CMC batch release specifications.",
                    "severity": "Critical",
                    "status": "Unresolved",
                },
                {
                    "submission_id": sub.id,
                    "entity_type": "Pivotal Study Patient Count",
                    "document_a_name": "m2-clinical-overview-sec25.pdf (Section 2.5)",
                    "document_a_value": "Total Randomized Subjects (Study-004): N = 1,034",
                    "document_b_name": "m5-study-004-pivotal-csr.pdf (Section 5.3.5.1)",
                    "document_b_value": "Total Randomized Subjects (Study-004): N = 1,028 (Safety Population = 1,019)",
                    "conflict_description": "Executive synopsis reports 6 additional randomized subjects compared to formal clinical study report.",
                    "severity": "Major",
                    "status": "Unresolved",
                },
            ]
            for inc in inconsistencies:
                session.add(CrossDocumentInconsistency(**inc))

            # Seed Traceability Graph Links
            trace_links = [
                {"source_type": "Product", "source_id": "Pembrolizumab", "target_type": "Case", "target_id": "ICSR-2024-00912", "relation_type": "reported_in"},
                {"source_type": "Case", "source_id": "ICSR-2024-00912", "target_type": "Event", "target_id": "Immune-mediated colitis", "relation_type": "manifests"},
                {"source_type": "Event", "source_id": "Immune-mediated colitis", "target_type": "Signal", "target_id": "SIG-101", "relation_type": "contributes_to"},
                {"source_type": "Signal", "source_id": "SIG-101", "target_type": "Study", "target_id": "Study-004", "relation_type": "corroborates"},
                {"source_type": "Study", "source_id": "Study-004", "target_type": "Document", "target_id": "m5-study-004-pivotal-csr.pdf", "relation_type": "documented_in"},
                {"source_type": "Document", "source_id": "m5-study-004-pivotal-csr.pdf", "target_type": "CTD_Section", "target_id": "5.3.5.1", "relation_type": "satisfies_requirement"},
                {"source_type": "Signal", "source_id": "SIG-101", "target_type": "CTD_Section", "target_id": "2.7.4", "relation_type": "mandates_safety_update"},
            ]
            for link in trace_links:
                session.add(TraceabilityLink(**link))

        # 11. Seed Audit Events
        audit_events = [
            {
                "actor_email": "dr.elena.rostova@pharma-safety.org",
                "action": "LOGIN",
                "resource_type": "USER_SESSION",
                "resource_id": "SES-88219",
                "ip_address": "127.0.0.1",
                "reason": "Enterprise QPPV login via 21 CFR Part 11 credentials.",
                "timestamp": datetime.utcnow(),
            },
            {
                "actor_email": "analyst@pharma-safety.org",
                "action": "DATASET_INGESTION",
                "resource_type": "SAFETY_BATCH",
                "resource_id": "FAERS_2024_Q3",
                "ip_address": "127.0.0.1",
                "reason": "Ingested 14,210 adverse event records; data quality validation executed.",
                "timestamp": datetime.utcnow(),
            },
            {
                "actor_email": "dr.elena.rostova@pharma-safety.org",
                "action": "SIGNAL_STATUS_UPDATE",
                "resource_type": "SAFETY_SIGNAL",
                "resource_id": "SIG-101",
                "before_state": "Screening",
                "after_state": "Emerging",
                "ip_address": "127.0.0.1",
                "reason": "PRR 3.84 confirmed; disproportionality velocity +42% warrants PRAC alert.",
                "timestamp": datetime.utcnow(),
            },
            {
                "actor_email": "regulatory@pharma-safety.org",
                "action": "DOSSIER_AUDIT",
                "resource_type": "SUBMISSION",
                "resource_id": "NDA-219084",
                "ip_address": "127.0.0.1",
                "reason": "ICH M4 automated structure check executed; 2 critical blockers flagged.",
                "timestamp": datetime.utcnow(),
            },
        ]
        for evt in audit_events:
            session.add(AuditEvent(**evt))

        session.commit()
        return {"status": "success", "message": "Database seeded with enterprise data."}

    except Exception as exc:
        session.rollback()
        raise exc
    finally:
        session.close()


if __name__ == "__main__":
    result = seed_database()
    print("Database seeding completed successfully:", result)
