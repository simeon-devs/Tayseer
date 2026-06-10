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

import json
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


def call_llm_json_mode(
    system_prompt: str,
    user_prompt: str,
    response_model: Type[T],
    temperature: float = 0.1,
) -> T:
    """Call the configured LLM and return a validated Pydantic response.

    For Together.ai, which does not support Instructor grammar enforcement,
    the system prompt is augmented with JSON-only instructions and the raw
    response is parsed with json.loads then validated by Pydantic.

    For all other providers this delegates to call_llm, which uses Instructor.
    Never catches exceptions; callers are responsible for error handling.
    """
    if settings.llm_provider.lower() != "together":
        return call_llm(system_prompt, user_prompt, response_model, temperature=temperature)

    json_system = (
        "You must respond with valid JSON only. No markdown, no explanation, no code blocks. "
        "Just the raw JSON object matching this schema exactly.\n\n" + system_prompt
    )
    client = OpenAI(
        api_key=settings.together_api_key,
        base_url="https://api.together.xyz/v1",
    )
    logger.debug("call_llm_json_mode routing to Together.ai model %s", settings.together_model)
    response = client.chat.completions.create(
        model=settings.together_model,
        messages=[
            {"role": "system", "content": json_system},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
    )
    raw = (response.choices[0].message.content or "").strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    return response_model.model_validate(json.loads(raw))


def call_llm_raw(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.1,
) -> str:
    """Call the configured LLM provider and return the raw text response.

    Uses the same provider routing as call_llm but does not use Instructor
    or Pydantic validation. Use for free-form text generation where a
    structured schema is not needed (e.g. the copilot endpoint).

    Never catches exceptions; callers are responsible for error handling.
    """
    provider = settings.llm_provider.lower()

    if provider == "fireworks":
        client = OpenAI(
            api_key=settings.fireworks_api_key,
            base_url="https://api.fireworks.ai/inference/v1",
        )
        model = settings.fireworks_model
        logger.debug("call_llm_raw routing to Fireworks model %s", model)
    elif provider == "together":
        client = OpenAI(
            api_key=settings.together_api_key,
            base_url="https://api.together.xyz/v1",
        )
        model = settings.together_model
        logger.debug("call_llm_raw routing to Together.ai model %s", model)
    else:
        client = OpenAI(base_url=f"{settings.ollama_url}/v1", api_key="ollama")
        model = settings.ollama_model
        logger.debug("call_llm_raw routing to Ollama model %s", model)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
    )
    return response.choices[0].message.content or ""
