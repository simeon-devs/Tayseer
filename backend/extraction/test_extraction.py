"""Extraction quality test for the B1 document pipeline.

Tests the full OCR + LLM extraction pipeline against the three synthetic
benchmark documents from the benchmarking session.

Run inside the container:
    python backend/extraction/test_extraction.py

Pass criteria:
    Salary certificate: net_salary == 21800
    Bank statement:     average_balance == 12400
    Emirates ID:        id_number matches the 784-XXXX-XXXXXXX-X pattern
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.extraction.extractor import extract_document

BENCHMARK_DIR = Path(__file__).resolve().parent.parent.parent / "arrears_benchmark" / "docs"

_EMIRATES_ID_PATTERN = re.compile(r"^784-\d{4}-\d{7}-\d$")


def _check_salary_certificate(doc_path: Path) -> bool:
    """Return True if net_salary is extracted and equals 21800."""
    print(f"\n{'='*60}")
    print(f"Document: {doc_path.name}")
    result = extract_document(str(doc_path), case_id="test-salary-001")
    print(f"  Type detected   : {result.document_type}")
    print(f"  Confidence      : {result.confidence:.2f}")
    print(f"  Extracted fields:")
    for k, v in result.extracted_fields.items():
        print(f"    {k}: {v}")
    if result.missing_fields:
        print(f"  Missing fields  : {', '.join(result.missing_fields)}")

    net_salary = result.extracted_fields.get("net_salary")
    passed = net_salary is not None and abs(float(net_salary) - 21800) < 1
    print(f"  Pass criteria   : net_salary == 21800 (got {net_salary})")
    print(f"  Result          : {'PASS' if passed else 'FAIL'}")
    return passed


def _check_bank_statement(doc_path: Path) -> bool:
    """Return True if average_balance is extracted and equals 12400."""
    print(f"\n{'='*60}")
    print(f"Document: {doc_path.name}")
    result = extract_document(str(doc_path), case_id="test-bank-001")
    print(f"  Type detected   : {result.document_type}")
    print(f"  Confidence      : {result.confidence:.2f}")
    print(f"  Extracted fields:")
    for k, v in result.extracted_fields.items():
        print(f"    {k}: {v}")
    if result.missing_fields:
        print(f"  Missing fields  : {', '.join(result.missing_fields)}")

    avg_bal = result.extracted_fields.get("average_balance")
    passed = avg_bal is not None and abs(float(avg_bal) - 12400) < 1
    print(f"  Pass criteria   : average_balance == 12400 (got {avg_bal})")
    print(f"  Result          : {'PASS' if passed else 'FAIL'}")
    return passed


def _check_emirates_id(doc_path: Path) -> bool:
    """Return True if id_number is extracted and matches the 784 format."""
    print(f"\n{'='*60}")
    print(f"Document: {doc_path.name}")
    result = extract_document(str(doc_path), case_id="test-eid-001")
    print(f"  Type detected   : {result.document_type}")
    print(f"  Confidence      : {result.confidence:.2f}")
    print(f"  Extracted fields:")
    for k, v in result.extracted_fields.items():
        print(f"    {k}: {v}")
    if result.missing_fields:
        print(f"  Missing fields  : {', '.join(result.missing_fields)}")

    id_number = result.extracted_fields.get("id_number") or ""
    passed = bool(id_number and _EMIRATES_ID_PATTERN.match(str(id_number)))
    print(f"  Pass criteria   : id_number matches 784-XXXX-XXXXXXX-X (got '{id_number}')")
    print(f"  Result          : {'PASS' if passed else 'FAIL'}")
    return passed


def run_tests() -> int:
    """Run all three benchmark tests and return the number that passed."""
    print("\n" + "="*60)
    print("TAYSEER B1 EXTRACTION QUALITY TEST")
    print("="*60)

    if not BENCHMARK_DIR.exists():
        print(f"ERROR: Benchmark directory not found: {BENCHMARK_DIR}")
        print("Ensure the arrears_benchmark volume is mounted.")
        return 0

    salary_path = BENCHMARK_DIR / "salary_certificate.png"
    bank_path = BENCHMARK_DIR / "bank_statement.png"
    eid_path = BENCHMARK_DIR / "emirates_id.png"

    passed = 0
    passed += int(_check_salary_certificate(salary_path))
    passed += int(_check_bank_statement(bank_path))
    passed += int(_check_emirates_id(eid_path))

    print(f"\n{'='*60}")
    print(f"SCORE: {passed} / 3")
    if passed == 3:
        print("STATUS: PASS (all 3 documents extracted correctly)")
    else:
        print(f"STATUS: FAIL (only {passed}/3 passed, target is 3/3)")
    print("="*60 + "\n")

    return passed


if __name__ == "__main__":
    score = run_tests()
    sys.exit(0 if score == 3 else 1)
