"""LLM provider abstraction for Tayseer.

Routes LLM calls to Ollama, Fireworks.ai, or Together.ai based on the
LLM_PROVIDER environment variable. All providers use Instructor for structured
Pydantic output enforcement. Switching providers requires only an environment
variable change and a container restart.

Supported values for LLM_PROVIDER:
  ollama      Local Ollama via OpenAI-compatible endpoint (default)
  fireworks   Fireworks.ai via OpenAI-compatible inference API
  together    Together.ai via OpenAI-compatible inference API
"""

from __future__ import annotations

import logging
from typing import Type, TypeVar

import instructor
from openai import OpenAI
from pydantic import BaseModel

from backend.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def _build_ollama_client() -> instructor.Instructor:
    """Return an Instructor-patched client pointing at the local Ollama endpoint."""
    return instructor.from_openai(
        OpenAI(base_url=f"{settings.ollama_url}/v1", api_key="ollama"),
        mode=instructor.Mode.JSON,
    )


def _build_fireworks_client() -> instructor.Instructor:
    """Return an Instructor-patched client pointing at the Fireworks.ai inference endpoint."""
    return instructor.from_openai(
        OpenAI(
            api_key=settings.fireworks_api_key,
            base_url="https://api.fireworks.ai/inference/v1",
        )
    )


def _build_together_client() -> instructor.Instructor:
    """Return an Instructor-patched client pointing at the Together.ai inference endpoint."""
    return instructor.from_openai(
        OpenAI(
            api_key=settings.together_api_key,
            base_url="https://api.together.xyz/v1",
        )
    )


def call_llm(
    system_prompt: str,
    user_prompt: str,
    response_model: Type[T],
    max_retries: int = 2,
    temperature: float = 0.1,
) -> T:
    """Call the configured LLM provider and return a structured Pydantic response.

    Routes to Ollama when LLM_PROVIDER=ollama (or any unrecognised value)
    and to Fireworks.ai when LLM_PROVIDER=fireworks. Both providers use
    Instructor to enforce Pydantic schema validation on the raw model output.

    Never catches exceptions; callers are responsible for error handling.
    """
    provider = settings.llm_provider.lower()

    if provider == "fireworks":
        client = _build_fireworks_client()
        model = settings.fireworks_model
        logger.debug("call_llm routing to Fireworks model %s", model)
    elif provider == "together":
        client = _build_together_client()
        model = settings.together_model
        logger.debug("call_llm routing to Together.ai model %s", model)
    else:
        client = _build_ollama_client()
        model = settings.ollama_model
        logger.debug("call_llm routing to Ollama model %s", model)

    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_model=response_model,
        max_retries=max_retries,
        temperature=temperature,
    )
