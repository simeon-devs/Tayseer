export interface CaseCreateRequest {
  citizen_name_ar: string;
  citizen_name_en: string;
  emirates_id: string;
  phone?: string;
  email?: string;
  monthly_income: number;
  existing_obligations: number;
  arrears_amount: number;
  delay_duration_months: number;
  reason_for_request: string;
  documents_submitted: string[];
}

export interface CaseResponse {
  id: string;
  citizen_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  arrears_amount?: number;
}

export interface CitizenResponse {
  id: string;
  name_ar: string;
  name_en: string;
  emirates_id: string;
  phone?: string;
  email?: string;
}

export interface DocumentResult {
  document_type: string;
  extracted_fields: Record<string, unknown>;
  confidence: number;
  missing_fields: string[];
  case_id: string;
}

export interface DecisionOutput {
  approved_amount?: number;
  duration_months?: number;
  monthly_instalment?: number;
  hardship_score?: number;
  escalate_flag: boolean;
  escalation_reason?: string;
  rationale_en: string;
  rationale_ar: string;
  rules_applied: string[];
  confidence_score: number;
}

export interface CaseDetailResponse {
  case: CaseResponse;
  citizen: CitizenResponse;
  documents: DocumentResult[];
  decision?: DecisionOutput;
}

export interface CaseListItem {
  id: string;
  citizen_name_ar: string;
  citizen_name_en: string;
  emirates_id: string;
  status: string;
  arrears_amount?: number;
  created_at: string;
  decision_summary?: string;
}

export interface OverrideRequest {
  staff_id: string;
  new_amount?: number;
  new_duration?: number;
  justification: string;
}

export interface CitizenFinancialProfile {
  monthly_income: number;
  existing_obligations: number;
  arrears_amount: number;
  delay_duration_months: number;
  has_expired_id?: boolean;
  missing_documents?: string[];
  payment_history_clean?: boolean;
  previous_rejected_applications?: number;
  is_widowed_or_divorced?: boolean;
  has_disability?: boolean;
  number_of_properties?: number;
  salary_certificate_age_months?: number;
  suspected_fraud?: boolean;
}
