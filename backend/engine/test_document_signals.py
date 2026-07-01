"""Unit tests for the pure functions in backend/engine/document_signals.py.

Only tests is_id_expired and is_income_inconsistent, which take plain values
and need no database or OCR. The DB-backed lookups (derive_has_expired_id,
derive_suspected_fraud, augment_profile_with_documents) are covered by manual
end-to-end verification once the full stack is running, per PROGRESS.md.

Run directly:
    python backend/engine/test_document_signals.py
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.engine.document_signals import is_id_expired, is_income_inconsistent

_FIXED_TODAY = date(2026, 7, 1)


def _check_is_id_expired() -> bool:
    cases = [
        ("2020-01-01", True),
        ("2030-01-01", False),
        (_FIXED_TODAY.isoformat(), False),
        (None, False),
        ("", False),
        ("not a date", False),
    ]
    passed = True
    for raw, expected in cases:
        result = is_id_expired(raw, today=_FIXED_TODAY)
        ok = result == expected
        passed = passed and ok
        print(f"  is_id_expired({raw!r}, today={_FIXED_TODAY}) == {expected}: {'PASS' if ok else 'FAIL (got ' + repr(result) + ')'}")
    return passed


def _check_is_income_inconsistent() -> bool:
    cases = [
        (15000.0, 15000.0, False),
        (15000.0, 14000.0, False),
        (15000.0, 6000.0, True),
        (15000.0, None, False),
        (0.0, 5000.0, False),
        (-100.0, 5000.0, False),
        (10000.0, 5999.0, True),
        (10000.0, 6000.0, False),
    ]
    passed = True
    for income, declared, expected in cases:
        result = is_income_inconsistent(income, declared)
        ok = result == expected
        passed = passed and ok
        print(f"  is_income_inconsistent({income}, {declared}) == {expected}: {'PASS' if ok else 'FAIL (got ' + repr(result) + ')'}")
    return passed


def run_tests() -> bool:
    print("=" * 60)
    print("DOCUMENT SIGNALS UNIT TESTS")
    print("=" * 60)

    print("\nis_id_expired:")
    r1 = _check_is_id_expired()

    print("\nis_income_inconsistent:")
    r2 = _check_is_income_inconsistent()

    all_passed = r1 and r2
    print("\n" + "=" * 60)
    print(f"STATUS: {'PASS' if all_passed else 'FAIL'}")
    print("=" * 60)
    return all_passed


if __name__ == "__main__":
    sys.exit(0 if run_tests() else 1)
