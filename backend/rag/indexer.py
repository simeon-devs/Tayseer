"""ChromaDB index builder and manager for Tayseer governance rules.

Reads data/rules.md, chunks it into individual rules, embeds them using BGE-M3,
and stores the embeddings in a ChromaDB collection named governance_rules.
Connects to ChromaDB via the CHROMADB_URL environment variable when available,
falling back to a local persistent client for development.
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
    """Split rules.md content into individual rule dicts with id, category, and text."""
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
        category = ""
        for line in lines:
            if line.startswith("Category:"):
                category = line.replace("Category:", "").strip()
                break
        rules.append(
            {
                "rule_id": rule_id_line,
                "category": category,
                "text": section.strip(),
            }
        )
    return rules


def build_index() -> None:
    """Read rules.md, embed each rule, and store in the governance_rules ChromaDB collection.

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

    texts = [r["text"] for r in rules]
    print(f"Embedding {len(texts)} rule chunks with BGE-M3...")
    vectors = embed_batch(texts)

    ids = [r["rule_id"] for r in rules]
    metadatas = [{"rule_id": r["rule_id"], "category": r["category"]} for r in rules]

    collection.add(
        ids=ids,
        embeddings=vectors,
        documents=texts,
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
