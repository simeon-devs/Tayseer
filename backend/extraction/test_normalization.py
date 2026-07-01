"""Unit tests for backend/extraction/normalization.py.

Pure stdlib tests, no OCR, no LLM, no database. Run directly:
    python backend/extraction/test_normalization.py
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.extraction.normalization import (
    normalize_arabic_indic_digits,
    parse_document_date,
    validate_emirates_id_format,
)


def _check_digit_normalization() -> bool:
    cases = [
        ("٧٨٤١٩٩٠", "7841990"),
        ("۰۱۲۳۴۵۶۷۸۹", "0123456789"),
        ("784-1990-1234567-1", "784-1990-1234567-1"),
        ("", ""),
    ]
    passed = True
    for raw, expected in cases:
        result = normalize_arabic_indic_digits(raw)
        ok = result == expected
        passed = passed and ok
        print(f"  normalize({raw!r}) == {expected!r}: {'PASS' if ok else 'FAIL (got ' + repr(result) + ')'}")
    return passed


def _check_emirates_id_validation() -> bool:
    cases = [
        ("784-1990-1234567-1", True),
        ("784-2001-7654321-9", True),
        (None, False),
        ("", False),
        ("784-19-1234567-1", False),
        ("not an id", False),
        ("784199012345671", False),
    ]
    passed = True
    for raw, expected in cases:
        result = validate_emirates_id_format(raw)
        ok = result == expected
        passed = passed and ok
        print(f"  validate({raw!r}) == {expected}: {'PASS' if ok else 'FAIL (got ' + repr(result) + ')'}")
    return passed


def _check_date_parsing() -> bool:
    cases = [
        ("2026-05-01", date(2026, 5, 1)),
        ("01/05/2026", date(2026, 5, 1)),
        ("01-05-2026", date(2026, 5, 1)),
        ("01.05.2026", date(2026, 5, 1)),
        (None, None),
        ("", None),
        ("not a date", None),
    ]
    passed = True
    for raw, expected in cases:
        result = parse_document_date(raw)
        ok = result == expected
        passed = passed and ok
        print(f"  parse({raw!r}) == {expected}: {'PASS' if ok else 'FAIL (got ' + repr(result) + ')'}")
    return passed


def run_tests() -> bool:
    print("=" * 60)
    print("NORMALIZATION UNIT TESTS")
    print("=" * 60)

    print("\nDigit normalization:")
    r1 = _check_digit_normalization()

    print("\nEmirates ID format validation:")
    r2 = _check_emirates_id_validation()

    print("\nDate parsing:")
    r3 = _check_date_parsing()

    all_passed = r1 and r2 and r3
    print("\n" + "=" * 60)
    print(f"STATUS: {'PASS' if all_passed else 'FAIL'}")
    print("=" * 60)
    return all_passed


if __name__ == "__main__":
    sys.exit(0 if run_tests() else 1)
