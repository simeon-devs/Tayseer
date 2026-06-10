import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../components/Header';
import StatusBadge from '../../../components/staff/StatusBadge';
import OverrideModal from '../../../components/staff/OverrideModal';
import CopilotPanel from '../../../components/staff/CopilotPanel';
import { useLang } from '../../../lib/LanguageContext';
import { getCase, letterUrl } from '../../../lib/api';
import type { CaseDetailResponse } from '../../../lib/types';

export default function StaffCaseDetail() {
  const { t, lang } = useLang();
  const router = useRouter();
  const { case_id } = router.query;
  const [detail, setDetail] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  useEffect(() => {
    if (!case_id || typeof case_id !== 'string') return;
    setLoading(true);
    getCase(case_id)
      .then(setDetail)
      .catch(() => setError(t('loadingFailed')))
      .finally(() => setLoading(false));
  }, [case_id, t]);

  function handleOverrideSuccess(updated: CaseDetailResponse) {
    setDetail(updated);
    setShowOverride(false);
    setOverrideSuccess(true);
  }

  const decision = detail?.decision;
  const canOverride = detail && ['approved', 'escalated'].includes(detail.case.status);

  return (
    <>
      <Head>
        <title>{`${t('appName')} - ${t('staffDashboard')}`}</title>
      </Head>
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/staff/cases" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline mb-6">
            <ArrowLeft /> {t('backToCases')}
          </Link>

          {loading && <LoadingSkeleton />}
          {error && <ErrorCard message={error} />}

          {!loading && !error && detail && (
            <div className="space-y-5">
              {decision && (
                <div className={`rounded-2xl p-5 border flex items-start gap-4 ${
                  decision.final_recommendation === 'Approve' 
                    ? 'bg-emerald-50 border-emerald-200/60 text-emerald-950' 
                    : decision.final_recommendation === 'Request_documents'
                    ? 'bg-blue-50 border-blue-200/60 text-blue-950'
                    : 'bg-amber-50 border-amber-200/60 text-amber-950'
                }`}>
                  <div className={`p-2.5 rounded-xl ${
                    decision.final_recommendation === 'Approve' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : decision.final_recommendation === 'Request_documents'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {decision.final_recommendation === 'Approve' ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : decision.final_recommendation === 'Request_documents' ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm uppercase tracking-wide">
                        {t('finalRecommendation')}:
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        decision.final_recommendation === 'Approve'
                          ? 'bg-emerald-200 text-emerald-800'
                          : decision.final_recommendation === 'Request_documents'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-amber-200 text-amber-800'
                      }`}>
                        {t(decision.final_recommendation ?? '')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold mt-1 opacity-90 leading-relaxed">
                      {decision.case_summary || (lang === 'ar' ? decision.rationale_ar : decision.rationale_en)}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={detail.case.status} />
                      {decision && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          decision.application_status === 'Complete'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                            : 'bg-rose-50 text-rose-700 border-rose-200/50'
                        }`}>
                          {t('applicationStatus')}: {t(decision.application_status ?? '')}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-mono">
                        {(case_id as string).split('-')[0].toUpperCase()}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {lang === 'ar' ? detail.citizen.name_ar : detail.citizen.name_en}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">{detail.citizen.emirates_id}</p>
                    {detail.citizen.phone && (
                      <p className="text-sm text-gray-500">{detail.citizen.phone}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {decision && !decision.escalate_flag && (
                      <a
                        href={letterUrl(case_id as string)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm py-2"
                      >
                        {t('downloadLetter')}
                      </a>
                    )}
                    {canOverride && (
                      <button onClick={() => setShowOverride(true)} className="btn-primary text-sm py-2">
                        {t('overrideBtn')}
                      </button>
                    )}
                  </div>
                </div>

                {overrideSuccess && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    {t('overrideSuccess')}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">
                  {lang === 'ar' ? 'المعلومات المالية' : 'Financial Information'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {detail.case.arrears_amount != null && (
                    <Metric
                      label={t('arrearsCol')}
                      value={`${t('aed')} ${detail.case.arrears_amount.toLocaleString('en-AE', { minimumFractionDigits: 0 })}`}
                    />
                  )}
                  {decision && !decision.escalate_flag && decision.approved_amount != null && (
                    <Metric
                      label={t('approvedAmount')}
                      value={`${t('aed')} ${decision.approved_amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`}
                      highlight
                    />
                  )}
                  {decision && decision.duration_months != null && (
                    <Metric label={t('duration')} value={`${decision.duration_months} ${t('months')}`} />
                  )}
                  {decision && decision.monthly_instalment != null && (
                    <Metric
                      label={t('monthlyInstalment')}
                      value={`${t('aed')} ${decision.monthly_instalment.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`}
                    />
                  )}
                </div>

                {decision && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                      {lang === 'ar' ? 'مقاييس المتأخرات الداخلية' : 'Internal Arrears Metrics'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Metric
                        label={t('outstandingPrincipal')}
                        value={decision.outstanding_principal != null ? `${t('aed')} ${decision.outstanding_principal.toLocaleString('en-AE')}` : '—'}
                      />
                      <Metric
                        label={t('unpaidInstalments')}
                        value={decision.total_unpaid_instalments != null ? `${decision.total_unpaid_instalments}` : '—'}
                      />
                      <Metric
                        label={t('remainingPeriod')}
                        value={decision.remaining_months != null ? `${decision.remaining_months} ${t('months')}` : '—'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {decision && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-4">
                      {lang === 'ar' ? 'مخرجات القرار الرسمية' : 'Official Decision Output'}
                    </h2>

                    {decision.request_type && (
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-500">{t('requestType')}</span>
                        <span className="px-2 py-0.5 bg-primary bg-opacity-10 text-primary text-xs font-semibold rounded">
                          {decision.request_type}
                        </span>
                      </div>
                    )}

                    {decision.additional_premium != null && (
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-500">{t('additionalPremium')}</span>
                        <span className="font-semibold text-gray-900">
                          {decision.request_type === 'TRANSFER_ARREARS'
                            ? (lang === 'ar' ? 'لا توجد رسوم إضافية' : 'No additional charge')
                            : `${t('aed')} ${decision.additional_premium.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
                          }
                        </span>
                      </div>
                    )}

                    {decision.proposed_deduction_rate != null && (
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-500">{t('proposedDeductionRate')}</span>
                        <span className="font-semibold text-gray-900">
                          {Math.round(decision.proposed_deduction_rate * 100)}%
                        </span>
                      </div>
                    )}

                    {decision.income_per_family_member != null && (
                      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-500">{t('incomePerMember')}</span>
                        <span className="font-semibold text-gray-900">
                          {t('aed')} {decision.income_per_family_member.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        {lang === 'ar' ? 'الامتثال للقواعد الحوكمية' : 'Governance Rule Compliance'}
                      </p>
                      <CompliancePill
                        label={t('rule1Label')}
                        compliant={decision.rule1_compliance}
                        t={t}
                      />
                      <CompliancePill
                        label={t('rule2Label')}
                        compliant={decision.rule2_compliance}
                        t={t}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-3">{t('rationale')}</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {lang === 'ar' ? decision.rationale_ar : decision.rationale_en}
                    </p>
                    {decision.rules_applied && decision.rules_applied.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-2">{t('rulesApplied')}</p>
                        <div className="flex flex-wrap gap-2">
                          {decision.rules_applied.map((r) => (
                            <span key={r} className="px-2 py-0.5 bg-surface text-primary text-xs font-mono rounded border border-gray-200">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {decision.confidence_score != null && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{t('aiConfidence')}</span>
                          <span className="font-semibold text-primary">
                            {Math.round(decision.confidence_score * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.round(decision.confidence_score * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {detail.documents.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-3">
                    {lang === 'ar' ? 'المستندات المرفوعة' : 'Uploaded Documents'}
                  </h2>
                  <ul className="space-y-2">
                    {detail.documents.map((doc, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 capitalize">
                          {doc.document_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-400">
                          {Math.round(doc.confidence * 100)}% confidence
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <CopilotPanel caseId={case_id as string} />
            </div>
          )}
        </main>
      </div>

      {showOverride && detail && (
        <OverrideModal
          caseId={case_id as string}
          currentAmount={decision?.approved_amount}
          currentDuration={decision?.duration_months}
          onClose={() => setShowOverride(false)}
          onSuccess={handleOverrideSuccess}
        />
      )}
    </>
  );
}

function CompliancePill({
  label,
  compliant,
  t,
}: {
  label: string;
  compliant: boolean | undefined | null;
  t: (k: string) => string;
}) {
  if (compliant === undefined || compliant === null) return null;
  return (
    <div className="flex items-center justify-between text-xs py-1.5">
      <span className="text-gray-600">{label}</span>
      <span
        className={`px-2 py-0.5 rounded-full font-semibold ${
          compliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {compliant ? t('compliant') : t('nonCompliant')}
      </span>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-approved bg-opacity-10' : 'bg-surface'}`}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-approved' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function ArrowLeft() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="h-24 bg-gray-200 rounded-2xl" />
      <div className="h-40 bg-gray-200 rounded-2xl" />
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}
