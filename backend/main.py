"""Tayseer FastAPI application entry point."""

from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings


class HealthResponse(BaseModel):
    """Response schema for the health endpoint."""

    status: str
    environment: str
    timestamp: str
    ollama_model: str


class InfoResponse(BaseModel):
    """Response schema for the API info endpoint."""

    project: str
    version: str


app = FastAPI(title="Tayseer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    """Print startup message showing API status and configured model."""
    print(f"Tayseer API is running | environment={settings.environment} | model={settings.ollama_model}")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Return system health status, environment name, current timestamp, and model name."""
    return HealthResponse(
        status="ok",
        environment=settings.environment,
        timestamp=datetime.now(timezone.utc).isoformat(),
        ollama_model=settings.ollama_model,
    )


@app.get("/api/info", response_model=InfoResponse)
async def api_info() -> InfoResponse:
    """Return project name and version."""
    return InfoResponse(project="Tayseer", version="1.0.0")
