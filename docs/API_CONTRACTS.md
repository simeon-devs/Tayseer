# Tayseer API Contracts

This document defines every API endpoint, request schema, and response schema for the Tayseer system. All modules must use these contracts exactly. Do not invent field names, change field types, or add undocumented fields without updating this document first.

All endpoints are served by FastAPI on the MacBook backend at port 8000. The base URL in development is http://localhost:8000. On the Pi the base URL is http://macbook-lan-ip:8000 where the IP is set via the NEXT_PUBLIC_API_URL environment variable.

---

## Pydantic Models

These are the canonical Pydantic model definitions. Import them from backend/schemas/ in all application code.

### DocumentResult

```python
class DocumentResult(BaseModel):
    document_type: str
    extracted_fields: dict
    confidence: float
    missing_fields: list[str]
    case_id: str
```

### SalaryCertificate

```python
class SalaryCertificate(BaseModel):
    employer: str | None = None
    monthly_salary: float | None = None
    net_salary: float | None = None
    currency: str = "AED"
```

### BankStatement

```python
class BankStatement(BaseModel):
    bank_name: str | None = None
    average_balance: float | None = None
    total_credits_3m: float | None = None
```

### EmiratesID

```python
class EmiratesID(BaseModel):
    id_number: str | None = None
    name_ar: str | None = None
    name_en: str | None = None
    expiry_date: str | None = None
```

### DecisionOutput

This is the most critical schema in the system. Every field must be present in every LLM response. Instructor enforces this.

```python
class DecisionOutput(BaseModel):
    approved_amount: float | None = None
    duration_months: int | None = None
    monthly_instalment: float | None = None
    hardship_score: float | None = None
    escalate_flag: bool
    escalation_reason: str | None = None
    rationale_en: str
    rationale_ar: str
    rules_applied: list[str]
    confidence_score: float
```

### CaseCreateRequest

```python
class CaseCreateRequest(BaseModel):
    citizen_name_ar: str
    citizen_name_en: str
    emirates_id: str
    phone: str | None = None
    email: str | None = None
    monthly_income: float
    existing_obligations: float
    arrears_amount: float
    delay_duration_months: int
    reason_for_request: str
    documents_submitted: list[str]
```

### CaseResponse

```python
class CaseResponse(BaseModel):
    id: str
    citizen_id: str
    status: str
    created_at: str
    updated_at: str
    assigned_to: str | None = None
```

### CaseDetailResponse

```python
class CaseDetailResponse(BaseModel):
    case: CaseResponse
    citizen: CitizenResponse
    documents: list[DocumentResult]
    decision: DecisionOutput | None = None
```

### CitizenResponse

```python
class CitizenResponse(BaseModel):
    id: str
    name_ar: str
    name_en: str
    emirates_id: str
    phone: str | None = None
    email: str | None = None
```

### OverrideRequest

```python
class OverrideRequest(BaseModel):
    staff_id: str
    new_amount: float | None = None
    new_duration: int | None = None
    justification: str

    @validator("justification")
    def justification_min_length(cls, v):
        if len(v) < 20:
            raise ValueError("Justification must be at least 20 characters")
        return v
```

### DecisionRequest

```python
class DecisionRequest(BaseModel):
    case_id: str
    citizen_profile: dict
```

### CopilotRequest

```python
class CopilotRequest(BaseModel):
    case_id: str
    question: str
```

### CopilotResponse

```python
class CopilotResponse(BaseModel):
    answer_en: str
    answer_ar: str
    case_id: str
```

### AnalyticsSummary

```python
class AnalyticsSummary(BaseModel):
    total_cases: int
    auto_approved: int
    escalated: int
    overridden: int
    avg_resolution_seconds: float
    approval_rate: float
    escalation_rate: float
    override_rate: float
    before_avg_days: int
    after_avg_seconds: float
```

### VerificationResponse

```python
class VerificationResponse(BaseModel):
    case_reference: str
    citizen_name_en: str
    decision_summary: str
    decision_date: str
    verified: bool
    message_en: str
    message_ar: str
```

### ErrorResponse

```python
class ErrorResponse(BaseModel):
    message: str
    detail: str | None = None
    code: str | None = None
```

---

## Endpoints

### POST /api/documents/extract

Accepts a document image or PDF and a case ID. Runs OCR then LLM extraction.

Request: multipart/form-data
Fields: file (binary, required), case_id (string, required)

Response 200: DocumentResult
Response 422: ErrorResponse with validation details
Response 500: ErrorResponse with processing error

Notes: Stores the uploaded file to the local uploads directory. Writes a document record to the database. Returns extracted fields as a flat dict under the key for the detected document type.

### POST /api/cases

Creates a new case and citizen record.

Request body: CaseCreateRequest
Response 201: CaseResponse
Response 400: ErrorResponse if Emirates ID format is invalid
Response 422: ErrorResponse with validation details

Notes: Creates or finds the citizen record by Emirates ID. Creates the case with status pending. Writes to audit_log with action case_created.

### GET /api/cases

Returns all cases with optional status filter.

Query parameters: status (string, optional) - one of pending, processing, approved, escalated, overridden, closed

Response 200: list of CaseResponse objects ordered by created_at descending

### GET /api/cases/:id

Returns full case detail.

Path parameter: id (UUID string)

Response 200: CaseDetailResponse
Response 404: ErrorResponse if case not found

### PATCH /api/cases/:id/override

Staff override for an AI decision.

Path parameter: id (UUID string)
Request body: OverrideRequest

Response 200: CaseResponse with updated status overridden
Response 400: ErrorResponse if justification is under 20 characters
Response 404: ErrorResponse if case not found
Response 422: ErrorResponse with validation details

Notes: Creates a record in the overrides table. Updates case status to overridden. Writes to audit_log with action decision_overridden. The original decision record is preserved unchanged.

### POST /api/decision

Runs the full AI decision pipeline.

Request body: DecisionRequest

Response 200: DecisionOutput
Response 404: ErrorResponse if case not found
Response 500: ErrorResponse if LLM call fails after retry

Notes: Runs hard escalation checks first. If none fire, retrieves rules from ChromaDB, assembles prompt, calls LLM via Instructor, validates output. Writes decision to database. Updates case status. Writes to audit_log with action decision_created or case_escalated.

### GET /api/cases/:id/letter

Generates and returns the bilingual PDF decision letter.

Path parameter: id (UUID string)

Response 200: application/pdf with Content-Disposition attachment header
Response 404: ErrorResponse if case or decision not found
Response 500: ErrorResponse if PDF generation fails

Notes: Generates the letter using WeasyPrint with the HTML template at backend/templates/letter.html. Embeds a QR code linking to /verify/:case_uuid. Saves the generated PDF path to the case record.

### GET /api/verify/:case_uuid

Public verification endpoint. No authentication required.

Path parameter: case_uuid (UUID string)

Response 200: VerificationResponse
Response 404: ErrorResponse if case UUID not found

### POST /api/copilot

AI copilot for staff reviewers.

Request body: CopilotRequest

Response 200: CopilotResponse
Response 404: ErrorResponse if case not found
Response 500: ErrorResponse if LLM call fails

Notes: Loads full case context from database. Assembles a context prompt with the case details and the reviewer question. Calls the LLM without Instructor since the output is free-form text. Returns answers in both languages.

### GET /api/analytics/summary

Returns all dashboard metrics.

Response 200: AnalyticsSummary

Notes: before_avg_days is always returned as 5 matching the challenge brief. after_avg_seconds is calculated from the average time between case created_at and decision created_at across all decided cases.

### GET /health

System health check.

Response 200:
```json
{
    "status": "ok",
    "environment": "development",
    "timestamp": "2026-05-28T00:00:00Z",
    "ollama_model": "qwen2.5:14b"
}
```

---

## Standard Error Codes

Use these error code strings in the code field of ErrorResponse.

CASE_NOT_FOUND: the requested case ID does not exist
DECISION_NOT_FOUND: no decision exists for this case yet
INVALID_EMIRATES_ID: Emirates ID does not match the expected format
JUSTIFICATION_TOO_SHORT: override justification is under 20 characters
EXTRACTION_FAILED: OCR or LLM extraction could not parse the document
DECISION_FAILED: LLM decision call failed after retry
PDF_GENERATION_FAILED: WeasyPrint could not generate the letter
VALIDATION_ERROR: request body failed Pydantic validation

---

## CORS Configuration

For development CORS is open to all origins. The FastAPI app is configured with:

allow_origins equals ["*"]
allow_credentials equals True
allow_methods equals ["*"]
allow_headers equals ["*"]

This is intentional for the hackathon demo where the Pi frontend needs to call the MacBook backend across the local network.

---

## Authentication

For the hackathon demo there is no authentication on any endpoint. The system runs on a local network and all demo data is synthetic.

If authentication is added later the staff endpoints should require a Bearer token in the Authorization header. The citizen endpoints and the public verification endpoint should remain open.
