"""Pydantic schemas for document extraction results.

All schemas match the canonical definitions in docs/API_CONTRACTS.md exactly.
Import from this module in all application code that handles document extraction.
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class DocumentType(str, Enum):
    """Supported document types for the extraction pipeline."""

    salary_certificate = "salary_certificate"
    bank_statement = "bank_statement"
    emirates_id = "emirates_id"
    tenancy_contract = "tenancy_contract"
    other = "other"


class SalaryCertificate(BaseModel):
    """Structured fields extracted from a salary certificate."""

    employer: str | None = None
    monthly_salary: float | None = None
    net_salary: float | None = None
    currency: str = "AED"


class BankStatement(BaseModel):
    """Structured fields extracted from a bank statement."""

    bank_name: str | None = None
    average_balance: float | None = None
    total_credits_3m: float | None = None


class EmiratesID(BaseModel):
    """Structured fields extracted from an Emirates ID card."""

    id_number: str | None = None
    name_ar: str | None = None
    name_en: str | None = None
    expiry_date: str | None = None


class DocumentResult(BaseModel):
    """Result returned by the extraction endpoint for a single uploaded document."""

    document_type: str
    extracted_fields: dict
    confidence: float
    missing_fields: list[str]
    case_id: str


class ErrorResponse(BaseModel):
    """Standard error response returned by all endpoints on failure."""

    message: str
    detail: str | None = None
    code: str | None = None


class CompletenessReport(BaseModel):
    """Report indicating which mandatory and optional documents have been submitted."""

    mandatory_present: list[str]
    mandatory_missing: list[str]
    optional_present: list[str]


_MANDATORY_DOCUMENTS: set[str] = {
    DocumentType.salary_certificate.value,
    DocumentType.bank_statement.value,
    DocumentType.emirates_id.value,
}

_OPTIONAL_DOCUMENTS: set[str] = {
    DocumentType.tenancy_contract.value,
}


def check_completeness(documents: list[DocumentResult]) -> CompletenessReport:
    """Return a completeness report for a list of extracted documents.

    Mandatory documents are salary_certificate, bank_statement, and emirates_id.
    Tenancy contract is optional. Any other document type is ignored for completeness.
    """
    submitted_types: set[str] = {doc.document_type for doc in documents}
    mandatory_present = sorted(submitted_types & _MANDATORY_DOCUMENTS)
    mandatory_missing = sorted(_MANDATORY_DOCUMENTS - submitted_types)
    optional_present = sorted(submitted_types & _OPTIONAL_DOCUMENTS)
    return CompletenessReport(
        mandatory_present=mandatory_present,
        mandatory_missing=mandatory_missing,
        optional_present=optional_present,
    )
