"""FastAPI router for document upload and extraction.

POST /api/documents/extract accepts a multipart upload, runs the extraction
pipeline, writes results to the database, and returns a DocumentResult.
"""

from __future__ import annotations

import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.extraction.extractor import extract_document
from backend.models.audit_log import AuditLog
from backend.models.document import Document
from backend.schemas.documents import DocumentResult, ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])

_UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
_SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp", ".pdf"}


def _ensure_uploads_dir() -> None:
    """Create the uploads directory if it does not exist."""
    _UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/extract", response_model=DocumentResult)
async def extract(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    db: Session = Depends(get_db),
) -> DocumentResult:
    """Accept a document image or PDF, run OCR and LLM extraction.

    Saves the file to the uploads directory, runs the extraction pipeline,
    writes a document record and audit log entry, and returns the DocumentResult.
    """
    _ensure_uploads_dir()

    ext = Path(file.filename or "").suffix.lower()
    if ext not in _SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                message=f"Unsupported file type: {ext}",
                detail=f"Accepted types: {', '.join(sorted(_SUPPORTED_EXTENSIONS))}",
                code="EXTRACTION_FAILED",
            ).model_dump(),
        )

    saved_name = f"{uuid.uuid4()}{ext}"
    saved_path = _UPLOADS_DIR / saved_name

    try:
        content = await file.read()
        saved_path.write_bytes(content)
    except Exception as exc:
        logger.error("Failed to save uploaded file: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to save uploaded file",
                detail=str(exc),
                code="EXTRACTION_FAILED",
            ).model_dump(),
        )

    try:
        result = extract_document(str(saved_path), case_id)
    except Exception as exc:
        logger.error("Extraction pipeline failed for %s: %s", saved_path, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Document extraction failed",
                detail=str(exc),
                code="EXTRACTION_FAILED",
            ).model_dump(),
        )

    try:
        doc = Document(
            case_id=uuid.UUID(case_id) if _is_valid_uuid(case_id) else uuid.uuid4(),
            document_type=result.document_type,
            file_path=str(saved_path),
            extracted_fields=result.extracted_fields,
            extraction_confidence=result.confidence,
        )
        db.add(doc)

        audit = AuditLog(
            case_id=uuid.UUID(case_id) if _is_valid_uuid(case_id) else None,
            action="document_uploaded",
            performed_by="system",
            details={
                "document_type": result.document_type,
                "case_id": case_id,
                "file": saved_name,
                "confidence": result.confidence,
            },
        )
        db.add(audit)
        db.commit()
    except Exception as exc:
        logger.warning("Database write failed after extraction: %s", exc)
        db.rollback()

    return result


def _is_valid_uuid(value: str) -> bool:
    """Return True if the string is a valid UUID."""
    try:
        uuid.UUID(value)
        return True
    except ValueError:
        return False
