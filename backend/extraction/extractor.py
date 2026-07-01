"""LLM-based field extractor using Instructor and Ollama.

Reads OLLAMA_URL and OLLAMA_MODEL from environment variables on every call.
Uses the Ollama OpenAI-compatible endpoint so Instructor can enforce Pydantic schemas.
Never hardcodes the model name or URL.
"""

from __future__ import annotations

import logging

from backend.engine.llm_client import call_llm_json_mode
from backend.extraction.normalization import normalize_arabic_indic_digits
from backend.extraction.ocr import extract_text
from backend.schemas.documents import (
    BankStatement,
    DocumentResult,
    DocumentType,
    EmiratesID,
    SalaryCertificate,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Extraction prompt templates
# ---------------------------------------------------------------------------

SALARY_CERT_PROMPT = """You are a document extraction assistant. Extract the following fields from the provided OCR text of a salary certificate.

Fields to extract:
- employer: the name of the employer or company issuing the certificate
- monthly_salary: the basic monthly salary as a number (AED)
- net_salary: the net or total monthly salary after allowances and deductions as a number (AED)
- currency: the currency code, almost always AED

Rules:
- Output ONLY valid JSON matching this exact schema: {"employer": string|null, "monthly_salary": number|null, "net_salary": number|null, "currency": string}
- Use null for any field you cannot find in the text
- Never invent values not present in the document
- Do not include any explanation or text outside the JSON object
- Extract numbers as plain numbers without commas or currency symbols"""

BANK_STATEMENT_PROMPT = """You are a document extraction assistant. Extract the following fields from the provided OCR text of a bank statement.

Fields to extract:
- bank_name: the name of the issuing bank
- average_balance: the average account balance as a number (AED)
- total_credits_3m: the total credit transactions over the last 3 months as a number (AED)

Rules:
- Output ONLY valid JSON matching this exact schema: {"bank_name": string|null, "average_balance": number|null, "total_credits_3m": number|null}
- Use null for any field you cannot find in the text
- Never invent values not present in the document
- Do not include any explanation or text outside the JSON object
- Extract numbers as plain numbers without commas or currency symbols"""

EMIRATES_ID_PROMPT = """You are a document extraction assistant. Extract the following fields from the provided OCR text of a UAE Emirates ID card.

Fields to extract:
- id_number: the ID number in the format 784-XXXX-XXXXXXX-X (digits separated by dashes)
- name_ar: the full name written in Arabic script
- name_en: the full name written in English
- expiry_date: the expiry date of the ID card as a string

Rules:
- Output ONLY valid JSON matching this exact schema: {"id_number": string|null, "name_ar": string|null, "name_en": string|null, "expiry_date": string|null}
- Use null for any field you cannot find in the text
- Never invent values not present in the document
- Do not include any explanation or text outside the JSON object
- The id_number must include the dashes in format 784-XXXX-XXXXXXX-X
- The expiry_date must be output in YYYY-MM-DD format regardless of how it is printed on the card"""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Per-document-type extraction functions
# ---------------------------------------------------------------------------

def extract_salary_certificate(ocr_text: str) -> SalaryCertificate:
    """Extract structured fields from salary certificate OCR text via the LLM.

    Returns an empty SalaryCertificate (all None fields) if the LLM call fails.
    """
    try:
        return call_llm_json_mode(SALARY_CERT_PROMPT, f"OCR text:\n\n{ocr_text}", SalaryCertificate)
    except Exception as exc:
        logger.warning("Salary certificate extraction failed: %s", exc)
        return SalaryCertificate()


def extract_bank_statement(ocr_text: str) -> BankStatement:
    """Extract structured fields from bank statement OCR text via the LLM.

    Returns an empty BankStatement (all None fields) if the LLM call fails.
    """
    try:
        return call_llm_json_mode(BANK_STATEMENT_PROMPT, f"OCR text:\n\n{ocr_text}", BankStatement)
    except Exception as exc:
        logger.warning("Bank statement extraction failed: %s", exc)
        return BankStatement()


def extract_emirates_id(ocr_text: str) -> EmiratesID:
    """Extract structured fields from Emirates ID OCR text via the LLM.

    Returns an empty EmiratesID (all None fields) if the LLM call fails.
    """
    try:
        return call_llm_json_mode(EMIRATES_ID_PROMPT, f"OCR text:\n\n{ocr_text}", EmiratesID)
    except Exception as exc:
        logger.warning("Emirates ID extraction failed: %s", exc)
        return EmiratesID()


# ---------------------------------------------------------------------------
# Document type detection
# ---------------------------------------------------------------------------

def detect_document_type(ocr_text: str) -> DocumentType:
    """Classify a document type using keyword matching against the OCR text.

    Checks Arabic and English keywords. Returns DocumentType.other if no
    known keywords are found. The bare word "bank" is not enough on its own
    to classify as bank_statement since a salary certificate can mention a
    bank name for transfer purposes; it must appear alongside a corroborating
    word such as account, statement, balance, or iban.
    """
    text_lower = ocr_text.lower()
    if "شهادة راتب" in ocr_text or "salary certificate" in text_lower or "basic salary" in text_lower:
        return DocumentType.salary_certificate

    bank_word_with_context = "bank" in text_lower and any(
        k in text_lower for k in ("account", "statement", "balance", "iban")
    )
    if (
        "كشف حساب" in ocr_text
        or "bank statement" in text_lower
        or "account statement" in text_lower
        or "رصيد" in ocr_text
        or "صاحب الحساب" in ocr_text
        or bank_word_with_context
    ):
        return DocumentType.bank_statement
    if "هوية" in ocr_text or "emirates id" in text_lower or "identity card" in text_lower or "784-" in ocr_text:
        return DocumentType.emirates_id
    if "عقد إيجار" in ocr_text or "tenancy contract" in text_lower or "lease agreement" in text_lower:
        return DocumentType.tenancy_contract
    return DocumentType.other


# ---------------------------------------------------------------------------
# Confidence and missing field helpers
# ---------------------------------------------------------------------------

def _score_result(extracted: dict) -> tuple[float, list[str]]:
    """Return (confidence, missing_fields) for an extracted fields dict.

    Confidence is the fraction of non-None fields over the total number of fields.
    currency is excluded from missing fields since it always has a default.
    """
    skip_defaults = {"currency"}
    total = 0
    found = 0
    missing: list[str] = []
    for field, value in extracted.items():
        if field in skip_defaults:
            continue
        total += 1
        if value is not None:
            found += 1
        else:
            missing.append(field)
    confidence = round(found / total, 2) if total > 0 else 0.0
    return confidence, missing


# ---------------------------------------------------------------------------
# Full extraction pipeline
# ---------------------------------------------------------------------------

def extract_document(file_path: str, case_id: str) -> DocumentResult:
    """Run the full extraction pipeline for a single document file.

    Steps: OCR text extraction, document type detection, LLM field extraction,
    confidence scoring, and missing field identification.

    Never raises. Returns a DocumentResult with confidence=0.0 and all fields
    missing if any step fails.
    """
    try:
        ocr_text = extract_text(file_path)
        if not ocr_text.strip():
            logger.warning("No text extracted from %s", file_path)
            return DocumentResult(
                document_type=DocumentType.other.value,
                extracted_fields={},
                confidence=0.0,
                missing_fields=[],
                case_id=case_id,
            )

        ocr_text = normalize_arabic_indic_digits(ocr_text)
        doc_type = detect_document_type(ocr_text)

        if doc_type == DocumentType.salary_certificate:
            result = extract_salary_certificate(ocr_text)
        elif doc_type == DocumentType.bank_statement:
            result = extract_bank_statement(ocr_text)
        elif doc_type == DocumentType.emirates_id:
            result = extract_emirates_id(ocr_text)
        else:
            return DocumentResult(
                document_type=doc_type.value,
                extracted_fields={},
                confidence=0.0,
                missing_fields=[],
                case_id=case_id,
            )

        extracted = result.model_dump(exclude_none=False)
        confidence, missing = _score_result(extracted)

        return DocumentResult(
            document_type=doc_type.value,
            extracted_fields=extracted,
            confidence=confidence,
            missing_fields=missing,
            case_id=case_id,
        )

    except Exception as exc:
        logger.warning("extract_document failed for %s: %s", file_path, exc)
        return DocumentResult(
            document_type=DocumentType.other.value,
            extracted_fields={},
            confidence=0.0,
            missing_fields=[],
            case_id=case_id,
        )
