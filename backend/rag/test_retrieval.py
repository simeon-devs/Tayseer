"""Retrieval quality test for the Tayseer governance rules RAG pipeline.

Runs the 10 standardised benchmark queries and scores each result against
the expected rule category. Target is 9 out of 10 or above.

Run from the project root: python backend/rag/test_retrieval.py
"""

import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.rag.indexer import build_index, is_index_built
from backend.rag.retrieval import retrieve_rules

# Each query has a description, a financial profile dict, and acceptable categories.
# A result is relevant when the top returned rule belongs to any of the acceptable categories.
TEST_QUERIES: list[dict] = [
    {
        "id": 1,
        "description": "Citizen with debt to income ratio of 45 percent",
        "profile": {
            "monthly_income": 20000,
            "existing_obligations": 9000,
            "arrears_amount": 50000,
            "delay_duration_months": 6,
        },
        "acceptable_categories": {"debt_ratio", "obligation_score"},
    },
    {
        "id": 2,
        "description": "Citizen late on payments for 8 months",
        "profile": {
            "monthly_income": 18000,
            "existing_obligations": 2700,
            "arrears_amount": 30000,
            "delay_duration_months": 8,
        },
        "acceptable_categories": {"delay_duration"},
    },
    {
        "id": 3,
        "description": "Citizen earning 8000 AED monthly",
        "profile": {
            "monthly_income": 8000,
            "existing_obligations": 1200,
            "arrears_amount": 12000,
            "delay_duration_months": 4,
        },
        "acceptable_categories": {"income_tier"},
    },
    {
        "id": 4,
        "description": "Citizen with expired Emirates ID",
        "profile": {
            "monthly_income": 15000,
            "existing_obligations": 2000,
            "arrears_amount": 20000,
            "delay_duration_months": 3,
            "has_expired_id": True,
        },
        "acceptable_categories": {"escalation"},
    },
    {
        "id": 5,
        "description": "Citizen with financial obligations of 45 percent of income",
        "profile": {
            "monthly_income": 20000,
            "existing_obligations": 9000,
            "arrears_amount": 20000,
            "delay_duration_months": 4,
        },
        "acceptable_categories": {"obligation_score", "debt_ratio"},
    },
    {
        "id": 6,
        "description": "Citizen with arrears of only 3000 AED",
        "profile": {
            "monthly_income": 25000,
            "existing_obligations": 2000,
            "arrears_amount": 3000,
            "delay_duration_months": 2,
        },
        "acceptable_categories": {"debt_ratio", "income_tier"},
    },
    {
        "id": 7,
        "description": "Citizen with excellent payment history over two years",
        "profile": {
            "monthly_income": 22000,
            "existing_obligations": 2500,
            "arrears_amount": 18000,
            "delay_duration_months": 3,
            "clean_payment_history": True,
        },
        "acceptable_categories": {"sharia_flag"},
    },
    {
        "id": 8,
        "description": "Citizen with arrears of 120000 AED",
        "profile": {
            "monthly_income": 20000,
            "existing_obligations": 3000,
            "arrears_amount": 120000,
            "delay_duration_months": 18,
        },
        "acceptable_categories": {"escalation"},
    },
    {
        "id": 9,
        "description": "Widowed citizen with dependent children",
        "profile": {
            "monthly_income": 12000,
            "existing_obligations": 1800,
            "arrears_amount": 20000,
            "delay_duration_months": 5,
            "widowed": True,
        },
        "acceptable_categories": {"sharia_flag"},
    },
    {
        "id": 10,
        "description": "Citizen with two previously rejected applications",
        "profile": {
            "monthly_income": 18000,
            "existing_obligations": 2500,
            "arrears_amount": 25000,
            "delay_duration_months": 7,
            "rejected_count": 2,
        },
        "acceptable_categories": {"escalation"},
    },
]


def _extract_rule_id(rule_text: str) -> str:
    """Extract the Rule ID field value from a rule text block."""
    for line in rule_text.splitlines():
        if line.startswith("Rule ID:"):
            return line.replace("Rule ID:", "").strip()
    return "UNKNOWN"


def _extract_category(rule_text: str) -> str:
    """Extract the Category field value from a rule text block."""
    for line in rule_text.splitlines():
        if line.startswith("Category:"):
            return line.replace("Category:", "").strip()
    return "unknown"


def run_tests() -> int:
    """Run all 10 test queries and return the number of relevant results."""
    if not is_index_built():
        print("Index not built. Building now...")
        build_index()

    correct = 0
    print("\n" + "=" * 70)
    print("TAYSEER RETRIEVAL QUALITY TEST")
    print("=" * 70)

    for query in TEST_QUERIES:
        rules = retrieve_rules(query["profile"])
        top_rule = rules[0] if rules else ""
        rule_id = _extract_rule_id(top_rule)
        category = _extract_category(top_rule)
        relevant = category in query["acceptable_categories"]

        if relevant:
            correct += 1
            verdict = "PASS"
        else:
            verdict = "FAIL"

        print(f"\nQuery {query['id']:2d}: {query['description']}")
        print(f"   Top rule : {rule_id}")
        print(f"   Category : {category}")
        print(f"   Accepted : {', '.join(sorted(query['acceptable_categories']))}")
        print(f"   Result   : {verdict}")

    print("\n" + "=" * 70)
    print(f"SCORE: {correct} / 10")
    if correct >= 9:
        print("STATUS: PASS (target 9/10 met)")
    else:
        print(f"STATUS: FAIL (below target 9/10, got {correct}/10)")
    print("=" * 70 + "\n")

    return correct


if __name__ == "__main__":
    score = run_tests()
    sys.exit(0 if score >= 9 else 1)
