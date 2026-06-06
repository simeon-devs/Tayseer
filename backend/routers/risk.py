"""FastAPI router for risk intelligence endpoints.

GET /api/risk/summary              returns aggregate risk counts
GET /api/risk/citizens             returns all active citizen risk profiles
GET /api/risk/citizens/{citizen_id} returns one citizen's risk profile or 404
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.engine.risk import (
    CitizenRiskProfile,
    RiskLevel,
    analyse_all_citizens,
    get_risk_summary,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/risk", tags=["risk"])


class RiskSummaryResponse(BaseModel):
    """Aggregate risk count returned by GET /api/risk/summary."""

    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    total_analysed: int
    last_updated: str


@router.get("/summary", response_model=RiskSummaryResponse)
async def risk_summary(db: Session = Depends(get_db)) -> RiskSummaryResponse:
    """Return aggregate risk counts across all active cases."""
    try:
        data = get_risk_summary(db)
        return RiskSummaryResponse(**data)
    except Exception as exc:
        logger.error("risk_summary endpoint failed: %s", exc)
        raise HTTPException(status_code=500, detail={"message": "Risk summary unavailable"})


@router.get("/citizens", response_model=list[CitizenRiskProfile])
async def list_citizen_risks(
    level: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> list[CitizenRiskProfile]:
    """Return risk profiles for all active citizens, sorted by risk_score descending.

    Optional query parameter ?level=HIGH|MEDIUM|LOW filters by risk tier.
    """
    try:
        profiles = analyse_all_citizens(db)
        if level:
            try:
                target = RiskLevel(level.upper())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail={"message": f"Invalid level '{level}'. Must be HIGH, MEDIUM, or LOW."},
                )
            profiles = [p for p in profiles if p.risk_level == target]
        return profiles
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("list_citizen_risks endpoint failed: %s", exc)
        raise HTTPException(status_code=500, detail={"message": "Risk analysis unavailable"})


@router.get("/citizens/{citizen_id}", response_model=CitizenRiskProfile)
async def get_citizen_risk(
    citizen_id: str,
    db: Session = Depends(get_db),
) -> CitizenRiskProfile:
    """Return the risk profile for one citizen by their citizen UUID.

    Returns 404 when the citizen has no active cases in the system.
    """
    try:
        profiles = analyse_all_citizens(db)
        for profile in profiles:
            if profile.citizen_id == citizen_id:
                return profile
        raise HTTPException(
            status_code=404,
            detail={"message": f"No active case found for citizen {citizen_id}"},
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("get_citizen_risk endpoint failed for %s: %s", citizen_id, exc)
        raise HTTPException(status_code=500, detail={"message": "Risk analysis unavailable"})
