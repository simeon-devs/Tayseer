"""Server-side derivation of document-backed escalation signals.

The citizen intake flow lets a citizen type their own financial figures and
separately upload supporting documents. The two were never cross-checked:
has_expired_id and suspected_fraud on CitizenFinancialProfile were only ever
set by whatever the client sent, defaulting to False. This module derives
both signals from the actual extracted document data stored in the documents
table, so the decision engine no longer has to trust client-supplied claims
about identity expiry or income consistency.

Signals here only ever escalate: a document-derived True can raise
has_expired_id or suspected_fraud from False to True, but a document-derived
False never downgrades a client-asserted True. Every function degrades
gracefully and never raises; missing documents, missing fields, or unparsable
values simply mean the signal cannot be derived, not that the pipeline fails.
"""

from __future__ import annotations

import logging
import uuid
from datetime import date

from sqlalchemy.orm import Session

from backend.extraction.normalization import parse_document_date
from backend.models.document import Document
from backend.schemas.decisions import CitizenFinancialProfile

logger = logging.getLogger(__name__)

_FRAUD_INCOME_TOLERANCE = 0.40


def is_id_expired(expiry_date_str: str | None, today: date | None = None) -> bool:
    """Return True if expiry_date_str parses to a date before today.

    Returns False if expiry_date_str is empty or does not match a known date
    format, since an unparseable date cannot be used to prove expiry.
    """
    parsed = parse_document_date(expiry_date_str)
    if parsed is None:
        return False
    return parsed < (today or date.today())


def is_income_inconsistent(
    monthly_income: float,
    declared_salary: float | None,
    tolerance: float = _FRAUD_INCOME_TOLERANCE,
) -> bool:
    """Return True if declared_salary differs from monthly_income by more than tolerance.

    Compares the citizen's self-reported monthly_income against the salary
    figure extracted from their uploaded salary certificate. Returns False if
    monthly_income is not positive or declared_salary is unavailable, since
    no comparison can be made.
    """
    if monthly_income <= 0 or declared_salary is None:
        return False
    deviation = abs(monthly_income - declared_salary) / monthly_income
    return deviation > tolerance


def _latest_document(db: Session, case_id: str, document_type: str) -> Document | None:
    """Return the most recently uploaded document of document_type for a case.

    Returns None on any lookup failure (invalid UUID, database error) or when
    no matching document exists. Never raises.
    """
    try:
        case_uuid = uuid.UUID(case_id)
        return (
            db.query(Document)
            .filter(Document.case_id == case_uuid, Document.document_type == document_type)
            .order_by(Document.created_at.desc())
            .first()
        )
    except Exception as exc:
        logger.warning("Document lookup failed for case %s type %s: %s", case_id, document_type, exc)
        return None


def derive_has_expired_id(db: Session, case_id: str) -> bool:
    """Return True if the case's uploaded Emirates ID has a past expiry date.

    Returns False if no Emirates ID document was uploaded or its expiry_date
    could not be extracted or parsed.
    """
    document = _latest_document(db, case_id, "emirates_id")
    if document is None or not document.extracted_fields:
        return False
    return is_id_expired(document.extracted_fields.get("expiry_date"))


def derive_suspected_fraud(db: Session, case_id: str, monthly_income: float) -> bool:
    """Return True if the case's uploaded salary certificate contradicts the declared income.

    Compares monthly_income against the salary certificate's net_salary,
    falling back to monthly_salary if net_salary was not extracted. Returns
    False if no salary certificate was uploaded or no salary figure could be
    extracted from it.
    """
    document = _latest_document(db, case_id, "salary_certificate")
    if document is None or not document.extracted_fields:
        return False
    fields = document.extracted_fields
    declared_salary = fields.get("net_salary")
    if declared_salary is None:
        declared_salary = fields.get("monthly_salary")
    return is_income_inconsistent(monthly_income, declared_salary)


def augment_profile_with_documents(
    profile: CitizenFinancialProfile,
    db: Session,
    case_id: str,
) -> CitizenFinancialProfile:
    """Return a copy of profile with has_expired_id and suspected_fraud escalated from document data.

    Only ever raises has_expired_id or suspected_fraud from False to True;
    never downgrades a value the client already asserted as True. On any
    failure, logs a warning and returns profile unchanged so the decision
    pipeline always proceeds.
    """
    try:
        doc_expired = derive_has_expired_id(db, case_id)
        doc_fraud = derive_suspected_fraud(db, case_id, profile.monthly_income)
        return profile.model_copy(
            update={
                "has_expired_id": profile.has_expired_id or doc_expired,
                "suspected_fraud": profile.suspected_fraud or doc_fraud,
            }
        )
    except Exception as exc:
        logger.warning("Document signal augmentation failed for case %s: %s", case_id, exc)
        return profile
