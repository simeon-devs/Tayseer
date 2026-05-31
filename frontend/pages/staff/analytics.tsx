import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import StatusBadge from '../../components/staff/StatusBadge';
import { useLang } from '../../lib/LanguageContext';
import { getAnalytics } from '../../lib/api';
import type { AnalyticsSummary } from '../../lib/types';

const STATUS_BAR_COLORS: Record<string, string> = {
  auto_approved: 'bg-green-500',
  escalated: 'bg-amber-500',
  overridden: 'bg-purple-500',
};

export default function AnalyticsDashboard() {
  const { t } = useLang();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setError(t('submissionFailed')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('analyticsTitle')}</title>
      </Head>
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('analyticsTitle')}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{t('staffNote')}</p>
            </div>
            <Link href="/staff/cases" className="text-sm text-primary font-semibold hover:underline">
              {t('backToCases')}
            </Link>
          </div>

          {loading && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-6">
              <BeforeAfterCard data={data} />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SummaryCard label={t('totalCases')} value={data.total_cases} />
                <SummaryCard
                  label={t('approvalRate')}
                  value={`${data.approval_rate}%`}
                  color="text-approved"
                />
                <SummaryCard
                  label={t('escalationRate')}
                  value={`${data.escalation_rate}%`}
                  color="text-escalated"
                />
                <SummaryCard
                  label={t('overrideRate')}
                  value={`${data.override_rate}%`}
                  color="text-purple-600"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5">{t('caseDistribution')}</h2>
                <div className="space-y-4">
                  <BarRow
                    label={t('approved')}
                    count={data.auto_approved}
                    total={data.total_cases}
                    color="bg-approved"
                    status="approved"
                  />
                  <BarRow
                    label={t('escalated')}
                    count={data.escalated}
                    total={data.total_cases}
                    color="bg-amber-500"
                    status="escalated"
                  />
                  <BarRow
                    label={t('overridden')}
                    count={data.overridden}
                    total={data.total_cases}
                    color="bg-purple-500"
                    status="overridden"
                  />
                  <BarRow
                    label={t('pending')}
                    count={Math.max(0, data.total_cases - data.auto_approved - data.escalated - data.overridden)}
                    total={data.total_cases}
                    color="bg-gray-400"
                    status="pending"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function BeforeAfterCard({ data }: { data: AnalyticsSummary }) {
  const { t } = useLang();
  const beforeDays = data.before_avg_days;
  const afterSeconds = data.after_avg_seconds;
  const beforeSeconds = beforeDays * 8 * 3600;
  const speedup = beforeSeconds > 0 ? Math.round(beforeSeconds / Math.max(afterSeconds, 1)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-5">{t('avgResolution')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
          <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">{t('beforeTayseer')}</p>
          <p className="text-4xl font-black text-red-700">{beforeDays}</p>
          <p className="text-sm text-red-600 mt-1">{t('workingDays')}</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="text-4xl text-accent font-black">{speedup}×</div>
          <p className="text-xs text-gray-500 mt-1">{t('aiSpeedupLabel')}</p>
          <svg className="w-8 h-8 text-accent mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
          <p className="text-xs font-semibold text-approved mb-2 uppercase tracking-wide">{t('afterTayseer')}</p>
          <p className="text-4xl font-black text-approved">
            {afterSeconds < 60
              ? `${Math.round(afterSeconds)}`
              : `${Math.round(afterSeconds / 60)}`}
          </p>
          <p className="text-sm text-approved mt-1">
            {afterSeconds < 60 ? t('seconds') : 'minutes'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color = 'text-primary',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  color,
  status,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  status: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 flex-shrink-0">
        <StatusBadge status={status} />
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 w-16 text-end">
          {count} ({pct}%)
        </span>
      </div>
    </div>
  );
}
