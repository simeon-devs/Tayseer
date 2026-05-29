"""FastAPI router for the B3 analytics endpoint.

Exposes GET /api/analytics/summary which calculates all dashboard metrics
from the database in a single response. before_avg_days is hardcoded as 5
matching the challenge brief. All other metrics are computed from live data.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.case import Case
from backend.models.decision import Decision
from backend.schemas.cases import AnalyticsSummary
from backend.schemas.documents import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analytics"])

_BEFORE_AVG_DAYS = 5


@router.get("/analytics/summary", response_model=AnalyticsSummary)
async def analytics_summary(db: Session = Depends(get_db)) -> AnalyticsSummary:
    """Return all dashboard metrics computed from the live database."""
    try:
        total_cases = db.query(func.count(Case.id)).scalar() or 0
        auto_approved = db.query(func.count(Case.id)).filter(Case.status == "approved").scalar() or 0
        escalated = db.query(func.count(Case.id)).filter(Case.status == "escalated").scalar() or 0
        overridden = db.query(func.count(Case.id)).filter(Case.status == "overridden").scalar() or 0

        resolution_seconds_row = db.query(
            func.avg(
                func.extract("epoch", Decision.created_at) - func.extract("epoch", Case.created_at)
            )
        ).join(Case, Decision.case_id == Case.id).scalar()

        avg_resolution_seconds = float(resolution_seconds_row) if resolution_seconds_row else 0.0
        after_avg_seconds = avg_resolution_seconds

        if total_cases > 0:
            approval_rate = round((auto_approved / total_cases) * 100, 1)
            escalation_rate = round((escalated / total_cases) * 100, 1)
            override_rate = round((overridden / total_cases) * 100, 1)
        else:
            approval_rate = 0.0
            escalation_rate = 0.0
            override_rate = 0.0

        return AnalyticsSummary(
            total_cases=total_cases,
            auto_approved=auto_approved,
            escalated=escalated,
            overridden=overridden,
            avg_resolution_seconds=round(avg_resolution_seconds, 2),
            approval_rate=approval_rate,
            escalation_rate=escalation_rate,
            override_rate=override_rate,
            before_avg_days=_BEFORE_AVG_DAYS,
            after_avg_seconds=round(after_avg_seconds, 2),
        )

    except Exception as exc:
        logger.error("analytics_summary failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Failed to compute analytics", detail=str(exc)).model_dump(),
        )
