"""Demo data setup script for Tayseer.

Clears all case, citizen, decision, document, and audit log data from the
database, then inserts 8 curated demo cases and runs the full decision
pipeline on each. All cases use the official three governance rules.

Run inside the container:
    python backend/demo_setup.py

Or from the project root:
    docker-compose exec fastapi python backend/demo_setup.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.database import SessionLocal
from backend.engine.decision import make_decision
from backend.models.audit_log import AuditLog
from backend.models.case import Case
from backend.models.citizen import Citizen
from backend.models.decision import Decision
from backend.models.document import Document
from backend.models.override import Override
from backend.schemas.decisions import CitizenFinancialProfile

_DEMO_CASES: list[dict] = [
    {
        "label": "Approved UPDATE_INSTALLMENT: high income, low DTI, Rule 1 satisfied",
        "citizen": {
            "name_ar": "محمد النعيمي",
            "name_en": "Mohammed Al Nuaimi",
            "emirates_id": "784-1989-1234567-1",
            "phone": "+971501234501",
            "email": "mohammed.alnuaimi@demo.ae",
        },
        "profile": {
            "monthly_income": 32952,
            "existing_obligations": 2100.0,
            "arrears_amount": 26024,
            "delay_duration_months": 5,
            "has_expired_id": False,
            "suspected_fraud": False,
            "missing_documents": [],
            "original_loan_amount": 800000,
            "remaining_loan_balance": 480000,
            "remaining_loan_period_months": 180,
            "number_of_unpaid_instalments": 5,
            "number_of_family_members": 4,
        },
    },
    {
        "label": "Approved UPDATE_INSTALLMENT: medium income, moderate DTI, Rule 1 and 2 satisfied",
        "citizen": {
            "name_ar": "أحمد الحمادي",
            "name_en": "Ahmed Al Hammadi",
            "emirates_id": "784-1985-2345678-2",
            "phone": "+971501234502",
            "email": "ahmed.alhammadi@demo.ae",
        },
        "profile": {
            "monthly_income": 16572,
            "existing_obligations": 2418.0,
            "arrears_amount": 43741,
            "delay_duration_months": 9,
            "has_expired_id": False,
            "suspected_fraud": False,
            "missing_documents": [],
            "original_loan_amount": 600000,
            "remaining_loan_balance": 390000,
            "remaining_loan_period_months": 240,
            "number_of_unpaid_instalments": 9,
            "number_of_family_members": 3,
        },
    },
    {
        "label": "Approved TRANSFER_ARREARS: high DTI leaves no capacity for additional premium",
        "citizen": {
            "name_ar": "إبراهيم المري",
            "name_en": "Ibrahim Al Marri",
            "emirates_id": "784-1991-3456789-3",
            "phone": "+971501234503",
            "email": "ibrahim.almarri@demo.ae",
        },
        "profile": {
            "monthly_income": 15349,
            "existing_obligations": 3052.0,
            "arrears_amount": 58700,
            "delay_duration_months": 13,
            "has_expired_id": False,
            "suspected_fraud": False,
            "missing_documents": [],
            "original_loan_amount": 550000,
            "remaining_loan_balance": 410000,
            "remaining_loan_period_months": 300,
            "number_of_unpaid_instalments": 13,
            "number_of_family_members": 5,
        },
    },
    {
        "label": "Approved UPDATE_INSTALLMENT: very high income, small arrears, favorable outcome",
        "citizen": {
            "name_ar": "يوسف النهياني",
            "name_en": "Yousuf Al Nahyani",
            "emirates_id": "784-1980-4567890-4",
            "phone": "+971501234504",
            "email": "yousuf.alnahyani@demo.ae",
        },
        "profile": {
            "monthly_income": 48500,
            "existing_obligations": 3200.0,
            "arrears_amount": 12400,
            "delay_duration_months": 3,
            "has_expired_id": False,
            "suspected_fraud": False,
            "missing_documents": [],
            "original_loan_amount": 1200000,
            "remaining_loan_balance": 950000,
            "remaining_loan_period_months": 240,
            "number_of_unpaid_instalments": 3,
            "number_of_family_members": 6,
        },
    },
    {
        "label": "Approved TRANSFER_ARREARS: unemployed citizen, Rule 1 satisfied via zero premium",
        "citizen": {
            "name_ar": "فاطمة الكعبي",
            "name_en": "Fatima Al Kaabi",
            "emirates_id": "784-1992-5678901-5",
            "phone": "+971501234505",
            "email": "fatima.alkaabi@demo.ae",
        },
        "profile": {
            "monthly_income": 11200,
            "existing_obligations": 2100.0,
            "arrears_amount": 35800,
            "delay_duration_months": 7,
            "has_expired_id": False,
            "suspected_fraud": False,
            "missing_documents": [],
            "original_loan_amount": 400000,
            "remaining_loan_balance": 280000,
            "remaining_loan_period_months": 192,
            "number_of_unpaid_instalments": 7,
            "number_of_family_members": 2,
            "is_unemployed": True,
        },
    },
    {
        "label": "Escalated: Emirates ID expired, identity verification required",
        "citizen": {
            "name_ar": "وفاء السويدي",
            "name_en": "Wafa Al Suwaidi",
            "emirates_id": "784-1998-6789012-6",
            "phone": "+971501234506",
            "email": "wafa.alsuwaidi@demo.ae",
        },
        "profile": {
            "monthly_income": 15041,
            "existing_obligations": 2256.0,
            "arrears_amount": 26412,
            "delay_duration_months": 4,
            "has_expired_id": True,
            "suspected_fraud": False,
            "missing_documents": [],
            "original_loan_amount": 450000,
            "remaining_loan_balance": 310000,
            "remaining_loan_period_months": 168,
            "number_of_unpaid_instalments": 4,
            "number_of_family_members": 3,
        },
    },
    {
        "label": "Escalated: arrears exceed AED 500,000 senior officer threshold",
        "citizen": {
            "name_ar": "محمد التنيجي",
            "name_en": "Mohammed Al Teneiji",
            "emirates_id": "784-1983-7890123-7",
            "phone": "+971501234507",
            "email": "mohammed.alteneiji@demo.ae",
        },
        "profile": {
            "monthly_income": 38000,
            "existing_obligations": 6200.0,
            "arrears_amount": 520000,
            "delay_duration_months": 14,
            "has_expired_id": False,
            "suspected_fraud": False,
            "missing_documents": [],
            "original_loan_amount": 2000000,
            "remaining_loan_balance": 1640000,
            "remaining_loan_period_months": 360,
            "number_of_unpaid_instalments": 14,
            "number_of_family_members": 7,
        },
    },
    {
        "label": "Escalated: fraud signal, income and bank statement inconsistency",
        "citizen": {
            "name_ar": "عمر الرميثي",
            "name_en": "Omar Al Rumaithi",
            "emirates_id": "784-1987-8901234-8",
            "phone": "+971501234508",
            "email": "omar.alrumaithi@demo.ae",
        },
        "profile": {
            "monthly_income": 33125,
            "existing_obligations": 3312.0,
            "arrears_amount": 49519,
            "delay_duration_months": 7,
            "has_expired_id": False,
            "suspected_fraud": True,
            "missing_documents": [],
            "original_loan_amount": 900000,
            "remaining_loan_balance": 610000,
            "remaining_loan_period_months": 204,
            "number_of_unpaid_instalments": 7,
            "number_of_family_members": 4,
        },
    },
]


def _clear_database(db: object) -> None:
    """Delete all case data in dependency order."""
    db.query(AuditLog).delete()
    db.query(Override).delete()
    db.query(Decision).delete()
    db.query(Document).delete()
    db.query(Case).delete()
    db.query(Citizen).delete()
    db.commit()
    print("Database cleared.")


def _insert_case(db: object, entry: dict) -> tuple[Citizen, Case]:
    """Create a citizen and case row and return both."""
    c = entry["citizen"]
    citizen = Citizen(
        name_ar=c["name_ar"],
        name_en=c["name_en"],
        emirates_id=c["emirates_id"],
        phone=c["phone"],
        email=c["email"],
    )
    db.add(citizen)
    db.flush()

    case = Case(
        citizen_id=citizen.id,
        status="pending",
        arrears_amount=entry["profile"]["arrears_amount"],
    )
    db.add(case)
    db.flush()
    return citizen, case


def run_demo_setup() -> None:
    """Clear the database, insert 8 demo cases, run decisions, print summary."""
    db = SessionLocal()
    try:
        print("\n========================================")
        print("  Tayseer Demo Setup")
        print("========================================\n")

        _clear_database(db)
        print(f"Inserting {len(_DEMO_CASES)} demo cases...\n")

        results = []
        for entry in _DEMO_CASES:
            citizen, case = _insert_case(db, entry)
            db.commit()

            fp = entry["profile"]
            profile = CitizenFinancialProfile(
                monthly_income=fp["monthly_income"],
                existing_obligations=fp["existing_obligations"],
                arrears_amount=fp["arrears_amount"],
                delay_duration_months=fp["delay_duration_months"],
                has_expired_id=fp["has_expired_id"],
                suspected_fraud=fp["suspected_fraud"],
                missing_documents=fp["missing_documents"],
                original_loan_amount=fp.get("original_loan_amount"),
                remaining_loan_balance=fp.get("remaining_loan_balance"),
                remaining_loan_period_months=fp.get("remaining_loan_period_months"),
                number_of_unpaid_instalments=fp.get("number_of_unpaid_instalments"),
                number_of_family_members=fp.get("number_of_family_members", 1),
                is_unemployed=fp.get("is_unemployed", False),
            )

            decision = make_decision(case_id=str(case.id), profile=profile, db=db)
            flag = "ESCALATED" if decision.escalate_flag else "APPROVED "
            dti = (fp["existing_obligations"] / fp["monthly_income"]) * 100
            req_type = decision.request_type or "N/A"
            results.append(
                {
                    "label": entry["label"],
                    "name": citizen.name_en,
                    "case_id": str(case.id),
                    "flag": flag,
                    "dti": dti,
                    "request_type": req_type,
                    "rule1": decision.rule1_compliance,
                    "rule2": decision.rule2_compliance,
                    "approved_amount": decision.approved_amount,
                    "duration_months": decision.duration_months,
                    "confidence": decision.confidence_score,
                    "escalation_reason": decision.escalation_reason,
                }
            )
            r1 = "R1:OK" if decision.rule1_compliance else "R1:FAIL"
            r2 = "R2:OK" if decision.rule2_compliance else "R2:FAIL"
            print(
                f"  [{flag}] {citizen.name_en}\n"
                f"           DTI {dti:.1f}%  |  {req_type}  |  {r1}  {r2}\n"
                + (
                    f"           AED {decision.approved_amount:,.0f} over "
                    f"{decision.duration_months}mo  |  confidence {decision.confidence_score:.0%}"
                    if not decision.escalate_flag
                    else f"           {decision.escalation_reason}"
                )
                + "\n"
            )

        approved = sum(1 for r in results if r["flag"].strip() == "APPROVED")
        escalated = sum(1 for r in results if r["flag"].strip() == "ESCALATED")

        print("========================================")
        print(f"  Total cases : {len(results)}")
        print(f"  Approved    : {approved}")
        print(f"  Escalated   : {escalated}")
        print("========================================")
        print("\nDemo data is ready. The system is set for presentation.\n")

    finally:
        db.close()


if __name__ == "__main__":
    run_demo_setup()
