"""Risk intelligence engine for Tayseer.

Provides proactive citizen risk analysis from Case, Citizen, and Decision
ORM objects. The engine never raises; all exceptions are caught and logged
silently so the main decision pipeline is never blocked.

Signal weights and contributions:
  Signal 1  Financial distress via hardship score       weight 0.30
  Signal 2  Deduction rate (requires DB field, stub)    weight 0.25
  Signal 3  Income per family member (stub)             weight 0.20
  Signal 4  Previous rescheduling history               weight 0.15
  Signal 5  TRANSFER_ARREARS used (stub)                weight 0.10
  Signal 6  Case is currently escalated                 weight 0.40
  Signal 7  Fraud signal in escalation reason           weight 0.50
  Signal 8  Expired ID in escalation reason             weight 0.30
  Signal 9  Rule 1 forced TRANSFER_ARREARS              weight 0.25

Signals 2, 3, and 5 require fields not currently stored in the Decision
table (proposed_deduction_rate, income_per_family_member, request_type).
They are retained as stubs for future enhancement when those fields are
persisted. In the current implementation they always contribute 0.

Classification thresholds are calibrated for the expanded signal set:
  HIGH   score > 0.50
  MEDIUM score >= 0.20
  LOW    score < 0.20
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, Optional

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

if TYPE_CHECKING:
    from backend.models.case import Case
    from backend.models.citizen import Citizen
    from backend.models.decision import Decision

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


def _signal_hardship(decision: Optional["Decision"]) -> tuple[float, RiskFactor | None]:
    """Signal 1: financial distress proxy via hardship score. Weight 0.30.

    Uses the hardship_score stored in the Decision table. This field is always
    set for both escalated and approved cases by calculate_hardship_score.
    """
    if decision is None:
        return 0.0, None
    hs = decision.hardship_score
    if hs is None or hs <= 0.05:
        return 0.0, None
    contrib = round(min(float(hs), 1.0), 4)
    return contrib, RiskFactor(
        factor_code="FINANCIAL_DISTRESS",
        description_en=f"Financial distress score {contrib:.0%} based on income obligations and arrears",
        description_ar=f"درجة الضائقة المالية {contrib:.0%} بناءً على الالتزامات والمتأخرات",
        severity=contrib,
    )


def _signal_previous_rescheduling(prior_count: int) -> tuple[float, RiskFactor | None]:
    """Signal 4: prior rescheduling history on record. Weight 0.15."""
    if prior_count < 1:
        return 0.0, None
    contrib = 0.8
    return contrib, RiskFactor(
        factor_code="PREVIOUS_RESCHEDULING",
        description_en=f"Citizen has {prior_count} prior rescheduling record(s) on file",
        description_ar=f"المواطن لديه {prior_count} سجل إعادة جدولة سابق",
        severity=contrib,
    )


def _signal_escalated(case_status: str) -> tuple[float, RiskFactor | None]:
    """Signal 6: case is currently escalated. Weight 0.40."""
    if case_status != "escalated":
        return 0.0, None
    return 1.0, RiskFactor(
        factor_code="CASE_ESCALATED",
        description_en="Case has been escalated and requires immediate attention",
        description_ar="تم تصعيد الحالة وتتطلب اهتماماً فورياً",
        severity=1.0,
    )


def _signal_fraud(escalation_reason: Optional[str]) -> tuple[float, RiskFactor | None]:
    """Signal 7: fraud signal detected in escalation reason. Weight 0.50."""
    if not escalation_reason or "fraud" not in escalation_reason.lower():
        return 0.0, None
    return 1.0, RiskFactor(
        factor_code="FRAUD_SIGNAL",
        description_en="Fraud signal detected in document verification",
        description_ar="تم اكتشاف إشارة احتيال في التحقق من المستندات",
        severity=1.0,
    )


def _signal_expired_id(escalation_reason: Optional[str]) -> tuple[float, RiskFactor | None]:
    """Signal 8: expired Emirates ID blocking case processing. Weight 0.30."""
    if not escalation_reason or "expired" not in escalation_reason.lower():
        return 0.0, None
    return 0.8, RiskFactor(
        factor_code="EXPIRED_ID",
        description_en="Emirates ID has expired, blocking case processing",
        description_ar="انتهت صلاحية الهوية الإماراتية مما يعيق معالجة الحالة",
        severity=0.8,
    )


def _signal_rule1_forced_transfer(decision: Optional["Decision"]) -> tuple[float, RiskFactor | None]:
    """Signal 9: Rule 1 deduction cap forced a TRANSFER_ARREARS outcome. Weight 0.25.

    Checks rationale_en for evidence that the arrears transfer was caused by
    the 20% governance cap, indicating the citizen has exhausted repayment capacity.
    """
    if decision is None or decision.escalate_flag:
        return 0.0, None
    rationale = (decision.rationale_en or "").lower()
    is_transfer = "transfer_arrears" in rationale or "transfer arrears" in rationale
    has_cap_ref = (
        "rule 1" in rationale
        or "20%" in (decision.rationale_en or "")
        or "20 percent" in rationale
    )
    if not (is_transfer and has_cap_ref):
        return 0.0, None
    return 0.7, RiskFactor(
        factor_code="RULE1_FORCED_TRANSFER",
        description_en="Rule 1 cap forced arrears transfer indicating tight financial capacity",
        description_ar="أجبر سقف القاعدة الأولى على تحويل المتأخرات مما يشير إلى قدرة مالية محدودة",
        severity=0.7,
    )


# ── Recommendation builder ────────────────────────────────────────────────────


def _build_recommendation(
    level: RiskLevel,
    factor_codes: list[str],
) -> tuple[str, str]:
    """Return a bilingual recommended action tailored to the primary risk factor."""
    if level == RiskLevel.HIGH:
        if "FRAUD_SIGNAL" in factor_codes:
            return (
                "Immediate investigation required. Do not process until fraud signal is cleared.",
                "مطلوب تحقيق فوري. لا تعالج الطلب حتى يتم رفع إشارة الاحتيال.",
            )
        if "EXPIRED_ID" in factor_codes:
            return (
                "Contact citizen immediately to renew Emirates ID before case can proceed.",
                "تواصل مع المواطن فوراً لتجديد الهوية الإماراتية قبل المضي في الطلب.",
            )
        if "RULE1_FORCED_TRANSFER" in factor_codes:
            return (
                "Monitor closely. Citizen is at the income limit for repayment. Consider proactive financial counselling.",
                "مراقبة دقيقة مطلوبة. المواطن عند حد الدخل للسداد. فكر في الإرشاد المالي الاستباقي.",
            )
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


def analyse_citizen_risk(
    case: "Case",
    citizen: "Citizen",
    decision: Optional["Decision"],
    prior_count: int = 0,
) -> CitizenRiskProfile:
    """Compute a CitizenRiskProfile from SQLAlchemy ORM objects.

    Evaluates nine weighted signals across financial distress, escalation
    status, fraud indicators, expired identity, previous rescheduling history,
    and Rule 1 governance cap violations.

    Score > 0.50 maps to HIGH, >= 0.20 to MEDIUM, < 0.20 to LOW.
    Never raises; returns a LOW risk profile on any exception.
    """
    try:
        escalation_reason = decision.escalation_reason if decision else None

        s1, f1 = _signal_hardship(decision)
        s4, f4 = _signal_previous_rescheduling(prior_count)
        s6, f6 = _signal_escalated(case.status)
        s7, f7 = _signal_fraud(escalation_reason)
        s8, f8 = _signal_expired_id(escalation_reason)
        s9, f9 = _signal_rule1_forced_transfer(decision)

        score = round(min(
            s1 * 0.30
            + s4 * 0.15
            + s6 * 0.40
            + s7 * 0.50
            + s8 * 0.30
            + s9 * 0.25,
            1.0,
        ), 4)

        if score > 0.50:
            level = RiskLevel.HIGH
        elif score >= 0.20:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        factors = sorted(
            [f for f in [f1, f4, f6, f7, f8, f9] if f is not None],
            key=lambda f: f.severity,
            reverse=True,
        )
        factor_codes = [f.factor_code for f in factors]
        rec_en, rec_ar = _build_recommendation(level, factor_codes)

        return CitizenRiskProfile(
            citizen_id=str(case.citizen_id),
            citizen_name_en=citizen.name_en,
            citizen_name_ar=citizen.name_ar,
            emirates_id=citizen.emirates_id,
            risk_level=level,
            risk_score=score,
            risk_factors=factors,
            recommended_action_en=rec_en,
            recommended_action_ar=rec_ar,
        )
    except Exception as exc:
        logger.error(
            "analyse_citizen_risk failed for case %s: %s",
            getattr(case, "id", "unknown"),
            exc,
        )
        return CitizenRiskProfile(
            citizen_id=str(getattr(case, "citizen_id", "")),
            citizen_name_en=getattr(citizen, "name_en", "Unknown"),
            citizen_name_ar=getattr(citizen, "name_ar", "غير معروف"),
            emirates_id=getattr(citizen, "emirates_id", ""),
            risk_level=RiskLevel.LOW,
            risk_score=0.0,
            risk_factors=[],
            recommended_action_en="Risk analysis unavailable.",
            recommended_action_ar="تحليل المخاطر غير متاح.",
        )


def analyse_all_citizens(db: Session) -> list[CitizenRiskProfile]:
    """Load all active cases and return CitizenRiskProfile list sorted by risk_score desc.

    Filters out rejected and closed cases. Escalated cases without a decision
    record are included via outerjoin. Never raises; returns an empty list on
    any exception.
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
            prior = prior_counts.get(str(case_row.citizen_id), 0)
            profile = analyse_citizen_risk(case_row, citizen_row, decision_row, prior)
            profiles.append(profile)

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
