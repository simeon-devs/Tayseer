"""Risk intelligence engine for Tayseer.

Provides proactive citizen risk analysis from case and decision data.
The engine never raises; all exceptions are caught and logged silently
so the main decision pipeline is never blocked.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class RiskLevel(str, Enum):
    """Citizen risk classification tier."""

    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RiskFactor(BaseModel):
    """A single contributing signal to a citizen's overall risk score."""

    factor_code: str
    description_en: str
    description_ar: str
    severity: float = Field(..., ge=0.0, le=1.0)


class CitizenRiskProfile(BaseModel):
    """Complete risk analysis for one citizen across all active cases."""

    citizen_id: str
    citizen_name_en: str
    citizen_name_ar: str
    emirates_id: str
    risk_level: RiskLevel
    risk_score: float
    risk_factors: list[RiskFactor]
    recommended_action_en: str
    recommended_action_ar: str
    days_until_critical: Optional[int] = None


# ── Signal helpers ────────────────────────────────────────────────────────────


def _signal_payment_delay(case: dict, decision: dict) -> tuple[float, RiskFactor | None]:
    """Signal 1: payment delay severity.

    Uses delay_duration_months from the case dict when present.
    Falls back to estimating delay from arrears_amount / monthly_instalment,
    then to hardship_score as a last resort.
    Weight 0.30.
    """
    delay: int | None = case.get("delay_duration_months")

    if delay is None:
        arrears = case.get("arrears_amount") or 0.0
        instalment = decision.get("monthly_instalment") or 0.0
        if instalment > 0:
            delay = int(round(arrears / instalment))
        else:
            hs = decision.get("hardship_score")
            if hs is not None and hs > 0.1:
                contrib = round(min(float(hs), 1.0), 4)
                return contrib, RiskFactor(
                    factor_code="PAYMENT_DELAY",
                    description_en=f"Estimated payment distress index {contrib:.0%} based on hardship score",
                    description_ar=f"مؤشر صعوبة الدفع المقدّر {contrib:.0%} بناءً على درجة الضائقة",
                    severity=contrib,
                )
            return 0.0, None

    if delay > 5:
        contrib = 1.0
        desc_en = f"Payment delayed by {delay} months — critical threshold exceeded"
        desc_ar = f"تأخر الدفع {delay} أشهر — تجاوز الحد الحرج"
    elif delay >= 3:
        contrib = 0.6
        desc_en = f"Payment delayed by {delay} months — significant risk"
        desc_ar = f"تأخر الدفع {delay} أشهر — مخاطرة كبيرة"
    elif delay >= 1:
        contrib = 0.3
        desc_en = f"Payment delayed by {delay} months — early warning"
        desc_ar = f"تأخر الدفع {delay} أشهر — إنذار مبكر"
    else:
        return 0.0, None

    return contrib, RiskFactor(
        factor_code="PAYMENT_DELAY",
        description_en=desc_en,
        description_ar=desc_ar,
        severity=contrib,
    )


def _signal_deduction_rate(decision: dict) -> tuple[float, RiskFactor | None]:
    """Signal 2: proposed deduction rate proximity to the 20% governance cap.

    Requires proposed_deduction_rate in the decision dict.
    Weight 0.25.
    """
    rate = decision.get("proposed_deduction_rate")
    if rate is None:
        return 0.0, None

    rate = float(rate)
    if rate > 0.18:
        contrib = 1.0
        desc_en = f"Deduction rate {rate:.1%} at or above the 18% warning threshold"
        desc_ar = f"نسبة الاقتطاع {rate:.1%} عند الحد التحذيري 18% أو تتجاوزه"
    elif rate >= 0.15:
        contrib = 0.6
        desc_en = f"Deduction rate {rate:.1%} approaching the 20% governance cap"
        desc_ar = f"نسبة الاقتطاع {rate:.1%} تقترب من الحد الحوكمي 20%"
    elif rate >= 0.10:
        contrib = 0.3
        desc_en = f"Deduction rate {rate:.1%} — moderate but requires monitoring"
        desc_ar = f"نسبة الاقتطاع {rate:.1%} — معتدلة لكنها تستوجب المتابعة"
    else:
        return 0.0, None

    return contrib, RiskFactor(
        factor_code="DEDUCTION_RATE_HIGH",
        description_en=desc_en,
        description_ar=desc_ar,
        severity=contrib,
    )


def _signal_income_per_member(decision: dict) -> tuple[float, RiskFactor | None]:
    """Signal 3: monthly income per family member affordability.

    Requires income_per_family_member in the decision dict.
    Weight 0.20.
    """
    ipm = decision.get("income_per_family_member")
    if ipm is None:
        return 0.0, None

    ipm = float(ipm)
    if ipm < 2500:
        contrib = 1.0
        desc_en = f"Income per family member AED {ipm:,.0f} is below the critical threshold of AED 2,500"
        desc_ar = f"الدخل لكل فرد من الأسرة {ipm:,.0f} درهم أقل من الحد الحرج 2,500 درهم"
    elif ipm < 4000:
        contrib = 0.5
        desc_en = f"Income per family member AED {ipm:,.0f} — moderate affordability pressure"
        desc_ar = f"الدخل لكل فرد من الأسرة {ipm:,.0f} درهم — ضغط قدرة شراء معتدل"
    else:
        return 0.0, None

    return contrib, RiskFactor(
        factor_code="LOW_INCOME_PER_MEMBER",
        description_en=desc_en,
        description_ar=desc_ar,
        severity=contrib,
    )


def _signal_previous_rescheduling(case: dict) -> tuple[float, RiskFactor | None]:
    """Signal 4: prior rescheduling history on record.

    Uses previous_rescheduling_count from the case dict.
    Weight 0.15.
    """
    count = int(case.get("previous_rescheduling_count") or 0)
    if count < 1:
        return 0.0, None
    contrib = 0.8
    return contrib, RiskFactor(
        factor_code="PREVIOUS_RESCHEDULING",
        description_en=f"Citizen has {count} prior rescheduling record(s) on file",
        description_ar=f"المواطن لديه {count} سجل إعادة جدولة سابق",
        severity=contrib,
    )


def _signal_transfer_arrears(decision: dict) -> tuple[float, RiskFactor | None]:
    """Signal 5: case was processed as TRANSFER_ARREARS.

    Requires request_type in the decision dict.
    Weight 0.10.
    """
    if decision.get("request_type") != "TRANSFER_ARREARS":
        return 0.0, None
    contrib = 0.7
    return contrib, RiskFactor(
        factor_code="TRANSFER_ARREARS_USED",
        description_en="Case was processed as TRANSFER_ARREARS indicating arrears absorption capacity was exhausted",
        description_ar="تم معالجة الطلب كتحويل متأخرات مما يشير إلى استنفاد طاقة استيعاب المتأخرات",
        severity=contrib,
    )


def _build_recommendation(level: RiskLevel) -> tuple[str, str]:
    """Return a bilingual recommended action string based on the computed risk level."""
    if level == RiskLevel.HIGH:
        return (
            "Immediate proactive outreach required. Assign a senior housing advisor within 24 hours.",
            "مطلوب تواصل استباقي فوري. تعيين مستشار سكني كبير خلال 24 ساعة.",
        )
    if level == RiskLevel.MEDIUM:
        return (
            "Schedule a follow-up review within 7 days and monitor payment compliance.",
            "جدولة مراجعة متابعة خلال 7 أيام ومراقبة الالتزام بالدفع.",
        )
    return (
        "No immediate action required. Continue standard monitoring.",
        "لا يلزم اتخاذ إجراء فوري. الاستمرار في المراقبة القياسية.",
    )


# ── Public API ────────────────────────────────────────────────────────────────


def analyse_citizen_risk(case: dict, decision: dict) -> CitizenRiskProfile:
    """Compute a CitizenRiskProfile from a case dict and decision dict.

    Five weighted signals are evaluated:
      1. Payment delay       (weight 0.30)
      2. Deduction rate      (weight 0.25)
      3. Income per member   (weight 0.20)
      4. Previous reschedule (weight 0.15)
      5. TRANSFER_ARREARS    (weight 0.10)

    Score >0.7 maps to HIGH, 0.4-0.7 to MEDIUM, <0.4 to LOW.
    Never raises; returns a LOW risk profile on any exception.
    """
    try:
        s1, f1 = _signal_payment_delay(case, decision)
        s2, f2 = _signal_deduction_rate(decision)
        s3, f3 = _signal_income_per_member(decision)
        s4, f4 = _signal_previous_rescheduling(case)
        s5, f5 = _signal_transfer_arrears(decision)

        score = round(min(
            s1 * 0.30 + s2 * 0.25 + s3 * 0.20 + s4 * 0.15 + s5 * 0.10,
            1.0,
        ), 4)

        if score > 0.70:
            level = RiskLevel.HIGH
        elif score >= 0.40:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        factors = sorted(
            [f for f in [f1, f2, f3, f4, f5] if f is not None],
            key=lambda f: f.severity,
            reverse=True,
        )
        rec_en, rec_ar = _build_recommendation(level)

        return CitizenRiskProfile(
            citizen_id=str(case.get("citizen_id", "")),
            citizen_name_en=case.get("citizen_name_en") or "Unknown",
            citizen_name_ar=case.get("citizen_name_ar") or "غير معروف",
            emirates_id=case.get("emirates_id") or "",
            risk_level=level,
            risk_score=score,
            risk_factors=factors,
            recommended_action_en=rec_en,
            recommended_action_ar=rec_ar,
        )
    except Exception as exc:
        logger.error("analyse_citizen_risk failed for case %s: %s", case.get("id"), exc)
        return CitizenRiskProfile(
            citizen_id=str(case.get("citizen_id", "")),
            citizen_name_en=case.get("citizen_name_en") or "Unknown",
            citizen_name_ar=case.get("citizen_name_ar") or "غير معروف",
            emirates_id=case.get("emirates_id") or "",
            risk_level=RiskLevel.LOW,
            risk_score=0.0,
            risk_factors=[],
            recommended_action_en="Risk analysis unavailable.",
            recommended_action_ar="تحليل المخاطر غير متاح.",
        )


def analyse_all_citizens(db: Session) -> list[CitizenRiskProfile]:
    """Load all active cases and return a list of CitizenRiskProfile sorted by risk_score desc.

    Filters out cases with status rejected or closed.
    Never raises; returns an empty list on any exception.
    """
    try:
        from sqlalchemy import func as sqlfunc

        from backend.models.case import Case
        from backend.models.citizen import Citizen
        from backend.models.decision import Decision

        _EXCLUDED = {"rejected", "closed"}

        rows = (
            db.query(Case, Citizen, Decision)
            .join(Citizen, Case.citizen_id == Citizen.id)
            .outerjoin(Decision, Decision.case_id == Case.id)
            .filter(Case.status.notin_(_EXCLUDED))
            .all()
        )

        prior_counts: dict[str, int] = {}
        for cid, cnt in (
            db.query(Case.citizen_id, sqlfunc.count(Case.id))
            .filter(Case.status.in_({"closed", "overridden"}))
            .group_by(Case.citizen_id)
            .all()
        ):
            prior_counts[str(cid)] = int(cnt)

        profiles: list[CitizenRiskProfile] = []
        for case_row, citizen_row, decision_row in rows:
            case_dict: dict = {
                "id": str(case_row.id),
                "citizen_id": str(case_row.citizen_id),
                "citizen_name_en": citizen_row.name_en,
                "citizen_name_ar": citizen_row.name_ar,
                "emirates_id": citizen_row.emirates_id,
                "status": case_row.status,
                "arrears_amount": case_row.arrears_amount,
                "previous_rescheduling_count": prior_counts.get(str(case_row.citizen_id), 0),
            }
            decision_dict: dict = {}
            if decision_row is not None:
                decision_dict = {
                    "approved_amount": decision_row.approved_amount,
                    "duration_months": decision_row.duration_months,
                    "monthly_instalment": decision_row.monthly_instalment,
                    "hardship_score": decision_row.hardship_score,
                    "escalate_flag": decision_row.escalate_flag,
                    "escalation_reason": decision_row.escalation_reason,
                    "confidence_score": decision_row.confidence_score,
                }
            profiles.append(analyse_citizen_risk(case_dict, decision_dict))

        profiles.sort(key=lambda p: p.risk_score, reverse=True)
        return profiles
    except Exception as exc:
        logger.error("analyse_all_citizens failed: %s", exc)
        return []


def get_risk_summary(db: Session) -> dict:
    """Return aggregate risk counts across all active citizens.

    Keys: high_risk_count, medium_risk_count, low_risk_count, total_analysed, last_updated.
    Never raises; returns zero counts on any exception.
    """
    try:
        profiles = analyse_all_citizens(db)
        return {
            "high_risk_count": sum(1 for p in profiles if p.risk_level == RiskLevel.HIGH),
            "medium_risk_count": sum(1 for p in profiles if p.risk_level == RiskLevel.MEDIUM),
            "low_risk_count": sum(1 for p in profiles if p.risk_level == RiskLevel.LOW),
            "total_analysed": len(profiles),
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        logger.error("get_risk_summary failed: %s", exc)
        return {
            "high_risk_count": 0,
            "medium_risk_count": 0,
            "low_risk_count": 0,
            "total_analysed": 0,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
