# تيسير · Tayseer

### AI-Powered Housing Arrears Rescheduling — UAE Ministry of Energy & Infrastructure

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tayseer--eight.vercel.app-gold?style=flat-square)](https://tayseer-eight.vercel.app)
[![API Health](https://img.shields.io/badge/API-Render%20Standard-green?style=flat-square)](https://tayseer-api-79m0.onrender.com/health)
[![Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20Next.js-blue?style=flat-square)]()
[![LLM](https://img.shields.io/badge/LLM-Together.ai%20Qwen%207B-purple?style=flat-square)]()

---

## What Tayseer Does

Tayseer automates the UAE MOEI housing loan arrears rescheduling process. What currently takes 5 working days is reduced to 12 seconds. Citizens submit through a bilingual Arabic and English portal, upload their documents, and receive an instant AI-generated decision with an official PDF letter and QR code verification. Staff review AI recommendations through a real-time dashboard with proactive risk intelligence across all active cases.

> **The minister of MOEI announced an AI Housing Service that enables automated assessment of applications and instant approvals. Tayseer is that service.**

---

## Three AI Agents

| Agent | Role | Key Capability |
|---|---|---|
| 📄 Document Intelligence Agent | OCR + LLM extraction | Reads salary certificates, bank statements, Emirates ID. Detects fraud signals automatically. |
| ⚖️ Governance Decision Agent | RAG + LLM + mathematical enforcement | Retrieves 40 governance rules from knowledge base, reasons with LLM, enforces Rule 1 and Rule 2 mathematically after every decision. |
| 🔎 Risk Monitoring Agent | Proactive 9-signal scoring | Runs continuously without being triggered. Scores all active citizens HIGH / MEDIUM / LOW with recommended staff actions. |

---

## The Governance Engine

Three official MOEI rules are enforced on every decision:

**Rule 1 — Deduction Cap**
The total monthly deduction after rescheduling must not exceed 20 percent of the citizen's monthly income. Enforced mathematically after every LLM call. If violated the system automatically switches from UPDATE_INSTALLMENT to TRANSFER_ARREARS.

**Rule 2 — Loan Period Cap**
The repayment duration cannot exceed the citizen's remaining loan period. Enforced by capping the duration server-side regardless of what the LLM returned.

**Rule 3 — No Duplicate Requests**
Only one active rescheduling request is permitted per citizen at a time. Enforced deterministically before the LLM is even called.

> **The LLM cannot approve an illegal plan. Rules are enforced by mathematics, not memory.**

---

## Two Decision Paths

| Path | When | Monthly Impact |
|---|---|---|
| UPDATE_INSTALLMENT | Citizen has income capacity below the 20% cap | Arrears spread into additional monthly payments |
| TRANSFER_ARREARS | Unemployed, temporary circumstance, or Rule 1 cap reached | Arrears moved to end of loan. Zero additional monthly charge. |

---

## Live URLs

| Platform | URL |
|---|---|
| Citizen Portal | https://tayseer-eight.vercel.app/citizen |
| Staff Dashboard | https://tayseer-eight.vercel.app/staff/cases |
| Analytics | https://tayseer-eight.vercel.app/staff/analytics |
| API Health | https://tayseer-api-79m0.onrender.com/health |
| API Docs | https://tayseer-api-79m0.onrender.com/docs |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, bilingual RTL Arabic and English |
| Backend | FastAPI, SQLAlchemy, PostgreSQL 15, Alembic migrations |
| AI / LLM | Together.ai Qwen 7B Instruct Turbo, Instructor structured output |
| Document AI | Tesseract 5 OCR, BGE-M3 embeddings, ChromaDB vector store |
| Knowledge Base | 40 MOEI governance rules indexed with HNSW cosine similarity |
| PDF | WeasyPrint, bilingual Arabic and English, QR code verification |
| Deployment | Vercel (frontend), Render Standard 2GB RAM (backend) |

---

## Key Features

- 🇦🇪 Fully bilingual Arabic and English with RTL support
- 🛡️ Mathematical governance enforcement that overrides LLM violations
- 📊 Proactive risk intelligence dashboard for staff
- 📄 Official bilingual PDF letter with QR code verification
- ♿ Full accessibility panel with dyslexic font, contrast modes, and screen reader support
- 🔐 UAE PASS simulation for citizen identity verification
- 📱 Responsive design for citizen portal and staff dashboard
- 🔄 Human in the loop escalation with proposed extension plan and Accept or Edit workflow

---

## Local Development

**Prerequisites:** Docker, Node 18, Python 3.11

```bash
# Clone the repository
git clone https://github.com/simeon-devs/Tayseer
cd Tayseer

# Start all services
docker-compose up -d

# Frontend
cd frontend && npm install && npm run dev

# Reset demo data (loads 8 curated cases)
curl -X POST http://localhost:8000/api/admin/demo-setup \
  -H "X-Admin-Key: tayseer-demo-2026"
```

**Environment variables required:**

```
TOGETHER_API_KEY=your_together_api_key
TOGETHER_MODEL=Qwen/Qwen2.5-7B-Instruct-Turbo
LLM_PROVIDER=together
FRONTEND_URL=http://localhost:3001
DATABASE_URL=postgresql://arrears_user:arrears_pass@localhost:5432/arrears_db
```

---

## Demo Data

The system ships with 8 curated demo cases covering every decision path:

| Citizen | Scenario | Expected Outcome |
|---|---|---|
| Mohammed Al Nuaimi | Standard rescheduling | UPDATE_INSTALLMENT approved |
| Ahmed Al Hammadi | Rule 1 auto-correction | TRANSFER_ARREARS after override |
| Ibrahim Al Marri | High arrears, good income | TRANSFER_ARREARS approved |
| Yousuf Al Nahyani | Clean profile | UPDATE_INSTALLMENT approved |
| Fatima Al Kaabi | Unemployed, text detection | TRANSFER_ARREARS from reason text |
| Wafa Al Suwaidi | Expired Emirates ID | Escalated for identity verification |
| Mohammed Al Teneiji | Arrears above 500,000 AED | Escalated for senior review |
| Omar Al Rumaithi | Income and bank mismatch | Escalated for fraud investigation |

---

## Team

| Role | Contribution |
|---|---|
| AI Engine & Backend | Decision pipeline, governance enforcement, risk engine, document extraction, RAG knowledge base, cloud deployment |
| Frontend & Design | Citizen portal, staff dashboard, gold UAE design system, bilingual RTL interface, accessibility panel |
| Integration & Data | UAE PASS simulation, demo data preparation, test cases, document generation |

---

## Hackathon Context

Built for the UAE Ministry of Energy and Infrastructure hackathon 2026. Challenge: automate the housing loan arrears rescheduling process currently handled manually by government officers. Solution: a sovereign AI system that enforces government governance rules mathematically, produces bilingual decisions in 12 seconds, and gives staff real-time risk intelligence across all active cases.

**Before Tayseer:** Manual review by officers. Inconsistent decisions. 5 working days per case. No transparency for citizens.

**After Tayseer:** AI governance enforcement. Consistent decisions. 12 seconds per case. Instant bilingual decision letter with QR verification.

---

*Tayseer — تيسير — means "to make easy" in Arabic.*
