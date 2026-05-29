"""Tayseer Pydantic schemas. Import any schema from backend.schemas directly."""

from backend.schemas.documents import (
    BankStatement,
    CompletenessReport,
    DocumentResult,
    DocumentType,
    EmiratesID,
    ErrorResponse,
    SalaryCertificate,
    check_completeness,
)

__all__ = [
    "BankStatement",
    "CompletenessReport",
    "DocumentResult",
    "DocumentType",
    "EmiratesID",
    "ErrorResponse",
    "SalaryCertificate",
    "check_completeness",
]
