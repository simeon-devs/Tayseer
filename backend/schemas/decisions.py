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
    payment_history_clean: bool = Field(default=False, description="True if citizen has no prior defaults (legacy field, prefer payment_history)")
    payment_history: Optional[str] = Field(default=None, description="Free-text description of payment history e.g. 'No previous defaults'")
    previous_rejected_applications: int = Field(default=0, description="Number of previously rejected rescheduling applications")
    is_widowed_or_divorced: bool = Field(default=False, description="True if citizen is widowed or divorced")
    has_disability: bool = Field(default=False, description="True if citizen has a registered disability")
    number_of_properties: int = Field(default=1, description="Number of properties owned by citizen")
    salary_certificate_age_months: int = Field(default=0, description="Age of the submitted salary certificate in months")
    suspected_fraud: bool = Field(default=False, description="True if a fraud signal has been raised by the document verification pipeline")
    original_loan_amount: Optional[float] = Field(default=None, description="Original housing loan amount in AED")
    remaining_loan_balance: Optional[float] = Field(default=None, description="Outstanding loan balance in AED")
    remaining_loan_period_months: Optional[int] = Field(default=60, description="Remaining months until loan matures")
    number_of_unpaid_instalments: Optional[int] = Field(default=0, description="Count of unpaid monthly instalments to date")
    number_of_family_members: Optional[int] = Field(default=1, description="Total family members dependent on this income")
    is_unemployed: Optional[bool] = Field(default=False, description="True if citizen is currently unemployed")
    has_temporary_circumstance: Optional[bool] = Field(default=False, description="True if hardship is due to a temporary circumstance")
    temporary_circumstance_description: Optional[str] = Field(default=None, description="Description of the temporary circumstance causing hardship")


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
    request_type: Optional[str] = Field(None, description="UPDATE_INSTALLMENT or TRANSFER_ARREARS")
    additional_months: Optional[int] = Field(None, description="Extra months added for UPDATE_INSTALLMENT repayment")
    additional_premium: Optional[float] = Field(None, description="Additional monthly premium in AED; zero for TRANSFER_ARREARS")
    rule1_compliance: Optional[bool] = Field(None, description="True if proposed deduction rate does not exceed 20 percent of income")
    rule2_compliance: Optional[bool] = Field(None, description="True if repayment duration does not exceed remaining loan period")
    case_summary: Optional[str] = Field(None, description="Brief summary of the case and decision outcome in English")
    income_per_family_member: Optional[float] = Field(None, description="Monthly income divided by number of family members in AED")
    proposed_deduction_rate: Optional[float] = Field(None, description="Ratio of total monthly deduction to monthly income after rescheduling")
    application_status: Optional[str] = Field(None, description="Complete when all documents and identity are valid; Incomplete when documents or ID are missing or expired")
    final_recommendation: Optional[str] = Field(None, description="Approve, Request_documents, or Refer_to_employee based on decision outcome")
    outstanding_principal: Optional[float] = Field(None, description="Remaining loan balance in AED from citizen profile")
    total_unpaid_instalments: Optional[int] = Field(None, description="Number of missed monthly payments from citizen profile")
    remaining_months: Optional[int] = Field(None, description="Remaining loan period in months from citizen profile")
    proposed_extension_months: Optional[int] = Field(None, description="Months needed to clear arrears at maximum allowable deduction; populated on extension escalation")
    proposed_extension_amount: Optional[float] = Field(None, description="Maximum allowable monthly deduction in AED; the proposed monthly payment for the extension plan")


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
