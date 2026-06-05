"""Hard escalation checks and scoring functions for the Tayseer decision engine.

Hard escalations are deterministic Python checks that run before the LLM.
If any trigger fires the case goes directly to a human officer without LLM inference.
"""

from __future__ import annotations

from backend.schemas.decisions import CitizenFinancialProfile

# Thresholds
_HIGH_ARREARS_THRESHOLD = 500_000.0
_STALE_SALARY_CERT_MONTHS = 3

# Official governance rule limits
_RULE1_DEDUCTION_CAP = 0.20
_RULE2_REQUEST_TYPE_UPDATE = "UPDATE_INSTALLMENT"
_RULE2_REQUEST_TYPE_TRANSFER = "TRANSFER_ARREARS"


def calculate_debt_ratio(arrears_amount: float, monthly_income: float) -> float:
    """Calculate the arrears-to-annual-income ratio.

    Returns 0.0 when monthly_income is zero to avoid division errors.
    """
    if monthly_income <= 0:
        return 0.0
    return round(arrears_amount / (monthly_income * 12), 4)


def calculate_hardship_score(profile: CitizenFinancialProfile) -> float:
    """Compute a hardship score between 0.0 and 1.0 for a citizen profile.

    Higher scores indicate greater financial difficulty or vulnerability.
    The score combines DTI pressure, delay severity, and vulnerability flags.
    """
    score = 0.0

    # DTI component (weight 0.35)
    if profile.monthly_income > 0:
        dti = profile.existing_obligations / profile.monthly_income
        if dti >= 0.55:
            score += 0.35
        elif dti >= 0.45:
            score += 0.25
        elif dti >= 0.30:
            score += 0.15
        else:
            score += 0.05

    # Delay duration component (weight 0.25)
    if profile.delay_duration_months >= 12:
        score += 0.25
    elif profile.delay_duration_months >= 6:
        score += 0.15
    elif profile.delay_duration_months >= 3:
        score += 0.08

    # Arrears amount component (weight 0.15)
    if profile.arrears_amount >= 500_000:
        score += 0.15
    elif profile.arrears_amount >= 50_000:
        score += 0.08

    # Vulnerability flags (weight 0.25 total)
    if profile.is_widowed_or_divorced:
        score += 0.10
    if profile.has_disability:
        score += 0.10
    if not profile.payment_history_clean:
        score += 0.05

    return round(min(score, 1.0), 4)


def determine_request_type(profile: CitizenFinancialProfile) -> str:
    """Determine whether the rescheduling type should be UPDATE_INSTALLMENT or TRANSFER_ARREARS.

    UPDATE_INSTALLMENT: arrears are spread into additional monthly instalments on top of the
    existing EMI. Used when the citizen has income capacity to absorb extra payments.

    TRANSFER_ARREARS: arrears are moved to the end of the loan with no additional monthly charge.
    Used when the citizen has no income capacity for extra payments or is unemployed.
    """
    if profile.is_unemployed:
        return _RULE2_REQUEST_TYPE_TRANSFER

    if profile.monthly_income > 0:
        current_dti = profile.existing_obligations / profile.monthly_income
        remaining_capacity = _RULE1_DEDUCTION_CAP - current_dti
        if remaining_capacity <= 0:
            return _RULE2_REQUEST_TYPE_TRANSFER

    return _RULE2_REQUEST_TYPE_UPDATE


def calculate_rule1_compliance(
    monthly_income: float,
    existing_obligations: float,
    additional_premium: float,
) -> tuple[bool, float]:
    """Check Rule 1: total monthly deduction must not exceed 20 percent of income.

    Compares (existing_obligations + additional_premium) against 20% of monthly_income.
    Returns (is_compliant, proposed_deduction_rate).
    TRANSFER_ARREARS always passes Rule 1 because additional_premium is zero.
    """
    if monthly_income <= 0:
        return False, 1.0
    total_deduction = existing_obligations + additional_premium
    rate = round(total_deduction / monthly_income, 4)
    return rate <= _RULE1_DEDUCTION_CAP, rate


def calculate_rule2_compliance(
    duration_months: int | None,
    remaining_loan_period_months: int | None,
) -> bool:
    """Check Rule 2: repayment period must not exceed the remaining loan period.

    Returns True when duration_months <= remaining_loan_period_months.
    Returns True when remaining_loan_period_months is unknown (cannot enforce).
    """
    if duration_months is None or remaining_loan_period_months is None:
        return True
    return duration_months <= remaining_loan_period_months


def check_hard_escalations(profile: CitizenFinancialProfile) -> tuple[bool, str]:
    """Run all hard escalation trigger checks against a citizen profile.

    Returns (True, reason) if any trigger fires, otherwise (False, "").
    Checks are evaluated in priority order: fraud, ID expiry, previous rejections,
    missing documents, stale salary certificate, and high-value arrears.
    DTI is not a hard escalation trigger under the official governance rules.
    """
    # Trigger 0: fraud signal raised by document verification
    if profile.suspected_fraud:
        return True, (
            "A fraud signal has been raised: income and document consistency check failed. "
            "Manual investigation is required before this case can proceed."
        )

    # Trigger 1: expired Emirates ID
    if profile.has_expired_id:
        return True, "Emirates ID has expired. Identity verification required before rescheduling can proceed."

    # Trigger 2: multiple previous rejections (fraud or abuse signal)
    if profile.previous_rejected_applications >= 2:
        return True, (
            f"Application has been rejected {profile.previous_rejected_applications} times previously. "
            "Manual review required to assess eligibility."
        )

    # Trigger 3: missing required documents
    if profile.missing_documents:
        missing_list = ", ".join(profile.missing_documents)
        return True, f"Required documents are missing: {missing_list}. Case cannot be processed without complete documentation."

    # Trigger 4: stale salary certificate
    if profile.salary_certificate_age_months > _STALE_SALARY_CERT_MONTHS:
        return True, (
            f"Salary certificate is {profile.salary_certificate_age_months} months old. "
            "A certificate issued within the last 3 months is required."
        )

    # Trigger 5: arrears above high-value threshold
    if profile.arrears_amount > _HIGH_ARREARS_THRESHOLD:
        return True, (
            f"Arrears amount of AED {profile.arrears_amount:,.0f} exceeds the AED 500,000 high-value threshold. "
            "Senior officer review is required."
        )

    return False, ""
