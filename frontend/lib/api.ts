import type {
  AnalyticsSummary,
  CaseCreateRequest,
  CaseDetailResponse,
  CaseListItem,
  CaseResponse,
  CitizenFinancialProfile,
  CopilotResponse,
  DecisionOutput,
  DocumentResult,
  OverrideRequest,
  VerificationResponse,
} from './types';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {
      // ignore parse error
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function createCase(data: CaseCreateRequest): Promise<CaseResponse> {
  return apiFetch<CaseResponse>('/api/cases', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function extractDocument(file: File, caseId: string): Promise<DocumentResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('case_id', caseId);
  const res = await fetch(`${apiBase()}/api/documents/extract`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    let msg = `Extraction failed (HTTP ${res.status})`;
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {
      // ignore parse error
    }
    throw new Error(msg);
  }
  return res.json() as Promise<DocumentResult>;
}

export async function runDecision(
  caseId: string,
  profile: CitizenFinancialProfile,
): Promise<DecisionOutput> {
  return apiFetch<DecisionOutput>('/api/decision', {
    method: 'POST',
    body: JSON.stringify({ case_id: caseId, citizen_profile: profile }),
  });
}

export async function getCase(caseId: string): Promise<CaseDetailResponse> {
  return apiFetch<CaseDetailResponse>(`/api/cases/${caseId}`);
}

export async function listCases(status?: string): Promise<CaseListItem[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch<CaseListItem[]>(`/api/cases${qs}`);
}

export async function overrideCase(caseId: string, data: OverrideRequest): Promise<CaseDetailResponse> {
  return apiFetch<CaseDetailResponse>(`/api/cases/${caseId}/override`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function askCopilot(caseId: string, question: string): Promise<CopilotResponse> {
  return apiFetch<CopilotResponse>('/api/copilot', {
    method: 'POST',
    body: JSON.stringify({ case_id: caseId, question }),
  });
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>('/api/analytics/summary');
}

export async function verifyCase(caseUuid: string): Promise<VerificationResponse> {
  return apiFetch<VerificationResponse>(`/api/verify/${caseUuid}`);
}

export function letterUrl(caseId: string): string {
  return `${apiBase()}/api/cases/${caseId}/letter`;
}
