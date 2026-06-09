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
  request_type?: string;
  additional_months?: number;
  additional_premium?: number;
  rule1_compliance?: boolean;
  rule2_compliance?: boolean;
  case_summary?: string;
  income_per_family_member?: number;
  proposed_deduction_rate?: number;
  application_status?: string;
  final_recommendation?: string;
  outstanding_principal?: number;
  total_unpaid_instalments?: number;
  remaining_months?: number;
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

export interface CopilotResponse {
  answer_en: string;
  answer_ar: string;
  case_id: string;
}

export interface VerificationResponse {
  case_reference: string;
  citizen_name_en: string;
  decision_summary: string;
  decision_date: string;
  verified: boolean;
  message_en: string;
  message_ar: string;
}

export interface AnalyticsSummary {
  total_cases: number;
  auto_approved: number;
  escalated: number;
  overridden: number;
  avg_resolution_seconds: number;
  approval_rate: number;
  escalation_rate: number;
  override_rate: number;
  before_avg_days: number;
  after_avg_seconds: number;
}

export interface CitizenFinancialProfile {
  monthly_income: number;
  existing_obligations: number;
  arrears_amount: number;
  delay_duration_months: number;
  has_expired_id?: boolean;
  missing_documents?: string[];
  payment_history_clean?: boolean;
  payment_history?: string;
  previous_rejected_applications?: number;
  is_widowed_or_divorced?: boolean;
  has_disability?: boolean;
  number_of_properties?: number;
  salary_certificate_age_months?: number;
  suspected_fraud?: boolean;
  original_loan_amount?: number;
  remaining_loan_balance?: number;
  remaining_loan_period_months?: number;
  number_of_unpaid_instalments?: number;
  number_of_family_members?: number;
  is_unemployed?: boolean;
  has_temporary_circumstance?: boolean;
  temporary_circumstance_description?: string;
}
