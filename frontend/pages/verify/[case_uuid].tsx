import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import { useLang } from '../../lib/LanguageContext';
import { verifyCase } from '../../lib/api';
import type { VerificationResponse } from '../../lib/types';

export default function VerifyPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const { case_uuid } = router.query;
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!case_uuid || typeof case_uuid !== 'string') return;
    verifyCase(case_uuid)
      .then(setData)
      .catch(() => setError(t('loadingFailed')))
      .finally(() => setLoading(false));
  }, [case_uuid, t]);

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('verifyTitle')}</title>
      </Head>
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-12">
          {loading && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-approved bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-approved" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-approved bg-opacity-10 text-approved rounded-full text-sm font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-approved" />
                  {t('verifiedLabel')}
                </span>
                <h1 className="text-2xl font-black text-gray-900 mb-2">{t('verifyTitle')}</h1>
                <p className="text-sm text-gray-600">
                  {lang === 'ar' ? data.message_ar : data.message_en}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                <InfoRow label={t('verifyCaseRef')} value={data.case_reference} mono />
                <InfoRow label={t('verifyCitizenName')} value={data.citizen_name_en} />
                <InfoRow label={t('verifyDecisionDate')} value={data.decision_date} />
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1">{t('verifyDecisionSummary')}</p>
                  <p className="text-sm text-gray-800 font-medium">{data.decision_summary}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Tayseer AI &bull; Sovereign UAE Infrastructure
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
