"""FastAPI router for D1 PDF decision letter endpoint.

Exposes GET /api/cases/:id/letter which generates a bilingual WeasyPrint PDF
with embedded QR code linking to the public verification page.
"""

from __future__ import annotations

import base64
import io
import logging
import os
import uuid as uuid_lib
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session, selectinload
import qrcode

from backend.database import get_db
from backend.models.case import Case
from backend.schemas.documents import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["letters"])

_TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
_JINJA_ENV = Environment(loader=FileSystemLoader(str(_TEMPLATES_DIR)), autoescape=False)


def _make_qr_b64(url: str) -> str:
    """Generate a QR code for the URL and return as a base64-encoded PNG string."""
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _render_pdf(html_str: str) -> bytes:
    """Render an HTML string to PDF bytes using WeasyPrint."""
    from weasyprint import HTML
    return HTML(string=html_str).write_pdf()


@router.get("/cases/{case_id}/letter")
async def get_letter(
    case_id: str,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """Generate and return the bilingual PDF decision letter for a decided case."""
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3001")

    try:
        case_uuid = uuid_lib.UUID(case_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(message="Invalid case ID format", code="VALIDATION_ERROR").model_dump(),
        )

    try:
        case = (
            db.query(Case)
            .options(selectinload(Case.citizen), selectinload(Case.decision))
            .filter(Case.id == case_uuid)
            .first()
        )
        if not case:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(message="Case not found", code="CASE_NOT_FOUND").model_dump(),
            )
        if not case.decision:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(
                    message="No decision found for this case", code="DECISION_NOT_FOUND"
                ).model_dump(),
            )

        decision = case.decision
        citizen = case.citizen
        decision_date = ""
        if decision.created_at:
            decision_date = decision.created_at.strftime("%d %B %Y")

        verification_url = f"{frontend_url}/verify/{case_id}"
        qr_code_base64 = _make_qr_b64(verification_url)

        arrears_amount = f"{case.arrears_amount:,.2f}" if case.arrears_amount else "N/A"
        monthly_instalment = (
            f"{decision.monthly_instalment:,.2f}" if decision.monthly_instalment else ""
        )

        template = _JINJA_ENV.get_template("letter.html")
        html_str = template.render(
            case_reference=str(case_id)[:8].upper(),
            case_uuid=str(case_id),
            citizen_name_ar=citizen.name_ar,
            citizen_name_en=citizen.name_en,
            emirates_id=citizen.emirates_id,
            arrears_amount=arrears_amount,
            duration_months=str(decision.duration_months or ""),
            monthly_instalment=monthly_instalment,
            decision_date=decision_date,
            rationale_ar=decision.rationale_ar or "",
            rationale_en=decision.rationale_en or "",
            escalate_flag=decision.escalate_flag,
            escalation_reason=decision.escalation_reason or "",
            rules_applied=decision.rules_applied or [],
            qr_code_base64=qr_code_base64,
        )

        pdf_bytes = _render_pdf(html_str)
        filename = f"tayseer-decision-{str(case_id)[:8]}.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("PDF generation failed for case %s: %s", case_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="PDF generation failed",
                detail=str(exc),
                code="PDF_GENERATION_FAILED",
            ).model_dump(),
        )
