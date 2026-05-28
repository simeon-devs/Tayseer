# Tayseer

Tayseer is a sovereign AI housing arrears rescheduling system built for a UAE government hackathon. It processes citizen debt rescheduling requests instantly using local AI inference, replacing a manual 5-working-day process. The system is fully bilingual in Arabic and English, runs entirely on-premises with no data leaving the local network, and provides instant AI decisions with downloadable bilingual PDF letters.

---

## Prerequisites

- Docker Desktop (latest)
- Python 3.11
- Node.js 18
- Ollama (installed and running at localhost:11434)

---

## Quickstart

```bash
# Clone the repository
git clone <repo-url>
cd arrears-agent

# Copy the environment file and fill in your values
cp .env.example .env

# Start all four backend services
docker-compose up

# The API will be available at:
# http://localhost:8000
# Interactive API docs at:
# http://localhost:8000/docs
```

To seed the database with 20 test citizens after the stack is running:

```bash
python backend/seed.py
```

---

## API Documentation

Interactive Swagger UI: http://localhost:8000/docs

Health check: http://localhost:8000/health

---

## Module Status

| Module | Description                          | Status      |
|--------|--------------------------------------|-------------|
| A1     | Infrastructure, database, and data   | Complete    |
| A2     | Governance rulebook and RAG pipeline | Not started |
| B1     | Document extraction                  | Not started |
| B2     | Decision engine                      | Not started |
| B3     | Case management API and AI copilot   | Not started |
| C1     | Citizen portal full flow             | Not started |
| C2     | Staff dashboard case management      | Not started |
| C3     | Staff dashboard copilot and analytics| Not started |
| D1     | PDF decision letter and QR verification | Not started |
| D2     | Deployment on MacBook and Pi         | Not started |
