"""Governance rule retrieval for Tayseer citizen financial profile queries.

Builds a targeted natural language query from a citizen financial profile dict,
embeds it with BGE-M3, and queries ChromaDB for the top 5 most relevant rules.

The query builder prioritises the most discriminating signal in the profile so the
embedding matches the correct rule category rather than generic financial language.
"""

from __future__ import annotations

from backend.rag.embeddings import embed_text
from backend.rag.indexer import _get_client, COLLECTION_NAME

TOP_K = 5


def _build_query(profile: dict) -> str:
    """Build a targeted natural language query from a citizen financial profile.

    Priority order:
    1. Hard escalation flags (expired ID, missing docs, high arrears, fraud, rejections)
    2. Special circumstances (widowed, divorced, clean history, disability, medical)
    3. Financial signal routing (income tier, delay duration, obligation level, DTI)
    """
    income = float(profile.get("monthly_income", 0))
    obligations = float(profile.get("existing_obligations", 0))
    arrears = float(profile.get("arrears_amount", 0))
    delay = int(profile.get("delay_duration_months", 0))
    dti = (obligations / income * 100) if income > 0 else 0.0

    # --- Hard escalation flags first (most distinctive) ---

    if profile.get("has_expired_id") or profile.get("expired_emirates_id"):
        return (
            "Emirates ID expired. Identity document cannot be verified. "
            "Expired Emirates ID document. ID expiry date passed. "
            "Identity verification failure. Escalate expired ID."
        )

    rejected = int(profile.get("rejected_count", 0))
    if rejected >= 2:
        return (
            f"Citizen has {rejected} previously rejected rescheduling applications. "
            "Two or more rejected applications. Multiple rejections. "
            "Repeated submission history. Escalate multiple rejections."
        )

    if arrears > 100000:
        return (
            f"Total arrears {arrears:.0f} AED exceeds 100000 AED threshold. "
            "High arrears above 100000 AED senior management authorisation required. "
            "Large arrears mandatory escalation. 120000 150000 AED arrears."
        )

    missing: list[str] = profile.get("missing_documents", [])
    if missing:
        return (
            f"Missing mandatory documents: {', '.join(missing)}. "
            "Mandatory documents not submitted. Application incomplete. "
            "Required documents absent escalation."
        )

    if profile.get("fraud_signal") or profile.get("income_inconsistency"):
        return (
            "Fraud signal detected. Income and bank balance inconsistency exceeds 40 percent. "
            "Discrepancy between stated income and actual bank deposits. "
            "Potential misrepresentation. Compliance escalation."
        )

    # --- Special circumstances ---

    if (
        profile.get("widowed")
        or profile.get("is_widowed")
        or profile.get("marital_status") == "widowed"
    ):
        return (
            "Widowed citizen with dependent children. Widow. Widowed. "
            "Spouse has passed away. Husband died wife died. Single parent bereaved. "
            "Main breadwinner deceased. Sole provider for children after bereavement. "
            "Widow seeking financial relief. Orphaned children support."
        )

    if (
        profile.get("divorced")
        or profile.get("is_divorced")
        or profile.get("marital_status") == "divorced"
    ):
        return (
            "Divorced citizen. Single custodial parent with dependent children. "
            "Divorce-related financial hardship. Custody obligations alimony."
        )

    if (
        profile.get("clean_payment_history")
        or profile.get("clean_history")
        or profile.get("excellent_history")
    ):
        return (
            "Citizen with excellent clean payment history for over two years. "
            "Clean payment record 24 months. No previous defaults. "
            "Consistent on-time payments for 24 months or more. "
            "Good financial record prior to current arrears. Clean record benefit."
        )

    if profile.get("disability") or profile.get("has_disability"):
        return (
            "Citizen holds government-registered disability certificate. "
            "Permanent or long-term disability affecting earning capacity. "
            "Disability compassion track 72 months."
        )

    if profile.get("medical_emergency"):
        return (
            "Citizen incurred documented extraordinary medical emergency expenses. "
            "Surgery hospital uninsured medical costs caused arrears. "
            "Medical hardship exception."
        )

    if profile.get("job_loss") or profile.get("recently_unemployed"):
        return (
            "Citizen experienced recent job loss within last 3 months. "
            "Employment lost company liquidation. Unemployed seeking rescheduling."
        )

    # --- Financial signal routing ---

    # Very low income dominates over DTI / delay signals
    if income > 0 and income < 10000:
        return (
            f"Low income citizen earning {income:.0f} AED monthly. "
            f"Monthly income below 10000 AED. Low income bracket {income:.0f} AED. "
            f"Existing obligations {obligations:.0f} AED. "
            f"Arrears {arrears:.0f} AED. Payment delayed {delay} months."
        )

    # Long delay is more distinctive than DTI for moderate cases
    if delay > 6:
        return (
            f"Citizen late on payments for {delay} months. "
            f"Payment delay {delay} months. Prolonged payment delay. "
            f"Delayed for {delay} months significant hardship. "
            f"Monthly income {income:.0f} AED. Arrears {arrears:.0f} AED. "
            f"Obligations {dti:.1f} percent of income."
        )

    # Small arrears with low DTI
    if arrears > 0 and income > 0 and (arrears / income) < 0.5:
        if dti < 20:
            return (
                f"Small arrears {arrears:.0f} AED with low debt to income ratio {dti:.1f} percent. "
                f"Minor arrears amount. Very low DTI {dti:.1f} percent. "
                f"Monthly income {income:.0f} AED. Fast-track approval candidate."
            )

    # High obligation burden
    if dti >= 50:
        return (
            f"Monthly financial obligations {obligations:.0f} AED are {dti:.1f} percent of income. "
            f"Obligations exceed 50 percent of income. High recurring commitments {dti:.1f} percent. "
            f"Monthly income {income:.0f} AED. Arrears {arrears:.0f} AED. Delay {delay} months."
        )

    if dti >= 40:
        return (
            f"Monthly financial obligations {obligations:.0f} AED are {dti:.1f} percent of income. "
            f"Obligation burden {dti:.1f} percent. Debt to income ratio {dti:.1f} percent. "
            f"High monthly commitments 40 to 50 percent. "
            f"Monthly income {income:.0f} AED. Arrears {arrears:.0f} AED. Delay {delay} months."
        )

    if dti >= 30:
        return (
            f"Monthly obligations {obligations:.0f} AED are {dti:.1f} percent of income. "
            f"Elevated obligation burden 30 to 40 percent. Debt to income ratio {dti:.1f} percent. "
            f"Monthly income {income:.0f} AED. Arrears {arrears:.0f} AED. Delay {delay} months."
        )

    # Default: general profile
    return (
        f"Citizen with monthly income {income:.0f} AED. "
        f"Existing obligations {obligations:.0f} AED per month, {dti:.1f} percent of income. "
        f"Debt to income ratio {dti:.1f} percent. "
        f"Total arrears {arrears:.0f} AED. Payment delayed {delay} months."
    )


def retrieve_rules(citizen_profile: dict) -> list[str]:
    """Retrieve the top 5 most relevant governance rules for a citizen financial profile.

    Args:
        citizen_profile: A dict containing financial profile fields including
            monthly_income, existing_obligations, arrears_amount,
            delay_duration_months, and optional signal flags.

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
