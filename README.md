# Drug Safety Signal Detector & Regulatory Submission Readiness Checker
## Atreides / PharmaSafe Intelligence Platform

---

## Team Information

| Field | Value |
|---|---|
| **Team Name** | The Atreides |
| **Track** | AI |
| **Team Lead** | Krina Parikh — krinaparikh227@gmail.com |
| **Members** | Kush Amit Shah, Ishan Shastri, Fayan Suthar |

---

## 1. Problem Statement

The FDA Adverse Event Reporting System (FAERS) database contains over 20M+ adverse event reports. Historically, signals for dangerous drug-induced toxicities were missed due to sheer volume and lack of automated disproportionality surveillance. Separately, commercial drug approval Common Technical Document (CTD) dossiers span 100,000+ pages across 5 modules — where a single missing section, unlinked safety dataset, or cross-document contradiction results in a formal FDA Refusal-to-File (RTF) action, costing pharmaceutical sponsors 6 to 12 months in delays and $50M to $100M in remediation. Both critical problems share the exact same root cause: overwhelming volumes of complex clinical and regulatory data requiring automated decision support.

---

## 2. Solution Overview

Atreides (PharmaSafe Intelligence) is an enterprise-grade pharmacovigilance and regulatory intelligence platform that integrates statistical algorithms with foundation models to provide qualified decision support:

1. **Safety Signal Detection Mode:**
   - Ingests structured and unstructured adverse event datasets (CSV, JSON, XML / E2B).
   - Calculates deterministic disproportionality metrics: Proportional Reporting Ratio (PRR), Reporting Odds Ratio (ROR), Chi-Square ($\chi^2$) with Yates' continuity correction, and Empirical Bayes Geometric Mean (EBGM) shrinkage.
   - Evaluates data quality (0 to 100 score) and identifies suspected duplicate cases.
   - Performs clinical explainability answering what was detected, why, how strong, when, who, confounders, and recommended next actions.
   - Enforces 21 CFR Part 11 compliant qualified human reviews with electronic signature hashes.

2. **Regulatory Submission Readiness Mode:**
   - Evaluates submission dossier outlines against jurisdiction-specific profiles (US FDA, EU EMA, India CDSCO).
   - Checks section presence and completeness across ICH M4 Modules 1 to 5.
   - Discovers cross-document factual contradictions (e.g., active substance concentration divergence, patient count discrepancies).
   - Generates an actionable gap report classifying findings into Critical Blockers, Major Gaps, and Minor Flags with remediation guidance.
   - Maintains a clickable evidence traceability graph linking raw individual case safety reports (ICSRs) directly to CTD sections.

3. **IBM Bob & watsonx.ai Copilot:**
   - Conversational pharmacovigilance specialist that synthesizes clinical insights and explains CTD module blockers.

---

## 3. Regulatory Decision Support Notice

The platform provides decision support and does not replace qualified medical or regulatory judgment:

STATISTICAL ASSOCIATION
→ POTENTIAL SAFETY SIGNAL
→ HUMAN ASSESSMENT
→ VALIDATED SIGNAL
→ REGULATORY ACTION

The application does not claim causality from disproportionality alone, nor does it guarantee regulatory acceptance.

---

## 4. Key Features

- **Statistical Disproportionality Engine:** Deterministic computation of PRR, ROR, Yates' corrected $\chi^2$, two-tailed p-values, and EBGM with 95% confidence intervals.
- **Automated Data Quality & Deduplication:** Pre-ingestion validation calculating completeness, validity, chronological consistency, and multi-factor fuzzy duplicate detection.
- **Clinical NLP & Terminology Normalization:** Extracts clinical entities (suspect drug, adverse event, latency, dose, route, seriousness) and normalizes terms to MedDRA Preferred Terms (PT) and System Organ Classes (SOC).
- **ICH M4 CTD Completeness Audit:** Structural verification of Modules 1 through 5 against versioned regulatory rules with module-level readiness scoring.
- **Cross-Document Consistency Engine:** Identifies discrepancies between product labeling (Module 1), clinical overviews (Module 2), CMC specifications (Module 3), and clinical study reports (Module 5).
- **End-to-End Evidence Traceability Graph:** Traverses relational links from Product → Case → Event → Signal → Study → Document → CTD Section → Regulatory Requirement.
- **21 CFR Part 11 Audit Trail:** Immutable logging of authentication, dataset uploads, signal reviews, dossier evaluations, and data mutations.
- **Multi-Jurisdiction Regulatory Profiles:** Extensible configuration supporting US FDA (21 CFR 314), EU EMA (QRD Template), and India CDSCO (New Drugs Rules 2019).

---

## 5. Technology Stack

### Programming Languages
- Python 3.10+
- JavaScript (ES6+ / React 18)

### Frameworks & Libraries
- FastAPI 0.110+ (Enterprise REST API)
- React 18.3+ with Vite 5 (Frontend Single Page Application)
- Tailwind CSS 3.4 (Clinical tactile design system)
- SQLAlchemy (Relational ORM with connection pooling)
- Three.js (Interactive 3D molecular lattice visualization)
- Recharts (Statistical data visualization)
- Pandas & NumPy (Vectorized data processing)
- Scikit-Learn (Analytical metrics and clustering)

### AI & Cloud Integrations
- IBM watsonx.ai (Foundation model reasoning)
- IBM Bob (Conversational PV and regulatory assistant)

### Persistence & Storage
- SQLite (Local zero-configuration database)
- PostgreSQL (Production relational database via DATABASE_URL)

### Regulatory Standards & Protocols
- 21 CFR Part 11 (Electronic Records & Electronic Signatures)
- ICH M4 (R4) Common Technical Document Specifications
- CIOMS VIII Guidelines on Pharmacovigilance Signal Detection
- EMA Good Pharmacovigilance Practices (GVP) Module IX
- FDA Guidance for Industry on Good Pharmacovigilance Practices

---

## 6. Repository Structure

```
├── .github/                   # CI/CD workflows
├── demo/                      # Demo artifacts and screenshots
│   ├── screenshots/
│   └── demo-video-link.txt
├── docs/                      # Architectural and technical documentation
│   ├── architecture.md        # System architecture diagram and flow
│   ├── problem-statement.md   # Clinical and regulatory context
│   ├── setup-guide.md         # Comprehensive deployment guide
│   └── solution-overview.md   # Functional overview
├── presentation/              # Presentation materials
├── src/
│   ├── backend/               # FastAPI backend application
│   │   ├── auth/              # JWT authentication & RBAC security
│   │   ├── db/                # SQLAlchemy session, models, and seeder
│   │   ├── engines/           # Domain engines:
│   │   │   ├── signal_engine.py      # PRR, ROR, Chi2, EBGM calculations
│   │   │   ├── quality_engine.py     # Quality score & duplicate detection
│   │   │   ├── ingestion_engine.py   # Multi-format adverse event parser
│   │   │   ├── nlp_engine.py         # Narrative extraction & MedDRA coding
│   │   │   ├── regulatory_engine.py  # CTD completeness & profile checks
│   │   │   ├── consistency_engine.py # Cross-document conflict resolution
│   │   │   ├── traceability_engine.py# Evidence graph builder
│   │   │   └── audit_engine.py       # 21 CFR Part 11 audit logging
│   │   ├── ai_service.py      # watsonx.ai provider abstraction
│   │   ├── main.py            # Main API routing and application server
│   │   ├── test_engines.py    # Baseline mathematical tests
│   │   ├── test_enterprise.py # Comprehensive 17-test enterprise suite
│   │   └── requirements.txt   # Backend dependencies
│   └── frontend/              # React 18 + Vite frontend
│       ├── src/
│       │   ├── api/           # Unified API client with fallback support
│       │   ├── components/    # Reusable UI components & 3D visualization
│       │   ├── pages/         # Workspaces:
│       │   │   ├── Auth/              # Login portal & role selection
│       │   │   ├── Dashboard/         # Executive safety intelligence view
│       │   │   ├── SignalDetection/   # PRR calculations & signal workspace
│       │   │   ├── SubmissionReadiness/# CTD audit, gap report & consistency
│       │   │   ├── Cases/             # Individual case explorer (ICSR)
│       │   │   └── Datasets/          # Dataset ingestion pipeline
│       │   ├── App.jsx        # Root router and workspace coordinator
│       │   └── index.css      # Design tokens and styles
│       └── package.json       # Frontend dependencies
├── submission.yaml            # Hackathon structured metadata
└── README.md                  # Project documentation
```

---

## 7. How to Run

### Step 1: Clone Repository
```bash
git clone https://github.com/krinaparikh227/bob-ai-hackathon-the-atreides.git
cd bob-ai-hackathon-the-atreides
```

### Step 2: Configure Environment
```bash
cp src/.env.example src/.env
```

### Step 3: Install Backend Dependencies and Run
```bash
cd src/backend
pip install -r requirements.txt
python db/seed.py
uvicorn main:app --reload --port 8000
```
Backend API documentation is available at: `http://localhost:8000/docs`

### Step 4: Install Frontend Dependencies and Run
```bash
cd ../frontend
npm install
npm run dev
```
Frontend application will be accessible at: `http://localhost:5173`

---

## 8. Automated Test Execution

Run the complete test suite:

```bash
# Enterprise test suite (17 tests covering statistical, quality, regulatory, audit)
python src/backend/test_enterprise.py

# Baseline engine verification (8 tests)
python src/backend/test_engines.py

# Frontend production build verification
cd src/frontend && npm run build
```

Verification status: **25 / 25 automated unit and integration tests passing.**

---

## 9. End-to-End Demonstration Workflows

### Demo Flow 1: Safety Signal Detection & Qualified Review
1. Log in to the application portal using enterprise credentials (`dr.elena.rostova@pharma-safety.org`).
2. Navigate to **Signal Detection** workspace.
3. Observe prioritized signals ranked by PRR score (e.g., Pembrolizumab colitis: PRR = 3.84, myocarditis: PRR = 4.21).
4. Inspect the 2x2 contingency table (Cell A=184, B=14,210, C=1,240, D=372,400) and 95% confidence intervals.
5. Review subgroup concentration (64% in patients >65 years) and potential confounders.
6. Conduct qualified human review, enter causality rationale, apply electronic signature, and confirm status transition logged to the audit trail.

### Demo Flow 2: Regulatory Submission Readiness & Gap Resolution
1. Navigate to **Submission Readiness** workspace.
2. Select regulatory profile (e.g., US FDA vs EU EMA).
3. Ingest dossier outline or upload `NDA_219084_eCTD_Rev2.xml`.
4. Review module-by-module completeness breakdown (Module 1 through Module 5).
5. Inspect identified critical blockers:
   - Section 5.3.5.3 (ISS missing Study-004 relational linkage).
   - Section 3.2.P.8.3 (Missing 6-month accelerated stability data for Lot #BX-9021).
6. View cross-document consistency findings identifying concentration differences between regional labeling and CMC specifications.
7. Export the actionable gap report.

### Demo Flow 3: Combined Intelligence & IBM Bob Copilot
1. Open the IBM Bob copilot panel.
2. Query: *"What are the critical blockers in Module 5?"*
3. Query: *"Explain the PRR disproportionality for Pembrolizumab colitis."*
4. Review the structured citation of ICH guidelines and suggested remediation actions.

---

## 10. Known Limitations

- Real-time whole-database PRR scans across the full 20M+ unaggregated FAERS records require pre-computed materialized summary tables for sub-second responses.
- OCR parsing for degraded scanned legacy paper submissions is limited to high-contrast documents; native PDF and XML outlines are prioritized.
- Cross-document consistency checking uses rule-based and entity-extraction matching; subtle narrative discrepancies may still require manual verification.

---

## 11. What We Are Most Proud Of

We are most proud of establishing an end-to-end bridge between quantitative pharmacovigilance signal detection (PRR/ROR/$\chi^2$/EBGM) and regulatory submission readiness (ICH M4 CTD validation). Instead of treating safety surveillance and regulatory filing as disconnected silos, the platform enables pharmaceutical teams to trace an adverse event signal directly to its regulatory consequence in the dossier, backed by an immutable 21 CFR Part 11 audit trail and qualified human review.
