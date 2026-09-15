"""
Enterprise Relational Domain Models
===================================
Compliant with 21 CFR Part 11, ICH M4 (R4), and CIOMS VIII standards.
Provides relational mappings for Pharmacovigilance surveillance,
Dossier submission readiness, Cross-document consistency, and GxP Audit Trails.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from db.session import Base


class Organization(Base):
    """
    Organization entity representing marketing authorization holders (MAH),
    sponsor entities, or regulatory health authority tenants.
    """
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    regulatory_jurisdiction = Column(String(50), default="US-FDA")
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    submissions = relationship("Submission", back_populates="organization")


class User(Base):
    """
    Authenticated user account with role-based access control (RBAC).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="pharmacovigilance_analyst")
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    reviews = relationship("SignalReview", back_populates="reviewer")


class Product(Base):
    """
    Pharmaceutical medicinal product or investigational active moiety.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    active_substance = Column(String(255), nullable=False)
    cas_number = Column(String(50), nullable=True)
    anatomical_class = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True)
    strength = Column(String(100), nullable=True)
    indication = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    safety_cases = relationship("SafetyCase", back_populates="product")
    signals = relationship("SafetySignal", back_populates="product")
    submissions = relationship("Submission", back_populates="product")


class AdverseEvent(Base):
    """
    Standardized medical adverse event term mapped to MedDRA terminology.
    """
    __tablename__ = "adverse_events"

    id = Column(Integer, primary_key=True, index=True)
    meddra_pt = Column(String(255), nullable=False, index=True)  # Preferred Term
    meddra_soc = Column(String(255), nullable=False, index=True)  # System Organ Class
    meddra_llt = Column(String(255), nullable=True)  # Lowest Level Term
    meddra_code = Column(String(50), nullable=True)
    term_raw = Column(String(255), nullable=True)

    cases = relationship("CaseEventLink", back_populates="event")
    signals = relationship("SafetySignal", back_populates="adverse_event")


class SafetyCase(Base):
    """
    Canonical individual safety case report (ICSR) ingested from FAERS,
    EudraVigilance, clinical trial databases, or hospital reporting feeds.
    """
    __tablename__ = "safety_cases"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(100), unique=True, index=True, nullable=False)
    case_id = Column(String(100), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    patient_age = Column(Float, nullable=True)
    patient_sex = Column(String(20), nullable=True)
    country = Column(String(50), default="US")
    report_date = Column(String(50), nullable=True)
    event_date = Column(String(50), nullable=True)
    outcome = Column(String(100), nullable=True)
    seriousness = Column(String(50), default="Serious")
    is_fatal = Column(Boolean, default=False)
    is_hospitalized = Column(Boolean, default=False)
    dose_text = Column(String(100), nullable=True)
    route = Column(String(100), nullable=True)
    indication_text = Column(String(255), nullable=True)
    concomitant_meds = Column(Text, nullable=True)
    reporter_type = Column(String(100), default="Physician")
    narrative_text = Column(Text, nullable=True)
    data_quality_score = Column(Integer, default=100)
    is_duplicate_candidate = Column(Boolean, default=False)
    duplicate_of_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="safety_cases")
    events = relationship("CaseEventLink", back_populates="case")


class CaseEventLink(Base):
    """
    Associative mapping linking individual adverse events to an ICSR case.
    """
    __tablename__ = "case_event_links"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("safety_cases.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("adverse_events.id"), nullable=False)

    case = relationship("SafetyCase", back_populates="events")
    event = relationship("AdverseEvent", back_populates="cases")


class SafetySignal(Base):
    """
    Pharmacovigilance safety signal generated via disproportionality algorithms.
    """
    __tablename__ = "safety_signals"

    id = Column(Integer, primary_key=True, index=True)
    signal_code = Column(String(50), unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    adverse_event_id = Column(Integer, ForeignKey("adverse_events.id"), nullable=False)

    # 2x2 Contingency Table Counts
    cell_a = Column(Integer, default=0)
    cell_b = Column(Integer, default=0)
    cell_c = Column(Integer, default=0)
    cell_d = Column(Integer, default=0)

    # Disproportionality Metrics
    prr = Column(Float, nullable=False)
    prr_ci_lower = Column(Float, default=0.0)
    prr_ci_upper = Column(Float, default=0.0)
    ror = Column(Float, default=0.0)
    ror_ci_lower = Column(Float, default=0.0)
    ror_ci_upper = Column(Float, default=0.0)
    chi_square = Column(Float, default=0.0)
    p_value = Column(Float, default=1.0)
    ebgm = Column(Float, default=0.0)

    # Clinical Characteristics
    case_count = Column(Integer, default=0)
    serious_count = Column(Integer, default=0)
    fatal_count = Column(Integer, default=0)
    hospitalized_count = Column(Integer, default=0)
    reporting_velocity = Column(String(50), default="Stable")
    severity = Column(String(50), default="Moderate")  # Critical, Severe, Moderate, Monitoring
    status = Column(String(50), default="Emerging")  # Emerging, Under Review, Validated, Closed
    priority_score = Column(Float, default=50.0)
    known_risk_status = Column(String(50), default="Potentially New")  # Known, Partially Known, Potentially New, Unverified

    # Analytical Context
    subgroup_analysis = Column(Text, nullable=True)
    potential_confounders = Column(Text, nullable=True)
    ai_rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="signals")
    adverse_event = relationship("AdverseEvent", back_populates="signals")
    reviews = relationship("SignalReview", back_populates="signal")


class SignalReview(Base):
    """
    Formal human qualified assessment record compliant with 21 CFR Part 11.
    """
    __tablename__ = "signal_reviews"

    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("safety_signals.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    assessment_notes = Column(Text, nullable=False)
    causality_score = Column(String(50), default="Probable")  # Certain, Probable, Possible, Unlikely
    action_recommended = Column(String(255), nullable=True)
    e_signature_hash = Column(String(255), nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    signal = relationship("SafetySignal", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")


class RegulatoryProfile(Base):
    """
    Configurable regulatory authority rule set (e.g., US FDA, EU EMA, India CDSCO).
    """
    __tablename__ = "regulatory_profiles"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    jurisdiction = Column(String(50), nullable=False)
    authority = Column(String(100), nullable=False)
    framework_version = Column(String(50), default="ICH M4 (R4)")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="regulatory_profile")


class CTDModule(Base):
    """
    Master ICH Common Technical Document (CTD) Module (1 to 5).
    """
    __tablename__ = "ctd_modules"

    id = Column(Integer, primary_key=True, index=True)
    module_code = Column(String(10), unique=True, nullable=False)  # M1, M2, M3, M4, M5
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1)

    sections = relationship("CTDSection", back_populates="module")


class CTDSection(Base):
    """
    Detailed subsection requirements within an ICH CTD Module.
    """
    __tablename__ = "ctd_sections"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., '2.5', '5.3.5.3'
    module_code = Column(String(10), ForeignKey("ctd_modules.module_code"), nullable=False)
    title = Column(String(255), nullable=False)
    regulatory_rule = Column(String(100), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    description = Column(Text, nullable=True)

    module = relationship("CTDModule", back_populates="sections")


class Submission(Base):
    """
    Regulatory submission dossier instance (e.g. NDA, BLA, MAA, IND).
    """
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("regulatory_profiles.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    submission_type = Column(String(50), default="NDA")  # NDA, BLA, MAA, ANDA
    status = Column(String(50), default="In Review")
    overall_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="submissions")
    regulatory_profile = relationship("RegulatoryProfile", back_populates="submissions")
    organization = relationship("Organization", back_populates="submissions")
    documents = relationship("SubmissionDocument", back_populates="submission")
    gaps = relationship("GapFinding", back_populates="submission")
    inconsistencies = relationship("CrossDocumentInconsistency", back_populates="submission")


class SubmissionDocument(Base):
    """
    Uploaded regulatory document associated with a CTD section.
    """
    __tablename__ = "submission_documents"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), default="xml")
    file_size_bytes = Column(Integer, default=0)
    assigned_section_id = Column(String(50), nullable=True)
    classification_confidence = Column(Float, default=1.0)
    status = Column(String(50), default="Validated")
    extracted_text_snippet = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="documents")


class GapFinding(BaseModel := Base):
    """
    Audit finding and deficiency identified during dossier structural evaluation.
    """
    __tablename__ = "gap_findings"

    id = Column(Integer, primary_key=True, index=True)
    finding_code = Column(String(50), unique=True, index=True, nullable=False)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    module_code = Column(String(10), nullable=False)
    section_id = Column(String(50), nullable=False)
    section_name = Column(String(255), nullable=False)
    severity = Column(String(50), default="major")  # critical, major, minor, informational
    issue_type = Column(String(100), nullable=False)
    finding_text = Column(Text, nullable=False)
    regulatory_rule = Column(String(100), nullable=False)
    impact_statement = Column(Text, nullable=False)
    remediation_action = Column(Text, nullable=False)
    status = Column(String(50), default="Open")  # Open, Resolved, Waived
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="gaps")


class CrossDocumentInconsistency(Base):
    """
    Detected factual conflict or parameter divergence across multiple documents.
    """
    __tablename__ = "cross_document_inconsistencies"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    entity_type = Column(String(100), nullable=False)  # e.g., 'Dosage Strength', 'Active Substance', 'Patient Count'
    document_a_name = Column(String(255), nullable=False)
    document_a_value = Column(String(255), nullable=False)
    document_b_name = Column(String(255), nullable=False)
    document_b_value = Column(String(255), nullable=False)
    conflict_description = Column(Text, nullable=False)
    severity = Column(String(50), default="Major")  # Critical, Major, Minor
    status = Column(String(50), default="Unresolved")  # Unresolved, Reconciled
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="inconsistencies")


class TraceabilityLink(Base):
    """
    Graph edge establishing end-to-end evidence lineage from raw safety data
    to regulatory CTD dossier requirements.
    """
    __tablename__ = "traceability_links"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(50), nullable=False)  # Drug, Case, Event, Signal
    source_id = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)  # Evidence, Study, Document, CTD_Section
    target_id = Column(String(100), nullable=False)
    relation_type = Column(String(100), default="evidences")
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditEvent(Base):
    """
    Immutable 21 CFR Part 11 compliant audit trail record.
    Tracks all security, signal status, dossier verification, and data mutation events.
    """
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    actor_email = Column(String(255), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # LOGIN, SIGNAL_REVIEW, DOSSIER_UPLOAD, etc.
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    before_state = Column(Text, nullable=True)
    after_state = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
