import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../components/Header';
import { useLang } from '../../../lib/LanguageContext';
import { getCase, letterUrl } from '../../../lib/api';
import type { CaseDetailResponse, DecisionOutput } from '../../../lib/types';

export default function DecisionScreen() {
  const { t, lang } = useLang();
  const router = useRouter();
  const { case_id } = router.query;
  const [detail, setDetail] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!case_id || typeof case_id !== 'string') return;
    getCase(case_id)
      .then(setDetail)
      .catch(() => setError(t('loadingFailed')))
      .finally(() => setLoading(false));
  }, [case_id, t]);

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('decisionTitle')}</title>
      </Head>
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          {loading && <LoadingSkeleton />}
          {error && <ErrorCard message={error} />}
          {!loading && !error && detail && (
            <DecisionCard detail={detail} caseId={case_id as string} />
          )}
        </main>
      </div>
    </>
  );
}

type StatusVariant = 'approved' | 'rejected' | 'escalated' | 'additional_info' | 'in_progress';

function resolveVariant(caseStatus: string, decision: DecisionOutput | undefined): StatusVariant {
  if (caseStatus === 'approved' || (decision && !decision.escalate_flag)) return 'approved';
  if (caseStatus === 'rejected') return 'rejected';
  if (caseStatus === 'additional_info_required') return 'additional_info';
  if (caseStatus === 'escalated' || (decision && decision.escalate_flag)) return 'escalated';
  return 'in_progress';
}

const VARIANT_STYLES: Record<StatusVariant, { bg: string; icon: 'check' | 'x' | 'clock' | 'info' | 'hourglass' }> = {
  approved: { bg: 'bg-approved', icon: 'check' },
  rejected: { bg: 'bg-red-600', icon: 'x' },
  escalated: { bg: 'bg-escalated', icon: 'clock' },
  additional_info: { bg: 'bg-blue-600', icon: 'info' },
  in_progress: { bg: 'bg-gray-500', icon: 'hourglass' },
};

function DecisionCard({ detail, caseId }: { detail: CaseDetailResponse; caseId: string }) {
  const { t, lang } = useLang();
  const { decision, citizen } = detail;
  const variant = resolveVariant(detail.case.status, decision);
  const styles = VARIANT_STYLES[variant];

  const titleKey = {
    approved: 'approvedTitle',
    rejected: 'rejectedTitle',
    escalated: 'humanReviewTitle',
    additional_info: 'additionalInfoTitle',
    in_progress: 'inProgressTitle',
  }[variant];

  const subtitleKey = {
    approved: 'approvedSubtitle',
    rejected: 'rejectedSubtitle',
    escalated: 'humanReviewSubtitle',
    additional_info: 'additionalInfoSubtitle',
    in_progress: 'inProgressSubtitle',
  }[variant];

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl p-6 text-white ${styles.bg}`}>
        <div className="flex items-start gap-4">
          <StatusIcon type={styles.icon} />
          <div>
            <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
            <p className="opacity-90 mt-1 text-sm">{t(subtitleKey)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <InfoRow label={t('caseReference')} value={caseId.split('-')[0].toUpperCase()} mono />
        <InfoRow
          label={lang === 'ar' ? 'الاسم' : 'Name'}
          value={lang === 'ar' ? citizen.name_ar : citizen.name_en}
        />
        <InfoRow label={t('emiratesId')} value={citizen.emirates_id} mono />
      </div>

      {variant === 'approved' && decision && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">
            {lang === 'ar' ? 'تفاصيل القرار' : 'Decision Details'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <MetricCard
              label={t('approvedAmount')}
              value={`${t('aed')} ${(decision.approved_amount ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`}
              highlight
            />
            <MetricCard
              label={t('duration')}
              value={`${decision.duration_months ?? 0} ${t('months')}`}
            />
            <MetricCard
              label={t('monthlyInstalment')}
              value={`${t('aed')} ${(decision.monthly_instalment ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`}
            />
          </div>
          {decision.request_type && (
            <div className="flex items-center gap-2 text-sm text-gray-600 py-2 border-t border-gray-100">
              <span className="font-medium">{t('requestType')}:</span>
              <span className="px-2 py-0.5 bg-primary bg-opacity-10 text-primary text-xs font-semibold rounded">
                {decision.request_type === 'TRANSFER_ARREARS' ? t('transferArrears') : t('updateInstalment')}
              </span>
            </div>
          )}
          {decision.confidence_score != null && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <ConfidenceBar score={decision.confidence_score} label={t('aiConfidence')} />
            </div>
          )}
        </div>
      )}

      {variant === 'rejected' && decision && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="font-bold text-red-900 mb-3">{t('rationale')}</h2>
          <p className="text-red-800 text-sm leading-relaxed">
            {lang === 'ar' ? decision.rationale_ar : decision.rationale_en}
          </p>
        </div>
      )}

      {(variant === 'escalated' || variant === 'additional_info') && decision && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-3">{t('escalationReason')}</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {lang === 'ar' ? decision.rationale_ar : decision.rationale_en}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            {t('escalationMessage')}
          </div>
        </div>
      )}

      {decision && decision.rules_applied && decision.rules_applied.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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

      <div className="flex flex-col sm:flex-row gap-3">
        {variant === 'approved' && (
          <a
            href={letterUrl(caseId)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center"
          >
            {t('downloadLetter')}
          </a>
        )}
        <Link href="/citizen" className="btn-secondary flex-1 text-center">
          {t('newRequest')}
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? 'bg-approved bg-opacity-10' : 'bg-surface'}`}>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-approved' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function ConfidenceBar({ score, label }: { score: number; label: string }) {
  const pct = Math.round(score * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-primary">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusIcon({ type }: { type: 'check' | 'x' | 'clock' | 'info' | 'hourglass' }) {
  return (
    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
      {type === 'check' && (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {type === 'x' && (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {type === 'clock' && (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      )}
      {type === 'info' && (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      )}
      {type === 'hourglass' && (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="h-40 bg-gray-200 rounded-2xl" />
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p className="text-red-700 font-semibold mb-1">Error</p>
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}
