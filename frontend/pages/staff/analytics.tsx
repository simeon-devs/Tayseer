import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import StatusBadge from '../../components/staff/StatusBadge';
import { useLang } from '../../lib/LanguageContext';
import { getAnalytics } from '../../lib/api';
import type { AnalyticsSummary } from '../../lib/types';

export default function AnalyticsDashboard() {
  const { t, lang, isRtl } = useLang();
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
        <title>{`${t('appName')} - ${t('analyticsTitle')}`}</title>
      </Head>
      <div className="min-h-screen bg-slate-50/50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Top navigation header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 font-arabic-safe">
                {t('analyticsTitle')}
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {t('staffNote')}
              </p>
            </div>
            <div>
              <Link 
                href="/staff/cases" 
                className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-gold-dark group transition-colors"
              >
                <svg className="w-4 h-4 transform rotate-180 rtl:rotate-0 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t('backToCases')}
              </Link>
            </div>
          </div>

          {loading && (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">Loading analytics data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm font-semibold mb-8">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-8">
              
              {/* Average Resolution Time Card */}
              <BeforeAfterCard data={data} />

              {/* Grid of 4 Widget Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Total Cases Widget with Mini Sparkline */}
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('totalCases')}</p>
                    <p className="text-3xl font-black text-gray-900 leading-tight">{data.total_cases}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-primary">
                    <svg className="w-16 h-8 text-primary/80" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth={2.2}>
                      <path d="M0 25 Q15 5 30 18 T60 8 T90 22" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Approval Rate Widget with Circular Progress */}
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('approvalRate')}</p>
                    <p className="text-3xl font-black text-emerald-700 leading-tight">{data.approval_rate}%</p>
                  </div>
                  <div>
                    <CircularProgress percentage={data.approval_rate} colorClass="text-emerald-500" />
                  </div>
                </div>

                {/* Escalation Rate Widget with Circular Progress */}
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('escalationRate')}</p>
                    <p className="text-3xl font-black text-amber-600 leading-tight">{data.escalation_rate}%</p>
                  </div>
                  <div>
                    <CircularProgress percentage={data.escalation_rate} colorClass="text-amber-500" />
                  </div>
                </div>

                {/* Override Rate Widget with Circular Progress */}
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('overrideRate')}</p>
                    <p className="text-3xl font-black text-purple-600 leading-tight">{data.override_rate}%</p>
                  </div>
                  <div>
                    <CircularProgress percentage={data.override_rate} colorClass="text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Case Distribution by Status Container */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 font-arabic-safe">
                  {t('caseDistribution')}
                </h2>
                <div className="space-y-5">
                  <BarRow
                    label={t('approved')}
                    count={data.auto_approved}
                    total={data.total_cases}
                    color="bg-emerald-500"
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
  const { t, lang, isRtl } = useLang();
  const beforeDays = data.before_avg_days;
  const afterSeconds = data.after_avg_seconds;
  const beforeSeconds = beforeDays * 8 * 3600;
  const speedup = beforeSeconds > 0 ? Math.round(beforeSeconds / Math.max(afterSeconds, 1)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-gray-950 font-arabic-safe mb-1">{t('avgResolution')}</h2>
        <p className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">{t('speedupSubtitle')}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
          
          {/* Before Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border border-red-200/40 p-6 text-center shadow-inner hover:shadow transition-shadow">
            <span className="inline-block text-[10px] font-bold text-red-600/90 tracking-widest uppercase mb-3 bg-red-100/80 px-2.5 py-1 rounded-full">
              {t('beforeTayseer')}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black text-red-700 tracking-tight">{beforeDays}</span>
              <span className="text-sm font-bold text-red-600/80">{t('workingDays')}</span>
            </div>
          </div>

          {/* Speedup Metric Indicator */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center text-center p-4">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer pulsing ring */}
              <span className="absolute inline-flex h-full w-full rounded-full bg-gold/10 animate-ping opacity-75" />
              <div className="relative bg-gradient-to-r from-gold/10 to-gold/25 border border-gold/30 rounded-2xl px-6 py-4.5 shadow-sm">
                <div className="text-3xl font-black text-gold leading-none">
                  {speedup.toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-US')}×
                </div>
                <div className="text-[10px] font-bold text-gold-dark uppercase tracking-wider mt-1 whitespace-nowrap">
                  {t('resolutionSpeedup')}
                </div>
              </div>
            </div>
            
            <p className="text-xs font-bold text-gray-400 mt-3.5 leading-relaxed max-w-[180px]">
              {t('aiSpeedupLabel')}
            </p>
            
            <div className="mt-3 text-gold hidden lg:block">
              <svg className="w-8 h-8 transform rtl:rotate-180 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="mt-3 text-gold lg:hidden">
              <svg className="w-8 h-8 transform rotate-90 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* After Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/40 p-6 text-center shadow-inner hover:shadow transition-shadow">
            <span className="inline-block text-[10px] font-bold text-emerald-700/90 tracking-widest uppercase mb-3 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              {t('afterTayseer')}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black text-emerald-700 tracking-tight">
                {afterSeconds < 60
                  ? `${Math.round(afterSeconds)}`
                  : `${Math.round(afterSeconds / 60)}`}
              </span>
              <span className="text-sm font-bold text-emerald-600/80">
                {afterSeconds < 60 ? t('seconds') : 'minutes'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ percentage, colorClass }: { percentage: number; colorClass: string }) {
  const radius = 22;
  const stroke = 4.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 44 44">
        {/* Track circle */}
        <circle 
          className="text-gray-100" 
          strokeWidth={stroke} 
          stroke="currentColor" 
          fill="transparent" 
          r={normalizedRadius} 
          cx="22" 
          cy="22" 
        />
        {/* Fill circle */}
        <circle 
          className={colorClass} 
          strokeWidth={stroke} 
          strokeDasharray={circumference + ' ' + circumference} 
          style={{ strokeDashoffset }} 
          strokeLinecap="round" 
          fill="transparent" 
          r={normalizedRadius} 
          cx="22" 
          cy="22" 
        />
      </svg>
      {/* Percentage label */}
      <span className="absolute text-[10px] font-extrabold text-gray-500">{percentage}%</span>
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
  const { lang } = useLang();
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="w-28 flex-shrink-0">
        <StatusBadge status={status} />
      </div>
      <div className="flex-1 flex items-center gap-4">
        <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-gray-700 w-20 text-end whitespace-nowrap">
          {count.toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-US')} ({pct}%)
        </span>
      </div>
    </div>
  );
}
