"""BGE-M3 embedding operations for the Tayseer RAG pipeline.

This module handles all BAAI/bge-m3 embedding operations. The model is loaded once
on first use and cached at module level so it is never reloaded on subsequent calls.
All embedding functions use the cached instance.
"""

from __future__ import annotations

from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-m3"

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    """Return the cached BGE-M3 model, loading it on first call."""
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_text(text: str) -> list[float]:
    """Return the BGE-M3 embedding vector for a single text string.

    Args:
        text: The input text to embed.

    Returns:
        A list of floats representing the embedding vector.
    """
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed a list of texts efficiently in one batch call.

    Args:
        texts: A list of input strings to embed.

    Returns:
        A list of embedding vectors, one per input string.
    """
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return vectors.tolist()
