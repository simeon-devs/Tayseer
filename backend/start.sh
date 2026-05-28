#!/bin/bash
# Run database migrations then start the FastAPI server.
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting Uvicorn on ${BACKEND_HOST:-0.0.0.0}:${BACKEND_PORT:-8000}..."
uvicorn main:app --host "${BACKEND_HOST:-0.0.0.0}" --port "${BACKEND_PORT:-8000}" --reload
