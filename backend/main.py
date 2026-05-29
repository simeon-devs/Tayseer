"""Tayseer FastAPI application entry point."""

from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings
from backend.rag.indexer import build_index, is_index_built
from backend.routers.documents import router as documents_router
from backend.routers.rag import router as rag_router

_UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"


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

app.include_router(rag_router)
app.include_router(documents_router)


@app.on_event("startup")
async def on_startup() -> None:
    """Print startup message, create uploads directory, and ensure the RAG index is ready."""
    _UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Tayseer API is running | environment={settings.environment} | model={settings.ollama_model}")
    if is_index_built():
        print("Governance rules index already built. RAG pipeline ready.")
    else:
        print("Governance rules index not found. Building index now...")
        build_index()
        print("Governance rules index built successfully. RAG pipeline ready.")


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
