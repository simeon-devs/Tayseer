"""Unit tests for the confidence scoring helpers in backend/extraction/extractor.py.

No OCR, no LLM, no database. Run directly:
    python backend/extraction/test_scoring.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.extraction.extractor import _penalize_malformed_id_number, _score_result


def _check_score_result() -> bool:
    cases = [
        ({"employer": "Acme", "monthly_salary": 15000.0, "net_salary": 14000.0, "currency": "AED"}, 1.0, []),
        ({"employer": None, "monthly_salary": 15000.0, "net_salary": None, "currency": "AED"}, 0.33, ["employer", "net_salary"]),
        ({"employer": None, "monthly_salary": None, "net_salary": None, "currency": "AED"}, 0.0, ["employer", "monthly_salary", "net_salary"]),
    ]
    passed = True
    for extracted, expected_conf, expected_missing in cases:
        conf, missing = _score_result(extracted)
        ok = conf == expected_conf and missing == expected_missing
        passed = passed and ok
        print(f"  {extracted} -> confidence={conf}, missing={missing}: {'PASS' if ok else 'FAIL'}")
    return passed


def _check_penalize_malformed_id_number() -> bool:
    valid = {"id_number": "784-1990-1234567-1", "name_ar": "محمد", "name_en": "Mohammed", "expiry_date": "2030-01-01"}
    conf, missing = _score_result(valid)
    conf, missing = _penalize_malformed_id_number(valid, conf, missing)
    case1_ok = conf == 1.0 and missing == []
    print(f"  well-formed id_number: confidence={conf}, missing={missing}: {'PASS' if case1_ok else 'FAIL'}")

    malformed = {"id_number": "not-a-real-id", "name_ar": "محمد", "name_en": "Mohammed", "expiry_date": "2030-01-01"}
    conf, missing = _score_result(malformed)
    conf, missing = _penalize_malformed_id_number(malformed, conf, missing)
    case2_ok = conf == 0.75 and missing == ["id_number_invalid_format"]
    print(f"  malformed id_number: confidence={conf}, missing={missing}: {'PASS' if case2_ok else 'FAIL'}")

    missing_id = {"id_number": None, "name_ar": "محمد", "name_en": "Mohammed", "expiry_date": "2030-01-01"}
    conf, missing = _score_result(missing_id)
    conf, missing = _penalize_malformed_id_number(missing_id, conf, missing)
    case3_ok = conf == 0.75 and missing == ["id_number"]
    print(f"  absent id_number (untouched by penalty): confidence={conf}, missing={missing}: {'PASS' if case3_ok else 'FAIL'}")

    return case1_ok and case2_ok and case3_ok


def run_tests() -> bool:
    print("=" * 60)
    print("SCORING UNIT TESTS")
    print("=" * 60)

    print("\n_score_result:")
    r1 = _check_score_result()

    print("\n_penalize_malformed_id_number:")
    r2 = _check_penalize_malformed_id_number()

    all_passed = r1 and r2
    print("\n" + "=" * 60)
    print(f"STATUS: {'PASS' if all_passed else 'FAIL'}")
    print("=" * 60)
    return all_passed


if __name__ == "__main__":
    sys.exit(0 if run_tests() else 1)
