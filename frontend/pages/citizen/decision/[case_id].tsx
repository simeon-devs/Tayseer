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

  const isRtl = lang === 'ar';

  return (
    <>
      <Head>
        <title>{`${t('appName')} - ${t('decisionTitle')}`}</title>
      </Head>
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-10 flex-grow w-full">
          {loading && <LoadingSkeleton />}
          {error && <ErrorCard message={error} />}
          {!loading && !error && detail && (
            <DecisionCard detail={detail} caseId={case_id as string} />
          )}
        </main>
        <Footer lang={lang} />
      </div>
    </>
  );
}

type StatusVariant = 'approved' | 'rejected' | 'escalated' | 'additional_info' | 'in_progress';

function resolveVariant(caseStatus: string, decision: DecisionOutput | undefined): StatusVariant {
  if (decision && decision.final_recommendation) {
    if (decision.final_recommendation === 'Approve') return 'approved';
    if (decision.final_recommendation === 'Request_documents') return 'additional_info';
    if (decision.final_recommendation === 'Refer_to_employee') return 'escalated';
  }
  if (caseStatus === 'approved') return 'approved';
  if (caseStatus === 'rejected') return 'rejected';
  if (caseStatus === 'additional_info_required') return 'additional_info';
  if (caseStatus === 'escalated') return 'escalated';
  return 'in_progress';
}

function DecisionCard({ detail, caseId }: { detail: CaseDetailResponse; caseId: string }) {
  const { t, lang } = useLang();
  const { decision, citizen } = detail;
  const variant = resolveVariant(detail.case.status, decision);

  // Status banner configuration based on status variant
  const bannerConfig = {
    approved: {
      bg: 'bg-[#1E5E3A]', // Deep forest green
      iconBg: 'bg-green-700/30',
      title: t('approvedTitle'),
      subtitle: t('approvedSubtitle'),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    rejected: {
      bg: 'bg-[#991B1B]', // Deep red
      iconBg: 'bg-red-700/30',
      title: t('rejectedTitle'),
      subtitle: t('rejectedSubtitle'),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    escalated: {
      bg: 'bg-[#92400E]', // Deep amber
      iconBg: 'bg-amber-700/30',
      title: t('humanReviewTitle'),
      subtitle: t('humanReviewSubtitle'),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      )
    },
    additional_info: {
      bg: 'bg-[#1E40AF]', // Deep blue
      iconBg: 'bg-blue-700/30',
      title: t('additionalInfoTitle'),
      subtitle: t('additionalInfoSubtitle'),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      )
    },
    in_progress: {
      bg: 'bg-[#374151]', // Deep gray
      iconBg: 'bg-gray-700/30',
      title: t('inProgressTitle'),
      subtitle: t('inProgressSubtitle'),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }[variant];

  const isRtl = lang === 'ar';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Forest Green Alert Banner ── */}
      <div className={`rounded-2xl p-6 text-white ${bannerConfig.bg} shadow-sm border border-black/10`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 ${bannerConfig.iconBg} rounded-full flex items-center justify-center flex-shrink-0 shadow-inner`}>
            {bannerConfig.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{bannerConfig.title}</h1>
            <p className="opacity-90 mt-1 text-sm font-medium">{bannerConfig.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ── Two Column Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left Column: Citizen Info & Governance Rules ── */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Citizen Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              {lang === 'ar' ? 'معلومات المواطن' : 'CITIZEN INFORMATION'}
            </h2>
            
            <div className="divide-y divide-gray-100">
              <div className="pb-3.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('caseReference')}</p>
                <p className="text-lg font-bold text-gray-950 mt-1 font-mono">
                  {caseId ? caseId.split('-')[0].toUpperCase() : ''}
                </p>
              </div>
              
              <div className="py-3.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{lang === 'ar' ? 'الاسم' : 'Name'}</p>
                <p className="text-lg font-bold text-gray-950 mt-1">
                  {lang === 'ar' ? citizen.name_ar : citizen.name_en}
                </p>
              </div>
              
              <div className="pt-3.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('emiratesId')}</p>
                <p className="text-lg font-bold text-gray-950 mt-1 font-mono">{citizen.emirates_id}</p>
              </div>
            </div>
          </div>

          {/* Governance Rules Applied Card */}
          {decision && decision.rules_applied && decision.rules_applied.length > 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm p-6">
              <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-4">
                {t('rulesApplied')}
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {decision.rules_applied.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] text-[#8E702E] text-xs font-semibold rounded-lg border border-[#E5DFD3]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Decision Details ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            
            {/* Decision Title with Icon */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">
                {lang === 'ar' ? 'تفاصيل القرار' : 'Decision Details'}
              </h2>
            </div>

            {/* Content body based on decision state */}
            {variant === 'approved' && decision ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Approved Amount */}
                <div className="bg-green-50/60 border border-green-100 rounded-xl p-5 text-left rtl:text-right">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t('approvedAmount')}
                  </p>
                  <p className="text-2xl font-black text-green-700 mt-2">
                    {t('aed')} {(decision.approved_amount ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Repayment Duration */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-left rtl:text-right">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t('duration')}
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {decision.duration_months ?? 0} {t('months')}
                  </p>
                </div>

                {/* Monthly Instalment */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-left rtl:text-right">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t('monthlyInstalment')}
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {t('aed')} {(decision.monthly_instalment ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </p>
                </div>

              </div>
            ) : variant === 'rejected' && decision ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <h3 className="font-bold text-red-900 mb-2">{t('rationale')}</h3>
                <p className="text-red-800 text-sm leading-relaxed">
                  {lang === 'ar' ? decision.rationale_ar : decision.rationale_en}
                </p>
              </div>
            ) : (variant === 'escalated' || variant === 'additional_info') && decision ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{t('escalationReason')}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {lang === 'ar' ? decision.rationale_ar : decision.rationale_en}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-[#92400E] font-medium leading-relaxed">
                  {t('escalationMessage')}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                {t('noDecision')}
              </div>
            )}

            {/* AI Decision Confidence Section */}
            {variant === 'approved' && decision && decision.confidence_score != null && (
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {t('aiConfidence')}
                  </div>
                  <span className="text-lg font-bold text-[#8E702E]">
                    {Math.round(decision.confidence_score * 100)}%
                  </span>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="h-3.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8E702E] rounded-full transition-all duration-500 shadow-inner"
                    style={{ width: `${Math.round(decision.confidence_score * 100)}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-400 font-medium leading-normal">
                  {lang === 'ar' 
                    ? 'قام النظام بتحليل بيانات الحالة بناءً على الدخل المعتمد والالتزام التاريخي.' 
                    : 'System analyzed case data based on verified income and historical compliance.'}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
        {variant === 'approved' && (
          <a
            href={letterUrl(caseId)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold min-w-[240px] shadow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('downloadLetter')}
          </a>
        )}
        <Link
          href="/citizen"
          className="btn-gold-secondary flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold min-w-[240px] border border-[#8E702E] text-[#8E702E] bg-white hover:bg-[#FAF9F6]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('newRequest')}
        </Link>
      </div>

    </div>
  );
}

function Footer({ lang }: { lang: 'en' | 'ar' }) {
  const isRtl = lang === 'ar';
  return (
    <footer className="bg-white border-t border-gray-150 py-8 px-6 mt-12 w-full">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className={`flex flex-col items-center md:items-start gap-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="font-bold text-gray-700">Tayseer | تيسير</span>
          <span>{lang === 'ar' ? '© ٢٠٢٤ تيسير لإعادة جدولة الديون الإسكانية. جميع الحقوق محفوظة.' : '© 2024 Tayseer Housing Debt Rescheduling. All rights reserved.'}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-gold transition-colors">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
          <a href="#" className="hover:text-gold transition-colors">{lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</a>
          <a href="#" className="hover:text-gold transition-colors">{lang === 'ar' ? 'اتصل بالدعم' : 'Contact Support'}</a>
        </div>
      </div>
    </footer>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 h-64 bg-gray-200 rounded-2xl" />
        <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
      <p className="text-red-700 font-bold mb-1">Error</p>
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}
