"""RAG pipeline package for Tayseer governance rule retrieval.

Exports the public interface: build_index, is_index_built, retrieve_rules.
"""

from backend.rag.indexer import build_index, is_index_built
from backend.rag.retrieval import retrieve_rules

__all__ = ["build_index", "is_index_built", "retrieve_rules"]
