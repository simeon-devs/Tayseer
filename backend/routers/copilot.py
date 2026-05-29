"""FastAPI router for the B3 AI copilot endpoint.

Exposes POST /api/copilot which accepts a case ID and a natural language question
from a staff reviewer, and returns answers in both English and Arabic.

The LLM is called directly via the OpenAI-compatible Ollama endpoint without Instructor
because the output is free-form text rather than a structured Pydantic schema.
"""

from __future__ import annotations

import logging
import os
import uuid as uuid_lib

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session, selectinload

from backend.database import get_db
from backend.models.case import Case
from backend.schemas.cases import CopilotRequest, CopilotResponse
from backend.schemas.documents import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["copilot"])

_COPILOT_SYSTEM_PROMPT = """You are a UAE government housing debt rescheduling officer assistant working inside the Tayseer case management system.

A staff reviewer is examining a specific rescheduling case and has asked you a question. You have access to the full case details below.

Your responsibilities:
- Answer the reviewer's question accurately and only based on the information provided in the case context.
- Never invent financial figures, dates, or facts not present in the case data.
- Be concise and professional. The reviewer is a government official who needs clear answers.
- Format your response EXACTLY as shown below with no deviation:

ENGLISH:
[Your answer in English here]

ARABIC:
[Your Arabic translation here]

Always provide both sections. The Arabic section must be a faithful translation of the English section."""


def _build_case_context(case: Case) -> str:
    """Assemble a structured text block with all case details for the copilot prompt."""
    citizen = case.citizen
    decision = case.decision

    lines = [
        f"Case ID: {case.id}",
        f"Case Status: {case.status}",
        f"Case Created: {case.created_at.isoformat()}",
        f"Arrears Amount: AED {case.arrears_amount:,.2f}" if case.arrears_amount else "Arrears Amount: not recorded",
        "",
        "Citizen:",
        f"  Name (English): {citizen.name_en}",
        f"  Name (Arabic): {citizen.name_ar}",
        f"  Emirates ID: {citizen.emirates_id}",
    ]

    if case.documents:
        lines.append("")
        lines.append("Documents on file:")
        for doc in case.documents:
            lines.append(f"  Type: {doc.document_type} | Confidence: {doc.extraction_confidence or 0:.0%}")
            if doc.extracted_fields:
                for key, val in doc.extracted_fields.items():
                    if val is not None:
                        lines.append(f"    {key}: {val}")

    if decision:
        lines.append("")
        lines.append("AI Decision:")
        lines.append(f"  Escalated: {decision.escalate_flag}")
        if decision.escalate_flag:
            lines.append(f"  Escalation Reason: {decision.escalation_reason}")
        else:
            lines.append(f"  Approved Amount: AED {decision.approved_amount:,.2f}" if decision.approved_amount else "  Approved Amount: null")
            lines.append(f"  Duration: {decision.duration_months} months" if decision.duration_months else "  Duration: null")
            lines.append(f"  Monthly Instalment: AED {decision.monthly_instalment:,.2f}" if decision.monthly_instalment else "  Monthly Instalment: null")
            lines.append(f"  Hardship Score: {decision.hardship_score}" if decision.hardship_score is not None else "  Hardship Score: null")
        lines.append(f"  Rationale (EN): {decision.rationale_en or 'not provided'}")
        lines.append(f"  Rules Applied: {', '.join(decision.rules_applied or []) or 'none'}")
        lines.append(f"  Confidence Score: {decision.confidence_score}")
    else:
        lines.append("")
        lines.append("AI Decision: no decision recorded yet")

    return "\n".join(lines)


def _call_copilot_llm(case_context: str, question: str) -> str:
    """Call the LLM directly without Instructor and return the raw text response.

    Uses temperature 0.3 for slightly more natural language while keeping answers factual.
    Reads OLLAMA_URL and OLLAMA_MODEL from environment variables.
    """
    ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    model = os.environ.get("OLLAMA_MODEL", "qwen2.5:14b")
    client = OpenAI(base_url=f"{ollama_url}/v1", api_key="ollama")

    user_content = f"Case Details:\n{case_context}\n\nReviewer Question: {question}"

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": _COPILOT_SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.3,
    )
    return response.choices[0].message.content or ""


def _parse_bilingual_response(raw: str) -> tuple[str, str]:
    """Split a raw LLM response into English and Arabic parts.

    Expects the model to follow the ENGLISH: / ARABIC: format from the system prompt.
    Falls back gracefully if the model does not follow the format exactly.
    """
    upper = raw.upper()
    arabic_marker = "ARABIC:"
    english_marker = "ENGLISH:"

    if arabic_marker in upper:
        arabic_pos = upper.index(arabic_marker)
        en_raw = raw[:arabic_pos]
        ar_raw = raw[arabic_pos + len(arabic_marker):]

        if english_marker in en_raw.upper():
            en_start = en_raw.upper().index(english_marker) + len(english_marker)
            en_raw = en_raw[en_start:]

        return en_raw.strip(), ar_raw.strip()

    return raw.strip(), ""


@router.post("/copilot", response_model=CopilotResponse)
async def copilot_query(
    body: CopilotRequest,
    db: Session = Depends(get_db),
) -> CopilotResponse:
    """Answer a staff reviewer question about a specific case in English and Arabic."""
    try:
        case_uuid = uuid_lib.UUID(body.case_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(message="Invalid case ID format", code="VALIDATION_ERROR").model_dump(),
        )

    try:
        case = (
            db.query(Case)
            .options(
                selectinload(Case.citizen),
                selectinload(Case.documents),
                selectinload(Case.decision),
            )
            .filter(Case.id == case_uuid)
            .first()
        )
        if not case:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(message="Case not found", code="CASE_NOT_FOUND").model_dump(),
            )

        context = _build_case_context(case)
        raw_answer = _call_copilot_llm(context, body.question)
        answer_en, answer_ar = _parse_bilingual_response(raw_answer)

        if not answer_ar:
            answer_ar = "الإجابة باللغة العربية غير متاحة حالياً."

        return CopilotResponse(
            answer_en=answer_en,
            answer_ar=answer_ar,
            case_id=body.case_id,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("copilot_query failed for case %s: %s", body.case_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Copilot query failed", detail=str(exc), code="DECISION_FAILED").model_dump(),
        )
