"""FastAPI router for D1 public QR verification endpoint.

Exposes GET /api/verify/:case_uuid which is a public endpoint that returns
document authenticity information for QR code scanning. No authentication required.
"""

from __future__ import annotations

import logging
import uuid as uuid_lib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from backend.database import get_db
from backend.models.case import Case
from backend.schemas.cases import VerificationResponse
from backend.schemas.documents import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["verification"])


@router.get("/verify/{case_uuid}", response_model=VerificationResponse)
async def verify_case(
    case_uuid: str,
    db: Session = Depends(get_db),
) -> VerificationResponse:
    """Public verification endpoint. No authentication required.

    Returns decision authenticity information for a scanned QR code.
    """
    try:
        parsed_uuid = uuid_lib.UUID(case_uuid)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(message="Invalid case UUID format", code="VALIDATION_ERROR").model_dump(),
        )

    try:
        case = (
            db.query(Case)
            .options(selectinload(Case.citizen), selectinload(Case.decision))
            .filter(Case.id == parsed_uuid)
            .first()
        )
        if not case:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(message="Case not found", code="CASE_NOT_FOUND").model_dump(),
            )

        decision = case.decision
        decision_date = ""
        decision_summary = "No decision on record."

        if decision:
            if decision.created_at:
                decision_date = decision.created_at.strftime("%d %B %Y")
            if decision.escalate_flag:
                reason = (decision.escalation_reason or "under review")[:120]
                decision_summary = f"Application under review: {reason}"
            else:
                amount = decision.approved_amount or 0
                months = decision.duration_months or 0
                instalment = decision.monthly_instalment or 0
                decision_summary = (
                    f"Approved AED {amount:,.2f} over {months} months "
                    f"at AED {instalment:,.2f} per month"
                )

        return VerificationResponse(
            case_reference=str(case.id)[:8].upper(),
            citizen_name_en=case.citizen.name_en,
            decision_summary=decision_summary,
            decision_date=decision_date,
            verified=True,
            message_en="This decision was issued by the Tayseer AI system and is officially authenticated.",
            message_ar="هذا القرار صادر من نظام تيسير للذكاء الاصطناعي وهو موثق رسمياً.",
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("verify_case failed for %s: %s", case_uuid, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Verification failed", detail=str(exc)).model_dump(),
        )
