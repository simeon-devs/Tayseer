"""Pydantic schemas for the B2 decision engine.

DecisionOutput is the structured response model enforced by Instructor on every LLM call.
DecisionRequest is the API request body for POST /api/decision.
CitizenFinancialProfile carries all financial and eligibility fields for a single citizen.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class CitizenFinancialProfile(BaseModel):
    """All financial and eligibility data required to make a rescheduling decision."""

    monthly_income: float = Field(..., description="Net monthly income in AED")
    existing_obligations: float = Field(..., description="Total existing monthly debt obligations in AED")
    arrears_amount: float = Field(..., description="Total outstanding arrears in AED")
    delay_duration_months: int = Field(..., description="Number of months payments have been delayed")
    has_expired_id: bool = Field(default=False, description="True if the Emirates ID has expired")
    missing_documents: list[str] = Field(default_factory=list, description="List of required documents not submitted")
    payment_history_clean: bool = Field(default=False, description="True if citizen has no prior defaults")
    previous_rejected_applications: int = Field(default=0, description="Number of previously rejected rescheduling applications")
    is_widowed_or_divorced: bool = Field(default=False, description="True if citizen is widowed or divorced")
    has_disability: bool = Field(default=False, description="True if citizen has a registered disability")
    number_of_properties: int = Field(default=1, description="Number of properties owned by citizen")
    salary_certificate_age_months: int = Field(default=0, description="Age of the submitted salary certificate in months")
    suspected_fraud: bool = Field(default=False, description="True if a fraud signal has been raised by the document verification pipeline")


class DecisionOutput(BaseModel):
    """Structured LLM output enforced by Instructor. Represents a rescheduling decision."""

    approved_amount: Optional[float] = Field(None, description="Approved rescheduling amount in AED")
    duration_months: Optional[int] = Field(None, description="Approved repayment duration in months")
    monthly_instalment: Optional[float] = Field(None, description="Calculated monthly instalment in AED")
    hardship_score: Optional[float] = Field(None, description="Hardship score between 0.0 and 1.0")
    escalate_flag: bool = Field(..., description="True if case must be escalated to a human officer")
    escalation_reason: Optional[str] = Field(None, description="Reason for escalation if escalate_flag is True")
    rationale_en: str = Field(..., description="Decision rationale in English")
    rationale_ar: str = Field(..., description="Decision rationale in Arabic")
    rules_applied: list[str] = Field(default_factory=list, description="List of rule IDs applied to this decision")
    confidence_score: float = Field(..., description="Model confidence in the decision between 0.0 and 1.0")


class DecisionRequest(BaseModel):
    """Request body for POST /api/decision."""

    case_id: str = Field(..., description="UUID of the case to decide")
    citizen_profile: CitizenFinancialProfile = Field(..., description="Financial profile of the citizen")


class CaseListItem(BaseModel):
    """Summary row returned by GET /api/cases for each case in the queue."""

    id: str
    citizen_name_ar: str
    citizen_name_en: str
    emirates_id: str
    status: str
    arrears_amount: Optional[float] = None
    created_at: str
    decision_summary: Optional[str] = None
