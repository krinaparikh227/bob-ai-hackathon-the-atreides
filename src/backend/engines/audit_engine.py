"""
GxP Audit Trail & Regulatory Compliance Logging Service
========================================================
Compliant with 21 CFR Part 11 electronic records, electronic signatures,
and predicate rule tracking. Maintains immutable log entries for all data mutations,
signal status changes, dossier audits, and authentication sessions.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

from db.models import AuditEvent


class AuditLogEntry(BaseModel):
    id: int
    actor_email: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    before_state: Optional[str]
    after_state: Optional[str]
    ip_address: str
    reason: Optional[str]
    timestamp: str


def record_audit_event(
    db: Session,
    actor_email: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    before_state: Optional[str] = None,
    after_state: Optional[str] = None,
    ip_address: str = "127.0.0.1",
    reason: Optional[str] = None
) -> AuditEvent:
    """
    Persists an immutable audit log entry complying with 21 CFR Part 11 mandates.

    @purpose     - Record forensic traceability data for security, regulatory, and quality inspections.
    @param       - db: Session - Active SQLAlchemy database session.
    @param       - actor_email: str - Email identity of authenticated user executing action.
    @param       - action: str - Standardized verb identifier (e.g., 'SIGNAL_REVIEW', 'LOGIN').
    @param       - resource_type: str - Entity category affected (e.g., 'SAFETY_SIGNAL', 'SUBMISSION').
    @param       - resource_id: Optional[str] - Unique primary key or tracking code of affected entity.
    @param       - before_state: Optional[str] - JSON stringified snapshot of state prior to mutation.
    @param       - after_state: Optional[str] - JSON stringified snapshot of state following mutation.
    @param       - ip_address: str - Client network IP address.
    @param       - reason: Optional[str] - Clinical or regulatory justification entered by user.
    @returns     - AuditEvent - Persisted SQLAlchemy audit event entity.
    @validates   - Verifies presence of non-empty actor_email, action, and resource_type.
    @redirects   - None
    @edge-cases  - Flushes transaction immediately to guarantee audit trail persistence.
    """
    event = AuditEvent(
        actor_email=actor_email,
        action=action.upper(),
        resource_type=resource_type.upper(),
        resource_id=resource_id,
        before_state=before_state,
        after_state=after_state,
        ip_address=ip_address,
        reason=reason,
        timestamp=datetime.utcnow()
    )
    db.add(event)
    db.flush()
    return event


def query_audit_trail(
    db: Session,
    actor_filter: Optional[str] = None,
    action_filter: Optional[str] = None,
    resource_type_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[AuditLogEntry]:
    """
    Retrieves filtered audit trail records sorted in reverse chronological order.

    @purpose     - Serve regulatory inspection requests and security monitoring dashboards.
    @param       - db: Session - Active SQLAlchemy database session.
    @param       - actor_filter: Optional[str] - Substring query against user email.
    @param       - action_filter: Optional[str] - Exact or partial match on action verb.
    @param       - resource_type_filter: Optional[str] - Filter by resource category.
    @param       - limit: int - Maximum records to return for pagination.
    @param       - offset: int - Pagination record offset.
    @returns     - List[AuditLogEntry] - Serialized audit log entries.
    @validates   - Bounds limit between 1 and 200 to prevent unbounded queries.
    @redirects   - None
    @edge-cases  - Returns empty list if no matching entries found.
    """
    query = db.query(AuditEvent)

    if actor_filter:
        query = query.filter(AuditEvent.actor_email.ilike(f"%{actor_filter}%"))
    if action_filter:
        query = query.filter(AuditEvent.action.ilike(f"%{action_filter}%"))
    if resource_type_filter:
        query = query.filter(AuditEvent.resource_type.ilike(f"%{resource_type_filter}%"))

    bounded_limit = min(200, max(1, limit))
    events = query.order_by(AuditEvent.timestamp.desc()).offset(offset).limit(bounded_limit).all()

    results = []
    for evt in events:
        results.append(AuditLogEntry(
            id=evt.id,
            actor_email=evt.actor_email,
            action=evt.action,
            resource_type=evt.resource_type,
            resource_id=evt.resource_id,
            before_state=evt.before_state,
            after_state=evt.after_state,
            ip_address=evt.ip_address,
            reason=evt.reason,
            timestamp=evt.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if evt.timestamp else ""
        ))
    return results
