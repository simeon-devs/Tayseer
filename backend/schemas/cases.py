"""Pydantic schemas for the B3 case management and copilot endpoints.

These schemas cover case creation, case detail responses, staff overrides,
status updates, copilot requests, and analytics summaries.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from backend.schemas.decisions import DecisionOutput
from backend.schemas.documents import DocumentResult


class CitizenResponse(BaseModel):
    """Citizen profile fields returned in API responses."""

    id: str
    name_ar: str
    name_en: str
    emirates_id: str
    phone: Optional[str] = None
    email: Optional[str] = None


class CaseResponse(BaseModel):
    """Basic case fields returned after create or status update."""

    id: str
    citizen_id: str
    status: str
    created_at: str
    updated_at: str
    assigned_to: Optional[str] = None
    arrears_amount: Optional[float] = None


class CaseCreateRequest(BaseModel):
    """Request body for POST /api/cases."""

    citizen_name_ar: str = Field(..., description="Citizen full name in Arabic")
    citizen_name_en: str = Field(..., description="Citizen full name in English transliteration")
    emirates_id: str = Field(..., description="Emirates ID in format 784-XXXX-XXXXXXX-X")
    phone: Optional[str] = None
    email: Optional[str] = None
    monthly_income: float = Field(..., description="Net monthly income in AED")
    existing_obligations: float = Field(..., description="Total existing monthly obligations in AED")
    arrears_amount: float = Field(..., description="Total outstanding arrears in AED")
    delay_duration_months: int = Field(..., description="Number of months payments have been delayed")
    reason_for_request: str = Field(..., description="Citizen explanation for the rescheduling request")
    documents_submitted: list[str] = Field(default_factory=list, description="List of document types submitted")


class OverrideRequest(BaseModel):
    """Request body for PATCH /api/cases/:id/override.

    Justification length is validated at the endpoint level (400) not Pydantic level (422).
    """

    staff_id: str = Field(..., description="ID of the staff member performing the override")
    new_amount: Optional[float] = Field(None, description="New approved amount in AED")
    new_duration: Optional[int] = Field(None, description="New repayment duration in months")
    justification: str = Field(..., description="Reason for overriding the AI decision (minimum 20 characters)")


class StatusUpdateRequest(BaseModel):
    """Request body for PATCH /api/cases/:id/status."""

    status: str = Field(..., description="New case status")
    performed_by: str = Field(default="system", description="ID of the user or system updating the status")


class CaseDetailResponse(BaseModel):
    """Full case detail including citizen, documents, and decision."""

    case: CaseResponse
    citizen: CitizenResponse
    documents: list[DocumentResult]
    decision: Optional[DecisionOutput] = None


class CopilotRequest(BaseModel):
    """Request body for POST /api/copilot."""

    case_id: str = Field(..., description="UUID of the case to query")
    question: str = Field(..., description="Natural language question from the staff reviewer")


class CopilotResponse(BaseModel):
    """Response from the AI copilot with answers in both languages."""

    answer_en: str
    answer_ar: str
    case_id: str


class AnalyticsSummary(BaseModel):
    """All dashboard metrics returned in a single response."""

    total_cases: int
    auto_approved: int
    escalated: int
    overridden: int
    avg_resolution_seconds: float
    approval_rate: float
    escalation_rate: float
    override_rate: float
    before_avg_days: int
    after_avg_seconds: float


class VerificationResponse(BaseModel):
    """Public document verification response returned by GET /api/verify/:case_uuid."""

    case_reference: str
    citizen_name_en: str
    decision_summary: str
    decision_date: str
    verified: bool
    message_en: str
    message_ar: str
