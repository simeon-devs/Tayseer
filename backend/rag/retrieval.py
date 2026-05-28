"""Governance rule retrieval for Tayseer citizen financial profile queries.

Builds a natural language query from a citizen financial profile dict, embeds it
with BGE-M3, and queries ChromaDB for the top 5 most relevant governance rules.
"""

from __future__ import annotations

from backend.rag.embeddings import embed_text
from backend.rag.indexer import _get_client, COLLECTION_NAME

TOP_K = 5


def _build_query(profile: dict) -> str:
    """Build a keyword-rich natural language query string from a citizen financial profile.

    Incorporates income, obligations, arrears, delay, and all special flags so the
    embedding matches the correct governance rule category.
    """
    parts: list[str] = []

    income = float(profile.get("monthly_income", 0))
    obligations = float(profile.get("existing_obligations", 0))
    arrears = float(profile.get("arrears_amount", 0))
    delay = int(profile.get("delay_duration_months", 0))

    if income > 0:
        dti = obligations / income * 100
        parts.append(
            f"Citizen with monthly income {income:.0f} AED. "
            f"Existing monthly financial obligations {obligations:.0f} AED "
            f"which is {dti:.1f} percent of income. "
            f"Debt to income ratio {dti:.1f} percent. "
            f"Total arrears {arrears:.0f} AED. "
            f"Payment delayed for {delay} months."
        )

    if arrears > 100000:
        parts.append(
            f"Arrears amount {arrears:.0f} AED exceeds 100000 AED threshold. "
            "Requires senior management review and authorisation."
        )

    if profile.get("has_expired_id") or profile.get("expired_emirates_id"):
        parts.append(
            "Emirates ID is expired. Identity document cannot be verified. "
            "Emirates ID expiry prevents approval."
        )

    missing: list[str] = profile.get("missing_documents", [])
    if missing:
        parts.append(
            f"Missing mandatory documents: {', '.join(missing)}. "
            "Application incomplete. Required documents not submitted."
        )

    if profile.get("widowed") or profile.get("is_widowed") or profile.get("marital_status") == "widowed":
        parts.append(
            "Citizen is widowed. Spouse has passed away. Single parent with dependent children. "
            "Widowed citizen bereaved household. Main breadwinner deceased. "
            "Sole provider for children after bereavement. Widow seeking financial relief."
        )

    if profile.get("divorced") or profile.get("is_divorced") or profile.get("marital_status") == "divorced":
        parts.append(
            "Citizen is divorced. Single custodial parent with dependent children. "
            "Divorce-related financial hardship. Alimony and custody obligations."
        )

    if (
        profile.get("clean_history")
        or profile.get("clean_payment_history")
        or profile.get("excellent_history")
    ):
        parts.append(
            "Citizen has an excellent clean payment history for over two years. "
            "No previous defaults. Consistent on-time payments for 24 months or more. "
            "Good financial track record prior to current arrears."
        )

    rejected = int(profile.get("rejected_count", 0))
    if rejected >= 2:
        parts.append(
            f"Citizen has {rejected} previously rejected rescheduling applications. "
            "Multiple rejected applications. Repeated submission history."
        )

    if profile.get("disability") or profile.get("has_disability"):
        parts.append(
            "Citizen holds a government-registered disability certificate. "
            "Permanent or long-term disability affecting earning capacity."
        )

    if profile.get("medical_emergency"):
        parts.append(
            "Citizen incurred documented extraordinary medical emergency expenses "
            "that directly caused the current arrears situation."
        )

    return " ".join(parts)


def retrieve_rules(citizen_profile: dict) -> list[str]:
    """Retrieve the top 5 most relevant governance rules for a citizen financial profile.

    Args:
        citizen_profile: A dict containing financial profile fields including
            monthly_income, existing_obligations, arrears_amount,
            delay_duration_months, and optional flags.

    Returns:
        A list of up to 5 rule text strings ordered by relevance.
    """
    query = _build_query(citizen_profile)
    query_vector = embed_text(query)

    client = _get_client()
    collection = client.get_collection(COLLECTION_NAME)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=TOP_K,
        include=["documents"],
    )

    documents: list[str] = results.get("documents", [[]])[0]
    return documents
