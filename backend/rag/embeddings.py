"""BGE-M3 embedding operations for the Tayseer RAG pipeline.

This module handles all BAAI/bge-m3 embedding operations. The model is loaded once
on first use and cached at module level so it is never reloaded on subsequent calls.
All embedding functions use the cached instance.

When DISABLE_LOCAL_EMBEDDINGS=true the model is never loaded and all functions
return empty results. This is used on cloud deployments where RAM is constrained
and Together.ai handles LLM reasoning without local embeddings.
"""

from __future__ import annotations

import os

MODEL_NAME = "BAAI/bge-m3"

# Typed as object so sentence_transformers is never imported at module level.
# The library (and its torch/transformers deps) only load inside _get_model()
# when actually needed, keeping the cloud container footprint minimal.
_model: object | None = None


def _embeddings_disabled() -> bool:
    """Return True when DISABLE_LOCAL_EMBEDDINGS is set to 'true'."""
    return os.environ.get("DISABLE_LOCAL_EMBEDDINGS", "").lower() == "true"


def _get_model() -> object:
    """Return the cached BGE-M3 model, loading it on first call.

    sentence_transformers (and torch) are imported here rather than at module
    level so that the ~1 GB library is never loaded in cloud deployments where
    DISABLE_LOCAL_EMBEDDINGS=true means this function is never reached.
    """
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer  # noqa: PLC0415
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_text(text: str) -> list[float]:
    """Return the BGE-M3 embedding vector for a single text string.

    Returns an empty list when DISABLE_LOCAL_EMBEDDINGS=true.

    Args:
        text: The input text to embed.

    Returns:
        A list of floats representing the embedding vector, or [] if disabled.
    """
    if _embeddings_disabled():
        return []
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed a list of texts efficiently in one batch call.

    Returns a list of empty lists when DISABLE_LOCAL_EMBEDDINGS=true.

    Args:
        texts: A list of input strings to embed.

    Returns:
        A list of embedding vectors, one per input string, or empty lists if disabled.
    """
    if _embeddings_disabled():
        return [[] for _ in texts]
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return vectors.tolist()
