# Tayseer - AI Housing Arrears Rescheduling Agent
# Claude Code Project Instructions

This file is read at the start of every Claude Code session. Follow every rule in this file without exception. Do not suggest alternatives to confirmed decisions. Do not add dependencies not listed in the stack. Do not use dashes in prose writing. Do not add emojis unless explicitly asked. When committing code always use the author name simeon-devs and email simw4380@gmail.com. Never use Claude as a co-author or commit author.

---

## Project Summary

Tayseer is a sovereign AI system built for a UAE government hackathon. It processes housing debt rescheduling requests from citizens. Today this process takes 5 working days manually. Tayseer makes it instant. Everything runs locally with no citizen data leaving the building. The system is fully bilingual in Arabic and English.

---

## Two Platforms One Backend

Platform 1 is the citizen portal. Citizens submit their rescheduling request, upload documents, and receive an instant AI decision with a downloadable PDF letter.

Platform 2 is the staff and admin dashboard. Government employees manage the case queue, review AI decisions, handle escalations, override decisions with logged justification, and view performance analytics.

Both platforms share one FastAPI backend running on the MacBook Pro M4. The Raspberry Pi 5 runs the Next.js frontend and is served over the local network pointing at the MacBook backend.

---

## Hardware

MacBook Pro M4 Pro 2024 with 24GB unified RAM runs the backend. This handles all AI inference, the PostgreSQL database, ChromaDB vector database, and the FastAPI API server.

Raspberry Pi 5 with 8GB RAM runs the Next.js frontend. It is on the same local network as the MacBook and points all API calls to the MacBook backend URL.

For the live demo the inference model switches from local Qwen2.5 14B to Qwen2.5 72B on a RunPod H100 instance via a single environment variable change. The production deployment narrative is Azure UAE North or Core42 Compass.

---

## Confirmed Technology Stack

Do not suggest alternatives to any item in this list. All decisions are locked based on benchmark evidence documented in docs/DECISIONS.md.

Backend framework is FastAPI with Python. Do not suggest Django, Flask, or any other framework.

Database is PostgreSQL 15. Do not suggest SQLite, MongoDB, or any other database.

ORM is SQLAlchemy with Alembic for migrations. Do not suggest Tortoise ORM or any other ORM.

Vector database is ChromaDB. Do not suggest FAISS, LanceDB, Pinecone, or Weaviate.

RAG orchestration is LlamaIndex. Do not suggest LangChain.

Embedding model is BAAI/bge-m3 loaded via sentence-transformers. Do not suggest other embedding models.

OCR engine is Tesseract 5 with ara and eng language packs via pytesseract. Do not suggest PaddleOCR, EasyOCR, or cloud OCR services.

LLM for development is Qwen2.5 14B Q4 via Ollama at localhost:11434. Do not suggest OpenAI, Anthropic API, Gemini, or any cloud LLM API.

LLM for demo is Qwen2.5 72B on RunPod H100 via Ollama. The switch is a single OLLAMA_URL environment variable change.

Structured output enforcement is Instructor with Pydantic models. Always use Instructor when calling the LLM for structured decisions.

PDF generation is WeasyPrint 68.1 with Geeza Pro font for Arabic and a fallback to Noto Naskh Arabic on Linux. RTL rendering is confirmed working.

Frontend framework is Next.js with React. Do not suggest Vue, Svelte, or plain HTML.

CSS framework is Tailwind CSS. Do not suggest Bootstrap or Material UI.

Containerisation is Docker Compose. All four backend services start with docker-compose up.

Arabic text rendering in PDF uses native HTML CSS direction rtl. Do not use arabic-reshaper or python-bidi in PDF templates.

QR code generation uses the qrcode Python library.

---

## Project Structure

All application code lives at arrears-agent/ from the project root. Never create files outside this folder unless explicitly asked.

```
arrears-agent/
    backend/
        main.py
        config.py
        database.py
        models/
        routers/
        schemas/
        engine/
        rag/
        extraction/
        templates/
    frontend/
        pages/
        components/
        public/
        styles/
    data/
        cases.json
        rules.md
    docs/
    docker-compose.yml
    .env
    .env.example
    requirements.txt
    CLAUDE.md
    PROGRESS.md
    README.md
```

---

## Coding Conventions

All Python code uses type hints on every function signature. No exceptions.

All FastAPI endpoints use Pydantic models for both request bodies and response bodies. Never return raw dicts from endpoints.

All database writes also write an append-only row to the audit_log table. This is non-negotiable.

All LLM calls go through Instructor to enforce structured Pydantic output. Never call Ollama directly without Instructor wrapping.

All file paths in environment variables use absolute paths. Never hardcode paths in application code.

Error handling is explicit. Every endpoint has a try except block and returns a structured error response with a message field.

All commit messages follow conventional commits format: feat, fix, docs, refactor, test, chore. Example: feat(B1): add salary certificate extraction endpoint.

Every new function has a docstring. Every new module has a module-level docstring.

Arabic text is always stored as Unicode in the database. Never store Arabic as escaped sequences.

All API responses include both Arabic and English fields where applicable. A rationale field is always paired with rationale_en and rationale_ar.

---

## What Claude Must Never Do

Never call any external API during the demo. This includes OpenAI, Anthropic, Google, HuggingFace inference endpoints, or any SaaS service.

Never store real personal data in any file. All demo data is synthetic.

Never use dashes in prose writing in any document or comment.

Never add Claude as a git commit author or co-author.

Never suggest fine-tuning the LLM. The architecture is RAG plus prompting only.

Never create a file larger than 500 lines. If a module grows beyond that split it into submodules.

Never use WidthType.PERCENTAGE in any docx generation. Always use WidthType.DXA.

Never use unicode bullet characters in docx files. Always use LevelFormat.BULLET with numbering config.

---

## Environment Variables

All environment variables are read from the .env file at the project root. Never hardcode any value that appears in .env. The critical variables are listed below.

DATABASE_URL connects to PostgreSQL.
CHROMADB_URL connects to ChromaDB.
OLLAMA_URL connects to Ollama. Change this to switch between local and RunPod.
OLLAMA_MODEL sets the model name. Default is qwen2.5:14b for development.
BACKEND_HOST must be 0.0.0.0 so the Pi can reach the MacBook on the LAN.
SECRET_KEY is used for any token signing.

---

## Module Status

Update this section after every session.

A1 Infrastructure database and data: complete
A2 Governance rulebook and RAG pipeline: complete
B1 Document extraction: complete
B2 Decision engine: complete
B3 Case management API and AI copilot: complete
C1 Citizen portal full flow: complete
C2 Staff dashboard case management: not started
C3 Staff dashboard copilot and analytics: not started
D1 PDF decision letter and QR verification: not started
D2 Deployment on MacBook and Pi: not started

---

## Session Rules

At the start of every new session read this file completely before writing any code.

When context reaches 60 percent capacity stop and ask the user to run /clear before continuing.

After completing any task update PROGRESS.md with what was done.

Commit after every completed subtask. Do not accumulate large uncommitted changes.

If a test fails fix it before moving to the next task. Never leave failing tests.

If unsure about any architectural decision check docs/ARCHITECTURE.md and docs/DECISIONS.md before asking the user.
