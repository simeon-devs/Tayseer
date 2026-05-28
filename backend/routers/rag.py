"""RAG retrieval router for Tayseer governance rule queries.

Exposes POST /api/rag/retrieve for testing and debugging the RAG pipeline.
Accepts a citizen financial profile and returns the top 5 most relevant rules.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.rag.retrieval import retrieve_rules

router = APIRouter(prefix="/api/rag", tags=["rag"])


class CitizenProfile(BaseModel):
    """Financial profile used to query the governance rules index."""

    monthly_income: float
    existing_obligations: float
    arrears_amount: float
    delay_duration_months: int
    has_expired_id: bool = False
    missing_documents: list[str] = []


class RetrieveResponse(BaseModel):
    """Response schema for the rule retrieval endpoint."""

    rules: list[str]
    count: int


@router.post("/retrieve", response_model=RetrieveResponse)
async def retrieve(profile: CitizenProfile) -> RetrieveResponse:
    """Retrieve the top 5 governance rules most relevant to a citizen financial profile.

    This endpoint is intended for testing and debugging the RAG pipeline.
    In production the decision engine calls retrieve_rules directly.
    """
    try:
        profile_dict = profile.model_dump()
        rules = retrieve_rules(profile_dict)
        return RetrieveResponse(rules=rules, count=len(rules))
    except Exception as exc:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(exc))
