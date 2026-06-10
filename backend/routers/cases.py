"""FastAPI router for B3 case management endpoints.

Provides GET /api/cases, GET /api/cases/:id, POST /api/cases,
PATCH /api/cases/:id/override, and PATCH /api/cases/:id/status.
"""

from __future__ import annotations

import logging
import re
import uuid as uuid_lib
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from backend.database import get_db
from backend.models.audit_log import AuditLog
from backend.models.case import Case, VALID_STATUSES
from backend.models.citizen import Citizen
from backend.models.decision import Decision
from backend.models.override import Override
from backend.schemas.cases import (
    AcceptProposalRequest,
    AcceptProposalResponse,
    CaseCreateRequest,
    CaseDetailResponse,
    CaseResponse,
    CitizenResponse,
    OverrideRequest,
    StatusUpdateRequest,
)
from backend.schemas.decisions import CaseListItem, DecisionOutput
from backend.schemas.documents import DocumentResult, ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["cases"])

_EMIRATES_ID_PATTERN = re.compile(r"^784-\d{4}-\d{7}-\d$")
_JUSTIFICATION_MIN_LENGTH = 20


def _case_to_response(case: Case) -> CaseResponse:
    """Build a CaseResponse from a Case ORM object."""
    return CaseResponse(
        id=str(case.id),
        citizen_id=str(case.citizen_id),
        status=case.status,
        created_at=case.created_at.isoformat(),
        updated_at=case.updated_at.isoformat(),
        assigned_to=case.assigned_to,
        arrears_amount=case.arrears_amount,
    )


def _decision_to_output(decision: Decision) -> DecisionOutput:
    """Build a DecisionOutput from a Decision ORM object."""
    return DecisionOutput(
        approved_amount=decision.approved_amount,
        duration_months=decision.duration_months,
        monthly_instalment=decision.monthly_instalment,
        hardship_score=decision.hardship_score,
        escalate_flag=decision.escalate_flag,
        escalation_reason=decision.escalation_reason,
        rationale_en=decision.rationale_en or "",
        rationale_ar=decision.rationale_ar or "",
        rules_applied=decision.rules_applied or [],
        confidence_score=decision.confidence_score or 0.0,
        proposed_extension_months=decision.proposed_extension_months,
        proposed_extension_amount=decision.proposed_extension_amount,
    )


def _decision_summary(decision: Decision) -> str:
    """Build a one-line summary string from a Decision ORM object."""
    if decision.escalate_flag:
        reason = (decision.escalation_reason or "reason not specified")[:80]
        return f"Escalated: {reason}"
    amount = decision.approved_amount or 0
    months = decision.duration_months or 0
    instalment = decision.monthly_instalment or 0
    return f"Approved AED {amount:,.0f} over {months} months at AED {instalment:,.2f}/month"


@router.get("/cases", response_model=list[CaseListItem])
async def list_cases(
    status: Optional[str] = Query(None, description="Filter by case status"),
    db: Session = Depends(get_db),
) -> list[CaseListItem]:
    """Return all cases ordered by created_at descending with optional status filter."""
    try:
        query = db.query(Case).options(
            selectinload(Case.citizen),
            selectinload(Case.decision),
        )
        if status:
            if status not in VALID_STATUSES:
                raise HTTPException(
                    status_code=400,
                    detail=ErrorResponse(
                        message=f"Invalid status filter: {status}",
                        code="VALIDATION_ERROR",
                    ).model_dump(),
                )
            query = query.filter(Case.status == status)
        cases = query.order_by(Case.created_at.desc()).all()

        result: list[CaseListItem] = []
        for case in cases:
            summary: Optional[str] = None
            if case.decision:
                summary = _decision_summary(case.decision)
            result.append(
                CaseListItem(
                    id=str(case.id),
                    citizen_name_ar=case.citizen.name_ar,
                    citizen_name_en=case.citizen.name_en,
                    emirates_id=case.citizen.emirates_id,
                    status=case.status,
                    arrears_amount=case.arrears_amount,
                    created_at=case.created_at.isoformat(),
                    decision_summary=summary,
                )
            )
        return result

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("list_cases failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Failed to retrieve cases", detail=str(exc)).model_dump(),
        )


@router.get("/cases/{case_id}", response_model=CaseDetailResponse)
async def get_case(
    case_id: str,
    db: Session = Depends(get_db),
) -> CaseDetailResponse:
    """Return full case detail including citizen, documents, and decision."""
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

        citizen_resp = CitizenResponse(
            id=str(case.citizen.id),
            name_ar=case.citizen.name_ar,
            name_en=case.citizen.name_en,
            emirates_id=case.citizen.emirates_id,
            phone=case.citizen.phone,
            email=case.citizen.email,
        )

        doc_list = [
            DocumentResult(
                document_type=doc.document_type,
                extracted_fields=doc.extracted_fields or {},
                confidence=doc.extraction_confidence or 0.0,
                missing_fields=[],
                case_id=str(doc.case_id),
            )
            for doc in case.documents
        ]

        decision_out: Optional[DecisionOutput] = None
        if case.decision:
            decision_out = _decision_to_output(case.decision)

        return CaseDetailResponse(
            case=_case_to_response(case),
            citizen=citizen_resp,
            documents=doc_list,
            decision=decision_out,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("get_case failed for %s: %s", case_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Failed to retrieve case", detail=str(exc)).model_dump(),
        )


@router.post("/cases", status_code=201, response_model=CaseResponse)
async def create_case(
    body: CaseCreateRequest,
    db: Session = Depends(get_db),
) -> CaseResponse:
    """Create a new case and citizen record (or find existing citizen by Emirates ID)."""
    if not _EMIRATES_ID_PATTERN.match(body.emirates_id):
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                message="Emirates ID must match the format 784-XXXX-XXXXXXX-X",
                code="INVALID_EMIRATES_ID",
            ).model_dump(),
        )

    try:
        citizen = db.query(Citizen).filter(Citizen.emirates_id == body.emirates_id).first()
        if not citizen:
            citizen = Citizen(
                name_ar=body.citizen_name_ar,
                name_en=body.citizen_name_en,
                emirates_id=body.emirates_id,
                phone=body.phone,
                email=body.email,
            )
            db.add(citizen)
            db.flush()

        case = Case(
            citizen_id=citizen.id,
            status="pending",
            arrears_amount=body.arrears_amount,
        )
        db.add(case)
        db.flush()

        audit = AuditLog(
            case_id=case.id,
            action="case_created",
            performed_by="system",
            details={
                "citizen_name_en": body.citizen_name_en,
                "emirates_id": body.emirates_id,
                "arrears_amount": body.arrears_amount,
                "documents_submitted": body.documents_submitted,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(case)

        logger.info("Created case %s for citizen %s", case.id, citizen.emirates_id)
        return _case_to_response(case)

    except Exception as exc:
        db.rollback()
        logger.error("create_case failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Failed to create case", detail=str(exc)).model_dump(),
        )


@router.patch("/cases/{case_id}/override", response_model=CaseDetailResponse)
async def override_decision(
    case_id: str,
    body: OverrideRequest,
    db: Session = Depends(get_db),
) -> CaseDetailResponse:
    """Apply a staff override to an existing AI decision."""
    if len(body.justification) < _JUSTIFICATION_MIN_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                message=f"Justification must be at least {_JUSTIFICATION_MIN_LENGTH} characters",
                code="JUSTIFICATION_TOO_SHORT",
            ).model_dump(),
        )

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

        original_decision_id = case.decision.id if case.decision else None

        override_row = Override(
            case_id=case.id,
            staff_id=body.staff_id,
            original_decision_id=original_decision_id,
            new_amount=body.new_amount,
            new_duration=body.new_duration,
            justification=body.justification,
        )
        db.add(override_row)

        case.status = "overridden"

        if case.decision and (body.new_amount is not None or body.new_duration is not None):
            if body.new_amount is not None:
                case.decision.approved_amount = body.new_amount
            if body.new_duration is not None:
                case.decision.duration_months = body.new_duration
            if case.decision.approved_amount and case.decision.duration_months:
                case.decision.monthly_instalment = round(
                    case.decision.approved_amount / case.decision.duration_months, 2
                )

        audit = AuditLog(
            case_id=case.id,
            action="decision_overridden",
            performed_by=body.staff_id,
            details={
                "new_amount": body.new_amount,
                "new_duration": body.new_duration,
                "justification": body.justification,
                "original_decision_id": str(original_decision_id) if original_decision_id else None,
            },
        )
        db.add(audit)
        db.commit()
        db.refresh(case)

        citizen_resp = CitizenResponse(
            id=str(case.citizen.id),
            name_ar=case.citizen.name_ar,
            name_en=case.citizen.name_en,
            emirates_id=case.citizen.emirates_id,
            phone=case.citizen.phone,
            email=case.citizen.email,
        )
        doc_list = [
            DocumentResult(
                document_type=doc.document_type,
                extracted_fields=doc.extracted_fields or {},
                confidence=doc.extraction_confidence or 0.0,
                missing_fields=[],
                case_id=str(doc.case_id),
            )
            for doc in case.documents
        ]
        decision_out = _decision_to_output(case.decision) if case.decision else None

        return CaseDetailResponse(
            case=_case_to_response(case),
            citizen=citizen_resp,
            documents=doc_list,
            decision=decision_out,
        )

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error("override_decision failed for case %s: %s", case_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Failed to apply override", detail=str(exc)).model_dump(),
        )


@router.patch("/cases/{case_id}/status", response_model=CaseResponse)
async def update_case_status(
    case_id: str,
    body: StatusUpdateRequest,
    db: Session = Depends(get_db),
) -> CaseResponse:
    """Update case status with an audit log entry."""
    if body.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                message=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}",
                code="VALIDATION_ERROR",
            ).model_dump(),
        )

    try:
        case_uuid = uuid_lib.UUID(case_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(message="Invalid case ID format", code="VALIDATION_ERROR").model_dump(),
        )

    try:
        case = db.query(Case).filter(Case.id == case_uuid).first()
        if not case:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(message="Case not found", code="CASE_NOT_FOUND").model_dump(),
            )

        old_status = case.status
        case.status = body.status

        audit = AuditLog(
            case_id=case.id,
            action="status_updated",
            performed_by=body.performed_by,
            details={"old_status": old_status, "new_status": body.status},
        )
        db.add(audit)
        db.commit()
        db.refresh(case)

        return _case_to_response(case)

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error("update_case_status failed for case %s: %s", case_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Failed to update case status", detail=str(exc)).model_dump(),
        )


@router.post("/cases/{case_id}/accept-proposal", response_model=AcceptProposalResponse)
async def accept_proposal(
    case_id: str,
    body: AcceptProposalRequest,
    db: Session = Depends(get_db),
) -> AcceptProposalResponse:
    """Accept or edit the AI-proposed extension plan and approve the case.

    Sets case status to approved, records the accepted repayment terms on the
    decision row, and writes an audit log entry with the officer's details and
    the agreed start date.
    """
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
            .options(selectinload(Case.decision))
            .filter(Case.id == case_uuid)
            .first()
        )
        if not case:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(message="Case not found", code="CASE_NOT_FOUND").model_dump(),
            )

        case.status = "approved"

        if case.decision:
            case.decision.approved_amount = round(body.extension_months * body.monthly_amount, 2)
            case.decision.duration_months = body.extension_months
            case.decision.monthly_instalment = round(body.monthly_amount, 2)

        audit = AuditLog(
            case_id=case.id,
            action="proposal_accepted",
            performed_by=body.performed_by,
            details={
                "extension_months": body.extension_months,
                "monthly_amount": body.monthly_amount,
                "start_date": body.start_date,
                "total_plan_value": round(body.extension_months * body.monthly_amount, 2),
            },
        )
        db.add(audit)
        db.commit()

        logger.info(
            "Proposal accepted for case %s: %d months at %.2f AED starting %s by %s",
            case_id, body.extension_months, body.monthly_amount, body.start_date, body.performed_by,
        )
        return AcceptProposalResponse(
            status="accepted",
            message=f"Proposed plan accepted. Case approved: {body.extension_months} months at AED {body.monthly_amount:,.2f}/month starting {body.start_date}.",
            case_id=case_id,
        )

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error("accept_proposal failed for case %s: %s", case_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(message="Failed to accept proposal", detail=str(exc)).model_dump(),
        )
