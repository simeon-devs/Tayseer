"""FastAPI router for the B2 decision endpoint.

Exposes POST /api/decision which accepts a DecisionRequest and returns a DecisionOutput.
"""

from __future__ import annotations

import logging
import uuid as uuid_lib

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.engine.decision import make_decision
from backend.models.case import Case
from backend.models.citizen import Citizen
from backend.schemas.decisions import DecisionOutput, DecisionRequest
from backend.schemas.documents import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["decisions"])

_ACTIVE_STATUSES = {"pending", "processing", "approved"}


def check_active_request(db: Session, case_id: str) -> str | None:
    """Rule 3: return an error message if the citizen already has another active request.

    Looks up the case by case_id, finds the citizen, then queries for any other case
    belonging to the same citizen with a status in _ACTIVE_STATUSES.
    Returns None when no duplicate is found.
    """
    try:
        case_uuid = uuid_lib.UUID(case_id)
    except (ValueError, AttributeError):
        return None

    case = db.query(Case).filter(Case.id == case_uuid).first()
    if case is None:
        return None

    duplicate = (
        db.query(Case)
        .filter(
            Case.citizen_id == case.citizen_id,
            Case.id != case_uuid,
            Case.status.in_(_ACTIVE_STATUSES),
        )
        .first()
    )
    if duplicate is None:
        return None

    return (
        f"Rule 3 violation: this citizen already has an active rescheduling request "
        f"(case {str(duplicate.id)[:8].upper()}) with status '{duplicate.status}'. "
        "Only one active request is permitted at a time."
    )


def _is_valid_uuid(value: str) -> bool:
    """Return True if value is a well-formed UUID string."""
    try:
        uuid_lib.UUID(value)
        return True
    except (ValueError, AttributeError):
        return False


@router.post("/decision", response_model=DecisionOutput)
async def create_decision(
    request: DecisionRequest,
    db: Session = Depends(get_db),
) -> DecisionOutput:
    """Run the AI decision pipeline for a citizen rescheduling case.

    Accepts a case_id and full CitizenFinancialProfile. Returns a structured
    DecisionOutput with escalate_flag, approved terms or escalation reason,
    rationale in both languages, and the governance rules applied.

    If case_id is not a valid UUID the database write is skipped and the full
    decision pipeline still runs and returns a result. This allows testing
    without a real case row in the database.
    """
    db_session: Session | None = db if _is_valid_uuid(request.case_id) else None
    if db_session is None:
        logger.info("case_id %r is not a UUID; DB writes will be skipped", request.case_id)

    # Rule 3: reject if citizen already has an active request
    if db_session is not None:
        rule3_error = check_active_request(db_session, request.case_id)
        if rule3_error:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=ErrorResponse(
                    message=rule3_error,
                    code="DUPLICATE_ACTIVE_REQUEST",
                ).model_dump(),
            )

    try:
        result = make_decision(
            case_id=request.case_id,
            profile=request.citizen_profile,
            db=db_session,
        )
        return result
    except Exception as exc:
        logger.error("Decision endpoint failed for case %s: %s", request.case_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Decision processing failed",
                detail=str(exc),
                code="DECISION_ERROR",
            ).model_dump(),
        )
