"""FastAPI router for the B2 decision endpoint.

Exposes POST /api/decision which accepts a DecisionRequest and returns a DecisionOutput.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.engine.decision import make_decision
from backend.schemas.decisions import DecisionOutput, DecisionRequest
from backend.schemas.documents import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["decisions"])


@router.post("/decision", response_model=DecisionOutput)
async def create_decision(
    request: DecisionRequest,
    db: Session = Depends(get_db),
) -> DecisionOutput:
    """Run the AI decision pipeline for a citizen rescheduling case.

    Accepts a case_id and full CitizenFinancialProfile. Returns a structured
    DecisionOutput with escalate_flag, approved terms or escalation reason,
    rationale in both languages, and the governance rules applied.
    """
    try:
        result = make_decision(
            case_id=request.case_id,
            profile=request.citizen_profile,
            db=db,
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
