import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import StatusBadge from '../../components/staff/StatusBadge';
import { useLang } from '../../lib/LanguageContext';
import { listCases } from '../../lib/api';
import type { CaseListItem } from '../../lib/types';

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatCaseRef(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200/65 shadow-sm p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-100 rounded-lg" />
              <div className="h-3 w-48 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-7 w-24 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ t }: { t: (k: string) => string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/65 shadow-sm py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F4F2EB] flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-[#8E702E]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      </div>
      <p className="text-gray-700 font-semibold text-base mb-1">{t('noApplicationsYet')}</p>
      <p className="text-gray-400 text-sm mb-6">
        {t('submitNewRequest') === 'Submit New Request'
          ? 'Submit your first rescheduling request to get started.'
          : 'قدم طلب إعادة جدولة أولاً للبدء.'}
      </p>
      <Link
        href="/citizen"
        className="inline-flex items-center gap-2 bg-[#8E702E] hover:bg-[#7A612A] text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {t('submitNewRequest')}
      </Link>
    </div>
  );
}

function ApplicationCard({ item, lang, t }: { item: CaseListItem; lang: string; t: (k: string) => string }) {
  const isRtl = lang === 'ar';

  const statusAccent: Record<string, string> = {
    pending: 'border-l-gray-300',
    processing: 'border-l-blue-400',
    approved: 'border-l-emerald-500',
    escalated: 'border-l-amber-500',
    overridden: 'border-l-purple-500',
    closed: 'border-l-gray-400',
    rejected: 'border-l-red-400',
  };
  const accentClass = statusAccent[item.status] ?? 'border-l-gray-300';

  return (
    <div className={`bg-white rounded-2xl border border-gray-200/65 shadow-sm overflow-hidden border-l-4 ${isRtl ? '' : accentClass} ${isRtl ? `border-r-4 ${accentClass.replace('border-l-', 'border-r-')} border-l-0` : ''} transition-shadow hover:shadow-md`}>
      <div className="px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Left: case meta */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#8E702E] bg-[#F4F2EB] px-2.5 py-1 rounded-lg tracking-wider">
                #{formatCaseRef(item.id)}
              </span>
              <StatusBadge status={item.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                {t('submittedOn')} {formatDate(item.created_at, lang)}
              </span>
              {item.arrears_amount != null && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                  </svg>
                  {t('aed')} {item.arrears_amount.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Right: action */}
          <Link
            href={`/citizen/decision/${item.id}`}
            className="inline-flex items-center gap-2 bg-[#F4F2EB] hover:bg-[#E8E4D8] text-[#8E702E] font-bold text-xs py-2.5 px-4 rounded-xl transition-colors border border-[#8E702E]/15 whitespace-nowrap flex-shrink-0"
          >
            {t('viewDecision')}
            <svg className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyApplicationsPage() {
  const { t, lang, isRtl } = useLang();
  const router = useRouter();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const emiratesId = sessionStorage.getItem('uae_pass_emirates_id');
    if (!emiratesId) {
      router.replace('/citizen/login');
      return;
    }
    listCases()
      .then((all) => setCases(all.filter((c) => c.emirates_id === emiratesId)))
      .catch(() => setError('Failed to load your applications. Please refresh.'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Head>
        <title>{`${t('appName')} - ${t('myApplications')}`}</title>
      </Head>
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />

        <main className="max-w-3xl mx-auto px-6 py-10 flex-1 w-full">

          {/* Page Header */}
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {lang === 'en' ? 'My Applications' : 'طلباتي'}
              </h1>
              <p className="text-sm font-semibold text-[#8E702E] mt-0.5">
                {lang === 'en' ? 'طلباتي' : 'My Applications'}
              </p>
            </div>
            <Link
              href="/citizen"
              className="inline-flex items-center gap-2 bg-[#8E702E] hover:bg-[#7A612A] text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('submitNewRequest')}
            </Link>
          </div>

          {loading && <LoadingState />}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && cases.length === 0 && <EmptyState t={t} />}

          {!loading && !error && cases.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {cases.length} {cases.length === 1
                  ? (lang === 'ar' ? 'طلب' : 'Application')
                  : (lang === 'ar' ? 'طلبات' : 'Applications')}
              </p>
              <div className="space-y-3">
                {cases.map((c) => (
                  <ApplicationCard key={c.id} item={c} lang={lang} t={t} />
                ))}
              </div>
            </>
          )}

        </main>

        <footer className="bg-gray-50 border-t border-gray-150 py-8 px-6 mt-16 text-sm text-gray-500">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#8E702E]">MOEI</span>
              <span className="text-gray-300">|</span>
              <span className="font-semibold text-[#8E702E]">تيسير</span>
              <span className="ml-2">© 2024 Ministry of Energy &amp; Infrastructure.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#8E702E] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#8E702E] transition-colors">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
