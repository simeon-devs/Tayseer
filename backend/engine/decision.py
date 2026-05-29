"""Main decision pipeline for Tayseer.

Orchestrates: hard escalation check, RAG rule retrieval, prompt assembly,
LLM call via Instructor, monthly_instalment recalculation, database write, and audit log.
"""

from __future__ import annotations

import logging
import os
import uuid

import instructor
from openai import OpenAI
from sqlalchemy.orm import Session

from backend.engine.escalation import calculate_hardship_score, check_hard_escalations
from backend.engine.prompts import DECISION_SYSTEM_PROMPT, build_decision_prompt
from backend.models.audit_log import AuditLog
from backend.models.case import Case
from backend.models.decision import Decision
from backend.rag.retrieval import retrieve_rules
from backend.schemas.decisions import CitizenFinancialProfile, DecisionOutput

logger = logging.getLogger(__name__)

_ARABIC_ESCALATION_PREFIX = "تم تصعيد هذه الحالة: "
_ARABIC_APPROVED_PREFIX = "تمت الموافقة على طلب إعادة الجدولة: "


def _get_instructor_client() -> instructor.Instructor:
    """Build an Instructor-patched OpenAI client pointing at the Ollama endpoint."""
    ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    return instructor.from_openai(
        OpenAI(base_url=f"{ollama_url}/v1", api_key="ollama"),
        mode=instructor.Mode.JSON,
    )


def _get_model() -> str:
    """Return the Ollama model name from environment."""
    return os.environ.get("OLLAMA_MODEL", "qwen2.5:14b")


def _call_llm(citizen_profile: dict, retrieved_rules: list[str]) -> DecisionOutput:
    """Call the LLM via Instructor and return a validated DecisionOutput.

    Uses temperature=0.1 for consistency. Falls back to a safe escalation
    decision if the LLM call fails or returns invalid structured output.
    """
    try:
        client = _get_instructor_client()
        user_prompt = build_decision_prompt(citizen_profile, retrieved_rules)
        result: DecisionOutput = client.chat.completions.create(
            model=_get_model(),
            messages=[
                {"role": "system", "content": DECISION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_model=DecisionOutput,
            max_retries=2,
            temperature=0.1,
        )
        return result
    except Exception as exc:
        logger.error("LLM decision call failed: %s", exc)
        return DecisionOutput(
            escalate_flag=True,
            escalation_reason="LLM inference failed. Manual review required.",
            rationale_en="The automated decision system encountered an error. This case requires manual review.",
            rationale_ar="واجه نظام القرار الآلي خطأ. تتطلب هذه الحالة مراجعة يدوية.",
            rules_applied=[],
            confidence_score=0.0,
        )


def _write_decision_to_db(
    db: Session,
    case_id: str,
    output: DecisionOutput,
) -> bool:
    """Persist the decision to the database and append an audit log row.

    Recalculates monthly_instalment from approved_amount and duration_months
    regardless of what the LLM returned.

    Returns True on success. On a foreign key violation (case_id not in cases table)
    rolls back, logs a warning, and returns False so the caller can still return
    the decision output to the client.
    """
    from sqlalchemy.exc import IntegrityError

    monthly_instalment: float | None = None
    if output.approved_amount is not None and output.duration_months is not None and output.duration_months > 0:
        monthly_instalment = round(output.approved_amount / output.duration_months, 2)

    case_uuid = uuid.UUID(case_id) if isinstance(case_id, str) else case_id

    try:
        decision_row = Decision(
            case_id=case_uuid,
            approved_amount=output.approved_amount,
            duration_months=output.duration_months,
            monthly_instalment=monthly_instalment,
            hardship_score=output.hardship_score,
            escalate_flag=output.escalate_flag,
            escalation_reason=output.escalation_reason,
            rationale_en=output.rationale_en,
            rationale_ar=output.rationale_ar,
            rules_applied=output.rules_applied,
            confidence_score=output.confidence_score,
        )
        db.add(decision_row)

        new_status = "escalated" if output.escalate_flag else "approved"
        db.query(Case).filter(Case.id == case_uuid).update({"status": new_status})

        audit_row = AuditLog(
            case_id=case_uuid,
            action="decision_created",
            performed_by="system",
            details={
                "escalate_flag": output.escalate_flag,
                "escalation_reason": output.escalation_reason,
                "approved_amount": output.approved_amount,
                "duration_months": output.duration_months,
                "monthly_instalment": monthly_instalment,
                "confidence_score": output.confidence_score,
            },
        )
        db.add(audit_row)
        db.commit()
        return True

    except IntegrityError as exc:
        db.rollback()
        logger.warning(
            "DB write skipped for case %s: foreign key constraint not satisfied (%s)",
            case_id,
            exc.orig,
        )
        return False


def make_decision(
    case_id: str,
    profile: CitizenFinancialProfile,
    db: Session | None,
) -> DecisionOutput:
    """Run the full decision pipeline for a single case.

    Steps:
    1. Check hard escalation triggers (deterministic, no LLM).
    2. Retrieve top governance rules from RAG pipeline.
    3. Build the LLM prompt from profile and rules.
    4. Call LLM via Instructor to get structured DecisionOutput.
    5. Recalculate monthly_instalment server-side.
    6. Write Decision row and AuditLog row to database (skipped if db is None).
    7. Return the final DecisionOutput with recalculated instalment.

    Never raises. Returns a safe escalation decision if any step fails.
    db may be None for test calls where no real case exists in the database.
    """
    try:
        # Step 1: hard escalation checks
        should_escalate, escalation_reason = check_hard_escalations(profile)
        hardship_score = calculate_hardship_score(profile)

        if should_escalate:
            output = DecisionOutput(
                escalate_flag=True,
                escalation_reason=escalation_reason,
                hardship_score=hardship_score,
                rationale_en=f"This case has been escalated for manual review. Reason: {escalation_reason}",
                rationale_ar=f"{_ARABIC_ESCALATION_PREFIX}{escalation_reason}",
                rules_applied=[],
                confidence_score=1.0,
            )
        else:
            # Step 2: retrieve rules from RAG
            profile_dict = profile.model_dump()
            retrieved_rules = retrieve_rules(profile_dict)

            # Steps 3 and 4: call LLM
            output = _call_llm(profile_dict, retrieved_rules)

            # Ensure hardship_score is always set from our calculation if LLM omitted it
            if output.hardship_score is None:
                output = output.model_copy(update={"hardship_score": hardship_score})

        # Step 5: recalculate monthly_instalment server-side
        monthly_instalment: float | None = None
        if (
            output.approved_amount is not None
            and output.duration_months is not None
            and output.duration_months > 0
        ):
            monthly_instalment = round(output.approved_amount / output.duration_months, 2)

        output = output.model_copy(update={"monthly_instalment": monthly_instalment})

        # Step 6: persist if a real db session was provided
        if db is not None:
            _write_decision_to_db(db, case_id, output)

        return output

    except Exception as exc:
        logger.error("make_decision failed for case %s: %s", case_id, exc)
        fallback = DecisionOutput(
            escalate_flag=True,
            escalation_reason="System error during decision processing. Manual review required.",
            rationale_en="An unexpected error occurred. This case has been escalated for manual review.",
            rationale_ar="حدث خطأ غير متوقع. تم تصعيد هذه الحالة للمراجعة اليدوية.",
            rules_applied=[],
            confidence_score=0.0,
        )
        if db is not None:
            _write_decision_to_db(db, case_id, fallback)
        return fallback
