"""Admin endpoints for Tayseer deployment operations.

Provides a demo setup trigger endpoint that runs the full data seeding
pipeline as a background task so the HTTP response is returned immediately
and the caller does not time out waiting for LLM decisions to complete.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException
from pydantic import BaseModel

from backend.demo_setup import run_demo_setup

logger = logging.getLogger(__name__)

_ADMIN_KEY = "tayseer-demo-2026"

router = APIRouter(tags=["admin"])


class DemoSetupResponse(BaseModel):
    """Response schema for the demo setup trigger endpoint."""

    status: str
    message: str


@router.post("/demo-setup", response_model=DemoSetupResponse)
async def trigger_demo_setup(
    background_tasks: BackgroundTasks,
    x_admin_key: str = Header(..., alias="X-Admin-Key"),
) -> DemoSetupResponse:
    """Trigger demo data setup as a background task.

    Clears the database, inserts 8 curated demo cases, and runs the full
    decision pipeline on each. Returns 200 immediately and runs the work
    in the background so the request does not time out.

    Requires the X-Admin-Key header. Returns 403 if the key is wrong.
    """
    if x_admin_key != _ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key.")
    background_tasks.add_task(run_demo_setup)
    logger.info("Demo setup triggered via admin endpoint.")
    return DemoSetupResponse(
        status="demo setup started",
        message="Cases will be ready in 2-3 minutes",
    )
