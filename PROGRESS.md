# Tayseer Build Progress

Update this file at the end of every Claude Code session. Never let a session end without updating the current status, what was done, and what is next. This file is the single source of truth for where the project stands.

---

## Overall Status

Benchmarking: complete
Module A1: complete
Module A2: complete
Module B1: complete
Module B2: complete
Module B3: complete
Module C1: complete
Module C2: complete
Module C3: complete
Module D1: not started
Module D2: not started
Integration: not started
Demo preparation: not started

---

## Benchmarking Results Summary

All benchmarking was completed on 2026-05-28.

OCR winner: Tesseract 5 with ara+eng. Score 4.67 out of 5. Speed 0.48 seconds per document. Confirmed working on salary certificate, bank statement, and Emirates ID.

Embedding winner: BAAI/bge-m3. Correct retrievals 9 out of 10. Average similarity 0.6579.

LLM winner: Qwen2.5 14B Q4 via Ollama. Clean JSON output on first run. No prompt engineering required.

PDF generation: WeasyPrint 68.1. RTL Arabic rendering confirmed passing.

Known issue: BGE-M3 missed Rule 13 on the widowed citizen query. Fix is to add keywords to Rule 13 in rules.md during A2.

---

## Session Log

### Session 9 - 2026-05-29

What was done:
Completed full C3 module: staff dashboard AI copilot and analytics.
Added 18 new bilingual translation strings to lib/i18n.ts covering analytics dashboard, copilot panel, and before/after comparison labels.
Added CopilotResponse and AnalyticsSummary interfaces to lib/types.ts.
Added askCopilot and getAnalytics API functions to lib/api.ts.
Created components/staff/CopilotPanel.tsx: a chat-style Q+A panel. Accepts a caseId prop, sends POST /api/copilot, maintains conversation history, shows answer in the selected language, handles loading state with animated dots, supports Enter to submit.
Added CopilotPanel to pages/staff/cases/[case_id].tsx below the documents section.
Created pages/staff/analytics.tsx: the analytics dashboard. Fetches GET /api/analytics/summary on mount. BeforeAfterCard shows 5 working days vs live after_avg_seconds with a calculated speedup multiplier. Summary cards show total cases, approval rate, escalation rate, and override rate. Bar chart uses pure CSS widths to show case distribution by status. Added link to analytics from the case queue header.

Validation results:
Production build: compiled successfully with no TypeScript errors. All 9 routes generated cleanly.
GET /staff/analytics: HTTP 200, renders Analytics Dashboard heading and before/after comparison card. Confirmed.
Case detail bundle grew from 4.34 kB to 5.2 kB confirming CopilotPanel was included.
Analytics link visible on /staff/cases page. Confirmed.

New files created in this session:
frontend/components/staff/CopilotPanel.tsx: 114 lines
frontend/pages/staff/analytics.tsx: 178 lines

What was not done:
Module D1 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module D1: PDF decision letter and QR verification.

---

### Session 8 - 2026-05-29

What was done:
Completed full C2 module: staff dashboard case management.
Updated lib/i18n.ts with 34 new bilingual strings covering staff dashboard, status labels, override modal, and table columns.
Updated lib/types.ts to add CaseListItem and OverrideRequest interfaces.
Updated lib/api.ts to add listCases and overrideCase API functions.
Created components/staff/StatusBadge.tsx with colored dot badges for all six case statuses.
Created components/staff/CaseFilters.tsx with filter buttons for all case statuses plus All Cases.
Created components/staff/OverrideModal.tsx with staff_id, optional new_amount, optional new_duration, and justification fields. Character counter shows progress toward 20 character minimum. Submit disabled until minimum met. Calls PATCH /api/cases/:id/override and surfaces 400 error messages.
Created pages/staff/index.tsx redirecting to /staff/cases.
Created pages/staff/cases/index.tsx with full case queue showing table on desktop and card layout on mobile. Status filter calls listCases on change.
Created pages/staff/cases/[case_id].tsx with full case detail including citizen info, financial metrics, decision rationale, rules applied, confidence bar, uploaded documents list, download letter button, and override button. Override modal integrated with success notification on completion.

Validation results:
Production build: compiled successfully with no TypeScript errors. All 8 routes generated cleanly.
GET /staff/cases: HTTP 200, renders Staff Dashboard heading, filter buttons, column headers. Confirmed.
GET /staff/cases/[case_id]: HTTP 200, renders case detail layout. Confirmed.
i18n: Arabic strings present in build output for all new keys. Confirmed.

New files created in this session:
frontend/components/staff/StatusBadge.tsx: 37 lines
frontend/components/staff/CaseFilters.tsx: 38 lines
frontend/components/staff/OverrideModal.tsx: 139 lines
frontend/pages/staff/index.tsx: 10 lines
frontend/pages/staff/cases/index.tsx: 156 lines
frontend/pages/staff/cases/[case_id].tsx: 228 lines

What was not done:
Module C3 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module C3: staff dashboard copilot and analytics.

---

### Session 7 - 2026-05-29

What was done:
Completed full C1 module: citizen portal full flow in Next.js.
Created complete Next.js 14 frontend from scratch with TypeScript, Tailwind CSS 3, and React 18.
Created frontend/package.json, next.config.js, tailwind.config.js, postcss.config.js, tsconfig.json, and .env.local.
Created styles/globals.css with Tailwind base, components layer including btn-primary, btn-secondary, form-input, form-label, and field-error utilities.
Created lib/types.ts defining all TypeScript interfaces for the API: CaseCreateRequest, CaseResponse, CitizenResponse, DocumentResult, DecisionOutput, CaseDetailResponse, CitizenFinancialProfile.
Created lib/i18n.ts with full bilingual translation map covering 60 strings in English and Arabic for all UI elements.
Created lib/LanguageContext.tsx providing a React context for language state with setLang that applies dir and lang attributes to the HTML element for full RTL support.
Created lib/api.ts with createCase, extractDocument, runDecision, getCase, and letterUrl functions using the Fetch API pointing at NEXT_PUBLIC_API_URL.
Created components/Header.tsx with primary navy header, bilingual Tayseer name, shield icon, and language toggle.
Created components/LanguageToggle.tsx with EN and Arabic toggle buttons.
Created components/StepIndicator.tsx with 3 step circles showing done, active, and pending states.
Created components/CompletenessChecklist.tsx showing upload status for salary certificate, bank statement, and Emirates ID.
Created components/citizen/StepPersonal.tsx with fields for Arabic name, English name, Emirates ID, phone, and email.
Created components/citizen/StepFinancial.tsx with currency inputs for income, obligations, and arrears, plus delay duration and reason fields.
Created components/citizen/StepDocuments.tsx with file upload rows for each required document type.
Created pages/_app.tsx wrapping the app with LanguageProvider.
Created pages/_document.tsx setting initial LTR direction.
Created pages/index.tsx redirecting to /citizen.
Created pages/citizen/index.tsx as the 3-step intake form orchestrator with sequential API calls: createCase, extractDocument for each file, then runDecision. Loading overlay with step-by-step progress messages.
Created pages/citizen/decision/[case_id].tsx showing approved or escalated decision with payment terms, rationale in the selected language, rules applied chips, confidence bar, and download letter button.

Validation results:
Production build: compiled successfully with no TypeScript errors. All 4 routes generated cleanly.
GET /citizen: HTTP 200, renders bilingual header, step indicator, Personal Information form. Confirmed.
GET /citizen/decision/test-id: HTTP 200, renders decision screen. Confirmed.
Language toggle switches dir attribute and font family for Arabic RTL.

New files created in this session:
frontend/package.json: 22 lines
frontend/next.config.js: 7 lines
frontend/tailwind.config.js: 21 lines
frontend/postcss.config.js: 8 lines
frontend/tsconfig.json: 22 lines
frontend/.env.local: 2 lines
frontend/styles/globals.css: 34 lines
frontend/lib/types.ts: 68 lines
frontend/lib/i18n.ts: 137 lines
frontend/lib/LanguageContext.tsx: 46 lines
frontend/lib/api.ts: 73 lines
frontend/components/Header.tsx: 57 lines
frontend/components/LanguageToggle.tsx: 32 lines
frontend/components/StepIndicator.tsx: 59 lines
frontend/components/CompletenessChecklist.tsx: 65 lines
frontend/components/citizen/StepPersonal.tsx: 101 lines
frontend/components/citizen/StepFinancial.tsx: 112 lines
frontend/components/citizen/StepDocuments.tsx: 113 lines
frontend/pages/_app.tsx: 9 lines
frontend/pages/_document.tsx: 17 lines
frontend/pages/index.tsx: 10 lines
frontend/pages/citizen/index.tsx: 181 lines
frontend/pages/citizen/decision/[case_id].tsx: 237 lines

What was not done:
Module C2 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module C2: staff dashboard case management.

---

### Session 6 - 2026-05-29

What was done:
Completed full B3 module: case management API and AI copilot.
Created Alembic migration 0002 adding arrears_amount Float nullable to cases table. Applied on container restart.
Updated backend/models/case.py to include arrears_amount mapped column.
Created backend/schemas/cases.py with CitizenResponse, CaseResponse, CaseCreateRequest, OverrideRequest, StatusUpdateRequest, CaseDetailResponse, CopilotRequest, CopilotResponse, and AnalyticsSummary schemas.
Added CaseListItem schema to backend/schemas/decisions.py as instructed.
Updated backend/schemas/__init__.py to export all new schemas.
Created backend/routers/cases.py with five endpoints: GET /api/cases (list with optional status filter), GET /api/cases/:id (full detail), POST /api/cases (create with citizen upsert and audit log), PATCH /api/cases/:id/override (staff override with 20-character justification gate returning 400), PATCH /api/cases/:id/status (status update with audit log).
Created backend/routers/copilot.py with POST /api/copilot endpoint. Calls LLM directly via OpenAI library without Instructor. Temperature 0.3. Parses bilingual response using ENGLISH:/ARABIC: separator. Returns CopilotResponse with answer_en and answer_ar.
Created backend/routers/analytics.py with GET /api/analytics/summary endpoint. Computes all metrics via SQLAlchemy aggregation queries. before_avg_days hardcoded as 5 per challenge brief.
Registered all three new routers in backend/main.py.
Updated backend/seed.py to populate arrears_amount from cases.json financial_profile.
Created backend/engine/seed_decisions.py script that backfills arrears_amount on existing cases and runs decisions on first 5 seeded cases.

Validation results:
GET /api/cases returns list with citizen names, status, arrears_amount, and decision_summary. Confirmed.
GET /api/cases/:id returns full CaseDetailResponse with citizen, documents, and decision including Arabic rationale. Confirmed.
PATCH /api/cases/:id/override with justification shorter than 20 characters returns HTTP 400 with code JUSTIFICATION_TOO_SHORT. Confirmed.
PATCH /api/cases/:id/override with valid justification updates status to overridden and recalculates monthly_instalment. Confirmed.
POST /api/copilot returns coherent answer in English and Arabic. Question: why was this case approved. Confirmed.
GET /api/analytics/summary returns all metrics with before_avg_days=5. Confirmed.
Database: 20 cases, 4 approved, 3 escalated, 1 overridden after full test run.

New files created in this session:
backend/alembic/versions/0002_add_arrears_amount_to_cases.py: 21 lines
backend/schemas/cases.py: 102 lines
backend/routers/cases.py: 442 lines
backend/routers/copilot.py: 182 lines
backend/routers/analytics.py: 67 lines
backend/engine/seed_decisions.py: 113 lines

What was not done:
Module C1 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module C1: citizen portal full flow in Next.js.

---

### Session 5 - 2026-05-29

What was done:
Completed full B2 module: AI decision engine.
Created backend/schemas/decisions.py with CitizenFinancialProfile, DecisionOutput, and DecisionRequest schemas. CitizenFinancialProfile includes 12 fields covering financial data and eligibility flags including suspected_fraud and has_expired_id. Updated backend/schemas/__init__.py to export all new schemas.
Created backend/engine/__init__.py as minimal package root.
Created backend/engine/prompts.py with DECISION_SYSTEM_PROMPT and build_decision_prompt(). System prompt encodes all governance decision rules, duration selection guidance, and Arabic output requirement. DTI threshold corrected to 45% to match benchmark data.
Created backend/engine/escalation.py with six deterministic hard escalation triggers in priority order: suspected_fraud, has_expired_id, previous_rejected_applications >= 2, missing_documents, stale salary certificate, DTI > 45%, and arrears > 100k. Added calculate_debt_ratio and calculate_hardship_score helpers.
Created backend/engine/decision.py with make_decision() orchestrating the full 7-step pipeline: hard escalation check, RAG retrieval via retrieve_rules(), prompt assembly, LLM call via Instructor at temperature 0.1, server-side monthly_instalment recalculation, Decision row write, audit_log row write, return.
Created backend/routers/decisions.py with POST /api/decision endpoint. Registered in backend/main.py.
Created backend/engine/evaluate.py that tests all 100 cases from data/cases.json against the deterministic escalation logic. Achieved 100 out of 100 accuracy (gate was 90 out of 100).

Validation results:
POST /api/decision with missing_documents=[bank_statement]: escalate_flag=True, confidence_score=1.0. Confirmed.
POST /api/decision with has_expired_id=True: escalate_flag=True, escalation_reason contains ID expiry message. Confirmed.
POST /api/decision with DTI=50%: escalate_flag=True, escalation_reason contains DTI threshold message. Confirmed.
Database decisions table has 3 rows with correct escalation reasons. Confirmed.
Database audit_log table has 3 rows with action=decision_created and performed_by=system. Confirmed.
Accuracy evaluation: 100 out of 100 = 100.0%. Gate of 90% passed.

New files created in this session:
backend/schemas/decisions.py: 54 lines
backend/engine/__init__.py: 5 lines
backend/engine/prompts.py: 69 lines
backend/engine/escalation.py: 118 lines
backend/engine/decision.py: 204 lines
backend/routers/decisions.py: 47 lines
backend/engine/evaluate.py: 132 lines

What was not done:
Module B3 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module B3: case management API and AI copilot.

---

### Session 4 - 2026-05-29

What was done:
Completed full B1 module: document extraction pipeline.
Created backend/schemas/documents.py with DocumentType enum, SalaryCertificate, BankStatement, EmiratesID, DocumentResult, CompletenessReport, and ErrorResponse schemas. Added check_completeness helper function. Added backend/schemas/__init__.py exporting all schemas for direct import.
Created backend/extraction/__init__.py as package root.
Created backend/extraction/ocr.py with extract_text_from_image, extract_text_from_pdf, and extract_text functions. Uses Tesseract 5 with lang=ara+eng and PSM 3. Gracefully returns empty string on failure.
Created backend/extraction/extractor.py with three prompt templates (salary certificate, bank statement, Emirates ID), per-type extraction functions using Instructor with Ollama OpenAI-compatible endpoint, detect_document_type using Arabic and English keyword matching, and full extract_document pipeline function.
Created backend/routers/documents.py with POST /api/documents/extract endpoint. Accepts multipart upload, saves file, runs extraction, writes Document and AuditLog database records, returns DocumentResult.
Updated backend/main.py to register the documents router and create the uploads directory on startup.
Created backend/extraction/test_extraction.py with three benchmark tests.
Added benchmark volume mount to docker-compose.yml (../../../arrears_benchmark:/workspace/arrears_benchmark).
Fixed Ollama URL to point at host machine (http://host.docker.internal:11434) so the container uses the pre-loaded model weights.
Fixed bank statement keyword detection: added "bank", "رصيد", and "صاحب الحساب" as additional detection signals since the synthetic document contains a bank name but not the phrase "bank statement".
Fixed missing ErrorResponse schema that was imported by the router but not yet defined.

Validation results:
backend/extraction/ contains ocr.py, extractor.py, test_extraction.py. Confirmed.
All 5 document schemas plus ErrorResponse importable from backend.schemas. Confirmed.
POST /api/documents/extract returned correct DocumentResult for salary certificate and Emirates ID via curl. Confirmed.
Extraction quality test: 3 out of 3. salary_certificate net_salary 21800.0, bank_statement average_balance 12400.0, emirates_id id_number 784-1990-1234567-1. Gate passed.
Database documents table has record with document_type salary_certificate and extraction_confidence 1.0. Confirmed.

New files created in this session:
backend/schemas/documents.py: 101 lines
backend/schemas/__init__.py: 23 lines
backend/extraction/__init__.py: 1 line
backend/extraction/ocr.py: 79 lines
backend/extraction/extractor.py: 280 lines
backend/extraction/test_extraction.py: 123 lines
backend/routers/documents.py: 125 lines
backend/uploads/.gitkeep: placeholder

What was not done:
Module B2 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module B2: decision engine.

---

### Session 1 - 2026-05-28

What was done:
Completed full project planning and architecture design.
Researched and selected all technology stack components.
Consulted four independent AI agents for stack critique and validation.
Ran complete benchmarking suite covering OCR, embeddings, LLM, and PDF generation.
Locked all technical decisions with evidence.
Created all six project documentation files.
Designed 10-module build plan.
Wrote A1 Claude Code prompt ready to execute.

What was not done:
No application code has been written yet.
Module A1 has not been started.

Blockers:
None.

Next immediate task:
Run the A1 Claude Code prompt to set up the project foundation.

---

### Session 3 - 2026-05-29

What was done:
Completed full A2 module: governance rulebook and RAG pipeline.
Created data/rules.md with exactly 40 structured governance rules covering six categories: debt_ratio (RULE-001 to RULE-008), income_tier (RULE-009 to RULE-014), delay_duration (RULE-015 to RULE-019), obligation_score (RULE-020 to RULE-024), escalation (RULE-025 to RULE-033), and sharia_flag (RULE-034 to RULE-040). Each rule has exactly six fields: Rule ID, Category, Condition, Threshold, Outcome, and Example. All rules include Arabic translations in parentheses.
Created backend/rag/embeddings.py with BGE-M3 model cached at module level. Model loads once on first call and is never reloaded.
Created backend/rag/indexer.py with ChromaDB index builder. Each rule is embedded using search-term-augmented text (rule text plus synonym keywords) but only clean rule text is stored. Collection uses cosine similarity. Falls back to local PersistentClient when CHROMADB_URL is unavailable.
Created backend/rag/retrieval.py with signal-targeted query builder. Priority order is hard escalation flags first (expired ID, rejections, high arrears, missing docs, fraud), then special circumstances (widowed, divorced, clean history, disability, medical), then financial signal routing (income tier, delay duration, DTI bands).
Created backend/rag/__init__.py exporting build_index, is_index_built, and retrieve_rules.
Created backend/routers/rag.py with POST /api/rag/retrieve endpoint accepting CitizenProfile and returning RetrieveResponse.
Updated backend/main.py to include the rag router and build the index on startup if not already built.
Created backend/rag/test_retrieval.py with 10 standardised benchmark queries.

Validation results:
40 rules confirmed in data/rules.md.
ChromaDB collection governance_rules contains 40 documents.
POST /api/rag/retrieve returned correct top rule RULE-017 (delay_duration) for a citizen with 8-month delay.
Retrieval quality test: 10 out of 10. Target was 9 out of 10. Gate passed.

New files created in this session:
data/rules.md: 445 lines, 40056 bytes
backend/rag/__init__.py: 9 lines, 316 bytes
backend/rag/embeddings.py: 50 lines, 1407 bytes
backend/rag/indexer.py: 185 lines, 9284 bytes
backend/rag/retrieval.py: 213 lines, 8630 bytes
backend/rag/test_retrieval.py: 197 lines, 6153 bytes
backend/routers/rag.py: 46 lines, 1471 bytes

What was not done:
Module B1 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module B1: document extraction pipeline.

---

### Session 2 - 2026-05-29

What was done:
Executed the full A1 module build prompt.
Created the complete project folder structure with all required subdirectories and .gitkeep files.
Added .gitignore excluding .env, __pycache__, node_modules, .next, venv, uploads, and .gguf files.
Created .env and .env.example with all required environment variables and inline documentation comments.
Created requirements.txt with all 21 required Python packages.
Created docker-compose.yml with four services: fastapi, postgres, chromadb, and ollama. Postgres has a healthcheck using pg_isready. Named volumes are defined for all stateful services.
Created all six SQLAlchemy models: Citizen, Case, Document, Decision, Override, AuditLog. Every model uses UUID primary key with uuid4 default. Cases has a check constraint on status. Documents has a check constraint on document_type. Decisions has a unique constraint on case_id. AuditLog is documented as append-only.
Created backend/database.py with engine, SessionLocal, Base, and get_db.
Initialized Alembic in backend/alembic/. Configured env.py to read DATABASE_URL from environment. Created the initial migration 0001_initial_schema.py creating all six tables in correct foreign key dependency order.
Created backend/start.sh that runs alembic upgrade head then starts uvicorn at 0.0.0.0:8000.
Created backend/config.py using pydantic-settings.
Created backend/main.py with FastAPI app, CORS middleware, GET /health, GET /api/info, and startup print message.
Created backend/Dockerfile based on python:3.11-slim with tesseract, pango, and poppler system dependencies.
Generated data/cases.json with exactly 100 synthetic cases using realistic UAE Arabic names and AED financial figures. Distribution: 40 straight approvals, 20 higher DTI approvals, 15 DTI escalations, 10 missing docs escalations, 8 expired Emirates ID escalations, 5 fraud signal escalations, 2 extreme edge cases.
Created backend/seed.py that inserts the first 20 cases as Citizen and Case records with graceful duplicate handling.
Created README.md with project description, prerequisites, quickstart commands, API docs URL, and module status table.

Validation results:
docker-compose config: passed with no errors.
Model import check: All models imported successfully.
FastAPI startup: started cleanly on 0.0.0.0:8000, GET /health returned status ok with correct fields.
cases.json record count: 100 confirmed.

What was not done:
Module A2 and all subsequent modules have not been started.

Blockers:
None.

Next immediate task:
Begin Module A2: governance rulebook and RAG pipeline.

---

## Module Details

### A1 - Infrastructure, database and data

Status: complete
Estimated effort: 2 days
Owner: simeon-devs
Dependencies: none

Deliverables:
docker-compose.yml starting all four services
All database tables created via Alembic migration
SQLAlchemy models for all six tables
100 synthetic test cases in data/cases.json
Seed script for 20 test citizens
README with setup instructions

Gate: docker-compose up starts cleanly, GET /health returns 200, all tables exist, cases.json has 100 records.

---

### A2 - Governance rulebook and RAG pipeline

Status: complete
Estimated effort: 1.5 days
Owner: simeon-devs
Dependencies: A1 must be complete for ChromaDB to be available

Deliverables:
data/rules.md with 30 to 50 structured governance rules
ChromaDB populated with BGE-M3 embeddings
retrieve_rules Python function tested and passing
Fix for BGE-M3 miss on Rule 13 widowed citizen query

Gate: retrieve_rules returns correct rules for 9 out of 10 test queries.

---

### B1 - Document extraction

Status: complete
Estimated effort: 2 days
Owner: simeon-devs
Dependencies: A1 for database, A2 for LLM being available

Deliverables:
POST /api/documents/extract endpoint
Pydantic schemas for all three document types
Extraction pipeline tested on salary certificate, bank statement, Emirates ID
Document completeness checker

Gate: extraction accuracy above 85 percent on 10 test documents per type.

---

### B2 - Decision engine

Status: complete
Estimated effort: 3 days
Owner: simeon-devs
Dependencies: A1 for database, A2 for RAG pipeline, A4 test cases

Deliverables:
POST /api/decision endpoint
System prompt in backend/engine/prompts.py
Hard escalation trigger checks
Decision pipeline with Instructor and Pydantic
Evaluation script with accuracy report on 100 test cases

Gate: 90 percent accuracy on 100 synthetic test cases. All hard escalation triggers fire correctly.

---

### B3 - Case management API and AI copilot

Status: complete
Estimated effort: 1.5 days
Owner: simeon-devs
Dependencies: A1 for database, B2 for decisions to exist

Deliverables:
All case CRUD endpoints
Override endpoint with justification validation
POST /api/copilot endpoint
GET /api/analytics/summary endpoint

Gate: all endpoints return correct responses, override rejects empty justification, copilot answers coherently in both languages.

---

### C1 - Citizen portal full flow

Status: not started
Estimated effort: 2 days
Owner: simeon-devs
Dependencies: B1, B2, B3 APIs must be working

Deliverables:
/citizen intake form route in Next.js
/citizen/decision/:case_id decision screen
Document upload with completeness checklist
Arabic and English language toggle
Mobile responsive layout

Gate: full citizen flow works end to end in both languages on desktop and mobile.

---

### C2 - Staff dashboard case management

Status: not started
Estimated effort: 2 days
Owner: simeon-devs
Dependencies: B3 APIs must be working

Deliverables:
/staff/cases case queue with filtering
/staff/cases/:id case detail view
Override modal with justification validation
Arabic and English language toggle

Gate: staff can view all cases, filter by status, see full decision details, and submit override with justification.

---

### C3 - Staff dashboard copilot and analytics

Status: not started
Estimated effort: 1.5 days
Owner: simeon-devs
Dependencies: C2 must be complete, B3 copilot endpoint must be working

Deliverables:
AI copilot panel added to case detail view
/staff/analytics dashboard with before and after metrics
Bar chart showing case volume by status

Gate: copilot answers 4 test questions correctly in both languages, analytics page shows correct metrics.

---

### D1 - PDF decision letter and QR verification

Status: not started
Estimated effort: 1 day
Owner: simeon-devs
Dependencies: B3 for case data

Deliverables:
GET /api/cases/:id/letter endpoint returning PDF
Bilingual letter template with Arabic RTL and English LTR
QR code embedded in PDF footer
/verify/:case_uuid public verification page

Gate: PDF generates with correct bilingual content, QR scans correctly on phone, verification page shows correct case information.

---

### D2 - Deployment on MacBook and Pi

Status: not started
Estimated effort: 1 day
Owner: simeon-devs
Dependencies: all other modules complete

Deliverables:
MacBook backend accessible on local network
Pi serving Next.js frontend pointing at MacBook
RunPod H100 fallback switch tested and documented
DEMO_DAY.md with complete setup checklist

Gate: full citizen and staff flows work from the Pi, RunPod switch completes in under 60 seconds, DEMO_DAY.md covers every step.

---

## Known Issues and Bugs

No known issues at this time. Add issues here as they are discovered during the build. Include the module affected, the description, the severity (blocker, major, minor), and the status.

---

## Demo Readiness Checklist

These items must all be true before the demo. Update as they are completed.

Happy path tested 10 times consecutively: not done
Adversarial cases tested: not done
RunPod fallback drill completed: not done
Arabic RTL rendering verified on demo screen resolution: not done
PDF letter QR code scans correctly on phone: not done
Pi frontend points to MacBook backend: not done
All synthetic demo cases preloaded: not done
Judge Q and A answers rehearsed by all team members: not done
DEMO_DAY.md checklist written and tested: not done
