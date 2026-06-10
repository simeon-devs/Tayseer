"""Tayseer FastAPI application entry point."""

from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings
from backend.routers.admin import router as admin_router
from backend.routers.cases import router as cases_router
from backend.routers.analytics import router as analytics_router
from backend.routers.copilot import router as copilot_router
from backend.routers.decisions import router as decisions_router
from backend.routers.documents import router as documents_router
from backend.routers.letters import router as letters_router
from backend.routers.verification import router as verification_router
from backend.routers.rag import router as rag_router
from backend.routers.risk import router as risk_router

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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://tayseer-eight.vercel.app",
        "https://tayseer.vercel.app",
    ],
    allow_origin_regex=r"https://tayseer-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router, prefix="/api/admin")
app.include_router(rag_router)
app.include_router(risk_router)
app.include_router(documents_router)
app.include_router(decisions_router)
app.include_router(cases_router)
app.include_router(copilot_router)
app.include_router(analytics_router)
app.include_router(letters_router)
app.include_router(verification_router)


@app.on_event("startup")
async def on_startup() -> None:
    """Print startup message and create uploads directory.

    The BGE-M3 embedding model and RAG index are not loaded here.
    Both are initialised lazily on the first request that needs them.
    """
    _UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Tayseer API is running | environment={settings.environment} | model={settings.ollama_model}")
    print("BGE-M3 and RAG index will load on first request.")


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
