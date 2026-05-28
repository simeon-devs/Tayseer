# Tayseer System Architecture

This document is the single source of truth for the system architecture. Every module must follow the patterns defined here. Never deviate from the data flow, API contracts, or component boundaries described below.

---

## System Overview

Tayseer is a two-device sovereign AI system. No data leaves the local network during the demo. No external APIs are called at any point during operation.

The MacBook Pro M4 is the backend server. It runs FastAPI, PostgreSQL, ChromaDB, Ollama, and all AI processing.

The Raspberry Pi 5 is the frontend server. It runs the Next.js application and serves both the citizen portal and the staff dashboard. It communicates with the MacBook backend over the local network.

A citizen at home accesses the same Next.js application from their own device over the internet. For the hackathon demo this is simulated on the local network.

---

## Component Diagram

```
Citizen device (browser)
        |
        | HTTP
        |
Raspberry Pi (Next.js frontend - port 3000)
        |
        | HTTP REST API calls to MacBook LAN IP
        |
MacBook Pro M4 (FastAPI backend - port 8000)
        |
        |--- PostgreSQL (port 5432) - all persistent data
        |--- ChromaDB (port 8001) - governance rule embeddings
        |--- Ollama (port 11434) - LLM inference
             |
             |--- Qwen2.5 14B Q4 (development)
             |--- Qwen2.5 72B (demo via RunPod H100)
```

---

## Request Lifecycle

A citizen submits a rescheduling request. The flow is as follows.

Step 1: The citizen fills the intake form on the Next.js frontend and uploads documents.

Step 2: The frontend calls POST /api/documents/extract for each uploaded document. The backend runs Tesseract OCR on the document image, extracts structured fields using the LLM via Instructor, and returns a DocumentResult JSON object.

Step 3: The frontend calls POST /api/cases to create a new case record in PostgreSQL. The case is created with status pending.

Step 4: The frontend calls POST /api/decision with the case ID and extracted document fields. The backend runs hard escalation checks first. If none fire it calls retrieve_rules to get the top 5 relevant governance rules from ChromaDB. It assembles the prompt and calls the LLM via Instructor to produce a DecisionOutput Pydantic object. The decision is written to the decisions table. An audit log entry is written. The case status is updated to approved or escalated.

Step 5: The frontend polls GET /api/cases/:id until the decision is ready. It displays the decision to the citizen. The citizen can download the PDF letter via GET /api/cases/:id/letter.

---

## Database Schema

All tables use UUID as primary key. All tables have created_at and updated_at timestamps except audit_log which has only created_at because it is append-only.

### citizens

Stores citizen profile information submitted with the request.

id: UUID primary key
name_ar: String not null - full name in Arabic
name_en: String not null - full name in English transliteration
emirates_id: String unique not null - formatted as 784-XXXX-XXXXXXX-X
phone: String nullable
email: String nullable
created_at: DateTime
updated_at: DateTime

### cases

One row per rescheduling request. Status tracks the case lifecycle.

id: UUID primary key
citizen_id: UUID foreign key to citizens
status: String not null - allowed values: pending, processing, approved, escalated, overridden, closed
created_at: DateTime
updated_at: DateTime
assigned_to: String nullable - staff ID for escalated cases

### documents

One row per uploaded document per case.

id: UUID primary key
case_id: UUID foreign key to cases
document_type: String not null - allowed values: salary_certificate, bank_statement, emirates_id, tenancy_contract, other
file_path: String not null - absolute path to stored file
extracted_fields: JSON nullable - structured fields extracted by OCR pipeline
extraction_confidence: Float nullable - confidence score from extraction
created_at: DateTime

### decisions

One row per case. One decision per case enforced by unique constraint on case_id.

id: UUID primary key
case_id: UUID foreign key to cases unique
approved_amount: Float nullable - null if escalated
duration_months: Integer nullable - null if escalated
monthly_instalment: Float nullable - null if escalated
hardship_score: Float nullable - 0 to 1 score
escalate_flag: Boolean default false
escalation_reason: String nullable - populated when escalate_flag is true
rationale_en: Text nullable - full decision explanation in English
rationale_ar: Text nullable - full decision explanation in Arabic
rules_applied: JSON nullable - list of rule IDs that influenced the decision
confidence_score: Float nullable - 0 to 1 LLM confidence
created_at: DateTime

### overrides

Records when staff override an AI decision. The original decision is preserved.

id: UUID primary key
case_id: UUID foreign key to cases
staff_id: String not null
original_decision_id: UUID foreign key to decisions nullable
new_amount: Float nullable
new_duration: Integer nullable
justification: Text not null - minimum 20 characters enforced at API level
created_at: DateTime

### audit_log

Append-only. Every write operation in the system produces one row here. Never update or delete rows from this table.

id: UUID primary key
case_id: UUID foreign key to cases nullable
action: String not null - describes what happened
performed_by: String not null default system
details: JSON nullable - additional context about the action
created_at: DateTime

---

## API Endpoints

All endpoints are prefixed with /api. All request and response bodies are JSON. All error responses have a message field.

### Document endpoints

POST /api/documents/extract
Accepts a multipart form with a file upload and case_id. Runs OCR and field extraction. Returns a DocumentResult object.

Request: multipart/form-data with file and case_id fields
Response: DocumentResult with document_type, extracted_fields dict, confidence float, missing_fields list

### Case endpoints

POST /api/cases
Creates a new case for a citizen. Creates the citizen record if it does not exist.

Request: CaseCreateRequest with citizen profile fields and documents_submitted list
Response: CaseResponse with the new case ID and status

GET /api/cases
Returns a list of cases. Supports optional status filter as a query parameter.

Response: list of CaseResponse objects

GET /api/cases/:id
Returns full case detail including decision and documents.

Response: CaseDetailResponse with case, citizen, documents, and decision

PATCH /api/cases/:id/override
Staff override endpoint. Requires justification of at least 20 characters.

Request: OverrideRequest with new_amount, new_duration, justification, staff_id
Response: updated CaseResponse

### Decision endpoint

POST /api/decision
Runs the full AI decision pipeline for a case.

Request: DecisionRequest with case_id and citizen financial profile
Response: DecisionOutput with all decision fields

### Case letter endpoint

GET /api/cases/:id/letter
Generates and returns the bilingual PDF decision letter.

Response: application/pdf file download

### Verification endpoint

GET /api/verify/:case_uuid
Public endpoint. No authentication required. Returns decision authenticity information for QR code scanning.

Response: VerificationResponse with case reference, decision summary, and verified status

### Copilot endpoint

POST /api/copilot
Staff AI copilot. Accepts a case ID and a natural language question. Returns an answer in Arabic and English.

Request: CopilotRequest with case_id and question string
Response: CopilotResponse with answer_en and answer_ar

### Analytics endpoint

GET /api/analytics/summary
Returns all dashboard metrics in a single call.

Response: AnalyticsSummary with total_cases, auto_approved, escalated, overridden, avg_resolution_seconds, approval_rate, escalation_rate, before_avg_days hardcoded as 5, after_avg_seconds calculated from database

### Health endpoint

GET /health
Returns system health status.

Response: status ok, environment name, timestamp

---

## AI Decision Pipeline

The decision pipeline runs in this exact order for every case.

Step 1: Hard escalation check. Run deterministic Python checks before calling the LLM. If any trigger fires, set escalate_flag to true, set escalation_reason, write to database, and return immediately without calling the LLM.

Hard escalation triggers are: Emirates ID is expired or could not be extracted, debt to income ratio is above 55 percent, salary certificate is older than 3 months, income and bank balance are inconsistent by more than 40 percent indicating potential fraud, mandatory documents are missing.

Step 2: Rule retrieval. Call retrieve_rules from the RAG module with the citizen financial profile as input. This queries ChromaDB using BGE-M3 embeddings and returns the 5 most relevant governance rules as strings.

Step 3: Prompt assembly. Combine the system prompt from backend/engine/prompts.py with the citizen financial data and the retrieved rules.

Step 4: LLM call via Instructor. Call Ollama with the assembled prompt using Instructor and DecisionOutput as the response model. Instructor enforces the Pydantic schema and retries once if validation fails.

Step 5: Database write. Write the validated DecisionOutput to the decisions table. Update the case status. Append to audit_log.

Step 6: Return. Return the DecisionOutput to the caller.

---

## RAG Pipeline

The RAG pipeline uses LlamaIndex with ChromaDB and BGE-M3 embeddings.

The governance rules are stored in data/rules.md as structured Markdown with one rule per section. Each rule section has a rule ID, category, condition, threshold, outcome, and example.

At startup the RAG module checks if ChromaDB is populated. If not it reads rules.md, chunks it into individual rules, embeds each chunk using BGE-M3 via sentence-transformers, and stores the embeddings in ChromaDB in a collection named governance_rules.

At inference time the retrieve_rules function accepts a citizen JSON dict, creates a query string from the financial profile, embeds the query using BGE-M3, queries ChromaDB for the top 5 most similar rule chunks, and returns them as a list of strings.

---

## Document Extraction Pipeline

The extraction pipeline processes uploaded document images in two steps.

Step 1: OCR. Tesseract 5 with lang=ara+eng reads the document image and returns raw text. This handles mixed Arabic and English documents including stamps and tables.

Step 2: LLM extraction. The raw OCR text is passed to the LLM with a document-type-specific extraction prompt. The prompt instructs the model to output only valid JSON matching the document schema. Instructor enforces the Pydantic schema.

Document schemas are:
SalaryCertificate with employer, monthly_salary, net_salary, currency
BankStatement with bank_name, average_balance, total_credits_3m
EmiratesID with id_number, name_ar, name_en, expiry_date

---

## Frontend Architecture

The Next.js frontend has two route groups.

The citizen routes are under /citizen. The intake form is at /citizen and the decision screen is at /citizen/decision/:case_id.

The staff routes are under /staff. The case queue is at /staff/cases. The case detail is at /staff/cases/:id. The analytics dashboard is at /staff/analytics.

The public verification page is at /verify/:case_uuid and requires no authentication.

All pages support Arabic and English via a language toggle. Arabic mode sets document direction to RTL using the dir attribute on the html element.

The NEXT_PUBLIC_API_URL environment variable controls where the frontend sends API calls. In development this points to localhost:8000. On the Pi this points to the MacBook LAN IP.

---

## Sovereignty Narrative

For the hackathon demo all inference runs on a local or isolated cloud instance. No real citizen data is used. All demo cases are synthetic.

For the judge question about why inference is on RunPod rather than UAE infrastructure the answer is: for this demonstration we are running inference on an isolated containerised cloud instance. No real citizen data is used and all demo cases are synthetic. The production deployment target is sovereign UAE-hosted infrastructure such as Azure UAE North or Core42 Compass. The architecture is fully sovereign-compatible because no external APIs or commercial AI services are used anywhere in the system. The model weights are open source and can be deployed on any UAE government server.

---

## Performance Targets

Decision time from submission to result should be under 10 seconds on the local Qwen2.5 14B model and under 3 seconds on the RunPod Qwen2.5 72B model.

OCR extraction per document should be under 2 seconds on Tesseract.

PDF generation should be under 3 seconds on WeasyPrint.

API response time for all non-AI endpoints should be under 200 milliseconds.
