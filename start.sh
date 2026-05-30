#!/usr/bin/env bash
# Tayseer full stack startup script.
# Run this from the project root: ./start.sh
# Starts backend services, waits for health, then starts the production frontend.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"
FRONTEND_PORT="${PORT:-3001}"
MACBOOK_IP="${MACBOOK_IP:-10.42.200.53}"
BACKEND_URL="http://localhost:8000"

print_banner() {
  echo ""
  echo "========================================"
  echo "  Tayseer  |  UAE Housing Arrears Agent"
  echo "========================================"
  echo ""
}

wait_for_health() {
  local url="$1"
  local label="$2"
  local retries=30
  echo "Waiting for ${label}..."
  until curl -sf "${url}" > /dev/null 2>&1; do
    retries=$((retries - 1))
    if [[ $retries -eq 0 ]]; then
      echo "ERROR: ${label} did not respond after 30 attempts. Check docker-compose logs."
      exit 1
    fi
    sleep 2
  done
  echo "${label} is ready."
}

print_banner

echo "Step 1 of 5  Starting backend services via Docker Compose..."
cd "${SCRIPT_DIR}"
docker-compose up -d
echo "Docker Compose started."

echo ""
echo "Step 2 of 5  Waiting for FastAPI backend health..."
wait_for_health "${BACKEND_URL}/health" "FastAPI backend"

echo ""
echo "Step 3 of 5  Checking Ollama availability..."
OLLAMA_URL_LOCAL="${OLLAMA_URL:-http://localhost:11434}"
if curl -sf "${OLLAMA_URL_LOCAL}/api/tags" > /dev/null 2>&1; then
  echo "Ollama is reachable at ${OLLAMA_URL_LOCAL}."
else
  echo "WARNING: Ollama did not respond at ${OLLAMA_URL_LOCAL}."
  echo "If using local inference ensure Ollama is running: ollama serve"
  echo "If using RunPod ensure the instance is started and OLLAMA_URL is set in .env"
fi

echo ""
echo "Step 4 of 5  Preparing production frontend..."
cd "${FRONTEND_DIR}"

if [[ ! -d ".next/standalone" ]]; then
  echo "No production build found. Running npm run build..."
  npm run build
  cp -r public .next/standalone/
  cp -r .next/static .next/standalone/.next/static
  echo "Frontend build complete."
else
  echo "Production build already present."
fi

echo ""
echo "Step 5 of 5  Starting production frontend on port ${FRONTEND_PORT}..."
PORT="${FRONTEND_PORT}" npm start &
FRONTEND_PID=$!
sleep 3

if kill -0 "${FRONTEND_PID}" 2>/dev/null; then
  echo "Frontend started (PID ${FRONTEND_PID})."
else
  echo "ERROR: Frontend failed to start. Check console output above."
  exit 1
fi

echo ""
echo "========================================"
echo "  System is ready"
echo "========================================"
echo ""
echo "  Citizen portal     http://localhost:${FRONTEND_PORT}/citizen"
echo "  Staff dashboard    http://localhost:${FRONTEND_PORT}/staff"
echo "  Backend API docs   http://localhost:8000/docs"
echo "  Backend health     http://localhost:8000/health"
echo ""
echo "  On LAN (from Pi or any device on same network):"
echo "  Citizen portal     http://${MACBOOK_IP}:${FRONTEND_PORT}/citizen"
echo "  Staff dashboard    http://${MACBOOK_IP}:${FRONTEND_PORT}/staff"
echo "  Backend API        http://${MACBOOK_IP}:8000"
echo ""
echo "  RunPod reminder:"
echo "  To switch inference to RunPod H100 set OLLAMA_URL in .env to"
echo "  the RunPod Ollama endpoint and run: docker-compose restart fastapi"
echo "  Allow 3 to 5 minutes for the 72B model to warm up on first request."
echo ""
echo "Press Ctrl+C to stop the frontend. Backend services run in the background."
echo "To stop all backend services: docker-compose down"
echo ""

wait "${FRONTEND_PID}"
