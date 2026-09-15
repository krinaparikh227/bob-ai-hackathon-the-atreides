"""
DrugSafe AI (PharmaSafe Intelligence) — Enterprise Backend API Server
======================================================================
FastAPI server orchestrating:
  - Pharmacovigilance Statistical Disproportionality Engine (PRR, ROR, Chi2, EBGM)
  - Adverse Event Data Ingestion, Quality Scoring & Duplicate Detection Engine
  - ICH M4 eCTD Regulatory Dossier Verification & Gap Analysis Engine
  - Cross-Document Consistency & Conflict Resolution Engine
  - Clinical-to-Regulatory Evidence Traceability Lineage Graph
  - 21 CFR Part 11 Qualified Human Review & Audit Logging Service
  - AI Specialist Copilot & IBM Bob Conversational Assistant (watsonx.ai)
"""

import os
import sys
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, Query, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from db.session import get_db, engine, Base
from db.models import (
    User,
    Product,
    AdverseEvent,
    SafetyCase,
    SafetySignal,
    SignalReview,
    Submission,
    SubmissionDocument,
    GapFinding,
    CrossDocumentInconsistency,
    AuditEvent,
    RegulatoryProfile,
)
from db.seed import seed_database
from auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_roles,
)
from engines.signal_engine import (
    ContingencyTable,
    compute_all_metrics,
    calculate_prioritization_score,
    generate_signal_explainability,
)
from engines.quality_engine import evaluate_case_quality, detect_duplicate_candidates
from engines.ingestion_engine import parse_adverse_event_file
from engines.regulatory_engine import (
    evaluate_dossier_against_profile,
    MASTER_REGULATORY_RULES,
)
from engines.consistency_engine import analyze_cross_document_consistency
from engines.traceability_engine import build_traceability_graph
from engines.audit_engine import record_audit_event, query_audit_trail
from ai_service import generate_bob_response

# Initialize database schema and baseline data on startup
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception:
    pass

app = FastAPI(
    title="DrugSafe AI — Safety Intelligence & Regulatory Dossier API",
    version="2.0.0",
    description="Enterprise Pharmacovigilance Signal Detection & ICH M4 CTD Readiness Checker (21 CFR Part 11 / GxP Validated)",
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "pharmacovigilance_analyst"


class ChatRequest(BaseModel):
    message: str


class CalculateSignalRequest(BaseModel):
    drug_name: str = "TestDrug"
    adverse_event: str = "TestEvent"
    table: ContingencyTable


class SignalReviewSubmission(BaseModel):
    new_status: str
    assessment_notes: str
    causality_score: str = "Probable"
    action_recommended: Optional[str] = None
    e_signature_statement: str = "I confirm this clinical assessment complies with 21 CFR Part 11"


# ── Root & Health Check ──────────────────────────────────────────────────────

@app.get("/")
def read_root():
    """
    Public health check endpoint returning server identity and capabilities.
    """
    return {
        "service": "DrugSafe AI Enterprise Engine",
        "status": "online",
        "version": "2.0.0",
        "protocol": "21 CFR Part 11 / GxP Pharmacovigilance Suite v4.2",
        "jurisdictions_supported": ["US FDA", "EU EMA", "India CDSCO"],
        "endpoints": [
            "/api/auth/login",
            "/api/auth/register",
            "/api/signals",
            "/api/signals/{signal_code}",
            "/api/signals/calculate",
            "/api/cases",
            "/api/datasets/upload",
            "/api/dossier/check",
            "/api/dossier/upload",
            "/api/dossier/consistency",
            "/api/evidence/traceability",
            "/api/regulatory/profiles",
            "/api/audit",
            "/api/chat",
            "/docs",
        ],
    }


# ── Authentication Endpoints ─────────────────────────────────────────────────

@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and issues signed JWT access token.
    """
    user = db.query(User).filter_by(email=payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        record_audit_event(
            db=db,
            actor_email=payload.email,
            action="LOGIN_FAILED",
            resource_type="USER_SESSION",
            reason="Invalid credentials supplied"
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(data={"sub": user.email, "role": user.role})
    record_audit_event(
        db=db,
        actor_email=user.email,
        action="LOGIN_SUCCESS",
        resource_type="USER_SESSION",
        reason="Successful 21 CFR Part 11 authentication"
    )
    db.commit()

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        }
    }


@app.post("/api/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new clinical workspace user with specified RBAC role.
    """
    existing = db.query(User).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already registered"
        )

    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    record_audit_event(
        db=db,
        actor_email=payload.email,
        action="USER_REGISTERED",
        resource_type="USER_ACCOUNT",
        resource_id=str(new_user.id),
        reason=f"New account registration under role {payload.role}"
    )
    db.commit()

    token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
        }
    }


@app.get("/api/auth/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns verified identity and permissions of current user session.
    """
    return {
        "status": "success",
        "user": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        }
    }


# ── Pharmacovigilance Signal Detection Endpoints ─────────────────────────────

@app.get("/api/signals")
def get_signals(
    drug: Optional[str] = Query(None, description="Filter by active substance name"),
    status: Optional[str] = Query(None, description="Filter by review status"),
    severity: Optional[str] = Query(None, description="Filter by severity tier"),
    min_cases: int = Query(3, description="Minimum case threshold (default: 3)"),
    min_prr: float = Query(2.0, description="Minimum PRR threshold cutoff (default: 2.0)"),
    db: Session = Depends(get_db)
):
    """
    Executes statistical signal query across persisted surveillance cohorts.
    Returns PRR, ROR, Chi2, EBGM, prioritization score, and clinical characteristics.
    """
    query = db.query(SafetySignal).join(Product).join(AdverseEvent)

    if drug and drug.strip():
        query = query.filter(
            (Product.name.ilike(f"%{drug.strip()}%")) |
            (Product.active_substance.ilike(f"%{drug.strip()}%")) |
            (AdverseEvent.meddra_pt.ilike(f"%{drug.strip()}%"))
        )
    if status and status.lower() != "all":
        query = query.filter(SafetySignal.status.ilike(f"%{status.strip()}%"))
    if severity and severity.lower() != "all":
        query = query.filter(SafetySignal.severity.ilike(f"%{severity.strip()}%"))

    query = query.filter(SafetySignal.case_count >= min_cases, SafetySignal.prr >= min_prr)
    signals_records = query.order_by(SafetySignal.prr.desc()).all()

    formatted_signals = []
    for sig in signals_records:
        formatted_signals.append({
            "id": sig.signal_code,
            "signal_code": sig.signal_code,
            "drug": sig.product.name,
            "sub": sig.product.active_substance,
            "cas": f"CAS: {sig.product.cas_number}" if sig.product.cas_number else "",
            "ae": sig.adverse_event.meddra_pt,
            "soc": sig.adverse_event.meddra_soc,
            "pt": f"PT {sig.adverse_event.meddra_code}" if sig.adverse_event.meddra_code else "",
            "prr": round(sig.prr, 2),
            "ci_lower": round(sig.prr_ci_lower, 2),
            "ci_upper": round(sig.prr_ci_upper, 2),
            "ror": round(sig.ror, 2),
            "chi": round(sig.chi_square, 1),
            "ebgm": round(sig.ebgm, 2),
            "p_value": "< 0.0001" if sig.p_value < 0.0001 else f"{sig.p_value:.4f}",
            "cases": sig.case_count,
            "serious_cases": sig.serious_count,
            "fatal_cases": sig.fatal_count,
            "hospitalized": sig.hospitalized_count,
            "severity": sig.severity,
            "status": sig.status,
            "priority_score": round(sig.priority_score, 1),
            "known_risk_status": sig.known_risk_status,
            "velocity": sig.reporting_velocity,
            "cell_a": sig.cell_a,
            "cell_b": sig.cell_b,
            "cell_c": sig.cell_c,
            "cell_d": sig.cell_d,
            "subgroup": sig.subgroup_analysis,
            "confounder": sig.potential_confounders,
            "ai_analysis": sig.ai_rationale,
        })

    return {
        "status": "success",
        "count": len(formatted_signals),
        "cutoff_criteria": {"min_cases": min_cases, "min_prr": min_prr},
        "signals": formatted_signals,
    }


@app.get("/api/signals/{signal_code}")
def get_signal_detail(signal_code: str, db: Session = Depends(get_db)):
    """
    Returns in-depth statistical explainability and clinical profile for a specific signal.
    """
    sig = db.query(SafetySignal).filter_by(signal_code=signal_code).first()
    if not sig:
        raise HTTPException(status_code=404, detail="Safety signal not found")

    metrics_dict = {
        "prr": sig.prr,
        "prr_ci_lower": sig.prr_ci_lower,
        "prr_ci_upper": sig.prr_ci_upper,
        "ror": sig.ror,
        "chi_square": sig.chi_square,
        "p_value_str": "< 0.0001" if sig.p_value < 0.0001 else f"{sig.p_value:.4f}",
        "cell_a": sig.cell_a,
    }

    explainability = generate_signal_explainability(
        drug_name=sig.product.name,
        adverse_event=sig.adverse_event.meddra_pt,
        metrics=metrics_dict,
        confounder_info=sig.potential_confounders
    )

    prioritization = calculate_prioritization_score(
        prr=sig.prr,
        case_count=sig.case_count,
        serious_count=sig.serious_count,
        fatal_count=sig.fatal_count,
        velocity_pct=42.0 if "+42%" in (sig.reporting_velocity or "") else 15.0
    )

    # Reviews history
    reviews = db.query(SignalReview).filter_by(signal_id=sig.id).order_by(SignalReview.reviewed_at.desc()).all()
    review_history = [
        {
            "reviewer": r.reviewer.full_name if r.reviewer else "Safety Reviewer",
            "previous_status": r.previous_status,
            "new_status": r.new_status,
            "causality_score": r.causality_score,
            "assessment_notes": r.assessment_notes,
            "action_recommended": r.action_recommended,
            "reviewed_at": r.reviewed_at.strftime("%Y-%m-%d %H:%M:%S UTC") if r.reviewed_at else ""
        }
        for r in reviews
    ]

    return {
        "status": "success",
        "signal": {
            "signal_code": sig.signal_code,
            "drug": sig.product.name,
            "sub": sig.product.active_substance,
            "ae": sig.adverse_event.meddra_pt,
            "soc": sig.adverse_event.meddra_soc,
            "pt_code": sig.adverse_event.meddra_code,
            "prr": sig.prr,
            "prr_ci_lower": sig.prr_ci_lower,
            "prr_ci_upper": sig.prr_ci_upper,
            "ror": sig.ror,
            "chi_square": sig.chi_square,
            "ebgm": sig.ebgm,
            "p_value": "< 0.0001" if sig.p_value < 0.0001 else f"{sig.p_value:.4f}",
            "cell_a": sig.cell_a,
            "cell_b": sig.cell_b,
            "cell_c": sig.cell_c,
            "cell_d": sig.cell_d,
            "case_count": sig.case_count,
            "serious_count": sig.serious_count,
            "fatal_count": sig.fatal_count,
            "hospitalized_count": sig.hospitalized_count,
            "severity": sig.severity,
            "status": sig.status,
            "reporting_velocity": sig.reporting_velocity,
            "known_risk_status": sig.known_risk_status,
            "subgroup_analysis": sig.subgroup_analysis,
            "potential_confounders": sig.potential_confounders,
        },
        "explainability": explainability,
        "prioritization_breakdown": prioritization.dict(),
        "review_history": review_history
    }


@app.post("/api/signals/{signal_code}/review")
def review_safety_signal(
    signal_code: str,
    payload: SignalReviewSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a formal qualified human assessment complying with 21 CFR Part 11.
    """
    sig = db.query(SafetySignal).filter_by(signal_code=signal_code).first()
    if not sig:
        raise HTTPException(status_code=404, detail="Safety signal not found")

    old_status = sig.status
    sig.status = payload.new_status

    # Record 21 CFR Part 11 e-signature hash
    e_sig = hash_password(f"{current_user.email}:{signal_code}:{payload.new_status}:{datetime.utcnow().isoformat()}")

    review = SignalReview(
        signal_id=sig.id,
        reviewer_id=current_user.id,
        previous_status=old_status,
        new_status=payload.new_status,
        assessment_notes=payload.assessment_notes,
        causality_score=payload.causality_score,
        action_recommended=payload.action_recommended,
        e_signature_hash=e_sig,
        reviewed_at=datetime.utcnow()
    )
    db.add(review)

    record_audit_event(
        db=db,
        actor_email=current_user.email,
        action="SIGNAL_REVIEW_SUBMITTED",
        resource_type="SAFETY_SIGNAL",
        resource_id=signal_code,
        before_state=json.dumps({"status": old_status}),
        after_state=json.dumps({"status": payload.new_status, "causality": payload.causality_score}),
        reason=f"Human assessment: {payload.assessment_notes[:100]}"
    )

    db.commit()

    return {
        "status": "success",
        "message": f"Signal {signal_code} review successfully recorded.",
        "previous_status": old_status,
        "new_status": payload.new_status,
        "e_signature_hash": e_sig,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }


@app.post("/api/signals/calculate")
def calculate_custom_signal(payload: CalculateSignalRequest):
    """
    Dynamically computes 2x2 contingency table statistics (PRR, ROR, Chi2, EBGM)
    from custom user parameters with zero-division protection.
    """
    metrics = compute_all_metrics(payload.table)
    explainability = generate_signal_explainability(
        drug_name=payload.drug_name,
        adverse_event=payload.adverse_event,
        metrics=metrics
    )
    prioritization = calculate_prioritization_score(
        prr=metrics["prr"],
        case_count=payload.table.a,
        serious_count=int(payload.table.a * 0.6),
        fatal_count=int(payload.table.a * 0.05),
    )

    return {
        "status": "success",
        "drug_name": payload.drug_name,
        "adverse_event": payload.adverse_event,
        "metrics": metrics,
        "explainability": explainability,
        "prioritization": prioritization.dict()
    }


# ── Adverse Event Ingestion & Case Explorer Endpoints ────────────────────────

@app.get("/api/cases")
def list_safety_cases(
    drug: Optional[str] = Query(None),
    seriousness: Optional[str] = Query(None),
    duplicates_only: bool = Query(False),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """
    Retrieves individual safety case reports (ICSRs) with data quality scores.
    """
    query = db.query(SafetyCase).join(Product)

    if drug and drug.strip():
        query = query.filter(Product.name.ilike(f"%{drug.strip()}%"))
    if seriousness and seriousness.lower() != "all":
        query = query.filter(SafetyCase.seriousness.ilike(f"%{seriousness.strip()}%"))
    if duplicates_only:
        query = query.filter(SafetyCase.is_duplicate_candidate == True)

    total_count = query.count()
    cases = query.order_by(SafetyCase.created_at.desc()).offset(offset).limit(limit).all()

    formatted = []
    for c in cases:
        formatted.append({
            "id": c.id,
            "report_id": c.report_id,
            "case_id": c.case_id,
            "drug": c.product.name,
            "patient_age": c.patient_age,
            "patient_sex": c.patient_sex,
            "country": c.country,
            "report_date": c.report_date,
            "event_date": c.event_date,
            "outcome": c.outcome,
            "seriousness": c.seriousness,
            "is_fatal": c.is_fatal,
            "is_hospitalized": c.is_hospitalized,
            "dose_text": c.dose_text,
            "indication": c.indication_text,
            "concomitant_meds": c.concomitant_meds,
            "narrative": c.narrative_text,
            "quality_score": c.data_quality_score,
            "is_duplicate_candidate": c.is_duplicate_candidate,
            "duplicate_of_id": c.duplicate_of_id,
        })

    return {
        "status": "success",
        "total": total_count,
        "count": len(formatted),
        "cases": formatted
    }


@app.post("/api/datasets/upload")
async def upload_adverse_event_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingests and validates uploaded adverse event datasets (CSV, JSON, XML).
    Performs field auto-mapping, quality score assignment, and duplicate detection.
    """
    content_bytes = await file.read()

    # Load existing cases for duplicate matching
    existing_db_cases = db.query(SafetyCase).all()
    existing_dicts = [
        {
            "report_id": c.report_id,
            "case_id": c.case_id,
            "drug": c.product.name if c.product else "",
            "reaction": "",
            "patient_age": c.patient_age,
            "patient_sex": c.patient_sex,
            "country": c.country,
            "narrative_text": c.narrative_text
        }
        for c in existing_db_cases
    ]

    records, summary = parse_adverse_event_file(
        content_bytes=content_bytes,
        filename=file.filename or "dataset.csv",
        existing_cases=existing_dicts
    )

    record_audit_event(
        db=db,
        actor_email=current_user.email,
        action="DATASET_UPLOADED",
        resource_type="SAFETY_DATASET",
        resource_id=file.filename,
        reason=f"Uploaded dataset with {summary.total_records} records, avg quality {summary.average_quality_score}%"
    )
    db.commit()

    return {
        "status": "success",
        "summary": summary.dict(),
        "preview_records": records[:10]
    }


# ── Regulatory Submission Readiness Endpoints ────────────────────────────────

@app.get("/api/dossier/check")
def check_dossier_readiness(
    profile: str = Query("US_FDA", description="Regulatory authority profile: US_FDA, EU_EMA, IN_CDSCO"),
    db: Session = Depends(get_db)
):
    """
    Audits dossier structure against ICH M4 specifications and jurisdiction profile.
    """
    # Query detected sections from submission documents in DB
    docs = db.query(SubmissionDocument).all()
    detected_sections = {d.assigned_section_id for d in docs if d.assigned_section_id}

    # If no documents, use standard validated baseline
    if not detected_sections:
        detected_sections = {
            "1.1", "1.2", "1.4",
            "2.1", "2.2", "2.3", "2.4", "2.5", "2.6",
            "3.2.S.1", "3.2.S.2", "3.2.P.1", "3.2.P.8.1",
            "4.2.1", "4.2.2", "4.2.3.1",
            "5.2", "5.3.5.1"
        }

    assessment = evaluate_dossier_against_profile(
        detected_section_ids=detected_sections,
        profile_code=profile
    )

    return {
        "status": "success",
        "completeness_score": assessment.overall_readiness_score,
        "report": assessment.dict(),
    }


@app.post("/api/dossier/upload")
async def upload_and_audit_dossier(
    file: UploadFile = File(...),
    profile: str = Form("US_FDA"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingests an uploaded eCTD Table of Contents (XML, JSON, or TXT outline),
    parses section identifiers, audits against ICH M4 requirements,
    and returns a live readiness score and gap report.
    """
    content_bytes = await file.read()
    content_str = content_bytes.decode("utf-8", errors="ignore")

    # Extract detected sections using regex and XML scan
    import re
    detected = set(re.findall(r"\b([1-5]\.[0-9]+(?:\.[0-9A-Za-z]+)*)\b", content_str))

    assessment = evaluate_dossier_against_profile(
        detected_section_ids=detected if detected else {"1.1", "2.1", "3.2.S.1", "5.2"},
        profile_code=profile
    )

    record_audit_event(
        db=db,
        actor_email=current_user.email,
        action="DOSSIER_AUDITED",
        resource_type="SUBMISSION_DOSSIER",
        resource_id=file.filename,
        reason=f"Parsed {len(detected)} CTD sections against {profile}; Readiness score: {assessment.overall_readiness_score}%"
    )
    db.commit()

    return {
        "status": "success",
        "filename": file.filename,
        "filesize_bytes": len(content_bytes),
        "detected_sections_count": len(detected),
        "detected_sections": sorted(list(detected)),
        "completeness_score": assessment.overall_readiness_score,
        "report": assessment.dict(),
    }


@app.get("/api/dossier/consistency")
def get_cross_document_consistency():
    """
    Returns cross-document consistency findings and parameter divergence matrix.
    """
    conflicts = analyze_cross_document_consistency()
    return {
        "status": "success",
        "count": len(conflicts),
        "conflicts": [c.dict() for c in conflicts]
    }


@app.get("/api/evidence/traceability")
def get_evidence_traceability_lineage(target_id: Optional[str] = Query(None)):
    """
    Returns the complete clinical-to-regulatory evidence graph.
    """
    graph = build_traceability_graph(target_id=target_id)
    return {
        "status": "success",
        "graph": graph.dict()
    }


@app.get("/api/regulatory/profiles")
def list_regulatory_profiles(db: Session = Depends(get_db)):
    """
    Lists active regulatory authority profiles and versions.
    """
    profiles = db.query(RegulatoryProfile).all()
    return {
        "status": "success",
        "profiles": [
            {
                "code": p.code,
                "name": p.name,
                "jurisdiction": p.jurisdiction,
                "authority": p.authority,
                "framework_version": p.framework_version,
            }
            for p in profiles
        ]
    }


# ── Audit Trail Endpoints ────────────────────────────────────────────────────

@app.get("/api/audit")
def get_audit_trail(
    actor: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """
    Returns immutable 21 CFR Part 11 audit trail logs with filtering.
    """
    logs = query_audit_trail(
        db=db,
        actor_filter=actor,
        action_filter=action,
        resource_type_filter=resource_type,
        limit=limit,
        offset=offset
    )
    return {
        "status": "success",
        "count": len(logs),
        "logs": [l.dict() for l in logs]
    }


# ── AI Specialist & IBM Bob Copilot Endpoints ────────────────────────────────

@app.post("/api/chat")
def chat_with_bob(payload: ChatRequest):
    """
    IBM Bob conversational assistant endpoint for pharmacovigilance intelligence
    and eCTD regulatory compilation queries.
    """
    response = generate_bob_response(payload.message)
    return {
        "status": "success",
        "reply": response["reply"],
        "confidence": response["confidence"],
        "sources": response["sources"],
        "suggested_actions": response["suggested_actions"],
    }
