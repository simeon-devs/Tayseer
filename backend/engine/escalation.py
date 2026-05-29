"""Hard escalation checks and scoring functions for the Tayseer decision engine.

Hard escalations are deterministic Python checks that run before the LLM.
If any trigger fires the case goes directly to a human officer without LLM inference.
"""

from __future__ import annotations

from backend.schemas.decisions import CitizenFinancialProfile

# Thresholds
_DTI_ESCALATION_THRESHOLD = 0.45
_HIGH_ARREARS_THRESHOLD = 100_000.0
_STALE_SALARY_CERT_MONTHS = 3


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
    if profile.arrears_amount >= 100_000:
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


def check_hard_escalations(profile: CitizenFinancialProfile) -> tuple[bool, str]:
    """Run all hard escalation trigger checks against a citizen profile.

    Returns (True, reason) if any trigger fires, otherwise (False, "").
    Checks are evaluated in priority order: ID expiry, previous rejections,
    missing documents, fraud signals, DTI, and arrears threshold.
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

    # Trigger 5: DTI above escalation threshold
    if profile.monthly_income > 0:
        dti = profile.existing_obligations / profile.monthly_income
        if dti > _DTI_ESCALATION_THRESHOLD:
            return True, (
                f"Debt-to-income ratio of {dti:.1%} exceeds the 55% escalation threshold. "
                "A human officer must assess affordability before approval."
            )

    # Trigger 6: arrears above high-value threshold
    if profile.arrears_amount > _HIGH_ARREARS_THRESHOLD:
        return True, (
            f"Arrears amount of AED {profile.arrears_amount:,.0f} exceeds the AED 100,000 high-value threshold. "
            "Senior officer review is required."
        )

    return False, ""
