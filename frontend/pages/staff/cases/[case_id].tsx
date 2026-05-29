import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../components/Header';
import StatusBadge from '../../../components/staff/StatusBadge';
import OverrideModal from '../../../components/staff/OverrideModal';
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
        <title>{t('appName')} - {t('staffDashboard')}</title>
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
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge status={detail.case.status} />
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
              </div>

              {decision && (
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
