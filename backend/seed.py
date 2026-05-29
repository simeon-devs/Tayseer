"""Seed the database with the first 20 cases from data/cases.json.

Run from the project root: python backend/seed.py
Requires the database to be running and DATABASE_URL to be set in the environment.
"""

import json
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import SessionLocal
from backend.models.citizen import Citizen
from backend.models.case import Case


CASES_FILE = Path(__file__).parent.parent / "data" / "cases.json"
SEED_COUNT = 20


def seed() -> None:
    """Read first 20 cases from cases.json and insert into the database."""
    with open(CASES_FILE, encoding="utf-8") as f:
        all_cases = json.load(f)

    cases_to_seed = all_cases[:SEED_COUNT]
    db = SessionLocal()

    try:
        for record in cases_to_seed:
            citizen_data = record["citizen"]
            emirates_id = citizen_data["emirates_id"]

            existing = db.query(Citizen).filter(Citizen.emirates_id == emirates_id).first()
            if existing:
                print(f"Skipping {emirates_id}: citizen already exists")
                continue

            citizen = Citizen(
                id=uuid.uuid4(),
                name_ar=citizen_data["name_ar"],
                name_en=citizen_data["name_en"],
                emirates_id=emirates_id,
                phone=citizen_data.get("phone"),
                email=citizen_data.get("email"),
            )
            db.add(citizen)
            db.flush()

            case = Case(
                id=uuid.uuid4(),
                citizen_id=citizen.id,
                status="pending",
                arrears_amount=record["financial_profile"].get("arrears_amount"),
            )
            db.add(case)
            db.flush()

            print(f"Inserted: {citizen.name_en} ({emirates_id}) -> case {case.id}")

        db.commit()
        print(f"Seed complete: up to {SEED_COUNT} cases inserted.")
    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
