"""Proactive risk alert demo script for Tayseer.

Loads all active cases from the database, runs the full risk analysis engine,
and prints a formatted terminal report showing the risk breakdown by tier
and a detailed card for every HIGH risk citizen.

Run inside the container:
    python backend/demo_risk.py

Or from the project root:
    docker-compose exec fastapi python backend/demo_risk.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.database import SessionLocal
from backend.engine.risk import RiskLevel, analyse_all_citizens, get_risk_summary


def _bar(severity: float, width: int = 20) -> str:
    """Return a simple ASCII progress bar for a severity value 0 to 1."""
    filled = int(severity * width)
    return "#" * filled + "-" * (width - filled)


def run_demo_risk() -> None:
    """Run risk analysis on all active cases and print a formatted report."""
    db = SessionLocal()
    try:
        print("\n========================================")
        print("  Tayseer Risk Intelligence Report")
        print("========================================\n")

        summary = get_risk_summary(db)
        print(f"  Total analysed : {summary['total_analysed']}")
        print(f"  HIGH risk      : {summary['high_risk_count']}")
        print(f"  MEDIUM risk    : {summary['medium_risk_count']}")
        print(f"  LOW risk       : {summary['low_risk_count']}")
        print(f"  Last updated   : {summary['last_updated']}")
        print()

        profiles = analyse_all_citizens(db)
        high_risk = [p for p in profiles if p.risk_level == RiskLevel.HIGH]
        medium_risk = [p for p in profiles if p.risk_level == RiskLevel.MEDIUM]

        if high_risk:
            print(f"  HIGH RISK CITIZENS ({len(high_risk)})")
            print("  " + "=" * 58)
            for p in high_risk:
                print(f"\n  Name (EN)   : {p.citizen_name_en}")
                print(f"  Name (AR)   : {p.citizen_name_ar}")
                print(f"  Emirates ID : {p.emirates_id}")
                print(f"  Risk Score  : {p.risk_score:.0%}")
                if p.days_until_critical is not None:
                    print(f"  Days until critical: {p.days_until_critical}")
                if p.risk_factors:
                    print(f"  Risk Factors:")
                    for f in p.risk_factors:
                        print(f"    [{_bar(f.severity)}] {f.severity:.0%}  {f.factor_code}")
                        print(f"      EN: {f.description_en}")
                        print(f"      AR: {f.description_ar}")
                print(f"  Action (EN) : {p.recommended_action_en}")
                print(f"  Action (AR) : {p.recommended_action_ar}")
                print()
        else:
            print("  No HIGH risk citizens identified.\n")

        if medium_risk:
            print(f"  MEDIUM RISK CITIZENS ({len(medium_risk)})")
            print("  " + "=" * 58)
            for p in medium_risk:
                print(f"  {p.citizen_name_en}  |  {p.emirates_id}  |  score {p.risk_score:.0%}")

        print()
        print("========================================")
        print("  Risk analysis complete.")
        print("========================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    run_demo_risk()
