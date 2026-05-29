"""Seed decisions for the first 5 cases from data/cases.json.

Backfills arrears_amount on all seeded cases then runs the full decision
pipeline on the first 5 to create real Decision records in the database.

Run inside the container:
    python backend/engine/seed_decisions.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.database import SessionLocal
from backend.engine.decision import make_decision
from backend.models.case import Case
from backend.models.citizen import Citizen
from backend.schemas.decisions import CitizenFinancialProfile

_CASES_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "cases.json"
_SEED_DECISION_COUNT = 5


def _backfill_arrears(db: object, cases_by_eid: dict) -> int:
    """Update arrears_amount on cases that have NULL from pre-migration seed."""
    updated = 0
    for eid, record in cases_by_eid.items():
        citizen = db.query(Citizen).filter(Citizen.emirates_id == eid).first()
        if not citizen:
            continue
        arrears = record["financial_profile"]["arrears_amount"]
        rows = db.query(Case).filter(
            Case.citizen_id == citizen.id,
            Case.arrears_amount.is_(None),
        ).all()
        for case in rows:
            case.arrears_amount = arrears
            updated += 1
    if updated:
        db.commit()
    return updated


def seed_decisions() -> None:
    """Backfill arrears_amount and create decisions for the first 5 seeded cases."""
    with open(_CASES_FILE, encoding="utf-8") as f:
        all_cases = json.load(f)

    cases_by_eid = {c["citizen"]["emirates_id"]: c for c in all_cases[:20]}

    db = SessionLocal()
    try:
        backfilled = _backfill_arrears(db, cases_by_eid)
        print(f"Backfilled arrears_amount on {backfilled} cases.")

        seeded_cases = (
            db.query(Case)
            .join(Citizen)
            .filter(Citizen.emirates_id.in_(list(cases_by_eid.keys())))
            .filter(Case.arrears_amount.isnot(None))
            .order_by(Case.created_at)
            .limit(_SEED_DECISION_COUNT)
            .all()
        )

        if not seeded_cases:
            print("No seeded cases found. Run backend/seed.py first.")
            return

        print(f"\nRunning decisions on {len(seeded_cases)} cases...\n")
        decided = 0
        for case in seeded_cases:
            citizen = db.query(Citizen).filter(Citizen.id == case.citizen_id).first()
            if not citizen:
                continue

            record = cases_by_eid.get(citizen.emirates_id)
            if not record:
                continue

            if case.decision:
                print(f"  {citizen.name_en}: decision already exists, skipping")
                continue

            fp = record["financial_profile"]
            profile = CitizenFinancialProfile(
                monthly_income=fp["monthly_income"],
                existing_obligations=fp["existing_obligations"],
                arrears_amount=fp["arrears_amount"],
                delay_duration_months=fp["delay_duration_months"],
            )

            result = make_decision(case_id=str(case.id), profile=profile, db=db)
            decided += 1
            flag = "ESCALATED" if result.escalate_flag else "APPROVED"
            print(
                f"  [{flag}] {citizen.name_en}: "
                f"AED {result.approved_amount or 0:,.0f} / {result.duration_months or 0}mo"
                f" | confidence {result.confidence_score:.0%}"
            )

        print(f"\nDecisions created: {decided}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_decisions()
