"""ChromaDB index builder and manager for Tayseer governance rules.

Reads data/rules.md, chunks it into individual rules, embeds them using BGE-M3,
and stores the embeddings in a ChromaDB collection named governance_rules.
Connects to ChromaDB via the CHROMADB_URL environment variable when available,
falling back to a local persistent client for development.

Each rule is embedded using a search-optimised text that combines the rule content
with targeted synonym keywords. The stored document is the clean rule text only.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from urllib.parse import urlparse

import chromadb

from backend.rag.embeddings import embed_batch

COLLECTION_NAME = "governance_rules"
RULES_FILE = Path(__file__).parent.parent.parent / "data" / "rules.md"
LOCAL_CHROMA_PATH = Path(__file__).parent.parent.parent / "chroma_data"

# Search-optimised synonym terms appended to each rule chunk before embedding.
# These are not stored in rules.md (which must keep its exact 6-field structure)
# but are injected at index time to improve semantic retrieval accuracy.
_SEARCH_TERMS: dict[str, str] = {
    "RULE-001": "very low DTI below 20 percent minimal debt small obligations fast approval priority track",
    "RULE-002": "low DTI 20 to 30 percent standard approval 25 percent obligations moderate",
    "RULE-003": "DTI 30 to 40 percent 35 percent extended 36 months moderate obligations",
    "RULE-004": "DTI 40 to 50 percent 45 percent debt to income ratio high burden extended 48 months senior review",
    "RULE-005": "borderline DTI 50 to 55 percent 52 percent conditional approval government employer",
    "RULE-006": "DTI exceeds 55 percent high ratio mandatory escalation 60 percent 65 percent",
    "RULE-007": "DTI above 70 percent extreme debt 75 percent senior management social welfare",
    "RULE-008": "small arrears 3000 AED minor arrears low DTI 12 percent fast track simplified",
    "RULE-009": "income below 8000 AED very low income 7000 6000 5000 AED social housing programme",
    "RULE-010": "income 8000 AED 9000 AED 8500 AED low income bracket fee waiver social worker",
    "RULE-011": "income 10000 to 15000 AED 12000 13000 AED lower middle income standard track",
    "RULE-012": "income 15000 to 25000 AED 18000 20000 22000 AED middle income flexible terms",
    "RULE-013": "income above 25000 AED 30000 35000 AED high income accelerated repayment 12 to 18 months",
    "RULE-014": "income above 40000 AED 50000 55000 AED highest earner maximum 12 months",
    "RULE-015": "delay under 3 months 1 month 2 months minor short-term cash flow temporary disruption",
    "RULE-016": "delay 3 to 6 months 4 months 5 months standard hardship supporting documents",
    "RULE-017": "delay 6 to 12 months 7 months 8 months 9 months 10 months 11 months late payment significant prolonged hardship",
    "RULE-018": "delay over 12 months 13 14 15 16 17 18 months severe chronic hardship social worker",
    "RULE-019": "delay over 24 months 25 26 30 months extreme critical structural problem escalation",
    "RULE-020": "obligations 20 to 30 percent 25 percent standard burden recurring commitments manageable",
    "RULE-021": "obligations 30 to 40 percent 35 percent elevated burden recurring monthly commitments",
    "RULE-022": "obligations 40 to 50 percent 45 percent high obligation burden monthly commitments senior review",
    "RULE-023": "obligations exceed 50 percent 52 53 percent unsustainable monthly commitments escalation",
    "RULE-024": "obligations exceed 60 percent 63 65 percent extreme overcommitment hard escalation counselling",
    "RULE-025": "Emirates ID expired identity document cannot be verified ID expiry date passed escalation required",
    "RULE-026": "salary certificate missing mandatory document income proof absent incomplete application",
    "RULE-027": "bank statement missing mandatory document absent three months statement required",
    "RULE-028": "arrears above 100000 AED high arrears 120000 150000 200000 AED senior management authorisation",
    "RULE-029": "fraud signal income inconsistency bank balance discrepancy 40 percent difference misrepresentation",
    "RULE-030": "two or more previously rejected applications 2 rejections multiple rejections repeated submission",
    "RULE-031": "salary certificate older than 3 months outdated 4 5 months old stale document",
    "RULE-032": "combined high DTI over 55 percent and delay over 12 months double escalation priority",
    "RULE-033": "Emirates ID format invalid wrong pattern 784 incorrect number format",
    "RULE-034": "widow widowed bereaved spouse deceased husband died wife died single parent dependent children sole provider after bereavement compassion",
    "RULE-035": "divorced single custodial parent children alimony custody divorce financial hardship",
    "RULE-036": "clean payment history 24 months two years excellent consistent on-time payments good financial record no defaults",
    "RULE-037": "multiple properties investment property two apartments rental income asset disclosure",
    "RULE-038": "disability certificate disabled citizen government registered disability compassion 72 months",
    "RULE-039": "recent job loss unemployed 3 months employment lost company liquidation",
    "RULE-040": "medical emergency surgery hospital extraordinary expenses uninsured medical costs documented",
}


def _get_client() -> chromadb.ClientAPI:
    """Return a ChromaDB client using CHROMADB_URL when available.

    Falls back to a local persistent client for development without Docker.
    """
    url = os.environ.get("CHROMADB_URL", "")
    if url.startswith("http"):
        parsed = urlparse(url)
        try:
            client = chromadb.HttpClient(
                host=parsed.hostname or "localhost",
                port=parsed.port or 8001,
            )
            client.heartbeat()
            return client
        except Exception:
            pass
    return chromadb.PersistentClient(path=str(LOCAL_CHROMA_PATH))


def _parse_rules(content: str) -> list[dict]:
    """Split rules.md content into individual rule dicts with id, category, and text.

    The stored text starts at 'Rule ID:' stripping the leading section number.
    """
    sections = re.split(r"^## RULE-", content, flags=re.MULTILINE)
    rules: list[dict] = []
    for section in sections:
        if not section.strip():
            continue
        lines = section.strip().splitlines()
        first_line = lines[0].strip()
        # Skip the preamble: valid rule sections start with digits (e.g. "001")
        if not first_line[:3].isdigit():
            continue
        rule_id_line = "RULE-" + first_line
        # Build clean text starting from the Rule ID line (skip leading "001" line)
        clean_lines = [ln for ln in lines[1:] if ln.strip()]
        clean_text = "\n".join(clean_lines).strip()
        category = ""
        for line in clean_lines:
            if line.startswith("Category:"):
                category = line.replace("Category:", "").strip()
                break
        rules.append(
            {
                "rule_id": rule_id_line,
                "category": category,
                "text": clean_text,
            }
        )
    return rules


def build_index() -> None:
    """Read rules.md, embed each rule, and store in the governance_rules ChromaDB collection.

    Each rule is embedded using a search-optimised version (rule text + synonym keywords)
    but only the clean rule text is stored as the retrievable document.

    Prints progress throughout. Safe to call multiple times; deletes and rebuilds the
    collection if it already exists to ensure embeddings are always fresh.
    """
    print("Building governance rules index...")
    content = RULES_FILE.read_text(encoding="utf-8")
    rules = _parse_rules(content)
    print(f"Found {len(rules)} rules in rules.md")

    client = _get_client()

    try:
        client.delete_collection(COLLECTION_NAME)
        print("Deleted existing collection to rebuild fresh.")
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    # Build search-optimised texts for embedding (not stored)
    search_texts = []
    for r in rules:
        extra = _SEARCH_TERMS.get(r["rule_id"], "")
        search_texts.append(r["text"] + ("\n\nSearch terms: " + extra if extra else ""))

    print(f"Embedding {len(search_texts)} rule chunks with BGE-M3...")
    vectors = embed_batch(search_texts)

    ids = [r["rule_id"] for r in rules]
    docs = [r["text"] for r in rules]
    metadatas = [{"rule_id": r["rule_id"], "category": r["category"]} for r in rules]

    collection.add(
        ids=ids,
        embeddings=vectors,
        documents=docs,
        metadatas=metadatas,
    )

    print(f"Indexing complete. {len(rules)} rules stored in '{COLLECTION_NAME}'.")


def is_index_built() -> bool:
    """Return True if the governance_rules collection exists and contains documents."""
    try:
        client = _get_client()
        collection = client.get_collection(COLLECTION_NAME)
        return collection.count() > 0
    except Exception:
        return False
