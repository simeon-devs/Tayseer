"""Unit tests for detect_document_type() in backend/extraction/extractor.py.

Uses synthetic OCR snippets, no image files, no Tesseract, no LLM. Run directly:
    python backend/extraction/test_document_type.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.extraction.extractor import detect_document_type
from backend.schemas.documents import DocumentType


def run_tests() -> bool:
    cases = [
        (
            "SALARY CERTIFICATE\nBasic Salary: 15000 AED\nSalary transferred monthly to Emirates NBD Bank account.",
            DocumentType.salary_certificate,
        ),
        (
            "BANK STATEMENT\nAccount Statement for the period 01/01/2026 to 31/03/2026\nAverage Balance: 12400 AED",
            DocumentType.bank_statement,
        ),
        (
            "كشف حساب بنكي\nصاحب الحساب: محمد أحمد\nالرصيد: 12400 درهم",
            DocumentType.bank_statement,
        ),
        (
            "UNITED ARAB EMIRATES\nEMIRATES ID\nID Number: 784-1990-1234567-1\nExpiry: 2030-01-01",
            DocumentType.emirates_id,
        ),
        (
            "TENANCY CONTRACT\nLease Agreement between landlord and tenant",
            DocumentType.tenancy_contract,
        ),
        (
            "This document mentions a bank in passing but has no other signal.",
            DocumentType.other,
        ),
    ]

    passed = 0
    for text, expected in cases:
        result = detect_document_type(text)
        ok = result == expected
        passed += int(ok)
        label = text.splitlines()[0][:50]
        print(f"  '{label}...' -> {result.value} (expected {expected.value}): {'PASS' if ok else 'FAIL'}")

    total = len(cases)
    print(f"\nSCORE: {passed} / {total}")
    return passed == total


if __name__ == "__main__":
    sys.exit(0 if run_tests() else 1)
